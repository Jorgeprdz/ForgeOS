export const ADVISOR_LIFECYCLE_STATUSES = Object.freeze({
  CANDIDATE: 'candidate',
  PRECONTRACT: 'precontract',
  PRECONTRACT_SIGNED: 'precontract_signed',
  PENDING_ACTIVATION: 'pending_activation',
  CONNECTED_ACTIVE: 'connected_active',
  ADVISOR_DEVELOPMENT: 'advisor_development',
  NEW_PROFESSIONAL: 'new_professional',
  PROFESSIONAL: 'professional',
  INACTIVE: 'inactive',
  TERMINATED: 'terminated',
  UNKNOWN: 'unknown',
});

const KNOWN_STATUSES = Object.freeze(Object.values(ADVISOR_LIFECYCLE_STATUSES));

const PRECONTRACT_STATUSES = new Set([
  ADVISOR_LIFECYCLE_STATUSES.PRECONTRACT,
  ADVISOR_LIFECYCLE_STATUSES.PRECONTRACT_SIGNED,
  ADVISOR_LIFECYCLE_STATUSES.PENDING_ACTIVATION,
]);

const CONNECTED_STATUSES = new Set([
  ADVISOR_LIFECYCLE_STATUSES.CONNECTED_ACTIVE,
  ADVISOR_LIFECYCLE_STATUSES.ADVISOR_DEVELOPMENT,
  ADVISOR_LIFECYCLE_STATUSES.NEW_PROFESSIONAL,
  ADVISOR_LIFECYCLE_STATUSES.PROFESSIONAL,
]);

const OFFICIAL_ADVISOR_STATUSES = new Set([
  ADVISOR_LIFECYCLE_STATUSES.CONNECTED_ACTIVE,
  ADVISOR_LIFECYCLE_STATUSES.ADVISOR_DEVELOPMENT,
  ADVISOR_LIFECYCLE_STATUSES.NEW_PROFESSIONAL,
  ADVISOR_LIFECYCLE_STATUSES.PROFESSIONAL,
]);

const TERMINAL_STATUSES = new Set([
  ADVISOR_LIFECYCLE_STATUSES.INACTIVE,
  ADVISOR_LIFECYCLE_STATUSES.TERMINATED,
]);

export function normalizeLifecycleStatus(status = ADVISOR_LIFECYCLE_STATUSES.UNKNOWN) {
  return KNOWN_STATUSES.includes(status)
    ? status
    : ADVISOR_LIFECYCLE_STATUSES.UNKNOWN;
}

export function isPrecontractStatus(status) {
  return PRECONTRACT_STATUSES.has(normalizeLifecycleStatus(status));
}

export function isConnectedStatus(status) {
  return CONNECTED_STATUSES.has(normalizeLifecycleStatus(status));
}

export function isOfficialAdvisorStatus(status) {
  return OFFICIAL_ADVISOR_STATUSES.has(normalizeLifecycleStatus(status));
}

export function isTerminalStatus(status) {
  return TERMINAL_STATUSES.has(normalizeLifecycleStatus(status));
}
