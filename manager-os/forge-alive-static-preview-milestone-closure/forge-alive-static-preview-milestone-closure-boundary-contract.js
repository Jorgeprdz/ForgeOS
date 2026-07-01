/**
 * Forge Alive Static Preview Milestone Closure Boundary Contract
 *
 * Milestone closure is not production release.
 * Milestone closure is not publication authorization.
 * This boundary creates an internal closure record from closed module evidence only.
 */

const FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES = Object.freeze({
  READY_FOR_MILESTONE_CLOSURE: 'READY_FOR_MILESTONE_CLOSURE',
  APPROVED_FOR_MILESTONE_CLOSURE: 'APPROVED_FOR_MILESTONE_CLOSURE',
  NEEDS_STATIC_PREVIEW_IMPLEMENTATION: 'NEEDS_STATIC_PREVIEW_IMPLEMENTATION',
  NEEDS_DEPLOYMENT_BOUNDARY: 'NEEDS_DEPLOYMENT_BOUNDARY',
  NEEDS_PUBLIC_SURFACE_DECISION: 'NEEDS_PUBLIC_SURFACE_DECISION',
  NEEDS_PUBLIC_URL_VERIFICATION: 'NEEDS_PUBLIC_URL_VERIFICATION',
  NEEDS_RELEASE_NOTE: 'NEEDS_RELEASE_NOTE',
  NEEDS_REVIEW_PACKET: 'NEEDS_REVIEW_PACKET',
  NEEDS_UNIFIED_BUILD_TREE: 'NEEDS_UNIFIED_BUILD_TREE',
  NEEDS_ROADMAP: 'NEEDS_ROADMAP',
  NEEDS_TEST_EVIDENCE: 'NEEDS_TEST_EVIDENCE',
  NEEDS_EVIDENCE_BUNDLE: 'NEEDS_EVIDENCE_BUNDLE',
  NEEDS_SOURCE_OWNERSHIP: 'NEEDS_SOURCE_OWNERSHIP',
  NEEDS_MILESTONE_POLICY: 'NEEDS_MILESTONE_POLICY',
  NEEDS_LIMITATION_SNAPSHOT: 'NEEDS_LIMITATION_SNAPSHOT',
  NEEDS_EVIDENCE: 'NEEDS_EVIDENCE',
  NEEDS_SOURCE_OWNER: 'NEEDS_SOURCE_OWNER',
  NEEDS_IDEMPOTENCY_KEY: 'NEEDS_IDEMPOTENCY_KEY',
  UNSAFE_MILESTONE_CLOSURE: 'UNSAFE_MILESTONE_CLOSURE',
  PRODUCTION_RELEASE_NOT_AUTHORIZED: 'PRODUCTION_RELEASE_NOT_AUTHORIZED',
  PUBLICATION_NOT_AUTHORIZED: 'PUBLICATION_NOT_AUTHORIZED',
  DEPLOYMENT_EXECUTION_NOT_AUTHORIZED: 'DEPLOYMENT_EXECUTION_NOT_AUTHORIZED',
  GITHUB_PAGES_SETTINGS_MUTATION_NOT_AUTHORIZED: 'GITHUB_PAGES_SETTINGS_MUTATION_NOT_AUTHORIZED',
  PUBLIC_URL_CREATION_NOT_AUTHORIZED: 'PUBLIC_URL_CREATION_NOT_AUTHORIZED',
  PUBLIC_URL_VERIFICATION_NOT_AUTHORIZED: 'PUBLIC_URL_VERIFICATION_NOT_AUTHORIZED',
  NETWORK_CALL_NOT_AUTHORIZED: 'NETWORK_CALL_NOT_AUTHORIZED',
  HTTP_REQUEST_NOT_AUTHORIZED: 'HTTP_REQUEST_NOT_AUTHORIZED',
  DNS_LOOKUP_NOT_AUTHORIZED: 'DNS_LOOKUP_NOT_AUTHORIZED',
  API_CALL_DETECTED: 'API_CALL_DETECTED',
  TRACKING_DETECTED: 'TRACKING_DETECTED',
  STORAGE_WRITE_DETECTED: 'STORAGE_WRITE_DETECTED',
  FORM_SUBMISSION_DETECTED: 'FORM_SUBMISSION_DETECTED',
  SERVICE_WORKER_DETECTED: 'SERVICE_WORKER_DETECTED',
  CRM_MUTATION_NOT_AUTHORIZED: 'CRM_MUTATION_NOT_AUTHORIZED',
  TRUTH_CREATION_NOT_AUTHORIZED: 'TRUTH_CREATION_NOT_AUTHORIZED',
  ACTION_EXECUTION_NOT_AUTHORIZED: 'ACTION_EXECUTION_NOT_AUTHORIZED',
  EXPIRED_MILESTONE_CLOSURE_WINDOW: 'EXPIRED_MILESTONE_CLOSURE_WINDOW',
  BLOCKED: 'BLOCKED',
  UNKNOWN: 'UNKNOWN',
  NOT_MODELED: 'NOT_MODELED',
});

const FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_DECISIONS = Object.freeze({
  REQUEST_MILESTONE_CLOSURE: 'REQUEST_MILESTONE_CLOSURE',
  APPROVE_MILESTONE_CLOSURE: 'APPROVE_MILESTONE_CLOSURE',
  BLOCK_MILESTONE_CLOSURE: 'BLOCK_MILESTONE_CLOSURE',
  NEEDS_MORE_CONTEXT: 'NEEDS_MORE_CONTEXT',
  EXPIRED: 'EXPIRED',
  NOT_MODELED: 'NOT_MODELED',
});

const FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_ALLOWED_USES = Object.freeze([
  'FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_REVIEW',
  'MILESTONE_CLOSURE_RECORD_PREP',
  'CLOSED_MODULE_SUMMARY_REVIEW',
  'TEST_EVIDENCE_REVIEW',
  'ROADMAP_HANDOFF_REVIEW',
]);

const FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_FORBIDDEN_USES = Object.freeze([
  'PRODUCTION_RELEASE',
  'PUBLICATION',
  'MILESTONE_PUBLICATION',
  'STATIC_PREVIEW_PUBLICATION',
  'ACTUAL_DEPLOYMENT_EXECUTION',
  'GITHUB_PAGES_SETTINGS_MUTATION',
  'PUBLIC_URL_CREATION',
  'PUBLIC_URL_VERIFICATION',
  'NETWORK_CALL',
  'HTTP_REQUEST',
  'DNS_LOOKUP',
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
  return hasObject(snapshot) && (snapshot.reviewed === true || snapshot.validated === true || snapshot.closed === true);
}

function block(output, status, decision, signal, blockedUse) {
  output.milestoneClosureStatus = status;
  output.decision = decision;
  if (signal) output.missingSignals = unique([...output.missingSignals, signal]);
  if (blockedUse) output.blockedUses = unique([...output.blockedUses, blockedUse]);
  return output;
}

function baseOutput(input) {
  return {
    milestoneClosureStatus: FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.UNKNOWN,
    decision: FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_DECISIONS.NEEDS_MORE_CONTEXT,
    milestoneClosureRequestId: input.milestoneClosureRequestId || null,
    milestoneClosureRecord: null,
    closedMilestoneName: null,
    closedPhaseRange: null,
    closedModuleList: [],
    closureEvidence: null,
    requiredEvidenceComplete: false,
    approvedForMilestoneClosure: false,
    productionReleaseApproved: false,
    publicationAuthorized: false,
    publishesMilestone: false,
    publishesStaticPreview: false,
    deploysApp: false,
    mutatesGitHubPagesSettings: false,
    createsPublicUrl: false,
    verifiesPublicUrl: false,
    performsNetworkCall: false,
    performsHttpRequest: false,
    performsDnsLookup: false,
    mutatesDns: false,
    configuresCustomDomain: false,
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
    milestoneClosureIsNotProductionRelease: true,
    milestoneClosureIsNotPublicationAuthorization: true,
    missingSignals: [],
    blockedUses: [],
    allowedUses: [],
    evidenceRefs: unique(input.evidenceRefs),
    sourceEvidenceIds: unique(input.sourceEvidenceIds),
    sourceOwners: unique(input.sourceOwners),
    warnings: unique([
      ...asArray(input.warnings),
      ...asArray(input.milestonePolicySnapshot?.warnings),
      ...asArray(input.limitationSnapshot?.warnings),
      ...asArray(input.reviewPacketSnapshot?.warnings),
    ]),
    limitations: unique([
      ...asArray(input.limitations),
      ...asArray(input.milestonePolicySnapshot?.limitations),
      ...asArray(input.limitationSnapshot?.limitations),
      ...asArray(input.reviewPacketSnapshot?.limitations),
    ]),
    nextPhase: input.nextPhase || '051A_NEXT_PRODUCT_SLICE_DECISION_SCOPE',
  };
}

function hasStaticPreviewImplementation(snapshot) {
  return reviewed(snapshot) && snapshot.implemented === true && snapshot.sampleDataOnly === true && snapshot.readOnly === true && snapshot.notProduction === true;
}

function hasDeploymentBoundary(snapshot) {
  return reviewed(snapshot) && snapshot.implemented === true && snapshot.publicSurfaceCandidateReviewOnly === true && snapshot.approvedForDeploymentExecution !== true;
}

function hasPublicSurfaceDecision(snapshot) {
  return reviewed(snapshot) && snapshot.approvedForPublicSurfaceDecision === true && snapshot.ownerDecisionRecordOnly === true && snapshot.approvedForDeploymentExecution !== true;
}

function hasPublicUrlVerification(snapshot) {
  return reviewed(snapshot) && snapshot.verifiedFromEvidence === true && snapshot.evidenceOnly === true && snapshot.performsNetworkCall !== true;
}

function hasReleaseNote(snapshot) {
  return reviewed(snapshot) && snapshot.approvedForReleaseNoteDraft === true && snapshot.releaseNoteDraftOnly === true && snapshot.publishesReleaseNote !== true;
}

function hasReviewPacket(snapshot) {
  return reviewed(snapshot) && snapshot.approvedForReviewPacketDraft === true && snapshot.reviewPacketDraftOnly === true && snapshot.publishesReviewPacket !== true;
}

function hasUnifiedBuildTree(snapshot) {
  return reviewed(snapshot) && snapshot.updated === true && snapshot.containsMilestoneScope === true && snapshot.containsMilestoneImplementationNext === true;
}

function hasRoadmap(snapshot) {
  return reviewed(snapshot) && Boolean(snapshot.nextPhase) && snapshot.containsMilestoneClosure === true;
}

function hasTestEvidence(snapshot) {
  return reviewed(snapshot) && snapshot.allRequiredTestsPass === true && asArray(snapshot.requiredTests).length > 0;
}

function hasEvidenceBundle(snapshot) {
  return reviewed(snapshot) && snapshot.complete === true;
}

function hasSourceOwnership(snapshot) {
  return reviewed(snapshot) && snapshot.sourceOwned === true;
}

function hasMilestonePolicy(snapshot) {
  return reviewed(snapshot)
    && snapshot.milestoneClosureOnly === true
    && snapshot.productionReleaseAllowed !== true
    && snapshot.publicationAllowed !== true
    && snapshot.requiresLimitations === true;
}

function hasLimitationSnapshot(snapshot) {
  return reviewed(snapshot)
    && snapshot.limitationsVisible === true
    && snapshot.productionReleaseNotAuthorized === true
    && snapshot.publicationNotAuthorized === true;
}

function hasEvidence(input) {
  return asArray(input.evidenceRefs).length > 0 && asArray(input.sourceEvidenceIds).length > 0;
}

function hasSourceOwners(input) {
  return asArray(input.sourceOwners).length > 0;
}

function isExpired(input) {
  const expiryValue = input.expiresAt || input.expirationWindowSnapshot?.expiresAt;
  if (!expiryValue) return false;
  const expiry = new Date(expiryValue);
  const now = input.now ? new Date(input.now) : new Date();
  return !Number.isNaN(expiry.getTime()) && expiry.getTime() <= now.getTime();
}

function buildForgeAliveStaticPreviewMilestoneClosureBoundary(input = {}) {
  const original = clone(input) || {};
  const output = baseOutput(original);
  const requestedUse = norm(original.requestedUse);

  if (requestedUse && FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_FORBIDDEN_USES.includes(requestedUse)) {
    return block(output, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.BLOCKED, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_DECISIONS.BLOCK_MILESTONE_CLOSURE, null, requestedUse);
  }

  if (requestedUse && !FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_ALLOWED_USES.includes(requestedUse)) {
    output.blockedUses = unique([requestedUse]);
    output.milestoneClosureStatus = FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.NOT_MODELED;
    output.decision = FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_DECISIONS.NOT_MODELED;
    return output;
  }

  if (requestedUse) output.allowedUses = unique([requestedUse]);

  if (!hasStaticPreviewImplementation(original.staticPreviewImplementationSnapshot)) return block(output, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.NEEDS_STATIC_PREVIEW_IMPLEMENTATION, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_DECISIONS.NEEDS_MORE_CONTEXT, 'staticPreviewImplementationSnapshot');
  if (!hasDeploymentBoundary(original.staticPreviewDeploymentBoundarySnapshot)) return block(output, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.NEEDS_DEPLOYMENT_BOUNDARY, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_DECISIONS.NEEDS_MORE_CONTEXT, 'staticPreviewDeploymentBoundarySnapshot');
  if (!hasPublicSurfaceDecision(original.publicSurfaceDecisionSnapshot)) return block(output, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.NEEDS_PUBLIC_SURFACE_DECISION, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_DECISIONS.NEEDS_MORE_CONTEXT, 'publicSurfaceDecisionSnapshot');
  if (!hasPublicUrlVerification(original.publicUrlVerificationSnapshot)) return block(output, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.NEEDS_PUBLIC_URL_VERIFICATION, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_DECISIONS.NEEDS_MORE_CONTEXT, 'publicUrlVerificationSnapshot');
  if (!hasReleaseNote(original.releaseNoteSnapshot)) return block(output, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.NEEDS_RELEASE_NOTE, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_DECISIONS.NEEDS_MORE_CONTEXT, 'releaseNoteSnapshot');
  if (!hasReviewPacket(original.reviewPacketSnapshot)) return block(output, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.NEEDS_REVIEW_PACKET, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_DECISIONS.NEEDS_MORE_CONTEXT, 'reviewPacketSnapshot');
  if (!hasUnifiedBuildTree(original.unifiedBuildTreeSnapshot)) return block(output, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.NEEDS_UNIFIED_BUILD_TREE, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_DECISIONS.NEEDS_MORE_CONTEXT, 'unifiedBuildTreeSnapshot');
  if (!hasRoadmap(original.roadmapSnapshot)) return block(output, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.NEEDS_ROADMAP, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_DECISIONS.NEEDS_MORE_CONTEXT, 'roadmapSnapshot');
  if (!hasTestEvidence(original.testEvidenceSnapshot)) return block(output, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.NEEDS_TEST_EVIDENCE, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_DECISIONS.NEEDS_MORE_CONTEXT, 'testEvidenceSnapshot');
  if (!hasEvidenceBundle(original.evidenceBundleSnapshot)) return block(output, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.NEEDS_EVIDENCE_BUNDLE, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_DECISIONS.NEEDS_MORE_CONTEXT, 'evidenceBundleSnapshot');
  if (!hasSourceOwnership(original.sourceOwnershipSnapshot)) return block(output, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.NEEDS_SOURCE_OWNERSHIP, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_DECISIONS.NEEDS_MORE_CONTEXT, 'sourceOwnershipSnapshot');
  if (!hasMilestonePolicy(original.milestonePolicySnapshot)) return block(output, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.NEEDS_MILESTONE_POLICY, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_DECISIONS.NEEDS_MORE_CONTEXT, 'milestonePolicySnapshot');
  if (!hasLimitationSnapshot(original.limitationSnapshot)) return block(output, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.NEEDS_LIMITATION_SNAPSHOT, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_DECISIONS.NEEDS_MORE_CONTEXT, 'limitationSnapshot');
  if (!hasEvidence(original)) return block(output, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.NEEDS_EVIDENCE, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_DECISIONS.NEEDS_MORE_CONTEXT, 'evidenceRefs');
  if (!hasSourceOwners(original)) return block(output, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.NEEDS_SOURCE_OWNER, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_DECISIONS.NEEDS_MORE_CONTEXT, 'sourceOwners');
  if (!original.idempotencyKey) return block(output, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.NEEDS_IDEMPOTENCY_KEY, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_DECISIONS.NEEDS_MORE_CONTEXT, 'idempotencyKey');

  if (original.milestonePolicySnapshot.unsafeMilestoneClosure === true) return block(output, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.UNSAFE_MILESTONE_CLOSURE, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_DECISIONS.BLOCK_MILESTONE_CLOSURE, null, 'UNSAFE_MILESTONE_CLOSURE');
  if (original.productionReleaseRequested === true || original.productionReleaseApproved === true) return block(output, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.PRODUCTION_RELEASE_NOT_AUTHORIZED, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_DECISIONS.BLOCK_MILESTONE_CLOSURE, null, 'PRODUCTION_RELEASE_NOT_AUTHORIZED');
  if (original.publicationRequested === true || original.publicationAuthorized === true || original.publishesMilestone === true || original.publishesStaticPreview === true) return block(output, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.PUBLICATION_NOT_AUTHORIZED, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_DECISIONS.BLOCK_MILESTONE_CLOSURE, null, 'PUBLICATION_NOT_AUTHORIZED');
  if (original.deploymentExecutionRequested === true || original.deploysApp === true) return block(output, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.DEPLOYMENT_EXECUTION_NOT_AUTHORIZED, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_DECISIONS.BLOCK_MILESTONE_CLOSURE, null, 'DEPLOYMENT_EXECUTION_NOT_AUTHORIZED');
  if (original.githubPagesSettingsMutationRequested === true || original.mutatesGitHubPagesSettings === true) return block(output, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.GITHUB_PAGES_SETTINGS_MUTATION_NOT_AUTHORIZED, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_DECISIONS.BLOCK_MILESTONE_CLOSURE, null, 'GITHUB_PAGES_SETTINGS_MUTATION_NOT_AUTHORIZED');
  if (original.publicUrlCreationRequested === true || original.createsPublicUrl === true) return block(output, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.PUBLIC_URL_CREATION_NOT_AUTHORIZED, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_DECISIONS.BLOCK_MILESTONE_CLOSURE, null, 'PUBLIC_URL_CREATION_NOT_AUTHORIZED');
  if (original.publicUrlVerificationRequested === true || original.verifiesPublicUrl === true) return block(output, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.PUBLIC_URL_VERIFICATION_NOT_AUTHORIZED, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_DECISIONS.BLOCK_MILESTONE_CLOSURE, null, 'PUBLIC_URL_VERIFICATION_NOT_AUTHORIZED');
  if (original.networkCallRequested === true || original.performsNetworkCall === true) return block(output, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.NETWORK_CALL_NOT_AUTHORIZED, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_DECISIONS.BLOCK_MILESTONE_CLOSURE, null, 'NETWORK_CALL_NOT_AUTHORIZED');
  if (original.httpRequestRequested === true || original.performsHttpRequest === true) return block(output, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.HTTP_REQUEST_NOT_AUTHORIZED, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_DECISIONS.BLOCK_MILESTONE_CLOSURE, null, 'HTTP_REQUEST_NOT_AUTHORIZED');
  if (original.dnsLookupRequested === true || original.performsDnsLookup === true) return block(output, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.DNS_LOOKUP_NOT_AUTHORIZED, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_DECISIONS.BLOCK_MILESTONE_CLOSURE, null, 'DNS_LOOKUP_NOT_AUTHORIZED');
  if (original.apiCallDetected === true || original.callsApi === true) return block(output, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.API_CALL_DETECTED, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_DECISIONS.BLOCK_MILESTONE_CLOSURE, null, 'API_CALL_DETECTED');
  if (original.trackingDetected === true || original.enablesTracking === true || original.enablesAnalytics === true) return block(output, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.TRACKING_DETECTED, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_DECISIONS.BLOCK_MILESTONE_CLOSURE, null, 'TRACKING_DETECTED');
  if (original.storageWriteDetected === true || original.writesStorage === true) return block(output, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.STORAGE_WRITE_DETECTED, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_DECISIONS.BLOCK_MILESTONE_CLOSURE, null, 'STORAGE_WRITE_DETECTED');
  if (original.formSubmissionDetected === true || original.createsFormSubmission === true) return block(output, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.FORM_SUBMISSION_DETECTED, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_DECISIONS.BLOCK_MILESTONE_CLOSURE, null, 'FORM_SUBMISSION_DETECTED');
  if (original.serviceWorkerDetected === true || original.registersServiceWorker === true) return block(output, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.SERVICE_WORKER_DETECTED, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_DECISIONS.BLOCK_MILESTONE_CLOSURE, null, 'SERVICE_WORKER_DETECTED');
  if (original.crmMutationRequested === true || original.mutatesCrm === true) return block(output, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.CRM_MUTATION_NOT_AUTHORIZED, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_DECISIONS.BLOCK_MILESTONE_CLOSURE, null, 'CRM_MUTATION_NOT_AUTHORIZED');
  if (original.truthCreationRequested === true || original.writesCanonicalTruth === true || original.createsBusinessTruth === true || original.createsMetricTruth === true || original.createsEconomicTruth === true) return block(output, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.TRUTH_CREATION_NOT_AUTHORIZED, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_DECISIONS.BLOCK_MILESTONE_CLOSURE, null, 'TRUTH_CREATION_NOT_AUTHORIZED');
  if (original.actionExecutionRequested === true || original.executesAction === true || original.sendsMessage === true) return block(output, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.ACTION_EXECUTION_NOT_AUTHORIZED, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_DECISIONS.BLOCK_MILESTONE_CLOSURE, null, 'ACTION_EXECUTION_NOT_AUTHORIZED');
  if (isExpired(original)) return block(output, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.EXPIRED_MILESTONE_CLOSURE_WINDOW, FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_DECISIONS.EXPIRED, null, 'EXPIRED_MILESTONE_CLOSURE_WINDOW');

  const modules = unique([
    '044B GitHub Pages Static Preview Implementation',
    '045B Static Preview Deployment Boundary',
    '046B Static Preview Public Surface Decision Boundary',
    '047B Public URL Verification Boundary',
    '048B Static Preview Release Note Boundary',
    '049B Static Preview Review Packet Boundary',
  ]);

  output.closedMilestoneName = 'Forge Alive Static Preview';
  output.closedPhaseRange = '044B through 049B';
  output.closedModuleList = modules;
  output.requiredEvidenceComplete = true;
  output.closureEvidence = {
    evidenceOnly: true,
    requiredTests: unique(original.testEvidenceSnapshot.requiredTests),
    unifiedBuildTreeUpdated: true,
    roadmapNextPhase: original.roadmapSnapshot.nextPhase,
    evidenceRefs: unique(original.evidenceRefs),
    sourceEvidenceIds: unique(original.sourceEvidenceIds),
    sourceOwners: unique(original.sourceOwners),
  };
  output.milestoneClosureRecord = {
    milestoneClosureRecordId: original.idempotencyKey,
    milestoneName: output.closedMilestoneName,
    phaseRange: output.closedPhaseRange,
    status: 'INTERNAL_MILESTONE_CLOSED',
    notProductionRelease: true,
    notPublicationAuthorization: true,
    noPublish: true,
    noDeploy: true,
    noGitHubPagesSettingsMutation: true,
    noPublicUrlCreation: true,
    noPublicUrlVerification: true,
    noNetworkCall: true,
    noHttpRequest: true,
    noDnsLookup: true,
    closedModules: modules,
    requiredTests: unique(original.testEvidenceSnapshot.requiredTests),
    limitations: unique([...output.limitations, 'Production release remains not authorized.', 'Publication remains not authorized.']),
    nextPhase: output.nextPhase,
  };

  output.approvedForMilestoneClosure = true;
  output.milestoneClosureStatus = FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES.APPROVED_FOR_MILESTONE_CLOSURE;
  output.decision = FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_DECISIONS.APPROVE_MILESTONE_CLOSURE;
  output.warnings = unique([...output.warnings, 'Milestone closure is not production release.', 'Milestone closure is not publication authorization.']);
  output.limitations = unique([...output.limitations, 'Internal milestone closure only. No release, publish, deploy, URL verification, or network call.']);
  return output;
}

module.exports = {
  buildForgeAliveStaticPreviewMilestoneClosureBoundary,
  FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_STATUSES,
  FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_DECISIONS,
  FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_ALLOWED_USES,
  FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_FORBIDDEN_USES,
};
