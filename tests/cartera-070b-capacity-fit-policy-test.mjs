import test from 'node:test';
import assert from 'node:assert/strict';
import { selectCartera070CapacityFit } from '../platform/experience-engine/cartera-070b-capacity-fit-policy.js';

const cards = [
  { actionReference: 'A', estimatedMinutes: 10 },
  { actionReference: 'B', estimatedMinutes: 25 },
  { actionReference: 'C', estimatedMinutes: 15 },
  { actionReference: 'D', estimatedMinutes: 20 },
];

test('070B fills capacity with a small deterministic set without claiming priority', () => {
  const result = selectCartera070CapacityFit(cards, { availableMinutes: 50, maxCards: 3 });
  assert.deepEqual(result.items.map(item => item.actionReference), ['A', 'B', 'C']);
  assert.equal(result.selectedMinutes, 50);
  assert.equal(result.finalPriorityTruth, false);
  assert.equal(result.highestPriorityWidgetSelected, false);
  assert.equal(result.variableRewardOptimization, false);
});

test('070B consumes NBA-authorized references when connected but does not rank them', () => {
  const result = selectCartera070CapacityFit(cards, {
    availableMinutes: 30,
    maxCards: 2,
    authorizedActionReferences: ['C', 'D'],
  });
  assert.deepEqual(result.items.map(item => item.actionReference), ['C']);
  assert.equal(result.selectionMode, 'NBA_AUTHORIZED_CAPACITY_FIT');
  assert.equal(result.nbaAuthorityState, 'CONNECTED_AUTHORIZED_REFERENCES');
});
