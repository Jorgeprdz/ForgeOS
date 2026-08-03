export const NEXT_ACTION_OPERATIONS = Object.freeze([
  'SCHEDULE',
  'RESCHEDULE',
  'COMPLETE',
  'CANCEL',
  'MARK_WAITING',
  'CLOSE_CASE',
]);

export const CASE_RESOLUTIONS = Object.freeze([
  'NEXT_ACTION_SCHEDULED',
  'WAITING_FOR_EXTERNAL_EVENT',
  'CLOSED_WON',
  'CLOSED_NOT_NOW',
  'CLOSED_LOST',
  'DISCARDED',
]);

export const TERMINAL_CASE_RESOLUTIONS = Object.freeze([
  'CLOSED_WON',
  'CLOSED_NOT_NOW',
  'CLOSED_LOST',
  'DISCARDED',
]);

function required(value, code) {
  const normalized = String(value ?? '').trim();
  if (!normalized) throw Object.assign(new TypeError(code), { code });
  return normalized;
}

function validInstant(value, code) {
  const normalized = required(value, code);
  if (Number.isNaN(Date.parse(normalized))) {
    throw Object.assign(new TypeError(code), { code });
  }
  return new Date(normalized).toISOString();
}

export function assertOperation(operation) {
  const normalized = required(operation, 'NEXT_ACTION_OPERATION_REQUIRED').toUpperCase();
  if (!NEXT_ACTION_OPERATIONS.includes(normalized)) {
    throw Object.assign(new TypeError('NEXT_ACTION_OPERATION_INVALID'), { code: 'NEXT_ACTION_OPERATION_INVALID' });
  }
  return normalized;
}

export function assertCaseResolution(resolution) {
  const normalized = required(resolution, 'CASE_RESOLUTION_REQUIRED').toUpperCase();
  if (!CASE_RESOLUTIONS.includes(normalized)) {
    throw Object.assign(new TypeError('CASE_RESOLUTION_INVALID'), { code: 'CASE_RESOLUTION_INVALID' });
  }
  return normalized;
}

export function deriveNextActionTransition(input = {}) {
  const operation = assertOperation(input.operation);
  const base = {
    operation,
    prospectReference: required(input.prospectReference, 'PROSPECT_REFERENCE_REQUIRED'),
    advisorPartitionKey: required(input.advisorPartitionKey, 'ADVISOR_PARTITION_REQUIRED'),
    occurredAt: validInstant(input.occurredAt || new Date().toISOString(), 'OCCURRED_AT_INVALID'),
  };

  if (operation === 'SCHEDULE' || operation === 'RESCHEDULE') {
    return Object.freeze({
      ...base,
      nextActionType: required(input.nextActionType, 'NEXT_ACTION_TYPE_REQUIRED'),
      nextActionAt: validInstant(input.nextActionAt, 'NEXT_ACTION_AT_INVALID'),
      caseResolution: 'NEXT_ACTION_SCHEDULED',
      reason: input.reason ? String(input.reason).trim() : null,
    });
  }

  if (operation === 'COMPLETE') {
    return Object.freeze({
      ...base,
      caseResolution: input.followingResolution
        ? assertCaseResolution(input.followingResolution)
        : null,
      commercialOutcome: null,
      completedActionOnly: true,
    });
  }

  if (operation === 'CANCEL') {
    return Object.freeze({
      ...base,
      caseResolution: input.followingResolution
        ? assertCaseResolution(input.followingResolution)
        : null,
      cancellationReason: required(input.reason, 'CANCELLATION_REASON_REQUIRED'),
    });
  }

  if (operation === 'MARK_WAITING') {
    return Object.freeze({
      ...base,
      caseResolution: 'WAITING_FOR_EXTERNAL_EVENT',
      waitingFor: required(input.waitingFor, 'WAITING_FOR_REQUIRED'),
      expectedAt: input.expectedAt ? validInstant(input.expectedAt, 'EXPECTED_AT_INVALID') : null,
    });
  }

  const resolution = assertCaseResolution(input.resolution);
  if (!TERMINAL_CASE_RESOLUTIONS.includes(resolution)) {
    throw Object.assign(new TypeError('TERMINAL_CASE_RESOLUTION_REQUIRED'), { code: 'TERMINAL_CASE_RESOLUTION_REQUIRED' });
  }
  return Object.freeze({
    ...base,
    caseResolution: resolution,
    closeReason: required(input.reason, 'CASE_CLOSE_REASON_REQUIRED'),
  });
}

export function assertActiveCaseResolved(caseSnapshot = {}) {
  if (caseSnapshot.active !== true) return true;
  const resolution = String(caseSnapshot.caseResolution || '').trim();
  if (!resolution || !CASE_RESOLUTIONS.includes(resolution)) {
    throw Object.assign(new TypeError('ACTIVE_CASE_WITHOUT_RESOLUTION'), { code: 'ACTIVE_CASE_WITHOUT_RESOLUTION' });
  }
  return true;
}
