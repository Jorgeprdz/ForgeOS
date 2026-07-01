const assert = require('assert');
const {
  buildForgeAliveStaticPreviewMilestoneClosureBoundary,
  FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES,
  FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_ALLOWED_USES,
  FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_FORBIDDEN_USES,
} = require('../forge-alive-static-preview-milestone-closure/forge-alive-static-preview-milestone-closure-boundary-contract');

function futureDate() {
  return new Date(Date.now() + 86400000).toISOString();
}

function validInput(overrides = {}) {
  return {
    milestoneClosureRequestId: 'milestone-closure-1',
    staticPreviewImplementationSnapshot: {
      closed: true,
      implemented: true,
      sampleDataOnly: true,
      readOnly: true,
      notProduction: true,
    },
    staticPreviewDeploymentBoundarySnapshot: {
      reviewed: true,
      implemented: true,
      publicSurfaceCandidateReviewOnly: true,
      approvedForDeploymentExecution: false,
    },
    publicSurfaceDecisionSnapshot: {
      reviewed: true,
      approvedForPublicSurfaceDecision: true,
      ownerDecisionRecordOnly: true,
      approvedForDeploymentExecution: false,
    },
    publicUrlVerificationSnapshot: {
      reviewed: true,
      verifiedFromEvidence: true,
      evidenceOnly: true,
      performsNetworkCall: false,
    },
    releaseNoteSnapshot: {
      reviewed: true,
      approvedForReleaseNoteDraft: true,
      releaseNoteDraftOnly: true,
      publishesReleaseNote: false,
    },
    reviewPacketSnapshot: {
      reviewed: true,
      approvedForReviewPacketDraft: true,
      reviewPacketDraftOnly: true,
      publishesReviewPacket: false,
      warnings: ['review packet only'],
      limitations: ['not release'],
    },
    unifiedBuildTreeSnapshot: {
      reviewed: true,
      updated: true,
      containsMilestoneScope: true,
      containsMilestoneImplementationNext: true,
    },
    roadmapSnapshot: {
      reviewed: true,
      containsMilestoneClosure: true,
      nextPhase: '051A_NEXT_PRODUCT_SLICE_DECISION_SCOPE',
    },
    testEvidenceSnapshot: {
      reviewed: true,
      allRequiredTestsPass: true,
      requiredTests: [
        'Static Preview Review Packet Boundary PASS 42/42',
        'Static Preview Release Note Boundary PASS 42/42',
        'Public URL Verification Boundary PASS 42/42',
      ],
    },
    evidenceBundleSnapshot: {
      reviewed: true,
      complete: true,
    },
    sourceOwnershipSnapshot: {
      reviewed: true,
      sourceOwned: true,
    },
    milestonePolicySnapshot: {
      reviewed: true,
      milestoneClosureOnly: true,
      productionReleaseAllowed: false,
      publicationAllowed: false,
      requiresLimitations: true,
      unsafeMilestoneClosure: false,
      warnings: ['internal closure only'],
      limitations: ['not production'],
    },
    limitationSnapshot: {
      reviewed: true,
      limitationsVisible: true,
      productionReleaseNotAuthorized: true,
      publicationNotAuthorized: true,
    },
    evidenceRefs: ['049B-certificate', '049B-certificate'],
    sourceEvidenceIds: ['c2f0e5c', 'c2f0e5c'],
    sourceOwners: ['Forge Architecture', 'Forge Architecture'],
    idempotencyKey: 'milestone-closure-idem-1',
    requestedUse: 'MILESTONE_CLOSURE_RECORD_PREP',
    expiresAt: futureDate(),
    now: new Date().toISOString(),
    ...overrides,
  };
}

function assertAllForbiddenRemainFalse(output) {
  const flags = [
    'productionReleaseApproved',
    'publicationAuthorized',
    'publishesMilestone',
    'publishesStaticPreview',
    'deploysApp',
    'mutatesGitHubPagesSettings',
    'createsPublicUrl',
    'verifiesPublicUrl',
    'performsNetworkCall',
    'performsHttpRequest',
    'performsDnsLookup',
    'mutatesDns',
    'configuresCustomDomain',
    'callsApi',
    'enablesAuth',
    'enablesAnalytics',
    'enablesTracking',
    'writesStorage',
    'registersServiceWorker',
    'createsFormSubmission',
    'mutatesCrm',
    'createsTask',
    'createsCalendarEvent',
    'writesCanonicalTruth',
    'createsBusinessTruth',
    'createsMetricTruth',
    'createsEconomicTruth',
    'executesAction',
    'sendsMessage',
  ];
  for (const flag of flags) assert.strictEqual(output[flag], false, flag);
}

