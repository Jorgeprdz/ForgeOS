import { createHash } from "node:crypto";
import { UNIVERSAL_REPORT_MODEL_SCHEMA_VERSION } from "../domain/universal-report-model.js";
import {
  CHART_READY_POINT_SCHEMA_VERSION,
  CHART_READY_REPORTING_CAPABILITIES,
  CHART_READY_SERIES_SCHEMA_VERSION,
  CHART_READY_SURFACE_SCHEMA_VERSION,
  REPORTING_DRILLDOWN_SCHEMA_VERSION,
  REPORTING_MISSING_DATA_STATES,
  REPORTING_PARTIAL_PERIOD_STATES,
  REPORTING_TEMPORAL_GRAINS,
  REPORTING_VISUALIZATION_TYPES,
} from "../domain/chart-ready-reporting-contract.js";

const ID = /^[A-Za-z0-9][A-Za-z0-9._:-]*$/u;
const PROHIBITED = new Set(["title", "label", "color", "icon", "component", "route", "navigation", "className", "style", "layout", "sql", "rpc", "mutation"]);

export class ChartReadySurfaceContractError extends TypeError {
  constructor(message) {
    super(`ChartReadySurfaceContract: ${message}`);
    this.name = "ChartReadySurfaceContractError";
  }
}

function fail(message) { throw new ChartReadySurfaceContractError(message); }
function plain(value, label) {
  if (value === null || typeof value !== "object" || Array.isArray(value) || Object.getPrototypeOf(value) !== Object.prototype) fail(`${label} must be a plain object`);
  return value;
}
function id(value, label) {
  if (typeof value !== "string" || !ID.test(value.trim())) fail(`${label} must be a canonical identifier`);
  return value.trim();
}
function oneOf(value, allowed, label) {
  if (!allowed.includes(value)) fail(`${label} is not supported`);
  return value;
}
function json(value, path = "value") {
  if (value === null || typeof value === "string" || typeof value === "boolean" || (typeof value === "number" && Number.isFinite(value))) return value;
  if (Array.isArray(value)) return value.map((item, index) => json(item, `${path}[${index}]`));
  plain(value, path);
  const result = {};
  for (const key of Object.keys(value).sort()) {
    if (PROHIBITED.has(key)) fail(`${path}.${key} crosses a prohibited boundary`);
    result[key] = json(value[key], `${path}.${key}`);
  }
  return result;
}
function freeze(value) {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.values(value).forEach(freeze);
  return Object.freeze(value);
}
function digest(value) { return createHash("sha256").update(JSON.stringify(json(value))).digest("hex"); }

export function createChartReadyReportingSurface(input) {
  plain(input, "input");
  const report = plain(input.report, "report");
  if (report.schemaVersion !== UNIVERSAL_REPORT_MODEL_SCHEMA_VERSION) fail("report schemaVersion is unsupported");
  const rowKeys = new Set(report.rows.map((row) => row.rowKey));
  const measureIds = new Set(report.measures.map((item) => item.measureId));
  const dimensionIds = new Set(report.dimensions.map((item) => item.dimensionId));
  const compatible = [...new Set((input.compatibleVisualizations ?? []).map((item) => oneOf(item, REPORTING_VISUALIZATION_TYPES, "compatibleVisualization")))].sort();
  if (compatible.length === 0) fail("compatibleVisualizations must not be empty");
  const recommended = oneOf(input.recommendedVisualization, REPORTING_VISUALIZATION_TYPES, "recommendedVisualization");
  if (!compatible.includes(recommended)) fail("recommendedVisualization must be compatible");
  if (!Array.isArray(input.series)) fail("series must be an array");

  const series = input.series.map((item, seriesIndex) => {
    plain(item, `series[${seriesIndex}]`);
    const measureId = item.measureId === null ? null : id(item.measureId, "series.measureId");
    const dimensionId = item.dimensionId === null ? null : id(item.dimensionId, "series.dimensionId");
    if (measureId !== null && !measureIds.has(measureId)) fail(`series measure ${measureId} is not in report`);
    if (dimensionId !== null && !dimensionIds.has(dimensionId)) fail(`series dimension ${dimensionId} is not in report`);
    if (!Array.isArray(item.points)) fail("series.points must be an array");
    const points = item.points.map((point, pointIndex) => {
      plain(point, `series[${seriesIndex}].points[${pointIndex}]`);
      const ownedRows = point.rowKeys.map((rowKey) => id(rowKey, "point.rowKey"));
      if (ownedRows.some((rowKey) => !rowKeys.has(rowKey))) fail("point rowKey is not in report");
      const drilldown = plain(point.drilldown, "point.drilldown");
      if (drilldown.reportId !== report.reportId) fail("drilldown reportId does not match report");
      if (drilldown.rowKeys.some((rowKey) => !ownedRows.includes(rowKey))) fail("drilldown rowKeys must be owned by the point");
      return {
        schemaVersion: CHART_READY_POINT_SCHEMA_VERSION,
        pointId: id(point.pointId, "point.pointId"),
        x: json(point.x, "point.x"),
        value: json(point.value, "point.value"),
        rowKeys: ownedRows,
        provenance: json(point.provenance, "point.provenance"),
        drilldown: {
          schemaVersion: REPORTING_DRILLDOWN_SCHEMA_VERSION,
          reportId: drilldown.reportId,
          rowKeys: drilldown.rowKeys.map((rowKey) => id(rowKey, "drilldown.rowKey")),
          measureId: drilldown.measureId === null ? null : id(drilldown.measureId, "drilldown.measureId"),
          dimensionId: drilldown.dimensionId === null ? null : id(drilldown.dimensionId, "drilldown.dimensionId"),
          period: json(drilldown.period, "drilldown.period"),
        },
      };
    });
    return {
      schemaVersion: CHART_READY_SERIES_SCHEMA_VERSION,
      seriesId: id(item.seriesId, "series.seriesId"),
      seriesKind: id(item.seriesKind, "series.seriesKind"),
      measureId,
      dimensionId,
      unit: id(item.unit, "series.unit"),
      points,
    };
  });

  const identity = {
    schemaVersion: CHART_READY_SURFACE_SCHEMA_VERSION,
    sourceReportId: report.reportId,
    capabilities: CHART_READY_REPORTING_CAPABILITIES,
    temporalGrain: oneOf(input.temporalGrain, REPORTING_TEMPORAL_GRAINS, "temporalGrain"),
    series,
    compatibleVisualizations: compatible,
    recommendedVisualization: recommended,
    missingDataState: oneOf(input.missingDataState, REPORTING_MISSING_DATA_STATES, "missingDataState"),
    partialPeriodState: oneOf(input.partialPeriodState, REPORTING_PARTIAL_PERIOD_STATES, "partialPeriodState"),
  };
  return freeze({
    ...identity,
    surfaceId: `chart-ready-surface:${digest(identity)}`,
    boundary: {
      reportCalculationAuthority: false,
      visualizationCompatibilityAuthority: true,
      uiRenderingAuthority: false,
      presentationStylingAuthority: false,
      aiDecisionAuthority: false,
      persistenceMutationAuthority: false,
    },
  });
}
