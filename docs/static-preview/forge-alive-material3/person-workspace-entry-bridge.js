const BRIDGE_VERSION = "CRS-09-PERSON-WORKSPACE-ENTRY-BRIDGE-001";
const INTELLIGENCE_VERSION = "CRS-10-EXISTING-RELATIONSHIP-INTELLIGENCE-001";
const SELECTORS = Object.freeze({
  pipelineCard: "[data-productive-prospect-card]",
  pipelineActions: "[data-productive-card-actions]",
  personDirectoryCard: '[data-directory-kind="COMMERCIAL_PERSON"][data-directory-reference]',
  contextualHeaders: Object.freeze([
    ["quotes", ".quotes-module__header"],
    ["actividad", ".activity-hero"],
    ["cartera", "#cartera-root > .glass-widget:first-child"],
  ]),
});

let intelligenceModulePromise;

function ensureStylesheet() {
  if (!document.querySelector("[data-person-workspace-entry-styles]")) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = new URL("person-workspace-entry-bridge.css?v=crs-09-001", import.meta.url).href;
    link.dataset.personWorkspaceEntryStyles = "true";
    document.head.append(link);
  }
  if (!document.querySelector("[data-person-workspace-stage-compatibility]")) {
    const style = document.createElement("style");
    style.dataset.personWorkspaceStageCompatibility = "true";
    style.textContent = `
      .pipeline-module__productive-card {
        transition-property: box-shadow, opacity !important;
      }
    `;
    document.head.append(style);
  }
}

function button({ personReference = null, sourceType = null, sourceReference = null, compact = false } = {}) {
  const element = document.createElement("button");
  element.type = "button";
  element.className = `person-workspace-launcher${compact ? " person-workspace-launcher--compact" : ""}`;
  element.textContent = compact ? "Persona" : "Abrir persona";
  element.dataset.personWorkspaceLauncher = "true";
  if (personReference) element.dataset.openPersonWorkspacePerson = personReference;
  if (sourceType && sourceReference) {
    element.dataset.openPersonWorkspaceSource = sourceType;
    element.dataset.openPersonWorkspaceReference = sourceReference;
  }
  return element;
}

function injectPipeline() {
  document.querySelectorAll(SELECTORS.pipelineCard).forEach((card) => {
    const actions = card.querySelector(SELECTORS.pipelineActions);
    const reference = card.dataset.productiveProspectCard;
    if (!actions || !reference || actions.querySelector("[data-person-workspace-launcher]")) return;
    actions.prepend(button({ sourceType: "PROSPECT", sourceReference: reference, compact: true }));
  });
}

function injectCartera() {
  document.querySelectorAll(SELECTORS.personDirectoryCard).forEach((card) => {
    const reference = card.dataset.directoryReference;
    if (!reference || card.querySelector("[data-person-workspace-launcher]")) return;
    card.append(button({ personReference: reference }));
  });
}

function injectContextualHeaders() {
  const url = new URL(window.location.href);
  const personReference = url.searchParams.get("person")?.trim();
  const route = document.querySelector("[data-forge-application]")?.dataset.forgeRoute;
  if (!personReference || route === "persona") return;
  const entry = SELECTORS.contextualHeaders.find(([routeId]) => routeId === route);
  if (!entry) return;
  const header = document.querySelector(entry[1]);
  if (!header || header.querySelector("[data-person-workspace-launcher]")) return;
  header.append(button({ personReference, compact: true }));
}

function reconcileEntries() {
  ensureStylesheet();
  injectPipeline();
  injectCartera();
  injectContextualHeaders();
  document.documentElement.dataset.personWorkspaceEntryBridge = BRIDGE_VERSION;
}

function openFromTrigger(trigger) {
  const personReference = trigger.dataset.openPersonWorkspacePerson;
  const sourceType = trigger.dataset.openPersonWorkspaceSource;
  const sourceReference = trigger.dataset.openPersonWorkspaceReference;
  const origin = document.querySelector("[data-forge-application]")?.dataset.forgeRoute || "inicio";
  const detail = personReference
    ? { personReference, origin }
    : { sourceIdentity: { type: sourceType, reference: sourceReference }, origin };
  globalThis.dispatchEvent(new CustomEvent("forge:open-person-workspace", {
    detail: Object.freeze(detail),
  }));
}

function loadIntelligenceModule() {
  intelligenceModulePromise ||= import(
    "./person-intelligence-module.js?v=crs-10-001"
  ).catch((error) => {
    intelligenceModulePromise = null;
    throw error;
  });
  return intelligenceModulePromise;
}

async function mountIntelligence(event) {
  const personReference = event?.detail?.personReference;
  const root = document.querySelector("[data-forge-person-workspace-module]");
  if (!personReference || !root) return;
  document.documentElement.dataset.personIntelligenceRuntime = "preparing";
  try {
    const module = await loadIntelligenceModule();
    await module.mountPersonIntelligence({ root, personReference });
  } catch (error) {
    document.documentElement.dataset.personIntelligenceRuntime = "failed";
    console.error("[CRS10 PERSON INTELLIGENCE BRIDGE]", error);
  }
}

async function scrubIntelligence(reason = "route-unmounted") {
  if (!intelligenceModulePromise) {
    document.documentElement.dataset.personIntelligenceRuntime = reason;
    return;
  }
  try {
    const module = await intelligenceModulePromise;
    module.scrubPersonIntelligence(reason);
  } catch {
    document.documentElement.dataset.personIntelligenceRuntime = reason;
  }
}

function reconcileIntelligenceRoute() {
  const route = document.querySelector("[data-forge-application]")?.dataset.forgeRoute;
  if (route !== "persona") void scrubIntelligence("route-unmounted");
}

ensureStylesheet();

document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-person-workspace-launcher]");
  if (trigger) {
    event.preventDefault();
    openFromTrigger(trigger);
    return;
  }
  if (event.target.closest("[data-route-id]")) {
    window.setTimeout(() => {
      reconcileEntries();
      reconcileIntelligenceRoute();
    }, 0);
  }
}, true);

const observer = new MutationObserver(() => {
  window.clearTimeout(observer.reconcileTimer);
  observer.reconcileTimer = window.setTimeout(() => {
    reconcileEntries();
    reconcileIntelligenceRoute();
  }, 20);
});
observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ["hidden", "data-forge-route", "data-person-reference"],
});

globalThis.addEventListener("popstate", () => {
  reconcileEntries();
  reconcileIntelligenceRoute();
});
globalThis.addEventListener("forge:person-workspace-mounted", (event) => {
  reconcileEntries();
  void mountIntelligence(event);
});
globalThis.addEventListener("forge:auth-state-changed", (event) => {
  const status = String(event.detail?.status || "").toLowerCase();
  if (["anonymous", "auth_error"].includes(status)) void scrubIntelligence("signed-out");
});
queueMicrotask(reconcileEntries);

globalThis.ForgeCrs09PersonWorkspaceEntryBridge = Object.freeze({
  version: BRIDGE_VERSION,
  intelligenceVersion: INTELLIGENCE_VERSION,
  reconcile: reconcileEntries,
  mountIntelligence,
  scrubIntelligence,
});

export {
  BRIDGE_VERSION,
  INTELLIGENCE_VERSION,
  reconcileEntries,
  mountIntelligence,
  scrubIntelligence,
};
