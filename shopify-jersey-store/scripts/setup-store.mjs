#!/usr/bin/env node
// Bootstraps a Shopify store for the jersey shop through the Admin GraphQL API:
// smart collections, pages, add-on products for personalization, navigation menus
// and (optionally) demo products. Safe to re-run: existing items (by handle) are skipped/updated.
//
// Usage:
//   SHOPIFY_STORE=my-store.myshopify.com SHOPIFY_ADMIN_TOKEN=shpat_xxx node scripts/setup-store.mjs [--with-samples] [--dry-run]
// or, for an app created in the Dev Dashboard and installed on your store:
//   SHOPIFY_STORE=... SHOPIFY_CLIENT_ID=... SHOPIFY_CLIENT_SECRET=... node scripts/setup-store.mjs
//
// Required access scopes: write_products, write_publications, write_online_store_pages,
// write_online_store_navigation (read_* is implied by write_*).

import { ADDON_PRODUCTS, ADDON_TYPE, COLLECTIONS, MENUS, PAGES, SAMPLE_PRODUCTS } from './store-structure.mjs';

const STORE = process.env.SHOPIFY_STORE;
const API_VERSION = process.env.SHOPIFY_API_VERSION || '2026-01';
const WITH_SAMPLES = process.argv.includes('--with-samples');
const DRY_RUN = process.argv.includes('--dry-run');

if (!STORE) {
  console.error('Missing SHOPIFY_STORE (e.g. my-store.myshopify.com)');
  process.exit(1);
}

async function getToken() {
  if (process.env.SHOPIFY_ADMIN_TOKEN) return process.env.SHOPIFY_ADMIN_TOKEN;
  const { SHOPIFY_CLIENT_ID: id, SHOPIFY_CLIENT_SECRET: secret } = process.env;
  if (!id || !secret) {
    console.error('Provide SHOPIFY_ADMIN_TOKEN, or SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET.');
    process.exit(1);
  }
  const res = await fetch(`https://${STORE}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'client_credentials', client_id: id, client_secret: secret })
  });
  if (!res.ok) throw new Error(`Token exchange failed: ${res.status} ${await res.text()}`);
  return (await res.json()).access_token;
}

let TOKEN;

async function gql(query, variables = {}) {
  const res = await fetch(`https://${STORE}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': TOKEN },
    body: JSON.stringify({ query, variables })
  });
  if (res.status === 429) {
    await new Promise((r) => setTimeout(r, 2000));
    return gql(query, variables);
  }
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors, null, 2));
  return json.data;
}

/** Throws if a mutation payload returned userErrors. */
function check(payload, label) {
  const errors = payload?.userErrors || [];
  if (errors.length) throw new Error(`${label}: ${errors.map((e) => `${(e.field || []).join('.')} ${e.message}`).join('; ')}`);
  return payload;
}

const log = (...args) => console.log(...args);

/* ---------- Publications ---------- */

async function onlineStorePublicationId() {
  const data = await gql(`{ publications(first: 20) { nodes { id name } } }`);
  const pub = data.publications.nodes.find((p) => p.name === 'Online Store');
  if (!pub) throw new Error('Online Store sales channel not found. Is the Online Store channel installed?');
  return pub.id;
}

async function publish(id, publicationId) {
  if (DRY_RUN) return;
  const data = await gql(
    `mutation($id: ID!, $input: [PublicationInput!]!) {
      publishablePublish(id: $id, input: $input) { userErrors { field message } }
    }`,
    { id, input: [{ publicationId }] }
  );
  check(data.publishablePublish, `publish ${id}`);
}

/* ---------- Collections ---------- */

async function findCollection(handle) {
  const data = await gql(`query($q: String!) { collections(first: 1, query: $q) { nodes { id handle } } }`, { q: `handle:${handle}` });
  return data.collections.nodes.find((n) => n.handle === handle);
}

