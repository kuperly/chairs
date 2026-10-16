// Shows what the captured API responses look like, so the key lists in
// extract.mjs can be adjusted to the real field names.
import fs from 'node:fs';
import path from 'node:path';
import { DATA } from './common.mjs';
import { loadDeals } from './extract.mjs';

const dir = path.join(DATA, 'raw');
const urls = new Map();
for (const f of fs.readdirSync(dir)) {
  const { url, body } = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const key = url.split('?')[0];
  if (!urls.has(key)) urls.set(key, body);
}
console.log(`Distinct JSON endpoints: ${urls.size}`);
for (const [url, body] of urls) {
  console.log(`\n=== ${url}`);
  console.log(JSON.stringify(body, null, 1).slice(0, 1500));
}
const deals = loadDeals();
console.log(`\nDeals detected: ${deals.length}. Sample:`);
console.log(deals.slice(0, 3));
