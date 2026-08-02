# Advisor OS 1.0 — Closure Roadmap

```text
DOCUMENT=ADVISOR_OS_1_0_CLOSURE_ROADMAP
STATUS=ACTIVE
DATE=2026-08-02
OWNER=FORGE_PRODUCT_AUTHORITY
TARGET=ADVISOR_OS_1_0
BASELINE_ESTIMATE=80_PERCENT_COMPLETE
TARGET_STATE=END_TO_END_PRODUCTIVE_CLOSURE
```

## 1. Purpose

This roadmap defines the shortest governed route from the current Advisor OS implementation to a complete, demonstrable, implementable and sellable Advisor OS 1.0.

The remaining work must not be treated as a collection of isolated modules. Closure is achieved only when the advisor can complete the full commercial operating cycle without broken handoffs, duplicate capture, invented data or hidden manual gaps.

```text
PROSPECT_ENTERED
→ PROSPECT_WORKED
→ NEED_ANALYZED
→ QUOTE_CREATED
→ PROPOSAL_PRESENTED
→ SALE_CONFIRMED
→ CLIENT_AND_POLICY_CREATED
→ PORTFOLIO_SERVICED
→ BUSINESS_MEASURED
```

## 2. Scope lock

Advisor OS 1.0 includes only the productive operating system required by an insurance advisor.

### Included

- Authenticated private shell
- Home and daily plan
- Pipeline and people
- Books and bulk prospect intake
- Activity and timeline
- Next actions and agenda
- Quotes and commercial presentations
- Prospect-to-client conversion
- Portfolio and policy servicing
- Forecast and goals
- Reports
- Compensation read experience
- Basic profile and onboarding
- Mobile, tablet and desktop acceptance

### Deferred beyond 1.0

- Autonomous outbound messages
- Autonomous calendar mutation
- Autonomous pipeline advancement
- New intelligence engines
- New dashboards without an operational closure dependency
- Recruiting and promotoria modules
- Corporate administration
- Deep OAuth integrations
- Unbounded customization
- Full redesign of already productive surfaces

```text
NEW_MODULES_DURING_CLOSURE=FORBIDDEN
AUTONOMOUS_BUSINESS_ACTIONS=FORBIDDEN
HUMAN_APPROVAL_REQUIRED=YES
UNKNOWN_AS_ZERO=FORBIDDEN
UI_STATE_AS_TRUTH=FORBIDDEN
```

## 3. Closure principles

1. Close workflows, not folders.
2. Reuse canonical identities and authorities.
3. Avoid duplicate capture across modules.
4. Preserve unknown, unavailable and partial states honestly.
5. Every active prospect must have a defined next state.
6. No productive mutation may occur without explicit user confirmation.
7. Every phase must finish with repository, browser and public acceptance evidence where applicable.
8. Mobile acceptance must preserve the deliberately floating navigation and reserve sufficient content safe area.
9. A feature is not complete because it renders; it is complete when its upstream and downstream handoffs pass.
10. No phase may claim closure while relying on demo-only data or test overrides.

## 4. Baseline and completion model

The current implementation is estimated at approximately 80% of Advisor OS 1.0 when weighted across architecture, productive functionality, end-to-end continuity and public UX.

```text
ARCHITECTURE_AND_GOVERNANCE≈90%
CORE_PRODUCTIVE_FUNCTIONS≈82%
PRODUCTIVE_UX≈75%
END_TO_END_CLOSURE≈70%
WEIGHTED_BASELINE≈80%
```

The remaining 20% is concentrated in handoffs, reconciliation, continuous productive data, unified interaction patterns and final end-to-end acceptance.

## 5. Execution sequence

