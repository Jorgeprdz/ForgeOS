"use strict";

const {
  LEGACY_RULE_AUTHORITY,
  LEGACY_RULE_SOURCE,
  LEGACY_RULE_STATUS,
  LEGACY_LIFE_RATES,
  LEGACY_GMM_RATES,
  LEGACY_GMM_PLANS,
  LEGACY_NO_POINT_PLANS,
  LEGACY_TRAINING_TARGETS,
  LEGACY_NP_GROUPS,
  LEGACY_NP_BONUS_PERCENTAGES,
  LEGACY_GMM_GROUPS,
  LEGACY_PREMIUM_WEIGHTS
} = require("./advisor-compensation-legacy-candidate-rules");

const DAY_MS = 1000 * 60 * 60 * 24;
const LEGACY_ENGINE_VERSION = "ADVISOR_COMPENSATION_LEGACY_CANDIDATE_ENGINE_001";

function present(value) {
  return value !== undefined && value !== null && value !== "";
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function unique(values) {
  return [...new Set(values.filter(present))];
}

function toDateAtNoon(value) {
  if (value instanceof Date) return new Date(value.getTime());
  if (!present(value)) return new Date(NaN);
  const text = String(value);
  return new Date(text.includes("T") ? text : `${text}T12:00:00`);
}

function normalizeAsOf(asOf) {
  const date = asOf instanceof Date ? new Date(asOf.getTime()) : new Date(asOf);
  if (Number.isNaN(date.getTime())) throw new TypeError("asOf must be a valid date");
  date.setHours(0, 0, 0, 0);
  return date;
}

function parseLegacyAmount(value) {
  return Number(String(value || 0).replace(/[^0-9.-]/g, "")) || 0;
}

function resolveLegacyLifeRate(plan, variant, policyYear, warnings = []) {
  const product = LEGACY_LIFE_RATES[plan];
  if (!product) {
    warnings.push("legacy_unknown_life_product_default_rate_0_10");
    return 0.10;
  }

  const rates = variant && product[variant] ? product[variant] : product.default;
  if (variant && !product[variant]) {
    warnings.push("legacy_unknown_life_variant_fell_back_to_default");
  }

  const index = policyYear === 1
    ? 0
    : policyYear === 2
      ? 1
      : policyYear === 3
        ? 2
        : policyYear <= 5
          ? 3
          : policyYear <= 10
            ? 4
            : 5;

  return rates[index] || 0;
}

function resolveLegacyGmmRate(plan, age, isRenewal, warnings = []) {
  const product = LEGACY_GMM_RATES[plan];
  if (!product) {
    warnings.push("legacy_unknown_gmm_product_default_rate_0_15");
    return 0.15;
  }

  const normalizedAge = Number(age);
  const rates = isRenewal ? product.r : product.i;
  return normalizedAge <= 4
    ? rates[0]
    : normalizedAge <= 54
      ? rates[1]
      : normalizedAge <= 59
        ? rates[2]
        : rates[3];
}

function resolveLegacyPolicyYear(emissionDate, asOf) {
  if (!emissionDate) return 1;
  const emission = toDateAtNoon(emissionDate);
  return Math.max(1, Math.floor((asOf - emission) / (DAY_MS * 365.25)) + 1);
}

function resolveLegacyPaymentFactor(paymentFrequency) {
  if (paymentFrequency === "Mensual") return 1 / 12;
  if (paymentFrequency === "Trimestral") return 1 / 4;
  if (paymentFrequency === "Semestral") return 1 / 2;
  return 1;
}

function resolveLegacyPolicyPoints(plan, annualPremium, isGmm) {
  const normalizedPlan = String(plan || "");
  if (LEGACY_NO_POINT_PLANS.some((candidate) => normalizedPlan.includes(candidate))) return 0;
  if (isGmm) return annualPremium >= 10000 ? 0.5 : 0;
  if (annualPremium < 17000) return 0;
  if (annualPremium < 65000) return 1;
  if (annualPremium < 190000) return 2;
  return 3;
}

function resolveLegacyWeightedPremium(plan, premium) {
  return premium * (LEGACY_PREMIUM_WEIGHTS[plan] || 1.00);
}

function calculateLegacyAdvisorCompensationCandidate({ portfolio = [], profile = {}, asOf } = {}) {
  const asOfDate = normalizeAsOf(asOf || new Date());
  const warnings = [];
  const assumptions = [];
  const connectionDateValue = profile.fecha_conexion || profile.fechaConexion;
  const connectionDate = toDateAtNoon(connectionDateValue);
  const contestMonth = Math.max(
    1,
    Math.floor((asOfDate - connectionDate) / (DAY_MS * 30.44)) + 1
  );
  const isDevelopment = contestMonth <= 12;
  const developmentFactor = isDevelopment ? 0.90 : 1.0;

  if (!connectionDateValue || Number.isNaN(connectionDate.getTime())) {
    warnings.push("legacy_connection_date_missing_or_invalid");
  }

  const month = asOfDate.getMonth();
  const year = asOfDate.getFullYear();
  const semesterStart = month < 6 ? 0 : 6;
  const quarterStart = Math.floor(month / 3) * 3;
  const previousMonthDate = new Date(year, month - 1, 1);
  const previousMonth = previousMonthDate.getMonth();
  const previousMonthYear = previousMonthDate.getFullYear();

  let initialCommissionMonth = 0;
  let renewalCommissionMonth = 0;
  let pointsMonth = 0;
  let weightedPremiumMonth = 0;
  let initialCommissionSemester = 0;
  let pointsSemester = 0;
  let weightedPremiumSemester = 0;
  let gmmPremiumQuarter = 0;
  let gmmPolicyUnitsQuarter = 0;
  let commissionPreviousMonth = 0;
  let initialPoliciesPreviousMonth = 0;
  let commissionYtd = 0;
  let initialCommissionYtd = 0;

  const history6 = Array.from({ length: 6 }, () => ({ ini: 0, ren: 0 }));
  const labels6 = [];
  for (let index = 5; index >= 0; index -= 1) {
    labels6.push(
      new Date(year, month - index, 1)
        .toLocaleString("es-MX", { month: "short" })
        .toUpperCase()
    );
  }

  const monthDetails = [];

  portfolio.forEach((policy) => {
    if (!policy.emision) return;

    const emission = toDateAtNoon(policy.emision);
    const emissionMonth = emission.getMonth();
    const emissionYear = emission.getFullYear();
    const policyYear = resolveLegacyPolicyYear(policy.emision, asOfDate);
    const isRenewal = policyYear > 1;
    const isGmm = LEGACY_GMM_PLANS.includes(policy.plan);
    const premium = parseLegacyAmount(policy.prima);
    const receiptPremium = premium * resolveLegacyPaymentFactor(policy.formaPago);

    let age = Number(policy.edadContrato);
    if (!policy.edadContrato && isGmm) {
      age = 30;
      assumptions.push("legacy_missing_gmm_contract_age_defaulted_to_30");
    }

    const rate = (
      isGmm
        ? resolveLegacyGmmRate(policy.plan, age || 30, isRenewal, warnings)
        : resolveLegacyLifeRate(policy.plan, policy.variante, policyYear, warnings)
    ) * developmentFactor;

    const receiptCommission = receiptPremium * rate;
    const points = resolveLegacyPolicyPoints(policy.plan, premium, isGmm);

    if (emissionYear === year) {
      commissionYtd += premium * rate;
      if (!isRenewal && !policy.esPersonal) initialCommissionYtd += premium * rate;
    }

    if (emissionMonth === month && emissionYear === year) {
      if (isRenewal) {
        renewalCommissionMonth += receiptCommission;
      } else {
        initialCommissionMonth += receiptCommission;
        if (!policy.esPersonal) {
          pointsMonth += points;
          weightedPremiumMonth += resolveLegacyWeightedPremium(policy.plan, premium);
        }
      }

      monthDetails.push({
        cliente: policy.cliente || "—",
        plan: policy.plan,
        formaPago: policy.formaPago || "Anual",
        anioP: policyYear,
        tasa: rate,
        comRecibo: receiptCommission,
        esRenov: isRenewal,
        puntos: points,
        prima: premium
      });
    }

    if (emissionMonth === previousMonth && emissionYear === previousMonthYear) {
      commissionPreviousMonth += receiptCommission;
      if (!isRenewal) initialPoliciesPreviousMonth += 1;
    }

    if (
      emissionYear === year &&
      emissionMonth >= semesterStart &&
      emissionMonth <= month &&
      !isRenewal &&
      !policy.esPersonal
    ) {
      initialCommissionSemester += receiptCommission;
      pointsSemester += points;
      weightedPremiumSemester += resolveLegacyWeightedPremium(policy.plan, premium);
    }

    if (
      isGmm &&
      !isRenewal &&
      emissionYear === year &&
      emissionMonth >= quarterStart &&
      emissionMonth <= month
    ) {
      gmmPremiumQuarter += premium;
      gmmPolicyUnitsQuarter += 0.5;
    }

    for (let index = 0; index < 6; index += 1) {
      const bucket = new Date(year, month - (5 - index), 1);
      if (emissionMonth === bucket.getMonth() && emissionYear === bucket.getFullYear()) {
        if (isRenewal) history6[index].ren += receiptCommission;
        else history6[index].ini += receiptCommission;
      }
    }
  });

  portfolio.forEach((policy) => {
    (policy.renovacionesPagadas || []).forEach((renewal) => {
      const renewalDate = toDateAtNoon(renewal.fecha);
      if (renewalDate.getMonth() === month && renewalDate.getFullYear() === year) {
        const isGmm = LEGACY_GMM_PLANS.includes(policy.plan);
        const age = policy.edadContrato || 30;
        if (!policy.edadContrato && isGmm) {
          assumptions.push("legacy_missing_gmm_contract_age_defaulted_to_30");
        }
        const rate = (
          isGmm
            ? resolveLegacyGmmRate(policy.plan, age, true, warnings)
            : resolveLegacyLifeRate(policy.plan, policy.variante, renewal.anioPoliza || 2, warnings)
        ) * developmentFactor;
        renewalCommissionMonth += (renewal.primaPagada || 0) * rate;
      }
    });
  });

  let bonus = {};
  if (isDevelopment) {
    const normalizedContestMonth = Math.min(contestMonth, 12);
    const target = LEGACY_TRAINING_TARGETS[normalizedContestMonth];
    const missingCommission = Math.max(0, target.comAcum - initialCommissionSemester);
    const missingPoints = Math.max(0, target.ptosAcum - pointsSemester);
    const qualifies = missingCommission <= 0 && missingPoints <= 0;
    const base = qualifies ? Math.min(initialCommissionSemester, target.premMax) : 0;
    const excess = qualifies && initialCommissionSemester > target.premMax
      ? (initialCommissionSemester - target.premMax) * 0.35
      : 0;

    bonus = {
      tipo: "training",
      mc: normalizedContestMonth,
      meta: clone(target),
      fCom: missingCommission,
      fPtos: missingPoints,
      cumple: qualifies,
      base,
      exc: excess,
      total: base + excess
    };
  } else {
    const limra = Number(profile.limra || 75.5);
    const igc = Number(profile.igc || 91);
    if (!present(profile.limra)) assumptions.push("legacy_missing_limra_defaulted_to_75_5");
    if (!present(profile.igc)) assumptions.push("legacy_missing_igc_defaulted_to_91");

    const group = (LEGACY_NP_GROUPS.find((candidate) => weightedPremiumSemester >= candidate.mes6) || {}).g || null;
    let percentage = 0;

    if (group) {
      const band = LEGACY_NP_BONUS_PERCENTAGES[group];
      if (limra >= 95.5) percentage = band.l95;
      else if (limra >= 91.5) percentage = band.l91;
      else if (limra >= 89.5) percentage = band.l89;
      else if (limra >= 87.5) percentage = band.l87;
      else percentage = band.min;
      percentage /= 100;
    }

    const gmmGroup = LEGACY_GMM_GROUPS.find(
      (candidate) => gmmPremiumQuarter >= candidate.mes3 && gmmPolicyUnitsQuarter >= candidate.pols
    ) || null;

    bonus = {
      tipo: "np",
      grupo: group,
      pct: percentage,
      montoBI: weightedPremiumSemester * percentage,
      limra,
      igc,
      grupoGMM: gmmGroup ? clone(gmmGroup) : null,
      montoGMM: gmmGroup ? gmmPremiumQuarter * gmmGroup.pct : 0,
      total: (weightedPremiumSemester * percentage) + (gmmGroup ? gmmPremiumQuarter * gmmGroup.pct : 0)
    };
  }

  return {
    factorD: developmentFactor,
    comInicialMes: initialCommissionMonth,
    comRenovMes: renewalCommissionMonth,
    puntosMes: pointsMonth,
    primaMetaMes: weightedPremiumMonth,
    comInicialSem: initialCommissionSemester,
    puntosSem: pointsSemester,
    primaMetaSem: weightedPremiumSemester,
    primaGMMtrim: gmmPremiumQuarter,
    polsGMMtrim: gmmPolicyUnitsQuarter,
    comMesPasado: commissionPreviousMonth,
    polsMesPasado: initialPoliciesPreviousMonth,
    comYTD: commissionYtd,
    comInicialYTD: initialCommissionYtd,
    hist6: history6,
    etiq6: labels6,
    detallesMes: monthDetails,
    bono: bonus,
    candidateMetadata: Object.freeze({
      engineVersion: LEGACY_ENGINE_VERSION,
      ruleAuthority: LEGACY_RULE_AUTHORITY,
      ruleStatus: LEGACY_RULE_STATUS,
      sourceRuntime: LEGACY_RULE_SOURCE,
      truthState: "ESTIMATED",
      earnedTruth: false,
      payoutTruth: false,
      mutationAuthorized: false,
      asOf: asOfDate.toISOString(),
      warnings: unique(warnings),
      assumptions: unique(assumptions)
    })
  };
}

module.exports = {
  LEGACY_ENGINE_VERSION,
  parseLegacyAmount,
  resolveLegacyLifeRate,
  resolveLegacyGmmRate,
  resolveLegacyPolicyYear,
  resolveLegacyPaymentFactor,
  resolveLegacyPolicyPoints,
  resolveLegacyWeightedPremium,
  calculateLegacyAdvisorCompensationCandidate
};