import assert from "node:assert/strict";
import test from "node:test";

import {
  ActivityRepositoryConflictError,
} from "../advisor-os/activity/application/activity-repository-port.mjs";

import {
  InMemoryActivityRepository,
} from "../advisor-os/activity/infrastructure/in-memory-activity-repository.mjs";

import {
  PIPELINE_ACTIVITY_PROJECTION_VERSION,
  PIPELINE_TRANSITION_SCHEMA_VERSION,
  PipelineActivityProjectionError,
  createPipelineActivityProjectionService,
  createPipelineTransitionEvent,
  projectPipelineTransitionToActivity,
} from "../advisor-os/activity/application/pipeline-to-activity-projector.mjs";

function transition(overrides = {}) {
  return {
    schemaVersion:
      PIPELINE_TRANSITION_SCHEMA_VERSION,
    eventId: "pipeline-event-001",
    organizationId: "organization-001",
    advisorId: "advisor-001",
    managerId: "manager-001",
    actorId: "advisor-001",
    prospectId: "prospect-001",
    opportunityId: "opportunity-001",
    appointmentId: "appointment-001",
    policyId: null,
    fromStage: "CONTACTED",
    toStage: "APPOINTMENT_SCHEDULED",
    evidence: [
      "APPOINTMENT_CONFIRMED",
    ],
    occurredAt:
      "2026-07-27T04:30:00.000Z",
    recordedAt:
      "2026-07-27T04:35:00.000Z",
    timeZone: "America/Mexico_City",
    metadata: {
      channel: "PIPELINE_UI",
    },
    ...overrides,
  };
}

test("normalizes a canonical pipeline transition", () => {
  const value = createPipelineTransitionEvent(
    transition({
      occurredAt:
        "2026-07-27T04:30:00-00:00",
    }),
  );

  assert.equal(
    value.occurredAt,
    "2026-07-27T04:30:00.000Z",
  );
  assert.equal(Object.isFrozen(value), true);
  assert.equal(
    Object.isFrozen(value.evidence),
    true,
  );
});

test("rejects unknown transition fields", () => {
  assert.throws(
    () => createPipelineTransitionEvent({
      ...transition(),
      points: 10,
    }),
    PipelineActivityProjectionError,
  );
});

test("rejects scoring authority in metadata", () => {
  assert.throws(
    () => createPipelineTransitionEvent(
      transition({
        metadata: {
          nested: {
            score: 2,
          },
        },
      }),
    ),
    /embeds scoring authority/,
  );
});

test("rejects recordedAt before occurredAt", () => {
  assert.throws(
    () => createPipelineTransitionEvent(
      transition({
        recordedAt:
          "2026-07-27T04:20:00.000Z",
      }),
    ),
    /cannot precede/,
  );
});

test("projects a verified contact event", () => {
  const result =
    projectPipelineTransitionToActivity(
      transition({
        fromStage: "NEW",
        toStage: "CONTACTED",
        appointmentId: null,
        evidence: ["CONTACT_EVENT"],
      }),
    );

  assert.equal(result.status, "PROJECTED");
  assert.equal(
    result.activityRecord.type,
    "CONTACT_ATTEMPTED",
  );
});

test("projects an initial appointment schedule", () => {
  const result =
    projectPipelineTransitionToActivity(
      transition(),
    );

  assert.equal(result.status, "PROJECTED");
  assert.equal(
    result.activityRecord.type,
    "INITIAL_APPOINTMENT_SCHEDULED",
  );
  assert.equal(
    result.activityRecord.source.system,
    "PIPELINE",
  );
  assert.equal(
    result.activityRecord.confirmation.method,
    "PIPELINE_STATE",
  );
});

test("projects a documented discovery appointment", () => {
  const result =
    projectPipelineTransitionToActivity(
      transition({
        fromStage:
          "APPOINTMENT_SCHEDULED",
        toStage: "DISCOVERY_COMPLETED",
        evidence: [
          "APPOINTMENT_DOCUMENTED",
        ],
      }),
    );

  assert.equal(
    result.activityRecord.type,
    "INITIAL_APPOINTMENT_COMPLETED",
  );
});

test("projects a closing appointment from follow-up", () => {
  const result =
    projectPipelineTransitionToActivity(
      transition({
        fromStage: "FOLLOW_UP",
        toStage: "CLOSING_APPOINTMENT",
        evidence: [
          "CLOSING_APPOINTMENT_CONFIRMED",
        ],
      }),
    );

  assert.equal(
    result.activityRecord.type,
    "CLOSING_APPOINTMENT_SCHEDULED",
  );
});

test("projects an application reference", () => {
  const result =
    projectPipelineTransitionToActivity(
      transition({
        fromStage:
          "CLOSING_APPOINTMENT",
        toStage: "APPLICATION",
        appointmentId: null,
        evidence: [
          "APPLICATION_REFERENCE",
        ],
      }),
    );

  assert.equal(
    result.activityRecord.type,
    "APPLICATION_SUBMITTED",
  );
});

