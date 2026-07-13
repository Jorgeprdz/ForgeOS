import {
  buildOrviAcceptedQuoteCalculation,
  isOrviAcceptedQuotePacket
} from "./forge-orvi-static-preview-runtime.js?v=r15l_orvi_runtime_20260712_1";
const DEFAULT_CACHE_CANDIDATES = [
  "../../quote-preview-live/forge-rate-cache.json",
  "../../../quote-preview-live/forge-rate-cache.json",
  "../../../forge-rate-cache.json",
  "/ForgeOS/forge-rate-cache.json"
];

function hasValue(value) {
  return value !== null && value !== undefined && value !== "";
}

function parseYears(value) {
  const match = String(value ?? "").match(/([0-9]{1,3})/);
  return match ? Number(match[1]) : null;
}

function scenarioObject(nativeResult, key, legacyPrefix) {
  if (nativeResult[key] && typeof nativeResult[key] === "object") return nativeResult[key];
  const singlePaymentUdi =
    nativeResult[`${legacyPrefix}SinglePayment`] ??
    nativeResult[`${legacyPrefix}SinglePaymentUdi`] ??
    null;
  const monthlyIncomeUdi =
    nativeResult[`${legacyPrefix}MonthlyIncome`] ??
    nativeResult[`${legacyPrefix}MonthlyIncomeUdi`] ??
    null;
  return hasValue(singlePaymentUdi) || hasValue(monthlyIncomeUdi)
    ? { singlePaymentUdi, monthlyIncomeUdi }
    : null;
}

function isUdiCurrency(currency) {
  return ["UDI", "UDIS", "MXV"].includes(String(currency || "").trim().toUpperCase());
}

