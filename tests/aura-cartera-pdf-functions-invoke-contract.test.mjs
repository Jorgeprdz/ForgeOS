import assert from 'node:assert/strict';
import fs from 'node:fs';

const adapter = fs.readFileSync('docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v2.js', 'utf8');
const index = fs.readFileSync('docs/static-preview/forge-aura/index.html', 'utf8');
const bootstrap = fs.readFileSync('docs/static-preview/forge-aura/aura-bootstrap-v4.js', 'utf8');

assert.match(adapter, /client\.functions\.invoke\(PDF_FUNCTION_NAME, \{ body \}\)/, 'PDF transport must use the authenticated Supabase Functions client');
assert.match(adapter, /cartera-pdf-intake/, 'PDF invoke adapter must target cartera-pdf-intake');
assert.doesNotMatch(adapter, /Authorization:\s*`Bearer/, 'v2 adapter must not manually construct bearer headers');
assert.match(index, /cartera-adapter-pages-v2\.js\?v=aura-cartera-pdf-invoke-003/, 'Aura import map must route Cartera to the v2 PDF adapter');
assert.match(index, /aura-bootstrap-v4\.js\?v=aura-cartera-pdf-invoke-003/, 'Aura bootstrap must be cache-busted for the invoke transport');
assert.match(bootstrap, /app-v4\.js\?v=aura-cartera-pdf-invoke-003/, 'Aura app import must be cache-busted for the invoke transport');

console.log('AURA_CARTERA_PDF_FUNCTIONS_INVOKE_CONTRACT_OK');