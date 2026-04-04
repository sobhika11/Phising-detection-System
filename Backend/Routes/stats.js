const express = require('express');
const router  = express.Router();

// In-memory scan log (resets on server restart; replace with MongoDB for persistence)
const scanLog = [];

router.post('/record', (req, res) => {
  const { type, score, risk } = req.body;
  if (!type || score === undefined || !risk) return res.status(400).json({ success: false });
  scanLog.unshift({ type, score, risk, at: new Date().toISOString() });
  if (scanLog.length > 500) scanLog.length = 500;
  res.json({ success: true });
});

router.get('/summary', (req, res) => {
  const total  = scanLog.length;
  const high   = scanLog.filter(s => s.risk === 'high').length;
  const medium = scanLog.filter(s => s.risk === 'medium').length;
  const low    = scanLog.filter(s => s.risk === 'low').length;
  const avg    = total ? Math.round(scanLog.reduce((s,h) => s+h.score, 0) / total) : 0;
  res.json({ success: true, total, high, medium, low, avgScore: avg, recent: scanLog.slice(0, 20) });
});

module.exports = router;
