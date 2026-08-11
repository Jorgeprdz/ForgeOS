# FORGE AURA REAL-USER REPAIR 014 — GOVERNANCE / ADR / AUTHORITY GATE

PHASE=FORGE_AURA_REAL_USER_REPAIR_HUMAN_LANGUAGE_AUTHORITY_RECONCILIATION_014
BASE_SHA=a8bdd20988c8463e80e09d154546045d05840c7b
BRANCH=fix/forge-aura-real-user-repair-014

## Constitutional gate

The active Constitution was read before implementation from `docs/01-constitution/FORGE_CONSTITUTION_MAP.md`.

Binding principles for this repair:

- Article 0 is RATIFIED / ACTIVE: Forge exists to strengthen human judgment, not replace it.
- Reality precedes assumptions.
- Evidence precedes opinion.
- Human authority precedes artificial authority.
- Client First precedes economic incentives.
- Capability precedes dependency.
- Architecture is problem-driven.

CONSTITUTIONAL_DISCOVERY_COMPLETE=YES
NEW_CONSTITUTION_CREATED=NO
CONSTITUTION_MUTATED=NO

## ADR applicable report

Canonical ADR paths were resolved from `adr/`; no ADR number was inferred or invented.

| ADR | Canonical path | Applies | What it governs in 014 | Constraint preserved |
|---|---|---:|---|---|
| ADR-001 Evidence Ownership / Source Validity | `adr/ADR-001 — Evidence Ownership Source Validity.txt` | YES | source/evidence validity across Cartera, Pipeline and Income | unknown remains unknown; provenance is not fabricated |
| ADR-002 One Metric One Owner | `adr/ADR-002 — One Metric One Owner.txt` | YES | all presented metrics | UI does not reconstruct owner logic |
| ADR-003 Recommendation vs Decision Authority Boundary | `adr/ADR-003 — Recommendation vs Decision Authority Boundary.txt` | YES | next step, review and confirmation | human decision remains final |
| ADR-004 No Invented Recommendations | `adr/ADR-004 — No Invented Recommendations.txt` | YES | Pipeline copy / next-step language | no action is fabricated by a presenter or LLM |
| ADR-005 Product Truth Boundary | `adr/ADR-005 — Product Truth Boundary.txt` | YES | Quotes/product presentation | presentation cannot create Product Truth |
| ADR-006 Policy Truth Boundary | `adr/ADR-006 — Policy Truth Boundary.txt` | YES | Cartera coverage and PDF evidence | document evidence is not confirmed Policy Truth |
| ADR-007 Forecast Truth Boundary | `adr/ADR-007 — Forecast Truth Boundary.txt` | YES | Income future/expected/scenario labels | projected/expected is not paid or guaranteed |
| ADR-008 Economic Evidence Boundary | `adr/ADR-008 — Economic Evidence Boundary.txt` | YES | Income source state and economic claims | economic absence/unknown cannot become zero/payment |
| ADR-009 NBA Philosophy | `adr/ADR-009 — NBA Philosophy.txt` | YES | Pipeline prioritization/action presentation | bounded candidate, not mandate or fabricated decision |
| ADR-010 NASH Conversation Intelligence Boundary | `adr/ADR-010 — NASH Conversation Intelligence Boundary.txt` | YES | Communication / WhatsApp | governed intent first; draft needs human approval; no automatic send |
| ADR-011 Relationship Intelligence Non-Manipulation Boundary | `adr/ADR-011 — Relationship Intelligence Non-Manipulation Boundary.txt` | YES | CRS-10 relationship context | reuse relationship facts without manipulation or pressure |
| ADR-014 Productivity Metric Ownership Boundary | `adr/ADR-014 — Productivity Metric Ownership Boundary.txt` | INDIRECT | cross-module advisor context | no UI recalculation of productivity truth |
| ADR-016 Advisor Experience + Benvenù Anti-Dependence Boundary | `adr/ADR-016 — Advisor Experience + Benvenù Anti-Dependence Boundary.txt` | YES | human-language and interaction design | interface increases capability instead of architectural dependency |
| ADR-016A Purpose / Scarcity / Dignity | `adr/ADR-016A-BENVENU-PURPOSE-SCARCITY-DIGNITY-BOUNDARY.md` | INDIRECT | copy posture | no coercive framing |
| ADR-017 Compensation Intelligence Evidence Boundary | `adr/ADR-017 — Compensation Intelligence Evidence Boundary.txt` | YES | Income | paid / earned / estimated / projected / unknown remain distinct; no invented commission or payment |
| ADR-018 Economic Motivation Client First Boundary | `adr/ADR-018 — Economic Motivation Client First Boundary.txt` | YES | Income + commercial presentation | money is context, never pressure; no product steering by payout |
| ADR-020 Canonical Forge Shell Execution Authority | `adr/ADR-020 — UI-M04 Canonical Forge Shell Execution Authority.txt` | YES | Aura entrypoint/import map | reuse existing shell and bounded module lifecycle |
| ADR-021 Quotes Visual Migration Execution Authority | `adr/ADR-021 — UI-M05 Quotes Visual Migration Execution Authority.txt` | YES | Quotes presentation | no quote engine/calculation/persistence/product-intelligence mutation |
| ADR-022 Quotes Functional Baseline Repair Authority | `adr/ADR-022 — UI-M05A Quotes Functional Baseline Repair Authority.txt` | YES | BUG-01 lifecycle repair | functional baseline may be repaired while quote domain boundaries remain protected |
| ADR-023 Advisor OS Productive Home/Core Recovery | `adr/ADR-023 — Advisor OS Productive Home and Core Modules Recovery Execution Authority.txt` | YES | productive Aura consumers | reuse productive owners instead of local parallel engines |
| ADR-024 Forge Aura Light 2026 Design Authority | `adr/ADR-024 — Forge Aura Light 2026 Canonical Redesign Design Authority.txt` | YES | geometry, hierarchy, language | bounded Aura repair, not a new product/runtime |
| ADR-025 Cartera PDF Semantic Review Boundary | `adr/ADR-025 — Cartera PDF Semantic Review Boundary.txt` | YES | BUG-01/04 PDF review | extracted coverage createsTruth=false and requires human review; no name auto-merge |
| ADR-026 Cartera PDF Semantic Completion / Honest Review Confidence | `adr/ADR-026 - Cartera PDF Semantic Completion and Honest Review Confidence.txt` | YES | PDF completeness/uncertainty | no false completeness or confidence |

