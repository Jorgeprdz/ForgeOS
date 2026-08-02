const ENTRYPOINT_VERSION = "SEGUBECA-PRODUCTIVE-UI-ENTRYPOINT-001.16";
const AUTHORITY = "SEGUBECA_ACCEPTED_PRODUCT_CALCULATION";
const AUTHORITY_VERSION = "SEGUBECA-CALCULATION-AUTHORITY-001.1";

let bindingModule = null;
let bindingPromise = null;
let layoutModule = null;
let layoutPromise = null;
let projectionObserver = null;
let observedProjection = null;
let noteTimer = 0;

function authorityRuntime() {
  return globalThis.ForgeSegubecaProductiveUiBinding || null;
}

function layoutRuntime() {
  return globalThis.ForgeSegubecaProgressiveLayout || null;
}

function quotesRouteRequested() {
  const nav = String(
    new URLSearchParams(globalThis.location?.search || "").get("nav") || "",
  )
    .trim()
    .toLowerCase();
  return nav === "cotizaciones" || nav === "quotes";
}

async function confirmHumanSegubeca() {
  const runtime = authorityRuntime();
  if (!runtime?.confirmCurrentQuoteCandidate) {
    throw new Error("SEGUBECA_HUMAN_CONFIRMATION_RUNTIME_REQUIRED");
  }

  const snapshot = await runtime.confirmCurrentQuoteCandidate();
  if (!snapshot) {
    throw new Error("SEGUBECA_ACCEPTED_REVIEW_SNAPSHOT_REQUIRED");
  }

  const root = document.querySelector("[data-forge-quotes-module]");
  if (root) root.dataset.quoteAccepted = "true";
  return snapshot;
}

function ensureAcceptanceDelegate() {
  const runtime = authorityRuntime();
  if (!runtime) return false;

  const existing = globalThis.ForgeQuoteAcceptanceEntrypointR16J0A || {};
  if (existing.confirm === confirmHumanSegubeca) return true;

  globalThis.ForgeQuoteAcceptanceEntrypointR16J0A = Object.freeze({
    ...existing,
    version: `${ENTRYPOINT_VERSION}-HUMAN-CONFIRMATION-DELEGATE`,
    authority: AUTHORITY,
    authorityVersion: AUTHORITY_VERSION,
    automaticConfirmationAllowed: false,
    automaticDownloadAllowed: false,
    quoteMutationAllowed: false,
    crmMutationAllowed: false,
    confirm: confirmHumanSegubeca,
    getSnapshot() {
      return runtime.getAcceptedQuoteReviewSnapshot?.()
        || existing.getSnapshot?.()
        || null;
    },
  });
  document.documentElement.dataset.segubecaAcceptanceDelegate = "ready";
  return true;
}

function ensureAuthorityNote() {
  const runtime = authorityRuntime();
  const calculation = runtime?.getCalculation?.();
  const projection = document.querySelector("[data-material3-quotes-projection]");
  if (!calculation || !projection) return false;

  projection.dataset.segubecaCalculationAuthority = AUTHORITY;
  projection.dataset.segubecaCalculationAuthorityVersion = AUTHORITY_VERSION;

  let note = projection.querySelector("[data-segubeca-authority-note]");
  if (!note) {
    note = document.createElement("aside");
    note.className = "segubeca-authority-note";
    note.dataset.segubecaAuthorityNote = "true";
    note.setAttribute("role", "note");
    projection.prepend(note);
  }

  const projectionStatus = runtime?.getAuthorityResult?.()?.projection?.status;
  note.innerHTML = `
    <strong>SeguBeca · lectura comercial gobernada</strong>
    <span>Valores contractuales tomados del PDF de Solución Online.</span>
    <span>Equivalencias futuras en MXN con escenario UDI de 4.5% anual; no son garantía.</span>
    ${projectionStatus === "BLOCKED_NO_VERIFIED_UDI_RATE"
      ? "<span>No hay una UDI verificada disponible; las equivalencias MXN permanecen bloqueadas.</span>"
      : ""}
  `;
  layoutRuntime()?.schedule?.("authority-note-ready");
  return true;
}

function scheduleAuthorityNote(delay = 0) {
  globalThis.clearTimeout(noteTimer);
  noteTimer = globalThis.setTimeout(() => {
    ensureAuthorityNote();
  }, delay);
}

function observeProjection() {
  const projection = document.querySelector("[data-material3-quotes-projection]");
  if (!projection) return false;
  if (observedProjection === projection && projectionObserver) {
    ensureAuthorityNote();
    ensureAcceptanceDelegate();
    layoutRuntime()?.schedule?.("projection-reused");
    return true;
  }

  projectionObserver?.disconnect();
  observedProjection = projection;
  projectionObserver = new MutationObserver(() => {
    if (
      authorityRuntime()?.getCalculation?.()
      && !projection.querySelector("[data-segubeca-authority-note]")
    ) {
      ensureAuthorityNote();
    }
    ensureAcceptanceDelegate();
    layoutRuntime()?.schedule?.("entrypoint-projection-mutated");
  });
  projectionObserver.observe(projection, {
    childList: true,
    subtree: false,
  });
  ensureAuthorityNote();
  ensureAcceptanceDelegate();
  layoutRuntime()?.schedule?.("projection-observed");
  return true;
}

