# PAQ-10 Conservation Intelligence Discovery

## Repository References

- [FORGE_MASTER_BUILD_TREE.md](FORGE_MASTER_BUILD_TREE.md)
- [AGENTS.md](AGENTS.md)
- [FORGE_CONSTITUTION_V3.md](FORGE_CONSTITUTION_V3.md)
- [FORGE_FOUNDATION_LOCK.md](FORGE_FOUNDATION_LOCK.md)

---


Forge OS
Principal Domain Architect Review
Conservation Intelligence Discovery

## Status

ARCHITECTURE CANDIDATE


## Scope

- Architecture discovery only.
- No code.
- No engines.
- No schemas.
- No UI.
- No app.js.
- No implementation.
- No commits.


## 1. Executive Summary

Conservation Intelligence is the Forge OS domain that interprets whether issued and paid business remains healthy, active, persistent and durable over time.

### Productivity Intelligence can say

"This advisor is producing repeatable output."

### Conservation Intelligence must answer

"Is that output durable, conserved and quality-backed?"

Conservation Intelligence exists because Production Events alone do not explain post-sale durability.

### Production Events say

- Policy issued.
- Policy paid.
- Policy cancelled.
- Policy reinstated.
- Payment posted.

### Conservation Intelligence interprets

- Whether policy output remains alive.
- Whether production is fragile.
- Whether conservation indexes indicate risk.
- Whether official snapshots confirm or contradict local signals.
- Whether quality signals affect compensation, manager compensation, productivity, forecast and business planning.

### Central architectural separation

- Production Events = facts.
- Conservation Intelligence = quality, persistency and conservation interpretation.
- Compensation Intelligence = money interpretation.
- Manager Compensation Intelligence = manager payout interpretation.
- Productivity Intelligence = activity-to-output and durable productivity interpretation.
- Forecast Intelligence = suggestions.
- Business Planning = action planning.
- Rule Pack = official thresholds, formulas and eligibility.

### Important guardrail

This PAQ does not invent formulas for LIMRA, IGC, Persistencia or Siniestralidad.

### Any formula not supported by official evidence must be labeled

FORMULA NOT VALIDATED.


## 2. Domain Purpose

Conservation Intelligence solves the post-production quality problem.

### It answers

- Did the policy remain active?
- Did production persist after issue/payment?
- Is there a risk of lapse, cancellation or poor quality?
- Is the policy or portfolio at conservation risk?
- Is local observed risk different from official reported index?
- Is an official LIMRA or IGC snapshot available?
- Is an index lagging behind reality?
- Does compensation depend on conservation quality?
- Does manager compensation depend on LIMRA, IGC or conservation gates?
- Should Productivity qualify output as durable or fragile?
- Should Forecast reduce expected future income due to conservation risk?
- Should Business Planning recommend servicing or conservation actions?

### Consumers

- Productivity Intelligence.
- Compensation Intelligence.
- Manager Compensation Intelligence.
- Contest Intelligence.
- Forecast Intelligence.
- Business Planning Intelligence.
- Advisor Experience.
- Manager Intelligence.
- Portfolio / Post-Sale Intelligence when formalized.
- Economic Motivation.

### Decisions enabled

- Advisor should service a policy at risk.
- Manager should watch advisor conservation risk.
- Compensation should consume official conservation snapshot instead of calculating its own.
- Productivity should qualify output durability.
- Forecast should avoid projecting fragile production as durable income.
- Business Planning should include conservation actions.


## 3. Conservation Definition

### Conservation

- Domain interpretation of whether issued, paid or active business remains healthy, conserved and durable over time.
- Includes policy-level, advisor-level, portfolio-level and unit-level quality signals.
- FORMULA NOT VALIDATED unless defined by Rule Pack or official source.

### Persistency

- Interpretation of whether policies remain in force through a relevant age or persistence window.
- May depend on Policy Age Month, Persistence Month, product, reporting source and Rule Pack.
- FORMULA NOT VALIDATED.

### LIMRA

- External or institutional conservation/index snapshot used as quality signal.
- May be reported with lag.
- May affect advisor, contest, compensation or manager compensation depending on Rule Pack.
- FORMULA NOT VALIDATED.

### IGC

