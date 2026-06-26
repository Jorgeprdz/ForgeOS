# FORGE CONSTITUTION DIGEST 001

## 1. Purpose

This digest is an operational constitutional index for Forge OS.

It helps future implementation blocks quickly understand existing ADRs, addenda, PAQs, boundaries, ownership rules, DENY / ALLOW rules, dependencies, locked phrases and implementation prohibitions.

This digest does not replace any ADR.

This digest does not replace the Constitution Map.

This digest does not authorize implementation.

When this digest conflicts with a source ADR, the root Constitution or the Constitution Map, the source document wins.

## 2. Source Authority

- Root constitution:
  - `FORGE_CONSTITUTION_V3.md`
- Constitution map:
  - `docs/01-constitution/FORGE_CONSTITUTION_MAP.md`
- Canonical ADR directory:
  - `adr/`
- Process ADR exception:
  - `docs/adr/ADR-0019_PROCESS_ADVANCEMENT_INTELLIGENCE.md`
- Working / transition docs:
  - `docs/adr/`
- Governance docs:
  - `docs/00-governance/`
- PAQs:
  - discovery / architecture / readiness material, not implementation approval by default

## 3. Non-Authority Rules

- This digest does not create new rules.
- This digest does not change ADR status.
- This digest does not authorize implementation.
- PAQ material does not authorize implementation unless explicitly promoted or separately approved.
- AI summaries are not source truth.
- If conflict exists, source ADR and Constitution Map win over digest.

## 4. Constitution Hierarchy

1. `FORGE_CONSTITUTION_V3.md`
2. `docs/01-constitution/FORGE_CONSTITUTION_MAP.md`
3. Canonical ADRs under `adr/`
4. Approved dependent addenda
5. Process ADR `ADR-0019`
6. Governance directives
7. PAQs and architecture readiness docs
8. Implementation handoffs

## 5. Layer Map

- Layer 1 Truth Governance:
  - ADR-001, ADR-002, ADR-005, ADR-006, ADR-007, ADR-008
- Layer 2 Authority Governance:
  - ADR-003, ADR-004
- Layer 3 Decision Intelligence:
  - ADR-009, ADR-012
- Layer 4 Interaction Intelligence:
  - ADR-010, ADR-011
- Layer 5 Human Intelligence:
  - ADR-013, ADR-014, ADR-015, ADR-016, ADR-016A
- Layer 6 Economic Intelligence:
  - ADR-017, ADR-018
- Layer 7 Operational Semantics:
  - readiness 001A, 001B, 001C
- Layer 8 Process Intelligence:
  - ADR-0019

## 6. Canonical ADR Registry

