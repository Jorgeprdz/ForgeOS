import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import path from "node:path";

const { buildQuoteBenefitSummary } = await import(
  pathToFileURL(path.resolve("quote-benefit-summary-engine.js")).href
);

function findBlock(blocks, type) {
  return blocks.find((block) => block.type === type);
}

function findLine(block, id) {
  return block.lines.find((line) => line.id === id);
}

const imaginaNativeResult = {
  productName: "IMAGINA SER 65 PAGOS LIMITADOS 15",
  currency: "UDI",
  currentAge: 23,
  retirementAge: 65,
  sumAssuredUdi: 75000,
  premiumStructure: {
    totalAnnualPremium: 3437,
    premiumPayingYears: 15
  },
  scenarios: {
    favorable: {
      lumpSum: 115000,
      monthlyIncome: 775,
      projectedUdiValue: 46.177,
      targetAge: 65
    },
    base: {
      lumpSum: 89982,
      monthlyIncome: 606,
      projectedUdiValue: 46.177,
      targetAge: 65
    },
    unfavorable: {
      lumpSum: 72000,
      monthlyIncome: 430,
      projectedUdiValue: 46.177,
      targetAge: 65
    }
  }
};

const imaginaUdiProjection = {
  totalContributed: {
    udi: 51555,
    mxn: 607683.17
  },
  protection: {
    death: {
      udi: 75000,
      mxnCurrent: 662242.5
    }
  },
  retirement: {
    singlePayment: {
      udi: 89982,
      mxnAtRetirement: 4155098.814,
      projectedUdiValue: 46.177,
      targetAge: 65
    },
    monthlyIncome: {
      udi: 606,
      mxnAtRetirement: 27983.262,
      projectedUdiValue: 46.177,
      targetAge: 65
    },
    annualIncome: {
      udi: 7272,
      mxnAtRetirement: 335799.144,
      projectedUdiValue: 46.177,
      targetAge: 65
    },
    accumulatedIncome: [
      {
        fromAge: 65,
        toAge: 75,
        udi: 79992,
        mxn: 4647855.99
      }
    ]
  }
};

const blocks = buildQuoteBenefitSummary({
  productFamily: "Imagina Ser",
  nativeResult: imaginaNativeResult,
  udiProjection: imaginaUdiProjection
});

const contribution = findBlock(blocks, "contribution_summary");
assert.ok(contribution);
assert.equal(findLine(contribution, "total_contributed_udi").value, 51555);
assert.equal(findLine(contribution, "total_contributed_mxn_projected").value, 607683.17);
assert.equal(findLine(contribution, "premium_paying_years").value, 15);

const protection = findBlock(blocks, "protection_summary");
assert.ok(protection);
assert.equal(findLine(protection, "sum_assured_udi").value, 75000);
assert.equal(findLine(protection, "sum_assured_mxn_current").value, 662242.5);

const retirementScenarios = findBlock(blocks, "retirement_scenarios");
assert.ok(retirementScenarios);
assert.equal(retirementScenarios.scenarios.length, 3);
assert.deepEqual(
  retirementScenarios.scenarios.map((scenario) => scenario.id),
  ["favorable", "base", "unfavorable"]
);
assert.equal(retirementScenarios.missing.length, 0);

for (const scenario of retirementScenarios.scenarios) {
  assert.ok(scenario.singlePayment.udi > 0);
  assert.ok(scenario.singlePayment.mxn > 0);
  assert.equal(
    scenario.singlePayment.mxn,
    scenario.singlePayment.udi * scenario.singlePayment.projectedUdiValue
  );
  assert.ok(scenario.monthlyIncome.udi > 0);
  assert.ok(scenario.monthlyIncome.mxn > 0);
  assert.equal(
    scenario.monthlyIncome.mxn,
    scenario.monthlyIncome.udi * scenario.monthlyIncome.projectedUdiValue
  );
}

const baseScenario = retirementScenarios.scenarios.find((scenario) => scenario.id === "base");
assert.equal(baseScenario.singlePayment.udi, 89982);
assert.equal(baseScenario.singlePayment.mxn, 89982 * 46.177);
assert.equal(baseScenario.monthlyIncome.udi, 606);
assert.equal(baseScenario.monthlyIncome.mxn, 606 * 46.177);
assert.equal(baseScenario.annualIncome.udi, 7272);
assert.equal(baseScenario.annualIncome.mxn, 7272 * 46.177);
assert.deepEqual(baseScenario.accumulatedIncome, imaginaUdiProjection.retirement.accumulatedIncome);

const partialScenarioBlocks = buildQuoteBenefitSummary({
  productFamily: "Imagina Ser",
  nativeResult: {
    ...imaginaNativeResult,
    scenarios: {
      base: imaginaNativeResult.scenarios.base
    }
  },
  udiProjection: imaginaUdiProjection
});

const partialRetirement = findBlock(partialScenarioBlocks, "retirement_scenarios");
assert.equal(partialRetirement.scenarios.length, 1);
assert.equal(partialRetirement.scenarios[0].id, "base");
assert.deepEqual(partialRetirement.missing, [
  "Falta escenario favorable",
  "Falta escenario desfavorable"
]);

const partialMissing = findBlock(partialScenarioBlocks, "missing_information");
assert.ok(partialMissing);
assert.ok(
  partialMissing.lines.some((line) => line.label === "Falta escenario favorable")
);
assert.ok(
  partialMissing.lines.some((line) => line.label === "Falta escenario desfavorable")
);

const projectionOnlyBlocks = buildQuoteBenefitSummary({
  productFamily: "Imagina Ser",
  nativeResult: {
    productName: "IMAGINA SER",
    currentAge: 23,
    retirementAge: 65,
    sumAssuredUdi: 75000,
    premiumStructure: {
      totalAnnualPremium: 3437,
      premiumPayingYears: 15
    }
  },
  udiProjection: imaginaUdiProjection
});
const projectionOnlyRetirement = findBlock(projectionOnlyBlocks, "retirement_scenarios");
assert.equal(projectionOnlyRetirement.scenarios.length, 1);
assert.equal(projectionOnlyRetirement.scenarios[0].id, "base");
assert.equal(projectionOnlyRetirement.scenarios[0].singlePayment.udi, 89982);
assert.equal(projectionOnlyRetirement.scenarios[0].singlePayment.mxn, 4155098.814);
assert.deepEqual(projectionOnlyRetirement.missing, [
  "Falta escenario favorable",
  "Falta escenario desfavorable"
]);

const sparseImaginaBlocks = buildQuoteBenefitSummary({
  productFamily: "Imagina Ser",
  nativeResult: {
    productName: "IMAGINA SER",
    scenarios: {}
  },
  udiProjection: {}
});
assert.ok(!findBlock(sparseImaginaBlocks, "contribution_summary"));
assert.ok(!findBlock(sparseImaginaBlocks, "protection_summary"));
assert.ok(findBlock(sparseImaginaBlocks, "missing_information"));

for (const productFamily of ["Vida Mujer", "Segubeca", "ORVI", "PPR"]) {
  const productBlocks = buildQuoteBenefitSummary({
    productFamily,
    nativeResult: {},
    udiProjection: {}
  });
  assert.equal(productBlocks.length, 1);
  assert.equal(productBlocks[0].type, "missing_information");
  assert.match(productBlocks[0].lines[0].label, /Faltan reglas o datos suficientes/);
}

console.log("PASS quote benefit summary engine");
