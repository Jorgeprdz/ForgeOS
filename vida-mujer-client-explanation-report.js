const fs = require("fs");
const { execSync } = require("child_process");

const pdfPath = process.argv[2];

if (!pdfPath) {
  console.log("Uso:");
  console.log("node vida-mujer-client-explanation-report.js archivo.pdf");
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

function money(value) {
  if (value === null || value === undefined) return "N/A";
  return value.toLocaleString("es-MX", {
    maximumFractionDigits: 2
  });
}

function detectCurrency() {
  if (/\bUDI\b/i.test(text)) return "UDI";
  if (/USD|Dólares|Dlls/i.test(text)) return "USD";
  return "UNKNOWN";
}

function detectAge() {
  const match = text.match(/Titular\s+.*?\s+(\d{2})\s+Femenino/i);
  return match ? Number(match[1]) : null;
}

function getCoverageAmount(code) {
  const patterns = {
    VIDA_MUJER: /Vida Mujer\s+\(Vida Mujer\)\s+20 años\s+([\d,]+)\s+([\d,.]+)/i,
    BAIT: /BAIT 60 P\)\s+20 años\s+([\d,]+)\s+([\d,.]+)/i,
    BMA: /Beneficio por Muerte Accidental\s+\(BMA\)\s+20 años\s+([\d,]+)\s+([\d,.]+)/i,
    PCF: /Protección por Cáncer Femenino\s+\(PCF A\)\s+20 años\s+([\d,]+)\s+([\d,.]+)/i,
    PEP: /PEP A\)\s+19 años\s+([\d,]+)\s+([\d,.]+)/i,
    CLP: /Cuidados a Largo Plazo\s+\(CLP\)\s+1 REN\s+([\d,]+)\s+([\d,.]+)/i,
    ADAPTA: /ADAPTA\s+\(ADAPTA\)\s+5 REN\s+([\d,]+)\s+([\d,.]+)/i
  };

  const match = text.match(patterns[code]);
  if (!match) return null;

  return {
    sumAssured: number(match[1]),
    annualPremium: number(match[2])
  };
}

function getAnnualPremium() {
  const match = text.match(/Prima Total Anual\s+([\d,.]+)/i);
  return match ? number(match[1]) : null;
}

function getRecommendedPremium() {
  const match = text.match(/Prima total con beneficios recomendados\s+([\d,.]+)/i);
  return match ? number(match[1]) : null;
}

function getSurvivalTotal() {
  const match = text.match(/supervivencia.*?total de\s+([\d,.]+)\s+Unidades/i);
  return match ? number(match[1]) : null;
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

function detectAveStatus(rows) {
  const hasAveValue = rows.some((row) => row.aveRescueValue > 0);

  return hasAveValue
    ? "AVE_CON_VALOR"
    : "AVE_NO_CONTRATADO_O_VALOR_CERO";
}

const currency = detectCurrency();
const age = detectAge();

const basic = getCoverageAmount("VIDA_MUJER");
const bait = getCoverageAmount("BAIT");
const bma = getCoverageAmount("BMA");
const pcf = getCoverageAmount("PCF");
const pep = getCoverageAmount("PEP");
const clp = getCoverageAmount("CLP");
const adapta = getCoverageAmount("ADAPTA");

const annualPremium = getAnnualPremium();
const recommendedPremium = getRecommendedPremium();
const survivalTotal = getSurvivalTotal();

const guaranteedValues = getGuaranteedValues();
const lastGuaranteedValue = guaranteedValues[guaranteedValues.length - 1];

const aveStatus = detectAveStatus(guaranteedValues);

console.log("\nFORGE VIDA MUJER CLIENT EXPLANATION REPORT v0.1\n");

console.log("Resumen para cliente\n");

console.log(`Este estudio corresponde a Vida Mujer en ${currency}.`);
console.log(`La asegurada tiene ${age} años.`);
console.log(`La suma asegurada básica es de ${money(basic?.sumAssured)} ${currency}.`);
console.log(`La prima total anual de las coberturas contratadas es de ${money(annualPremium)} ${currency}.`);

if (recommendedPremium) {
  console.log(`Con los beneficios recomendados, la prima anual sería de ${money(recommendedPremium)} ${currency}.`);
}

console.log("\n¿Qué incluye contratado?\n");

console.log(`✅ Protección principal Vida Mujer: ${money(basic?.sumAssured)} ${currency}.`);

if (pcf) {
  console.log(`✅ Protección por cáncer femenino: ${money(pcf.sumAssured)} ${currency}.`);
}

if (bait) {
  console.log(`✅ Pago de suma asegurada por invalidez total y permanente: ${money(bait.sumAssured)} ${currency}.`);
}

if (bma) {
  console.log(`✅ Beneficio por muerte accidental: ${money(bma.sumAssured)} ${currency}.`);
}

console.log("✅ BAM, AV y BIT aparecen amparados o contratados según la cotización.");

console.log("\n¿Qué aparece como recomendado, no contratado?\n");

if (adapta) {
  console.log(`🟡 ADAPTA recomendado: ${money(adapta.sumAssured)} ${currency}.`);
}

if (pep) {
  console.log(`🟡 PEP recomendado: ${money(pep.sumAssured)} ${currency}.`);
}

if (clp) {
  console.log(`🟡 CLP recomendado: ${money(clp.sumAssured)} ${currency}.`);
}

console.log("\nSupervivencia\n");

console.log(
  `Si la asegurada llega al año 20, la cotización indica un total de supervivencia de ${money(survivalTotal)} ${currency}.`
);

console.log(
  "Esto no es lo mismo que el valor en efectivo. La supervivencia corresponde a los pagos programados del producto."
);

console.log("\nValores garantizados\n");

if (lastGuaranteedValue) {
  console.log(
    `Al final del periodo mostrado, edad ${lastGuaranteedValue.age}, el valor en efectivo indicado es de ${money(lastGuaranteedValue.cashValue)} ${currency}.`
  );

  console.log(
    `La recuperación total indicada también es de ${money(lastGuaranteedValue.totalRecovery)} ${currency}.`
  );
}

console.log("\nAVE\n");

if (aveStatus === "AVE_NO_CONTRATADO_O_VALOR_CERO") {
  console.log(
    "La tabla muestra columna de AVE, pero el valor de rescate AVE aparece en cero. Forge lo interpreta como AVE no contratado o sin valor en esta cotización."
  );
} else {
  console.log(
    "La cotización muestra valor de rescate AVE mayor a cero."
  );
}

console.log("\nNotas semánticas\n");

if (clp && basic && clp.sumAssured > basic.sumAssured * 0.5) {
  console.log(
    "⚠️ CLP aparece recomendado con una suma asegurada mayor al 50% de la suma asegurada básica. Forge lo marca para revisión porque puede depender de reglas adicionales no visibles en la cotización."
  );
}

console.log(
  "Esta explicación se basa únicamente en los datos detectados del PDF y no sustituye las condiciones generales del producto."
);
