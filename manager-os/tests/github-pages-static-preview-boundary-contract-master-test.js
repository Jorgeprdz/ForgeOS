const assert = require('assert');
const {
  buildGithubPagesStaticPreviewBoundary,
  GITHUB_PAGES_STATIC_PREVIEW_STATUSES,
  GITHUB_PAGES_STATIC_PREVIEW_ALLOWED_USES,
  GITHUB_PAGES_STATIC_PREVIEW_FORBIDDEN_USES,
} = require('../github-pages-static-preview/github-pages-static-preview-boundary-contract');

const futureDate = () => new Date(Date.now() + 86400000).toISOString();

function validInput(overrides = {}) {
  return {
    staticPreviewRequestId: 'static-preview-1',
    forgeAliveShellRequestId: 'shell-1',
    viewerRole: 'ADVISOR',
    forgeAliveShellSnapshot: {
      forgeAliveShellRequestId: 'shell-1',
      eligibleForForgeAliveShellCandidate: true,
      forgeAliveShellCandidate: {
        readOnly: true,
        shellName: 'Forge Alive Shell',
      },
      warnings: ['shell candidate only'],
      limitations: ['not live app'],
    },
    forgeAliveShellCandidate: {
      readOnly: true,
      shellName: 'Forge Alive Shell',
    },
    githubPagesAvailabilitySnapshot: {
      reviewed: true,
      available: true,
      deploymentAuthorized: false,
      publishAllowed: false,
    },
    staticPreviewPolicySnapshot: {
      reviewed: true,
      allowed: true,
      readOnly: true,
      staticOnly: true,
      publishesGitHubPages: false,
      deploysApp: false,
      rendersLiveUi: false,
    },
    sampleDataPolicySnapshot: {
      reviewed: true,
      allowed: true,
      safeSampleDataOnly: true,
      notProduction: true,
      containsProductionPii: false,
      containsSecrets: false,
    },
    privacyPolicySnapshot: {
      reviewed: true,
      allowed: true,
      surveillanceAllowed: false,
      exposesRestrictedData: false,
      personalityTruthAllowed: false,
    },
    hostingSafetyPolicySnapshot: {
      reviewed: true,
      allowed: true,
      deploysApp: false,
      publishesGitHubPages: false,
      callsExternalApi: false,
    },
    noSecretsPolicySnapshot: {
      reviewed: true,
      allowed: true,
      noSecrets: true,
      containsSecrets: false,
    },
    noApiPolicySnapshot: {
      reviewed: true,
      allowed: true,
      noApiCalls: true,
      callsApi: false,
      callsProviderApi: false,
      callsExternalApi: false,
    },
    noTrackingPolicySnapshot: {
      reviewed: true,
      allowed: true,
      noTracking: true,
      enablesAnalytics: false,
      enablesTracking: false,
    },
    noStoragePolicySnapshot: {
      reviewed: true,
      allowed: true,
      noStorageWrites: true,
      writesStorage: false,
      writesLocalStorage: false,
      writesSessionStorage: false,
      writesIndexedDb: false,
      writesCookies: false,
    },
    sampleCards: [
      { name: 'Lariza', label: 'SAMPLE DATA / READ-ONLY / NOT PRODUCTION' },
      { name: 'Octavio', label: 'SAMPLE DATA / READ-ONLY / NOT PRODUCTION' },
    ],
    previewFilesCandidate: [
      'docs/static-preview/forge-alive/index.html',
      'docs/static-preview/forge-alive/styles.css',
      'docs/static-preview/forge-alive/sample-data.js',
    ],
    auditTrail: {
      auditTrailId: 'audit-1',
      entries: ['shell-reviewed', 'static-preview-reviewed'],
    },
    idempotencyKey: 'static-preview-idem-1',
    requestedUse: 'STATIC_PREVIEW_CANDIDATE_PREP',
    now: new Date().toISOString(),
    expiresAt: futureDate(),
    ...overrides,
  };
}

function assertAllForbiddenRemainFalse(output) {
  const flags = [
    'approvedForGitHubPagesPublish',
    'publishesGitHubPages',
    'deploysApp',
    'rendersLiveUi',
    'callsApi',
    'callsProviderApi',
    'callsExternalApi',
    'enablesAuth',
    'enablesAnalytics',
    'enablesTracking',
    'writesStorage',
    'writesLocalStorage',
    'writesSessionStorage',
    'writesIndexedDb',
    'writesCookies',
    'registersServiceWorker',
    'createsFormSubmission',
    'writesCanonicalTruth',
    'createsBusinessTruth',
    'createsMetricTruth',
    'createsEconomicTruth',
    'mutatesCrm',
    'createsTask',
    'createsCalendarEvent',
    'executesAction',
    'sendsMessage',
  ];
  for (const flag of flags) assert.strictEqual(output[flag], false, flag);
}

