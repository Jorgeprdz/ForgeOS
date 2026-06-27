# SOURCE OWNERSHIP REGISTRY 001 - Truth Ownership Map

Status: DOCUMENTATION-ONLY ARCHITECTURE CONTRACT

Scope: Source ownership, truth ownership, metric ownership, rule ownership, AI ownership boundary

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

- Source Ownership
- Truth Boundary
- Evidence State
- Rule Pack Governance
- Forge Orchestrator
- Alfred / Universal Command OS
- Product Intelligence
- Forecast Intelligence
- Compensation Intelligence
- Manager OS / Advisor OS boundary

Discovery status:

- Implementation ready for documentation-only ownership registry.
- No runtime implementation approved.
- No engine implementation approved.
- No schema implementation approved.
- No Alfred implementation approved.

Implementation readiness:

- Approved for documentation-only Source Ownership Registry.
- Not approved for source code, schemas, engines, UI, routes, Supabase functions, tests, package changes, Build Tree changes, ADR edits or discovery doc edits.

Miranda approval:

- Approved only if this prevents duplicate ownership, invented truth, false confidence and hardcoded business rules.
- Blocked for any registry that allows AI, forecasts, assumptions, local fixtures or hardcoded values to become owner of truth.

Board approval status:

| Board member | Ownership boundary |
| --- | --- |
| Miranda | Quality/product discipline veto |
| Arqui Juve | Architecture contract owner |
| Nash | Conversation intelligence boundary |
| Patch Adams | Non-manipulation and human safety |
| Andrey | Manager OS / human capital judgment boundary |
| Joy Mangano | Usability and adoption clarity |

## Sources Inspected

- docs/05-truth/TRUTH_BOUNDARY_001_SOURCE_TRUTH_AND_EVIDENCE_STATE.md
- docs/05-truth/TRUTH_BOUNDARY_002_TRUTH_TYPE_CONTRACT.md
- docs/00-governance/FORGE_ROBOCOP_DIRECTIVES.md
- docs/00-governance/FORGE_ROBOCOP_AI_INTERPRETATION_ADDENDUM.md
- AGENTS.md
- FORGE_CONSTITUTION_V3.md
- adr/ADR-001 through ADR-008, ADR-010, ADR-011, ADR-017, ADR-018
- docs/adr/ADR-0019_PROCESS_ADVANCEMENT_INTELLIGENCE.md
- docs/03-discovery/FORGE_IMPLEMENTATION_READINESS_001A_SOURCE_OWNERSHIP_REGISTRY.txt

## Executive Summary

Forge thinks. AI interprets.

AI SHALL NOT OVERRIDE FORGE.

This registry defines conceptual ownership for Forge truth-bearing sources and claims.

It is a documentation-only ownership map. It is not a validator, runtime permission system, schema, engine or workflow.

## Ownership Principle

- Every fact must have an owner.
- Every metric must have one owner.
- Every rule must cite source and effective period.
- Every forecast must disclose assumptions.
- Every AI output must be labeled as interpretation/candidate until validated.
- Every manual override must be auditable.
- No truth without owner.
- No metric with multiple owners.
- Consumer domains may consume official outputs, but must not redefine source truth.
- Discovery does not authorize implementation.

## Canonical Owner Types

