const {
  extractVidaMujerKnowledge
} = require(
  "./vida-mujer-knowledge-extractor"
);

const pdfPath =
  process.argv[2];

const knowledge =
  extractVidaMujerKnowledge(
    pdfPath
  );

console.log(
  "\nFORGE VIDA MUJER KNOWLEDGE REPORT v1.0\n"
);

console.log(
  JSON.stringify(
    knowledge,
    null,
    2
  )
);

const tests = [
  {
    name:
      "Producto Vida Mujer",
    pass:
      knowledge.product ===
      "VIDA_MUJER"
  },
  {
    name:
      "Detecta moneda",
    pass:
      knowledge.currency !== null
  },
  {
    name:
      "Detecta cobertura básica",
    pass:
      knowledge.basicCoverage !== null
  },
  {
    name:
      "Detecta coberturas contratadas",
    pass:
      knowledge.contractedCoverages.length > 0
  },
  {
    name:
      "Detecta valores garantizados",
    pass:
      knowledge.guaranteedValues.length > 0
  },
  {
    name:
      "Construye survival benefit",
    pass:
      knowledge.survivalBenefit !== null
  },
  {
    name:
      "Detecta estado AVE",
    pass:
      knowledge.ave.status !==
      "UNKNOWN"
  }
];

console.log("\nResultados\n");

tests.forEach(test => {
  console.log(
    `${test.pass ? "✅" : "❌"} ${test.name}`
  );
});

const pass =
  tests.filter(
    t => t.pass
  ).length;

const fail =
  tests.length - pass;

console.log("\nResumen:");
console.log(`Total: ${tests.length}`);
console.log(`Pass: ${pass}`);
console.log(`Fail: ${fail}`);
