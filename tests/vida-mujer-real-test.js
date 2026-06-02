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
      error: error.message
    });
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

/*
|--------------------------------------------------------------------------
| Simulación OCR real Vida Mujer
|--------------------------------------------------------------------------
*/

const quote = {

  productName:
    'Vida Mujer',

  currency:
    'UDI',

  annualPremium:
    2262.50,

  coverageYears:
    20,

  basicSumAssured:
    35000,

  survivalBenefit:
    40250,

  recoveryTable: [

    {
      age: 45,
      accumulatedPremium:
        33938,

      cashValue:
        13038,

      recoveryPercent:
        38.42
    },

    {
      age: 50,
      accumulatedPremium:
        45250,

      cashValue:
        28000,

      recoveryPercent:
        61.88
    }
  ]
};

test(
  'detecta producto Vida Mujer',
  () => {

    assert(
      quote.productName ===
      'Vida Mujer',
      'Producto incorrecto'
    );
  }
);

test(
  'detecta beneficio supervivencia',
  () => {

    assert(
      quote.survivalBenefit ===
      40250,
      'Beneficio incorrecto'
    );
  }
);

test(
  'detecta cobertura básica',
  () => {

    assert(
      quote.basicSumAssured ===
      35000,
      'Cobertura incorrecta'
    );
  }
);

test(
  'detecta recuperación edad 45',
  () => {

    const row =
      quote.recoveryTable.find(
        r => r.age === 45
      );

    assert(
      row.cashValue ===
      13038,
      'Recuperación incorrecta'
    );
  }
);

test(
  'detecta recuperación edad 50',
  () => {

    const row =
      quote.recoveryTable.find(
        r => r.age === 50
      );

    assert(
      row.cashValue ===
      28000,
      'Recuperación incorrecta'
    );
  }
);

console.log(
  '\nFORGE VIDA MUJER REPORT v0.1\n'
);

for (const result of results) {

  if (result.status === 'PASS') {

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

const failed =
  results.filter(
    r => r.status === 'FAIL'
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

if (failed.length > 0) {
  process.exit(1);
}
