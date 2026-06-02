const {
  buildEducationPathsComparison
} = require("./shared-education-paths-engine");

function money(v) {
  return Number(v).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0
  });
}

console.log("\nFORGE EDUCATION PATHS TEST v0.1\n");

const result = buildEducationPathsComparison({
  projectedCapitalMXN: 2500000,
  yearsUntilCollege: 14,
  educationInflation: 0.07
});

console.log("Freedom Score\n");
console.log(`Nivel: ${result.freedomScore.level}`);
console.log(`Score: ${result.freedomScore.score}`);

console.log("\nUNIVERSIDADES PÚBLICAS\n");

result.publicComparison.forEach(u => {
  console.log(`${u.name}`);
  console.log(`  Costo proyectado: ${money(u.projectedCostMXN)}`);
  console.log(`  Cobertura: ${u.coveragePercent.toFixed(1)}%`);
});

console.log("\nUNIVERSIDADES PRIVADAS MID\n");

result.privateMidComparison.forEach(u => {
  console.log(`${u.name}`);
  console.log(`  Costo proyectado: ${money(u.projectedCostMXN)}`);
  console.log(`  Cobertura: ${u.coveragePercent.toFixed(1)}%`);
});

console.log("\nUNIVERSIDADES PRIVADAS PREMIUM\n");

result.privatePremiumComparison.forEach(u => {
  console.log(`${u.name}`);
  console.log(`  Costo proyectado: ${money(u.projectedCostMXN)}`);
  console.log(`  Cobertura: ${u.coveragePercent.toFixed(1)}%`);
});

const tests = [
  {
    name: "Construye universidades públicas",
    pass: result.publicComparison.length >= 5
  },
  {
    name: "Construye privadas mid",
    pass: result.privateMidComparison.length >= 3
  },
  {
    name: "Construye privadas premium",
    pass: result.privatePremiumComparison.length >= 5
  },
  {
    name: "Calcula Freedom Score",
    pass: result.freedomScore.score > 0
  },
  {
    name: "Proyecta costos futuros",
    pass:
      result.privatePremiumComparison[0]
        .projectedCostMXN >
      3200000
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
  console.log("\n✅ EDUCATION PATHS ENGINE v0.1 PASS");
} else {
  console.log("\n❌ EDUCATION PATHS ENGINE NEEDS REVIEW");
}
