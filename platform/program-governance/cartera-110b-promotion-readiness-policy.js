function bool(value) {
  return value === true;
}

function nonNegativeInteger(value, fallback = 0) {
  return Number.isInteger(value) && value >= 0 ? value : fallback;
}

export function evaluateCartera110PromotionReadiness(raw = {}) {
  const manifest = raw.manifest;
  if (!manifest || manifest.contract !== 'CARTERA_110A_PROGRAM_COMPLETION_MANIFEST_V1') {
    throw new Error('CARTERA110_VALID_COMPLETION_MANIFEST_REQUIRED');
  }

  const evidence = Object.freeze({
    programComplete: manifest.completionState === 'COMPLETE',
    sourceAncestryVerified: bool(raw.sourceAncestryVerified),
    boundedPathsVerified: bool(raw.boundedPathsVerified),
    allChecksPassing: bool(raw.allChecksPassing),
    baseChainMerged: bool(raw.baseChainMerged),
    currentMainHeadVerified: bool(raw.currentMainHeadVerified),
    boardApprovalGranted: bool(raw.boardApprovalGranted),
    mergeAuthorizationGranted: bool(raw.mergeAuthorizationGranted),
    unresolvedReviewThreads: nonNegativeInteger(raw.unresolvedReviewThreads),
    pendingReviews: nonNegativeInteger(raw.pendingReviews),
  });

  const blockers = [];
  if (!evidence.programComplete) blockers.push('PROGRAM_NOT_COMPLETE');
  if (!evidence.sourceAncestryVerified) blockers.push('SOURCE_ANCESTRY_NOT_VERIFIED');
  if (!evidence.boundedPathsVerified) blockers.push('BOUNDED_PATHS_NOT_VERIFIED');
  if (!evidence.allChecksPassing) blockers.push('CHECKS_NOT_PASSING');
  if (!evidence.baseChainMerged) blockers.push('BASE_CHAIN_NOT_MERGED');
  if (!evidence.currentMainHeadVerified) blockers.push('CURRENT_MAIN_HEAD_NOT_VERIFIED');
  if (!evidence.boardApprovalGranted) blockers.push('BOARD_APPROVAL_NOT_GRANTED');
  if (!evidence.mergeAuthorizationGranted) blockers.push('MERGE_AUTHORIZATION_NOT_GRANTED');
  if (evidence.unresolvedReviewThreads > 0) blockers.push('UNRESOLVED_REVIEW_THREADS');
  if (evidence.pendingReviews > 0) blockers.push('PENDING_REVIEWS');

  const readinessState = blockers.length === 0
    ? 'READY_FOR_CONTROLLED_PROMOTION'
    : evidence.programComplete && evidence.sourceAncestryVerified && evidence.boundedPathsVerified && evidence.allChecksPassing
      ? 'REVIEW_REQUIRED'
      : 'NOT_READY';

  return Object.freeze({
    contract: 'CARTERA_110B_PROMOTION_READINESS_V1',
    readinessState,
    promotionAuthorized: readinessState === 'READY_FOR_CONTROLLED_PROMOTION',
    evidence,
    blockers: Object.freeze(blockers),
    boundaries: Object.freeze({
      readinessIsAuthorization: false,
      silenceIsAuthorization: false,
      boardApprovalMayBeInferred: false,
      mergeAuthorizationMayBeInferred: false,
      automaticMerge: false,
      automaticMainMutation: false,
      automaticPullRequestMutation: false,
      automaticDatabaseMutation: false,
    }),
  });
}
