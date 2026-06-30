const assert = require('assert');
const {
  buildStaticPreviewPublicSurfaceDecisionBoundary,
  STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES,
  STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_ALLOWED_USES,
  STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_FORBIDDEN_USES,
} = require('../static-preview-public-surface-decision/static-preview-public-surface-decision-boundary-contract');

function futureDate() {
  return new Date(Date.now() + 86400000).toISOString();
}

function validInput(overrides = {}) {
  return {
    publicSurfaceDecisionRequestId: 'public-surface-decision-1',
    publicSurfaceCandidateSnapshot: {
      reviewed: true,
      eligibleForPublicSurfaceReview: true,
      reviewOnly: true,
      readOnly: true,
      sampleDataOnly: true,
      notProduction: true,
      approvedForDeploymentExecution: false,
      approvedForGitHubPagesSettingsMutation: false,
      warnings: ['candidate review only'],
      limitations: ['not deployment'],
    },
    staticPreviewDeploymentBoundarySnapshot: {
      implemented: true,
      publicSurfaceCandidateReviewOnly: true,
      approvedForDeploymentExecution: false,
      approvedForGitHubPagesSettingsMutation: false,
      createsPublicUrl: false,
      verifiesPublicUrl: false,
      warnings: ['deployment boundary says review only'],
      limitations: ['no url verification'],
    },
    ownerApprovalSnapshot: {
      reviewed: true,
      approved: true,
      owner: 'Forge Owner',
      ownerApprovalId: 'owner-approval-1',
    },
    ownerIdentitySnapshot: {
      reviewed: true,
      ownerId: 'owner-1',
      ownerName: 'Forge Owner',
    },
    evidenceBundleSnapshot: {
      reviewed: true,
      complete: true,
      bundleId: 'evidence-bundle-1',
    },
    riskAcceptanceSnapshot: {
      reviewed: true,
      accepted: true,
      publicSurfaceRiskAccepted: true,
    },
    rollbackPlanSnapshot: {
      reviewed: true,
      planAvailable: true,
      steps: ['rollback by reverting decision record'],
    },
    expirationWindowSnapshot: {
      reviewed: true,
      reviewWindowVisible: true,
      expiresAt: futureDate(),
      notes: ['review window visible'],
    },
    publicSurfaceLabelingSnapshot: {
      reviewed: true,
      sampleDataLabelVisible: true,
      readOnlyLabelVisible: true,
      notProductionLabelVisible: true,
    },
    sampleDataAuditSnapshot: {
      reviewed: true,
      safeSampleDataOnly: true,
      containsProductionData: false,
      containsProductionPii: false,
      unsafeSampleData: false,
    },
    secretsScanSnapshot: {
      scanned: true,
      secretDetected: false,
    },
    apiScanSnapshot: {
      scanned: true,
      apiCallDetected: false,
    },
    trackingScanSnapshot: {
      scanned: true,
      trackingDetected: false,
    },
    storageScanSnapshot: {
      scanned: true,
      storageWriteDetected: false,
    },
    formsScanSnapshot: {
      scanned: true,
      formSubmissionDetected: false,
    },
    serviceWorkerScanSnapshot: {
      scanned: true,
      serviceWorkerDetected: false,
    },
    repositoryVisibilitySnapshot: {
      reviewed: true,
      visibility: 'PRIVATE',
      explicitPublicRepositoryRiskReview: false,
    },
    githubPagesConfigurationSnapshot: {
      reviewed: true,
      available: true,
      settingsMutationRequested: false,
      publishRequested: false,
      deploymentRequested: false,
      publicUrlCreationRequested: false,
      publicUrlVerificationRequested: false,
      warnings: ['availability is not deployment authorization'],
    },
    decisionScopeSnapshot: {
      reviewed: true,
      ownerDecisionOnly: true,
      deploymentExecutionAllowed: false,
      githubPagesSettingsMutationAllowed: false,
      publicUrlCreationAllowed: false,
      publicUrlVerificationAllowed: false,
    },
    evidenceRefs: ['045B-certificate'],
    sourceEvidenceIds: ['b69e3d7'],
    sourceOwners: ['Forge Architecture'],
    idempotencyKey: 'public-surface-decision-idem-1',
    requestedUse: 'PUBLIC_SURFACE_DECISION_RECORD_PREP',
    now: new Date().toISOString(),
    ...overrides,
  };
}