```text
PASS_00=SCOPE_LOCK_AND_CLOSURE_AUTHORITY
PASS_01=BULK_INTAKE_AND_BOOKS
PASS_02=NEXT_ACTION_AND_AGENDA_LOOP
PASS_03=PIPELINE_TO_QUOTES_COMMERCIAL_LOOP
PASS_04=PROSPECT_TO_CLIENT_AND_POLICY_CONVERSION
PASS_05=PRODUCTIVE_PORTFOLIO_SERVICE_LOOP
PASS_06=ACTIVITY_FORECAST_REPORTS_COMPENSATION_RECONCILIATION
PASS_07=UNIFIED_UX_CLOSURE
PASS_08=PROFILE_AND_ONBOARDING
PASS_09=END_TO_END_PUBLIC_ACCEPTANCE
PASS_10=ADVISOR_OS_1_0_RELEASE_CANDIDATE
```

---

# PASS 00 — Scope lock and closure authority

## Objective

Create one canonical source of truth for Advisor OS 1.0 closure and stop scope expansion.

## Deliverables

- Ratified Advisor OS 1.0 module inventory
- Canonical end-to-end workflow map
- Acceptance matrix by workflow and viewport
- Explicit deferred-scope registry
- Closure dashboard based on evidence, not self-reported percentages
- Traceability from each remaining gap to one pass only

## Exit criteria

```text
SCOPE_LOCKED=YES
MODULE_INVENTORY_RATIFIED=YES
END_TO_END_WORKFLOWS_DEFINED=YES
DEFERRED_SCOPE_RECORDED=YES
DUPLICATE_CLOSURE_TASKS=0
NEW_MODULES_FORBIDDEN=YES
```

---

# PASS 01 — Bulk intake and books

## Objective

Allow an advisor to begin operating without manually recapturing an existing market.

## Product flow

```text
FILE_OR_MANUAL_ENTRY
→ FIELD_MAPPING
→ NORMALIZATION
→ DUPLICATE_RECONCILIATION
→ BOOK_ASSIGNMENT
→ PROSPECT_CREATION
→ PIPELINE_VISIBILITY
```

## Deliverables

### Individual capture

Minimum productive fields:

- Name
- Primary phone
- Email when available
- Source
- Book
- Entry date
- Initial context

### Bulk intake

- CSV import
- XLSX import
- Proyecto 200 mapping
- Contacts-export mapping
- Import preview
- Row-level validation
- Partial-success receipt
- Retry without duplication

### Books

- Create book
- Rename book
- Archive book
- Assign and move prospects
- Filter by book
- Default `Proyecto 200` creation when the recognized template is imported
- No proliferation of permanent UI buttons

### Sorting

- Default newest-first
- Name ascending/descending
- Entry date ascending/descending
- Compact contextual control

### Reconciliation

- Exact phone match
- Normalized phone match
- Email match
- Probable name match
- Explicit skip, merge or create-new decision
- No silent overwrite

## Exit criteria

```text
SINGLE_PROSPECT_CREATE=PASS
CSV_IMPORT=PASS
XLSX_IMPORT=PASS
PROJECT_200_IMPORT=PASS
IMPORT_PREVIEW=PASS
PARTIAL_FAILURE_RECEIPT=PASS
IDEMPOTENT_RETRY=PASS
DUPLICATE_RECONCILIATION=PASS
BOOK_CREATE_MOVE_ARCHIVE=PASS
DEFAULT_SORT_NEWEST_FIRST=PASS
MOBILE_IMPORT_ACCEPTANCE=PASS
```

---

# PASS 02 — Next action and agenda loop

## Objective

Ensure no active prospect becomes operationally invisible.

## Canonical prospect work states

Every active prospect must resolve to exactly one of:

```text
NEXT_ACTION_SCHEDULED
WAITING_FOR_EXTERNAL_EVENT
CLOSED_WON
CLOSED_NOT_NOW
CLOSED_LOST
DISCARDED
```

A generic `FOLLOW_UP` state without a defined action is insufficient.

## Deliverables

### Next-action contract

Every completed interaction may define:

- Action type
- Due date
- Optional time
- Channel
- Context note
- Responsible advisor
- Waiting reason when applicable

### Agenda

