import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clearEntityProviders,
  registerEntityProvider,
  resolveEntities,
  buildEntityNavigation,
} from '../platform/commands/entity-context-runtime.js';
import {
  registerPersonEntityProvider,
  registerPolicyEntityProvider,
  registerQuoteEntityProvider,
} from '../platform/commands/entity-provider-adapter.js';

test.afterEach(() => clearEntityProviders());

test('entity resolution preserves ambiguity instead of guessing', async () => {
  registerEntityProvider({
    id: 'test.people',
    types: ['PERSON'],
    search: async () => [
      { id: 'PERSON:1', type: 'PERSON', label: 'Mariana López', route: 'persona', locator: { personReference: '1' } },
      { id: 'PERSON:2', type: 'PERSON', label: 'Mariana López', route: 'persona', locator: { personReference: '2' } },
    ],
  });
  const result = await resolveEntities({ query: 'mariana', types: ['PERSON'], context: { route: 'cartera' } });
  assert.equal(result.status, 'AMBIGUOUS');
  assert.equal(result.candidates.length, 2);
});

test('canonical adapters expose person, policy and quote locators', async () => {
  registerPersonEntityProvider({ read: async () => [{ id: 'p1', nombre: 'Juan Pérez', telefono: '5555' }] });
  registerPolicyEntityProvider({ read: async () => [{ id: 'pol1', numeroPoliza: 'ABC123', asegurado: 'Juan Pérez' }] });
  registerQuoteEntityProvider({ read: async () => [{ id: 'q1', productName: 'Vida Mujer', personName: 'Ana' }] });

  const person = await resolveEntities({ query: 'juan', types: ['PERSON'], context: { route: 'pipeline' } });
  const policy = await resolveEntities({ query: 'abc123', types: ['POLICY'], context: { route: 'cartera' } });
  const quote = await resolveEntities({ query: 'vida mujer', types: ['QUOTE'], context: { route: 'quotes' } });

  assert.equal(person.candidates[0].locator.personReference, 'p1');
  assert.deepEqual(policy.candidates[0].locator.sourceIdentity, { type: 'POLICY', reference: 'pol1' });
  assert.deepEqual(quote.candidates[0].locator.sourceIdentity, { type: 'QUOTE', reference: 'q1' });
});

test('entity navigation carries origin and canonical locator', () => {
  const result = buildEntityNavigation({
    route: 'persona',
    params: { section: 'POLICIES' },
    locator: { sourceIdentity: { type: 'POLICY', reference: 'pol1' } },
  }, { route: 'cartera' });
  assert.equal(result.ok, true);
  assert.equal(result.params.origin, 'cartera');
  assert.deepEqual(result.params.sourceIdentity, { type: 'POLICY', reference: 'pol1' });
});
