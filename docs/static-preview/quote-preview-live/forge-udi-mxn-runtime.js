import {
  buildUdiProjectionTimeline,
  getVerifiedUdiRateMetadata
} from "./forge-quote-calculators.js";

const DEFAULT_SAVINGS_UDI_GROWTH_RATE = 0.04;
const SEGUBECA_UDI_GROWTH_RATE = 0.045;
const DEFAULT_MAX_POLICY_YEAR = 20;
const SEGUBECA_MXN_INTEGRATION_VERSION = "R14J_segubeca_projected_mxn_runtime_v1";
const SEGUBECA_PROJECTED_MXN_MODE = "PROJECTED_UDI_4_5_PERCENT_SCENARIO_NOT_GUARANTEED";
const SEGUBECA_CURRENT_MXN_MODE = "CURRENT_VERIFIED_UDI_RATE";

function finiteNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const parsed = Number(String(value).replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function firstNumber(...values) {
  for (const value of values) {
    const parsed = finiteNumber(value);
    if (parsed !== null) return parsed;
  }
  return null;
}

function normalizeKey(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function roundCurrency(value) {
  const number = finiteNumber(value);
  return number === null ? null : Math.round(number * 100) / 100;
}

function cloneObject(value) {
  if (Array.isArray(value)) return value.map(cloneObject);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, cloneObject(item)]));
}

async function fetchJson(url) {
  if (typeof fetch !== "function") return null;
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) return null;
  return response.json();
}

function cacheUrlCandidates() {
  const moduleCacheUrl = new URL("./forge-rate-cache.json", import.meta.url).href;
  return [
    moduleCacheUrl,
    "../../quote-preview-live/forge-rate-cache.json",
    "../../../quote-preview-live/forge-rate-cache.json",
    "../../../forge-rate-cache.json",
    "/ForgeOS/static-preview/quote-preview-live/forge-rate-cache.json"
  ];
}

function createBrowserUdiRateProvider({ cacheCandidates = cacheUrlCandidates() } = {}) {
  return async function browserUdiRateProvider107z15p2R11F2() {
    if (globalThis.ForgeQuoteUdiRateCache) return globalThis.ForgeQuoteUdiRateCache;
    for (const cacheUrl of cacheCandidates) {
      try {
        const cache = await fetchJson(cacheUrl);
        if (cache) return cache;
      } catch (error) {
        // Public cache lookup is best-effort; missing cache must not block the UI.
      }
    }
    return null;
  };
}

function normalizeMetadata(metadata) {
  if (!metadata || typeof metadata !== "object") {
    return {
      status: "BLOCKED_NO_VERIFIED_UDI_RATE",
      currentUdiValue: null,
      source: "not_available",
      sourceDate: null,
      sourceMode: null
    };
  }
  return {
    ...metadata,
    currentUdiValue: firstNumber(
      metadata.currentUdiValue,
      metadata.udiValue,
      metadata.value,
      metadata.rate
    )
  };
}

function projectionRowsFromTimeline(timeline) {
  return Array.isArray(timeline)
    ? timeline.map((entry) => ({
        year: entry.policyYear,
        policyYear: entry.policyYear,
        projectedUdiValue: entry.projectedUdiValue,
        growthRate: entry.growthRate
      }))
    : [];
}

function isSegubecaPacket(packet = {}) {
  const nativeResult = packet.nativeResult && typeof packet.nativeResult === "object"
    ? packet.nativeResult
    : {};
  const candidates = [
    packet.productFamily,
    packet.product_family,
    packet.productType,
    packet.product_type,
    packet.product,
    packet.productName,
    nativeResult.productFamily,
    nativeResult.product_family,
    nativeResult.productType,
    nativeResult.product_type,
    nativeResult.product,
    nativeResult.productName
  ];
  return candidates.some((candidate) => normalizeKey(candidate).replace(/\s+/g, "").includes("segubeca"));
}

function projectionRowForPolicyYear(projection, policyYear) {
  const year = Math.max(1, Math.round(firstNumber(policyYear) ?? 1));
  const rows = Array.isArray(projection?.rows) ? projection.rows : [];
  return rows.find((row) => firstNumber(row.policyYear, row.year) === year) || null;
}

