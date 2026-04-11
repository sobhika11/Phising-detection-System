import { useState } from 'react'
import { Link2, Search, Trash2, Info } from 'lucide-react'
import { analyzeURL } from '../utils/urlAnalyzer'
import ResultCard from '../components/ResultCard'

const EXAMPLES = [
  'http://192.168.1.1/secure-login@paypal.com/verify',
  'https://paypal-secure-update.xyz/account/login?redirect=http://evil.com',
  'https://www.google.com',
  'http://amaz0n-account.verify.update.com/signin',
]

export default function URLAnalyzer() {
  const [url, setUrl]       = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  function handleAnalyse(e) {
    e.preventDefault()
    if (!url.trim()) return
    setLoading(true)
    setResult(null)
    setTimeout(() => {
      const r = analyzeURL(url)
      setResult(r)
      setLoading(false)
      // save to localStorage for dashboard
      const history = JSON.parse(localStorage.getItem('scanHistory') || '[]')
      history.unshift({ type: 'url', input: url.substring(0, 60), score: r.score, risk: r.risk, at: Date.now() })
      localStorage.setItem('scanHistory', JSON.stringify(history.slice(0, 50)))
    }, 700)
  }

  function loadExample(ex) {
    setUrl(ex)
    setResult(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-cyber-600 flex items-center justify-center mx-auto mb-4">
            <Link2 size={28} className="text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-navy-900 mb-2">URL Analyzer</h1>
          <p className="text-gray-500 max-w-md mx-auto">
            Paste any suspicious URL below. Our heuristic engine checks 9+ indicators in real-time.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleAnalyse} className="card mb-6">
          <label htmlFor="url-input" className="block text-sm font-semibold text-gray-700 mb-2">
            Suspicious URL
          </label>
          <div className="flex gap-3">
            <input
              id="url-input"
              type="text"
              value={url}
              onChange={e => { setUrl(e.target.value); setResult(null) }}
              placeholder="https://example.com or http://192.168.1.1/phish"
              className="input-field flex-1"
            />
            {url && (
              <button type="button" onClick={() => { setUrl(''); setResult(null) }}
                className="p-3 rounded-xl border-2 border-gray-200 hover:border-red-400
                           hover:text-red-500 transition-colors" aria-label="Clear">
                <Trash2 size={18} />
              </button>
            )}
          </div>

          {/* Examples */}
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-xs text-gray-400 flex items-center gap-1"><Info size={12}/> Try:</span>
            {EXAMPLES.map(ex => (
              <button key={ex} type="button" onClick={() => loadExample(ex)}
                className="text-xs bg-cyber-50 hover:bg-cyber-100 text-cyber-700 border border-cyber-200
                           px-2 py-1 rounded-lg transition-colors truncate max-w-[200px]">
                {ex.substring(0, 40)}…
              </button>
            ))}
          </div>

          <button id="url-submit-btn" type="submit" disabled={!url.trim() || loading}
            className="btn-primary w-full mt-4 justify-center py-4 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analysing…
              </span>
            ) : (
              <><Search size={18} /> Analyse URL</>
            )}
          </button>
        </form>

        {/* Result */}
        {result && (
          <ResultCard
            score={result.score}
            risk={result.risk}
            findings={result.findings}
            extra={
              <span>
                <strong>Domain:</strong> {result.hostname} &nbsp;|&nbsp;
                <strong>Protocol:</strong> {result.protocol}
              </span>
            }
          />
        )}

        {/* Info box */}
        <div className="mt-6 card-blue text-sm text-blue-700">
          <h3 className="font-semibold mb-2 flex items-center gap-2"><Info size={15}/> What we check</h3>
          <ul className="list-disc list-inside space-y-1 text-xs text-gray-600">
            <li>IP-based URLs (obscuring real destination)</li>
            <li>Missing HTTPS encryption</li>
            <li>Abnormally long URL length (&gt;75 chars)</li>
            <li>Multiple subdomain nesting</li>
            <li>@ symbol injection tricks</li>
            <li>Domain hyphens and suspicious TLDs</li>
            <li>Phishing keyword presence in domain</li>
            <li>Suspicious redirect query parameters</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
