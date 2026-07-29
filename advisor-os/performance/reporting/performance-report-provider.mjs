import {
  createReportProviderPort,
} from "../../reporting/application/report-provider-port.mjs";

export const PERFORMANCE_REPORT_PROVIDER_SCHEMA_VERSION =
  "performance-report-provider.v1";

export const PERFORMANCE_REPORT_DEFINITION_ID =
  "performance-summary";

export const PERFORMANCE_REPORT_DEFINITION_VERSION =
  "performance-summary.v1";

export class PerformanceReportProviderError extends TypeError {
  constructor(message) {
    super(`PerformanceReportProvider: ${message}`);
    this.name = "PerformanceReportProviderError";
  }
}

function fail(message) {
  throw new PerformanceReportProviderError(message);
}

function assertPlainObject(value, label) {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Object.prototype
  ) {
    fail(`${label} must be a plain object`);
  }
}

function assertReadRuntime(value) {
  if (
    value === null ||
    typeof value !== "object" ||
    typeof value.readPeriod !== "function" ||
    ![
      "performance-read-runtime.v1",
      "performance-supabase-read-composition.v1",
    ].includes(value.schemaVersion)
  ) {
    fail("readRuntime does not satisfy Performance read authority");
  }

  return value;
}

function selected(object, keys) {
  return Object.fromEntries(
    keys.map((key) => [key, object[key]]),
  );
}

export function createPerformanceReportProvider({
  readRuntime,
  maxSliceDays,
} = {}) {
  const runtime = assertReadRuntime(readRuntime);
  const sliceDays =
    maxSliceDays ?? runtime.maxDays ?? 31;

  if (
    !Number.isSafeInteger(sliceDays) ||
    sliceDays < 1
  ) {
    fail("maxSliceDays must be a positive integer");
  }

  const dimensions = [
    {
      dimensionId: "evaluationDate",
      valueKind: "DATE",
      nullable: false,
    },
    {
      dimensionId: "targetStatus",
      valueKind: "STRING",
      nullable: false,
    },
  ];

  const measures = [
    {
      measureId: "totalPoints",
      valueKind: "NUMBER",
      unit: "POINTS",
      aggregation: "SUM",
      nullable: false,
    },
    {
      measureId: "targetPoints",
      valueKind: "NUMBER",
      unit: "POINTS",
      aggregation: "SUM",
      nullable: false,
    },
    {
      measureId: "remainingPoints",
      valueKind: "NUMBER",
      unit: "POINTS",
      aggregation: "SUM",
      nullable: false,
    },
    {
      measureId: "eligibleActivityCount",
      valueKind: "NUMBER",
      unit: "COUNT",
      aggregation: "SUM",
      nullable: false,
    },
  ];

  const port = createReportProviderPort({
    descriptor: {
      providerId: "performance",
      providerVersion:
        PERFORMANCE_REPORT_PROVIDER_SCHEMA_VERSION,
      domain: "PERFORMANCE",
      capabilities: [
        "PERFORMANCE_PERIOD_READ_MODEL",
        "PERFORMANCE_DAILY_SERIES",
        "PERFORMANCE_POINT_MEASURES",
        "PERFORMANCE_TARGET_STATUS",
      ],
    },
    dimensions,
    measures,
    maxSliceDays: sliceDays,
    batchingMode: "CONTIGUOUS_DATE_RANGES",

    async readSlice(query) {
      assertPlainObject(query, "query");

      const period = await runtime.readPeriod({
        evaluationDateFrom: query.period.from,
        evaluationDateTo: query.period.to,
        asOf: query.asOf,
      });

      if (
        period?.schemaVersion !==
        "performance-period-read-model.v1"
      ) {
        fail("readRuntime returned an unsupported period model");
      }

      if (
        period.period.evaluationDateFrom !== query.period.from ||
        period.period.evaluationDateTo !== query.period.to
      ) {
        fail("Performance period coverage does not match provider slice");
      }

      if (period.period.asOf !== query.asOf) {
        fail("Performance period asOf does not match provider slice");
      }

      const rows = period.series.map((day) => {
        const dimensionValues = {
          evaluationDate: day.evaluationDate,
          targetStatus: day.targetStatus,
        };
        const measureValues = {
          totalPoints: day.totalPoints,
          targetPoints: day.targetPoints,
          remainingPoints: day.remainingPoints,
          eligibleActivityCount:
            day.eligibleActivityCount,
        };

        return {
          dimensions: selected(
            dimensionValues,
            query.dimensions,
          ),
          measures: selected(
            measureValues,
            query.measures,
          ),
        };
      });

      return {
        rows,
        exclusions: [
          {
            code: "FUTURE_RECORDED",
            count:
              period.exclusions.futureRecorded,
          },
          {
            code: "SUPPRESSED",
            count:
              period.exclusions.suppressed,
          },
        ],
        provenance: [
          {
            sourceId:
              "performance-period-runtime",
            sourceVersion:
              period.sourceSchemaVersion,
            authority:
              "PERFORMANCE_SCORING_POLICY",
          },
        ],
      };
    },
  });

  return Object.freeze({
    schemaVersion:
      PERFORMANCE_REPORT_PROVIDER_SCHEMA_VERSION,
    definition: Object.freeze({
      definitionId:
        PERFORMANCE_REPORT_DEFINITION_ID,
      definitionVersion:
        PERFORMANCE_REPORT_DEFINITION_VERSION,
      providerId:
        port.contract.descriptor.providerId,
      dimensions: Object.freeze(
        dimensions.map((item) => item.dimensionId),
      ),
      measures: Object.freeze(
        measures.map((item) => item.measureId),
      ),
      defaultDimensions: Object.freeze([
        "evaluationDate",
      ]),
      defaultMeasures: Object.freeze([
        "totalPoints",
        "targetPoints",
        "remainingPoints",
        "eligibleActivityCount",
      ]),
    }),
    port,
    boundary: Object.freeze({
      performanceScoringAuthority: false,
      performanceReadAuthority: true,
      universalAggregationAuthority: false,
      comparisonAuthority: false,
      exportAuthority: false,
      uiAuthority: false,
      persistenceMutationAuthority: false,
    }),
  });
}

