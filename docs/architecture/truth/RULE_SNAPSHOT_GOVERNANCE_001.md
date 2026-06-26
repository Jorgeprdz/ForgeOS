# RULE SNAPSHOT GOVERNANCE 001 - Rule Pack & Effective Truth Boundary

Status: DOCUMENTATION-ONLY ARCHITECTURE CONTRACT

Scope: RuleSnapshot governance, Rule Pack boundary, effective-period truth, executable rule source control

Implementation: None

Code authority: None

Date: 2026-06-18

## Constitutional Gate

Applicable Constitution:

- FORGE_CONSTITUTION_V3.md
- Evidence precedes judgment.
- No invented truth.
- Forecasts are suggestions, facts are facts.
- Rule Packs must not contaminate Forge Core.
- Forge models reality, not UI.
- Precision > speed.
- Trust > features.
- Governance before execution.
- Forge assists human judgment and does not replace it.

Applicable ADRs:

- ADR-001 Evidence Ownership / Source Validity
- ADR-002 One Metric One Owner
- ADR-003 Recommendation vs Decision Authority Boundary
- ADR-004 No Invented Recommendations
- ADR-005 Product Truth Boundary
- ADR-006 Policy Truth Boundary
- ADR-007 Forecast Truth Boundary
- ADR-008 Economic Evidence Boundary
- ADR-010 NASH Conversation Intelligence Boundary
- ADR-011 Relationship Intelligence Non-Manipulation Boundary
- ADR-015 Manager Intelligence Authority Boundary
- ADR-017 Compensation Intelligence Evidence Boundary
- ADR-018 Economic Motivation Client First
- ADR-0019 Process Advancement Intelligence

Build Tree area:

- Rule Pack Governance
- Truth Boundary
- Source Ownership
- Evidence State
- Product Intelligence
- Forecast Intelligence
- Compensation Intelligence
- Career Intelligence
- Contest Intelligence
- Conservation Intelligence
- Forge Orchestrator

Discovery status:

- Implementation ready for documentation-only Rule Snapshot Governance.
- No runtime implementation approved.
- No engine implementation approved.
- No schema implementation approved.
- No Rule Pack implementation approved.

Implementation readiness:

- Approved for documentation-only Rule Snapshot Governance contract.
- Not approved for source code, schemas, engines, UI, routes, Supabase functions, tests, package changes or rule implementation.

Miranda approval:

- Approved only if this prevents hardcoded rules, invented rules, ambiguous effective dates and false commercial/product truth.
- Blocked for any contract that lets hardcoded values, AI output, OCR output, parser output, local fixtures, assumptions, forecasts or discovery docs become executable rules without source truth and validation.

Board approval status:

| Board member | Rule governance boundary |
| --- | --- |
| Miranda | Quality/product discipline veto |
| Arqui Juve | Architecture contract owner |
| Joy Mangano | Usability and adoption clarity |
| Andrey | Manager OS / compensation / human capital allocation boundary |
| Nash | Conversation intelligence boundary if NASH consumes rules |
| Patch Adams | Client-first / non-manipulation boundary |

## Sources Inspected

- docs/architecture/truth/TRUTH_BOUNDARY_001_SOURCE_TRUTH_AND_EVIDENCE_STATE.md
- docs/architecture/truth/TRUTH_BOUNDARY_002_TRUTH_TYPE_CONTRACT.md
- docs/architecture/truth/SOURCE_OWNERSHIP_REGISTRY_001.md
- docs/architecture/truth/EVIDENCE_STATE_CONTRACT_001.md
- docs/00-governance/FORGE_ROBOCOP_DIRECTIVES.md
- docs/00-governance/FORGE_ROBOCOP_AI_INTERPRETATION_ADDENDUM.md
- AGENTS.md
- FORGE_CONSTITUTION_V3.md
- adr/ADR-001 through ADR-008, ADR-010, ADR-011, ADR-015, ADR-017, ADR-018
- docs/adr/ADR-0019_PROCESS_ADVANCEMENT_INTELLIGENCE.md

