# FORGE OS CURRENT STATE DOMAIN COMPENSATION ADVISOR EXPERIENCE

## Repository References

- [FORGE_MASTER_BUILD_TREE.md](FORGE_MASTER_BUILD_TREE.md)
- [AGENTS.md](AGENTS.md)
- [FORGE_CONSTITUTION_V3.md](FORGE_CONSTITUTION_V3.md)
- [FORGE_FOUNDATION_LOCK.md](FORGE_FOUNDATION_LOCK.md)

---


Forge OS
Current Architecture State Review

### Focus
Business Domains
Advisor Experience
Compensation Rules
Shared Commercial Foundation
Advisor Development
Operational Clocks
Evidence and Provenance

### Document type
Plain text architecture documentation.

### Scope
No executable code.
No engines.
No schemas.
No UI.
No commits.


## 0. Source Documents Consulted

This document consolidates the current architectural state from existing Forge OS documentation and PAQ artifacts.

### Primary local sources

FORGE_FOUNDATION_LOCK.md
FORGE_COMPENSATION_INTELLIGENCE_ARCHITECTURE.md
FORGE_ADVISOR_EXPERIENCE_ARCHITECTURE.md
FORGE_CONSTITUTION_V3.md
AGENTS.md
FORGE_MASTER_BUILD_TREE.md
PAQ-04-METRICS-OWNERSHIP-FINALIZATION.txt
PAQ-05-RULE-SNAPSHOT-HARDENING.txt
PAQ-06-COMMERCIAL-EVENTS-TAXONOMY.txt
FORGE_SHARED_COMMERCIAL_MODEL_IDENTITY_ATTRIBUTION_HARDENING.txt
FORGE_SHARED_COMMERCIAL_MODEL_EVIDENCE_PROVENANCE_FOUNDATION.txt
FORGE_SHARED_COMMERCIAL_MODEL_PERIODS_OPERATIONAL_CLOCKS_HARDENING.txt
PAQ-06-RECRUITMENT-HARDENING-REVIEW.txt
PAQ-07-PARTNER-INTELLIGENCE-DISCOVERY.txt
PAQ-08-ADVISOR-DEVELOPMENT-INTELLIGENCE-DISCOVERY.txt
MANAGER_COMPENSATION_KNOWLEDGE_BASE.md
COMPENSATION_DOMAIN_MODEL.md
FORGE_SHARED_DOMAIN_MODEL.md

### Foundation status source
FORGE_FOUNDATION_LOCK.md declares Foundation Lock CLOSED with score 92/100.

### Core constitutional source
Forge Core is universal.
Production Events are facts.
Rule Packs interpret facts.
SMNYL Agency 2026 is the first validated Rule Pack.
SMNYL Agency 2026 is not Forge Core.


## 1. Executive State

Forge OS is currently transitioning from Foundation Phase into Intelligence Domains Phase.

Foundation is considered closed.

### The closed foundation includes

Shared Commercial Model.
Identity and Attribution.
Evidence and Provenance.
Periods and Operational Clocks.
Metrics Ownership.
Rule Snapshot.
Commercial Events Taxonomy.
Foundation Lock Review.

### The central architectural rule is

Production Events are facts.
Rule Packs interpret facts.

### This means

A policy paid event is a fact.
A commission posted event is a fact.
A contest qualification is an interpretation.
A bonus calculation is an interpretation.
A manager productivity bonus is an interpretation.
A conservation index snapshot is an interpretation based on source, period and rules.
A forecast is a suggestion, not a fact.
A business plan is a decision path, not evidence of execution.

Forge Core must remain universal.

### Forge Core may define

CommercialPerson.
CommercialAccount.
CommercialRelationship.
CommercialAssignment.
CommercialAttribution.
CommercialServicing.
Policy.
Product.
ProductionEvent.
EvidenceRecord.
ProvenanceRecord.
SourceSystem.
RuleSnapshot.
PeriodSnapshot.
MetricSnapshot.

### Forge Core must not hardcode

Carrier-specific rules.
Distribution channel rules.
Contest rules.
Compensation rules.
Career rules.
Promotion rules.
KPI rules.
Activity rules.
Recognition rules.
Conservation rules.
Manager compensation rules.

### Rule Pack hierarchy

Carrier
Distribution Channel
Rule Pack
Rules

SMNYL Agency 2026 is currently treated as the first validated Rule Pack.


## 2. Domain Maps

2.1 Career Intelligence

### Purpose

Career Intelligence determines where a person is in the commercial career lifecycle.

### It answers

Is this person a candidate, precontract candidate, advisor, senior advisor, manager, Partner or director?
What is the applicable career stage?
What career month applies?
What contest month applies?
What stage transition happened?
What rules govern this stage?

### Ownership

Career stage.
Career month.
Career transition history.
Advisor classification.
Career eligibility context.
Career timeline interpretation.

### Inputs

CommercialPerson.
CommercialRole.
CommercialAssignment.
Contract date.
Connection date.
Contest date.
Advisor conversion event.
Career rule snapshot.
PeriodSnapshot.
Role history.
Assignment history.

### Outputs

Career stage.
Career Month.
Contest Month.
NP Contest Month when applicable.
Advisor class.
Transition history.
Eligibility context for contests, compensation and development.

### Dependencies

Shared Commercial Domain.
RuleSnapshot.
PeriodSnapshot.
Recruitment Intelligence.
Precontract lifecycle.
Advisor Development Intelligence.
Contest Intelligence.
Compensation Intelligence.

### Limits

Career Intelligence does not calculate compensation.
Career Intelligence does not own production facts.
Career Intelligence does not own contest qualification.
Career Intelligence does not own productivity.
Career Intelligence does not own behavior.

### Signals consumed

Signed advisor.
Contract effective date.
Stage change.
Role assignment.
Promotion event.
Rule Pack context.

### Signals produced

Career stage.
Career month.
Stage transition.
Career risk.
Career eligibility context.


2.2 Contest Intelligence

### Purpose

Contest Intelligence interprets contest rules and explains eligibility, gaps, blockers and contest outcomes.

### It answers

Is the advisor in the correct contest period?
What contest group applies?
What policy count applies?
What Prima Meta gap exists?
Is Training Allowance at risk?
Is Bono Inicial qualified?
Is Bono Renovacion qualified?
Is Bono GMM qualified?
What action is needed?

