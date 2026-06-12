# RUNTIME-013 Dashboard Lazy-Load Execution Report

Report ID: RUNTIME-013
Status: CONTROLLED IMPLEMENTATION COMPLETE
Date: 2026-06-11

## Scope

Implemented the first lazy-loading pilot for the `dashboard` route only.

No files were moved. No files were renamed. No folders were migrated. No route other than `dashboard` was converted to lazy loading.

## Files Changed

Runtime implementation:

| File | Change |
| --- | --- |
| `app.js` | Removed the static dashboard route import, added a dashboard lazy descriptor, added a mixed direct/lazy route resolver, and resolved route descriptors before render/bind. |

Execution artifact:

| File | Change |
| --- | --- |
| `docs/architecture/runtime/RUNTIME-013_DASHBOARD_LAZY_LOAD_EXECUTION_REPORT.md` | Added this execution report. |

Validation side effect:

| File | Change |
| --- | --- |
| `docs/architecture/repository/reports/repo-migration-check-report.json` | Rewritten by the required repository harness validation command. |

No `dashboard.js` guard was required.

## Import Delta

Before RUNTIME-013:

- `app.js` had a static dashboard route import:
  - `import { renderDashboard, bindDashboardEvents } from './dashboard.js';`
- Route graph audit:
  - `staticImportsFound`: 195
  - `dynamicImportsFound`: 1

After RUNTIME-013:

- The static dashboard route import is removed.
- `dashboard` route descriptor now uses:

```js
dashboard: {
    load:       () => import('./dashboard.js'),
    renderName: 'renderDashboard',
    bindName:   'bindDashboardEvents',
}
```

- Route graph audit:
  - `staticImportsFound`: 194
  - `dynamicImportsFound`: 2

Direct route import result:

| Route | Status |
| --- | --- |
| `dashboard` | Lazy-loaded |
| `prospeccion` | Still direct static import |
| `referidos` | Still direct static import |
| `actividad` | Still direct static import |
| `cartera` | Still direct static import |
| `comisiones` | Still direct static import |

## Router Change

Added a mixed route resolver inside `EnterpriseRouter`.

Supported descriptor types:

- Existing direct descriptors:

```js
{ render, bind }
```

- New lazy descriptor:

```js
{ load, renderName, bindName }
```

Behavior preserved:

- Route validation.
- `#app-content` lookup.
- `AppState.loading` true/false lifecycle.
- `Lifecycle.destroyAll()`.
- `RenderEngine.schedule()`.
- `Lifecycle.mount()`.
- Current route assignment.
- `AppState.route`.
- Navigation active state.
- Hash replacement.
- Analytics tracking.
- `route:changed` event.
- Existing error capture and route error rendering.

## Validation Results

Pre-flight:

```text
node scripts/runtime-module-graph-audit.js
```

Result:

```json
{
  "totalJsFilesScanned": 671,
  "totalImportsFound": 196,
  "staticImportsFound": 195,
  "dynamicImportsFound": 1,
  "missingTargetsCount": 4,
  "missingExportsCount": 2,
  "circularImportsCount": 0,
  "bootBlockersCount": 0,
  "executabilityVerdict": "EXECUTABLE_WITH_WARNINGS",
  "confidenceScore": 0.88
}
```

```text
node scripts/repo-doc-migration-harness.js check --output-dir docs/architecture/repository/reports
```

Result:

```text
PASS_WITH_WARNINGS_ALLOWED
```

```text
git diff --check
```

Result:

```text
PASS
```

Post-implementation:

```text
node --check app.js
node --check dashboard.js
node scripts/runtime-module-graph-audit.js
node scripts/repo-doc-migration-harness.js check --output-dir docs/architecture/repository/reports
git diff --check
```

Results:

| Command | Result |
| --- | --- |
| `node --check app.js` | PASS |
| `node --check dashboard.js` | PASS |
| `node scripts/runtime-module-graph-audit.js` | PASS with warnings |
| `node scripts/repo-doc-migration-harness.js check --output-dir docs/architecture/repository/reports` | PASS_WITH_WARNINGS_ALLOWED |
| `git diff --check` | PASS |

Post-implementation runtime graph:

```json
{
  "totalJsFilesScanned": 671,
  "totalImportsFound": 196,
  "staticImportsFound": 194,
  "dynamicImportsFound": 2,
  "missingTargetsCount": 4,
  "missingExportsCount": 2,
  "circularImportsCount": 0,
  "bootBlockersCount": 0,
  "executabilityVerdict": "EXECUTABLE_WITH_WARNINGS",
  "confidenceScore": 0.88
}
```

## Success Criteria Check

| Criterion | Status |
| --- | --- |
| Dashboard is lazy-loaded | PASS |
| Only dashboard static import removed | PASS |
| Other routes remain unchanged | PASS |
| Boot blockers remain 0 | PASS |
| Circular imports remain 0 | PASS |
| Validation passes | PASS |
| No folder movement | PASS |
| No broad refactor | PASS |

## Dashboard Behavior Assumptions

The implementation preserves the existing dashboard behavior assumptions:

- `AuthService.getUser()` stores the authenticated user in `AppState` before initial dashboard navigation.
- `renderDashboard()` returns the static route DOM skeleton.
- `bindDashboardEvents()` runs after render scheduling and initializes the dashboard controller.
- Dashboard data still comes from `DB.obtenerTodos('actividad_diaria')` and `DB.obtenerTodos('cartera')`.
- Dashboard cleanup remains owned by `Memory` and `Lifecycle.destroyAll()`.

No `dashboard.js` guard was needed because syntax validation passed and the lazy resolver validates both loaded dashboard exports before invocation.

## Remaining Route Coupling

The following route modules remain statically imported by `app.js`:

- `prospeccion.js`
- `referidos.js`
- `actividad.js`
- `cartera.js`
- `comisiones.js`

Known deferred risks remain unchanged:

- `referidos.js` still depends on unresolved/legacy `window.navigateTo`.
- `comisiones.js` still depends on unresolved/legacy `window.navigateTo`.
- `cartera.js` remains a large route module and should not move until after the route loader pattern is proven.
- `comisiones.js` remains the highest-risk route because it combines financial interpretation, Supabase profile persistence, AI import, and route self-refresh.

## Runtime Health Impact

Projected effect:

| Metric | Before | After RUNTIME-013 |
| --- | ---: | ---: |
| Eager route modules | 6 | 5 |
| Current eager JS surface | 20 | 19 |
| Boot blockers | 0 | 0 |
| Circular imports | 0 | 0 |
| Runtime Health | 80 | 82 projected |
| Migration Readiness | 68-78 range from prior reports | Incremental improvement projected |

The main value is not large payload reduction yet. The value is proving that the app shell can resolve a route module dynamically while preserving the existing navigation lifecycle.

## Recommended RUNTIME-014 Scope

Recommended next scope:

**Navigation Contract Hardening**

Include:

- Add a shell-owned navigation API to replace legacy `window.navigateTo` usage.
- Target `referidos.js` and `comisiones.js` only as consumers to audit, not broad route movement.
- Decide whether the API is imported, injected, or temporarily exposed by the shell.
- Preserve existing route names and `data-target` navigation.
- Add validation for cross-route handoff from `referidos` to `prospeccion`.

Defer:

- Do not lazy-load `comisiones` yet.
- Do not lazy-load `cartera` yet.
- Do not start physical folder migration yet.
- Do not move `app.js`.

Alternative if route-loader proof is preferred before navigation hardening:

- Lazy-load `actividad` as the second low-risk route.

Recommended choice:

- RUNTIME-014 should harden the navigation contract first, because unresolved `window.navigateTo` is the clearest remaining route-coupling blocker.

