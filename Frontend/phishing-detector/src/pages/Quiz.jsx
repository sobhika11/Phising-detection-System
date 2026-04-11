import { useState } from 'react'
import { HelpCircle, CheckCircle, XCircle, Trophy, RotateCcw, ChevronRight } from 'lucide-react'

const QUESTIONS = [
  {
    id: 1,
    question: 'Which of the following is the strongest sign that an email is a phishing attempt?',
    options: [
      'The email uses a professional logo',
      'The sender asks you to verify your password via email',
      'The email was received on a Monday',
      'The email has no spelling mistakes',
    ],
    correct: 1,
    explanation: 'Legitimate organisations never ask for credentials via email. Asking for passwords is always a major red flag, regardless of how professional the email looks.',
  },
  {
    id: 2,
    question: 'You receive an email from "support@paypa1.com" about your PayPal account. What do you do?',
    options: [
      'Click the link and check your PayPal account',
      'Reply with your account details',
      'Recognise the misspelled domain and report it as phishing',
      'Forward it to friends to warn them',
    ],
    correct: 2,
    explanation: '"paypa1.com" uses a number "1" instead of the letter "l" in "paypal". Domain spoofing is a classic phishing tactic. Always check the full sender domain carefully.',
  },
  {
    id: 3,
    question: 'Which URL is most likely to be a phishing or malicious link?',
    options: [
      'https://www.amazon.com/orders',
      'http://amazon-secure-login.xyz/account',
      'https://amazon.co.uk/help',
      'https://smile.amazon.com',
    ],
    correct: 1,
    explanation: '"amazon-secure-login.xyz" uses hyphens to appear legitimate while hiding on a fake ".xyz" domain. Scammers rely on users not reading the full domain carefully.',
  },
  {
    id: 4,
    question: 'An email says "Urgent: Your bank account will be closed in 24 hours." This is an example of:',
    options: [
      'Legitimate customer service',
      'A routine security notification',
      'Urgency and pressure tactics used in phishing',
      'A bug in the bank\'s email system',
    ],
    correct: 2,
    explanation: 'Creating artificial urgency is a core phishing tactic. Attackers want you to panic and act without thinking. Legitimate banks never threaten account closure via email deadlines.',
  },
  {
    id: 5,
    question: 'What does the padlock icon in a browser\'s address bar actually confirm?',
    options: [
      'The website is safe and not a scam',
      'The website is owned by a trusted company',
      'The connection between your browser and the website is encrypted (HTTPS)',
      'The website has been verified by your government',
    ],
    correct: 2,
    explanation: 'HTTPS/padlock only confirms that data is encrypted in transit. Phishing sites can and do use HTTPS. A padlock does NOT mean a website is trustworthy or legitimate.',
  },
  {
    id: 6,
    question: 'You receive a text message from "DHL" with a link to track a package. You weren\'t expecting a delivery. What is this?',
    options: [
      'A genuine delivery notification',
      'A smishing (SMS phishing) attempt',
      'A technical glitch from DHL',
      'Spam, but safe to click',
    ],
    correct: 1,
    explanation: 'This is smishing — phishing via SMS. Fake delivery notifications are extremely common. Never click links in unsolicited texts; always verify by visiting the official carrier website.',
  },
  {
    id: 7,
    question: 'Which of the following is the BEST first action if you accidentally click a phishing link?',
    options: [
      'Ignore it and hope nothing happens',
      'Immediately change your passwords, run a malware scan, and notify IT/your bank',
      'Uninstall your browser',
      'Reply to the phisher demanding they remove your data',
    ],
    correct: 1,
    explanation: 'Quick action limits damage. Changing passwords prevents account takeover, a malware scan catches any downloaded malware, and notifying proper parties lets them monitor and help.',
  },
  {
    id: 8,
    question: 'What is "spear phishing"?',
    options: [
      'Mass phishing emails sent to thousands of random people',
      'Phishing via phone calls',
      'A targeted phishing attack on a specific individual using personal information',
      'Phishing attacks that install spyware',
    ],
    correct: 2,
    explanation: 'Spear phishing is highly targeted and uses personal details (name, employer, recent activity) gathered from social media to make the attack far more convincing than generic phishing.',
  },
]

