# Advisor OS 1.0 — Canonical Module and Workflow Map

```text
DOCUMENT=ADVISOR_OS_1_0_MODULE_AND_WORKFLOW_MAP
STATUS=CANDIDATE
SPRINT=SPRINT_00_SCOPE_AND_CLOSURE_LOCK
```

## 1. Canonical module inventory

| Module / capability | 1.0 role | Closure sprint | Source-of-truth boundary |
|---|---|---|---|
| Authenticated Shell | Protect private operation and session lifecycle | Sprint 11 regression | Auth/session authority |
| Home | Show the best current action and concise operating state | Sprints 1, 3, 4, 10 | Projection only |
| Benvenù | Deliver first value before setup burden | Sprint 1 | Advisor Experience only |
| Command Bar / Alfred | Read, capture and prepare governed commands globally | Sprint 2 | Intent router, not mutation authority |
| Pipeline | Manage prospect commercial progression | Sprints 3, 7, 8 | Prospect/pipeline authority |
| People | Preserve canonical person identity and context | Sprints 6–9 | Canonical identity authority |
| Books / Bulk Intake | Bring real markets into Forge without recapture | Sprint 6 | Import/reconciliation authority |
| Activity / Timeline | Record confirmed commercial events | Sprints 3, 5, 10 | Canonical event authority |
| Next Action / Agenda | Keep every active case operationally resolved | Sprint 3 | Action/commitment authority |
| Notifications | Prompt resolution from grounded facts | Sprint 4 | Projection and delivery only |
| Clippy | Provide contextual help and withdraw after mastery | Sprint 4 | Advisor Experience only |
| Low-friction Input | Voice, natural language, one-tap and batch capture | Sprint 5 | Draft interpretation only until confirmation |
| Quotes | Create and version commercial proposals | Sprint 7 | Quote authority |
| Commercial Documents | Preview, print and PDF | Sprint 7 | Derived from canonical quote |
| Conversion | Reconcile prospect, person, account and policy | Sprint 8 | Governed command orchestration |
| Portfolio | Service clients, accounts and policies | Sprint 9 | Policy/account read and command boundaries |
| Forecast | Separate confirmed, in-process and weighted production | Sprint 10 | Forecast authority |
| Goals | Hold advisor targets and gaps | Sprints 1, 10 | Goal authority |
| Reports | Explain operational performance consistently | Sprint 10 | Read-only reconciled projections |
| Compensation | Show estimated, confirmed, payable and paid distinctly | Sprint 10 | Compensation authority |
| Profile / Preferences | Minimum self-service context and channel preferences | Sprint 11 | Advisor profile authority |
| Public Acceptance | Validate real deployment and responsive behavior | Sprint 11 | Evidence, not product truth |
| Release Candidate | Reconcile evidence and issue 1.0 closure | Sprint 12 | Release governance |

## 2. End-to-end workflows

### W1 — First value

```text
AUTHENTICATED_ENTRY
→ EXISTING_CONTEXT_DISCOVERY
→ ADVISOR_BASELINE_SNAPSHOT
→ FIRST_USEFUL_INSIGHT
→ ONE_RECOMMENDED_ACTION
→ COMMAND_BAR_INTRODUCTION_IN_CONTEXT
```

Owner: Sprint 1.

### W2 — Natural capture and next action

```text
ADVISOR_REPORTS_EVENT_BY_TEXT_OR_VOICE
→ PERSON_AND_CONTEXT_RESOLUTION
→ STRUCTURED_DRAFT
→ REVIEW_AND_CONFIRMATION
→ TIMELINE_EVENT
→ NEXT_ACTION
→ HOME_AND_AGENDA_REFRESH
```

Owners: Sprint 2 for routing; Sprint 5 for capture; Sprint 3 for action persistence.

### W3 — Appointment loop

```text
NEXT_ACTION_SCHEDULED
→ PRE_APPOINTMENT_CONTEXT
→ APPOINTMENT_DUE
→ POST_END_GRACE_PERIOD
→ OUTCOME_NOTIFICATION
→ ADVISOR_RESPONSE
→ STRUCTURED_OUTCOME_REVIEW
→ TIMELINE_AND_NEXT_ACTION_UPDATE
```

Owners: Sprint 3 agenda, Sprint 4 notification/Clippy, Sprint 5 capture.

### W4 — Prospect intake

