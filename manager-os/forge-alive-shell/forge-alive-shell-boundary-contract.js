/**
 * Forge Alive Shell Boundary Contract
 * Forge Alive Shell candidate is not a live app.
 * GitHub Pages availability is not deployment authorization.
 */
const FORGE_ALIVE_SHELL_STATUSES = Object.freeze({
  READY_FOR_FORGE_ALIVE_SHELL_REVIEW:'READY_FOR_FORGE_ALIVE_SHELL_REVIEW',
  APPROVED_FOR_FORGE_ALIVE_SHELL_CANDIDATE:'APPROVED_FOR_FORGE_ALIVE_SHELL_CANDIDATE',
  NEEDS_UI_RENDERING_BOUNDARY:'NEEDS_UI_RENDERING_BOUNDARY',
  NEEDS_RENDER_MODEL_CANDIDATE:'NEEDS_RENDER_MODEL_CANDIDATE',
  NEEDS_LAYOUT_POLICY:'NEEDS_LAYOUT_POLICY',
  NEEDS_SHELL_SAFETY_POLICY:'NEEDS_SHELL_SAFETY_POLICY',
  NEEDS_STATIC_HOSTING_POLICY:'NEEDS_STATIC_HOSTING_POLICY',
  NEEDS_GITHUB_PAGES_REVIEW:'NEEDS_GITHUB_PAGES_REVIEW',
  NEEDS_PRIVACY_POLICY:'NEEDS_PRIVACY_POLICY',
  NEEDS_VIEWER_ROLE:'NEEDS_VIEWER_ROLE',
  NEEDS_SOURCE_EVIDENCE:'NEEDS_SOURCE_EVIDENCE',
  NEEDS_SOURCE_OWNER:'NEEDS_SOURCE_OWNER',
  NEEDS_SOURCE_FRESHNESS:'NEEDS_SOURCE_FRESHNESS',
  STALE_SOURCE_FRESHNESS:'STALE_SOURCE_FRESHNESS',
  NEEDS_IDEMPOTENCY_KEY:'NEEDS_IDEMPOTENCY_KEY',
  NEEDS_AUDIT_TRAIL:'NEEDS_AUDIT_TRAIL',
  UNSUPPORTED_VIEWER_ROLE:'UNSUPPORTED_VIEWER_ROLE',
  UNSUPPORTED_SHELL_SECTION:'UNSUPPORTED_SHELL_SECTION',
  GITHUB_PAGES_DEPLOY_NOT_AUTHORIZED:'GITHUB_PAGES_DEPLOY_NOT_AUTHORIZED',
  LIVE_APP_NOT_AUTHORIZED:'LIVE_APP_NOT_AUTHORIZED',
  EXPIRED_FORGE_ALIVE_SHELL_WINDOW:'EXPIRED_FORGE_ALIVE_SHELL_WINDOW',
  BLOCKED:'BLOCKED',
  UNKNOWN:'UNKNOWN',
  NOT_MODELED:'NOT_MODELED',
});

const FORGE_ALIVE_SHELL_DECISIONS = Object.freeze({
  REQUEST_FORGE_ALIVE_SHELL_REVIEW:'REQUEST_FORGE_ALIVE_SHELL_REVIEW',
  APPROVE_FORGE_ALIVE_SHELL_CANDIDATE:'APPROVE_FORGE_ALIVE_SHELL_CANDIDATE',
  BLOCK_FORGE_ALIVE_SHELL:'BLOCK_FORGE_ALIVE_SHELL',
  NEEDS_MORE_CONTEXT:'NEEDS_MORE_CONTEXT',
  EXPIRED:'EXPIRED',
  NOT_MODELED:'NOT_MODELED',
});

const FORGE_ALIVE_SHELL_ALLOWED_USES = Object.freeze([
  'FORGE_ALIVE_SHELL_REVIEW',
  'FORGE_ALIVE_SHELL_CANDIDATE_PREP',
  'READ_ONLY_SHELL_PREP',
  'STATIC_PREVIEW_CANDIDATE_PREP',
  'SIGNAL_CARD_LAYOUT_PREP',
  'SOURCE_TRACE_PANEL_PREP',
  'WARNING_LIMITATION_PANEL_PREP',
]);

