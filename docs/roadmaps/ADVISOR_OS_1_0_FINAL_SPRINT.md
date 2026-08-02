# Advisor OS 1.0 — Final Sprint

```text
DOCUMENT=ADVISOR_OS_1_0_FINAL_SPRINT
STATUS=ACTIVE
DATE=2026-08-02
OWNER=FORGE_PRODUCT_AUTHORITY
PARENT=ADVISOR_OS_1_0_CLOSURE_ROADMAP
TARGET=ADVISOR_OS_1_0
EXECUTION_MODE=END_TO_END_CLOSURE
```

## 1. Final objective

The final sprint closes one continuous advisor experience:

```text
ENTER_FORGE
→ RECEIVE_FIRST_VALUE
→ SEE_BEST_NEXT_ACTION
→ REPORT_WHAT_HAPPENED
→ FORGE_INTERPRETS_AND_REQUESTS_CONFIRMATION
→ CANONICAL_STATE_UPDATES
→ QUOTE_AND_SELL
→ CONVERT_TO_CLIENT_AND_POLICY
→ SERVICE_PORTFOLIO
→ MEASURE_BUSINESS
```

The sprint is not organized around isolated screens. It is organized around complete productive loops.

## 2. Locked sequence

```text
SPRINT_00=SCOPE_AND_CLOSURE_LOCK
SPRINT_01=BENVENU_FIRST_VALUE
SPRINT_02=COMMAND_BAR_PRODUCTIVE_CONNECTION
SPRINT_03=NEXT_ACTION_AND_AGENDA
SPRINT_04=CONTEXTUAL_NOTIFICATIONS_AND_CLIPPY
SPRINT_05=LOW_FRICTION_INPUT
SPRINT_06=BULK_INTAKE_AND_BOOKS
SPRINT_07=PIPELINE_TO_QUOTES
SPRINT_08=PROSPECT_TO_CLIENT_AND_POLICY
SPRINT_09=PORTFOLIO_SERVICE
SPRINT_10=ACTIVITY_FORECAST_REPORTS_COMPENSATION
SPRINT_11=UX_ONBOARDING_AND_PUBLIC_ACCEPTANCE
SPRINT_12=ADVISOR_OS_1_0_RELEASE
```

## 3. SPRINT 00 — Scope and closure lock

### Objective

Freeze Advisor OS 1.0 scope and establish one evidence-based closure authority.

### Required outputs

- Final module inventory
- End-to-end workflow map
- Acceptance matrix
- Deferred-scope registry
- One authority per fact, command and mutation
- Traceability from every open gap to one sprint

### Gate

```text
SCOPE_LOCKED=YES
NEW_MODULES=FORBIDDEN
END_TO_END_MAP=RATIFIED
DUPLICATE_AUTHORITIES=0
```

## 4. SPRINT 01 — Benvenù first value

### Objective

Prove that Forge delivers value before asking for setup or capture.

### Required outputs

- Advisor Baseline Snapshot
- First meaningful insight
- First recommended action
- Product or revenue focus when supported
- Revenue Intelligence introduction
- Command OS introduction through a useful action

### Rules

```text
NOT_A_TUTORIAL=YES
NOT_A_FORM=YES
NOT_A_PDF=YES
VALUE_BEFORE_WORK=YES
ONE_USEFUL_ACTION_BEFORE_SETUP=YES
```

### Gate

```text
BENVENU_FIRST_VALUE=PASS
FIRST_ACTION_RELEVANT=PASS
HEAVY_ONBOARDING=REJECTED
FIRST_VALUE_WITH_PARTIAL_CONTEXT=PASS
```

## 5. SPRINT 02 — Command Bar productive connection

### Objective

Make Alfred / Command Bar the global low-friction channel for reading, capture and governed action.

### Required capabilities

#### Read

- Who should I call today?
- Show overdue follow-ups.
- How am I doing against my goal?
- Find a person, policy, quote or action.

#### Capture

- Register that I spoke with Juan and will call Thursday.
- I met with Laura; she is interested in Vida Mujer.
- Pedro did not attend; prepare a reschedule.

#### Action

- Create a quote for Ana.
- Open Fernanda's policy.
- Prepare an appointment for Carlos tomorrow at 18:00.

### Contract

```text
READ_COMMAND=IMMEDIATE
WRITE_COMMAND=PREVIEW_REQUIRED
AMBIGUOUS_COMMAND=CONTEXTUAL_RESOLUTION_REQUIRED
NATURAL_LANGUAGE=DRAFT
USER_CONFIRMATION=TRUTH
```

### Gate

