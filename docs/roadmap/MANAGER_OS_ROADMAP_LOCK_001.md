# MANAGER OS ROADMAP LOCK 001

Status: LOCKED ROADMAP / CONTINUITY LEDGER

## Purpose

This roadmap lock preserves Manager OS implementation continuity after the Manager OS Advisor Signal Consumer Contract closure.

It exists so future ForgeOS phases do not drift, skip dependencies, rely only on conversation memory, or convert Manager OS intelligence into punishment, ranking, promotion, Advisor Lifecycle, Revenue, Compensation or payout truth.

## Constitutional Rules

- Forge decides; AI explains.
- Unknown is not zero.
- Blocked is not zero.
- Missing evidence is not negative evidence.
- Manager Intelligence supports coaching and review; it does not replace manager judgment.
- Manager OS must not create punishment, human ranking, promotion decision, Advisor Lifecycle truth, revenue, compensation or payout truth.
- Advisor OS owns advisor-facing execution context.
- Manager OS may consume official signals but must not recalculate or redefine their truth.
- Forecast is not payout truth.
- Forecast is not compensation truth.
- Forecast is not official revenue truth.
- Forecast is not promotion truth.
- Forecast is not Advisor Lifecycle truth.
- Compensation candidate calculation is not payment truth.
- No stage, commit or push unless explicitly authorized.

## Applicable ADRs

- ADR-003 -- Recommendation vs Decision / Authority Boundary
- ADR-015 -- Manager Intelligence Authority Boundary
- ADR-017 -- Compensation Intelligence Evidence Boundary

## Last Closed Phase

- Phase: MANAGER_OS_ADVISOR_SIGNAL_CONSUMER_CONTRACT_012C
- Status: CLOSED / COMMITTED / PUSHED
- Commit: f0f4cf50b4c5923842a51d4af306414679ab54c3
- Commit message: docs: close manager advisor signal consumer contract

Closure facts:

- Manager OS Advisor Signal Consumer Contract is closed.
- It consumes Advisor OS signals as reference/coaching/review context only.
- It does not create Manager judgment truth.
- It does not create human ranking truth.
- It does not create promotion decision truth.
- It does not create Advisor Lifecycle truth.
- It does not create revenue.
- It does not create compensation.
- It does not create payout truth.
- It does not create punishment or enforcement.
- Unknown is not zero.
- Missing evidence is not negative evidence.
- Legacy default-zero signals require review.
- Advisor OS remains owner of advisor-facing execution context.
- Manager OS may consume official signals but must not recalculate or redefine their truth.

## Current Next Phase

- Phase: MANAGER_OS_ADVISOR_TRACKING_BOUNDARY_HARDENING_013B_C
- Mode: SURGICAL IMPLEMENTATION + TESTS

## Roadmap Addendum 001B -- Manager OS Forecast Intelligence

Status: ROADMAP AMENDMENT / FORECAST INSERTION

### Purpose

Add Manager OS Forecast Intelligence as a formal future workstream after Historical Analytics and before Coaching Intelligence.

This addendum does not replace the current active phase.

Current active implementation track remains:

- MANAGER_OS_ADVISOR_TRACKING_BOUNDARY_HARDENING_013B_C

Next implementation phase remains 013B/C unless a later explicit governance phase changes it.

### Rationale

- Metrics measures what happened.
- Historical Analytics compares what happened.
- Forecast projects what may happen.
- Coaching Intelligence uses metrics, snapshots, historical analytics and forecast context to recommend development actions.
- Dashboard only presents view models and must not create truth.

### Forecast Scope

Manager OS Forecast Intelligence must cover:

- Proyeccion de ingresos al cierre del trimestre
- Proyeccion de altas / firmas de precontratos al mes, trimestre y ano
- Proyeccion de entrevistas:
  - iniciales
  - seleccion
  - carrera
  - adicionales
