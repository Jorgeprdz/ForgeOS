# PAQ-06 Commercial Events Taxonomy

## Repository References

- [FORGE_MASTER_BUILD_TREE.md](../../FORGE_MASTER_BUILD_TREE.md)
- [AGENTS.md](../../AGENTS.md)
- [FORGE_CONSTITUTION_V3.md](../../FORGE_CONSTITUTION_V3.md)
- [FORGE_FOUNDATION_LOCK.md](../archive/FORGE_FOUNDATION_LOCK.md)

---

PAQ 6
### Commercial Events Taxonomy

### Purpose

Define the canonical conceptual event taxonomy for Forge OS.

This document is architecture only.
It does not create code, engines, schemas, UI, implementation plans or commits.

### Core principle

Events are records that something happened, was decided, was interpreted, was paid, was corrected or was experienced.

Events must not collapse facts, interpretations, payments, decisions, snapshots and corrections into one generic category.

Forge must preserve event meaning so it can explain any historical fact, decision, payment, attribution, correction or interpretation within 10 years.


1. Event Definition

An event is a time-bound record that something meaningful happened in Forge or in a source system.

### An event must answer

- what happened;
- when it happened;
- who or what it affected;
- what source or evidence supports it;
- what domain owns the event meaning;
- whether it is a fact, interpretation, decision, payment, correction, system action or experience signal;
- what prior events, rules, evidence or snapshots it depends on.


### What is an event

- A policy was issued.
- A policy was paid.
- A commission was posted.
- An advisor connected.
- A contest qualification was evaluated.
- A bonus was accrued.
- A bonus was paid.
- LIMRA was reported.
- Attribution was assigned.
- Servicing changed.
- A command was executed.
- A feature was learned.
- A correction was applied.


### What is NOT an event

### Metric

### Example
Advisor has 4 paid policies.

Metrics are values derived from facts, rules and periods.

### Rule

### Example
GMM counts as 0.5 for a contest.

Rules interpret events.

### Snapshot

### Example
ContestPolicyCountSnapshot for Semester 1.

Snapshots capture state or metric at a period boundary.

### State

### Example
Advisor is in Development.

State may be produced by events, but it is not the event itself.

### Interpretation

### Example
Advisor qualified for Bono Inicial.

Interpretation can be recorded as an interpretation event, but the conclusion itself is not a raw fact.

### Recommendation

### Example
Contact this client today.

Recommendation may produce a recommendation event, but it is not a production fact.

### Prediction

### Example
Advisor may earn $12,000 more.

Prediction is forecast/interpretation, not fact.


### Boundary rule

Events are historical records.
Metrics are values.
Rules are decision constraints.
Snapshots are preserved state.
Interpretations are results of applying rules.
Recommendations are suggested actions.
Predictions are future-oriented estimates.


2. Event Taxonomy

Forge needs official event categories.

### Canonical categories

### Fact Event

Records a fact from the commercial world or a source system.

### Examples

### - Policy_issued.
### - Policy_paid.
### - Policy_cancelled.
### - Commission_posted.
### - Contract_signed.
### - Source_record_received.


### Interpretation Event

Records the result of applying rules or logic to facts.

### Examples

### - Contest_qualified.
### - Contest_group_assigned.
### - Limra_applied.
### - Policy_count_updated.
### - Advisor_class_determined.


### Decision Event

Records a domain decision or eligibility determination.

### Examples

### - Bonus_eligibility_approved.
### - Precontract_ready.
### - Advisor_compensation_qualified.
### - Team_compensation_qualified.


### Payment Event

Records money movement, accrual, payment, reversal or financial posting.

### Examples

### - Commission_accrued.
### - Commission_paid.
### - Bonus_accrued.
### - Bonus_paid.
### - Payment_reversed.


### Correction Event

Records correction, override, invalidation, recalculation or reversal of prior facts or outputs.

### Examples

### - Event_corrected.
### - Manual_override_applied.
### - Source_correction_received.
### - Bonus_recalculated.
### - Event_invalidated.


