"use strict";

const LEGACY_ASSET_DISPOSITIONS = Object.freeze({
  REUSE_AS_IS: "REUSE_AS_IS",
  REUSE_AFTER_VALIDATION: "REUSE_AFTER_VALIDATION",
  REWRITE: "REWRITE",
  RETIRE: "RETIRE"
});

const LEGACY_ASSET_INVENTORY_VERSION = "ADVISOR_COMPENSATION_LEGACY_ASSET_INVENTORY_001";

const LEGACY_ASSET_INVENTORY = Object.freeze([
  Object.freeze({ assetId: "life-rate-tables", source: "comisiones.js:TASAS_VIDA", disposition: LEGACY_ASSET_DISPOSITIONS.REUSE_AFTER_VALIDATION, targetStage: "020", reason: "Candidate product/year/variant rates exist but have no versioned source-of-truth evidence." }),
  Object.freeze({ assetId: "gmm-rate-tables", source: "comisiones.js:TASAS_GMM", disposition: LEGACY_ASSET_DISPOSITIONS.REUSE_AFTER_VALIDATION, targetStage: "020", reason: "Candidate initial/renewal age bands exist but require official validation and effective dates." }),
  Object.freeze({ assetId: "training-targets", source: "comisiones.js:TRAINING_METAS", disposition: LEGACY_ASSET_DISPOSITIONS.REUSE_AFTER_VALIDATION, targetStage: "020/040", reason: "Reconcile with the modern advisor-development Training Allowance authority before reuse." }),
  Object.freeze({ assetId: "new-professional-groups", source: "comisiones.js:NP_GRUPOS", disposition: LEGACY_ASSET_DISPOSITIONS.REUSE_AFTER_VALIDATION, targetStage: "020/040", reason: "Candidate thresholds require source evidence, eligibility and effective-period validation." }),
  Object.freeze({ assetId: "new-professional-bonus-percentages", source: "comisiones.js:NP_BONO_PCT", disposition: LEGACY_ASSET_DISPOSITIONS.REUSE_AFTER_VALIDATION, targetStage: "020/040", reason: "Candidate LIMRA bonus bands are not yet a governed rule snapshot." }),
  Object.freeze({ assetId: "gmm-bonus-groups", source: "comisiones.js:GMM_GRUPOS", disposition: LEGACY_ASSET_DISPOSITIONS.REUSE_AFTER_VALIDATION, targetStage: "020/040", reason: "Candidate quarterly thresholds and percentages require official validation." }),
  Object.freeze({ assetId: "payment-frequency-factor", source: "comisiones.js:factorPago", disposition: LEGACY_ASSET_DISPOSITIONS.REUSE_AFTER_VALIDATION, targetStage: "020/040", reason: "Formula is reusable only after commission basis and receipt semantics are verified." }),
  Object.freeze({ assetId: "policy-points-formula", source: "comisiones.js:puntosPoliza", disposition: LEGACY_ASSET_DISPOSITIONS.REUSE_AFTER_VALIDATION, targetStage: "020/040", reason: "Threshold logic is reusable after product and period validation." }),
  Object.freeze({ assetId: "weighted-premium-formula", source: "comisiones.js:ponderarPrima", disposition: LEGACY_ASSET_DISPOSITIONS.REUSE_AFTER_VALIDATION, targetStage: "020/040", reason: "Product weights require official product identity mapping and effective dates." }),
  Object.freeze({ assetId: "six-month-chart-shape", source: "comisiones.js:hist6/etiq6", disposition: LEGACY_ASSET_DISPOSITIONS.REUSE_AS_IS, targetStage: "060/070", reason: "Presentation shape is reusable once fed by canonical monthly snapshots." }),
  Object.freeze({ assetId: "commissions-screen-shell", source: "comisiones.js:buildUI", disposition: LEGACY_ASSET_DISPOSITIONS.REUSE_AFTER_VALIDATION, targetStage: "070", reason: "UI shell can be retained after canonical source replacement and truth-state labeling." }),
  Object.freeze({ assetId: "quick-simulator-ui", source: "comisiones.js:simulator", disposition: LEGACY_ASSET_DISPOSITIONS.REUSE_AFTER_VALIDATION, targetStage: "070", reason: "Simulator can remain only with a hard ESTIMATED boundary and governed rule snapshots." }),
  Object.freeze({ assetId: "policy-year-from-wall-clock", source: "comisiones.js:getAnioPoliza", disposition: LEGACY_ASSET_DISPOSITIONS.REWRITE, targetStage: "030/040", reason: "Canonical calculation must derive the covered policy period from payment and policy evidence." }),
  Object.freeze({ assetId: "emission-month-as-cash-period", source: "comisiones.js:calcularMotor", disposition: LEGACY_ASSET_DISPOSITIONS.RETIRE, targetStage: "030", reason: "Policy issuance timing is not paid-premium or earned-commission truth." }),
  Object.freeze({ assetId: "manual-renewals-paid-array", source: "comisiones.js:renovacionesPagadas", disposition: LEGACY_ASSET_DISPOSITIONS.RETIRE, targetStage: "030", reason: "Manual nested arrays must be replaced by confirmed canonical Payment Events." }),
  Object.freeze({ assetId: "portfolio-indexeddb-source", source: "DB.obtenerTodos('cartera')", disposition: LEGACY_ASSET_DISPOSITIONS.RETIRE, targetStage: "030/070", reason: "Quarantined IndexedDB cannot be compensation or payment authority." }),
  Object.freeze({ assetId: "generic-crm-profile-storage", source: "crm_data:perfil_asesor", disposition: LEGACY_ASSET_DISPOSITIONS.REWRITE, targetStage: "020/040", reason: "Career and eligibility inputs require protected, typed, period-aware snapshots." }),
  Object.freeze({ assetId: "mixed-dom-data-calculation-module", source: "comisiones.js", disposition: LEGACY_ASSET_DISPOSITIONS.REWRITE, targetStage: "010/070", reason: "Calculation must be pure and independently testable; UI becomes a consumer." }),
  Object.freeze({ assetId: "unknown-life-product-default-rate", source: "getTasaVida:return 0.10", disposition: LEGACY_ASSET_DISPOSITIONS.RETIRE, targetStage: "020", reason: "Unknown product must remain BLOCKED/UNKNOWN rather than silently calculating." }),
  Object.freeze({ assetId: "unknown-gmm-product-default-rate", source: "getTasaGMM:return 0.15", disposition: LEGACY_ASSET_DISPOSITIONS.RETIRE, targetStage: "020", reason: "Unknown product must remain BLOCKED/UNKNOWN rather than silently calculating." }),
  Object.freeze({ assetId: "missing-gmm-age-default", source: "edadContrato||30", disposition: LEGACY_ASSET_DISPOSITIONS.RETIRE, targetStage: "020/040", reason: "Missing age is material rule evidence and cannot silently become age 30." }),
  Object.freeze({ assetId: "missing-limra-default", source: "perfil.limra||75.5", disposition: LEGACY_ASSET_DISPOSITIONS.RETIRE, targetStage: "040", reason: "Missing eligibility evidence cannot be replaced by a default performance value." }),
  Object.freeze({ assetId: "missing-igc-default", source: "perfil.igc||91", disposition: LEGACY_ASSET_DISPOSITIONS.RETIRE, targetStage: "040", reason: "Missing eligibility evidence cannot be replaced by a default conservation value." }),
  Object.freeze({ assetId: "development-factor", source: "factorD=0.90 during first 12 contest months", disposition: LEGACY_ASSET_DISPOSITIONS.REUSE_AFTER_VALIDATION, targetStage: "020/040", reason: "Candidate career-stage factor requires official rule evidence and period semantics." }),
  Object.freeze({ assetId: "legacy-ytd-and-semester-aggregation", source: "comisiones.js:calcularMotor", disposition: LEGACY_ASSET_DISPOSITIONS.REWRITE, targetStage: "050/060", reason: "Canonical aggregation must consume append-only compensation events and period snapshots." })
]);

