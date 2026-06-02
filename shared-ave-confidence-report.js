const {
  classifyInferenceConfidence
} = require("./shared-ave-confidence-engine");

const {
  evaluateAveEligibility
} = require("./shared-ave-eligibility-engine");

console.log("\nFORGE SHARED AVE CONFIDENCE REPORT v0.1\n");

const confidenceCases = [
  0.92,
  0.76,
  0.33,
  null
];

const confidenceResults =
  confidenceCases.map((value) => {
    const result =
      classifyInferenceConfidence(value);

    console.log(
      `Confianza: ${value} -> ${result.level} / ${result.status}`
    );

    return result;
  });

console.log("\nElegibilidad\n");

const eligibilityPass =
  evaluateAveEligibility({
    product: "VIDA_MUJER",
    currency: "UDI",
    policyYear: 5
  });

console.log(
  `VIDA_MUJER / UDI / Año 5 -> ${eligibilityPass.eligible}`
);

const eligibilityFail =
  evaluateAveEligibility({
    product: "PRODUCTO_X",
    currency: "MXN",
    policyYear: 0
  });

console.log(
  `PRODUCTO_X / MXN / Año 0 -> ${eligibilityFail.eligible}`
);

console.log("\nResultados\n");

const tests = [
  {
    name: "HIGH confidence clasifica correctamente",
    pass:
      confidenceResults[0].level ===
      "HIGH_CONFIDENCE"
  },
  {
    name: "MEDIUM confidence clasifica correctamente",
    pass:
      confidenceResults[1].level ===
      "MEDIUM_CONFIDENCE"
  },
  {
    name: "LOW confidence clasifica correctamente",
    pass:
      confidenceResults[2].level ===
      "LOW_CONFIDENCE"
  },
  {
    name: "Elegibilidad positiva funciona",
    pass:
      eligibilityPass.eligible === true
  },
  {
    name: "Elegibilidad negativa funciona",
    pass:
      eligibilityFail.eligible === false
  }
];

tests.forEach((test) => {
  console.log(
    `${test.pass ? "✅" : "❌"} ${test.name}`
  );
});

const pass =
  tests.filter((t) => t.pass).length;

const fail =
  tests.length - pass;

console.log("\nResumen:");
console.log(`Total: ${tests.length}`);
console.log(`Pass: ${pass}`);
console.log(`Fail: ${fail}`);
