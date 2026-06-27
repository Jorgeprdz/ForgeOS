# TRUTH BOUNDARY 002 - Truth Type Contract

Status: DOCUMENTATION-ONLY ARCHITECTURE CONTRACT

Scope: TruthEnvelope, truth type fields, validation posture, transition rules

Implementation: None

Code authority: None

Date: 2026-06-18

## Constitutional Gate

Applicable Constitution:

- FORGE_CONSTITUTION_V3.md
- Evidence precedes judgment.
- No invented truth.
- Forecasts are suggestions, facts are facts.
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

- Truth Boundary
- Source Ownership
- Evidence State
- Rule Pack Governance
- Forge Orchestrator
- Alfred / Universal Command OS
- Product Intelligence
- Forecast Intelligence
- Compensation Intelligence
- Manager OS / Advisor OS boundary

Discovery status:

- Implementation ready for documentation-only contract design.
- No runtime implementation approved.
- No engine implementation approved.
- No schema implementation approved.
- No Alfred implementation approved.

Implementation readiness:

- Approved for documentation-only Truth Type Contract.
- Not approved for source code, schemas, engines, UI, routes, Supabase functions, tests, package changes, Build Tree changes, ADR edits or discovery doc edits.

Miranda approval:

- Approved for clear enforceable contracts that reduce false confidence and prevent invented truth.
- Blocked for any contract that lets AI, forecasts, assumptions, local fixtures or hardcoded values become truth without validation.

Board approval status:

| Board member | Contract role |
| --- | --- |
| Miranda | Quality/product discipline veto |
| Arqui Juve | Architecture contract owner |
| Nash | Conversation intelligence boundary |
| Patch Adams | Non-manipulation and human safety |
| Andrey | Manager OS / human capital judgment boundary |
| Joy Mangano | Usability and adoption clarity |

## Sources Inspected

- docs/05-truth/TRUTH_BOUNDARY_001_SOURCE_TRUTH_AND_EVIDENCE_STATE.md
- docs/00-governance/FORGE_ROBOCOP_DIRECTIVES.md
- docs/00-governance/FORGE_ROBOCOP_AI_INTERPRETATION_ADDENDUM.md
- AGENTS.md
- FORGE_CONSTITUTION_V3.md
- Relevant canonical ADRs listed above
- docs/03-discovery/FORGE_IMPLEMENTATION_READINESS_001A_SOURCE_OWNERSHIP_REGISTRY.txt
- docs/03-discovery/FORGE_IMPLEMENTATION_READINESS_001B_EVIDENCE_STATE_VOCABULARY.txt
- docs/03-discovery/FORGE_IMPLEMENTATION_READINESS_001C_REPORT.txt
- docs/03-discovery/FORGE_IMPLEMENTATION_READINESS_001D_UNKNOWN_STALE_CONFLICT_HANDLING_CONTRACT.txt
- docs/03-discovery/FORGE_IMPLEMENTATION_READINESS_001F_IMPLEMENTATION_PLAN_V0_1.txt

## Executive Summary

Forge thinks. AI interprets.

AI SHALL NOT OVERRIDE FORGE.

This contract defines the minimum documentation-level structure for future truth types, validators, guards, schemas or runtime helpers.

This document is not executable code and does not approve implementation.

## Canonical TruthEnvelope

TruthEnvelope is the canonical conceptual container for any Forge truth-bearing, evidence-bearing, recommendation-bearing, decision-support or AI-candidate output.

TruthEnvelope is a documentation contract, not a schema file.

Minimum fields:

