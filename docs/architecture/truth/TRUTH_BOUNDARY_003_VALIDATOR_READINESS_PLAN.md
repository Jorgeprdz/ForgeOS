# TRUTH BOUNDARY 003 - Validator Readiness Plan

Status: DOCUMENTATION-ONLY READINESS PLAN

Scope: Future validator/guard readiness for Truth Boundary, Source Ownership, Evidence State and RuleSnapshot governance

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

- Truth Boundary
- Validator Readiness
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

- Implementation ready for documentation-only Validator Readiness Plan.
- No runtime implementation approved.
- No validator implementation approved.
- No engine implementation approved.
- No schema implementation approved.

Implementation readiness:

- Approved for documentation-only readiness planning.
- Not approved for source code, schemas, engines, UI, routes, Supabase functions, tests, package changes or validator implementation.

Miranda approval:

- Approved only if this plan makes future implementation safer, smaller, testable and more governed.
- Blocked for any plan that recommends building validators without tests, source ownership, evidence states, RuleSnapshot governance or AI override prevention.

Board approval status:

| Board member | Readiness boundary |
| --- | --- |
| Miranda | Quality/product discipline veto |
| Arqui Juve | Architecture readiness owner |
| Nash | Conversation/NASH boundary if conversation truth is touched |
| Patch Adams | Non-manipulation and human safety |
| Andrey | Manager OS / human capital boundary |
| Joy Mangano | Usability and adoption clarity |

## Sources Inspected

- docs/architecture/truth/TRUTH_BOUNDARY_001_SOURCE_TRUTH_AND_EVIDENCE_STATE.md
- docs/architecture/truth/TRUTH_BOUNDARY_002_TRUTH_TYPE_CONTRACT.md
- docs/architecture/truth/SOURCE_OWNERSHIP_REGISTRY_001.md
- docs/architecture/truth/EVIDENCE_STATE_CONTRACT_001.md
- docs/architecture/truth/RULE_SNAPSHOT_GOVERNANCE_001.md
- docs/00-governance/FORGE_ROBOCOP_DIRECTIVES.md
- docs/00-governance/FORGE_ROBOCOP_AI_INTERPRETATION_ADDENDUM.md
- AGENTS.md
- FORGE_CONSTITUTION_V3.md
- adr/ADR-001 through ADR-008, ADR-010, ADR-011, ADR-015, ADR-017, ADR-018
- docs/adr/ADR-0019_PROCESS_ADVANCEMENT_INTELLIGENCE.md

## Executive Summary

Forge thinks. AI interprets.

AI SHALL NOT OVERRIDE FORGE.

This plan defines the readiness path for future Truth Boundary validators and guards.

It does not implement validators, guards, schemas, runtime helpers, engines, tests, Alfred behavior, Orchestrator behavior or domain features.

The future validator layer must enforce existing contracts. It must not invent rules, infer business truth, call LLMs, mutate state or bypass ROBOCOP LOCK.

## Validator Readiness Principle

- Validators must enforce contracts, not invent rules.
- Validators must be small, deterministic, testable, and composable.
- Validators must never call LLMs.
- Validators must not mutate state.
- Validators must return pass/fail/block/degrade results with reasons.
- Validators must preserve unknowns and assumptions.
- Validators must produce audit-friendly outputs.
- Validators must never upgrade AI, OCR, parser, forecast, assumption, local fixture, stale evidence, conflicting evidence or discovery content into truth without the required source/owner/evidence path.
- Validators must be offline-first and must not require external AI providers.

## Canonical Validator Output Contract

Future validators should return a conceptual validation result with these fields:

| Field | Required | Meaning |
| --- | --- | --- |
| validatorId | Yes | Stable validator identifier. |
| status | Yes | PASS / FAIL / BLOCK / DEGRADE / NEEDS_REVIEW. |
| reason | Yes | Human-readable reason for the result. |
| evidence | Yes | Evidence ids, source refs or contract lines used. |
| blockedTransition | Conditional | Required when a transition is blocked. |
| relatedTruthType | Conditional | Truth type affected by the result. |
| relatedEvidenceState | Conditional | Evidence state affected by the result. |
| relatedOwnerType | Conditional | Owner type affected by the result. |
| relatedADR | Yes | Applicable ADRs. |
| relatedConstitutionPrinciple | Yes | Applicable constitutional principles. |
| recommendedAction | Yes | Block, degrade, request validation, allow display, allow decision support or pass. |
| auditEventRequired | Yes | Whether a future audit event must be emitted. |
| userFacingMessageAllowed | Yes | Whether the result can be shown to users. |

