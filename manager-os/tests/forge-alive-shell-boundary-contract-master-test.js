const assert = require('assert');
const {
  buildForgeAliveShellBoundary,
  FORGE_ALIVE_SHELL_STATUSES,
  FORGE_ALIVE_SHELL_DECISIONS,
  FORGE_ALIVE_SHELL_ALLOWED_USES,
  FORGE_ALIVE_SHELL_FORBIDDEN_USES,
} = require('../forge-alive-shell/forge-alive-shell-boundary-contract');

const futureDate = () => new Date(Date.now() + 86400000).toISOString();
function validInput(overrides = {}) {
  return {
    forgeAliveShellRequestId:'shell-1',
    uiRenderingRequestId:'ui-rendering-1',
    viewerId:'advisor-1',
    viewerRole:'ADVISOR',
    uiRenderingSnapshot:{
      uiRenderingRequestId:'ui-rendering-1',
      eligibleForReadOnlyRenderModel:true,
      rendersUi:false,
      forgeAliveRenderModelCandidate:{
        readOnly:true,
        visibleStatus:'DELIVERED_STATUS',
        visibleReasonWhy:'Forge can show this safely as review context.',
        visibleNextReviewAction:'Review evidence before taking action.',
        idempotencyKey:'idem-1',
        rendersUi:false,
      },
      warnings:['render model candidate only'],
      limitations:['not live UI'],
    },
    forgeAliveRenderModelCandidate:{
      readOnly:true,
      visibleStatus:'DELIVERED_STATUS',
      visibleReasonWhy:'Forge can show this safely as review context.',
      visibleNextReviewAction:'Review evidence before taking action.',
      idempotencyKey:'idem-1',
      rendersUi:false,
    },
    shellSections:['SIGNAL_INBOX','REASON_WHY_PANEL','WARNING_LIMITATION_PANEL','SOURCE_TRACE_PANEL','REVIEW_QUEUE','BLOCKED_SURFACES_PANEL','NEXT_REVIEW_ACTION_PANEL','SYSTEM_HEALTH_STRIP'],
    signalCards:[{type:'SIGNAL_CARD', readOnly:true}],
    statusCards:[{type:'STATUS_CARD', readOnly:true}],
    reasonWhyCards:[{type:'REASON_WHY_CARD', readOnly:true}],
    warningCards:[{type:'WARNING_CARD', readOnly:true}],
    limitationCards:[{type:'LIMITATION_CARD', readOnly:true}],
    sourceTraceCards:[{type:'SOURCE_TRACE_CARD', readOnly:true, sourceEvidenceIds:['ev1','ev2']}],
    nextReviewActionCards:[{type:'NEXT_REVIEW_ACTION_CARD', readOnly:true}],
    layoutPolicySnapshot:{reviewed:true, allowed:true, rendersUi:false, createsRoute:false, executesComponent:false},
    shellSafetyPolicySnapshot:{reviewed:true, allowed:true, enablesInteractiveAction:false, executesAction:false, sendsMessage:false, manipulationAllowed:false},
    staticHostingPolicySnapshot:{reviewed:true, allowed:true, surface:'GITHUB_PAGES', githubPagesRequested:true, deploysApp:false, publishesGitHubPages:false, callsExternalApi:false, analyticsTrackingAllowed:false},
    githubPagesAvailabilitySnapshot:{reviewed:true, available:true, deploymentAuthorized:false, publishAllowed:false},
    privacyPolicySnapshot:{reviewed:true, allowed:true, surveillanceAllowed:false, exposesRestrictedData:false, personalityTruthAllowed:false, analyticsTrackingAllowed:false},
    sourceEvidence:[
      {id:'ev1', sourceOwner:'UiRenderingBoundary'},
      {sourceEvidenceId:'ev2', sourceOwner:'CanonicalTruthRegistryBoundary'},
      {sourceEvidenceId:'ev2', sourceOwner:'CanonicalTruthRegistryBoundary'},
    ],
    sourceFreshness:{fresh:true, asOf:new Date().toISOString()},
    auditTrail:{auditTrailId:'audit-1', entries:['ui-rendering-reviewed']},
    idempotencyKey:'idem-1',
    visibleWarnings:['visible warning'],
    visibleLimitations:['visible limitation'],
    warnings:['shell warning'],
    limitations:['shell limitation'],
    requestedUse:'FORGE_ALIVE_SHELL_CANDIDATE_PREP',
    now:new Date().toISOString(),
    expiresAt:futureDate(),
    ...overrides,
  };
}
const noLiveFlags = [
  'approvedForUiRendering','rendersUi','deploysApp','publishesGitHubPages','createsRoute','executesComponent',
  'enablesInteractiveAction','authenticationAllowed','analyticsTrackingAllowed','persistsState','writesCanonicalTruth',
  'createsBusinessTruth','createsMetricTruth','createsEconomicTruth','createsDeliveryTruth','createsMessageTruth',
  'createsCompensationTruth','createsPayoutTruth','createsRevenueTruth','createsRankingTruth','createsPunishmentTruth',
  'createsHrTruth','createsPromotionTruth','createsAdvisorLifecycleTruth','createsPersonalityTruth','createsTask',
  'createsCalendarEvent','mutatesCrm','callsProviderApi','callsExternalApi','executesAction','sendsMessage'
];
function assertNoLive(output){ for (const flag of noLiveFlags) assert.strictEqual(output[flag], false, flag); }

