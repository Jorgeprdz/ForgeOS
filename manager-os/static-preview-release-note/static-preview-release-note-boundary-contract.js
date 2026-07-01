/**
 * Static Preview Release Note Boundary Contract
 *
 * Release note is not publication authorization.
 * This boundary produces a human-readable draft from closed module evidence only.
 * It never publishes, deploys, mutates settings, creates/verifies URLs, or calls network.
 */

const STATIC_PREVIEW_RELEASE_NOTE_STATUSES = Object.freeze({
  READY_FOR_RELEASE_NOTE_DRAFT: 'READY_FOR_RELEASE_NOTE_DRAFT',
  APPROVED_FOR_RELEASE_NOTE_DRAFT: 'APPROVED_FOR_RELEASE_NOTE_DRAFT',
  NEEDS_STATIC_PREVIEW_IMPLEMENTATION: 'NEEDS_STATIC_PREVIEW_IMPLEMENTATION',
  NEEDS_PUBLIC_SURFACE_DECISION: 'NEEDS_PUBLIC_SURFACE_DECISION',
  NEEDS_PUBLIC_URL_VERIFICATION: 'NEEDS_PUBLIC_URL_VERIFICATION',
  NEEDS_RELEASE_NOTE_POLICY: 'NEEDS_RELEASE_NOTE_POLICY',
  NEEDS_AUDIENCE: 'NEEDS_AUDIENCE',
  NEEDS_MESSAGING_BOUNDARY: 'NEEDS_MESSAGING_BOUNDARY',
  NEEDS_SAFETY_BOUNDARY: 'NEEDS_SAFETY_BOUNDARY',
  NEEDS_EVIDENCE_BUNDLE: 'NEEDS_EVIDENCE_BUNDLE',
  NEEDS_SOURCE_OWNERSHIP: 'NEEDS_SOURCE_OWNERSHIP',
  NEEDS_ROADMAP: 'NEEDS_ROADMAP',
  NEEDS_EVIDENCE: 'NEEDS_EVIDENCE',
  NEEDS_SOURCE_OWNER: 'NEEDS_SOURCE_OWNER',
  NEEDS_IDEMPOTENCY_KEY: 'NEEDS_IDEMPOTENCY_KEY',
  UNSAFE_RELEASE_NOTE: 'UNSAFE_RELEASE_NOTE',
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
  EXPIRED_RELEASE_NOTE_WINDOW: 'EXPIRED_RELEASE_NOTE_WINDOW',
  BLOCKED: 'BLOCKED',
  UNKNOWN: 'UNKNOWN',
  NOT_MODELED: 'NOT_MODELED',
});

const STATIC_PREVIEW_RELEASE_NOTE_DECISIONS = Object.freeze({
  REQUEST_RELEASE_NOTE_DRAFT: 'REQUEST_RELEASE_NOTE_DRAFT',
  APPROVE_RELEASE_NOTE_DRAFT: 'APPROVE_RELEASE_NOTE_DRAFT',
  BLOCK_RELEASE_NOTE: 'BLOCK_RELEASE_NOTE',
  NEEDS_MORE_CONTEXT: 'NEEDS_MORE_CONTEXT',
  EXPIRED: 'EXPIRED',
  NOT_MODELED: 'NOT_MODELED',
});

const STATIC_PREVIEW_RELEASE_NOTE_ALLOWED_USES = Object.freeze([
  'STATIC_PREVIEW_RELEASE_NOTE_REVIEW',
  'RELEASE_NOTE_DRAFT_PREP',
  'EVIDENCE_SUMMARY_REVIEW',
  'SAFETY_SUMMARY_REVIEW',
  'ROADMAP_SUMMARY_REVIEW',
]);

