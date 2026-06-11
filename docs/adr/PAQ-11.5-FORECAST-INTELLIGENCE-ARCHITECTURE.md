# PAQ-11.5 Forecast Intelligence Architecture v1.0

Status: ARCHITECTURE LOCK CANDIDATE

Scope: Documentation and domain architecture only.

Implementation status: NOT APPROVED.

No code. No engines. No schemas. No UI. No app.js.

Cross references:

- [FORGE_MASTER_BUILD_TREE.md](../../FORGE_MASTER_BUILD_TREE.md)
- [AGENTS.md](../../AGENTS.md)
- [FORGE_CONSTITUTION_V3.md](../../FORGE_CONSTITUTION_V3.md)
- [PAQ-11-FORECAST-INTELLIGENCE-DISCOVERY.txt](PAQ-11-FORECAST-INTELLIGENCE-DISCOVERY.txt)
- [PAQ-11-FORECAST-INTELLIGENCE-MARKDOWN-REVIEW.txt](PAQ-11-FORECAST-INTELLIGENCE-MARKDOWN-REVIEW.txt)
- [PAQ-09.5-PRODUCTIVITY-INTELLIGENCE-ARCHITECTURE-LOCK.md](PAQ-09.5-PRODUCTIVITY-INTELLIGENCE-ARCHITECTURE-LOCK.md)
- [PAQ-10.5-CONSERVATION-INTELLIGENCE-ARCHITECTURE-LOCK.md](PAQ-10.5-CONSERVATION-INTELLIGENCE-ARCHITECTURE-LOCK.md)

## 1. Executive Summary

Forecast Intelligence is the Forge OS domain responsible for estimating what may happen next using evidence-backed signals, period context, assumptions, confidence and upstream interpretations.

PAQ-11 established Forecast Intelligence as an ARCHITECTURE CANDIDATE because its boundary is now clear:

- Mick explains whether execution behavior is happening.
- Productivity Intelligence explains whether behavior and pipeline movement are becoming repeatable output.
- Conservation Intelligence explains whether that output is durable, healthy and persistent.
- Revenue Intelligence explains where commercial opportunity may come from.
- Compensation Intelligence explains confirmed or rule-backed money under Rule Packs.
- Business Planning Intelligence decides what should be done with a forecast gap.
- Forecast Intelligence estimates what may happen next.

Core decision:

- Forecasts are suggestions.
- Facts are facts.
- Forecast outputs are interpretations, not Production Events.
- Forecast outputs must never be presented as institutional truth, guaranteed income, confirmed production, confirmed qualification or confirmed compensation.

PAQ-11.5 consolidates the Forecast domain map, ownership, snapshots, period model, confidence model, scenarios, Economic Motivation boundaries, risks and validation checklist needed before declaring Forecast Intelligence fully LOCKED.

## 2. Architecture Decision

Decision:

- Forecast Intelligence is a valid Forge OS domain.
- Forecast Intelligence is approved as ARCHITECTURE LOCK CANDIDATE.
- Implementation remains NOT APPROVED.

Reasoning:

- The domain has distinct ownership.
- Upstream dependencies are explicit.
- It does not own facts, money, pipeline, productivity, conservation or business plans.
- It produces future-facing interpretations with evidence, assumptions, confidence and period context.
- It is required before Business Planning Intelligence can be safely formalized.

Not yet final LOCK until:

- Forecast Metric Ownership Map is reviewed against current metrics governance.
- Period and snapshot model are validated against Career Month, Semester Month, Policy Age Month and Reporting Month.
- Confidence and scenario language is approved by architecture/product.
- Economic Motivation boundary is red-teamed against compensation promises.
- Cross-domain stress tests are documented and accepted.

## 3. Domain Map

### 3.1 Forecast Intelligence Responsibilities

Forecast Intelligence is responsible for:

- Forecast interpretation.
- Forecast snapshots.
- Forecast risk.
- Forecast confidence.
- Forecast assumptions.
- Forecast scenarios.
- Forecast explanation.
- Forecast gap signals.
- Forecast dependency warnings.
- Forecast correction when prior assumptions are invalidated.

Forecast Intelligence answers:

- What may happen?
- What outcome is at risk?
- What future gap may appear?
- What assumptions drive the estimate?
- What evidence supports or weakens the estimate?
- What confidence does Forge have?
- What dependency could make the forecast wrong?

### 3.2 Forecast Intelligence Inputs

Forecast consumes signals from upstream owners. It must not recalculate them.

- Mick Behavior Intelligence:
  - Execution trajectory.
  - Behavior risk.
  - Activity pattern changes.
  - Risk: confusing behavior with future output.

- Productivity Intelligence:
  - Productivity trend.
  - Productivity bottleneck.
  - Activity-to-output conversion.
  - Productive Advisor Capacity signal.
  - Productivity risk.
  - Risk: treating current productivity as guaranteed future production.

- Conservation Intelligence:
  - Conservation risk.
  - Policy quality signal.
  - LIMRA snapshot when available.
  - IGC snapshot when available.
  - Persistency snapshot when available.
  - Local predictive conservation vs institutional historical conservation state.
  - Risk: treating local risk as official truth.

- Revenue Intelligence:
  - Revenue pipeline.
  - Opportunity state.
  - Pipeline aging.
  - Pipeline movement.
  - Risk: treating pipeline as forecast.

- Production Events:
  - Source-backed commercial facts.
  - Policy and production events.
  - Corrections and late events.
  - Risk: projecting without facts.

- Compensation Intelligence:
  - Rule-backed compensation context when available.
  - Confirmed compensation remains outside Forecast.
  - Risk: turning forecast into income promise.

- Career Intelligence:
  - Career stage.
  - Career Month.
  - Career rules when applicable.
  - Risk: ignoring stage-specific assumptions.

- Advisor Development Intelligence:
  - Development readiness.
  - First production readiness.
  - Productive Advisor Capacity bridge context.
  - Risk: forecasting durable productivity from incomplete development.

- Business Planning Intelligence:
  - Business goals when available.
  - Planning targets when approved.
  - Risk: confusing forecast with plan.

- Shared Commercial Model:
  - RuleSnapshot.
  - PeriodSnapshot.
  - EvidenceRecord.
  - ProvenanceRecord.
  - SourceSystem.
  - Attribution context.
  - Product line context when applicable.

### 3.3 Forecast Intelligence Outputs

Forecast produces:

- Advisor Forecast Snapshot.
- Manager Forecast Snapshot.
- Partner Forecast Snapshot.
- Unit Forecast Snapshot.
- Pipeline Forecast Snapshot.
- Production Forecast.
- Conservation-adjusted Forecast Snapshot.
- Forecast Risk Snapshot.
- Forecast Confidence Snapshot.
- Forecast Assumption Snapshot.
- Forecast explanation.
- Forecast gap signal.
- Forecast dependency warning.
- Forecast correction event.

Output rules:

- Outputs are suggestions, not facts.
- Outputs must include period, evidence state, assumptions and confidence.
- Outputs must label local predictive vs institutionally confirmed state.
- Outputs must never overwrite Production Events.
- Outputs must not silently mutate prior snapshots.

### 3.4 Forecast Intelligence Dependencies

Critical dependencies:

- Productivity Intelligence.
- Conservation Intelligence.
- Revenue Intelligence.
- Compensation Intelligence.
- Business Planning Intelligence.
- Mick Behavior Intelligence.
- Production Events.
- RuleSnapshot.
- PeriodSnapshot.
- EvidenceRecord.
- ProvenanceRecord.
- SourceSystem.

Dependency principle:

- Forecast consumes domain-owned signals.
- Forecast produces future-facing interpretation.
- Forecast does not own upstream facts, upstream metrics or downstream action plans.

