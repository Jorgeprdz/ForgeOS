import test from "node:test";
import assert from "node:assert/strict";

import {
  REPORTING_CALENDAR_POLICY_SCHEMA_VERSION,
  ReportingCalendarPolicyError,
  createReportingCalendarPolicy,
} from "../advisor-os/reporting/domain/reporting-calendar-policy.mjs";

import {
  CANONICAL_REPORT_PERIOD_KINDS,
  REPORT_PERIOD_KIND_ALIASES,
  RESOLVED_REPORT_PERIOD_SCHEMA_VERSION,
  RESOLVED_UNIVERSAL_REPORT_REQUEST_SCHEMA_VERSION,
  UNIVERSAL_PERIOD_RESOLVER_CAPABILITIES,
  UNIVERSAL_PERIOD_RESOLVER_SCHEMA_VERSION,
  UniversalPeriodResolverError,
  createUniversalPeriodResolver,
} from "../advisor-os/reporting/runtime/universal-period-resolver.mjs";

import {
  createUniversalReportingKernel,
} from "../advisor-os/reporting/runtime/universal-reporting-kernel.mjs";

function resolver(
  policy,
) {
  return createUniversalPeriodResolver({
    policy,
  });
}

function period(
  kind,
  parameters = {},
) {
  return {
    schemaVersion:
      "report-period-input.v1",
    kind,
    parameters,
    resolutionStatus:
      "PENDING_REP_02",
  };
}

function resolve(
  kind,
  {
    parameters = {},
    asOf =
      "2026-07-28T18:00:00.000Z",
    timeZone =
      "America/Mexico_City",
    policy,
  } = {},
) {
  return resolver(
    policy,
  ).resolvePeriod({
    period:
      period(
        kind,
        parameters,
      ),
    asOf,
    timeZone,
  });
}

function kernelRequest({
  kind =
    "YTD",
  parameters = {},
  asOf =
    "2026-07-28T18:00:00.000Z",
} = {}) {
  return createUniversalReportingKernel({
    authority: {
      organizationId:
        "organization-001",
      principalId:
        "advisor-001",
    },
    providers: [
      {
        providerId:
          "performance",
        providerVersion:
          "performance-report-provider.v1",
        domain:
          "PERFORMANCE",
        capabilities: [
          "POINTS",
        ],
      },
    ],
    clock: () =>
      asOf,
  }).createRequest({
    definitionId:
      "performance-summary",
    providerId:
      "performance",
    period: {
      kind,
      parameters,
    },
    timeZone:
      "America/Mexico_City",
    asOf,
    dimensions: [],
    measures: [
      "points",
    ],
    metadata: {},
  });
}

test(
  "exports resolver schemas, aliases and capabilities",
  () => {
    assert.equal(
      REPORTING_CALENDAR_POLICY_SCHEMA_VERSION,
      "reporting-calendar-policy.v1",
    );
    assert.equal(
      UNIVERSAL_PERIOD_RESOLVER_SCHEMA_VERSION,
      "universal-period-resolver.v1",
    );
    assert.equal(
      RESOLVED_REPORT_PERIOD_SCHEMA_VERSION,
      "resolved-report-period.v1",
    );
    assert.equal(
      RESOLVED_UNIVERSAL_REPORT_REQUEST_SCHEMA_VERSION,
      "resolved-universal-report-request.v1",
    );
    assert.equal(
      REPORT_PERIOD_KIND_ALIASES.YTD,
      "YEAR_TO_DATE",
    );
    assert.ok(
      CANONICAL_REPORT_PERIOD_KINDS.includes(
        "CALENDAR_TWO_MONTH_PERIOD",
      ),
    );
    assert.ok(
      UNIVERSAL_PERIOD_RESOLVER_CAPABILITIES.includes(
        "FISCAL_YEAR_POLICY",
      ),
    );
  },
);

