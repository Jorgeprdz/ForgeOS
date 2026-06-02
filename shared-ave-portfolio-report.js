const {
  calculateAvePortfolio
} = require("./shared-ave-portfolio-engine");

function format(value) {
  if (value === null || value === undefined) return "N/A";

  return value.toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

console.log("\nFORGE SHARED AVE PORTFOLIO REPORT v0.2\n");

const portfolio = calculateAvePortfolio({
  evaluationYear: 10,
  positions: [
    {
      positionId: "AVE-001",
      aveType: "AVE_LONG_TERM",
      currency: "UDI",
      principal: 1000,
      purchaseYear: 1
    },
    {
      positionId: "AVE-002",
      aveType: "UNKNOWN",
      currency: "UDI",
      annualPremium: 300,
      purchaseYear: 1,
      observedValues: [
        { year: 1, rescueValue: 300 },
        { year: 2, rescueValue: 620 },
        { year: 3, rescueValue: 940 }
      ]
    },
    {
      positionId: "AVE-003",
      aveType: "AVE_SHORT_TERM",
      currency: "UDI",
      principal: 500,
      purchaseYear: 8
    },
    {
      positionId: "AVE-004",
      aveType: "UNKNOWN",
      currency: "UDI",
      annualPremium: 250,
      purchaseYear: 5
    }
  ]
});

console.log(`Año de evaluación: ${portfolio.evaluationYear}`);
console.log(`Posiciones totales: ${portfolio.totalPositions}`);
console.log(`AVEs activas: ${portfolio.activeAveCount}`);
console.log(`AVEs bloqueadas: ${portfolio.blockedAveCount}`);
console.log(`Principal total activo: ${format(portfolio.totalPrincipal)} UDI`);
console.log(`Valor proyectado total: ${format(portfolio.totalProjectedValue)} UDI`);
console.log(`Interés garantizado total: ${format(portfolio.totalGuaranteedInterest)} UDI`);
console.log(`Cargo rescate total: ${format(portfolio.totalRescueCharge)} UDI`);
console.log(`Valor rescate total: ${format(portfolio.totalRescueValue)} UDI`);
console.log(`Modo: ${portfolio.calculationMode}`);

console.log("\nDetalle por posición\n");

portfolio.positions.forEach((position) => {
  console.log(`${position.positionId}`);
  console.log(`Status: ${position.status}`);
  console.log(`Tipo: ${position.aveType}`);
  console.log(`Inferido: ${position.inferred ? "Sí" : "No"}`);
  console.log(
    `Confianza inferencia: ${
      position.inferenceConfidence === null || position.inferenceConfidence === undefined
        ? "N/A"
        : (position.inferenceConfidence * 100).toFixed(2) + "%"
    }`
  );
  console.log(`Moneda: ${position.currency}`);
  console.log(`Principal: ${format(position.principal)}`);
  console.log(`Año compra: ${position.purchaseYear}`);
  console.log(`Años invertidos: ${position.yearsInvested}`);

  if (position.status === "ACTIVE") {
    console.log(`Tasa garantizada: ${(position.guaranteedRate * 100).toFixed(2)}%`);
    console.log(`Valor proyectado: ${format(position.projectedValue)}`);
    console.log(`Interés garantizado: ${format(position.guaranteedInterest)}`);
    console.log(`Cargo rescate: ${(position.rescueChargeRate * 100).toFixed(2)}%`);
    console.log(`Valor rescate: ${format(position.rescueValue)}`);
  } else {
    console.log(`Razón: ${position.reason}`);
  }

  console.log("");
});

const inferredPosition =
  portfolio.positions.find((item) => item.positionId === "AVE-002");

const blockedPosition =
  portfolio.positions.find((item) => item.positionId === "AVE-004");

const tests = [
  {
    name: "Calcula 4 posiciones totales",
    pass: portfolio.totalPositions === 4
  },
  {
    name: "Bloquea posición UNKNOWN sin datos observados",
    pass:
      blockedPosition.status === "BLOCKED_UNKNOWN_AVE_TYPE" &&
      portfolio.blockedAveCount === 1
  },
  {
    name: "Infiere tipo AVE cuando hay valores observados",
    pass:
      inferredPosition.status === "ACTIVE" &&
      inferredPosition.inferred === true &&
      inferredPosition.aveType !== "UNKNOWN"
  },
  {
    name: "Calcula principal solo de posiciones activas",
    pass: portfolio.totalPrincipal === 1800
  },
  {
    name: "Valor proyectado total activo es mayor al principal",
    pass: portfolio.totalProjectedValue > portfolio.totalPrincipal
  },
  {
    name: "Interés garantizado total positivo",
    pass: portfolio.totalGuaranteedInterest > 0
  },
  {
    name: "Mantiene modo de cálculo con inferencia",
    pass: portfolio.calculationMode === "AVE_PORTFOLIO_WITH_TYPE_INFERENCE"
  }
];

console.log("Resultados\n");

tests.forEach((test) => {
  console.log(`${test.pass ? "✅" : "❌"} ${test.name}`);
});

const pass =
  tests.filter((test) => test.pass).length;

const fail =
  tests.length - pass;

console.log("\nResumen:");
console.log(`Total: ${tests.length}`);
console.log(`Pass: ${pass}`);
console.log(`Fail: ${fail}`);
