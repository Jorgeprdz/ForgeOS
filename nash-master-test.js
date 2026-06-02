const { runNash } = require("./nash-core-engine");

console.log("\nFORGE NASH MASTER TEST v0.1\n");

const input = {
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
    "Perfil profesional",
    "Posible interés en protección familiar"
  ]
};

const result = runNash(input);

console.log("Contexto detectado\n");
console.log(`Nombre: ${result.context.name}`);
console.log(`Edad: ${result.context.age}`);
console.log(`Ocupación: ${result.context.occupation}`);
console.log(`Hijos: ${result.context.children}`);
console.log(`Señales: ${result.context.lifeSignals.join(", ")}`);

console.log("\nConsejo Forge\n");
console.log(`Jürgen: ${result.council.jurgen.insight}`);
console.log(`Hitch: ${result.council.hitch.openerRule}`);
console.log(`Jordan: ${result.council.jordan.cta}`);
console.log(`Patch: ${result.council.patch.empathyRule}`);
console.log(`Miranda: ${result.council.miranda.qaRule}`);
console.log(`Joy: ${result.council.joy.businessRule}`);

console.log("\nRecomendación NASH\n");
console.log(`Ángulo: ${result.recommendation.recommendedAngle}`);
console.log(`Canal: ${result.recommendation.recommendedChannel}`);
console.log(`Afinidad productos: ${result.recommendation.productAffinity.join(", ")}`);
console.log(`Next Best Action: ${result.recommendation.nextBestAction}`);

console.log("\nPrimer mensaje\n");
console.log(result.recommendation.firstMessage);

console.log("\nFollowup\n");
console.log(result.recommendation.followupMessage);

console.log("\nScores\n");
console.log(`Miranda Score: ${result.recommendation.mirandaScore}`);
console.log(`Joy Score: ${result.recommendation.joyScore}`);
console.log(`Nash Score: ${result.recommendation.nashScore}`);

const tests = [
  {
    name: "Construye contexto del prospecto",
    pass: result.context.name === "María"
  },
  {
    name: "Detecta hijos",
    pass: result.context.lifeSignals.includes("HAS_CHILDREN")
  },
  {
    name: "Detecta perfil profesional",
    pass: result.context.lifeSignals.includes("PROFESSIONAL_PROFILE")
  },
  {
    name: "Ejecuta Consejo Forge",
    pass:
      !!result.council.jurgen &&
      !!result.council.hitch &&
      !!result.council.jordan &&
      !!result.council.patch &&
      !!result.council.miranda &&
      !!result.council.joy
  },
  {
    name: "Genera primer mensaje",
    pass: result.recommendation.firstMessage.length > 80
  },
  {
    name: "Genera followup",
    pass: result.recommendation.followupMessage.length > 50
  },
  {
    name: "Genera next best action",
    pass: result.recommendation.nextBestAction.length > 20
  },
  {
    name: "No abre vendiendo producto",
    pass: !/^.*seguro|póliza|retiro/i.test(result.recommendation.firstMessage.trim())
  },
  {
    name: "Tiene afinidad de producto",
    pass: result.recommendation.productAffinity.length >= 2
  },
  {
    name: "NASH Score aprobado",
    pass: result.recommendation.nashScore >= 90
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
  console.log("\n✅ NASH FOUNDATION v0.1 PASS");
} else {
  console.log("\n❌ NASH FOUNDATION NEEDS REVIEW");
}
