import {
  ACTIVITY_EVIDENCE_STATES,
  ACTIVITY_LIFECYCLE_STATES,
  ACTIVITY_SOURCE_SYSTEMS,
  ACTIVITY_TYPES,
} from "../domain/activity-record.mjs";

const QUERY_KEYS = new Set([
  "organizationId",
  "advisorId",
  "types",
  "lifecycles",
  "sourceSystems",
  "evidenceStates",
  "prospectId",
  "opportunityId",
  "appointmentId",
  "policyId",
  "evaluationDateFrom",
  "evaluationDateTo",
  "occurredAtFrom",
  "occurredAtTo",
  "order",
  "limit",
  "cursor",
]);

const CURSOR_KEYS = new Set([
  "occurredAt",
  "id",
]);

export class ActivityRepositoryConflictError
  extends Error {
  constructor(message) {
    super(message);
    this.name =
      "ActivityRepositoryConflictError";
  }
}

export class ActivityRepositoryReferenceError
  extends Error {
  constructor(message) {
    super(message);
    this.name =
      "ActivityRepositoryReferenceError";
  }
}

export class ActivityRepositoryQueryError
  extends TypeError {
  constructor(message) {
    super(message);
    this.name =
      "ActivityRepositoryQueryError";
  }
}

function queryError(message) {
  throw new ActivityRepositoryQueryError(
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
    queryError(
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
      queryError(
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
    queryError(
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

function calendarDate(value, label) {
  if (
    value === undefined ||
    value === null
  ) {
    return null;
  }

  const input = requiredString(
    value,
    label,
  );

  if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    queryError(
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
    queryError(
      `${label} is not a real date`,
    );
  }

  return input;
}

function instant(value, label) {
  if (
    value === undefined ||
    value === null
  ) {
    return null;
  }

  const parsed = new Date(
    requiredString(value, label),
  );

  if (Number.isNaN(parsed.getTime())) {
    queryError(
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
    queryError(
      `${label} must be a non-empty array`,
    );
  }

  const normalized = [];

  for (const item of value) {
    if (!allowed.includes(item)) {
      queryError(
        `${label} contains unsupported value`,
      );
    }

    if (!normalized.includes(item)) {
      normalized.push(item);
    }
  }

  return Object.freeze(normalized);
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

  return Object.freeze({
    occurredAt: instant(
      value.occurredAt,
      "cursor.occurredAt",
    ),
    id: requiredString(
      value.id,
      "cursor.id",
    ),
  });
}

function normalizeLimit(value) {
  if (value === undefined) {
    return 100;
  }

  if (
    !Number.isSafeInteger(value) ||
    value < 1 ||
    value > 500
  ) {
    queryError(
      "limit must be an integer from 1 to 500",
    );
  }

  return value;
}

export function createActivityRepositoryQuery(
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
  const occurredAtFrom = instant(
    input.occurredAtFrom,
    "occurredAtFrom",
  );
  const occurredAtTo = instant(
    input.occurredAtTo,
    "occurredAtTo",
  );

  if (
    evaluationDateFrom &&
    evaluationDateTo &&
    evaluationDateFrom >
      evaluationDateTo
  ) {
    queryError(
      "evaluation date range is reversed",
    );
  }

  if (
    occurredAtFrom &&
    occurredAtTo &&
    occurredAtFrom > occurredAtTo
  ) {
    queryError(
      "occurrence range is reversed",
    );
  }

  const order = input.order ?? "desc";

  if (
    order !== "asc" &&
    order !== "desc"
  ) {
    queryError(
      "order must be asc or desc",
    );
  }

  return Object.freeze({
    organizationId: requiredString(
      input.organizationId,
      "organizationId",
    ),
    advisorId: optionalString(
      input.advisorId,
      "advisorId",
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
    sourceSystems: enumList(
      input.sourceSystems,
      ACTIVITY_SOURCE_SYSTEMS,
      "sourceSystems",
    ),
    evidenceStates: enumList(
      input.evidenceStates,
      ACTIVITY_EVIDENCE_STATES,
      "evidenceStates",
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
    evaluationDateFrom,
    evaluationDateTo,
    occurredAtFrom,
    occurredAtTo,
    order,
    limit: normalizeLimit(
      input.limit,
    ),
    cursor: normalizeCursor(
      input.cursor,
    ),
  });
}

export function createActivityIdentityQuery(
  input,
) {
  assertPlainObject(input, "identity query");
  assertExactKeys(
    input,
    new Set([
      "organizationId",
      "id",
    ]),
    "identity query",
  );

  return Object.freeze({
    organizationId: requiredString(
      input.organizationId,
      "organizationId",
    ),
    id: requiredString(
      input.id,
      "id",
    ),
  });
}

export function createActivityTruthQuery(
  input,
) {
  assertPlainObject(input, "truth query");
  assertExactKeys(
    input,
    new Set([
      "organizationId",
      "truthKey",
    ]),
    "truth query",
  );

  return Object.freeze({
    organizationId: requiredString(
      input.organizationId,
      "organizationId",
    ),
    truthKey: requiredString(
      input.truthKey,
      "truthKey",
    ),
  });
}

export function assertActivityRepositoryPort(
  value,
) {
  if (
    value === null ||
    typeof value !== "object"
  ) {
    queryError(
      "repository must be an object",
    );
  }

  for (const method of [
    "append",
    "getById",
    "getByTruthKey",
    "list",
    "size",
  ]) {
    if (typeof value[method] !== "function") {
      queryError(
        `repository must implement ${method}`,
      );
    }
  }

  return value;
}
