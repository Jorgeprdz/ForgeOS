# PAQ-09 Productivity Intelligence Discovery

## Repository References

- [FORGE_MASTER_BUILD_TREE.md](../../FORGE_MASTER_BUILD_TREE.md)
- [AGENTS.md](../../AGENTS.md)
- [FORGE_CONSTITUTION_V3.md](../../FORGE_CONSTITUTION_V3.md)
- [FORGE_FOUNDATION_LOCK.md](../archive/FORGE_FOUNDATION_LOCK.md)

---


Forge OS
Senior Systems Analysis
Productivity Intelligence Discovery

## Status

ARCHITECTURE CANDIDATE


## Scope

- Documentation only.
- No code.
- No engines.
- No schemas.
- No UI.
- No app.js.
- No implementation.
- No commit approval from PAQ itself.


## 1. Executive Summary

Productivity Intelligence is the Forge domain that explains whether advisor activity is converting into durable commercial output.

It is not Behavior Intelligence.
It is not Compensation Intelligence.
It is not Manager Intelligence.
It is not Production Events.
It is not Advisor Development.

Productivity Intelligence lives between execution and economic interpretation.

### The corrected chain is

Mick
Execution Behavior
Activity Signals
Productivity Intelligence
Output Conversion
Production Events
Compensation / Contest / Conservation / Revenue Interpretations

### Mick answers

Did the advisor execute the behaviors?

### Advisor Development answers

Is the signed advisor transforming into productive capacity?

### Productivity Intelligence answers

Is the advisor's execution producing meaningful commercial output with repeatability?

### Production Events answer

What production fact happened?

### Compensation Intelligence answers

What money was calculated, accrued, paid, adjusted or reversed under rules?

### Manager Intelligence answers

What does this mean for the unit, manager, Partner or team?

### Productivity Intelligence is required because Forge must not confuse

- Activity with productivity.
- Training with development.
- First production with durable productivity.
- Compensation with productivity.
- Revenue forecast with confirmed output.
- Manager bonus with team health.

### The key discovery question

How does Forge measure whether advisor behavior is converting into commercial output without duplicating Mick, Production Events or Compensation?

### Initial verdict

Productivity Intelligence is a legitimate domain candidate.

It should own output conversion interpretation.
It should consume behavior signals from Mick.
It should consume Production Events as facts.
It should consume Development context.
It should produce productivity status, productivity risk, conversion bottlenecks and productivity signals for Career, Revenue, Manager, Business Planning, Advisor Experience and Economic Motivation.

It should not own raw activity, compensation, contest qualification, official production facts or manager compensation.


## 2. Domain Purpose

Productivity Intelligence exists to explain whether commercial activity becomes productive output.

### It answers

- Is this advisor productive?
- Is the advisor becoming productive?
- Is activity converting?
- Is production repeatable?
- Is productivity improving, flat or deteriorating?
- What behavior-to-output bottleneck exists?
- Is productivity concentrated in one product, one source, one relationship cluster or one period?
- Is first production turning into repeatable productivity?
- Is the advisor underperforming despite activity?
- Is the advisor producing despite weak behavior signals?
- What should the advisor do next to improve productivity?
- What should the manager coach?

### Productivity Intelligence is needed by

- Advisor Development.
- Partner Intelligence.
- Manager Intelligence.
- Career Intelligence.
- Revenue Intelligence.
- Forecast Intelligence.
- Business Planning Intelligence.
- Economic Motivation.
- Advisor Experience.

### Core principle

Productivity is not the existence of activity.
Productivity is the conversion of activity into meaningful commercial output.


## 3. Domain Boundaries

### 3.1 What Productivity Intelligence Is

### Productivity Intelligence is

- A domain-level interpretation of advisor output.
- A bridge between behavior and production.
- A measurement of commercial effectiveness.
- A consumer of Mick behavior signals.
- A consumer of Production Events.
- A consumer of Advisor Development context.
- A producer of productivity risk and productivity status.
- A producer of productivity signals for managers and planning.

