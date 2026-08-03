# Advisor OS 1.0 — Sprint 11 UX, Onboarding and Public Acceptance

```text
DOCUMENT=ADVISOR_OS_SPRINT_11_UX_ONBOARDING_PUBLIC_ACCEPTANCE_001
STATUS=CANDIDATE
SPRINT=SPRINT_11_UX_ONBOARDING_AND_PUBLIC_ACCEPTANCE
BASE_SHA=1301d4407170619a98f8466d9e5d6460e20ec0c6
EXECUTION_MODE=ONE_PASS
```

## Objective

Close a coherent public advisor experience without redesigning the product, duplicating domain authorities or turning setup into a prerequisite for value.

```text
AUTHENTICATED_ENTRY
→ FIRST_USEFUL_VALUE
→ PROGRESSIVE_PREFERENCES
→ HONEST_SURFACE_STATE
→ ONE_DOMINANT_ACTION
→ RESPONSIVE_PRODUCTIVE_WORK
→ LOGOUT_SCRUB
```

## Existing product boundaries preserved

- Material 3 remains the canonical visual language.
- The floating mobile navigation remains floating.
- Pipeline remains the primary operating cockpit.
- Existing Product, Person, Pipeline, Portfolio, Forecast and Compensation authorities remain unchanged.
- The explicit demo account remains available only as synthetic, identified data with external side effects blocked.
- No productive database, RPC, domain or Supabase schema mutation is introduced.

## Progressive setup

The minimum preference contract contains:

```text
PROFILE_DISPLAY_NAME
TIME_ZONE
MONTHLY_POLICY_GOAL
NOTIFICATION_MODE
CAPTURE_MODE
```

Supported modes:

```text
NOTIFICATION_MODE=REAL_TIME|DIGEST|HYBRID|MUTED
CAPTURE_MODE=REAL_TIME|DIGEST|HYBRID
```

Missing preferences produce `PARTIAL`, never a setup wall:

```text
VALUE_BEFORE_SETUP=YES
SETUP_NON_BLOCKING=YES
HEAVY_ONBOARDING=NO
AUTOMATIC_DEFAULT_INVENTION=NO
```

Preference persistence follows:

```text
FORM_INPUT
→ NORMALIZED_DRAFT
→ VISIBLE_PREVIEW
→ EXPLICIT_CONFIRMATION
→ PRODUCTIVE_PREFERENCE_AUTHORITY
→ MUTATION_RECEIPT
```

The Sprint 11 runtime contains no preference database writer. Missing productive authority fails closed.

## Unified surface states

```text
LOADING
READY
EMPTY
PARTIAL
UNAVAILABLE
INVALID
SESSION_REQUIRED
```

Every state has understandable user-facing copy. Raw exceptions and private stack information are not rendered. Unknown values remain unknown.

## Interaction closure

Every audited surface must expose exactly one enabled, non-decorative primary action. Visible controls without an executable action or valid navigation target are rejected.

```text
ONE_DOMINANT_PRIMARY_ACTION=YES
DECORATIVE_DEAD_CONTROLS=0
RAW_ERROR_ONLY=REJECTED
```

## Mobile safe area

The canonical shell already defines:

```text
--forge-mobile-nav-height
--forge-mobile-nav-clearance
--forge-mobile-floating-gap
```

Sprint 11 accepts mobile content only when its bottom reservation includes those tokens and `env(safe-area-inset-bottom)`.

```text
NAV_PILL_REMAINS_FLOATING=YES
CONTENT_SCROLLS_ABOVE_NAV=YES
NO_HORIZONTAL_OVERFLOW=YES
```

## Demo boundary

The existing public demo is valid only when all are true:

```text
IS_DEMO=YES
DATA_CLASS=SYNTHETIC
EXPLICIT_LABEL=DATOS_FICTICIOS
EXTERNAL_EFFECTS_BLOCKED=YES
```

Synthetic data presented without the explicit demo boundary is rejected as `UNLABELED_DEMO_LEAKAGE_REJECTED`.

## Session safety

The experience runtime binds asynchronous results and preference previews to one advisor and one session generation.

```text
LOGOUT_SCRUB=REQUIRED
ADVISOR_SWITCH_SCRUB=REQUIRED
LATE_RESULT_REJECTION=REQUIRED
CROSS_SESSION_PREVIEW_REPLAY=REJECTED
```

## Public candidate acceptance matrix

The gate must pass all of:

```text
MOBILE_360_OR_EQUIVALENT
TABLET
DESKTOP
NEW_SESSION
RELOAD
LOGOUT_LOGIN
LOGOUT_SCRUB
LATE_RESULT_REJECTION
SLOW_NETWORK
PARTIAL_SOURCE
UNAVAILABLE_SOURCE
NO_HORIZONTAL_OVERFLOW
FLOATING_NAV_SAFE_AREA
RAW_ERROR_ONLY_REJECTED
UNKNOWN_AS_ZERO_REJECTED
```

Browser acceptance runs against a generated public candidate with no asset override and also reruns the authenticated session browser pack.

## Scope clarification

Sprint 11 proves the responsive public candidate and the productive shell contracts. Canonical release deployment, release-candidate tagging, evidence index and final production certificate remain Sprint 12 responsibilities.

## Forbidden outcomes

```text
FULL_PRODUCT_REDESIGN=0
SECOND_DESIGN_SYSTEM=0
SECOND_PROFILE_STORE=0
DIRECT_DATABASE_WRITE=0
DIRECT_RPC=0
BUSINESS_STATE_MUTATION=0
SETUP_BLOCKS_FIRST_VALUE=0
FLOATING_NAV_REMOVED=0
UNLABELED_DEMO_DATA=0
UNKNOWN_AS_ZERO=0
```

## Candidate receipt

```text
UNIFIED_UX=PENDING_CI
PROFILE_AND_PREFERENCES=PENDING_CI
LOGOUT_SCRUB=PENDING_CI
LATE_RESULT_REJECTION=PENDING_CI
PUBLIC_CANDIDATE_ACCEPTANCE=PENDING_CI
CONTROLLED_MERGE=NOT_YET_EXECUTED
```
