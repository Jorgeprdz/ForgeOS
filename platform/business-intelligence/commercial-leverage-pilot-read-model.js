"use strict";

function fail(code) { const error = new TypeError(code); error.code = code; throw error; }
function duration(period) { return Date.parse(period.to) - Date.parse(period.from); }
function ratio(value) { return value === null ? null : Number(value.toFixed(12)); }
function freeze(value) { if (!value || typeof value !== "object" || Object.isFrozen(value)) return value; Object.freeze(value); Object.values(value).forEach(freeze); return value; }
function validInstant(value, code) { if (typeof value !== "string" || Number.isNaN(Date.parse(value))) fail(code); return new Date(value).toISOString(); }
function normalizeWindow(window) { if (!window || typeof window !== "object" || Array.isArray(window)) fail("PILOT_OBSERVATION_WINDOW_REQUIRED"); const from = validInstant(window.from, "PILOT_WINDOW_FROM_INVALID"); const to = validInstant(window.to, "PILOT_WINDOW_TO_INVALID"); if (Date.parse(to) <= Date.parse(from)) fail("PILOT_WINDOW_ORDER_INVALID"); return freeze({ from, to }); }
function within(instant, window) { const time = Date.parse(validInstant(instant, "PILOT_EVENT_TIME_INVALID")); return time >= Date.parse(window.from) && time < Date.parse(window.to); }
function latestInstant(event) { return Date.parse(event.recorded_at || event.occurred_at); }
function median(values) { if (!values.length) return null; const ordered = [...values].sort((a, b) => a - b); const middle = Math.floor(ordered.length / 2); return ordered.length % 2 ? ordered[middle] : (ordered[middle - 1] + ordered[middle]) / 2; }
function metric(state, value, { numerator = null, denominator = null, unit = "COUNT", limitation = null } = {}) { return freeze({ state, value, numerator, denominator, unit, limitation }); }

const PILOT_METRIC_DEFINITIONS = freeze({
  RECOMMENDATIONS_PRESENTED: {
    NUMERATOR: "distinct canonical RECOMMENDATION_PRESENTED evidence items",
    DENOMINATOR: "NONE",
    ELIGIBILITY: "same advisor; SYSTEM_OBSERVED; CONFIRMED; subject RECOMMENDATION; event inside observation window",
    OBSERVATION_WINDOW: "occurred_at in [from,to)",
    UNKNOWN_BEHAVIOR: "source unavailable => null; connected complete empty input => 0",
  },
  DECISIONS_RECORDED: {
    NUMERATOR: "distinct canonically presented recommendations with a latest eligible SALES_NBA_ADVISOR_RESPONSE after presentation",
    DENOMINATOR: "NONE",
    ELIGIBILITY: "same advisor; recommendation identity resolvable; decision after presentation; event inside observation window",
    OBSERVATION_WINDOW: "presentation and decision occurred_at in [from,to)",
    UNKNOWN_BEHAVIOR: "presentation or decision source unavailable => null; ambiguous recommendation version => unresolved and excluded",
  },
  ACCEPTANCE_RATE: {
    NUMERATOR: "distinct presented recommendations whose latest human decision is ACCEPTED or MODIFIED",
    DENOMINATOR: "distinct canonically presented eligible recommendations",
    ELIGIBILITY: "same advisor; resolvable recommendation identity; latest decision in window",
    OBSERVATION_WINDOW: "presentation and decision occurred_at in [from,to)",
    UNKNOWN_BEHAVIOR: "source unavailable => null; denominator 0 => INSUFFICIENT_SAMPLE",
  },
  ACTION_LINKAGE_ELIGIBLE_ACCEPTED_COUNT: {
    NUMERATOR: "latest ACCEPTED decisions that are explicitly action-addressable with valid transported commercial identity",
    DENOMINATOR: "NONE",
    ELIGIBILITY: "ACCEPTED only; recommendation_action_addressable=true; explicit action owner and target identity",
    OBSERVATION_WINDOW: "presentation and decision occurred_at in [from,to)",
    UNKNOWN_BEHAVIOR: "source unavailable => null; connected complete empty input => 0",
  },
  EXPLICITLY_LINKED_ACTION_COUNT: {
    NUMERATOR: "action-linkage-eligible ACCEPTED decisions with a later real action carrying recommendation_decision_reference",
    DENOMINATOR: "NONE",
    ELIGIBILITY: "same advisor; exact explicit decision reference; action occurred_at >= decision occurred_at; temporal-only excluded",
    OBSERVATION_WINDOW: "decision and action occurred_at in [from,to)",
    UNKNOWN_BEHAVIOR: "action source unavailable => null",
  },
  ACTION_AFTER_ACCEPT_RATE: {
    NUMERATOR: "action-linkage-eligible ACCEPTED decisions with at least one subsequent explicitly linked real action",
    DENOMINATOR: "action-linkage-eligible ACCEPTED decisions",
    ELIGIBILITY: "ACTION_ADDRESSABLE + ACCEPTED + VALID_IDENTITY + ELIGIBLE_OBSERVATION_WINDOW; temporal-only excluded",
    OBSERVATION_WINDOW: "decision and action occurred_at in [from,to)",
    UNKNOWN_BEHAVIOR: "action source unavailable => null; denominator 0 => INSUFFICIENT_SAMPLE; MODIFIED/DEFERRED/DISMISSED excluded",
  },
  OUTCOME_AFTER_ACTION_RATE: {
    NUMERATOR: "explicitly linked real actions followed by a same-person CONFIRMED_POLICY fact from the existing funnel authority",
    DENOMINATOR: "distinct explicitly linked real actions",
    ELIGIBILITY: "same advisor; exact commercial person reference; CONFIRMED_POLICY occurred_at >= action occurred_at; confirmed-policy coverage COMPLETE",
    OBSERVATION_WINDOW: "action and existing normalized outcome occurred_at in [from,to)",
    UNKNOWN_BEHAVIOR: "funnel source or complete confirmed-policy coverage unavailable => null; denominator 0 => INSUFFICIENT_SAMPLE",
  },
});

