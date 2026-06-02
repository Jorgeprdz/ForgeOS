const {
  detectImaginaSerVariantFromText
} = require("./imagina-ser-variant-engine");

const {
  getAllowedFiscalBags,
  selectPreferredFiscalBag
} = require("./imagina-ser-fiscal-bag-engine");

const {
  routeImaginaSerFiscal
} = require("./imagina-ser-fiscal-router-engine");

console.log("\nFORGE IMAGINA SER VARIANT + FISCAL ROUTER TEST v1.1\n");

const is65pl15 = detectImaginaSerVariantFromText(
  "IMAGINA SER 65 PAGOS LIMITADOS 15"
);

const is65pl10 = detectImaginaSerVariantFromText(
  "IMAGINA SER 65 PAGOS LIMITADOS 10"
);

const is60 = detectImaginaSerVariantFromText(
  "IMAGINA SER 60 PRIMAS NIVELADAS"
);

const is70 = detectImaginaSerVariantFromText(
  "IMAGINA SER 70 PRIMAS NIVELADAS"
);

const fiscal65 = selectPreferredFiscalBag({
  ...is65pl15,
  advisorPreference: "PREFER_151"
});

const fiscal60 = selectPreferredFiscalBag({
  ...is60,
  advisorPreference: "PREFER_151"
});

const routed151 = routeImaginaSerFiscal({
  variantInfo: is65pl15,
  annualContributionMXN: 120000,
  annualIncomeMXN: 1200000,
  estimatedTaxRate: 0.30,
  umaAnnualLimitMXN: 198000,
  advisorPreference: "PREFER_151"
});

const routed185 = routeImaginaSerFiscal({
  variantInfo: is60,
  annualContributionMXN: 120000,
  annualIncomeMXN: 1200000,
  estimatedTaxRate: 0.30,
  umaAnnualLimitMXN: 198000,
  advisorPreference: "PREFER_151"
});

console.log("Variant Detection\n");
console.log(`65 PL15 -> ${is65pl15.variant}`);
console.log(`65 PL10 -> ${is65pl10.variant}`);
console.log(`60 -> ${is60.variant}`);
console.log(`70 -> ${is70.variant}`);

console.log("\nFiscal Routing\n");
console.log(`65 PL15 selected -> ${fiscal65.selectedBag.bag}`);
console.log(`60 selected -> ${fiscal60.selectedBag.bag}`);
console.log(`65 PL15 route -> ${routed151.fiscalSelection.routing}`);
console.log(`60 route -> ${routed185.fiscalSelection.routing}`);

const tests = [
  {
    name: "Detecta Imagina Ser 65 PL15",
    pass: is65pl15.variant === "IMAGINA_SER_65_PL15"
  },
  {
    name: "Detecta Imagina Ser 65 PL10",
    pass: is65pl10.variant === "IMAGINA_SER_65_PL10"
  },
  {
    name: "Detecta Imagina Ser 60",
    pass: is60.variant === "IMAGINA_SER_60"
  },
  {
    name: "Detecta Imagina Ser 70",
    pass: is70.variant === "IMAGINA_SER_70"
  },
  {
    name: "65 PL15 permite Artículo 151",
    pass: fiscal65.allowedBags.some(b => b.bag === "PPR_151")
  },
  {
    name: "60 no enruta a Artículo 151",
    pass: fiscal60.selectedBag.bag !== "PPR_151"
  },
  {
    name: "65 PL15 enruta a Article 151 Engine",
    pass: routed151.fiscalSelection.routing === "ARTICLE_151_ENGINE"
  },
  {
    name: "60 enruta a Article 185 Engine",
    pass: routed185.fiscalSelection.routing === "ARTICLE_185_ENGINE"
  },
  {
    name: "Artículo 151 calcula devolución estimada",
    pass: routed151.result.estimatedRefund > 0
  },
  {
    name: "Artículo 185 calcula diferimiento estimado",
    pass: routed185.result.estimatedTaxDeferral > 0
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
  console.log("\n✅ IMAGINA SER VARIANT + FISCAL ROUTER v1.1 CLOSED");
}
