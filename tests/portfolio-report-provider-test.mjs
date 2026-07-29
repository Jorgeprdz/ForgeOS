import test from "node:test";
import assert from "node:assert/strict";

import {
  PORTFOLIO_POLICY_PERIOD_MODEL_SCHEMA_VERSION,
  PORTFOLIO_POLICY_ENTRY_SCHEMA_VERSION,
  PORTFOLIO_POLICY_EXCLUSIONS_SCHEMA_VERSION,
  PORTFOLIO_POLICY_SCOPES,
  PortfolioPolicyReadModelError,
  normalizePortfolioPolicyPeriodModel,
} from "../advisor-os/portfolio/domain/portfolio-policy-read-model.mjs";

import {
  PORTFOLIO_REPORT_PROVIDER_SCHEMA_VERSION,
  PORTFOLIO_REPORT_DEFINITION_ID,
  PORTFOLIO_REPORT_DEFINITION_VERSION,
  PortfolioReportProviderError,
  createPortfolioReportProvider,
} from "../advisor-os/portfolio/reporting/portfolio-report-provider.mjs";

function model({
  schemaVersion =
    "portfolio-policy-period-read-model.v1",
  sourceSchemaVersion =
    "accepted-portfolio-policy-facts.v1",
  authority = {
    organizationId:
      "organization-001",
    advisorId:
      "advisor-001",
  },
  emissionDateFrom =
    "2026-07-01",
  emissionDateTo =
    "2026-07-31",
  asOf =
    "2026-07-31T18:00:00.000Z",
  policies = [
    {
      emissionDate:
        "2026-07-10",
      policyStatus:
        "vigente",
      productPlan:
        "Imagina Ser",
      productVariant:
        "15 Pagos",
      currency:
        "MXN",
      paymentFrequency:
        "Mensual",
      collectionChannel:
        "Tarjeta",
      policyScope:
        "CLIENT",
      premiumAmount:
        120000,
      sumAssuredAmount:
        2500000,
    },
    {
      emissionDate:
        "2026-07-20",
      policyStatus:
        "vigente",
      productPlan:
        "Alfa Medical Flex",
      productVariant:
        null,
      currency:
        "MXN",
      paymentFrequency:
        "Anual",
      collectionChannel:
        null,
      policyScope:
        "PERSONAL",
      premiumAmount:
        80000,
      sumAssuredAmount:
        5000000,
    },
  ],
  exclusions = {
    futureEmission:
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
      emissionDateFrom,
      emissionDateTo,
      asOf,
    },
    policies,
    exclusions,
  };
}

function runtime({
  schemaVersion =
    "portfolio-report-read-runtime.v1",
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
      "query-portfolio-001",
    provider: {
      providerId:
        "portfolio",
      providerVersion:
        "portfolio-report-provider.v1",
      domain:
        "PORTFOLIO",
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
      "emissionDate",
      "policyStatus",
      "productPlan",
      "productVariant",
      "currency",
      "paymentFrequency",
      "collectionChannel",
      "policyScope",
    ],
    measures: [
      "premiumAmount",
      "sumAssuredAmount",
      "policyCount",
    ],
    metadata: {},
    ...overrides,
  };
}

test("exports portfolio read schemas", () => {
  assert.equal(
    PORTFOLIO_POLICY_PERIOD_MODEL_SCHEMA_VERSION,
    "portfolio-policy-period-read-model.v1",
  );
  assert.equal(
    PORTFOLIO_POLICY_ENTRY_SCHEMA_VERSION,
    "portfolio-policy-entry.v1",
  );
  assert.equal(
    PORTFOLIO_POLICY_EXCLUSIONS_SCHEMA_VERSION,
    "portfolio-policy-exclusions.v1",
  );
});

test("exports canonical policy scopes", () => {
  assert.deepEqual(
    PORTFOLIO_POLICY_SCOPES,
    [
      "CLIENT",
      "PERSONAL",
    ],
  );
});

test("normalizes an accepted portfolio model", () => {
  assert.equal(
    normalizePortfolioPolicyPeriodModel(
      model(),
    ).schemaVersion,
    "portfolio-policy-period-read-model.v1",
  );
});

test("requires a plain portfolio model", () => {
  assert.throws(
    () =>
      normalizePortfolioPolicyPeriodModel(
        [],
      ),
    PortfolioPolicyReadModelError,
  );
});

test("rejects unsupported model schemas", () => {
  assert.throws(
    () =>
      normalizePortfolioPolicyPeriodModel(
        model({
          schemaVersion:
            "cartera-ui-state.v1",
        }),
      ),
    /schemaVersion/u,
  );
});

