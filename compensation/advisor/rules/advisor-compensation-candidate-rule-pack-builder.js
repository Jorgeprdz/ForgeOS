"use strict";

const {
  LEGACY_RULE_SOURCE,
  LEGACY_LIFE_RATES,
  LEGACY_GMM_RATES,
  LEGACY_NO_POINT_PLANS,
  LEGACY_TRAINING_TARGETS,
  LEGACY_NP_GROUPS,
  LEGACY_NP_BONUS_PERCENTAGES,
  LEGACY_GMM_GROUPS,
  LEGACY_PREMIUM_WEIGHTS
} = require("../legacy/advisor-compensation-legacy-candidate-rules");
const {
  LIFE_POLICY_YEAR_BANDS,
  GMM_AGE_BANDS
} = require("./advisor-compensation-rule-pack-contract");

const PRODUCT_MAP = Object.freeze({
  "Segubeca": { productId: "SMNYL_SEGUBECA", lineOfBusiness: "VIDA_INDIVIDUAL", aliases: ["Segubeca"] },
  "Imagina Ser": { productId: "SMNYL_IMAGINA_SER", lineOfBusiness: "VIDA_INDIVIDUAL", aliases: ["Imagina Ser"] },
  "Orvi": { productId: "SMNYL_ORVI", lineOfBusiness: "VIDA_INDIVIDUAL", aliases: ["Orvi"] },
  "Orvi 99": { productId: "SMNYL_ORVI_99", lineOfBusiness: "VIDA_INDIVIDUAL", aliases: ["Orvi 99"] },
  "Realiza": { productId: "SMNYL_REALIZA", lineOfBusiness: "VIDA_INDIVIDUAL", aliases: ["Realiza"] },
  "Star Temporal": { productId: "SMNYL_STAR_TEMPORAL", lineOfBusiness: "VIDA_INDIVIDUAL", aliases: ["Star Temporal"] },
  "Mio": { productId: "SMNYL_MIO", lineOfBusiness: "VIDA_INDIVIDUAL", aliases: ["Mio", "Mío"] },
  "Objetivo Vida": { productId: "SMNYL_OBJETIVO_VIDA", lineOfBusiness: "VIDA_INDIVIDUAL", aliases: ["Objetivo Vida"] },
  "Nuevo Plenitud": { productId: "SMNYL_NUEVO_PLENITUD", lineOfBusiness: "VIDA_INDIVIDUAL", aliases: ["Nuevo Plenitud"] },
  "Plenitud": { productId: "SMNYL_PLENITUD", lineOfBusiness: "VIDA_INDIVIDUAL", aliases: ["Plenitud"] },
  "Vida Mujer": { productId: "SMNYL_VIDA_MUJER", lineOfBusiness: "VIDA_INDIVIDUAL", aliases: ["Vida Mujer"] },
  "Nuevo Vida Mujer": { productId: "SMNYL_NUEVO_VIDA_MUJER", lineOfBusiness: "VIDA_INDIVIDUAL", aliases: ["Nuevo Vida Mujer"] },
  "Star Dotal": { productId: "SMNYL_STAR_DOTAL", lineOfBusiness: "VIDA_INDIVIDUAL", aliases: ["Star Dotal"] },
  "Legado": { productId: "SMNYL_LEGADO", lineOfBusiness: "VIDA_INDIVIDUAL", aliases: ["Legado"] },
  "Respaldo Educativo": { productId: "SMNYL_RESPALDO_EDUCATIVO", lineOfBusiness: "VIDA_INDIVIDUAL", aliases: ["Respaldo Educativo"] },
  "Respaldo Negocio": { productId: "SMNYL_RESPALDO_NEGOCIO", lineOfBusiness: "VIDA_INDIVIDUAL", aliases: ["Respaldo Negocio"] },
  "Alfa Medical": { productId: "SMNYL_ALFA_MEDICAL", lineOfBusiness: "GMM", aliases: ["Alfa Medical"] },
  "Alfa Medical Flex": { productId: "SMNYL_ALFA_MEDICAL_FLEX", lineOfBusiness: "GMM", aliases: ["Alfa Medical Flex"] },
  "Alfa Medical Internacional": { productId: "SMNYL_ALFA_MEDICAL_INTERNACIONAL", lineOfBusiness: "GMM", aliases: ["Alfa Medical Internacional"] }
});

