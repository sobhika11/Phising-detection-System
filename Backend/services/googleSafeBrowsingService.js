const axios = require('axios');

/**
 * Checks a URL against Google Safe Browsing API.
 * Returns an object indicating whether the URL is flagged and associated metadata.
 *
 * Environment variable GOOGLE_SAFE_BROWSING_API_KEY must be set.
 */
async function checkGoogleSafeBrowsing(url) {
  const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
  if (!apiKey) {
    return { flagged: false, error: 'Safe Browsing API key missing', source: 'GOOGLE_SAFE_BROWSING' };
  }

  const endpoint = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`;
  const requestBody = {
    client: {
      clientId: 'phishing-detector',
      clientVersion: '1.0'
    },
    threatInfo: {
      threatTypes: [
        'MALWARE',
        'SOCIAL_ENGINEERING',
        'UNWANTED_SOFTWARE',
        'POTENTIALLY_HARMFUL_APPLICATION'
      ],
      platformTypes: ['ANY_PLATFORM'],
      threatEntryTypes: ['URL'],
      threatEntries: [{ url }]
    }
  };

  try {
    const response = await axios.post(endpoint, requestBody, { timeout: 5000 });
    if (response.data && response.data.matches && response.data.matches.length > 0) {
      const threatTypes = response.data.matches.map(m => m.threatType);
      return {
        flagged: true,
        riskScore: 1.0,
        riskLevel: 'CRITICAL',
        threatTypes,
        source: 'GOOGLE_SAFE_BROWSING'
      };
    }
    return { flagged: false, riskScore: null, riskLevel: null, threatTypes: [], source: 'GOOGLE_SAFE_BROWSING' };
  } catch (err) {
    // Handle rate limits, network errors etc.
    console.error('Google Safe Browsing check failed:', err.message);
    return { flagged: false, error: 'Safe Browsing check unavailable', source: 'GOOGLE_SAFE_BROWSING' };
  }
}

module.exports = { checkGoogleSafeBrowsing };
