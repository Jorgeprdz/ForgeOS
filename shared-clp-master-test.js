const {
  evaluateClpEvent
} = require("./shared-clp-engine");

console.log(
"\nFORGE SHARED CLP MASTER TEST v0.1\n"
);

const positive =
  evaluateClpEvent({
    sumAssured: 100000,
    impairedFunctions: [
      "ASEO_PERSONAL",
      "ALIMENTACION",
      "MOVILIDAD_FUNCIONAL"
    ],
    cifLevel: 4,
    requiresPermanentAssistance: true
  });

const negative =
  evaluateClpEvent({
    sumAssured: 100000,
    impairedFunctions: [
      "ASEO_PERSONAL",
      "ALIMENTACION"
    ],
    cifLevel: 4,
    requiresPermanentAssistance: true
  });

const tests = [

{
name:
"Activa CLP con 3 funciones",
pass:
positive.qualifies === true
},

{
name:
"Paga suma asegurada",
pass:
positive.benefit === 100000
},

{
name:
"Bloquea evento con menos de 3 funciones",
pass:
negative.qualifies === false
},

{
name:
"No paga cuando no cumple",
pass:
negative.benefit === 0
}

];

tests.forEach(test => {

console.log(
`${test.pass ? "✅" : "❌"} ${test.name}`
);

});

const pass =
tests.filter(t => t.pass).length;

const fail =
tests.length - pass;

console.log("\nResumen:");
console.log(`Total: ${tests.length}`);
console.log(`Pass: ${pass}`);
console.log(`Fail: ${fail}`);

if (fail === 0) {

console.log(
"\n✅ SHARED CLP LIBRARY v0.1 CLOSED"
);

}
