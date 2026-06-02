const { buildRelationshipReview } = require("./relationship-review-engine");

console.log("\nFORGE RELATIONSHIP REVIEW ENGINE TEST v1.0\n");

const paymentReport = buildRelationshipReview({
  timeline: [
    {
      type: "PAYMENT_OVERDUE",
      priority: "HIGH",
      date: "2026-06-01"
    }
  ],
  opportunities: [],
  lifeEvents: []
});

const gapReport = buildRelationshipReview({
  timeline: [
    {
      type: "POLICY_REVIEW",
      priority: "MEDIUM",
      date: "2026-06-15"
    }
  ],
  opportunities: [
    {
      type: "PROTECTION_GAP",
      priority: "HIGH"
    },
    {
      type: "REFERRAL_OPPORTUNITY",
      priority: "MEDIUM"
    }
  ],
  lifeEvents: [
    {
      type: "NEW_CHILD",
      confidence: 80
    }
  ]
});

const emptyReport = buildRelationshipReview({
  timeline: [],
  opportunities: [],
  lifeEvents: []
});

console.log(`Payment Review Needed: ${paymentReport.reviewNeeded}`);
console.log(`Payment Urgency: ${paymentReport.urgency}`);
console.log(`Gap Topics: ${gapReport.suggestedTopics.join(", ")}`);

const tests = [
  {
    name: "Genera reporte",
    pass: paymentReport.engine === "RELATIONSHIP_REVIEW_ENGINE"
  },
  {
    name: "Detecta review needed por pago vencido",
    pass: paymentReport.reviewNeeded === true
  },
  {
    name: "Marca urgencia TODAY",
    pass: paymentReport.urgency === "TODAY"
  },
  {
    name: "Detecta review por gap",
    pass: gapReport.reviewNeeded === true
  },
  {
    name: "Incluye temas sugeridos",
    pass:
      gapReport.suggestedTopics.includes("PROTECTION_GAP") &&
      gapReport.suggestedTopics.includes("NEW_CHILD")
  },
  {
    name: "Incluye conversacion de referido",
    pass: gapReport.suggestedTopics.includes("REFERRAL_CONVERSATION")
  },
  {
    name: "Escenario sin accion",
    pass: emptyReport.reviewNeeded === false
  },
  {
    name: "Sin accion usa urgencia LOW",
    pass: emptyReport.urgency === "LOW"
  }
];

console.log("\nResultados\n");

tests.forEach(test => {
  console.log(`${test.pass ? "PASS" : "FAIL"} ${test.name}`);
});

const pass = tests.filter(test => test.pass).length;
const fail = tests.length - pass;

console.log("\nResumen:");
console.log(`Total: ${tests.length}`);
console.log(`Pass: ${pass}`);
console.log(`Fail: ${fail}`);

if (fail === 0) {
  console.log("\nRELATIONSHIP REVIEW ENGINE v1.0 PASS");
} else {
  console.log("\nRELATIONSHIP REVIEW ENGINE NEEDS REVIEW");
  process.exitCode = 1;
}
