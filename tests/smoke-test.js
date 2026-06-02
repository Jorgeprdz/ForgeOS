import { agregarEventoTimeline } from '../policy-timeline-engine.js';
import { detectarRenovaciones } from '../policy-renewal-engine.js';
import { detectarProductoCotizacion } from '../product-detection-engine.js';

const results = [];

function test(name, fn) {
  try {
    fn();
    results.push({ name, status: 'PASS' });
  } catch (error) {
    results.push({
      name,
      status: 'FAIL',
      error: error.message,
    });
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

test('policy-timeline-engine agrega evento al inicio del timeline', () => {
  const timeline = [
    {
      id: 'old-event',
      type: 'OLD',
      detail: 'Evento anterior',
      createdAt: Date.now() - 1000,
    },
  ];

  const updated = agregarEventoTimeline({
    timeline,
    type: 'CALL',
    detail: 'Llamada realizada',
  });

  assert(Array.isArray(updated), 'Debe regresar un arreglo');
  assert(updated.length === 2, 'Debe agregar un evento');
  assert(updated[0].type === 'CALL', 'El nuevo evento debe quedar al inicio');
  assert(updated[0].detail === 'Llamada realizada', 'Debe conservar el detalle');
  assert(Boolean(updated[0].id), 'Debe generar id');
  assert(Boolean(updated[0].createdAt), 'Debe generar createdAt');
});

test('policy-renewal-engine detecta pólizas que vencen dentro del rango', () => {
  const now = new Date();

  const inTenDays = new Date(now);
  inTenDays.setDate(now.getDate() + 10);

  const inFortyDays = new Date(now);
  inFortyDays.setDate(now.getDate() + 40);

  const expired = new Date(now);
  expired.setDate(now.getDate() - 5);

  const result = detectarRenovaciones({
    days: 30,
    polizas: [
      {
        id: 'inside-range',
        fechaRenovacion: inTenDays.toISOString(),
      },
      {
        id: 'outside-range',
        fechaRenovacion: inFortyDays.toISOString(),
      },
      {
        id: 'expired',
        fechaRenovacion: expired.toISOString(),
      },
    ],
  });

  assert(result.length === 1, 'Debe regresar solo una póliza');
  assert(result[0].id === 'inside-range', 'Debe detectar la póliza dentro del rango');
});

test('product-detection-engine detecta producto con alta confianza', () => {
  const result = detectarProductoCotizacion({
    productName: 'Imagina Ser',
    carrierName: 'Seguros Monterrey',
    productLibrary: [
      {
        id: 'imagina-ser',
        canonicalName: 'Imagina Ser',
        carrierName: 'Seguros Monterrey New York Life',
        aliases: ['imagina ser', 'plan imagina ser'],
      },
    ],
  });

  assert(result.matched === true, 'Debe detectar producto');
  assert(result.confidence === 'HIGH', 'Debe tener confianza alta');
  assert(result.status === 'PRODUCT_CONFIRMED', 'Debe confirmar producto');
});

console.log('\nFORGE QA REPORT v0.2\n');

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

if (failed.length > 0) {
  process.exit(1);
}