### 3.2 What Productivity Intelligence Is Not

### Productivity Intelligence is not

- Behavior tracking.
- Task ownership.
- Compensation calculation.
- Contest qualification.
- Revenue forecast.
- Business plan ownership.
- Advisor Experience.
- Career stage ownership.
- Conservation index ownership.
- Manager bonus calculation.
- Raw Production Events.

### 3.3 Boundary with Mick

### Mick owns

- Behavior execution.
- Activity completion.
- Consistency of actions.
- Follow-up discipline.
- Coaching responsiveness.
- Prospecting cadence.
- Execution gaps.

### Productivity Intelligence owns

- Whether behavior produces output.
- Activity-to-output conversion.
- Productivity trend.
- Productivity bottleneck.
- Productive advisor interpretation.
- Output consistency.

### Example

### Mick
Advisor completed follow-ups.

### Productivity
Follow-ups are or are not converting into appointments, proposals, policies, premium or production.

### 3.4 Boundary with Production Events

### Production Events own

- Policy issued.
- Policy paid.
- Payment posted.
- Policy cancelled.
- Policy reinstated.
- Commission posted as source fact when reported.

### Productivity Intelligence owns

- Interpretation of those facts as output performance.
- Repeatability of production.
- Conversion from activity to production.
- Productivity status.

### Example

### Production Event
POLICY_PAID.

### Productivity
This paid policy contributes to advisor output for the relevant productivity period, under the correct period snapshot and rule context.

### 3.5 Boundary with Compensation

### Compensation owns

- Commission calculation.
- Bonus calculation.
- Accrual.
- Payment.
- Adjustment.
- Reversal.
- Compensation explanation.

### Productivity owns

- Whether advisor output is productive.
- Whether output is repeatable.
- Whether activity converts into production.

### Productivity must not

- Calculate income.
- Infer bonuses.
- Treat paid commission as productivity score without rule context.

### 3.6 Boundary with Advisor Development

### Advisor Development owns

- Transformation from signed advisor to productive capacity.
- Development progress.
- First production readiness.
- Coachability as transformation.
- Development risk.

### Productivity owns

- Output once commercial activity can be evaluated as performance.
- Repeatable production.
- Activity-to-output effectiveness.

### Shared signals

- First production.
- First appointment.
- Repeat activity.
- Consistency.
- Early production.

### Key boundary

First production is a development milestone.
Repeatable output is productivity evidence.

### 3.7 Boundary with Manager Intelligence

### Manager Intelligence consumes

- Productivity status.
- Productivity risk.
- Productivity concentration.
- Advisor output trends.
- Team productivity distribution.

### Productivity Intelligence owns

- Advisor-level and cohort-level productivity interpretation.

### Manager Intelligence owns

- Manager action, coaching priority, team risk and unit interpretation.


## 4. Metrics

This section lists candidate productivity metrics.

No numeric thresholds are approved here.
All thresholds must come from Rule Packs, domain configuration or later PAQ decisions.

### 4.1 Daily Action Metrics

### Purpose
Understand whether daily commercial activity is occurring.

### Examples

- Contacts attempted.
- Contacts completed.
- Follow-ups completed.
- New opportunities created.
- Appointments requested.
- Appointments scheduled.
- Appointments completed.
- Referrals requested.
- Referrals received.
- Pipeline updates completed.
- Client reviews completed.

### Ownership

- Mick owns raw behavior execution.
- Productivity consumes these to interpret conversion.

### Productivity interpretation

- Which actions are generating output?
- Which actions are high-volume but low-yield?
- Which activities are missing before production declines?

### 4.2 Calls and Contact Metrics

### Examples

- Calls attempted.
- Calls connected.
- Response rate.
- Contact-to-appointment conversion.
- Follow-up-to-response conversion.
- Reconnection success.

### Ownership

- Mick owns call execution and contact discipline.
- Relationship Intelligence may own relationship context.
- Productivity owns conversion to commercial output.

### 4.3 Appointment Metrics

