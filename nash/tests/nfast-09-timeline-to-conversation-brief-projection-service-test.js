"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const projectionServiceContract = require(
  "../conversation-brief/nash-timeline-to-conversation-brief-projection-service",
);

const PROSPECT_REFERENCE = "prospect-001";
const AS_OF = "2026-07-25T00:00:00.000Z";

function event(overrides = {}) {
  return {
    id: "event-001",
    prospectId: PROSPECT_REFERENCE,
    eventType: "CONTACT_ATTEMPTED",
    eventSource: "ADVISOR_DECLARATION",
    sourceRecordReference: "TIMELINE:SOURCE:001",
    occurredAt: "2026-07-24T18:00:00.000Z",
    recordedAt: "2026-07-24T18:01:00.000Z",
    payload: {
      channel: "WHATSAPP",
      outcome: "CONNECTED",
      direction: "OUTBOUND",
    },
    evidenceReferences: ["EVIDENCE:001"],
    contractVersion: "NFAST-08.1",
    privacyClassification: "ADVISOR_PRIVATE_MINIMIZED",
    retentionPolicy: "NO_AUTOMATIC_DELETION_PENDING_POLICY",
    ...overrides,
  };
}

function createTimelineService(
  implementation,
) {
  return {
    listProspectTimeline:
      implementation ||
      (async () => [event()]),
    appendProspectTimelineEvent:
      async () => {
        throw new Error(
          "APPEND_MUST_NOT_BE_CALLED",
        );
      },
  };
}

test(
  "NFAST-09 Stage 2 composes governed Timeline read and deterministic projection",
  async () => {
    const calls = [];
    const timelineService =
      createTimelineService(
        async (
          prospectReference,
          options,
        ) => {
          calls.push({
            prospectReference,
            options,
          });

          return [
            event({
              id: "event-002",
              eventType:
                "FOLLOW_UP_PLANNED",
              eventSource: "PIPELINE",
              occurredAt:
                "2026-07-24T19:00:00.000Z",
              recordedAt:
                "2026-07-24T19:01:00.000Z",
              sourceRecordReference:
                "PIPELINE_PROSPECT:prospect-001",
              payload: {
                followUpType: "WHATSAPP",
                dueAt:
                  "2026-07-26T15:00:00.000Z",
              },
              evidenceReferences: [],
            }),
            event(),
          ];
        },
      );

    const service =
      projectionServiceContract.create(
        timelineService,
      );

    const result =
      await service.projectProspectTimeline(
        PROSPECT_REFERENCE,
        {
          asOf: AS_OF,
          maxEvents: 25,
          before:
            "2026-07-24T23:00:00.000Z",
          freshnessRules: {
            CONTACT_ATTEMPTED: 30,
            FOLLOW_UP_PLANNED: 30,
          },
          requiredEventTypes: [
            "CONTACT_ATTEMPTED",
          ],
        },
      );

    assert.deepEqual(calls, [
      {
        prospectReference:
          PROSPECT_REFERENCE,
        options: {
          limit: 25,
          before:
            "2026-07-24T23:00:00.000Z",
        },
      },
    ]);
    assert.equal(result.status, "SUCCESS");
    assert.equal(
      result.projection.projectionType,
      "CONVERSATION_CONTEXT",
    );
    assert.deepEqual(
      result.projection.verifiedFacts.map(
        fact => fact.eventType,
      ),
      [
        "CONTACT_ATTEMPTED",
        "FOLLOW_UP_PLANNED",
      ],
    );
  },
);

test(
  "NFAST-09 Stage 2 requires a governed Timeline service",
  () => {
    assert.throws(
      () =>
        projectionServiceContract.create(
          {},
        ),
      error =>
        error.code ===
        "TIMELINE_SERVICE_REQUIRED",
    );
  },
);

