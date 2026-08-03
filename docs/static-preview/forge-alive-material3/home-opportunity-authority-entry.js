import { createProductiveIntelligenceAdapter } from "./pipeline-productive-intelligence-adapter.js?v=home-live-dashboard-003";

const FACTORY_KEY = "__FORGE_HOME_PRODUCTIVE_OPPORTUNITY_ADAPTER_FACTORY__";
const READY_EVENT = "forge:home-opportunity-authority-ready";

if (typeof createProductiveIntelligenceAdapter !== "function") {
  throw new Error("HOME_PRODUCTIVE_OPPORTUNITY_AUTHORITY_INVALID");
}

globalThis[FACTORY_KEY] = createProductiveIntelligenceAdapter;
globalThis.dispatchEvent(new CustomEvent(READY_EVENT, {
  detail: Object.freeze({ authority: "PRODUCTIVE_PIPELINE_AND_TIMELINE" }),
}));
