# REPO-001 Repository Governance Discovery Report

Report ID: REPO-001
Status: ARCHITECTURE DISCOVERY
Scope: Repository domain ownership before physical folder migration
Decision State: GOVERNANCE REQUIRED BEFORE MOVING CODE

---

## 1. Executive Verdict

Forge is not yet ready to move files as a broad repository migration.

The proposed folder map is directionally correct, but folders are not the source of truth. Repository ownership must be governed by constitutional decision ownership:

> A file belongs to the domain whose decision it protects.

Physical folders should follow domain ownership. They must not define it.

The next official artifact should be ADR-0020 Repository Domain Structure, but ADR-0020 should first ratify ownership rules, import rules, test rules, quarantine rules and repository health metrics. Only after that should Forge begin small migration batches.

---

## 2. Source of Truth for Repository Ownership

Repository ownership has four levels of authority:

1. Forge Constitution / AGENTS.md:
   Defines the system identity, prime directives and protected boundaries.

2. Domain architecture documents:
   Define what decision each domain owns and what it must not duplicate.

3. ADRs:
   Ratify durable technical placement rules.

4. File evidence:
   Imports, tests, runtime routes, fixtures, schemas and documented consumers prove current behavior.

Constitutional rule:

> The owner of a file is not the folder it currently lives in. The owner is the domain responsible for the official decision, metric, rule, evidence contract or runtime capability the file protects.

---

## 3. Repository Governance Principles

1. Decision Ownership First:
   Every file must have one conceptual owner.

2. Consumer Is Not Owner:
   A domain may consume another domain's output, but it must not recalculate that truth.

3. Folders Follow Architecture:
   Folder movement is a consequence of ownership, not a substitute for it.

4. No Silent Reclassification:
   Moving a file must not change its product meaning, metric owner, rule-pack boundary or customer.

5. No Cross-Domain Truth Duplication:
   If two domains need the same fact, the fact belongs in Shared Intelligence or a domain-owned snapshot, not in duplicated logic.

6. Platform Is Capability, Not Business Meaning:
   Runtime, sync, storage, search and commands are Platform only when they are generic infrastructure.

7. Rule Packs Interpret:
   Carrier/channel-specific rules belong in Rule Packs or domain rule interpretation layers, not in universal Forge Core.

8. Tests Move With Behavioral Contracts:
   A test belongs near the decision contract it validates, but master gates must remain discoverable.

9. Legacy Is Not a Domain:
   Legacy is a temporary quarantine label for unresolved ownership, not a permanent product area.

10. Deletion Requires Evidence:
   No file is deleted because it looks old, unused or ugly. Miranda requires proof.

---

## 4. Domain Ownership Matrix

| Domain | Decision Protected | Primary Customer | Constitutional Authority | Can Exist Independently? |
| --- | --- | --- | --- | --- |
| Advisor OS | What should the advisor do next, say next or focus on now? | Advisor | Advisor First, Decision Clarity, Intelligence Must Lead To Action | Partially. It can run as an execution layer, but consumes Product, Policy, Shared and Platform outputs. |
| Manager OS | Where should a manager allocate attention, coaching, resources or risk control? | Manager / Partner / Director | Manager-aware governance, Miranda Wall, human capital allocation | Partially. It must consume Advisor and Shared signals but cannot leak manager judgments into Advisor OS. |
| Shared Intelligence | What facts, evidence, identities, metrics, snapshots or decision primitives are common across domains? | All domains | Metric Ownership Rule, Shared Commercial Model, Evidence and Provenance | Yes as a foundation layer, but it should not produce final customer-specific decisions. |
| Product Intelligence | What is true about an insurance or financial product, benefit, exclusion, scenario or product-specific interpretation? | Advisor and client-facing product decisions | No invented products, Product truth comes from documentation | Partially. It can own product truth but consumes evidence, policy context and rule snapshots. |
| Policy Operations | What happened to a policy, document, renewal, OCR intake, task or operational workflow? | Advisor operations and service workflows | Capture Once, operational evidence, policy source discipline | Yes operationally, but it must not own product truth or compensation interpretation. |
| Compensation | What compensation, contest, commission or economic interpretation is valid for a period and rule context? | Advisor and manager economic decisions | Economic Evidence Rule, Forecast Truth Boundary, RuleSnapshot discipline | Partially. It requires Rule Packs, production events and period snapshots. |
| Rule Packs | Which carrier/channel/rule-version interprets facts for a specific business context? | Domains that need rule interpretation | Universal Core / Rule Pack Boundary | Yes as interpretation packages, but not as business workflows. |
| Platform | How does Forge run, store, sync, route, search, notify, cache and execute commands? | All domains | Offline First, core runtime reliability | Yes technically, but it must not own business decisions. |
| Docs | What has been approved, discovered, ratified or intentionally blocked? | Builders, auditors, future maintainers | Repository governance, ADR process | Yes as governance memory, but docs do not implement behavior. |
| Tests | Which behavioral contracts must remain true? | Builders and release governance | Every engine requires unit and master tests | Yes as validation layer, but tests do not own product truth. |
| Legacy | Which files have unresolved ownership, route coupling or migration risk? | Maintainers | Miranda quality control, no silent breakage | No. It is a temporary quarantine state, not a domain. |

