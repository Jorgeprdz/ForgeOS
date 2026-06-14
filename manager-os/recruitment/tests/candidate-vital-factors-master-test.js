const { evaluateCandidateVitalFactors } = require("../candidate-intelligence/candidate-vital-factors-engine");

console.log("\nFORGE CANDIDATE VITAL FACTORS MASTER TEST v1.0\n");

const fixtures = [
  {
    name: "Strong vital factors",
    input: {
      mentalAgility: 86,
      drive: 90,
      energy: 84,
      moneyMotivation: 82,
      character: 88,
      integrity: 92,
      successHistory: 80,
      retentionPotential: 85
    },
    assert: result => result.score >= 80 && result.recommendation === "ADVANCE"
  },
  {
    name: "High energy with low character",
    input: {
      mentalAgility: 74,
      drive: 82,
      energy: 92,
      moneyMotivation: 80,
      character: 35,
      integrity: 42,
      successHistory: 70,
      retentionPotential: 62
    },
    assert: result =>
      result.recommendation === "REJECT" &&
      result.risks.some(risk => risk.includes("Character")) &&
      result.risks.some(risk => risk.includes("Integrity"))
  },
  {
    name: "Incomplete vital factors",
    input: {
      drive: 75,
      energy: 78
    },
    assert: result => result.risks.length >= 6 && result.recommendation !== "ADVANCE"
  },
  {
    name: "String ratings are accepted",
    input: {
      mentalAgility: "high",
      drive: "strong",
      energy: "medium",
      moneyMotivation: "moderate",
      character: "strong",
      integrity: "excellent",
      successHistory: "medium",
      retentionPotential: "high"
    },
    assert: result => result.score >= 70 && result.recommendation !== "REJECT"
  }
];

function hasRequiredShape(result) {
  return (
    typeof result.score === "number" &&
    Array.isArray(result.strengths) &&
    Array.isArray(result.risks) &&
    typeof result.recommendation === "string"
  );
}

let pass = 0;

fixtures.forEach(fixture => {
  const result = evaluateCandidateVitalFactors(fixture.input);
  const ok = hasRequiredShape(result) && fixture.assert(result);

  console.log(`${ok ? "PASS" : "FAIL"} ${fixture.name}`);
  console.log(`   Score: ${result.score}`);
  console.log(`   Recommendation: ${result.recommendation}`);
  console.log(`   Risks: ${result.risks.length}`);

  if (ok) pass++;
});

console.log("\nResumen:");
console.log(`Total: ${fixtures.length}`);
console.log(`Pass: ${pass}`);
console.log(`Fail: ${fixtures.length - pass}`);

if (pass !== fixtures.length) {
  console.log("\nCANDIDATE VITAL FACTORS MASTER TEST NEEDS REVIEW");
  process.exit(1);
}

console.log("\nCANDIDATE VITAL FACTORS MASTER TEST PASS");
