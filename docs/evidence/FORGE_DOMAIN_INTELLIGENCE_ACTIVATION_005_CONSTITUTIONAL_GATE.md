# Forge Domain Intelligence Activation 005 — Constitutional Gate

```text
PHASE=FORGE_DOMAIN_INTELLIGENCE_ACTIVATION_005
BRANCH=feature/forge-domain-intelligence-activation-005
BASE_SHA=4332ee1c0d7bb84858d412fd84be50d0861d9eee

PHASE004_ACCEPTANCE=PASS
PHASE004_HEAD=4332ee1c0d7bb84858d412fd84be50d0861d9eee
CROSS_DOMAIN_DECISION_PROJECTION_AVAILABLE=YES
FORECAST_RUNTIME_AUTHORITY_RESOLVED=YES
REVENUE_TRUTH_STATE_AUTHORITY_RESOLVED=YES
PHASE005_BRANCH_BASES_ON_PHASE004=YES
```

## Purpose

Phase005 activates already-existing Forge intelligence inside the workspaces that own the corresponding human decision. It does not create a new business brain, score, source of truth, persistence layer, or autonomous execution path.

The required flow is:

```text
AUTHORITY
→ INTELLIGENCE
→ DECISION PROJECTION
→ OWNING WORKSPACE
→ EXPLANATION
→ HUMAN ACTION
→ OWNING DOMAIN EVENT
```

The Cross-Domain Decision Projection remains a neutral read-only transport/presentation contract. Source authorities retain ownership of business meaning.

## Upstream authority lock

```text
RELATIONSHIP_AUTHORITY=FIP_PACK_01_RELATIONSHIP_INTELLIGENCE
ADVISOR_MICK_AUTHORITY=FIP_PACK_02_ADVISOR_INTELLIGENCE_AND_MICK
NASH_AUTHORITY=FIP_PACK_03_NASH_AND_CONVERSATION_INTELLIGENCE
OPPORTUNITY_AUTHORITY=FIP_PACK_04_OPPORTUNITY_AND_OPERATION
CROSS_DOMAIN_PROJECTION=FORGE_CROSS_DOMAIN_DECISION_PROJECTION
CROSS_DOMAIN_PROJECTION_CONTRACT=FCDP-004-001

FORECAST_RUNTIME_OWNER=MANAGER_OS_FORECAST
CURRENT_COMPOSITION=ADVISOR_FORECAST_COMPOSER_V3
CURRENT_DECISION_READ_MODEL=ADVISOR_FORECAST_READ_MODEL_V3
PACE_PROJECTION_OWNER=SMNYL_PACE_FORECAST_ENGINE
SCENARIO_CONTEXT_OWNER=MANAGER_ADVISOR_FORECAST_ENGINE

REVENUE_TRUTH_STATE_AUTHORITY=revenue/revenue-value.js
TIMELINE_AUTHORITY=CRS_08_UNIFIED_PERSON_TIMELINE
```

## Constitutional prohibitions

```text
NEW_SOURCE_OF_TRUTH=FORBIDDEN
NEW_BUSINESS_ENGINE=FORBIDDEN
NEW_PRODUCT_ENGINE=FORBIDDEN
NEW_PRIORITY_ENGINE=FORBIDDEN
NEW_GLOBAL_SCORE=FORBIDDEN
NEW_FORECAST_ENGINE=FORBIDDEN
NEW_REVENUE_FORMULA=FORBIDDEN

FRONTEND_BUSINESS_HEURISTICS=FORBIDDEN
FRONTEND_PRIORITY_RECALCULATION=FORBIDDEN
FRONTEND_CONFIDENCE_RECALCULATION=FORBIDDEN
FRONTEND_IMPACT_RECALCULATION=FORBIDDEN

AUTOMATIC_COMMERCIAL_ACTION=FORBIDDEN
AUTOMATIC_MESSAGE_SEND=FORBIDDEN
AUTOMATIC_TASK_WITHOUT_AUTHORITY=FORBIDDEN
AUTOMATIC_PIPELINE_ADVANCE=FORBIDDEN
AUTOMATIC_IDENTITY_MERGE=FORBIDDEN

DIRECT_CANONICAL_DATABASE_WRITE_FROM_UI=FORBIDDEN
SERVICE_ROLE_IN_BROWSER=FORBIDDEN
RLS_BYPASS=FORBIDDEN

HOME_REBUILD=FORBIDDEN
GLOBAL_AURA_REDESIGN=FORBIDDEN
NEW_VISUAL_SYSTEM=FORBIDDEN
```

## Required invariants

```text
ONE_MEANING_ONE_OWNER=REQUIRED

UNKNOWN_IS_NOT_ZERO=REQUIRED
ESTIMATE_IS_NOT_FACT=REQUIRED
FORECAST_IS_NOT_GUARANTEE=REQUIRED
GENERATED_IS_NOT_PAID=REQUIRED
RECOMMENDATION_IS_NOT_EXECUTION=REQUIRED

HUMAN_DECISION_CHECKPOINT=REQUIRED
SOURCE_AUTHORITY_PROVENANCE=REQUIRED
EVIDENCE_PRESERVATION=REQUIRED

RLS_AND_TENANT_ISOLATION=REQUIRED
SESSION_SCRUB=REQUIRED
LATE_RESULT_REJECTION=REQUIRED
```