Allowed result statuses:

- PASS: contract conditions are satisfied for the requested use.
- FAIL: input is invalid, malformed or missing required contract fields.
- BLOCK: requested use violates Constitution, ADR, ROBOCOP, truth boundary or prohibited transition.
- DEGRADE: use may proceed only at a weaker level, with labels, disclosure or reduced authority.
- NEEDS_REVIEW: evidence is insufficient for automated validation and requires governance/domain review.

## Recommended Validator Families

| Validator family | Purpose | Governing contracts | Inputs | Outputs | May validate | Must never decide | Required tests | Required fixtures | Risks | Miranda approval condition | Board owner/veto | Recommended phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TruthEnvelope required field validator | Ensure required envelope fields exist before any truth-bearing output is used. | TRUTH_BOUNDARY_002 | TruthEnvelope-like object, requested use | PASS/FAIL/BLOCK with missing fields | Presence, shape and required field completeness | Whether a claim is true | Missing id, owner, evidenceState, relatedADR, auditTrail | Minimal valid and invalid envelopes | False pass from partial data | Blocks incomplete envelopes and preserves unknowns | Arqui Juve / Miranda | PHASE A |
| truthType compatibility validator | Check truthType against allowed evidence states, uses and prohibited transitions. | TRUTH_BOUNDARY_001, TRUTH_BOUNDARY_002 | truthType, evidenceState, requested transition/use | PASS/BLOCK/DEGRADE | Compatibility between truthType and use | Source authority or business decision | AI_INTERPRETATION cannot become FACT; FORECAST cannot become FACT | Truth type transition fixtures | Upgrading weak claims | Blocks forbidden truth transitions | Miranda / Arqui Juve | PHASE A |
| EvidenceState compatibility validator | Ensure evidenceState supports requested display, ranking, recommendation or mutation. | EVIDENCE_STATE_CONTRACT_001 | evidenceState, truthType, requested use | PASS/BLOCK/DEGRADE/NEEDS_REVIEW | State/use compatibility | Domain truth itself | UNVERIFIED cannot become FACT; STALE needs disclosure | State matrix fixtures | Hidden false confidence | Degrades stale/weak/conflicting evidence | Miranda | PHASE A |
| SourceOwnership validator | Enforce owner requirements and one-owner metric boundaries. | SOURCE_OWNERSHIP_REGISTRY_001, ADR-001, ADR-002 | ownerType, metric owner, source owner, claim owner | PASS/FAIL/BLOCK | Owner presence, precedence, conflicts, one metric one owner | Conflict resolution as final authority | UNKNOWN_OWNER cannot validate; duplicate metric owner blocks | Owner type fixtures | Silent owner ambiguity | Blocks truth without owner | Miranda / Arqui Juve | PHASE A |
| RuleSnapshot validity validator | Verify RuleSnapshot required fields, source, effective period and active/deprecated state. | RULE_SNAPSHOT_GOVERNANCE_001 | RuleSnapshot-like object, requested period/use | PASS/FAIL/BLOCK/DEGRADE | Snapshot completeness, active period, source/effective dates | Rule correctness beyond source contract | Expired snapshot blocked; missing effectiveFrom fails | Active, expired, stale, conflicting snapshots | Contaminating Forge Core | Blocks hardcoded/stale/unknown-owner rules | Arqui Juve / Miranda | PHASE B |
| AI output boundary validator | Keep AI outputs labeled and prevent override. | ROBOCOP AI addendum, TRUTH_BOUNDARY_001/002 | aiInvolvement, truthType, requested use | PASS/BLOCK/DEGRADE | AI label, allowed AI uses, presentation-only validation | Fact truth, decision, mutation, approval | AI_INTERPRETATION cannot become FACT; AI cannot mutate | AI draft/summary/classification fixtures | AI override by prose | Blocks AI as source truth | Miranda / Nash / Patch Adams | PHASE C |
| Forecast boundary validator | Ensure forecasts remain decision support and disclose assumptions. | ADR-007, TRUTH_BOUNDARY_001/002, EVIDENCE_STATE_CONTRACT_001 | forecast envelope, assumptions, requested use | PASS/BLOCK/DEGRADE | Forecast labeling, assumptions, horizon, source inputs | Fact truth or official metric | FORECAST cannot become FACT; forecast_as_fact blocked | Forecast with/without assumptions | Income promise or false certainty | Blocks forecast as fact | Miranda / Patch Adams | PHASE B |
| Compensation boundary validator | Ensure compensation only runs with active validated RuleSnapshot and evidence. | ADR-008, ADR-017, RULE_SNAPSHOT_GOVERNANCE_001 | compensation request, RuleSnapshot, source/effective dates | PASS/BLOCK/NEEDS_REVIEW | Required rule snapshot, source, period, currency, metric owner | Payment truth without evidence | Compensation cannot run without active validated RuleSnapshot | Valid/missing/expired compensation snapshots | Invented income | Blocks compensation without rule source | Andrey / Miranda | PHASE B |
| Alfred search/index boundary validator | Prevent Alfred from ranking or acting from LLM guesses. | TRUTH_BOUNDARY_001/002, SOURCE_OWNERSHIP_REGISTRY_001, EVIDENCE_STATE_CONTRACT_001 | search result, ranking signals, evidence labels, requested action | PASS/BLOCK/DEGRADE | Index/ranking source labels, mutation authority, evidence labels | Entity truth by LLM guess | Alfred ranking cannot use LLM guess as primary ranking signal | Search ranking fixtures | Search looks confident from AI | Blocks LLM ranking authority | Arqui Juve / Nash / Miranda | PHASE C |
| Advisor OS / Manager OS boundary validator | Prevent Manager OS judgments and human value labels leaking into Advisor OS. | TRUTH_BOUNDARY_001/002, ADR-011, ADR-015 | OS target, signal type, requested visibility, judgment labels | PASS/BLOCK/DEGRADE | Visibility, Miranda Wall, human judgment labels | Human worth, loyalty, potential, discipline as truth | MANAGER_SIGNAL cannot become ADVISOR_OS_JUDGMENT; human value label blocked | Manager/advisor visibility fixtures | Harmful or punitive outputs | Blocks judgment leaks | Andrey / Patch Adams / Miranda | PHASE D |
| Discovery implementation blocker | Block implementation from Discovery/Candidate/Deferred docs. | ROBOCOP directives, AGENTS.md, Build Tree governance | source doc status, requested implementation | PASS/BLOCK | Discovery status and implementation readiness | Whether feature should exist | Discovery does not authorize implementation | Discovery/candidate/status fixtures | Premature implementation | Blocks non-ready work | Miranda / Arqui Juve | PHASE C |
| Local fixture / release truth blocker | Prevent local/manual fixtures from becoming release truth. | EVIDENCE_STATE_CONTRACT_001, TRUTH_BOUNDARY_002 | fixture source, release claim, evidenceState | PASS/BLOCK/DEGRADE | Fixture scope and release truth misuse | Real-world truth | LOCAL_FIXTURE cannot become RELEASE_TRUTH | Local/manual fixture fixtures | Fake pass or non-portable truth | Blocks local fixture release claims | Miranda | PHASE C |
| Hardcoded rule blocker | Prevent hardcoded values from becoming rules or RuleSnapshots. | RULE_SNAPSHOT_GOVERNANCE_001, SOURCE_OWNERSHIP_REGISTRY_001 | rule candidate, sourceOwner, evidence reference | PASS/BLOCK | Hardcoded value source/path markers and missing RuleSnapshot | Whether rule is commercially valid | HARD_CODED_VALUE cannot become RULE_SNAPSHOT | Hardcoded/missing-source fixtures | Forge Core contamination | Blocks hardcoded rules | Arqui Juve / Miranda | PHASE B |

