import test from 'node:test';
import assert from 'node:assert/strict';

import { COMMANDS, getCommandById } from '../platform/commands/command-registry.js';
import { parsearComando } from '../platform/commands/command-parser-engine.js';
import { ejecutarComando } from '../platform/commands/command-execution-engine.js';


test('registry exposes canonical immutable command contracts', () => {
  assert.ok(COMMANDS.length >= 7);
  for (const command of COMMANDS) {
    assert.ok(command.id);
    assert.ok(command.handlerId);
    assert.ok(['NAVIGATION', 'WRITE'].includes(command.intent));
    if (command.intent === 'NAVIGATION') {
      assert.equal(command.handlerId, 'navigate-route');
      assert.equal(command.requiresConfirmation, false);
      assert.ok(command.payload.route);
    } else {
      assert.equal(command.requiresConfirmation, true);
      assert.ok(command.requiresContext.length > 0);
    }
  }
  assert.equal(getCommandById('open-cartera')?.payload.route, 'cartera');
});

test('parser returns canonical hint types', () => {
  assert.equal(parsearComando({ input: '/cartera' }).type, 'EXPLICIT_COMMAND_HINT');
  assert.equal(parsearComando({ input: '@mariana' }).type, 'ENTITY_HINT');
  assert.equal(parsearComando({ input: 'abrir cartera' }).type, 'NATURAL_LANGUAGE_OR_SEARCH');
  assert.equal(parsearComando({ input: '   ' }).type, 'UNKNOWN');
});

test('executor rejects unavailable and unknown commands and fails closed for unbound writes', async () => {
  assert.equal((await ejecutarComando({ command: null })).reason, 'COMMAND_UNAVAILABLE');
  assert.equal((await ejecutarComando({ command: { availability: 'enabled', intent: 'READ', handlerId: 'missing' } })).reason, 'HANDLER_NOT_FOUND');
  assert.equal((await ejecutarComando({
    command: {
      id: 'unbound-write',
      label: 'Unbound write',
      availability: 'enabled',
      intent: 'WRITE',
      handlerId: 'missing-write-authority',
      requiresContext: [],
    },
  })).reason, 'WRITE_AUTHORITY_NOT_REGISTERED');
});
