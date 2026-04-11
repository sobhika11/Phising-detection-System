const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
const urlChecker   = require('./Routes/url-checker');
const emailChecker = require('./Routes/email-checker');
const stats        = require('./Routes/stats');

app.use('/api/url-checker',   urlChecker);
app.use('/api/email-checker', emailChecker);
app.use('/api/stats',         stats);

// Root route — shows API info instead of "Cannot GET /"
app.get('/', (req, res) => {
  res.json({
    name: 'PhishGuard API',
    version: '1.0.0',
    status: 'running',
    description: 'Phishing detection and awareness backend API',
    endpoints: {
      urlCheck:    'POST /api/url-checker/check',
      emailCheck:  'POST /api/email-checker/check',
      statsRecord: 'POST /api/stats/record',
      statsSummary:'GET  /api/stats/summary',
      health:      'GET  /api/health',
    },
    time: new Date().toISOString(),
  });
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.listen(PORT, () => {
  console.log(`✅ PhishGuard backend running → http://localhost:${PORT}`);
});