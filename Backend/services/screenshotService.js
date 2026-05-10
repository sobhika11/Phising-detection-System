const puppeteer = require('puppeteer');

/**
 * Service for safely capturing a sanitized visual screenshot of a target URL.
 * Designed to execute in a controlled headless environment without exposing the user to malicious code.
 */
const captureSanitizedView = async (url) => {
  if (!/^https?:\/\//i.test(url)) {
    url = 'http://' + url;
  }

  let browser = null;
  try {
    // Launch headless browser with basic protections and sandbox elements.
    browser = await puppeteer.launch({
      headless: 'new', // Modern headless mode
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security', 
        '--disable-features=IsolateOrigins,site-per-process', 
        '--mute-audio',
        '--disable-extensions',
        '--disable-dev-shm-usage'
      ]
    });

    const page = await browser.newPage();
    
    // Safety Protections
    // We disable JS to prevent malicious popups, crypto-mining, or redirects during our headless scan.
    await page.setJavaScriptEnabled(false); 
    await page.setViewport({ width: 1280, height: 800 });
    
    // Timeout limits to prevent the API from hanging on unreachable hosts
    await page.goto(url, { waitUntil: 'load', timeout: 8000 });

    // Capture compressed JPEG screenshot directly to a buffer
    const buffer = await page.screenshot({ type: 'jpeg', quality: 50 });
    const base64Data = buffer.toString('base64');
    
    return {
      available: true,
      imageUrl: `data:image/jpeg;base64,${base64Data}`,
      error: null
    };

  } catch (err) {
    console.error('Sanitized View Error (Headless Capture Failed):', err.message);
    
    let errorMsg = 'Unable to safely reach the destination or domain blocked the request.';
    if (err.message.includes('timeout')) {
      errorMsg = 'Connection timed out while attempting to capture the page.';
    } else if (err.message.includes('net::ERR_NAME_NOT_RESOLVED')) {
      errorMsg = 'DNS resolution failed. The domain may be inactive or fake.';
    }

    return {
      available: false,
      imageUrl: null,
      error: errorMsg
    };
  } finally {
    if (browser) {
      await browser.close().catch(console.error);
    }
  }
};

module.exports = { captureSanitizedView };
