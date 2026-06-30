const express = require("express");
const router = express.Router();
const axios = require("axios");

const {
  getNeighborhoodAlert,
  detectFastFlux,
  saveHostedOnHistory,
  saveExpandedGraph,
  saveRedirectRelationship
} = require("../services/neo4jService");

const { checkGoogleSafeBrowsing } = require("../services/googleSafeBrowsingService");
const { runUrlEnrichmentPipeline } = require("../workers/urlEnrichmentWorker");
const { resolveFinalUrl } = require("../services/linkUnshortenerService");

const pythonAiUrl = process.env.PYTHON_AI_URL || "http://localhost:8000";

// Weighted detection rules
function analyzeURL(rawUrl) {
  const findings = [];
  let score = 0;
  const url = rawUrl.trim();

  const hasProtocol = /^https?:\/\//i.test(url);
  const fullUrl = hasProtocol ? url : "http://" + url;

  let parsed;
  try {
    parsed = new URL(fullUrl);
  } catch {
    return {
      score: 100,
      risk: "high",
      findings: [
        {
          rule: "Invalid URL",
          explanation: "URL could not be parsed.",
          weight: 100
        }
      ],
      hostname: "",
      protocol: ""
    };
  }

  const hostname = parsed.hostname;
  const href = parsed.href;

  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
    score += 25;
    findings.push({
      rule: "IP Address URL",
      explanation: "URL uses a raw IP address instead of a domain.",
      weight: 25
    });
  }

  if (parsed.protocol !== "https:") {
    score += 15;
    findings.push({
      rule: "No HTTPS",
      explanation: "URL uses HTTP, not HTTPS.",
      weight: 15
    });
  }

  if (href.length > 75) {
    score += 10;
    findings.push({
      rule: "Unusually Long URL",
      explanation: `URL is ${href.length} characters long.`,
      weight: 10
    });
  }

  if (hostname.split(".").length - 2 >= 3) {
    score += 15;
    findings.push({
      rule: "Multiple Subdomains",
      explanation: "Deep subdomain chain detected.",
      weight: 15
    });
  }

  if (href.includes("@")) {
    score += 20;
    findings.push({
      rule: "@ Symbol in URL",
      explanation: '"@" in URL can redirect to attacker content.',
      weight: 20
    });
  }

  const hyphens = (hostname.match(/-/g) || []).length;
  if (hyphens >= 2) {
    score += 10;
    findings.push({
      rule: "Multiple Hyphens",
      explanation: `${hyphens} hyphens in domain.`,
      weight: 10
    });
  }

  const suspiciousTLDs = [".xyz", ".top", ".click", ".win", ".loan", ".gq", ".ml", ".cf", ".tk"];
  if (suspiciousTLDs.some((tld) => hostname.endsWith(tld))) {
    score += 15;
    findings.push({
      rule: "Suspicious TLD",
      explanation: "TLD commonly associated with free/malicious hosting.",
      weight: 15
    });
  }

  const phishKeywords = [
    "secure",
    "account",
    "update",
    "login",
    "signin",
    "verify",
    "banking",
    "confirm",
    "paypal",
    "amazon"
  ];

  const matched = phishKeywords.filter((k) => hostname.includes(k));
  if (matched.length > 0) {
    const weight = Math.min(matched.length * 8, 25);
    score += weight;
    findings.push({
      rule: "Phishing Keywords",
      explanation: `Domain contains: ${matched.join(", ")}`,
      weight
    });
  }

  score = Math.min(score, 100);
  const risk = score >= 60 ? "high" : score >= 30 ? "medium" : "low";

  return {
    score,
    risk,
    findings,
    hostname,
    protocol: parsed.protocol
  };
}

function toRiskLevel(risk) {
  if (risk === "high") return "HIGH";
  if (risk === "medium") return "MEDIUM";
  return "LOW";
}