test(
  "NFAST-09 Stage 2 validates request before reading Timeline",
  async () => {
    let calls = 0;
    const service =
      projectionServiceContract.create(
        createTimelineService(
          async () => {
            calls += 1;
            return [event()];
          },
        ),
      );

    await assert.rejects(
      service.projectProspectTimeline(
        "",
        {
          asOf: AS_OF,
        },
      ),
      error =>
        error.code ===
        "PROSPECT_REFERENCE_INVALID",
    );

    await assert.rejects(
      service.projectProspectTimeline(
        PROSPECT_REFERENCE,
        {},
      ),
      error =>
        error.code ===
        "AS_OF_REQUIRED",
    );

    await assert.rejects(
      service.projectProspectTimeline(
        PROSPECT_REFERENCE,
        {
          asOf: AS_OF,
          unsupported: true,
        },
      ),
      error =>
        error.code ===
        "OPTIONS_INVALID",
    );

    assert.equal(calls, 0);
  },
);

test(
  "NFAST-09 Stage 2 preserves NO_PROJECTION from an empty Timeline",
  async () => {
    const service =
      projectionServiceContract.create(
        createTimelineService(
          async () => [],
        ),
      );

    const result =
      await service.projectProspectTimeline(
        PROSPECT_REFERENCE,
        {
          asOf: AS_OF,
        },
      );

    assert.equal(
      result.status,
      "NO_PROJECTION",
    );
    assert.ok(
      result.reasonCodes.includes(
        "TIMELINE_EMPTY",
      ),
    );
  },
);

test(
  "NFAST-09 Stage 2 preserves blocked projection results",
  async () => {
    const service =
      projectionServiceContract.create(
        createTimelineService(
          async () => [
            event({
              prospectId:
                "prospect-999",
            }),
          ],
        ),
      );

    const result =
      await service.projectProspectTimeline(
        PROSPECT_REFERENCE,
        {
          asOf: AS_OF,
        },
      );

    assert.equal(
      result.status,
      "BLOCKED_CONTEXT",
    );
    assert.ok(
      result.reasonCodes.includes(
        "CROSS_PROSPECT_EVENT_DENIED",
      ),
    );
  },
);

test(
  "NFAST-09 Stage 2 maps governed Timeline errors without leaking internals",
  async () => {
    const cases = [
      [
        "AUTH_REQUIRED",
        "AUTH_REQUIRED",
      ],
      [
        "PROSPECT_NOT_FOUND",
        "PROSPECT_NOT_FOUND",
      ],
      [
        "VALIDATION_ERROR",
        "TIMELINE_VALIDATION_ERROR",
      ],
      [
        "NETWORK_ERROR",
        "TIMELINE_READ_FAILED",
      ],
      [
        "SENSITIVE_INTERNAL_CODE",
        "TIMELINE_READ_FAILED",
      ],
    ];

    for (
      const [sourceCode, expectedCode]
      of cases
    ) {
      const service =
        projectionServiceContract.create(
          createTimelineService(
            async () => {
              const error = new Error(
                "secret database detail",
              );
              error.code = sourceCode;
              throw error;
            },
          ),
        );

      await assert.rejects(
        service.projectProspectTimeline(
          PROSPECT_REFERENCE,
          {
            asOf: AS_OF,
          },
        ),
        error => {
          assert.equal(
            error.code,
            expectedCode,
          );
          assert.equal(
            error.message.includes(
              "secret database detail",
            ),
            false,
          );
          return true;
        },
      );
    }
  },
);

test(
  "NFAST-09 Stage 2 does not mutate options or Timeline events",
  async () => {
    const events = [event()];
    const options = {
      asOf: AS_OF,
      freshnessRules: {
        CONTACT_ATTEMPTED: 30,
      },
      requiredEventTypes: [
        "CONTACT_ATTEMPTED",
      ],
      maxEvents: 50,
    };
    const eventsBefore =
      JSON.parse(JSON.stringify(events));
    const optionsBefore =
      JSON.parse(JSON.stringify(options));

    const service =
      projectionServiceContract.create(
        createTimelineService(
          async () => events,
        ),
      );

    const result =
      await service.projectProspectTimeline(
        PROSPECT_REFERENCE,
        options,
      );

    assert.deepEqual(events, eventsBefore);
    assert.deepEqual(
      options,
      optionsBefore,
    );
    assert.equal(
      Object.isFrozen(result),
      true,
    );
    assert.equal(
      Object.isFrozen(
        result.projection,
      ),
      true,
    );
  },
);

