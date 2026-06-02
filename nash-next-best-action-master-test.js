const { buildNextBestAction } = require("./nash-next-best-action-engine");

console.log("\nFORGE NASH NEXT BEST ACTION TEST v0.1\n");

const fixtures = [
  {
    name: "Prospecto nuevo → primer mensaje",
    input: {
      responseStatus: "NEW",
      personality: "PROTECTOR"
    },
    expected: "SEND_FIRST_MESSAGE"
  },
  {
    name: "No respuesta 3 días → followup",
    input: {
      responseStatus: "NO_RESPONSE",
      daysSinceContact: 3,
      personality: "PROTECTOR"
    },
    expected: "SEND_FOLLOWUP"
  },
  {
    name: "Objeción activa → combat",
    input: {
      responseStatus: "RESPONDED",
      objectionType: "FINANCIAL",
      objectionIntent: "VALUE_NOT_CLEAR",
      personality: "ANALYTICAL"
    },
    expected: "HANDLE_OBJECTION"
  },
  {
    name: "Interés alto → cita",
    input: {
      responseStatus: "RESPONDED",
      interestLevel: "HIGH",
      personality: "RELATIONAL"
    },
    expected: "SCHEDULE_APPOINTMENT"
  },
  {
    name: "Cumpleaños → relación",
    input: {
      responseStatus: "CLIENT",
      relationshipEvent: "BIRTHDAY",
      personality: "RELATIONAL"
    },
    expected: "SEND_RELATIONSHIP_MESSAGE"
  },
  {
    name: "No respuesta 9 días → reactivación",
    input: {
      responseStatus: "NO_RESPONSE",
      daysSinceContact: 9,
      personality: "VISIONARY"
    },
    expected: "REACTIVATE_PROSPECT"
  }
];

let pass = 0;

fixtures.forEach(item => {
  const result = buildNextBestAction(item.input);
  const ok = result.action === item.expected;

  console.log(`${ok ? "✅" : "❌"} ${item.name}`);
  console.log(`   Acción: ${result.action}`);
  console.log(`   Prioridad: ${result.priority}`);
  console.log(`   Timing: ${result.timing}`);
  console.log(`   Razón: ${result.reason}`);

  if (ok) pass++;
});

console.log("\nResumen:");
console.log(`Total: ${fixtures.length}`);
console.log(`Pass: ${pass}`);
console.log(`Fail: ${fixtures.length - pass}`);

if (pass === fixtures.length) {
  console.log("\n✅ NASH NEXT BEST ACTION v0.1 PASS");
} else {
  console.log("\n❌ NASH NEXT BEST ACTION NEEDS REVIEW");
}