const FORGE_ALIVE_SHELL_FORBIDDEN_USES = Object.freeze([
  'UI_RENDERING',
  'LIVE_APP_EXECUTION',
  'GITHUB_PAGES_DEPLOY',
  'APP_DEPLOYMENT',
  'ROUTE_CREATION',
  'COMPONENT_EXECUTION',
  'INTERACTIVE_ACTION',
  'AUTHENTICATION',
  'ANALYTICS_TRACKING',
  'PERSISTENCE_WRITE',
  'CANONICAL_TRUTH_WRITE',
  'BUSINESS_TRUTH_CREATION',
  'METRIC_TRUTH_CREATION',
  'ECONOMIC_TRUTH_CREATION',
  'DELIVERY_TRUTH_CREATION',
  'MESSAGE_TRUTH_CREATION',
  'COMPENSATION_TRUTH',
  'PAYOUT_TRUTH',
  'REVENUE_TRUTH',
  'HUMAN_RANKING',
  'HR_DECISION',
  'PROMOTION_DECISION',
  'TERMINATION',
  'ADVISOR_LIFECYCLE_TRUTH',
  'PERSONALITY_TRUTH',
  'TASK_CREATION',
  'CALENDAR_CREATION',
  'CRM_MUTATION',
  'PROVIDER_API_CALL',
  'EXTERNAL_API_CALL',
  'SEND_MESSAGE',
  'ACTION_EXECUTION',
  'MANIPULATION',
  'SURVEILLANCE',
]);

const SUPPORTED_VIEWER_ROLES = Object.freeze(['ADVISOR','MANAGER','PARTNER','DIRECTOR']);
const SUPPORTED_SHELL_SECTIONS = Object.freeze([
  'SIGNAL_INBOX',
  'REASON_WHY_PANEL',
  'WARNING_LIMITATION_PANEL',
  'SOURCE_TRACE_PANEL',
  'REVIEW_QUEUE',
  'BLOCKED_SURFACES_PANEL',
  'NEXT_REVIEW_ACTION_PANEL',
  'SYSTEM_HEALTH_STRIP',
]);