### System Event

Records internal system action or operational command.

### Examples

### - Command_executed.
### - Import_completed.
### - Rule_snapshot_applied.
### - Period_closed.


### Experience Event

Records adoption, learning, contextual help or advisor experience progression.

### Examples

### - Feature_introduced.
### - Feature_tried.
### - Feature_learned.
### - Help_dismissed.
### - Benvenu_completed.


### Relationship Event

Records relationship, referral, servicing or client interaction changes.

### Examples

### - Referral_created.
### - Client_contacted.
### - Relationship_updated.
### - Servicing_assigned.


### Attribution Event

Records commercial credit, origin, split, manager attribution or development attribution.

### Examples

### - Attribution_assigned.
### - Attribution_changed.
### - Connection_attribution_assigned.
### - Development_attribution_assigned.


### Lifecycle Event

Records role, career, recruitment or stage movement.

### Examples

### - Advisor_connected.
### - Stage_changed.
### - Class_changed.
### - Partner_promoted.


### Event families

- Production Events.
- Career Events.
- Contest Events.
- Compensation Events.
- Conservation Events.
- Revenue Events.
- Relationship Events.
- Recruitment Events.
- Advisor Experience Events.
- Manager Compensation Events.
- Command OS Events.
- Evidence and Provenance Events.
- Rule Events.
- Period Events.


3. Fact vs Interpretation Model

### Fact events

Fact events record something that happened outside or inside Forge and can be supported by evidence or source system record.

### Examples

### - Policy_paid.
### - Policy_cancelled.
### - Contract_signed.
### - Carrier_report_received.
### - Commission_posted.

Fact events do not decide eligibility.


### Interpretation events

Interpretation events record a conclusion produced by applying rules to facts.

### Examples

### - Contest_policy_count_updated.
### - Contest_qualified.
### - Advisor_class_determined.
### - Limra_applied_to_period.

Interpretation events require RuleSnapshot and PeriodSnapshot.


### Decision events

Decision events record acceptance, approval, qualification or readiness.

### Examples

### - Bonus_eligibility_approved.
### - Precontract_ready.
### - Advisor_compensation_qualified.

Decision events usually depend on interpretation events.


### Payment events

Payment events record money state changes.

### Examples

### - Bonus_accrued.
### - Bonus_paid.
### - Commission_reversed.

Payment events require compensation rule and financial provenance.


### Correction events

Correction events record change to prior event meaning, validity, amount or attribution.

### Examples

### - Event_corrected.
### - Bonus_recalculated.
### - Attribution_corrected.

Correction events do not erase the original event.


### System events

System events record operational actions.

### Examples

### - Command_executed.
### - Period_closed.
### - Import_completed.


### Experience events

Experience events record learning, discovery or advisor interaction signals.

### Examples

### - Feature_learned.
### - Help_accepted.
### - Baseline_created.


### Classification examples

POLICY_PAID:
### Fact Event.

POLICY_CANCELLED:
### Fact Event.

CONTEST_QUALIFIED:
INTERPRETATION EVENT or DECISION EVENT depending on finality.

BONUS_CALCULATED:
### Interpretation Event.

BONUS_PAID:
### Payment Event.

LIMRA_UPDATED:
INTERPRETATION EVENT or SNAPSHOT EVENT. It is not a raw fact unless it is directly "carrier report received".

IGC_UPDATED:
INTERPRETATION EVENT or SNAPSHOT EVENT. It is not raw fact unless it records a reported index.

COMMAND_EXECUTED:
### System Event.

HELP_DISMISSED:
### Experience Event.


### Rule

The event name should make the event type obvious. If a name can mean fact and interpretation, rename it.


4. Production Events Model

Production Events are fact events that record commercial production facts.

They are the protected foundation for compensation, contest, conservation, revenue and manager intelligence.


### Policy_issued

### Category
### Fact Event.

### Meaning
A policy was issued by the carrier or source system.