Evaluated but not materially mutated in this phase: ADR-012, ADR-013, ADR-015, ADR-019. They remain preserved.

ADR_STATUS_ASSUMED_FROM_FILENAME=NO
ADR_CONFLICTS_UNRESOLVED=0
NEW_ADR_CREATED=0

## Source-owner / authority map

| Concern | Existing authority reused | 014 consumer/repair | Forbidden replacement |
|---|---|---|---|
| Pipeline prospect/state | productive Pipeline adapter/service + `pipeline-domain-intelligence-consumer.js` | Pipeline 014 presentation wrapper | frontend stage/priority engine |
| Prospect ↔ Commercial Person identity | CRS-03 convergence service | `pipeline-crs10-context-adapter-013.js` consumes LINKED identity only | name matching / auto merge |
| Relationship context | `crs-10-existing-relationship-intelligence-service.js` | CRS-10 presentation + governed context dialog | second Relationship Intelligence engine |
| Cartera person/policy | productive `cartera-adapter-pages-v13.js`, `commercial_people`, governed policy read paths | Cartera v11-014 presentation | copied cross-module records |
| PDF evidence | existing Cartera PDF intake / 020B candidate persistence | human review language and lifecycle | extraction becoming truth |
| Policy / Coverage Truth | existing Policy Intelligence / governed coverage writer | presentation distinguishes found vs confirmed | direct UI promotion |
| Communication intent | NASH deterministic Conversation Brief + existing intent authorities | Pipeline prepare-message UX | LLM deciding objective/next step |
| Draft rendering | NFAST-06 deterministic renderer + optional governed provider + draft safety boundary | human-facing message workspace | raw data → LLM → business decision |
| Income | RPC `forge_advisor_compensation_read_product`; authority `SUPABASE_ADVISOR_COMPENSATION_READ_MODEL` | `income-module-014.js` presentation only | UI compensation calculation or Cartera/Pipeline fallback |
| Quote candidate/calculation/confirmation | existing `ForgeAcceptedQuoteBridge` + existing confirmation popup host | `forge-quote-intake-state.js` lifecycle compatibility only | new quote/calculation/persistence owner |
| Aura shell / Pages runtime | canonical Aura shell and productive import map | maps bounded 014 consumer wrappers | alternate CRM/runtime |
| Auth/RLS/tenancy | existing Supabase auth, RPC/RLS/owner-scoped adapters | unchanged | relaxed RLS/service-role browser writes |

## Root-cause clusters

| Cluster | Bugs | Root cause |
|---|---|---|
| A — runtime/state lifecycle | 01 | valid PDF packet was recorded, but automatic calculation was awaited before existing human-review popup presentation |
| B — document evidence vs confirmation | 02, 04 | technical truth vocabulary leaked into UX and document-found coverage was summarized as absent when not confirmed |
| C — relationship/identity convergence | 03, 10 | productive relationship authority existed, but presentation exposed architecture and cross-module context depends on authoritative LINKED identity |
| D — presentation/copy mapping | 06, 09, 11, 12 | product UI surfaced diagnostic/domain vocabulary and repeated explanations instead of commercial meaning |
| E — modal/layout primitives | 05, 07 | context/message workspaces underused viewport and overexposed controls/technical configuration |
| F — communication/AI authority | 07, 08 | governed NASH chain already existed; UX made the renderer look like the authority instead of Forge intent + human approval |

## Architectural outcome

- No new CRM.
- No new Policy Intelligence.
- No new Relationship Intelligence.
- No new Pipeline Intelligence.
- No new Revenue/Compensation engine.
- No name-based identity resolution.
- No LLM business authority.
- No RLS relaxation.
- No service-role browser path.
- No extracted document field promoted to confirmed truth by presentation.

GOVERNANCE_IMPLEMENTATION_SCOPE=BOUNDED_REPAIR
ADR_GATE_PRE_CI=READY_FOR_VERIFICATION
