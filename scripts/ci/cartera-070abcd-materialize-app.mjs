import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';

const path = 'app.js';
let source = readFileSync(path, 'utf8');
const importAnchor = "import { bindCartera060RelationshipGrowth } from './advisor-os/cartera/cartera-060d-relationship-growth-enhancement.js';";
const importLine = "import { bindCartera070RelationalActivation } from './advisor-os/cartera/cartera-070d-relational-activation-enhancement.js';";
const bindAnchor = '    bindCartera060RelationshipGrowth();';
const bindLine = '    bindCartera070RelationalActivation();';

assert.ok(source.includes(importAnchor), 'CARTERA070_IMPORT_ANCHOR_MISSING');
assert.ok(source.includes(bindAnchor), 'CARTERA070_BIND_ANCHOR_MISSING');
assert.ok(!source.includes(importLine), 'CARTERA070_IMPORT_ALREADY_PRESENT');
assert.ok(!source.includes(bindLine), 'CARTERA070_BIND_ALREADY_PRESENT');

source = source.replace(importAnchor, `${importAnchor}\n${importLine}`);
source = source.replace(bindAnchor, `${bindAnchor}\n${bindLine}`);
writeFileSync(path, source);
console.log('CARTERA_070_APP_MATERIALIZATION=PASS');
