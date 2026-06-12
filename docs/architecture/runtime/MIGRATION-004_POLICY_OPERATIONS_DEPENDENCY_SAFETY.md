# MIGRATION-004 Policy Operations Dependency Safety

Status: DISCOVERY COMPLETE

## Scope

This document records dependency safety for the MIGRATION-004 Policy Operations planning batch.

No files were moved. No imports were rewritten. No folders were created.

## Candidate Extraction

Source inventory:

- Remaining root runtime assets after MIGRATION-003: 598 top-level `.js` files
- Preferred Policy Operations matches found: 101
- Eligible candidates found: 99
- Selected execution candidates: 77
- Reserve simple/internal candidates: 8
- Complex or blocked candidates excluded: 2

Preferred match signals:

- `policy` / `policies`
- `renewal` / `renewals`
- `task`
- `timeline`
- `evidence`
- `client`
- `cartera` only when not route-level `cartera.js`
- `case`
- `underwriting`
- `document`
- `record`
- import, validation, normalization, OCR, and staging workflow names

## Dependency Class Definitions

| Class | Meaning | MIGRATION-004 Policy |
|---|---|---|
| `NO_IMPORTS` | File has no detected local imports and no detected root JS consumers. | Eligible |
| `INTERNAL_ONLY` | File imports or is consumed only inside a coherent batch. | Deferred unless all related files are in scope |
| `SIMPLE_REWRITE` | File has limited direct imports or consumers that can be mechanically updated. | Deferred from this no-rewrite batch |
| `COMPLEX_REWRITE` | File has broad consumers, route adjacency, or multi-module dependency surface. | Excluded |
| `BLOCKED` | File has protected route/shell coupling or missing local targets. | Excluded |

## Selected Batch Safety Summary

| Metric | Count |
|---|---:|
| Selected files | 77 |
| `NO_IMPORTS` | 77 |
| `INTERNAL_ONLY` | 0 |
| `SIMPLE_REWRITE` | 0 |
| `COMPLEX_REWRITE` | 0 |
| `BLOCKED` | 0 |
| Local imports requiring rewrite | 0 |
| Root JS consumers requiring rewrite | 0 |
| Protected route consumers | 0 |

## Selected Files By Destination

### `policy-operations/client-records/`

- `cartera-utils.js`
- `policy-client-summary-engine.js`

### `policy-operations/evidence/`

- `csv-parser-engine.js`
- `import-progress-engine.js`
- `mass-import-preview-engine.js`
- `mass-import-validation-engine.js`
- `ocr-result-cache.js`
- `policy-ai-parser.js`
- `policy-batch-processing-engine.js`
- `policy-document-classifier.js`
- `policy-document-engine.js`
- `policy-human-review-engine.js`
- `policy-import-dashboard-engine.js`
- `policy-import-engine.js`
- `policy-import-errors-engine.js`
- `policy-import-metrics-engine.js`
- `policy-import-queue.js`
- `policy-import-summary.js`
- `policy-ingestion-orchestrator.js`
- `policy-ocr-engine.js`
- `policy-schema-validator-engine.js`
- `policy-staging-cache.js`
- `policy-staging-status-engine.js`

### `policy-operations/policy-detail/`

- `drag-drop-policy-zone.js`
- `policy-ai-insights-engine.js`
- `policy-auto-approval-engine.js`
- `policy-auto-save-engine.js`
- `policy-context-engine.js`
- `policy-core-engine.js`
- `policy-detail-alert-engine.js`
- `policy-detail-engine.js`
- `policy-detail-view-model.js`
- `policy-duplicate-engine.js`
- `policy-filter-engine.js`
- `policy-financial-summary-engine.js`
- `policy-indexing-engine.js`
- `policy-last-contact-engine.js`
- `policy-live-state-engine.js`
- `policy-metadata-engine.js`
- `policy-normalization-engine.js`
- `policy-operational-center-engine.js`
- `policy-quick-actions-engine.js`
- `policy-relationship-score-engine.js`
- `policy-review-priority-engine.js`
- `policy-review-ui-engine.js`
- `policy-risk-engine.js`
- `policy-search-engine.js`
- `policy-side-by-side-engine.js`
- `policy-smart-sort-engine.js`
- `policy-status-engine.js`
- `policy-storage-engine.js`
- `policy-summary-engine.js`
- `policy-validation-engine.js`
- `policy-workspace-engine.js`

### `policy-operations/policy-timeline/`

- `policy-activity-engine.js`
- `policy-timeline-engine.js`
- `policy-timeline-event.factory.js`
- `policy-timeline-group-engine.js`
- `policy-timeline-query-engine.js`
- `policy-timeline-view-model.js`
- `policy-timeline.repository.js`
- `policy-timeline.types.js`

### `policy-operations/renewals/`

- `policy-renewal-engine.js`
- `policy-renewal-status-engine.js`
- `renewal-intelligence-engine.js`

### `policy-operations/tasks/`

- `policy-followup-engine.js`
- `policy-task-engine.js`
- `policy-task-priority-engine.js`
- `task-engine.js`
- `task-feed-engine.js`
- `task-priority-engine.js`
- `task-quick-action-engine.js`
- `ai-task-suggestion-engine.js`
- `auto-task-generator-engine.js`
- `overdue-task-engine.js`
- `realtime-task-engine.js`
- `google-calendar-engine.js`

## Excluded Or Deferred Candidates

| File | Dependency Class | Reason |
|---|---|---|
| cartera-service.js | COMPLEX_REWRITE | Imports 5 local modules and is part of route-adjacent cartera service coupling. |
| cartera-view.js | BLOCKED | References a missing relative target `../utils/cartera-utils.js` in the current root context. |
| cartera-events.js | INTERNAL_ONLY reserve | Depends on the excluded `cartera-service.js` consumer shape; defer to a cartera service batch. |
| cartera-import-engine.js | INTERNAL_ONLY reserve | Imports `./cartera-service.js`; defer with cartera service movement. |
| cartera-state.js | INTERNAL_ONLY reserve | Consumed by `cartera-service.js`; defer with cartera service movement. |
| cartera-validator.js | INTERNAL_ONLY reserve | Consumed by `cartera-service.js`; defer with cartera service movement. |
| document-classification-engine.js | SIMPLE_REWRITE reserve | Consumed by `forge-gmm-real-case-smoke-test.js`; keep out of no-rewrite batch. |
| mass-import-mapping-engine.js | SIMPLE_REWRITE reserve | Imports `./smart-field-detection-engine.js`; requires import mapping. |
| policy-field-confidence-map.js | SIMPLE_REWRITE reserve | Imports `./field-confidence-engine.js`; requires import mapping. |
| shared-client-language-engine.js | SIMPLE_REWRITE reserve | Consumed by `decision-appendix-master-test.js`; requires test import mapping. |

## Safety Verdict

Dependency safety: PASS

The selected batch is suitable for execution after approval because it requires physical movement only and no import rewrites are expected.
