"use strict";

function fail(code) { const error = new TypeError(code); error.code = code; throw error; }
function duration(period) { return Date.parse(period.to) - Date.parse(period.from); }
function ratio(value) { return value === null ? null : Number(value.toFixed(12)); }

function compareCommercialLeverage({ baseline, current, inputStage = "CONTACT" } = {}) {
  if (baseline?.schema !== "COMMERCIAL_FUNNEL_RECONCILIATION_READ_MODEL_017B" || current?.schema !== baseline.schema) fail("FUNNEL_MODELS_REQUIRED");
  if (baseline.advisorId !== current.advisorId) fail("ADVISOR_MISMATCH");
  const bInput = baseline.stages[inputStage], cInput = current.stages[inputStage];
  const bOutput = baseline.stages.CONFIRMED_POLICY, cOutput = current.stages.CONFIRMED_POLICY;
  const complete = [bInput, cInput, bOutput, cOutput].every(metric => metric?.coverage === "COMPLETE");
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
  if (!actionEvent) return Object.freeze({ state: "NO_OBSERVABLE_ACTION", action: null, causalAttribution: false });
  if (actionEvent.tenant_id !== decisionEvent.tenant_id) fail("CROSS_ADVISOR_ACTION_BLOCKED");
  if (Date.parse(actionEvent.occurred_at) < Date.parse(decisionEvent.occurred_at)) fail("ACTION_PRECEDES_DECISION");
  const explicit = actionEvent.causation_id === decisionEvent.event_id || actionEvent.correlation_id === decisionEvent.event_id || actionEvent.payload?.recommendation_decision_reference === decisionEvent.event_id;
  if (!explicit) return Object.freeze({ state: "TEMPORAL_ASSOCIATION_ONLY", action: null, causalAttribution: false });
  return Object.freeze({ state: "EXPLICITLY_LINKED_LATER_ACTION", action: actionEvent, causalAttribution: false });
}

module.exports = { compareCommercialLeverage, reconcileDecisionToAction };
