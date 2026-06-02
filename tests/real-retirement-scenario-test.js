import { extraerTextoOCR } from '../policy-ocr-engine.js';
import { parseSolucionlineRetirementQuote } from '../solucionline-retirement-parser.js';

const PDF_PATH = '/storage/emulated/0/Download/Solucionline_20260601_13_09.PDF';

const ocr = await extraerTextoOCR({ filePath: PDF_PATH });
const report = parseSolucionlineRetirementQuote({ text: ocr.extractedText });

console.log('\nFORGE REAL RETIREMENT SCENARIO v0.1\n');

console.log(`Producto: ${report.productName}`);
console.log(`Edad actual: ${report.currentAge}`);
console.log(`Edad de retiro: ${report.retirementAge}`);
console.log(`Años de ahorro: ${report.savingYears}`);
console.log(`Moneda: ${report.currency}`);

console.log('\nAportaciones');
console.log(`Aportación anual: ${report.annualContribution.toLocaleString()} UDI`);
console.log(`Total aportado estimado: ${report.totalContributed.toLocaleString()} UDI`);

console.log('\nEscenario base');
console.log(`Pago único al retiro: ${report.scenarios.base.lumpSum.toLocaleString()} UDI`);
console.log(`Renta mensual: ${report.scenarios.base.monthlyIncome.toLocaleString()} UDI`);

console.log('\nAcumulado recibido por edad');
for (const [age, amount] of Object.entries(report.receivedByAge)) {
  console.log(`A los ${age}: ${amount.toLocaleString()} UDI`);
}

console.log('\n✅ Forge generó el escenario desde PDF real\n');
