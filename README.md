# 🛡️ PhishGuard — Phishing Detection & Awareness Platform

> An educational, real-time phishing detection system that analyses URLs and emails for phishing indicators, educates users about cybersecurity threats, and tests awareness through an interactive quiz.

---

## 🌐 Live Demo

| Service | URL |
|---|---|
| **Backend API** | https://phising-detection-system.onrender.com |
| **Frontend** | *(deploy as Render Static Site — see below)* |

---

## ✨ Features

### 🔗 URL Analyzer
Analyses any URL using 9+ heuristic rules:
- IP-based URL detection
- Missing HTTPS encryption
- Unusually long URLs (>75 chars)
- Multiple subdomain nesting
- `@` symbol injection trick
- Excessive hyphens in domain
- Suspicious TLDs (`.xyz`, `.top`, `.tk`…)
- Phishing keywords in the domain
- Suspicious redirect query parameters

### 📧 Email / Message Analyzer
Scans email/message content using 7 detection rules:
- Urgency & pressure language (`verify`, `suspended`, `act now`…)
- Scam / reward language (`prize`, `lottery`, `wire transfer`…)
- Credential harvesting attempts
- Embedded links detection
- Brand impersonation (PayPal, Amazon, Google…)
- Formatting anomalies (ALL CAPS, `!!!`)
- Generic non-personalised greetings

### 📊 Risk Scoring Engine
Weighted scoring system with clear classification:

| Score | Risk Level |
|---|---|
| 0 – 29 | 🟢 Low Risk |
| 30 – 59 | 🟡 Medium Risk |
| 60 – 100 | 🔴 High Risk |

### 💡 Explainable Results
Every scan shows:
- Which rules were triggered
- Point weight of each rule
- Plain-English explanation of why it's suspicious

### 📚 Awareness Hub
- 8 phishing protection tips
- Real vs fake email side-by-side comparison
- FAQ accordion (spear phishing, smishing, vishing…)

### 🧠 Interactive Quiz
- 8 cybersecurity questions
- Instant feedback with explanations
- Score screen with full answer review

### 📈 Dashboard
- KPI cards (total scans, high/medium/low risk counts)
- Bar chart of recent scan scores
- Pie chart of risk distribution
- Scan history table
- Powered by `localStorage` — no account needed

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite 5 |
| Styling | Tailwind CSS 3 |
| Charts | Recharts |
| Routing | React Router v6 |
| Icons | Lucide React |
| Backend | Node.js + Express 4 |
| Env | dotenv |

---

## 📁 Project Structure

```
phising-detection-system/
├── Backend/
│   ├── Routes/
│   │   ├── url-checker.js     # URL heuristic detection API
│   │   ├── email-checker.js   # Email heuristic detection API
│   │   └── stats.js           # Scan stats recording API
│   ├── server.js              # Express entry point
│   ├── .env                   # Environment variables (not committed)
│   └── package.json
│
└── Frontend/
    └── phishing-detector/
        ├── src/
        │   ├── components/
        │   │   ├── Navbar.jsx
        │   │   ├── Footer.jsx
        │   │   └── ResultCard.jsx
        │   ├── pages/
        │   │   ├── HomePage.jsx
        │   │   ├── URLAnalyzer.jsx
        │   │   ├── EmailAnalyzer.jsx
        │   │   ├── Awareness.jsx
        │   │   ├── Quiz.jsx
        │   │   └── Dashboard.jsx
        │   ├── utils/
        │   │   ├── urlAnalyzer.js     # URL scoring logic
        │   │   └── emailAnalyzer.js   # Email scoring logic
        │   ├── App.jsx
        │   └── main.jsx
        ├── vite.config.js
        ├── tailwind.config.js
        └── package.json
```

---

## 🚀 Running Locally

You need **two terminals** open simultaneously.

### Prerequisites
- Node.js v18+
- npm

### 1. Clone the repository
```bash
git clone https://github.com/sobhika11/Phising-detection-System.git
cd Phising-detection-System
```

### 2. Start the Backend
```bash
cd Backend
npm install
npm start
# ✅ Running on http://localhost:5000
```

### 3. Start the Frontend
```bash
cd Frontend/phishing-detector
npm install
npm run dev
# ✅ Running on http://localhost:3000
```

Then open **http://localhost:3000** in your browser.

---

## ☁️ Deployment (Render)

### Backend — Web Service
| Field | Value |
|---|---|
| Language | `Node` |
| Root Directory | `Backend` |
| Build Command | `npm install` |
| Start Command | `npm start` |

**Environment Variables:**
```
PORT=5000
CORS_ORIGIN=https://your-frontend.onrender.com
```

### Frontend — Static Site
| Field | Value |
|---|---|
| Root Directory | `Frontend/phishing-detector` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |

---

## 🔒 Privacy & Safety

- ✅ No user data or credentials are ever collected or stored
- ✅ Analysis is heuristic-based and runs locally or via the API
- ✅ No harmful functionality — purely educational
- ✅ Dashboard history is stored in browser `localStorage` only

---

## 📄 License

MIT — free to use, modify, and distribute for educational purposes.