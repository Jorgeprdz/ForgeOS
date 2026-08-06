import {
  assertActivityReportSourcePort,
} from "../application/activity-report-source-port.js";

import {
  createReportProviderPort,
} from "../application/report-provider-port.js";

import {
  createReportDefinition,
} from "../domain/report-definition.js";

import {
  FES_ACTIVITY_PERIOD_AGGREGATION_SCHEMA_VERSION,
} from "../infrastructure/fes-activity-report-source-adapter.js";

export const ACTIVITY_REPORT_PROVIDER_SCHEMA_VERSION =
  "activity-report-provider.v2";

export const ACTIVITY_REPORT_DEFINITION_ID =
  "activity-by-date-and-type";

export const ACTIVITY_REPORT_DEFINITION_VERSION =
  "activity-by-date-and-type.v2";

const AGGREGATION_KEYS = new Set([
  "schemaVersion",
  "authority",
  "period",
  "status",
  "activityTypes",
  "days",
  "totalActivityCount",
  "exclusions",
  "provenance",
  "boundary",
]);

export class ActivityReportProviderError extends TypeError {
  constructor(message) {
    super(`ActivityReportProvider: ${message}`);
    this.name = "ActivityReportProviderError";
  }
}

function fail(message) {
  throw new ActivityReportProviderError(message);
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

function exactKeys(value, allowed, label) {
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) {
      fail(`${label} contains unknown field ${key}`);
    }
  }
}

function nonNegativeInteger(value, label) {
  if (!Number.isSafeInteger(value) || value < 0) {
    fail(`${label} must be a non-negative integer`);
  }
  return value;
}

function selected(value, keys) {
  return Object.fromEntries(keys.map((key) => [key, value[key]]));
}

function freeze(value) {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }
  Object.values(value).forEach(freeze);
  return Object.freeze(value);
}

function sameSet(left, right) {
  return (
    left.length === right.length &&
    [...left].sort().every((value, index) => value === [...right].sort()[index])
  );
}

function assertAuthority(query, sourcePort) {
  if (
    query.authority?.organizationId !== sourcePort.authority.organizationId ||
    query.authority?.principalId !== sourcePort.authority.advisorId
  ) {
    fail("query authority does not match the Activity source authority");
  }
}

function assertAggregation(value, query, sourcePort) {
  plain(value, "aggregation");
  exactKeys(value, AGGREGATION_KEYS, "aggregation");

  if (value.schemaVersion !== FES_ACTIVITY_PERIOD_AGGREGATION_SCHEMA_VERSION) {
    fail("aggregation schemaVersion is unsupported");
  }

  if (
    value.authority?.organizationId !== sourcePort.authority.organizationId ||
    value.authority?.advisorId !== sourcePort.authority.advisorId
  ) {
    fail("aggregation authority drifted");
  }

  if (
    value.period?.evaluationDateFrom !== query.period.from ||
    value.period?.evaluationDateTo !== query.period.to ||
    value.period?.asOf !== query.asOf
  ) {
    fail("aggregation period or asOf drifted");
  }

  if (!Array.isArray(value.activityTypes)) {
    fail("aggregation.activityTypes must be an array");
  }
  if (!sameSet(value.activityTypes, sourcePort.activityTypes)) {
    fail("aggregation Activity vocabulary drifted");
  }
  if (!Array.isArray(value.days)) {
    fail("aggregation.days must be an array");
  }
  if (!Array.isArray(value.exclusions)) {
    fail("aggregation.exclusions must be an array");
  }

  let reconciledTotal = 0;
  for (const [dayIndex, day] of value.days.entries()) {
    plain(day, `aggregation.days[${dayIndex}]`);
    if (typeof day.evaluationDate !== "string") {
      fail(`aggregation.days[${dayIndex}].evaluationDate must be a date`);
    }
    plain(day.countsByType, `aggregation.days[${dayIndex}].countsByType`);

    if (!sameSet(Object.keys(day.countsByType), sourcePort.activityTypes)) {
      fail(`aggregation.days[${dayIndex}] Activity vocabulary drifted`);
    }

    let dayTotal = 0;
    for (const activityType of sourcePort.activityTypes) {
      dayTotal += nonNegativeInteger(
        day.countsByType[activityType],
        `aggregation.days[${dayIndex}].countsByType.${activityType}`,
      );
    }

    if (dayTotal !== day.activityCount) {
      fail(`aggregation.days[${dayIndex}] does not reconcile`);
    }
    reconciledTotal += dayTotal;
  }

  if (
    nonNegativeInteger(value.totalActivityCount, "aggregation.totalActivityCount") !==
    reconciledTotal
  ) {
    fail("aggregation.totalActivityCount does not reconcile");
  }

  plain(value.provenance, "aggregation.provenance");
  return value;
}

