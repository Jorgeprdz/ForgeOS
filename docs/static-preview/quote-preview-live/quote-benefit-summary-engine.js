const ALLOWED_BLOCK_TYPES = new Set([
  "contribution_summary",
  "protection_summary",
  "retirement_scenarios",
  "scheduled_endowments",
  "education_payout",
  "recovery_summary",
  "women_health_benefits",
  "recommended_benefits",
  "missing_information"
]);

const SCENARIO_ALIASES = {
  favorable: "favorable",
  optimista: "favorable",
  alto: "favorable",
  aggressive: "favorable",
  agresivo: "favorable",
  base: "base",
  actual: "base",
  medio: "base",
  expected: "base",
  esperado: "base",
  desfavorable: "unfavorable",
  unfavorable: "unfavorable",
  conservador: "unfavorable",
  conservative: "unfavorable",
  bajo: "unfavorable"
};

const SCENARIO_LABELS = {
  favorable: "Favorable",
  base: "Actual",
  unfavorable: "Desfavorable"
};

const REQUIRED_RETIREMENT_SCENARIOS = ["favorable", "base", "unfavorable"];

function finiteNumberOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function firstFiniteNumber(...values) {
  for (const value of values) {
    const number = finiteNumberOrNull(value);
    if (number !== null) return number;
  }
  return null;
}

function hasFiniteNumber(...values) {
  return firstFiniteNumber(...values) !== null;
}

function normalizeKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function normalizeProductFamily({
  productFamily,
  product,
  nativeResult,
  context
} = {}) {
  const raw = [
    productFamily,
    product,
    context?.productFamily,
    context?.product,
    context?.productName,
    nativeResult?.productFamily,
    nativeResult?.productName,
    nativeResult?.product
  ]
    .filter(Boolean)
    .join(" ");
  const normalized = normalizeKey(raw);

  if (normalized.includes("imagina_ser")) return "imagina_ser";
  if (
    normalized.includes("ppr") ||
    normalized.includes("plan_personal_de_retiro") ||
    normalized.includes("ahorro_para_el_retiro") ||
    normalized.includes("retiro")
  ) {
    return "retirement_scenarios";
  }
  if (normalized.includes("vida_mujer")) return "vida_mujer";
  if (normalized.includes("segu_beca") || normalized.includes("segubeca")) {
    return "segubeca";
  }
  if (normalized.includes("orvi")) return "orvi";

  return normalized || "unknown";
}

function normalizeScenarioId(value) {
  const normalized = normalizeKey(value);
  return SCENARIO_ALIASES[normalized] || normalized;
}

function createLine({ id, label, value, unit = null, source = null }) {
  return { id, label, value, unit, source };
}

function createMissingBlock(lines) {
  const normalizedLines = lines.filter(Boolean);
  if (!normalizedLines.length) return null;
  return {
    type: "missing_information",
    title: "Faltantes antes de presentar",
    lines: normalizedLines.map((line) =>
      typeof line === "string"
        ? { id: normalizeKey(line), label: line, severity: "missing" }
        : line
    )
  };
}

function getNestedValue(root, path) {
  return path.reduce((current, key) => current?.[key], root);
}