function validateLegacyAssetInventory(inventory = LEGACY_ASSET_INVENTORY) {
  const errors = [];
  const knownDispositions = Object.values(LEGACY_ASSET_DISPOSITIONS);
  const seen = new Set();

  inventory.forEach((asset, index) => {
    if (!asset || typeof asset !== "object") {
      errors.push(`asset_${index}_invalid`);
      return;
    }
    if (!asset.assetId) errors.push(`asset_${index}_missing_asset_id`);
    if (seen.has(asset.assetId)) errors.push(`duplicate_asset_id:${asset.assetId}`);
    seen.add(asset.assetId);
    if (!asset.source) errors.push(`asset_${asset.assetId}_missing_source`);
    if (!knownDispositions.includes(asset.disposition)) errors.push(`asset_${asset.assetId}_invalid_disposition`);
    if (!asset.targetStage) errors.push(`asset_${asset.assetId}_missing_target_stage`);
    if (!asset.reason) errors.push(`asset_${asset.assetId}_missing_reason`);
  });

  return Object.freeze({
    inventoryVersion: LEGACY_ASSET_INVENTORY_VERSION,
    totalAssets: inventory.length,
    counts: Object.freeze(knownDispositions.reduce((accumulator, disposition) => {
      accumulator[disposition] = inventory.filter((asset) => asset.disposition === disposition).length;
      return accumulator;
    }, {})),
    errors: Object.freeze(errors),
    valid: errors.length === 0,
    officialRuleAuthorityCreated: false,
    runtimeConnectionChanged: false,
    mutationAuthorized: false
  });
}

module.exports = {
  LEGACY_ASSET_DISPOSITIONS,
  LEGACY_ASSET_INVENTORY_VERSION,
  LEGACY_ASSET_INVENTORY,
  validateLegacyAssetInventory
};