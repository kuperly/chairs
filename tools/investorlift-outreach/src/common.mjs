import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import readline from 'node:readline/promises';
import { chromium } from 'playwright';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const DATA = path.join(ROOT, 'data');
export const PROFILE = path.join(ROOT, '.profile');
fs.mkdirSync(DATA, { recursive: true });

export const readJson = (p, fallback) =>
  fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : fallback;
export const writeJson = (p, v) => fs.writeFileSync(p, JSON.stringify(v, null, 2));
export const settings = () => readJson(path.join(ROOT, 'config/settings.json'));
export const buybox = () => readJson(path.join(ROOT, 'config/buybox.json'));

// Persistent, headed browser: you log in once by hand, the session is reused.
export async function openBrowser() {
  return chromium.launchPersistentContext(PROFILE, {
    headless: false,
    viewport: { width: 1400, height: 900 },
  });
}

export async function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(question);
  rl.close();
  return answer.trim();
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const randomDelay = (minSec, maxSec) =>
  sleep((minSec + Math.random() * (maxSec - minSec)) * 1000);

export function toCsv(rows) {
  if (!rows.length) return '';
  const cols = Object.keys(rows[0]);
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n');
}
