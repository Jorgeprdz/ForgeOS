const https = require("https");

/*
TEMPORARY DEVELOPMENT CONFIGURATION

DO NOT DEPLOY TO PRODUCTION.

Before Supabase deployment:

1. Remove hardcoded token.
2. Use environment variables.
3. Move token access to Edge Functions.
4. Never expose token to frontend.

Tracked by:
FORGE_SECURITY_MIGRATION_PHASE
*/
const BANXICO_TOKEN =
  "d8f92037201307ffb65213ec188fa35a55d4b8bec226b3157624381faea9ca7d";

const BANXICO_SERIES = {
  UDI: "SP68257",
  USD: "SF43718"
};

const CALCULATION_MODE =
  "POLICY_CURRENCY_TIMELINE_PROJECTED_MXN_ESTIMATE_NOT_GUARANTEED";

const GLOBAL_UDI_PROJECTION_RATE = 0.045;

const SUPPORTED_CURRENCIES = new Set(["UDI", "USD"]);
const DEFAULT_SCENARIOS = ["BASE", "FAVORABLE", "DESFAVORABLE"];

function requireFiniteNumber(value, fieldName) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    throw new Error(`Missing or invalid ${fieldName}`);
  }

  return parsed;
}

function optionalNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeCurrency(currency) {
  const normalized = String(currency || "").toUpperCase();

  if (!SUPPORTED_CURRENCIES.has(normalized)) {
    throw new Error(`Unsupported currency: ${currency}`);
  }

  return normalized;
}

function normalizeScenarioName(name) {
  return String(name || "BASE").toUpperCase();
}

function projectCurrencyValue({
  currentCurrencyValue,
  annualProjectionRate,
  yearsProjected
}) {
  return (
    requireFiniteNumber(currentCurrencyValue, "currentCurrencyValue") *
    Math.pow(
      1 + requireFiniteNumber(annualProjectionRate, "annualProjectionRate"),
      requireFiniteNumber(yearsProjected, "yearsProjected")
    )
  );
}

function amountByYear(source, policyYear) {
  if (!source) return undefined;

  if (Array.isArray(source)) {
    return source.find(row => Number(row.policyYear || row.year) === policyYear);
  }

  return source[policyYear] || source[String(policyYear)];
}

function normalizeAnnualAmount(row = {}, aliases = {}) {
  const annual =
    row[aliases.annual] ??
    row.annualAmount ??
    row.amountAnnual ??
    row.amount ??
    row.value ??
    row.total;
  const monthly =
    row[aliases.monthly] ??
    row.monthlyAmount ??
    row.amountMonthly ??
    row.monthly;

  if (annual !== undefined) {
    return optionalNumber(annual);
  }

  if (monthly !== undefined) {
    return optionalNumber(monthly) * 12;
  }

  return 0;
}

function normalizeMonthlyAmount(row = {}, aliases = {}) {
  const monthly =
    row[aliases.monthly] ??
    row.monthlyAmount ??
    row.amountMonthly ??
    row.monthly;

  return monthly === undefined ? null : optionalNumber(monthly);
}

function mergeYearData({
  row,
  policyYear,
  contributionsByYear,
  benefitsByYear,
  recoveryValuesByYear
}) {
  const contribution = amountByYear(contributionsByYear, policyYear);
  const benefit = amountByYear(benefitsByYear, policyYear);
  const recovery = amountByYear(recoveryValuesByYear, policyYear);

  return {
    ...row,
    contribution:
      contribution && typeof contribution === "object"
        ? contribution
        : { amount: contribution },
    benefit:
      benefit && typeof benefit === "object"
        ? benefit
        : { amount: benefit },
    recovery:
      recovery && typeof recovery === "object"
        ? recovery
        : { amount: recovery }
  };
}

