# PAQ-07 Foundation LOCK Review

## Repository References

- [FORGE_MASTER_BUILD_TREE.md](../../FORGE_MASTER_BUILD_TREE.md)
- [AGENTS.md](../../AGENTS.md)
- [FORGE_CONSTITUTION_V3.md](../../FORGE_CONSTITUTION_V3.md)
- [FORGE_FOUNDATION_LOCK.md](../archive/FORGE_FOUNDATION_LOCK.md)

---

PAQ 7
FOUNDATION LOCK REVIEW

### Mode
### Red Team Auditor

### Purpose

Attempt to break the provisional Forge foundation before it is declared locked.

This document is audit only.
It does not create code, engines, schemas, UI, implementation plans, new domains, new PAQs or commits.

### Review basis

- Shared Commercial Model Foundation.
- Identity & Attribution Hardening.
- Evidence & Provenance Foundation.
- Periods & Operational Clocks Hardening.
- Metrics Ownership Finalization.
- Rule Snapshot Hardening.
- Commercial Events Taxonomy.
- Universal Forge Core / Rule Pack constitutional boundary.


1. Executive Summary

The foundation is directionally strong but not ready for FOUNDATION LOCK.

### The model correctly identifies the major primitives

- CommercialPerson.
- CommercialAccount.
- CommercialRelationship.
- CommercialAssignment.
- CommercialAttribution.
- CommercialServicing.
- PolicyRole.
- SourceSystem.
- EvidenceRecord.
- ProvenanceRecord.
- PeriodSnapshot.
- RuleSnapshot.
- ProductionEvent.
- Commercial event taxonomy.
- Metrics ownership.

The biggest architectural improvement is the recognition that Forge Core must be universal and that company-specific career, compensation, contest, promotion, KPI, activity and recognition logic must live inside Rule Packs.

However, the current foundation still has lock-blocking risks.

The most serious risk is conceptual leakage from SMNYL Agency 2026 into Forge Core. The earlier documents repeatedly describe career, contest, compensation and manager compensation using SMNYL-specific examples. That is acceptable for discovery, but not acceptable for Core lock unless the final foundation explicitly treats those as Rule Pack content.

### Red Team verdict

FOUNDATION CANDIDATE, not FOUNDATION LOCK.

The foundation is not rejected. It is coherent enough to proceed as a candidate architecture. But locking it now would freeze unresolved boundaries around Rule Packs, universal Core semantics, historical explainability and cross-domain ownership.


2. Foundation Strengths

### The strongest parts of the model

1. It separates identity from role.

CommercialPerson is correctly treated as durable identity. Advisor, client, candidate, partner and manager are roles, not separate humans.

2. It separates account from person.

CommercialAccount is necessary for families, businesses, households and corporate accounts.

3. It separates assignment, attribution and servicing.

This is essential. Manager responsibility, commercial credit and operational attention are different concepts.

4. It makes Production Events factual.

This is the core architectural anchor. POLICY_PAID is a fact. Bonus eligibility is interpretation.

5. It recognizes RuleSnapshot as mandatory.

Historical explanations cannot survive without rule snapshots.

6. It recognizes multiple clocks.

Event Time, Effective Time, Reporting Time, Evaluation Time, Payment Time and Correction Time are necessary.

7. It introduces evidence and provenance.

Forge cannot say "no invented data" unless it can explain source, evidence, transformation and confidence.

8. It defines metric ownership.

One metric must have one owner. Other domains consume snapshots.

9. It separates events by semantic category.

Fact events, interpretation events, decision events, payment events and correction events are not interchangeable.

10. It now has a universal Core / Rule Pack boundary.

This is the strongest constitutional correction. SMNYL Agency 2026 is a Rule Pack, not Forge.


3. Foundation Weaknesses

1. Rule Pack boundary is not yet fully propagated.

