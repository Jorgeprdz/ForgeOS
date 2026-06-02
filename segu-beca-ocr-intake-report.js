const fs = require("fs");
const { execSync } = require("child_process");

const pdfPath = process.argv[2];

if (!pdfPath) {
  console.log("Uso:");
  console.log("node segu-beca-ocr-intake-report.js archivo.pdf");
  process.exit(1);
}

if (!fs.existsSync(pdfPath)) {
  throw new Error(`No existe el PDF: ${pdfPath}`);
}

const txtPath = "segu-beca-quote-ocr.txt";

execSync(`pdftotext -layout "${pdfPath}" "${txtPath}"`);

const text = fs.readFileSync(txtPath, "utf8");

function number(value) {
  return Number(String(value).replace(/,/g, "").trim());
}

function money(value) {
  if (value === null || value === undefined) return "N/A";
  return value.toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function detectProduct(text) {
  if (/SEGUBECA\s*18/i.test(text)) return "SEGUBECA_18";
  if (/SEGUBECA/i.test(text)) return "SEGUBECA";
  return "UNKNOWN_PRODUCT";
}

function detectCurrency(text) {
  if (/\bUDI\b/i.test(text)) return "UDI";
  if (/Dólares|USD|Dlls/i.test(text)) return "USD";
  return "UNKNOWN_CURRENCY";
}

function detectInsuredChild(text) {
  const match = text.match(/Titular\s+(.+?)\s+No\s+(\d{2}\/\d{2}\/\d{4})\s+(\d+)\s+(\d+)\s+Masculino/i);
  if (!match) return null;

  return {
    name: match[1].trim(),
    birthDate: match[2],
    age: number(match[3]),
    calculationAge: number(match[4]),
    sex: "Masculino"
  };
}

function detectContractor(text) {
  const match = text.match(/Contratante\s+(.+?)\s+No\s+(\d{2}\/\d{2}\/\d{4})\s+(\d+)\s+(\d+)\s+Masculino/i);
  if (!match) return null;

  return {
    name: match[1].trim(),
    birthDate: match[2],
    age: number(match[3]),
    calculationAge: number(match[4]),
    sex: "Masculino"
  };
}

function detectCoverageAmount(labelRegex) {
  const match = text.match(labelRegex);
  if (!match) return null;

  return {
    term: match[1],
    sumAssured: match[2] === "Amparado" ? "AMPARADO" : number(match[2]),
    annualPremium: match[3] === "SIN COSTO" ? 0 : number(match[3])
  };
}

function detectCoverages(text) {
  return {
    basic: detectCoverageAmount(/SEGUBECA 18\s+\(SEGUBECA 18\)\s+(.+?)\s+([\d,]+)\s+([\d,.]+)/i),
    pim: detectCoverageAmount(/Protección por Fallecimiento e Invalidez del Contratante\s+\(PIM 18 CT UI\)\s+(.+?)\s+(Amparado)\s+([\d,.]+)/i),
    cpa: detectCoverageAmount(/Cobertura de Protección Absoluta\s+\(CPA UI\)\s+(.+?)\s+([\d,]+)\s+([\d,.]+)/i),
    bam: detectCoverageAmount(/Beneficio de Asistencia Médica\s+\(BAM UI\)\s+(.+?)\s+(Amparado)\s+(SIN COSTO)/i),
    bait: detectCoverageAmount(/Beneficio de Pago de Suma Asegurada por Invalidez Total y Permanente\s+\(BAIT SB 18\)\s+(.+?)\s+([\d,]+)\s+([\d,.]+)/i),
    av: detectCoverageAmount(/Apoyo en Vida\s+\(AV UI\)\s+(.+?)\s+(Amparado)\s+(SIN COSTO)/i),
    bma: detectCoverageAmount(/Beneficio por Muerte Accidental\s+\(BMA\)\s+(.+?)\s+([\d,]+)\s+([\d,.]+)/i),
    des: /\(DESEMPLEO\)/i.test(text)
      ? {
          term: "1 REN",
          sumAssured: "AMPARADO",
          annualPremium: (() => {
            const match = text.match(/\(DESEMPLEO\)[\s\S]{0,80}?(Amparado)\s+([\d,.]+)/i);
            return match ? number(match[2]) : null;
          })()
        }
      : null,
    adapta: detectCoverageAmount(/ADAPTA\s+\(ADAPTA\)\s+(.+?)\s+([\d,]+)\s+([\d,.]+)/i),
    cgc: detectCoverageAmount(/Certificado de Garantía de Contratación\s+\(CGC\)\s+(.+?)\s+([\d,]+)\s+([\d,.]+)/i)
  };
}

function detectAnnualPremiums(text) {
  const total = text.match(/Prima Total Anual\s+([\d,.]+)/i);
  const recommended = text.match(/Prima total con beneficios recomendados\s+([\d,.]+)/i);

  return {
    totalAnnualPremium: total ? number(total[1]) : null,
    totalWithRecommended: recommended ? number(recommended[1]) : null
  };
}

function detectGuaranteedValues(text) {
  const rows = [];

  text.split("\n").forEach((line) => {
    const clean = line.trim();

    const match = clean.match(
      /^([\d.]+)\s*%\s+(\d+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)$/
    );

    if (!match) return;

    rows.push({
      recoveryPercentage: Number(match[1]),
      childAge: number(match[2]),
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

function detectSavingsAdministration(text) {
  const rows = [];

  text.split("\n").forEach((line) => {
    const clean = line.trim();

    const match = clean.match(
      /^(\d+)\s+(\d+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+|-)\s+([\d,]+)$/
    );

    if (!match) return;

    rows.push({
      policyYear: number(match[1]),
      childAge: number(match[2]),
      valueInCash: number(match[3]),
      monthlyDelivery: number(match[4]),
      accumulatedDelivery: number(match[5]),
      deathBenefit: match[6] === "-" ? 0 : number(match[6]),
      sumAssuredToAdminister: number(match[7])
    });
  });

  return rows;
}

const product = detectProduct(text);
const currency = detectCurrency(text);
const child = detectInsuredChild(text);
const contractor = detectContractor(text);
const coverages = detectCoverages(text);
const premiums = detectAnnualPremiums(text);
const guaranteedValues = detectGuaranteedValues(text);
const savingsAdministration = detectSavingsAdministration(text);

const expectedTerm = child ? 18 - child.age : null;
const detectedTerm = coverages.basic ? number(String(coverages.basic.term).replace(" años", "")) : null;

console.log("\nFORGE SEGU_BECA OCR INTAKE REPORT v0.1\n");

console.log("Core Detection\n");
console.log(`Producto: ${product}`);
console.log(`Moneda: ${currency}`);
console.log(`Menor: ${child ? child.name : "N/A"}`);
console.log(`Edad menor: ${child ? child.age : "N/A"}`);
console.log(`Contratante: ${contractor ? contractor.name : "N/A"}`);
console.log(`Edad contratante: ${contractor ? contractor.age : "N/A"}`);
console.log(`Plazo esperado: ${expectedTerm}`);
console.log(`Plazo detectado: ${detectedTerm}`);

console.log("\nCoberturas detectadas\n");

Object.entries(coverages).forEach(([code, data]) => {
  if (!data) return;

  console.log(`${code.toUpperCase()}:`);
  console.log(`  Plazo: ${data.term}`);
  console.log(`  Suma asegurada: ${data.sumAssured}`);
  console.log(`  Prima anual: ${money(data.annualPremium)}`);
});

console.log("\nPrimas\n");
console.log(`Prima total anual: ${money(premiums.totalAnnualPremium)} ${currency}`);
console.log(`Prima con recomendados: ${money(premiums.totalWithRecommended)} ${currency}`);

console.log("\nValores garantizados\n");
console.log(`Filas detectadas: ${guaranteedValues.length}`);

if (guaranteedValues.length > 0) {
  const first = guaranteedValues[0];
  const last = guaranteedValues[guaranteedValues.length - 1];

  console.log(`Primera edad menor: ${first.childAge}`);
  console.log(`Última edad menor: ${last.childAge}`);
  console.log(`AVE inicial: ${money(first.aveRescueValue)} ${currency}`);
  console.log(`AVE final: ${money(last.aveRescueValue)} ${currency}`);
  console.log(`Valor efectivo final: ${money(last.cashValue)} ${currency}`);
  console.log(`Recuperación total final: ${money(last.totalRecovery)} ${currency}`);
}

console.log("\nAdministración del ahorro\n");
console.log(`Filas detectadas: ${savingsAdministration.length}`);

if (savingsAdministration.length > 0) {
  const first = savingsAdministration[0];
  const last = savingsAdministration[savingsAdministration.length - 1];

  console.log(`Entrega mensual: ${money(first.monthlyDelivery)} ${currency}`);
  console.log(`Entrega acumulada final: ${money(last.accumulatedDelivery)} ${currency}`);
}

const tests = [
  {
    name: "Detecta producto SEGUBECA 18",
    pass: product === "SEGUBECA_18"
  },
  {
    name: "Detecta moneda UDI",
    pass: currency === "UDI"
  },
  {
    name: "Detecta edad menor 4",
    pass: child?.age === 4
  },
  {
    name: "Detecta edad contratante 49",
    pass: contractor?.age === 49
  },
  {
    name: "Valida plazo 18 - edad menor = 14",
    pass: expectedTerm === 14 && detectedTerm === 14
  },
  {
    name: "Detecta ahorro educativo 30,000 UDI",
    pass: coverages.basic?.sumAssured === 30000
  },
  {
    name: "Detecta PIM amparado",
    pass: coverages.pim?.sumAssured === "AMPARADO"
  },
  {
    name: "Detecta CPA 60,000 UDI",
    pass: coverages.cpa?.sumAssured === 60000
  },
  {
    name: "Detecta BAIT 60,000 UDI",
    pass: coverages.bait?.sumAssured === 60000
  },
  {
    name: "Detecta BMA 60,000 UDI",
    pass: coverages.bma?.sumAssured === 60000
  },
  {
    name: "Detecta DES amparado",
    pass: coverages.des?.sumAssured === "AMPARADO"
  },
  {
    name: "Detecta ADAPTA recomendada 100,000 UDI",
    pass: coverages.adapta?.sumAssured === 100000
  },
  {
    name: "Detecta CGC recomendado 2,500 UDI",
    pass: coverages.cgc?.sumAssured === 2500
  },
  {
    name: "Detecta valores garantizados",
    pass: guaranteedValues.length > 0
  },
  {
    name: "Detecta AVE real mayor a cero",
    pass: guaranteedValues.some(row => row.aveRescueValue > 0)
  },
  {
    name: "Detecta administración del ahorro",
    pass: savingsAdministration.length === 4
  },
  {
    name: "Detecta entrega mensual 637 UDI",
    pass: savingsAdministration[0]?.monthlyDelivery === 637
  }
];

console.log("\nResultados\n");

tests.forEach((test) => {
  console.log(`${test.pass ? "✅" : "❌"} ${test.name}`);
});

const pass = tests.filter(t => t.pass).length;
const fail = tests.length - pass;

console.log("\nResumen:");
console.log(`Total: ${tests.length}`);
console.log(`Pass: ${pass}`);
console.log(`Fail: ${fail}`);

if (fail === 0) {
  console.log("\n✅ SEGU_BECA OCR INTAKE v0.1 PASS");
} else {
  console.log("\n❌ SEGU_BECA OCR INTAKE NEEDS REVIEW");
}
