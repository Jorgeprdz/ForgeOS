import test from "node:test";
import assert from "node:assert/strict";

import {
  REPORT_DEFINITION_SCHEMA_VERSION,
  ReportDefinitionError,
  createReportDefinition,
} from "../advisor-os/reporting/domain/report-definition.mjs";

import {
  REPORT_DIMENSION_CAPABILITY_SCHEMA_VERSION,
  REPORT_MEASURE_CAPABILITY_SCHEMA_VERSION,
  REPORT_PROVIDER_CONTRACT_SCHEMA_VERSION,
  REPORT_PROVIDER_PORT_SCHEMA_VERSION,
  REPORT_PROVIDER_SLICE_QUERY_SCHEMA_VERSION,
  REPORT_PROVIDER_SLICE_SCHEMA_VERSION,
  ReportProviderPortError,
  createReportProviderPort,
} from "../advisor-os/reporting/application/report-provider-port.mjs";

import {
  REPORT_PROVIDER_EXECUTION_PLAN_SCHEMA_VERSION,
  REPORT_PROVIDER_RUNTIME_SCHEMA_VERSION,
  ReportProviderRuntimeError,
  createReportProviderRuntime,
} from "../advisor-os/reporting/runtime/report-provider-runtime.mjs";

import {
  createUniversalReportingKernel,
} from "../advisor-os/reporting/runtime/universal-reporting-kernel.mjs";

import {
  createUniversalPeriodResolver,
} from "../advisor-os/reporting/runtime/universal-period-resolver.mjs";

function definition(
  overrides = {},
) {
  return {
    definitionId:
      "performance-summary",
    definitionVersion:
      "performance-summary.v1",
    providerId:
      "performance",
    dimensions: [
      "activityType",
      "evaluationDate",
    ],
    measures: [
      "points",
      "target",
    ],
    defaultDimensions: [
      "evaluationDate",
    ],
    defaultMeasures: [
      "points",
      "target",
    ],
    ...overrides,
  };
}

function provider({
  readSlice,
  maxSliceDays = 31,
  batchingMode =
    "CONTIGUOUS_DATE_RANGES",
  dimensions,
  measures,
} = {}) {
  return createReportProviderPort({
    descriptor: {
      providerId:
        "performance",
      providerVersion:
        "performance-report-provider.v1",
      domain:
        "PERFORMANCE",
      capabilities: [
        "POINTS",
        "TARGET",
        "ACTIVITY_MIX",
      ],
    },
    dimensions:
      dimensions ?? [
        {
          dimensionId:
            "activityType",
          valueKind:
            "STRING",
          nullable: false,
        },
        {
          dimensionId:
            "evaluationDate",
          valueKind:
            "DATE",
          nullable: false,
        },
      ],
    measures:
      measures ?? [
        {
          measureId:
            "points",
          valueKind:
            "NUMBER",
          unit:
            "POINTS",
          aggregation:
            "SUM",
          nullable: false,
        },
        {
          measureId:
            "target",
          valueKind:
            "NUMBER",
          unit:
            "POINTS",
          aggregation:
            "SUM",
          nullable: false,
        },
      ],
    maxSliceDays,
    batchingMode,
    readSlice:
      readSlice ??
      (async (query) => ({
        rows: [
          {
            dimensions:
              Object.fromEntries(
                query.dimensions.map(
                  (dimensionId) => [
                    dimensionId,
                    dimensionId ===
                      "evaluationDate"
                      ? "2026-07-28"
                      : "POLICY_PAID",
                  ],
                ),
              ),
            measures:
              Object.fromEntries(
                query.measures.map(
                  (measureId) => [
                    measureId,
                    measureId ===
                      "points"
                      ? 10
                      : 25,
                  ],
                ),
              ),
          },
        ],
        exclusions: [
          {
            code:
              "SUPPRESSED",
            count: 0,
          },
        ],
        provenance: [
          {
            sourceId:
              "performance-read-runtime",
            sourceVersion:
              "performance-read-runtime.v1",
            authority:
              "PERFORMANCE",
          },
        ],
      })),
  });
}

