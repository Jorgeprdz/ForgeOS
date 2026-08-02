"use strict";

const assert = require("assert");
const { calculateAdvisorCompensationCalculationDigest } = require("../engine/advisor-compensation-calculation-digest");
const {
  COMMISSION_CALCULATION_TYPES,
  validateAdvisorCommissionCalculation
} = require("../engine/advisor-commission-calculation-contract");
const {
  normalizeFrequency,
  resolveAdvisorCommissionPaymentBasis
} = require("../engine/advisor-commission-basis-resolver");
const {
  determineCalculationType,
  resolveDevelopmentFactor,
  resolvePointsAndWeightedPremium,
  calculateAdvisorCommission
} = require("../engine/advisor-commission-engine");
const {
  reconcileTrainingAllowanceAuthority,
  calculateTrainingAllowanceCandidate,
  chooseNewProfessionalPercentage,
  calculateNewProfessionalBonusCandidate,
  calculateGmmQuarterlyBonusCandidate
} = require("../engine/advisor-direct-bonus-engine");

function pack(governanceStatus = "candidate") {
  return {
    metadata: { governanceStatus },
    auxiliaryRules: {
      paymentFrequencyFactors: { MENSUAL: 1 / 12, TRIMESTRAL: 1 / 4, SEMESTRAL: 1 / 2, ANUAL: 1 },
      developmentFactor: { advisorMonthFrom: 1, advisorMonthTo: 12, factor: 0.9, sourceState: "CANDIDATE" },
      policyPoints: {
        excludedLegacyNames: ["Star Temporal 1", "Tempo Vida 1"],
        gmmMinimumAnnualPremium: 10000,
        gmmPoints: 0.5,
        lifeThresholds: [
          { minimum: 0, maximumExclusive: 17000, points: 0 },
          { minimum: 17000, maximumExclusive: 65000, points: 1 },
          { minimum: 65000, maximumExclusive: 190000, points: 2 },
          { minimum: 190000, maximumExclusive: null, points: 3 }
        ]
      },
      premiumWeights: [{ productId: "SMNYL_ORVI", factor: 0.9 }]
    },
    advisorBonusRules: {
      trainingAllowance: {
        ruleMode: "REFERENCE_EXISTING_RULE_PACK",
        rulePackRef: "compensation/advisor-development/rule-data/smnyl-advisor-development-2026.rule-pack.json",
        conceptRef: "training-allowance"
      },
      newProfessional: {
        sourceState: "CANDIDATE",
        groups: [
          { group: 1, minimumWeightedPremium: 1000000, percentages: { minimum: 10, limra87_5: 20, limra89_5: 30, limra91_5: 40, limra95_5: 50 } },
          { group: 2, minimumWeightedPremium: 500000, percentages: { minimum: 5, limra87_5: 10, limra89_5: 15, limra91_5: 20, limra95_5: 25 } }
        ]
      },
      gmmQuarterly: {
        sourceState: "CANDIDATE",
        policyUnitPerInitialGmmPolicy: 0.5,
        groups: [
          { group: 1, minimumPolicyUnits: 8, minimumQuarterPremium: 790000, percentage: 0.16 },
          { group: 7, minimumPolicyUnits: 2, minimumQuarterPremium: 160000, percentage: 0.07 }
        ]
      }
    }
  };
}

function event(overrides = {}) {
  const base = {
    contractVersion: "ADVISOR_COMPENSATION_CONFIRMED_PAYMENT_EVENT_001",
    eventType: "CONFIRMED_PREMIUM_PAYMENT",
    truthClass: "CONFIRMED_PAYMENT",
    eventId: "payment-event-1",
    source: { commandDigest: "command-digest-1" },
    references: {
      paymentEvidenceReference: "evidence-1",
      policyReference: "policy-1",
      obligationReference: "obligation-1",
      personReference: "person-1",
      advisorReference: "advisor-1"
    },
    productContext: {
      productId: "SMNYL_ORVI",
      lineOfBusiness: "VIDA_INDIVIDUAL",
      variant: "DEFAULT",
      policyYear: 1
    },
    payment: {
      amount: 10000,
      currency: "MXN",
      paymentDate: "2026-08-01",
      periodCoveredStart: "2026-08-01",
      periodCoveredEnd: "2026-08-31"
    },
    evidence: { evidenceHash: "evidence-hash" },
    humanConfirmation: { decisionId: "decision-1" },
    interpretation: { readyForCalculation: true, missingContext: [] },
    metadata: { policyContextSnapshotReference: "policy-snapshot-1" },
    safeguards: {
      commissionCalculationRequested: false,
      commissionCalculationPerformed: false,
      compensationEventWritten: false,
      payoutTruth: false
    }
  };
  return {
    ...base,
    ...overrides,
    references: { ...base.references, ...(overrides.references || {}) },
    productContext: { ...base.productContext, ...(overrides.productContext || {}) },
    payment: { ...base.payment, ...(overrides.payment || {}) },
    interpretation: { ...base.interpretation, ...(overrides.interpretation || {}) },
    safeguards: { ...base.safeguards, ...(overrides.safeguards || {}) }
  };
}

