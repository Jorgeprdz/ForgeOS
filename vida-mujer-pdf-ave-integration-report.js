const fs = require("fs");
const { execSync } = require("child_process");

const {
  calculateAvePortfolio
} = require("./shared-ave-portfolio-engine");

const {
  calculateAveDeathBenefit
} = require("./shared-ave-death-benefit-engine");

const {
  evaluateAveEligibility
} = require("./shared-ave-eligibility-engine");

const pdfPath = process.argv[2];

if (!pdfPath) {
  console.log("Uso:");
  console.log("node vida-mujer-pdf-ave-integration-report.js archivo.pdf");
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

function format(value) {
  if (value === null || value === undefined) return "N/A";

  return value.toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function detectCurrency() {
  if (/\bUDI\b/i.test(text)) return "UDI";
  if (/USD|Dólares|Dlls/i.test(text)) return "USD";
  return "UNKNOWN";
}

function getCoverageAmount(code) {
  const patterns = {
    VIDA_MUJER:
      /Vida Mujer\s+\(Vida Mujer\)\s+20 años\s+([\d,]+)\s+([\d,.]+)/i,
    PCF:
      /Protección por Cáncer Femenino\s+\(PCF A\)\s+20 años\s+([\d,]+)\s+([\d,.]+)/i,
    PEP:
      /PEP A\)\s+19 años\s+([\d,]+)\s+([\d,.]+)/i,
    CLP:
      /Cuidados a Largo Plazo\s+\(CLP\)\s+1 REN\s+([\d,]+)\s+([\d,.]+)/i,
    ADAPTA:
      /ADAPTA\s+\(ADAPTA\)\s+5 REN\s+([\d,]+)\s+([\d,.]+)/i
  };

  const match = text.match(patterns[code]);

  if (!match) return null;

  return {
    sumAssured: number(match[1]),
    annualPremium: number(match[2])
  };
}

function getGuaranteedValues() {
  const rows = [];

  text.split("\n").forEach((line) => {
    const clean = line.trim();

    const match = clean.match(
      /^([\d.]+)\s*%\s+(\d{2})\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)$/
    );

    if (!match) return;

    rows.push({
      recoveryPercentage: Number(match[1]),
      age: Number(match[2]),
      annualPremium: number(match[3]),
      accumulatedPremiumWithAve: number(match[4]),
      aveRescueValue: number(match[5]),
      cashValue: number(match[6]),
      totalRecovery: number(match[7]),
      basicSumAssured: number(match[8])
    });
  });

  return rows;
}

function detectAveFromGuaranteedValues(rows) {
  const aveRows =
    rows.filter((row) => row.aveRescueValue > 0);

  if (aveRows.length === 0) {
    return {
      detected: false,
      status: "AVE_NOT_CONTRACTED_OR_ZERO_VALUE",
      positions: [],
      observedValues: []
    };
  }

  const observedValues =
    aveRows.map((row, index) => ({
      year: index + 1,
      rescueValue: row.aveRescueValue
    }));

  const firstPositive =
    aveRows[0];

  return {
    detected: true,
    status: "AVE_VALUE_PRESENT",
    positions: [
      {
        positionId: "PDF-AVE-001",
        aveType: "UNKNOWN",
        currency: detectCurrency(),
        annualPremium: firstPositive.aveRescueValue,
        purchaseYear: 1,
        observedValues
      }
    ],
    observedValues
  };
}

console.log("\nFORGE VIDA MUJER PDF + AVE INTEGRATION REPORT v0.1\n");

const currency = detectCurrency();

const basic =
  getCoverageAmount("VIDA_MUJER");

const guaranteedValues =
  getGuaranteedValues();

const finalGuaranteedRow =
  guaranteedValues[guaranteedValues.length - 1];

const aveDetection =
  detectAveFromGuaranteedValues(guaranteedValues);

console.log("Core\n");

console.log(`Producto: VIDA_MUJER`);
console.log(`Moneda: ${currency}`);
console.log(`Suma asegurada básica: ${format(basic?.sumAssured)} ${currency}`);
console.log(`Filas valores garantizados: ${guaranteedValues.length}`);
console.log(`AVE status: ${aveDetection.status}`);

console.log("\nAVE Detection\n");

