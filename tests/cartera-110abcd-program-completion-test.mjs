import test from 'node:test';
import assert from 'node:assert/strict';

import {
  CARTERA_110_REQUIRED_STAGE_IDS,
  createCartera110ProgramCompletionManifest,
} from '../platform/program-governance/cartera-110a-program-completion-manifest.js';
import {
  evaluateCartera110PromotionReadiness,
} from '../platform/program-governance/cartera-110b-promotion-readiness-policy.js';
import {
  createCartera110PromotionDecisionEnvelope,
  prepareCartera110PromotionHandoff,
} from '../advisor-os/cartera/cartera-110c-program-promotion-decision-service.js';

function acceptedClosures() {
  return CARTERA_110_REQUIRED_STAGE_IDS.map(stageId => ({
    stageId,
    status: 'REMOTE_ACCEPTED',
    evidenceReference: `docs/evidence/cartera-${stageId}-closure.md`,
    acceptedHead: `${stageId.padStart(3, '0')}-accepted-head`,
    sourceHead: `${stageId.padStart(3, '0')}-source-head`,
  }));
}

function completeManifest() {
  return createCartera110ProgramCompletionManifest({
    closures: acceptedClosures(),
    canonicalRoadmapComplete: true,
  });
}

function readyPolicy(overrides = {}) {
  return evaluateCartera110PromotionReadiness({
    manifest: completeManifest(),
    sourceAncestryVerified: true,
    boundedPathsVerified: true,
    allChecksPassing: true,
    baseChainMerged: true,
    currentMainHeadVerified: true,
    boardApprovalGranted: true,
    mergeAuthorizationGranted: true,
    unresolvedReviewThreads: 0,
    pendingReviews: 0,
    ...overrides,
  });
}

test('110A requires the canonical 001 through 100 stage set', () => {
  assert.deepEqual(CARTERA_110_REQUIRED_STAGE_IDS, [
    '001', '010', '020', '030', '040', '050', '060', '070', '080', '090', '100',
  ]);
});

test('110A marks all evidence-backed accepted stages complete', () => {
  const manifest = completeManifest();
  assert.equal(manifest.completionState, 'COMPLETE');
  assert.equal(manifest.acceptedStages, 11);
  assert.equal(manifest.blockers.length, 0);
});

test('110A preserves missing as missing instead of complete', () => {
  const closures = acceptedClosures().filter(item => item.stageId !== '080');
  const manifest = createCartera110ProgramCompletionManifest({
    closures,
    canonicalRoadmapComplete: true,
  });
  assert.equal(manifest.completionState, 'INCOMPLETE');
  assert.equal(manifest.stages.find(item => item.stageId === '080').state, 'MISSING');
  assert.ok(manifest.blockers.some(item => item.code === 'STAGE_080_MISSING'));
});

test('110A preserves an unaccepted closure as incomplete', () => {
  const closures = acceptedClosures().map(item => item.stageId === '060'
    ? { ...item, status: 'PENDING' }
    : item);
  const manifest = createCartera110ProgramCompletionManifest({
    closures,
    canonicalRoadmapComplete: true,
  });
  assert.equal(manifest.stages.find(item => item.stageId === '060').state, 'INCOMPLETE');
  assert.equal(manifest.completionState, 'INCOMPLETE');
});

test('110A detects duplicate or divergent closure evidence as conflicting', () => {
  const closures = acceptedClosures();
  closures.push({
    stageId: '090',
    status: 'REMOTE_ACCEPTED',
    evidenceReference: 'docs/evidence/other-090-closure.md',
    acceptedHead: 'different-head',
  });
  const manifest = createCartera110ProgramCompletionManifest({
    closures,
    canonicalRoadmapComplete: true,
  });
  assert.equal(manifest.stages.find(item => item.stageId === '090').state, 'CONFLICTING');
  assert.equal(manifest.completionState, 'CONFLICTING');
});

test('110A rejects unsupported stage identifiers and evidence-free claims', () => {
  assert.throws(() => createCartera110ProgramCompletionManifest({
    closures: [{ stageId: '110', status: 'ACCEPTED', evidenceReference: 'x' }],
  }), /CARTERA110_UNSUPPORTED_STAGE/);
  assert.throws(() => createCartera110ProgramCompletionManifest({
    closures: [{ stageId: '001', status: 'ACCEPTED' }],
  }), /CARTERA110_EVIDENCE_REFERENCE_REQUIRED/);
});

