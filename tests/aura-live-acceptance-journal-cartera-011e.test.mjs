import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = path => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

const journal = read('docs/static-preview/forge-aura/pipeline/pipeline-journal-aura-011e.js');
const journalCss = read('docs/static-preview/forge-aura/pipeline/pipeline-journal-aura-011e.css');
const cartera = read('docs/static-preview/forge-aura/cartera/cartera-module-v9.js');
const carteraCss = read('docs/static-preview/forge-aura/cartera/cartera-live-acceptance-011e.css');
const loop = read('docs/static-preview/forge-aura/commercial-loop-011c.js');
const index = read('docs/static-preview/forge-aura/index.html');

assert.match(journal, /forge\.aura\.pipeline\.journal\.011e/);
assert.match(journal, /data-aura-journal-close/);
assert.match(journal, /documentRef\.addEventListener\('click', onDocumentClick, true\)/);
assert.match(journal, /documentRef\.addEventListener\('keydown', onDocumentKeydown, true\)/);
assert.match(journal, /data-aura-journal-retry/);
assert.match(journal, /WRITE_CONFIRMED_TIMELINE_UNVERIFIED/);
assert.match(journal, /Nota guardada · Timeline confirmado\./);
assert.match(journal, /Forge no sustituyó la fuente por notas locales\./);
assert.match(journal, /No pudimos consultar la Bitácora/);
assert.match(journalCss, /\.aura-journal-layer/);
assert.match(journalCss, /max-height:92dvh/);
assert.match(journalCss, /aura-journal-form-actions/);

assert.match(cartera, /humanizeProductReference/);
assert.match(cartera, /items\.length/);
assert.match(cartera, /señal/);
assert.match(cartera, /no equivale a una póliza adicional/);
assert.doesNotMatch(cartera, /mostradas/);
assert.match(cartera, /cartera-policy-row-011e/);
assert.match(cartera, /Ver detalle →/);
assert.match(cartera, /Abrir detalle de la póliza/);
assert.match(carteraCss, /button\.cartera-directory-row/);
assert.match(carteraCss, /-webkit-appearance:none/);
assert.match(carteraCss, /cartera-policy-row-011e/);

assert.match(loop, /pipeline-journal-aura-011e\.js\?v=forge-aura-live-acceptance-journal-cartera-011e/);
assert.match(index, /pipeline-journal-aura-011e\.css/);
assert.match(index, /cartera-live-acceptance-011e\.css/);
assert.match(index, /cartera-module-v9\.js\?v=forge-aura-live-acceptance-journal-cartera-011e/);
assert.match(index, /commercial-loop-011c\.js\?v=forge-aura-live-acceptance-journal-cartera-011e/);

console.log('AURA_LIVE_ACCEPTANCE_011E=PASS');
console.log('JOURNAL_CLOSE_RECOVERY=PASS');
console.log('JOURNAL_TRUTHFUL_DEGRADATION=PASS');
console.log('CARTERA_POLICY_AFFORDANCE=PASS');
console.log('CARTERA_SIGNAL_COUNT_COPY=PASS');