| Field | Required | Meaning |
| --- | --- | --- |
| id | Yes | Stable identifier for the envelope. |
| truthType | Yes | Canonical truth type. |
| evidenceState | Yes | Current evidence state. |
| value | Yes | The claim, candidate, recommendation, scenario or decision-support value. |
| source | Yes | Source object or source reference. |
| provenance | Yes | Origin, capture path, timestamp, actor/system and source chain. |
| owner | Yes | Conceptual owner of the claim/source/metric/rule. |
| createdAt | Yes | Envelope creation timestamp. |
| updatedAt | Yes | Last update timestamp. |
| effectiveFrom | Conditional | Required for facts, source truth, rules, policy/product/forecast/compensation claims. |
| effectiveTo | Conditional | Required where source/rule/fact has expiry or period boundary. |
| confidenceClassification | Yes | Qualitative label only. No numeric human scoring. |
| unknowns | Yes | Explicit unknowns and missing evidence. |
| assumptions | Yes | Explicit assumptions; empty only when none apply. |
| validationStatus | Yes | Current validation posture. |
| validationMethod | Yes | How validation was or must be performed. |
| validationEvidence | Yes | Evidence supporting validation or explaining absence. |
| allowedUses | Yes | Permitted usage list from the allowedUses vocabulary. |
| prohibitedUses | Yes | Prohibited usage list from the prohibitedUses vocabulary. |
| visibilityScope | Yes | Where the envelope may be shown. |
| mutationAuthority | Yes | Who or what can mutate state from this envelope. |
| relatedADR | Yes | Governing ADR ids. |
| relatedConstitutionPrinciple | Yes | Governing constitutional principles. |
| boardBoundary | Yes | Board owner/veto if relevant. |
| mirandaApprovalRequired | Yes | Whether Miranda approval is required before use or escalation. |
| aiInvolvement | Yes | AI involvement declaration. |
| auditTrail | Yes | List of audit events, transitions, validations, overrides and blocks. |

## Controlled Vocabularies

truthType values:

- RAW_EVIDENCE
- EVIDENCE_PACKET
- FACT
- SOURCE_TRUTH
- RULE
- RULE_SNAPSHOT
- PRODUCT_TRUTH
- POLICY_TRUTH
- FORECAST
- ASSUMPTION
- UNKNOWN
- RECOMMENDATION
- DECISION_SUPPORT
- AI_INTERPRETATION
- AI_EXTRACTION_CANDIDATE
- AI_CLASSIFICATION_CANDIDATE
- USER_INPUT
- MANUAL_OVERRIDE
- HUMAN_DECISION

evidenceState values:

- MISSING
- UNVERIFIED
- EXTRACTED
- VALIDATED
- CONFLICTING
- STALE
- MANUAL
- OFFICIAL
- DEPRECATED
- BLOCKED
- AI_INTERPRETATION_VALIDATED_FOR_PRESENTATION

validationStatus values:

- not_validated
- validation_needed
- valid_for_source_packaging
- valid_for_fact_claim
- valid_for_source_truth
- valid_for_rule_snapshot
- valid_for_presentation
- valid_for_decision_support
- human_review_required
- blocked
- no_conclusion_possible

confidenceClassification values:

- high
- medium
- low
- provisional
- validation_needed
- stale
- conflicting
- unknown
- blocked

allowedUses values:

- display
- search_index
- ranking
- recommendation_input
- decision_support
- draft_generation
- user_confirmation_required
- state_mutation
- manager_visibility
- advisor_visibility
- audit_only
- blocked

prohibitedUses values:

- source_truth
- official_metric
- autonomous_decision
- compensation_calculation
- product_truth
- policy_truth
- manager_judgment
- advisor_os_judgment
- forecast_as_fact
- unvalidated_user_facing_claim
- mutation_without_confirmation

mutationAuthority values:

- none
- user_confirmed
- advisor_confirmed
- manager_confirmed
- system_validated
- official_source_sync
- rule_pack_update
- governance_approved
- blocked

visibilityScope values:

- internal_only
- advisor_os
- manager_os
- advisor_and_manager
- admin_only
- audit_only
- user_facing
- blocked

aiInvolvement values:

- none
- extraction_candidate
- classification_candidate
- summary
- explanation
- draft
- presentation_helper
- rejected

