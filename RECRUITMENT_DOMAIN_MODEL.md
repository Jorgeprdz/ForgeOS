# Recruitment Domain Model v1.0

Recruitment Lifecycle models the path from a durable human recruit identity to a contracted advisor.

This document defines contracts and boundaries only. It does not implement engines.

## Core Principle

Recruitment is a lifecycle, not a single pipeline.

A person may be referred more than once, evaluated by different managers, enter multiple offices, receive a key, lose a key, reactivate a key, and eventually convert to advisor or never convert. Forge must preserve that history.

## Mandatory Conceptual Model

```text
RecruitIdentity
  -> RecruitmentApplication[]
      -> CandidateAssessment[]
      -> Interview[]
      -> ManagerAssignment[]
      -> OfficeAssignment[]
      -> PrecontractCycle[]
          -> RuleSnapshot
          -> Progress[]
          -> Risk[]
          -> Outcome
      -> AdvisorConversion?
```

## 1. Entities

### RecruitIdentity

Durable person identity across all attempts.

Rules:

- `recruitIdentityId` is the long-lived person identity.
- It survives rejected applications, reentries, office changes and manager changes.
- It should contain identity-safe matching fields, duplicate review status and historical summary.
- It should not be confused with `candidateId`.

### RecruitmentApplication

A specific attempt to enter the organization.

Rules:

- `applicationId` represents one attempt.
- One `RecruitIdentity` may have many applications.
- Application status tracks the current attempt, not the person forever.
- Reentry creates a new application unless organization rules say to reopen an existing one.

### CandidateAssessment

Manager decision support for candidate quality.

Rules:

- Assessment is not automatic hiring.
- Assessment must preserve hard factors and vital factors.
- Multiple assessments may exist for one application.

### Interview

Conversation or formal evaluation event.

Rules:

- Interviews belong to an application.
- Interview notes, score and risk observations should persist.
- No-show and reschedule history should not be overwritten.

### ManagerAssignment

Manager ownership event.

Rules:

- Manager changes must be assignments, not overwrite.
- Each assignment has dates, reason and owner.
- Production and coaching attribution should reference the active assignment at the time of the event.

### OfficeAssignment

Office or organization-unit ownership event.

Rules:

- Office changes must be assignments, not overwrite.
- Office assignment determines which office rules config applies.
- A candidate may move offices before or during precontract.

### PrecontractCycle

One precontract lifecycle cycle.

Rules:

- `cycleId` represents one cycle.
- A cycle may start informally before key activation.
- A cycle may include key activation, official window, expiration, reactivation and closure.
- A candidate may have multiple cycles.
- Each cycle must store a rule snapshot.

### AdvisorConversion

Conversion event from recruitment to advisor.

Rules:

- Conversion creates or links `advisorId`.
- Conversion records the source application and cycle.
- Conversion should not erase recruitment history.

## 2. Relationships

- One `RecruitIdentity` has many `RecruitmentApplication` records.
- One `RecruitmentApplication` has many `CandidateAssessment` records.
- One `RecruitmentApplication` has many interviews.
- One `RecruitmentApplication` has many manager assignments.
- One `RecruitmentApplication` has many office assignments.
- One `RecruitmentApplication` has many `PrecontractCycle` records.
- One `RecruitmentApplication` may have one `AdvisorConversion`.
- One `PrecontractCycle` has one rule snapshot and many progress/risk events.

## 3. States

### Recruit Identity States

- `ACTIVE`
- `DUPLICATE_REVIEW`
- `MERGED_DUPLICATE`
- `DO_NOT_RECRUIT`
- `ARCHIVED`

### Application States

- `NEW`
- `SCREENING`
- `INTERVIEWING`
- `ASSESSED`
- `SELECTED`
- `PRECONTRACT`
- `ON_HOLD`
- `REJECTED`
- `WITHDRAWN`
- `CONVERTED`
- `ARCHIVED`

### Precontract Cycle States

- `INFORMAL`
- `KEY_ACTIVE`
- `OFFICIAL_WINDOW`
- `AT_RISK`
- `READY`
- `KEY_EXPIRED`
- `REACTIVATED`
- `CLOSED`
- `UNKNOWN`

