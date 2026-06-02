const {
  detectRelationshipOpportunities,
  calculateRelationshipScore
} = require("./relationship-opportunity-engine");

console.log("\nFORGE RELATIONSHIP OPPORTUNITY ENGINE TEST v0.3\n");

const client = {
  id: "CLIENT_MARIA_001",
  name: "María",
  age: 39,
  maritalStatus: "Casada",
  children: 2
};

const policies = [
  {
    id: "POL-GMM-001",
    productName: "GMM Individual",
    lineOfBusiness: "GMM",
    nextReviewDate: "2026-06-15",
    clientSatisfaction: 9,
    reviewCompleted: true
  }
];

const timeline = [
  {
    date: "2026-06-10",
    type: "REFERRAL_OPPORTUNITY",
    priority: "MEDIUM",
    description: "Cliente satisfecho"
  },
  {
    date: "2026-06-15",
    type: "POLICY_REVIEW",
    priority: "MEDIUM",
    description: "Revisión recomendada"
  },
  {
    date: "2026-06-20",
    type: "LIFE_EVENT",
    priority: "HIGH",
    description: "Nuevo hijo"
  }
];

const relationshipHistory = [
  {
    date: "2026-05-01",
    direction: "OUTBOUND",
    message: "Revision anual"
  },
  {
    date: "2026-05-01",
    direction: "INBOUND",
    message: "Claro"
  }
];

const result = detectRelationshipOpportunities({
  client,
  policies,
  relationshipHistory,
  timeline
});

const emptyResult = detectRelationshipOpportunities({
  client: {
    id: "CLIENT_EMPTY",
    age: 28,
    children: 0
  },
  policies: [
    {
      productName: "Vida Proteccion",
      lineOfBusiness: "VIDA"
    },
    {
      productName: "GMM Individual",
      lineOfBusiness: "GMM"
    },
    {
      productName: "Plan Retiro",
      lineOfBusiness: "RETIRO"
    }
  ],
  relationshipHistory: [],
  timeline: []
});

console.log("Relationship Opportunity Report\n");
console.log(`Client: ${result.clientId}`);
console.log(`Score: ${result.relationshipScore}`);
console.log(`Best: ${result.bestOpportunity.type}`);
console.log("\nOpportunities\n");
result.opportunities.forEach(item => {
  console.log(`${item.priority} | ${item.confidence} | ${item.type} | ${item.recommendedAction}`);
});

const opportunityTypes = result.opportunities.map(item => item.type);

const tests = [
  {
    name: "Referral opportunity",
    pass: opportunityTypes.includes("REFERRAL_OPPORTUNITY")
  },
  {
    name: "Policy review opportunity",
    pass: opportunityTypes.includes("REVIEW_OPPORTUNITY")
  },
  {
    name: "Protection gap",
    pass: opportunityTypes.includes("PROTECTION_GAP")
  },
  {
    name: "Retirement gap",
    pass: opportunityTypes.includes("RETIREMENT_GAP")
  },
  {
    name: "Education gap",
    pass: opportunityTypes.includes("EDUCATION_GAP")
  },
  {
    name: "Opportunity ranking",
    pass:
      result.opportunities[0].priority === "HIGH" &&
      result.opportunities[0].confidence >= result.opportunities[1].confidence
  },
  {
    name: "Relationship score",
    pass:
      result.relationshipScore > 50 &&
      calculateRelationshipScore({
        client,
        policies,
        relationshipHistory,
        timeline
      }) === result.relationshipScore
  },
  {
    name: "Best opportunity selection",
    pass:
      !!result.bestOpportunity &&
      result.bestOpportunity.type === result.opportunities[0].type
  },
  {
    name: "Empty opportunity scenario",
    pass:
      emptyResult.opportunities.length === 0 &&
      emptyResult.bestOpportunity === null
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
  console.log("\n✅ RELATIONSHIP OPPORTUNITY ENGINE v0.3 PASS");
} else {
  console.log("\n❌ RELATIONSHIP OPPORTUNITY ENGINE NEEDS REVIEW");
  process.exit(1);
}