### Examples

- Appointments requested.
- Appointments booked.
- Appointments completed.
- Appointment show rate.
- Appointment-to-opportunity conversion.
- Appointment-to-application conversion.
- Appointment-to-policy conversion.

### Ownership

- Mick owns completion behavior.
- Revenue Intelligence may own opportunity context.
- Productivity owns output conversion.

### 4.4 Referral Metrics

### Examples

- Referral asks.
- Referrals received.
- Referral source quality.
- Referral-to-appointment conversion.
- Referral-to-policy conversion.
- Referral chain productivity.

### Ownership

- Relationship Intelligence owns referral relationship context.
- Mick owns ask behavior.
- Productivity owns output conversion.
- Recruitment owns candidate referral conversion when referral is for candidate generation.

### 4.5 Pipeline Metrics

### Examples

- Active opportunities.
- Pipeline aging.
- Pipeline movement.
- Opportunity conversion.
- Pipeline-to-production conversion.
- Stalled opportunities.
- Pipeline quality.

### Ownership

- Revenue Intelligence owns revenue pipeline.
- Productivity consumes pipeline movement to evaluate output readiness and conversion.

### 4.6 Training and Learning Metrics

### Examples

- Training completed.
- Learning applied.
- Coaching action completed.
- Development milestone reached.
- Learning-to-action conversion.

### Ownership

- Advisor Development owns transformation interpretation.
- Mick owns execution behavior.
- Productivity consumes only when learning affects output conversion.

### Productivity must not

- Treat training completion as productivity.

### 4.7 Conversion Metrics

### Examples

- Contact-to-appointment.
- Appointment-to-opportunity.
- Opportunity-to-application.
- Application-to-policy.
- Policy-issued-to-policy-paid.
- Activity-to-production.
- First-production-to-repeat-production.

### Ownership

- Productivity Intelligence owns productivity conversion interpretation.
- Production Events own underlying policy facts.
- Revenue Intelligence owns revenue opportunity interpretation where applicable.

### 4.8 Output Metrics

### Examples

- Policies produced.
- Paid policies.
- Premium generated.
- Production by product line.
- Production by period.
- Repeat production.
- Production consistency.
- Production concentration.

### Ownership

- Production Events own facts.
- Productivity owns output interpretation.
- Compensation owns income interpretation.
- Contest owns contest policy count where ruled.

### 4.9 Quality Metrics

### Examples

- Reinstatement-adjusted production.
- Cancellation impact.
- Conservation-informed production quality.
- Persistence-informed productivity quality.
- Policy quality risk.

### Ownership

- Conservation Intelligence owns conservation and persistence metrics.
- Productivity consumes conservation signals to avoid treating low-quality production as durable productivity.

### 4.10 Productive Advisor Capacity Metrics

### Examples

- Active advisor.
- Producing advisor.
- Repeat-producing advisor.
- Consistently productive advisor.
- Advisor productivity trend.
- Advisor productivity risk.

### Ownership

- Productivity Intelligence owns productivity interpretation.
- Partner Intelligence consumes Productive Advisor Capacity.
- Advisor Development consumes productivity feedback.


## 5. Events

Productivity events should not duplicate Production Events.

Production Events remain facts.
Productivity Events are interpretations, milestones or risk signals.

### 5.1 Activity Start Events

### Examples

- PRODUCTIVITY_PERIOD_STARTED.
- PRODUCTIVITY_TRACKING_STARTED.
- PRODUCTIVITY_BASELINE_CREATED.
- ACTIVITY_WINDOW_OPENED.

### Nature

- System or snapshot events.

### Ownership

- Productivity Intelligence.

### 5.2 Activity Completion Inputs

### Examples consumed from Mick

- TASK_COMPLETED.
- FOLLOWUP_COMPLETED.
- CONTACT_ATTEMPTED.
- CONTACT_COMPLETED.
- APPOINTMENT_BOOKED.
- APPOINTMENT_COMPLETED.
- REFERRAL_REQUESTED.
- REFERRAL_RECEIVED.

