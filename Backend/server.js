const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { connectMongo, driver, checkNeo4j } = require('./db');
const graphRouter = require('./routes/graphView');
const statsRouter = require('./Routes/stats');
const Scan = require('./models/Scan');

const app = express();
app.use(cors());
app.use(express.json());
connectMongo();
checkNeo4j();

// 1. ATTACH ROUTERS
app.use('/api/v1/graph', graphRouter);
app.use('/api/v1/stats', statsRouter);

// 2. MAIN SCAN ROUTE
app.post('/api/v1/scan', async (req, res) => {
  const { url } = req.body;
  const session = driver.session();

  try {
    // Talk to the FastAPI "Chef"
    const aiResponse = await axios.post((process.env.PYTHON_AI_URL || 'http://localhost:8000') + '/predict', { url });
    const { riskScore, features, infrastructure, sanitizedView: aiSanitizedView, verdict, modelUsed } = aiResponse.data;
    const ip = infrastructure?.ip || "unknown";

    // 2. Perform Link Analysis via Neo4j
    let neighborhoodAlert = null;
    try {
      await session.run(
        `MERGE (u:URL {address: $url})
         MERGE (ip:IP {address: $ip})
         MERGE (u)-[:HOSTED_ON]->(ip)
         SET u.riskScore = $riskScore`,
        { url, ip, riskScore }
      );

      // Fetch Neighborhood Alert for the hosted IP
      if (ip && ip !== "unknown") {
        const { getNeighborhoodAlert } = require('./services/neo4jService');
        neighborhoodAlert = await getNeighborhoodAlert(ip, url);
      }
    } catch (neoErr) {
      console.warn("Neo4j Graph integration skipped (offline or failed):", neoErr.message);
    }

    // Capture Sanitized Headless Snapshot - we now use the AI's sanitized view if available!
    const sanitizedView = aiSanitizedView;

    // Generate Incident Response Takedown steps if malicious
    const { generateTakedownData } = require('./services/takedownService');
    const nextSteps = generateTakedownData(url, ip, riskScore, []);

    const stringRisk = riskScore >= 0.60 ? 'high' : riskScore >= 0.30 ? 'medium' : 'low';

    // Save to Audit MongoDB
    const auditRecord = await Scan.create({
      type: 'url',
      input: url,
      score: riskScore * 100, // Scale 0-1 to 0-100 logic
      risk: stringRisk,
      verdict,
      modelUsed
    });

    res.json({
      success: true,
      url,
      scanId: auditRecord._id,
      riskScore: riskScore * 100,
      risk: stringRisk,
      verdict,
      modelUsed,
      features, 
      infrastructure,
      neighborhoodAlert, 
      sanitizedView,     
      nextSteps,         
      recommendation: riskScore > 0.7 ? "BLOCK" : "ALLOW"
    });

  } catch (error) {
    console.error("Scan Error:", error);
    res.status(500).json({ error: error.message || "Analysis Failed due to internal error" });
  } finally {
    await session.close();
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend on Port ${PORT}`));