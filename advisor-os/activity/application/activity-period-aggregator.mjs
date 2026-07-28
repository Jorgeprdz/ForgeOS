import {
  ACTIVITY_EVIDENCE_STATES,
  ACTIVITY_LIFECYCLE_STATES,
  ACTIVITY_SOURCE_SYSTEMS,
  ACTIVITY_TYPES,
  assertActivityRecord,
  isActivityScoringEligible,
} from "../domain/activity-record.mjs";

import {
  assertActivityRepositoryPort,
} from "./activity-repository-port.mjs";

export const ACTIVITY_PERIOD_AGGREGATION_SCHEMA_VERSION =
  "activity-period-aggregation.v1";

const QUERY_KEYS = new Set([
  "organizationId",
  "advisorId",
  "evaluationDateFrom",
  "evaluationDateTo",
  "asOf",
]);

const INPUT_KEYS = new Set([
  "records",
  "query",
]);

function aggregationError(message) {
  throw new ActivityPeriodAggregationError(
    message,
  );
}

export class ActivityPeriodAggregationError
  extends TypeError {
  constructor(message) {
    super(
      `ActivityPeriodAggregation: ${message}`,
    );
    this.name =
      "ActivityPeriodAggregationError";
  }
}

function assertPlainObject(value, label) {
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

function requiredString(value, label) {
  if (
    typeof value !== "string" ||
    value.trim() === ""
  ) {
    aggregationError(
      `${label} must be a non-empty string`,
    );
  }

  return value.trim();
}

function calendarDate(value, label) {
  const input = requiredString(
    value,
    label,
  );

  if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    aggregationError(
      `${label} must use YYYY-MM-DD`,
    );
  }

  const [year, month, day] =
    input.split("-").map(Number);

  const candidate = new Date(
    Date.UTC(year, month - 1, day),
  );

  if (
    candidate.getUTCFullYear() !== year ||
    candidate.getUTCMonth() !== month - 1 ||
    candidate.getUTCDate() !== day
  ) {
    aggregationError(
      `${label} is not a real date`,
    );
  }

  return input;
}

function canonicalInstant(value, label) {
  const parsed = new Date(
    requiredString(value, label),
  );

  if (Number.isNaN(parsed.getTime())) {
    aggregationError(
      `${label} must be an ISO instant`,
    );
  }

  return parsed.toISOString();
}

function positiveInteger(value, label) {
  if (
    !Number.isSafeInteger(value) ||
    value < 1
  ) {
    aggregationError(
      `${label} must be a positive integer`,
    );
  }

  return value;
}

function deepFreeze(value) {
  if (
    value === null ||
    typeof value !== "object" ||
    Object.isFrozen(value)
  ) {
    return value;
  }

  for (const nested of Object.values(value)) {
    deepFreeze(nested);
  }

  return Object.freeze(value);
}

function zeroCounts(vocabulary) {
  return Object.fromEntries(
    vocabulary.map(
      (value) => [value, 0],
    ),
  );
}

function increment(counts, key) {
  counts[key] += 1;
}

function nullableMinimum(current, value) {
  if (current === null || value < current) {
    return value;
  }

  return current;
}

function nullableMaximum(current, value) {
  if (current === null || value > current) {
    return value;
  }

  return current;
}

function sortedValues(values) {
  return [...values].sort();
}

function snapshotCursorKey(cursor) {
  return [
    cursor.occurredAt,
    cursor.id,
  ].join("\u001f");
}

export function createActivityPeriodQuery(
  input,
) {
  assertPlainObject(input, "query");
  assertExactKeys(
    input,
    QUERY_KEYS,
    "query",
  );

  const evaluationDateFrom =
    calendarDate(
      input.evaluationDateFrom,
      "evaluationDateFrom",
    );
  const evaluationDateTo =
    calendarDate(
      input.evaluationDateTo,
      "evaluationDateTo",
    );

  if (
    evaluationDateFrom >
    evaluationDateTo
  ) {
    aggregationError(
      "evaluation date range is reversed",
    );
  }

  return deepFreeze({
    organizationId: requiredString(
      input.organizationId,
      "organizationId",
    ),
    advisorId: requiredString(
      input.advisorId,
      "advisorId",
    ),
    evaluationDateFrom,
    evaluationDateTo,
    asOf: canonicalInstant(
      input.asOf,
      "asOf",
    ),
  });
}

