import { useState } from 'react'
import axios from 'axios'
import { Link2, Search, Trash2, Info, Download, FileText, Monitor, MonitorOff, Mail, Copy, ShieldAlert, CheckCircle } from 'lucide-react'
import ResultCard from '../components/ResultCard'

const ORCHESTRATOR_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

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
  const [error, setError]     = useState('')
  const [downloading, setDownloading] = useState(false)
  const [copyFeedback, setCopyFeedback] = useState('')

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text)
    setCopyFeedback(type)
    setTimeout(() => setCopyFeedback(''), 2000)
  }

  const handleDownload = async () => {
    if (!result) {
      alert('No analysis result to generate report.');
      return;
    }
    setDownloading(true);
    try {
      // Dynamic import to keep initial bundle size smaller
      const { generatePDFReport } = await import('../utils/pdfGenerator');
      generatePDFReport({ ...result, url });
    } catch (err) {
      console.error("Failed to generate PDF Report:", err);
      alert("Failed to generate the report. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  async function handleAnalyse(e) {
    e.preventDefault()
    if (!url.trim()) return
    setLoading(true)
    setResult(null)
    setError('')
    
    try {
      // Connect specifically to Orchestrator API
      const res = await axios.post(`${ORCHESTRATOR_URL}/api/v1/scan`, { url });
      
      // We map the features into the UI's expected 'findings' array dynamically
      const formattedFindings = [];
      if(!res.data.features?.isHttps) formattedFindings.push({ rule: 'No HTTPS', explanation: 'No secure connection.', weight: 15 });
      if(res.data.features?.typosquatting) formattedFindings.push({ rule: 'Typosquatting Detected', explanation: 'Domain strongly resembles a known brand.', weight: 25 });
      if(res.data.features?.suspiciousTLD) formattedFindings.push({ rule: 'Suspicious TLD', explanation: 'Domain uses a free/spam TLD.', weight: 20 });
      if(res.data.features?.entropy > 4) formattedFindings.push({ rule: 'High Entropy', explanation: 'Random string generated domain.', weight: 15 });
      
      setResult({
         ...res.data,
         findings: formattedFindings,
         hostname: res.data.infrastructure?.domain || "Unknown Domain",
         protocol: res.data.features?.isHttps ? "https:" : "http:",
         score: res.data.riskScore, // Map back correctly to UI expectations
         risk: res.data.risk
      });
    } catch (err) {
      console.error(err);
      setError('Analysis failed. The Orchestrator or AI backend may be offline.');
    } finally {
      setLoading(false);
    }
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
                Analysing via AI Backend…
              </span>
            ) : (
              <><Search size={18} /> Analyse URL</>
            )}
          </button>
        </form>

        {error && (
          <div className="bg-red-50 text-red-600 border border-red-200 p-4 rounded-xl mb-6 flex items-center gap-2">
            <ShieldAlert size={20} />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* Result: SOC Analyst Console Layout */}
        {result && (
          <div className="mt-8 mb-6">
            <h2 className="text-xl font-bold text-navy-900 mb-4 px-2 border-l-4 border-navy-900">Analyst Scan Results</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Left Column: Diagnostics & Network */}
              <div className="space-y-6">
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
                
                {/* Neighborhood Alert */}
                {result.neighborhoodAlert && (
                  <div className={`rounded-xl p-5 border-2 animate-slide-up ${
                    result.neighborhoodAlert.riskyNeighborCount > 0
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-emerald-50 border-emerald-100'
                  }`}>
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-full ${
                        result.neighborhoodAlert.riskyNeighborCount > 0
                          ? 'bg-amber-100 text-amber-600'
                          : 'bg-emerald-100 text-emerald-600'
                      }`}>
                        {result.neighborhoodAlert.riskyNeighborCount > 0 ? (
                          <Search size={24} className="animate-pulse" />
                        ) : (
                          <Info size={24} />
                        )}
                      </div>
                      <div>
                        <h3 className={`font-bold text-lg mb-1 ${
                          result.neighborhoodAlert.riskyNeighborCount > 0 ? 'text-amber-800' : 'text-emerald-800'
                        }`}>
                          Graph Analysis: Hosting IP Neighborhood
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          {result.neighborhoodAlert.message}
                        </p>
                        <div className="text-sm">
                          <span className="font-semibold text-gray-700">Hosting IP:</span> <span className="font-mono bg-white px-2 py-1 rounded shadow-sm flex-1 ml-2">{result.neighborhoodAlert.ip}</span>
                        </div>
                        {result.neighborhoodAlert.riskyNeighborCount > 0 && (
                          <div className="mt-4">
                            <p className="text-sm font-semibold text-gray-700 mb-2">Suspicious Neighbors ({result.neighborhoodAlert.riskyNeighborCount}):</p>
                            <ul className="flex flex-wrap gap-2">
                              {result.neighborhoodAlert.riskyNeighbors.map((n, idx) => (
                                <li key={idx} className="text-xs bg-white text-red-600 px-3 py-1.5 rounded-lg border border-red-100 shadow-sm font-mono break-all">
                                  {n}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Visuals & Remediation */}
              <div className="space-y-6">
                
                {/* Sanitized View */}
                {result.sanitizedView && (
                  <div className="rounded-xl p-5 border-2 border-slate-200 bg-white animate-slide-up h-fit">
                    <h3 className="font-bold text-lg text-slate-800 mb-2 flex items-center gap-2">
                      <Monitor size={20} className="text-slate-600" />
                      Sanitized View
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      A safe, headless screenshot of the destination. No direct connection was made from your browser.
                    </p>
                    {result.sanitizedView.available && result.sanitizedView.imageUrl ? (
                      <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm relative group bg-slate-50">
                        <img 
                          src={result.sanitizedView.imageUrl} 
                          alt="Sanitized preview" 
                          className="w-full object-cover max-h-64" 
                        />
                        <div className="absolute inset-0 bg-black/5 pointer-events-none" />
                      </div>
                    ) : (
                      <div className="bg-slate-50 rounded-xl border border-slate-200 p-8 text-center text-slate-500 flex flex-col items-center justify-center min-h-[250px]">
                        <MonitorOff size={32} className="mb-3 text-slate-400" />
                        <p className="font-semibold text-slate-700">{result.sanitizedView.error || "Preview unavailable"}</p>
                        <p className="text-xs mt-1">The host was unreachable, timed out, or blocked programmatic access.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Analyst Incident Response: Next Steps */}
                {result.nextSteps && result.nextSteps.show && (
                  <div className="rounded-xl p-5 border-2 border-red-200 bg-white animate-slide-up">
                    <h3 className="font-bold text-lg text-red-700 mb-2 flex items-center gap-2">
                      <ShieldAlert size={20} className="text-red-600" />
                      Incident Response workflow
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      This URL has been classified as high risk. Use the automated details below to submit a formal takedown request to the hosting provider.
                    </p>
                    
                    <div className="bg-red-50 rounded-xl p-4 border border-red-100 mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-sm text-red-900">Hosting Provider Abuse Desk</span>
                        <button 
                          onClick={() => handleCopy(result.nextSteps.abuseEmail, 'email')}
                          className="text-xs flex items-center gap-1 bg-white hover:bg-gray-50 border border-gray-200 px-3 py-1.5 rounded shadow-sm text-gray-700 transition"
                        >
                          {copyFeedback === 'email' ? <CheckCircle size={14} className="text-emerald-500"/> : <Copy size={14}/>}
                          {copyFeedback === 'email' ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <div className="bg-white border border-gray-200 rounded px-3 py-2 text-sm font-mono text-gray-700 flex items-center gap-2 break-all">
                        <Mail size={16} className="text-gray-400 min-w-max" />
                        {result.nextSteps.abuseEmail}
                      </div>
                    </div>

                    <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-2">
                        <span className="font-semibold text-sm text-red-900">Generated Takedown Template</span>
                        <button 
                          onClick={() => handleCopy(`${result.nextSteps.takedownSubject}\n\n${result.nextSteps.takedownBody}`, 'body')}
                          className="text-xs flex items-center gap-1 bg-white hover:bg-gray-50 border border-gray-200 px-3 py-1.5 rounded shadow-sm text-gray-700 transition w-fit"
                        >
                          {copyFeedback === 'body' ? <CheckCircle size={14} className="text-emerald-500"/> : <Copy size={14}/>}
                          {copyFeedback === 'body' ? 'Copied' : 'Copy Template'}
                        </button>
                      </div>
                      <div className="bg-white border border-gray-200 rounded p-4 text-xs font-mono text-gray-600 whitespace-pre-wrap max-h-48 overflow-y-auto w-full">
                        <strong className="block mb-2 text-gray-800">Subject: {result.nextSteps.takedownSubject}</strong>
                        {result.nextSteps.takedownBody}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Download Report Button */}
            <div className="flex justify-end mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center gap-2 px-6 py-3 bg-navy-900 hover:bg-navy-800 text-white font-semibold rounded-xl transition-all disabled:opacity-75 focus:ring-4 focus:ring-navy-900/20"
              >
                {downloading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <FileText size={18} />
                    Download Threat Report
                  </>
                )}
              </button>
            </div>
          </div>
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