---

## 5. File Ownership Rules

The proposed framework is validated with corrections.

Approved placement rules:

| Rule | Placement |
| --- | --- |
| Exists to help an advisor execute, sell, follow up, converse, prioritize or decide next action | Advisor OS |
| Exists to help a manager allocate resources, coach, detect team risk, evaluate candidates or govern development | Manager OS |
| Exists to support multiple domains through identity, evidence, snapshots, metric contracts, shared financial primitives or reusable decision primitives | Shared Intelligence |
| Represents product truth, product rules, benefits, exclusions, product scenarios or product-specific interpretation | Product Intelligence |
| Manages policy detail, OCR, renewals, imports, operational tasks, document staging or policy timelines | Policy Operations |
| Calculates or interprets commissions, contests, production, compensation, allowances or economic consequences | Compensation |
| Defines carrier/channel-specific rules or versioned rule interpretation | Rule Packs |
| Manages runtime, sync, storage, cache, command execution, shell services, event bus or generic infrastructure | Platform |
| Records architecture, ADRs, discovery, governance, audits or checkpoint history | Docs |
| Validates behavior, fixtures, schemas or acceptance contracts | Tests |
| Has unresolved owner, high root coupling, unclear runtime dependency or insufficient evidence for destination | Legacy quarantine |

Rejected or unsafe placement rules:

| Rejected Rule | Why Rejected |
| --- | --- |
| Put a file where its filename keyword points | Names are weak evidence and can hide cross-domain ownership. |
| Put all shared-looking files in Shared Intelligence | Shared must own primitives, not become a dumping ground. |
| Put all SMNYL files in Compensation | SMNYL-specific rules may belong to Rule Packs, Product Intelligence or Compensation depending on decision protected. |
| Put all old root files in Legacy permanently | Legacy as a permanent folder becomes architectural resignation. |
| Put tests only in one global test folder | Some tests are domain contracts and should remain traceable to their domain decision. |
| Put UI consumers in business domains | UI may consume domain decisions but should not own domain truth. |

Tie-breaker rule:

If a file appears to belong to multiple domains, classify by the highest-risk truth it protects:

1. Rule Pack version / regulated product truth
2. Economic output
3. Official metric or snapshot
4. Policy operational fact
5. Customer-facing advisor action
6. Manager governance action
7. Platform capability
8. Documentation or test evidence

---

## 6. Legacy Domain Test

Current proposal:

`legacy/`

Recommendation:

Option B now, Option C as the constitutional end state.

Legacy should be a temporary quarantine, not a permanent folder and not an ordinary domain.

Why not permanent:

- Permanent Legacy gives unresolved ownership a place to hide.
- It creates a second architecture outside the constitution.
- It encourages future code to depend on known-ambiguous modules.

