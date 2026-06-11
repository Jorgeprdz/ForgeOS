# PAQ-10.5 Conservation Intelligence Architecture Lock

## Repository References

- [FORGE_MASTER_BUILD_TREE.md](FORGE_MASTER_BUILD_TREE.md)
- [AGENTS.md](AGENTS.md)
- [FORGE_CONSTITUTION_V3.md](FORGE_CONSTITUTION_V3.md)
- [FORGE_FOUNDATION_LOCK.md](FORGE_FOUNDATION_LOCK.md)

---


Forge OS
Conservation Intelligence Architecture Lock

## Status

ARCHITECTURE LOCK


## Scope

- Conceptual architecture only.
- No code.
- No engines.
- No schemas.
- No UI.
- No app.js.
- No implementation.
- No commits.


## 1. Executive Summary

Conservation Intelligence is locked as the Forge OS domain that owns quality, persistency, conservation and index interpretation for policy and portfolio durability.

### It exists because Forge must distinguish

- Production happened.
- Productivity was generated.
- Compensation may be calculated.
- But business quality may still be fragile.

### Locked principle

Production Events are facts.
Conservation Intelligence interprets durability and quality.
Compensation consumes conservation snapshots when money rules require them.
Productivity consumes conservation signals when output durability is evaluated.
Manager Compensation consumes conservation snapshots when manager rules require them.

No formulas are approved in this PAQ.

FORMULA NOT VALIDATED applies to LIMRA, IGC, Persistencia, Siniestralidad, Prima Conservada and Prima por Conservar until official Rule Pack or evidence defines them.


## 2. Locked Definition

Conservation Intelligence is the domain that interprets whether policies, premium, advisor output, portfolio output or unit output remain healthy, active, persistent and durable over time.

### It owns

- Policy conservation interpretation.
- Advisor conservation interpretation.
- Portfolio conservation interpretation.
- Unit conservation interpretation.
- Institutional index snapshot interpretation.
- Local predictive conservation risk.
- Conservation lag explanation.
- Conservation correction interpretation.

### It separates

- Local Predictive Conservation.
- Institutional Historical Conservation.


## 3. Locked Ownership

### Conservation Intelligence owns

- LIMRA.
- IGC.
- Persistency.
- Conservation.
- Siniestralidad unless a future Product/Claims Intelligence separates it.
- Prima Conservada.
- Prima por Conservar.
- Policy Quality.
- Conservation Risk.
- Conservation snapshots.
- LIMRA snapshots.
- IGC snapshots.
- Persistency snapshots.
- Conservation reporting period interpretation.
- Conservation correction interpretation.
- Conservation blockers consumed by other domains.


## 4. Locked Non-ownership

### Conservation Intelligence does not own

- Production Events.
- Policy fact creation.
- Payment fact creation.
- Advisor productivity interpretation.
- Compensation calculation.
- Bonus calculation.
- Contest qualification.
- Manager compensation calculation.
- Career stage.
- Revenue opportunity.
- Forecast outputs.
- Business plans.
- Advisor Experience learning states.
- Generic client retention.
- Generic advisor retention.
- Relationship retention.


## 5. Conservation Metric Ownership Map

### LIMRA

- Final owner: Conservation Intelligence.
- Source: Institutional or Rule Pack interpreted snapshot.
- Formula: FORMULA NOT VALIDATED.
- Consumers: Compensation, Contest, Manager Compensation, Productivity, Forecast, Business Planning.

### IGC

- Final owner: Conservation Intelligence.
- Source: Institutional or Rule Pack interpreted snapshot.
- Formula: FORMULA NOT VALIDATED.
- Consumers: Manager Compensation, Compensation, Productivity, Forecast, Business Planning.

### Persistency

- Final owner: Conservation Intelligence.
- Formula: FORMULA NOT VALIDATED.
- Consumers: Productivity, Compensation, Forecast, Business Planning.

### Conservation

- Final owner: Conservation Intelligence.
- Formula: FORMULA NOT VALIDATED.
- Consumers: Productivity, Manager, Compensation, Forecast, Business Planning.

### Siniestralidad

- Final owner: Conservation Intelligence unless Product/Claims Intelligence is later separated.
- Formula: FORMULA NOT VALIDATED.
- Consumers: Product, Compensation, Manager, Forecast, Business Planning when rules support.

### Prima Conservada

- Final owner: Conservation Intelligence.
- Formula: FORMULA NOT VALIDATED.
- Consumers: Compensation, Forecast, Business Planning.

### Prima por Conservar

- Final owner: Conservation Intelligence.
- Formula: FORMULA NOT VALIDATED.
- Consumers: Advisor Experience, Business Planning, Forecast, Manager.

### Policy Quality

- Final owner: Conservation Intelligence.
- Consumers: Productivity, Portfolio, Manager, Forecast, Business Planning.

### Conservation Risk