test("does not equate issued or won with policy paid", () => {
  for (const [fromStage, toStage] of [
    ["APPLICATION", "ISSUED"],
    ["ISSUED", "CLOSED_WON"],
  ]) {
    const result =
      projectPipelineTransitionToActivity(
        transition({
          fromStage,
          toStage,
          appointmentId: null,
          evidence: [
            "POLICY_ISSUED_REFERENCE",
          ],
        }),
      );

    assert.deepEqual(result, {
      status: "IGNORED",
      reason:
        "NO_SEMANTIC_ACTIVITY_EQUIVALENCE",
      sourceEventId: "pipeline-event-001",
      fromStage,
      toStage,
    });
  }
});

test("ignores follow-up required because it is not completed", () => {
  const result =
    projectPipelineTransitionToActivity(
      transition({
        fromStage:
          "PRESENTATION_COMPLETED",
        toStage: "FOLLOW_UP",
        appointmentId: null,
        evidence: [
          "FOLLOW_UP_REQUIRED",
        ],
      }),
    );

  assert.equal(result.status, "IGNORED");
});

test("rejects missing entry evidence", () => {
  assert.throws(
    () => projectPipelineTransitionToActivity(
      transition({
        evidence: ["CONTACT_EVENT"],
      }),
    ),
    /evidence is insufficient/,
  );
});

test("rejects a source stage outside the projection intersection", () => {
  assert.throws(
    () => projectPipelineTransitionToActivity(
      transition({
        fromStage: "FOLLOW_UP",
      }),
    ),
    /source is not valid/,
  );
});

test("requires appointment identity for appointment activities", () => {
  assert.throws(
    () => projectPipelineTransitionToActivity(
      transition({
        appointmentId: null,
      }),
    ),
    /appointmentId is required/,
  );
});

test("derives evaluation date in the advisor time zone", () => {
  const result =
    projectPipelineTransitionToActivity(
      transition(),
    );

  assert.equal(
    result.activityRecord.evaluationDate,
    "2026-07-26",
  );
});

test("creates deterministic activity identity and truth", () => {
  const first =
    projectPipelineTransitionToActivity(
      transition(),
    );
  const second =
    projectPipelineTransitionToActivity(
      transition(),
    );

  assert.equal(
    first.activityRecord.id,
    second.activityRecord.id,
  );
  assert.equal(
    first.truthKey,
    second.truthKey,
  );
  assert.match(
    first.activityRecord.id,
    /^activity:pipeline:[a-f0-9]{64}$/u,
  );
});

test("records the projection lineage without scoring", () => {
  const result =
    projectPipelineTransitionToActivity(
      transition(),
    );

  assert.equal(
    result.activityRecord.metadata
      .projectionVersion,
    PIPELINE_ACTIVITY_PROJECTION_VERSION,
  );
  assert.deepEqual(
    result.activityRecord.metadata
      .pipelineTransition,
    {
      fromStage: "CONTACTED",
      toStage: "APPOINTMENT_SCHEDULED",
      evidence: [
        "APPOINTMENT_CONFIRMED",
      ],
    },
  );
});

test("does not mutate the source transition", () => {
  const input = transition();
  const before = JSON.stringify(input);

  projectPipelineTransitionToActivity(input);

  assert.equal(JSON.stringify(input), before);
});

test("persists a projected activity through the repository port", async () => {
  const repository =
    new InMemoryActivityRepository();
  const service =
    createPipelineActivityProjectionService({
      repository,
    });

  const result =
    await service.handle(transition());

  assert.equal(result.status, "PERSISTED");
  assert.equal(result.inserted, true);
  assert.equal(await repository.size({
    organizationId: "organization-001",
  }), 1);
});

test("makes exact pipeline replay idempotent", async () => {
  const service =
    createPipelineActivityProjectionService({
      repository:
        new InMemoryActivityRepository(),
    });

  const first =
    await service.handle(transition());
  const second =
    await service.handle(transition());

  assert.equal(first.inserted, true);
  assert.equal(second.inserted, false);
  assert.equal(
    first.truthKey,
    second.truthKey,
  );
});

test("surfaces divergent replay as an activity conflict", async () => {
  const service =
    createPipelineActivityProjectionService({
      repository:
        new InMemoryActivityRepository(),
    });

  await service.handle(transition());

  await assert.rejects(
    () => service.handle(
      transition({
        occurredAt:
          "2026-07-27T05:30:00.000Z",
        recordedAt:
          "2026-07-27T05:35:00.000Z",
      }),
    ),
    ActivityRepositoryConflictError,
  );
});

test("does not call append for an ignored transition", async () => {
  let appendCalls = 0;

  const repository = {
    async append() {
      appendCalls += 1;
    },
    async getById() {
      return null;
    },
    async getByTruthKey() {
      return null;
    },
    async list() {
      return {
        items: [],
        nextCursor: null,
      };
    },
    async size() {
      return 0;
    },
  };

  const service =
    createPipelineActivityProjectionService({
      repository,
    });

  const result =
    await service.handle(
      transition({
        fromStage: "ISSUED",
        toStage: "CLOSED_WON",
        appointmentId: null,
        evidence: [
          "CONFIRMED_WON_OUTCOME",
        ],
      }),
    );

  assert.equal(result.status, "IGNORED");
  assert.equal(appendCalls, 0);
});

test("requires an ActivityRepository port", () => {
  assert.throws(
    () => createPipelineActivityProjectionService({
      repository: {},
    }),
    /repository must implement append/,
  );
});