function exposeEntrypoint(installed = false) {
  globalThis.ForgeSegubecaProductiveUiEntrypoint = Object.freeze({
    version: ENTRYPOINT_VERSION,
    bindingVersion: bindingModule?.BINDING_VERSION || null,
    layoutVersion: layoutModule?.VERSION || null,
    authority: AUTHORITY,
    authorityVersion: AUTHORITY_VERSION,
    bindingLoaded: Boolean(bindingModule),
    layoutLoaded: Boolean(layoutModule),
    installed,
    install,
    confirmHumanSegubeca,
    ensureAcceptanceDelegate,
    ensureAuthorityNote,
  });
}

async function loadBinding() {
  if (bindingModule) return bindingModule;
  if (!bindingPromise) {
    bindingPromise = import(
      "./segubeca-productive-ui-binding.js?v=segubeca-productive-ui-001-4"
    ).then((module) => {
      bindingModule = module;
      return module;
    });
  }
  return bindingPromise;
}

async function loadLayout() {
  if (layoutModule) return layoutModule;
  if (!layoutPromise) {
    layoutPromise = import(
      "./segubeca-progressive-layout.js?v=segubeca-progressive-layout-001"
    ).then((module) => {
      layoutModule = module;
      return module;
    });
  }
  return layoutPromise;
}

async function install() {
  const [binding, layout] = await Promise.all([
    loadBinding(),
    loadLayout(),
  ]);
  const bindingInstalled = binding.install();
  const layoutInstalled = layout.install();
  ensureAcceptanceDelegate();
  observeProjection();
  layout.schedule?.("entrypoint-installed");
  const installed = Boolean(bindingInstalled && layoutInstalled);
  exposeEntrypoint(installed);
  return installed;
}

globalThis.addEventListener(
  "forge:segubeca-productive-calculation-ready",
  (event) => {
    ensureAcceptanceDelegate();
    observeProjection();
    layoutRuntime()?.schedule?.("segubeca-calculation-ready");
    globalThis.dispatchEvent(new CustomEvent(
      "forge:quote-preview-calculated",
      {
        detail: Object.freeze({
          version: ENTRYPOINT_VERSION,
          authority: event.detail?.authority || AUTHORITY,
          authorityVersion:
            event.detail?.authorityVersion || AUTHORITY_VERSION,
          automatic: true,
          accepted: false,
          humanConfirmationRequired: true,
        }),
      },
    ));
    scheduleAuthorityNote(220);
  },
);

globalThis.addEventListener(
  "forge:segubeca-productive-quote-confirmed",
  () => {
    ensureAcceptanceDelegate();
    ensureAuthorityNote();
    layoutRuntime()?.schedule?.("segubeca-quote-confirmed");
  },
);

globalThis.addEventListener("forge:quote-preview-calculated", () => {
  if (authorityRuntime()?.getCalculation?.()) {
    ensureAcceptanceDelegate();
  }
});

globalThis.addEventListener("forge:quotes-module-ready", () => {
  void install();
});

globalThis.addEventListener(
  "click",
  (event) => {
    const button = event.target?.closest?.(
      '[data-quote-next-action="confirm_quote"]',
    );
    const projection = document.querySelector(
      "[data-material3-quotes-projection]",
    );
    if (!button || projection?.dataset?.productDashboard !== "segubeca") return;

    ensureAcceptanceDelegate();
    button.dataset.segubecaHumanConfirmationCapture = "pending";
    void confirmHumanSegubeca()
      .then((snapshot) => {
        if (!snapshot) {
          throw new Error("SEGUBECA_ACCEPTED_REVIEW_SNAPSHOT_REQUIRED");
        }
        button.dataset.segubecaHumanConfirmationCapture = "confirmed";
      })
      .catch((error) => {
        button.dataset.segubecaHumanConfirmationCapture = "error";
        button.dataset.segubecaHumanConfirmationError =
          error?.message || String(error);
      });
  },
  true,
);

exposeEntrypoint(false);

if (quotesRouteRequested()) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => void install(), {
      once: true,
    });
  } else {
    queueMicrotask(() => void install());
  }
}

export {
  AUTHORITY,
  AUTHORITY_VERSION,
  ENTRYPOINT_VERSION,
  confirmHumanSegubeca,
  ensureAcceptanceDelegate,
  ensureAuthorityNote,
  install,
  loadBinding,
  loadLayout,
  quotesRouteRequested,
};