## 4. Ownership of Metrics and Snapshots

### 4.1 Metrics Owned by Forecast Intelligence

Forecast Intelligence owns only forecast-specific interpretations:

- Forecast risk.
- Forecast confidence.
- Forecast gap signal.
- Forecast dependency warning.
- Forecast assumption state.
- Forecast scenario state.
- Forecast explanation state.

These are not raw business facts. They are interpretation metrics.

### 4.2 Snapshots Owned by Forecast Intelligence

Forecast Intelligence owns:

- Advisor Forecast Snapshot.
- Manager Forecast Snapshot.
- Partner Forecast Snapshot.
- Unit Forecast Snapshot.
- Pipeline Forecast Snapshot.
- Conservation-adjusted Forecast Snapshot.
- Forecast Risk Snapshot.
- Forecast Confidence Snapshot.
- Forecast Assumption Snapshot.

Every Forecast snapshot must preserve:

- Period.
- Scope.
- Evidence.
- Source.
- Assumptions.
- Confidence.
- Local predictive vs institutional confirmed state.
- RuleSnapshot reference when rules apply.
- PeriodSnapshot reference.
- Upstream input snapshot references.
- Correction reference when applicable.

### 4.3 Metrics Not Owned by Forecast Intelligence

Forecast Intelligence does not own:

- Production Events.
- Behavior signals.
- Tasks.
- Activity facts.
- Productivity metrics.
- Conservation metrics.
- Revenue opportunities.
- Compensation calculations.
- Confirmed income.
- Business plans.
- Career stage.
- Manager actions.
- Advisor Experience learning states.
- Rule Pack thresholds.

### 4.4 Ownership Guardrail

No metric without an owner.

One metric has one conceptual owner.

Forecast may consume a metric, but must not recalculate or re-own it.

This aligns with [AGENTS.md](../../AGENTS.md) metric ownership guidance and the constitutional separation between facts, forecasts and interpretations in [FORGE_CONSTITUTION_V3.md](../../FORGE_CONSTITUTION_V3.md).

## 5. Period Model

Forecast must support multiple operational clocks without merging them into a single timeline.

### 5.1 Monthly Forecast

Purpose:

- Near-term trajectory review.
- Advisor and manager coaching.
- Current pipeline and productivity evaluation.

Inputs:

- Production Events.
- Productivity signals.
- Pipeline movement.
- Conservation risk.
- Mick behavior signals.

Risks:

- Compensation and conservation lag.
- Late Production Events.
- Local predictive signals may be incomplete.

### 5.2 Quarterly Forecast

Purpose:

- Manager and Partner review.
- Unit-level risk analysis.
- Business Planning cycle input.

Inputs:

- Monthly trends.
- Productivity.
- Conservation risk.
- Pipeline.
- Goals where available.

Risks:

- Official reports may arrive after quarter close.
- Manager may overreact to local predictive view.

### 5.3 Semester Forecast

Purpose:

- Medium-cycle planning.
- Career/contest/partner context where Rule Packs apply.
- Strategic capacity review.

Inputs:

- Productivity trend.
- Production facts.
- Conservation context.
- Career stage.
- Pipeline.
- RuleSnapshot when applicable.

Risks:

- Semester Month may differ from Career Month and Contest Month.
- Rule Pack boundaries may apply.

### 5.4 Career Month Relationship

Career Month belongs to Career Intelligence.

Forecast may consume Career Month to contextualize assumptions, but it must not calculate career stage or career qualification.

Risk:

- Forecast assumptions may be invalid if advisor stage is ignored.

### 5.5 Semester Month Relationship

Semester Month may affect contests, Training Allowance, compensation and partner context depending on Rule Pack.

Forecast may reference Semester Month only through PeriodSnapshot and RuleSnapshot.

Risk:

- Forecast may appear more precise than it is if semester rules are not validated.

### 5.6 Policy Age Month Relationship

