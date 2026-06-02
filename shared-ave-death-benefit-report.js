const {
  calculateAveDeathBenefit
} = require("./shared-ave-death-benefit-engine");

function format(value) {
  return value.toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

console.log("\nFORGE SHARED AVE DEATH BENEFIT REPORT v0.2\n");

const cases = [
  {
    name: "Sin AVE",
    input: {
      baseDeathBenefit: 35000,
      avePurchases: []
    }
  },
  {
    name: "Una AVE largo plazo UDI a 10 años",
    input: {
      baseDeathBenefit: 35000,
      avePurchases: [
        {
          aveType: "AVE_LONG_TERM",
          currency: "UDI",
          principal: 1000,
          years: 10
        }
      ]
    }
  },
  {
    name: "Múltiples AVE con rendimiento garantizado",
    input: {
      baseDeathBenefit: 35000,
      avePurchases: [
        {
          aveType: "AVE_LONG_TERM",
          currency: "UDI",
          principal: 1000,
          years: 10
        },
        {
          aveType: "AVE_SHORT_TERM",
          currency: "UDI",
          principal: 2500,
          years: 5
        },
        {
          aveType: "AVE_LONG_TERM",
          currency: "USD",
          principal: 500,
          years: 10
        }
      ]
    }
  }
];

const results = cases.map((testCase) => {
  const result =
    calculateAveDeathBenefit(testCase.input);

  console.log(testCase.name);
  console.log(`Suma asegurada básica: ${format(result.baseDeathBenefit)}`);
  console.log(`AVE proyectado garantizado: ${format(result.totalAveProjectedValue)}`);
  console.log(`Interés garantizado total: ${format(result.totalGuaranteedInterest)}`);
  console.log(`Beneficio total fallecimiento: ${format(result.totalDeathBenefit)}`);
  console.log(`Modo: ${result.calculationMode}`);
  console.log("");

  result.aveDetails.forEach((ave, index) => {
    console.log(`  AVE ${index + 1}`);
    console.log(`  Tipo: ${ave.aveType}`);
    console.log(`  Moneda: ${ave.currency}`);
    console.log(`  Principal: ${format(ave.principal)}`);
    console.log(`  Años: ${ave.years}`);
    console.log(`  Tasa garantizada: ${(ave.guaranteedRate * 100).toFixed(2)}%`);
    console.log(`  Valor proyectado: ${format(ave.projectedValue)}`);
    console.log(`  Interés garantizado: ${format(ave.guaranteedInterest)}`);
    console.log("");
  });

  return result;
});

const tests = [
  {
    name: "Sin AVE mantiene beneficio base",
    pass: results[0].totalDeathBenefit === 35000
  },
  {
    name: "Una AVE largo plazo UDI calcula rendimiento garantizado",
    pass:
      Math.round(results[1].totalAveProjectedValue * 100) / 100 === 1104.62
  },
  {
    name: "Una AVE largo plazo UDI se suma al beneficio por fallecimiento",
    pass:
      Math.round(results[1].totalDeathBenefit * 100) / 100 === 36104.62
  },
  {
    name: "Múltiples AVE acumulan rendimiento garantizado",
    pass:
      results[2].totalAveProjectedValue > 4000
  },
  {
    name: "El beneficio total incluye base más AVE proyectado",
    pass:
      Math.round(results[2].totalDeathBenefit * 100) / 100 ===
      Math.round((results[2].baseDeathBenefit + results[2].totalAveProjectedValue) * 100) / 100
  }
];

console.log("Resultados\n");

tests.forEach((test) => {
  console.log(
    `${test.pass ? "✅" : "❌"} ${test.name}`
  );
});

const pass =
  tests.filter((test) => test.pass).length;

const fail =
  tests.length - pass;

console.log("\nResumen:");
console.log(`Total: ${tests.length}`);
console.log(`Pass: ${pass}`);
console.log(`Fail: ${fail}`);