test('110A does not infer roadmap completion from accepted closures alone', () => {
  const manifest = createCartera110ProgramCompletionManifest({
    closures: acceptedClosures(),
    canonicalRoadmapComplete: false,
  });
  assert.equal(manifest.acceptedStages, 11);
  assert.equal(manifest.completionState, 'INCOMPLETE');
});

test('110A locks branch, PR title, merge and main mutation boundaries', () => {
  const boundaries = completeManifest().boundaries;
  assert.equal(boundaries.branchNameIsEvidence, false);
  assert.equal(boundaries.pullRequestTitleIsEvidence, false);
  assert.equal(boundaries.automaticPromotion, false);
  assert.equal(boundaries.automaticMerge, false);
  assert.equal(boundaries.mainMutation, false);
});

test('110B refuses invalid manifests', () => {
  assert.throws(() => evaluateCartera110PromotionReadiness({ manifest: {} }),
    /CARTERA110_VALID_COMPLETION_MANIFEST_REQUIRED/);
});

test('110B is review required when program checks pass but approvals are absent', () => {
  const readiness = evaluateCartera110PromotionReadiness({
    manifest: completeManifest(),
    sourceAncestryVerified: true,
    boundedPathsVerified: true,
    allChecksPassing: true,
    baseChainMerged: false,
    currentMainHeadVerified: false,
    boardApprovalGranted: false,
    mergeAuthorizationGranted: false,
    unresolvedReviewThreads: 0,
    pendingReviews: 0,
  });
  assert.equal(readiness.readinessState, 'REVIEW_REQUIRED');
  assert.equal(readiness.promotionAuthorized, false);
  assert.ok(readiness.blockers.includes('BOARD_APPROVAL_NOT_GRANTED'));
  assert.ok(readiness.blockers.includes('MERGE_AUTHORIZATION_NOT_GRANTED'));
});

test('110B is not ready when the program manifest is incomplete', () => {
  const incomplete = createCartera110ProgramCompletionManifest({
    closures: acceptedClosures().slice(0, -1),
    canonicalRoadmapComplete: true,
  });
  const readiness = evaluateCartera110PromotionReadiness({
    manifest: incomplete,
    sourceAncestryVerified: true,
    boundedPathsVerified: true,
    allChecksPassing: true,
  });
  assert.equal(readiness.readinessState, 'NOT_READY');
  assert.ok(readiness.blockers.includes('PROGRAM_NOT_COMPLETE'));
});

test('110B requires merged base chain and verified current main', () => {
  const readiness = readyPolicy({
    baseChainMerged: false,
    currentMainHeadVerified: false,
  });
  assert.equal(readiness.promotionAuthorized, false);
  assert.ok(readiness.blockers.includes('BASE_CHAIN_NOT_MERGED'));
  assert.ok(readiness.blockers.includes('CURRENT_MAIN_HEAD_NOT_VERIFIED'));
});

test('110B blocks unresolved review threads and pending reviews', () => {
  const readiness = readyPolicy({ unresolvedReviewThreads: 2, pendingReviews: 1 });
  assert.equal(readiness.promotionAuthorized, false);
  assert.ok(readiness.blockers.includes('UNRESOLVED_REVIEW_THREADS'));
  assert.ok(readiness.blockers.includes('PENDING_REVIEWS'));
});

test('110B becomes ready only with every explicit prerequisite', () => {
  const readiness = readyPolicy();
  assert.equal(readiness.readinessState, 'READY_FOR_CONTROLLED_PROMOTION');
  assert.equal(readiness.promotionAuthorized, true);
  assert.deepEqual(readiness.blockers, []);
});

test('110B readiness never performs merge, PR, main or database mutation', () => {
  const boundaries = readyPolicy().boundaries;
  assert.equal(boundaries.readinessIsAuthorization, false);
  assert.equal(boundaries.automaticMerge, false);
  assert.equal(boundaries.automaticMainMutation, false);
  assert.equal(boundaries.automaticPullRequestMutation, false);
  assert.equal(boundaries.automaticDatabaseMutation, false);
});

test('110C requires an explicit actor, reason and valid timestamp', () => {
  const readiness = readyPolicy();
  assert.throws(() => createCartera110PromotionDecisionEnvelope({
    manifest: completeManifest(), readiness, decision: 'HOLD', reason: 'x', decidedAt: '2026-08-01T18:00:00Z',
  }), /CARTERA110_DECISION_ACTOR_REQUIRED/);
  assert.throws(() => createCartera110PromotionDecisionEnvelope({
    manifest: completeManifest(), readiness, decision: 'HOLD', actorId: 'jorge', decidedAt: '2026-08-01T18:00:00Z',
  }), /CARTERA110_DECISION_REASON_REQUIRED/);
  assert.throws(() => createCartera110PromotionDecisionEnvelope({
    manifest: completeManifest(), readiness, decision: 'HOLD', actorId: 'jorge', reason: 'x', decidedAt: 'not-a-date',
  }), /CARTERA110_DECISION_TIME_INVALID/);
});

