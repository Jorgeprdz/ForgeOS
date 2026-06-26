# TRUTH BOUNDARY 001 - Source Truth & Evidence State

Status: DOCUMENTATION-ONLY ARCHITECTURE MAP

Scope: Source truth, evidence state, truth classification, AI interpretation boundary

Implementation: None

Code authority: None

Date: 2026-06-18

## Constitutional Gate

Applicable Constitution:

- FORGE_CONSTITUTION_V3.md
- docs/architecture/constitution/FORGE_ARCHITECTURAL_CONSTITUTION_v3.md
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

- Implementation ready for documentation and architecture planning only.
- No runtime implementation approved.
- No engine implementation approved.
- No Alfred implementation approved.
- No schema implementation approved.

Implementation readiness:

- Approved for documentation-only truth boundary design.
- Not approved for source code, schemas, engines, UI, routes, Supabase functions, tests, package changes, Build Tree status changes, ADR edits or discovery doc edits.

Miranda approval:

- Approved for a conservative boundary map that reduces false confidence, prevents invented truth and preserves authority boundaries.
- Blocked for any design that lets AI, forecasts, assumptions, local fixtures, discovery docs or hardcoded values become truth.

Board approval status:

| Board member | Boundary role |
| --- | --- |
| Miranda | Quality, product discipline and false-confidence veto |
| Arqui Juve | Architecture boundary owner |
| Nash | Conversation intelligence boundary |
| Patch Adams | Non-manipulation, human safety and trust boundary |
| Andrey | Manager OS / human capital judgment boundary |
| Joy Mangano | Real-world usability and adoption boundary |

## Executive Summary

Forge thinks. AI interprets.

AI SHALL NOT OVERRIDE FORGE.

This report defines the truth boundary map that prevents Forge domains from confusing evidence, facts, source truth, rules, forecasts, recommendations, decisions and AI output.

The map is documentation-only. It does not create engines, schemas, runtime behavior, tests or product logic.

## Sources Inspected

- FORGE_CONSTITUTION_V3.md
- docs/architecture/constitution/FORGE_ARCHITECTURAL_CONSTITUTION_v3.md
- docs/01-constitution/FORGE_CONSTITUTION_MAP.md
- AGENTS.md
- docs/00-governance/FORGE_ROBOCOP_DIRECTIVES.md
- docs/00-governance/FORGE_GOVERNANCE_REGISTRY.md
- docs/00-governance/FORGE_ROBOCOP_AI_INTERPRETATION_ADDENDUM.md
- FORGE_MASTER_BUILD_TREE.md
- adr/ADR-001 through ADR-008, ADR-010, ADR-011, ADR-015, ADR-017, ADR-018
- docs/adr/ADR-0019_PROCESS_ADVANCEMENT_INTELLIGENCE.md
- docs/architecture/build-tree/BUILD_TREE_EVIDENCE_RECONCILIATION_001.md
- docs/architecture/discovery/FORGE_IMPLEMENTATION_READINESS_001A_SOURCE_OWNERSHIP_REGISTRY.txt
- docs/architecture/discovery/FORGE_IMPLEMENTATION_READINESS_001B_EVIDENCE_STATE_VOCABULARY.txt
- docs/architecture/discovery/FORGE_IMPLEMENTATION_READINESS_001C_REPORT.txt
- docs/architecture/discovery/FORGE_IMPLEMENTATION_READINESS_001D_UNKNOWN_STALE_CONFLICT_HANDLING_CONTRACT.txt
- docs/architecture/discovery/FORGE_IMPLEMENTATION_READINESS_001F_IMPLEMENTATION_PLAN_V0_1.txt
- docs/discoveries/consolidated/TRUTH_ARCHITECTURE_CANONICALIZATION.md

Note:

- docs/00-governance/FORGE_ROBOCOP_GOVERNANCE_REGISTRY.md was requested if present. It was not present. The active registry is docs/00-governance/FORGE_GOVERNANCE_REGISTRY.md.

## Authority Order

All truth classification, AI-assisted behavior, Alfred behavior and domain outputs must obey this order:

