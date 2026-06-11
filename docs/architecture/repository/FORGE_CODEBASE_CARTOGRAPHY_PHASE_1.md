# Forge Codebase Cartography Phase 1

Status: Documentation-only cartography.
Scope: Static module assignment to FORGE_MASTER_BUILD_TREE.md domains.
Implementation: NOT APPROVED.
No code modified. No files moved. No imports changed.

## Executive Summary

- Total modules assigned: 634
- Build Tree branches with detected modules: 23
- Unknown / Needs Review modules: 18
- Review queue entries: 500
- Duplicate candidate groups: 61

## Methodology

- Started from FORGE_CODEBASE_MODULE_INVENTORY_REPORT.txt, FORGE_CODEBASE_DOMAIN_ASSIGNMENT_SUMMARY.md and FORGE_CODEBASE_DOMAIN_ASSIGNMENT_CONCISE.md.
- Reclassified modules into Build Tree branches using filename, static imports, exports, suggested domain and special-case rules.
- Confidence is HIGH, MEDIUM or LOW. LOW routes to Unknown / Needs Review.
- This is not a refactor plan and does not approve movement or implementation.

## Domain Assignment Map

### 01 REVENUE GENERATION ENGINE

- Files assigned: 4
- Types: engine: 4
- Confidence: MEDIUM: 4
- Full detail: see FORGE_CODEBASE_MODULE_TO_BRANCH_MAP.txt

### 02 SALES CONVERSION ENGINE

- Files assigned: 59
- Types: UI component: 7, adapter: 1, config: 4, engine: 28, fixture: 1, test: 13, utility: 5
- Confidence: HIGH: 18, MEDIUM: 41
- Full detail: see FORGE_CODEBASE_MODULE_TO_BRANCH_MAP.txt

### 03 NASH CONVERSATION INTELLIGENCE

- Files assigned: 32
- Types: UI component: 4, engine: 12, orchestrator: 2, script: 1, state/store: 1, test: 12
- Confidence: HIGH: 9, MEDIUM: 23
- Full detail: see FORGE_CODEBASE_MODULE_TO_BRANCH_MAP.txt

### 04 PRODUCT INTELLIGENCE ENGINE

- Files assigned: 89
- Types: UI component: 1, adapter: 6, engine: 44, script: 19, test: 15, utility: 4
- Confidence: HIGH: 14, MEDIUM: 75
- Full detail: see FORGE_CODEBASE_MODULE_TO_BRANCH_MAP.txt

### 05 RELATIONSHIP INTELLIGENCE ENGINE

- Files assigned: 31
- Types: UI component: 2, config: 3, engine: 21, script: 1, state/store: 1, test: 2, utility: 1
- Confidence: HIGH: 4, MEDIUM: 27
- Full detail: see FORGE_CODEBASE_MODULE_TO_BRANCH_MAP.txt

### 06 LEARNING INTELLIGENCE ENGINE

- Files assigned: 2
- Types: engine: 1, test: 1
- Confidence: MEDIUM: 2
- Full detail: see FORGE_CODEBASE_MODULE_TO_BRANCH_MAP.txt

### 07 POLICY & SALES OPERATIONS

- Files assigned: 108
- Types: UI component: 18, engine: 58, orchestrator: 1, script: 3, state/store: 4, test: 9, unknown: 1, utility: 14
- Confidence: HIGH: 14, MEDIUM: 94
- Full detail: see FORGE_CODEBASE_MODULE_TO_BRANCH_MAP.txt

### 08 MANAGER & TEAM INTELLIGENCE

- Files assigned: 28
- Types: UI component: 1, engine: 16, state/store: 1, test: 8, utility: 2
- Confidence: HIGH: 2, MEDIUM: 26
- Full detail: see FORGE_CODEBASE_MODULE_TO_BRANCH_MAP.txt

### 09 UNIVERSAL COMMAND OS

- Files assigned: 3
- Types: UI component: 1, engine: 2
- Confidence: MEDIUM: 3
- Full detail: see FORGE_CODEBASE_MODULE_TO_BRANCH_MAP.txt

### 10 PLATFORM SERVICES

