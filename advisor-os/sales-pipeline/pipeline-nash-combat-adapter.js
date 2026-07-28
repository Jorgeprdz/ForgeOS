"use strict";

(function forgePipelineNashCombatAdapterFES08B(global) {
  const VERSION = "FES-08B.1";
  const REVIEW_SCHEMA = "forge.pipeline_nash_combat_review_candidate.v1";
  const SOURCE_BLOB_SHA = "b836cf8b33cb3a6dbb46eff4c056e38f588d6401";
  const SOURCE_PATH = "/ForgeOS/nash-combat-orchestrator.js";
  const SOURCE_SRI = "sha256-Q9jy8S3ni33kNNfY75sS0bnXGVY2RqIKPt9IVqytB10=";
  const EXPORTS = Object.freeze([
    "classifyObjection",
    "diagnoseObjection",
    "buildObjectionResponse",
    "buildNextMove",
    "runNashCombat",
  ]);
  let loadingPromise = null;
  let capturedApi = null;

  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
    return value;
  }

  function opaque(value, label) {
    const result = String(value || "").trim();
    if (!result || result.length > 240 || !/^[A-Za-z0-9._:@/-]+$/.test(result)) {
      throw new TypeError(`${label}_INVALID`);
    }
    return result;
  }

  function fixedSourceUrl(location = global.location) {
    const url = new URL(SOURCE_PATH, location.origin);
    if (url.origin !== location.origin || !url.pathname.endsWith(SOURCE_PATH)) {
      throw new Error("NASH_COMBAT_SOURCE_URL_INVALID");
    }
    return url.href;
  }

  function unavailable(code) {
    return deepFreeze({
      state: "UNAVAILABLE",
      code,
      candidate: null,
      sendsMessage: false,
      changesPipelineStage: false,
      writesPerformance: false,
    });
  }

  function captureFromIsolatedRealm({ document = global.document, timeoutMs = 8000 } = {}) {
    if (capturedApi) return Promise.resolve(capturedApi);
    if (loadingPromise) return loadingPromise;
    loadingPromise = new Promise(resolve => {
      const iframe = document.createElement("iframe");
      iframe.hidden = true;
      iframe.tabIndex = -1;
      iframe.setAttribute("aria-hidden", "true");
      iframe.dataset.forgeNashCombatLoader = VERSION;
      let settled = false;
      const finish = result => {
        if (settled) return;
        settled = true;
        global.clearTimeout(timeout);
        iframe.remove();
        loadingPromise = null;
        resolve(result);
      };
      const timeout = global.setTimeout(() => finish(unavailable("NASH_COMBAT_LOAD_TIMEOUT")), timeoutMs);
      iframe.addEventListener("load", () => {
        try {
          const realm = iframe.contentWindow;
          const realmDocument = iframe.contentDocument;
          realm.module = { exports: {} };
          realm.exports = realm.module.exports;
          const script = realmDocument.createElement("script");
          script.src = fixedSourceUrl();
          script.integrity = SOURCE_SRI;
          script.crossOrigin = "anonymous";
          script.addEventListener("error", () => finish(unavailable("NASH_COMBAT_SOURCE_INTEGRITY_OR_LOAD_FAILED")), { once: true });
          script.addEventListener("load", () => {
            try {
              const exports = realm.module?.exports;
              if (!exports || EXPORTS.some(name => typeof exports[name] !== "function")) {
                finish(unavailable("NASH_COMBAT_EXPORTS_INVALID"));
                return;
              }
              capturedApi = Object.freeze(Object.fromEntries(EXPORTS.map(name => [name, exports[name]])));
              finish(capturedApi);
            } catch (_error) {
              finish(unavailable("NASH_COMBAT_CAPTURE_FAILED"));
            }
          }, { once: true });
          realmDocument.head.append(script);
        } catch (_error) {
          finish(unavailable("NASH_COMBAT_REALM_FAILED"));
        }
      }, { once: true });
      document.body.append(iframe);
    });
    return loadingPromise;
  }

  async function analyzeObjectionForHumanReview({
    objection,
    approvedDisplayName,
    prospectReference,
    flowReference,
    locale = "es-MX",
    requestId,
  } = {}) {
    const privateObjection = String(objection || "").trim();
    if (!privateObjection || privateObjection.length > 2000) throw new TypeError("PRIVATE_OBJECTION_INVALID");
    const name = String(approvedDisplayName || "").trim();
    if (!name || name.length > 160) throw new TypeError("APPROVED_DISPLAY_NAME_INVALID");
    const prospect = opaque(prospectReference, "PROSPECT_REFERENCE");
    const flow = opaque(flowReference, "FLOW_REFERENCE");
    const request = opaque(requestId, "REQUEST_ID");
    if (locale !== "es-MX") throw new TypeError("NASH_COMBAT_LOCALE_UNSUPPORTED");
    const engine = await captureFromIsolatedRealm();
    if (engine?.state === "UNAVAILABLE") return engine;
    const legacy = engine.runNashCombat({
      objection: privateObjection,
      context: { name },
      personality: {},
    });
    if (!legacy || legacy.engine !== "NASH_COMBAT_SYSTEM") return unavailable("NASH_COMBAT_RESULT_INVALID");
    return deepFreeze({
      schemaVersion: REVIEW_SCHEMA,
      requestId: request,
      source: {
        engine: "NASH_COMBAT_SYSTEM",
        version: String(legacy.version || ""),
        sourceBlobSha: SOURCE_BLOB_SHA,
      },
      prospectReference: prospect,
      flowReference: flow,
      candidate: {
        objectionTypeCandidate: String(legacy.type || "UNKNOWN"),
        diagnosisCandidate: String(legacy.diagnosis || ""),
        responseDraft: String(legacy.response || ""),
        nextMoveContext: String(legacy.nextMove || ""),
        riskContext: String(legacy.risk || ""),
        goalContext: String(legacy.goal || ""),
      },
      authority: {
        candidateOnly: true,
        prospectIntentTruth: false,
        sendsMessage: false,
        changesPipelineStage: false,
        writesActivityDirectly: false,
        humanReviewRequired: true,
      },
    });
  }

  function createPipelineNashCombatAdapter(options = {}) {
    return Object.freeze({
      version: VERSION,
      analyzeObjectionForHumanReview: input => analyzeObjectionForHumanReview({ ...options, ...input }),
      diagnostics: () => deepFreeze({
        version: VERSION,
        sourcePath: SOURCE_PATH,
        sourceBlobSha: SOURCE_BLOB_SHA,
        integrity: SOURCE_SRI,
        fixedSameOriginSource: true,
        isolatedRealm: true,
        legacyLogicDuplicated: false,
      }),
    });
  }

  const api = Object.freeze({
    VERSION,
    REVIEW_SCHEMA,
    SOURCE_BLOB_SHA,
    SOURCE_PATH,
    SOURCE_SRI,
    EXPORTS,
    fixedSourceUrl,
    captureFromIsolatedRealm,
    analyzeObjectionForHumanReview,
    createPipelineNashCombatAdapter,
  });
  global.ForgePipelineNashCombatAdapterFES08B = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : window);
