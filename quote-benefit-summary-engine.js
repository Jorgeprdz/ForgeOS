const ALLOWED_BLOCK_TYPES = new Set([
  "contribution_summary",
  "protection_summary",
  "retirement_scenarios",
  "scheduled_endowments",
  "education_payout",
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

function normalizeProductFamily({ productFamily, product, nativeResult } = {}) {
  const raw = [
    productFamily,
    product,
    nativeResult?.productFamily,
    nativeResult?.productName,
    nativeResult?.product
  ]
    .filter(Boolean)
    .join(" ");
  const normalized = normalizeKey(raw);

  if (normalized.includes("imagina_ser")) return "imagina_ser";
  if (normalized.includes("vida_mujer")) return "vida_mujer";
  if (normalized.includes("segu_beca") || normalized.includes("segubeca")) {
    return "segubeca";
  }
  if (normalized.includes("orvi")) return "orvi";
  if (normalized.includes("ppr")) return "ppr";

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

  if (!scenarios.length && !missing.length) return null;

  return {
    type: "retirement_scenarios",
    title: "Escenarios de retiro",
    scenarios,
    missing
  };
}

function buildImaginaSerSummary({ nativeResult = {}, udiProjection = {} }) {
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
    nativeResult
  });

  if (normalizedFamily === "imagina_ser") {
    return buildImaginaSerSummary({ nativeResult, udiProjection });
  }

  if (["vida_mujer", "segubeca", "orvi", "ppr"].includes(normalizedFamily)) {
    return buildUnsupportedProductSummary(productFamily || product || normalizedFamily);
  }

  return buildUnsupportedProductSummary(productFamily || product || "producto no identificado");
}

export const QUOTE_BENEFIT_SUMMARY_BLOCK_TYPES = [...ALLOWED_BLOCK_TYPES];
