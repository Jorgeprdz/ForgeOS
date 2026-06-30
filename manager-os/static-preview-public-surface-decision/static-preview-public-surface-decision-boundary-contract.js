/**
 * Static Preview Public Surface Decision Boundary Contract
 *
 * Owner public surface decision is separate from deployment execution.
 * GitHub Pages availability is not deployment authorization.
 * This boundary creates a review-only decision record, never deploys, publishes, mutates settings,
 * creates public URLs, verifies public URLs, or configures DNS/custom domains.
 */

const STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES = Object.freeze({
  READY_FOR_PUBLIC_SURFACE_DECISION: 'READY_FOR_PUBLIC_SURFACE_DECISION',
  APPROVED_PUBLIC_SURFACE_DECISION: 'APPROVED_PUBLIC_SURFACE_DECISION',
  REJECTED_PUBLIC_SURFACE_DECISION: 'REJECTED_PUBLIC_SURFACE_DECISION',
  NEEDS_PUBLIC_SURFACE_CANDIDATE: 'NEEDS_PUBLIC_SURFACE_CANDIDATE',
  NEEDS_STATIC_PREVIEW_DEPLOYMENT_BOUNDARY: 'NEEDS_STATIC_PREVIEW_DEPLOYMENT_BOUNDARY',
  NEEDS_OWNER_APPROVAL: 'NEEDS_OWNER_APPROVAL',
  NEEDS_OWNER_IDENTITY: 'NEEDS_OWNER_IDENTITY',
  NEEDS_EVIDENCE_BUNDLE: 'NEEDS_EVIDENCE_BUNDLE',
  NEEDS_RISK_ACCEPTANCE: 'NEEDS_RISK_ACCEPTANCE',
  NEEDS_ROLLBACK_PLAN: 'NEEDS_ROLLBACK_PLAN',
  NEEDS_EXPIRATION_WINDOW: 'NEEDS_EXPIRATION_WINDOW',
  NEEDS_PUBLIC_SURFACE_LABELING: 'NEEDS_PUBLIC_SURFACE_LABELING',
  NEEDS_SAMPLE_DATA_AUDIT: 'NEEDS_SAMPLE_DATA_AUDIT',
  NEEDS_NO_SECRETS_SCAN: 'NEEDS_NO_SECRETS_SCAN',
  NEEDS_NO_API_SCAN: 'NEEDS_NO_API_SCAN',
  NEEDS_NO_TRACKING_SCAN: 'NEEDS_NO_TRACKING_SCAN',
  NEEDS_NO_STORAGE_SCAN: 'NEEDS_NO_STORAGE_SCAN',
  NEEDS_NO_FORMS_SCAN: 'NEEDS_NO_FORMS_SCAN',
  NEEDS_NO_SERVICE_WORKER_SCAN: 'NEEDS_NO_SERVICE_WORKER_SCAN',
  NEEDS_REPOSITORY_VISIBILITY_REVIEW: 'NEEDS_REPOSITORY_VISIBILITY_REVIEW',
  NEEDS_GITHUB_PAGES_CONFIGURATION: 'NEEDS_GITHUB_PAGES_CONFIGURATION',
  NEEDS_DECISION_SCOPE: 'NEEDS_DECISION_SCOPE',
  NEEDS_EVIDENCE: 'NEEDS_EVIDENCE',
  NEEDS_SOURCE_OWNER: 'NEEDS_SOURCE_OWNER',
  NEEDS_IDEMPOTENCY_KEY: 'NEEDS_IDEMPOTENCY_KEY',
  PUBLIC_REPOSITORY_RISK_REVIEW: 'PUBLIC_REPOSITORY_RISK_REVIEW',
  UNSAFE_SAMPLE_DATA: 'UNSAFE_SAMPLE_DATA',
  PRODUCTION_DATA_DETECTED: 'PRODUCTION_DATA_DETECTED',
  SECRET_DETECTED: 'SECRET_DETECTED',
  API_CALL_DETECTED: 'API_CALL_DETECTED',
  TRACKING_DETECTED: 'TRACKING_DETECTED',
  STORAGE_WRITE_DETECTED: 'STORAGE_WRITE_DETECTED',
  FORM_SUBMISSION_DETECTED: 'FORM_SUBMISSION_DETECTED',
  SERVICE_WORKER_DETECTED: 'SERVICE_WORKER_DETECTED',
  DEPLOYMENT_EXECUTION_NOT_AUTHORIZED: 'DEPLOYMENT_EXECUTION_NOT_AUTHORIZED',
  GITHUB_PAGES_SETTINGS_MUTATION_NOT_AUTHORIZED: 'GITHUB_PAGES_SETTINGS_MUTATION_NOT_AUTHORIZED',
  PUBLIC_URL_CREATION_NOT_AUTHORIZED: 'PUBLIC_URL_CREATION_NOT_AUTHORIZED',
  PUBLIC_URL_VERIFICATION_NOT_AUTHORIZED: 'PUBLIC_URL_VERIFICATION_NOT_AUTHORIZED',
  DNS_MUTATION_NOT_AUTHORIZED: 'DNS_MUTATION_NOT_AUTHORIZED',
  CUSTOM_DOMAIN_NOT_AUTHORIZED: 'CUSTOM_DOMAIN_NOT_AUTHORIZED',
  EXPIRED_PUBLIC_SURFACE_DECISION_WINDOW: 'EXPIRED_PUBLIC_SURFACE_DECISION_WINDOW',
  BLOCKED: 'BLOCKED',
  UNKNOWN: 'UNKNOWN',
  NOT_MODELED: 'NOT_MODELED',
});

const STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_DECISIONS = Object.freeze({
  REQUEST_PUBLIC_SURFACE_DECISION: 'REQUEST_PUBLIC_SURFACE_DECISION',
  APPROVE_PUBLIC_SURFACE_DECISION: 'APPROVE_PUBLIC_SURFACE_DECISION',
  REJECT_PUBLIC_SURFACE_DECISION: 'REJECT_PUBLIC_SURFACE_DECISION',
  BLOCK_PUBLIC_SURFACE_DECISION: 'BLOCK_PUBLIC_SURFACE_DECISION',
  NEEDS_MORE_CONTEXT: 'NEEDS_MORE_CONTEXT',
  EXPIRED: 'EXPIRED',
  NOT_MODELED: 'NOT_MODELED',
});

const STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_ALLOWED_USES = Object.freeze([
  'PUBLIC_SURFACE_DECISION_REVIEW',
  'OWNER_PUBLIC_SURFACE_APPROVAL_REVIEW',
  'PUBLIC_SURFACE_DECISION_RECORD_PREP',
  'RISK_ACCEPTANCE_REVIEW',
  'ROLLBACK_PLAN_REVIEW',
]);

const STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_FORBIDDEN_USES = Object.freeze([
  'ACTUAL_DEPLOYMENT_EXECUTION',
  'GITHUB_PAGES_SETTINGS_MUTATION',
  'PUBLIC_URL_CREATION',
  'PUBLIC_URL_VERIFICATION',
  'DNS_MUTATION',
  'CUSTOM_DOMAIN_SETUP',
  'FORCE_PUBLISH',
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

function reviewed(snapshot) {
  return hasObject(snapshot) && (snapshot.reviewed === true || snapshot.validated === true || snapshot.scanned === true);
}

function block(output, status, decision, signal, blockedUse) {
  output.publicSurfaceDecisionStatus = status;
  output.decision = decision;
  if (signal) output.missingSignals = unique([...output.missingSignals, signal]);
  if (blockedUse) output.blockedUses = unique([...output.blockedUses, blockedUse]);
  return output;
}

function baseOutput(input) {
  return {
    publicSurfaceDecisionStatus: STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.UNKNOWN,
    decision: STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_DECISIONS.NEEDS_MORE_CONTEXT,
    publicSurfaceDecisionRequestId: input.publicSurfaceDecisionRequestId || null,
    ownerDecisionRecord: null,
    approvedForPublicSurfaceDecision: false,
    publicSurfaceDecisionCandidate: null,
    approvedForDeploymentExecution: false,
    approvedForGitHubPagesSettingsMutation: false,
    createsPublicUrl: false,
    verifiesPublicUrl: false,
    mutatesDns: false,
    configuresCustomDomain: false,
    deploysApp: false,
    publishesGitHubPages: false,
    callsApi: false,
    enablesAuth: false,
    enablesAnalytics: false,
    enablesTracking: false,
    writesStorage: false,
    registersServiceWorker: false,
    createsFormSubmission: false,
    mutatesCrm: false,
    createsTask: false,
    createsCalendarEvent: false,
    writesCanonicalTruth: false,
    createsBusinessTruth: false,
    createsMetricTruth: false,
    createsEconomicTruth: false,
    executesAction: false,
    sendsMessage: false,
    metricEconomicTruthRemainsSeparate: true,
    githubPagesAvailabilityIsNotDeploymentAuthorization: true,
    missingSignals: [],
    blockedUses: [],
    allowedUses: [],
    evidenceRefs: unique(input.evidenceRefs),
    sourceEvidenceIds: unique(input.sourceEvidenceIds),
    sourceOwners: unique(input.sourceOwners),
    warnings: unique([
      ...asArray(input.warnings),
      ...asArray(input.publicSurfaceCandidateSnapshot?.warnings),
      ...asArray(input.staticPreviewDeploymentBoundarySnapshot?.warnings),
      ...asArray(input.githubPagesConfigurationSnapshot?.warnings),
    ]),
    limitations: unique([
      ...asArray(input.limitations),
      ...asArray(input.publicSurfaceCandidateSnapshot?.limitations),
      ...asArray(input.staticPreviewDeploymentBoundarySnapshot?.limitations),
      ...asArray(input.githubPagesConfigurationSnapshot?.limitations),
    ]),
    rollbackNotes: unique(asArray(input.rollbackPlanSnapshot?.rollbackNotes || input.rollbackPlanSnapshot?.steps)),
    expirationNotes: unique(asArray(input.expirationWindowSnapshot?.expirationNotes || input.expirationWindowSnapshot?.notes)),
  };
}

function hasPublicSurfaceCandidate(snapshot) {
  return reviewed(snapshot)
    && snapshot.eligibleForPublicSurfaceReview === true
    && snapshot.reviewOnly === true
    && snapshot.readOnly === true
    && snapshot.sampleDataOnly === true
    && snapshot.notProduction === true
    && snapshot.approvedForDeploymentExecution !== true
    && snapshot.approvedForGitHubPagesSettingsMutation !== true;
}

function hasDeploymentBoundary(snapshot) {
  return hasObject(snapshot)
    && snapshot.implemented === true
    && snapshot.publicSurfaceCandidateReviewOnly === true
    && snapshot.approvedForDeploymentExecution !== true
    && snapshot.approvedForGitHubPagesSettingsMutation !== true
    && snapshot.createsPublicUrl !== true
    && snapshot.verifiesPublicUrl !== true;
}

function hasOwnerApprovalSnapshot(snapshot) {
  return reviewed(snapshot);
}

function ownerRejected(snapshot) {
  const decision = norm(snapshot?.decision);
  return snapshot?.rejected === true || snapshot?.approved === false || decision === 'REJECT' || decision === 'REJECTED';
}

function ownerApproved(snapshot) {
  return reviewed(snapshot) && snapshot.approved === true && Boolean(snapshot.ownerApprovalId || snapshot.approvedBy || snapshot.owner);
}

function hasOwnerIdentity(snapshot) {
  return reviewed(snapshot) && Boolean(snapshot.ownerId || snapshot.ownerName || snapshot.emailHash);
}

function hasEvidenceBundle(snapshot) {
  return reviewed(snapshot) && snapshot.complete === true;
}

function hasRiskAcceptance(snapshot) {
  return reviewed(snapshot) && snapshot.accepted === true && snapshot.publicSurfaceRiskAccepted === true;
}

function hasRollbackPlan(snapshot) {
  return reviewed(snapshot) && (snapshot.planAvailable === true || asArray(snapshot.steps).length > 0);
}

function hasExpirationWindow(snapshot) {
  return reviewed(snapshot) && Boolean(snapshot.expiresAt) && snapshot.reviewWindowVisible === true;
}

function isExpired(snapshot, nowValue) {
  if (!hasObject(snapshot) || !snapshot.expiresAt) return false;
  const expiry = new Date(snapshot.expiresAt);
  const now = nowValue ? new Date(nowValue) : new Date();
  return !Number.isNaN(expiry.getTime()) && expiry.getTime() <= now.getTime();
}

function hasPublicSurfaceLabeling(snapshot) {
  return reviewed(snapshot)
    && snapshot.sampleDataLabelVisible === true
    && snapshot.readOnlyLabelVisible === true
    && snapshot.notProductionLabelVisible === true;
}

function hasSampleDataAudit(snapshot) {
  return reviewed(snapshot) && snapshot.safeSampleDataOnly === true;
}

function scanPresent(snapshot) {
  return reviewed(snapshot);
}

function scanFailed(snapshot, flagName) {
  return hasObject(snapshot) && snapshot[flagName] === true;
}

function hasRepositoryVisibility(snapshot) {
  return reviewed(snapshot) && Boolean(snapshot.visibility);
}

function publicRepositoryNeedsRiskReview(snapshot) {
  return norm(snapshot.visibility) === 'PUBLIC' && snapshot.explicitPublicRepositoryRiskReview !== true;
}

function hasGithubPagesConfiguration(snapshot) {
  return reviewed(snapshot)
    && snapshot.available === true
    && snapshot.settingsMutationRequested !== true
    && snapshot.publishRequested !== true
    && snapshot.deploymentRequested !== true
    && snapshot.publicUrlCreationRequested !== true
    && snapshot.publicUrlVerificationRequested !== true;
}

function hasDecisionScope(snapshot) {
  return reviewed(snapshot)
    && snapshot.ownerDecisionOnly === true
    && snapshot.deploymentExecutionAllowed !== true
    && snapshot.githubPagesSettingsMutationAllowed !== true
    && snapshot.publicUrlCreationAllowed !== true
    && snapshot.publicUrlVerificationAllowed !== true;
}

function hasEvidence(input) {
  return asArray(input.evidenceRefs).length > 0 && asArray(input.sourceEvidenceIds).length > 0;
}

function hasSourceOwners(input) {
  return asArray(input.sourceOwners).length > 0;
}

function buildStaticPreviewPublicSurfaceDecisionBoundary(input = {}) {
  const original = clone(input) || {};
  const output = baseOutput(original);
  const requestedUse = norm(original.requestedUse);

  if (requestedUse && STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_FORBIDDEN_USES.includes(requestedUse)) {
    return block(output, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.BLOCKED, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_DECISIONS.BLOCK_PUBLIC_SURFACE_DECISION, null, requestedUse);
  }

  if (requestedUse && !STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_ALLOWED_USES.includes(requestedUse)) {
    output.blockedUses = unique([requestedUse]);
    output.publicSurfaceDecisionStatus = STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.NOT_MODELED;
    output.decision = STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_DECISIONS.NOT_MODELED;
    return output;
  }

  if (requestedUse) output.allowedUses = unique([requestedUse]);

  if (!hasPublicSurfaceCandidate(original.publicSurfaceCandidateSnapshot)) {
    return block(output, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.NEEDS_PUBLIC_SURFACE_CANDIDATE, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_DECISIONS.NEEDS_MORE_CONTEXT, 'publicSurfaceCandidateSnapshot');
  }

  if (!hasDeploymentBoundary(original.staticPreviewDeploymentBoundarySnapshot)) {
    return block(output, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.NEEDS_STATIC_PREVIEW_DEPLOYMENT_BOUNDARY, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_DECISIONS.NEEDS_MORE_CONTEXT, 'staticPreviewDeploymentBoundarySnapshot');
  }

  if (!hasOwnerApprovalSnapshot(original.ownerApprovalSnapshot)) {
    return block(output, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.NEEDS_OWNER_APPROVAL, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_DECISIONS.NEEDS_MORE_CONTEXT, 'ownerApprovalSnapshot');
  }

  if (ownerRejected(original.ownerApprovalSnapshot)) {
    return block(output, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.REJECTED_PUBLIC_SURFACE_DECISION, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_DECISIONS.REJECT_PUBLIC_SURFACE_DECISION, null, 'OWNER_REJECTED_PUBLIC_SURFACE_DECISION');
  }

  if (!ownerApproved(original.ownerApprovalSnapshot)) {
    return block(output, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.NEEDS_OWNER_APPROVAL, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_DECISIONS.NEEDS_MORE_CONTEXT, 'ownerApprovalSnapshot');
  }

  if (!hasOwnerIdentity(original.ownerIdentitySnapshot)) {
    return block(output, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.NEEDS_OWNER_IDENTITY, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_DECISIONS.NEEDS_MORE_CONTEXT, 'ownerIdentitySnapshot');
  }

  if (!hasEvidenceBundle(original.evidenceBundleSnapshot)) {
    return block(output, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.NEEDS_EVIDENCE_BUNDLE, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_DECISIONS.NEEDS_MORE_CONTEXT, 'evidenceBundleSnapshot');
  }

  if (!hasRiskAcceptance(original.riskAcceptanceSnapshot)) {
    return block(output, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.NEEDS_RISK_ACCEPTANCE, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_DECISIONS.NEEDS_MORE_CONTEXT, 'riskAcceptanceSnapshot');
  }

  if (!hasRollbackPlan(original.rollbackPlanSnapshot)) {
    return block(output, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.NEEDS_ROLLBACK_PLAN, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_DECISIONS.NEEDS_MORE_CONTEXT, 'rollbackPlanSnapshot');
  }

  if (!hasExpirationWindow(original.expirationWindowSnapshot)) {
    return block(output, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.NEEDS_EXPIRATION_WINDOW, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_DECISIONS.NEEDS_MORE_CONTEXT, 'expirationWindowSnapshot');
  }

  if (!hasPublicSurfaceLabeling(original.publicSurfaceLabelingSnapshot)) {
    return block(output, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.NEEDS_PUBLIC_SURFACE_LABELING, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_DECISIONS.NEEDS_MORE_CONTEXT, 'publicSurfaceLabelingSnapshot');
  }

  if (!hasSampleDataAudit(original.sampleDataAuditSnapshot)) {
    return block(output, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.NEEDS_SAMPLE_DATA_AUDIT, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_DECISIONS.NEEDS_MORE_CONTEXT, 'sampleDataAuditSnapshot');
  }

  if (!scanPresent(original.secretsScanSnapshot)) {
    return block(output, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.NEEDS_NO_SECRETS_SCAN, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_DECISIONS.NEEDS_MORE_CONTEXT, 'secretsScanSnapshot');
  }

  if (!scanPresent(original.apiScanSnapshot)) {
    return block(output, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.NEEDS_NO_API_SCAN, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_DECISIONS.NEEDS_MORE_CONTEXT, 'apiScanSnapshot');
  }

  if (!scanPresent(original.trackingScanSnapshot)) {
    return block(output, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.NEEDS_NO_TRACKING_SCAN, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_DECISIONS.NEEDS_MORE_CONTEXT, 'trackingScanSnapshot');
  }

  if (!scanPresent(original.storageScanSnapshot)) {
    return block(output, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.NEEDS_NO_STORAGE_SCAN, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_DECISIONS.NEEDS_MORE_CONTEXT, 'storageScanSnapshot');
  }

  if (!scanPresent(original.formsScanSnapshot)) {
    return block(output, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.NEEDS_NO_FORMS_SCAN, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_DECISIONS.NEEDS_MORE_CONTEXT, 'formsScanSnapshot');
  }

  if (!scanPresent(original.serviceWorkerScanSnapshot)) {
    return block(output, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.NEEDS_NO_SERVICE_WORKER_SCAN, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_DECISIONS.NEEDS_MORE_CONTEXT, 'serviceWorkerScanSnapshot');
  }

  if (!hasRepositoryVisibility(original.repositoryVisibilitySnapshot)) {
    return block(output, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.NEEDS_REPOSITORY_VISIBILITY_REVIEW, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_DECISIONS.NEEDS_MORE_CONTEXT, 'repositoryVisibilitySnapshot');
  }

  if (!hasGithubPagesConfiguration(original.githubPagesConfigurationSnapshot)) {
    return block(output, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.NEEDS_GITHUB_PAGES_CONFIGURATION, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_DECISIONS.NEEDS_MORE_CONTEXT, 'githubPagesConfigurationSnapshot');
  }

  if (!hasDecisionScope(original.decisionScopeSnapshot)) {
    return block(output, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.NEEDS_DECISION_SCOPE, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_DECISIONS.NEEDS_MORE_CONTEXT, 'decisionScopeSnapshot');
  }

  if (!hasEvidence(original)) {
    return block(output, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.NEEDS_EVIDENCE, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_DECISIONS.NEEDS_MORE_CONTEXT, 'evidenceRefs');
  }

  if (!hasSourceOwners(original)) {
    return block(output, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.NEEDS_SOURCE_OWNER, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_DECISIONS.NEEDS_MORE_CONTEXT, 'sourceOwners');
  }

  if (!original.idempotencyKey) {
    return block(output, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.NEEDS_IDEMPOTENCY_KEY, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_DECISIONS.NEEDS_MORE_CONTEXT, 'idempotencyKey');
  }

  if (publicRepositoryNeedsRiskReview(original.repositoryVisibilitySnapshot)) {
    return block(output, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.PUBLIC_REPOSITORY_RISK_REVIEW, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_DECISIONS.NEEDS_MORE_CONTEXT, 'explicitPublicRepositoryRiskReview');
  }

  if (original.sampleDataAuditSnapshot.unsafeSampleData === true) {
    return block(output, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.UNSAFE_SAMPLE_DATA, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_DECISIONS.BLOCK_PUBLIC_SURFACE_DECISION, null, 'UNSAFE_SAMPLE_DATA');
  }

  if (original.sampleDataAuditSnapshot.containsProductionData === true || original.sampleDataAuditSnapshot.containsProductionPii === true) {
    return block(output, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.PRODUCTION_DATA_DETECTED, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_DECISIONS.BLOCK_PUBLIC_SURFACE_DECISION, null, 'PRODUCTION_DATA_DETECTED');
  }

  if (scanFailed(original.secretsScanSnapshot, 'secretDetected')) {
    return block(output, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.SECRET_DETECTED, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_DECISIONS.BLOCK_PUBLIC_SURFACE_DECISION, null, 'SECRET_DETECTED');
  }

  if (scanFailed(original.apiScanSnapshot, 'apiCallDetected')) {
    return block(output, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.API_CALL_DETECTED, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_DECISIONS.BLOCK_PUBLIC_SURFACE_DECISION, null, 'API_CALL_DETECTED');
  }

  if (scanFailed(original.trackingScanSnapshot, 'trackingDetected')) {
    return block(output, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.TRACKING_DETECTED, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_DECISIONS.BLOCK_PUBLIC_SURFACE_DECISION, null, 'TRACKING_DETECTED');
  }

  if (scanFailed(original.storageScanSnapshot, 'storageWriteDetected')) {
    return block(output, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.STORAGE_WRITE_DETECTED, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_DECISIONS.BLOCK_PUBLIC_SURFACE_DECISION, null, 'STORAGE_WRITE_DETECTED');
  }

  if (scanFailed(original.formsScanSnapshot, 'formSubmissionDetected')) {
    return block(output, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.FORM_SUBMISSION_DETECTED, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_DECISIONS.BLOCK_PUBLIC_SURFACE_DECISION, null, 'FORM_SUBMISSION_DETECTED');
  }

  if (scanFailed(original.serviceWorkerScanSnapshot, 'serviceWorkerDetected')) {
    return block(output, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.SERVICE_WORKER_DETECTED, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_DECISIONS.BLOCK_PUBLIC_SURFACE_DECISION, null, 'SERVICE_WORKER_DETECTED');
  }

  if (original.deploymentExecutionRequested === true || original.approvedForDeploymentExecution === true) {
    return block(output, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.DEPLOYMENT_EXECUTION_NOT_AUTHORIZED, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_DECISIONS.BLOCK_PUBLIC_SURFACE_DECISION, null, 'DEPLOYMENT_EXECUTION_NOT_AUTHORIZED');
  }

  if (original.githubPagesSettingsMutationRequested === true || original.approvedForGitHubPagesSettingsMutation === true) {
    return block(output, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.GITHUB_PAGES_SETTINGS_MUTATION_NOT_AUTHORIZED, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_DECISIONS.BLOCK_PUBLIC_SURFACE_DECISION, null, 'GITHUB_PAGES_SETTINGS_MUTATION_NOT_AUTHORIZED');
  }

  if (original.publicUrlCreationRequested === true || original.createsPublicUrl === true) {
    return block(output, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.PUBLIC_URL_CREATION_NOT_AUTHORIZED, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_DECISIONS.BLOCK_PUBLIC_SURFACE_DECISION, null, 'PUBLIC_URL_CREATION_NOT_AUTHORIZED');
  }

  if (original.publicUrlVerificationRequested === true || original.verifiesPublicUrl === true) {
    return block(output, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.PUBLIC_URL_VERIFICATION_NOT_AUTHORIZED, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_DECISIONS.BLOCK_PUBLIC_SURFACE_DECISION, null, 'PUBLIC_URL_VERIFICATION_NOT_AUTHORIZED');
  }

  if (original.dnsMutationRequested === true || original.mutatesDns === true) {
    return block(output, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.DNS_MUTATION_NOT_AUTHORIZED, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_DECISIONS.BLOCK_PUBLIC_SURFACE_DECISION, null, 'DNS_MUTATION_NOT_AUTHORIZED');
  }

  if (original.customDomainRequested === true || original.configuresCustomDomain === true) {
    return block(output, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.CUSTOM_DOMAIN_NOT_AUTHORIZED, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_DECISIONS.BLOCK_PUBLIC_SURFACE_DECISION, null, 'CUSTOM_DOMAIN_NOT_AUTHORIZED');
  }

  if (isExpired(original.expirationWindowSnapshot, original.now)) {
    return block(output, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.EXPIRED_PUBLIC_SURFACE_DECISION_WINDOW, STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_DECISIONS.EXPIRED, null, 'EXPIRED_PUBLIC_SURFACE_DECISION_WINDOW');
  }

  output.ownerDecisionRecord = {
    ownerDecisionRecordId: original.ownerApprovalSnapshot.ownerApprovalId || original.idempotencyKey,
    owner: original.ownerApprovalSnapshot.owner || original.ownerIdentitySnapshot.ownerName,
    decision: 'APPROVE_PUBLIC_SURFACE_DECISION',
    reviewOnly: true,
    approvedForPublicSurfaceDecision: true,
    approvedForDeploymentExecution: false,
    approvedForGitHubPagesSettingsMutation: false,
    createsPublicUrl: false,
    verifiesPublicUrl: false,
    mutatesDns: false,
    configuresCustomDomain: false,
    githubPagesAvailabilityIsNotDeploymentAuthorization: true,
    evidenceRefs: unique(original.evidenceRefs),
    sourceEvidenceIds: unique(original.sourceEvidenceIds),
    sourceOwners: unique(original.sourceOwners),
  };

  output.publicSurfaceDecisionCandidate = {
    candidateName: 'Forge Alive Static Preview Public Surface Decision',
    sampleDataOnly: true,
    readOnly: true,
    notProduction: true,
    ownerDecisionOnly: true,
    noDeploymentExecution: true,
    noSettingsMutation: true,
    noPublicUrlCreation: true,
    noPublicUrlVerification: true,
    noDnsMutation: true,
    noCustomDomain: true,
  };

  output.approvedForPublicSurfaceDecision = true;
  output.publicSurfaceDecisionStatus = STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES.APPROVED_PUBLIC_SURFACE_DECISION;
  output.decision = STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_DECISIONS.APPROVE_PUBLIC_SURFACE_DECISION;
  output.rollbackNotes = unique([...output.rollbackNotes, 'Rollback plan must remain visible before any separate execution boundary.']);
  output.expirationNotes = unique([...output.expirationNotes, `Decision review window expires at ${original.expirationWindowSnapshot.expiresAt}.`]);
  return output;
}

module.exports = {
  buildStaticPreviewPublicSurfaceDecisionBoundary,
  STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_STATUSES,
  STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_DECISIONS,
  STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_ALLOWED_USES,
  STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_FORBIDDEN_USES,
};
