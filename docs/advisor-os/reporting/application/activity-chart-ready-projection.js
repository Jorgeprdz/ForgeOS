import {
  createChartReadyReportingSurface,
} from "./chart-ready-surface-contract.js";

import {
  UNIVERSAL_REPORT_MODEL_SCHEMA_VERSION,
} from "../domain/universal-report-model.js";

import {
  ACTIVITY_REPORT_DEFINITION_ID,
  ACTIVITY_REPORT_PROVIDER_SCHEMA_VERSION,
} from "../providers/activity-report-provider.js";

export const ACTIVITY_CHART_READY_PROJECTION_SCHEMA_VERSION =
  "activity-chart-ready-projection.v1";

const REQUIRED_DIMENSIONS = Object.freeze([
  "activityType",
  "evaluationDate",
]);

const REQUIRED_MEASURES = Object.freeze([
  "activityCount",
]);

export class ActivityChartReadyProjectionError extends TypeError {
  constructor(message) {
    super(`ActivityChartReadyProjection: ${message}`);
    this.name = "ActivityChartReadyProjectionError";
  }
}

function fail(message) {
  throw new ActivityChartReadyProjectionError(message);
}

function plain(value, label) {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Object.prototype
  ) {
    fail(`${label} must be a plain object`);
  }
  return value;
}

function sameSet(left, right) {
  const normalizedLeft = [...left].sort();
  const normalizedRight = [...right].sort();
  return (
    normalizedLeft.length === normalizedRight.length &&
    normalizedLeft.every(
      (value, index) => value === normalizedRight[index],
    )
  );
}

function assertActivityUniversalReport(reportInput) {
  const report = plain(reportInput, "report");

  if (report.schemaVersion !== UNIVERSAL_REPORT_MODEL_SCHEMA_VERSION) {
    fail("report schemaVersion is unsupported");
  }

  if (
    report.provider?.providerId !== "activity" ||
    report.provider?.providerVersion !== ACTIVITY_REPORT_PROVIDER_SCHEMA_VERSION
  ) {
    fail("report is not produced by the governed Activity provider");
  }

  if (report.definition?.definitionId !== ACTIVITY_REPORT_DEFINITION_ID) {
    fail("report definition is not the governed Activity definition");
  }

  const dimensions = report.dimensions.map((item) => item.dimensionId);
  const measures = report.measures.map((item) => item.measureId);

  if (!sameSet(dimensions, REQUIRED_DIMENSIONS)) {
    fail("chart-ready Activity report requires evaluationDate and activityType");
  }

  if (!sameSet(measures, REQUIRED_MEASURES)) {
    fail("chart-ready Activity report requires activityCount");
  }

  if (!Array.isArray(report.rows)) {
    fail("report.rows must be an array");
  }

  return report;
}

function pointFromRow(report, row) {
  const activityType = row.dimensions.activityType;
  const evaluationDate = row.dimensions.evaluationDate;
  const activityCount = row.measures.activityCount;

  if (typeof activityType !== "string" || activityType.trim() === "") {
    fail("Activity row activityType must be a canonical identifier");
  }

  if (
    typeof evaluationDate !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/u.test(evaluationDate)
  ) {
    fail("Activity row evaluationDate must use YYYY-MM-DD");
  }

  if (!Number.isSafeInteger(activityCount) || activityCount < 0) {
    fail("Activity row activityCount must be a non-negative integer");
  }

  const pointIdentity = row.rowKey.replace(
    /^universal-report-row:/u,
    "",
  );

  return {
    activityType,
    evaluationDate,
    point: {
      pointId: `activity-point:${pointIdentity}`,
      x: evaluationDate,
      value: activityCount,
      rowKeys: [row.rowKey],
      provenance: report.provenance,
      drilldown: {
        reportId: report.reportId,
        rowKeys: [row.rowKey],
        measureId: "activityCount",
        dimensionId: "evaluationDate",
        period: {
          from: report.period.from,
          to: report.period.to,
          asOf: report.asOf,
          timeZone: report.timeZone,
        },
      },
    },
  };
}

export function projectActivityReportToChartReady(reportInput) {
  const report = assertActivityUniversalReport(reportInput);
  const grouped = new Map();

  for (const row of report.rows) {
    const normalized = pointFromRow(report, row);

    if (!grouped.has(normalized.activityType)) {
      grouped.set(normalized.activityType, []);
    }

    grouped.get(normalized.activityType).push(normalized.point);
  }

  const series = [...grouped.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([activityType, points]) => ({
      seriesId: `activity-series:${activityType}`,
      seriesKind: "ACTIVITY_DAILY_COUNT",
      measureId: "activityCount",
      dimensionId: "activityType",
      unit: "COUNT",
      points: points.sort((left, right) => {
        const byDate = left.x.localeCompare(right.x);
        return byDate !== 0
          ? byDate
          : left.pointId.localeCompare(right.pointId);
      }),
    }));

  return createChartReadyReportingSurface({
    report,
    temporalGrain: "DAY",
    series,
    compatibleVisualizations: [
      "BAR",
      "LINE",
      "STACKED_BAR",
      "TABLE",
    ],
    recommendedVisualization: "STACKED_BAR",
    missingDataState:
      report.rows.length === 0
        ? "NO_MATCHING_FACTS"
        : "AVAILABLE",
    partialPeriodState:
      report.period.isPartial
        ? "PARTIAL_CURRENT_PERIOD"
        : "COMPLETE",
  });
}
