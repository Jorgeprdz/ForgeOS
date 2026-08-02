"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const {
  LEGACY_ASSET_DISPOSITIONS,
  LEGACY_ASSET_INVENTORY,
  validateLegacyAssetInventory
} = require("../legacy/advisor-compensation-legacy-asset-inventory");
const {
  LEGACY_ENGINE_VERSION,
  parseLegacyAmount,
  resolveLegacyLifeRate,
  resolveLegacyGmmRate,
  resolveLegacyPolicyYear,
  resolveLegacyPaymentFactor,
  resolveLegacyPolicyPoints,
  resolveLegacyWeightedPremium,
  calculateLegacyAdvisorCompensationCandidate
} = require("../legacy/advisor-compensation-legacy-candidate-engine");

console.log("\nFORGE ADVISOR COMPENSATION STAGE 010 MASTER TEST v1.0\n");

const AS_OF = new Date(2026, 7, 1, 0, 0, 0, 0);
const NON_DEVELOPMENT_PROFILE = Object.freeze({ fecha_conexion: "2024-01-01", limra: 96, igc: 95 });

function clone(value) { return JSON.parse(JSON.stringify(value)); }
function approx(actual, expected, epsilon = 1e-9) {
  assert.ok(Math.abs(actual - expected) <= epsilon, `expected ${expected}, received ${actual}`);
}
function calculate(portfolio, profile = NON_DEVELOPMENT_PROFILE) {
  return calculateLegacyAdvisorCompensationCandidate({ portfolio, profile, asOf: AS_OF });
}

