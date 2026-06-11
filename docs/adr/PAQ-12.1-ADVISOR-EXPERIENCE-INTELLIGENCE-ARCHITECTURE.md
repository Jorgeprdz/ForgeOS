# PAQ-12.1 Advisor Experience Intelligence Architecture

Status: ARCHITECTURE CANDIDATE

Scope: Domain architecture documentation only.

Implementation: NOT APPROVED.

No code. No engines. No schemas. No UI. No app.js. No financial calculations. No AI automation.

## 1. Executive Summary

PAQ-12 established Advisor Experience Intelligence as the Forge OS domain for advisor adoption, learning, discovery, progression and productive use of Forge.

PAQ-12.1 advances the domain from architecture discovery into architecture candidate by hardening:

- Responsibilities.
- Ownership boundaries.
- Subdomain dependencies.
- Feature Learning State.
- Contextual Help Signals.
- Advisor Experience events and snapshots.
- Relationships with Mick, Revenue, Productivity, Forecast, Conservation, Compensation and Command OS.
- Risks and gaps before Architecture Lock.

Advisor Experience Intelligence exists because Forge can produce strong intelligence and still fail if advisors do not understand, trust, adopt and repeatedly use the system.

Core decision:

- Advisor Experience Intelligence owns adoption, learning and progressive discovery.
- It consumes business domains.
- It does not own business truth.
- It does not calculate financial values.
- It does not execute commands.
- It does not score behavior.

## 2. Cross References

- [FORGE_MASTER_BUILD_TREE.md](../../FORGE_MASTER_BUILD_TREE.md)
- [AGENTS.md](../../AGENTS.md)
- [FORGE_CONSTITUTION_V3.md](../../FORGE_CONSTITUTION_V3.md)
- [FORGE_FOUNDATION_LOCK.md](../archive/FORGE_FOUNDATION_LOCK.md)
- [FORGE_ADVISOR_EXPERIENCE_ARCHITECTURE.md](../archive/FORGE_ADVISOR_EXPERIENCE_ARCHITECTURE.md)
- [PAQ-07-PARTNER-INTELLIGENCE-DISCOVERY.md](PAQ-07-PARTNER-INTELLIGENCE-DISCOVERY.md)
- [PAQ-08-ADVISOR-DEVELOPMENT-INTELLIGENCE-DISCOVERY.md](PAQ-08-ADVISOR-DEVELOPMENT-INTELLIGENCE-DISCOVERY.md)
- [PAQ-08.5-ARCHITECTURE-RISK-CORRECTION-RATIFICATION.md](../architecture/constitution/PAQ-08.5-ARCHITECTURE-RISK-CORRECTION-RATIFICATION.md)
- [PAQ-09-PRODUCTIVITY-INTELLIGENCE-DISCOVERY.md](PAQ-09-PRODUCTIVITY-INTELLIGENCE-DISCOVERY.md)
- [PAQ-09.5-PRODUCTIVITY-INTELLIGENCE-ARCHITECTURE-LOCK.md](PAQ-09.5-PRODUCTIVITY-INTELLIGENCE-ARCHITECTURE-LOCK.md)
- [PAQ-10.5-CONSERVATION-INTELLIGENCE-ARCHITECTURE-LOCK.md](PAQ-10.5-CONSERVATION-INTELLIGENCE-ARCHITECTURE-LOCK.md)
- [PAQ-11.5.2-FORECAST-INTELLIGENCE-ARCHITECTURE-LOCK.md](PAQ-11.5.2-FORECAST-INTELLIGENCE-ARCHITECTURE-LOCK.md)
- [PAQ-12-ADVISOR-EXPERIENCE-INTELLIGENCE-PRODUCTIVITY.md](PAQ-12-ADVISOR-EXPERIENCE-INTELLIGENCE-PRODUCTIVITY.md)

## 3. Difference From PAQ-12

PAQ-12:

- Established the Advisor Experience Intelligence domain.
- Documented subdomains.
- Marked status as PLANNED / ARCHITECTURE DISCOVERY.
- Produced a review bundle.

PAQ-12.1:

- Hardens the domain into ARCHITECTURE CANDIDATE.
- Defines candidate ownership.
- Defines event and snapshot model.
- Defines learning metrics and non-owned business metrics.
- Defines explicit upstream/downstream dependency boundaries.
- Identifies gaps that must close before ARCHITECTURE LOCK.

PAQ-12.1 still does not approve:

- Engines.
- Schemas.
- UI.
- app.js changes.
- Automations.
- AI implementation.
- Financial calculations.

## 4. Domain Responsibility

