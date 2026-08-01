const SHA_PATTERN = /^[a-f0-9]{40}$/;

function requiredSha(value, code) {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (!SHA_PATTERN.test(normalized)) throw new Error(code);
  return normalized;
}

function nonNegativeInteger(value, code) {
  if (!Number.isInteger(value) || value < 0) throw new Error(code);
  return value;
}

function uniqueTextList(value, code) {
  if (!Array.isArray(value)) throw new Error(code);
  const normalized = value.map(item => String(item || '').trim()).filter(Boolean);
  return Object.freeze([...new Set(normalized)]);
}

export function reconcileCartera120CurrentMain(raw = {}) {
  const currentMainHead = requiredSha(raw.currentMainHead, 'CARTERA120_CURRENT_MAIN_HEAD_REQUIRED');
  const acceptedProgramHead = requiredSha(raw.acceptedProgramHead, 'CARTERA120_ACCEPTED_PROGRAM_HEAD_REQUIRED');
  const mergeBaseHead = requiredSha(raw.mergeBaseHead, 'CARTERA120_MERGE_BASE_HEAD_REQUIRED');
  const currentMainAheadBy = nonNegativeInteger(raw.currentMainAheadBy, 'CARTERA120_MAIN_AHEAD_INVALID');
  const acceptedProgramAheadBy = nonNegativeInteger(raw.acceptedProgramAheadBy, 'CARTERA120_PROGRAM_AHEAD_INVALID');
  const requiredPreservations = uniqueTextList(raw.requiredPreservations, 'CARTERA120_PRESERVATIONS_REQUIRED');
  const acceptedCapabilities = uniqueTextList(raw.acceptedCapabilities, 'CARTERA120_CAPABILITIES_REQUIRED');

  const sourceClosureVerified = raw.sourceClosureVerified === true;
  const programCompletionVerified = raw.programCompletionVerified === true;
  const historiesDiverged = currentMainAheadBy > 0 && acceptedProgramAheadBy > 0;
  const fullHistoryMergeAllowed = !historiesDiverged && raw.fullHistoryMergeExplicitlyApproved === true;
  const reconciliationState = !sourceClosureVerified || !programCompletionVerified
    ? 'SOURCE_NOT_VERIFIED'
    : historiesDiverged
      ? 'DIVERGED_SELECTIVE_PROMOTION_REQUIRED'
      : fullHistoryMergeAllowed
        ? 'LINEAR_PROMOTION_REVIEW_REQUIRED'
        : 'SELECTIVE_PROMOTION_REVIEW_REQUIRED';

  const blockers = [];
  if (!sourceClosureVerified) blockers.push('SOURCE_CLOSURE_NOT_VERIFIED');
  if (!programCompletionVerified) blockers.push('PROGRAM_COMPLETION_NOT_VERIFIED');
  if (requiredPreservations.length === 0) blockers.push('CURRENT_MAIN_PRESERVATIONS_NOT_DECLARED');
  if (acceptedCapabilities.length === 0) blockers.push('ACCEPTED_CAPABILITIES_NOT_DECLARED');
  if (historiesDiverged) blockers.push('FULL_HISTORY_MERGE_FORBIDDEN_BY_DIVERGENCE');

  return Object.freeze({
    contract: 'CARTERA_120A_CURRENT_MAIN_RECONCILIATION_V1',
    currentMainHead,
    acceptedProgramHead,
    mergeBaseHead,
    currentMainAheadBy,
    acceptedProgramAheadBy,
    historiesDiverged,
    sourceClosureVerified,
    programCompletionVerified,
    reconciliationState,
    requiredPreservations,
    acceptedCapabilities,
    blockers: Object.freeze(blockers),
    strategy: historiesDiverged
      ? 'SELECTIVE_CURRENT_MAIN_PROMOTION'
      : fullHistoryMergeAllowed
        ? 'LINEAR_PROMOTION_REVIEW'
        : 'SELECTIVE_CURRENT_MAIN_PROMOTION',
    boundaries: Object.freeze({
      fullHistoryMergeAllowed,
      stackedBranchMergeAllowed: false,
      historicalWorkflowPromotionAllowed: false,
      currentMainOverwriteAllowed: false,
      productRuntimeMutationAuthorized: false,
      databaseMutationAuthorized: false,
      mainMutationAuthorized: false,
      executionAuthorized: false,
    }),
  });
}
