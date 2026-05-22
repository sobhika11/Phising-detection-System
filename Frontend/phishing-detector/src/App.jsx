import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import URLAnalyzer from './pages/URLAnalyzer'
import About from './pages/About'
import Awareness from './pages/Awareness'
import Dashboard from './pages/Dashboard'
import GraphView from './components/GraphView'

export default function App() {
  const location = useLocation();
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<About />} />
          <Route path="/url-analyzer" element={<URLAnalyzer />} />
          <Route path="/awareness" element={<Awareness />} />
          <Route path="/api/v1/graph/network" element={<GraphView/>}/>
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
    </div>
  )
}