The previous PAQs still speak as if Forge Core owns contest groups, TA, Bono Inicial, LIMRA, IGC, Productividad and other SMNYL-specific concepts. Those must be reframed as examples from a Rule Pack.

2. Core vs Rule Pack ownership is still ambiguous.

### Core should own the mechanism

- events;
- persons;
- accounts;
- evidence;
- provenance;
- periods;
- snapshots;
- rule pack execution context;
- metric ownership contracts.

### Rule Packs should own

- carrier-specific career paths;
- contest logic;
- compensation logic;
- promotion rules;
- KPI definitions;
- recognition programs;
- activity definitions;
- qualification thresholds.

The current documents do not always enforce that boundary.

3. Metric ownership assumes domain ownership, but some domains should not own company-specific metrics in Core.

### For example

- Contest Intelligence should not own "Prima Meta" universally.
- It should own the universal concept of ruled contest metric resolution.
- The SMNYL Agency 2026 Rule Pack owns Prima Meta as a specific metric.

4. RuleSnapshot lacks explicit Rule Pack context.

RuleSnapshot cannot only say domain, version and effective dates. It must also be tied to carrier, distribution channel and rule pack identity.

5. Event taxonomy lacks Rule Pack interpretation boundary.

Production Events are universal, but many interpretation events are Rule Pack outputs. The model must not let Core create SMNYL-specific event names as universal events.

6. Historical explanations require Rule Pack preservation.

In 2032, Forge cannot explain a 2026 SMNYL bonus unless it preserved the exact SMNYL Agency 2026 Rule Pack version and its source documents.

7. Product Knowledge boundary remains fragile.

Carrier product knowledge, product availability, commission schedules and contest eligibility may vary by carrier, channel and year. The current foundation separates product and commission, but must also separate Core product identity from Rule Pack product interpretation.

8. Advisor Experience could leak Rule Pack-specific metrics.

Benvenù or Clippy could display "Prima Meta" as if universal. That would violate universal Core.

9. Economic Motivation is dangerous without Rule Pack scoping.

"You could earn $12,000 more" is only valid under a specific carrier/channel/rule pack/period/evidence context.

10. Command OS can execute commands over ambiguous context.

If a command says "show my bonus gap", Core must know which Rule Pack interpretation applies. Otherwise it may show a non-universal metric as if universal.


4. Contradictions Found

### Contradiction 1

The foundation says Forge Core is universal, but previous metric ownership language assigns specific metrics like Prima Meta, Bono Inicial and Productividad to Core domains.

### Red Team impact

This violates the new constitutional boundary.

### Correct interpretation

Core owns universal metric contracts and ownership mechanism.
Rule Packs define carrier/channel-specific metrics.


### Contradiction 2

The foundation says Production Events are facts, but some event chains imply POLICY_PAID generates CONTEST_QUALIFIED directly.

### Red Team impact

That skips Rule Pack interpretation.

### Correct interpretation

POLICY_PAID is universal.
Rule Pack interprets it into contest qualification.


### Contradiction 3

Advisor Experience is supposed to be universal, but Benvenù may introduce company-specific metrics.

### Red Team impact

If Advisor Experience hardcodes SMNYL metrics, Core becomes carrier-specific.


### Contradiction 4

Metrics ownership says Contest Intelligence owns contest metrics, but the constitution says contests live in Rule Packs.

### Red Team impact

Contest Intelligence cannot own SMNYL contest definitions in Core.

### Correct interpretation

Contest Intelligence owns universal contest interpretation surface.
Rule Pack owns contest rule content.


### Contradiction 5

Manager Compensation Intelligence is treated as a domain owner of Productividad, Actividad, Conexion and Desarrollo.

### Red Team impact

Those concepts may not exist in every carrier/channel. They are Rule Pack-specific.


### Contradiction 6

Rule Taxonomy defines many rule categories, but does not explicitly put them under Carrier -> Distribution Channel -> Rule Pack -> Rules.

### Red Team impact

