# FORGE Compensation Intelligence Architecture v1.0

Purpose:

Convert the Compensation Intelligence architecture review into official Forge documentation.

This document is conceptual architecture only. It does not create engines, schemas, UI, calculations, AI calls, tests, commits, or implementation logic.

## Central Principle

Production Events are facts.

Contest Intelligence, Compensation Intelligence, and Manager Compensation Intelligence are rule-based interpretations of those facts.

Implication:

- A policy paid event is not a bonus.
- A commission posted event is not a contest result.
- A cancellation is not automatically a compensation reversal until the applicable rule snapshot says how it affects the period.
- A manager productivity result is not raw team production; it is an interpretation using advisor qualification, conservation indexes, tenure, TA dependency, assignment, and PCV rules.

Forge must preserve the fact first, then apply the correct rule snapshot for the correct period.

## 1. Domain Map

### Career Intelligence

Responsibility:

- Determine the commercial lifecycle position of a person.
- Resolve advisor stage, tenure, career month, contest month, class, and transitions.
- Preserve history from Candidate to Precontract to Advisor to Partner / Manager.

Core inputs:

- Commercial person identity.
- Contract / connection date.
- Contest date.
- Advisor conversion event.
- Role and assignment events.
- Organization and office rule snapshots.

Core outputs:

- Career stage.
- Career month.
- Contest month.
- Advisor class.
- Stage transition history.
- Eligibility context for contest and compensation rules.

Dependencies:

- Shared Commercial Domain.
- Rule snapshots.
- Assignment timeline.
- Period calendar.

### Contest Intelligence

Responsibility:

- Interpret annual advisor contest rules.
- Explain eligibility, gaps, blockers, and actions for advisor contest programs.

Programs included:

- Training Allowance.
- Bono Inicial.
- Bono Renovacion.
- Bono GMM.
- Bono Conexion.
- Bono Desarrollo.

Core inputs:

- Career stage.
- Contest month.
- Production events.
- Contest policy count.
- Prima Meta.
- Prima Pago.
- Prima Renovacion.
- LIMRA / IGC snapshots.
- Siniestralidad where applicable.
- Contest rule snapshot.

Core outputs:

- Contest eligibility.
- Contest gap.
- Bonus won / missed / at risk.
- Advisor action needed.
- Contest event history.

Dependencies:

- Career Intelligence.
- Production Events Foundation.
- Conservation Intelligence.
- Rule Snapshot Library.
- Policy Count Library.

### Compensation Intelligence

Responsibility:

- Explain commissions and payments at advisor level.
- Distinguish initial commission, renewal commission, bonus accrual, bonus payment, adjustment, and reversal.

Core inputs:

- Policy / payment events.
- Commission schedule.
- Product identity.
- Policy age.
- Payment mode.
- Commission type.
- Rule snapshot.

Core outputs:

- Commission explanation.
- Compensation event.
- Accrual explanation.
- Payment explanation.
- Recalculation / reversal impact.

Dependencies:

- Product Knowledge.
- Commission Schedule Library.
- Production Events Foundation.
- Compensation Operations.

### Conservation Intelligence

Responsibility:

- Resolve conservation, retention, persistency, and index quality signals.
- Separate official indexes from local portfolio health approximations.

Concepts included:

- LIMRA.
- IGC.
- Persistencia.
- Prima Conservada.
- Prima por Conservar.
- Siniestralidad.
- Index reporting lag.
- Persistency at 13 and 25 months.

Core inputs:

- Policy issued / paid / cancelled / rehabilitated events.
- Premiums.
- Policy status.
- Policy age.
- Reporting period.
- Index source.
- Rule snapshot.

Core outputs:

- Conservation snapshot.
- LIMRA snapshot.
- IGC snapshot.
- Persistency snapshot.
- Index risk.
- Bonus conservation risk.

Dependencies:

- Production Events Foundation.
- Period Calendar.
- Rule Snapshot Library.
- Policy / Portfolio source of truth.

### Manager Compensation Intelligence

Responsibility:

- Interpret PCV / Partner compensation rules.
- Explain manager economic outcomes based on team construction, productivity, development, conservation, and promotion.