function rowsFromAggregation(aggregation, query, activityTypes) {
  const grouped = new Map();

  for (const day of aggregation.days) {
    for (const activityType of activityTypes) {
      const activityCount = day.countsByType[activityType];
      if (activityCount === 0) continue;

      const allDimensions = {
        evaluationDate: day.evaluationDate,
        activityType,
      };
      const dimensions = selected(allDimensions, query.dimensions);
      const groupKey = JSON.stringify(dimensions);

      if (!grouped.has(groupKey)) {
        grouped.set(groupKey, {
          dimensions,
          activityCount: 0,
        });
      }
      grouped.get(groupKey).activityCount += activityCount;
    }
  }

  return [...grouped.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([, group]) => ({
      dimensions: group.dimensions,
      measures: selected(
        { activityCount: group.activityCount },
        query.measures,
      ),
    }));
}

export function createActivityReportProvider({ sourcePort } = {}) {
  const source = assertActivityReportSourcePort(sourcePort);

  const dimensions = [
    {
      dimensionId: "evaluationDate",
      valueKind: "DATE",
      nullable: false,
    },
    {
      dimensionId: "activityType",
      valueKind: "STRING",
      nullable: false,
    },
  ];

  const measures = [
    {
      measureId: "activityCount",
      valueKind: "NUMBER",
      unit: "COUNT",
      aggregation: "SUM",
      nullable: false,
    },
  ];

  const port = createReportProviderPort({
    descriptor: {
      providerId: "activity",
      providerVersion: ACTIVITY_REPORT_PROVIDER_SCHEMA_VERSION,
      domain: "ACTIVITY",
      capabilities: [
        "ACTIVITY_CANONICAL_EVENT_COUNTS",
        "ACTIVITY_DAILY_COUNTS",
        "ACTIVITY_TYPE_COUNTS",
        "ACTIVITY_EXCLUSION_PROVENANCE",
      ],
    },
    dimensions,
    measures,
    maxSliceDays: 31,
    batchingMode: "CONTIGUOUS_DATE_RANGES",

    async readSlice(query) {
      plain(query, "query");
      assertAuthority(query, source);

      const aggregation = assertAggregation(
        await source.aggregatePeriod({
          evaluationDateFrom: query.period.from,
          evaluationDateTo: query.period.to,
          asOf: query.asOf,
        }),
        query,
        source,
      );

      return {
        rows: rowsFromAggregation(
          aggregation,
          query,
          source.activityTypes,
        ),
        exclusions: aggregation.exclusions.map(({ code, count }) => ({
          code,
          count,
        })),
        provenance: [
          {
            sourceId: aggregation.provenance.sourceId,
            sourceVersion: aggregation.provenance.sourceVersion,
            authority: aggregation.provenance.authority,
          },
        ],
      };
    },
  });

  const definition = createReportDefinition({
    definitionId: ACTIVITY_REPORT_DEFINITION_ID,
    definitionVersion: ACTIVITY_REPORT_DEFINITION_VERSION,
    providerId: port.contract.descriptor.providerId,
    dimensions: dimensions.map((item) => item.dimensionId),
    measures: measures.map((item) => item.measureId),
    defaultDimensions: [
      "evaluationDate",
      "activityType",
    ],
    defaultMeasures: [
      "activityCount",
    ],
  });

  return freeze({
    schemaVersion: ACTIVITY_REPORT_PROVIDER_SCHEMA_VERSION,
    definition,
    port,
    boundary: {
      canonicalEventTruthAuthority: false,
      activityReadAuthority: true,
      activityWriteAuthority: false,
      scoringAuthority: false,
      eventInterpretationAuthority: false,
      periodResolutionAuthority: false,
      universalAggregationAuthority: false,
      comparisonAuthority: false,
      exportAuthority: false,
      uiAuthority: false,
      persistenceMutationAuthority: false,
    },
  });
}
