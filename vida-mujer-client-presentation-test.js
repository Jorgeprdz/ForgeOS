const fixture = require("./fixtures/vida-mujer-fixture.json");
const { buildVidaMujerClientPresentation } = require("./vida-mujer-client-presentation-engine");
const { validatePricePlacement } = require("./shared-price-placement-engine");

console.log("\nFORGE VIDA MUJER CLIENT PRESENTATION TEST v1.0\n");

const presentation = buildVidaMujerClientPresentation(fixture);
const price = validatePricePlacement(presentation.slides);

console.log("Presentación Cliente\n");

presentation.slides.forEach(slide => {
  console.log(`${slide.slide}. ${slide.title}`);
  console.log(`   ${slide.body}\n`);
});

const tests = [
  {
    name: "Construye presentación cliente",
    pass: presentation.slides.length === 12
  },
  {
    name: "No abre con precio",
    pass: !/precio|prima|costo|aportaci/i.test(
      presentation.slides[0].title + presentation.slides[0].body
    )
  },
  {
    name: "Incluye protección",
    pass: presentation.slides.some(s => /protección/i.test(s.title + s.body))
  },
  {
    name: "Incluye supervivencia",
    pass: presentation.slides.some(s => /supervivencia/i.test(s.title + s.body))
  },
  {
    name: "Calcula 40,250 UDI",
    pass: presentation.slides.some(s => /40,250/.test(s.body))
  },
  {
    name: "Precio va al final",
    pass: price.valid
  },
  {
    name: "Construye apéndice",
    pass:
      presentation.appendix.guaranteedValues.length > 0 &&
      presentation.appendix.coverages.PCF.contracted === true
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
  console.log("\n✅ VIDA MUJER CLIENT PRESENTATION v1.0 PASS");
} else {
  console.log("\n❌ VIDA MUJER CLIENT PRESENTATION NEEDS REVIEW");
}