if (!aveDetection.detected) {
  console.log("No se detectó valor de rescate AVE mayor a cero.");
  console.log("Forge interpreta esta cotización como AVE no contratada o sin valor acumulado visible.");
} else {
  console.log("Se detectaron valores AVE en la tabla.");
  console.log(`Valores observados: ${aveDetection.observedValues.length}`);
}

let portfolio = null;
let deathBenefit = null;
let eligibility = null;

if (aveDetection.detected) {
  portfolio =
    calculateAvePortfolio({
      evaluationYear: aveDetection.observedValues.length,
      positions: aveDetection.positions
    });

  deathBenefit =
    calculateAveDeathBenefit({
      baseDeathBenefit: basic.sumAssured,
      avePurchases: portfolio.positions
        .filter((position) => position.status === "ACTIVE")
        .map((position) => ({
          aveType: position.aveType,
          currency: position.currency,
          principal: position.principal,
          years: position.yearsInvested
        }))
    });

  eligibility =
    evaluateAveEligibility({
      product: "VIDA_MUJER",
      currency,
      policyYear: 1
    });

  console.log("\nAVE Portfolio\n");

  console.log(`AVEs activas: ${portfolio.activeAveCount}`);
  console.log(`AVEs bloqueadas: ${portfolio.blockedAveCount}`);
  console.log(`Principal total activo: ${format(portfolio.totalPrincipal)} ${currency}`);
  console.log(`Valor proyectado total: ${format(portfolio.totalProjectedValue)} ${currency}`);
  console.log(`Interés garantizado total: ${format(portfolio.totalGuaranteedInterest)} ${currency}`);
  console.log(`Valor rescate total: ${format(portfolio.totalRescueValue)} ${currency}`);

  console.log("\nAVE Death Benefit Impact\n");

  console.log(`Suma asegurada básica: ${format(deathBenefit.baseDeathBenefit)} ${currency}`);
  console.log(`Total AVE proyectado: ${format(deathBenefit.totalAveProjectedValue)} ${currency}`);
  console.log(`Beneficio fallecimiento total: ${format(deathBenefit.totalDeathBenefit)} ${currency}`);

  console.log("\nAVE Eligibility\n");

  console.log(`Elegible: ${eligibility.eligible}`);
  console.log(`Razones: ${eligibility.reasons.length ? eligibility.reasons.join(", ") : "N/A"}`);
}

console.log("\nValores Garantizados\n");

if (finalGuaranteedRow) {
  console.log(`Edad final: ${finalGuaranteedRow.age}`);
  console.log(`Valor en efectivo final: ${format(finalGuaranteedRow.cashValue)} ${currency}`);
  console.log(`Valor rescate AVE final: ${format(finalGuaranteedRow.aveRescueValue)} ${currency}`);
  console.log(`Recuperación total final: ${format(finalGuaranteedRow.totalRecovery)} ${currency}`);
}

const tests = [
  {
    name: "Detecta moneda UDI",
    pass: currency === "UDI"
  },
  {
    name: "Detecta suma asegurada básica 35,000",
    pass: basic?.sumAssured === 35000
  },
  {
    name: "Detecta valores garantizados",
    pass: guaranteedValues.length > 0
  },
  {
    name: "Detecta AVE en cero para esta cotización",
    pass: aveDetection.status === "AVE_NOT_CONTRACTED_OR_ZERO_VALUE"
  },
  {
    name: "No ejecuta portfolio si AVE no tiene valor visible",
    pass: portfolio === null
  },
  {
    name: "Valor rescate AVE final es cero",
    pass: finalGuaranteedRow?.aveRescueValue === 0
  }
];

console.log("\nResultados\n");

tests.forEach((test) => {
  console.log(`${test.pass ? "✅" : "❌"} ${test.name}`);
});

const pass =
  tests.filter((test) => test.pass).length;

const fail =
  tests.length - pass;

console.log("\nResumen:");
console.log(`Total: ${tests.length}`);
console.log(`Pass: ${pass}`);
console.log(`Fail: ${fail}`);

if (fail === 0) {
  console.log("\n✅ VIDA MUJER + AVE PDF INTEGRATION v0.1 PASS");
} else {
  console.log("\n❌ VIDA MUJER + AVE PDF INTEGRATION NEEDS REVIEW");
}