## Implementation Phase Roadmap

### PHASE A - Pure truth validators

Objective:

- Establish deterministic validation of envelope structure, truthType, evidenceState and ownership before domain validators exist.

Includes:

- TruthEnvelope required fields
- truthType compatibility
- EvidenceState compatibility
- SourceOwnership

Exit criteria:

- Required field gaps fail.
- Unknown owner blocks truth.
- AI_INTERPRETATION cannot become FACT.
- FORECAST cannot become FACT.
- UNVERIFIED cannot become FACT.
- Validators return audit-friendly outputs and do not mutate state.

### PHASE B - Rule and economic truth validators

Objective:

- Protect executable rules, compensation, forecast assumptions and economic outputs.

Includes:

- RuleSnapshot validity
- Forecast boundary
- Compensation boundary
- Hardcoded rule blocker

Exit criteria:

- HARD_CODED_VALUE cannot become RULE_SNAPSHOT.
- Compensation cannot run without active validated RuleSnapshot.
- Forecasts are decision support only.
- RuleSnapshots require owner, source, effective period and audit trail.

### PHASE C - AI and command boundary validators

Objective:

- Prevent AI, Alfred, discovery docs and local fixtures from bypassing Forge.

Includes:

- AI output boundary
- Alfred search/index boundary
- Discovery implementation blocker
- Local fixture/release truth blocker

