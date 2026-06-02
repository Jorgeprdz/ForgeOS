const {
  extractVidaMujerKnowledge
} = require("./vida-mujer-knowledge-extractor");

const {
  calculateFinancialReturn,
  calculateAnnualContribution
} = require("./shared-financial-return-engine");

const {
  explainPremiumCurrencyBehavior
} = require("./shared-premium-growth-engine");

const {
  calculateProtectionEfficiency
} = require("./shared-protection-efficiency-engine");

const {
  explainFinancialReturn,
  formatNumber
} = require("./shared-human-financial-language-engine");

const pdfPath = process.argv[2];

if (!pdfPath) {
  console.log("Uso:");
  console.log("node vida-mujer-financial-correction-report.js archivo.pdf");
  process.exit(1);
}

const knowledge = extractVidaMujerKnowledge(pdfPath);

const currency = knowledge.currency;
const annualPremium = knowledge.basicCoverage.annualPremium;
const years = 20;

const totalContributed = calculateAnnualContribution({
  annualPremium,
  years
});

const survivalBenefit = knowledge.survivalBenefit.totalBenefit;

const finalGuaranteedRow =
  knowledge.guaranteedValues[knowledge.guaranteedValues.length - 1];

const finalCashValue =
  finalGuaranteedRow.cashValue;

const aveValue =
  finalGuaranteedRow.aveRescueValue;

const totalRecoverable =
  survivalBenefit + finalCashValue + aveValue;

const financialReturn = calculateFinancialReturn({
  totalContributed,
  totalRecovered: totalRecoverable
});

const premiumBehavior = explainPremiumCurrencyBehavior({
  policyCurrency: currency
});

const protectionEfficiency = calculateProtectionEfficiency({
  totalContributed,
  protectedCapital: knowledge.basicCoverage.sumAssured
});

console.log("\nFORGE VIDA MUJER FINANCIAL CORRECTION REPORT v1.1\n");

console.log("Aportación estimada\n");
console.log(`Prima anual detectada: ${formatNumber(annualPremium)} ${currency}`);
console.log(`Años analizados: ${years}`);
console.log(`Total aportado estimado: ${formatNumber(totalContributed)} ${currency}`);

console.log("\nRecuperación estimada\n");
console.log(`Pagos programados por supervivencia: ${formatNumber(survivalBenefit)} ${currency}`);
console.log(`Valor en efectivo final: ${formatNumber(finalCashValue)} ${currency}`);
console.log(`Valor rescate AVE final: ${formatNumber(aveValue)} ${currency}`);
console.log(`Capital recuperable estimado: ${formatNumber(totalRecoverable)} ${currency}`);

console.log("\nLectura humana\n");
console.log(explainFinancialReturn({
  ...financialReturn,
  currency
}));

console.log("\nPrima en pesos\n");
console.log(premiumBehavior.clientExplanation);

console.log("\nProtección durante el periodo\n");
console.log(`Capital protegido principal: ${formatNumber(knowledge.basicCoverage.sumAssured)} ${currency}`);
console.log(`Relación protección/aportación: ${formatNumber(protectionEfficiency.protectionRatio)}x`);

console.log("\nRegla Forge\n");
console.log("No comparar el seguro como si fuera una inversión pura. La lectura correcta es: aportación + recuperación + protección durante el camino.");

const tests = [
  {
    name: "Calcula total aportado",
    pass: Math.round(totalContributed * 100) / 100 === 42864.8
  },
  {
    name: "Incluye supervivencia",
    pass: survivalBenefit === 40250
  },
  {
    name: "Incluye valor en efectivo",
    pass: finalCashValue === 28000
  },
  {
    name: "Detecta AVE en cero",
    pass: aveValue === 0
  },
  {
    name: "Calcula capital recuperable",
    pass: totalRecoverable === 68250
  },
  {
    name: "Explica prima UDI vs MXN",
    pass: premiumBehavior.clientExplanation.includes("UDI")
  }
];

console.log("\nResultados\n");

tests.forEach((test) => {
  console.log(`${test.pass ? "✅" : "❌"} ${test.name}`);
});

const pass = tests.filter(t => t.pass).length;
const fail = tests.length - pass;

console.log("\nResumen:");
console.log(`Total: ${tests.length}`);
console.log(`Pass: ${pass}`);
console.log(`Fail: ${fail}`);

if (fail === 0) {
  console.log("\n✅ VIDA MUJER FINANCIAL CORRECTION v1.1 PASS");
}