1. Constitution
2. Locked ADRs
3. ROBOCOP LOCK 001 and ROBOCOP ADDENDUM 001
4. Source truth
5. Evidence packet
6. Rule engine / rule snapshot
7. Domain engine
8. Forge Orchestrator
9. AI interpretation
10. Presentation layer

If a lower layer conflicts with a higher layer, the lower layer is invalid for that claim.

## Canonical Truth Categories

| Category | Meaning | Authority level | Allowed sources | Required provenance | Shown to user | Drive recommendations | Mutate state | Required validation | Example | Blocked misuse |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| RAW_EVIDENCE | Unprocessed source material or observed input. | Low until packaged | PDFs, logs, CRM records, user-uploaded files, carrier docs, meeting notes | Source, timestamp, owner candidate, capture method | Yes, as raw or unverified | No strong recommendation | No | Provenance capture and owner assignment | Uploaded product PDF | Treating raw OCR text as product truth |
| EVIDENCE_PACKET | Evidence with source, owner, period, version and limits captured. | Medium | RAW_EVIDENCE after provenance capture | Source, owner, period, version, freshness, limitations | Yes | Limited or provisional only until validated | No | Source validity and evidence state check | Carrier PDF packet for product version | Using packet as final fact without validation |
| FACT | Validated statement inside a bounded claim. | High inside scope | EVIDENCE_PACKET, official record, verified system event | Source, owner, claim, period, validation result | Yes | Yes, if relevant and current | Only through approved domain workflow | Owner, freshness, conflict and ADR validation | Payment received on date X | Extending fact to another domain |
| SOURCE_TRUTH | Canonical source-backed truth for a domain claim. | High | Official documents, official records, validated facts | Official source, owner, effective period, version | Yes | Yes, within domain boundaries | Only via approved source-truth process | Domain owner validation | Official product rule from carrier manual | Letting AI or UI redefine source truth |
| RULE | A deterministic rule derived from source truth or RuleSnapshot. | High inside rule domain | Rule Pack, official rule doc, approved domain logic | Source, effective period, owner, version | Yes, as rule explanation | Yes, through rule engine | Only through approved rule governance | Rule source and effective-date validation | Commission eligibility rule | Hardcoded value as rule |
| RULE_SNAPSHOT | Time-bound frozen rule set for a period/context. | High for that period | Rule Pack, official schedule, approved snapshot | Source, period, version, frozen timestamp | Yes | Yes, within period | No mutation after lock except new snapshot | Rule Pack governance | SMNYL 2026 commission snapshot | Recalculating history with current rules |
| PRODUCT_TRUTH | Validated truth about product capabilities, limits and requirements. | High in Product domain | Official product docs, validated Rule Pack, product source registry | Carrier, product, version, period, source | Yes | Yes, but not as suitability by itself | No direct mutation | ADR-005 validation | Product allows rider X under version Y | Product PDF ambiguity becomes product truth |
| POLICY_TRUTH | Validated truth about a specific policy state or event. | High in Policy domain | Policy contract, schedule, admin record, confirmed event | Policy id, source, date, owner, version | Yes | Yes, if current and relevant | Only through approved policy workflow | ADR-006 validation | Policy paid through date X | Product truth treated as policy truth |
| FORECAST | Scenario, estimate or projection based on assumptions. | Medium; never fact | Facts, source truth, assumptions, rates | Assumptions, inputs, source rates, date | Yes, clearly labeled | Decision support only | No | ADR-007 and assumptions disclosure | Persistency risk scenario | Forecast as fact |
| ASSUMPTION | Explicit input used for scenario or reasoning when fact is absent. | Low | User-provided assumption, documented planning premise | Author, date, rationale, scope | Yes, labeled | Only for scenario output | No | Must remain labeled | Assume 4.5 percent scenario rate | Assumption as fact |
| UNKNOWN | Known absence of sufficient evidence. | Protective authority | Missing, stale, conflicting or unavailable evidence | Gap reason, owner if known, required evidence | Yes | Can drive validation request only | No | Preserve unknown | Unknown product version | Unknown treated as zero or default |
| RECOMMENDATION | Evidence-backed suggested action. | Advisory only | Valid facts, source truth, rules, domain outputs | Evidence, owner, rationale, confidence label | Yes | It is the recommendation output | No direct mutation | ADR-003 and ADR-004 | Review policy before renewal | Recommendation as mandate |
| DECISION_SUPPORT | Explanation, scenario or comparison that helps a human decide. | Advisory only | Valid facts, forecasts, recommendations, warnings | Sources, assumptions, limits, owner | Yes | Yes, as support | No | Authority boundary and uncertainty labels | Option A vs B with assumptions | Decision support treated as human decision |
| AI_INTERPRETATION | LLM/model interpretation of context or language. | Low | AI output after Forge context | Prompt/context, model if known, source inputs, label | Yes, labeled | No, until Forge validates | No | Forge validation before action | Summary of why result ranked first | AI_INTERPRETATION -> FACT |
| AI_EXTRACTION_CANDIDATE | AI-extracted data candidate from source material. | Low | AI OCR/extraction over raw evidence | Source, extraction method, confidence label | Yes, labeled | No | No | Forge validation against evidence | Extracted premium candidate | Candidate becomes policy truth automatically |
| AI_CLASSIFICATION_CANDIDATE | AI-classified label candidate. | Low | AI classification over context | Source context, class list, rationale | Yes, labeled | No strong output | No | Domain validation | Candidate intent classification | LLM label becomes client intent |
| USER_INPUT | User-stated information. | Low to medium | Advisor, manager, client input | Speaker, date, context, ownership | Yes | Provisional until validated | Only through approved workflow | Source and authority validation | Advisor says meeting happened | User input as source truth without validation |
| MANUAL_OVERRIDE | Human override of system state or output. | Medium if auditable | Authorized human action | Actor, reason, timestamp, prior state, approval | Yes, with audit context | Can affect workflow if allowed | Yes, only in approved workflow | Permission, reason and audit trail | Manager marks evidence reviewed | Silent override without audit |
| HUMAN_DECISION | Final accountable choice by authorized human. | Highest operational decision layer under governance | Advisor, client, manager where authorized | Actor, decision, timestamp, scope | Yes | Decision endpoint, not model output | Yes, if workflow approved | Authority, permission and audit | Advisor chooses to call client | AI or Forge pretending to be human decision |

