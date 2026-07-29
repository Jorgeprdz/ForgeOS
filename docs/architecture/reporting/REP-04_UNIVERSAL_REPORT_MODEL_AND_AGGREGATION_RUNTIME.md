# REP-04 — Universal Report Model and Aggregation Runtime

```text
REP_04_UNIVERSAL_REPORT_MODEL_AND_AGGREGATION_RUNTIME=IMPLEMENTED_PENDING_ACCEPTANCE
REPORTING_BRANCH=feature/universal-reporting-kernel-foundation
SOURCE_COMMIT=dc903fc56df3aca3bfb2befc37bac5b0b7e63eb7
REPORT_MODEL_SCHEMA=universal-report-model.v1
REPORT_ROW_SCHEMA=universal-report-row.v1
EXECUTION_SCHEMA=universal-report-execution.v1
AGGREGATION_RUNTIME_SCHEMA=universal-report-aggregation-runtime.v1
AGGREGATION_PLAN_SCHEMA=universal-report-aggregation-plan.v1
SLICE_DESCRIPTOR_SCHEMA=universal-report-slice-descriptor.v1
UNIVERSAL_AGGREGATION_AUTHORITY=YES
DETERMINISTIC_BATCHING=YES
COMPARISON_AUTHORITY=NO
PRODUCTIVE_UI_MUTATION=NO
REMOTE_DATABASE_MUTATION=NO
```

## Goal

REP-04 turns one REP-02 resolved request and one REP-03 provider contract into
an immutable universal report. Long periods are split into exact contiguous
provider slices and then consolidated without changing domain truth.

## Deterministic batching

The runtime honors each provider's `maxSliceDays`.

- ranges within the maximum use one direct slice;
- longer ranges use contiguous inclusive date slices;
- the first slice begins exactly at the resolved `from`;
- the last slice ends exactly at the resolved `to`;
- gaps and overlaps are prohibited;
- every slice uses the same canonical `asOf` and timezone;
- leap days remain part of inclusive coverage;
- provider reads execute in deterministic chronological order.

A YTD request can therefore consume a provider limited to 31 days without
expanding that provider's authority or query contract.

## Universal aggregation

Measure behavior is taken exclusively from REP-03 capability declarations:

```text
SUM
AVERAGE
MIN
MAX
FIRST
LAST
NONE
```

Rows sharing the selected dimension tuple are consolidated. Universal totals
are computed from all provider rows using the same declared measure semantics.
`NONE` accepts repeated equal values but rejects conflicting values.

## Universal report model

The accepted model contains:

```text
reportId
definition
provider
authority
period
asOf
timeZone
dimensions
measures
rows
totals
exclusions
provenance
execution
state
comparison
boundary
```

The model preserves provider provenance and domain evidence while stating that
the kernel owns aggregation, not domain truth.

## Exclusions and provenance

- exclusion counts are summed by canonical code;
- equal provenance entries are deduplicated;
- distinct provenance remains visible;
- empty provider rows produce `state=EMPTY` and null totals;
- unavailable values are never silently converted to zero.

## Authority boundary

REP-04 owns universal batching and aggregation. It does not own:

- period resolution;
- provider domain facts;
- comparisons or baselines;
- exports;
- UI presentation;
- persistence mutation.

## Next

`REP-05_COMPARISON_AND_BASELINE_ENGINE`
