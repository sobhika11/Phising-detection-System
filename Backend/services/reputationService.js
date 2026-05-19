const axios = require('axios');

/**
 * Query VirusTotal for a URL or domain.
 * Returns an object with basic score breakdown.
 */
async function getVirusTotalScore(urlOrDomain) {
  const apiKey = process.env.VIRUSTOTAL_API_KEY;
  if (!apiKey) {
    return null;
  }
  const endpoint = `https://www.virustotal.com/api/v3/urls`;
  try {
    // VirusTotal requires the URL to be base64‑encoded
    const urlId = Buffer.from(urlOrDomain).toString('base64').replace(/=+$/,'');
    const response = await axios.get(`${endpoint}/${urlId}`, {
      headers: { 'x-apikey': apiKey },
      timeout: 5000
    });
    const data = response.data.data.attributes;
    return {
      malicious: data.last_analysis_stats.malicious,
      suspicious: data.last_analysis_stats.suspicious,
      harmless: data.last_analysis_stats.harmless,
      reputation: data.reputation || 0
    };
  } catch (err) {
    console.error('VirusTotal query failed:', err.message);
    return null;
  }
}

/**
 * Query AlienVault OTX for a domain or IP.
 */
async function getAlienVaultScore(domainOrIp) {
  const apiKey = process.env.ALIENVAULT_API_KEY;
  if (!apiKey) {
    return null;
  }
  const endpoint = `https://otx.alienvault.com/api/v1/indicators/${domainOrIp}/general`;
  try {
    const response = await axios.get(endpoint, {
      headers: { 'X-OTX-API-KEY': apiKey },
      timeout: 5000
    });
    const data = response.data;
    return {
      pulseCount: data.pulse_info ? data.pulse_info.count : 0,
      threatTypes: data.pulse_info ? data.pulse_info.pulses.map(p => p.pulse.title) : [],
      reputation: data.reputation || 'unknown'
    };
  } catch (err) {
    console.error('AlienVault OTX query failed:', err.message);
    return null;
  }
}

/**
 * Combine external reputation sources into a unified score.
 */
async function getExternalReputation(url, domain, ip) {
  const vt = await getVirusTotalScore(url || domain);
  const av = await getAlienVaultScore(domain || ip);
  const externalRiskScore = (vt && vt.reputation) ? (vt.reputation / 10) : 0; // simple scaling
  return {
    virusTotal: vt || { malicious: 0, suspicious: 0, harmless: 0, reputation: 0 },
    alienVault: av || { pulseCount: 0, threatTypes: [], reputation: 'unknown' },
    externalRiskScore
  };
}

module.exports = { getVirusTotalScore, getAlienVaultScore, getExternalReputation };