## Evidence State Model

| State | Meaning | Allowed output posture | Block condition |
| --- | --- | --- | --- |
| MISSING | Required evidence is absent. | Ask for evidence or mark no conclusion. | Any strong claim. |
| UNVERIFIED | Evidence exists but has not been validated. | Limited summary or validation request. | Source truth, rule or recommendation. |
| EXTRACTED | Data was extracted from raw evidence. | Candidate output only. | Treating extraction as fact. |
| VALIDATED | Evidence passed checks for a specific claim. | Output allowed within scope. | Extending beyond validated scope. |
| CONFLICTING | Sources disagree. | Conflict warning and human review. | Silent resolution. |
| STALE | Evidence may no longer be current. | Warning, refresh request, limited output. | Current truth without refresh. |
| MANUAL | Human supplied or manually handled evidence. | Labeled output with audit trail. | Silent authority elevation. |
| OFFICIAL | Official source or record. | Strongest source input when applicable. | Using outside period/version. |
| DEPRECATED | Superseded source or rule. | Historical context only. | Current rule or truth. |
| BLOCKED | Output cannot be responsibly produced. | Blocked state with reason. | Any workaround that hides block. |

## Source Ownership Rules

- Every fact must have an owner.
- Every metric must have one owner.
- Every rule must cite source and effective period.
- Every forecast must disclose assumptions.
- Every AI output must be labeled as interpretation/candidate until validated.
- Every manual override must be auditable.
- Consumer domains may read official outputs, but must not recalculate or redefine truth.
- Unknown ownership blocks strong output.
- Conflicting ownership blocks strong output until resolved.
- Discovery does not authorize implementation.

## Forbidden Transitions

