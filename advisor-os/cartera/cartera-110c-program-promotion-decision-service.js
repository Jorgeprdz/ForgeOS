const DECISIONS = new Set(['HOLD', 'AUTHORIZE_CONTROLLED_PROMOTION']);

function requiredText(value, code) {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text) throw new Error(code);
  return text;
}

export function createCartera110PromotionDecisionEnvelope(raw = {}) {
  const manifest = raw.manifest;
  const readiness = raw.readiness;
  if (!manifest || manifest.contract !== 'CARTERA_110A_PROGRAM_COMPLETION_MANIFEST_V1') {
    throw new Error('CARTERA110_VALID_MANIFEST_REQUIRED');
  }
  if (!readiness || readiness.contract !== 'CARTERA_110B_PROMOTION_READINESS_V1') {
    throw new Error('CARTERA110_VALID_READINESS_REQUIRED');
  }

  const decision = requiredText(raw.decision, 'CARTERA110_EXPLICIT_DECISION_REQUIRED').toUpperCase();
  if (!DECISIONS.has(decision)) throw new Error(`CARTERA110_UNSUPPORTED_DECISION:${decision}`);

  const actorId = requiredText(raw.actorId, 'CARTERA110_DECISION_ACTOR_REQUIRED');
  const reason = requiredText(raw.reason, 'CARTERA110_DECISION_REASON_REQUIRED');
  const decidedAt = requiredText(raw.decidedAt, 'CARTERA110_DECISION_TIME_REQUIRED');
  if (Number.isNaN(Date.parse(decidedAt))) throw new Error('CARTERA110_DECISION_TIME_INVALID');

  if (decision === 'AUTHORIZE_CONTROLLED_PROMOTION' && !readiness.promotionAuthorized) {
    throw new Error('CARTERA110_PROMOTION_NOT_READY_OR_AUTHORIZED');
  }

  const decisionState = decision === 'HOLD'
    ? 'HELD_FOR_EXPLICIT_AUTHORIZATION'
    : 'AUTHORIZED_FOR_CONTROLLED_PROMOTION';

  return Object.freeze({
    contract: 'CARTERA_110C_PROMOTION_DECISION_ENVELOPE_V1',
    decision,
    decisionState,
    actorId,
    reason,
    decidedAt: new Date(decidedAt).toISOString(),
    manifestState: manifest.completionState,
    readinessState: readiness.readinessState,
    blockers: Object.freeze([...readiness.blockers]),
    handoff: Object.freeze({
      target: decision === 'AUTHORIZE_CONTROLLED_PROMOTION'
        ? 'CONTROLLED_PROMOTION_WORKFLOW'
        : 'HUMAN_PROMOTION_REVIEW',
      automaticExecution: false,
      mergeExecuted: false,
      mainMutated: false,
      pullRequestMutated: false,
      databaseMutated: false,
    }),
    boundaries: Object.freeze({
      decisionRequiresHumanActor: true,
      decisionRequiresReason: true,
      decisionRequiresTimestamp: true,
      authorizationRequiresReadiness: true,
      authorizationDoesNotExecuteMerge: true,
      automaticMerge: false,
      automaticMainMutation: false,
    }),
  });
}

export function prepareCartera110PromotionHandoff(envelope = {}) {
  if (envelope.contract !== 'CARTERA_110C_PROMOTION_DECISION_ENVELOPE_V1') {
    throw new Error('CARTERA110_VALID_DECISION_ENVELOPE_REQUIRED');
  }

  return Object.freeze({
    contract: 'CARTERA_110C_PROMOTION_HANDOFF_V1',
    status: envelope.decision === 'AUTHORIZE_CONTROLLED_PROMOTION'
      ? 'READY_FOR_SEPARATE_CONTROLLED_EXECUTION'
      : 'NO_EXECUTION_AUTHORIZED',
    decision: envelope.decision,
    decisionState: envelope.decisionState,
    blockers: envelope.blockers,
    requiredNextAction: envelope.decision === 'AUTHORIZE_CONTROLLED_PROMOTION'
      ? 'RUN_SEPARATE_HEAD_BOUND_CONTROLLED_PROMOTION'
      : 'OBTAIN_EXPLICIT_BOARD_AND_MERGE_AUTHORIZATION',
    effects: Object.freeze({
      merge: false,
      mainMutation: false,
      pullRequestMutation: false,
      accountMutation: false,
      databaseMutation: false,
    }),
  });
}
