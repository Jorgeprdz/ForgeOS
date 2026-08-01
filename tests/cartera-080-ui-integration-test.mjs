import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync('app.js', 'utf8');
const enhancer = readFileSync('advisor-os/cartera/cartera-080d-economic-connection-enhancement.js', 'utf8');

test('080D mounts after 070D and before canonical Cartera events', () => {
  const activation = app.indexOf('bindCartera070RelationalActivation();');
  const economic = app.indexOf('bindCartera080EconomicConnection();');
  const canonical = app.indexOf('return bindCarteraEvents();');
  assert.ok(activation >= 0 && economic > activation && canonical > economic);
});

test('080D only prepares human review and emits no economic mutation', () => {
  assert.match(enhancer, /executionAuthorized: false/);
  assert.match(enhancer, /paymentConfirmed: false/);
  assert.match(enhancer, /ledgerMutation: false/);
  assert.match(enhancer, /commissionCalculated: false/);
  assert.match(enhancer, /gmailRead: false/);
  assert.doesNotMatch(enhancer, /\.insert\(|\.update\(|\.delete\(|gmail\.|sendMessage|calculateCommission/);
});
