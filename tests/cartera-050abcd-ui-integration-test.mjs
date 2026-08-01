import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('050D is mounted after 040D and before canonical Cartera events', async () => {
  const app = await readFile(new URL('../app.js', import.meta.url), 'utf8');
  assert.match(app, /bindCartera050FutureRadar/);
  const binder = app.match(/function bindCarteraProductEvents\(\) \{([\s\S]*?)\n\}/)?.[1] || '';
  const i030 = binder.indexOf('bindCartera030dPolicyPaymentCalendar');
  const i040 = binder.indexOf('bindCartera040RelationshipMemory');
  const i050 = binder.indexOf('bindCartera050FutureRadar');
  const route = binder.indexOf('bindCarteraEvents');
  assert.ok(i030 >= 0 && i030 < i040 && i040 < i050 && i050 < route);
});

test('050D creates a bounded Cartera radar host and keeps execution absent', async () => {
  const source = await readFile(
    new URL('../advisor-os/cartera/cartera-050d-future-radar-enhancement.js', import.meta.url),
    'utf8'
  );
  assert.match(source, /cartera-future-radar-panel/);
  assert.match(source, /automaticContact:\s*false/);
  assert.match(source, /automaticOpportunity:\s*false/);
  assert.match(source, /finalMessageGenerated:\s*false/);
  assert.match(source, /finalPriorityTruth:\s*false/);
  assert.doesNotMatch(source, /window\.open|location\.href|sendMessage|createOpportunity|createTask/);
});
