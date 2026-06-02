import { detectarProductoCotizacion } from '../product-detection-engine.js';
import { obtenerMonedaNormalizada } from '../currency-normalization-engine.js';
import { prepararInputPresentacion } from '../presentation-input-pipeline.js';

const results = [];

function test(name, fn) {
  try {
    fn();
    results.push({ name, status: 'PASS' });
  } catch (error) {
    results.push({ name, status: 'FAIL', error: error.message });
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const productLibrary = [
  {
    id: 'imagina-ser',
    canonicalName: 'Imagina Ser',
    carrierName: 'Seguros Monterrey New York Life',
    aliases: ['imagina ser', 'plan imagina ser'],
  },
];

test('business rule: producto desconocido no se confirma', () => {
  const result = detectarProductoCotizacion({
    productName: 'Producto Fantasma 3000',
    carrierName: 'Carrier Inventado',
    productLibrary,
  });

  assert(result.matched === false, 'No debe marcar match');
  assert(result.status === 'UNKNOWN_PRODUCT', 'Debe marcar producto desconocido');
  assert(result.shouldAskConfirmation === true, 'Debe pedir confirmación');
});

test('business rule: librería vacía no inventa producto', () => {
  const result = detectarProductoCotizacion({
    productName: 'Imagina Ser',
    carrierName: 'Seguros Monterrey',
    productLibrary: [],
  });

  assert(result.matched === false, 'No debe marcar match sin librería');
  assert(result.status === 'UNKNOWN_PRODUCT', 'Debe marcar producto desconocido');
});

test('business rule: USD sin tasa no convierte', () => {
  const result = obtenerMonedaNormalizada({
    amount: 100,
    currency: 'USD',
    rates: {},
  });

  assert(result.amountMXN === null, 'No debe convertir sin tasa USD');
  assert(result.status === 'MISSING_USD_RATE', 'Debe marcar tasa USD faltante');
});

test('business rule: UDI sin tasa no convierte', () => {
  const result = obtenerMonedaNormalizada({
    amount: 100,
    currency: 'UDI',
    rates: {},
  });

  assert(result.amountMXN === null, 'No debe convertir sin tasa UDI');
  assert(result.status === 'MISSING_UDI_RATE', 'Debe marcar tasa UDI faltante');
});

test('business rule: moneda no soportada no convierte', () => {
  const result = obtenerMonedaNormalizada({
    amount: 100,
    currency: 'EUR',
    rates: {},
  });

  assert(result.amountMXN === null, 'No debe convertir moneda no soportada');
  assert(result.status === 'UNSUPPORTED_CURRENCY', 'Debe marcar moneda no soportada');
});

test('business rule: pipeline no queda listo con producto desconocido', () => {
  const result = prepararInputPresentacion({
    extractedFields: {
      productName: 'Producto Fantasma 3000',
      carrierName: 'Carrier Inventado',
      currentAge: 35,
      currency: 'MXN',
      premium: 2500,
    },
    rates: {},
    productLibrary,
    currentUdiValue: 8.7,
    projectionRates: {},
    maxMilestones: 5,
  });

  assert(result.readyForPresentation === false, 'No debe quedar listo con producto desconocido');
  assert(result.productDetection.status === 'UNKNOWN_PRODUCT', 'Debe marcar producto desconocido');
});

console.log('\nFORGE BUSINESS RULES REPORT v0.1\n');

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
