import { buildVidaMujerSurvivalSchedule } from '../vida-mujer-survival-schedule-engine.js';

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
  if (value === null || value === undefined) {
    return 'N/A';
  }

  return `$${Math.round(value).toLocaleString()} MXN`;
}

function amount(value, currency) {
  return `${Math.round(value).toLocaleString()} ${currency}`;
}

const udiSchedule =
  buildVidaMujerSurvivalSchedule({
    sumAssured: 35000,
    currency: 'UDI',
    startAge: 31,
    coverageYears: 20,
    exchangeRateToMXN: 8.7,
    projectionRate: 0.045
  });

const usdSchedule =
  buildVidaMujerSurvivalSchedule({
    sumAssured: 50000,
    currency: 'USD',
    startAge: 31,
    coverageYears: 20,
    exchangeRateToMXN: 18,
    projectionRate: 0.03
  });

test('Vida Mujer UDI calcula pagos intermedios de 5%', () => {
  const intermediatePayments =
    udiSchedule.payments.filter(
      payment => payment.type === 'INTERMEDIATE_SURVIVAL_BENEFIT'
    );

  assert(intermediatePayments.length === 7, 'Debe tener 7 pagos intermedios');

  for (const payment of intermediatePayments) {
    assert(payment.percent === 5, 'Cada pago intermedio debe ser 5%');
    assert(payment.amount === 1750, 'Cada pago intermedio debe ser 1,750 UDI');
    assert(payment.amountMXN > 15225, 'Debe proyectar MXN por año, no usar solo UDI actual');
  }
});

test('Vida Mujer UDI calcula pago final de 80%', () => {
  const finalPayment =
    udiSchedule.payments.find(
      payment => payment.type === 'FINAL_SURVIVAL_BENEFIT'
    );

  assert(Boolean(finalPayment), 'Debe existir pago final');
  assert(finalPayment.year === 20, 'Debe ser año 20');
  assert(finalPayment.percent === 80, 'Debe ser 80%');
  assert(finalPayment.amount === 28000, 'Debe ser 28,000 UDI');
  assert(finalPayment.amountMXN > 243600, 'Debe proyectar MXN al año 20');
});

test('Vida Mujer UDI calcula total supervivencia', () => {
  assert(
    udiSchedule.totalSurvivalBenefit === 40250,
    'Debe sumar 40,250 UDI'
  );

  assert(
    udiSchedule.totalSurvivalBenefitMXN > 350175,
    'Debe convertir usando valores proyectados'
  );
});

test('Vida Mujer USD calcula pagos intermedios de 5%', () => {
  const intermediatePayments =
    usdSchedule.payments.filter(
      payment => payment.type === 'INTERMEDIATE_SURVIVAL_BENEFIT'
    );

  assert(intermediatePayments.length === 7, 'Debe tener 7 pagos intermedios');

  for (const payment of intermediatePayments) {
    assert(payment.percent === 5, 'Cada pago intermedio debe ser 5%');
    assert(payment.amount === 2500, 'Cada pago intermedio debe ser 2,500 USD');
  }
});

test('Vida Mujer USD calcula pago final de 80%', () => {
  const finalPayment =
    usdSchedule.payments.find(
      payment => payment.type === 'FINAL_SURVIVAL_BENEFIT'
    );

  assert(Boolean(finalPayment), 'Debe existir pago final');
  assert(finalPayment.amount === 40000, 'Debe ser 40,000 USD');
});

test('Vida Mujer USD calcula beneficio total por supervivencia', () => {
  assert(
    usdSchedule.totalSurvivalBenefit === 57500,
    'Debe sumar 57,500 USD'
  );
});

test('Vida Mujer no convierte sin tipo de cambio', () => {
  const noRateSchedule =
    buildVidaMujerSurvivalSchedule({
      sumAssured: 35000,
      currency: 'UDI',
      startAge: 31,
      coverageYears: 20
    });

  assert(
    noRateSchedule.conversionStatus === 'MISSING_EXCHANGE_RATE',
    'Debe marcar tipo de cambio faltante'
  );

  assert(
    noRateSchedule.totalSurvivalBenefitMXN === null,
    'No debe convertir sin tipo de cambio'
  );
});

console.log('\nFORGE VIDA MUJER SURVIVAL SCHEDULE REPORT v0.3\n');

console.log('UDI schedule');
console.log(`Suma asegurada: ${amount(udiSchedule.sumAssured, udiSchedule.currency)} / ${money(udiSchedule.sumAssuredMXN)}`);
console.log(`Conversión: ${udiSchedule.conversionStatus}`);

for (const payment of udiSchedule.payments) {
  console.log(
    `Año ${payment.year} / Edad ${payment.age}: ${payment.percent}% = ${amount(payment.amount, payment.currency)} / ${money(payment.amountMXN)}`
  );
}

console.log(`Total supervivencia: ${amount(udiSchedule.totalSurvivalBenefit, udiSchedule.currency)} / ${money(udiSchedule.totalSurvivalBenefitMXN)}`);

console.log('\nUSD schedule');
console.log(`Suma asegurada: ${amount(usdSchedule.sumAssured, usdSchedule.currency)} / ${money(usdSchedule.sumAssuredMXN)}`);
console.log(`Conversión: ${usdSchedule.conversionStatus}`);

for (const payment of usdSchedule.payments) {
  console.log(
    `Año ${payment.year} / Edad ${payment.age}: ${payment.percent}% = ${amount(payment.amount, payment.currency)} / ${money(payment.amountMXN)}`
  );
}

console.log(`Total supervivencia: ${amount(usdSchedule.totalSurvivalBenefit, usdSchedule.currency)} / ${money(usdSchedule.totalSurvivalBenefitMXN)}`);

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
