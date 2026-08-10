import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = path => readFileSync(path, 'utf8');

const journal = read('docs/static-preview/forge-aura/pipeline/pipeline-journal-aura-011c.js');
const loopCss = read('docs/static-preview/forge-aura/commercial-loop-011c.css');
const cartera = read('docs/static-preview/forge-aura/cartera/cartera-module-v8.js');
const carteraCss = read('docs/static-preview/forge-aura/cartera/cartera-relational-011a.css');
const auraIndex = read('docs/static-preview/forge-aura/index.html');
const pagesWorkflow = read('.github/workflows/pages.yml');

test('Bitácora failure state is recoverable without inventing local truth', () => {
  assert.match(journal, /data-aura-journal-retry/);
  assert.match(journal, /data-aura-journal-close/);
  assert.match(journal, /Puedes cerrar y seguir usando Pipeline o reintentar/);
  assert.match(journal, /Forge no sustituyó la fuente por notas locales ni marcó nada como guardado/);
  assert.match(journal, /TIMELINE_LINK_MISSING/);
  assert.doesNotMatch(journal, /localStorage\.setItem|indexedDB\.open/);
});

test('Bitácora mobile presentation resets browser-native controls and keeps close reachable', () => {
  assert.match(loopCss, /\.aura-journal-dialog > header\s*\{[\s\S]*position:\s*sticky/);
  assert.match(loopCss, /\[data-aura-journal-dictate\][\s\S]*appearance:\s*none/);
  assert.match(loopCss, /\.aura-journal-recovery__actions/);
});

test('Cartera attention copy counts review topics instead of pretending they are policies', () => {
  assert.match(cartera, /function updateAttentionCopy\(/);
  assert.match(cartera, /temas?'\s*:\s*'temas/);
  assert.match(cartera, /Una misma póliza puede generar varios temas/);
  assert.doesNotMatch(cartera, /mostradas/);
});

test('Cartera related policy is an Aura-style openable detail surface', () => {
  assert.match(cartera, /data-policy-detail-affordance/);
  assert.match(cartera, /Ver detalle/);
  assert.match(cartera, /presentTechnicalProductReference/);
  assert.match(carteraCss, /button\[data-open-policy\]\[data-policy-detail-affordance="012"\]/);
  assert.match(carteraCss, /appearance:none/);
});

test('Hotfix stays on current Cartera runtime and does not revive the stale 016 stack', () => {
  assert.match(auraIndex, /cartera-module-v8\.js/);
  assert.match(auraIndex, /cartera-adapter-pages-v13\.js/);
  assert.doesNotMatch(auraIndex, /cartera-person-workspace-directory-projection-016/);
});

test('Canonical Pages workflow packages the productive Pipeline journal authorities', () => {
  assert.match(pagesWorkflow, /advisor-os\/sales-pipeline\//);
  assert.match(pagesWorkflow, /DEPLOY_FORGE_PAGES/);
  assert.match(pagesWorkflow, /actions\/configure-pages@v5/);
});

test('Acceptance presentation hotfix creates no browser-side business writer', () => {
  assert.doesNotMatch(cartera, /\.insert\s*\(|\.update\s*\(|\.delete\s*\(/);
  assert.doesNotMatch(cartera, /service_role|SUPABASE_SERVICE_ROLE/i);
});