function maxAdministrationProjectionYear(nativeResult, paymentYears) {
  const rows = Array.isArray(nativeResult?.administrationRows) ? nativeResult.administrationRows : [];
  const lastAdministrationYear = rows.reduce(
    (maximum, row) => Math.max(maximum, Math.round(firstNumber(row?.policyYear) ?? 0)),
    0
  );
  return Math.max(paymentYears, paymentYears + Math.max(0, lastAdministrationYear - 1));
}

function makeAmountPair({
  udi,
  projection,
  metadata,
  policyYear = 1,
  policyYearSource = "CURRENT_VALUE",
  mxnOverride = null,
  modeOverride = null
} = {}) {
  const udiAmount = finiteNumber(udi);
  if (udiAmount === null) return null;

  const year = Math.max(1, Math.round(firstNumber(policyYear) ?? 1));
  const projectionRow = projectionRowForPolicyYear(projection, year);
  const projectedUdiValue = firstNumber(
    projectionRow?.projectedUdiValue,
    year === 1 ? metadata?.currentUdiValue : null
  );
  const mxn = finiteNumber(mxnOverride) ?? (
    projectedUdiValue !== null ? roundCurrency(udiAmount * projectedUdiValue) : null
  );
  const isProjected = year > 1;

  return {
    udi: udiAmount,
    mxn,
    projectedMxn: mxn,
    projectedUdiValue,
    policyYear: year,
    policyYearSource,
    currencySource: metadata?.source || "not_available",
    currencySourceDate: metadata?.sourceDate || null,
    annualUdiGrowthRate: projection?.annualGrowthRate ?? null,
    calculationMode: modeOverride || (isProjected ? SEGUBECA_PROJECTED_MXN_MODE : SEGUBECA_CURRENT_MXN_MODE),
    projectionStatus: mxn === null ? "BLOCKED_NO_VERIFIED_UDI_RATE" : "READY",
    guaranteed: false,
    nativeCurrencyPreserved: true,
    integrationVersion: SEGUBECA_MXN_INTEGRATION_VERSION
  };
}

function deriveProjectedContributionTotal({ totalContributedUdi, paymentYears, projection, metadata } = {}) {
  const totalUdi = finiteNumber(totalContributedUdi);
  const years = Math.max(1, Math.round(firstNumber(paymentYears) ?? 1));
  if (totalUdi === null) return null;
  if (!metadata?.currentUdiValue || projection?.status !== "READY") {
    return makeAmountPair({
      udi: totalUdi,
      projection,
      metadata,
      policyYear: years,
      policyYearSource: "BLOCKED_NO_VERIFIED_UDI_RATE"
    });
  }

  const installmentUdi = totalUdi / years;
  let projectedMxn = 0;
  const schedule = [];
  for (let policyYear = 1; policyYear <= years; policyYear += 1) {
    const row = projectionRowForPolicyYear(projection, policyYear);
    const projectedUdiValue = firstNumber(row?.projectedUdiValue);
    if (projectedUdiValue === null) return null;
    const installmentMxn = roundCurrency(installmentUdi * projectedUdiValue);
    projectedMxn += installmentMxn;
    schedule.push({
      policyYear,
      installmentUdi: roundCurrency(installmentUdi),
      projectedUdiValue,
      installmentMxn
    });
  }

  return {
    ...makeAmountPair({
      udi: totalUdi,
      projection,
      metadata,
      policyYear: years,
      policyYearSource: "SOURCE_TOTAL_DISTRIBUTED_ACROSS_PAYMENT_TERM",
      mxnOverride: roundCurrency(projectedMxn),
      modeOverride: SEGUBECA_PROJECTED_MXN_MODE
    }),
    projectedContributionSchedule: schedule,
    installmentDerivation: "TOTAL_SOURCE_UDI_DIVIDED_BY_SOURCE_PAYMENT_YEARS"
  };
}

