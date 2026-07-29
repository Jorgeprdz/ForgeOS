import test from "node:test";
import assert from "node:assert/strict";

import {
  PIPELINE_STAGE_CODES,
  PIPELINE_TRANSITION_SCHEMA_VERSION,
} from "../advisor-os/activity/application/pipeline-to-activity-projector.mjs";

import {
  PIPELINE_TRANSITION_PERIOD_MODEL_SCHEMA_VERSION,
  PIPELINE_TRANSITION_EXCLUSIONS_SCHEMA_VERSION,
  PipelineTransitionReadModelError,
  normalizePipelineTransitionPeriodModel,
} from "../advisor-os/pipeline/domain/pipeline-transition-read-model.mjs";

import {
  PIPELINE_REPORT_PROVIDER_SCHEMA_VERSION,
  PIPELINE_REPORT_DEFINITION_ID,
  PIPELINE_REPORT_DEFINITION_VERSION,
  PipelineReportProviderError,
  createPipelineReportProvider,
} from "../advisor-os/pipeline/reporting/pipeline-report-provider.mjs";

function transition(overrides = {}) {
  return {
    schemaVersion:
      "pipeline-transition.v1",
    eventId:
      "pipeline-event-001",
    organizationId:
      "organization-001",
    advisorId:
      "advisor-001",
    managerId:
      null,
    actorId:
      "advisor-001",
    prospectId:
      "prospect-001",
    opportunityId:
      "opportunity-001",
    appointmentId:
      "appointment-001",
    policyId:
      null,
    fromStage:
      "CONTACTED",
    toStage:
      "APPOINTMENT_SCHEDULED",
    evidence: [
      "APPOINTMENT_CONFIRMED",
    ],
    occurredAt:
      "2026-07-10T16:00:00.000Z",
    recordedAt:
      "2026-07-10T16:05:00.000Z",
    timeZone:
      "America/Mexico_City",
    metadata: {},
    ...overrides,
  };
}

function model({
  schemaVersion =
    "pipeline-transition-period-read-model.v1",
  sourceSchemaVersion =
    "prospect-timeline-transitions.v1",
  authority = {
    organizationId:
      "organization-001",
    advisorId:
      "advisor-001",
  },
  transitionDateFrom =
    "2026-07-01",
  transitionDateTo =
    "2026-07-31",
  asOf =
    "2026-07-31T18:00:00.000Z",
  transitions = [
    transition(),
    transition({
      eventId:
        "pipeline-event-002",
      prospectId:
        "prospect-002",
      opportunityId:
        "opportunity-002",
      appointmentId:
        null,
      policyId:
        "policy-002",
      fromStage:
        "APPLICATION",
      toStage:
        "ISSUED",
      evidence: [
        "POLICY_REFERENCE",
        "ISSUE_CONFIRMATION",
      ],
      occurredAt:
        "2026-07-20T18:00:00.000Z",
      recordedAt:
        "2026-07-20T18:10:00.000Z",
    }),
  ],
  exclusions = {
    futureRecorded:
      1,
    suppressed:
      2,
    unverified:
      3,
    total:
      6,
  },
} = {}) {
  return {
    schemaVersion,
    sourceSchemaVersion,
    authority,
    period: {
      transitionDateFrom,
      transitionDateTo,
      asOf,
    },
    transitions,
    exclusions,
  };
}

function runtime({
  schemaVersion =
    "pipeline-transition-read-runtime.v1",
  result =
    model(),
  maxDays =
    31,
  calls = [],
} = {}) {
  return {
    schemaVersion,
    maxDays,
    async readPeriod(query) {
      calls.push(query);
      return result;
    },
  };
}

function query(overrides = {}) {
  return {
    schemaVersion:
      "report-provider-slice-query.v1",
    queryKey:
      "pipeline-query-001",
    provider: {
      providerId:
        "pipeline",
      providerVersion:
        "pipeline-report-provider.v1",
      domain:
        "PIPELINE",
    },
    authority: {
      organizationId:
        "organization-001",
      principalId:
        "advisor-001",
    },
    period: {
      from:
        "2026-07-01",
      to:
        "2026-07-31",
      dayCount:
        31,
      inclusive:
        true,
    },
    timeZone:
      "America/Mexico_City",
    asOf:
      "2026-07-31T18:00:00.000Z",
    dimensions: [
      "transitionDate",
      "fromStage",
      "toStage",
      "hasAppointment",
      "hasPolicy",
    ],
    measures: [
      "transitionCount",
      "evidenceTokenCount",
      "appointmentLinkedTransitionCount",
      "policyLinkedTransitionCount",
    ],
    metadata: {},
    ...overrides,
  };
}