Advisor Experience Intelligence is responsible for:

- Advisor Setup experience.
- Benvenù Experience.
- Advisor Baseline Snapshot.
- Progressive Discovery.
- Clippy Engine behavior.
- Feature Learning State.
- Contextual Help Signals.
- Revenue Intelligence Introduction.
- Alfred / Universal Command Bar Introduction.
- Candy Crush Experience.
- Adoption interpretation.
- Learning progression interpretation.
- Experience complexity state.
- Help eligibility and suppression state.

Advisor Experience Intelligence is not responsible for:

- Revenue opportunity logic.
- Mick behavior scoring.
- Productivity classification.
- Conservation interpretation.
- Forecast calculation.
- Compensation calculation.
- Business Planning.
- Command execution.
- Production Events.
- Rule Pack thresholds.
- Product truth.
- Policy operations.

## 5. Architecture Candidate Decision

Decision:

- Advisor Experience Intelligence is an ARCHITECTURE CANDIDATE.

Justification:

- The domain has a distinct business question:
  - Can the advisor discover, understand and use Forge productively?
- It has a distinct ownership layer:
  - Adoption, feature learning and contextual help.
- It consumes but does not duplicate upstream domains.
- It aligns with the constitutional principles of Advisor First, Value Before Work, Learning By Doing, Learning Through Reasoning, Decision Clarity and Economic Clarity.

Not ready for ARCHITECTURE LOCK because:

- Feature Learning State transition rules need final hardening.
- Contextual Help Signal thresholds need review.
- Advisor Baseline Snapshot refresh and historical retention rules need closure.
- Command OS integration boundary needs stress testing.
- Manager visibility into Advisor Experience signals needs guardrails.

## 6. Subdomain Map

| Subdomain | Status | Owner | Purpose |
|---|---|---|---|
| Advisor Setup | ARCHITECTURE CANDIDATE | Advisor Experience | Minimal context for first value |
| Benvenù Experience | ARCHITECTURE CANDIDATE | Advisor Experience | First-value emotional and practical experience |
| Advisor Baseline Snapshot | ARCHITECTURE CANDIDATE | Advisor Experience | Initial adoption and context snapshot |
| Progressive Discovery | ARCHITECTURE CANDIDATE | Advisor Experience | Reveal features when useful |
| Clippy Engine | ARCHITECTURE CANDIDATE | Advisor Experience | Contextual non-invasive help |
| Feature Learning State | ARCHITECTURE CANDIDATE | Advisor Experience | Track feature mastery |
| Contextual Help Signals | ARCHITECTURE CANDIDATE | Advisor Experience | Decide when help appears or disappears |
| Revenue Intelligence Introduction | ARCHITECTURE CANDIDATE | Advisor Experience | Introduce revenue workflows |
| Alfred / Universal Command Bar Introduction | ARCHITECTURE CANDIDATE | Advisor Experience | Teach Command OS progressively |
| Candy Crush Experience | ARCHITECTURE CANDIDATE | Advisor Experience | Adaptive complexity |

## 7. Inputs

Advisor Experience Intelligence consumes:

- CommercialPerson / advisor identity.
- Advisor lifecycle context.
- Manager assignment.
- Career stage from Career Intelligence.
- Advisor Development status.
- Mick behavior signals.
- Revenue opportunities.
- Productivity trend and risk.
- Forecast confidence and gap signals.
- Conservation risk and policy quality.
- Compensation explanation context.
- Command OS command availability.
- Feature usage signals.
- EvidenceRecord.
- ProvenanceRecord.
- RuleSnapshot when showing rule-sensitive terms.
- PeriodSnapshot when showing period-sensitive outputs.

Input guardrail:

- Advisor Experience consumes upstream outputs as context.
- It does not recalculate upstream metrics.

## 8. Outputs

Advisor Experience Intelligence produces:

- Advisor Setup state.
- Advisor Baseline Snapshot.
- Feature Learning State.
- Contextual Help Signal.
- Progressive Discovery state.
- Clippy help state.
- Command learning state.
- Revenue Introduction state.
- Experience complexity state.
- Help suppression state.
- Learning refresh signal.
- Advisor Experience event.
- Advisor Experience snapshot.

Output guardrail:

- Outputs are adoption and learning interpretations.
- They are not Production Events.
- They are not compensation facts.
- They are not productivity facts.
- They are not revenue opportunities.

## 9. Event Model

Advisor Experience events are experience/adoption events.

Candidate event taxonomy:

| Event | Type | Owner | Meaning |
|---|---|---|---|
| ADVISOR_SETUP_STARTED | Experience Event | Advisor Experience | Setup flow began |
| ADVISOR_SETUP_COMPLETED | Experience Event | Advisor Experience | Minimal setup reached |
| BENVENU_STARTED | Experience Event | Advisor Experience | First experience began |
| BENVENU_COMPLETED | Experience Event | Advisor Experience | First experience completed |
| BASELINE_SNAPSHOT_CREATED | Snapshot Event | Advisor Experience | Baseline snapshot created |
| FEATURE_INTRODUCED | Experience Event | Advisor Experience | Feature surfaced in context |
| FEATURE_TRIED | Experience Event | Advisor Experience | Advisor attempted feature |
| FEATURE_COMPLETED_WITH_HELP | Experience Event | Advisor Experience | Advisor completed action with help |
| FEATURE_COMPLETED_WITHOUT_HELP | Experience Event | Advisor Experience | Advisor completed action without help |
| FEATURE_LEARNED | Interpretation Event | Advisor Experience | Feature mastery inferred |
| HELP_SHOWN | Experience Event | Advisor Experience | Contextual help appeared |
| HELP_SUPPRESSED | Experience Event | Advisor Experience | Help suppressed |
| HELP_REFRESH_NEEDED | Interpretation Event | Advisor Experience | Refresh may be needed |
| COMMAND_INTRODUCED | Experience Event | Advisor Experience | Command introduced |
| REVENUE_INTRODUCED | Experience Event | Advisor Experience | Revenue workflow introduced |
| DIFFICULTY_REDUCED | Interpretation Event | Advisor Experience | Complexity lowered |
| DIFFICULTY_INCREASED | Interpretation Event | Advisor Experience | Complexity raised |

Event guardrails:

- Advisor Experience events do not create business facts.
- Advisor Experience events must not become Production Events.
- Advisor Experience events must reference upstream source when explaining business context.

## 10. Snapshot Model

Candidate snapshots:

- Advisor Baseline Snapshot.
- Feature Learning State Snapshot.
- Contextual Help Signal Snapshot.
- Advisor Experience Progress Snapshot.
- Command Adoption Snapshot.
- Revenue Introduction Snapshot.
- Experience Complexity Snapshot.

Required snapshot fields conceptually:

- Advisor identity reference.
- Period.
- Source.
- Evidence status.
- Upstream owner reference when applicable.
- Confidence where applicable.
- Feature id or workflow id.
- Current learning state.
- Previous learning state.
- Transition reason.
- Suppression reason when applicable.
- Refresh reason when applicable.

Snapshot guardrail:

- Baseline is not current business truth.
- Feature Learning State is not behavior scoring.
- Contextual Help Signal is not a business recommendation by itself.

## 11. Feature Learning State

Approved candidate states:

| State | Meaning | Transition Evidence |
|---|---|---|
| `unseen` | Feature has not been introduced | No contextual introduction exists |
| `introduced` | Feature was surfaced | Clippy, Benvenù or Progressive Discovery introduced it |
| `tried` | Advisor attempted feature | User attempted workflow |
| `completed_with_help` | Advisor completed task with help | Completion after contextual guidance |
| `completed_without_help` | Advisor completed task unaided | Completion without active help |
| `learned` | Advisor demonstrates repeatable mastery | Repeated completion without help or repeated errors |
| `suppressed` | Help should not appear | Learned, irrelevant or safely dismissed |
| `needs_refresh` | Prior learning may be stale | Workflow changed, long inactivity, rule/context changed |

Invalid proof of learning:

- Page view.
- Tooltip dismissal.
- Accidental click.
- Time on page alone.

Learning By Doing rule:

- Learning is measured through meaningful task completion and repeatable behavior, not exposure.

## 12. Contextual Help Signals

Contextual Help Signals decide whether help should appear, remain hidden, be suppressed or be refreshed.

Candidate signals:

| Signal | Meaning | Action |
|---|---|---|
| Repeated error | Advisor is stuck | Show help |
| Time stuck | Workflow friction | Explain next step |
| Abandoned task | Possible confusion | Offer simpler path |
| Forecast confidence changed | Forecast needs explanation | Explain uncertainty |
| Revenue opportunity active | Action can create value | Surface relevant workflow |
| Compensation context viewed | Rule explanation may help | Show only rule-backed help |
| Feature learned | Help no longer useful | Suppress |
| Long inactivity | Learning may be stale | Set `needs_refresh` |
| Command would reduce steps | Command can help | Introduce Alfred / Universal Command Bar |

Help guardrails:

- Help must be contextual.
- Help must be optional.
- Help must not block work.
- Help must not show unofficial metrics.
- Help must not repeat irrelevant information.
- Help must stop when no longer valuable.

