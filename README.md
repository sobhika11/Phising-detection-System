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

Uses IP address
No HTTPS
Contains suspicious keywords
