import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const workflow = readFileSync('.github/workflows/pages.yml', 'utf8');
const html = readFileSync('docs/static-preview/forge-alive/index.html', 'utf8');
const worker = readFileSync('service-worker.js', 'utf8');
assert.match(workflow, /file\.startsWith\('docs\/'\) \? file\.slice\('docs\/'\.length\)/);
assert.match(workflow, /path: _site/);
for (const asset of [
  'forge-alive-pipeline-view-067g16a.css?v=067g16b-1',
  'pipeline-ui.css?v=067g16b-1',
  'forge-alive-pipeline-view-067g16a.js?v=067g16b-1',
]) assert.ok(html.includes(asset));
assert.ok(worker.indexOf('await fetch(req)') < worker.indexOf('return cached'));
assert.ok(!html.includes('serviceWorker.register'));
console.log('067G16B PAGES PUBLICATION AND NETWORK-FIRST CONTRACT: PASS');
