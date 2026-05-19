const axios = require('axios');

const KNOWN_SHORTENERS = [
  'bit.ly',
  'tinyurl.com',
  't.co',
  'shorturl.at',
  'goo.gl',
  'cutt.ly',
  'rebrand.ly',
  'is.gd'
];

function isKnownShortener(hostname) {
  return KNOWN_SHORTENERS.some(domain => hostname === domain || hostname.endsWith(`.${domain}`));
}

const PRIVATE_IP_REGEX = /^(127\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.|::1|fd[0-9a-f]{2}:)/i;

async function resolveFinalUrl(inputUrl) {
  let urlObj;
  try {
    urlObj = new URL(inputUrl);
  } catch (e) {
    return {
      originalUrl: inputUrl,
      finalUrl: inputUrl,
      isShortened: false,
      redirectCount: 0,
      redirectChain: [inputUrl],
      error: "Invalid URL"
    };
  }

  if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
    return {
      originalUrl: inputUrl,
      finalUrl: inputUrl,
      isShortened: false,
      redirectCount: 0,
      redirectChain: [inputUrl],
      error: "Only http and https are allowed"
    };
  }

  if (!isKnownShortener(urlObj.hostname)) {
    return {
      originalUrl: inputUrl,
      finalUrl: inputUrl,
      isShortened: false,
      redirectCount: 0,
      redirectChain: [inputUrl],
      error: null
    };
  }

  const redirectChain = [inputUrl];
  let currentUrl = inputUrl;
  let redirectCount = 0;
  const MAX_REDIRECTS = 5;
  let errorMsg = null;

  while (redirectCount < MAX_REDIRECTS) {
    try {
      const parsedCurrent = new URL(currentUrl);
      if (PRIVATE_IP_REGEX.test(parsedCurrent.hostname) || parsedCurrent.hostname === 'localhost') {
        errorMsg = "Redirected to local/private IP";
        break;
      }

      const response = await axios.head(currentUrl, {
        maxRedirects: 0,
        validateStatus: (status) => status >= 200 && status < 400,
        timeout: 5000
      });

      if (response.status >= 300 && response.status < 400 && response.headers.location) {
        let nextUrl = response.headers.location;
        if (!nextUrl.startsWith('http')) {
          nextUrl = new URL(nextUrl, currentUrl).href;
        }
        redirectCount++;
        redirectChain.push(nextUrl);
        currentUrl = nextUrl;
      } else {
        break;
      }
    } catch (err) {
      errorMsg = err.message;
      break;
    }
  }

  return {
    originalUrl: inputUrl,
    finalUrl: currentUrl,
    isShortened: true,
    redirectCount,
    redirectChain,
    error: errorMsg
  };
}

module.exports = { resolveFinalUrl };
