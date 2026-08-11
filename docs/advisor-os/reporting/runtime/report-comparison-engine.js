import {
  createHash,
} from "node:crypto";

import {
  REPORT_COMPARISON_DEFINITION_SCHEMA_VERSION,
  createReportComparisonDefinition,
} from "../domain/report-comparison-definition.js";

export const REPORT_COMPARISON_ENGINE_SCHEMA_VERSION =
  "report-comparison-engine.v1";

export const REPORT_COMPARISON_PLAN_SCHEMA_VERSION =
  "report-comparison-plan.v1";

export const REPORT_COMPARISON_RESULT_SCHEMA_VERSION =
  "report-comparison-result.v1";

export const REPORT_MEASURE_COMPARISON_SCHEMA_VERSION =
  "report-measure-comparison.v1";

export const REPORT_ROW_COMPARISON_SCHEMA_VERSION =
  "report-row-comparison.v1";

export const REPORT_BASELINE_REFERENCE_SCHEMA_VERSION =
  "report-baseline-reference.v1";

const INPUT_KEYS =
  new Set([
    "aggregationRuntime",
    "periodResolver",
  ]);

const RUN_INPUT_KEYS =
  new Set([
    "currentReport",
    "definition",
    "baseline",
  ]);

const STATIC_BASELINE_KEYS =
  new Set([
    "values",
  ]);

const CUSTOM_BASELINE_KEYS =
  new Set([
    "report",
  ]);

const UNIVERSAL_REPORT_SCHEMA =
  "universal-report-model.v1";

const AGGREGATION_RUNTIME_SCHEMA =
  "universal-report-aggregation-runtime.v1";

const PERIOD_RESOLVER_SCHEMA =
  "universal-period-resolver.v1";

const RESOLVED_REQUEST_SCHEMA =
  "resolved-universal-report-request.v1";

const DATE_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})$/u;

const MILLISECONDS_PER_DAY =
  86_400_000;

export class ReportComparisonEngineError
  extends TypeError {
  constructor(message) {
    super(
      `ReportComparisonEngine: ${message}`,
    );
    this.name =
      "ReportComparisonEngineError";
  }
}

function engineError(message) {
  throw new ReportComparisonEngineError(
    message,
  );
}

function assertPlainObject(
  value,
  label,
) {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.getPrototypeOf(value) !==
      Object.prototype
  ) {
    engineError(
      `${label} must be a plain object`,
    );
  }
}

function assertExactKeys(
  value,
  allowed,
  label,
) {
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) {
      engineError(
        `${label} contains unknown field ${key}`,
      );
    }
  }
}

function deepFreeze(value) {
  if (
    value === null ||
    typeof value !== "object" ||
    Object.isFrozen(value)
  ) {
    return value;
  }

  for (const nested of
    Object.values(value)) {
    deepFreeze(nested);
  }

  return Object.freeze(value);
}

function canonicalize(value) {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean" ||
    typeof value === "number"
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(
      canonicalize,
    );
  }

  const result = {};

  for (const key of
    Object.keys(value).sort()) {
    result[key] =
      canonicalize(
        value[key],
      );
  }

  return result;
}

function digest(value) {
  return createHash(
    "sha256",
  )
    .update(
      JSON.stringify(
        canonicalize(value),
      ),
    )
    .digest("hex");
}

function parseDate(
  value,
  label,
) {
  if (typeof value !== "string") {
    engineError(
      `${label} must be YYYY-MM-DD`,
    );
  }

  const match =
    DATE_PATTERN.exec(value);

  if (!match) {
    engineError(
      `${label} must be YYYY-MM-DD`,
    );
  }

  const date = {
    year:
      Number(match[1]),
    month:
      Number(match[2]),
    day:
      Number(match[3]),
  };
  const candidate =
    new Date(
      Date.UTC(
        date.year,
        date.month - 1,
        date.day,
      ),
    );

  if (
    candidate.getUTCFullYear() !==
      date.year ||
    candidate.getUTCMonth() + 1 !==
      date.month ||
    candidate.getUTCDate() !==
      date.day
  ) {
    engineError(
      `${label} is not a valid date`,
    );
  }

  return date;
}

function formatDate(date) {
  return [
    String(date.year)
      .padStart(4, "0"),
    String(date.month)
      .padStart(2, "0"),
    String(date.day)
      .padStart(2, "0"),
  ].join("-");
}

function serial(date) {
  return Math.floor(
    Date.UTC(
      date.year,
      date.month - 1,
      date.day,
    ) /
      MILLISECONDS_PER_DAY,
  );
}