- Files assigned: 58
- Types: UI component: 1, adapter: 1, config: 1, engine: 22, orchestrator: 2, script: 1, state/store: 5, test: 3, unknown: 1, utility: 21
- Confidence: HIGH: 19, MEDIUM: 39
- Full detail: see FORGE_CODEBASE_MODULE_TO_BRANCH_MAP.txt

### 12 ADVISOR EXPERIENCE INTELLIGENCE

- Files assigned: 7
- Types: UI component: 7
- Confidence: HIGH: 1, MEDIUM: 6
- Full detail: see FORGE_CODEBASE_MODULE_TO_BRANCH_MAP.txt

### Alfred / Universal Command Bar

- Files assigned: 4
- Types: UI component: 1, engine: 2, utility: 1
- Confidence: HIGH: 1, MEDIUM: 3
- Full detail: see FORGE_CODEBASE_MODULE_TO_BRANCH_MAP.txt

### COMPENSATION INTELLIGENCE

- Files assigned: 26
- Types: UI component: 1, engine: 22, utility: 3
- Confidence: HIGH: 3, MEDIUM: 23
- Full detail: see FORGE_CODEBASE_MODULE_TO_BRANCH_MAP.txt

### CONSERVATION INTELLIGENCE

- Files assigned: 16
- Types: UI component: 1, engine: 14, utility: 1
- Confidence: HIGH: 2, MEDIUM: 14
- Full detail: see FORGE_CODEBASE_MODULE_TO_BRANCH_MAP.txt

### ECONOMIC MOTIVATION

- Files assigned: 5
- Types: adapter: 1, engine: 3, utility: 1
- Confidence: HIGH: 4, MEDIUM: 1
- Full detail: see FORGE_CODEBASE_MODULE_TO_BRANCH_MAP.txt

### EVIDENCE & PROVENANCE

- Files assigned: 10
- Types: UI component: 2, engine: 1, script: 1, test: 6
- Confidence: HIGH: 3, MEDIUM: 7
- Full detail: see FORGE_CODEBASE_MODULE_TO_BRANCH_MAP.txt

### FORECAST INTELLIGENCE

- Files assigned: 15
- Types: engine: 12, script: 2, test: 1
- Confidence: HIGH: 10, MEDIUM: 5
- Full detail: see FORGE_CODEBASE_MODULE_TO_BRANCH_MAP.txt

### PERIODSNAPSHOT / OPERATIONAL CLOCKS

- Files assigned: 44
- Types: UI component: 1, adapter: 1, engine: 25, script: 1, state/store: 1, test: 2, utility: 13
- Confidence: HIGH: 9, MEDIUM: 35
- Full detail: see FORGE_CODEBASE_MODULE_TO_BRANCH_MAP.txt

### PRODUCTIVITY INTELLIGENCE

- Files assigned: 11
- Types: engine: 9, utility: 2
- Confidence: HIGH: 1, MEDIUM: 10
- Full detail: see FORGE_CODEBASE_MODULE_TO_BRANCH_MAP.txt

### RULESNAPSHOT / RULE PACK

- Files assigned: 5
- Types: engine: 2, orchestrator: 1, test: 2
- Confidence: HIGH: 4, MEDIUM: 1
- Full detail: see FORGE_CODEBASE_MODULE_TO_BRANCH_MAP.txt

### SHARED COMMERCIAL MODEL

- Files assigned: 5
- Types: engine: 3, test: 2
- Confidence: HIGH: 1, MEDIUM: 4
- Full detail: see FORGE_CODEBASE_MODULE_TO_BRANCH_MAP.txt

### SHARED CORE

- Files assigned: 54
- Types: UI component: 1, adapter: 2, config: 3, engine: 27, state/store: 5, test: 5, unknown: 3, utility: 8
- Confidence: HIGH: 15, MEDIUM: 39
- Full detail: see FORGE_CODEBASE_MODULE_TO_BRANCH_MAP.txt

### UNKNOWN / NEEDS REVIEW

- Files assigned: 18
- Types: engine: 16, utility: 2
- Confidence: LOW: 18
- Full detail: see FORGE_CODEBASE_MODULE_TO_BRANCH_MAP.txt