Why not immediate zero:

- The migration plan found high root coupling, tests in root and runtime-sensitive files.
- Some files need preservation until imports, routes, tests and consumers are proven.
- Miranda standards require evidence before quarantine, rewrite or deletion.

Constitutional rule:

> Legacy is a holding state for unresolved ownership. Every Legacy file must have an exit condition.

Required metadata for any Legacy file:

| Field | Required Meaning |
| --- | --- |
| Reason | Why it cannot be assigned today |
| Current consumers | Who imports or routes to it |
| Risk | What breaks if moved |
| Exit owner | Which domain must eventually accept, split or retire it |
| Review date | When quarantine must be revisited |
| Allowed imports | Whether new dependencies may import it |

Final target:

Legacy density should trend toward zero.

---

## 7. Orphan Governance Strategy

Definition:

An orphan is a file with no proven active owner.

Static orphan candidate:

- No incoming imports found
- No relative imports
- Not referenced by tests, docs, HTML, manifest, service worker, runtime registry or shell routes

Constitutional orphan:

- No domain can explain the decision it protects
- No customer depends on its output
- No current test or evidence contract validates it
- No ADR, architecture doc or build-tree entry claims it

Important distinction:

> No incoming import is not proof of uselessness. It is only a signal for review.

Evidence required before quarantine:

| Evidence | Required Standard |
| --- | --- |
| Static dependency scan | No known imports or unresolved imports documented |
| Runtime route scan | No app shell, service worker, manifest, registry or command route depends on it |
| Test scan | No test, fixture or acceptance gate requires it |
| Documentation scan | No active architecture, ADR, checkpoint or build tree entry claims it |
| Domain review | At least one proposed owner rejects ownership with reason |
| Risk note | What could break if quarantined |

Evidence required before deletion:

| Evidence | Required Standard |
| --- | --- |
| Quarantine history | File has lived in quarantine through at least one release/checkpoint cycle |
| Zero consumer proof | Imports, routes, tests, docs and scripts still show no consumer |
| Replacement proof | Any needed behavior has a current owner or no longer exists |
| Test proof | Relevant smoke/master/module tests pass without it |
| Human approval | Explicit deletion approval, never implied by migration |
| Recovery path | Git reference or archive note identifies how to restore it |

Miranda standard:

Deletion must improve Forge. If deletion only makes the tree prettier, it fails.

---

## 8. Repository Health Metrics

Repository Health should become a governance metric, but only with observable signals.

Approved metrics:

| Metric | Definition | Why It Matters |
| --- | --- | --- |
| Orphan Density | Orphan candidates / scanned files | Measures ownership ambiguity |
| Quarantine Aging | Days a file remains in Legacy without exit owner | Prevents Legacy from becoming permanent |
| Duplicate Density | Duplicate names or exact content / scanned files | Detects drift and repeated truth |
| Import Coupling | Relative imports crossing proposed domains | Predicts migration breakage |
| Root Coupling | Files in root imported by many consumers | Measures root as hidden architecture |
| Domain Leakage | Files where decision owner differs from proposed folder | Detects folder/architecture mismatch |
| Circular Dependency Count | Cycles across modules or domains | Signals unstable ownership |
| Unresolved Import Count | Static imports that cannot be resolved | Measures immediate break risk |
| Test Gate Coverage | Domains with unit/master/smoke validation | Measures behavioral safety |
| Rule-Pack Leakage Count | Carrier/channel-specific logic in Core domains | Protects universal Forge Core |
| Economic Evidence Coverage | Economic outputs with evidence, RuleSnapshot, period and confidence | Protects no-invented-financial-values rule |
| No-Move Surface Size | Files blocked from first migration | Measures migration readiness |

Rejected subjective metrics:

| Rejected Metric | Why Rejected |
| --- | --- |
| Looks organized | Not observable and easily gamed |
| Feels clean | No decision evidence |
| Modern folder structure | Fashion is not architecture |
| Number of folders created | More folders can increase confusion |
| Lines of code moved | Movement is not progress |
| Files renamed | Renaming can hide ownership ambiguity |
| Developer confidence | Confidence without evidence violates Miranda |
| Percent migrated | Can reward unsafe migration |

