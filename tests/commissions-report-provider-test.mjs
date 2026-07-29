import test from "node:test";
import assert from "node:assert/strict";

import {
  COMMISSION_REPORT_PERIOD_MODEL_SCHEMA_VERSION,
  COMMISSION_REPORT_ENTRY_SCHEMA_VERSION,
  COMMISSION_REPORT_EXCLUSIONS_SCHEMA_VERSION,
  COMMISSION_REPORT_KINDS,
  CommissionReportReadModelError,
  normalizeCommissionReportPeriodModel,
} from "../advisor-os/commissions/domain/commission-report-read-model.mjs";

import {
  COMMISSIONS_REPORT_PROVIDER_SCHEMA_VERSION,
  COMMISSIONS_REPORT_DEFINITION_ID,
  COMMISSIONS_REPORT_DEFINITION_VERSION,
  CommissionsReportProviderError,
  createCommissionsReportProvider,
} from "../advisor-os/commissions/reporting/commissions-report-provider.mjs";

function model({
  schemaVersion =
    "commission-report-period-read-model.v1",
  sourceSchemaVersion =
    "accepted-commission-ledger.v1",
  authority = {
    organizationId:
      "organization-001",
    advisorId:
      "advisor-001",
  },
  effectiveDateFrom =
    "2026-07-01",
  effectiveDateTo =
    "2026-07-31",
  asOf =
    "2026-07-31T18:00:00.000Z",
  entries = [
    {
      effectiveDate:
        "2026-07-10",
      commissionKind:
        "INITIAL",
      productPlan:
        "Imagina Ser",
      paymentFrequency:
        "Mensual",
      policyYear:
        1,
      commissionAmount:
        3500,
      premiumAmount:
        120000,
      points:
        2,
      policyCount:
        1,
    },
    {
      effectiveDate:
        "2026-07-20",
      commissionKind:
        "RENEWAL",
      productPlan:
        "Alfa Medical Flex",
      paymentFrequency:
        "Anual",
      policyYear:
        2,
      commissionAmount:
        2100,
      premiumAmount:
        80000,
      points:
        0,
      policyCount:
        1,
    },
  ],
  exclusions = {
    futureEffective:
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
      effectiveDateFrom,
      effectiveDateTo,
      asOf,
    },
    entries,
    exclusions,
  };
}

function runtime({
  schemaVersion =
    "commission-report-read-runtime.v1",
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
      "query-001",
    provider: {
      providerId:
        "commissions",
      providerVersion:
        "commissions-report-provider.v1",
      domain:
        "COMMISSIONS",
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
      "effectiveDate",
      "commissionKind",
      "productPlan",
      "paymentFrequency",
      "policyYear",
    ],
    measures: [
      "commissionAmount",
      "premiumAmount",
      "points",
      "policyCount",
    ],
    metadata: {},
    ...overrides,
  };
}

test("exports commission read schemas", () => {
  assert.equal(
    COMMISSION_REPORT_PERIOD_MODEL_SCHEMA_VERSION,
    "commission-report-period-read-model.v1",
  );
  assert.equal(
    COMMISSION_REPORT_ENTRY_SCHEMA_VERSION,
    "commission-report-entry.v1",
  );
  assert.equal(
    COMMISSION_REPORT_EXCLUSIONS_SCHEMA_VERSION,
    "commission-report-exclusions.v1",
  );
});

test("exports canonical commission kinds", () => {
  assert.deepEqual(
    COMMISSION_REPORT_KINDS,
    [
      "INITIAL",
      "RENEWAL",
    ],
  );
});

test("normalizes an accepted period model", () => {
  assert.equal(
    normalizeCommissionReportPeriodModel(
      model(),
    ).schemaVersion,
    "commission-report-period-read-model.v1",
  );
});

test("requires a plain read model", () => {
  assert.throws(
    () =>
      normalizeCommissionReportPeriodModel(
        [],
      ),
    CommissionReportReadModelError,
  );
});

