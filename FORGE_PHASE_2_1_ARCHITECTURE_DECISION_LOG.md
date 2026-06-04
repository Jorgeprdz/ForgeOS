# FORGE PHASE 2.1 ARCHITECTURE DECISION LOG

Status: Documentation-only decision log.
Scope: Resolve ownership decisions before any refactor, movement, consolidation or deletion.
Implementation: NOT APPROVED.
No code modified. No files moved. No imports changed.

## Executive Summary

- Conflict areas reviewed: 10
- Critical modules reviewed: 162
- Decisions proposed: 162
- DO NOT TOUCH modules: 21
- KEEP modules: 26
- REVIEW REQUIRED modules: 18
- MOVE LATER modules: 2
- SPLIT LATER modules: 0
- CONSOLIDATE LATER modules: 36

## Scope

This log records architecture decisions only. It does not approve code changes, file movement, imports changes, deletion, consolidation, new engines, schemas, UI changes or app.js changes.

## Methodology

- Used Phase 2 human review summary, module-to-branch map, unknown review queue and cartography reports.
- Reviewed named conflict areas with explicit ownership rules.
- Assigned decision categories before any physical refactor.
- Marked critical modules as DO NOT TOUCH where test/source/rollback requirements are mandatory.

## Decision Categories

- KEEP: module appears correctly owned and needs no immediate action.
- DOCUMENT: module appears valid but needs documentation or source/rule provenance.
- REVIEW REQUIRED: insufficient certainty; human review required before touching.
- DO NOT TOUCH: critical module; no change without test plan, fixtures, rollback and review.
- MOVE LATER: likely future folder/owner move after tests and decision.
- SPLIT LATER: mixed responsibilities or large file; split later only after tests.
- CONSOLIDATE LATER: possible duplicate/overlap; consolidate only after behavior comparison.
- DELETE LATER ONLY IF PROVEN UNUSED: possible orphan; deletion requires proof.

## Critical Ownership Conflicts

- Alfred / Universal Command Bar vs Command OS.
- app.js / Core Orchestration / Platform Services.
- Compensation Intelligence vs RuleSnapshot / Rule Pack.
- Product Intelligence vs product-specific hardcoded values.
- Policy & Sales Operations / Cartera.
- Advisor Experience / UI vs Business Truth.
- Forecast / Projection vs Economic Motivation / Product Intelligence.
- Nash / Sales Conversion / Followup / Objections.
- Recruitment / Candidate / Advisor Development.
- Unknown / Needs Review.

## Decision Log by Conflict Area

## Conflict Area: Alfred / Universal Command Bar vs Command OS

### Context

Alfred owns visible advisor command experience. Command OS owns parsing, routing, execution, registry, shortcuts and search plumbing. Advisor Experience teaches Alfred but does not execute commands.

### Modules Reviewed

| Module | Current Branch | Suspected Owner | Secondary Consumers | Risk | Decision | Confidence |
|---|---|---|---|---|---|---|
| command-palette.js | Alfred / Universal Command Bar | Alfred / Universal Command Bar | Advisor Experience, Command OS, Alfred / Universal Command Bar | hardcoded/rule-pack-sensitive values possible; possible duplicate / overlap candidate | DO NOT TOUCH | MEDIUM |
| command-palette-ui.js | Alfred / Universal Command Bar | Alfred / Universal Command Bar, with Command OS as execution dependency | Advisor Experience, Command OS, Alfred / Universal Command Bar | possible duplicate / overlap candidate | DO NOT TOUCH | MEDIUM |
| command-palette.tsx | 07 POLICY & SALES OPERATIONS | Alfred / Universal Command Bar, with Command OS as execution dependency | Advisor Experience, Command OS, Alfred / Universal Command Bar | hardcoded/rule-pack-sensitive values possible; possible duplicate / overlap candidate | DO NOT TOUCH | MEDIUM |
| command-palette-engine.js | SHARED CORE | SHARED CORE | Advisor Experience, Command OS, Alfred / Universal Command Bar | possible duplicate / overlap candidate | DO NOT TOUCH | MEDIUM |
| command-palette.store.js | SHARED CORE | Alfred / Universal Command Bar, with Command OS as execution dependency | Advisor Experience, Command OS, Alfred / Universal Command Bar | No immediate static risk detected. | DO NOT TOUCH | HIGH |
| command-shortcuts-engine.js | 09 UNIVERSAL COMMAND OS | 09 UNIVERSAL COMMAND OS | Advisor Experience, Command OS, Alfred / Universal Command Bar | possible orphan / no incoming imports detected | DELETE LATER ONLY IF PROVEN UNUSED | MEDIUM |
| command-suggestion-engine.js | 09 UNIVERSAL COMMAND OS | 09 UNIVERSAL COMMAND OS | Advisor Experience, Command OS, Alfred / Universal Command Bar | possible orphan / no incoming imports detected | DELETE LATER ONLY IF PROVEN UNUSED | MEDIUM |
| command-search-engine.js | Alfred / Universal Command Bar | Alfred / Universal Command Bar | Advisor Experience, Command OS, Alfred / Universal Command Bar | No immediate static risk detected. | KEEP | HIGH |
| universal-search-engine.js | Alfred / Universal Command Bar | Alfred / Universal Command Bar | Unknown until human review | possible orphan / no incoming imports detected | DELETE LATER ONLY IF PROVEN UNUSED | MEDIUM |
| search-quick-actions-engine.js | 09 UNIVERSAL COMMAND OS | 12 ADVISOR EXPERIENCE INTELLIGENCE / UI consumer only | Unknown until human review | possible orphan / no incoming imports detected | DELETE LATER ONLY IF PROVEN UNUSED | MEDIUM |
| command-parser-engine.js | SHARED CORE | 09 UNIVERSAL COMMAND OS | Advisor Experience, Command OS, Alfred / Universal Command Bar | possible orphan / no incoming imports detected | DELETE LATER ONLY IF PROVEN UNUSED | MEDIUM |
| command-registry.js | 07 POLICY & SALES OPERATIONS | 09 UNIVERSAL COMMAND OS | Advisor Experience, Command OS, Alfred / Universal Command Bar | No immediate static risk detected. | KEEP | HIGH |
| command-execution-engine.js | CONSERVATION INTELLIGENCE | 09 UNIVERSAL COMMAND OS | Advisor Experience, Command OS, Alfred / Universal Command Bar | possible orphan / no incoming imports detected | DELETE LATER ONLY IF PROVEN UNUSED | MEDIUM |
| smnyl-command-palette-engine.js | COMPENSATION INTELLIGENCE | COMPENSATION INTELLIGENCE | Advisor Experience, Command OS, Alfred / Universal Command Bar | carrier-specific boundary review; possible duplicate / overlap candidate | CONSOLIDATE LATER | MEDIUM |

### Decision

Apply the conflict rule for Alfred / Universal Command Bar vs Command OS. No physical refactor is approved. Decisions indicate what can be considered later after validation.

### Guardrail

Alfred owns visible advisor command experience. Command OS owns parsing, routing, execution, registry, shortcuts and search plumbing. Advisor Experience teaches Alfred but does not execute commands.

### Required Before Refactor

- Owner decision recorded.
- Relevant tests identified or created in a later approved implementation phase.
- Fixtures/source documents available where business rules exist.
- Rollback plan defined.
- No movement without import graph validation.

### Final Status

PARTIALLY DECIDED / NO CODE CHANGE

## Conflict Area: app.js / Core Orchestration / Platform Services

### Context

app.js is Platform / App Shell / Root Orchestration and is DO NOT TOUCH without test plan. Event bus/domain events are Platform Services or Shared Core candidates. Duplicates are consolidate-later only.

### Modules Reviewed