Programs included:

- Productividad.
- Produccion.
- Actividad.
- Conexion.
- Desarrollo.
- Transicion.
- Alta Partner.
- Apoyos.

Core inputs:

- Partner active status.
- Advisor active status.
- Advisor qualification.
- Advisor class.
- Initial commissions.
- Qualified advisor count.
- Non-qualified advisor activity.
- TA winners.
- Unit LIMRA / IGC.
- Policy count.
- New advisor alta.
- Origin Partner attribution.
- Partner tenure.
- Assigned cartera.
- PCV rule snapshot.

Core outputs:

- Manager bonus eligibility.
- Manager bonus components.
- Team qualification snapshot.
- PCV blockers.
- Coaching priority by economic impact.
- Promotion / support / fixed support risk.

Dependencies:

- Career Intelligence.
- Contest Intelligence.
- Compensation Intelligence.
- Conservation Intelligence.
- Shared Commercial Domain.
- Assignment Timeline.

### Shared Commercial Domain

Responsibility:

- Provide canonical shared primitives so recruitment, career, compensation, conservation, and manager intelligence do not duplicate concepts.

Shared primitives:

- CommercialPerson.
- CommercialRoleAssignment.
- CommercialAssignment.
- RuleSnapshot.
- PeriodSnapshot.
- ProductionEvent.
- ConservationSnapshot.
- ConnectionAttribution.
- EvidenceRecord.
- Product / Policy identity.

Core outputs:

- Stable person identity.
- Historical assignment at event time.
- Rule snapshot applied to each decision.
- Canonical period definitions.
- Auditable evidence.

Dependencies:

- Organization Profile.
- Office Rules Config.
- Source documents.

### Economic Motivation Engine

Responsibility:

- Translate operational gaps into potential economic impact.
- Help advisors and managers understand why an action matters financially.

Example:

- Gap: "2.5 eligible policies and $25,000 Prima Meta."
- Economic framing: "Potential income impact: initial commissions plus contest bonus exposure, using confirmed rules and stated uncertainty."

Core inputs:

- Contest gaps.
- Compensation rules.
- Commission schedules.
- Eligibility status.
- Conservation risk.
- Explicit source data.

Core outputs:

- Potential economic impact.
- Action priority.
- Uncertainty label.
- Advisor / manager action recommendation.

Boundary:

- Economic Motivation must not invent premiums, products, probabilities, commissions, or recommendations.
- It consumes confirmed rules and explicit data.
- It belongs conceptually under Mick / Behavior Intelligence because it turns behavior gaps into economic motivation.

### Compensation Operations

Responsibility:

- Manage operational payment lifecycle after rule-based eligibility and accrual exist.

Scope:

- Accrual.
- Advance.
- Payment.
- Recalculation.
- Reversal.
- Historical audit.
- Close period.
- Source reconciliation.

Core inputs:

- Bonus accruals.
- Commission events.
- Payment events.
- Cancellations / rehabilitations.
- Rule snapshots.
- Period closes.

Core outputs:

- Payment record.
- Reversal record.
- Recalculation explanation.
- Audit trail.

Dependencies:

- Compensation Intelligence.
- Contest Intelligence.
- Manager Compensation Intelligence.
- Rule Snapshot Library.

## 2. System Clocks

Forge must not collapse business clocks into one calendar month.