- Today
- Upcoming
- Overdue
- Waiting
- Daily and weekly views
- Completion, reschedule and cancellation
- Direct navigation to person context

### Calendar handoff

Initial 1.0 implementation:

```text
FORGE_EVENT_MODAL
→ DATE_TIME_DURATION
→ PREFILLED_GOOGLE_CALENDAR_URL
→ USER_REVIEWS
→ USER_SAVES_EXTERNALLY
```

No OAuth, token persistence or false confirmation that the event was saved.

### Home integration

Home must prioritize a restrained operational set:

- Plan de hoy
- Seguimiento prioritario
- Overdue action
- Upcoming appointment
- Portfolio attention signal

## Exit criteria

```text
ACTIVE_PROSPECT_WITHOUT_RESOLUTION=REJECTED
NEXT_ACTION_CREATE=PASS
NEXT_ACTION_COMPLETE=PASS
NEXT_ACTION_RESCHEDULE=PASS
OVERDUE_VISIBILITY=PASS
WAITING_STATE=PASS
DAILY_AGENDA=PASS
WEEKLY_AGENDA=PASS
CALENDAR_PREFILL=PASS
EXTERNAL_SAVE_FALSE_CONFIRMATION=REJECTED
TIMELINE_WRITE=PASS
HOME_PRIORITY_BINDING=PASS
```

---

# PASS 03 — Pipeline-to-Quotes commercial loop

## Objective

Turn Pipeline and Quotes into one continuous commercial operation.

## Product flow

```text
PROSPECT
→ CONTACT
→ APPOINTMENT
→ NEED_ANALYSIS
→ QUOTE
→ COMMERCIAL_PRESENTATION
→ OUTCOME
→ NEXT_ACTION_OR_APPLICATION
```

## Deliverables

### Canonical person context

Quotes must receive, when available:

- Canonical person identity
- Age or birth date
- Family context
- Financial objective
- Need and risk context
- Relevant timeline entries
- Product hypothesis
- Source prospect and pipeline stage

### Pipeline → Quotes handoff

`Crear cotización` must:

- Preserve canonical person identity
- Avoid duplicate contact creation
- Open the correct product workspace
- Record the handoff
- Keep source traceability

### Quotes → Pipeline handoff

A completed proposal must return:

- Quote identifier and version
- Product
- Contribution or premium
- Creation date
- Presentation state
- Commercial outcome
- Required next action

### Quote document closure

- Product-correct composition
- Client identity persistence
- Preview
- Print
- PDF generation
- Download
- Reopen
- Versioning
- Honest unavailable states
- No stale generic client names

### Commercial outcomes

- Interested
- Adjustment required
- Presented and pending
- Postponed
- Rejected
- Application started

## Exit criteria

```text
PERSON_TO_QUOTE_HANDOFF=PASS
QUOTE_TO_PIPELINE_HANDOFF=PASS
CANONICAL_IDENTITY_PRESERVED=PASS
DUPLICATE_CAPTURE=0
QUOTE_VERSIONING=PASS
QUOTE_REOPEN=PASS
PREVIEW=PASS
PRINT=PASS
PDF_GENERATION=PASS
PDF_DOWNLOAD=PASS
COMMERCIAL_OUTCOME=PASS
NEXT_ACTION_AFTER_PRESENTATION=PASS
```

---

# PASS 04 — Prospect-to-client and policy conversion

## Objective

Remove the manual gap between a confirmed sale, Pipeline and Portfolio.

## Product flow

```text
PROSPECT
→ APPLICATION
→ CONFIRMED_SALE
→ PERSON_RECONCILIATION
→ ACCOUNT_RECONCILIATION
→ POLICY_CREATION_OR_LINK
→ PIPELINE_CLOSURE
→ PORTFOLIO_VISIBILITY
→ FIRST_SERVICE_ACTION
```

## Deliverables

### Governed conversion command

Provide an explicit `Convertir en cliente` command with review before mutation.

Review must display:

- Person selected or created
- Account selected or created
- Product
- Policy number when available
- Contracting party
- Insured parties
- Known beneficiaries
- Effective date
- Premium
- Payment frequency
- Source quote and application

### Reconciliation

- Existing-person detection
- Existing-account detection
- Duplicate policy protection
- Owner-scope enforcement
- Explicit conflict resolution
- Idempotent retry

### Result

- Pipeline stage closes correctly
- Person history remains continuous
- Portfolio shows the policy
- Timeline records the governed conversion
- First service/review action is offered
- No automatic cross-sell or outbound communication

## Exit criteria

```text
PROSPECT_TO_CLIENT=PASS
PERSON_RECONCILIATION=PASS
ACCOUNT_RECONCILIATION=PASS
POLICY_DUPLICATE_PROTECTION=PASS
OWNER_SCOPE=PASS
IDEMPOTENT_CONVERSION=PASS
PIPELINE_CLOSURE=PASS
PORTFOLIO_VISIBILITY=PASS
TIMELINE_CONTINUITY=PASS
FIRST_SERVICE_ACTION=PASS
```

---

# PASS 05 — Productive portfolio service loop

## Objective

Make Portfolio an operating system for conservation, review and future opportunity, not a passive inventory.

## Deliverables

### Client 360

- People and relationships
- Accounts
- Policies
- Coverage summary
- Premium and payment facts
- Important dates
- Notes and interactions
- Open actions
- Quote and application history
- Known data provenance

### Future radar

- Anniversaries
- Renewals
- Upcoming payments when authoritative
- Policies without recent review
- Clients without recent contact
- Known family or financial changes
- Coverage-review candidates
- Unresolved service items

### Service actions

- Register review
- Schedule contact
- Add context note
- Update known client context
- Start complementary quote
- Record service outcome

### Truth handling

Use explicit states:

- Available
- Partial
- Pending confirmation
- Unavailable
- Not connected
- Not calculated

Never coerce unknown values to zero.

## Exit criteria

```text
CLIENT_360=PASS
POLICY_DETAIL=PASS
RELATIONSHIP_CONTEXT=PASS
FUTURE_RADAR=PASS
SERVICE_ACTIONS=PASS
REVIEW_HISTORY=PASS
QUOTE_FROM_PORTFOLIO=PASS
UNKNOWN_AS_ZERO=REJECTED
PROVENANCE_VISIBLE=PASS
```

---

# PASS 06 — Activity, Forecast, Reports and Compensation reconciliation

## Objective

Make all management surfaces tell one consistent business story.

## Canonical management flow

```text
ACTIVITY_PERFORMED
→ FUNNEL_MOVEMENT
→ CONFIRMED_AND_POTENTIAL_PRODUCTION
→ FORECAST
→ GOAL_GAP
→ COMPENSATION_STATE
→ REPORTING
```

## Deliverables

### Activity

Canonical counts and events for:

- Prospects entered
- Contacts
- Appointments
- Presentations
- Follow-ups
- Applications
- Policies confirmed

### Funnel

- Prospect → Contact
- Contact → Appointment
- Appointment → Presentation
- Presentation → Application
- Application → Policy

Every rate must expose denominator availability and period.

### Forecast

Separate:

- Confirmed production
- In-process production
- Probability-weighted production
- Monthly goal
- Remaining gap
- Source freshness
- Assumptions and limitations

### Compensation

Separate:

- Estimated
- Confirmed
- Payable
- Paid
- Unavailable

No estimate may be represented as paid compensation.

### Reports 1.0

Limit the first release to operational reports:

- Monthly activity
- Funnel conversion
- Production
- Prospect sources
- Product mix
- Portfolio attention
- Forecast versus goal
- Compensation state

## Exit criteria