function compareCommercialLeverage({ baseline, current, inputStage = "CONTACT" } = {}) {
  if (baseline?.schema !== "COMMERCIAL_FUNNEL_RECONCILIATION_READ_MODEL_017B" || current?.schema !== baseline.schema) fail("FUNNEL_MODELS_REQUIRED");
  if (baseline.advisorId !== current.advisorId) fail("ADVISOR_MISMATCH");
  const bInput = baseline.stages[inputStage], cInput = current.stages[inputStage];
  const bOutput = baseline.stages.CONFIRMED_POLICY, cOutput = current.stages.CONFIRMED_POLICY;
  const complete = [bInput, cInput, bOutput, cOutput].every(item => item?.coverage === "COMPLETE");
  const sameDuration = duration(baseline.period) === duration(current.period);
  const sameInput = complete && bInput.value === cInput.value;
  const state = !complete ? "UNKNOWN" : !sameDuration || !sameInput ? "NOT_COMPARABLE" : "COMPARABLE";
  const baselineRate = state === "COMPARABLE" && bInput.value > 0 ? ratio(bOutput.value / bInput.value) : null;
  const currentRate = state === "COMPARABLE" && cInput.value > 0 ? ratio(cOutput.value / cInput.value) : null;
  const relativeUplift = state === "COMPARABLE" && bOutput.value > 0 ? ratio((cOutput.value - bOutput.value) / bOutput.value) : null;
  return Object.freeze({ schema: "COMMERCIAL_LEVERAGE_PERIOD_COMPARISON_017C", advisorId: baseline.advisorId, state, inputStage, comparableInput: state === "COMPARABLE" ? bInput.value : null, baselineConfirmedPolicies: state === "COMPARABLE" ? bOutput.value : null, currentConfirmedPolicies: state === "COMPARABLE" ? cOutput.value : null, baselineConversion: baselineRate, currentConversion: currentRate, conversionPointChange: baselineRate === null ? null : ratio(currentRate - baselineRate), observedSalesUplift: relativeUplift, causalAttribution: false, outputPerHour: null, readiness: state === "COMPARABLE" ? "PILOT_READY" : "EVIDENCE_INSUFFICIENT" });
}