test("rejects an unsupported read model schema", () => {
  assert.throws(
    () =>
      normalizeCommissionReportPeriodModel(
        model({
          schemaVersion:
            "legacy-commission-result.v1",
        }),
      ),
    /schemaVersion/u,
  );
});

test("rejects unknown model fields", () => {
  assert.throws(
    () =>
      normalizeCommissionReportPeriodModel({
        ...model(),
        uiLabel:
          "Comisiones",
      }),
    /unknown field/u,
  );
});

test("requires canonical authority identifiers", () => {
  assert.throws(
    () =>
      normalizeCommissionReportPeriodModel(
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
      normalizeCommissionReportPeriodModel(
        model({
          effectiveDateFrom:
            "2026-08-01",
        }),
      ),
    /reversed/u,
  );
});

test("canonicalizes asOf", () => {
  assert.equal(
    normalizeCommissionReportPeriodModel(
      model({
        asOf:
          "2026-07-31T12:00:00-06:00",
      }),
    ).period.asOf,
    "2026-07-31T18:00:00.000Z",
  );
});

test("requires entries to be an array", () => {
  assert.throws(
    () =>
      normalizeCommissionReportPeriodModel({
        ...model(),
        entries:
          null,
      }),
    /array/u,
  );
});

test("rejects unsupported commission kinds", () => {
  assert.throws(
    () =>
      normalizeCommissionReportPeriodModel(
        model({
          entries: [
            {
              ...model().entries[0],
              commissionKind:
                "BONUS",
            },
          ],
        }),
      ),
    /commissionKind/u,
  );
});

test("rejects entries outside the period", () => {
  assert.throws(
    () =>
      normalizeCommissionReportPeriodModel(
        model({
          entries: [
            {
              ...model().entries[0],
              effectiveDate:
                "2026-08-01",
            },
          ],
        }),
      ),
    /outside period/u,
  );
});

test("rejects negative commission amounts", () => {
  assert.throws(
    () =>
      normalizeCommissionReportPeriodModel(
        model({
          entries: [
            {
              ...model().entries[0],
              commissionAmount:
                -1,
            },
          ],
        }),
      ),
    /non-negative/u,
  );
});

test("rejects negative premium amounts", () => {
  assert.throws(
    () =>
      normalizeCommissionReportPeriodModel(
        model({
          entries: [
            {
              ...model().entries[0],
              premiumAmount:
                -1,
            },
          ],
        }),
      ),
    /non-negative/u,
  );
});

test("rejects negative points", () => {
  assert.throws(
    () =>
      normalizeCommissionReportPeriodModel(
        model({
          entries: [
            {
              ...model().entries[0],
              points:
                -1,
            },
          ],
        }),
      ),
    /non-negative/u,
  );
});

test("requires a positive policy year", () => {
  assert.throws(
    () =>
      normalizeCommissionReportPeriodModel(
        model({
          entries: [
            {
              ...model().entries[0],
              policyYear:
                0,
            },
          ],
        }),
      ),
    /positive integer/u,
  );
});

test("requires a positive policy count", () => {
  assert.throws(
    () =>
      normalizeCommissionReportPeriodModel(
        model({
          entries: [
            {
              ...model().entries[0],
              policyCount:
                0,
            },
          ],
        }),
      ),
    /positive integer/u,
  );
});

test("requires exclusion totals to reconcile", () => {
  assert.throws(
    () =>
      normalizeCommissionReportPeriodModel(
        model({
          exclusions: {
            futureEffective:
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

test("sorts accepted entries deterministically", () => {
  const input =
    model();
  input.entries =
    [...input.entries].reverse();

  assert.equal(
    normalizeCommissionReportPeriodModel(
      input,
    ).entries[0].effectiveDate,
    "2026-07-10",
  );
});

test("creates deterministic read model keys", () => {
  const left =
    normalizeCommissionReportPeriodModel(
      model(),
    );
  const right =
    normalizeCommissionReportPeriodModel(
      model(),
    );

  assert.equal(
    left.modelKey,
    right.modelKey,
  );
});

test("read models are deeply immutable", () => {
  const value =
    normalizeCommissionReportPeriodModel(
      model(),
    );

  assert.equal(
    Object.isFrozen(value),
    true,
  );
  assert.equal(
    Object.isFrozen(value.entries),
    true,
  );
  assert.equal(
    Object.isFrozen(value.entries[0]),
    true,
  );
});

test("read models claim no commission calculation authority", () => {
  assert.equal(
    normalizeCommissionReportPeriodModel(
      model(),
    ).boundary.commissionCalculationAuthority,
    false,
  );
});

test("exports provider schemas", () => {
  assert.equal(
    COMMISSIONS_REPORT_PROVIDER_SCHEMA_VERSION,
    "commissions-report-provider.v1",
  );
  assert.equal(
    COMMISSIONS_REPORT_DEFINITION_ID,
    "commissions-ledger",
  );
  assert.equal(
    COMMISSIONS_REPORT_DEFINITION_VERSION,
    "commissions-ledger.v1",
  );
});

test("requires an accepted commission read runtime", () => {
  assert.throws(
    () =>
      createCommissionsReportProvider({
        readRuntime: {},
      }),
    CommissionsReportProviderError,
  );
});

test("accepts the commission read runtime schema", () => {
  assert.equal(
    createCommissionsReportProvider({
      readRuntime:
        runtime(),
    }).schemaVersion,
    "commissions-report-provider.v1",
  );
});

test("accepts a commission ledger composition schema", () => {
  assert.equal(
    createCommissionsReportProvider({
      readRuntime:
        runtime({
          schemaVersion:
            "commission-ledger-read-composition.v1",
        }),
    }).port.contract.descriptor.providerId,
    "commissions",
  );
});

test("uses runtime maxDays by default", () => {
  assert.equal(
    createCommissionsReportProvider({
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
    createCommissionsReportProvider({
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
      createCommissionsReportProvider({
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
    createCommissionsReportProvider({
      readRuntime:
        runtime(),
    }).port.contract.slicePolicy.batchingMode,
    "CONTIGUOUS_DATE_RANGES",
  );
});

test("declares non-empty provider capabilities", () => {
  assert.equal(
    createCommissionsReportProvider({
      readRuntime:
        runtime(),
    }).port.contract.descriptor.capabilities.length,
    4,
  );
});

test("publishes canonical dimensions", () => {
  assert.deepEqual(
    createCommissionsReportProvider({
      readRuntime:
        runtime(),
    }).definition.dimensions,
    [
      "effectiveDate",
      "commissionKind",
      "productPlan",
      "paymentFrequency",
      "policyYear",
    ],
  );
});

test("publishes canonical measures", () => {
  assert.deepEqual(
    createCommissionsReportProvider({
      readRuntime:
        runtime(),
    }).definition.measures,
    [
      "commissionAmount",
      "premiumAmount",
      "points",
      "policyCount",
    ],
  );
});

test("uses SUM semantics for all measures", () => {
  assert.equal(
    createCommissionsReportProvider({
      readRuntime:
        runtime(),
    }).port.contract.measures.every(
      (item) =>
        item.aggregation ===
        "SUM",
    ),
    true,
  );
});

test("forwards exact period and snapshot", async () => {
  const calls = [];

  await createCommissionsReportProvider({
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
      effectiveDateFrom:
        "2026-07-01",
      effectiveDateTo:
        "2026-07-31",
      asOf:
        "2026-07-31T18:00:00.000Z",
    },
  );
});

test("maps one row per accepted ledger entry", async () => {
  const value =
    await createCommissionsReportProvider({
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

test("maps accepted commission dimensions", async () => {
  const value =
    await createCommissionsReportProvider({
      readRuntime:
        runtime(),
    }).port.readSlice(
      query(),
    );

  assert.deepEqual(
    value.rows[0].dimensions,
    {
      effectiveDate:
        "2026-07-10",
      commissionKind:
        "INITIAL",
      productPlan:
        "Imagina Ser",
      paymentFrequency:
        "Mensual",
      policyYear:
        1,
    },
  );
});

test("maps measures without recalculation", async () => {
  const value =
    await createCommissionsReportProvider({
      readRuntime:
        runtime(),
    }).port.readSlice(
      query(),
    );

  assert.deepEqual(
    value.rows[0].measures,
    {
      commissionAmount:
        3500,
      premiumAmount:
        120000,
      points:
        2,
      policyCount:
        1,
    },
  );
});

test("respects selected dimensions", async () => {
  const value =
    await createCommissionsReportProvider({
      readRuntime:
        runtime(),
    }).port.readSlice(
      query({
        dimensions: [
          "commissionKind",
        ],
      }),
    );

  assert.deepEqual(
    value.rows[0].dimensions,
    {
      commissionKind:
        "INITIAL",
    },
  );
});

test("respects selected measures", async () => {
  const value =
    await createCommissionsReportProvider({
      readRuntime:
        runtime(),
    }).port.readSlice(
      query({
        measures: [
          "commissionAmount",
        ],
      }),
    );

  assert.deepEqual(
    value.rows[0].measures,
    {
      commissionAmount:
        3500,
    },
  );
});

test("maps governed exclusions", async () => {
  const value =
    await createCommissionsReportProvider({
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
          "FUTURE_EFFECTIVE",
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

test("preserves accepted ledger provenance", async () => {
  const value =
    await createCommissionsReportProvider({
      readRuntime:
        runtime(),
    }).port.readSlice(
      query(),
    );

  assert.deepEqual(
    value.provenance[0],
    {
      sourceId:
        "commission-ledger-read-runtime",
      sourceVersion:
        "accepted-commission-ledger.v1",
      authority:
        "ACCEPTED_COMMISSION_LEDGER",
    },
  );
});

test("rejects coverage drift", async () => {
  await assert.rejects(
    () =>
      createCommissionsReportProvider({
        readRuntime:
          runtime({
            result:
              model({
                effectiveDateFrom:
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
      createCommissionsReportProvider({
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
    await createCommissionsReportProvider({
      readRuntime:
        runtime({
          result:
            model({
              entries:
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

test("defaults to date and kind grouping", () => {
  assert.deepEqual(
    createCommissionsReportProvider({
      readRuntime:
        runtime(),
    }).definition.defaultDimensions,
    [
      "effectiveDate",
      "commissionKind",
    ],
  );
});

test("does not claim legacy engine authority", () => {
  const boundary =
    createCommissionsReportProvider({
      readRuntime:
        runtime(),
    }).boundary;

  assert.equal(
    boundary.legacyCommissionEngineAuthority,
    false,
  );
  assert.equal(
    boundary.legacyZeroSkeletonAuthority,
    false,
  );
});

test("does not claim rate or bonus calculation authority", () => {
  const boundary =
    createCommissionsReportProvider({
      readRuntime:
        runtime(),
    }).boundary;

  assert.equal(
    boundary.commissionRateAuthority,
    false,
  );
  assert.equal(
    boundary.bonusCalculationAuthority,
    false,
  );
});

test("provider and definition are deeply immutable", () => {
  const value =
    createCommissionsReportProvider({
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

test("exposes no calculation export UI or persistence methods", () => {
  const value =
    createCommissionsReportProvider({
      readRuntime:
        runtime(),
    });

  for (const name of [
    "calculate",
    "calculateBonus",
    "calculateRate",
    "export",
    "render",
    "persist",
    "append",
    "rank",
  ]) {
    assert.equal(
      name in value,
      false,
    );
  }
});
