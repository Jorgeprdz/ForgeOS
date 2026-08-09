import fs from 'node:fs';

const rateCachePath = new URL('../docs/static-preview/quote-runtime/forge-rate-cache.json', import.meta.url);
const verifiedRateCache = JSON.parse(fs.readFileSync(rateCachePath, 'utf8'));

globalThis.ForgeOrviRateProvider = async () => verifiedRateCache;

try {
  await import('./quote-real-pdf-audit.mjs');
} finally {
  delete globalThis.ForgeOrviRateProvider;
}