export function aggregateActivityPeriod(
  input,
) {
  assertPlainObject(input, "input");
  assertExactKeys(
    input,
    INPUT_KEYS,
    "input",
  );

  if (!Array.isArray(input.records)) {
    aggregationError(
      "records must be an array",
    );
  }

  const query =
    createActivityPeriodQuery(input.query);

  const snapshot = [];
  const byId = new Map();
  let futureRecordedExcludedCount = 0;

  for (const candidate of input.records) {
    const record =
      assertActivityRecord(candidate);

    if (
      record.organizationId !==
      query.organizationId
    ) {
      aggregationError(
        `record ${record.id} belongs to another organization`,
      );
    }

    if (
      record.advisorId !==
      query.advisorId
    ) {
      aggregationError(
        `record ${record.id} belongs to another advisor`,
      );
    }

    if (byId.has(record.id)) {
      aggregationError(
        `duplicate activity id ${record.id}`,
      );
    }

    if (
      record.source.recordedAt >
      query.asOf
    ) {
      futureRecordedExcludedCount += 1;
      continue;
    }

    byId.set(record.id, record);
    snapshot.push(record);
  }

  const suppressionByTarget = new Map();
  let correctionRecordCount = 0;
  let reversalRecordCount = 0;

  for (const record of snapshot) {
    const relation =
      record.correction ??
      record.reversal;

    if (!relation) {
      continue;
    }

    const target =
      byId.get(relation.activityId);

    if (!target) {
      aggregationError(
        `relation target ${relation.activityId} is missing from the as-of snapshot`,
      );
    }

    if (
      target.source.recordedAt >
      record.source.recordedAt
    ) {
      aggregationError(
        `relation ${record.id} precedes its target`,
      );
    }

    if (record.lifecycle === "REVERSED") {
      reversalRecordCount += 1;
      suppressionByTarget.set(
        target.id,
        "REVERSED",
      );
      continue;
    }

    correctionRecordCount += 1;

    if (
      suppressionByTarget.get(target.id) !==
      "REVERSED"
    ) {
      suppressionByTarget.set(
        target.id,
        "CORRECTED",
      );
    }
  }

  const observedByType =
    zeroCounts(ACTIVITY_TYPES);
  const eligibleByType =
    zeroCounts(ACTIVITY_TYPES);
  const suppressedByType =
    zeroCounts(ACTIVITY_TYPES);
  const lifecycleCounts =
    zeroCounts(ACTIVITY_LIFECYCLE_STATES);
  const evidenceCounts =
    zeroCounts(ACTIVITY_EVIDENCE_STATES);
  const sourceSystemCounts =
    zeroCounts(ACTIVITY_SOURCE_SYSTEMS);

  const observedDates = new Set();
  const eligibleDates = new Set();
  const prospectIds = new Set();
  const opportunityIds = new Set();
  const appointmentIds = new Set();
  const policyIds = new Set();

  let periodRecordCount = 0;
  let eligibleCandidateCount = 0;
  let eligibleActivityCount = 0;
  let suppressedByCorrectionCount = 0;
  let suppressedByReversalCount = 0;
  let firstOccurredAt = null;
  let lastOccurredAt = null;

  for (const record of snapshot) {
    if (
      record.evaluationDate <
        query.evaluationDateFrom ||
      record.evaluationDate >
        query.evaluationDateTo
    ) {
      continue;
    }

    periodRecordCount += 1;
    increment(
      observedByType,
      record.type,
    );
    increment(
      lifecycleCounts,
      record.lifecycle,
    );
    increment(
      evidenceCounts,
      record.source.evidenceState,
    );
    increment(
      sourceSystemCounts,
      record.source.system,
    );

    observedDates.add(
      record.evaluationDate,
    );
    firstOccurredAt = nullableMinimum(
      firstOccurredAt,
      record.occurredAt,
    );
    lastOccurredAt = nullableMaximum(
      lastOccurredAt,
      record.occurredAt,
    );

    if (!isActivityScoringEligible(record)) {
      continue;
    }

    eligibleCandidateCount += 1;

    const suppression =
      suppressionByTarget.get(record.id);

    if (suppression) {
      increment(
        suppressedByType,
        record.type,
      );

      if (suppression === "REVERSED") {
        suppressedByReversalCount += 1;
      } else {
        suppressedByCorrectionCount += 1;
      }

      continue;
    }

    eligibleActivityCount += 1;
    increment(
      eligibleByType,
      record.type,
    );
    eligibleDates.add(
      record.evaluationDate,
    );

    if (record.prospectId) {
      prospectIds.add(record.prospectId);
    }

    if (record.opportunityId) {
      opportunityIds.add(
        record.opportunityId,
      );
    }

    if (record.appointmentId) {
      appointmentIds.add(
        record.appointmentId,
      );
    }

    if (record.policyId) {
      policyIds.add(record.policyId);
    }
  }

  return deepFreeze({
    schemaVersion:
      ACTIVITY_PERIOD_AGGREGATION_SCHEMA_VERSION,
    organizationId:
      query.organizationId,
    advisorId:
      query.advisorId,
    period: {
      evaluationDateFrom:
        query.evaluationDateFrom,
      evaluationDateTo:
        query.evaluationDateTo,
      asOf:
        query.asOf,
    },
    sourceRecordCount:
      input.records.length,
    snapshotRecordCount:
      snapshot.length,
    futureRecordedExcludedCount,
    periodRecordCount,
    eligibleCandidateCount,
    eligibleActivityCount,
    suppressedEligibleCount:
      suppressedByCorrectionCount +
      suppressedByReversalCount,
    observedByType,
    eligibleByType,
    suppressedByType,
    lifecycleCounts,
    evidenceCounts,
    sourceSystemCounts,
    relations: {
      correctionRecordCount,
      reversalRecordCount,
      suppressedByCorrectionCount,
      suppressedByReversalCount,
      allTargetsResolved: true,
    },
    dates: {
      observed:
        sortedValues(observedDates),
      eligible:
        sortedValues(eligibleDates),
      observedDateCount:
        observedDates.size,
      eligibleDateCount:
        eligibleDates.size,
    },
    uniqueEligibleEntities: {
      prospectCount:
        prospectIds.size,
      opportunityCount:
        opportunityIds.size,
      appointmentCount:
        appointmentIds.size,
      policyCount:
        policyIds.size,
    },
    firstOccurredAt,
    lastOccurredAt,
  });
}

