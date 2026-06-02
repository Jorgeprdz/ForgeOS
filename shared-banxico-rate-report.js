const {
  getCurrentRates
} = require("./shared-banxico-rate-engine");

async function main() {
  console.log("\nFORGE BANXICO RATE REPORT v0.1\n");

  const rates = await getCurrentRates();

  console.log("UDI/MXN");
  console.log(`Fecha: ${rates.UDI_MXN.date}`);
  console.log(`Valor: ${rates.UDI_MXN.value}`);
  console.log(`Fuente: ${rates.UDI_MXN.source}`);

  console.log("\nUSD/MXN FIX");
  console.log(`Fecha: ${rates.USD_MXN_FIX.date}`);
  console.log(`Valor: ${rates.USD_MXN_FIX.value}`);
  console.log(`Fuente: ${rates.USD_MXN_FIX.source}`);

  const tests = [
    {
      name: "Obtiene UDI desde Banxico",
      pass: rates.UDI_MXN.value > 0
    },
    {
      name: "Obtiene USD FIX desde Banxico",
      pass: rates.USD_MXN_FIX.value > 0
    },
    {
      name: "Marca fuente verificada",
      pass:
        rates.UDI_MXN.source === "BANXICO_SIE_API" &&
        rates.USD_MXN_FIX.source === "BANXICO_SIE_API"
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
    console.log("\n✅ BANXICO RATE ENGINE v0.1 PASS");
  }
}

main().catch(error => {
  console.error("\n❌ BANXICO RATE ENGINE ERROR");
  console.error(error.message);
  process.exit(1);
});