- External or institutional conservation/index snapshot, likely tied to mature portfolio or conservation quality.
- May be reported with lag.
- May affect advisor, compensation or manager rules depending on Rule Pack.
- FORMULA NOT VALIDATED.

### Siniestralidad

- Quality or claims-related metric that may affect product, conservation, compensation or manager interpretation when rules support it.
- Owner remains Conservation Intelligence unless a future Product/Claims Intelligence separates it.
- FORMULA NOT VALIDATED.

### Prima Conservada

- Premium amount interpreted as conserved under a relevant conservation rule, period and evidence source.
- FORMULA NOT VALIDATED.

### Prima por Conservar

- Premium amount still exposed to conservation risk or pending durability confirmation.
- FORMULA NOT VALIDATED.

### Policy Quality

- Interpretation of policy durability and health based on payment behavior, status, cancellation, reinstatement, persistence, servicing and official index signals.

### Conservation Risk

- Interpretation that a policy, advisor, portfolio or unit may suffer conservation deterioration, lapse, cancellation, weak persistence, index decline or quality-based compensation impact.


## 4. Conservation vs Retention

Conservation is not generic Retention.

### Conservation

- Focuses on policy, premium, persistency, index quality and business durability.
- Owns LIMRA, IGC, Persistencia, Conservacion, Siniestralidad and conservation risk.

### Retention

- Broader concept.
- May refer to clients, advisors, relationships, policies, assets or managers.

### Policy persistence

- Specific policy lifecycle durability concept.
- Owner: Conservation Intelligence.

### Client retention

- Whether a client relationship remains active.
- Owner: REVIEW REQUIRED.
- Possible future owner: Relationship Intelligence or Portfolio Intelligence.

### Advisor retention

- Whether advisor remains in career or unit.
- Owner: REVIEW REQUIRED.
- Possible future owner: Career Intelligence, Advisor Development or Partner Intelligence.

### Relationship retention

- Whether a relationship remains warm, engaged or valuable.
- Owner: Relationship Intelligence.

### Decision

- Conservation owns policy/business quality and persistence.
- Generic retention remains REVIEW REQUIRED by context.


## 5. Local Predictive Conservation vs Institutional Historical Conservation

### Local Predictive Conservation

- Early, local, action-oriented risk interpretation.
- Uses observed behavior and operational signals before official reports arrive.
- Must show confidence and evidence state.

### Possible signals

- Payment behavior risk.
- Late or missed payment signals.
- Policy status observed locally.
- Service activity missing.
- Lack of client contact.
- Renewal pipeline at risk.
- Cancellation warning.
- Reinstatement opportunity.
- Advisor follow-up inactivity.
- Client relationship weakening.

### Institutional Historical Conservation

- Official or source-backed conservation truth.
- Usually comes from carrier reports, official indexes, commission/conservation reports or institutional snapshots.

### Examples

- LIMRA reported.
- IGC reported.
- Carrier conservation snapshot.
- Official persistency report.
- Official cancellation/reinstatement report.
- Commission/conservation report.

### Locked distinction

- Local predictive conservation can trigger action.
- Institutional historical conservation can confirm official outcomes.
- Local predictive conservation must not become official LIMRA/IGC without evidence and rules.


## 6. Reporting Lag Model

### Event Time

- When the underlying policy/payment/cancellation/reinstatement happened.

### Effective Time

- When the event becomes effective for policy, compensation or conservation interpretation.

### Reporting Time

- When carrier, institution or source reports the event or index.

### Evaluation Time

- When Forge or Rule Pack evaluates conservation for a domain.

### Payment Time

- When compensation or manager compensation is paid.

### Correction Time

- When a late report, correction, reinstatement or index change updates prior understanding.

### Impact on LIMRA

- LIMRA may be reported after the activity period.
- Local view may detect risk before official LIMRA.
- Official LIMRA must preserve reporting period and source.

### Impact on IGC

- IGC may also lag and may apply to a different/more mature population.
- Exact boundary requires Rule Pack validation.

### Impact on Compensation

- Compensation must consume official conservation snapshots when required.
- Compensation must not calculate LIMRA/IGC.
- Late indexes may cause recalculation or adjustment only through rules and correction records.

### Impact on Manager Compensation

