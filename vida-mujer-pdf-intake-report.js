const fs = require("fs");
const { execSync } = require("child_process");

const pdfPath = process.argv[2];

if (!pdfPath) {
  console.log("Uso:");
  console.log("node vida-mujer-pdf-intake-report.js archivo.pdf");
  process.exit(1);
}

if (!fs.existsSync(pdfPath)) {
  throw new Error(`No existe el PDF: ${pdfPath}`);
}

const txtPath = "vida-mujer-quote-ocr.txt";

execSync(`pdftotext -layout "${pdfPath}" "${txtPath}"`);

const text = fs.readFileSync(txtPath, "utf8");

function includesAny(value, terms) {
  return terms.some((term) =>
    value.toLowerCase().includes(term.toLowerCase())
  );
}

function detectProduct(text) {
  if (includesAny(text, ["Vida Mujer"])) return "VIDA_MUJER";
  return "UNKNOWN_PRODUCT";
}

function detectCurrency(text) {
  if (/\bUDI\b/i.test(text)) return "UDI";
  if (/Dólares|USD|Dlls/i.test(text)) return "USD";
  return "UNKNOWN_CURRENCY";
}

function detectAge(text) {
  const match = text.match(/Titular\s+.*?\s+(\d{2})\s+Femenino/i);
  return match ? Number(match[1]) : null;
}

function detectBasicSumAssured(text) {
  const match = text.match(/Vida Mujer\s+\(Vida Mujer\)\s+20 años\s+([\d,]+)\s+([\d,.]+)/i);
  return match ? Number(match[1].replace(/,/g, "")) : null;
}

function detectAnnualPremium(text) {
  const match = text.match(/Prima Total Anual\s+([\d,.]+)/i);
  return match ? Number(match[1].replace(/,/g, "")) : null;
}

function detectTotalPremiumWithRecommended(text) {
  const match = text.match(/Prima total con beneficios recomendados\s+([\d,.]+)/i);
  return match ? Number(match[1].replace(/,/g, "")) : null;
}

function detectCoverageStatus(text) {
  const contracted = [];
  const recommended = [];

  const contractedMap = [
    ["VIDA_MUJER", /Vida Mujer\s+\(Vida Mujer\)/i],
    ["BAM", /Beneficio de Asistencia Médica/i],
    ["BAIT", /Pago de Suma Asegurada por Invalidez/i],
    ["AV", /Apoyo en Vida/i],
    ["BIT", /Exención de pago de primas por Invalidez/i],
    ["BMA", /Beneficio por Muerte Accidental/i],
    ["PCF", /Protección por Cáncer Femenino/i]
  ];

  const recommendedMap = [
    ["ADAPTA", /ADAPTA/i],
    ["PEP", /Protección para Complicaciones del Embarazo/i],
    ["CLP", /Cuidados a Largo Plazo/i]
  ];

  contractedMap.forEach(([code, regex]) => {
    if (regex.test(text)) contracted.push(code);
  });

  recommendedMap.forEach(([code, regex]) => {
    if (regex.test(text)) recommended.push(code);
  });

  return { contracted, recommended };
}

function detectCoverageAmounts(text) {
  const coverages = {};

  const patterns = [
    ["VIDA_MUJER", /Vida Mujer\s+\(Vida Mujer\)\s+20 años\s+([\d,]+)\s+([\d,.]+)/i],
    ["BAIT", /BAIT 60 P\)\s+20 años\s+([\d,]+)\s+([\d,.]+)/i],
    ["BMA", /Beneficio por Muerte Accidental\s+\(BMA\)\s+20 años\s+([\d,]+)\s+([\d,.]+)/i],
    ["PCF", /Protección por Cáncer Femenino\s+\(PCF A\)\s+20 años\s+([\d,]+)\s+([\d,.]+)/i],
    ["ADAPTA", /ADAPTA\s+\(ADAPTA\)\s+5 REN\s+([\d,]+)\s+([\d,.]+)/i],
    ["PEP", /PEP A\)\s+19 años\s+([\d,]+)\s+([\d,.]+)/i],
    ["CLP", /Cuidados a Largo Plazo\s+\(CLP\)\s+1 REN\s+([\d,]+)\s+([\d,.]+)/i]
  ];

  patterns.forEach(([code, regex]) => {
    const match = text.match(regex);

    if (match) {
      coverages[code] = {
        sumAssured: Number(match[1].replace(/,/g, "")),
        annualPremium: Number(match[2].replace(/,/g, ""))
      };
    }
  });

  return coverages;
}

function detectSurvivalTotal(text) {
  const match = text.match(/supervivencia.*?total de\s+([\d,.]+)\s+Unidades/i);
  return match ? Number(match[1].replace(/,/g, "")) : null;
}

