const express = require('express');
const axios = require('axios');
const { connectMongo, driver, checkNeo4j } = require('./db');
const app = express();

app.use(express.json());
connectMongo();
checkNeo4j();

app.post('/api/v1/scan', async (req, res) => {
  const { url } = req.body;
  const session = driver.session();

  try {
    const aiResponse = await axios.post((process.env.PYTHON_AI_URL || 'http://localhost:8000') + '/predict', { url });
    const { riskScore, features } = aiResponse.data;
    await session.run(
      `MERGE (u:URL {address: $url})
       MERGE (ip:IP {address: $ip})
       MERGE (u)-[:HOSTED_ON]->(ip)
       SET u.riskScore = $riskScore`,
      { url, ip: features.ip, riskScore }
    );
     res.json({
      success: true,
      url,
      riskScore,
      recommendation: riskScore > 0.7 ? "BLOCK" : "ALLOW"
    });

  } catch (error) {
    res.status(500).json({ error: "Analysis Failed" });
  } finally {
    await session.close();
  }
});

app.listen(5000, () => console.log("🚀 Backend on Port 5000"));