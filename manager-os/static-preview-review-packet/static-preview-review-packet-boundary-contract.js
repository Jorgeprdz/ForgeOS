/**
 * Static Preview Review Packet Boundary Contract
 *
 * Review packet is not publication authorization.
 * This boundary creates an internal review packet draft from closed module evidence only.
 * It never publishes, deploys, mutates settings, creates/verifies URLs, or calls network.
 */

const STATIC_PREVIEW_REVIEW_PACKET_STATUSES = Object.freeze({
  READY_FOR_REVIEW_PACKET_DRAFT: 'READY_FOR_REVIEW_PACKET_DRAFT',
  APPROVED_FOR_REVIEW_PACKET_DRAFT: 'APPROVED_FOR_REVIEW_PACKET_DRAFT',
  NEEDS_STATIC_PREVIEW_IMPLEMENTATION: 'NEEDS_STATIC_PREVIEW_IMPLEMENTATION',
  NEEDS_PUBLIC_SURFACE_DECISION: 'NEEDS_PUBLIC_SURFACE_DECISION',
  NEEDS_PUBLIC_URL_VERIFICATION: 'NEEDS_PUBLIC_URL_VERIFICATION',
  NEEDS_RELEASE_NOTE: 'NEEDS_RELEASE_NOTE',
  NEEDS_REVIEW_PACKET_POLICY: 'NEEDS_REVIEW_PACKET_POLICY',
  NEEDS_EVIDENCE_BUNDLE: 'NEEDS_EVIDENCE_BUNDLE',
  NEEDS_SOURCE_OWNERSHIP: 'NEEDS_SOURCE_OWNERSHIP',
  NEEDS_VISUAL_REFERENCE: 'NEEDS_VISUAL_REFERENCE',
  NEEDS_SAFETY_CHECKLIST: 'NEEDS_SAFETY_CHECKLIST',
  NEEDS_ROADMAP: 'NEEDS_ROADMAP',
  NEEDS_REVIEWER_PLACEHOLDER: 'NEEDS_REVIEWER_PLACEHOLDER',
  NEEDS_EVIDENCE: 'NEEDS_EVIDENCE',
  NEEDS_SOURCE_OWNER: 'NEEDS_SOURCE_OWNER',
  NEEDS_IDEMPOTENCY_KEY: 'NEEDS_IDEMPOTENCY_KEY',
  UNSAFE_REVIEW_PACKET: 'UNSAFE_REVIEW_PACKET',
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
  EXPIRED_REVIEW_PACKET_WINDOW: 'EXPIRED_REVIEW_PACKET_WINDOW',
  BLOCKED: 'BLOCKED',
  UNKNOWN: 'UNKNOWN',
  NOT_MODELED: 'NOT_MODELED',
});

const STATIC_PREVIEW_REVIEW_PACKET_DECISIONS = Object.freeze({
  REQUEST_REVIEW_PACKET_DRAFT: 'REQUEST_REVIEW_PACKET_DRAFT',
  APPROVE_REVIEW_PACKET_DRAFT: 'APPROVE_REVIEW_PACKET_DRAFT',
  BLOCK_REVIEW_PACKET: 'BLOCK_REVIEW_PACKET',
  NEEDS_MORE_CONTEXT: 'NEEDS_MORE_CONTEXT',
  EXPIRED: 'EXPIRED',
  NOT_MODELED: 'NOT_MODELED',
});

const STATIC_PREVIEW_REVIEW_PACKET_ALLOWED_USES = Object.freeze([
  'STATIC_PREVIEW_REVIEW_PACKET_REVIEW',
  'REVIEW_PACKET_DRAFT_PREP',
  'EVIDENCE_PACKET_REVIEW',
  'SAFETY_PACKET_REVIEW',
  'ROADMAP_PACKET_REVIEW',
]);