## Executive Summary

Forge thinks. AI interprets.

AI SHALL NOT OVERRIDE FORGE.

This governance contract defines how a commercial, product, compensation, contest, career, forecast-assumption, conservation or carrier rule can become a valid RuleSnapshot without contaminating Forge Core.

RuleSnapshot governance exists to prevent silent hardcoding, undocumented business logic, stale rules, invented compensation and false product truth.

This document is not a Rule Pack implementation. It does not create rules, loaders, validators, engines, schemas or runtime behavior.

## RuleSnapshot Definition

A RuleSnapshot is a versioned, source-backed, effective-period-bound rule set.

A valid RuleSnapshot represents a frozen rule interpretation for a defined domain, owner, source, version, period, jurisdiction, currency/unit context and allowed use.

A RuleSnapshot must not be:

- an assumption
- a forecast
- an AI interpretation
- OCR output
- parser output
- user memory
- local fixture
- hardcoded value
- discovery document
- undocumented business logic

## Canonical RuleSnapshot Fields

| Field | Requirement | Governance meaning |
| --- | --- | --- |
| id | Required | Stable RuleSnapshot identifier. |
| ruleSnapshotType | Required | Canonical type of the rule snapshot. |
| domain | Required | Owning Forge domain. |
| carrier | Conditional | Required when rule is carrier-specific. |
| product | Conditional | Required when rule is product-specific. |
| distributionChannel | Conditional | Required when rule differs by channel. |
| sourceOwner | Required | Owner from Source Ownership Registry. |
| sourceDocument | Required | Source document or official source reference. |
| sourceDocumentVersion | Required when versioned | Version used to freeze the snapshot. |
| sourceDocumentDate | Required | Source publication, issue or effective document date. |
| sourceDocumentHash or evidence reference | Required | Hash, evidence packet id or immutable evidence reference. |
| effectiveFrom | Required | First date the snapshot may apply. |
| effectiveTo | Conditional | End date; may be null only when source explicitly supports current validity. |
| jurisdiction | Conditional | Required where legal, product, carrier, office or market rules vary by jurisdiction. |
| currency | Conditional | Required for monetary rules, premiums, compensation, projections, rates or economic outputs. |
| units | Conditional | Required for rates, percentages, counts, UDI, yields, points, policy years or activity targets. |
| rulePackId | Required | Parent Rule Pack or governance grouping. |
| rulePackVersion | Required | Version of the parent Rule Pack. |
| createdAt | Required | Snapshot creation timestamp. |
| updatedAt | Required | Last metadata update timestamp. |
| validationStatus | Required | Validation status under Truth Type Contract. |
| evidenceState | Required | VALIDATED, OFFICIAL or DEPRECATED for valid snapshots; BLOCKED for invalid snapshots. |
| relatedADR | Required | Applicable ADRs. |
| relatedConstitutionPrinciple | Required | Applicable constitutional principles. |
| boardBoundary | Required | Board owner/veto boundary where relevant. |
| mirandaApprovalRequired | Required | Whether Miranda approval is required before use or release. |
| allowedUses | Required | Allowed use values from Truth Type Contract/Evidence State Contract. |
| prohibitedUses | Required | Prohibited use values that must travel with the snapshot. |
| mutationAuthority | Required | rule_pack_update, governance_approved or blocked. |
| auditTrail | Required | Creation, validation, deprecation and replacement events. |
| deprecationStatus | Required | active, deprecated, superseded, blocked or pending_review. |
| replacementSnapshotId | Conditional | Required when superseded or replaced. |

## ruleSnapshotType Values

- product_rule
- policy_rule
- compensation_rule
- contest_rule
- career_rule
- conservation_rule
- forecast_assumption_rule
- medical_expense_rule
- retirement_rule
- education_savings_rule
- life_survival_benefit_rule
- manager_governance_rule
- advisor_os_rule
- alfred_command_authority_rule