function sourceContextForSegubeca(nativeResult = {}, projection = {}) {
  const paymentYears = Math.max(1, Math.round(firstNumber(
    nativeResult.paymentYears,
    nativeResult.premiumPayingYears,
    nativeResult.baseCoverage?.coverageYears,
    nativeResult.paymentTerm,
    nativeResult.policyTerm,
    nativeResult.coveragePeriod,
    projection?.rows?.length,
    DEFAULT_MAX_POLICY_YEAR
  ) ?? DEFAULT_MAX_POLICY_YEAR));

  const administrationRows = Array.isArray(nativeResult.administrationRows)
    ? nativeResult.administrationRows
    : [];
  const firstAdministrationRow = administrationRows[0] || null;
  const finalAdministrationRow = administrationRows[administrationRows.length - 1] || null;
  const finalAdministrationYear = finalAdministrationRow
    ? paymentYears + Math.max(0, Math.round(firstNumber(finalAdministrationRow.policyYear) ?? 1) - 1)
    : paymentYears;

  return {
    paymentYears,
    maturityYear: paymentYears,
    finalAdministrationYear,
    firstAdministrationRow,
    finalAdministrationRow
  };
}

function linePolicyYear(line = {}, context = {}) {
  const id = normalizeKey(line.id || line.key || line.label).replace(/\s+/g, "_");
  const explicitYear = firstNumber(line.policyYear, line.policy_year, line.year);
  if (explicitYear !== null) {
    return { policyYear: explicitYear, policyYearSource: "LINE_EXPLICIT_POLICY_YEAR" };
  }

  if (["annual_premium", "annual_premium_with_recommended"].includes(id)) {
    return { policyYear: 1, policyYearSource: "CURRENT_QUOTE_VALUE" };
  }
  if (id === "total_contributed" || id === "total_contributed_udi") {
    return { policyYear: context.paymentYears, policyYearSource: "SOURCE_PAYMENT_TERM" };
  }
  if (["target_amount", "education_goal", "monthly_payout", "single_payment", "death_benefit_during_administration"].includes(id)) {
    return { policyYear: context.maturityYear, policyYearSource: "SOURCE_COVERAGE_TERM_TO_EDUCATION_MATURITY" };
  }
  if (["accumulated_delivery", "final_cash_value"].includes(id)) {
    return { policyYear: context.finalAdministrationYear, policyYearSource: "SOURCE_ADMINISTRATION_ROW_PLUS_COVERAGE_TERM" };
  }
  if (id === "final_recovery") {
    return { policyYear: context.paymentYears, policyYearSource: "SOURCE_PAYMENT_TERM_FINAL_GUARANTEED_ROW" };
  }
  return { policyYear: 1, policyYearSource: "CURRENT_CONTRACTUAL_VALUE" };
}

function enrichAmountValue(value, { projection, metadata, policyYear, policyYearSource, mxnOverride = null } = {}) {
  if (value === null || value === undefined || value === "") return value;
  if (typeof value === "object" && !Array.isArray(value)) {
    const udi = firstNumber(value.udi, value.amountUdi, value.valueUdi, value.value_udi);
    if (udi === null) return cloneObject(value);
    return {
      ...cloneObject(value),
      ...makeAmountPair({ udi, projection, metadata, policyYear, policyYearSource, mxnOverride })
    };
  }
  return makeAmountPair({ udi: value, projection, metadata, policyYear, policyYearSource, mxnOverride });
}

