const express = require('express');
const router  = express.Router();

const URGENCY_KEYWORDS   = ['urgent','immediately','verify','update','suspend','suspended','expire','expires','expired','confirm','action required','click here','limited time','act now','your account','unusual activity','unauthorized','security alert','reset your password','validate','blocked'];
const THREAT_KEYWORDS    = ['prize','winner','congratulations','selected','lottery','free gift','million dollars','bank transfer','inheritance','wire transfer','bitcoin','crypto','investment opportunity','double your money'];
const CREDENTIAL_KEYWORDS= ['enter your password','enter your card','provide your ssn','social security','credit card number','bank account','routing number','cvv','pin number'];
const BRANDS             = ['paypal','amazon','apple','google','microsoft','netflix','facebook','irs','bank of america','chase','wells fargo','dhl','fedex','ups'];

function analyzeEmail(text) {
  const lower    = text.toLowerCase();
  const findings = [];
  let score      = 0;

  const urgencyMatches = URGENCY_KEYWORDS.filter(k => lower.includes(k));
  if (urgencyMatches.length) {
    const w = Math.min(urgencyMatches.length * 8, 30);
    score += w;
    findings.push({ rule: 'Urgency/Pressure Language', explanation: `Keywords: ${urgencyMatches.slice(0,4).join(', ')}`, weight: w });
  }

  const threatMatches = THREAT_KEYWORDS.filter(k => lower.includes(k));
  if (threatMatches.length) {
    const w = Math.min(threatMatches.length * 10, 25);
    score += w;
    findings.push({ rule: 'Scam/Reward Language', explanation: `Keywords: ${threatMatches.slice(0,3).join(', ')}`, weight: w });
  }

  const credMatches = CREDENTIAL_KEYWORDS.filter(k => lower.includes(k));
  if (credMatches.length) {
    score += 30;
    findings.push({ rule: 'Credential Harvesting', explanation: `Asks for: ${credMatches[0]}`, weight: 30 });
  }

  const urlCount = (text.match(/https?:\/\/\S+/g) || []).length;
  if (urlCount) {
    const w = Math.min(urlCount * 5, 15);
    score += w;
    findings.push({ rule: `${urlCount} Link(s)`, explanation: 'Links detected in message.', weight: w });
  }

  const brandMatches = BRANDS.filter(b => lower.includes(b));
  if (brandMatches.length) {
    score += 15;
    findings.push({ rule: 'Brand Impersonation', explanation: `References: ${brandMatches[0]}`, weight: 15 });
  }

  if (/[!]{2,}/.test(text) || (text.match(/\b[A-Z]{4,}\b/g)||[]).length > 2) {
    score += 8;
    findings.push({ rule: 'Formatting Anomalies', explanation: 'Excessive caps or punctuation detected.', weight: 8 });
  }

  if (/(dear (customer|user|member|friend)|to whom it may concern)/i.test(text)) {
    score += 8;
    findings.push({ rule: 'Generic Greeting', explanation: 'Non-personalised greeting used.', weight: 8 });
  }

  score = Math.min(score, 100);
  const risk = score >= 60 ? 'high' : score >= 30 ? 'medium' : 'low';
  return { score, risk, findings, wordCount: text.trim().split(/\s+/).length };
}

router.post('/check', (req, res) => {
  const { text } = req.body;
  if (!text || text.trim().length < 5) return res.status(400).json({ success: false, message: 'Text is required.' });
  const result = analyzeEmail(text);
  res.json({ success: true, ...result, scannedAt: new Date().toISOString() });
});

module.exports = router;
