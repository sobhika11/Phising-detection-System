const express = require('express');
const router = express.Router();
const Scan = require('../models/Scan');

router.get('/history', async (req, res) => {
  try {
    const scans = await Scan.find().sort({ at: -1 }).limit(50);
    res.json({ success: true, history: scans });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/summary', async (req, res) => {
  try {
    const total = await Scan.countDocuments();
    const high = await Scan.countDocuments({ risk: 'high' });
    const medium = await Scan.countDocuments({ risk: 'medium' });
    const low = await Scan.countDocuments({ risk: 'low' });
    
    // Fast arithmetic for averaging
    const allScans = await Scan.find({}, { score: 1 });
    const avgScore = total > 0 ? Math.round(allScans.reduce((acc, curr) => acc + curr.score, 0) / total) : 0;
    
    const recent = await Scan.find().sort({ at: -1 }).limit(20);
    
    res.json({ success: true, total, high, medium, low, avgScore, recent });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
