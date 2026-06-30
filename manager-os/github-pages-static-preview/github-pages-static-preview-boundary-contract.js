/**
 * GitHub Pages Static Preview Boundary Contract
 *
 * GitHub Pages availability is not deployment authorization.
 * Static preview candidate is not a live app.
 * Pure boundary: prepares safe static preview candidates only.
 */

const GITHUB_PAGES_STATIC_PREVIEW_STATUSES = Object.freeze({
  READY_FOR_STATIC_PREVIEW_REVIEW: 'READY_FOR_STATIC_PREVIEW_REVIEW',
  APPROVED_FOR_STATIC_PREVIEW_CANDIDATE: 'APPROVED_FOR_STATIC_PREVIEW_CANDIDATE',
  NEEDS_FORGE_ALIVE_SHELL: 'NEEDS_FORGE_ALIVE_SHELL',
  NEEDS_FORGE_ALIVE_SHELL_CANDIDATE: 'NEEDS_FORGE_ALIVE_SHELL_CANDIDATE',
  NEEDS_GITHUB_PAGES_REVIEW: 'NEEDS_GITHUB_PAGES_REVIEW',
  NEEDS_STATIC_PREVIEW_POLICY: 'NEEDS_STATIC_PREVIEW_POLICY',
  NEEDS_SAMPLE_DATA_POLICY: 'NEEDS_SAMPLE_DATA_POLICY',
  NEEDS_PRIVACY_POLICY: 'NEEDS_PRIVACY_POLICY',
  NEEDS_HOSTING_SAFETY_POLICY: 'NEEDS_HOSTING_SAFETY_POLICY',
  NEEDS_NO_SECRETS_POLICY: 'NEEDS_NO_SECRETS_POLICY',
  NEEDS_NO_API_POLICY: 'NEEDS_NO_API_POLICY',
  NEEDS_NO_TRACKING_POLICY: 'NEEDS_NO_TRACKING_POLICY',
  NEEDS_NO_STORAGE_POLICY: 'NEEDS_NO_STORAGE_POLICY',
  NEEDS_VIEWER_ROLE: 'NEEDS_VIEWER_ROLE',
  NEEDS_IDEMPOTENCY_KEY: 'NEEDS_IDEMPOTENCY_KEY',
  NEEDS_AUDIT_TRAIL: 'NEEDS_AUDIT_TRAIL',
  UNSUPPORTED_VIEWER_ROLE: 'UNSUPPORTED_VIEWER_ROLE',
  UNSAFE_SAMPLE_DATA: 'UNSAFE_SAMPLE_DATA',
  SECRET_DETECTED: 'SECRET_DETECTED',
  API_CALL_DETECTED: 'API_CALL_DETECTED',
  TRACKING_DETECTED: 'TRACKING_DETECTED',
  STORAGE_WRITE_DETECTED: 'STORAGE_WRITE_DETECTED',
  SERVICE_WORKER_DETECTED: 'SERVICE_WORKER_DETECTED',
  FORM_SUBMISSION_DETECTED: 'FORM_SUBMISSION_DETECTED',
  GITHUB_PAGES_PUBLISH_NOT_AUTHORIZED: 'GITHUB_PAGES_PUBLISH_NOT_AUTHORIZED',
  LIVE_APP_NOT_AUTHORIZED: 'LIVE_APP_NOT_AUTHORIZED',
  EXPIRED_STATIC_PREVIEW_WINDOW: 'EXPIRED_STATIC_PREVIEW_WINDOW',
  BLOCKED: 'BLOCKED',
  UNKNOWN: 'UNKNOWN',
  NOT_MODELED: 'NOT_MODELED',
});

const GITHUB_PAGES_STATIC_PREVIEW_DECISIONS = Object.freeze({
  REQUEST_STATIC_PREVIEW_REVIEW: 'REQUEST_STATIC_PREVIEW_REVIEW',
  APPROVE_STATIC_PREVIEW_CANDIDATE: 'APPROVE_STATIC_PREVIEW_CANDIDATE',
  BLOCK_STATIC_PREVIEW: 'BLOCK_STATIC_PREVIEW',
  NEEDS_MORE_CONTEXT: 'NEEDS_MORE_CONTEXT',
  EXPIRED: 'EXPIRED',
  NOT_MODELED: 'NOT_MODELED',
});

