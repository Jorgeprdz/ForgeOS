"use strict";

(function recommendationDecisionActionLineageModule(root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.ForgeRecommendationDecisionActionLineage017E = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function recommendationDecisionActionLineageFactory() {
  function frozen(value) { return Object.freeze(value); }
  function token(value) { const result = String(value || "").trim(); return result || null; }
  function state(value, reason, decisionReference = null) {
    return frozen({ state: value, reason, recommendationDecisionReference: decisionReference, causalAttribution: false });
  }

  function resolveDecisionActionLineage({ context, advisorId, eventType, payload, occurredAt } = {}) {
    if (!context) return state("NO_ELIGIBLE_DECISION", "NO_TRANSPORTED_DECISION");
    const advisor = token(advisorId);
    if (!advisor || token(context.advisorId) !== advisor) return state("UNRESOLVED", "ADVISOR_MISMATCH");
    if (!['ACCEPTED', 'MODIFIED'].includes(token(context.decision))) return state("NO_ELIGIBLE_DECISION", "DECISION_NOT_ELIGIBLE");
    const decisionEventId = token(context.decisionEventId);
    if (!decisionEventId || !/^evt_[a-f0-9]{32}$/.test(decisionEventId)) return state("UNRESOLVED", "DECISION_EVENT_INVALID");
    const decisionAt = Date.parse(context.decisionOccurredAt);
    const actionAt = Date.parse(occurredAt);
    if (Number.isNaN(decisionAt) || Number.isNaN(actionAt)) return state("UNRESOLVED", "EVENT_TIME_INVALID");
    if (actionAt < decisionAt) return state("UNRESOLVED", "ACTION_PRECEDES_DECISION");

    if (eventType !== "CALL_COMPLETED") {
      return state("UNRESOLVED", "ACTION_IDENTITY_NOT_CANONICALLY_COMPARABLE");
    }

    const subjectReference = token(context.subjectReference);
    const actionReference = token(payload?.contact_reference);
    if (!subjectReference || !actionReference || subjectReference !== actionReference) {
      return state("UNRESOLVED", "COMMERCIAL_IDENTITY_MISMATCH");
    }

    const actionTarget = token(context.actionTarget);
    if (actionTarget && actionTarget !== actionReference) {
      return state("UNRESOLVED", "ACTION_TARGET_MISMATCH");
    }

    return state("EXPLICIT_LINEAGE", "VALIDATED_EXPLICIT_DECISION_ACTION_LINEAGE", decisionEventId);
  }

  function payloadWithDecisionLineage(payload, resolution) {
    if (resolution?.state !== "EXPLICIT_LINEAGE" || !resolution.recommendationDecisionReference) return Object.freeze({ ...(payload || {}) });
    return Object.freeze({ ...(payload || {}), recommendation_decision_reference: resolution.recommendationDecisionReference });
  }

  return Object.freeze({ resolveDecisionActionLineage, payloadWithDecisionLineage });
});
