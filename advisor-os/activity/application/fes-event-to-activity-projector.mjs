import { createHash } from "node:crypto";
import { createRequire } from "node:module";

import {
  createActivityRecord,
  createActivityTruthKey,
} from "../domain/activity-record.mjs";
import {
  assertActivityRepositoryPort,
} from "./activity-repository-port.mjs";

const require = createRequire(import.meta.url);
const canonicalContract = require(
  "../../../platform/event-evidence/canonical-activity-event-contract.js",
);

export const FES_ACTIVITY_LINEAGE_SCHEMA_VERSION =
  "forge.fes_activity_lineage.v1";
export const FES_EVENT_ACTIVITY_PROJECTION_VERSION =
  "fes-event-activity-projection.v1";

const MAPPINGS = Object.freeze({
  CALL_NOT_ANSWERED_CONFIRMED: Object.freeze({
    activityType: "CONTACT_ATTEMPTED",
    subtype: "FES_CALL_NOT_ANSWERED_CONFIRMED",
    appointmentRequired: false,
  }),
  CALL_CONNECTED_CONFIRMED: Object.freeze({
    activityType: "CONVERSATION_COMPLETED",
    subtype: "FES_CALL_CONNECTED_CONFIRMED",
    appointmentRequired: false,
  }),
  APPOINTMENT_SCHEDULED: Object.freeze({
    activityType: "INITIAL_APPOINTMENT_SCHEDULED",
    subtype: "FES_APPOINTMENT_SCHEDULED",
    appointmentRequired: true,
  }),
  APPOINTMENT_HELD: Object.freeze({
    activityType: "INITIAL_APPOINTMENT_COMPLETED",
    subtype: "FES_APPOINTMENT_HELD",
    appointmentRequired: true,
  }),
});

const PROHIBITED_SCORING_KEYS = new Set([
  "point",
  "points",
  "pointvalue",
  "score",
  "scorevalue",
  "weight",
  "multiplier",
]);

export class FesActivityProjectionError extends TypeError {
  constructor(code, message, details = null) {
    super(message);
    this.name = "FesActivityProjectionError";
    this.code = code;
    this.details = details;
  }
}

function fail(code, message, details = null) {
  throw new FesActivityProjectionError(
    code,
    message,
    details,
  );
}

function requiredString(value, label) {
  if (
    typeof value !== "string" ||
    value.trim() === ""
  ) {
    fail(
      "FES_ACTIVITY_IDENTITY_REQUIRED",
      `${label} must be a non-empty string`,
      { label },
    );
  }
  return value.trim();
}

function optionalString(value, label) {
  return value === undefined || value === null
    ? null
    : requiredString(value, label);
}

function normalizeTimeZone(value) {
  const timeZone = requiredString(
    value,
    "timeZone",
  );
  try {
    new Intl.DateTimeFormat(
      "en",
      { timeZone },
    ).format();
  } catch {
    fail(
      "FES_ACTIVITY_TIMEZONE_INVALID",
      "timeZone must be a valid IANA zone",
    );
  }
  return timeZone;
}

function localEvaluationDate(instant, timeZone) {
  const parts = new Intl.DateTimeFormat(
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
      .filter(part =>
        ["year", "month", "day"].includes(
          part.type,
        ),
      )
      .map(part => [part.type, part.value]),
  );
  return `${values.year}-${values.month}-${values.day}`;
}

function assertNoScoring(value, path = "metadata") {
  if (!value || typeof value !== "object") {
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      assertNoScoring(item, `${path}[${index}]`),
    );
    return;
  }
  for (const [key, nested] of Object.entries(value)) {
    const token = key
      .toLowerCase()
      .replace(/[^a-z0-9]/gu, "");
    if (PROHIBITED_SCORING_KEYS.has(token)) {
      fail(
        "FES_ACTIVITY_SCORING_AUTHORITY_FORBIDDEN",
        "FES activity metadata cannot contain scoring authority",
        { path: `${path}.${key}` },
      );
    }
    assertNoScoring(nested, `${path}.${key}`);
  }
}

function deterministicActivityId({
  organizationId,
  advisorId,
  eventId,
  activityType,
}) {
  const canonical = [
    FES_EVENT_ACTIVITY_PROJECTION_VERSION,
    organizationId,
    advisorId,
    eventId,
    activityType,
  ].join("\u001f");
  return (
    "activity:fes:" +
    createHash("sha256")
      .update(canonical)
      .digest("hex")
  );
}

function normalizeAuthority(input = {}) {
  if (
    !input ||
    typeof input !== "object" ||
    Array.isArray(input)
  ) {
    fail(
      "FES_ACTIVITY_AUTHORITY_REQUIRED",
      "authority must be an object",
    );
  }
  const organizationId = requiredString(
    input.organizationId,
    "authority.organizationId",
  );
  const advisorId = requiredString(
    input.advisorId,
    "authority.advisorId",
  );
  const authenticatedUserId = requiredString(
    input.authenticatedUserId,
    "authority.authenticatedUserId",
  );
  if (advisorId !== authenticatedUserId) {
    fail(
      "FES_ACTIVITY_ADVISOR_AUTHORITY_MISMATCH",
      "advisor identity does not match the authenticated user",
    );
  }
  const tenantId = requiredString(
    input.tenantId,
    "authority.tenantId",
  );
  return Object.freeze({
    organizationId,
    advisorId,
    authenticatedUserId,
    tenantId,
    managerId: optionalString(
      input.managerId,
      "authority.managerId",
    ),
    opportunityId: optionalString(
      input.opportunityId,
      "authority.opportunityId",
    ),
    policyId: optionalString(
      input.policyId,
      "authority.policyId",
    ),
  });
}

