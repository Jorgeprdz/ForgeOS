import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const uiSource = fs.readFileSync('advisor-os/sales-pipeline/productive-prospect-ui.js', 'utf8');
const pipelineSource = fs.readFileSync('advisor-os/sales-pipeline/pipeline-ui.js', 'utf8');
const css = fs.readFileSync('advisor-os/sales-pipeline/pipeline-ui.css', 'utf8');

test('067G17B2 create entry uses one canonical action for both buttons', () => {
  assert.match(pipelineSource, /class="forge-pipeline-primary" data-add-prospect>\+ Agregar prospecto/);
  assert.match(pipelineSource, /class="forge-pipeline-action" data-add-prospect>Agregar prospecto/);
  assert.match(uiSource, /function openProductiveProspectCreateModal/);
  assert.match(uiSource, /if \(add\) \{/);
  assert.match(uiSource, /openProductiveProspectCreateModal\(\{\}, add\)/);
  assert.match(uiSource, /openForm: openProductiveProspectCreateModal/);
  assert.match(uiSource, /openProductiveProspectCreate: openProductiveProspectCreateModal/);
  assert.match(uiSource, /data-productive-prospect-create-bound/);
});

test('067G17B2 create entry remains idempotent across rerenders and auth transitions', () => {
  assert.match(uiSource, /root\.__forgeProductiveProspectCreateAbort067G17B\?\.abort\(\)/);
  assert.match(uiSource, /root\.__forgeProductiveProspectCreateAbort067G17B = controller/);
  assert.match(uiSource, /signal: controller\.signal/);
  assert.match(uiSource, /const existing = global\.document\.querySelector\("\[data-prospect-form-modal\]"\)/);
  assert.match(uiSource, /return existing/);
  assert.doesNotMatch(uiSource, /setInterval|MutationObserver|onclick=/);
});

test('067G17B2 productive create continues through canonical service only', () => {
  assert.match(uiSource, /ForgeProductiveProspectService067G17B\.create\(client\)/);
  assert.match(uiSource, /service\.createProspect\(input\)/);
  assert.match(uiSource, /service\.updateProspect\(id, input\)/);
  assert.match(uiSource, /service\.archiveProspect\(selected\.id\)/);
  assert.doesNotMatch(uiSource, /localStorage|sessionStorage|DEMO|fixture/i);
});

test('067G17B2 create form and outcome contract remain productive', () => {
  for (const expected of [
    'Nombre completo *',
    'Teléfono',
    'WhatsApp',
    'Correo',
    'Fuente *',
    'Referido por',
    'Relación con el referente',
    'Fecha de nacimiento',
    'Edad',
    'Estado civil',
    'Dependientes',
    'Ocupación',
    'Ingreso estimado',
    'Productos de interés',
    'Contexto inicial *',
    'Próxima acción',
    'Fecha de próxima acción',
    'Guardar prospecto',
  ]) assert.ok(uiSource.includes(expected), `${expected}_MISSING`);
  assert.match(uiSource, /status \|\| "referred_new"/);
  assert.match(uiSource, /Referido nuevo/);
  assert.match(uiSource, /openDetail\(prospect\)/);
});

test('067G17B2 create surface is a body-level canonical modal, not inline Pipeline extension', () => {
  assert.match(uiSource, /data-prospect-form-modal/);
  assert.match(uiSource, /global\.document\.body\.insertAdjacentHTML\("beforeend", formTemplate\(prospect\)\)/);
  assert.match(uiSource, /role="dialog"/);
  assert.match(uiSource, /aria-modal="true"/);
  assert.match(uiSource, /data-prospect-form-scroll/);
  assert.match(uiSource, /global\.document\.documentElement\.dataset\.forgeProspectModalOpen = "true"/);
  assert.match(uiSource, /event\.key === "Escape"/);
  assert.match(uiSource, /event\.key !== "Tab"/);
  assert.match(uiSource, /createTrigger\?\.focus\?/);
  assert.doesNotMatch(uiSource, /root\.insertAdjacentHTML\("beforeend", formTemplate/);
});

test('067G17B2 empty CTA geometry cannot become vertical pill', () => {
  assert.match(css, /\.forge-pipeline>\.forge-pipeline-action/);
  assert.match(css, /grid-area:auto/);
  assert.match(css, /justify-self:center/);
  assert.match(css, /align-self:start/);
  assert.match(css, /display:inline-flex/);
  assert.match(css, /inline-size:auto/);
  assert.match(css, /block-size:auto/);
  assert.match(css, /min-block-size:44px/);
  assert.match(css, /max-inline-size:min\(100%,260px\)/);
  assert.match(css, /flex:0 0 auto/);
  assert.match(css, /writing-mode:horizontal-tb/);
  assert.match(css, /aspect-ratio:auto/);
});
