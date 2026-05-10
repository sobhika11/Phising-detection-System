import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import URLAnalyzer from './pages/URLAnalyzer'
import EmailAnalyzer from './pages/EmailAnalyzer'
import Awareness from './pages/Awareness'
import Quiz from './pages/Quiz'
import Dashboard from './pages/Dashboard'
import GraphView from './components/GraphView'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/url-analyzer" element={<URLAnalyzer />} />
          <Route path="/email-analyzer" element={<EmailAnalyzer />} />
          <Route path="/awareness" element={<Awareness />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/api/v1/graph/network" element={<GraphView/>}/>
          {/* This is now the "Command Center" where the Graph lives */}
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}