- Manager Compensation must consume Conservation snapshots.
- Manager Compensation must not calculate Conservation.
- Lag must be visible before manager payout interpretation.

### Impact on Forecast

- Forecast can use local predictive conservation risk.
- Forecast must not present local risk as official index.

### Impact on Business Planning

- Planning should act on local risk and later reconcile with official reports.

### Impact on Advisor Feedback

- Advisor alerts must label local predictive vs institutional confirmed.


## 7. Domain Inputs

### Production Events

- Owner: Production Events foundation.
- Conservation consumes facts.

POLICY_ISSUED:

- Owner: Production Events.
- Use: establishes policy lifecycle start context.

POLICY_PAID:

- Owner: Production Events.
- Use: payment durability and premium history input.

POLICY_CANCELLED:

- Owner: Production Events.
- Use: cancellation and conservation risk/impact.

POLICY_REINSTATED:

- Owner: Production Events.
- Use: reinstatement and correction context.

PAYMENT_POSTED:

- Owner: Production Events / Compensation Operations depending source.
- Use: payment behavior and premium history.

### Premium history

- Owner: Production Events / Policy Operations as facts.
- Conservation consumes for persistency and premium quality interpretation.

### Policy age

- Owner: Period/Policy lifecycle context.
- Conservation consumes for Policy Age Month and Persistence Month.

### Policy status

- Owner: Policy Operations / Production Events as source-backed fact.
- Conservation consumes.

### Carrier reports

- Owner: SourceSystem + Evidence/Provenance.
- Conservation resolves snapshots.

### Evidence records

- Owner: Evidence model.
- Conservation consumes and references.

### Provenance records

- Owner: Provenance model.
- Conservation consumes and references.

### RuleSnapshot

- Owner: Rule Pack / Rule Snapshot model.
- Conservation consumes when formula/threshold/evaluation is rule-governed.

### PeriodSnapshot

- Owner: Period model.
- Conservation consumes for reporting, evaluation and correction.

### Product data

- Owner: Product Intelligence.
- Conservation consumes product context when conservation treatment differs by product.

### Servicing responsibility

- Owner: Shared Commercial Model / Servicing.
- Conservation consumes for action ownership.

### Advisor assignment

- Owner: CommercialAssignment.
- Conservation consumes for advisor/unit attribution.

### Client relationship context

- Owner: Relationship Intelligence / Shared Commercial Model.
- Conservation consumes for local predictive risk and servicing action.


## 8. Domain Outputs

### LIMRA snapshot

- Official or locally resolved snapshot with source, period, confidence and formula status.

### IGC snapshot

- Official or locally resolved snapshot with source, period, confidence and formula status.

### Persistency snapshot

- Persistence interpretation for policy/advisor/portfolio/unit.

### Conservation snapshot

- General conservation state for a policy, advisor, portfolio or unit.

### Conservation risk

- Risk signal that conservation quality may deteriorate.

### Policy quality signal

- Quality interpretation for a policy or output stream.

### Conservation explanation

- Human-readable explanation of what happened, why it matters, evidence and status.

### Bonus conservation blocker

- Signal consumed by Contest, Compensation or Manager Compensation when rules require conservation condition.

### Productivity quality signal

- Signal consumed by Productivity to qualify output durability.

### Portfolio risk signal

- Signal for future Portfolio/Post-Sale Intelligence.

### Compensation dependency signal

- Signal that compensation depends on official conservation context.

### Manager compensation dependency signal

- Signal that manager compensation depends on LIMRA/IGC/conservation context.


## 9. Ownership Boundaries

### Production Events

- Own facts.
- Do not own conservation interpretation.

### Productivity Intelligence

- Owns output conversion and durable productivity interpretation.
- Consumes conservation quality signals.
- Does not own LIMRA, IGC, persistency or conservation.

### Compensation Intelligence

- Owns money interpretation.
- Consumes official conservation snapshots when rules require.
- Does not calculate Conservation.

### Contest Intelligence

- Owns contest qualification.
- Consumes conservation blockers when contest rules require.
- Does not own Conservation.

### Manager Compensation Intelligence

- Owns manager payout interpretation.
- Consumes unit/advisor conservation snapshots.
- Does not calculate LIMRA/IGC.

