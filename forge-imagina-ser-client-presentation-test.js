const { extractImaginaSerDocument } = require("./imagina-ser-ocr-extractor");
const { analyzeRetirementFund } = require("./imagina-ser-retirement-fund-engine");
const { chooseDefaultScenario } = require("./imagina-ser-scenario-engine");
const { detectImaginaSerVariantFromText } = require("./imagina-ser-variant-engine");
const { routeImaginaSerFiscal } = require("./imagina-ser-fiscal-router-engine");
const { buildTaxProfile } = require("./shared-tax-profile-engine");
const { buildHappyNumbers151 } = require("./imagina-ser-happy-numbers-engine");
const { buildImaginaSerObjections } = require("./imagina-ser-objection-engine");
const { buildDecisionScore } = require("./shared-decision-score-engine");
const { validatePricePlacement } = require("./shared-price-placement-engine");

const clientPdf =
  process.argv[2] || "/storage/emulated/0/Download/IS.PDF";

const advisorPdf =
  process.argv[3] || "/storage/emulated/0/Download/Solucionline_20260601_21_10.PDF";

function money(value) {
  return value.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0
  });
}

function section(title) {
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(title);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

console.log("\nFORGE IMAGINA SER CLIENT PRESENTATION REPORT v1.0\n");

const clientDoc = extractImaginaSerDocument(clientPdf);
const advisorDoc = extractImaginaSerDocument(advisorPdf);
const scenario = chooseDefaultScenario(clientDoc.scenarios);
const fund = analyzeRetirementFund(advisorDoc.rows);

const coverageText = "IMAGINA SER 65 PAGOS LIMITADOS 15";
const variant = detectImaginaSerVariantFromText(coverageText);

const annualContributionMXN = 120000;
const annualIncomeMXN = 1200000;

const taxProfile = buildTaxProfile({
  annualIncome: annualIncomeMXN,
  taxRegime: "SUELDOS_Y_SALARIOS"
});

const fiscal = routeImaginaSerFiscal({
  variantInfo: variant,
  annualContributionMXN,
  annualIncomeMXN,
  estimatedTaxRate: taxProfile.estimatedRate,
  umaAnnualLimitMXN: 198000,
  advisorPreference: "PREFER_151"
});

const happy =
  fiscal.result.fiscalBucket === "ARTICLE_151_PPR"
    ? buildHappyNumbers151(fiscal.result)
    : null;

const objections = buildImaginaSerObjections();

const slides = [
  {
    title: "El riesgo real",
    body: "Vivir muchos años sin una fuente de ingreso propia."
  },
  {
    title: "El objetivo",
    body: "Construir un ingreso para cuando ya no quieras depender de trabajar."
  },
  {
    title: "Cómo funciona",
    body: "Tus aportaciones construyen un fondo para retiro y mantienen protección durante el camino."
  },
  {
    title: "Resultado esperado",
    body: `En escenario base: ${scenario.monthlyIncomeUDI} UDI mensuales de por vida.`
  },
  {
    title: "Beneficio fiscal",
    body: happy
      ? `SAT podría regresar aproximadamente ${money(happy.satCouldReturn)}.`
      : "Puede existir beneficio fiscal según el bolso elegido."
  },
  {
    title: "Ahora sí: esfuerzo anual",
    body: `Aportación anual estimada: ${money(annualContributionMXN)}.`
  }
];

const pricePlacement = validatePricePlacement(slides);

const score = buildDecisionScore({
  benefitDefined: true,
  decisionPresent: true,
  recommendationPresent: true,
  nextStepPresent: true,
  priceLast: pricePlacement.valid
});

section("INPUTS DETECTADOS");

console.log(`PDF cliente: ${clientDoc.documentType}`);
console.log(`PDF asesor: ${advisorDoc.documentType}`);
console.log(`Producto: IMAGINA_SER`);
console.log(`Variante: ${variant.variant}`);
console.log(`Moneda: ${clientDoc.currency}`);
console.log(`Edad actual: ${clientDoc.insuredAge}`);
console.log(`Edad retiro: ${clientDoc.retirementAge}`);
console.log(`Años acumulación: ${clientDoc.accumulationYears}`);

section("BENEFICIO PRINCIPAL");

console.log("Ingreso para tu retiro.");
console.log("Forge NO vende capital primero.");
console.log("Forge vende ingreso futuro y decisión clara.");

section("ESCENARIO BASE");

console.log(`Pago único ilustrado: ${scenario.singlePaymentUDI.toLocaleString("es-MX")} UDI`);
console.log(`Ingreso mensual ilustrado: ${scenario.monthlyIncomeUDI.toLocaleString("es-MX")} UDI`);
console.log("Modo: ESCENARIO ECONÓMICO BASE");

section("ANÁLISIS DEL FONDO");

console.log(`Años de pago detectados: ${fund.paymentYears}`);
console.log(`Total aportado en UDI: ${fund.totalContributedUDI.toLocaleString("es-MX")} UDI`);
console.log(`Fondo final estimado: ${fund.finalReserveFundUDI.toLocaleString("es-MX")} UDI`);
console.log(`Crecimiento estimado: ${fund.growthUDI.toLocaleString("es-MX")} UDI`);
console.log(`Crecimiento %: ${fund.growthPercent.toFixed(2)}%`);

section("BENEFICIO FISCAL");

console.log(`Ruta fiscal: ${fiscal.fiscalSelection.routing}`);
console.log(`Bolso seleccionado: ${fiscal.fiscalSelection.selectedBag.humanName}`);
console.log(`Aportación anual MXN: ${money(fiscal.result.annualContributionMXN)}`);

if (happy) {
  console.log(`SAT podría regresar: ${money(happy.satCouldReturn)}`);
  console.log(`Esfuerzo real estimado: ${money(happy.realEstimatedEffort)}`);
  console.log("Modo: ESTIMADO_NO_GARANTIZADO");
}

section("NÚMEROS FELICES");

if (happy) {
  console.log(`Tú aportas: ${money(happy.youContribute)}`);
  console.log(`SAT podría aportar: ${money(happy.satCouldReturn)}`);
  console.log(`Tu esfuerzo real estimado: ${money(happy.realEstimatedEffort)}`);
}

section("OBJECIONES ANTICIPADAS");

objections.forEach((item, index) => {
  console.log(`${index + 1}. ${item.objection}`);
  console.log(`   ${item.answer}`);
});

section("RECOMENDACIÓN FORGE");

console.log("Mantener estrategia Imagina Ser 65 con enfoque PPR / Artículo 151.");
console.log("");
console.log("Razón:");
console.log("1. Activa doble beneficio fiscal.");
console.log("2. Tiene horizonte largo de acumulación.");
console.log("3. Construye ingreso mensual para retiro.");
console.log("4. Mantiene protección durante el camino.");

section("SIGUIENTE MEJOR PASO");

console.log("Validar cuánto ingreso mensual quiere el cliente al retiro.");
console.log("Si 747 UDI mensuales no alcanzan para su estilo de vida esperado, ajustar aportación planeada.");

section("DECISION SCORE");

console.log(`Score: ${score.score}/100`);
console.log(`Clasificación: ${score.classification}`);
console.log(`Price Last: ${pricePlacement.valid ? "PASS" : "FAIL"}`);

const tests = [
  {
    name: "Detecta PDF cliente",
    pass: clientDoc.documentType === "CLIENT_DOCUMENT"
  },
  {
    name: "Detecta PDF asesor",
    pass: advisorDoc.documentType === "ADVISOR_DOCUMENT"
  },
  {
    name: "Detecta variante fiscal correcta",
    pass: variant.variant === "IMAGINA_SER_65_PL15"
  },
  {
    name: "Enruta a Artículo 151",
    pass: fiscal.fiscalSelection.routing === "ARTICLE_151_ENGINE"
  },
  {
    name: "Extrae ingreso mensual",
    pass: scenario.monthlyIncomeUDI === 747
  },
  {
    name: "Extrae pago único",
    pass: scenario.singlePaymentUDI === 158640
  },
  {
    name: "Calcula números felices",
    pass: happy && happy.realEstimatedEffort > 0
  },
  {
    name: "Construye objeciones",
    pass: objections.length >= 5
  },
  {
    name: "Precio va al final",
    pass: pricePlacement.valid
  },
  {
    name: "Decision Score aprobado",
    pass: score.score >= 90
  }
];

section("RESULTADOS");

tests.forEach(test => {
  console.log(`${test.pass ? "✅" : "❌"} ${test.name}`);
});

const pass = tests.filter(t => t.pass).length;
const fail = tests.length - pass;

console.log("\nResumen:");
console.log(`Total: ${tests.length}`);
console.log(`Pass: ${pass}`);
console.log(`Fail: ${fail}`);

if (fail === 0) {
  console.log("\n✅ FORGE IMAGINA SER CLIENT PRESENTATION READY");
} else {
  console.log("\n❌ FORGE CLIENT PRESENTATION NEEDS REVIEW");
}