function fromSerial(value) {
  const date =
    new Date(
      value *
        MILLISECONDS_PER_DAY,
    );

  return {
    year:
      date.getUTCFullYear(),
    month:
      date.getUTCMonth() + 1,
    day:
      date.getUTCDate(),
  };
}

function addDays(
  date,
  count,
) {
  return fromSerial(
    serial(date) +
      count,
  );
}

function daysInMonth(
  year,
  month,
) {
  return new Date(
    Date.UTC(
      year,
      month,
      0,
    ),
  ).getUTCDate();
}

function shiftYears(
  date,
  count,
) {
  const year =
    date.year + count;

  return {
    year,
    month:
      date.month,
    day:
      Math.min(
        date.day,
        daysInMonth(
          year,
          date.month,
        ),
      ),
  };
}

function normalizeReport(
  value,
  label,
) {
  assertPlainObject(
    value,
    label,
  );

  if (
    value.schemaVersion !==
    UNIVERSAL_REPORT_SCHEMA
  ) {
    engineError(
      `${label} schemaVersion is not supported`,
    );
  }

  if (
    value.boundary
      ?.reportingAggregationAuthority !==
      true ||
    value.boundary
      ?.comparisonAuthority !==
      false
  ) {
    engineError(
      `${label} authority boundary is not supported`,
    );
  }

  if (
    !Array.isArray(value.measures) ||
    !Array.isArray(value.dimensions) ||
    !Array.isArray(value.rows)
  ) {
    engineError(
      `${label} is incomplete`,
    );
  }

  assertPlainObject(
    value.totals,
    `${label}.totals`,
  );

  return value;
}

function normalizeDefinition(
  value,
) {
  if (
    value?.schemaVersion ===
    REPORT_COMPARISON_DEFINITION_SCHEMA_VERSION
  ) {
    return value;
  }

  return createReportComparisonDefinition(
    value,
  );
}

function capabilityIds(
  value,
  key,
) {
  return value.map(
    (item) =>
      item[key],
  );
}

function assertReportMeasures(
  report,
  definition,
) {
  const byId =
    new Map(
      report.measures.map(
        (measure) => [
          measure.measureId,
          measure,
        ],
      ),
    );

  for (const measureId of
    definition.measures) {
    const capability =
      byId.get(measureId);

    if (!capability) {
      engineError(
        `comparison measure ${measureId} is not present in report`,
      );
    }

    if (
      capability.valueKind !==
      "NUMBER"
    ) {
      engineError(
        `comparison measure ${measureId} must be numeric`,
      );
    }
  }
}

function compareArrays(
  left,
  right,
) {
  return (
    left.length ===
      right.length &&
    left.every(
      (item, index) =>
        item === right[index],
    )
  );
}

function validateCompatibleReports(
  current,
  baseline,
  measures,
) {
  if (
    current.provider.providerId !==
      baseline.provider.providerId ||
    current.provider.providerVersion !==
      baseline.provider.providerVersion
  ) {
    engineError(
      "baseline report provider does not match current report",
    );
  }

  if (
    current.definition.definitionId !==
      baseline.definition.definitionId ||
    current.definition.definitionVersion !==
      baseline.definition.definitionVersion
  ) {
    engineError(
      "baseline report definition does not match current report",
    );
  }

  const currentDimensions =
    capabilityIds(
      current.dimensions,
      "dimensionId",
    );
  const baselineDimensions =
    capabilityIds(
      baseline.dimensions,
      "dimensionId",
    );

  if (
    !compareArrays(
      currentDimensions,
      baselineDimensions,
    )
  ) {
    engineError(
      "baseline report dimensions do not match current report",
    );
  }

  const baselineMeasures =
    new Set(
      capabilityIds(
        baseline.measures,
        "measureId",
      ),
    );

  for (const measureId of measures) {
    if (
      !baselineMeasures.has(
        measureId,
      )
    ) {
      engineError(
        `baseline report lacks measure ${measureId}`,
      );
    }
  }
}

