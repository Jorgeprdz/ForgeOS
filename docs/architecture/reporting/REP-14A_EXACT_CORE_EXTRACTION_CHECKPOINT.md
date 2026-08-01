# REP-14A — Exact Universal Reporting Core Extraction Checkpoint

Status: CORE_EXTRACTED / VALIDATION_PENDING
Date: 2026-07-31
Branch: `integration/reporting-source-truth-reconciliation`
Source: `feature/universal-reporting-kernel-foundation`

```text
EXTRACTION_METHOD=EXISTING_GIT_BLOB_SHA
TEXT_RECONSTRUCTION=NO
SEMANTIC_REWRITE=NO
PROVIDERS_EXTRACTED=NO
UI_MUTATION=NO
EXPORT_MUTATION=NO
```

## Exact core extracted

The following source blobs were mounted directly into the current production-derived branch:

```text
advisor-os/reporting/domain/reporting-kernel-contract.mjs
advisor-os/reporting/domain/reporting-calendar-policy.mjs
advisor-os/reporting/domain/report-definition.mjs
advisor-os/reporting/domain/report-comparison-definition.mjs
advisor-os/reporting/application/report-provider-port.mjs
advisor-os/reporting/runtime/universal-reporting-kernel.mjs
advisor-os/reporting/runtime/universal-period-resolver.mjs
advisor-os/reporting/runtime/universal-report-aggregation-runtime.mjs
advisor-os/reporting/runtime/report-comparison-engine.mjs
```

Core extraction commit:

```text
6fd817c0aae6f73ed3c1843ef2161b967a9927fc
```

## Boundary confirmation

```text
DOMAIN_NEUTRAL_CORE=EXTRACTED
CURRENT_DOMAIN_PROVIDERS=NOT_REGISTERED
PARKED_DOMAIN_AUTHORITIES=NOT_PORTED
REPORTING_UI=NOT_CONNECTED
REPORT_EXPORTS=NOT_CONNECTED
AI_RUNTIME=NOT_CONNECTED
```

## Validation status

The original isolated test harness has not yet been fully restored and executed on the current branch. Therefore REP-14 is not closed.

```text
EXACT_SOURCE_PARITY=PASS_BY_BLOB_IDENTITY
IMPORT_GRAPH_VALIDATION=PENDING
NODE_TESTS=PENDING
CURRENT_TREE_COMPATIBILITY=PENDING
REP_14_COMPLETE=NO
```

## Next

```text
NEXT=REP_14B_RESTORE_CORE_TEST_HARNESS_AND_VALIDATE
```