| Module | Current Branch | Suspected Owner | Secondary Consumers | Risk | Decision | Confidence |
|---|---|---|---|---|---|---|
| app.js | 10 PLATFORM SERVICES | 10 PLATFORM SERVICES / App Shell / Root Orchestration | Unknown until human review | hardcoded/rule-pack-sensitive values possible; possible duplicate / overlap candidate; large file; HIGH RISK / DO NOT TOUCH WITHOUT TEST PLAN | DO NOT TOUCH | MEDIUM |
| core-app-engine.js | 10 PLATFORM SERVICES | 10 PLATFORM SERVICES | Unknown until human review | possible duplicate / overlap candidate | CONSOLIDATE LATER | MEDIUM |
| app-shell-manager.js | 08 MANAGER & TEAM INTELLIGENCE | 08 MANAGER & TEAM INTELLIGENCE | Unknown until human review | hardcoded/rule-pack-sensitive values possible | DOCUMENT | MEDIUM |
| dashboard.js | 10 PLATFORM SERVICES | 12 ADVISOR EXPERIENCE INTELLIGENCE / UI consumer only | Unknown until human review | hardcoded/rule-pack-sensitive values possible; large file; UI/business interpretation boundary review | DO NOT TOUCH | MEDIUM |
| event-system.js | UNKNOWN / NEEDS REVIEW | 10 PLATFORM SERVICES or SHARED CORE event infrastructure | Unknown until human review | unknown / needs review | DO NOT TOUCH | LOW |
| event-bus-engine.js | 10 PLATFORM SERVICES | 10 PLATFORM SERVICES | Unknown until human review | possible orphan / no incoming imports detected; possible duplicate / overlap candidate | DO NOT TOUCH | MEDIUM |
| core-event-bus.js | SHARED CORE | SHARED CORE | Unknown until human review | possible duplicate / overlap candidate | DO NOT TOUCH | MEDIUM |
| core_event-bus.js | SHARED CORE | SHARED CORE | Unknown until human review | possible orphan / no incoming imports detected; possible duplicate / overlap candidate | DO NOT TOUCH | MEDIUM |
| domain-events.js | 10 PLATFORM SERVICES | 10 PLATFORM SERVICES | Unknown until human review | possible orphan / no incoming imports detected; possible duplicate / overlap candidate | CONSOLIDATE LATER | MEDIUM |
| core_domain-events.js | SHARED CORE | SHARED CORE | Unknown until human review | possible orphan / no incoming imports detected; possible duplicate / overlap candidate | CONSOLIDATE LATER | MEDIUM |
| state-manager.js | SHARED CORE | SHARED CORE | Unknown until human review | No immediate static risk detected. | KEEP | HIGH |
| module-lifecycle.js | 10 PLATFORM SERVICES | 10 PLATFORM SERVICES | Unknown until human review | No immediate static risk detected. | KEEP | HIGH |
| ui-render-engine.js | 07 POLICY & SALES OPERATIONS | 12 ADVISOR EXPERIENCE INTELLIGENCE / UI consumer only | Unknown until human review | possible duplicate / overlap candidate | CONSOLIDATE LATER | MEDIUM |
| sync-orchestrator.js | 10 PLATFORM SERVICES | 10 PLATFORM SERVICES | Unknown until human review | No immediate static risk detected. | KEEP | HIGH |
| logger.js | 10 PLATFORM SERVICES | 10 PLATFORM SERVICES | Unknown until human review | No immediate static risk detected. | KEEP | HIGH |
| analytics-engine.js | 10 PLATFORM SERVICES | 10 PLATFORM SERVICES | Unknown until human review | No immediate static risk detected. | KEEP | HIGH |
| error-boundary.js | 07 POLICY & SALES OPERATIONS | 07 POLICY & SALES OPERATIONS | Unknown until human review | No immediate static risk detected. | KEEP | HIGH |

### Decision

Apply the conflict rule for app.js / Core Orchestration / Platform Services. No physical refactor is approved. Decisions indicate what can be considered later after validation.

### Guardrail

app.js is Platform / App Shell / Root Orchestration and is DO NOT TOUCH without test plan. Event bus/domain events are Platform Services or Shared Core candidates. Duplicates are consolidate-later only.

### Required Before Refactor

- Owner decision recorded.
- Relevant tests identified or created in a later approved implementation phase.
- Fixtures/source documents available where business rules exist.
- Rollback plan defined.
- No movement without import graph validation.

### Final Status

PARTIALLY DECIDED / NO CODE CHANGE

## Conflict Area: Compensation Intelligence vs RuleSnapshot / Rule Pack

### Context

Compensation interprets money outcomes; RuleSnapshot / Rule Pack owns carrier rules, thresholds, formulas and sources. No formulas are approved by this decision log.

### Modules Reviewed

| Module | Current Branch | Suspected Owner | Secondary Consumers | Risk | Decision | Confidence |
|---|---|---|---|---|---|---|
| comisiones.js | 04 PRODUCT INTELLIGENCE ENGINE | Compensation Intelligence + RuleSnapshot / Rule Pack boundary | RuleSnapshot / Rule Pack, Economic Motivation, Manager Compensation | hardcoded/rule-pack-sensitive values possible; possible duplicate / overlap candidate | CONSOLIDATE LATER | MEDIUM |
| comisiones-utils.js | PERIODSNAPSHOT / OPERATIONAL CLOCKS | Compensation Intelligence + RuleSnapshot / Rule Pack boundary | RuleSnapshot / Rule Pack, Economic Motivation, Manager Compensation | possible orphan / no incoming imports detected | DELETE LATER ONLY IF PROVEN UNUSED | MEDIUM |
| comisiones-rules-gmm.js | 04 PRODUCT INTELLIGENCE ENGINE | Compensation Intelligence + RuleSnapshot / Rule Pack boundary | RuleSnapshot / Rule Pack, Economic Motivation, Manager Compensation | hardcoded/rule-pack-sensitive values possible; possible orphan / no incoming imports detected | DELETE LATER ONLY IF PROVEN UNUSED | MEDIUM |
| smnyl-comisiones-engine.js | COMPENSATION INTELLIGENCE | Compensation Intelligence + RuleSnapshot / Rule Pack boundary | RuleSnapshot / Rule Pack, Economic Motivation, Manager Compensation | hardcoded/rule-pack-sensitive values possible; carrier-specific boundary review; possible orphan / no incoming imports detected; possible duplicate / overlap candidate | DO NOT TOUCH | MEDIUM |
| smnyl-concursos-engine.js | COMPENSATION INTELLIGENCE | Compensation Intelligence + RuleSnapshot / Rule Pack boundary | RuleSnapshot / Rule Pack, Economic Motivation, Manager Compensation | hardcoded/rule-pack-sensitive values possible; carrier-specific boundary review; possible duplicate / overlap candidate | DO NOT TOUCH | MEDIUM |
| concursos.js | COMPENSATION INTELLIGENCE | Compensation Intelligence + RuleSnapshot / Rule Pack boundary | RuleSnapshot / Rule Pack, Economic Motivation, Manager Compensation | hardcoded/rule-pack-sensitive values possible; possible duplicate / overlap candidate | CONSOLIDATE LATER | MEDIUM |
| smnyl-bonos-engine.js | CONSERVATION INTELLIGENCE | Compensation Intelligence + RuleSnapshot / Rule Pack boundary | RuleSnapshot / Rule Pack, Economic Motivation, Manager Compensation | hardcoded/rule-pack-sensitive values possible; carrier-specific boundary review | DO NOT TOUCH | MEDIUM |
| smnyl-training-allowance-engine.js | COMPENSATION INTELLIGENCE | Compensation Intelligence + RuleSnapshot / Rule Pack boundary | Unknown until human review | hardcoded/rule-pack-sensitive values possible; carrier-specific boundary review | DO NOT TOUCH | MEDIUM |
| smnyl-prima-engine.js | 04 PRODUCT INTELLIGENCE ENGINE | Compensation Intelligence + RuleSnapshot / Rule Pack boundary | RuleSnapshot / Rule Pack, Economic Motivation, Manager Compensation | hardcoded/rule-pack-sensitive values possible; carrier-specific boundary review | DO NOT TOUCH | MEDIUM |
| smnyl-produccion-engine.js | COMPENSATION INTELLIGENCE | Compensation Intelligence + RuleSnapshot / Rule Pack boundary | Unknown until human review | hardcoded/rule-pack-sensitive values possible; carrier-specific boundary review | DOCUMENT | MEDIUM |
| smnyl-conteo-engine.js | COMPENSATION INTELLIGENCE | Compensation Intelligence + RuleSnapshot / Rule Pack boundary | Unknown until human review | hardcoded/rule-pack-sensitive values possible; carrier-specific boundary review; possible orphan / no incoming imports detected | DELETE LATER ONLY IF PROVEN UNUSED | MEDIUM |
| smnyl-productos-vida.js | COMPENSATION INTELLIGENCE | 04 PRODUCT INTELLIGENCE ENGINE + Rule Pack/source documentation boundary | Unknown until human review | hardcoded/rule-pack-sensitive values possible; carrier-specific boundary review | DOCUMENT | MEDIUM |
| smnyl-comisiones-vida.js | CONSERVATION INTELLIGENCE | Compensation Intelligence + RuleSnapshot / Rule Pack boundary | RuleSnapshot / Rule Pack, Economic Motivation, Manager Compensation | hardcoded/rule-pack-sensitive values possible; carrier-specific boundary review; possible orphan / no incoming imports detected | DELETE LATER ONLY IF PROVEN UNUSED | MEDIUM |
| commission-projection-engine.js | COMPENSATION INTELLIGENCE | Compensation Intelligence + RuleSnapshot / Rule Pack boundary | RuleSnapshot / Rule Pack, Economic Motivation, Manager Compensation, Business Planning, Advisor Experience | possible orphan / no incoming imports detected | DELETE LATER ONLY IF PROVEN UNUSED | MEDIUM |
| commissionable-amount-engine.js | COMPENSATION INTELLIGENCE | Compensation Intelligence + RuleSnapshot / Rule Pack boundary | RuleSnapshot / Rule Pack, Economic Motivation, Manager Compensation | possible orphan / no incoming imports detected | DELETE LATER ONLY IF PROVEN UNUSED | MEDIUM |

