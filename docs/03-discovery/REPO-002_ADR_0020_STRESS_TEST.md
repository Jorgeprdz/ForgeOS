# REPO-002 ADR-0020 Stress Test

Report ID: REPO-002
Status: ARCHITECTURE DISCOVERY
Subject: Adversarial stress test before ADR-0020 Repository Domain Structure
Method: Assume REPO-001 is wrong; attempt to destroy the architecture.

---

## 1. Executive Verdict

ADR-0020 should not be ratified as written.

Verdict:

B. Ratify with modifications.

The proposed repository architecture survives the stress test only if ADR-0020 is strengthened from a folder proposal into a governance system.

The strongest surviving principle is:

> A file may serve multiple domains, but it must have one accountable owner for the truth, decision, rule, evidence contract or runtime capability it protects.

The weakest parts of the current ADR-0020 direction are:

- Shared Intelligence can become `misc/` unless entry rules are strict.
- Legacy can become a landfill unless aging and escalation are mandatory.
- Repository health metrics can become vanity metrics unless each metric is tied to a governance action.
- Folder migration can become activity theater unless success is measured by reduced ambiguity, reduced coupling and preserved behavior.

---

## 2. Question 1: Domain Collapse Test

Attack:

"Advisor OS, Manager OS and Shared Intelligence are artificial categories. A file can belong to multiple domains simultaneously. Ownership is an illusion."

### 2.1 Is single ownership actually possible?

Single use is not possible.

Single accountable ownership is possible and required.

A file can be consumed by multiple domains. It can produce outputs used by Advisor OS, Manager OS, Compensation and Product Intelligence. But the official truth inside the file must have one owner.

Examples:

| File Type | Multiple Consumers? | Single Owner? | Why |
| --- | --- | --- | --- |
| Mick behavior signal | Yes | Mick / behavior owner | Advisor and Manager may consume it, but only one domain defines the behavior truth. |
| Product rule | Yes | Product Intelligence or Rule Pack | Advisor, Policy and Compensation consume it, but they do not redefine product truth. |
| Paid premium fact | Yes | Policy / Economic Evidence owner | Compensation and Manager consume it, but they cannot invent payment truth. |
| Allocation recommendation | Yes | Manager OS / Andrey | Advisor OS may provide evidence, but does not own resource allocation. |

Conclusion:

Single ownership is not "only one domain can use it." Single ownership means one domain is accountable for meaning, correction, test contract and official output.

### 2.2 What breaks if files have multiple owners?

Multiple owners create silent conflict.

Failure modes:

- Two domains fix the same bug in opposite ways.
- One domain renames a metric and another keeps using the old semantic.
- Advisor OS shows a recommendation that Manager OS treats as a governance veto.
- Compensation recalculates a metric that Rule Packs should interpret.
- Product Intelligence treats policy state as product truth.
- Shared modules accumulate special cases because no one can say no.

The existing source ownership registry already encodes the warning: ownership is not validity, and ambiguous ownership must block strong output.

### 2.3 Can constitutional ownership survive real implementation?

Yes, but only with enforcement.

Required enforcement:

1. Every domain-owned module declares an owner.
2. Every cross-domain consumer uses public outputs, not private internals.
3. Ambiguous owner states block official output.
4. Tests validate owner/consumer boundaries.
5. ADR-0020 defines allowed dependency directions.
6. Repository health reports detect drift.

Survival verdict:

Domain ownership survives if "owner" means accountable source of truth, not exclusive use.

---

## 3. Question 2: Shared Intelligence Attack

Attack:

"Shared Intelligence will become a garbage dump. Every team eventually creates a shared folder that becomes impossible to govern."

### 3.1 Why Shared Intelligence does not become misc/

Shared Intelligence survives only if it is defined by primitives, not convenience.

Shared is not:

- Helpers
- Random utilities
- Cross-domain shortcuts
- Files that no one wants
- Business logic with many consumers
- A place to avoid choosing an owner

Shared is:

- Evidence primitives
- Identity primitives
- Provenance contracts
- Metric contracts
- Snapshot contracts
- Commercial event contracts
- Cross-domain financial primitives
- Source ownership and interpretation guardrails

### 3.2 Rules that prevent Shared from absorbing everything

Required Shared entry rules:

1. Shared files must have at least two domain consumers or one constitutional foundation role.
2. Shared files must not own final customer-facing decisions.
3. Shared files must not contain carrier/channel-specific rule logic.
4. Shared files must not contain advisor-specific or manager-specific recommendation language.
5. Shared files must expose contracts, primitives or normalized facts, not workflow actions.
6. Shared files must declare owner, consumers and prohibited reinterpretations.
7. Any domain-specific branch inside Shared must trigger extraction review.

### 3.3 Evidence required before a file enters Shared

| Evidence | Required Standard |
| --- | --- |
| Consumer proof | At least two actual or approved domain consumers |
| Primitive proof | The file defines a reusable fact, contract, snapshot, evidence rule or normalized value |
| Non-decision proof | It does not produce final Advisor or Manager action |
| Rule-pack proof | It does not hardcode carrier/channel-specific rules |
| Test proof | Shared behavior has boundary tests |
| Ownership proof | One conceptual owner is named |
| Reinterpretation proof | Known misuse cases are documented or blocked |

Stress verdict:

Shared Intelligence survives only as a constitutional foundation layer. Without entry gates, it fails and becomes `misc/`.

---

## 4. Question 3: Manager OS Attack

Attack:

"Manager OS is just Advisor OS analytics. You created a second OS because dashboards became bigger."

### 4.1 What decision disappears if Manager OS disappears?

The missing decision is:

> Where should the organization invest finite managerial attention, development resources, risk control and leadership trust?

Advisor OS answers:

- What should I do next?
- What should I say?
- Which client/prospect needs attention?
- How should I execute?

Manager OS answers:

- Who should receive coaching investment?
- Which candidate/advisor is a development risk?
- Where is the team system decaying?
- Who is ready to lead?
- Where should management intervene?

Those are not bigger dashboards. They are different decisions.

### 4.2 Does Manager OS truly own unique decisions?

Yes, for allocation and governance.

Manager OS owns decisions that would be harmful or nonsensical inside Advisor OS:

- Veto or approve manager investment.
- Trigger systemic intervention.
- Assess promotion readiness.
- Detect team-level decay.
- Allocate coaching capacity.

The Miranda Wall proves uniqueness: if a decision must be hidden from Advisor OS to protect psychological safety, it likely belongs to Manager OS.

### 4.3 Does Organization Health survive this attack?

Partially.

It survives as a candidate domain because "Is the organization decaying or growing systemically?" is not an individual advisor execution decision.

It is not yet fully ratified because its metrics remain open:

- Team energy
- Activity density
- Attrition signal
- Burnout vs excellence
- Cultural drift

Verdict:

Organization Health survives as a domain candidate, not as implementation-ready architecture.

### 4.4 Does Leadership survive this attack?

Partially.

It survives because promotion/succession is a unique governance decision. Advisor OS cannot decide whether someone should lead others.

It remains weak because "excellence signals" are not hardened enough. Without deterministic evidence, Leadership risks favoritism theater.

Verdict:

Leadership survives as a constitutional candidate, but must not be implemented until readiness signals are defined.

### 4.5 Does Andrey survive this attack?

Yes.

Andrey survives because Human Capital Allocation has a unique scarce-resource decision:

> Should the manager invest finite development resources in this person, unit or trajectory?

That decision is not Advisor OS analytics. It is governance over organizational capital.

Stress verdict:

Manager OS survives, but only if ADR-0020 treats it as a decision boundary, not a reporting folder.

---

## 5. Question 4: Legacy Attack

Attack:

"Legacy folders never shrink. They become digital landfills."

Attack accepted.

Legacy becomes a landfill unless ADR-0020 gives it teeth.

### 5.1 Governance mechanism that forces Legacy toward zero

Required mechanism:

1. Every Legacy file must have a quarantine record.
2. Every record must name an exit owner.
3. Every record must have a review date.
4. New imports from Legacy are blocked unless explicitly approved.
5. Legacy files older than threshold escalate automatically.
6. Legacy density appears in repository health reports.
7. No new feature may be added to Legacy.
8. Files cannot remain Legacy after their owner is known.

### 5.2 KPIs to track

| KPI | Purpose |
| --- | --- |
| Legacy File Count | Measures raw unresolved surface |
| Legacy Density | Legacy files / scanned files |
| Legacy Aging | Median and max days in quarantine |
| Legacy New Import Count | Detects new dependencies on unresolved code |
| Legacy Exit Rate | Files assigned, split, deleted or ratified per cycle |
| Legacy Re-entry Count | Files moved out then returned to Legacy |
| Legacy Owner Unknown Count | Files without exit owner |
| Legacy Test Unknown Count | Files without known validation path |