- Final owner: Conservation Intelligence.
- Consumers: Advisor Experience, Manager, Productivity, Forecast, Business Planning.


## 6. Conservation Event Model

### Fact Events

- POLICY_PAID.
- POLICY_CANCELLED.
- POLICY_REINSTATED.
- PAYMENT_POSTED.

### Owner

- Production Events foundation.

### Conservation use

- Input for conservation interpretation.

### Snapshot Events

- LIMRA_SNAPSHOT_RECEIVED.
- IGC_SNAPSHOT_RECEIVED.
- PERSISTENCY_SNAPSHOT_CREATED.
- CONSERVATION_SNAPSHOT_CREATED.

### Owner

- Conservation Intelligence.

### Trigger

- Official report received, local snapshot created, or period evaluation occurs.

### Interpretation Events

- CONSERVATION_RISK_DETECTED.
- POLICY_QUALITY_RISK_DETECTED.
- CONSERVATION_TREND_CHANGED.
- CONSERVATION_BLOCKER_DETECTED.

### Owner

- Conservation Intelligence.

### Trigger

- New facts, reports, lagged indexes, policy status changes or risk signals alter conservation interpretation.

### Correction Events

- CONSERVATION_CORRECTION_RECEIVED.
- INDEX_REPORTED_LATE.
- POLICY_REINSTATEMENT_APPLIED.
- CANCELLATION_CORRECTED.

### Owner

- Source/fact owner for underlying fact.
- Conservation Intelligence for updated interpretation.

### Locked rule

- Corrections do not mutate history silently.


## 7. Conservation Period Model

### Policy Age Month

- Policy lifecycle age used for persistency and eligibility.

### Index Reporting Month

- Month in which an official LIMRA/IGC or conservation index is reported.

### Conservation Curve Month

- Conceptual maturity curve for conservation durability.

### Persistence Month

- Persistence window marker.
- Threshold/formula not validated.

### Reporting Period

- Source-reported period.

### Evaluation Period

- Period used by Forge or Rule Pack to evaluate conservation.

### Correction Period

- Period in which late report, reinstatement or correction is applied.

### Locked rule

- Conservation has multiple clocks.
- Every snapshot must preserve the clock used.


## 8. Conservation Snapshot Model

### Policy Conservation Snapshot

- Captures conservation state of a single policy.

### Advisor Conservation Snapshot

- Captures advisor-level conservation interpretation.

### Portfolio Conservation Snapshot

- Captures grouped policy/portfolio conservation state.

### LIMRA Snapshot

- Captures LIMRA status, source, period, confidence and formula status.

### IGC Snapshot

- Captures IGC status, source, period, confidence and formula status.

### Conservation Risk Snapshot

- Captures risk state, evidence, confidence and local/official boundary.

### Quality-adjusted Productivity Snapshot input

- Conservation output consumed by Productivity.

### Snapshot owner

- Conservation Intelligence.

### Snapshot rules

- Snapshots are interpretations.
- Snapshots must preserve evidence and provenance.
- Snapshots must preserve period context.
- Snapshots must preserve local predictive vs institutional confirmed status.
- Historical snapshots must not be overwritten silently.


## 9. Local Predictive vs Institutional Historical Boundary

### Local Predictive Conservation

- Early action-oriented signal.
- May use payment behavior, servicing gaps, local policy status, renewal risk, cancellation warnings and relationship context.
- Requires confidence labeling.

### Institutional Historical Conservation

- Official or source-backed confirmation.
- Includes official LIMRA, official IGC, carrier snapshots and official reports.

### Locked rule

- Local predictive signals may trigger action.
- Institutional historical snapshots confirm official outcomes.
- Local predictive signals cannot be used as official LIMRA/IGC unless Rule Pack and evidence explicitly allow.


## 10. LIMRA / IGC Boundary

### LIMRA

- Conservation index.
- External/institutional snapshot.
- May be lagged.
- Formula not validated.

### IGC

- Conservation index.
- External/institutional snapshot.
- May be lagged.
- May represent mature portfolio or different population.
- Formula not validated.

### Locked boundary

- LIMRA and IGC are not the same metric.
- Exact population and formulas are REVIEW REQUIRED.
- Both are owned by Conservation Intelligence.
- Other domains consume snapshots.


## 11. Conservation to Productivity Boundary

### Productivity owns

- Activity-to-output conversion.
- Repeatable production output.
- Productive Advisor Capacity signal.

### Conservation owns

- Durability and quality of that output.

### Productivity consumes

- Policy quality signal.
- Conservation risk.
- Persistency snapshot.
- LIMRA/IGC where relevant.

### Locked rule

- Conservation may update productivity quality interpretation.
- It must not silently mutate historical productivity snapshots.


## 12. Conservation to Compensation Boundary

### Compensation owns

- Money calculation.
- Commission explanation.
- Bonus explanation.
- Payment/reversal/adjustment explanation.

