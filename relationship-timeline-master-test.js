const {
  buildRelationshipTimeline
} = require("./relationship-timeline-engine");

console.log("\nFORGE RELATIONSHIP TIMELINE ENGINE TEST v0.1\n");

const result = buildRelationshipTimeline({
  now: "2026-06-02T12:00:00.000Z",
  clientId: "CLIENT_MARIA_001",
  profile: {
    name: "María",
    birthDate: "1988-06-10",
    anniversaryDate: "2020-08-15",
    lifeEvents: [
      {
        date: "2026-06-20",
        description: "Nacimiento de hijo",
        priority: "HIGH"
      }
    ]
  },
  policies: [
    {
      id: "POL-VIDA-001",
      policyNumber: "VIDA-001",
      renewalDate: "2026-06-25",
      nextReviewDate: "2026-06-15",
      nextPaymentDate: "2026-06-05",
      paymentStatus: "ACTIVE",
      policyIssued: true,
      clientSatisfaction: 9
    },
    {
      id: "POL-GMM-001",
      policyNumber: "GMM-001",
      renewalDate: "2026-09-01",
      paymentOverdueDate: "2026-05-28",
      paymentStatus: "OVERDUE"
    }
  ],
  events: [
    {
      date: "2026-06-18",
      type: "POLICY_REVIEW",
      description: "Review manual de cobertura"
    }
  ]
});

console.log("Relationship Timeline Report\n");
console.log(`Client: ${result.clientId}`);
console.log(`Health: ${result.relationshipHealth}`);
console.log(`Next Event: ${result.nextRelationshipEvent.type} / ${result.nextRelationshipEvent.date}`);
console.log(`Opportunities: ${result.relationshipOpportunities.length}`);

console.log("\nTimeline\n");
result.timeline.forEach(event => {
  console.log(`${event.date} | ${event.priority} | ${event.type} | ${event.description}`);
});

const eventTypes = result.timeline.map(event => event.type);
const dates = result.timeline.map(event => event.date).filter(Boolean);
const sortedDates = dates.slice().sort();

const tests = [
  {
    name: "Birthday event",
    pass: eventTypes.includes("BIRTHDAY")
  },
  {
    name: "Renewal event",
    pass: eventTypes.includes("POLICY_RENEWAL")
  },
  {
    name: "Payment event",
    pass:
      eventTypes.includes("PAYMENT_DUE") &&
      eventTypes.includes("PAYMENT_OVERDUE")
  },
  {
    name: "Review event",
    pass: eventTypes.includes("POLICY_REVIEW")
  },
  {
    name: "Referral opportunity",
    pass: eventTypes.includes("REFERRAL_OPPORTUNITY")
  },
  {
    name: "Timeline ordering",
    pass: JSON.stringify(dates) === JSON.stringify(sortedDates)
  },
  {
    name: "Relationship health",
    pass: result.relationshipHealth === "RED"
  },
  {
    name: "Next relationship event",
    pass:
      result.nextRelationshipEvent &&
      result.nextRelationshipEvent.type === "PAYMENT_DUE"
  },
  {
    name: "Relationship opportunities",
    pass:
      Array.isArray(result.relationshipOpportunities) &&
      result.relationshipOpportunities.length >= 5
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
  console.log("\n✅ RELATIONSHIP TIMELINE ENGINE v0.1 PASS");
} else {
  console.log("\n❌ RELATIONSHIP TIMELINE ENGINE NEEDS REVIEW");
  process.exit(1);
}