## Domains And Ownership Expectations

| Domain | Owns | RuleSnapshot expectation |
| --- | --- | --- |
| Product Intelligence | Product rules and product truth interpretation | Requires official product documents or validated carrier documents with product/version/period. |
| Policy Intelligence | Policy-specific operational rules | Requires policy document/admin source and policy scope; cannot generalize into product rules. |
| Compensation Intelligence | Compensation rule interpretation | Requires rule_pack/rule_snapshot owner, official source, effective dates and period context. |
| Forecast Intelligence | Forecast assumption rules | Requires assumptions, source inputs, uncertainty and disclosure; forecast remains decision support. |
| Contest Intelligence | Contest eligibility/scoring rules | Requires contest source, period, channel and metric owner. |
| Career Intelligence | Career stage/promotion rules | Requires career system source, period and Rule Pack context. |
| Conservation Intelligence | Conservation, persistency or quality index rules | Requires official or Rule Pack source; local predictive signals are not official indexes. |
| Manager OS | Manager visibility/allocation/governance rules | Requires governed source, Miranda Wall boundary and no human value judgment. |
| Advisor OS | Advisor-facing action and safety rules | Requires evidence-backed recommendations and cannot consume hidden Manager OS judgments. |
| Alfred / Universal Command OS | Command authority rules | Requires governance source where command behavior depends on permission, mutation or authority. |

## Allowed Sources For RuleSnapshot Creation

- official_document
- carrier_document
- policy_document
- quote_document, only where appropriate and not as general product rule
- governance_decision
- validated rule_pack
- validated rule_snapshot
- official external API, only with provenance

Allowed sources must carry source owner, provenance, effective period, evidenceState VALIDATED/OFFICIAL and audit trail.

## Prohibited Sources For RuleSnapshot Creation

- AI_interpretation
- OCR_output
- parser_output
- local_fixture
- hardcoded_value
- user_input without validation
- spreadsheet without owner/provenance
- discovery_doc
- forecast
- assumption
- memory
- undocumented business logic

Prohibited sources may support research, extraction candidates, discovery notes or audit questions. They cannot create executable rules.

## Allowed Transitions

| Transition | Required validation | Allowed output | Required audit event | Blocked if |
| --- | --- | --- | --- | --- |
| SOURCE_TRUTH -> RULE_SNAPSHOT | Source owner, effective period, Rule Pack boundary and conflict validation | RuleSnapshot | rule_snapshot_created_from_source_truth | Source lacks owner/version/effective period |
| official_document -> RULE_SNAPSHOT | Official source check and scope validation | RuleSnapshot | official_rule_snapshot_created | Official document does not govern the rule claim |
| carrier_document -> RULE_SNAPSHOT | Carrier/source/version/product/channel validation | RuleSnapshot | carrier_rule_snapshot_created | Carrier source is ambiguous, stale or unsupported |
| policy_document -> POLICY_RULE_SNAPSHOT | Policy identity, event/state and period validation | Policy-scoped RuleSnapshot | policy_rule_snapshot_created | Policy source is used as general product rule |
| rule_pack -> RULE_SNAPSHOT | Rule Pack governance approval and source traceability | RuleSnapshot | rule_snapshot_created_from_rule_pack | Rule Pack lacks source docs or effective period |
| RULE_SNAPSHOT -> RULE_ENGINE_INPUT | Active snapshot, VALIDATED/OFFICIAL state, period match and consuming domain approval | Rule engine input | rule_snapshot_released_to_engine | Runtime/engine implementation is not separately approved |
| RULE_SNAPSHOT -> DEPRECATED | Replacement, expiry, supersession or governance decision | Deprecated RuleSnapshot | rule_snapshot_deprecated | Prior version is erased or hidden |
| DEPRECATED -> BLOCKED | Current use attempt or unsafe historical use | BLOCKED | deprecated_snapshot_blocked | Deprecated snapshot is used as current rule |
| RULE_SNAPSHOT -> replacement RULE_SNAPSHOT only with audit trail | New source/version/effective period and replacement relationship | Replacement RuleSnapshot | rule_snapshot_replaced | Replacement breaks historical traceability |