### Conservation owns

- Conservation metrics and snapshots.

### Rule Pack owns

- Whether conservation affects compensation.
- Formula/threshold/eligibility.

### Locked rule

- Compensation consumes Conservation.
- Compensation does not calculate Conservation.
- Late conservation reports require correction/recalculation path, not silent mutation.


## 13. Conservation to Manager Compensation Boundary

### Manager Compensation owns

- Manager payout interpretation.

### Conservation owns

- Unit/advisor LIMRA, IGC, persistency and conservation snapshots.

### Manager Compensation consumes

- Official snapshots when rules require.
- Dependency status when reports are pending.

### Locked rule

- Manager Compensation must not calculate LIMRA/IGC.
- Manager Compensation must label pending, local predictive and official conservation states.


## 14. Conservation to Forecast Boundary

### Forecast owns

- Forecast suggestions.

### Conservation owns

- Conservation risk and confirmed quality.

### Forecast consumes

- Local predictive conservation risk.
- Official conservation snapshots.
- Conservation confidence.
- Reporting lag.

### Locked rule

- Forecast must not project fragile production as durable without conservation context.
- Forecast must not present local conservation risk as official index.


## 15. Conservation to Business Planning Boundary

### Business Planning owns

- Goal to Forecast to Gap to Actions.

### Conservation provides

- Risk signals.
- Policy quality alerts.
- Conservation blockers.
- Pending report dependencies.

### Business Planning may recommend

- Service policy at risk.
- Contact client.
- Review payment behavior.
- Prioritize reinstatement opportunity.
- Adjust plan confidence.

### Locked rule

- Business Planning consumes Conservation but does not own conservation metrics.


## 16. Advisor and Manager Alert Boundary

### Advisor alerts may include

- Policy at conservation risk.
- Payment behavior risk.
- Lapse/cancellation risk.
- Reinstatement opportunity.
- Production quality pending confirmation.

### Manager alerts may include

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

### Locked rule

- Alerts do not invent LIMRA/IGC.
- Alerts do not imply compensation outcome without Rule Pack.


## 17. Final Red Team

Risk: Alta produccion, baja conservacion.

- Mitigation: Productivity consumes quality signal; Compensation consumes official snapshots.

Risk: LIMRA arrives late.

- Mitigation: Separate Event Time, Reporting Time and Evaluation Time.

Risk: IGC contradicts local view.

- Mitigation: Preserve both views, label source and confidence.

Risk: Policy cancelled and reinstated.

- Mitigation: Correction events and reinstatement applied records.

Risk: Bonus calculated before official report.

- Mitigation: Pending dependency and Rule Pack recalculation path.

Risk: Advisor productive with poor conservation.

- Mitigation: Quality-adjusted productivity input.

Risk: Manager unit strong but weak IGC.

- Mitigation: Manager consumes official Conservation snapshots.

Risk: Forecast ignores conservation.

- Mitigation: Forecast consumes conservation risk and confidence.

Risk: Conservation confused with generic retention.

- Mitigation: Conservation owns policy/business durability; generic retention remains context-specific.


## 18. Architecture Lock Decision

### Decision

ARCHITECTURE LOCK

### Reason

- Ownership is clear.
- Non-ownership is clear.
- Boundaries with Production, Productivity, Compensation, Manager Compensation, Forecast and Business Planning are clear.
- Formula gaps are explicitly outside Forge Core and belong to Rule Pack or official evidence.
- Reporting lag model is sufficient for architecture lock.

### Not locked

- Official LIMRA formula.
- Official IGC formula.
- Exact persistence formulas.
- Exact siniestralidad formula.
- Exact LIMRA/IGC population.

These remain Rule Pack/evidence gaps, not Core ownership blockers.


## 19. Recommendations Before Engines or UI

- Do not implement Conservation engines before formulas and data sources are validated.
- Do not let Compensation calculate Conservation.
- Do not let Manager Compensation calculate Conservation.
- Do not let Productivity own Conservation.
- Do not expose LIMRA/IGC without source and confidence.
- Do not treat local predictive risk as official index.
- Do not mutate historical snapshots silently.
- Do not hardcode SMNYL conservation rules in Forge Core.
- Require RuleSnapshot and PeriodSnapshot for official conservation interpretations.
- Require EvidenceRecord and ProvenanceRecord for imported conservation reports.


## 20. Final Verdict

### PAQ-10.5 result

ARCHITECTURE LOCK

### Final locked definition

Conservation Intelligence is the Forge OS domain that owns conservation, persistency, quality and index interpretation for policy and portfolio durability, separating local predictive risk from institutional historical confirmation and providing governed signals to Productivity, Compensation, Manager Compensation, Forecast, Business Planning and Advisor Experience.

### Implementation status

NOT APPROVED

### Next recommended PAQ

Forecast Intelligence or Business Planning Intelligence.
