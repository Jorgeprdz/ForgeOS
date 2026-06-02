const fs = require("fs");
const { execSync } = require("child_process");

const pdfPath = process.argv[2];

if (!pdfPath) {
  console.log("Uso:");
  console.log("node forge-semantic-risk-report.js archivo.pdf");
  process.exit(1);
}

if (!fs.existsSync(pdfPath)) {
  throw new Error(`No existe el PDF: ${pdfPath}`);
}

const txtPath = "vida-mujer-quote-ocr.txt";

execSync(`pdftotext -layout "${pdfPath}" "${txtPath}"`);

const text = fs.readFileSync(txtPath, "utf8");

function number(value) {
  return Number(String(value).replace(/,/g, ""));
}

function getCoverageAmount(code) {
  const patterns = {
    VIDA_MUJER: /Vida Mujer\s+\(Vida Mujer\)\s+20 años\s+([\d,]+)\s+([\d,.]+)/i,
    PCF: /Protección por Cáncer Femenino\s+\(PCF A\)\s+20 años\s+([\d,]+)\s+([\d,.]+)/i,
    PEP: /PEP A\)\s+19 años\s+([\d,]+)\s+([\d,.]+)/i,
    CLP: /Cuidados a Largo Plazo\s+\(CLP\)\s+1 REN\s+([\d,]+)\s+([\d,.]+)/i
  };

  const match = text.match(patterns[code]);

  if (!match) return null;

  return {
    sumAssured: number(match[1]),
    annualPremium: number(match[2])
  };
}

function getSurvivalTotal() {
  const match = text.match(/supervivencia.*?total de\s+([\d,.]+)\s+Unidades/i);
  return match ? number(match[1]) : null;
}

function detectAveStatus() {
  const hasAveLine =
    /Aumento de Valor en Efectivo|Valor de Rescate AVE|AVE/i.test(text);

  const hasAveRescueValue =
    text
      .split("\n")
      .some((line) => {
        const clean = line.trim();

        const match = clean.match(
          /^([\d.]+)\s*%\s+(\d{2})\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)$/
        );

        if (!match) return false;

        const aveRescueValue = number(match[5]);

        return aveRescueValue > 0;
      });

  if (hasAveLine && hasAveRescueValue) {
    return "AVE_VALUE_PRESENT";
  }

  if (hasAveLine && !hasAveRescueValue) {
    return "AVE_COLUMN_PRESENT_ZERO_VALUE";
  }

  return "AVE_NOT_PRESENT";
}

const basic = getCoverageAmount("VIDA_MUJER");
const pcf = getCoverageAmount("PCF");
const pep = getCoverageAmount("PEP");
const clp = getCoverageAmount("CLP");
const survivalTotal = getSurvivalTotal();
const aveStatus = detectAveStatus();

const risks = [];

if (pcf && basic && pcf.sumAssured > basic.sumAssured) {
  risks.push({
    severity: "FAIL",
    code: "PCF_EXCEEDS_BASIC_SUM_ASSURED",
    message: "PCF supera la suma asegurada básica.",
    detail: `PCF ${pcf.sumAssured} vs Básica ${basic.sumAssured}`
  });
}

if (pep && basic && pep.sumAssured > basic.sumAssured) {
  risks.push({
    severity: "FAIL",
    code: "PEP_EXCEEDS_BASIC_SUM_ASSURED",
    message: "PEP supera la suma asegurada básica.",
    detail: `PEP ${pep.sumAssured} vs Básica ${basic.sumAssured}`
  });
}

if (pep && pcf && pep.sumAssured > pcf.sumAssured) {
  risks.push({
    severity: "FAIL",
    code: "PEP_EXCEEDS_PCF",
    message: "PEP supera la suma asegurada de PCF.",
    detail: `PEP ${pep.sumAssured} vs PCF ${pcf.sumAssured}`
  });
}

if (clp && basic && clp.sumAssured > basic.sumAssured * 0.5) {
  risks.push({
    severity: "REVIEW",
    code: "CLP_EXCEEDS_50_PERCENT_BASIC_IN_QUOTE",
    message: "CLP recomendado supera el 50% de la suma asegurada básica según la regla del manual.",
    detail: `CLP ${clp.sumAssured} vs 50% Básica ${basic.sumAssured * 0.5}`
  });
}

if (survivalTotal && basic && survivalTotal !== basic.sumAssured * 1.15) {
  risks.push({
    severity: "FAIL",
    code: "SURVIVAL_TOTAL_DOES_NOT_MATCH_115_PERCENT",
    message: "El total de supervivencia no equivale al 115% de la suma asegurada básica.",
    detail: `Supervivencia ${survivalTotal} vs Esperado ${basic.sumAssured * 1.15}`
  });
}

if (aveStatus === "AVE_COLUMN_PRESENT_ZERO_VALUE") {
  risks.push({
    severity: "INFO",
    code: "AVE_COLUMN_PRESENT_ZERO_VALUE",
    message: "La tabla muestra columna AVE, pero el valor de rescate AVE es cero.",
    detail: "Probablemente AVE no está contratado, aunque la tabla incluya la columna."
  });
}

console.log("\nFORGE SEMANTIC RISK REPORT v0.1\n");

console.log("Producto: VIDA_MUJER");
console.log(`Básica: ${basic?.sumAssured ?? "N/A"}`);
console.log(`PCF: ${pcf?.sumAssured ?? "N/A"}`);
console.log(`PEP: ${pep?.sumAssured ?? "N/A"}`);
console.log(`CLP: ${clp?.sumAssured ?? "N/A"}`);
console.log(`Supervivencia: ${survivalTotal ?? "N/A"}`);
console.log(`AVE Status: ${aveStatus}`);

console.log("\nRiesgos detectados\n");

if (risks.length === 0) {
  console.log("✅ No se detectaron riesgos semánticos.");
} else {
  risks.forEach((risk) => {
    const icon =
      risk.severity === "FAIL"
        ? "❌"
        : risk.severity === "REVIEW"
        ? "⚠️"
        : "ℹ️";

    console.log(`${icon} [${risk.severity}] ${risk.code}`);
    console.log(`${risk.message}`);
    console.log(`${risk.detail}\n`);
  });
}

const fail = risks.filter((r) => r.severity === "FAIL").length;
const review = risks.filter((r) => r.severity === "REVIEW").length;
const info = risks.filter((r) => r.severity === "INFO").length;

console.log("Resumen:");
console.log(`FAIL: ${fail}`);
console.log(`REVIEW: ${review}`);
console.log(`INFO: ${info}`);
