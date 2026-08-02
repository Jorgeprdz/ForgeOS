const ENTRYPOINT_VERSION = "SEGUBECA-PRODUCTIVE-UI-ENTRYPOINT-001.4";
const AUTHORITY = "SEGUBECA_ACCEPTED_PRODUCT_CALCULATION";
const AUTHORITY_VERSION = "SEGUBECA-CALCULATION-AUTHORITY-001.1";

let bindingModule = null;
let bindingPromise = null;
let projectionObserver = null;
let observedProjection = null;
let noteTimer = 0;

function authorityRuntime() {
  return globalThis.ForgeSegubecaProductiveUiBinding || null;
}

function quotesRouteRequested() {
  const nav = String(
    new URLSearchParams(globalThis.location?.search || "").get("nav") || "",
  )
    .trim()
    .toLowerCase();
  return nav === "cotizaciones" || nav === "quotes";
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
  if (!projection) return;
  if (observedProjection === projection) {
    ensureAuthorityNote();
    return;
  }

  projectionObserver?.disconnect();
  observedProjection = projection;
  projectionObserver = new MutationObserver(() => {
    if (
      authorityRuntime()?.getCalculation?.() &&
      !projection.querySelector("[data-segubeca-authority-note]")
    ) {
      ensureAuthorityNote();
    }
  });
  projectionObserver.observe(projection, {
    childList: true,
    subtree: false,
  });
  ensureAuthorityNote();
}

function exposeEntrypoint(installed = false) {
  globalThis.ForgeSegubecaProductiveUiEntrypoint = Object.freeze({
    version: ENTRYPOINT_VERSION,
    bindingVersion: bindingModule?.BINDING_VERSION || null,
    authority: AUTHORITY,
    authorityVersion: AUTHORITY_VERSION,
    bindingLoaded: Boolean(bindingModule),
    installed,
    install,
    ensureAuthorityNote,
  });
}

async function loadBinding() {
  if (bindingModule) return bindingModule;
  if (!bindingPromise) {
    bindingPromise = import(
      "./segubeca-productive-ui-binding.js?v=segubeca-productive-ui-001"
    ).then((module) => {
      bindingModule = module;
      return module;
    });
  }
  return bindingPromise;
}

async function install() {
  const binding = await loadBinding();
  const installed = binding.install();
  observeProjection();
  exposeEntrypoint(installed);
  return installed;
}

globalThis.addEventListener(
  "forge:segubeca-productive-calculation-ready",
  (event) => {
    observeProjection();
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
  () => ensureAuthorityNote(),
);
globalThis.addEventListener("forge:quotes-module-ready", () => {
  void install();
});

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
  ensureAuthorityNote,
  install,
  loadBinding,
  quotesRouteRequested,
};