## Build Tree Alignment

- FORGE_MASTER_BUILD_TREE.md was updated with a Phase 1 detected-code-modules section.
- Existing PAQ and architecture statuses were not changed.
- Closed/candidate domain states were preserved.
- Large domains are summarized by counts and refer to the full module-to-branch map.

## Module-to-Branch Assignment

Full file-by-file assignment is stored in FORGE_CODEBASE_MODULE_TO_BRANCH_MAP.txt.

## Unknown / Needs Review

Full queue is stored in FORGE_CODEBASE_UNKNOWN_REVIEW_QUEUE.txt.

## Duplicate Candidates Summary

1. activity-feed-engine.js, activity-feed.js
2. advisor-performance-engine.js, nash-advisor-performance-engine.js, nash-advisor-performance-master-test.js
3. app.js, core-app-engine.js
4. candidate-assessment-engine.js, candidate-assessment-master-test.js
5. candidate-coachability-engine.js, candidate-coachability-master-test.js
6. candidate-hard-factors-engine.js, candidate-hard-factors-master-test.js
7. candidate-market-quality-engine.js, candidate-market-quality-master-test.js
8. candidate-vital-factors-engine.js, candidate-vital-factors-master-test.js
9. cartera-view.js, cartera.js
10. client-engagement-engine.js, client-engagement-master-test.js
11. comisiones.js, smnyl-comisiones-engine.js
12. command-palette-engine.js, command-palette-ui.js, command-palette.js, command-palette.tsx, smnyl-command-palette-engine.js
13. concursos.js, smnyl-concursos-engine.js
14. core-event-bus.js, core_event-bus.js, event-bus-engine.js
15. core_domain-events.js, domain-events.js
16. decision-appendix-master-test.js, shared-decision-appendix-engine.js
17. education-cost-master-test.js, shared-education-cost-engine.js
18. education-paths-master-test.js, shared-education-paths-engine.js
19. followup-engine.js, nash-followup-engine.js, policy-followup-engine.js, smnyl-followup-engine.js
20. forge-ai-connector-master-test.js, forge-ai-connector.js
21. gmm-out-of-pocket-engine.js, tests/gmm-out-of-pocket-test.js
22. life-event-engine.js, life-event-master-test.js
23. manager-alert-engine.js, nash-manager-alert-engine.js, nash-manager-alert-master-test.js
24. nash-coaching-insight-engine.js, nash-coaching-insight-master-test.js
25. nash-combat-intelligence-report-engine.js, nash-combat-intelligence-report-test.js

## Orphan Candidates Summary

- Static no-incoming-import candidates are included in FORGE_CODEBASE_UNKNOWN_REVIEW_QUEUE.txt when they also carry review risk.
- Do not delete any orphan candidate without runtime, HTML, dynamic import and test validation.

## Hardcoded / Rule Pack Risk Summary

- Carrier-specific SMNYL files require Rule Pack boundary review.
- Compensation, commission, bonus, contest, LIMRA, IGC, projection and product-specific files require source documentation.
- No formula is approved by this cartography.

## Carrier-Specific Boundary Review

- smnyl-* files are not Forge Core by default.
- They should be treated as carrier/app-specific or Rule Pack candidates until validated.
- Build Tree assignment is documentary only and does not approve hardcoded rules.

## Recommended Cleanup Roadmap

### Phase 1 - Documentation only

- Keep cartography current.
- Add module docs for high-risk engines.
- Mark legacy / duplicate / unknown explicitly.

### Phase 2 - Safe grouping proposal

- Propose future folder structure without moving files.
- Confirm owners and tests.

### Phase 3 - Dependency hardening

- Confirm import cycles with dedicated tooling.
- Extract Shared Core candidates only after tests.

### Phase 4 - Refactor only after tests

- Move/refactor only after acceptance tests and explicit approval.

## Final Verdict

The codebase can now be reasoned about by Build Tree branch, but physical reorganization is not approved. The next step is human review of the Unknown / Needs Review queue and high-risk Rule Pack boundaries.