### Career Intelligence

- Owns career stage and lifecycle.
- May consume conservation if career rules require.
- Does not own conservation metrics.

### Revenue Intelligence

- Owns opportunity and revenue pipeline.
- Consumes conservation risk for future revenue quality.
- Does not own policy conservation.

### Portfolio Intelligence

- REVIEW REQUIRED.
- May later consume conservation for post-sale portfolio health.

### Business Planning

- Owns action planning.
- Consumes conservation risk.
- Does not assume production is durable without conservation context.

### Forecast Intelligence

- Owns forecasts.
- Consumes local predictive and confirmed conservation signals.
- Does not present forecasts as official conservation.

### Advisor Experience

- Owns contextual presentation and learning.
- Consumes conservation explanations.
- Does not own conservation rules or metrics.


## 10. LIMRA Review

### LIMRA is treated as

- External/institutional snapshot.
- Conservation index.
- Possible lagged report.
- Rule Pack interpreted metric.

### Owner

- Conservation Intelligence.

### Consumers

- Compensation.
- Contest.
- Manager Compensation.
- Productivity.
- Forecast.
- Business Planning.
- Advisor Experience.

### Formula

- FORMULA NOT VALIDATED.

### Rules

- Do not calculate LIMRA in Compensation.
- Do not calculate LIMRA in Manager Compensation.
- Do not treat local persistency as official LIMRA.
- Preserve source, reporting period, activity period and confidence.


## 11. IGC Review

### IGC is treated as

- External/institutional snapshot.
- Mature portfolio/conservation index candidate.
- Possible lagged report.
- Rule Pack interpreted metric.

### Owner

- Conservation Intelligence.

### Consumers

- Compensation.
- Manager Compensation.
- Productivity.
- Forecast.
- Business Planning.

### Formula

- FORMULA NOT VALIDATED.

### Rules

- Do not calculate IGC in Manager Compensation.
- Do not treat IGC as identical to LIMRA.
- Preserve source, reporting period, activity period and confidence.


## 12. LIMRA vs IGC Boundary

### Policy age

- LIMRA appears tied to younger business in prior discovery.
- IGC appears tied to mature portfolio in prior discovery.
- Exact boundary: REVIEW REQUIRED.

### Reporting source

- Both may come from external/institutional reports.
- Exact source rules: REVIEW REQUIRED.

### Reporting lag

- Both may report late.
- Lag must be modeled explicitly.

### Compensation impact

- Both may affect compensation if Rule Pack says so.
- Compensation consumes snapshots; it does not calculate either index.

### Manager compensation impact

- Both may affect manager compensation if Rule Pack says so.
- Manager Compensation consumes snapshots; it does not calculate either index.

### Business use

- LIMRA/IGC can inform productivity quality, forecast risk and business planning.

### Decision

- LIMRA and IGC are separate metrics.
- Exact formula and population remain REVIEW REQUIRED.


## 13. Conservation Event Model

### Fact Events

- POLICY_PAID.
- POLICY_CANCELLED.
- POLICY_REINSTATED.
- PAYMENT_POSTED.

### Owner

- Production Events foundation.

### Snapshot Events

- LIMRA_SNAPSHOT_RECEIVED.
- IGC_SNAPSHOT_RECEIVED.
- PERSISTENCY_SNAPSHOT_CREATED.
- CONSERVATION_SNAPSHOT_CREATED.

### Owner

- Conservation Intelligence.

### Interpretation Events

- CONSERVATION_RISK_DETECTED.
- POLICY_QUALITY_RISK_DETECTED.
- CONSERVATION_TREND_CHANGED.
- CONSERVATION_BLOCKER_DETECTED.

### Owner

- Conservation Intelligence.

### Correction Events

- CONSERVATION_CORRECTION_RECEIVED.
- INDEX_REPORTED_LATE.
- POLICY_REINSTATEMENT_APPLIED.
- CANCELLATION_CORRECTED.

### Owner

- Depends on underlying fact/source; Conservation owns interpretation correction.

### Rules

- Fact events are not mutated silently.
- Corrections create correction records.
- Snapshot updates must preserve prior snapshot.


## 14. Conservation Period Model

### Policy Age Month

