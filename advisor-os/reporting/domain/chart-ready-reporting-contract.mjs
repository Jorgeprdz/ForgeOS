export const CHART_READY_SURFACE_SCHEMA_VERSION = "chart-ready-reporting-surface.v1";
export const CHART_READY_SERIES_SCHEMA_VERSION = "chart-ready-reporting-series.v1";
export const CHART_READY_POINT_SCHEMA_VERSION = "chart-ready-reporting-point.v1";
export const REPORTING_DRILLDOWN_SCHEMA_VERSION = "reporting-drilldown-descriptor.v1";

export const REPORTING_TEMPORAL_GRAINS = Object.freeze([
  "HOUR", "DAY", "WEEK", "MONTH", "QUARTER", "YEAR", "NONE",
]);

export const REPORTING_VISUALIZATION_TYPES = Object.freeze([
  "LINE", "BAR", "STACKED_BAR", "DONUT", "FUNNEL", "HEATMAP", "TABLE",
]);

export const REPORTING_MISSING_DATA_STATES = Object.freeze([
  "AVAILABLE",
  "NO_MATCHING_FACTS",
  "SOURCE_UNAVAILABLE",
  "AUTHORITY_UNAVAILABLE",
  "NOT_SUPPORTED",
]);

export const REPORTING_PARTIAL_PERIOD_STATES = Object.freeze([
  "COMPLETE",
  "PARTIAL_CURRENT_PERIOD",
  "PARTIAL_SOURCE_COVERAGE",
]);

export const CHART_READY_REPORTING_CAPABILITIES = Object.freeze([
  "SERIES_IDENTITY",
  "TEMPORAL_GRAIN",
  "POINT_PROVENANCE",
  "POINT_DRILLDOWN",
  "MISSING_DATA_STATE",
  "PARTIAL_PERIOD_STATE",
  "VISUALIZATION_COMPATIBILITY",
]);