Exit criteria:

- Validators must never call LLMs.
- Alfred ranking cannot use LLM guess as primary ranking signal.
- Local/manual fixtures cannot become release truth.
- Discovery docs cannot authorize implementation.

### PHASE D - OS boundary validators

Objective:

- Protect Advisor OS and Manager OS separation, Miranda Wall and human safety.

Includes:

- Advisor OS / Manager OS boundary
- Manager judgment leak blocker
- Human value judgment blocker

Exit criteria:

- Manager signals do not become Advisor OS judgments.
- Manager OS cannot output AI human value judgments.
- Advisor OS receives safe actionable recommendations only.

## Future File Boundaries For Implementation Planning Only

Suggested future areas may include:

- platform/truth/
- platform/truth/validators/
- platform/truth/contracts/
- tests/truth/

These paths are planning candidates only. This document does not create them and does not approve implementation.

Future implementation must remain separate from engines, UI, schemas, routes, Supabase functions, Product Intelligence implementation, CRM intelligence, business logic, commercial rules and package configuration unless a later approved sprint explicitly authorizes a narrow file set.

## Minimum Tests Required Before Any Implementation Can Be Accepted

- AI_INTERPRETATION cannot become FACT.
- FORECAST cannot become FACT.
- HARD_CODED_VALUE cannot become RULE_SNAPSHOT.
- UNVERIFIED cannot become FACT.
- OCR_OUTPUT cannot become PRODUCT_TRUTH.
- LOCAL_FIXTURE cannot become RELEASE_TRUTH.
- MANAGER_SIGNAL cannot become ADVISOR_OS_JUDGMENT.
- Alfred ranking cannot use LLM guess as primary ranking signal.
- Orchestrator cannot consume expired/conflicting RuleSnapshots as active rules.
- Compensation cannot run without active validated RuleSnapshot.
- Validators must never call LLMs.
- Validators must not mutate state.
- BLOCK, DEGRADE and NEEDS_REVIEW must preserve reason, relatedADR and recommendedAction.

## Blocked Until Future Governance Approval

These remain blocked until a future governance-approved implementation sprint:

- runtime validators
- schemas
- DB indexes
- Alfred implementation
- Orchestrator implementation
- Product Intelligence expansion
- Forecast implementation
- Compensation implementation
- Manager OS expansion
- validator file creation
- guard file creation
- engine integration
- test creation or modification

## Future Implementation Acceptance Gates

Any future implementation sprint must declare:

- Applicable Constitution
- Applicable ADRs
- Build Tree area
- Discovery status
- Implementation readiness
- Miranda approval
- Board approval status
- Scope boundary
- Prohibited surfaces
- Validation expectation

The sprint must also name:

- exact validator family
- exact allowed files
- exact prohibited files
- exact test files to create or modify
- exact fixtures allowed
- expected PASS/BLOCK/DEGRADE behaviors
- rollback strategy

If any field is missing, the sprint is BLOCKED BY ROBOCOP LOCK 001.

## What this readiness plan does NOT authorize

This readiness plan does not authorize:

- no runtime implementation
- no validator implementation
- no schema implementation
- no type file creation
- no tests
- no engines
- no Alfred implementation
- no DB indexing
- no Product Intelligence expansion
- no Forecast implementation
- no Compensation implementation
- no Manager OS expansion
- no source code edits
- no route changes
- no Supabase function changes
- no package changes
- no Build Tree status changes
- no ADR edits
- no discovery doc edits

## Recommended next sprint

Recommended next sprint: TRUTH VALIDATOR IMPLEMENTATION PLAN 001.

Rationale:

- The governing contracts now exist for Truth Boundary, TruthEnvelope, Source Ownership, Evidence State and RuleSnapshot governance.
- A future implementation plan should still be documentation-first and should specify the smallest first validator package before any code is created.
- The safest first implementation candidate is PHASE A only: TruthEnvelope required field validator, truthType compatibility validator, EvidenceState compatibility validator and SourceOwnership validator.
- Alfred Authority, Product Intelligence Source Registry and Compensation Rule Pack Readiness should wait until the pure truth validators are planned with exact files and tests.

## Final Status

Recommendation: READY FOR VALIDATOR READINESS LOCK.

Miranda approval: yes, documentation-only and implementation-reducing.

Implementation authority: none.

Runtime authority: none.