## Required Fields By Truth Type

All truth types require the full TruthEnvelope minimum field set. The table below lists extra requirements or strict constraints.

| truthType | Extra required fields / constraints |
| --- | --- |
| RAW_EVIDENCE | source, provenance, createdAt, owner candidate, capture method, unknowns, allowedUses limited to display/search_index/audit_only unless packaged. |
| EVIDENCE_PACKET | source, provenance, owner, evidenceState, validationEvidence, limitations, effectiveFrom/effectiveTo when period-bound. |
| FACT | owner, validationStatus valid_for_fact_claim, evidenceState VALIDATED or OFFICIAL, validationEvidence, effective period when applicable, auditTrail. |
| SOURCE_TRUTH | owner, official source/provenance, evidenceState OFFICIAL or VALIDATED, validationStatus valid_for_source_truth, relatedADR, boardBoundary when domain sensitive. |
| RULE | source truth reference, owner, relatedADR, effectiveFrom, effectiveTo when applicable, prohibitedUses blocking hardcoded/local fallback rule creation. |
| RULE_SNAPSHOT | rule source, Rule Pack or rule owner, effective period, snapshot timestamp, frozen source list, mutationAuthority rule_pack_update or governance_approved. |
| PRODUCT_TRUTH | carrier/product/version/period/source, ADR-005, validationEvidence, prohibitedUses preventing policy_truth and suitability by itself. |
| POLICY_TRUTH | policy id, source document/admin record/event, ADR-006, effective period, owner, validationEvidence, prohibitedUses preventing product_truth substitution. |
| FORECAST | assumptions, source inputs, forecast period/horizon, ADR-007, validationStatus valid_for_decision_support, prohibitedUses forecast_as_fact. Forecast must never be FACT. |
| ASSUMPTION | author/actor, rationale, scope, createdAt, unknowns, prohibitedUses source_truth and forecast_as_fact. |
| UNKNOWN | missing evidence list, owner if known, validation path, allowedUses display/audit_only/user_confirmation_required, mutationAuthority none or blocked. |
| RECOMMENDATION | evidence basis, owner, rationale, relatedADR ADR-003/ADR-004, allowedUses decision_support/user_confirmation_required, mutationAuthority none. |
| DECISION_SUPPORT | input envelopes, assumptions, unknowns, warnings, authority boundary, prohibitedUses autonomous_decision. |
| AI_INTERPRETATION | aiInvolvement declared, prompt/context/source inputs, allowedUses display/draft_generation only when validated for presentation, prohibitedUses source_truth/product_truth/policy_truth/autonomous_decision. |
| AI_EXTRACTION_CANDIDATE | source evidence, extraction method, aiInvolvement extraction_candidate, validationStatus validation_needed, prohibitedUses source_truth until Forge validation. |
| AI_CLASSIFICATION_CANDIDATE | class list, input context, aiInvolvement classification_candidate, validationStatus validation_needed, prohibitedUses manager_judgment/client_intent/autonomous_decision. |
| USER_INPUT | speaker/role, timestamp, context, authority, provenance, validation path, prohibitedUses source_truth without validation. |
| MANUAL_OVERRIDE | actor, permission, reason, prior state, new state, timestamp, auditTrail, mutationAuthority advisor_confirmed/manager_confirmed/governance_approved as applicable. |
| HUMAN_DECISION | actor, authority, decision, timestamp, scope, confirmation event, auditTrail, prohibitedUses AI/system impersonation. |

## EvidenceState Compatibility By Truth Type

