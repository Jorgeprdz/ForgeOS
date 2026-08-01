# REP-16 — Activity Report Provider Reconstruction

Status: SOURCE AUTHORITY RECONCILIATION
Date: 2026-07-31
Branch: `integration/reporting-source-truth-reconciliation`

```text
FORGE_THINKS=YES
AI_INTERPRETS_ONLY=YES
REPORTING_AUTHORITY=UNIVERSAL_REPORTING_KERNEL
ACTIVITY_TRUTH_AUTHORITY=ACTIVITY_EVENT_EVIDENCE_READ_MODEL
ACTIVITY_WRITE_AUTHORITY=NO
SCORING_AUTHORITY=NO
```

## Discovery result

The parked reporting provider exists in `feature/universal-reporting-kernel-foundation`, but its required Activity runtime is not present on the current production-based integration branch. The Activity authority remains isolated in `feature/activity-domain-runtime-foundation`.

A productive provider cannot be declared connected until the Activity read authority is reconciled with the current Event & Evidence system. The parked provider may be used as behavioral reference only.

## Parked provider behavior retained

- one-day provider slices;
- canonical activity type counts;
- observed, eligible and suppressed measures;
- authority match between reporting query and Activity runtime;
- exact `asOf` preservation;
- correction and reversal suppression;
- future-recorded exclusion;
- no scoring, writing, UI, export or persistence authority.

## Current Activity vocabulary discovered

```text
REFERRAL_ACQUIRED
CONTACT_ATTEMPTED
CONVERSATION_COMPLETED
INITIAL_APPOINTMENT_SCHEDULED
INITIAL_APPOINTMENT_COMPLETED
CLOSING_APPOINTMENT_SCHEDULED
CLOSING_APPOINTMENT_COMPLETED
APPLICATION_SUBMITTED
POLICY_PAID
FOLLOW_UP_COMPLETED
```

## Reconciliation decision

```text
PARKED_ACTIVITY_REPORT_PROVIDER=ADAPT
PARKED_ACTIVITY_RECORD_VOCABULARY=RECONCILE
PARKED_ACTIVITY_READ_RUNTIME=NOT_PROMOTED_YET
DIRECT_IMPORT_FROM_PARKED_ACTIVITY_BRANCH=NOT_AUTHORIZED
PARALLEL_ACTIVITY_COUNTERS=NOT_AUTHORIZED
EVENT_TO_ACTIVITY_MAPPING=REQUIRED
DOUBLE_COUNT_PROTECTION=REQUIRED
```

## Required provider source contract

The reconstructed provider must receive a governed read authority exposing period aggregation. It must not import a legacy UI, mutate Activity, calculate points, or infer business events.

Required aggregate facts:

```text
organizationId
advisorId
period.evaluationDateFrom
period.evaluationDateTo
period.asOf
observedByType
eligibleByType
suppressedByType
periodRecordCount
eligibleActivityCount
suppressedEligibleCount
futureRecordedExcludedCount
relations.suppressedByCorrectionCount
relations.suppressedByReversalCount
```

## Closure gates

```text
CURRENT_EVENT_MAPPING=PASS_REQUIRED
ACTIVITY_TRUTH_KEY_DEDUPLICATION=PASS_REQUIRED
AUTHORITY_MATCH=PASS_REQUIRED
AS_OF_PARITY=PASS_REQUIRED
CORRECTION_REVERSAL_SUPPRESSION=PASS_REQUIRED
OBSERVED_ELIGIBLE_SUPPRESSED_RECONCILIATION=PASS_REQUIRED
NO_DOUBLE_COUNT=PASS_REQUIRED
UNIVERSAL_PROVIDER_TESTS=PASS_REQUIRED
CHART_READY_PROJECTION=PASS_REQUIRED
```

```text
REP_16_COMPLETE=NO
NEXT=REP_16A_ACTIVITY_EVENT_AUTHORITY_MAPPING_AND_SOURCE_PORT
```
