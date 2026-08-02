"use strict";

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

const {
  REQUIRED_GLOBAL_RULES,
  LIFE_POLICY_YEAR_BANDS,
  GMM_AGE_BANDS
} = require("../rules/advisor-compensation-rule-pack-contract");
const {
  normalizeProductAlias,
  validateProductIdentityRegistry,
  resolveProductIdentity
} = require("../rules/advisor-compensation-product-identity-registry");
const {
  validateAdvisorCompensationRulePack
} = require("../rules/advisor-compensation-rule-pack-validator");
const {
  stableStringify,
  calculateAdvisorCompensationRulePackDigest,
  createAdvisorCompensationRuleSnapshot
} = require("../rules/advisor-compensation-rule-snapshot");
const {
  AdvisorCompensationRulePackLoadError,
  loadAdvisorCompensationRulePack
} = require("../rules/advisor-compensation-rule-pack-loader");
const {
  resolveAdvisorCompensationCommissionRule
} = require("../rules/advisor-compensation-rule-resolver");

console.log("\nFORGE ADVISOR COMPENSATION STAGE 020 MASTER TEST v1.0\n");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

const loaded = loadAdvisorCompensationRulePack({
  capturedAt: "2026-08-02T04:50:00.000Z"
});
const pack = loaded.rulePack;

function life(productInput, policyYear, variantInput = null, asOf = "2026-08-01") {
  return resolveAdvisorCompensationCommissionRule({
    rulePack: pack,
    productInput,
    policyYear,
    variantInput,
    asOf
  });
}

function gmm(productInput, contractAge, isRenewal = false, asOf = "2026-08-01") {
  return resolveAdvisorCompensationCommissionRule({
    rulePack: pack,
    productInput,
    contractAge,
    isRenewal,
    asOf
  });
}