test(
  "creates the default calendar policy",
  () => {
    assert.deepEqual(
      createReportingCalendarPolicy(),
      {
        schemaVersion:
          "reporting-calendar-policy.v1",
        weekStartsOn: 1,
        fiscalYearStartMonth: 1,
        fiscalYearStartDay: 1,
        twoYearAnchorYear: 2000,
        currentPeriodMode:
          "TO_AS_OF",
        allowFuturePeriods:
          false,
        rangeSemantics:
          "INCLUSIVE_DATE",
        timeZoneAuthority:
          "REQUEST_IANA_TIME_ZONE",
        asOfAuthority:
          "REQUEST_CANONICAL_INSTANT",
      },
    );
  },
);

test(
  "rejects an invalid week start",
  () => {
    assert.throws(
      () =>
        createReportingCalendarPolicy({
          weekStartsOn: 0,
        }),
      ReportingCalendarPolicyError,
    );
  },
);

test(
  "rejects an invalid fiscal start day",
  () => {
    assert.throws(
      () =>
        createReportingCalendarPolicy({
          fiscalYearStartDay: 29,
        }),
      /between 1 and 28/u,
    );
  },
);

test(
  "resolves TODAY in the request timezone",
  () => {
    const value =
      resolve(
        "TODAY",
      );

    assert.equal(
      value.from,
      "2026-07-28",
    );
    assert.equal(
      value.to,
      "2026-07-28",
    );
    assert.equal(
      value.dayCount,
      1,
    );
  },
);

test(
  "resolves WTD with Monday start",
  () => {
    const value =
      resolve(
        "WTD",
      );

    assert.equal(
      value.kind,
      "WEEK_TO_DATE",
    );
    assert.equal(
      value.from,
      "2026-07-27",
    );
    assert.equal(
      value.to,
      "2026-07-28",
    );
  },
);

test(
  "resolves WTD with Sunday start",
  () => {
    const value =
      resolve(
        "WEEK_TO_DATE",
        {
          policy: {
            weekStartsOn: 7,
          },
        },
      );

    assert.equal(
      value.from,
      "2026-07-26",
    );
  },
);

test(
  "resolves MTD alias",
  () => {
    const value =
      resolve(
        "MTD",
      );

    assert.equal(
      value.kind,
      "MONTH_TO_DATE",
    );
    assert.equal(
      value.from,
      "2026-07-01",
    );
    assert.equal(
      value.to,
      "2026-07-28",
    );
  },
);

test(
  "resolves QTD",
  () => {
    const value =
      resolve(
        "QTD",
      );

    assert.equal(
      value.from,
      "2026-07-01",
    );
    assert.equal(
      value.naturalTo,
      "2026-09-30",
    );
    assert.equal(
      value.isPartial,
      true,
    );
  },
);

test(
  "resolves YTD",
  () => {
    const value =
      resolve(
        "YTD",
      );

    assert.equal(
      value.kind,
      "YEAR_TO_DATE",
    );
    assert.equal(
      value.from,
      "2026-01-01",
    );
    assert.equal(
      value.to,
      "2026-07-28",
    );
    assert.equal(
      value.dayCount,
      209,
    );
  },
);

test(
  "resolves leap-year YTD",
  () => {
    const value =
      resolve(
        "YEAR_TO_DATE",
        {
          asOf:
            "2024-03-01T18:00:00.000Z",
        },
      );

    assert.equal(
      value.from,
      "2024-01-01",
    );
    assert.equal(
      value.to,
      "2024-03-01",
    );
    assert.equal(
      value.dayCount,
      61,
    );
  },
);

test(
  "resolves FYTD after fiscal start",
  () => {
    const value =
      resolve(
        "FYTD",
        {
          policy: {
            fiscalYearStartMonth: 7,
            fiscalYearStartDay: 1,
          },
        },
      );

    assert.equal(
      value.from,
      "2026-07-01",
    );
    assert.equal(
      value.to,
      "2026-07-28",
    );
    assert.equal(
      value.naturalTo,
      "2027-06-30",
    );
  },
);