const VARIANT_MAP = Object.freeze({
  "default": { variantId: "DEFAULT", aliases: ["default"] },
  "10 Pagos": { variantId: "10_PAGOS", aliases: ["10 Pagos"] },
  "15 Pagos": { variantId: "15_PAGOS", aliases: ["15 Pagos"] },
  "Prima Única": { variantId: "PRIMA_UNICA", aliases: ["Prima Única", "Prima Unica"] },
  "20a <500k": { variantId: "20A_MENOR_500K", aliases: ["20a <500k"] },
  "10a >=500k": { variantId: "10A_MAYOR_IGUAL_500K", aliases: ["10a >=500k"] },
  "1a": { variantId: "1A", aliases: ["1a"] },
  "5a": { variantId: "5A", aliases: ["5a"] },
  "10a": { variantId: "10A", aliases: ["10a"] },
  "15a": { variantId: "15A", aliases: ["15a"] }
});

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function mapRates(bands, rates) {
  return bands.map((band, index) => ({
    ...band,
    rate: rates[index]
  }));
}

function buildProductIdentities() {
  return Object.entries(PRODUCT_MAP).map(([displayName, mapping]) => ({
    productId: mapping.productId,
    carrierId: "SMNYL",
    displayName,
    lineOfBusiness: mapping.lineOfBusiness,
    aliases: [...mapping.aliases],
    identityStatus: "CANDIDATE_FROM_LEGACY_RUNTIME"
  }));
}

function buildLifeCommissionRules(seed) {
  return Object.entries(LEGACY_LIFE_RATES).map(([legacyProductName, variants]) => {
    const mapping = PRODUCT_MAP[legacyProductName];
    if (!mapping) {
      throw new Error(`Missing canonical product mapping for legacy Vida product: ${legacyProductName}`);
    }

    return {
      ruleId: `${mapping.productId}_COMMISSION_2026_CANDIDATE`,
      productId: mapping.productId,
      lineOfBusiness: "VIDA_INDIVIDUAL",
      commissionBasis: seed.migration.commissionBasis,
      effectiveFrom: seed.migration.effectiveFrom,
      effectiveTo: seed.migration.effectiveTo,
      governanceStatus: "candidate",
      sourceState: "LEGACY_RUNTIME_NOT_OFFICIAL_SOURCE_TRUTH",
      variants: Object.entries(variants).map(([legacyVariantName, rates]) => {
        const variantMapping = VARIANT_MAP[legacyVariantName];
        if (!variantMapping) {
          throw new Error(`Missing canonical variant mapping for ${legacyProductName}:${legacyVariantName}`);
        }
        return {
          variantId: variantMapping.variantId,
          displayName: legacyVariantName,
          aliases: [...variantMapping.aliases],
          rates: mapRates(LIFE_POLICY_YEAR_BANDS, rates)
        };
      })
    };
  });
}

function buildGmmCommissionRules(seed) {
  return Object.entries(LEGACY_GMM_RATES).map(([legacyProductName, rates]) => {
    const mapping = PRODUCT_MAP[legacyProductName];
    if (!mapping) {
      throw new Error(`Missing canonical product mapping for legacy GMM product: ${legacyProductName}`);
    }

    return {
      ruleId: `${mapping.productId}_COMMISSION_2026_CANDIDATE`,
      productId: mapping.productId,
      lineOfBusiness: "GMM",
      commissionBasis: seed.migration.commissionBasis,
      effectiveFrom: seed.migration.effectiveFrom,
      effectiveTo: seed.migration.effectiveTo,
      governanceStatus: "candidate",
      sourceState: "LEGACY_RUNTIME_NOT_OFFICIAL_SOURCE_TRUTH",
      initialAgeBands: mapRates(GMM_AGE_BANDS, rates.i),
      renewalAgeBands: mapRates(GMM_AGE_BANDS, rates.r)
    };
  });
}

function buildTrainingAllowance(seed) {
  return {
    ruleMode: "REFERENCE_EXISTING_RULE_PACK",
    rulePackRef: seed.trainingAllowanceReference.rulePackRef,
    conceptRef: seed.trainingAllowanceReference.conceptRef,
    reconciliationStatus: seed.trainingAllowanceReference.reconciliationStatus,
    legacyTargets: Object.entries(LEGACY_TRAINING_TARGETS).map(([advisorMonth, target]) => ({
      advisorMonth: Number(advisorMonth),
      accumulatedCommissionGoal: target.comAcum,
      accumulatedPolicyGoal: target.ptosAcum,
      maximumAward: target.premMax
    })),
    payoutTruth: false
  };
}

