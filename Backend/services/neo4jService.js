// Neo4j Service with expanded graph schema, TTL/history tracking, and detection queries
const { driver } = require('../db');

/**
 * Initialize unique constraints and indexes for the graph schema.
 */
async function initConstraints() {
  const session = driver.session();
  try {
    await session.run(`CREATE CONSTRAINT IF NOT EXISTS FOR (u:URL) REQUIRE u.address IS UNIQUE`);
    await session.run(`CREATE CONSTRAINT IF NOT EXISTS FOR (d:DOMAIN) REQUIRE d.name IS UNIQUE`);
    await session.run(`CREATE CONSTRAINT IF NOT EXISTS FOR (s:SUBDOMAIN) REQUIRE s.fullName IS UNIQUE`);
    await session.run(`CREATE CONSTRAINT IF NOT EXISTS FOR (i:IP) REQUIRE i.address IS UNIQUE`);
    await session.run(`CREATE CONSTRAINT IF NOT EXISTS FOR (c:CERTIFICATE) REQUIRE c.fingerprint IS UNIQUE`);
    await session.run(`CREATE CONSTRAINT IF NOT EXISTS FOR (r:REGISTRANT) REQUIRE r.email IS UNIQUE`);
  } finally {
    await session.close();
  }
}

/**
 * Save or update expanded graph data for a scanned URL.
 * Does NOT handle HOSTED_ON relationship – that is managed by saveHostedOnHistory.
 */
async function saveExpandedGraph(scanData) {
  const { url, domain, subdomain, ip, certificate, registrant } = scanData;
  const session = driver.session();
  try {
    await session.run(
      `
      // URL node
      MERGE (u:URL {address: $url.address})
      ON CREATE SET u.path = $url.path,
                    u.protocol = $url.protocol,
                    u.riskScore = $url.riskScore,
                    u.scannedAt = $url.scannedAt
      ON MATCH SET u.riskScore = $url.riskScore,
                   u.scannedAt = $url.scannedAt

      // Subdomain node
      MERGE (s:SUBDOMAIN {fullName: $subdomain.fullName})
      ON CREATE SET s.name = $subdomain.name,
                    s.riskScore = $subdomain.riskScore

      // Domain node
      MERGE (d:DOMAIN {name: $domain.name})
      ON CREATE SET d.rootDomain = $domain.rootDomain,
                    d.tld = $domain.tld,
                    d.createdAt = $domain.createdAt,
                    d.riskScore = $domain.riskScore

      // IP node
      MERGE (i:IP {address: $ip.address})
      ON CREATE SET i.country = $ip.country,
                    i.ASN = $ip.ASN,
                    i.provider = $ip.provider

      // Certificate node
      MERGE (c:CERTIFICATE {fingerprint: $certificate.fingerprint})
      ON CREATE SET c.serialNumber = $certificate.serialNumber,
                    c.issuer = $certificate.issuer,
                    c.subject = $certificate.subject,
                    c.validFrom = $certificate.validFrom,
                    c.validTo = $certificate.validTo

      // Registrant node
      MERGE (r:REGISTRANT {email: $registrant.email})
      ON CREATE SET r.organization = $registrant.organization,
                    r.country = $registrant.country,
                    r.createdAt = $registrant.createdAt

      // Relationships between higher‑level entities
      MERGE (u)-[:BELONGS_TO]->(s)
      MERGE (s)-[:PART_OF]->(d)
      MERGE (d)-[:RESOLVES_TO]->(i)
      MERGE (d)-[:USES_CERTIFICATE]->(c)
      MERGE (d)-[:REGISTERED_BY]->(r)
      `,
      { url, domain, subdomain, ip, certificate, registrant }
    );
  } catch (err) {
    console.error('saveExpandedGraph error:', err);
    throw err;
  } finally {
    await session.close();
  }
}

/**
 * Save or update HOSTED_ON relationship with history (first_seen, last_seen, scan_count).
 */