### Decision

Apply the conflict rule for Compensation Intelligence vs RuleSnapshot / Rule Pack. No physical refactor is approved. Decisions indicate what can be considered later after validation.

### Guardrail

Compensation interprets money outcomes; RuleSnapshot / Rule Pack owns carrier rules, thresholds, formulas and sources. No formulas are approved by this decision log.

### Required Before Refactor

- Owner decision recorded.
- Relevant tests identified or created in a later approved implementation phase.
- Fixtures/source documents available where business rules exist.
- Rollback plan defined.
- No movement without import graph validation.

### Final Status

PARTIALLY DECIDED / NO CODE CHANGE

## Conflict Area: Product Intelligence + SMNYL/Product-specific hardcoded values

### Context

Product Intelligence may hold documented product truth. Product-specific values require source documents and must not become unverified official formulas.

### Modules Reviewed

| Module | Current Branch | Suspected Owner | Secondary Consumers | Risk | Decision | Confidence |
|---|---|---|---|---|---|---|
| vida-mujer-coverage-status-report.js | 04 PRODUCT INTELLIGENCE ENGINE | 04 PRODUCT INTELLIGENCE ENGINE + Rule Pack/source documentation boundary | Unknown until human review | hardcoded/rule-pack-sensitive values possible; possible orphan / no incoming imports detected; possible duplicate / overlap candidate | CONSOLIDATE LATER | MEDIUM |
| vida-mujer-event-benefits-report.js | 04 PRODUCT INTELLIGENCE ENGINE | 04 PRODUCT INTELLIGENCE ENGINE + Rule Pack/source documentation boundary | Unknown until human review | hardcoded/rule-pack-sensitive values possible; possible orphan / no incoming imports detected | DELETE LATER ONLY IF PROVEN UNUSED | MEDIUM |
| vida-mujer-protected-diseases-engine.js | 04 PRODUCT INTELLIGENCE ENGINE | 04 PRODUCT INTELLIGENCE ENGINE + Rule Pack/source documentation boundary | Unknown until human review | possible duplicate / overlap candidate | CONSOLIDATE LATER | MEDIUM |
| vida-mujer-protected-diseases-report.js | 04 PRODUCT INTELLIGENCE ENGINE | 04 PRODUCT INTELLIGENCE ENGINE + Rule Pack/source documentation boundary | Unknown until human review | hardcoded/rule-pack-sensitive values possible; possible orphan / no incoming imports detected; possible duplicate / overlap candidate | CONSOLIDATE LATER | MEDIUM |
| vida-mujer-knowledge-extractor.js | 04 PRODUCT INTELLIGENCE ENGINE | 04 PRODUCT INTELLIGENCE ENGINE + Rule Pack/source documentation boundary | Unknown until human review | hardcoded/rule-pack-sensitive values possible; possible duplicate / overlap candidate | CONSOLIDATE LATER | MEDIUM |
| vida-mujer-knowledge-extractor-report.js | 04 PRODUCT INTELLIGENCE ENGINE | 04 PRODUCT INTELLIGENCE ENGINE + Rule Pack/source documentation boundary | Unknown until human review | hardcoded/rule-pack-sensitive values possible; possible orphan / no incoming imports detected; possible duplicate / overlap candidate | CONSOLIDATE LATER | MEDIUM |
| imagina-ser-scenario-engine.js | FORECAST INTELLIGENCE | 04 PRODUCT INTELLIGENCE ENGINE + Rule Pack/source documentation boundary | Economic Motivation, Business Planning, Advisor Experience | No immediate static risk detected. | KEEP | HIGH |
| imagina-ser-client-presentation-engine.js | FORECAST INTELLIGENCE | 04 PRODUCT INTELLIGENCE ENGINE + Rule Pack/source documentation boundary | Unknown until human review | hardcoded/rule-pack-sensitive values possible | DOCUMENT | MEDIUM |
| imagina-ser-ocr-extractor.js | 04 PRODUCT INTELLIGENCE ENGINE | 04 PRODUCT INTELLIGENCE ENGINE + Rule Pack/source documentation boundary | Unknown until human review | No immediate static risk detected. | KEEP | HIGH |
| segu-beca-meaningful-numbers-report.js | FORECAST INTELLIGENCE | 04 PRODUCT INTELLIGENCE ENGINE + Rule Pack/source documentation boundary | Unknown until human review | hardcoded/rule-pack-sensitive values possible; possible orphan / no incoming imports detected | DELETE LATER ONLY IF PROVEN UNUSED | MEDIUM |
| segu-beca-mxn-appendix-report.js | FORECAST INTELLIGENCE | 04 PRODUCT INTELLIGENCE ENGINE + Rule Pack/source documentation boundary | Unknown until human review | hardcoded/rule-pack-sensitive values possible; possible orphan / no incoming imports detected | DELETE LATER ONLY IF PROVEN UNUSED | MEDIUM |
| segu-beca-master-test.js | 04 PRODUCT INTELLIGENCE ENGINE | 04 PRODUCT INTELLIGENCE ENGINE + Rule Pack/source documentation boundary | Unknown until human review | hardcoded/rule-pack-sensitive values possible | DOCUMENT | MEDIUM |
| gmm-quote-parser.js | ECONOMIC MOTIVATION | 04 PRODUCT INTELLIGENCE ENGINE + Rule Pack/source documentation boundary | Unknown until human review | hardcoded/rule-pack-sensitive values possible | DOCUMENT | MEDIUM |
| gmm-out-of-pocket-engine.js | 04 PRODUCT INTELLIGENCE ENGINE | 04 PRODUCT INTELLIGENCE ENGINE + Rule Pack/source documentation boundary | Unknown until human review | hardcoded/rule-pack-sensitive values possible; possible duplicate / overlap candidate | CONSOLIDATE LATER | MEDIUM |
| orvi-event-engine.js | 04 PRODUCT INTELLIGENCE ENGINE | 04 PRODUCT INTELLIGENCE ENGINE + Rule Pack/source documentation boundary | Unknown until human review | No immediate static risk detected. | KEEP | HIGH |
| orvi-decision-engine.js | 04 PRODUCT INTELLIGENCE ENGINE | 04 PRODUCT INTELLIGENCE ENGINE + Rule Pack/source documentation boundary | Unknown until human review | hardcoded/rule-pack-sensitive values possible | DOCUMENT | MEDIUM |
| shared-ave-growth-engine.js | 04 PRODUCT INTELLIGENCE ENGINE | 04 PRODUCT INTELLIGENCE ENGINE + Rule Pack/source documentation boundary | Unknown until human review | possible duplicate / overlap candidate | CONSOLIDATE LATER | MEDIUM |
| shared-ave-growth-report.js | 04 PRODUCT INTELLIGENCE ENGINE | 04 PRODUCT INTELLIGENCE ENGINE + Rule Pack/source documentation boundary | Unknown until human review | hardcoded/rule-pack-sensitive values possible; possible orphan / no incoming imports detected; possible duplicate / overlap candidate | CONSOLIDATE LATER | MEDIUM |
| shared-clp-engine.js | SHARED COMMERCIAL MODEL | 04 PRODUCT INTELLIGENCE ENGINE + Rule Pack/source documentation boundary | Unknown until human review | possible duplicate / overlap candidate | CONSOLIDATE LATER | MEDIUM |
| smnyl-productos-gmm.js | 04 PRODUCT INTELLIGENCE ENGINE | 04 PRODUCT INTELLIGENCE ENGINE + Rule Pack/source documentation boundary | Unknown until human review | hardcoded/rule-pack-sensitive values possible; carrier-specific boundary review | DOCUMENT | MEDIUM |
| smnyl-productos-vida.js | COMPENSATION INTELLIGENCE | 04 PRODUCT INTELLIGENCE ENGINE + Rule Pack/source documentation boundary | Unknown until human review | hardcoded/rule-pack-sensitive values possible; carrier-specific boundary review | DOCUMENT | MEDIUM |

