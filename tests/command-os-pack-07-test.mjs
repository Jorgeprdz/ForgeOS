import test from 'node:test';
import assert from 'node:assert/strict';

import { createPersonFollowUpAuthority } from '../platform/commands/person-follow-up-authority.js';

function clientFixture({ links = [{ source_record_reference: 'prospect-1' }] } = {}) {
  return {
    from(table) {
      const state = { table };
      const query = {
        select() { return query; },
        eq(key, value) { state[key] = value; return query; },
        is() { return query; },
        async single() {
          if (table !== 'commercial_people') throw new Error('unexpected single');
          return {
            data: {
              id: 'person-row-1',
              advisor_id: 'advisor-1',
              person_reference: 'person-1',
              display_name: 'Mariana López',
              lifecycle_state: 'CONFIRMED',
              archived_at: null,
            },
            error: null,
          };
        },
        then(resolve) {
          if (table !== 'commercial_source_identity_links') {
            return Promise.resolve({ data: [], error: null }).then(resolve);
          }
          return Promise.resolve({ data: links, error: null }).then(resolve);
        },
      };
      return query;
    },
  };
}

test('prepare creates an explicit tomorrow-at-nine due-action draft', async () => {
  const authority = createPersonFollowUpAuthority({
    clientProvider: () => clientFixture(),
    advisorIdProvider: () => 'advisor-1',
    clock: () => new Date('2026-08-03T02:00:00.000Z'),
  });

  const prepared = await authority.prepare({ context: { personReference: 'person-1' } });
  assert.equal(prepared.ok, true);
  assert.equal(prepared.payload.operation, 'SCHEDULE');
  assert.equal(prepared.payload.prospectReference, 'prospect-1');
  assert.equal(prepared.payload.approvedDisplayName, 'Mariana López');
  assert.equal(prepared.payload.nextActionType, 'FOLLOW_UP');
  assert.match(prepared.payload.nextActionAt, /^2026-08-04T09:00:00\.000Z$/);
});

test('prepare rejects ambiguous prospect ownership', async () => {
  const authority = createPersonFollowUpAuthority({
    clientProvider: () => clientFixture({
      links: [
        { source_record_reference: 'prospect-1' },
        { source_record_reference: 'prospect-2' },
      ],
    }),
    advisorIdProvider: () => 'advisor-1',
  });

  const prepared = await authority.prepare({ context: { personReference: 'person-1' } });
  assert.equal(prepared.ok, false);
  assert.equal(prepared.reason, 'PERSON_HAS_MULTIPLE_ACTIVE_PROSPECTS');
});

test('execute delegates to due-action runtime and returns its mutation receipt', async () => {
  let received = null;
  const authority = createPersonFollowUpAuthority({
    advisorIdProvider: () => 'advisor-1',
    runtimeProvider: advisorId => ({
      async execute(input) {
        received = { advisorId, ...input };
        return {
          localCommitted: true,
          mutation: { mutationId: 'mutation-1', syncState: 'LOCAL_PENDING' },
          record: {
            prospectReference: input.prospectReference,
            nextActionType: input.nextActionType,
            nextActionAt: input.nextActionAt,
          },
        };
      },
    }),
  });

  const result = await authority.execute({
    draft: {
      payload: {
        advisorId: 'advisor-1',
        operation: 'SCHEDULE',
        prospectReference: 'prospect-1',
        approvedDisplayName: 'Mariana López',
        nextActionType: 'FOLLOW_UP',
        nextActionAt: '2026-08-04T09:00:00.000Z',
      },
    },
  });

  assert.equal(result.ok, true);
  assert.equal(result.receiptId, 'mutation-1');
  assert.equal(result.result.localCommitted, true);
  assert.equal(result.result.syncState, 'LOCAL_PENDING');
  assert.equal(received.advisorId, 'advisor-1');
});

test('execute rejects a changed authenticated advisor', async () => {
  const authority = createPersonFollowUpAuthority({
    advisorIdProvider: () => 'advisor-2',
    runtimeProvider: () => { throw new Error('must not run'); },
  });
  const result = await authority.execute({ draft: { payload: { advisorId: 'advisor-1' } } });
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'ADVISOR_CONTEXT_CHANGED');
});
