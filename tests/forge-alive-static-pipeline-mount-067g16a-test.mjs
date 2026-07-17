import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync('docs/static-preview/forge-alive/index.html', 'utf8');
const controller = fs.readFileSync('docs/static-preview/forge-alive/forge-alive-pipeline-view-067g16a.js', 'utf8');
const bridge = fs.readFileSync('docs/static-preview/forge-alive/forge-alive-home-nav-bridge-r16c5k.js', 'utf8');
const root = fs.readFileSync('index.html', 'utf8');

for (const visible of [
    'Muestra segura · solo lectura',
    'Buenos días, Jorge',
    'Mi día · Vista estática segura',
    'Plan de hoy',
    'Seguimiento prioritario',
    'Juan necesita revisión antes de que se enfríe.',
]) assert.ok(html.includes(visible));

assert.ok(html.includes('forge-alive-pipeline-view-067g16a.js?v=067g16a-1'));
assert.ok(html.includes('../../../advisor-os/sales-pipeline/pipeline-ui.css?v=067g16a-1'));
assert.ok(html.includes('data-forge-static-view="pipeline"'));
assert.ok(html.includes('data-forge-static-open-pipeline="true"'));
assert.ok(controller.includes("import '../../../advisor-os/sales-pipeline/pipeline-ui.js'"));
assert.ok(controller.includes('ForgePipelineStageReadModel'));
assert.ok(controller.includes('ForgePipelineUI.renderPipelineUI'));
assert.ok(controller.includes("SUPPORTED_VIEWS = new Set(['inicio', 'pipeline', 'clientes', 'mas', 'alfred', 'reportes'])"));
assert.ok(controller.includes('pipelineMountCount'));
assert.ok(controller.includes("navListenerCount = 1"));
assert.ok(bridge.includes('ForgeAliveStaticView067G16A'));
assert.ok(!controller.includes('setInterval'));
assert.ok(!controller.includes('MutationObserver'));
assert.ok(!controller.includes('localStorage'));
assert.ok(!controller.includes('location.href ='));
assert.ok(root.includes('<script type="module" src="app.js"></script>'));
assert.ok(!root.includes('forge-alive-pipeline-view-067g16a'));

console.log('067G16A FORGE ALIVE STATIC PIPELINE MOUNT CONTRACT: PASS');
