import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = async path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('productive Aura import graph reaches 013 pipeline intent and interpretation owners', async () => {
  const [index, app, bridge] = await Promise.all([
    read('docs/static-preview/forge-aura/index.html'),
    read('docs/static-preview/forge-aura/app-v4-r1.js'),
    read('docs/static-preview/forge-aura/recomposition/pipeline-consumer-bridge-011b.js'),
  ]);

  assert.match(app, /\.\/recomposition\/pipeline-consumer-bridge-008\.js\?v=forge-global-aura-recomposition-008/);
  assert.match(
    index,
    /"\.\/recomposition\/pipeline-consumer-bridge-008\.js\?v=forge-global-aura-recomposition-008"\s*:\s*"\.\/recomposition\/pipeline-consumer-bridge-011b\.js/,
  );
  assert.match(bridge, /pipeline-adapter-pages-v6-013\.js/);
  assert.match(bridge, /pipeline-conversation-workspace-013\.js/);
  assert.doesNotMatch(bridge, /pipeline-adapter-pages-v5\.js/);
  assert.doesNotMatch(bridge, /pipeline-conversation-workspace\.js\?v=forge-aura-production-entrypoint-hotfix-011b/);
});