Rules may become global by accident.


5. Ownership Conflicts

### Conflict 1

Core domain vs Rule Pack ownership.

### Example

Contest Intelligence appears to own Prima Meta.

### Audit finding

Core Contest Intelligence must not own Prima Meta as a universal concept. SMNYL Agency 2026 Rule Pack may define Prima Meta.


### Conflict 2

Conservation Intelligence vs Rule Pack for LIMRA/IGC.

### Audit finding

Core Conservation Intelligence can own the universal conservation snapshot mechanism. LIMRA/IGC definitions are Rule Pack or carrier/channel rules unless they are established as universal carrier-reported indexes with explicit source.


### Conflict 3

Manager Compensation Intelligence vs Rule Pack.

### Audit finding

Productividad, Apoyos, Alta Partner, Conexion and Desarrollo are not universal. They belong to a Rule Pack.


### Conflict 4

Economic Motivation vs Compensation/Rule Pack.

### Audit finding

Economic Motivation owns explanation guardrails only. It cannot own any carrier-specific financial metric or calculation.


### Conflict 5

Advisor Experience vs domain owners.

### Audit finding

Advisor Experience can present metrics. It cannot own carrier-specific setup metrics, contest terms or compensation terms.


### Conflict 6

Product Knowledge Library vs Rule Pack.

### Audit finding

Core product identity may be universal within carrier product catalog, but commission, contest eligibility and channel-specific product treatment belong to Rule Packs.


### Conflict 7

Revenue Intelligence vs Rule Pack activity definitions.

### Audit finding

Revenue can own opportunity and pipeline mechanics. Carrier/channel-specific activity KPIs must be Rule Pack content.


6. Time Conflicts

### Conflict 1

Rule Effective Date vs Rule Pack Effective Date.

If a Rule Pack is effective 2026 but a rule inside it is corrected mid-year, both clocks matter.


### Conflict 2

Carrier publication date vs Forge ingestion date.

Forge may receive official documents late. Historical explanation must preserve what Forge knew when it made a decision.


### Conflict 3

Rule correction retroactive to a period already paid.

Without explicit recalculation/finality policy, Forge cannot know whether to change historical outcomes.


### Conflict 4

Promotion mid-period.

Career role, assignment and Rule Pack interpretation may change at different times.


### Conflict 5

Multiple Rule Packs active for one person.

An advisor may have policies, contests or compensation under multiple carriers/channels over time. Core must not assume one active Rule Pack globally.


### Conflict 6

Index reporting lag vs payment period.

Compensation may be paid before conservation index is reported. The foundation must preserve provisional vs final interpretation.


### Conflict 7

Late production import after period close.

Without late event policy, Forge cannot explain why production did or did not count.


7. Attribution Conflicts

### Conflict 1

Connection Attribution vs Referral Attribution.

If a client refers a candidate who later becomes advisor, one relationship may create multiple attribution meanings.


### Conflict 2

Development Attribution vs Manager Assignment.

A partner may develop an advisor while a different manager supervises them.


### Conflict 3

Production Attribution vs Compensation Attribution.

The originator of a sale may not be the person who receives commission under the active Rule Pack.


### Conflict 4

Servicing vs Advisor of Record.

The person servicing a policy may differ from the formal advisor of record and originator.


### Conflict 5

Manager Attribution across assignment change.

Manager changes mid-quarter require period-specific manager attribution snapshots.


### Conflict 6

Rule Pack-specific attribution.

One carrier/channel may allow split attribution. Another may not. Core must not assume split behavior.


### Conflict 7

Retroactive attribution correction.

If attribution changes after payment, the model needs explicit impact on compensation, historical explanation and audit trail.


8. Event Conflicts

### Conflict 1

Carrier-specific interpretation events in Core.

Events like BONUS_GMM_QUALIFIED or TA_EARNED may be SMNYL-specific. Core should not treat them as universal event types.


### Conflict 2

