# ACT-02 — ActivityRecord Domain Contract

```text
ACT_02_ACTIVITY_RECORD_CONTRACT=IMPLEMENTED
CONTRACT_VERSION=activity-record.v1
RUNTIME_INTEGRATION=NO
PIPELINE_MUTATION=NO
PRODUCTIVE_UI_MUTATION=NO
DATABASE_MIGRATION=NO
SUPABASE_REMOTE_MUTATION=NO
POINT_AUTHORITY=PERFORMANCE_ONLY
ACTIVITY_TRUTH_AUTHORITY=OBSERVABLE_ACTION
CORRECTION_MODEL=APPEND_ONLY_RELATION
REVERSAL_MODEL=APPEND_ONLY_RELATION
SCORING_ELIGIBILITY=CONFIRMED_AND_VERIFIED_ONLY
NEXT=ACT-03_ACTIVITY_REPOSITORY_PORT
```

## Authority

`ActivityRecord` is the canonical Activity-domain envelope for observable advisor
action. It records what happened, ownership, occurrence, confirmation and source
evidence.

It does not assign points, infer productivity or coach the advisor.

## Identity and relations

Every record requires stable activity, organization and advisor identities plus
source-system event identity.

Manager, prospect, opportunity, appointment and policy references are optional
relations. They do not transfer domain authority.

## Occurrence and evaluation

`occurredAt` records the canonical instant of the action.

`evaluationDate` records the governed local calendar date used later by
Performance and Work Calendar projections. The two values are intentionally
separate.

## Lifecycle

- `PENDING_CONFIRMATION`
- `CONFIRMED`
- `CORRECTED`
- `REVERSED`

Corrections and reversals are append-only records that reference a prior activity.
They never overwrite occurrence truth.

## Evidence

Evidence states are `VERIFIED`, `UNVERIFIED`, `CONFLICTED` and `UNKNOWN`.

Only a confirmed record with verified evidence is scoring-eligible. Eligibility
is not a point value.

## Activity vocabulary

The first vocabulary distinguishes scheduling from completion:

- referral acquired;
- contact attempted;
- conversation completed;
- initial appointment scheduled;
- initial appointment completed;
- closing appointment scheduled;
- closing appointment completed;
- application submitted;
- policy paid;
- follow-up completed.

## Prohibited authority

The contract rejects embedded point, score, weight and multiplier fields,
including inside metadata.

Performance owns scoring rules and versions.

## Immutability

Created records are deeply immutable and metadata must be JSON-compatible.

## Non-mutation boundary

ACT-02 does not modify Activity UI, Pipeline behavior, database schema, Supabase
state, FES, MUI or `main`.
