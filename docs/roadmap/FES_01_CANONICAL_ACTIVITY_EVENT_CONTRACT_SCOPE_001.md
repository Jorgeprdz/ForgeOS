# FES 01 Canonical Activity Event Contract Scope 001

## Status

- `STATUS=CLOSED_IMPLEMENTED_AND_TESTED`
- `PREPARED_BY=FES_00_SYSTEM_REALIGNMENT_AND_CLEANUP`
- `SOURCE_COMMIT=5e7974152aee9bbe7256a6396ece42cabe934df9`
- `IMPLEMENTATION_BASE_COMMIT=17b68f839d63ebb8d8f4831b59c9fd590077fcc1`
- `OWNER_EXECUTION_DIRECTIVE=APPROVED_2026_07_25`
- `NEXT=FES_02_ACTIVITY_LEDGER_PERSISTENCE`
- `RUNTIME_IMPLEMENTATION_AUTHORIZED=NO`
- `SUPABASE_REMOTE_MUTATION=NO`
- `MAIN_MUTATION=NO`

## Objective

Define one canonical Activity Event contract that can represent governed events from
prospect intake, Calendar, calls, WhatsApp/Nash, Nash Combat, quotes, presentations,
Pipeline movement and later domains without creating parallel truth silos.

## Contract fields to scope

```text
event_id
event_type
schema_version
tenant_id
actor
subject
source
evidence_strength
occurred_at
recorded_at
effective_period
causation_id
correlation_id
idempotency_key
privacy_class
learning_eligibility
payload
provenance
confirmation_state
correction_of
safety_flags
```

## Required invariants

- event identity is stable and tenant-bound;
- event type and schema version are explicit;
- subject and source are explicit;
- evidence strength is not inferred from event type alone;
- external handoff is distinct from external confirmation;
- occurrence time is distinct from record time;
- corrections append new events;
- payload is allowlisted and privacy-classified;
- learning eligibility defaults to false;
- no AI output silently becomes prospect truth;
- no event automatically executes a business action;
- every mutation path is idempotent and auditable.

## First vertical coverage

```text
PROSPECT_PROFILE_CREATED
PROSPECT_CREATED
INITIAL_CONTEXT_CAPTURED
TIMELINE_INITIALIZED
APPOINTMENT_SCHEDULED
APPOINTMENT_HELD
APPOINTMENT_NOT_HELD
APPOINTMENT_RESCHEDULED
APPOINTMENT_NO_SHOW
ACTIVITY_CONTEXT_ADDED
DUE_ACTION_CREATED
DUE_ACTION_RESCHEDULED
DUE_ACTION_COMPLETED
```

## Explicitly outside FES 01

- database migration;
- Supabase deployment;
- RLS/RPC deployment;
- local replica implementation;
- outbox implementation;
- productive UI mutation;
- push notification runtime;
- Nash/NBA execution;
- Calendar provider mutation;
- WhatsApp send;
- main merge.

## Completion gate

FES 01 closes only with deterministic contract implementation, validation tests,
source/evidence/privacy invariants, immutable output, Build Tree/Roadmap sync,
commit and push. Runtime persistence remains FES 02.

<!-- BEGIN FORGEOS:FES_01_IMPLEMENTATION_CLOSURE -->
## Implementation closure

```text
FES_01_CANONICAL_ACTIVITY_EVENT_CONTRACT=CLOSED
CONTRACT_VERSION=FES-01.1
SCHEMA_VERSION=forge.activity_event.v1
FIRST_VERTICAL_EVENT_TYPES=13
DETERMINISTIC_IDENTITY=PASS
TENANT_BOUND_IDENTITY=PASS
SOURCE_EVIDENCE_COMPATIBILITY=PASS
EXTERNAL_HANDOFF_NOT_CONFIRMATION=PASS
PAYLOAD_ALLOWLISTS=PASS
PRIVACY_CLASSIFICATION=PASS
LEARNING_ELIGIBILITY_DEFAULT_FALSE=PASS
CORRECTIONS_APPEND_ONLY=PASS
IMMUTABLE_OUTPUT=PASS
AUTOMATIC_EXECUTION=NO
RUNTIME_PERSISTENCE=NO
NEXT=FES_02_ACTIVITY_LEDGER_PERSISTENCE
```
<!-- END FORGEOS:FES_01_IMPLEMENTATION_CLOSURE -->
