const {
  calculateAveGrowth
} = require("./shared-ave-growth-engine");

function format(value) {
  return value.toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

console.log("\nFORGE SHARED AVE GROWTH REPORT v0.1\n");

const cases = [
  {
    name: "AVE corto plazo USD",
    input: {
      aveType: "AVE_SHORT_TERM",
      currency: "USD",
      principal: 1000,
      years: 10
    }
  },
  {
    name: "AVE corto plazo UDI",
    input: {
      aveType: "AVE_SHORT_TERM",
      currency: "UDI",
      principal: 1000,
      years: 10
    }
  },
  {
    name: "AVE largo plazo USD",
    input: {
      aveType: "AVE_LONG_TERM",
      currency: "USD",
      principal: 1000,
      years: 10
    }
  },
  {
    name: "AVE largo plazo UDI",
    input: {
      aveType: "AVE_LONG_TERM",
      currency: "UDI",
      principal: 1000,
      years: 10
    }
  }
];

const results = cases.map((testCase) => {
  const result = calculateAveGrowth(testCase.input);

  console.log(testCase.name);
  console.log(`Tipo: ${result.aveType}`);
  console.log(`Moneda: ${result.currency}`);
  console.log(`Principal: ${format(result.principal)} ${result.currency}`);
  console.log(`Años: ${result.years}`);
  console.log(`Tasa garantizada: ${(result.guaranteedRate * 100).toFixed(2)}%`);
  console.log(`Valor proyectado: ${format(result.projectedValue)} ${result.currency}`);
  console.log(`Interés garantizado: ${format(result.guaranteedInterest)} ${result.currency}`);
  console.log(`Modo: ${result.calculationMode}`);
  console.log("");

  return result;
});

const tests = [
  {
    name: "AVE corto plazo USD usa tasa garantizada 1%",
    pass: results[0].guaranteedRate === 0.01
  },
  {
    name: "AVE corto plazo UDI usa tasa garantizada 0.5%",
    pass: results[1].guaranteedRate === 0.005
  },
  {
    name: "AVE largo plazo USD usa tasa garantizada 2%",
    pass: results[2].guaranteedRate === 0.02
  },
  {
    name: "AVE largo plazo UDI usa tasa garantizada 1%",
    pass: results[3].guaranteedRate === 0.01
  },
  {
    name: "AVE largo plazo UDI proyecta 1000 a 10 años correctamente",
    pass: Math.round(results[3].projectedValue * 100) / 100 === 1104.62
  }
];

console.log("Resultados\n");

tests.forEach((test) => {
  console.log(`${test.pass ? "✅" : "❌"} ${test.name}`);
});

const pass = tests.filter((test) => test.pass).length;
const fail = tests.length - pass;

console.log("\nResumen:");
console.log(`Total: ${tests.length}`);
console.log(`Pass: ${pass}`);
console.log(`Fail: ${fail}`);