| ID | Title | Layer | Status as found | Effective authority note | Owner / Domain | Core boundary | Implementation authority |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ADR-001 | Evidence Ownership / Source Validity | Truth Governance | Proposed / Draft | File status may say Proposed/Draft, but Constitution Map treats ADR-001 through ADR-018 as constitutional foundation. Do not change status here. | Evidence / source truth | Evidence needs owner, source and validity state. | Does not authorize implementation by itself. |
| ADR-002 | One Metric One Owner | Truth Governance | Proposed / Draft | File status may say Proposed/Draft, but Constitution Map treats ADR-001 through ADR-018 as constitutional foundation. Do not change status here. | Metric ownership | One official metric has one conceptual owner. | Does not authorize implementation by itself. |
| ADR-003 | Recommendation vs Decision / Authority Boundary | Authority Governance | Proposed / Draft | File status may say Proposed/Draft, but Constitution Map treats ADR-001 through ADR-018 as constitutional foundation. Do not change status here. | Authority | Forge recommends; humans decide. | Does not authorize implementation by itself. |
| ADR-004 | No Invented Recommendations | Authority Governance | Proposed / Draft | File status may say Proposed/Draft, but Constitution Map treats ADR-001 through ADR-018 as constitutional foundation. Do not change status here. | Recommendation validity | No recommendation without evidence, context, uncertainty and authority boundaries. | Does not authorize implementation by itself. |
| ADR-005 | Product Truth Boundary | Truth Governance | Final | Canonical ADR under `adr/`. | Product Intelligence | Product claims require product truth. | Does not authorize implementation by itself. |
| ADR-006 | Policy Truth Boundary | Truth Governance | Final | Canonical ADR under `adr/`. | Policy Truth | Policy claims require policy truth. | Does not authorize implementation by itself. |
| ADR-007 | Forecast Truth Boundary | Truth Governance | Final | Canonical ADR under `adr/`. | Forecast Intelligence | Forecast is scenario, not fact. | Does not authorize implementation by itself. |
| ADR-008 | Economic Evidence Boundary | Truth Governance | Final | Canonical ADR under `adr/`. | Economic Evidence | Economic values require source, currency, period, rule, assumptions and limits. | Does not authorize implementation by itself. |
| ADR-009 | NBA Philosophy | Decision Intelligence | Final | Canonical ADR under `adr/`. | Next Best Action | Prioritize valid actions without inventing, deciding or executing. | Does not authorize implementation by itself. |
| ADR-010 | NASH Conversation Intelligence Boundary | Interaction Intelligence | Final | Canonical ADR under `adr/`. | NASH | Conversation language support without invented truth or manipulation. | Does not authorize implementation by itself. |
| ADR-011 | Relationship Non-Manipulation Boundary | Interaction Intelligence | Final | Canonical ADR under `adr/`. | Relationship Intelligence | Relationship signal is not permission or pressure. | Does not authorize implementation by itself. |
| ADR-012 | Business Planning Plan-to-Action Boundary | Decision Intelligence | Final | Canonical ADR under `adr/`. | Business Planning | Planning may guide action paths, not guarantee outcomes or mandate action. | Does not authorize implementation by itself. |
| ADR-013 | Mick Behavior Intelligence Boundary | Human Intelligence | Final | Canonical ADR under `adr/`. | Mick / Behavior Intelligence | Behavior evidence is not human worth or diagnosis. | Does not authorize implementation by itself. |
| ADR-014 | Productivity Metric Ownership Boundary | Human Intelligence | Final | Canonical ADR under `adr/`. | Productivity | Productivity metrics are not enforcement or human value. | Does not authorize implementation by itself. |
| ADR-015 | Manager Intelligence Authority Boundary | Human Intelligence | Final | Canonical ADR under `adr/`. | Manager Intelligence | Manager intelligence supports coaching, not automatic enforcement. | Does not authorize implementation by itself. |
| ADR-016 | Advisor Experience + Benvenù Anti-Dependence Boundary | Human Intelligence | Final | Canonical ADR under `adr/`. | Advisor Experience / Benvenù | Increase advisor capability, not dependency. | Does not authorize implementation by itself. |
| ADR-016A | Benvenù Purpose Scarcity + Dignity Boundary | Human Intelligence | FINAL / LOCKED CANDIDATE | Approved dependent addendum to ADR-016. | Purpose / Advisor Experience | Purpose is advisor-owned, event-gated, dignity-preserving and forgettable. | Does not authorize implementation. |
| ADR-017 | Compensation Intelligence Evidence Boundary | Economic Intelligence | Final | Canonical ADR under `adr/`. | Compensation Intelligence | Compensation requires evidence, rule snapshots, period context and payout truth boundaries. | Does not authorize implementation by itself. |
| ADR-018 | Economic Motivation Client First Boundary | Economic Intelligence | Final | Canonical ADR under `adr/`. | Economic Motivation | Money is context, never pressure; Client First remains above economic motivation. | Does not authorize implementation by itself. |
| ADR-0019 | Process Advancement Intelligence | Process Intelligence | LOCKED | Process ADR lives under `docs/adr`; do not confuse with ADR-019. | Process Advancement | Advancement beats activity; prospect owns decision, advisor owns process. | Does not authorize implementation by itself. |

## 7. Addendum Registry

| Addendum | Parent | What it adds | What it does not authorize | DENY boundaries | Pending implementation |
| --- | --- | --- | --- | --- | --- |
| ADR-016A | ADR-016 | Purpose scarcity, dignity, isolation, hard delete, TTL, no global LLM context, event-gated access. | Does not authorize Purpose Vault, schemas, UI, endpoints, engines or runtime changes. | DENY to NASH, Mick, Productivity, Manager Intelligence, ordinary Command OS, LLM Global Context and Economic Motivation. | Purpose Vault and ADR-016A implementation are NOT AUTHORIZED. |
| ROBOCOP AI Interpretation Addendum | ROBOCOP LOCK 001 | AI interprets; Forge decides; AI output is not source truth. | Does not authorize AI to override Forge. | AI cannot be fact, rule, policy, official metric, decision, product truth, forecast truth, compensation truth or manager judgment. | AI remains interpretation layer only. |

## 8. PAQ Registry

PAQs are discovery / architecture / readiness material unless explicitly promoted.

- Recruitment PAQ 01-08:
  - recruitment intelligence, domain modeling, market/P200, relationship activation and hardening reviews.
- Architecture Risk PAQ 08.5:
  - architecture risk correction and ratification material.
- Productivity PAQ 09/09.5:
  - productivity discovery and architecture lock material.
