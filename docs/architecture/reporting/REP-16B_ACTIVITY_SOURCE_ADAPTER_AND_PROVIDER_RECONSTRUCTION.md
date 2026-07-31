# REP-16B — Activity Source Adapter and Provider Reconstruction

Status: CLOSED
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

Replay identity is scoped by `event_type + idempotency_key`, matching the canonical FES event identity boundary. Equal idempotency keys across different event types are not collapsed.

## CI evidence

```text
WORKFLOW=Reporting Core Validation
RUN_ID=30674316609
RUN_NUMBER=26
JOB_ID=91298292043
STATUS=COMPLETED
CONCLUSION=SUCCESS
NODE_VERSION=22.23.1

TESTS=230
PASS=230
FAIL=0
CANCELLED=0
SKIPPED=0
```

Dedicated coverage added or expanded in this stage:

```text
EXTENDED_EVENT_MAPPING_CASES=12_PASS
FES_SOURCE_ADAPTER_CASES=8_PASS
ACTIVITY_PROVIDER_CASES=7_PASS
TOTAL_REP_16B_RELEVANT_CASES=27_PASS
```

Validated behaviors include:

- authority-bound event reads and snapshots;
- tenant drift rejection;
- one canonical `asOf`;
- timezone-local evaluation dates;
- FES-05B contact and conversation mappings;
- correction suppression;
- deterministic replay handling without input-order drift;
- event-type-scoped idempotency;
- empty periods without fabricated zero rows;
- requested-dimension grouping;
- canonical exclusions and provenance;
- no event truth, scoring, write, UI or persistence authority.

## Closure result

```text
BOUND_ORGANIZATION_AND_ADVISOR=PASS
CANONICAL_AS_OF=PASS
BOUND_TIMEZONE_EVALUATION_DATE=PASS
CORRECTION_SUPPRESSION=PASS
IDEMPOTENT_REPLAY_NO_DOUBLE_COUNT=PASS
EVENT_TYPE_SCOPED_IDEMPOTENCY=PASS
NO_ZERO_ROW_FABRICATION=PASS
CANONICAL_PROVENANCE=PASS
UNIVERSAL_PROVIDER_CONTRACT=PASS
CORE_REGRESSION=NONE
CI=PASS
REP_16B_COMPLETE=YES
```

```text
NEXT=REP_16C_ACTIVITY_PROVIDER_UNIVERSAL_RUNTIME_AND_CHART_READY_PROJECTION
```