| Clock | Meaning | Depends on | Risk if mixed |
| --- | --- | --- | --- |
| Career Month | Month in advisor commercial career | Contract / connection date and career rules | Wrong advisor stage or class |
| Contest Month | Month from contest date | Fecha de concurso | Wrong TA, Conexion, Desarrollo, NP eligibility |
| Semester Month | Position inside semester | Contest / plan calendar | Wrong Training Allowance accumulation or advances |
| NP Contest Month | Month inside New Professional contest path | NP entry date / contest rule | Wrong NP group or mid-semester handling |
| Policy Age Month | Age of policy | Policy issue / effective / payment date | Wrong initial vs renewal classification |
| Index Reporting Month | Month the index is reported for compensation use | Index source and reporting lag | Using stale or premature LIMRA / IGC |
| Quarter Month | Month inside quarter | Calendar / plan quarter | Wrong GMM or quarterly dependency |
| Manager Compensation Quarter | PCV manager quarter | PCV period rules | Wrong TA dependency or productivity reduction |
| Precontract Window Clock | Informal, key active, official window, expiration, reactivation | Precontract cycle and office rules | Wrong recruitment readiness or conversion timing |
| Partner Tenure Semester | Semester since Partner start | Partner alta / support start | Wrong Apoyos amount or eligibility |
| Conservation Curve Month | Tenure curve for base vs real index | Advisor tenure and index rules | Applying real LIMRA / IGC too early |
| Persistence 13/25 Month | Policy persistency eligibility | Policy age | Wrong persistency population |

Design rule:

- Every compensation decision must name the clock it uses.
- Every period calculation must be snapshot-based, not current-device-date based.

## 3. Learned Rules

### Advisor First

The advisor is the primary client of Forge.

Compensation Intelligence must first help the advisor:

- Understand what they earned.
- Understand why they earned it.
- Know what is missing.
- Protect bonuses from preventable loss.
- Decide the next commercial action.

The manager is the secondary client. Manager Intelligence exists to develop people, not to replace advisor-first clarity.

### Career Month Starts At Contract Signature

Career Month starts from the advisor contract / connection event.

This is distinct from:

- Contest Month.
- NP Contest Month.
- Policy Age Month.
- Reporting Month.

### Months 1-12 = Advisor In Development

Months 1 through 12 are treated as Advisor in Development for Training Allowance and early-career monitoring.

### Month 13+ = New Professional

Month 13 and beyond enters the New Professional interpretation unless a rule snapshot defines a different organizational classification.

### Contest Policy Count Is Not 25 Points

Contest policy count is not the same as generic activity points or 25-point activity tracking.

Contest policy count must be rule-based and must consider:

- Product.
- Line of business.
- Premium thresholds.
- Personal-policy exclusions.
- GMM ponderation.
- Cancellation / rehabilitation adjustments.
- Annual contest rules.

### Training Allowance Evaluates By Semester

Training Allowance is evaluated by semester, with monthly advances and close-period behavior.

Therefore:

- Monthly progress is not the final semester result.
- Prior advances matter.
- Semester close matters.
- Recalculation after cancellation may matter.

### NP Mid-Semester Entry Starts At NP Contest Month 1

When an advisor enters New Professional status in the middle of a semester, the NP contest interpretation starts as NP Contest Month 1.

This must not be inferred from raw semester month alone.

### Bono Renovacion Depends On Bono Inicial Calculated

Bono Renovacion is downstream of Bono Inicial calculated.

It should not be evaluated as an independent renewal bonus without the Bono Inicial relationship.

### Vida And GMM Are Different Systems

Vida and GMM use different compensation concepts, inputs, tables, renewal behavior, quarterly / annual logic, and quality metrics.

They may share Production Events, but they should not share rule interpretation blindly.

### Index Reporting Month Has Approximate 3-Month Lag

Index Reporting Month may lag the operational period by approximately three months.

Status:

- Hypothesis / operational discovery.
- Must be confirmed with source documentation before official formulas or calculations are created.

Architectural implication:

- Forge must separate period of activity from period of index reporting.

### Economic Motivation Translates Gaps Into Potential Money

Economic Motivation should turn missing behaviors or missing production into potential economic impact.

Example:

- Operational gap: missing policies or Prima Meta.
- Economic frame: potential commission plus potential bonus exposure.

Rules:

- Only use confirmed schedules and explicit data.
- Show uncertainty.
- Never invent values.
- Use the output to drive action, not vanity metrics.

## 4. Compensation Data Model Concepts

This section is conceptual only. It is not a schema.

Minimum conceptual entities needed to explain any payment:

- Commercial person.
- Commercial role assignment.
- Commercial assignment / attribution.
- Rule snapshot.
- Period snapshot.
- Product.
- Policy.
- Production event.
- Commission schedule.
- Commission metric.
- Contest metric.
- Conservation snapshot.
- Bonus program.
- Bonus eligibility.
- Bonus accrual.
- Bonus payment.
- Recalculation / reversal event.

