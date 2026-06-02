import { extraerTextoOCR }
  from '../policy-ocr-engine.js';

import { parseGMMQuote }
  from '../gmm-quote-parser.js';

const PDF_PATH =
  '/storage/emulated/0/Download/Solucionline_20251215_16_06.PDF';

const ocr =
  await extraerTextoOCR({
    filePath:
      PDF_PATH
  });

const quote =
  parseGMMQuote({
    text:
      ocr.extractedText
  });

const results = [];

function test(name, fn) {

  try {

    fn();

    results.push({
      name,
      status: 'PASS'
    });

  } catch (error) {

    results.push({
      name,
      status: 'FAIL',
      error:
        error.message
    });
  }
}

function assert(condition, message) {

  if (!condition) {

    throw new Error(
      message
    );
  }
}

test(
  'detecta producto Alfa Medical',
  () => {

    assert(
      quote.productName ===
      'Alfa Medical',
      'Producto incorrecto'
    );
  }
);

test(
  'detecta plan INTEGRO',
  () => {

    assert(
      quote.plan ===
      'INTEGRO',
      'Plan incorrecto'
    );
  }
);

test(
  'detecta deducible',
  () => {

    assert(
      quote.deductible ===
      40000,
      'Deducible incorrecto'
    );
  }
);

test(
  'detecta coaseguro',
  () => {

    assert(
      quote.coinsurance.percent ===
      10,
      'Coaseguro incorrecto'
    );
  }
);

test(
  'detecta tope coaseguro',
  () => {

    assert(
      quote.coinsurance.maxOutOfPocket ===
      85000,
      'Tope incorrecto'
    );
  }
);

test(
  'detecta suma asegurada',
  () => {

    assert(
      quote.sumAssured ===
      160000000,
      'Suma asegurada incorrecta'
    );
  }
);

test(
  'detecta tabulador',
  () => {

    assert(
      quote.tabulator ===
      'GAMMA',
      'Tabulador incorrecto'
    );
  }
);

test(
  'detecta territorialidad',
  () => {

    assert(
      quote.territoriality ===
      'NACIONAL',
      'Territorialidad incorrecta'
    );
  }
);

test(
  'detecta prima anual real',
  () => {

    assert(
      quote.annualPremium ===
      35629.03,
      'Prima incorrecta'
    );
  }
);

console.log(
  '\nFORGE GMM REPORT v0.1\n'
);

for (const result of results) {

  if (
    result.status === 'PASS'
  ) {

    console.log(
      `✅ ${result.name}`
    );

  } else {

    console.log(
      `❌ ${result.name}`
    );

    console.log(
      `   ${result.error}`
    );
  }
}

console.log('\nQuote:');
console.log(
  JSON.stringify(
    quote,
    null,
    2
  )
);

const failed =
  results.filter(
    r =>
      r.status === 'FAIL'
  );

console.log('\nResumen:');
console.log(
  `Total: ${results.length}`
);
console.log(
  `Pass: ${
    results.length -
    failed.length
  }`
);
console.log(
  `Fail: ${failed.length}`
);

if (
  failed.length > 0
) {
  process.exit(1);
}