async function saveHostedOnHistory(urlAddress, ipAddress) {
  const session = driver.session();
  try {
    await session.run(
      `MERGE (u:URL {address: $url})
       MERGE (i:IP {address: $ip})
       MERGE (u)-[r:HOSTED_ON]->(i)
       ON CREATE SET r.first_seen = datetime(), r.last_seen = datetime(), r.scan_count = 1
       ON MATCH SET r.last_seen = datetime(), r.scan_count = r.scan_count + 1`,
      { url: urlAddress, ip: ipAddress }
    );
  } catch (err) {
    console.error('saveHostedOnHistory error:', err);
    throw err;
  } finally {
    await session.close();
  }
}

/**
 * Detect fast‑flux activity for a given URL.
 * Returns an array of alert objects (empty if none).
 */
async function detectFastFlux(urlAddress) {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (u:URL {address: $url})-[r:HOSTED_ON]->(ip:IP)
       WITH u, collect({ip: ip.address, first_seen: r.first_seen}) AS rels, count(DISTINCT ip) AS ipCount
       WHERE ipCount > 1 AND any(rinfo IN rels WHERE rinfo.first_seen >= datetime() - duration({hours:24}))
       RETURN u.address AS url, rels`,
      { url: urlAddress }
    );
    if (result.records.length === 0) return [];
    return [{
      type: "FAST_FLUX_ACTIVITY",
      severity: "HIGH",
      message: "This URL moved across multiple IPs recently, possible fast‑flux behavior."
    }];
  } catch (err) {
    console.error('detectFastFlux error:', err);
    return [];
  } finally {
    await session.close();
  }
}

/**
 * Get recent URLs that moved to a specific IP within the last 24 hours.
 */
async function getRecentUrlsMovedToIp(ipAddress) {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (u:URL)-[r:HOSTED_ON]->(ip:IP {address: $ip})
       WHERE r.first_seen >= datetime() - duration({hours:24})
       RETURN u.address AS url, r.first_seen AS firstSeen, r.last_seen AS lastSeen`,
      { ip: ipAddress }
    );
    return result.records.map(r => ({
      url: r.get('url'),
      firstSeen: r.get('firstSeen'),
      lastSeen: r.get('lastSeen')
    }));
  } catch (err) {
    console.error('getRecentUrlsMovedToIp error:', err);
    return [];
  } finally {
    await session.close();
  }
}

/**
 * Cleanup old HOSTED_ON relationships older than given days (default 30).
 * Also removes isolated nodes that have no remaining HOSTED_ON links.
 */
async function cleanupOldGraphData(days = 30) {
  const session = driver.session();
  try {
    await session.run(
      `MATCH ()-[r:HOSTED_ON]->()
       WHERE r.last_seen < datetime() - duration({days: $days})
       DELETE r`,
      { days }
    );
    // Delete nodes that became isolated after relationship removal
    await session.run(
      `MATCH (n)
       WHERE NOT (n)-[:HOSTED_ON]-() AND NOT (:URL)-[:HOSTED_ON]->(n) AND NOT (n)-[:HOSTED_ON]->(:IP)
       DELETE n`
    );
  } catch (err) {
    console.error('cleanupOldGraphData error:', err);
    throw err;
  } finally {
    await session.close();
  }
}

/**
 * Existing neighborhood alert unchanged.
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
      message: count > 0 ? `Warning: This URL is hosted on an IP associated with ${count} known phishing campaigns.` : 'Safe neighborhood. No high-risk domains found on this IP.'
    };
  } catch (error) {
    console.error('Neo4j Neighborhood Query Error:', error.message);
    return null;
  } finally {
    await session.close();
  }
};

/**
 * Detection queries for suspicious infrastructure patterns.
 */
async function detectSharedInfrastructure() {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (d:DOMAIN)-[:RESOLVES_TO]->(i:IP)<-[:RESOLVES_TO]-(other:DOMAIN)
       WHERE d.riskScore > 0.8 AND other.riskScore > 0.8 AND d <> other
       WITH i, collect(d.name) AS domains, count(other) AS otherCount
       WHERE otherCount >= 5
       RETURN i.address AS ip, domains, otherCount`
    );
    const alerts = [];
    result.records.forEach(r => {
      alerts.push({
        type: "SHARED_INFRASTRUCTURE",
        severity: "HIGH",
        message: `IP ${r.get('ip')} hosts ${r.get('otherCount')} high‑risk domains: ${r.get('domains').join(', ')}`
      });
    });
    return alerts;
  } finally {
    await session.close();
  }
}

async function detectSharedCertificates() {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (d:DOMAIN)-[:USES_CERTIFICATE]->(c:CERTIFICATE)<-[:USES_CERTIFICATE]-(other:DOMAIN)
       WHERE d.riskScore > 0.8 AND other.riskScore > 0.8 AND d <> other
       WITH c, collect(d.name) AS domains, count(other) AS otherCount
       WHERE otherCount >= 5
       RETURN c.fingerprint AS fingerprint, domains, otherCount`
    );
    const alerts = [];
    result.records.forEach(r => {
      alerts.push({
        type: "SHARED_CERTIFICATE",
        severity: "HIGH",
        message: `Certificate ${r.get('fingerprint')} is used by ${r.get('otherCount')} high‑risk domains: ${r.get('domains').join(', ')}`
      });
    });
    return alerts;
  } finally {
    await session.close();
  }
}

