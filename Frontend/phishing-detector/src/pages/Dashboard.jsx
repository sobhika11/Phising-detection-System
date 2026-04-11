import { useEffect, useState } from 'react'
import { BarChart2, ShieldX, ShieldAlert, ShieldCheck, Link2, Mail, Clock, Trash2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const COLORS = { low: '#10b981', medium: '#f59e0b', high: '#ef4444' }

function riskLabel(r) {
  return r === 'high' ? 'High' : r === 'medium' ? 'Medium' : 'Low'
}

function timeAgo(ts) {
  const sec = Math.floor((Date.now() - ts) / 1000)
  if (sec < 60) return `${sec}s ago`
  if (sec < 3600) return `${Math.floor(sec/60)}m ago`
  return `${Math.floor(sec/3600)}h ago`
}

export default function Dashboard() {
  const [history, setHistory] = useState([])

  useEffect(() => {
    const raw = JSON.parse(localStorage.getItem('scanHistory') || '[]')
    setHistory(raw)
  }, [])

  function clearHistory() {
    localStorage.removeItem('scanHistory')
    setHistory([])
  }

  // Stats
  const total  = history.length
  const high   = history.filter(h => h.risk === 'high').length
  const medium = history.filter(h => h.risk === 'medium').length
  const low    = history.filter(h => h.risk === 'low').length
  const urlScans   = history.filter(h => h.type === 'url').length
  const emailScans = history.filter(h => h.type === 'email').length
  const avgScore   = total ? Math.round(history.reduce((s,h) => s+h.score, 0) / total) : 0

  // Chart data
  const pieData = [
    { name: 'Low',    value: low,    color: COLORS.low },
    { name: 'Medium', value: medium, color: COLORS.medium },
    { name: 'High',   value: high,   color: COLORS.high },
  ].filter(d => d.value > 0)

  const barData = history.slice(0, 10).reverse().map((h, i) => ({
    name: `#${i+1}`,
    score: h.score,
    fill: COLORS[h.risk] || COLORS.low,
  }))

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-12 h-12 rounded-2xl bg-navy-900 flex items-center justify-center">
                <BarChart2 size={22} className="text-cyber-400" />
              </div>
              <h1 className="text-3xl font-extrabold text-navy-900">Dashboard</h1>
            </div>
            <p className="text-gray-500 ml-15">Your phishing scan history and statistics</p>
          </div>
          {history.length > 0 && (
            <button id="clear-history-btn" onClick={clearHistory}
              className="flex items-center gap-2 text-red-500 hover:text-red-700 text-sm font-medium border border-red-200
                         hover:border-red-400 px-4 py-2 rounded-xl transition-colors">
              <Trash2 size={14} /> Clear History
            </button>
          )}
        </div>

        {total === 0 ? (
          <div className="card text-center py-16">
            <BarChart2 size={48} className="text-gray-200 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-400 mb-2">No Scans Yet</h2>
            <p className="text-gray-400 text-sm">Run a URL or Email analysis to see your stats here.</p>
          </div>
        ) : (
          <>
            {/* KPI cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Scans',   value: total,    icon: BarChart2,    color: 'text-cyber-600',  bg: 'bg-cyber-50' },
                { label: 'High Risk',     value: high,     icon: ShieldX,      color: 'text-red-600',    bg: 'bg-red-50'   },
                { label: 'Medium Risk',   value: medium,   icon: ShieldAlert,  color: 'text-amber-600',  bg: 'bg-amber-50' },
                { label: 'Low Risk',      value: low,      icon: ShieldCheck,  color: 'text-emerald-600',bg: 'bg-emerald-50'},
              ].map(kpi => (
                <div key={kpi.label} className={`rounded-2xl border p-5 ${kpi.bg}`}>
                  <kpi.icon size={20} className={`${kpi.color} mb-2`} />
                  <div className={`text-3xl font-black ${kpi.color}`}>{kpi.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{kpi.label}</div>
                </div>
              ))}
            </div>

            {/* Secondary KPIs */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: 'URL Scans',   value: urlScans,   icon: Link2 },
                { label: 'Email Scans', value: emailScans, icon: Mail },
                { label: 'Avg Score',   value: avgScore,   icon: BarChart2 },
              ].map(k => (
                <div key={k.label} className="card text-center">
                  <k.icon size={18} className="text-cyber-500 mx-auto mb-2" />
                  <div className="text-3xl font-black text-navy-900">{k.value}</div>
                  <div className="text-xs text-gray-400 mt-1">{k.label}</div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Bar chart */}
              <div className="card">
                <h3 className="font-bold text-navy-900 mb-4">Recent Scan Scores</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={barData} margin={{ top: 0, right: 0, bottom: 0, left: -10 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => [`${v} pts`, 'Score']} />
                    <Bar dataKey="score" radius={[4,4,0,0]}>
                      {barData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie chart */}
              <div className="card">
                <h3 className="font-bold text-navy-900 mb-4">Risk Distribution</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* History table */}
            <div className="card overflow-hidden p-0">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-bold text-navy-900">Scan History</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Type</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Input</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Score</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Risk</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h, i) => (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-3">
                          <span className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                            {h.type === 'url' ? <Link2 size={13}/> : <Mail size={13}/>}
                            {h.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-gray-500 max-w-xs truncate text-xs">{h.input}</td>
                        <td className="px-6 py-3 font-bold text-navy-900">{h.score}</td>
                        <td className="px-6 py-3">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full
                            ${h.risk === 'high' ? 'bg-red-100 text-red-700' :
                              h.risk === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {riskLabel(h.risk)}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-gray-400 text-xs flex items-center gap-1">
                          <Clock size={11}/> {timeAgo(h.at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