| truthType | Compatible evidenceState | Contract notes |
| --- | --- | --- |
| RAW_EVIDENCE | UNVERIFIED, MANUAL, OFFICIAL, STALE, DEPRECATED | Cannot drive strong output before packaging. |
| EVIDENCE_PACKET | UNVERIFIED, VALIDATED, CONFLICTING, STALE, OFFICIAL, BLOCKED | Can support limited use until validated. |
| FACT | VALIDATED, OFFICIAL | FACT must be VALIDATED or OFFICIAL. |
| SOURCE_TRUTH | VALIDATED, OFFICIAL | Must have source owner and effective boundary. |
| RULE | VALIDATED, OFFICIAL | Cannot be created from hardcoded value alone. |
| RULE_SNAPSHOT | VALIDATED, OFFICIAL, DEPRECATED | DEPRECATED is historical only. |
| PRODUCT_TRUTH | VALIDATED, OFFICIAL, STALE, DEPRECATED | STALE/DEPRECATED cannot support current claims. |
| POLICY_TRUTH | VALIDATED, OFFICIAL, STALE, DEPRECATED | STALE/DEPRECATED require warning and block current strong claims. |
| FORECAST | VALIDATED, STALE, BLOCKED | Validated means scenario-valid, not fact-valid. |
| ASSUMPTION | UNVERIFIED, MANUAL, STALE, BLOCKED | Must stay labeled as assumption. |
| UNKNOWN | MISSING, CONFLICTING, BLOCKED | UNKNOWN must not drive mutation. |
| RECOMMENDATION | VALIDATED, STALE, BLOCKED | STALE requires downgrade; BLOCKED prevents output. |
| DECISION_SUPPORT | VALIDATED, STALE, CONFLICTING, BLOCKED | Must preserve warnings and assumptions. |
| AI_INTERPRETATION | UNVERIFIED, AI_INTERPRETATION_VALIDATED_FOR_PRESENTATION, BLOCKED | Cannot be VALIDATED as SOURCE_TRUTH. Presentation validation is not factual validation. |
| AI_EXTRACTION_CANDIDATE | EXTRACTED, UNVERIFIED, BLOCKED | Candidate only until Forge validates. |
| AI_CLASSIFICATION_CANDIDATE | EXTRACTED, UNVERIFIED, BLOCKED | Candidate only until Forge validates. |
| USER_INPUT | MANUAL, UNVERIFIED, VALIDATED, CONFLICTING, STALE | VALIDATED only for bounded claim after Forge validation. |
| MANUAL_OVERRIDE | MANUAL, VALIDATED, BLOCKED | Requires audit and authority. |
| HUMAN_DECISION | MANUAL, VALIDATED | Represents human action, not truth proof for unrelated domains. |

## Transition Rule Contract

Every transition statement must include:

- Required input truthType
- Required evidenceState
- Required validation
- Allowed output truthType
- Required audit event
- Blocked if