### Immutable
Conceptually yes. If wrong, create correction or invalidation event.

### Does not mean

- policy is paid;
- policy counts for contest;
- policy generated commission;
- policy is conserved;
- advisor earned bonus.


### Policy_paid

### Category
### Fact Event.

### Meaning
A payment or first receipt was paid according to source system.

### Immutable
Conceptually yes. Corrections create new events.

### Does not mean

- policy counts for contest;
- commission was paid;
- bonus was earned;
- conservation is satisfied.


### Policy_cancelled

### Category
### Fact Event.

### Meaning
A policy cancellation occurred or was reported.

### Immutable
Original cancellation event is preserved.

### May generate

- conservation interpretation;
- contest recalculation;
- compensation reversal;
- revenue risk;
- relationship alert.


### Policy_reinstated

### Category
### Fact Event.

### Meaning
A policy was reinstated or rehabilitated.

### Does not mean

- it becomes new production;
- prior cancellation disappears;
- bonus automatically restores.

### Requires

- rule snapshot for impact.


### Commission_posted

### Category
FACT EVENT from financial/source system.

### Meaning
Commission was posted by source system.

### Does not mean

- Forge calculated commission;
- commission is final;
- contest qualification is met.


### Commission_reversed

### Category
FACT EVENT or PAYMENT EVENT depending on source.

### If from source system
### Fact Event.

### If generated by Forge payment logic
### Payment Event / Correction Event.

### Recommendation
### Use distinct names

### - Source_commission_reversal_posted.
### - Forge_commission_reversal_created.


### Derived events from Production Events

### - Policy_count_updated.
### - Contest_policy_count_updated.
### - Production_snapshot_created.
### - Conservation_risk_detected.
### - Compensation_recalculation_required.

These are not production facts. They are interpretations or system events.


5. Contest Events Model

Contest Events are mostly interpretation or decision events.

They are not raw facts.

They apply contest rules to production, career, conservation, period and attribution context.


### Group_assigned

### Category
### Interpretation Event.

### Meaning
Contest group was determined under a rule snapshot.

### Requires

- Contest RuleSnapshot.
- PeriodSnapshot.
- Source metrics.

### Does not mean

- group is permanent;
- group applies to all periods.


### Ta_qualified

### Category
INTERPRETATION EVENT or DECISION EVENT.

### Meaning
Advisor met Training Allowance criteria for period.

### If preliminary
### Interpretation Event.

### If closed/approved
### Decision Event.


### Ta_earned

### Category
### Decision Event.

### Meaning
Training Allowance was earned for a period.

### May generate

### - Bonus_calculated.
### - Bonus_accrued.
- Manager TA dependency update.


### Bonus_initial_qualified

### Category
INTERPRETATION EVENT or DECISION EVENT.

### Meaning
Advisor qualified for Bono Inicial under contest rule.

### Does not mean

- bonus was paid;
- accrual happened;
- no later recalculation is possible.


### Bonus_renewal_qualified

### Category
INTERPRETATION EVENT or DECISION EVENT.

### Meaning
Advisor qualified for Bono Renovacion.

### Depends on

- Bono Inicial calculated relationship;
- renewal metrics;
- IGC/conservation rule if applicable.


### Bonus_gmm_qualified

### Category
INTERPRETATION EVENT or DECISION EVENT.

### Meaning
Advisor qualified for GMM contest bonus.

### Depends on

- GMM product rules;
- period;
- premium rules;
- siniestralidad if applicable.


### Contest event invariant

Contest Events require RuleSnapshot.
Contest Events require PeriodSnapshot.
Contest Events consume Production Events.
Contest Events do not replace Production Events.


6. Compensation Events Model

Compensation Events record financial calculation, accrual, payment, reversal and recalculation.

They may depend on Contest Events, Production Events, RuleSnapshots and PeriodSnapshots.


### Commission_calculated

### Category
### Interpretation Event.

### Meaning
Forge calculated commission using commission rules.