| Owner type | Authority level | Allowed truthTypes | Prohibited truthTypes | Required provenance | Required validation | Allowed uses | Prohibited uses | Visibility scope | Mutation authority | Examples | Blocked misuse |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| official_document | Highest source authority for applicable claim | RAW_EVIDENCE, EVIDENCE_PACKET, FACT, SOURCE_TRUTH, RULE, PRODUCT_TRUTH, POLICY_TRUTH | AI_INTERPRETATION, HUMAN_DECISION | Issuer, version, date, period, source file/link, applicability | Source validity, owner, period and conflict validation | display, search_index, recommendation_input, decision_support, audit_only | autonomous_decision, mutation_without_confirmation | internal_only, user_facing, audit_only | official_source_sync, governance_approved | Official product manual, official admin record | Applying wrong version or period |
| carrier_document | High source authority for product/policy/economic carrier claims | RAW_EVIDENCE, EVIDENCE_PACKET, FACT, PRODUCT_TRUTH, POLICY_TRUTH, SOURCE_TRUTH | HUMAN_DECISION, AI_INTERPRETATION | Carrier, product/policy, version, period, channel, file/link | Carrier/source validation and ADR-005/006 checks | display, search_index, recommendation_input, decision_support | manager_judgment, autonomous_decision | internal_only, user_facing, audit_only | official_source_sync | Carrier conditions, product manual | Treating brochure as universal Product Truth |
| policy_document | High source authority for specific policy claims | RAW_EVIDENCE, EVIDENCE_PACKET, FACT, POLICY_TRUTH | PRODUCT_TRUTH generalization, FORECAST, HUMAN_DECISION | Policy id, holder, date, version, source, event/state | Policy identity, period and ADR-006 validation | display, search_index, recommendation_input, decision_support | product_truth, forecast_as_fact | advisor_os, manager_os, audit_only, user_facing | official_source_sync, user_confirmed where workflow allows | Policy contract, schedule, statement | Using product manual to assert issued policy state |
| quote_document | Medium scenario/evidence authority | RAW_EVIDENCE, EVIDENCE_PACKET, FACT for quote-specific fields, DECISION_SUPPORT | POLICY_TRUTH, SOURCE_TRUTH general rule, HUMAN_DECISION | Quote id, date, carrier, product, scenario, assumptions | Quote authenticity, period and scope validation | display, decision_support, recommendation_input with warning | policy_truth, source_truth, autonomous_decision | advisor_os, audit_only, user_facing | none | Insurance quote | Treating quote as issued policy |
| rule_pack | High rule interpretation authority when approved | RULE, RULE_SNAPSHOT, DECISION_SUPPORT | PRODUCT_TRUTH without source, POLICY_TRUTH, HUMAN_DECISION | Rule Pack id, owner, source docs, period, version | Governance, effective dates and source citation | recommendation_input, decision_support, audit_only | hardcoded rule, autonomous_decision | internal_only, audit_only, user_facing explanation | rule_pack_update, governance_approved | SMNYL Agency 2026 Rule Pack | Mixing 2025 commission with 2026 contest |
| rule_snapshot | Highest time-bound rule authority for its period | RULE_SNAPSHOT, RULE, DECISION_SUPPORT | Current rule outside period, HUMAN_DECISION | Snapshot id, source, frozen date, effective period | Snapshot integrity and period validation | recommendation_input, decision_support, audit_only | current truth outside period, mutation_without_confirmation | internal_only, audit_only, user_facing explanation | governance_approved | Historical compensation snapshot | Recalculating history with current rules |
| user_input | Low to medium claim evidence | USER_INPUT, RAW_EVIDENCE, EVIDENCE_PACKET, ASSUMPTION | SOURCE_TRUTH without validation, RULE, PRODUCT_TRUTH, POLICY_TRUTH without validation | User id/role, timestamp, context, statement | Speaker authority and source validation | display, search_index, user_confirmation_required, audit_only | source_truth, official_metric, autonomous_decision | advisor_os, manager_os, audit_only | user_confirmed | Advisor says client requested call | User statement overriding official source silently |
| advisor_confirmed | Medium human-confirmed operational context | USER_INPUT, FACT after validation, MANUAL_OVERRIDE, HUMAN_DECISION | Product/Policy/Rule truth without source | Advisor identity, confirmation event, timestamp, scope | Authority, conflict and source validation | display, recommendation_input, decision_support, audit_only | official_metric, product_truth without source | advisor_os, audit_only, user_facing as applicable | advisor_confirmed | Advisor confirms meeting happened | Advisor confirms carrier rule from memory |
| manager_confirmed | Medium Manager OS context | USER_INPUT, MANUAL_OVERRIDE, HUMAN_DECISION, FACT after validation | Advisor OS judgment, human worth, product/policy truth without source | Manager identity, role, reason, timestamp, scope | Authority, Miranda Wall and conflict validation | manager_visibility, audit_only, decision_support | advisor_os_judgment, manager_judgment without evidence | manager_os, audit_only | manager_confirmed | Manager confirms coaching event | Manager rating advisor worth |
| system_calculated | Medium derived/calculated authority | FACT, FORECAST, RECOMMENDATION, DECISION_SUPPORT | SOURCE_TRUTH, RULE, PRODUCT_TRUTH, POLICY_TRUTH unless backed by source | Inputs, formula/rule reference, timestamp, owner, version | Input ownership, metric owner, rule/source validation | display, ranking, recommendation_input, decision_support, audit_only | official_metric without owner, autonomous_decision | internal_only, advisor_os, manager_os, audit_only | system_validated | Persistency scenario from facts | Local calculation redefining official metric |
| external_api | Medium to high depending on official status | RAW_EVIDENCE, EVIDENCE_PACKET, FACT, SOURCE_TRUTH if official and validated | HUMAN_DECISION, AI_INTERPRETATION | Provider, endpoint, timestamp, response id, terms, freshness | Provider authority, freshness and conflict validation | display, search_index, decision_support, audit_only | unvalidated_user_facing_claim, autonomous_decision | internal_only, user_facing, audit_only | official_source_sync, system_validated | Official UDI/FX source | Non-official API as economic truth |
| OCR_output | Low candidate extraction authority | RAW_EVIDENCE, AI_EXTRACTION_CANDIDATE, EVIDENCE_PACKET candidate | PRODUCT_TRUTH, POLICY_TRUTH, SOURCE_TRUTH, RULE | Source file, OCR method, timestamp, extracted text, confidence label | Source matching and domain validation | display, search_index, audit_only, user_confirmation_required | product_truth, policy_truth, source_truth | internal_only, audit_only | none | OCR text from policy PDF | Treating OCR as final truth |
| parser_output | Low semantic candidate authority | AI_EXTRACTION_CANDIDATE, EVIDENCE_PACKET candidate, DECISION_SUPPORT candidate | PRODUCT_TRUTH, POLICY_TRUTH, SOURCE_TRUTH without validation | Parser name/version, source file, extracted fields, timestamp | Domain validation against source evidence | display, audit_only, user_confirmation_required | product_truth, policy_truth, official_metric | internal_only, audit_only | none | Parsed premium candidate | Parser output as issued policy fact |
| AI_interpretation | Lowest interpretation authority | AI_INTERPRETATION, AI_EXTRACTION_CANDIDATE, AI_CLASSIFICATION_CANDIDATE, DECISION_SUPPORT after validation | FACT, SOURCE_TRUTH, RULE, PRODUCT_TRUTH, POLICY_TRUTH, OFFICIAL_METRIC, HUMAN_DECISION | Prompt/context, model if known, input envelope ids, timestamp | Forge validation for presentation only or candidate validation path | display, draft_generation, audit_only | source_truth, autonomous_decision, manager_judgment | internal_only, user_facing only if labeled | none | AI summary of why result ranked | AI resolves conflict as final authority |
| manual_override | Medium to high only with audit | MANUAL_OVERRIDE, FACT after validation, HUMAN_DECISION where authorized | Erasing source evidence, product/policy/rule truth without source | Actor, role, reason, prior state, new state, timestamp, approval | Permission, reason, conflict and audit validation | audit_only, user_confirmation_required, state_mutation if approved | mutation_without_confirmation, source_truth without source | admin_only, manager_os, audit_only | advisor_confirmed, manager_confirmed, governance_approved | Authorized correction of stale record | Silent override of official evidence |
| governance_decision | Highest governance authority | SOURCE_TRUTH for governance status, RULE for governance rules, MANUAL_OVERRIDE, HUMAN_DECISION | Product/policy facts without source | Decision body, approval, date, scope, affected docs | ROBOCOP, Board/Miranda and constitutional validation | audit_only, display, blocked, governance guidance | commercial rule invention, runtime mutation without scope | internal_only, admin_only, audit_only | governance_approved | ROBOCOP lock, Board decision | Governance doc invents product benefit |
| human_decision | Highest accountable decision endpoint | HUMAN_DECISION | SOURCE_TRUTH, RULE, PRODUCT_TRUTH, POLICY_TRUTH, FORECAST truth | Actor, authority, timestamp, decision, scope, confirmation | Authority and audit validation | state_mutation if workflow approved, audit_only | source_truth, autonomous_decision by AI | advisor_os, manager_os, audit_only, user_facing | user_confirmed, advisor_confirmed, manager_confirmed | Advisor decides to call client | AI pretending to decide |
| unknown_owner | Protective blocker | UNKNOWN, RAW_EVIDENCE, EVIDENCE_PACKET candidate | FACT, SOURCE_TRUTH, RULE, PRODUCT_TRUTH, POLICY_TRUTH, RECOMMENDATION strong output | Gap reason, source if any, required owner | Ownership resolution required | audit_only, blocked, validation request | recommendation_input, state_mutation, official_metric | internal_only, audit_only, blocked | blocked | Unlabeled spreadsheet | Strong claim without owner |

