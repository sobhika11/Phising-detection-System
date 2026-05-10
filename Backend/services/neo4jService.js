const { driver } = require('../db');

/**
 * Service to query Neo4j for neighboring domains on the same IP.
 */
const getNeighborhoodAlert = async (ip, currentUrl) => {
  if (!ip) return null;
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (u:URL)-[:HOSTED_ON]->(ip:IP {address: $ip})<-[:HOSTED_ON]-(neighbor:URL)
       WHERE neighbor.address <> $currentUrl AND neighbor.riskScore > 0.8
       RETURN count(neighbor) as count, collect(neighbor.address) as neighbors`,
      { ip, currentUrl }
    );

    if (result.records.length === 0) return null;

    const count = result.records[0].get('count').toNumber();
    const neighbors = result.records[0].get('neighbors');

    return {
      ip,
      riskyNeighborCount: count,
      riskyNeighbors: neighbors,
      message: count > 0 
        ? `Warning: This URL is hosted on an IP associated with ${count} known phishing campaigns.`
        : 'Safe neighborhood. No high-risk domains found on this IP.'
    };
  } catch (error) {
    console.error('Neo4j Neighborhood Query Error:', error.message);
    return null;
  } finally {
    await session.close();
  }
};

module.exports = { getNeighborhoodAlert };
