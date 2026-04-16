const express = require('express');
const router  = express.Router();
const axios = require('axios'); // For making HTTP requests to AI service

// Weighted detection rules
function analyzeURL(rawUrl) {
  const findings = [];
  let score = 0;
  const url = rawUrl.trim();

  const hasProtocol = /^https?:\/\//i.test(url);
  const fullUrl = hasProtocol ? url : 'http://' + url;

  let parsed;
  try { parsed = new URL(fullUrl); }
  catch {
    return { score: 100, risk: 'high', findings: [{ rule: 'Invalid URL', explanation: 'URL could not be parsed.', weight: 100 }] };
  }

  const hostname = parsed.hostname;
  const href     = parsed.href;

  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
    score += 25;
    findings.push({ rule: 'IP Address URL', explanation: 'URL uses a raw IP address instead of a domain.', weight: 25 });
  }
  if (parsed.protocol !== 'https:') {
    score += 15;
    findings.push({ rule: 'No HTTPS', explanation: 'URL uses HTTP, not HTTPS.', weight: 15 });
  }
  if (href.length > 75) {
    score += 10;
    findings.push({ rule: 'Unusually Long URL', explanation: `URL is ${href.length} characters long.`, weight: 10 });
  }
  if (hostname.split('.').length - 2 >= 3) {
    score += 15;
    findings.push({ rule: 'Multiple Subdomains', explanation: 'Deep subdomain chain detected.', weight: 15 });
  }
  if (href.includes('@')) {
    score += 20;
    findings.push({ rule: '@ Symbol in URL', explanation: '"@" in URL can redirect to attacker content.', weight: 20 });
  }
  const hyphens = (hostname.match(/-/g) || []).length;
  if (hyphens >= 2) {
    score += 10;
    findings.push({ rule: 'Multiple Hyphens', explanation: `${hyphens} hyphens in domain.`, weight: 10 });
  }
  const suspiciousTLDs = ['.xyz','.top','.click','.win','.loan','.gq','.ml','.cf','.tk'];
  if (suspiciousTLDs.some(t => hostname.endsWith(t))) {
    score += 15;
    findings.push({ rule: 'Suspicious TLD', explanation: 'TLD commonly associated with free/malicious hosting.', weight: 15 });
  }
  const phishKeywords = ['secure','account','update','login','signin','verify','banking','confirm','paypal','amazon'];
  const matched = phishKeywords.filter(k => hostname.includes(k));
  if (matched.length > 0) {
    score += Math.min(matched.length * 8, 25);
    findings.push({ rule: 'Phishing Keywords', explanation: `Domain contains: ${matched.join(', ')}`, weight: Math.min(matched.length*8, 25) });
  }

  score = Math.min(score, 100);
  const risk = score >= 60 ? 'high' : score >= 30 ? 'medium' : 'low';

  return { score, risk, findings, hostname, protocol: parsed.protocol };
}

// Graph Middleware to ask the GNN and Neo4j Service
const pythonAiUrl = process.env.PYTHON_AI_URL || 'http://localhost:8000';

router.post('/check', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ success: false, message: 'URL is required.' });
  
  // Base rule engine
  const result = analyzeURL(url);
  
  // Intercept and ask Graph AI Service
  let aiRiskScore = null;
  try {
    const aiResponse = await axios.post(`${pythonAiUrl}/api/v1/score`, {
      url: url,
      domain: result.hostname || "unknown",
      ip: "192.168.1.1" // Mocking IP extraction, would use DNS lookup
    });
    aiRiskScore = aiResponse.data.riskScore;
    
    // Combining Rule-based and Graph AI scores. 
    // GNN output is between 0 and 1, we convert to 0-100 scale.
    if (aiRiskScore !== null) {
      result.score = Math.min(100, Math.round((result.score + (aiRiskScore * 100)) / 2));
      result.risk = result.score >= 60 ? 'high' : result.score >= 30 ? 'medium' : 'low';
      result.findings.push({ 
        rule: 'GNN Risk Analysis', 
        explanation: 'Graph Neural Network detected malicious relationships matching existing threat actors.', 
        weight: Math.round(aiRiskScore * 100) 
      });
    }
  } catch (err) {
    console.error("Failed to connect to Python AI Service:", err.message);
  }

  res.json({ success: true, url, ...result, gnn_score_raw: aiRiskScore, scannedAt: new Date().toISOString() });
});

module.exports = router;