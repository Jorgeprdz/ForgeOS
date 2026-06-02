const fs = require("fs");
const { execSync } = require("child_process");

const pdfPath = process.argv[2];

if (!pdfPath) {
  console.log("Uso:");
  console.log("node vida-mujer-rule-consistency-report.js archivo.pdf");
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

const basic = getCoverageAmount("VIDA_MUJER");
const pcf = getCoverageAmount("PCF");
const pep = getCoverageAmount("PEP");
const clp = getCoverageAmount("CLP");
const survivalTotal = getSurvivalTotal();

const rules = [
  {
    name: "PCF no supera la suma asegurada básica",
    status: pcf && basic && pcf.sumAssured <= basic.sumAssured ? "PASS" : "FAIL",
    detail: `PCF ${pcf?.sumAssured ?? "N/A"} vs Básica ${basic?.sumAssured ?? "N/A"}`
  },
  {
    name: "PEP no supera la suma asegurada básica",
    status: pep && basic && pep.sumAssured <= basic.sumAssured ? "PASS" : "FAIL",
    detail: `PEP ${pep?.sumAssured ?? "N/A"} vs Básica ${basic?.sumAssured ?? "N/A"}`
  },
  {
    name: "PEP no supera PCF",
    status: pep && pcf && pep.sumAssured <= pcf.sumAssured ? "PASS" : "FAIL",
    detail: `PEP ${pep?.sumAssured ?? "N/A"} vs PCF ${pcf?.sumAssured ?? "N/A"}`
  },
  {
    name: "CLP no supera 50% de suma asegurada básica",
    status: clp && basic && clp.sumAssured <= basic.sumAssured * 0.5 ? "PASS" : "REVIEW",
    detail: `CLP ${clp?.sumAssured ?? "N/A"} vs 50% Básica ${basic ? basic.sumAssured * 0.5 : "N/A"}`
  },
  {
    name: "Supervivencia total equivale a 115% de suma asegurada básica",
    status: survivalTotal && basic && survivalTotal === basic.sumAssured * 1.15 ? "PASS" : "FAIL",
    detail: `Supervivencia ${survivalTotal ?? "N/A"} vs 115% Básica ${basic ? basic.sumAssured * 1.15 : "N/A"}`
  }
];

console.log("\nFORGE VIDA MUJER RULE CONSISTENCY REPORT v0.1\n");

console.log("Datos base\n");
console.log(`Básica: ${basic?.sumAssured ?? "N/A"}`);
console.log(`PCF: ${pcf?.sumAssured ?? "N/A"}`);
console.log(`PEP: ${pep?.sumAssured ?? "N/A"}`);
console.log(`CLP: ${clp?.sumAssured ?? "N/A"}`);
console.log(`Supervivencia total: ${survivalTotal ?? "N/A"}`);

console.log("\nReglas\n");

rules.forEach((rule) => {
  const icon =
    rule.status === "PASS"
      ? "✅"
      : rule.status === "REVIEW"
      ? "⚠️"
      : "❌";

  console.log(`${icon} ${rule.name}`);
  console.log(`   ${rule.detail}`);
});

const pass = rules.filter((r) => r.status === "PASS").length;
const review = rules.filter((r) => r.status === "REVIEW").length;
const fail = rules.filter((r) => r.status === "FAIL").length;

console.log("\nResumen:");
console.log(`Total: ${rules.length}`);
console.log(`Pass: ${pass}`);
console.log(`Review: ${review}`);
console.log(`Fail: ${fail}`);
