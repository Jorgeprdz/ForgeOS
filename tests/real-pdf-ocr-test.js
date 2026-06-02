import { extraerTextoOCR } from '../policy-ocr-engine.js';

const PDF_PATH = '/storage/emulated/0/Download/Solucionline_20260601_13_09.PDF';

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

const ocrResult = await extraerTextoOCR({
  filePath: PDF_PATH,
});

test('real PDF OCR extrae texto de Solucionline', () => {
  assert(ocrResult.status === 'ocr_complete', 'Debe completar extracción');
  assert(ocrResult.extractedText.length > 100, 'Debe extraer texto suficiente');
});

test('real PDF OCR detecta producto Imagina Ser', () => {
  assert(
    ocrResult.extractedText.includes('IMAGINA SER'),
    'Debe contener IMAGINA SER'
  );
});

test('real PDF OCR detecta moneda UDI', () => {
  assert(
    ocrResult.extractedText.includes('Moneda: UDI')
      || ocrResult.extractedText.includes('Moneda')
      && ocrResult.extractedText.includes('UDI'),
    'Debe detectar moneda UDI'
  );
});

test('real PDF OCR detecta edad 38', () => {
  assert(
    ocrResult.extractedText.includes('Edad: 38')
      || ocrResult.extractedText.includes('Edad')
      && ocrResult.extractedText.includes('38'),
    'Debe detectar edad 38'
  );
});

test('real PDF OCR detecta escenarios principales', () => {
  assert(
    ocrResult.extractedText.includes('158,640'),
    'Debe detectar escenario base 158,640'
  );

  assert(
    ocrResult.extractedText.includes('199,865'),
    'Debe detectar escenario favorable 199,865'
  );

  assert(
    ocrResult.extractedText.includes('133,146'),
    'Debe detectar escenario desfavorable 133,146'
  );
});

console.log('\nFORGE REAL PDF OCR REPORT v0.1\n');

for (const result of results) {
  if (result.status === 'PASS') {
    console.log(`✅ ${result.name}`);
  } else {
    console.log(`❌ ${result.name}`);
    console.log(`   ${result.error}`);
  }
}

console.log('\nOCR status:', ocrResult.status);
console.log('OCR source:', ocrResult.source || 'unknown');
console.log('Texto extraído:', ocrResult.extractedText.length, 'caracteres');

const failed = results.filter((result) => result.status === 'FAIL');

console.log('\nResumen:');
console.log(`Total: ${results.length}`);
console.log(`Pass: ${results.length - failed.length}`);
console.log(`Fail: ${failed.length}`);

if (failed.length > 0) process.exit(1);
