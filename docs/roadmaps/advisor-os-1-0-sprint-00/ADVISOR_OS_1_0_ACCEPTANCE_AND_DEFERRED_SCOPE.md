# Advisor OS 1.0 — Acceptance Matrix and Deferred Scope

```text
DOCUMENT=ADVISOR_OS_1_0_ACCEPTANCE_AND_DEFERRED_SCOPE
STATUS=CANDIDATE
SPRINT=SPRINT_00_SCOPE_AND_CLOSURE_LOCK
```

## 1. Evidence levels

| Level | Meaning | Closure use |
|---|---|---|
| Repository | Static contracts and deterministic tests pass | Necessary, never sufficient alone |
| Browser | Real browser flow passes against candidate assets | Required for productive UI work |
| Public | Canonical Pages deployment passes without overrides | Required for release-facing closure |
| Productive data | Real authenticated authority and owner scope confirmed | Required where a productive source exists |
| Human acceptance | The intended advisor workflow is understandable and usable | Required for Benvenù, Command Bar, capture and UX closure |

## 2. Global acceptance matrix

Every applicable sprint must prove:

```text
MOBILE_360_OR_EQUIVALENT=PASS
TABLET=PASS
DESKTOP=PASS
NEW_SESSION=PASS
RELOAD=PASS
LOGOUT_LOGIN=PASS
LOGOUT_SCRUB=PASS
LATE_RESULT_REJECTION=PASS
SLOW_NETWORK=PASS
PARTIAL_SOURCE=PASS
UNAVAILABLE_SOURCE=PASS
NO_HORIZONTAL_OVERFLOW=PASS
FLOATING_NAV_SAFE_AREA=PASS
RAW_ERROR_ONLY=REJECTED
UNKNOWN_AS_ZERO=REJECTED
```

## 3. Workflow acceptance matrix

| Workflow | Required result | Required evidence |
|---|---|---|
| First value | Benvenù produces one grounded insight/action before heavy setup | Repository, browser, human |
| Command read | Natural-language read resolves identity and returns authoritative data | Repository, browser, productive data |
| Command write | Mutation preview is reviewable and persists only after confirmation | Repository, browser, productive data |
| Appointment | Agenda, notification, outcome capture and next action remain continuous | Repository, browser, public |
| Bulk intake | Preview, validation, deduplication and idempotent retry work | Repository, browser, productive data |
| Quote sale | Person context reaches quote; outcome returns to Pipeline | Repository, browser, public |
| Conversion | Confirmed sale creates/reuses person-account-policy without duplicates | Repository, browser, productive data |
| Portfolio service | Policy context produces a governed service action and future follow-up | Repository, browser, public |
| Payment candidate | Signal is reconciled before being called paid | Repository, browser, productive data |
| Daily management | Activity, goal gap, Forecast, reports and compensation agree | Repository, browser, productive data |
| Release | Full story passes on canonical public deployment | Public, human |

## 4. Sprint-specific gates

```text
SPRINT_01_GATE=BENVENU_FIRST_VALUE_WITHOUT_FULL_SETUP
SPRINT_02_GATE=GLOBAL_COMMAND_BAR_READ_AND_REVIEWED_WRITE
SPRINT_03_GATE=NO_ACTIVE_PROSPECT_WITHOUT_RESOLUTION
SPRINT_04_GATE=CONTEXTUAL_NOTIFICATION_WITHOUT_STORM_OR_SILENT_MUTATION
SPRINT_05_GATE=VOICE_TEXT_ONE_TAP_TO_REVIEWED_STRUCTURED_RECORD
SPRINT_06_GATE=REAL_MARKET_IMPORT_WITH_RECONCILIATION
SPRINT_07_GATE=PIPELINE_QUOTE_ROUND_TRIP
SPRINT_08_GATE=PROSPECT_CLIENT_POLICY_CONTINUITY
SPRINT_09_GATE=CLIENT_360_AND_SERVICE_LOOP
SPRINT_10_GATE=ONE_CONSISTENT_BUSINESS_STORY
SPRINT_11_GATE=RESPONSIVE_PUBLIC_END_TO_END_ACCEPTANCE
SPRINT_12_GATE=ZERO_CRITICAL_OR_HIGH_OPEN_DEFECTS
```

## 5. Deferred-scope registry

The following are explicitly deferred and may not block Advisor OS 1.0:

| Deferred capability | Reason | Re-entry condition |
|---|---|---|
| Autonomous outbound messaging | Human approval and compliance risk | Separate governed release |
| Bidirectional Calendar synchronization | OAuth, conflict and external-save truth | After 1.0 calendar handoff is stable |
| Autonomous pipeline advancement | Risk of inventing commercial outcomes | Explicit policy and acceptance pack |
| Autonomous ML training | Learning governance not closed | Post-1.0 model lifecycle authority |
| Recruiting / Promotoria | Outside advisor-only scope | Separate product build tree |
| Manager surveillance dashboard | Advisor-first and privacy boundary | Development-use case with consent |
| Corporate administration | Not required for advisor loop | Separate administrative product |
| New intelligence authorities | Existing owners must stabilize first | Demonstrated unmet canonical need |
| Carrier-specific core logic | Violates Rule Pack separation | Externalized configurable rule pack |
| Full product redesign | Closure requires consistency, not reinvention | Post-1.0 design program |
| Deep email automation | Matching, consent and send authority unresolved | Separate integration release |
| Unbounded custom workflows | Creates support and authority ambiguity | Governed extension model |

## 6. Change-control rule

A new requirement may enter the final sprint only when all are true:

1. It blocks one locked end-to-end workflow.
2. It cannot be satisfied by an existing canonical capability.
3. Its owner and source-of-truth boundary are explicit.
4. It is assigned to exactly one sprint.
5. It includes acceptance and forbidden-mutation criteria.
6. Forge Product Authority approves the amendment.

Otherwise:

```text
DISPOSITION=DEFER_BEYOND_ADVISOR_OS_1_0
```

## 7. Release stop conditions

Advisor OS 1.0 cannot close while any are true:

```text
CRITICAL_OPEN_DEFECTS>0
HIGH_OPEN_DEFECTS>0
UNAPPROVED_PRODUCTIVE_MUTATIONS>0
UNKNOWN_RENDERED_AS_ZERO>0
DUPLICATE_IDENTITY_CREATION_UNRESOLVED>0
PUBLIC_ACCEPTANCE_WITH_ASSET_OVERRIDES=YES
LOGOUT_PRIVATE_DATA_REMAINS=YES
NATURAL_LANGUAGE_PERSISTS_WITHOUT_REVIEW=YES
EXTERNAL_APP_OPENED_CLAIMED_AS_COMPLETION=YES
```

## 8. Sprint 00 completion receipt target

```text
SCOPE_LOCKED=YES
MODULE_INVENTORY_RATIFIED=YES
END_TO_END_WORKFLOWS_DEFINED=YES
ACCEPTANCE_MATRIX_DEFINED=YES
DEFERRED_SCOPE_RECORDED=YES
DUPLICATE_CLOSURE_TASKS=0
NEXT=SPRINT_01_BENVENU_FIRST_VALUE
```