function normalizeAcceptedKey107z15p2R9C(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function finiteAcceptedNumber107z15p2R9C(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const normalized = String(value).replace(/[^0-9.\-]/g, "");
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function firstAcceptedNumber107z15p2R9C(...values) {
  for (const value of values) {
    const parsed = finiteAcceptedNumber107z15p2R9C(value);
    if (parsed !== null) return parsed;
  }
  return null;
}

function acceptedArray107z15p2R9C(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function acceptedFinalGuaranteedRow107z15p2R9C(nativeResult) {
  const rows = [
    ...acceptedArray107z15p2R9C(nativeResult.guaranteedValues),
    ...acceptedArray107z15p2R9C(nativeResult.guaranteedValueRows),
    ...acceptedArray107z15p2R9C(nativeResult.valoresGarantizados),
    ...acceptedArray107z15p2R9C(nativeResult.cashValueRows)
  ];
  if (!rows.length) return null;
  return rows
    .map((row, index) => ({
      row,
      index,
      age: firstAcceptedNumber107z15p2R9C(row.age, row.realAge, row.edad, row.edadReal),
      year: firstAcceptedNumber107z15p2R9C(row.year, row.policyYear, row.anio, row.año)
    }))
    .sort((a, b) => (a.year ?? a.age ?? a.index) - (b.year ?? b.age ?? b.index))
    .at(-1)?.row || null;
}

function acceptedRowNumber107z15p2R9C(row, keys) {
  if (!row) return null;
  return firstAcceptedNumber107z15p2R9C(...keys.map(key => row[key]));
}

function acceptedCoverageName107z15p2R9C(coverage) {
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

function acceptedCoverageMatches107z15p2R9C(coverage, patterns) {
  const haystack = normalizeAcceptedKey107z15p2R9C(acceptedCoverageName107z15p2R9C(coverage));
  return patterns.some(pattern => haystack.includes(normalizeAcceptedKey107z15p2R9C(pattern)));
}

function acceptedCoverageAmount107z15p2R9C(coverage) {
  return firstAcceptedNumber107z15p2R9C(
    coverage?.sumAssured,
    coverage?.sumInsured,
    coverage?.sumaAsegurada,
    coverage?.insuredAmount,
    coverage?.amount,
    coverage?.value
  );
}

function findAcceptedCoverageAmount107z15p2R9C(coverages, patterns) {
  const found = coverages.find(coverage => acceptedCoverageMatches107z15p2R9C(coverage, patterns));
  return found ? acceptedCoverageAmount107z15p2R9C(found) : null;
}

function acceptedProductFamily107z15p2R9C(packet, nativeResult) {
  return (
    packet?.productFamily ??
    packet?.family ??
    packet?.product_family ??
    packet?.context?.productFamily ??
    packet?.context?.product_family ??
    nativeResult?.productFamily ??
    nativeResult?.product_family ??
    nativeResult?.family ??
    nativeResult?.product ??
    packet?.product ??
    null
  );
}

function acceptedProduct107z15p2R9C(packet, nativeResult) {
  return packet?.product ?? packet?.context?.product ?? nativeResult?.product ?? nativeResult?.plan ?? null;
}

function isVidaMujerAccepted107z15p2R9C(packet, nativeResult) {
  const family = normalizeAcceptedKey107z15p2R9C(acceptedProductFamily107z15p2R9C(packet, nativeResult));
  const product = normalizeAcceptedKey107z15p2R9C(acceptedProduct107z15p2R9C(packet, nativeResult));
  return family.includes("vida_mujer") || product.includes("vida_mujer");
}

function isSegubecaAcceptedR14E(packet, nativeResult) {
  const family = normalizeAcceptedKey107z15p2R9C(acceptedProductFamily107z15p2R9C(packet, nativeResult));
  const product = normalizeAcceptedKey107z15p2R9C(acceptedProduct107z15p2R9C(packet, nativeResult));
  return family.includes("segubeca") || family.includes("segu_beca") ||
    product.includes("segubeca") || product.includes("segu_beca");
}

function calculateSegubecaAcceptedR14E(packet, nativeResult) {
  const guaranteedRows = acceptedArray107z15p2R9C(nativeResult.guaranteedRows);
  const administrationRows = acceptedArray107z15p2R9C(nativeResult.administrationRows);
  const finalGuaranteed = guaranteedRows.at(-1) || null;
  const finalAdministration = administrationRows.at(-1) || null;

  const paymentYears = firstAcceptedNumber107z15p2R9C(
    nativeResult.paymentYears,
    nativeResult.paymentTerm,
    nativeResult.policyTerm,
    nativeResult.coveragePeriod,
    packet.paymentYears,
    packet.coveragePeriod
  );

  const annualPremium = firstAcceptedNumber107z15p2R9C(
    nativeResult.annualPremium,
    nativeResult.totalAnnualPremium,
    nativeResult.premiumTable?.annual,
    packet.annualPremium
  );

  const annualPremiumWithRecommended = firstAcceptedNumber107z15p2R9C(
    nativeResult.annualPremiumWithRecommended,
    nativeResult.plannedOrAvePremium,
    nativeResult.premiumTable?.plannedAnnual,
    packet.annualPremiumWithRecommended,
    packet.plannedOrAvePremium
  );

  const totalContributed = firstAcceptedNumber107z15p2R9C(
    nativeResult.totalContributed,
    packet.totalContributed,
    finalGuaranteed?.accumulatedAnnualPremiumWithAve,
    finalGuaranteed?.annualPremiumAccumulatedWithAve,
    annualPremium !== null && paymentYears !== null ? annualPremium * paymentYears : null
  );

  const totalRecovery = firstAcceptedNumber107z15p2R9C(
    nativeResult.totalRecovery,
    packet.totalRecovery,
    finalGuaranteed?.totalRecovery,
    finalAdministration?.accumulatedDelivery
  );

  const udiRateMetadata = acceptedUdiRateMetadata107z15p2R9C(packet, nativeResult);
  const currentUdi = acceptedCurrentUdi107z15p2R9C(udiRateMetadata);

  return {
    nativeResult: {
      ...nativeResult,
      totalContributed,
      totalRecovery
    },
    context: packet?.context || {},
    productIntelligence: packet?.productIntelligence || null,
    productFamily: "segubeca",
    product: nativeResult.product || packet.product || "SeguBeca",
    client: nativeResult.prospect ?? nativeResult.insured ?? packet.insured ?? packet.name ?? null,
    currency: nativeResult.currency ?? packet.currency ?? "UDI",
    annualPremium,
    annualPremiumWithAve: annualPremiumWithRecommended,
    annualAvePremium: null,
    paymentYears,
    paymentMode: nativeResult.paymentMode ?? "Anual",
    coveragePeriod: nativeResult.policyTerm ?? nativeResult.coveragePeriod ?? packet.coveragePeriod ?? null,
    guaranteePeriod: null,
    advisor: nativeResult.advisor ?? null,
    quoteDate: nativeResult.quoteDate ?? null,
    totalContributed,
    totalContributedMXN: acceptedMxn107z15p2R9C(totalContributed, currentUdi),
    totalRecovery,
    totalRecoveryMXN: acceptedMxn107z15p2R9C(totalRecovery, currentUdi),
    udiRateMetadata,
    udiProjection: packet?.udiProjection || nativeResult?.udiProjection || null,
    optionalCoverages: acceptedArray107z15p2R9C(nativeResult.recommendedCoverages),
    accumulatedIncome: [],
    base: null,
    favorable: null,
    unfavorable: null,
    interestRate: nativeResult.interestRate ?? null,
    projectedUdiAtRetirement: null,
    currentProtectionMXN: acceptedMxn107z15p2R9C(nativeResult.sumAssured ?? nativeResult.sumInsured, currentUdi),
    monthlyIncomeMXN: null,
    annualIncomeMXN: null
  };
}

function acceptedUdiRateMetadata107z15p2R9C(packet, nativeResult) {
  return packet?.currencyMetadata || packet?.udiRateMetadata || nativeResult?.currencyMetadata || nativeResult?.udiRateMetadata || {
    currentUdiValue: nativeResult?.currentUdiValue ?? nativeResult?.udiValue ?? null
  };
}

function acceptedCurrentUdi107z15p2R9C(metadata) {
  return firstAcceptedNumber107z15p2R9C(metadata?.currentUdiValue, metadata?.udiValue, metadata?.value, metadata?.rate);
}

function acceptedMxn107z15p2R9C(amountUdi, udiRate) {
  const amount = finiteAcceptedNumber107z15p2R9C(amountUdi);
  const rate = finiteAcceptedNumber107z15p2R9C(udiRate);
  if (amount === null || rate === null) return null;
  return amount * rate;
}

function buildAcceptedNativeResult107z15p2R9C(packet = {}) {
  const original = packet?.nativeResult && typeof packet.nativeResult === "object" ? packet.nativeResult : {};
  const premiumTable = { ...(original.premiumTable || {}) };

  if (premiumTable.annual === undefined) {
    premiumTable.annual = packet.annualPremium ?? packet.primaAnual ?? original.totalAnnualPremium ?? original.annualPremium ?? original.premium;
  }

  if (premiumTable.plannedAnnual === undefined) {
    premiumTable.plannedAnnual =
      packet.plannedOrAvePremium ??
      packet.annualPremiumTotalWithAve ??
      packet.plannedAnnualPremium ??
      packet.avePremium ??
      original.annualPremiumWithAve ??
      original.primaAnualConAve ??
      original.plannedAnnualPremium ??
      original.premiumTable?.plannedAnnual;
  }

  return {
    ...original,
    product: original.product ?? packet.product ?? packet.context?.product ?? null,
    productFamily: original.productFamily ?? packet.productFamily ?? packet.family ?? packet.context?.productFamily ?? packet.context?.product_family ?? null,
    product_family: original.product_family ?? packet.product_family ?? packet.context?.product_family ?? null,
    prospect: original.prospect ?? original.insured ?? packet.insured ?? packet.name ?? packet.context?.name ?? null,
    insured: original.insured ?? original.prospect ?? packet.insured ?? packet.name ?? packet.context?.name ?? null,
    sumInsured: original.sumInsured ?? original.sumAssured ?? packet.sumAssured ?? packet.sumInsured ?? null,
    sumAssured: original.sumAssured ?? original.sumInsured ?? packet.sumAssured ?? packet.sumInsured ?? null,
    totalAnnualPremium: original.totalAnnualPremium ?? original.annualPremium ?? packet.annualPremium ?? packet.primaAnual ?? null,
    annualPremium: original.annualPremium ?? original.totalAnnualPremium ?? packet.annualPremium ?? packet.primaAnual ?? null,
    annualPremiumWithAve: original.annualPremiumWithAve ?? original.primaAnualConAve ?? original.annualPremiumTotalWithAve ?? packet.annualPremiumTotalWithAve ?? packet.plannedOrAvePremium ?? packet.avePremium ?? packet.plannedAnnualPremium ?? null,
    annualPremiumTotalWithAve: original.annualPremiumTotalWithAve ?? original.primaAnualTotalConAve ?? packet.annualPremiumTotalWithAve ?? packet.plannedOrAvePremium ?? null,
    annualAvePremium: original.annualAvePremium ?? original.primaAveAnual ?? packet.annualAvePremium ?? null,
    annualPremiumAccumulatedWithAve: original.annualPremiumAccumulatedWithAve ?? original.primaTotalAcumuladaConAve ?? packet.annualPremiumAccumulatedWithAve ?? null,
    paymentTerm: original.paymentTerm ?? packet.paymentTerm ?? packet.coveragePeriod ?? null,
    policyTerm: original.policyTerm ?? packet.coveragePeriod ?? original.coveragePeriod ?? null,
    coveragePeriod: original.coveragePeriod ?? packet.coveragePeriod ?? original.policyTerm ?? null,
    premiumTable
  };
}

function calculateVidaMujerAccepted107z15p2R9C(packet, nativeResult) {
  const coverages = [
    ...acceptedArray107z15p2R9C(nativeResult.coverages),
    ...acceptedArray107z15p2R9C(nativeResult.basicCoverages),
    ...acceptedArray107z15p2R9C(nativeResult.includedCoverages),
    ...acceptedArray107z15p2R9C(nativeResult.optionalCoverages),
    ...acceptedArray107z15p2R9C(nativeResult.additionalCoverages)
  ];
  const finalGuaranteed = acceptedFinalGuaranteedRow107z15p2R9C(nativeResult);
  const udiRateMetadata = acceptedUdiRateMetadata107z15p2R9C(packet, nativeResult);
  const currentUdi = acceptedCurrentUdi107z15p2R9C(udiRateMetadata);

  const paymentYears = firstAcceptedNumber107z15p2R9C(nativeResult.paymentYears, nativeResult.premiumPayingYears, nativeResult.paymentTerm, nativeResult.policyTerm, nativeResult.coveragePeriod, packet.coveragePeriod) ?? 20;
  const sumAssured = firstAcceptedNumber107z15p2R9C(nativeResult.sumAssured, nativeResult.sumInsured, nativeResult.basicSumAssured, packet.sumAssured, findAcceptedCoverageAmount107z15p2R9C(coverages, ["vida mujer", "fallecimiento", "basico", "básico"]));
  const annualPremium = firstAcceptedNumber107z15p2R9C(nativeResult.totalAnnualPremium, nativeResult.annualPremium, nativeResult.premiumTable?.annual, packet.annualPremium);

  const annualPremiumWithAve = firstAcceptedNumber107z15p2R9C(
    nativeResult.annualPremiumWithAve,
    nativeResult.annualPremiumTotalWithAve,
    nativeResult.primaAnualTotalConAve,
    nativeResult.primaAnualConAve,
    nativeResult.premiumTable?.plannedAnnual,
    packet.plannedOrAvePremium,
    finalGuaranteed ? acceptedRowNumber107z15p2R9C(finalGuaranteed, ["annualPremiumWithAve", "primaAnualConAve", "premiumWithAve"]) : null,
    nativeResult.guaranteedValues?.[0] ? acceptedRowNumber107z15p2R9C(nativeResult.guaranteedValues[0], ["annualPremiumAccumulatedWithAve", "primaAnualAcumuladaConAve", "premiumAccumulatedWithAve", "accumulatedPremiumWithAve"]) : null
  );
  const annualAvePremium = firstAcceptedNumber107z15p2R9C(
    nativeResult.annualAvePremium,
    nativeResult.primaAveAnual,
    nativeResult.premiumTable?.annualAve,
    annualPremiumWithAve !== null && annualPremium !== null ? annualPremiumWithAve - annualPremium : null
  );

  const totalContributed = firstAcceptedNumber107z15p2R9C(
    nativeResult.annualPremiumAccumulatedWithAve,
    nativeResult.totalContributed,
    nativeResult.totalAportado,
    nativeResult.primaTotalAcumuladaConAve,
    finalGuaranteed ? acceptedRowNumber107z15p2R9C(finalGuaranteed, ["annualPremiumAccumulatedWithAve", "primaAnualAcumuladaConAve", "premiumAccumulatedWithAve", "accumulatedPremiumWithAve"]) : null,
    annualPremiumWithAve !== null ? annualPremiumWithAve * paymentYears : null
  );

  const aveSurrenderValue = firstAcceptedNumber107z15p2R9C(
    nativeResult.aveSurrenderValue,
    nativeResult.valorRescateAve,
    finalGuaranteed ? acceptedRowNumber107z15p2R9C(finalGuaranteed, ["aveSurrenderValue", "valorRescateAve", "valorDeRescateAve", "rescueValueAve"]) : null
  );

  const survivalTotal = firstAcceptedNumber107z15p2R9C(nativeResult.survivalTotal, nativeResult.totalSurvival, nativeResult.totalDotales, sumAssured !== null ? sumAssured * 1.15 : null);
  const tableRecovery = firstAcceptedNumber107z15p2R9C(nativeResult.totalRecovery, nativeResult.recuperacionTotal, finalGuaranteed ? acceptedRowNumber107z15p2R9C(finalGuaranteed, ["totalRecovery", "recuperacionTotal", "recoveryTotal"]) : null);
  const commercialRecovery = firstAcceptedNumber107z15p2R9C(nativeResult.commercialRecovery, nativeResult.recuperacionComercial, survivalTotal !== null && aveSurrenderValue !== null ? survivalTotal + aveSurrenderValue : null, tableRecovery);

  return {
    nativeResult: {
      ...nativeResult,
      totalContributed,
      totalRecovery: tableRecovery,
      commercialRecovery,
      survivalTotal,
      totalDotales: survivalTotal,
      aveSurrenderValue,
      valorRescateAve: aveSurrenderValue
    },
    productFamily: acceptedProductFamily107z15p2R9C(packet, nativeResult),
    product: acceptedProduct107z15p2R9C(packet, nativeResult),
    context: packet?.context || {},
    productIntelligence: packet?.productIntelligence || null,
    client: nativeResult.prospect ?? nativeResult.insured ?? packet.insured ?? packet.name ?? null,
    currency: nativeResult.currency ?? packet.currency ?? "UDI",
    annualPremium,
    annualPremiumWithAve,
    annualAvePremium,
    paymentYears,
    paymentMode: nativeResult.paymentMode ?? "Anual",
    coveragePeriod: nativeResult.policyTerm ?? nativeResult.coveragePeriod ?? packet.coveragePeriod ?? `${paymentYears} años`,
    guaranteePeriod: nativeResult.guaranteePeriod ?? null,
    advisor: nativeResult.advisor ?? null,
    quoteDate: nativeResult.quoteDate ?? null,
    totalContributed,
    totalContributedMXN: acceptedMxn107z15p2R9C(totalContributed, currentUdi),
    totalRecovery: commercialRecovery,
    totalRecoveryMXN: acceptedMxn107z15p2R9C(commercialRecovery, currentUdi),
    udiRateMetadata,
    udiProjection: packet?.udiProjection || nativeResult?.udiProjection || null,
    optionalCoverages: acceptedArray107z15p2R9C(nativeResult.optionalCoverages),
    accumulatedIncome: [],
    base: null,
    favorable: null,
    unfavorable: null,
    interestRate: nativeResult.retirementInterestRate ?? null,
    projectedUdiAtRetirement: null,
    currentProtectionMXN: acceptedMxn107z15p2R9C(sumAssured, currentUdi),
    monthlyIncomeMXN: null,
    annualIncomeMXN: null
  };
}

function parsedRetirementQuote(nativeResult, totalContributed, paymentYears, base) {
  const annualPremium = nativeResult.premiumTable?.annual ?? nativeResult.totalAnnualPremium ?? nativeResult.premium;
  const plannedAnnual = nativeResult.premiumTable?.plannedAnnual ?? nativeResult.plannedAnnualPremium ?? null;
  const basicAnnual = nativeResult.baseAnnualPremium ?? null;
  const retirementAge = parseYears(nativeResult.retirementAge) ?? parseYears(nativeResult.plan) ?? null;
  const coverageYears = parseYears(nativeResult.policyTerm);
  const currentAge =
    parseYears(nativeResult.currentAge ?? nativeResult.insuredAge ?? nativeResult.age) ??
    (
      Number.isFinite(Number(retirementAge)) && Number.isFinite(Number(coverageYears))
        ? Number(retirementAge) - Number(coverageYears)
        : null
    );
  return {
    productName: nativeResult.product ?? nativeResult.plan ?? null,
    currency: nativeResult.currency ?? "UDI",
    currentAge,
    retirementAge,
    coverageYears,
    sumAssuredUdi: nativeResult.sumInsured ?? nativeResult.sumAssured ?? null,
    savingsUdiGrowthRate:
      nativeResult.savingsUdiGrowthRate ??
      nativeResult.annualUdiGrowthRate ??
      nativeResult.savingsProjectionRate ??
      null,
    retirementUdiGrowthRate:
      nativeResult.retirementUdiGrowthRate ??
      nativeResult.retirementProjectionRate ??
      null,
    projectedUdiAtRetirement:
      nativeResult.projectedUdiAtRetirement ??
      nativeResult.projectedUdiValueAtRetirement ??
      null,
    annualIncomeUdiAtRetirement:
      base?.annualIncomeUdi ??
      base?.annualIncome ??
      (
        Number.isFinite(Number(base?.monthlyIncomeUdi))
          ? Number(base.monthlyIncomeUdi) * 12
          : null
      ),
    premiumStructure: {
      basicAnnualPremium: Number.isFinite(Number(basicAnnual)) ? Number(basicAnnual) : null,
      plannedAnnualContribution: Number.isFinite(Number(plannedAnnual)) ? Number(plannedAnnual) : null,
      totalAnnualPremium: Number(annualPremium),
      premiumPayingYears: paymentYears,
      paidUntilAge: parseYears(nativeResult.paidUntilAge)
    },
    scenarios: {
      base: {
        lumpSum: base?.singlePaymentUdi,
        monthlyIncome: base?.monthlyIncomeUdi
      }
    },
    evidence: {
      premiumStructure: "SOURCE_PACKET",
      scenarios: "SOURCE_PACKET",
      totalContributed: hasValue(totalContributed)
        ? "CALCULATED_BY_RETIREMENT_PRESENTATION_SCENARIO_ENGINE"
        : "MISSING"
    }
  };
}

async function calculatorApi() {
  if (globalThis.ForgeQuoteCalculators?.calculateTotalContributed) {
    return globalThis.ForgeQuoteCalculators;
  }
  return new Promise((resolve, reject) => {
    const timer = globalThis.setTimeout(
      () => reject(new Error("El módulo de calculadora no terminó de cargar.")),
      5000
    );
    globalThis.addEventListener("forge:quote-calculators-ready", event => {
      globalThis.clearTimeout(timer);
      resolve(event.detail);
    }, { once: true });
  });
}

async function browserUdiRateProvider() {
  if (typeof globalThis.ForgeQuoteUdiRateProvider === "function") {
    return globalThis.ForgeQuoteUdiRateProvider();
  }
  if (globalThis.ForgeQuoteUdiRateCache) return globalThis.ForgeQuoteUdiRateCache;
  if (typeof fetch === "function") {
    for (const cacheUrl of DEFAULT_CACHE_CANDIDATES) {
      try {
        const response = await fetch(cacheUrl, { cache: "no-store" });
        if (response.ok) return response.json();
      } catch (error) {
        // Browser-safe fallback: missing public cache must not block the UI.
      }
    }
  }
  return null;
}

async function enrichPacketWithUdiRuntime107z15p2R11F2(packet) {
  const runtime = globalThis.ForgeUdiMxnRuntime;
  if (!runtime || typeof runtime.enrichAcceptedQuotePacket !== "function") return packet;

  try {
    return await runtime.enrichAcceptedQuotePacket(packet);
  } catch (error) {
    return packet;
  }
}

function validatePacket(value) {
  if (!value || typeof value !== "object") {
    throw new Error("El paquete debe ser un objeto JSON.");
  }

  if (!value.nativeResult || typeof value.nativeResult !== "object") {
    throw new Error("El paquete no contiene nativeResult.");
  }

  if (!value.context || typeof value.context !== "object") {
    throw new Error("El paquete no contiene context.");
  }

  return value;
}

function isPdfSelection107z15p2R9C(file) {
  const name = String(file?.name || "");
  return file?.type === "application/pdf" || /\.pdf$/i.test(name);
}

async function calculateAcceptedQuote(currentPacket) {
  const enrichedPacket = await enrichPacketWithUdiRuntime107z15p2R11F2(currentPacket);
  const nativeResult = buildAcceptedNativeResult107z15p2R9C(enrichedPacket);
  if (isOrviAcceptedQuotePacket(enrichedPacket, nativeResult)) { return buildOrviAcceptedQuoteCalculation({ packet: enrichedPacket, nativeResult }); } if (isVidaMujerAccepted107z15p2R9C(enrichedPacket, nativeResult)) {
    return calculateVidaMujerAccepted107z15p2R9C(enrichedPacket, nativeResult);
  }
  if (isSegubecaAcceptedR14E(enrichedPacket, nativeResult)) {
    return calculateSegubecaAcceptedR14E(enrichedPacket, nativeResult);
  }

  const annualPremium = nativeResult.premiumTable?.annual ?? nativeResult.totalAnnualPremium ?? nativeResult.premium;
  const paymentYears = parseYears(nativeResult.paymentTerm) ?? parseYears(nativeResult.plan);
  if (!Number.isFinite(Number(annualPremium))) throw new Error("La prima anual no está disponible para la calculadora.");
  if (!Number.isFinite(paymentYears)) throw new Error("El plazo de pagos no está disponible para la calculadora.");

  const calculators = await calculatorApi();
  const totalContributed = calculators.calculateTotalContributed({
    totalAnnualPremium: Number(annualPremium),
    premiumPayingYears: paymentYears
  });
  const currency = nativeResult.currency ?? "UDI";
  const base = scenarioObject(nativeResult, "retirementScenarioBase", "retirementBase");
  const favorable = scenarioObject(nativeResult, "retirementScenarioFavorable", "retirementFavorable");
  const unfavorable = scenarioObject(nativeResult, "retirementScenarioUnfavorable", "retirementUnfavorable");
  const udiRateMetadata = isUdiCurrency(currency) && calculators.getVerifiedUdiRateMetadata
    ? await calculators.getVerifiedUdiRateMetadata({ rateProvider: browserUdiRateProvider })
    : null;
  const retirementScenario = isUdiCurrency(currency) && calculators.buildRetirementPresentationScenario
    ? calculators.buildRetirementPresentationScenario({
        parsedQuote: parsedRetirementQuote(nativeResult, totalContributed, paymentYears, base),
        udiRateMetadata: udiRateMetadata || {}
      })
    : null;

  return {
    totalContributed,
    totalRecovery: base && hasValue(base.singlePaymentUdi) ? Number(base.singlePaymentUdi) : null,
    totalContributedMXN: retirementScenario?.summary?.totalContributedMXN ?? null,
    totalRecoveryMXN: retirementScenario?.summary?.lumpSumMXN ?? null,
    projectedUdiAtRetirement: retirementScenario?.summary?.projectedUdiAtRetirement ?? null,
    monthlyIncomeMXN: retirementScenario?.summary?.monthlyIncomeMXN ?? null,
    annualIncomeMXN: retirementScenario?.summary?.annualIncomeMXN ?? null,
    currentProtectionMXN:
      retirementScenario?.summary?.udiProjection?.protection?.death?.mxnCurrent ??
      null,
    accumulatedIncome:
      retirementScenario?.summary?.udiProjection?.retirement?.accumulatedIncome ??
      [],
    udiProjection: retirementScenario?.summary?.udiProjection ?? null,
    nativeResult,
    context: enrichedPacket?.context || {},
    productIntelligence: enrichedPacket?.productIntelligence || null,
    productFamily: enrichedPacket?.context?.productFamily || enrichedPacket?.context?.product_family || nativeResult.productFamily || nativeResult.product_family || null,
    product: nativeResult.product || enrichedPacket?.context?.product || null,
    udiRateMetadata,
    retirementScenarioStatus: retirementScenario?.status ?? null,
    paymentYears,
    currency,
    base,
    favorable,
    unfavorable,
    paymentMode: nativeResult.paymentMode ?? nativeResult.liquidationOption ?? null,
    interestRate: nativeResult.retirementInterestRate ?? null,
    guaranteePeriod: nativeResult.guaranteePeriod ?? null,
    coveragePeriod: nativeResult.policyTerm ?? null,
    advisor: nativeResult.advisor ?? null,
    quoteDate: nativeResult.quoteDate ?? null,
    optionalCoverages: Array.isArray(nativeResult.optionalCoverages) ? nativeResult.optionalCoverages : []
  };
}

const api = Object.freeze({
  calculateAcceptedQuote,
  validatePacket,
  isPdfSelection107z15p2R9C,
  buildAcceptedNativeResult107z15p2R9C,
  isVidaMujerAccepted107z15p2R9C,
  isSegubecaAcceptedR14E,
  calculateSegubecaAcceptedR14E
});

globalThis.ForgeAcceptedQuoteAdapter = api;

export {
  calculateAcceptedQuote,
  validatePacket,
  isPdfSelection107z15p2R9C,
  buildAcceptedNativeResult107z15p2R9C,
  isVidaMujerAccepted107z15p2R9C,
  isSegubecaAcceptedR14E,
  calculateSegubecaAcceptedR14E
};