Generic event names remain ambiguous.

### Examples

### - Limra_updated.
### - Client_assigned.
### - Connection_established.
### - Bonus_calculated.

They hide whether the event is fact, interpretation, decision, payment or correction.


### Conflict 3

Source event vs Forge event.

COMMISSION_REVERSED can mean source reversal or Forge-created reversal. The taxonomy requires distinction, but not all names enforce it.


### Conflict 4

Snapshot events vs state.

BASELINE_CREATED and LIMRA_SNAPSHOT_CREATED are events about snapshots, not the snapshots themselves.


### Conflict 5

Command events imply action success.

COMMAND_EXECUTED does not mean the business action succeeded.


### Conflict 6

Experience events confused with business events.

FEATURE_LEARNED does not prove sales skill or commercial execution.


9. Rule Conflicts

### Conflict 1

RuleSnapshot lacks mandatory Rule Pack identity.

### Historical explanation must know

- carrier;
- distribution channel;
- rule pack;
- rule pack version;
- rule version;
- source document;
- effective period.


### Conflict 2

Two versions active simultaneously.

Without applicability priority, Forge may pick the wrong rule.


### Conflict 3

Office-specific rules.

If a Rule Pack has office variants, RuleSnapshot must include scope and applicability.


### Conflict 4

Segment-specific rules.

Career stage, advisor class or channel segment can change rule applicability.


### Conflict 5

Product-specific rules.

Product rules, commission rules and contest eligibility rules can diverge across years and channels.


### Conflict 6

Rule corrected after decision.

The model knows corrections exist, but foundation lock requires explicit rule finality and recalculation policy.


### Conflict 7

Rule Pack is unavailable in future.

Forge must preserve enough of the Rule Pack content to explain decisions even if source docs disappear.


10. Historical Explanation Failures

### Failure 1

"Why did I receive this bonus?"

### Forge can answer only if it preserved

- production facts;
- attribution;
- period snapshots;
- Rule Pack snapshot;
- contest/compensation rule snapshot;
- evidence;
- calculation snapshot;
- payment event.

### Current risk

If Rule Pack identity is missing, explanation becomes carrier-specific guesswork.


### Failure 2

"Why did I not receive this bonus?"

Forge needs blockers under the active Rule Pack.

### Current risk

If ineligible metrics were not snapshotted, Forge may recalculate with current rules.


### Failure 3

"Why did my group change?"

Forge needs career stage, contest group rule, period and Rule Pack version.

### Current risk

Core may assume group is universal.


### Failure 4

"Why did my productivity change?"

Forge needs to know whether productivity means manager PCV metric, behavior metric or another Rule Pack KPI.

### Current risk

The word Productividad is overloaded.


### Failure 5

"Why did my LIMRA change?"

Forge needs source report, reporting period, conservation rule, correction history and Rule Pack/carrier context.

### Current risk

LIMRA may be treated as universal when it may be carrier-specific.


### Failure 6

"Why was this commission reversed?"

Forge needs source reversal, Forge reversal, cancellation/reinstatement, compensation rule and payment history.

### Current risk

COMMISSION_REVERSED is ambiguous.


### Failure 7

"Why does this client belong to this advisor?"

Forge needs relationship, assignment, servicing and attribution history.

### Current risk

If CLIENT_ASSIGNED is generic, explanation fails.


### Failure 8

"Why does this manager receive credit?"

Forge needs manager attribution snapshot, assignment period and Rule Pack rules.

### Current risk

Assignment may be mistaken for attribution.


### Failure 9

"Why does this partner receive connection?"

Forge needs connection attribution, development attribution distinction, source evidence and Rule Pack interpretation.

### Current risk

Referral, connection and recruitment attribution may collapse.


11. Scalability Concerns

### 100 advisors

The model is manageable if event names and owners are disciplined.

### Risk

Manual ambiguity may be tolerable at small scale and hide foundation flaws.


