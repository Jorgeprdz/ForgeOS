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

// 011F real-user acceptance: a NETWORK_ERROR must never trap the user in Bitácora.
assert.match(journal, /NETWORK\|FETCH\|TIMEOUT/);
assert.match(journal, /Puedes reintentar sin recargar Forge\./);
assert.match(journal, /documentRef\.documentElement\.dataset\.auraJournalState = 'LOAD_ERROR'/);
assert.match(journal, /data-aura-journal-retry>Reintentar<\/button>/);
assert.match(journal, /data-aura-journal-close>Cerrar<\/button>/);
assert.match(journal, /activeLayer\?\.remove\(\)/);
assert.match(journal, /delete documentRef\.documentElement\.dataset\.auraJournalOpen/);
assert.match(journal, /if \(event\.key !== 'Escape' \|\| !activeLayer\) return;/);
assert.match(journal, /close\(\);/);

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

// 011F regression: MutationObserver normalization must be idempotent.
assert.match(cartera, /function setTextIfChanged\(/);
assert.match(cartera, /setTextIfChanged\(\s*copy,/);
assert.match(cartera, /setTextIfChanged\(counter, counterLabel\)/);
assert.doesNotMatch(cartera, /copy\.textContent\s*=/);
assert.doesNotMatch(cartera, /counter\.textContent\s*=/);
const mountBlock = cartera.match(/async mount\(\) \{([\s\S]*?)\n    \},\n    async reload/);
assert.ok(mountBlock, 'Cartera mount wrapper must remain inspectable');
assert.ok(
  mountBlock[1].indexOf('await base.mount?.()') < mountBlock[1].indexOf('start();'),
  'MutationObserver must start only after the base Cartera mount completes',
);

assert.match(loop, /pipeline-journal-aura-011e\.js\?v=forge-aura-live-acceptance-journal-cartera-011e/);
assert.match(index, /pipeline-journal-aura-011e\.css/);
assert.match(index, /cartera-live-acceptance-011e\.css/);

// 011G real-user recovery: production must request the fixed 011F Cartera asset under a fresh URL.
assert.match(index, /cartera-module-v9\.js\?v=forge-aura-cartera-freeze-cache-cutover-011g/);
assert.doesNotMatch(index, /cartera-module-v9\.js\?v=forge-aura-live-acceptance-journal-cartera-011e/);
assert.match(index, /aura-bootstrap-v4-r1\.js\?v=forge-aura-cartera-freeze-cache-cutover-011g/);

assert.match(index, /commercial-loop-011c\.js\?v=forge-aura-live-acceptance-journal-cartera-011e/);

console.log('AURA_LIVE_ACCEPTANCE_011E=PASS');
console.log('JOURNAL_CLOSE_RECOVERY=PASS');
console.log('JOURNAL_TRUTHFUL_DEGRADATION=PASS');
console.log('JOURNAL_NETWORK_ERROR_ESCAPE_011F=PASS');
console.log('CARTERA_POLICY_AFFORDANCE=PASS');
console.log('CARTERA_SIGNAL_COUNT_COPY=PASS');
console.log('CARTERA_MUTATION_OBSERVER_IDEMPOTENCE_011F=PASS');
console.log('CARTERA_CACHE_CUTOVER_011G=PASS');