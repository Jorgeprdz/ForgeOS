const { evaluateCandidateCoachability } = require("../candidate-intelligence/candidate-coachability-engine");

console.log("\nFORGE CANDIDATE COACHABILITY MASTER TEST v1.0\n");

const fixtures = [
  {
    name: "Highly coachable candidate",
    input: {
      completesAssignments: true,
      followsProcess: true,
      attendsInterviews: true,
      memorizesScripts: true,
      acceptsFeedback: true
    },
    assert: result => result.score >= 90 && result.coachabilityLevel === "HIGH"
  },
  {
    name: "Low coachability",
    input: {
      missesInterviews: true,
      ignoresInstructions: true,
      wantsOwnSystem: true,
      incompleteTasks: true
    },
    assert: result => result.score < 40 && result.recommendation === "REJECT"
  },
  {
    name: "Contradictory coachability signals",
    input: {
      completesAssignments: true,
      followsProcess: true,
      acceptsFeedback: true,
      wantsOwnSystem: true,
      incompleteTasks: true
    },
    assert: result => result.score >= 40 && result.score <= 70 && result.risks.length >= 2
  },
  {
    name: "Missing coachability signals",
    input: {},
    assert: result => result.score === 45 && result.risks.length === 1
  }
];

function hasRequiredShape(result) {
  return (
    typeof result.score === "number" &&
    typeof result.coachabilityLevel === "string" &&
    Array.isArray(result.strengths) &&
    Array.isArray(result.risks) &&
    typeof result.recommendation === "string"
  );
}

let pass = 0;

fixtures.forEach(fixture => {
  const result = evaluateCandidateCoachability(fixture.input);
  const ok = hasRequiredShape(result) && fixture.assert(result);

  console.log(`${ok ? "PASS" : "FAIL"} ${fixture.name}`);
  console.log(`   Score: ${result.score}`);
  console.log(`   Level: ${result.coachabilityLevel}`);
  console.log(`   Recommendation: ${result.recommendation}`);

  if (ok) pass++;
});

console.log("\nResumen:");
console.log(`Total: ${fixtures.length}`);
console.log(`Pass: ${pass}`);
console.log(`Fail: ${fixtures.length - pass}`);

if (pass !== fixtures.length) {
  console.log("\nCANDIDATE COACHABILITY MASTER TEST NEEDS REVIEW");
  process.exit(1);
}

console.log("\nCANDIDATE COACHABILITY MASTER TEST PASS");
