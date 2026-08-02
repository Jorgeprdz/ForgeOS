# Advisor OS 1.0 — Sprint 00 Scope Lock Authority

```text
DOCUMENT=ADVISOR_OS_1_0_SCOPE_LOCK_AUTHORITY
STATUS=CANDIDATE_FOR_RATIFICATION
SPRINT=SPRINT_00_SCOPE_AND_CLOSURE_LOCK
DATE=2026-08-02
OWNER=FORGE_PRODUCT_AUTHORITY
PARENT=docs/roadmaps/ADVISOR_OS_1_0_FINAL_SPRINT.md
RUNTIME_MUTATION=NO
DATABASE_MUTATION=NO
```

## 1. Decision

Advisor OS 1.0 is closed around one continuous advisor operating loop:

```text
FIRST_VALUE
→ FIND_OR_CREATE_PERSON
→ DEFINE_NEXT_ACTION
→ PERFORM_AND_CAPTURE_INTERACTION
→ QUOTE_AND_PRESENT
→ CONFIRM_COMMERCIAL_OUTCOME
→ CONVERT_TO_CLIENT_AND_POLICY
→ SERVICE_PORTFOLIO
→ MEASURE_ACTIVITY_FORECAST_AND_COMPENSATION
```

A capability belongs to Advisor OS 1.0 only when it is required to complete, understand, recover or govern this loop.

## 2. Included product surfaces

- Authenticated private shell
- Home and productive Smart Widgets
- Benvenù first-value experience
- Alfred / Universal Command Bar
- Pipeline and canonical person context
- Bulk intake and Books
- Activity and Timeline
- Next Action and Agenda
- Contextual Notifications
- Clippy contextual help
- Low-friction voice, text and one-tap capture
- Quotes, commercial presentation, preview, print and PDF
- Governed prospect-to-client conversion
- Portfolio, accounts, policies and service actions
- Forecast and monthly goals
- Operational reports
- Advisor compensation read experience
- Basic profile, preferences and first-use configuration
- Mobile, tablet and desktop acceptance

## 3. Included cross-cutting contracts

- Canonical identity reuse
- Owner scope
- Capture Once
- Value Before Work
- Human approval for productive mutations
- Unknown is not zero
- Source provenance and freshness
- Logout scrub
- Late-result rejection
- Public Pages acceptance without asset overrides
- Responsive safe area for the deliberately floating mobile navigation

## 4. Deferred beyond Advisor OS 1.0

- Autonomous message sending
- Autonomous calendar creation or external-save claims
- Autonomous pipeline advancement
- Autonomous task completion
- Autonomous model training
- Recruiting and promotoria product surfaces
- Manager surveillance features
- Corporate administration
- Deep bidirectional OAuth integrations
- Carrier-specific rule packs embedded in Forge Core
- New intelligence authorities
- New dashboards without a closure dependency
- Full visual redesign of productive modules
- Unbounded customization

## 5. Ownership boundaries

### Advisor Experience

Owns Benvenù, Progressive Discovery, Clippy, feature learning state and help eligibility. It does not own business truth.

### Command Bar

Owns intent capture, context resolution, previews and routing to canonical commands. It does not become a second mutation authority.

### Notifications

Owns projections, eligibility, delivery and resolution prompts. It is not Timeline, Agenda, Pipeline, payment or policy truth.

### Pipeline

Owns prospect commercial progression and next commercial state. It does not own policy truth.

### Quotes

Owns quote workspaces, versions and commercial documents. It does not own confirmed policy state.

### Portfolio

Owns person-account-policy servicing views and governed service actions. It does not invent payment or compensation facts.

### Activity / Forecast / Reports / Compensation

Each surface consumes canonical events and read models from its official owner. No UI count becomes truth merely because it renders.

## 6. Closure rules

1. Every remaining gap maps to exactly one sprint.
2. Shared dependencies may be consumed by multiple sprints but have one implementation owner.
3. No sprint creates a parallel authority to avoid integration work.
4. No feature is complete from static rendering alone.
5. No closure claim may rely only on fixtures, branch-only success or local asset overrides.
6. Productive writes require a reviewable command and explicit confirmation.
7. Read-only commands may execute immediately when identity and authority are unambiguous.
8. Ambiguous natural language produces a draft, never silent persistence.
9. Missing information is requested only when it unlocks immediate value or a required next action.
10. New scope requires explicit amendment of this authority.

## 7. Locked sprint sequence

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

## 8. Sprint 00 exit gate

```text
SCOPE_LOCKED=YES
MODULE_INVENTORY_RATIFIED=YES
END_TO_END_WORKFLOWS_DEFINED=YES
ACCEPTANCE_MATRIX_DEFINED=YES
DEFERRED_SCOPE_RECORDED=YES
OWNERSHIP_BOUNDARIES_DEFINED=YES
DUPLICATE_CLOSURE_TASKS=0
NEW_MODULES_DURING_CLOSURE=FORBIDDEN
RUNTIME_MUTATION=NO
DATABASE_MUTATION=NO
```

## 9. Next authorized implementation

After ratification and controlled merge:

```text
NEXT=SPRINT_01_BENVENU_FIRST_VALUE
```
