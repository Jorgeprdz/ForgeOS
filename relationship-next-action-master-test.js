const {
  buildRelationshipNextAction
} = require("./relationship-next-action-engine");

console.log("\nFORGE RELATIONSHIP NEXT ACTION ENGINE TEST v0.2\n");

const now = "2026-06-02T12:00:00.000Z";
const client = {
  id: "CLIENT_MARIA_001",
  name: "María",
  preferredChannel: "WHATSAPP"
};

function buildActionFor(event, overrides = {}) {
  return buildRelationshipNextAction({
    now,
    client,
    timeline: [event],
    policies: [],
    relationshipHistory: [],
    ...overrides
  });
}

const birthdayAction = buildActionFor({
  date: "2026-06-05",
  type: "BIRTHDAY",
  priority: "MEDIUM",
  description: "Cumpleaños de María"
});

const renewalAction = buildActionFor({
  date: "2026-06-20",
  type: "POLICY_RENEWAL",
  priority: "HIGH",
  description: "Renovación próxima"
});

const paymentAction = buildActionFor({
  date: "2026-06-04",
  type: "PAYMENT_DUE",
  priority: "HIGH",
  description: "Pago próximo"
});

const reviewAction = buildActionFor({
  date: "2026-06-15",
  type: "POLICY_REVIEW",
  priority: "MEDIUM",
  description: "Review recomendado"
});

const referralAction = buildActionFor({
  date: "2026-06-06",
  type: "REFERRAL_OPPORTUNITY",
  priority: "MEDIUM",
  description: "Cliente satisfecho"
});

const criticalAction = buildActionFor({
  date: "2026-05-30",
  type: "PAYMENT_OVERDUE",
  priority: "HIGH",
  description: "Pago vencido"
});

const noAction = buildRelationshipNextAction({
  now,
  client,
  timeline: [],
  policies: [],
  relationshipHistory: []
});

console.log("Relationship Next Action Samples\n");
console.log(`Birthday: ${birthdayAction.nextAction} / ${birthdayAction.recommendedChannel}`);
console.log(`Renewal: ${renewalAction.nextAction} / ${renewalAction.urgency}`);
console.log(`Payment: ${paymentAction.nextAction} / ${paymentAction.priority}`);
console.log(`Review: ${reviewAction.nextAction} / ${reviewAction.recommendedChannel}`);
console.log(`Referral: ${referralAction.nextAction} / ${referralAction.relationshipValue}`);
console.log(`Critical: ${criticalAction.nextAction} / ${criticalAction.priority}`);
console.log(`No Action: ${noAction.nextAction}`);

const tests = [
  {
    name: "Birthday → CHECK_IN",
    pass: birthdayAction.nextAction === "CHECK_IN"
  },
  {
    name: "Renewal → RENEWAL_REVIEW",
    pass: renewalAction.nextAction === "RENEWAL_REVIEW"
  },
  {
    name: "Payment Due → PAYMENT_REMINDER",
    pass: paymentAction.nextAction === "PAYMENT_REMINDER"
  },
  {
    name: "Review Opportunity → SCHEDULE_REVIEW",
    pass: reviewAction.nextAction === "SCHEDULE_REVIEW"
  },
  {
    name: "Referral Opportunity → ASK_FOR_REFERRALS",
    pass: referralAction.nextAction === "ASK_FOR_REFERRALS"
  },
  {
    name: "Critical Priority",
    pass:
      criticalAction.priority === "CRITICAL" &&
      criticalAction.urgency === "TODAY"
  },
  {
    name: "Channel Selection",
    pass:
      criticalAction.recommendedChannel === "CALL" &&
      reviewAction.recommendedChannel === "MEETING" &&
      paymentAction.recommendedChannel === "WHATSAPP"
  },
  {
    name: "Timing Selection",
    pass:
      birthdayAction.suggestedTiming === "THIS_WEEK" &&
      renewalAction.suggestedTiming === "THIS_WEEK" &&
      paymentAction.suggestedTiming === "TODAY"
  },
  {
    name: "No Action Scenario",
    pass:
      noAction.nextAction === "NO_ACTION" &&
      noAction.priority === "LOW"
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
  console.log("\n✅ RELATIONSHIP NEXT ACTION ENGINE v0.2 PASS");
} else {
  console.log("\n❌ RELATIONSHIP NEXT ACTION ENGINE NEEDS REVIEW");
  process.exit(1);
}
