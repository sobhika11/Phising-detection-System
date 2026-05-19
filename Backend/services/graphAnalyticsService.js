// Graph Analytics Service using Neo4j Graph Data Science (GDS)
// Helper functions to generate alert objects for high‑risk analysis results
// Provides PageRank and Community Detection (Louvain) analyses on the phishing graph.

const { driver } = require('../db');

// Name of the GDS in‑memory graph projection
const PROJECTION_NAME = 'phishGraph';

/**
 * Ensure the GDS graph projection exists.
 * If a projection with the same name exists, it will be dropped and recreated.
 * This function is idempotent and can be called before each analysis.
 */
async function ensureProjection() {
  const session = driver.session();
  try {
    // Drop existing projection if present
    await session.run(`CALL gds.graph.drop('$projName', false) YIELD success`, {
      projName: PROJECTION_NAME,
    }).catch(() => {}); // ignore if not exists

    // Create a cypher projection covering all relevant node labels and relationships
    const createQuery = `
      CALL gds.graph.project.cypher(
        $projName,
        // Node query
        'UNION ALL\n' +
        '  MATCH (u:URL) RETURN id(u) AS id, labels(u) AS labels, u.address AS address, u.riskScore AS riskScore, u.scannedAt AS scannedAt \n' +
        '  MATCH (d:DOMAIN) RETURN id(d) AS id, labels(d) AS labels, d.name AS address, d.riskScore AS riskScore, d.createdAt AS scannedAt \n' +
        '  MATCH (s:SUBDOMAIN) RETURN id(s) AS id, labels(s) AS labels, s.fullName AS address, s.riskScore AS riskScore, null AS scannedAt \n' +
        '  MATCH (i:IP) RETURN id(i) AS id, labels(i) AS labels, i.address AS address, i.riskScore AS riskScore, null AS scannedAt \n' +
        '  MATCH (c:CERTIFICATE) RETURN id(c) AS id, labels(c) AS labels, c.fingerprint AS address, c.riskScore AS riskScore, null AS scannedAt \n' +
        '  MATCH (r:REGISTRANT) RETURN id(r) AS id, labels(r) AS labels, r.email AS address, r.riskScore AS riskScore, r.createdAt AS scannedAt',
        // Relationship query
        `
          MATCH (u:URL)-[r:HOSTED_ON]-(i:IP) RETURN id(u) AS source, id(i) AS target, type(r) AS type\n` +
        `MATCH (u:URL)-[:BELONGS_TO]-(s:SUBDOMAIN) RETURN id(u) AS source, id(s) AS target, 'BELONGS_TO' AS type\n` +
        `MATCH (s:SUBDOMAIN)-[:PART_OF]-(d:DOMAIN) RETURN id(s) AS source, id(d) AS target, 'PART_OF' AS type\n` +
        `MATCH (d:DOMAIN)-[:RESOLVES_TO]-(i:IP) RETURN id(d) AS source, id(i) AS target, 'RESOLVES_TO' AS type\n` +
        `MATCH (d:DOMAIN)-[:USES_CERTIFICATE]-(c:CERTIFICATE) RETURN id(d) AS source, id(c) AS target, 'USES_CERTIFICATE' AS type\n` +
        `MATCH (d:DOMAIN)-[:REGISTERED_BY]-(r:REGISTRANT) RETURN id(d) AS source, id(r) AS target, 'REGISTERED_BY' AS type`
      )`
    ;
    await session.run(createQuery, { projName: PROJECTION_NAME });
    return true;
  } catch (err) {
    console.error('Error ensuring GDS projection:', err);
    throw err;
  } finally {
    await session.close();
  }
}

/**
 * Run PageRank on the phishing graph and return the top nodes.
 * Returns an array of objects containing node type, identifier, riskScore and PageRank score.
 */
async function runPageRankAnalysis(limit = 10) {
  const session = driver.session();
  try {
    await ensureProjection();
    const result = await session.run(
      `CALL gds.pageRank.stream($projName) YIELD nodeId, score\n` +
      `WITH gds.util.asNode(nodeId) AS n, score\n` +
      `RETURN labels(n)[0] AS nodeType,\n` +
      `  CASE\n` +
      `    WHEN 'URL' IN labels(n) THEN n.address\n` +
      `    WHEN 'DOMAIN' IN labels(n) THEN n.name\n` +
      `    WHEN 'SUBDOMAIN' IN labels(n) THEN n.fullName\n` +
      `    WHEN 'IP' IN labels(n) THEN n.address\n` +
      `    WHEN 'CERTIFICATE' IN labels(n) THEN n.fingerprint\n` +
      `    WHEN 'REGISTRANT' IN labels(n) THEN n.email\n` +
      `    ELSE null\n` +
      `  END AS value,\n` +
      `  n.riskScore AS riskScore,\n` +
      `  score AS pageRankScore\n` +
      `ORDER BY score DESC\n` +
      `LIMIT $limit`,
      { projName: PROJECTION_NAME, limit }
    );
    const records = result.records.map(r => ({
      nodeType: r.get('nodeType'),
      value: r.get('value'),
      pageRankScore: parseFloat(r.get('pageRankScore').toFixed(3)),
      riskScore: r.get('riskScore') !== null ? parseFloat(r.get('riskScore')) : null,
      reason: 'Highly connected suspicious infrastructure'
    }));
    return { pageRankResults: records };
  } catch (err) {
    console.error('runPageRankAnalysis error:', err);
    throw err;
  } finally {
    await session.close();
  }
}