### Ownership

Contest qualification.
Contest group interpretation.
Contest policy count.
Contest gap.
Contest risk.
Contest event interpretation.

### Inputs

Production Events.
Policy events.
Career stage.
Contest Month.
NP Contest Month.
Semester Month when relevant.
Prima Meta.
Prima Pago.
Prima Renovacion.
Policy Count.
Contest Policy Count.
### LIMRA.
IGC.
Persistency.
Siniestralidad where applicable.
Contest RuleSnapshot.
PeriodSnapshot.

### Outputs

Contest qualification.
Contest group.
Bonus qualification.
Gap to qualification.
Contest risk.
Contest action recommendation.
ContestEvent.

### Dependencies

Career Intelligence.
Production Events.
Conservation Intelligence.
Rule Pack.
Metrics ownership.
Period clocks.

### Limits

Contest Intelligence does not pay bonuses.
Contest Intelligence does not calculate commissions.
Contest Intelligence does not own production facts.
Contest Intelligence does not own conservation indexes.
Contest Intelligence does not own Career Month.

### Signals consumed

Policy paid.
Policy issued.
Policy cancelled.
Policy reinstated.
Premium paid.
Career stage.
Contest period.
Index snapshots.

### Signals produced

Contest qualified.
Contest not qualified.
Contest at risk.
Contest gap.
Contest action.


2.3 Compensation Intelligence

### Purpose

Compensation Intelligence explains advisor-level economic outcomes.

### It distinguishes

Initial commission.
Renewal commission.
Initial bonus.
Renewal bonus.
Life bonus.
GMM bonus.
Accrual.
Payment.
Adjustment.
Reversal.
Retroactive correction.

### Ownership

Compensation interpretation.
Commission explanation.
Bonus accrual explanation.
Bonus payment explanation.
CompensationEvent.
Commission schedule application.
Payment status interpretation.
Adjustment and reversal explanation.

### Inputs

Production Events.
Payment events.
Policy events.
Product identity.
Line of business.
Policy age.
Policy year.
Payment mode.
Premium type.
Prima Pago.
Prima Inicial.
Prima Renovacion.
Commission schedule.
Compensation RuleSnapshot.
Contest qualification when bonus depends on contest.
Conservation snapshot when bonus depends on conservation.
PeriodSnapshot.
EvidenceRecord.
ProvenanceRecord.

### Outputs

Commission calculated.
Commission accrued.
Commission paid.
Commission reversed.
Commission adjusted.
Bonus calculated.
Bonus accrued.
Bonus paid.
Bonus recalculated.
Compensation explanation.
Economic impact.
Payment status.

### Dependencies

Production Events.
Product Knowledge.
RuleSnapshot.
PeriodSnapshot.
Conservation Intelligence.
Contest Intelligence.
Compensation Operations.
Evidence and Provenance.

### Limits

Compensation Intelligence does not define contest qualification.
Compensation Intelligence does not own Career Month.
Compensation Intelligence does not own policy facts.
Compensation Intelligence does not own manager unit health.
Compensation Intelligence does not forecast guaranteed income.

### Signals consumed

Policy paid.
Premium posted.
Commission posted.
Payment posted.
Commission reversed.
Policy cancelled.
Policy reinstated.
Contest qualification.
Rule snapshot.

### Signals produced

CompensationEvent.
Commission explanation.
Bonus explanation.
Payment explanation.
Reversal impact.
Economic clarity when evidence and rules support it.


2.4 Conservation Intelligence

### Purpose

Conservation Intelligence resolves conservation, retention, persistence and quality signals for policies and portfolios.

### It distinguishes

### LIMRA.
IGC.
Persistencia.
Conservacion.
Prima Conservada.
Prima por Conservar.
Siniestralidad.
Policy Age Month.
Index Reporting Month.

### Ownership

Conservation snapshots.
LIMRA interpretation.
IGC interpretation.
Persistency interpretation.
Conservation risk.
Policy conservation quality.
Index lag explanation.

### Inputs

Policy issued.
Policy paid.
Policy cancelled.
Policy reinstated.
Policy status.
Policy age.
Premiums.
Policy owner and servicing data.
Index source.
Index reporting period.
Conservation RuleSnapshot.
EvidenceRecord.
SourceSystem.
PeriodSnapshot.

### Outputs

LIMRA snapshot.
IGC snapshot.
Persistency snapshot.
Conservation snapshot.
Conservation risk.
Bonus conservation risk.
Index reporting explanation.

### Dependencies

Production Events.
Policy lifecycle.
Evidence and Provenance.
Period clocks.
Rule Pack.
Compensation Intelligence.
Manager Compensation Intelligence.

### Limits

Conservation Intelligence does not own compensation payments.
Conservation Intelligence does not own production events.
Conservation Intelligence does not assume LIMRA and IGC are identical.
Conservation Intelligence does not invent index values when source evidence is missing.

### Signals consumed

Policy active.
Policy paid.
Policy lapsed.
Policy cancelled.
Policy reinstated.
Premium conserved.
Index source update.
Reporting period update.

### Signals produced

LIMRA updated.
IGC updated.
Persistency updated.
Conservation updated.
Conservation risk.


2.5 Manager Compensation Intelligence

### Purpose

Manager Compensation Intelligence interprets manager or Partner compensation rules.

### It explains

Productividad.
Produccion.
Actividad.
Conexion.
Desarrollo.
Transicion.
Alta Partner.
Apoyos.
Multipliers by qualified advisor count.
Manager productivity bonus.

### Ownership

Manager compensation eligibility.
Manager bonus component interpretation.
Manager compensation snapshot.
Manager compensation event.
Manager compensation rule application.

### Inputs

Partner active status.
Manager assignment.
Advisor assignment.
Advisor qualification.
Advisor class.
Advisor productivity.
Initial commissions.
Qualified advisor count.
Non-qualified advisor activity.
TA winners.
### LIMRA.
IGC.
Policy count.
New advisor alta.
Connection attribution.
Development attribution.
Origin Partner attribution.
Partner tenure.
Assigned portfolio.
PCV RuleSnapshot.
Manager Compensation Quarter.
EvidenceRecord.

### Outputs