- Conservation PAQ 10/10.5:
  - conservation discovery and architecture lock material.
- Forecast PAQ 11/11.5/11.5.2:
  - forecast discovery, architecture and lock material.
- Advisor Experience PAQ 12/12.1:
  - advisor experience discovery and architecture material.
- Other PAQs found:
  - commercial events taxonomy, rule snapshot hardening, foundation lock reviews, partner intelligence discovery and related transition documents.

Rule: PAQs are not implementation approval by default.

## 9. Boundary Matrix

| Boundary | Governing ADR | Allows | Denies | Downstream risk if violated |
| --- | --- | --- | --- | --- |
| Evidence truth | ADR-001 | Use source-bound evidence with ownership and validity state. | Invented facts, ownerless truth, unlabeled unknowns. | Fake certainty and invalid decisions. |
| Product truth | ADR-005 | Explain products from valid product documentation. | Invented benefits, invented exclusions, product claims without source. | Bad product advice. |
| Policy truth | ADR-006 | State policy facts from valid policy evidence. | Quote-as-policy, upload-as-confirmed-policy, weak extraction as truth. | Operational falsehood. |
| Forecast truth | ADR-007 | Present scenarios with assumptions and limits. | Forecast as fact, guarantee, payout truth or enforcement. | False expectation and pressure. |
| Economic evidence | ADR-008 | Use money with evidence, currency, period and rule context. | Unsupported values, silent conversion, unknown as zero. | Invented financial truth. |
| Recommendation authority | ADR-003, ADR-004 | Recommend with evidence and human authority intact. | Forge deciding, executing or inventing recommendations. | Authority bypass. |
| Conversation intelligence | ADR-010 | Support language within truth and non-manipulation limits. | Manipulation, pressure scripts, invented client/product truth. | Client trust harm. |
| Relationship intelligence | ADR-011 | Identify relationship context and care opportunities. | Treating relationship as permission or inventory. | Manipulation and trust harm. |
| Business planning | ADR-012 | Convert goals, evidence and constraints into action paths. | Plans as guaranteed outcomes or mandates. | False progress and pressure. |
| Behavior intelligence | ADR-013 | Observe behavior patterns. | Human worth, diagnosis, surveillance or discipline judgment. | Dehumanization and manager misuse. |
| Productivity | ADR-014 | Own observable productivity metrics. | Enforcement, ranking-as-worth, duplicate metric truth. | Metric abuse. |
| Manager intelligence | ADR-015 | Support scoped coaching and review. | Auto-enforcement, labor judgment, surveillance. | Authority and trust harm. |
| Advisor experience | ADR-016 | Explain, orient and reduce friction while building capability. | Dependency, hidden pressure, business truth mutation. | Advisor dependence. |
| Purpose dignity | ADR-016A | Advisor-owned, event-gated purpose review. | Purpose leakage to NASH, Mick, Productivity, Manager, LLM global context. | Emotional pressure and privacy harm. |
| Compensation intelligence | ADR-017 | Interpret compensation with evidence and rule snapshots. | Invented payout, payout-first product advice, paid truth without statement. | Economic falsehood. |
| Economic motivation | ADR-018 | Present economic context with Client First. | Money as pressure, payout-first behavior, client manipulation. | Client First violation. |
| Process advancement | ADR-0019 | Advance processes based on evidence and ownership. | Activity as advancement, consent-boundary bypass. | Premature or unsafe action. |

## 10. DENY Matrix

| Domain | Key DENY |
| --- | --- |
| AI / LLM | AI cannot be source truth, rule, decision, official metric, product truth, forecast truth, compensation truth or manager judgment. |
| NASH | NASH cannot manipulate, invent truth or use advisor purpose. |
| Mick | Mick cannot judge human worth, diagnose, surveil or enforce. |
| Productivity | Productivity cannot become enforcement, human value or duplicate metric ownership. |
| Manager Intelligence | Manager Intelligence cannot auto-enforce, expose private purpose or turn metrics into labor judgment. |
| Command OS / Alfred | Ordinary Command OS cannot access purpose; Alfred cannot bypass Forge authority gates. |
| Revenue | Revenue cannot sum unknown, blocked, hidden-by-scope, not-modeled, potential or pending states as generated. |
| Compensation | Compensation cannot invent payout or treat payment proof as payout truth. |
| Economic Motivation | Economic Motivation cannot pressure clients or advisors with money. |
| Business Planning | Business Planning cannot convert plans, forecasts or goals into guaranteed outcomes. |
| Forecast | Forecast cannot be fact, payment truth or enforcement. |
| Evidence Inbox future agents | Evidence agents cannot create truth. They may move evidence toward confirmation only. |