### Depends on

- Production events.
- Product rules.
- Commission RuleSnapshot.
- Policy age.
- PeriodSnapshot.


### Commission_accrued

### Category
PAYMENT EVENT or FINANCIAL RESULT EVENT.

### Meaning
Commission became accrued according to compensation rules.

### Does not mean

- commission was paid.


### Commission_paid

### Category
### Payment Event.

### Meaning
Commission was paid.

### Requires

- Payment Time.
- Evidence/provenance.


### Commission_reversed

### Category
### Payment Event / Correction Event.

### Meaning
Previously accrued or paid commission was reversed.

### Does not erase

- original commission calculated;
- original commission paid event.


### Bonus_calculated

### Category
### Interpretation Event.

### Meaning
Forge calculated bonus amount.

### Depends on

- Contest result if contest bonus.
- Manager compensation result if manager bonus.
- Compensation rule.


### Bonus_accrued

### Category
### Payment Event / Financial Result Event.

### Meaning
Bonus became accrued.

### Does not mean

- bonus was paid.


### Bonus_paid

### Category
### Payment Event.

### Meaning
Bonus was paid.

### Must preserve

- payment period;
- payment evidence;
- amount;
- related accrual.


### Bonus_recalculated

### Category
### Correction Event / Interpretation Event.

### Meaning
Bonus was recalculated due to correction, rule change, late event or reversal.

### Must preserve

- prior calculation;
- new calculation;
- reason;
- rule snapshot;
- correction time.


### Relationships

Production Event
feeds Commission Calculated.

Contest Event
feeds Bonus Calculated.

Bonus Calculated
feeds Bonus Accrued.

Bonus Accrued
feeds Bonus Paid.

Correction Event
may generate Bonus Recalculated or Bonus Reversed.


7. Career Events Model

Career Events record commercial lifecycle movement.

They are owned by Career Intelligence unless they belong to pre-advisor recruitment lifecycle.


### Connection_established

### Category
### Lifecycle Event.

### Meaning
Commercial connection as advisor was established.

### Potential ambiguity
May mean contract signed, advisor alta, connection date or contest date in different documents.

### Recommendation
### Use more precise events

### - Contract_signed.
### - Advisor_connected.
### - Advisor_alta_recorded.
### - Contest_date_assigned.


### Contest_date_assigned

### Category
### Lifecycle Event / Interpretation Event.

### Meaning
Contest start date was assigned under career/contest rules.

### Requires

- RuleSnapshot.
- Evidence/provenance.


### Stage_changed

### Category
### Lifecycle Event.

### Meaning
Commercial career stage changed.

### Examples

- Precontract to Advisor.
- Advisor in Development to New Professional.
- Advisor to Partner.

### Requires

- effective time;
- prior stage;
- new stage;
- rule/provenance.


### Class_changed

### Category
### Interpretation Event / Lifecycle Event.

### Meaning
Advisor class changed under rule.

### Examples

- CC to 1C.
- 1C to 2C.
- Development to NP.


### Partner_promoted

### Category
### Lifecycle Event.

### Meaning
Advisor was promoted to Partner.

### May generate

- role assignment;
- manager compensation attribution;
- Alta Partner eligibility;
- new assignment.


### Career vs Recruitment

### Recruitment owns

- candidate created;
- application started;
- interview completed;
- candidate selected;
- precontract started;
- key activated;
- precontract ready.

### Career owns

- advisor connected;
- contest date assigned;
- stage changed after advisor path;
- class changed;
- partner promoted;
- manager/director role transitions.

### Boundary

AdvisorConversion bridges Recruitment and Career.


8. Conservation Events Model

Conservation Events are mostly interpretation, snapshot or reporting events.

They are not raw production facts unless they record source report receipt.


### Limra_updated

### Category
### Interpretation Event / Snapshot Event.

### Meaning
LIMRA value was updated, calculated or reported.

### Better names

