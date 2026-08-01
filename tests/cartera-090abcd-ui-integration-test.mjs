import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync('app.js', 'utf8');
const enhancer = readFileSync(
  'advisor-os/cartera/cartera-090d-relationship-capital-enhancement.js',
  'utf8'
);

test('090D mounts after 080D and before canonical Cartera events', () => {
  const economic = app.indexOf('bindCartera080EconomicConnection();');
  const capital = app.indexOf('bindCartera090RelationshipCapital();');
  const canonical = app.indexOf('return bindCarteraEvents();');
  assert.ok(economic >= 0 && capital > economic && canonical > capital);
});

test('090D exposes only local human review and no external mutation', () => {
  assert.match(enhancer, /executionAuthorized: false/);
  assert.match(enhancer, /relationshipGraphMutated: false/);
  assert.match(enhancer, /contactExecuted: false/);
  assert.match(enhancer, /messageSent: false/);
  assert.match(enhancer, /taskCreated: false/);
  assert.match(enhancer, /calendarEventCreated: false/);
  assert.match(enhancer, /opportunityCreated: false/);
  assert.match(enhancer, /referralRequested: false/);
  assert.match(enhancer, /finalPriorityTruth: false/);
  assert.doesNotMatch(
    enhancer,
    /\.insert\(|\.update\(|\.delete\(|sendMessage|createTask|createCalendar|createOpportunity|requestReferral/
  );
});