| Forbidden transition | Why blocked |
| --- | --- |
| AI_INTERPRETATION -> FACT | AI output is not source truth and cannot validate itself. |
| AI_INTERPRETATION -> SOURCE_TRUTH | Only source ownership and domain validation can create source truth. |
| FORECAST -> FACT | Forecast is never fact. |
| ASSUMPTION -> FACT | Assumptions support scenarios only. |
| USER_INPUT -> SOURCE_TRUTH without validation | Human input may be evidence, but needs source/authority validation. |
| HARD_CODED_VALUE -> RULE | Rules require source, owner, period and governance. |
| DISCOVERY_DOC -> IMPLEMENTATION_TRUTH | Discovery does not authorize implementation. |
| MANAGER_SIGNAL -> ADVISOR_OS_JUDGMENT | Manager signals must not become Advisor OS judgment. |
| PRODUCT_PDF_AMBIGUITY -> PRODUCT_TRUTH | Ambiguous product evidence must remain unknown or validation-needed. |
| LOCAL_FIXTURE -> RELEASE_TRUTH | Local/manual fixtures do not create release truth. |
| OCR_OUTPUT -> PRODUCT_TRUTH | OCR is not truth. |
| PARSER_OUTPUT -> POLICY_TRUTH | Parser output is candidate evidence until validated. |
| COMPENSATION_SCENARIO -> PAID_COMPENSATION | Scenario is not payment. |
| RELATIONSHIP_SIGNAL -> CLIENT_PERMISSION | Relationship opportunity is not consent. |
| PRODUCT_TRUTH -> PRODUCT_RECOMMENDATION without suitability/context | Product facts are not recommendations. |
| ECONOMIC_MOTIVATION -> CLIENT_PRESSURE | Client First overrides economic pressure. |

## Allowed Transitions

| Allowed transition | Required condition |
| --- | --- |
| RAW_EVIDENCE -> EVIDENCE_PACKET | Provenance, source, owner candidate, period and limitations are captured. |
| EVIDENCE_PACKET -> FACT | Domain validation confirms claim, period, owner, freshness and no unresolved conflict. |
| OFFICIAL_DOCUMENT -> SOURCE_TRUTH | Official source, applicable version, period and owner are documented. |
| SOURCE_TRUTH -> RULE_SNAPSHOT | Effective dates, source, owner, Rule Pack and frozen period are recorded. |
| RULE_SNAPSHOT -> RULE_ENGINE_INPUT | Consuming rule engine is approved and period/context match. |
| AI_EXTRACTION_CANDIDATE -> FACT | Forge validates extracted value against evidence and domain owner accepts the claim. |
| AI_CLASSIFICATION_CANDIDATE -> DECISION_SUPPORT | Forge validates label as context and keeps it advisory. |
| FORECAST -> DECISION_SUPPORT | Assumptions, rates, inputs, date and uncertainty are explicit. |
| RECOMMENDATION -> HUMAN_DECISION | Authorized user acts, confirms or rejects through explicit user action. |
| USER_INPUT -> EVIDENCE_PACKET | Speaker, role, timestamp, context and limitations are captured. |
| MANUAL_OVERRIDE -> AUDITED_STATE_CHANGE | Actor, reason, permission and prior state are preserved. |
| UNKNOWN -> VALIDATION_REQUEST | Missing evidence is named and routed to validation. |
| CONFLICTING -> HUMAN_REVIEW_REQUIRED | Conflict sources and conflict type are preserved. |

## Alfred Boundary

Alfred is the Universal Search, Index and Command Interface of Forge OS.

Alfred must not bypass Forge.

Alfred search/index results must come from:

1. Forge Index
2. DB or approved local source
3. Permission filter
4. Context builder
5. Authority gate
6. Forge Orchestrator
7. Engine registry, if applicable
8. AI interpretation, only if needed
9. Forge validation
10. Result, explanation or blocked state

Rules:

- Alfred can use AI only to interpret, summarize or draft.
- Alfred must not rank entities only by LLM guess.
- Alfred must show uncertainty when context is incomplete.
- Alfred cannot execute governed actions directly from AI output.
- Alfred command behavior must require scope, permission, authority gate and confirmation before mutating data.

