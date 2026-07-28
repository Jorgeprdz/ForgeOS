import { createHash } from "node:crypto";

export const ACTIVITY_RECORD_SCHEMA_VERSION =
  "activity-record.v1";

export const ACTIVITY_TYPES = Object.freeze([
  "REFERRAL_ACQUIRED",
  "CONTACT_ATTEMPTED",
  "CONVERSATION_COMPLETED",
  "INITIAL_APPOINTMENT_SCHEDULED",
  "INITIAL_APPOINTMENT_COMPLETED",
  "CLOSING_APPOINTMENT_SCHEDULED",
  "CLOSING_APPOINTMENT_COMPLETED",
  "APPLICATION_SUBMITTED",
  "POLICY_PAID",
  "FOLLOW_UP_COMPLETED",
]);

export const ACTIVITY_LIFECYCLE_STATES =
  Object.freeze([
    "PENDING_CONFIRMATION",
    "CONFIRMED",
    "CORRECTED",
    "REVERSED",
  ]);

export const ACTIVITY_SOURCE_SYSTEMS =
  Object.freeze([
    "MANUAL",
    "PIPELINE",
    "CALENDAR",
    "IMPORT",
    "FES_RECONCILIATION",
  ]);

export const ACTIVITY_EVIDENCE_STATES =
  Object.freeze([
    "VERIFIED",
    "UNVERIFIED",
    "CONFLICTED",
    "UNKNOWN",
  ]);

export const ACTIVITY_CONFIRMATION_METHODS =
  Object.freeze([
    "MANUAL_ADVISOR",
    "PIPELINE_STATE",
    "CALENDAR_COMPLETION",
    "SYSTEM_RECONCILIATION",
  ]);

const TOP_LEVEL_KEYS = new Set([
  "schemaVersion",
  "id",
  "organizationId",
  "advisorId",
  "managerId",
  "prospectId",
  "opportunityId",
  "appointmentId",
  "policyId",
  "type",
  "subtype",
  "lifecycle",
  "source",
  "occurredAt",
  "evaluationDate",
  "timeZone",
  "confirmation",
  "correction",
  "reversal",
  "metadata",
  "revision",
  "createdAt",
  "updatedAt",
]);

const SOURCE_KEYS = new Set([
  "system",
  "eventId",
  "recordedAt",
  "producerVersion",
  "evidenceState",
]);

const CONFIRMATION_KEYS = new Set([
  "method",
  "confirmedAt",
  "confirmedBy",
]);

const RELATION_KEYS = new Set([
  "activityId",
  "reason",
]);

const PROHIBITED_SCORING_KEYS = new Set([
  "point",
  "points",
  "pointvalue",
  "score",
  "scorevalue",
  "weight",
  "multiplier",
]);

function activityError(message) {
  throw new TypeError(
    `ActivityRecord: ${message}`,
  );
}

function assertPlainObject(value, label) {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Object.prototype
  ) {
    activityError(
      `${label} must be a plain object`,
    );
  }
}

