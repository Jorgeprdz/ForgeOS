const { extractOrviQuote } = require("./orvi-ocr-extractor");
const { buildGuaranteedValueTimeline, getMilestone } = require("./orvi-guaranteed-value-timeline-engine");
const { buildWaitingScenarios } = require("./orvi-wait-vs-cancel-engine");
const { getCachedRates } = require("./exchange-rate-cache-engine");
const { convertOrviTimelineToMXN, convertAmountTodayMXN } = require("./orvi-mxn-conversion-engine");
const { buildOrviClientPresentation } = require("./orvi-client-presentation-engine");
const { validatePricePlacement } = require("./shared-price-placement-engine");

const pdfPath =
  process.argv[2] || "/storage/emulated/0/Download/Solucionline_20260601_22_42.PDF";

function money(value) {
  return Number(value || 0).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0
  });
}

function decorate(row) {
  return {
    ...row,
    cashValueMXNText: money(row.cashValueMXN)
  };
}

async function main() {
  console.log("\nFORGE ORVI CLIENT PRESENTATION REPORT v1.0\n");

  const quote = extractOrviQuote(pdfPath);
  const timelineUDI = buildGuaranteedValueTimeline({
    rows: quote.guaranteedValues
  });

  const cache = await getCachedRates();
  const currentUdi = cache.rates.UDI_MXN.value;

  const timelineMXN = convertOrviTimelineToMXN({
    timeline: timelineUDI,
    currentRate: currentUdi,
    annualGrowthRate: 0.045
  });

  const year20 = decorate(getMilestone(timelineMXN, 20));
  const year25 = decorate(getMilestone(timelineMXN, 25));
  const year30 = decorate(getMilestone(timelineMXN, 30));
  const year71 = decorate(getMilestone(timelineMXN, 71));

  const rawWaitScenarios = buildWaitingScenarios({
    timeline: timelineMXN,
    baseYear: 20,
    waits: [5, 10, 30, 51]
  });

  const waitScenarios = rawWaitScenarios.map(s => ({
    currentYear: s.currentYear,
    futureYear: s.futureYear,
    currentAge: s.currentAge,
    futureAge: s.futureAge,
    currentCashValueMXN: money(s.currentCashValueUDI),
    futureCashValueMXN: money(s.futureCashValueUDI),
    extraValueMXN: money(s.extraValueUDI),
    growthPercent: s.growthPercent
  }));

  const sumAssuredTodayMXN = money(convertAmountTodayMXN({
    amountUDI: quote.sumAssuredUDI,
    currentRate: currentUdi
  }));

  const presentation = buildOrviClientPresentation({
    quote,
    year20,
    year25,
    year30,
    year71,
    waitScenarios,
    sumAssuredTodayMXN
  });

  const price = validatePricePlacement(presentation.slides);

  console.log("Producto\n");
  console.log(`Cliente: ${quote.clientName}`);
  console.log(`Producto: ${quote.detectedProductName}`);
  console.log(`Moneda: ${quote.currency}`);
  console.log(`UDI actual Banxico: ${money(currentUdi)}`);
  console.log(`Escenario usado: UDI +4.5% anual`);

  console.log("\nPresentación Cliente\n");

  presentation.slides.forEach(slide => {
    console.log(`${slide.slide}. ${slide.title}`);
    console.log(`   ${slide.body}\n`);
  });

  console.log("Apéndice de decisión\n");
  waitScenarios.forEach(s => {
    console.log(
      `Año ${s.currentYear} → Año ${s.futureYear}: ${s.currentCashValueMXN} → ${s.futureCashValueMXN} | Diferencia: ${s.extraValueMXN}`
    );
  });

  console.log("\nNota Forge");
  console.log("Los valores futuros en MXN son estimaciones. La cotización está expresada en UDI y el monto real dependerá del valor de la UDI vigente.");

  const tests = [
    {
      name: "Construye presentación cliente",
      pass: presentation.slides.length === 8
    },
    {
      name: "No abre con precio",
      pass: !/precio|costo|prima|aportaci/i.test(presentation.slides[0].title + presentation.slides[0].body)
    },
    {
      name: "Explica tres puertas",
      pass: presentation.slides.some(s => /tres puertas/i.test(s.title))
    },
    {
      name: "Incluye cancelar vs esperar",
      pass: presentation.slides.some(s => /esperar/i.test(s.title + s.body))
    },
    {
      name: "Incluye MXN",
      pass: presentation.slides.some(s => /\$/.test(s.body))
    },
    {
      name: "Precio va al final",
      pass: price.valid
    },
    {
      name: "Construye apéndice",
      pass: presentation.appendix.waitScenarios.length >= 3
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
    console.log("\n✅ ORVI CLIENT PRESENTATION ENGINE v1.0 PASS");
  } else {
    console.log("\n❌ ORVI CLIENT PRESENTATION NEEDS REVIEW");
  }
}

main().catch(error => {
  console.error("\n❌ ORVI PRESENTATION ERROR");
  console.error(error.message);
  process.exit(1);
});
