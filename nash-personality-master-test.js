const { detectPersonality } = require("./nash-personality-engine");

console.log("\nFORGE NASH PERSONALITY TEST v0.1\n");

const fixtures = [
  { expected: "PROTECTOR", context: { children: 2, notes: ["familia", "hijos", "seguridad"] } },
  { expected: "CONSTRUCTOR", context: { children: 0, notes: ["empresa", "negocio", "patrimonio"] } },
  { expected: "ANALYTICAL", context: { children: 0, notes: ["datos", "comparar", "analizar"] } },
  { expected: "RELATIONAL", context: { children: 0, notes: ["personas", "amistad", "confianza"] } },
  { expected: "VISIONARY", context: { children: 0, notes: ["futuro", "libertad", "metas"] } }
];

let pass = 0;

fixtures.forEach(test => {
  const result = detectPersonality(test.context);
  const ok = result.personality === test.expected;
  console.log(`${ok ? "✅" : "❌"} ${test.expected} → ${result.personality}`);
  if (ok) pass++;
});

console.log("\nResumen");
console.log(`Total: ${fixtures.length}`);
console.log(`Pass: ${pass}`);
console.log(`Fail: ${fixtures.length - pass}`);

if (pass === fixtures.length) {
  console.log("\n✅ NASH PERSONALITY ENGINE v0.1 PASS");
} else {
  console.log("\n❌ NASH PERSONALITY ENGINE NEEDS REVIEW");
}