### Assignment States

- `ACTIVE`
- `ENDED`
- `TRANSFER_PENDING`
- `CANCELLED`

### Conversion States

- `PENDING`
- `COMPLETED`
- `REVERSED`

## 4. Events

Identity events:

- `RECRUIT_IDENTITY_CREATED`
- `DUPLICATE_REVIEW_STARTED`
- `DUPLICATE_MERGED`
- `PREVIOUS_HISTORY_ATTACHED`
- `DO_NOT_RECRUIT_SET`
- `RECRUIT_IDENTITY_ARCHIVED`

Application events:

- `APPLICATION_CREATED`
- `RE_ENTRY_REQUESTED`
- `SCREENING_STARTED`
- `SCREENING_COMPLETED`
- `INTERVIEW_SCHEDULED`
- `INTERVIEW_COMPLETED`
- `CANDIDATE_ASSESSED`
- `CANDIDATE_SELECTED`
- `CANDIDATE_REJECTED`
- `CANDIDATE_WITHDRAWN`
- `APPLICATION_ON_HOLD`
- `APPLICATION_REOPENED`

Assignment events:

- `MANAGER_ASSIGNED`
- `MANAGER_CHANGED`
- `MANAGER_ASSIGNMENT_ENDED`
- `OFFICE_ASSIGNED`
- `OFFICE_CHANGED`
- `OFFICE_ASSIGNMENT_ENDED`

Precontract events:

- `PRECONTRACT_CYCLE_STARTED`
- `INFORMAL_ACTIVITY_STARTED`
- `KEY_ACTIVATED`
- `OFFICIAL_WINDOW_STARTED`
- `PROGRESS_RECORDED`
- `RISK_DETECTED`
- `COACHING_ASSIGNED`
- `KEY_EXPIRED`
- `KEY_REACTIVATION_REQUESTED`
- `KEY_REACTIVATED`
- `PRECONTRACT_READY`
- `PRECONTRACT_CYCLE_CLOSED`

Conversion events:

- `ADVISOR_CONVERSION_STARTED`
- `ADVISOR_CREATED`
- `CONTRACT_SIGNED`
- `ADVISOR_CONVERSION_COMPLETED`
- `ADVISOR_CONVERSION_REVERSED`

Organization events:

- `ORGANIZATION_RULES_CHANGED`
- `OFFICE_RULES_CHANGED`
- `RULE_SNAPSHOT_APPLIED`

## 5. Transitions

Application transition path:

```text
NEW
-> SCREENING
-> INTERVIEWING
-> ASSESSED
-> SELECTED
-> PRECONTRACT
-> CONVERTED
```

Alternative paths:

- Any active state may move to `ON_HOLD`.
- `ON_HOLD` may return to the previous active state.
- `SCREENING`, `INTERVIEWING`, `ASSESSED` or `SELECTED` may move to `REJECTED`.
- `REJECTED` may create a new application through reentry review.
- `PRECONTRACT` may move to `WITHDRAWN`, `REJECTED`, `ON_HOLD` or `CONVERTED`.

Precontract cycle transition path:

```text
INFORMAL
-> KEY_ACTIVE
-> OFFICIAL_WINDOW
-> READY
-> CLOSED
```

Alternative paths:

- `OFFICIAL_WINDOW -> AT_RISK`
- `AT_RISK -> OFFICIAL_WINDOW`
- `OFFICIAL_WINDOW -> KEY_EXPIRED`
- `KEY_EXPIRED -> REACTIVATED`
- `REACTIVATED -> OFFICIAL_WINDOW`
- `KEY_EXPIRED -> CLOSED`

Assignment transition path:

```text
ACTIVE -> ENDED
```

Manager or office change:

```text
ACTIVE assignment -> ENDED
new assignment -> ACTIVE
```

## 6. Metrics

Identity metrics:

- Total applications
- Total precontract cycles
- Previous outcomes
- Duplicate risk
- Reentry count
- Time since last attempt

Application metrics:

- Time in stage
- Screening completion time
- Interview completion rate
- No-show count
- Assessment score
- Selection rate
- Rejection reason distribution