function deriveBaselineRange(
  report,
  kind,
) {
  const from =
    parseDate(
      report.period.from,
      "currentReport.period.from",
    );
  const to =
    parseDate(
      report.period.to,
      "currentReport.period.to",
    );

  if (
    kind ===
    "PREVIOUS_PERIOD"
  ) {
    const dayCount =
      report.period.dayCount;
    const baselineTo =
      addDays(
        from,
        -1,
      );
    const baselineFrom =
      addDays(
        baselineTo,
        -(dayCount - 1),
      );

    return {
      from:
        formatDate(
          baselineFrom,
        ),
      to:
        formatDate(
          baselineTo,
        ),
      rule:
        "SAME_DAY_COUNT_IMMEDIATELY_PRECEDING",
    };
  }

  if (
    kind ===
    "PREVIOUS_YEAR_SAME_PERIOD"
  ) {
    return {
      from:
        formatDate(
          shiftYears(
            from,
            -1,
          ),
        ),
      to:
        formatDate(
          shiftYears(
            to,
            -1,
          ),
        ),
      rule:
        "SAME_CALENDAR_DATES_PREVIOUS_YEAR",
    };
  }

  engineError(
    `comparison kind ${kind} does not derive a report period`,
  );
}

function createBaselineResolvedRequest({
  currentReport,
  definition,
  period,
}) {
  const dimensions =
    capabilityIds(
      currentReport.dimensions,
      "dimensionId",
    );
  const identity = {
    schemaVersion:
      RESOLVED_REQUEST_SCHEMA,
    sourceSchemaVersion:
      "report-comparison-engine.v1",
    sourceRequestKey:
      currentReport
        .sourceResolvedRequestKey,
    authority:
      currentReport.authority,
    definitionId:
      currentReport
        .definition
        .definitionId,
    provider:
      currentReport.provider,
    period,
    timeZone:
      currentReport.timeZone,
    asOf:
      currentReport.asOf,
    dimensions,
    measures:
      definition.measures,
    metadata: {
      comparisonId:
        definition.comparisonId,
      comparisonVersion:
        definition.comparisonVersion,
      comparisonKind:
        definition.kind,
    },
  };

  return deepFreeze({
    ...identity,
    resolvedRequestKey:
      `resolved-report-request:${digest(identity)}`,
    status:
      "PERIOD_RESOLVED_NOT_EXECUTED",
    boundary: {
      providerExecutionAuthorized:
        false,
      periodResolutionComplete:
        true,
      aggregationAuthorized:
        false,
      comparisonAuthorized:
        false,
      exportAuthorized:
        false,
      uiRenderingAuthorized:
        false,
      persistenceMutationAuthorized:
        false,
      domainTruthOwnedByKernel:
        false,
    },
  });
}

function normalizeStaticBaseline(
  baseline,
  measures,
  label,
) {
  assertPlainObject(
    baseline,
    label,
  );
  assertExactKeys(
    baseline,
    STATIC_BASELINE_KEYS,
    label,
  );
  assertPlainObject(
    baseline.values,
    `${label}.values`,
  );
  assertExactKeys(
    baseline.values,
    new Set(measures),
    `${label}.values`,
  );

  const values = {};

  for (const measureId of measures) {
    if (
      !Object.hasOwn(
        baseline.values,
        measureId,
      )
    ) {
      engineError(
        `${label}.values is missing measure ${measureId}`,
      );
    }

    const value =
      baseline.values[
        measureId
      ];

    if (
      typeof value !== "number" ||
      !Number.isFinite(value)
    ) {
      engineError(
        `${label}.values.${measureId} must be a finite number`,
      );
    }

    values[measureId] =
      value;
  }

  return deepFreeze(values);
}

function measureComparison(
  current,
  baseline,
) {
  if (
    typeof current !== "number" ||
    !Number.isFinite(current) ||
    typeof baseline !== "number" ||
    !Number.isFinite(baseline)
  ) {
    return {
      status:
        "UNAVAILABLE",
      current:
        typeof current === "number"
          ? current
          : null,
      baseline:
        typeof baseline === "number"
          ? baseline
          : null,
      delta: null,
      deltaPercent: null,
      ratio: null,
      direction:
        "UNAVAILABLE",
    };
  }

  const delta =
    current - baseline;

  return {
    status:
      baseline === 0
        ? "ZERO_BASELINE"
        : "COMPARABLE",
    current,
    baseline,
    delta,
    deltaPercent:
      baseline === 0
        ? null
        : (
            delta /
            Math.abs(baseline)
          ) *
          100,
    ratio:
      baseline === 0
        ? null
        : current /
          baseline,
    direction:
      delta > 0
        ? "UP"
        : delta < 0
          ? "DOWN"
          : "UNCHANGED",
  };
}

function dimensionKey(
  dimensions,
) {
  return JSON.stringify(
    canonicalize(
      dimensions,
    ),
  );
}

