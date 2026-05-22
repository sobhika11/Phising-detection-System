import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Shield, 
  Lock, 
  Search, 
  Activity, 
  Globe, 
  Zap, 
  ChevronDown, 
  CheckCircle,
  Eye,
  Server
} from 'lucide-react'

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-blue-100 rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm shadow-sm mb-3">
      <button 
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left font-semibold text-gray-900 hover:bg-blue-50/50 transition-colors"
      >
        {q}
        <div className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`}>
          <ChevronDown className="text-blue-600" size={20} />
        </div>
      </button>
      {open && (
        <div className="px-6 pb-5 text-gray-600 leading-relaxed border-t border-blue-50 pt-4">
          {a}
        </div>
      )}
    </div>
  )
}

export default function About() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-600 selection:text-white overflow-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative bg-[#2563EB] text-white pt-32 pb-24 px-4">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-indigo-500/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-6 tracking-tight leading-tight">
            About Us
          </h1>
          <p className="text-base text-blue-100 max-w-3xl mx-auto leading-relaxed">
            We deliver intelligent phishing detection, deep infrastructure analysis, and real-time threat scoring to keep you safe in an evolving digital landscape.
          </p>
        </div>
      </section>

      {/* 2. ABOUT PLATFORM SECTION */}
      <section className="py-24 px-4 bg-white relative">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          
          <div className="relative">
            <div className="aspect-square md:aspect-[4/3] bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-[2.5rem] p-1 shadow-2xl shadow-blue-900/20">
              <div className="w-full h-full bg-slate-900 rounded-[2.3rem] overflow-hidden flex flex-col">
                {/* Mockup Topbar */}
                <div className="h-12 bg-slate-800/80 flex items-center px-6 gap-2 border-b border-slate-700">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                {/* Mockup Content */}
                <div className="p-8 flex-1 flex flex-col gap-6">
                  <div className="h-8 w-1/3 bg-slate-800 rounded-lg animate-pulse" />
                  <div className="h-32 w-full bg-blue-500/10 border border-blue-500/20 rounded-xl relative overflow-hidden">
                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                  </div>
                  <div className="flex gap-4">
                    <div className="h-24 flex-1 bg-slate-800 rounded-xl" />
                    <div className="h-24 flex-1 bg-slate-800 rounded-xl" />
                  </div>
                </div>
              </div>
            </div>
            {/* Floating Glass Element */}
            <div className="absolute -right-8 -bottom-8 bg-white/80 backdrop-blur-xl border border-white p-6 rounded-3xl shadow-xl max-w-xs hidden md:block">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Shield className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-semibold">System Status</p>
                  <p className="text-lg font-bold text-gray-900">Secure</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="text-[#2563EB] font-bold uppercase tracking-wider mb-3">About The Platform</p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-6 leading-tight">
              Detect Malicious Links Before They Attack
            </h2>
            <p className="text-base text-gray-600 mb-10 leading-relaxed">
              Our advanced engine deconstructs URLs instantly. From deep feature extraction to live infrastructure checks, we look beyond the surface to expose typosquatting, invalid SSLs, and masked domains. Using robust heuristics, we assign a reliable risk score so you can browse with confidence.
            </p>

            <div className="grid sm:grid-cols-2 gap-6">
              {[
                { icon: Search, text: "9+ Security Checks" },
                { icon: Lock, text: "Real-Time SSL Validation" },
                { icon: Globe, text: "Live DNS Analysis" },
                { icon: Activity, text: "Advanced Risk Scoring" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
                  <div className="w-10 h-10 rounded-full bg-[#2563EB] flex items-center justify-center text-white shrink-0">
                    <item.icon size={20} />
                  </div>
                  <span className="font-bold text-gray-800">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. THREAT INTELLIGENCE SECTION */}
      <section className="py-24 px-4 bg-slate-50 relative border-t border-gray-100">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          
          <div className="order-2 lg:order-1">
            <p className="text-[#2563EB] font-bold uppercase tracking-wider mb-3">Threat Intelligence</p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-6 leading-tight">
              Advanced Detection With Clear Explanations
            </h2>
            <p className="text-base text-gray-600 mb-10 leading-relaxed">
              We believe security should be transparent. Our platform provides a secure sandbox screenshot of the target website, maps the infrastructure on an interactive graph, and translates complex cybersecurity metrics into plain-English explanations.
            </p>

            <div className="space-y-1">
              <FAQItem 
                q="How does phishing detection work?" 
                a="We analyze the URL structure, check the domain against known suspicious TLDs, verify the SSL certificate, resolve the DNS live, and use heuristics to identify patterns common in phishing attacks." 
              />
              <FAQItem 
                q="What is sandbox screenshot analysis?" 
                a="Instead of you visiting a potentially dangerous site, our servers safely visit the link in an isolated environment and capture an image of the page, letting you preview it without any risk." 
              />
              <FAQItem 
                q="How is the risk score calculated?" 
                a="The score aggregates findings from over 9 checks, assigning varying weights to severe indicators like Typosquatting (mimicking a brand) or mismatched SSL certificates." 
              />
            </div>
          </div>

          <div className="order-1 lg:order-2 relative">
            <div className="aspect-square md:aspect-[4/3] bg-white rounded-[2.5rem] p-6 shadow-2xl shadow-blue-900/10 border border-gray-100">
               {/* Illustration / Dashboard Image Replacement */}
               <div className="w-full h-full rounded-[1.5rem] bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col p-6 overflow-hidden relative">
                 <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-600/10 rounded-full blur-2xl" />
                 <div className="flex justify-between items-center mb-8">
                   <div className="h-6 w-32 bg-slate-300 rounded-md" />
                   <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center">
                     <Activity className="text-[#2563EB]" />
                   </div>
                 </div>
                 <div className="space-y-4">
                   {[1,2,3].map(i => (
                     <div key={i} className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4">
                       <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center text-red-500 shrink-0">
                         <Zap size={20} />
                       </div>
                       <div className="flex-1">
                         <div className="h-4 w-1/2 bg-slate-200 rounded mb-2" />
                         <div className="h-3 w-3/4 bg-slate-100 rounded" />
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>
      
    </div>
  )
}