```text
GLOBAL_ACCESS=PASS
TEXT_INPUT=PASS
VOICE_INPUT=PASS
PERSON_AND_CONTEXT_RESOLUTION=PASS
READ_COMMANDS=PASS
WRITE_PREVIEW=PASS
CANONICAL_COMMAND_EXECUTION=PASS
```

## 6. SPRINT 03 — Next action and Agenda

### Objective

Ensure no active prospect remains without an operational resolution.

```text
NEXT_ACTION_SCHEDULED
WAITING_FOR_EXTERNAL_EVENT
CLOSED_WON
CLOSED_NOT_NOW
CLOSED_LOST
DISCARDED
```

### Required outputs

- Daily and weekly Agenda
- Overdue and waiting views
- Completion, reschedule and cancellation
- Google Calendar prefill handoff
- Timeline continuity
- Home binding to real work

### Gate

```text
ACTIVE_PROSPECT_WITHOUT_RESOLUTION=REJECTED
DAILY_AGENDA=PASS
WEEKLY_AGENDA=PASS
OVERDUE_ACTIONS=PASS
TIMELINE_CONTINUITY=PASS
```

## 7. SPRINT 04 — Contextual notifications and Clippy

### Objective

Intervene when something was scheduled, occurred, remains unknown or is at risk.

### Minimum notification families

- Appointment preparation
- Appointment outcome confirmation
- Follow-up due or overdue
- Daily goal gap
- Midday recovery
- End-of-day closure
- Payment match candidate
- Payment risk
- Renewal or anniversary
- Proposal follow-up
- Application/document blocker
- New lead response window
- Prospect stagnation
- Commitment reminder
- Forecast risk
- Source or synchronization degradation

### Clippy role

- Explain only in context
- Never block work
- Suggest Command Bar when it shortens the task
- Suppress help after demonstrated mastery
- Preserve evidence, confidence and upstream ownership

### Gate

```text
CONTEXTUAL_TRIGGERING=PASS
NOTIFICATION_DEDUPLICATION=PASS
QUIET_HOURS=PASS
CLIPPY_CONTEXT_MATCH=PASS
HELP_SUPPRESSION_AFTER_MASTERY=PASS
UNAPPROVED_MUTATIONS=0
```

## 8. SPRINT 05 — Low-friction input

### Objective

Allow the advisor to feed Forge in seconds without becoming a data-entry operator.

### Required mechanisms

- Voice input
- Natural-language text
- One-tap outcomes
- Intelligent defaults
- Progressive profiling
- Exception-based questions
- Batch review
- Imported context
- Reviewable AI interpretation
- Immediate value returned after capture

### Constitutional rules

```text
ASK_ONLY_WHAT_IS_UNKNOWN=YES
PREFER_VOICE_AND_ONE_TAP=YES
INFER_BUT_NEVER_INVENT=YES
REVIEW_BEFORE_PERSISTENCE=YES
DUPLICATE_CAPTURE=0
VALUE_RETURNED_AFTER_INPUT=YES
```

### Gate

```text
VOICE_TO_STRUCTURED_DRAFT=PASS
ONE_TAP_OUTCOMES=PASS
PROGRESSIVE_CAPTURE=PASS
BATCH_REVIEW=PASS
IMMEDIATE_VALUE_RETURN=PASS
```

## 9. SPRINT 06 — Bulk intake and Books

### Objective

Allow an advisor to start with a real market instead of manual recapture.

### Required outputs

- CSV import
- XLSX import
- Proyecto 200 import
- Contacts import
- Preview and row validation
- Duplicate reconciliation
- Idempotent retry
- Books create, move, archive and filter
- Default newest-first sorting

### Gate

```text
CSV_IMPORT=PASS
XLSX_IMPORT=PASS
PROJECT_200_IMPORT=PASS
DUPLICATE_RECONCILIATION=PASS
BOOKS=PASS
```

## 10. SPRINT 07 — Pipeline to Quotes

### Objective

Close the commercial loop without duplicate capture.

```text
PERSON
→ APPOINTMENT
→ NEED
→ QUOTE
→ DOCUMENT
→ PRESENTATION
→ OUTCOME
→ NEXT_ACTION
```

### Gate

```text
PERSON_TO_QUOTE=PASS
QUOTE_TO_PIPELINE=PASS
CANONICAL_IDENTITY_PRESERVED=PASS
PDF_PREVIEW=PASS
PRINT=PASS
DOWNLOAD=PASS
REOPEN=PASS
OUTCOME_CAPTURE=PASS
```

## 11. SPRINT 08 — Prospect to client and policy

### Objective

Close the governed conversion from sale to Portfolio.

```text
CONFIRMED_SALE
→ PERSON_RECONCILIATION
→ ACCOUNT_RECONCILIATION
→ POLICY_CREATE_OR_LINK
→ PIPELINE_CLOSURE
→ PORTFOLIO_VISIBILITY
```