function compareRows({
  currentReport,
  baselineReport,
  measures,
}) {
  if (!baselineReport) {
    return [];
  }

  const currentRows =
    new Map(
      currentReport.rows.map(
        (row) => [
          dimensionKey(
            row.dimensions,
          ),
          row,
        ],
      ),
    );
  const baselineRows =
    new Map(
      baselineReport.rows.map(
        (row) => [
          dimensionKey(
            row.dimensions,
          ),
          row,
        ],
      ),
    );
  const keys =
    [
      ...new Set([
        ...currentRows.keys(),
        ...baselineRows.keys(),
      ]),
    ].sort();

  return keys.map(
    (key) => {
      const current =
        currentRows.get(key);
      const baseline =
        baselineRows.get(key);
      const dimensions =
        current?.dimensions ??
        baseline?.dimensions;
      const comparisons =
        Object.fromEntries(
          measures.map(
            (measureId) => [
              measureId,
              {
                schemaVersion:
                  REPORT_MEASURE_COMPARISON_SCHEMA_VERSION,
                ...measureComparison(
                  current?.measures[
                    measureId
                  ],
                  baseline?.measures[
                    measureId
                  ],
                ),
              },
            ],
          ),
        );

      return {
        schemaVersion:
          REPORT_ROW_COMPARISON_SCHEMA_VERSION,
        rowComparisonKey:
          `report-row-comparison:${digest({
            dimensions,
            comparisons,
          })}`,
        dimensions,
        measures:
          comparisons,
      };
    },
  );
}

function comparisonResult({
  currentReport,
  baselineReport,
  baselineValues,
  definition,
  plan,
}) {
  const totals =
    Object.fromEntries(
      definition.measures.map(
        (measureId) => [
          measureId,
          {
            schemaVersion:
              REPORT_MEASURE_COMPARISON_SCHEMA_VERSION,
            ...measureComparison(
              currentReport.totals[
                measureId
              ],
              baselineReport
                ? baselineReport.totals[
                    measureId
                  ]
                : baselineValues[
                    measureId
                  ],
            ),
          },
        ],
      ),
    );
  const rows =
    compareRows({
      currentReport,
      baselineReport,
      measures:
        definition.measures,
    });
  const baselineReference = {
    schemaVersion:
      REPORT_BASELINE_REFERENCE_SCHEMA_VERSION,
    mode:
      plan.baseline.mode,
    kind:
      definition.kind,
    reportId:
      baselineReport?.reportId ??
      null,
    period:
      baselineReport?.period ??
      plan.baseline.period ??
      null,
    values:
      baselineReport
        ? null
        : baselineValues,
  };
  const identity = {
    schemaVersion:
      REPORT_COMPARISON_RESULT_SCHEMA_VERSION,
    definition,
    current: {
      reportId:
        currentReport.reportId,
      period:
        currentReport.period,
    },
    baseline:
      baselineReference,
    totals,
    rows,
    provenance: {
      currentReportId:
        currentReport.reportId,
      baselineReportId:
        baselineReport?.reportId ??
        null,
      planKey:
        plan.planKey,
    },
  };

  return deepFreeze({
    ...identity,
    comparisonResultId:
      `report-comparison-result:${digest(identity)}`,
    state:
      currentReport.state ===
        "EMPTY"
        ? "EMPTY_CURRENT"
        : "READY",
    favorability:
      null,
    boundary: {
      comparisonAuthority:
        true,
      reportingAggregationAuthority:
        false,
      domainTruthAuthority:
        false,
      periodResolutionAuthority:
        false,
      rankingAuthority:
        false,
      humanWorthAuthority:
        false,
      exportAuthority:
        false,
      uiAuthority:
        false,
      persistenceMutationAuthority:
        false,
    },
  });
}

