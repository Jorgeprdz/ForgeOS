'use strict';

function cleanValue(value) {
  if (value == null) return null;
  return String(value).replace(/\s+/g, ' ').replace(/^[\s:.-]+|[\s:.-]+$/g, '').trim() || null;
}

function normalizeText(text) {
  return String(text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function numberFrom(value) {
  if (value == null) return null;
  const match = String(value).replace(/,/g, '').match(/-?[0-9]+(?:\.[0-9]+)?/);
  if (!match) return null;
  const number = Number.parseFloat(match[0]);
  return Number.isFinite(number) ? number : null;
}

function formatUdi(value) {
  const number = numberFrom(value);
  return number == null ? null : String(number);
}

function parseNumberList(value) {
  return Array.from(String(value || '').matchAll(/[0-9]{1,3}(?:,[0-9]{3})+(?:\.[0-9]+)?|[0-9]+(?:\.[0-9]+)?/g))
    .map((match) => numberFrom(match[0]))
    .filter((number) => number != null);
}

function yearsFrom(value) {
  const match = String(value || '').match(/([0-9]{1,3})\s*(?:a[nñ]os|años|year|years)?/i);
  if (!match) return null;
  const years = Number.parseInt(match[1], 10);
  return Number.isFinite(years) && years > 0 && years <= 120 ? years : null;
}

function roundMoney(value) {
  return value == null || !Number.isFinite(value) ? null : Math.round(value * 100) / 100;
}

function detectQuoteDomain(text) {
  const hay = normalizeText(text);
  const lifeSignals = ['vida', 'imagina ser', 'retiro', 'fallecimiento', 'prima planeada', 'solucionline', 'fondo de reserva', 'rentas', 'udi', 'fumador'];
  const gmmSignals = ['gastos medicos mayores', 'gmm', 'deducible', 'coaseguro', 'tabulador', 'hospitalario', 'alfa medical'];
  const lifeScore = lifeSignals.reduce((score, token) => score + (hay.includes(token) ? 1 : 0), 0);
  const gmmScore = gmmSignals.reduce((score, token) => score + (hay.includes(token) ? 1 : 0), 0);
  if (lifeScore > gmmScore) return 'life';
  if (gmmScore > lifeScore) return 'gmm';
  if (lifeScore > 0) return 'life';
  if (gmmScore > 0) return 'gmm';
  return 'unknown';
}

// FORGE_IMAGINA_SER_ECONOMIC_SCENARIOS_V2
function forgeExtractImaginaSerEconomicScenarios(text) {
  const normalizedText = String(text || "")
    .replace(/\r/g, "");

  const lines = normalizedText.split("\n");

  if (!/IMAGINA\s+SER/i.test(normalizedText)) {
    return null;
  }

  const clean = value => String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();

  const columns = line => String(line || "")
    .trim()
    .split(/\s{2,}/)
    .map(clean)
    .filter(Boolean);

  const numeric = value => {
    if (value === null || value === undefined) {
      return null;
    }

    const cleaned = String(value)
      .replace(/,/g, "")
      .replace(/[^\d.-]/g, "");

    if (!cleaned) {
      return null;
    }

    const parsed = Number(cleaned);

    return Number.isFinite(parsed)
      ? parsed
      : null;
  };

  const findLine = pattern =>
    lines.find(line => pattern.test(line)) || "";

  const fieldAfterColon = (line, label) => {
    const pattern = new RegExp(
      `${label}\\s*:\\s*(.+?)\\s*$`,
      "i"
    );

    const match = String(line || "").match(pattern);

    return match
      ? clean(match[1])
      : null;
  };

  const advisorLine = findLine(
    /Asesor profesional de seguros:/i
  );

  const insuredLine = findLine(
    /Asegurado:/i
  );

  const birthLine = findLine(
    /Fecha de nacimiento:/i
  );

  const genderLine = findLine(
    /G[eé]nero:/i
  );

  const liquidationLine = findLine(
    /Opci[oó]n de liquidaci[oó]n:/i
  );

  const coverageIndex = lines.findIndex(
    line => {
      const cells = columns(line);

      return (
        cells.length >= 4
        && /^IMAGINA\s+SER\s+\d+\s+PAGOS$/i.test(
          cells[0]
        )
        && /^\d+\s+a[nñ]os$/i.test(cells[1])
        && numeric(cells[2]) !== null
        && numeric(cells[3]) !== null
      );
    }
  );

  if (coverageIndex < 0) {
    return null;
  }

  const coverageCells = columns(
    lines[coverageIndex]
  );

  const limitedLine =
    lines
      .slice(
        coverageIndex + 1,
        coverageIndex + 4
      )
      .find(
        line => /^\s*LIMITADOS\s+\d+\s*$/i.test(
          line
        )
      )
    || "";

  const limitedMatch = limitedLine.match(
    /LIMITADOS\s+(\d+)/i
  );

  const plan = clean(
    `${coverageCells[0]} ${
      limitedMatch
        ? `LIMITADOS ${limitedMatch[1]}`
        : ""
    }`
  );

  const paymentYears = limitedMatch
    ? numeric(limitedMatch[1])
    : null;

  const policyTerm = coverageCells[1] || null;
  const sumInsured = numeric(coverageCells[2]);
  const baseAnnualPremium = numeric(coverageCells[3]);

  const birthMatch = birthLine.match(
    /Fecha de nacimiento:\s*(\d{1,2}\/\d{1,2}\/\d{4}).*?Edad:\s*(\d+)/i
  );

  const genderMatch = genderLine.match(
    /G[eé]nero:\s*([A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+).*?Fumador:\s*([A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)/i
  );

  const liquidationMatch = liquidationLine.match(
    /Opci[oó]n de liquidaci[oó]n:\s*(.*?)\s+Moneda:\s*([A-Z]+)/i
  );

  const premiumValues = line => {
    const cells = columns(line);

    return cells
      .slice(1)
      .map(numeric);
  };

  const basicPremiumLine = findLine(
    /^\s*Prima b[aá]sica\s+/i
  );

  const plannedPremiumLine = findLine(
    /^\s*Prima planeada\s+/i
  );

  const totalPremiumLine = findLine(
    /^\s*Prima total\s+/i
  );

  const totalAnnualLine = findLine(
    /Prima Total Anual/i
  );

  const basicPremiumValues = premiumValues(
    basicPremiumLine
  );

  const plannedPremiumValues = premiumValues(
    plannedPremiumLine
  );

  const totalTablePremiumValues = premiumValues(
    totalPremiumLine
  );

  const totalAnnualValues = columns(
    totalAnnualLine
  )
    .slice(1)
    .map(numeric)
    .filter(value => value !== null);

  const totalAnnualPremium =
    totalAnnualValues.length
      ? totalAnnualValues[
          totalAnnualValues.length - 1
        ]
      : (
          totalTablePremiumValues[3]
          ?? basicPremiumValues[3]
          ?? null
        );

  const policyYears = numeric(policyTerm);

  let scenarioValues = null;

  for (const line of lines) {
    const cells = columns(line);

    if (cells.length < 8) {
      continue;
    }

    const values = cells
      .slice(0, 8)
      .map(numeric);

    if (
      values.every(value => value !== null)
      && values[0] === policyYears
    ) {
      scenarioValues = values;
      break;
    }
  }

  const scenario = offset => (
    scenarioValues
      ? {
          year: scenarioValues[0],
          age: scenarioValues[1],
          singlePaymentUdi:
            scenarioValues[offset],
          monthlyIncomeUdi:
            scenarioValues[offset + 1]
        }
      : null
  );

  const interestLine = findLine(
    /inter[eé]s utilizada/i
  );

  const retirementInterestMatch =
    interestLine.match(
      /([0-9]+(?:\.[0-9]+)?)\s*%/
    );

  const guaranteeLine = findLine(
    /periodo de garant[ií]a/i
  );

  const guaranteeMatch =
    guaranteeLine.match(
      /garant[ií]a\s+de\s+([0-9]+\s+a[nñ]os)/i
    );

  const studyDateLine = findLine(
    /Este estudio se realiz[oó].*d[ií]a/i
  );

  const quoteDateMatch =
    studyDateLine.match(
      /d[ií]a\s+(\d{1,2}\/\d{1,2}\/\d{4})/i
    );

  return {
    detectedQuoteDomain: "life",
    sourceLayout:
      "solucionline_imagina_ser_economic_scenarios",
    product: "IMAGINA SER",
    plan,
    prospect: fieldAfterColon(
      insuredLine,
      "Asegurado"
    ),
    age: birthMatch ? birthMatch[2] : null,
    gender: genderMatch ? genderMatch[1] : null,
    smoker: genderMatch ? genderMatch[2] : null,
    birthDate: birthMatch ? birthMatch[1] : null,
    liquidationOption:
      liquidationMatch
        ? clean(liquidationMatch[1])
        : null,
    currency:
      liquidationMatch
        ? liquidationMatch[2]
        : "UDI",
    policyTerm,
    paymentTerm:
      paymentYears !== null
        ? `${paymentYears} años`
        : null,
    sumInsured,
    baseAnnualPremium,
    totalAnnualPremium,
    premium: totalAnnualPremium,
    paymentMode: "Anual",
    premiumTable: {
      monthly:
        basicPremiumValues[0]
        ?? totalTablePremiumValues[0]
        ?? null,
      quarterly:
        basicPremiumValues[1]
        ?? totalTablePremiumValues[1]
        ?? null,
      semiannual:
        basicPremiumValues[2]
        ?? totalTablePremiumValues[2]
        ?? null,
      annual:
        basicPremiumValues[3]
        ?? totalTablePremiumValues[3]
        ?? totalAnnualPremium
        ?? null,
      plannedMonthly:
        plannedPremiumValues[0]
        ?? null,
      plannedQuarterly:
        plannedPremiumValues[1]
        ?? null,
      plannedSemiannual:
        plannedPremiumValues[2]
        ?? null,
      plannedAnnual:
        plannedPremiumValues[3]
        ?? null
    },
    retirementInterestRate:
      retirementInterestMatch
        ? `${retirementInterestMatch[1]}%`
        : null,
    retirementScenarioBase:
      scenario(2),
    retirementScenarioFavorable:
      scenario(4),
    retirementScenarioUnfavorable:
      scenario(6),
    guaranteePeriod:
      guaranteeMatch
        ? guaranteeMatch[1]
        : null,
    optionalCoverages: [],
    advisor: fieldAfterColon(
      advisorLine,
      "Asesor profesional de seguros"
    ),
    quoteDate:
      quoteDateMatch
        ? quoteDateMatch[1]
        : null,
    extractionSource:
      "pdf_text_life_fallback"
  };
}

function extractSolucionlineLifeQuoteFields(text) {

  const forgeImaginaSerEconomicScenarios =
    forgeExtractImaginaSerEconomicScenarios(
      text
    );

  if (forgeImaginaSerEconomicScenarios) {
    return forgeImaginaSerEconomicScenarios;
  }
  if (!/Solucionline|Escenarios Econ[oó]micos|IMAGINA SER/i.test(text)) return null;

  const lines = String(text).split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  const findLine = (pattern) => lines.find((line) => pattern.test(line)) || '';

  const advisorLine = findLine(/Asesor profesional de seguros:/i);
  const insuredLine = findLine(/Asegurado:/i);
  const birthLine = findLine(/Fecha de nacimiento:/i);
  const genderLine = findLine(/G[eé]nero:/i);
  const liquidationLine = findLine(/Opci[oó]n de liquidaci[oó]n:/i);
  const productIndex = lines.findIndex((line) => /IMAGINA SER/i.test(line));
  const productLine = productIndex >= 0 ? lines[productIndex] : '';
  const continuationLine = productIndex >= 0 && /LIMITADOS/i.test(lines[productIndex + 1] || '') ? lines[productIndex + 1] : '';
  const planText = cleanValue(`${(productLine.match(/(IMAGINA SER.*?)(?:\d+\s+a[nñ]os|$)/i) || [])[1] || 'IMAGINA SER'} ${continuationLine}`);
  const productMatch = productLine.match(/(IMAGINA SER.*?)\s+([0-9]+\s+a[nñ]os)\s+([0-9,]+)\s+([0-9,.]+)/i);
  const totalPremiumValues = parseNumberList(findLine(/Prima Total Anual/i));
  const basicPremiumValues = parseNumberList(findLine(/Prima b[aá]sica/i));
  const plannedPremiumValues = parseNumberList(findLine(/Prima planeada/i));
  const totalTablePremiumValues = parseNumberList(findLine(/Prima total/i));
  const scenarioLine = lines.find((line) => /^\d+\s+\d+\s+[0-9,]+\s+[0-9,]+\s+[0-9,]+\s+[0-9,]+\s+[0-9,]+\s+[0-9,]+$/.test(line)) || '';
  const scenarioValues = parseNumberList(scenarioLine);
  const interestValues = parseNumberList(findLine(/inter[eé]s utilizada/i));
  const studyDateLine = findLine(/Solucionline versi[oó]n/i);
  const guaranteeLine = findLine(/periodo de garant[ií]a/i);
  const paymentTermMatch = planText && String(planText).match(/LIMITADOS\s+([0-9]+)/i);
  const birthMatch = birthLine.match(/Fecha de nacimiento:\s*([0-9]{1,2}\/[0-9]{1,2}\/[0-9]{2,4}).*Edad:\s*([0-9]{1,3})/i);
  const genderMatch = genderLine.match(/G[eé]nero:\s*([A-Za-zÁÉÍÓÚáéíóúÑñ]+).*Fumador:\s*([A-Za-zÁÉÍÓÚáéíóúÑñ]+)/i);
  const liquidationMatch = liquidationLine.match(/Opci[oó]n de liquidaci[oó]n:\s*(.*?)\s+Moneda:\s*([A-Z]+)/i);

  const additionalCoverages = [];
  for (const line of lines) {
    const match = line.match(/^(BAM UI|AV UI|BIT 65|BMA 65|BAIT 65)\s+(.+?)\s+(Amparado|[0-9,]+)\s+([0-9,.]+)$/i);
    if (!match) continue;
    additionalCoverages.push({
      coverage: match[1],
      term: cleanValue(match[2]),
      sumInsured: cleanValue(match[3]),
      annualPremium: formatUdi(match[4])
    });
  }

  const scenario = (offset) => scenarioValues.length >= offset + 2 ? {
    policyYear: scenarioValues[0],
    age: scenarioValues[1],
    singlePaymentUdi: scenarioValues[offset],
    monthlyIncomeUdi: scenarioValues[offset + 1]
  } : null;

  return {
    detectedQuoteDomain: 'life',
    sourceLayout: 'solucionline_imagina_ser_economic_scenarios',
    product: 'IMAGINA SER',
    plan: planText || 'IMAGINA SER',
    prospect: insuredLine ? cleanValue(insuredLine.replace(/Asegurado:/i, '')) : null,
    age: birthMatch ? birthMatch[2] : null,
    gender: genderMatch ? genderMatch[1] : null,
    smoker: genderMatch ? genderMatch[2] : null,
    birthDate: birthMatch ? birthMatch[1] : null,
    liquidationOption: liquidationMatch ? liquidationMatch[1] : null,
    currency: liquidationMatch ? liquidationMatch[2] : 'UDI',
    policyTerm: productMatch ? cleanValue(productMatch[2]) : null,
    paymentTerm: paymentTermMatch ? `${paymentTermMatch[1]} años` : null,
    sumInsured: productMatch ? formatUdi(productMatch[3]) : null,
    baseAnnualPremium: productMatch ? formatUdi(productMatch[4]) : null,
    totalAnnualPremium: totalPremiumValues.length ? formatUdi(totalPremiumValues[totalPremiumValues.length - 1]) : null,
    premium: totalPremiumValues.length ? formatUdi(totalPremiumValues[totalPremiumValues.length - 1]) : null,
    paymentMode: 'Anual',
    premiumTable: {
      monthly: basicPremiumValues[0] ?? totalTablePremiumValues[0] ?? null,
      quarterly: basicPremiumValues[1] ?? totalTablePremiumValues[1] ?? null,
      semiannual: basicPremiumValues[2] ?? totalTablePremiumValues[2] ?? null,
      annual: basicPremiumValues[3] ?? totalTablePremiumValues[3] ?? totalPremiumValues[totalPremiumValues.length - 1] ?? null,
      plannedMonthly: plannedPremiumValues[0] ?? null,
      plannedQuarterly: plannedPremiumValues[1] ?? null,
      plannedSemiannual: plannedPremiumValues[2] ?? null,
      plannedAnnual: plannedPremiumValues[3] ?? null
    },
    retirementInterestRate: interestValues.length ? `${interestValues[0]}%` : null,
    retirementScenarioBase: scenario(2),
    retirementScenarioFavorable: scenario(4),
    retirementScenarioUnfavorable: scenario(6),
    guaranteePeriod: (guaranteeLine.match(/garant[ií]a de\s+([0-9]+\s+a[nñ]os)/i) || [])[1] || null,
    optionalCoverages: additionalCoverages,
    advisor: advisorLine ? cleanValue(advisorLine.replace(/Asesor profesional de seguros:/i, '')) : null,
    quoteDate: (studyDateLine.match(/d[ií]a\s+([0-9]{1,2}\/[0-9]{1,2}\/[0-9]{2,4})/i) || [])[1] || null,
    extractionSource: 'pdf_text_life_fallback'
  };
}

function buildCalculation(result, options = {}) {
  const udiMxn = Number.parseFloat(options.udiMxn);
  const udiGrowthRate = Number.parseFloat(options.udiGrowthRate);
  const policyYears = yearsFrom(result.policyTerm);
  const paymentYears = yearsFrom(result.paymentTerm) || policyYears;
  const premiumUdi = numberFrom(result.totalAnnualPremium || result.premium);
  const sumInsuredUdi = numberFrom(result.sumInsured);
  const savingsGoalUdi = numberFrom(result.retirementScenarioBase && result.retirementScenarioBase.singlePaymentUdi);
  const warnings = [];

  const canConvert = Number.isFinite(udiMxn);
  const canProject = canConvert && Number.isFinite(udiGrowthRate) && options.udiGrowthSource && options.udiGrowthEvidence;
  if (!canConvert) warnings.push('UDI_MXN is required for MXN conversion.');
  if (!canProject) warnings.push('Forge UDI growth rule evidence is required for future projection; no invented projection was used.');

  const mxn = (valueUdi) => canConvert && valueUdi != null ? roundMoney(valueUdi * udiMxn) : null;
  const projectedMxn = (valueUdi) => canProject && valueUdi != null && policyYears != null ? roundMoney(valueUdi * udiMxn * Math.pow(1 + udiGrowthRate, policyYears)) : null;
  const scenarioMxn = (scenario, projected) => {
    if (!scenario) return null;
    return {
      policyYear: scenario.policyYear,
      age: scenario.age,
      singlePaymentMxn: projected ? projectedMxn(scenario.singlePaymentUdi) : mxn(scenario.singlePaymentUdi),
      monthlyIncomeMxn: projected ? projectedMxn(scenario.monthlyIncomeUdi) : mxn(scenario.monthlyIncomeUdi)
    };
  };

  return {
    calculationMode: 'forge_quote_pdf_preview_with_evidenced_udi_growth_rule',
    officialQuoteTruthClaimed: false,
    providerRuntime: false,
    quoteWrite: false,
    udiMxn: canConvert ? udiMxn : null,
    udiSource: options.udiSource || null,
    udiDate: options.udiDate || null,
    udiGrowthRate: Number.isFinite(udiGrowthRate) ? udiGrowthRate : null,
    udiGrowthSource: options.udiGrowthSource || null,
    udiGrowthEvidence: options.udiGrowthEvidence || null,
    projectedUdiMxnAtPolicyTerm: canProject && policyYears != null ? roundMoney(udiMxn * Math.pow(1 + udiGrowthRate, policyYears)) : null,
    policyYears,
    paymentYears,
    premiumUdi,
    annualPremiumMxnToday: mxn(premiumUdi),
    sumInsuredUdi,
    sumInsuredMxnToday: mxn(sumInsuredUdi),
    savingsGoalUdi,
    savingsGoalMxnToday: mxn(savingsGoalUdi),
    premiumMxnProjectedAtPolicyTerm: projectedMxn(premiumUdi),
    sumInsuredMxnProjectedAtPolicyTerm: projectedMxn(sumInsuredUdi),
    savingsGoalMxnProjectedAtPolicyTerm: projectedMxn(savingsGoalUdi),
    totalPaidMxnTodayAssumption: paymentYears && premiumUdi != null ? roundMoney((mxn(premiumUdi) || 0) * paymentYears) : null,
    scenarioProjectionMxnToday: {
      base: scenarioMxn(result.retirementScenarioBase, false),
      favorable: scenarioMxn(result.retirementScenarioFavorable, false),
      unfavorable: scenarioMxn(result.retirementScenarioUnfavorable, false)
    },
    scenarioProjectionMxnAtPolicyTerm: {
      base: scenarioMxn(result.retirementScenarioBase, true),
      favorable: scenarioMxn(result.retirementScenarioFavorable, true),
      unfavorable: scenarioMxn(result.retirementScenarioUnfavorable, true)
    },
    warnings
  };
}

function summarizeForgeQuotePdfText(input = {}) {
  const text = String(input.text || input.rawText || input.quoteText || '');
  const detectedQuoteDomain = detectQuoteDomain(text);
  const extracted = detectedQuoteDomain === 'life' ? extractSolucionlineLifeQuoteFields(text) : null;
  const result = {
    detectedQuoteDomain,
    ...(extracted || { extractionSource: 'unsupported_pdf_text_layout' })
  };
  result.extractedFieldCount = Object.values(result).filter((value) => value != null && value !== '' && (!Array.isArray(value) || value.length)).length;
  result.calculation = buildCalculation(result, input);
  return {
    status: extracted ? 'PASS' : 'NO_PASS',
    sourceModule: 'forge-quote-pdf-preview-engine.js',
    exportUsed: 'summarizeForgeQuotePdfText',
    mode: 'forge_local_preview',
    bindingQuoteTruthClaimed: false,
    providerRuntime: false,
    quoteWrite: false,
    result
  };
}

function buildForgeQuoteExcelTables(summary) {
  const result = summary.result || {};
  const calculation = result.calculation || {};
  return {
    Resumen: [
      ['Campo', 'Valor', 'Metrica', 'Valor'],
      ['Producto', result.product || '', 'UDI usada', calculation.udiMxn || ''],
      ['Plan', result.plan || '', 'Crecimiento UDI', calculation.udiGrowthRate || ''],
      ['Prospecto', result.prospect || '', 'UDI proyectada', calculation.projectedUdiMxnAtPolicyTerm || ''],
      ['Prima anual UDI', calculation.premiumUdi || '', 'Prima anual MXN hoy', calculation.annualPremiumMxnToday || ''],
      ['Suma asegurada UDI', calculation.sumInsuredUdi || '', 'Suma asegurada MXN hoy', calculation.sumInsuredMxnToday || '']
    ],
    DatosPDF: Object.entries(result).filter(([key]) => key !== 'calculation').map(([key, value]) => [key, typeof value === 'object' ? JSON.stringify(value) : value]),
    CalculoUDI: Object.entries(calculation).map(([key, value]) => [key, typeof value === 'object' ? JSON.stringify(value) : value])
  };
}

module.exports = {
  detectQuoteDomain,
  extractSolucionlineLifeQuoteFields,
  buildCalculation,
  summarizeForgeQuotePdfText,
  buildForgeQuoteExcelTables
};
