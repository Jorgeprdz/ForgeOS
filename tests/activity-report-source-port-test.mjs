import test from "node:test";
import assert from "node:assert/strict";

import {
  ACTIVITY_REPORT_SOURCE_PORT_SCHEMA_VERSION,
  ActivityReportSourcePortError,
  assertActivityReportSourcePort,
  createActivityReportSourcePort,
} from "../advisor-os/reporting/application/activity-report-source-port.mjs";

function source(overrides = {}) {
  return createActivityReportSourcePort({
    organizationId: "organization-001",
    advisorId: "advisor-001",
    activityTypes: ["POLICY_PAID", "CONTACT_ATTEMPTED"],
    aggregatePeriod: async () => ({}),
    ...overrides,
  });
}

test("creates an immutable governed Activity source port", () => {
  const value = source();
  assert.equal(value.schemaVersion, ACTIVITY_REPORT_SOURCE_PORT_SCHEMA_VERSION);
  assert.deepEqual(value.activityTypes, ["CONTACT_ATTEMPTED", "POLICY_PAID"]);
  assert.equal(Object.isFrozen(value), true);
  assert.equal(value.boundary.activityWriteAuthority, false);
  assert.equal(value.boundary.scoringAuthority, false);
  assert.equal(value.boundary.eventInterpretationAuthority, false);
});

test("rejects duplicate Activity vocabulary", () => {
  assert.throws(
    () => source({ activityTypes: ["POLICY_PAID", "POLICY_PAID"] }),
    ActivityReportSourcePortError,
  );
});

test("rejects missing period aggregation authority", () => {
  assert.throws(
    () => source({ aggregatePeriod: null }),
    /aggregatePeriod must be a function/u,
  );
});

test("asserts compatible source ports", () => {
  assert.equal(assertActivityReportSourcePort(source()).authority.advisorId, "advisor-001");
});

test("rejects fake source ports", () => {
  assert.throws(
    () => assertActivityReportSourcePort({}),
    /does not satisfy/u,
  );
});