function normalizeScenarioData({ row, scenarioName }) {
  const scenario = row.scenarios?.[scenarioName] || {};

  return {
    contributionAmount:
      scenario.contributionAmount ??
      scenario.contributionAnnual ??
      row.contributionAmount ??
      row.contributionAnnual ??
      row.contribution?.amount ??
      row.contribution?.annualAmount,
    contributionMonthly:
      scenario.contributionMonthly ??
      row.contributionMonthly ??
      row.contribution?.monthlyAmount,
    benefitAmount:
      scenario.benefitAmount ??
      scenario.benefitAnnual ??
      row.benefitAmount ??
      row.benefitAnnual ??
      row.benefit?.amount ??
      row.benefit?.annualAmount,
    benefitMonthly:
      scenario.benefitMonthly ??
      row.benefitMonthly ??
      row.benefit?.monthlyAmount,
    recoveryAmount:
      scenario.recoveryAmount ??
      scenario.surrenderValue ??
      scenario.retirementValue ??
      row.recoveryAmount ??
      row.surrenderValue ??
      row.retirementValue ??
      row.recovery?.amount ??
      row.recovery?.annualAmount,
    recoveryMonthly:
      scenario.recoveryMonthly ??
      row.recoveryMonthly ??
      row.recovery?.monthlyAmount
  };
}

function buildScenarioProjection({ row, scenarioName, projectedCurrencyValue }) {
  const scenarioData = normalizeScenarioData({ row, scenarioName });
  const contributionAnnual = normalizeAnnualAmount(
    {
      annualAmount: scenarioData.contributionAmount,
      monthlyAmount: scenarioData.contributionMonthly
    }
  );
  const benefitAnnual = normalizeAnnualAmount(
    {
      annualAmount: scenarioData.benefitAmount,
      monthlyAmount: scenarioData.benefitMonthly
    }
  );
  const recoveryAnnual = normalizeAnnualAmount(
    {
      annualAmount: scenarioData.recoveryAmount,
      monthlyAmount: scenarioData.recoveryMonthly
    }
  );
  const contributionMonthly = normalizeMonthlyAmount({
    monthlyAmount: scenarioData.contributionMonthly
  });
  const benefitMonthly = normalizeMonthlyAmount({
    monthlyAmount: scenarioData.benefitMonthly
  });
  const recoveryMonthly = normalizeMonthlyAmount({
    monthlyAmount: scenarioData.recoveryMonthly
  });

  return {
    scenario: scenarioName,
    contributionCurrencyAnnual: contributionAnnual,
    contributionNominalYear: contributionAnnual * projectedCurrencyValue,
    contributionCurrencyMonthly: contributionMonthly,
    contributionNominalMonthly:
      contributionMonthly === null
        ? null
        : contributionMonthly * projectedCurrencyValue,
    benefitCurrencyAnnual: benefitAnnual,
    benefitNominalYear: benefitAnnual * projectedCurrencyValue,
    benefitCurrencyMonthly: benefitMonthly,
    benefitNominalMonthly:
      benefitMonthly === null ? null : benefitMonthly * projectedCurrencyValue,
    recoveryCurrencyAnnual: recoveryAnnual,
    recoveryNominalYear: recoveryAnnual * projectedCurrencyValue,
    recoveryCurrencyMonthly: recoveryMonthly,
    recoveryNominalMonthly:
      recoveryMonthly === null
        ? null
        : recoveryMonthly * projectedCurrencyValue
  };
}

