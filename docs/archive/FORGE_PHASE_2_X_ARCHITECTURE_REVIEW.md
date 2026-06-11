# Forge OS Phase 2.X Architecture Review

Status: Documentation-only architecture review.
Scope: Existing JS/TS/TSX/CSS/JSON modules, ownership and refactor planning.
Implementation: NOT APPROVED.
No code modified. No files moved. No imports changed. No Build Tree real file updated.

## Executive Summary

- Total modules reviewed: 704
- High priority: 90
- Medium priority: 254
- Low priority: 360
- DO NOT TOUCH: 45
- REVIEW REQUIRED: 21
- MOVE LATER: 2
- CONSOLIDATE LATER: 117
- DELETE LATER ONLY IF PROVEN UNUSED: 290
- DOCUMENT: 57
- KEEP: 172

## Action Summary

- CONSOLIDATE LATER: 117
- DELETE LATER ONLY IF PROVEN UNUSED: 290
- DO NOT TOUCH: 45
- DOCUMENT: 57
- KEEP: 172
- MOVE LATER: 2
- REVIEW REQUIRED: 21

## Candidate Type Summary
- Core / Domain Module: 223
- Core / Protected Surface: 43
- Legacy / Migration Candidate: 8
- Migration Candidate: 409
- Needs Further Human Validation: 21

## Priority Themes

- ALTA: protected surfaces, legacy root files, schemas/configs, compensation/rule files, forecast/projection files and dashboard/cartera split risks.
- MEDIA: ownership ambiguity, possible duplicates, carrier-specific modules and review-required candidates.
- BAJA: clearly owned support modules with no immediate static risk.

## Dangerous Dependency Review

- Alfred / Universal Command Bar vs Command OS: do not mix advisor-facing command UX with parsing/routing/execution infrastructure.
- Compensation vs RuleSnapshot / Rule Pack: carrier-specific formulas, thresholds and bonus/commission rules require source docs and rule snapshots.
- Forecast vs Economic Motivation: forecasts cannot become guaranteed income or money promises.
- Local Predictive Truth vs Institutional Historical Truth: dashboards and forecast modules must not present local signals as institutional confirmed truth.
- Policy & Sales Operations vs UI: policy/cartera UI must consume official lifecycle outputs, not own business truth.
- Nash vs Mick/Productivity/Manager: conversation and coaching modules must not duplicate behavior/productivity/manager ownership.
- Legacy CRM AddLife Root vs Forge Core: root legacy app/util files stay migration candidates; no direct merge into Forge Core without ADR.

## Conceptual Build Tree Update

FORGE_MASTER_BUILD_TREE.md was not modified. Conceptual placement only:

- LEGACY_CRM_ADDLIFE_ROOT: app.js, dashboard.js, utils.js, store.js, runtime.js, db.js, sync-engine.js, service-worker.js, index.* candidates.
- FORGE CORE / PLATFORM SERVICES: app shell, event bus, runtime, storage, sync, logger, telemetry, config/package files.
- DOMAIN ENGINES: keep in place until owner ADR and tests exist.
- RULE PACK BOUNDARY: SMNYL, commissions, contests, bonuses, product-specific values and formulas require source documentation.
- PREDICTIVE TRUTH BOUNDARY: forecast/projection/currency/future-value modules need evidence/rates/confidence before official use.

## Top Domains by Module Count
- 07 POLICY & SALES OPERATIONS: 91
- 04 PRODUCT INTELLIGENCE ENGINE: 72
- SHARED CORE: 70
- 10 PLATFORM SERVICES: 57
- 02 SALES CONVERSION ENGINE: 49
- PERIODSNAPSHOT: 42
- EVIDENCE & PROVENANCE: 41
- 08 MANAGER & TEAM INTELLIGENCE: 35
- 05 RELATIONSHIP INTELLIGENCE ENGINE: 28
- 03 NASH CONVERSATION INTELLIGENCE: 23
- 04 PRODUCT INTELLIGENCE ENGINE + Rule Pack/source documentation boundary: 23
- 07 POLICY & SALES OPERATIONS, with Shared Core/Evidence consumers when generic: 22
- 12 ADVISOR EXPERIENCE INTELLIGENCE: 21
- COMPENSATION INTELLIGENCE: 15
- Nash Conversation Intelligence or Sales Conversion depending on workflow vs language role: 15

## Module Classification Table

Full module-by-module detail is in FORGE_PHASE_2_X_MODULE_MARKDOWN_BUNDLE.md and FORGE_PHASE_2_X_MODULE_DECISION_TABLE.txt.

