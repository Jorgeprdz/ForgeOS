# Forge Root Engine Inventory and Build Tree Crosswalk 004

Phase: FORGE_ROOT_ENGINE_INVENTORY_AND_BUILDTREE_CROSSWALK_004

Mode: READ ONLY CODEBASE DISCOVERY + DOCS ONLY BUILDTREE UPDATE

Status: ROOT_ENGINE_INVENTORY_CROSSWALKED

## Boundary

- This phase did not move files.
- This phase did not refactor imports.
- This phase did not edit implementation code.
- This phase did not create tests.
- A detected root-level file is not implementation closure.
- A root-level engine is not automatically source truth.
- Build Tree placement is documentation, not runtime behavior.
- Unknown remains unknown.

## Discovery Commands Used

- `git status --short --branch`
- `git log --oneline -24`
- `git ls-files | rg '(^[^/]+$)'`
- `git ls-files | rg '(^[^/]+\.(js|mjs|cjs|ts|tsx)$)'`
- `git ls-files | rg '(^[^/]*(engine|orchestrator|intelligence|advisor|manager|nash|candidate|prospect|relationship|policy|product|forecast|compensation|revenue)[^/]*\.(js|mjs|cjs|ts|tsx)$)'`
- `sed` reads of authorized Build Tree source docs.

## Inventory Summary

The tracked-file scan found 219 root-level engine/module candidates by the approved filename pattern.

| Probable Build Tree branch | Count | Confidence | Evidence used | Recommendation |
| --- | ---: | --- | --- | --- |
| Nash Conversation Intelligence | 34 | HIGH | `nash-*` filename evidence | Keep documented only until boundary-wrapped. |
| Product Intelligence Engine | 37 | MEDIUM | product/GMM/Imagina/ORVI/Vida/Segu filename evidence | Future relocation candidate after product evidence/source review. |
| Sales Conversion Engine | 25 | MEDIUM | sales/script/outreach/contact/question/conversion filename evidence | Future source-truth and recommendation/execution boundary review. |
| Relationship Intelligence Engine | 14 | HIGH | `relationship-*`, `referral-*`, `life-event-*` filename evidence | Future relocation candidate after branch closure/source freshness review. |
| Policy & Sales Operations | 11 | MEDIUM | activity/policy/cartera/WhatsApp/phone filename evidence | Future adapter/write boundary review. |
| Manager OS / Manager & Team Intelligence | 8 | MEDIUM | manager/coaching filename evidence | Needs boundary wrapper/source-truth review. |
| Forecast / Productivity / Conservation Intelligence | 7 | HIGH | forecast/projection/scenario filename evidence | Keep scenario/context only; no truth promotion. |
| Universal Command OS / Alfred | 7 | MEDIUM | command/search/quick-action filename evidence | Needs action approval boundary. |
| Platform Services | 9 | MEDIUM | core/event/storage/render/UI filename evidence | Future platform ownership review. |
| Evidence, Provenance, Rules, Periods, Source Truth | 5 | MEDIUM | classification/entity/excel/confidence/schema filename evidence | Keep documented only/source-truth review. |
| Revenue Generation Engine | 3 | HIGH | `revenue-*` filename evidence | Needs official revenue source ownership review. |
| Compensation Intelligence | 2 | HIGH | commission filename evidence | Candidate/calculation context only until payout evidence exists. |
| Advisor OS / Advisor Experience Intelligence | 2 | MEDIUM | advisor review filename evidence | Needs Advisor OS source-truth review. |
| Learning Intelligence Engine | 1 | MEDIUM | assistant memory filename evidence | Parked/deferred or needs review. |
| UNKNOWN / NEEDS REVIEW | 54 | LOW | generic/shared filename evidence | Do not force into false truth. |

## Root-Level Engine Inventory Table

### Nash Conversation Intelligence

Detected type: engine / orchestrator / test / context builder

Probable branch: Nash Conversation Intelligence

Confidence: HIGH

