const SEGUBECA_PARSER_VERSION = "R14C_segubeca_solucionline_pdf_intake";

function normalizeText(value) {
  return String(value || "")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\r/g, "\n")
    .trim();
}

function compactText(value) {
  return normalizeText(value).replace(/\s+/g, " ");
}

function lines(value) {
  return normalizeText(value)
    .split("\n")
    .map((line) => line.trim().replace(/\s+/g, " "))
    .filter(Boolean);
}

function numberFromText(value) {
  if (value === null || value === undefined || value === "" || value === "-") return null;
  const cleaned = String(value).replace(/,/g, "").replace(/[^\d.-]/g, "");
  if (!cleaned || cleaned === "-" || cleaned === ".") return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function roundNumber(value) {
  const parsed = numberFromText(value);
  return parsed === null ? null : Math.round(parsed);
}

function findRow(rows, pattern) {
  return rows.find((row) => pattern.test(row)) || null;
}

function parseParticipantRows(rows) {
  const participants = {};
  const rawRows = [];
  const rolePattern = /^(Titular|Contratante)\s+(.+?)\s+(?:No|Si|Sí)\s+\d{2}\/\d{2}\/\d{4}\s+(\d{1,3})\s+(\d{1,3})\s+(Femenino|Masculino)\s+(No|Si|Sí)$/i;

  for (const row of rows) {
    const match = row.match(rolePattern);
    if (!match) continue;
    const role = match[1];
    const person = {
      role,
      name: match[2].trim(),
      age: numberFromText(match[3]),
      calculationAge: numberFromText(match[4]),
      gender: match[5],
      smoker: /^s/i.test(match[6]) ? "Sí" : "No"
    };
    rawRows.push(person);

    if (/titular/i.test(role)) {
      participants.child_or_education_beneficiary = person.name;
      participants.child_age = person.calculationAge ?? person.age;
      participants.child_gender = person.gender;
    }
    if (/contratante/i.test(role)) {
      participants.primary_insured = person.name;
      participants.primary_age = person.calculationAge ?? person.age;
      participants.primary_gender = person.gender;
    }
  }

  participants.participant_modality = participants.primary_insured && participants.child_or_education_beneficiary
    ? "individual"
    : "unknown";

  return { participants, rawRows };
}

function parseBaseCoverage(rows) {
  const row = findRow(rows, /^Segu\s*Beca\s+18\b/i) || findRow(rows, /^Segubeca\s+18\b/i);
  if (!row) return null;

  const match = row.match(/^(Segu\s*Beca\s+18|Segubeca\s+18)(?:\s+\([^)]+\))?\s+(\d{1,2}\s*años)\s+([0-9]{1,3}(?:,[0-9]{3})*|[0-9]+)\s+([0-9]{1,3}(?:,[0-9]{3})*\.[0-9]{2})/i);
  if (!match) return { name: "SeguBeca 18", raw: row };

  return {
    name: match[1].replace(/\s+/g, ""),
    displayName: "SeguBeca 18",
    coveragePeriod: match[2],
    coverageYears: numberFromText(match[2]),
    sumAssured: numberFromText(match[3]),
    annualPremium: numberFromText(match[4]),
    raw: row
  };
}

function parseCoverageRows(rows) {
  const coveragePatterns = [
    /^(Protección por Fallecimiento e Invalidez del Contratante\s+\([^)]+\))\s+(\d{1,2}\s*años)\s+(Amparado|[0-9]{1,3}(?:,[0-9]{3})*)\s+([0-9]{1,3}(?:,[0-9]{3})*\.[0-9]{2}|SIN COSTO)$/i,
    /^(Cobertura de Protección Absoluta\s+\([^)]+\))\s+(\d{1,2}\s*años)\s+(Amparado|[0-9]{1,3}(?:,[0-9]{3})*)\s+([0-9]{1,3}(?:,[0-9]{3})*\.[0-9]{2}|SIN COSTO)$/i,
    /^(Beneficio de Asistencia Médica\s+\([^)]+\))\s+(1\s+REN|[0-9]\s+REN)\s+(Amparado|[0-9]{1,3}(?:,[0-9]{3})*)\s+(SIN COSTO|[0-9]{1,3}(?:,[0-9]{3})*\.[0-9]{2})$/i,
    /^(Beneficio de Pago de Suma Asegurada por Invalidez Total y Permanente\s+\([^)]+\))\s+(\d{1,2}\s*años)\s+(Amparado|[0-9]{1,3}(?:,[0-9]{3})*)\s+([0-9]{1,3}(?:,[0-9]{3})*\.[0-9]{2}|SIN COSTO)$/i,
    /^(Apoyo en Vida\s+\([^)]+\))\s+(1\s+REN|[0-9]\s+REN)\s+(Amparado|[0-9]{1,3}(?:,[0-9]{3})*)\s+(SIN COSTO|[0-9]{1,3}(?:,[0-9]{3})*\.[0-9]{2})$/i
  ];

  const coverages = [];
  for (const row of rows) {
    for (const pattern of coveragePatterns) {
      const match = row.match(pattern);
      if (!match) continue;
      coverages.push({
        name: match[1],
        coveragePeriod: match[2],
        sumAssured: /amparado/i.test(match[3]) ? "Amparado" : numberFromText(match[3]),
        annualPremium: /sin costo/i.test(match[4]) ? "SIN COSTO" : numberFromText(match[4]),
        raw: row
      });
      break;
    }
  }
  return coverages;
}