Policy Age Month belongs to policy/conservation context.

Forecast may consume Policy Age Month when projecting durability or conservation-adjusted outlook.

Risk:

- Forecast may project fragile production as durable if Policy Age Month is ignored.

### 5.7 Reporting Month Relationship

Reporting Month governs institutional lag and official snapshots.

Forecast must distinguish:

- Local predictive view.
- Pending institutional confirmation.
- Institutionally confirmed outcome.
- Late correction.

Risk:

- Forecast can be wrong if Reporting Month is treated as Event Time.

## 6. Confidence Model

Forecast confidence is qualitative unless a future Rule Pack or validated model defines explicit thresholds.

No numeric thresholds are approved in PAQ-11.5.

### 6.1 High Confidence

Use when:

- Strong evidence exists.
- Source quality is stable.
- Period is clear.
- Upstream snapshots are current.
- Rules are available when money or qualification is referenced.
- Lag risk is low.

Guardrail:

- High confidence is still not a fact.

### 6.2 Medium Confidence

Use when:

- Some evidence exists.
- Assumptions are explicit.
- Source quality is acceptable but incomplete.
- Lag, attribution or conservation uncertainty remains.

Guardrail:

- Must explain missing or weak dependencies.

### 6.3 Low Confidence

Use when:

- Evidence is weak.
- Trend is unstable.
- Period is unclear.
- Source quality is incomplete.
- Reporting lag is significant.
- Upstream domains disagree.

Guardrail:

- Do not turn low-confidence forecasts into alerts that imply certainty.

### 6.4 Insufficient Evidence

Use when:

- Forge cannot responsibly estimate direction.
- Required evidence, period or upstream signal is missing.

Guardrail:

- Say evidence is insufficient.
- Do not invent forecast direction.

### 6.5 Pending Institutional Confirmation

Use when:

- Local predictive signal exists.
- Official reports, carrier snapshots or institutional evidence are pending.

Guardrail:

- Must not be labeled as confirmed.

## 7. Scenario Model

Forecast scenarios are conditional views. They are never official truth.

### 7.1 Expected Case

Definition:

- The most reasonable trajectory based on current evidence, upstream signals, period context and assumptions.

Requirements:

- Evidence state.
- Confidence.
- Assumption list.
- Dependency warning when applicable.

### 7.2 Best Case

Definition:

- Favorable trajectory if current positive assumptions hold and key risks do not materialize.

Guardrails:

- Must not imply guaranteed upside.
- Must not include income unless RuleSnapshot, Compensation context and Economic Motivation guardrails support it.

### 7.3 Worst Case

Definition:

- Defensive trajectory if risks materialize, pipeline stalls, productivity drops, conservation weakens or institutional reports contradict local signals.

Guardrails:

- Must avoid punitive language.
- Must lead to action, not fear.

### 7.4 Scenario Requirements

Every scenario must include:

- Scope.
- Period.
- Evidence.
- Confidence.
- Assumptions.
- Key dependencies.
- Local predictive vs confirmed state.
- Next action owner if it becomes a Business Planning input.

## 8. Economic Motivation Boundaries

Economic Motivation may consume Forecast only with strict guardrails.

### 8.1 Allowed Uses

Forecast may feed Economic Motivation when:

- Forecast gap is evidence-backed.
- Period is clear.
- Confidence is explicit.
- RuleSnapshot exists if money is mentioned.
- Compensation context supports the economic translation.
- Uncertainty is visible.

### 8.2 Prohibited Uses

Forecast must not:

- Invent income.
- Promise income.
- Guarantee bonuses.
- Project compensation without rules.
- Treat forecasted production as paid income.
- Treat projected qualification as confirmed qualification.
- Use local predictive signal as institutional truth.

### 8.3 Boundary with Compensation

Forecast does not calculate compensation.

Compensation Intelligence interprets money under Rule Packs.