## 13. Metrics and Ownership

Advisor Experience may own:

| Metric / State | Owner | Purpose |
|---|---|---|
| Setup completeness | Advisor Experience | Minimal context readiness |
| Feature learning state | Advisor Experience | Feature mastery |
| Help eligibility | Advisor Experience | Whether help may appear |
| Help suppression state | Advisor Experience | Whether help should remain hidden |
| Progressive discovery state | Advisor Experience | Feature reveal stage |
| Command adoption state | Advisor Experience | Command learning |
| Experience complexity state | Advisor Experience | Adaptive difficulty |

Advisor Experience may consume:

| Signal | Owner | Advisor Experience Use |
|---|---|---|
| Behavior signals | Mick | Adapt help and complexity |
| Revenue opportunity | Revenue Intelligence | Introduce revenue workflow |
| Productivity trend | Productivity Intelligence | Adjust learning complexity |
| Conservation risk | Conservation Intelligence | Explain policy quality context |
| Forecast confidence | Forecast Intelligence | Explain uncertainty |
| Compensation explanation | Compensation Intelligence | Explain rule-backed money context |
| Command availability | Command OS | Introduce command use |

Advisor Experience must not own:

- Revenue metrics.
- Productivity metrics.
- Conservation metrics.
- Forecast metrics.
- Compensation metrics.
- Production facts.
- Career stage.
- Manager actions.

## 14. Relationship With PAQs 7-12

### PAQ-07 Partner Intelligence

Partner Intelligence consumes advisor capacity and unit health context.

Advisor Experience may influence adoption and productive use, but it does not own partner success or unit performance.

### PAQ-08 Advisor Development Intelligence

Advisor Development explains the transformation from signed advisor to productive advisor capacity.

Advisor Experience helps the advisor understand and use Forge during that transformation.

Boundary:

- Development owns transformation readiness.
- Advisor Experience owns learning and adoption of Forge.

### PAQ-08.5 Architecture Risk Correction

PAQ-08.5 ratified:

- Local Predictive Truth is not Institutional Historical Truth.
- Mick evaluates execution and does not own tasks.
- Capture Once must precede Decision Intelligence.
- CommercialPerson remains canonical identity.

Advisor Experience must follow these ratified findings.

### PAQ-09 Productivity Intelligence

Productivity Intelligence explains whether behavior and pipeline movement become repeatable output.

Advisor Experience may adapt complexity based on productivity context, but it does not classify productivity.

### PAQ-10 Conservation Intelligence

Conservation owns durability, quality, LIMRA, IGC and conservation risk.

Advisor Experience may explain conservation context, but must not calculate conservation metrics.

### PAQ-11 Forecast Intelligence

Forecast owns forecast snapshots, risk, confidence and gap signals.

Advisor Experience may explain forecasts, but must preserve:

- Forecasts are suggestions.
- Facts are facts.
- Forecast does not promise income.

### PAQ-12 Advisor Experience Discovery

PAQ-12 created the discovery structure.

PAQ-12.1 hardens it into Architecture Candidate.

## 15. Relationship With Mick

Mick owns:

- Behavior signals.
- Execution consistency.
- Discipline and activity patterns.

Advisor Experience consumes Mick signals to:

- Adapt help.
- Reduce complexity.
- Increase challenge.
- Detect learning friction.
- Decide whether a workflow needs refreshed guidance.

Forbidden:

- Advisor Experience must not score discipline.
- Advisor Experience must not own coachability.
- Advisor Experience must not mutate Mick outputs.

## 16. Relationship With Revenue Intelligence

Revenue Intelligence owns:

- Opportunities.
- Pipeline.
- Revenue source context.

Advisor Experience owns:

- Revenue workflow introduction.
- Contextual explanation of why a revenue workflow matters.
- Feature learning state for revenue workflows.

Forbidden:

- Advisor Experience must not recalculate opportunities.
- Advisor Experience must not create revenue pipeline.
- Advisor Experience must not claim financial value without evidence and rules.

## 17. Relationship With Compensation and Economic Motivation

Compensation owns rule-backed money interpretation.

Economic Motivation translates gaps into money only when evidence, rules, period and confidence exist.

Advisor Experience may:

- Explain compensation context.
- Reduce complexity of compensation explanations.
- Surface Clippy guidance when the advisor is in relevant context.

Advisor Experience must not:

- Calculate compensation.
- Promise income.
- Invent financial values.
- Show economic impact without RuleSnapshot, EvidenceRecord, PeriodSnapshot, ProvenanceRecord and confidence.