### Nature

- Behavior fact or activity events.

### Ownership

- Mick, Relationship Intelligence or workflow-specific domain depending on event.

### Productivity use

- Conversion interpretation.

### 5.3 Production Inputs

### Examples consumed from Production Events

- POLICY_ISSUED.
- POLICY_PAID.
- PAYMENT_POSTED.
- POLICY_CANCELLED.
- POLICY_REINSTATED.

### Nature

- Fact events.

### Ownership

- Production Events foundation.

### 5.4 Productivity Interpretation Events

### Examples

- PRODUCTIVITY_SIGNAL_UPDATED.
- ACTIVITY_TO_OUTPUT_CONVERSION_UPDATED.
- PRODUCTIVITY_BOTTLENECK_DETECTED.
- PRODUCTIVITY_RISK_DETECTED.
- PRODUCTIVITY_TREND_CHANGED.
- PRODUCTIVITY_CONCENTRATION_DETECTED.
- PRODUCTIVITY_QUALITY_RISK_DETECTED.

### Nature

- Interpretation events.

### Ownership

- Productivity Intelligence.

### 5.5 Productivity Milestones

### Examples

- FIRST_PRODUCTIVITY_PERIOD_COMPLETED.
- FIRST_REPEAT_PRODUCTION_DETECTED.
- CONSISTENT_OUTPUT_DETECTED.
- PRODUCTIVE_ADVISOR_CAPACITY_DETECTED.
- PRODUCTIVITY_RECOVERY_DETECTED.

### Nature

- Interpretation or milestone events.

### Guardrail

- FIRST_PRODUCTION is not necessarily PRODUCTIVE_ADVISOR_CAPACITY.

### 5.6 Execution Failure Events

### Examples

- ACTIVITY_NOT_CONVERTING.
- PIPELINE_STALLED.
- APPOINTMENT_CONVERSION_FAILURE.
- FOLLOWUP_CONVERSION_FAILURE.
- REPEAT_PRODUCTION_FAILURE.
- PRODUCTIVITY_DROP_DETECTED.

### Nature

- Interpretation events.

### Ownership

- Productivity Intelligence.

### Input dependency

- Mick, Revenue, Production Events and PeriodSnapshot.


## 6. Ownership

### 6.1 Productivity Intelligence Owns

- Productivity interpretation.
- Activity-to-output conversion.
- Output repeatability.
- Productive advisor status.
- Productivity trend.
- Productivity risk.
- Productivity bottleneck.
- Productivity quality interpretation.
- Productivity alerts.
- Productivity signals for Partner and Manager.
- Productivity feedback to Advisor Development.

### 6.2 Productivity Intelligence Does Not Own

- Raw tasks.
- Raw behavior execution.
- Follow-up discipline.
- Task assignment.
- Production Events.
- Commission calculations.
- Bonus calculations.
- Contest policy count.
- LIMRA.
- IGC.
- Persistency.
- Career stage.
- Business plan goals.
- Advisor Experience learning states.
- Manager compensation.

### 6.3 Mick Owns

- Behavior execution.
- Activity completion.
- Cadence.
- Consistency of behavior.
- Coaching responsiveness as behavior.
- Execution gaps.
- Follow-up discipline.

### 6.4 Production Events Own

- Policy fact events.
- Payment facts.
- Production facts.
- Cancellation facts.
- Reinstatement facts.

### 6.5 Revenue Intelligence Owns

- Opportunity pipeline.
- Revenue opportunity.
- Revenue forecast where applicable.
- Client opportunity context.

### Productivity consumes

- Pipeline conversion signals.

### 6.6 Advisor Development Owns

- Signed-to-productive transformation.
- Development readiness.
- Learning progress.
- Coachability as transformation.
- First production readiness.

### Productivity consumes

- Development context.
- Development stage.
- First production milestone.

### 6.7 Manager Intelligence Owns

