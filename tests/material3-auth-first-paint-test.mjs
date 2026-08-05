import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// Historical test filename. The productive auth surface is Aura Light only.
const builder = await readFile(new URL('../scripts/prepare-material3-auth-entry.mjs', import.meta.url), 'utf8');
const early = await readFile(new URL('../docs/static-preview/forge-alive-material3/early-auth-bootstrap.js', import.meta.url), 'utf8');
const pages = await readFile(new URL('../scripts/build-advisor-presentation-pages-runtime.mjs', import.meta.url), 'utf8');
const authCss = await readFile(new URL('../docs/static-preview/forge-alive-material3/forge-alive-auth-entry-067g17b1.css', import.meta.url), 'utf8');
const authJs = await readFile(new URL('../docs/static-preview/forge-alive-material3/forge-alive-auth-entry-067g17b1.js', import.meta.url), 'utf8');

assert.match(pages, /prepare-material3-auth-entry\.mjs/);
assert.match(builder, /FORGE_AUTH_FIRST_PAINT_FAIL_CLOSED_V1/);
assert.match(builder, /data-forge-auth-boundary="resolving"/);
assert.match(builder, /authenticated-route-guard\.js/);
assert.match(builder, /early-auth-bootstrap\.js/);
assert.match(builder, /Cargando agenda actual/);
assert.match(builder, /Bienvenido a ForgeOS/);
assert.match(builder, /forge-alive-auth-entry-067g17b1\.css/);
assert.match(builder, /data-forge-auth-entry-styles="first-paint"/);
assert.match(builder, /copyFile/);
assert.match(builder, /bulk-import-engine-pages\.js/);
assert.match(builder, /AURA_LIGHT_LOGIN_FIRST_PAINT=PASS/);
assert.match(builder, /AURA_LIGHT_LOGIN_MATERIAL3_DESIGN=PROHIBITED/);
assert.match(builder, /--forge-sys-/);
assert.match(early, /forge-alive-auth-entry-067g17b1\.js/);
assert.match(early, /productive-prospect-bootstrap\.js/);
assert.match(early, /forge-alive-public-config-067g17a1\.js/);
assert.match(authCss, /Forge Aura Light 2026/);
assert.match(authCss, /--aura-brand: #6c3ce8/);
assert.match(authCss, /--aura-canvas: #f7f8fc/);
assert.doesNotMatch(authCss, /--forge-sys-/);
assert.doesNotMatch(authCss, /#f5c75c/i);
assert.match(authJs, /FORGE_AURA_LIGHT_2026_V1/);
assert.match(authJs, /material3DesignUsed: false/);

console.log('AURA_LIGHT_AUTH_FIRST_PAINT_TEST=PASS');
