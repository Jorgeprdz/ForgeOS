import assert from "node:assert/strict";

import {
  ORVI_MXN_POLICY_YEAR_OFFSET_RULE,
  ORVI_MXN_PROJECTION_AUTHORITY,
  ORVI_MXN_PROJECTION_AUTHORITY_ID,
  policyYearToProjectionOffset,
  resolveOrviMxnProjectionAuthority,
  validateOrviMxnProjectionAuthority,
} from "../product-intelligence/currency/orvi-mxn-projection-authority.js";

const validation = validateOrviMxnProjectionAuthority(
  ORVI_MXN_PROJECTION_AUTHORITY,
);

assert.deepEqual(validation, {
  valid: true,
  errors: [],
});

assert.equal(
  ORVI_MXN_PROJECTION_AUTHORITY_ID,
  "orvi.mxn-projection.engine-authority.v1",
);
assert.equal(ORVI_MXN_POLICY_YEAR_OFFSET_RULE, "policy_year_minus_one");

const udi = resolveOrviMxnProjectionAuthority("udi");
assert.equal(udi.status, "RESOLVED");
assert.equal(udi.current_mxn.status, "READY_FOR_IMPLEMENTATION");
assert.equal(udi.current_mxn.rate_key, "UDI_MXN");
assert.equal(udi.future_mxn.status, "READY_FOR_SCENARIO_IMPLEMENTATION");
assert.equal(udi.future_mxn.annual_growth_rate, 0.045);
assert.equal(
  udi.future_mxn.annual_growth_rate_authority,
  "DERIVED_SCENARIO_AND_PROJECTION_EVIDENCE_ONLY",
);
assert.equal(udi.future_mxn.guaranteed, false);

const usd = resolveOrviMxnProjectionAuthority("USD");
assert.equal(usd.status, "RESOLVED");
assert.equal(usd.current_mxn.status, "READY_FOR_IMPLEMENTATION");
assert.equal(usd.current_mxn.rate_key, "USD_MXN_FIX");
assert.equal(
  usd.future_mxn.status,
  "BLOCKED_PENDING_EXPLICIT_SCENARIO_RATE_AUTHORITY",
);
assert.equal(usd.future_mxn.annual_growth_rate, null);
assert.equal(usd.future_mxn.projection_mode, null);

assert.equal(policyYearToProjectionOffset(1), 0);
assert.equal(policyYearToProjectionOffset(6), 5);
assert.equal(policyYearToProjectionOffset(10), 9);
assert.equal(policyYearToProjectionOffset(20), 19);
assert.throws(() => policyYearToProjectionOffset(0), TypeError);
assert.throws(() => policyYearToProjectionOffset(2.5), TypeError);

const unsupported = resolveOrviMxnProjectionAuthority("EUR");
assert.equal(unsupported.status, "BLOCKED_UNSUPPORTED_SOURCE_CURRENCY");
assert.equal(unsupported.recommendation, null);
assert.equal(unsupported.human_decision_required, true);

assert.equal(
  ORVI_MXN_PROJECTION_AUTHORITY.legacy_boundaries
    .legacy_orvi_mxn_converter.authority,
  "NO",
);
assert.equal(
  ORVI_MXN_PROJECTION_AUTHORITY.legacy_boundaries
    .generic_currency_projection_math.authority,
  "MATH_UTILITY_ONLY",
);
assert.equal(
  ORVI_MXN_PROJECTION_AUTHORITY.implementation_authorization
    .projected_usd_to_mxn,
  false,
);
assert.equal(
  ORVI_MXN_PROJECTION_AUTHORITY.implementation_authorization.runtime_wiring,
  false,
);
assert.equal(
  ORVI_MXN_PROJECTION_AUTHORITY.implementation_authorization.dashboard_wiring,
  false,
);
assert.equal(
  ORVI_MXN_PROJECTION_AUTHORITY.implementation_authorization.recommendation,
  null,
);
assert.equal(
  ORVI_MXN_PROJECTION_AUTHORITY.future_values_are_guaranteed,
  false,
);

const serialized = JSON.stringify(ORVI_MXN_PROJECTION_AUTHORITY);
assert.equal(serialized.includes("cachedAt"), false);
assert.equal(serialized.includes("sourceDate"), false);
assert.equal(serialized.includes('"value":'), false);
assert.equal(serialized.includes("17.4755"), false);
assert.equal(serialized.includes("8.82994"), false);

console.log("PASS R15G ORVI MXN projection authority reconciliation", {
  authorityId: ORVI_MXN_PROJECTION_AUTHORITY_ID,
  udiCurrent: udi.current_mxn.status,
  udiFuture: udi.future_mxn.status,
  udiScenarioRate: udi.future_mxn.annual_growth_rate,
  usdCurrent: usd.current_mxn.status,
  usdFuture: usd.future_mxn.status,
  year20Offset: policyYearToProjectionOffset(20),
  recommendation:
    ORVI_MXN_PROJECTION_AUTHORITY.implementation_authorization.recommendation,
});
