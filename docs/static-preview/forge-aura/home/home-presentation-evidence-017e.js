const FES_BASE = "../../../platform/event-evidence/";
let authorityPromise;

async function authorities() {
  if (!authorityPromise) authorityPromise = (async () => {
    for (const file of [
      "canonical-activity-event-contract.js", "activity-ledger-contract.js",
      "activity-ledger-local-store.js", "activity-ledger-sync-service.js",
      "activity-ledger-supabase-gateway.js", "activity-ledger-browser-runtime.js",
      "recommendation-presentation-evidence.js",
    ]) await import(`${FES_BASE}${file}?v=forge-commercial-pilot-evidence-017e`);
    return {
      runtime: globalThis.ForgeActivityLedgerBrowserRuntimeFES02C,
      evidence: globalThis.ForgeRecommendationPresentationEvidence017E,
    };
  })();
  return authorityPromise;
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
    recommendationVersion: item.provenance?.decisionProjectionContract || "FCDP-004-001",
    subjectType: item.subject?.type || "ADVISOR",
    subjectId: item.subject?.reference || advisorId,
  });
}

export function createAuraPresentationEvidenceControl({
  client,
  user,
  runtime: suppliedRuntime = null,
  authorityLoader = authorities,
  clock = () => new Date().toISOString(),
} = {}) {
  if (!user?.id) throw new Error("AURA_PRESENTATION_AUTHENTICATED_ADVISOR_REQUIRED");
  let runtime = suppliedRuntime;
  const inFlight = new Map();

  async function ensureRuntime() {
    if (runtime) return runtime;
    const api = await authorityLoader();
    runtime = api.runtime.create({
      client,
      tenant_id: user.id,
      device_id: `aura-017e-${user.id}`,
      databaseName: "forge-fes02-aura-017c",
    });
    return runtime;
  }

  async function existingPresentation(identity) {
    const entries = await (await ensureRuntime()).listEntries();
    return entries
      .map(entry => entry.canonical_event)
      .find(event => event?.event_type === "RECOMMENDATION_PRESENTED" && event.idempotency_key === identity) || null;
  }

  function replay(event) {
    return Object.freeze({
      event,
      result: Object.freeze({ status: "IDEMPOTENT_REPLAY" }),
      recommendationPresented: true,
      recommendationViewed: false,
      activityExecuted: false,
      outcomeCreated: false,
    });
  }

  async function present(item, { presentationSurface = "AURA_HOME", presentedAt = null } = {}) {
    const ref = decisionReference(item);
    if (!ref) throw new Error("AURA_PRESENTATION_IDENTITY_INCOMPLETE");
    if (inFlight.has(ref)) return inFlight.get(ref);
    const operation = (async () => {
      const api = await authorityLoader();
      const recommendationInput = recommendation(item, user.id);
      const identity = api.evidence.presentationIdentity({
        advisorId: recommendationInput.advisorId,
        recommendationId: recommendationInput.recommendationId,
        recommendationVersion: recommendationInput.recommendationVersion,
      });

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
      const result = await api.evidence.persistRecommendationPresentation({
        runtime: await ensureRuntime(),
        recommendation: recommendationInput,
        presentedAt: when,
        recordedAt: when,
        presentationSurface,
      });
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
