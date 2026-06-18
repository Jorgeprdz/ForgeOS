# TRUTH VALIDATOR IMPLEMENTATION PLAN 001 - Controlled Implementation Blueprint

Status: DOCUMENTATION-ONLY IMPLEMENTATION BLUEPRINT

Scope: Future PHASE A Truth Boundary validator implementation planning

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
- Validator Implementation Planning
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

- Implementation ready for documentation-only implementation blueprint.
- No runtime implementation approved in this task.
- No validator implementation approved in this task.
- No schema implementation approved in this task.
- No test implementation approved in this task.

Implementation readiness:

- Approved for documentation-only Truth Validator Implementation Plan.
- Not approved for source code, schemas, engines, UI, routes, Supabase functions, tests, package changes or validator implementation.

Miranda approval:

- Approved only if this plan makes future implementation smaller, safer, testable, reversible and governed.
- Blocked for any plan that recommends broad implementation, touching Product Intelligence, Alfred, Forecast, Compensation or Manager OS before core truth validators exist.

Board approval status:

| Board member | Planning boundary |
| --- | --- |
| Miranda | Quality/product discipline veto |
| Arqui Juve | Implementation architecture owner |
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
- docs/architecture/truth/TRUTH_BOUNDARY_003_VALIDATOR_READINESS_PLAN.md
- docs/governance/FORGE_ROBOCOP_DIRECTIVES.md
- docs/governance/FORGE_ROBOCOP_AI_INTERPRETATION_ADDENDUM.md
- AGENTS.md
- FORGE_CONSTITUTION_V3.md
- adr/ADR-001 through ADR-008, ADR-010, ADR-011, ADR-015, ADR-017, ADR-018
- docs/adr/ADR-0019_PROCESS_ADVANCEMENT_INTELLIGENCE.md
- Current repo structure under platform/, tests/ and src/intelligence/truth-resolution/

## Executive Summary

Forge thinks. AI interprets.

AI SHALL NOT OVERRIDE FORGE.

This blueprint converts TRUTH_BOUNDARY_003_VALIDATOR_READINESS_PLAN.md into a controlled future implementation plan for PHASE A validators only.

This document does not implement validators, guards, runtime helpers, schemas, engines, tests, Alfred behavior, Orchestrator behavior or domain features.

The future implementation must be small enough to verify with focused tests and broad enough only to enforce the existing Truth Boundary contracts.

## Implementation Principle

- Implement validators in smallest possible deterministic units.
- Validators enforce existing contracts; they do not define new truth.
- Validators must never call LLMs.
- Validators must not mutate state.
- Validators return structured validation results only.
- Validators must be dependency-light and testable with plain fixtures.
- Validators must preserve unknowns, assumptions and audit context.
- Validators must be safe to run in CLI/tests without app boot.
- Validators must not import Product Intelligence, Alfred, Forecast, Compensation, Manager OS or UI modules in PHASE A.
- Validators must not require network access, OpenAI, Supabase, browser APIs or package dependency changes.

## PHASE A - Only Candidate For Next Code Sprint

PHASE A is the only implementation candidate for the next actual code sprint.

PHASE A candidates:

- TruthEnvelope required field validator
- truthType compatibility validator
- EvidenceState compatibility validator
- SourceOwnership validator

Explicitly deferred:

- RuleSnapshot validity validator
- AI output boundary validator
- Forecast boundary validator
- Compensation boundary validator
- Alfred search/index boundary validator
- Advisor OS / Manager OS boundary validator
- Discovery implementation blocker
- Local fixture / release truth blocker
- Hardcoded rule blocker

Reason:

- PHASE A validates universal truth shape, type, state and owner contracts.
- PHASE A does not execute business logic.
- PHASE A does not calculate product, policy, forecast, compensation, Alfred ranking or Manager OS decisions.
- PHASE A provides the smallest safe base for later PHASE B/C/D validators.

## Future File Structure Recommendation

Repo structure inspected:

- platform/ already contains universal app, command, routing, auth, sync and notification infrastructure.
- tests/ already contains root test scripts and focused test files.
- src/intelligence/truth-resolution/ already contains intelligence resolution modules and should not be mixed with constitutional validator contracts in PHASE A.

Recommended future PHASE A structure, not created by this task:

- platform/truth/
- platform/truth/contracts/
- platform/truth/validators/
- platform/truth/index.js
- tests/truth/

Rationale:

- platform/truth/ keeps universal validation separate from domain engines.
- platform/truth/contracts/ can hold constant lists and non-executable contract mappings derived from docs.
- platform/truth/validators/ can hold small deterministic validators.
- platform/truth/index.js can expose only PHASE A validators for tests and future consumers.
- tests/truth/ keeps PHASE A validation tests separate from product, runtime, manager, Alfred and intelligence tests.

Rejected for PHASE A:

- src/intelligence/truth-resolution/ because it already implies truth resolution intelligence, not constitutional contract validation.
- product-intelligence/ because PHASE A must not change product behavior.
- platform/commands/ because Alfred/command authority is deferred.
- manager-os/ because Manager OS boundary validators are deferred.
- rule-packs/ because RuleSnapshot and Rule Pack implementation are deferred.

## Proposed Future Files For PHASE A

| Future file | Purpose | Exports expected | Inputs | Outputs | Dependencies allowed | Dependencies prohibited | Tests required | Risks | Why allowed in PHASE A | Why it does not implement Product/Forecast/Compensation/Alfred/Manager OS |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| platform/truth/contracts/truth-contract-values.js | Centralize canonical truthType, evidenceState, ownerType, mutationAuthority and validator status values from docs. | TRUTH_TYPES, EVIDENCE_STATES, OWNER_TYPES, MUTATION_AUTHORITIES, VALIDATOR_STATUSES | None or static constants only | Constant sets | None, plain JS only | LLMs, Supabase, DOM, engines, product/forecast/compensation/Alfred/Manager imports | Known/unknown value tests | Constants drift from docs | Required for deterministic validators | Contains values only; no domain behavior |
| platform/truth/contracts/truth-envelope-required-fields.js | List TruthEnvelope required fields for PHASE A field validation. | REQUIRED_TRUTH_ENVELOPE_FIELDS, REQUIRED_MANUAL_OVERRIDE_FIELDS | None or static constants only | Constant lists | None, plain JS only | Schemas, runtime boot, app state | Missing field tests | Treating docs as runtime schema too early | Enables field validator without schema implementation | Lists fields only; no domain behavior |
| platform/truth/validators/validation-result.js | Provide a small result factory shape for PASS/FAIL/BLOCK/DEGRADE/NEEDS_REVIEW. | createValidationResult, createPass, createFail, createBlock, createDegrade, createNeedsReview | Validator id, status, reason, evidence, related fields | Structured validation result | Contract constants only | Mutation, logging side effects, network, LLMs | Result includes validatorId and reason | Result shape becomes hidden runtime event | Needed to standardize outputs | Returns objects only; does not route to domains |
| platform/truth/validators/truth-envelope-required-field-validator.js | Validate that required TruthEnvelope fields are present. | validateTruthEnvelopeRequiredFields | TruthEnvelope-like object | Validation result | Required field constants, result factory | Domain engines, schemas, UI, package deps | Valid envelope passes; missing fields fail | Over-validating domain semantics | Pure structural PHASE A validator | Checks fields only; no product/forecast/compensation logic |
| platform/truth/validators/truth-type-compatibility-validator.js | Validate known truthType and PHASE A blocked truthType transitions. | validateTruthTypeCompatibility | truthType, targetTruthType/requestedUse/evidenceState | Validation result | Contract values, result factory | LLMs, rule packs, forecast engines | Unknown truthType fails; AI_INTERPRETATION as FACT blocks | Encoding future PHASE B rules too early | Enforces universal blocked transitions | Does not execute domain rules or recommendations |
| platform/truth/validators/evidence-state-compatibility-validator.js | Validate known evidenceState and PHASE A state-to-truth compatibility. | validateEvidenceStateCompatibility | evidenceState, truthType, requestedUse, mutationAuthority | Validation result | Contract values, result factory | Runtime state mutation, DB, app boot | Unknown evidenceState fails; UNVERIFIED FACT blocks; EXTRACTED SOURCE_TRUTH blocks | Accidentally mutating state | Enforces docs-only evidence state matrix | Does not implement Product/Forecast/Compensation/Alfred/Manager behavior |
| platform/truth/validators/source-ownership-validator.js | Validate known ownerType and basic ownership blockers. | validateSourceOwnership | ownerType, truthType, evidenceState, source/provenance fields | Validation result | Owner type constants, result factory | Source resolution engines, CRM, Supabase, domain modules | Unknown ownerType fails; UNKNOWN_OWNER as VALIDATED blocks | Conflating ownership with evidence validation | Keeps No truth without owner in PHASE A | Does not resolve owners from real systems |
| platform/truth/index.js | Export PHASE A validators only. | Contract constants and PHASE A validators | Imports from platform/truth only | Public PHASE A module surface | platform/truth local modules | Domain engines, UI, app boot, package deps | Import smoke test from tests/truth | Becoming a broad truth runtime | Provides a narrow testable entrypoint | No domain integration; export-only |
| tests/truth/truth-validators-phase-a.test.js | Focused PHASE A validator tests. | None | Plain fixtures | Test assertions | Node assert and PHASE A modules | New dependencies, app boot, product/Alfred/Manager imports | All PHASE A minimum tests | Over-coupling to implementation internals | Required acceptance evidence | Tests pure validators only |
| tests/truth/fixtures/phase-a-valid-truth-envelope.json | Plain valid envelope fixture. | None | Static JSON | Test input | JSON only | Real customer/product data | Valid envelope passes | Fixture mistaken for release truth | Minimal safe test data | Fixture contains no business rule |
| tests/truth/fixtures/phase-a-invalid-truth-envelopes.json | Plain invalid envelope cases. | None | Static JSON | Test inputs | JSON only | Local PDFs, real PII, product data | Block/fail cases | Fixture drift | Supports negative tests | Fixture contains no domain logic |

