import {
  ACTIVITY_EVIDENCE_STATES,
  ACTIVITY_LIFECYCLE_STATES,
  ACTIVITY_SOURCE_SYSTEMS,
  ACTIVITY_TYPES,
  assertActivityRecord,
} from "../domain/activity-record.mjs";

import {
  assertActivityRepositoryPort,
} from "./activity-repository-port.mjs";

export const ACTIVITY_FEED_SCHEMA_VERSION =
  "activity-feed.v1";

export const ACTIVITY_FEED_ITEM_SCHEMA_VERSION =
  "activity-feed-item.v1";

const QUERY_KEYS = new Set([
  "organizationId",
  "advisorId",
  "asOf",
  "types",
  "lifecycles",
  "evidenceStates",
  "sourceSystems",
  "prospectId",
  "opportunityId",
  "appointmentId",
  "policyId",
  "limit",
  "cursor",
]);

const INPUT_KEYS = new Set([
  "records",
  "query",
]);

const CURSOR_KEYS = new Set([
  "occurredAt",
  "id",
]);

const ITEM_KINDS = Object.freeze([
  "ACTIVITY",
  "CORRECTION",
  "REVERSAL",
]);

const EFFECTIVE_STATES = Object.freeze([
  "ACTIVE",
  "PENDING",
  "CORRECTED",
  "REVERSED",
  "CONTROL",
]);

export class ActivityFeedProjectionError
  extends TypeError {
  constructor(message) {
    super(`ActivityFeedProjection: ${message}`);
    this.name = "ActivityFeedProjectionError";
  }
}

function feedError(message) {
  throw new ActivityFeedProjectionError(
    message,
  );
}

