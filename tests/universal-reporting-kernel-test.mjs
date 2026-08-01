import test from "node:test";
import assert from "node:assert/strict";

import {
  REPORT_PERIOD_INPUT_SCHEMA_VERSION,
  REPORT_PROVIDER_DESCRIPTOR_SCHEMA_VERSION,
  REPORTING_AUTHORITY_BINDING_SCHEMA_VERSION,
  UNIVERSAL_REPORT_REQUEST_SCHEMA_VERSION,
  UNIVERSAL_REPORTING_KERNEL_CAPABILITIES,
  UNIVERSAL_REPORTING_KERNEL_SCHEMA_VERSION,
  UniversalReportingContractError,
} from "../advisor-os/reporting/domain/reporting-kernel-contract.mjs";

import {
  UniversalReportingKernelError,
  createUniversalReportingKernel,
} from "../advisor-os/reporting/runtime/universal-reporting-kernel.mjs";

function provider({
  providerId =
    "performance",
  providerVersion =
    "performance-report-provider.v1",
  domain =
    "PERFORMANCE",
  capabilities = [
    "POINTS",
    "ACTIVITY_MIX",
  ],
} = {}) {
  return {
    providerId,
    providerVersion,
    domain,
    capabilities,
  };
}

function kernel({
  providers = [
    provider(),
  ],
  authority = {
    organizationId:
      "organization-001",
    principalId:
      "advisor-001",
  },
  clock = () =>
    "2026-07-28T18:00:00-06:00",
} = {}) {
  return createUniversalReportingKernel({
    authority,
    providers,
    clock,
  });
}

function request(overrides = {}) {
  return {
    definitionId:
      "performance-summary",
    providerId:
      "performance",
    period: {
      kind:
        "YEAR_TO_DATE",
      parameters: {},
    },
    timeZone:
      "America/Mexico_City",
    dimensions: [
      "activityType",
    ],
    measures: [
      "points",
      "target",
    ],
    metadata: {
      source:
        "advisor-dashboard",
    },
    ...overrides,
  };
}

test(
  "exports kernel contract versions and capabilities",
  () => {
    assert.equal(
      UNIVERSAL_REPORTING_KERNEL_SCHEMA_VERSION,
      "universal-reporting-kernel.v1",
    );
    assert.equal(
      REPORTING_AUTHORITY_BINDING_SCHEMA_VERSION,
      "reporting-authority-binding.v1",
    );
    assert.equal(
      REPORT_PROVIDER_DESCRIPTOR_SCHEMA_VERSION,
      "report-provider-descriptor.v1",
    );
    assert.equal(
      UNIVERSAL_REPORT_REQUEST_SCHEMA_VERSION,
      "universal-report-request.v1",
    );
    assert.equal(
      REPORT_PERIOD_INPUT_SCHEMA_VERSION,
      "report-period-input.v1",
    );
    assert.deepEqual(
      UNIVERSAL_REPORTING_KERNEL_CAPABILITIES,
      [
        "REPORT_REQUEST_IDENTITY",
        "PROVIDER_REGISTRY",
        "CANONICAL_AS_OF",
        "DETERMINISTIC_REQUEST_KEY",
        "AUTHORITY_BINDING",
      ],
    );
  },
);

test(
  "requires a plain kernel input",
  () => {
    assert.throws(
      () =>
        createUniversalReportingKernel(),
      UniversalReportingContractError,
    );
  },
);

test(
  "rejects unknown kernel input fields",
  () => {
    assert.throws(
      () =>
        createUniversalReportingKernel({
          authority: {
            organizationId:
              "organization-001",
            principalId:
              "advisor-001",
          },
          providers: [],
          database:
            "forbidden",
        }),
      /unknown field database/u,
    );
  },
);

