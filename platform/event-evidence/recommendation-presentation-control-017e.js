import './canonical-activity-event-contract.js';
import './activity-ledger-contract.js';
import './activity-ledger-local-store.js';
import './activity-ledger-sync-service.js';
import './activity-ledger-supabase-gateway.js';
import './activity-ledger-browser-runtime.js';
import './recommendation-presentation-evidence.js';

function authorities() {
  return {
    runtime: globalThis.ForgeActivityLedgerBrowserRuntimeFES02C,
    evidence: globalThis.ForgeRecommendationPresentationEvidence017E,
  };
}

function decisionReference(item) { return String(item?.decisionReference || "").trim(); }

function recommendation(item, advisorId) {
  const id = decisionReference(item);
  if (!id || !advisorId || !item?.sourceAuthority || !item?.sourceDomain) throw new Error("AURA_PRESENTATION_IDENTITY_INCOMPLETE");
  if (item.subject?.type === "ADVISOR" && item.subject?.reference !== advisorId) throw new Error("AURA_PRESENTATION_ADVISOR_MISMATCH");
  return Object.freeze({
    recommendationAvailable: true,
    recommendationId: id,
    advisorId,
    domain: item.sourceDomain,
    sourceAuthority: item.sourceAuthority,
    recommendationVersion: item.recommendationVersion || item.provenance?.recommendationVersion || null,
    subjectType: item.subject?.type || "ADVISOR",
    subjectId: item.subject?.reference || advisorId,
  });
}

export function createAuraPresentationEvidenceControl({ client, user, runtime: suppliedRuntime = null, authorityLoader = authorities, clock = () => new Date().toISOString() } = {}) {
  if (!user?.id) throw new Error("AURA_PRESENTATION_AUTHENTICATED_ADVISOR_REQUIRED");
  let runtime = suppliedRuntime;
  const inFlight = new Map();

  async function ensureRuntime() {
    if (runtime) return runtime;
    const api = await authorityLoader();
    if (!api?.runtime?.create || !api?.evidence?.persistRecommendationPresentation) throw new Error("AURA_PRESENTATION_FES_AUTHORITY_UNAVAILABLE");
    runtime = api.runtime.create({ client, tenant_id: user.id, device_id: `aura-017e-${user.id}`, databaseName: "forge-fes02-aura-017c" });
    return runtime;
  }

  async function existingPresentation(identity) {
    const entries = await (await ensureRuntime()).listEntries();
    return entries.map(entry => entry.canonical_event).find(event => event?.event_type === "RECOMMENDATION_PRESENTED" && event.idempotency_key === identity) || null;
  }

  function replay(event) {
    return Object.freeze({ event, result: Object.freeze({ status: "IDEMPOTENT_REPLAY" }), recommendationPresented: true, recommendationViewed: false, activityExecuted: false, outcomeCreated: false });
  }

  async function present(item, { presentationSurface = "AURA_HOME", presentedAt = null } = {}) {
    const ref = decisionReference(item);
    if (!ref) throw new Error("AURA_PRESENTATION_IDENTITY_INCOMPLETE");
    if (inFlight.has(ref)) return inFlight.get(ref);
    const operation = (async () => {
      const api = await authorityLoader();
      if (!api?.evidence?.presentationIdentity || !api?.evidence?.persistRecommendationPresentation) throw new Error("AURA_PRESENTATION_FES_AUTHORITY_UNAVAILABLE");
      const recommendationInput = recommendation(item, user.id);
      const identity = api.evidence.presentationIdentity({ advisorId: recommendationInput.advisorId, recommendationId: recommendationInput.recommendationId, recommendationVersion: recommendationInput.recommendationVersion });
      const local = await existingPresentation(identity);
      if (local) return replay(local);
      try {
        await (await ensureRuntime()).syncOnce();
      } catch (error) {
        const unavailable = new Error("AURA_PRESENTATION_CANONICAL_STATE_UNAVAILABLE");
        unavailable.code = "AURA_PRESENTATION_CANONICAL_STATE_UNAVAILABLE";
        unavailable.cause = error;
        throw unavailable;
      }
      const synced = await existingPresentation(identity);
      if (synced) return replay(synced);
      const when = presentedAt || clock();
      const result = await api.evidence.persistRecommendationPresentation({ runtime: await ensureRuntime(), recommendation: recommendationInput, presentedAt: when, recordedAt: when, presentationSurface });
      try {
        await (await ensureRuntime()).syncOnce();
        return result;
      } catch (error) {
        return Object.freeze({ ...result, syncState: "PENDING", syncErrorCode: error?.code || error?.message || "FES_SYNC_FAILED" });
      }
    })().finally(() => inFlight.delete(ref));
    inFlight.set(ref, operation);
    return operation;
  }

  async function presentAll(items, options = {}) {
    const unique = new Map();
    for (const item of Array.isArray(items) ? items : []) {
      const ref = decisionReference(item);
      if (ref && !unique.has(ref)) unique.set(ref, item);
    }
    const results = [];
    for (const item of unique.values()) results.push(await present(item, options));
    return Object.freeze(results);
  }

  return Object.freeze({ present, presentAll, close: async () => runtime?.close?.() });
}