function assertPlainObject(value, label) {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.getPrototypeOf(value) !==
      Object.prototype
  ) {
    feedError(
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
      feedError(
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
    feedError(
      `${label} must be a non-empty string`,
    );
  }

  return value.trim();
}

function optionalString(value, label) {
  if (
    value === undefined ||
    value === null
  ) {
    return null;
  }

  return requiredString(value, label);
}

function canonicalInstant(value, label) {
  const parsed = new Date(
    requiredString(value, label),
  );

  if (Number.isNaN(parsed.getTime())) {
    feedError(
      `${label} must be an ISO instant`,
    );
  }

  return parsed.toISOString();
}

function enumList(
  value,
  allowed,
  label,
) {
  if (
    value === undefined ||
    value === null
  ) {
    return null;
  }

  if (
    !Array.isArray(value) ||
    value.length === 0
  ) {
    feedError(
      `${label} must be a non-empty array`,
    );
  }

  const normalized = [];

  for (const item of value) {
    if (!allowed.includes(item)) {
      feedError(
        `${label} contains unsupported value`,
      );
    }

    if (!normalized.includes(item)) {
      normalized.push(item);
    }
  }

  return Object.freeze(normalized);
}

function positiveInteger(value, label) {
  if (
    !Number.isSafeInteger(value) ||
    value < 1
  ) {
    feedError(
      `${label} must be a positive integer`,
    );
  }

  return value;
}

function normalizeLimit(value) {
  if (value === undefined) {
    return 50;
  }

  const normalized =
    positiveInteger(value, "limit");

  if (normalized > 200) {
    feedError(
      "limit cannot exceed 200",
    );
  }

  return normalized;
}

function normalizeCursor(value) {
  if (
    value === undefined ||
    value === null
  ) {
    return null;
  }

  assertPlainObject(value, "cursor");
  assertExactKeys(
    value,
    CURSOR_KEYS,
    "cursor",
  );

  return deepFreeze({
    occurredAt: canonicalInstant(
      value.occurredAt,
      "cursor.occurredAt",
    ),
    id: requiredString(
      value.id,
      "cursor.id",
    ),
  });
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

function compareFeedOrder(left, right) {
  const instant =
    right.occurredAt.localeCompare(
      left.occurredAt,
    );

  if (instant !== 0) {
    return instant;
  }

  return right.id.localeCompare(left.id);
}

function afterCursor(record, cursor) {
  if (!cursor) {
    return true;
  }

  return (
    compareFeedOrder(
      record,
      cursor,
    ) > 0
  );
}

function relationTarget(record) {
  return (
    record.correction ??
    record.reversal ??
    null
  );
}

function itemKind(record) {
  if (record.lifecycle === "CORRECTED") {
    return "CORRECTION";
  }

  if (record.lifecycle === "REVERSED") {
    return "REVERSAL";
  }

  return "ACTIVITY";
}

function effectiveState(
  record,
  controls,
) {
  if (itemKind(record) !== "ACTIVITY") {
    return "CONTROL";
  }

  if (controls.reversedBy.length > 0) {
    return "REVERSED";
  }

  if (controls.correctedBy.length > 0) {
    return "CORRECTED";
  }

  if (
    record.lifecycle ===
    "PENDING_CONFIRMATION"
  ) {
    return "PENDING";
  }

  return "ACTIVE";
}

function includesOrAll(values, candidate) {
  return (
    values === null ||
    values.includes(candidate)
  );
}

function matchesFeedQuery(record, query) {
  return (
    includesOrAll(
      query.types,
      record.type,
    ) &&
    includesOrAll(
      query.lifecycles,
      record.lifecycle,
    ) &&
    includesOrAll(
      query.evidenceStates,
      record.source.evidenceState,
    ) &&
    includesOrAll(
      query.sourceSystems,
      record.source.system,
    ) &&
    (
      query.prospectId === null ||
      record.prospectId ===
        query.prospectId
    ) &&
    (
      query.opportunityId === null ||
      record.opportunityId ===
        query.opportunityId
    ) &&
    (
      query.appointmentId === null ||
      record.appointmentId ===
        query.appointmentId
    ) &&
    (
      query.policyId === null ||
      record.policyId ===
        query.policyId
    )
  );
}

function controlIndex(snapshot, byId) {
  const index = new Map();

  for (const record of snapshot) {
    index.set(record.id, {
      correctedBy: [],
      reversedBy: [],
    });
  }

  for (const record of snapshot) {
    const relation = relationTarget(record);

    if (!relation) {
      continue;
    }

    const target =
      byId.get(relation.activityId);

    if (!target) {
      feedError(
        `relation target ${relation.activityId} is missing from the as-of snapshot`,
      );
    }

    if (
      target.source.recordedAt >
      record.source.recordedAt
    ) {
      feedError(
        `relation ${record.id} precedes its target`,
      );
    }

    const targetControls =
      index.get(target.id);

    if (record.lifecycle === "REVERSED") {
      targetControls.reversedBy.push(record);
    } else {
      targetControls.correctedBy.push(record);
    }
  }

  for (const controls of index.values()) {
    controls.correctedBy.sort(
      compareFeedOrder,
    );
    controls.reversedBy.sort(
      compareFeedOrder,
    );
  }

  return index;
}

function feedItem(record, controls) {
  const relation = relationTarget(record);
  const kind = itemKind(record);
  const state =
    effectiveState(record, controls);

  if (!ITEM_KINDS.includes(kind)) {
    feedError("unsupported item kind");
  }

  if (!EFFECTIVE_STATES.includes(state)) {
    feedError("unsupported effective state");
  }

  return deepFreeze({
    schemaVersion:
      ACTIVITY_FEED_ITEM_SCHEMA_VERSION,
    id: record.id,
    itemKind: kind,
    effectiveState: state,
    activityType: record.type,
    subtype: record.subtype,
    lifecycle: record.lifecycle,
    evidenceState:
      record.source.evidenceState,
    sourceSystem:
      record.source.system,
    sourceEventId:
      record.source.eventId,
    occurredAt:
      record.occurredAt,
    recordedAt:
      record.source.recordedAt,
    evaluationDate:
      record.evaluationDate,
    timeZone:
      record.timeZone,
    organizationId:
      record.organizationId,
    advisorId:
      record.advisorId,
    managerId:
      record.managerId,
    references: {
      prospectId:
        record.prospectId,
      opportunityId:
        record.opportunityId,
      appointmentId:
        record.appointmentId,
      policyId:
        record.policyId,
    },
    confirmation:
      record.confirmation === null
        ? null
        : {
          method:
            record.confirmation.method,
          confirmedAt:
            record.confirmation.confirmedAt,
          confirmedBy:
            record.confirmation.confirmedBy,
        },
    control: {
      targetActivityId:
        relation?.activityId ?? null,
      correctedByActivityIds:
        controls.correctedBy.map(
          (item) => item.id,
        ),
      reversedByActivityIds:
        controls.reversedBy.map(
          (item) => item.id,
        ),
    },
    metadataPresent:
      Object.keys(record.metadata).length > 0,
  });
}

function repositoryCursorKey(cursor) {
  return [
    cursor.occurredAt,
    cursor.id,
  ].join("\u001f");
}

export function createActivityFeedQuery(
  input,
) {
  assertPlainObject(input, "query");
  assertExactKeys(
    input,
    QUERY_KEYS,
    "query",
  );

  return deepFreeze({
    organizationId: requiredString(
      input.organizationId,
      "organizationId",
    ),
    advisorId: requiredString(
      input.advisorId,
      "advisorId",
    ),
    asOf: canonicalInstant(
      input.asOf,
      "asOf",
    ),
    types: enumList(
      input.types,
      ACTIVITY_TYPES,
      "types",
    ),
    lifecycles: enumList(
      input.lifecycles,
      ACTIVITY_LIFECYCLE_STATES,
      "lifecycles",
    ),
    evidenceStates: enumList(
      input.evidenceStates,
      ACTIVITY_EVIDENCE_STATES,
      "evidenceStates",
    ),
    sourceSystems: enumList(
      input.sourceSystems,
      ACTIVITY_SOURCE_SYSTEMS,
      "sourceSystems",
    ),
    prospectId: optionalString(
      input.prospectId,
      "prospectId",
    ),
    opportunityId: optionalString(
      input.opportunityId,
      "opportunityId",
    ),
    appointmentId: optionalString(
      input.appointmentId,
      "appointmentId",
    ),
    policyId: optionalString(
      input.policyId,
      "policyId",
    ),
    limit: normalizeLimit(input.limit),
    cursor: normalizeCursor(
      input.cursor,
    ),
  });
}

export function projectActivityFeed(
  input,
) {
  assertPlainObject(input, "input");
  assertExactKeys(
    input,
    INPUT_KEYS,
    "input",
  );

  if (!Array.isArray(input.records)) {
    feedError(
      "records must be an array",
    );
  }

  const query =
    createActivityFeedQuery(input.query);
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
      feedError(
        `record ${record.id} belongs to another organization`,
      );
    }

    if (
      record.advisorId !==
      query.advisorId
    ) {
      feedError(
        `record ${record.id} belongs to another advisor`,
      );
    }

    if (byId.has(record.id)) {
      feedError(
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

  const controls =
    controlIndex(snapshot, byId);

  const matching = snapshot
    .filter(
      (record) =>
        matchesFeedQuery(record, query),
    )
    .sort(compareFeedOrder);

  const after = matching.filter(
    (record) =>
      afterCursor(record, query.cursor),
  );

  const pageRecords =
    after.slice(0, query.limit);
  const items = pageRecords.map(
    (record) =>
      feedItem(
        record,
        controls.get(record.id),
      ),
  );

  const hasMore =
    after.length > pageRecords.length;
  const last =
    pageRecords.at(-1) ?? null;

  const correctedTargetCount = [
    ...controls.values(),
  ].filter(
    (value) =>
      value.correctedBy.length > 0,
  ).length;

  const reversedTargetCount = [
    ...controls.values(),
  ].filter(
    (value) =>
      value.reversedBy.length > 0,
  ).length;

  return deepFreeze({
    schemaVersion:
      ACTIVITY_FEED_SCHEMA_VERSION,
    organizationId:
      query.organizationId,
    advisorId:
      query.advisorId,
    asOf:
      query.asOf,
    filters: {
      types: query.types,
      lifecycles:
        query.lifecycles,
      evidenceStates:
        query.evidenceStates,
      sourceSystems:
        query.sourceSystems,
      prospectId:
        query.prospectId,
      opportunityId:
        query.opportunityId,
      appointmentId:
        query.appointmentId,
      policyId:
        query.policyId,
    },
    snapshotRecordCount:
      snapshot.length,
    futureRecordedExcludedCount,
    matchingRecordCount:
      matching.length,
    returnedCount:
      items.length,
    controlSummary: {
      correctedTargetCount,
      reversedTargetCount,
    },
    items,
    hasMore,
    nextCursor:
      hasMore && last
        ? {
          occurredAt:
            last.occurredAt,
          id:
            last.id,
        }
        : null,
  });
}

export function createActivityFeedProjectionService(
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
    feedError(
      "pageSize cannot exceed 500",
    );
  }

  return deepFreeze({
    async project(queryInput) {
      const query =
        createActivityFeedQuery(queryInput);
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
          feedError(
            "repository returned an invalid page",
          );
        }

        records.push(...page.items);

        if (
          records.length >
          normalizedMaxRecords
        ) {
          feedError(
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
          feedError(
            "repository returned an invalid cursor",
          );
        }

        const key =
          repositoryCursorKey(
            page.nextCursor,
          );

        if (cursorKeys.has(key)) {
          feedError(
            "repository repeated a cursor",
          );
        }

        cursorKeys.add(key);
        cursor = page.nextCursor;
      }

      return projectActivityFeed({
        records,
        query,
      });
    },
  });
}