### Decision

Apply the conflict rule for Product Intelligence + SMNYL/Product-specific hardcoded values. No physical refactor is approved. Decisions indicate what can be considered later after validation.

### Guardrail

Product Intelligence may hold documented product truth. Product-specific values require source documents and must not become unverified official formulas.

### Required Before Refactor

- Owner decision recorded.
- Relevant tests identified or created in a later approved implementation phase.
- Fixtures/source documents available where business rules exist.
- Rollback plan defined.
- No movement without import graph validation.

### Final Status

PARTIALLY DECIDED / NO CODE CHANGE

## Conflict Area: Policy & Sales Operations / Cartera

### Context

Policy & Sales Operations owns policy lifecycle. Shared Core owns generic validators/normalizers. Evidence & Provenance owns source tracking/human review. UI must not own business truth.

### Modules Reviewed

| Module | Current Branch | Suspected Owner | Secondary Consumers | Risk | Decision | Confidence |
|---|---|---|---|---|---|---|
| cartera.js | 07 POLICY & SALES OPERATIONS | 07 POLICY & SALES OPERATIONS, with Shared Core/Evidence consumers when generic | Conservation Intelligence, Compensation Intelligence, Advisor Experience | hardcoded/rule-pack-sensitive values possible; possible duplicate / overlap candidate; large file | DO NOT TOUCH | MEDIUM |
| cartera-view.js | 07 POLICY & SALES OPERATIONS | 07 POLICY & SALES OPERATIONS, with Shared Core/Evidence consumers when generic | Conservation Intelligence, Compensation Intelligence, Advisor Experience | hardcoded/rule-pack-sensitive values possible; possible orphan / no incoming imports detected; possible duplicate / overlap candidate; large file; UI/business interpretation boundary review | DO NOT TOUCH | MEDIUM |
| cartera-service.js | 07 POLICY & SALES OPERATIONS | 07 POLICY & SALES OPERATIONS, with Shared Core/Evidence consumers when generic | Conservation Intelligence, Compensation Intelligence, Advisor Experience | No immediate static risk detected. | KEEP | HIGH |
| cartera-repository.js | 07 POLICY & SALES OPERATIONS | 07 POLICY & SALES OPERATIONS, with Shared Core/Evidence consumers when generic | Conservation Intelligence, Compensation Intelligence, Advisor Experience | possible orphan / no incoming imports detected | DELETE LATER ONLY IF PROVEN UNUSED | MEDIUM |
| cartera-normalizer.js | SHARED CORE | 07 POLICY & SALES OPERATIONS, with Shared Core/Evidence consumers when generic | Conservation Intelligence, Compensation Intelligence, Advisor Experience | No immediate static risk detected. | KEEP | HIGH |
| cartera-validator.js | 10 PLATFORM SERVICES | 07 POLICY & SALES OPERATIONS, with Shared Core/Evidence consumers when generic | Conservation Intelligence, Compensation Intelligence, Advisor Experience | No immediate static risk detected. | KEEP | HIGH |
| cartera-state.js | SHARED CORE | 07 POLICY & SALES OPERATIONS, with Shared Core/Evidence consumers when generic | Conservation Intelligence, Compensation Intelligence, Advisor Experience | No immediate static risk detected. | KEEP | HIGH |
| cartera-events.js | 07 POLICY & SALES OPERATIONS | 07 POLICY & SALES OPERATIONS, with Shared Core/Evidence consumers when generic | Conservation Intelligence, Compensation Intelligence, Advisor Experience | No immediate static risk detected. | KEEP | HIGH |
| cartera-utils.js | PERIODSNAPSHOT / OPERATIONAL CLOCKS | 07 POLICY & SALES OPERATIONS, with Shared Core/Evidence consumers when generic | Conservation Intelligence, Compensation Intelligence, Advisor Experience | No immediate static risk detected. | KEEP | HIGH |
| cartera-import-engine.js | 07 POLICY & SALES OPERATIONS | 07 POLICY & SALES OPERATIONS, with Shared Core/Evidence consumers when generic | Conservation Intelligence, Compensation Intelligence, Advisor Experience | possible orphan / no incoming imports detected | DELETE LATER ONLY IF PROVEN UNUSED | MEDIUM |
| policy-detail-engine.js | 07 POLICY & SALES OPERATIONS | 07 POLICY & SALES OPERATIONS, with Shared Core/Evidence consumers when generic | Conservation Intelligence, Compensation Intelligence, Advisor Experience | possible orphan / no incoming imports detected; possible duplicate / overlap candidate | CONSOLIDATE LATER | MEDIUM |
| policy-timeline-engine.js | 07 POLICY & SALES OPERATIONS | 07 POLICY & SALES OPERATIONS, with Shared Core/Evidence consumers when generic | Conservation Intelligence, Compensation Intelligence, Advisor Experience | possible duplicate / overlap candidate | CONSOLIDATE LATER | MEDIUM |
| policy-renewal-engine.js | CONSERVATION INTELLIGENCE | 07 POLICY & SALES OPERATIONS, with Shared Core/Evidence consumers when generic | Conservation Intelligence, Compensation Intelligence, Advisor Experience | No immediate static risk detected. | KEEP | HIGH |
| policy-risk-engine.js | 07 POLICY & SALES OPERATIONS | 07 POLICY & SALES OPERATIONS, with Shared Core/Evidence consumers when generic | Conservation Intelligence, Compensation Intelligence, Advisor Experience | hardcoded/rule-pack-sensitive values possible; possible orphan / no incoming imports detected; possible duplicate / overlap candidate | CONSOLIDATE LATER | MEDIUM |
| policy-followup-engine.js | 05 RELATIONSHIP INTELLIGENCE ENGINE | 07 POLICY & SALES OPERATIONS, with Shared Core/Evidence consumers when generic | Conservation Intelligence, Compensation Intelligence, Advisor Experience, Sales Conversion, Manager Intelligence | possible orphan / no incoming imports detected; possible duplicate / overlap candidate | CONSOLIDATE LATER | MEDIUM |
| policy-storage-engine.js | 10 PLATFORM SERVICES | 07 POLICY & SALES OPERATIONS, with Shared Core/Evidence consumers when generic | Conservation Intelligence, Compensation Intelligence, Advisor Experience | possible orphan / no incoming imports detected; possible duplicate / overlap candidate | CONSOLIDATE LATER | MEDIUM |
| mass-import-preview-engine.js | 07 POLICY & SALES OPERATIONS | 07 POLICY & SALES OPERATIONS, with Shared Core/Evidence consumers when generic | Unknown until human review | hardcoded/rule-pack-sensitive values possible; possible orphan / no incoming imports detected | DELETE LATER ONLY IF PROVEN UNUSED | MEDIUM |
| mass-import-validation-engine.js | COMPENSATION INTELLIGENCE | 07 POLICY & SALES OPERATIONS, with Shared Core/Evidence consumers when generic | Unknown until human review | possible orphan / no incoming imports detected | DELETE LATER ONLY IF PROVEN UNUSED | MEDIUM |
| mass-import-mapping-engine.js | 07 POLICY & SALES OPERATIONS | 07 POLICY & SALES OPERATIONS, with Shared Core/Evidence consumers when generic | Unknown until human review | possible orphan / no incoming imports detected | DELETE LATER ONLY IF PROVEN UNUSED | MEDIUM |
| mass-import-dashboard-engine.js | NOT DETECTED | 07 POLICY & SALES OPERATIONS, with Shared Core/Evidence consumers when generic | Unknown until human review | source module not detected in Phase 1 map | REVIEW REQUIRED | LOW |
| staging-review-engine.js | EVIDENCE & PROVENANCE | 07 POLICY & SALES OPERATIONS, with Shared Core/Evidence consumers when generic | Conservation Intelligence, Compensation Intelligence, Advisor Experience | possible orphan / no incoming imports detected | MOVE LATER | MEDIUM |
| policy-human-review-engine.js | EVIDENCE & PROVENANCE | 07 POLICY & SALES OPERATIONS, with Shared Core/Evidence consumers when generic | Conservation Intelligence, Compensation Intelligence, Advisor Experience | possible orphan / no incoming imports detected | MOVE LATER | MEDIUM |

