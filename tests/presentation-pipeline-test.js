import fs from 'node:fs';
import { prepararInputPresentacion } from '../presentation-input-pipeline.js';

const fixture = JSON.parse(
  fs.readFileSync(
    'tests/fixtures/presentation-basic-imagina-ser.json',
    'utf8'
  )
);

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

test('presentation-input-pipeline prepara input desde fixture Imagina Ser', () => {
  const result = prepararInputPresentacion(fixture);

  assert(Boolean(result), 'Debe regresar resultado');
  assert(Boolean(result.quotation), 'Debe regresar quotation');
  assert(Boolean(result.productDetection), 'Debe regresar productDetection');
  assert(result.productDetection.status === 'PRODUCT_CONFIRMED', 'Debe confirmar producto');
  assert(result.readyForPresentation === true, 'Debe estar listo para presentación');
});

console.log('\nFORGE PRESENTATION PIPELINE REPORT v0.2\n');

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