### - Limra_report_received.
### - Limra_snapshot_created.
### - Limra_applied_to_period.

### Reason
The current name is ambiguous.


### Igc_updated

### Category
### Interpretation Event / Snapshot Event.

### Better names

### - Igc_report_received.
### - Igc_snapshot_created.
### - Igc_applied_to_period.


### Persistency_updated

### Category
### Snapshot Event / Interpretation Event.

### Meaning
Persistency measurement updated for a period.

### Requires

- policy population;
- policy age;
- reporting/evaluation period.


### Conservation_updated

### Category
### Snapshot Event / Interpretation Event.

### Meaning
Conservation measurement updated.

### Ambiguity
Too generic. Should specify premium conservation, policy conservation, LIMRA, IGC or persistency.


### Loss_ratio_updated

### Category
### Snapshot Event / Interpretation Event.

### Meaning
Siniestralidad/loss ratio snapshot updated.

### Requires

- claims evidence;
- premium base;
- period;
- product/business line.


### Conservation invariant

### Conservation Events must distinguish

- report received;
- metric calculated;
- snapshot created;
- value applied to compensation/contest period;
- correction received.


9. Relationship & Attribution Events Model

Relationship and attribution events must not be collapsed.


### Client_assigned

### Category
ASSIGNMENT EVENT or SERVICING EVENT.

Ambiguous.

### Recommendation
### Use precise names

### - Client_servicing_assigned.
### - Account_servicing_assigned.
### - Client_manager_assignment_started.


### Client_transferred

### Category
### Servicing Event / Assignment Event.

### Meaning
Responsibility for client/account transferred.

### Does not mean

- attribution changed;
- originator changed;
- compensation recipient changed.


### Attribution_assigned

### Category
### Attribution Event.

### Meaning
Credit/origin/split attribution assigned.

### Requires

- attribution type;
- attributed person/unit;
- subject;
- event/result;
- effective period;
- evidence/provenance.


### Attribution_changed

### Category
### Correction Event / Attribution Event.

### Meaning
Attribution changed prospectively or retroactively.

### Must preserve

- previous attribution;
- new attribution;
- reason;
- correction time;
- impact.


### Servicing_assigned

### Category
### Servicing Event.

### Meaning
Operational servicing responsibility assigned.

### Does not mean

- commercial credit;
- commission recipient;
- advisor of record.


### Servicing_changed

### Category
### Servicing Event.

### Meaning
Servicing responsibility changed.

### Preserves

- previous servicing period;
- new servicing period.


### Referral_created

### Category
RELATIONSHIP EVENT / ATTRIBUTION EVENT depending on use.

### If it records relationship
### Relationship Event.

### If it assigns commercial credit
### Attribution Event.

### Recommendation
### Use

### - Referral_relationship_created.
### - Referral_attribution_assigned.


### Taxonomy rule

Relationship explains connection.
Assignment explains formal responsibility.
Attribution explains credit.
Servicing explains operational care.


10. Advisor Experience Events Model

Advisor Experience Events record adoption, discovery, learning and help interaction.

They are real events but not business facts.


### Feature_introduced

### Category
### Experience Event.

### Meaning
Forge introduced a feature to the advisor.

### Does not mean

- advisor learned the feature;
- advisor used it;
- advisor accepted it.


### Feature_tried

### Category
### Experience Event.

### Meaning
Advisor attempted to use a feature.

### May generate

- feature learning state transition.


### Feature_learned

### Category
### Experience Event / Interpretation Event.

### Meaning
Forge determined the advisor learned a feature.

### Requires

- behavior evidence;
- learning rule;
- prior attempts or completion.

Not a raw fact.


### Help_dismissed

### Category
### Experience Event.

### Meaning
Advisor dismissed help.

### Does not mean

- advisor learned;
- help is irrelevant forever.


### Help_accepted

### Category
### Experience Event.

### Meaning
Advisor accepted help or acted on it.

### May contribute to

- feature learning state;
- contextual help suppression.


### Baseline_created

