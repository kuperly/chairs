// Opens the marketplace in your logged-in browser and records every JSON
// response the site loads (deals, sellers). Recording the site's own API
// responses is far more stable than scraping the HTML.
import fs from 'node:fs';
import path from 'node:path';
import { openBrowser, ask, settings, DATA, sleep } from './common.mjs';

const cfg = settings();
const rawDir = path.join(DATA, 'raw');
fs.mkdirSync(rawDir, { recursive: true });

const ctx = await openBrowser();
const page = ctx.pages()[0] ?? (await ctx.newPage());
let saved = 0;

page.on('response', async (res) => {
  const type = res.headers()['content-type'] || '';
  if (!type.includes('json') || !/investorlift/i.test(res.url())) return;
  try {
    const body = await res.json();
    const file = path.join(rawDir, `${Date.now()}-${saved++}.json`);
    fs.writeFileSync(file, JSON.stringify({ url: res.url(), body }));
  } catch {}
});

await page.goto(cfg.startUrl);
await ask('Set the marketplace filters you want (state, price...) in the browser, then press Enter to start scrolling... ');

for (let i = 0; i < cfg.maxScrolls; i++) {
  await page.mouse.wheel(0, 2500);
  await sleep(1500 + Math.random() * 1500);
  const more = page.locator('button:has-text("Load more"), button:has-text("Show more")').first();
  if (await more.isVisible().catch(() => false)) await more.click().catch(() => {});
}

await ask(`Captured ${saved} JSON responses. Browse to any other pages you want recorded, then press Enter to finish... `);
await ctx.close();
console.log(`Done: ${saved} responses in data/raw/. Next: npm run inspect / npm run match`);
