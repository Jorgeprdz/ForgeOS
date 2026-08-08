import assert from 'node:assert/strict';
import fs from 'node:fs';

const transport = fs.readFileSync('docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v2.js', 'utf8');
const retry = fs.readFileSync('docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v3.js', 'utf8');
const governed = fs.readFileSync('docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v4.js', 'utf8');
const index = fs.readFileSync('docs/static-preview/forge-aura/index.html', 'utf8');
const bootstrap = fs.readFileSync('docs/static-preview/forge-aura/aura-bootstrap-v4.js', 'utf8');

assert.match(transport, /client\.functions\.invoke\(PDF_FUNCTION_NAME, \{ body \}\)/, 'PDF transport must use the authenticated Supabase Functions client');
assert.match(transport, /cartera-pdf-intake/, 'PDF invoke adapter must target cartera-pdf-intake');
assert.doesNotMatch(transport, /Authorization:\s*`Bearer/, 'v2 adapter must not manually construct bearer headers');
assert.match(retry, /cartera-adapter-pages-v2\.js/, 'retry wrapper must preserve the invoke transport');
assert.match(governed, /cartera-adapter-pages-v3\.js/, 'governed result wrapper must preserve retry + invoke transport');
assert.match(index, /cartera-adapter-pages-v4\.js\?v=aura-cartera-result-state-machine-006/, 'Aura import map must route Cartera through the governed v4 chain');
assert.match(index, /aura-bootstrap-v4\.js\?v=aura-cartera-result-state-machine-006/, 'Aura bootstrap must be cache-busted for the governed chain');
assert.match(bootstrap, /app-v4\.js\?v=aura-cartera-result-state-machine-006/, 'Aura app import must be cache-busted for the governed chain');

console.log('AURA_CARTERA_PDF_FUNCTIONS_INVOKE_CONTRACT_OK');