test(
  "resolves FYTD before fiscal start",
  () => {
    const value =
      resolve(
        "FISCAL_YEAR_TO_DATE",
        {
          asOf:
            "2026-03-10T18:00:00.000Z",
          policy: {
            fiscalYearStartMonth: 7,
            fiscalYearStartDay: 1,
          },
        },
      );

    assert.equal(
      value.from,
      "2025-07-01",
    );
    assert.equal(
      value.to,
      "2026-03-10",
    );
  },
);

test(
  "resolves a past calendar week in full",
  () => {
    const value =
      resolve(
        "CALENDAR_WEEK",
        {
          parameters: {
            referenceDate:
              "2026-07-15",
          },
        },
      );

    assert.equal(
      value.from,
      "2026-07-13",
    );
    assert.equal(
      value.to,
      "2026-07-19",
    );
    assert.equal(
      value.isPartial,
      false,
    );
  },
);

test(
  "truncates the current calendar week to asOf",
  () => {
    const value =
      resolve(
        "CALENDAR_WEEK",
      );

    assert.equal(
      value.from,
      "2026-07-27",
    );
    assert.equal(
      value.to,
      "2026-07-28",
    );
    assert.equal(
      value.naturalTo,
      "2026-08-02",
    );
    assert.equal(
      value.isPartial,
      true,
    );
  },
);

test(
  "can return the full current calendar period",
  () => {
    const value =
      resolve(
        "CALENDAR_WEEK",
        {
          policy: {
            currentPeriodMode:
              "FULL_PERIOD",
          },
        },
      );

    assert.equal(
      value.to,
      "2026-08-02",
    );
    assert.equal(
      value.isPartial,
      false,
    );
  },
);

test(
  "resolves a calendar month",
  () => {
    const value =
      resolve(
        "CALENDAR_MONTH",
        {
          parameters: {
            referenceDate:
              "2026-02-10",
          },
        },
      );

    assert.equal(
      value.from,
      "2026-02-01",
    );
    assert.equal(
      value.to,
      "2026-02-28",
    );
  },
);

test(
  "resolves the first two-month calendar period",
  () => {
    const value =
      resolve(
        "CALENDAR_TWO_MONTH_PERIOD",
        {
          parameters: {
            referenceDate:
              "2026-02-17",
          },
        },
      );

    assert.equal(
      value.from,
      "2026-01-01",
    );
    assert.equal(
      value.to,
      "2026-02-28",
    );
  },
);

test(
  "resolves the last two-month calendar period",
  () => {
    const value =
      resolve(
        "CALENDAR_TWO_MONTH_PERIOD",
        {
          parameters: {
            referenceDate:
              "2025-12-01",
          },
        },
      );

    assert.equal(
      value.from,
      "2025-11-01",
    );
    assert.equal(
      value.to,
      "2025-12-31",
    );
  },
);

test(
  "resolves a calendar quarter",
  () => {
    const value =
      resolve(
        "CALENDAR_QUARTER",
        {
          parameters: {
            referenceDate:
              "2026-05-10",
          },
        },
      );

    assert.equal(
      value.from,
      "2026-04-01",
    );
    assert.equal(
      value.to,
      "2026-06-30",
    );
  },
);

test(
  "resolves a calendar half-year",
  () => {
    const value =
      resolve(
        "CALENDAR_HALF_YEAR",
        {
          parameters: {
            referenceDate:
              "2026-10-10",
          },
          asOf:
            "2027-01-01T18:00:00.000Z",
        },
      );

    assert.equal(
      value.from,
      "2026-07-01",
    );
    assert.equal(
      value.to,
      "2026-12-31",
    );
  },
);

test(
  "normalizes SEMIANNUAL",
  () => {
    const value =
      resolve(
        "SEMIANNUAL",
      );

    assert.equal(
      value.inputKind,
      "SEMIANNUAL",
    );
    assert.equal(
      value.kind,
      "CALENDAR_HALF_YEAR",
    );
    assert.equal(
      value.from,
      "2026-07-01",
    );
  },
);