function buildPolicyCurrencyTimeline({
  currency,
  currentCurrencyValue,
  annualProjectionRate = GLOBAL_UDI_PROJECTION_RATE,
  policyStartYear = 1,
  actuarialTable = [],
  contributionsByYear,
  benefitsByYear,
  recoveryValuesByYear,
  scenarios = DEFAULT_SCENARIOS
}) {
  const normalizedCurrency = normalizeCurrency(currency);
  const normalizedCurrentCurrencyValue = requireFiniteNumber(
    currentCurrencyValue,
    "currentCurrencyValue"
  );
  const normalizedProjectionRate =
    normalizedCurrency === "UDI"
      ? GLOBAL_UDI_PROJECTION_RATE
      : requireFiniteNumber(annualProjectionRate, "annualProjectionRate");
  const normalizedPolicyStartYear = requireFiniteNumber(
    policyStartYear,
    "policyStartYear"
  );
  const scenarioNames = scenarios.map(normalizeScenarioName);
  const totalsByScenario = {};

  scenarioNames.forEach(scenarioName => {
    totalsByScenario[scenarioName] = {
      totalContributionNominalAccumulated: 0,
      totalBenefitNominalAccumulated: 0,
      totalRecoveryNominalAccumulated: 0
    };
  });

  const rows = actuarialTable.map((rawRow, index) => {
    const policyYear = requireFiniteNumber(
      rawRow.policyYear || rawRow.year || normalizedPolicyStartYear + index,
      "policyYear"
    );
    const yearsProjected = Math.max(policyYear - normalizedPolicyStartYear, 0);
    const projectedCurrencyValue = projectCurrencyValue({
      currentCurrencyValue: normalizedCurrentCurrencyValue,
      annualProjectionRate: normalizedProjectionRate,
      yearsProjected
    });
    const row = mergeYearData({
      row: rawRow,
      policyYear,
      contributionsByYear,
      benefitsByYear,
      recoveryValuesByYear
    });
    const projectedScenarios = {};

    scenarioNames.forEach(scenarioName => {
      const scenarioProjection = buildScenarioProjection({
        row,
        scenarioName,
        projectedCurrencyValue
      });

      totalsByScenario[scenarioName].totalContributionNominalAccumulated +=
        scenarioProjection.contributionNominalYear;
      totalsByScenario[scenarioName].totalBenefitNominalAccumulated +=
        scenarioProjection.benefitNominalYear;
      totalsByScenario[scenarioName].totalRecoveryNominalAccumulated +=
        scenarioProjection.recoveryNominalYear;

      projectedScenarios[scenarioName] = {
        ...scenarioProjection,
        totalContributionNominalAccumulated:
          totalsByScenario[scenarioName].totalContributionNominalAccumulated
      };
    });

    return {
      policyYear,
      calendarYear: rawRow.calendarYear || null,
      yearsProjected,
      currency: normalizedCurrency,
      projectedCurrencyValue,
      scenarios: projectedScenarios,
      calculationMode: CALCULATION_MODE
    };
  });

  return {
    currency: normalizedCurrency,
    currentCurrencyValue: normalizedCurrentCurrencyValue,
    annualProjectionRate: normalizedProjectionRate,
    policyStartYear: normalizedPolicyStartYear,
    rows,
    totalsByScenario,
    calculationMode: CALCULATION_MODE,
    disclosure: "VALORES_NOMINALES_PROYECTADOS_NO_GARANTIZADOS"
  };
}

function fetchBanxicoSeries({ currency, startDate, endDate }) {
  const normalizedCurrency = normalizeCurrency(currency);
  const seriesId = BANXICO_SERIES[normalizedCurrency];
  const token = process.env.BANXICO_TOKEN || BANXICO_TOKEN;

  if (!startDate || !endDate) {
    throw new Error("Missing startDate or endDate for Banxico series query");
  }

  const options = {
    hostname: "www.banxico.org.mx",
    path: `/SieAPIRest/service/v1/series/${seriesId}/datos/${startDate}/${endDate}`,
    method: "GET",
    headers: {
      Accept: "application/json",
      "Bmx-Token": token
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let data = "";

      res.on("data", chunk => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          const serie = parsed.bmx.series[0];

          resolve({
            currency: normalizedCurrency,
            seriesId,
            source: "BANXICO_SIE_API",
            sourceMode: "LIVE_SERIES",
            title: serie.titulo,
            values: serie.datos.map(point => ({
              date: point.fecha,
              value: Number(String(point.dato).replace(",", ""))
            }))
          });
        } catch (error) {
          reject(
            new Error(
              `Banxico series parse error: ${error.message}. Raw: ${data.slice(0, 200)}`
            )
          );
        }
      });
    });

    req.on("error", reject);
    req.end();
  });
}

module.exports = {
  BANXICO_SERIES,
  CALCULATION_MODE,
  GLOBAL_UDI_PROJECTION_RATE,
  buildPolicyCurrencyTimeline,
  fetchBanxicoSeries,
  projectCurrencyValue
};