function reconcileDecisionToAction({ decisionEvent, actionEvent } = {}) {
  if (decisionEvent?.event_type !== "SALES_NBA_ADVISOR_RESPONSE") fail("DECISION_EVENT_REQUIRED");
  if (decisionEvent?.payload?.decision !== "ACCEPTED") return Object.freeze({ state: "NO_ELIGIBLE_DECISION", action: null, causalAttribution: false });
  if (!actionEvent) return Object.freeze({ state: "NO_OBSERVABLE_ACTION", action: null, causalAttribution: false });
  if (actionEvent.tenant_id !== decisionEvent.tenant_id) fail("CROSS_ADVISOR_ACTION_BLOCKED");
  if (Date.parse(actionEvent.occurred_at) < Date.parse(decisionEvent.occurred_at)) fail("ACTION_PRECEDES_DECISION");
  const explicit = actionEvent.payload?.recommendation_decision_reference === decisionEvent.event_id;
  if (!explicit) return Object.freeze({ state: "TEMPORAL_ASSOCIATION_ONLY", action: null, causalAttribution: false });
  return Object.freeze({ state: "EXPLICITLY_LINKED_LATER_ACTION", action: actionEvent, causalAttribution: false });
}

function validateAdvisorEvents(events, advisorId, label) {
  for (const event of events) {
    if (!event || typeof event !== "object" || Array.isArray(event)) fail(`${label}_EVENT_INVALID`);
    if (event.tenant_id !== advisorId) fail(`${label}_CROSS_ADVISOR_BLOCKED`);
    validInstant(event.occurred_at, `${label}_OCCURRED_AT_INVALID`);
  }
}

function presentationKey(event) { return String(event.idempotency_key || event.event_id || "").trim(); }

function normalizePresentations(events, advisorId, window) {
  validateAdvisorEvents(events, advisorId, "PRESENTATION");
  const eligible = events.filter(event => within(event.occurred_at, window)).filter(event =>
    event.event_type === "RECOMMENDATION_PRESENTED"
    && event.subject?.type === "RECOMMENDATION"
    && event.source?.type === "SYSTEM_OBSERVED"
    && event.evidence_strength === "SYSTEM_OBSERVED"
    && event.confirmation_state === "CONFIRMED"
    && event.payload?.advisor_reference === advisorId
    && event.payload?.recommendation_reference,
  );
  const byKey = new Map();
  for (const event of eligible) {
    const key = presentationKey(event);
    if (!key) fail("PRESENTATION_IDENTITY_REQUIRED");
    const existing = byKey.get(key);
    if (!existing || latestInstant(event) < latestInstant(existing)) byKey.set(key, event);
  }
  return [...byKey.values()].sort((a, b) => Date.parse(a.occurred_at) - Date.parse(b.occurred_at));
}

function resolvePresentationForDecision(presentations, decision) {
  const recommendationReference = decision.payload?.recommendation_reference;
  const candidates = presentations.filter(event => event.payload?.recommendation_reference === recommendationReference && Date.parse(event.occurred_at) <= Date.parse(decision.occurred_at));
  if (!candidates.length) return { state: "UNRESOLVED", presentation: null, reason: "NO_PRIOR_CANONICAL_PRESENTATION" };
  if (candidates.length === 1) return { state: "RESOLVED", presentation: candidates[0], reason: null };
  const decisionVersion = decision.payload?.recommendation_version || null;
  if (decisionVersion) {
    const versionMatches = candidates.filter(event => event.payload?.recommendation_version === decisionVersion);
    if (versionMatches.length === 1) return { state: "RESOLVED", presentation: versionMatches[0], reason: null };
  }
  return { state: "UNRESOLVED", presentation: null, reason: "AMBIGUOUS_RECOMMENDATION_VERSION" };
}

function latestDecisions(events, advisorId, window, presentations) {
  validateAdvisorEvents(events, advisorId, "DECISION");
  const eligible = events.filter(event => within(event.occurred_at, window)).filter(event =>
    event.event_type === "SALES_NBA_ADVISOR_RESPONSE"
    && event.payload?.advisor_reference === advisorId
    && ['ACCEPTED', 'MODIFIED', 'DEFERRED', 'DISMISSED'].includes(event.payload?.decision)
    && event.payload?.recommendation_reference,
  );
  const resolved = [];
  const unresolved = [];
  for (const event of eligible) {
    const match = resolvePresentationForDecision(presentations, event);
    if (match.state !== "RESOLVED") { unresolved.push(freeze({ decisionEventId: event.event_id, recommendationReference: event.payload.recommendation_reference, state: "UNRESOLVED", reason: match.reason })); continue; }
    resolved.push({ event, presentation: match.presentation, presentationKey: presentationKey(match.presentation) });
  }
  const latest = new Map();
  for (const candidate of resolved) {
    const existing = latest.get(candidate.presentationKey);
    if (!existing || latestInstant(candidate.event) > latestInstant(existing.event)) latest.set(candidate.presentationKey, candidate);
  }
  return { latest: [...latest.values()], unresolved };
}

