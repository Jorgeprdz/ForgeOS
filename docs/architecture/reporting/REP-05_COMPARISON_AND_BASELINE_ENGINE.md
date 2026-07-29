# REP-05 — Comparison and Baseline Engine

```text
REP_05_COMPARISON_AND_BASELINE_ENGINE=IMPLEMENTED_ACCEPTED
REPORTING_BRANCH=feature/universal-reporting-kernel-foundation
SOURCE_COMMIT=19c1de9440113b9bb44ecc2403cbae160f286df0
COMPARISON_DEFINITION_SCHEMA=report-comparison-definition.v1
COMPARISON_ENGINE_SCHEMA=report-comparison-engine.v1
COMPARISON_PLAN_SCHEMA=report-comparison-plan.v1
COMPARISON_RESULT_SCHEMA=report-comparison-result.v1
MEASURE_COMPARISON_SCHEMA=report-measure-comparison.v1
ROW_COMPARISON_SCHEMA=report-row-comparison.v1
BASELINE_REFERENCE_SCHEMA=report-baseline-reference.v1
COMPARISON_AUTHORITY=YES
FAVORABILITY_AUTHORITY=NO
RANKING_AUTHORITY=NO
HUMAN_WORTH_AUTHORITY=NO
PRODUCTIVE_UI_MUTATION=NO
REMOTE_DATABASE_MUTATION=NO
```

## Goal

REP-05 compares accepted universal reports against governed baselines without
modifying either report or redefining domain truth.

## Comparison kinds

Canonical kinds:

- `PREVIOUS_PERIOD`;
- `PREVIOUS_YEAR_SAME_PERIOD`;
- `TARGET`;
- `BUDGET`;
- `CUSTOM_BASELINE`.

Aliases:

- `PERIOD_OVER_PERIOD` → `PREVIOUS_PERIOD`;
- `YEAR_OVER_YEAR` → `PREVIOUS_YEAR_SAME_PERIOD`.

## Baseline rules

### Previous period

Uses the same inclusive day count immediately before the current range.

### Previous year

Uses the same calendar start and end dates shifted one year back. Leap-day
dates are clamped to the last valid day of the comparison month.

### Target and budget

Use explicit finite values for every selected measure. The engine does not fetch
or invent target or budget values.

### Custom baseline

Requires a compatible accepted universal report with the same provider,
definition, dimensions and selected measures.

## Snapshot rule

Period-derived baselines use the current report's canonical `asOf` and timezone.
This means historical facts are read as known at the same report snapshot.

## Result

Each selected measure receives:

```text
current
baseline
delta
deltaPercent
ratio
direction
status
```

A zero baseline produces `delta`, but percentage and ratio remain `null`.

Rows are matched by canonical dimension values, not by report row keys.

## Authority boundary

The engine reports mathematical direction only:

```text
UP
DOWN
UNCHANGED
UNAVAILABLE
```

It does not infer whether a movement is favorable, rank people, assess human
worth or enforce action.

## Next

`REP-06_PERFORMANCE_REPORT_PROVIDER`