export default function Quiz() {
  const [current, setCurrent]   = useState(0)
  const [selected, setSelected] = useState(null)
  const [answers, setAnswers]   = useState([])
  const [finished, setFinished] = useState(false)

  function handleSelect(idx) {
    if (selected !== null) return
    setSelected(idx)
    const isCorrect = idx === QUESTIONS[current].correct
    setAnswers(prev => [...prev, { q: QUESTIONS[current].id, correct: isCorrect, selected: idx }])
  }

  function next() {
    if (current + 1 >= QUESTIONS.length) {
      setFinished(true)
    } else {
      setCurrent(c => c + 1)
      setSelected(null)
    }
  }

  function reset() {
    setCurrent(0); setSelected(null); setAnswers([]); setFinished(false)
  }

  const score = answers.filter(a => a.correct).length

  if (finished) {
    const pct = Math.round((score / QUESTIONS.length) * 100)
    const level = pct >= 80 ? { label: 'Phishing Pro!', color: 'text-emerald-600', icon: '🏆' }
                : pct >= 60 ? { label: 'Good Awareness', color: 'text-amber-600',  icon: '🎯' }
                :             { label: 'Needs Improvement', color: 'text-red-600',  icon: '📚' }

    return (
      <div className="min-h-screen bg-gray-50 py-16 px-4 flex items-center justify-center">
        <div className="max-w-lg w-full card text-center animate-slide-up">
          <div className="text-6xl mb-4">{level.icon}</div>
          <h2 className="text-3xl font-black text-navy-900 mb-1">Quiz Complete!</h2>
          <p className={`text-xl font-bold mb-4 ${level.color}`}>{level.label}</p>

          <div className="bg-gray-50 rounded-2xl p-6 mb-6">
            <div className="text-6xl font-black text-navy-900">{score}<span className="text-2xl text-gray-400">/{QUESTIONS.length}</span></div>
            <p className="text-gray-500 mt-1">{pct}% correct</p>
            <div className="h-3 w-full bg-gray-200 rounded-full mt-4 overflow-hidden">
              <div className="h-3 rounded-full bg-cyber-600 transition-all duration-1000"
                   style={{ width: `${pct}%` }} />
            </div>
          </div>

          {/* Answer review */}
          <div className="text-left space-y-3 mb-6">
            {QUESTIONS.map((q, i) => {
              const ans = answers[i]
              return (
                <div key={q.id}
                  className={`rounded-xl p-3 border text-xs ${ans?.correct ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-start gap-2">
                    {ans?.correct ? <CheckCircle size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                                  : <XCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />}
                    <div>
                      <p className="font-medium text-gray-800 mb-1">Q{i+1}: {q.question}</p>
                      {!ans?.correct && (
                        <p className="text-gray-500">✓ Correct: <span className="font-semibold">{q.options[q.correct]}</span></p>
                      )}
                      <p className="text-gray-400 mt-1 italic">{q.explanation}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <button id="quiz-restart-btn" onClick={reset} className="btn-primary w-full justify-center py-4">
            <RotateCcw size={16} /> Try Again
          </button>
        </div>
      </div>
    )
  }

  const q = QUESTIONS[current]
  const progress = ((current) / QUESTIONS.length) * 100

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center mx-auto mb-3">
            <HelpCircle size={26} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-navy-900">Phishing Quiz</h1>
          <p className="text-gray-500 mt-1">Test your phishing awareness — {QUESTIONS.length} questions</p>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Question {current+1} of {QUESTIONS.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-2 bg-cyber-600 rounded-full transition-all duration-500"
                 style={{ width: `${((current+1)/QUESTIONS.length)*100}%` }} />
          </div>
        </div>

        {/* Question card */}
        <div className="card mb-4 animate-fade-in" key={q.id}>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-7 h-7 rounded-full bg-cyber-600 text-white text-xs font-bold
                             flex items-center justify-center flex-shrink-0">
              {current+1}
            </span>
            <p className="font-semibold text-navy-900 text-lg leading-snug">{q.question}</p>
          </div>

          <div className="space-y-3">
            {q.options.map((opt, i) => {
              let cls = 'border-2 border-gray-200 bg-white hover:border-cyber-400 hover:bg-cyber-50 cursor-pointer'
              if (selected !== null) {
                if (i === q.correct)                               cls = 'border-2 border-emerald-500 bg-emerald-50 cursor-default'
                else if (i === selected && selected !== q.correct) cls = 'border-2 border-red-400 bg-red-50 cursor-default'
                else                                               cls = 'border-2 border-gray-100 bg-gray-50 opacity-60 cursor-default'
              }
              return (
                <button key={i}
                  id={`quiz-option-${i}`}
                  onClick={() => handleSelect(i)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all text-sm font-medium flex items-center gap-3 ${cls}`}>
                  <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center flex-shrink-0 text-xs">
                    {String.fromCharCode(65+i)}
                  </span>
                  {opt}
                  {selected !== null && i === q.correct && <CheckCircle size={16} className="text-emerald-500 ml-auto flex-shrink-0" />}
                  {selected !== null && i === selected && selected !== q.correct && <XCircle size={16} className="text-red-500 ml-auto flex-shrink-0" />}
                </button>
              )
            })}
          </div>

          {/* Explanation */}
          {selected !== null && (
            <div className={`mt-4 p-4 rounded-xl text-sm animate-fade-in
              ${selected === q.correct ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
              <p className="font-semibold mb-1">{selected === q.correct ? '✓ Correct!' : '✗ Incorrect'}</p>
              <p className="text-xs leading-relaxed">{q.explanation}</p>
            </div>
          )}
        </div>

        {selected !== null && (
          <button id="quiz-next-btn" onClick={next} className="btn-primary w-full justify-center py-4 animate-fade-in">
            {current + 1 >= QUESTIONS.length ? <><Trophy size={18}/> See Results</> : <>Next Question <ChevronRight size={18}/></>}
          </button>
        )}
      </div>
    </div>
  )
}
