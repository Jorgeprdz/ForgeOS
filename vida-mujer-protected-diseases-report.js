const {
  calculateProtectedDiseases
} = require(
  "./vida-mujer-protected-diseases-engine"
);

const diseaseDefinitions = [
  {
    event:
      "PROTECTED_DISEASE",
    coverageName:
      "Enfermedades protegidas",
    coveragePercentage: 1
  }
];

function formatMoney(value) {
  if (value === null) {
    return "N/A";
  }

  return value.toLocaleString(
    "es-MX",
    {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0
    }
  );
}

console.log(
  "\nFORGE VIDA MUJER PROTECTED DISEASES REPORT v0.1\n"
);

const udiCase =
  calculateProtectedDiseases({
    sumAssured: 35000,
    currency: "UDI",
    diseaseDefinitions,
    currentExchangeRate: 8.7
  });

const usdCase =
  calculateProtectedDiseases({
    sumAssured: 50000,
    currency: "USD",
    diseaseDefinitions,
    currentExchangeRate: 18
  });

console.log("UDI CASE");

udiCase.forEach((item) => {
  console.log(
    `${item.coverageName}`
  );

  console.log(
    `Monto cubierto: ${item.coveredAmount.toLocaleString()} ${item.currency}`
  );

  console.log(
    `MXN: ${formatMoney(item.mxn)}`
  );

  console.log("");
});

console.log("USD CASE");

usdCase.forEach((item) => {
  console.log(
    `${item.coverageName}`
  );

  console.log(
    `Monto cubierto: ${item.coveredAmount.toLocaleString()} ${item.currency}`
  );

  console.log(
    `MXN: ${formatMoney(item.mxn)}`
  );

  console.log("");
});

const noRateCase =
  calculateProtectedDiseases({
    sumAssured: 35000,
    currency: "UDI",
    diseaseDefinitions,
    currentExchangeRate: null
  });

const tests = [
  {
    name:
      "Vida Mujer calcula enfermedades protegidas UDI",
    pass:
      udiCase[0]
        .coveredAmount === 35000
  },

  {
    name:
      "Vida Mujer convierte UDI a MXN",
    pass:
      udiCase[0]
        .mxn === 304500
  },

  {
    name:
      "Vida Mujer calcula enfermedades protegidas USD",
    pass:
      usdCase[0]
        .coveredAmount === 50000
  },

  {
    name:
      "Vida Mujer convierte USD a MXN",
    pass:
      usdCase[0]
        .mxn === 900000
  },

  {
    name:
      "Vida Mujer bloquea conversión sin tipo de cambio",
    pass:
      noRateCase[0]
        .conversionStatus ===
      "BLOCKED_NO_EXCHANGE_RATE"
  }
];

console.log("Resultados\n");

tests.forEach((test) => {
  console.log(
    `${test.pass ? "✅" : "❌"} ${test.name}`
  );
});

const pass =
  tests.filter(
    (test) => test.pass
  ).length;

const fail =
  tests.length - pass;

console.log("\nResumen:");

console.log(
  `Total: ${tests.length}`
);

console.log(
  `Pass: ${pass}`
);

console.log(
  `Fail: ${fail}`
);