## 11. ALLOW Matrix

| Domain | Allowed action | Required evidence / boundary | Human confirmation required? |
| --- | --- | --- | --- |
| Advisor Experience | Explain, orient, guide and reduce friction. | ADR-016, truth owner outputs, uncertainty labels. | When changing operational truth or protected context. |
| Benvenù | Create first value without dependency. | ADR-016, ADR-016A for purpose. | Yes for purpose capture/reuse. |
| Business Planning | Guide plan-to-action. | ADR-012, evidence, constraints, forecast labels. | Yes for commitments or operational changes. |
| NASH | Support conversation language. | ADR-010, ADR-011, ADR-004, source truth. | Yes before final action where authority applies. |
| Revenue | Aggregate evidence-confirmed economic states. | ADR-001, ADR-008, ADR-017, confirmation gates. | Yes upstream for policy/payment/statement confirmation. |
| Evidence agents | Move evidence toward confirmation. | Evidence packets, source ownership and confirmation gate. | Yes before confirmed operational data. |
| Manager Intelligence | Support coaching within scope. | ADR-015, scope boundaries, official metrics only. | Yes for governed actions or personnel-impacting decisions. |

## 12. Dependency Map

- ADR-001 -> ADR-002 -> ADR-003 -> ADR-004.
- Truth extensions:
  - ADR-005, ADR-006, ADR-007, ADR-008.
- Human intelligence:
  - ADR-013, ADR-014, ADR-015, ADR-016, ADR-016A.
- Economic intelligence:
  - ADR-017, ADR-018.
- Process intelligence:
  - ADR-0019.
- Revenue 001A/001B/001C depend on:
  - ADR-001, ADR-008, ADR-017, ADR-018, ADR-003, ADR-004.

## 13. Locked Phrases

- Evidence First.
- Unknown is not zero.
- Not modeled is not zero.
- Hidden by scope is not zero.
- Blocked is not zero.
- Forecast is not payout truth.
- Human authority precedes artificial authority.
- Client First precedes economic incentives.
- Capability precedes dependency.
- Purpose may guide. Purpose must not pressure.
- Purpose may be remembered. Purpose must also be forgettable.
- Money is context. Money is never pressure.
- Forge thinks. AI interprets.
- No declaration. No approval. No work.
- La póliza define la regla.
- El pago dispara la comisión.
- El estado de comisiones confirma payout truth.
- Forge agents do not create truth. Forge agents move evidence toward confirmation.
- Universal architecture. Contextual UI.
- Mi Día = motor de prioridad diaria por rol. No es sólo agenda. No es sólo asesor.

## 14. Implementation Prohibitions

- Do not implement from PAQ alone.
- Do not treat OCR/parser/AI extraction as truth.
- Do not sum unknown as zero.
- Do not default unknown carrier to SMNYL.
- Do not count potential/pending_payment as generated.
- Do not treat payment proof as payout truth.
- Do not treat forecast as payout truth.
- Do not expose advisor purpose to manager/NASH/Mick/Productivity/LLM Global Context.
- Do not build UI before contracts.
- Do not wire dashboard before truth layer.
- Do not mix constitutional docs with feature commits.

## 15. Known Inconsistencies / Drift

Document, do not fix:

- ADR-001 to ADR-004 status mismatch.
- ADR-0019 location under `docs/adr`.
- `docs/adr/ADR-0021` to `ADR-0026` exist but are not listed in Constitution Map.
- Filename convention drift.
- Operational readiness docs are not canonical ADRs.
- PAQs may be mistaken as implementation approval.

## 16. Future Block Intake Checklist

Before any new implementation block, require:

- Which ADR governs this?
- Which domain owns the metric/truth?
- What evidence is required?
- What is explicitly DENIED?
- Does this require human confirmation?
- Is this advisor-only, manager-visible or scope-gated?
- Is AI creating truth or only interpreting?
- Are unknown/not_modeled/blocked preserved?
- Does this belong in contracts before UI?
- Is there a commit boundary?
- Is there a handoff requirement?

## 17. Pending Blocks

- Evidence Inbox 002 - Contracts Only: paused until digest exists.
- Mi Día Role-Aware Action Runtime 001 - Read-Only Architecture Audit.
- Evidence-Bound Operations Agents: future only.
- ADR-016A implementation: NOT AUTHORIZED.
- Purpose Vault: NOT AUTHORIZED.
- Benvenù UI: NOT AUTHORIZED.

## 18. Final Guardrail

This digest is a map, not a license.
Forge must follow the source ADRs.
When uncertain, choose evidence, scope, human authority, and Client First.
