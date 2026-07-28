import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

import {
  FES_ACTIVITY_LINEAGE_SCHEMA_VERSION,
  FES_EVENT_ACTIVITY_PROJECTION_VERSION,
  createFesActivityProjectionService,
  projectCanonicalFesEventToActivity,
} from "../advisor-os/activity/application/fes-event-to-activity-projector.mjs";
import {
  createActivityReadRuntime,
} from "../advisor-os/activity/runtime/activity-read-runtime.mjs";
import {
  createPerformancePeriodRuntime,
} from "../advisor-os/performance/runtime/performance-period-runtime.mjs";
import {
  createPerformanceReadRuntime,
} from "../advisor-os/performance/runtime/performance-read-runtime.mjs";

const require = createRequire(import.meta.url);
const bridge = require(
  "../platform/event-evidence/passive-capture-bridge-contract.js",
);
const adapter = require(
  "../platform/event-evidence/bridge-to-canonical-event-adapter.js",
);
const browser = require(
  "../advisor-os/activity/runtime/browser-activity-composition.js",
);

const TENANT = "advisor-001";
const PROSPECT = "prospect-001";
const ORGANIZATION = "organization-001";
const NOW = "2026-07-28T18:00:00.000Z";

const payloads = {
  CALL_NOT_ANSWERED_CONFIRMED: {
    flow_reference: "flow-call-001",
    call_reference: "call-001",
    confirmation_reference:
      "confirmation-call-001",
  },
  CALL_CONNECTED_CONFIRMED: {
    flow_reference: "flow-call-002",
    call_reference: "call-002",
    confirmation_reference:
      "confirmation-call-002",
  },
  APPOINTMENT_SCHEDULED: {
    flow_reference:
      "flow-appointment-001",
    appointment_reference:
      "appointment-001",
    starts_at:
      "2026-07-29T16:00:00.000Z",
    ends_at:
      "2026-07-29T17:00:00.000Z",
    provider_reference:
      "calendar-handoff-001",
  },
  APPOINTMENT_HELD: {
    flow_reference:
      "flow-appointment-002",
    appointment_reference:
      "appointment-002",
    confirmation_reference:
      "confirmation-appointment-002",
    outcome_confirmed_at: NOW,
  },
  MESSAGE_DRAFT_GENERATED: {
    flow_reference: "flow-message-001",
    artifact_reference: "artifact-001",
    generation_mode:
      "GOVERNED_PROVIDER",
    provider_reference:
      "provider-run-001",
  },
  CALL_INITIATED: {
    flow_reference: "flow-call-003",
    call_reference: "call-003",
    handoff_reference:
      "handoff-call-003",
  },
};

function sourceFor(
  actionCode,
  overrides = {},
) {
  const sourceTypes = {
    CALL_NOT_ANSWERED_CONFIRMED:
      "ADVISOR_CONFIRMED",
    CALL_CONNECTED_CONFIRMED:
      "ADVISOR_CONFIRMED",
    APPOINTMENT_SCHEDULED:
      "ADVISOR_CONFIRMED",
    APPOINTMENT_HELD:
      "ADVISOR_CONFIRMED",
    MESSAGE_DRAFT_GENERATED:
      "SYSTEM_GENERATED",
    CALL_INITIATED:
      "EXTERNAL_HANDOFF_OBSERVED",
  };
  return {
    observation_reference:
      `observation-${actionCode.toLowerCase()}`,
    tenant_id: TENANT,
    actor_id:
      actionCode ===
        "MESSAGE_DRAFT_GENERATED"
        ? "forge-system"
        : TENANT,
    prospect_id: PROSPECT,
    action_code: actionCode,
    source_type: sourceTypes[actionCode],
    occurred_at: NOW,
    recorded_at:
      "2026-07-28T18:00:01.000Z",
    payload:
      bridge.PROSPECT_LINEAGE_ACTIONS
        .includes(actionCode)
        ? {
            ...payloads[actionCode],
            prospect_reference:
              PROSPECT,
          }
        : {
            ...payloads[actionCode],
          },
    evidence_references: [
      `evidence-${actionCode.toLowerCase()}`,
    ],
    ...overrides,
  };
}

