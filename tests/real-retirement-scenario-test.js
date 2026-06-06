import { extraerTextoOCR } from '../policy-ocr-engine.js';
import { parseSolucionlineRetirementQuote } from '../solucionline-retirement-parser.js';

const PDF_PATH = '/storage/emulated/0/Download/Solucionline_20260601_13_09.PDF';

const ocr = await extraerTextoOCR({ filePath: PDF_PATH });
const report = parseSolucionlineRetirementQuote({ text: ocr.extractedText });

console.log('\nFORGE REAL RETIREMENT SCENARIO v0.1\n');

console.log(`Producto: ${report.productName}`);
console.log(`Edad actual: ${report.currentAge}`);
console.log(`Edad de retiro: ${report.retirementAge}`);
console.log(`Años de cobertura: ${report.coverageYears}`);
console.log(`Moneda: ${report.currency}`);

console.log('\nAportaciones');
console.log(`Prima básica anual: ${report.premiumStructure.basicAnnualPremium.toLocaleString()} UDI`);
console.log(`Prima planeada anual: ${report.premiumStructure.plannedAnnualContribution.toLocaleString()} UDI`);
console.log(`Prima total anual: ${report.premiumStructure.totalAnnualPremium.toLocaleString()} UDI`);

console.log('\nEscenario base');
if (report.scenarios.base.lumpSum && report.scenarios.base.monthlyIncome) {
  console.log(`Pago único al retiro: ${report.scenarios.base.lumpSum.toLocaleString()} UDI`);
  console.log(`Renta mensual: ${report.scenarios.base.monthlyIncome.toLocaleString()} UDI`);
} else {
  console.log('BLOCKED_NO_RETIREMENT_SCENARIO_EVIDENCE');
}

console.log('\nEvidencia');
console.log(JSON.stringify(report.evidence, null, 2));

console.log('\n✅ Forge generó el escenario desde PDF real\n');
