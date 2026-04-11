import { Link } from 'react-router-dom'
import { Shield, Link2, Mail, BookOpen, HelpCircle, BarChart2, ChevronRight, Lock, AlertTriangle, Eye } from 'lucide-react'

const features = [
  { icon: Link2,      color: 'bg-blue-100 text-cyber-600',  title: 'URL Analyzer',    desc: 'Analyse any URL for phishing indicators like IP addresses, suspicious domains & more.', to: '/url-analyzer' },
  { icon: Mail,       color: 'bg-purple-100 text-purple-600', title: 'Email Analyzer', desc: 'Paste email content to detect urgency language, scam patterns & credential harvesting.', to: '/email-analyzer' },
  { icon: BookOpen,   color: 'bg-emerald-100 text-emerald-600', title: 'Awareness Hub',  desc: 'Learn about phishing tactics, see real vs fake examples and best practices.', to: '/awareness' },
  { icon: HelpCircle, color: 'bg-amber-100 text-amber-600',  title: 'Quiz',            desc: 'Test your phishing detection skills with our interactive quiz and earn your score.', to: '/quiz' },
  { icon: BarChart2,  color: 'bg-red-100 text-red-600',      title: 'Dashboard',       desc: 'View aggregate scan statistics and risk-level distribution with live charts.', to: '/dashboard' },
]

const stats = [
  { value: '3.4B', label: 'Phishing emails sent daily' },
  { value: '36%',  label: 'Breaches involve phishing' },
  { value: '$17K', label: 'Avg. cost/minute of downtime' },
  { value: '94%',  label: 'Malware delivered via email' },
]

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 text-white py-24 px-4 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyber-600/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyber-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-cyber-600/20 border border-cyber-500/30
                          text-cyber-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Shield size={14} />
            Educational Phishing Detection Platform
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold mb-6 leading-tight">
            Detect Phishing Threats <br />
            <span className="text-gradient">Before They Reach You</span>
          </h1>
          <p className="text-blue-200 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            PhishGuard analyses URLs and emails in real-time using heuristic rules, helping you
            understand and identify phishing attacks — completely free and private.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/url-analyzer" id="hero-url-btn" className="btn-primary text-base px-8 py-4">
              <Link2 size={18} /> Analyse a URL
            </Link>
            <Link to="/email-analyzer" id="hero-email-btn" className="btn-secondary border-blue-300 text-blue-200 hover:bg-blue-600/20 hover:text-white text-base px-8 py-4">
              <Mail size={18} /> Check an Email
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-cyber-600 py-6">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map(s => (
            <div key={s.label}>
              <p className="text-white text-2xl font-black">{s.value}</p>
              <p className="text-blue-100 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto text-center mb-12">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Three simple steps to stay protected</p>
        </div>
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            { step: '01', icon: Eye,           title: 'Input Content',    desc: 'Paste a suspect URL or email message into the analyser.' },
            { step: '02', icon: Shield,        title: 'Heuristic Scan',   desc: 'Our engine checks 9+ rules including IP detection, keywords & more.' },
            { step: '03', icon: AlertTriangle, title: 'Get Explanation',  desc: 'See a risk score, triggered rules, and plain-English explanations.' },
          ].map(s => (
            <div key={s.step} className="card text-center hover:shadow-lg transition-shadow">
              <div className="text-5xl font-black text-cyber-100 mb-4">{s.step}</div>
              <div className="w-12 h-12 rounded-xl bg-cyber-50 border border-cyber-100 flex items-center justify-center mx-auto mb-4">
                <s.icon size={22} className="text-cyber-600" />
              </div>
              <h3 className="font-bold text-navy-900 mb-2">{s.title}</h3>
              <p className="text-sm text-gray-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature cards */}
      <section className="py-16 px-4 bg-cyber-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title">Everything You Need</h2>
            <p className="section-subtitle">A complete cybersecurity awareness toolkit</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(f => (
              <Link key={f.to} to={f.to}
                className="card group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <div className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center mb-4`}>
                  <f.icon size={22} />
                </div>
                <h3 className="font-bold text-navy-900 mb-2 group-hover:text-cyber-600 transition-colors">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">{f.desc}</p>
                <span className="inline-flex items-center gap-1 text-cyber-600 text-sm font-semibold
                                 group-hover:gap-2 transition-all">
                  Explore <ChevronRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy-900 py-16 px-4 text-center">
        <Lock size={40} className="text-cyber-400 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-white mb-3">Start Protecting Yourself Today</h2>
        <p className="text-blue-200 mb-8 max-w-xl mx-auto">
          No sign-up. No data stored. Purely educational and 100% private.
        </p>
        <Link to="/quiz" id="cta-quiz-btn" className="btn-primary inline-flex mx-auto px-10 py-4 text-base">
          <HelpCircle size={18} /> Take the Phishing Quiz
        </Link>
      </section>
    </div>
  )
}
