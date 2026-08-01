import test from 'node:test';
import assert from 'node:assert/strict';
import { createCartera070RelationalActivationService } from '../advisor-os/cartera/cartera-070c-relational-activation-service.js';

const safeResponse = {
  asOfDate: '2026-08-01', availableMinutes: 60, maxCards: 4,
  selectionMode: 'CAPACITY_FIT_DISPLAY_ORDER_NOT_FINAL_PRIORITY',
  nbaAuthorityState: 'NOT_CONNECTED',
  summary: { totalCandidates: 0 }, items: [],
  boundaries: {
    automaticContactExecution: false, automaticMessageSend: false,
    automaticTaskCreation: false, automaticCalendarCreation: false,
    automaticOpportunityCreation: false, referralRequestExecution: false,
    finalNbaPriorityTruth: false, variableRewardOptimization: false,
    artificialActivityInflation: false, advisorConfirmationRequired: true,
  },
  projectionAuthority: 'CARTERA070_RELATIONAL_ACTIVATION_READ_MODEL', readOnly: true,
};

test('070C service reads one governed RPC and performs no write', async () => {
  const calls = [];
  const client = {
    auth: { getUser: async () => ({ data: { user: { id: 'user-1' } }, error: null }) },
    rpc: async (name, args) => { calls.push([name, args]); return { data: safeResponse, error: null }; },
  };
  const service = createCartera070RelationalActivationService({ client });
  const deck = await service.loadActivationDeck({ availableMinutes: 60, maxCards: 4, asOfDate: '2026-08-01' });
  assert.equal(deck.items.length, 0);
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], 'forge_cartera070_list_relational_activation');
});
