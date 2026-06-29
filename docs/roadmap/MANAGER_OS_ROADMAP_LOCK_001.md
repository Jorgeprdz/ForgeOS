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

- Phase: MANAGER_OS_ADVISOR_TRACKING_BOUNDARY_HARDENING_013A
- Mode: READ ONLY SCOPE ANALYSIS

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
11. 018A -- Coaching Intelligence Scope with NASH + Mick + Candy Crush
12. 018B/C -- Coaching Intelligence Orchestrator Implementation
13. 019A -- Conversation Intelligence Scope
14. 019B/C -- Candidate / Precontract / Advisor Conversation Guidance
15. 020A -- Candy Crush Experience Scope
16. 020B/C -- Coaching Missions / Levels / Streaks / Progress Cards
17. 021A -- Dashboard View Model Scope
18. 021B/C -- Dashboard View Models + Chart Data

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
- 018B/C depends on AdvisorManagerSnapshot, Metrics V1, and NASH/Mick/Candy Crush scope.
- 019B/C depends on CandidateManagerSnapshot, AdvisorManagerSnapshot, pipeline context, and NASH conversation boundaries.
- 020B/C depends on Coaching Intelligence scope.
- 021B/C depends on Metrics, Historical Analytics, Coaching, and Conversation view-model boundaries.

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
