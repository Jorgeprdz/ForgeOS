const { evaluateCandidateAssessment } = require("../candidate-intelligence/candidate-assessment-engine");

console.log("\nFORGE CANDIDATE ASSESSMENT MASTER TEST v1.0\n");

const strongCandidate = {
  hardFactors: {
    age: 35,
    marriage: "MARRIED",
    yearsLivingInTown: 12,
    career: "Commercial Sales Director",
    employmentStatus: "EMPLOYED"
  },
  vitalFactors: {
    mentalAgility: 88,
    drive: 91,
    energy: 86,
    moneyMotivation: 84,
    character: 90,
    integrity: 92,
    successHistory: 85,
    retentionPotential: 87
  },
  coachabilitySignals: {
    completesAssignments: true,
    followsProcess: true,
    attendsInterviews: true,
    memorizesScripts: true,
    acceptsFeedback: true
  },
  marketQuality: {
    project200Size: 170,
    advisorReferralsCount: 4,
    prospectCount: 45,
    networkStrength: 86,
    appointmentPotential: 84
  }
};

const weakCandidate = {
  hardFactors: {
    age: 19,
    yearsLivingInTown: 0,
    career: "",
    employmentStatus: "UNEMPLOYED"
  },
  vitalFactors: {
    mentalAgility: 35,
    drive: 40,
    energy: 35,
    moneyMotivation: 45,
    character: 30,
    integrity: 35,
    successHistory: 25,
    retentionPotential: 30
  },
  coachabilitySignals: {
    missesInterviews: true,
    ignoresInstructions: true,
    wantsOwnSystem: true,
    incompleteTasks: true
  },
  marketQuality: {
    project200Size: 20,
    advisorReferralsCount: 0,
    prospectCount: 3,
    networkStrength: 25,
    appointmentPotential: 20
  }
};

const coachableLowMarket = {
  hardFactors: {
    age: 31,
    marriage: "SINGLE",
    yearsLivingInTown: 4,
    career: "Customer Success",
    employmentStatus: "EMPLOYED"
  },
  vitalFactors: {
    mentalAgility: 82,
    drive: 85,
    energy: 80,
    moneyMotivation: 78,
    character: 86,
    integrity: 88,
    successHistory: 76,
    retentionPotential: 82
  },
  coachabilitySignals: {
    completesAssignments: true,
    followsProcess: true,
    attendsInterviews: true,
    memorizesScripts: true,
    acceptsFeedback: true
  },
  marketQuality: {
    project200Size: 35,
    advisorReferralsCount: 0,
    prospectCount: 6,
    networkStrength: 42,
    appointmentPotential: 38
  }
};

const largeMarketLowCoachability = {
  hardFactors: strongCandidate.hardFactors,
  vitalFactors: strongCandidate.vitalFactors,
  coachabilitySignals: {
    missesInterviews: true,
    ignoresInstructions: true,
    wantsOwnSystem: true,
    incompleteTasks: true
  },
  marketQuality: strongCandidate.marketQuality
};

const highEnergyLowCharacter = {
  hardFactors: strongCandidate.hardFactors,
  vitalFactors: {
    mentalAgility: 80,
    drive: 88,
    energy: 94,
    moneyMotivation: 86,
    character: 35,
    integrity: 48,
    successHistory: 76,
    retentionPotential: 70
  },
  coachabilitySignals: strongCandidate.coachabilitySignals,
  marketQuality: strongCandidate.marketQuality
};

const incompleteData = {
  hardFactors: {
    career: "Retail"
  },
  vitalFactors: {
    drive: 75
  },
  coachabilitySignals: {},
  marketQuality: {}
};

const contradictorySignals = {
  hardFactors: strongCandidate.hardFactors,
  vitalFactors: strongCandidate.vitalFactors,
  coachabilitySignals: {
    completesAssignments: true,
    followsProcess: true,
    attendsInterviews: true,
    memorizesScripts: true,
    acceptsFeedback: true,
    wantsOwnSystem: true,
    incompleteTasks: true
  },
  marketQuality: strongCandidate.marketQuality
};

const fixtures = [
  {
    name: "Strong candidate advances",
    input: strongCandidate,
    assert: result =>
      result.recommendation === "ADVANCE" &&
      result.managerAction === "Proceed to Career Interview" &&
      result.overallScore >= 80
  },
  {
    name: "Weak candidate rejected",
    input: weakCandidate,
    assert: result =>
      result.recommendation === "REJECT" &&
      result.managerAction === "Reject Candidate" &&
      result.overallScore < 45
  },
  {
    name: "Coachable candidate with little market gets coaching",
    input: coachableLowMarket,
    assert: result =>
      result.recommendation === "COACH" &&
      result.managerAction === "Assign Coaching" &&
      result.marketQualityScore < 50
  },
  {
    name: "Large market with low coachability does not advance",
    input: largeMarketLowCoachability,
    assert: result =>
      result.recommendation !== "ADVANCE" &&
      result.coachabilityScore < 40 &&
      result.risks.some(risk => risk.includes("Large market"))
  },
  {
    name: "High energy with low character is rejected",
    input: highEnergyLowCharacter,
    assert: result =>
      result.recommendation === "REJECT" &&
      result.risks.some(risk => risk.includes("High energy"))
  },
  {
    name: "Incomplete data reduces confidence",
    input: incompleteData,
    assert: result => result.confidence < 40 && result.recommendation !== "ADVANCE"
  },
  {
    name: "Contradictory signals trigger watch",
    input: contradictorySignals,
    assert: result =>
      result.recommendation === "WATCH" &&
      result.managerAction === "Proceed to Additional Interview"
  }
];

function hasRequiredShape(result) {
  return (
    typeof result.overallScore === "number" &&
    typeof result.hardFactorScore === "number" &&
    typeof result.vitalFactorScore === "number" &&
    typeof result.coachabilityScore === "number" &&
    typeof result.marketQualityScore === "number" &&
    Array.isArray(result.strengths) &&
    Array.isArray(result.risks) &&
    ["ADVANCE", "WATCH", "COACH", "REJECT"].includes(result.recommendation) &&
    [
      "Proceed to Career Interview",
      "Proceed to Additional Interview",
      "Assign Coaching",
      "Review Candidate",
      "Reject Candidate"
    ].includes(result.managerAction) &&
    typeof result.confidence === "number"
  );
}

let pass = 0;

fixtures.forEach(fixture => {
  const result = evaluateCandidateAssessment(fixture.input);
  const ok = hasRequiredShape(result) && fixture.assert(result);

  console.log(`${ok ? "PASS" : "FAIL"} ${fixture.name}`);
  console.log(`   Overall: ${result.overallScore}`);
  console.log(`   Recommendation: ${result.recommendation}`);
  console.log(`   Manager Action: ${result.managerAction}`);
  console.log(`   Confidence: ${result.confidence}`);

  if (ok) pass++;
});

console.log("\nResumen:");
console.log(`Total: ${fixtures.length}`);
console.log(`Pass: ${pass}`);
console.log(`Fail: ${fixtures.length - pass}`);

if (pass !== fixtures.length) {
  console.log("\nCANDIDATE ASSESSMENT MASTER TEST NEEDS REVIEW");
  process.exit(1);
}

console.log("\nCANDIDATE ASSESSMENT MASTER TEST PASS");