const GITHUB_PAGES_STATIC_PREVIEW_ALLOWED_USES = Object.freeze([
  'STATIC_PREVIEW_REVIEW',
  'STATIC_PREVIEW_CANDIDATE_PREP',
  'SAFE_SAMPLE_DATA_PREP',
  'READ_ONLY_FORGE_ALIVE_PREVIEW_PREP',
  'GITHUB_PAGES_SAFETY_REVIEW',
]);

const GITHUB_PAGES_STATIC_PREVIEW_FORBIDDEN_USES = Object.freeze([
  'GITHUB_PAGES_PUBLISH',
  'APP_DEPLOYMENT',
  'LIVE_APP_EXECUTION',
  'API_CALL',
  'PROVIDER_API_CALL',
  'EXTERNAL_API_CALL',
  'AUTHENTICATION',
  'ANALYTICS_TRACKING',
  'COOKIE_WRITE',
  'LOCAL_STORAGE_WRITE',
  'SESSION_STORAGE_WRITE',
  'INDEXED_DB_WRITE',
  'SERVICE_WORKER_REGISTRATION',
  'FORM_SUBMISSION',
  'PERSISTENCE_WRITE',
  'CANONICAL_TRUTH_WRITE',
  'BUSINESS_TRUTH_CREATION',
  'METRIC_TRUTH_CREATION',
  'ECONOMIC_TRUTH_CREATION',
  'COMPENSATION_TRUTH',
  'PAYOUT_TRUTH',
  'REVENUE_TRUTH',
  'HUMAN_RANKING',
  'HR_DECISION',
  'PROMOTION_DECISION',
  'TERMINATION',
  'PERSONALITY_TRUTH',
  'ADVISOR_LIFECYCLE_TRUTH',
  'TASK_CREATION',
  'CALENDAR_CREATION',
  'CRM_MUTATION',
  'SEND_MESSAGE',
  'ACTION_EXECUTION',
  'MANIPULATION',
  'SURVEILLANCE',
]);

const SUPPORTED_VIEWER_ROLES = Object.freeze(['ADVISOR', 'MANAGER', 'PARTNER', 'DIRECTOR']);

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function unique(values) {
  return [...new Set(asArray(values).filter((value) => value !== undefined && value !== null && value !== ''))];
}

function norm(value) {
  return typeof value === 'string' ? value.trim().toUpperCase() : undefined;
}

function hasObject(value) {
  return Boolean(value && typeof value === 'object');
}

function goodPolicy(snapshot, requiredTrue = [], forbiddenTrue = []) {
  if (!hasObject(snapshot)) return false;
  if (snapshot.reviewed !== true && snapshot.policyReviewed !== true) return false;
  if (snapshot.allowed === false) return false;
  if (requiredTrue.some((flag) => snapshot[flag] !== true)) return false;
  if (forbiddenTrue.some((flag) => snapshot[flag] === true)) return false;
  return true;
}

function hasShellSnapshot(snapshot) {
  return hasObject(snapshot) && snapshot.eligibleForForgeAliveShellCandidate === true;
}

function hasShellCandidate(candidate) {
  return hasObject(candidate) && candidate.readOnly === true;
}

function hasGithubPagesReview(snapshot) {
  if (!hasObject(snapshot)) return false;
  if (snapshot.reviewed !== true && snapshot.hostingReviewed !== true) return false;
  if (snapshot.available !== true) return false;
  if (snapshot.deploymentAuthorized === true || snapshot.publishAllowed === true) return false;
  return true;
}

function textBundle(input) {
  return JSON.stringify(input || {});
}

function detectsSecret(text) {
  const normalized = String(text || '');
  return /(api[_-]?key|secret|token|password|passwd|pwd|bearer\s+[a-z0-9._-]+|ghp_[a-z0-9_]+|sk-[a-z0-9_-]+)/i.test(normalized);
}