### Decision

Apply the conflict rule for Policy & Sales Operations / Cartera. No physical refactor is approved. Decisions indicate what can be considered later after validation.

### Guardrail

Policy & Sales Operations owns policy lifecycle. Shared Core owns generic validators/normalizers. Evidence & Provenance owns source tracking/human review. UI must not own business truth.

### Required Before Refactor

- Owner decision recorded.
- Relevant tests identified or created in a later approved implementation phase.
- Fixtures/source documents available where business rules exist.
- Rollback plan defined.
- No movement without import graph validation.

### Final Status

PARTIALLY DECIDED / NO CODE CHANGE

## Conflict Area: Advisor Experience / UI vs Business Truth

### Context

Advisor Experience can show, explain and guide. It must not calculate or own business truth. UI modules with metrics need split/review.

### Modules Reviewed

| Module | Current Branch | Suspected Owner | Secondary Consumers | Risk | Decision | Confidence |
|---|---|---|---|---|---|---|
| dashboard-executive.js | 12 ADVISOR EXPERIENCE INTELLIGENCE | 12 ADVISOR EXPERIENCE INTELLIGENCE / UI consumer only | Unknown until human review | hardcoded/rule-pack-sensitive values possible; possible orphan / no incoming imports detected; UI/business interpretation boundary review | DELETE LATER ONLY IF PROVEN UNUSED | MEDIUM |
| dashboard.js | 10 PLATFORM SERVICES | 12 ADVISOR EXPERIENCE INTELLIGENCE / UI consumer only | Unknown until human review | hardcoded/rule-pack-sensitive values possible; large file; UI/business interpretation boundary review | DO NOT TOUCH | MEDIUM |
| predictive-dashboard.tsx | 12 ADVISOR EXPERIENCE INTELLIGENCE | 12 ADVISOR EXPERIENCE INTELLIGENCE / UI consumer only | Unknown until human review | possible orphan / no incoming imports detected | DELETE LATER ONLY IF PROVEN UNUSED | MEDIUM |
| dashboard-widget-card.tsx | 12 ADVISOR EXPERIENCE INTELLIGENCE | 12 ADVISOR EXPERIENCE INTELLIGENCE / UI consumer only | Unknown until human review | No immediate static risk detected. | KEEP | HIGH |
| ai-orb-widget.js | 12 ADVISOR EXPERIENCE INTELLIGENCE | 12 ADVISOR EXPERIENCE INTELLIGENCE / UI consumer only | Unknown until human review | possible orphan / no incoming imports detected | DELETE LATER ONLY IF PROVEN UNUSED | MEDIUM |
| live-dashboard-engine.js | 12 ADVISOR EXPERIENCE INTELLIGENCE | 12 ADVISOR EXPERIENCE INTELLIGENCE / UI consumer only | Unknown until human review | possible orphan / no incoming imports detected | DELETE LATER ONLY IF PROVEN UNUSED | MEDIUM |
| team-dashboard-engine.js | 12 ADVISOR EXPERIENCE INTELLIGENCE | 12 ADVISOR EXPERIENCE INTELLIGENCE / UI consumer only | Unknown until human review | possible orphan / no incoming imports detected | DELETE LATER ONLY IF PROVEN UNUSED | MEDIUM |
| smart-header.tsx | 12 ADVISOR EXPERIENCE INTELLIGENCE | 12 ADVISOR EXPERIENCE INTELLIGENCE / UI consumer only | Unknown until human review | possible orphan / no incoming imports detected | DELETE LATER ONLY IF PROVEN UNUSED | MEDIUM |
| operational-button.tsx | 07 POLICY & SALES OPERATIONS | 12 ADVISOR EXPERIENCE INTELLIGENCE / UI consumer only | Unknown until human review | possible orphan / no incoming imports detected; UI/business interpretation boundary review | DELETE LATER ONLY IF PROVEN UNUSED | MEDIUM |
| policy-review-ui-engine.js | COMPENSATION INTELLIGENCE | 07 POLICY & SALES OPERATIONS, with Shared Core/Evidence consumers when generic | Conservation Intelligence, Compensation Intelligence, Advisor Experience | possible orphan / no incoming imports detected; UI/business interpretation boundary review | DELETE LATER ONLY IF PROVEN UNUSED | MEDIUM |
| first-contact-dashboard.viewmodel.js | 02 SALES CONVERSION ENGINE | 12 ADVISOR EXPERIENCE INTELLIGENCE / UI consumer only | Unknown until human review | possible orphan / no incoming imports detected | DELETE LATER ONLY IF PROVEN UNUSED | MEDIUM |

### Decision

Apply the conflict rule for Advisor Experience / UI vs Business Truth. No physical refactor is approved. Decisions indicate what can be considered later after validation.

### Guardrail

Advisor Experience can show, explain and guide. It must not calculate or own business truth. UI modules with metrics need split/review.

### Required Before Refactor

- Owner decision recorded.
- Relevant tests identified or created in a later approved implementation phase.
- Fixtures/source documents available where business rules exist.
- Rollback plan defined.
- No movement without import graph validation.

### Final Status

PARTIALLY DECIDED / NO CODE CHANGE

## Conflict Area: Forecast / Projection vs Economic Motivation / Product Intelligence

### Context

Forecast owns scenarios, projection interpretation, risk and confidence. Economic Motivation explains money meaning only with evidence/rules. Product Intelligence owns product truth. No rate without source.

### Modules Reviewed

