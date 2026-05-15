🛡️ Phishing Detection System

A lightweight phishing detection system that analyzes URLs and text using rule-based feature extraction and weighted scoring.

🚀 Features
URL analysis (HTTPS, IP address, subdomains, length)
Suspicious keyword detection
Risk scoring (Low / Medium / High)
Explanation for why input is flagged
⚙️ How It Works
Input → Feature Extraction → Scoring → Classification → Explanation
🛠️ Tech Stack
JavaScript
Node.js
Regex
📌 Example

Input:
http://192.168.0.1/login

Output:
High Risk
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

## 🏢 Enterprise Analyst Workflow (SOC Console)
Recently upgraded to support a professional Security Operations Center (SOC) workflow, adding advanced features designed for incident responders:

- **Graph-Based Neighborhood Alert:** Integrates Neo4j to map relationships between scanned URLs and their hosting IP addresses, automatically warning analysts if an entered domain shares infrastructure with known malicious campaigns.
- **Automated Takedown Checklists:** Generates ready-to-send abuse desk takedown requests when a high-risk URL is detected, including predicted hosting provider contacts and formatted technical indicators.
- **Headless Sanitized View:** Utilizes a hardened, sandboxed Puppeteer instance to fetch a visual screenshot of malicious domains, allowing analysts to inspect the threat without direct exposure to browser exploits.
- **Exportable Threat Intelligence PDFs:** Features a professional, 1-click PDF export using jsPDF, compiling the risk score, feature breakdown, graph context, and visual snapshot into a standardized threat report.
- **Searchable Threat Network Map:** A dynamic, React Force-Graph dashboard that fetches relational threat data via parametrized Neo4j queries, featuring debounced searching, risk-score filtering, and a clear empty-state UI.

---

## 📁 Project Structure

```
phising-detection-system/
├── Backend/
│   ├── Routes/
│   │   ├── url-checker.js     # URL heuristic detection API
│   │   ├── email-checker.js   # Email heuristic detection API
│   │   ├── graphView.js       # Neo4j Threat Map Data API
│   │   └── stats.js           # Scan stats recording API
│   ├── services/
│   │   ├── neo4jService.js      # Neighborhood alert relationship queries
│   │   ├── screenshotService.js # Headless Puppeteer scanning
│   │   └── takedownService.js   # Abuse email generator
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
        │   │   ├── ResultCard.jsx
        │   │   └── GraphView.jsx      # Threat Intel Network Dashboard 
        │   ├── pages/
        │   │   ├── HomePage.jsx
        │   │   ├── URLAnalyzer.jsx    # SOC Analyst Console
        │   │   ├── EmailAnalyzer.jsx
        │   │   ├── Awareness.jsx
        │   │   ├── Quiz.jsx
        │   │   └── Dashboard.jsx
        │   ├── utils/
        │   │   ├── urlAnalyzer.js     # URL scoring logic
        │   │   ├── emailAnalyzer.js   # Email scoring logic
        │   │   └── pdfGenerator.js    # Threat Report PDF builder
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
| **Root Directory** | *(leave empty)* |
| **Build Command** | `cd Frontend/phishing-detector && npm install && npm run build` |
| **Publish Directory** | `Frontend/phishing-detector/dist` |

> ⚠️ Use `npm run build` — NOT `npm run dev`. The dev server cannot be used for static deployment.

---

## 🔒 Privacy & Safety

- ✅ No user data or credentials are ever collected or stored
- ✅ Analysis is heuristic-based and runs locally or via the API
- ✅ No harmful functionality — purely educational
- ✅ Dashboard history is stored in browser `localStorage` only

---

## 📄 License

MIT — free to use, modify, and distribute for educational purposes.
=======
Uses IP address
No HTTPS
Contains suspicious keywords
>>>>>>> 9b9d6b69604be2c1d25c69fdff186d848024f7cd
