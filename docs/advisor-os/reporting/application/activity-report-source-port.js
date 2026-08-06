export const ACTIVITY_REPORT_SOURCE_PORT_SCHEMA_VERSION =
  "activity-report-source-port.v1";

export const ACTIVITY_REPORT_SOURCE_CAPABILITY =
  "ACTIVITY_PERIOD_AGGREGATION";

export class ActivityReportSourcePortError extends TypeError {
  constructor(message) {
    super(`ActivityReportSourcePort: ${message}`);
    this.name = "ActivityReportSourcePortError";
  }
}

function fail(message) {
  throw new ActivityReportSourcePortError(message);
}

function requiredString(value, label) {
  if (typeof value !== "string" || value.trim() === "") {
    fail(`${label} must be a non-empty string`);
  }
  return value.trim();
}

function uniqueStrings(value, label) {
  if (!Array.isArray(value) || value.length === 0) {
    fail(`${label} must be a non-empty array`);
  }
  const normalized = value.map((item, index) =>
    requiredString(item, `${label}[${index}]`),
  );
  if (new Set(normalized).size !== normalized.length) {
    fail(`${label} must contain unique values`);
  }
  return Object.freeze([...normalized].sort());
}

export function createActivityReportSourcePort({
  organizationId,
  advisorId,
  activityTypes,
  aggregatePeriod,
} = {}) {
  const authority = Object.freeze({
    organizationId: requiredString(organizationId, "organizationId"),
    advisorId: requiredString(advisorId, "advisorId"),
  });
  const vocabulary = uniqueStrings(activityTypes, "activityTypes");

  if (typeof aggregatePeriod !== "function") {
    fail("aggregatePeriod must be a function");
  }

  return Object.freeze({
    schemaVersion: ACTIVITY_REPORT_SOURCE_PORT_SCHEMA_VERSION,
    authority,
    activityTypes: vocabulary,
    capabilities: Object.freeze([
      ACTIVITY_REPORT_SOURCE_CAPABILITY,
    ]),
    aggregatePeriod,
    boundary: Object.freeze({
      activityReadAuthority: true,
      activityWriteAuthority: false,
      scoringAuthority: false,
      eventInterpretationAuthority: false,
      reportingAggregationAuthority: false,
      uiAuthority: false,
      persistenceMutationAuthority: false,
    }),
  });
}

export function assertActivityReportSourcePort(value) {
  if (
    value === null ||
    typeof value !== "object" ||
    value.schemaVersion !== ACTIVITY_REPORT_SOURCE_PORT_SCHEMA_VERSION ||
    typeof value.aggregatePeriod !== "function" ||
    !Array.isArray(value.activityTypes) ||
    !Array.isArray(value.capabilities) ||
    !value.capabilities.includes(ACTIVITY_REPORT_SOURCE_CAPABILITY)
  ) {
    fail("value does not satisfy the governed Activity report source port");
  }
  requiredString(value.authority?.organizationId, "authority.organizationId");
  requiredString(value.authority?.advisorId, "authority.advisorId");
  uniqueStrings(value.activityTypes, "activityTypes");
  return value;
}
