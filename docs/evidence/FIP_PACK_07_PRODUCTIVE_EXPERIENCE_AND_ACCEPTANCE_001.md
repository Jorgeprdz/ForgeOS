# FIP Pack 07 — Productive Experience and Acceptance

## Scope

Implements stages FIP-330 through FIP-350 in one governed pass.

## Delivered

- Alfred orchestration contract;
- fact, estimate, hypothesis, recommendation and approval-action separation;
- source health and freshness exposure;
- Home, Person, Activity, Reports and Alfred widget composition;
- responsive acceptance contract for mobile, tablet and desktop;
- mobile floating-navigation safe-zone requirement;
- logout scrub requirement;
- late-result rejection requirement;
- deterministic acceptance test.

## Authority

Alfred is the orchestrator. It does not replace Relationship Intelligence, Advisor Intelligence, Mick, Nash, Opportunity Intelligence or Business Intelligence.

```text
ALFRED_ROLE=ORCHESTRATOR
RELATIONSHIP_INTELLIGENCE=PERSON_CONTEXT
ADVISOR_INTELLIGENCE=ADVISOR_CONTEXT
MICK=EXECUTION_CONTEXT
NASH=COMMERCIAL_REASONING
OPPORTUNITY_INTELLIGENCE=OPERATION_CONTEXT
BUSINESS_INTELLIGENCE=BUSINESS_CONTEXT
```

## Productive surfaces

```text
HOME=DAILY_PRIORITY_AND_NASH
PERSON=RELATIONSHIP_CONTEXT
PIPELINE=CONTEXTUAL_PRIORITY
ACTIVITY=MICK_PATTERNS
REPORTS=BUSINESS_INTELLIGENCE
FORECAST=ESTIMATES_WITH_CONFIDENCE
NASH=COMMERCIAL_REASONING
ALFRED=CROSS_SYSTEM_ORCHESTRATION
```

## Required acceptance

```text
MOBILE=REQUIRED
TABLET=REQUIRED
DESKTOP=REQUIRED
FLOATING_MOBILE_NAV_SAFE_ZONE=REQUIRED
LOGOUT_SCRUB=REQUIRED
LATE_RESULT_REJECTION=REQUIRED
DEGRADED_SOURCE_DISCLOSURE=REQUIRED
UNKNOWN_AS_ZERO=FORBIDDEN
UI_STATE_AS_TRUTH=FORBIDDEN
```

## No-effect boundaries

```text
AUTOMATIC_MESSAGE=NO
AUTOMATIC_TASK=NO
AUTOMATIC_CALENDAR=NO
AUTOMATIC_PIPELINE_ADVANCE=NO
AUTOMATIC_OPPORTUNITY=NO
AUTOMATIC_APPLICATION=NO
AUTOMATIC_POLICY=NO
HUMAN_APPROVAL_REQUIRED=YES
```

## Verification

```bash
node tests/fip-pack-07-productive-experience-and-acceptance-test.mjs
```

Expected marker:

```text
FIP_PACK_07_PRODUCTIVE_EXPERIENCE_AND_ACCEPTANCE=PASS
```

## Honest exclusions

This pass defines the productive orchestration, widgets/read-model composition and acceptance contract. A real Pages deployment, browser visual evidence and live persistence are not claimed until their corresponding workflow and public acceptance evidence are reported.

```text
PACK=FIP_PACK_07_PRODUCTIVE_EXPERIENCE_AND_ACCEPTANCE
STAGES=FIP_330_TO_FIP_350
EXECUTION_MODE=ONE_PACK_ONE_PASS
BASE_PACK_06_HEAD=a787a593a82a599f2702d53fd03128d070b23c4b
MERGE_AUTHORIZATION=NOT_GRANTED
```