- Team interpretation.
- Manager coaching priority.
- Unit risk.
- Advisor intervention priority.
- Team productivity distribution as management insight.

### Productivity provides

- Advisor productivity signals.
- Cohort productivity signals.
- Productivity concentration risk.

### 6.8 Compensation Intelligence Owns

- Commission explanation.
- Bonus explanation.
- Payment explanation.
- Adjustments.
- Reversals.

### Productivity must not

- Convert productivity directly into income without Compensation rules.

### 6.9 Conservation Intelligence Owns

- LIMRA.
- IGC.
- Persistency.
- Conservation.
- Siniestralidad.
- Conservation quality.

### Productivity consumes

- Quality signals to distinguish durable output from fragile output.


## 7. Dependencies

### 7.1 Required Domain Dependencies

### Productivity Intelligence requires

- Shared Commercial Model.
- CommercialPerson.
- CommercialAssignment.
- CommercialAttribution.
- Production Events.
- PeriodSnapshot.
- RuleSnapshot.
- EvidenceRecord.
- ProvenanceRecord.
- Mick.
- Revenue Intelligence.
- Advisor Development Intelligence.
- Career Intelligence.
- Conservation Intelligence when quality is evaluated.

### 7.2 Required Data Dependencies

### Required data includes

- Advisor identity.
- Advisor assignment.
- Career stage.
- Activity history.
- Task completion history.
- Contact and appointment history.
- Pipeline history.
- Production event history.
- Product line.
- Policy status.
- Period context.
- Source evidence.
- Attribution.

### 7.3 Required Snapshots

### Potential snapshots

- Productivity Period Snapshot.
- Advisor Productivity Snapshot.
- Activity-to-Output Snapshot.
- Productivity Risk Snapshot.
- Productivity Trend Snapshot.
- Productive Advisor Capacity Snapshot.
- Cohort Productivity Snapshot.

### Guardrail

Snapshots are not facts.
They are captured interpretations at a point in time.

### 7.4 Rule Dependencies

### Productivity may need Rule Pack context for

- What counts as productive.
- Which period applies.
- Which product lines count.
- Which advisor stage applies.
- Which output is eligible.
- Which thresholds apply.

No thresholds are approved in this PAQ.


## 8. Lag and Periodicity

### 8.1 Productivity Is Multi-Speed

### Productivity has different update speeds

- Behavior can update daily or near real-time.
- Pipeline may update daily.
- Production Events may update when source facts arrive.
- Compensation may update after close or payment.
- Conservation may update with reporting lag.

### 8.2 Local Productivity View

### Purpose

- Help advisor and manager act early.

### Inputs

- Mick behavior signals.
- Pipeline movement.
- Appointments.
- Follow-ups.
- Early production events.

### Nature

- Local predictive or near-current view.

### Risk

- Must not be presented as official institutional truth.

### 8.3 Institutional Productivity Confirmation

### Purpose

- Confirm production with official or source-backed facts.

### Inputs

- Policy paid.
- Carrier report.
- Payment posted.
- Official production report.

### Nature

- Institutional historical truth.

### Risk

- May arrive late.

### 8.4 Periodicity Candidates

### Daily

- Activity execution.
- Follow-ups.
- Contact attempts.
- Appointment movement.
- Pipeline action.

### Weekly

- Activity-to-output trend.
- Pipeline conversion.
- Advisor productivity risk.
- Manager coaching priorities.

### Monthly

- Production output.
- Productivity trend.
- Productive advisor status.
- Career stage alignment.

### Quarterly

- Manager unit productivity.
- Partner capacity.
- Business plan progress.

### Lagged

- Conservation-informed quality.
- LIMRA.
- IGC.
- Official reports.

### 8.5 Lag Risks

### Risks

- Productivity appears low before official production posts.
- Productivity appears high before cancellations or conservation issues emerge.
- Manager acts too late if waiting for official reports.
- Compensation appears to validate productivity even when output is concentrated or fragile.

### Guardrail

### Productivity Intelligence must show