| Module | Current Branch | Suspected Owner | Secondary Consumers | Risk | Decision | Confidence |
|---|---|---|---|---|---|---|
| projection-engine.js | FORECAST INTELLIGENCE | FORECAST INTELLIGENCE, with Economic Motivation/Product Intelligence consumers | Economic Motivation, Business Planning, Advisor Experience | No immediate static risk detected. | DO NOT TOUCH | HIGH |
| dynamic-cash-value-projection-engine.js | FORECAST INTELLIGENCE | FORECAST INTELLIGENCE, with Economic Motivation/Product Intelligence consumers | Economic Motivation, Business Planning, Advisor Experience | No immediate static risk detected. | DO NOT TOUCH | HIGH |
| projection-milestone-engine.js | FORECAST INTELLIGENCE | FORECAST INTELLIGENCE, with Economic Motivation/Product Intelligence consumers | Economic Motivation, Business Planning, Advisor Experience | No immediate static risk detected. | KEEP | HIGH |
| shared-currency-projection-engine.js | FORECAST INTELLIGENCE | FORECAST INTELLIGENCE, with Economic Motivation/Product Intelligence consumers | Economic Motivation, Business Planning, Advisor Experience | No immediate static risk detected. | DO NOT TOUCH | HIGH |
| future-currency-value-engine.js | FORECAST INTELLIGENCE | FORECAST INTELLIGENCE, with Economic Motivation/Product Intelligence consumers | Economic Motivation, Business Planning, Advisor Experience | No immediate static risk detected. | KEEP | HIGH |
| shared-projection-scenarios-engine.js | FORECAST INTELLIGENCE | FORECAST INTELLIGENCE, with Economic Motivation/Product Intelligence consumers | Economic Motivation, Business Planning, Advisor Experience | No immediate static risk detected. | KEEP | HIGH |
| shared-meaningful-numbers-engine.js | FORECAST INTELLIGENCE | FORECAST INTELLIGENCE | Unknown until human review | No immediate static risk detected. | KEEP | HIGH |
| life-expectancy-projection-engine.js | FORECAST INTELLIGENCE | FORECAST INTELLIGENCE, with Economic Motivation/Product Intelligence consumers | Economic Motivation, Business Planning, Advisor Experience | possible orphan / no incoming imports detected | DELETE LATER ONLY IF PROVEN UNUSED | MEDIUM |
| retirement-presentation-scenario-engine.js | 02 SALES CONVERSION ENGINE | FORECAST INTELLIGENCE, with Economic Motivation/Product Intelligence consumers | Economic Motivation, Business Planning, Advisor Experience | No immediate static risk detected. | KEEP | HIGH |
| segu-beca-mxn-appendix-report.js | FORECAST INTELLIGENCE | 04 PRODUCT INTELLIGENCE ENGINE + Rule Pack/source documentation boundary | Unknown until human review | hardcoded/rule-pack-sensitive values possible; possible orphan / no incoming imports detected | DELETE LATER ONLY IF PROVEN UNUSED | MEDIUM |
| segu-beca-mxn-timeline-clean-report.js | 10 PLATFORM SERVICES | 04 PRODUCT INTELLIGENCE ENGINE + Rule Pack/source documentation boundary | Unknown until human review | possible orphan / no incoming imports detected | DELETE LATER ONLY IF PROVEN UNUSED | MEDIUM |
| imagina-ser-scenario-engine.js | FORECAST INTELLIGENCE | 04 PRODUCT INTELLIGENCE ENGINE + Rule Pack/source documentation boundary | Economic Motivation, Business Planning, Advisor Experience | No immediate static risk detected. | KEEP | HIGH |
| orvi-wait-vs-cancel-engine.js | FORECAST INTELLIGENCE | 04 PRODUCT INTELLIGENCE ENGINE + Rule Pack/source documentation boundary | Unknown until human review | No immediate static risk detected. | KEEP | HIGH |
| smnyl-forecast-engine.js | FORECAST INTELLIGENCE | FORECAST INTELLIGENCE, with Economic Motivation/Product Intelligence consumers | Economic Motivation, Business Planning, Advisor Experience | carrier-specific boundary review | DOCUMENT | MEDIUM |

### Decision

Apply the conflict rule for Forecast / Projection vs Economic Motivation / Product Intelligence. No physical refactor is approved. Decisions indicate what can be considered later after validation.

### Guardrail

Forecast owns scenarios, projection interpretation, risk and confidence. Economic Motivation explains money meaning only with evidence/rules. Product Intelligence owns product truth. No rate without source.

### Required Before Refactor

- Owner decision recorded.
- Relevant tests identified or created in a later approved implementation phase.
- Fixtures/source documents available where business rules exist.
- Rollback plan defined.
- No movement without import graph validation.

### Final Status

PARTIALLY DECIDED / NO CODE CHANGE

## Conflict Area: Nash / Sales Conversion / Followup / Objections duplicates

### Context

Sales Conversion owns workflow. Nash owns conversation intelligence. Policy Followup owns policy operational followup. Performance must not duplicate Mick/Productivity/Manager boundaries.

### Modules Reviewed

| Module | Current Branch | Suspected Owner | Secondary Consumers | Risk | Decision | Confidence |
|---|---|---|---|---|---|---|
| followup-engine.js | 07 POLICY & SALES OPERATIONS | Nash Conversation Intelligence or Sales Conversion depending on workflow vs language role | Sales Conversion, Advisor Experience, Manager Intelligence | possible duplicate / overlap candidate | CONSOLIDATE LATER | MEDIUM |
| nash-followup-engine.js | 05 RELATIONSHIP INTELLIGENCE ENGINE | Nash Conversation Intelligence or Sales Conversion depending on workflow vs language role | Sales Conversion, Advisor Experience, Manager Intelligence | possible duplicate / overlap candidate | CONSOLIDATE LATER | MEDIUM |
| policy-followup-engine.js | 05 RELATIONSHIP INTELLIGENCE ENGINE | 07 POLICY & SALES OPERATIONS, with Shared Core/Evidence consumers when generic | Conservation Intelligence, Compensation Intelligence, Advisor Experience, Sales Conversion, Manager Intelligence | possible orphan / no incoming imports detected; possible duplicate / overlap candidate | CONSOLIDATE LATER | MEDIUM |
| smnyl-followup-engine.js | 07 POLICY & SALES OPERATIONS | Nash Conversation Intelligence or Sales Conversion depending on workflow vs language role | Sales Conversion, Advisor Experience, Manager Intelligence | carrier-specific boundary review; possible duplicate / overlap candidate | CONSOLIDATE LATER | MEDIUM |
| objection-battle-engine.js | 03 NASH CONVERSATION INTELLIGENCE | Nash Conversation Intelligence or Sales Conversion depending on workflow vs language role | Sales Conversion, Advisor Experience, Manager Intelligence | possible orphan / no incoming imports detected | DELETE LATER ONLY IF PROVEN UNUSED | MEDIUM |
| objection-classifier-engine.js | 03 NASH CONVERSATION INTELLIGENCE | Nash Conversation Intelligence or Sales Conversion depending on workflow vs language role | Sales Conversion, Advisor Experience, Manager Intelligence | possible orphan / no incoming imports detected | DELETE LATER ONLY IF PROVEN UNUSED | MEDIUM |
| objection-intent-engine.js | 03 NASH CONVERSATION INTELLIGENCE | Nash Conversation Intelligence or Sales Conversion depending on workflow vs language role | Sales Conversion, Advisor Experience, Manager Intelligence | possible orphan / no incoming imports detected | DELETE LATER ONLY IF PROVEN UNUSED | MEDIUM |
| objection-memory-engine.js | 03 NASH CONVERSATION INTELLIGENCE | Nash Conversation Intelligence or Sales Conversion depending on workflow vs language role | Sales Conversion, Advisor Experience, Manager Intelligence | possible orphan / no incoming imports detected | DELETE LATER ONLY IF PROVEN UNUSED | MEDIUM |
| objection-prompt-builder.js | 03 NASH CONVERSATION INTELLIGENCE | 12 ADVISOR EXPERIENCE INTELLIGENCE / UI consumer only | Sales Conversion, Advisor Experience, Manager Intelligence | possible orphan / no incoming imports detected | DELETE LATER ONLY IF PROVEN UNUSED | MEDIUM |
| close-readiness-engine.js | SHARED CORE | Nash Conversation Intelligence or Sales Conversion depending on workflow vs language role | Unknown until human review | hardcoded/rule-pack-sensitive values possible; possible orphan / no incoming imports detected | DELETE LATER ONLY IF PROVEN UNUSED | MEDIUM |
| close-strategy-engine.js | 02 SALES CONVERSION ENGINE | Nash Conversation Intelligence or Sales Conversion depending on workflow vs language role | Unknown until human review | possible orphan / no incoming imports detected | DELETE LATER ONLY IF PROVEN UNUSED | MEDIUM |
| close-prompt-builder.js | 03 NASH CONVERSATION INTELLIGENCE | 12 ADVISOR EXPERIENCE INTELLIGENCE / UI consumer only | Sales Conversion, Advisor Experience, Manager Intelligence | possible orphan / no incoming imports detected | DELETE LATER ONLY IF PROVEN UNUSED | MEDIUM |
| first-contact-script-engine.js | 02 SALES CONVERSION ENGINE | Nash Conversation Intelligence or Sales Conversion depending on workflow vs language role | Unknown until human review | possible orphan / no incoming imports detected | DELETE LATER ONLY IF PROVEN UNUSED | MEDIUM |
| first-contact-ai-suggestion-engine.js | 05 RELATIONSHIP INTELLIGENCE ENGINE | Nash Conversation Intelligence or Sales Conversion depending on workflow vs language role | Unknown until human review | possible orphan / no incoming imports detected | DELETE LATER ONLY IF PROVEN UNUSED | MEDIUM |
| adaptive-message-builder.js | 02 SALES CONVERSION ENGINE | 12 ADVISOR EXPERIENCE INTELLIGENCE / UI consumer only | Unknown until human review | possible orphan / no incoming imports detected | DELETE LATER ONLY IF PROVEN UNUSED | MEDIUM |
| adaptive-outreach-prompt-builder.js | 02 SALES CONVERSION ENGINE | 12 ADVISOR EXPERIENCE INTELLIGENCE / UI consumer only | Sales Conversion, Advisor Experience, Manager Intelligence | possible orphan / no incoming imports detected | DELETE LATER ONLY IF PROVEN UNUSED | MEDIUM |
| outreach-prompt-builder.js | 02 SALES CONVERSION ENGINE | 12 ADVISOR EXPERIENCE INTELLIGENCE / UI consumer only | Sales Conversion, Advisor Experience, Manager Intelligence | possible orphan / no incoming imports detected | DELETE LATER ONLY IF PROVEN UNUSED | MEDIUM |
| referral-prompt-builder.js | 03 NASH CONVERSATION INTELLIGENCE | 12 ADVISOR EXPERIENCE INTELLIGENCE / UI consumer only | Sales Conversion, Advisor Experience, Manager Intelligence | possible orphan / no incoming imports detected | DELETE LATER ONLY IF PROVEN UNUSED | MEDIUM |
| ghosting-prompt-builder.js | 03 NASH CONVERSATION INTELLIGENCE | 12 ADVISOR EXPERIENCE INTELLIGENCE / UI consumer only | Sales Conversion, Advisor Experience, Manager Intelligence | possible orphan / no incoming imports detected | DELETE LATER ONLY IF PROVEN UNUSED | MEDIUM |
| buying-signals-engine.js | PERIODSNAPSHOT / OPERATIONAL CLOCKS | PERIODSNAPSHOT / OPERATIONAL CLOCKS | Unknown until human review | possible orphan / no incoming imports detected | DELETE LATER ONLY IF PROVEN UNUSED | MEDIUM |
| sales-dna-match-engine.js | 02 SALES CONVERSION ENGINE | Nash Conversation Intelligence or Sales Conversion depending on workflow vs language role | Unknown until human review | hardcoded/rule-pack-sensitive values possible; possible orphan / no incoming imports detected | DELETE LATER ONLY IF PROVEN UNUSED | MEDIUM |
| sales-dna-insight-engine.js | 02 SALES CONVERSION ENGINE | Nash Conversation Intelligence or Sales Conversion depending on workflow vs language role | Unknown until human review | possible orphan / no incoming imports detected | DELETE LATER ONLY IF PROVEN UNUSED | MEDIUM |
| sales-dna-recommendation-engine.js | 02 SALES CONVERSION ENGINE | Nash Conversation Intelligence or Sales Conversion depending on workflow vs language role | Unknown until human review | possible orphan / no incoming imports detected | DELETE LATER ONLY IF PROVEN UNUSED | MEDIUM |
| nash-advisor-performance-engine.js | 03 NASH CONVERSATION INTELLIGENCE | Nash Conversation Intelligence or Sales Conversion depending on workflow vs language role | Sales Conversion, Advisor Experience, Manager Intelligence | hardcoded/rule-pack-sensitive values possible; possible duplicate / overlap candidate | CONSOLIDATE LATER | MEDIUM |
| advisor-performance-engine.js | SHARED CORE | SHARED CORE | Unknown until human review | hardcoded/rule-pack-sensitive values possible; possible duplicate / overlap candidate | CONSOLIDATE LATER | MEDIUM |

