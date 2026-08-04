const VERSION = "CARTERA-001B.1";
const CONFIRM_RPC = "forge_cartera001b_confirm_reviewed_quote";
const APPEND_RPC = "forge_cartera001b_append_quote_lifecycle_event";

let explicitProspectContext = null;
let explicitClientProvider = null;

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function freeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(freeze);
  return value;
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (isRecord(value)) {
    const output = {};
    for (const key of Object.keys(value).sort()) output[key] = stableValue(value[key]);
    return output;
  }
  return value;
}

function stableStringify(value) {
  return JSON.stringify(stableValue(value));
}

function slug(value, fallback = "unknown") {
  const normalized = String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
  return normalized || fallback;
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || "").trim(),
  );
}

function dispatch(name, detail) {
  globalThis.dispatchEvent?.(
    new CustomEvent(name, {
      detail: freeze({ version: VERSION, ...detail }),
    }),
  );
}

function readUrlContext() {
  try {
    const url = new URL(globalThis.location?.href || "http://localhost/");
    const contextType = url.searchParams.get("contextType");
    const contextId =
      url.searchParams.get("contextId") ||
      url.searchParams.get("prospectId") ||
      url.searchParams.get("prospect");
    if ((contextType === "prospect" || !contextType) && isUuid(contextId)) {
      return { prospectReference: contextId };
    }
  } catch {}
  return null;
}

function normalizeProspectContext(value) {
  if (!isRecord(value)) return null;
  const prospectReference =
    value.prospectReference || value.prospect_reference || value.prospectId || value.id;
  if (!isUuid(prospectReference)) return null;
  return freeze({
    prospectReference: String(prospectReference).trim(),
    opportunityReference:
      typeof value.opportunityReference === "string" && value.opportunityReference.trim()
        ? value.opportunityReference.trim()
        : null,
    commercialPersonReference:
      typeof value.commercialPersonReference === "string" && value.commercialPersonReference.trim()
        ? value.commercialPersonReference.trim()
        : null,
  });
}

function resolveProspectContext() {
  return (
    normalizeProspectContext(explicitProspectContext) ||
    normalizeProspectContext(globalThis.ForgeQuoteProspectContextCartera001B) ||
    normalizeProspectContext(globalThis.ForgeRouteContext) ||
    normalizeProspectContext(readUrlContext())
  );
}

function setProspectContext(value) {
  explicitProspectContext = normalizeProspectContext(value);
  dispatch("forge:quote-lifecycle-prospect-context", {
    state: explicitProspectContext ? "READY" : "CLEARED",
    prospectReference: explicitProspectContext?.prospectReference || null,
  });
  return explicitProspectContext;
}

function configureClientProvider(provider) {
  if (provider !== null && typeof provider !== "function") {
    throw new TypeError("client provider must be a function or null");
  }
  explicitClientProvider = provider;
}

async function resolveClient() {
  if (explicitClientProvider) return explicitClientProvider();
  const bootstrap = globalThis.ForgeProductiveProspectBootstrap067G17B;
  if (bootstrap?.getClient) return bootstrap.getClient();
  const client = globalThis.supabaseClient || globalThis.ForgeSupabaseClient;
  return client || null;
}

async function sha256(value) {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle || typeof TextEncoder === "undefined") {
    throw new Error("BROWSER_CRYPTO_REQUIRED");
  }
  const bytes = new TextEncoder().encode(stableStringify(value));
  const digest = await subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}

function productReferenceFromSnapshot(snapshot) {
  const accepted = snapshot?.acceptedQuote || {};
  const calculation = snapshot?.calculation || {};
  const productIntelligence = snapshot?.productIntelligence || {};
  const name =
    calculation.product ||
    calculation.productFamily ||
    accepted.product ||
    accepted.productName ||
    accepted.productFamily ||
    accepted.context?.product ||
    accepted.context?.productFamily ||
    productIntelligence.identity?.detected_product_name ||
    productIntelligence.schema?.id ||
    "unknown";
  return `product:${slug(name)}`;
}

function sourceEvidenceFromSnapshot(snapshot, digest) {
  const accepted = snapshot?.acceptedQuote || {};
  const source = isRecord(accepted.source) ? accepted.source : {};
  const candidates = [
    source.pdfSha256,
    source.pdf_sha256,
    accepted.pdfSha256,
    accepted.fileHash,
  ]
    .filter(value => typeof value === "string" && /^[A-Fa-f0-9]{32,128}$/.test(value.trim()))
    .map(value => `document:${value.trim().toLowerCase()}`);
  if (candidates.length) return [...new Set(candidates)].slice(0, 20);
  return [`quote-review:${digest}`];
}

