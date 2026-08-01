import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

const runnerPath = 'scripts/ci/cartera-030b-remote-acceptance.mjs';
const sqlPath = 'scripts/ci/cartera-030b-remote-acceptance.sql';

test('remote runner is pinned to the exact 030B foundation and project', async () => {
  const source = await read(runnerPath);
  assert.match(source, /23b52fc7a442f52494c51fead67699004923c547/);
  assert.match(source, /rmlxigxysujsuwzgoimv/);
  assert.match(source, /YES:CARTERA_030B_REMOTE_MUTATION/);
  assert.match(source, /run\/cartera-030b-pgcrypto-repair-v2-20260731-2028/);
});

test('remote deployment is limited to migrations 00250 and 00251', async () => {
  const source = await read(runnerPath);
  assert.match(source, /20260731000250/);
  assert.match(source, /20260731000251/);
  assert.doesNotMatch(source, /2026073100025[2-9]/);
});

test('transactional acceptance always rolls fixtures back', async () => {
  const sql = await read(sqlPath);
  assert.match(sql, /^begin;/);
  assert.match(sql, /rollback;\s*select\s+'PASS CARTERA030B_TRANSACTIONAL_ACCEPTANCE'/is);
  assert.doesNotMatch(sql, /\bcommit\s*;/i);
});

test('acceptance tests durable conflicts, RLS, direct access and sanitized calendar', async () => {
  const sql = await read(sqlPath);
  for (const marker of [
    'CARTERA030B_CHANGED_INPUT_CONFLICT_NOT_DURABLE',
    'CARTERA030B_IDENTITY_COLLISION_CONFLICT_NOT_DURABLE',
    'CARTERA030B_RLS_CROSS_ADVISOR_VISIBLE',
    'CARTERA030B_DIRECT_READ_UNEXPECTEDLY_ALLOWED',
    'CARTERA030B_DIRECT_WRITE_UNEXPECTEDLY_ALLOWED',
    'CARTERA030B_CALENDAR_PRIVACY_LEAK',
    'CARTERA030B_CALENDAR_LAPSE_INFERENCE',
    'CARTERA030B_STATE_VERSION_INVALID',
    'CARTERA030B_APPEND_ONLY',
  ]) {
    assert.match(sql, new RegExp(marker));
  }
});

test('payment reconciliation RPC stays withheld', async () => {
  const source = await read(runnerPath);
  const sql = await read(sqlPath);
  assert.match(source, /reconciliation_rpc_withheld/);
  assert.match(sql, /UNVERIFIED_PAYMENT_RECONCILIATION_RPC_EXPOSED/);
});