function ctx(overrides = {}) {
  return { annualPremium: 120000, paymentFrequency: "Mensual", advisorMonth: 13, contractAge: null, ...overrides };
}

function resolver(overrides = {}) {
  return () => ({
    status: "READY_CANDIDATE",
    reason: null,
    productId: "SMNYL_ORVI",
    displayName: "Orvi",
    lineOfBusiness: "VIDA_INDIVIDUAL",
    ruleId: "SMNYL_ORVI_RULE",
    variantId: "DEFAULT",
    bandKey: "BAND",
    rate: 0.44,
    commissionBasis: "ANNUAL_PREMIUM_WITH_PAYMENT_FREQUENCY_FACTOR",
    governanceStatus: "candidate",
    sourceState: "CANDIDATE",
    rulePackId: "rule-pack-1",
    rulePackVersion: "1.0",
    rulePackDigest: "a".repeat(64),
    ...overrides
  });
}

function devPack(governanceStatus = "draft") {
  return {
    metadata: { governanceStatus },
    concepts: {
      "training-allowance": {
        calculationRules: { excessMultiplierRate: 0.35 },
        table: [{
          advisorMonth: 1,
          accumulatedCommissionGoal: 9000,
          accumulatedPolicyGoal: 3,
          minimumLifePolicyGoal: 1,
          bonusPercentage: 1,
          minimumAward: 9000,
          maximumAward: 33000
        }]
      }
    }
  };
}

const tests = [];
const add = (name, fn) => tests.push([name, fn]);
const basis = (o = {}) => resolveAdvisorCommissionPaymentBasis({
  paymentAmount: 10000,
  annualPremium: 120000,
  paymentFrequency: "Mensual",
  paymentFrequencyFactors: pack().auxiliaryRules.paymentFrequencyFactors,
  ...o
});
const calc = (o = {}) => calculateAdvisorCommission({
  paymentEvent: event(o.event),
  rulePack: o.rulePack || pack(),
  calculationContext: ctx(o.context),
  ruleResolver: o.ruleResolver || resolver(o.rule)
});

add("digest key order", () => assert.equal(calculateAdvisorCompensationCalculationDigest({ b: 2, a: 1 }), calculateAdvisorCompensationCalculationDigest({ a: 1, b: 2 })));
add("digest material change", () => assert.notEqual(calculateAdvisorCompensationCalculationDigest({ a: 1 }), calculateAdvisorCompensationCalculationDigest({ a: 2 })));
add("frequency normalization", () => assert.equal(normalizeFrequency(" Mensual "), "MENSUAL"));
add("monthly receipt", () => assert.equal(basis().expectedScheduledReceipt, 10000));
add("partial basis", () => assert.equal(basis({ paymentAmount: 5000 }).basisState, "PARTIAL_PAYMENT"));
add("matched basis", () => assert.equal(basis().basisState, "MATCHED_SCHEDULED_RECEIPT"));
add("excess basis", () => assert.equal(basis({ paymentAmount: 15000 }).basisState, "EXCESS_PAYMENT"));
add("invalid payment basis", () => assert.equal(basis({ paymentAmount: 0 }).reason, "confirmed_payment_amount_invalid"));
add("missing annual basis", () => assert.equal(basis({ annualPremium: null }).reason, "annual_premium_required"));
add("unsupported frequency", () => assert.equal(basis({ paymentFrequency: "Quincenal" }).reason, "payment_frequency_not_supported"));
add("invalid accumulated basis", () => assert.equal(basis({ accumulatedConfirmedPaidPremium: 5000 }).reason, "accumulated_paid_premium_invalid"));

