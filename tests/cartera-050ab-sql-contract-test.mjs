import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const helpersPath = new URL('../supabase/migrations/20260801000280_cartera050_future_radar_helpers.sql', import.meta.url);
const readPath = new URL('../supabase/migrations/20260801000281_cartera050_future_radar_read.sql', import.meta.url);

test('050A provides deterministic horizon and anniversary helpers only', async () => {
  const sql = await readFile(helpersPath, 'utf8');
  assert.match(sql, /forge_cartera050_horizon/);
  assert.match(sql, /NEXT_7_DAYS/);
  assert.match(sql, /NEXT_30_DAYS/);
  assert.match(sql, /NEXT_90_DAYS/);
  assert.match(sql, /forge_cartera050_next_anniversary/);
  assert.match(sql, /least\(target_day, max_day\)/i);
  assert.doesNotMatch(sql, /risk_score|commission_formula|lapse_probability/i);
});

test('050B read model answers every explainability question and preserves authority boundaries', async () => {
  const sql = await readFile(readPath, 'utf8');
  for (const field of [
    'whyThisPerson',
    'whyNow',
    'evidenceSummary',
    'uncertainty',
    'smallestUsefulAction',
    'advisorConfirmationRequired',
  ]) assert.match(sql, new RegExp(`'${field}'`, 'i'));
  assert.match(sql, /CONFIRMED_FACT/i);
  assert.match(sql, /'SCHEDULED_EVENT'/i);
  assert.match(sql, /'DETECTED_EVIDENCE'/i);
  assert.match(sql, /'INFERENCE'/i);
  assert.match(sql, /'RECOMMENDATION'/i);
  assert.match(sql, /'conservationIntelligence', 'ADAPTER_REQUIRED'/i);
  assert.match(sql, /'compensationIntelligence', 'ADAPTER_REQUIRED'/i);
  assert.match(sql, /'finalPriorityTruth', false/i);
  assert.match(sql, /'lapseInference', false/i);
  assert.match(sql, /'compensationCalculation', false/i);
  assert.doesNotMatch(sql, /source_evidence_references'\s*,|matched_payment_event_references'\s*,/i);
  assert.doesNotMatch(sql, /commission_amount|payout_amount|risk_score|lapse_probability/i);
});

test('050 native signals cover payments, policy dates, incomplete data, reviews and service', async () => {
  const sql = await readFile(readPath, 'utf8');
  for (const signal of [
    'EXPECTED_PAYMENT',
    'POSSIBLE_LATE_PAYMENT',
    'UNCONFIRMED_PAYMENT_EVIDENCE',
    'POLICY_END_OR_RENEWAL_REVIEW',
    'POLICY_YEAR_TRANSITION',
    'INCOMPLETE_POLICY_DATA',
    'RELATIONSHIP_REVIEW_DUE',
    'POLICY_SERVICE_REQUIRED',
  ]) assert.match(sql, new RegExp(signal));
});