```text
ACTIVITY_SOURCE_OF_TRUTH=PASS
FUNNEL_DENOMINATORS=PASS
PERIOD_CONSISTENCY=PASS
FORECAST_CONFIRMED_VS_ESTIMATED=PASS
GOAL_GAP=PASS
COMPENSATION_TRUTH_LABELS=PASS
REPORTS_SOURCE_RECONCILIATION=PASS
SOURCE_FRESHNESS=PASS
UNKNOWN_AS_ZERO=REJECTED
```

---

# PASS 07 — Unified UX closure

## Objective

Make Advisor OS feel like one product without performing a disruptive redesign.

## Deliverables

Unify:

- Headers
- Primary actions
- Secondary contextual actions
- Forms
- Modals
- Cards
- Filters
- Loading states
- Empty states
- Partial states
- Errors
- Confirmation dialogs
- Toasts and receipts
- Mobile safe areas
- Tablet and desktop density

## Rules

- One dominant primary action per surface
- No decorative nonfunctional controls
- No hidden mandatory step
- No raw internal error code as the only user explanation
- No horizontal overflow beyond accepted tolerance
- No important content trapped behind floating navigation
- No duplicate dashboard representation of the same canonical action
- Secondary actions belong in contextual menus when persistent buttons create clutter
- Productive data must replace static demo content

## Exit criteria

```text
MOBILE_360_ACCEPTANCE=PASS
TABLET_ACCEPTANCE=PASS
DESKTOP_ACCEPTANCE=PASS
FLOATING_NAV_SAFE_AREA=PASS
HORIZONTAL_OVERFLOW<=1PX
PRIMARY_ACTION_HIERARCHY=PASS
EMPTY_PARTIAL_ERROR_STATES=PASS
RAW_ERROR_ONLY=REJECTED
STATIC_PRODUCTIVE_CONTENT=0
```

---

# PASS 08 — Profile and onboarding

## Objective

Allow an advisor to start using the product without technical intervention.

## Deliverables

### Basic profile

- Name
- Email
- Phone
- Brand or display identity
- Photograph when supported
- Time zone
- Currency
- Monthly goal
- Basic operating preferences

### First-run checklist

1. Complete profile
2. Create or import prospects
3. Define monthly goal
4. Schedule first action
5. Create first quote

### Demo isolation

- Demo data clearly labeled
- Productive and demo identities separated
- No demo values leaking into productive reports
- Reset behavior explicit and safe

## Exit criteria

```text
SELF_SERVICE_PROFILE=PASS
MONTHLY_GOAL_SETUP=PASS
FIRST_RUN_CHECKLIST=PASS
DEMO_DATA_ISOLATED=PASS
TIMEZONE_AMERICA_MEXICO_CITY=PASS
PRODUCTIVE_IDENTITY_PRESERVED=PASS
```

---

# PASS 09 — End-to-end public acceptance

## Objective

Validate complete advisor stories against the real deployed runtime without asset overrides.

## Mandatory scenarios

### Scenario A — New prospect

```text
CREATE_OR_IMPORT_PROSPECT
→ ASSIGN_BOOK
→ SCHEDULE_ACTION
→ RECORD_INTERACTION
→ SCHEDULE_APPOINTMENT
→ DOCUMENT_APPOINTMENT
```

### Scenario B — Sale

```text
OPEN_PROSPECT
→ CREATE_QUOTE
→ GENERATE_DOCUMENT
→ PREVIEW_OR_PRINT
→ RECORD_PRESENTATION
→ CAPTURE_OUTCOME
→ START_APPLICATION_OR_NEXT_ACTION
```

### Scenario C — Conversion

```text
CONFIRM_SALE
→ RECONCILE_PERSON
→ RECONCILE_ACCOUNT
→ CREATE_OR_LINK_POLICY
→ CLOSE_PIPELINE
→ VERIFY_PORTFOLIO
```

### Scenario D — Service

```text
OPEN_CLIENT
→ REVIEW_POLICY
→ RECORD_REVIEW
→ SCHEDULE_FOLLOW_UP
→ CREATE_FUTURE_OPPORTUNITY_OR_SERVICE_ACTION
```