function assertExactKeys(value, allowed, label) {
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) {
      activityError(
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
    activityError(
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

function enumValue(value, allowed, label) {
  if (!allowed.includes(value)) {
    activityError(
      `${label} is not supported`,
    );
  }

  return value;
}

function canonicalInstant(value, label) {
  const parsed = new Date(
    requiredString(value, label),
  );

  if (Number.isNaN(parsed.getTime())) {
    activityError(
      `${label} must be an ISO instant`,
    );
  }

  return parsed.toISOString();
}

function calendarDate(value, label) {
  const input = requiredString(
    value,
    label,
  );

  if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    activityError(
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
    activityError(
      `${label} is not a real calendar date`,
    );
  }

  return input;
}

function normalizeTimeZone(value) {
  const input = requiredString(
    value,
    "timeZone",
  );

  try {
    new Intl.DateTimeFormat(
      "en",
      { timeZone: input },
    ).format();
  } catch {
    activityError(
      "timeZone must be a valid IANA zone",
    );
  }

  return input;
}

function positiveInteger(value, label) {
  if (
    !Number.isSafeInteger(value) ||
    value < 1
  ) {
    activityError(
      `${label} must be a positive integer`,
    );
  }

  return value;
}

function assertNoScoringKeys(
  value,
  path = "metadata",
) {
  if (
    value === null ||
    typeof value !== "object"
  ) {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach(
      (item, index) => {
        assertNoScoringKeys(
          item,
          `${path}[${index}]`,
        );
      },
    );
    return;
  }

  for (const [key, nested] of Object.entries(value)) {
    if (
      PROHIBITED_SCORING_KEYS.has(
        key.toLowerCase(),
      )
    ) {
      activityError(
        `${path}.${key} embeds scoring authority`,
      );
    }

    assertNoScoringKeys(
      nested,
      `${path}.${key}`,
    );
  }
}

function cloneJson(
  value,
  path = "metadata",
  seen = new WeakSet(),
) {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (typeof value !== "object") {
    activityError(
      `${path} must be JSON-compatible`,
    );
  }

  if (seen.has(value)) {
    activityError(
      `${path} cannot contain cycles`,
    );
  }

  seen.add(value);

  if (Array.isArray(value)) {
    const result = value.map(
      (item, index) => cloneJson(
        item,
        `${path}[${index}]`,
        seen,
      ),
    );

    seen.delete(value);
    return result;
  }

  if (
    Object.getPrototypeOf(value) !==
    Object.prototype
  ) {
    activityError(
      `${path} must contain plain objects`,
    );
  }

  const result = {};

  for (const [key, nested] of Object.entries(value)) {
    result[key] = cloneJson(
      nested,
      `${path}.${key}`,
      seen,
    );
  }

  seen.delete(value);
  return result;
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

function normalizeSource(value) {
  assertPlainObject(value, "source");
  assertExactKeys(
    value,
    SOURCE_KEYS,
    "source",
  );

  return {
    system: enumValue(
      value.system,
      ACTIVITY_SOURCE_SYSTEMS,
      "source.system",
    ),
    eventId: requiredString(
      value.eventId,
      "source.eventId",
    ),
    recordedAt: canonicalInstant(
      value.recordedAt,
      "source.recordedAt",
    ),
    producerVersion: requiredString(
      value.producerVersion,
      "source.producerVersion",
    ),
    evidenceState: enumValue(
      value.evidenceState,
      ACTIVITY_EVIDENCE_STATES,
      "source.evidenceState",
    ),
  };
}

function normalizeConfirmation(
  value,
  lifecycle,
) {
  if (lifecycle === "PENDING_CONFIRMATION") {
    if (
      value !== undefined &&
      value !== null
    ) {
      activityError(
        "pending activity cannot be confirmed",
      );
    }

    return null;
  }

  assertPlainObject(value, "confirmation");
  assertExactKeys(
    value,
    CONFIRMATION_KEYS,
    "confirmation",
  );

  return {
    method: enumValue(
      value.method,
      ACTIVITY_CONFIRMATION_METHODS,
      "confirmation.method",
    ),
    confirmedAt: canonicalInstant(
      value.confirmedAt,
      "confirmation.confirmedAt",
    ),
    confirmedBy: requiredString(
      value.confirmedBy,
      "confirmation.confirmedBy",
    ),
  };
}

function normalizeRelation(
  value,
  label,
  required,
) {
  if (!required) {
    if (
      value !== undefined &&
      value !== null
    ) {
      activityError(
        `${label} is only valid for its lifecycle`,
      );
    }

    return null;
  }

  assertPlainObject(value, label);
  assertExactKeys(
    value,
    RELATION_KEYS,
    label,
  );

  return {
    activityId: requiredString(
      value.activityId,
      `${label}.activityId`,
    ),
    reason: requiredString(
      value.reason,
      `${label}.reason`,
    ),
  };
}

function normalizeRecord(input) {
  assertPlainObject(input, "record");
  assertExactKeys(
    input,
    TOP_LEVEL_KEYS,
    "record",
  );

  const schemaVersion =
    input.schemaVersion ??
    ACTIVITY_RECORD_SCHEMA_VERSION;

  if (
    schemaVersion !==
    ACTIVITY_RECORD_SCHEMA_VERSION
  ) {
    activityError(
      "schemaVersion is not supported",
    );
  }

  const lifecycle = enumValue(
    input.lifecycle,
    ACTIVITY_LIFECYCLE_STATES,
    "lifecycle",
  );

  const metadataInput =
    input.metadata ?? {};

  assertPlainObject(
    metadataInput,
    "metadata",
  );
  assertNoScoringKeys(
    metadataInput,
  );

  const record = {
    schemaVersion,
    id: requiredString(input.id, "id"),
    organizationId: requiredString(
      input.organizationId,
      "organizationId",
    ),
    advisorId: requiredString(
      input.advisorId,
      "advisorId",
    ),
    managerId: optionalString(
      input.managerId,
      "managerId",
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
    type: enumValue(
      input.type,
      ACTIVITY_TYPES,
      "type",
    ),
    subtype: optionalString(
      input.subtype,
      "subtype",
    ),
    lifecycle,
    source: normalizeSource(
      input.source,
    ),
    occurredAt: canonicalInstant(
      input.occurredAt,
      "occurredAt",
    ),
    evaluationDate: calendarDate(
      input.evaluationDate,
      "evaluationDate",
    ),
    timeZone: normalizeTimeZone(
      input.timeZone,
    ),
    confirmation:
      normalizeConfirmation(
        input.confirmation,
        lifecycle,
      ),
    correction:
      normalizeRelation(
        input.correction,
        "correction",
        lifecycle === "CORRECTED",
      ),
    reversal:
      normalizeRelation(
        input.reversal,
        "reversal",
        lifecycle === "REVERSED",
      ),
    metadata: cloneJson(
      metadataInput,
    ),
    revision: positiveInteger(
      input.revision ?? 1,
      "revision",
    ),
    createdAt: canonicalInstant(
      input.createdAt,
      "createdAt",
    ),
    updatedAt: canonicalInstant(
      input.updatedAt,
      "updatedAt",
    ),
  };

  if (
    record.correction?.activityId ===
      record.id ||
    record.reversal?.activityId ===
      record.id
  ) {
    activityError(
      "relation cannot reference the same activity",
    );
  }

  if (
    new Date(record.updatedAt) <
    new Date(record.createdAt)
  ) {
    activityError(
      "updatedAt cannot precede createdAt",
    );
  }

  return deepFreeze(record);
}

export function createActivityRecord(input) {
  return normalizeRecord(input);
}

export function assertActivityRecord(value) {
  return normalizeRecord(value);
}

export function isActivityRecord(value) {
  try {
    normalizeRecord(value);
    return true;
  } catch {
    return false;
  }
}

export function createActivityTruthKey(record) {
  const value = assertActivityRecord(record);

  const canonical = [
    value.schemaVersion,
    value.organizationId,
    value.advisorId,
    value.source.system,
    value.source.eventId,
    value.type,
    value.occurredAt,
  ].join("\u001f");

  return (
    "activity:" +
    createHash("sha256")
      .update(canonical)
      .digest("hex")
  );
}

export function isActivityScoringEligible(record) {
  const value = assertActivityRecord(record);

  return (
    value.lifecycle === "CONFIRMED" &&
    value.source.evidenceState ===
      "VERIFIED" &&
    value.confirmation !== null
  );
}