function sourceRecordReference(snapshot, digest) {
  const accepted = snapshot?.acceptedQuote || {};
  const source = isRecord(accepted.source) ? accepted.source : {};
  const raw =
    source.source_record_reference ||
    source.recordReference ||
    accepted.fileName ||
    accepted.extractionVersion ||
    `review-${digest.slice(0, 24)}`;
  return `quote-source:${slug(raw, digest.slice(0, 24))}`.slice(0, 160);
}

function result(status, extra = {}) {
  return freeze({
    status,
    durable: status === "PERSISTED" || status === "IDEMPOTENT_REPLAY",
    ...extra,
  });
}

async function captureReviewedQuoteLifecycle({ reviewSnapshot } = {}) {
  if (!isRecord(reviewSnapshot) || reviewSnapshot.reviewOnly !== true) {
    const blocked = result("BLOCKED_INVALID_REVIEW_SNAPSHOT", {
      code: "REVIEW_SNAPSHOT_REQUIRED",
      message: "La continuidad requiere un snapshot revisado e inmutable.",
    });
    dispatch("forge:quote-lifecycle-persistence-blocked", blocked);
    return blocked;
  }

  const context = resolveProspectContext();
  if (!context) {
    const blocked = result("BLOCKED_IDENTITY_REQUIRED", {
      code: "PROSPECT_IDENTITY_REQUIRED",
      message: "Selecciona un Prospect para guardar la cotización en su historial.",
    });
    dispatch("forge:quote-lifecycle-persistence-blocked", blocked);
    return blocked;
  }

  let digest;
  try {
    digest = await sha256(reviewSnapshot);
  } catch (error) {
    const blocked = result("BLOCKED_DIGEST_UNAVAILABLE", {
      code: error?.message || "BROWSER_CRYPTO_REQUIRED",
      message: "No fue posible crear la huella verificable del snapshot.",
    });
    dispatch("forge:quote-lifecycle-persistence-blocked", blocked);
    return blocked;
  }

  const client = await resolveClient();
  if (!client?.auth?.getUser || !client?.rpc) {
    const pending = result("LOCAL_REVIEW_ONLY", {
      code: "AUTHENTICATED_CLIENT_UNAVAILABLE",
      message: "La cotización quedó confirmada sólo en esta sesión.",
      prospectReference: context.prospectReference,
      snapshotDigest: digest,
    });
    dispatch("forge:quote-lifecycle-persistence-pending", pending);
    return pending;
  }

  const userResponse = await client.auth.getUser();
  if (userResponse?.error || !userResponse?.data?.user?.id) {
    const pending = result("LOCAL_REVIEW_ONLY", {
      code: "AUTH_REQUIRED",
      message: "La cotización quedó confirmada sólo en esta sesión porque no hay sesión autenticada.",
      prospectReference: context.prospectReference,
      snapshotDigest: digest,
    });
    dispatch("forge:quote-lifecycle-persistence-pending", pending);
    return pending;
  }

  const occurredAt = new Date().toISOString();
  const evidenceReferences = sourceEvidenceFromSnapshot(reviewSnapshot, digest);
  const idempotencyKey = `cartera001b:${context.prospectReference}:${digest}`;
  const { data, error } = await client.rpc(CONFIRM_RPC, {
    p_prospect_id: context.prospectReference,
    p_product_reference: productReferenceFromSnapshot(reviewSnapshot),
    p_review_snapshot: reviewSnapshot,
    p_source_record_reference: sourceRecordReference(reviewSnapshot, digest),
    p_source_evidence_references: evidenceReferences,
    p_freshness_metadata: {
      status: "reviewed_current_session",
      capturedAt: occurredAt,
      source: "accepted_quote_review_snapshot",
    },
    p_occurred_at: occurredAt,
    p_idempotency_key: idempotencyKey,
  });

  if (error) {
    const pending = result("PERSISTENCE_PENDING", {
      code: String(error.code || "QUOTE_LIFECYCLE_RPC_ERROR"),
      message: "La cotización quedó confirmada en esta sesión; la continuidad durable quedó pendiente.",
      prospectReference: context.prospectReference,
      snapshotDigest: digest,
    });
    dispatch("forge:quote-lifecycle-persistence-pending", pending);
    return pending;
  }

  const persisted = result(data?.idempotentReplay ? "IDEMPOTENT_REPLAY" : "PERSISTED", {
    quoteReference: data?.quoteReference || null,
    quoteVersionReference: data?.quoteVersionReference || null,
    prospectReference: data?.prospectReference || context.prospectReference,
    productReference: data?.productReference || productReferenceFromSnapshot(reviewSnapshot),
    lifecycleState: data?.lifecycleState || "REVIEWED",
    eventIds: Array.isArray(data?.eventIds) ? data.eventIds : [],
    persistenceReceipt: data?.persistenceReceipt || null,
    snapshotDigest: data?.snapshotDigest || digest,
    idempotencyKey,
  });
  dispatch("forge:quote-lifecycle-persisted", persisted);
  return persisted;
}

