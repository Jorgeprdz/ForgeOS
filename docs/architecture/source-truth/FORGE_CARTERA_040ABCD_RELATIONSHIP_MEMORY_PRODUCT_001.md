# FORGE CARTERA 040A–040D — RELATIONSHIP MEMORY PRODUCT 001

## Status

```text
PHASE=CARTERA_040_RELATIONSHIP_MEMORY_AND_NETWORK_CONTEXT
DELIVERY_MODE=040A_040B_040C_040D_ONE_PASS
SOURCE_HEAD=655a0595515a4b3ed2ef1eb8d91f080939049f00
PRODUCT_UI_MUTATION=YES_BOUNDED_TO_CARTERA
SUPABASE_REMOTE_MUTATION=AUTHORIZED_FOR_MIGRATIONS_00270_00271
ACCOUNT_MUTATION=NOT_AUTHORIZED
```

## Internal gates

### 040A — Durable relationship memory

Forge may persist an advisor-confirmed, evidence-backed memory entry attached to an existing canonical commercial person.

A memory entry is append-only and must preserve:

- canonical person reference;
- memory kind;
- minimized summary;
- source authority and source record reference;
- at least one opaque evidence reference;
- occurred time;
- sensitivity;
- consent state;
- permitted context use;
- explicit digest-bound authorization;
- replay receipt and durable conflict behavior.

Memory does not create or mutate canonical identity, Policy Truth, payment truth, opportunity truth, NASH output or client consent.

### 040B — Unified relationship history and network context

The read model composes, without copying authority:

- confirmed relationship memories;
- linked Prospect Timeline events;
- confirmed policy versions and general roles;
- confirmed PaymentEvents;
- confirmed account/household memberships.

The projection may expose general policy roles but never beneficiary data, raw evidence, payment instruments, bank data, provider prompts or transcripts.

### 040C — Preference, sensitivity and consent boundary

Evidence-backed preferences may include:

- contact channel;
- contact time;
- decision participants;
- explanation style;
- service expectations;
- unresolved commitments.

`LIFE_CONTEXT` requires:

```text
SENSITIVITY=SENSITIVE
CONSENT_STATE=CONFIRMED
CONTEXT_USE=SERVICE_ONLY|CONVERSATION_PREPARATION
EVIDENCE_REFERENCE_COUNT>=1
LIFE_CONTEXT_IS_SALES_TRIGGER=NO
```

Sensitive context with unknown, missing or revoked consent fails closed.

### 040D — Productive pre-contact brief in Cartera

Each canonical person card receives a bounded **Ver memoria de relación** action.

The person brief shows:

- relationship network;
- policy roles and confirmed portfolio context;
- preferences and service expectations;
- unresolved commitments;
- consented life context;
- unified history with source and truth class;
- explicit no-autopilot boundaries.

The product may record a new human-confirmed memory. It may not:

- send a message;
- execute contact;
- create an opportunity;
- create a referral request;
- produce a final NASH message;
- convert life context into a commercial trigger.

## Authority reuse

```text
IDENTITY_AUTHORITY=commercial_people + commercial_source_identity_links
NETWORK_AUTHORITY=commercial_account_memberships + policy_roles
TIMELINE_AUTHORITY=prospect_timeline_events
POLICY_AUTHORITY=canonical_policies + policy_versions
PAYMENT_AUTHORITY=cartera030c_confirmed_payment_events
MEMORY_AUTHORITY=cartera040_relationship_memory_entries
PRODUCT_SURFACE=CARTERA_ONLY
```

## Exit gate

Before contact, the advisor can understand the confirmed relationship history, network, preferences, commitments and consented current context without reviewing disconnected notes.

```text
NEXT=CARTERA_050_FUTURE_RADAR_AND_CONSERVATION
```