test(
  "binds reporting authority once",
  () => {
    const value = kernel();

    assert.deepEqual(
      value.authority,
      {
        schemaVersion:
          "reporting-authority-binding.v1",
        organizationId:
          "organization-001",
        principalId:
          "advisor-001",
        scope:
          "ORGANIZATION",
        reportingAuthority:
          true,
        domainTruthAuthority:
          false,
        uiAuthority:
          false,
        persistenceAuthority:
          false,
      },
    );
  },
);

test(
  "requires a providers array",
  () => {
    assert.throws(
      () =>
        createUniversalReportingKernel({
          authority: {
            organizationId:
              "organization-001",
            principalId:
              "advisor-001",
          },
          providers: null,
        }),
      UniversalReportingKernelError,
    );
  },
);

test(
  "rejects duplicate provider identifiers",
  () => {
    assert.throws(
      () =>
        kernel({
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
  "sorts and exposes immutable provider descriptors",
  () => {
    const value =
      kernel({
        providers: [
          provider({
            providerId:
              "portfolio",
            providerVersion:
              "portfolio.v1",
            domain:
              "PORTFOLIO",
            capabilities: [
              "PREMIUM",
            ],
          }),
          provider(),
        ],
      });

    assert.deepEqual(
      value.providerRegistry.providerIds,
      [
        "performance",
        "portfolio",
      ],
    );
    assert.equal(
      Object.isFrozen(
        value.listProviders(),
      ),
      true,
    );
    assert.equal(
      Object.isFrozen(
        value.listProviders()[0],
      ),
      true,
    );
  },
);

test(
  "gets a registered provider",
  () => {
    assert.equal(
      kernel()
        .getProvider(
          "performance",
        )
        .providerVersion,
      "performance-report-provider.v1",
    );
  },
);

test(
  "returns null for an unknown provider",
  () => {
    assert.equal(
      kernel().getProvider(
        "commissions",
      ),
      null,
    );
  },
);

test(
  "creates an identified non-executed request",
  () => {
    const value =
      kernel().createRequest(
        request(),
      );

    assert.equal(
      value.schemaVersion,
      "universal-report-request.v1",
    );
    assert.equal(
      value.status,
      "IDENTIFIED_NOT_EXECUTED",
    );
    assert.equal(
      value.provider.providerId,
      "performance",
    );
  },
);

test(
  "rejects unregistered request providers",
  () => {
    assert.throws(
      () =>
        kernel().createRequest(
          request({
            providerId:
              "commissions",
          }),
        ),
      /unregistered provider/u,
    );
  },
);

test(
  "canonicalizes an explicit asOf instant",
  () => {
    const value =
      kernel().createRequest(
        request({
          asOf:
            "2026-07-28T12:30:00-06:00",
        }),
      );

    assert.equal(
      value.asOf,
      "2026-07-28T18:30:00.000Z",
    );
  },
);

test(
  "uses the bound clock when asOf is omitted",
  () => {
    const value =
      kernel().createRequest(
        request(),
      );

    assert.equal(
      value.asOf,
      "2026-07-29T00:00:00.000Z",
    );
  },
);

test(
  "validates the IANA time zone",
  () => {
    assert.throws(
      () =>
        kernel().createRequest(
          request({
            timeZone:
              "Moon/SeaOfTranquility",
          }),
        ),
      /IANA time zone/u,
    );
  },
);

test(
  "preserves an unresolved period input",
  () => {
    const value =
      kernel().createRequest(
        request(),
      );

    assert.deepEqual(
      value.period,
      {
        schemaVersion:
          "report-period-input.v1",
        kind:
          "YEAR_TO_DATE",
        parameters: {},
        resolutionStatus:
          "PENDING_REP_02",
      },
    );
    assert.equal(
      "from" in value.period,
      false,
    );
    assert.equal(
      "to" in value.period,
      false,
    );
  },
);

test(
  "normalizes dimensions and measures as sorted sets",
  () => {
    const value =
      kernel().createRequest(
        request({
          dimensions: [
            "product",
            "activityType",
            "product",
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
        "product",
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
  "creates a deterministic key despite object key order",
  () => {
    const first =
      kernel().createRequest(
        request({
          period: {
            kind:
              "CUSTOM_RANGE",
            parameters: {
              to:
                "2026-07-28",
              from:
                "2026-01-01",
            },
          },
          metadata: {
            beta: 2,
            alpha: 1,
          },
        }),
      );

    const second =
      kernel().createRequest(
        request({
          period: {
            kind:
              "CUSTOM_RANGE",
            parameters: {
              from:
                "2026-01-01",
              to:
                "2026-07-28",
            },
          },
          metadata: {
            alpha: 1,
            beta: 2,
          },
        }),
      );

    assert.equal(
      first.requestKey,
      second.requestKey,
    );
  },
);

test(
  "changes request key when the definition changes",
  () => {
    const first =
      kernel().createRequest(
        request(),
      );
    const second =
      kernel().createRequest(
        request({
          definitionId:
            "performance-detail",
        }),
      );

    assert.notEqual(
      first.requestKey,
      second.requestKey,
    );
  },
);

test(
  "changes request key when period parameters change",
  () => {
    const first =
      kernel().createRequest(
        request({
          period: {
            kind:
              "CUSTOM_RANGE",
            parameters: {
              from:
                "2026-01-01",
              to:
                "2026-07-28",
            },
          },
        }),
      );
    const second =
      kernel().createRequest(
        request({
          period: {
            kind:
              "CUSTOM_RANGE",
            parameters: {
              from:
                "2026-02-01",
              to:
                "2026-07-28",
            },
          },
        }),
      );

    assert.notEqual(
      first.requestKey,
      second.requestKey,
    );
  },
);

test(
  "embeds the bound authority in request identity",
  () => {
    const value =
      kernel().createRequest(
        request(),
      );

    assert.deepEqual(
      value.authority,
      {
        organizationId:
          "organization-001",
        principalId:
          "advisor-001",
      },
    );
  },
);

test(
  "locks all unimplemented execution boundaries",
  () => {
    const value =
      kernel().createRequest(
        request(),
      );

    assert.deepEqual(
      value.boundary,
      {
        providerExecutionAuthorized:
          false,
        periodResolutionComplete:
          false,
        aggregationAuthorized:
          false,
        comparisonAuthorized:
          false,
        exportAuthorized:
          false,
        uiRenderingAuthorized:
          false,
        persistenceMutationAuthorized:
          false,
        domainTruthOwnedByKernel:
          false,
      },
    );
  },
);

test(
  "rejects presentation-owned metadata",
  () => {
    assert.throws(
      () =>
        kernel().createRequest(
          request({
            metadata: {
              color:
                "green",
            },
          }),
        ),
      /presentation or persistence boundary/u,
    );
  },
);

test(
  "rejects persistence-owned metadata",
  () => {
    assert.throws(
      () =>
        kernel().createRequest(
          request({
            metadata: {
              rpc:
                "activity_records_list_v1",
            },
          }),
        ),
      /presentation or persistence boundary/u,
    );
  },
);

test(
  "returns deeply immutable kernel and request values",
  () => {
    const value = kernel();
    const reportRequest =
      value.createRequest(
        request(),
      );

    assert.equal(
      Object.isFrozen(value),
      true,
    );
    assert.equal(
      Object.isFrozen(
        value.providerRegistry,
      ),
      true,
    );
    assert.equal(
      Object.isFrozen(
        reportRequest,
      ),
      true,
    );
    assert.equal(
      Object.isFrozen(
        reportRequest.period,
      ),
      true,
    );
  },
);

test(
  "exposes no provider execution, persistence, export or UI method",
  () => {
    const value = kernel();

    for (const name of [
      "execute",
      "read",
      "write",
      "persist",
      "export",
      "render",
      "resolvePeriod",
      "compare",
      "aggregate",
    ]) {
      assert.equal(
        name in value,
        false,
      );
    }
  },
);