| Module | Classification | Recommended Domain | Candidate | Action | Priority | Critical Dependencies |
|---|---|---|---|---|---|---|
| revenue-forecast-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 01 REVENUE GENERATION ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | ALTA | Predictive vs Historical Truth; Forecast vs Economic Motivation |
| prospecting-dashboard.viewmodel.js | KEEP | 02 SALES CONVERSION ENGINE | Core / Domain Module | KEEP | ALTA | UI / Advisor Experience vs business truth |
| quotation-currency-bridge.js | KEEP | 02 SALES CONVERSION ENGINE | Core / Domain Module | KEEP | ALTA | Predictive vs Historical Truth; Forecast vs Economic Motivation |
| product-schema-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 04 PRODUCT INTELLIGENCE ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | ALTA | No critical dependency flagged by Phase 2.X heuristics |
| smnyl-comisiones-gmm.js | DELETE LATER ONLY IF PROVEN UNUSED | 04 PRODUCT INTELLIGENCE ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | ALTA | Compensation Intelligence vs RuleSnapshot / Rule Pack |
| currency-normalization-engine.js | KEEP | 07 POLICY & SALES OPERATIONS | Core / Domain Module | KEEP | ALTA | Predictive vs Historical Truth; Forecast vs Economic Motivation |
| dashboard-priority-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | ALTA | UI / Advisor Experience vs business truth |
| operational-dashboard-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | ALTA | UI / Advisor Experience vs business truth |
| policy-import-dashboard-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | ALTA | UI / Advisor Experience vs business truth; Policy & Sales Operations lifecycle / Evidence provenance |
| cartera-events.js | KEEP | 07 POLICY & SALES OPERATIONS, with Shared Core/Evidence consumers when generic | Core / Domain Module | KEEP | ALTA | Policy & Sales Operations lifecycle / Evidence provenance |
| cartera-import-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS, with Shared Core/Evidence consumers when generic | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | ALTA | Policy & Sales Operations lifecycle / Evidence provenance |
| cartera-normalizer.js | KEEP | 07 POLICY & SALES OPERATIONS, with Shared Core/Evidence consumers when generic | Core / Domain Module | KEEP | ALTA | Policy & Sales Operations lifecycle / Evidence provenance |
| cartera-repository.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS, with Shared Core/Evidence consumers when generic | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | ALTA | Policy & Sales Operations lifecycle / Evidence provenance |
| cartera-service.js | KEEP | 07 POLICY & SALES OPERATIONS, with Shared Core/Evidence consumers when generic | Core / Domain Module | KEEP | ALTA | Policy & Sales Operations lifecycle / Evidence provenance |
| cartera-state.js | KEEP | 07 POLICY & SALES OPERATIONS, with Shared Core/Evidence consumers when generic | Core / Domain Module | KEEP | ALTA | Policy & Sales Operations lifecycle / Evidence provenance |
| cartera-utils.js | KEEP | 07 POLICY & SALES OPERATIONS, with Shared Core/Evidence consumers when generic | Core / Domain Module | KEEP | ALTA | Policy & Sales Operations lifecycle / Evidence provenance |
| cartera-validator.js | KEEP | 07 POLICY & SALES OPERATIONS, with Shared Core/Evidence consumers when generic | Core / Domain Module | KEEP | ALTA | Policy & Sales Operations lifecycle / Evidence provenance |
| cartera-view.js | DO NOT TOUCH | 07 POLICY & SALES OPERATIONS, with Shared Core/Evidence consumers when generic | Core / Protected Surface | DO NOT TOUCH | ALTA | UI / Advisor Experience vs business truth; Policy & Sales Operations lifecycle / Evidence provenance; Potential duplicate/overlap candidate |
| cartera.js | DO NOT TOUCH | 07 POLICY & SALES OPERATIONS, with Shared Core/Evidence consumers when generic | Core / Protected Surface | DO NOT TOUCH | ALTA | Policy & Sales Operations lifecycle / Evidence provenance; Potential duplicate/overlap candidate |
| db.js | KEEP | 10 PLATFORM SERVICES | Legacy / Migration Candidate | KEEP | ALTA | Legacy CRM AddLife Root isolation |
| event-bus-engine.js | DO NOT TOUCH | 10 PLATFORM SERVICES | Core / Protected Surface | DO NOT TOUCH | ALTA | Potential duplicate/overlap candidate |
| office-rules-config.schema.json | KEEP | 10 PLATFORM SERVICES | Core / Domain Module | KEEP | ALTA | No critical dependency flagged by Phase 2.X heuristics |
| service-worker.js | KEEP | 10 PLATFORM SERVICES | Legacy / Migration Candidate | KEEP | ALTA | Legacy CRM AddLife Root isolation |
| sync-engine.js | KEEP | 10 PLATFORM SERVICES | Legacy / Migration Candidate | KEEP | ALTA | Legacy CRM AddLife Root isolation |
| app.js | DO NOT TOUCH | 10 PLATFORM SERVICES / App Shell / Root Orchestration | Legacy / Migration Candidate | DO NOT TOUCH | ALTA | Potential duplicate/overlap candidate; Legacy CRM AddLife Root isolation |
| event-system.js | DO NOT TOUCH | 10 PLATFORM SERVICES or SHARED CORE event infrastructure | Core / Protected Surface | DO NOT TOUCH | ALTA | No critical dependency flagged by Phase 2.X heuristics |
| dashboard-executive.js | DELETE LATER ONLY IF PROVEN UNUSED | 12 ADVISOR EXPERIENCE INTELLIGENCE / UI consumer only | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | ALTA | UI / Advisor Experience vs business truth |
| dashboard-widget-card.tsx | KEEP | 12 ADVISOR EXPERIENCE INTELLIGENCE / UI consumer only | Core / Domain Module | KEEP | ALTA | UI / Advisor Experience vs business truth |
| dashboard.js | DO NOT TOUCH | 12 ADVISOR EXPERIENCE INTELLIGENCE / UI consumer only | Legacy / Migration Candidate | DO NOT TOUCH | ALTA | UI / Advisor Experience vs business truth; Legacy CRM AddLife Root isolation |
| first-contact-dashboard.viewmodel.js | DELETE LATER ONLY IF PROVEN UNUSED | 12 ADVISOR EXPERIENCE INTELLIGENCE / UI consumer only | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | ALTA | UI / Advisor Experience vs business truth |
| live-dashboard-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 12 ADVISOR EXPERIENCE INTELLIGENCE / UI consumer only | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | ALTA | UI / Advisor Experience vs business truth |
| predictive-dashboard.tsx | DELETE LATER ONLY IF PROVEN UNUSED | 12 ADVISOR EXPERIENCE INTELLIGENCE / UI consumer only | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | ALTA | UI / Advisor Experience vs business truth |
| team-dashboard-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 12 ADVISOR EXPERIENCE INTELLIGENCE / UI consumer only | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | ALTA | UI / Advisor Experience vs business truth |
| command-palette.js | DO NOT TOUCH | Alfred / Universal Command Bar | Core / Protected Surface | DO NOT TOUCH | ALTA | Alfred / Universal Command Bar vs Command OS boundary; Potential duplicate/overlap candidate |
| command-palette-ui.js | DO NOT TOUCH | Alfred / Universal Command Bar, with Command OS as execution dependency | Core / Protected Surface | DO NOT TOUCH | ALTA | Alfred / Universal Command Bar vs Command OS boundary; UI / Advisor Experience vs business truth; Potential duplicate/overlap candidate |
| command-palette.store.js | DO NOT TOUCH | Alfred / Universal Command Bar, with Command OS as execution dependency | Core / Protected Surface | DO NOT TOUCH | ALTA | Alfred / Universal Command Bar vs Command OS boundary |
| command-palette.tsx | DO NOT TOUCH | Alfred / Universal Command Bar, with Command OS as execution dependency | Core / Protected Surface | DO NOT TOUCH | ALTA | Alfred / Universal Command Bar vs Command OS boundary; UI / Advisor Experience vs business truth; Potential duplicate/overlap candidate |
| primary-risk-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | COMPENSATION INTELLIGENCE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | ALTA | Compensation Intelligence vs RuleSnapshot / Rule Pack |
| smnyl-executive-dashboard-engine.js | DOCUMENT | CONSERVATION INTELLIGENCE | Core / Domain Module | DOCUMENT | ALTA | UI / Advisor Experience vs business truth |
| comisiones-rules-gmm.js | DELETE LATER ONLY IF PROVEN UNUSED | Compensation Intelligence + RuleSnapshot / Rule Pack boundary | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | ALTA | Compensation Intelligence vs RuleSnapshot / Rule Pack |
| comisiones-utils.js | DELETE LATER ONLY IF PROVEN UNUSED | Compensation Intelligence + RuleSnapshot / Rule Pack boundary | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | ALTA | Compensation Intelligence vs RuleSnapshot / Rule Pack |
| comisiones.js | CONSOLIDATE LATER | Compensation Intelligence + RuleSnapshot / Rule Pack boundary | Migration Candidate | CONSOLIDATE LATER | ALTA | Compensation Intelligence vs RuleSnapshot / Rule Pack; Potential duplicate/overlap candidate |
| commission-projection-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | Compensation Intelligence + RuleSnapshot / Rule Pack boundary | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | ALTA | Compensation Intelligence vs RuleSnapshot / Rule Pack; Predictive vs Historical Truth; Forecast vs Economic Motivation |
| smnyl-bonos-engine.js | DO NOT TOUCH | Compensation Intelligence + RuleSnapshot / Rule Pack boundary | Core / Protected Surface | DO NOT TOUCH | ALTA | Compensation Intelligence vs RuleSnapshot / Rule Pack |
| smnyl-comisiones-engine.js | DO NOT TOUCH | Compensation Intelligence + RuleSnapshot / Rule Pack boundary | Core / Protected Surface | DO NOT TOUCH | ALTA | Compensation Intelligence vs RuleSnapshot / Rule Pack; Potential duplicate/overlap candidate |
| smnyl-comisiones-vida.js | DELETE LATER ONLY IF PROVEN UNUSED | Compensation Intelligence + RuleSnapshot / Rule Pack boundary | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | ALTA | Compensation Intelligence vs RuleSnapshot / Rule Pack |
| smnyl-concursos-engine.js | DO NOT TOUCH | Compensation Intelligence + RuleSnapshot / Rule Pack boundary | Core / Protected Surface | DO NOT TOUCH | ALTA | Compensation Intelligence vs RuleSnapshot / Rule Pack; Potential duplicate/overlap candidate |
| smnyl-prima-engine.js | DO NOT TOUCH | Compensation Intelligence + RuleSnapshot / Rule Pack boundary | Core / Protected Surface | DO NOT TOUCH | ALTA | Compensation Intelligence vs RuleSnapshot / Rule Pack |
| smnyl-training-allowance-engine.js | DO NOT TOUCH | Compensation Intelligence + RuleSnapshot / Rule Pack boundary | Core / Protected Surface | DO NOT TOUCH | ALTA | Compensation Intelligence vs RuleSnapshot / Rule Pack |
| forge-schema-reporter.js | DELETE LATER ONLY IF PROVEN UNUSED | EVIDENCE & PROVENANCE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | ALTA | No critical dependency flagged by Phase 2.X heuristics |
| dynamic-cash-value-projection-engine.js | DO NOT TOUCH | FORECAST INTELLIGENCE, with Economic Motivation/Product Intelligence consumers | Core / Protected Surface | DO NOT TOUCH | ALTA | Predictive vs Historical Truth; Forecast vs Economic Motivation |
| future-currency-value-engine.js | KEEP | FORECAST INTELLIGENCE, with Economic Motivation/Product Intelligence consumers | Core / Domain Module | KEEP | ALTA | Predictive vs Historical Truth; Forecast vs Economic Motivation |
| life-expectancy-projection-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | FORECAST INTELLIGENCE, with Economic Motivation/Product Intelligence consumers | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | ALTA | Predictive vs Historical Truth; Forecast vs Economic Motivation |
| projection-engine.js | DO NOT TOUCH | FORECAST INTELLIGENCE, with Economic Motivation/Product Intelligence consumers | Core / Protected Surface | DO NOT TOUCH | ALTA | Predictive vs Historical Truth; Forecast vs Economic Motivation |
| projection-milestone-engine.js | KEEP | FORECAST INTELLIGENCE, with Economic Motivation/Product Intelligence consumers | Core / Domain Module | KEEP | ALTA | Predictive vs Historical Truth; Forecast vs Economic Motivation |
| shared-currency-projection-engine.js | DO NOT TOUCH | FORECAST INTELLIGENCE, with Economic Motivation/Product Intelligence consumers | Core / Protected Surface | DO NOT TOUCH | ALTA | Predictive vs Historical Truth; Forecast vs Economic Motivation |
| shared-projection-scenarios-engine.js | KEEP | FORECAST INTELLIGENCE, with Economic Motivation/Product Intelligence consumers | Core / Domain Module | KEEP | ALTA | Predictive vs Historical Truth; Forecast vs Economic Motivation |
| smnyl-forecast-engine.js | DOCUMENT | FORECAST INTELLIGENCE, with Economic Motivation/Product Intelligence consumers | Core / Domain Module | DOCUMENT | ALTA | Predictive vs Historical Truth; Forecast vs Economic Motivation |
| runtime.js | KEEP | PERIODSNAPSHOT / OPERATIONAL CLOCKS | Legacy / Migration Candidate | KEEP | ALTA | Legacy CRM AddLife Root isolation |
| utils.js | KEEP | PERIODSNAPSHOT / OPERATIONAL CLOCKS | Legacy / Migration Candidate | KEEP | ALTA | Legacy CRM AddLife Root isolation |
| advisor-conversion.schema.json | DO NOT TOUCH | SHARED CORE | Core / Protected Surface | DO NOT TOUCH | ALTA | No critical dependency flagged by Phase 2.X heuristics |
| advisor.schema.json | DO NOT TOUCH | SHARED CORE | Core / Protected Surface | DO NOT TOUCH | ALTA | No critical dependency flagged by Phase 2.X heuristics |
| candidate-assessment.schema.json | DO NOT TOUCH | SHARED CORE | Core / Protected Surface | DO NOT TOUCH | ALTA | Recruitment vs Advisor Development ownership |
| candidate.schema.json | DO NOT TOUCH | SHARED CORE | Core / Protected Surface | DO NOT TOUCH | ALTA | Recruitment vs Advisor Development ownership |
| command-palette-engine.js | DO NOT TOUCH | SHARED CORE | Core / Protected Surface | DO NOT TOUCH | ALTA | Alfred / Universal Command Bar vs Command OS boundary; Potential duplicate/overlap candidate |
| core-event-bus.js | DO NOT TOUCH | SHARED CORE | Core / Protected Surface | DO NOT TOUCH | ALTA | Potential duplicate/overlap candidate |
| core_event-bus.js | DO NOT TOUCH | SHARED CORE | Core / Protected Surface | DO NOT TOUCH | ALTA | Potential duplicate/overlap candidate |
| interview-evidence.schema.json | DO NOT TOUCH | SHARED CORE | Core / Protected Surface | DO NOT TOUCH | ALTA | UI / Advisor Experience vs business truth |
| interview.schema.json | DO NOT TOUCH | SHARED CORE | Core / Protected Surface | DO NOT TOUCH | ALTA | UI / Advisor Experience vs business truth |
| manager-assignment.schema.json | DO NOT TOUCH | SHARED CORE | Core / Protected Surface | DO NOT TOUCH | ALTA | No critical dependency flagged by Phase 2.X heuristics |
| manager-report.schema.json | DO NOT TOUCH | SHARED CORE | Core / Protected Surface | DO NOT TOUCH | ALTA | No critical dependency flagged by Phase 2.X heuristics |
| market-evidence.schema.json | DO NOT TOUCH | SHARED CORE | Core / Protected Surface | DO NOT TOUCH | ALTA | No critical dependency flagged by Phase 2.X heuristics |
| nash-report.schema.json | DO NOT TOUCH | SHARED CORE | Core / Protected Surface | DO NOT TOUCH | ALTA | Nash vs Sales Conversion vs Mick/Productivity/Manager |
| office-assignment.schema.json | DO NOT TOUCH | SHARED CORE | Core / Protected Surface | DO NOT TOUCH | ALTA | No critical dependency flagged by Phase 2.X heuristics |
| organization-profile.schema.json | DO NOT TOUCH | SHARED CORE | Core / Protected Surface | DO NOT TOUCH | ALTA | No critical dependency flagged by Phase 2.X heuristics |
| policy-schema-validator-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | SHARED CORE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | ALTA | Policy & Sales Operations lifecycle / Evidence provenance |
| policy.schema.json | DO NOT TOUCH | SHARED CORE | Core / Protected Surface | DO NOT TOUCH | ALTA | Policy & Sales Operations lifecycle / Evidence provenance |
| precontract-activity-evidence.schema.json | DO NOT TOUCH | SHARED CORE | Core / Protected Surface | DO NOT TOUCH | ALTA | Recruitment vs Advisor Development ownership |
| precontract-cycle.schema.json | DO NOT TOUCH | SHARED CORE | Core / Protected Surface | DO NOT TOUCH | ALTA | Recruitment vs Advisor Development ownership |
| precontract.schema.json | DO NOT TOUCH | SHARED CORE | Core / Protected Surface | DO NOT TOUCH | ALTA | Recruitment vs Advisor Development ownership |
| project200.schema.json | DO NOT TOUCH | SHARED CORE | Core / Protected Surface | DO NOT TOUCH | ALTA | No critical dependency flagged by Phase 2.X heuristics |
| prospect.schema.json | DO NOT TOUCH | SHARED CORE | Core / Protected Surface | DO NOT TOUCH | ALTA | No critical dependency flagged by Phase 2.X heuristics |
| question-evidence.schema.json | DO NOT TOUCH | SHARED CORE | Core / Protected Surface | DO NOT TOUCH | ALTA | No critical dependency flagged by Phase 2.X heuristics |
| rda.schema.json | DO NOT TOUCH | SHARED CORE | Core / Protected Surface | DO NOT TOUCH | ALTA | No critical dependency flagged by Phase 2.X heuristics |
| recruit-identity.schema.json | DO NOT TOUCH | SHARED CORE | Core / Protected Surface | DO NOT TOUCH | ALTA | UI / Advisor Experience vs business truth |
| recruitment-application.schema.json | DO NOT TOUCH | SHARED CORE | Core / Protected Surface | DO NOT TOUCH | ALTA | UI / Advisor Experience vs business truth |
| relationship-report.schema.json | DO NOT TOUCH | SHARED CORE | Core / Protected Surface | DO NOT TOUCH | ALTA | No critical dependency flagged by Phase 2.X heuristics |
| relationship.schema.json | DO NOT TOUCH | SHARED CORE | Core / Protected Surface | DO NOT TOUCH | ALTA | No critical dependency flagged by Phase 2.X heuristics |
| store.js | KEEP | SHARED CORE | Legacy / Migration Candidate | KEEP | ALTA | Legacy CRM AddLife Root isolation |
| schema-field-engine.js | REVIEW REQUIRED | UNKNOWN / NEEDS REVIEW | Needs Further Human Validation | REVIEW REQUIRED | ALTA | No critical dependency flagged by Phase 2.X heuristics |
| manager-alert-engine.js | CONSOLIDATE LATER | 01 REVENUE GENERATION ENGINE | Migration Candidate | CONSOLIDATE LATER | MEDIA | Potential duplicate/overlap candidate |
| forge-ai-connector-master-test.js | CONSOLIDATE LATER | 02 SALES CONVERSION ENGINE | Migration Candidate | CONSOLIDATE LATER | MEDIA | Potential duplicate/overlap candidate |
| forge-build-tree-status.js | DELETE LATER ONLY IF PROVEN UNUSED | 02 SALES CONVERSION ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | MEDIA | UI / Advisor Experience vs business truth |
| gmm-out-of-pocket-test.js | CONSOLIDATE LATER | 02 SALES CONVERSION ENGINE | Migration Candidate | CONSOLIDATE LATER | MEDIA | Potential duplicate/overlap candidate |
| imagina-ser-presentation-prompt-engine.js | DOCUMENT | 02 SALES CONVERSION ENGINE | Core / Domain Module | DOCUMENT | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| orvi-client-report-test.js | DOCUMENT | 02 SALES CONVERSION ENGINE | Core / Domain Module | DOCUMENT | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| presentation-pipeline-test.js | DOCUMENT | 02 SALES CONVERSION ENGINE | Core / Domain Module | DOCUMENT | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| real-gmm-quote-test.js | DOCUMENT | 02 SALES CONVERSION ENGINE | Core / Domain Module | DOCUMENT | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| smnyl-pipeline-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 02 SALES CONVERSION ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| vida-mujer-client-presentation-test.js | CONSOLIDATE LATER | 02 SALES CONVERSION ENGINE | Migration Candidate | CONSOLIDATE LATER | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| vida-mujer-financial-fixture-report.js | DELETE LATER ONLY IF PROVEN UNUSED | 02 SALES CONVERSION ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| nash-advisor-performance-master-test.js | CONSOLIDATE LATER | 03 NASH CONVERSATION INTELLIGENCE | Migration Candidate | CONSOLIDATE LATER | MEDIA | Nash vs Sales Conversion vs Mick/Productivity/Manager; Potential duplicate/overlap candidate |
| nash-coaching-insight-master-test.js | CONSOLIDATE LATER | 03 NASH CONVERSATION INTELLIGENCE | Migration Candidate | CONSOLIDATE LATER | MEDIA | Nash vs Sales Conversion vs Mick/Productivity/Manager; Potential duplicate/overlap candidate |
| nash-combat-intelligence-report-engine.js | CONSOLIDATE LATER | 03 NASH CONVERSATION INTELLIGENCE | Migration Candidate | CONSOLIDATE LATER | MEDIA | Nash vs Sales Conversion vs Mick/Productivity/Manager; Potential duplicate/overlap candidate |
| nash-combat-intelligence-report-test.js | CONSOLIDATE LATER | 03 NASH CONVERSATION INTELLIGENCE | Migration Candidate | CONSOLIDATE LATER | MEDIA | Nash vs Sales Conversion vs Mick/Productivity/Manager; Potential duplicate/overlap candidate |
| nash-learning-engine.js | CONSOLIDATE LATER | 03 NASH CONVERSATION INTELLIGENCE | Migration Candidate | CONSOLIDATE LATER | MEDIA | Nash vs Sales Conversion vs Mick/Productivity/Manager |
| nash-master-intelligence-engine.js | CONSOLIDATE LATER | 03 NASH CONVERSATION INTELLIGENCE | Migration Candidate | CONSOLIDATE LATER | MEDIA | Nash vs Sales Conversion vs Mick/Productivity/Manager |
| nash-master-intelligence-master-test.js | CONSOLIDATE LATER | 03 NASH CONVERSATION INTELLIGENCE | Migration Candidate | CONSOLIDATE LATER | MEDIA | Nash vs Sales Conversion vs Mick/Productivity/Manager |
| nash-memory-master-test.js | CONSOLIDATE LATER | 03 NASH CONVERSATION INTELLIGENCE | Migration Candidate | CONSOLIDATE LATER | MEDIA | Nash vs Sales Conversion vs Mick/Productivity/Manager |
| nash-next-best-action-engine.js | CONSOLIDATE LATER | 03 NASH CONVERSATION INTELLIGENCE | Migration Candidate | CONSOLIDATE LATER | MEDIA | Nash vs Sales Conversion vs Mick/Productivity/Manager |
| nash-next-best-action-master-test.js | CONSOLIDATE LATER | 03 NASH CONVERSATION INTELLIGENCE | Migration Candidate | CONSOLIDATE LATER | MEDIA | Nash vs Sales Conversion vs Mick/Productivity/Manager |
| nash-personality-master-test.js | CONSOLIDATE LATER | 03 NASH CONVERSATION INTELLIGENCE | Migration Candidate | CONSOLIDATE LATER | MEDIA | Nash vs Sales Conversion vs Mick/Productivity/Manager |
| orvi-objection-engine.js | DOCUMENT | 03 NASH CONVERSATION INTELLIGENCE | Core / Domain Module | DOCUMENT | MEDIA | Nash vs Sales Conversion vs Mick/Productivity/Manager |
| business-rules-test.js | DOCUMENT | 04 PRODUCT INTELLIGENCE ENGINE | Core / Domain Module | DOCUMENT | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| critical-path-test.js | DOCUMENT | 04 PRODUCT INTELLIGENCE ENGINE | Core / Domain Module | DOCUMENT | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| decision-appendix-master-test.js | CONSOLIDATE LATER | 04 PRODUCT INTELLIGENCE ENGINE | Migration Candidate | CONSOLIDATE LATER | MEDIA | Potential duplicate/overlap candidate |
| education-cost-master-test.js | CONSOLIDATE LATER | 04 PRODUCT INTELLIGENCE ENGINE | Migration Candidate | CONSOLIDATE LATER | MEDIA | Potential duplicate/overlap candidate |
| education-paths-master-test.js | CONSOLIDATE LATER | 04 PRODUCT INTELLIGENCE ENGINE | Migration Candidate | CONSOLIDATE LATER | MEDIA | Potential duplicate/overlap candidate |
| forge-ai-guardrails-engine.js | DOCUMENT | 04 PRODUCT INTELLIGENCE ENGINE | Core / Domain Module | DOCUMENT | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| forge-global-master-test.js | DOCUMENT | 04 PRODUCT INTELLIGENCE ENGINE | Core / Domain Module | DOCUMENT | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| forge-imagina-ser-client-presentation-test.js | DOCUMENT | 04 PRODUCT INTELLIGENCE ENGINE | Core / Domain Module | DOCUMENT | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| forge-semantic-risk-report.js | DELETE LATER ONLY IF PROVEN UNUSED | 04 PRODUCT INTELLIGENCE ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| forge-shared-ave-master-test.js | DOCUMENT | 04 PRODUCT INTELLIGENCE ENGINE | Core / Domain Module | DOCUMENT | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| forge-vida-mujer-advisor-report.js | DELETE LATER ONLY IF PROVEN UNUSED | 04 PRODUCT INTELLIGENCE ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| imagina-ser-fiscal-master-test.js | DOCUMENT | 04 PRODUCT INTELLIGENCE ENGINE | Core / Domain Module | DOCUMENT | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| imagina-ser-master-test.js | DOCUMENT | 04 PRODUCT INTELLIGENCE ENGINE | Core / Domain Module | DOCUMENT | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| imagina-ser-variant-engine.js | DOCUMENT | 04 PRODUCT INTELLIGENCE ENGINE | Core / Domain Module | DOCUMENT | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| imagina-ser-variant-fiscal-master-test.js | DOCUMENT | 04 PRODUCT INTELLIGENCE ENGINE | Core / Domain Module | DOCUMENT | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| line-of-business-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 04 PRODUCT INTELLIGENCE ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| nash-message-recommendation-engine.js | DOCUMENT | 04 PRODUCT INTELLIGENCE ENGINE | Core / Domain Module | DOCUMENT | MEDIA | Nash vs Sales Conversion vs Mick/Productivity/Manager |
| orvi-client-presentation-engine.js | DOCUMENT | 04 PRODUCT INTELLIGENCE ENGINE | Core / Domain Module | DOCUMENT | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| orvi-master-test.js | DOCUMENT | 04 PRODUCT INTELLIGENCE ENGINE | Core / Domain Module | DOCUMENT | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| orvi-ocr-extractor.js | DOCUMENT | 04 PRODUCT INTELLIGENCE ENGINE | Core / Domain Module | DOCUMENT | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| policy-ai-parser.js | DELETE LATER ONLY IF PROVEN UNUSED | 04 PRODUCT INTELLIGENCE ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | MEDIA | Policy & Sales Operations lifecycle / Evidence provenance |
| product-detection-engine.js | DOCUMENT | 04 PRODUCT INTELLIGENCE ENGINE | Core / Domain Module | DOCUMENT | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| segu-beca-client-presentation-engine.js | DOCUMENT | 04 PRODUCT INTELLIGENCE ENGINE | Core / Domain Module | DOCUMENT | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| segu-beca-education-options-engine.js | DOCUMENT | 04 PRODUCT INTELLIGENCE ENGINE | Core / Domain Module | DOCUMENT | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| segu-beca-ocr-intake-report.js | DELETE LATER ONLY IF PROVEN UNUSED | 04 PRODUCT INTELLIGENCE ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| shared-ave-confidence-engine.js | CONSOLIDATE LATER | 04 PRODUCT INTELLIGENCE ENGINE | Migration Candidate | CONSOLIDATE LATER | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| shared-ave-confidence-report.js | CONSOLIDATE LATER | 04 PRODUCT INTELLIGENCE ENGINE | Migration Candidate | CONSOLIDATE LATER | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| shared-ave-death-benefit-engine.js | CONSOLIDATE LATER | 04 PRODUCT INTELLIGENCE ENGINE | Migration Candidate | CONSOLIDATE LATER | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| shared-ave-death-benefit-report.js | CONSOLIDATE LATER | 04 PRODUCT INTELLIGENCE ENGINE | Migration Candidate | CONSOLIDATE LATER | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| shared-ave-eligibility-engine.js | DOCUMENT | 04 PRODUCT INTELLIGENCE ENGINE | Core / Domain Module | DOCUMENT | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| shared-ave-portfolio-engine.js | CONSOLIDATE LATER | 04 PRODUCT INTELLIGENCE ENGINE | Migration Candidate | CONSOLIDATE LATER | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| shared-ave-portfolio-report.js | CONSOLIDATE LATER | 04 PRODUCT INTELLIGENCE ENGINE | Migration Candidate | CONSOLIDATE LATER | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| shared-ave-rescue-engine.js | CONSOLIDATE LATER | 04 PRODUCT INTELLIGENCE ENGINE | Migration Candidate | CONSOLIDATE LATER | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| shared-ave-rescue-report.js | CONSOLIDATE LATER | 04 PRODUCT INTELLIGENCE ENGINE | Migration Candidate | CONSOLIDATE LATER | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| shared-ave-type-inference-engine.js | CONSOLIDATE LATER | 04 PRODUCT INTELLIGENCE ENGINE | Migration Candidate | CONSOLIDATE LATER | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| shared-ave-type-inference-report.js | CONSOLIDATE LATER | 04 PRODUCT INTELLIGENCE ENGINE | Migration Candidate | CONSOLIDATE LATER | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| shared-benefit-hierarchy-engine.js | DOCUMENT | 04 PRODUCT INTELLIGENCE ENGINE | Core / Domain Module | DOCUMENT | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| shared-education-cost-engine.js | CONSOLIDATE LATER | 04 PRODUCT INTELLIGENCE ENGINE | Migration Candidate | CONSOLIDATE LATER | MEDIA | Potential duplicate/overlap candidate |
| shared-education-paths-engine.js | CONSOLIDATE LATER | 04 PRODUCT INTELLIGENCE ENGINE | Migration Candidate | CONSOLIDATE LATER | MEDIA | Potential duplicate/overlap candidate |
| smnyl-cross-sell-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 04 PRODUCT INTELLIGENCE ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| solucionline-retirement-parser.js | DOCUMENT | 04 PRODUCT INTELLIGENCE ENGINE | Core / Domain Module | DOCUMENT | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| vida-mujer-client-explanation-report.js | DELETE LATER ONLY IF PROVEN UNUSED | 04 PRODUCT INTELLIGENCE ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| vida-mujer-coverage-status-engine.js | CONSOLIDATE LATER | 04 PRODUCT INTELLIGENCE ENGINE | Migration Candidate | CONSOLIDATE LATER | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| vida-mujer-financial-correction-report.js | DELETE LATER ONLY IF PROVEN UNUSED | 04 PRODUCT INTELLIGENCE ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| vida-mujer-master-test.js | DOCUMENT | 04 PRODUCT INTELLIGENCE ENGINE | Core / Domain Module | DOCUMENT | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| vida-mujer-pdf-ave-integration-report.js | DELETE LATER ONLY IF PROVEN UNUSED | 04 PRODUCT INTELLIGENCE ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| vida-mujer-pdf-intake-report.js | DELETE LATER ONLY IF PROVEN UNUSED | 04 PRODUCT INTELLIGENCE ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| vida-mujer-real-test.js | DOCUMENT | 04 PRODUCT INTELLIGENCE ENGINE | Core / Domain Module | DOCUMENT | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| vida-mujer-rule-consistency-report.js | DELETE LATER ONLY IF PROVEN UNUSED | 04 PRODUCT INTELLIGENCE ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| vida-mujer-status.js | DELETE LATER ONLY IF PROVEN UNUSED | 04 PRODUCT INTELLIGENCE ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| gmm-out-of-pocket-engine.js | CONSOLIDATE LATER | 04 PRODUCT INTELLIGENCE ENGINE + Rule Pack/source documentation boundary | Migration Candidate | CONSOLIDATE LATER | MEDIA | Potential duplicate/overlap candidate |
| gmm-quote-parser.js | DOCUMENT | 04 PRODUCT INTELLIGENCE ENGINE + Rule Pack/source documentation boundary | Core / Domain Module | DOCUMENT | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| imagina-ser-client-presentation-engine.js | DOCUMENT | 04 PRODUCT INTELLIGENCE ENGINE + Rule Pack/source documentation boundary | Core / Domain Module | DOCUMENT | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| orvi-decision-engine.js | DOCUMENT | 04 PRODUCT INTELLIGENCE ENGINE + Rule Pack/source documentation boundary | Core / Domain Module | DOCUMENT | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| segu-beca-master-test.js | DOCUMENT | 04 PRODUCT INTELLIGENCE ENGINE + Rule Pack/source documentation boundary | Core / Domain Module | DOCUMENT | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| segu-beca-meaningful-numbers-report.js | DELETE LATER ONLY IF PROVEN UNUSED | 04 PRODUCT INTELLIGENCE ENGINE + Rule Pack/source documentation boundary | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| segu-beca-mxn-appendix-report.js | DELETE LATER ONLY IF PROVEN UNUSED | 04 PRODUCT INTELLIGENCE ENGINE + Rule Pack/source documentation boundary | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| shared-ave-growth-engine.js | CONSOLIDATE LATER | 04 PRODUCT INTELLIGENCE ENGINE + Rule Pack/source documentation boundary | Migration Candidate | CONSOLIDATE LATER | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| shared-ave-growth-report.js | CONSOLIDATE LATER | 04 PRODUCT INTELLIGENCE ENGINE + Rule Pack/source documentation boundary | Migration Candidate | CONSOLIDATE LATER | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| shared-clp-engine.js | CONSOLIDATE LATER | 04 PRODUCT INTELLIGENCE ENGINE + Rule Pack/source documentation boundary | Migration Candidate | CONSOLIDATE LATER | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| smnyl-productos-gmm.js | DOCUMENT | 04 PRODUCT INTELLIGENCE ENGINE + Rule Pack/source documentation boundary | Core / Domain Module | DOCUMENT | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| smnyl-productos-vida.js | DOCUMENT | 04 PRODUCT INTELLIGENCE ENGINE + Rule Pack/source documentation boundary | Core / Domain Module | DOCUMENT | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| vida-mujer-coverage-status-report.js | CONSOLIDATE LATER | 04 PRODUCT INTELLIGENCE ENGINE + Rule Pack/source documentation boundary | Migration Candidate | CONSOLIDATE LATER | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| vida-mujer-event-benefits-report.js | DELETE LATER ONLY IF PROVEN UNUSED | 04 PRODUCT INTELLIGENCE ENGINE + Rule Pack/source documentation boundary | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| vida-mujer-knowledge-extractor-report.js | CONSOLIDATE LATER | 04 PRODUCT INTELLIGENCE ENGINE + Rule Pack/source documentation boundary | Migration Candidate | CONSOLIDATE LATER | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| vida-mujer-knowledge-extractor.js | CONSOLIDATE LATER | 04 PRODUCT INTELLIGENCE ENGINE + Rule Pack/source documentation boundary | Migration Candidate | CONSOLIDATE LATER | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| vida-mujer-protected-diseases-engine.js | CONSOLIDATE LATER | 04 PRODUCT INTELLIGENCE ENGINE + Rule Pack/source documentation boundary | Migration Candidate | CONSOLIDATE LATER | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| vida-mujer-protected-diseases-report.js | CONSOLIDATE LATER | 04 PRODUCT INTELLIGENCE ENGINE + Rule Pack/source documentation boundary | Migration Candidate | CONSOLIDATE LATER | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| client-engagement-master-test.js | CONSOLIDATE LATER | 05 RELATIONSHIP INTELLIGENCE ENGINE | Migration Candidate | CONSOLIDATE LATER | MEDIA | Potential duplicate/overlap candidate |
| nash-coaching-insight-engine.js | CONSOLIDATE LATER | 05 RELATIONSHIP INTELLIGENCE ENGINE | Migration Candidate | CONSOLIDATE LATER | MEDIA | Nash vs Sales Conversion vs Mick/Productivity/Manager; Potential duplicate/overlap candidate |
| quick-actions-engine.js | CONSOLIDATE LATER | 05 RELATIONSHIP INTELLIGENCE ENGINE | Migration Candidate | CONSOLIDATE LATER | MEDIA | UI / Advisor Experience vs business truth |
| relationship-master-acceptance-test.js | DOCUMENT | 05 RELATIONSHIP INTELLIGENCE ENGINE | Core / Domain Module | DOCUMENT | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| smnyl-automation-engine.js | DOCUMENT | 05 RELATIONSHIP INTELLIGENCE ENGINE | Core / Domain Module | DOCUMENT | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| smnyl-reminders-engine.js | DOCUMENT | 05 RELATIONSHIP INTELLIGENCE ENGINE | Core / Domain Module | DOCUMENT | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| center-of-influence-engine.js | REVIEW REQUIRED | 05 RELATIONSHIP INTELLIGENCE ENGINE or 02 SALES CONVERSION ENGINE; review required | Needs Further Human Validation | REVIEW REQUIRED | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| referral-color-engine.js | REVIEW REQUIRED | 05 RELATIONSHIP INTELLIGENCE ENGINE or 02 SALES CONVERSION ENGINE; review required | Needs Further Human Validation | REVIEW REQUIRED | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| referral-priority-engine.js | REVIEW REQUIRED | 05 RELATIONSHIP INTELLIGENCE ENGINE or 02 SALES CONVERSION ENGINE; review required | Needs Further Human Validation | REVIEW REQUIRED | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| referral-temperature-engine.js | REVIEW REQUIRED | 05 RELATIONSHIP INTELLIGENCE ENGINE or 02 SALES CONVERSION ENGINE; review required | Needs Further Human Validation | REVIEW REQUIRED | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| nash-learning-master-test.js | CONSOLIDATE LATER | 06 LEARNING INTELLIGENCE ENGINE | Migration Candidate | CONSOLIDATE LATER | MEDIA | Nash vs Sales Conversion vs Mick/Productivity/Manager |
| adaptive-question-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| ai-task-suggestion-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| orvi-mxn-master-test.js | DOCUMENT | 07 POLICY & SALES OPERATIONS | Core / Domain Module | DOCUMENT | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| policy-detail-view-model.js | CONSOLIDATE LATER | 07 POLICY & SALES OPERATIONS | Migration Candidate | CONSOLIDATE LATER | MEDIA | UI / Advisor Experience vs business truth; Policy & Sales Operations lifecycle / Evidence provenance |
| policy-quick-actions-engine.js | CONSOLIDATE LATER | 07 POLICY & SALES OPERATIONS | Migration Candidate | CONSOLIDATE LATER | MEDIA | UI / Advisor Experience vs business truth; Policy & Sales Operations lifecycle / Evidence provenance |
| policy-task-engine.js | CONSOLIDATE LATER | 07 POLICY & SALES OPERATIONS | Migration Candidate | CONSOLIDATE LATER | MEDIA | Policy & Sales Operations lifecycle / Evidence provenance |
| policy-task-priority-engine.js | CONSOLIDATE LATER | 07 POLICY & SALES OPERATIONS | Migration Candidate | CONSOLIDATE LATER | MEDIA | Policy & Sales Operations lifecycle / Evidence provenance |
| policy-timeline-query-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | MEDIA | Policy & Sales Operations lifecycle / Evidence provenance |
| policy-timeline-view-model.js | CONSOLIDATE LATER | 07 POLICY & SALES OPERATIONS | Migration Candidate | CONSOLIDATE LATER | MEDIA | UI / Advisor Experience vs business truth; Policy & Sales Operations lifecycle / Evidence provenance |
| prospeccion.js | DOCUMENT | 07 POLICY & SALES OPERATIONS | Core / Domain Module | DOCUMENT | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| real-pdf-ocr-test.js | DOCUMENT | 07 POLICY & SALES OPERATIONS | Core / Domain Module | DOCUMENT | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| relationship-health-engine.js | CONSOLIDATE LATER | 07 POLICY & SALES OPERATIONS | Migration Candidate | CONSOLIDATE LATER | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| relationship-next-action-master-test.js | CONSOLIDATE LATER | 07 POLICY & SALES OPERATIONS | Migration Candidate | CONSOLIDATE LATER | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| relationship-opportunity-engine.js | CONSOLIDATE LATER | 07 POLICY & SALES OPERATIONS | Migration Candidate | CONSOLIDATE LATER | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| relationship-review-engine.js | CONSOLIDATE LATER | 07 POLICY & SALES OPERATIONS | Migration Candidate | CONSOLIDATE LATER | MEDIA | UI / Advisor Experience vs business truth |
| relationship-review-master-test.js | CONSOLIDATE LATER | 07 POLICY & SALES OPERATIONS | Migration Candidate | CONSOLIDATE LATER | MEDIA | UI / Advisor Experience vs business truth |
| relationship-timeline-master-test.js | CONSOLIDATE LATER | 07 POLICY & SALES OPERATIONS | Migration Candidate | CONSOLIDATE LATER | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| render-engine.js | CONSOLIDATE LATER | 07 POLICY & SALES OPERATIONS | Migration Candidate | CONSOLIDATE LATER | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| smnyl-operating-system-engine.js | DOCUMENT | 07 POLICY & SALES OPERATIONS | Core / Domain Module | DOCUMENT | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| task-engine.js | CONSOLIDATE LATER | 07 POLICY & SALES OPERATIONS | Migration Candidate | CONSOLIDATE LATER | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| task-priority-engine.js | CONSOLIDATE LATER | 07 POLICY & SALES OPERATIONS | Migration Candidate | CONSOLIDATE LATER | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| vida-mujer-survival-schedule-engine.js | CONSOLIDATE LATER | 07 POLICY & SALES OPERATIONS | Migration Candidate | CONSOLIDATE LATER | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| vida-mujer-survival-schedule-test.js | CONSOLIDATE LATER | 07 POLICY & SALES OPERATIONS | Migration Candidate | CONSOLIDATE LATER | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| mass-import-preview-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS, with Shared Core/Evidence consumers when generic | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | MEDIA | UI / Advisor Experience vs business truth; Policy & Sales Operations lifecycle / Evidence provenance |
| policy-detail-engine.js | CONSOLIDATE LATER | 07 POLICY & SALES OPERATIONS, with Shared Core/Evidence consumers when generic | Migration Candidate | CONSOLIDATE LATER | MEDIA | Policy & Sales Operations lifecycle / Evidence provenance |
| policy-followup-engine.js | CONSOLIDATE LATER | 07 POLICY & SALES OPERATIONS, with Shared Core/Evidence consumers when generic | Migration Candidate | CONSOLIDATE LATER | MEDIA | Policy & Sales Operations lifecycle / Evidence provenance; Nash vs Sales Conversion vs Mick/Productivity/Manager; Potential duplicate/overlap candidate |
| policy-human-review-engine.js | MOVE LATER | 07 POLICY & SALES OPERATIONS, with Shared Core/Evidence consumers when generic | Migration Candidate | MOVE LATER | MEDIA | UI / Advisor Experience vs business truth; Policy & Sales Operations lifecycle / Evidence provenance |
| policy-risk-engine.js | CONSOLIDATE LATER | 07 POLICY & SALES OPERATIONS, with Shared Core/Evidence consumers when generic | Migration Candidate | CONSOLIDATE LATER | MEDIA | Policy & Sales Operations lifecycle / Evidence provenance |
| policy-storage-engine.js | CONSOLIDATE LATER | 07 POLICY & SALES OPERATIONS, with Shared Core/Evidence consumers when generic | Migration Candidate | CONSOLIDATE LATER | MEDIA | Policy & Sales Operations lifecycle / Evidence provenance |
| policy-timeline-engine.js | CONSOLIDATE LATER | 07 POLICY & SALES OPERATIONS, with Shared Core/Evidence consumers when generic | Migration Candidate | CONSOLIDATE LATER | MEDIA | Policy & Sales Operations lifecycle / Evidence provenance |
| staging-review-engine.js | MOVE LATER | 07 POLICY & SALES OPERATIONS, with Shared Core/Evidence consumers when generic | Migration Candidate | MOVE LATER | MEDIA | UI / Advisor Experience vs business truth; Policy & Sales Operations lifecycle / Evidence provenance |
| app-shell-manager.js | DOCUMENT | 08 MANAGER & TEAM INTELLIGENCE | Core / Domain Module | DOCUMENT | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| nash-manager-alert-master-test.js | CONSOLIDATE LATER | 08 MANAGER & TEAM INTELLIGENCE | Migration Candidate | CONSOLIDATE LATER | MEDIA | Nash vs Sales Conversion vs Mick/Productivity/Manager; Potential duplicate/overlap candidate |
| nash-team-intelligence-engine.js | CONSOLIDATE LATER | 08 MANAGER & TEAM INTELLIGENCE | Migration Candidate | CONSOLIDATE LATER | MEDIA | Nash vs Sales Conversion vs Mick/Productivity/Manager |
| nash-team-intelligence-master-test.js | CONSOLIDATE LATER | 08 MANAGER & TEAM INTELLIGENCE | Migration Candidate | CONSOLIDATE LATER | MEDIA | Nash vs Sales Conversion vs Mick/Productivity/Manager |
| referral-opportunity-master-test.js | CONSOLIDATE LATER | 08 MANAGER & TEAM INTELLIGENCE | Migration Candidate | CONSOLIDATE LATER | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| relationship-opportunity-master-test.js | CONSOLIDATE LATER | 08 MANAGER & TEAM INTELLIGENCE | Migration Candidate | CONSOLIDATE LATER | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| smnyl-ai-presence-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 08 MANAGER & TEAM INTELLIGENCE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| smnyl-command-center-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 08 MANAGER & TEAM INTELLIGENCE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | MEDIA | Alfred / Universal Command Bar vs Command OS boundary |
| candidate-assessment-engine.js | CONSOLIDATE LATER | 08 MANAGER & TEAM INTELLIGENCE / Recruitment or Advisor Development | Migration Candidate | CONSOLIDATE LATER | MEDIA | Recruitment vs Advisor Development ownership; Potential duplicate/overlap candidate |
| candidate-assessment-master-test.js | CONSOLIDATE LATER | 08 MANAGER & TEAM INTELLIGENCE / Recruitment or Advisor Development | Migration Candidate | CONSOLIDATE LATER | MEDIA | Recruitment vs Advisor Development ownership; Potential duplicate/overlap candidate |
| candidate-coachability-engine.js | CONSOLIDATE LATER | 08 MANAGER & TEAM INTELLIGENCE / Recruitment or Advisor Development | Migration Candidate | CONSOLIDATE LATER | MEDIA | Recruitment vs Advisor Development ownership; Potential duplicate/overlap candidate |
| candidate-coachability-master-test.js | CONSOLIDATE LATER | 08 MANAGER & TEAM INTELLIGENCE / Recruitment or Advisor Development | Migration Candidate | CONSOLIDATE LATER | MEDIA | Recruitment vs Advisor Development ownership; Potential duplicate/overlap candidate |
| candidate-hard-factors-engine.js | CONSOLIDATE LATER | 08 MANAGER & TEAM INTELLIGENCE / Recruitment or Advisor Development | Migration Candidate | CONSOLIDATE LATER | MEDIA | Recruitment vs Advisor Development ownership; Potential duplicate/overlap candidate |
| candidate-hard-factors-master-test.js | CONSOLIDATE LATER | 08 MANAGER & TEAM INTELLIGENCE / Recruitment or Advisor Development | Migration Candidate | CONSOLIDATE LATER | MEDIA | Recruitment vs Advisor Development ownership; Potential duplicate/overlap candidate |
| candidate-market-quality-engine.js | CONSOLIDATE LATER | 08 MANAGER & TEAM INTELLIGENCE / Recruitment or Advisor Development | Migration Candidate | CONSOLIDATE LATER | MEDIA | Recruitment vs Advisor Development ownership; Potential duplicate/overlap candidate |
| candidate-market-quality-master-test.js | CONSOLIDATE LATER | 08 MANAGER & TEAM INTELLIGENCE / Recruitment or Advisor Development | Migration Candidate | CONSOLIDATE LATER | MEDIA | Recruitment vs Advisor Development ownership; Potential duplicate/overlap candidate |
| candidate-vital-factors-engine.js | CONSOLIDATE LATER | 08 MANAGER & TEAM INTELLIGENCE / Recruitment or Advisor Development | Migration Candidate | CONSOLIDATE LATER | MEDIA | Recruitment vs Advisor Development ownership; Potential duplicate/overlap candidate |
| candidate-vital-factors-master-test.js | CONSOLIDATE LATER | 08 MANAGER & TEAM INTELLIGENCE / Recruitment or Advisor Development | Migration Candidate | CONSOLIDATE LATER | MEDIA | Recruitment vs Advisor Development ownership; Potential duplicate/overlap candidate |
| clipboard-action-engine.js | REVIEW REQUIRED | 09 UNIVERSAL COMMAND OS / action infrastructure or Sales Conversion channel support; review required | Needs Further Human Validation | REVIEW REQUIRED | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| phone-call-engine.js | REVIEW REQUIRED | 09 UNIVERSAL COMMAND OS / action infrastructure or Sales Conversion channel support; review required | Needs Further Human Validation | REVIEW REQUIRED | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| whatsapp-action-engine.js | REVIEW REQUIRED | 09 UNIVERSAL COMMAND OS / action infrastructure or Sales Conversion channel support; review required | Needs Further Human Validation | REVIEW REQUIRED | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| whatsapp-link-engine.js | REVIEW REQUIRED | 09 UNIVERSAL COMMAND OS / action infrastructure or Sales Conversion channel support; review required | Needs Further Human Validation | REVIEW REQUIRED | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| core-app-engine.js | CONSOLIDATE LATER | 10 PLATFORM SERVICES | Migration Candidate | CONSOLIDATE LATER | MEDIA | Potential duplicate/overlap candidate |
| domain-events.js | CONSOLIDATE LATER | 10 PLATFORM SERVICES | Migration Candidate | CONSOLIDATE LATER | MEDIA | Potential duplicate/overlap candidate |
| performance-runtime.js | CONSOLIDATE LATER | 10 PLATFORM SERVICES | Migration Candidate | CONSOLIDATE LATER | MEDIA | Nash vs Sales Conversion vs Mick/Productivity/Manager |
| relationship-health-master-test.js | CONSOLIDATE LATER | 10 PLATFORM SERVICES | Migration Candidate | CONSOLIDATE LATER | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| smnyl-ai-coach-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 10 PLATFORM SERVICES | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| storage-engine.js | CONSOLIDATE LATER | 10 PLATFORM SERVICES | Migration Candidate | CONSOLIDATE LATER | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| adaptive-message-builder.js | DELETE LATER ONLY IF PROVEN UNUSED | 12 ADVISOR EXPERIENCE INTELLIGENCE / UI consumer only | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | MEDIA | UI / Advisor Experience vs business truth |
| adaptive-outreach-prompt-builder.js | DELETE LATER ONLY IF PROVEN UNUSED | 12 ADVISOR EXPERIENCE INTELLIGENCE / UI consumer only | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | MEDIA | UI / Advisor Experience vs business truth |
| close-prompt-builder.js | DELETE LATER ONLY IF PROVEN UNUSED | 12 ADVISOR EXPERIENCE INTELLIGENCE / UI consumer only | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | MEDIA | UI / Advisor Experience vs business truth |
| ghosting-prompt-builder.js | DELETE LATER ONLY IF PROVEN UNUSED | 12 ADVISOR EXPERIENCE INTELLIGENCE / UI consumer only | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | MEDIA | UI / Advisor Experience vs business truth |
| objection-prompt-builder.js | DELETE LATER ONLY IF PROVEN UNUSED | 12 ADVISOR EXPERIENCE INTELLIGENCE / UI consumer only | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | MEDIA | UI / Advisor Experience vs business truth; Nash vs Sales Conversion vs Mick/Productivity/Manager |
| outreach-prompt-builder.js | DELETE LATER ONLY IF PROVEN UNUSED | 12 ADVISOR EXPERIENCE INTELLIGENCE / UI consumer only | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | MEDIA | UI / Advisor Experience vs business truth |
| referral-prompt-builder.js | DELETE LATER ONLY IF PROVEN UNUSED | 12 ADVISOR EXPERIENCE INTELLIGENCE / UI consumer only | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | MEDIA | UI / Advisor Experience vs business truth |
| ui-render-engine.js | CONSOLIDATE LATER | 12 ADVISOR EXPERIENCE INTELLIGENCE / UI consumer only | Migration Candidate | CONSOLIDATE LATER | MEDIA | UI / Advisor Experience vs business truth |
| smnyl-alerts-engine.js | DOCUMENT | COMPENSATION INTELLIGENCE | Core / Domain Module | DOCUMENT | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| smnyl-cancelaciones-engine.js | DOCUMENT | COMPENSATION INTELLIGENCE | Core / Domain Module | DOCUMENT | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| smnyl-command-palette-engine.js | CONSOLIDATE LATER | COMPENSATION INTELLIGENCE | Migration Candidate | CONSOLIDATE LATER | MEDIA | Alfred / Universal Command Bar vs Command OS boundary; Potential duplicate/overlap candidate |
| smnyl-opportunity-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | COMPENSATION INTELLIGENCE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| smnyl-anomaly-engine.js | DOCUMENT | CONSERVATION INTELLIGENCE | Core / Domain Module | DOCUMENT | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| smnyl-insights-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | CONSERVATION INTELLIGENCE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| smnyl-kpi-engine.js | DOCUMENT | CONSERVATION INTELLIGENCE | Core / Domain Module | DOCUMENT | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| smnyl-persistencia-engine.js | DOCUMENT | CONSERVATION INTELLIGENCE | Core / Domain Module | DOCUMENT | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| smnyl-renovaciones-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | CONSERVATION INTELLIGENCE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| smnyl-retencion-engine.js | DOCUMENT | CONSERVATION INTELLIGENCE | Core / Domain Module | DOCUMENT | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| smnyl-risk-engine.js | CONSOLIDATE LATER | CONSERVATION INTELLIGENCE | Migration Candidate | CONSOLIDATE LATER | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| smnyl-time-block-engine.js | DOCUMENT | CONSERVATION INTELLIGENCE | Core / Domain Module | DOCUMENT | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| concursos.js | CONSOLIDATE LATER | Compensation Intelligence + RuleSnapshot / Rule Pack boundary | Migration Candidate | CONSOLIDATE LATER | MEDIA | Compensation Intelligence vs RuleSnapshot / Rule Pack; Potential duplicate/overlap candidate |
| smnyl-conteo-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | Compensation Intelligence + RuleSnapshot / Rule Pack boundary | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| smnyl-produccion-engine.js | DOCUMENT | Compensation Intelligence + RuleSnapshot / Rule Pack boundary | Core / Domain Module | DOCUMENT | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| nash-intent-master-test.js | CONSOLIDATE LATER | EVIDENCE & PROVENANCE | Migration Candidate | CONSOLIDATE LATER | MEDIA | Nash vs Sales Conversion vs Mick/Productivity/Manager |
| vida-mujer-client-presentation-engine.js | CONSOLIDATE LATER | EVIDENCE & PROVENANCE | Migration Candidate | CONSOLIDATE LATER | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| close-readiness-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | Nash Conversation Intelligence or Sales Conversion depending on workflow vs language role | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| close-strategy-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | Nash Conversation Intelligence or Sales Conversion depending on workflow vs language role | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| first-contact-ai-suggestion-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | Nash Conversation Intelligence or Sales Conversion depending on workflow vs language role | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| first-contact-script-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | Nash Conversation Intelligence or Sales Conversion depending on workflow vs language role | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| followup-engine.js | CONSOLIDATE LATER | Nash Conversation Intelligence or Sales Conversion depending on workflow vs language role | Migration Candidate | CONSOLIDATE LATER | MEDIA | Nash vs Sales Conversion vs Mick/Productivity/Manager; Potential duplicate/overlap candidate |
| nash-advisor-performance-engine.js | CONSOLIDATE LATER | Nash Conversation Intelligence or Sales Conversion depending on workflow vs language role | Migration Candidate | CONSOLIDATE LATER | MEDIA | Nash vs Sales Conversion vs Mick/Productivity/Manager; Potential duplicate/overlap candidate |
| nash-followup-engine.js | CONSOLIDATE LATER | Nash Conversation Intelligence or Sales Conversion depending on workflow vs language role | Migration Candidate | CONSOLIDATE LATER | MEDIA | Nash vs Sales Conversion vs Mick/Productivity/Manager; Potential duplicate/overlap candidate |
| objection-battle-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | Nash Conversation Intelligence or Sales Conversion depending on workflow vs language role | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | MEDIA | Nash vs Sales Conversion vs Mick/Productivity/Manager |
| objection-classifier-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | Nash Conversation Intelligence or Sales Conversion depending on workflow vs language role | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | MEDIA | Nash vs Sales Conversion vs Mick/Productivity/Manager |
| objection-intent-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | Nash Conversation Intelligence or Sales Conversion depending on workflow vs language role | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | MEDIA | Nash vs Sales Conversion vs Mick/Productivity/Manager |
| objection-memory-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | Nash Conversation Intelligence or Sales Conversion depending on workflow vs language role | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | MEDIA | Nash vs Sales Conversion vs Mick/Productivity/Manager |
| sales-dna-insight-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | Nash Conversation Intelligence or Sales Conversion depending on workflow vs language role | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| sales-dna-match-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | Nash Conversation Intelligence or Sales Conversion depending on workflow vs language role | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| sales-dna-recommendation-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | Nash Conversation Intelligence or Sales Conversion depending on workflow vs language role | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| smnyl-followup-engine.js | CONSOLIDATE LATER | Nash Conversation Intelligence or Sales Conversion depending on workflow vs language role | Migration Candidate | CONSOLIDATE LATER | MEDIA | Nash vs Sales Conversion vs Mick/Productivity/Manager; Potential duplicate/overlap candidate |
| actividad.js | DOCUMENT | PERIODSNAPSHOT / OPERATIONAL CLOCKS | Core / Domain Module | DOCUMENT | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| buying-signals-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | PERIODSNAPSHOT / OPERATIONAL CLOCKS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| client-engagement-engine.js | CONSOLIDATE LATER | PERIODSNAPSHOT / OPERATIONAL CLOCKS | Migration Candidate | CONSOLIDATE LATER | MEDIA | Potential duplicate/overlap candidate |
| forge-ai-connector.js | CONSOLIDATE LATER | PERIODSNAPSHOT / OPERATIONAL CLOCKS | Migration Candidate | CONSOLIDATE LATER | MEDIA | Potential duplicate/overlap candidate |
| life-event-engine.js | CONSOLIDATE LATER | PERIODSNAPSHOT / OPERATIONAL CLOCKS | Migration Candidate | CONSOLIDATE LATER | MEDIA | Potential duplicate/overlap candidate |
| nash-memory-engine.js | CONSOLIDATE LATER | PERIODSNAPSHOT / OPERATIONAL CLOCKS | Migration Candidate | CONSOLIDATE LATER | MEDIA | Nash vs Sales Conversion vs Mick/Productivity/Manager |
| relationship-next-action-engine.js | CONSOLIDATE LATER | PERIODSNAPSHOT / OPERATIONAL CLOCKS | Migration Candidate | CONSOLIDATE LATER | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| relationship-timeline-engine.js | CONSOLIDATE LATER | PERIODSNAPSHOT / OPERATIONAL CLOCKS | Migration Candidate | CONSOLIDATE LATER | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| shared-banxico-rate-engine.js | CONSOLIDATE LATER | PERIODSNAPSHOT / OPERATIONAL CLOCKS | Migration Candidate | CONSOLIDATE LATER | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| shared-banxico-rate-report.js | CONSOLIDATE LATER | PERIODSNAPSHOT / OPERATIONAL CLOCKS | Migration Candidate | CONSOLIDATE LATER | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| shared-decision-appendix-engine.js | CONSOLIDATE LATER | PERIODSNAPSHOT / OPERATIONAL CLOCKS | Migration Candidate | CONSOLIDATE LATER | MEDIA | Potential duplicate/overlap candidate |
| smoke-test.js | DOCUMENT | PERIODSNAPSHOT / OPERATIONAL CLOCKS | Core / Domain Module | DOCUMENT | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| virtual-list-engine.js | CONSOLIDATE LATER | PERIODSNAPSHOT / OPERATIONAL CLOCKS | Migration Candidate | CONSOLIDATE LATER | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| visibility-runtime.js | DELETE LATER ONLY IF PROVEN UNUSED | PERIODSNAPSHOT / OPERATIONAL CLOCKS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| activity-feed-engine.js | CONSOLIDATE LATER | PRODUCTIVITY INTELLIGENCE | Migration Candidate | CONSOLIDATE LATER | MEDIA | Potential duplicate/overlap candidate |
| activity-feed.js | CONSOLIDATE LATER | PRODUCTIVITY INTELLIGENCE | Migration Candidate | CONSOLIDATE LATER | MEDIA | Potential duplicate/overlap candidate |
| nash-manager-alert-engine.js | CONSOLIDATE LATER | PRODUCTIVITY INTELLIGENCE | Migration Candidate | CONSOLIDATE LATER | MEDIA | Nash vs Sales Conversion vs Mick/Productivity/Manager; Potential duplicate/overlap candidate |
| smnyl-goals-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | PRODUCTIVITY INTELLIGENCE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| smnyl-productividad-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | PRODUCTIVITY INTELLIGENCE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| smnyl-streak-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | PRODUCTIVITY INTELLIGENCE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| nash-intent-engine.js | CONSOLIDATE LATER | SHARED COMMERCIAL MODEL | Migration Candidate | CONSOLIDATE LATER | MEDIA | Nash vs Sales Conversion vs Mick/Productivity/Manager |
| shared-clp-master-test.js | CONSOLIDATE LATER | SHARED COMMERCIAL MODEL | Migration Candidate | CONSOLIDATE LATER | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| advisor-performance-engine.js | CONSOLIDATE LATER | SHARED CORE | Migration Candidate | CONSOLIDATE LATER | MEDIA | Nash vs Sales Conversion vs Mick/Productivity/Manager; Potential duplicate/overlap candidate |
| core_domain-events.js | CONSOLIDATE LATER | SHARED CORE | Migration Candidate | CONSOLIDATE LATER | MEDIA | Potential duplicate/overlap candidate |
| lead-temperature-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | SHARED CORE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| life-event-master-test.js | CONSOLIDATE LATER | SHARED CORE | Migration Candidate | CONSOLIDATE LATER | MEDIA | Potential duplicate/overlap candidate |
| momentum-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | SHARED CORE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| nash-personality-engine.js | CONSOLIDATE LATER | SHARED CORE | Migration Candidate | CONSOLIDATE LATER | MEDIA | Nash vs Sales Conversion vs Mick/Productivity/Manager |
| policy-relationship-score-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | SHARED CORE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | MEDIA | Policy & Sales Operations lifecycle / Evidence provenance |
| prospect-score-engine.js | DOCUMENT | SHARED CORE | Core / Domain Module | DOCUMENT | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| referidos.js | DOCUMENT | SHARED CORE | Core / Domain Module | DOCUMENT | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| referral-opportunity-engine.js | CONSOLIDATE LATER | SHARED CORE | Migration Candidate | CONSOLIDATE LATER | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| shared-decision-score-engine.js | DOCUMENT | SHARED CORE | Core / Domain Module | DOCUMENT | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| smnyl-decision-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | SHARED CORE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| smnyl-health-score-engine.js | DOCUMENT | SHARED CORE | Core / Domain Module | DOCUMENT | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| smnyl-leaderboard-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | SHARED CORE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| smnyl-neural-glow-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | SHARED CORE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| smnyl-performance-engine.js | CONSOLIDATE LATER | SHARED CORE | Migration Candidate | CONSOLIDATE LATER | MEDIA | Nash vs Sales Conversion vs Mick/Productivity/Manager |
| forge-rate-cache.json | REVIEW REQUIRED | UNKNOWN / NEEDS REVIEW | Needs Further Human Validation | REVIEW REQUIRED | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| manifest.json | REVIEW REQUIRED | UNKNOWN / NEEDS REVIEW | Needs Further Human Validation | REVIEW REQUIRED | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| maria_acceptance_001.json | REVIEW REQUIRED | UNKNOWN / NEEDS REVIEW | Needs Further Human Validation | REVIEW REQUIRED | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| maria_test_001.json | REVIEW REQUIRED | UNKNOWN / NEEDS REVIEW | Needs Further Human Validation | REVIEW REQUIRED | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| question-style-match-engine.js | REVIEW REQUIRED | UNKNOWN / NEEDS REVIEW | Needs Further Human Validation | REVIEW REQUIRED | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| seen-but-no-reply-engine.js | REVIEW REQUIRED | UNKNOWN / NEEDS REVIEW | Needs Further Human Validation | REVIEW REQUIRED | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| shared-client-language-engine.js | REVIEW REQUIRED | UNKNOWN / NEEDS REVIEW | Needs Further Human Validation | REVIEW REQUIRED | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| shared-financial-return-engine.js | REVIEW REQUIRED | UNKNOWN / NEEDS REVIEW | Needs Further Human Validation | REVIEW REQUIRED | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| shared-protection-efficiency-engine.js | REVIEW REQUIRED | UNKNOWN / NEEDS REVIEW | Needs Further Human Validation | REVIEW REQUIRED | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| shared-recovery-analysis-engine.js | REVIEW REQUIRED | UNKNOWN / NEEDS REVIEW | Needs Further Human Validation | REVIEW REQUIRED | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| universal-filters-engine.js | REVIEW REQUIRED | UNKNOWN / NEEDS REVIEW | Needs Further Human Validation | REVIEW REQUIRED | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| virtual-list.js | REVIEW REQUIRED | UNKNOWN / NEEDS REVIEW | Needs Further Human Validation | REVIEW REQUIRED | MEDIA | No critical dependency flagged by Phase 2.X heuristics |
| opportunity-detector-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 01 REVENUE GENERATION ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| pipeline-stage-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 01 REVENUE GENERATION ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| adaptive-script-builder.js | DELETE LATER ONLY IF PROVEN UNUSED | 02 SALES CONVERSION ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | UI / Advisor Experience vs business truth |
| advisor-style-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 02 SALES CONVERSION ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| appointment-followup-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 02 SALES CONVERSION ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Nash vs Sales Conversion vs Mick/Productivity/Manager |
| communication-mismatch-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 02 SALES CONVERSION ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| conversion-metrics-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 02 SALES CONVERSION ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| discovery-summary-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 02 SALES CONVERSION ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| discovery-to-presentation-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 02 SALES CONVERSION ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| dna-script-strategy-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 02 SALES CONVERSION ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| first-contact-delivery-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 02 SALES CONVERSION ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| first-contact-options-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 02 SALES CONVERSION ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| first-contact-tone-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 02 SALES CONVERSION ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| first-contact.entity.js | DELETE LATER ONLY IF PROVEN UNUSED | 02 SALES CONVERSION ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| presentation-input-context-builder.js | DELETE LATER ONLY IF PROVEN UNUSED | 02 SALES CONVERSION ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | UI / Advisor Experience vs business truth |
| quotation-extraction-result.entity.js | DELETE LATER ONLY IF PROVEN UNUSED | 02 SALES CONVERSION ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| reactivation-strategy-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 02 SALES CONVERSION ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| sales-context-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 02 SALES CONVERSION ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| sales-dna-learning-event.js | DELETE LATER ONLY IF PROVEN UNUSED | 02 SALES CONVERSION ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| sales-dna-profile-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 02 SALES CONVERSION ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| sales-dna-stage-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 02 SALES CONVERSION ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| sales-learning-event.entity.js | DELETE LATER ONLY IF PROVEN UNUSED | 02 SALES CONVERSION ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| smart-outreach-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 02 SALES CONVERSION ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| tone-performance-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 02 SALES CONVERSION ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Nash vs Sales Conversion vs Mick/Productivity/Manager |
| objection-resolution-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 03 NASH CONVERSATION INTELLIGENCE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Nash vs Sales Conversion vs Mick/Productivity/Manager |
| objection-response-strategy-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 03 NASH CONVERSATION INTELLIGENCE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Nash vs Sales Conversion vs Mick/Productivity/Manager |
| discovery-product-alignment-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 04 PRODUCT INTELLIGENCE ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| financial-pyramid-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 04 PRODUCT INTELLIGENCE ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| financial-pyramid-priority-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 04 PRODUCT INTELLIGENCE ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| financial-pyramid-story-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 04 PRODUCT INTELLIGENCE ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| imagina-ser-contribution-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 04 PRODUCT INTELLIGENCE ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| needs-discovery-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 04 PRODUCT INTELLIGENCE ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| policy-filter-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 04 PRODUCT INTELLIGENCE ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Policy & Sales Operations lifecycle / Evidence provenance |
| search-index-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 04 PRODUCT INTELLIGENCE ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Alfred / Universal Command Bar vs Command OS boundary |
| segu-beca-mxn-timeline-clean-report.js | DELETE LATER ONLY IF PROVEN UNUSED | 04 PRODUCT INTELLIGENCE ENGINE + Rule Pack/source documentation boundary | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| ai-first-contact-message-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 05 RELATIONSHIP INTELLIGENCE ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| contact-attempt-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 05 RELATIONSHIP INTELLIGENCE ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| contact-response-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 05 RELATIONSHIP INTELLIGENCE ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| followup-message-context-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 05 RELATIONSHIP INTELLIGENCE ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Nash vs Sales Conversion vs Mick/Productivity/Manager |
| followup-overdue-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 05 RELATIONSHIP INTELLIGENCE ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Nash vs Sales Conversion vs Mick/Productivity/Manager |
| followup-priority-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 05 RELATIONSHIP INTELLIGENCE ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Nash vs Sales Conversion vs Mick/Productivity/Manager |
| followup-recommendation-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 05 RELATIONSHIP INTELLIGENCE ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Nash vs Sales Conversion vs Mick/Productivity/Manager |
| followup-reminder-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 05 RELATIONSHIP INTELLIGENCE ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Nash vs Sales Conversion vs Mick/Productivity/Manager |
| ghosting-status-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 05 RELATIONSHIP INTELLIGENCE ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| hot-market-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 05 RELATIONSHIP INTELLIGENCE ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| policy-last-contact-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 05 RELATIONSHIP INTELLIGENCE ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Policy & Sales Operations lifecycle / Evidence provenance |
| referral-ai-followup.js | DELETE LATER ONLY IF PROVEN UNUSED | 05 RELATIONSHIP INTELLIGENCE ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Nash vs Sales Conversion vs Mick/Productivity/Manager |
| referral-card-ui.js | DELETE LATER ONLY IF PROVEN UNUSED | 05 RELATIONSHIP INTELLIGENCE ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | UI / Advisor Experience vs business truth |
| referral-followup-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 05 RELATIONSHIP INTELLIGENCE ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Nash vs Sales Conversion vs Mick/Productivity/Manager |
| relationship-memory-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 05 RELATIONSHIP INTELLIGENCE ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| smart-followup-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 05 RELATIONSHIP INTELLIGENCE ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Nash vs Sales Conversion vs Mick/Productivity/Manager |
| smart-followup-message-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 05 RELATIONSHIP INTELLIGENCE ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Nash vs Sales Conversion vs Mick/Productivity/Manager |
| warm-market-segmentation-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 05 RELATIONSHIP INTELLIGENCE ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| ai-sales-coach-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 06 LEARNING INTELLIGENCE ENGINE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| action-resolver-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| advisor-alert-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| advisor-monitor-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| advisor-score-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| ai-context-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| auto-task-generator-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| drag-drop-policy-zone.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Policy & Sales Operations lifecycle / Evidence provenance |
| financial-story-task-builder.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | UI / Advisor Experience vs business truth |
| import-progress-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Policy & Sales Operations lifecycle / Evidence provenance |
| live-operational-state-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| nano-banana-icon-system-prompt.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| ocr-result-cache.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| operational-card.tsx | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | UI / Advisor Experience vs business truth |
| operational-colors.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| operational-feed-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| overdue-task-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| payment-frequency-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| policy-activity-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Policy & Sales Operations lifecycle / Evidence provenance |
| policy-ai-insights-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Policy & Sales Operations lifecycle / Evidence provenance |
| policy-auto-approval-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Policy & Sales Operations lifecycle / Evidence provenance |
| policy-auto-save-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Policy & Sales Operations lifecycle / Evidence provenance |
| policy-client-summary-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Policy & Sales Operations lifecycle / Evidence provenance |
| policy-context-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Policy & Sales Operations lifecycle / Evidence provenance |
| policy-detail-alert-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Policy & Sales Operations lifecycle / Evidence provenance |
| policy-document-classifier.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Policy & Sales Operations lifecycle / Evidence provenance |
| policy-document-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Policy & Sales Operations lifecycle / Evidence provenance |
| policy-duplicate-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Policy & Sales Operations lifecycle / Evidence provenance |
| policy-import-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Policy & Sales Operations lifecycle / Evidence provenance |
| policy-import-errors-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Policy & Sales Operations lifecycle / Evidence provenance |
| policy-import-metrics-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Policy & Sales Operations lifecycle / Evidence provenance |
| policy-import-summary.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Policy & Sales Operations lifecycle / Evidence provenance |
| policy-indexing-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Policy & Sales Operations lifecycle / Evidence provenance |
| policy-ingestion-orchestrator.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Policy & Sales Operations lifecycle / Evidence provenance |
| policy-live-state-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Policy & Sales Operations lifecycle / Evidence provenance |
| policy-metadata-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Policy & Sales Operations lifecycle / Evidence provenance |
| policy-operational-center-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Policy & Sales Operations lifecycle / Evidence provenance |
| policy-renewal-status-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Policy & Sales Operations lifecycle / Evidence provenance |
| policy-review-priority-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | UI / Advisor Experience vs business truth; Policy & Sales Operations lifecycle / Evidence provenance |
| policy-search-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Alfred / Universal Command Bar vs Command OS boundary; Policy & Sales Operations lifecycle / Evidence provenance |
| policy-side-by-side-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Policy & Sales Operations lifecycle / Evidence provenance |
| policy-staging-cache.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Policy & Sales Operations lifecycle / Evidence provenance |
| policy-staging-status-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Policy & Sales Operations lifecycle / Evidence provenance |
| policy-status-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Policy & Sales Operations lifecycle / Evidence provenance |
| policy-summary-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Policy & Sales Operations lifecycle / Evidence provenance |
| policy-timeline-event.factory.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Policy & Sales Operations lifecycle / Evidence provenance |
| policy-timeline-group-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Policy & Sales Operations lifecycle / Evidence provenance |
| policy-timeline.repository.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Policy & Sales Operations lifecycle / Evidence provenance |
| policy-timeline.types.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Policy & Sales Operations lifecycle / Evidence provenance |
| policy-workspace-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Policy & Sales Operations lifecycle / Evidence provenance |
| quick-action-executor-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | UI / Advisor Experience vs business truth |
| renewal-intelligence-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| staging-cleanup-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Policy & Sales Operations lifecycle / Evidence provenance |
| task-feed-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| task-quick-action-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | UI / Advisor Experience vs business truth |
| mass-import-mapping-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS, with Shared Core/Evidence consumers when generic | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Policy & Sales Operations lifecycle / Evidence provenance |
| mass-import-validation-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS, with Shared Core/Evidence consumers when generic | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Policy & Sales Operations lifecycle / Evidence provenance |
| policy-review-ui-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 07 POLICY & SALES OPERATIONS, with Shared Core/Evidence consumers when generic | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | UI / Advisor Experience vs business truth; Policy & Sales Operations lifecycle / Evidence provenance |
| appointment-opportunity-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 08 MANAGER & TEAM INTELLIGENCE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| dna-coaching-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 08 MANAGER & TEAM INTELLIGENCE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Nash vs Sales Conversion vs Mick/Productivity/Manager |
| manager-broadcast-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 08 MANAGER & TEAM INTELLIGENCE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| manager-coaching-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 08 MANAGER & TEAM INTELLIGENCE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Nash vs Sales Conversion vs Mick/Productivity/Manager |
| manager-feed-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 08 MANAGER & TEAM INTELLIGENCE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| manager-notification-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 08 MANAGER & TEAM INTELLIGENCE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| manager-role-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 08 MANAGER & TEAM INTELLIGENCE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| ovelay-manager.js | DELETE LATER ONLY IF PROVEN UNUSED | 08 MANAGER & TEAM INTELLIGENCE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| payment-mode-coaching-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 08 MANAGER & TEAM INTELLIGENCE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Nash vs Sales Conversion vs Mick/Productivity/Manager |
| ranking-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 08 MANAGER & TEAM INTELLIGENCE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| route-transition-manager.js | DELETE LATER ONLY IF PROVEN UNUSED | 08 MANAGER & TEAM INTELLIGENCE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| search-ranking-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 08 MANAGER & TEAM INTELLIGENCE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Alfred / Universal Command Bar vs Command OS boundary |
| team-momentum-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 08 MANAGER & TEAM INTELLIGENCE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| team-structure-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 08 MANAGER & TEAM INTELLIGENCE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| command-execution-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 09 UNIVERSAL COMMAND OS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Alfred / Universal Command Bar vs Command OS boundary |
| command-parser-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 09 UNIVERSAL COMMAND OS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Alfred / Universal Command Bar vs Command OS boundary |
| command-shortcuts-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 09 UNIVERSAL COMMAND OS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Alfred / Universal Command Bar vs Command OS boundary |
| command-suggestion-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 09 UNIVERSAL COMMAND OS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Alfred / Universal Command Bar vs Command OS boundary |
| assistant-memory-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 10 PLATFORM SERVICES | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| communication-channel-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 10 PLATFORM SERVICES | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| copilot-suggestion-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 10 PLATFORM SERVICES | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| crash-runtime.js | DELETE LATER ONLY IF PROVEN UNUSED | 10 PLATFORM SERVICES | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| csv-parser-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 10 PLATFORM SERVICES | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| health-runtime.js | DELETE LATER ONLY IF PROVEN UNUSED | 10 PLATFORM SERVICES | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| in-app-notification-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 10 PLATFORM SERVICES | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| live-communication-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 10 PLATFORM SERVICES | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| live-notification-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 10 PLATFORM SERVICES | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| mutation-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 10 PLATFORM SERVICES | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| notification-orchestrator.js | DELETE LATER ONLY IF PROVEN UNUSED | 10 PLATFORM SERVICES | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| notification-priority-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 10 PLATFORM SERVICES | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| notification-queue-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 10 PLATFORM SERVICES | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| policy-batch-processing-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 10 PLATFORM SERVICES | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Policy & Sales Operations lifecycle / Evidence provenance |
| policy-import-queue.js | DELETE LATER ONLY IF PROVEN UNUSED | 10 PLATFORM SERVICES | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Policy & Sales Operations lifecycle / Evidence provenance |
| push-notification-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 10 PLATFORM SERVICES | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| query-cache.js | DELETE LATER ONLY IF PROVEN UNUSED | 10 PLATFORM SERVICES | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| query-runtime.js | DELETE LATER ONLY IF PROVEN UNUSED | 10 PLATFORM SERVICES | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| referral-smart-actions.js | DELETE LATER ONLY IF PROVEN UNUSED | 10 PLATFORM SERVICES | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| referrals-board-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 10 PLATFORM SERVICES | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| sales-coach-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 10 PLATFORM SERVICES | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| secure-storage.js | DELETE LATER ONLY IF PROVEN UNUSED | 10 PLATFORM SERVICES | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| smart-notification-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 10 PLATFORM SERVICES | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| smart-priority-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 10 PLATFORM SERVICES | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| supabase-runtime.js | DELETE LATER ONLY IF PROVEN UNUSED | 10 PLATFORM SERVICES | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| sw-cache-config.js | DELETE LATER ONLY IF PROVEN UNUSED | 10 PLATFORM SERVICES | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| sync-queue-runtime.js | DELETE LATER ONLY IF PROVEN UNUSED | 10 PLATFORM SERVICES | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| ai-orb-widget.js | DELETE LATER ONLY IF PROVEN UNUSED | 12 ADVISOR EXPERIENCE INTELLIGENCE / UI consumer only | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | UI / Advisor Experience vs business truth |
| operational-button.tsx | DELETE LATER ONLY IF PROVEN UNUSED | 12 ADVISOR EXPERIENCE INTELLIGENCE / UI consumer only | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | UI / Advisor Experience vs business truth |
| search-quick-actions-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | 12 ADVISOR EXPERIENCE INTELLIGENCE / UI consumer only | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Alfred / Universal Command Bar vs Command OS boundary; UI / Advisor Experience vs business truth |
| smart-header.tsx | DELETE LATER ONLY IF PROVEN UNUSED | 12 ADVISOR EXPERIENCE INTELLIGENCE / UI consumer only | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | UI / Advisor Experience vs business truth |
| universal-search-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | Alfred / Universal Command Bar | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Alfred / Universal Command Bar vs Command OS boundary |
| discovery-insights-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | COMPENSATION INTELLIGENCE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| policy-field-confidence-map.js | DELETE LATER ONLY IF PROVEN UNUSED | COMPENSATION INTELLIGENCE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Policy & Sales Operations lifecycle / Evidence provenance |
| policy-financial-summary-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | COMPENSATION INTELLIGENCE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Policy & Sales Operations lifecycle / Evidence provenance |
| policy-normalization-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | COMPENSATION INTELLIGENCE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Policy & Sales Operations lifecycle / Evidence provenance |
| policy-smart-sort-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | COMPENSATION INTELLIGENCE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Policy & Sales Operations lifecycle / Evidence provenance |
| policy-validation-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | COMPENSATION INTELLIGENCE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Policy & Sales Operations lifecycle / Evidence provenance |
| risk-story-context-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | COMPENSATION INTELLIGENCE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| contextual-suggestion-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | CONSERVATION INTELLIGENCE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| semantic-navigation-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | CONSERVATION INTELLIGENCE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| commissionable-amount-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | Compensation Intelligence + RuleSnapshot / Rule Pack boundary | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Compensation Intelligence vs RuleSnapshot / Rule Pack |
| advisor-activity-timeline.js | DELETE LATER ONLY IF PROVEN UNUSED | PERIODSNAPSHOT / OPERATIONAL CLOCKS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| advisor-sales-dna.entity.js | DELETE LATER ONLY IF PROVEN UNUSED | PERIODSNAPSHOT / OPERATIONAL CLOCKS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| appointment-calendar-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | PERIODSNAPSHOT / OPERATIONAL CLOCKS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| event-log-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | PERIODSNAPSHOT / OPERATIONAL CLOCKS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| followup-next-date-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | PERIODSNAPSHOT / OPERATIONAL CLOCKS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Nash vs Sales Conversion vs Mick/Productivity/Manager |
| followup.entity.js | DELETE LATER ONLY IF PROVEN UNUSED | PERIODSNAPSHOT / OPERATIONAL CLOCKS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Nash vs Sales Conversion vs Mick/Productivity/Manager |
| google-calendar-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | PERIODSNAPSHOT / OPERATIONAL CLOCKS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| idle-runtime.js | DELETE LATER ONLY IF PROVEN UNUSED | PERIODSNAPSHOT / OPERATIONAL CLOCKS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| monthly-revenue-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | PERIODSNAPSHOT / OPERATIONAL CLOCKS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| optimistic-mutation-runtime.js | DELETE LATER ONLY IF PROVEN UNUSED | PERIODSNAPSHOT / OPERATIONAL CLOCKS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| policy-core-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | PERIODSNAPSHOT / OPERATIONAL CLOCKS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Policy & Sales Operations lifecycle / Evidence provenance |
| question-answer-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | PERIODSNAPSHOT / OPERATIONAL CLOCKS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| question-session-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | PERIODSNAPSHOT / OPERATIONAL CLOCKS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| quick-actions-bar.tsx | DELETE LATER ONLY IF PROVEN UNUSED | PERIODSNAPSHOT / OPERATIONAL CLOCKS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | UI / Advisor Experience vs business truth |
| realtime-task-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | PERIODSNAPSHOT / OPERATIONAL CLOCKS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| referral-timeline-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | PERIODSNAPSHOT / OPERATIONAL CLOCKS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| referrals-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | PERIODSNAPSHOT / OPERATIONAL CLOCKS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| retry-runtime.js | DELETE LATER ONLY IF PROVEN UNUSED | PERIODSNAPSHOT / OPERATIONAL CLOCKS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| revenue-optimization-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | PERIODSNAPSHOT / OPERATIONAL CLOCKS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| smart-agenda-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | PERIODSNAPSHOT / OPERATIONAL CLOCKS | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| activity-stream-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | PRODUCTIVITY INTELLIGENCE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| channel-performance-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | PRODUCTIVITY INTELLIGENCE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Nash vs Sales Conversion vs Mick/Productivity/Manager |
| sales-dna-evolution-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | PRODUCTIVITY INTELLIGENCE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| team-activity-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | PRODUCTIVITY INTELLIGENCE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| daily-points-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | RULESNAPSHOT / RULE PACK | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| introduction-message-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | SHARED COMMERCIAL MODEL | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| animation-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | SHARED CORE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| discovery-priority-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | SHARED CORE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| dom-sanitizer.js | DELETE LATER ONLY IF PROVEN UNUSED | SHARED CORE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| domain-runtime.js | DELETE LATER ONLY IF PROVEN UNUSED | SHARED CORE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| entity-resolver-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | SHARED CORE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| excel-parser-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | SHARED CORE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| financial-risk-score-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | SHARED CORE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| motion-principles.js | DELETE LATER ONLY IF PROVEN UNUSED | SHARED CORE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| operational-shell.store.ts | DELETE LATER ONLY IF PROVEN UNUSED | SHARED CORE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| operational-sync-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | SHARED CORE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| quotation-input.entity.js | DELETE LATER ONLY IF PROVEN UNUSED | SHARED CORE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| referral-score-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | SHARED CORE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| smart-referrals-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | SHARED CORE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | No critical dependency flagged by Phase 2.X heuristics |
| universal-command-engine.js | DELETE LATER ONLY IF PROVEN UNUSED | SHARED CORE | Migration Candidate | DELETE LATER ONLY IF PROVEN UNUSED | BAJA | Alfred / Universal Command Bar vs Command OS boundary |

