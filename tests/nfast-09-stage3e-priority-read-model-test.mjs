import test from "node:test";
import assert from "node:assert/strict";

import {
  DUE_BUCKETS,
  buildDueActionPriorityQueue,
  classifyDueAction,
} from "../advisor-os/sales-pipeline/prospect-due-action-priority-contract.js";

import {
  createMiDiaFollowUpReadModel,
} from "../advisor-os/home/mi-dia-follow-up-read-model.js";

const AS_OF = "2026-07-25T15:00:00.000Z";
const TIME_ZONE = "America/Mexico_City";

function record(overrides = {}) {
  return {
    advisorPartitionKey: "advisor-001",
    prospectReference: "prospect-001",
    approvedDisplayName: "Juan Pérez",
    nextActionType: "CALL",
    nextActionAt: "2026-07-25T16:00:00.000Z",
    dueActionState: "SCHEDULED",
    dueActionVersion: 1,
    serverRevision: "1",
    remoteUpdatedAt: "2026-07-25T14:59:00.000Z",
    localUpdatedAt: "2026-07-25T14:59:00.000Z",
    lastSyncedAt: "2026-07-25T14:59:00.000Z",
    syncState: "SYNCED",
    acknowledgementState: "UNSEEN",
    acknowledgedAt: null,
    acknowledgedOnDeviceId: null,
    snoozedUntil: null,
    tombstone: false,
    ...overrides,
  };
}

test("Stage 3E puts conflicts first", () => {
  const result = classifyDueAction(
    record({
      dueActionState: "CONFLICT_REVIEW_REQUIRED",
      nextActionAt: "2026-07-30T15:00:00.000Z",
    }),
    { asOf: AS_OF, timeZone: TIME_ZONE },
  );

  assert.equal(result.bucket, DUE_BUCKETS.SYNC_CONFLICT);
});

test("Stage 3E classifies the four active time buckets", () => {
  const cases = [
    ["2026-07-25T14:00:00.000Z", DUE_BUCKETS.OVERDUE],
    ["2026-07-25T15:10:00.000Z", DUE_BUCKETS.DUE_NOW],
    ["2026-07-25T21:00:00.000Z", DUE_BUCKETS.DUE_TODAY],
    ["2026-07-26T14:00:00.000Z", DUE_BUCKETS.UPCOMING_24H],
  ];

  for (const [nextActionAt, expected] of cases) {
    assert.equal(
      classifyDueAction(
        record({ nextActionAt }),
        { asOf: AS_OF, timeZone: TIME_ZONE },
      ).bucket,
      expected,
    );
  }
});

test("Stage 3E keeps seen overdue actions visible", () => {
  const queue = buildDueActionPriorityQueue(
    [
      record({
        nextActionAt: "2026-07-25T12:00:00.000Z",
        acknowledgementState: "SEEN",
      }),
    ],
    { asOf: AS_OF, timeZone: TIME_ZONE },
  );

  assert.equal(queue.actionableCount, 1);
  assert.equal(queue.items[0].classification.seenDoesNotHide, true);
});

test("Stage 3E excludes completed cancelled and tombstoned actions", () => {
  const queue = buildDueActionPriorityQueue(
    [
      record({
        prospectReference: "completed",
        dueActionState: "COMPLETED",
        tombstone: true,
      }),
      record({
        prospectReference: "cancelled",
        dueActionState: "CANCELLED",
        tombstone: true,
      }),
    ],
    { asOf: AS_OF, timeZone: TIME_ZONE },
  );

  assert.equal(queue.actionableCount, 0);
});

test("Stage 3E sorting is deterministic", () => {
  const queue = buildDueActionPriorityQueue(
    [
      record({
        prospectReference: "today",
        nextActionAt: "2026-07-25T20:00:00.000Z",
      }),
      record({
        prospectReference: "conflict",
        dueActionState: "CONFLICT_REVIEW_REQUIRED",
      }),
      record({
        prospectReference: "overdue",
        nextActionAt: "2026-07-25T12:00:00.000Z",
      }),
    ],
    { asOf: AS_OF, timeZone: TIME_ZONE },
  );

  assert.deepEqual(
    queue.items.map(item => item.record.prospectReference),
    ["conflict", "overdue", "today"],
  );
});

test("Stage 3E labels stale local evidence", () => {
  const view = createMiDiaFollowUpReadModel({
    records: [
      record({ lastSyncedAt: "2026-07-25T13:00:00.000Z" }),
    ],
    asOf: AS_OF,
    timeZone: TIME_ZONE,
    staleAfterMinutes: 15,
  });

  assert.equal(view.items[0].stale, true);
});

test("Stage 3E fingerprint is stable", () => {
  const input = {
    records: [record()],
    asOf: AS_OF,
    timeZone: TIME_ZONE,
  };

  const left = createMiDiaFollowUpReadModel(input);
  const right = createMiDiaFollowUpReadModel(input);

  assert.equal(left.fingerprint, right.fingerprint);
  assert.deepEqual(left, right);
});

test("Stage 3E caps cards but preserves counts", () => {
  const records = Array.from({ length: 7 }, (_, index) =>
    record({
      prospectReference: `prospect-${index}`,
      nextActionAt: `2026-07-25T1${index}:00:00.000Z`,
    }),
  );

  const view = createMiDiaFollowUpReadModel({
    records,
    asOf: AS_OF,
    timeZone: TIME_ZONE,
    maxItems: 3,
  });

  assert.equal(view.visibleCount, 3);
  assert.equal(view.hiddenActionableCount, 4);
});

test("Stage 3E read model excludes unrestricted context", () => {
  const serialized = JSON.stringify(
    createMiDiaFollowUpReadModel({
      records: [record()],
      asOf: AS_OF,
      timeZone: TIME_ZONE,
    }),
  );

  for (const forbidden of [
    "rawNotes",
    "phone",
    "whatsapp",
    "email",
    "income",
    "health",
    "providerPayload",
    "messageText",
  ]) {
    assert.equal(serialized.includes(forbidden), false);
  }
});

test("Stage 3E rejects invalid time zones", () => {
  assert.throws(
    () =>
      classifyDueAction(
        record(),
        {
          asOf: AS_OF,
          timeZone: "Mars/Olympus_Mons",
        },
      ),
    error => error.code === "TIME_ZONE_INVALID",
  );
});