function actionLinkageEligibleAccepted(candidate) {
  const payload = candidate?.event?.payload || {};
  if (payload.decision !== "ACCEPTED" || payload.recommendation_action_addressable !== true) return false;
  if (!payload.action_owner || !payload.action_target_reference || !payload.expected_action) return false;
  const hasCommercialIdentity = Boolean(payload.commercial_person_reference || (payload.policy_reference && payload.payment_obligation_reference));
  return hasCommercialIdentity;
}

function explicitReference(action, decisionEventId) {
  return action.payload?.recommendation_decision_reference === decisionEventId;
}

function actionCorrelations(decisions, actions, advisorId, window) {
  validateAdvisorEvents(actions, advisorId, "ACTION");
  const inWindow = actions.filter(event => within(event.occurred_at, window));
  const correlations = [];
  const explicitActions = new Map();
  const decisionToFirstAction = [];
  for (const candidate of decisions) {
    const decision = candidate.event;
    const referenced = inWindow.filter(action => explicitReference(action, decision.event_id));
    const invalidExplicit = referenced.filter(action => Date.parse(action.occurred_at) < Date.parse(decision.occurred_at));
    const validExplicit = referenced.filter(action => Date.parse(action.occurred_at) >= Date.parse(decision.occurred_at)).sort((a, b) => Date.parse(a.occurred_at) - Date.parse(b.occurred_at));
    const later = inWindow.filter(action => Date.parse(action.occurred_at) >= Date.parse(decision.occurred_at));
    if (validExplicit.length) {
      validExplicit.forEach(action => explicitActions.set(action.event_id, action));
      decisionToFirstAction.push(Date.parse(validExplicit[0].occurred_at) - Date.parse(decision.occurred_at));
      correlations.push(freeze({ decisionEventId: decision.event_id, recommendationReference: decision.payload.recommendation_reference, state: "EXPLICIT_LINEAGE", actionEventId: validExplicit[0].event_id, causalAttribution: false }));
    } else if (invalidExplicit.length) {
      correlations.push(freeze({ decisionEventId: decision.event_id, recommendationReference: decision.payload.recommendation_reference, state: "UNRESOLVED", actionEventId: null, reason: "ACTION_PRECEDES_DECISION", causalAttribution: false }));
    } else if (later.length) {
      correlations.push(freeze({ decisionEventId: decision.event_id, recommendationReference: decision.payload.recommendation_reference, state: "TEMPORAL_ASSOCIATION_ONLY", actionEventId: null, causalAttribution: false }));
    } else {
      correlations.push(freeze({ decisionEventId: decision.event_id, recommendationReference: decision.payload.recommendation_reference, state: "NO_ACTION_OBSERVED", actionEventId: null, causalAttribution: false }));
    }
  }
  return { correlations, explicitActions: [...explicitActions.values()], decisionToFirstAction };
}

function normalizeFunnelForOutcomes(funnelModel, advisorId, window) {
  if (!funnelModel) return { state: "SOURCE_UNAVAILABLE", facts: [] };
  if (funnelModel.schema !== "COMMERCIAL_FUNNEL_RECONCILIATION_READ_MODEL_017B") fail("PILOT_FUNNEL_MODEL_REQUIRED");
  if (funnelModel.advisorId !== advisorId) fail("PILOT_FUNNEL_ADVISOR_MISMATCH");
  if (funnelModel.period?.from !== window.from || funnelModel.period?.to !== window.to) fail("PILOT_FUNNEL_PERIOD_MISMATCH");
  if (funnelModel.stages?.CONFIRMED_POLICY?.coverage !== "COMPLETE") return { state: "SOURCE_UNAVAILABLE", facts: [] };
  return { state: "READY", facts: (Array.isArray(funnelModel.facts) ? funnelModel.facts : []).filter(fact => fact.stage === "CONFIRMED_POLICY" && fact.advisorId === advisorId) };
}