### Payment Distinctions

Forge must distinguish:

- Comision Inicial: commission generated by first-year / initial commissionable activity under a commission schedule.
- Comision Renovacion: commission generated by renewal-year activity under policy age and schedule rules.
- Bono Vida: contest bonus related to Vida production / Prima Meta / Prima Pago and applicable indexes.
- Bono Renovacion: retention / renewal bonus downstream from Bono Inicial calculated.
- Bono GMM: GMM-specific bonus family with GMM premium, renewal, growth, and siniestralidad logic.
- Productividad Manager: PCV payment from qualified advisors and multiplier logic.
- Conexion: recruiting / connection attribution payment.
- Desarrollo: early advisor development and retention payment.
- Alta Partner: promotion of an advisor into Partner with attribution and support conditions.
- Apoyos: fixed support tied to Partner tenure semester, commissions, and TA requirements.

### Event Placement

Production Events should contain:

- Policy issued.
- Policy paid.
- Receipt paid.
- Commission posted.
- Policy cancelled.
- Policy rehabilitated.
- Policy count adjusted.

Compensation Events should contain:

- Commission calculated.
- Bonus eligibility evaluated.
- Bonus accrued.
- Bonus paid.
- Bonus advanced.
- Bonus recalculated.
- Bonus reversed.

Conservation Events should contain:

- LIMRA snapshot updated.
- IGC snapshot updated.
- Persistency snapshot updated.
- Prima Conservada measured.
- Prima por Conservar measured.
- Conservation risk detected.

Contest Events should contain:

- Training Allowance evaluated.
- Training Allowance won.
- Bono Inicial evaluated.
- Bono Renovacion evaluated.
- Bono GMM evaluated.
- Conexion / Desarrollo contest target evaluated.
- Contest gap detected.

Career Events should contain:

- Advisor connected.
- Contest date established.
- Career month advanced.
- Contest month advanced.
- Advisor became New Professional.
- Advisor class changed.
- Advisor promoted to Partner.

Shared entities:

- CommercialPerson.
- CommercialAssignment.
- RuleSnapshot.
- PeriodSnapshot.
- ProductionEvent.
- ConservationSnapshot.
- ConnectionAttribution.

## 5. Conservation Intelligence Status

Confirmed:

- Forge has local concepts for persistency, active policies, cancelled/lapsed policies, premium conservation, 13-month persistency, and 25-month persistency.
- LIMRA and IGC are compensation-quality indexes used by advisor and manager compensation.
- LIMRA and IGC must be snapshot-based.
- Manager rules describe learning curves for base vs real index by tenure.

Not yet confirmed:

- Official LIMRA formula.
- Official IGC formula.
- Official Prima Conservada formula.
- Official Prima por Conservar formula.
- Exact index source of truth.
- Exact reporting lag.
- Exact treatment of cancellations, rehabilitations, and reporting corrections.

Hypotheses:

- Index Reporting Month lags the business activity period by approximately three months.
- Conservation data may need both activity-period and report-period timestamps.

Risks:

- Treating local persistency as official LIMRA / IGC.
- Applying current index to historical periods.
- Applying real index before the learning curve says it applies.
- Mixing advisor index and unit index.

## 6. Manager Compensation Findings

PCV manager compensation is not only a payout system. It is an economic model for building a durable commercial unit.

Conceptual pillars:

- Cimientos: Apoyos and Transicion.
- Construccion: Productividad, Produccion, Actividad.
- Expansion: Conexion, Desarrollo, Alta Partner.

Primary manager KPI:

- Sustainable qualified advisor base.

Most important economic variable:

- Qualified advisors who generate initial commissions, pass LIMRA / IGC gates, and contribute to productivity multiplier / activity economics.

Leading indicators:

- New advisor altas.
- RDA / connection attribution.
- Policy activity in early months.
- Training Allowance winners.
- Advisors close to qualification.
- Activity discipline.
- Retention during development window.
- Partner support metric compliance.

Lagging indicators:

- Commissions paid.
- Productivity bonus paid.
- LIMRA / IGC reported.
- Persistency.
- Renewal results.
- Reversals.
- Alta Partner installment continuation.

Dependency map:

- Productividad depends on advisor qualification, advisor class, initial commissions, qualified advisor count, and TA dependency.
- Produccion depends on non-qualified advisor activity, organization type, and unit LIMRA / IGC.
- Actividad depends on qualified advisors, minimum tenure, Vida + GMM policy count, and qualified commission base.
- Conexion depends on new advisor alta, attribution, and early policy count.
- Desarrollo depends on advisor months 4-15, policy count, and active retention.
- Alta Partner depends on advisor promotion into Partner, origin attribution, and support metric maintenance.
- Apoyos depends on Partner tenure semester, accumulated commissions, and accumulated TA winners.
- Transicion depends on Partner startup period, assigned cartera, and direct key commissions.

## 7. Risks

High-priority architecture risks:

- Mixing 2025 commission schedules with 2026 contest rules.
- Mixing Prima Meta, Prima Pago, commission, and renewal.
- Treating LIMRA and IGC as the same metric.
- Recalculating historical periods with new rules.
- Asking for manual capture where Forge can infer from reliable source data.
- Using current device date instead of compensation period snapshots.
- Treating policy count as raw policies.
- Treating connection, contract signature, alta, and contest date as one timestamp.
- Treating manager compensation as independent from advisor qualification and contest results.
- Building schemas before closing rule ambiguity.
- Letting manager dashboards outrun advisor-first explanations.

## 8. Recommended Roadmap

### Phase 1: Shared Commercial Model

Close shared language and contracts:

- CommercialPerson.
- CommercialRoleAssignment.
- CommercialAssignment.
- RuleSnapshot.
- PeriodSnapshot.
- ProductionEvent.
- ConservationSnapshot.
- ConnectionAttribution.

### Phase 2: Career Intelligence Foundation

Close lifecycle semantics:

- Career Month.
- Contest Month.
- NP Contest Month.
- Advisor in Development.
- New Professional.
- Advisor class.
- Partner promotion.

### Phase 3: Production Events Foundation

Normalize facts:

- Policy issued.
- Policy paid.
- Commission posted.
- Cancellation.
- Rehabilitation.
- Policy count adjustment.

### Phase 4: Contest Intelligence Foundation

Close advisor contest semantics:

- Training Allowance.
- Bono Inicial.
- Bono Renovacion.
- Bono GMM.
- Conexion.
- Desarrollo.
- Contest policy count.

### Phase 5: Compensation Events Foundation

Close payment lifecycle:

- Commission event.
- Bonus eligibility.
- Bonus accrual.
- Bonus payment.
- Advance.
- Reversal.
- Recalculation.

### Phase 6: Conservation Intelligence Discovery

Close official conservation knowledge before implementation:

- LIMRA.
- IGC.
- Prima Conservada.
- Prima por Conservar.
- Reporting lag.
- Base vs real index curve.
- Unit vs advisor index.

### Phase 7: Economic Motivation Foundation

Translate gaps to potential economic impact:

- Use explicit data only.
- Use confirmed rules only.
- Label uncertainty.
- Drive advisor and manager action.

### Phase 8: Manager Compensation Intelligence Foundation

Close PCV manager knowledge:

- Productividad.
- Produccion.
- Actividad.
- Conexion.
- Desarrollo.
- Alta Partner.
- Apoyos.
- Transicion.
- Team qualification.
- TA dependency.

## 9. Design Recommendations

- Build shared primitives before domain-specific engines.
- Store rule snapshots before calculating outcomes.
- Keep Product Knowledge separate from Commission Schedules.
- Keep Contest Rules separate from Manager Compensation Rules.
- Keep Conservation Intelligence separate from generic persistency dashboards.
- Require every payment explanation to cite facts, rules, period, and source.
- Treat Economic Motivation as a behavior/action layer, not a source of financial truth.
- Preserve Advisor First in every compensation output:
  - What did I earn?
  - Why?
  - What is missing?
  - What should I do now?