- Proyeccion de ingresos de asesores al trimestre
- Proyeccion de asesores calificados

### Forecast Boundaries

- Forecast is scenario context only.
- Forecast is not payout truth.
- Forecast is not compensation truth.
- Forecast is not official revenue truth.
- Forecast is not Advisor Lifecycle truth.
- Forecast is not promotion truth.
- Forecast does not create human ranking truth.
- Forecast does not create punishment or enforcement.
- Forecast must expose assumptions.
- Forecast must expose confidence limitations.
- Forecast must expose missing evidence.
- Forecast must expose source owners.
- Forecast must expose freshness.
- Missing evidence is not negative evidence.
- Unknown is not zero.
- Forecast must not consume raw unbounded inputs.
- Forecast must consume protected snapshots, metrics and historical analytics.

### Future Planning Notes

These are future planning notes only. No files are created by this addendum.

Proposed future files under `manager-os/forecast/`:

- manager-forecast-boundary-contract.js
- manager-quarter-income-forecast-engine.js
- manager-recruitment-signing-forecast-engine.js
- manager-interview-forecast-engine.js
- manager-advisor-income-forecast-engine.js
- manager-qualified-advisor-forecast-engine.js
- manager-forecast-scenario-engine.js

Proposed future tests:

- manager-os/tests/manager-forecast-boundary-contract-master-test.js
- manager-os/tests/manager-quarter-income-forecast-master-test.js
- manager-os/tests/manager-recruitment-signing-forecast-master-test.js
- manager-os/tests/manager-interview-forecast-master-test.js
- manager-os/tests/manager-advisor-income-forecast-master-test.js
- manager-os/tests/manager-qualified-advisor-forecast-master-test.js

## Locked Roadmap Order

1. 013A -- Manager OS Advisor Tracking Boundary Hardening Discovery
2. 013B/C -- Manager OS Advisor Tracking Boundary Hardening Implementation
3. 014A -- Manager Recruitment Pipeline Capture Scope
4. 014B/C -- Recruitment Pipeline Capture + CandidateManagerSnapshot
5. 015A -- AdvisorManagerSnapshot Scope
6. 015B/C -- AdvisorManagerSnapshot V1 Implementation
7. 016A -- Manager OS Metrics Intelligence Scope
8. 016B/C -- Recruitment Metrics + Advisor Metrics Implementation
9. 017A -- Historical Analytics Scope
10. 017B/C -- Historical Analytics Implementation
11. 018A -- Manager OS Forecast Intelligence Scope
12. 018B/C -- Manager OS Forecast Intelligence Implementation
13. 019A -- Coaching Intelligence Scope with NASH + Mick + Candy Crush
14. 019B/C -- Coaching Intelligence Orchestrator Implementation
15. 020A -- Conversation Intelligence Scope
16. 020B/C -- Candidate / Precontract / Advisor Conversation Guidance
17. 021A -- Candy Crush Experience Scope
18. 021B/C -- Coaching Missions / Levels / Streaks / Progress Cards
19. 022A -- Dashboard View Model Scope
20. 022B/C -- Dashboard View Models + Chart Data

## Continuity Rules

- Only one active ForgeOS phase at a time.
- No phase may start unless the previous phase has a result block.
- No implementation phase may start before its corresponding scope/discovery phase.
- Metrics must consume protected snapshots, not raw unbounded inputs.
- Coaching Intelligence must consume snapshots and contracts, not raw metrics.
- Conversation Intelligence must consume candidate/advisor context, not invent context.
- Candy Crush Experience progress is experience context, not performance truth.
- Streak is not compensation truth.
- Level is not promotion truth.
- Mission completion is not Advisor Lifecycle truth.

## Required Phase Result Block Template

Each phase must close with:

```text
PHASE RESULT

- phase:
- mode:
- status:
- changed files:
- validation:
- tests:
- boundaries preserved:
- commit:
- push:
- next phase:
- blocked items:
- roadmap impact:
- final decision:
```