## Blocked Transitions

- HARD_CODED_VALUE -> RULE is blocked because rules require source, owner, effective period and governance.
- HARD_CODED_VALUE -> RULE_SNAPSHOT is blocked because Hardcoded values cannot own rules.
- AI_INTERPRETATION -> RULE_SNAPSHOT is blocked because AI output is not source truth.
- OCR_OUTPUT -> RULE_SNAPSHOT is blocked because OCR is extraction evidence, not rule authority.
- PARSER_OUTPUT -> RULE_SNAPSHOT is blocked because parser output is candidate extraction, not source truth.
- FORECAST -> RULE_SNAPSHOT is blocked because Forecast is never fact.
- ASSUMPTION -> RULE_SNAPSHOT is blocked because assumptions are planning context, not rules.
- DISCOVERY_DOC -> RULE_SNAPSHOT is blocked because Discovery does not authorize implementation.
- LOCAL_FIXTURE -> RULE_SNAPSHOT is blocked because local fixtures are not release truth.
- USER_INPUT -> RULE_SNAPSHOT without validation is blocked because user input must be validated against source authority.
- STALE_SOURCE -> ACTIVE_RULE_SNAPSHOT without review is blocked because expired or stale evidence cannot drive current rules silently.
- CONFLICTING_SOURCE -> RULE_SNAPSHOT without reconciliation is blocked because conflict must be resolved before executable rule creation.

## Effective-Date Rules

- Every RuleSnapshot must have effectiveFrom.
- effectiveTo may be null only if the source explicitly supports current validity.
- Unknown effective dates block executable use.
- Expired snapshots cannot drive active recommendations without disclosure.
- Future snapshots cannot be treated as current rules.
- Overlapping snapshots require conflict resolution.
- RuleSnapshot changes must preserve prior versions.
- Effective period must match carrier, channel, jurisdiction, product, currency and unit context where those dimensions affect the rule.
- Historical calculations must use the RuleSnapshot active for the historical period unless an explicitly separate analysis says otherwise.

## Rule Pack Relationship

- Rule Pack is a grouped collection of RuleSnapshots.
- Forge Core must not contain carrier/distribution-specific business rules.
- Rule Packs may be carrier-specific, product-specific, jurisdiction-specific, channel-specific or period-specific.
- Rule Packs must cite source documents and effective periods.
- Rule Packs cannot override Constitution or ADRs.
- Rule Packs cannot authorize unethical or non-client-first behavior.
- SMNYL-specific rules must live in Rule Packs, not Forge Core.
- Rule Packs interpret facts; they do not create facts.
- Rule Packs may consume Product Truth, Policy Truth, Production Events, Evidence Packets and source-owned metrics, but must not redefine their owners.

## Compensation Intelligence Implications

- Compensation owner must be rule_pack/rule_snapshot, not Forge Core.
- Compensation calculations require active validated RuleSnapshot.
- Hardcoded values remain BLOCKED for compensation.
- Income projections require explicit assumptions and cannot become official metrics.
- Economic motivation cannot override client-first boundaries.
- Compensation rules must cite source, period, currency, units, metric owner and Rule Pack version.
- Compensation must not mix periods, carriers, channels, commission schedules, contest rules or manager compensation rules unless a validated RuleSnapshot explicitly allows the composition.

## Product Intelligence Implications

