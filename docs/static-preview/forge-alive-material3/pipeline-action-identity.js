import {
  installPipelineAuraLight,
} from "./pipeline-aura-light-2026.js?v=aura-pipeline-001";

const ROOT_SELECTOR = "[data-forge-pipeline-module]";
const INSTALL_KEY = Symbol.for("forge.aura.pipeline.action-identity.v1");

export function installPipelineActionIdentity(options = {}) {
  const documentRef = options.documentRef || globalThis.document;
  if (!documentRef) return Object.freeze({ installed: false });

  const auraAuthority = installPipelineAuraLight(options);
  const root = documentRef.querySelector(ROOT_SELECTOR);
  if (root?.[INSTALL_KEY]) return root[INSTALL_KEY];

  const authority = Object.freeze({
    installed: auraAuthority?.installed === true,
    designAuthority: "FORGE_AURA_LIGHT_2026_V1",
    reapply() {
      auraAuthority?.reconcile?.();
      const activeRoot = documentRef.querySelector(ROOT_SELECTOR);
      if (activeRoot) activeRoot.dataset.pipelineActionIdentity = "aura-light-2026";
      documentRef.documentElement.dataset.pipelineActionIdentity = "aura-light-2026";
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
      auraAuthority?.destroy?.();
      documentRef.querySelector(ROOT_SELECTOR)?.removeAttribute("data-pipeline-action-identity");
      documentRef.documentElement.removeAttribute("data-pipeline-action-identity");
    },
  });

  if (root) {
    root[INSTALL_KEY] = authority;
    root.dataset.pipelineActionIdentity = "aura-light-2026";
  }
  documentRef.documentElement.dataset.pipelineActionIdentity = "aura-light-2026";
  return authority;
}

installPipelineActionIdentity();
