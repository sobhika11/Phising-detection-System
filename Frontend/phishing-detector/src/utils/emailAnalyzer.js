/**
 * Email / message phishing detection logic
 */
const URGENCY_KEYWORDS = [
  'urgent', 'immediately', 'verify', 'update', 'suspend', 'suspended',
  'expire', 'expires', 'expired', 'confirm', 'action required', 'click here',
  'limited time', 'act now', 'your account', 'unusual activity', 'unauthorized',
  'security alert', 'unusual sign', 'reset your password', 'validate', 'blocked'
]

const THREAT_KEYWORDS = [
  'prize', 'winner', 'congratulations', 'selected', 'lottery', 'free gift',
  'million dollars', 'bank transfer', 'inheritance', 'nigerian', 'wire transfer',
  'bitcoin', 'crypto', 'investment opportunity', 'double your money'
]

const CREDENTIAL_KEYWORDS = [
  'enter your password', 'enter your card', 'provide your ssn', 'social security',
  'credit card number', 'bank account', 'routing number', 'cvv', 'pin number',
  'mother\'s maiden name', 'date of birth'
]

function countWordFrequency(text) {
  const words = text.toLowerCase().split(/\s+/)
  const freq = {}
  words.forEach(w => { freq[w] = (freq[w] || 0) + 1 })
  return freq
}

function detectGrammarIssues(text) {
  const issues = []
  // Excessive punctuation
  if (/[!]{2,}/.test(text)) issues.push('excessive exclamation marks')
  if (/[?]{2,}/.test(text)) issues.push('multiple question marks')
  // ALL CAPS words (more than 3)
  const capsWords = text.match(/\b[A-Z]{4,}\b/g) || []
  if (capsWords.length > 2) issues.push(`${capsWords.length} all-caps words ("${capsWords.slice(0,3).join('", "')}")`)
  // Very short or very long word ratio
  const words = text.split(/\s+/)
  const avgLen = words.reduce((s, w) => s + w.length, 0) / words.length
  if (avgLen < 3 && words.length > 10) issues.push('unusually short average word length (possible garbled text)')
  return issues
}

export function analyzeEmail(text) {
  if (!text || text.trim().length < 10) {
    return { score: 0, risk: 'low', findings: [], wordCount: 0 }
  }

  const lower = text.toLowerCase()
  const findings = []
  let score = 0

  // 1. Urgency keywords
  const urgencyMatches = URGENCY_KEYWORDS.filter(k => lower.includes(k))
  if (urgencyMatches.length > 0) {
    const weight = Math.min(urgencyMatches.length * 8, 30)
    score += weight
    findings.push({
      rule: 'Urgency / Pressure Language',
      explanation: `Found ${urgencyMatches.length} urgency keyword(s): "${urgencyMatches.slice(0, 4).join('", "')}". Phishers create panic to stop you thinking clearly.`,
      weight
    })
  }

  // 2. Threat / scam keywords
  const threatMatches = THREAT_KEYWORDS.filter(k => lower.includes(k))
  if (threatMatches.length > 0) {
    const weight = Math.min(threatMatches.length * 10, 25)
    score += weight
    findings.push({
      rule: 'Scam/Reward Language',
      explanation: `Detected potential scam language: "${threatMatches.slice(0, 3).join('", "')}". Unrealistic promises are a hallmark of phishing.`,
      weight
    })
  }

  // 3. Credential harvesting language
  const credMatches = CREDENTIAL_KEYWORDS.filter(k => lower.includes(k))
  if (credMatches.length > 0) {
    score += 30
    findings.push({
      rule: 'Credential Harvesting Attempt',
      explanation: `The message asks for sensitive information: "${credMatches[0]}". Legitimate organisations never ask for this via email.`,
      weight: 30
    })
  }

  // 4. URL/link presence
  const urlCount = (text.match(/https?:\/\/\S+/g) || []).length
  if (urlCount > 0) {
    const weight = urlCount * 5
    score += Math.min(weight, 15)
    findings.push({
      rule: `${urlCount} Link(s) Detected`,
      explanation: 'Phishing emails typically contain links to fake websites. Always hover over links before clicking.',
      weight: Math.min(weight, 15)
    })
  }

  // 5. Grammar issues
  const grammarIssues = detectGrammarIssues(text)
  if (grammarIssues.length > 0) {
    score += grammarIssues.length * 5
    findings.push({
      rule: 'Grammar / Formatting Anomalies',
      explanation: `Detected: ${grammarIssues.join(', ')}. Poor grammar is common in phishing messages crafted by non-native speakers.`,
      weight: grammarIssues.length * 5
    })
  }

  // 6. Impersonation signals
  const brands = ['paypal', 'amazon', 'apple', 'google', 'microsoft', 'netflix', 'facebook', 'instagram', 'irs', 'bank of america', 'chase', 'wells fargo', 'dhl', 'fedex', 'ups']
  const brandMatches = brands.filter(b => lower.includes(b))
  if (brandMatches.length > 0) {
    score += 15
    findings.push({
      rule: 'Brand Impersonation',
      explanation: `Message references "${brandMatches[0]}". Always verify emails claiming to be from brands by checking the sender's email domain.`,
      weight: 15
    })
  }

  // 7. Generic greeting
  if (/(dear (customer|user|member|friend|sir|madam)|to whom it may concern)/i.test(text)) {
    score += 8
    findings.push({
      rule: 'Generic Greeting',
      explanation: 'Uses a non-personalised greeting like "Dear Customer". Legitimate companies address you by name.',
      weight: 8
    })
  }

  score = Math.min(score, 100)
  const risk = score >= 60 ? 'high' : score >= 30 ? 'medium' : 'low'
  const wordCount = text.trim().split(/\s+/).length

  return { score, risk, findings, wordCount }
}