test(
  "NFAST-09 Stage 2 is deterministic for identical governed reads",
  async () => {
    const service =
      projectionServiceContract.create(
        createTimelineService(
          async () => [event()],
        ),
      );

    const first =
      await service.projectProspectTimeline(
        PROSPECT_REFERENCE,
        {
          asOf: AS_OF,
        },
      );
    const second =
      await service.projectProspectTimeline(
        PROSPECT_REFERENCE,
        {
          asOf: AS_OF,
        },
      );

    assert.deepEqual(first, second);
  },
);

test(
  "NFAST-09 Stage 2 exposes read-only diagnostics and no mutation methods",
  () => {
    const service =
      projectionServiceContract.create(
        createTimelineService(),
      );
    const diagnostics =
      service.diagnostics();

    assert.equal(
      service.serviceVersion,
      "NFAST-09.2",
    );
    assert.equal(
      service.projectionContractVersion,
      "NFAST-09.1",
    );
    assert.equal(
      service.projectionMode,
      "ON_DEMAND_DETERMINISTIC",
    );
    assert.equal(
      typeof service
        .projectProspectTimeline,
      "function",
    );
    assert.equal(
      service.appendProspectTimelineEvent,
      undefined,
    );
    assert.equal(
      service.updateProspectTimelineEvent,
      undefined,
    );
    assert.equal(
      service.deleteProspectTimelineEvent,
      undefined,
    );
    assert.equal(
      diagnostics
        .governedTimelineReadAllowed,
      true,
    );
    assert.equal(
      diagnostics
        .directDatabaseAccessAllowed,
      false,
    );
    assert.equal(
      diagnostics
        .persistentProjectionTable,
      false,
    );
    assert.equal(
      diagnostics
        .providerInvocationAllowed,
      false,
    );
    assert.equal(
      diagnostics
        .productiveRuntimeIntegrated,
      false,
    );
  },
);

test(
  "NFAST-09 Stage 2 service contains no direct database provider or write authority",
  () => {
    const source = fs.readFileSync(
      require.resolve(
        "../conversation-brief/nash-timeline-to-conversation-brief-projection-service",
      ),
      "utf8",
    );

    assert.equal(
      /\bfetch\s*\(/.test(source),
      false,
    );
    assert.equal(
      /\.from\s*\(/.test(source),
      false,
    );
    assert.equal(
      /\.rpc\s*\(/.test(source),
      false,
    );
    assert.equal(
      /supabase/i.test(source),
      false,
    );
    assert.equal(
      /providerInvoked\s*:\s*true/.test(
        source,
      ),
      false,
    );
    assert.equal(
      /draftGenerated\s*:\s*true/.test(
        source,
      ),
      false,
    );
  },
);

test(
  "NFAST-09 Stage 2 rejects invalid read limits and future cursors",
  async () => {
    const service =
      projectionServiceContract.create(
        createTimelineService(),
      );

    await assert.rejects(
      service.projectProspectTimeline(
        PROSPECT_REFERENCE,
        {
          asOf: AS_OF,
          maxEvents: 101,
        },
      ),
      error =>
        error.code ===
        "MAX_EVENTS_INVALID",
    );

    await assert.rejects(
      service.projectProspectTimeline(
        PROSPECT_REFERENCE,
        {
          asOf: AS_OF,
          before:
            "2026-07-26T00:00:00.000Z",
        },
      ),
      error =>
        error.code ===
        "BEFORE_AFTER_AS_OF",
    );
  },
);