function eventFor(
  actionCode,
  overrides = {},
) {
  const source =
    sourceFor(actionCode, overrides);
  const observation =
    bridge.createPassiveCaptureObservation(
      source,
    );
  return {
    source,
    observation,
    event:
      adapter.createCanonicalEventFromObservation({
        observation,
        observation_source: source,
      }),
  };
}

function authority(overrides = {}) {
  return {
    organizationId: ORGANIZATION,
    advisorId: TENANT,
    authenticatedUserId: TENANT,
    tenantId: TENANT,
    ...overrides,
  };
}

test("FES 08A exposes the ratified schemas", () => {
  assert.equal(
    FES_ACTIVITY_LINEAGE_SCHEMA_VERSION,
    "forge.fes_activity_lineage.v1",
  );
  assert.equal(
    FES_EVENT_ACTIVITY_PROJECTION_VERSION,
    "fes-event-activity-projection.v1",
  );
});

for (const [
  eventType,
  subjectType,
  activityType,
] of [
  [
    "CALL_NOT_ANSWERED_CONFIRMED",
    "CALL",
    "CONTACT_ATTEMPTED",
  ],
  [
    "CALL_CONNECTED_CONFIRMED",
    "CALL",
    "CONVERSATION_COMPLETED",
  ],
  [
    "APPOINTMENT_SCHEDULED",
    "APPOINTMENT",
    "INITIAL_APPOINTMENT_SCHEDULED",
  ],
  [
    "APPOINTMENT_HELD",
    "APPOINTMENT",
    "INITIAL_APPOINTMENT_COMPLETED",
  ],
]) {
  test(`${eventType} preserves subject and prospect lineage`, () => {
    const { event } =
      eventFor(eventType);
    assert.equal(
      event.subject.type,
      subjectType,
    );
    assert.equal(
      event.payload.prospect_reference,
      PROSPECT,
    );
    const projection =
      projectCanonicalFesEventToActivity({
        event,
        authority: authority(),
        timeZone:
          "America/Mexico_City",
      });
    assert.equal(
      projection.activityRecord.type,
      activityType,
    );
    assert.equal(
      projection.activityRecord.prospectId,
      PROSPECT,
    );
    assert.equal(
      projection.activityRecord.source.system,
      "FES_RECONCILIATION",
    );
    assert.equal(
      projection.activityRecord
        .confirmation.method,
      "MANUAL_ADVISOR",
    );
  });
}

test("lineage mismatch fails in the observation contract", () => {
  assert.throws(
    () =>
      bridge.createPassiveCaptureObservation(
        sourceFor(
          "CALL_CONNECTED_CONFIRMED",
          {
            payload: {
              ...payloads
                .CALL_CONNECTED_CONFIRMED,
              prospect_reference:
                "prospect-other",
            },
          },
        ),
      ),
    error =>
      error.code ===
      "PASSIVE_CAPTURE_PROSPECT_LINEAGE_MISMATCH",
  );
});

test("missing prospect lineage remains readable but cannot project", () => {
  const source =
    sourceFor(
      "CALL_CONNECTED_CONFIRMED",
      {
        payload: {
          ...payloads
            .CALL_CONNECTED_CONFIRMED,
        },
      },
    );
  const observation =
    bridge.createPassiveCaptureObservation(
      source,
    );
  const event =
    adapter.createCanonicalEventFromObservation({
      observation,
      observation_source: source,
    });

  const historical = {
    ...event,
    payload: {
      ...payloads
        .CALL_CONNECTED_CONFIRMED,
    },
  };

  assert.throws(
    () =>
      projectCanonicalFesEventToActivity({
        event: historical,
        authority: authority(),
        timeZone:
          "America/Mexico_City",
      }),
  );
});

