const { extractOrviQuote } = require("./orvi-ocr-extractor");
const { buildGuaranteedValueTimeline, getMilestone } = require("./orvi-guaranteed-value-timeline-engine");
const { buildWaitingScenarios } = require("./orvi-wait-vs-cancel-engine");
const { buildOrviEvents } = require("./orvi-event-engine");
const { buildOrviDecision } = require("./orvi-decision-engine");
const { buildOrviObjections } = require("./orvi-objection-engine");

const pdfPath =
  process.argv[2] || "/storage/emulated/0/Download/Solucionline_20260601_22_42.PDF";

function format(value) {
  return Number(value || 0).toLocaleString("es-MX", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

console.log("\nFORGE ORVI CORE MASTER TEST v0.1\n");

const quote = extractOrviQuote(pdfPath);
const timeline = buildGuaranteedValueTimeline({
  rows: quote.guaranteedValues
});

const year20 = getMilestone(timeline, 20);
const year25 = getMilestone(timeline, 25);
const year30 = getMilestone(timeline, 30);
const year50 = getMilestone(timeline, 50);
const year71 = getMilestone(timeline, 71);

const waitScenarios = buildWaitingScenarios({
  timeline,
  baseYear: 20,
  waits: [5, 10, 30, 51]
});

const events = buildOrviEvents({
  sumAssuredUDI: quote.sumAssuredUDI,
  currentCashValueUDI: year20?.cashValueUDI || 0,
  maturityCashValueUDI: year71?.cashValueUDI || 0
});

const decision = buildOrviDecision({
  baseYear: 20,
  scenarios: waitScenarios
});

const objections = buildOrviObjections();

console.log("Core\n");
console.log(`Producto: ${quote.detectedProductName}`);
console.log(`Variante: ${quote.variant}`);
console.log(`Cliente: ${quote.clientName}`);
console.log(`Edad: ${quote.clientAge}`);
console.log(`Moneda: ${quote.currency}`);
console.log(`Suma asegurada: ${format(quote.sumAssuredUDI)} UDI`);
console.log(`Prima total anual: ${format(quote.totalAnnualPremiumUDI)} UDI`);
console.log(`Años de pago: ${quote.paymentYears}`);
console.log(`Filas valores garantizados: ${timeline.length}`);

console.log("\nTimeline comercial\n");
console.log(`Año 20 / Edad ${year20.age}: ${format(year20.cashValueUDI)} UDI`);
console.log(`Año 25 / Edad ${year25.age}: ${format(year25.cashValueUDI)} UDI`);
console.log(`Año 30 / Edad ${year30.age}: ${format(year30.cashValueUDI)} UDI`);
console.log(`Año 50 / Edad ${year50.age}: ${format(year50.cashValueUDI)} UDI`);
console.log(`Año 71 / Edad ${year71.age}: ${format(year71.cashValueUDI)} UDI`);

console.log("\nCancelar vs esperar\n");
waitScenarios.forEach(s => {
  if (!s.available) return;
  console.log(
    `Año ${s.currentYear} → Año ${s.futureYear}: +${format(s.extraValueUDI)} UDI (${s.growthPercent.toFixed(2)}%)`
  );
});

console.log("\nTres puertas ORVI\n");
events.forEach(e => {
  console.log(`${e.clientLanguage}: ${e.result} ${format(e.amountUDI)} UDI`);
});

console.log("\nDecision Engine\n");
console.log(`Qué significa: ${decision.whatItMeans}`);
console.log(`Recomendación: ${decision.recommendation}`);
console.log(`Siguiente paso: ${decision.nextBestStep}`);

console.log("\nObjeciones\n");
objections.forEach((o, i) => {
  console.log(`${i + 1}. ${o.objection}`);
  console.log(`   ${o.answer}`);
});

const tests = [
  {
    name: "Detecta producto ORVI",
    pass: quote.product === "ORVI"
  },
  {
    name: "Detecta variante ORVI 99-20 UDI",
    pass: quote.variant === "ORVI_99_20_PAY_UDI"
  },
  {
    name: "Detecta suma asegurada",
    pass: quote.sumAssuredUDI === 90000
  },
  {
    name: "Detecta prima total anual",
    pass: quote.totalAnnualPremiumUDI > 0
  },
  {
    name: "Detecta tabla de valores garantizados",
    pass: timeline.length >= 70
  },
  {
    name: "Detecta valor año 20",
    pass: year20.cashValueUDI === 31915
  },
  {
    name: "Detecta valor año 30",
    pass: year30.cashValueUDI === 41047
  },
  {
    name: "Detecta valor final 99/100",
    pass: year71.cashValueUDI === 90000
  },
  {
    name: "Calcula esperar 5 años",
    pass: waitScenarios[0].extraValueUDI > 0
  },
  {
    name: "Construye tres eventos",
    pass: events.length === 3
  },
  {
    name: "Construye decision engine",
    pass: decision.nextBestStep.includes("esperar")
  },
  {
    name: "Construye objeciones",
    pass: objections.length >= 5
  }
];

console.log("\nResultados\n");

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
  console.log("\n✅ ORVI CORE v0.1 PASS");
} else {
  console.log("\n❌ ORVI CORE NEEDS REVIEW");
}