Recommendation: needs boundary wrapper / keep documented only

Constitutional notes: Nash support is not Nash runtime execution. Message recommendation is not message send. Next-best-action is not execution.

- `nash-advisor-performance-engine.js`
- `nash-advisor-performance-master-test.js`
- `nash-coaching-insight-engine.js`
- `nash-coaching-insight-master-test.js`
- `nash-combat-intelligence-report-engine.js`
- `nash-combat-intelligence-report-test.js`
- `nash-combat-master-test.js`
- `nash-combat-orchestrator.js`
- `nash-core-engine.js`
- `nash-council-orchestrator.js`
- `nash-followup-engine.js`
- `nash-integration-master-test.js`
- `nash-intent-engine.js`
- `nash-intent-master-test.js`
- `nash-learning-engine.js`
- `nash-learning-master-test.js`
- `nash-manager-alert-engine.js`
- `nash-manager-alert-master-test.js`
- `nash-master-acceptance-test.js`
- `nash-master-intelligence-engine.js`
- `nash-master-intelligence-master-test.js`
- `nash-master-test.js`
- `nash-memory-engine.js`
- `nash-memory-master-test.js`
- `nash-message-recommendation-engine.js`
- `nash-next-best-action-engine.js`
- `nash-next-best-action-master-test.js`
- `nash-personality-engine.js`
- `nash-personality-master-test.js`
- `nash-prospect-context-builder.js`
- `nash-team-intelligence-engine.js`
- `nash-team-intelligence-master-test.js`
- `nash-v03-master-test.js`
- `nash-v04-master-test.js`

### Product Intelligence Engine

Detected type: engine / report

Probable branch: Product Intelligence Engine

Confidence: MEDIUM

Recommendation: future relocation candidate / evidence packet review

Constitutional notes: Product truth comes from documentation. No invented products, premiums, benefits, protection diagnoses, or unsupported claims.

- `forge-vida-mujer-advisor-report.js`
- `gmm-advisor-review-engine.js`
- `gmm-client-review-engine.js`
- `gmm-policy-caratula-summary-engine.js`
- `gmm-quote-summary-engine.js`
- `imagina-ser-advisor-analysis-engine.js`
- `imagina-ser-article-151-engine.js`
- `imagina-ser-article-185-engine.js`
- `imagina-ser-client-presentation-engine.js`
- `imagina-ser-decision-engine.js`
- `imagina-ser-fiscal-bag-engine.js`
- `imagina-ser-fiscal-router-engine.js`
- `imagina-ser-fiscal-slide-engine.js`
- `imagina-ser-happy-numbers-engine.js`
- `imagina-ser-objection-engine.js`
- `imagina-ser-presentation-prompt-engine.js`
- `imagina-ser-scenario-engine.js`
- `imagina-ser-variant-engine.js`
- `orvi-client-presentation-engine.js`
- `orvi-decision-engine.js`
- `orvi-event-engine.js`
- `orvi-guaranteed-value-timeline-engine.js`
- `orvi-mxn-conversion-engine.js`
- `orvi-objection-engine.js`
- `orvi-wait-vs-cancel-engine.js`
- `payment-frequency-engine.js`
- `product-detection-engine.js`
- `product-knowledge-link-engine.js`
- `quote-to-policy-comparison-engine.js`
- `segu-beca-client-presentation-engine.js`
- `segu-beca-decision-engine.js`
- `segu-beca-education-comparison-engine.js`
- `segu-beca-education-options-engine.js`
- `shared-benefit-hierarchy-engine.js`
- `shared-premium-growth-engine.js`
- `vida-mujer-client-presentation-engine.js`
- `vida-mujer-protected-diseases-engine.js`

### Sales Conversion Engine

Detected type: engine / UI view model

Probable branch: Sales Conversion Engine

Confidence: MEDIUM

Recommendation: future relocation candidate / source-truth review