Manager bonus eligibility.
Manager productivity bonus.
Multiplier result.
Connection bonus interpretation.
Development bonus interpretation.
Alta Partner interpretation.
Apoyo interpretation.
Manager compensation risk.
Manager compensation explanation.

### Dependencies

Recruitment Intelligence.
Partner Intelligence.
Advisor Development Intelligence.
Productivity Intelligence.
Compensation Intelligence.
Conservation Intelligence.
Career Intelligence.
CommercialAssignment.
CommercialAttribution.
Rule Pack.

### Limits

Manager Compensation Intelligence does not own recruitment funnel.
Manager Compensation Intelligence does not own advisor productivity metric.
Manager Compensation Intelligence does not own conservation index truth.
Manager Compensation Intelligence does not own attribution facts.
Manager Compensation Intelligence does not own Partner health.

### Signals consumed

Advisor qualified.
Advisor productive.
Initial commission posted.
TA winner.
LIMRA snapshot.
IGC snapshot.
Connection attribution.
Development attribution.
Alta Partner event.
Quarter close.

### Signals produced

Manager compensation calculated.
Manager compensation accrued.
Manager compensation paid.
Manager compensation adjusted.
Manager compensation risk.


2.6 Shared Commercial Domain

### Purpose

Shared Commercial Domain provides universal commercial primitives so intelligence domains can share language without duplicating logic.

### Ownership

Commercial identity primitives.
Commercial relationship primitives.
Assignment history.
Attribution history.
Servicing responsibility.
Policy role relationships.
Evidence and provenance primitives.
RuleSnapshot references.
PeriodSnapshot references.
Universal event taxonomy.

### Core entities

CommercialPerson.
CommercialAccount.
CommercialRole.
CommercialAssignment.
CommercialAttribution.
CommercialServicing.
CommercialRelationship.
Policy.
Product.
PolicyRole.
SourceSystem.
EvidenceRecord.
ProvenanceRecord.
RuleSnapshot.
PeriodSnapshot.
MetricSnapshot.

### Inputs

People.
Accounts.
Policies.
Roles.
Assignments.
Relationships.
Attributions.
Evidence.
Source systems.
Events.
Periods.
Rules.

### Outputs

Canonical identity.
Canonical relationship context.
Canonical assignment timeline.
Canonical attribution timeline.
Canonical evidence chain.
Canonical event facts.
Shared context for all Intelligence domains.

### Dependencies

None at business-domain level.
It is the foundation layer.

### Limits

Shared Commercial Domain does not calculate compensation.
Shared Commercial Domain does not decide contest results.
Shared Commercial Domain does not forecast.
Shared Commercial Domain does not own advisor experience.
Shared Commercial Domain does not own specific carrier logic.

### Signals consumed

Universal facts and references.

### Signals produced

Stable context for interpretation.


2.7 Hidden Domain: Economic Motivation

### Purpose

Economic Motivation translates relevant gaps into economic meaning when there is enough evidence, rules and confidence.

It does not show only metrics.
It explains potential money, expected money or money at risk.

### Example

### Not only
"Te faltan 2.5 polizas y 25,000 Prima Meta."

### But
"Eso podria equivaler a ingreso potencial adicional si reglas, evidencia y confianza lo soportan."

### Ownership

Economic translation of gaps.
Economic explanation of potential value.
Economic framing of action.

### Inputs

Contest gaps.
Compensation rules.
Production events.
Career stage.
RuleSnapshot.
PeriodSnapshot.
Forecast confidence.
EvidenceRecord.
Compensation schedules.
Business plan goals.

### Outputs

Income potential.
Expected income range.
Income at risk.
Economic action framing.
Guardrailed motivation message.

### Dependencies

Compensation Intelligence.
Contest Intelligence.
Revenue Intelligence.
Forecast Intelligence.
Business Planning.
Evidence and Provenance.
RuleSnapshot.

### Limits

Economic Motivation does not own compensation calculations.
Economic Motivation does not invent financial values.
Economic Motivation does not present forecasts as facts.
Economic Motivation does not generate economic outputs without rules, evidence and confidence.

### Signals consumed

Gap.
Rule.
Commission schedule.
Bonus eligibility.
Forecast confidence.
Production event.

### Signals produced

Economic clarity.
Potential income explanation.
Money at risk explanation.
Motivational decision context.


2.8 Hidden Domain: Compensation Operations

### Purpose

Compensation Operations handles operational lifecycle concerns around compensation data, closes, reports, corrections and payment operations.

### Ownership

Compensation close state.
Payment posting workflow.
Correction workflow.
Retroactive adjustment operations.
Operational reconciliation.
Evidence intake for compensation operations.

### Inputs

Carrier reports.
Commission statements.
Payment posts.
Manual corrections.
Adjustment notices.
Reversal notices.
Close periods.
SourceSystem.
EvidenceRecord.
ProvenanceRecord.

### Outputs

Payment posted.
Commission adjusted.
Commission reversed.
Compensation correction record.
Operational close state.
Reconciliation issue.

### Dependencies

Compensation Intelligence.
Evidence and Provenance.
Period clocks.
RuleSnapshot.
Source systems.

### Limits

Compensation Operations does not decide business rules.
Compensation Operations does not own advisor motivation.
Compensation Operations does not own contest qualification.
Compensation Operations does not own manager compensation interpretation.

### Signals consumed

Report received.
Payment posted.
Adjustment received.
Correction received.
Period closed.

### Signals produced

Operational payment evidence.
Correction event.
Reconciliation state.


2.9 Advisor Experience

### Purpose

Advisor Experience owns adoption, learning, discovery and progression of the advisor inside Forge.

It exists because strong business intelligence fails if the advisor does not understand, trust or use it.

### Core subdomains

Advisor Setup.
Benvenu Experience.
Advisor Baseline Snapshot.
Progressive Discovery.
Clippy Engine.
Feature Learning State.
Contextual Help Signals.
Revenue Intelligence Introduction.
Command Palette Introduction.
Candy Crush Experience.

### Ownership

First experience.
Adoption flow.
Progressive feature discovery.
Contextual help.
Learning state.
Advisor baseline context.
Adaptive complexity.

### Inputs

