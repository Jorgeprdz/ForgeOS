import { buildQuoteBenefitSummary } from "./quote-benefit-summary-engine.js";

const api = Object.freeze({ buildQuoteBenefitSummary });

globalThis.__FORGE_QUOTE_BENEFIT_SUMMARY_API__ = api;

if (typeof globalThis.dispatchEvent === "function" && typeof globalThis.CustomEvent === "function") {
  globalThis.dispatchEvent(new CustomEvent("forge:quote-benefit-summary-ready", { detail: api }));
}

export { buildQuoteBenefitSummary };