- Product rules require official product documents or validated carrier documents.
- OCR/parser may produce extraction candidates, not product rules.
- UDI, premiums, benefits, yields, rates, coverage and medical expense rules cannot become executable without RuleSnapshot.
- GMM/Alfa Medical rules must cite source and effective period before expansion.
- Product Knowledge Library does not automatically create Product Truth or executable rules.
- Product Intelligence may consume RuleSnapshots only when product, carrier, version, jurisdiction, currency, units and effective period match the requested claim.

## Forecast Implications

- Forecast assumptions may be documented separately, but forecast is never fact.
- Forecast assumption rules must disclose assumptions, source and uncertainty.
- Forecast outputs are DECISION_SUPPORT, not official metrics.
- Forecast cannot create RuleSnapshots for product, compensation, contest, career, conservation or policy rules.
- Forecast may consume RuleSnapshots for scenario constraints only when the snapshot is active, validated and disclosed.

## Alfred / Orchestrator Implications

- Alfred cannot execute rule-based commands from AI output.
- Alfred command authority rules require RuleSnapshot only where command behavior depends on governance rules.
- Orchestrator may consume only active, validated RuleSnapshots.
- Orchestrator must block expired, conflicting, unknown-owner or stale snapshots unless explicitly allowed as disclosed decision support.
- Alfred must not bypass Forge, RuleSnapshot validation, permission boundaries or Miranda approval.
- Orchestrator must preserve effectiveFrom, effectiveTo, source owner, evidenceState, prohibitedUses and audit trail when passing rules downstream.

## Manager OS / Advisor OS Implications

- Manager OS may consume governed RuleSnapshots for visibility, allocation and coaching boundaries.
- Manager OS cannot create human value judgments from rules.
- Advisor OS must not receive Manager OS judgments or RODI-style allocation rules.
- Miranda Wall remains active.
- Manager OS allocation, compensation, career and coaching rules must remain governed and source-backed.
- Advisor OS may receive safe actionable recommendations only when RuleSnapshot use is valid for Advisor OS visibility and does not leak Manager OS judgment.

## RuleSnapshot Validation Checklist

Before a RuleSnapshot can be considered valid, the record must answer:

- What is the source owner?
- What source document or official source supports the rule?
- What version/date/hash or evidence reference freezes the source?
- What domain owns the rule interpretation?
- What Rule Pack owns the grouped rule context?
- What effectiveFrom and effectiveTo define applicability?
- What carrier, product, channel, jurisdiction, currency and units apply?
- What ADRs and constitutional principles constrain the rule?
- What Board boundary applies?
- Does Miranda approval apply?
- What uses are allowed?
- What uses are prohibited?
- What mutation authority is allowed?
- What audit trail proves creation, validation, deprecation or replacement?

If any required answer is missing, the RuleSnapshot is BLOCKED.

## What this governance does NOT authorize

This governance does not authorize:

- no runtime implementation
- no schema implementation
- no validator implementation
- no Rule Pack implementation
- no engine implementation
- no Alfred implementation
- no Product Intelligence expansion
- no Forecast implementation
- no Compensation implementation
- no Manager OS expansion
- no source code edits
- no test edits
- no route changes
- no Supabase function changes
- no package changes
- no Build Tree status changes
- no ADR edits
- no discovery doc edits

## Recommended next sprint

Recommended next sprint: TRUTH BOUNDARY 003 - Validator Readiness Plan.

Rationale:

- Truth Boundary 001 defined categories and authority order.
- Truth Boundary 002 defined the TruthEnvelope contract.
- Source Ownership Registry 001 defined owners and precedence.
- Evidence State Contract 001 defined validation states.
- Rule Snapshot Governance 001 defines effective rule truth and Rule Pack boundaries.
- A validator readiness plan is now the conservative next step before implementation of validators, Rule Pack loaders, Alfred authority, Product Intelligence expansion, Forecast implementation or Compensation implementation.

## Final Status

Recommendation: READY FOR RULE SNAPSHOT GOVERNANCE LOCK.

Miranda approval: yes, documentation-only and boundary-strengthening.

Implementation authority: none.

Runtime authority: none.
