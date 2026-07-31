export const REPORT_DEFINITION_SCHEMA_VERSION = "report-definition.v1";

export function createReportDefinition(input = {}) {
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    throw new TypeError("ReportDefinition: input must be a plain object");
  }

  const definitionId = String(input.definitionId ?? "").trim();
  const providerId = String(input.providerId ?? "").trim();
  const dimensions = Object.freeze([...(input.dimensions ?? [])]);
  const measures = Object.freeze([...(input.measures ?? [])]);

  if (!definitionId || !providerId) {
    throw new TypeError("ReportDefinition: definitionId and providerId are required");
  }

  return Object.freeze({
    schemaVersion: REPORT_DEFINITION_SCHEMA_VERSION,
    definitionId,
    providerId,
    dimensions,
    measures,
    metadata: Object.freeze({ ...(input.metadata ?? {}) }),
  });
}
