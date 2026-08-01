import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const authority = readFileSync(
  'supabase/migrations/20260801000320_cartera100_productivity_observation_authority.sql',
  'utf8'
);
const readModel = readFileSync(
  'supabase/migrations/20260801000321_cartera100_productivity_proof_read.sql',
  'utf8'
);

test('100A observation authority is append-only, owner-scoped and RPC-only', () => {
  assert.match(authority, /create table if not exists public\.cartera100_productivity_observations/i);
  assert.match(authority, /cartera100_observation_append_only/i);
  assert.match(authority, /forge_cartera030b_append_only_guard\(\)/i);
  assert.match(authority, /enable row level security/i);
  assert.match(authority, /force row level security/i);
  assert.match(authority, /using \(advisor_id = auth\.uid\(\)\)/i);
  assert.match(authority, /revoke all on public\.cartera100_productivity_observations from anon, authenticated/i);
  assert.match(authority, /grant execute on function public\.forge_cartera100_record_productivity_observation\(jsonb\)[\s\S]*to authenticated/i);
});

test('100A write command requires explicit digest-bound authorization and idempotency', () => {
  assert.match(authority, /CARTERA100_EXPLICIT_AUTHORIZATION_REQUIRED/);
  assert.match(authority, /forge_cartera030b_digest\(command_payload\)/);
  assert.match(authority, /CARTERA100_AUTHORIZATION_DIGEST_MISMATCH/);
  assert.match(authority, /unique \(advisor_id, idempotency_key\)/i);
  assert.match(authority, /CHANGED_INPUT_REPLAY/);
  assert.match(authority, /humanScoreCreated', false/);
  assert.match(authority, /advisorRankingCreated', false/);
  assert.match(authority, /automaticActionExecuted', false/);
  assert.match(authority, /causalCreditClaimed', false/);
});

test('100B SQL rejects human scoring, sensitive metadata and unsupported silent optimization', () => {
  assert.match(authority, /advisorScore\|productivityScore\|humanScore\|humanWorth/);
  assert.match(authority, /disciplineScore\|motivationScore\|coachabilityScore/);
  assert.match(authority, /bankAccount\|cardNumber\|health\|medicalInformation\|finalMessage/);
  assert.doesNotMatch(authority, /create\s+(or\s+replace\s+)?function[^;]+score/i);
  assert.doesNotMatch(authority, /order\s+by\s+quantity\s+desc[\s\S]{0,100}advisor/i);
});

test('100C proof read model preserves partial instrumentation and missing connections', () => {
  assert.match(readModel, /instrumentation_started_at/);
  assert.match(readModel, /coverage_state_value = 'PARTIAL'/);
  assert.match(readModel, /policyIntakeAutomation', 'NOT_CONNECTED'/);
  assert.match(readModel, /compensationDiscrepancies', 'NOT_CONNECTED'/);
  assert.match(readModel, /activityHours', 'NOT_CONNECTED'/);
  assert.match(readModel, /pipelineConversions', 'NOT_CONNECTED'/);
  assert.doesNotMatch(readModel, /coalesce\([^\n]+activityHours[^\n]+0/i);
});

test('100C composes only existing relationship and payment authorities', () => {
  assert.match(readModel, /public\.cartera040_relationship_memory_entries/);
  assert.match(readModel, /public\.cartera030c_confirmed_payment_events/);
  assert.match(readModel, /public\.cartera030b_expected_payment_obligations/);
  assert.match(readModel, /m\.source_authority = 'CLIENT_CONFIRMED'/);
  assert.match(readModel, /m\.consent_state = 'CONFIRMED'/);
  assert.match(readModel, /e\.confirmed_at::date <= o\.expected_date/);
});

test('100C zero metrics carry explicit scan evidence instead of fabricated emptiness', () => {
  assert.match(readModel, /CARTERA100:SCAN:RELATIONSHIP_REVIEWS/);
  assert.match(readModel, /CARTERA100:SCAN:CONSENTED_REFERRALS/);
  assert.match(readModel, /CARTERA100:SCAN:PROTECTED_PAYMENTS/);
  assert.match(readModel, /case when relationship_review_count = 0 then 'ZERO' else 'KNOWN' end/);
  assert.match(readModel, /case when referral_count = 0 then 'ZERO' else 'KNOWN' end/);
  assert.match(readModel, /case when protected_payment_count = 0 then 'ZERO' else 'KNOWN' end/);
});

test('100D read response locks anti-manipulation and no-execution boundaries', () => {
  for (const boundary of [
    "'humanPerformanceScore', false",
    "'advisorRanking', false",
    "'humanWorthInference', false",
    "'motivationInference', false",
    "'disciplineInference', false",
    "'enforcementRecommendation', false",
    "'silentConsentInference', false",
    "'contactVolumeOptimization', false",
    "'causalityClaimWithoutEvidence', false",
    "'automaticContactExecution', false",
    "'automaticMessageGeneration', false",
    "'automaticTaskCreation', false",
    "'automaticCalendarCreation', false",
    "'automaticOpportunityCreation', false",
    "'advisorFeedbackRequiredForLearning', true",
  ]) assert.ok(readModel.includes(boundary), `missing ${boundary}`);
  assert.match(readModel, /projectionAuthority', 'CARTERA100_PRODUCTIVITY_PROOF_READ_MODEL'/);
  assert.match(readModel, /'readOnly', true/);
});
