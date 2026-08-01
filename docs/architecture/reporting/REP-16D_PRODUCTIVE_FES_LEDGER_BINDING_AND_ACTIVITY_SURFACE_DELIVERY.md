# REP-16D — Productive FES Ledger Binding and Activity Surface Delivery

Status: CLOSED
Date: 2026-07-31
Branch: `integration/reporting-source-truth-reconciliation`
Product source: `ebde2dbc2478e2ae39c43ea3e9f8e6c84e27107f`

```text
SOURCE_EVENT_AUTHORITY=FES_CANONICAL_ACTIVITY_EVENT
PRODUCTIVE_LEDGER=FES-02C_BROWSER_RUNTIME
AUTHORITY_BINDING=AUTHENTICATED_SESSION
SYNC_MODE=EXPLICIT_BEFORE_READ
LOCAL_CACHE_AS_COMPLETE_TRUTH=NO
PARALLEL_LEDGER=NO
ACTIVITY_WRITE_AUTHORITY=NO
SCORING_AUTHORITY=NO
AI_DECISION_AUTHORITY=NO
```

## Productive path delivered

```text
Authenticated Forge session
  -> FES-02C browser runtime
  -> Supabase RPC sync
  -> tenant-scoped IndexedDB ledger
  -> productive Activity reporting bridge
  -> FES Activity source adapter
  -> Activity provider
  -> universal reporting runtime
  -> chart-ready Activity projection
  -> Material 3 Activity module
```

The reporting bridge does not append, edit, correct or acknowledge events. It synchronizes the existing FES ledger explicitly and reads canonical ledger entries through `listEntries()`.

If synchronization fails, cached entries are not presented as complete current truth. The Material 3 surface enters `source-unavailable` and offers an explicit retry.

## Browser compatibility

The universal reporting source remains unchanged and continues importing `node:crypto`. The Material 3 entry installs a browser import-map binding for that exact specifier to a local synchronous SHA-256 compatibility module.

```text
NODE_RUNTIME_CRYPTO=NATIVE_NODE_CRYPTO
BROWSER_RUNTIME_CRYPTO=LOCAL_SHA256_COMPATIBILITY_MODULE
DIGEST_ALGORITHM=SHA256
UNIVERSAL_REPORTING_SOURCE_DUPLICATED=NO
SHA256_BROWSER_NODE_PARITY=PASS
```

The compatibility module exposes only the `createHash("sha256").update(...).digest("hex")` surface required by reporting identity generation.

## Material 3 surface

```text
ROUTE=actividad
NAVIGATION_AVAILABILITY=available
DEFAULT_PERIOD=WEEK_TO_DATE
SUPPORTED_PERIODS=TODAY+WEEK_TO_DATE+MONTH_TO_DATE+ROLLING_30_DAYS
SOURCE_VISUALIZATION_POLICY=CHART_READY_SURFACE
RECOMMENDED_VISUALIZATION=STACKED_BAR
```

The UI reads totals directly from `report.totals.activityCount`. It does not calculate business totals, create zero dates or infer scoring. Stacked-bar segment geometry uses chart-ready point values strictly for presentation.

Each rendered segment preserves:

```text
pointId
rowKeys
activityType
evaluationDate
activityCount
```

## Mobile layout

The Activity module reserves a bottom safe area above the floating navigation pill:

```text
BOTTOM_CONTENT_RESERVE=170px+safe-area-inset-bottom
NAV_PILL_REPOSITIONED=NO
```

## Files delivered

```text
docs/static-preview/forge-alive-material3/node-crypto-shim.mjs
docs/static-preview/forge-alive-material3/activity-ledger-reporting-bridge.mjs
docs/static-preview/forge-alive-material3/activity-ledger-reporting-bridge.js
docs/static-preview/forge-alive-material3/activity-module.js
docs/static-preview/forge-alive-material3/activity-module.css
docs/static-preview/forge-alive-material3/app.js
docs/static-preview/forge-alive-material3/forge-navigation-contract.js
tests/rep-16d-productive-activity-delivery-test.mjs
```

