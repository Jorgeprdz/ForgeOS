import './canonical-activity-event-contract.js';
import './activity-ledger-contract.js';
import './activity-ledger-local-store.js';
import './activity-ledger-sync-service.js';
import './activity-ledger-supabase-gateway.js';
import './activity-ledger-browser-runtime.js';
import './sales-nba-advisor-response-evidence.js';

function authorities() {
  return {
    runtime: globalThis.ForgeActivityLedgerBrowserRuntimeFES02C,
    evidence: globalThis.ForgeSalesNbaAdvisorResponseEvidence017C,
  };
}

function decisionReference(item) { return String(item?.decisionReference || "").trim(); }
function recommendation(item, advisorId) {
  const id = decisionReference(item);
  if (!id || !advisorId || !item?.sourceAuthority || !item?.sourceDomain) throw new Error("AURA_DECISION_IDENTITY_INCOMPLETE");
  if (item.subject?.type === "ADVISOR" && item.subject?.reference !== advisorId) throw new Error("AURA_DECISION_ADVISOR_MISMATCH");
  return Object.freeze({
    recommendationAvailable: true,
    recommendationId: id,
    advisorId,
    domain: item.sourceDomain,
    sourceAuthority: item.sourceAuthority,
    recommendationVersion: item.recommendationVersion || item.provenance?.decisionProjectionContract || id,
    subjectType: item.subject?.type || "ADVISOR",
    subjectId: item.subject?.reference || advisorId,
    commercialPersonReference: item.commercialPersonReference || item.personReference || null,
    opportunityId: item.opportunityId || null,
    policyReference: item.policyReference || null,
    signalReference: item.signalReference || null,
    paymentObligationReference: item.paymentObligationReference || item.sourceRecordReference || null,
    actionAddressable: item.actionAddressable === true,
    actionOwner: item.actionOwner || null,
    actionTargetType: item.actionTarget?.type || item.actionTargetType || null,
    actionTargetReference: item.actionTarget?.reference || item.actionTargetReference || null,
    expectedAction: item.expectedAction || null,
    smallestUsefulAction: item.smallestUsefulAction || null,
  });
}

export function createAuraDecisionControl({ client, user, globalState, runtime: suppliedRuntime = null, authorityLoader = authorities, clock = () => new Date().toISOString() } = {}) {
  if (!user?.id) throw new Error("AURA_DECISION_AUTHENTICATED_ADVISOR_REQUIRED");
  let runtime = suppliedRuntime;
  let latest = new Map();
  const inFlight = new Map();
  async function ensureRuntime() {
    if (runtime) return runtime;
    const api = await authorityLoader();
    if (!api?.runtime?.create || !api?.evidence?.persistAdvisorDecision) throw new Error("AURA_DECISION_FES_AUTHORITY_UNAVAILABLE");
    runtime = api.runtime.create({ client, tenant_id: user.id, device_id: `aura-017c-${user.id}`, databaseName: "forge-fes02-aura-017c" });
    return runtime;
  }
  async function read() {
    await (await ensureRuntime()).syncOnce();
    const entries = await (await ensureRuntime()).listEntries();
    const decisions = entries.map(entry => entry.canonical_event).filter(event => event?.event_type === "SALES_NBA_ADVISOR_RESPONSE").sort((left, right) => Date.parse(left.recorded_at) - Date.parse(right.recorded_at) || left.event_id.localeCompare(right.event_id));
    latest = new Map(decisions.map(event => [event.payload.recommendation_reference, event]));
    return latest;
  }
  async function decide(item, intent) {
    const map = { ACCEPT: "ACCEPTED", MODIFY: "MODIFIED", DEFER: "SNOOZED", DISMISS: "REJECTED" };
    const response = map[intent];
    if (!response) throw new Error("AURA_DECISION_INTENT_INVALID");
    const ref = decisionReference(item);
    if (!ref) throw new Error("AURA_DECISION_IDENTITY_INCOMPLETE");
    const operationKey = `${ref}:${intent}`;
    if (inFlight.has(operationKey)) return inFlight.get(operationKey);
    const operation = (async () => {
      const existing = latest.get(ref);
      const canonicalDecision = { ACCEPT: "ACCEPTED", MODIFY: "MODIFIED", DEFER: "DEFERRED", DISMISS: "DISMISSED" }[intent];
      if (existing?.payload?.decision === canonicalDecision) return Object.freeze({ event: existing, result: { status: "IDEMPOTENT_REPLAY" }, activityExecuted: false, outcomeCreated: false });
      const now = clock();
      const decisionReferenceId = `decision:${ref}:${intent}:${now}`;
      const api = await authorityLoader();
      if (!api?.evidence?.persistAdvisorDecision) throw new Error("AURA_DECISION_FES_AUTHORITY_UNAVAILABLE");
      const result = await api.evidence.persistAdvisorDecision({ runtime: await ensureRuntime(), recommendation: recommendation(item, user.id), response: { recommendationId: ref, advisorId: user.id, response, respondedAt: now }, decisionReference: decisionReferenceId, correctionOf: existing?.event_id || null, correctionReasonCode: existing ? "ADVISOR_CHANGED_DECISION" : null });
      await (await ensureRuntime()).syncOnce();
      await read();
      globalState?.("Tu decisión quedó guardada.");
      return result;
    })().finally(() => inFlight.delete(operationKey));
    inFlight.set(operationKey, operation);
    return operation;
  }
  return Object.freeze({ read, decide, latest: ref => latest.get(ref) || null, close: async () => runtime?.close?.() });
}
