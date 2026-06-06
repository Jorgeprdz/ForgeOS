const fs = require("fs");
const { execSync } = require("child_process");
const { detectDocumentPurpose } = require("./shared-document-priority-engine");

function number(value) {
  if (!value || value === "--") return 0;
  return Number(String(value).replace(/,/g, "").trim());
}

function firstMatch(text, pattern, index = 1) {
  return (text.match(pattern) || [])[index] || null;
}

function pdfToText(pdfPath, outputPath) {
  execSync(`pdftotext -layout "${pdfPath}" "${outputPath}"`);
  return fs.readFileSync(outputPath, "utf8");
}

function extractClientScenario(text) {
  const productMatch = text.match(/IMAGINA SER\s+(\d+)\s+PAGOS/i);
  const limitedPayMatch = text.match(/LIMITADOS\s+(\d+)/i);
  const coverageMatch = text.match(/IMAGINA SER\s+\d+\s+PAGOS\s+(\d+)\s+años\s+([\d,]+)\s+([\d,.]+)/i);
  const basicPremiumMatch = text.match(/Prima b[aá]sica\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)/i);
  const plannedPremiumMatch = text.match(/Prima planeada\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)/i);
  const totalPremiumMatch = text.match(/Prima total\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)/i);
  const totalAnnualPremium = number(firstMatch(text, /Prima Total Anual\s+([\d,]+)/i));
  const scenarioRow = text.match(
    /(?:^|\n)\s*(\d+)\s+(\d+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)/m
  );
  const suggestedBenefitMatch = text.match(/BMA\s+65\s+(\d+)\s+años\s+([\d,]+)\s+([\d,]+)/i);
  const suggestedTotal = number(firstMatch(text, /Total con beneficios sugeridos\s+([\d,]+)/i));
  const retirementAge = number(productMatch?.[1]) || number(scenarioRow?.[2]);
  const paymentYears = number(limitedPayMatch?.[1]);
  const coverageYears = number(coverageMatch?.[1]) || number(scenarioRow?.[1]);

  return {
    documentType: detectDocumentPurpose(text),
    product: "IMAGINA_SER",
    productName: productMatch
      ? `IMAGINA SER ${retirementAge} PAGOS LIMITADOS ${paymentYears || "UNKNOWN"}`
      : "IMAGINA_SER",
    clientName: firstMatch(text, /Asegurado:\s*(.+)/),
    birthdate: firstMatch(text, /Fecha de nacimiento:\s*([0-9/]+)/),
    gender: firstMatch(text, /G[eé]nero:\s*(\S+)/),
    smoker: firstMatch(text, /Fumador:\s*(\S+)/),
    currency: /\bUDI\b/i.test(text) ? "UDI" : "UNKNOWN",
    insuredAge: number((text.match(/Edad:\s*(\d+)/i) || [])[1]),
    retirementAge,
    accumulationYears: coverageYears,
    coverageYears,
    paymentYears,
    liquidationOption: /Pago [uú]nico/i.test(text) ? "SINGLE_PAYMENT" : "UNKNOWN",
    sumInsuredUDI: number(coverageMatch?.[2]),
    productAnnualPremiumUDI: number(coverageMatch?.[3]),
    annualBasicPremium: number(basicPremiumMatch?.[4]),
    annualPlannedPremium: number(plannedPremiumMatch?.[4]),
    annualTotalPremium: number(totalPremiumMatch?.[4]) || totalAnnualPremium,
    premiumSchedule: {
      basic: {
        monthlyUDI: number(basicPremiumMatch?.[1]),
        quarterlyUDI: number(basicPremiumMatch?.[2]),
        semiannualUDI: number(basicPremiumMatch?.[3]),
        annualUDI: number(basicPremiumMatch?.[4])
      },
      planned: {
        monthlyUDI: number(plannedPremiumMatch?.[1]),
        quarterlyUDI: number(plannedPremiumMatch?.[2]),
        semiannualUDI: number(plannedPremiumMatch?.[3]),
        annualUDI: number(plannedPremiumMatch?.[4])
      },
      total: {
        monthlyUDI: number(totalPremiumMatch?.[1]),
        quarterlyUDI: number(totalPremiumMatch?.[2]),
        semiannualUDI: number(totalPremiumMatch?.[3]),
        annualUDI: number(totalPremiumMatch?.[4]) || totalAnnualPremium
      }
    },
    suggestedBenefits: suggestedBenefitMatch ? [
      {
        coverage: "BMA 65",
        coverageYears: number(suggestedBenefitMatch[1]),
        sumInsuredUDI: number(suggestedBenefitMatch[2]),
        annualPremiumUDI: number(suggestedBenefitMatch[3])
      }
    ] : [],
    totalWithSuggestedBenefitsUDI: suggestedTotal,
    scenarios: scenarioRow ? {
      BASE: {
        year: number(scenarioRow[1]),
        age: number(scenarioRow[2]),
        singlePaymentUDI: number(scenarioRow[3]),
        monthlyIncomeUDI: number(scenarioRow[4])
      },
      FAVORABLE: {
        year: number(scenarioRow[1]),
        age: number(scenarioRow[2]),
        singlePaymentUDI: number(scenarioRow[5]),
        monthlyIncomeUDI: number(scenarioRow[6])
      },
      DESFAVORABLE: {
        year: number(scenarioRow[1]),
        age: number(scenarioRow[2]),
        singlePaymentUDI: number(scenarioRow[7]),
        monthlyIncomeUDI: number(scenarioRow[8])
      }
    } : {},
    interestRate: number(firstMatch(text, /tasa de\s+inter[eé]s utilizada.*?([\d.]+)\s*%/is)),
    solucionlineVersion: firstMatch(text, /Solucionline versi[oó]n\s+([\d.]+)/i),
    quoteDate: firstMatch(text, /Solucionline versi[oó]n\s+[\d.]+.*?d[ií]a\s+([0-9/]+)/is),
    evidence: {
      product: productMatch && limitedPayMatch ? "SOURCE_TEXT" : "MISSING",
      coverage: coverageMatch ? "SOURCE_TEXT" : "MISSING",
      premiums:
        basicPremiumMatch && plannedPremiumMatch && totalPremiumMatch
          ? "SOURCE_TEXT"
          : "MISSING",
      scenarios: scenarioRow ? "SOURCE_TEXT" : "MISSING"
    }
  };
}

