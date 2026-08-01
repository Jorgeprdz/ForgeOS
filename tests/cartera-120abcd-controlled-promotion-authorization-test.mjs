import test from 'node:test';
import assert from 'node:assert/strict';

import { reconcileCartera120CurrentMain } from '../platform/program-governance/cartera-120a-current-main-reconciliation.js';
import {
  createCartera120SelectivePromotionManifest,
  verifyCartera120ManifestDigest,
} from '../platform/program-governance/cartera-120b-selective-promotion-manifest.js';
import {
  CARTERA_120_AUTHORIZATION_PHRASE,
  createCartera120PromotionAuthorizationReceipt,
  prepareCartera120ControlledPromotionHandoff,
} from '../advisor-os/cartera/cartera-120c-controlled-promotion-authorization.js';

const MAIN_HEAD = '9d014116f6b3f0a626d8848d680a5c607f924d99';
const PROGRAM_HEAD = 'b83a37abe3eb8b3a48c2fe89940b562e1367bfcc';
const MERGE_BASE = 'a060fde0b5b2f38e0912f54f47dc4f141c21e45c';

function reconciliation(overrides = {}) {
  return reconcileCartera120CurrentMain({
    currentMainHead: MAIN_HEAD,
    acceptedProgramHead: PROGRAM_HEAD,
    mergeBaseHead: MERGE_BASE,
    currentMainAheadBy: 388,
    acceptedProgramAheadBy: 594,
    sourceClosureVerified: true,
    programCompletionVerified: true,
    requiredPreservations: [
      'Material 3 shell and Pages',
      'Advisor Forecast productive runtime',
      'Pipeline and Quotes accepted behavior',
      'Cartera 050 current-main authority',
    ],
    acceptedCapabilities: [
      'Cartera 060 relationship growth',
      'Cartera 070 relational activation',
      'Cartera 080 economic connection',
      'Cartera 090 relationship capital',
      'Cartera 100 productivity proof',
      'Cartera 110 governance closure',
    ],
    ...overrides,
  });
}

function entries() {
  return [
    {
      action: 'ADD',
      category: 'DOMAIN_RUNTIME',
      capability: 'Relationship growth projection',
      sourcePath: 'platform/relationship-intelligence/cartera-060a-growth-review-projection.js',
      targetPath: 'platform/relationship-intelligence/cartera-060a-growth-review-projection.js',
      sourceBlobSha: '1111111111111111111111111111111111111111',
      reason: 'Promote accepted read-only capability.',
      currentMainPreservation: 'Do not replace current Productive Home, Forecast or shell runtime.',
      requiresRuntimeMount: false,
      remoteSchemaAlreadyApplied: true,
    },
    {
      action: 'RECONCILE',
      category: 'PRODUCT_BINDING',
      capability: 'Cartera productive mount',
      sourcePath: 'app.js',
      targetPath: 'app.js',
      sourceBlobSha: '2222222222222222222222222222222222222222',
      reason: 'Reconcile only the accepted Cartera binder onto current main.',
      currentMainPreservation: 'Preserve Forecast, Home, Quotes, Pipeline and current Material 3 imports.',
      requiresRuntimeMount: true,
      remoteSchemaAlreadyApplied: false,
    },
    {
      action: 'RETAIN',
      category: 'DOCUMENTATION',
      capability: 'Current main Forecast closure',
      targetPath: 'docs/evidence/ADVISOR_FORECAST_RUNTIME_ACCEPTANCE_001.md',
      reason: 'Retain current-main authority without copying historical branch content.',
      currentMainPreservation: 'Keep the current main file unchanged.',
      requiresRuntimeMount: false,
      remoteSchemaAlreadyApplied: false,
    },
  ];
}

function manifest(overrides = {}) {
  return createCartera120SelectivePromotionManifest({
    reconciliation: reconciliation(),
    entries: entries(),
    ...overrides,
  });
}

