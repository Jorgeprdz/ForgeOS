import { SupabaseRuntime } from '../../supabase-runtime.js';
import { CARTERA_030C_SHA256 } from './cartera-030c-confirmed-payment-reconciliation-service.js';
import { createCartera100ProductivityProof } from '../../platform/productivity/cartera-100a-productivity-proof-contract.js';
import {
  createCartera100AcceptedRecommendationObservations,
  createCartera100AdvisorFeedbackObservation,
  createCartera100CompletedActionObservation,
  createCartera100GenericProofObservation,
} from '../../platform/productivity/cartera-100b-outcome-learning-boundary.js';

const REFERENCE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$/;
const IDEMPOTENCY_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,159}$/;
const FORBIDDEN_KEYS = new Set([
  'advisorScore',
  'productivityScore',
  'humanScore',
  'humanWorth',
  'advisorWorth',
  'advisorRanking',
  'disciplineScore',
  'motivationScore',
  'coachabilityScore',
  'employmentRecommendation',
  'bankAccount',
  'cardNumber',
  'health',
  'medicalInformation',
  'finalMessage',
]);

function fail(code, cause = null) {
  const error = new Error(code);
  error.code = code;
  if (cause) error.cause = cause;
  throw error;
}

function requiredReference(value, code, pattern = REFERENCE_PATTERN) {
  const normalized = typeof value === 'string' ? value.trim() : '';
  if (!pattern.test(normalized)) fail(code);
  return normalized;
}

