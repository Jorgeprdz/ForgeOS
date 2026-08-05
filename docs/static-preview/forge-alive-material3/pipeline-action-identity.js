import {
  installPipelineAuraLight,
} from "./pipeline-aura-light-2026.js?v=aura-pipeline-001";

const ROOT_SELECTOR = "[data-forge-pipeline-module]";
const INSTALL_KEY = Symbol.for("forge.aura.pipeline.action-identity.v1");

function stabilizeTimelineAction(documentRef) {
  const apply = () => {
    documentRef.querySelectorAll(
      `${ROOT_SELECTOR} [data-view-productive-context][data-aura-quick-action="timeline"]`,
    ).forEach(action => {
      const name = action.closest("[data-productive-prospect-card]")
        ?.querySelector("[data-productive-card-identity] strong")
        ?.textContent
        ?.trim() || "este prospecto";
      const label = action.querySelector(":scope > .aura-pipeline__sr-only");
      if (label && label.textContent !== "Bitácora") label.textContent = "Bitácora";
      action.setAttribute("aria-label", `Abrir Timeline de ${name}`);
      action.setAttribute("title", "Timeline y bitácora");
    });
  };

  const observer = new MutationObserver(apply);
  observer.observe(documentRef.documentElement, { childList: true, subtree: true });
  apply();
  return observer;
}

export function installPipelineActionIdentity(options = {}) {
  const documentRef = options.documentRef || globalThis.document;
  if (!documentRef) return Object.freeze({ installed: false });

  const auraAuthority = installPipelineAuraLight(options);
  const root = documentRef.querySelector(ROOT_SELECTOR);
  if (root?.[INSTALL_KEY]) return root[INSTALL_KEY];
  const timelineObserver = stabilizeTimelineAction(documentRef);

  const authority = Object.freeze({
    installed: auraAuthority?.installed === true,
    designAuthority: "FORGE_AURA_LIGHT_2026_V1",
    reapply() {
      auraAuthority?.reconcile?.();
      const activeRoot = documentRef.querySelector(ROOT_SELECTOR);
      if (activeRoot) activeRoot.dataset.pipelineActionIdentity = "ready";
      documentRef.documentElement.dataset.pipelineActionIdentity = "ready";
      documentRef.documentElement.dataset.pipelineActionDesignAuthority = "aura-light-2026";
    },
    diagnostics() {
      return Object.freeze({
        installed: auraAuthority?.installed === true,
        designAuthority: "FORGE_AURA_LIGHT_2026_V1",
        material3DesignUsed: false,
        visibleActions: Object.freeze(["whatsapp", "call", "timeline", "more"]),
      });
    },
    destroy() {
      timelineObserver.disconnect();
      auraAuthority?.destroy?.();
      documentRef.querySelector(ROOT_SELECTOR)?.removeAttribute("data-pipeline-action-identity");
      documentRef.documentElement.removeAttribute("data-pipeline-action-identity");
      documentRef.documentElement.removeAttribute("data-pipeline-action-design-authority");
    },
  });

  if (root) {
    root[INSTALL_KEY] = authority;
    root.dataset.pipelineActionIdentity = "ready";
  }
  documentRef.documentElement.dataset.pipelineActionIdentity = "ready";
  documentRef.documentElement.dataset.pipelineActionDesignAuthority = "aura-light-2026";
  return authority;
}

installPipelineActionIdentity();
