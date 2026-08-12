import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { compareCommercialLeverage } = require("../platform/business-intelligence/commercial-leverage-pilot-read-model.js");

function model(advisorId, from, to, input, sales, coverage = "COMPLETE") { return { schema: "COMMERCIAL_FUNNEL_RECONCILIATION_READ_MODEL_017B", advisorId, period: { from, to }, stages: { CONTACT: { value: input, coverage }, CONFIRMED_POLICY: { value: sales, coverage } } }; }
const baseline = model("advisor-017c", "2026-06-01T00:00:00Z", "2026-07-01T00:00:00Z", 100, 10);
const current = model("advisor-017c", "2026-07-01T00:00:00Z", "2026-07-31T00:00:00Z", 100, 13);

test("100 opportunities-compatible contacts to 10 vs 13 confirmed policies is +30 percent", () => {
  const comparison = compareCommercialLeverage({ baseline, current });
  assert.equal(comparison.state, "COMPARABLE");
  assert.equal(comparison.observedSalesUplift, 0.3);
  assert.equal(comparison.conversionPointChange, 0.03);
  assert.equal(comparison.causalAttribution, false);
  assert.equal(comparison.readiness, "PILOT_READY");
});

test("10 percent to 30 percent is +20 points and +200 percent relative", () => {
  const result = compareCommercialLeverage({ baseline, current: model("advisor-017c", "2026-07-01T00:00:00Z", "2026-07-31T00:00:00Z", 100, 30) });
  assert.equal(result.conversionPointChange, 0.2);
  assert.equal(result.observedSalesUplift, 2);
});

test("unknown and incompatible cohorts never produce uplift", () => {
  const unknown = compareCommercialLeverage({ baseline, current: model("advisor-017c", "2026-07-01T00:00:00Z", "2026-07-31T00:00:00Z", null, null, "PARTIAL") });
  assert.equal(unknown.state, "UNKNOWN"); assert.equal(unknown.observedSalesUplift, null);
  const differentInput = compareCommercialLeverage({ baseline, current: model("advisor-017c", "2026-07-01T00:00:00Z", "2026-07-31T00:00:00Z", 130, 13) });
  assert.equal(differentInput.state, "NOT_COMPARABLE"); assert.equal(differentInput.observedSalesUplift, null);
});

test("advisor and duration isolation are mandatory", () => {
  assert.throws(() => compareCommercialLeverage({ baseline, current: { ...current, advisorId: "advisor-b" } }), /ADVISOR_MISMATCH/);
  assert.equal(compareCommercialLeverage({ baseline, current: model("advisor-017c", "2026-07-01T00:00:00Z", "2026-08-01T00:00:00Z", 100, 13) }).state, "NOT_COMPARABLE");
});