## Owner Precedence Order

Higher precedence does not automatically win. It may win only after validation, period matching and conflict handling.

1. Constitution / locked ADR / governance_decision
2. official_document
3. carrier_document
4. policy_document
5. quote_document
6. validated rule_snapshot
7. validated rule_pack
8. validated system_calculated output from owned inputs
9. validated advisor_confirmed / manager_confirmed / user_input
10. manual_override with audit and authority
11. external_api validated as official or authoritative for its claim
12. OCR_output / parser_output candidates
13. AI_interpretation candidate
14. unknown_owner

## Conflict Rules

- If two sources conflict, Forge must mark CONFLICTING.
- Higher-precedence source wins only after validation.
- AI cannot resolve conflicts as final authority.
- User input cannot override official source without manual override audit.
- Manual override cannot erase original evidence.
- Stale official data must be marked STALE, not silently trusted.
- Conflict handling must preserve both claims, both owners, timestamps and validation path.
- Unknown owner blocks strong output until ownership is resolved.
- If source owner and claim owner differ, Forge must show the difference and block silent precedence.

## Ownership Rules By TruthType

| truthType | Required owner | Owner rules |
| --- | --- | --- |
| FACT | Domain owner or validated source owner | Must cite evidence owner, claim owner, period and validation state. |
| SOURCE_TRUTH | official_document, carrier_document, policy_document, governance_decision or validated domain source | Must be source-backed; AI, forecast and assumption cannot own source truth. |
| RULE | rule_pack, rule_snapshot, governance_decision or official_document | Every rule must cite source and effective period. HARD_CODED_VALUE cannot own rules. |
| RULE_SNAPSHOT | rule_snapshot / rule_pack with governance approval | Must freeze source, period, version and effective dates. |
| PRODUCT_TRUTH | Product Intelligence consuming official_document or carrier_document | OCR_output/parser_output may support candidates only. |
| POLICY_TRUTH | Policy Intelligence consuming policy_document or official admin source | Product Truth does not prove Policy Truth. |
| FORECAST | Forecast Intelligence with assumptions and owned inputs | Forecast owner owns scenarios, not facts. |
| ASSUMPTION | User/advisor/system planning context owner | Must stay labeled and cannot own fact/source truth. |
| RECOMMENDATION | NBA/domain recommendation owner consuming validated inputs | Must have owner, evidence and ADR-004 compliance. |
| DECISION_SUPPORT | Domain/orchestrator owner consuming validated inputs | Must preserve assumptions and unknowns. |
| AI_INTERPRETATION | AI_interpretation only | Can own interpretation/candidate label, never truth. |
| USER_INPUT | user_input/advisor_confirmed/manager_confirmed | Can become evidence packet or fact only after validation. |
| MANUAL_OVERRIDE | manual_override by authorized actor | Must audit actor, reason, prior state and approval. |
| HUMAN_DECISION | human_decision by authorized human | Final accountable action, not source truth for unrelated claims. |