test("rejects unknown model fields", () => {
  assert.throws(
    () =>
      normalizePortfolioPolicyPeriodModel({
        ...model(),
        clientes:
          [],
      }),
    /unknown field/u,
  );
});

test("requires canonical authority identifiers", () => {
  assert.throws(
    () =>
      normalizePortfolioPolicyPeriodModel(
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
      normalizePortfolioPolicyPeriodModel(
        model({
          emissionDateFrom:
            "2026-08-01",
        }),
      ),
    /reversed/u,
  );
});

test("canonicalizes the asOf instant", () => {
  assert.equal(
    normalizePortfolioPolicyPeriodModel(
      model({
        asOf:
          "2026-07-31T12:00:00-06:00",
      }),
    ).period.asOf,
    "2026-07-31T18:00:00.000Z",
  );
});

test("requires policies to be an array", () => {
  assert.throws(
    () =>
      normalizePortfolioPolicyPeriodModel({
        ...model(),
        policies:
          null,
      }),
    /array/u,
  );
});

test("rejects policy emission outside period", () => {
  assert.throws(
    () =>
      normalizePortfolioPolicyPeriodModel(
        model({
          policies: [
            {
              ...model().policies[0],
              emissionDate:
                "2026-08-01",
            },
          ],
        }),
      ),
    /outside period/u,
  );
});

test("rejects unsupported policy scopes", () => {
  assert.throws(
    () =>
      normalizePortfolioPolicyPeriodModel(
        model({
          policies: [
            {
              ...model().policies[0],
              policyScope:
                "UNKNOWN",
            },
          ],
        }),
      ),
    /policyScope/u,
  );
});

test("requires a policy status", () => {
  assert.throws(
    () =>
      normalizePortfolioPolicyPeriodModel(
        model({
          policies: [
            {
              ...model().policies[0],
              policyStatus:
                "",
            },
          ],
        }),
      ),
    /non-empty string/u,
  );
});

test("requires a product plan", () => {
  assert.throws(
    () =>
      normalizePortfolioPolicyPeriodModel(
        model({
          policies: [
            {
              ...model().policies[0],
              productPlan:
                "",
            },
          ],
        }),
      ),
    /non-empty string/u,
  );
});

test("accepts nullable product variants", () => {
  assert.equal(
    normalizePortfolioPolicyPeriodModel(
      model(),
    ).policies[1].productVariant,
    null,
  );
});

test("canonicalizes currency to uppercase", () => {
  assert.equal(
    normalizePortfolioPolicyPeriodModel(
      model({
        policies: [
          {
            ...model().policies[0],
            currency:
              "mxn",
          },
        ],
      }),
    ).policies[0].currency,
    "MXN",
  );
});

test("rejects invalid currency codes", () => {
  assert.throws(
    () =>
      normalizePortfolioPolicyPeriodModel(
        model({
          policies: [
            {
              ...model().policies[0],
              currency:
                "PESOS",
            },
          ],
        }),
      ),
    /ISO 4217/u,
  );
});

test("accepts nullable payment frequency", () => {
  assert.equal(
    normalizePortfolioPolicyPeriodModel(
      model({
        policies: [
          {
            ...model().policies[0],
            paymentFrequency:
              "",
          },
        ],
      }),
    ).policies[0].paymentFrequency,
    null,
  );
});

test("accepts nullable collection channel", () => {
  assert.equal(
    normalizePortfolioPolicyPeriodModel(
      model(),
    ).policies[1].collectionChannel,
    null,
  );
});

test("rejects negative premium amounts", () => {
  assert.throws(
    () =>
      normalizePortfolioPolicyPeriodModel(
        model({
          policies: [
            {
              ...model().policies[0],
              premiumAmount:
                -1,
            },
          ],
        }),
      ),
    /non-negative/u,
  );
});

test("rejects negative sum assured amounts", () => {
  assert.throws(
    () =>
      normalizePortfolioPolicyPeriodModel(
        model({
          policies: [
            {
              ...model().policies[0],
              sumAssuredAmount:
                -1,
            },
          ],
        }),
      ),
    /non-negative/u,
  );
});

test("requires exclusion totals to reconcile", () => {
  assert.throws(
    () =>
      normalizePortfolioPolicyPeriodModel(
        model({
          exclusions: {
            futureEmission:
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

test("sorts policies deterministically", () => {
  const input =
    model();
  input.policies =
    [...input.policies].reverse();

  assert.equal(
    normalizePortfolioPolicyPeriodModel(
      input,
    ).policies[0].emissionDate,
    "2026-07-10",
  );
});

test("creates deterministic portfolio model keys", () => {
  assert.equal(
    normalizePortfolioPolicyPeriodModel(
      model(),
    ).modelKey,
    normalizePortfolioPolicyPeriodModel(
      model(),
    ).modelKey,
  );
});

test("portfolio models are deeply immutable", () => {
  const value =
    normalizePortfolioPolicyPeriodModel(
      model(),
    );

  assert.equal(
    Object.isFrozen(value),
    true,
  );
  assert.equal(
    Object.isFrozen(value.policies),
    true,
  );
  assert.equal(
    Object.isFrozen(value.policies[0]),
    true,
  );
});

test("portfolio models claim no mutation authority", () => {
  assert.equal(
    normalizePortfolioPolicyPeriodModel(
      model(),
    ).boundary.portfolioMutationAuthority,
    false,
  );
});

test("portfolio models claim no renewal derivation authority", () => {
  assert.equal(
    normalizePortfolioPolicyPeriodModel(
      model(),
    ).boundary.renewalDerivationAuthority,
    false,
  );
});

test("exports provider schemas", () => {
  assert.equal(
    PORTFOLIO_REPORT_PROVIDER_SCHEMA_VERSION,
    "portfolio-report-provider.v1",
  );
  assert.equal(
    PORTFOLIO_REPORT_DEFINITION_ID,
    "portfolio-policy-issuance",
  );
  assert.equal(
    PORTFOLIO_REPORT_DEFINITION_VERSION,
    "portfolio-policy-issuance.v1",
  );
});

test("requires an accepted portfolio runtime", () => {
  assert.throws(
    () =>
      createPortfolioReportProvider({
        readRuntime: {},
      }),
    PortfolioReportProviderError,
  );
});

test("accepts the portfolio runtime schema", () => {
  assert.equal(
    createPortfolioReportProvider({
      readRuntime:
        runtime(),
    }).schemaVersion,
    "portfolio-report-provider.v1",
  );
});

test("accepts the portfolio composition schema", () => {
  assert.equal(
    createPortfolioReportProvider({
      readRuntime:
        runtime({
          schemaVersion:
            "portfolio-policy-read-composition.v1",
        }),
    }).port.contract.descriptor.providerId,
    "portfolio",
  );
});

test("uses runtime maxDays by default", () => {
  assert.equal(
    createPortfolioReportProvider({
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
    createPortfolioReportProvider({
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
      createPortfolioReportProvider({
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
    createPortfolioReportProvider({
      readRuntime:
        runtime(),
    }).port.contract.slicePolicy.batchingMode,
    "CONTIGUOUS_DATE_RANGES",
  );
});

test("declares non-empty capabilities", () => {
  assert.equal(
    createPortfolioReportProvider({
      readRuntime:
        runtime(),
    }).port.contract.descriptor.capabilities.length,
    4,
  );
});

test("publishes canonical dimensions", () => {
  assert.deepEqual(
    createPortfolioReportProvider({
      readRuntime:
        runtime(),
    }).definition.dimensions,
    [
      "emissionDate",
      "policyStatus",
      "productPlan",
      "productVariant",
      "currency",
      "paymentFrequency",
      "collectionChannel",
      "policyScope",
    ],
  );
});

test("publishes canonical measures", () => {
  assert.deepEqual(
    createPortfolioReportProvider({
      readRuntime:
        runtime(),
    }).definition.measures,
    [
      "premiumAmount",
      "sumAssuredAmount",
      "policyCount",
    ],
  );
});

test("uses SUM semantics for every measure", () => {
  assert.equal(
    createPortfolioReportProvider({
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

test("requires currency grouping for premium", async () => {
  await assert.rejects(
    () =>
      createPortfolioReportProvider({
        readRuntime:
          runtime(),
      }).port.readSlice(
        query({
          dimensions: [
            "emissionDate",
          ],
          measures: [
            "premiumAmount",
          ],
        }),
      ),
    /currency dimension/u,
  );
});

test("requires currency grouping for sum assured", async () => {
  await assert.rejects(
    () =>
      createPortfolioReportProvider({
        readRuntime:
          runtime(),
      }).port.readSlice(
        query({
          dimensions: [
            "policyStatus",
          ],
          measures: [
            "sumAssuredAmount",
          ],
        }),
      ),
    /currency dimension/u,
  );
});

test("allows policy count without currency grouping", async () => {
  const value =
    await createPortfolioReportProvider({
      readRuntime:
        runtime(),
    }).port.readSlice(
      query({
        dimensions: [
          "policyStatus",
        ],
        measures: [
          "policyCount",
        ],
      }),
    );

  assert.equal(
    value.rows.length,
    2,
  );
});

test("forwards exact period and snapshot", async () => {
  const calls = [];

  await createPortfolioReportProvider({
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
      emissionDateFrom:
        "2026-07-01",
      emissionDateTo:
        "2026-07-31",
      asOf:
        "2026-07-31T18:00:00.000Z",
    },
  );
});

test("maps one row per accepted policy", async () => {
  const value =
    await createPortfolioReportProvider({
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

test("maps accepted portfolio dimensions", async () => {
  const value =
    await createPortfolioReportProvider({
      readRuntime:
        runtime(),
    }).port.readSlice(
      query(),
    );

  assert.deepEqual(
    value.rows[0].dimensions,
    {
      emissionDate:
        "2026-07-10",
      policyStatus:
        "vigente",
      productPlan:
        "Imagina Ser",
      productVariant:
        "15 Pagos",
      currency:
        "MXN",
      paymentFrequency:
        "Mensual",
      collectionChannel:
        "Tarjeta",
      policyScope:
        "CLIENT",
    },
  );
});

test("maps monetary facts without recalculation", async () => {
  const value =
    await createPortfolioReportProvider({
      readRuntime:
        runtime(),
    }).port.readSlice(
      query(),
    );

  assert.deepEqual(
    value.rows[0].measures,
    {
      premiumAmount:
        120000,
      sumAssuredAmount:
        2500000,
      policyCount:
        1,
    },
  );
});

test("respects selected dimensions", async () => {
  const value =
    await createPortfolioReportProvider({
      readRuntime:
        runtime(),
    }).port.readSlice(
      query({
        dimensions: [
          "currency",
          "policyStatus",
        ],
      }),
    );

  assert.deepEqual(
    value.rows[0].dimensions,
    {
      currency:
        "MXN",
      policyStatus:
        "vigente",
    },
  );
});

test("respects selected measures", async () => {
  const value =
    await createPortfolioReportProvider({
      readRuntime:
        runtime(),
    }).port.readSlice(
      query({
        measures: [
          "policyCount",
        ],
      }),
    );

  assert.deepEqual(
    value.rows[0].measures,
    {
      policyCount:
        1,
    },
  );
});

test("maps governed exclusions", async () => {
  const value =
    await createPortfolioReportProvider({
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
          "FUTURE_EMISSION",
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

test("preserves portfolio provenance", async () => {
  const value =
    await createPortfolioReportProvider({
      readRuntime:
        runtime(),
    }).port.readSlice(
      query(),
    );

  assert.deepEqual(
    value.provenance[0],
    {
      sourceId:
        "portfolio-policy-read-runtime",
      sourceVersion:
        "accepted-portfolio-policy-facts.v1",
      authority:
        "ACCEPTED_PORTFOLIO_POLICY_FACTS",
    },
  );
});

test("rejects coverage drift", async () => {
  await assert.rejects(
    () =>
      createPortfolioReportProvider({
        readRuntime:
          runtime({
            result:
              model({
                emissionDateFrom:
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
      createPortfolioReportProvider({
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
    await createPortfolioReportProvider({
      readRuntime:
        runtime({
          result:
            model({
              policies:
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

test("defaults to emission status and currency grouping", () => {
  assert.deepEqual(
    createPortfolioReportProvider({
      readRuntime:
        runtime(),
    }).definition.defaultDimensions,
    [
      "emissionDate",
      "policyStatus",
      "currency",
    ],
  );
});

test("does not claim mutation or status derivation authority", () => {
  const boundary =
    createPortfolioReportProvider({
      readRuntime:
        runtime(),
    }).boundary;

  assert.equal(
    boundary.portfolioMutationAuthority,
    false,
  );
  assert.equal(
    boundary.policyStatusDerivationAuthority,
    false,
  );
});

test("does not claim renewal or FX authority", () => {
  const boundary =
    createPortfolioReportProvider({
      readRuntime:
        runtime(),
    }).boundary;

  assert.equal(
    boundary.renewalDerivationAuthority,
    false,
  );
  assert.equal(
    boundary.foreignExchangeAuthority,
    false,
  );
});

test("does not expose client PII", () => {
  const value =
    createPortfolioReportProvider({
      readRuntime:
        runtime(),
    });

  assert.equal(
    value.definition.dimensions.includes(
      "clientName",
    ),
    false,
  );
  assert.equal(
    value.definition.dimensions.includes(
      "policyNumber",
    ),
    false,
  );
});

test("provider and definition are deeply immutable", () => {
  const value =
    createPortfolioReportProvider({
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

test("exposes no mutation calculation export or UI methods", () => {
  const value =
    createPortfolioReportProvider({
      readRuntime:
        runtime(),
    });

  for (const name of [
    "create",
    "update",
    "delete",
    "calculate",
    "deriveRenewal",
    "convertCurrency",
    "export",
    "render",
    "persist",
    "rank",
  ]) {
    assert.equal(
      name in value,
      false,
    );
  }
});
