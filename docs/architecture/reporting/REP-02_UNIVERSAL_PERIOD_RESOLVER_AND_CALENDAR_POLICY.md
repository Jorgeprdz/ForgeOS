# REP-02 — Universal Period Resolver and Calendar Policy

```text
REP_02_UNIVERSAL_PERIOD_RESOLVER_AND_CALENDAR_POLICY=IMPLEMENTED_PENDING_ACCEPTANCE
REPORTING_BRANCH=feature/universal-reporting-kernel-foundation
SOURCE_COMMIT=4254e294187f71acaec785a2782a62d9908a4a98
RESOLVER_SCHEMA=universal-period-resolver.v1
CALENDAR_POLICY_SCHEMA=reporting-calendar-policy.v1
RESOLVED_PERIOD_SCHEMA=resolved-report-period.v1
RESOLVED_REQUEST_SCHEMA=resolved-universal-report-request.v1
PERIOD_KIND_COUNT=19
ALIAS_COUNT=7
YTD_SUPPORTED=YES
FYTD_SUPPORTED=YES
BIMONTHLY_CALENDAR_SUPPORTED=YES
SEMIANNUAL_SUPPORTED=YES
BIENNIAL_SUPPORTED=YES
AMBIGUOUS_BIANNUAL_REJECTED=YES
PROVIDER_EXECUTION_AUTHORIZED=NO
PRODUCTIVE_UI_MUTATION=NO
REMOTE_DATABASE_MUTATION=NO
```

## Goal

REP-02 resolves semantic report periods into exact inclusive date ranges using
one canonical `asOf`, one IANA timezone and one immutable calendar policy.

## Supported period families

### To date

- `TODAY`;
- `WEEK_TO_DATE` / `WTD`;
- `MONTH_TO_DATE` / `MTD`;
- `QUARTER_TO_DATE` / `QTD`;
- `YEAR_TO_DATE` / `YTD`;
- `FISCAL_YEAR_TO_DATE` / `FYTD`.

### Calendar

- week;
- month;
- two-month period;
- quarter;
- half-year / `SEMIANNUAL`;
- year;
- two-year period / `BIENNIAL`.

### Rolling

- 7, 30, 90 and 365 days;
- rolling 12 months.

### Custom

- explicit inclusive `from` and `to`.

## Calendar policy

The policy freezes:

- ISO weekday used as week start;
- fiscal-year start month and day;
- two-year cycle anchor;
- current-period handling: `TO_AS_OF` or `FULL_PERIOD`;
- future-period authorization;
- inclusive date semantics.

Fiscal start day is restricted to 1–28 so the policy remains valid for every
configured month.

## Current-period rule

The default is:

```text
currentPeriodMode=TO_AS_OF
```

A current calendar week, month, quarter, half-year, year or two-year period is
therefore truncated to the local date represented by `asOf`. Past periods remain
complete. `FULL_PERIOD` is an explicit policy alternative.

## Naming lock

- `SEMIANNUAL` canonicalizes to `CALENDAR_HALF_YEAR`.
- `BIENNIAL` canonicalizes to `CALENDAR_TWO_YEAR_PERIOD`.
- `BIANNUAL` is rejected as ambiguous.
- the canonical bimonthly calendar identifier is
  `CALENDAR_TWO_MONTH_PERIOD`.

## Request transition

A REP-01 request:

```text
IDENTIFIED_NOT_EXECUTED
```

becomes:

```text
PERIOD_RESOLVED_NOT_EXECUTED
```

The resolved request receives a deterministic `resolvedRequestKey`, while
provider execution, aggregation, comparison, export and UI remain unauthorized.

## Next

`REP-03_REPORT_DEFINITION_AND_PROVIDER_PORT`
