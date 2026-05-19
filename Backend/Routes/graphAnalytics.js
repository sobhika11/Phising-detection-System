const express = require('express');
const router = express.Router();

const {
  runPageRankAnalysis,
  runCommunityDetection,
  generateGraphCentralityAlert,
  generatePhishingCommunityAlert
} = require('../services/graphAnalyticsService');

router.get('/pagerank', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const { pageRankResults } = await runPageRankAnalysis(limit);
    // Generate alerts for high‑risk central nodes
    const alerts = pageRankResults
      .filter(r => r.riskScore !== null && r.riskScore >= 0.8)
      .map(r => generateGraphCentralityAlert(r));
    res.json({ pageRankResults, alerts });
  } catch (err) {
    console.error('Pagerank endpoint error:', err);
    res.status(500).json({ error: 'Failed to run PageRank analysis' });
  }
});

router.get('/communities', async (req, res) => {
  try {
    const minSize = parseInt(req.query.minSize) || 3;
    const { communities } = await runCommunityDetection(minSize);
    // Generate alerts for high‑risk communities
    const alerts = communities
      .filter(c => c.severity === 'HIGH')
      .map(c => generatePhishingCommunityAlert(c));
    res.json({ communities, alerts });
  } catch (err) {
    console.error('Community detection endpoint error:', err);
    res.status(500).json({ error: 'Failed to run community detection' });
  }
});

module.exports = router;