Repository Health North Star:

> A healthy repo lets a maintainer identify the owner, customer, decision, evidence and test gate of a file without guessing.

---

## 9. Miranda Test: "Folders Do Not Create Architecture"

Attack accepted.

Folders do not create architecture.

What actually creates architecture:

1. Clear decision ownership
2. Stable domain boundaries
3. Evidence contracts
4. Metric ownership
5. Rule Pack separation
6. Orchestrators that consume engines instead of duplicating logic
7. Tests that validate decisions, not just code paths
8. Runtime contracts and import discipline
9. Governance that blocks ambiguous ownership from becoming official output

What folders do:

- Make boundaries visible
- Reduce accidental coupling
- Improve navigation
- Make ownership easier to audit
- Expose leakage when imports cross boundaries
- Support onboarding and review

What folders cannot do:

- Decide ownership
- Fix duplicate logic
- Prove a file is unused
- Make tests meaningful
- Separate Core from Rule Packs by themselves
- Prevent advisor/manager judgment leakage

Governance rules required before moving code:

1. Ratify ADR-0020 before broad movement.
2. Create a domain ownership rubric.
3. Define allowed import directions.
4. Define Legacy quarantine metadata.
5. Define domain test gates.
6. Define rule-pack placement rules.
7. Define economic evidence placement rules.
8. Define no-move root surface.
9. Define dry-run tooling.
10. Define batch approval protocol.

---

## 10. Recommendation for ADR-0020 Repository Domain Structure

ADR-0020 should be created before moving files.

Recommended ADR-0020 status:

PROPOSED / GOVERNANCE LOCK BEFORE MIGRATION

ADR-0020 should ratify:

1. Top-level domain folders:
   `advisor-os/`, `manager-os/`, `shared-intelligence/`, `product-intelligence/`, `policy-operations/`, `compensation/`, `rule-packs/`, `platform/`, `docs/`, `tests/`, `legacy/`.

2. Ownership rule:
   A file belongs to the domain whose decision it protects.

3. Legacy rule:
   Legacy is temporary quarantine with exit metadata.

4. Import rule:
   Domains may consume official outputs from other domains; they may not reach into private internals or duplicate truth.

5. Test rule:
   Every moved file must preserve or improve its behavioral test gate.

6. Migration rule:
   Migrations happen batch by batch through dry-run, import rewrite, focused tests and explicit approval.

7. No-move rule:
   `app.js`, `manifest.json`, `service-worker.js`, `AGENTS.md`, and `FORGE_MASTER_BUILD_TREE.md` stay put until separately approved.

8. Health metric rule:
   Repository Health is measured through observable signals, not aesthetics.

ADR-0020 should not approve:

- Bulk moves
- Permanent Legacy
- Moving files by filename keyword alone
- UI/app shell movement
- Any move that changes business meaning
- Any move without import and test evidence

---

## 11. Final Verdict

Forge should formalize governance first.

The migration plan is useful as an inventory and pressure map, but it should not be treated as implementation approval.

Current readiness:

| Area | Status |
| --- | --- |
| Domain structure concept | READY FOR ADR PROPOSAL |
| Ownership rules | READY TO RATIFY |
| Legacy strategy | NEEDS ADR LOCK |
| Orphan deletion policy | NOT READY FOR DELETION |
| Dry-run tooling | NOT IMPLEMENTED |
| Broad file movement | NOT READY |
| Small docs-only governance batch | READY IF APPROVED |

Constitutional conclusion:

> Forge is ready to define repository architecture. Forge is not yet ready to physically migrate the repository.

Next recommended PAQ:

Create `docs/adr/ADR-0020_REPOSITORY_DOMAIN_STRUCTURE.md` as a governance ADR. It should incorporate REPO-001, define the migration gates, and explicitly block file movement until dry-run tooling and batch approval exist.