const STATIC_PREVIEW_REVIEW_PACKET_FORBIDDEN_USES = Object.freeze([
  'PUBLICATION',
  'REVIEW_PACKET_PUBLICATION',
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
  output.reviewPacketStatus = status;
  output.decision = decision;
  if (signal) output.missingSignals = unique([...output.missingSignals, signal]);
  if (blockedUse) output.blockedUses = unique([...output.blockedUses, blockedUse]);
  return output;
}

function baseOutput(input) {
  return {
    reviewPacketStatus: STATIC_PREVIEW_REVIEW_PACKET_STATUSES.UNKNOWN,
    decision: STATIC_PREVIEW_REVIEW_PACKET_DECISIONS.NEEDS_MORE_CONTEXT,
    reviewPacketRequestId: input.reviewPacketRequestId || null,
    reviewPacketDraft: null,
    reviewPacketEvidence: null,
    reviewChecklist: [],
    approvedForReviewPacketDraft: false,
    publishesReviewPacket: false,
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
    reviewPacketIsNotPublicationAuthorization: true,
    missingSignals: [],
    blockedUses: [],
    allowedUses: [],
    evidenceRefs: unique(input.evidenceRefs),
    sourceEvidenceIds: unique(input.sourceEvidenceIds),
    sourceOwners: unique(input.sourceOwners),
    warnings: unique([
      ...asArray(input.warnings),
      ...asArray(input.reviewPacketPolicySnapshot?.warnings),
      ...asArray(input.safetyChecklistSnapshot?.warnings),
      ...asArray(input.releaseNoteSnapshot?.warnings),
    ]),
    limitations: unique([
      ...asArray(input.limitations),
      ...asArray(input.reviewPacketPolicySnapshot?.limitations),
      ...asArray(input.safetyChecklistSnapshot?.limitations),
      ...asArray(input.releaseNoteSnapshot?.limitations),
    ]),
    nextPhase: input.nextPhase || '050A_FORGE_ALIVE_STATIC_PREVIEW_MILESTONE_CLOSURE_SCOPE',
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

function hasReleaseNote(snapshot) {
  return reviewed(snapshot)
    && snapshot.approvedForReleaseNoteDraft === true
    && snapshot.releaseNoteDraftOnly === true
    && snapshot.publishesReleaseNote !== true;
}

function hasReviewPacketPolicy(snapshot) {
  return reviewed(snapshot)
    && snapshot.reviewPacketDraftOnly === true
    && snapshot.publicationAllowed !== true
    && snapshot.requiresSafetyChecklist === true;
}

function hasEvidenceBundle(snapshot) {
  return reviewed(snapshot) && snapshot.complete === true;
}

function hasSourceOwnership(snapshot) {
  return reviewed(snapshot) && snapshot.sourceOwned === true;
}

function hasVisualReference(snapshot) {
  return reviewed(snapshot) && Boolean(snapshot.visualReferenceId || snapshot.visualReferenceName);
}

function hasSafetyChecklist(snapshot) {
  return reviewed(snapshot)
    && snapshot.noPublish === true
    && snapshot.noDeploy === true
    && snapshot.noNetwork === true
    && snapshot.noPublicUrlCreation === true
    && snapshot.noPublicUrlVerification === true;
}

function hasRoadmap(snapshot) {
  return reviewed(snapshot) && Boolean(snapshot.nextPhase);
}

function hasReviewerPlaceholder(snapshot) {
  return reviewed(snapshot) && snapshot.reviewerDecisionPlaceholderVisible === true;
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

function buildStaticPreviewReviewPacketBoundary(input = {}) {
  const original = clone(input) || {};
  const output = baseOutput(original);
  const requestedUse = norm(original.requestedUse);

  if (requestedUse && STATIC_PREVIEW_REVIEW_PACKET_FORBIDDEN_USES.includes(requestedUse)) {
    return block(output, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.BLOCKED, STATIC_PREVIEW_REVIEW_PACKET_DECISIONS.BLOCK_REVIEW_PACKET, null, requestedUse);
  }

  if (requestedUse && !STATIC_PREVIEW_REVIEW_PACKET_ALLOWED_USES.includes(requestedUse)) {
    output.blockedUses = unique([requestedUse]);
    output.reviewPacketStatus = STATIC_PREVIEW_REVIEW_PACKET_STATUSES.NOT_MODELED;
    output.decision = STATIC_PREVIEW_REVIEW_PACKET_DECISIONS.NOT_MODELED;
    return output;
  }

  if (requestedUse) output.allowedUses = unique([requestedUse]);

  if (!hasStaticPreviewImplementation(original.staticPreviewImplementationSnapshot)) {
    return block(output, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.NEEDS_STATIC_PREVIEW_IMPLEMENTATION, STATIC_PREVIEW_REVIEW_PACKET_DECISIONS.NEEDS_MORE_CONTEXT, 'staticPreviewImplementationSnapshot');
  }

  if (!hasPublicSurfaceDecision(original.publicSurfaceDecisionSnapshot)) {
    return block(output, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.NEEDS_PUBLIC_SURFACE_DECISION, STATIC_PREVIEW_REVIEW_PACKET_DECISIONS.NEEDS_MORE_CONTEXT, 'publicSurfaceDecisionSnapshot');
  }

  if (!hasPublicUrlVerification(original.publicUrlVerificationSnapshot)) {
    return block(output, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.NEEDS_PUBLIC_URL_VERIFICATION, STATIC_PREVIEW_REVIEW_PACKET_DECISIONS.NEEDS_MORE_CONTEXT, 'publicUrlVerificationSnapshot');
  }

  if (!hasReleaseNote(original.releaseNoteSnapshot)) {
    return block(output, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.NEEDS_RELEASE_NOTE, STATIC_PREVIEW_REVIEW_PACKET_DECISIONS.NEEDS_MORE_CONTEXT, 'releaseNoteSnapshot');
  }

  if (!hasReviewPacketPolicy(original.reviewPacketPolicySnapshot)) {
    return block(output, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.NEEDS_REVIEW_PACKET_POLICY, STATIC_PREVIEW_REVIEW_PACKET_DECISIONS.NEEDS_MORE_CONTEXT, 'reviewPacketPolicySnapshot');
  }

  if (!hasEvidenceBundle(original.evidenceBundleSnapshot)) {
    return block(output, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.NEEDS_EVIDENCE_BUNDLE, STATIC_PREVIEW_REVIEW_PACKET_DECISIONS.NEEDS_MORE_CONTEXT, 'evidenceBundleSnapshot');
  }

  if (!hasSourceOwnership(original.sourceOwnershipSnapshot)) {
    return block(output, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.NEEDS_SOURCE_OWNERSHIP, STATIC_PREVIEW_REVIEW_PACKET_DECISIONS.NEEDS_MORE_CONTEXT, 'sourceOwnershipSnapshot');
  }

  if (!hasVisualReference(original.visualReferenceSnapshot)) {
    return block(output, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.NEEDS_VISUAL_REFERENCE, STATIC_PREVIEW_REVIEW_PACKET_DECISIONS.NEEDS_MORE_CONTEXT, 'visualReferenceSnapshot');
  }

  if (!hasSafetyChecklist(original.safetyChecklistSnapshot)) {
    return block(output, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.NEEDS_SAFETY_CHECKLIST, STATIC_PREVIEW_REVIEW_PACKET_DECISIONS.NEEDS_MORE_CONTEXT, 'safetyChecklistSnapshot');
  }

  if (!hasRoadmap(original.roadmapSnapshot)) {
    return block(output, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.NEEDS_ROADMAP, STATIC_PREVIEW_REVIEW_PACKET_DECISIONS.NEEDS_MORE_CONTEXT, 'roadmapSnapshot');
  }

  if (!hasReviewerPlaceholder(original.reviewerPlaceholderSnapshot)) {
    return block(output, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.NEEDS_REVIEWER_PLACEHOLDER, STATIC_PREVIEW_REVIEW_PACKET_DECISIONS.NEEDS_MORE_CONTEXT, 'reviewerPlaceholderSnapshot');
  }

  if (!hasEvidence(original)) {
    return block(output, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.NEEDS_EVIDENCE, STATIC_PREVIEW_REVIEW_PACKET_DECISIONS.NEEDS_MORE_CONTEXT, 'evidenceRefs');
  }

  if (!hasSourceOwners(original)) {
    return block(output, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.NEEDS_SOURCE_OWNER, STATIC_PREVIEW_REVIEW_PACKET_DECISIONS.NEEDS_MORE_CONTEXT, 'sourceOwners');
  }

  if (!original.idempotencyKey) {
    return block(output, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.NEEDS_IDEMPOTENCY_KEY, STATIC_PREVIEW_REVIEW_PACKET_DECISIONS.NEEDS_MORE_CONTEXT, 'idempotencyKey');
  }

  if (original.reviewPacketPolicySnapshot.unsafeReviewPacket === true || original.safetyChecklistSnapshot.unsafeChecklist === true) {
    return block(output, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.UNSAFE_REVIEW_PACKET, STATIC_PREVIEW_REVIEW_PACKET_DECISIONS.BLOCK_REVIEW_PACKET, null, 'UNSAFE_REVIEW_PACKET');
  }

  if (original.publicationRequested === true || original.publishesReviewPacket === true || original.publishesReleaseNote === true || original.publishesStaticPreview === true) {
    return block(output, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.PUBLICATION_NOT_AUTHORIZED, STATIC_PREVIEW_REVIEW_PACKET_DECISIONS.BLOCK_REVIEW_PACKET, null, 'PUBLICATION_NOT_AUTHORIZED');
  }

  if (original.deploymentExecutionRequested === true || original.deploysApp === true) {
    return block(output, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.DEPLOYMENT_EXECUTION_NOT_AUTHORIZED, STATIC_PREVIEW_REVIEW_PACKET_DECISIONS.BLOCK_REVIEW_PACKET, null, 'DEPLOYMENT_EXECUTION_NOT_AUTHORIZED');
  }

  if (original.githubPagesSettingsMutationRequested === true || original.mutatesGitHubPagesSettings === true) {
    return block(output, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.GITHUB_PAGES_SETTINGS_MUTATION_NOT_AUTHORIZED, STATIC_PREVIEW_REVIEW_PACKET_DECISIONS.BLOCK_REVIEW_PACKET, null, 'GITHUB_PAGES_SETTINGS_MUTATION_NOT_AUTHORIZED');
  }

  if (original.publicUrlCreationRequested === true || original.createsPublicUrl === true) {
    return block(output, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.PUBLIC_URL_CREATION_NOT_AUTHORIZED, STATIC_PREVIEW_REVIEW_PACKET_DECISIONS.BLOCK_REVIEW_PACKET, null, 'PUBLIC_URL_CREATION_NOT_AUTHORIZED');
  }

  if (original.publicUrlVerificationRequested === true || original.verifiesPublicUrl === true) {
    return block(output, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.PUBLIC_URL_VERIFICATION_NOT_AUTHORIZED, STATIC_PREVIEW_REVIEW_PACKET_DECISIONS.BLOCK_REVIEW_PACKET, null, 'PUBLIC_URL_VERIFICATION_NOT_AUTHORIZED');
  }

  if (original.networkCallRequested === true || original.performsNetworkCall === true) {
    return block(output, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.NETWORK_CALL_NOT_AUTHORIZED, STATIC_PREVIEW_REVIEW_PACKET_DECISIONS.BLOCK_REVIEW_PACKET, null, 'NETWORK_CALL_NOT_AUTHORIZED');
  }

  if (original.httpRequestRequested === true || original.performsHttpRequest === true) {
    return block(output, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.HTTP_REQUEST_NOT_AUTHORIZED, STATIC_PREVIEW_REVIEW_PACKET_DECISIONS.BLOCK_REVIEW_PACKET, null, 'HTTP_REQUEST_NOT_AUTHORIZED');
  }

  if (original.dnsLookupRequested === true || original.performsDnsLookup === true) {
    return block(output, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.DNS_LOOKUP_NOT_AUTHORIZED, STATIC_PREVIEW_REVIEW_PACKET_DECISIONS.BLOCK_REVIEW_PACKET, null, 'DNS_LOOKUP_NOT_AUTHORIZED');
  }

  if (original.apiCallDetected === true || original.callsApi === true) {
    return block(output, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.API_CALL_DETECTED, STATIC_PREVIEW_REVIEW_PACKET_DECISIONS.BLOCK_REVIEW_PACKET, null, 'API_CALL_DETECTED');
  }

  if (original.trackingDetected === true || original.enablesTracking === true || original.enablesAnalytics === true) {
    return block(output, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.TRACKING_DETECTED, STATIC_PREVIEW_REVIEW_PACKET_DECISIONS.BLOCK_REVIEW_PACKET, null, 'TRACKING_DETECTED');
  }

  if (original.storageWriteDetected === true || original.writesStorage === true) {
    return block(output, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.STORAGE_WRITE_DETECTED, STATIC_PREVIEW_REVIEW_PACKET_DECISIONS.BLOCK_REVIEW_PACKET, null, 'STORAGE_WRITE_DETECTED');
  }

  if (original.formSubmissionDetected === true || original.createsFormSubmission === true) {
    return block(output, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.FORM_SUBMISSION_DETECTED, STATIC_PREVIEW_REVIEW_PACKET_DECISIONS.BLOCK_REVIEW_PACKET, null, 'FORM_SUBMISSION_DETECTED');
  }

  if (original.serviceWorkerDetected === true || original.registersServiceWorker === true) {
    return block(output, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.SERVICE_WORKER_DETECTED, STATIC_PREVIEW_REVIEW_PACKET_DECISIONS.BLOCK_REVIEW_PACKET, null, 'SERVICE_WORKER_DETECTED');
  }

  if (original.crmMutationRequested === true || original.mutatesCrm === true) {
    return block(output, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.CRM_MUTATION_NOT_AUTHORIZED, STATIC_PREVIEW_REVIEW_PACKET_DECISIONS.BLOCK_REVIEW_PACKET, null, 'CRM_MUTATION_NOT_AUTHORIZED');
  }

  if (original.truthCreationRequested === true || original.writesCanonicalTruth === true || original.createsBusinessTruth === true || original.createsMetricTruth === true || original.createsEconomicTruth === true) {
    return block(output, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.TRUTH_CREATION_NOT_AUTHORIZED, STATIC_PREVIEW_REVIEW_PACKET_DECISIONS.BLOCK_REVIEW_PACKET, null, 'TRUTH_CREATION_NOT_AUTHORIZED');
  }

  if (original.actionExecutionRequested === true || original.executesAction === true || original.sendsMessage === true) {
    return block(output, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.ACTION_EXECUTION_NOT_AUTHORIZED, STATIC_PREVIEW_REVIEW_PACKET_DECISIONS.BLOCK_REVIEW_PACKET, null, 'ACTION_EXECUTION_NOT_AUTHORIZED');
  }

  if (isExpired(original)) {
    return block(output, STATIC_PREVIEW_REVIEW_PACKET_STATUSES.EXPIRED_REVIEW_PACKET_WINDOW, STATIC_PREVIEW_REVIEW_PACKET_DECISIONS.EXPIRED, null, 'EXPIRED_REVIEW_PACKET_WINDOW');
  }

  const closedModules = unique([
    '044B GitHub Pages Static Preview Implementation',
    '045B Static Preview Deployment Boundary',
    '046B Static Preview Public Surface Decision Boundary',
    '047B Public URL Verification Boundary',
    '048B Static Preview Release Note Boundary',
  ]);

  output.reviewChecklist = [
    'Sample data only confirmed',
    'Read-only preview confirmed',
    'Not production label confirmed',
    'No publish confirmed',
    'No deploy confirmed',
    'No GitHub Pages settings mutation confirmed',
    'No public URL creation or verification confirmed',
    'No network call / HTTP request / DNS lookup confirmed',
  ];

  output.reviewPacketDraft = [
    'Static Preview Review Packet for Forge Alive.',
    'Review packet is not publication authorization.',
    'Internal review only. No publish, no deploy, and no GitHub Pages settings mutation.',
    'No public URL creation or verification. No network call, HTTP request, or DNS lookup.',
    'Preview warning: sample data only, read-only, not production.',
    `Closed modules: ${closedModules.join('; ')}.`,
    `Release note draft: ${original.releaseNoteSnapshot.releaseNoteDraft || 'Release note draft available.'}`,
    `Safety checklist: ${output.reviewChecklist.join('; ')}.`,
    `Evidence refs: ${unique(original.evidenceRefs).join(', ')}.`,
    `Next phase: ${output.nextPhase}.`,
  ].join('\n');

  output.reviewPacketEvidence = {
    evidenceOnly: true,
    closedModules,
    releaseNoteIncluded: true,
    safetyChecklistIncluded: true,
    visualReferenceIncluded: true,
    evidenceRefs: unique(original.evidenceRefs),
    sourceEvidenceIds: unique(original.sourceEvidenceIds),
    sourceOwners: unique(original.sourceOwners),
  };

  output.approvedForReviewPacketDraft = true;
  output.reviewPacketStatus = STATIC_PREVIEW_REVIEW_PACKET_STATUSES.APPROVED_FOR_REVIEW_PACKET_DRAFT;
  output.decision = STATIC_PREVIEW_REVIEW_PACKET_DECISIONS.APPROVE_REVIEW_PACKET_DRAFT;
  output.warnings = unique([...output.warnings, 'Review packet is not publication authorization.']);
  output.limitations = unique([...output.limitations, 'Draft only. No public release, deploy, URL verification, or network call.']);
  return output;
}

module.exports = {
  buildStaticPreviewReviewPacketBoundary,
  STATIC_PREVIEW_REVIEW_PACKET_STATUSES,
  STATIC_PREVIEW_REVIEW_PACKET_DECISIONS,
  STATIC_PREVIEW_REVIEW_PACKET_ALLOWED_USES,
  STATIC_PREVIEW_REVIEW_PACKET_FORBIDDEN_USES,
};