1,000 advisors:

Attribution, assignment changes, duplicated persons and late events become common.

### Risk

Without strict event and period semantics, dashboards diverge.


10,000 advisors:

Rule Pack scoping becomes mandatory.

### Risk

Carrier/channel/year-specific rules cannot live in Core. Any hardcoding becomes unmaintainable.


### Decades of events

Historical explanation depends on immutable snapshots, evidence, provenance and rule pack preservation.

### Risk

If snapshots are only pointers to current definitions, history breaks.


### Multiple rule versions

Requires applicability resolution and conflict handling.

### Risk

Two active rules may produce different valid answers.


### Multiple managers/offices

Assignment and manager attribution must be period-specific.

### Risk

Production gets credited to the wrong manager.


### Multiple products

Product knowledge, commission schedules and contest eligibility must remain separate.

### Risk

Current product rules leak into historical policies.


### Multiple carriers/channels

This is the key scale test.

### Risk

Without Rule Packs, Forge becomes SMNYL-specific and cannot scale to AXA, GNP, MetLife or other channels.


12. Constitution Alignment

### The foundation aligns with

### El mejor asesor para asesores

Yes, if it preserves truth and explanation.

### Risk

Over-complexity may slow advisor value if not hidden behind clear outputs.


### Advisor First

Aligned.

### Risk

Manager compensation details could dominate if Advisor Experience consumes manager-first metrics without advisor relevance.


### Decision Clarity First

Aligned.

### Risk

Too many snapshots/rules/events can produce explanations that are technically correct but not clear.


### Economic Clarity

Aligned.

### Risk

Economic Motivation may overstate estimates unless Rule Pack and confidence context are mandatory.


### Value Before Work

Partially aligned.

### Risk

Evidence/provenance requirements may create capture burden unless Forge infers from source documents.


### Learning By Doing

Aligned for Advisor Experience.

### Risk

Feature learning may be confused with commercial skill.


### Production Events Principle

Strongly aligned.

### Risk

Interpretation events must not become disguised facts.


Benvenù Principle:

Aligned only if Benvenù is universal and not SMNYL-specific.


### Clippy Principle

Aligned only if Clippy displays official owner snapshots and never unofficial metrics.


### Candy Crush Experience Principle

Aligned.

### Risk

Adaptive difficulty must not alter Rule Pack truths or business thresholds.


### Universal Core / Rule Pack Constitution

Currently the biggest alignment gap.

### The foundation must explicitly state

Forge Core owns universal primitives.
Rule Packs own carrier/channel-specific commercial interpretation.


13. Critical Risks

1. SMNYL Agency 2026 concepts leak into Forge Core.
2. RuleSnapshot lacks explicit Rule Pack identity.
3. Contest metrics are treated as universal instead of Rule Pack-defined.
4. Manager compensation metrics are treated as universal.
5. LIMRA/IGC are treated as universal without carrier/source context.
6. Productividad remains overloaded.
7. Actividad remains overloaded.
8. Bonus events are named after carrier-specific programs.
9. Advisor Experience displays Rule Pack metrics as Core concepts.
10. Economic Motivation estimates money without Rule Pack scope.
11. Command OS executes metric commands without active Rule Pack context.
12. Assignment still gets mistaken for attribution in explanations.
13. Servicing still gets mistaken for ownership.
14. Late events and corrections lack finality policy.
15. Historical explanations fail if Rule Pack content is not preserved.
16. Multiple carriers/channels create conflicting definitions of the same term.
17. Core domains become too specific and block future carriers.
18. Rule Pack version conflicts are unresolved.
19. Evidence/provenance burden may be skipped under UI pressure.
20. Current documents are provisional but may be mistaken for locked architecture.


14. Mandatory Fixes Before Lock

### 1. Explicitly update the foundation principle

Forge Core is universal.
Rule Packs interpret facts.

### 2. Add Rule Pack identity to RuleSnapshot requirements