Economic Motivation translates gaps to money only when evidence, rules, period and confidence support it.

### 8.4 Boundary with Business Planning

Forecast answers:

- What may happen?

Business Planning answers:

- What should we do?

Forecast gap may become a Business Planning input. It is not itself an action plan.

## 9. Critical Risks

### 9.1 Forecast Used as Fact

Risk:

- Advisor, manager or system treats forecast as confirmed result.

Impact:

- Bad decisions, trust loss and governance failure.

Guardrail:

- Always label forecast as suggestion, estimate or scenario.

### 9.2 Forecast Used as Compensation Promise

Risk:

- Forecasted production or gap becomes implied income guarantee.

Impact:

- Financial trust and compliance risk.

Guardrail:

- No economic output without RuleSnapshot, evidence, period and confidence.

### 9.3 Pipeline Confused with Forecast

Risk:

- Revenue opportunity is treated as likely production.

Impact:

- Overstated outlook.

Guardrail:

- Pipeline is input. Forecast is interpretation.

### 9.4 Productivity Confused with Forecast

Risk:

- Current Productive Advisor Capacity is treated as future output.

Impact:

- Fragile projection.

Guardrail:

- Forecast consumes productivity but evaluates future uncertainty.

### 9.5 Conservation Ignored

Risk:

- High production with weak conservation is projected as durable.

Impact:

- Overstated future health and money risk.

Guardrail:

- Conservation-adjusted forecast when durability matters.

### 9.6 Reporting Lag Ignored

Risk:

- Local predictive truth conflicts with institutional historical truth.

Impact:

- Forecast appears wrong without explanation.

Guardrail:

- Reporting Month and correction events must be preserved.

### 9.7 Feedback Loop with Mick or Manager Action

Risk:

- Forecast alert triggers action, action changes behavior, behavior changes Forecast repeatedly.

Impact:

- Alert noise and operational overload.

Guardrail:

- Period snapshots, throttled refresh and event/snapshot separation.

## 10. Weaknesses and Dangerous Dependencies

Known weaknesses before LOCK:

- Confidence model has no approved thresholds.
- Forecast refresh frequency is not finalized.
- Scenario language requires product/UX review.
- Business Planning dependency is not locked yet.
- Economic Motivation translation rules are not fully validated for Forecast.
- Forecast can become noisy if alert boundaries are not hardened.
- Rule Pack impact on forecasted qualification remains REVIEW REQUIRED.
- Forecast may be over-trusted by managers without training and Advisor Experience framing.

Dangerous dependencies:

- Compensation rules unavailable.
- Conservation reports lagged or contradictory.
- Pipeline incomplete or stale.
- Productivity snapshots stale.
- Mick behavior signals noisy.
- Attribution unresolved.
- Product line context missing.
- Business goals manually captured without evidence.

## 11. Recommendations Before LOCKED

Required before declaring full ARCHITECTURE LOCK:

- Finalize Forecast Metric Ownership Map.
- Validate Forecast Period Model against all relevant operational clocks.
- Approve Snapshot retention and correction behavior.
- Approve qualitative confidence language.
- Define scenario language guardrails.
- Red-team Economic Motivation translation.
- Confirm that Business Planning consumes Forecast but does not recalculate it.
- Confirm that Manager and Partner Intelligence consume Forecast but do not own it.
- Confirm that Forecast does not create Production Events.
- Confirm that Forecast does not calculate compensation.
- Confirm that Forecast alerts include evidence, confidence, source owner and next action.

Implementation remains blocked until:

- PAQ-11.5 is accepted as ARCHITECTURE LOCK.
- Build Tree reflects locked status.
- Engines/UI/schemas are explicitly approved in a separate implementation PAQ.

## 12. Validation Checklist

### 12.1 Domain Boundary Validation