function holdReceipt(overrides = {}) {
  return createCartera120PromotionAuthorizationReceipt({
    manifest: manifest(),
    decision: 'HOLD',
    actorId: 'CARTERA_120_ACCEPTANCE',
    reason: 'A pass instruction authorizes construction, not merge or main mutation.',
    decidedAt: '2026-08-01T18:36:00.000Z',
    observedMainHead: MAIN_HEAD,
    observedProgramHead: PROGRAM_HEAD,
    boardApprovalGranted: false,
    mergeAuthorizationGranted: false,
    ...overrides,
  });
}

test('120A detects the real current-main and accepted-program divergence', () => {
  const result = reconciliation();
  assert.equal(result.historiesDiverged, true);
  assert.equal(result.currentMainAheadBy, 388);
  assert.equal(result.acceptedProgramAheadBy, 594);
  assert.equal(result.reconciliationState, 'DIVERGED_SELECTIVE_PROMOTION_REQUIRED');
  assert.equal(result.strategy, 'SELECTIVE_CURRENT_MAIN_PROMOTION');
});

test('120A forbids full-history and stacked-branch merge under divergence', () => {
  const boundaries = reconciliation().boundaries;
  assert.equal(boundaries.fullHistoryMergeAllowed, false);
  assert.equal(boundaries.stackedBranchMergeAllowed, false);
  assert.equal(boundaries.currentMainOverwriteAllowed, false);
  assert.equal(boundaries.executionAuthorized, false);
});

test('120A refuses invalid or missing commit heads', () => {
  assert.throws(() => reconciliation({ currentMainHead: 'main' }), /CARTERA120_CURRENT_MAIN_HEAD_REQUIRED/);
  assert.throws(() => reconciliation({ acceptedProgramHead: '' }), /CARTERA120_ACCEPTED_PROGRAM_HEAD_REQUIRED/);
  assert.throws(() => reconciliation({ mergeBaseHead: '123' }), /CARTERA120_MERGE_BASE_HEAD_REQUIRED/);
});

test('120A preserves source verification failures as blockers', () => {
  const result = reconciliation({ sourceClosureVerified: false });
  assert.equal(result.reconciliationState, 'SOURCE_NOT_VERIFIED');
  assert.ok(result.blockers.includes('SOURCE_CLOSURE_NOT_VERIFIED'));
});

test('120A requires declared current-main preservation and accepted capabilities', () => {
  const result = reconciliation({ requiredPreservations: [], acceptedCapabilities: [] });
  assert.ok(result.blockers.includes('CURRENT_MAIN_PRESERVATIONS_NOT_DECLARED'));
  assert.ok(result.blockers.includes('ACCEPTED_CAPABILITIES_NOT_DECLARED'));
});

test('120B creates a deterministic head-bound selective manifest', () => {
  const result = manifest();
  assert.equal(result.state, 'READY_FOR_AUTHORIZATION_REVIEW');
  assert.equal(result.currentMainHead, MAIN_HEAD);
  assert.equal(result.acceptedProgramHead, PROGRAM_HEAD);
  assert.equal(result.summary.entryCount, 3);
  assert.equal(result.summary.historicalCommitCountImported, 0);
  assert.match(result.manifestDigest, /^[a-f0-9]{64}$/);
  assert.equal(verifyCartera120ManifestDigest(result), true);
});

test('120B sorts entries by target path for stable digesting', () => {
  const reversed = createCartera120SelectivePromotionManifest({
    reconciliation: reconciliation(),
    entries: [...entries()].reverse(),
  });
  assert.equal(reversed.manifestDigest, manifest().manifestDigest);
});

test('120B detects manifest tampering', () => {
  const original = manifest();
  const changed = { ...original, entries: [...original.entries, original.entries[0]] };
  assert.equal(verifyCartera120ManifestDigest(changed), false);
});

