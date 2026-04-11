import { BookOpen, ShieldCheck, AlertTriangle, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

const TIPS = [
  { title: 'Check the sender\'s email address', desc: 'Phishers often use domains that look similar to real ones (e.g., support@paypa1.com instead of paypal.com). Always verify the full email address.' },
  { title: 'Hover before you click', desc: 'Mouse over links to preview the true URL in your browser status bar. If the URL destination looks suspicious or different from the link text, don\'t click.' },
  { title: 'Look for HTTPS', desc: 'Ensure websites use HTTPS (padlock icon) before entering any information. However, having HTTPS alone does NOT guarantee safety.' },
  { title: 'Beware of urgency tactics', desc: 'Phishing emails often create an artificial sense of urgency ("Your account will be suspended in 24 hours!"). Legitimate organisations do not pressure you this way.' },
  { title: 'Never provide credentials via email', desc: 'No legitimate service will ask you to send your password, credit card, or SSN via email. This is always a red flag.' },
  { title: 'Enable Multi-Factor Authentication (MFA)', desc: 'Even if phishers steal your password, MFA adds a critical second layer that prevents unauthorised access.' },
  { title: 'Keep software updated', desc: 'Phishing attacks often exploit vulnerabilities in outdated software. Regular updates patch these security holes.' },
  { title: 'Report suspected phishing', desc: 'Forward phishing emails to your IT department, or report them to organisations like reportphishing@apwg.org or the Anti-Phishing Working Group.' },
]

const EXAMPLES = [
  {
    label: 'Real email',
    tag: 'LEGITIMATE',
    tagColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    icon: CheckCircle,
    iconColor: 'text-emerald-500',
    subject: 'Your June invoice is ready',
    from: 'billing@yourcompany.com',
    body: 'Hi James, Your invoice #1042 for June is ready. You can view and download it at: https://app.yourcompany.com/invoices/1042. If you have any questions, please reply to this email.',
    reasons: ['Personalised greeting with first name', 'Sender domain matches company domain', 'No urgency or pressure', 'Link matches company domain', 'No requests for credentials']
  },
  {
    label: 'Phishing email',
    tag: 'PHISHING',
    tagColor: 'bg-red-100 text-red-700 border-red-200',
    icon: XCircle,
    iconColor: 'text-red-500',
    subject: '⚠️ URGENT: Your account has been SUSPENDED!!!',
    from: 'security@paypa1-accounts.xyz',
    body: 'Dear Customer, Your PayPal account has been SUSPENDED due to suspicious activity. Click here immediately to verify your identity: http://paypal-secure-update.xyz/login. Enter your password and credit card details to restore access. ACT NOW — you have 24 hours!!!',
    reasons: ['Generic greeting "Dear Customer"', 'Sender domain is misspelled (paypa1)', 'High urgency language ("SUSPENDED", "ACT NOW")', 'Link goes to a different suspicious domain', 'Asks for password and credit card via email']
  }
]

const FAQS = [
  { q: 'What is phishing?', a: 'Phishing is a cyberattack where criminals impersonate trusted entities (banks, companies, governments) to trick victims into revealing sensitive information or installing malware.' },
  { q: 'What is spear phishing?', a: 'Spear phishing is a targeted attack on a specific individual, using personal details gathered from social media to make the deception more convincing.' },
  { q: 'What is smishing?', a: 'Smishing is phishing via SMS text messages. The attacker sends fake messages pretending to be a delivery service, bank, or government agency.' },
  { q: 'What is vishing?', a: 'Vishing is voice phishing — phone calls where criminals impersonate technical support, banks, or government officials to extract sensitive information.' },
  { q: 'How do I report phishing?', a: 'You can report phishing to the Anti-Phishing Working Group (apwg.org), to your email provider, or to your organisation\'s IT security team.' },
]

function FAQItem({ faq }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-blue-100 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left
                   hover:bg-cyber-50 transition-colors font-medium text-navy-900">
        {faq.q}
        {open ? <ChevronUp size={16} className="text-cyber-500 flex-shrink-0" /> : <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-5 py-4 bg-cyber-50 text-sm text-gray-600 animate-fade-in border-t border-blue-100">
          {faq.a}
        </div>
      )}
    </div>
  )
}

export default function Awareness() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center mx-auto mb-4">
            <BookOpen size={28} className="text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-navy-900 mb-2">Awareness Hub</h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Learn to identify phishing attacks, understand the tactics criminals use, and protect yourself.
          </p>
        </div>

        {/* Stats banner */}
        <div className="bg-gradient-to-r from-navy-900 to-navy-700 text-white rounded-2xl p-6 mb-10">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle size={20} className="text-amber-400" />
            <h2 className="font-bold text-lg">Why Phishing Awareness Matters</h2>
          </div>
          <p className="text-blue-200 text-sm leading-relaxed">
            Phishing is the #1 cause of data breaches worldwide. In 2023 alone, the FBI received over 300,000 phishing complaints
            with losses exceeding $18 million. <strong className="text-white">Human awareness is the most effective defence.</strong>
          </p>
        </div>

        {/* Protection tips */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-navy-900 mb-6 flex items-center gap-2">
            <ShieldCheck size={22} className="text-cyber-600" /> Protection Tips
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {TIPS.map((tip, i) => (
              <div key={i} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-cyber-600 text-white text-xs font-bold
                                  flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">{tip.title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{tip.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Real vs Fake */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-navy-900 mb-6">Real vs Fake — Examples</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {EXAMPLES.map(ex => (
              <div key={ex.label} className="card">
                <div className={`inline-flex items-center gap-1.5 border text-xs font-bold px-3 py-1 rounded-full mb-4 ${ex.tagColor}`}>
                  <ex.icon size={12} className={ex.iconColor} />
                  {ex.tag}
                </div>
                <div className="bg-gray-50 rounded-xl p-4 mb-4 text-sm">
                  <div className="text-xs text-gray-400 mb-1">Subject:</div>
                  <div className="font-semibold text-gray-800 mb-3">{ex.subject}</div>
                  <div className="text-xs text-gray-400 mb-1">From:</div>
                  <div className="font-mono text-gray-700 text-xs mb-3">{ex.from}</div>
                  <div className="text-xs text-gray-400 mb-1">Body:</div>
                  <div className="text-gray-600 text-xs leading-relaxed">{ex.body}</div>
                </div>
                <h4 className="text-xs font-semibold text-gray-600 mb-2">Why:</h4>
                <ul className="space-y-1">
                  {ex.reasons.map((r, i) => (
                    <li key={i} className={`text-xs flex items-start gap-1.5
                      ${ex.tag === 'LEGITIMATE' ? 'text-emerald-700' : 'text-red-600'}`}>
                      {ex.tag === 'LEGITIMATE'
                        ? <CheckCircle size={12} className="mt-0.5 flex-shrink-0"/>
                        : <XCircle size={12} className="mt-0.5 flex-shrink-0"/>}
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-bold text-navy-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => <FAQItem key={i} faq={faq} />)}
          </div>
        </section>
      </div>
    </div>
  )
}
