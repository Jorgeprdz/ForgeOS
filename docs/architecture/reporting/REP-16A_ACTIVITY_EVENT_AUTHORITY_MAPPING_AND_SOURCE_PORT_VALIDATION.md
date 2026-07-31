# REP-16A — Activity Event Authority Mapping and Source Port Validation

Status: IN VALIDATION
Date: 2026-07-31
Branch: `integration/reporting-source-truth-reconciliation`

```text
SOURCE_EVENT_AUTHORITY=FES_CANONICAL_ACTIVITY_EVENT
SOURCE_SCHEMA=forge.activity_event.v1
SOURCE_PROJECTION_AUTHORITY=FES03B_CANONICAL_TIMELINE
REPORTING_EVENT_TRUTH_AUTHORITY=NO
REPORTING_ACTIVITY_MAPPING_AUTHORITY=YES
SCORING_AUTHORITY=NO
AI_INTERPRETATION_AUTHORITY=NO
```

## Reconciled event policy

The FES first vertical contains 13 canonical event types. Reporting does not treat every timeline event as a productive Activity metric.

### Directly countable

```text
DUE_ACTION_COMPLETED -> FOLLOW_UP_COMPLETED
```

Only confirmed events are countable.

### Countable with domain-owned appointment classification

```text
APPOINTMENT_SCHEDULED + INITIAL -> INITIAL_APPOINTMENT_SCHEDULED
APPOINTMENT_SCHEDULED + CLOSING -> CLOSING_APPOINTMENT_SCHEDULED
APPOINTMENT_HELD + INITIAL -> INITIAL_APPOINTMENT_COMPLETED
APPOINTMENT_HELD + CLOSING -> CLOSING_APPOINTMENT_COMPLETED
```

The canonical FES envelope does not identify an appointment as INITIAL or CLOSING. Reporting therefore cannot infer it. A domain authority must classify the appointment before the event becomes countable.

### Timeline evidence only

Prospect creation, context, timeline initialization, appointment failure/reschedule/no-show, activity context, and due-action creation/reschedule are visible evidence but are not productive Activity counters.

### Not yet present in the FES first vertical

```text
REFERRAL_ACQUIRED
CONTACT_ATTEMPTED
CONVERSATION_COMPLETED
APPLICATION_SUBMITTED
POLICY_PAID
```

These Activity types remain unsupported until canonical event types and authoritative producers exist. No proxy inference is authorized.

## Double-count prevention

- duplicate `event_id` is rejected;
- repeated `idempotency_key` is excluded as replay;
- append-only correction suppresses the corrected original for counting;
- correction target must be present in the supplied authority set;
- disputed and unconfirmed outcomes are excluded;
- corrections remain visible evidence even when the original is not counted.

## Delivered

- `advisor-os/reporting/domain/activity-event-authority-mapping.mjs`
- `tests/activity-event-authority-mapping-test.mjs`
- CI registration in `reporting-core-validation-ci.yml`

## Closure gates

```text
FES_EVENT_SCHEMA_BOUNDARY=PASS_REQUIRED
APPOINTMENT_STAGE_NO_INFERENCE=PASS_REQUIRED
CONFIRMATION_GATE=PASS_REQUIRED
IDEMPOTENT_REPLAY_NO_DOUBLE_COUNT=PASS_REQUIRED
CORRECTION_SUPPRESSION=PASS_REQUIRED
UNSUPPORTED_METRICS_NOT_INFERRED=PASS_REQUIRED
SOURCE_PORT_BOUNDARY=PASS_REQUIRED
CI=PASS_REQUIRED
```

```text
NEXT_AFTER_PASS=REP_16B_ACTIVITY_SOURCE_ADAPTER_AND_PROVIDER_RECONSTRUCTION
```