async function ensureCollections(publicationId) {
  const ids = {};
  for (const col of COLLECTIONS) {
    const existing = await findCollection(col.handle);
    if (existing) {
      ids[col.handle] = existing.id;
      log(`  = collection ${col.handle}`);
      continue;
    }
    if (DRY_RUN) { log(`  + collection ${col.handle} (dry run)`); continue; }
    const data = await gql(
      `mutation($input: CollectionInput!) {
        collectionCreate(input: $input) { collection { id } userErrors { field message } }
      }`,
      {
        input: {
          title: col.title,
          handle: col.handle,
          sortOrder: col.sortOrder || 'BEST_SELLING',
          ruleSet: { appliedDisjunctively: false, rules: col.rules }
        }
      }
    );
    const id = check(data.collectionCreate, `collection ${col.handle}`).collection.id;
    await publish(id, publicationId);
    ids[col.handle] = id;
    log(`  + collection ${col.handle}`);
  }
  return ids;
}

/* ---------- Pages ---------- */

async function ensurePages() {
  const data = await gql(`{ pages(first: 250) { nodes { id handle } } }`);
  const ids = Object.fromEntries(data.pages.nodes.map((p) => [p.handle, p.id]));
  for (const page of PAGES) {
    if (ids[page.handle]) { log(`  = page ${page.handle}`); continue; }
    if (DRY_RUN) { log(`  + page ${page.handle} (dry run)`); continue; }
    const res = await gql(
      `mutation($page: PageCreateInput!) {
        pageCreate(page: $page) { page { id } userErrors { field message } }
      }`,
      { page: { title: page.title, handle: page.handle, body: page.body, templateSuffix: page.templateSuffix, isPublished: true } }
    );
    ids[page.handle] = check(res.pageCreate, `page ${page.handle}`).page.id;
    log(`  + page ${page.handle}`);
  }
  return ids;
}

/* ---------- Products ---------- */

async function findProduct(handle) {
  const data = await gql(`query($q: String!) { products(first: 1, query: $q) { nodes { id handle } } }`, { q: `handle:${handle}` });
  return data.products.nodes.find((n) => n.handle === handle);
}

async function createProduct(input, publicationId) {
  const data = await gql(
    `mutation($input: ProductSetInput!) {
      productSet(input: $input, synchronous: true) { product { id } userErrors { field message } }
    }`,
    { input }
  );
  const id = check(data.productSet, `product ${input.handle || input.title}`).product.id;
  await publish(id, publicationId);
  return id;
}

async function ensureAddons(publicationId) {
  for (const addon of ADDON_PRODUCTS) {
    if (await findProduct(addon.handle)) { log(`  = add-on ${addon.handle}`); continue; }
    if (DRY_RUN) { log(`  + add-on ${addon.handle} (dry run)`); continue; }
    const id = await createProduct(
      {
        title: addon.title,
        handle: addon.handle,
        productType: ADDON_TYPE,
        status: 'ACTIVE',
        tags: ['addon'],
        productOptions: [{ name: 'Title', values: [{ name: 'Default Title' }] }],
        variants: [
          {
            optionValues: [{ optionName: 'Title', name: 'Default Title' }],
            price: addon.price,
            inventoryPolicy: 'CONTINUE',
            inventoryItem: { tracked: false, requiresShipping: false }
          }
        ],
        // Keeps the add-on out of storefront search results and the sitemap.
        metafields: [{ namespace: 'seo', key: 'hidden', type: 'number_integer', value: '1' }]
      },
      publicationId
    );
    log(`  + add-on ${addon.handle} → in the theme editor set "${addon.setting}" to this product (${id})`);
  }
}

function slugify(text, i) {
  const ascii = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `sample-${i + 1}${ascii ? '-' + ascii : ''}`;
}