test("uses the canonical Pipeline transition schema", () => {
  assert.equal(
    PIPELINE_TRANSITION_SCHEMA_VERSION,
    "pipeline-transition.v1",
  );
});

test("uses thirteen canonical Pipeline stages", () => {
  assert.equal(
    PIPELINE_STAGE_CODES.length,
    13,
  );
});

test("exports period model schemas", () => {
  assert.equal(
    PIPELINE_TRANSITION_PERIOD_MODEL_SCHEMA_VERSION,
    "pipeline-transition-period-read-model.v1",
  );
  assert.equal(
    PIPELINE_TRANSITION_EXCLUSIONS_SCHEMA_VERSION,
    "pipeline-transition-exclusions.v1",
  );
});

test("normalizes an accepted transition model", () => {
  assert.equal(
    normalizePipelineTransitionPeriodModel(
      model(),
    ).schemaVersion,
    "pipeline-transition-period-read-model.v1",
  );
});

test("requires a plain model", () => {
  assert.throws(
    () =>
      normalizePipelineTransitionPeriodModel(
        [],
      ),
    PipelineTransitionReadModelError,
  );
});

test("rejects unsupported model schemas", () => {
  assert.throws(
    () =>
      normalizePipelineTransitionPeriodModel(
        model({
          schemaVersion:
            "pipeline-board.v1",
        }),
      ),
    /schemaVersion/u,
  );
});

test("rejects unknown model fields", () => {
  assert.throws(
    () =>
      normalizePipelineTransitionPeriodModel({
        ...model(),
        conversionRate:
          0.5,
      }),
    /unknown field/u,
  );
});

test("requires canonical authority identifiers", () => {
  assert.throws(
    () =>
      normalizePipelineTransitionPeriodModel(
        model({
          authority: {
            organizationId:
              "organization 001",
            advisorId:
              "advisor-001",
          },
        }),
      ),
    /canonical identifier/u,
  );
});

test("rejects reversed period dates", () => {
  assert.throws(
    () =>
      normalizePipelineTransitionPeriodModel(
        model({
          transitionDateFrom:
            "2026-08-01",
        }),
      ),
    /reversed/u,
  );
});

test("canonicalizes asOf", () => {
  assert.equal(
    normalizePipelineTransitionPeriodModel(
      model({
        asOf:
          "2026-07-31T12:00:00-06:00",
      }),
    ).period.asOf,
    "2026-07-31T18:00:00.000Z",
  );
});

test("requires transitions to be an array", () => {
  assert.throws(
    () =>
      normalizePipelineTransitionPeriodModel({
        ...model(),
        transitions:
          null,
      }),
    /array/u,
  );
});

test("rejects invalid transition schemas", () => {
  assert.throws(
    () =>
      normalizePipelineTransitionPeriodModel(
        model({
          transitions: [
            transition({
              schemaVersion:
                "pipeline-transition.v2",
            }),
          ],
        }),
      ),
    /invalid/u,
  );
});

test("rejects unknown Pipeline stages", () => {
  assert.throws(
    () =>
      normalizePipelineTransitionPeriodModel(
        model({
          transitions: [
            transition({
              toStage:
                "MAYBE",
            }),
          ],
        }),
      ),
    /invalid/u,
  );
});

test("rejects transitions without stage movement", () => {
  assert.throws(
    () =>
      normalizePipelineTransitionPeriodModel(
        model({
          transitions: [
            transition({
              fromStage:
                "CONTACTED",
              toStage:
                "CONTACTED",
            }),
          ],
        }),
      ),
    /invalid/u,
  );
});

test("rejects transition authority drift", () => {
  assert.throws(
    () =>
      normalizePipelineTransitionPeriodModel(
        model({
          transitions: [
            transition({
              advisorId:
                "advisor-002",
            }),
          ],
        }),
      ),
    /authority drifted/u,
  );
});

test("rejects transitions recorded after asOf", () => {
  assert.throws(
    () =>
      normalizePipelineTransitionPeriodModel(
        model({
          asOf:
            "2026-07-10T16:01:00.000Z",
          transitions: [
            transition(),
          ],
        }),
      ),
    /after asOf/u,
  );
});

