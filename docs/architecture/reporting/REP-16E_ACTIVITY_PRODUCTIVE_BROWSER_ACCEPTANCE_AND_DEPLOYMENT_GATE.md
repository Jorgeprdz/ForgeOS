# REP-16E — Activity Productive Browser Acceptance and Deployment Gate

Status: IN PROGRESS
Date: 2026-07-31
Branch: `integration/reporting-source-truth-reconciliation`

## Roadmap position

```text
REPORTING_MACRO_STAGE=4_OF_4
REPORTING_MACRO_SEQUENCE=REP_13+REP_14+REP_15+REP_16
ACTIVITY_RECONSTRUCTION_SUBSTAGE=5_OF_5
ACTIVITY_SUBSTAGE_SEQUENCE=REP_16A+REP_16B+REP_16C+REP_16D+REP_16E
```

REP-16D delivered the productive FES ledger bridge and Material 3 Activity surface. REP-16E is the final acceptance and deployment gate. It does not add a second reporting model or new business authority.

## Current objective

```text
OBJECTIVE=PROVE_THE_DELIVERED_ACTIVITY_PATH_IN_A_REAL_BROWSER_AND_RECONCILE_TO_CURRENT_MAIN
NEW_EVENT_AUTHORITY=NO
NEW_ACTIVITY_WRITE_AUTHORITY=NO
NEW_SCORING_AUTHORITY=NO
NEW_AI_DECISION_AUTHORITY=NO
```

The gate must prove:

1. The Material 3 shell and navigation render before slow environment, quote, authentication or FES authorities.
2. Direct navigation to `?nav=actividad` mounts the canonical Activity module.
3. The productive FES browser ledger reaches the universal reporting runtime and chart-ready surface in Chromium.
4. `pointId` and `rowKeys` remain present in the rendered chart.
5. Sync failure does not promote IndexedDB cache as complete current truth.
6. Mobile content can scroll above the intentionally floating nav pill.
7. Current `main` boot-order protections remain intact.
8. The integration branch is reconciled with current `main` before merge or deployment.
9. Live authenticated Supabase RPC acceptance and visual acceptance are recorded after deployment.

## Main reconciliation discovered

While Reporting was reconstructed, `main` received Material 3 production fixes for:

```text
SHELL_FIRST_NAVIGATION=M05L
CACHE_REFRESH=M05L_HOTFIX
PRINT_PDF_HISTORY_EAGER_MOUNT=M05M
PUBLIC_ENV_BEFORE_AUTH_CONFIG=M05N
```

The former REP-16D `app.js` awaited quote, auth and FES authorities before initializing the shell. Promoting that file unchanged would regress the current production boot contract.

REP-16E therefore reconciles Activity onto the current shell-first bootstrap:

```text
SHELL_INITIALIZATION=BEFORE_EXTERNAL_AUTHORITIES
PRINTABLE_AUTHORITY=EAGER_NON_BLOCKING
ENVIRONMENT_AUTHORITY=SHARED
QUOTE_AUTHORITIES=ASYNC_AFTER_SHELL
AUTH_AUTHORITIES=ASYNC_AFTER_SHELL
FES_AUTHORITIES=ASYNC_AFTER_SHELL
ACTIVITY_REFRESH=ONLY_WHEN_ACTIVE
```

## Browser gate

```text
BROWSER=CHROMIUM
VIEWPORTS=DESKTOP+MOBILE
CONFIG=playwright.rep16e.config.mjs
SUITE=tests/e2e/rep-16e-activity-browser.spec.mjs
WORKFLOW=.github/workflows/rep-16e-activity-browser-acceptance.yml
```

Browser cases:

```text
SLOW_AUTHORITIES_DO_NOT_BLOCK_SHELL=PASS_REQUIRED
DIRECT_ACTIVITY_ROUTE=PASS_REQUIRED
FES_TO_CHART_READY_BROWSER_PATH=PASS_REQUIRED
POINT_ROW_TRACEABILITY=PASS_REQUIRED
MOBILE_NAV_SAFE_AREA=PASS_REQUIRED
SYNC_FAILURE_CACHE_POLICY=PASS_REQUIRED
PAGE_ERRORS=ZERO_REQUIRED
```

## Deployment gate

The phase cannot close from mocked browser boundaries alone.

```text
CURRENT_MAIN_RECONCILIATION=PASS_REQUIRED
PR_MERGEABLE=PASS_REQUIRED
CORE_CI=PASS_REQUIRED
CHROMIUM_CI=PASS_REQUIRED
MERGE_TO_MAIN=PASS_REQUIRED
PAGES_DEPLOYMENT=PASS_REQUIRED
LIVE_BROWSER_AUTH_ACCEPTANCE=PASS_REQUIRED
LIVE_SUPABASE_RPC_ACCEPTANCE=PASS_REQUIRED
VISUAL_ACCEPTANCE_MOBILE=PASS_REQUIRED
VISUAL_ACCEPTANCE_DESKTOP=PASS_REQUIRED
```

## Current state

```text
REP_16D_PRODUCT_SOURCE=ebde2dbc2478e2ae39c43ea3e9f8e6c84e27107f
REP_16D_TESTS=244
REP_16D_PASS=244
REP_16D_FAIL=0

REP_16E_BOOT_RECONCILIATION=IMPLEMENTED
REP_16E_CHROMIUM_CONFIG=CREATED
REP_16E_CHROMIUM_SUITE=CREATED
REP_16E_CHROMIUM_WORKFLOW=CREATED
REP_16E_CHROMIUM_RESULT=PENDING
CURRENT_MAIN_RECONCILIATION=PENDING
LIVE_DEPLOYMENT=PENDING
REP_16E_COMPLETE=NO
```

```text
NEXT=REP_16E_RUN_CHROMIUM_GATE_AND_RECONCILE_CURRENT_MAIN
```
