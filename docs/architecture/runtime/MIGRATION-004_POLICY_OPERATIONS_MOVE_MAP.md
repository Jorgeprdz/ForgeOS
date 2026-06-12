# MIGRATION-004 Policy Operations Move Map

Status: PLANNING COMPLETE / AWAITING EXECUTION APPROVAL

## Scope

This move map identifies a controlled Policy Operations sub-batch for physical migration.

No files were moved. No imports were rewritten. No folders were created.

## Batch Decision

Recommended batch size: 77 files

Rationale:

- All selected files are high-confidence Policy Operations assets.
- All selected files are `NO_IMPORTS` in the current root-level dependency scan.
- All selected files have zero detected root JS consumers.
- Route-level `cartera.js` and route-adjacent cartera service coupling are excluded.
- Files requiring simple or complex rewrites are excluded from the execution set.

## Destination Structure

Recommended structure for this batch:

```text
policy-operations/
  policy-detail/
  policy-timeline/
  renewals/
  tasks/
  evidence/
  client-records/
```

Policy Operations should use subfolders for this batch. A flat folder would immediately recreate root-style disorder inside the domain.

## Move Map

| Current Path | Destination Path | Owner | Dependency Class | Consumers Affected | Risk | Eligible |
|---|---|---|---|---:|---|---|
| `cartera-utils.js` | `policy-operations/client-records/cartera-utils.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `csv-parser-engine.js` | `policy-operations/evidence/csv-parser-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `drag-drop-policy-zone.js` | `policy-operations/policy-detail/drag-drop-policy-zone.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `import-progress-engine.js` | `policy-operations/evidence/import-progress-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `mass-import-preview-engine.js` | `policy-operations/evidence/mass-import-preview-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `mass-import-validation-engine.js` | `policy-operations/evidence/mass-import-validation-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `ocr-result-cache.js` | `policy-operations/evidence/ocr-result-cache.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `policy-activity-engine.js` | `policy-operations/policy-timeline/policy-activity-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `policy-ai-insights-engine.js` | `policy-operations/policy-detail/policy-ai-insights-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `policy-ai-parser.js` | `policy-operations/evidence/policy-ai-parser.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `policy-auto-approval-engine.js` | `policy-operations/policy-detail/policy-auto-approval-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `policy-auto-save-engine.js` | `policy-operations/policy-detail/policy-auto-save-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `policy-batch-processing-engine.js` | `policy-operations/evidence/policy-batch-processing-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `policy-client-summary-engine.js` | `policy-operations/client-records/policy-client-summary-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `policy-context-engine.js` | `policy-operations/policy-detail/policy-context-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `policy-core-engine.js` | `policy-operations/policy-detail/policy-core-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `policy-detail-alert-engine.js` | `policy-operations/policy-detail/policy-detail-alert-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `policy-detail-engine.js` | `policy-operations/policy-detail/policy-detail-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `policy-detail-view-model.js` | `policy-operations/policy-detail/policy-detail-view-model.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `policy-document-classifier.js` | `policy-operations/evidence/policy-document-classifier.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `policy-document-engine.js` | `policy-operations/evidence/policy-document-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `policy-duplicate-engine.js` | `policy-operations/policy-detail/policy-duplicate-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `policy-filter-engine.js` | `policy-operations/policy-detail/policy-filter-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `policy-financial-summary-engine.js` | `policy-operations/policy-detail/policy-financial-summary-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `policy-followup-engine.js` | `policy-operations/tasks/policy-followup-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `policy-human-review-engine.js` | `policy-operations/evidence/policy-human-review-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `policy-import-dashboard-engine.js` | `policy-operations/evidence/policy-import-dashboard-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `policy-import-engine.js` | `policy-operations/evidence/policy-import-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `policy-import-errors-engine.js` | `policy-operations/evidence/policy-import-errors-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `policy-import-metrics-engine.js` | `policy-operations/evidence/policy-import-metrics-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `policy-import-queue.js` | `policy-operations/evidence/policy-import-queue.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `policy-import-summary.js` | `policy-operations/evidence/policy-import-summary.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `policy-indexing-engine.js` | `policy-operations/policy-detail/policy-indexing-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `policy-ingestion-orchestrator.js` | `policy-operations/evidence/policy-ingestion-orchestrator.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `policy-last-contact-engine.js` | `policy-operations/policy-detail/policy-last-contact-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `policy-live-state-engine.js` | `policy-operations/policy-detail/policy-live-state-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `policy-metadata-engine.js` | `policy-operations/policy-detail/policy-metadata-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `policy-normalization-engine.js` | `policy-operations/policy-detail/policy-normalization-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `policy-ocr-engine.js` | `policy-operations/evidence/policy-ocr-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `policy-operational-center-engine.js` | `policy-operations/policy-detail/policy-operational-center-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `policy-quick-actions-engine.js` | `policy-operations/policy-detail/policy-quick-actions-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `policy-relationship-score-engine.js` | `policy-operations/policy-detail/policy-relationship-score-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `policy-renewal-engine.js` | `policy-operations/renewals/policy-renewal-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `policy-renewal-status-engine.js` | `policy-operations/renewals/policy-renewal-status-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `policy-review-priority-engine.js` | `policy-operations/policy-detail/policy-review-priority-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `policy-review-ui-engine.js` | `policy-operations/policy-detail/policy-review-ui-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `policy-risk-engine.js` | `policy-operations/policy-detail/policy-risk-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `policy-schema-validator-engine.js` | `policy-operations/evidence/policy-schema-validator-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `policy-search-engine.js` | `policy-operations/policy-detail/policy-search-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `policy-side-by-side-engine.js` | `policy-operations/policy-detail/policy-side-by-side-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `policy-smart-sort-engine.js` | `policy-operations/policy-detail/policy-smart-sort-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `policy-staging-cache.js` | `policy-operations/evidence/policy-staging-cache.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `policy-staging-status-engine.js` | `policy-operations/evidence/policy-staging-status-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `policy-status-engine.js` | `policy-operations/policy-detail/policy-status-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `policy-storage-engine.js` | `policy-operations/policy-detail/policy-storage-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `policy-summary-engine.js` | `policy-operations/policy-detail/policy-summary-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `policy-task-engine.js` | `policy-operations/tasks/policy-task-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `policy-task-priority-engine.js` | `policy-operations/tasks/policy-task-priority-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `policy-timeline-engine.js` | `policy-operations/policy-timeline/policy-timeline-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `policy-timeline-event.factory.js` | `policy-operations/policy-timeline/policy-timeline-event.factory.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `policy-timeline-group-engine.js` | `policy-operations/policy-timeline/policy-timeline-group-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `policy-timeline-query-engine.js` | `policy-operations/policy-timeline/policy-timeline-query-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `policy-timeline-view-model.js` | `policy-operations/policy-timeline/policy-timeline-view-model.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `policy-timeline.repository.js` | `policy-operations/policy-timeline/policy-timeline.repository.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `policy-timeline.types.js` | `policy-operations/policy-timeline/policy-timeline.types.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `policy-validation-engine.js` | `policy-operations/policy-detail/policy-validation-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `policy-workspace-engine.js` | `policy-operations/policy-detail/policy-workspace-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `renewal-intelligence-engine.js` | `policy-operations/renewals/renewal-intelligence-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `task-engine.js` | `policy-operations/tasks/task-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `task-feed-engine.js` | `policy-operations/tasks/task-feed-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `task-priority-engine.js` | `policy-operations/tasks/task-priority-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `task-quick-action-engine.js` | `policy-operations/tasks/task-quick-action-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `ai-task-suggestion-engine.js` | `policy-operations/tasks/ai-task-suggestion-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `auto-task-generator-engine.js` | `policy-operations/tasks/auto-task-generator-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `overdue-task-engine.js` | `policy-operations/tasks/overdue-task-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `realtime-task-engine.js` | `policy-operations/tasks/realtime-task-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |
| `google-calendar-engine.js` | `policy-operations/tasks/google-calendar-engine.js` | Policy Operations | NO_IMPORTS | 0 | LOW | YES |

## Estimated Root Reduction

Expected root reduction if approved: 77 files.