test(
  "resolves a calendar year",
  () => {
    const value =
      resolve(
        "CALENDAR_YEAR",
        {
          parameters: {
            referenceDate:
              "2025-06-10",
          },
        },
      );

    assert.equal(
      value.from,
      "2025-01-01",
    );
    assert.equal(
      value.to,
      "2025-12-31",
    );
  },
);

test(
  "resolves an anchored two-year period",
  () => {
    const value =
      resolve(
        "CALENDAR_TWO_YEAR_PERIOD",
        {
          parameters: {
            referenceDate:
              "2027-05-01",
          },
          asOf:
            "2028-01-01T18:00:00.000Z",
        },
      );

    assert.equal(
      value.from,
      "2026-01-01",
    );
    assert.equal(
      value.to,
      "2027-12-31",
    );
  },
);

test(
  "normalizes BIENNIAL",
  () => {
    const value =
      resolve(
        "BIENNIAL",
      );

    assert.equal(
      value.kind,
      "CALENDAR_TWO_YEAR_PERIOD",
    );
    assert.equal(
      value.from,
      "2026-01-01",
    );
  },
);

test(
  "resolves rolling 7 days",
  () => {
    const value =
      resolve(
        "ROLLING_7_DAYS",
      );

    assert.equal(
      value.from,
      "2026-07-22",
    );
    assert.equal(
      value.to,
      "2026-07-28",
    );
    assert.equal(
      value.dayCount,
      7,
    );
  },
);

test(
  "resolves rolling 30 days",
  () => {
    const value =
      resolve(
        "ROLLING_30_DAYS",
      );

    assert.equal(
      value.from,
      "2026-06-29",
    );
    assert.equal(
      value.dayCount,
      30,
    );
  },
);

test(
  "resolves rolling 90 days",
  () => {
    const value =
      resolve(
        "ROLLING_90_DAYS",
      );

    assert.equal(
      value.dayCount,
      90,
    );
  },
);

test(
  "resolves rolling 365 days across a leap year",
  () => {
    const value =
      resolve(
        "ROLLING_365_DAYS",
        {
          asOf:
            "2024-03-01T18:00:00.000Z",
        },
      );

    assert.equal(
      value.from,
      "2023-03-03",
    );
    assert.equal(
      value.dayCount,
      365,
    );
  },
);

test(
  "resolves rolling 12 months",
  () => {
    const value =
      resolve(
        "ROLLING_12_MONTHS",
      );

    assert.equal(
      value.from,
      "2025-07-29",
    );
    assert.equal(
      value.to,
      "2026-07-28",
    );
  },
);

test(
  "resolves a custom inclusive range",
  () => {
    const value =
      resolve(
        "CUSTOM_RANGE",
        {
          parameters: {
            from:
              "2026-01-01",
            to:
              "2026-01-31",
          },
        },
      );

    assert.equal(
      value.dayCount,
      31,
    );
    assert.equal(
      value.family,
      "CUSTOM",
    );
  },
);

test(
  "rejects reversed custom dates",
  () => {
    assert.throws(
      () =>
        resolve(
          "CUSTOM_RANGE",
          {
            parameters: {
              from:
                "2026-02-01",
              to:
                "2026-01-01",
            },
          },
        ),
      /from must be on or before to/u,
    );
  },
);

test(
  "rejects a future custom range by default",
  () => {
    assert.throws(
      () =>
        resolve(
          "CUSTOM_RANGE",
          {
            parameters: {
              from:
                "2026-07-01",
              to:
                "2026-08-01",
            },
          },
        ),
      /cannot extend beyond/u,
    );
  },
);

test(
  "can allow a future custom range by policy",
  () => {
    const value =
      resolve(
        "CUSTOM_RANGE",
        {
          parameters: {
            from:
              "2026-07-01",
            to:
              "2026-08-01",
          },
          policy: {
            allowFuturePeriods:
              true,
          },
        },
      );

    assert.equal(
      value.to,
      "2026-08-01",
    );
  },
);

test(
  "rejects ambiguous BIANNUAL",
  () => {
    assert.throws(
      () =>
        resolve(
          "BIANNUAL",
        ),
      /ambiguous/u,
    );
  },
);

