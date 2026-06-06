const {
  CALCULATION_MODE,
  buildPolicyCurrencyTimeline
} = require("./shared-policy-currency-timeline-engine");

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
    `${label}: esperado ${expected}, obtenido ${actual}, diferencia ${difference}`
  );
}

const imaginaSerTimeline = buildPolicyCurrencyTimeline({
  currency: "UDI",
  currentCurrencyValue: 8.85,
  annualProjectionRate: 0.045,
  policyStartYear: 1,
  scenarios: ["BASE", "FAVORABLE", "DESFAVORABLE"],
  actuarialTable: [
    {
      policyYear: 1,
      contributionAmount: 3222,
      scenarios: {
        BASE: { recoveryAmount: 0, benefitAmount: 75000 },
        FAVORABLE: { recoveryAmount: 0, benefitAmount: 75000 },
        DESFAVORABLE: { recoveryAmount: 0, benefitAmount: 75000 }
      }
    },
    {
      policyYear: 2,
      contributionAmount: 3222,
      scenarios: {
        BASE: { recoveryAmount: 0, benefitAmount: 75000 },
        FAVORABLE: { recoveryAmount: 0, benefitAmount: 75000 },
        DESFAVORABLE: { recoveryAmount: 0, benefitAmount: 75000 }
      }
    },
    {
      policyYear: 3,
      contributionAmount: 3222,
      scenarios: {
        BASE: { recoveryAmount: 13467, benefitAmount: 75000 },
        FAVORABLE: { recoveryAmount: 15000, benefitAmount: 75000 },
        DESFAVORABLE: { recoveryAmount: 12000, benefitAmount: 75000 }
      }
    }
  ]
});

const monthlyIncomeTimeline = buildPolicyCurrencyTimeline({
  currency: "UDI",
  currentCurrencyValue: 56.2117970349031,
  annualProjectionRate: 0.045,
  policyStartYear: 65,
  scenarios: ["FAVORABLE"],
  actuarialTable: [
    {
      policyYear: 65,
      scenarios: {
        FAVORABLE: { benefitMonthly: 606 }
      }
    },
    {
      policyYear: 66,
      scenarios: {
        FAVORABLE: { benefitMonthly: 606 }
      }
    }
  ]
});

test("Proyecta moneda por año y no reutiliza la UDI actual", () => {
  const [year1, year2, year3] = imaginaSerTimeline.rows;

  assertClose(year1.projectedCurrencyValue, 8.85, 0.000001, "UDI año 1");
  assertClose(year2.projectedCurrencyValue, 9.24825, 0.000001, "UDI año 2");
  assertClose(year3.projectedCurrencyValue, 9.66442125, 0.000001, "UDI año 3");
  assert(year3.projectedCurrencyValue !== 8.85, "Año 3 no debe usar UDI actual");
});

test("Calcula aportacion nominal anual", () => {
  const [year1, year2, year3] = imaginaSerTimeline.rows;

  assertClose(
    year1.scenarios.BASE.contributionNominalYear,
    28514.7,
    0.000001,
    "Aportación año 1"
  );
  assertClose(
    year2.scenarios.BASE.contributionNominalYear,
    29797.8615,
    0.000001,
    "Aportación año 2"
  );
  assertClose(
    year3.scenarios.BASE.contributionNominalYear,
    31138.7652675,
    0.000001,
    "Aportación año 3"
  );
});

test("Valida total nominal acumulado de aportaciones", () => {
  assertClose(
    imaginaSerTimeline.totalsByScenario.BASE.totalContributionNominalAccumulated,
    89451.3267675,
    0.000001,
    "Total aportado nominal acumulado"
  );
});

test("Soporta escenarios base, favorable y desfavorable", () => {
  const year3 = imaginaSerTimeline.rows[2];

  assertClose(
    year3.scenarios.BASE.recoveryNominalYear,
    130150.76097375,
    0.000001,
    "Recuperación base año 3"
  );
  assertClose(
    year3.scenarios.FAVORABLE.recoveryNominalYear,
    144966.31875,
    0.000001,
    "Recuperación favorable año 3"
  );
  assertClose(
    year3.scenarios.DESFAVORABLE.recoveryNominalYear,
    115973.055,
    0.000001,
    "Recuperación desfavorable año 3"
  );
});

test("Soporta mensualidades y anualiza el valor nominal", () => {
  const [age65, age66] = monthlyIncomeTimeline.rows;

  assertClose(
    age65.scenarios.FAVORABLE.benefitNominalMonthly,
    34064.349003,
    0.000001,
    "Mensualidad edad 65"
  );
  assertClose(
    age65.scenarios.FAVORABLE.benefitNominalYear,
    408772.188038,
    0.000001,
    "Mensualidad anualizada edad 65"
  );
  assert(age66.projectedCurrencyValue > age65.projectedCurrencyValue);
});

test("Mantiene etiqueta de estimación no garantizada", () => {
  assert(imaginaSerTimeline.calculationMode === CALCULATION_MODE);
  assert(
    imaginaSerTimeline.disclosure ===
      "VALORES_NOMINALES_PROYECTADOS_NO_GARANTIZADOS"
  );
});

console.log("\nFORGE SHARED POLICY CURRENCY TIMELINE SMOKE TEST\n");

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
