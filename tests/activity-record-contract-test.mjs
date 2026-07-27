import test from "node:test";
import assert from "node:assert/strict";

import {
  ACTIVITY_RECORD_SCHEMA_VERSION,
  ACTIVITY_TYPES,
  assertActivityRecord,
  createActivityRecord,
  createActivityTruthKey,
  isActivityRecord,
  isActivityScoringEligible,
} from "../advisor-os/activity/domain/activity-record.mjs";

function validInput(overrides = {}) {
  return {
    schemaVersion:
      ACTIVITY_RECORD_SCHEMA_VERSION,
    id: "activity-001",
    organizationId: "organization-001",
    advisorId: "advisor-001",
    managerId: "manager-001",
    prospectId: "prospect-001",
    opportunityId: "opportunity-001",
    appointmentId: "appointment-001",
    policyId: null,
    type:
      "INITIAL_APPOINTMENT_COMPLETED",
    subtype: "FIRST_MEETING",
    lifecycle: "CONFIRMED",
    source: {
      system: "PIPELINE",
      eventId: "pipeline-event-001",
      recordedAt:
        "2026-07-26T15:10:00.000Z",
      producerVersion: "pipeline.v1",
      evidenceState: "VERIFIED",
    },
    occurredAt:
      "2026-07-26T15:00:00.000Z",
    evaluationDate: "2026-07-26",
    timeZone: "America/Mexico_City",
    confirmation: {
      method: "PIPELINE_STATE",
      confirmedAt:
        "2026-07-26T15:12:00.000Z",
      confirmedBy: "advisor-001",
    },
    correction: null,
    reversal: null,
    metadata: {
      channel: "IN_PERSON",
      notesPresent: true,
    },
    revision: 1,
    createdAt:
      "2026-07-26T15:10:00.000Z",
    updatedAt:
      "2026-07-26T15:12:00.000Z",
    ...overrides,
  };
}

test("creates a canonical record", () => {
  const record = createActivityRecord(
    validInput(),
  );

  assert.equal(
    record.schemaVersion,
    "activity-record.v1",
  );
});

test("normalizes ISO instants", () => {
  const record = createActivityRecord(
    validInput({
      occurredAt:
        "2026-07-26T10:00:00-05:00",
    }),
  );

  assert.equal(
    record.occurredAt,
    "2026-07-26T15:00:00.000Z",
  );
});

test("requires stable id", () => {
  assert.throws(
    () => createActivityRecord(
      validInput({ id: "" }),
    ),
    /id must be a non-empty string/,
  );
});

test("requires organization authority", () => {
  assert.throws(
    () => createActivityRecord(
      validInput({ organizationId: null }),
    ),
    /organizationId/,
  );
});

test("requires advisor authority", () => {
  assert.throws(
    () => createActivityRecord(
      validInput({ advisorId: null }),
    ),
    /advisorId/,
  );
});

test("rejects unsupported type", () => {
  assert.throws(
    () => createActivityRecord(
      validInput({ type: "MAGIC" }),
    ),
    /type is not supported/,
  );
});

test("separates scheduled and completed", () => {
  assert.ok(
    ACTIVITY_TYPES.includes(
      "INITIAL_APPOINTMENT_SCHEDULED",
    ),
  );
  assert.ok(
    ACTIVITY_TYPES.includes(
      "INITIAL_APPOINTMENT_COMPLETED",
    ),
  );
});

test("requires confirmation", () => {
  assert.throws(
    () => createActivityRecord(
      validInput({ confirmation: null }),
    ),
    /confirmation must be a plain object/,
  );
});

test("forbids confirmation while pending", () => {
  assert.throws(
    () => createActivityRecord(
      validInput({
        lifecycle:
          "PENDING_CONFIRMATION",
      }),
    ),
    /pending activity cannot be confirmed/,
  );
});

test("allows pending without confirmation", () => {
  const record = createActivityRecord(
    validInput({
      lifecycle:
        "PENDING_CONFIRMATION",
      confirmation: null,
      source: {
        ...validInput().source,
        evidenceState: "UNVERIFIED",
      },
    }),
  );

  assert.equal(record.confirmation, null);
});

test("requires correction linkage", () => {
  assert.throws(
    () => createActivityRecord(
      validInput({
        lifecycle: "CORRECTED",
        correction: null,
      }),
    ),
    /correction must be a plain object/,
  );
});

test("creates correction record", () => {
  const record = createActivityRecord(
    validInput({
      id: "activity-correction-001",
      lifecycle: "CORRECTED",
      correction: {
        activityId: "activity-001",
        reason: "Timestamp corrected",
      },
    }),
  );

  assert.equal(
    record.correction.activityId,
    "activity-001",
  );
  assert.equal(
    isActivityScoringEligible(record),
    false,
  );
});

test("requires reversal linkage", () => {
  assert.throws(
    () => createActivityRecord(
      validInput({
        lifecycle: "REVERSED",
        reversal: null,
      }),
    ),
    /reversal must be a plain object/,
  );
});