test('110C supports HOLD while authorization remains absent', () => {
  const readiness = readyPolicy({
    boardApprovalGranted: false,
    mergeAuthorizationGranted: false,
    baseChainMerged: false,
    currentMainHeadVerified: false,
  });
  const envelope = createCartera110PromotionDecisionEnvelope({
    manifest: completeManifest(),
    readiness,
    decision: 'HOLD',
    actorId: 'Jorgeprdz',
    reason: 'Await explicit Board Approval and merge authorization.',
    decidedAt: '2026-08-01T18:00:00Z',
  });
  assert.equal(envelope.decisionState, 'HELD_FOR_EXPLICIT_AUTHORIZATION');
  assert.equal(envelope.handoff.mergeExecuted, false);
  assert.equal(envelope.handoff.mainMutated, false);
});

test('110C rejects controlled-promotion authorization before readiness', () => {
  const readiness = readyPolicy({ mergeAuthorizationGranted: false });
  assert.throws(() => createCartera110PromotionDecisionEnvelope({
    manifest: completeManifest(),
    readiness,
    decision: 'AUTHORIZE_CONTROLLED_PROMOTION',
    actorId: 'Jorgeprdz',
    reason: 'Promote.',
    decidedAt: '2026-08-01T18:00:00Z',
  }), /CARTERA110_PROMOTION_NOT_READY_OR_AUTHORIZED/);
});

test('110C can authorize a separate controlled workflow without executing it', () => {
  const envelope = createCartera110PromotionDecisionEnvelope({
    manifest: completeManifest(),
    readiness: readyPolicy(),
    decision: 'AUTHORIZE_CONTROLLED_PROMOTION',
    actorId: 'Jorgeprdz',
    reason: 'All explicit prerequisites are present.',
    decidedAt: '2026-08-01T18:00:00Z',
  });
  assert.equal(envelope.decisionState, 'AUTHORIZED_FOR_CONTROLLED_PROMOTION');
  assert.equal(envelope.handoff.automaticExecution, false);
  assert.equal(envelope.handoff.mergeExecuted, false);
  assert.equal(envelope.handoff.mainMutated, false);
});

test('110C HOLD handoff authorizes no execution', () => {
  const readiness = readyPolicy({ mergeAuthorizationGranted: false });
  const envelope = createCartera110PromotionDecisionEnvelope({
    manifest: completeManifest(),
    readiness,
    decision: 'HOLD',
    actorId: 'Jorgeprdz',
    reason: 'Explicit merge authorization is absent.',
    decidedAt: '2026-08-01T18:00:00Z',
  });
  const handoff = prepareCartera110PromotionHandoff(envelope);
  assert.equal(handoff.status, 'NO_EXECUTION_AUTHORIZED');
  assert.equal(handoff.effects.merge, false);
  assert.equal(handoff.effects.mainMutation, false);
  assert.equal(handoff.effects.databaseMutation, false);
});

test('110D one-pass outcome remains HOLD under current authority', () => {
  const manifest = completeManifest();
  const readiness = evaluateCartera110PromotionReadiness({
    manifest,
    sourceAncestryVerified: true,
    boundedPathsVerified: true,
    allChecksPassing: true,
    baseChainMerged: false,
    currentMainHeadVerified: false,
    boardApprovalGranted: false,
    mergeAuthorizationGranted: false,
    unresolvedReviewThreads: 0,
    pendingReviews: 0,
  });
  const envelope = createCartera110PromotionDecisionEnvelope({
    manifest,
    readiness,
    decision: 'HOLD',
    actorId: 'CARTERA_110_ACCEPTANCE',
    reason: 'Acceptance verifies completion but cannot infer promotion authority.',
    decidedAt: '2026-08-01T18:00:00Z',
  });
  assert.equal(manifest.completionState, 'COMPLETE');
  assert.equal(readiness.readinessState, 'REVIEW_REQUIRED');
  assert.equal(envelope.decision, 'HOLD');
  assert.equal(envelope.handoff.databaseMutated, false);
  assert.equal(envelope.handoff.pullRequestMutated, false);
});
