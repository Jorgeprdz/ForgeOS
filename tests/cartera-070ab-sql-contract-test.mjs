import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const helpers = readFileSync('supabase/migrations/20260801000300_cartera070_relational_activation_helpers.sql', 'utf8');
const readModel = readFileSync('supabase/migrations/20260801000301_cartera070_relational_activation_read.sql', 'utf8');

test('070A SQL composes 050 and 060 authorities and all roadmap action classes', () => {
  assert.match(readModel, /forge_cartera050_list_future_radar/);
  assert.match(readModel, /forge_cartera060_list_relationship_growth_reviews/);
  for (const value of [
    'CONFIRM_PAYMENT', 'PREPARE_RENEWAL', 'SCHEDULE_REVIEW', 'RESOLVE_MISSING_CONTEXT',
    'REQUEST_DOCUMENTATION', 'RECOVER_RELATIONSHIP', 'REVIEW_SECOND_POLICY',
    'STRENGTHEN_CENTER_OF_INFLUENCE', 'THANK_REFERRER', 'COMPLETE_SERVICE_COMMITMENT',
  ]) assert.match(readModel, new RegExp(value));
  assert.match(helpers, /extensions\.digest/);
});

test('070B SQL names display order as capacity fit and blocks NBA/engagement authority', () => {
  assert.match(readModel, /CAPACITY_FIT_DISPLAY_ORDER_NOT_FINAL_PRIORITY/);
  assert.match(readModel, /'finalNbaPriorityTruth', false/);
  assert.match(readModel, /'variableRewardOptimization', false/);
  assert.match(readModel, /'artificialActivityInflation', false/);
  assert.match(readModel, /'automaticContactExecution', false/);
  assert.match(readModel, /'automaticOpportunityCreation', false/);
});