function runtime(
  options = {},
) {
  return createReportProviderRuntime({
    providers:
      options.providers ?? [
        provider(
          options.providerOptions,
        ),
      ],
    definitions:
      options.definitions ?? [
        definition(),
      ],
  });
}

function resolvedRequest({
  kind =
    "CUSTOM_RANGE",
  parameters = {
    from:
      "2026-07-01",
    to:
      "2026-07-28",
  },
  dimensions = [
    "activityType",
  ],
  measures = [
    "points",
  ],
  definitionId =
    "performance-summary",
  providerId =
    "performance",
  providerVersion =
    "performance-report-provider.v1",
} = {}) {
  const kernel =
    createUniversalReportingKernel({
      authority: {
        organizationId:
          "organization-001",
        principalId:
          "advisor-001",
      },
      providers: [
        {
          providerId,
          providerVersion,
          domain:
            "PERFORMANCE",
          capabilities: [
            "POINTS",
          ],
        },
      ],
      clock: () =>
        "2026-07-28T18:00:00.000Z",
    });
  const request =
    kernel.createRequest({
      definitionId,
      providerId,
      period: {
        kind,
        parameters,
      },
      timeZone:
        "America/Mexico_City",
      asOf:
        "2026-07-28T18:00:00.000Z",
      dimensions,
      measures,
      metadata: {},
    });

  return createUniversalPeriodResolver()
    .resolveRequest(
      request,
    );
}

test(
  "exports definition, port, query, slice and runtime schemas",
  () => {
    assert.equal(
      REPORT_DEFINITION_SCHEMA_VERSION,
      "report-definition.v1",
    );
    assert.equal(
      REPORT_PROVIDER_PORT_SCHEMA_VERSION,
      "report-provider-port.v1",
    );
    assert.equal(
      REPORT_PROVIDER_CONTRACT_SCHEMA_VERSION,
      "report-provider-contract.v1",
    );
    assert.equal(
      REPORT_DIMENSION_CAPABILITY_SCHEMA_VERSION,
      "report-dimension-capability.v1",
    );
    assert.equal(
      REPORT_MEASURE_CAPABILITY_SCHEMA_VERSION,
      "report-measure-capability.v1",
    );
    assert.equal(
      REPORT_PROVIDER_SLICE_QUERY_SCHEMA_VERSION,
      "report-provider-slice-query.v1",
    );
    assert.equal(
      REPORT_PROVIDER_SLICE_SCHEMA_VERSION,
      "report-provider-slice.v1",
    );
    assert.equal(
      REPORT_PROVIDER_RUNTIME_SCHEMA_VERSION,
      "report-provider-runtime.v1",
    );
    assert.equal(
      REPORT_PROVIDER_EXECUTION_PLAN_SCHEMA_VERSION,
      "report-provider-execution-plan.v1",
    );
  },
);

test(
  "creates an immutable report definition",
  () => {
    const value =
      createReportDefinition(
        definition(),
      );

    assert.equal(
      value.providerId,
      "performance",
    );
    assert.equal(
      Object.isFrozen(value),
      true,
    );
  },
);

test(
  "requires at least one measure in a definition",
  () => {
    assert.throws(
      () =>
        createReportDefinition(
          definition({
            measures: [],
          }),
        ),
      ReportDefinitionError,
    );
  },
);

test(
  "requires at least one default measure",
  () => {
    assert.throws(
      () =>
        createReportDefinition(
          definition({
            defaultMeasures: [],
          }),
        ),
      /must not be empty/u,
    );
  },
);

test(
  "rejects default dimensions outside the definition",
  () => {
    assert.throws(
      () =>
        createReportDefinition(
          definition({
            defaultDimensions: [
              "product",
            ],
          }),
        ),
      /unsupported identifier product/u,
    );
  },
);

