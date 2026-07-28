import "/platform/event-evidence/canonical-activity-event-contract.js";

const canonical =
  globalThis
    .ForgeCanonicalActivityEventContractFES01;

if (!canonical) {
  throw new Error(
    "FES03_CANONICAL_EVENT_CONTRACT_NOT_LOADED",
  );
}

const status = document.querySelector(
  "[data-fes03-preflight-status]",
);

if (!status) {
  throw new Error(
    "FES03_PREFLIGHT_STATUS_NOT_FOUND",
  );
}

const diagnostics = Object.freeze({
  browserRuntime: true,
  viteRootModuleGraph: true,
  canonicalContractLoaded: true,
  indexedDbAvailable:
    typeof indexedDB !== "undefined",
});

globalThis.__FORGE_FES03_PREFLIGHT__ =
  diagnostics;

status.textContent = "READY";
status.dataset.fes03PreflightReady = "true";