Advisor identity.
Career stage.
Manager assignment.
Baseline commercial data.
Revenue opportunities.
Command OS context.
Feature usage.
Friction signals.
Help signals.
Behavior signals from Mick.

### Outputs

Advisor Baseline Snapshot.
First recommended action.
Feature introduction.
Help prompt.
Learning state transition.
Suppressed help.
Adaptive difficulty signal.
Revenue Intelligence introduction.
Command Palette introduction.

### Dependencies

Shared Commercial Domain.
Career Intelligence.
Revenue Intelligence.
Mick.
Command OS.
Compensation Intelligence.
Economic Motivation.

### Limits

Advisor Experience does not own business rules.
Advisor Experience does not calculate compensation.
Advisor Experience does not own productivity metrics.
Advisor Experience does not own Mick behavior scoring.
Advisor Experience does not become a chatbot.
Advisor Experience does not become corporate tutorial.


## 3. Advisor Development and Transformation Layer

3.1 Core Problem

Partner Intelligence established that the correct economic unit is not:

Signed Advisor.

### The correct economic unit is

Productive Advisor Capacity.

### The missing bridge is

Candidate
Connected
Signed
Advisor Development
Productive Advisor Capacity

Advisor Development Intelligence owns this transformation.


3.2 Advisor Development Intelligence

### Purpose

Advisor Development Intelligence explains whether a signed advisor is becoming productive commercial capacity.

### It answers

Is the advisor activating?
Is the advisor learning?
Is the advisor executing?
Is the advisor coachable?
Is the advisor moving toward first production?
Is the advisor repeating productive behavior?
Is the advisor at risk before productivity appears?

### Ownership

Development progress.
Development readiness.
Learning progress.
Coachability as transformation.
First production readiness.
Productivity readiness.
Development risk.
Development bottleneck.
Signed-to-productive transformation interpretation.

### Inputs

Connected candidate context.
Signed advisor.
Recruitment context.
Career stage.
Rule Pack.
Mick signals.
Activity signals.
Training completion.
Coaching events.
Relationship activation.
Business plan context.
Partner context.

### Outputs

Development Progress.
Development Readiness.
First Production Readiness.
Advisor Activation Readiness.
Coachability Signal.
Learning Progress.
Productivity Readiness.
Retention Probability.
Leadership Potential.
Development Risk.
Development Bottleneck.

### Limits

Advisor Development does not own Recruitment.
Advisor Development does not own behavior tracking.
Advisor Development does not own Productivity metrics.
Advisor Development does not own Production Events.
Advisor Development does not own Compensation.
Advisor Development does not own Conservation.
Advisor Development does not own Business Planning.


3.3 Development Stages

### Conceptual stages

Signed.
Orientation.
Activation.
Learning.
Field Execution.
First Appointment.
First Production.
Repeat Activity.
Consistency.
Productive Advisor.

### Important rule

These are conceptual stages.
Specific names, windows, requirements and thresholds belong to Rule Packs.


3.4 Coachability

Coachability is the demonstrated ability to receive feedback, apply it, change behavior and improve outcomes.

### Coachability is not

Being agreeable.
Attending coaching.
Being motivated.
Being likeable.

### Coachability is

Behavior change after feedback.
Improvement after correction.
Reduced repeated mistakes.
Faster adoption of useful practices.
Better execution after coaching.

### Ownership

Mick owns behavior evidence.
Advisor Development owns transformation interpretation.


3.5 Learning

Learning is not screen exposure.
Learning is not training completion alone.
Learning is not reading.

### Learning means

The advisor can understand, reason and apply knowledge in commercial work.

Advisor Experience supports this through Learning By Doing.
Advisor Development interprets whether learning becomes capability.
Mick measures the behavior evidence.


3.6 Activation

Activation means the signed advisor begins performing behaviors that create commercial movement.

### Examples

Activating Market Natural.
Contacting relationships.
Requesting appointments.
Asking for referrals.
Using CI.
Following up.
Executing first actions.

Activation is not enough by itself.

Activation must move toward appointments, production, consistency and retention.


3.7 Execution

Execution means the advisor performs real commercial actions in the field.

### Mick owns

Behavior occurrence.
Cadence.
Consistency.
Task completion.

### Advisor Development owns

Whether execution advances the transformation toward productive capacity.


3.8 First Production

### First Production is

A fact event when production occurs.
A development milestone.
Evidence of transformation.
A signal of capability.

### First Production is not

Proof of durable productivity.
Proof of consistency.
Proof of retention.
Proof of future compensation.
Proof of leadership.

### Ownership

Production Events own the fact.
Advisor Development owns milestone interpretation.
Productivity Intelligence later owns repeatable output interpretation.


3.9 Consistency

Consistency means the advisor repeats behaviors and early outcomes over time.

It is a bridge signal between development and productivity.

Mick owns behavior consistency.
Advisor Development interprets whether consistency supports capacity formation.
Productivity Intelligence interprets whether consistency produces output.


3.10 Retention

Retention matters because Productive Advisor Capacity must persist.

Development may consume retention risk signals.
Conservation or retention-related domains own formal retention metrics depending on final domain map.
Partner Intelligence consumes retention to evaluate unit health.


3.11 Development Risk

### Development risks

Activation Failure.
Learning Failure.
Coachability Risk.
Inactivity Risk.
Consistency Risk.
Early Attrition Risk.
First Production Delay.
Training Dependence.
Partner Overload.
Development Bottleneck.

### Common failure patterns

Signed, never activates.
Activates, never schedules.
Schedules, never produces.
Produces once, never repeats.
Learns, does not execute.
Executes, does not conserve.


3.12 Separation from Mick

Mick is Behavior Intelligence.

### Mick owns

Activity behavior.
Consistency.
Follow-up discipline.
Coaching responsiveness as behavior.
Prospecting rhythm.
Relationship activation behavior.
Task completion.
Execution pattern.
Behavior risk.

### Advisor Development owns

Development progress.
Development readiness.
Learning progress.
Coachability as transformation.
First production readiness.
Productivity readiness.
Development risk.
Development bottleneck.
Signed-to-productive transformation.

### Boundary example

Advisor made 20 calls.

### Mick says
The advisor executed activity.

### Advisor Development says
The activity did or did not advance the advisor from activation to field execution or appointment creation.


3.13 Separation from Productivity

