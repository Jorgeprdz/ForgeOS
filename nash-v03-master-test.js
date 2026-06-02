const { runNash } = require("./nash-core-engine");

console.log("\nFORGE NASH MASTER TEST v0.3\n");

const result = runNash({
  source: "manual",
  channel: "whatsapp",
  responseStatus: "NO_RESPONSE",
  daysSinceContact: 3,
  prospect: {
    name: "María",
    age: 37,
    occupation: "Arquitecta",
    maritalStatus: "Casada",
    children: 2
  },
  notes: [
    "Tiene hijos",
    "Le importa su familia",
    "Quiere tranquilidad",
    "Perfil profesional"
  ]
});

console.log("NASH Report\n");
console.log(`Prospecto: ${result.context.name}`);
console.log(`Personalidad: ${result.personality.personality}`);
console.log(`Motivadores: ${result.personality.motivators.join(", ")}`);
console.log(`Primer mensaje: ${result.recommendation.firstMessage.slice(0, 90)}...`);
console.log(`Followup: ${result.followup.followupMessage.slice(0, 90)}...`);

console.log("\nNext Best Action\n");
console.log(`Acción: ${result.nextBestAction.action}`);
console.log(`Prioridad: ${result.nextBestAction.priority}`);
console.log(`Timing: ${result.nextBestAction.timing}`);
console.log(`Razón: ${result.nextBestAction.reason}`);
console.log(`Estilo: ${result.nextBestAction.recommendedStyle}`);

const tests = [
  {
    name: "NASH integra contexto",
    pass: result.context.name === "María"
  },
  {
    name: "NASH integra personalidad",
    pass: result.personality.personality === "PROTECTOR"
  },
  {
    name: "NASH mantiene primer mensaje",
    pass: result.recommendation.firstMessage.length > 80
  },
  {
    name: "NASH mantiene followup",
    pass: result.followup.followupMessage.length > 50
  },
  {
    name: "NASH genera next best action",
    pass: result.nextBestAction.action === "SEND_FOLLOWUP"
  },
  {
    name: "Next best action tiene razón",
    pass: result.nextBestAction.reason.length > 20
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
  console.log("\n✅ NASH MASTER v0.3 PASS");
} else {
  console.log("\n❌ NASH MASTER v0.3 NEEDS REVIEW");
}