const tests = [];
tests.push(['missing Forge Alive Shell snapshot blocks', () => {
  assert.ok(GITHUB_PAGES_STATIC_PREVIEW_ALLOWED_USES.includes('STATIC_PREVIEW_CANDIDATE_PREP'));
  assert.ok(GITHUB_PAGES_STATIC_PREVIEW_FORBIDDEN_USES.includes('GITHUB_PAGES_PUBLISH'));
  const out = buildGithubPagesStaticPreviewBoundary(validInput({ forgeAliveShellSnapshot: null }));
  assert.strictEqual(out.staticPreviewStatus, GITHUB_PAGES_STATIC_PREVIEW_STATUSES.NEEDS_FORGE_ALIVE_SHELL);
  assertAllForbiddenRemainFalse(out);
}]);
tests.push(['missing Forge Alive Shell candidate blocks', () => assert.strictEqual(buildGithubPagesStaticPreviewBoundary(validInput({ forgeAliveShellCandidate: null, forgeAliveShellSnapshot: { eligibleForForgeAliveShellCandidate: true } })).staticPreviewStatus, GITHUB_PAGES_STATIC_PREVIEW_STATUSES.NEEDS_FORGE_ALIVE_SHELL_CANDIDATE)]);
tests.push(['missing GitHub Pages review blocks', () => assert.strictEqual(buildGithubPagesStaticPreviewBoundary(validInput({ githubPagesAvailabilitySnapshot: null })).staticPreviewStatus, GITHUB_PAGES_STATIC_PREVIEW_STATUSES.NEEDS_GITHUB_PAGES_REVIEW)]);
tests.push(['missing static preview policy blocks', () => assert.strictEqual(buildGithubPagesStaticPreviewBoundary(validInput({ staticPreviewPolicySnapshot: null })).staticPreviewStatus, GITHUB_PAGES_STATIC_PREVIEW_STATUSES.NEEDS_STATIC_PREVIEW_POLICY)]);
tests.push(['missing sample data policy blocks', () => assert.strictEqual(buildGithubPagesStaticPreviewBoundary(validInput({ sampleDataPolicySnapshot: null })).staticPreviewStatus, GITHUB_PAGES_STATIC_PREVIEW_STATUSES.NEEDS_SAMPLE_DATA_POLICY)]);
tests.push(['missing privacy policy blocks', () => assert.strictEqual(buildGithubPagesStaticPreviewBoundary(validInput({ privacyPolicySnapshot: null })).staticPreviewStatus, GITHUB_PAGES_STATIC_PREVIEW_STATUSES.NEEDS_PRIVACY_POLICY)]);
tests.push(['missing hosting safety policy blocks', () => assert.strictEqual(buildGithubPagesStaticPreviewBoundary(validInput({ hostingSafetyPolicySnapshot: null })).staticPreviewStatus, GITHUB_PAGES_STATIC_PREVIEW_STATUSES.NEEDS_HOSTING_SAFETY_POLICY)]);
tests.push(['missing no-secrets policy blocks', () => assert.strictEqual(buildGithubPagesStaticPreviewBoundary(validInput({ noSecretsPolicySnapshot: null })).staticPreviewStatus, GITHUB_PAGES_STATIC_PREVIEW_STATUSES.NEEDS_NO_SECRETS_POLICY)]);
tests.push(['missing no-API policy blocks', () => assert.strictEqual(buildGithubPagesStaticPreviewBoundary(validInput({ noApiPolicySnapshot: null })).staticPreviewStatus, GITHUB_PAGES_STATIC_PREVIEW_STATUSES.NEEDS_NO_API_POLICY)]);
tests.push(['missing no-tracking policy blocks', () => assert.strictEqual(buildGithubPagesStaticPreviewBoundary(validInput({ noTrackingPolicySnapshot: null })).staticPreviewStatus, GITHUB_PAGES_STATIC_PREVIEW_STATUSES.NEEDS_NO_TRACKING_POLICY)]);
tests.push(['missing no-storage policy blocks', () => assert.strictEqual(buildGithubPagesStaticPreviewBoundary(validInput({ noStoragePolicySnapshot: null })).staticPreviewStatus, GITHUB_PAGES_STATIC_PREVIEW_STATUSES.NEEDS_NO_STORAGE_POLICY)]);
tests.push(['missing viewer role blocks', () => assert.strictEqual(buildGithubPagesStaticPreviewBoundary(validInput({ viewerRole: '' })).staticPreviewStatus, GITHUB_PAGES_STATIC_PREVIEW_STATUSES.NEEDS_VIEWER_ROLE)]);
tests.push(['missing idempotency key blocks', () => assert.strictEqual(buildGithubPagesStaticPreviewBoundary(validInput({ idempotencyKey: '' })).staticPreviewStatus, GITHUB_PAGES_STATIC_PREVIEW_STATUSES.NEEDS_IDEMPOTENCY_KEY)]);
tests.push(['missing audit trail blocks', () => assert.strictEqual(buildGithubPagesStaticPreviewBoundary(validInput({ auditTrail: null })).staticPreviewStatus, GITHUB_PAGES_STATIC_PREVIEW_STATUSES.NEEDS_AUDIT_TRAIL)]);
tests.push(['unsupported viewer role blocks', () => assert.strictEqual(buildGithubPagesStaticPreviewBoundary(validInput({ viewerRole: 'VISITOR' })).staticPreviewStatus, GITHUB_PAGES_STATIC_PREVIEW_STATUSES.UNSUPPORTED_VIEWER_ROLE)]);
tests.push(['unsafe sample data blocks', () => assert.strictEqual(buildGithubPagesStaticPreviewBoundary(validInput({ sampleCards: [{ realCustomer: true }] })).staticPreviewStatus, GITHUB_PAGES_STATIC_PREVIEW_STATUSES.UNSAFE_SAMPLE_DATA)]);
tests.push(['secret-like values block', () => assert.strictEqual(buildGithubPagesStaticPreviewBoundary(validInput({ sampleCards: [{ token: 'sk-test-secret' }] })).staticPreviewStatus, GITHUB_PAGES_STATIC_PREVIEW_STATUSES.SECRET_DETECTED)]);
tests.push(['API calls block', () => assert.strictEqual(buildGithubPagesStaticPreviewBoundary(validInput({ previewFilesCandidate: ['fetch("/api")'] })).staticPreviewStatus, GITHUB_PAGES_STATIC_PREVIEW_STATUSES.API_CALL_DETECTED)]);
tests.push(['tracking scripts block', () => assert.strictEqual(buildGithubPagesStaticPreviewBoundary(validInput({ previewFilesCandidate: ['gtag("event")'] })).staticPreviewStatus, GITHUB_PAGES_STATIC_PREVIEW_STATUSES.TRACKING_DETECTED)]);
tests.push(['storage writes block', () => assert.strictEqual(buildGithubPagesStaticPreviewBoundary(validInput({ previewFilesCandidate: ['localStorage.setItem("x","y")'] })).staticPreviewStatus, GITHUB_PAGES_STATIC_PREVIEW_STATUSES.STORAGE_WRITE_DETECTED)]);
tests.push(['service workers block', () => assert.strictEqual(buildGithubPagesStaticPreviewBoundary(validInput({ previewFilesCandidate: ['navigator.serviceWorker.register("sw.js")'] })).staticPreviewStatus, GITHUB_PAGES_STATIC_PREVIEW_STATUSES.SERVICE_WORKER_DETECTED)]);
tests.push(['form submission blocks', () => assert.strictEqual(buildGithubPagesStaticPreviewBoundary(validInput({ previewFilesCandidate: ['<form action="/send">'] })).staticPreviewStatus, GITHUB_PAGES_STATIC_PREVIEW_STATUSES.FORM_SUBMISSION_DETECTED)]);
tests.push(['GitHub Pages publish remains false unless a later deploy boundary exists', () => assert.strictEqual(buildGithubPagesStaticPreviewBoundary(validInput({ githubPagesPublishRequested: true })).staticPreviewStatus, GITHUB_PAGES_STATIC_PREVIEW_STATUSES.GITHUB_PAGES_PUBLISH_NOT_AUTHORIZED)]);
tests.push(['live app execution remains false', () => assert.strictEqual(buildGithubPagesStaticPreviewBoundary(validInput({ liveAppRequested: true })).staticPreviewStatus, GITHUB_PAGES_STATIC_PREVIEW_STATUSES.LIVE_APP_NOT_AUTHORIZED)]);
tests.push(['static preview candidate can be prepared', () => { const out = buildGithubPagesStaticPreviewBoundary(validInput()); assert.strictEqual(out.staticPreviewStatus, GITHUB_PAGES_STATIC_PREVIEW_STATUSES.APPROVED_FOR_STATIC_PREVIEW_CANDIDATE); assert.strictEqual(out.allowedForStaticPreviewCandidate, true); }]);
tests.push(['preview files candidate uses safe sample data only', () => { const out = buildGithubPagesStaticPreviewBoundary(validInput()); assert.ok(out.previewFilesCandidate.includes('docs/static-preview/forge-alive/index.html')); assert.strictEqual(out.safeSampleDataCandidate.label, 'SAMPLE DATA / READ-ONLY / NOT PRODUCTION'); }]);
tests.push(['no production PII appears', () => assert.strictEqual(buildGithubPagesStaticPreviewBoundary(validInput({ sampleCards: [{ email: 'persona@example.com' }] })).staticPreviewStatus, GITHUB_PAGES_STATIC_PREVIEW_STATUSES.UNSAFE_SAMPLE_DATA)]);
tests.push(['no tokens secrets appear', () => assert.strictEqual(buildGithubPagesStaticPreviewBoundary(validInput({ previewFilesCandidate: ['password=abc'] })).staticPreviewStatus, GITHUB_PAGES_STATIC_PREVIEW_STATUSES.SECRET_DETECTED)]);
tests.push(['no fetch XMLHttpRequest WebSocket EventSource appears', () => assert.strictEqual(buildGithubPagesStaticPreviewBoundary(validInput({ previewFilesCandidate: ['new WebSocket("wss://x")'] })).staticPreviewStatus, GITHUB_PAGES_STATIC_PREVIEW_STATUSES.API_CALL_DETECTED)]);
tests.push(['no cookies localStorage sessionStorage indexedDB writes appear', () => assert.strictEqual(buildGithubPagesStaticPreviewBoundary(validInput({ previewFilesCandidate: ['document.cookie = "x=y"'] })).staticPreviewStatus, GITHUB_PAGES_STATIC_PREVIEW_STATUSES.STORAGE_WRITE_DETECTED)]);
tests.push(['no service worker registration appears', () => assert.strictEqual(buildGithubPagesStaticPreviewBoundary(validInput({ previewFilesCandidate: ['serviceWorker'] })).staticPreviewStatus, GITHUB_PAGES_STATIC_PREVIEW_STATUSES.SERVICE_WORKER_DETECTED)]);
tests.push(['no form action or submit handler appears', () => assert.strictEqual(buildGithubPagesStaticPreviewBoundary(validInput({ previewFilesCandidate: ['onsubmit="x"'] })).staticPreviewStatus, GITHUB_PAGES_STATIC_PREVIEW_STATUSES.FORM_SUBMISSION_DETECTED)]);
tests.push(['no analytics tracking appears', () => assert.strictEqual(buildGithubPagesStaticPreviewBoundary(validInput({ previewFilesCandidate: ['google-analytics'] })).staticPreviewStatus, GITHUB_PAGES_STATIC_PREVIEW_STATUSES.TRACKING_DETECTED)]);
tests.push(['no CRM mutation appears', () => { const out = buildGithubPagesStaticPreviewBoundary(validInput()); assert.strictEqual(out.mutatesCrm, false); }]);
tests.push(['no task calendar creation appears', () => { const out = buildGithubPagesStaticPreviewBoundary(validInput()); assert.strictEqual(out.createsTask, false); assert.strictEqual(out.createsCalendarEvent, false); }]);
tests.push(['no truth creation appears', () => { const out = buildGithubPagesStaticPreviewBoundary(validInput()); assert.strictEqual(out.createsBusinessTruth, false); assert.strictEqual(out.createsMetricTruth, false); assert.strictEqual(out.createsEconomicTruth, false); assert.strictEqual(out.writesCanonicalTruth, false); }]);
tests.push(['no action send execution appears', () => { const out = buildGithubPagesStaticPreviewBoundary(validInput()); assert.strictEqual(out.executesAction, false); assert.strictEqual(out.sendsMessage, false); }]);
tests.push(['inputs are not mutated', () => { const input = validInput(); const before = JSON.stringify(input); buildGithubPagesStaticPreviewBoundary(input); assert.strictEqual(JSON.stringify(input), before); }]);
tests.push(['warnings and limitations remain visible', () => { const out = buildGithubPagesStaticPreviewBoundary(validInput()); assert.ok(out.warnings.includes('shell candidate only')); assert.ok(out.limitations.includes('not live app')); }]);
tests.push(['static preview is explicitly labeled sample read-only not production', () => { const out = buildGithubPagesStaticPreviewBoundary(validInput()); assert.strictEqual(out.staticPreviewCandidate.readOnly, true); assert.strictEqual(out.staticPreviewCandidate.notProduction, true); assert.strictEqual(out.safeSampleDataCandidate.label, 'SAMPLE DATA / READ-ONLY / NOT PRODUCTION'); }]);
tests.push(['GitHub Pages availability remains infrastructure note only', () => { const out = buildGithubPagesStaticPreviewBoundary(validInput()); assert.strictEqual(out.staticPreviewCandidate.githubPagesAvailabilityPreservedAsInfrastructureNoteOnly, true); assert.strictEqual(out.approvedForGitHubPagesPublish, false); }]);
tests.push(['Metric Economic Truth remains separate', () => { const out = buildGithubPagesStaticPreviewBoundary(validInput()); assert.strictEqual(out.metricEconomicTruthRemainsSeparate, true); }]);

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
console.log(`GitHub Pages Static Preview Boundary Contract PASS ${passed}/${tests.length}`);
