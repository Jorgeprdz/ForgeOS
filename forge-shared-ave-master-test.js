const {
  calculateAveGrowth
} = require("./shared-ave-growth-engine");

const {
  calculateAveRescueValue
} = require("./shared-ave-rescue-engine");

const {
  calculateAveDeathBenefit
} = require("./shared-ave-death-benefit-engine");

const {
  inferAveType
} = require("./shared-ave-type-inference-engine");

const {
  calculateAvePortfolio
} = require("./shared-ave-portfolio-engine");

const {
  classifyInferenceConfidence
} = require("./shared-ave-confidence-engine");

const {
  evaluateAveEligibility
} = require("./shared-ave-eligibility-engine");

console.log("\nFORGE SHARED AVE MASTER TEST v1.0\n");

const growth = calculateAveGrowth({
  aveType: "AVE_LONG_TERM",
  currency: "UDI",
  principal: 1000,
  years: 10
});

const rescue = calculateAveRescueValue({
  aveType: "AVE_LONG_TERM",
  accumulatedValue: 1000,
  year: 1
});

const deathBenefit = calculateAveDeathBenefit({
  baseDeathBenefit: 35000,
  avePurchases: [
    {
      aveType: "AVE_LONG_TERM",
      currency: "UDI",
      principal: 1000,
      years: 10
    }
  ]
});

const inference = inferAveType({
  currency: "UDI",
  annualPremium: 300,
  observedValues: [
    { year: 1, rescueValue: 300 },
    { year: 2, rescueValue: 620 },
    { year: 3, rescueValue: 940 }
  ]
});

const confidence = classifyInferenceConfidence(
  inference.confidence
);

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
      aveType: "UNKNOWN",
      currency: "UDI",
      annualPremium: 250,
      purchaseYear: 5
    }
  ]
});

const eligibility = evaluateAveEligibility({
  product: "VIDA_MUJER",
  currency: "UDI",
  policyYear: 5
});

const tests = [
  {
    name: "Growth Engine calcula AVE LP UDI garantizada",
    pass:
      Math.round(growth.projectedValue * 100) / 100 ===
      1104.62
  },
  {
    name: "Rescue Engine aplica cargo LP año 1",
    pass:
      rescue.chargeRate === 0.045 &&
      rescue.rescueValue === 955
  },
  {
    name: "Death Benefit Engine suma AVE con rendimiento garantizado",
    pass:
      Math.round(deathBenefit.totalDeathBenefit * 100) / 100 ===
      36104.62
  },
  {
    name: "Type Inference Engine infiere tipo AVE válido",
    pass:
      inference.inferredAveType === "AVE_SHORT_TERM" ||
      inference.inferredAveType === "AVE_LONG_TERM"
  },
  {
    name: "Confidence Guard clasifica confianza",
    pass:
      confidence.level === "LOW_CONFIDENCE" ||
      confidence.level === "MEDIUM_CONFIDENCE" ||
      confidence.level === "HIGH_CONFIDENCE"
  },
  {
    name: "Portfolio Engine calcula posiciones activas",
    pass:
      portfolio.activeAveCount === 2 &&
      portfolio.blockedAveCount === 1
  },
  {
    name: "Portfolio Engine bloquea AVE UNKNOWN sin evidencia suficiente",
    pass:
      portfolio.positions.some(
        (position) =>
          position.status === "BLOCKED_UNKNOWN_AVE_TYPE"
      )
  },
  {
    name: "Eligibility Engine acepta Vida Mujer UDI",
    pass:
      eligibility.eligible === true
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

if (fail === 0) {
  console.log(
    "\n✅ SHARED AVE LIBRARY v1.0 CLOSED"
  );
} else {
  console.log(
    "\n❌ SHARED AVE LIBRARY v1.0 NEEDS REVIEW"
  );
}
