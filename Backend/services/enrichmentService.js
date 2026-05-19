const dns = require('dns').promises;
const axios = require('axios');
const https = require('https');
const urlModule = require('url');

/**
 * Enrich a URL with DNS, WHOIS, HTTP headers, and SSL certificate info.
 * Returns an object with collected data. Errors are caught and logged; missing data results in empty fields.
 */
async function enrichUrl(targetUrl) {
  const result = {
    ip: null,
    addressFamily: null,
    domain: null,
    subdomain: null,
    whois: {},
    httpHeaders: {},
    certificate: {}
  };

  // Parse URL
  let parsedUrl;
  try {
    parsedUrl = new URL(targetUrl);
  } catch (e) {
    console.error('Invalid URL for enrichment:', e.message);
    return result;
  }

  const hostname = parsedUrl.hostname;
  result.domain = hostname;

  // DNS lookup
  try {
    const lookup = await dns.lookup(hostname);
    result.ip = lookup.address;
    result.addressFamily = lookup.family;
  } catch (err) {
    console.error('DNS lookup failed:', err.message);
  }

  // WHOIS (simple fetch using https://whoisjson.io API as fallback)
  try {
    const whoisResp = await axios.get(`https://whoisjson.io/api/v1/${hostname}`, { timeout: 5000 });
    const data = whoisResp.data;
    result.whois = {
      registrar: data.registrar || '',
      registrantEmail: data.registrant_email || '',
      creationDate: data.createdDate || '',
      expiryDate: data.expiryDate || '',
      updatedDate: data.updatedDate || ''
    };
  } catch (err) {
    console.error('WHOIS lookup failed (fallback):', err.message);
  }

  // HTTP HEAD request for headers (no redirects beyond 5)
  try {
    const response = await axios.head(targetUrl, { timeout: 5000, maxRedirects: 5 });
    const headers = response.headers;
    result.httpHeaders = {
      statusCode: response.status,
      server: headers['server'] || '',
      contentType: headers['content-type'] || '',
      location: headers['location'] || '',
      strictTransportSecurity: headers['strict-transport-security'] || '',
      contentSecurityPolicy: headers['content-security-policy'] || '',
      xFrameOptions: headers['x-frame-options'] || '',
      xContentTypeOptions: headers['x-content-type-options'] || ''
    };
  } catch (err) {
    console.error('HTTP HEAD request failed:', err.message);
  }

  // SSL certificate for HTTPS URLs
  if (parsedUrl.protocol === 'https:') {
    try {
      const options = {
        host: hostname,
        port: 443,
        rejectUnauthorized: false
      };
      const socket = tls.connect(options, () => {
        const cert = socket.getPeerCertificate();
        if (cert) {
          result.certificate = {
            issuer: cert.issuer ? cert.issuer.O : '',
            subject: cert.subject ? cert.subject.CN : '',
            validFrom: cert.valid_from,
            validTo: cert.valid_to,
            fingerprint: cert.fingerprint,
            serialNumber: cert.serialNumber
          };
        }
        socket.end();
      });
      // wait for socket to close
      await new Promise((resolve) => socket.on('end', resolve));
    } catch (err) {
      console.error('SSL certificate retrieval failed:', err.message);
    }
  }

  return result;
}

module.exports = { enrichUrl };
