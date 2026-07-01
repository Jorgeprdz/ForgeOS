const assert = require('assert');
const {
  buildStaticPreviewReleaseNoteBoundary,
  STATIC_PREVIEW_RELEASE_NOTE_STATUSES,
  STATIC_PREVIEW_RELEASE_NOTE_ALLOWED_USES,
  STATIC_PREVIEW_RELEASE_NOTE_FORBIDDEN_USES,
} = require('../static-preview-release-note/static-preview-release-note-boundary-contract');

function futureDate() {
  return new Date(Date.now() + 86400000).toISOString();
}

function validInput(overrides = {}) {
  return {
    releaseNoteRequestId: 'release-note-1',
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
      warnings: ['evidence-review only'],
      limitations: ['no live verification'],
    },
    releaseNotePolicySnapshot: {
      reviewed: true,
      releaseNoteDraftOnly: true,
      publicationAllowed: false,
      requiresSafetyLanguage: true,
      unsafeReleaseNote: false,
      warnings: ['release note is not publication authorization'],
      limitations: ['draft only'],
    },
    audienceSnapshot: {
      reviewed: true,
      audience: 'Forge reviewers',
    },
    messagingBoundarySnapshot: {
      reviewed: true,
      explainsWhatItIs: true,
      explainsWhatItIsNot: true,
      noClaimsOfProduction: true,
      unsafeLanguage: false,
    },
    safetyBoundarySnapshot: {
      reviewed: true,
      noPublish: true,
      noDeploy: true,
      noNetwork: true,
      noPublicUrlCreation: true,
      noPublicUrlVerification: true,
    },
    evidenceBundleSnapshot: {
      reviewed: true,
      complete: true,
    },
    sourceOwnershipSnapshot: {
      reviewed: true,
      sourceOwned: true,
    },
    roadmapSnapshot: {
      reviewed: true,
      nextPhase: '049A_STATIC_PREVIEW_REVIEW_PACKET_SCOPE',
    },
    evidenceRefs: ['047B-certificate', '047B-certificate'],
    sourceEvidenceIds: ['c852c20', 'c852c20'],
    sourceOwners: ['Forge Architecture', 'Forge Architecture'],
    idempotencyKey: 'release-note-idem-1',
    requestedUse: 'RELEASE_NOTE_DRAFT_PREP',
    expiresAt: futureDate(),
    now: new Date().toISOString(),
    ...overrides,
  };
}

