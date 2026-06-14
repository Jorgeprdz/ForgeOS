const { evaluateCandidateHardFactors } = require("../candidate-intelligence/candidate-hard-factors-engine");

console.log("\nFORGE CANDIDATE HARD FACTORS MASTER TEST v1.0\n");

const fixtures = [
  {
    name: "Strong hard factors",
    input: {
      age: 34,
      marriage: "MARRIED",
      yearsLivingInTown: 10,
      career: "Commercial Sales Manager",
      employmentStatus: "EMPLOYED"
    },
    assert: result => result.score >= 80 && result.recommendation === "ADVANCE"
  },
  {
    name: "Weak hard factors",
    input: {
      age: 19,
      yearsLivingInTown: 0,
      career: "",
      employmentStatus: "UNEMPLOYED"
    },
    assert: result => result.score < 55 && result.risks.length >= 3
  },
  {
    name: "Incomplete hard factors",
    input: {
      career: "Teacher"
    },
    assert: result => result.risks.length >= 4 && result.recommendation !== "ADVANCE"
  },
  {
    name: "Marital status alias is accepted",
    input: {
      age: 29,
      maritalStatus: "SINGLE",
      yearsLivingInTown: 4,
      career: "Account Executive",
      employmentStatus: "SELF_EMPLOYED"
    },
    assert: result => result.score >= 70 && result.risks.length <= 1
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
  const result = evaluateCandidateHardFactors(fixture.input);
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
  console.log("\nCANDIDATE HARD FACTORS MASTER TEST NEEDS REVIEW");
  process.exit(1);
}

console.log("\nCANDIDATE HARD FACTORS MASTER TEST PASS");
