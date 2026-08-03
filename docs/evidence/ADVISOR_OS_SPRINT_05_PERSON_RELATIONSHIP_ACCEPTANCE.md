# Advisor OS 1.0 — Sprint 05 Person Workspace and Relationship Intelligence

```text
SPRINT=05_PERSON_WORKSPACE_AND_RELATIONSHIP_INTELLIGENCE
EXECUTION_MODE=ONE_PASS
STATUS=CANDIDATE
```

## Existing productive authorities

```text
PERSON_WORKSPACE=CRS_09
RELATIONSHIP_INTELLIGENCE=CRS_10
UNIFIED_TIMELINE=CRS_08
POLICY_LINEAGE=CRS_07
NEXT_ACTION=NFAST_09
CONTEXTUAL_NOTIFICATIONS=SPRINT_04
```

Sprint 05 does not replace these authorities. It composes the already accepted Person Workspace and relationship intelligence for one confirmed CommercialPerson.

## Operating loop

```text
PERSON_LOCATOR
→ CRS_09_WORKSPACE
→ PERSON_REFERENCE_LOCK
→ CRS_10_INTELLIGENCE
→ CROSS_PERSON_REJECTION
→ PRIORITY_COMPOSITION
→ NEXT_USEFUL_ACTION
→ ADVISORY_NOTIFICATION_SIGNAL
```

## Required boundaries

```text
SECOND_PERSON_STORE=NO
SECOND_SCORE_ENGINE=NO
DIRECT_DATABASE_WRITE=NO
LOCAL_BUSINESS_CACHE=NO
UNKNOWN_AS_ZERO=NO
AUTO_EXECUTE=NO
AUTO_CONFIRM=NO
CROSS_PERSON_COMPOSITION=REJECTED
LATE_RESULT_AFTER_SCRUB=REJECTED
```

## Acceptance

- confirmed person identity remains CRS-09/CommercialPerson authority;
- policies, applications, quotes, opportunities and timeline remain source projections;
- CRS-10 intelligence remains reviewable and uncertainty-preserving;
- productivity proof remains advisor-scoped and is not attributed to a person;
- priority composition does not mutate business state;
- notification output is advisory only;
- person switch and logout invalidate late results;
- unavailable sources remain unavailable, never zero.

```text
SPRINT_05_ACCEPTANCE=PENDING_CI
MERGE_AUTHORIZATION=NOT_GRANTED
```