function firstPathValue(root, paths) {
  for (const path of paths) {
    const value = getNestedValue(root, path);
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return null;
}

function findTimelineEntry({ timeline, targetAge }) {
  if (!Array.isArray(timeline)) return null;
  const normalizedTargetAge = finiteNumberOrNull(targetAge);
  if (normalizedTargetAge === null) return null;
  return timeline.find((entry) => finiteNumberOrNull(entry?.age) === normalizedTargetAge) || null;
}

function resolveProjectedUdiValue({ scenario, udiProjection, targetAge }) {
  const direct = firstFiniteNumber(
    scenario?.projectedUdiValue,
    scenario?.projectedUdiAtRetirement,
    scenario?.udiValueAtRetirement,
    scenario?.singlePayment?.projectedUdiValue,
    scenario?.monthlyIncome?.projectedUdiValue
  );
  if (direct !== null) return direct;

  const retirement = udiProjection?.retirement;
  const projectedFromProjection = firstFiniteNumber(
    retirement?.singlePayment?.projectedUdiValue,
    retirement?.monthlyIncome?.projectedUdiValue,
    retirement?.annualIncome?.projectedUdiValue,
    udiProjection?.projectedUdiAtRetirement,
    udiProjection?.summary?.projectedUdiAtRetirement
  );
  if (projectedFromProjection !== null) return projectedFromProjection;

  return firstFiniteNumber(
    findTimelineEntry({
      timeline: udiProjection?.timeline?.retirement,
      targetAge
    })?.projectedUdiValue,
    findTimelineEntry({
      timeline: udiProjection?.timeline?.savings,
      targetAge
    })?.projectedUdiValue
  );
}

function buildAmountAtProjectedAge({ amountUdi, mxn, projectedUdiValue, targetAge }) {
  const normalizedUdi = finiteNumberOrNull(amountUdi);
  const normalizedMxn = finiteNumberOrNull(mxn);
  const normalizedProjectedUdiValue = finiteNumberOrNull(projectedUdiValue);

  if (normalizedUdi === null && normalizedMxn === null) return null;

  return {
    udi: normalizedUdi,
    mxn:
      normalizedMxn ??
      (normalizedUdi !== null && normalizedProjectedUdiValue !== null
        ? normalizedUdi * normalizedProjectedUdiValue
        : null),
    projectedUdiValue: normalizedProjectedUdiValue,
    targetAge: finiteNumberOrNull(targetAge)
  };
}

function collectScenarioSources({ nativeResult, udiProjection }) {
  const sources = [];

  for (const source of [
    nativeResult?.scenarios,
    nativeResult?.retirementScenarios,
    nativeResult?.parsedQuote?.scenarios,
    udiProjection?.scenarios,
    udiProjection?.retirement?.scenarios
  ]) {
    if (!source || typeof source !== "object") continue;

    if (Array.isArray(source)) {
      for (const scenario of source) {
        const id = normalizeScenarioId(
          scenario?.id || scenario?.name || scenario?.label || scenario?.scenario
        );
        if (id) sources.push([id, scenario]);
      }
      continue;
    }

    for (const [key, value] of Object.entries(source)) {
      sources.push([normalizeScenarioId(key), value]);
    }
  }

  if (udiProjection?.retirement?.singlePayment || udiProjection?.retirement?.monthlyIncome) {
    sources.push([
      "base",
      {
        singlePayment: udiProjection.retirement.singlePayment,
        monthlyIncome: udiProjection.retirement.monthlyIncome,
        annualIncome: udiProjection.retirement.annualIncome,
        accumulatedIncome: udiProjection.retirement.accumulatedIncome
      }
    ]);
  }

  if (
    hasFiniteNumber(
      udiProjection?.summary?.lumpSumUDI,
      udiProjection?.summary?.monthlyIncomeUDI
    )
  ) {
    sources.push([
      "base",
      {
        lumpSum: udiProjection.summary.lumpSumUDI,
        lumpSumMXN: udiProjection.summary.lumpSumMXN,
        monthlyIncome: udiProjection.summary.monthlyIncomeUDI,
        monthlyIncomeMXN: udiProjection.summary.monthlyIncomeMXN,
        annualIncome: udiProjection.summary.annualIncomeUDI,
        annualIncomeMXN: udiProjection.summary.annualIncomeMXN,
        projectedUdiValue: udiProjection.summary.projectedUdiAtRetirement,
        targetAge: udiProjection.summary.retirementAge
      }
    ]);
  }

  return sources;
}

function scenarioHasEvidence(scenario) {
  if (!scenario || typeof scenario !== "object") return false;
  return hasFiniteNumber(
    scenario.lumpSum,
    scenario.singlePayment,
    scenario.singlePaymentUdi,
    scenario.singlePaymentUDI,
    scenario.monthlyIncome,
    scenario.monthlyIncomeUdi,
    scenario.monthlyIncomeUDI,
    scenario.annualIncome,
    scenario.annualIncomeUdi,
    scenario.annualIncomeUDI,
    scenario.singlePayment?.udi,
    scenario.singlePayment?.mxnAtRetirement,
    scenario.monthlyIncome?.udi,
    scenario.monthlyIncome?.mxnAtRetirement,
    scenario.annualIncome?.udi,
    scenario.annualIncome?.mxnAtRetirement
  );
}

function normalizeScenario({ id, scenario, nativeResult, udiProjection }) {
  const targetAge = firstFiniteNumber(
    scenario?.targetAge,
    scenario?.retirementAge,
    nativeResult?.retirementAge,
    udiProjection?.retirement?.singlePayment?.targetAge,
    udiProjection?.summary?.retirementAge
  );
  const projectedUdiValue = resolveProjectedUdiValue({
    scenario,
    udiProjection,
    targetAge
  });
  const singlePayment = buildAmountAtProjectedAge({
    amountUdi: firstFiniteNumber(
      scenario?.singlePayment?.udi,
      scenario?.singlePaymentUdi,
      scenario?.singlePaymentUDI,
      scenario?.lumpSum,
      scenario?.lumpSumUdi,
      scenario?.lumpSumUDI
    ),
    mxn: firstFiniteNumber(
      scenario?.singlePayment?.mxn,
      scenario?.singlePaymentMxn,
      scenario?.singlePaymentMXN,
      scenario?.lumpSumMxn,
      scenario?.lumpSumMXN,
      scenario?.singlePayment?.mxnAtRetirement
    ),
    projectedUdiValue:
      firstFiniteNumber(scenario?.singlePayment?.projectedUdiValue) ??
      projectedUdiValue,
    targetAge
  });
  const monthlyIncome = buildAmountAtProjectedAge({
    amountUdi: firstFiniteNumber(
      scenario?.monthlyIncome?.udi,
      scenario?.monthlyIncomeUdi,
      scenario?.monthlyIncomeUDI,
      scenario?.monthlyIncome
    ),
    mxn: firstFiniteNumber(
      scenario?.monthlyIncome?.mxn,
      scenario?.monthlyIncomeMxn,
      scenario?.monthlyIncomeMXN,
      scenario?.monthlyIncome?.mxnAtRetirement
    ),
    projectedUdiValue:
      firstFiniteNumber(scenario?.monthlyIncome?.projectedUdiValue) ??
      projectedUdiValue,
    targetAge
  });
  const annualIncomeUdi = firstFiniteNumber(
    scenario?.annualIncome?.udi,
    scenario?.annualIncomeUdi,
    scenario?.annualIncomeUDI,
    scenario?.annualIncome,
    monthlyIncome?.udi === null ? null : monthlyIncome?.udi * 12
  );
  const annualIncome = buildAmountAtProjectedAge({
    amountUdi: annualIncomeUdi,
    mxn: firstFiniteNumber(
      scenario?.annualIncome?.mxn,
      scenario?.annualIncomeMxn,
      scenario?.annualIncomeMXN,
      scenario?.annualIncome?.mxnAtRetirement
    ),
    projectedUdiValue:
      firstFiniteNumber(scenario?.annualIncome?.projectedUdiValue) ??
      projectedUdiValue,
    targetAge
  });
  const accumulatedIncome =
    scenario?.accumulatedIncome ??
    scenario?.retirement?.accumulatedIncome ??
    (id === "base" ? udiProjection?.retirement?.accumulatedIncome : null) ??
    [];

  return {
    id,
    label: SCENARIO_LABELS[id] || scenario?.label || id,
    singlePayment,
    monthlyIncome,
    annualIncome,
    accumulatedIncome: Array.isArray(accumulatedIncome) ? accumulatedIncome : []
  };
}

function buildContributionSummary({ nativeResult, udiProjection }) {
  const premium = nativeResult?.premiumStructure || {};
  const annualPremiumUdi = firstFiniteNumber(
    premium.totalAnnualPremium,
    nativeResult?.annualPremiumUdi,
    nativeResult?.totalAnnualPremiumUdi
  );
  const premiumPayingYears = firstFiniteNumber(
    premium.premiumPayingYears,
    nativeResult?.premiumPayingYears,
    udiProjection?.premiumPayingYears
  );
  const totalContributedUdi = firstFiniteNumber(
    udiProjection?.totalContributed?.udi,
    udiProjection?.summary?.totalContributedUDI,
    nativeResult?.totalContributedUdi,
    annualPremiumUdi !== null && premiumPayingYears !== null
      ? annualPremiumUdi * premiumPayingYears
      : null
  );
  const totalContributedMxn = firstFiniteNumber(
    udiProjection?.totalContributed?.mxn,
    udiProjection?.summary?.totalContributedMXN,
    nativeResult?.totalContributedMxn,
    nativeResult?.totalContributedMXN
  );

  if (totalContributedUdi === null && totalContributedMxn === null && premiumPayingYears === null) {
    return null;
  }

  return {
    type: "contribution_summary",
    title: "Lo que aportas",
    lines: [
      createLine({
        id: "total_contributed_udi",
        label: "Total aportado",
        value: totalContributedUdi,
        unit: "UDI",
        source: totalContributedUdi === udiProjection?.totalContributed?.udi ? "udiProjection" : "nativeResult"
      }),
      createLine({
        id: "total_contributed_mxn_projected",
        label: "Total aportado proyectado",
        value: totalContributedMxn,
        unit: "MXN",
        source: totalContributedMxn === udiProjection?.totalContributed?.mxn ? "udiProjection" : "nativeResult"
      }),
      createLine({
        id: "premium_paying_years",
        label: "Años de pago",
        value: premiumPayingYears,
        unit: "years",
        source: "nativeResult"
      })
    ].filter((line) => line.value !== null)
  };
}

function buildProtectionSummary({ nativeResult, udiProjection }) {
  const sumAssuredUdi = firstFiniteNumber(
    udiProjection?.protection?.death?.udi,
    nativeResult?.sumAssuredUdi,
    nativeResult?.sumAssured,
    nativeResult?.sumInsured
  );
  const sumAssuredMxnCurrent = firstFiniteNumber(
    udiProjection?.protection?.death?.mxnCurrent,
    nativeResult?.sumAssuredMxnCurrent,
    nativeResult?.sumAssuredMXNCurrent
  );

  if (sumAssuredUdi === null && sumAssuredMxnCurrent === null) return null;

  return {
    type: "protection_summary",
    title: "Lo que proteges",
    lines: [
      createLine({
        id: "sum_assured_udi",
        label: "Suma asegurada",
        value: sumAssuredUdi,
        unit: "UDI",
        source: sumAssuredUdi === udiProjection?.protection?.death?.udi ? "udiProjection" : "nativeResult"
      }),
      createLine({
        id: "sum_assured_mxn_current",
        label: "Suma asegurada actual",
        value: sumAssuredMxnCurrent,
        unit: "MXN",
        source: sumAssuredMxnCurrent === udiProjection?.protection?.death?.mxnCurrent ? "udiProjection" : "nativeResult"
      })
    ].filter((line) => line.value !== null)
  };
}

function buildRetirementScenarios({ nativeResult, udiProjection }) {
  const scenarioMap = new Map();

  for (const [id, scenario] of collectScenarioSources({ nativeResult, udiProjection })) {
    if (!REQUIRED_RETIREMENT_SCENARIOS.includes(id)) continue;
    if (!scenarioHasEvidence(scenario)) continue;
    if (!scenarioMap.has(id)) scenarioMap.set(id, scenario);
  }

  const scenarios = REQUIRED_RETIREMENT_SCENARIOS
    .filter((id) => scenarioMap.has(id))
    .map((id) =>
      normalizeScenario({
        id,
        scenario: scenarioMap.get(id),
        nativeResult,
        udiProjection
      })
    );
  const missing = REQUIRED_RETIREMENT_SCENARIOS
    .filter((id) => !scenarioMap.has(id))
    .map((id) => `Falta escenario ${SCENARIO_LABELS[id].toLowerCase()}`);

  if (!scenarios.length) return null;

  return {
    type: "retirement_scenarios",
    title: "Escenarios de retiro",
    scenarios,
    missing
  };
}

function buildRetirementBenefitSummary({ nativeResult = {}, udiProjection = {} }) {
  const blocks = [
    buildContributionSummary({ nativeResult, udiProjection }),
    buildProtectionSummary({ nativeResult, udiProjection }),
    buildRetirementScenarios({ nativeResult, udiProjection })
  ].filter(Boolean);

  const missing = [];

  const retirementBlock = blocks.find((block) => block.type === "retirement_scenarios");
  if (retirementBlock?.missing?.length) {
    missing.push(...retirementBlock.missing);
  }

  if (!retirementBlock) {
    missing.push("Faltan datos de recuperación o escenarios de retiro");
  }

  if (!blocks.some((block) => block.type === "contribution_summary")) {
    missing.push("Faltan datos de aportación");
  }

  if (!blocks.some((block) => block.type === "protection_summary")) {
    missing.push("Faltan datos de protección");
  }

  const missingBlock = createMissingBlock(missing);
  if (missingBlock) blocks.push(missingBlock);

  return blocks.filter((block) => ALLOWED_BLOCK_TYPES.has(block.type));
}


const VIDA_MUJER_PCF_DISEASES = Object.freeze([
  ["Tumor maligno de mama", 1],
  ["Tumor maligno de mama localizado", 0.47],
  ["Tumor maligno de ovario", 0.38],
  ["Tumor maligno de útero", 0.21],
  ["Tumor maligno de útero localizado", 0.12],
  ["Tumor maligno de trompas de falopio", 0.12],
  ["Tumor benigno de vagina o vulva", 0.09],
]);

function firstVidaMujerNumber(...values) {
  for (const value of values) {
    const number = finiteNumberOrNull(value);
    if (number !== null) return number;
  }
  return null;
}

function vidaMujerRowsFromMaybeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function vidaMujerCoverageName(coverage) {
  return String(
    coverage?.name ??
    coverage?.coverage ??
    coverage?.label ??
    coverage?.description ??
    coverage?.benefit ??
    coverage?.code ??
    ""
  );
}

function vidaMujerCoverageMatches(coverage, patterns) {
  const haystack = normalizeKey(vidaMujerCoverageName(coverage));
  return patterns.some((pattern) => haystack.includes(normalizeKey(pattern)));
}

function vidaMujerAllCoverages(nativeResult = {}) {
  return [
    ...vidaMujerRowsFromMaybeArray(nativeResult.coverages),
    ...vidaMujerRowsFromMaybeArray(nativeResult.basicCoverages),
    ...vidaMujerRowsFromMaybeArray(nativeResult.includedCoverages),
    ...vidaMujerRowsFromMaybeArray(nativeResult.optionalCoverages),
    ...vidaMujerRowsFromMaybeArray(nativeResult.additionalCoverages),
  ];
}

function vidaMujerRecommendedCoverages(nativeResult = {}) {
  return [
    ...vidaMujerRowsFromMaybeArray(nativeResult.recommendedCoverages),
    ...vidaMujerRowsFromMaybeArray(nativeResult.recommendedBenefits),
    ...vidaMujerRowsFromMaybeArray(nativeResult.advisedCoverages),
    ...vidaMujerRowsFromMaybeArray(nativeResult.optionalRecommendedCoverages),
  ];
}

function vidaMujerCoverageAmount(coverage, keys = []) {
  return firstVidaMujerNumber(
    ...keys.map((key) => coverage?.[key]),
    coverage?.sumAssured,
    coverage?.sumaAsegurada,
    coverage?.insuredAmount,
    coverage?.amount,
    coverage?.value
  );
}

function vidaMujerCoveragePremium(coverage) {
  return firstVidaMujerNumber(
    coverage?.annualPremium,
    coverage?.primaAnualizada,
    coverage?.premium,
    coverage?.prima
  );
}

function findVidaMujerCoverageAmount(coverages, patterns, keys = []) {
  const found = coverages.find((coverage) => vidaMujerCoverageMatches(coverage, patterns));
  return found ? vidaMujerCoverageAmount(found, keys) : null;
}

function findVidaMujerCoverageLabel(coverages, patterns) {
  return coverages.find((coverage) => vidaMujerCoverageMatches(coverage, patterns)) || null;
}

function vidaMujerGuaranteedRows(nativeResult = {}) {
  return [
    ...vidaMujerRowsFromMaybeArray(nativeResult.guaranteedValues),
    ...vidaMujerRowsFromMaybeArray(nativeResult.guaranteedValueRows),
    ...vidaMujerRowsFromMaybeArray(nativeResult.valoresGarantizados),
    ...vidaMujerRowsFromMaybeArray(nativeResult.cashValueRows),
  ];
}

function vidaMujerRowNumber(row, keys = []) {
  return firstVidaMujerNumber(...keys.map((key) => row?.[key]));
}

function vidaMujerFinalGuaranteedRow(rows) {
  if (!rows.length) return null;
  const scored = rows
    .map((row, index) => ({
      row,
      index,
      age: vidaMujerRowNumber(row, ["age", "realAge", "edad", "edadReal"]),
      year: vidaMujerRowNumber(row, ["year", "policyYear", "anio", "año"]),
      total:
        vidaMujerRowNumber(row, [
          "annualPremiumAccumulatedWithAve",
          "primaAnualAcumuladaConAve",
          "premiumAccumulatedWithAve",
          "accumulatedPremiumWithAve",
        ]) ?? 0,
    }))
    .sort((a, b) => (a.year ?? a.age ?? a.index) - (b.year ?? b.age ?? b.index));

  return scored[scored.length - 1]?.row || null;
}

function vidaMujerUdiLabel(value) {
  const number = finiteNumberOrNull(value);
  if (number === null) return null;
  return `${new Intl.NumberFormat("es-MX", { maximumFractionDigits: 0 }).format(Math.round(number))} UDI`;
}

function vidaMujerMxnLabel(value) {
  const number = finiteNumberOrNull(value);
  if (number === null) return null;
  return `≈ $${new Intl.NumberFormat("es-MX", { maximumFractionDigits: 0 }).format(Math.round(number))} MXN`;
}

function vidaMujerPercentLabel(value) {
  const number = finiteNumberOrNull(value);
  if (number === null) return null;
  return `${new Intl.NumberFormat("es-MX", { maximumFractionDigits: 2 }).format(number)}%`;
}

function vidaMujerPushRow(rows, label, value) {
  if (value === null || value === undefined || value === "") return;
  rows.push({ label, value: String(value) });
}

function vidaMujerSumAssured(nativeResult = {}, coverages = []) {
  return firstVidaMujerNumber(
    nativeResult.sumAssured,
    nativeResult.sumaAsegurada,
    nativeResult.basicSumAssured,
    nativeResult.sumaAseguradaBasico,
    nativeResult.insuredAmount,
    findVidaMujerCoverageAmount(coverages, ["vida mujer", "fallecimiento", "basico", "básico"])
  );
}

function vidaMujerAnnualPremium(nativeResult = {}) {
  return firstVidaMujerNumber(
    nativeResult.totalAnnualPremium,
    nativeResult.primaTotalAnual,
    nativeResult.annualPremium,
    nativeResult.premiumTable?.annual,
    nativeResult.premium
  );
}

function buildVidaMujerEndowmentRows(sumAssured) {
  const assured = finiteNumberOrNull(sumAssured);
  if (assured === null) return [];

  const dotal = assured * 0.05;
  const finalPayment = assured * 0.8;
  const rows = [];

  for (const year of [5, 7, 9, 11, 13, 15, 17]) {
    rows.push({ label: `Dotal año ${year}`, value: vidaMujerUdiLabel(dotal) });
  }

  rows.push({ label: "Dotal final año 20", value: vidaMujerUdiLabel(finalPayment) });
  rows.push({ label: "Total dotales por supervivencia", value: vidaMujerUdiLabel(assured * 1.15) });

  return rows;
}

function buildVidaMujerPcfRows({ pcfSumAssured, currentUdiValue }) {
  const assured = finiteNumberOrNull(pcfSumAssured);
  if (assured === null) return [];

  return VIDA_MUJER_PCF_DISEASES.map(([name, percent]) => {
    const amountUdi = assured * percent;
    const parts = [
      `${Math.round(percent * 100)}%`,
      vidaMujerUdiLabel(amountUdi),
    ];

    if (finiteNumberOrNull(currentUdiValue) !== null) {
      parts.push(vidaMujerMxnLabel(amountUdi * currentUdiValue));
    }

    return {
      label: `PCF - ${name}`,
      value: parts.filter(Boolean).join(" · "),
    };
  });
}


// FORGE:107Z15P2_R9F3_VIDA_MUJER_DESATURATION:START
function r9f3VidaMujerNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const parsed = Number(String(value).replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function r9f3VidaMujerFirstNumber(...values) {
  for (const value of values) {
    const parsed = r9f3VidaMujerNumber(value);
    if (parsed !== null) return parsed;
  }
  return null;
}

function r9f3VidaMujerRows(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function r9f3VidaMujerUdi(value) {
  const parsed = r9f3VidaMujerNumber(value);
  if (parsed === null) return null;
  return `${Math.round(parsed).toLocaleString("es-MX")} UDI`;
}

function r9f3VidaMujerMxn(value) {
  const parsed = r9f3VidaMujerNumber(value);
  if (parsed === null) return null;
  return `≈ $${Math.round(parsed).toLocaleString("es-MX")} MXN`;
}

function r9f3VidaMujerUdiMxn(udi, rate, suffix = "") {
  const udiLabel = r9f3VidaMujerUdi(udi);
  if (!udiLabel) return null;
  const mxn = r9f3VidaMujerNumber(rate) === null ? null : r9f3VidaMujerMxn(Number(udi) * Number(rate));
  return [udiLabel, mxn].filter(Boolean).join(" · ") + suffix;
}

function r9f3VidaMujerCurrentUdiRate(currencyMetadata = {}) {
  return r9f3VidaMujerFirstNumber(
    currencyMetadata.currentUdiValue,
    currencyMetadata.udiValue,
    currencyMetadata.value,
    currencyMetadata.rate
  );
}

function r9f3VidaMujerProjectionRateForYear({ year, currentUdiValue, udiProjection = {}, nativeResult = {} } = {}) {
  const candidates = [
    ...(Array.isArray(udiProjection?.rows) ? udiProjection.rows : []),
    ...(Array.isArray(udiProjection?.projectionRows) ? udiProjection.projectionRows : []),
    ...(Array.isArray(udiProjection?.years) ? udiProjection.years : []),
    ...(Array.isArray(udiProjection?.annualProjection) ? udiProjection.annualProjection : []),
    ...(Array.isArray(nativeResult?.udiProjectionRows) ? nativeResult.udiProjectionRows : []),
    ...(Array.isArray(nativeResult?.udiProjection) ? nativeResult.udiProjection : [])
  ];

  const match = candidates.find((row) => {
    const rowYear = r9f3VidaMujerFirstNumber(row?.year, row?.policyYear, row?.anio, row?.año);
    return rowYear === year;
  });

  return r9f3VidaMujerFirstNumber(
    match?.udiValue,
    match?.projectedUdiValue,
    match?.value,
    match?.rate,
    currentUdiValue
  );
}

function r9f3VidaMujerCoveragePremiumTotal(coverages) {
  return coverages.reduce((total, coverage) => {
    const premium = r9f3VidaMujerFirstNumber(
      coverage?.annualPremium,
      coverage?.premium,
      coverage?.primaAnual,
      coverage?.amount
    );
    return premium === null ? total : total + premium;
  }, 0);
}

function r9f3VidaMujerFinalGuaranteedRow(nativeResult = {}) {
  const rows = [
    ...r9f3VidaMujerRows(nativeResult.guaranteedValues),
    ...r9f3VidaMujerRows(nativeResult.guaranteedValueRows),
    ...r9f3VidaMujerRows(nativeResult.valoresGarantizados),
    ...r9f3VidaMujerRows(nativeResult.cashValueRows)
  ];

  if (!rows.length) return null;

  return rows
    .map((row, index) => ({
      row,
      index,
      age: r9f3VidaMujerFirstNumber(row.age, row.realAge, row.edad, row.edadReal),
      year: r9f3VidaMujerFirstNumber(row.year, row.policyYear, row.anio, row.año)
    }))
    .sort((left, right) => (left.year ?? left.age ?? left.index) - (right.year ?? right.age ?? right.index))
    .at(-1)?.row || null;
}

function r9f3VidaMujerRowNumber(row, keys) {
  if (!row) return null;
  return r9f3VidaMujerFirstNumber(...keys.map((key) => row?.[key]));
}

function r9f3VidaMujerContributionRows({ nativeResult = {}, currencyMetadata = {} } = {}) {
  const currentUdiValue = r9f3VidaMujerCurrentUdiRate(currencyMetadata);
  const finalRow = r9f3VidaMujerFinalGuaranteedRow(nativeResult);

  const baseAnnualPremium = r9f3VidaMujerFirstNumber(
    nativeResult.totalAnnualPremium,
    nativeResult.annualPremium,
    nativeResult.primaTotalAnual,
    nativeResult.premiumTable?.annual
  );

  const recommendedPremium = r9f3VidaMujerCoveragePremiumTotal([
    ...r9f3VidaMujerRows(nativeResult.recommendedCoverages),
    ...r9f3VidaMujerRows(nativeResult.recommendedBenefits),
    ...r9f3VidaMujerRows(nativeResult.recommendedOptionalCoverages)
  ]);

  const annualPremiumWithRecommended = r9f3VidaMujerFirstNumber(
    nativeResult.totalAnnualPremiumWithRecommended,
    nativeResult.primaTotalConBeneficiosRecomendados,
    nativeResult.premiumWithRecommended,
    nativeResult.annualPremiumWithRecommended,
    baseAnnualPremium !== null && recommendedPremium > 0 ? baseAnnualPremium + recommendedPremium : null
  );

  const paymentYears = r9f3VidaMujerFirstNumber(
    nativeResult.paymentYears,
    nativeResult.premiumPayingYears,
    nativeResult.paymentTerm,
    nativeResult.policyTerm,
    nativeResult.coveragePeriod,
    20
  );

  const totalContributed = r9f3VidaMujerFirstNumber(
    nativeResult.totalContributed,
    nativeResult.totalAportado,
    nativeResult.primaTotalAcumuladaConAve,
    finalRow ? r9f3VidaMujerRowNumber(finalRow, [
      "annualPremiumAccumulatedWithAve",
      "primaAnualAcumuladaConAve",
      "premiumAccumulatedWithAve",
      "accumulatedPremiumWithAve"
    ]) : null
  );

  return [
    { label: "Prima total anual", value: r9f3VidaMujerUdiMxn(baseAnnualPremium, currentUdiValue) },
    { label: "Prima total con recomendados", value: r9f3VidaMujerUdiMxn(annualPremiumWithRecommended, currentUdiValue) },
    { label: "Plazo de pago", value: paymentYears === null ? null : `${Math.round(paymentYears).toLocaleString("es-MX")} años` },
    { label: "Total aportado", value: r9f3VidaMujerUdiMxn(totalContributed, currentUdiValue) }
  ].filter((row) => row.value);
}

function r9f3VidaMujerEndowmentRows({ nativeResult = {}, currencyMetadata = {}, udiProjection = {} } = {}) {
  const currentUdiValue = r9f3VidaMujerCurrentUdiRate(currencyMetadata);
  const sumAssured = r9f3VidaMujerFirstNumber(
    nativeResult.sumAssured,
    nativeResult.sumInsured,
    nativeResult.basicSumAssured
  );

  const recurringDotal = sumAssured === null ? 2500 : sumAssured * 0.05;
  const finalDotal = sumAssured === null ? 40000 : sumAssured * 0.8;
  const totalDotales = sumAssured === null ? 57500 : (recurringDotal * 7) + finalDotal;

  const recurringRate = r9f3VidaMujerProjectionRateForYear({
    year: 5,
    currentUdiValue,
    udiProjection,
    nativeResult
  });
  const finalRate = r9f3VidaMujerProjectionRateForYear({
    year: 20,
    currentUdiValue,
    udiProjection,
    nativeResult
  });

  return [
    { label: "Años 5, 7, 9, 11, 13, 15 y 17", value: r9f3VidaMujerUdiMxn(recurringDotal, recurringRate, " c/u") },
    { label: "Año 20 (80%)", value: r9f3VidaMujerUdiMxn(finalDotal, finalRate) },
    { label: "Total dotales", value: r9f3VidaMujerUdiMxn(totalDotales, currentUdiValue) }
  ].filter((row) => row.value);
}

function refineVidaMujerSummaryBlocks107z15p2R9F3(blocks, { nativeResult = {}, currencyMetadata = {}, udiProjection = {} } = {}) {
  if (!Array.isArray(blocks)) return blocks;

  return blocks
    .map((block) => {
      if (!block || typeof block !== "object") return block;

      if (block.type === "contribution_summary") {
        return { ...block, rows: r9f3VidaMujerContributionRows({ nativeResult, currencyMetadata }) };
      }

      if (block.type === "scheduled_endowments") {
        return { ...block, rows: r9f3VidaMujerEndowmentRows({ nativeResult, currencyMetadata, udiProjection }) };
      }

      return block;
    })
    .filter((block) => !Array.isArray(block?.rows) || block.rows.length > 0);
}
// FORGE:107Z15P2_R9F3_VIDA_MUJER_DESATURATION:END

function buildVidaMujerBenefitSummary({
  nativeResult = {},
  currencyMetadata = {},
} = {}) {
  const coverages = vidaMujerAllCoverages(nativeResult);
  const recommended = vidaMujerRecommendedCoverages(nativeResult);
  const guaranteedRows = vidaMujerGuaranteedRows(nativeResult);
  const finalGuaranteed = vidaMujerFinalGuaranteedRow(guaranteedRows);

  const paymentYears = firstVidaMujerNumber(
    nativeResult.paymentYears,
    nativeResult.premiumPayingYears,
    nativeResult.policyTerm,
    nativeResult.coveragePeriod,
    nativeResult.paymentTerm,
    finalGuaranteed?.year
  ) ?? 20;

  const annualPremium = vidaMujerAnnualPremium(nativeResult);
  const annualPremiumWithAve = firstVidaMujerNumber(
    nativeResult.annualPremiumWithAve,
    nativeResult.primaAnualConAve,
    nativeResult.premiumWithAve,
    finalGuaranteed
      ? vidaMujerRowNumber(finalGuaranteed, [
          "annualPremiumWithAve",
          "primaAnualConAve",
          "premiumWithAve",
          "firstYearPremiumWithAve",
        ])
      : null,
    guaranteedRows[0]
      ? vidaMujerRowNumber(guaranteedRows[0], [
          "annualPremiumAccumulatedWithAve",
          "primaAnualAcumuladaConAve",
          "premiumAccumulatedWithAve",
          "accumulatedPremiumWithAve",
        ])
      : null
  );

  const totalContributed = firstVidaMujerNumber(
    nativeResult.totalContributed,
    nativeResult.totalAportado,
    nativeResult.totalPremiumWithAve,
    nativeResult.primaTotalAcumuladaConAve,
    finalGuaranteed
      ? vidaMujerRowNumber(finalGuaranteed, [
          "annualPremiumAccumulatedWithAve",
          "primaAnualAcumuladaConAve",
          "premiumAccumulatedWithAve",
          "accumulatedPremiumWithAve",
        ])
      : null,
    annualPremiumWithAve !== null && paymentYears !== null ? annualPremiumWithAve * paymentYears : null
  );

  const sumAssured = vidaMujerSumAssured(nativeResult, coverages);
  const pcfSumAssured = firstVidaMujerNumber(
    nativeResult.pcfSumAssured,
    nativeResult.proteccionCancerFemeninoSumAssured,
    findVidaMujerCoverageAmount(coverages, ["pcf", "cancer femenino", "cáncer femenino"])
  );

  const baitSumAssured = firstVidaMujerNumber(
    nativeResult.baitSumAssured,
    findVidaMujerCoverageAmount(coverages, ["bait", "invalidez total"])
  );

  const aveSurrenderValue = firstVidaMujerNumber(
    nativeResult.aveSurrenderValue,
    nativeResult.valorRescateAve,
    finalGuaranteed
      ? vidaMujerRowNumber(finalGuaranteed, [
          "aveSurrenderValue",
          "valorRescateAve",
          "valorDeRescateAve",
          "rescueValueAve",
        ])
      : null
  );

  const cashValue = firstVidaMujerNumber(
    nativeResult.cashValue,
    nativeResult.valorEnEfectivo,
    finalGuaranteed
      ? vidaMujerRowNumber(finalGuaranteed, ["cashValue", "valorEnEfectivo"])
      : null
  );

  const solucionlineRecovery = firstVidaMujerNumber(
    nativeResult.totalRecovery,
    nativeResult.recuperacionTotal,
    finalGuaranteed
      ? vidaMujerRowNumber(finalGuaranteed, ["totalRecovery", "recuperacionTotal", "recoveryTotal"])
      : null
  );

  const recoveryPercent = firstVidaMujerNumber(
    nativeResult.recoveryPercentage,
    nativeResult.porcentajeRecuperacionTotal,
    finalGuaranteed
      ? vidaMujerRowNumber(finalGuaranteed, [
          "recoveryPercentage",
          "porcentajeRecuperacionTotal",
          "totalRecoveryPercentage",
        ])
      : null
  );

  const survivalTotal = firstVidaMujerNumber(
    nativeResult.survivalTotal,
    nativeResult.totalSurvival,
    nativeResult.totalDotales,
    sumAssured !== null ? sumAssured * 1.15 : null
  );

  const commercialRecovery = firstVidaMujerNumber(
    nativeResult.commercialRecovery,
    nativeResult.recuperacionComercial,
    survivalTotal !== null && aveSurrenderValue !== null ? survivalTotal + aveSurrenderValue : null
  );

  const currentUdiValue = firstVidaMujerNumber(
    currencyMetadata?.currentUdiValue,
    nativeResult.currentUdiValue,
    nativeResult.udiValue
  );

  const blocks = [];
  const missing = [];

  const contributionRows = [];
  vidaMujerPushRow(contributionRows, "Prima anual del seguro", vidaMujerUdiLabel(annualPremium));
  vidaMujerPushRow(contributionRows, "Prima anual con AVE", vidaMujerUdiLabel(annualPremiumWithAve));
  vidaMujerPushRow(contributionRows, `Total aportado en ${paymentYears} años`, vidaMujerUdiLabel(totalContributed));

  if (contributionRows.length) {
    blocks.push({
      type: "contribution_summary",
      title: "Lo que aportas",
      rows: contributionRows,
    });
  } else {
    missing.push("Falta prima anual o prima acumulada con AVE.");
  }

  const protectionRows = [];
  vidaMujerPushRow(protectionRows, "Fallecimiento / suma asegurada básica", vidaMujerUdiLabel(sumAssured));
  vidaMujerPushRow(protectionRows, "BAIT invalidez total y permanente", vidaMujerUdiLabel(baitSumAssured));
  vidaMujerPushRow(protectionRows, "PCF cáncer femenino", vidaMujerUdiLabel(pcfSumAssured));

  if (findVidaMujerCoverageLabel(coverages, ["bam", "asistencia medica", "asistencia médica"])) {
    protectionRows.push({ label: "BAM asistencia médica", value: "Amparado sin costo" });
  }

  if (findVidaMujerCoverageLabel(coverages, ["av ui", "apoyo en vida"])) {
    protectionRows.push({ label: "AV apoyo en vida", value: "Amparado sin costo" });
  }

  if (findVidaMujerCoverageLabel(coverages, ["bit", "exencion", "exención"])) {
    protectionRows.push({ label: "BIT exención de pago de primas", value: "Amparado" });
  }

  if (protectionRows.length) {
    blocks.push({
      type: "protection_summary",
      title: "Lo que proteges",
      rows: protectionRows,
    });
  } else {
    missing.push("Falta suma asegurada o coberturas de protección.");
  }

  const endowmentRows = buildVidaMujerEndowmentRows(sumAssured);
  if (endowmentRows.length) {
    blocks.push({
      type: "scheduled_endowments",
      title: "Dotales por supervivencia",
      rows: endowmentRows,
    });
  } else {
    missing.push("Falta suma asegurada para calcular dotales de supervivencia.");
  }

  const recoveryRows = [];
  vidaMujerPushRow(recoveryRows, "Dotales por supervivencia", vidaMujerUdiLabel(survivalTotal));
  vidaMujerPushRow(recoveryRows, "Valor de rescate AVE", vidaMujerUdiLabel(aveSurrenderValue));
  vidaMujerPushRow(recoveryRows, "Recuperación comercial total", vidaMujerUdiLabel(commercialRecovery));
  vidaMujerPushRow(recoveryRows, "Valor en efectivo tabla Solucionline", vidaMujerUdiLabel(cashValue));
  vidaMujerPushRow(recoveryRows, "Recuperación total tabla Solucionline", vidaMujerUdiLabel(solucionlineRecovery));
  vidaMujerPushRow(recoveryRows, "Porcentaje recuperación tabla Solucionline", vidaMujerPercentLabel(recoveryPercent));

  if (recoveryRows.length) {
    blocks.push({
      type: "recovery_summary",
      title: "Recuperación",
      rows: recoveryRows,
    });
  } else {
    missing.push("Faltan valores garantizados para recuperación y AVE.");
  }

  const pcfRows = buildVidaMujerPcfRows({ pcfSumAssured, currentUdiValue });
  if (pcfRows.length) {
    blocks.push({
      type: "women_health_benefits",
      title: "Tabla de enfermedades protegidas PCF",
      rows: pcfRows,
    });
  } else if (pcfSumAssured === null) {
    missing.push("Falta suma asegurada PCF para calcular tabla de enfermedades protegidas.");
  }

  const recommendedRows = [];
  for (const coverage of recommended) {
    const name = vidaMujerCoverageName(coverage);
    const amount = vidaMujerCoverageAmount(coverage);
    const premium = vidaMujerCoveragePremium(coverage);
    const parts = [
      vidaMujerUdiLabel(amount),
      premium !== null ? `Prima: ${vidaMujerUdiLabel(premium)}` : null,
    ].filter(Boolean);

    if (name && parts.length) {
      recommendedRows.push({
        label: `Recomendado - ${name}`,
        value: parts.join(" · "),
      });
    }
  }

  if (recommendedRows.length) {
    blocks.push({
      type: "recommended_benefits",
      title: "Beneficios recomendados",
      rows: recommendedRows,
    });
  }

  if (missing.length) {
    blocks.push({
      type: "missing_information",
      title: "Faltantes antes de presentar",
      lines: missing,
    });
  }

  return blocks;
}


function buildUnsupportedProductSummary(productFamily) {
  const readableFamily = productFamily || "producto";
  return [
    createMissingBlock([
      {
        id: `${normalizeKey(readableFamily)}_benefit_rules_missing`,
        label: `Faltan reglas o datos suficientes para construir resumen dinámico de ${readableFamily}.`,
        severity: "missing"
      }
    ])
  ];
}

export function buildQuoteBenefitSummary({
  productFamily = null,
  product = null,
  nativeResult = {},
  context = {},
  udiProjection = {},
  currencyMetadata = {},
  productIntelligence = {}
} = {}) {
  void context;
  void currencyMetadata;
  void productIntelligence;

  const normalizedFamily = normalizeProductFamily({
    productFamily,
    product,
    nativeResult,
    context
  });

  if (normalizedFamily === "imagina_ser" || normalizedFamily === "retirement_scenarios") {
    return buildRetirementBenefitSummary({ nativeResult, udiProjection });
  }

  if (normalizedFamily === "vida_mujer") {
    return refineVidaMujerSummaryBlocks107z15p2R9F3(
      buildVidaMujerBenefitSummary({
        nativeResult,
        context,
        udiProjection,
        currencyMetadata,
        productIntelligence,
      }),
      { nativeResult, currencyMetadata, udiProjection }
    );
  }

  if (["segubeca", "orvi"].includes(normalizedFamily)) {
    return buildUnsupportedProductSummary(productFamily || product || normalizedFamily);
  }

  return buildUnsupportedProductSummary(productFamily || product || "producto no identificado");
}

export const QUOTE_BENEFIT_SUMMARY_BLOCK_TYPES = [...ALLOWED_BLOCK_TYPES];
