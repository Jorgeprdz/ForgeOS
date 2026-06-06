import { detectarProductoCotizacion } from '../product-detection-engine.js';
import { vincularProductKnowledge } from '../product-knowledge-link-engine.js';
import { obtenerMonedaNormalizada } from '../currency-normalization-engine.js';
import { proyectarValorFuturo, proyectarUDI } from '../projection-engine.js';
import { seleccionarHitosSignificativos } from '../projection-milestone-engine.js';
import { proyectarValoresRescateDinamicos } from '../dynamic-cash-value-projection-engine.js';
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

function money(value) {
  return Number(value).toFixed(2);
}

const productLibrary = [
  {
    id: 'imagina-ser',
    canonicalName: 'Imagina Ser',
    carrierName: 'Seguros Monterrey New York Life',
    aliases: ['imagina ser', 'plan imagina ser'],
  },
];

test('critical path detecta producto', () => {
  const result = detectarProductoCotizacion({
    productName: 'Imagina Ser',
    carrierName: 'Seguros Monterrey',
    productLibrary,
  });

  assert(result.status === 'PRODUCT_CONFIRMED', 'Debe confirmar producto');
});

test('critical path vincula product knowledge', () => {
  const detection = detectarProductoCotizacion({
    productName: 'Imagina Ser',
    carrierName: 'Seguros Monterrey',
    productLibrary,
  });

  const result = vincularProductKnowledge({
    quotation: {
      productName: 'Imagina Ser',
      carrierName: 'Seguros Monterrey',
    },
    detection,
  });

  assert(Boolean(result), 'Debe regresar cotización vinculada');
});

test('critical path normaliza MXN sin conversión', () => {
  const result = obtenerMonedaNormalizada({
    amount: 2500,
    currency: 'MXN',
    rates: {},
  });

  assert(result.amountMXN === 2500, 'Debe conservar MXN');
  assert(result.status === 'NO_CONVERSION_NEEDED', 'Debe marcar sin conversión');
});

test('critical path normaliza USD con tasa explícita', () => {
  const result = obtenerMonedaNormalizada({
    amount: 100,
    currency: 'USD',
    rates: {
      usdRate: 18,
    },
  });

  assert(result.amountMXN === 1800, 'Debe convertir USD a MXN');
  assert(result.status === 'CONVERTED', 'Debe marcar convertido');
});

test('critical path normaliza UDI a MXN con tasa explícita', () => {
  const result = obtenerMonedaNormalizada({
    amount: 1000,
    currency: 'UDI',
    rates: {
      udiRate: 8.7,
    },
  });

  assert(result.amountMXN === 8700, 'Debe convertir UDI a MXN');
  assert(result.status === 'CONVERTED', 'Debe marcar convertido');
});

test('critical path projection engine calcula valor futuro', () => {
  const result = proyectarValorFuturo({
    currentValue: 1000,
    annualGrowthRate: 0.05,
    years: 10,
  });

  assert(Number.isFinite(result), 'Debe regresar número');
  assert(result > 1000, 'Debe crecer con tasa positiva');
});

test('critical path proyecta UDI al año 2050', () => {
  const currentYear = 2026;
  const targetYear = 2050;
  const years = targetYear - currentYear;
  const currentUdiValue = 8.7;

  const conservative = proyectarValorFuturo({
    currentValue: currentUdiValue,
    annualGrowthRate: 0.03,
    years,
  });

  const base = proyectarValorFuturo({
    currentValue: currentUdiValue,
    annualGrowthRate: 0.045,
    years,
  });

  const aggressive = proyectarValorFuturo({
    currentValue: currentUdiValue,
    annualGrowthRate: 0.06,
    years,
  });

  console.log('\nUDI Projection 2050');
  console.log(`Años proyectados: ${years}`);
  console.log(`UDI actual usada: $${money(currentUdiValue)} MXN`);
  console.log(`Conservador 3.0%: $${money(conservative)} MXN`);
  console.log(`Base 4.5%: $${money(base)} MXN`);
  console.log(`Agresivo 6.0%: $${money(aggressive)} MXN`);

  assert(years === 24, 'Debe proyectar 24 años de 2026 a 2050');
  assert(conservative > currentUdiValue, 'Conservador debe crecer');
  assert(base > conservative, 'Base debe ser mayor que conservador');
  assert(aggressive > base, 'Agresivo debe ser mayor que base');
});

test('critical path proyecta UDI por edad objetivo', () => {
  const result = proyectarUDI({
    currentUdiValue: 8.7,
    currentAge: 35,
    targetAge: 65,
    rates: {
      conservativeRate: 0.03,
      baseRate: 0.045,
      aggressiveRate: 0.06,
    },
  });

  assert(result.years === 30, 'Debe calcular 30 años');
  assert(result.conservative > 8.7, 'Escenario conservador debe crecer');
  assert(result.base === result.conservative, 'Base debe usar la misma tasa global UDI');
  assert(result.aggressive === result.base, 'Agresivo debe usar la misma tasa global UDI');
});

test('critical path selecciona hitos significativos', () => {
  const rows = [
    { year: 2026, age: 35, value: 100 },
    { year: 2036, age: 45, value: 200 },
    { year: 2046, age: 55, value: 300 },
    { year: 2056, age: 65, value: 400 },
  ];

  const result = seleccionarHitosSignificativos({
    rows,
    maxMilestones: 3,
  });

  assert(Array.isArray(result), 'Debe regresar arreglo');
  assert(result.length <= 3, 'Debe respetar máximo de hitos');
});

test('critical path proyecta valores de rescate dinámicos con UDI', () => {
  const result = proyectarValoresRescateDinamicos({
    currentUdiValue: 8.7,
    currentAge: 35,
    extractedCashValueRows: [
      { age: 45, udis: 1000 },
      { age: 55, udis: 2000 },
      { age: 65, udis: 3000 },
    ],
    rates: {
      conservativeRate: 0.03,
      baseRate: 0.045,
      aggressiveRate: 0.06,
    },
    maxMilestones: 3,
  });

  assert(Array.isArray(result), 'Debe regresar arreglo');
  assert(result.length <= 3, 'Debe respetar máximo de hitos');
  assert(Boolean(result[0].scenarios), 'Debe incluir escenarios');
  assert(result[0].scenarios.base > 0, 'Debe calcular escenario base');
});

test('critical path presentation pipeline básico', () => {
  const result = prepararInputPresentacion({
    extractedFields: {
      productName: 'Imagina Ser',
      carrierName: 'Seguros Monterrey',
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

  assert(result.readyForPresentation === true, 'Debe estar listo para presentación');
  assert(result.productDetection.status === 'PRODUCT_CONFIRMED', 'Debe confirmar producto');
});

console.log('\nFORGE CRITICAL PATH REPORT v0.2\n');

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
