# REP-16D — Productive FES Ledger Binding and Activity Surface Delivery

Status: IN VALIDATION
Date: 2026-07-31
Branch: `integration/reporting-source-truth-reconciliation`

```text
SOURCE_EVENT_AUTHORITY=FES_CANONICAL_ACTIVITY_EVENT
PRODUCTIVE_LEDGER=FES-02C_BROWSER_RUNTIME
AUTHORITY_BINDING=AUTHENTICATED_SESSION
SYNC_MODE=EXPLICIT_BEFORE_READ
LOCAL_CACHE_AS_COMPLETE_TRUTH=NO
PARALLEL_LEDGER=NO
ACTIVITY_WRITE_AUTHORITY=NO
AI_DECISION_AUTHORITY=NO
```

## Productive path

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

The UI reads totals directly from `report.totals.activityCount`. It does not calculate business totals, create zero dates or infer scoring. Stacked-bar segment geometry uses the chart-ready point values strictly for presentation.

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

## Files

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

## Validation gates

```text
SHA256_BROWSER_NODE_PARITY=PASS_REQUIRED
AUTHENTICATED_LEDGER_BINDING=PASS_REQUIRED
SYNC_BEFORE_READ=PASS_REQUIRED
TENANT_AUTHORITY_ISOLATION=PASS_REQUIRED
FES_TO_UNIVERSAL_REPORT=PASS_REQUIRED
UNIVERSAL_REPORT_TO_CHART_READY=PASS_REQUIRED
CACHE_NOT_PROMOTED_ON_SYNC_FAILURE=PASS_REQUIRED
ACTIVITY_ROUTE_AVAILABLE=PASS_REQUIRED
POINT_ROW_TRACEABILITY_PRESERVED=PASS_REQUIRED
NO_ACTIVITY_WRITE_AUTHORITY=PASS_REQUIRED
NO_SCORING_AUTHORITY=PASS_REQUIRED
NO_AI_DECISION_AUTHORITY=PASS_REQUIRED
MOBILE_SAFE_AREA=PASS_REQUIRED
CORE_REGRESSION=NONE_REQUIRED
CI=PASS_REQUIRED
```

```text
NEXT_AFTER_PASS=REP_16E_ACTIVITY_PRODUCTIVE_BROWSER_ACCEPTANCE_AND_DEPLOYMENT_GATE
```