## Dependency Map

- 013A depends on 012C closure.
- 013B/C depends on 013A.
- 014B/C depends on 014A.
- 015B/C depends on 015A and 012C.
- 016B/C depends on CandidateManagerSnapshot and AdvisorManagerSnapshot scope.
- 017B/C depends on Metrics V1.
- 018A depends on Metrics V1 and Historical Analytics scope.
- 018B/C depends on Historical Analytics Implementation, CandidateManagerSnapshot, AdvisorManagerSnapshot, Recruitment Metrics, Advisor Metrics, and protected evidence/source/freshness context.
- 019A depends on AdvisorManagerSnapshot, Metrics V1, Historical Analytics, Forecast Intelligence scope, and NASH/Mick/Candy Crush boundaries.
- 019B/C depends on Coaching Intelligence scope.
- 020B/C depends on CandidateManagerSnapshot, AdvisorManagerSnapshot, pipeline context, coaching context, and NASH conversation boundaries.
- 021B/C depends on Coaching Intelligence scope and Forecast-safe experience boundaries.
- 022B/C depends on Metrics, Historical Analytics, Forecast, Coaching, and Conversation view-model boundaries.

## Next Prompt Bank

```text
LEE EL PROMPT COMPLETO ANTES DE ACTUAR.

No resumas, no reinterpretas, no optimices el alcance y no adelantes pasos.

PHASE:
MANAGER_OS_ADVISOR_TRACKING_BOUNDARY_HARDENING_013A

MODE:
READ ONLY SCOPE ANALYSIS.

ROLE FIRST:
Act as senior ForgeOS architect, Manager OS boundary reviewer, Advisor OS signal ownership analyst, constitutional gatekeeper, test engineer, and source-truth reviewer.

GOAL:
Audit older Manager OS advisor/team tracking modules for:

- default-zero behavior
- missing/unknown/stale collapse
- input mutation
- missing evidence
- missing source owner
- missing freshness
- unsafe direct advisor signal consumption

CONSTITUTIONAL RULES:
- Forge decides; AI explains.
- Unknown is not zero.
- Blocked is not zero.
- Missing evidence is not negative evidence.
- Manager Intelligence supports coaching and review; it does not replace manager judgment.
- Manager OS must not create punishment, human ranking, promotion decision, Advisor Lifecycle truth, revenue, compensation or payout truth.
- Advisor OS owns advisor-facing execution context.
- Manager OS may consume official signals but must not recalculate or redefine their truth.

ROBOCOP LOCK 001:
Before any Forge work starts, complete the Constitutional Gate:

- Applicable Constitution
- Applicable ADRs
- Build Tree area
- Discovery status
- Implementation readiness
- Miranda approval
- Board approval status
- Scope boundary
- Prohibited surfaces
- Validation expectation

If any field is missing:
BLOCKED BY ROBOCOP LOCK 001.

READ-ONLY CHECKS:
- git status --short --branch
- git log --oneline -8
- git diff --name-only
- git diff --cached --name-only
- inspect AGENTS.md
- inspect FORGE_MASTER_BUILD_TREE.md
- inspect docs/roadmap/MANAGER_OS_ROADMAP_LOCK_001.md
- inspect adr/ADR-003 -- Recommendation vs Decision Authority Boundary.txt
- inspect adr/ADR-015 -- Manager Intelligence Authority Boundary.txt
- inspect adr/ADR-017 -- Compensation Intelligence Evidence Boundary.txt

CANDIDATE FILES:
- manager-os/team-intelligence/activity/team-activity-engine.js
- manager-os/team-intelligence/dashboard/team-dashboard-engine.js
- manager-os/team-intelligence/momentum/team-momentum-engine.js
- manager-os/team-intelligence/structure/team-structure-engine.js
- manager-os/alerts/manager-alert-engine.js
- manager-os/coaching/manager-coaching-engine.js
- manager-os/coaching/dna-coaching-engine.js
- manager-os/feed/manager-feed-engine.js
- manager-os/notifications/manager-notification-engine.js
- manager-os/advisor-signals/manager-advisor-signal-consumer-contract.js
- manager-os/tests/manager-advisor-signal-consumer-contract-master-test.js

QUESTIONS:

1. Which modules consume advisor signals directly?
2. Which modules default missing values to zero?
3. Which modules mutate inputs?
4. Which modules lack evidence/source/freshness?
5. Should they consume the new signal contract instead of raw Advisor OS-like inputs?
6. What exact files should be modified in 013B/C?
7. What tests should be created?
8. What should remain out of scope?

DO NOT MODIFY:
- any file

OUTPUT:
MANAGER_OS_ADVISOR_TRACKING_BOUNDARY_HARDENING_013A RESULT

- repo status:
- applicable constitution:
- applicable ADRs:
- Build Tree area:
- roadmap lock:
- candidate files inspected:
- direct advisor signal consumers:
- default-zero risks:
- missing/unknown/stale collapse risks:
- input mutation risks:
- evidence/source/freshness gaps:
- recommended implementation:
- proposed files:
- proposed tests:
- out of scope:
- final decision:

FINAL DECISION:
SEMAFORO=🟢 PASS
DECISION=PASS_MANAGER_OS_ADVISOR_TRACKING_BOUNDARY_HARDENING_013A_READY_FOR_IMPLEMENTATION_SCOPE
```

