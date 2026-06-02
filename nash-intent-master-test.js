const { detectNashIntent } = require("./nash-intent-engine");

console.log("\nFORGE NASH INTENT ENGINE TEST v0.4\n");

const fixtures = [
  {
    name: "Esta caro -> VALUE_NOT_CLEAR",
    text: "Esta caro",
    expected: ["VALUE_NOT_CLEAR"]
  },
  {
    name: "No tengo dinero ahorita -> REAL_BUDGET_CONSTRAINT o VALUE_NOT_CLEAR",
    text: "No tengo dinero ahorita",
    expected: ["REAL_BUDGET_CONSTRAINT", "VALUE_NOT_CLEAR"]
  },
  {
    name: "Dejame pensarlo -> AVOIDING_DECISION",
    text: "Dejame pensarlo",
    expected: ["AVOIDING_DECISION"]
  },
  {
    name: "Lo tengo que ver con mi esposa -> THIRD_PARTY_APPROVAL",
    text: "Lo tengo que ver con mi esposa",
    expected: ["THIRD_PARTY_APPROVAL"]
  },
  {
    name: "Mandame info -> REQUESTS_INFO",
    text: "Mandame info",
    expected: ["REQUESTS_INFO"]
  },
  {
    name: "Ya tengo seguro -> ALREADY_SOLVED",
    text: "Ya tengo seguro",
    expected: ["ALREADY_SOLVED"]
  },
  {
    name: "Va, lo vemos manana -> READY_TO_MEET",
    text: "Va, lo vemos manana",
    expected: ["READY_TO_MEET"]
  },
  {
    name: "No confio en esas cosas -> TRUST_ISSUE",
    text: "No confio en esas cosas",
    expected: ["TRUST_ISSUE"]
  }
];

function hasRequiredShape(result) {
  return (
    typeof result.rawText === "string" &&
    typeof result.primaryIntent === "string" &&
    typeof result.confidence === "number" &&
    Array.isArray(result.possibleIntents) &&
    typeof result.commercialSignal === "string" &&
    typeof result.recommendedStrategy === "string" &&
    typeof result.psychology === "string" &&
    typeof result.nextBestActionHint === "string"
  );
}

let pass = 0;

fixtures.forEach(fixture => {
  const result = detectNashIntent(fixture.text);
  const intentOk =
    fixture.expected.includes(result.primaryIntent) ||
    fixture.expected.some(intent => result.possibleIntents.includes(intent));
  const shapeOk = hasRequiredShape(result);
  const ok = intentOk && shapeOk;

  console.log(`${ok ? "✅" : "❌"} ${fixture.name}`);
  console.log(`   Primary: ${result.primaryIntent}`);
  console.log(`   Confidence: ${result.confidence}`);
  console.log(`   Possible: ${result.possibleIntents.join(", ")}`);
  console.log(`   Signal: ${result.commercialSignal}`);

  if (ok) pass++;
});

console.log("\nResumen:");
console.log(`Total: ${fixtures.length}`);
console.log(`Pass: ${pass}`);
console.log(`Fail: ${fixtures.length - pass}`);

if (pass === fixtures.length) {
  console.log("\n✅ NASH INTENT ENGINE v0.4 PASS");
} else {
  console.log("\n❌ NASH INTENT ENGINE v0.4 NEEDS REVIEW");
  process.exit(1);
}
