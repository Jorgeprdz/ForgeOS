const { runNash } = require("./nash-core-engine");

console.log("\nFORGE NASH MASTER TEST v0.4\n");

const baseInput = {
  source: "manual",
  channel: "whatsapp",
  responseStatus: "RESPONDED",
  prospect: {
    name: "Maria",
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
};

const objectionResult = runNash({
  ...baseInput,
  responseText: "Esta caro"
});

const infoResult = runNash({
  ...baseInput,
  responseText: "Mandame info"
});

const meetingResult = runNash({
  ...baseInput,
  responseText: "Va, lo vemos manana"
});

console.log("NASH v0.4 Intent Report\n");
console.log(`Objecion: ${objectionResult.intent.primaryIntent}`);
console.log(`Signal: ${objectionResult.intent.commercialSignal}`);
console.log(`Next Action: ${objectionResult.nextBestAction.action}`);
console.log("");
console.log(`Info: ${infoResult.intent.primaryIntent}`);
console.log(`Next Action: ${infoResult.nextBestAction.action}`);
console.log("");
console.log(`Cita: ${meetingResult.intent.primaryIntent}`);
console.log(`Next Action: ${meetingResult.nextBestAction.action}`);

const tests = [
  {
    name: "NASH expone intent",
    pass: objectionResult.intent.primaryIntent === "VALUE_NOT_CLEAR"
  },
  {
    name: "Intent conserva forma esperada",
    pass:
      typeof objectionResult.intent.rawText === "string" &&
      Array.isArray(objectionResult.intent.possibleIntents) &&
      typeof objectionResult.intent.recommendedStrategy === "string" &&
      typeof objectionResult.intent.psychology === "string" &&
      typeof objectionResult.intent.nextBestActionHint === "string"
  },
  {
    name: "Objecion activa mueve a HANDLE_OBJECTION",
    pass: objectionResult.nextBestAction.action === "HANDLE_OBJECTION"
  },
  {
    name: "Solicitud de info mueve a contexto breve",
    pass: infoResult.nextBestAction.action === "SEND_CONTEXT_THEN_ASK"
  },
  {
    name: "Disponibilidad mueve a cita",
    pass: meetingResult.nextBestAction.action === "SCHEDULE_APPOINTMENT"
  },
  {
    name: "NASH mantiene personalidad",
    pass: objectionResult.personality.personality === "PROTECTOR"
  },
  {
    name: "NASH mantiene recomendacion",
    pass: objectionResult.recommendation.firstMessage.length > 80
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
  console.log("\n✅ NASH MASTER v0.4 PASS");
} else {
  console.log("\n❌ NASH MASTER v0.4 NEEDS REVIEW");
  process.exit(1);
}
