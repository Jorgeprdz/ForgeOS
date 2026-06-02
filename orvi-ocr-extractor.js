const fs = require("fs");
const { execSync } = require("child_process");

function number(value) {
  if (!value || value === "SIN COSTO") return 0;
  return Number(String(value).replace(/,/g, "").trim());
}

function pdfToText(pdfPath, outputPath = "orvi-source.txt") {
  execSync(`pdftotext -layout "${pdfPath}" "${outputPath}"`);
  return fs.readFileSync(outputPath, "utf8");
}

function extractOrviQuote(pdfPath) {
  const text = pdfToText(pdfPath);

  const productMatch = text.match(/ORVI\s+99-20\s+PAGOS\s+UDIS/i);
  const clientMatch = text.match(/Titular\s+(.+?)\s+No\s+\d{2}\/\d{2}\/\d{4}\s+(\d+)\s+(.+?)\s+No/i);
  const basicMatch = text.match(/ORVI\s+99-20\s+PAGOS\s+UDIS[\s\S]*?(\d+)\s+años\s+([\d,]+)\s+([\d,.]+)/i);
  const totalPremiumMatch = text.match(/Prima Total Anual\s+([\d,.]+)/i);

  const rows = [];

  text.split("\n").forEach(line => {
    const clean = line.trim();

    const match = clean.match(
      /^(\d+)\s+(\d+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)$/
    );

    if (!match) return;

    rows.push({
      policyYear: number(match[1]),
      realAge: number(match[2]),
      annualPremiumUDI: number(match[3]),
      avePremiumUDI: number(match[4]),
      cashValueUDI: number(match[5])
    });
  });

  return {
    product: "ORVI",
    detectedProductName: productMatch ? productMatch[0].toUpperCase() : "UNKNOWN",
    variant: "ORVI_99_20_PAY_UDI",
    currency: "UDI",
    clientName: clientMatch ? clientMatch[1].trim() : "UNKNOWN",
    clientAge: clientMatch ? number(clientMatch[2]) : null,
    gender: clientMatch ? clientMatch[3].trim() : "UNKNOWN",
    sumAssuredUDI: basicMatch ? number(basicMatch[2]) : 0,
    basicAnnualPremiumUDI: basicMatch ? number(basicMatch[3]) : 0,
    totalAnnualPremiumUDI: totalPremiumMatch ? number(totalPremiumMatch[1]) : 0,
    paymentYears: 20,
    maturityAge: 99,
    guaranteedValues: rows
  };
}

module.exports = {
  extractOrviQuote
};