### 5.3 Automatic escalation

| Condition | Escalation |
| --- | --- |
| Legacy file has no exit owner | Block migration batch |
| Legacy file exceeds age threshold | Council review required |
| New code imports Legacy | Build warning; if repeated, block merge |
| Legacy density increases after migration | Migration fails health review |
| Legacy file has active consumers | Owner assignment required before movement |
| Legacy file is modified for new feature | Reject change or move to owner domain first |

Stress verdict:

Legacy survives only as time-boxed quarantine. Permanent Legacy fails.

---

## 6. Question 5: File Movement Attack

Attack:

"Repository migration creates activity, not value. Developers spend weeks moving files and nothing improves."

Attack accepted.

File movement is illegal unless it produces measurable governance value.

### 6.1 Measurable value required

Approved value signals:

- Reduced owner ambiguity
- Reduced root coupling
- Reduced unresolved imports
- Reduced cross-domain private imports
- Increased domain test coverage
- Reduced Legacy density
- Improved ability to locate owner/customer/decision/test gate
- Preserved or improved test results
- Smaller blast radius for future domain changes

### 6.2 Illegal migrations

Illegal because aesthetic only:

- Moving files to make the root look cleaner without ownership proof
- Creating folders before import rules exist
- Moving tests away from their behavioral contracts without improving discoverability
- Moving shared-looking files into Shared without owner and consumer evidence
- Moving Legacy files into permanent domain folders to reduce Legacy count
- Renaming files to match domain vocabulary without changing governance clarity
- Bulk moves that require broad import rewrites and no behavioral improvement

### 6.3 Proof of migration success

A migration batch succeeds only if:

1. Every moved file has an owner.
2. Every moved file has a destination rationale.
3. All imports are rewritten intentionally.
4. No new unresolved imports are introduced.
5. Relevant tests pass.
6. Domain leakage does not increase.
7. Legacy density does not increase.
8. Reviewers can identify customer, decision, evidence and test gate faster than before.

Stress verdict:

Migration is valuable only as governance enforcement. Movement itself has zero constitutional value.

---

## 7. Question 6: Miranda Attack

Attack:

"You are inventing architecture because it feels correct."

Miranda standard:

Every domain must have observable evidence and falsification criteria.

### 7.1 Domain evidence and falsification table

| Domain | Observable Evidence It Exists | Evidence That Would Falsify It |
| --- | --- | --- |
| Advisor OS | Engines produce next actions, message recommendations, follow-ups, prospect/client decisions, relationship actions and advisor-facing execution guidance | Outputs are only dashboards, generic CRM fields or manager judgments; no advisor action is produced |
| Manager OS | Distinct allocation, coaching, team risk, recruitment, promotion or organizational intervention decisions; Miranda Wall needed | It only aggregates Advisor OS metrics for display and never changes manager action |
| Shared Intelligence | Reusable evidence, identity, metric, source ownership, snapshot or event contracts consumed by multiple domains | It contains workflow recommendations, domain-specific special cases or files with no clear owner |
| Product Intelligence | Product truth, benefits, exclusions, quote interpretation, product scenarios and product source discipline | It makes suitability, policy status or compensation decisions without evidence boundary |
| Policy Operations | Policy intake, OCR, renewals, tasks, document staging, timelines, policy state and servicing workflows | It defines product truth, compensation rules or sales advice instead of operational facts |
| Compensation | Commission, contest, production, allowance, economic interpretation with period/rule/confidence | It invents income, mixes forecasts with paid facts or hardcodes carrier rules outside Rule Packs |
| Rule Packs | Versioned carrier/channel/rule interpretation separated from universal Core | Carrier-specific rules leak into Core or rule outputs lack RuleSnapshot context |
| Platform | Runtime, storage, sync, cache, command, event bus, shell and offline capability | It starts owning business decisions or domain-specific truth |

### 7.2 Domains that survive Miranda

Strong survivors:

- Advisor OS
- Product Intelligence
- Policy Operations
- Compensation
- Rule Packs
- Platform

Conditional survivors:

- Manager OS survives for Allocation / Andrey now.
- Organization Health survives as discovery candidate.
- Leadership survives as discovery candidate.
- Shared Intelligence survives only with entry gates and owner declarations.

Stress verdict:

The domains are not invented if they protect different decisions and have falsification tests. Any domain that cannot state a falsifier should not be ratified.

---

## 8. Question 7: Repository Health Stress Test

Attack:

"Orphan Density is useless. Duplicate Density is misleading. Import Coupling is normal. Domain Leakage is unavoidable."

### 8.1 Metric-by-metric stress review

| Metric | Attack | Verdict | Required Revision |
| --- | --- | --- | --- |
| Orphan Density | A file can be used dynamically or by docs/scripts; static scans miss it | Survives as weak signal | Rename to Orphan Candidate Density; never use for deletion |
| Duplicate Density | Duplicate names can be intentional tests or variants | Survives as review signal | Split into Exact Duplicate Content and Name Collision Review |
| Import Coupling | Cross-domain imports are normal in real systems | Survives if directional | Measure forbidden/private coupling, not all coupling |
| Domain Leakage | Some leakage is unavoidable during migration | Survives as exception metric | Track unapproved leakage, not approved public consumption |
| Quarantine Aging | Age alone does not prove harm | Survives strongly | Escalates review, not deletion |
| Root Coupling | Root files can be valid app shell | Survives strongly | Track high-fan-in root files and no-move surface separately |
| Circular Dependency Count | Some cycles may be test-only | Survives | Classify production cycles vs test cycles |
| Unresolved Import Count | Static tools may miss module resolution | Survives strongly | Must be triaged, not blindly counted |
| Test Gate Coverage | Coverage can be shallow | Survives conditionally | Require decision-oriented tests, not just file presence |
| Rule-Pack Leakage Count | Hard to detect mechanically | Survives strongly | Requires static scan plus human review |
| Economic Evidence Coverage | May be hard to automate | Survives strongly | Required for economic outputs |
| No-Move Surface Size | Large no-move surface may be prudent | Survives as readiness metric | Must not incentivize reckless movement |
| Percent Migrated | Rewards movement | Reject | Remove |
| Files Moved | Rewards activity | Reject | Remove |
| Folder Count | Rewards structure theater | Reject | Remove |

### 8.2 Metrics that survive

Survivors:

- Orphan Candidate Density
- Quarantine Aging
- Legacy Exit Rate
- Exact Duplicate Content
- Name Collision Review
- Forbidden Import Coupling
- Approved vs Unapproved Domain Leakage
- Root Coupling
- Production Circular Dependencies
- Unresolved Import Count
- Decision Test Gate Coverage
- Rule-Pack Leakage Count
- Economic Evidence Coverage
- No-Move Surface Size

Rejected:

- Percent migrated
- Files moved
- Folder count
- Subjective cleanliness
- Developer confidence without evidence

Stress verdict:

Repository health metrics survive only if they trigger review or governance action. Metrics that reward movement must be rejected.

---

## 9. Question 8: The 5-Year Test

Assumption:

- 5,000 files
- 50 contributors
- Advisor OS
- Manager OS
- Enterprise deployments

### 9.1 Which parts of ADR-0020 fail first?

Likely failure points:

1. Shared Intelligence becomes overloaded.
2. Legacy becomes permanent.
3. Domain import rules become informal and unenforced.
4. Tests become centralized but disconnected from decision ownership.
5. Rule Pack boundaries leak into Product, Compensation or Core.
6. Manager OS consumes Advisor signals and starts leaking judgments back.
7. Platform becomes a catch-all for business logic.
8. Docs drift from code unless ADR ownership is maintained.
9. Migration batches become too large for review.
10. Ownership declarations become stale unless validated.

### 9.2 Governance rules that become mandatory

Mandatory at 5-year scale:

- `CODEOWNERS` or equivalent domain ownership map
- ADR-required owner declaration for each domain folder
- Public/private module boundaries per domain
- Import boundary linting
- Legacy quarantine registry
- Source ownership registry integration with repository ownership
- Domain test gates in CI
- Rule Pack versioning enforcement
- Migration batch size limits
- Architecture review for Shared entries
- Automated repository health report
- Exception registry with expiration dates

### 9.3 Which discoveries remain valid?

Still valid:

- Folders do not create architecture.
- Decision ownership creates domain ownership.
- Consumer is not owner.
- Shared must be primitive-based.
- Legacy must trend to zero.
- Manager OS is not Advisor OS analytics if it owns allocation/governance decisions.
- Rule Packs interpret facts.
- Economic outputs require evidence/rule/period/confidence.
- Migration must prove value.

Stress verdict:

ADR-0020 can scale to 5,000 files only if it includes enforceable repository governance, not just a folder map.

---

## 10. Architecture Survivors

Survived as constitutional candidates:

1. Decision ownership as repository ownership source.
2. Single accountable owner with multiple allowed consumers.
3. Advisor OS as execution layer.
4. Manager OS as governance/allocation layer.
5. Andrey / Human Capital Allocation as unique Manager OS decision owner.
6. Product Intelligence as product truth owner.
7. Policy Operations as operational policy fact owner.
8. Compensation as economic interpretation owner.
9. Rule Packs as carrier/channel interpretation boundary.
10. Platform as runtime capability owner.
11. Legacy as temporary quarantine.
12. Repository Health as observable governance signals.

Survived only with constraints:

1. Shared Intelligence.
2. Organization Health.
3. Leadership.
4. Orphan Density.
5. Domain Leakage.
6. Import Coupling.

---

## 11. Architecture Failures

Failed or rejected:

1. ADR-0020 as folder map only.
2. Permanent Legacy.
3. Shared as generic shared/misc/utils.
4. Multiple owners for the same truth.
5. Migration success measured by files moved.
6. Percent migrated as a health metric.
7. Deleting orphan candidates from static scan alone.
8. Moving files by filename keyword.
9. Manager OS as dashboard-only analytics.
10. Platform as a place for business logic.

---

## 12. ADR-0020 Required Revisions

ADR-0020 must add:

1. Accountable owner rule:
   Files may have multiple consumers but only one official owner.

2. Public/Private domain boundary:
   Domains expose public outputs/contracts; other domains may not import private internals.

3. Shared Intelligence entry gate:
   Shared requires primitive proof, consumer proof, owner proof and boundary tests.

4. Legacy quarantine registry:
   Each Legacy file requires reason, owner, age, consumers, exit condition and allowed-import status.

5. Repository health actions:
   Each metric must define what happens when it worsens.

6. Migration value test:
   Every batch must reduce ambiguity/coupling/risk or improve discoverability/testability.

7. Manager OS boundary:
   Manager OS files must own governance/allocation/team decisions, not advisor-facing execution.

8. Five-year scalability rules:
   ADR-0020 should anticipate CODEOWNERS, import linting, domain public APIs and CI gates.

9. Metric revisions:
   Replace broad metrics with stress-tested versions:
   - Orphan Candidate Density
   - Forbidden Import Coupling
   - Approved vs Unapproved Domain Leakage
   - Exact Duplicate Content
   - Name Collision Review
   - Decision Test Gate Coverage

10. No ratification of movement:
   ADR-0020 ratifies governance, not physical migration.

---

## 13. New Open Questions

1. Should Forge create a formal `repository-ownership-registry.json` or extend `source-ownership-registry.js`?
2. Should each domain expose an `index.js` public API after migration?
3. Should import linting be implemented before the first code movement batch?
4. What is the maximum allowed migration batch size?
5. Who owns repository health reporting: Platform, Docs/Governance or a new Repository Governance tool?
6. How should domain-private tests be organized versus global master tests?
7. What are the exact falsification criteria for Organization Health?
8. What are the exact deterministic evidence signals for Leadership?
9. Should Shared Intelligence be split into `shared-core`, `shared-commercial` and `shared-evidence`?
10. Should Legacy imports fail CI immediately or warn during a transition period?

---

## 14. Ratification Recommendation

Recommendation:

B. Ratify with modifications.

ADR-0020 should be ratified only as repository governance, not as a migration approval.

Required status:

PROPOSED / GOVERNANCE RATIFICATION ONLY / NO FILE MOVEMENT AUTHORIZED

Recommended final ADR-0020 statement:

> ADR-0020 ratifies the repository ownership doctrine and domain boundaries required before migration. It does not authorize moving files. Physical migration remains blocked until dry-run tooling, import boundary rules, Legacy quarantine registry and batch approval gates exist.

Final stress-test conclusion:

The architecture survived, but the folder plan did not survive alone.

Anything constitutional must be stated as ownership, evidence, boundary and enforcement. Folders are only the visible consequence.