## Lists by Action

### DO NOT TOUCH
- advisor-conversion.schema.json: SHARED CORE
- advisor.schema.json: SHARED CORE
- app.js: 10 PLATFORM SERVICES / App Shell / Root Orchestration
- candidate-assessment.schema.json: SHARED CORE
- candidate.schema.json: SHARED CORE
- cartera-view.js: 07 POLICY & SALES OPERATIONS, with Shared Core/Evidence consumers when generic
- cartera.js: 07 POLICY & SALES OPERATIONS, with Shared Core/Evidence consumers when generic
- command-palette-engine.js: SHARED CORE
- command-palette-ui.js: Alfred / Universal Command Bar, with Command OS as execution dependency
- command-palette.js: Alfred / Universal Command Bar
- command-palette.store.js: Alfred / Universal Command Bar, with Command OS as execution dependency
- command-palette.tsx: Alfred / Universal Command Bar, with Command OS as execution dependency
- core-event-bus.js: SHARED CORE
- core_event-bus.js: SHARED CORE
- dashboard.js: 12 ADVISOR EXPERIENCE INTELLIGENCE / UI consumer only
- dynamic-cash-value-projection-engine.js: FORECAST INTELLIGENCE, with Economic Motivation/Product Intelligence consumers
- event-bus-engine.js: 10 PLATFORM SERVICES
- event-system.js: 10 PLATFORM SERVICES or SHARED CORE event infrastructure
- interview-evidence.schema.json: SHARED CORE
- interview.schema.json: SHARED CORE
- manager-assignment.schema.json: SHARED CORE
- manager-report.schema.json: SHARED CORE
- market-evidence.schema.json: SHARED CORE
- nash-report.schema.json: SHARED CORE
- office-assignment.schema.json: SHARED CORE
- organization-profile.schema.json: SHARED CORE
- policy.schema.json: SHARED CORE
- precontract-activity-evidence.schema.json: SHARED CORE
- precontract-cycle.schema.json: SHARED CORE
- precontract.schema.json: SHARED CORE
- project200.schema.json: SHARED CORE
- projection-engine.js: FORECAST INTELLIGENCE, with Economic Motivation/Product Intelligence consumers
- prospect.schema.json: SHARED CORE
- question-evidence.schema.json: SHARED CORE
- rda.schema.json: SHARED CORE
- recruit-identity.schema.json: SHARED CORE
- recruitment-application.schema.json: SHARED CORE
- relationship-report.schema.json: SHARED CORE
- relationship.schema.json: SHARED CORE
- shared-currency-projection-engine.js: FORECAST INTELLIGENCE, with Economic Motivation/Product Intelligence consumers
- smnyl-bonos-engine.js: Compensation Intelligence + RuleSnapshot / Rule Pack boundary
- smnyl-comisiones-engine.js: Compensation Intelligence + RuleSnapshot / Rule Pack boundary
- smnyl-concursos-engine.js: Compensation Intelligence + RuleSnapshot / Rule Pack boundary
- smnyl-prima-engine.js: Compensation Intelligence + RuleSnapshot / Rule Pack boundary
- smnyl-training-allowance-engine.js: Compensation Intelligence + RuleSnapshot / Rule Pack boundary