const tests = [
  ["Default candidate rule pack loads", () => {
    assert.equal(loaded.isValid, true);
    assert.equal(loaded.candidateUsableForSimulation, true);
    assert.equal(loaded.canonicalReady, false);
    assert.equal(loaded.payoutTruth, false);
    assert.equal(loaded.mutationAuthorized, false);
  }],
  ["Candidate validation reports no errors and explicit warnings", () => {
    assert.equal(loaded.validation.validationErrors.length, 0);
    assert.ok(loaded.validation.validationWarnings.some((item) => item.code === "candidate_rule_pack_not_official"));
    assert.ok(loaded.validation.validationWarnings.some((item) => item.code === "training_allowance_reconciliation_required"));
  }],
  ["Schema metadata is locked", () => {
    assert.equal(pack.schemaVersion, "1.0.0");
    assert.equal(pack.metadata.rulePackId, "smnyl-advisor-compensation-2026-candidate");
    assert.equal(pack.metadata.rulePackVersion, "0.1.0-candidate");
    assert.equal(pack.metadata.rulePackHash, "candidate:not-sealed");
    assert.equal(pack.metadata.governanceStatus, "candidate");
    assert.equal(pack.metadata.sourceState, "LEGACY_RUNTIME_NOT_OFFICIAL_SOURCE_TRUTH");
  }],
  ["Global safety rules match the Stage 000 boundary", () => {
    Object.entries(REQUIRED_GLOBAL_RULES).forEach(([key, value]) => {
      assert.deepEqual(pack.globalRules[key], value);
    });
    assert.equal(pack.globalRules.currency, "MXN");
  }],
  ["Product identity registry contains 19 products", () => {
    const result = validateProductIdentityRegistry(pack.productIdentities);
    assert.equal(result.valid, true);
    assert.equal(result.productCount, 19);
    assert.ok(result.aliasCount >= 38);
  }],
  ["Commission rule count matches product count", () => {
    assert.equal(pack.commissionRules.length, 19);
    assert.equal(new Set(pack.commissionRules.map((item) => item.productId)).size, 19);
  }],
  ["Vida and GMM product counts are complete", () => {
    assert.equal(pack.productIdentities.filter((item) => item.lineOfBusiness === "VIDA_INDIVIDUAL").length, 16);
    assert.equal(pack.productIdentities.filter((item) => item.lineOfBusiness === "GMM").length, 3);
  }],
  ["Product alias normalization removes accents and punctuation", () => {
    assert.equal(normalizeProductAlias("  Mío  "), "MIO");
    assert.equal(normalizeProductAlias("Alfa-Medical Flex"), "ALFA MEDICAL FLEX");
  }],
  ["Product identity resolves display name", () => {
    const result = resolveProductIdentity(pack.productIdentities, "Orvi 99");
    assert.equal(result.status, "READY");
    assert.equal(result.productId, "SMNYL_ORVI_99");
  }],
  ["Product identity resolves canonical ID", () => {
    const result = resolveProductIdentity(pack.productIdentities, "SMNYL_ALFA_MEDICAL");
    assert.equal(result.status, "READY");
    assert.equal(result.productId, "SMNYL_ALFA_MEDICAL");
  }],
  ["Unknown product remains unknown", () => {
    const result = resolveProductIdentity(pack.productIdentities, "Producto Fantasma");
    assert.equal(result.status, "UNKNOWN");
    assert.equal(result.productId, null);
  }],
  ["Conflicting aliases are rejected", () => {
    const identities = clone(pack.productIdentities.slice(0, 2));
    identities[1].aliases.push(identities[0].displayName);
    const result = validateProductIdentityRegistry(identities);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((code) => code.startsWith("conflicting_product_alias:")));
  }],
  ["Vida canonical year bands are exactly six", () => {
    assert.equal(LIFE_POLICY_YEAR_BANDS.length, 6);
    assert.deepEqual(LIFE_POLICY_YEAR_BANDS.map((item) => item.key), ["YEAR_1","YEAR_2","YEAR_3","YEARS_4_5","YEARS_6_10","YEARS_11_PLUS"]);
  }],
  ["GMM canonical age bands are exactly four", () => {
    assert.equal(GMM_AGE_BANDS.length, 4);
    assert.deepEqual(GMM_AGE_BANDS.map((item) => item.key), ["AGE_0_4","AGE_5_54","AGE_55_59","AGE_60_PLUS"]);
  }],
  ["Orvi year-one candidate rate resolves", () => {
    const result = life("Orvi", 1);
    assert.equal(result.status, "READY_CANDIDATE");
    assert.equal(result.rate, 0.44);
    assert.equal(result.bandKey, "YEAR_1");
    assert.equal(result.variantId, "DEFAULT");
  }],
  ["Orvi years four and five share the candidate rate", () => {
    assert.equal(life("Orvi", 4).rate, 0.10);
    assert.equal(life("Orvi", 5).rate, 0.10);
  }],
  ["Orvi years six through ten share the candidate rate", () => {
    assert.equal(life("Orvi", 6).rate, 0.05);
    assert.equal(life("Orvi", 10).rate, 0.05);
  }],
  ["Orvi year eleven resolves the final candidate band", () => {
    const result = life("Orvi", 11);
    assert.equal(result.rate, 0.02);
    assert.equal(result.bandKey, "YEARS_11_PLUS");
  }],
  ["Imagina Ser explicit variant resolves", () => {
    const result = life("Imagina Ser", 2, "10 Pagos");
    assert.equal(result.status, "READY_CANDIDATE");
    assert.equal(result.variantId, "10_PAGOS");
    assert.equal(result.rate, 0.085);
  }],
  ["Prima Única alias resolves without accent dependence", () => {
    assert.equal(life("Imagina Ser", 1, "Prima Unica").rate, 0.085);
    assert.equal(life("Imagina Ser", 2, "Prima Única").rate, 0);
  }],
  ["Star Temporal legacy variant alias resolves", () => {
    assert.equal(life("Star Temporal", 1, "20a <500k").rate, 0.44);
    assert.equal(life("Star Temporal", 1, "10a >=500k").rate, 0.30);
  }],
  ["Unknown explicit variant is blocked instead of defaulted", () => {
    const result = life("Imagina Ser", 1, "Variante Inexistente");
    assert.equal(result.status, "BLOCKED");
    assert.equal(result.reason, "unknown_variant");
    assert.equal(result.rate, null);
  }],
  ["Missing Vida variant uses only the explicit DEFAULT variant", () => {
    const result = life("Imagina Ser", 1);
    assert.equal(result.variantId, "DEFAULT");
    assert.equal(result.rate, 0.35);
  }],
  ["Missing or invalid policy year is blocked", () => {
    assert.equal(life("Orvi", null).reason, "policy_year_required");
    assert.equal(life("Orvi", 0).reason, "policy_year_required");
  }],
  ["Unknown Vida product is blocked with no 10 percent fallback", () => {
    const result = life("Producto Desconocido", 1);
    assert.equal(result.status, "BLOCKED");
    assert.equal(result.reason, "unknown_product");
    assert.equal(result.rate, null);
  }],
  ["GMM initial age bands resolve", () => {
    assert.equal(gmm("Alfa Medical", 3).rate, 0.17);
    assert.equal(gmm("Alfa Medical", 30).rate, 0.22);
    assert.equal(gmm("Alfa Medical", 57).rate, 0.13);
    assert.equal(gmm("Alfa Medical", 65).rate, 0.10);
  }],
  ["GMM renewal age bands resolve", () => {
    assert.equal(gmm("Alfa Medical", 3, true).rate, 0.15);
    assert.equal(gmm("Alfa Medical", 30, true).rate, 0.17);
    assert.equal(gmm("Alfa Medical", 57, true).rate, 0.13);
    assert.equal(gmm("Alfa Medical", 65, true).rate, 0.10);
  }],
  ["Missing GMM age is blocked instead of defaulted to 30", () => {
    const result = gmm("Alfa Medical", null);
    assert.equal(result.status, "BLOCKED");
    assert.equal(result.reason, "contract_age_required");
  }],
  ["Unknown GMM product is blocked with no 15 percent fallback", () => {
    const result = gmm("GMM Desconocido", 30);
    assert.equal(result.status, "BLOCKED");
    assert.equal(result.reason, "unknown_product");
    assert.equal(result.rate, null);
  }],
  ["Rule outside effective period is not resolved", () => {
    const result = life("Orvi", 1, null, "2027-01-01");
    assert.equal(result.status, "OUT_OF_EFFECTIVE_PERIOD");
    assert.equal(result.rate, null);
  }],
  ["Resolved candidate never claims earned or payout truth", () => {
    const result = life("Orvi", 1);
    assert.equal(result.truthState, "ESTIMATED_RULE_CANDIDATE");
    assert.equal(result.earnedTruth, false);
    assert.equal(result.payoutTruth, false);
    assert.equal(result.mutationAuthorized, false);
  }],
  ["Training Allowance references the existing authority", () => {
    const training = pack.advisorBonusRules.trainingAllowance;
    assert.equal(training.ruleMode, "REFERENCE_EXISTING_RULE_PACK");
    assert.equal(training.conceptRef, "training-allowance");
    assert.equal(training.reconciliationStatus, "REQUIRED");
    assert.equal(training.legacyTargets.length, 12);
    assert.equal(training.payoutTruth, false);
  }],
  ["Connection and development bonuses are excluded", () => {
    assert.equal(pack.advisorBonusRules.connectionBonus, undefined);
    assert.equal(pack.advisorBonusRules.developmentBonus, undefined);
  }],
  ["Nuevo Profesional groups are complete and descending", () => {
    const groups = pack.advisorBonusRules.newProfessional.groups;
    assert.equal(groups.length, 16);
    for (let index = 1; index < groups.length; index += 1) {
      assert.ok(groups[index - 1].minimumWeightedPremium > groups[index].minimumWeightedPremium);
    }
    assert.equal(pack.advisorBonusRules.newProfessional.missingEligibilityBehavior, "BLOCKED");
  }],
  ["GMM quarterly bonus groups preserve candidate structure", () => {
    const gmmBonus = pack.advisorBonusRules.gmmQuarterly;
    assert.equal(gmmBonus.groups.length, 7);
    assert.equal(gmmBonus.policyUnitPerInitialGmmPolicy, 0.5);
    assert.equal(gmmBonus.payoutTruth, false);
  }],
  ["Auxiliary payment factors preserve candidate values", () => {
    assert.equal(pack.auxiliaryRules.paymentFrequencyFactors.MENSUAL, 1 / 12);
    assert.equal(pack.auxiliaryRules.paymentFrequencyFactors.TRIMESTRAL, 0.25);
    assert.equal(pack.auxiliaryRules.paymentFrequencyFactors.SEMESTRAL, 0.5);
    assert.equal(pack.auxiliaryRules.paymentFrequencyFactors.ANUAL, 1);
  }],
  ["Premium weight rules cover all Vida products", () => {
    assert.equal(pack.auxiliaryRules.premiumWeights.length, 16);
    assert.equal(new Set(pack.auxiliaryRules.premiumWeights.map((item) => item.productId)).size, 16);
  }],
  ["Candidate development factor is explicit and unverified", () => {
    const factor = pack.auxiliaryRules.developmentFactor;
    assert.equal(factor.advisorMonthFrom, 1);
    assert.equal(factor.advisorMonthTo, 12);
    assert.equal(factor.factor, 0.90);
    assert.equal(factor.sourceState, "LEGACY_RUNTIME_NOT_OFFICIAL_SOURCE_TRUTH");
  }],
  ["Snapshot digest is deterministic", () => {
    assert.equal(calculateAdvisorCompensationRulePackDigest(pack), calculateAdvisorCompensationRulePackDigest(clone(pack)));
  }],
  ["Snapshot digest changes when rule content changes", () => {
    const changed = clone(pack);
    changed.commissionRules[0].variants[0].rates[0].rate += 0.01;
    assert.notEqual(calculateAdvisorCompensationRulePackDigest(pack), calculateAdvisorCompensationRulePackDigest(changed));
  }],
  ["Stable stringify ignores object key order", () => {
    assert.equal(stableStringify({ b: 2, a: 1 }), stableStringify({ a: 1, b: 2 }));
  }],
  ["Candidate snapshot is immutable and non-official", () => {
    const snapshot = createAdvisorCompensationRuleSnapshot(pack, { capturedAt: "2026-08-02T04:50:00.000Z" });
    assert.equal(snapshot.candidateOnly, true);
    assert.equal(snapshot.officialSourceTruth, false);
    assert.equal(snapshot.payoutTruth, false);
    assert.equal(snapshot.mutationAuthorized, false);
    assert.ok(Object.isFrozen(snapshot));
    assert.ok(Object.isFrozen(snapshot.rulePack));
  }],
  ["Invalid schema version is rejected", () => {
    const changed = clone(pack);
    changed.schemaVersion = "2.0.0";
    const result = validateAdvisorCompensationRulePack(changed);
    assert.equal(result.isValid, false);
    assert.ok(result.validationErrors.some((item) => item.code === "invalid_schema_version"));
  }],
  ["Payout truth cannot be enabled in a rule pack", () => {
    const changed = clone(pack);
    changed.globalRules.payoutTruth = true;
    const result = validateAdvisorCompensationRulePack(changed);
    assert.equal(result.isValid, false);
    assert.ok(result.validationErrors.some((item) => item.path === "globalRules.payoutTruth"));
  }],
  ["Default commission rate cannot be enabled", () => {
    const changed = clone(pack);
    changed.globalRules.defaultCommissionRateAllowed = true;
    const result = validateAdvisorCompensationRulePack(changed);
    assert.equal(result.isValid, false);
  }],
  ["Rule referencing an unknown product is rejected", () => {
    const changed = clone(pack);
    changed.commissionRules[0].productId = "SMNYL_UNKNOWN";
    const result = validateAdvisorCompensationRulePack(changed);
    assert.equal(result.isValid, false);
    assert.ok(result.validationErrors.some((item) => item.code === "unknown_rule_product"));
  }],
  ["Duplicate product rule is rejected", () => {
    const changed = clone(pack);
    changed.commissionRules[1].productId = changed.commissionRules[0].productId;
    const result = validateAdvisorCompensationRulePack(changed);
    assert.equal(result.isValid, false);
    assert.ok(result.validationErrors.some((item) => item.code === "overlapping_product_rule"));
  }],
  ["Invalid commission rate above 100 percent is rejected", () => {
    const changed = clone(pack);
    changed.commissionRules[0].variants[0].rates[0].rate = 1.01;
    const result = validateAdvisorCompensationRulePack(changed);
    assert.equal(result.isValid, false);
    assert.ok(result.validationErrors.some((item) => item.code === "invalid_commission_rate"));
  }],
  ["Broken GMM age band is rejected", () => {
    const changed = clone(pack);
    const rule = changed.commissionRules.find((item) => item.lineOfBusiness === "GMM");
    rule.initialAgeBands[1].from = 6;
    const result = validateAdvisorCompensationRulePack(changed);
    assert.equal(result.isValid, false);
    assert.ok(result.validationErrors.some((item) => item.code === "invalid_rate_band_shape"));
  }],
  ["Official governance without official source evidence is rejected", () => {
    const changed = clone(pack);
    changed.metadata.governanceStatus = "official";
    changed.metadata.sourceState = "LEGACY_RUNTIME_NOT_OFFICIAL_SOURCE_TRUTH";
    changed.metadata.rulePackHash = "candidate:not-sealed";
    const result = validateAdvisorCompensationRulePack(changed);
    assert.equal(result.isValid, false);
    assert.equal(result.canonicalReady, false);
    assert.ok(result.validationErrors.some((item) => item.code === "official_source_state_required"));
    assert.ok(result.validationErrors.some((item) => item.code === "official_hash_required"));
  }],
  ["Official-ready pack requires sealed hash and carrier evidence", () => {
    const changed = clone(pack);
    changed.metadata.governanceStatus = "official";
    changed.metadata.sourceState = "OFFICIAL_CARRIER_SOURCE_TRUTH";
    changed.metadata.rulePackHash = `sha256:${"a".repeat(64)}`;
    changed.metadata.sourceEvidenceRefs = ["SMNYL official commission manual 2026.pdf"];
    const result = validateAdvisorCompensationRulePack(changed);
    assert.equal(result.isValid, true);
    assert.equal(result.canonicalReady, true);
  }],
  ["Missing rule-pack file raises typed error", () => {
    assert.throws(
      () => loadAdvisorCompensationRulePack({ filePath: path.join(os.tmpdir(), "missing-rule-pack.json") }),
      (error) => error instanceof AdvisorCompensationRulePackLoadError &&
        error.code === "ADVISOR_COMPENSATION_RULE_PACK_NOT_FOUND"
    );
  }],
  ["Invalid JSON raises typed error", () => {
    const filePath = path.join(os.tmpdir(), `invalid-advisor-compensation-${process.pid}.json`);
    fs.writeFileSync(filePath, "{bad json", "utf8");
    try {
      assert.throws(
        () => loadAdvisorCompensationRulePack({ filePath }),
        (error) => error instanceof AdvisorCompensationRulePackLoadError &&
          error.code === "ADVISOR_COMPENSATION_RULE_PACK_INVALID_JSON"
      );
    } finally {
      fs.unlinkSync(filePath);
    }
  }],
  ["Validation and resolution do not mutate inputs", () => {
    const before = clone(pack);
    validateAdvisorCompensationRulePack(pack);
    life("Orvi", 1);
    assert.deepEqual(pack, before);
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

console.log("\nSTAGE 020 RESULT");
console.log(`MASTER_TEST_TOTAL=${tests.length}`);
console.log(`MASTER_TEST_PASS=${passed}`);
console.log(`MASTER_TEST_FAIL=${failed}`);
console.log(`STAGE_020_COMPLETE=${failed === 0 ? "YES" : "NO"}`);

if (failed > 0) process.exitCode = 1;