test('120B rejects duplicate target paths', () => {
  const duplicate = [...entries(), { ...entries()[0], sourceBlobSha: '3333333333333333333333333333333333333333' }];
  assert.throws(() => createCartera120SelectivePromotionManifest({
    reconciliation: reconciliation(),
    entries: duplicate,
  }), /CARTERA120_DUPLICATE_TARGET_PATH/);
});

test('120B rejects temporary, secret and remote one-shot paths', () => {
  for (const targetPath of [
    'run/cartera-remote.js',
    '.github/workflows/cartera-060-remote-acceptance.yml',
    'scripts/ci/cartera-one-shot.mjs',
    '.env.production',
    'config/service-role-secret.txt',
  ]) {
    assert.throws(() => createCartera120SelectivePromotionManifest({
      reconciliation: reconciliation(),
      entries: [{ ...entries()[0], targetPath }],
    }), /CARTERA120_FORBIDDEN_PROMOTION_PATH/);
  }
});

test('120B requires app.js and cartera.js to be reconciled, never blindly replaced', () => {
  assert.throws(() => createCartera120SelectivePromotionManifest({
    reconciliation: reconciliation(),
    entries: [{ ...entries()[1], action: 'REPLACE' }],
  }), /CARTERA120_PRODUCT_ENTRY_REQUIRES_RECONCILE/);
});

test('120B never authorizes merge, deployment or database mutation', () => {
  const boundaries = manifest().boundaries;
  assert.equal(boundaries.fullHistoryMerge, false);
  assert.equal(boundaries.stackedBranchMerge, false);
  assert.equal(boundaries.directMainWrite, false);
  assert.equal(boundaries.automaticMerge, false);
  assert.equal(boundaries.automaticDeployment, false);
  assert.equal(boundaries.automaticDatabaseMigration, false);
  assert.equal(boundaries.executionAuthorized, false);
});

test('120C HOLD requires actor, reason, date and exact observed heads', () => {
  const receipt = holdReceipt();
  assert.equal(receipt.authorizationState, 'HELD_PENDING_EXPLICIT_AUTHORIZATION');
  assert.equal(receipt.authorized, false);
  assert.match(receipt.receiptDigest, /^[a-f0-9]{64}$/);
});

test('120C rejects moved current main head', () => {
  assert.throws(() => holdReceipt({
    observedMainHead: '3333333333333333333333333333333333333333',
  }), /CARTERA120_CURRENT_MAIN_HEAD_MOVED/);
});

test('120C rejects moved accepted program head', () => {
  assert.throws(() => holdReceipt({
    observedProgramHead: '4444444444444444444444444444444444444444',
  }), /CARTERA120_ACCEPTED_PROGRAM_HEAD_MOVED/);
});

test('120C does not treat a generic pass instruction as merge authorization', () => {
  const receipt = holdReceipt();
  assert.equal(receipt.boundaries.passInstructionIsMergeAuthorization, false);
  assert.equal(receipt.boundaries.silenceIsAuthorization, false);
  assert.equal(receipt.execution.mergeExecuted, false);
  assert.equal(receipt.execution.mainMutated, false);
});

test('120C authorization requires the exact phrase', () => {
  assert.throws(() => createCartera120PromotionAuthorizationReceipt({
    manifest: manifest(),
    decision: 'AUTHORIZE_SELECTIVE_PROMOTION',
    actorId: 'Jorgeprdz',
    reason: 'Proceed.',
    decidedAt: '2026-08-01T18:36:00.000Z',
    observedMainHead: MAIN_HEAD,
    observedProgramHead: PROGRAM_HEAD,
    explicitAuthorizationPhrase: 'go',
    boardApprovalGranted: true,
    mergeAuthorizationGranted: true,
  }), /CARTERA120_EXPLICIT_AUTHORIZATION_PHRASE_REQUIRED/);
});