function enrichBenefitSummarySegubeca(benefitSummary, { nativeResult, projection, metadata, context } = {}) {
  const summary = cloneObject(benefitSummary || {});
  const blocks = Array.isArray(summary.blocks) ? summary.blocks : [];
  const totalContributionPair = deriveProjectedContributionTotal({
    totalContributedUdi: nativeResult.totalContributed,
    paymentYears: context.paymentYears,
    projection,
    metadata
  });

  for (const block of blocks) {
    const lines = [
      ...(Array.isArray(block.lines) ? block.lines : []),
      ...(Array.isArray(block.items) ? block.items : []),
      ...(Array.isArray(block.fields) ? block.fields : []),
      ...(Array.isArray(block.values) ? block.values : [])
    ];

    for (const line of lines) {
      const id = normalizeKey(line?.id || line?.key || line?.label).replace(/\s+/g, "_");
      const hasObjectUdi = line?.value && typeof line.value === "object" && finiteNumber(
        line.value.udi ?? line.value.amountUdi ?? line.value.valueUdi ?? line.value.value_udi
      ) !== null;
      if (line?.unit !== "UDI" && !hasObjectUdi) continue;

      if ((id === "total_contributed" || id === "total_contributed_udi") && totalContributionPair) {
        line.value = cloneObject(totalContributionPair);
        line.unit = undefined;
        continue;
      }

      const policy = linePolicyYear(line, context);
      line.value = enrichAmountValue(line.value, {
        projection,
        metadata,
        policyYear: policy.policyYear,
        policyYearSource: policy.policyYearSource
      });
      line.unit = undefined;
    }

    const benefitValues = [
      ...(Array.isArray(block.benefits) ? block.benefits : []),
      ...(Array.isArray(block.coverages) ? block.coverages : [])
    ];
    for (const benefit of benefitValues) {
      const policyYear = 1;
      const policyYearSource = "CURRENT_RECOMMENDED_COVERAGE_VALUE";
      if (benefit?.value && typeof benefit.value === "object") {
        benefit.value = enrichAmountValue(benefit.value, {
          projection,
          metadata,
          policyYear,
          policyYearSource
        });
      }
      if (Array.isArray(benefit?.fields)) {
        for (const field of benefit.fields) {
          if (!field?.value || typeof field.value !== "object") continue;
          field.value = enrichAmountValue(field.value, {
            projection,
            metadata,
            policyYear,
            policyYearSource
          });
        }
      }
    }
  }

  return {
    ...summary,
    currencyDisplay: "UDI_AND_MXN",
    mxnProjectionVersion: SEGUBECA_MXN_INTEGRATION_VERSION,
    mxnProjectionStatus: metadata?.currentUdiValue ? "READY" : "BLOCKED_NO_VERIFIED_UDI_RATE",
    annualUdiGrowthRate: projection?.annualGrowthRate ?? null
  };
}

function enrichMonetaryRow(row, fields, { projection, metadata, policyYear, policyYearSource } = {}) {
  if (!row || typeof row !== "object") return row;
  const enriched = { ...row };
  for (const field of fields) {
    const value = row[field];
    if (finiteNumber(value) === null) continue;
    const pair = makeAmountPair({ value, udi: value, projection, metadata, policyYear, policyYearSource });
    enriched[`${field}Amount`] = pair;
    enriched[`${field}Mxn`] = pair?.mxn ?? null;
  }
  enriched.projectionPolicyYear = policyYear;
  enriched.projectionPolicyYearSource = policyYearSource;
  return enriched;
}

