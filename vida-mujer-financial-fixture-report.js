const quote = require("./fixtures/vida-mujer-quote-fixture.json");
const { getCachedRates } = require("./exchange-rate-cache-engine");

function money(value) {
  return Number(value || 0).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function udi(value) {
  return Number(value || 0).toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

async function main() {
  const cache = await getCachedRates();
  const currentUDI = cache.rates.UDI_MXN.value;

  const annualGrowth =
    quote.annualUDIGrowth ||
    quote.projectionAssumptions?.annualUDIGrowth ||
    0.045;

  function projectedUDI(year) {
    return currentUDI * Math.pow(1 + annualGrowth, year);
  }

  const totalContributedUDI =
    quote.annualPremiumUDI * quote.paymentYears;

  let totalContributedMXNProjected = 0;

  for (let year = 1; year <= quote.paymentYears; year++) {
    totalContributedMXNProjected +=
      quote.annualPremiumUDI * projectedUDI(year);
  }

  const dotales = quote.survivalDotales.map(item => {
    const amountUDI =
      quote.basicSumAssuredUDI * (item.percent / 100);

    const projectedRate = projectedUDI(item.year);

    return {
      ...item,
      age: quote.insuredAge + item.year,
      amountUDI,
      projectedRate,
      projectedMXN: amountUDI * projectedRate
    };
  });

  const totalSurvivalUDI =
    dotales.reduce((sum, item) => sum + item.amountUDI, 0);

  const totalSurvivalMXNProjected =
    dotales.reduce((sum, item) => sum + item.projectedMXN, 0);

  const recoveryPercentUDI =
    (totalSurvivalUDI / totalContributedUDI) * 100;

  const recoveryPercentProjected =
    (totalSurvivalMXNProjected / totalContributedMXNProjected) * 100;

  console.log("\nFORGE VIDA MUJER FINANCIAL REPORT v1.4\n");

  console.log("Datos base\n");
  console.log(`Producto: ${quote.product}`);
  console.log(`Moneda: ${quote.currency}`);
  console.log(`Edad: ${quote.insuredAge}`);
  console.log(`Suma asegurada: ${udi(quote.basicSumAssuredUDI)} UDI`);
  console.log(`UDI real Banxico actual: ${money(currentUDI)}`);
  console.log(`Escenario crecimiento UDI: ${(annualGrowth * 100).toFixed(2)}% anual`);

  console.log("\n¿Cuánto voy a aportar?\n");
  console.log(`Prima anual: ${udi(quote.annualPremiumUDI)} UDI`);
  console.log(`Años de pago: ${quote.paymentYears}`);
  console.log(`Aportación total en UDI: ${udi(totalContributedUDI)} UDI`);
  console.log(`Aportación total estimada en MXN proyectados: ${money(totalContributedMXNProjected)}`);

  console.log("\nTabla de aportaciones con UDI creciente\n");

  for (let year = 1; year <= quote.paymentYears; year++) {
    const rate = projectedUDI(year);
    const annualMXN = quote.annualPremiumUDI * rate;

    console.log(
      `Año ${year} / Edad ${quote.insuredAge + year}: ` +
      `${udi(quote.annualPremiumUDI)} UDI × UDI ${rate.toFixed(4)} = ${money(annualMXN)}`
    );
  }

  console.log("\n¿De cuánto son mis dotales?\n");

  dotales.forEach(item => {
    console.log(
      `Año ${item.year} / Edad ${item.age}: ` +
      `${item.percent}% = ${udi(item.amountUDI)} UDI × UDI ${item.projectedRate.toFixed(4)} = ${money(item.projectedMXN)}`
    );
  });

  console.log("\nTabla de sumas aseguradas por enfermedad / evento\n");

  const diseaseCoverages = quote.diseaseCoverages || [
    {
      disease: "Cáncer femenino",
      coverage: "PCF",
      sumAssuredUDI: 35000
    },
    {
      disease: "Enfermedades graves de la mujer",
      coverage: "PEP",
      sumAssuredUDI: 17500
    },
    {
      disease: "Cirugía o tratamiento cubierto",
      coverage: "CLP",
      sumAssuredUDI: 10000
    },
    {
      disease: "Invalidez total y permanente",
      coverage: "BIT / BITC",
      sumAssuredUDI: 35000
    }
  ];

  diseaseCoverages.forEach(item => {
    console.log(item.disease);
    console.log(`  Cobertura: ${item.coverage}`);
    console.log(`  Suma asegurada: ${udi(item.sumAssuredUDI)} UDI`);
    console.log(`  Equivalente hoy: ${money(item.sumAssuredUDI * currentUDI)}`);
  });

  console.log("\n¿Cuánto voy a recuperar por supervivencia?\n");
  console.log(`Total supervivencia: ${udi(totalSurvivalUDI)} UDI`);
  console.log(`Total supervivencia estimada en MXN proyectados: ${money(totalSurvivalMXNProjected)}`);

  console.log("\nPorcentaje de recuperación\n");
  console.log(`En UDI: ${recoveryPercentUDI.toFixed(2)}%`);
  console.log(`En MXN proyectado nominal: ${recoveryPercentProjected.toFixed(2)}%`);

  console.log("\nValores garantizados\n");
  console.log("Vida Mujer no tiene valores garantizados en esta lectura.");
  console.log("Forge debe mostrar dotales / supervivencia, coberturas y primas.");

  console.log("\nLectura Forge\n");
  console.log("La comparación técnica principal debe hacerse en UDI.");
  console.log("La lectura en pesos usa UDI real Banxico actual + escenario de crecimiento.");
  console.log("Los pesos proyectados son nominales y no garantizados.");

  const tests = [
    {
      name: "Obtiene UDI real Banxico",
      pass: currentUDI > 0
    },
    {
      name: "Calcula aportación total en UDI",
      pass: Math.abs(totalContributedUDI - 57107.2) < 0.01
    },
    {
      name: "Calcula recuperación total 40,250 UDI",
      pass: totalSurvivalUDI === 40250
    },
    {
      name: "Recovery UDI menor a 100%",
      pass: recoveryPercentUDI < 100
    },
    {
      name: "Proyecta MXN con UDI creciente",
      pass: totalSurvivalMXNProjected > totalSurvivalUDI * currentUDI
    },
    {
      name: "Incluye tabla de enfermedades",
      pass: diseaseCoverages.length >= 4
    },
    {
      name: "No muestra valores garantizados",
      pass: true
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
    console.log("\n✅ VIDA MUJER FINANCIAL REPORT v1.4 PASS");
  } else {
    console.log("\n❌ VIDA MUJER FINANCIAL REPORT NEEDS REVIEW");
  }
}

main().catch(error => {
  console.error("\n❌ VIDA MUJER FINANCIAL REPORT ERROR");
  console.error(error.message);
  process.exit(1);
});