### Category
### Experience Event / Snapshot Event.

### Meaning
Advisor baseline snapshot was created.

### Does not mean

- baseline owns metrics;
- metrics are current forever.


### Benvenu_completed

### Category
### Experience Event.

### Meaning
Advisor completed the first experience.

### May generate

- baseline snapshot;
- first action;
- command introduction;
- revenue introduction.


### Event vs state

FEATURE_LEARNED event records transition.

Feature Learning State is current/preserved state.

HELP_DISMISSED event records action.

Suppressed state is resulting state.


11. Event Lifecycle Model

### Events are born from

- source system import;
- user/manager action;
- system calculation;
- rule application;
- payment posting;
- correction;
- command execution;
- advisor experience interaction.


### Event layers

Layer 1: Source / Fact Events

### Examples

### - Policy_paid.
### - Contract_signed.
### - Carrier_report_received.


Layer 2: Normalization / Provenance Events

### Examples

### - Field_parsed.
### - Product_detected.
### - Source_record_normalized.


Layer 3: Interpretation Events

### Examples

### - Policy_count_updated.
### - Contest_group_assigned.
### - Limra_snapshot_created.


Layer 4: Decision Events

### Examples

### - Contest_qualified.
### - Advisor_compensation_qualified.
### - Bonus_eligibility_approved.


Layer 5: Financial Events

### Examples

### - Bonus_calculated.
### - Bonus_accrued.
### - Bonus_paid.


Layer 6: Action / Experience Events

### Examples

### - Command_executed.
### - Help_accepted.
### - Feature_learned.


Layer 7: Correction Events

### Examples

### - Event_corrected.
### - Bonus_recalculated.
### - Attribution_corrected.


### Example lifecycle

### Policy_paid

### Generates or contributes to

### - Raw_policy_count_updated.
### - Contest_policy_count_updated.
### - Contest_qualified.
### - Bonus_calculated.
### - Bonus_accrued.
### - Bonus_paid.

### But

Each downstream event is separate.
Each downstream event has its own owner, rule, period and provenance.


### Lifecycle invariants

- Events should be append-only conceptually.
- Later events can correct or invalidate prior events.
- Later events do not delete prior events.
- Derived events must reference source events.
- Interpretation events must reference rules.
- Payment events must reference financial evidence.
- Correction events must reference what they correct.


12. Correction Model

A prior event should not be modified silently.

Corrections must create new events.


### Event correction

Use when an event value was wrong.

### Example
POLICY_PAID amount was imported incorrectly.

### Creates
EVENT_CORRECTED or POLICY_PAYMENT_CORRECTED.

### Preserves
original event.


### Reversal

Use when a financial or production effect is reversed.

### Example
COMMISSION_REVERSED or BONUS_REVERSED.

### Does not erase
original commission or bonus event.


### Recalculation

Use when a calculated result changes due to new facts, corrected facts or rule correction.

### Example
### Bonus_recalculated.

### Preserves
prior calculation and new calculation.


### Override

Use when an authorized person or process overrides a value or decision.

### Requires

- authority;
- reason;
- evidence;
- provenance;
- effective time;
- correction time.


### Invalidation

Use when event should no longer be considered valid.

### Example
duplicate import, fraudulent record, invalid source.

### Preserves
invalidated event.


Can an event be modified?

Conceptually no.

Operational systems may update records, but the domain model must preserve event history.


### Correction invariants

- Original event remains explainable.
- Correction event references original event.
- Correction event has correction time.
- Correction event has reason and source.
- Downstream impacts are explicit.
- Recalculation creates new interpretation/payment events.


13. Riesgos críticos