function extractAdvisorBreakdown(text) {
  const rows = [];

  text.split("\n").forEach(line => {
    const clean = line.trim();

    const match = clean.match(
      /^(\d+)\s+(\d+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)$/
    );

    if (!match) return;

    rows.push({
      year: number(match[1]),
      age: number(match[2]),
      basicPremiumUDI: number(match[3]),
      plannedPremiumUDI: number(match[4]),
      insuranceCostUDI: number(match[5]),
      administrationFeeUDI: number(match[6]),
      deathBenefitUDI: number(match[7]),
      baitUDI: number(match[8]),
      bmaDiUDI: number(match[9]),
      interestEarnedUDI: number(match[10]),
      reserveFundUDI: number(match[11]),
      cashValueUDI: number(match[12])
    });
  });

  return {
    documentType: detectDocumentPurpose(text),
    product: "IMAGINA_SER",
    currency: /\bUDI\b/i.test(text) ? "UDI" : "UNKNOWN",
    rows
  };
}

function extractImaginaSerDocument(pdfPath) {
  const text = pdfToText(pdfPath, "imagina-ser-source.txt");
  const type = detectDocumentPurpose(text);

  if (type === "CLIENT_DOCUMENT") {
    return extractClientScenario(text);
  }

  if (type === "ADVISOR_DOCUMENT") {
    return extractAdvisorBreakdown(text);
  }

  return {
    documentType: "UNKNOWN_DOCUMENT",
    rawTextPreview: text.slice(0, 500)
  };
}

module.exports = {
  extractImaginaSerDocument,
  extractClientScenario,
  extractAdvisorBreakdown
};