function secretScanPayload(input) {
  return [
    input.previewFilesCandidate,
    input.sampleCards,
    input.safeSampleDataCandidate,
    input.sampleWarnings,
    input.sampleLimitations,
    input.sampleSourceTrace,
  ];
}
function detectsApi(text) {
  return /fetch\s*\(|XMLHttpRequest|WebSocket|EventSource|axios|https?:\/\//i.test(text);
}

function detectsTracking(text) {
  return /google-analytics|gtag\s*\(|fbq\s*\(|mixpanel|segment|hotjar|tracking|analytics/i.test(text);
}

function detectsStorage(text) {
  return /localStorage|sessionStorage|indexedDB|document\.cookie|cookie\s*=/i.test(text);
}

function detectsServiceWorker(text) {
  return /serviceWorker|register\s*\(\s*['"][^'"]*service-worker|sw\.js/i.test(text);
}

function detectsForm(text) {
  return /<form|onsubmit|addEventListener\s*\(\s*['"]submit|type\s*=\s*['"]submit/i.test(text);
}

function unsafeSampleData(input) {
  const text = textBundle(input);
  if (input.sampleDataPolicySnapshot && input.sampleDataPolicySnapshot.safeSampleDataOnly !== true) return true;
  if (/production\s*:\s*true|"productionData"\s*:\s*true|realCustomer|realClient|crmRecordId|policyNumber|curp|rfc/i.test(text)) return true;
  if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(text)) return true;
  if (/\b\d{10}\b/.test(text)) return true;
  return false;
}

function hasAuditTrail(snapshot) {
  if (!hasObject(snapshot)) return false;
  return Boolean(snapshot.auditTrailId || snapshot.auditId || asArray(snapshot.entries || snapshot.events).length > 0);
}

function expired(expiresAt, nowValue) {
  if (!expiresAt) return false;
  const expiry = new Date(expiresAt);
  const now = nowValue ? new Date(nowValue) : new Date();
  return !Number.isNaN(expiry.getTime()) && expiry.getTime() <= now.getTime();
}

function baseOutput(input) {
  return {
    staticPreviewStatus: GITHUB_PAGES_STATIC_PREVIEW_STATUSES.UNKNOWN,
    decision: GITHUB_PAGES_STATIC_PREVIEW_DECISIONS.NEEDS_MORE_CONTEXT,
    staticPreviewRequestId: input.staticPreviewRequestId || null,
    forgeAliveShellRequestId: input.forgeAliveShellRequestId || input.forgeAliveShellSnapshot?.forgeAliveShellRequestId || null,
    staticPreviewCandidate: null,
    previewFilesCandidate: [],
    safeSampleDataCandidate: null,
    allowedForStaticPreviewCandidate: false,
    approvedForGitHubPagesPublish: false,
    publishesGitHubPages: false,
    deploysApp: false,
    rendersLiveUi: false,
    callsApi: false,
    callsProviderApi: false,
    callsExternalApi: false,
    enablesAuth: false,
    enablesAnalytics: false,
    enablesTracking: false,
    writesStorage: false,
    writesLocalStorage: false,
    writesSessionStorage: false,
    writesIndexedDb: false,
    writesCookies: false,
    registersServiceWorker: false,
    createsFormSubmission: false,
    writesCanonicalTruth: false,
    createsBusinessTruth: false,
    createsMetricTruth: false,
    createsEconomicTruth: false,
    mutatesCrm: false,
    createsTask: false,
    createsCalendarEvent: false,
    executesAction: false,
    sendsMessage: false,
    metricEconomicTruthRemainsSeparate: true,
    githubPagesAvailabilityPreservedAsInfrastructureNoteOnly: true,
    blockedUses: [],
    allowedUses: [],
    missingSignals: [],
    warnings: unique([...(asArray(input.warnings)), ...(asArray(input.forgeAliveShellSnapshot?.warnings))]),
    limitations: unique([...(asArray(input.limitations)), ...(asArray(input.forgeAliveShellSnapshot?.limitations))]),
  };
}

function block(output, status, decision, signal, blockedUse) {
  output.staticPreviewStatus = status;
  output.decision = decision;
  if (signal) output.missingSignals = unique([...output.missingSignals, signal]);
  if (blockedUse) output.blockedUses = unique([...output.blockedUses, blockedUse]);
  return output;
}

function buildGithubPagesStaticPreviewBoundary(input = {}) {
  const original = clone(input) || {};
  const output = baseOutput(original);
  const requestedUse = norm(original.requestedUse);

  if (requestedUse && GITHUB_PAGES_STATIC_PREVIEW_FORBIDDEN_USES.includes(requestedUse)) {
    return block(output, GITHUB_PAGES_STATIC_PREVIEW_STATUSES.BLOCKED, GITHUB_PAGES_STATIC_PREVIEW_DECISIONS.BLOCK_STATIC_PREVIEW, null, requestedUse);
  }

  if (requestedUse && !GITHUB_PAGES_STATIC_PREVIEW_ALLOWED_USES.includes(requestedUse)) {
    output.blockedUses = unique([requestedUse]);
    output.staticPreviewStatus = GITHUB_PAGES_STATIC_PREVIEW_STATUSES.NOT_MODELED;
    output.decision = GITHUB_PAGES_STATIC_PREVIEW_DECISIONS.NOT_MODELED;
    return output;
  }

  if (requestedUse) output.allowedUses = unique([requestedUse]);

  if (!hasShellSnapshot(original.forgeAliveShellSnapshot)) {
    return block(output, GITHUB_PAGES_STATIC_PREVIEW_STATUSES.NEEDS_FORGE_ALIVE_SHELL, GITHUB_PAGES_STATIC_PREVIEW_DECISIONS.NEEDS_MORE_CONTEXT, 'forgeAliveShellSnapshot');
  }

  const shellCandidate = original.forgeAliveShellCandidate || original.forgeAliveShellSnapshot.forgeAliveShellCandidate;
  if (!hasShellCandidate(shellCandidate)) {
    return block(output, GITHUB_PAGES_STATIC_PREVIEW_STATUSES.NEEDS_FORGE_ALIVE_SHELL_CANDIDATE, GITHUB_PAGES_STATIC_PREVIEW_DECISIONS.NEEDS_MORE_CONTEXT, 'forgeAliveShellCandidate');
  }

  if (!hasGithubPagesReview(original.githubPagesAvailabilitySnapshot)) {
    return block(output, GITHUB_PAGES_STATIC_PREVIEW_STATUSES.NEEDS_GITHUB_PAGES_REVIEW, GITHUB_PAGES_STATIC_PREVIEW_DECISIONS.NEEDS_MORE_CONTEXT, 'githubPagesAvailabilitySnapshot');
  }

  if (!goodPolicy(original.staticPreviewPolicySnapshot, ['readOnly', 'staticOnly'], ['publishesGitHubPages', 'deploysApp', 'rendersLiveUi'])) {
    return block(output, GITHUB_PAGES_STATIC_PREVIEW_STATUSES.NEEDS_STATIC_PREVIEW_POLICY, GITHUB_PAGES_STATIC_PREVIEW_DECISIONS.NEEDS_MORE_CONTEXT, 'staticPreviewPolicySnapshot');
  }

  if (!goodPolicy(original.sampleDataPolicySnapshot, ['safeSampleDataOnly', 'notProduction'], ['containsProductionPii', 'containsSecrets'])) {
    return block(output, GITHUB_PAGES_STATIC_PREVIEW_STATUSES.NEEDS_SAMPLE_DATA_POLICY, GITHUB_PAGES_STATIC_PREVIEW_DECISIONS.NEEDS_MORE_CONTEXT, 'sampleDataPolicySnapshot');
  }

  if (!goodPolicy(original.privacyPolicySnapshot, [], ['surveillanceAllowed', 'exposesRestrictedData', 'personalityTruthAllowed'])) {
    return block(output, GITHUB_PAGES_STATIC_PREVIEW_STATUSES.NEEDS_PRIVACY_POLICY, GITHUB_PAGES_STATIC_PREVIEW_DECISIONS.NEEDS_MORE_CONTEXT, 'privacyPolicySnapshot');
  }

  if (!goodPolicy(original.hostingSafetyPolicySnapshot, [], ['deploysApp', 'publishesGitHubPages', 'callsExternalApi'])) {
    return block(output, GITHUB_PAGES_STATIC_PREVIEW_STATUSES.NEEDS_HOSTING_SAFETY_POLICY, GITHUB_PAGES_STATIC_PREVIEW_DECISIONS.NEEDS_MORE_CONTEXT, 'hostingSafetyPolicySnapshot');
  }

  if (!goodPolicy(original.noSecretsPolicySnapshot, ['noSecrets'], ['containsSecrets'])) {
    return block(output, GITHUB_PAGES_STATIC_PREVIEW_STATUSES.NEEDS_NO_SECRETS_POLICY, GITHUB_PAGES_STATIC_PREVIEW_DECISIONS.NEEDS_MORE_CONTEXT, 'noSecretsPolicySnapshot');
  }

  if (!goodPolicy(original.noApiPolicySnapshot, ['noApiCalls'], ['callsApi', 'callsProviderApi', 'callsExternalApi'])) {
    return block(output, GITHUB_PAGES_STATIC_PREVIEW_STATUSES.NEEDS_NO_API_POLICY, GITHUB_PAGES_STATIC_PREVIEW_DECISIONS.NEEDS_MORE_CONTEXT, 'noApiPolicySnapshot');
  }

  if (!goodPolicy(original.noTrackingPolicySnapshot, ['noTracking'], ['enablesAnalytics', 'enablesTracking'])) {
    return block(output, GITHUB_PAGES_STATIC_PREVIEW_STATUSES.NEEDS_NO_TRACKING_POLICY, GITHUB_PAGES_STATIC_PREVIEW_DECISIONS.NEEDS_MORE_CONTEXT, 'noTrackingPolicySnapshot');
  }

  if (!goodPolicy(original.noStoragePolicySnapshot, ['noStorageWrites'], ['writesStorage', 'writesLocalStorage', 'writesSessionStorage', 'writesIndexedDb', 'writesCookies'])) {
    return block(output, GITHUB_PAGES_STATIC_PREVIEW_STATUSES.NEEDS_NO_STORAGE_POLICY, GITHUB_PAGES_STATIC_PREVIEW_DECISIONS.NEEDS_MORE_CONTEXT, 'noStoragePolicySnapshot');
  }

  const viewerRole = norm(original.viewerRole);
  if (!viewerRole) {
    return block(output, GITHUB_PAGES_STATIC_PREVIEW_STATUSES.NEEDS_VIEWER_ROLE, GITHUB_PAGES_STATIC_PREVIEW_DECISIONS.NEEDS_MORE_CONTEXT, 'viewerRole');
  }

  if (!SUPPORTED_VIEWER_ROLES.includes(viewerRole)) {
    return block(output, GITHUB_PAGES_STATIC_PREVIEW_STATUSES.UNSUPPORTED_VIEWER_ROLE, GITHUB_PAGES_STATIC_PREVIEW_DECISIONS.NOT_MODELED, null, 'UNSUPPORTED_VIEWER_ROLE');
  }

  if (!original.idempotencyKey) {
    return block(output, GITHUB_PAGES_STATIC_PREVIEW_STATUSES.NEEDS_IDEMPOTENCY_KEY, GITHUB_PAGES_STATIC_PREVIEW_DECISIONS.NEEDS_MORE_CONTEXT, 'idempotencyKey');
  }

  if (!hasAuditTrail(original.auditTrail)) {
    return block(output, GITHUB_PAGES_STATIC_PREVIEW_STATUSES.NEEDS_AUDIT_TRAIL, GITHUB_PAGES_STATIC_PREVIEW_DECISIONS.NEEDS_MORE_CONTEXT, 'auditTrail');
  }

  if (unsafeSampleData(original)) return block(output, GITHUB_PAGES_STATIC_PREVIEW_STATUSES.UNSAFE_SAMPLE_DATA, GITHUB_PAGES_STATIC_PREVIEW_DECISIONS.BLOCK_STATIC_PREVIEW, null, 'UNSAFE_SAMPLE_DATA');
  if (detectsSecret(textBundle(secretScanPayload(original)))) return block(output, GITHUB_PAGES_STATIC_PREVIEW_STATUSES.SECRET_DETECTED, GITHUB_PAGES_STATIC_PREVIEW_DECISIONS.BLOCK_STATIC_PREVIEW, null, 'SECRET_DETECTED');
  if (detectsApi(textBundle(original.previewFilesCandidate))) return block(output, GITHUB_PAGES_STATIC_PREVIEW_STATUSES.API_CALL_DETECTED, GITHUB_PAGES_STATIC_PREVIEW_DECISIONS.BLOCK_STATIC_PREVIEW, null, 'API_CALL_DETECTED');
  if (detectsTracking(textBundle(original.previewFilesCandidate))) return block(output, GITHUB_PAGES_STATIC_PREVIEW_STATUSES.TRACKING_DETECTED, GITHUB_PAGES_STATIC_PREVIEW_DECISIONS.BLOCK_STATIC_PREVIEW, null, 'TRACKING_DETECTED');
  if (detectsStorage(textBundle(original.previewFilesCandidate))) return block(output, GITHUB_PAGES_STATIC_PREVIEW_STATUSES.STORAGE_WRITE_DETECTED, GITHUB_PAGES_STATIC_PREVIEW_DECISIONS.BLOCK_STATIC_PREVIEW, null, 'STORAGE_WRITE_DETECTED');
  if (detectsServiceWorker(textBundle(original.previewFilesCandidate))) return block(output, GITHUB_PAGES_STATIC_PREVIEW_STATUSES.SERVICE_WORKER_DETECTED, GITHUB_PAGES_STATIC_PREVIEW_DECISIONS.BLOCK_STATIC_PREVIEW, null, 'SERVICE_WORKER_DETECTED');
  if (detectsForm(textBundle(original.previewFilesCandidate))) return block(output, GITHUB_PAGES_STATIC_PREVIEW_STATUSES.FORM_SUBMISSION_DETECTED, GITHUB_PAGES_STATIC_PREVIEW_DECISIONS.BLOCK_STATIC_PREVIEW, null, 'FORM_SUBMISSION_DETECTED');

  if (original.publishesGitHubPages === true || original.githubPagesPublishRequested === true) {
    return block(output, GITHUB_PAGES_STATIC_PREVIEW_STATUSES.GITHUB_PAGES_PUBLISH_NOT_AUTHORIZED, GITHUB_PAGES_STATIC_PREVIEW_DECISIONS.BLOCK_STATIC_PREVIEW, null, 'GITHUB_PAGES_PUBLISH_NOT_AUTHORIZED');
  }

  if (original.deploysApp === true || original.liveAppRequested === true) {
    return block(output, GITHUB_PAGES_STATIC_PREVIEW_STATUSES.LIVE_APP_NOT_AUTHORIZED, GITHUB_PAGES_STATIC_PREVIEW_DECISIONS.BLOCK_STATIC_PREVIEW, null, 'LIVE_APP_NOT_AUTHORIZED');
  }

  if (expired(original.expiresAt || original.staticPreviewWindowExpiresAt, original.now)) {
    return block(output, GITHUB_PAGES_STATIC_PREVIEW_STATUSES.EXPIRED_STATIC_PREVIEW_WINDOW, GITHUB_PAGES_STATIC_PREVIEW_DECISIONS.EXPIRED, null, 'EXPIRED_STATIC_PREVIEW_WINDOW');
  }

  const previewFiles = original.previewFilesCandidate || [
    'docs/static-preview/forge-alive/index.html',
    'docs/static-preview/forge-alive/styles.css',
    'docs/static-preview/forge-alive/sample-data.js',
  ];

  output.staticPreviewCandidate = {
    name: 'Forge Alive Static Preview',
    readOnly: true,
    staticOnly: true,
    sampleDataOnly: true,
    notProduction: true,
    visualDirection: 'mobile-first dark navy glassmorphism gold accents premium advisor copilot',
    githubPagesAvailability: original.githubPagesAvailabilitySnapshot.available === true,
    githubPagesAvailabilityPreservedAsInfrastructureNoteOnly: true,
    approvedForGitHubPagesPublish: false,
    publishesGitHubPages: false,
    deploysApp: false,
    rendersLiveUi: false,
  };

  output.previewFilesCandidate = previewFiles;
  output.safeSampleDataCandidate = original.safeSampleDataCandidate || {
    label: 'SAMPLE DATA / READ-ONLY / NOT PRODUCTION',
    shell: 'Forge Alive',
  };
  output.allowedForStaticPreviewCandidate = true;
  output.staticPreviewStatus = GITHUB_PAGES_STATIC_PREVIEW_STATUSES.APPROVED_FOR_STATIC_PREVIEW_CANDIDATE;
  output.decision = GITHUB_PAGES_STATIC_PREVIEW_DECISIONS.APPROVE_STATIC_PREVIEW_CANDIDATE;
  return output;
}

module.exports = {
  buildGithubPagesStaticPreviewBoundary,
  GITHUB_PAGES_STATIC_PREVIEW_STATUSES,
  GITHUB_PAGES_STATIC_PREVIEW_DECISIONS,
  GITHUB_PAGES_STATIC_PREVIEW_ALLOWED_USES,
  GITHUB_PAGES_STATIC_PREVIEW_FORBIDDEN_USES,
};
