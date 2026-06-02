const {
  buildSeguBecaEducationComparison
} = require("./segu-beca-education-comparison-engine");

function money(value) {
  return Number(value || 0).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0
  });
}

console.log("\nFORGE EDUCATION COST COMPARISON TEST v0.1\n");

const result = buildSeguBecaEducationComparison({
  childAge: 4,
  projectedCapitalMXN: 2500000,
  annualEducationInflation: 0.07
});

console.log("Core\n");
console.log(`Edad menor: ${result.childAge}`);
console.log(`Años hasta universidad: ${result.yearsUntilCollege}`);
console.log(`Capital proyectado: ${money(result.projectedCapitalMXN)}`);
console.log(`Inflación educativa usada: ${(result.annualEducationInflation * 100).toFixed(1)}%`);

console.log("\nComparativo universidades\n");

result.comparison.forEach(row => {
  console.log(`${row.university}`);
  console.log(`  Costo hoy estimado: ${money(row.currentCostMXN)}`);
  console.log(`  Costo futuro estimado: ${money(row.futureCostMXN)}`);
  console.log(`  Cobertura: ${row.coveragePercent.toFixed(1)}%`);
  console.log(`  Status: ${row.status}`);
});

const tests = [
  {
    name: "Calcula años hasta universidad",
    pass: result.yearsUntilCollege === 14
  },
  {
    name: "Construye comparativo 10 universidades",
    pass: result.comparison.length === 10
  },
  {
    name: "Proyecta costo futuro",
    pass: result.comparison[0].futureCostMXN > result.comparison[0].currentCostMXN
  },
  {
    name: "Calcula porcentaje de cobertura",
    pass: result.comparison[0].coveragePercent > 0
  },
  {
    name: "Clasifica cobertura",
    pass: ["COVERS_FULLY", "COVERS_MOST", "PARTIAL_COVERAGE"].includes(result.comparison[0].status)
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
  console.log("\n✅ EDUCATION COST COMPARISON v0.1 PASS");
} else {
  console.log("\n❌ EDUCATION COST COMPARISON NEEDS REVIEW");
}