test(
  "rejects an unsupported period kind",
  () => {
    assert.throws(
      () =>
        resolve(
          "FORTNIGHTISH",
        ),
      /not supported/u,
    );
  },
);

test(
  "rejects a future reference date by default",
  () => {
    assert.throws(
      () =>
        resolve(
          "CALENDAR_MONTH",
          {
            parameters: {
              referenceDate:
                "2026-08-01",
            },
          },
        ),
      /cannot be after/u,
    );
  },
);

test(
  "uses inclusive day counts",
  () => {
    const value =
      resolve(
        "CUSTOM_RANGE",
        {
          parameters: {
            from:
              "2026-07-28",
            to:
              "2026-07-28",
          },
        },
      );

    assert.equal(
      value.dayCount,
      1,
    );
    assert.equal(
      value.inclusive,
      true,
    );
  },
);

test(
  "resolves a REP-01 request",
  () => {
    const value =
      resolver().resolveRequest(
        kernelRequest(),
      );

    assert.equal(
      value.schemaVersion,
      "resolved-universal-report-request.v1",
    );
    assert.equal(
      value.status,
      "PERIOD_RESOLVED_NOT_EXECUTED",
    );
    assert.equal(
      value.period.kind,
      "YEAR_TO_DATE",
    );
    assert.equal(
      value.boundary.periodResolutionComplete,
      true,
    );
  },
);

test(
  "creates deterministic resolved request keys",
  () => {
    const source =
      kernelRequest();
    const first =
      resolver().resolveRequest(
        source,
      );
    const second =
      resolver().resolveRequest(
        source,
      );

    assert.equal(
      first.resolvedRequestKey,
      second.resolvedRequestKey,
    );
  },
);

test(
  "changes the resolved key when calendar policy changes",
  () => {
    const source =
      kernelRequest({
        kind:
          "WTD",
      });
    const monday =
      resolver({
        weekStartsOn: 1,
      }).resolveRequest(
        source,
      );
    const sunday =
      resolver({
        weekStartsOn: 7,
      }).resolveRequest(
        source,
      );

    assert.notEqual(
      monday.resolvedRequestKey,
      sunday.resolvedRequestKey,
    );
  },
);

test(
  "preserves one canonical asOf and timezone",
  () => {
    const value =
      resolve(
        "YTD",
        {
          asOf:
            "2026-07-28T12:30:00-06:00",
          timeZone:
            "America/Mexico_City",
        },
      );

    assert.equal(
      value.asOf,
      "2026-07-28T18:30:00.000Z",
    );
    assert.equal(
      value.timeZone,
      "America/Mexico_City",
    );
    assert.equal(
      value.localAsOfDate,
      "2026-07-28",
    );
  },
);

test(
  "uses timezone-local date across midnight",
  () => {
    const value =
      resolve(
        "TODAY",
        {
          asOf:
            "2026-07-29T02:00:00.000Z",
          timeZone:
            "America/Mexico_City",
        },
      );

    assert.equal(
      value.from,
      "2026-07-28",
    );
  },
);

test(
  "rejects an invalid IANA timezone",
  () => {
    assert.throws(
      () =>
        resolve(
          "TODAY",
          {
            timeZone:
              "Mars/Olympus",
          },
        ),
      /IANA time zone/u,
    );
  },
);

test(
  "returns deeply immutable results",
  () => {
    const value =
      resolver().resolveRequest(
        kernelRequest(),
      );

    assert.equal(
      Object.isFrozen(value),
      true,
    );
    assert.equal(
      Object.isFrozen(
        value.period,
      ),
      true,
    );
    assert.equal(
      Object.isFrozen(
        value.period.policy,
      ),
      true,
    );
  },
);

test(
  "exposes no provider execution or persistence methods",
  () => {
    const value =
      resolver();

    for (const name of [
      "execute",
      "readProvider",
      "aggregate",
      "compare",
      "persist",
      "export",
      "render",
    ]) {
      assert.equal(
        name in value,
        false,
      );
    }
  },
);