test("derives transitionDate in the event time zone", () => {
  assert.equal(
    normalizePipelineTransitionPeriodModel(
      model({
        transitionDateFrom:
          "2026-07-09",
        transitionDateTo:
          "2026-07-09",
        transitions: [
          transition({
            occurredAt:
              "2026-07-10T03:00:00.000Z",
            recordedAt:
              "2026-07-10T03:05:00.000Z",
          }),
        ],
      }),
    ).transitions[0].transitionDate,
    "2026-07-09",
  );
});

test("rejects transitions outside the local-date period", () => {
  assert.throws(
    () =>
      normalizePipelineTransitionPeriodModel(
        model({
          transitionDateFrom:
            "2026-07-11",
          transitions: [
            transition(),
          ],
        }),
      ),
    /outside period/u,
  );
});

test("rejects duplicate event ids", () => {
  assert.throws(
    () =>
      normalizePipelineTransitionPeriodModel(
        model({
          transitions: [
            transition(),
            transition(),
          ],
        }),
      ),
    /duplicate eventId/u,
  );
});

test("sorts transitions deterministically", () => {
  const input =
    model();
  input.transitions =
    [...input.transitions].reverse();

  assert.equal(
    normalizePipelineTransitionPeriodModel(
      input,
    ).transitions[0].eventId,
    "pipeline-event-001",
  );
});

test("requires exclusion totals to reconcile", () => {
  assert.throws(
    () =>
      normalizePipelineTransitionPeriodModel(
        model({
          exclusions: {
            futureRecorded:
              1,
            suppressed:
              2,
            unverified:
              3,
            total:
              5,
          },
        }),
      ),
    /must equal/u,
  );
});

test("creates deterministic model keys", () => {
  assert.equal(
    normalizePipelineTransitionPeriodModel(
      model(),
    ).modelKey,
    normalizePipelineTransitionPeriodModel(
      model(),
    ).modelKey,
  );
});

test("models are deeply immutable", () => {
  const value =
    normalizePipelineTransitionPeriodModel(
      model(),
    );

  assert.equal(
    Object.isFrozen(value),
    true,
  );
  assert.equal(
    Object.isFrozen(value.transitions),
    true,
  );
  assert.equal(
    Object.isFrozen(value.transitions[0]),
    true,
  );
});

test("models publish the canonical stage vocabulary", () => {
  assert.deepEqual(
    normalizePipelineTransitionPeriodModel(
      model(),
    ).stageVocabulary,
    PIPELINE_STAGE_CODES,
  );
});

test("models claim no current-stage snapshot authority", () => {
  assert.equal(
    normalizePipelineTransitionPeriodModel(
      model(),
    ).boundary.currentStageSnapshotAuthority,
    false,
  );
});

test("models claim no conversion or forecast authority", () => {
  const boundary =
    normalizePipelineTransitionPeriodModel(
      model(),
    ).boundary;

  assert.equal(
    boundary.conversionRateAuthority,
    false,
  );
  assert.equal(
    boundary.forecastAuthority,
    false,
  );
});

test("exports provider schemas", () => {
  assert.equal(
    PIPELINE_REPORT_PROVIDER_SCHEMA_VERSION,
    "pipeline-report-provider.v1",
  );
  assert.equal(
    PIPELINE_REPORT_DEFINITION_ID,
    "pipeline-transitions",
  );
  assert.equal(
    PIPELINE_REPORT_DEFINITION_VERSION,
    "pipeline-transitions.v1",
  );
});

test("requires an accepted Pipeline runtime", () => {
  assert.throws(
    () =>
      createPipelineReportProvider({
        readRuntime: {},
      }),
    PipelineReportProviderError,
  );
});

test("accepts transition runtime schema", () => {
  assert.equal(
    createPipelineReportProvider({
      readRuntime:
        runtime(),
    }).schemaVersion,
    "pipeline-report-provider.v1",
  );
});

test("accepts timeline composition schema", () => {
  assert.equal(
    createPipelineReportProvider({
      readRuntime:
        runtime({
          schemaVersion:
            "pipeline-timeline-read-composition.v1",
        }),
    }).port.contract.descriptor.providerId,
    "pipeline",
  );
});

test("uses runtime maxDays by default", () => {
  assert.equal(
    createPipelineReportProvider({
      readRuntime:
        runtime({
          maxDays:
            45,
        }),
    }).port.contract.slicePolicy.maxSliceDays,
    45,
  );
});