Productivity Intelligence owns output and production metrics.

Advisor Development owns readiness and transformation before productivity is stable.

### Shared signals

Activity.
Appointments.
First production.
Repeat production.
Consistency.
Pipeline.
Follow-up.
Market activation.

### Development interprets

Is the advisor learning?
Is the advisor moving to the next stage?
Is first production likely?
Is the advisor coachable?
What blocks transformation?

### Productivity interprets

Is the advisor producing effectively?
Is output efficient?
Is production repeatable?
Is activity converting?
Is the advisor productive under active rules?


3.14 First Results vs Durable Productivity

First results are early evidence.
Durable productivity is repeated output under a valid period and rule context.

### First result may be

One warm lead.
One Partner-assisted case.
One inherited opportunity.
One accidental conversion.

### Durable productivity requires

Repeatable activity.
Repeatable conversion.
Production quality.
Consistency.
Retention or persistence signals where applicable.
Rule-backed productivity definition.


## 4. Compensation and Bonus Flow

4.1 Central Principle

Production Events are facts.
Compensation is a ruled interpretation.

### Therefore

Policy paid is a fact.
Commission calculated is an interpretation.
Bonus qualified is an interpretation.
Bonus paid is a payment event.
Commission adjusted is a correction or operational event.


4.2 Life, GMM, Initial and Renewal

### Forge must distinguish

Life system.
GMM system.
Initial commission.
Renewal commission.
Initial bonus.
Renewal bonus.
GMM bonus.
Prima Meta.
Prima Pago.
Prima Renovacion.

Life and GMM must not be collapsed into one compensation system.

Initial commission is not renewal commission.
Renewal bonus may depend on prior initial bonus calculation.
Prima Meta is not Prima Pago.
Prima Pago is not Commission.
Prima Renovacion is not Initial Premium.


4.3 Prima Meta

Prima Meta is a ruled target or qualifying metric.

### Ownership

Contest Intelligence owns contest interpretation of Prima Meta.
Rule Pack defines how Prima Meta is calculated or applied.

### Consumers

Compensation Intelligence.
Economic Motivation.
Business Planning.
Forecast Intelligence.
Advisor Experience.

### Non-owners

UI.
Clippy.
Economic Motivation.
Compensation if the context is contest qualification.


4.4 Commissions

### Commission types

Initial commission.
Renewal commission.
Commission accrual.
Commission paid.
Commission reversed.
Commission adjusted.

### Ownership

Compensation Intelligence owns explanation.
Compensation Operations owns operational payment posting and reconciliation.
Production Events own raw facts.
Rule Pack owns schedules and rules.


4.5 Bonus Types

### Known bonus concepts

Bono Vida.
Bono Renovacion.
Bono GMM.
Bono Inicial.
Training Allowance.
Manager Productivity Bonus.
Conexion.
Desarrollo.
Alta Partner.
Apoyos.

### Ownership

Contest Intelligence owns advisor contest bonus qualification.
Compensation Intelligence owns advisor payment explanation.
Manager Compensation Intelligence owns manager/Partner bonus interpretation.
Rule Pack owns eligibility and formulas.


4.6 Limits and Semaphores

Semaphores should be interpretation outputs.

### Examples

### Green
Likely on track, supported by evidence.

### Yellow
At risk, gap or uncertainty exists.

### Red
Not qualified, major blocker or insufficient evidence.

### Guardrail

Semaphores must be explainable.
They must cite the fact, metric, rule, period and confidence behind them.

No semaphore should be generated from undocumented assumptions.


4.7 Retroactives and Recalculations

Retroactive rule corrections, adjustments and recalculations must preserve history.

Forge must not overwrite past results silently.

### Required distinction

Original event.
Original rule snapshot.
Original interpretation.
Correction event.
Correction rule snapshot.
Recalculated interpretation.
Effective time.
Reporting time.
Correction time.

### Retroactive examples

Commission corrected.
Policy reinstated.
Premium adjusted.
Bonus recalculated.
Rule corrected after close.
Index updated after lag.


4.8 Manager Productivity Bonus

Manager Productivity Bonus is not raw team production.

### It is a ruled interpretation that may depend on

Qualified advisor count.
Advisor productivity.
Initial commissions.
TA winners.
Activity of non-qualified advisors.
### LIMRA.
IGC.
Policy count.
Partner tenure.
Assignment history.
Rule Pack.
Manager Compensation Quarter.

### Multipliers by qualified advisors

These belong to the Rule Pack.

### Manager Compensation Intelligence may interpret

Which multiplier applies.
Why it applies.
Which advisors counted.
Which advisors did not count.
Which period governed.
Which rule snapshot was used.

Forge Core must not hardcode multiplier thresholds.


4.9 LIMRA and IGC

### Known conceptual rule

LIMRA appears to operate on younger business, around months 1 to 13.
IGC appears to operate on more mature business, from 13+.

### Important

Do not treat LIMRA and IGC as identical.
Do not invent formulas.
Do not assume the exact window without Rule Pack evidence.

### Index reporting lag

Index Reporting Month may lag actual policy activity by approximately 3 months.

### Implications

A policy may be eligible before appearing in the official report.
Manager compensation may depend on indexes reported after the activity period.
Advisor risk may exist before official index update.
Forecasts must label uncertainty.


4.10 Forecast and Annual Business Plan

Forecast is not fact.

Business Plan is not execution.

### Annual Business Planning should follow

Goal
Forecast
Gap
Actions

### Inputs

Historical production.
Current pipeline.
Recruitment pipeline.
Development capacity.
Productivity assumptions.
Compensation rules.
Conservation risk.
Rule Pack.
Evidence and confidence.

### Outputs

Plan feasibility.
Capacity gap.
Recruitment gap.
Development gap.
Productivity gap.
Economic gap.
Action plan.

### Guardrails

No guaranteed income from forecasts.
No business plan based only on wishful targets.
No compensation forecast without rules and confidence.


### 5. Advisor Experience, Behavior and Learning Rules

5.1 Value Before Work

Forge should generate value before asking for manual work.

If Forge requests data, it must explain:

What decision it enables.
What action it improves.
What risk it reduces.
What money it may clarify.


5.2 Learning By Doing

Learning is measured by behavior and completion of meaningful work.

### Learning is not

