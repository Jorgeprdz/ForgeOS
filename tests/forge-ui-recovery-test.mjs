import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');

test('recovery stylesheet is loaded from the canonical public shell', async () => {
  const [legacy, css] = await Promise.all([
    read('docs/static-preview/forge-alive-material3/legacy-ui-retirement.js'),
    read('docs/static-preview/forge-alive-material3/forge-ui-recovery.css'),
  ]);

  assert.match(legacy, /forge-ui-recovery\.css\?v=forge-ui-recovery-001/);
  assert.match(legacy, /dataset\.forgeUiRecoveryStyles/);
  assert.match(legacy, /MutationObserver\(keepRecoveryLast\)/);
  assert.match(css, /Forge UI Recovery \+ Editorial Type/);
});

test('Pages versions the recovery loader against the deployed SHA', async () => {
  const [builder, versioner] = await Promise.all([
    read('scripts/build-advisor-presentation-pages-runtime.mjs'),
    read('scripts/forge-ui-recovery-cache-versioning.mjs'),
  ]);
  assert.match(builder, /forge-ui-recovery-cache-versioning\.mjs/);
  assert.match(versioner, /process\.env\.GITHUB_SHA/);
  assert.match(versioner, /legacy-ui-retirement\.js/);
  assert.match(versioner, /FORGE_UI_RECOVERY_LOADER_VERSIONING_FAILED/);
});

test('every productive route spans the full 12-column workspace', async () => {
  const css = await read('docs/static-preview/forge-alive-material3/forge-ui-recovery.css');
  assert.match(css, /\.forge-module-viewport > \[data-route-module\]/);
  assert.match(css, /grid-column:\s*1 \/ -1 !important/);
  assert.match(css, /width:\s*100% !important/);
  assert.match(css, /min-width:\s*0 !important/);
  assert.match(css, /justify-self:\s*stretch !important/);
});

test('editorial serif is limited to major headings while controls stay sans', async () => {
  const css = await read('docs/static-preview/forge-alive-material3/forge-ui-recovery.css');
  assert.match(css, /--forge-font-display:/);
  assert.match(css, /\.activity-hero h1/);
  assert.match(css, /#cartera-title/);
  assert.match(css, /font-family:\s*var\(--forge-font-display\) !important/);
  assert.match(css, /button,[\s\S]*font-family:\s*var\(--forge-font-ui\) !important/);
});

test('Activity is rebalanced for operational density', async () => {
  const css = await read('docs/static-preview/forge-alive-material3/forge-ui-recovery.css');
  assert.match(css, /\.activity-hero h1,[\s\S]*max-width:\s*21ch !important/);
  assert.match(css, /font-size:\s*clamp\(2\.35rem, 3\.6vw, 4\.25rem\) !important/);
  assert.match(css, /\.activity-status-card,[\s\S]*min-height:\s*82px !important/);
  assert.match(css, /\.activity-period[\s\S]*min-height:\s*36px !important/);
});

test('Cartera preserves data while flattening nested cockpit chrome', async () => {
  const css = await read('docs/static-preview/forge-alive-material3/forge-ui-recovery.css');
  assert.match(css, /:has\(#kpi-total-personas\)/);
  assert.match(css, /\[data-calendar-summary\]/);
  assert.match(css, /\[data-radar-horizon\]/);
  assert.match(css, /border-radius:\s*10px !important/);
  assert.match(css, /background:\s*transparent !important/);
  assert.doesNotMatch(css, /display:\s*none[^;]*;[^}]*data-calendar-summary/);
});

test('floating navigation and safe bottom reservation remain intact', async () => {
  const css = await read('docs/static-preview/forge-alive-material3/forge-ui-recovery.css');
  assert.match(css, /--forge-mobile-nav-height/);
  assert.match(css, /--forge-mobile-nav-clearance/);
  assert.match(css, /--forge-mobile-floating-gap/);
  assert.match(css, /env\(safe-area-inset-bottom\)/);
  assert.doesNotMatch(css, /\.bottom-shell\s*\{[^}]*position:\s*(static|relative)/s);
});
