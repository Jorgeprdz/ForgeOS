import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';

const path = 'app.js';
let source = readFileSync(path, 'utf8');

const import040 = "import { bindCartera040RelationshipMemory } from './advisor-os/cartera/cartera-040d-relationship-memory-enhancement.js';";
const import050 = "import { bindCartera050FutureRadar } from './advisor-os/cartera/cartera-050d-future-radar-enhancement.js';";
assert.ok(source.includes(import040), 'CARTERA050_IMPORT_ANCHOR_MISSING');
if (!source.includes(import050)) {
  source = source.replace(import040, `${import040}\n${import050}`);
}

const call040 = '    bindCartera040RelationshipMemory();';
const call050 = '    bindCartera050FutureRadar();';
assert.ok(source.includes(call040), 'CARTERA050_BIND_ANCHOR_MISSING');
if (!source.includes(call050)) {
  source = source.replace(call040, `${call040}\n${call050}`);
}

const binder = source.match(/function bindCarteraProductEvents\(\) \{([\s\S]*?)\n\}/)?.[1] || '';
const i030 = binder.indexOf('bindCartera030dPolicyPaymentCalendar');
const i040 = binder.indexOf('bindCartera040RelationshipMemory');
const i050 = binder.indexOf('bindCartera050FutureRadar');
const route = binder.indexOf('bindCarteraEvents');
assert.ok(i030 >= 0 && i030 < i040 && i040 < i050 && i050 < route, 'CARTERA050_BIND_ORDER_INVALID');

writeFileSync(path, source);
console.log('CARTERA_050ABCD_APP_MATERIALIZATION=PASS');
