import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const builder = await readFile(new URL('../scripts/prepare-canonical-forge-alive-entry.mjs', import.meta.url), 'utf8');
const pagesBuild = await readFile(new URL('../scripts/build-advisor-presentation-pages-runtime.mjs', import.meta.url), 'utf8');

assert.match(pagesBuild, /prepare-canonical-forge-alive-entry\.mjs/);
assert.match(builder, /FORGE_ALIVE_CANONICAL_MATERIAL3_V1/);
assert.match(builder, /<base href="\.\.\/forge-alive-material3\/">/);
assert.match(builder, /window\.location\.replace/);
assert.match(builder, /legacy-retired/);
assert.match(builder, /FORGE_LEGACY_UI_RETIRED/);

console.log('CANONICAL_FORGE_ALIVE_ENTRY_TEST=PASS');
