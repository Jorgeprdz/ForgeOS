import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync('app.js', 'utf8');
const enhancer = readFileSync(
  'advisor-os/cartera/cartera-100d-productivity-proof-enhancement.js',
  'utf8'
);

test('100D mounts after 090D and before canonical Cartera events', () => {
  const capital = app.indexOf('bindCartera090RelationshipCapital();');
  const productivity = app.indexOf('bindCartera100ProductivityProof();');
  const canonical = app.indexOf('return bindCarteraEvents();');
  assert.ok(capital >= 0 && productivity > capital && canonical > productivity);
});

test('100D instruments only explicit advisor-review and completion events', () => {
  assert.match(enhancer, /cartera:relationship-growth-reviewed/);
  assert.match(enhancer, /cartera:relational-activation-reviewed/);
  assert.match(enhancer, /cartera:relationship-capital-reviewed/);
  assert.match(enhancer, /cartera:minimum-useful-action-completed/);
  assert.match(enhancer, /cartera:productivity-proof-observation/);
  assert.doesNotMatch(enhancer, /cartera:relationship-growth-mounted[^\n]+recordAccepted/);
  assert.doesNotMatch(enhancer, /cartera:future-radar-mounted[^\n]+recordAccepted/);
});

test('100D emits no contact, message, task, calendar, opportunity or score authority', () => {
  assert.match(enhancer, /humanScore: false/);
  assert.match(enhancer, /advisorRanking: false/);
  assert.match(enhancer, /enforcement: false/);
  assert.match(enhancer, /automaticContact: false/);
  assert.match(enhancer, /automaticMessage: false/);
  assert.match(enhancer, /automaticTask: false/);
  assert.match(enhancer, /automaticCalendar: false/);
  assert.match(enhancer, /automaticOpportunity: false/);
  assert.doesNotMatch(
    enhancer,
    /sendMessage|createTask|createCalendar|createOpportunity|requestReferral|calcularScoreAsesor/
  );
});

test('100D protects against late reads and scrubs advisor-bound state on cleanup', () => {
  assert.match(enhancer, /const revision = \+\+state\.revision/);
  assert.match(enhancer, /if \(revision !== state\.revision\) return/);
  assert.match(enhancer, /state\.revision \+= 1/);
  assert.match(enhancer, /AppState\.set\('cartera:productivityProof', null\)/);
  assert.match(enhancer, /cartera-productivity-proof-panel/);
});

test('100D feedback requires an explicit clicked recommendation and persists no silence', () => {
  assert.match(enhancer, /data-productivity-feedback/);
  assert.match(enhancer, /recordAdvisorFeedback/);
  assert.match(enhancer, /feedbackButton\.dataset\.productivityFeedback/);
  assert.doesNotMatch(enhancer, /setTimeout\([^)]*recordAdvisorFeedback/);
  assert.doesNotMatch(enhancer, /feedback:\s*'USEFUL'[^\n]+default/i);
});
