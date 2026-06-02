const { getCachedRates } = require("./exchange-rate-cache-engine");
const { estimateFuturePremiumMXN } = require("./shared-currency-projection-engine");

function format(value) {
  return value.toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

async function main() {
  console.log("\nFORGE MARKET DATA MASTER TEST v1.0\n");

  const cache = await getCachedRates();

  const udiRate = cache.rates.UDI_MXN.value;
  const usdRate = cache.rates.USD_MXN_FIX.value;

  console.log("Rates\n");
  console.log(`Cache status: ${cache.cacheStatus}`);
  console.log(`UDI/MXN: ${udiRate}`);
  console.log(`USD/MXN FIX: ${usdRate}`);

  const seguBecaYear7 = estimateFuturePremiumMXN({
    policyCurrency: "UDI",
    annualPremium: 2855.36,
    currentRate: udiRate,
    annualGrowthRate: 0.04,
    targetYear: 7
  });

  console.log("\nSeguBeca ejemplo año 7\n");
  console.log(`Prima anual: ${format(seguBecaYear7.annualPremium)} UDI`);
  console.log(`UDI actual: ${format(seguBecaYear7.currentRate)} MXN`);
  console.log(`Escenario: ${(seguBecaYear7.annualGrowthRate * 100).toFixed(2)}% anual`);
  console.log(`UDI estimada año 7: ${format(seguBecaYear7.projectedRate)} MXN`);
  console.log(`Prima estimada año 7: ${format(seguBecaYear7.estimatedPremiumMXN)} MXN`);
  console.log(`Modo: ${seguBecaYear7.calculationMode}`);

  const tests = [
    {
      name: "Obtiene UDI desde cache/Banxico",
      pass: udiRate > 0
    },
    {
      name: "Obtiene USD FIX desde cache/Banxico",
      pass: usdRate > 0
    },
    {
      name: "Calcula prima futura estimada",
      pass: seguBecaYear7.estimatedPremiumMXN > 0
    },
    {
      name: "No marca proyección como garantizada",
      pass: seguBecaYear7.calculationMode.includes("NOT_GUARANTEED")
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
    console.log("\n✅ MARKET DATA LAYER v1.0 CLOSED");
  }
}

main().catch(error => {
  console.error("\n❌ MARKET DATA MASTER TEST ERROR");
  console.error(error.message);
  process.exit(1);
});