export function createReportComparisonEngine(
  input,
) {
  assertPlainObject(
    input,
    "input",
  );
  assertExactKeys(
    input,
    INPUT_KEYS,
    "input",
  );

  const aggregationRuntime =
    input.aggregationRuntime;
  const periodResolver =
    input.periodResolver;

  if (
    aggregationRuntime?.schemaVersion !==
      AGGREGATION_RUNTIME_SCHEMA ||
    typeof aggregationRuntime.runReport !==
      "function"
  ) {
    engineError(
      "aggregationRuntime does not satisfy REP-04 runtime",
    );
  }

  if (
    periodResolver?.schemaVersion !==
      PERIOD_RESOLVER_SCHEMA ||
    typeof periodResolver.resolvePeriod !==
      "function"
  ) {
    engineError(
      "periodResolver does not satisfy REP-02 runtime",
    );
  }

  const engine = {
    schemaVersion:
      REPORT_COMPARISON_ENGINE_SCHEMA_VERSION,
    capabilities:
      Object.freeze([
        "PREVIOUS_PERIOD",
        "PREVIOUS_YEAR_SAME_PERIOD",
        "PERIOD_OVER_PERIOD",
        "YEAR_OVER_YEAR",
        "TARGET",
        "BUDGET",
        "CUSTOM_BASELINE",
        "TOTAL_COMPARISON",
        "ROW_COMPARISON",
      ]),
    boundary: {
      comparisonAuthority:
        true,
      reportingAggregationAuthority:
        false,
      domainTruthAuthority:
        false,
      periodResolutionAuthority:
        false,
      rankingAuthority:
        false,
      humanWorthAuthority:
        false,
      exportAuthority:
        false,
      uiAuthority:
        false,
      persistenceMutationAuthority:
        false,
    },

    createPlan({
      currentReport,
      definition,
      baseline,
    } = {}) {
      const current =
        normalizeReport(
          currentReport,
          "currentReport",
        );
      const comparisonDefinition =
        normalizeDefinition(
          definition,
        );

      assertReportMeasures(
        current,
        comparisonDefinition,
      );

      let baselinePlan;

      if (
        comparisonDefinition
          .baselineMode ===
        "REPORT_EXECUTION"
      ) {
        if (baseline !== undefined) {
          engineError(
            "period-derived comparison does not accept an explicit baseline",
          );
        }

        const range =
          deriveBaselineRange(
            current,
            comparisonDefinition.kind,
          );
        const period =
          periodResolver.resolvePeriod({
            period: {
              schemaVersion:
                "report-period-input.v1",
              kind:
                "CUSTOM_RANGE",
              parameters: {
                from:
                  range.from,
                to:
                  range.to,
              },
              resolutionStatus:
                "PENDING_REP_02",
            },
            timeZone:
              current.timeZone,
            asOf:
              current.asOf,
          });
        const resolvedRequest =
          createBaselineResolvedRequest({
            currentReport:
              current,
            definition:
              comparisonDefinition,
            period,
          });

        baselinePlan = {
          mode:
            "REPORT_EXECUTION",
          rule:
            range.rule,
          period,
          resolvedRequest,
        };
      } else if (
        comparisonDefinition
          .baselineMode ===
        "STATIC_VALUES"
      ) {
        baselinePlan = {
          mode:
            "STATIC_VALUES",
          values:
            normalizeStaticBaseline(
              baseline,
              comparisonDefinition.measures,
              "baseline",
            ),
        };
      } else {
        assertPlainObject(
          baseline,
          "baseline",
        );
        assertExactKeys(
          baseline,
          CUSTOM_BASELINE_KEYS,
          "baseline",
        );

        const baselineReport =
          normalizeReport(
            baseline.report,
            "baseline.report",
          );

        validateCompatibleReports(
          current,
          baselineReport,
          comparisonDefinition.measures,
        );

        baselinePlan = {
          mode:
            "EXTERNAL_REPORT",
          report:
            baselineReport,
        };
      }

      const identity = {
        schemaVersion:
          REPORT_COMPARISON_PLAN_SCHEMA_VERSION,
        definition:
          comparisonDefinition,
        currentReportId:
          current.reportId,
        baseline:
          baselinePlan,
      };

      return deepFreeze({
        ...identity,
        planKey:
          `report-comparison-plan:${digest(identity)}`,
        status:
          "READY_FOR_COMPARISON",
      });
    },

    async runComparison(inputValue) {
      assertPlainObject(
        inputValue,
        "input",
      );
      assertExactKeys(
        inputValue,
        RUN_INPUT_KEYS,
        "input",
      );

      const current =
        normalizeReport(
          inputValue.currentReport,
          "currentReport",
        );
      const definition =
        normalizeDefinition(
          inputValue.definition,
        );
      const plan =
        this.createPlan({
          currentReport:
            current,
          definition,
          baseline:
            inputValue.baseline,
        });

      let baselineReport = null;
      let baselineValues = null;

      if (
        plan.baseline.mode ===
        "REPORT_EXECUTION"
      ) {
        baselineReport =
          await aggregationRuntime.runReport(
            plan.baseline
              .resolvedRequest,
          );

        normalizeReport(
          baselineReport,
          "baseline report",
        );
        validateCompatibleReports(
          current,
          baselineReport,
          definition.measures,
        );
      } else if (
        plan.baseline.mode ===
        "EXTERNAL_REPORT"
      ) {
        baselineReport =
          plan.baseline.report;
      } else {
        baselineValues =
          plan.baseline.values;
      }

      return comparisonResult({
        currentReport:
          current,
        baselineReport,
        baselineValues,
        definition,
        plan,
      });
    },
  };

  return deepFreeze(engine);
}