test("supports explicit maxSliceDays", () => {
  assert.equal(
    createPipelineReportProvider({
      readRuntime:
        runtime(),
      maxSliceDays:
        14,
    }).port.contract.slicePolicy.maxSliceDays,
    14,
  );
});

test("rejects invalid maxSliceDays", () => {
  assert.throws(
    () =>
      createPipelineReportProvider({
        readRuntime:
          runtime(),
        maxSliceDays:
          0,
      }),
    /positive integer/u,
  );
});

test("declares contiguous date batching", () => {
  assert.equal(
    createPipelineReportProvider({
      readRuntime:
        runtime(),
    }).port.contract.slicePolicy.batchingMode,
    "CONTIGUOUS_DATE_RANGES",
  );
});

test("publishes non-empty capabilities", () => {
  assert.equal(
    createPipelineReportProvider({
      readRuntime:
        runtime(),
    }).port.contract.descriptor.capabilities.length,
    4,
  );
});

test("publishes canonical dimensions", () => {
  assert.deepEqual(
    createPipelineReportProvider({
      readRuntime:
        runtime(),
    }).definition.dimensions,
    [
      "transitionDate",
      "fromStage",
      "toStage",
      "hasAppointment",
      "hasPolicy",
    ],
  );
});

test("publishes additive measures", () => {
  const value =
    createPipelineReportProvider({
      readRuntime:
        runtime(),
    });

  assert.deepEqual(
    value.definition.measures,
    [
      "transitionCount",
      "evidenceTokenCount",
      "appointmentLinkedTransitionCount",
      "policyLinkedTransitionCount",
    ],
  );

  assert.equal(
    value.port.contract.measures.every(
      (measure) =>
        measure.aggregation ===
        "SUM",
    ),
    true,
  );
});

test("forwards exact period and asOf", async () => {
  const calls = [];

  await createPipelineReportProvider({
    readRuntime:
      runtime({
        calls,
      }),
  }).port.readSlice(
    query(),
  );

  assert.deepEqual(
    calls[0],
    {
      transitionDateFrom:
        "2026-07-01",
      transitionDateTo:
        "2026-07-31",
      asOf:
        "2026-07-31T18:00:00.000Z",
    },
  );
});

test("maps one row per transition", async () => {
  const value =
    await createPipelineReportProvider({
      readRuntime:
        runtime(),
    }).port.readSlice(
      query(),
    );

  assert.equal(
    value.rows.length,
    2,
  );
});

test("maps stage movement dimensions", async () => {
  const value =
    await createPipelineReportProvider({
      readRuntime:
        runtime(),
    }).port.readSlice(
      query(),
    );

  assert.deepEqual(
    value.rows[0].dimensions,
    {
      transitionDate:
        "2026-07-10",
      fromStage:
        "CONTACTED",
      toStage:
        "APPOINTMENT_SCHEDULED",
      hasAppointment:
        true,
      hasPolicy:
        false,
    },
  );
});

test("maps transition and evidence counts", async () => {
  const value =
    await createPipelineReportProvider({
      readRuntime:
        runtime(),
    }).port.readSlice(
      query(),
    );

  assert.deepEqual(
    value.rows[0].measures,
    {
      transitionCount:
        1,
      evidenceTokenCount:
        1,
      appointmentLinkedTransitionCount:
        1,
      policyLinkedTransitionCount:
        0,
    },
  );
});

test("maps policy linkage facts", async () => {
  const value =
    await createPipelineReportProvider({
      readRuntime:
        runtime(),
    }).port.readSlice(
      query(),
    );

  assert.deepEqual(
    value.rows[1].measures,
    {
      transitionCount:
        1,
      evidenceTokenCount:
        2,
      appointmentLinkedTransitionCount:
        0,
      policyLinkedTransitionCount:
        1,
    },
  );
});

test("respects selected dimensions", async () => {
  const value =
    await createPipelineReportProvider({
      readRuntime:
        runtime(),
    }).port.readSlice(
      query({
        dimensions: [
          "fromStage",
          "toStage",
        ],
      }),
    );

  assert.deepEqual(
    value.rows[0].dimensions,
    {
      fromStage:
        "CONTACTED",
      toStage:
        "APPOINTMENT_SCHEDULED",
    },
  );
});

test("respects selected measures", async () => {
  const value =
    await createPipelineReportProvider({
      readRuntime:
        runtime(),
    }).port.readSlice(
      query({
        measures: [
          "transitionCount",
        ],
      }),
    );

  assert.deepEqual(
    value.rows[0].measures,
    {
      transitionCount:
        1,
    },
  );
});

