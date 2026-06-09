/**
 * ============================================================
 * PROCESS ADVANCEMENT RULES
 * ADR-0019 — Process Advancement Intelligence
 * ============================================================
 */

const {
  EVALUATED_ACTORS,
  DEPENDENCY_STATUS,
  COMMITMENT_STATES,
  PERMISSION_SIGNALS,
  RISK_LEVELS,
  PROCESS_MOVES
} = require("./process-advancement-types");

const INSTITUTIONAL_OR_EXTERNAL_ACTORS = Object.freeze([
  EVALUATED_ACTORS.CARRIER,
  EVALUATED_ACTORS.UNDERWRITER,
  EVALUATED_ACTORS.MANAGER,
  EVALUATED_ACTORS.SYSTEM,
  EVALUATED_ACTORS.EXTERNAL_EVENT,
  EVALUATED_ACTORS.THIRD_PARTY
]);

const COMMERCIAL_HUMAN_ACTORS = Object.freeze([
  EVALUATED_ACTORS.PROSPECT,
  EVALUATED_ACTORS.CLIENT,
  EVALUATED_ACTORS.REFERRER
]);

function isHighRisk(externalConstraints = {}) {
  return (
    externalConstraints.clientFirstRisk === RISK_LEVELS.HIGH ||
    externalConstraints.authorityRisk === RISK_LEVELS.HIGH
  );
}

function isPermissionPermanentlyDenied(externalConstraints = {}) {
  return externalConstraints.permissionSignal === PERMISSION_SIGNALS.DENIED_PERMANENTLY;
}

function isPermissionTemporarilyDenied(externalConstraints = {}) {
  return externalConstraints.permissionSignal === PERMISSION_SIGNALS.DENIED_TEMPORARILY;
}

function isInstitutionalOrExternalActor(actor) {
  return INSTITUTIONAL_OR_EXTERNAL_ACTORS.includes(actor);
}

function isCommercialHumanActor(actor) {
  return COMMERCIAL_HUMAN_ACTORS.includes(actor);
}

function isCommitmentDueNow(commitment = {}) {
  return commitment.isDueNow === true;
}

function hasMalformedCore(input = {}) {
  return (
    !input.evaluatedActor ||
    !input.activeDependency ||
    !input.governingCommitment ||
    !input.externalConstraints
  );
}

function resolveProcessMove(input = {}) {
  if (hasMalformedCore(input)) {
    return PROCESS_MOVES.HUMAN_REVIEW;
  }

  const {
    evaluatedActor,
    activeDependency,
    governingCommitment,
    externalConstraints
  } = input;

  if (isHighRisk(externalConstraints)) {
    return PROCESS_MOVES.HUMAN_REVIEW;
  }

  if (isPermissionPermanentlyDenied(externalConstraints)) {
    return PROCESS_MOVES.HUMAN_REVIEW;
  }

  if (isPermissionTemporarilyDenied(externalConstraints)) {
    return PROCESS_MOVES.WAIT_ON_DEPENDENCY;
  }

  if (externalConstraints.relationshipRisk === RISK_LEVELS.HIGH) {
    return PROCESS_MOVES.REVALIDATE_PERMISSION;
  }

  if (
    governingCommitment.owner === EVALUATED_ACTORS.ADVISOR &&
    governingCommitment.state === COMMITMENT_STATES.ACTIVE &&
    isCommitmentDueNow(governingCommitment)
  ) {
    return PROCESS_MOVES.HONOR_COMMITMENT;
  }

  if (
    governingCommitment.owner === EVALUATED_ACTORS.ADVISOR &&
    governingCommitment.state === COMMITMENT_STATES.ACTIVE &&
    !isCommitmentDueNow(governingCommitment)
  ) {
    return PROCESS_MOVES.WAIT_ON_DEPENDENCY;
  }

  if (governingCommitment.state === COMMITMENT_STATES.MISSED) {
    return PROCESS_MOVES.HONOR_COMMITMENT;
  }

  if (
    governingCommitment.state === COMMITMENT_STATES.ACTIVE &&
    governingCommitment.owner !== EVALUATED_ACTORS.ADVISOR
  ) {
    return PROCESS_MOVES.WAIT_ON_DEPENDENCY;
  }

  if (
    governingCommitment.state === COMMITMENT_STATES.COMPLETED &&
    activeDependency.owner !== evaluatedActor
  ) {
    return PROCESS_MOVES.NO_ACTION_REQUIRED;
  }

  if (
    activeDependency.status === DEPENDENCY_STATUS.BLOCKED &&
    activeDependency.owner === EVALUATED_ACTORS.ADVISOR
  ) {
    return PROCESS_MOVES.RESOLVE_BLOCKER;
  }

  if (
    activeDependency.status === DEPENDENCY_STATUS.BLOCKED &&
    activeDependency.owner !== EVALUATED_ACTORS.ADVISOR
  ) {
    return PROCESS_MOVES.UNBLOCK_DEPENDENCY;
  }

  if (
    activeDependency.status === DEPENDENCY_STATUS.MISSED &&
    isInstitutionalOrExternalActor(activeDependency.owner)
  ) {
    return PROCESS_MOVES.UNBLOCK_DEPENDENCY;
  }

  if (
    activeDependency.status === DEPENDENCY_STATUS.ACTIVE &&
    governingCommitment.state === COMMITMENT_STATES.NONE &&
    isCommercialHumanActor(activeDependency.owner)
  ) {
    return PROCESS_MOVES.GENERATE_AGREEMENT;
  }

  if (
    activeDependency.status === DEPENDENCY_STATUS.ACTIVE &&
    governingCommitment.state === COMMITMENT_STATES.NONE &&
    activeDependency.owner === EVALUATED_ACTORS.ADVISOR
  ) {
    return PROCESS_MOVES.RESOLVE_BLOCKER;
  }

  if (
    activeDependency.status === DEPENDENCY_STATUS.ACTIVE &&
    governingCommitment.state === COMMITMENT_STATES.NONE &&
    isInstitutionalOrExternalActor(activeDependency.owner)
  ) {
    return PROCESS_MOVES.WAIT_ON_DEPENDENCY;
  }

  if (activeDependency.status === DEPENDENCY_STATUS.RESOLVED) {
    return PROCESS_MOVES.HUMAN_REVIEW;
  }

  return PROCESS_MOVES.HUMAN_REVIEW;
}

module.exports = {
  INSTITUTIONAL_OR_EXTERNAL_ACTORS,
  COMMERCIAL_HUMAN_ACTORS,
  isHighRisk,
  isPermissionPermanentlyDenied,
  isPermissionTemporarilyDenied,
  isInstitutionalOrExternalActor,
  isCommercialHumanActor,
  isCommitmentDueNow,
  hasMalformedCore,
  resolveProcessMove
};