test('120C authorization requires explicit Board Approval', () => {
  assert.throws(() => createCartera120PromotionAuthorizationReceipt({
    manifest: manifest(),
    decision: 'AUTHORIZE_SELECTIVE_PROMOTION',
    actorId: 'Jorgeprdz',
    reason: 'Proceed.',
    decidedAt: '2026-08-01T18:36:00.000Z',
    observedMainHead: MAIN_HEAD,
    observedProgramHead: PROGRAM_HEAD,
    explicitAuthorizationPhrase: CARTERA_120_AUTHORIZATION_PHRASE,
    boardApprovalGranted: false,
    mergeAuthorizationGranted: true,
  }), /CARTERA120_BOARD_APPROVAL_REQUIRED/);
});

test('120C authorization requires explicit merge authorization', () => {
  assert.throws(() => createCartera120PromotionAuthorizationReceipt({
    manifest: manifest(),
    decision: 'AUTHORIZE_SELECTIVE_PROMOTION',
    actorId: 'Jorgeprdz',
    reason: 'Proceed.',
    decidedAt: '2026-08-01T18:36:00.000Z',
    observedMainHead: MAIN_HEAD,
    observedProgramHead: PROGRAM_HEAD,
    explicitAuthorizationPhrase: CARTERA_120_AUTHORIZATION_PHRASE,
    boardApprovalGranted: true,
    mergeAuthorizationGranted: false,
  }), /CARTERA120_MERGE_AUTHORIZATION_REQUIRED/);
});

test('120C an authorized receipt still performs no execution', () => {
  const receipt = createCartera120PromotionAuthorizationReceipt({
    manifest: manifest(),
    decision: 'AUTHORIZE_SELECTIVE_PROMOTION',
    actorId: 'Jorgeprdz',
    reason: 'All explicit prerequisites are granted.',
    decidedAt: '2026-08-01T18:36:00.000Z',
    observedMainHead: MAIN_HEAD,
    observedProgramHead: PROGRAM_HEAD,
    explicitAuthorizationPhrase: CARTERA_120_AUTHORIZATION_PHRASE,
    boardApprovalGranted: true,
    mergeAuthorizationGranted: true,
  });
  assert.equal(receipt.authorized, true);
  assert.equal(receipt.execution.executionAuthorized, false);
  assert.equal(receipt.execution.mergeExecuted, false);
  assert.equal(receipt.execution.mainMutated, false);
  assert.equal(receipt.boundaries.authorizationIsExecution, false);
});

test('120C HOLD handoff authorizes no file copy or mutation', () => {
  const handoff = prepareCartera120ControlledPromotionHandoff({
    manifest: manifest(),
    receipt: holdReceipt(),
  });
  assert.equal(handoff.status, 'HOLD_NO_EXECUTION_AUTHORIZED');
  assert.equal(handoff.effects.filesCopied, 0);
  assert.equal(handoff.effects.filesReconciled, 0);
  assert.equal(handoff.effects.merge, false);
  assert.equal(handoff.effects.mainMutation, false);
  assert.equal(handoff.effects.databaseMutation, false);
});

test('120D one-pass closure ends in HOLD and points to head-bound 130 execution', () => {
  const promotionManifest = manifest();
  const receipt = holdReceipt();
  const handoff = prepareCartera120ControlledPromotionHandoff({
    manifest: promotionManifest,
    receipt,
  });
  assert.equal(reconciliation().strategy, 'SELECTIVE_CURRENT_MAIN_PROMOTION');
  assert.equal(promotionManifest.state, 'READY_FOR_AUTHORIZATION_REVIEW');
  assert.equal(receipt.authorizationState, 'HELD_PENDING_EXPLICIT_AUTHORIZATION');
  assert.equal(handoff.requiredNextAction, 'OBTAIN_EXACT_BOARD_AND_MERGE_AUTHORIZATION');
  assert.equal(handoff.effects.deployment, false);
});