### REVIEW REQUIRED
- center-of-influence-engine.js: 05 RELATIONSHIP INTELLIGENCE ENGINE or 02 SALES CONVERSION ENGINE; review required
- clipboard-action-engine.js: 09 UNIVERSAL COMMAND OS / action infrastructure or Sales Conversion channel support; review required
- forge-rate-cache.json: UNKNOWN / NEEDS REVIEW
- manifest.json: UNKNOWN / NEEDS REVIEW
- maria_acceptance_001.json: UNKNOWN / NEEDS REVIEW
- maria_test_001.json: UNKNOWN / NEEDS REVIEW
- phone-call-engine.js: 09 UNIVERSAL COMMAND OS / action infrastructure or Sales Conversion channel support; review required
- question-style-match-engine.js: UNKNOWN / NEEDS REVIEW
- referral-color-engine.js: 05 RELATIONSHIP INTELLIGENCE ENGINE or 02 SALES CONVERSION ENGINE; review required
- referral-priority-engine.js: 05 RELATIONSHIP INTELLIGENCE ENGINE or 02 SALES CONVERSION ENGINE; review required
- referral-temperature-engine.js: 05 RELATIONSHIP INTELLIGENCE ENGINE or 02 SALES CONVERSION ENGINE; review required
- schema-field-engine.js: UNKNOWN / NEEDS REVIEW
- seen-but-no-reply-engine.js: UNKNOWN / NEEDS REVIEW
- shared-client-language-engine.js: UNKNOWN / NEEDS REVIEW
- shared-financial-return-engine.js: UNKNOWN / NEEDS REVIEW
- shared-protection-efficiency-engine.js: UNKNOWN / NEEDS REVIEW
- shared-recovery-analysis-engine.js: UNKNOWN / NEEDS REVIEW
- universal-filters-engine.js: UNKNOWN / NEEDS REVIEW
- virtual-list.js: UNKNOWN / NEEDS REVIEW
- whatsapp-action-engine.js: 09 UNIVERSAL COMMAND OS / action infrastructure or Sales Conversion channel support; review required
- whatsapp-link-engine.js: 09 UNIVERSAL COMMAND OS / action infrastructure or Sales Conversion channel support; review required

