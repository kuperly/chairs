// Filters captured deals by your buy box and groups them by wholesaler.
import fs from 'node:fs';
import path from 'node:path';
import { buybox, DATA, toCsv, writeJson } from './common.mjs';
import { loadDeals } from './extract.mjs';

const bb = buybox();
const lc = (s) => String(s || '').toLowerCase();

function matches(d) {
  if (bb.states.length && !bb.states.includes(d.state)) return false;
  if (bb.cities.length && !bb.cities.map(lc).includes(lc(d.city))) return false;
  if (bb.zips.length && !bb.zips.includes(String(d.zip).slice(0, 5))) return false;
  if (bb.minPrice && d.price < bb.minPrice) return false;
  if (bb.maxPrice && d.price > bb.maxPrice) return false;
  if (bb.minBeds && d.beds && d.beds < bb.minBeds) return false;
  if (bb.minYearBuilt && d.yearBuilt && d.yearBuilt < bb.minYearBuilt) return false;
  if (bb.propertyTypes.length && d.propertyType && !bb.propertyTypes.some((t) => lc(d.propertyType).includes(t))) return false;
  return true;
}

const deals = loadDeals();
const matched = deals.filter(matches);
const byWholesaler = new Map();
for (const d of matched) {
  const key = d.sellerId || d.company || d.email;
  if (!key) continue;
  const w = byWholesaler.get(key) ?? {
    key, company: d.company, contact: d.contact, email: d.email, phone: d.phone,
    sellerUrl: d.sellerUrl, dealCount: 0, markets: new Set(), exampleAddress: d.address, exampleDealUrl: d.url,
  };
  w.dealCount++;
  w.markets.add([d.city, d.state].filter(Boolean).join(', '));
  byWholesaler.set(key, w);
}

const wholesalers = [...byWholesaler.values()]
  .filter((w) => w.dealCount >= (bb.minMatchingDeals || 1))
  .map((w) => ({ ...w, markets: [...w.markets].join(' | ') }))
  .sort((a, b) => b.dealCount - a.dealCount);

writeJson(path.join(DATA, 'wholesalers.json'), wholesalers);
fs.writeFileSync(path.join(DATA, 'wholesalers.csv'), toCsv(wholesalers));
fs.writeFileSync(path.join(DATA, 'matched-deals.csv'), toCsv(matched));
console.log(`Deals: ${deals.length}, in buy box: ${matched.length}, wholesalers: ${wholesalers.length}`);
console.log('Wrote data/wholesalers.csv and data/matched-deals.csv');