## Out Of Scope For This Roadmap Lock

- runtime code
- Advisor OS engines
- Manager OS engines
- tests
- schemas
- fixtures
- Compensation
- Revenue
- Advisor Lifecycle
- Product Intelligence
- app shell
- UI
- routes
- public assets
- Build Tree update
- evidence certificates

## Final Lock Statement

MANAGER_OS_ROADMAP_LOCK_001 is the continuity ledger for the next Manager OS implementation sequence.

Future phases must preserve this order unless a later explicit roadmap governance phase updates this document.

<!-- MANAGER_OS_DOCS_SYNC_022D_START -->

## Roadmap Update — Manager OS Through 022B/C

Locked implementation commit: 7901b558a067648edae87f7b71c36b341e5dcc55

### Completed sequence

1. Manager recruitment pipeline capture.
2. Candidate and advisor manager snapshots.
3. Manager Metrics Intelligence.
4. Manager Historical Analytics.
5. Historical storage, rollup, and query-plan boundaries.
6. Manager Forecast Intelligence.
7. Manager Dashboard Intelligence.
8. Manager Coaching Intelligence.
9. Manager Review Plan Intelligence.
10. Manager External Context Bridge.

### Roadmap meaning

Manager OS has moved from protected capture and review snapshots into a complete context-preparation chain. The latest bridge safely exposes sanitized manager context to external consumers without giving those consumers execution authority.

### Next safe roadmap zone

Future work should remain in boundary-first scope analysis before implementation. Any Nash, Mick, engagement, Command OS, Advisor OS, UI, task, calendar, messaging, or runtime connection must begin as a read-only scope with explicit no-execution guarantees.

<!-- MANAGER_OS_DOCS_SYNC_022D_END -->

<!-- NASH_MANAGER_CONTEXT_INTAKE_DOCS_SYNC_023D_START -->

## Roadmap Update — Manager OS Through 023B/C

Locked implementation commit: fe2a24d62ebf33729d215f77d28f2ede7466ee2d

### Completed sequence

1. Manager recruitment pipeline capture.
2. Candidate and advisor manager snapshots.
3. Manager Metrics Intelligence.
4. Manager Historical Analytics.
5. Historical storage, rollup, and query-plan boundaries.
6. Manager Forecast Intelligence.
7. Manager Dashboard Intelligence.
8. Manager Coaching Intelligence.
9. Manager Review Plan Intelligence.
10. Manager External Context Bridge.
11. Nash Manager Context Intake.