### MOVE LATER
- policy-human-review-engine.js: 07 POLICY & SALES OPERATIONS, with Shared Core/Evidence consumers when generic
- staging-review-engine.js: 07 POLICY & SALES OPERATIONS, with Shared Core/Evidence consumers when generic

### CONSOLIDATE LATER
- activity-feed-engine.js: PRODUCTIVITY INTELLIGENCE
- activity-feed.js: PRODUCTIVITY INTELLIGENCE
- advisor-performance-engine.js: SHARED CORE
- candidate-assessment-engine.js: 08 MANAGER & TEAM INTELLIGENCE / Recruitment or Advisor Development
- candidate-assessment-master-test.js: 08 MANAGER & TEAM INTELLIGENCE / Recruitment or Advisor Development
- candidate-coachability-engine.js: 08 MANAGER & TEAM INTELLIGENCE / Recruitment or Advisor Development
- candidate-coachability-master-test.js: 08 MANAGER & TEAM INTELLIGENCE / Recruitment or Advisor Development
- candidate-hard-factors-engine.js: 08 MANAGER & TEAM INTELLIGENCE / Recruitment or Advisor Development
- candidate-hard-factors-master-test.js: 08 MANAGER & TEAM INTELLIGENCE / Recruitment or Advisor Development
- candidate-market-quality-engine.js: 08 MANAGER & TEAM INTELLIGENCE / Recruitment or Advisor Development
- candidate-market-quality-master-test.js: 08 MANAGER & TEAM INTELLIGENCE / Recruitment or Advisor Development
- candidate-vital-factors-engine.js: 08 MANAGER & TEAM INTELLIGENCE / Recruitment or Advisor Development
- candidate-vital-factors-master-test.js: 08 MANAGER & TEAM INTELLIGENCE / Recruitment or Advisor Development
- client-engagement-engine.js: PERIODSNAPSHOT / OPERATIONAL CLOCKS
- client-engagement-master-test.js: 05 RELATIONSHIP INTELLIGENCE ENGINE
- comisiones.js: Compensation Intelligence + RuleSnapshot / Rule Pack boundary
- concursos.js: Compensation Intelligence + RuleSnapshot / Rule Pack boundary
- core-app-engine.js: 10 PLATFORM SERVICES
- core_domain-events.js: SHARED CORE
- decision-appendix-master-test.js: 04 PRODUCT INTELLIGENCE ENGINE
- domain-events.js: 10 PLATFORM SERVICES
- education-cost-master-test.js: 04 PRODUCT INTELLIGENCE ENGINE
- education-paths-master-test.js: 04 PRODUCT INTELLIGENCE ENGINE
- followup-engine.js: Nash Conversation Intelligence or Sales Conversion depending on workflow vs language role
- forge-ai-connector-master-test.js: 02 SALES CONVERSION ENGINE
- forge-ai-connector.js: PERIODSNAPSHOT / OPERATIONAL CLOCKS
- gmm-out-of-pocket-engine.js: 04 PRODUCT INTELLIGENCE ENGINE + Rule Pack/source documentation boundary
- gmm-out-of-pocket-test.js: 02 SALES CONVERSION ENGINE
- life-event-engine.js: PERIODSNAPSHOT / OPERATIONAL CLOCKS
- life-event-master-test.js: SHARED CORE
- manager-alert-engine.js: 01 REVENUE GENERATION ENGINE
- nash-advisor-performance-engine.js: Nash Conversation Intelligence or Sales Conversion depending on workflow vs language role
- nash-advisor-performance-master-test.js: 03 NASH CONVERSATION INTELLIGENCE
- nash-coaching-insight-engine.js: 05 RELATIONSHIP INTELLIGENCE ENGINE
- nash-coaching-insight-master-test.js: 03 NASH CONVERSATION INTELLIGENCE
- nash-combat-intelligence-report-engine.js: 03 NASH CONVERSATION INTELLIGENCE
- nash-combat-intelligence-report-test.js: 03 NASH CONVERSATION INTELLIGENCE
- nash-followup-engine.js: Nash Conversation Intelligence or Sales Conversion depending on workflow vs language role
- nash-intent-engine.js: SHARED COMMERCIAL MODEL
- nash-intent-master-test.js: EVIDENCE & PROVENANCE
- nash-learning-engine.js: 03 NASH CONVERSATION INTELLIGENCE
- nash-learning-master-test.js: 06 LEARNING INTELLIGENCE ENGINE
- nash-manager-alert-engine.js: PRODUCTIVITY INTELLIGENCE
- nash-manager-alert-master-test.js: 08 MANAGER & TEAM INTELLIGENCE
- nash-master-intelligence-engine.js: 03 NASH CONVERSATION INTELLIGENCE
- nash-master-intelligence-master-test.js: 03 NASH CONVERSATION INTELLIGENCE
- nash-memory-engine.js: PERIODSNAPSHOT / OPERATIONAL CLOCKS
- nash-memory-master-test.js: 03 NASH CONVERSATION INTELLIGENCE
- nash-next-best-action-engine.js: 03 NASH CONVERSATION INTELLIGENCE
- nash-next-best-action-master-test.js: 03 NASH CONVERSATION INTELLIGENCE
- nash-personality-engine.js: SHARED CORE
- nash-personality-master-test.js: 03 NASH CONVERSATION INTELLIGENCE
- nash-team-intelligence-engine.js: 08 MANAGER & TEAM INTELLIGENCE
- nash-team-intelligence-master-test.js: 08 MANAGER & TEAM INTELLIGENCE
- performance-runtime.js: 10 PLATFORM SERVICES
- policy-detail-engine.js: 07 POLICY & SALES OPERATIONS, with Shared Core/Evidence consumers when generic
- policy-detail-view-model.js: 07 POLICY & SALES OPERATIONS
- policy-followup-engine.js: 07 POLICY & SALES OPERATIONS, with Shared Core/Evidence consumers when generic
- policy-quick-actions-engine.js: 07 POLICY & SALES OPERATIONS
- policy-risk-engine.js: 07 POLICY & SALES OPERATIONS, with Shared Core/Evidence consumers when generic
- policy-storage-engine.js: 07 POLICY & SALES OPERATIONS, with Shared Core/Evidence consumers when generic
- policy-task-engine.js: 07 POLICY & SALES OPERATIONS
- policy-task-priority-engine.js: 07 POLICY & SALES OPERATIONS
- policy-timeline-engine.js: 07 POLICY & SALES OPERATIONS, with Shared Core/Evidence consumers when generic
- policy-timeline-view-model.js: 07 POLICY & SALES OPERATIONS
- quick-actions-engine.js: 05 RELATIONSHIP INTELLIGENCE ENGINE
- referral-opportunity-engine.js: SHARED CORE
- referral-opportunity-master-test.js: 08 MANAGER & TEAM INTELLIGENCE
- relationship-health-engine.js: 07 POLICY & SALES OPERATIONS
- relationship-health-master-test.js: 10 PLATFORM SERVICES
- relationship-next-action-engine.js: PERIODSNAPSHOT / OPERATIONAL CLOCKS
- relationship-next-action-master-test.js: 07 POLICY & SALES OPERATIONS
- relationship-opportunity-engine.js: 07 POLICY & SALES OPERATIONS
- relationship-opportunity-master-test.js: 08 MANAGER & TEAM INTELLIGENCE
- relationship-review-engine.js: 07 POLICY & SALES OPERATIONS
- relationship-review-master-test.js: 07 POLICY & SALES OPERATIONS
- relationship-timeline-engine.js: PERIODSNAPSHOT / OPERATIONAL CLOCKS
- relationship-timeline-master-test.js: 07 POLICY & SALES OPERATIONS
- render-engine.js: 07 POLICY & SALES OPERATIONS
- shared-ave-confidence-engine.js: 04 PRODUCT INTELLIGENCE ENGINE
- shared-ave-confidence-report.js: 04 PRODUCT INTELLIGENCE ENGINE
- shared-ave-death-benefit-engine.js: 04 PRODUCT INTELLIGENCE ENGINE
- shared-ave-death-benefit-report.js: 04 PRODUCT INTELLIGENCE ENGINE
- shared-ave-growth-engine.js: 04 PRODUCT INTELLIGENCE ENGINE + Rule Pack/source documentation boundary
- shared-ave-growth-report.js: 04 PRODUCT INTELLIGENCE ENGINE + Rule Pack/source documentation boundary
- shared-ave-portfolio-engine.js: 04 PRODUCT INTELLIGENCE ENGINE
- shared-ave-portfolio-report.js: 04 PRODUCT INTELLIGENCE ENGINE
- shared-ave-rescue-engine.js: 04 PRODUCT INTELLIGENCE ENGINE
- shared-ave-rescue-report.js: 04 PRODUCT INTELLIGENCE ENGINE
- shared-ave-type-inference-engine.js: 04 PRODUCT INTELLIGENCE ENGINE
- shared-ave-type-inference-report.js: 04 PRODUCT INTELLIGENCE ENGINE
- shared-banxico-rate-engine.js: PERIODSNAPSHOT / OPERATIONAL CLOCKS
- shared-banxico-rate-report.js: PERIODSNAPSHOT / OPERATIONAL CLOCKS
- shared-clp-engine.js: 04 PRODUCT INTELLIGENCE ENGINE + Rule Pack/source documentation boundary
- shared-clp-master-test.js: SHARED COMMERCIAL MODEL
- shared-decision-appendix-engine.js: PERIODSNAPSHOT / OPERATIONAL CLOCKS
- shared-education-cost-engine.js: 04 PRODUCT INTELLIGENCE ENGINE
- shared-education-paths-engine.js: 04 PRODUCT INTELLIGENCE ENGINE
- smnyl-command-palette-engine.js: COMPENSATION INTELLIGENCE
- smnyl-followup-engine.js: Nash Conversation Intelligence or Sales Conversion depending on workflow vs language role
- smnyl-performance-engine.js: SHARED CORE
- smnyl-risk-engine.js: CONSERVATION INTELLIGENCE
- storage-engine.js: 10 PLATFORM SERVICES
- task-engine.js: 07 POLICY & SALES OPERATIONS
- task-priority-engine.js: 07 POLICY & SALES OPERATIONS
- ui-render-engine.js: 12 ADVISOR EXPERIENCE INTELLIGENCE / UI consumer only
- vida-mujer-client-presentation-engine.js: EVIDENCE & PROVENANCE
- vida-mujer-client-presentation-test.js: 02 SALES CONVERSION ENGINE
- vida-mujer-coverage-status-engine.js: 04 PRODUCT INTELLIGENCE ENGINE
- vida-mujer-coverage-status-report.js: 04 PRODUCT INTELLIGENCE ENGINE + Rule Pack/source documentation boundary
- vida-mujer-knowledge-extractor-report.js: 04 PRODUCT INTELLIGENCE ENGINE + Rule Pack/source documentation boundary
- vida-mujer-knowledge-extractor.js: 04 PRODUCT INTELLIGENCE ENGINE + Rule Pack/source documentation boundary
- vida-mujer-protected-diseases-engine.js: 04 PRODUCT INTELLIGENCE ENGINE + Rule Pack/source documentation boundary
- vida-mujer-protected-diseases-report.js: 04 PRODUCT INTELLIGENCE ENGINE + Rule Pack/source documentation boundary
- vida-mujer-survival-schedule-engine.js: 07 POLICY & SALES OPERATIONS
- vida-mujer-survival-schedule-test.js: 07 POLICY & SALES OPERATIONS
- virtual-list-engine.js: PERIODSNAPSHOT / OPERATIONAL CLOCKS