test("tenant and advisor mismatches fail closed", () => {
  const { event } =
    eventFor(
      "CALL_CONNECTED_CONFIRMED",
    );
  assert.throws(
    () =>
      projectCanonicalFesEventToActivity({
        event,
        authority: authority({
          tenantId: "tenant-other",
        }),
        timeZone:
          "America/Mexico_City",
      }),
    error =>
      error.code ===
      "FES_ACTIVITY_TENANT_AUTHORITY_MISMATCH",
  );
  assert.throws(
    () =>
      projectCanonicalFesEventToActivity({
        event,
        authority: authority({
          authenticatedUserId:
            "advisor-other",
        }),
        timeZone:
          "America/Mexico_City",
      }),
    error =>
      error.code ===
      "FES_ACTIVITY_ADVISOR_AUTHORITY_MISMATCH",
  );
});

test("raw private text remains forbidden", () => {
  assert.throws(
    () =>
      bridge.createPassiveCaptureObservation(
        sourceFor(
          "CALL_CONNECTED_CONFIRMED",
          {
            payload: {
              ...payloads
                .CALL_CONNECTED_CONFIRMED,
              prospect_reference:
                PROSPECT,
              messageText:
                "private message",
            },
          },
        ),
      ),
    error =>
      [
        "PASSIVE_CAPTURE_RAW_CONTENT_FORBIDDEN",
        "PASSIVE_CAPTURE_PAYLOAD_FIELDS_INVALID",
      ].includes(error.code),
  );
});

test("unconfirmed handoffs do not create Activity", () => {
  const source =
    sourceFor("CALL_INITIATED");
  const observation =
    bridge.createPassiveCaptureObservation(
      source,
    );
  assert.throws(
    () =>
      adapter
        .createCanonicalEventFromObservation({
          observation,
          observation_source: source,
        }),
    error =>
      error.code ===
      "BRIDGE_CANONICAL_CANDIDATE_BLOCKED",
  );
});

test("unsupported canonical FES events are explicitly ignored", () => {
  const { event } =
    eventFor(
      "MESSAGE_DRAFT_GENERATED",
    );
  const result =
    projectCanonicalFesEventToActivity({
      event,
      authority: authority(),
      timeZone:
        "America/Mexico_City",
    });
  assert.deepEqual(result, {
    status: "IGNORED",
    reason:
      "NO_ACTIVITY_SEMANTIC_EQUIVALENCE",
    sourceEventId: event.event_id,
  });
});

test("Node and browser ActivityRecord and SHA-256 are byte-equivalent", async () => {
  const { event } =
    eventFor(
      "APPOINTMENT_SCHEDULED",
    );
  const nodeProjection =
    projectCanonicalFesEventToActivity({
      event,
      authority: authority(),
      timeZone:
        "America/Mexico_City",
    });
  const browserProjection =
    await browser.project({
      event,
      authority: authority(),
      timeZone:
        "America/Mexico_City",
    });
  assert.deepEqual(
    browserProjection.activityRecord,
    nodeProjection.activityRecord,
  );
  assert.equal(
    browserProjection.truthKey,
    nodeProjection.truthKey,
  );
});

test("exact replay is idempotent and divergent replay conflicts", async () => {
  const records = new Map();
  const truths = new Map();
  const repository = {
    async append(record) {
      const existing =
        records.get(record.id);
      const serialized =
        JSON.stringify(record);
      if (
        existing &&
        existing !== serialized
      ) {
        throw new Error(
          "ACTIVITY_REPLAY_CONFLICT",
        );
      }
      const inserted = !existing;
      records.set(record.id, serialized);
      const truthKey =
        (await import(
          "../advisor-os/activity/domain/activity-record.mjs"
        )).createActivityTruthKey(record);
      truths.set(truthKey, record.id);
      return {
        record,
        inserted,
        truthKey,
      };
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
      return records.size;
    },
  };
  const service =
    createFesActivityProjectionService({
      repository,
    });
  const input = {
    event:
      eventFor(
        "CALL_CONNECTED_CONFIRMED",
      ).event,
    authority: authority(),
    timeZone:
      "America/Mexico_City",
  };
  assert.equal(
    (await service.handle(input)).inserted,
    true,
  );
  assert.equal(
    (await service.handle(input)).inserted,
    false,
  );
});

