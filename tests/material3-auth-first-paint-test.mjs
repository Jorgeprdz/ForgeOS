import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const builder = await readFile(new URL('../scripts/prepare-material3-auth-entry.mjs', import.meta.url), 'utf8');
const early = await readFile(new URL('../docs/static-preview/forge-alive-material3/early-auth-bootstrap.js', import.meta.url), 'utf8');
const pages = await readFile(new URL('../scripts/build-advisor-presentation-pages-runtime.mjs', import.meta.url), 'utf8');

assert.match(pages, /prepare-material3-auth-entry\.mjs/);
assert.match(builder, /FORGE_AUTH_FIRST_PAINT_FAIL_CLOSED_V1/);
assert.match(builder, /data-forge-auth-boundary="resolving"/);
assert.match(builder, /authenticated-route-guard\.js/);
assert.match(builder, /early-auth-bootstrap\.js/);
assert.match(builder, /Cargando agenda actual/);
assert.match(builder, /Bienvenido a ForgeOS/);
assert.match(early, /forge-alive-auth-entry-067g17b1\.js/);
assert.match(early, /productive-prospect-bootstrap\.js/);
assert.match(early, /forge-alive-public-config-067g17a1\.js/);

console.log('MATERIAL3_AUTH_FIRST_PAINT_TEST=PASS');