### Gate

```text
PROSPECT_TO_CLIENT=PASS
PERSON_RECONCILIATION=PASS
ACCOUNT_RECONCILIATION=PASS
POLICY_DUPLICATE_PROTECTION=PASS
TIMELINE_CONTINUITY=PASS
```

## 12. SPRINT 09 — Portfolio service

### Objective

Make Portfolio a conservation and future-opportunity operating loop.

### Required outputs

- Client 360
- Policy detail
- Payments and important dates
- Reviews and service actions
- Anniversaries and renewals
- Clients without recent contact
- Complementary quote entry
- Honest partial and unavailable states

### Gate

```text
CLIENT_360=PASS
POLICY_DETAIL=PASS
FUTURE_RADAR=PASS
SERVICE_ACTIONS=PASS
UNKNOWN_AS_ZERO=REJECTED
```

## 13. SPRINT 10 — Activity, Forecast, Reports and Compensation

### Objective

Make every management surface tell the same business story.

```text
ACTIVITY
→ FUNNEL
→ PRODUCTION
→ FORECAST
→ GOAL
→ COMPENSATION
→ REPORTS
```

### Gate

```text
ACTIVITY_SOURCE_OF_TRUTH=PASS
FUNNEL=PASS
FORECAST_TRUTH_LABELS=PASS
GOAL_GAP=PASS
COMPENSATION_TRUTH=PASS
REPORTS_RECONCILIATION=PASS
```

## 14. SPRINT 11 — UX, onboarding and public acceptance

### Required UX closure

- One dominant primary action per surface
- Useful empty and partial states
- Understandable errors
- Mobile, tablet and desktop acceptance
- Floating-navigation safe area
- No decorative dead controls
- No productive demo leakage

### Required setup preferences

- Profile
- Time zone
- Goal
- Notification mode
- Capture mode: real-time, digest or hybrid

### Acceptance matrix

```text
MOBILE
TABLET
DESKTOP
NEW_SESSION
RELOAD
LOGOUT_LOGIN
SLOW_NETWORK
PARTIAL_SOURCE
UNAVAILABLE_SOURCE
PUBLIC_PAGES
```

### Gate

```text
UNIFIED_UX=PASS
PROFILE_AND_PREFERENCES=PASS
LOGOUT_SCRUB=PASS
LATE_RESULT_REJECTION=PASS
PUBLIC_ACCEPTANCE=PASS
```

## 15. SPRINT 12 — Advisor OS 1.0 release

### Required outputs

- Release candidate commit
- Canonical deployment
- Evidence index
- Known-limitations register
- Deferred-scope register
- Operational onboarding guide
- End-to-end demonstration script
- Release acceptance certificate

### Final gate

```text
BENVENU=PASS
COMMAND_BAR=PASS
AGENDA=PASS
NOTIFICATIONS=PASS
CLIPPY=PASS
LOW_FRICTION_INPUT=PASS
BULK_INTAKE=PASS
BOOKS=PASS
PIPELINE=PASS
QUOTES=PASS
CONVERSION=PASS
PORTFOLIO=PASS
ACTIVITY=PASS
FORECAST=PASS
REPORTS=PASS
COMPENSATION=PASS
PUBLIC_ACCEPTANCE=PASS
CRITICAL_DEFECTS=0
HIGH_DEFECTS=0
UNAPPROVED_MUTATIONS=0
UNKNOWN_AS_ZERO=0

ADVISOR_OS_1_0=COMPLETE
```

## 16. Mandatory demonstration path

```text
1. Advisor enters Forge for the first time.
2. Benvenù produces a real priority.
3. Command Bar executes the shortest useful path.
4. Forge prepares and later confirms an appointment outcome.
5. Advisor dictates what happened.
6. Forge structures the result and requests confirmation.
7. Timeline, next action, Pipeline and Forecast update through canonical authorities.
8. Advisor creates and presents a quote.
9. Sale is confirmed.
10. Person, account and policy are reconciled.
11. Portfolio schedules service.
12. A payment signal arrives and is reviewed.
13. Activity, Forecast, Reports and Compensation reconcile.
```

## 17. Execution start

```text
FINAL_SPRINT_AUTHORITY=ACTIVE
NEXT=SPRINT_00_SCOPE_AND_CLOSURE_LOCK
THEN=SPRINT_01_BENVENU_FIRST_VALUE
THEN=SPRINT_02_COMMAND_BAR_PRODUCTIVE_CONNECTION
```

No later sprint may begin by bypassing unresolved authority, identity, data-truth or acceptance gaps from an earlier sprint.