const tests = [
  ["Inventory is complete and structurally valid", () => {
    const validation = validateLegacyAssetInventory();
    assert.equal(validation.valid, true);
    assert.equal(validation.errors.length, 0);
    assert.equal(validation.totalAssets, 25);
    assert.equal(validation.officialRuleAuthorityCreated, false);
    assert.equal(validation.runtimeConnectionChanged, false);
  }],
  ["Inventory uses every required disposition", () => {
    const dispositions = new Set(LEGACY_ASSET_INVENTORY.map((asset) => asset.disposition));
    Object.values(LEGACY_ASSET_DISPOSITIONS).forEach((disposition) => assert.ok(dispositions.has(disposition)));
  }],
  ["Unsafe defaults and legacy authorities are marked RETIRE", () => {
    ["unknown-life-product-default-rate", "unknown-gmm-product-default-rate", "missing-gmm-age-default", "missing-limra-default", "missing-igc-default", "portfolio-indexeddb-source", "manual-renewals-paid-array", "emission-month-as-cash-period"].forEach((assetId) => {
      const asset = LEGACY_ASSET_INVENTORY.find((candidate) => candidate.assetId === assetId);
      assert.ok(asset);
      assert.equal(asset.disposition, LEGACY_ASSET_DISPOSITIONS.RETIRE);
    });
  }],
  ["Candidate rate tables are not classified REUSE_AS_IS", () => {
    ["life-rate-tables", "gmm-rate-tables"].forEach((assetId) => {
      const asset = LEGACY_ASSET_INVENTORY.find((candidate) => candidate.assetId === assetId);
      assert.equal(asset.disposition, LEGACY_ASSET_DISPOSITIONS.REUSE_AFTER_VALIDATION);
    });
  }],
  ["Extracted candidate engine is pure and has no runtime UI or persistence imports", () => {
    const source = fs.readFileSync(path.join(__dirname, "../legacy/advisor-compensation-legacy-candidate-engine.js"), "utf8");
    ["document.", "window.", "getSupabase", "DB.obtenerTodos", "Navigation", "showToast", "showConfirm"].forEach((token) => assert.equal(source.includes(token), false));
  }],
  ["Amount parser preserves legacy formatted-number behavior", () => {
    assert.equal(parseLegacyAmount("$120,500.25 MXN"), 120500.25);
    assert.equal(parseLegacyAmount(null), 0);
  }],
  ["Known Vida rate resolves by product, variant and policy year", () => {
    assert.equal(resolveLegacyLifeRate("Imagina Ser", "10 Pagos", 1), 0.27);
    assert.equal(resolveLegacyLifeRate("Imagina Ser", "10 Pagos", 2), 0.085);
    assert.equal(resolveLegacyLifeRate("Imagina Ser", "10 Pagos", 11), 0);
  }],
  ["Unknown Vida product preserves legacy 10 percent fallback with warning", () => {
    const warnings = [];
    assert.equal(resolveLegacyLifeRate("Producto Desconocido", null, 1, warnings), 0.10);
    assert.deepEqual(warnings, ["legacy_unknown_life_product_default_rate_0_10"]);
  }],
  ["Unknown Vida variant falls back to product default with warning", () => {
    const warnings = [];
    assert.equal(resolveLegacyLifeRate("Imagina Ser", "Variante Inexistente", 1, warnings), 0.35);
    assert.deepEqual(warnings, ["legacy_unknown_life_variant_fell_back_to_default"]);
  }],
  ["Known GMM rates preserve initial and renewal age bands", () => {
    assert.equal(resolveLegacyGmmRate("Alfa Medical", 3, false), 0.17);
    assert.equal(resolveLegacyGmmRate("Alfa Medical", 30, false), 0.22);
    assert.equal(resolveLegacyGmmRate("Alfa Medical", 57, true), 0.13);
    assert.equal(resolveLegacyGmmRate("Alfa Medical", 65, true), 0.10);
  }],
  ["Unknown GMM product preserves legacy 15 percent fallback with warning", () => {
    const warnings = [];
    assert.equal(resolveLegacyGmmRate("GMM Desconocido", 30, false, warnings), 0.15);
    assert.deepEqual(warnings, ["legacy_unknown_gmm_product_default_rate_0_15"]);
  }],
  ["Payment-frequency factors preserve legacy values", () => {
    assert.equal(resolveLegacyPaymentFactor("Mensual"), 1 / 12);
    assert.equal(resolveLegacyPaymentFactor("Trimestral"), 1 / 4);
    assert.equal(resolveLegacyPaymentFactor("Semestral"), 1 / 2);
    assert.equal(resolveLegacyPaymentFactor("Anual"), 1);
    assert.equal(resolveLegacyPaymentFactor("Desconocida"), 1);
  }],
  ["Policy year is deterministic when asOf is injected", () => {
    assert.equal(resolveLegacyPolicyYear("2026-08-01", AS_OF), 1);
    assert.equal(resolveLegacyPolicyYear("2025-07-31", AS_OF), 2);
    assert.equal(resolveLegacyPolicyYear(null, AS_OF), 1);
  }],
  ["Vida point thresholds preserve legacy boundaries", () => {
    assert.equal(resolveLegacyPolicyPoints("Orvi", 16999, false), 0);
    assert.equal(resolveLegacyPolicyPoints("Orvi", 17000, false), 1);
    assert.equal(resolveLegacyPolicyPoints("Orvi", 65000, false), 2);
    assert.equal(resolveLegacyPolicyPoints("Orvi", 190000, false), 3);
  }],
  ["GMM and excluded-plan point rules preserve legacy behavior", () => {
    assert.equal(resolveLegacyPolicyPoints("Alfa Medical", 9999, true), 0);
    assert.equal(resolveLegacyPolicyPoints("Alfa Medical", 10000, true), 0.5);
    assert.equal(resolveLegacyPolicyPoints("Star Temporal 1 año", 500000, false), 0);
  }],
  ["Weighted premium preserves candidate product factors", () => {
    assert.equal(resolveLegacyWeightedPremium("Mio", 100000), 130000);
    assert.equal(resolveLegacyWeightedPremium("Star Dotal", 100000), 50000);
    assert.equal(resolveLegacyWeightedPremium("Producto Desconocido", 100000), 100000);
  }],
  ["Current-month Vida initial commission preserves receipt calculation", () => {
    const result = calculate([{ cliente: "Ana", emision: "2026-08-01", plan: "Orvi", prima: 120000, formaPago: "Mensual" }]);
    approx(result.comInicialMes, 4400);
    approx(result.comYTD, 52800);
    approx(result.comInicialYTD, 52800);
    assert.equal(result.puntosMes, 2);
    assert.equal(result.primaMetaMes, 108000);
    assert.equal(result.detallesMes.length, 1);
    assert.equal(result.detallesMes[0].tasa, 0.44);
  }],
  ["Personal policies keep commission but are excluded from points and initial YTD", () => {
    const result = calculate([{ cliente: "Personal", emision: "2026-08-01", plan: "Orvi", prima: 120000, formaPago: "Anual", esPersonal: true }]);
    assert.equal(result.comInicialMes, 52800);
    assert.equal(result.puntosMes, 0);
    assert.equal(result.primaMetaMes, 0);
    assert.equal(result.comYTD, 52800);
    assert.equal(result.comInicialYTD, 0);
  }],
  ["Current-month GMM initial commission preserves age-band rate", () => {
    const result = calculate([{ cliente: "GMM", emision: "2026-08-01", plan: "Alfa Medical", prima: 120000, formaPago: "Anual", edadContrato: 30 }]);
    assert.equal(result.comInicialMes, 26400);
    assert.equal(result.puntosMes, 0.5);
    assert.equal(result.primaGMMtrim, 120000);
    assert.equal(result.polsGMMtrim, 0.5);
  }],
  ["Missing GMM age preserves legacy age-30 assumption and exposes it", () => {
    const result = calculate([{ emision: "2026-08-01", plan: "Alfa Medical", prima: 120000, formaPago: "Anual" }]);
    assert.equal(result.comInicialMes, 26400);
    assert.ok(result.candidateMetadata.assumptions.includes("legacy_missing_gmm_contract_age_defaulted_to_30"));
  }],
  ["Manual renewal array preserves legacy monthly renewal calculation", () => {
    const result = calculate([{ emision: "2024-08-01", plan: "Orvi", prima: 100000, formaPago: "Anual", renovacionesPagadas: [{ fecha: "2026-08-01", primaPagada: 100000, anioPoliza: 2 }] }]);
    assert.equal(result.comRenovMes, 15000);
  }],
  ["Previous-month summary preserves legacy receipt-based calculation", () => {
    const result = calculate([{ emision: "2026-07-10", plan: "Vida Mujer", prima: 120000, formaPago: "Trimestral" }]);
    assert.equal(result.comMesPasado, 12000);
    assert.equal(result.polsMesPasado, 1);
  }],
  ["Six-month history preserves legacy bucket shape", () => {
    const result = calculate([{ emision: "2026-03-15", plan: "Segubeca", prima: 120000, formaPago: "Anual" }]);
    assert.equal(result.hist6.length, 6);
    assert.equal(result.etiq6.length, 6);
    assert.equal(result.hist6[0].ini, 39600);
    assert.equal(result.hist6.slice(1).reduce((sum, item) => sum + item.ini + item.ren, 0), 0);
  }],
  ["Development factor and Training Allowance candidate are characterized", () => {
    const result = calculate([{ emision: "2026-08-01", plan: "Orvi", prima: 250000, formaPago: "Anual" }], { fecha_conexion: "2026-08-01" });
    assert.equal(result.factorD, 0.90);
    approx(result.comInicialMes, 99000);
    assert.equal(result.puntosSem, 3);
    assert.equal(result.bono.tipo, "training");
    assert.equal(result.bono.cumple, true);
    assert.equal(result.bono.base, 33000);
    assert.equal(result.bono.exc, 23100);
    assert.equal(result.bono.total, 56100);
  }],
  ["New Professional candidate bonus preserves legacy group lookup", () => {
    const result = calculate([{ emision: "2026-08-01", plan: "Mio", prima: 220000, formaPago: "Anual" }]);
    assert.equal(result.bono.tipo, "np");
    assert.equal(result.primaMetaSem, 286000);
    assert.equal(result.bono.grupo, 16);
    assert.equal(result.bono.pct, 0.14);
    approx(result.bono.montoBI, 40040);
    approx(result.bono.total, 40040);
  }],
  ["GMM candidate bonus preserves half-policy unit behavior", () => {
    const portfolio = [1, 2, 3, 4].map((index) => ({ cliente: `GMM ${index}`, emision: "2026-08-01", plan: "Alfa Medical Flex", prima: 50000, formaPago: "Anual", edadContrato: 30 }));
    const result = calculate(portfolio);
    assert.equal(result.primaGMMtrim, 200000);
    assert.equal(result.polsGMMtrim, 2);
    assert.equal(result.bono.grupoGMM.g, 7);
    approx(result.bono.montoGMM, 14000);
  }],
  ["Unknown product fallback is surfaced in candidate metadata", () => {
    const result = calculate([{ emision: "2026-08-01", plan: "Producto Desconocido", prima: 100000, formaPago: "Anual" }]);
    assert.equal(result.comInicialMes, 10000);
    assert.ok(result.candidateMetadata.warnings.includes("legacy_unknown_life_product_default_rate_0_10"));
  }],
  ["Missing LIMRA and IGC defaults are surfaced rather than hidden", () => {
    const result = calculate([], { fecha_conexion: "2024-01-01" });
    assert.equal(result.bono.limra, 75.5);
    assert.equal(result.bono.igc, 91);
    assert.ok(result.candidateMetadata.assumptions.includes("legacy_missing_limra_defaulted_to_75_5"));
    assert.ok(result.candidateMetadata.assumptions.includes("legacy_missing_igc_defaulted_to_91"));
  }],
  ["Candidate metadata never claims earned or paid truth", () => {
    const result = calculate([]);
    assert.equal(result.candidateMetadata.engineVersion, LEGACY_ENGINE_VERSION);
    assert.equal(result.candidateMetadata.ruleAuthority, "CANDIDATE_LEGACY_RUNTIME");
    assert.equal(result.candidateMetadata.ruleStatus, "REQUIRES_STAGE_020_VALIDATION");
    assert.equal(result.candidateMetadata.truthState, "ESTIMATED");
    assert.equal(result.candidateMetadata.earnedTruth, false);
    assert.equal(result.candidateMetadata.payoutTruth, false);
    assert.equal(result.candidateMetadata.mutationAuthorized, false);
  }],
  ["Engine is deterministic for fixed input and asOf", () => {
    const input = [{ emision: "2026-08-01", plan: "Orvi", prima: 120000, formaPago: "Mensual" }];
    assert.deepEqual(calculate(input), calculate(input));
  }],
  ["Engine does not mutate portfolio or profile inputs", () => {
    const portfolio = [{ emision: "2026-08-01", plan: "Orvi", prima: "$120,000", formaPago: "Mensual", renovacionesPagadas: [] }];
    const profile = { fecha_conexion: "2024-01-01", limra: 96, igc: 95 };
    const portfolioBefore = clone(portfolio);
    const profileBefore = clone(profile);
    calculateLegacyAdvisorCompensationCandidate({ portfolio, profile, asOf: AS_OF });
    assert.deepEqual(portfolio, portfolioBefore);
    assert.deepEqual(profile, profileBefore);
  }],
  ["Invalid asOf is rejected instead of producing non-deterministic output", () => {
    assert.throws(() => calculateLegacyAdvisorCompensationCandidate({ asOf: "not-a-date" }), /asOf must be a valid date/);
  }]
];

let passed = 0;
let failed = 0;
for (const [name, run] of tests) {
  try {
    run();
    passed += 1;
    console.log(`PASS ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`FAIL ${name}`);
    console.error(error.stack || error);
  }
}

console.log("\nSTAGE 010 RESULT");
console.log(`MASTER_TEST_TOTAL=${tests.length}`);
console.log(`MASTER_TEST_PASS=${passed}`);
console.log(`MASTER_TEST_FAIL=${failed}`);
console.log(`STAGE_010_COMPLETE=${failed === 0 ? "YES" : "NO"}`);
if (failed > 0) process.exitCode = 1;