- Forecast does not own Production Events.
- Forecast does not own Mick behavior signals.
- Forecast does not own Productivity metrics.
- Forecast does not own Conservation metrics.
- Forecast does not own Revenue opportunities.
- Forecast does not own Compensation calculations.
- Forecast does not own Business plans.
- Forecast owns forecast interpretation and forecast snapshots only.

### 12.2 Snapshot Validation

- Every snapshot has period.
- Every snapshot has evidence state.
- Every snapshot has confidence.
- Every snapshot has assumptions.
- Every snapshot has local predictive vs confirmed status.
- Every snapshot references RuleSnapshot when rules apply.
- Prior snapshots are not silently overwritten.
- Corrections create explicit correction references.

### 12.3 Period Validation

- Monthly forecast does not replace Career Month.
- Quarterly forecast does not replace Manager Compensation Quarter.
- Semester forecast does not replace Semester Month.
- Policy Age Month remains Conservation/Policy context.
- Reporting Month remains institutional reporting context.
- Event Time, Reporting Time and Correction Time remain distinct.

### 12.4 Economic Validation

- No invented income.
- No guaranteed income.
- No bonus projection without Compensation rules.
- No money translation without RuleSnapshot.
- No economic output without evidence and confidence.
- Unknown values remain unknown.

### 12.5 Advisor and Manager Alert Validation

- Alert states what changed.
- Alert states why it matters.
- Alert states evidence status.
- Alert states confidence.
- Alert labels local predictive vs confirmed.
- Alert identifies domain owner of source signal.
- Alert provides next best action or routes to Business Planning.
- Alert is not punitive.

## 13. Required Testing and Red Team Scenarios

Testing is conceptual at this stage. No code tests are approved by this PAQ.

Future implementation PAQ must include stress tests for:

- High pipeline, low productivity.
- High productivity, weak conservation.
- High activity, no output.
- Low activity, one large case.
- Forecast says on track, official report later contradicts.
- Manager treats forecast as fact.
- Advisor treats forecast as guaranteed income.
- Forecast ignores product mix.
- Forecast ignores policy cancellation.
- Forecast ignores reporting lag.
- Forecast creates too many alerts.
- Forecast loops with Mick or Manager action.
- Forecast gap is translated to money without RuleSnapshot.
- Business Planning recalculates Forecast.
- Compensation consumes Forecast as confirmed income.
- Conservation correction invalidates prior forecast assumption.

Each test must verify:

- Failure mode.
- Expected domain owner.
- Evidence status.
- Confidence behavior.
- Correction behavior.
- Boundary preservation.

## 14. Integration Preparation

### 14.1 Compensation Integration

Forecast may provide context only.

Compensation owns confirmed money interpretation under Rule Packs.

Economic Motivation may translate forecast gaps to money only under approved evidence/rules/confidence guardrails.

### 14.2 Mick Integration

Mick owns behavior and execution signals.

Forecast consumes behavior trends but must not convert behavior into future output without Productivity context.

### 14.3 Revenue Integration

Revenue owns opportunities and pipeline context.

Forecast consumes pipeline and estimates materialization risk.

### 14.4 Command OS Integration

Command OS may expose forecast queries or actions only after Forecast is locked and implementation is approved.

Command OS must not generate forecast logic.

It must route to Forecast Intelligence outputs and preserve confidence/evidence labels.

## 15. Final Verdict

Forecast Intelligence is architecturally valid and necessary.

PAQ-11 Discovery is complete.

PAQ-11.5 establishes the lock candidate model.

Final status:

- Forecast Intelligence: ARCHITECTURE LOCK CANDIDATE.
- Implementation: NOT APPROVED.
- Engines: NOT APPROVED.
- Schemas: NOT APPROVED.
- UI: NOT APPROVED.
- app.js: NOT TOUCHED.

Recommended next action:

- Review PAQ-11.5 risks and checklist.
- If accepted, update Build Tree status to ARCHITECTURE LOCK in a later ratification step.
- Then open Business Planning Intelligence as the next dependent domain.
