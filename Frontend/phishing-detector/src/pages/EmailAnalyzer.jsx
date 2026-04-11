import { useState } from 'react'
import { Mail, Search, Trash2, Info } from 'lucide-react'
import { analyzeEmail } from '../utils/emailAnalyzer'
import ResultCard from '../components/ResultCard'

const EXAMPLES = [
  {
    label: 'Scam email',
    text: `Dear Customer,

Your PayPal account has been SUSPENDED due to unusual activity. You must verify your account IMMEDIATELY to avoid permanent suspension.

Click here to confirm your details: http://paypal-secure.xyz/verify

Please enter your password, credit card number and date of birth to restore access.

Act now — this offer expires in 24 hours!!!

Regards,
PayPal Security Team`
  },
  {
    label: 'Lottery scam',
    text: `CONGRATULATIONS!!! You have been selected as the winner of our annual lottery. You have won $1,000,000!!! To claim your prize, wire transfer a processing fee of $500 to our Bitcoin wallet immediately. Limited time offer — act now! Contact us with your bank account and routing number.`
  },
  {
    label: 'Safe email',
    text: `Hi Sarah,

Just following up on our meeting from Tuesday. I've attached the revised project proposal as discussed. Please review it at your convenience and let me know if you have any feedback.

Looking forward to hearing from you.

Best regards,
James`
  }
]

export default function EmailAnalyzer() {
  const [text, setText]     = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  function handleAnalyse(e) {
    e.preventDefault()
    if (!text.trim()) return
    setLoading(true)
    setResult(null)
    setTimeout(() => {
      const r = analyzeEmail(text)
      setResult(r)
      setLoading(false)
      // save to localStorage
      const history = JSON.parse(localStorage.getItem('scanHistory') || '[]')
      history.unshift({ type: 'email', input: text.substring(0, 60) + '…', score: r.score, risk: r.risk, at: Date.now() })
      localStorage.setItem('scanHistory', JSON.stringify(history.slice(0, 50)))
    }, 700)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-purple-600 flex items-center justify-center mx-auto mb-4">
            <Mail size={28} className="text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-navy-900 mb-2">Email / Message Analyzer</h1>
          <p className="text-gray-500 max-w-md mx-auto">
            Paste the body of a suspicious email or message. We detect urgency, scam patterns, grammar issues, and more.
          </p>
        </div>

        {/* Examples */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-xs text-gray-400 flex items-center gap-1 py-1"><Info size={12}/> Examples:</span>
          {EXAMPLES.map(ex => (
            <button key={ex.label} type="button"
              onClick={() => { setText(ex.text); setResult(null) }}
              className="text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200
                         px-3 py-1.5 rounded-lg transition-colors font-medium">
              {ex.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleAnalyse} className="card mb-6">
          <label htmlFor="email-input" className="block text-sm font-semibold text-gray-700 mb-2">
            Email / Message Content
          </label>
          <div className="relative">
            <textarea
              id="email-input"
              rows={10}
              value={text}
              onChange={e => { setText(e.target.value); setResult(null) }}
              placeholder="Paste the email or message body here…"
              className="input-field resize-none"
            />
            {text && (
              <button type="button" onClick={() => { setText(''); setResult(null) }}
                className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-red-50
                           hover:text-red-500 text-gray-400 transition-colors" aria-label="Clear">
                <Trash2 size={16} />
              </button>
            )}
          </div>
          {text && (
            <p className="text-xs text-gray-400 mt-1">{text.trim().split(/\s+/).length} words</p>
          )}

          <button id="email-submit-btn" type="submit" disabled={!text.trim() || loading}
            className="btn-primary w-full mt-4 justify-center py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: loading ? undefined : '#7c3aed' }}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analysing…
              </span>
            ) : (
              <><Search size={18} /> Analyse Message</>
            )}
          </button>
        </form>

        {/* Result */}
        {result && (
          <ResultCard
            score={result.score}
            risk={result.risk}
            findings={result.findings}
            extra={<span><strong>Word count:</strong> {result.wordCount}</span>}
          />
        )}

        {/* Info */}
        <div className="mt-6 bg-purple-50 border border-purple-100 rounded-2xl p-5 text-sm text-purple-700">
          <h3 className="font-semibold mb-2 flex items-center gap-2"><Info size={15}/> What we detect</h3>
          <ul className="list-disc list-inside space-y-1 text-xs text-gray-600">
            <li>Urgency & pressure language (verify, act now, suspended…)</li>
            <li>Scam / reward language (prize, lottery, wire transfer…)</li>
            <li>Credential harvesting attempts</li>
            <li>Embedded links and redirects</li>
            <li>Grammar and formatting anomalies</li>
            <li>Brand impersonation (PayPal, Amazon, Google…)</li>
            <li>Generic non-personalised greetings</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