function enrichNativeResultSegubeca(nativeResult, { projection, metadata, context } = {}) {
  const result = cloneObject(nativeResult || {});
  const currentContext = {
    projection,
    metadata,
    policyYear: 1,
    policyYearSource: "CURRENT_CONTRACTUAL_VALUE"
  };

  if (result.baseCoverage && typeof result.baseCoverage === "object") {
    const base = { ...result.baseCoverage };
    if (finiteNumber(base.sumAssured) !== null) {
      const targetPair = makeAmountPair({
        udi: base.sumAssured,
        projection,
        metadata,
        policyYear: context.maturityYear,
        policyYearSource: "SOURCE_COVERAGE_TERM_TO_EDUCATION_MATURITY"
      });
      base.sumAssuredAmount = targetPair;
      base.sumAssuredProjectedMxn = targetPair?.mxn ?? null;
    }
    if (finiteNumber(base.annualPremium) !== null) {
      const premiumPair = makeAmountPair({ udi: base.annualPremium, ...currentContext });
      base.annualPremiumAmount = premiumPair;
      base.annualPremiumMxn = premiumPair?.mxn ?? null;
    }
    result.baseCoverage = base;
  }

  result.coverages = Array.isArray(result.coverages)
    ? result.coverages.map((row) => enrichMonetaryRow(row, ["sumAssured", "annualPremium"], currentContext))
    : result.coverages;

  result.recommendedCoverages = Array.isArray(result.recommendedCoverages)
    ? result.recommendedCoverages.map((row) => enrichMonetaryRow(row, ["sumAssured", "annualPremium"], {
        ...currentContext,
        policyYearSource: "CURRENT_RECOMMENDED_COVERAGE_VALUE"
      }))
    : result.recommendedCoverages;

  result.guaranteedRows = Array.isArray(result.guaranteedRows)
    ? result.guaranteedRows.map((row, index) => {
        const policyYear = Math.min(context.paymentYears, index + 1);
        return enrichMonetaryRow(
          row,
          ["annualPremium", "accumulatedAnnualPremiumWithAve", "aveSurrenderValue", "cashValue", "totalRecovery", "basicSumAssured"],
          {
            projection,
            metadata,
            policyYear,
            policyYearSource: "SOURCE_GUARANTEED_TABLE_ROW_ORDER"
          }
        );
      })
    : result.guaranteedRows;

  result.administrationRows = Array.isArray(result.administrationRows)
    ? result.administrationRows.map((row) => {
        const administrationYear = Math.max(1, Math.round(firstNumber(row?.policyYear) ?? 1));
        const policyYear = context.maturityYear + administrationYear - 1;
        return enrichMonetaryRow(
          row,
          ["sumAssuredToAdminister", "monthlyDelivery", "accumulatedDelivery", "deathBenefit", "cashValue"],
          {
            projection,
            metadata,
            policyYear,
            policyYearSource: "SOURCE_ADMINISTRATION_ROW_PLUS_COVERAGE_TERM"
          }
        );
      })
    : result.administrationRows;

  const scalarCurrentFields = [
    "totalAnnualPremium",
    "annualPremium",
    "annualPremiumWithRecommended",
    "plannedOrAvePremium"
  ];
  for (const field of scalarCurrentFields) {
    if (finiteNumber(result[field]) === null) continue;
    const pair = makeAmountPair({ udi: result[field], ...currentContext });
    result[`${field}Amount`] = pair;
    result[`${field}Mxn`] = pair?.mxn ?? null;
  }

  if (finiteNumber(result.sumAssured) !== null) {
    const pair = makeAmountPair({
      udi: result.sumAssured,
      projection,
      metadata,
      policyYear: context.maturityYear,
      policyYearSource: "SOURCE_COVERAGE_TERM_TO_EDUCATION_MATURITY"
    });
    result.sumAssuredAmount = pair;
    result.sumAssuredProjectedMxn = pair?.mxn ?? null;
  }
  if (finiteNumber(result.sumInsured) !== null) {
    result.sumInsuredAmount = cloneObject(result.sumAssuredAmount);
    result.sumInsuredProjectedMxn = result.sumAssuredProjectedMxn ?? null;
  }

  if (finiteNumber(result.totalContributed) !== null) {
    const pair = deriveProjectedContributionTotal({
      totalContributedUdi: result.totalContributed,
      paymentYears: context.paymentYears,
      projection,
      metadata
    });
    result.totalContributedAmount = pair;
    result.totalContributedProjectedMxn = pair?.mxn ?? null;
  }

  if (finiteNumber(result.monthlyDelivery) !== null) {
    const pair = makeAmountPair({
      udi: result.monthlyDelivery,
      projection,
      metadata,
      policyYear: context.maturityYear,
      policyYearSource: "SOURCE_COVERAGE_TERM_TO_EDUCATION_MATURITY"
    });
    result.monthlyDeliveryAmount = pair;
    result.monthlyDeliveryProjectedMxn = pair?.mxn ?? null;
  }
  if (finiteNumber(result.accumulatedDelivery) !== null) {
    const pair = makeAmountPair({
      udi: result.accumulatedDelivery,
      projection,
      metadata,
      policyYear: context.finalAdministrationYear,
      policyYearSource: "SOURCE_ADMINISTRATION_ROW_PLUS_COVERAGE_TERM"
    });
    result.accumulatedDeliveryAmount = pair;
    result.accumulatedDeliveryProjectedMxn = pair?.mxn ?? null;
  }
  if (finiteNumber(result.totalRecovery) !== null) {
    const pair = makeAmountPair({
      udi: result.totalRecovery,
      projection,
      metadata,
      policyYear: context.paymentYears,
      policyYearSource: "SOURCE_PAYMENT_TERM_FINAL_GUARANTEED_ROW"
    });
    result.totalRecoveryAmount = pair;
    result.totalRecoveryProjectedMxn = pair?.mxn ?? null;
  }

  if (result.premiumTable && typeof result.premiumTable === "object") {
    const premiumTable = { ...result.premiumTable };
    for (const [field, value] of Object.entries(premiumTable)) {
      if (finiteNumber(value) === null) continue;
      const pair = makeAmountPair({ udi: value, ...currentContext });
      premiumTable[`${field}Amount`] = pair;
      premiumTable[`${field}Mxn`] = pair?.mxn ?? null;
    }
    result.premiumTable = premiumTable;
  }

  result.currencyDisplay = "UDI_AND_MXN";
  result.mxnProjectionVersion = SEGUBECA_MXN_INTEGRATION_VERSION;
  result.mxnProjectionStatus = metadata?.currentUdiValue ? "READY" : "BLOCKED_NO_VERIFIED_UDI_RATE";
  result.annualUdiGrowthRate = projection?.annualGrowthRate ?? null;
  return result;
}

