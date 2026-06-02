const { buildRelationshipTimeline } = require("./relationship-timeline-engine");
const { buildRelationshipNextAction } = require("./relationship-next-action-engine");
const { detectRelationshipOpportunities } = require("./relationship-opportunity-engine");
const { detectLifeEvents } = require("./life-event-engine");
const { detectReferralOpportunity } = require("./referral-opportunity-engine");
const { buildRelationshipHealth } = require("./relationship-health-engine");
const { buildClientEngagement } = require("./client-engagement-engine");
const { buildRelationshipReview } = require("./relationship-review-engine");
const { buildRelationshipMaster } = require("./relationship-master-engine");

console.log("\nFORGE RELATIONSHIP INTELLIGENCE FOUNDATION ACCEPTANCE TEST v1.0\n");

const now = "2026-06-02T12:00:00.000Z";

const client = {
  id: "CLIENT_MARIA_001",
  name: "María",
  age: 38,
  maritalStatus: "Casada",
  children: 2,
  birthDate: "1988-06-10",
  clientSince: "2020-01-15",
  clientSatisfaction: 10,
  preferredChannel: "WHATSAPP",
  notes: "Interacción positiva reciente. Nuevo hijo en la familia."
};

const policies = [
  {
    id: "POL-VIDA-001",
    productName: "Vida Protección",
    policyNumber: "VIDA-001",
    renewalDate: "2026-06-25",
    nextReviewDate: "2026-06-15",
    nextPaymentDate: "2026-06-07",
    policyIssued: true,
    clientSatisfaction: 10
  },
  {
    id: "POL-GMM-001",
    productName: "GMM Familiar",
    policyNumber: "GMM-001",
    renewalDate: "2026-09-01",
    nextReviewDate: "2026-08-01",
    reviewCompleted: true,
    clientSatisfaction: 9
  }
];

const relationshipHistory = [
  {
    date: "2026-06-01",
    direction: "INBOUND",
    message: "Excelente, gracias por estar al pendiente.",
    outcome: "POSITIVE"
  },
  {
    date: "2026-05-20",
    direction: "OUTBOUND",
    message: "Revisión enviada.",
    outcome: "RESPONDED"
  }
];

const events = [
  {
    date: "2026-06-20",
    type: "LIFE_EVENT",
    priority: "HIGH",
    description: "Nuevo hijo en la familia."
  }
];

const timelineReport = buildRelationshipTimeline({
  clientId: client.id,
  profile: client,
  policies,
  events,
  now
});

const nextAction = buildRelationshipNextAction({
  client,
  timeline: timelineReport.timeline,
  policies,
  relationshipHistory,
  now
});

const opportunityReport = detectRelationshipOpportunities({
  client,
  policies,
  relationshipHistory,
  timeline: timelineReport.timeline
});

const lifeEventReport = detectLifeEvents({
  client,
  policies,
  relationshipHistory,
  timeline: timelineReport.timeline,
  events,
  now
});

const referralOpportunity = detectReferralOpportunity({
  client: {
    ...client,
    policyCount: policies.length
  },
  timeline: timelineReport.timeline,
  opportunities: opportunityReport.opportunities,
  lifeEvents: lifeEventReport.detectedEvents,
  relationshipHistory,
  relationshipScore: opportunityReport.relationshipScore,
  policyCount: policies.length,
  now
});

const relationshipHealth = buildRelationshipHealth({
  timeline: timelineReport.timeline,
  opportunities: opportunityReport.opportunities,
  relationshipHistory,
  policies
});

const engagement = buildClientEngagement({
  relationshipHistory,
  now
});

const reviewRecommendation = buildRelationshipReview({
  client,
  policies,
  timeline: timelineReport.timeline,
  opportunities: opportunityReport.opportunities,
  lifeEvents: lifeEventReport.detectedEvents
});

const masterReport = buildRelationshipMaster({
  client,
  policies,
  relationshipHistory,
  events,
  now
});

console.log("=========================");
console.log("RELATIONSHIP MASTER REPORT");
console.log("=========================");
console.log(`Client: ${client.name}`);
console.log(`Next Action: ${masterReport.nextAction.nextAction}`);
console.log(`Action Reason: ${masterReport.nextAction.actionReason}`);
console.log(`Opportunities: ${masterReport.opportunities.map(item => item.type).join(", ")}`);
console.log(`Life Events: ${masterReport.lifeEvents.detectedEvents.map(item => item.type).join(", ")}`);
console.log(`Referral Likelihood: ${masterReport.referralOpportunity.referralLikelihood}`);
console.log(`Relationship Health: ${masterReport.relationshipHealth.relationshipHealth}`);
console.log(`Engagement Score: ${masterReport.engagement.engagementScore}`);
console.log(`Review Needed: ${masterReport.reviewRecommendation.reviewNeeded}`);
console.log(`Confidence: ${masterReport.confidence}`);

const tests = [
  {
    name: "Timeline",
    pass: timelineReport.timeline.length > 0
  },
  {
    name: "Next Action",
    pass: !!nextAction.nextAction
  },
  {
    name: "Opportunity",
    pass: opportunityReport.opportunities.length > 0
  },
  {
    name: "Life Event",
    pass: lifeEventReport.detectedEvents.some(item => item.type !== "UNKNOWN")
  },
  {
    name: "Referral",
    pass: ["HIGH", "VERY_HIGH"].includes(referralOpportunity.referralLikelihood)
  },
  {
    name: "Health",
    pass: !!relationshipHealth.relationshipHealth
  },
  {
    name: "Engagement",
    pass: engagement.engagementScore > 0 && !!engagement.lastInteraction
  },
  {
    name: "Review",
    pass: reviewRecommendation.reviewNeeded === true
  },
  {
    name: "Master Orchestration",
    pass:
      masterReport.engine === "RELATIONSHIP_MASTER_ENGINE" &&
      masterReport.clientId === client.id &&
      !!masterReport.nextAction.nextAction &&
      masterReport.opportunities.length > 0 &&
      masterReport.confidence > 0
  }
];

console.log("\nResultados\n");

tests.forEach(test => {
  console.log(`${test.pass ? "✅" : "❌"} ${test.name}`);
});

const pass = tests.filter(test => test.pass).length;
const fail = tests.length - pass;
const coverage = `${Math.round((pass / tests.length) * 100)}%`;

console.log("\nResumen:");
console.log(`Total Tests: ${tests.length}`);
console.log(`Pass: ${pass}`);
console.log(`Fail: ${fail}`);
console.log(`Coverage: ${coverage}`);

if (fail === 0) {
  console.log("\n✅ RELATIONSHIP INTELLIGENCE FOUNDATION READY");
} else {
  console.log("\n❌ RELATIONSHIP INTELLIGENCE FOUNDATION NEEDS REVIEW");
}
