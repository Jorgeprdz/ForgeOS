# RUNTIME-001 Runtime Ownership Map

Report ID: RUNTIME-001
Status: ARCHITECTURE DISCOVERY / NO EXECUTION

## Executive Summary

This map classifies 689 root runtime assets. Ownership is a discovery classification based on observable filename/domain signals and prior repository governance evidence; it is not a movement authorization.

## Ownership Distribution

| Owner | Count |
| --- | ---: |
| Advisor OS | 114 |
| Manager OS | 68 |
| Platform | 25 |
| Product Intelligence | 168 |
| Repository Governance | 32 |
| Shared Intelligence | 128 |
| Unknown | 154 |

## Runtime Category Distribution

| Runtime Category | Count |
| --- | ---: |
| CSS | 2 |
| HTML | 3 |
| JSON | 1 |
| JavaScript | 676 |
| Manifest Files | 1 |
| Platform Assets | 2 |
| Runtime Config | 3 |
| Service Workers | 1 |

## Runtime Classification Distribution

| Runtime Class | Count |
| --- | ---: |
| Runtime Core | 15 |
| Runtime Experimental | 5 |
| Runtime Legacy | 19 |
| Runtime Unknown | 650 |

## Review Status Distribution

| Review Status | Count |
| --- | ---: |
| LEGACY_CANDIDATE | 19 |
| PROTECTED | 6 |
| REVIEW_LATER | 11 |
| REVIEW_REQUIRED | 653 |

## Top 25 Review Candidates

| # | Asset | Owner | Runtime Class | Review | Reason |
| ---: | --- | --- | --- | --- | --- |
| 1 | `actividad.js` | Unknown | Runtime Legacy | LEGACY_CANDIDATE | Name or prior root audit evidence indicates CRMAddlife/transitional legacy risk. |
| 2 | `cartera-import-engine.js` | Unknown | Runtime Legacy | LEGACY_CANDIDATE | Name or prior root audit evidence indicates CRMAddlife/transitional legacy risk. |
| 3 | `cartera-normalizer.js` | Unknown | Runtime Legacy | LEGACY_CANDIDATE | Name or prior root audit evidence indicates CRMAddlife/transitional legacy risk. |
| 4 | `cartera-service.js` | Unknown | Runtime Legacy | LEGACY_CANDIDATE | Name or prior root audit evidence indicates CRMAddlife/transitional legacy risk. |
| 5 | `cartera-state.js` | Unknown | Runtime Legacy | LEGACY_CANDIDATE | Name or prior root audit evidence indicates CRMAddlife/transitional legacy risk. |
| 6 | `cartera-utils.js` | Unknown | Runtime Legacy | LEGACY_CANDIDATE | Name or prior root audit evidence indicates CRMAddlife/transitional legacy risk. |
| 7 | `cartera-validator.js` | Unknown | Runtime Legacy | LEGACY_CANDIDATE | Name or prior root audit evidence indicates CRMAddlife/transitional legacy risk. |
| 8 | `cartera-view.js` | Unknown | Runtime Legacy | LEGACY_CANDIDATE | Name or prior root audit evidence indicates CRMAddlife/transitional legacy risk. |
| 9 | `cartera.js` | Unknown | Runtime Legacy | LEGACY_CANDIDATE | Name or prior root audit evidence indicates CRMAddlife/transitional legacy risk. |
| 10 | `dashboard.js` | Unknown | Runtime Legacy | LEGACY_CANDIDATE | Name or prior root audit evidence indicates CRMAddlife/transitional legacy risk. |
| 11 | `design-system-preview.html` | Unknown | Runtime Legacy | LEGACY_CANDIDATE | Name or prior root audit evidence indicates CRMAddlife/transitional legacy risk. |
| 12 | `icon-192.png` | Unknown | Runtime Legacy | LEGACY_CANDIDATE | Name or prior root audit evidence indicates CRMAddlife/transitional legacy risk. |
| 13 | `icon-512.png` | Unknown | Runtime Legacy | LEGACY_CANDIDATE | Name or prior root audit evidence indicates CRMAddlife/transitional legacy risk. |
| 14 | `nano-banana-icon-system-prompt.js` | Unknown | Runtime Legacy | LEGACY_CANDIDATE | Name or prior root audit evidence indicates CRMAddlife/transitional legacy risk. |
| 15 | `styles.css` | Unknown | Runtime Legacy | LEGACY_CANDIDATE | Name or prior root audit evidence indicates CRMAddlife/transitional legacy risk. |
| 16 | `accessibility-engine.js` | Unknown | Runtime Unknown | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| 17 | `action-resolver-engine.js` | Unknown | Runtime Unknown | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| 18 | `adaptive-message-builder.js` | Unknown | Runtime Unknown | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| 19 | `adaptive-script-builder.js` | Unknown | Runtime Unknown | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| 20 | `animation-engine.js` | Unknown | Runtime Unknown | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| 21 | `buying-signals-engine.js` | Unknown | Runtime Unknown | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| 22 | `cartera-events.js` | Shared Intelligence | Runtime Legacy | LEGACY_CANDIDATE | Name or prior root audit evidence indicates CRMAddlife/transitional legacy risk. |
| 23 | `cartera-repository.js` | Repository Governance | Runtime Legacy | LEGACY_CANDIDATE | Name or prior root audit evidence indicates CRMAddlife/transitional legacy risk. |
| 24 | `center-of-influence-engine.js` | Unknown | Runtime Unknown | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| 25 | `channel-adaptation-engine.js` | Unknown | Runtime Unknown | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |

## Full Runtime Ownership Map

| Asset | Category | Owner | Root Status | Runtime Class | Legacy Flag | Review Status | Reason |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `_redirects` | Runtime Config | Platform | ROOT_REQUIRED | Runtime Core | NONE | PROTECTED | Observable runtime/deploy entrypoint or protected root runtime asset. |
| `accessibility-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `accident-intelligence-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `accident-smoke-test.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `action-resolver-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `actividad.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Legacy | LEGACY_CANDIDATE | LEGACY_CANDIDATE | Name or prior root audit evidence indicates CRMAddlife/transitional legacy risk. |
| `activity-feed-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `activity-feed.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `activity-stream-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `adaptive-message-builder.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `adaptive-outreach-prompt-builder.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `adaptive-question-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `adaptive-script-builder.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `advisor-activity-timeline.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `advisor-alert-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `advisor-monitor-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `advisor-performance-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `advisor-sales-dna.entity.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `advisor-score-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `advisor-style-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `advisor-style.constants.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `ai-context-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `ai-first-contact-message-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `ai-orb-widget.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Experimental | EXPERIMENTAL_CANDIDATE | REVIEW_LATER | Classified by observable JavaScript filename/domain signal. |
| `ai-prompt-builder.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `ai-sales-coach-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `ai-service.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `ai-task-suggestion-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `analytics-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `animation-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `app-shell-manager.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `app.js` | JavaScript | Platform | ROOT_REQUIRED | Runtime Core | LEGACY_CANDIDATE | PROTECTED | Observable runtime/deploy entrypoint or protected root runtime asset. |
| `appointment-calendar-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `appointment-followup-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `appointment-opportunity-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `assistant-memory-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `auth-guard.js` | JavaScript | Platform | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `auto-task-generator-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `base-repository.js` | JavaScript | Repository Governance | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `buying-signals-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `cache-runtime.js` | JavaScript | Platform | ROOT_ALLOWED | Runtime Core | NONE | REVIEW_LATER | Classified by observable JavaScript filename/domain signal. |
| `candidate-assessment-engine.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `candidate-assessment-master-test.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `candidate-coachability-engine.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `candidate-coachability-master-test.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `candidate-hard-factors-engine.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `candidate-hard-factors-master-test.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `candidate-market-quality-engine.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `candidate-market-quality-master-test.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `candidate-vital-factors-engine.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `candidate-vital-factors-master-test.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `cartera-events.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Legacy | LEGACY_CANDIDATE | LEGACY_CANDIDATE | Name or prior root audit evidence indicates CRMAddlife/transitional legacy risk. |
| `cartera-import-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Legacy | LEGACY_CANDIDATE | LEGACY_CANDIDATE | Name or prior root audit evidence indicates CRMAddlife/transitional legacy risk. |
| `cartera-normalizer.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Legacy | LEGACY_CANDIDATE | LEGACY_CANDIDATE | Name or prior root audit evidence indicates CRMAddlife/transitional legacy risk. |
| `cartera-repository.js` | JavaScript | Repository Governance | ROOT_ALLOWED | Runtime Legacy | LEGACY_CANDIDATE | LEGACY_CANDIDATE | Name or prior root audit evidence indicates CRMAddlife/transitional legacy risk. |
| `cartera-service.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Legacy | LEGACY_CANDIDATE | LEGACY_CANDIDATE | Name or prior root audit evidence indicates CRMAddlife/transitional legacy risk. |
| `cartera-state.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Legacy | LEGACY_CANDIDATE | LEGACY_CANDIDATE | Name or prior root audit evidence indicates CRMAddlife/transitional legacy risk. |
| `cartera-utils.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Legacy | LEGACY_CANDIDATE | LEGACY_CANDIDATE | Name or prior root audit evidence indicates CRMAddlife/transitional legacy risk. |
| `cartera-validator.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Legacy | LEGACY_CANDIDATE | LEGACY_CANDIDATE | Name or prior root audit evidence indicates CRMAddlife/transitional legacy risk. |
| `cartera-view.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Legacy | LEGACY_CANDIDATE | LEGACY_CANDIDATE | Name or prior root audit evidence indicates CRMAddlife/transitional legacy risk. |
| `cartera.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Legacy | LEGACY_CANDIDATE | LEGACY_CANDIDATE | Name or prior root audit evidence indicates CRMAddlife/transitional legacy risk. |
| `catastrophic-illness-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `catastrophic-illness-smoke-test.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `center-of-influence-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `channel-adaptation-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `channel-performance-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `client-engagement-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `client-engagement-master-test.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `clipboard-action-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `close-prompt-builder.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `close-readiness-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `close-strategy-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `comisiones-rules-gmm.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `comisiones-utils.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `comisiones.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Legacy | LEGACY_CANDIDATE | LEGACY_CANDIDATE | Name or prior root audit evidence indicates CRMAddlife/transitional legacy risk. |
| `command-execution-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `command-palette-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `command-palette-ui.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `command-palette.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `command-palette.store.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `command-palette.tsx` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `command-parser-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `command-registry.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `command-search-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `command-shortcuts-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `command-suggestion-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `commission-projection-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `commissionable-amount-engine.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `communication-channel-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `communication-mismatch-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `communication-style-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `concursos.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Legacy | LEGACY_CANDIDATE | LEGACY_CANDIDATE | Name or prior root audit evidence indicates CRMAddlife/transitional legacy risk. |
| `contact-attempt-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `contact-channel.constants.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `contact-response-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `contextual-suggestion-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `conversion-metrics-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `copilot-suggestion-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `core_domain-events.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `core_event-bus.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `core-app-engine.js` | JavaScript | Platform | ROOT_ALLOWED | Runtime Core | NONE | REVIEW_LATER | Classified by observable JavaScript filename/domain signal. |
| `core-event-bus.js` | JavaScript | Platform | ROOT_ALLOWED | Runtime Core | NONE | REVIEW_LATER | Classified by observable JavaScript filename/domain signal. |
| `coverage-evaluation-foundation-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `coverage-foundation-smoke-test.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `coverage-intelligence-orchestrator.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `coverage-orchestrator-smoke-test.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `crash-runtime.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `csv-parser-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `currency-normalization-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `daily-points-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `dashboard-executive.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `dashboard-priority-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `dashboard-widget-card.tsx` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Experimental | EXPERIMENTAL_CANDIDATE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `dashboard.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Legacy | LEGACY_CANDIDATE | LEGACY_CANDIDATE | Name or prior root audit evidence indicates CRMAddlife/transitional legacy risk. |
| `db.js` | JavaScript | Platform | ROOT_ALLOWED | Runtime Core | NONE | REVIEW_LATER | Classified by observable JavaScript filename/domain signal. |
| `decision-appendix-master-test.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `design-system-preview.html` | HTML | Unknown | ROOT_ALLOWED | Runtime Legacy | LEGACY_CANDIDATE | LEGACY_CANDIDATE | Name or prior root audit evidence indicates CRMAddlife/transitional legacy risk. |
| `design-tokens.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `discovery-insights-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `discovery-priority-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `discovery-product-alignment-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `discovery-summary-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `discovery-to-presentation-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `dna-coaching-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `dna-script-strategy-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `document-classification-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `dom-sanitizer.js` | JavaScript | Platform | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `domain-events.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `domain-runtime.js` | JavaScript | Platform | ROOT_ALLOWED | Runtime Core | NONE | REVIEW_LATER | Classified by observable JavaScript filename/domain signal. |
| `domain-store.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `drag-drop-policy-zone.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `dynamic-cash-value-projection-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `education-cost-master-test.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `education-paths-master-test.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `entity-resolver-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `error-boundary.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `event-advisor-review-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `event-advisor-review-smoke-test.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `event-benefit-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `event-bus-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `event-classification-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `event-classification-smoke-test.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `event-client-review-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `event-client-review-smoke-test.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `event-log-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `event-system.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `evidence-collection-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `evidence-collection-smoke-test.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `excel-parser-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `exchange-rate-cache-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `false-confidence-protection-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `false-confidence-smoke-test.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `feature-flags.js` | JavaScript | Platform | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `field-confidence-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `financial-pyramid-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `financial-pyramid-priority-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `financial-pyramid-story-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `financial-responsibility-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `financial-responsibility-smoke-test.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `financial-risk-score-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `financial-story-task-builder.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `financial-utils.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `first-contact-ai-suggestion-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `first-contact-dashboard.viewmodel.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `first-contact-delivery-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `first-contact-objections.constants.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `first-contact-options-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `first-contact-script-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `first-contact-tone-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `first-contact.entity.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `fixture-validation-test.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `followup-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `followup-message-context-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `followup-next-date-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `followup-overdue-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `followup-priority-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `followup-recommendation-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `followup-reminder-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `followup-type.constants.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `followup.entity.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `forge-ai-connector-master-test.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `forge-ai-connector.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `forge-ai-guardrails-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `forge-ai-prompt-builder.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `forge-build-tree-status.js` | JavaScript | Repository Governance | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `forge-global-master-test.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `forge-gmm-real-case-smoke-test.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `forge-gmm-sprint-2-smoke-test.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `forge-gmm-sprint-3-smoke-test.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `forge-gmm-sprint-4-smoke-test.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `forge-imagina-ser-client-presentation-test.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `forge-master-acceptance-test.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `forge-presentation-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `forge-rate-cache.json` | Runtime Config | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `forge-schema-reporter.js` | JavaScript | Repository Governance | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `forge-semantic-risk-report.js` | JavaScript | Repository Governance | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `forge-shared-ave-master-test.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `forge-vida-mujer-advisor-report.js` | JavaScript | Repository Governance | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `future-currency-value-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `ghosting-prompt-builder.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `ghosting-status-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `gmm-advisor-review-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `gmm-client-review-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `gmm-out-of-pocket-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `gmm-policy-caratula-summary-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `gmm-quote-parser.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `gmm-quote-summary-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `google-calendar-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `google2698d2deff613be9.html` | HTML | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `health-runtime.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `hospitalization-intelligence-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `hospitalization-smoke-test.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `hot-market-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `human-review-routing-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `human-review-routing-smoke-test.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `icon-192.png` | Platform Assets | Unknown | ROOT_ALLOWED | Runtime Legacy | LEGACY_CANDIDATE | LEGACY_CANDIDATE | Name or prior root audit evidence indicates CRMAddlife/transitional legacy risk. |
| `icon-512.png` | Platform Assets | Unknown | ROOT_ALLOWED | Runtime Legacy | LEGACY_CANDIDATE | LEGACY_CANDIDATE | Name or prior root audit evidence indicates CRMAddlife/transitional legacy risk. |
| `idle-runtime.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `imagina-ser-advisor-analysis-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `imagina-ser-article-151-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `imagina-ser-article-185-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `imagina-ser-banxico-integration-test.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `imagina-ser-client-presentation-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `imagina-ser-contribution-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `imagina-ser-decision-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `imagina-ser-fiscal-bag-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `imagina-ser-fiscal-master-test.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `imagina-ser-fiscal-router-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `imagina-ser-fiscal-slide-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `imagina-ser-future-mxn-bridge.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `imagina-ser-happy-numbers-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `imagina-ser-human-language-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `imagina-ser-master-test.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `imagina-ser-objection-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `imagina-ser-ocr-extractor.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `imagina-ser-presentation-prompt-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `imagina-ser-real-quote-validation.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `imagina-ser-retirement-fund-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `imagina-ser-scenario-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `imagina-ser-variant-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `imagina-ser-variant-fiscal-master-test.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `import-progress-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `in-app-notification-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `index.html` | HTML | Platform | ROOT_REQUIRED | Runtime Core | LEGACY_CANDIDATE | PROTECTED | Observable runtime/deploy entrypoint or protected root runtime asset. |
| `interview-evidence-fixture-test.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `introduction-message-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `lead-temperature-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `life-event-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `life-event-master-test.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `life-expectancy-projection-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `line-of-business-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `live-communication-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `live-dashboard-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `live-notification-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `live-operational-state-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `logger.js` | JavaScript | Platform | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `manager-alert-engine.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `manager-broadcast-engine.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `manager-coaching-engine.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `manager-feed-engine.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `manager-notification-engine.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `manager-role-engine.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `manifest.json` | Manifest Files | Platform | ROOT_REQUIRED | Runtime Core | LEGACY_CANDIDATE | PROTECTED | Observable runtime/deploy entrypoint or protected root runtime asset. |
| `market-data-master-test.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `market-evidence-fixture-test.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `mass-import-mapping-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `mass-import-preview-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Experimental | EXPERIMENTAL_CANDIDATE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `mass-import-validation-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `maternity-intelligence-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `maternity-smoke-test.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `memory-manager.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `migration-inventory.json` | JSON | Repository Governance | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `module-lifecycle.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `momentum-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `monthly-revenue-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `motion-principles.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `multi-label-event-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `multi-label-event-smoke-test.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `mutation-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `nano-banana-icon-system-prompt.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Legacy | LEGACY_CANDIDATE | LEGACY_CANDIDATE | Name or prior root audit evidence indicates CRMAddlife/transitional legacy risk. |
| `nash-advisor-performance-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `nash-advisor-performance-master-test.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `nash-coaching-insight-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `nash-coaching-insight-master-test.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `nash-combat-intelligence-report-engine.js` | JavaScript | Repository Governance | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `nash-combat-intelligence-report-test.js` | JavaScript | Repository Governance | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `nash-combat-master-test.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `nash-combat-orchestrator.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `nash-core-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `nash-council-orchestrator.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `nash-followup-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `nash-integration-master-test.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `nash-intent-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `nash-intent-master-test.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `nash-learning-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `nash-learning-master-test.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `nash-manager-alert-engine.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `nash-manager-alert-master-test.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `nash-master-acceptance-test.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `nash-master-intelligence-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `nash-master-intelligence-master-test.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `nash-master-test.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `nash-memory-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `nash-memory-master-test.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `nash-message-recommendation-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `nash-next-best-action-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `nash-next-best-action-master-test.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `nash-personality-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `nash-personality-master-test.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `nash-prospect-context-builder.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `nash-team-intelligence-engine.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `nash-team-intelligence-master-test.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `nash-v03-master-test.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `nash-v04-master-test.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `needs-discovery-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `network-manager.js` | JavaScript | Platform | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `neural-glow.css` | CSS | Unknown | ROOT_ALLOWED | Runtime Experimental | EXPERIMENTAL_CANDIDATE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `next-best-question-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `next-best-question-smoke-test.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `notification-orchestrator.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `notification-priority-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `notification-queue-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `objection-battle-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `objection-classifier-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `objection-intent-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `objection-memory-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `objection-prompt-builder.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `objection-resolution-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `objection-response-strategy-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `ocr-result-cache.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `offline-sync.js` | JavaScript | Platform | ROOT_ALLOWED | Runtime Core | NONE | REVIEW_LATER | Classified by observable JavaScript filename/domain signal. |
| `operational-button.tsx` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `operational-card.tsx` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `operational-colors.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `operational-dashboard-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `operational-feed-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `operational-shell.store.ts` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `operational-sync-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `opportunity-detector-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `optimistic-mutation-runtime.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `optional-coverage-intelligence-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `optional-coverage-smoke-test.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `organization-rules-fixture-validation-test.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `orvi-client-presentation-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `orvi-client-report-test.js` | JavaScript | Repository Governance | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `orvi-decision-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `orvi-event-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `orvi-guaranteed-value-timeline-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `orvi-master-test.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `orvi-mxn-conversion-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `orvi-mxn-master-test.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `orvi-objection-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `orvi-ocr-extractor.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `orvi-wait-vs-cancel-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `outreach-channel.constants.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `outreach-prompt-builder.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `ovelay-manager.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `overdue-task-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `payment-frequency-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `payment-mode-coaching-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `performance-monitor.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `performance-runtime.js` | JavaScript | Platform | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `phone-call-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `pipeline-stage-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `policy-activity-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `policy-ai-insights-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `policy-ai-parser.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `policy-auto-approval-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `policy-auto-save-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `policy-batch-processing-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `policy-client-summary-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `policy-context-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `policy-core-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `policy-detail-alert-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `policy-detail-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `policy-detail-view-model.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `policy-document-classifier.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `policy-document-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `policy-duplicate-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `policy-field-confidence-map.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `policy-filter-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `policy-financial-summary-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `policy-followup-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `policy-human-review-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `policy-import-dashboard-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `policy-import-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `policy-import-errors-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `policy-import-metrics-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `policy-import-queue.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `policy-import-summary.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `policy-indexing-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `policy-ingestion-orchestrator.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `policy-last-contact-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `policy-live-state-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `policy-metadata-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `policy-normalization-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `policy-ocr-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `policy-operational-center-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `policy-quick-actions-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `policy-relationship-score-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `policy-renewal-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `policy-renewal-status-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `policy-review-priority-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `policy-review-ui-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `policy-risk-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `policy-schema-validator-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `policy-search-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `policy-side-by-side-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `policy-smart-sort-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `policy-staging-cache.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `policy-staging-status-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `policy-status-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `policy-storage-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `policy-summary-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `policy-task-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `policy-task-priority-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `policy-timeline-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `policy-timeline-event.factory.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `policy-timeline-group-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `policy-timeline-query-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `policy-timeline-view-model.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `policy-timeline.repository.js` | JavaScript | Repository Governance | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `policy-timeline.types.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `policy-validation-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `policy-workspace-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `precontract-activity-fixture-test.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `predictive-dashboard.tsx` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `presentation-input-context-builder.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `presentation-input-pipeline.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `primary-risk-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `product-detection-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `product-knowledge-link-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `product-schema-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `projection-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `projection-milestone-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `proposal-family-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `proposal-family-smoke-test.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `prospeccion.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `prospect-next-action-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `prospect-personality-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `prospect-personality.constants.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `prospect-pipeline-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `prospect-profile-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `prospect-score-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `prospect-segment-performance-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `prospect-status.constants.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `prospect.entity.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `prospecting-dashboard.viewmodel.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `push-notification-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `query-cache.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `query-runtime.js` | JavaScript | Platform | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `question-answer-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `question-session-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `question-style-match-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `quick-action-executor-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `quick-actions-bar.tsx` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `quick-actions-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `quotation-currency-bridge.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `quotation-extraction-result.entity.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `quotation-field-normalizer.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `quotation-input.entity.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `quote-to-policy-comparison-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `ranking-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `reactivation-strategy-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `realtime-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `realtime-task-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `recruitment-fixture-validation-test.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `referidos.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `referral-ai-followup.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `referral-card-ui.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `referral-color-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `referral-followup-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `referral-opportunity-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `referral-opportunity-master-test.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `referral-priority-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `referral-prompt-builder.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `referral-score-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `referral-smart-actions.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `referral-source.constants.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `referral-temperature-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `referral-timeline-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `referrals-board-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `referrals-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `relationship-health-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `relationship-health-master-test.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `relationship-master-acceptance-test.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `relationship-master-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `relationship-memory-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `relationship-next-action-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `relationship-next-action-master-test.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `relationship-opportunity-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `relationship-opportunity-master-test.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `relationship-review-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `relationship-review-master-test.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `relationship-timeline-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `relationship-timeline-master-test.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `render-engine.js` | JavaScript | Platform | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `renewal-intelligence-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `responsive-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `retirement-future-udi-projection-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `retirement-future-udi-projection-smoke-test.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `retirement-presentation-scenario-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `retry-runtime.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `revenue-forecast-engine.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `revenue-optimization-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `risk-story-context-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `route-transition-manager.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `runtime.js` | JavaScript | Platform | ROOT_ALLOWED | Runtime Core | NONE | REVIEW_LATER | Classified by observable JavaScript filename/domain signal. |
| `sales-coach-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `sales-context-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `sales-dna-evolution-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `sales-dna-insight-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `sales-dna-learning-event.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `sales-dna-match-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `sales-dna-profile-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `sales-dna-recommendation-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `sales-dna-stage-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `sales-dna.constants.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `sales-learning-event.entity.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `sales-script-types.constants.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `sales-tone.constants.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `schema-field-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `script-adaptation-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `search-index-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `search-quick-actions-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `search-ranking-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `secure-storage.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `seen-but-no-reply-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `segu-beca-client-presentation-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `segu-beca-decision-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `segu-beca-education-comparison-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `segu-beca-education-options-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `segu-beca-master-test.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `segu-beca-meaningful-numbers-report.js` | JavaScript | Repository Governance | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `segu-beca-mxn-appendix-report.js` | JavaScript | Repository Governance | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `segu-beca-mxn-timeline-clean-report.js` | JavaScript | Repository Governance | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `segu-beca-ocr-intake-report.js` | JavaScript | Repository Governance | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `semantic-navigation-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `service-worker.js` | Service Workers | Platform | ROOT_REQUIRED | Runtime Core | NONE | PROTECTED | Observable runtime/deploy entrypoint or protected root runtime asset. |
| `shared-ave-confidence-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `shared-ave-confidence-report.js` | JavaScript | Repository Governance | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `shared-ave-death-benefit-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `shared-ave-death-benefit-report.js` | JavaScript | Repository Governance | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `shared-ave-eligibility-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `shared-ave-growth-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `shared-ave-growth-report.js` | JavaScript | Repository Governance | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `shared-ave-portfolio-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `shared-ave-portfolio-report.js` | JavaScript | Repository Governance | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `shared-ave-rescue-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `shared-ave-rescue-report.js` | JavaScript | Repository Governance | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `shared-ave-type-inference-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `shared-ave-type-inference-report.js` | JavaScript | Repository Governance | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `shared-banxico-rate-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `shared-banxico-rate-report.js` | JavaScript | Repository Governance | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `shared-benefit-hierarchy-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `shared-client-language-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `shared-clp-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `shared-clp-master-test.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `shared-currency-projection-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `shared-decision-appendix-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `shared-decision-clarity-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `shared-decision-score-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `shared-document-priority-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `shared-education-cost-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `shared-education-paths-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `shared-financial-return-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `shared-human-financial-language-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `shared-meaningful-numbers-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `shared-mxn-timeline-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `shared-objection-shield-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `shared-policy-currency-timeline-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `shared-policy-currency-timeline-smoke-test.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `shared-premium-growth-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `shared-price-placement-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `shared-projection-scenarios-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `shared-protection-efficiency-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `shared-recovery-analysis-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `shared-tax-profile-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `smart-agenda-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `smart-field-detection-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `smart-followup-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `smart-followup-message-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `smart-header.tsx` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `smart-notification-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `smart-outreach-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `smart-priority-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `smart-referrals-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `smnyl-ai-coach-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `smnyl-ai-presence-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `smnyl-alerts-engine.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `smnyl-anomaly-engine.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `smnyl-automation-engine.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `smnyl-bonos-engine.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `smnyl-cancelaciones-engine.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `smnyl-comisiones-engine.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `smnyl-comisiones-gmm.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `smnyl-comisiones-vida.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `smnyl-command-center-engine.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `smnyl-command-palette-engine.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `smnyl-concursos-engine.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `smnyl-conteo-engine.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `smnyl-cross-sell-engine.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `smnyl-decision-engine.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `smnyl-executive-dashboard-engine.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `smnyl-followup-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `smnyl-forecast-engine.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `smnyl-goals-engine.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `smnyl-health-score-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `smnyl-insights-engine.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `smnyl-kpi-engine.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `smnyl-leaderboard-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `smnyl-neural-glow-engine.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Experimental | EXPERIMENTAL_CANDIDATE | REVIEW_LATER | Classified by observable JavaScript filename/domain signal. |
| `smnyl-operating-system-engine.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `smnyl-opportunity-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `smnyl-performance-engine.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `smnyl-persistencia-engine.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `smnyl-pipeline-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `smnyl-prima-engine.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `smnyl-produccion-engine.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `smnyl-productividad-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `smnyl-productos-gmm.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `smnyl-productos-vida.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `smnyl-reminders-engine.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `smnyl-renovaciones-engine.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `smnyl-retencion-engine.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `smnyl-risk-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `smnyl-streak-engine.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `smnyl-time-block-engine.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `smnyl-training-allowance-engine.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `solucionline-retirement-parser.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `source-ownership-registry-validation-test.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `source-ownership-registry.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `staging-cleanup-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `staging-review-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `state-manager.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `storage-engine.js` | JavaScript | Platform | ROOT_ALLOWED | Runtime Core | NONE | REVIEW_LATER | Classified by observable JavaScript filename/domain signal. |
| `storage-queue.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `storage-validator.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `store.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `styles.css` | CSS | Unknown | ROOT_ALLOWED | Runtime Legacy | LEGACY_CANDIDATE | LEGACY_CANDIDATE | Name or prior root audit evidence indicates CRMAddlife/transitional legacy risk. |
| `supabase-runtime.js` | JavaScript | Platform | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `surgery-intelligence-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `surgery-smoke-test.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `sw-cache-config.js` | Runtime Config | Platform | ROOT_REQUIRED | Runtime Core | NONE | PROTECTED | Observable runtime/deploy entrypoint or protected root runtime asset. |
| `sync-engine.js` | JavaScript | Platform | ROOT_ALLOWED | Runtime Core | NONE | REVIEW_LATER | Classified by observable JavaScript filename/domain signal. |
| `sync-orchestrator.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `sync-queue-runtime.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `task-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `task-feed-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `task-priority-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `task-quick-action-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `team-activity-engine.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `team-dashboard-engine.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `team-momentum-engine.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `team-structure-engine.js` | JavaScript | Manager OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `telemetry.js` | JavaScript | Platform | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `territoriality-intelligence-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `territoriality-smoke-test.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `tone-performance-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `tone-profile-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `ui-render-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `universal-command-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `universal-filters-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `universal-search-engine.js` | JavaScript | Shared Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `utils.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `vida-mujer-client-explanation-report.js` | JavaScript | Repository Governance | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `vida-mujer-client-presentation-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `vida-mujer-client-presentation-test.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `vida-mujer-coverage-status-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `vida-mujer-coverage-status-report.js` | JavaScript | Repository Governance | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `vida-mujer-event-benefits-report.js` | JavaScript | Repository Governance | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `vida-mujer-financial-correction-report.js` | JavaScript | Repository Governance | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `vida-mujer-financial-fixture-report.js` | JavaScript | Repository Governance | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `vida-mujer-knowledge-extractor-report.js` | JavaScript | Repository Governance | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `vida-mujer-knowledge-extractor.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `vida-mujer-master-test.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `vida-mujer-pdf-ave-integration-report.js` | JavaScript | Repository Governance | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `vida-mujer-pdf-intake-report.js` | JavaScript | Repository Governance | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `vida-mujer-protected-diseases-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `vida-mujer-protected-diseases-report.js` | JavaScript | Repository Governance | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `vida-mujer-rule-consistency-report.js` | JavaScript | Repository Governance | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `vida-mujer-status.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `vida-mujer-survival-schedule-engine.js` | JavaScript | Product Intelligence | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `virtual-list-engine.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `virtual-list.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `visibility-runtime.js` | JavaScript | Unknown | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | No confident domain owner from observable filename signals. |
| `warm-market-segmentation-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `whatsapp-action-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |
| `whatsapp-link-engine.js` | JavaScript | Advisor OS | ROOT_ALLOWED | Runtime Unknown | NONE | REVIEW_REQUIRED | Runtime asset exists in flat root with no confirmed dependency need in this audit. |