- Current local view.
- Confirmed historical view.
- Evidence status.
- Confidence.
- Reporting lag.


## 9. Risks

### 9.1 Activity Equals Productivity

### Risk

- Forge may treat high activity as high productivity.

### Correction

- Activity belongs to Mick.
- Productivity requires output conversion.

### 9.2 First Production Equals Productivity

### Risk

- Forge may treat first production as durable productivity.

### Correction

- First production is a milestone.
- Productivity requires repeatability and output interpretation.

### 9.3 Compensation Equals Productivity

### Risk

- Forge may treat income as productivity.

### Correction

- Compensation is ruled economic interpretation.
- Productivity is output effectiveness.

### 9.4 Production Events Equal Productivity

### Risk

- Forge may treat raw production facts as productivity without period, context or repeatability.

### Correction

- Production Events are facts.
- Productivity is interpretation.

### 9.5 Manager Intelligence Owns Productivity

### Risk

- Manager domain may calculate productivity for team alerts.

### Correction

- Manager consumes productivity.
- Productivity owns productivity interpretation.

### 9.6 Revenue Intelligence Owns Productivity

### Risk

- Revenue pipeline may be confused with productivity.

### Correction

- Revenue owns opportunities.
- Productivity owns activity-to-output performance.

### 9.7 Conservation Lag Ignored

### Risk

- Low-quality production may be counted as durable productivity.

### Correction

- Conservation signals must inform productivity quality, with lag documented.

### 9.8 Rule Pack Leakage

### Risk

- Productivity thresholds may be hardcoded in Core.

### Correction

- Rule Packs define thresholds.
- Core defines primitives and ownership.

### 9.9 Duplicate Metrics

### Risk

- Activity conversion calculated in Mick, Revenue, Manager and Productivity separately.

### Correction

- One metric, one owner.
- Productivity owns productivity conversion.


## 10. Alerts and Feedback

### 10.1 Advisor Alerts

### Possible advisor-facing alerts

- Activity is happening but not creating appointments.
- Appointments are happening but not creating opportunities.
- Opportunities are not reaching policy stage.
- First production has not repeated.
- Follow-ups are not converting.
- Pipeline is aging.
- Productivity is concentrated in one product or source.
- Local productivity is improving but not yet confirmed by institutional reporting.
- Production exists but quality may be at risk pending conservation signals.

### Guardrail

### Alerts must include

- What happened.
- Why it matters.
- What to do next.
- Confidence or evidence status.

### 10.2 Manager Alerts

### Possible manager-facing alerts

- Advisor has high activity but low output conversion.
- Advisor has low activity and declining productivity.
- Advisor produced once but has no repeat activity.
- Advisor pipeline is aging.
- Advisor productivity dropped from prior period.
- Team productivity concentrated in one advisor.
- Cohort development is not becoming productivity.
- Official reporting lag may hide current productivity risk.

### 10.3 Feedback Style

### Advisor feedback should be

- Actionable.
- Specific.
- Non-punitive.
- Economically clear when rules support it.
- Connected to next behavior.

### Manager feedback should be

- Prioritized.
- Coaching-oriented.
- Tied to evidence.
- Separated from compensation unless rules support it.

### 10.4 Advisor Experience Integration

### Clippy may explain

- Why activity is not productivity.
- Why first production is not enough.
- Why pipeline aging matters.
- Why productivity is not confirmed yet.
- Why a manager is recommending a coaching action.

### Candy Crush Experience may adapt

- Simpler next actions for low-execution advisors.
- Deeper productivity diagnostics for advanced advisors.
- Reduced complexity when frustration or low learning is detected.


## 11. Roadmap

### 11.1 Phase 1: Conceptual Lock

### Goal

- Lock the Productivity Intelligence domain boundary.

### Required

- Confirm owner responsibilities.
- Confirm non-owner boundaries.
- Confirm dependency on Mick, Production Events, Revenue and Development.
- Confirm no compensation logic.

### 11.2 Phase 2: Metric Ownership Map

### Goal

- Define which productivity metrics are canonical.

