const {
  getBenefitHierarchy
} = require("./shared-benefit-hierarchy-engine");

const {
  buildRecoveryAnalysis
} = require("./shared-recovery-analysis-engine");

const {
  buildDecisionClarity
} = require("./shared-decision-clarity-engine");

const {
  translateClientLanguage
} = require("./shared-client-language-engine");

const {
  validatePricePlacement
} = require("./shared-price-placement-engine");

const {
  buildDecisionScore
} = require("./shared-decision-score-engine");

const {
  buildDecisionAppendix
} = require("./shared-decision-appendix-engine");

console.log(
  "\nFORGE DECISION PLATFORM REPORT v1.0\n"
);

const hierarchy =
  getBenefitHierarchy("IMAGINA_SER");

const recovery =
  buildRecoveryAnalysis({
    contributed: 100000,
    recovered: 146220
  });

const clarity =
  buildDecisionClarity({
    primaryBenefit:
      hierarchy.primaryBenefit,
    value: 146220
  });

const slides = [
    { title:"Problema" },
    { title:"Objetivo" },
    { title:"Resultado" },
    { title:"Costo" }
];

const priceValidation =
  validatePricePlacement(slides);

const score =
  buildDecisionScore({
    benefitDefined:true,
    decisionPresent:true,
    recommendationPresent:true,
    nextStepPresent:true,
    priceLast:true
  });

const appendix =
  buildDecisionAppendix({
    executiveSummary:{},
    timeline:[],
    scenarios:[],
    recovery,
    objections:[]
  });

const tests = [
  {
    name:"Benefit Hierarchy",
    pass:
      hierarchy.primaryBenefit ===
      "RETIREMENT_INCOME"
  },

  {
    name:"Recovery Analysis",
    pass:
      recovery.gain > 0
  },

  {
    name:"Decision Clarity",
    pass:
      clarity.explanation.length > 10
  },

  {
    name:"Client Language",
    pass:
      translateClientLanguage("AF")
      !== "AF"
  },

  {
    name:"Price Placement",
    pass:
      priceValidation.valid
  },

  {
    name:"Decision Score",
    pass:
      score.score === 100
  },

  {
    name:"Appendix Builder",
    pass:
      appendix.generatedBy
      ===
      "FORGE_DECISION_APPENDIX_ENGINE"
  }
];

console.log("Resultados\n");

tests.forEach(test => {
  console.log(
    `${test.pass ? "✅" : "❌"} ${test.name}`
  );
});

const pass =
  tests.filter(t => t.pass).length;

const fail =
  tests.length - pass;

console.log("\nResumen:");
console.log(`Total: ${tests.length}`);
console.log(`Pass: ${pass}`);
console.log(`Fail: ${fail}`);

if (fail === 0) {
  console.log(
    "\n✅ FORGE DECISION PLATFORM v1.0 CLOSED"
  );
}