```text
MANUAL_OR_FILE_INPUT
→ FIELD_MAPPING
→ NORMALIZATION
→ DUPLICATE_RECONCILIATION
→ BOOK_ASSIGNMENT
→ CANONICAL_PERSON_AND_PROSPECT
→ PIPELINE_VISIBILITY
```

Owner: Sprint 6.

### W5 — Commercial sale

```text
PROSPECT_CONTEXT
→ NEED_ANALYSIS
→ QUOTE_CREATION
→ DOCUMENT_PREVIEW_OR_PDF
→ PRESENTATION
→ COMMERCIAL_OUTCOME
→ NEXT_ACTION_OR_APPLICATION
```

Owner: Sprint 7.

### W6 — Conversion

```text
SALE_CONFIRMED
→ PERSON_RECONCILIATION
→ ACCOUNT_RECONCILIATION
→ POLICY_CREATE_OR_LINK
→ PIPELINE_CLOSURE
→ PORTFOLIO_VISIBILITY
→ FIRST_SERVICE_ACTION
```

Owner: Sprint 8.

### W7 — Portfolio service

```text
CLIENT_OR_POLICY_SIGNAL
→ SOURCE_AND_FRESHNESS_CHECK
→ SERVICE_OR_REVIEW_ACTION
→ ADVISOR_CONFIRMATION
→ TIMELINE_AND_PORTFOLIO_UPDATE
→ FUTURE_ACTION
```

Owner: Sprint 9.

### W8 — Payment candidate

```text
EMAIL_OR_PROVIDER_SIGNAL
→ PAYMENT_DETAILS_PARSE
→ POLICY_MATCH_CANDIDATE
→ ADVISOR_REVIEW
→ CANONICAL_PAYMENT_AUTHORITY_CONFIRM_OR_REJECT
→ PORTFOLIO_AND_OPTIONAL_CONTACT_ACTION
```

Owners: Sprint 4 projection, Sprint 9 portfolio context. Email alone is never payment truth.

### W9 — Daily management

```text
CONFIRMED_ACTIVITY
→ FUNNEL_MOVEMENT
→ FORECAST_UPDATE
→ GOAL_GAP
→ EXPLAINABLE_RECOVERY_PLAN
→ COMPENSATION_AND_REPORTS
```

Owner: Sprint 10, consumed by Sprint 4 notifications.

### W10 — Release acceptance

```text
REAL_PUBLIC_DEPLOYMENT
→ AUTHENTICATED_MOBILE_TABLET_DESKTOP_TESTS
→ COMPLETE_W1_TO_W9_SCENARIOS
→ LOGOUT_SCRUB
→ LATE_RESULT_REJECTION
→ EVIDENCE_RECONCILIATION
→ RELEASE_CANDIDATE
```

Owners: Sprints 11 and 12.

## 3. Cross-workflow invariants

```text
CANONICAL_IDENTITY_REUSED=YES
DUPLICATE_CAPTURE=0
NATURAL_LANGUAGE_IS_DRAFT=YES
WRITE_REQUIRES_CONFIRMATION=YES
READ_CAN_BE_IMMEDIATE_WHEN_UNAMBIGUOUS=YES
UNKNOWN_AS_ZERO=NO
UI_STATE_AS_TRUTH=NO
OPEN_EXTERNAL_APP_IS_COMPLETION=NO
NOTIFICATION_IS_SOURCE_OF_TRUTH=NO
LOGOUT_SCRUB_REQUIRED=YES
LATE_RESULT_REJECTION_REQUIRED=YES
```

## 4. Single-owner assignment

No gap may be implemented independently in two sprints. Shared consumption is allowed; ownership remains:

```text
BENVENU_AND_CLIPPY_OWNER=ADVISOR_EXPERIENCE
COMMAND_INTENT_OWNER=COMMAND_BAR
NEXT_ACTION_OWNER=AGENDA_ACTION_AUTHORITY
NATURAL_LANGUAGE_DRAFT_OWNER=LOW_FRICTION_INPUT
PROSPECT_STAGE_OWNER=PIPELINE
QUOTE_OWNER=QUOTES
POLICY_OWNER=PORTFOLIO_POLICY_AUTHORITY
PAYMENT_OWNER=PAYMENT_AUTHORITY
ACTIVITY_OWNER=CANONICAL_ACTIVITY_EVENTS
FORECAST_OWNER=FORECAST
COMPENSATION_OWNER=COMPENSATION
```