function clone(value){ return value === undefined ? undefined : JSON.parse(JSON.stringify(value)); }
function asArray(value){ if(!value) return []; return Array.isArray(value) ? value : [value]; }
function unique(values){ return [...new Set(asArray(values).filter((v)=>v !== undefined && v !== null && v !== ''))]; }
function norm(value){ return typeof value === 'string' ? value.trim().toUpperCase() : undefined; }
function hasObject(value){ return Boolean(value && typeof value === 'object'); }
function hasUiSnapshot(value){ return hasObject(value) && value.eligibleForReadOnlyRenderModel === true; }
function goodPolicy(snapshot, forbiddenFlags){
  if(!hasObject(snapshot)) return false;
  if(snapshot.reviewed !== true && snapshot.policyReviewed !== true) return false;
  if(snapshot.allowed === false) return false;
  return !forbiddenFlags.some((flag)=>snapshot[flag] === true);
}
function ghRequested(input){
  return input.githubPagesRequested === true ||
    input.staticPreviewRequested === true ||
    input.staticHostingPolicySnapshot?.githubPagesRequested === true ||
    input.staticHostingPolicySnapshot?.surface === 'GITHUB_PAGES';
}
function goodGhReview(snapshot){
  if(!hasObject(snapshot)) return false;
  if(snapshot.reviewed !== true && snapshot.hostingReviewed !== true) return false;
  if(snapshot.available !== true) return false;
  if(snapshot.deploymentAuthorized === true || snapshot.publishAllowed === true) return false;
  return true;
}
function collectEvidence(sourceEvidence){
  const evidenceRefs=[]; const sourceEvidenceIds=[]; const sourceOwners=[];
  for(const item of asArray(sourceEvidence)){
    if(!hasObject(item)) continue;
    evidenceRefs.push(item.evidenceRef,item.ref,item.id,item.sourceEvidenceId,item.evidenceId);
    sourceEvidenceIds.push(item.sourceEvidenceId,item.evidenceId,item.id);
    sourceOwners.push(item.sourceOwner,item.owner);
  }
  return { evidenceRefs: unique(evidenceRefs), sourceEvidenceIds: unique(sourceEvidenceIds), sourceOwners: unique(sourceOwners) };
}
function fresh(sourceFreshness){
  if(!hasObject(sourceFreshness)) return false;
  if(sourceFreshness.stale === true || sourceFreshness.fresh === false) return false;
  if(sourceFreshness.status && norm(sourceFreshness.status) !== 'FRESH') return false;
  return sourceFreshness.fresh === true || norm(sourceFreshness.status) === 'FRESH' || Boolean(sourceFreshness.asOf);
}
function stale(sourceFreshness){
  return hasObject(sourceFreshness) && (sourceFreshness.stale === true || sourceFreshness.fresh === false || norm(sourceFreshness.status) === 'STALE');
}
function hasAuditTrail(snapshot){
  if(!hasObject(snapshot)) return false;
  return Boolean(snapshot.auditTrailId || snapshot.auditId || asArray(snapshot.entries || snapshot.events).length > 0);
}
function expired(expiresAt, nowValue){
  if(!expiresAt) return false;
  const expiry = new Date(expiresAt);
  const now = nowValue ? new Date(nowValue) : new Date();
  return !Number.isNaN(expiry.getTime()) && expiry.getTime() <= now.getTime();
}
function baseOutput(input, evidence){
  return {
    forgeAliveShellStatus:FORGE_ALIVE_SHELL_STATUSES.UNKNOWN,
    decision:FORGE_ALIVE_SHELL_DECISIONS.NEEDS_MORE_CONTEXT,
    forgeAliveShellRequestId: input.forgeAliveShellRequestId || null,
    uiRenderingRequestId: input.uiRenderingRequestId || input.uiRenderingSnapshot?.uiRenderingRequestId || null,
    viewerId: input.viewerId || null,
    viewerRole: input.viewerRole || null,
    forgeAliveShellCandidate:null,
    shellSections:[],
    visibleCards:[],
    visibleStatuses:[],
    visibleReasonsWhy:[],
    visibleWarnings: unique([...(asArray(input.visibleWarnings)), ...(asArray(input.warnings)), ...(asArray(input.uiRenderingSnapshot?.warnings))]),
    visibleLimitations: unique([...(asArray(input.visibleLimitations)), ...(asArray(input.limitations)), ...(asArray(input.uiRenderingSnapshot?.limitations))]),
    visibleSourceTrace:[],
    visibleNextReviewActions:[],
    allowedStaticPreviewCandidate:false,
    eligibleForForgeAliveShellCandidate:false,
    approvedForUiRendering:false,
    rendersUi:false,
    deploysApp:false,
    publishesGitHubPages:false,
    createsRoute:false,
    executesComponent:false,
    enablesInteractiveAction:false,
    authenticationAllowed:false,
    analyticsTrackingAllowed:false,
    persistsState:false,
    writesCanonicalTruth:false,
    createsBusinessTruth:false,
    createsMetricTruth:false,
    createsEconomicTruth:false,
    createsDeliveryTruth:false,
    createsMessageTruth:false,
    createsCompensationTruth:false,
    createsPayoutTruth:false,
    createsRevenueTruth:false,
    createsRankingTruth:false,
    createsPunishmentTruth:false,
    createsHrTruth:false,
    createsPromotionTruth:false,
    createsAdvisorLifecycleTruth:false,
    createsPersonalityTruth:false,
    createsTask:false,
    createsCalendarEvent:false,
    mutatesCrm:false,
    callsProviderApi:false,
    callsExternalApi:false,
    executesAction:false,
    sendsMessage:false,
    metricEconomicTruthRemainsSeparate:true,
    githubPagesAvailabilityPreservedAsInfrastructureNoteOnly:false,
    blockedUses:[],
    allowedUses:[],
    missingSignals:[],
    unknownSignals:[],
    warnings: unique([...(asArray(input.warnings)), ...(asArray(input.uiRenderingSnapshot?.warnings))]),
    limitations: unique([...(asArray(input.limitations)), ...(asArray(input.uiRenderingSnapshot?.limitations))]),
    evidenceRefs:evidence.evidenceRefs,
    sourceEvidenceIds:evidence.sourceEvidenceIds,
    sourceOwners:evidence.sourceOwners,
  };
}
function block(output, status, decision, signal, blockedUse){
  output.forgeAliveShellStatus=status;
  output.decision=decision;
  if(signal) output.missingSignals=unique([...output.missingSignals, signal]);
  if(blockedUse) output.blockedUses=unique([...output.blockedUses, blockedUse]);
  return output;
}