- Policy lifecycle age period.
- Used for persistence and index eligibility.

### Index Reporting Month

- Month when official index is reported.
- Must be separate from activity month.

### Conservation Curve Month

- Conceptual conservation maturity curve period.
- Used for durability interpretation.

### Persistence Month

- Specific persistence window or policy age marker.
- FORMULA/THRESHOLD NOT VALIDATED.

### Reporting Period

- Period reported by source or carrier.

### Evaluation Period

- Period when Forge or Rule Pack evaluates conservation.

### Correction Period

- Period when correction/reinstatement/late report is processed.

### Guardrail

- No single clock governs conservation.
- Every conservation output must preserve period context.


## 15. Conservation Snapshot Model

### Policy Conservation Snapshot

- Captures policy-level conservation state.

### Advisor Conservation Snapshot

- Captures advisor-level conservation interpretation.

### Portfolio Conservation Snapshot

- Captures portfolio-level conservation state.

### LIMRA Snapshot

- Captures LIMRA value/status/source/period/confidence.

### IGC Snapshot

- Captures IGC value/status/source/period/confidence.

### Conservation Risk Snapshot

- Captures local predictive or confirmed risk.

### Quality-adjusted Productivity Snapshot input

- Signal consumed by Productivity to qualify durability.

### Snapshot rules

- Snapshots are interpretations, not facts.
- Snapshots must preserve source, evidence, confidence and period.
- Historical snapshots must not be overwritten silently.


## 16. Conservation and Productivity

### How Conservation informs durable output

- Productivity may identify repeatable output.
- Conservation qualifies whether that output appears durable or fragile.

### When Productivity consumes Conservation

- When evaluating production quality.
- When checking output durability.
- When interpreting Productive Advisor Capacity.
- When explaining risk of fragile production.

Can Conservation change past productivity interpretation?

- It can create a new corrected or lagged quality interpretation.
- It must not silently mutate historical productivity snapshots.

### Guardrail

- Past snapshots must preserve original evidence state.
- New conservation signals create updated interpretation or correction record.


## 17. Conservation and Compensation

### How Conservation feeds quality-conditioned bonuses

- Conservation provides snapshots, blockers and quality signals.
- Compensation consumes those snapshots when Rule Pack requires conservation condition.

### Compensation owns

- Money calculation.
- Payment explanation.
- Adjustment/reversal interpretation.

### Conservation owns

- LIMRA.
- IGC.
- Persistency.
- Conservation risk.
- Quality snapshot.

### Rule Pack owns

- Formula.
- Threshold.
- Eligibility.
- Whether conservation affects bonus.

### Lag handling

- Compensation must label pending conservation dependencies.
- Late snapshots may trigger recalculation only through Rule Pack and correction records.


## 18. Conservation and Manager Compensation

### How LIMRA/IGC may affect manager rules

- Manager Compensation may require unit/advisor LIMRA or IGC gates.
- Manager Compensation consumes Conservation snapshots.

### Avoiding ownership conflict

- Manager Compensation must not calculate LIMRA/IGC.
- Manager Compensation must not infer official conservation from local predictive risk.

### Snapshot labels

- Official institutional snapshot.
- Local predictive signal.
- Pending report.
- Late report.
- Corrected report.


## 19. Conservation and Forecast

### How Conservation affects future income forecast

- Weak conservation may reduce expected future durability.
- Pending conservation risk may reduce forecast confidence.
- Reinstatement opportunity may improve forecast only with evidence.

### Predictive signals

- Payment behavior risk.
- Cancellation warning.
- No servicing activity.
- Renewal pipeline risk.
- Local policy status risk.

### Confirmed signals

- Official LIMRA.
- Official IGC.
- Carrier cancellation.
- Carrier reinstatement.
- Official persistency snapshot.

### Guardrail

- Forecast must not project fragile production as durable.
- Forecast must not present local predictive conservation as official.


## 20. Conservation and Business Planning

### How Business Planning uses Conservation

- Defines conservation actions.
- Prioritizes servicing.
- Adjusts plans for fragile production.
- Identifies portfolio or unit quality risk.
- Prevents planning based only on new production.

### Possible actions

