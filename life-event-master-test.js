const {
  detectLifeEvents
} = require("./life-event-engine");

console.log("\nFORGE LIFE EVENT ENGINE TEST v0.4\n");

const report = detectLifeEvents({
  client: {
    id: "CLIENT_MARIA_001",
    name: "María",
    age: 57,
    maritalStatus: "Casada",
    children: 1,
    occupation: "Dueña de empresa",
    notes: [
      "Compró casa con hipoteca",
      "Su hijo entra a la universidad",
      "Cambio de trabajo reciente",
      "Está pensando en retiro"
    ],
    lifeEvents: [
      {
        type: "DIVORCE",
        description: "Divorcio previo con cambio de beneficiarios"
      }
    ]
  },
  policies: [],
  relationshipHistory: [
    {
      message: "Me casé hace unos años y ahora tenemos un bebé."
    }
  ],
  timeline: [
    {
      type: "LIFE_EVENT",
      description: "Hito educativo familiar",
      priority: "HIGH",
      date: "2026-06-20"
    }
  ]
});

const unknownReport = detectLifeEvents({
  client: {
    id: "CLIENT_UNKNOWN",
    age: 30
  },
  policies: [],
  relationshipHistory: [],
  timeline: []
});

const eventTypes = report.detectedEvents.map(event => event.type);

console.log("Life Event Report\n");
console.log(`Client: ${report.clientId}`);
console.log(`Confidence: ${report.confidence}`);
console.log(`Events: ${eventTypes.join(", ")}`);
console.log(`Review Areas: ${report.recommendedReviewAreas.join(", ")}`);
console.log(`Impact: ${report.relationshipImpact}`);

const tests = [
  {
    name: "Detecta MARRIAGE",
    pass: eventTypes.includes("MARRIAGE")
  },
  {
    name: "Detecta NEW_CHILD",
    pass: eventTypes.includes("NEW_CHILD")
  },
  {
    name: "Detecta JOB_CHANGE",
    pass: eventTypes.includes("JOB_CHANGE")
  },
  {
    name: "Detecta HOME_PURCHASE",
    pass: eventTypes.includes("HOME_PURCHASE")
  },
  {
    name: "Detecta RETIREMENT_NEAR",
    pass: eventTypes.includes("RETIREMENT_NEAR")
  },
  {
    name: "Detecta BUSINESS_OWNER",
    pass: eventTypes.includes("BUSINESS_OWNER")
  },
  {
    name: "Detecta DIVORCE",
    pass: eventTypes.includes("DIVORCE")
  },
  {
    name: "Detecta EDUCATION_MILESTONE",
    pass: eventTypes.includes("EDUCATION_MILESTONE")
  },
  {
    name: "Incluye review areas",
    pass:
      report.recommendedReviewAreas.includes("PROTECTION") &&
      report.recommendedReviewAreas.includes("EDUCATION") &&
      report.recommendedReviewAreas.includes("RETIREMENT")
  },
  {
    name: "Incluye relationship impact",
    pass: report.relationshipImpact.length > 40
  },
  {
    name: "UNKNOWN sin evidencia suficiente",
    pass:
      unknownReport.detectedEvents.length === 1 &&
      unknownReport.detectedEvents[0].type === "UNKNOWN" &&
      unknownReport.confidence === 0
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
  console.log("\n✅ LIFE EVENT ENGINE v0.4 PASS");
} else {
  console.log("\n❌ LIFE EVENT ENGINE NEEDS REVIEW");
  process.exit(1);
}