export function createActivityPeriodAggregationService(
  {
    repository,
    pageSize = 500,
    maxRecords = 100000,
  },
) {
  const port =
    assertActivityRepositoryPort(repository);
  const normalizedPageSize =
    positiveInteger(pageSize, "pageSize");
  const normalizedMaxRecords =
    positiveInteger(maxRecords, "maxRecords");

  if (normalizedPageSize > 500) {
    aggregationError(
      "pageSize cannot exceed 500",
    );
  }

  return deepFreeze({
    async aggregate(queryInput) {
      const query =
        createActivityPeriodQuery(queryInput);
      const records = [];
      const cursorKeys = new Set();
      let cursor = null;

      for (;;) {
        const page =
          await port.list({
            organizationId:
              query.organizationId,
            advisorId:
              query.advisorId,
            order: "asc",
            limit: normalizedPageSize,
            cursor,
          });

        if (
          page === null ||
          typeof page !== "object" ||
          !Array.isArray(page.items)
        ) {
          aggregationError(
            "repository returned an invalid page",
          );
        }

        records.push(...page.items);

        if (
          records.length >
          normalizedMaxRecords
        ) {
          aggregationError(
            "repository snapshot exceeds maxRecords",
          );
        }

        if (page.nextCursor === null) {
          break;
        }

        if (
          page.nextCursor === undefined ||
          page.nextCursor === null ||
          typeof page.nextCursor !== "object"
        ) {
          aggregationError(
            "repository returned an invalid cursor",
          );
        }

        const key =
          snapshotCursorKey(
            page.nextCursor,
          );

        if (cursorKeys.has(key)) {
          aggregationError(
            "repository repeated a cursor",
          );
        }

        cursorKeys.add(key);
        cursor = page.nextCursor;
      }

      return aggregateActivityPeriod({
        records,
        query,
      });
    },
  });
}
