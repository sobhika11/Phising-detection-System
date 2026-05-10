const express = require('express');
const router = express.Router();
// You must import the driver you created in db.js
const { driver } = require('../db'); 

router.get('/network', async (req, res) => { // Tip: If using this in server.js with a prefix, keep this path short
  const session = driver.session();
  try {
    const { search, minScore, type } = req.query;
    
    let query = `MATCH (u:URL)-[r:HOSTED_ON]->(i:IP)`;
    let whereClauses = [];
    let params = {};

    if (search) {
      // Case-insensitive regex is ideal but CONTAINS is faster. 
      // Neo4j 'CONTAINS' is case-sensitive, so we use (?i) pattern in regex or toLower
      whereClauses.push(`(toLower(u.address) CONTAINS toLower($search) OR i.address CONTAINS $search)`);
      params.search = search;
    }
    
    if (minScore) {
      whereClauses.push(`u.riskScore >= $minScore`);
      params.minScore = parseFloat(minScore);
    }

    if (whereClauses.length > 0) {
      query += ` WHERE ${whereClauses.join(' AND ')}`;
    }
    
    query += ` RETURN u.address AS url, u.riskScore AS score, i.address AS ip LIMIT 500`;

    const result = await session.run(query, params);

    const nodes = [];
    const links = [];
    const nodeIds = new Set();

    result.records.forEach(record => {
      const url = record.get('url');
      const ip = record.get('ip');
      const score = record.get('score');

      if (!nodeIds.has(url)) {
        nodes.push({ id: url, type: 'URL', score: score });
        nodeIds.add(url);
      }

      if (!nodeIds.has(ip)) {
        nodes.push({ id: ip, type: 'IP' });
        nodeIds.add(ip);
      }

      links.push({ source: url, target: ip });
    });

    res.json({ nodes, links });
  } catch (error) {
    console.error("Graph Route Error:", error);
    res.status(500).json({ error: "Could not fetch graph data" });
  } finally {
    await session.close();
  }
});

module.exports = router;