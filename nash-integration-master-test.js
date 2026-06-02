const { runNash } = require("./nash-core-engine");

console.log("\nFORGE NASH INTEGRATION TEST v0.2\n");

const result = runNash({
  source: "manual",
  channel: "whatsapp",
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

console.log("Personalidad\n");
console.log(`Tipo: ${result.personality.personality}`);
console.log(`Confianza: ${result.personality.confidence}`);
console.log(`Motivadores: ${result.personality.motivators.join(", ")}`);

console.log("\nPrimer mensaje\n");
console.log(result.recommendation.firstMessage);

console.log("\nFollowup\n");
console.log(result.followup.followupMessage);
console.log(`Timing: ${result.followup.followupTiming}`);
console.log(`Objetivo: ${result.followup.followupGoal}`);

const tests = [
  {
    name: "Integra Personality Engine",
    pass: result.personality.personality === "PROTECTOR"
  },
  {
    name: "Devuelve motivadores",
    pass: result.personality.motivators.includes("FAMILIA")
  },
  {
    name: "Mantiene primer mensaje",
    pass: result.recommendation.firstMessage.length > 80
  },
  {
    name: "Incluye followup",
    pass: result.followup.followupMessage.length > 50
  },
  {
    name: "Followup no vende producto",
    pass: !/póliza|seguro de vida|retiro/i.test(result.followup.followupMessage)
  },
  {
    name: "Next action existe",
    pass: result.recommendation.nextBestAction.length > 20
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
  console.log("\n✅ NASH INTEGRATION v0.2 PASS");
} else {
  console.log("\n❌ NASH INTEGRATION NEEDS REVIEW");
}