test(
  "normalizes definition sets deterministically",
  () => {
    const value =
      createReportDefinition(
        definition({
          dimensions: [
            "evaluationDate",
            "activityType",
            "activityType",
          ],
          measures: [
            "target",
            "points",
            "points",
          ],
        }),
      );

    assert.deepEqual(
      value.dimensions,
      [
        "activityType",
        "evaluationDate",
      ],
    );
    assert.deepEqual(
      value.measures,
      [
        "points",
        "target",
      ],
    );
  },
);

test(
  "creates a provider port with declared capabilities",
  () => {
    const value =
      provider();

    assert.equal(
      value.schemaVersion,
      "report-provider-port.v1",
    );
    assert.equal(
      value.contract
        .slicePolicy
        .maxSliceDays,
      31,
    );
    assert.equal(
      value.contract
        .slicePolicy
        .batchingSupported,
      true,
    );
  },
);

test(
  "rejects duplicate provider dimensions",
  () => {
    assert.throws(
      () =>
        provider({
          dimensions: [
            {
              dimensionId:
                "activityType",
              valueKind:
                "STRING",
              nullable: false,
            },
            {
              dimensionId:
                "activityType",
              valueKind:
                "STRING",
              nullable: false,
            },
          ],
        }),
      /duplicate activityType/u,
    );
  },
);

test(
  "rejects duplicate provider measures",
  () => {
    assert.throws(
      () =>
        provider({
          measures: [
            {
              measureId:
                "points",
              valueKind:
                "NUMBER",
              unit:
                "POINTS",
              aggregation:
                "SUM",
              nullable: false,
            },
            {
              measureId:
                "points",
              valueKind:
                "NUMBER",
              unit:
                "POINTS",
              aggregation:
                "SUM",
              nullable: false,
            },
          ],
        }),
      /duplicate points/u,
    );
  },
);

test(
  "requires a positive max slice length",
  () => {
    assert.throws(
      () =>
        provider({
          maxSliceDays: 0,
        }),
      /positive integer/u,
    );
  },
);

test(
  "requires a provider readSlice function",
  () => {
    assert.throws(
      () =>
        createReportProviderPort({
          descriptor: {
            providerId:
              "performance",
            providerVersion:
              "performance.v1",
            domain:
              "PERFORMANCE",
            capabilities: [
              "POINTS",
            ],
          },
          dimensions: [],
          measures: [
            {
              measureId:
                "points",
              valueKind:
                "NUMBER",
              unit:
                "POINTS",
              aggregation:
                "SUM",
              nullable: false,
            },
          ],
          maxSliceDays: 31,
          batchingMode:
            "NONE",
        }),
      /readSlice must be a function/u,
    );
  },
);

test(
  "registers provider and definition ids",
  () => {
    const value =
      runtime();

    assert.deepEqual(
      value.registry,
      {
        providerIds: [
          "performance",
        ],
        definitionIds: [
          "performance-summary",
        ],
      },
    );
  },
);

test(
  "rejects duplicate provider ids",
  () => {
    assert.throws(
      () =>
        runtime({
          providers: [
            provider(),
            provider(),
          ],
        }),
      /duplicate providerId performance/u,
    );
  },
);

test(
  "rejects duplicate definition ids",
  () => {
    assert.throws(
      () =>
        runtime({
          definitions: [
            definition(),
            definition(),
          ],
        }),
      /duplicate definitionId performance-summary/u,
    );
  },
);

test(
  "rejects a definition without a provider",
  () => {
    assert.throws(
      () =>
        runtime({
          providers: [],
        }),
      /unregistered provider/u,
    );
  },
);

test(
  "rejects definition dimensions unsupported by provider",
  () => {
    assert.throws(
      () =>
        runtime({
          definitions: [
            definition({
              dimensions: [
                "product",
              ],
              defaultDimensions: [],
            }),
          ],
        }),
      /unsupported identifier product/u,
    );
  },
);

