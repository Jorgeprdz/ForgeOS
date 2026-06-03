# FORGE OS - AGENTS.md

## Project Identity

Forge OS is a Sales Operating System built for financial advisors, managers and commercial organizations.

Forge is NOT:

- A generic CRM
- A chatbot
- A dashboard collection
- A note-taking system

Forge IS:

- A Decision Intelligence System
- A Career Intelligence System
- A Sales Operating System

Core Vision:

«Build the best advisor for advisors.»

Long-term vision:

«Forge accompanies the entire commercial career:

Candidate → Precontract → Advisor → Senior Advisor → Manager → Director»

---

## Mission

Help advisors and managers:

- Sell more
- Make better decisions
- Follow up consistently
- Develop commercial careers
- Convert information into action

Core Principle:

«Intelligence without action is just information.»

---

## Vision

Forge connects:

- Revenue Generation
- Sales Conversion
- Conversation Intelligence
- Relationship Intelligence
- Product Intelligence
- Policy Operations
- Manager Intelligence
- Team Intelligence

Goal:

«Help advisors become more productive and managers become better developers of people.»

---

## Prime Directives

1. Decision Clarity First
2. Help the advisor make better decisions
3. Help the advisor sell more
4. Every engine must produce actionable output
5. No invented financial values
6. No invented products
7. No projections without explicit data
8. Intelligence must lead to action
9. Forge is advisor-first
10. Forge is manager-aware
11. Quality of signal beats quantity of features

---

## Architecture Principles

### Engine-Based Architecture

Forge is composed of small specialized engines.

Pattern:

Input
↓
Engine
↓
Actionable Output

---

## Orchestrator Rule

Orchestrators consume engines.

They do NOT duplicate logic.

---

## Offline First

Forge Core must work without AI providers.

Core engines must continue operating if:

- OpenAI fails
- Internet fails
- Cloud services fail

---

## AI Layer Principle

Forge decides.

Generative AI explains.

AI may:

- Draft messages
- Explain recommendations
- Improve language

AI may NOT:

- Invent products
- Invent premiums
- Invent coverage
- Invent recommendations

---

## Workflow

Analyze
↓
Propose
↓
Approve
↓
Implement
↓
Test
↓
Commit
↓
Push

Rules:

- No UI changes without explicit instruction
- No app.js changes without explicit instruction
- Run tests before commit
- Commit by PAQ
- Push only when requested

---

## Forge Council

### Miranda

Role:
Quality Control

Focus:

- Discipline
- Prioritization
- Product quality

Question:
"Does this make Forge better?"

---

### Nash

Role:
Conversation Intelligence

Focus:

- Intent
- Objections
- Next Best Action

---

### Joy Mangano

Role:
Real-world utility

Focus:

- Adoption
- Simplicity
- Practical value

---

### Arqui Juve

Role:
Architecture

Focus:

- Maintainability
- Scalability
- Technical decisions

---

### Jürgen Klaric

Role:
Consumer Psychology

---

### Jordan Belfort

Role:
Sales Conversion

---

### Hitch

Role:
Rapport

---

### Patch Adams

Role:
Human Trust

---

### Chris Gardner

Role:
Execution & Prospecting

---

### Rocky

Role:
Consistency

---

### Mick

Role:
Behavior Intelligence

Focus:

- Habits
- Discipline
- Consistency
- Coachability
- Activity generation
- Execution patterns

Rules:

- Mick is not a motivational module.
- Mick measures actions that produce results, not only the results themselves.
- Mick tracks whether the advisor, candidate, precontract candidate or manager does the behaviors that create commercial outcomes.
- Mick applies across Recruitment, Precontract, Advisor and Manager workflows.

---

### Nicky Spurgeon

Role:
Networking & Referrals

---

## Current Project Status

### NASH Foundation

Status:
CLOSED

Includes:

- Context Builder
- Personality Engine
- Intent Engine
- Combat Intelligence
- Memory Engine
- Learning Engine
- Next Best Action
- Advisor Performance
- Coaching Insights
- Manager Alerts
- Team Intelligence
- Master Intelligence

---

### Relationship Intelligence

Status:
FOUNDATION CLOSED

Includes:

- Timeline
- Next Action
- Opportunity
- Life Event
- Referral Opportunity
- Health
- Engagement
- Review
- Master Orchestrator

---

### Forge AI Connector

Status:
FOUNDATION

Purpose:

Convert structured decisions into human language.

Forge decides.

AI explains.

---

## NASH Conversation Intelligence

Primary Goal:

Help advisors know:

- What to say
- Why to say it
- When to say it

Output:

Actionable conversation recommendations.

---

## Relationship Intelligence

Primary Goal:

Help advisors know:

- Who to contact
- Why
- When
- What opportunity exists

Output:

Relationship-driven actions.

---

## Product Intelligence

Purpose:

Understand insurance and financial products.

Rules:

- Product truth comes from documentation
- No invented values
- No invented benefits

---

## Policy & Sales Operations

Purpose:

Understand policies and operational events.

Includes:

- Policy Detail
- Policy Timeline
- Renewal
- Follow-up
- Tasks
- OCR
- Operational Center

---

## Compensation Intelligence Architecture

Status:
ARCHITECTURE DOCUMENTED

Source:

- `FORGE_COMPENSATION_INTELLIGENCE_ARCHITECTURE.md`

Central Principle:

Production Events are facts.

Contest Intelligence, Compensation Intelligence and Manager Compensation Intelligence are rule-based interpretations.

Domains:

- Career Intelligence
- Contest Intelligence
- Compensation Intelligence
- Conservation Intelligence
- Manager Compensation Intelligence
- Shared Commercial Domain
- Economic Motivation Engine
- Compensation Operations

Rules:

- Advisor First.
- No invented financial values.
- No invented products.
- No projections without explicit data.
- Product Knowledge, Commission Schedules, Contest Rules and Manager Compensation Rules must remain separate.
- Historical compensation periods must preserve rule snapshots and must not be recalculated with new rules except as separate analysis.
- Do not mix 2025 commission schedules with 2026 contest rules.
- Do not mix Prima Meta, Prima Pago, commission and renewal.
- Do not treat LIMRA and IGC as interchangeable.
- Do not ask for manual capture when Forge can infer from reliable source data.

---

## Advisor Experience Domain

Status:

- PLANNED
- ARCHITECTURE APPROVED
- NO IMPLEMENTED

Source:

- `FORGE_ADVISOR_EXPERIENCE_ARCHITECTURE.md`

Purpose:

Own adoption, learning, discovery and progression of the advisor across Forge.

Responsibilities:

- Advisor Setup
- Benvenù Experience
- Advisor Baseline Snapshot
- Progressive Discovery
- Clippy Engine
- Feature Learning State
- Contextual Help Signals
- Revenue Intelligence Introduction
- Command Palette Introduction
- Candy Crush Experience

Boundaries:

- Advisor Experience is not UI decoration.
- Advisor Experience is not a chatbot.
- Advisor Experience is not a corporate tutorial.
- Advisor Experience does not own Revenue Intelligence rules.
- Advisor Experience does not own Mick behavior scoring.
- Advisor Experience does not own Compensation calculations.
- Advisor Experience consumes business domains but does not duplicate their logic.

Dependencies:

- Revenue Intelligence
- Mick / Behavior Intelligence
- Compensation Intelligence
- Command OS
- Policy & Sales Operations
- Learning Intelligence
- Shared Commercial Domain

Adoption Rules:

- Forge must create value before asking for manual work.
- Benvenù must produce durable value such as Advisor Baseline Snapshot, first action, product focus or revenue introduction.
- First experience must not look or behave like a generic CRM onboarding flow.

Learning Rules:

- Learning is measured by behavior, not screens viewed.
- Feature learning states include unseen, introduced, tried, completed_with_help, completed_without_help, learned, suppressed and needs_refresh.
- A feature should stop teaching itself when the advisor can complete the work without help.

Contextual Help Rules:

- Clippy Engine must be contextual, non-invasive and non-interruptive.
- Clippy Engine must never block work.
- Clippy Engine must never repeat irrelevant information.
- Clippy Engine must never teach a function already learned.
- Contextual help may explain, orient or reveal capabilities, but must not invent recommendations, products or financial values.

Adaptive Difficulty Rules:

- Candy Crush Experience reduces complexity when the advisor is frustrated.
- Candy Crush Experience increases challenge when the advisor progresses.
- Forge must never be so difficult that it causes abandonment or so easy that it creates complacency.

---

## Manager & Team Intelligence

Future Major Area

Includes:

- Recruitment Intelligence
- Recruitment Lifecycle Domain
- Candidate Intelligence
- Interview Intelligence
- Precontract Intelligence
- Precontract Lifecycle Engine
- Mick / Behavior Intelligence
- Training Intelligence
- Development Intelligence
- Team Intelligence
- Coaching Intelligence
- Leadership Intelligence
- Compensation Intelligence
- Conservation Intelligence
- Economic Motivation Intelligence
- Advisor Experience
- Benvenù Experience
- Clippy Engine
- Candy Crush Experience

---

## Candidate Intelligence

Evaluate:

Hard Factors:

- Age
- Marriage
- Years Living In Town
- Career
- Employment Status

Vital Factors:

- Mental Agility
- Drive
- Energy
- Money Motivation
- Character
- Success History
- Retention Potential

Goal:

Help managers identify future producers.

---

## Recruitment Lifecycle Domain

Conceptual Model:

RecruitIdentity
→ RecruitmentApplication[]
→ CandidateAssessment[]
→ Interview[]
→ ManagerAssignment[]
→ OfficeAssignment[]
→ PrecontractCycle[]
→ AdvisorConversion?

Principles:

- RecruitIdentity is the durable person identity.
- candidateId is not permanent identity.
- applicationId represents one attempt to enter.
- cycleId represents one precontract cycle.
- Manager and office changes are assignments or events, not overwrites.
- Each precontract cycle stores the rules snapshot used at that time.
- Historical cycles must not be recalculated with new rules except as separate analysis.
- Recruitment uses a hybrid lifecycle: current state plus critical event history.

---

## Precontract Intelligence

Precontract Lifecycle Engine:

Precontract is not a fixed 90-day rule.

It must support:

- Informal activity before key activation
- Key activation date
- Configurable official window
- Key expiration
- Key reactivation
- Multiple precontract cycles
- Accumulated lifecycle history

Rules Source:

- Organization Profile
- Office Rules Config

Do not hardcode:

- Days
- Minimum number of policies
- Minimum commission amount

Outputs:

- Contract Readiness
- Risk
- Progress
- Probability of Success
- Lifecycle Stage
- Cycle History

---

## Testing Strategy

Every engine requires:

- Unit tests
- Master tests

Preference:

Action-oriented testing.

Question:

"Does the decision make sense?"

---

## Git Rules

Never:

- Force push
- Delete user work
- Commit without approval

Always:

- Check git status
- Run relevant tests
- Commit by functional unit

---

## Known Gaps

Current Gaps:

- Schemas
- Shared Fixtures
- Global Acceptance Test
- CommonJS / ESM migration strategy
- AGENTS maintenance process

---

## Core Philosophy

Forge does not exist to generate reports.

Forge exists to generate decisions.

Final Goal:

Tell the advisor:

"Do this now.
With this client.
For this reason."

And tell the manager:

"Develop this person.
Coach this skill.
Watch this risk."
