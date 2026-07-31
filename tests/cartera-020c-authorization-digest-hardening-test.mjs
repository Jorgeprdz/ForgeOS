import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

import { createPersistentConfirmationOrchestrationService } from '../advisor-os/cartera/persistent-confirmation-orchestration-service.js';

const advisorId = '11111111-1111-4111-8111-111111111111';
const migration = readFileSync(
  new URL('../supabase/migrations/20260731000238_cartera020c_authorization_digest_hardening.sql', import.meta.url),
  'utf8'
);

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (!value || typeof value !== 'object') return value;
  return Object.keys(value).sort().reduce((output, key) => {
    output[key] = stable(value[key]);
    return output;
  }, {});
}

function sha256(value) {
  return createHash('sha256').update(JSON.stringify(stable(value))).digest('hex');
}

function identityBatch() {
  return {
    contractType: 'FORGE_CARTERA_020C_IDENTITY_COMMAND_BATCH',
    contractVersion: 'CARTERA-020C.2',
    reviewReference: 'review/020c/digest/1',
    packetReference: 'packet/020c/digest/1',
    advisorId,
    actorReference: advisorId,
    commands: [{
      candidateReference: 'identity/candidate/digest/1',
      outcome: 'CREATE_CONFIRMED',
      expectedPersonReference: 'person/digest/1',
      command: {
        contractType: 'FORGE_IDENTITY_RESOLUTION_COMMAND',
        contractVersion: 'CARTERA-010B.1',
        advisorId,
        actorReference: advisorId,
        idempotencyKey: 'C020C:DIGEST:IDENTITY:1',
        commandDigest: 'a'.repeat(64),
        sourceIdentity: {
          sourceDomain: 'CARTERA_EVIDENCE',
          sourceIdentityType: 'POLICY_PACKET_IDENTITY_CANDIDATE',
          sourceRecordReference: 'identity/candidate/digest/1',
          prospectReference: null,
        },
      },
    }],
    accountDecisions: [],
    invocationOrder: ['IDENTITY_RESOLUTION'],
    createsTruth: false,
    invokesRemoteCommand: false,
    requiresExplicitExecution: true,
  };
}

test('service binds explicit Identity authorization to canonical SHA-256 of exact batch', async () => {
  const calls = [];
  const client = {
    auth: { async getUser() { return { data: { user: { id: advisorId } }, error: null }; } },
    async rpc(name, args) {
      calls.push({ name, args });
      return { data: { reviewReference: 'review/020c/digest/1', state: 'IDENTITY_READY', stateVersion: 1 }, error: null };
    },
  };
  const service = createPersistentConfirmationOrchestrationService({
    client,
    clock: () => '2026-07-31T22:45:00.000Z',
  });
  const batch = identityBatch();
  await service.prepareIdentity({
    identityBatch: batch,
    idempotencyKey: 'C020C:DIGEST:REQUEST:1',
  });
  const request = calls[0].args.p_request;
  assert.equal(request.authorization.payloadDigest, sha256(batch));
  assert.equal(request.authorization.payloadDigest.length, 64);
});

test('authorization digest is stable across object key insertion order and Unicode values', () => {
  const left = { z: 'Ána', nested: { beta: 2, alpha: 'ñ' }, list: [3, { y: true, x: null }] };
  const right = { list: [3, { x: null, y: true }], nested: { alpha: 'ñ', beta: 2 }, z: 'Ána' };
  assert.equal(sha256(left), sha256(right));
});

test('hardening wraps both public authorization RPCs and revokes unbound execution', () => {
  assert.match(migration, /forge_cartera020c_stable_json_text/);
  assert.match(migration, /forge_cartera020c_authorization_digest/);
  assert.match(migration, /digest\([\s\S]*convert_to\([\s\S]*'UTF8'/);
  assert.match(migration, /CARTERA020C_IDENTITY_AUTHORIZATION_DIGEST_MISMATCH/);
  assert.match(migration, /CARTERA020C_POLICY_AUTHORIZATION_DIGEST_MISMATCH/);
  assert.match(migration, /prepare_identity_orchestration_unbound/);
  assert.match(migration, /attach_policy_confirmation_unbound/);
  assert.match(migration, /revoke all on function public\.forge_cartera020c_prepare_identity_orchestration_unbound/);
  assert.match(migration, /revoke all on function public\.forge_cartera020c_attach_policy_confirmation_unbound/);
  assert.match(migration, /grant execute on function public\.forge_cartera020c_prepare_identity_orchestration\(jsonb\)/);
  assert.match(migration, /grant execute on function public\.forge_cartera020c_attach_policy_confirmation\(jsonb\)/);
});

test('hardening migration remains repository-only and transactional', () => {
  assert.match(migration, /NOT remote deployment authorization/);
  assert.match(migration, /^begin;/m);
  assert.match(migration, /commit;\s*$/);
});


test('PL/pgSQL orchestration migrations avoid reserved authorization identifiers', () => {
  const paths = [
    '../supabase/migrations/20260731000233_cartera020c_prepare_identity_orchestration_rpc.sql',
    '../supabase/migrations/20260731000234_cartera020c_attach_policy_confirmation_rpc.sql',
    '../supabase/migrations/20260731000238_cartera020c_authorization_digest_hardening.sql',
  ];
  for (const path of paths) {
    const sql = readFileSync(new URL(path, import.meta.url), 'utf8');
    assert.doesNotMatch(sql, /^\s*authorization\s+jsonb\b/m);
    assert.doesNotMatch(sql, /^\s*authorization\s*:=/m);
    assert.match(sql, /authorization_payload/);
  }
});
