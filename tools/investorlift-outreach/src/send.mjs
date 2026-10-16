// Sends your intro message to each matched wholesaler through the site's own
// contact form. Default: shows each message and waits for you to confirm.
// --auto sends without confirmation, still capped by dailySendLimit with
// random delays. --dry-run only prints the messages.
import fs from 'node:fs';
import path from 'node:path';
import { openBrowser, ask, settings, buybox, readJson, writeJson, DATA, ROOT, randomDelay } from './common.mjs';

const AUTO = process.argv.includes('--auto');
const DRY = process.argv.includes('--dry-run');
const cfg = settings();
const bb = buybox();
const template = fs.readFileSync(path.join(ROOT, 'config/message.txt'), 'utf8');
const wholesalers = readJson(path.join(DATA, 'wholesalers.json'), []);
const logPath = path.join(DATA, 'sent.json');
const sent = readJson(logPath, {});

const today = new Date().toISOString().slice(0, 10);
let sentToday = Object.values(sent).filter((s) => s.date === today && s.status === 'sent').length;

const summary = [
  bb.propertyTypes.join('/'),
  `$${bb.minPrice.toLocaleString()}-$${bb.maxPrice.toLocaleString()}`,
  bb.minBeds ? `${bb.minBeds}+ beds` : '',
].filter(Boolean).join(', ');

const render = (w) => template
  .replace(/{{contact}}/g, String(w.contact || 'there').split(' ')[0])
  .replace(/{{company}}/g, w.company || '')
  .replace(/{{markets}}/g, (w.markets || bb.states.join(', ')).replace(/ \| /g, ' / '))
  .replace(/{{example_address}}/g, w.exampleAddress || 'your recent listing')
  .replace(/{{buybox_summary}}/g, summary);

const queue = wholesalers.filter((w) => !sent[w.key]);
console.log(`${queue.length} wholesalers not yet contacted; sent today: ${sentToday}/${cfg.dailySendLimit}`);

if (DRY) {
  for (const w of queue) console.log(`\n--- ${w.company} (${w.dealCount} deals) ---\n${render(w)}`);
  process.exit(0);
}

const ctx = await openBrowser();
const page = ctx.pages()[0] ?? (await ctx.newPage());
const sel = cfg.selectors;

for (const w of queue) {
  if (sentToday >= cfg.dailySendLimit) { console.log('Daily limit reached.'); break; }
  const target = w.exampleDealUrl || w.sellerUrl;
  if (!target) { console.log(`Skip ${w.company}: no URL`); continue; }
  const msg = render(w);
  console.log(`\n=== ${w.company} (${w.dealCount} matching deals) -> ${target}\n${msg}`);

  try {
    await page.goto(new URL(target, cfg.startUrl).href);
    await page.locator(sel.contactButton).first().click({ timeout: 15000 });
    await page.locator(sel.messageBox).first().fill(msg, { timeout: 15000 });
  } catch (e) {
    console.log(`Could not open the contact form (${e.message.split('\n')[0]}). Fix selectors in config/settings.json.`);
    if (!AUTO && (await ask('Fill it manually and type "s" when sent, Enter to skip: ')) === 's') {
      sent[w.key] = { date: today, status: 'sent', company: w.company, manual: true };
      sentToday++;
      writeJson(logPath, sent);
    }
    continue;
  }

  if (!AUTO) {
    const a = await ask('Send? [y]es / [n]o skip / [q]uit: ');
    if (a === 'q') break;
    if (a !== 'y') { sent[w.key] = { date: today, status: 'skipped', company: w.company }; writeJson(logPath, sent); continue; }
  }
  await page.locator(sel.sendButton).first().click();
  sent[w.key] = { date: today, status: 'sent', company: w.company };
  sentToday++;
  writeJson(logPath, sent);
  console.log('Sent.');
  if (AUTO) await randomDelay(cfg.minDelaySec, cfg.maxDelaySec);
}

await ctx.close();
