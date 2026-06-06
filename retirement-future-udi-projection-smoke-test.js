const {
  CALCULATION_MODE,
  projectFutureUdiValue,
  projectRetirementFutureUdi
} = require("./retirement-future-udi-projection-engine");
const {
  buildImaginaSerFutureMxnBridge
} = require("./imagina-ser-future-mxn-bridge");

const results = [];

function test(label, fn) {
  try {
    fn();
    results.push({ label, status: "PASS" });
  } catch (error) {
    results.push({ label, status: "FAIL", error: error.message });
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertClose(actual, expected, tolerance, label) {
  const difference = Math.abs(actual - expected);

  assert(
    difference <= tolerance,
    `${label}: expected ${expected}, got ${actual}, diff ${difference}`
  );
}

const quoteFacts = {
  product: "IMAGINA_SER",
  clientName: "Edwin Marquez",
  insuredAge: 23,
  retirementAge: 65,
  paymentYears: 15,
  annualTotalPremium: 3222,
  annualBasicPremium: 3222,
  sumInsuredUDI: 75000,
  scenarios: {
    BASE: {
      singlePaymentUDI: 82829,
      monthlyIncomeUDI: 390
    },
    FAVORABLE: {
      singlePaymentUDI: 128697,
      monthlyIncomeUDI: 606
    },
    DESFAVORABLE: {
      singlePaymentUDI: 57228,
      monthlyIncomeUDI: 269
    }
  }
};

const currentUdiValue = 8.85;
const preRetirementProjectionRate = 0.045;
const premiumProjectionRate = 0.045;
const annuityProjectionRate = 0.045;

test("UDI hoy 8.85 es aceptada", () => {
  const result = projectFutureUdiValue({
    currentAge: 23,
    targetAge: 23,
    currentUdiValue,
    projectionRate: preRetirementProjectionRate
  });

  assertClose(result.projectedUdiValue, 8.85, 0.000001, "UDI hoy");
});

test("UDI proyectada a edad 65 usa tasa global 4.5%", () => {
  const result = projectFutureUdiValue({
    currentAge: 23,
    targetAge: 65,
    currentUdiValue,
    projectionRate: preRetirementProjectionRate
  });

  assertClose(
    result.projectedUdiValue,
    56.2117970349031,
    0.000001,
    "UDI proyectada edad 65"
  );
});

test("128,697 UDI convierte con tasa global 4.5% a edad 65", () => {
  const result = projectRetirementFutureUdi({
    currentAge: 23,
    targetAge: 65,
    currentUdiValue,
    amountUDI: 128697,
    projectionRate: preRetirementProjectionRate,
    valueType: "RETIREMENT_LUMP_SUM"
  });

  assertClose(result.projectedMXN, 7234289.643001, 1, "Pago unico favorable");
});

test("606 UDI convierte con tasa global 4.5% a edad 65", () => {
  const result = projectRetirementFutureUdi({
    currentAge: 23,
    targetAge: 65,
    currentUdiValue,
    amountUDI: 606,
    projectionRate: preRetirementProjectionRate,
    valueType: "RETIREMENT_MONTHLY_INCOME"
  });

  assertClose(result.projectedMXN, 34064.349003, 1, "Renta mensual favorable");
});

test("79,992 UDI acumula con tasa global 4.5% a edad 75", () => {
  const result = buildImaginaSerFutureMxnBridge({
    quoteFacts,
    currentUdiValue,
    projectionConfig: {
      preRetirementProjectionRate,
      premiumProjectionRate,
      annuityProjectionRate
    }
  });

  assertClose(
    result.accumulatedAt75.accumulatedUDI,
    79992,
    0,
    "UDI acumulada edad 75"
  );
  assertClose(
    result.accumulatedAt75.accumulatedMXN,
    5657888.940472,
    1,
    "MXN acumulado edad 75"
  );
});

test("116,352 UDI acumula con tasa global 4.5% a edad 80", () => {
  const result = buildImaginaSerFutureMxnBridge({
    quoteFacts,
    currentUdiValue,
    projectionConfig: {
      preRetirementProjectionRate,
      premiumProjectionRate,
      annuityProjectionRate
    }
  });

  assertClose(
    result.accumulatedAt80.accumulatedUDI,
    116352,
    0,
    "UDI acumulada edad 80"
  );
  assertClose(
    result.accumulatedAt80.accumulatedMXN,
    9287032.987527,
    1,
    "MXN acumulado edad 80"
  );
});

test("El motor no usa UDI actual para valores futuros de retiro", () => {
  const result = projectRetirementFutureUdi({
    currentAge: 23,
    targetAge: 65,
    currentUdiValue,
    amountUDI: 128697,
    projectionRate: preRetirementProjectionRate,
    valueType: "RETIREMENT_LUMP_SUM"
  });
  const currentValueMXN = 128697 * currentUdiValue;

  assert(result.projectedMXN !== currentValueMXN, "No debe usar UDI actual");
  assert(result.projectedUdiValue > currentUdiValue, "Debe proyectar UDI");
});

test("calculationMode esta presente", () => {
  const result = projectRetirementFutureUdi({
    currentAge: 23,
    targetAge: 65,
    currentUdiValue,
    amountUDI: 128697,
    projectionRate: preRetirementProjectionRate,
    valueType: "RETIREMENT_LUMP_SUM"
  });

  assert(result.calculationMode === CALCULATION_MODE, "Modo incorrecto");
});

test("No se usa lenguaje garantizado", () => {
  const result = projectRetirementFutureUdi({
    currentAge: 23,
    targetAge: 65,
    currentUdiValue,
    amountUDI: 128697,
    projectionRate: preRetirementProjectionRate,
    valueType: "RETIREMENT_LUMP_SUM"
  });

  assert(
    !/^GUARANTEED/.test(result.calculationMode),
    "No debe presentar el valor como garantizado"
  );
  assert(
    /ESTIMATE_NOT_GUARANTEED$/.test(result.calculationMode),
    "Debe marcar estimate not guaranteed"
  );
});

console.log("\nFORGE RETIREMENT FUTURE UDI PROJECTION SMOKE TEST\n");

for (const result of results) {
  if (result.status === "PASS") {
    console.log(`PASS ${result.label}`);
  } else {
    console.log(`FAIL ${result.label}`);
    console.log(`  ${result.error}`);
  }
}

const failed = results.filter(result => result.status === "FAIL");

console.log("\nResumen:");
console.log(`Total: ${results.length}`);
console.log(`Pass: ${results.length - failed.length}`);
console.log(`Fail: ${failed.length}`);
console.log(`Status: ${failed.length === 0 ? "PASS" : "FAIL"}`);

if (failed.length > 0) {
  process.exit(1);
}