- carrier;
- distribution channel;
- rule pack;
- rule pack version;
- rule family;
- rule version;
- source document.

3. Reclassify all SMNYL-specific metrics as Rule Pack metrics, not Core metrics.

### Examples

- Prima Meta.
- Bono Inicial.
- Bono Renovacion.
- Bono GMM.
- TA.
- Productividad PCV.
- Apoyos.
- Alta Partner.
- LIMRA/IGC if carrier/channel-specific.

4. Define Core-owned universal metric contracts separately from Rule Pack-owned metric definitions.

5. Define that Core domains apply Rule Pack outputs; they do not hardcode carrier logic.

6. Add active Rule Pack context to every rule-based interpretation.

7. Add active Rule Pack context to Economic Motivation outputs.

8. Add active Rule Pack context to Advisor Experience metric display.

9. Add active Rule Pack context to Command OS metric/action commands.

### 10. Rename or qualify ambiguous metric/event names

- Productividad.
- Actividad.
- Conexion.
- Desarrollo.
- Qualified.
- Bonus.
- Group.

11. Ensure historical explanation includes Rule Pack snapshot.

12. Preserve Rule Pack source documents or extracted rule content for future audit.

13. Enforce no Core hardcoding of carrier/channel/career/contest/promotions/KPIs/recognition.

14. Confirm assignment, attribution and servicing cannot be inferred from each other.

15. Confirm fact, interpretation, decision, payment and correction event categories cannot be mixed.

16. Confirm finality/recalculation policy exists for late events and retroactive corrections.

17. Confirm Product Knowledge, Commission Schedule and Rule Pack eligibility are separate.

18. Confirm Advisor Baseline is aggregate only, not source of truth.

19. Confirm Clippy cannot show unofficial or unowned metrics.

20. Confirm Foundation documents clearly mark SMNYL Agency 2026 as first validated Rule Pack, not Forge Core.


15. Final Verdict

FOUNDATION CANDIDATE

Not FOUNDATION LOCK.

Not FOUNDATION REJECTED.

Not FOUNDATION HARDENING REQUIRED if the Rule Pack boundary is accepted as the final correction before lock.

### Reason

The architecture is coherent, comprehensive and directionally strong.

### It has addressed the biggest internal modeling risks

- identity;
- account;
- attribution;
- servicing;
- evidence;
- provenance;
- clocks;
- metrics ownership;
- rule snapshots;
- events taxonomy.

However, the late constitutional clarification changes the lock criteria.

Forge Core must be universal.

The current foundation still carries too much SMNYL-specific language in places where the lock-level architecture must say "Rule Pack-defined".

The foundation can be considered a candidate once the documents are interpreted as:

- Core universal primitives;
- SMNYL Agency 2026 as first Rule Pack validation example;
- all company/channel-specific metrics and rules moved conceptually into Rule Packs.

Lock is unsafe until that boundary is explicitly reflected.


16. Architectural Score

8.2/10.

### Score rationale

### Strengths

- Strong primitive separation.
- Strong event discipline.
- Strong evidence/provenance direction.
- Strong time model.
- Strong metrics ownership direction.
- Strong historical explanation requirements.
- Strong RuleSnapshot direction.

### Major deduction

- Rule Pack boundary is not fully integrated into the foundation language.

### Secondary deductions

- Several terms remain carrier-specific or overloaded.
- Historical explanations depend on Rule Pack preservation not yet fully stated.
- Finality/recalculation policy remains conceptual but not lock-ready.
- Command OS and Advisor Experience require stricter active Rule Pack context.

### Lock recommendation

Do not sign FOUNDATION LOCK yet.

### Sign FOUNDATION CANDIDATE with a required condition

All final foundation documents must explicitly state that Forge Core owns universal primitives and Rule Packs own carrier/channel-specific interpretation.

SMNYL Agency 2026 is the first validated Rule Pack.

It is not Forge.
