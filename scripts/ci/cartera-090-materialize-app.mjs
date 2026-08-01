import { readFileSync, writeFileSync } from 'node:fs';

const path = 'app.js';
let source = readFileSync(path, 'utf8');
const importAnchor = "import { bindCartera080EconomicConnection } from './advisor-os/cartera/cartera-080d-economic-connection-enhancement.js';";
const importLine = "import { bindCartera090RelationshipCapital } from './advisor-os/cartera/cartera-090d-relationship-capital-enhancement.js';";
const bindAnchor = '    bindCartera080EconomicConnection();';
const bindLine = '    bindCartera090RelationshipCapital();';

if (!source.includes(importAnchor)) throw new Error('CARTERA090_APP_IMPORT_ANCHOR_MISSING');
if (!source.includes(bindAnchor)) throw new Error('CARTERA090_APP_BIND_ANCHOR_MISSING');

if (!source.includes(importLine)) {
  source = source.replace(importAnchor, `${importAnchor}\n${importLine}`);
}
if (!source.includes(bindLine)) {
  source = source.replace(bindAnchor, `${bindAnchor}\n${bindLine}`);
}

writeFileSync(path, source);
console.log('CARTERA_090D_APP_MATERIALIZATION=PASS');
