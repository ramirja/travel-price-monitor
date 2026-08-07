// scrape-price.js
const { chromium } = require('@playwright/test');

const CRUISE_URL = process.env.CRUISE_URL; // stored as GitHub secret, not hardcoded
const WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
const WEBHOOK_SECRET = process.env.N8N_WEBHOOK_SECRET;

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(CRUISE_URL, { waitUntil: 'networkidle', timeout: 60000 });

    // Wait explicitly for the price element — don't trust networkidle alone
    const priceLocator = page.locator('[data-testid="funnel-footer-total-price"]');
    await priceLocator.waitFor({ state: 'visible', timeout: 30000 });

    const rawText = await priceLocator.textContent(); // "$6,913.32 USD"
    const price = parseFloat(rawText.replace(/[^0-9.]/g, ''));

    if (isNaN(price) || price <= 0) {
      throw new Error(`Failed to parse price from text: "${rawText}"`);
    }

    const payload = {
      cruise: 'Royal Caribbean OY07ROM', // adjust to your naming
      cabinType: 'INTERIOR',
      sailingDate: '2027-09-19',
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
    process.exit(1); // non-zero exit = GitHub Action shows red X, you get notified
  } finally {
    await browser.close();
  }
})();