## Product Intelligence Boundary

OCR is not truth.

Parser output is not truth until validated.

Product PDFs can produce evidence packets.

Product truth requires source/provenance.

Rules:

- Product Intelligence may own Product Truth only when source, version, carrier, period and claim are validated.
- Product Knowledge Library is not automatically Product Truth.
- Rule engines must not infer unsupported benefits, premiums, UDI, rates, yields or coverage.
- Product PDFs with ambiguity must remain UNKNOWN, UNVERIFIED, EXTRACTED or BLOCKED.
- GMM Coverage remains blocked where source registry is unresolved.
- Product Truth does not prove Policy Truth.
- Product Truth does not determine suitability by itself.

## Forecast And Compensation Boundary

Forecast is never fact.

Compensation rules cannot live in Forge Core.

Rules:

- Forecast may create scenarios, estimates and decision support only with explicit assumptions.
- Forecast must disclose rates, source inputs, scenario date and unknowns.
- Forecast must not create Policy Truth, Product Truth, Compensation Truth or paid income.
- Compensation needs RuleSnapshot / Rule Pack governance.
- Compensation Intelligence must preserve product line, period, RuleSnapshot and source evidence.
- Income projections require explicit source, assumptions and disclaimers.
- Compensation scenario is not real payment.
- Economic motivation cannot override client-first boundaries.
- Compensation may explain economic implications, but must not pressure advisor or client.

## Advisor OS And Manager OS Boundary

Advisor OS receives actionable, safe, evidence-backed recommendations.

Manager OS receives governed signals, not human worth judgments.

Manager judgments must not leak into Advisor OS.

Rules:

- The Miranda Wall remains active.
- Manager OS may support coaching, allocation and risk review only within authority boundaries.
- AI cannot judge human value, potential, loyalty, discipline, coachability or worth.
- Andrey / Human Capital Allocation signals require evidence, RODI boundaries, Miranda approval and Manager OS authority.
- Manager signals must not become Advisor OS shame, ranking, pressure or hidden judgment.
- Advisor OS recommendations remain advisor-first and action-safe.

## NASH And Relationship Boundary

NASH may produce responsible conversation guidance.

Relationship Intelligence may identify context, timing, opportunities and risk.

Rules:

- NASH must not invent Product Truth, Policy Truth, client intent or consent.
- Relationship opportunity is not permission.
- Conversation drafts are not decisions.
- AI language must not substitute for evidence or human authority.
- Non-manipulation and Client First override conversion pressure.

## Rule Pack Governance

Rule Packs interpret facts. Forge Core must not hardcode carrier-specific, channel-specific, contest-specific, compensation-specific, career-specific, promotion-specific, KPI-specific, activity-specific or recognition-specific logic.

Rules:

- Rule Packs require source, period, version and owner.
- RuleSnapshot freezes rules for a context and period.
- Historical periods must preserve historical snapshots.
- Current rules must not recalculate historical truth except as separate analysis.
- Rule Pack output may inform decision support but does not become human decision.

## What This Does NOT Authorize

This report does not authorize:

- no code implementation
- no schema implementation
- no engine implementation
- no Alfred implementation
- no Product Intelligence expansion
- no Forecast implementation
- no Compensation implementation
- no Manager OS expansion
- no UI work
- no route work
- no Supabase work
- no package changes
- no Build Tree status changes
- no ADR edits
- no discovery doc edits
- no tests

## Next Recommended Implementation Step

Recommended next sprint:

TRUTH BOUNDARY 002 - Truth Type Contract

Purpose:

- Convert this documentation map into a narrower implementation-readiness contract for truth types, field names, validation postures and blocked transitions.

Allowed next planning candidates:

- SOURCE OWNERSHIP REGISTRY 001
- EVIDENCE STATE CONTRACT 001
- RULE SNAPSHOT GOVERNANCE 001

Do not jump directly to feature implementation.

Do not implement Product Intelligence, Forecast, Compensation, Alfred or Manager OS behavior until the relevant truth/source contracts are approved.

## Final Status

PASS

READY FOR TRUTH BOUNDARY LOCK