async function detectRegistrantAbuse() {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (d:DOMAIN)-[:REGISTERED_BY]->(r:REGISTRANT)
       WHERE d.riskScore > 0.8
       WITH r.email AS email, collect(d.name) AS domains, count(d) AS domainCount
       WHERE domainCount >= 5
       RETURN email, domains, domainCount`
    );
    const alerts = [];
    result.records.forEach(r => {
      alerts.push({
        type: "REGISTRANT_ABUSE",
        severity: "HIGH",
        message: `Registrant ${r.get('email')} created ${r.get('domainCount')} high‑risk domains: ${r.get('domains').join(', ')}`
      });
    });
    return alerts;
  } finally {
    await session.close();
  }
}

async function detectSuspiciousSubdomains() {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (d:DOMAIN)-[:PART_OF]->(s:SUBDOMAIN)
       WHERE s.riskScore > 0.8
       WITH d.name AS domain, collect(s.fullName) AS subdomains, count(s) AS subCount
       WHERE subCount >= 5
       RETURN domain, subdomains, subCount`
    );
    const alerts = [];
    result.records.forEach(r => {
      alerts.push({
        type: "SUSPICIOUS_SUBDOMAINS",
        severity: "MEDIUM",
        message: `Domain ${r.get('domain')} has ${r.get('subCount')} suspicious subdomains: ${r.get('subdomains').join(', ')}`
      });
    });
    return alerts;
  } finally {
    await session.close();
  }
}

async function detectNewHighRiskDomains() {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (d:DOMAIN)
       WHERE d.riskScore > 0.8 AND datetime(d.createdAt) > datetime().epochMillis - 7*24*60*60*1000
       RETURN d.name AS domain, d.riskScore AS riskScore, d.createdAt AS createdAt`
    );
    const alerts = [];
    result.records.forEach(r => {
      alerts.push({
        type: "NEW_HIGH_RISK_DOMAIN",
        severity: "HIGH",
        message: `Domain ${r.get('domain')} created recently (${r.get('createdAt')}) with high risk score ${r.get('riskScore')}`
      });
    });
    return alerts;
  } finally {
    await session.close();
  }
}

async function saveRedirectRelationship(originalUrl, finalUrl, redirectCount) {
  const session = driver.session();
  try {
    await session.run(
      `MERGE (s:URL {address: $originalUrl})
       ON CREATE SET s.type = "SHORTENED"
       MERGE (f:URL {address: $finalUrl})
       ON CREATE SET f.type = "FINAL"
       MERGE (s)-[r:REDIRECTS_TO]->(f)
       ON CREATE SET r.resolvedAt = datetime(), r.redirectCount = $redirectCount
       ON MATCH SET r.resolvedAt = datetime(), r.redirectCount = $redirectCount`,
      { originalUrl, finalUrl, redirectCount: parseInt(redirectCount) || 0 }
    );
  } catch (err) {
    console.error('saveRedirectRelationship error:', err);
  } finally {
    await session.close();
  }
}

module.exports = {
  initConstraints,
  saveExpandedGraph,
  getNeighborhoodAlert,
  saveHostedOnHistory,
  detectFastFlux,
  getRecentUrlsMovedToIp,
  cleanupOldGraphData,
  detectSharedInfrastructure,
  detectSharedCertificates,
  detectRegistrantAbuse,
  detectSuspiciousSubdomains,
  detectNewHighRiskDomains,
  saveRedirectRelationship
};
