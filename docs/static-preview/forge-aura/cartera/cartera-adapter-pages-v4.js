import { createCarteraAdapter as createRetrySafeAdapter } from './cartera-adapter-pages-v3.js?base=aura-cartera-result-state-machine-006';

const RESULT_RPC = 'forge_cartera020b_record_processing_result';
const CLAIM_RPC = 'forge_cartera020b_claim_evidence';
const LEASE_SECONDS = 300;
const STAGES = [
  'classified',
  'extraction_candidate_created',
  'packet_created',
  'confirmation_required',
];

function bindValue(target, property) {
  const value = Reflect.get(target, property, target);
  return typeof value === 'function' ? value.bind(target) : value;
}

function flowToken() {
  if (typeof globalThis.crypto?.randomUUID === 'function') return globalThis.crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function failure(code, cause = null) {
  const error = new Error(code);
  error.code = code;
  if (cause) error.cause = cause;
  return { data: null, error };
}

function copyClassification(result = {}) {
  const out = {};
  for (const key of [
    'documentTypeCandidate',
    'classificationState',
    'classificationConfidence',
    'blockedReason',
    'lastErrorCode',
    'warnings',
  ]) {
    if (Object.prototype.hasOwnProperty.call(result, key)) out[key] = result[key];
  }
  return out;
}

function stageResult(source, evidenceStatus) {
  const common = copyClassification(source);
  const result = {
    ...common,
    evidenceStatus,
    workerState: evidenceStatus === 'confirmation_required' ? 'COMPLETED' : 'AVAILABLE',
  };

  if (evidenceStatus === 'extraction_candidate_created') {
    result.attempt = source.attempt;
    result.candidate = source.candidate;
  }

  if (evidenceStatus === 'packet_created' || evidenceStatus === 'confirmation_required') {
    result.packet = source.packet;
  }

  return result;
}

function stageIdempotencyKey(baseKey, stage, flow) {
  const prefix = String(baseKey || 'AURA:020B:RESULT').trim().slice(0, 72) || 'AURA:020B:RESULT';
  return `${prefix}:${stage}:${flow}`.slice(0, 160);
}

function stageCommand(command, stage, lease, flow) {
  return {
    ...command,
    leaseToken: lease.leaseToken,
    expectedStateVersion: lease.stateVersion,
    idempotencyKey: stageIdempotencyKey(command.idempotencyKey, stage, flow),
    completedAt: new Date().toISOString(),
    result: stageResult(command.result, stage),
  };
}

async function reclaimSameEvidence(client, command) {
  const claimed = await client.rpc(CLAIM_RPC, {
    p_worker_id: command.workerId,
    p_lease_seconds: LEASE_SECONDS,
    p_inbox_reference: command.inboxReference,
  });
  if (claimed?.error) return claimed;
  if (claimed?.data?.status !== 'CLAIMED' || claimed?.data?.inboxReference !== command.inboxReference) {
    return failure('CARTERA020B_EXPECTED_ITEM_NOT_RECLAIMED');
  }
  return claimed;
}

async function recordGovernedStages(client, command, options) {
  const source = command?.result;
  if (!source?.attempt || !source?.candidate || !source?.packet) {
    return failure('CARTERA020B_RESULT_STAGE_INPUT_INVALID');
  }

  const flow = flowToken();
  let lease = {
    leaseToken: command.leaseToken,
    stateVersion: command.expectedStateVersion,
  };
  let recorded = null;

  for (let index = 0; index < STAGES.length; index += 1) {
    const stage = STAGES[index];
    recorded = await client.rpc(RESULT_RPC, {
      p_command: stageCommand(command, stage, lease, flow),
    }, options);
    if (recorded?.error) return recorded;

    if (stage === 'confirmation_required') return recorded;

    const claimed = await reclaimSameEvidence(client, command);
    if (claimed?.error) return claimed;
    lease = {
      leaseToken: claimed.data.leaseToken,
      stateVersion: claimed.data.stateVersion,
    };
  }

  return recorded || failure('CARTERA020B_RESULT_STAGE_SEQUENCE_INCOMPLETE');
}

function clientWithGovernedResultStateMachine(client) {
  return new Proxy(client, {
    get(target, property) {
      if (property !== 'rpc') return bindValue(target, property);

      return async (name, args = {}, options) => {
        if (name !== RESULT_RPC) return target.rpc(name, args, options);

        const command = args?.p_command;
        if (!command || command?.result?.evidenceStatus !== 'confirmation_required') {
          return target.rpc(name, args, options);
        }

        return recordGovernedStages(target, command, options);
      };
    },
  });
}

export async function createCarteraAdapter({ client, windowRef = window } = {}) {
  if (!client) throw new Error('CARTERA_PRODUCTIVE_CLIENT_REQUIRED');

  return createRetrySafeAdapter({
    client: clientWithGovernedResultStateMachine(client),
    windowRef,
  });
}
