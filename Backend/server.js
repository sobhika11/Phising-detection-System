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

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.listen(PORT, () => {
  console.log(`✅ PhishGuard backend running → http://localhost:${PORT}`);
});