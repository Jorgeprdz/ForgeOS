# RUNTIME-012 Execution Readiness

Report ID: RUNTIME-012
Status: CONTROLLED IMPLEMENTATION PLANNING / NO IMPLEMENTATION
Date: 2026-06-11

## Executive Verdict

PASS_WITH_GUARD

The dashboard route is ready for the first lazy-loading pilot if RUNTIME-013 remains constrained to `app.js` and preserves the current render/bind lifecycle.

## Dashboard Lazy-Load Verdict

SAFE_WITH_GUARD

Evidence:

- `dashboard.js` exports `renderDashboard` and `bindDashboardEvents`.
- No import from `app.js` exists inside `dashboard.js`.
- No top-level dashboard DOM mutation was found.
- No top-level dashboard DB call was found.
- Dashboard bind uses `Memory` cleanup and `AbortController`.
- Dashboard reads user identity from `AppState`, which is already set by `AuthService` before initial route navigation.

Required guard:

- The lazy resolver must validate loaded export names before invoking them.
- The router must keep render-before-bind ordering.

## Proposed Loader Contract

Approved planning shape for RUNTIME-013:

```js
dashboard: {
    load: () => import('./dashboard.js'),
    renderName: 'renderDashboard',
    bindName: 'bindDashboardEvents',
}
```

Resolver contract:

```js
async _resolveRouteModule(route, descriptor) {
    if (typeof descriptor?.render === 'function' && typeof descriptor?.bind === 'function') {
        return descriptor;
    }

    if (typeof descriptor?.load !== 'function') {
        throw new Error(`Ruta inválida: ${_escapeHtml(route)}`);
    }

    const loaded = await descriptor.load();
    const render = loaded?.[descriptor.renderName];
    const bind = loaded?.[descriptor.bindName];

    if (typeof render !== 'function' || typeof bind !== 'function') {
        throw new Error(`Contrato de ruta inválido: ${_escapeHtml(route)}`);
    }

    return { render, bind };
}
```

`navigate(route)` should then call the resolved route module instead of assuming the registry entry already contains direct functions.

## Files Expected To Change

Expected:

| File | Change class | Risk |
| --- | --- | --- |
| `app.js` | Remove dashboard static import; add dashboard lazy descriptor; add route resolver; preserve existing navigate lifecycle. | LOW_RISK |

Possible only if validation requires it:

| File | Change class | Risk |
| --- | --- | --- |
| `dashboard.js` | Defensive export or bind guard. Not expected from current audit. | LOW_RISK |

Expected changed file count:

- Minimum: 1
- Maximum under approved scope: 2

## Files Not Expected To Change

- `prospeccion.js`
- `referidos.js`
- `actividad.js`
- `cartera.js`
- `comisiones.js`
- `index.html`
- Runtime platform modules
- Route lifecycle modules
- UI render engine
- State manager

## Risk Level

LOW_RISK

Risk controls:

- Dashboard is the lowest-risk route from RUNTIME-011.
- The route already follows the shell lifecycle.
- The router is already async.
- Existing error/loading behavior can remain unchanged.
- Non-dashboard routes remain statically imported and operationally unchanged.

Residual risks:

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Dynamic import path typo | Dashboard route error on first load | `node --check`, manual `#dashboard` smoke, explicit resolver error. |
| Export name mismatch | Dashboard route error | Validate `renderName` and `bindName` before invocation. |
| Initial deep-link regression | Authenticated boot may fail to load dashboard | Keep `this.router.routes[hashRoute]` descriptor check unchanged. |
| Render/bind ordering change | Dashboard DOM IDs missing during bind | Preserve current render-before-bind sequence. |

## Validation Commands

Run after RUNTIME-013 implementation:

```sh
node --check app.js
node --check dashboard.js
node scripts/runtime-module-graph-audit.js
node scripts/repo-doc-migration-harness.js
git diff --check
```

Focused route registry checks:

```sh
rg -n "import \\{ renderDashboard|bindDashboardEvents \\} from './dashboard.js'" app.js
rg -n "load: \\(\\) => import\\('./dashboard.js'\\)" app.js
rg -n "renderName: 'renderDashboard'|bindName: 'bindDashboardEvents'" app.js
```

Interpretation:

- The first `rg` should return no dashboard static import after implementation.
- The second and third `rg` commands should confirm the dashboard lazy descriptor exists.

Manual route smoke checks:

- Authenticated boot with no hash loads dashboard.
- Authenticated boot with `#dashboard` loads dashboard.
- Dashboard sections hydrate after IndexedDB reads.
- Navigation from dashboard to another existing route still works.
- Navigation back to dashboard lazy-loads or reuses the dashboard module without route error.
- Invalid initial hash still falls back to dashboard.

## RUNTIME-013 Scope

Title:

**Dashboard Lazy-Load Pilot**

Allowed:

- Edit `app.js`.
- Remove only `dashboard.js` from static route imports.
- Keep all other route imports static.
- Add a mixed direct/lazy route resolver to `EnterpriseRouter`.
- Convert only `dashboard` route descriptor to lazy loading.
- Preserve all route names and nav targets.
- Preserve current `AppState.loading`, `Lifecycle.destroyAll`, `RenderEngine.schedule`, `Lifecycle.mount`, `Analytics.track`, `EventBus.emit`, and `_renderError` behavior.

Conditionally allowed:

- Edit `dashboard.js` only if validation proves a concrete contract guard is required.

Disallowed:

- No `actividad` lazy loading.
- No `cartera` lazy loading.
- No `prospeccion` lazy loading.
- No `referidos` lazy loading.
- No `comisiones` lazy loading.
- No `window.navigateTo` repair.
- No route registry extraction into a new file.
- No UI changes.
- No route lifecycle refactor.
- No economic or compensation logic changes.

## Runtime Projection

If RUNTIME-013 succeeds:

| Metric | Current | After dashboard pilot |
| --- | ---: | ---: |
| Eager route modules | 6 | 5 |
| Current eager JS surface | 20 | 19 |
| Target minimum boot surface | 14 | 14 remains target |
| Runtime Health | 80 | 82 |
| Migration Readiness | 78 | 80 |

This is intentionally a small gain. The value of RUNTIME-013 is proving the loader contract, not completing the lazy-loading migration.

## Commit Guidance

Recommended commit message:

```text
Plan dashboard lazy-load pilot
```

Implementation commit message for RUNTIME-013, if approved later:

```text
Lazy-load dashboard route
```

## Confidence Score

0.91

Confidence is high because dashboard has a clean route contract and the router already supports async navigation. It is not 1.0 because dynamic import behavior still needs browser/runtime smoke validation after implementation.