Constitutional notes: Recommendation is not execution. Conversation guidance must not invent intent, products, premiums, or income claims.

- `adaptive-question-engine.js`
- `ai-sales-coach-engine.js`
- `buying-signals-engine.js`
- `communication-channel-engine.js`
- `communication-mismatch-engine.js`
- `communication-style-engine.js`
- `contact-attempt-engine.js`
- `contact-response-engine.js`
- `conversion-metrics-engine.js`
- `dna-script-strategy-engine.js`
- `ghosting-status-engine.js`
- `lead-temperature-engine.js`
- `live-communication-engine.js`
- `next-best-question-engine.js`
- `prospect-personality-engine.js`
- `prospecting-dashboard.viewmodel.js`
- `question-answer-engine.js`
- `question-session-engine.js`
- `question-style-match-engine.js`
- `reactivation-strategy-engine.js`
- `sales-coach-engine.js`
- `sales-context-engine.js`
- `script-adaptation-engine.js`
- `shared-objection-shield-engine.js`
- `smart-outreach-engine.js`

### Relationship Intelligence Engine

Detected type: engine / test

Probable branch: Relationship Intelligence Engine

Confidence: HIGH

Recommendation: future relocation candidate / branch closure review

Constitutional notes: Relationship recommendation is not execution. Missing relationship evidence is not negative evidence.

- `life-event-engine.js`
- `referral-opportunity-engine.js`
- `relationship-health-engine.js`
- `relationship-health-master-test.js`
- `relationship-master-acceptance-test.js`
- `relationship-master-engine.js`
- `relationship-next-action-engine.js`
- `relationship-next-action-master-test.js`
- `relationship-opportunity-engine.js`
- `relationship-opportunity-master-test.js`
- `relationship-review-engine.js`
- `relationship-review-master-test.js`
- `relationship-timeline-engine.js`
- `relationship-timeline-master-test.js`

### Policy & Sales Operations

Detected type: engine / test / map

Probable branch: Policy & Sales Operations

Confidence: MEDIUM

Recommendation: future relocation candidate / adapter boundary review

Constitutional notes: Task suggestion is not task execution. Message/channel context is not send truth. Policy facts require evidence.

- `activity-feed-engine.js`
- `activity-stream-engine.js`
- `cartera-import-engine.js`
- `live-operational-state-engine.js`
- `operational-feed-engine.js`
- `phone-call-engine.js`
- `policy-field-confidence-map.js`
- `shared-policy-currency-timeline-engine.js`
- `shared-policy-currency-timeline-smoke-test.js`
- `whatsapp-action-engine.js`
- `whatsapp-link-engine.js`

### Manager OS / Manager & Team Intelligence

Detected type: utility / engine

Probable branch: Manager OS / Manager & Team Intelligence

Confidence: MEDIUM

Recommendation: needs boundary wrapper / source-truth review

Constitutional notes: Manager OS context is not punishment, ranking, promotion, revenue, compensation, payout, or lifecycle truth.

- `app-shell-manager.js`
- `memory-manager.js`
- `network-manager.js`
- `ovelay-manager.js`
- `overlay-manager.js`
- `payment-mode-coaching-engine.js`
- `route-transition-manager.js`
- `state-manager.js`

### Forecast / Productivity / Conservation Intelligence

Detected type: engine

Probable branch: Forecast / Productivity / Conservation Intelligence

Confidence: HIGH

Recommendation: keep documented only / scenario boundary review

Constitutional notes: Forecast/projection is not payout, compensation, official revenue, Advisor Lifecycle, promotion, or decision truth.

- `dynamic-cash-value-projection-engine.js`
- `future-currency-value-engine.js`
- `imagina-ser-retirement-fund-engine.js`
- `retirement-future-udi-projection-engine.js`
- `retirement-presentation-scenario-engine.js`
- `shared-currency-projection-engine.js`
- `shared-projection-scenarios-engine.js`

### Universal Command OS / Alfred

Detected type: engine

Probable branch: Universal Command OS / Alfred