function assertAllForbiddenRemainFalse(output) {
  const flags = [
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
  assert.ok(STATIC_PREVIEW_RELEASE_NOTE_ALLOWED_USES.includes('RELEASE_NOTE_DRAFT_PREP'));
  assert.ok(STATIC_PREVIEW_RELEASE_NOTE_FORBIDDEN_USES.includes('PUBLICATION'));
  const out = buildStaticPreviewReleaseNoteBoundary(validInput({ staticPreviewImplementationSnapshot: null }));
  assert.strictEqual(out.releaseNoteStatus, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.NEEDS_STATIC_PREVIEW_IMPLEMENTATION);
  assertAllForbiddenRemainFalse(out);
}]);
tests.push(['missing public surface decision blocks', () => assert.strictEqual(buildStaticPreviewReleaseNoteBoundary(validInput({ publicSurfaceDecisionSnapshot: null })).releaseNoteStatus, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.NEEDS_PUBLIC_SURFACE_DECISION)]);
tests.push(['missing public URL verification blocks', () => assert.strictEqual(buildStaticPreviewReleaseNoteBoundary(validInput({ publicUrlVerificationSnapshot: null })).releaseNoteStatus, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.NEEDS_PUBLIC_URL_VERIFICATION)]);
tests.push(['missing release note policy blocks', () => assert.strictEqual(buildStaticPreviewReleaseNoteBoundary(validInput({ releaseNotePolicySnapshot: null })).releaseNoteStatus, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.NEEDS_RELEASE_NOTE_POLICY)]);
tests.push(['missing audience blocks', () => assert.strictEqual(buildStaticPreviewReleaseNoteBoundary(validInput({ audienceSnapshot: null })).releaseNoteStatus, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.NEEDS_AUDIENCE)]);
tests.push(['missing messaging boundary blocks', () => assert.strictEqual(buildStaticPreviewReleaseNoteBoundary(validInput({ messagingBoundarySnapshot: null })).releaseNoteStatus, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.NEEDS_MESSAGING_BOUNDARY)]);
tests.push(['missing safety boundary blocks', () => assert.strictEqual(buildStaticPreviewReleaseNoteBoundary(validInput({ safetyBoundarySnapshot: null })).releaseNoteStatus, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.NEEDS_SAFETY_BOUNDARY)]);
tests.push(['missing evidence bundle blocks', () => assert.strictEqual(buildStaticPreviewReleaseNoteBoundary(validInput({ evidenceBundleSnapshot: null })).releaseNoteStatus, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.NEEDS_EVIDENCE_BUNDLE)]);
tests.push(['missing source ownership blocks', () => assert.strictEqual(buildStaticPreviewReleaseNoteBoundary(validInput({ sourceOwnershipSnapshot: null })).releaseNoteStatus, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.NEEDS_SOURCE_OWNERSHIP)]);
tests.push(['missing roadmap blocks', () => assert.strictEqual(buildStaticPreviewReleaseNoteBoundary(validInput({ roadmapSnapshot: null })).releaseNoteStatus, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.NEEDS_ROADMAP)]);
tests.push(['missing evidence blocks', () => assert.strictEqual(buildStaticPreviewReleaseNoteBoundary(validInput({ evidenceRefs: [] })).releaseNoteStatus, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.NEEDS_EVIDENCE)]);
tests.push(['missing source owner blocks', () => assert.strictEqual(buildStaticPreviewReleaseNoteBoundary(validInput({ sourceOwners: [] })).releaseNoteStatus, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.NEEDS_SOURCE_OWNER)]);
tests.push(['missing idempotency key blocks', () => assert.strictEqual(buildStaticPreviewReleaseNoteBoundary(validInput({ idempotencyKey: '' })).releaseNoteStatus, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.NEEDS_IDEMPOTENCY_KEY)]);
tests.push(['unsafe release note blocks', () => assert.strictEqual(buildStaticPreviewReleaseNoteBoundary(validInput({ releaseNotePolicySnapshot: { reviewed: true, releaseNoteDraftOnly: true, publicationAllowed: false, requiresSafetyLanguage: true, unsafeReleaseNote: true } })).releaseNoteStatus, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.UNSAFE_RELEASE_NOTE)]);
tests.push(['publication remains false', () => { const out = buildStaticPreviewReleaseNoteBoundary(validInput({ publicationRequested: true })); assert.strictEqual(out.releaseNoteStatus, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.PUBLICATION_NOT_AUTHORIZED); assert.strictEqual(out.publishesReleaseNote, false); }]);
tests.push(['deployment remains false', () => { const out = buildStaticPreviewReleaseNoteBoundary(validInput({ deploymentExecutionRequested: true })); assert.strictEqual(out.releaseNoteStatus, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.DEPLOYMENT_EXECUTION_NOT_AUTHORIZED); assert.strictEqual(out.deploysApp, false); }]);
tests.push(['GitHub Pages settings mutation remains false', () => { const out = buildStaticPreviewReleaseNoteBoundary(validInput({ githubPagesSettingsMutationRequested: true })); assert.strictEqual(out.releaseNoteStatus, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.GITHUB_PAGES_SETTINGS_MUTATION_NOT_AUTHORIZED); assert.strictEqual(out.mutatesGitHubPagesSettings, false); }]);
tests.push(['public URL creation remains false', () => { const out = buildStaticPreviewReleaseNoteBoundary(validInput({ publicUrlCreationRequested: true })); assert.strictEqual(out.releaseNoteStatus, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.PUBLIC_URL_CREATION_NOT_AUTHORIZED); assert.strictEqual(out.createsPublicUrl, false); }]);
tests.push(['public URL verification remains false', () => { const out = buildStaticPreviewReleaseNoteBoundary(validInput({ publicUrlVerificationRequested: true })); assert.strictEqual(out.releaseNoteStatus, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.PUBLIC_URL_VERIFICATION_NOT_AUTHORIZED); assert.strictEqual(out.verifiesPublicUrl, false); }]);
tests.push(['network call remains false', () => { const out = buildStaticPreviewReleaseNoteBoundary(validInput({ networkCallRequested: true })); assert.strictEqual(out.releaseNoteStatus, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.NETWORK_CALL_NOT_AUTHORIZED); assert.strictEqual(out.performsNetworkCall, false); }]);
tests.push(['HTTP request remains false', () => { const out = buildStaticPreviewReleaseNoteBoundary(validInput({ httpRequestRequested: true })); assert.strictEqual(out.releaseNoteStatus, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.HTTP_REQUEST_NOT_AUTHORIZED); assert.strictEqual(out.performsHttpRequest, false); }]);
tests.push(['DNS lookup remains false', () => { const out = buildStaticPreviewReleaseNoteBoundary(validInput({ dnsLookupRequested: true })); assert.strictEqual(out.releaseNoteStatus, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.DNS_LOOKUP_NOT_AUTHORIZED); assert.strictEqual(out.performsDnsLookup, false); }]);
tests.push(['API call remains false', () => { const out = buildStaticPreviewReleaseNoteBoundary(validInput({ apiCallDetected: true })); assert.strictEqual(out.releaseNoteStatus, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.API_CALL_DETECTED); assert.strictEqual(out.callsApi, false); }]);
tests.push(['tracking remains false', () => { const out = buildStaticPreviewReleaseNoteBoundary(validInput({ trackingDetected: true })); assert.strictEqual(out.releaseNoteStatus, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.TRACKING_DETECTED); assert.strictEqual(out.enablesTracking, false); }]);
tests.push(['storage write remains false', () => { const out = buildStaticPreviewReleaseNoteBoundary(validInput({ storageWriteDetected: true })); assert.strictEqual(out.releaseNoteStatus, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.STORAGE_WRITE_DETECTED); assert.strictEqual(out.writesStorage, false); }]);
tests.push(['form submission remains false', () => { const out = buildStaticPreviewReleaseNoteBoundary(validInput({ formSubmissionDetected: true })); assert.strictEqual(out.releaseNoteStatus, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.FORM_SUBMISSION_DETECTED); assert.strictEqual(out.createsFormSubmission, false); }]);
tests.push(['service worker remains false', () => { const out = buildStaticPreviewReleaseNoteBoundary(validInput({ serviceWorkerDetected: true })); assert.strictEqual(out.releaseNoteStatus, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.SERVICE_WORKER_DETECTED); assert.strictEqual(out.registersServiceWorker, false); }]);
tests.push(['CRM mutation remains false', () => { const out = buildStaticPreviewReleaseNoteBoundary(validInput({ crmMutationRequested: true })); assert.strictEqual(out.releaseNoteStatus, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.CRM_MUTATION_NOT_AUTHORIZED); assert.strictEqual(out.mutatesCrm, false); }]);
tests.push(['truth creation remains false', () => { const out = buildStaticPreviewReleaseNoteBoundary(validInput({ truthCreationRequested: true })); assert.strictEqual(out.releaseNoteStatus, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.TRUTH_CREATION_NOT_AUTHORIZED); assert.strictEqual(out.createsBusinessTruth, false); }]);
tests.push(['action execution remains false', () => { const out = buildStaticPreviewReleaseNoteBoundary(validInput({ actionExecutionRequested: true })); assert.strictEqual(out.releaseNoteStatus, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.ACTION_EXECUTION_NOT_AUTHORIZED); assert.strictEqual(out.executesAction, false); }]);
tests.push(['release note draft can be produced from closed module evidence only', () => { const out = buildStaticPreviewReleaseNoteBoundary(validInput()); assert.strictEqual(out.releaseNoteStatus, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.APPROVED_FOR_RELEASE_NOTE_DRAFT); assert.strictEqual(out.approvedForReleaseNoteDraft, true); assert.ok(out.releaseNoteEvidence.evidenceOnly); }]);
tests.push(['draft includes what Forge Alive is', () => { const out = buildStaticPreviewReleaseNoteBoundary(validInput()); assert.ok(out.releaseNoteDraft.includes('Forge Alive static preview is')); }]);
tests.push(['draft includes what Forge Alive is not', () => { const out = buildStaticPreviewReleaseNoteBoundary(validInput()); assert.ok(out.releaseNoteDraft.includes('not production')); }]);
tests.push(['draft includes sample data read-only not production warning', () => { const out = buildStaticPreviewReleaseNoteBoundary(validInput()); assert.ok(out.releaseNoteDraft.includes('sample data only')); assert.ok(out.releaseNoteDraft.includes('read-only')); }]);
tests.push(['draft includes GitHub Pages availability warning', () => { const out = buildStaticPreviewReleaseNoteBoundary(validInput()); assert.ok(out.releaseNoteDraft.includes('GitHub Pages availability is not deployment authorization')); }]);
tests.push(['draft includes no network deploy publish boundary', () => { const out = buildStaticPreviewReleaseNoteBoundary(validInput()); assert.ok(out.releaseNoteDraft.includes('No publish, no deploy')); assert.ok(out.releaseNoteDraft.includes('No network call')); }]);
tests.push(['draft includes evidence refs', () => { const out = buildStaticPreviewReleaseNoteBoundary(validInput()); assert.ok(out.releaseNoteDraft.includes('047B-certificate')); }]);
tests.push(['draft includes next phase', () => { const out = buildStaticPreviewReleaseNoteBoundary(validInput()); assert.ok(out.releaseNoteDraft.includes('049A_STATIC_PREVIEW_REVIEW_PACKET_SCOPE')); }]);
tests.push(['warnings and limitations remain visible', () => { const out = buildStaticPreviewReleaseNoteBoundary(validInput()); assert.ok(out.warnings.includes('release note is not publication authorization')); assert.ok(out.limitations.includes('draft only')); }]);
tests.push(['Evidence refs source evidence IDs source owners dedupe', () => { const out = buildStaticPreviewReleaseNoteBoundary(validInput()); assert.deepStrictEqual(out.evidenceRefs, ['047B-certificate']); assert.deepStrictEqual(out.sourceEvidenceIds, ['c852c20']); assert.deepStrictEqual(out.sourceOwners, ['Forge Architecture']); }]);
tests.push(['inputs are not mutated', () => { const input = validInput(); const before = JSON.stringify(input); buildStaticPreviewReleaseNoteBoundary(input); assert.strictEqual(JSON.stringify(input), before); }]);
tests.push(['Metric Economic Truth remains separate', () => { const out = buildStaticPreviewReleaseNoteBoundary(validInput()); assert.strictEqual(out.metricEconomicTruthRemainsSeparate, true); }]);

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
console.log(`Static Preview Release Note Boundary Contract PASS ${passed}/${tests.length}`);
