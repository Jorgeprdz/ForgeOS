const { buildRelationshipHealth } = require("./relationship-health-engine");

console.log("\nFORGE RELATIONSHIP HEALTH ENGINE TEST v1.0\n");

const redReport = buildRelationshipHealth({
  timeline: [
    {
      type: "PAYMENT_OVERDUE",
      priority: "HIGH",
      date: "2026-06-01",
      description: "Pago vencido"
    }
  ],
  opportunities: [
    {
      type: "REFERRAL_OPPORTUNITY"
    }
  ],
  relationshipHistory: [
    {
      direction: "INBOUND",
      outcome: "RESPONDED"
    }
  ],
  policies: [{ id: "P1" }, { id: "P2" }]
});

const orangeReport = buildRelationshipHealth({
  timeline: [
    {
      type: "POLICY_RENEWAL",
      priority: "HIGH",
      date: "2026-06-20"
    }
  ],
  opportunities: []
});

const yellowReport = buildRelationshipHealth({
  timeline: [
    {
      type: "POLICY_REVIEW",
      priority: "MEDIUM",
      date: "2026-06-15"
    }
  ],
  opportunities: [
    {
      type: "PROTECTION_GAP"
    }
  ]
});

const greenReport = buildRelationshipHealth({
  timeline: [],
  opportunities: [],
  relationshipHistory: []
});

console.log(`RED Health: ${redReport.relationshipHealth}`);
console.log(`ORANGE Health: ${orangeReport.relationshipHealth}`);
console.log(`YELLOW Health: ${yellowReport.relationshipHealth}`);
console.log(`GREEN Health: ${greenReport.relationshipHealth}`);

const tests = [
  {
    name: "Genera reporte",
    pass: redReport.engine === "RELATIONSHIP_HEALTH_ENGINE"
  },
  {
    name: "Detecta RED por pago vencido",
    pass: redReport.relationshipHealth === "RED"
  },
  {
    name: "Detecta ORANGE por renovacion cercana",
    pass: orangeReport.relationshipHealth === "ORANGE"
  },
  {
    name: "Detecta YELLOW por review o gap",
    pass: yellowReport.relationshipHealth === "YELLOW"
  },
  {
    name: "Detecta GREEN sin riesgos",
    pass: greenReport.relationshipHealth === "GREEN"
  },
  {
    name: "Incluye risk factors",
    pass: redReport.riskFactors.includes("PAYMENT_OVERDUE")
  },
  {
    name: "Incluye strengths",
    pass: redReport.strengths.includes("CLIENT_RESPONSIVE")
  },
  {
    name: "Incluye recomendacion",
    pass: redReport.recommendation.length > 20
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
  console.log("\nRELATIONSHIP HEALTH ENGINE v1.0 PASS");
} else {
  console.log("\nRELATIONSHIP HEALTH ENGINE NEEDS REVIEW");
  process.exitCode = 1;
}
