const assert = require('assert');
const {
  buildStaticPreviewReviewPacketBoundary,
  STATIC_PREVIEW_REVIEW_PACKET_STATUSES,
  STATIC_PREVIEW_REVIEW_PACKET_ALLOWED_USES,
  STATIC_PREVIEW_REVIEW_PACKET_FORBIDDEN_USES,
} = require('../static-preview-review-packet/static-preview-review-packet-boundary-contract');

function futureDate() {
  return new Date(Date.now() + 86400000).toISOString();
}

function validInput(overrides = {}) {
  return {
    reviewPacketRequestId: 'review-packet-1',
    staticPreviewImplementationSnapshot: {
      closed: true,
      implemented: true,
      sampleDataOnly: true,
      readOnly: true,
      notProduction: true,
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
      performsHttpRequest: false,
      performsDnsLookup: false,
    },
    releaseNoteSnapshot: {
      reviewed: true,
      approvedForReleaseNoteDraft: true,
      releaseNoteDraftOnly: true,
      publishesReleaseNote: false,
      releaseNoteDraft: 'Forge Alive static preview is sample data only, read-only, and not production.',
      warnings: ['release note draft only'],
      limitations: ['not publication'],
    },
    reviewPacketPolicySnapshot: {
      reviewed: true,
      reviewPacketDraftOnly: true,
      publicationAllowed: false,
      requiresSafetyChecklist: true,
      unsafeReviewPacket: false,
      warnings: ['review packet is not publication authorization'],
      limitations: ['internal review only'],
    },
    evidenceBundleSnapshot: {
      reviewed: true,
      complete: true,
    },
    sourceOwnershipSnapshot: {
      reviewed: true,
      sourceOwned: true,
    },
    visualReferenceSnapshot: {
      reviewed: true,
      visualReferenceId: 'forge-alive-render-reference',
      visualReferenceName: 'Forge Alive mobile dark navy glassmorphism reference',
    },
    safetyChecklistSnapshot: {
      reviewed: true,
      noPublish: true,
      noDeploy: true,
      noNetwork: true,
      noPublicUrlCreation: true,
      noPublicUrlVerification: true,
      unsafeChecklist: false,
    },
    roadmapSnapshot: {
      reviewed: true,
      nextPhase: '050A_FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_SCOPE',
    },
    reviewerPlaceholderSnapshot: {
      reviewed: true,
      reviewerDecisionPlaceholderVisible: true,
    },
    evidenceRefs: ['048B-certificate', '048B-certificate'],
    sourceEvidenceIds: ['8e50289', '8e50289'],
    sourceOwners: ['Forge Architecture', 'Forge Architecture'],
    idempotencyKey: 'review-packet-idem-1',
    requestedUse: 'REVIEW_PACKET_DRAFT_PREP',
    expiresAt: futureDate(),
    now: new Date().toISOString(),
    ...overrides,
  };
}