## 18. Relationship With Command OS

Command OS owns:

- Command parsing.
- Command routing.
- Command execution.
- Search and quick actions.

Advisor Experience owns:

- Alfred / Universal Command Bar Introduction.
- Command learning state.
- Contextual command suggestions.

Boundary:

- Advisor Experience teaches command use.
- Command OS executes commands.

Alfred is the advisor-facing universal command bar experience. Command OS is the technical command infrastructure. Advisor Experience teaches Alfred progressively, but does not own Command OS execution logic.

## 19. Relationship With Advisor Productivity

Advisor Experience affects productivity indirectly through adoption and reduced friction.

It may influence:

- Faster task completion.
- Better workflow discovery.
- More consistent usage.
- Reduced help dependency.
- Better understanding of next action.

It must not claim:

- It created production.
- It owns productivity.
- It owns Productive Advisor Capacity.

## 20. Build Tree Candidate Update

Recommended Build Tree state:

```text
🔵 Advisor Experience Intelligence - ARCHITECTURE CANDIDATE / NOT IMPLEMENTED
│
├── 🔵 PAQ-12 Advisor Experience Intelligence & Productivity - PLANNED / ARCHITECTURE DISCOVERY
├── 🔵 PAQ-12.1 Advisor Experience Intelligence Architecture - ARCHITECTURE CANDIDATE
├── 🔵 Advisor Setup - ARCHITECTURE CANDIDATE
├── 🔵 Benvenù Experience - ARCHITECTURE CANDIDATE
├── 🔵 Advisor Baseline Snapshot - ARCHITECTURE CANDIDATE
├── 🔵 Progressive Discovery - ARCHITECTURE CANDIDATE
├── 🔵 Clippy Engine - ARCHITECTURE CANDIDATE
├── 🔵 Feature Learning State - ARCHITECTURE CANDIDATE
├── 🔵 Contextual Help Signals - ARCHITECTURE CANDIDATE
├── 🔵 Revenue Intelligence Introduction - ARCHITECTURE CANDIDATE
├── 🔵 Alfred / Universal Command Bar Introduction - ARCHITECTURE CANDIDATE
├── 🔵 Candy Crush Experience - ARCHITECTURE CANDIDATE
└── ⛔ Implementation - NOT APPROVED
```

## 21. Risks Before Lock

| Risk | Impact | Required Guardrail |
|---|---|---|
| Advisor Experience becomes UI decoration | No adoption value | Require Value Before Work |
| Clippy becomes invasive | Advisor ignores help | Contextual eligibility and suppression |
| Feature Learning State uses page views | False learning | Require behavior evidence |
| Advisor Experience duplicates Mick | Ownership conflict | Consume Mick only |
| Advisor Experience duplicates Revenue | Business logic duplication | Consume Revenue only |
| Advisor Experience explains unofficial metrics | Trust and governance risk | Require owner/evidence/confidence |
| Economic output appears without rules | Financial risk | Require RuleSnapshot and evidence |
| Candy Crush becomes gamification | Engagement over outcomes | Tie difficulty to productive work |
| Command introduction becomes mandatory | Workflow friction | Preserve non-command paths |
| Manager uses learning state as surveillance | Advisor trust risk | Manager visibility guardrails needed |

## 22. Gaps Before Architecture Lock

Must close before LOCK:

- Feature Learning State transition rules.
- Contextual Help Signal thresholds.
- Advisor Baseline Snapshot retention and refresh rules.
- Manager visibility and governance.
- Command OS consumption boundary.
- Rule Pack context display rules for Clippy.
- Economic Clarity display rules.
- Event/snapshot correction model.
- Learning state privacy and audit posture.

## 23. Validation Checklist Before Lock

- Advisor Experience does not own business metrics.
- Advisor Experience does not calculate compensation.
- Advisor Experience does not score behavior.
- Advisor Experience does not execute commands.
- Feature learning is behavior-based.
- Clippy can be suppressed.
- Benvenù produces first value.
- Candy Crush adapts complexity without lowering business standards.
- Revenue introduction consumes official Revenue output.
- Forecast explanations preserve uncertainty.
- Compensation explanations require rule-backed context.
- No schemas or engines are approved.

## 24. Final Verdict

Advisor Experience Intelligence is ready to move from:

- PLANNED / ARCHITECTURE DISCOVERY

to:

- ARCHITECTURE CANDIDATE

Implementation remains:

- NOT APPROVED

Next recommended action:

- Human review of PAQ-12.1.
- If accepted, run a separate Advisor Experience Architecture Lock PAQ before any implementation.