const tests = [];
tests.push(['missing static preview implementation blocks', () => {
  assert.ok(FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_ALLOWED_USES.includes('MILESTONE_CLOSURE_RECORD_PREP'));
  assert.ok(FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_FORBIDDEN_USES.includes('PRODUCTION_RELEASE'));
  const out = buildForgeAliveStaticPreviewMilestoneClosureBoundary(validInput({ staticPreviewImplementationSnapshot: null }));
  assert.strictEqual(out.milestoneClosureStatus, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.NEEDS_STATIC_PREVIEW_IMPLEMENTATION);
  assertAllForbiddenRemainFalse(out);
}]);
tests.push(['missing deployment boundary blocks', () => assert.strictEqual(buildForgeAliveStaticPreviewMilestoneClosureBoundary(validInput({ staticPreviewDeploymentBoundarySnapshot: null })).milestoneClosureStatus, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.NEEDS_DEPLOYMENT_BOUNDARY)]);
tests.push(['missing public surface decision blocks', () => assert.strictEqual(buildForgeAliveStaticPreviewMilestoneClosureBoundary(validInput({ publicSurfaceDecisionSnapshot: null })).milestoneClosureStatus, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.NEEDS_PUBLIC_SURFACE_DECISION)]);
tests.push(['missing public URL verification blocks', () => assert.strictEqual(buildForgeAliveStaticPreviewMilestoneClosureBoundary(validInput({ publicUrlVerificationSnapshot: null })).milestoneClosureStatus, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.NEEDS_PUBLIC_URL_VERIFICATION)]);
tests.push(['missing release note blocks', () => assert.strictEqual(buildForgeAliveStaticPreviewMilestoneClosureBoundary(validInput({ releaseNoteSnapshot: null })).milestoneClosureStatus, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.NEEDS_RELEASE_NOTE)]);
tests.push(['missing review packet blocks', () => assert.strictEqual(buildForgeAliveStaticPreviewMilestoneClosureBoundary(validInput({ reviewPacketSnapshot: null })).milestoneClosureStatus, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.NEEDS_REVIEW_PACKET)]);
tests.push(['missing Unified Build Tree blocks', () => assert.strictEqual(buildForgeAliveStaticPreviewMilestoneClosureBoundary(validInput({ unifiedBuildTreeSnapshot: null })).milestoneClosureStatus, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.NEEDS_UNIFIED_BUILD_TREE)]);
tests.push(['missing roadmap blocks', () => assert.strictEqual(buildForgeAliveStaticPreviewMilestoneClosureBoundary(validInput({ roadmapSnapshot: null })).milestoneClosureStatus, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.NEEDS_ROADMAP)]);
tests.push(['missing test evidence blocks', () => assert.strictEqual(buildForgeAliveStaticPreviewMilestoneClosureBoundary(validInput({ testEvidenceSnapshot: null })).milestoneClosureStatus, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.NEEDS_TEST_EVIDENCE)]);
tests.push(['missing evidence bundle blocks', () => assert.strictEqual(buildForgeAliveStaticPreviewMilestoneClosureBoundary(validInput({ evidenceBundleSnapshot: null })).milestoneClosureStatus, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.NEEDS_EVIDENCE_BUNDLE)]);
tests.push(['missing source ownership blocks', () => assert.strictEqual(buildForgeAliveStaticPreviewMilestoneClosureBoundary(validInput({ sourceOwnershipSnapshot: null })).milestoneClosureStatus, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.NEEDS_SOURCE_OWNERSHIP)]);
tests.push(['missing milestone policy blocks', () => assert.strictEqual(buildForgeAliveStaticPreviewMilestoneClosureBoundary(validInput({ milestonePolicySnapshot: null })).milestoneClosureStatus, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.NEEDS_MILESTONE_POLICY)]);
tests.push(['missing limitation snapshot blocks', () => assert.strictEqual(buildForgeAliveStaticPreviewMilestoneClosureBoundary(validInput({ limitationSnapshot: null })).milestoneClosureStatus, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.NEEDS_LIMITATION_SNAPSHOT)]);
tests.push(['missing evidence blocks', () => assert.strictEqual(buildForgeAliveStaticPreviewMilestoneClosureBoundary(validInput({ evidenceRefs: [] })).milestoneClosureStatus, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.NEEDS_EVIDENCE)]);
tests.push(['missing source owner blocks', () => assert.strictEqual(buildForgeAliveStaticPreviewMilestoneClosureBoundary(validInput({ sourceOwners: [] })).milestoneClosureStatus, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.NEEDS_SOURCE_OWNER)]);
tests.push(['missing idempotency key blocks', () => assert.strictEqual(buildForgeAliveStaticPreviewMilestoneClosureBoundary(validInput({ idempotencyKey: '' })).milestoneClosureStatus, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.NEEDS_IDEMPOTENCY_KEY)]);
tests.push(['unsafe milestone closure blocks', () => assert.strictEqual(buildForgeAliveStaticPreviewMilestoneClosureBoundary(validInput({ milestonePolicySnapshot: { reviewed: true, milestoneClosureOnly: true, productionReleaseAllowed: false, publicationAllowed: false, requiresLimitations: true, unsafeMilestoneClosure: true } })).milestoneClosureStatus, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.UNSAFE_MILESTONE_CLOSURE)]);
tests.push(['production release remains false', () => { const out = buildForgeAliveStaticPreviewMilestoneClosureBoundary(validInput({ productionReleaseRequested: true })); assert.strictEqual(out.milestoneClosureStatus, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.PRODUCTION_RELEASE_NOT_AUTHORIZED); assert.strictEqual(out.productionReleaseApproved, false); }]);
tests.push(['publication remains false', () => { const out = buildForgeAliveStaticPreviewMilestoneClosureBoundary(validInput({ publicationRequested: true })); assert.strictEqual(out.milestoneClosureStatus, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.PUBLICATION_NOT_AUTHORIZED); assert.strictEqual(out.publicationAuthorized, false); }]);
tests.push(['deployment remains false', () => { const out = buildForgeAliveStaticPreviewMilestoneClosureBoundary(validInput({ deploymentExecutionRequested: true })); assert.strictEqual(out.milestoneClosureStatus, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.DEPLOYMENT_EXECUTION_NOT_AUTHORIZED); assert.strictEqual(out.deploysApp, false); }]);
tests.push(['GitHub Pages settings mutation remains false', () => { const out = buildForgeAliveStaticPreviewMilestoneClosureBoundary(validInput({ githubPagesSettingsMutationRequested: true })); assert.strictEqual(out.milestoneClosureStatus, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.GITHUB_PAGES_SETTINGS_MUTATION_NOT_AUTHORIZED); assert.strictEqual(out.mutatesGitHubPagesSettings, false); }]);
tests.push(['public URL creation remains false', () => { const out = buildForgeAliveStaticPreviewMilestoneClosureBoundary(validInput({ publicUrlCreationRequested: true })); assert.strictEqual(out.milestoneClosureStatus, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.PUBLIC_URL_CREATION_NOT_AUTHORIZED); assert.strictEqual(out.createsPublicUrl, false); }]);
tests.push(['public URL verification remains false', () => { const out = buildForgeAliveStaticPreviewMilestoneClosureBoundary(validInput({ publicUrlVerificationRequested: true })); assert.strictEqual(out.milestoneClosureStatus, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.PUBLIC_URL_VERIFICATION_NOT_AUTHORIZED); assert.strictEqual(out.verifiesPublicUrl, false); }]);
tests.push(['network call remains false', () => { const out = buildForgeAliveStaticPreviewMilestoneClosureBoundary(validInput({ networkCallRequested: true })); assert.strictEqual(out.milestoneClosureStatus, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.NETWORK_CALL_NOT_AUTHORIZED); assert.strictEqual(out.performsNetworkCall, false); }]);
tests.push(['HTTP request remains false', () => { const out = buildForgeAliveStaticPreviewMilestoneClosureBoundary(validInput({ httpRequestRequested: true })); assert.strictEqual(out.milestoneClosureStatus, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.HTTP_REQUEST_NOT_AUTHORIZED); assert.strictEqual(out.performsHttpRequest, false); }]);
tests.push(['DNS lookup remains false', () => { const out = buildForgeAliveStaticPreviewMilestoneClosureBoundary(validInput({ dnsLookupRequested: true })); assert.strictEqual(out.milestoneClosureStatus, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.DNS_LOOKUP_NOT_AUTHORIZED); assert.strictEqual(out.performsDnsLookup, false); }]);
tests.push(['API call remains false', () => { const out = buildForgeAliveStaticPreviewMilestoneClosureBoundary(validInput({ apiCallDetected: true })); assert.strictEqual(out.milestoneClosureStatus, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.API_CALL_DETECTED); assert.strictEqual(out.callsApi, false); }]);
tests.push(['tracking remains false', () => { const out = buildForgeAliveStaticPreviewMilestoneClosureBoundary(validInput({ trackingDetected: true })); assert.strictEqual(out.milestoneClosureStatus, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.TRACKING_DETECTED); assert.strictEqual(out.enablesTracking, false); }]);
tests.push(['storage write remains false', () => { const out = buildForgeAliveStaticPreviewMilestoneClosureBoundary(validInput({ storageWriteDetected: true })); assert.strictEqual(out.milestoneClosureStatus, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.STORAGE_WRITE_DETECTED); assert.strictEqual(out.writesStorage, false); }]);
tests.push(['form submission remains false', () => { const out = buildForgeAliveStaticPreviewMilestoneClosureBoundary(validInput({ formSubmissionDetected: true })); assert.strictEqual(out.milestoneClosureStatus, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.FORM_SUBMISSION_DETECTED); assert.strictEqual(out.createsFormSubmission, false); }]);
tests.push(['service worker remains false', () => { const out = buildForgeAliveStaticPreviewMilestoneClosureBoundary(validInput({ serviceWorkerDetected: true })); assert.strictEqual(out.milestoneClosureStatus, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.SERVICE_WORKER_DETECTED); assert.strictEqual(out.registersServiceWorker, false); }]);
tests.push(['CRM mutation remains false', () => { const out = buildForgeAliveStaticPreviewMilestoneClosureBoundary(validInput({ crmMutationRequested: true })); assert.strictEqual(out.milestoneClosureStatus, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.CRM_MUTATION_NOT_AUTHORIZED); assert.strictEqual(out.mutatesCrm, false); }]);
tests.push(['truth creation remains false', () => { const out = buildForgeAliveStaticPreviewMilestoneClosureBoundary(validInput({ truthCreationRequested: true })); assert.strictEqual(out.milestoneClosureStatus, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.TRUTH_CREATION_NOT_AUTHORIZED); assert.strictEqual(out.createsBusinessTruth, false); }]);
tests.push(['action execution remains false', () => { const out = buildForgeAliveStaticPreviewMilestoneClosureBoundary(validInput({ actionExecutionRequested: true })); assert.strictEqual(out.milestoneClosureStatus, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.ACTION_EXECUTION_NOT_AUTHORIZED); assert.strictEqual(out.executesAction, false); }]);
tests.push(['milestone closure record can be produced from closed module evidence only', () => { const out = buildForgeAliveStaticPreviewMilestoneClosureBoundary(validInput()); assert.strictEqual(out.milestoneClosureStatus, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.APPROVED_FOR_MILESTONE_CLOSURE); assert.strictEqual(out.approvedForMilestoneClosure, true); assert.ok(out.closureEvidence.evidenceOnly); }]);
tests.push(['record includes phase range 044B through 049B', () => { const out = buildForgeAliveStaticPreviewMilestoneClosureBoundary(validInput()); assert.strictEqual(out.closedPhaseRange, '044B through 049B'); assert.ok(out.milestoneClosureRecord.phaseRange.includes('044B')); }]);
tests.push(['record includes required tests', () => { const out = buildForgeAliveStaticPreviewMilestoneClosureBoundary(validInput()); assert.ok(out.milestoneClosureRecord.requiredTests.includes('Static Preview Review Packet Boundary PASS 42/42')); }]);
tests.push(['record includes Unified Build Tree update', () => { const out = buildForgeAliveStaticPreviewMilestoneClosureBoundary(validInput()); assert.strictEqual(out.closureEvidence.unifiedBuildTreeUpdated, true); }]);
tests.push(['record includes limitations and next phase', () => { const out = buildForgeAliveStaticPreviewMilestoneClosureBoundary(validInput()); assert.ok(out.milestoneClosureRecord.limitations.join(' ').includes('Production release')); assert.strictEqual(out.nextPhase, '051A_NEXT_PRODUCT_SLICE_DECISION_SCOPE'); }]);
tests.push(['Evidence refs source evidence IDs source owners dedupe', () => { const out = buildForgeAliveStaticPreviewMilestoneClosureBoundary(validInput()); assert.deepStrictEqual(out.evidenceRefs, ['049B-certificate']); assert.deepStrictEqual(out.sourceEvidenceIds, ['c2f0e5c']); assert.deepStrictEqual(out.sourceOwners, ['Forge Architecture']); }]);
tests.push(['inputs are not mutated', () => { const input = validInput(); const before = JSON.stringify(input); buildForgeAliveStaticPreviewMilestoneClosureBoundary(input); assert.strictEqual(JSON.stringify(input), before); }]);
tests.push(['Metric Economic Truth remains separate', () => { const out = buildForgeAliveStaticPreviewMilestoneClosureBoundary(validInput()); assert.strictEqual(out.metricEconomicTruthRemainsSeparate, true); }]);

let passed = 0;
for (const [name, fn] of tests) {
  try {
    fn();
    passed += 1;
  } catch (error) {
    console.error(`FAIL: ${name}`);
    throw error;
  }
}
console.log(`Forge Alive Static Preview Milestone Closure Boundary Contract PASS ${passed}/${tests.length}`);
