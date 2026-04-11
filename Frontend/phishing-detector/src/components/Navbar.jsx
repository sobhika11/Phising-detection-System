import { Link, useLocation } from 'react-router-dom'
import { Shield, Menu, X } from 'lucide-react'
import { useState } from 'react'

const links = [
  { to: '/', label: 'Home' },
  { to: '/url-analyzer', label: 'URL Analyzer' },
  { to: '/email-analyzer', label: 'Email Analyzer' },
  { to: '/awareness', label: 'Awareness' },
  { to: '/quiz', label: 'Quiz' },
  { to: '/dashboard', label: 'Dashboard' },
]

export default function Navbar() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  return (
    <nav className="bg-navy-900 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-cyber-600 flex items-center justify-center
                            group-hover:bg-cyber-500 transition-colors">
              <Shield size={20} className="text-white" />
            </div>
            <span className="text-white text-xl font-bold tracking-tight">
              Phish<span className="text-cyber-400">Guard</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            {links.map(l => (
              <Link
                key={l.to}
                to={l.to}
                className={`nav-link text-sm pb-1 ${pathname === l.to ? 'text-white after:w-full' : ''}`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Mobile toggle */}
          <button
            id="mobile-menu-btn"
            onClick={() => setOpen(!open)}
            className="md:hidden text-white p-2"
            aria-label="Toggle menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-navy-800 border-t border-navy-700 px-4 py-3 space-y-2 animate-fade-in">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={`block py-2 text-sm font-medium transition-colors
                ${pathname === l.to ? 'text-white' : 'text-blue-200 hover:text-white'}`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