function buildForgeAliveShellBoundary(input = {}){
  const original = clone(input) || {};
  const evidence = collectEvidence(original.sourceEvidence);
  const output = baseOutput(original, evidence);
  const requestedUse = norm(original.requestedUse);

  if(requestedUse && FORGE_ALIVE_SHELL_FORBIDDEN_USES.includes(requestedUse)){
    return block(output, FORGE_ALIVE_SHELL_STATUSES.BLOCKED, FORGE_ALIVE_SHELL_DECISIONS.BLOCK_FORGE_ALIVE_SHELL, null, requestedUse);
  }
  if(requestedUse && !FORGE_ALIVE_SHELL_ALLOWED_USES.includes(requestedUse)){
    output.blockedUses = unique([requestedUse]);
    output.forgeAliveShellStatus = FORGE_ALIVE_SHELL_STATUSES.NOT_MODELED;
    output.decision = FORGE_ALIVE_SHELL_DECISIONS.NOT_MODELED;
    return output;
  }
  if(requestedUse) output.allowedUses = unique([requestedUse]);

  const uiSnapshot = original.uiRenderingSnapshot;
  if(!hasUiSnapshot(uiSnapshot)) return block(output, FORGE_ALIVE_SHELL_STATUSES.NEEDS_UI_RENDERING_BOUNDARY, FORGE_ALIVE_SHELL_DECISIONS.NEEDS_MORE_CONTEXT, 'uiRenderingSnapshot');

  const renderCandidate = original.forgeAliveRenderModelCandidate || uiSnapshot.forgeAliveRenderModelCandidate;
  if(!hasObject(renderCandidate)) return block(output, FORGE_ALIVE_SHELL_STATUSES.NEEDS_RENDER_MODEL_CANDIDATE, FORGE_ALIVE_SHELL_DECISIONS.NEEDS_MORE_CONTEXT, 'forgeAliveRenderModelCandidate');

  if(!goodPolicy(original.layoutPolicySnapshot, ['rendersUi','createsRoute','executesComponent'])) return block(output, FORGE_ALIVE_SHELL_STATUSES.NEEDS_LAYOUT_POLICY, FORGE_ALIVE_SHELL_DECISIONS.NEEDS_MORE_CONTEXT, 'layoutPolicySnapshot');
  if(!goodPolicy(original.shellSafetyPolicySnapshot, ['enablesInteractiveAction','executesAction','sendsMessage','manipulationAllowed'])) return block(output, FORGE_ALIVE_SHELL_STATUSES.NEEDS_SHELL_SAFETY_POLICY, FORGE_ALIVE_SHELL_DECISIONS.NEEDS_MORE_CONTEXT, 'shellSafetyPolicySnapshot');
  if(!goodPolicy(original.staticHostingPolicySnapshot, ['deploysApp','publishesGitHubPages','callsExternalApi','analyticsTrackingAllowed'])) return block(output, FORGE_ALIVE_SHELL_STATUSES.NEEDS_STATIC_HOSTING_POLICY, FORGE_ALIVE_SHELL_DECISIONS.NEEDS_MORE_CONTEXT, 'staticHostingPolicySnapshot');
  if(ghRequested(original) && !goodGhReview(original.githubPagesAvailabilitySnapshot)) return block(output, FORGE_ALIVE_SHELL_STATUSES.NEEDS_GITHUB_PAGES_REVIEW, FORGE_ALIVE_SHELL_DECISIONS.NEEDS_MORE_CONTEXT, 'githubPagesAvailabilitySnapshot');
  if(!goodPolicy(original.privacyPolicySnapshot, ['surveillanceAllowed','exposesRestrictedData','personalityTruthAllowed','analyticsTrackingAllowed'])) return block(output, FORGE_ALIVE_SHELL_STATUSES.NEEDS_PRIVACY_POLICY, FORGE_ALIVE_SHELL_DECISIONS.NEEDS_MORE_CONTEXT, 'privacyPolicySnapshot');

  const viewerRole = norm(original.viewerRole);
  if(!viewerRole) return block(output, FORGE_ALIVE_SHELL_STATUSES.NEEDS_VIEWER_ROLE, FORGE_ALIVE_SHELL_DECISIONS.NEEDS_MORE_CONTEXT, 'viewerRole');
  if(!SUPPORTED_VIEWER_ROLES.includes(viewerRole)){
    output.viewerRole = viewerRole;
    return block(output, FORGE_ALIVE_SHELL_STATUSES.UNSUPPORTED_VIEWER_ROLE, FORGE_ALIVE_SHELL_DECISIONS.NOT_MODELED, null, 'UNSUPPORTED_VIEWER_ROLE');
  }

  if(asArray(original.sourceEvidence).length === 0) return block(output, FORGE_ALIVE_SHELL_STATUSES.NEEDS_SOURCE_EVIDENCE, FORGE_ALIVE_SHELL_DECISIONS.NEEDS_MORE_CONTEXT, 'sourceEvidence');
  if(evidence.sourceOwners.length === 0) return block(output, FORGE_ALIVE_SHELL_STATUSES.NEEDS_SOURCE_OWNER, FORGE_ALIVE_SHELL_DECISIONS.NEEDS_MORE_CONTEXT, 'sourceOwner');
  if(stale(original.sourceFreshness)) return block(output, FORGE_ALIVE_SHELL_STATUSES.STALE_SOURCE_FRESHNESS, FORGE_ALIVE_SHELL_DECISIONS.NEEDS_MORE_CONTEXT, 'sourceFreshness');
  if(!fresh(original.sourceFreshness)) return block(output, FORGE_ALIVE_SHELL_STATUSES.NEEDS_SOURCE_FRESHNESS, FORGE_ALIVE_SHELL_DECISIONS.NEEDS_MORE_CONTEXT, 'sourceFreshness');

  const idempotencyKey = original.idempotencyKey || renderCandidate.idempotencyKey;
  if(!idempotencyKey) return block(output, FORGE_ALIVE_SHELL_STATUSES.NEEDS_IDEMPOTENCY_KEY, FORGE_ALIVE_SHELL_DECISIONS.NEEDS_MORE_CONTEXT, 'idempotencyKey');
  if(!hasAuditTrail(original.auditTrail)) return block(output, FORGE_ALIVE_SHELL_STATUSES.NEEDS_AUDIT_TRAIL, FORGE_ALIVE_SHELL_DECISIONS.NEEDS_MORE_CONTEXT, 'auditTrail');

  const requestedSections = asArray(original.shellSections && original.shellSections.length ? original.shellSections : SUPPORTED_SHELL_SECTIONS).map(norm).filter(Boolean);
  if(requestedSections.some((section)=>!SUPPORTED_SHELL_SECTIONS.includes(section))){
    return block(output, FORGE_ALIVE_SHELL_STATUSES.UNSUPPORTED_SHELL_SECTION, FORGE_ALIVE_SHELL_DECISIONS.NOT_MODELED, null, 'UNSUPPORTED_SHELL_SECTION');
  }

  if(original.githubPagesDeployRequested === true || original.publishesGitHubPages === true || original.staticHostingPolicySnapshot?.publishesGitHubPages === true){
    return block(output, FORGE_ALIVE_SHELL_STATUSES.GITHUB_PAGES_DEPLOY_NOT_AUTHORIZED, FORGE_ALIVE_SHELL_DECISIONS.BLOCK_FORGE_ALIVE_SHELL, null, 'GITHUB_PAGES_DEPLOY_NOT_AUTHORIZED');
  }
  if(original.liveAppRequested === true || original.deploysApp === true || original.staticHostingPolicySnapshot?.deploysApp === true){
    return block(output, FORGE_ALIVE_SHELL_STATUSES.LIVE_APP_NOT_AUTHORIZED, FORGE_ALIVE_SHELL_DECISIONS.BLOCK_FORGE_ALIVE_SHELL, null, 'LIVE_APP_NOT_AUTHORIZED');
  }
  if(expired(original.expiresAt || original.forgeAliveShellWindowExpiresAt, original.now)){
    return block(output, FORGE_ALIVE_SHELL_STATUSES.EXPIRED_FORGE_ALIVE_SHELL_WINDOW, FORGE_ALIVE_SHELL_DECISIONS.EXPIRED, null, 'EXPIRED_FORGE_ALIVE_SHELL_WINDOW');
  }

  const sourceTrace = asArray(original.sourceTraceCards).length ? asArray(original.sourceTraceCards) : [{
    type:'SOURCE_TRACE_CARD',
    readOnly:true,
    sourceEvidenceIds:evidence.sourceEvidenceIds,
    sourceOwners:evidence.sourceOwners,
  }];
  const visibleCards = [
    ...asArray(original.signalCards),
    ...asArray(original.statusCards),
    ...asArray(original.reasonWhyCards),
    ...asArray(original.warningCards),
    ...asArray(original.limitationCards),
    ...sourceTrace,
    ...asArray(original.nextReviewActionCards),
  ].filter(Boolean);

  output.viewerRole = viewerRole;
  output.shellSections = requestedSections;
  output.visibleCards = visibleCards;
  output.visibleStatuses = unique([renderCandidate.visibleStatus, ...(asArray(original.visibleStatuses))]);
  output.visibleReasonsWhy = unique([renderCandidate.visibleReasonWhy, ...(asArray(original.visibleReasonsWhy))]);
  output.visibleSourceTrace = sourceTrace;
  output.visibleNextReviewActions = unique([renderCandidate.visibleNextReviewAction, ...(asArray(original.visibleNextReviewActions))]);
  output.allowedStaticPreviewCandidate = true;
  output.eligibleForForgeAliveShellCandidate = true;
  output.githubPagesAvailabilityPreservedAsInfrastructureNoteOnly = true;

  output.forgeAliveShellCandidate = {
    shellName:'Forge Alive Shell',
    readOnly:true,
    viewerRole,
    shellSections:requestedSections,
    visibleCards,
    visibleStatuses:output.visibleStatuses,
    visibleReasonsWhy:output.visibleReasonsWhy,
    visibleWarnings:output.visibleWarnings,
    visibleLimitations:output.visibleLimitations,
    visibleSourceTrace:output.visibleSourceTrace,
    visibleNextReviewActions:output.visibleNextReviewActions,
    emptyStateCandidate: original.emptyStateCandidate || { type:'EMPTY_STATE', readOnly:true, message:'No reviewed signals are available yet.' },
    blockedStateCandidate: original.blockedStateCandidate || { type:'BLOCKED_STATE', readOnly:true, blockedSurfaces:FORGE_ALIVE_SHELL_FORBIDDEN_USES },
    githubPagesAvailability: original.githubPagesAvailabilitySnapshot?.available === true,
    githubPagesAvailabilityPreservedAsInfrastructureNoteOnly:true,
    allowedStaticPreviewCandidate:true,
    metricEconomicTruthRemainsSeparate:true,
    approvedForUiRendering:false,
    rendersUi:false,
    deploysApp:false,
    publishesGitHubPages:false,
    createsRoute:false,
    executesComponent:false,
    enablesInteractiveAction:false,
    authenticationAllowed:false,
    analyticsTrackingAllowed:false,
    persistsState:false,
    writesCanonicalTruth:false,
    createsBusinessTruth:false,
    createsMetricTruth:false,
    createsEconomicTruth:false,
    executesAction:false,
    sendsMessage:false,
  };

  output.forgeAliveShellStatus = FORGE_ALIVE_SHELL_STATUSES.APPROVED_FOR_FORGE_ALIVE_SHELL_CANDIDATE;
  output.decision = FORGE_ALIVE_SHELL_DECISIONS.APPROVE_FORGE_ALIVE_SHELL_CANDIDATE;
  return output;
}

module.exports = {
  buildForgeAliveShellBoundary,
  FORGE_ALIVE_SHELL_STATUSES,
  FORGE_ALIVE_SHELL_DECISIONS,
  FORGE_ALIVE_SHELL_ALLOWED_USES,
  FORGE_ALIVE_SHELL_FORBIDDEN_USES,
};