### DELETE LATER ONLY IF PROVEN UNUSED
- action-resolver-engine.js: 07 POLICY & SALES OPERATIONS
- activity-stream-engine.js: PRODUCTIVITY INTELLIGENCE
- adaptive-message-builder.js: 12 ADVISOR EXPERIENCE INTELLIGENCE / UI consumer only
- adaptive-outreach-prompt-builder.js: 12 ADVISOR EXPERIENCE INTELLIGENCE / UI consumer only
- adaptive-question-engine.js: 07 POLICY & SALES OPERATIONS
- adaptive-script-builder.js: 02 SALES CONVERSION ENGINE
- advisor-activity-timeline.js: PERIODSNAPSHOT / OPERATIONAL CLOCKS
- advisor-alert-engine.js: 07 POLICY & SALES OPERATIONS
- advisor-monitor-engine.js: 07 POLICY & SALES OPERATIONS
- advisor-sales-dna.entity.js: PERIODSNAPSHOT / OPERATIONAL CLOCKS
- advisor-score-engine.js: 07 POLICY & SALES OPERATIONS
- advisor-style-engine.js: 02 SALES CONVERSION ENGINE
- ai-context-engine.js: 07 POLICY & SALES OPERATIONS
- ai-first-contact-message-engine.js: 05 RELATIONSHIP INTELLIGENCE ENGINE
- ai-orb-widget.js: 12 ADVISOR EXPERIENCE INTELLIGENCE / UI consumer only
- ai-sales-coach-engine.js: 06 LEARNING INTELLIGENCE ENGINE
- ai-task-suggestion-engine.js: 07 POLICY & SALES OPERATIONS
- animation-engine.js: SHARED CORE
- appointment-calendar-engine.js: PERIODSNAPSHOT / OPERATIONAL CLOCKS
- appointment-followup-engine.js: 02 SALES CONVERSION ENGINE
- appointment-opportunity-engine.js: 08 MANAGER & TEAM INTELLIGENCE
- assistant-memory-engine.js: 10 PLATFORM SERVICES
- auto-task-generator-engine.js: 07 POLICY & SALES OPERATIONS
- buying-signals-engine.js: PERIODSNAPSHOT / OPERATIONAL CLOCKS
- cartera-import-engine.js: 07 POLICY & SALES OPERATIONS, with Shared Core/Evidence consumers when generic
- cartera-repository.js: 07 POLICY & SALES OPERATIONS, with Shared Core/Evidence consumers when generic
- channel-performance-engine.js: PRODUCTIVITY INTELLIGENCE
- close-prompt-builder.js: 12 ADVISOR EXPERIENCE INTELLIGENCE / UI consumer only
- close-readiness-engine.js: Nash Conversation Intelligence or Sales Conversion depending on workflow vs language role
- close-strategy-engine.js: Nash Conversation Intelligence or Sales Conversion depending on workflow vs language role
- comisiones-rules-gmm.js: Compensation Intelligence + RuleSnapshot / Rule Pack boundary
- comisiones-utils.js: Compensation Intelligence + RuleSnapshot / Rule Pack boundary
- command-execution-engine.js: 09 UNIVERSAL COMMAND OS
- command-parser-engine.js: 09 UNIVERSAL COMMAND OS
- command-shortcuts-engine.js: 09 UNIVERSAL COMMAND OS
- command-suggestion-engine.js: 09 UNIVERSAL COMMAND OS
- commission-projection-engine.js: Compensation Intelligence + RuleSnapshot / Rule Pack boundary
- commissionable-amount-engine.js: Compensation Intelligence + RuleSnapshot / Rule Pack boundary
- communication-channel-engine.js: 10 PLATFORM SERVICES
- communication-mismatch-engine.js: 02 SALES CONVERSION ENGINE
- contact-attempt-engine.js: 05 RELATIONSHIP INTELLIGENCE ENGINE
- contact-response-engine.js: 05 RELATIONSHIP INTELLIGENCE ENGINE
- contextual-suggestion-engine.js: CONSERVATION INTELLIGENCE
- conversion-metrics-engine.js: 02 SALES CONVERSION ENGINE
- copilot-suggestion-engine.js: 10 PLATFORM SERVICES
- crash-runtime.js: 10 PLATFORM SERVICES
- csv-parser-engine.js: 10 PLATFORM SERVICES
- daily-points-engine.js: RULESNAPSHOT / RULE PACK
- dashboard-executive.js: 12 ADVISOR EXPERIENCE INTELLIGENCE / UI consumer only
- dashboard-priority-engine.js: 07 POLICY & SALES OPERATIONS
- discovery-insights-engine.js: COMPENSATION INTELLIGENCE
- discovery-priority-engine.js: SHARED CORE
- discovery-product-alignment-engine.js: 04 PRODUCT INTELLIGENCE ENGINE
- discovery-summary-engine.js: 02 SALES CONVERSION ENGINE
- discovery-to-presentation-engine.js: 02 SALES CONVERSION ENGINE
- dna-coaching-engine.js: 08 MANAGER & TEAM INTELLIGENCE
- dna-script-strategy-engine.js: 02 SALES CONVERSION ENGINE
- dom-sanitizer.js: SHARED CORE
- domain-runtime.js: SHARED CORE
- drag-drop-policy-zone.js: 07 POLICY & SALES OPERATIONS
- entity-resolver-engine.js: SHARED CORE
- event-log-engine.js: PERIODSNAPSHOT / OPERATIONAL CLOCKS
- excel-parser-engine.js: SHARED CORE
- financial-pyramid-engine.js: 04 PRODUCT INTELLIGENCE ENGINE
- financial-pyramid-priority-engine.js: 04 PRODUCT INTELLIGENCE ENGINE
- financial-pyramid-story-engine.js: 04 PRODUCT INTELLIGENCE ENGINE
- financial-risk-score-engine.js: SHARED CORE
- financial-story-task-builder.js: 07 POLICY & SALES OPERATIONS
- first-contact-ai-suggestion-engine.js: Nash Conversation Intelligence or Sales Conversion depending on workflow vs language role
- first-contact-dashboard.viewmodel.js: 12 ADVISOR EXPERIENCE INTELLIGENCE / UI consumer only
- first-contact-delivery-engine.js: 02 SALES CONVERSION ENGINE
- first-contact-options-engine.js: 02 SALES CONVERSION ENGINE
- first-contact-script-engine.js: Nash Conversation Intelligence or Sales Conversion depending on workflow vs language role
- first-contact-tone-engine.js: 02 SALES CONVERSION ENGINE
- first-contact.entity.js: 02 SALES CONVERSION ENGINE
- followup-message-context-engine.js: 05 RELATIONSHIP INTELLIGENCE ENGINE
- followup-next-date-engine.js: PERIODSNAPSHOT / OPERATIONAL CLOCKS
- followup-overdue-engine.js: 05 RELATIONSHIP INTELLIGENCE ENGINE
- followup-priority-engine.js: 05 RELATIONSHIP INTELLIGENCE ENGINE
- followup-recommendation-engine.js: 05 RELATIONSHIP INTELLIGENCE ENGINE
- followup-reminder-engine.js: 05 RELATIONSHIP INTELLIGENCE ENGINE
- followup.entity.js: PERIODSNAPSHOT / OPERATIONAL CLOCKS
- forge-build-tree-status.js: 02 SALES CONVERSION ENGINE
- forge-schema-reporter.js: EVIDENCE & PROVENANCE
- forge-semantic-risk-report.js: 04 PRODUCT INTELLIGENCE ENGINE
- forge-vida-mujer-advisor-report.js: 04 PRODUCT INTELLIGENCE ENGINE
- ghosting-prompt-builder.js: 12 ADVISOR EXPERIENCE INTELLIGENCE / UI consumer only
- ghosting-status-engine.js: 05 RELATIONSHIP INTELLIGENCE ENGINE
- google-calendar-engine.js: PERIODSNAPSHOT / OPERATIONAL CLOCKS
- health-runtime.js: 10 PLATFORM SERVICES
- hot-market-engine.js: 05 RELATIONSHIP INTELLIGENCE ENGINE
- idle-runtime.js: PERIODSNAPSHOT / OPERATIONAL CLOCKS
- imagina-ser-contribution-engine.js: 04 PRODUCT INTELLIGENCE ENGINE
- import-progress-engine.js: 07 POLICY & SALES OPERATIONS
- in-app-notification-engine.js: 10 PLATFORM SERVICES
- introduction-message-engine.js: SHARED COMMERCIAL MODEL
- lead-temperature-engine.js: SHARED CORE
- life-expectancy-projection-engine.js: FORECAST INTELLIGENCE, with Economic Motivation/Product Intelligence consumers
- line-of-business-engine.js: 04 PRODUCT INTELLIGENCE ENGINE
- live-communication-engine.js: 10 PLATFORM SERVICES
- live-dashboard-engine.js: 12 ADVISOR EXPERIENCE INTELLIGENCE / UI consumer only
- live-notification-engine.js: 10 PLATFORM SERVICES
- live-operational-state-engine.js: 07 POLICY & SALES OPERATIONS
- manager-broadcast-engine.js: 08 MANAGER & TEAM INTELLIGENCE
- manager-coaching-engine.js: 08 MANAGER & TEAM INTELLIGENCE
- manager-feed-engine.js: 08 MANAGER & TEAM INTELLIGENCE
- manager-notification-engine.js: 08 MANAGER & TEAM INTELLIGENCE
- manager-role-engine.js: 08 MANAGER & TEAM INTELLIGENCE
- mass-import-mapping-engine.js: 07 POLICY & SALES OPERATIONS, with Shared Core/Evidence consumers when generic
- mass-import-preview-engine.js: 07 POLICY & SALES OPERATIONS, with Shared Core/Evidence consumers when generic
- mass-import-validation-engine.js: 07 POLICY & SALES OPERATIONS, with Shared Core/Evidence consumers when generic
- momentum-engine.js: SHARED CORE
- monthly-revenue-engine.js: PERIODSNAPSHOT / OPERATIONAL CLOCKS
- motion-principles.js: SHARED CORE
- mutation-engine.js: 10 PLATFORM SERVICES
- nano-banana-icon-system-prompt.js: 07 POLICY & SALES OPERATIONS
- needs-discovery-engine.js: 04 PRODUCT INTELLIGENCE ENGINE
- notification-orchestrator.js: 10 PLATFORM SERVICES
- notification-priority-engine.js: 10 PLATFORM SERVICES
- notification-queue-engine.js: 10 PLATFORM SERVICES
- objection-battle-engine.js: Nash Conversation Intelligence or Sales Conversion depending on workflow vs language role
- objection-classifier-engine.js: Nash Conversation Intelligence or Sales Conversion depending on workflow vs language role
- objection-intent-engine.js: Nash Conversation Intelligence or Sales Conversion depending on workflow vs language role
- objection-memory-engine.js: Nash Conversation Intelligence or Sales Conversion depending on workflow vs language role
- objection-prompt-builder.js: 12 ADVISOR EXPERIENCE INTELLIGENCE / UI consumer only
- objection-resolution-engine.js: 03 NASH CONVERSATION INTELLIGENCE
- objection-response-strategy-engine.js: 03 NASH CONVERSATION INTELLIGENCE
- ocr-result-cache.js: 07 POLICY & SALES OPERATIONS
- operational-button.tsx: 12 ADVISOR EXPERIENCE INTELLIGENCE / UI consumer only
- operational-card.tsx: 07 POLICY & SALES OPERATIONS
- operational-colors.js: 07 POLICY & SALES OPERATIONS
- operational-dashboard-engine.js: 07 POLICY & SALES OPERATIONS
- operational-feed-engine.js: 07 POLICY & SALES OPERATIONS
- operational-shell.store.ts: SHARED CORE
- operational-sync-engine.js: SHARED CORE
- opportunity-detector-engine.js: 01 REVENUE GENERATION ENGINE
- optimistic-mutation-runtime.js: PERIODSNAPSHOT / OPERATIONAL CLOCKS
- outreach-prompt-builder.js: 12 ADVISOR EXPERIENCE INTELLIGENCE / UI consumer only
- ovelay-manager.js: 08 MANAGER & TEAM INTELLIGENCE
- overdue-task-engine.js: 07 POLICY & SALES OPERATIONS
- payment-frequency-engine.js: 07 POLICY & SALES OPERATIONS
- payment-mode-coaching-engine.js: 08 MANAGER & TEAM INTELLIGENCE
- pipeline-stage-engine.js: 01 REVENUE GENERATION ENGINE
- policy-activity-engine.js: 07 POLICY & SALES OPERATIONS
- policy-ai-insights-engine.js: 07 POLICY & SALES OPERATIONS
- policy-ai-parser.js: 04 PRODUCT INTELLIGENCE ENGINE
- policy-auto-approval-engine.js: 07 POLICY & SALES OPERATIONS
- policy-auto-save-engine.js: 07 POLICY & SALES OPERATIONS
- policy-batch-processing-engine.js: 10 PLATFORM SERVICES
- policy-client-summary-engine.js: 07 POLICY & SALES OPERATIONS
- policy-context-engine.js: 07 POLICY & SALES OPERATIONS
- policy-core-engine.js: PERIODSNAPSHOT / OPERATIONAL CLOCKS
- policy-detail-alert-engine.js: 07 POLICY & SALES OPERATIONS
- policy-document-classifier.js: 07 POLICY & SALES OPERATIONS
- policy-document-engine.js: 07 POLICY & SALES OPERATIONS
- policy-duplicate-engine.js: 07 POLICY & SALES OPERATIONS
- policy-field-confidence-map.js: COMPENSATION INTELLIGENCE
- policy-filter-engine.js: 04 PRODUCT INTELLIGENCE ENGINE
- policy-financial-summary-engine.js: COMPENSATION INTELLIGENCE
- policy-import-dashboard-engine.js: 07 POLICY & SALES OPERATIONS
- policy-import-engine.js: 07 POLICY & SALES OPERATIONS
- policy-import-errors-engine.js: 07 POLICY & SALES OPERATIONS
- policy-import-metrics-engine.js: 07 POLICY & SALES OPERATIONS
- policy-import-queue.js: 10 PLATFORM SERVICES
- policy-import-summary.js: 07 POLICY & SALES OPERATIONS
- policy-indexing-engine.js: 07 POLICY & SALES OPERATIONS
- policy-ingestion-orchestrator.js: 07 POLICY & SALES OPERATIONS
- policy-last-contact-engine.js: 05 RELATIONSHIP INTELLIGENCE ENGINE
- policy-live-state-engine.js: 07 POLICY & SALES OPERATIONS
- policy-metadata-engine.js: 07 POLICY & SALES OPERATIONS
- policy-normalization-engine.js: COMPENSATION INTELLIGENCE
- policy-operational-center-engine.js: 07 POLICY & SALES OPERATIONS
- policy-relationship-score-engine.js: SHARED CORE
- policy-renewal-status-engine.js: 07 POLICY & SALES OPERATIONS
- policy-review-priority-engine.js: 07 POLICY & SALES OPERATIONS
- policy-review-ui-engine.js: 07 POLICY & SALES OPERATIONS, with Shared Core/Evidence consumers when generic
- policy-schema-validator-engine.js: SHARED CORE
- policy-search-engine.js: 07 POLICY & SALES OPERATIONS
- policy-side-by-side-engine.js: 07 POLICY & SALES OPERATIONS
- policy-smart-sort-engine.js: COMPENSATION INTELLIGENCE
- policy-staging-cache.js: 07 POLICY & SALES OPERATIONS
- policy-staging-status-engine.js: 07 POLICY & SALES OPERATIONS
- policy-status-engine.js: 07 POLICY & SALES OPERATIONS
- policy-summary-engine.js: 07 POLICY & SALES OPERATIONS
- policy-timeline-event.factory.js: 07 POLICY & SALES OPERATIONS
- policy-timeline-group-engine.js: 07 POLICY & SALES OPERATIONS
- policy-timeline-query-engine.js: 07 POLICY & SALES OPERATIONS
- policy-timeline.repository.js: 07 POLICY & SALES OPERATIONS
- policy-timeline.types.js: 07 POLICY & SALES OPERATIONS
- policy-validation-engine.js: COMPENSATION INTELLIGENCE
- policy-workspace-engine.js: 07 POLICY & SALES OPERATIONS
- predictive-dashboard.tsx: 12 ADVISOR EXPERIENCE INTELLIGENCE / UI consumer only
- presentation-input-context-builder.js: 02 SALES CONVERSION ENGINE
- primary-risk-engine.js: COMPENSATION INTELLIGENCE
- product-schema-engine.js: 04 PRODUCT INTELLIGENCE ENGINE
- push-notification-engine.js: 10 PLATFORM SERVICES
- query-cache.js: 10 PLATFORM SERVICES
- query-runtime.js: 10 PLATFORM SERVICES
- question-answer-engine.js: PERIODSNAPSHOT / OPERATIONAL CLOCKS
- question-session-engine.js: PERIODSNAPSHOT / OPERATIONAL CLOCKS
- quick-action-executor-engine.js: 07 POLICY & SALES OPERATIONS
- quick-actions-bar.tsx: PERIODSNAPSHOT / OPERATIONAL CLOCKS
- quotation-extraction-result.entity.js: 02 SALES CONVERSION ENGINE
- quotation-input.entity.js: SHARED CORE
- ranking-engine.js: 08 MANAGER & TEAM INTELLIGENCE
- reactivation-strategy-engine.js: 02 SALES CONVERSION ENGINE
- realtime-task-engine.js: PERIODSNAPSHOT / OPERATIONAL CLOCKS
- referral-ai-followup.js: 05 RELATIONSHIP INTELLIGENCE ENGINE
- referral-card-ui.js: 05 RELATIONSHIP INTELLIGENCE ENGINE
- referral-followup-engine.js: 05 RELATIONSHIP INTELLIGENCE ENGINE
- referral-prompt-builder.js: 12 ADVISOR EXPERIENCE INTELLIGENCE / UI consumer only
- referral-score-engine.js: SHARED CORE
- referral-smart-actions.js: 10 PLATFORM SERVICES
- referral-timeline-engine.js: PERIODSNAPSHOT / OPERATIONAL CLOCKS
- referrals-board-engine.js: 10 PLATFORM SERVICES
- referrals-engine.js: PERIODSNAPSHOT / OPERATIONAL CLOCKS
- relationship-memory-engine.js: 05 RELATIONSHIP INTELLIGENCE ENGINE
- renewal-intelligence-engine.js: 07 POLICY & SALES OPERATIONS
- retry-runtime.js: PERIODSNAPSHOT / OPERATIONAL CLOCKS
- revenue-forecast-engine.js: 01 REVENUE GENERATION ENGINE
- revenue-optimization-engine.js: PERIODSNAPSHOT / OPERATIONAL CLOCKS
- risk-story-context-engine.js: COMPENSATION INTELLIGENCE
- route-transition-manager.js: 08 MANAGER & TEAM INTELLIGENCE
- sales-coach-engine.js: 10 PLATFORM SERVICES
- sales-context-engine.js: 02 SALES CONVERSION ENGINE
- sales-dna-evolution-engine.js: PRODUCTIVITY INTELLIGENCE
- sales-dna-insight-engine.js: Nash Conversation Intelligence or Sales Conversion depending on workflow vs language role
- sales-dna-learning-event.js: 02 SALES CONVERSION ENGINE
- sales-dna-match-engine.js: Nash Conversation Intelligence or Sales Conversion depending on workflow vs language role
- sales-dna-profile-engine.js: 02 SALES CONVERSION ENGINE
- sales-dna-recommendation-engine.js: Nash Conversation Intelligence or Sales Conversion depending on workflow vs language role
- sales-dna-stage-engine.js: 02 SALES CONVERSION ENGINE
- sales-learning-event.entity.js: 02 SALES CONVERSION ENGINE
- search-index-engine.js: 04 PRODUCT INTELLIGENCE ENGINE
- search-quick-actions-engine.js: 12 ADVISOR EXPERIENCE INTELLIGENCE / UI consumer only
- search-ranking-engine.js: 08 MANAGER & TEAM INTELLIGENCE
- secure-storage.js: 10 PLATFORM SERVICES
- segu-beca-meaningful-numbers-report.js: 04 PRODUCT INTELLIGENCE ENGINE + Rule Pack/source documentation boundary
- segu-beca-mxn-appendix-report.js: 04 PRODUCT INTELLIGENCE ENGINE + Rule Pack/source documentation boundary
- segu-beca-mxn-timeline-clean-report.js: 04 PRODUCT INTELLIGENCE ENGINE + Rule Pack/source documentation boundary
- segu-beca-ocr-intake-report.js: 04 PRODUCT INTELLIGENCE ENGINE
- semantic-navigation-engine.js: CONSERVATION INTELLIGENCE
- smart-agenda-engine.js: PERIODSNAPSHOT / OPERATIONAL CLOCKS
- smart-followup-engine.js: 05 RELATIONSHIP INTELLIGENCE ENGINE
- smart-followup-message-engine.js: 05 RELATIONSHIP INTELLIGENCE ENGINE
- smart-header.tsx: 12 ADVISOR EXPERIENCE INTELLIGENCE / UI consumer only
- smart-notification-engine.js: 10 PLATFORM SERVICES
- smart-outreach-engine.js: 02 SALES CONVERSION ENGINE
- smart-priority-engine.js: 10 PLATFORM SERVICES
- smart-referrals-engine.js: SHARED CORE
- smnyl-ai-coach-engine.js: 10 PLATFORM SERVICES
- smnyl-ai-presence-engine.js: 08 MANAGER & TEAM INTELLIGENCE
- smnyl-comisiones-gmm.js: 04 PRODUCT INTELLIGENCE ENGINE
- smnyl-comisiones-vida.js: Compensation Intelligence + RuleSnapshot / Rule Pack boundary
- smnyl-command-center-engine.js: 08 MANAGER & TEAM INTELLIGENCE
- smnyl-conteo-engine.js: Compensation Intelligence + RuleSnapshot / Rule Pack boundary
- smnyl-cross-sell-engine.js: 04 PRODUCT INTELLIGENCE ENGINE
- smnyl-decision-engine.js: SHARED CORE
- smnyl-goals-engine.js: PRODUCTIVITY INTELLIGENCE
- smnyl-insights-engine.js: CONSERVATION INTELLIGENCE
- smnyl-leaderboard-engine.js: SHARED CORE
- smnyl-neural-glow-engine.js: SHARED CORE
- smnyl-opportunity-engine.js: COMPENSATION INTELLIGENCE
- smnyl-pipeline-engine.js: 02 SALES CONVERSION ENGINE
- smnyl-productividad-engine.js: PRODUCTIVITY INTELLIGENCE
- smnyl-renovaciones-engine.js: CONSERVATION INTELLIGENCE
- smnyl-streak-engine.js: PRODUCTIVITY INTELLIGENCE
- staging-cleanup-engine.js: 07 POLICY & SALES OPERATIONS
- supabase-runtime.js: 10 PLATFORM SERVICES
- sw-cache-config.js: 10 PLATFORM SERVICES
- sync-queue-runtime.js: 10 PLATFORM SERVICES
- task-feed-engine.js: 07 POLICY & SALES OPERATIONS
- task-quick-action-engine.js: 07 POLICY & SALES OPERATIONS
- team-activity-engine.js: PRODUCTIVITY INTELLIGENCE
- team-dashboard-engine.js: 12 ADVISOR EXPERIENCE INTELLIGENCE / UI consumer only
- team-momentum-engine.js: 08 MANAGER & TEAM INTELLIGENCE
- team-structure-engine.js: 08 MANAGER & TEAM INTELLIGENCE
- tone-performance-engine.js: 02 SALES CONVERSION ENGINE
- universal-command-engine.js: SHARED CORE
- universal-search-engine.js: Alfred / Universal Command Bar
- vida-mujer-client-explanation-report.js: 04 PRODUCT INTELLIGENCE ENGINE
- vida-mujer-event-benefits-report.js: 04 PRODUCT INTELLIGENCE ENGINE + Rule Pack/source documentation boundary
- vida-mujer-financial-correction-report.js: 04 PRODUCT INTELLIGENCE ENGINE
- vida-mujer-financial-fixture-report.js: 02 SALES CONVERSION ENGINE
- vida-mujer-pdf-ave-integration-report.js: 04 PRODUCT INTELLIGENCE ENGINE
- vida-mujer-pdf-intake-report.js: 04 PRODUCT INTELLIGENCE ENGINE
- vida-mujer-rule-consistency-report.js: 04 PRODUCT INTELLIGENCE ENGINE
- vida-mujer-status.js: 04 PRODUCT INTELLIGENCE ENGINE
- visibility-runtime.js: PERIODSNAPSHOT / OPERATIONAL CLOCKS
- warm-market-segmentation-engine.js: 05 RELATIONSHIP INTELLIGENCE ENGINE

## Refactor Priorities

- ALTA: resolve ADRs and test plans first; no physical movement.
- MEDIA: compare duplicate behavior and import graph.
- BAJA: defer until high-risk ownership is closed.

## Recommendations

1. Validate ADRs for Legacy CRM AddLife Root, Rule Pack boundaries, Forecast truth model, Alfred/Command OS and Event Bus before moving files.
2. Consolidate duplicate modules only after behavior comparison and import graph validation.
3. Keep all DO NOT TOUCH modules protected until tests, fixtures, source docs and rollback plans exist.
4. Do not merge legacy CRM root utilities into Forge Core without explicit migration plan.
5. Record human decisions per module before updating physical folder structure.

## Validation

- No code modified.
- No files moved.
- No imports changed.
- No app.js touched.
- No UI source modified.
- No schemas modified.
- No APIs or databases accessed.