test(
  "gets registered providers and definitions",
  () => {
    const value =
      runtime();

    assert.equal(
      value.getProvider(
        "performance",
      ).schemaVersion,
      "report-provider-port.v1",
    );
    assert.equal(
      value.getDefinition(
        "performance-summary",
      ).schemaVersion,
      "report-definition.v1",
    );
    assert.equal(
      value.getProvider(
        "portfolio",
      ),
      null,
    );
  },
);

test(
  "creates a direct execution plan",
  () => {
    const value =
      runtime().createPlan(
        resolvedRequest(),
      );

    assert.equal(
      value.schemaVersion,
      "report-provider-execution-plan.v1",
    );
    assert.equal(
      value.executionMode,
      "DIRECT",
    );
    assert.equal(
      value.status,
      "READY_FOR_PROVIDER_READ",
    );
  },
);

test(
  "uses definition defaults when request selections are empty",
  () => {
    const value =
      runtime().createPlan(
        resolvedRequest({
          dimensions: [],
          measures: [],
        }),
      );

    assert.deepEqual(
      value.query.dimensions,
      [
        "evaluationDate",
      ],
    );
    assert.deepEqual(
      value.query.measures,
      [
        "points",
        "target",
      ],
    );
  },
);

test(
  "rejects request dimensions outside the definition",
  () => {
    assert.throws(
      () =>
        runtime().createPlan(
          resolvedRequest({
            dimensions: [
              "product",
            ],
          }),
        ),
      /unsupported identifier product/u,
    );
  },
);

test(
  "rejects a missing report definition",
  () => {
    assert.throws(
      () =>
        runtime().createPlan(
          resolvedRequest({
            definitionId:
              "missing-definition",
          }),
        ),
      /unregistered definition/u,
    );
  },
);

test(
  "rejects provider version drift",
  () => {
    assert.throws(
      () =>
        runtime().createPlan(
          resolvedRequest({
            providerVersion:
              "performance-report-provider.v2",
          }),
        ),
      /provider version does not match/u,
    );
  },
);

test(
  "marks a long range as batching required",
  () => {
    const value =
      runtime().createPlan(
        resolvedRequest({
          kind:
            "YEAR_TO_DATE",
          parameters: {},
        }),
      );

    assert.equal(
      value.executionMode,
      "BATCHING_REQUIRED",
    );
    assert.equal(
      value.status,
      "BATCHING_REQUIRED_REP_04",
    );
  },
);

test(
  "rejects long range when provider cannot batch",
  () => {
    assert.throws(
      () =>
        runtime({
          providers: [
            provider({
              batchingMode:
                "NONE",
            }),
          ],
        }).createPlan(
          resolvedRequest({
            kind:
              "YEAR_TO_DATE",
            parameters: {},
          }),
        ),
      /does not support batching/u,
    );
  },
);

test(
  "does not execute a batching-required plan",
  async () => {
    await assert.rejects(
      () =>
        runtime().readSlice(
          resolvedRequest({
            kind:
              "YEAR_TO_DATE",
            parameters: {},
          }),
        ),
      /requires REP-04 batching/u,
    );
  },
);

test(
  "passes exact resolved period and snapshot to provider",
  async () => {
    const calls = [];
    const value =
      runtime({
        providers: [
          provider({
            readSlice:
              async (query) => {
                calls.push(query);

                return {
                  rows: [
                    {
                      dimensions: {
                        activityType:
                          "POLICY_PAID",
                      },
                      measures: {
                        points: 10,
                      },
                    },
                  ],
                  exclusions: [],
                  provenance: [
                    {
                      sourceId:
                        "performance",
                      sourceVersion:
                        "performance.v1",
                      authority:
                        "PERFORMANCE",
                    },
                  ],
                };
              },
          }),
        ],
      });

    await value.readSlice(
      resolvedRequest(),
    );

    assert.equal(
      calls.length,
      1,
    );
    assert.equal(
      calls[0].period.from,
      "2026-07-01",
    );
    assert.equal(
      calls[0].period.to,
      "2026-07-28",
    );
    assert.equal(
      calls[0].asOf,
      "2026-07-28T18:00:00.000Z",
    );
  },
);

