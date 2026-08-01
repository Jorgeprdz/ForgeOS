import { readFileSync, writeFileSync } from 'node:fs';

const path = 'app.js';
let source = readFileSync(path, 'utf8');
const importAnchor = "import { bindCartera090RelationshipCapital } from './advisor-os/cartera/cartera-090d-relationship-capital-enhancement.js';";
const importLine = "import { bindCartera100ProductivityProof } from './advisor-os/cartera/cartera-100d-productivity-proof-enhancement.js';";
const bindAnchor = '    bindCartera090RelationshipCapital();';
const bindLine = '    bindCartera100ProductivityProof();';

if (!source.includes(importAnchor)) throw new Error('CARTERA100_APP_IMPORT_ANCHOR_MISSING');
if (!source.includes(bindAnchor)) throw new Error('CARTERA100_APP_BIND_ANCHOR_MISSING');

if (!source.includes(importLine)) {
  source = source.replace(importAnchor, `${importAnchor}\n${importLine}`);
}
if (!source.includes(bindLine)) {
  source = source.replace(bindAnchor, `${bindAnchor}\n${bindLine}`);
}

writeFileSync(path, source);
console.log('CARTERA_100D_APP_MATERIALIZATION=PASS');
