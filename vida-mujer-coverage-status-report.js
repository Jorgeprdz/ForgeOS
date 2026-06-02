const {
  buildCoverageStatus
} = require("./vida-mujer-coverage-status-engine");

const contractedCoverages = [
  "VIDA_MUJER",
  "BAM",
  "BAIT",
  "AV",
  "BIT",
  "BMA",
  "PCF"
];

const recommendedCoverages = [
  "ADAPTA",
  "PEP",
  "CLP"
];

const status =
  buildCoverageStatus({
    contractedCoverages,
    recommendedCoverages
  });

console.log(
  "\nFORGE VIDA MUJER COVERAGE STATUS REPORT v0.1\n"
);

Object.entries(status)
  .forEach(([name, value]) => {
    console.log(
      `${name}: ${value.status}`
    );
  });

const tests = [
  {
    name:
      "PCF aparece como contratada",
    pass:
      status.PCF.status ===
      "CONTRACTED"
  },

  {
    name:
      "BMA aparece como contratada",
    pass:
      status.BMA.status ===
      "CONTRACTED"
  },

  {
    name:
      "PEP aparece como recomendada",
    pass:
      status.PEP.status ===
      "RECOMMENDED"
  },

  {
    name:
      "CLP aparece como recomendada",
    pass:
      status.CLP.status ===
      "RECOMMENDED"
  },

  {
    name:
      "ADAPTA aparece como recomendada",
    pass:
      status.ADAPTA.status ===
      "RECOMMENDED"
  }
];

console.log("\nResultados\n");

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
console.log(`Total: ${tests.length}`);
console.log(`Pass: ${pass}`);
console.log(`Fail: ${fail}`);