function dateString(value, code) {
  const normalized = String(value || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) fail(code);
  const parsed = new Date(`${normalized}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== normalized) fail(code);
  return normalized;
}

function assertSafe(value, path = 'payload') {
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertSafe(item, `${path}[${index}]`));
    return;
  }
  if (!value || typeof value !== 'object') return;
  Object.entries(value).forEach(([key, nested]) => {
    if (FORBIDDEN_KEYS.has(key)) fail('CARTERA100_RESTRICTED_FIELD_EXPOSED', { path: `${path}.${key}` });
    assertSafe(nested, `${path}.${key}`);
  });
}

async function authenticatedUser(client) {
  const result = await client.auth.getUser();
  if (result?.error) fail('CARTERA100_AUTH_LOOKUP_FAILED', result.error);
  if (!result?.data?.user?.id) fail('CARTERA100_AUTH_REQUIRED');
  return result.data.user;
}

function normalizeObservation(input = {}) {
  assertSafe(input);
  const command = {
    metricKey: String(input.metricKey || '').trim().toUpperCase(),
    metricCategory: String(input.metricCategory || '').trim().toUpperCase(),
    quantity: Number(input.quantity),
    unit: String(input.unit || '').trim().toUpperCase(),
    currency: input.currency ? String(input.currency).trim().toUpperCase() : null,
    metricState: String(input.metricState || '').trim().toUpperCase(),
    sourceAuthority: String(input.sourceAuthority || '').trim().toUpperCase(),
    sourceRecordReference: requiredReference(
      input.sourceRecordReference,
      'CARTERA100_SOURCE_RECORD_REFERENCE_INVALID'
    ),
    recommendationReference: input.recommendationReference
      ? requiredReference(input.recommendationReference, 'CARTERA100_RECOMMENDATION_REFERENCE_INVALID')
      : null,
    outcomeReference: input.outcomeReference
      ? requiredReference(input.outcomeReference, 'CARTERA100_OUTCOME_REFERENCE_INVALID')
      : null,
    attributionState: String(input.attributionState || 'NONE').trim().toUpperCase(),
    usefulnessFeedback: String(input.usefulnessFeedback || 'UNSET').trim().toUpperCase(),
    evidenceReferences: Array.isArray(input.evidenceReferences)
      ? input.evidenceReferences.map(reference => requiredReference(
        reference,
        'CARTERA100_EVIDENCE_REFERENCE_INVALID'
      ))
      : [],
    occurredAt: new Date(input.occurredAt).toISOString(),
    idempotencyKey: requiredReference(
      input.idempotencyKey,
      'CARTERA100_IDEMPOTENCY_KEY_INVALID',
      IDEMPOTENCY_PATTERN
    ),
    metadata: input.metadata && typeof input.metadata === 'object' && !Array.isArray(input.metadata)
      ? { ...input.metadata }
      : {},
  };

  if (!command.metricKey || !command.metricCategory || !command.unit || !command.metricState
    || !command.sourceAuthority || !Number.isFinite(command.quantity) || command.quantity < 0
    || command.evidenceReferences.length < 1 || command.evidenceReferences.length > 20) {
    fail('CARTERA100_OBSERVATION_INVALID');
  }
  if (new Set(command.evidenceReferences).size !== command.evidenceReferences.length) {
    fail('CARTERA100_EVIDENCE_REFERENCE_DUPLICATED');
  }
  if (command.metricState === 'ZERO' && command.quantity !== 0) {
    fail('CARTERA100_ZERO_OBSERVATION_INVALID');
  }
  if (command.unit === 'CURRENCY' && !command.currency) {
    fail('CARTERA100_CURRENCY_REQUIRED');
  }
  if (command.unit !== 'CURRENCY') command.currency = null;
  assertSafe(command.metadata, 'metadata');
  return Object.freeze(command);
}

export function createCartera100ProductivityProofService({ client } = {}) {
  const resolvedClient = client || SupabaseRuntime.getClient();
  if (!resolvedClient?.auth?.getUser || !resolvedClient?.rpc) {
    fail('CARTERA100_SUPABASE_CLIENT_INVALID');
  }

  async function recordOne(input) {
    await authenticatedUser(resolvedClient);
    const command = normalizeObservation(input);
    const payloadDigest = await CARTERA_030C_SHA256(command);
    const result = await resolvedClient.rpc(
      'forge_cartera100_record_productivity_observation',
      {
        p_payload: {
          ...command,
          authorization: {
            authorized: true,
            payloadDigest,
          },
        },
      }
    );
    if (result?.error) fail('CARTERA100_OBSERVATION_WRITE_FAILED', result.error);
    if (!result?.data || typeof result.data !== 'object') {
      fail('CARTERA100_OBSERVATION_RESPONSE_INVALID');
    }
    assertSafe(result.data);
    return Object.freeze({ ...result.data });
  }

  return Object.freeze({
    async loadProductivityProof({
      startDate = new Date().toISOString().slice(0, 7) + '-01',
      endDate = new Date().toISOString().slice(0, 10),
      limit = 250,
    } = {}) {
      await authenticatedUser(resolvedClient);
      const start = dateString(startDate, 'CARTERA100_PERIOD_START_INVALID');
      const end = dateString(endDate, 'CARTERA100_PERIOD_END_INVALID');
      const boundedLimit = Number(limit);
      if (start > end || !Number.isInteger(boundedLimit) || boundedLimit < 1 || boundedLimit > 500) {
        fail('CARTERA100_PROOF_QUERY_INVALID');
      }
      const result = await resolvedClient.rpc('forge_cartera100_list_productivity_proof', {
        p_payload: { startDate: start, endDate: end, limit: boundedLimit },
      });
      if (result?.error) fail('CARTERA100_PROOF_READ_FAILED', result.error);
      if (!result?.data || typeof result.data !== 'object') fail('CARTERA100_PROOF_RESPONSE_INVALID');
      const { boundaries: responseBoundaries, ...safeResponse } = result.data;
      assertSafe(safeResponse);
      return createCartera100ProductivityProof({ ...safeResponse, boundaries: responseBoundaries });
    },

    async recordObservation(input) {
      return recordOne(input);
    },

    async recordAcceptedRecommendation(input) {
      const observations = createCartera100AcceptedRecommendationObservations(input);
      const receipts = [];
      for (const observation of observations) receipts.push(await recordOne(observation));
      return Object.freeze(receipts);
    },

    async recordCompletedAction(input) {
      return recordOne(createCartera100CompletedActionObservation(input));
    },

    async recordAdvisorFeedback(input) {
      return recordOne(createCartera100AdvisorFeedbackObservation(input));
    },

    async recordGenericProof(input) {
      return recordOne(createCartera100GenericProofObservation(input));
    },
  });
}