Reading a screen.
Watching a tutorial.
Opening a modal.
Viewing a PDF.

### Learning means

The advisor can perform the action without unnecessary help.


5.3 Economic Clarity

### Relevant metrics should translate into

Money earned.
Money potential.
Money at risk.

### Only when

Evidence exists.
Rules exist.
Confidence is sufficient.
Forecast uncertainty is explicit.


5.4 Production Events Principle

Production Events are facts.

Interpretive domains consume facts.

### This prevents

Contest logic inside production.
Compensation logic inside policy facts.
Manager compensation logic inside raw activity.
UI logic pretending to own metrics.


5.5 Benvenu Experience

Benvenu is the first Forge experience.

### It is not

Onboarding form.
Tutorial.
PDF.
Corporate guide.
CRM setup wizard.

### It should produce

Advisor Baseline Snapshot.
Initial goal.
Product focus.
Manager context.
First recommended action.
Revenue Intelligence introduction.
Command Palette introduction.

### Purpose

The advisor should understand that Forge is different from a CRM.


5.6 Clippy Engine

Clippy is contextual help.

### It is

Quiet.
Non-invasive.
Contextual.
Progressive.
Useful only when it adds value.

### It is not

Chatbot.
Tutorial overlay.
Repeated corporate explanation.
Blocking workflow.

### Valid contextual help examples

Explain renewal impact when advisor views renewal.
Explain Bono Vida when compensation context is open.
Explain why a gap matters economically.
Explain why a forecast is uncertain.
Introduce Command Palette when a command would save work.
Explain why a candidate is stuck.
Explain first production vs productivity.


5.7 Candy Crush Experience

Candy Crush Experience means adaptive difficulty.

### When advisor is frustrated

Reduce complexity.
Narrow next action.
Provide more guidance.

### When advisor progresses

Increase challenge.
Reveal deeper features.
Reduce help.

### Guardrail

Never so difficult that it creates abandonment.
Never so easy that it creates complacency.


5.8 Feature Learning States

### Approved states

unseen.
introduced.
tried.
completed_with_help.
completed_without_help.
learned.
suppressed.
needs_refresh.

### State meanings

### unseen
Advisor has not been introduced to feature.

### introduced
Feature has been presented in a relevant context.

### tried
Advisor attempted feature.

completed_with_help:
Advisor completed work but needed contextual help.

completed_without_help:
Advisor completed work independently.

### learned
Advisor has demonstrated repeatable ability.

### suppressed
Help is intentionally hidden because it is irrelevant or harmful now.

needs_refresh:
Advisor may need help again due to time, changed rules or changed workflow.


5.9 First Actions Suggested

### Examples

Set monthly income goal.
Review Advisor Baseline Snapshot.
Activate one relationship.
Review first revenue opportunity.
Use Command Palette for first action.
Ask Magic Question after interview.
Review compensation gap with economic explanation.
Complete first follow-up.
Identify first production blocker.

### Guardrail

First actions must produce value, not administrative burden.


## 6. Periods and Operational Clocks

Forge has multiple simultaneous clocks.

There is no single system clock.

### A fact may

Occur in one date.
Become effective in another date.
Be reported later.
Be evaluated in another period.
Be paid later.
Be corrected later.


6.1 Core Time Types

### Event Time
When the underlying event happened.

### Effective Time
When the event or rule becomes effective for business interpretation.

### Reporting Time
When the source reports it.

### Evaluation Time
When a rule evaluates it.

### Payment Time
When money is paid.

### Correction Time
When a correction is made.


6.2 Career Month

### Purpose

Measures advisor career tenure.

### Known rule

Career Month starts at contract signing or official career start, depending on Rule Pack.

### Use

Career stage.
Asesor en Desarrollo.
Nuevo Profesional.
Career eligibility.

### Risk

Mixing Career Month with Contest Month can break qualification.


6.3 Contest Month

### Purpose

Measures contest-specific progress.

### Use

Contest qualification.
Contest group.
Contest period.

### Risk

Contest Month may not equal Career Month.


6.4 Semester Month

### Purpose

Measures semester-based qualification or bonus evaluation.

### Use

Training Allowance.
Bono Renovacion.
Semester evaluation.

### Risk

Mixing Semester Month with Career Month creates incorrect bonus eligibility.


6.5 NP Contest Month

### Purpose

Measures Nuevo Profesional contest participation.

### Known rule

NP entering mid-semester may start as NP Contest Month 1.

### Risk

Assuming NP Contest Month equals calendar month or Career Month.


6.6 Policy Age Month

### Purpose

Measures age of a policy from issue/effective date.

### Use

Renewal.
Commission type.
Conservation.
Policy persistence.

### Risk

Using policy age as reporting month.


6.7 Index Reporting Month

### Purpose

Measures when LIMRA or IGC index is reported.

### Known issue

Approximate reporting lag of 3 months.

### Risk

Treating reported index as same-month policy reality.


6.8 Quarter Month

### Purpose

Quarterly evaluation context.

### Use

Business planning.
Manager review.
Forecast.


6.9 Manager Compensation Quarter

### Purpose

Quarter used for manager compensation interpretation.

### Use

Productividad.
Conexion.
Desarrollo.
Alta Partner.
Apoyos.

### Risk

Mixing manager compensation quarter with calendar quarter or policy reporting month.


6.10 Precontract Window

### Purpose

Measures precontract lifecycle window.

### Rule

Must be configurable by Rule Pack or organization context.

### Risk

Hardcoding 90 days or any fixed period in Core.


6.11 Partner Tenure Semester

### Purpose

Measures Partner tenure in semester units.

### Use

Partner rules.
Manager compensation.
Alta Partner.
Development expectations.


6.12 Conservation Curve Month

### Purpose

Measures conservation maturity along policy lifecycle.

### Use

Conservation risk.
Retention analysis.
LIMRA/IGC interpretation.


6.13 Persistence Month

### Purpose

Measures persistence windows such as month 13 or month 25.

### Use

Persistency.
Conservation.
Quality of business.


6.14 Close, Payment, Correction, Grace, Reinstatement and Reporting

### Close Period
When a period is finalized for evaluation.

### Payment Period
When payout occurs.

### Correction Period
When correction is recorded.

