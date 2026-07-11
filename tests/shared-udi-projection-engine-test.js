const assert = require("node:assert/strict");
const fs = require("node:fs");

const {
  buildUdiProjectionTimeline,
  convertUdiAmountAtAge,
  sumAnnualUdiPaymentsToMxn,
  buildUniversalUdiQuoteProjection
} = require("../shared-udi-projection-engine");

function approx(actual, expected, tolerance = 0.01) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `Expected ${actual} to be within ${tolerance} of ${expected}`
  );
}

const excelFixture = {
  baseUdiValue: 8.8299,
  baseUdiSource: "EXCEL_VALIDATION_FIXTURE",
  baseUdiDate: "2026-07-11",
  currentAge: 23,
  retirementAge: 65,
  maxAge: 90,
  annualPremiumUdi: 3437,
  premiumPayingYears: 15,
  sumAssuredUdi: 75000,
  singlePaymentUdiAtRetirement: 89982,
  monthlyIncomeUdiAtRetirement: 606,
  annualIncomeUdiAtRetirement: 7272,
  savingsUdiGrowthRate: 0.04,
  retirementUdiGrowthRate: 0.045,
  projectedUdiAtRetirement: 46.177,
  incomeMilestoneAges: [75, 80, 85, 90]
};

const savingsTimeline = buildUdiProjectionTimeline({
  baseUdiValue: excelFixture.baseUdiValue,
  baseAge: excelFixture.currentAge,
  maxAge: excelFixture.currentAge + excelFixture.premiumPayingYears - 1,
  annualGrowthRate: excelFixture.savingsUdiGrowthRate
});

assert.equal(savingsTimeline[0].age, 23);
assert.equal(savingsTimeline[0].projectedUdiValue, 8.8299);
approx(savingsTimeline[14].projectedUdiValue, 15.290529864688002, 1e-9);

const totalContributed = sumAnnualUdiPaymentsToMxn({
  annualAmountUdi: excelFixture.annualPremiumUdi,
  startAge: excelFixture.currentAge,
  paymentYears: excelFixture.premiumPayingYears,
  timeline: savingsTimeline
});

assert.equal(totalContributed.udi, 51555);
approx(totalContributed.mxn, 607683.17226824863);

const retirementTimeline = buildUdiProjectionTimeline({
  baseUdiValue: excelFixture.projectedUdiAtRetirement,
  baseAge: excelFixture.retirementAge,
  maxAge: 90,
  annualGrowthRate: excelFixture.retirementUdiGrowthRate
});

const singlePayment = convertUdiAmountAtAge({
  amountUdi: excelFixture.singlePaymentUdiAtRetirement,
  targetAge: excelFixture.retirementAge,
  timeline: retirementTimeline
});

approx(singlePayment.mxn, 4155098.8139999998);

const projection = buildUniversalUdiQuoteProjection(excelFixture);

assert.equal(projection.status, "READY");
assert.equal(projection.totalContributed.udi, 51555);
approx(projection.totalContributed.mxn, 607683.17226824863);
approx(projection.protection.death.mxnCurrent, 662242.5);
approx(projection.protection.disability.mxnCurrent, 662242.5);
approx(projection.retirement.singlePayment.mxnAtRetirement, 4155098.8139999998);
approx(projection.retirement.monthlyIncome.mxnAtRetirement, 27983.261999999999);
approx(projection.retirement.annualIncome.mxnAtRetirement, 335799.14399999997);

const accumulatedByAge = Object.fromEntries(
  projection.retirement.accumulatedIncome.map((item) => [item.toAge, item])
);

approx(accumulatedByAge[75].mxn, 4647855.9908334548);
approx(accumulatedByAge[80].mxn, 7629133.8275268683);
approx(accumulatedByAge[85].mxn, 11344348.418739783);
approx(accumulatedByAge[90].mxn, 15974181.736814652);

const fallback = buildUniversalUdiQuoteProjection({
  ...excelFixture,
  baseUdiValue: null
});

assert.equal(fallback.status, "BLOCKED_NO_VERIFIED_UDI_RATE");
assert.equal(fallback.baseUdi.value, null);

const engineSource = fs.readFileSync("shared-udi-projection-engine.js", "utf8");
assert(!engineSource.includes("BANXICO_TOKEN"), "engine must not reference BANXICO_TOKEN");
assert(!engineSource.includes("Bmx-Token"), "engine must not reference Banxico headers");
assert(!engineSource.includes(".PDF"), "engine must not reference PDF files");
assert(!engineSource.includes("607683"), "Excel expected output must stay out of engine");
assert(!engineSource.includes("4155098"), "Excel expected output must stay out of engine");
assert(!engineSource.includes("15974181"), "Excel expected output must stay out of engine");

console.log("PASS shared UDI projection engine");