function assertAllForbiddenRemainFalse(output) {
  const flags = [
    'publishesReviewPacket',
    'publishesReleaseNote',
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
  assert.ok(STATIC_PREVIEW_REVIEW_PACKET_ALLOWED_USES.includes('REVIEW_PACKET_DRAFT_PREP'));
  assert.ok(STATIC_PREVIEW_REVIEW_PACKET_FORBIDDEN_USES.includes('PUBLICATION'));
  const out = buildStaticPreviewReviewPacketBoundary(validInput({ staticPreviewImplementationSnapshot: null }));
  assert.strictEqual(out.reviewPacketStatus, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.NEEDS_STATIC_PREVIEW_IMPLEMENTATION);
  assertAllForbiddenRemainFalse(out);
}]);
tests.push(['missing public surface decision blocks', () => assert.strictEqual(buildStaticPreviewReviewPacketBoundary(validInput({ publicSurfaceDecisionSnapshot: null })).reviewPacketStatus, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.NEEDS_PUBLIC_SURFACE_DECISION)]);
tests.push(['missing public URL verification blocks', () => assert.strictEqual(buildStaticPreviewReviewPacketBoundary(validInput({ publicUrlVerificationSnapshot: null })).reviewPacketStatus, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.NEEDS_PUBLIC_URL_VERIFICATION)]);
tests.push(['missing release note blocks', () => assert.strictEqual(buildStaticPreviewReviewPacketBoundary(validInput({ releaseNoteSnapshot: null })).reviewPacketStatus, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.NEEDS_RELEASE_NOTE)]);
tests.push(['missing review packet policy blocks', () => assert.strictEqual(buildStaticPreviewReviewPacketBoundary(validInput({ reviewPacketPolicySnapshot: null })).reviewPacketStatus, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.NEEDS_REVIEW_PACKET_POLICY)]);
tests.push(['missing evidence bundle blocks', () => assert.strictEqual(buildStaticPreviewReviewPacketBoundary(validInput({ evidenceBundleSnapshot: null })).reviewPacketStatus, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.NEEDS_EVIDENCE_BUNDLE)]);
tests.push(['missing source ownership blocks', () => assert.strictEqual(buildStaticPreviewReviewPacketBoundary(validInput({ sourceOwnershipSnapshot: null })).reviewPacketStatus, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.NEEDS_SOURCE_OWNERSHIP)]);
tests.push(['missing visual reference blocks', () => assert.strictEqual(buildStaticPreviewReviewPacketBoundary(validInput({ visualReferenceSnapshot: null })).reviewPacketStatus, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.NEEDS_VISUAL_REFERENCE)]);
tests.push(['missing safety checklist blocks', () => assert.strictEqual(buildStaticPreviewReviewPacketBoundary(validInput({ safetyChecklistSnapshot: null })).reviewPacketStatus, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.NEEDS_SAFETY_CHECKLIST)]);
tests.push(['missing roadmap blocks', () => assert.strictEqual(buildStaticPreviewReviewPacketBoundary(validInput({ roadmapSnapshot: null })).reviewPacketStatus, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.NEEDS_ROADMAP)]);
tests.push(['missing reviewer placeholder blocks', () => assert.strictEqual(buildStaticPreviewReviewPacketBoundary(validInput({ reviewerPlaceholderSnapshot: null })).reviewPacketStatus, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.NEEDS_REVIEWER_PLACEHOLDER)]);
tests.push(['missing evidence blocks', () => assert.strictEqual(buildStaticPreviewReviewPacketBoundary(validInput({ evidenceRefs: [] })).reviewPacketStatus, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.NEEDS_EVIDENCE)]);
tests.push(['missing source owner blocks', () => assert.strictEqual(buildStaticPreviewReviewPacketBoundary(validInput({ sourceOwners: [] })).reviewPacketStatus, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.NEEDS_SOURCE_OWNER)]);
tests.push(['missing idempotency key blocks', () => assert.strictEqual(buildStaticPreviewReviewPacketBoundary(validInput({ idempotencyKey: '' })).reviewPacketStatus, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.NEEDS_IDEMPOTENCY_KEY)]);
tests.push(['unsafe review packet blocks', () => assert.strictEqual(buildStaticPreviewReviewPacketBoundary(validInput({ reviewPacketPolicySnapshot: { reviewed: true, reviewPacketDraftOnly: true, publicationAllowed: false, requiresSafetyChecklist: true, unsafeReviewPacket: true } })).reviewPacketStatus, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.UNSAFE_REVIEW_PACKET)]);
tests.push(['publication remains false', () => { const out = buildStaticPreviewReviewPacketBoundary(validInput({ publicationRequested: true })); assert.strictEqual(out.reviewPacketStatus, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.PUBLICATION_NOT_AUTHORIZED); assert.strictEqual(out.publishesReviewPacket, false); }]);
tests.push(['deployment remains false', () => { const out = buildStaticPreviewReviewPacketBoundary(validInput({ deploymentExecutionRequested: true })); assert.strictEqual(out.reviewPacketStatus, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.DEPLOYMENT_EXECUTION_NOT_AUTHORIZED); assert.strictEqual(out.deploysApp, false); }]);
tests.push(['GitHub Pages settings mutation remains false', () => { const out = buildStaticPreviewReviewPacketBoundary(validInput({ githubPagesSettingsMutationRequested: true })); assert.strictEqual(out.reviewPacketStatus, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.GITHUB_PAGES_SETTINGS_MUTATION_NOT_AUTHORIZED); assert.strictEqual(out.mutatesGitHubPagesSettings, false); }]);
tests.push(['public URL creation remains false', () => { const out = buildStaticPreviewReviewPacketBoundary(validInput({ publicUrlCreationRequested: true })); assert.strictEqual(out.reviewPacketStatus, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.PUBLIC_URL_CREATION_NOT_AUTHORIZED); assert.strictEqual(out.createsPublicUrl, false); }]);
tests.push(['public URL verification remains false', () => { const out = buildStaticPreviewReviewPacketBoundary(validInput({ publicUrlVerificationRequested: true })); assert.strictEqual(out.reviewPacketStatus, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.PUBLIC_URL_VERIFICATION_NOT_AUTHORIZED); assert.strictEqual(out.verifiesPublicUrl, false); }]);
tests.push(['network call remains false', () => { const out = buildStaticPreviewReviewPacketBoundary(validInput({ networkCallRequested: true })); assert.strictEqual(out.reviewPacketStatus, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.NETWORK_CALL_NOT_AUTHORIZED); assert.strictEqual(out.performsNetworkCall, false); }]);
tests.push(['HTTP request remains false', () => { const out = buildStaticPreviewReviewPacketBoundary(validInput({ httpRequestRequested: true })); assert.strictEqual(out.reviewPacketStatus, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.HTTP_REQUEST_NOT_AUTHORIZED); assert.strictEqual(out.performsHttpRequest, false); }]);
tests.push(['DNS lookup remains false', () => { const out = buildStaticPreviewReviewPacketBoundary(validInput({ dnsLookupRequested: true })); assert.strictEqual(out.reviewPacketStatus, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.DNS_LOOKUP_NOT_AUTHORIZED); assert.strictEqual(out.performsDnsLookup, false); }]);
tests.push(['API call remains false', () => { const out = buildStaticPreviewReviewPacketBoundary(validInput({ apiCallDetected: true })); assert.strictEqual(out.reviewPacketStatus, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.API_CALL_DETECTED); assert.strictEqual(out.callsApi, false); }]);
tests.push(['tracking remains false', () => { const out = buildStaticPreviewReviewPacketBoundary(validInput({ trackingDetected: true })); assert.strictEqual(out.reviewPacketStatus, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.TRACKING_DETECTED); assert.strictEqual(out.enablesTracking, false); }]);
tests.push(['storage write remains false', () => { const out = buildStaticPreviewReviewPacketBoundary(validInput({ storageWriteDetected: true })); assert.strictEqual(out.reviewPacketStatus, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.STORAGE_WRITE_DETECTED); assert.strictEqual(out.writesStorage, false); }]);
tests.push(['form submission remains false', () => { const out = buildStaticPreviewReviewPacketBoundary(validInput({ formSubmissionDetected: true })); assert.strictEqual(out.reviewPacketStatus, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.FORM_SUBMISSION_DETECTED); assert.strictEqual(out.createsFormSubmission, false); }]);
tests.push(['service worker remains false', () => { const out = buildStaticPreviewReviewPacketBoundary(validInput({ serviceWorkerDetected: true })); assert.strictEqual(out.reviewPacketStatus, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.SERVICE_WORKER_DETECTED); assert.strictEqual(out.registersServiceWorker, false); }]);
tests.push(['CRM mutation remains false', () => { const out = buildStaticPreviewReviewPacketBoundary(validInput({ crmMutationRequested: true })); assert.strictEqual(out.reviewPacketStatus, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.CRM_MUTATION_NOT_AUTHORIZED); assert.strictEqual(out.mutatesCrm, false); }]);
tests.push(['truth creation remains false', () => { const out = buildStaticPreviewReviewPacketBoundary(validInput({ truthCreationRequested: true })); assert.strictEqual(out.reviewPacketStatus, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.TRUTH_CREATION_NOT_AUTHORIZED); assert.strictEqual(out.createsBusinessTruth, false); }]);
tests.push(['action execution remains false', () => { const out = buildStaticPreviewReviewPacketBoundary(validInput({ actionExecutionRequested: true })); assert.strictEqual(out.reviewPacketStatus, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.ACTION_EXECUTION_NOT_AUTHORIZED); assert.strictEqual(out.executesAction, false); }]);
tests.push(['review packet draft can be produced from closed module evidence only', () => { const out = buildStaticPreviewReviewPacketBoundary(validInput()); assert.strictEqual(out.reviewPacketStatus, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.APPROVED_FOR_REVIEW_PACKET_DRAFT); assert.strictEqual(out.approvedForReviewPacketDraft, true); assert.ok(out.reviewPacketEvidence.evidenceOnly); }]);
tests.push(['packet includes closed module list', () => { const out = buildStaticPreviewReviewPacketBoundary(validInput()); assert.ok(out.reviewPacketDraft.includes('Closed modules')); assert.ok(out.reviewPacketDraft.includes('048B Static Preview Release Note Boundary')); }]);
tests.push(['packet includes release note draft', () => { const out = buildStaticPreviewReviewPacketBoundary(validInput()); assert.ok(out.reviewPacketDraft.includes('Release note draft')); }]);
tests.push(['packet includes safety checklist', () => { const out = buildStaticPreviewReviewPacketBoundary(validInput()); assert.ok(out.reviewPacketDraft.includes('Safety checklist')); assert.ok(out.reviewChecklist.includes('No publish confirmed')); }]);
tests.push(['packet includes sample data read-only not production warning', () => { const out = buildStaticPreviewReviewPacketBoundary(validInput()); assert.ok(out.reviewPacketDraft.includes('sample data only')); assert.ok(out.reviewPacketDraft.includes('read-only')); assert.ok(out.reviewPacketDraft.includes('not production')); }]);
tests.push(['packet includes Review packet is not publication authorization', () => { const out = buildStaticPreviewReviewPacketBoundary(validInput()); assert.ok(out.reviewPacketDraft.includes('Review packet is not publication authorization')); }]);
tests.push(['packet includes evidence refs', () => { const out = buildStaticPreviewReviewPacketBoundary(validInput()); assert.ok(out.reviewPacketDraft.includes('048B-certificate')); }]);
tests.push(['packet includes next phase', () => { const out = buildStaticPreviewReviewPacketBoundary(validInput()); assert.ok(out.reviewPacketDraft.includes('050A_FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_SCOPE')); }]);
tests.push(['Evidence refs source evidence IDs source owners dedupe', () => { const out = buildStaticPreviewReviewPacketBoundary(validInput()); assert.deepStrictEqual(out.evidenceRefs, ['048B-certificate']); assert.deepStrictEqual(out.sourceEvidenceIds, ['8e50289']); assert.deepStrictEqual(out.sourceOwners, ['Forge Architecture']); }]);
tests.push(['inputs are not mutated', () => { const input = validInput(); const before = JSON.stringify(input); buildStaticPreviewReviewPacketBoundary(input); assert.strictEqual(JSON.stringify(input), before); }]);
tests.push(['Metric Economic Truth remains separate', () => { const out = buildStaticPreviewReviewPacketBoundary(validInput()); assert.strictEqual(out.metricEconomicTruthRemainsSeparate, true); }]);

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
console.log(`Static Preview Review Packet Boundary Contract PASS ${passed}/${tests.length}`);
