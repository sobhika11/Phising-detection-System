# 🛡️ PhishGuard — Phishing Detection & Threat Analysis Platform

A modern phishing detection platform that analyzes suspicious URLs using heuristic analysis, infrastructure intelligence, AI-based scoring, and sandboxed browser inspection.

## ✨ Features

* 🔗 **URL Analyzer** — Detects phishing indicators like typosquatting, suspicious TLDs, excessive subdomains, HTTP usage, keyword abuse, redirects, and entropy patterns.
* 🧠 **AI + Heuristic Risk Engine** — Combines weighted rule-based scoring with ML-assisted verdict prediction.
* 🌐 **Infrastructure Intelligence** — Performs DNS resolution, SSL validation, IP lookup, and geo-location analysis.
* 🕸️ **Neo4j Threat Graph** — Maps relationships between URLs and hosting IPs for neighborhood threat analysis.
* 📸 **Sandboxed Sanitized View** — Uses Playwright headless browser isolation to safely capture phishing page screenshots.
* 📄 **Threat Intelligence Reports** — Exportable scan reports with indicators, risk score, redirects, and infrastructure details.
* 📊 **SOC-style Dashboard** — Visual risk analytics, scan history, charts, and searchable threat network mapping.

## 🛠️ Tech Stack

* **Frontend:** React + Vite + Tailwind CSS
* **Backend:** FastAPI + Node.js + Express
* **Database:** Neo4j
* **Browser Sandbox:** Playwright
* **Visualization:** Recharts + React Force Graph
* **AI/Detection:** Heuristic + ML-assisted scoring
