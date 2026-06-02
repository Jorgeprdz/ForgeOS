import { extraerTextoOCR } from '../policy-ocr-engine.js';
import { parseGMMQuote } from '../gmm-quote-parser.js';
import { calcularParticipacionClienteGMM } from '../gmm-out-of-pocket-engine.js';

const PDF_PATH =
  '/storage/emulated/0/Download/Solucionline_20251215_16_06.PDF';

const ocr = await extraerTextoOCR({
  filePath: PDF_PATH
});

const quote = parseGMMQuote({
  text: ocr.extractedText
});

const results = [];

function test(name, fn) {
  try {
    fn();
    results.push({ name, status: 'PASS' });
  } catch (error) {
    results.push({
      name,
      status: 'FAIL',
      error: error.message
    });
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function money(value) {
  return `$${Math.round(value).toLocaleString()} MXN`;
}

const scenarioOneMillion =
  calcularParticipacionClienteGMM({
    claimAmount: 1000000,
    deductible: quote.deductible,
    coinsurancePercent: quote.coinsurance.percent,
    coinsuranceCap: quote.coinsurance.maxOutOfPocket
  });

test('GMM calcula participación cliente en cuenta de 1,000,000', () => {
  assert(
    scenarioOneMillion.deductibleApplied === 40000,
    'Debe aplicar deducible de 40,000'
  );

  assert(
    scenarioOneMillion.amountAfterDeductible === 960000,
    'Debe calcular monto después de deducible'
  );

  assert(
    scenarioOneMillion.rawCoinsurance === 96000,
    'Debe calcular coaseguro bruto 10%'
  );

  assert(
    scenarioOneMillion.coinsuranceApplied === 85000,
    'Debe topar coaseguro a 85,000'
  );

  assert(
    scenarioOneMillion.clientPays === 125000,
    'Cliente debe pagar 125,000'
  );

  assert(
    scenarioOneMillion.insurerPays === 875000,
    'Aseguradora debe pagar 875,000'
  );
});

const scenarioSmallClaim =
  calcularParticipacionClienteGMM({
    claimAmount: 30000,
    deductible: quote.deductible,
    coinsurancePercent: quote.coinsurance.percent,
    coinsuranceCap: quote.coinsurance.maxOutOfPocket
  });

test('GMM cuenta menor al deducible la paga cliente', () => {
  assert(
    scenarioSmallClaim.clientPays === 30000,
    'Cliente debe pagar todo si no supera deducible'
  );

  assert(
    scenarioSmallClaim.insurerPays === 0,
    'Aseguradora no paga si no supera deducible'
  );
});

const scenarioHugeClaim =
  calcularParticipacionClienteGMM({
    claimAmount: 5000000,
    deductible: quote.deductible,
    coinsurancePercent: quote.coinsurance.percent,
    coinsuranceCap: quote.coinsurance.maxOutOfPocket
  });

test('GMM cuenta grande respeta tope de coaseguro', () => {
  assert(
    scenarioHugeClaim.clientPays === 125000,
    'Cliente debe seguir pagando máximo deducible + tope'
  );

  assert(
    scenarioHugeClaim.insurerPays === 4875000,
    'Aseguradora debe cubrir el resto'
  );
});

console.log('\nFORGE GMM OUT OF POCKET REPORT v0.1\n');

console.log(`Producto: ${quote.productName}`);
console.log(`Plan: ${quote.plan}`);
console.log(`Deducible: ${money(quote.deductible)}`);
console.log(`Coaseguro: ${quote.coinsurance.percent}%`);
console.log(`Tope coaseguro: ${money(quote.coinsurance.maxOutOfPocket)}`);

console.log('\nEjemplo: cuenta hospitalaria de $1,000,000 MXN');
console.log(`Deducible aplicado: ${money(scenarioOneMillion.deductibleApplied)}`);
console.log(`Monto después de deducible: ${money(scenarioOneMillion.amountAfterDeductible)}`);
console.log(`Coaseguro bruto: ${money(scenarioOneMillion.rawCoinsurance)}`);
console.log(`Coaseguro aplicado: ${money(scenarioOneMillion.coinsuranceApplied)}`);
console.log(`Cliente paga: ${money(scenarioOneMillion.clientPays)}`);
console.log(`Aseguradora paga: ${money(scenarioOneMillion.insurerPays)}`);

console.log('\nResultados');
for (const result of results) {
  if (result.status === 'PASS') {
    console.log(`✅ ${result.name}`);
  } else {
    console.log(`❌ ${result.name}`);
    console.log(`   ${result.error}`);
  }
}

const failed = results.filter((result) => result.status === 'FAIL');

console.log('\nResumen:');
console.log(`Total: ${results.length}`);
console.log(`Pass: ${results.length - failed.length}`);
console.log(`Fail: ${failed.length}`);

if (failed.length > 0) process.exit(1);