function outcomeCorrelations(explicitActions, funnelState) {
  if (funnelState.state !== "READY") return { state: "SOURCE_UNAVAILABLE", correlations: explicitActions.map(action => freeze({ actionEventId: action.event_id, state: "SOURCE_UNAVAILABLE", outcomeReference: null, causalAttribution: false })), withOutcome: [], actionToOutcome: [] };
  const correlations = [], withOutcome = [], actionToOutcome = [];
  for (const action of explicitActions) {
    const person = action.payload?.contact_reference || null;
    if (!person) { correlations.push(freeze({ actionEventId: action.event_id, state: "UNRESOLVED", outcomeReference: null, reason: "ACTION_COMMERCIAL_IDENTITY_UNAVAILABLE", causalAttribution: false })); continue; }
    const outcomes = funnelState.facts.filter(fact => fact.commercialPersonReference === person && Date.parse(fact.occurredAt) >= Date.parse(action.occurred_at)).sort((a, b) => Date.parse(a.occurredAt) - Date.parse(b.occurredAt));
    if (!outcomes.length) { correlations.push(freeze({ actionEventId: action.event_id, state: "NO_OUTCOME_OBSERVED", outcomeReference: null, causalAttribution: false })); continue; }
    const outcome = outcomes[0];
    withOutcome.push(action);
    actionToOutcome.push(Date.parse(outcome.occurredAt) - Date.parse(action.occurred_at));
    correlations.push(freeze({ actionEventId: action.event_id, state: "OBSERVED_AFTER", outcomeReference: outcome.factReference, outcomeEventType: outcome.eventType, causalAttribution: false }));
  }
  return { state: "READY", correlations, withOutcome, actionToOutcome };
}

