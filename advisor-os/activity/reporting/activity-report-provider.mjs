import {
  createReportProviderPort,
} from "../../reporting/application/report-provider-port.mjs";

import {
  ACTIVITY_TYPES,
} from "../domain/activity-record.mjs";

import {
  ACTIVITY_PERIOD_AGGREGATION_SCHEMA_VERSION,
} from "../application/activity-period-aggregator.mjs";

import {
  ACTIVITY_READ_RUNTIME_SCHEMA_VERSION,
} from "../runtime/activity-read-runtime.mjs";

export const ACTIVITY_REPORT_PROVIDER_SCHEMA_VERSION =
  "activity-report-provider.v1";

export const ACTIVITY_REPORT_DEFINITION_ID =
  "activity-by-type";

export const ACTIVITY_REPORT_DEFINITION_VERSION =
  "activity-by-type.v1";

const REQUIRED_RUNTIME_CAPABILITY =
  "ACTIVITY_PERIOD_AGGREGATION";

const COUNT_MAP_KEYS =
  Object.freeze([
    "observedByType",
    "eligibleByType",
    "suppressedByType",
  ]);

export class ActivityReportProviderError
  extends TypeError {
  constructor(message) {
    super(
      `ActivityReportProvider: ${message}`,
    );
    this.name =
      "ActivityReportProviderError";
  }
}

function fail(message) {
  throw new ActivityReportProviderError(
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
    fail(
      `${label} must be a plain object`,
    );
  }
}

function nonNegativeInteger(
  value,
  label,
) {
  if (
    !Number.isSafeInteger(value) ||
    value < 0
  ) {
    fail(
      `${label} must be a non-negative integer`,
    );
  }

  return value;
}

function assertReadRuntime(value) {
  if (
    value === null ||
    typeof value !== "object" ||
    value.schemaVersion !==
      ACTIVITY_READ_RUNTIME_SCHEMA_VERSION ||
    typeof value.aggregatePeriod !==
      "function" ||
    value.authority === null ||
    typeof value.authority !==
      "object" ||
    !Array.isArray(value.capabilities) ||
    !value.capabilities.includes(
      REQUIRED_RUNTIME_CAPABILITY,
    )
  ) {
    fail(
      "readRuntime does not satisfy Activity read authority",
    );
  }

  if (
    typeof value.authority.organizationId !==
      "string" ||
    value.authority.organizationId.trim() ===
      "" ||
    typeof value.authority.advisorId !==
      "string" ||
    value.authority.advisorId.trim() ===
      ""
  ) {
    fail(
      "readRuntime authority is incomplete",
    );
  }

  return value;
}

function selected(
  object,
  keys,
) {
  return Object.fromEntries(
    keys.map(
      (key) => [
        key,
        object[key],
      ],
    ),
  );
}

function assertAuthority(
  query,
  runtime,
) {
  if (
    query.authority.organizationId !==
      runtime.authority.organizationId ||
    query.authority.principalId !==
      runtime.authority.advisorId
  ) {
    fail(
      "query authority does not match Activity runtime authority",
    );
  }
}

function assertDailySlice(query) {
  if (
    query.period.from !==
    query.period.to
  ) {
    fail(
      "Activity report provider requires one evaluation date per slice",
    );
  }
}

function assertCountMap(
  value,
  label,
) {
  assertPlainObject(
    value,
    label,
  );

  const keys =
    Object.keys(value).sort();
  const expected =
    [...ACTIVITY_TYPES].sort();

  if (
    keys.length !==
      expected.length ||
    keys.some(
      (key, index) =>
        key !== expected[index],
    )
  ) {
    fail(
      `${label} must contain the canonical Activity vocabulary`,
    );
  }

  for (const type of ACTIVITY_TYPES) {
    nonNegativeInteger(
      value[type],
      `${label}.${type}`,
    );
  }

  return value;
}

function sumCounts(value) {
  return Object.values(value)
    .reduce(
      (total, count) =>
        total + count,
      0,
    );
}

function assertAggregation(
  value,
  query,
  runtime,
) {
  assertPlainObject(
    value,
    "aggregation",
  );

  if (
    value.schemaVersion !==
    ACTIVITY_PERIOD_AGGREGATION_SCHEMA_VERSION
  ) {
    fail(
      "aggregation schemaVersion is unsupported",
    );
  }

  if (
    value.organizationId !==
      runtime.authority.organizationId ||
    value.advisorId !==
      runtime.authority.advisorId
  ) {
    fail(
      "aggregation authority drifted",
    );
  }

  if (
    value.period?.evaluationDateFrom !==
      query.period.from ||
    value.period?.evaluationDateTo !==
      query.period.to
  ) {
    fail(
      "aggregation period coverage drifted",
    );
  }

  if (
    value.period.asOf !==
      query.asOf
  ) {
    fail(
      "aggregation asOf drifted",
    );
  }

  for (const key of COUNT_MAP_KEYS) {
    assertCountMap(
      value[key],
      key,
    );
  }

  const periodRecordCount =
    nonNegativeInteger(
      value.periodRecordCount,
      "periodRecordCount",
    );
  const eligibleActivityCount =
    nonNegativeInteger(
      value.eligibleActivityCount,
      "eligibleActivityCount",
    );
  const suppressedEligibleCount =
    nonNegativeInteger(
      value.suppressedEligibleCount,
      "suppressedEligibleCount",
    );

  if (
    sumCounts(value.observedByType) !==
    periodRecordCount
  ) {
    fail(
      "observedByType does not reconcile with periodRecordCount",
    );
  }

  if (
    sumCounts(value.eligibleByType) !==
    eligibleActivityCount
  ) {
    fail(
      "eligibleByType does not reconcile with eligibleActivityCount",
    );
  }

  if (
    sumCounts(value.suppressedByType) !==
    suppressedEligibleCount
  ) {
    fail(
      "suppressedByType does not reconcile with suppressedEligibleCount",
    );
  }

  assertPlainObject(
    value.relations,
    "relations",
  );

  nonNegativeInteger(
    value.futureRecordedExcludedCount,
    "futureRecordedExcludedCount",
  );
  nonNegativeInteger(
    value.relations
      .suppressedByCorrectionCount,
    "relations.suppressedByCorrectionCount",
  );
  nonNegativeInteger(
    value.relations
      .suppressedByReversalCount,
    "relations.suppressedByReversalCount",
  );

  return value;
}