function parseRecommendedCoverages(rows) {
  const patterns = [
    /^(ADAPTA\s+\([^)]+\))\s+(\d+\s+REN)\s+([0-9]{1,3}(?:,[0-9]{3})*)\s+([0-9]{1,3}(?:,[0-9]{3})*\.[0-9]{2})$/i,
    /^(Beneficio por Muerte Accidental\s+\([^)]+\))\s+(\d{1,2}\s*años)\s+([0-9]{1,3}(?:,[0-9]{3})*)\s+([0-9]{1,3}(?:,[0-9]{3})*\.[0-9]{2})$/i,
    /^(Certificado de Garantía de Contratación\s+\([^)]+\))\s+(\d{1,2}\s*años)\s+([0-9]{1,3}(?:,[0-9]{3})*)\s+([0-9]{1,3}(?:,[0-9]{3})*\.[0-9]{2})$/i
  ];

  const recommended = [];
  for (const row of rows) {
    for (const pattern of patterns) {
      const match = row.match(pattern);
      if (!match) continue;
      recommended.push({
        name: match[1],
        coveragePeriod: match[2],
        sumAssured: numberFromText(match[3]),
        annualPremium: numberFromText(match[4]),
        raw: row
      });
      break;
    }
  }
  return recommended;
}

function parseTotalAnnualPremium(rows, rawText) {
  const row = findRow(rows, /^Prima\s+Total\s+Anual\s+/i);
  const match = row?.match(/^Prima\s+Total\s+Anual\s+([0-9]{1,3}(?:,[0-9]{3})*\.[0-9]{2})$/i) ||
    compactText(rawText).match(/Prima\s+Total\s+Anual\s+([0-9]{1,3}(?:,[0-9]{3})*\.[0-9]{2})/i);
  return match ? numberFromText(match[1]) : null;
}

function parseTotalWithRecommended(rows, rawText) {
  const row = findRow(rows, /^Prima\s+total\s+con\s+beneficios\s+recomendados\s+/i);
  const match = row?.match(/^Prima\s+total\s+con\s+beneficios\s+recomendados\s+([0-9]{1,3}(?:,[0-9]{3})*\.[0-9]{2})$/i) ||
    compactText(rawText).match(/Prima\s+total\s+con\s+beneficios\s+recomendados\s+([0-9]{1,3}(?:,[0-9]{3})*\.[0-9]{2})/i);
  return match ? numberFromText(match[1]) : null;
}

function parseGuaranteedRows(rows) {
  const guaranteed = [];
  const pattern = /^([0-9]{1,3}(?:\.[0-9]{2})?)\s*%\s+(\d{1,3})\s+([0-9]{1,3}(?:,[0-9]{3})*)\s+([0-9]{1,3}(?:,[0-9]{3})*)\s+([0-9]{1,3}(?:,[0-9]{3})*|0)\s+([0-9]{1,3}(?:,[0-9]{3})*|0)\s+([0-9]{1,3}(?:,[0-9]{3})*|0)\s+([0-9]{1,3}(?:,[0-9]{3})*)$/;
  for (const row of rows) {
    const match = row.match(pattern);
    if (!match) continue;
    guaranteed.push({
      recoveryPercent: numberFromText(match[1]),
      realAge: numberFromText(match[2]),
      annualPremium: numberFromText(match[3]),
      accumulatedAnnualPremiumWithAve: numberFromText(match[4]),
      aveSurrenderValue: numberFromText(match[5]),
      cashValue: numberFromText(match[6]),
      totalRecovery: numberFromText(match[7]),
      basicSumAssured: numberFromText(match[8]),
      raw: row
    });
  }
  return guaranteed;
}

function parseAdministrationRows(rows) {
  const adminRows = [];
  const pattern = /^(\d{1,2})\s+(\d{1,3})\s+([0-9]{1,3}(?:,[0-9]{3})*)\s+([0-9]{1,3}(?:,[0-9]{3})*)\s+([0-9]{1,3}(?:,[0-9]{3})*)\s+(-|[0-9]{1,3}(?:,[0-9]{3})*)\s+([0-9]{1,3}(?:,[0-9]{3})*)$/;
  for (const row of rows) {
    const match = row.match(pattern);
    if (!match) continue;
    adminRows.push({
      policyYear: numberFromText(match[1]),
      insuredAge: numberFromText(match[2]),
      sumAssuredToAdminister: numberFromText(match[3]),
      monthlyDelivery: numberFromText(match[4]),
      accumulatedDelivery: numberFromText(match[5]),
      deathBenefit: match[6] === "-" ? null : numberFromText(match[6]),
      cashValue: numberFromText(match[7]),
      raw: row
    });
  }
  return adminRows;
}