test("maps governed exclusions", async () => {
  const value =
    await createPipelineReportProvider({
      readRuntime:
        runtime(),
    }).port.readSlice(
      query(),
    );

  assert.deepEqual(
    value.exclusions,
    [
      {
        code:
          "FUTURE_RECORDED",
        count:
          1,
      },
      {
        code:
          "SUPPRESSED",
        count:
          2,
      },
      {
        code:
          "UNVERIFIED",
        count:
          3,
      },
    ],
  );
});

test("preserves Pipeline provenance", async () => {
  const value =
    await createPipelineReportProvider({
      readRuntime:
        runtime(),
    }).port.readSlice(
      query(),
    );

  assert.deepEqual(
    value.provenance[0],
    {
      sourceId:
        "pipeline-transition-read-runtime",
      sourceVersion:
        "prospect-timeline-transitions.v1",
      authority:
        "ACCEPTED_PIPELINE_TRANSITION_FACTS",
    },
  );
});

test("rejects period coverage drift", async () => {
  await assert.rejects(
    () =>
      createPipelineReportProvider({
        readRuntime:
          runtime({
            result:
              model({
                transitionDateFrom:
                  "2026-06-01",
              }),
          }),
      }).port.readSlice(
        query(),
      ),
    /coverage/u,
  );
});

test("rejects asOf drift", async () => {
  await assert.rejects(
    () =>
      createPipelineReportProvider({
        readRuntime:
          runtime({
            result:
              model({
                asOf:
                  "2026-07-31T19:00:00.000Z",
              }),
          }),
      }).port.readSlice(
        query(),
      ),
    /asOf/u,
  );
});

test("supports empty accepted periods", async () => {
  const value =
    await createPipelineReportProvider({
      readRuntime:
        runtime({
          result:
            model({
              transitions:
                [],
            }),
        }),
    }).port.readSlice(
      query(),
    );

  assert.deepEqual(
    value.rows,
    [],
  );
});

test("defaults to transition movement dimensions", () => {
  assert.deepEqual(
    createPipelineReportProvider({
      readRuntime:
        runtime(),
    }).definition.defaultDimensions,
    [
      "transitionDate",
      "fromStage",
      "toStage",
    ],
  );
});

test("defaults to transition count only", () => {
  assert.deepEqual(
    createPipelineReportProvider({
      readRuntime:
        runtime(),
    }).definition.defaultMeasures,
    [
      "transitionCount",
    ],
  );
});

test("does not claim stage mutation authority", () => {
  assert.equal(
    createPipelineReportProvider({
      readRuntime:
        runtime(),
    }).boundary.pipelineStageMutationAuthority,
    false,
  );
});

test("does not claim current-stage snapshot authority", () => {
  assert.equal(
    createPipelineReportProvider({
      readRuntime:
        runtime(),
    }).boundary.currentStageSnapshotAuthority,
    false,
  );
});

test("does not claim conversion or forecast authority", () => {
  const boundary =
    createPipelineReportProvider({
      readRuntime:
        runtime(),
    }).boundary;

  assert.equal(
    boundary.conversionRateAuthority,
    false,
  );
  assert.equal(
    boundary.forecastAuthority,
    false,
  );
});

test("does not claim scoring or Activity projection", () => {
  const boundary =
    createPipelineReportProvider({
      readRuntime:
        runtime(),
    }).boundary;

  assert.equal(
    boundary.scoringAuthority,
    false,
  );
  assert.equal(
    boundary.activityProjectionAuthority,
    false,
  );
});

test("provider and definition are deeply immutable", () => {
  const value =
    createPipelineReportProvider({
      readRuntime:
        runtime(),
    });

  assert.equal(
    Object.isFrozen(value),
    true,
  );
  assert.equal(
    Object.isFrozen(value.definition),
    true,
  );
  assert.equal(
    Object.isFrozen(value.port),
    true,
  );
});

test("exposes no mutation forecast score export or UI methods", () => {
  const value =
    createPipelineReportProvider({
      readRuntime:
        runtime(),
    });

  for (const name of [
    "moveStage",
    "updateStage",
    "calculateConversion",
    "forecast",
    "score",
    "projectActivity",
    "persist",
    "export",
    "render",
    "rank",
  ]) {
    assert.equal(
      name in value,
      false,
    );
  }
});