Confidence: MEDIUM

Recommendation: needs action approval boundary

Constitutional notes: Command suggestion is not execution. Human approval/action gates remain required before external action.

- `quick-action-executor-engine.js`
- `quick-actions-engine.js`
- `search-index-engine.js`
- `search-quick-actions-engine.js`
- `search-ranking-engine.js`
- `universal-command-engine.js`
- `universal-search-engine.js`

### Platform Services

Detected type: engine

Probable branch: Platform Services

Confidence: MEDIUM

Recommendation: future relocation candidate / no action now

Constitutional notes: Platform owns infrastructure, not domain truth.

- `core-app-engine.js`
- `event-bus-engine.js`
- `event-client-review-engine.js`
- `event-log-engine.js`
- `render-engine.js`
- `responsive-engine.js`
- `shared-decision-score-engine.js`
- `storage-engine.js`
- `ui-render-engine.js`

### Evidence, Provenance, Rules, Periods, Source Truth

Detected type: engine

Probable branch: Evidence, Provenance, Rules, Periods, Source Truth

Confidence: MEDIUM

Recommendation: keep documented only / source-truth review

Constitutional notes: Evidence context is not domain truth by itself. Source ownership must remain explicit.

- `document-classification-engine.js`
- `entity-resolver-engine.js`
- `excel-parser-engine.js`
- `field-confidence-engine.js`
- `schema-field-engine.js`

### Revenue Generation Engine

Detected type: engine

Probable branch: Revenue Generation Engine

Confidence: HIGH

Recommendation: needs source-truth review

Constitutional notes: Revenue context is not official revenue truth. Forecast is not revenue truth.

- `monthly-revenue-engine.js`
- `revenue-forecast-engine.js`
- `revenue-optimization-engine.js`

### Compensation Intelligence

Detected type: engine

Probable branch: Compensation Intelligence

Confidence: HIGH

Recommendation: needs source-truth review

Constitutional notes: Candidate calculation is not payout truth. Payout truth requires official evidence.

- `commission-projection-engine.js`
- `commissionable-amount-engine.js`

### Advisor OS / Advisor Experience Intelligence

Detected type: engine / test

Probable branch: Advisor OS / Advisor Experience Intelligence

Confidence: MEDIUM

Recommendation: needs source-truth review

Constitutional notes: Advisor context is not Advisor Lifecycle, compensation, payout, promotion, or performance truth.

- `event-advisor-review-engine.js`
- `event-advisor-review-smoke-test.js`

### Learning Intelligence Engine

Detected type: engine

Probable branch: Learning Intelligence Engine

Confidence: MEDIUM

Recommendation: parked/deferred or needs review

Constitutional notes: Learning signal is not promotion, punishment, compensation, or lifecycle truth.

- `assistant-memory-engine.js`

## UNKNOWN / NEEDS REVIEW Queue

Detected type: engine

Probable branch: UNKNOWN / NEEDS REVIEW

Confidence: LOW

Recommendation: needs source-truth review

Constitutional notes: Unknown is not zero. Generic filename evidence must not be forced into false Build Tree truth.