### Decision

Apply the conflict rule for Nash / Sales Conversion / Followup / Objections duplicates. No physical refactor is approved. Decisions indicate what can be considered later after validation.

### Guardrail

Sales Conversion owns workflow. Nash owns conversation intelligence. Policy Followup owns policy operational followup. Performance must not duplicate Mick/Productivity/Manager boundaries.

### Required Before Refactor

- Owner decision recorded.
- Relevant tests identified or created in a later approved implementation phase.
- Fixtures/source documents available where business rules exist.
- Rollback plan defined.
- No movement without import graph validation.

### Final Status

PARTIALLY DECIDED / NO CODE CHANGE

## Conflict Area: Recruitment / Candidate / Advisor Development

### Context

Recruitment owns candidate flow and assessment. Advisor Development owns signed advisor transformation. Coachability may continue post-contract and should be treated as shared signal candidate.

### Modules Reviewed

| Module | Current Branch | Suspected Owner | Secondary Consumers | Risk | Decision | Confidence |
|---|---|---|---|---|---|---|
| candidate-assessment-engine.js | 08 MANAGER & TEAM INTELLIGENCE | 08 MANAGER & TEAM INTELLIGENCE / Recruitment or Advisor Development | Recruitment Intelligence, Advisor Development, Partner Intelligence | hardcoded/rule-pack-sensitive values possible; possible duplicate / overlap candidate | CONSOLIDATE LATER | MEDIUM |
| candidate-hard-factors-engine.js | 10 PLATFORM SERVICES | 08 MANAGER & TEAM INTELLIGENCE / Recruitment or Advisor Development | Recruitment Intelligence, Advisor Development, Partner Intelligence | hardcoded/rule-pack-sensitive values possible; possible duplicate / overlap candidate | CONSOLIDATE LATER | MEDIUM |
| candidate-vital-factors-engine.js | SHARED CORE | 08 MANAGER & TEAM INTELLIGENCE / Recruitment or Advisor Development | Recruitment Intelligence, Advisor Development, Partner Intelligence | hardcoded/rule-pack-sensitive values possible; possible duplicate / overlap candidate | CONSOLIDATE LATER | MEDIUM |
| candidate-market-quality-engine.js | SHARED CORE | 08 MANAGER & TEAM INTELLIGENCE / Recruitment or Advisor Development | Recruitment Intelligence, Advisor Development, Partner Intelligence | hardcoded/rule-pack-sensitive values possible; possible duplicate / overlap candidate | CONSOLIDATE LATER | MEDIUM |
| candidate-coachability-engine.js | SHARED CORE | 08 MANAGER & TEAM INTELLIGENCE / Recruitment or Advisor Development | Recruitment Intelligence, Advisor Development, Partner Intelligence | hardcoded/rule-pack-sensitive values possible; possible duplicate / overlap candidate | CONSOLIDATE LATER | MEDIUM |
| candidate-assessment-master-test.js | 08 MANAGER & TEAM INTELLIGENCE | 08 MANAGER & TEAM INTELLIGENCE / Recruitment or Advisor Development | Recruitment Intelligence, Advisor Development, Partner Intelligence | possible duplicate / overlap candidate | CONSOLIDATE LATER | MEDIUM |
| candidate-hard-factors-master-test.js | EVIDENCE & PROVENANCE | 08 MANAGER & TEAM INTELLIGENCE / Recruitment or Advisor Development | Recruitment Intelligence, Advisor Development, Partner Intelligence | hardcoded/rule-pack-sensitive values possible; possible duplicate / overlap candidate | CONSOLIDATE LATER | MEDIUM |
| candidate-vital-factors-master-test.js | EVIDENCE & PROVENANCE | 08 MANAGER & TEAM INTELLIGENCE / Recruitment or Advisor Development | Recruitment Intelligence, Advisor Development, Partner Intelligence | hardcoded/rule-pack-sensitive values possible; possible duplicate / overlap candidate | CONSOLIDATE LATER | MEDIUM |
| candidate-market-quality-master-test.js | 08 MANAGER & TEAM INTELLIGENCE | 08 MANAGER & TEAM INTELLIGENCE / Recruitment or Advisor Development | Recruitment Intelligence, Advisor Development, Partner Intelligence | hardcoded/rule-pack-sensitive values possible; possible duplicate / overlap candidate | CONSOLIDATE LATER | MEDIUM |
| candidate-coachability-master-test.js | 08 MANAGER & TEAM INTELLIGENCE | 08 MANAGER & TEAM INTELLIGENCE / Recruitment or Advisor Development | Recruitment Intelligence, Advisor Development, Partner Intelligence | hardcoded/rule-pack-sensitive values possible; possible duplicate / overlap candidate | CONSOLIDATE LATER | MEDIUM |
| precontract-activity-fixture-test.js | EVIDENCE & PROVENANCE | 08 MANAGER & TEAM INTELLIGENCE / Recruitment or Advisor Development | Recruitment Intelligence, Advisor Development, Partner Intelligence | No immediate static risk detected. | KEEP | HIGH |