### Required

- Separate behavior metrics from productivity metrics.
- Separate production facts from productivity interpretation.
- Separate revenue pipeline from productivity conversion.

### 11.3 Phase 3: Period and Snapshot Model

### Goal

- Define Productivity Period Snapshot.

### Required

- Daily, weekly, monthly, quarterly and lagged views.
- Local predictive view vs institutional confirmed view.

### 11.4 Phase 4: Alert Design

### Goal

- Define advisor and manager alerts conceptually.

### Required

- Evidence.
- Confidence.
- Next action.
- Ownership.

### 11.5 Phase 5: Economic Motivation Boundary

### Goal

- Define when productivity gaps can be translated into economic impact.

### Required

- Compensation rules.
- Evidence.
- Confidence.
- Forecast guardrails.

### 11.6 Phase 6: Implementation Readiness Review

### Goal

- Determine if engines can be implemented.

### Required

- PAQ lock.
- Metric ownership.
- Event taxonomy.
- Snapshot model.
- Rule Pack boundaries.


## 12. Domain Relationships: Economic Motivation

Economic Motivation consumes productivity signals.

It does not own productivity.

### Productivity may identify

- Activity-to-output gap.
- Pipeline conversion gap.
- Repeat production gap.
- Productivity decline.
- Productive capacity risk.

### Economic Motivation may translate these into

- Potential income impact.
- Income at risk.
- Expected income range.
- Economic urgency.

### Only when

- Compensation rules exist.
- RuleSnapshot exists.
- Evidence exists.
- Confidence is sufficient.
- Forecast uncertainty is explicit.

### Examples without invented numbers

- "Your activity is not converting into output. This may put future income at risk if compensation rules depend on production."
- "Your first production has not repeated. Economic Motivation should not project durable income yet."
- "Your pipeline is aging. If current opportunities do not move, forecasted income should be reduced."

### Guardrails

- No invented financial values.
- No guaranteed income.
- No bonus projection without Compensation rules.
- No productivity-to-money translation without evidence.


## 13. Domain Relationships: Career Intelligence

Career Intelligence consumes productivity signals when career stage, promotion, classification or progression depends on productivity.

### Career Intelligence owns

- Career stage.
- Career Month.
- Career classification.
- Stage transitions.

### Productivity owns

- Productivity interpretation.

### Career may ask

- Is this advisor productive for this career stage?
- Is productivity appropriate for tenure?
- Is productivity improving or declining?
- Does productivity support progression?

### Rule Pack must define

- Any career thresholds.
- Any productivity requirements.
- Any promotion rules.


## 14. Domain Relationships: Revenue Intelligence

### Revenue Intelligence owns

- Opportunity pipeline.
- Revenue opportunities.
- Revenue forecast.
- Client revenue potential.

### Productivity consumes

- Pipeline movement.
- Opportunity conversion.
- Revenue-to-production path.

### Boundary

### Revenue answers

Where can money come from?

### Productivity answers

Is advisor execution converting opportunities into output?

### Risk

Revenue potential may look strong while productivity is weak.

### Example

Many opportunities exist but no appointments, applications or paid policies emerge.


## 15. Domain Relationships: Manager Intelligence

Manager Intelligence consumes productivity to prioritize coaching and intervention.

Manager Intelligence should not calculate advisor productivity independently.

### Manager use cases

- Identify advisor with high activity but low conversion.
- Identify advisor with first production but no repeat.
- Identify advisor with pipeline aging.
- Identify team concentration risk.
- Identify development cohort failing to become productive.

### Productivity provides

- Advisor productivity signal.
- Productivity risk.
- Conversion bottleneck.
- Productivity trend.
- Productivity quality warning.

### Manager provides

- Coaching decision.
- Intervention priority.
- Team action.


## 16. Red Team Review

### Scenario 1
Advisor has many calls but no appointments.

### Risk
Mick may look positive, productivity is weak.

### Correct interpretation
Behavior exists, conversion is failing.


