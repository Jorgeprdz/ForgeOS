# Universal Reporting System Decision 001

```text
DECISION=UNIVERSAL_REPORTING_KERNEL_IS_REPORTING_AUTHORITY
REPORTING_AUTHORITY=UNIVERSAL_REPORTING_KERNEL
DOMAIN_REPORTING_AUTHORITY=NO
PROVIDER_ADAPTERS_REQUIRED=YES
SURFACE_ADAPTER_AFTER_KERNEL=YES
EXPORT_ADAPTER_AFTER_UNIVERSAL_MODEL=YES
```

## Why universal

Reports are a shared system capability. Performance, Commissions, Portfolio,
Activity, Pipeline and future domains must not each implement separate period,
comparison, aggregation and export engines.

The Universal Reporting System is therefore a neutral orchestration and
projection layer. It does not own domain facts. It owns the rules for asking
providers for governed report slices and combining those slices into a
versioned universal report.

## Authority split

### Universal kernel owns

- report request validation;
- canonical time zone and `asOf`;
- period resolution;
- calendar and fiscal policies;
- long-range slicing;
- aggregation orchestration;
- comparison and baseline orchestration;
- universal report identity;
- universal report model;
- cross-provider consistency checks;
- provenance assembly.

### Domain providers own

- supported measures and dimensions;
- domain evidence and exclusions;
- source authority;
- query implementation;
- domain-specific validity rules;
- provider-specific slice projection.

### UI and export adapters own

- labels and localization;
- visual formatting;
- charts and tables;
- PDF, CSV or spreadsheet formatting;
- routes, components and navigation;
- delivery-specific presentation.

They do not recalculate measures or redefine period semantics.

## Canonical period families

### To-date

- `TODAY`
- `WEEK_TO_DATE`
- `MONTH_TO_DATE`
- `QUARTER_TO_DATE`
- `YEAR_TO_DATE`
- `FISCAL_YEAR_TO_DATE`

### Calendar

- `CALENDAR_WEEK`
- `CALENDAR_MONTH`
- `CALENDAR_TWO_MONTH_PERIOD`
- `CALENDAR_QUARTER`
- `CALENDAR_HALF_YEAR`
- `CALENDAR_YEAR`
- `CALENDAR_TWO_YEAR_PERIOD`

### Rolling

- `ROLLING_7_DAYS`
- `ROLLING_30_DAYS`
- `ROLLING_90_DAYS`
- `ROLLING_365_DAYS`
- `ROLLING_12_MONTHS`

### Custom

- `CUSTOM_RANGE`

## Naming lock

- `SEMIANNUAL` means a six-month period.
- `BIENNIAL` means a two-year period.
- `SEMIMONTHLY` means two subdivisions within one month.
- ambiguous `BIANNUAL` is not a canonical contract value.
- `CALENDAR_TWO_MONTH_PERIOD` is the canonical bimonthly calendar period.

## Snapshot lock

Every report request resolves one canonical:

```text
from
to
asOf
timeZone
calendarPolicy
fiscalYearPolicy
comparisonPolicy
```

All current-period slices and comparison slices must use the same `asOf`
snapshot unless a versioned report definition explicitly requires otherwise.

## Provider plan

- `REP-06` Performance.
- `REP-07` Commissions.
- `REP-08` Portfolio.
- `REP-09` Activity.
- `REP-10` Pipeline.

Additional providers require separate scope and authority evidence.
