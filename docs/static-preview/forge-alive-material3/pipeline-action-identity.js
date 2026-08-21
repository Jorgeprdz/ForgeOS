const DESIGN_AUTHORITY = "FORGE_AURA_LIGHT_2026_V1";

export function installPipelineActionIdentity({ documentRef = globalThis.document } = {}) {
  if (!documentRef) return Object.freeze({ installed: false });
  documentRef.documentElement.dataset.pipelineActionIdentity = "aura-native";
  documentRef.documentElement.dataset.pipelineActionDesignAuthority = "aura-light-2026";
  return Object.freeze({
    installed: true,
    designAuthority: DESIGN_AUTHORITY,
    nativeRenderer: true,
    material3DesignUsed: false,
    reapply() {},
    destroy() {
      documentRef.documentElement.removeAttribute("data-pipeline-action-identity");
      documentRef.documentElement.removeAttribute("data-pipeline-action-design-authority");
    },
  });
}

installPipelineActionIdentity();
