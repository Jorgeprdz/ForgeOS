# REP-14 — Universal Reporting Core Extraction

Status: ACCEPTED
Date: 2026-07-31
Branch: `integration/reporting-source-truth-reconciliation`

```text
SCOPE=DOMAIN_NEUTRAL_REPORTING_CORE
PROVIDERS=NOT_INCLUDED
UI=NOT_INCLUDED
EXPORTS=NOT_INCLUDED
AI=NOT_INCLUDED

REP_14_UNIVERSAL_REPORTING_CORE_EXTRACTION=PASS
EXACT_SOURCE_EXTRACTION=PASS
IMPORT_GRAPH=PASS
ISOLATED_TESTS=PASS
DEFECT_RECONCILIATION=NO_DEFECTS_FOUND
```

## Extraction boundary

The reporting core was extracted from the parked source branch into the current production-based integration branch. Only universal contracts, internal execution dependencies and runtimes were authorized.

## Extracted core

### Domain contracts

- `advisor-os/reporting/domain/reporting-kernel-contract.mjs`
- `advisor-os/reporting/domain/reporting-calendar-policy.mjs`
- `advisor-os/reporting/domain/report-definition.mjs`
- `advisor-os/reporting/domain/report-comparison-definition.mjs`
- `advisor-os/reporting/domain/universal-report-model.mjs`

### Application boundary

- `advisor-os/reporting/application/report-provider-port.mjs`

### Runtimes

- `advisor-os/reporting/runtime/universal-reporting-kernel.mjs`
- `advisor-os/reporting/runtime/universal-period-resolver.mjs`
- `advisor-os/reporting/runtime/report-provider-runtime.mjs`
- `advisor-os/reporting/runtime/universal-report-aggregation-runtime.mjs`
- `advisor-os/reporting/runtime/report-comparison-engine.mjs`

`universal-report-model.mjs` and `report-provider-runtime.mjs` were added during import-graph reconciliation because aggregation and comparison depend on them. They remain domain-neutral and do not register any productive provider.

## Exact extraction evidence

The implementation files and isolated tests were mounted using their original Git blob identities from `feature/universal-reporting-kernel-foundation`. No contract was reconstructed from truncated output and no semantic rewrite was introduced.

```text
CORE_EXTRACTION_COMMIT=6fd817c0aae6f73ed3c1843ef2161b967a9927fc
TEST_HARNESS_COMMIT=7fa4b957b3f0bf83ac6c84dfc3eb1e8c1496c3ba
SOURCE_PARITY=EXACT_BLOB_IDENTITY
```

## Restored isolated test harness

- `tests/universal-reporting-kernel-test.mjs`
- `tests/universal-period-resolver-test.mjs`
- `tests/report-provider-runtime-test.mjs`
- `tests/universal-report-aggregation-runtime-test.mjs`
- `tests/report-comparison-engine-test.mjs`

## CI acceptance

```text
WORKFLOW=Reporting Core Validation
WORKFLOW_RUN_ID=30671898865
WORKFLOW_RUN_NUMBER=1
WORKFLOW_STATUS=COMPLETED
WORKFLOW_CONCLUSION=SUCCESS
JOB_ID=91291187291
JOB_NAME=validate

VALIDATE_IMPORTS=PASS
RUN_ISOLATED_CORE_TESTS=PASS
```

The validation executed syntax/import checks for the complete extracted core and ran all five isolated Node test suites successfully.

## Constitutional boundaries preserved

```text
ONE_REPORTING_AUTHORITY=PASS
ONE_CANONICAL_AS_OF=PASS
ONE_PERIOD_RESOLVER=PASS
DETERMINISTIC_REQUEST_IDENTITY=PASS
IMMUTABLE_OUTPUTS=PASS
NO_PROVIDER_REGISTRATION=PASS
NO_DOMAIN_TRUTH_OWNERSHIP=PASS
NO_UI_COUPLING=PASS
NO_EXPORT_COUPLING=PASS
NO_PERSISTENCE_MUTATION=PASS
NO_AI_COUPLING=PASS
```

## Defect reconciliation

No runtime or contract defect was found after exact extraction. The only reconciliation finding was an incomplete initial extraction manifest: aggregation required `universal-report-model.mjs` and `report-provider-runtime.mjs`. Both were restored exactly and the resulting graph passed CI without code modification.

## Closure

```text
REP_14A_EXACT_CORE_EXTRACTION=PASS
REP_14B_TEST_HARNESS_AND_VALIDATION=PASS
REP_14_COMPLETE=YES

NEXT=REP_15_UNIVERSAL_REPORT_MODEL_AND_CHART_READY_SURFACE_CONTRACT
```