## Canonical Validator Result Object

Future PHASE A validators must return this conceptual result object:

| Field | Required | Allowed values / meaning |
| --- | --- | --- |
| validatorId | Yes | Stable validator id. |
| status | Yes | PASS / FAIL / BLOCK / DEGRADE / NEEDS_REVIEW. |
| reason | Yes | Human-readable reason. |
| evidence | Yes | Evidence references, contract references or input fields used. |
| blockedTransition | Conditional | Transition that caused BLOCK. |
| relatedTruthType | Conditional | Truth type involved. |
| relatedEvidenceState | Conditional | Evidence state involved. |
| relatedOwnerType | Conditional | Owner type involved. |
| relatedADR | Yes | Applicable ADR list. |
| relatedConstitutionPrinciple | Yes | Applicable constitutional principle list. |
| recommendedAction | Yes | pass, fix_input, block_use, degrade_output, request_review, request_validation. |
| auditEventRequired | Yes | true/false. |
| userFacingMessageAllowed | Yes | true/false. |

PHASE A validators must not emit side effects. They return structured validation results only.

## PHASE A Validation Rules

Implementation-ready rules, without code:

- TruthEnvelope must include required fields.
- truthType must be known.
- evidenceState must be known.
- ownerType must be known.
- FACT requires VALIDATED or OFFICIAL.
- SOURCE_TRUTH requires OFFICIAL or VALIDATED with official provenance.
- AI_INTERPRETATION cannot be FACT.
- FORECAST cannot be FACT.
- ASSUMPTION cannot be FACT.
- UNVERIFIED cannot become FACT.
- EXTRACTED cannot become SOURCE_TRUTH.
- UNKNOWN_OWNER cannot become VALIDATED.
- USER_INPUT cannot become SOURCE_TRUTH without validation.
- MANUAL_OVERRIDE requires audit trail.
- Mutation authority must be compatible with truthType and evidenceState.
- Unknown, missing or unsupported values must return FAIL or BLOCK rather than defaulting to PASS.
- Any result that blocks a transition must include blockedTransition and reason.
- Any result that allows only lower-strength use must return DEGRADE and preserve unknowns/assumptions.