function summarizeCommercialPilotEvidence({ advisorId, observationWindow, presentationEvents = null, decisionEvents = null, actionEvents = null, funnelModel = null } = {}) {
  if (typeof advisorId !== "string" || !advisorId.trim()) fail("PILOT_ADVISOR_REQUIRED");
  const advisor = advisorId.trim();
  const window = normalizeWindow(observationWindow);
  const presentationSourceAvailable = Array.isArray(presentationEvents);
  const decisionSourceAvailable = Array.isArray(decisionEvents);
  const actionSourceAvailable = Array.isArray(actionEvents);

  const presentations = presentationSourceAvailable ? normalizePresentations(presentationEvents, advisor, window) : [];
  const decisionResult = presentationSourceAvailable && decisionSourceAvailable ? latestDecisions(decisionEvents, advisor, window, presentations) : { latest: [], unresolved: [] };
  const latest = decisionResult.latest;
  const counts = { ACCEPTED: 0, MODIFIED: 0, DEFERRED: 0, DISMISSED: 0 };
  latest.forEach(candidate => { counts[candidate.event.payload.decision] += 1; });
  const eligibleAccepted = latest.filter(actionLinkageEligibleAccepted);
  const modified = latest.filter(candidate => candidate.event.payload.decision === "MODIFIED");

  const actionResult = actionSourceAvailable && presentationSourceAvailable && decisionSourceAvailable
    ? actionCorrelations(eligibleAccepted, actionEvents, advisor, window)
    : { correlations: eligibleAccepted.map(candidate => freeze({ decisionEventId: candidate.event.event_id, state: "SOURCE_UNAVAILABLE", actionEventId: null, causalAttribution: false })), explicitActions: [], decisionToFirstAction: [] };
  const modifiedCorrelations = modified.map(candidate => freeze({ decisionEventId: candidate.event.event_id, recommendationReference: candidate.event.payload.recommendation_reference, state: "UNRESOLVED", actionEventId: null, reason: "MODIFIED_NOT_ACTION_LINEAGE_ELIGIBLE", causalAttribution: false }));
  const explicitDecisionCount = actionResult.correlations.filter(item => item.state === "EXPLICIT_LINEAGE").length;
  const funnelState = normalizeFunnelForOutcomes(funnelModel, advisor, window);
  const outcomeResult = actionSourceAvailable ? outcomeCorrelations(actionResult.explicitActions, funnelState) : { state: "SOURCE_UNAVAILABLE", correlations: [], withOutcome: [], actionToOutcome: [] };

  const presentedMetric = presentationSourceAvailable ? metric(presentations.length ? "KNOWN" : "ZERO", presentations.length) : metric("SOURCE_UNAVAILABLE", null, { limitation: "Canonical recommendation presentation source is unavailable." });
  const decisionsMetric = presentationSourceAvailable && decisionSourceAvailable ? metric(latest.length ? "KNOWN" : "ZERO", latest.length) : metric("SOURCE_UNAVAILABLE", null, { limitation: "Presentation or decision evidence source is unavailable." });
  const acceptanceNumerator = counts.ACCEPTED + counts.MODIFIED;
  const acceptanceMetric = !presentationSourceAvailable || !decisionSourceAvailable
    ? metric("SOURCE_UNAVAILABLE", null, { numerator: null, denominator: null, unit: "RATIO" })
    : presentations.length === 0
      ? metric("INSUFFICIENT_SAMPLE", null, { numerator: 0, denominator: 0, unit: "RATIO", limitation: "No canonically presented recommendation exists in the observation window." })
      : metric("KNOWN", ratio(acceptanceNumerator / presentations.length), { numerator: acceptanceNumerator, denominator: presentations.length, unit: "RATIO" });
  const actionMetric = !actionSourceAvailable || !presentationSourceAvailable || !decisionSourceAvailable
    ? metric("SOURCE_UNAVAILABLE", null, { numerator: null, denominator: eligibleAccepted.length || null, unit: "RATIO" })
    : eligibleAccepted.length === 0
      ? metric("INSUFFICIENT_SAMPLE", null, { numerator: 0, denominator: 0, unit: "RATIO", limitation: "No action-linkage-eligible ACCEPTED decision exists in the observation window." })
      : metric("KNOWN", ratio(explicitDecisionCount / eligibleAccepted.length), { numerator: explicitDecisionCount, denominator: eligibleAccepted.length, unit: "RATIO", limitation: "MODIFIED, DEFERRED, DISMISSED, TEMPORAL_ASSOCIATION_ONLY and UNRESOLVED actions are excluded." });
  const outcomeMetric = !actionSourceAvailable || funnelState.state !== "READY"
    ? metric("SOURCE_UNAVAILABLE", null, { numerator: null, denominator: actionResult.explicitActions.length || null, unit: "RATIO", limitation: "Complete existing CONFIRMED_POLICY outcome coverage is unavailable." })
    : actionResult.explicitActions.length === 0
      ? metric("INSUFFICIENT_SAMPLE", null, { numerator: 0, denominator: 0, unit: "RATIO", limitation: "No explicitly linked action exists in the observation window." })
      : metric("KNOWN", ratio(outcomeResult.withOutcome.length / actionResult.explicitActions.length), { numerator: outcomeResult.withOutcome.length, denominator: actionResult.explicitActions.length, unit: "RATIO", limitation: "Observed subsequent same-person confirmed policy; no causal attribution." });

  const decisionActionMedian = median(actionResult.decisionToFirstAction);
  const actionOutcomeMedian = median(outcomeResult.actionToOutcome);
  const limitations = [];
  if (!presentationSourceAvailable) limitations.push("RECOMMENDATION_PRESENTATION_SOURCE_UNAVAILABLE");
  if (!decisionSourceAvailable) limitations.push("HUMAN_DECISION_SOURCE_UNAVAILABLE");
  if (!actionSourceAvailable) limitations.push("ACTION_SOURCE_UNAVAILABLE");
  if (funnelState.state !== "READY") limitations.push("CONFIRMED_POLICY_OUTCOME_COVERAGE_UNAVAILABLE");
  if (decisionResult.unresolved.length) limitations.push("AMBIGUOUS_OR_UNRESOLVED_RECOMMENDATION_DECISIONS");
  if (actionResult.correlations.some(item => item.state === "TEMPORAL_ASSOCIATION_ONLY")) limitations.push("TEMPORAL_ONLY_ACTIONS_EXCLUDED");
  if (actionResult.correlations.some(item => item.state === "UNRESOLVED") || modified.length) limitations.push("UNRESOLVED_ACTION_LINEAGE_EXCLUDED");
  const uncertaintyState = limitations.some(item => item.endsWith("SOURCE_UNAVAILABLE") || item.includes("COVERAGE_UNAVAILABLE")) ? "SOURCE_UNAVAILABLE" : presentations.length === 0 ? "INSUFFICIENT_SAMPLE" : limitations.length ? "UNRESOLVED" : "DIRECTIONAL_PILOT_EVIDENCE";

  const explicitlyLinkedActionCount = metric(actionSourceAvailable ? (explicitDecisionCount ? "KNOWN" : "ZERO") : "SOURCE_UNAVAILABLE", actionSourceAvailable ? explicitDecisionCount : null);
  return freeze({
    schema: "COMMERCIAL_PILOT_EVIDENCE_SUMMARY_017E",
    advisorId: advisor,
    observationWindow: window,
    definitions: PILOT_METRIC_DEFINITIONS,
    recommendationsPresented: presentedMetric,
    decisionsRecorded: decisionsMetric,
    acceptedCount: metric(presentationSourceAvailable && decisionSourceAvailable ? (counts.ACCEPTED ? "KNOWN" : "ZERO") : "SOURCE_UNAVAILABLE", presentationSourceAvailable && decisionSourceAvailable ? counts.ACCEPTED : null),
    modifiedCount: metric(presentationSourceAvailable && decisionSourceAvailable ? (counts.MODIFIED ? "KNOWN" : "ZERO") : "SOURCE_UNAVAILABLE", presentationSourceAvailable && decisionSourceAvailable ? counts.MODIFIED : null),
    deferredCount: metric(presentationSourceAvailable && decisionSourceAvailable ? (counts.DEFERRED ? "KNOWN" : "ZERO") : "SOURCE_UNAVAILABLE", presentationSourceAvailable && decisionSourceAvailable ? counts.DEFERRED : null),
    dismissedCount: metric(presentationSourceAvailable && decisionSourceAvailable ? (counts.DISMISSED ? "KNOWN" : "ZERO") : "SOURCE_UNAVAILABLE", presentationSourceAvailable && decisionSourceAvailable ? counts.DISMISSED : null),
    acceptanceRate: acceptanceMetric,
    actionLinkageEligibleAcceptedCount: metric(presentationSourceAvailable && decisionSourceAvailable ? (eligibleAccepted.length ? "KNOWN" : "ZERO") : "SOURCE_UNAVAILABLE", presentationSourceAvailable && decisionSourceAvailable ? eligibleAccepted.length : null),
    explicitlyLinkedActionCount,
    actionAfterAcceptRate: actionMetric,
    actionAfterDecisionRate: actionMetric,
    acceptedOrModifiedWithExplicitAction: explicitlyLinkedActionCount,
    actionsWithSubsequentOutcome: metric(outcomeResult.state === "READY" ? (outcomeResult.withOutcome.length ? "KNOWN" : "ZERO") : "SOURCE_UNAVAILABLE", outcomeResult.state === "READY" ? outcomeResult.withOutcome.length : null),
    outcomeAfterActionRate: outcomeMetric,
    elapsedDecisionToAction: decisionActionMedian === null ? metric(actionSourceAvailable ? "INSUFFICIENT_SAMPLE" : "SOURCE_UNAVAILABLE", null, { unit: "MILLISECONDS" }) : metric("KNOWN", decisionActionMedian, { numerator: actionResult.decisionToFirstAction.length, unit: "MEDIAN_MILLISECONDS" }),
    elapsedActionToOutcome: actionOutcomeMedian === null ? metric(outcomeResult.state === "READY" ? "INSUFFICIENT_SAMPLE" : "SOURCE_UNAVAILABLE", null, { unit: "MILLISECONDS" }) : metric("KNOWN", actionOutcomeMedian, { numerator: outcomeResult.actionToOutcome.length, unit: "MEDIAN_MILLISECONDS" }),
    sampleSize: freeze({ presented: presentationSourceAvailable ? presentations.length : null, decisions: presentationSourceAvailable && decisionSourceAvailable ? latest.length : null, actionLinkageEligibleAccepted: presentationSourceAvailable && decisionSourceAvailable ? eligibleAccepted.length : null, modified: presentationSourceAvailable && decisionSourceAvailable ? modified.length : null, explicitActions: actionSourceAvailable ? actionResult.explicitActions.length : null, actionsWithSubsequentOutcome: outcomeResult.state === "READY" ? outcomeResult.withOutcome.length : null }),
    correlations: freeze({ decisionToAction: freeze([...actionResult.correlations, ...modifiedCorrelations]), actionToOutcome: outcomeResult.correlations, unresolvedDecisions: decisionResult.unresolved }),
    uncertainty: freeze({ state: uncertaintyState, limitations, statisticalCausalityClaim: false, causalAttribution: false }),
    causalAttribution: false,
    forgeCausedSaleClaim: false,
    temporalOnlyCountsAsAction: false,
    humanReviewRequired: true,
  });
}

module.exports = { PILOT_METRIC_DEFINITIONS, compareCommercialLeverage, reconcileDecisionToAction, summarizeCommercialPilotEvidence };