## Ownership Rules By Domain

| Domain | Owns | Consumes | Must not own |
| --- | --- | --- | --- |
| Product Intelligence | PRODUCT_TRUTH from official/carrier product sources | Evidence packets, OCR/parser candidates, Rule Packs | Policy state, client suitability, compensation pressure |
| Policy Intelligence | POLICY_TRUTH for specific policy state/events | Product Truth, policy docs, admin records | Product rules, forecast facts, compensation truth |
| Forecast Intelligence | FORECAST scenarios and scenario metrics | Facts, Product Truth, Policy Truth, Economic Evidence, assumptions | Facts, source truth, paid income, official metrics |
| Compensation Intelligence | Compensation rule interpretation under rule_pack/rule_snapshot | Policy Truth, Product Truth, Economic Evidence, RuleSnapshots | Forge Core rules, Product Truth, Policy Truth, payment truth without evidence |
| Alfred Search Index | Indexed references to Forge-owned entities and contexts | TruthEnvelope fields, Forge Index, permissions, context | Source truth, LLM ranking truth, governed actions directly |
| NASH / Conversation Intelligence | Conversation guidance, framing and drafts | Product Truth, Policy Truth, Forecast, Recommendation, Relationship context | Client intent, Product Truth, Policy Truth, decisions, manipulation |
| Advisor OS | Safe actionable advisor-facing recommendations | Validated recommendations, decision support, facts | Manager judgments, human capital labels, hidden pressure |
| Manager OS | Governed coaching/allocation signals | Evidence-backed metrics, facts, signals, decision support | Human worth, Advisor OS judgment, enforcement without authority |
| Recruitment Intelligence | Recruitment evidence, candidate process context and governed assessments | Candidate evidence packets, Manager OS boundaries | Human worth, loyalty, future success as truth |
| Conservation Intelligence | Conservation risk context and policy/client signals | Policy Truth, Relationship signals, Forecast scenarios | Policy Truth, client pressure, guaranteed cancellation facts |

