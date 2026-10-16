// Finds deal-like objects anywhere in the captured JSON, without depending on
// the exact API shape. If fields come out empty, run `npm run inspect` and add
// the real key names to the lists below.
import fs from 'node:fs';
import path from 'node:path';
import { DATA } from './common.mjs';

const KEYS = {
  id: ['id', 'uuid', 'slug', 'propertyId', 'property_id'],
  price: ['price', 'askingPrice', 'asking_price', 'listPrice', 'list_price', 'amount'],
  address: ['address', 'fullAddress', 'full_address', 'street', 'streetAddress', 'address1'],
  city: ['city'],
  state: ['state', 'stateCode', 'state_code'],
  zip: ['zip', 'zipCode', 'zip_code', 'postalCode', 'postal_code'],
  beds: ['beds', 'bedrooms', 'bedroomsCount'],
  baths: ['baths', 'bathrooms'],
  yearBuilt: ['yearBuilt', 'year_built'],
  propertyType: ['propertyType', 'property_type', 'type', 'homeType'],
  url: ['url', 'link', 'permalink', 'publicUrl', 'public_url'],
};
const SELLER_KEYS = ['seller', 'wholesaler', 'company', 'account', 'owner', 'user', 'agent', 'organization', 'team', 'publisher'];
const SELLER_FIELDS = {
  sellerId: ['id', 'uuid', 'slug'],
  company: ['companyName', 'company_name', 'name', 'businessName', 'title'],
  contact: ['firstName', 'first_name', 'fullName', 'full_name', 'contactName', 'name'],
  email: ['email'],
  phone: ['phone', 'phoneNumber', 'phone_number'],
  sellerUrl: ['url', 'website', 'profileUrl', 'profile_url', 'slug'],
};

const pick = (obj, keys) => {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && typeof v !== 'object') return v;
  }
  return '';
};

function looksLikeDeal(o) {
  return pick(o, KEYS.price) !== '' && (pick(o, KEYS.address) !== '' || pick(o, KEYS.city) !== '' || typeof o.address === 'object');
}

function toDeal(o) {
  const addrObj = typeof o.address === 'object' && o.address ? o.address : o.location || {};
  const deal = {};
  for (const [k, keys] of Object.entries(KEYS)) deal[k] = pick(o, keys) || pick(addrObj, keys);
  deal.price = Number(String(deal.price).replace(/[^0-9.]/g, '')) || 0;
  deal.beds = Number(deal.beds) || 0;
  deal.yearBuilt = Number(deal.yearBuilt) || 0;
  deal.state = String(deal.state).toUpperCase();

  const sellerObj = SELLER_KEYS.map((k) => o[k]).find((v) => v && typeof v === 'object');
  for (const [k, keys] of Object.entries(SELLER_FIELDS)) deal[k] = sellerObj ? pick(sellerObj, keys) : '';
  if (!deal.company) deal.company = pick(o, ['companyName', 'company_name', 'sellerName', 'seller_name']);
  return deal;
}

function walk(node, out, depth = 0) {
  if (!node || typeof node !== 'object' || depth > 12) return;
  if (Array.isArray(node)) return node.forEach((n) => walk(n, out, depth + 1));
  if (looksLikeDeal(node)) out.push(toDeal(node));
  for (const v of Object.values(node)) walk(v, out, depth + 1);
}

export function loadDeals() {
  const dir = path.join(DATA, 'raw');
  if (!fs.existsSync(dir)) throw new Error('No data/raw yet - run `npm run collect` first.');
  const deals = [];
  for (const f of fs.readdirSync(dir)) {
    const { body } = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    walk(body, deals);
  }
  const seen = new Map();
  for (const d of deals) seen.set(d.id || `${d.address}|${d.zip}|${d.price}`, d);
  return [...seen.values()];
}
