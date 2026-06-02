const fs = require("fs");
const path = require("path");
const {
  loadMemory,
  appendConversation,
  appendObjection,
  updateOutcome,
  updateProfileMemory,
  detectMemoryPatterns
} = require("./nash-memory-engine");

console.log("\nFORGE NASH MEMORY ENGINE TEST v0.1\n");

const prospectId = "MARIA_TEST_001";
const memoryFile = path.join(__dirname, "nash-memory", "maria_test_001.json");

if (fs.existsSync(memoryFile)) {
  fs.unlinkSync(memoryFile);
}

let memory = loadMemory(prospectId);

memory = updateProfileMemory({
  prospectId,
  personality: "PROTECTOR",
  motivators: ["FAMILIA", "SEGURIDAD"]
});

memory = appendConversation({
  prospectId,
  direction: "OUTBOUND",
  message: "Hola María, quería abrir una conversación breve.",
  channel: "whatsapp"
});

memory = appendConversation({
  prospectId,
  direction: "INBOUND",
  message: "Ahorita no tengo dinero.",
  channel: "whatsapp"
});

memory = appendObjection({
  prospectId,
  objection: "Ahorita no tengo dinero.",
  type: "FINANCIAL",
  intent: "VALUE_NOT_CLEAR"
});

memory = appendObjection({
  prospectId,
  objection: "Sí me interesa, pero está caro.",
  type: "FINANCIAL",
  intent: "VALUE_NOT_CLEAR"
});

memory = updateOutcome({
  prospectId,
  action: "FOLLOWUP_SENT",
  outcome: "NO_RESPONSE"
});

const loaded = loadMemory(prospectId);
const patterns = detectMemoryPatterns(loaded);

console.log("Memoria cargada\n");
console.log(`Prospect ID: ${loaded.prospectId}`);
console.log(`Personalidad: ${loaded.personality}`);
console.log(`Motivadores: ${loaded.knownMotivators.join(", ")}`);
console.log(`Conversaciones: ${loaded.conversationHistory.length}`);
console.log(`Objeciones: ${loaded.objectionHistory.length}`);
console.log(`Última acción: ${loaded.lastAction}`);
console.log(`Último resultado: ${loaded.lastOutcome}`);

console.log("\nPatrones detectados\n");
console.log(`Objeción dominante: ${patterns.dominantObjectionType}`);
console.log(`Veces: ${patterns.dominantObjectionCount}`);
console.log(`Objeción repetida: ${patterns.hasRepeatedObjection ? "SÍ" : "NO"}`);

const tests = [
  {
    name: "Crea memoria",
    pass: loaded.prospectId === prospectId
  },
  {
    name: "Guarda personalidad",
    pass: loaded.personality === "PROTECTOR"
  },
  {
    name: "Guarda motivadores",
    pass: loaded.knownMotivators.includes("FAMILIA")
  },
  {
    name: "Guarda conversación",
    pass: loaded.conversationHistory.length === 2
  },
  {
    name: "Guarda objeciones",
    pass: loaded.objectionHistory.length === 2
  },
  {
    name: "Actualiza resultado",
    pass: loaded.lastOutcome === "NO_RESPONSE"
  },
  {
    name: "Detecta objeción dominante",
    pass: patterns.dominantObjectionType === "FINANCIAL"
  },
  {
    name: "Detecta objeción repetida",
    pass: patterns.hasRepeatedObjection === true
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
  console.log("\n✅ NASH MEMORY ENGINE v0.1 PASS");
} else {
  console.log("\n❌ NASH MEMORY ENGINE NEEDS REVIEW");
}
