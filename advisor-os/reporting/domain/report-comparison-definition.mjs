export const REPORT_COMPARISON_DEFINITION_SCHEMA_VERSION = "report-comparison-definition.v1";

export const REPORT_COMPARISON_TYPES = Object.freeze([
  "PREVIOUS_PERIOD",
  "PREVIOUS_YEAR_SAME_PERIOD",
  "PERIOD_OVER_PERIOD",
  "YEAR_OVER_YEAR",
  "TARGET",
  "BUDGET",
  "CUSTOM_BASELINE",
]);

export function createReportComparisonDefinition(input = {}) {
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    throw new TypeError("ReportComparisonDefinition: input must be a plain object");
  }

  const type = String(input.type ?? "").trim();
  if (!REPORT_COMPARISON_TYPES.includes(type)) {
    throw new TypeError("ReportComparisonDefinition: unsupported comparison type");
  }

  return Object.freeze({
    schemaVersion: REPORT_COMPARISON_DEFINITION_SCHEMA_VERSION,
    type,
    baseline: input.baseline ?? null,
    metadata: Object.freeze({ ...(input.metadata ?? {}) }),
  });
}