const STATIC_PREVIEW_RELEASE_NOTE_FORBIDDEN_USES = Object.freeze([
  'PUBLICATION',
  'RELEASE_NOTE_PUBLICATION',
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
  output.releaseNoteStatus = status;
  output.decision = decision;
  if (signal) output.missingSignals = unique([...output.missingSignals, signal]);
  if (blockedUse) output.blockedUses = unique([...output.blockedUses, blockedUse]);
  return output;
}

function baseOutput(input) {
  return {
    releaseNoteStatus: STATIC_PREVIEW_RELEASE_NOTE_STATUSES.UNKNOWN,
    decision: STATIC_PREVIEW_RELEASE_NOTE_DECISIONS.NEEDS_MORE_CONTEXT,
    releaseNoteRequestId: input.releaseNoteRequestId || null,
    releaseNoteDraft: null,
    releaseNoteEvidence: null,
    approvedForReleaseNoteDraft: false,
    publishesReleaseNote: false,
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
    releaseNoteIsNotPublicationAuthorization: true,
    missingSignals: [],
    blockedUses: [],
    allowedUses: [],
    evidenceRefs: unique(input.evidenceRefs),
    sourceEvidenceIds: unique(input.sourceEvidenceIds),
    sourceOwners: unique(input.sourceOwners),
    warnings: unique([
      ...asArray(input.warnings),
      ...asArray(input.releaseNotePolicySnapshot?.warnings),
      ...asArray(input.safetyBoundarySnapshot?.warnings),
      ...asArray(input.publicUrlVerificationSnapshot?.warnings),
    ]),
    limitations: unique([
      ...asArray(input.limitations),
      ...asArray(input.releaseNotePolicySnapshot?.limitations),
      ...asArray(input.safetyBoundarySnapshot?.limitations),
      ...asArray(input.publicUrlVerificationSnapshot?.limitations),
    ]),
    nextPhase: input.nextPhase || '049A_STATIC_PREVIEW_REVIEW_PACKET_SCOPE',
  };
}

function hasStaticPreviewImplementation(snapshot) {
  return reviewed(snapshot)
    && snapshot.implemented === true
    && snapshot.sampleDataOnly === true
    && snapshot.readOnly === true
    && snapshot.notProduction === true;
}

function hasPublicSurfaceDecision(snapshot) {
  return reviewed(snapshot)
    && snapshot.approvedForPublicSurfaceDecision === true
    && snapshot.ownerDecisionRecordOnly === true
    && snapshot.approvedForDeploymentExecution !== true;
}

function hasPublicUrlVerification(snapshot) {
  return reviewed(snapshot)
    && snapshot.verifiedFromEvidence === true
    && snapshot.evidenceOnly === true
    && snapshot.performsNetworkCall !== true
    && snapshot.performsHttpRequest !== true
    && snapshot.performsDnsLookup !== true;
}

function hasReleaseNotePolicy(snapshot) {
  return reviewed(snapshot)
    && snapshot.releaseNoteDraftOnly === true
    && snapshot.publicationAllowed !== true
    && snapshot.requiresSafetyLanguage === true;
}

function hasAudience(snapshot) {
  return reviewed(snapshot) && Boolean(snapshot.audience);
}

function hasMessagingBoundary(snapshot) {
  return reviewed(snapshot)
    && snapshot.explainsWhatItIs === true
    && snapshot.explainsWhatItIsNot === true
    && snapshot.noClaimsOfProduction === true;
}

function hasSafetyBoundary(snapshot) {
  return reviewed(snapshot)
    && snapshot.noPublish === true
    && snapshot.noDeploy === true
    && snapshot.noNetwork === true
    && snapshot.noPublicUrlCreation === true
    && snapshot.noPublicUrlVerification === true;
}

function hasEvidenceBundle(snapshot) {
  return reviewed(snapshot) && snapshot.complete === true;
}

function hasSourceOwnership(snapshot) {
  return reviewed(snapshot) && snapshot.sourceOwned === true;
}

function hasRoadmap(snapshot) {
  return reviewed(snapshot) && Boolean(snapshot.nextPhase);
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

function buildStaticPreviewReleaseNoteBoundary(input = {}) {
  const original = clone(input) || {};
  const output = baseOutput(original);
  const requestedUse = norm(original.requestedUse);

  if (requestedUse && STATIC_PREVIEW_RELEASE_NOTE_FORBIDDEN_USES.includes(requestedUse)) {
    return block(output, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.BLOCKED, STATIC_PREVIEW_RELEASE_NOTE_DECISIONS.BLOCK_RELEASE_NOTE, null, requestedUse);
  }

  if (requestedUse && !STATIC_PREVIEW_RELEASE_NOTE_ALLOWED_USES.includes(requestedUse)) {
    output.blockedUses = unique([requestedUse]);
    output.releaseNoteStatus = STATIC_PREVIEW_RELEASE_NOTE_STATUSES.NOT_MODELED;
    output.decision = STATIC_PREVIEW_RELEASE_NOTE_DECISIONS.NOT_MODELED;
    return output;
  }

  if (requestedUse) output.allowedUses = unique([requestedUse]);

  if (!hasStaticPreviewImplementation(original.staticPreviewImplementationSnapshot)) {
    return block(output, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.NEEDS_STATIC_PREVIEW_IMPLEMENTATION, STATIC_PREVIEW_RELEASE_NOTE_DECISIONS.NEEDS_MORE_CONTEXT, 'staticPreviewImplementationSnapshot');
  }

  if (!hasPublicSurfaceDecision(original.publicSurfaceDecisionSnapshot)) {
    return block(output, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.NEEDS_PUBLIC_SURFACE_DECISION, STATIC_PREVIEW_RELEASE_NOTE_DECISIONS.NEEDS_MORE_CONTEXT, 'publicSurfaceDecisionSnapshot');
  }

  if (!hasPublicUrlVerification(original.publicUrlVerificationSnapshot)) {
    return block(output, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.NEEDS_PUBLIC_URL_VERIFICATION, STATIC_PREVIEW_RELEASE_NOTE_DECISIONS.NEEDS_MORE_CONTEXT, 'publicUrlVerificationSnapshot');
  }

  if (!hasReleaseNotePolicy(original.releaseNotePolicySnapshot)) {
    return block(output, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.NEEDS_RELEASE_NOTE_POLICY, STATIC_PREVIEW_RELEASE_NOTE_DECISIONS.NEEDS_MORE_CONTEXT, 'releaseNotePolicySnapshot');
  }

  if (!hasAudience(original.audienceSnapshot)) {
    return block(output, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.NEEDS_AUDIENCE, STATIC_PREVIEW_RELEASE_NOTE_DECISIONS.NEEDS_MORE_CONTEXT, 'audienceSnapshot');
  }

  if (!hasMessagingBoundary(original.messagingBoundarySnapshot)) {
    return block(output, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.NEEDS_MESSAGING_BOUNDARY, STATIC_PREVIEW_RELEASE_NOTE_DECISIONS.NEEDS_MORE_CONTEXT, 'messagingBoundarySnapshot');
  }

  if (!hasSafetyBoundary(original.safetyBoundarySnapshot)) {
    return block(output, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.NEEDS_SAFETY_BOUNDARY, STATIC_PREVIEW_RELEASE_NOTE_DECISIONS.NEEDS_MORE_CONTEXT, 'safetyBoundarySnapshot');
  }

  if (!hasEvidenceBundle(original.evidenceBundleSnapshot)) {
    return block(output, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.NEEDS_EVIDENCE_BUNDLE, STATIC_PREVIEW_RELEASE_NOTE_DECISIONS.NEEDS_MORE_CONTEXT, 'evidenceBundleSnapshot');
  }

  if (!hasSourceOwnership(original.sourceOwnershipSnapshot)) {
    return block(output, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.NEEDS_SOURCE_OWNERSHIP, STATIC_PREVIEW_RELEASE_NOTE_DECISIONS.NEEDS_MORE_CONTEXT, 'sourceOwnershipSnapshot');
  }

  if (!hasRoadmap(original.roadmapSnapshot)) {
    return block(output, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.NEEDS_ROADMAP, STATIC_PREVIEW_RELEASE_NOTE_DECISIONS.NEEDS_MORE_CONTEXT, 'roadmapSnapshot');
  }

  if (!hasEvidence(original)) {
    return block(output, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.NEEDS_EVIDENCE, STATIC_PREVIEW_RELEASE_NOTE_DECISIONS.NEEDS_MORE_CONTEXT, 'evidenceRefs');
  }

  if (!hasSourceOwners(original)) {
    return block(output, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.NEEDS_SOURCE_OWNER, STATIC_PREVIEW_RELEASE_NOTE_DECISIONS.NEEDS_MORE_CONTEXT, 'sourceOwners');
  }

  if (!original.idempotencyKey) {
    return block(output, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.NEEDS_IDEMPOTENCY_KEY, STATIC_PREVIEW_RELEASE_NOTE_DECISIONS.NEEDS_MORE_CONTEXT, 'idempotencyKey');
  }

  if (original.releaseNotePolicySnapshot.unsafeReleaseNote === true || original.messagingBoundarySnapshot.unsafeLanguage === true) {
    return block(output, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.UNSAFE_RELEASE_NOTE, STATIC_PREVIEW_RELEASE_NOTE_DECISIONS.BLOCK_RELEASE_NOTE, null, 'UNSAFE_RELEASE_NOTE');
  }

  if (original.publicationRequested === true || original.publishesReleaseNote === true || original.publishesStaticPreview === true) {
    return block(output, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.PUBLICATION_NOT_AUTHORIZED, STATIC_PREVIEW_RELEASE_NOTE_DECISIONS.BLOCK_RELEASE_NOTE, null, 'PUBLICATION_NOT_AUTHORIZED');
  }

  if (original.deploymentExecutionRequested === true || original.deploysApp === true) {
    return block(output, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.DEPLOYMENT_EXECUTION_NOT_AUTHORIZED, STATIC_PREVIEW_RELEASE_NOTE_DECISIONS.BLOCK_RELEASE_NOTE, null, 'DEPLOYMENT_EXECUTION_NOT_AUTHORIZED');
  }

  if (original.githubPagesSettingsMutationRequested === true || original.mutatesGitHubPagesSettings === true) {
    return block(output, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.GITHUB_PAGES_SETTINGS_MUTATION_NOT_AUTHORIZED, STATIC_PREVIEW_RELEASE_NOTE_DECISIONS.BLOCK_RELEASE_NOTE, null, 'GITHUB_PAGES_SETTINGS_MUTATION_NOT_AUTHORIZED');
  }

  if (original.publicUrlCreationRequested === true || original.createsPublicUrl === true) {
    return block(output, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.PUBLIC_URL_CREATION_NOT_AUTHORIZED, STATIC_PREVIEW_RELEASE_NOTE_DECISIONS.BLOCK_RELEASE_NOTE, null, 'PUBLIC_URL_CREATION_NOT_AUTHORIZED');
  }

  if (original.publicUrlVerificationRequested === true || original.verifiesPublicUrl === true) {
    return block(output, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.PUBLIC_URL_VERIFICATION_NOT_AUTHORIZED, STATIC_PREVIEW_RELEASE_NOTE_DECISIONS.BLOCK_RELEASE_NOTE, null, 'PUBLIC_URL_VERIFICATION_NOT_AUTHORIZED');
  }

  if (original.networkCallRequested === true || original.performsNetworkCall === true) {
    return block(output, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.NETWORK_CALL_NOT_AUTHORIZED, STATIC_PREVIEW_RELEASE_NOTE_DECISIONS.BLOCK_RELEASE_NOTE, null, 'NETWORK_CALL_NOT_AUTHORIZED');
  }

  if (original.httpRequestRequested === true || original.performsHttpRequest === true) {
    return block(output, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.HTTP_REQUEST_NOT_AUTHORIZED, STATIC_PREVIEW_RELEASE_NOTE_DECISIONS.BLOCK_RELEASE_NOTE, null, 'HTTP_REQUEST_NOT_AUTHORIZED');
  }

  if (original.dnsLookupRequested === true || original.performsDnsLookup === true) {
    return block(output, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.DNS_LOOKUP_NOT_AUTHORIZED, STATIC_PREVIEW_RELEASE_NOTE_DECISIONS.BLOCK_RELEASE_NOTE, null, 'DNS_LOOKUP_NOT_AUTHORIZED');
  }

  if (original.apiCallDetected === true || original.callsApi === true) {
    return block(output, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.API_CALL_DETECTED, STATIC_PREVIEW_RELEASE_NOTE_DECISIONS.BLOCK_RELEASE_NOTE, null, 'API_CALL_DETECTED');
  }

  if (original.trackingDetected === true || original.enablesTracking === true || original.enablesAnalytics === true) {
    return block(output, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.TRACKING_DETECTED, STATIC_PREVIEW_RELEASE_NOTE_DECISIONS.BLOCK_RELEASE_NOTE, null, 'TRACKING_DETECTED');
  }

  if (original.storageWriteDetected === true || original.writesStorage === true) {
    return block(output, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.STORAGE_WRITE_DETECTED, STATIC_PREVIEW_RELEASE_NOTE_DECISIONS.BLOCK_RELEASE_NOTE, null, 'STORAGE_WRITE_DETECTED');
  }

  if (original.formSubmissionDetected === true || original.createsFormSubmission === true) {
    return block(output, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.FORM_SUBMISSION_DETECTED, STATIC_PREVIEW_RELEASE_NOTE_DECISIONS.BLOCK_RELEASE_NOTE, null, 'FORM_SUBMISSION_DETECTED');
  }

  if (original.serviceWorkerDetected === true || original.registersServiceWorker === true) {
    return block(output, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.SERVICE_WORKER_DETECTED, STATIC_PREVIEW_RELEASE_NOTE_DECISIONS.BLOCK_RELEASE_NOTE, null, 'SERVICE_WORKER_DETECTED');
  }

  if (original.crmMutationRequested === true || original.mutatesCrm === true) {
    return block(output, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.CRM_MUTATION_NOT_AUTHORIZED, STATIC_PREVIEW_RELEASE_NOTE_DECISIONS.BLOCK_RELEASE_NOTE, null, 'CRM_MUTATION_NOT_AUTHORIZED');
  }

  if (original.truthCreationRequested === true || original.writesCanonicalTruth === true || original.createsBusinessTruth === true || original.createsMetricTruth === true || original.createsEconomicTruth === true) {
    return block(output, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.TRUTH_CREATION_NOT_AUTHORIZED, STATIC_PREVIEW_RELEASE_NOTE_DECISIONS.BLOCK_RELEASE_NOTE, null, 'TRUTH_CREATION_NOT_AUTHORIZED');
  }

  if (original.actionExecutionRequested === true || original.executesAction === true || original.sendsMessage === true) {
    return block(output, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.ACTION_EXECUTION_NOT_AUTHORIZED, STATIC_PREVIEW_RELEASE_NOTE_DECISIONS.BLOCK_RELEASE_NOTE, null, 'ACTION_EXECUTION_NOT_AUTHORIZED');
  }

  if (isExpired(original)) {
    return block(output, STATIC_PREVIEW_RELEASE_NOTE_STATUSES.EXPIRED_RELEASE_NOTE_WINDOW, STATIC_PREVIEW_RELEASE_NOTE_DECISIONS.EXPIRED, null, 'EXPIRED_RELEASE_NOTE_WINDOW');
  }

  const modules = unique([
    '044B GitHub Pages Static Preview Implementation',
    '045B Static Preview Deployment Boundary',
    '046B Static Preview Public Surface Decision Boundary',
    '047B Public URL Verification Boundary',
  ]);

  output.releaseNoteDraft = [
    'Forge Alive static preview is a safe, read-only visual preview.',
    'Forge Alive static preview uses sample data only and is not production.',
    'Release note is not publication authorization.',
    'GitHub Pages availability is not deployment authorization.',
    'No publish, no deploy, no GitHub Pages settings mutation.',
    'No public URL creation or verification is performed by this release note.',
    'No network call, HTTP request, or DNS lookup is performed.',
    `Closed modules: ${modules.join('; ')}.`,
    `Evidence refs: ${unique(original.evidenceRefs).join(', ')}.`,
    `Next phase: ${output.nextPhase}.`,
  ].join('\n');

  output.releaseNoteEvidence = {
    evidenceOnly: true,
    modules,
    evidenceRefs: unique(original.evidenceRefs),
    sourceEvidenceIds: unique(original.sourceEvidenceIds),
    sourceOwners: unique(original.sourceOwners),
  };

  output.approvedForReleaseNoteDraft = true;
  output.releaseNoteStatus = STATIC_PREVIEW_RELEASE_NOTE_STATUSES.APPROVED_FOR_RELEASE_NOTE_DRAFT;
  output.decision = STATIC_PREVIEW_RELEASE_NOTE_DECISIONS.APPROVE_RELEASE_NOTE_DRAFT;
  output.warnings = unique([...output.warnings, 'Release note is not publication authorization.']);
  output.limitations = unique([...output.limitations, 'Draft only. No public release, deploy, URL verification, or network call.']);
  return output;
}

module.exports = {
  buildStaticPreviewReleaseNoteBoundary,
  STATIC_PREVIEW_RELEASE_NOTE_STATUSES,
  STATIC_PREVIEW_RELEASE_NOTE_DECISIONS,
  STATIC_PREVIEW_RELEASE_NOTE_ALLOWED_USES,
  STATIC_PREVIEW_RELEASE_NOTE_FORBIDDEN_USES,
};