### Grace Period
Policy may remain recoverable or pending before final lapse depending on rules.

### Reinstatement Period
Policy can return to active status and affect conservation, commission or compensation.

### Reporting Period
Source reports data, possibly after actual activity.

### Guardrail

Closed period does not mean history disappears.
Correction should create correction records, not overwrite facts silently.


### 7. Entities, Events and Ownership

7.1 CommercialPerson

### Purpose

Durable person identity.

### Can represent

Prospect.
Client.
Advisor.
Manager.
Partner.
Director.
Referral source.
Candidate.

### Rules

A person can have multiple roles.
A client can become advisor.
An advisor can be client.
A Partner may still produce.
Roles are separate from person identity.

### Must not store

Compensation calculation.
Contest result.
Current-only assignment without history.
Source-specific assumptions.


7.2 CommercialAccount

### Purpose

Represents account-level context above individual person when needed.

### Examples

Household.
Family.
Business account.
Corporate account.

### Use

Multiple insureds.
Business policies.
Family relationship clusters.
Shared servicing.


7.3 PolicyRole

### Purpose

Represents a person's role relative to a policy.

### Possible roles

Policy Owner.
Insured.
Payor.
Beneficiary.
Advisor of Record.
Servicing Advisor.
Originating Advisor.
Compensation Recipient.
Manager Attribution.

### Guardrail

Policy ownership, servicing, origination and compensation recipient can diverge.


7.4 ServicingResponsibility

### Purpose

Represents who is responsible for servicing a relationship, client or policy during a period.

Must be historical.

### Use cases

Policy transferred.
Client inherited.
Office changed.
Advisor changed.
Manager changed.


7.5 Attribution

### Purpose

Explains who receives credit or responsibility for an outcome.

### Attribution types

Origin Attribution.
Connection Attribution.
Development Attribution.
Compensation Attribution.
Manager Attribution.
Servicing Attribution.
Recruitment Attribution.
Relationship Attribution.

### Guardrail

Attribution is not assignment.
Attribution is not servicing.
Attribution is not ownership.


7.6 SourceSystem

### Purpose

Represents where data came from.

### Examples

User Input.
Manager Input.
OCR.
Carrier Report.
Product Library.
Rule Engine.
AI Extraction.
Imported Spreadsheet.
External API.
Manual Override.


7.7 EvidenceRecord

### Purpose

Represents evidence supporting a fact, metric, rule, interpretation or correction.

### Examples

PDF original.
Quote.
Carrier report.
Commission statement.
Image.
Email.
Validated manual capture.
Official document.


7.8 ProvenanceRecord

### Purpose

Explains how a datum reached Forge.

### Example chain

PDF.
OCR.
Parser.
Rule Pack.
Interpretation.
Forge output.

### Use

Audit.
Confidence.
Corrections.
Historical explanation.


7.9 Production Events

### Nature

Fact events.

### Examples

### Policy_issued.
### Policy_paid.
### Policy_cancelled.
### Policy_reinstated.
### Payment_posted.
COMMISSION_POSTED where source reports it as fact.

### Ownership

Production Events foundation.

### Consumers

Contest.
Compensation.
Conservation.
Productivity.
Manager Compensation.
Revenue.


7.10 Compensation Events

### Nature

Interpretation, payment or correction events depending on event type.

### Examples

### Commission_calculated.
### Commission_accrued.
### Commission_paid.
### Commission_reversed.
### Commission_adjusted.
### Bonus_calculated.
### Bonus_accrued.
### Bonus_paid.
### Bonus_recalculated.

### Ownership

Compensation Intelligence and Compensation Operations.


7.11 Conservation Events

### Nature

Mostly snapshot or interpretation events.

### Examples

### Limra_updated.
### Igc_updated.
### Persistency_updated.
### Conservation_updated.
### Loss_ratio_updated.

### Ownership

Conservation Intelligence.


7.12 Contest Events

### Nature

Interpretation or decision events.

### Examples

### Group_assigned.
### Ta_qualified.
### Ta_earned.
### Bonus_initial_qualified.
### Bonus_renewal_qualified.
### Bonus_gmm_qualified.

### Ownership

Contest Intelligence.


7.13 Career Events

### Nature

Fact or interpretation depending on event.

### Examples

### Connection_established.
### Contest_date_assigned.
### Stage_changed.
### Class_changed.
### Partner_promoted.

### Ownership

Career Intelligence.


7.14 Relationship and Attribution Events

### Examples

### Attribution_assigned.
### Attribution_changed.
### Client_assigned.
### Client_transferred.
### Policy_transferred.
### Servicing_assigned.
### Servicing_changed.
### Referral_created.

### Ownership

Shared Commercial Domain for primitive event.
Domain-specific interpretation belongs to consuming domain.


7.15 Advisor Experience Events

### Examples

### Feature_introduced.
### Feature_tried.
### Feature_learned.
### Help_dismissed.
### Help_accepted.
### Baseline_created.
### Benvenu_completed.

### Ownership

Advisor Experience.

### Guardrail

Feature states are not business outcomes.


7.16 Corrections

### Correction types

Event correction.
Reversal.
Recalculation.
Override.
Invalidation.

### Rule

Events should not be mutated silently.
Corrections must create traceable correction records.


## 8. Risks and Anti-patterns

8.1 Development Anti-Patterns

Mixing training with development.
Mixing activity with execution.
Mixing first production with productivity.
Mixing motivation with coachability.
Mixing signed advisor with productive advisor capacity.
Mixing Partner-assisted output with advisor capability.


8.2 Productivity Anti-Patterns

Counting raw production without consistency.
Treating one-time production as durable productivity.
Ignoring source and development context.
Ignoring concentration risk.
Using productivity before Productivity Intelligence is defined.


8.3 Compensation Anti-Patterns

Mixing Prima Meta, Prima Pago, Commission and Renewal.
Mixing Life and GMM compensation systems.
Using 2025 schedules with 2026 contest rules.
Treating bonus qualification as payment.
Treating commission posted as contest result.
Treating current rules as historical truth.
Recalculating historical compensation without preserving original RuleSnapshot.


8.4 Conservation Anti-Patterns

Treating LIMRA and IGC as equal.
Ignoring index reporting lag.
Using Index Reporting Month as Event Time.
Inventing conservation formulas.
Ignoring reinstatement.
Ignoring grace period.