function parseInterestRate(rawText) {
  const match = compactText(rawText).match(/tasa\s+de\s+inter[eé]s\s+real\s+de:\s*([0-9]+(?:\.[0-9]+)?)\s*%/i) ||
    compactText(rawText).match(/tasa\s+de\s+inter[eé]s.*?([0-9]+(?:\.[0-9]+)?)\s*%\s+anual/i);
  return match ? numberFromText(match[1]) : null;
}

function buildMissingInformation(parsed) {
  const missing = [];
  if (!parsed.productName) missing.push("No se identificó SeguBeca en el PDF");
  if (!parsed.currency) missing.push("Falta moneda en la cotización SeguBeca");
  if (!parsed.participants?.primary_insured) missing.push("Falta contratante / asegurado principal");
  if (!parsed.participants?.child_or_education_beneficiary) missing.push("Falta menor asociado a la meta educativa");
  if (!parsed.baseCoverage?.sumAssured) missing.push("Falta meta educativa / suma asegurada base");
  if (!parsed.totalAnnualPremium) missing.push("Falta prima total anual");
  if (!parsed.administrationRows.length) missing.push("Falta tabla de administración del ahorro");
  if (!parsed.coverages.length) missing.push("Faltan coberturas estructuradas");
  return missing;
}

function parseSolucionlineSegubecaQuote({ text } = {}) {
  const rawText = normalizeText(text);
  const source = compactText(rawText);
  const rowValues = lines(rawText);
  const hasSegubeca = /segu\s*beca|segubeca/i.test(source);
  const hasCurrency = /UDI|Unidades de Inversi[oó]n/i.test(source);

  const participantResult = parseParticipantRows(rowValues);
  const baseCoverage = parseBaseCoverage(rowValues);
  const coverages = parseCoverageRows(rowValues);
  const recommendedCoverages = parseRecommendedCoverages(rowValues);
  const guaranteedRows = parseGuaranteedRows(rowValues);
  const administrationRows = parseAdministrationRows(rowValues);
  const interestRate = parseInterestRate(rawText);
  const totalAnnualPremium = parseTotalAnnualPremium(rowValues, rawText);
  const totalWithRecommended = parseTotalWithRecommended(rowValues, rawText);

  const parsed = {
    parserVersion: SEGUBECA_PARSER_VERSION,
    productName: hasSegubeca ? "SeguBeca" : null,
    planVariant: /Segu\s*Beca\s*18|Segubeca\s*18/i.test(source) ? "SeguBeca 18" : null,
    productFamily: hasSegubeca ? "segubeca" : null,
    currency: hasCurrency ? "UDI" : null,
    participants: participantResult.participants,
    participantRows: participantResult.rawRows,
    baseCoverage,
    coverages,
    recommendedCoverages,
    guaranteedRows,
    administrationRows,
    interestRate,
    administrationYears: administrationRows.length || null,
    monthlyDelivery: administrationRows[0]?.monthlyDelivery ?? null,
    accumulatedDelivery: administrationRows[administrationRows.length - 1]?.accumulatedDelivery ?? null,
    totalAnnualPremium,
    totalWithRecommended,
    evidence: {
      productName: hasSegubeca ? "SOURCE_TEXT" : "MISSING",
      currency: hasCurrency ? "SOURCE_TEXT" : "MISSING",
      participants: participantResult.rawRows.length ? "SOURCE_TEXT" : "MISSING",
      baseCoverage: baseCoverage ? "SOURCE_TEXT" : "MISSING",
      coverages: coverages.length ? "SOURCE_TEXT" : "MISSING",
      recommendedCoverages: recommendedCoverages.length ? "SOURCE_TEXT" : "MISSING",
      guaranteedRows: guaranteedRows.length ? "SOURCE_TEXT" : "MISSING",
      administrationRows: administrationRows.length ? "SOURCE_TEXT" : "MISSING",
      interestRate: interestRate !== null ? "SOURCE_TEXT" : "MISSING",
      totalAnnualPremium: totalAnnualPremium !== null ? "SOURCE_TEXT" : "MISSING",
      totalWithRecommended: totalWithRecommended !== null ? "SOURCE_TEXT" : "MISSING"
    }
  };

  parsed.missing_information = buildMissingInformation(parsed);
  return parsed;
}

export {
  SEGUBECA_PARSER_VERSION,
  parseSolucionlineSegubecaQuote
};