test("browser append uses RPC only", async () => {
  const { event } =
    eventFor(
      "CALL_CONNECTED_CONFIRMED",
    );
  const calls = [];
  const client = {
    async rpc(name, parameters) {
      calls.push({ name, parameters });
      return {
        data: {
          row: {
            payload:
              parameters.p_record,
          },
          inserted: true,
        },
        error: null,
      };
    },
  };
  const runtime = browser.create({
    client,
    authority: authority(),
  });
  const result =
    await runtime.appendEvent({
      event,
      timeZone:
        "America/Mexico_City",
    });
  assert.equal(result.inserted, true);
  assert.equal(
    calls[0].name,
    "activity_records_append_v1",
  );
  assert.equal(
    JSON.stringify(calls).includes(
      ".from(",
    ),
    false,
  );
});

test("Activity metadata contains no scoring authority", () => {
  const { event } =
    eventFor(
      "CALL_CONNECTED_CONFIRMED",
    );
  const record =
    projectCanonicalFesEventToActivity({
      event,
      authority: authority(),
      timeZone:
        "America/Mexico_City",
    }).activityRecord;
  assert.doesNotMatch(
    JSON.stringify(record.metadata),
    /point|score|weight|multiplier/iu,
  );
});

test("accepted Performance read runtime consumes scheduled and completed Activity", async () => {
  const records = [
    "APPOINTMENT_SCHEDULED",
    "APPOINTMENT_HELD",
  ].map(eventType =>
    projectCanonicalFesEventToActivity({
      event: eventFor(eventType).event,
      authority: authority(),
      timeZone:
        "America/Mexico_City",
    }).activityRecord,
  );
  const repository = {
    async append() {
      throw new Error(
        "READ_ONLY_TEST_REPOSITORY",
      );
    },
    async getById() {
      return null;
    },
    async getByTruthKey() {
      return null;
    },
    async list(query) {
      const items = records
        .filter(record =>
          record.organizationId ===
            query.organizationId &&
          record.advisorId ===
            query.advisorId,
        )
        .sort((left, right) =>
          left.occurredAt.localeCompare(
            right.occurredAt,
          ) ||
          left.id.localeCompare(right.id),
        );
      return {
        items,
        nextCursor: null,
      };
    },
    async size() {
      return records.length;
    },
  };
  const activityRuntime =
    createActivityReadRuntime({
      repository,
      organizationId: ORGANIZATION,
      advisorId: TENANT,
      clock: () =>
        "2026-07-28T20:00:00.000Z",
    });
  const performanceRuntime =
    createPerformancePeriodRuntime({
      activityRuntime,
      clock: () =>
        "2026-07-28T20:00:00.000Z",
    });
  const performanceRead =
    createPerformanceReadRuntime({
      performanceRuntime,
    });
  const result =
    await performanceRead.readDay({
      evaluationDate: "2026-07-28",
      asOf:
        "2026-07-28T20:00:00.000Z",
    });

  assert.equal(
    result.activity.items.find(
      item =>
        item.activityType ===
        "INITIAL_APPOINTMENT_SCHEDULED",
    ).count,
    1,
  );
  assert.equal(
    result.activity.items.find(
      item =>
        item.activityType ===
        "INITIAL_APPOINTMENT_COMPLETED",
    ).count,
    1,
  );
  assert.equal(
    result.authority
      .performancePolicyAuthority,
    true,
  );
});