8.5 Ownership Confusions

### Prima Pago
Production or compensation input depending on context; not UI-owned.

### Prima Renovacion
Compensation and contest input, governed by Rule Pack.

### RDA
Recruitment source or relationship referral context; not generic count.

### Policy Count
Production-derived metric; Contest Policy Count is ruled interpretation.

### Ingresos
Compensation owns confirmed income; Revenue or Forecast may estimate; Economic Motivation explains only with guardrails.


8.6 Relationship and Assignment Risks

Shared clients.
Client inherited by office change.
Manager change mid-quarter.
Partner change mid-semester.
Split attribution.
Policy transferred.
Servicing changed.
Attribution corrected retroactively.

### Guardrail

Assignment, Attribution, Servicing and Ownership must remain separate and historical.


8.7 Rule and Period Risks

Rule corrected retroactively.
Rule active in one office but not another.
Two versions active simultaneously.
Period closed before correction.
Payment after evaluation.
Reporting lag.
Policy reinstatement after lapse.

### Guardrail

RuleSnapshot and PeriodSnapshot must preserve interpretation context.


8.8 Premature Intelligence Risks

Using data before Rule Packs are formalized.
Forecasting without locked productivity metrics.
Business Planning before productivity assumptions are reliable.
Economic Motivation without compensation rules.
Advisor Experience showing unofficial metrics.
Clippy explaining unverified values.
UI recalculating metrics.


## 9. Architectural Conclusions

9.1 Domains Are Separate

### Career Intelligence
Lifecycle and career status.

### Contest Intelligence
Contest qualification and gaps.

### Compensation Intelligence
Advisor payment and commission explanation.

### Conservation Intelligence
Quality, persistency and index interpretation.

### Manager Compensation Intelligence
Manager/Partner ruled compensation.

### Shared Commercial Domain
Universal primitives, facts, assignments, attribution, evidence.

### Advisor Experience
Adoption, learning, contextual help and progressive discovery.

### Economic Motivation
Economic explanation of gaps under evidence and rules.

### Compensation Operations
Operational payment, close, correction and reconciliation lifecycle.

### Advisor Development Intelligence
Transformation from signed advisor to productive advisor capacity.

### Mick
Behavior Intelligence.

### Productivity Intelligence
Output and production performance metrics, not yet fully defined.


9.2 Ownership Must Remain Singular

One metric must have one conceptual owner.

Other domains may consume.
They must not recalculate.

If multiple domains calculate the same metric, Forge will produce inconsistent results.


9.3 Facts vs Interpretations

### Facts

Production Events.
Payment posted from source.
Policy issued.
Policy paid.
Policy cancelled.
Policy reinstated.
Signed advisor.
Assignment effective.

### Interpretations

Contest qualified.
Bonus calculated.
Manager productivity bonus.
Advisor productive.
Development readiness.
Conservation risk.
Partner health.
Economic motivation.

### Forecasts

Probable income.
Probable productive advisor.
Probable connected candidate.
Expected gap.

### Recommendations

Do this next.
Activate this source.
Coach this advisor.
Reduce this risk.


9.4 Rule Packs Are Mandatory

Forge Core must not contain SMNYL-specific compensation, contest, career or promotion rules.

SMNYL Agency 2026 is a Rule Pack.

### It can define

Contest stages.
Bonus thresholds.
Commission schedules.
Training Allowance rules.
Productivity multipliers.
Policy count rules.
Conservation rules.
Manager compensation rules.

It must not redefine Forge Core primitives.


9.5 Advisor Experience Must Not Become Decoration

Advisor Experience is not UI polish.

### It owns

Adoption.
Learning.
Contextual help.
Progressive discovery.
Adaptive complexity.

It must help the advisor make better decisions.

If a feature does not help the advisor decide or act better, it should be challenged.


### 10. Next Paqs, Open Risks and Gaps

10.1 Recommended Next PAQs

Productivity Intelligence.

### Reason
Advisor Development and Partner Intelligence both depend on a clear definition of Productive Advisor Capacity.

Forecast Intelligence.

### Reason
Forecasts require stable domain metrics and ownership.

Business Planning Intelligence.

### Reason
Business Planning requires reliable Goal to Forecast to Gap to Actions logic.

Compensation Intelligence hardening.

### Reason
Compensation has architecture v1.0 but still needs Rule Pack separation, operations lifecycle and manager compensation dependencies to be hardened around actual validated rules.


10.2 Open Risks

Productivity Intelligence is not yet locked.
Business Planning is approved conceptually but not fully domain-modeled.
Forecast Intelligence requires guardrails to avoid presenting predictions as facts.
Exact POP meaning remains unresolved from recruitment documentation.
Exact LIMRA and IGC formulas must not be invented.
Manager compensation multipliers require Rule Pack evidence.
Precontract ownership boundary needs final hardening.
Retention domain ownership may need clarification.
Leadership Intelligence remains future/discovery.


10.3 Gaps Pending

Formal Productivity Intelligence domain model.
Formal Forecast Intelligence domain model.
Formal Business Planning Intelligence domain model.
Formal Compensation Operations model.
Formal Rule Pack artifact structure.
Validated SMNYL Agency 2026 Rule Pack documentation.
Official handling of retroactive corrections.
Official handling of closed periods.
Official handling of grace and reinstatement effects.
Official handling of shared clients and split attribution.
Formal Advisor Development to Productivity handoff.


10.4 Final State

Forge OS currently has a strong conceptual foundation.

### The most important locked principles are

Forge Core is universal.
Rule Packs interpret facts.
Production Events are facts.
One metric has one owner.
Forecasts are suggestions.
Economic outputs require evidence, rules and confidence.
Advisor Experience must produce adoption and decision clarity.
Development is transformation, not training.
Mick measures behavior.
Productivity must measure durable output.

### Current architectural direction

Do not reopen Foundation without strong evidence.
Do not introduce carrier logic into Core.
Do not duplicate metrics.
Do not let UI own business interpretation.
Do not forecast compensation without rules.
Do not treat signed advisors as productive capacity.
Do not confuse first production with durable productivity.

Forge should continue into Intelligence Domains Phase with Productivity Intelligence as the next critical domain to clarify.