### Open next roadmap items

- Mick Manager Context Intake.
- Engagement / Private Motivation Context Intake.
- Command / Action Handoff Boundary.
- Manager Read Model / UI Scope.
- Persistence / Adapter Boundary Scope.

### Current estimate

- Manager OS Core Intelligence Spine: 100%.
- Manager OS External Intake Layer: 33%.
- Manager OS Architecture Roadmap: approximately 75%.
- Manager OS Full Product / Runtime Readiness: approximately 60%.

<!-- NASH_MANAGER_CONTEXT_INTAKE_DOCS_SYNC_023D_END -->

<!-- MICK_MANAGER_CONTEXT_INTAKE_DOCS_SYNC_024D_START -->

## Roadmap Update — Manager OS Through 024B/C

Locked implementation commit: 2d597f4398324b108d01957892ea7e8136dfa85a

### Completed sequence

1. Manager recruitment pipeline capture.
2. Candidate and advisor manager snapshots.
3. Manager Metrics Intelligence.
4. Manager Historical Analytics.
5. Historical storage, rollup, and query-plan boundaries.
6. Manager Forecast Intelligence.
7. Manager Dashboard Intelligence.
8. Manager Coaching Intelligence.
9. Manager Review Plan Intelligence.
10. Manager External Context Bridge.
11. Nash Manager Context Intake.
12. Mick Manager Context Intake.

### Current roadmap position

Manager OS has completed its protected context-preparation chain and now has safe intake layers for Nash conversation-prep context and Mick behavior-review context.

### Open next roadmap items

- Engagement / Private Motivation Context Intake.
- Command / Action Handoff Boundary.
- Manager Read Model / UI Scope.
- Persistence / Adapter Boundary Scope.

### Current estimate

- Manager OS Core Intelligence Spine: 100%.
- Manager OS External Intake Layer: 66%.
- Manager OS Architecture Roadmap: approximately 80%.
- Manager OS Full Product / Runtime Readiness: approximately 63%.

<!-- MICK_MANAGER_CONTEXT_INTAKE_DOCS_SYNC_024D_END -->

<!-- FORGE_GENESIS_MESSAGE_GENERATION_ROADMAP_SYNC_024E_START -->

## Manager OS Roadmap Addition — Message Generation + Delivery Layer

Roadmap sync commit source: 2e68b09f1d06f95d5440bd6b47eb72f2bf8bb96d

Manager OS Context Intelligence V1 remains focused on protected context preparation.

After Engagement / Private Motivation Context Intake and Manager OS Context Intelligence V1 closure, Manager OS must add an operating layer that returns to Forge's original genesis:

```text
manager signals → manager context → prompt builder → LLM draft → Forge validation → human approval → WhatsApp/SMS delivery adapter
```

### Manager OS target audiences

- Candidates.
- Precontracts.
- Advisors.

### Manager OS message purposes

- Outreach.
- Follow-up.
- Reconnection.
- Meeting confirmation.
- Coaching support.
- Review preparation.
- Safe next-step invitation.

### Required safety sequence

Nash protects conversation quality and safe language.
Mick protects behavior review from surveillance and punishment.
Engagement protects private motivation from manipulation.
Message Generation must consume those protected contexts and never bypass them.

### Future roadmap items

- Manager OS Message Generation Prompt Builder.
- LLM Draft Intake.
- Message Safety Validator.
- Human Approval Gate.
- WhatsApp/SMS Delivery Adapter Boundary.
- Send Execution Gate.

### Non-negotiable boundary

Manager OS may prepare and validate message drafts, but it must not automatically send messages or create drafts/tasks/calendar events without explicit human authorization.

<!-- FORGE_GENESIS_MESSAGE_GENERATION_ROADMAP_SYNC_024E_END -->