test("creates reversal record", () => {
  const record = createActivityRecord(
    validInput({
      id: "activity-reversal-001",
      lifecycle: "REVERSED",
      reversal: {
        activityId: "activity-001",
        reason: "Appointment did not occur",
      },
    }),
  );

  assert.equal(
    record.reversal.activityId,
    "activity-001",
  );
  assert.equal(
    isActivityScoringEligible(record),
    false,
  );
});

test("rejects self-referencing relation", () => {
  assert.throws(
    () => createActivityRecord(
      validInput({
        lifecycle: "CORRECTED",
        correction: {
          activityId: "activity-001",
          reason: "Invalid self relation",
        },
      }),
    ),
    /cannot reference the same activity/,
  );
});

test("rejects correction on confirmed", () => {
  assert.throws(
    () => createActivityRecord(
      validInput({
        correction: {
          activityId: "activity-old",
          reason: "Not allowed",
        },
      }),
    ),
    /correction is only valid/,
  );
});

test("separates occurrence and evaluation", () => {
  const record = createActivityRecord(
    validInput({
      occurredAt:
        "2026-07-27T03:30:00.000Z",
      evaluationDate: "2026-07-26",
    }),
  );

  assert.equal(
    record.evaluationDate,
    "2026-07-26",
  );
});

test("rejects impossible evaluation date", () => {
  assert.throws(
    () => createActivityRecord(
      validInput({
        evaluationDate: "2026-02-30",
      }),
    ),
    /not a real calendar date/,
  );
});

test("rejects invalid time zone", () => {
  assert.throws(
    () => createActivityRecord(
      validInput({
        timeZone: "Forge/Imaginary",
      }),
    ),
    /valid IANA zone/,
  );
});

test("requires source event identity", () => {
  assert.throws(
    () => createActivityRecord(
      validInput({
        source: {
          ...validInput().source,
          eventId: "",
        },
      }),
    ),
    /source.eventId/,
  );
});

test("validates evidence state", () => {
  assert.throws(
    () => createActivityRecord(
      validInput({
        source: {
          ...validInput().source,
          evidenceState: "CERTAIN",
        },
      }),
    ),
    /source.evidenceState/,
  );
});

test("forbids direct points", () => {
  assert.throws(
    () => createActivityRecord({
      ...validInput(),
      points: 50,
    }),
    /unknown field points/,
  );
});

test("forbids score in metadata", () => {
  assert.throws(
    () => createActivityRecord(
      validInput({
        metadata: { score: 100 },
      }),
    ),
    /embeds scoring authority/,
  );
});

test("rejects unknown fields", () => {
  assert.throws(
    () => createActivityRecord({
      ...validInput(),
      inventedField: true,
    }),
    /unknown field inventedField/,
  );
});

test("requires positive revision", () => {
  assert.throws(
    () => createActivityRecord(
      validInput({ revision: 0 }),
    ),
    /positive integer/,
  );
});

test("rejects reversed timestamps", () => {
  assert.throws(
    () => createActivityRecord(
      validInput({
        updatedAt:
          "2026-07-26T15:00:00.000Z",
        createdAt:
          "2026-07-26T16:00:00.000Z",
      }),
    ),
    /cannot precede/,
  );
});

test("returns deeply immutable output", () => {
  const record = createActivityRecord(
    validInput(),
  );

  assert.equal(Object.isFrozen(record), true);
  assert.equal(
    Object.isFrozen(record.source),
    true,
  );
  assert.equal(
    Object.isFrozen(record.metadata),
    true,
  );
});

test("assert validates existing data", () => {
  const record = assertActivityRecord(
    validInput(),
  );

  assert.equal(record.id, "activity-001");
});

test("reports validity", () => {
  assert.equal(
    isActivityRecord(validInput()),
    true,
  );
  assert.equal(
    isActivityRecord({ id: "incomplete" }),
    false,
  );
});

test("creates deterministic truth key", () => {
  const first = createActivityTruthKey(
    validInput(),
  );
  const second = createActivityTruthKey(
    validInput(),
  );

  assert.equal(first, second);
  assert.match(
    first,
    /^activity:[0-9a-f]{64}$/,
  );
});

test("source events change truth key", () => {
  const first = createActivityTruthKey(
    validInput(),
  );
  const second = createActivityTruthKey(
    validInput({
      source: {
        ...validInput().source,
        eventId: "pipeline-event-002",
      },
    }),
  );

  assert.notEqual(first, second);
});

test("verified confirmed is scoring eligible", () => {
  assert.equal(
    isActivityScoringEligible(
      validInput(),
    ),
    true,
  );

  assert.equal(
    isActivityScoringEligible(
      validInput({
        source: {
          ...validInput().source,
          evidenceState: "UNKNOWN",
        },
      }),
    ),
    false,
  );
});
