# Advisor Compensation Income Smart Widget Connection 001

```text
PHASE=ADVISOR_COMPENSATION_080_INCOME_SMART_WIDGET_CONNECTION
MODE=ONE_PASS
CONTRACT=ADVISOR_COMPENSATION_INCOME_WIDGET_SNAPSHOT_001
OWNER_SCOPE=ADVISOR
READ_ONLY=YES
```

## Constitutional gate

```text
APPLICABLE_CONSTITUTION=AGENTS.md PRIME DIRECTIVES + ECONOMIC EVIDENCE RULE + METRIC OWNERSHIP RULE
APPLICABLE_ADRS=ADVISOR_COMPENSATION_ROADMAP_001 + STAGE_060_INCOME_TRUTH + STAGE_070_PRODUCT_UI
BUILD_TREE_AREA=ADVISOR_OS/FORGE_ALIVE/SMART_WIDGETS + ADVISOR_COMPENSATION
DISCOVERY_STATUS=COMPLETE
IMPLEMENTATION_READINESS=READY
MIRANDA_APPROVAL=USER_GO_080
BOARD_APPROVAL_STATUS=NOT_REQUIRED_FOR_READ_ONLY_CONNECTION
SCOPE_BOUNDARY=DIRECT_ADVISOR_COMPENSATION_HOME_SUMMARY_ONLY
PROHIBITED_SURFACES=PAYOUT_PROMOTION,EVENT_WRITE,RULE_MUTATION,CARTERA_RECALCULATION,PIPELINE_AS_INCOME
VALIDATION_EXPECTATION=MASTER_CONTRACT + BROWSER_RUNTIME + EXISTING_SMART_WIDGET_REGRESSION
```

## Authority chain

```text
COMPENSATION_EVENT_TIMELINE
  -> ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_001
  -> ADVISOR_COMPENSATION_HISTORY_SERIES_001
  -> ADVISOR_COMPENSATION_PRODUCT_READ_MODEL_001
  -> ADVISOR_COMPENSATION_INCOME_WIDGET_SNAPSHOT_001
  -> INCOME_PROGRESS_WIDGET
```

The widget is a consumer. It does not calculate compensation, infer payout truth or create economic events.

## Productive source activation

The existing `createIncomeCompensationSourceAdapter` now resolves the productive Stage 070 provider contract.

Compatibility behavior:

```text
LEGACY_HOME_PLACEHOLDER=COMPENSATION_INCOME_TRUTH_NOT_CONNECTED
ORCHESTRATOR_ACTION=REPLACE_WITH_CANONICAL_INCOME_ADAPTER
```

The adapter may consume either:

- `loadCompensationProduct(context)`, or
- the split `loadPeriodSnapshot(context)` and `loadHistorySeries(context)` provider contract.

The default productive provider is resolved from:

```text
globalThis.ForgeAdvisorCompensationProductSource070
```

This is the same provider surface used by the Commissions product route. It is a source registry, not a data fallback.

## Truth mapping

Actual income uses explicit availability, not numeric coalescing:

```text
1. PAID, only when paid source is usable and value is known;
2. EARNED, only when earned aggregates or EARNED real basis exist;
3. REAL, only when its basis is not UNAVAILABLE;
4. otherwise null.
```

This prevents the following false mapping:

```text
earnedNet=0
earnedAggregateCount=0
realBasis=UNAVAILABLE
=> ACTUAL=null
=> ACTUAL_ZERO=NO
```

Known zero remains valid:

```text
paid.value=0
paid.knownZero=true
paid.sourceState=AVAILABLE
=> ACTUAL=0
=> ACTUAL_BASIS=PAID
```

## Separate signals

The widget keeps these amounts outside actual income:

```text
ESTIMATED
POTENTIAL
AT_RISK
```

`POTENTIAL` is a secondary context metric.

`AT_RISK` receives hard priority only when all are true:

- snapshot amount is positive;
- one or more active `AT_RISK` signals exist;
- each signal has source authority and source reference;
- each signal has a valid digest;
- the sum of active signal amounts equals the snapshot amount.

Missing or mismatched signal detail leaves the observed amount outside priority and adds uncertainty.

## Priority

```text
HARD_PRIORITY=CONFIRMED_INCOME_AT_RISK
RANK_SCORE=930
```

The hard priority is applied only to evidence-backed canonical risk signals. It does not convert the signal into paid, earned or real truth.

## Deep link

```text
DEEP_LINK=?nav=comisiones
REVIEW_ACTION=ABRIR_COMISIONES
```

The authenticated Home shell resolves the `nav` parameter and navigates to the productive Commissions route.

## Honest degradation

```text
NO_PROVIDER=NOT_CONNECTED
PROVIDER_ERROR=SOURCE_UNAVAILABLE
SNAPSHOT_BLOCKED=BLOCKED_BY_MISSING_EVIDENCE
PARTIAL_SNAPSHOT=PARTIAL
STALE_SNAPSHOT=STALE
AVAILABLE_EMPTY=EMPTY
```

Unavailable states redact metrics under the existing Smart Widget contract.

Forbidden substitutes:

```text
PREMIUM_AS_INCOME=NO
QUOTE_AS_INCOME=NO
PIPELINE_AS_INCOME=NO
CARTERA_AS_INCOME=NO
SIMULATION_AS_INCOME=NO
```

## Session and owner scope

- anonymous sessions return `SESSION_REQUIRED` before loading any provider;
- provider requests include the authenticated advisor identifier;
- snapshot and history owner identifiers must match;
- cross-period history leakage is rejected;
- abort signals are honored before and after provider loading;
- the orchestrator does not mutate its input.

## Compatibility

The old provider function remains available for other callers, but the productive orchestrator uses:

```text
createIncomeProgressWidget080
```

The existing pending dependency identifier remains for compatibility:

```text
COMPENSATION_INCOME_TRUTH_MINIMUM
```

It is unlocked only when the widget payload carries:

```text
sourceContract=ADVISOR_COMPENSATION_INCOME_WIDGET_SNAPSHOT_001
```

## Boundaries

```text
SUPABASE_MUTATION=NO
INDEXEDDB_MUTATION=NO
REMOTE_DATABASE_MUTATION=NO
CARTERA_MUTATION=NO
PIPELINE_MUTATION=NO
POLICY_TRUTH_MUTATION=NO
PAYMENT_EVENT_MUTATION=NO
RULE_PACK_MUTATION=NO
COMPENSATION_EVENT_WRITE=NO
PAYOUT_PROMOTION=NO
PAYOUT_TRUTH_CREATION=NO
AUTOMATIC_PAYOUT_CONFIRMATION=NO
PRODUCT_RECOMMENDATION_BY_COMMISSION=NO
```
