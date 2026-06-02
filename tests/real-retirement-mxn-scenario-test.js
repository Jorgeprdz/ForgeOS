import { extraerTextoOCR } from '../policy-ocr-engine.js';
import { parseSolucionlineRetirementQuote } from '../solucionline-retirement-parser.js';
import { buildRetirementPresentationScenario } from '../retirement-presentation-scenario-engine.js';

const PDF_PATH =
  '/storage/emulated/0/Download/Solucionline_20260601_13_09.PDF';

const ocr = await extraerTextoOCR({
  filePath: PDF_PATH
});

const parsed =
  parseSolucionlineRetirementQuote({
    text: ocr.extractedText
  });

const scenario =
  buildRetirementPresentationScenario({
    parsedQuote: parsed,
    currentUdiValue: 8.7
  });

function mxn(value) {
  return `$${Math.round(value).toLocaleString()} MXN`;
}

function udi(value) {
  return `${Math.round(value).toLocaleString()} UDI`;
}

console.log(
  '\nFORGE REAL RETIREMENT PRESENTATION SCENARIO v0.2\n'
);

console.log(
  `Producto: ${scenario.productName}`
);

console.log(
  `Moneda: ${scenario.currency}`
);

console.log(
  `UDI usada: $${scenario.currentUdiValue} MXN`
);

console.log('\nResumen');

console.log(
  `Edad actual: ${scenario.summary.currentAge}`
);

console.log(
  `Edad retiro: ${scenario.summary.retirementAge}`
);

console.log(
  `Años de cobertura hasta retiro: ${scenario.summary.coverageYears}`
);

console.log(
  `Años pagando: ${scenario.summary.premiumPayingYears}`
);

console.log(
  `Termina de pagar a los: ${scenario.summary.paidUntilAge}`
);

console.log('\nAportación anual');

console.log(
  `Prima básica: ${udi(
    scenario.summary.basicAnnualPremiumUDI
  )} / ${mxn(
    scenario.summary.basicAnnualPremiumMXN
  )}`
);

console.log(
  `Prima planeada / AVE: ${udi(
    scenario.summary.plannedAnnualContributionUDI
  )} / ${mxn(
    scenario.summary.plannedAnnualContributionMXN
  )}`
);

console.log(
  `Aportación anual total: ${udi(
    scenario.summary.totalAnnualPremiumUDI
  )} / ${mxn(
    scenario.summary.totalAnnualPremiumMXN
  )}`
);

console.log('\nAportación acumulada');

console.log(
  `Total aportado estimado: ${udi(
    scenario.summary.totalContributedUDI
  )} / ${mxn(
    scenario.summary.totalContributedMXN
  )}`
);

console.log('\nEscenario base');

console.log(
  `Pago único al retiro: ${udi(
    scenario.summary.lumpSumUDI
  )} / ${mxn(
    scenario.summary.lumpSumMXN
  )}`
);

console.log(
  `Renta mensual: ${udi(
    scenario.summary.monthlyIncomeUDI
  )} / ${mxn(
    scenario.summary.monthlyIncomeMXN
  )}`
);

console.log(
  '\nHitos que Forge decidió mostrar'
);

for (const milestone of scenario.milestones) {

  console.log(
    `A los ${milestone.age}: ${udi(
      milestone.totalReceivedUdi
    )} / ${mxn(
      milestone.totalReceivedMXN
    )} — ${milestone.reason}`
  );

}

console.log(
  '\n✅ Forge consideró prima planeada/AVE y pago limitado 15\n'
);