function assertAllForbiddenRemainFalse(output) {
  const flags = [
    'approvedForDeploymentExecution',
    'approvedForGitHubPagesSettingsMutation',
    'createsPublicUrl',
    'verifiesPublicUrl',
    'mutatesDns',
    'configuresCustomDomain',
    'deploysApp',
    'publishesGitHubPages',
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
tests.push(['missing public surface candidate blocks', () => {
  assert.ok(STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_ALLOWED_USES.includes('PUBLIC_SURFACE_DECISION_RECORD_PREP'));
  assert.ok(STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_FORBIDDEN_USES.includes('PUBLIC_URL_VERIFICATION'));
  const out = buildStaticPreviewPublicSurfaceDecisionBoundary(validInput({ publicSurfaceCandidateSnapshot: null }));
  assert.strictEqual(out.publicSurfaceDecisionStatus, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.NEEDS_PUBLIC_SURFACE_CANDIDATE);
  assertAllForbiddenRemainFalse(out);
}]);
tests.push(['missing static preview deployment boundary blocks', () => assert.strictEqual(buildStaticPreviewPublicSurfaceDecisionBoundary(validInput({ staticPreviewDeploymentBoundarySnapshot: null })).publicSurfaceDecisionStatus, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.NEEDS_STATIC_PREVIEW_DEPLOYMENT_BOUNDARY)]);
tests.push(['missing owner approval blocks', () => assert.strictEqual(buildStaticPreviewPublicSurfaceDecisionBoundary(validInput({ ownerApprovalSnapshot: null })).publicSurfaceDecisionStatus, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.NEEDS_OWNER_APPROVAL)]);
tests.push(['missing owner identity blocks', () => assert.strictEqual(buildStaticPreviewPublicSurfaceDecisionBoundary(validInput({ ownerIdentitySnapshot: null })).publicSurfaceDecisionStatus, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.NEEDS_OWNER_IDENTITY)]);
tests.push(['missing evidence bundle blocks', () => assert.strictEqual(buildStaticPreviewPublicSurfaceDecisionBoundary(validInput({ evidenceBundleSnapshot: null })).publicSurfaceDecisionStatus, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.NEEDS_EVIDENCE_BUNDLE)]);
tests.push(['missing risk acceptance blocks', () => assert.strictEqual(buildStaticPreviewPublicSurfaceDecisionBoundary(validInput({ riskAcceptanceSnapshot: null })).publicSurfaceDecisionStatus, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.NEEDS_RISK_ACCEPTANCE)]);
tests.push(['missing rollback plan blocks', () => assert.strictEqual(buildStaticPreviewPublicSurfaceDecisionBoundary(validInput({ rollbackPlanSnapshot: null })).publicSurfaceDecisionStatus, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.NEEDS_ROLLBACK_PLAN)]);
tests.push(['missing expiration window blocks', () => assert.strictEqual(buildStaticPreviewPublicSurfaceDecisionBoundary(validInput({ expirationWindowSnapshot: null })).publicSurfaceDecisionStatus, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.NEEDS_EXPIRATION_WINDOW)]);
tests.push(['missing public surface labeling blocks', () => assert.strictEqual(buildStaticPreviewPublicSurfaceDecisionBoundary(validInput({ publicSurfaceLabelingSnapshot: null })).publicSurfaceDecisionStatus, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.NEEDS_PUBLIC_SURFACE_LABELING)]);
tests.push(['missing sample data audit blocks', () => assert.strictEqual(buildStaticPreviewPublicSurfaceDecisionBoundary(validInput({ sampleDataAuditSnapshot: null })).publicSurfaceDecisionStatus, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.NEEDS_SAMPLE_DATA_AUDIT)]);
tests.push(['missing no-secrets scan blocks', () => assert.strictEqual(buildStaticPreviewPublicSurfaceDecisionBoundary(validInput({ secretsScanSnapshot: null })).publicSurfaceDecisionStatus, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.NEEDS_NO_SECRETS_SCAN)]);
tests.push(['missing no-API scan blocks', () => assert.strictEqual(buildStaticPreviewPublicSurfaceDecisionBoundary(validInput({ apiScanSnapshot: null })).publicSurfaceDecisionStatus, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.NEEDS_NO_API_SCAN)]);
tests.push(['missing no-tracking scan blocks', () => assert.strictEqual(buildStaticPreviewPublicSurfaceDecisionBoundary(validInput({ trackingScanSnapshot: null })).publicSurfaceDecisionStatus, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.NEEDS_NO_TRACKING_SCAN)]);
tests.push(['missing no-storage scan blocks', () => assert.strictEqual(buildStaticPreviewPublicSurfaceDecisionBoundary(validInput({ storageScanSnapshot: null })).publicSurfaceDecisionStatus, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.NEEDS_NO_STORAGE_SCAN)]);
tests.push(['missing no-forms scan blocks', () => assert.strictEqual(buildStaticPreviewPublicSurfaceDecisionBoundary(validInput({ formsScanSnapshot: null })).publicSurfaceDecisionStatus, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.NEEDS_NO_FORMS_SCAN)]);
tests.push(['missing no-service-worker scan blocks', () => assert.strictEqual(buildStaticPreviewPublicSurfaceDecisionBoundary(validInput({ serviceWorkerScanSnapshot: null })).publicSurfaceDecisionStatus, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.NEEDS_NO_SERVICE_WORKER_SCAN)]);
tests.push(['missing repository visibility review blocks', () => assert.strictEqual(buildStaticPreviewPublicSurfaceDecisionBoundary(validInput({ repositoryVisibilitySnapshot: null })).publicSurfaceDecisionStatus, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.NEEDS_REPOSITORY_VISIBILITY_REVIEW)]);
tests.push(['missing GitHub Pages configuration blocks', () => assert.strictEqual(buildStaticPreviewPublicSurfaceDecisionBoundary(validInput({ githubPagesConfigurationSnapshot: null })).publicSurfaceDecisionStatus, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.NEEDS_GITHUB_PAGES_CONFIGURATION)]);
tests.push(['missing decision scope blocks', () => assert.strictEqual(buildStaticPreviewPublicSurfaceDecisionBoundary(validInput({ decisionScopeSnapshot: null })).publicSurfaceDecisionStatus, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.NEEDS_DECISION_SCOPE)]);
tests.push(['missing evidence blocks', () => assert.strictEqual(buildStaticPreviewPublicSurfaceDecisionBoundary(validInput({ evidenceRefs: [] })).publicSurfaceDecisionStatus, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.NEEDS_EVIDENCE)]);
tests.push(['missing source owner blocks', () => assert.strictEqual(buildStaticPreviewPublicSurfaceDecisionBoundary(validInput({ sourceOwners: [] })).publicSurfaceDecisionStatus, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.NEEDS_SOURCE_OWNER)]);
tests.push(['missing idempotency key blocks', () => assert.strictEqual(buildStaticPreviewPublicSurfaceDecisionBoundary(validInput({ idempotencyKey: '' })).publicSurfaceDecisionStatus, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.NEEDS_IDEMPOTENCY_KEY)]);
tests.push(['public repository risk requires explicit review', () => assert.strictEqual(buildStaticPreviewPublicSurfaceDecisionBoundary(validInput({ repositoryVisibilitySnapshot: { reviewed: true, visibility: 'PUBLIC', explicitPublicRepositoryRiskReview: false } })).publicSurfaceDecisionStatus, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.PUBLIC_REPOSITORY_RISK_REVIEW)]);
tests.push(['unsafe sample data blocks', () => assert.strictEqual(buildStaticPreviewPublicSurfaceDecisionBoundary(validInput({ sampleDataAuditSnapshot: { reviewed: true, safeSampleDataOnly: true, containsProductionData: false, containsProductionPii: false, unsafeSampleData: true } })).publicSurfaceDecisionStatus, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.UNSAFE_SAMPLE_DATA)]);
tests.push(['production data blocks', () => assert.strictEqual(buildStaticPreviewPublicSurfaceDecisionBoundary(validInput({ sampleDataAuditSnapshot: { reviewed: true, safeSampleDataOnly: true, containsProductionData: true, containsProductionPii: false, unsafeSampleData: false } })).publicSurfaceDecisionStatus, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.PRODUCTION_DATA_DETECTED)]);
tests.push(['secret scan failure blocks', () => assert.strictEqual(buildStaticPreviewPublicSurfaceDecisionBoundary(validInput({ secretsScanSnapshot: { scanned: true, secretDetected: true } })).publicSurfaceDecisionStatus, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.SECRET_DETECTED)]);
tests.push(['API scan failure blocks', () => assert.strictEqual(buildStaticPreviewPublicSurfaceDecisionBoundary(validInput({ apiScanSnapshot: { scanned: true, apiCallDetected: true } })).publicSurfaceDecisionStatus, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.API_CALL_DETECTED)]);
tests.push(['tracking scan failure blocks', () => assert.strictEqual(buildStaticPreviewPublicSurfaceDecisionBoundary(validInput({ trackingScanSnapshot: { scanned: true, trackingDetected: true } })).publicSurfaceDecisionStatus, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.TRACKING_DETECTED)]);
tests.push(['storage scan failure blocks', () => assert.strictEqual(buildStaticPreviewPublicSurfaceDecisionBoundary(validInput({ storageScanSnapshot: { scanned: true, storageWriteDetected: true } })).publicSurfaceDecisionStatus, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.STORAGE_WRITE_DETECTED)]);
tests.push(['form scan failure blocks', () => assert.strictEqual(buildStaticPreviewPublicSurfaceDecisionBoundary(validInput({ formsScanSnapshot: { scanned: true, formSubmissionDetected: true } })).publicSurfaceDecisionStatus, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.FORM_SUBMISSION_DETECTED)]);
tests.push(['service worker scan failure blocks', () => assert.strictEqual(buildStaticPreviewPublicSurfaceDecisionBoundary(validInput({ serviceWorkerScanSnapshot: { scanned: true, serviceWorkerDetected: true } })).publicSurfaceDecisionStatus, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.SERVICE_WORKER_DETECTED)]);
tests.push(['owner rejection returns REJECTED_PUBLIC_SURFACE_DECISION', () => assert.strictEqual(buildStaticPreviewPublicSurfaceDecisionBoundary(validInput({ ownerApprovalSnapshot: { reviewed: true, approved: false, rejected: true, owner: 'Forge Owner' } })).publicSurfaceDecisionStatus, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.REJECTED_PUBLIC_SURFACE_DECISION)]);
tests.push(['actual deployment execution remains false', () => { const out = buildStaticPreviewPublicSurfaceDecisionBoundary(validInput({ deploymentExecutionRequested: true })); assert.strictEqual(out.publicSurfaceDecisionStatus, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.DEPLOYMENT_EXECUTION_NOT_AUTHORIZED); assert.strictEqual(out.approvedForDeploymentExecution, false); }]);
tests.push(['GitHub Pages settings mutation remains false', () => { const out = buildStaticPreviewPublicSurfaceDecisionBoundary(validInput({ githubPagesSettingsMutationRequested: true })); assert.strictEqual(out.publicSurfaceDecisionStatus, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.GITHUB_PAGES_SETTINGS_MUTATION_NOT_AUTHORIZED); assert.strictEqual(out.approvedForGitHubPagesSettingsMutation, false); }]);
tests.push(['public URL creation verification remains false', () => { const out = buildStaticPreviewPublicSurfaceDecisionBoundary(validInput({ publicUrlCreationRequested: true })); assert.strictEqual(out.publicSurfaceDecisionStatus, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.PUBLIC_URL_CREATION_NOT_AUTHORIZED); assert.strictEqual(out.createsPublicUrl, false); assert.strictEqual(out.verifiesPublicUrl, false); }]);
tests.push(['DNS custom domain remains false', () => { const out = buildStaticPreviewPublicSurfaceDecisionBoundary(validInput({ dnsMutationRequested: true })); assert.strictEqual(out.publicSurfaceDecisionStatus, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.DNS_MUTATION_NOT_AUTHORIZED); assert.strictEqual(out.mutatesDns, false); assert.strictEqual(out.configuresCustomDomain, false); }]);
tests.push(['API auth analytics storage remain false', () => { const out = buildStaticPreviewPublicSurfaceDecisionBoundary(validInput()); assert.strictEqual(out.callsApi, false); assert.strictEqual(out.enablesAuth, false); assert.strictEqual(out.enablesAnalytics, false); assert.strictEqual(out.writesStorage, false); }]);
tests.push(['CRM task calendar truth action remain false', () => { const out = buildStaticPreviewPublicSurfaceDecisionBoundary(validInput()); assert.strictEqual(out.mutatesCrm, false); assert.strictEqual(out.createsTask, false); assert.strictEqual(out.createsCalendarEvent, false); assert.strictEqual(out.createsBusinessTruth, false); assert.strictEqual(out.executesAction, false); }]);
tests.push(['public surface decision record can be prepared after all safety evidence passes', () => { const out = buildStaticPreviewPublicSurfaceDecisionBoundary(validInput()); assert.strictEqual(out.publicSurfaceDecisionStatus, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.APPROVED_PUBLIC_SURFACE_DECISION); assert.strictEqual(out.approvedForPublicSurfaceDecision, true); assert.strictEqual(out.ownerDecisionRecord.reviewOnly, true); }]);
tests.push(['warnings limitations rollback and expiration remain visible', () => { const out = buildStaticPreviewPublicSurfaceDecisionBoundary(validInput()); assert.ok(out.warnings.includes('candidate review only')); assert.ok(out.limitations.includes('not deployment')); assert.ok(out.rollbackNotes.join(' ').includes('Rollback')); assert.ok(out.expirationNotes.join(' ').includes('expires')); }]);
tests.push(['inputs are not mutated', () => { const input = validInput(); const before = JSON.stringify(input); buildStaticPreviewPublicSurfaceDecisionBoundary(input); assert.strictEqual(JSON.stringify(input), before); }]);
tests.push(['Metric Economic Truth remains separate', () => { const out = buildStaticPreviewPublicSurfaceDecisionBoundary(validInput()); assert.strictEqual(out.metricEconomicTruthRemainsSeparate, true); }]);

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
console.log(`Static Preview Public Surface Decision Boundary Contract PASS ${passed}/${tests.length}`);
