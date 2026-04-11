import { Shield, Github, Twitter } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-navy-900 text-blue-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shield size={20} className="text-cyber-400" />
              <span className="text-white font-bold text-lg">
                Phish<span className="text-cyber-400">Guard</span>
              </span>
            </div>
            <p className="text-sm text-blue-300 leading-relaxed">
              An educational platform helping users detect and understand phishing threats.
              Stay safe, stay informed.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-white font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {[
                { to: '/url-analyzer', label: 'URL Analyzer' },
                { to: '/email-analyzer', label: 'Email Analyzer' },
                { to: '/awareness', label: 'Awareness Hub' },
                { to: '/quiz', label: 'Phishing Quiz' },
              ].map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Disclaimer */}
          <div>
            <h3 className="text-white font-semibold mb-3">Disclaimer</h3>
            <p className="text-sm text-blue-300 leading-relaxed">
              PhishGuard is purely educational. No user data or credentials are collected or stored.
              Results are heuristic-based and should not replace professional security audits.
            </p>
          </div>
        </div>

        <div className="border-t border-navy-700 mt-8 pt-6 flex flex-col sm:flex-row
                        items-center justify-between gap-4">
          <p className="text-xs text-blue-400">
            © {new Date().getFullYear()} PhishGuard · For educational purposes only
          </p>
          <div className="flex gap-4">
            <a href="#" aria-label="GitHub" className="hover:text-white transition-colors"><Github size={18} /></a>
            <a href="#" aria-label="Twitter" className="hover:text-white transition-colors"><Twitter size={18} /></a>
          </div>
        </div>
      </div>
    </footer>
  )
}