test(
  "returns a normalized provider slice",
  async () => {
    const value =
      await runtime().readSlice(
        resolvedRequest(),
      );

    assert.equal(
      value.schemaVersion,
      "report-provider-slice.v1",
    );
    assert.equal(
      value.status,
      "PROVIDER_SLICE_READ",
    );
    assert.equal(
      value.rows[0]
        .measures
        .points,
      10,
    );
  },
);

test(
  "creates deterministic query and slice keys",
  async () => {
    const source =
      resolvedRequest();
    const system =
      runtime();
    const firstPlan =
      system.createPlan(
        source,
      );
    const secondPlan =
      system.createPlan(
        source,
      );
    const firstSlice =
      await system.readSlice(
        source,
      );
    const secondSlice =
      await system.readSlice(
        source,
      );

    assert.equal(
      firstPlan.query.queryKey,
      secondPlan.query.queryKey,
    );
    assert.equal(
      firstSlice.sliceKey,
      secondSlice.sliceKey,
    );
  },
);

test(
  "rejects provider rows with unknown dimensions",
  async () => {
    await assert.rejects(
      () =>
        runtime({
          providerOptions: {
            readSlice:
              async () => ({
                rows: [
                  {
                    dimensions: {
                      activityType:
                        "POLICY_PAID",
                      product:
                        "ORVI",
                    },
                    measures: {
                      points: 10,
                    },
                  },
                ],
                exclusions: [],
                provenance: [
                  {
                    sourceId:
                      "performance",
                    sourceVersion:
                      "performance.v1",
                    authority:
                      "PERFORMANCE",
                  },
                ],
              }),
          },
        }).readSlice(
          resolvedRequest(),
        ),
      /unknown field product/u,
    );
  },
);

test(
  "rejects provider rows with unknown measures",
  async () => {
    await assert.rejects(
      () =>
        runtime({
          providerOptions: {
            readSlice:
              async () => ({
                rows: [
                  {
                    dimensions: {
                      activityType:
                        "POLICY_PAID",
                    },
                    measures: {
                      points: 10,
                      commission: 100,
                    },
                  },
                ],
                exclusions: [],
                provenance: [
                  {
                    sourceId:
                      "performance",
                    sourceVersion:
                      "performance.v1",
                    authority:
                      "PERFORMANCE",
                  },
                ],
              }),
          },
        }).readSlice(
          resolvedRequest(),
        ),
      /unknown field commission/u,
    );
  },
);

test(
  "rejects a missing non-nullable dimension",
  async () => {
    await assert.rejects(
      () =>
        runtime({
          providerOptions: {
            readSlice:
              async () => ({
                rows: [
                  {
                    dimensions: {},
                    measures: {
                      points: 10,
                    },
                  },
                ],
                exclusions: [],
                provenance: [
                  {
                    sourceId:
                      "performance",
                    sourceVersion:
                      "performance.v1",
                    authority:
                      "PERFORMANCE",
                  },
                ],
              }),
          },
        }).readSlice(
          resolvedRequest(),
        ),
      /missing dimension activityType/u,
    );
  },
);

test(
  "fills a missing nullable dimension with null",
  async () => {
    const system =
      runtime({
        providers: [
          provider({
            dimensions: [
              {
                dimensionId:
                  "activityType",
                valueKind:
                  "STRING",
                nullable: true,
              },
              {
                dimensionId:
                  "evaluationDate",
                valueKind:
                  "DATE",
                nullable: false,
              },
            ],
            readSlice:
              async () => ({
                rows: [
                  {
                    dimensions: {},
                    measures: {
                      points: 10,
                    },
                  },
                ],
                exclusions: [],
                provenance: [
                  {
                    sourceId:
                      "performance",
                    sourceVersion:
                      "performance.v1",
                    authority:
                      "PERFORMANCE",
                  },
                ],
              }),
          }),
        ],
      });
    const value =
      await system.readSlice(
        resolvedRequest(),
      );

    assert.equal(
      value.rows[0]
        .dimensions
        .activityType,
      null,
    );
  },
);

