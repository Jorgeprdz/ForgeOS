import {
  assertActivityRecord,
  createActivityTruthKey,
} from "../domain/activity-record.mjs";

export class ActivityPersistenceCodecError extends TypeError {
  constructor(message) {
    super(message);
    this.name = "ActivityPersistenceCodecError";
  }
}

function codecError(message) {
  throw new ActivityPersistenceCodecError(message);
}

function plainObject(value, label) {
  if (value === null || typeof value !== "object" || Array.isArray(value) || Object.getPrototypeOf(value) !== Object.prototype) {
    codecError(`${label} must be a plain object`);
  }
}

function string(value, label) {
  if (typeof value !== "string" || value.trim() === "") codecError(`${label} must be a non-empty string`);
  return value.trim();
}

function optional(value, label) {
  return value === null || value === undefined ? null : string(value, label);
}

function instant(value, label) {
  const parsed = new Date(string(value, label));
  if (Number.isNaN(parsed.getTime())) codecError(`${label} must be an ISO instant`);
  return parsed.toISOString();
}

function equal(actual, expected, label) {
  if (actual !== expected) codecError(`${label} does not match payload`);
}

export function activityRecordToPersistenceRow(input) {
  const record = assertActivityRecord(input);
  return Object.freeze({
    id: record.id,
    organization_id: record.organizationId,
    advisor_id: record.advisorId,
    manager_id: record.managerId,
    prospect_id: record.prospectId,
    opportunity_id: record.opportunityId,
    appointment_id: record.appointmentId,
    policy_id: record.policyId,
    truth_key: createActivityTruthKey(record),
    schema_version: record.schemaVersion,
    activity_type: record.type,
    lifecycle: record.lifecycle,
    source_system: record.source.system,
    evidence_state: record.source.evidenceState,
    occurred_at: record.occurredAt,
    evaluation_date: record.evaluationDate,
    revision: record.revision,
    payload: JSON.parse(JSON.stringify(record)),
    created_at: record.createdAt,
    updated_at: record.updatedAt,
  });
}

export function activityRecordFromPersistenceRow(input) {
  plainObject(input, "row");
  plainObject(input.payload, "row.payload");
  const record = assertActivityRecord(input.payload);
  equal(string(input.id, "row.id"), record.id, "row.id");
  equal(string(input.organization_id, "row.organization_id"), record.organizationId, "row.organization_id");
  equal(string(input.advisor_id, "row.advisor_id"), record.advisorId, "row.advisor_id");
  equal(optional(input.manager_id, "row.manager_id"), record.managerId, "row.manager_id");
  equal(optional(input.prospect_id, "row.prospect_id"), record.prospectId, "row.prospect_id");
  equal(optional(input.opportunity_id, "row.opportunity_id"), record.opportunityId, "row.opportunity_id");
  equal(optional(input.appointment_id, "row.appointment_id"), record.appointmentId, "row.appointment_id");
  equal(optional(input.policy_id, "row.policy_id"), record.policyId, "row.policy_id");
  equal(string(input.truth_key, "row.truth_key"), createActivityTruthKey(record), "row.truth_key");
  equal(string(input.schema_version, "row.schema_version"), record.schemaVersion, "row.schema_version");
  equal(string(input.activity_type, "row.activity_type"), record.type, "row.activity_type");
  equal(string(input.lifecycle, "row.lifecycle"), record.lifecycle, "row.lifecycle");
  equal(string(input.source_system, "row.source_system"), record.source.system, "row.source_system");
  equal(string(input.evidence_state, "row.evidence_state"), record.source.evidenceState, "row.evidence_state");
  equal(instant(input.occurred_at, "row.occurred_at"), record.occurredAt, "row.occurred_at");
  equal(string(input.evaluation_date, "row.evaluation_date"), record.evaluationDate, "row.evaluation_date");
  if (!Number.isSafeInteger(input.revision) || input.revision !== record.revision) codecError("row.revision does not match payload");
  equal(instant(input.created_at, "row.created_at"), record.createdAt, "row.created_at");
  equal(instant(input.updated_at, "row.updated_at"), record.updatedAt, "row.updated_at");
  return record;
}

export function activityPageFromPersistenceRows(rows, query) {
  if (!Array.isArray(rows)) codecError("rows must be an array");
  const decoded = rows.map(activityRecordFromPersistenceRow);
  const hasMore = decoded.length > query.limit;
  const items = hasMore ? decoded.slice(0, query.limit) : decoded;
  const last = items.at(-1);
  return Object.freeze({
    items: Object.freeze(items),
    nextCursor: hasMore && last ? Object.freeze({ occurredAt: last.occurredAt, id: last.id }) : null,
  });
}
