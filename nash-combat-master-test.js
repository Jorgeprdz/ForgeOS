const {
  runNashCombat,
  classifyObjection
} = require("./nash-combat-orchestrator");

console.log("\nFORGE NASH COMBAT SYSTEM TEST v0.1\n");

const fixtures = [
  {
    objection: "No tengo dinero ahorita",
    expected: "FINANCIAL"
  },
  {
    objection: "Estoy muy ocupado, luego vemos",
    expected: "TIME"
  },
  {
    objection: "Déjame pensarlo",
    expected: "STALL"
  },
  {
    objection: "Ya tengo seguro",
    expected: "ALREADY_COVERED"
  },
  {
    objection: "No confío mucho en esas cosas",
    expected: "TRUST"
  }
];

let pass = 0;

fixtures.forEach(item => {
  const type = classifyObjection(item.objection);
  const ok = type === item.expected;

  console.log(`${ok ? "✅" : "❌"} ${item.expected} → ${type}`);

  if (ok) pass++;
});

const sample = runNashCombat({
  objection: "No tengo dinero ahorita",
  context: {
    name: "María"
  },
  personality: {
    personality: "PROTECTOR"
  }
});

console.log("\nRespuesta ejemplo\n");
console.log(`Tipo: ${sample.type}`);
console.log(`Diagnóstico: ${sample.diagnosis}`);
console.log(`Respuesta: ${sample.response}`);
console.log(`Next Move: ${sample.nextMove}`);
console.log(`Objetivo: ${sample.goal}`);

const integrationTests = [
  {
    name: "Clasifica objeciones base",
    pass: pass === fixtures.length
  },
  {
    name: "Genera diagnóstico",
    pass: sample.diagnosis.length > 30
  },
  {
    name: "Genera respuesta",
    pass: sample.response.length > 50
  },
  {
    name: "Genera next move",
    pass: sample.nextMove.length > 10
  },
  {
    name: "No responde vendiendo producto",
    pass: !/compra|contrata|póliza/i.test(sample.response)
  }
];

console.log("\nResultados\n");

integrationTests.forEach(test => {
  console.log(`${test.pass ? "✅" : "❌"} ${test.name}`);
});

const integrationPass = integrationTests.filter(t => t.pass).length;
const total = fixtures.length + integrationTests.length;
const totalPass = pass + integrationPass;
const fail = total - totalPass;

console.log("\nResumen:");
console.log(`Total: ${total}`);
console.log(`Pass: ${totalPass}`);
console.log(`Fail: ${fail}`);

if (fail === 0) {
  console.log("\n✅ NASH COMBAT SYSTEM v0.1 PASS");
} else {
  console.log("\n❌ NASH COMBAT SYSTEM NEEDS REVIEW");
}
