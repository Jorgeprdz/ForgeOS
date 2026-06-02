const {
  getCachedRates
} = require("./exchange-rate-cache-engine");

const {
  getProjectionScenario
} = require("./shared-projection-scenarios-engine");

const {
  buildMeaningfulNumbers
} = require("./shared-meaningful-numbers-engine");

function format(value) {
  return value.toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

async function main() {
  console.log("\nFORGE SEGU_BECA MEANINGFUL NUMBERS REPORT v0.1\n");

  const cache = await getCachedRates();
  const currentUdi = cache.rates.UDI_MXN.value;

  const scenario = getProjectionScenario({
    mode: "ADVISOR_45"
  });

  const result = buildMeaningfulNumbers({
    annualPremium: 2855.36,
    educationCapital: 30000,
    currentRate: currentUdi,
    annualGrowthRate: scenario.annualGrowthRate,
    targetYears: [1, 7, 14]
  });

  console.log("Lectura para cliente\n");

  console.log(`Capital educativo contratado: 30,000 UDI`);
  console.log(`Equivalente aproximado hoy: $${format(result.educationCapitalToday)} MXN`);

  console.log("\nSi usamos un escenario de crecimiento de UDI de 4.5% anual:");
  console.log(`Capital educativo estimado al año 14: $${format(result.educationCapitalAtEnd.futureValue)} MXN`);

  console.log("\nAportación anual estimada\n");
  console.log(`Prima anual en cotización: 2,855.36 UDI`);
  console.log(`Equivalente aproximado hoy: $${format(result.premiumToday)} MXN`);

  result.premiumMilestones.forEach((item) => {
    console.log(
      `Año ${item.year}: podría rondar $${format(item.estimatedPremiumMXN)} MXN`
    );
  });

  console.log("\nNota Forge\n");
  console.log("Estos valores en pesos son estimaciones. La cotización está expresada en UDI; el monto real en MXN dependerá del valor de la UDI en cada fecha de pago.");

  const tests = [
    {
      name: "Convierte capital educativo a MXN hoy",
      pass: result.educationCapitalToday > 0
    },
    {
      name: "Proyecta capital educativo al año 14",
      pass: result.educationCapitalAtEnd.futureValue > result.educationCapitalToday
    },
    {
      name: "Convierte prima anual a MXN hoy",
      pass: result.premiumToday > 0
    },
    {
      name: "Calcula prima año 7",
      pass: result.premiumMilestones.some(row => row.year === 7)
    },
    {
      name: "Usa escenario asesor 4.5%",
      pass: result.annualGrowthRate === 0.045
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
    console.log("\n✅ MEANINGFUL NUMBERS v0.1 PASS");
  }
}

main().catch(error => {
  console.error(error.message);
  process.exit(1);
});