router.post("/check", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({
      success: false,
      message: "URL is required."
    });
  }

  if (!/^https?:\/\//i.test(url)) {
    return res.status(400).json({
      success: false,
      message: "Only http/https URLs are allowed."
    });
  }

  let resolvedUrlData;
  let analysisUrl;

  try {
    resolvedUrlData = await resolveFinalUrl(url);
    analysisUrl = resolvedUrlData.finalUrl || url;

    console.log("Original URL:", resolvedUrlData.originalUrl);
    console.log("Final URL:", resolvedUrlData.finalUrl);
    console.log("Redirect Chain:", resolvedUrlData.redirectChain);
  } catch (err) {
    console.error("Link unshortening failed:", err.message);

    resolvedUrlData = {
      originalUrl: url,
      finalUrl: url,
      isShortened: false,
      redirectCount: 0,
      redirectChain: [url],
      error: err.message
    };

    analysisUrl = url;
  }

  let safeResult = {
    flagged: false,
    threatTypes: [],
    source: "GOOGLE_SAFE_BROWSING"
  };

  let heuristicResult = null;
  let aiResult = null;
  let riskScore = null;
  let riskLevel = null;
  let ip = "unknown";
  let sanitizedView = {
    screenshotCaptured: false,
    screenshotPath: null,
    renderingStatus: "unavailable",
    error: "Screenshot unavailable."
  };

  try {
    safeResult = await checkGoogleSafeBrowsing(analysisUrl);
  } catch (err) {
    console.error("Google Safe Browsing error:", err.message);
  }

  heuristicResult = analyzeURL(analysisUrl);

  if (safeResult.flagged) {
    heuristicResult.score = 100;
    heuristicResult.risk = "high";
    heuristicResult.findings.push({
      rule: "Google Safe Browsing",
      explanation: "Google Safe Browsing flagged this URL as dangerous.",
      weight: 100
    });

    riskScore = 1.0;
    riskLevel = "CRITICAL";
  } else {
    try {
      const aiResponse = await axios.post(`${pythonAiUrl}/predict`, {
        url: analysisUrl
      });

      aiResult = aiResponse.data;

      if (aiResult.infrastructure?.ip) {
        ip = aiResult.infrastructure.ip;
      }

      if (aiResult.sanitizedView) {
        sanitizedView = aiResult.sanitizedView;
      }

      if (aiResult.riskScore !== null && aiResult.riskScore !== undefined) {
        const aiScore100 = Math.round(aiResult.riskScore * 100);

        heuristicResult.score = Math.min(
          100,
          Math.round((heuristicResult.score + aiScore100) / 2)
        );

        heuristicResult.risk =
          heuristicResult.score >= 60
            ? "high"
            : heuristicResult.score >= 30
              ? "medium"
              : "low";

        heuristicResult.findings.push({
          rule: "AI Risk Analysis",
          explanation: `AI model (${aiResult.modelUsed}) gave ${aiResult.verdict} verdict.`,
          weight: aiScore100
        });
      }

      riskScore = heuristicResult.score / 100;
      riskLevel = toRiskLevel(heuristicResult.risk);
    } catch (err) {
      console.error("Failed to connect to Python AI Service:", err.message);

      riskScore = heuristicResult.score / 100;
      riskLevel = toRiskLevel(heuristicResult.risk);
    }
  }

  let enrichment = null;
  let reputation = null;
  let graphSaved = false;

  try {
    const pipelineResult = await runUrlEnrichmentPipeline(analysisUrl, {
      riskScore,
      riskLevel
    });

    enrichment = pipelineResult.enrichment || null;
    reputation = pipelineResult.reputation || null;
    graphSaved = pipelineResult.graphSaved || false;

    if (enrichment?.ip) {
      ip = enrichment.ip;
    }
  } catch (err) {
    console.error("Enrichment pipeline failed:", err.message);
  }

  try {
    if (ip !== "unknown") {
      await saveHostedOnHistory(analysisUrl, ip);
    }
  } catch (err) {
    console.error("Failed to save HOSTED_ON history:", err.message);
  }

  try {
    if (aiResult) {
      const parsed = new URL(analysisUrl);

      const scanData = {
  url: {
    address: analysisUrl,
    path: parsed.pathname,
    protocol: parsed.protocol,
    riskScore,
    scannedAt: new Date().toISOString()
  },
  domain: {
    name: aiResult.infrastructure?.domain || parsed.hostname
  },
  subdomain: {
    fullName: aiResult.infrastructure?.subdomain || parsed.hostname
  },
  ip: {
    address: aiResult.infrastructure?.ip || ip
  },
  certificate: aiResult.infrastructure?.certificate?.fingerprint
    ? aiResult.infrastructure.certificate
    : {
        fingerprint: `unknown-cert-${parsed.hostname}`,
        issuer: "unknown",
        subject: parsed.hostname
      },
  registrant: aiResult.infrastructure?.registrant?.email
    ? aiResult.infrastructure.registrant
    : {
        email: `unknown-registrant-${parsed.hostname}`,
        organization: "unknown",
        country: "unknown"
      },
  riskScore,
  scannedAt: new Date().toISOString()
};

      await saveExpandedGraph(scanData);
    }
  } catch (err) {
    console.error("Failed to save expanded graph:", err.message);
  }

  let neighborhoodAlert = null;

  if (ip !== "unknown") {
    try {
      neighborhoodAlert = await getNeighborhoodAlert(ip, analysisUrl);
    } catch (err) {
      console.error("Neighborhood alert error:", err.message);
    }
  }

  let fastFluxAlert = null;

  try {
    const ffAlerts = await detectFastFlux(analysisUrl);
    fastFluxAlert = ffAlerts.length ? ffAlerts[0] : null;
  } catch (err) {
    console.error("Fast-flux detection error:", err.message);
  }

  let redirectAlert = null;

  try {
    const domainsInChain = new Set();

    resolvedUrlData.redirectChain.forEach((u) => {
      try {
        domainsInChain.add(new URL(u).hostname);
      } catch { }
    });

    const parsedOriginalUrl = new URL(resolvedUrlData.originalUrl);
    const parsedFinalUrl = new URL(resolvedUrlData.finalUrl);

    if (
      resolvedUrlData.redirectCount > 3 &&
      parsedOriginalUrl.hostname !== parsedFinalUrl.hostname &&
      (riskLevel === "HIGH" || riskLevel === "CRITICAL") &&
      domainsInChain.size > 1
    ) {
      redirectAlert = {
        type: "SUSPICIOUS_REDIRECT_CHAIN",
        severity: "HIGH",
        message: "This shortened link redirects to a high-risk external domain."
      };
    }
  } catch (err) {
    console.error("Redirect alert check failed:", err.message);
  }

  try {
    if (
      resolvedUrlData.isShortened &&
      resolvedUrlData.originalUrl !== resolvedUrlData.finalUrl
    ) {
      await saveRedirectRelationship(
        resolvedUrlData.originalUrl,
        resolvedUrlData.finalUrl,
        resolvedUrlData.redirectCount
      );
    }
  } catch (err) {
    console.error("Failed to save redirect relationship:", err.message);
  }


  return res.json({
    success: true,
    url,
    originalUrl: resolvedUrlData.originalUrl,
    finalUrl: resolvedUrlData.finalUrl,
    resolvedUrlData,

    riskScore,
    riskLevel,

    safeBrowsing: {
      flagged: safeResult.flagged || false,
      threatTypes: safeResult.threatTypes || [],
      source: safeResult.source || "GOOGLE_SAFE_BROWSING"
    },

    heuristicResult,
    aiResult,
    enrichment,
    reputation,

    ip,
    sanitizedView,

    neighborhoodAlert,
    fastFluxAlert,
    redirectAlert,
    graphSaved,

    scannedAt: new Date().toISOString()
  });

});

module.exports = router;