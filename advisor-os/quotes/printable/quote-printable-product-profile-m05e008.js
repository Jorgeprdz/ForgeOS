import {
  buildProductSpecificQuotePrintableReadModel as buildM05e007ProfiledReadModel,
} from "./quote-printable-product-profile-m05e007.js";

const CONTRACT_VERSION = "M05E008_VIDA_MUJER_COMMERCIAL_PROFILE_V1";
const VIDA_MUJER_LAYOUT_ID =
  "VIDA_MUJER_PROTECTION_ENDOWMENTS_TWO_PAGE_V1";

const PCF_DISEASES = Object.freeze([
  Object.freeze({ name: "Tumor maligno de mama", percentage: 1 }),
  Object.freeze({ name: "Tumor maligno de mama localizado", percentage: 0.47 }),
  Object.freeze({ name: "Tumor maligno de ovario", percentage: 0.38 }),
  Object.freeze({ name: "Tumor maligno de útero", percentage: 0.21 }),
  Object.freeze({ name: "Tumor maligno de útero localizado", percentage: 0.12 }),
  Object.freeze({ name: "Tumor maligno de trompas de Falopio", percentage: 0.12 }),
  Object.freeze({ name: "Tumor benigno de vagina o vulva", percentage: 0.09 }),
]);

const ENDOWMENT_SCHEDULE = Object.freeze([
  Object.freeze({ policyYear: 5, percentage: 0.05 }),
  Object.freeze({ policyYear: 7, percentage: 0.05 }),
  Object.freeze({ policyYear: 9, percentage: 0.05 }),
  Object.freeze({ policyYear: 11, percentage: 0.05 }),
  Object.freeze({ policyYear: 13, percentage: 0.05 }),
  Object.freeze({ policyYear: 15, percentage: 0.05 }),
  Object.freeze({ policyYear: 17, percentage: 0.05 }),
  Object.freeze({ policyYear: 20, percentage: 0.8 }),
]);

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function clone(value) {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function deepFreeze(value, seen = new WeakSet()) {
  if (!value || typeof value !== "object" || seen.has(value)) return value;
  seen.add(value);
  Object.values(value).forEach((item) => deepFreeze(item, seen));
  return Object.freeze(value);
}

function numeric(value) {
  if (isRecord(value) && Object.hasOwn(value, "value")) {
    return numeric(value.value);
  }
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number"
    ? value
    : Number(String(value).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function positive(value) {
  const parsed = numeric(value);
  return parsed !== null && parsed > 0 ? parsed : null;
}

function firstNumber(...values) {
  for (const value of values) {
    const parsed = numeric(value);
    if (parsed !== null) return parsed;
  }
  return null;
}

function firstPositive(...values) {
  for (const value of values) {
    const parsed = positive(value);
    if (parsed !== null) return parsed;
  }
  return null;
}

function firstObject(...values) {
  return values.find(isRecord) || null;
}

function rows(...values) {
  return values.flatMap((value) => Array.isArray(value) ? value.filter(Boolean) : []);
}

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function coverageName(coverage) {
  return String(
    coverage?.name ??
    coverage?.coverage ??
    coverage?.label ??
    coverage?.description ??
    coverage?.benefit ??
    coverage?.code ??
    "",
  ).trim();
}

function coverageMatches(coverage, patterns) {
  const key = normalize(coverageName(coverage));
  return patterns.some((pattern) => key.includes(normalize(pattern)));
}

function coverageAmount(coverage) {
  return firstPositive(
    coverage?.sumAssured,
    coverage?.sumInsured,
    coverage?.sumaAsegurada,
    coverage?.insuredAmount,
    coverage?.amount,
    coverage?.value,
  );
}

function findCoverage(coverages, patterns) {
  return coverages.find((coverage) => coverageMatches(coverage, patterns)) || null;
}

function currentRateMetadata(reviewSnapshot, calculation, acceptedQuote, nativeResult) {
  return firstObject(
    calculation.udiRateMetadata,
    calculation.currencyMetadata,
    calculation.rateMetadata,
    calculation.rate_metadata,
    acceptedQuote.udiRateMetadata,
    acceptedQuote.currencyMetadata,
    acceptedQuote.rateMetadata,
    acceptedQuote.rate_metadata,
    nativeResult.udiRateMetadata,
    nativeResult.currencyMetadata,
    nativeResult.rateMetadata,
    reviewSnapshot.productIntelligence?.rate_metadata,
  ) || {};
}

function projectionCandidates(calculation, acceptedQuote, nativeResult) {
  const projection = firstObject(
    calculation.udiProjection,
    calculation.udi_projection,
    acceptedQuote.udiProjection,
    acceptedQuote.udi_projection,
    nativeResult.udiProjection,
    nativeResult.udi_projection,
  ) || {};
  const timeline = projection.timeline;
  return rows(
    projection.rows,
    projection.projectionRows,
    projection.years,
    projection.annualProjection,
    timeline,
    timeline?.savings,
    timeline?.retirement,
    calculation.udiProjectionRows,
    acceptedQuote.udiProjectionRows,
    nativeResult.udiProjectionRows,
    nativeResult.udiProjection,
  );
}

function projectedRateForYear(candidates, year) {
  const exact = candidates.find((row) =>
    firstNumber(row?.year, row?.policyYear, row?.anio, row?.año) === year,
  );
  return firstPositive(
    exact?.projectedUdiValue,
    exact?.udiValue,
    exact?.projectedRate,
    exact?.rate,
    exact?.value,
  );
}

function contractedProtectionRows(nativeResult, currentUdi) {
  const contracted = rows(
    nativeResult.coverages,
    nativeResult.basicCoverages,
    nativeResult.includedCoverages,
    nativeResult.additionalCoverages,
    nativeResult.contractedCoverages,
  );

  const definitions = [
    {
      id: "pcf",
      label: "Protección por cáncer femenino",
      patterns: ["pcf", "cancer femenino"],
      kind: "amount",
    },
    {
      id: "bait",
      label: "Invalidez total y permanente",
      patterns: ["bait", "invalidez total"],
      kind: "amount",
    },
    {
      id: "bit",
      label: "Exención de pago de primas",
      patterns: ["bit", "exencion", "exención"],
      kind: "status",
    },
    {
      id: "bam",
      label: "Asistencia médica",
      patterns: ["bam", "asistencia medica", "asistencia médica"],
      kind: "status",
    },
    {
      id: "av",
      label: "Apoyo en vida",
      patterns: ["av ui", "apoyo en vida"],
      kind: "status",
    },
    {
      id: "bma",
      label: "Muerte accidental",
      patterns: ["bma", "muerte accidental"],
      kind: "amount",
    },
  ];

  return definitions.flatMap((definition) => {
    const coverage = findCoverage(contracted, definition.patterns);
    if (!coverage) return [];
    const udi = coverageAmount(coverage);
    return [{
      id: definition.id,
      label: definition.label,
      kind: definition.kind,
      udi,
      mxn: udi !== null && currentUdi !== null ? udi * currentUdi : null,
      status: definition.kind === "status" ? "Incluida" : "Contratada",
      sourceLabel: coverageName(coverage) || definition.label,
    }];
  });
}

function buildVidaMujerCommercialSummary(reviewSnapshot) {
  const acceptedQuote = reviewSnapshot.acceptedQuote || {};
  const calculation = reviewSnapshot.calculation || {};
  const productIntelligence = reviewSnapshot.productIntelligence || {};
  const nativeResult = firstObject(
    calculation.nativeResult,
    acceptedQuote.nativeResult,
  ) || {};
  const rateMetadata = currentRateMetadata(
    reviewSnapshot,
    calculation,
    acceptedQuote,
    nativeResult,
  );
  const currentUdi = firstPositive(
    rateMetadata.currentUdiValue,
    rateMetadata.udiValue,
    rateMetadata.value,
    rateMetadata.rate,
  );

  const coverages = rows(
    nativeResult.coverages,
    nativeResult.basicCoverages,
    nativeResult.includedCoverages,
    nativeResult.additionalCoverages,
    nativeResult.contractedCoverages,
  );
  const mainCoverage = findCoverage(
    coverages,
    ["vida mujer", "fallecimiento", "basico", "básico"],
  );
  const sumAssuredUdi = firstPositive(
    productIntelligence?.protection_summary?.basic_sum_assured,
    calculation.sumAssured,
    calculation.sumInsured,
    nativeResult.sumAssured,
    nativeResult.sumInsured,
    nativeResult.basicSumAssured,
    acceptedQuote.sumAssured,
    coverageAmount(mainCoverage),
  );
  const sumAssuredMxn = firstPositive(
    calculation.currentProtectionMXN,
    calculation.sumAssuredMxnCurrent,
    nativeResult.sumAssuredMxnCurrent,
    sumAssuredUdi !== null && currentUdi !== null
      ? sumAssuredUdi * currentUdi
      : null,
  );

  const annualBase = firstPositive(
    calculation.annualPremium,
    nativeResult.totalAnnualPremium,
    nativeResult.annualPremium,
    nativeResult.premiumTable?.annual,
    productIntelligence?.premium_structure?.total_annual_premium,
    productIntelligence?.premium_structure?.basic_annual_premium,
  );
  const annualWithAve = firstPositive(
    calculation.annualPremiumWithAve,
    calculation.annualPremiumTotalWithAve,
    nativeResult.annualPremiumWithAve,
    nativeResult.annualPremiumTotalWithAve,
    nativeResult.primaAnualTotalConAve,
    nativeResult.premiumTable?.plannedAnnual,
  );
  const annualContributionUdi = annualWithAve || annualBase;
  const annualContributionMxn =
    annualContributionUdi !== null && currentUdi !== null
      ? annualContributionUdi * currentUdi
      : null;
  const annualAveUdi = firstPositive(
    calculation.annualAvePremium,
    nativeResult.annualAvePremium,
    nativeResult.primaAveAnual,
    annualWithAve !== null && annualBase !== null && annualWithAve > annualBase
      ? annualWithAve - annualBase
      : null,
  );

  const paymentYears = firstPositive(
    calculation.paymentYears,
    nativeResult.paymentYears,
    nativeResult.premiumPayingYears,
    nativeResult.paymentTerm,
    nativeResult.policyTerm,
    nativeResult.coveragePeriod,
    productIntelligence?.premium_structure?.payment_term_years,
    20,
  );

  const projectionRows = projectionCandidates(
    calculation,
    acceptedQuote,
    nativeResult,
  );
  const endowments = sumAssuredUdi === null
    ? []
    : ENDOWMENT_SCHEDULE.map(({ policyYear, percentage }) => {
        const projectedUdiValue = projectedRateForYear(
          projectionRows,
          policyYear,
        );
        const benefitUdi = sumAssuredUdi * percentage;
        return {
          policyYear,
          percentage,
          benefitUdi,
          benefitMxn:
            projectedUdiValue !== null
              ? benefitUdi * projectedUdiValue
              : null,
          projectedUdiValue,
          projectionStatus:
            projectedUdiValue === null
              ? "BLOCKED_PROJECTED_UDI_RATE_UNAVAILABLE"
              : "PROJECTED_NOT_GUARANTEED",
        };
      });

  const survivalTotalUdi = endowments.length
    ? endowments.reduce((total, item) => total + item.benefitUdi, 0)
    : null;
  const survivalTotalMxn =
    endowments.length && endowments.every((item) => item.benefitMxn !== null)
      ? endowments.reduce((total, item) => total + item.benefitMxn, 0)
      : null;

  const protections = contractedProtectionRows(nativeResult, currentUdi);
  const pcf = protections.find((item) => item.id === "pcf") || null;
  const pcfDiseases = pcf?.udi
    ? PCF_DISEASES.map((disease) => ({
        name: disease.name,
        percentage: disease.percentage,
        benefitUdi: pcf.udi * disease.percentage,
        benefitMxn:
          currentUdi !== null
            ? pcf.udi * disease.percentage * currentUdi
            : null,
      }))
    : [];

  return deepFreeze({
    layoutId: VIDA_MUJER_LAYOUT_ID,
    product: String(
      calculation.product ||
      acceptedQuote.product ||
      nativeResult.product ||
      productIntelligence?.identity?.detected_product_name ||
      "Vida Mujer",
    ),
    paymentYears,
    sumAssured: {
      udi: sumAssuredUdi,
      mxn: sumAssuredMxn,
    },
    annualContribution: {
      udi: annualContributionUdi,
      mxn: annualContributionMxn,
      includesAve: annualWithAve !== null,
      annualAveUdi,
    },
    protections,
    endowments,
    survivalTotal: {
      udi: survivalTotalUdi,
      mxn: survivalTotalMxn,
    },
    pcfDiseases,
    evidence: {
      udiValue: currentUdi,
      udiDate: String(
        rateMetadata.source_date ||
        rateMetadata.sourceDate ||
        rateMetadata.date ||
        "",
      ).trim() || null,
      udiSource: String(rateMetadata.source || "").trim() || null,
      seriesId: String(
        rateMetadata.series_id ||
        rateMetadata.seriesId ||
        rateMetadata.key ||
        "",
      ).trim() || null,
      exactProjectedYears: endowments
        .filter((item) => item.projectedUdiValue !== null)
        .map((item) => item.policyYear),
    },
  });
}

function buildProductSpecificQuotePrintableReadModel({
  readModel,
  reviewSnapshot,
} = {}) {
  const profiled = buildM05e007ProfiledReadModel({
    readModel,
    reviewSnapshot,
  });
  if (profiled.productProfile?.id !== "VIDA_MUJER") return profiled;

  const commercialSummary = buildVidaMujerCommercialSummary(reviewSnapshot);
  const warnings = [];
  if (commercialSummary.sumAssured.udi === null) {
    warnings.push("La suma asegurada de Vida Mujer no está disponible.");
  }
  if (commercialSummary.annualContribution.udi === null) {
    warnings.push("La aportación anual de Vida Mujer no está disponible.");
  }
  if (!commercialSummary.endowments.length) {
    warnings.push("No fue posible construir el calendario de dotales.");
  }

  return deepFreeze({
    ...clone(profiled),
    contractVersion: CONTRACT_VERSION,
    commercialSummary,
    review: {
      ...clone(profiled.review || {}),
      warnings,
    },
    disclaimers: [
      "La suma asegurada y los beneficios contractuales se expresan en UDI; su equivalencia en MXN cambia con el valor de la UDI.",
      "Los importes futuros en MXN son proyecciones y no constituyen valores garantizados.",
      "Sólo se muestran coberturas detectadas como contratadas; la póliza y la documentación oficial prevalecen.",
    ],
    productProfile: {
      ...clone(profiled.productProfile),
      commercialLayoutId: VIDA_MUJER_LAYOUT_ID,
    },
  });
}

export {
  CONTRACT_VERSION,
  ENDOWMENT_SCHEDULE,
  PCF_DISEASES,
  VIDA_MUJER_LAYOUT_ID,
  buildProductSpecificQuotePrintableReadModel,
  buildVidaMujerCommercialSummary,
};