export function projectCanonicalFesEventToActivity({
  event,
  authority,
  timeZone,
} = {}) {
  const canonicalEvent =
    canonicalContract
      .assertCanonicalActivityEvent(event);
  const selectedAuthority =
    normalizeAuthority(authority);
  const selectedTimeZone =
    normalizeTimeZone(timeZone);
  const mapping =
    MAPPINGS[canonicalEvent.event_type];

  if (!mapping) {
    return Object.freeze({
      status: "IGNORED",
      reason:
        "NO_ACTIVITY_SEMANTIC_EQUIVALENCE",
      sourceEventId:
        canonicalEvent.event_id,
    });
  }

  if (
    canonicalEvent.tenant_id !==
    selectedAuthority.tenantId
  ) {
    fail(
      "FES_ACTIVITY_TENANT_AUTHORITY_MISMATCH",
      "event tenant does not match authenticated authority",
    );
  }

  if (
    canonicalEvent.confirmation_state !== "CONFIRMED" ||
    ![
      "HUMAN_CONFIRMED",
      "EXTERNAL_CONFIRMED",
    ].includes(canonicalEvent.evidence_strength)
  ) {
    fail(
      "FES_ACTIVITY_CONFIRMED_EVIDENCE_REQUIRED",
      "activity projection requires confirmed evidence",
    );
  }

  const prospectId = requiredString(
    canonicalEvent.payload
      .prospect_reference,
    "event.payload.prospect_reference",
  );
  const appointmentId =
    canonicalEvent.subject.type ===
      "APPOINTMENT"
      ? canonicalEvent.subject.id
      : null;

  if (
    mapping.appointmentRequired &&
    !appointmentId
  ) {
    fail(
      "FES_ACTIVITY_APPOINTMENT_REQUIRED",
      "appointment activity requires an APPOINTMENT subject",
    );
  }

  if (
    canonicalEvent.source.type ===
      "ADVISOR_CONFIRMED" &&
    canonicalEvent.actor.id !==
      selectedAuthority.advisorId
  ) {
    fail(
      "FES_ACTIVITY_ADVISOR_EVENT_MISMATCH",
      "event actor does not match authenticated advisor",
    );
  }

  const metadata = {
    lineageSchema:
      FES_ACTIVITY_LINEAGE_SCHEMA_VERSION,
    projectionSchema:
      FES_EVENT_ACTIVITY_PROJECTION_VERSION,
    canonicalEventSchema:
      canonicalEvent.schema_version,
  };
  assertNoScoring(metadata);

  const record = createActivityRecord({
    id: deterministicActivityId({
      organizationId:
        selectedAuthority.organizationId,
      advisorId:
        selectedAuthority.advisorId,
      eventId: canonicalEvent.event_id,
      activityType:
        mapping.activityType,
    }),
    organizationId:
      selectedAuthority.organizationId,
    advisorId:
      selectedAuthority.advisorId,
    managerId:
      selectedAuthority.managerId,
    prospectId,
    opportunityId:
      selectedAuthority.opportunityId,
    appointmentId,
    policyId:
      selectedAuthority.policyId,
    type: mapping.activityType,
    subtype: mapping.subtype,
    lifecycle: "CONFIRMED",
    source: {
      system: "FES_RECONCILIATION",
      eventId: canonicalEvent.event_id,
      recordedAt:
        canonicalEvent.recorded_at,
      producerVersion:
        FES_EVENT_ACTIVITY_PROJECTION_VERSION,
      evidenceState: "VERIFIED",
    },
    occurredAt:
      canonicalEvent.occurred_at,
    evaluationDate:
      localEvaluationDate(
        canonicalEvent.occurred_at,
        selectedTimeZone,
      ),
    timeZone: selectedTimeZone,
    confirmation: {
      method:
        canonicalEvent.source.type ===
          "EXTERNAL_PROVIDER_CONFIRMED"
          ? "CALENDAR_COMPLETION"
          : "MANUAL_ADVISOR",
      confirmedAt:
        canonicalEvent.recorded_at,
      confirmedBy:
        canonicalEvent.source.type ===
          "EXTERNAL_PROVIDER_CONFIRMED"
          ? canonicalEvent.actor.id
          : selectedAuthority.advisorId,
    },
    correction: null,
    reversal: null,
    metadata,
    revision: 1,
    createdAt:
      canonicalEvent.recorded_at,
    updatedAt:
      canonicalEvent.recorded_at,
  });

  return Object.freeze({
    status: "PROJECTED",
    sourceEventId:
      canonicalEvent.event_id,
    activityRecord: record,
    truthKey:
      createActivityTruthKey(record),
  });
}

export function createFesActivityProjectionService({
  repository,
} = {}) {
  const activityRepository =
    assertActivityRepositoryPort(repository);

  return Object.freeze({
    async handle(input) {
      const projection =
        projectCanonicalFesEventToActivity(
          input,
        );
      if (projection.status === "IGNORED") {
        return projection;
      }
      const appendResult =
        await activityRepository.append(
          projection.activityRecord,
        );
      return Object.freeze({
        ...projection,
        inserted:
          appendResult.inserted,
        record:
          appendResult.record,
        repositoryTruthKey:
          appendResult.truthKey,
      });
    },
  });
}

export const FES_ACTIVITY_MAPPINGS = MAPPINGS;