[["VIDA_INDIVIDUAL",1,COMMISSION_CALCULATION_TYPES.LIFE_INITIAL],["VIDA_INDIVIDUAL",2,COMMISSION_CALCULATION_TYPES.LIFE_RENEWAL],["GMM",1,COMMISSION_CALCULATION_TYPES.GMM_INITIAL],["GMM",2,COMMISSION_CALCULATION_TYPES.GMM_RENEWAL]].forEach(([line,year,expected]) => add(`calculation type ${line} ${year}`, () => assert.equal(determineCalculationType(line, year), expected)));

add("development factor applies", () => assert.equal(resolveDevelopmentFactor(pack(), 12).factor, 0.9));
add("development factor ends", () => assert.equal(resolveDevelopmentFactor(pack(), 13).factor, 1));
add("advisor month required", () => assert.equal(resolveDevelopmentFactor(pack(), null).reason, "advisor_month_required"));
add("personal production excluded", () => { const r = resolvePointsAndWeightedPremium({ rulePack: pack(), productId: "SMNYL_ORVI", displayName: "Orvi", lineOfBusiness: "VIDA_INDIVIDUAL", annualPremium: 120000, isPersonal: true }); assert.equal(r.policyPoints, 0); assert.equal(r.weightedPremium, 0); });
add("GMM points", () => assert.equal(resolvePointsAndWeightedPremium({ rulePack: pack(), productId: "GMM", displayName: "Alfa", lineOfBusiness: "GMM", annualPremium: 10000 }).policyPoints, 0.5));
add("Life points", () => assert.equal(resolvePointsAndWeightedPremium({ rulePack: pack(), productId: "SMNYL_ORVI", displayName: "Orvi", lineOfBusiness: "VIDA_INDIVIDUAL", annualPremium: 120000 }).policyPoints, 2));
add("weighted premium", () => assert.equal(resolvePointsAndWeightedPremium({ rulePack: pack(), productId: "SMNYL_ORVI", displayName: "Orvi", lineOfBusiness: "VIDA_INDIVIDUAL", annualPremium: 120000 }).weightedPremium, 108000));
add("invalid payment event blocks", () => assert.equal(calculateAdvisorCommission({ paymentEvent: {}, rulePack: pack(), calculationContext: ctx(), ruleResolver: resolver() }).reason, "confirmed_payment_event_invalid"));
add("not ready blocks", () => assert.equal(calc({ event: { interpretation: { readyForCalculation: false, missingContext: ["policy"] } } }).reason, "confirmed_payment_event_not_ready"));
add("advisor required", () => assert.equal(calc({ event: { references: { advisorReference: null } } }).reason, "advisor_attribution_required"));
add("rule pack required", () => assert.equal(calculateAdvisorCommission({ paymentEvent: event(), rulePack: null, calculationContext: ctx(), ruleResolver: resolver() }).reason, "rule_pack_required"));
add("policy year required", () => assert.equal(calc({ event: { productContext: { policyYear: null } } }).reason, "policy_year_required"));
add("renewal conflict", () => assert.equal(calc({ event: { productContext: { policyYear: 2 } }, context: { isRenewal: false } }).reason, "renewal_status_conflicts_with_policy_year"));
add("rule resolution block", () => assert.equal(calc({ rule: { status: "BLOCKED", reason: "resolver_blocked" } }).reason, "resolver_blocked"));
add("annual premium required", () => assert.equal(calc({ context: { annualPremium: null } }).reason, "annual_premium_required"));
add("engine advisor month required", () => assert.equal(calc({ context: { advisorMonth: null } }).reason, "advisor_month_required"));
add("Life initial amount", () => { const r = calc(); assert.equal(r.calculationType, "LIFE_INITIAL"); assert.equal(r.amounts.commissionAmount, 4400); });
add("Life renewal amount", () => { const r = calc({ event: { productContext: { policyYear: 2 } }, context: { isRenewal: true }, rule: { rate: 0.15 } }); assert.equal(r.calculationType, "LIFE_RENEWAL"); assert.equal(r.amounts.commissionAmount, 1500); });
add("GMM initial amount", () => { const r = calc({ event: { productContext: { productId: "GMM", lineOfBusiness: "GMM" } }, context: { contractAge: 30 }, rule: { productId: "GMM", lineOfBusiness: "GMM", displayName: "Alfa", rate: 0.22, variantId: null } }); assert.equal(r.calculationType, "GMM_INITIAL"); assert.equal(r.amounts.commissionAmount, 2200); });
add("GMM renewal amount", () => { const r = calc({ event: { productContext: { productId: "GMM", lineOfBusiness: "GMM", policyYear: 2 } }, context: { contractAge: 57, isRenewal: true }, rule: { productId: "GMM", lineOfBusiness: "GMM", displayName: "Alfa", rate: 0.13, variantId: null } }); assert.equal(r.calculationType, "GMM_RENEWAL"); assert.equal(r.amounts.commissionAmount, 1300); });
add("partial uses actual payment", () => { const r = calc({ event: { payment: { amount: 5000 } } }); assert.equal(r.basis.basisState, "PARTIAL_PAYMENT"); assert.equal(r.amounts.commissionAmount, 2200); });
add("accumulated commission", () => assert.equal(calc({ event: { payment: { amount: 5000 } }, context: { accumulatedConfirmedPaidPremium: 15000 } }).amounts.accumulatedCommissionAmount, 6600));
add("official eligibility", () => assert.equal(calc({ rulePack: pack("official"), rule: { status: "READY_OFFICIAL", governanceStatus: "official" } }).eligibleForEarnedPromotion, true));
add("candidate no eligibility", () => assert.equal(calc().eligibleForEarnedPromotion, false));
add("deterministic calculation digest", () => assert.equal(calc().calculationDigest, calc().calculationDigest));
add("payment changes digest", () => assert.notEqual(calc().calculationDigest, calc({ event: { payment: { amount: 9000 } } }).calculationDigest));
add("deep freeze", () => { const r = calc(); assert.equal(Object.isFrozen(r), true); assert.equal(Object.isFrozen(r.amounts), true); });
add("explanation formula", () => assert.match(calc().explanation.formula, /confirmed_paid_premium/));
add("no payout truth", () => { const r = calc(); assert.equal(r.safeguards.payoutTruth, false); assert.equal(r.safeguards.compensationEventWritten, false); });
add("training pack required", () => assert.equal(reconcileTrainingAllowanceAuthority({ advisorCompensationRulePack: pack() }).reason, "advisor_development_rule_pack_required"));
add("single training authority", () => { const r = reconcileTrainingAllowanceAuthority({ advisorCompensationRulePack: pack(), advisorDevelopmentRulePack: devPack() }); assert.equal(r.selectedAuthority, "ADVISOR_DEVELOPMENT_RULE_PACK"); assert.equal(r.duplicateLegacyInterpretationRetired, true); });
add("training qualifies", () => { const a = reconcileTrainingAllowanceAuthority({ advisorCompensationRulePack: pack(), advisorDevelopmentRulePack: devPack() }); const r = calculateTrainingAllowanceCandidate({ authority: a, advisorMonth: 1, accumulatedCommission: 40000, accumulatedPolicyCount: 3, accumulatedLifePolicyCount: 1 }); assert.equal(r.qualifies, true); assert.equal(r.amounts.candidateAmount, 35450); });
add("training below goals", () => { const a = reconcileTrainingAllowanceAuthority({ advisorCompensationRulePack: pack(), advisorDevelopmentRulePack: devPack() }); assert.equal(calculateTrainingAllowanceCandidate({ authority: a, advisorMonth: 1, accumulatedCommission: 8000, accumulatedPolicyCount: 2, accumulatedLifePolicyCount: 0 }).amounts.candidateAmount, 0); });
add("training prior advances", () => { const a = reconcileTrainingAllowanceAuthority({ advisorCompensationRulePack: pack(), advisorDevelopmentRulePack: devPack() }); assert.equal(calculateTrainingAllowanceCandidate({ authority: a, advisorMonth: 1, accumulatedCommission: 40000, accumulatedPolicyCount: 3, accumulatedLifePolicyCount: 1, priorPaidAdvances: 5000 }).amounts.candidateAmount, 30450); });
add("NP missing input", () => assert.equal(calculateNewProfessionalBonusCandidate({ rulePack: pack(), weightedPremiumSemester: 600000, limra: null, igc: 91 }).reason, "new_professional_inputs_required"));
add("NP group one", () => { const r = calculateNewProfessionalBonusCandidate({ rulePack: pack(), weightedPremiumSemester: 1200000, limra: 96, igc: 95 }); assert.equal(r.group, 1); assert.equal(r.candidateAmount, 600000); });
add("NP no group", () => assert.equal(calculateNewProfessionalBonusCandidate({ rulePack: pack(), weightedPremiumSemester: 100000, limra: 96, igc: 95 }).candidateAmount, 0));
add("NP LIMRA tier", () => assert.equal(chooseNewProfessionalPercentage({ minimum: 5, limra87_5: 10, limra89_5: 15, limra91_5: 20, limra95_5: 25 }, 90), 15));
add("GMM missing input", () => assert.equal(calculateGmmQuarterlyBonusCandidate({ rulePack: pack(), confirmedInitialGmmPremiumQuarter: null, confirmedInitialGmmPolicyUnits: 2 }).reason, "gmm_quarterly_inputs_required"));
add("GMM group one", () => assert.equal(calculateGmmQuarterlyBonusCandidate({ rulePack: pack(), confirmedInitialGmmPremiumQuarter: 800000, confirmedInitialGmmPolicyUnits: 8 }).candidateAmount, 128000));
add("GMM no group", () => assert.equal(calculateGmmQuarterlyBonusCandidate({ rulePack: pack(), confirmedInitialGmmPremiumQuarter: 100000, confirmedInitialGmmPolicyUnits: 1 }).candidateAmount, 0));
add("bonus digest deterministic", () => { const a = { rulePack: pack(), weightedPremiumSemester: 600000, limra: 96, igc: 95 }; assert.equal(calculateNewProfessionalBonusCandidate(a).calculationDigest, calculateNewProfessionalBonusCandidate(a).calculationDigest); });
add("calculation contract valid", () => assert.equal(validateAdvisorCommissionCalculation(calc()).valid, true));
add("contract rejects payout", () => assert.equal(validateAdvisorCommissionCalculation({ contractVersion: "ADVISOR_COMMISSION_CALCULATION_001", status: "CALCULATED", amounts: { commissionAmount: 1 }, calculationDigest: "a".repeat(64), safeguards: { payoutTruth: true, compensationEventWritten: false, externalMutationAuthorized: false } }).valid, false));
add("development calculation", () => { const r = calc({ context: { advisorMonth: 6 } }); assert.equal(r.rule.effectiveRate, 0.396); assert.equal(r.amounts.commissionAmount, 3960); });
add("annual premium not cash truth", () => assert.equal(calc({ event: { payment: { amount: 5000 } } }).basis.annualPremiumUsedAsCashTruth, false));
add("issued premium not paid truth", () => assert.equal(calc().basis.issuedPremiumUsedAsPaidPremium, false));
add("inputs not mutated", () => { const e = event(), r = pack(), c = ctx(), before = JSON.stringify({ e, r, c }); calculateAdvisorCommission({ paymentEvent: e, rulePack: r, calculationContext: c, ruleResolver: resolver() }); assert.equal(JSON.stringify({ e, r, c }), before); });

console.log("\nFORGE ADVISOR COMPENSATION STAGE 040 MASTER TEST v1.0\n");
let passed = 0;
let failed = 0;
for (const [name, run] of tests) {
  try { run(); passed += 1; console.log(`PASS ${name}`); }
  catch (error) { failed += 1; console.error(`FAIL ${name}`); console.error(error.stack || error); }
}
console.log("\nSTAGE 040 RESULT");
console.log(`MASTER_TEST_TOTAL=${tests.length}`);
console.log(`MASTER_TEST_PASS=${passed}`);
console.log(`MASTER_TEST_FAIL=${failed}`);
console.log(`STAGE_040_COMPLETE=${failed === 0 ? "YES" : "NO"}`);
if (failed > 0) process.exitCode = 1;