function enrichSegubecaPacketWithProjectedMxn(packet, { projection, metadata } = {}) {
  if (!isSegubecaPacket(packet)) return packet;
  const nativeResult = packet.nativeResult && typeof packet.nativeResult === "object"
    ? packet.nativeResult
    : {};
  const context = sourceContextForSegubeca(nativeResult, projection);
  const enrichedNativeResult = enrichNativeResultSegubeca(nativeResult, {
    projection,
    metadata,
    context
  });
  const enrichedBenefitSummary = enrichBenefitSummarySegubeca(
    packet.benefitSummary || nativeResult.benefitSummary,
    {
      nativeResult: enrichedNativeResult,
      projection,
      metadata,
      context
    }
  );

  enrichedNativeResult.benefitSummary = enrichedBenefitSummary;

  return {
    ...packet,
    benefitSummary: enrichedBenefitSummary,
    currencyDisplay: "UDI_AND_MXN",
    mxnProjectionVersion: SEGUBECA_MXN_INTEGRATION_VERSION,
    mxnProjectionStatus: metadata?.currentUdiValue ? "READY" : "BLOCKED_NO_VERIFIED_UDI_RATE",
    nativeResult: enrichedNativeResult
  };
}

function createForgeUdiMxnRuntime({
  rateProvider = createBrowserUdiRateProvider(),
  annualGrowthRate = DEFAULT_SAVINGS_UDI_GROWTH_RATE,
  maxPolicyYear = DEFAULT_MAX_POLICY_YEAR
} = {}) {
  let metadataPromise = null;

  async function getCurrentUdiMetadata({ force = false } = {}) {
    if (!metadataPromise || force) {
      metadataPromise = getVerifiedUdiRateMetadata({ rateProvider })
        .then(normalizeMetadata)
        .catch(() => normalizeMetadata(null));
    }
    return metadataPromise;
  }

  async function getCurrentUdiValue(options) {
    const metadata = await getCurrentUdiMetadata(options);
    return metadata.currentUdiValue;
  }

  async function buildProjection({ policyYears = maxPolicyYear, growthRate = annualGrowthRate } = {}) {
    const metadata = await getCurrentUdiMetadata();
    if (!metadata.currentUdiValue) {
      return {
        status: "BLOCKED_NO_VERIFIED_UDI_RATE",
        timeline: [],
        rows: [],
        annualGrowthRate: growthRate,
        source: "FORGE_UDI_PROJECTION_ENGINE"
      };
    }
    const timeline = buildUdiProjectionTimeline({
      baseUdiValue: metadata.currentUdiValue,
      baseAge: 1,
      maxAge: Math.max(1, Number(policyYears) || maxPolicyYear),
      annualGrowthRate: growthRate
    });
    const rows = projectionRowsFromTimeline(timeline);
    return {
      status: "READY",
      timeline,
      rows,
      projectionRows: rows,
      annualGrowthRate: growthRate,
      source: "FORGE_UDI_PROJECTION_ENGINE",
      baseUdi: {
        value: metadata.currentUdiValue,
        source: metadata.source,
        date: metadata.sourceDate
      }
    };
  }

  async function projectUdiValueForPolicyYear(policyYear, options = {}) {
    const projection = await buildProjection(options);
    const year = firstNumber(policyYear);
    const match = projection.rows.find((row) => row.policyYear === year || row.year === year);
    return match?.projectedUdiValue ?? null;
  }

  async function convertUdiToCurrentMxn(udiAmount) {
    const amount = finiteNumber(udiAmount);
    const currentUdiValue = await getCurrentUdiValue();
    return amount !== null && currentUdiValue !== null ? amount * currentUdiValue : null;
  }

  async function convertUdiToProjectedMxn(udiAmount, policyYear, options = {}) {
    const amount = finiteNumber(udiAmount);
    const projectedUdiValue = await projectUdiValueForPolicyYear(policyYear, options);
    return amount !== null && projectedUdiValue !== null ? amount * projectedUdiValue : null;
  }

  async function enrichAcceptedQuotePacket(packet = {}) {
    const metadata = await getCurrentUdiMetadata();
    const nativeResult = packet.nativeResult && typeof packet.nativeResult === "object"
      ? packet.nativeResult
      : {};
    const paymentYears = Math.max(1, Math.round(firstNumber(
      nativeResult.paymentYears,
      nativeResult.premiumPayingYears,
      nativeResult.baseCoverage?.coverageYears,
      nativeResult.paymentTerm,
      nativeResult.policyTerm,
      nativeResult.coveragePeriod,
      packet.paymentYears,
      packet.coveragePeriod,
      maxPolicyYear
    ) ?? maxPolicyYear));
    const segubecaPacket = isSegubecaPacket(packet);
    const projectionHorizon = segubecaPacket
      ? maxAdministrationProjectionYear(nativeResult, paymentYears)
      : paymentYears;
    const projection = await buildProjection({
      policyYears: projectionHorizon,
      growthRate: segubecaPacket ? SEGUBECA_UDI_GROWTH_RATE : annualGrowthRate
    });
    const basePacket = {
      ...packet,
      currencyMetadata: metadata,
      udiRateMetadata: metadata,
      udiProjection: projection,
      nativeResult: {
        ...nativeResult,
        currencyMetadata: metadata,
        udiRateMetadata: metadata,
        udiProjection: projection,
        udiProjectionRows: projection.rows
      }
    };
    return enrichSegubecaPacketWithProjectedMxn(basePacket, { projection, metadata });
  }

  return Object.freeze({
    getCurrentUdiMetadata,
    getCurrentUdiValue,
    buildProjection,
    projectUdiValueForPolicyYear,
    convertUdiToCurrentMxn,
    convertUdiToProjectedMxn,
    enrichAcceptedQuotePacket,
    rateProvider,
    projectionDefaults: Object.freeze({ annualGrowthRate, maxPolicyYear })
  });
}

const runtime = createForgeUdiMxnRuntime();
globalThis.ForgeQuoteUdiRateProvider = runtime.rateProvider;
globalThis.ForgeUdiMxnRuntime = runtime;
globalThis.dispatchEvent?.(new CustomEvent("forge:udi-mxn-runtime-ready", { detail: runtime }));

export {
  DEFAULT_SAVINGS_UDI_GROWTH_RATE,
  SEGUBECA_UDI_GROWTH_RATE,
  SEGUBECA_MXN_INTEGRATION_VERSION,
  createBrowserUdiRateProvider,
  createForgeUdiMxnRuntime,
  enrichSegubecaPacketWithProjectedMxn
};