## Defect reconciliation

The first REP-16D validation run passed 243 of 244 tests. The only failure was a stale static assertion expecting `result.report.totals.activityCount`, while the production module correctly destructures `report` and reads `report.totals.activityCount`.

No runtime, bridge, reporting, ledger or Material 3 semantic defect was found.

```text
PRODUCTION_DEFECTS_FOUND=0
LEDGER_BRIDGE_DEFECTS_FOUND=0
UNIVERSAL_RUNTIME_DEFECTS_FOUND=0
CHART_READY_DEFECTS_FOUND=0
MATERIAL3_SURFACE_DEFECTS_FOUND=0
STALE_STATIC_ASSERTIONS_FOUND=1
ASSERTION_RECONCILIATION=PASS
```

## CI evidence

```text
WORKFLOW=Reporting Core Validation
RUN_ID=30678603745
RUN_NUMBER=43
JOB_ID=91310834600
STATUS=COMPLETED
CONCLUSION=SUCCESS
NODE_VERSION=22.23.1

TESTS=244
PASS=244
FAIL=0
CANCELLED=0
SKIPPED=0
TODO=0
```

Dedicated REP-16D cases:

```text
SHA256_BROWSER_NODE_PARITY=PASS
AUTHENTICATED_FES_LEDGER_TO_UNIVERSAL_ACTIVITY_RUNTIME=PASS
CACHE_NOT_PROMOTED_ON_SYNC_FAILURE=PASS
TENANT_AUTHORITY_DRIFT_REJECTION=PASS
CANONICAL_SHELL_AND_MATERIAL3_DELIVERY_BOUNDARIES=PASS
```

The technical validation PR was closed without merge because its only delta was a non-runtime CI marker.

```text
VALIDATION_PR=72
VALIDATION_PR_MERGED=NO
VALIDATION_MARKER_PROMOTED=NO
```

## Closure result

```text
AUTHENTICATED_LEDGER_BINDING=PASS
SYNC_BEFORE_READ=PASS
TENANT_AUTHORITY_ISOLATION=PASS
FES_TO_UNIVERSAL_REPORT=PASS
UNIVERSAL_REPORT_TO_CHART_READY=PASS
CACHE_NOT_PROMOTED_ON_SYNC_FAILURE=PASS
ACTIVITY_ROUTE_AVAILABLE=PASS
POINT_ROW_TRACEABILITY_PRESERVED=PASS
NO_ACTIVITY_WRITE_AUTHORITY=PASS
NO_SCORING_AUTHORITY=PASS
NO_AI_DECISION_AUTHORITY=PASS
MOBILE_SAFE_AREA=PASS
CORE_REGRESSION=NONE
CI=PASS
REP_16D_COMPLETE=YES
```

## Deployment boundary

REP-16D delivers and validates the productive source binding and Material 3 implementation in the integration branch. It does not claim live browser acceptance or production deployment.

```text
LIVE_BROWSER_AUTH_ACCEPTANCE=NOT_RUN
LIVE_SUPABASE_RPC_ACCEPTANCE=NOT_RUN
VISUAL_ACCEPTANCE=NOT_RUN
MAIN_DEPLOYMENT=NOT_DONE
PRODUCTION_LIVE=NO
```

The integration pull request remains non-mergeable against `main` and requires source reconciliation before deployment:

```text
INTEGRATION_PR=46
INTEGRATION_PR_STATE=OPEN
INTEGRATION_PR_MERGEABLE=NO
MAIN_RECONCILIATION_REQUIRED=YES
```

```text
NEXT=REP_16E_ACTIVITY_PRODUCTIVE_BROWSER_ACCEPTANCE_AND_DEPLOYMENT_GATE
```