### Decision

Apply the conflict rule for Recruitment / Candidate / Advisor Development. No physical refactor is approved. Decisions indicate what can be considered later after validation.

### Guardrail

Recruitment owns candidate flow and assessment. Advisor Development owns signed advisor transformation. Coachability may continue post-contract and should be treated as shared signal candidate.

### Required Before Refactor

- Owner decision recorded.
- Relevant tests identified or created in a later approved implementation phase.
- Fixtures/source documents available where business rules exist.
- Rollback plan defined.
- No movement without import graph validation.

### Final Status

PARTIALLY DECIDED / NO CODE CHANGE

## Conflict Area: Unknown / Needs Review

### Context

Unknown modules stay REVIEW REQUIRED. Do not delete or move. Classify likely owner only when evidence is strong.

### Modules Reviewed

| Module | Current Branch | Suspected Owner | Secondary Consumers | Risk | Decision | Confidence |
|---|---|---|---|---|---|---|
| virtual-list.js | UNKNOWN / NEEDS REVIEW | UNKNOWN / NEEDS REVIEW | Unknown until human review | unknown / needs review; possible orphan / no incoming imports detected; possible duplicate / overlap candidate | REVIEW REQUIRED | LOW |
| center-of-influence-engine.js | UNKNOWN / NEEDS REVIEW | 05 RELATIONSHIP INTELLIGENCE ENGINE or 02 SALES CONVERSION ENGINE; review required | Unknown until human review | unknown / needs review; possible orphan / no incoming imports detected | REVIEW REQUIRED | LOW |
| clipboard-action-engine.js | UNKNOWN / NEEDS REVIEW | 09 UNIVERSAL COMMAND OS / action infrastructure or Sales Conversion channel support; review required | Unknown until human review | unknown / needs review; possible orphan / no incoming imports detected | REVIEW REQUIRED | LOW |
| phone-call-engine.js | UNKNOWN / NEEDS REVIEW | 09 UNIVERSAL COMMAND OS / action infrastructure or Sales Conversion channel support; review required | Unknown until human review | unknown / needs review; possible orphan / no incoming imports detected | REVIEW REQUIRED | LOW |
| referral-color-engine.js | UNKNOWN / NEEDS REVIEW | 05 RELATIONSHIP INTELLIGENCE ENGINE or 02 SALES CONVERSION ENGINE; review required | Unknown until human review | unknown / needs review; possible orphan / no incoming imports detected | REVIEW REQUIRED | LOW |
| referral-priority-engine.js | UNKNOWN / NEEDS REVIEW | 05 RELATIONSHIP INTELLIGENCE ENGINE or 02 SALES CONVERSION ENGINE; review required | Unknown until human review | unknown / needs review; possible orphan / no incoming imports detected | REVIEW REQUIRED | LOW |
| referral-temperature-engine.js | UNKNOWN / NEEDS REVIEW | 05 RELATIONSHIP INTELLIGENCE ENGINE or 02 SALES CONVERSION ENGINE; review required | Unknown until human review | unknown / needs review; possible orphan / no incoming imports detected | REVIEW REQUIRED | LOW |
| schema-field-engine.js | UNKNOWN / NEEDS REVIEW | UNKNOWN / NEEDS REVIEW | Unknown until human review | unknown / needs review; possible orphan / no incoming imports detected | REVIEW REQUIRED | LOW |
| seen-but-no-reply-engine.js | UNKNOWN / NEEDS REVIEW | UNKNOWN / NEEDS REVIEW | Unknown until human review | unknown / needs review; possible orphan / no incoming imports detected | REVIEW REQUIRED | LOW |
| universal-filters-engine.js | UNKNOWN / NEEDS REVIEW | UNKNOWN / NEEDS REVIEW | Unknown until human review | unknown / needs review; possible orphan / no incoming imports detected | REVIEW REQUIRED | LOW |
| whatsapp-action-engine.js | UNKNOWN / NEEDS REVIEW | 09 UNIVERSAL COMMAND OS / action infrastructure or Sales Conversion channel support; review required | Unknown until human review | unknown / needs review; possible orphan / no incoming imports detected | REVIEW REQUIRED | LOW |
| whatsapp-link-engine.js | UNKNOWN / NEEDS REVIEW | 09 UNIVERSAL COMMAND OS / action infrastructure or Sales Conversion channel support; review required | Unknown until human review | unknown / needs review; possible orphan / no incoming imports detected | REVIEW REQUIRED | LOW |
| event-system.js | UNKNOWN / NEEDS REVIEW | 10 PLATFORM SERVICES or SHARED CORE event infrastructure | Unknown until human review | unknown / needs review | DO NOT TOUCH | LOW |
| question-style-match-engine.js | UNKNOWN / NEEDS REVIEW | UNKNOWN / NEEDS REVIEW | Unknown until human review | unknown / needs review | REVIEW REQUIRED | LOW |
| shared-client-language-engine.js | UNKNOWN / NEEDS REVIEW | UNKNOWN / NEEDS REVIEW | Unknown until human review | unknown / needs review | REVIEW REQUIRED | LOW |
| shared-financial-return-engine.js | UNKNOWN / NEEDS REVIEW | UNKNOWN / NEEDS REVIEW | Unknown until human review | unknown / needs review | REVIEW REQUIRED | LOW |
| shared-protection-efficiency-engine.js | UNKNOWN / NEEDS REVIEW | UNKNOWN / NEEDS REVIEW | Unknown until human review | unknown / needs review | REVIEW REQUIRED | LOW |
| shared-recovery-analysis-engine.js | UNKNOWN / NEEDS REVIEW | UNKNOWN / NEEDS REVIEW | Unknown until human review | unknown / needs review | REVIEW REQUIRED | LOW |

### Decision

Apply the conflict rule for Unknown / Needs Review. No physical refactor is approved. Decisions indicate what can be considered later after validation.

### Guardrail

Unknown modules stay REVIEW REQUIRED. Do not delete or move. Classify likely owner only when evidence is strong.

### Required Before Refactor

- Owner decision recorded.
- Relevant tests identified or created in a later approved implementation phase.
- Fixtures/source documents available where business rules exist.
- Rollback plan defined.
- No movement without import graph validation.

### Final Status

PARTIALLY DECIDED / NO CODE CHANGE

## Module Decision Table

Full table: FORGE_PHASE_2_1_MODULE_DECISION_TABLE.txt

## DO NOT TOUCH List

Full list: FORGE_PHASE_2_1_DO_NOT_TOUCH_LIST.txt

## Keep / Document List

Modules marked KEEP or DOCUMENT are valid candidates for documentation, not movement. See module decision table.

## Move Later Candidates

See FORGE_PHASE_2_1_REFACTOR_CANDIDATE_QUEUE.txt.

## Split Later Candidates

See FORGE_PHASE_2_1_REFACTOR_CANDIDATE_QUEUE.txt.

## Consolidate Later Candidates

See FORGE_PHASE_2_1_REFACTOR_CANDIDATE_QUEUE.txt.

## Unknown / Needs Review Queue

Unknown modules stay REVIEW REQUIRED until a human owner decision is recorded.

## Required Follow-up PAQs or ADRs

- ADR: Alfred / Universal Command Bar vs Command OS ownership boundary.
- ADR: Compensation vs Rule Pack source-of-truth boundary for SMNYL modules.
- ADR: Product-specific truth and projection source requirements.
- ADR: Policy & Sales Operations / Cartera split strategy.
- ADR: Event bus / domain events consolidation strategy.
- ADR: Nash vs Sales Conversion vs Mick/Productivity ownership.

## Final Verdict

Phase 2.1 creates a decision baseline only. Physical refactor, movement, consolidation and deletion remain NOT APPROVED.
