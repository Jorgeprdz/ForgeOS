const {
  inferAveType
} = require("./shared-ave-type-inference-engine");

function format(value) {
  return value.toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

console.log("\nFORGE SHARED AVE TYPE INFERENCE REPORT v0.1\n");

const observedValues = [
  {
    year: 1,
    rescueValue: 300
  },
  {
    year: 2,
    rescueValue: 620
  },
  {
    year: 3,
    rescueValue: 940
  }
];

const result = inferAveType({
  currency: "UDI",
  annualPremium: 300,
  observedValues
});

console.log("Valores observados\n");

observedValues.forEach((row) => {
  console.log(`Año ${row.year}: ${format(row.rescueValue)} UDI`);
});

console.log("\nResultado de inferencia\n");
console.log(`Tipo inferido: ${result.inferredAveType}`);
console.log(`Confianza: ${(result.confidence * 100).toFixed(2)}%`);
console.log(`Score CP: ${format(result.shortTermScore)}`);
console.log(`Score LP: ${format(result.longTermScore)}`);
console.log(`Modo: ${result.calculationMode}`);

console.log("\nSimulación CP\n");

result.shortTermSimulation.forEach((row) => {
  console.log(
    `Año ${row.year}: acumulado ${format(row.accumulatedValue)} / rescate ${format(row.rescueValue)}`
  );
});

console.log("\nSimulación LP\n");

result.longTermSimulation.forEach((row) => {
  console.log(
    `Año ${row.year}: acumulado ${format(row.accumulatedValue)} / rescate ${format(row.rescueValue)}`
  );
});

const tests = [
  {
    name: "Infere un tipo AVE válido",
    pass:
      result.inferredAveType === "AVE_SHORT_TERM" ||
      result.inferredAveType === "AVE_LONG_TERM"
  },
  {
    name: "Calcula score CP",
    pass: typeof result.shortTermScore === "number"
  },
  {
    name: "Calcula score LP",
    pass: typeof result.longTermScore === "number"
  },
  {
    name: "Calcula confianza",
    pass: result.confidence >= 0 && result.confidence <= 1
  }
];

console.log("\nResultados\n");

tests.forEach((test) => {
  console.log(`${test.pass ? "✅" : "❌"} ${test.name}`);
});

const pass = tests.filter((test) => test.pass).length;
const fail = tests.length - pass;

console.log("\nResumen:");
console.log(`Total: ${tests.length}`);
console.log(`Pass: ${pass}`);
console.log(`Fail: ${fail}`);