test(
  "rejects a measure with the wrong value kind",
  async () => {
    await assert.rejects(
      () =>
        runtime({
          providerOptions: {
            readSlice:
              async () => ({
                rows: [
                  {
                    dimensions: {
                      activityType:
                        "POLICY_PAID",
                    },
                    measures: {
                      points:
                        "ten",
                    },
                  },
                ],
                exclusions: [],
                provenance: [
                  {
                    sourceId:
                      "performance",
                    sourceVersion:
                      "performance.v1",
                    authority:
                      "PERFORMANCE",
                  },
                ],
              }),
          },
        }).readSlice(
          resolvedRequest(),
        ),
      /finite number/u,
    );
  },
);

test(
  "preserves exclusions",
  async () => {
    const value =
      await runtime({
        providerOptions: {
          readSlice:
            async () => ({
              rows: [
                {
                  dimensions: {
                    activityType:
                      "POLICY_PAID",
                  },
                  measures: {
                    points: 10,
                  },
                },
              ],
              exclusions: [
                {
                  code:
                    "SUPPRESSED",
                  count: 3,
                },
              ],
              provenance: [
                {
                  sourceId:
                    "performance",
                  sourceVersion:
                    "performance.v1",
                  authority:
                    "PERFORMANCE",
                },
              ],
            }),
        },
      }).readSlice(
        resolvedRequest(),
      );

    assert.deepEqual(
      value.exclusions,
      [
        {
          code:
            "SUPPRESSED",
          count: 3,
        },
      ],
    );
  },
);

test(
  "requires provider provenance",
  async () => {
    await assert.rejects(
      () =>
        runtime({
          providerOptions: {
            readSlice:
              async () => ({
                rows: [],
                exclusions: [],
                provenance: [],
              }),
          },
        }).readSlice(
          resolvedRequest(),
        ),
      /non-empty array/u,
    );
  },
);

test(
  "preserves provider authority without granting universal authority",
  async () => {
    const value =
      await runtime().readSlice(
        resolvedRequest(),
      );

    assert.deepEqual(
      value.authority,
      {
        domainTruthAuthority:
          true,
        periodResolutionAuthority:
          false,
        universalAggregationAuthority:
          false,
        comparisonAuthority:
          false,
        exportAuthority:
          false,
        uiAuthority:
          false,
        persistenceMutationAuthority:
          false,
      },
    );
  },
);

test(
  "propagates provider read failures",
  async () => {
    const failure =
      new Error("offline");

    await assert.rejects(
      () =>
        runtime({
          providerOptions: {
            readSlice:
              async () => {
                throw failure;
              },
          },
        }).readSlice(
          resolvedRequest(),
        ),
      failure,
    );
  },
);

test(
  "returns deeply immutable plans and slices",
  async () => {
    const system =
      runtime();
    const source =
      resolvedRequest();
    const plan =
      system.createPlan(
        source,
      );
    const slice =
      await system.readSlice(
        source,
      );

    assert.equal(
      Object.isFrozen(plan),
      true,
    );
    assert.equal(
      Object.isFrozen(
        plan.query,
      ),
      true,
    );
    assert.equal(
      Object.isFrozen(slice),
      true,
    );
    assert.equal(
      Object.isFrozen(
        slice.rows,
      ),
      true,
    );
  },
);

test(
  "exposes provider execution but no aggregation or comparison",
  () => {
    const value =
      runtime();

    assert.equal(
      value.boundary
        .providerExecutionAuthorized,
      true,
    );

    for (const name of [
      "aggregate",
      "compare",
      "export",
      "render",
      "persist",
      "resolvePeriod",
    ]) {
      assert.equal(
        name in value,
        false,
      );
    }
  },
);
