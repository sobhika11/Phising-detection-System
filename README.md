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

