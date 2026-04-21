/**
 * URL phishing detection logic (client-side heuristics)
 */
export function analyzeURL(rawUrl) {
  const findings = []
  let score = 0
  let url = rawUrl.trim()
  const hasProtocol = /^https?:\/\//i.test(url)
  const fullUrl = hasProtocol ? url : 'http://' + url

  let parsed
  try {
    parsed = new URL(fullUrl)
  } catch {
    return { score: 100, risk: 'high', findings: [{ rule: 'Invalid URL', explanation: 'The URL could not be parsed — this is suspicious.', weight: 100 }] }
  }



  const hostname = parsed.hostname
  const pathname = parsed.pathname
  const href = parsed.href

  // 1. IP-based URL
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
    score += 25
    findings.push({ rule: 'IP Address URL', explanation: 'The URL uses a raw IP address instead of a domain name. Phishers hide behind IPs to avoid detection.', weight: 25 })
  }

  // 2. No HTTPS
  if (parsed.protocol !== 'https:') {
    score += 15
    findings.push({ rule: 'No HTTPS', explanation: 'This URL uses HTTP, not HTTPS. Legitimate sites almost always encrypt traffic with HTTPS.', weight: 15 })
  }

  // 3. Long URL (> 75 chars)
  if (href.length > 75) {
    score += 10
    findings.push({ rule: 'Unusually Long URL', explanation: `The URL is ${href.length} characters long. Phishing URLs are often very long to confuse users.`, weight: 10 })
  }

  // 4. Multiple subdomains
  const subdomains = hostname.split('.').length - 2
  if (subdomains >= 3) {
    score += 15
    findings.push({ rule: 'Multiple Subdomains', explanation: `Detected ${subdomains} subdomains. Phishing pages often use deep subdomain chains to mimic trusted sites.`, weight: 15 })
  }

  // 5. @ symbol
  if (href.includes('@')) {
    score += 20
    findings.push({ rule: '@ Symbol in URL', explanation: 'An "@" in the URL can trick browsers into ignoring everything before it. This is a classic phishing trick.', weight: 20 })
  }

  // 6. Hyphens in domain
  const hyphenCount = (hostname.match(/-/g) || []).length
  if (hyphenCount >= 2) {
    score += 10
    findings.push({ rule: 'Multiple Hyphens in Domain', explanation: `The domain has ${hyphenCount} hyphens. Attackers use hyphens to create convincing-looking fake domains (e.g., paypal-secure-login.com).`, weight: 10 })
  }

  // 7. Suspicious TLD
  const suspiciousTLDs = ['.xyz', '.top', '.click', '.win', '.loan', '.gq', '.ml', '.cf', '.tk']
  if (suspiciousTLDs.some(t => hostname.endsWith(t))) {
    score += 15
    findings.push({ rule: 'Suspicious TLD', explanation: 'The domain uses a TLD commonly associated with free or malicious hosting services.', weight: 15 })
  }

  // 8. Phishing keywords in domain
  const phishKeywords = ['secure', 'account', 'update', 'login', 'signin', 'verify', 'banking', 'confirm', 'paypal', 'amazon']
  const matched = phishKeywords.filter(k => hostname.includes(k))
  if (matched.length > 0) {
    score += matched.length * 8
    findings.push({ rule: 'Phishing Keywords in Domain', explanation: `The domain contains words like "${matched.join(', ')}" that are often used to impersonate trusted services.`, weight: matched.length * 8 })
  }

  // 9. Query string suspicious params
  const params = parsed.searchParams
  let suspParams = 0
  params.forEach((v, k) => {
    if (['redirect', 'url', 'next', 'return'].includes(k.toLowerCase())) suspParams++
  })
  if (suspParams > 0) {
    score += 10
    findings.push({ rule: 'Suspicious Redirect Parameters', explanation: 'The URL contains redirect parameters commonly used in phishing to send victims to malicious pages after login.', weight: 10 })
  }

  score = Math.min(score, 100)
  const risk = score >= 60 ? 'high' : score >= 30 ? 'medium' : 'low'

  // Mock Graph AI Neighborhood Alert (Simulating Backend response)
  // In production, this data comes from the new Neo4j service.
  const isHighRiskSimulated = risk === 'high' || rawUrl.includes('192.168.1.1');
  const neighborhoodAlert = isHighRiskSimulated ? {
    ip: '192.168.1.1',
    riskyNeighborCount: 4,
    riskyNeighbors: ['paypal-secure-update.xyz', 'amaz0n-account.verify.com', 'login-apple-support.tk', '192.168.1.1/phish'],
    message: 'Warning: This URL is hosted on an IP associated with 4 known high-risk/phishing campaigns.'
  } : {
    ip: '104.18.27.44', // Generic mock safe IP
    riskyNeighborCount: 0,
    riskyNeighbors: [],
    message: 'Safe neighborhood. No high-risk domains found on this IP.'
  };

  // Mock Sanitized View (Simulating Headless Browser Backend response)
  const isAvailable = risk !== 'high';
  const sanitizedView = {
    available: isAvailable,
    imageUrl: isAvailable ? 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmMzE1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzU1NSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TW9jayBTYW5pdGl6ZWQgVmlldzwvdGV4dD48L3N2Zz4=' : null,
    error: isAvailable ? null : 'Unable to safely reach the destination or domain blocked the request.'
  };

  // Mock Incident Response Takedown Data
  const takedownBody = `To the Abuse Desk,

Incident Details:
Target URL: ${url}
Hosting IP: 192.168.1.1
Detection Time: ${new Date().toISOString()}
Risk Score: ${score}/100

Please review the provided URL immediately and suspend the hosting account.`;

  const nextSteps = {
    show: risk === 'high',
    abuseEmail: 'abuse@mock-hosting.com',
    takedownSubject: `URGENT: Takedown Request - Phishing Content [192.168.1.1]`,
    takedownBody
  };

  return { score, risk, findings, hostname, protocol: parsed.protocol, neighborhoodAlert, sanitizedView, nextSteps }
}
