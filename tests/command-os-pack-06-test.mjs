import test from 'node:test';
import assert from 'node:assert/strict';

import { getCommandById } from '../platform/commands/command-registry.js';
import {
  cancelarComandoEscritura,
  confirmarComandoEscritura,
  ejecutarComando,
} from '../platform/commands/command-execution-engine.js';
import {
  clearWriteAuthorities,
  clearWritePreviews,
  confirmWritePreview,
  prepareWritePreview,
  registerWriteAuthority,
} from '../platform/commands/write-preview-engine.js';

const command = getCommandById('record-follow-up');
const context = { personReference: 'person-200', route: 'advisor-sales-pipeline' };

function reset() {
  clearWriteAuthorities();
  clearWritePreviews();
}

test('write command is explicit and confirmation-gated', () => {
  assert.equal(command.intent, 'WRITE');
  assert.equal(command.requiresConfirmation, true);
  assert.deepEqual(command.requiresContext, ['personReference']);
});

test('fails closed without a registered canonical authority', async () => {
  reset();
  const result = await ejecutarComando({ command, context });
  assert.deepEqual(result, { ok: false, reason: 'WRITE_AUTHORITY_NOT_REGISTERED' });
});

test('rejects preview when required context is absent', async () => {
  reset();
  registerWriteAuthority({ handlerId: command.handlerId, execute: async () => ({ ok: true }) });
  const result = await ejecutarComando({ command, context: { route: 'pipeline' } });
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'WRITE_CONTEXT_REQUIRED');
  assert.deepEqual(result.missing, ['personReference']);
});

test('preparation never mutates and confirmation executes exactly once', async () => {
  reset();
  let executions = 0;
  registerWriteAuthority({
    handlerId: command.handlerId,
    prepare: async ({ context: currentContext }) => ({
      summary: 'Registrar seguimiento para person-200',
      changes: { persona: currentContext.personReference, origen: currentContext.route },
      payload: { note: 'Contacto realizado' },
    }),
    execute: async ({ draft }) => {
      executions += 1;
      return { ok: true, receiptId: 'receipt-200', result: draft.payload };
    },
  });

  const preview = await ejecutarComando({ command, context });
  assert.equal(preview.status, 'PREVIEW_REQUIRED');
  assert.equal(preview.requiresExplicitConfirmation, true);
  assert.equal(executions, 0);

  const invalid = await confirmarComandoEscritura({
    previewId: preview.previewId,
    confirmationToken: 'wrong-token',
  });
  assert.equal(invalid.reason, 'WRITE_CONFIRMATION_TOKEN_INVALID');
  assert.equal(executions, 0);

  const receipt = await confirmarComandoEscritura({
    previewId: preview.previewId,
    confirmationToken: preview.confirmationToken,
  });
  assert.equal(receipt.status, 'WRITE_CONFIRMED');
  assert.equal(receipt.receiptId, 'receipt-200');
  assert.equal(executions, 1);

  const replay = await confirmarComandoEscritura({
    previewId: preview.previewId,
    confirmationToken: preview.confirmationToken,
  });
  assert.equal(replay.reason, 'WRITE_PREVIEW_ALREADY_RESOLVED');
  assert.equal(executions, 1);
});

test('cancelled and expired previews cannot execute', async () => {
  reset();
  let executions = 0;
  registerWriteAuthority({
    handlerId: command.handlerId,
    execute: async () => {
      executions += 1;
      return { ok: true };
    },
  });

  const cancelledPreview = await ejecutarComando({ command, context });
  const cancelled = cancelarComandoEscritura({ previewId: cancelledPreview.previewId });
  assert.equal(cancelled.status, 'WRITE_CANCELLED');
  const cancelledConfirm = await confirmarComandoEscritura({
    previewId: cancelledPreview.previewId,
    confirmationToken: cancelledPreview.confirmationToken,
  });
  assert.equal(cancelledConfirm.reason, 'WRITE_PREVIEW_ALREADY_RESOLVED');

  const expiredPreview = await prepareWritePreview({ command, context, now: 100, ttlMs: 1 });
  const expired = await confirmWritePreview({
    previewId: expiredPreview.previewId,
    confirmationToken: expiredPreview.confirmationToken,
    now: 102,
  });
  assert.equal(expired.reason, 'WRITE_PREVIEW_EXPIRED');
  assert.equal(executions, 0);
});
