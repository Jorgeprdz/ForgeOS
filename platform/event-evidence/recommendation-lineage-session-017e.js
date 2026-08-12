let pending = null;

function token(value) {
  const normalized = String(value || "").trim();
  return normalized || null;
}

function freeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(freeze);
  return value;
}

export function setRecommendationDecisionLineage(context = null) {
  if (!context) {
    pending = null;
    return null;
  }
  const advisorId = token(context.advisorId);
  const recommendationReference = token(context.recommendationReference);
  const decisionEventId = token(context.decisionEventId);
  const decisionOccurredAt = token(context.decisionOccurredAt);
  const decision = token(context.decision);
  if (!advisorId || !recommendationReference || !decisionEventId || !decisionOccurredAt) throw new Error("AURA_017E_LINEAGE_CONTEXT_INCOMPLETE");
  if (!/^evt_[a-f0-9]{32}$/.test(decisionEventId)) throw new Error("AURA_017E_LINEAGE_DECISION_EVENT_INVALID");
  if (decision !== "ACCEPTED") throw new Error("AURA_017E_LINEAGE_DECISION_NOT_ELIGIBLE");
  if (Number.isNaN(Date.parse(decisionOccurredAt))) throw new Error("AURA_017E_LINEAGE_DECISION_TIME_INVALID");
  pending = freeze({
    advisorId,
    recommendationReference,
    recommendationVersion: token(context.recommendationVersion),
    decisionEventId,
    decisionOccurredAt: new Date(decisionOccurredAt).toISOString(),
    decision,
    subjectType: token(context.subjectType),
    subjectReference: token(context.subjectReference),
    actionOwner: token(context.actionOwner),
    actionTarget: token(context.actionTarget),
  });
  return pending;
}

export function recommendationDecisionLineageFor(advisorId) {
  const advisor = token(advisorId);
  if (!pending || !advisor || pending.advisorId !== advisor) return null;
  return pending;
}

export function consumeRecommendationDecisionLineage({ advisorId, decisionEventId } = {}) {
  const current = recommendationDecisionLineageFor(advisorId);
  if (!current || current.decisionEventId !== token(decisionEventId)) return false;
  pending = null;
  return true;
}

export function clearRecommendationDecisionLineage(advisorId = null) {
  if (!pending) return false;
  const advisor = token(advisorId);
  if (advisor && pending.advisorId !== advisor) return false;
  pending = null;
  return true;
}

globalThis.addEventListener?.("aura:advisor-switch-scrub", () => {
  pending = null;
});
