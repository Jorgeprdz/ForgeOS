# Pages Mick Module Graph Hotfix 001

## Incident

After PR #263 deployed, the authenticated canonical route displayed the pre-hydration static Forge Alive skeleton instead of the productive Home UI.

This was a real runtime regression, not browser cache.

## Root cause

The deployed `home-mick-goal-coach.js` retained repository-layout imports that were invalid in the public Pages layout:

```text
../../../advisor-os/compensation/advisor-compensation-supabase-provider-100.js
../../../advisor-os/forge-alive/smart-widgets/advisor-compensation-income-widget-source-080.mjs
../../../advisor-os/forge-alive/forecast/mick-goal-gap-coach.mjs
```

Consequences:

```text
HOME_MICK_MODULE=IMPORT_FAILURE
HOME_MODULE=IMPORT_FAILURE
APP_MODULE=IMPORT_FAILURE
AUTH_BOUNDARY=AUTHENTICATED
STATIC_FALLBACK=EXPOSED
```

The Pages observer verified HTTP presence and selected strings, but did not resolve the canonical static ESM graph. Therefore a successful deployment was incorrectly accepted as a successful application boot.

## Repair

- publish the Compensation provider required by Mick;
- generate a browser `.js` Forecast coach module;
- consume the generated Compensation income `.js` module;
- rewrite repository-relative imports to public Pages-relative imports;
- validate the complete static module graph beginning at canonical `index.html`;
- keep the old static skeleton hidden until `data-forge-shell-ready="true"`;
- show a neutral fail-closed runtime error instead of exposing the old UI if application hydration fails.

## Acceptance

```text
PAGES_MICK_PROVIDER_PUBLISHED=YES
PAGES_MICK_FORECAST_COACH_PUBLISHED=YES
PAGES_MICK_INCOME_SOURCE_PUBLISHED=YES
PAGES_MICK_SOURCE_PREFIX_LEAK=NONE
PAGES_MICK_MJS_SPECIFIER_LEAK=NONE
PAGES_CANONICAL_STATIC_MODULE_GRAPH=PASS
OLD_STATIC_SKELETON_ON_APP_FAILURE=BLOCKED
DATABASE_MUTATION=NO
BUSINESS_TRUTH_MUTATION=NO
```

## Regression fixture

The test first reproduces the exact invalid `../../../advisor-os/` import and requires the graph validator to reject it. It then builds a complete public graph with `../../advisor-os/` imports and requires acceptance.
