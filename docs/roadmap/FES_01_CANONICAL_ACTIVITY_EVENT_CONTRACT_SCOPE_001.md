# FES 01 Canonical Activity Event Contract Scope 001

## Status

- `STATUS=IMPLEMENTATION_SCOPE_PREPARED_NOT_AUTHORIZED`
- `PREPARED_BY=FES_00_SYSTEM_REALIGNMENT_AND_CLEANUP`
- `SOURCE_COMMIT=5e7974152aee9bbe7256a6396ece42cabe934df9`
- `NEXT=FES_01_CANONICAL_ACTIVITY_EVENT_CONTRACT`
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