Candidate assessment metrics:

- Hard factor completeness
- Vital factor completeness
- Overall score
- Risk level
- Confidence
- Strength/risk count

Manager assignment metrics:

- Time under manager
- Stage at assignment start
- Stage at assignment end
- Progress during assignment
- Conversion rate by manager
- Coaching actions assigned

Office assignment metrics:

- Time under office
- Rule config applied
- Progress under office
- Transfer count
- Conversion rate by office

Precontract cycle metrics:

- Informal activity duration
- Key activation delay
- Key activated at
- Official window started at
- Official window ends at
- Key status
- Days with active key
- Official window elapsed
- Official window remaining
- Official window progress percent
- Policies issued from explicit production data
- Commissions from explicit commission data
- Activity volume
- Coaching volume
- Risk count
- Recovery from risk
- Readiness
- Probability of success

Conversion metrics:

- Application-to-conversion time
- Cycle-to-conversion time
- Conversion source cycle
- Conversion manager
- Conversion office
- Early advisor ramp-up risk

## 7. Risks

Identity risks:

- Duplicate identity not detected
- Previous negative history ignored
- Reentry approved without learning
- Do-not-recruit status bypassed

Application risks:

- Candidate stuck in stage
- Weak motivation
- Weak character signal
- Low energy
- No-show pattern
- Manager bias
- Missing assessment data

Assignment risks:

- Manager shopping
- Office shopping
- Ownership gap after transfer
- Progress attribution to wrong manager
- Progress attribution to wrong office

Precontract risks:

- Informal activity without structure
- Key activated without pipeline
- Official window started without coaching plan
- Low activity
- Low production
- Low commission progress
- Repeated reactivation without improvement
- Cycle history ignored
- Rule snapshot missing

Conversion risks:

- Converted with weak habits
- Converted because threshold was met but quality is poor
- Early advisor attrition risk
- Conversion reversed without preserving audit trail

## 8. Organization / Office Configuration

These belong to Organization Profile or Office Rules Config:

- Official window duration
- Minimum policies
- Minimum commissions
- Currency
- Valid policy definition
- Valid commission definition
- Whether informal production counts
- Whether pre-key activity counts
- Reactivation rules
- Maximum cycles
- Cooldown before reentry
- Required interviews
- Assessment scoring weights
- Hard factor weights
- Vital factor weights
- Risk thresholds
- Conversion approval roles
- Transfer approval rules
- Do-not-recruit rules

## 9. What Forge Must Not Assume

Forge must not assume:

- `candidateId` is permanent person identity.
- One candidate has only one attempt.
- One application has only one manager.
- One application has only one office.
- Precontract starts only when a key is active.
- Precontract has one universal official window.
- Expired keys end the full relationship.
- Reactivation creates clean history.
- Historical cycles should be recalculated under new rules.
- Policy or commission thresholds are global.
- A manager change should overwrite previous ownership.
- AI can decide whether someone should be contracted.

## 10. Roadmap Of Implementation

Phase 1: Contracts and documentation

- Define `RecruitIdentity`.
- Define `RecruitmentApplication`.
- Define assignment contracts.
- Define `PrecontractCycle`.
- Define `AdvisorConversion`.
- Keep current `candidate.schema.json` and `precontract.schema.json` as compatibility contracts.
- Document key-clock timestamps and derived metrics in `PrecontractCycle`.

Phase 2: Fixtures

- Add recruitment lifecycle fixtures.
- Include duplicate, reentry, transfer, reactivation and conversion scenarios.

Phase 3: Validation tests

- Parse schemas.
- Validate fixtures against minimum fields.
- Validate lifecycle transitions with static fixtures.

Phase 4: Engines

- Candidate duplicate detection engine.
- Recruitment application state engine.
- Assignment timeline engine.
- Precontract lifecycle engine.
- Advisor conversion readiness engine.

Phase 5: Orchestration

- Recruitment lifecycle orchestrator consumes the engines.
- Manager intelligence consumes lifecycle reports.
- Forge AI Connector may explain reports but cannot change decisions.