- `accessibility-engine.js`
- `action-resolver-engine.js`
- `ai-context-engine.js`
- `analytics-engine.js`
- `channel-adaptation-engine.js`
- `channel-performance-engine.js`
- `client-engagement-engine.js`
- `clipboard-action-engine.js`
- `contextual-suggestion-engine.js`
- `copilot-suggestion-engine.js`
- `currency-normalization-engine.js`
- `daily-points-engine.js`
- `exchange-rate-cache-engine.js`
- `financial-responsibility-engine.js`
- `forge-ai-guardrails-engine.js`
- `forge-presentation-engine.js`
- `introduction-message-engine.js`
- `line-of-business-engine.js`
- `mass-import-mapping-engine.js`
- `momentum-engine.js`
- `mutation-engine.js`
- `pipeline-stage-engine.js`
- `primary-risk-engine.js`
- `proposal-family-engine.js`
- `ranking-engine.js`
- `realtime-engine.js`
- `risk-story-context-engine.js`
- `seen-but-no-reply-engine.js`
- `shared-banxico-rate-engine.js`
- `shared-client-language-engine.js`
- `shared-clp-engine.js`
- `shared-decision-appendix-engine.js`
- `shared-decision-clarity-engine.js`
- `shared-document-priority-engine.js`
- `shared-education-paths-engine.js`
- `shared-financial-return-engine.js`
- `shared-human-financial-language-engine.js`
- `shared-meaningful-numbers-engine.js`
- `shared-mxn-timeline-engine.js`
- `shared-price-placement-engine.js`
- `shared-protection-efficiency-engine.js`
- `shared-recovery-analysis-engine.js`
- `shared-tax-profile-engine.js`
- `smart-agenda-engine.js`
- `smart-field-detection-engine.js`
- `smart-priority-engine.js`
- `smart-referrals-engine.js`
- `staging-cleanup-engine.js`
- `staging-review-engine.js`
- `tone-performance-engine.js`
- `tone-profile-engine.js`
- `universal-filters-engine.js`
- `virtual-list-engine.js`
- `warm-market-segmentation-engine.js`

## Crosswalk Notes

- Root-level Nash files map to Nash Conversation Intelligence, but direct runtime execution remains prohibited until boundary-wrapped.
- Root-level Relationship files map cleanly to Relationship Intelligence, but branch-level closure and evidence/source/freshness contracts remain open.
- Root-level Product/GMM/Imagina/ORVI/Vida/Segu files likely map to Product Intelligence, but product truth still requires documentation and evidence packets.
- Root-level Sales Conversion files likely map to Sales Conversion, but recommendations cannot become execution.
- Root-level Policy/WhatsApp/activity files likely map to Policy & Sales Operations, but task/calendar/message delivery writes remain future gated work.
- Root-level revenue and compensation files require source ownership review before any truth claim.
- Generic root engines remain parked in review instead of being forced into false branch truth.

## Suggested Future Phases

1. ROOT_NASH_LEGACY_RUNTIME_BOUNDARY_REVIEW
2. ROOT_RELATIONSHIP_INTELLIGENCE_PLACEMENT_AND_SOURCE_REVIEW
3. ROOT_PRODUCT_INTELLIGENCE_EVIDENCE_PACKET_PLACEMENT_REVIEW
4. ROOT_SALES_CONVERSION_RECOMMENDATION_EXECUTION_BOUNDARY_REVIEW
5. ROOT_POLICY_OPERATIONS_ADAPTER_BOUNDARY_REVIEW
6. ROOT_UNKNOWN_ENGINE_SOURCE_TRUTH_TRIAGE

## What Forge Learned

- The repo still contains a large legacy/root operational surface.
- The unified semaforo Build Tree can classify probable ownership without claiming closure.
- Root location is a migration/documentation concern, not deletion authority.
- Unknown root engines need a review queue, not guessing.

## Appendix B Reference

Appendix 004B was created to extend this root-level placement inventory with an existing module capability inventory:

- `docs/architecture/source-truth/FORGE_EXISTING_MODULE_CAPABILITY_INVENTORY_APPENDIX_004B.md`

Appendix 004B:

- Extends this 004 inventory.
- Does not replace this 004 inventory.
- Does not move files.
- Does not refactor imports.
- Does not execute runtime modules.
- Does not approve runtime usage.
- Documents delivery, message, prompt, draft, action/runtime-risk, candidate, prospect, advisor, manager, Nash, relationship, policy, product, compensation, revenue, and intelligence capabilities where detected.

Boundary:

- A detected capability does not equal implementation closure.
- A detected capability does not equal approved runtime.
- A detected capability does not equal source truth.
- Link generation is not message send.
- Prompt generation is not draft approval.
- Human approval remains mandatory before action.