| Transition | Required input truthType | Required evidenceState | Required validation | Allowed output truthType | Required audit event | Blocked if |
| --- | --- | --- | --- | --- | --- | --- |
| RAW_EVIDENCE -> EVIDENCE_PACKET | RAW_EVIDENCE | UNVERIFIED, MANUAL, OFFICIAL | provenance_capture and owner_candidate_assignment | EVIDENCE_PACKET | evidence_packaged | source missing, owner impossible, prohibited source |
| EVIDENCE_PACKET -> FACT | EVIDENCE_PACKET | VALIDATED or OFFICIAL | owner, freshness, conflict, period and ADR validation | FACT | fact_validated | unknown owner, conflict unresolved, stale for current claim |
| OFFICIAL_DOCUMENT/SOURCE_TRUTH -> RULE_SNAPSHOT | SOURCE_TRUTH or EVIDENCE_PACKET from official document | OFFICIAL or VALIDATED | source owner, effective period, Rule Pack boundary | RULE_SNAPSHOT | rule_snapshot_created | hardcoded value, missing period, wrong Rule Pack |
| RULE_SNAPSHOT -> RULE_ENGINE_INPUT | RULE_SNAPSHOT | VALIDATED or OFFICIAL | consuming engine/domain approved and period matches | RULE_ENGINE_INPUT | rule_input_released | engine not approved, stale snapshot, wrong period |
| AI_EXTRACTION_CANDIDATE -> FACT | AI_EXTRACTION_CANDIDATE | EXTRACTED | Forge validation against source evidence and owner acceptance | FACT | ai_candidate_validated_to_fact | source absent, extraction conflict, owner rejection |
| AI_CLASSIFICATION_CANDIDATE -> RECOMMENDATION_INPUT | AI_CLASSIFICATION_CANDIDATE | EXTRACTED | Forge validation as advisory context only | RECOMMENDATION_INPUT | ai_classification_validated_for_input | classification implies client intent, human worth or source truth |
| FORECAST -> DECISION_SUPPORT | FORECAST | VALIDATED | assumptions, source inputs, horizon and uncertainty disclosed | DECISION_SUPPORT | forecast_released_as_decision_support | forecast_as_fact, hidden assumptions, stale inputs |
| RECOMMENDATION -> HUMAN_DECISION | RECOMMENDATION | VALIDATED | user authority and explicit confirmation | HUMAN_DECISION | human_decision_confirmed | autonomous decision, no confirmation, authority mismatch |
| USER_INPUT -> FACT | USER_INPUT | MANUAL or UNVERIFIED | speaker authority, source support and owner validation | FACT | user_input_validated_to_fact | unsupported statement, conflict, wrong authority |
| MANUAL_OVERRIDE -> FACT | MANUAL_OVERRIDE | MANUAL | permission, reason, prior state and governance/owner validation | FACT | manual_override_validated | missing audit trail, unauthorized actor, override hides conflict |
| PRODUCT_PDF_EVIDENCE -> PRODUCT_TRUTH | EVIDENCE_PACKET | OFFICIAL or VALIDATED | carrier/product/version/period/provenance validation under ADR-005 | PRODUCT_TRUTH | product_truth_validated | ambiguity, missing version, OCR-only evidence |
| POLICY_DOCUMENT -> POLICY_TRUTH | EVIDENCE_PACKET | OFFICIAL or VALIDATED | policy id, event/state, period and source validation under ADR-006 | POLICY_TRUTH | policy_truth_validated | product truth only, wrong policy, parser-only evidence |

Notes:

- RULE_ENGINE_INPUT and RECOMMENDATION_INPUT are transition outputs for future implementation planning. They are not approved runtime types by this document.
- Any future implementation must decide whether these are aliases, helper inputs or separate types through a separate approved scope.

## Blocked Transition Contract

| Blocked transition | Contract block statement |
| --- | --- |
| AI_INTERPRETATION -> FACT | Blocked. AI output is never source truth. It cannot validate itself or become fact without a separate source/evidence transition. |
| AI_INTERPRETATION -> SOURCE_TRUTH | Blocked. Source truth requires official source/provenance, owner and domain validation. |
| FORECAST -> FACT | Blocked. Forecast must never be FACT. |
| ASSUMPTION -> FACT | Blocked. Assumptions remain scenario inputs until independently validated by evidence. |
| USER_INPUT -> SOURCE_TRUTH without validation | Blocked. User input requires authority, provenance and owner validation before any higher truth claim. |
| HARD_CODED_VALUE -> RULE | Blocked. Rules require cited source, owner, effective period and Rule Pack or governance authority. |
| DISCOVERY_DOC -> IMPLEMENTATION_TRUTH | Blocked. Discovery does not authorize implementation. |
| MANAGER_SIGNAL -> ADVISOR_OS_JUDGMENT | Blocked. Manager signals may support governed Manager OS context, not Advisor OS judgment. |
| PRODUCT_PDF_AMBIGUITY -> PRODUCT_TRUTH | Blocked. Ambiguous product evidence must remain UNKNOWN, UNVERIFIED, CONFLICTING or BLOCKED. |
| LOCAL_FIXTURE -> RELEASE_TRUTH | Blocked. Local fixtures support local/manual validation only, not release truth. |