export function createActivityReportProvider({
  readRuntime,
} = {}) {
  const runtime =
    assertReadRuntime(
      readRuntime,
    );

  const dimensions = [
    {
      dimensionId:
        "evaluationDate",
      valueKind:
        "DATE",
      nullable:
        false,
    },
    {
      dimensionId:
        "activityType",
      valueKind:
        "STRING",
      nullable:
        false,
    },
  ];

  const measures = [
    {
      measureId:
        "observedActivityCount",
      valueKind:
        "NUMBER",
      unit:
        "COUNT",
      aggregation:
        "SUM",
      nullable:
        false,
    },
    {
      measureId:
        "eligibleActivityCount",
      valueKind:
        "NUMBER",
      unit:
        "COUNT",
      aggregation:
        "SUM",
      nullable:
        false,
    },
    {
      measureId:
        "suppressedActivityCount",
      valueKind:
        "NUMBER",
      unit:
        "COUNT",
      aggregation:
        "SUM",
      nullable:
        false,
    },
  ];

  const port =
    createReportProviderPort({
      descriptor: {
        providerId:
          "activity",
        providerVersion:
          ACTIVITY_REPORT_PROVIDER_SCHEMA_VERSION,
        domain:
          "ACTIVITY",
        capabilities: [
          "ACTIVITY_DAILY_TYPE_COUNTS",
          "ACTIVITY_OBSERVED_COUNTS",
          "ACTIVITY_ELIGIBLE_COUNTS",
          "ACTIVITY_SUPPRESSION_COUNTS",
        ],
      },
      dimensions,
      measures,
      maxSliceDays:
        1,
      batchingMode:
        "CONTIGUOUS_DATE_RANGES",

      async readSlice(query) {
        assertPlainObject(
          query,
          "query",
        );
        assertAuthority(
          query,
          runtime,
        );
        assertDailySlice(
          query,
        );

        const aggregation =
          assertAggregation(
            await runtime.aggregatePeriod({
              evaluationDateFrom:
                query.period.from,
              evaluationDateTo:
                query.period.to,
              asOf:
                query.asOf,
            }),
            query,
            runtime,
          );

        const rows =
          ACTIVITY_TYPES.map(
            (activityType) => {
              const dimensionValues = {
                evaluationDate:
                  query.period.from,
                activityType,
              };
              const measureValues = {
                observedActivityCount:
                  aggregation
                    .observedByType[
                      activityType
                    ],
                eligibleActivityCount:
                  aggregation
                    .eligibleByType[
                      activityType
                    ],
                suppressedActivityCount:
                  aggregation
                    .suppressedByType[
                      activityType
                    ],
              };

              return {
                dimensions:
                  selected(
                    dimensionValues,
                    query.dimensions,
                  ),
                measures:
                  selected(
                    measureValues,
                    query.measures,
                  ),
              };
            },
          );

        return {
          rows,
          exclusions: [
            {
              code:
                "FUTURE_RECORDED",
              count:
                aggregation
                  .futureRecordedExcludedCount,
            },
            {
              code:
                "CORRECTION_SUPPRESSION",
              count:
                aggregation.relations
                  .suppressedByCorrectionCount,
            },
            {
              code:
                "REVERSAL_SUPPRESSION",
              count:
                aggregation.relations
                  .suppressedByReversalCount,
            },
          ],
          provenance: [
            {
              sourceId:
                "activity-read-runtime",
              sourceVersion:
                aggregation.schemaVersion,
              authority:
                "ACTIVITY_READ_RUNTIME",
            },
          ],
        };
      },
    });

  return Object.freeze({
    schemaVersion:
      ACTIVITY_REPORT_PROVIDER_SCHEMA_VERSION,
    definition:
      Object.freeze({
        definitionId:
          ACTIVITY_REPORT_DEFINITION_ID,
        definitionVersion:
          ACTIVITY_REPORT_DEFINITION_VERSION,
        providerId:
          port.contract.descriptor
            .providerId,
        dimensions:
          Object.freeze(
            dimensions.map(
              (item) =>
                item.dimensionId,
            ),
          ),
        measures:
          Object.freeze(
            measures.map(
              (item) =>
                item.measureId,
            ),
          ),
        defaultDimensions:
          Object.freeze([
            "evaluationDate",
            "activityType",
          ]),
        defaultMeasures:
          Object.freeze([
            "observedActivityCount",
            "eligibleActivityCount",
            "suppressedActivityCount",
          ]),
      }),
    port,
    boundary:
      Object.freeze({
        activityReadAuthority:
          true,
        activityWriteAuthority:
          false,
        scoringAuthority:
          false,
        eligibilityPolicyAuthority:
          false,
        correctionAuthority:
          false,
        reversalAuthority:
          false,
        pipelineWriterMutationAuthority:
          false,
        universalAggregationAuthority:
          false,
        comparisonAuthority:
          false,
        exportAuthority:
          false,
        uiAuthority:
          false,
        persistenceMutationAuthority:
          false,
      }),
  });
}
