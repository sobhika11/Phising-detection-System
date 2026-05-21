import os
import uuid
import asyncio
import socket
import ipaddress
from urllib.parse import urlparse
from models.request_models import SanitizedView

SCREENSHOT_DIR = "screenshots"

if not os.path.exists(SCREENSHOT_DIR):
    os.makedirs(SCREENSHOT_DIR)

def is_safe_url(url: str) -> bool:
    try:
        parsed = urlparse(url)
        if parsed.scheme not in ('http', 'https'):
            return False
        hostname = parsed.hostname
        if not hostname:
            return False
        if hostname == 'localhost' or hostname.endswith('.local'):
            return False
        if hostname.startswith('127.') or hostname.startswith('192.168.') or hostname.startswith('10.'):
            return False

        # Attempt to resolve IP to block any private network access
        ip_addr = socket.gethostbyname(hostname)
        ip = ipaddress.ip_address(ip_addr)
        if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_multicast or ip.is_reserved:
            return False
            
        return True
    except Exception:
        return False

async def _capture_screenshot_internal(url: str, filename: str, image_path: str):
    from playwright.async_api import async_playwright

    async with async_playwright() as p:
        # Optimized stable arguments - dropped '--single-process' to fix crashes
        browser = await p.chromium.launch(
            headless=True,
            args=[
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--no-first-run',
                '--no-zygote'
            ]
        )

        context = await browser.new_context(
            viewport={"width": 1280, "height": 720}, 
            accept_downloads=False,
            java_script_enabled=True,
            permissions=[],
            geolocation=None
        )
        
        page = await context.new_page()

        # SSRF Routing Protections
        async def route_handler(route):
            req_url = route.request.url
            try:
                parsed = urlparse(req_url)
                if parsed.scheme not in ("http", "https"):
                    await route.abort()
                    return
                hn = parsed.hostname
                if hn and (hn == 'localhost' or hn.endswith('.local') or hn.startswith('127.') or hn.startswith('192.168.') or hn.startswith('10.')):
                    await route.abort()
                    return
                await route.continue_()
            except:
                await route.abort()
                
        await page.route("**/*", route_handler)

        # Step 1: Navigate using 'domcontentloaded' for a stable DOM lifecycle hook
        response = await page.goto(
            url,
            wait_until="domcontentloaded", 
            timeout=20000
        )

        # Give the JS engine a clean 3 seconds to execute without network restrictions
        await page.wait_for_timeout(3000) 

        # Step 2: Safe Evaluation. Wrap page reads in try/except blocks 
        # so if a page tries to close itself, we still save the screenshot!
        title = "Unknown Title"
        final_url = url
        redirects = []
        login_form_detected = False
        indicators = []

        try:
            final_url = page.url
            title = await page.title()
            
            if response and response.request.redirected_from:
                req = response.request.redirected_from
                while req:
                    redirects.append(req.url)
                    req = req.redirected_from

            password_inputs = await page.locator("input[type='password']").count()
            if password_inputs > 0:
                login_form_detected = True
                indicators.append("password input present")

            scripts = await page.evaluate("""() => {
                return Array.from(document.scripts).filter(s => s.src && !s.src.includes(window.location.hostname)).length;
            }""")
            if scripts > 5:
                indicators.append("many external scripts")
        except Exception as eval_error:
            print(f"Context closed slightly early during metadata read: {eval_error}")

        # Basic keyword check on whatever title we managed to grab
        title_lower = title.lower()
        phish_keywords = ["secure", "account", "login", "signin", "verify", "banking", "paypal", "amazon", "microsoft", "apple", "google", "update"]
        if any(kw in title_lower for kw in phish_keywords):
            indicators.append("brand-related keywords in title")
            
        if len(redirects) > 2:
            indicators.append("suspicious redirects")

        # Step 3: Fast Viewport Snapshot
        try:
            await page.screenshot(
                path=image_path,
                full_page=False,
                timeout=5000
            )
            screenshot_captured = True
            status = "success"
            err_msg = None
        except Exception as screenshot_error:
            screenshot_captured = False
            status = "failed"
            err_msg = f"Screenshot capture dropped: {str(screenshot_error)}"

        await browser.close()

        return {
            "screenshotCaptured": screenshot_captured,
            "screenshotPath": f"/screenshots/{filename}" if screenshot_captured else None,
            "renderingStatus": status,
            "finalUrl": final_url,
            "pageTitle": title,
            "loginFormDetected": login_form_detected,
            "suspiciousVisualIndicators": indicators,
            "error": err_msg
        }

def _run_playwright_sync(url: str, filename: str, image_path: str):
    import sys
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
    
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(_capture_screenshot_internal(url, filename, image_path))
    finally:
        loop.close()

async def capture_screenshot(url: str):
    if not is_safe_url(url):
        return {
            "screenshotCaptured": False,
            "screenshotPath": None,
            "renderingStatus": "failed",
            "finalUrl": None,
            "pageTitle": None,
            "loginFormDetected": False,
            "suspiciousVisualIndicators": [],
            "error": "URL blocked by SSRF protection (private/internal IP or invalid scheme)."
        }

    try:
        filename = f"{uuid.uuid4()}.png"
        image_path = os.path.join(SCREENSHOT_DIR, filename)
        
        # Run Playwright in a dedicated thread to avoid Windows NotImplementedError in Uvicorn
        result = await asyncio.to_thread(_run_playwright_sync, url, filename, image_path)
        return result

    except Exception as e:
        import traceback
        return {
            "screenshotCaptured": False,
            "screenshotPath": None,
            "renderingStatus": "error",
            "finalUrl": None,
            "pageTitle": None,
            "loginFormDetected": False,
            "suspiciousVisualIndicators": [],
            "error": str(e)
        }