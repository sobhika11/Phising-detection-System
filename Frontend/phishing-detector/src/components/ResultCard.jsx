import { ShieldCheck, ShieldAlert, ShieldX, AlertTriangle } from 'lucide-react'

const CONFIG = {
  low:    { label: 'Low Risk',    color: 'text-emerald-600', bg: 'bg-emerald-50',   border: 'border-emerald-200', bar: 'bg-emerald-500', Icon: ShieldCheck },
  medium: { label: 'Medium Risk', color: 'text-amber-600',   bg: 'bg-amber-50',     border: 'border-amber-200',   bar: 'bg-amber-500',   Icon: ShieldAlert },
  high:   { label: 'High Risk',   color: 'text-red-600',     bg: 'bg-red-50',       border: 'border-red-200',     bar: 'bg-red-500',     Icon: ShieldX },
}

export default function ResultCard({ score, risk, findings, extra }) {
  const cfg = CONFIG[risk] || CONFIG.low

  return (
    <div className={`rounded-2xl border-2 ${cfg.border} ${cfg.bg} p-6 animate-slide-up`}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-5">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center
                         ${cfg.bg} border-2 ${cfg.border}`}>
          <cfg.Icon size={28} className={cfg.color} />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">Risk Classification</p>
          <h2 className={`text-2xl font-bold ${cfg.color}`}>{cfg.label}</h2>
        </div>
        <div className="ml-auto text-right">
          <p className="text-sm text-gray-400">Score</p>
          <p className={`text-4xl font-black ${cfg.color}`}>{score}</p>
          <p className="text-xs text-gray-400">/ 100</p>
        </div>
      </div>

      {/* Score bar */}
      <div className="mb-5">
        <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-3 rounded-full ${cfg.bar} fill-bar`}
            style={{ '--target-width': `${score}%`, width: `${score}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>0 – Low</span>
          <span>30 – Medium</span>
          <span>60+ – High</span>
        </div>
      </div>

      {/* Extra info */}
      {extra && (
        <div className="mb-4 text-sm text-gray-600 bg-white/70 rounded-xl px-4 py-3 border border-gray-100">
          {extra}
        </div>
      )}

      {/* Findings */}
      {findings.length > 0 ? (
        <div>
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <AlertTriangle size={16} className={cfg.color} />
            {findings.length} Rule{findings.length > 1 ? 's' : ''} Triggered
          </h3>
          <ul className="space-y-3">
            {findings.map((f, i) => (
              <li key={i} className="bg-white/80 rounded-xl p-4 border border-gray-100">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="font-semibold text-gray-800 text-sm">{f.rule}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full
                    ${f.weight >= 20 ? 'bg-red-100 text-red-700' :
                      f.weight >= 10 ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                    +{f.weight} pts
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{f.explanation}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="bg-white/80 rounded-xl p-4 border border-emerald-100 text-center">
          <p className="text-emerald-600 font-semibold">No suspicious patterns detected.</p>
          <p className="text-xs text-gray-400 mt-1">This appears to be a safe input based on our heuristics.</p>
        </div>
      )}
    </div>
  )
}
