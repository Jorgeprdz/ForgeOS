const {
  calculateAveRescueValue
} = require("./shared-ave-rescue-engine");

function format(value) {
  return value.toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

console.log("\nFORGE SHARED AVE RESCUE REPORT v0.1\n");

const cases = [
  {
    name: "AVE corto plazo año 1 sin cargo",
    input: {
      aveType: "AVE_SHORT_TERM",
      accumulatedValue: 1000,
      year: 1
    }
  },
  {
    name: "AVE largo plazo año 1 cargo 4.5%",
    input: {
      aveType: "AVE_LONG_TERM",
      accumulatedValue: 1000,
      year: 1
    }
  },
  {
    name: "AVE largo plazo año 2 cargo 2.5%",
    input: {
      aveType: "AVE_LONG_TERM",
      accumulatedValue: 1000,
      year: 2
    }
  },
  {
    name: "AVE largo plazo año 3 cargo 0.5%",
    input: {
      aveType: "AVE_LONG_TERM",
      accumulatedValue: 1000,
      year: 3
    }
  },
  {
    name: "AVE largo plazo año 4 sin cargo",
    input: {
      aveType: "AVE_LONG_TERM",
      accumulatedValue: 1000,
      year: 4
    }
  }
];

const results = cases.map((testCase) => {
  const result =
    calculateAveRescueValue(testCase.input);

  console.log(testCase.name);
  console.log(`Tipo: ${result.aveType}`);
  console.log(`Año: ${result.year}`);
  console.log(`Valor acumulado: ${format(result.accumulatedValue)}`);
  console.log(`Cargo: ${(result.chargeRate * 100).toFixed(2)}%`);
  console.log(`Monto cargo: ${format(result.rescueCharge)}`);
  console.log(`Valor rescate: ${format(result.rescueValue)}`);
  console.log(`Modo: ${result.calculationMode}`);
  console.log("");

  return result;
});

const tests = [
  {
    name: "AVE corto plazo no cobra rescate",
    pass: results[0].chargeRate === 0
  },
  {
    name: "AVE largo plazo año 1 cobra 4.5%",
    pass:
      results[1].chargeRate === 0.045 &&
      results[1].rescueValue === 955
  },
  {
    name: "AVE largo plazo año 2 cobra 2.5%",
    pass:
      results[2].chargeRate === 0.025 &&
      results[2].rescueValue === 975
  },
  {
    name: "AVE largo plazo año 3 cobra 0.5%",
    pass:
      results[3].chargeRate === 0.005 &&
      results[3].rescueValue === 995
  },
  {
    name: "AVE largo plazo año 4 ya no cobra rescate",
    pass:
      results[4].chargeRate === 0 &&
      results[4].rescueValue === 1000
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
