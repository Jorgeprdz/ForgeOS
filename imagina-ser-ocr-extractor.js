const fs = require("fs");
const { execSync } = require("child_process");
const { detectDocumentPurpose } = require("./shared-document-priority-engine");

function number(value) {
  if (!value || value === "--") return 0;
  return Number(String(value).replace(/,/g, "").trim());
}

function pdfToText(pdfPath, outputPath) {
  execSync(`pdftotext -layout "${pdfPath}" "${outputPath}"`);
  return fs.readFileSync(outputPath, "utf8");
}

function extractClientScenario(text) {
  const base = text.match(/27\s+65\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)/);

  return {
    documentType: detectDocumentPurpose(text),
    product: "IMAGINA_SER",
    currency: /\bUDI\b/i.test(text) ? "UDI" : "UNKNOWN",
    insuredAge: number((text.match(/Edad:\s*(\d+)/i) || [])[1]),
    retirementAge: 65,
    accumulationYears: 27,
    liquidationOption: /Pago [uú]nico/i.test(text) ? "SINGLE_PAYMENT" : "UNKNOWN",
    annualBasicPremium: number((text.match(/Prima básica[\s\S]{0,120}?Anual[\s\S]{0,80}?([\d,]+)\s*$/im) || [])[1]),
    scenarios: base ? {
      BASE: {
        singlePaymentUDI: number(base[1]),
        monthlyIncomeUDI: number(base[2])
      },
      FAVORABLE: {
        singlePaymentUDI: number(base[3]),
        monthlyIncomeUDI: number(base[4])
      },
      DESFAVORABLE: {
        singlePaymentUDI: number(base[5]),
        monthlyIncomeUDI: number(base[6])
      }
    } : {}
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
