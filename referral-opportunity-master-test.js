const {
  detectReferralOpportunity,
  detectarMomentoReferido
} = require("./referral-opportunity-engine");

console.log("\nFORGE REFERRAL OPPORTUNITY ENGINE TEST v0.5\n");

const report = detectReferralOpportunity({
  now: "2026-06-02",
  client: {
    id: "CLIENT_MARIA_001",
    name: "María",
    clientSince: "2020-01-01",
    clientSatisfaction: 10,
    claimPaid: true,
    reviewCompleted: true,
    policyCount: 2,
    relationshipScore: 88
  },
  timeline: [
    {
      type: "REFERRAL_OPPORTUNITY",
      priority: "MEDIUM",
      description: "Cliente satisfecho"
    }
  ],
  opportunities: [
    {
      type: "REFERRAL_OPPORTUNITY",
      confidence: 85,
      priority: "MEDIUM"
    }
  ],
  lifeEvents: [
    {
      type: "NEW_CHILD",
      confidence: 80
    }
  ],
  relationshipHistory: [
    {
      direction: "INBOUND",
      message: "Excelente servicio, gracias"
    }
  ]
});

const lowReport = detectReferralOpportunity({
  client: {
    id: "CLIENT_LOW",
    clientSince: "2026-01-01",
    clientSatisfaction: 5,
    policyCount: 1
  },
  timeline: [],
  opportunities: [],
  lifeEvents: [],
  relationshipHistory: []
});

console.log("Referral Opportunity Report\n");
console.log(`Client: ${report.clientId}`);
console.log(`Score: ${report.referralScore}`);
console.log(`Likelihood: ${report.referralLikelihood}`);
console.log(`Signals: ${report.referralSignals.join(", ")}`);
console.log(`Timing: ${report.recommendedTiming}`);
console.log(`Approach: ${report.recommendedApproach}`);
console.log(`Confidence: ${report.confidence}`);

const tests = [
  {
    name: "Long-term client",
    pass: report.referralSignals.includes("LONG_TERM_CLIENT")
  },
  {
    name: "Multiple policies",
    pass: report.referralSignals.includes("MULTIPLE_POLICIES")
  },
  {
    name: "Positive interaction",
    pass: report.referralSignals.includes("POSITIVE_INTERACTION")
  },
  {
    name: "Successful claim",
    pass: report.referralSignals.includes("SUCCESSFUL_CLAIM")
  },
  {
    name: "Life event",
    pass: report.referralSignals.includes("LIFE_EVENT_DETECTED")
  },
  {
    name: "High relationship score",
    pass: report.referralSignals.includes("HIGH_RELATIONSHIP_SCORE")
  },
  {
    name: "Referral score",
    pass: report.referralScore >= 85
  },
  {
    name: "Referral likelihood",
    pass: report.referralLikelihood === "VERY_HIGH"
  },
  {
    name: "Recommended timing",
    pass: report.recommendedTiming === "AFTER_CLAIM"
  },
  {
    name: "Confidence",
    pass: report.confidence >= 80
  },
  {
    name: "Low signal scenario",
    pass:
      lowReport.referralLikelihood === "LOW" &&
      lowReport.recommendedTiming === "WAIT"
  },
  {
    name: "Compatibilidad función previa",
    pass:
      detectarMomentoReferido({
        clientSatisfaction: 10
      }) === "HIGH"
  }
];

console.log("\nResultados\n");

tests.forEach(test => {
  console.log(`${test.pass ? "✅" : "❌"} ${test.name}`);
});

const pass = tests.filter(t => t.pass).length;
const fail = tests.length - pass;

console.log("\nResumen:");
console.log(`Total: ${tests.length}`);
console.log(`Pass: ${pass}`);
console.log(`Fail: ${fail}`);

if (fail === 0) {
  console.log("\n✅ REFERRAL OPPORTUNITY ENGINE v0.5 PASS");
} else {
  console.log("\n❌ REFERRAL OPPORTUNITY ENGINE NEEDS REVIEW");
  process.exit(1);
}