### Scenario E — Business management

```text
RECORD_ACTIVITY
→ VERIFY_FUNNEL
→ VERIFY_FORECAST
→ COMPARE_GOAL
→ VERIFY_COMPENSATION_STATE
→ OPEN_REPORT
```

## Acceptance matrix

Every applicable scenario must pass across:

- Mobile
- Tablet
- Desktop
- New authenticated session
- Reload
- Logout and login
- Slow network
- Partial source
- Unavailable source
- Late-result rejection
- Public Pages deployment

## Exit criteria

```text
SCENARIO_A=PASS
SCENARIO_B=PASS
SCENARIO_C=PASS
SCENARIO_D=PASS
SCENARIO_E=PASS
PUBLIC_RUNTIME=PASS
ASSET_OVERRIDES=NO
AUTH_SESSION_RELOAD=PASS
LOGOUT_SCRUB=PASS
LATE_RESULT_REJECTION=PASS
MOBILE_TABLET_DESKTOP=PASS
PARTIAL_AND_UNAVAILABLE_TRUTH=PASS
```

---

# PASS 10 — Advisor OS 1.0 release candidate

## Objective

Create the governed release candidate and close the product version only after full evidence reconciliation.

## Deliverables

- Release candidate commit
- Canonical Pages deployment
- Evidence index
- Known limitations register
- Deferred scope register
- Data migration and rollback notes where required
- Operational onboarding guide
- Product demonstration script
- Release acceptance certificate

## Release gate

```text
AUTH=PASS
HOME=PASS
PIPELINE=PASS
BULK_INTAKE=PASS
BOOKS=PASS
AGENDA=PASS
ACTIVITY=PASS
QUOTES=PASS
CONVERSION=PASS
PORTFOLIO=PASS
FORECAST=PASS
REPORTS=PASS
COMPENSATION=PASS
PROFILE=PASS
ONBOARDING=PASS
PUBLIC_ACCEPTANCE=PASS
CRITICAL_OPEN_DEFECTS=0
HIGH_OPEN_DEFECTS=0
UNKNOWN_AS_ZERO=0
AUTOMATIC_UNAPPROVED_MUTATIONS=0
```

Only then:

```text
ADVISOR_OS_1_0=COMPLETE
```

## 6. Progress checkpoints

The following percentages are planning markers, not substitutes for evidence:

```text
CURRENT_BASELINE≈80%
AFTER_PASS_00_TO_02≈86%
AFTER_PASS_03_TO_04≈91%
AFTER_PASS_05_TO_06≈95%
AFTER_PASS_07_TO_08≈98%
AFTER_PASS_09_TO_10=100%
```

## 7. Governance and merge discipline

Each pass must follow controlled repository discipline:

1. Start from current canonical `main`.
2. Declare exact scope and forbidden mutations.
3. Implement only the pass dependency set.
4. Run deterministic repository tests.
5. Run browser acceptance at the relevant viewports.
6. Reconcile against current `main` before merge.
7. Require explicit merge authorization when the active repository workflow requires it.
8. Deploy through the canonical Pages path.
9. Run public acceptance without asset overrides.
10. Record evidence and update this roadmap only after verified closure.

No pass may be marked complete from branch-only or fixture-only success when public productive acceptance is required.

## 8. Priority order

The next work sequence is locked as:

```text
NEXT=PASS_00_SCOPE_LOCK_AND_CLOSURE_AUTHORITY
THEN=PASS_01_BULK_INTAKE_AND_BOOKS
THEN=PASS_02_NEXT_ACTION_AND_AGENDA_LOOP
THEN=PASS_03_PIPELINE_TO_QUOTES_COMMERCIAL_LOOP
THEN=PASS_04_PROSPECT_TO_CLIENT_AND_POLICY_CONVERSION
```

The shortest path to Advisor OS 1.0 is not another intelligence layer. It is completing the operating continuity between intake, action, sale, conversion, service and measurement.
