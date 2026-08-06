import {
  createHash,
} from "node:crypto";

import {
  REPORT_PROVIDER_RUNTIME_SCHEMA_VERSION,
} from "./report-provider-runtime.js";

import {
  createUniversalReportModel,
} from "../domain/universal-report-model.js";

export const UNIVERSAL_REPORT_AGGREGATION_RUNTIME_SCHEMA_VERSION =
  "universal-report-aggregation-runtime.v1";

export const UNIVERSAL_REPORT_AGGREGATION_PLAN_SCHEMA_VERSION =
  "universal-report-aggregation-plan.v1";

export const UNIVERSAL_REPORT_SLICE_DESCRIPTOR_SCHEMA_VERSION =
  "universal-report-slice-descriptor.v1";

const INPUT_KEYS =
  new Set([
    "providerRuntime",
  ]);

const RESOLVED_REQUEST_SCHEMA =
  "resolved-universal-report-request.v1";

const MILLISECONDS_PER_DAY =
  86_400_000;

export class UniversalReportAggregationError
  extends TypeError {
  constructor(message) {
    super(
      `UniversalReportAggregation: ${message}`,
    );
    this.name =
      "UniversalReportAggregationError";
  }
}

function aggregationError(message) {
  throw new UniversalReportAggregationError(
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
    aggregationError(
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
      aggregationError(
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
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/u.test(value)
  ) {
    aggregationError(
      `${label} must be YYYY-MM-DD`,
    );
  }

  const [year, month, day] =
    value.split("-").map(Number);
  const candidate =
    new Date(
      Date.UTC(
        year,
        month - 1,
        day,
      ),
    );

  if (
    candidate.getUTCFullYear() !== year ||
    candidate.getUTCMonth() + 1 !== month ||
    candidate.getUTCDate() !== day
  ) {
    aggregationError(
      `${label} is not a valid date`,
    );
  }

  return Math.floor(
    candidate.getTime() /
      MILLISECONDS_PER_DAY,
  );
}

function formatSerial(serial) {
  const value =
    new Date(
      serial *
        MILLISECONDS_PER_DAY,
    );

  return [
    String(
      value.getUTCFullYear(),
    ).padStart(4, "0"),
    String(
      value.getUTCMonth() + 1,
    ).padStart(2, "0"),
    String(
      value.getUTCDate(),
    ).padStart(2, "0"),
  ].join("-");
}

function normalizeResolvedRequest(
  request,
) {
  assertPlainObject(
    request,
    "resolved request",
  );

  if (
    request.schemaVersion !==
    RESOLVED_REQUEST_SCHEMA
  ) {
    aggregationError(
      "resolved request schemaVersion is not supported",
    );
  }

  if (
    request.status !==
    "PERIOD_RESOLVED_NOT_EXECUTED"
  ) {
    aggregationError(
      "resolved request status is not supported",
    );
  }

  if (
    request.boundary
      ?.periodResolutionComplete !==
      true
  ) {
    aggregationError(
      "resolved request period is not complete",
    );
  }

  return request;
}

function createSliceDescriptor({
  index,
  fromSerial,
  toSerial,
  parentPeriodKey,
  asOf,
  timeZone,
}) {
  const identity = {
    schemaVersion:
      UNIVERSAL_REPORT_SLICE_DESCRIPTOR_SCHEMA_VERSION,
    index,
    from:
      formatSerial(
        fromSerial,
      ),
    to:
      formatSerial(
        toSerial,
      ),
    dayCount:
      toSerial -
      fromSerial +
      1,
    parentPeriodKey,
    asOf,
    timeZone,
  };

  return deepFreeze({
    ...identity,
    descriptorKey:
      `report-slice-descriptor:${digest(identity)}`,
  });
}

function splitPeriod(
  period,
  maxSliceDays,
  asOf,
  timeZone,
) {
  const fromSerial =
    parseDate(
      period.from,
      "period.from",
    );
  const toSerial =
    parseDate(
      period.to,
      "period.to",
    );

  if (
    toSerial <
    fromSerial
  ) {
    aggregationError(
      "period.from must be on or before period.to",
    );
  }

  const slices = [];
  let cursor =
    fromSerial;
  let index = 0;

  while (
    cursor <=
    toSerial
  ) {
    const sliceTo =
      Math.min(
        cursor +
          maxSliceDays -
          1,
        toSerial,
      );

    slices.push(
      createSliceDescriptor({
        index,
        fromSerial:
          cursor,
        toSerial:
          sliceTo,
        parentPeriodKey:
          period.periodKey,
        asOf,
        timeZone,
      }),
    );

    cursor =
      sliceTo +
      1;
    index += 1;
  }

  return deepFreeze(
    slices,
  );
}

function assertContiguousCoverage(
  slices,
  period,
) {
  if (slices.length === 0) {
    aggregationError(
      "aggregation plan must contain at least one slice",
    );
  }

  const expectedFrom =
    parseDate(
      period.from,
      "period.from",
    );
  const expectedTo =
    parseDate(
      period.to,
      "period.to",
    );

  let nextExpected =
    expectedFrom;

  for (const slice of slices) {
    const from =
      parseDate(
        slice.from,
        "slice.from",
      );
    const to =
      parseDate(
        slice.to,
        "slice.to",
      );

    if (from !== nextExpected) {
      aggregationError(
        "aggregation slices contain a gap or overlap",
      );
    }

    if (to < from) {
      aggregationError(
        "aggregation slice has an invalid range",
      );
    }

    nextExpected =
      to +
      1;
  }

  if (
    nextExpected -
      1 !==
    expectedTo
  ) {
    aggregationError(
      "aggregation slices do not cover the requested period",
    );
  }
}

function createSubPeriod(
  parent,
  descriptor,
) {
  const identity = {
    schemaVersion:
      "resolved-report-period.v1",
    sourceSchemaVersion:
      "report-period-input.v1",
    inputKind:
      "CUSTOM_RANGE",
    kind:
      "CUSTOM_RANGE",
    family:
      "CUSTOM",
    from:
      descriptor.from,
    to:
      descriptor.to,
    naturalTo:
      descriptor.to,
    asOf:
      parent.asOf,
    localAsOfDate:
      parent.localAsOfDate,
    timeZone:
      parent.timeZone,
    dayCount:
      descriptor.dayCount,
    inclusive:
      true,
    isPartial:
      false,
    parameters: {
      from:
        descriptor.from,
      to:
        descriptor.to,
    },
    policy:
      parent.policy,
    parentPeriodKey:
      parent.periodKey,
  };

  return deepFreeze({
    ...identity,
    periodKey:
      `report-period:${digest(identity)}`,
    resolutionStatus:
      "RESOLVED",
  });
}

function createSubRequest(
  request,
  descriptor,
) {
  const period =
    createSubPeriod(
      request.period,
      descriptor,
    );
  const identity = {
    schemaVersion:
      request.schemaVersion,
    sourceSchemaVersion:
      request.sourceSchemaVersion,
    sourceRequestKey:
      request.sourceRequestKey,
    authority:
      request.authority,
    definitionId:
      request.definitionId,
    provider:
      request.provider,
    period,
    timeZone:
      request.timeZone,
    asOf:
      request.asOf,
    dimensions:
      request.dimensions,
    measures:
      request.measures,
    metadata:
      request.metadata,
  };

  return deepFreeze({
    ...identity,
    resolvedRequestKey:
      `resolved-report-request:${digest(identity)}`,
    status:
      request.status,
    boundary:
      request.boundary,
  });
}

function validateSlice(
  slice,
  descriptor,
  plan,
) {
  if (
    slice.period.from !==
      descriptor.from ||
    slice.period.to !==
      descriptor.to
  ) {
    aggregationError(
      "provider slice period does not match aggregation descriptor",
    );
  }

  if (
    slice.period.asOf !==
      plan.asOf ||
    slice.period.timeZone !==
      plan.timeZone
  ) {
    aggregationError(
      "provider slice snapshot does not match aggregation plan",
    );
  }

  if (
    slice.provider.providerId !==
      plan.provider.providerId ||
    slice.provider.providerVersion !==
      plan.provider.providerVersion
  ) {
    aggregationError(
      "provider slice identity does not match aggregation plan",
    );
  }
}

function createAccumulator(
  capability,
) {
  return {
    capability,
    count: 0,
    sum: 0,
    min: null,
    max: null,
    first: undefined,
    last: undefined,
    none: undefined,
  };
}

function addValue(
  accumulator,
  value,
) {
  const {
    capability,
  } = accumulator;

  if (value === null) {
    return;
  }

  if (
    [
      "SUM",
      "AVERAGE",
      "MIN",
      "MAX",
    ].includes(
      capability.aggregation,
    ) &&
    typeof value !== "number"
  ) {
    aggregationError(
      `measure ${capability.measureId} requires numeric values for ${capability.aggregation}`,
    );
  }

  accumulator.count += 1;

  if (
    accumulator.first ===
    undefined
  ) {
    accumulator.first =
      value;
  }

  accumulator.last =
    value;

  switch (
    capability.aggregation
  ) {
    case "SUM":
    case "AVERAGE":
      accumulator.sum +=
        value;
      break;

    case "MIN":
      accumulator.min =
        accumulator.min === null
          ? value
          : Math.min(
              accumulator.min,
              value,
            );
      break;

    case "MAX":
      accumulator.max =
        accumulator.max === null
          ? value
          : Math.max(
              accumulator.max,
              value,
            );
      break;

    case "NONE":
      if (
        accumulator.none ===
        undefined
      ) {
        accumulator.none =
          value;
      } else if (
        !Object.is(
          accumulator.none,
          value,
        )
      ) {
        aggregationError(
          `measure ${capability.measureId} has conflicting NONE values`,
        );
      }
      break;

    case "FIRST":
    case "LAST":
      break;

    default:
      aggregationError(
        `measure ${capability.measureId} has unsupported aggregation`,
      );
  }
}

function finishValue(
  accumulator,
) {
  if (
    accumulator.count === 0
  ) {
    return null;
  }

  switch (
    accumulator.capability
      .aggregation
  ) {
    case "SUM":
      return accumulator.sum;
    case "AVERAGE":
      return (
        accumulator.sum /
        accumulator.count
      );
    case "MIN":
      return accumulator.min;
    case "MAX":
      return accumulator.max;
    case "FIRST":
      return accumulator.first;
    case "LAST":
      return accumulator.last;
    case "NONE":
      return accumulator.none;
    default:
      aggregationError(
        "unsupported aggregation",
      );
  }
}

function aggregationKey(
  dimensions,
) {
  return JSON.stringify(
    canonicalize(
      dimensions,
    ),
  );
}

function aggregateSlices(
  slices,
  providerContract,
  dimensions,
  measures,
) {
  const measureCapabilities =
    new Map(
      providerContract.measures.map(
        (item) => [
          item.measureId,
          item,
        ],
      ),
    );
  const groups =
    new Map();
  const totalAccumulators =
    new Map(
      measures.map(
        (measureId) => [
          measureId,
          createAccumulator(
            measureCapabilities.get(
              measureId,
            ),
          ),
        ],
      ),
    );
  const exclusionCounts =
    new Map();
  const provenance =
    new Map();

  for (const slice of slices) {
    for (const row of
      slice.rows) {
      const selectedDimensions =
        Object.fromEntries(
          dimensions.map(
            (dimensionId) => [
              dimensionId,
              row.dimensions[
                dimensionId
              ],
            ],
          ),
        );
      const key =
        aggregationKey(
          selectedDimensions,
        );

      if (!groups.has(key)) {
        groups.set(
          key,
          {
            dimensions:
              selectedDimensions,
            accumulators:
              new Map(
                measures.map(
                  (measureId) => [
                    measureId,
                    createAccumulator(
                      measureCapabilities.get(
                        measureId,
                      ),
                    ),
                  ],
                ),
              ),
          },
        );
      }

      const group =
        groups.get(key);

      for (const measureId of
        measures) {
        const value =
          row.measures[
            measureId
          ];

        addValue(
          group.accumulators.get(
            measureId,
          ),
          value,
        );
        addValue(
          totalAccumulators.get(
            measureId,
          ),
          value,
        );
      }
    }

    for (const exclusion of
      slice.exclusions) {
      exclusionCounts.set(
        exclusion.code,
        (
          exclusionCounts.get(
            exclusion.code,
          ) ?? 0
        ) +
          exclusion.count,
      );
    }

    for (const item of
      slice.provenance) {
      const key =
        [
          item.sourceId,
          item.sourceVersion,
          item.authority,
        ].join("\u001f");

      if (!provenance.has(key)) {
        provenance.set(
          key,
          item,
        );
      }
    }
  }

  const rows =
    [...groups.entries()]
      .sort(
        ([left], [right]) =>
          left.localeCompare(right),
      )
      .map(
        ([, group]) => ({
          dimensions:
            group.dimensions,
          measures:
            Object.fromEntries(
              measures.map(
                (measureId) => [
                  measureId,
                  finishValue(
                    group.accumulators.get(
                      measureId,
                    ),
                  ),
                ],
              ),
            ),
        }),
      );
  const totals =
    Object.fromEntries(
      measures.map(
        (measureId) => [
          measureId,
          finishValue(
            totalAccumulators.get(
              measureId,
            ),
          ),
        ],
      ),
    );
  const exclusions =
    [...exclusionCounts.entries()]
      .sort(
        ([left], [right]) =>
          left.localeCompare(right),
      )
      .map(
        ([code, count]) => ({
          code,
          count,
        }),
      );
  const provenanceList =
    [...provenance.entries()]
      .sort(
        ([left], [right]) =>
          left.localeCompare(right),
      )
      .map(
        ([, item]) =>
          item,
      );

  return {
    rows,
    totals,
    exclusions,
    provenance:
      provenanceList,
  };
}

export function createUniversalReportAggregationRuntime(
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

  const providerRuntime =
    input.providerRuntime;

  if (
    providerRuntime?.schemaVersion !==
    REPORT_PROVIDER_RUNTIME_SCHEMA_VERSION ||
    typeof providerRuntime.createPlan !==
      "function" ||
    typeof providerRuntime.readSlice !==
      "function"
  ) {
    aggregationError(
      "providerRuntime does not satisfy REP-03 runtime",
    );
  }

  const runtime = {
    schemaVersion:
      UNIVERSAL_REPORT_AGGREGATION_RUNTIME_SCHEMA_VERSION,
    capabilities:
      Object.freeze([
        "CONTIGUOUS_SLICE_PLANNING",
        "DETERMINISTIC_BATCHING",
        "UNIVERSAL_MEASURE_AGGREGATION",
        "EXCLUSION_CONSOLIDATION",
        "PROVENANCE_CONSOLIDATION",
        "UNIVERSAL_REPORT_MODEL",
      ]),
    boundary: {
      reportingAggregationAuthority:
        true,
      domainTruthAuthority:
        false,
      periodResolutionAuthority:
        false,
      comparisonAuthority:
        false,
      exportAuthority:
        false,
      uiAuthority:
        false,
      persistenceMutationAuthority:
        false,
    },

    createPlan(resolvedRequest) {
      const request =
        normalizeResolvedRequest(
          resolvedRequest,
        );
      const providerPlan =
        providerRuntime.createPlan(
          request,
        );
      const slices =
        splitPeriod(
          request.period,
          providerPlan.slicePolicy
            .maxSliceDays,
          request.asOf,
          request.timeZone,
        );

      assertContiguousCoverage(
        slices,
        request.period,
      );

      if (
        providerPlan.executionMode ===
          "DIRECT" &&
        slices.length !== 1
      ) {
        aggregationError(
          "direct provider plan must produce one slice",
        );
      }

      const identity = {
        schemaVersion:
          UNIVERSAL_REPORT_AGGREGATION_PLAN_SCHEMA_VERSION,
        sourceResolvedRequestKey:
          request.resolvedRequestKey,
        provider:
          providerPlan.query.provider,
        definition:
          providerPlan.query.definition,
        period:
          request.period,
        asOf:
          request.asOf,
        timeZone:
          request.timeZone,
        dimensions:
          providerPlan.query.dimensions,
        measures:
          providerPlan.query.measures,
        executionMode:
          slices.length === 1
            ? "DIRECT"
            : "BATCHED",
        maxSliceDays:
          providerPlan.slicePolicy
            .maxSliceDays,
        sliceCount:
          slices.length,
        slices,
      };

      return deepFreeze({
        ...identity,
        planKey:
          `universal-report-aggregation-plan:${digest(identity)}`,
        status:
          "READY_FOR_AGGREGATION",
      });
    },

    async runReport(resolvedRequest) {
      const request =
        normalizeResolvedRequest(
          resolvedRequest,
        );
      const plan =
        this.createPlan(
          request,
        );
      const definition =
        providerRuntime.getDefinition(
          request.definitionId,
        );
      const provider =
        providerRuntime.getProvider(
          request.provider.providerId,
        );
      const slices = [];

      for (const descriptor of
        plan.slices) {
        const subRequest =
          plan.sliceCount === 1
            ? request
            : createSubRequest(
                request,
                descriptor,
              );
        const slice =
          await providerRuntime.readSlice(
            subRequest,
          );

        validateSlice(
          slice,
          descriptor,
          plan,
        );
        slices.push(slice);
      }

      const aggregated =
        aggregateSlices(
          slices,
          provider.contract,
          plan.dimensions,
          plan.measures,
        );

      return createUniversalReportModel({
        resolvedRequest: {
          ...request,
          dimensions:
            plan.dimensions,
          measures:
            plan.measures,
        },
        definition,
        providerContract:
          provider.contract,
        rows:
          aggregated.rows,
        totals:
          aggregated.totals,
        exclusions:
          aggregated.exclusions,
        provenance:
          aggregated.provenance,
        execution: {
          mode:
            plan.executionMode,
          sliceCount:
            plan.sliceCount,
          maxSliceDays:
            plan.maxSliceDays,
          planKey:
            plan.planKey,
          sliceKeys:
            slices.map(
              (slice) =>
                slice.sliceKey,
            ),
          descriptors:
            plan.slices,
        },
      });
    },
  };

  return deepFreeze(runtime);
}
