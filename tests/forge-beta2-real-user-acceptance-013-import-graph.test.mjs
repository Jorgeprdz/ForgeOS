import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = async path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('productive Aura import graph reaches 013 pipeline intent and interpretation owners', async () => {
  const [index, app, bridge, pagesV6, crs10Adapter, crs10Presentation, sharedPresentation] = await Promise.all([
    read('docs/static-preview/forge-aura/index.html'),
    read('docs/static-preview/forge-aura/app-v4-r1.js'),
    read('docs/static-preview/forge-aura/recomposition/pipeline-consumer-bridge-011b.js'),
    read('docs/static-preview/forge-aura/pipeline/pipeline-adapter-pages-v6-013.js'),
    read('docs/static-preview/forge-aura/pipeline/pipeline-crs10-context-adapter-013.js'),
    read('docs/static-preview/forge-aura/recomposition/pipeline-crs10-context-presentation-013.js'),
    read('docs/static-preview/forge-aura/recomposition/human-context-presentation-013.js'),
  ]);

  assert.match(app, /\.\/recomposition\/pipeline-consumer-bridge-008\.js\?v=forge-global-aura-recomposition-008/);
  assert.match(index, /"\.\/recomposition\/pipeline-consumer-bridge-008\.js\?v=forge-global-aura-recomposition-008"\s*:\s*"\.\/recomposition\/pipeline-consumer-bridge-011b\.js/);
  assert.match(bridge, /pipeline-adapter-pages-v6-013\.js/);
  assert.match(bridge, /pipeline-conversation-workspace-013\.js/);
  assert.doesNotMatch(bridge, /pipeline-adapter-pages-v5\.js/);
  assert.doesNotMatch(bridge, /pipeline-conversation-workspace\.js\?v=forge-aura-production-entrypoint-hotfix-011b/);

  assert.match(pagesV6, /pipeline-crs10-context-adapter-013\.js/);
  assert.match(pagesV6, /relationshipIntelligenceAvailable/);
  assert.match(pagesV6, /existingCarteraIntelligenceReused/);
  assert.match(crs10Adapter, /pipeline-domain-intelligence-consumer\.js/);
  assert.match(crs10Adapter, /crs-10-existing-relationship-intelligence-service\.js/);
  assert.match(crs10Adapter, /crs-03-pipeline-person-convergence-service\.js/);
  assert.match(crs10Adapter, /relationshipIntelligenceState: 'AVAILABLE'/);
  assert.doesNotMatch(crs10Adapter, /deriveRelationshipFoundationSignals|createFipPack01Foundation|relationshipScore|priorityScore|purchaseProbability/);

  assert.match(crs10Presentation, /human-context-presentation-013\.js/);
  assert.match(crs10Presentation, /humanContextCopy\(item\)/);
  assert.match(crs10Presentation, /humanEvidenceLabel\(item\.evidenceCount\)/);
  assert.match(crs10Presentation, /humanStateLabel\(item\.state/);
  assert.match(crs10Presentation, /item\.deepLink/);
  assert.match(crs10Presentation, /Contexto del asesor/);
  assert.match(sharedPresentation, /summary:\s*text\(summary \|\| whyNow\)/);
  assert.match(sharedPresentation, /uncertainty:\s*text\(uncertainty\)/);
  assert.match(sharedPresentation, /smallestUsefulAction:\s*text\(smallestUsefulAction\)/);
  assert.doesNotMatch(crs10Presentation, /calculateScore|derivePriority|autoContact|autoSend/);
});