### Scenario 2
Advisor has first production but no repeat.

### Risk
Development may overstate progress.

### Correct interpretation
First production is milestone, not durable productivity.


### Scenario 3
Advisor has low activity but high production.

### Risk
Productivity may look strong while behavior sustainability is weak.

### Correct interpretation
Output exists, but future productivity may be fragile.


### Scenario 4
Advisor produces high premium but conservation later fails.

### Risk
Productivity may overcount low-quality production.

### Correct interpretation
Production fact happened, durable productivity quality requires conservation feedback.


### Scenario 5
Manager dashboard calculates productivity separately.

### Risk
Duplicate ownership.

### Correct interpretation
Manager consumes Productivity Intelligence.


### Scenario 6
Economic Motivation converts productivity gap into income without rules.

### Risk
Invented financial values.

### Correct interpretation
Economic translation requires compensation rules, evidence and confidence.


## 17. Open Questions

### Questions that require later hardening

- What exactly qualifies an advisor as productive?
- Is productivity stage-dependent?
- Is productivity product-line dependent?
- Which period is canonical for productivity?
- How should conservation quality affect productivity?
- How should productivity treat reinstatements?
- How should productivity treat cancellations?
- How should first production be weighted?
- How should Partner-assisted production be separated from advisor-owned capability?
- How should productivity distinguish local predictive view from official confirmed view?

No answers should be hardcoded before Rule Pack and metric ownership review.


## 18. Architecture Decision

### Productivity Intelligence is

DOMAIN CANDIDATE

### Reason

### It has distinct ownership

- Activity-to-output conversion.
- Productivity interpretation.
- Productive advisor capacity signal.
- Productivity trend.
- Productivity risk.

### It has distinct dependencies

- Mick.
- Production Events.
- Revenue.
- Advisor Development.
- Career.
- Conservation.
- Manager Intelligence.

### It has distinct non-owner boundaries

- Does not own behavior.
- Does not own tasks.
- Does not own compensation.
- Does not own production facts.
- Does not own career stage.
- Does not own manager action.

### It should not move to Architecture Lock until

- Metric ownership is finalized.
- Productivity period model is defined.
- Conservation dependency is clarified.
- Rule Pack threshold boundary is defined.
- Economic Motivation boundary is confirmed.


## 19. Recommendations

### Recommendations before implementation

- Formalize Productivity Intelligence as a domain candidate.
- Create a Productivity Metric Ownership Map.
- Define Productivity Period Snapshot.
- Define local predictive vs institutional confirmed productivity views.
- Keep Mick as behavior owner.
- Keep Production Events as fact owner.
- Keep Compensation as economic interpretation owner.
- Keep Manager Intelligence as consumer, not owner.
- Do not create productivity scores without explainable components.
- Do not translate productivity into money without Economic Motivation guardrails.
- Do not treat first production as durable productivity.
- Do not hardcode thresholds in Forge Core.


## 20. Final Verdict

### PAQ-09 discovery result

Productivity Intelligence is a valid Forge OS domain candidate.

It should be opened formally as the domain that interprets whether advisor activity and execution become meaningful, repeatable commercial output.

### Official preliminary definition

Productivity Intelligence measures and explains the conversion of advisor behavior and commercial activity into repeatable production output, while preserving the separation between behavior, production facts, compensation and manager interpretation.

### Official ownership

- Activity-to-output conversion.
- Productivity trend.
- Productivity risk.
- Productivity bottleneck.
- Productive advisor capacity signal.
- Productivity alerts.

### Official non-ownership

- Mick behavior.
- Raw tasks.
- Production Events.
- Compensation.
- Contest.
- Conservation.
- Career stage.
- Manager action.
- Business planning.

### Current status

ARCHITECTURE CANDIDATE

### Next required step

### Productivity Intelligence Hardening

- Metric ownership.
- Event model.
- Period model.
- Snapshot model.
- Rule Pack boundary.
- Manager and Economic Motivation consumption boundary.

No implementation is approved by this PAQ.
