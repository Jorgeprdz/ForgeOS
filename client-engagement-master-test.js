const { buildClientEngagement } = require("./client-engagement-engine");

console.log("\nFORGE CLIENT ENGAGEMENT ENGINE TEST v1.0\n");

const now = "2026-06-02T12:00:00.000Z";

const recentReport = buildClientEngagement({
  now,
  relationshipHistory: [
    {
      date: "2026-06-01",
      direction: "INBOUND",
      message: "Excelente, gracias.",
      outcome: "POSITIVE"
    },
    {
      date: "2026-05-20",
      direction: "OUTBOUND",
      outcome: "RESPONDED"
    }
  ]
});

const mediumReport = buildClientEngagement({
  now,
  relationshipHistory: [
    {
      date: "2026-05-10",
      direction: "OUTBOUND",
      outcome: "RESPONDED"
    }
  ]
});

const highReport = buildClientEngagement({
  now,
  relationshipHistory: [
    {
      date: "2026-04-20",
      direction: "OUTBOUND",
      outcome: "NO_RESPONSE"
    }
  ]
});

const noHistoryReport = buildClientEngagement({
  now,
  relationshipHistory: []
});

console.log(`Recent Score: ${recentReport.engagementScore}`);
console.log(`Recent Risk: ${recentReport.inactivityRisk}`);
console.log(`No History Risk: ${noHistoryReport.inactivityRisk}`);

const tests = [
  {
    name: "Genera reporte",
    pass: recentReport.engine === "CLIENT_ENGAGEMENT_ENGINE"
  },
  {
    name: "Calcula engagement score",
    pass: recentReport.engagementScore > 0
  },
  {
    name: "Detecta ultima interaccion",
    pass: recentReport.lastInteraction.date === "2026-06-01"
  },
  {
    name: "Detecta LOW inactivity risk",
    pass: recentReport.inactivityRisk === "LOW"
  },
  {
    name: "Detecta MEDIUM inactivity risk",
    pass: mediumReport.inactivityRisk === "MEDIUM"
  },
  {
    name: "Detecta HIGH inactivity risk",
    pass: highReport.inactivityRisk === "HIGH"
  },
  {
    name: "Detecta CRITICAL sin historial",
    pass: noHistoryReport.inactivityRisk === "CRITICAL"
  },
  {
    name: "Recomienda accion",
    pass: noHistoryReport.recommendedAction === "CALL_CLIENT"
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
  console.log("\nCLIENT ENGAGEMENT ENGINE v1.0 PASS");
} else {
  console.log("\nCLIENT ENGAGEMENT ENGINE NEEDS REVIEW");
  process.exitCode = 1;
}