## AI Involvement Rules

- aiInvolvement must be declared.
- AI output is never source truth.
- AI may extract, classify, summarize, explain or draft.
- AI may not decide.
- AI may not mutate state.
- AI may not certify truth.
- AI may not approve governance.
- AI may not judge human worth, potential, loyalty, discipline, coachability or future success.
- AI may not create official metrics.
- AI may not override Forge.
- Forge validates before action.
- AI_INTERPRETATION_VALIDATED_FOR_PRESENTATION means the output is safe to show or explain; it does not mean the output is factually true.

## Alfred Contract Implications

- Alfred search index may index only allowed truthTypes.
- Alfred ranking must be based on Forge signals, not LLM guess.
- Alfred result cards must show truthType/evidence state where relevant.
- Alfred actions must obey mutationAuthority.
- Alfred must not bypass Forge.
- Slash search examples:
  - `/Carlos` returns indexed entities with context, not AI guesses.
  - A Carlos result may include `truthType: FACT` for validated entity identity and `evidenceState: VALIDATED`.
  - A summary line may include `truthType: AI_INTERPRETATION` only if labeled as interpretation and validated for presentation.
- Alfred may draft text, but any action with state mutation requires user confirmation and mutationAuthority other than none or blocked.
- Alfred must show UNKNOWN, STALE, CONFLICTING or BLOCKED states instead of smoothing them away.

## Orchestrator Contract Implications

- Orchestrator may consume FACT, SOURCE_TRUTH, RULE_SNAPSHOT, PRODUCT_TRUTH, POLICY_TRUTH, RECOMMENDATION, DECISION_SUPPORT and validated candidates only.
- Orchestrator must downgrade or block unsupported AI_INTERPRETATION.
- Orchestrator must preserve unknowns and assumptions.
- Orchestrator must not treat forecast, assumption, AI output, local fixture, discovery doc or hardcoded value as truth.
- Orchestrator must pass relatedADR, owner, evidenceState, validationStatus and prohibitedUses forward to downstream domains.
- Orchestrator must block outputs when prohibitedUses conflicts with the requested action.

## Manager OS / Advisor OS Implications

- Manager judgments must not leak into Advisor OS.
- Manager signals must be governed, evidence-backed and not human value judgments.
- Advisor OS may receive safe actionable recommendations, not RODI or human capital judgments.
- Manager OS visibility requires visibilityScope manager_os or advisor_and_manager and must respect boardBoundary Andrey/Patch Adams/Miranda as applicable.
- Advisor OS visibility must not expose manager_judgment, advisor_os_judgment, human worth labels or hidden pressure.
- AI cannot classify an advisor, candidate, client or manager as high value, low value, loyal, disloyal, worthy or unworthy.

## What This Contract Does NOT Authorize

This contract does not authorize:

- no runtime implementation
- no schema implementation
- no type file creation
- no validators
- no engines
- no Alfred implementation
- no DB indexing
- no Product Intelligence expansion
- no Forecast implementation
- no Compensation implementation
- no Manager OS expansion
- no UI work
- no routes
- no Supabase functions
- no tests
- no package changes
- no Build Tree status changes
- no ADR edits
- no discovery doc edits
- no git add
- no git commit
- no git push

## Recommended Next Sprint

Recommended next sprint:

SOURCE OWNERSHIP REGISTRY 001

Reason:

- The contract depends first on owner, source and claim ownership.
- Evidence State and validators should not be implemented before ownership is explicit.
- This is the most conservative next step and aligns with prior readiness 001A-001F.

Alternative planning-only follow-ups:

- EVIDENCE STATE CONTRACT 001
- RULE SNAPSHOT GOVERNANCE 001
- TRUTH BOUNDARY 003 - Validator Readiness Plan

## Final Status

PASS

READY FOR TRUTH TYPE CONTRACT LOCK