async function appendQuoteLifecycleEvent(input = {}) {
  const context = resolveProspectContext();
  const client = await resolveClient();
  if (!context || !client?.auth?.getUser || !client?.rpc) {
    return result("BLOCKED_RUNTIME_UNAVAILABLE", {
      code: !context ? "PROSPECT_IDENTITY_REQUIRED" : "AUTHENTICATED_CLIENT_UNAVAILABLE",
    });
  }
  const { data, error } = await client.rpc(APPEND_RPC, {
    p_quote_reference: input.quoteReference,
    p_quote_version_reference: input.quoteVersionReference,
    p_event_type: input.eventType,
    p_occurred_at: input.occurredAt || new Date().toISOString(),
    p_source_record_reference: input.sourceRecordReference,
    p_evidence_references: input.evidenceReferences,
    p_decision_reason_code: input.decisionReasonCode || null,
    p_application_reference: input.applicationReference || null,
    p_idempotency_key: input.idempotencyKey,
    p_correction_of: input.correctionOf || null,
  });
  if (error) {
    return result("PERSISTENCE_PENDING", {
      code: String(error.code || "QUOTE_LIFECYCLE_RPC_ERROR"),
    });
  }
  const persisted = result(data?.idempotentReplay ? "IDEMPOTENT_REPLAY" : "PERSISTED", data || {});
  dispatch("forge:quote-lifecycle-event-persisted", persisted);
  return persisted;
}


function updateVisibleStatus(captureResult) {
  const status = document?.querySelector?.(
    "[data-material3-quotes-status], .fq-file-status-105dr",
  );
  if (!status || !captureResult) return;
  if (captureResult.durable) {
    status.textContent = "Cotización confirmada y vinculada al Prospect.";
    status.dataset.forgeState = "durable";
    return;
  }
  if (captureResult.status === "BLOCKED_IDENTITY_REQUIRED") {
    status.textContent =
      "Cotización confirmada en esta sesión. Ábrela desde un Prospect para guardarla en su historial.";
    status.dataset.forgeState = "identity-required";
    return;
  }
  status.textContent =
    "Cotización confirmada en esta sesión. La continuidad durable quedó pendiente.";
  status.dataset.forgeState = "persistence-pending";
}

async function captureCurrentAcceptedQuote() {
  const snapshot =
    globalThis.ForgeAcceptedQuoteBridge
      ?.getAcceptedQuoteReviewSnapshot?.() || null;
  const captureResult = await captureReviewedQuoteLifecycle({
    reviewSnapshot: snapshot,
  });
  updateVisibleStatus(captureResult);
  return captureResult;
}

const api = freeze({
  version: VERSION,
  setProspectContext,
  getProspectContext: resolveProspectContext,
  configureClientProvider,
  captureReviewedQuoteLifecycle,
  appendQuoteLifecycleEvent,
  captureCurrentAcceptedQuote,
  diagnostics: () =>
    freeze({
      version: VERSION,
      confirmRpc: CONFIRM_RPC,
      appendRpc: APPEND_RPC,
      automaticIdentityMerge: false,
      orphanQuotePersistenceAllowed: false,
      automaticProspectDecision: false,
      automaticApplicationCreation: false,
      automaticExternalEffects: false,
    }),
});

globalThis.ForgeQuoteLifecycleBrowserBridgeCartera001B = api;

globalThis.addEventListener?.(
  "forge:accepted-quote-confirmed",
  () => {
    queueMicrotask(() => {
      void captureCurrentAcceptedQuote().catch(error => {
        dispatch("forge:quote-lifecycle-persistence-pending", {
          status: "PERSISTENCE_PENDING",
          durable: false,
          code: error?.message || "QUOTE_LIFECYCLE_CAPTURE_FAILED",
        });
      });
    });
  },
);

export {
  VERSION,
  setProspectContext,
  configureClientProvider,
  captureReviewedQuoteLifecycle,
  appendQuoteLifecycleEvent,
  captureCurrentAcceptedQuote,
};
