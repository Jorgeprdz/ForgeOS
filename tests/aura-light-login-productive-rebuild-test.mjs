import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [bootstrap, authEntry, authCss, authority] = await Promise.all([
  readFile(new URL('../advisor-os/sales-pipeline/productive-prospect-bootstrap.js', import.meta.url), 'utf8'),
  readFile(new URL('../docs/static-preview/forge-alive-material3/forge-alive-auth-entry-067g17b1.js', import.meta.url), 'utf8'),
  readFile(new URL('../docs/static-preview/forge-alive-material3/forge-alive-auth-entry-067g17b1.css', import.meta.url), 'utf8'),
  readFile(new URL('../adr/ADR-025 — Aura Light Login Productive Rebuild Execution Authority.txt', import.meta.url), 'utf8'),
]);

assert.match(authority, /MATERIAL_3_DESIGN_ALLOWED=NO/);
assert.match(authority, /AURA_LIGHT_ONLY=YES/);
assert.match(authority, /AURA_LIGHT_IS_SOLE_VISUAL_AUTHORITY=YES/);
assert.match(authority, /Directory Name Disclaimer/);

assert.match(bootstrap, /async function signInWithPassword/);
assert.match(bootstrap, /activeClient\.auth\.signInWithPassword\(\{ email, password \}\)/);
assert.match(bootstrap, /persistSession: true/);
assert.match(bootstrap, /detectSessionInUrl: true/);
assert.doesNotMatch(bootstrap, /localStorage[\s\S]{0,200}password/i);
assert.doesNotMatch(bootstrap, /console\.(?:log|info|debug)\([^\n]*password/i);

assert.match(authEntry, /FORGE_AURA_LIGHT_2026_V1/);
assert.match(authEntry, /data-forge-auth-form/);
assert.match(authEntry, /type="email"/);
assert.match(authEntry, /type="password"/);
assert.match(authEntry, /autocomplete="username"/);
assert.match(authEntry, /autocomplete="current-password"/);
assert.match(authEntry, /startPasswordLogin/);
assert.match(authEntry, /bootstrap\.signInWithPassword\(\{ email, password \}\)/);
assert.match(authEntry, /INVALID_CREDENTIALS/);
assert.match(authEntry, /NETWORK_ERROR/);
assert.match(authEntry, /CONFIG_BLOCKED/);
assert.match(authEntry, /new URL\('\/ForgeOS\/static-preview\/forge-alive\/'/);
assert.match(authEntry, /handlePanelKeydown/);
assert.match(authEntry, /material3DesignUsed: false/);
assert.doesNotMatch(authEntry, /style=/i);
assert.doesNotMatch(authEntry, /localStorage|sessionStorage[\s\S]{0,200}password/i);
assert.doesNotMatch(authEntry, /console\.(?:log|info|debug)\([^\n]*(?:email|password)/i);

for (const required of [
  '--aura-canvas: #f7f8fc',
  '--aura-surface: #ffffff',
  '--aura-brand: #6c3ce8',
  '--aura-text-primary: #11152b',
  '--aura-gradient-brand:',
  '--aura-focus-ring:',
  'min-block-size: 44px',
  '@media (prefers-reduced-motion: reduce)',
  '@media (forced-colors: active)',
]) {
  assert.match(authCss, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
}

for (const prohibited of [
  '--forge-sys-',
  '#f5c75c',
  '#ffe08a',
  'rgba(7, 20, 44',
  'rgba(12, 33, 66',
  'display: none !important',
]) {
  assert.equal(authCss.toLowerCase().includes(prohibited.toLowerCase()), false, `PROHIBITED_AUTH_VISUAL=${prohibited}`);
}

assert.match(authCss, /grid-template-columns: minmax\(0, 1\.12fr\) minmax\(390px, 0\.88fr\)/);
assert.match(authCss, /@media \(max-width: 900px\)/);
assert.match(authCss, /@media \(max-width: 640px\)/);
assert.match(authCss, /min-block-size: 100dvh/);

console.log('AURA_LIGHT_LOGIN_PRODUCTIVE_REBUILD=PASS');
console.log('MATERIAL_3_DESIGN_USAGE=0');
console.log('PRODUCTIVE_EMAIL_PASSWORD_AUTH=CONNECTED');
