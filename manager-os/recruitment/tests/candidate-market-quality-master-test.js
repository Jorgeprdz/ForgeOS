const { evaluateCandidateMarketQuality } = require("../candidate-intelligence/candidate-market-quality-engine");

console.log("\nFORGE CANDIDATE MARKET QUALITY MASTER TEST v1.0\n");

const fixtures = [
  {
    name: "Strong market quality",
    input: {
      project200Size: 180,
      advisorReferralsCount: 5,
      prospectCount: 42,
      networkStrength: 88,
      appointmentPotential: 84
    },
    assert: result =>
      result.score >= 80 &&
      result.marketQuality === "HIGH" &&
      result.risks.some(risk => risk.includes("coachability"))
  },
  {
    name: "Limited market quality",
    input: {
      project200Size: 25,
      advisorReferralsCount: 0,
      prospectCount: 4,
      networkStrength: 35,
      appointmentPotential: 30
    },
    assert: result => result.score < 45 && result.marketQuality === "CRITICAL"
  },
  {
    name: "Coachable but little market scenario",
    input: {
      project200Size: 45,
      advisorReferralsCount: 0,
      prospectCount: 8,
      networkStrength: "medium",
      appointmentPotential: "low"
    },
    assert: result => result.recommendation === "COACH" && result.risks.length >= 3
  },
  {
    name: "Missing market data",
    input: {},
    assert: result => result.risks.length === 5 && result.recommendation !== "ADVANCE"
  }
];

function hasRequiredShape(result) {
  return (
    typeof result.score === "number" &&
    typeof result.marketQuality === "string" &&
    Array.isArray(result.strengths) &&
    Array.isArray(result.risks) &&
    typeof result.recommendation === "string"
  );
}

let pass = 0;

fixtures.forEach(fixture => {
  const result = evaluateCandidateMarketQuality(fixture.input);
  const ok = hasRequiredShape(result) && fixture.assert(result);

  console.log(`${ok ? "PASS" : "FAIL"} ${fixture.name}`);
  console.log(`   Score: ${result.score}`);
  console.log(`   Market Quality: ${result.marketQuality}`);
  console.log(`   Recommendation: ${result.recommendation}`);

  if (ok) pass++;
});

console.log("\nResumen:");
console.log(`Total: ${fixtures.length}`);
console.log(`Pass: ${pass}`);
console.log(`Fail: ${fixtures.length - pass}`);

if (pass !== fixtures.length) {
  console.log("\nCANDIDATE MARKET QUALITY MASTER TEST NEEDS REVIEW");
  process.exit(1);
}

console.log("\nCANDIDATE MARKET QUALITY MASTER TEST PASS");
