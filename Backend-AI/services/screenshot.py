import os
import uuid
import asyncio
from models.request_models import SanitizedView

SCREENSHOT_DIR = "screenshots"

if not os.path.exists(SCREENSHOT_DIR):
    os.makedirs(SCREENSHOT_DIR)


async def capture_screenshot(url: str):

    # Windows Playwright workaround
    if os.name == "nt":
        return {
            "available": False,
            "imagePath": None,
            "error": "Screenshot disabled on Windows"
        }

    try:
        from playwright.async_api import async_playwright

        filename = f"{uuid.uuid4()}.png"
        image_path = os.path.join(SCREENSHOT_DIR, filename)

        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)

            page = await browser.new_page()

            await page.goto(
                url,
                wait_until="domcontentloaded",
                timeout=10000
            )

            await page.screenshot(
                path=image_path,
                full_page=True
            )

            await browser.close()

            return {
                "available": True,
                "imagePath": image_path,
                "error": None
            }

    except Exception as e:
        return {
            "available": False,
            "imagePath": None,
            "error": str(e)
        }