/**
 * Run Louvain community detection and return aggregated community data.
 */
async function runCommunityDetection(minCommunitySize = 3) {
  const session = driver.session();
  try {
    await ensureProjection();
    const streamResult = await session.run(
      `CALL gds.louvain.stream($projName) YIELD nodeId, communityId\n` +
      `WITH gds.util.asNode(nodeId) AS n, communityId\n` +
      `RETURN communityId, labels(n)[0] AS nodeType,\n` +
      `  CASE\n` +
      `    WHEN 'URL' IN labels(n) THEN n.address\n` +
      `    WHEN 'DOMAIN' IN labels(n) THEN n.name\n` +
      `    WHEN 'SUBDOMAIN' IN labels(n) THEN n.fullName\n` +
      `    WHEN 'IP' IN labels(n) THEN n.address\n` +
      `    WHEN 'CERTIFICATE' IN labels(n) THEN n.fingerprint\n` +
      `    WHEN 'REGISTRANT' IN labels(n) THEN n.email\n` +
      `    ELSE null\n` +
      `  END AS value,\n` +
      `  n.riskScore AS riskScore\n` +
      `ORDER BY communityId`,
      { projName: PROJECTION_NAME }
    );

    // Aggregate per community
    const communitiesMap = {};
    streamResult.records.forEach(rec => {
      const cid = rec.get('communityId').toNumber();
      const nodeType = rec.get('nodeType');
      const value = rec.get('value');
      const riskScore = rec.get('riskScore');

      if (!communitiesMap[cid]) {
        communitiesMap[cid] = {
          communityId: cid,
          totalNodes: 0,
          riskSum: 0,
          urls: [],
          domains: [],
          subdomains: [],
          ips: [],
          certificates: [],
          registrants: []
        };
      }
      const comm = communitiesMap[cid];
      comm.totalNodes += 1;
      if (riskScore !== null) comm.riskSum += riskScore;
      // Push to the appropriate list based on type
      switch (nodeType) {
        case 'URL': comm.urls.push(value); break;
        case 'DOMAIN': comm.domains.push(value); break;
        case 'SUBDOMAIN': comm.subdomains.push(value); break;
        case 'IP': comm.ips.push(value); break;
        case 'CERTIFICATE': comm.certificates.push(value); break;
        case 'REGISTRANT': comm.registrants.push(value); break;
        default: break;
      }
    });

    // Convert map to array and compute averages & severity
    const communities = Object.values(communitiesMap)
      .filter(c => c.totalNodes >= minCommunitySize)
      .map(c => {
        const avgRisk = c.totalNodes > 0 ? c.riskSum / c.totalNodes : 0;
        const severity = avgRisk >= 0.8 ? 'HIGH' : avgRisk >= 0.5 ? 'MEDIUM' : 'LOW';
        return {
          communityId: c.communityId,
          totalNodes: c.totalNodes,
          averageRiskScore: parseFloat(avgRisk.toFixed(3)),
          severity,
          urls: c.urls,
          domains: c.domains,
          ips: c.ips,
          certificates: c.certificates,
          registrants: c.registrants
        };
      })
      .sort((a, b) => b.totalNodes - a.totalNodes);

    return { communities };
  } catch (err) {
    console.error('runCommunityDetection error:', err);
    throw err;
  } finally {
    await session.close();
  }
}

// Helper to create centrality alert
function generateGraphCentralityAlert(node) {
  return {
    type: "GRAPH_CENTRALITY_ALERT",
    severity: "HIGH",
    message: `${node.nodeType} ${node.value} is highly central in a suspicious phishing cluster.`
  };
}

// Helper to create community alert
function generatePhishingCommunityAlert(community) {
  return {
    type: "PHISHING_COMMUNITY_ALERT",
    severity: community.severity,
    message: `Community ${community.communityId} (size ${community.totalNodes}) has average risk ${community.averageRiskScore}`
  };
}

module.exports = {
  runPageRankAnalysis,
  runCommunityDetection,
  generateGraphCentralityAlert,
  generatePhishingCommunityAlert
};
