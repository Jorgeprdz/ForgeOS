# REP-16B — Activity Source Adapter and Provider Reconstruction

Status: IN VALIDATION
Date: 2026-07-31
Branch: `integration/reporting-source-truth-reconciliation`

```text
SOURCE_EVENT_AUTHORITY=FES_CANONICAL_ACTIVITY_EVENT
SOURCE_EVENT_SCHEMA=forge.activity_event.v1
SOURCE_EVENT_EXTENSION=FES-05B.1
REPORTING_EVENT_TRUTH_AUTHORITY=NO
ACTIVITY_SOURCE_ADAPTER=READ_THROUGH_ONLY
PARALLEL_LEDGER=NO
SCORING_AUTHORITY=NO
UI_AUTHORITY=NO
AI_INTERPRETATION_AUTHORITY=NO
```

## Delivered

```text
advisor-os/reporting/infrastructure/fes-activity-report-source-adapter.mjs
advisor-os/reporting/providers/activity-report-provider.mjs
tests/fes-activity-report-source-adapter-test.mjs
tests/activity-report-provider-test.mjs
```

The FES adapter reads an authority-bound canonical snapshot, resolves corrections and replay, applies the governed Activity mapping, derives evaluation dates in the bound IANA timezone, and produces immutable period aggregation. It does not persist events or create a second ledger.

The universal provider exposes:

```text
DIMENSIONS=evaluationDate+activityType
MEASURE=activityCount
MAX_SLICE_DAYS=31
BATCHING=CONTIGUOUS_DATE_RANGES
```

Zero rows are not fabricated. When canonical authority exists but no reportable facts match, the provider returns an empty row set with explicit exclusions and provenance.

## FES-05B mapping reconciliation

```text
DUE_ACTION_COMPLETED -> FOLLOW_UP_COMPLETED
MESSAGE_SENT_CONFIRMED -> CONTACT_ATTEMPTED
CALL_NOT_ANSWERED_CONFIRMED -> CONTACT_ATTEMPTED
CALL_CONNECTED_CONFIRMED -> CONTACT_ATTEMPTED + CONVERSATION_COMPLETED
```

Appointments still require domain-owned INITIAL/CLOSING classification.

The provider does not promote quote, presentation, proposal, objection, draft or reply evidence into applications, policies, referrals or appointment outcomes.

## Authority and consistency gates

```text
BOUND_ORGANIZATION_AND_ADVISOR=PASS_REQUIRED
CANONICAL_AS_OF=PASS_REQUIRED
BOUND_TIMEZONE_EVALUATION_DATE=PASS_REQUIRED
CORRECTION_SUPPRESSION=PASS_REQUIRED
IDEMPOTENT_REPLAY_NO_DOUBLE_COUNT=PASS_REQUIRED
EVENT_TYPE_SCOPED_IDEMPOTENCY=PASS_REQUIRED
NO_ZERO_ROW_FABRICATION=PASS_REQUIRED
CANONICAL_PROVENANCE=PASS_REQUIRED
UNIVERSAL_PROVIDER_CONTRACT=PASS_REQUIRED
CORE_REGRESSION=NONE_REQUIRED
CI=PASS_REQUIRED
```

```text
NEXT_AFTER_PASS=REP_16C_ACTIVITY_PROVIDER_UNIVERSAL_RUNTIME_AND_CHART_READY_PROJECTION
```
