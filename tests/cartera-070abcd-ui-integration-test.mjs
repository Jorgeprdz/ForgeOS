import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync('app.js', 'utf8');
const enhancer = readFileSync('advisor-os/cartera/cartera-070d-relational-activation-enhancement.js', 'utf8');

test('070D mounts after 060D and before canonical Cartera events', () => {
  const growth = app.indexOf('bindCartera060RelationshipGrowth();');
  const activation = app.indexOf('bindCartera070RelationalActivation();');
  const canonical = app.indexOf('return bindCarteraEvents();');
  assert.ok(growth >= 0 && activation > growth && canonical > activation);
});

test('070D product code only prepares local review and emits no external mutation', () => {
  assert.match(enhancer, /executionAuthorized: false/);
  assert.match(enhancer, /messageSent: false/);
  assert.match(enhancer, /taskCreated: false/);
  assert.match(enhancer, /calendarEventCreated: false/);
  assert.match(enhancer, /opportunityCreated: false/);
  assert.doesNotMatch(enhancer, /\.insert\(|\.update\(|\.delete\(|calendar\.create|sendMessage/);
});