- Contact client with payment risk.
- Review policy at risk.
- Trigger servicing task.
- Prioritize reinstatement opportunity.
- Reduce forecast confidence.
- Coach advisor on conservation quality.

### Business Planning must not assume

- All paid production is durable.
- Local risk is official index.
- LIMRA/IGC formulas without Rule Pack.
- Compensation impact without rules.


## 21. Advisor and Manager Alerts

### Advisor alerts

- Policy at conservation risk.
- Payment behavior risk.
- Lapse/cancellation risk.
- Reinstatement opportunity.
- Production quality pending confirmation.

### Manager alerts

- Advisor conservation risk.
- Unit conservation risk.
- Conservation lag warning.
- Manager compensation conservation dependency.

### Every alert must include

- What happened.
- Why it matters.
- Evidence status.
- Local predictive vs institutional confirmed.
- Confidence.
- Next best action.

### Guardrail

- Alerts must not invent LIMRA/IGC.
- Alerts must not imply compensation result without Rule Pack.


## 22. Red Team Review

Scenario: Alta produccion, baja conservacion.

- Risk: Productivity and compensation may look strong while business quality is weak.
- Mitigation: Productivity consumes Conservation quality; Compensation consumes official snapshots only.

Scenario: LIMRA llega 3 meses tarde.

- Risk: Advisor or manager acts late; compensation may require recalculation.
- Mitigation: Separate local predictive view from institutional confirmed view.

Scenario: IGC contradicts local view.

- Risk: Local forecast overstates durability.
- Mitigation: Preserve both views, evidence and reporting time.

Scenario: Poliza cancelada y reinstalada.

- Risk: Silent mutation of conservation history.
- Mitigation: Correction events and reinstatement records.

Scenario: Bono calculado antes de reporte oficial.

- Risk: Compensation pays or explains wrong result.
- Mitigation: Pending dependency label and recalculation policy via Rule Pack.

Scenario: Advisor productivo con mala conservacion.

- Risk: Productive Advisor Capacity overstated.
- Mitigation: Quality-adjusted productivity signal.

Scenario: Manager unit fuerte pero IGC debil.

- Risk: Manager health overestimated.
- Mitigation: Manager consumes official Conservation snapshots.

Scenario: Forecast optimista ignora conservacion.

- Risk: Future income overstated.
- Mitigation: Forecast consumes conservation risk and confidence.

Scenario: Conservation se confunde con retencion generica.

- Risk: Ownership collapse.
- Mitigation: Conservation owns policy/business durability; generic retention remains review required.


## 23. Architecture Decision

### Decision

ARCHITECTURE CANDIDATE

### Justification

- Conservation Intelligence has clear ownership.
- Metrics ownership is clear enough.
- Boundaries with Production, Productivity, Compensation and Manager Compensation are clear.
- Period and lag model is conceptually clear.
- Formula details remain outside Core and require Rule Pack or official evidence.

### Open gaps

- Official LIMRA formula.
- Official IGC formula.
- Exact LIMRA vs IGC population.
- Exact persistence windows.
- Exact siniestralidad ownership if Product/Claims Intelligence emerges.

These gaps do not block architecture candidacy because they belong to Rule Pack/evidence validation, not Core ownership.


## 24. Recommended Next Step

### Recommended next step

PAQ-10.5 Conservation Architecture Lock.

### Reason

- Boundaries are clear enough to lock ownership and non-ownership.
- Formulas can remain explicitly not validated and external to Core.

### Later recommended

- Forecast Intelligence.
- Business Planning Intelligence.
- Portfolio Intelligence / Post-Sale Intelligence.


## 25. Final Verdict

Conservation Intelligence is a valid Forge OS domain candidate.

### It owns

- LIMRA.
- IGC.
- Persistency.
- Conservation.
- Siniestralidad unless later separated.
- Prima Conservada.
- Prima por Conservar.
- Policy Quality.
- Conservation Risk.
- Conservation snapshots.

### It does not own

- Production facts.
- Productivity interpretation.
- Compensation payouts.
- Contest qualification.
- Manager compensation calculation.
- Career stage.
- Forecast.
- Business planning.
- Generic retention.

### PAQ-10 status

ARCHITECTURE CANDIDATE

### Proceed to PAQ-10.5

YES