function buildNewProfessionalBonus() {
  return {
    sourceState: "LEGACY_RUNTIME_NOT_OFFICIAL_SOURCE_TRUTH",
    eligibilityInputsRequired: ["LIMRA", "IGC", "WEIGHTED_PREMIUM_SEMESTER"],
    missingEligibilityBehavior: "BLOCKED",
    groups: LEGACY_NP_GROUPS.map((group) => {
      const percentages = LEGACY_NP_BONUS_PERCENTAGES[group.g];
      return {
        group: group.g,
        minimumWeightedPremium: group.mes6,
        percentages: {
          minimum: percentages.min,
          limra87_5: percentages.l87,
          limra89_5: percentages.l89,
          limra91_5: percentages.l91,
          limra95_5: percentages.l95
        }
      };
    }),
    payoutTruth: false
  };
}

function buildGmmQuarterlyBonus() {
  return {
    sourceState: "LEGACY_RUNTIME_NOT_OFFICIAL_SOURCE_TRUTH",
    policyUnitPerInitialGmmPolicy: 0.5,
    groups: LEGACY_GMM_GROUPS.map((group) => ({
      group: group.g,
      minimumPolicyUnits: group.pols,
      minimumQuarterPremium: group.mes3,
      percentage: group.pct
    })),
    payoutTruth: false
  };
}

function buildAuxiliaryRules() {
  return {
    paymentFrequencyFactors: {
      MENSUAL: 1 / 12,
      TRIMESTRAL: 1 / 4,
      SEMESTRAL: 1 / 2,
      ANUAL: 1
    },
    policyPoints: {
      excludedLegacyNames: [...LEGACY_NO_POINT_PLANS],
      gmmMinimumAnnualPremium: 10000,
      gmmPoints: 0.5,
      lifeThresholds: [
        { minimum: 0, maximumExclusive: 17000, points: 0 },
        { minimum: 17000, maximumExclusive: 65000, points: 1 },
        { minimum: 65000, maximumExclusive: 190000, points: 2 },
        { minimum: 190000, maximumExclusive: null, points: 3 }
      ]
    },
    premiumWeights: Object.entries(LEGACY_PREMIUM_WEIGHTS).map(([legacyProductName, factor]) => ({
      productId: PRODUCT_MAP[legacyProductName].productId,
      factor
    })),
    developmentFactor: {
      advisorMonthFrom: 1,
      advisorMonthTo: 12,
      factor: 0.9,
      sourceState: "LEGACY_RUNTIME_NOT_OFFICIAL_SOURCE_TRUTH"
    }
  };
}

function buildAdvisorCompensationCandidateRulePack(seed) {
  if (!seed || typeof seed !== "object" || Array.isArray(seed)) {
    throw new TypeError("Rule pack seed must be an object.");
  }

  const rulePack = {
    schemaVersion: seed.schemaVersion,
    metadata: {
      ...clone(seed.metadata),
      sourceEvidenceRefs: [
        ...new Set([
          ...(seed.metadata?.sourceEvidenceRefs || []),
          LEGACY_RULE_SOURCE
        ])
      ]
    },
    globalRules: clone(seed.globalRules),
    productIdentities: buildProductIdentities(),
    commissionRules: [
      ...buildLifeCommissionRules(seed),
      ...buildGmmCommissionRules(seed)
    ],
    auxiliaryRules: buildAuxiliaryRules(),
    advisorBonusRules: {
      trainingAllowance: buildTrainingAllowance(seed),
      newProfessional: buildNewProfessionalBonus(),
      gmmQuarterly: buildGmmQuarterlyBonus()
    },
    migrationTrace: {
      sourceModule: seed.migration.sourceModule,
      sourceRuntime: LEGACY_RULE_SOURCE,
      migratedAtBuildTime: true,
      officialSourceTruthCreated: false,
      payoutTruthCreated: false
    }
  };

  return clone(rulePack);
}

module.exports = {
  PRODUCT_MAP,
  VARIANT_MAP,
  buildAdvisorCompensationCandidateRulePack
};
