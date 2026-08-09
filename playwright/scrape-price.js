// scrape-price.js
const { chromium } = require('@playwright/test');

const CRUISE_URL = process.env.CRUISE_URL;
const WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
const WEBHOOK_SECRET = process.env.N8N_WEBHOOK_SECRET;

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 900 }
  });

  try {
    await page.goto(CRUISE_URL, { waitUntil: 'networkidle', timeout: 60000 });

    const priceLocator = page.locator('[data-testid="funnel-footer-total-price"]');
    await priceLocator.waitFor({ state: 'visible', timeout: 30000 });

    const rawText = await priceLocator.textContent();
    const price = parseFloat(rawText.replace(/[^0-9.]/g, ''));

    if (isNaN(price) || price <= 0) {
      throw new Error(`Failed to parse price from text: "${rawText}"`);
    }

    const payload = {
      cruise: 'Royal Caribbean OY07ROM',
      cabinType: 'INTERIOR',
      sailingDate: '2027-06-20',
      price: price,
      checkedAt: new Date().toISOString()
    };

    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': WEBHOOK_SECRET
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error(`Webhook returned ${res.status}: ${await res.text()}`);
    }

    console.log(`Success: $${price} sent to n8n`);
  } catch (err) {
    console.error(`Scrape failed: ${err.message}`);
    // Capture evidence before we exit — this is what tells us WHY it failed
    try {
      await page.screenshot({ path: 'failure-screenshot.png', fullPage: true });
      const html = await page.content();
      require('fs').writeFileSync('failure-page.html', html);
      console.log('Saved failure-screenshot.png and failure-page.html');
    } catch (captureErr) {
      console.error(`Also failed to capture debug info: ${captureErr.message}`);
    }
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();