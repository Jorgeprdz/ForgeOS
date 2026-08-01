import { readFileSync, writeFileSync } from 'node:fs';

const path = 'app.js';
let source = readFileSync(path, 'utf8');
const importLine = "import { bindCartera080EconomicConnection } from './advisor-os/cartera/cartera-080d-economic-connection-enhancement.js';";
const importAnchor = "import { bindCartera070RelationalActivation } from './advisor-os/cartera/cartera-070d-relational-activation-enhancement.js';";
const bindLine = '    bindCartera080EconomicConnection();';
const bindAnchor = '    bindCartera070RelationalActivation();';

if (!source.includes(importAnchor)) throw new Error('CARTERA080_APP_IMPORT_ANCHOR_MISSING');
if (!source.includes(bindAnchor)) throw new Error('CARTERA080_APP_BIND_ANCHOR_MISSING');

if (!source.includes(importLine)) {
  source = source.replace(importAnchor, `${importAnchor}\n${importLine}`);
}
if (!source.includes(bindLine)) {
  source = source.replace(bindAnchor, `${bindAnchor}\n${bindLine}`);
}

writeFileSync(path, source);
console.log('CARTERA_080D_APP_MATERIALIZATION=PASS');
