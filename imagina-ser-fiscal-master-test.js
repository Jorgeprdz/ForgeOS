const { buildTaxProfile } = require("./shared-tax-profile-engine");
const { calculateArticle151Benefit } = require("./imagina-ser-article-151-engine");
const { buildHappyNumbers151 } = require("./imagina-ser-happy-numbers-engine");
const { buildFiscalClientSlide } = require("./imagina-ser-fiscal-slide-engine");

console.log("\nFORGE IMAGINA SER FISCAL PLATFORM v1.0\n");

const profile = buildTaxProfile({
  annualIncome: 1200000,
  taxRegime: "SUELDOS_Y_SALARIOS"
});

const article151 = calculateArticle151Benefit({
  annualContributionMXN: 120000,
  annualIncomeMXN: profile.annualIncome,
  estimatedTaxRate: profile.estimatedRate,
  umaAnnualLimitMXN: 198000
});

const happy = buildHappyNumbers151(article151);
const slide = buildFiscalClientSlide(happy);

console.log("Artículo 151 / PPR\n");
console.log(`Aportación anual: $${article151.annualContributionMXN.toLocaleString("es-MX")}`);
console.log(`Monto deducible estimado: $${article151.deductibleAmount.toLocaleString("es-MX")}`);
console.log(`Devolución estimada: $${article151.estimatedRefund.toLocaleString("es-MX")}`);
console.log(`Costo neto estimado: $${article151.netCost.toLocaleString("es-MX")}`);
console.log(`Modo: ${article151.mode}`);

console.log("\nSlide Cliente\n");
console.log(slide.title);
console.log(slide.body);

const tests = [
  {
    name: "Construye Tax Profile",
    pass: profile.estimatedRate > 0
  },
  {
    name: "Usa Artículo 151",
    pass: article151.fiscalBucket === "ARTICLE_151_PPR"
  },
  {
    name: "Calcula monto deducible",
    pass: article151.deductibleAmount > 0
  },
  {
    name: "Calcula devolución estimada",
    pass: article151.estimatedRefund > 0
  },
  {
    name: "Calcula costo neto",
    pass: article151.netCost === article151.annualContributionMXN - article151.estimatedRefund
  },
  {
    name: "Marca doble beneficio fiscal",
    pass: article151.doubleFiscalBenefit === true
  },
  {
    name: "No promete garantía",
    pass: article151.mode === "ESTIMATED_NOT_GUARANTEED"
  },
  {
    name: "Construye Happy Numbers",
    pass: happy.realEstimatedEffort > 0
  },
  {
    name: "Construye slide cliente",
    pass: slide.body.includes("SAT podría regresar")
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
  console.log("\n✅ IMAGINA SER FISCAL PLATFORM v1.0 CLOSED");
}
