const { extractOrviQuote } = require("./orvi-ocr-extractor");
const { buildGuaranteedValueTimeline, getMilestone } = require("./orvi-guaranteed-value-timeline-engine");
const { buildWaitingScenarios } = require("./orvi-wait-vs-cancel-engine");
const { getCachedRates } = require("./exchange-rate-cache-engine");
const { convertOrviTimelineToMXN, convertAmountTodayMXN } = require("./orvi-mxn-conversion-engine");

const pdfPath =
  process.argv[2] || "/storage/emulated/0/Download/Solucionline_20260601_22_42.PDF";

function money(value) {
  return Number(value || 0).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0
  });
}

function udi(value) {
  return Number(value || 0).toLocaleString("es-MX", {
    maximumFractionDigits: 0
  });
}

async function main() {
  console.log("\nFORGE ORVI MXN MASTER TEST v0.2\n");

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

  const year20UDI = getMilestone(timelineUDI, 20);
  const year25UDI = getMilestone(timelineUDI, 25);
  const year30UDI = getMilestone(timelineUDI, 30);
  const year50UDI = getMilestone(timelineUDI, 50);
  const year71UDI = getMilestone(timelineUDI, 71);

  const year20MXN = getMilestone(timelineMXN, 20);
  const year25MXN = getMilestone(timelineMXN, 25);
  const year30MXN = getMilestone(timelineMXN, 30);
  const year50MXN = getMilestone(timelineMXN, 50);
  const year71MXN = getMilestone(timelineMXN, 71);

  const waitScenariosUDI = buildWaitingScenarios({
    timeline: timelineUDI,
    baseYear: 20,
    waits: [5, 10, 30, 51]
  });

  const waitScenariosMXN = waitScenariosUDI.map(s => {
    if (!s.available) return s;

    const currentMXN = timelineMXN.find(row => row.year === s.currentYear);
    const futureMXN = timelineMXN.find(row => row.year === s.futureYear);

    return {
      ...s,
      currentCashValueMXN: currentMXN.cashValueMXN,
      futureCashValueMXN: futureMXN.cashValueMXN,
      extraValueMXN: futureMXN.cashValueMXN - currentMXN.cashValueMXN
    };
  });

  const sumAssuredTodayMXN = convertAmountTodayMXN({
    amountUDI: quote.sumAssuredUDI,
    currentRate: currentUdi
  });

  console.log("Core\n");
  console.log(`Producto: ${quote.detectedProductName}`);
  console.log(`Moneda: ${quote.currency}`);
  console.log(`UDI Banxico actual: ${money(currentUdi)}`);
  console.log(`Escenario UDI: 4.5% anual`);
  console.log(`Suma asegurada: ${udi(quote.sumAssuredUDI)} UDI`);
  console.log(`Suma asegurada equivalente hoy: ${money(sumAssuredTodayMXN)}`);

  console.log("\nTimeline comercial en MXN\n");
  console.log(`Año 20 / Edad ${year20MXN.age}: ${udi(year20UDI.cashValueUDI)} UDI ≈ ${money(year20MXN.cashValueMXN)}`);
  console.log(`Año 25 / Edad ${year25MXN.age}: ${udi(year25UDI.cashValueUDI)} UDI ≈ ${money(year25MXN.cashValueMXN)}`);
  console.log(`Año 30 / Edad ${year30MXN.age}: ${udi(year30UDI.cashValueUDI)} UDI ≈ ${money(year30MXN.cashValueMXN)}`);
  console.log(`Año 50 / Edad ${year50MXN.age}: ${udi(year50UDI.cashValueUDI)} UDI ≈ ${money(year50MXN.cashValueMXN)}`);
  console.log(`Año 71 / Edad ${year71MXN.age}: ${udi(year71UDI.cashValueUDI)} UDI ≈ ${money(year71MXN.cashValueMXN)}`);

  console.log("\nCancelar vs esperar en MXN\n");
  waitScenariosMXN.forEach(s => {
    if (!s.available) return;

    console.log(
      `Año ${s.currentYear} → Año ${s.futureYear}: ` +
      `${money(s.currentCashValueMXN)} → ${money(s.futureCashValueMXN)} ` +
      `(+${money(s.extraValueMXN)})`
    );
  });

  console.log("\nLectura cliente\n");
  console.log(`Si terminas de pagar en el año 20, tu valor garantizado estimado sería de ${money(year20MXN.cashValueMXN)}.`);
  console.log(`Si decides no tocarlo y esperas 5 años más, podría rondar ${money(year25MXN.cashValueMXN)}.`);
  console.log(`Si esperas 10 años más, podría rondar ${money(year30MXN.cashValueMXN)}.`);
  console.log("Estos valores en pesos son estimados. La cotización está en UDI y el valor real dependerá de la UDI vigente.");

  const tests = [
    {
      name: "Obtiene UDI Banxico",
      pass: currentUdi > 0
    },
    {
      name: "Convierte suma asegurada a MXN hoy",
      pass: sumAssuredTodayMXN > 0
    },
    {
      name: "Convierte timeline a MXN",
      pass: timelineMXN.length >= 70
    },
    {
      name: "Convierte año 20 a MXN",
      pass: year20MXN.cashValueMXN > 0
    },
    {
      name: "Convierte año 30 a MXN",
      pass: year30MXN.cashValueMXN > year20MXN.cashValueMXN
    },
    {
      name: "Calcula esperar 5 años en MXN",
      pass: waitScenariosMXN[0].extraValueMXN > 0
    },
    {
      name: "Marca cálculo como no garantizado",
      pass: year20MXN.calculationMode.includes("NOT_GUARANTEED")
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
    console.log("\n✅ ORVI MXN CONVERSION v0.2 PASS");
  } else {
    console.log("\n❌ ORVI MXN CONVERSION NEEDS REVIEW");
  }
}

main().catch(error => {
  console.error("\n❌ ORVI MXN ERROR");
  console.error(error.message);
  process.exit(1);
});