## PHASE A Minimum Tests

Required future tests:

- valid TruthEnvelope passes.
- missing required fields fails.
- unknown truthType fails.
- unknown evidenceState fails.
- unknown ownerType fails.
- FACT with UNVERIFIED blocks.
- FACT with VALIDATED passes.
- SOURCE_TRUTH with unofficial source blocks.
- AI_INTERPRETATION as FACT blocks.
- FORECAST as FACT blocks.
- ASSUMPTION as FACT blocks.
- EXTRACTED as SOURCE_TRUTH blocks.
- UNKNOWN_OWNER as VALIDATED blocks.
- MANUAL_OVERRIDE without audit trail blocks.
- Mutation authority incompatible with truthType/evidenceState blocks.
- validator output includes reason and validatorId.
- validator output includes relatedADR and relatedConstitutionPrinciple.
- validators do not import app boot, UI, Product Intelligence, Alfred, Forecast, Compensation or Manager OS modules.

## Acceptance Gates For Future Implementation

Before any future PHASE A implementation can be accepted:

- All PHASE A tests must pass.
- Existing runtime module graph audit must still pass.
- Existing run-all-tests must still pass or documented known non-regression must be explained.
- No Product Intelligence behavior changes.
- No Alfred behavior changes.
- No Forecast behavior changes.
- No Compensation behavior changes.
- No Manager OS behavior changes.
- No schema or DB changes.
- No package dependency changes unless separately approved.
- No runtime integration beyond importing pure validators in tests.
- No RuleSnapshot, AI, Forecast, Compensation, Alfred or Manager OS validators implemented in PHASE A.

## Remains Blocked After PHASE A

These remain blocked after PHASE A unless a later governance-approved sprint authorizes them:

- RuleSnapshot validators
- AI output validators
- Forecast validators
- Compensation validators
- Alfred index/ranking validators
- Advisor OS / Manager OS validators
- Product Intelligence expansion
- Rule Pack loaders
- DB indexes
- runtime orchestrator integration
- command execution integration
- source registry integrations with real product/policy data
- any business-rule or commercial-rule implementation

## Future Sprint Scope Recommendation

If PHASE A is approved later, the future sprint should be limited to:

- create platform/truth/contracts/ value lists
- create platform/truth/validators/ result object helper
- create PHASE A validators only
- create tests/truth/ PHASE A tests and fixtures
- run runtime module graph audit
- run tests/run-all-tests.js

The future sprint should stop immediately if implementation requires:

- package.json changes
- schema changes
- engine changes
- Product Intelligence changes
- Alfred changes
- Forecast changes
- Compensation changes
- Manager OS changes
- Supabase changes
- route or UI changes

## What this implementation plan does NOT authorize

This implementation plan does not authorize:

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

Recommended next sprint: TRUTH VALIDATORS PHASE A IMPLEMENTATION 001.

Rationale:

- Truth Boundary contracts are now documented through Truth Boundary 001, Truth Type Contract 002, Source Ownership Registry 001, Evidence State Contract 001, Rule Snapshot Governance 001 and Validator Readiness Plan 003.
- PHASE A is the smallest implementation surface that can reduce future truth ambiguity without touching Product Intelligence, Alfred, Forecast, Compensation or Manager OS.
- The future sprint must remain narrow: pure validators, plain fixtures, focused tests, no package changes and no domain integration.

## Final Status

Recommendation: READY FOR TRUTH VALIDATOR IMPLEMENTATION PLAN LOCK.

Miranda approval: yes, documentation-only and implementation-narrowing.

Implementation authority: none.

Runtime authority: none.
