/**
 * Service to generate automated takedown requests and lookup abuse contacts.
 * Supports incident response workflows for high-risk URLs.
 */

// Mock abuse contacts based on common IPs/ASNs.
// In a full production upgrade, this could integrate with a WHOIS API or AbuseIPDB.
const getAbuseEmailForIp = (ip) => {
  if (!ip) return 'abuse@unknown-host.com';
  
  // Simple mock lookup based on generic patterns
  if (ip.startsWith('104.') || ip.startsWith('172.')) {
    return 'abuse@cloudflare.com';
  } else if (ip.startsWith('52.') || ip.startsWith('3.')) {
    return 'trustandsafety@amazonaws.com';
  }
  return 'abuse@hosting-provider.com';
};

const generateTakedownData = (url, ip, riskScore, findings) => {
  const isHighRisk = riskScore >= 60; // Standard threshold for high risk
  
  if (!isHighRisk) {
    return { show: false, abuseEmail: null, takedownSubject: '', takedownBody: '' };
  }

  const abuseEmail = getAbuseEmailForIp(ip);
  const date = new Date().toISOString();
  
  // Condense the findings into a readable string
  let findingsText = '';
  if (findings && Array.isArray(findings) && findings.length > 0) {
    findingsText = findings.map(f => `- ${f.rule}: ${f.explanation}`).join('\n');
  } else {
    findingsText = '- Algorithmic Classification: Malicious/Phishing Characteristics Detected';
  }

  const subject = `URGENT: Takedown Request - Phishing Content Hosted on Your Network [${ip || 'Unknown IP'}]`;
  
  const body = `To the Abuse Desk / Threat Operations Team,

We are writing to report a malicious website hosted on your infrastructure that is actively participating in phishing/fraudulent activities.

Incident Details:
------------------------------------------
Target URL: ${url}
Hosting IP: ${ip || 'Unknown'}
Detection Time: ${date}
Automated Risk Score: ${riskScore}/100 (HIGH RISK)

Detected Indicators:
${findingsText}

Reason for Report:
Our automated scanner and analyst review indicate that this site is attempting to deceive users and steal credentials or sensitive information. 

Requested Action:
We kindly request that you review the provided URL immediately and suspend the hosting account or disable the domain resolving to prevent further harm to end users.

Thank you for your prompt attention to this security matter.

Regards,
Security Operations Center
PhishGuard Detection Platform`;

  return {
    show: true,
    abuseEmail,
    takedownSubject: subject,
    takedownBody: body
  };
};

module.exports = { generateTakedownData };