async function ensureSamples(publicationId) {
  for (const [i, s] of SAMPLE_PRODUCTS.entries()) {
    const handle = slugify(s.vendor + ' ' + s.type, i);
    if (await findProduct(handle)) { log(`  = sample ${handle}`); continue; }
    if (DRY_RUN) { log(`  + sample ${handle} (dry run)`); continue; }
    await createProduct(
      {
        title: s.title,
        handle,
        productType: s.type,
        vendor: s.vendor,
        status: 'ACTIVE',
        tags: s.tags,
        descriptionHtml: '<p>מוצר לדוגמה. החליפו בתמונות ובתיאור אמיתיים.</p><ul><li>בד נושם Dri-Fit</li><li>סמל רקום</li></ul>',
        productOptions: [{ name: 'מידה', values: s.sizes.map((name) => ({ name })) }],
        variants: s.sizes.map((size) => ({
          optionValues: [{ optionName: 'מידה', name: size }],
          price: s.price,
          ...(s.compareAt ? { compareAtPrice: s.compareAt } : {}),
          inventoryPolicy: 'DENY',
          inventoryItem: { tracked: false }
        }))
      },
      publicationId
    );
    log(`  + sample ${handle}`);
  }
}

/* ---------- Menus ---------- */

function menuItems(items, collectionIds, pageIds) {
  return items.map((item) => {
    const out = { title: item.title };
    if (item.collection) {
      if (!collectionIds[item.collection]) throw new Error(`Menu references unknown collection ${item.collection}`);
      Object.assign(out, { type: 'COLLECTION', resourceId: collectionIds[item.collection] });
    } else if (item.page) {
      if (!pageIds[item.page]) throw new Error(`Menu references unknown page ${item.page}`);
      Object.assign(out, { type: 'PAGE', resourceId: pageIds[item.page] });
    } else if (item.url === '/') {
      out.type = 'FRONTPAGE';
    } else {
      Object.assign(out, { type: 'HTTP', url: item.url });
    }
    if (item.items?.length) out.items = menuItems(item.items, collectionIds, pageIds);
    return out;
  });
}

async function ensureMenus(collectionIds, pageIds) {
  const data = await gql(`{ menus(first: 50) { nodes { id handle } } }`);
  const existing = Object.fromEntries(data.menus.nodes.map((m) => [m.handle, m.id]));
  for (const menu of MENUS) {
    if (DRY_RUN) { log(`  ${existing[menu.handle] ? '~' : '+'} menu ${menu.handle} (dry run)`); continue; }
    const items = menuItems(menu.items, collectionIds, pageIds);
    if (existing[menu.handle]) {
      const res = await gql(
        `mutation($id: ID!, $title: String!, $handle: String!, $items: [MenuItemUpdateInput!]!) {
          menuUpdate(id: $id, title: $title, handle: $handle, items: $items) { menu { id } userErrors { field message } }
        }`,
        { id: existing[menu.handle], title: menu.title, handle: menu.handle, items }
      );
      check(res.menuUpdate, `menu ${menu.handle}`);
      log(`  ~ menu ${menu.handle} (replaced)`);
    } else {
      const res = await gql(
        `mutation($title: String!, $handle: String!, $items: [MenuItemCreateInput!]!) {
          menuCreate(title: $title, handle: $handle, items: $items) { menu { id } userErrors { field message } }
        }`,
        { title: menu.title, handle: menu.handle, items }
      );
      check(res.menuCreate, `menu ${menu.handle}`);
      log(`  + menu ${menu.handle}`);
    }
  }
}

/* ---------- Main ---------- */

async function main() {
  TOKEN = await getToken();
  const shop = await gql(`{ shop { name currencyCode } }`);
  log(`Store: ${shop.shop.name} (${shop.shop.currencyCode})${DRY_RUN ? ' — DRY RUN' : ''}`);
  if (shop.shop.currencyCode !== 'ILS') log('  ! Store currency is not ILS. Change it in Settings → Store details before adding products.');

  const publicationId = await onlineStorePublicationId();

  log('Collections');
  const collectionIds = await ensureCollections(publicationId);
  log('Pages');
  const pageIds = await ensurePages();
  log('Add-on products');
  await ensureAddons(publicationId);
  if (WITH_SAMPLES) {
    log('Sample products');
    await ensureSamples(publicationId);
  }
  log('Menus');
  await ensureMenus(collectionIds, pageIds);
  log('Done.');
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