const tests = [];
tests.push(['missing UI Rendering Boundary snapshot blocks shell candidate preparation', () => {
  assert.ok(FORGE_ALIVE_SHELL_ALLOWED_USES.includes('FORGE_ALIVE_SHELL_CANDIDATE_PREP'));
  assert.ok(FORGE_ALIVE_SHELL_FORBIDDEN_USES.includes('GITHUB_PAGES_DEPLOY'));
  assert.ok(FORGE_ALIVE_SHELL_DECISIONS.APPROVE_FORGE_ALIVE_SHELL_CANDIDATE);
  const out = buildForgeAliveShellBoundary(validInput({uiRenderingSnapshot:null}));
  assert.strictEqual(out.forgeAliveShellStatus, FORGE_ALIVE_SHELL_STATUSES.NEEDS_UI_RENDERING_BOUNDARY);
  assertNoLive(out);
}]);
tests.push(['missing render model candidate blocks', () => assert.strictEqual(buildForgeAliveShellBoundary(validInput({forgeAliveRenderModelCandidate:null, uiRenderingSnapshot:{eligibleForReadOnlyRenderModel:true}})).forgeAliveShellStatus, FORGE_ALIVE_SHELL_STATUSES.NEEDS_RENDER_MODEL_CANDIDATE)]);
tests.push(['missing layout policy blocks', () => assert.strictEqual(buildForgeAliveShellBoundary(validInput({layoutPolicySnapshot:null})).forgeAliveShellStatus, FORGE_ALIVE_SHELL_STATUSES.NEEDS_LAYOUT_POLICY)]);
tests.push(['missing shell safety policy blocks', () => assert.strictEqual(buildForgeAliveShellBoundary(validInput({shellSafetyPolicySnapshot:null})).forgeAliveShellStatus, FORGE_ALIVE_SHELL_STATUSES.NEEDS_SHELL_SAFETY_POLICY)]);
tests.push(['missing static hosting policy blocks', () => assert.strictEqual(buildForgeAliveShellBoundary(validInput({staticHostingPolicySnapshot:null})).forgeAliveShellStatus, FORGE_ALIVE_SHELL_STATUSES.NEEDS_STATIC_HOSTING_POLICY)]);
tests.push(['missing GitHub Pages review blocks when GitHub Pages is requested', () => assert.strictEqual(buildForgeAliveShellBoundary(validInput({githubPagesAvailabilitySnapshot:null})).forgeAliveShellStatus, FORGE_ALIVE_SHELL_STATUSES.NEEDS_GITHUB_PAGES_REVIEW)]);
tests.push(['missing privacy policy blocks', () => assert.strictEqual(buildForgeAliveShellBoundary(validInput({privacyPolicySnapshot:null})).forgeAliveShellStatus, FORGE_ALIVE_SHELL_STATUSES.NEEDS_PRIVACY_POLICY)]);
tests.push(['missing viewer role blocks', () => assert.strictEqual(buildForgeAliveShellBoundary(validInput({viewerRole:''})).forgeAliveShellStatus, FORGE_ALIVE_SHELL_STATUSES.NEEDS_VIEWER_ROLE)]);
tests.push(['missing source evidence blocks', () => assert.strictEqual(buildForgeAliveShellBoundary(validInput({sourceEvidence:[]})).forgeAliveShellStatus, FORGE_ALIVE_SHELL_STATUSES.NEEDS_SOURCE_EVIDENCE)]);
tests.push(['missing source owner blocks', () => assert.strictEqual(buildForgeAliveShellBoundary(validInput({sourceEvidence:[{id:'ev1'}]})).forgeAliveShellStatus, FORGE_ALIVE_SHELL_STATUSES.NEEDS_SOURCE_OWNER)]);
tests.push(['missing source freshness blocks', () => assert.strictEqual(buildForgeAliveShellBoundary(validInput({sourceFreshness:null})).forgeAliveShellStatus, FORGE_ALIVE_SHELL_STATUSES.NEEDS_SOURCE_FRESHNESS)]);
tests.push(['stale source freshness blocks or requires review', () => assert.strictEqual(buildForgeAliveShellBoundary(validInput({sourceFreshness:{stale:true}})).forgeAliveShellStatus, FORGE_ALIVE_SHELL_STATUSES.STALE_SOURCE_FRESHNESS)]);
tests.push(['missing idempotency key blocks', () => assert.strictEqual(buildForgeAliveShellBoundary(validInput({idempotencyKey:'', forgeAliveRenderModelCandidate:{readOnly:true}})).forgeAliveShellStatus, FORGE_ALIVE_SHELL_STATUSES.NEEDS_IDEMPOTENCY_KEY)]);
tests.push(['missing audit trail blocks', () => assert.strictEqual(buildForgeAliveShellBoundary(validInput({auditTrail:null})).forgeAliveShellStatus, FORGE_ALIVE_SHELL_STATUSES.NEEDS_AUDIT_TRAIL)]);
tests.push(['unsupported viewer role blocks', () => assert.strictEqual(buildForgeAliveShellBoundary(validInput({viewerRole:'VISITOR'})).forgeAliveShellStatus, FORGE_ALIVE_SHELL_STATUSES.UNSUPPORTED_VIEWER_ROLE)]);
tests.push(['unsupported shell section blocks', () => assert.strictEqual(buildForgeAliveShellBoundary(validInput({shellSections:['UNKNOWN_SECTION']})).forgeAliveShellStatus, FORGE_ALIVE_SHELL_STATUSES.UNSUPPORTED_SHELL_SECTION)]);
tests.push(['GitHub Pages deployment is blocked', () => assert.strictEqual(buildForgeAliveShellBoundary(validInput({githubPagesDeployRequested:true})).forgeAliveShellStatus, FORGE_ALIVE_SHELL_STATUSES.GITHUB_PAGES_DEPLOY_NOT_AUTHORIZED)]);
tests.push(['live app execution is blocked', () => assert.strictEqual(buildForgeAliveShellBoundary(validInput({liveAppRequested:true})).forgeAliveShellStatus, FORGE_ALIVE_SHELL_STATUSES.LIVE_APP_NOT_AUTHORIZED)]);
tests.push(['expired Forge Alive shell window blocks', () => assert.strictEqual(buildForgeAliveShellBoundary(validInput({expiresAt:new Date(Date.now()-1000).toISOString()})).forgeAliveShellStatus, FORGE_ALIVE_SHELL_STATUSES.EXPIRED_FORGE_ALIVE_SHELL_WINDOW)]);
tests.push(['Forge Alive shell candidate can be prepared', () => { const out=buildForgeAliveShellBoundary(validInput()); assert.strictEqual(out.forgeAliveShellStatus, FORGE_ALIVE_SHELL_STATUSES.APPROVED_FOR_FORGE_ALIVE_SHELL_CANDIDATE); assert.strictEqual(out.eligibleForForgeAliveShellCandidate,true); assert.ok(out.forgeAliveShellCandidate); }]);
tests.push(['actual UI rendering remains false', () => { const out=buildForgeAliveShellBoundary(validInput()); assert.strictEqual(out.rendersUi,false); assert.strictEqual(out.forgeAliveShellCandidate.rendersUi,false); }]);
tests.push(['GitHub Pages publish remains false', () => { const out=buildForgeAliveShellBoundary(validInput()); assert.strictEqual(out.publishesGitHubPages,false); assert.strictEqual(out.forgeAliveShellCandidate.publishesGitHubPages,false); }]);
tests.push(['app deployment remains false', () => { const out=buildForgeAliveShellBoundary(validInput()); assert.strictEqual(out.deploysApp,false); assert.strictEqual(out.forgeAliveShellCandidate.deploysApp,false); }]);
tests.push(['route component execution remains false', () => { const out=buildForgeAliveShellBoundary(validInput()); assert.strictEqual(out.createsRoute,false); assert.strictEqual(out.executesComponent,false); }]);
tests.push(['interactive action remains false', () => assert.strictEqual(buildForgeAliveShellBoundary(validInput()).enablesInteractiveAction,false)]);
tests.push(['authentication remains false', () => assert.strictEqual(buildForgeAliveShellBoundary(validInput()).authenticationAllowed,false)]);
tests.push(['analytics tracking remains false', () => assert.strictEqual(buildForgeAliveShellBoundary(validInput()).analyticsTrackingAllowed,false)]);
tests.push(['persistence remains false', () => assert.strictEqual(buildForgeAliveShellBoundary(validInput()).persistsState,false)]);
tests.push(['canonical truth write remains false', () => assert.strictEqual(buildForgeAliveShellBoundary(validInput()).writesCanonicalTruth,false)]);
tests.push(['business metric economic truth creation remains false', () => { const out=buildForgeAliveShellBoundary(validInput()); assert.strictEqual(out.createsBusinessTruth,false); assert.strictEqual(out.createsMetricTruth,false); assert.strictEqual(out.createsEconomicTruth,false); }]);
tests.push(['delivery message truth creation remains false', () => { const out=buildForgeAliveShellBoundary(validInput()); assert.strictEqual(out.createsDeliveryTruth,false); assert.strictEqual(out.createsMessageTruth,false); }]);
tests.push(['compensation revenue payout truth remains false', () => { const out=buildForgeAliveShellBoundary(validInput()); assert.strictEqual(out.createsCompensationTruth,false); assert.strictEqual(out.createsRevenueTruth,false); assert.strictEqual(out.createsPayoutTruth,false); }]);
tests.push(['ranking punishment HR personality truth remains false', () => { const out=buildForgeAliveShellBoundary(validInput()); assert.strictEqual(out.createsRankingTruth,false); assert.strictEqual(out.createsPunishmentTruth,false); assert.strictEqual(out.createsHrTruth,false); assert.strictEqual(out.createsPersonalityTruth,false); }]);
tests.push(['advisor lifecycle truth remains false', () => assert.strictEqual(buildForgeAliveShellBoundary(validInput()).createsAdvisorLifecycleTruth,false)]);
tests.push(['task calendar creation remains false', () => { const out=buildForgeAliveShellBoundary(validInput()); assert.strictEqual(out.createsTask,false); assert.strictEqual(out.createsCalendarEvent,false); }]);
tests.push(['CRM mutation remains false', () => assert.strictEqual(buildForgeAliveShellBoundary(validInput()).mutatesCrm,false)]);
tests.push(['provider external API calls remain false', () => { const out=buildForgeAliveShellBoundary(validInput()); assert.strictEqual(out.callsProviderApi,false); assert.strictEqual(out.callsExternalApi,false); }]);
tests.push(['send action execution remains false', () => { const out=buildForgeAliveShellBoundary(validInput()); assert.strictEqual(out.sendsMessage,false); assert.strictEqual(out.executesAction,false); }]);
tests.push(['forbidden uses are blocked', () => { const out=buildForgeAliveShellBoundary(validInput({requestedUse:'GITHUB_PAGES_DEPLOY'})); assert.strictEqual(out.forgeAliveShellStatus, FORGE_ALIVE_SHELL_STATUSES.BLOCKED); assert.ok(out.blockedUses.includes('GITHUB_PAGES_DEPLOY')); }]);
tests.push(['allowed uses are allowed', () => { const out=buildForgeAliveShellBoundary(validInput({requestedUse:'SIGNAL_CARD_LAYOUT_PREP'})); assert.ok(out.allowedUses.includes('SIGNAL_CARD_LAYOUT_PREP')); assert.strictEqual(out.forgeAliveShellStatus, FORGE_ALIVE_SHELL_STATUSES.APPROVED_FOR_FORGE_ALIVE_SHELL_CANDIDATE); }]);
tests.push(['inputs are not mutated', () => { const input=validInput(); const before=JSON.stringify(input); buildForgeAliveShellBoundary(input); assert.strictEqual(JSON.stringify(input), before); }]);
tests.push(['evidence source sourceOwners dedupe', () => { const out=buildForgeAliveShellBoundary(validInput()); assert.deepStrictEqual(out.evidenceRefs.sort(), ['ev1','ev2'].sort()); assert.deepStrictEqual(out.sourceEvidenceIds.sort(), ['ev1','ev2'].sort()); assert.deepStrictEqual(out.sourceOwners.sort(), ['UiRenderingBoundary','CanonicalTruthRegistryBoundary'].sort()); }]);
tests.push(['warnings and limitations remain visible', () => { const out=buildForgeAliveShellBoundary(validInput()); assert.ok(out.visibleWarnings.includes('visible warning')); assert.ok(out.visibleWarnings.includes('shell warning')); assert.ok(out.visibleWarnings.includes('render model candidate only')); assert.ok(out.visibleLimitations.includes('visible limitation')); assert.ok(out.visibleLimitations.includes('shell limitation')); assert.ok(out.visibleLimitations.includes('not live UI')); }]);
tests.push(['source trace remains visible', () => { const out=buildForgeAliveShellBoundary(validInput()); assert.ok(out.visibleSourceTrace.length > 0); assert.deepStrictEqual(out.visibleSourceTrace[0].sourceEvidenceIds.sort(), ['ev1','ev2'].sort()); }]);
tests.push(['empty and blocked states are represented safely', () => { const out=buildForgeAliveShellBoundary(validInput()); assert.strictEqual(out.forgeAliveShellCandidate.emptyStateCandidate.readOnly,true); assert.strictEqual(out.forgeAliveShellCandidate.blockedStateCandidate.readOnly,true); assert.ok(out.forgeAliveShellCandidate.blockedStateCandidate.blockedSurfaces.includes('GITHUB_PAGES_DEPLOY')); }]);
tests.push(['GitHub Pages availability is preserved as infrastructure note only', () => { const out=buildForgeAliveShellBoundary(validInput()); assert.strictEqual(out.forgeAliveShellCandidate.githubPagesAvailability,true); assert.strictEqual(out.githubPagesAvailabilityPreservedAsInfrastructureNoteOnly,true); assert.strictEqual(out.publishesGitHubPages,false); }]);
tests.push(['Forge Alive shell candidate is read-only', () => { const out=buildForgeAliveShellBoundary(validInput()); assert.strictEqual(out.forgeAliveShellCandidate.readOnly,true); assert.strictEqual(out.allowedStaticPreviewCandidate,true); assertNoLive(out); }]);
tests.push(['Metric Economic Truth remains separate', () => { const out=buildForgeAliveShellBoundary(validInput()); assert.strictEqual(out.metricEconomicTruthRemainsSeparate,true); assert.strictEqual(out.forgeAliveShellCandidate.metricEconomicTruthRemainsSeparate,true); }]);

let passed=0;
for (const [name, fn] of tests) {
  try { fn(); passed += 1; } catch (error) { console.error(`FAIL: ${name}`); throw error; }
}
console.log(`Forge Alive Shell Boundary Contract PASS ${passed}/${tests.length}`);