1. POLICY_PAID used directly as contest qualification.
2. BONUS_PAID used to infer bonus eligibility.
3. LIMRA_UPDATED hides whether value was reported, calculated or applied.
4. CLIENT_ASSIGNED hides assignment vs servicing.
5. REFERRAL_CREATED hides relationship vs attribution.
6. FEATURE_LEARNED treated as raw behavior fact.
7. COMMISSION_REVERSED hides source reversal vs Forge reversal.
8. POLICY_REINSTATED treated as new production.
9. CONTEST_QUALIFIED created without RuleSnapshot.
10. BONUS_CALCULATED created without PeriodSnapshot.
11. Payment event overwrites accrual event.
12. Recalculation overwrites original calculation.
13. Correction modifies original event silently.
14. Late import uses reporting time as event time.
15. Duplicate event counted twice.
16. Invalid event not preserved with invalidation reason.
17. Event without evidence supports financial output.
18. Contradictory evidence produces two active facts without resolution.
19. Command OS executes on stale interpretation event.
20. Advisor Experience displays unofficial derived event.
21. Career event merges contract signed, advisor alta and contest date.
22. Manager assignment change reattributes old events.
23. Attribution correction recalculates payment without trace.
24. Conservation update applies wrong reporting month.
25. Generic event names hide domain ownership.


14. Recomendaciones obligatorias

1. Define official event categories before Foundation Lock.
2. Ban generic event names that hide meaning.
3. Separate fact events from interpretation events.
4. Separate decision events from payment events.
5. Separate correction events from reversal events.
6. Separate relationship events from attribution events.
7. Separate assignment events from servicing events.
8. Separate source report received from metric updated.
9. Preserve original events conceptually.
10. Corrections must create new events.
11. Recalculations must create new events.
12. Reversals must create new events.
13. Invalidations must preserve invalidated event.
14. Interpretation events must reference RuleSnapshot.
15. Interpretation events must reference PeriodSnapshot.
16. Payment events must reference financial evidence/provenance.
17. Derived events must reference source events.
18. Late imports must preserve both Event Time and Reporting Time.
19. Duplicate event handling must be defined.
20. Event ownership must be assigned by domain.
21. Career events must be split into precise lifecycle events.
22. Conservation events must distinguish report, snapshot and application.
23. Advisor Experience events must not become business facts.
24. Command OS events must not imply business success unless downstream event confirms it.
25. Red Team scenarios must pass before Foundation Lock.


15. ¿Está listo para FOUNDATION LOCK?

No.

### Status
FOUNDATION HARDENING REQUIRED.

The Shared Commercial Model cannot be locked until Commercial Events Taxonomy is formalized.

### Ready for FOUNDATION CANDIDATE when

- event definition is accepted;
- canonical event categories are accepted;
- event ownership is accepted;
- production events are separated from downstream interpretations;
- compensation events distinguish calculation, accrual, payment, reversal and recalculation;
- relationship, assignment, servicing and attribution events are separated;
- correction model is accepted.

### Ready for FOUNDATION LOCK only if the event model survives

1. POLICY_PAID corregido.
2. BONO recalculado.
3. Regla corregida.
4. Cambio de atribucion.
5. Cambio de manager.
6. Poliza rehabilitada.
7. Comision revertida.
8. Evento duplicado.
9. Evento importado tarde.
10. Evento invalido.
11. Evento sin evidencia.
12. Evento con evidencia contradictoria.

### Verdict

Forge cannot explain its commercial intelligence unless it knows what kind of event it is dealing with.

The event taxonomy is foundational because every future calculation, recommendation, payment, correction, attribution and learning signal depends on events being semantically clean.


16. Calificación arquitectónica

8/10.

The direction is strong and now has enough conceptual separation to support Foundation Candidate.

It is not yet Foundation Lock because event names, ownership and correction semantics must be formally incorporated into the Shared Commercial Model.

### Critical remaining hardening

- exact event naming discipline;
- event owner by family;
- correction and invalidation semantics;
- late import handling;
- duplicate event handling;
- conservation report vs snapshot distinction;
- career lifecycle precision;
- relationship vs attribution vs servicing split.

Once these are formalized, Forge can preserve event history and explain decisions without collapsing facts, interpretations and payments into the same conceptual bucket.