function detectGuaranteedValues(text) {
  const lines = text.split("\n");
  const rows = [];

  lines.forEach((line) => {
    const clean = line.trim();

    const match = clean.match(
      /^([\d.]+)\s*%\s+(\d{2})\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)$/
    );

    if (match) {
      rows.push({
        recoveryPercentage: Number(match[1]),
        age: Number(match[2]),
        annualPremium: Number(match[3].replace(/,/g, "")),
        accumulatedPremiumWithAve: Number(match[4].replace(/,/g, "")),
        aveRescueValue: Number(match[5].replace(/,/g, "")),
        cashValue: Number(match[6].replace(/,/g, "")),
        totalRecovery: Number(match[7].replace(/,/g, "")),
        basicSumAssured: Number(match[8].replace(/,/g, ""))
      });
    }
  });

  return rows;
}

const product = detectProduct(text);
const currency = detectCurrency(text);
const age = detectAge(text);
const basicSumAssured = detectBasicSumAssured(text);
const annualPremium = detectAnnualPremium(text);
const totalPremiumWithRecommended = detectTotalPremiumWithRecommended(text);
const coverageStatus = detectCoverageStatus(text);
const coverageAmounts = detectCoverageAmounts(text);
const survivalTotal = detectSurvivalTotal(text);
const guaranteedValues = detectGuaranteedValues(text);

console.log("\nFORGE VIDA MUJER PDF INTAKE REPORT v0.1\n");

console.log("Core Detection");
console.log(`Producto: ${product}`);
console.log(`Moneda: ${currency}`);
console.log(`Edad: ${age}`);
console.log(`Suma asegurada básica: ${basicSumAssured}`);
console.log(`Prima total anual: ${annualPremium}`);
console.log(`Prima con recomendados: ${totalPremiumWithRecommended}`);
console.log(`Supervivencia total: ${survivalTotal}`);

console.log("\nCoberturas contratadas");
coverageStatus.contracted.forEach((item) => console.log(`✅ ${item}`));

console.log("\nCoberturas recomendadas");
coverageStatus.recommended.forEach((item) => console.log(`🟡 ${item}`));

console.log("\nSumas aseguradas detectadas");
Object.entries(coverageAmounts).forEach(([code, data]) => {
  console.log(`${code}: SA ${data.sumAssured} / Prima ${data.annualPremium}`);
});

console.log("\nValores garantizados");
console.log(`Filas detectadas: ${guaranteedValues.length}`);

if (guaranteedValues.length > 0) {
  const first = guaranteedValues[0];
  const last = guaranteedValues[guaranteedValues.length - 1];

  console.log(`Primera edad: ${first.age}`);
  console.log(`Última edad: ${last.age}`);
  console.log(`Valor efectivo final: ${last.cashValue}`);
  console.log(`Recuperación final: ${last.totalRecovery}`);
}

console.log("\nAVE Detection");

const hasAveValue = guaranteedValues.some((row) => row.aveRescueValue > 0);

console.log(
  hasAveValue
    ? "AVE_CONTRACTED_OR_VALUE_PRESENT"
    : "AVE_NOT_CONTRACTED_OR_ZERO_VALUE"
);

const tests = [
  {
    name: "Detecta producto Vida Mujer",
    pass: product === "VIDA_MUJER"
  },
  {
    name: "Detecta moneda UDI",
    pass: currency === "UDI"
  },
  {
    name: "Detecta edad 31",
    pass: age === 31
  },
  {
    name: "Detecta suma asegurada básica 35,000",
    pass: basicSumAssured === 35000
  },
  {
    name: "Detecta PCF contratada",
    pass: coverageStatus.contracted.includes("PCF")
  },
  {
    name: "Detecta PEP recomendada",
    pass: coverageStatus.recommended.includes("PEP")
  },
  {
    name: "Detecta CLP recomendada",
    pass: coverageStatus.recommended.includes("CLP")
  },
  {
    name: "Detecta supervivencia total 40,250",
    pass: survivalTotal === 40250
  },
  {
    name: "Detecta valores garantizados",
    pass: guaranteedValues.length > 0
  },
  {
    name: "Detecta AVE en cero",
    pass: hasAveValue === false
  }
];

console.log("\nResultados\n");

tests.forEach((test) => {
  console.log(`${test.pass ? "✅" : "❌"} ${test.name}`);
});

const pass = tests.filter((test) => test.pass).length;
const fail = tests.length - pass;

console.log("\nResumen:");
console.log(`Total: ${tests.length}`);
console.log(`Pass: ${pass}`);
console.log(`Fail: ${fail}`);