## Domain-first boundary

Implementation order is locked to:

```text
1. PIPELINE
2. PERSON / COMMERCIAL RELATIONSHIP
3. CARTERA
4. ACTIVITY
5. COACH / REPORTS — ONLY WHERE PRODUCTIVE AUTHORITY IS PROVEN
```

```text
DOMAIN_FIRST=YES
HOME_LATER=YES
HOME_REBUILD=NO
GLOBAL_AURA_REDESIGN=NO
```

Each module must be traced before modification:

```text
TRACE EXISTING SURFACE
→ TRACE EXISTING ADAPTER
→ TRACE EXISTING AUTHORITY
→ TRACE EXISTING DECISION PROJECTION
→ IDENTIFY GAP
→ MAKE MINIMAL WIRING CHANGE
```

Allowed surface dispositions:

```text
KEEP
WIRE_INTELLIGENCE
RECOMPOSE_LOCALLY
DEFER
```

`GLOBAL_REBUILD` is not available in Phase005.

## Human action boundary

Every visible decision action must preserve:

```text
actionOwner
actionTarget
destination/boundary
humanDecisionRequired=true
```

The projection may format, render, and route/delegate. It may not execute the commercial action or mutate canonical truth.

Feedback must remain:

```text
decision
→ human action
→ owning domain
→ canonical event/evidence
→ authority recalculates later
```

## Identity boundary

```text
Pipeline Prospect
→ may remain UNRESOLVED
→ candidate projection
→ explicit human identity decision
→ CommercialPerson
```

```text
name_auto_merge=FORBIDDEN
phone_auto_merge=FORBIDDEN
email_auto_merge=FORBIDDEN
fuzzy_auto_merge=FORBIDDEN
AI_identity_merge=FORBIDDEN
score_identity_merge=FORBIDDEN
```

## Unknown, freshness and conflict boundary

Supported decision lifecycle must preserve at least:

```text
ACTIVE
STALE
EXPIRED
RESOLVED
BLOCKED
SOURCE_UNAVAILABLE
```

```text
UNKNOWN_TO_ZERO=FORBIDDEN
UNKNOWN_TO_FALSE=FORBIDDEN
STALE_AS_CURRENT=FORBIDDEN
SOURCE_UNAVAILABLE_AS_HEALTHY=FORBIDDEN
CONFLICT_AUTO_WINNER=FORBIDDEN
```

A cross-authority conflict must retain `winner=null` and must not create an arbitration score.

## Economic semantic boundary

The existing Revenue Value buckets are preserved without reinterpretation:

```text
potential
pending_policy_confirmation
pending_payment
payment_confirmed
earned_estimated
paid_confirmed
reversed
cancelled
unknown
blocked
not_modeled
hidden_by_scope
```

```text
FORECAST_IS_REVENUE_TRUTH=NO
GENERATED_EQUALS_PAID=NO
NEW_ECONOMIC_TAXONOMY=FORBIDDEN
```

## Security boundary

All productive reads and actions must remain inside existing governed boundaries:

```text
AUTH_SESSION_SCOPE=REQUIRED
RLS=REQUIRED
TENANT_ISOLATION=REQUIRED
ADVISOR_OWNERSHIP=REQUIRED
LOGOUT_SCRUB=REQUIRED
ADVISOR_SWITCH_SCRUB=REQUIRED
LATE_RESULT_REJECTION=REQUIRED
```

Forbidden:

```text
service_role
admin bypass
cross-advisor query
unscoped tenant cache
global browser singleton containing tenant data
```

## Scope lock

### IN SCOPE

```text
Pipeline intelligence wiring
Person intelligence wiring
Cartera intelligence wiring
Activity intelligence wiring
minimal local UI composition
decision projection adapters where justified
deep links/action boundaries
tests
CI
architecture docs
acceptance evidence
```

### OUT OF SCOPE

```text
Home rebuild
global Dashboard redesign
global Aura redesign
Quotes product-specific expansion
GMM Quote completion
Income redesign
new Revenue algorithms
new compensation formulas
Alfred autonomous ranking
new agentic execution
automatic communication
new Product Intelligence
new Supabase schema
new global persistence
Beta release
production deployment
```

## Stop conditions

If activation requires a new decision table, recommendation engine, priority engine, relationship score, Timeline, CommercialPerson, Portfolio rule set, Activity points formula, Revenue semantic taxonomy, copied frontend formula, automatic conflict winner, or automatic identity merge:

```text
STOP
DOCUMENT_ARCHITECTURAL_GAP=YES
DO_NOT_PATCH_AROUND_IT=YES
```

## Merge and deployment lock

```text
MERGE_TO_MAIN=NO
PRODUCTION_DEPLOYMENT=NO
```

These values remain locked until explicit authorization after Phase005 acceptance.