## Alfred-Specific Ownership Rules

- Alfred search results are owned by indexed Forge entities, not by LLM output.
- Alfred ranking signals must cite source ownership.
- Alfred may display AI summaries only as AI_INTERPRETATION.
- Alfred must not create source truth from search text.
- Alfred must not bypass Forge.
- Alfred must preserve evidenceState, owner and unknowns where relevant.

Slash search examples:

- `/Carlos` returns owned entities and their source contexts.
- `Carlos Sanchez - Prospecto - Cita de cierre` is owned by the indexed entity and CRM/context evidence, not by AI.
- An AI summary explaining why Carlos appears first must be labeled AI_INTERPRETATION and must cite Forge ranking signals.

## Product Intelligence Ownership Rules

- OCR_output may own raw extraction candidate, not product truth.
- parser_output may own extracted semantic candidate, not product truth.
- official product document or validated carrier document owns product truth.
- rule_pack/rule_snapshot owns executable product rule only when source/effective dates are present.
- Product Intelligence owns Product Truth interpretation, but cannot invent benefits, premiums, UDI, rates, yields or coverage.
- Product Knowledge Library does not automatically create Product Truth.
- Ambiguous Product PDF evidence remains UNVERIFIED, CONFLICTING, UNKNOWN or BLOCKED.

## Forecast And Compensation Ownership Rules

- Forecast owner must be forecast engine + assumptions, never fact owner.
- Compensation owner must be rule_pack/rule_snapshot, not Forge Core.
- Hardcoded values cannot own rules.
- Income projections require explicit source and assumptions.
- Forecast owns scenarios, not source facts.
- Compensation Intelligence may interpret compensation under official rules, snapshots and periods; it may not invent income or promise payment.
- Economic Motivation may explain context, but cannot own economic evidence or compensation truth.

## Manager OS Ownership Rules

- Manager signals are owned by evidence-backed system signals or manager-confirmed interpretation, not AI judgment.
- AI cannot own human worth, loyalty, potential, discipline or coachability.
- Manager judgments must not leak into Advisor OS.
- Miranda Wall remains active.
- Manager OS signals must identify source owner, metric owner and evidence state.
- Manager-confirmed interpretation cannot overwrite Product Truth, Policy Truth, Forecast Truth, compensation rules or human decision authority.
- Advisor OS may receive safe actionable recommendations, not RODI, human capital judgments or hidden manager pressure.

## What This Registry Does NOT Authorize

This registry does not authorize:

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

EVIDENCE STATE CONTRACT 001

Reason:

- Ownership must be paired with evidence condition before validators or runtime helpers can be designed.
- The next safest layer is evidence state, not feature implementation.
- Rule Snapshot Governance should follow once source ownership and evidence state are both locked.

Alternative planning-only follow-ups:

- RULE SNAPSHOT GOVERNANCE 001
- TRUTH BOUNDARY 003 - Validator Readiness Plan

## Final Status

PASS

READY FOR SOURCE OWNERSHIP LOCK
