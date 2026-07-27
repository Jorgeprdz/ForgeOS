import { createHash } from "node:crypto";

import {
  createActivityRecord,
  createActivityTruthKey,
} from "../domain/activity-record.mjs";

import {
  assertActivityRepositoryPort,
} from "./activity-repository-port.mjs";

export const PIPELINE_TRANSITION_SCHEMA_VERSION =
  "pipeline-transition.v1";

export const PIPELINE_ACTIVITY_PROJECTION_VERSION =
  "pipeline-activity-projection.v1";

export const PIPELINE_STAGE_CODES = Object.freeze([
  "NEW",
  "CONTACTED",
  "APPOINTMENT_SCHEDULED",
  "DISCOVERY_COMPLETED",
  "QUOTE_PREPARED",
  "PRESENTATION_COMPLETED",
  "FOLLOW_UP",
  "CLOSING_APPOINTMENT",
  "APPLICATION",
  "ISSUED",
  "POSTPONED",
  "CLOSED_WON",
  "CLOSED_LOST",
]);

const EVENT_KEYS = new Set([
  "schemaVersion",
  "eventId",
  "organizationId",
  "advisorId",
  "managerId",
  "actorId",
  "prospectId",
  "opportunityId",
  "appointmentId",
  "policyId",
  "fromStage",
  "toStage",
  "evidence",
  "occurredAt",
  "recordedAt",
  "timeZone",
  "metadata",
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

const PROJECTION_RULES = Object.freeze({
  CONTACTED: Object.freeze({
    fromStages: Object.freeze(["NEW"]),
    requiredEvidence: Object.freeze([
      "CONTACT_EVENT",
    ]),
    activityType: "CONTACT_ATTEMPTED",
    subtype: "PIPELINE_CONTACT_EVENT",
    appointmentRequired: false,
  }),
  APPOINTMENT_SCHEDULED: Object.freeze({
    fromStages: Object.freeze(["CONTACTED"]),
    requiredEvidence: Object.freeze([
      "APPOINTMENT_CONFIRMED",
    ]),
    activityType:
      "INITIAL_APPOINTMENT_SCHEDULED",
    subtype:
      "PIPELINE_INITIAL_APPOINTMENT_CONFIRMED",
    appointmentRequired: true,
  }),
  DISCOVERY_COMPLETED: Object.freeze({
    fromStages: Object.freeze([
      "APPOINTMENT_SCHEDULED",
    ]),
    requiredEvidence: Object.freeze([
      "APPOINTMENT_DOCUMENTED",
    ]),
    activityType:
      "INITIAL_APPOINTMENT_COMPLETED",
    subtype:
      "PIPELINE_DISCOVERY_APPOINTMENT_DOCUMENTED",
    appointmentRequired: true,
  }),
  CLOSING_APPOINTMENT: Object.freeze({
    fromStages: Object.freeze([
      "PRESENTATION_COMPLETED",
      "FOLLOW_UP",
    ]),
    requiredEvidence: Object.freeze([
      "CLOSING_APPOINTMENT_CONFIRMED",
    ]),
    activityType:
      "CLOSING_APPOINTMENT_SCHEDULED",
    subtype:
      "PIPELINE_CLOSING_APPOINTMENT_CONFIRMED",
    appointmentRequired: true,
  }),
  APPLICATION: Object.freeze({
    fromStages: Object.freeze([
      "PRESENTATION_COMPLETED",
      "FOLLOW_UP",
      "CLOSING_APPOINTMENT",
    ]),
    requiredEvidence: Object.freeze([
      "APPLICATION_REFERENCE",
    ]),
    activityType: "APPLICATION_SUBMITTED",
    subtype: "PIPELINE_APPLICATION_REFERENCE",
    appointmentRequired: false,
  }),
});

export class PipelineActivityProjectionError
  extends TypeError {
  constructor(message, details = {}) {
    super(message);
    this.name =
      "PipelineActivityProjectionError";
    this.code =
      "INVALID_PIPELINE_ACTIVITY_PROJECTION";
    this.details = Object.freeze({
      ...details,
    });
  }
}

function projectionError(message, details) {
  throw new PipelineActivityProjectionError(
    message,
    details,
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
    projectionError(
      `${label} must be a plain object`,
      { label },
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
      projectionError(
        `${label} contains unknown field ${key}`,
        { label, key },
      );
    }
  }
}

function requiredString(value, label) {
  if (
    typeof value !== "string" ||
    value.trim() === ""
  ) {
    projectionError(
      `${label} must be a non-empty string`,
      { label },
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
    projectionError(
      `${label} must be an ISO instant`,
      { label },
    );
  }

  return parsed.toISOString();
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
    projectionError(
      "timeZone must be a valid IANA zone",
      { timeZone: input },
    );
  }

  return input;
}

function stageCode(value, label) {
  const input = requiredString(
    value,
    label,
  );

  if (!PIPELINE_STAGE_CODES.includes(input)) {
    projectionError(
      `${label} is not a canonical sales stage`,
      { label, stage: input },
    );
  }

  return input;
}

function normalizeEvidence(value) {
  if (
    !Array.isArray(value) ||
    value.length === 0
  ) {
    projectionError(
      "evidence must be a non-empty array",
    );
  }

  const normalized = [];

  for (const item of value) {
    const token = requiredString(
      item,
      "evidence item",
    );

    if (
      !/^[A-Z][A-Z0-9_]*$/u.test(token)
    ) {
      projectionError(
        "evidence item must be an uppercase token",
        { evidence: token },
      );
    }

    if (!normalized.includes(token)) {
      normalized.push(token);
    }
  }

  return Object.freeze(normalized);
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

  for (const [key, nested] of
    Object.entries(value)) {
    if (
      PROHIBITED_SCORING_KEYS.has(
        key.toLowerCase(),
      )
    ) {
      projectionError(
        `${path}.${key} embeds scoring authority`,
        { path, key },
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
    projectionError(
      `${path} must be JSON-compatible`,
      { path },
    );
  }

  if (seen.has(value)) {
    projectionError(
      `${path} cannot contain cycles`,
      { path },
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
    projectionError(
      `${path} must contain plain objects`,
      { path },
    );
  }

  const result = {};

  for (const [key, nested] of
    Object.entries(value)) {
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

function localEvaluationDate(
  instant,
  timeZone,
) {
  const parts =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      },
    ).formatToParts(new Date(instant));

  const values = Object.fromEntries(
    parts
      .filter(({ type }) =>
        ["year", "month", "day"].includes(type))
      .map(({ type, value }) => [
        type,
        value,
      ]),
  );

  return (
    `${values.year}-` +
    `${values.month}-` +
    `${values.day}`
  );
}

function createDeterministicActivityId(
  transition,
) {
  const canonical = [
    transition.schemaVersion,
    transition.organizationId,
    transition.advisorId,
    transition.eventId,
  ].join("\u001f");

  return (
    "activity:pipeline:" +
    createHash("sha256")
      .update(canonical)
      .digest("hex")
  );
}

export function createPipelineTransitionEvent(
  input,
) {
  assertPlainObject(
    input,
    "pipeline transition",
  );
  assertExactKeys(
    input,
    EVENT_KEYS,
    "pipeline transition",
  );

  const schemaVersion =
    input.schemaVersion ??
    PIPELINE_TRANSITION_SCHEMA_VERSION;

  if (
    schemaVersion !==
    PIPELINE_TRANSITION_SCHEMA_VERSION
  ) {
    projectionError(
      "schemaVersion is not supported",
      { schemaVersion },
    );
  }

  const occurredAt = canonicalInstant(
    input.occurredAt,
    "occurredAt",
  );
  const recordedAt = canonicalInstant(
    input.recordedAt,
    "recordedAt",
  );

  if (
    new Date(recordedAt) <
    new Date(occurredAt)
  ) {
    projectionError(
      "recordedAt cannot precede occurredAt",
    );
  }

  const fromStage = stageCode(
    input.fromStage,
    "fromStage",
  );
  const toStage = stageCode(
    input.toStage,
    "toStage",
  );

  if (fromStage === toStage) {
    projectionError(
      "pipeline transition must change stage",
    );
  }

  const metadataInput =
    input.metadata ?? {};

  assertPlainObject(
    metadataInput,
    "metadata",
  );
  assertNoScoringKeys(metadataInput);

  return deepFreeze({
    schemaVersion,
    eventId: requiredString(
      input.eventId,
      "eventId",
    ),
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
    actorId: requiredString(
      input.actorId,
      "actorId",
    ),
    prospectId: requiredString(
      input.prospectId,
      "prospectId",
    ),
    opportunityId: requiredString(
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
    fromStage,
    toStage,
    evidence: normalizeEvidence(
      input.evidence,
    ),
    occurredAt,
    recordedAt,
    timeZone: normalizeTimeZone(
      input.timeZone,
    ),
    metadata: cloneJson(
      metadataInput,
    ),
  });
}

export function projectPipelineTransitionToActivity(
  input,
) {
  const transition =
    createPipelineTransitionEvent(input);
  const rule =
    PROJECTION_RULES[transition.toStage];

  if (!rule) {
    return deepFreeze({
      status: "IGNORED",
      reason:
        "NO_SEMANTIC_ACTIVITY_EQUIVALENCE",
      sourceEventId: transition.eventId,
      fromStage: transition.fromStage,
      toStage: transition.toStage,
    });
  }

  if (
    !rule.fromStages.includes(
      transition.fromStage,
    )
  ) {
    projectionError(
      "transition source is not valid for this activity projection",
      {
        fromStage: transition.fromStage,
        toStage: transition.toStage,
      },
    );
  }

  const missingEvidence =
    rule.requiredEvidence.filter(
      (token) =>
        !transition.evidence.includes(token),
    );

  if (missingEvidence.length > 0) {
    projectionError(
      "transition evidence is insufficient for activity projection",
      {
        toStage: transition.toStage,
        missingEvidence,
      },
    );
  }

  if (
    rule.appointmentRequired &&
    !transition.appointmentId
  ) {
    projectionError(
      "appointmentId is required for this activity projection",
      {
        toStage: transition.toStage,
      },
    );
  }

  const activityRecord = createActivityRecord({
    id: createDeterministicActivityId(
      transition,
    ),
    organizationId:
      transition.organizationId,
    advisorId: transition.advisorId,
    managerId: transition.managerId,
    prospectId: transition.prospectId,
    opportunityId:
      transition.opportunityId,
    appointmentId:
      transition.appointmentId,
    policyId: transition.policyId,
    type: rule.activityType,
    subtype: rule.subtype,
    lifecycle: "CONFIRMED",
    source: {
      system: "PIPELINE",
      eventId: transition.eventId,
      recordedAt: transition.recordedAt,
      producerVersion:
        transition.schemaVersion,
      evidenceState: "VERIFIED",
    },
    occurredAt: transition.occurredAt,
    evaluationDate: localEvaluationDate(
      transition.occurredAt,
      transition.timeZone,
    ),
    timeZone: transition.timeZone,
    confirmation: {
      method: "PIPELINE_STATE",
      confirmedAt:
        transition.recordedAt,
      confirmedBy: transition.actorId,
    },
    correction: null,
    reversal: null,
    metadata: {
      projectionVersion:
        PIPELINE_ACTIVITY_PROJECTION_VERSION,
      pipelineTransition: {
        fromStage: transition.fromStage,
        toStage: transition.toStage,
        evidence: [
          ...transition.evidence,
        ],
      },
      sourceMetadata:
        transition.metadata,
    },
    revision: 1,
    createdAt: transition.recordedAt,
    updatedAt: transition.recordedAt,
  });

  return deepFreeze({
    status: "PROJECTED",
    sourceEventId: transition.eventId,
    activityRecord,
    truthKey: createActivityTruthKey(
      activityRecord,
    ),
  });
}

export function createPipelineActivityProjectionService(
  { repository },
) {
  const activityRepository =
    assertActivityRepositoryPort(
      repository,
    );

  return Object.freeze({
    async handle(input) {
      const projection =
        projectPipelineTransitionToActivity(
          input,
        );

      if (
        projection.status === "IGNORED"
      ) {
        return projection;
      }

      const persisted =
        await activityRepository.append(
          projection.activityRecord,
        );

      return deepFreeze({
        status: "PERSISTED",
        sourceEventId:
          projection.sourceEventId,
        inserted: persisted.inserted,
        record: persisted.record,
        truthKey: persisted.truthKey,
      });
    },
  });
}
