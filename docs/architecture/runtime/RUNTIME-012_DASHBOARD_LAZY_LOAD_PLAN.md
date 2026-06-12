# RUNTIME-012 Dashboard Lazy-Load Plan

Report ID: RUNTIME-012
Status: CONTROLLED IMPLEMENTATION PLANNING / NO IMPLEMENTATION
Date: 2026-06-11

## Mission

Plan the first safe lazy-loading pilot for the `dashboard` route only.

No imports were changed. No route was moved. No implementation was performed.

## Task 1: Current Route Registry Analysis

Current dashboard import:

```js
import { renderDashboard, bindDashboardEvents } from './dashboard.js';
```

Evidence:

- `app.js:39` statically imports the dashboard route.
- `app.js:206-213` registers six route entries as direct `{ render, bind }` references.
- `dashboard` is currently registered as `{ render: renderDashboard, bind: bindDashboardEvents }`.

Current route registry structure:

```js
this.routes = {
    dashboard:   { render: renderDashboard,   bind: bindDashboardEvents   },
    prospeccion: { render: renderProspeccion,  bind: bindProspeccionEvents  },
    referidos:   { render: renderReferidos,    bind: bindReferidosEvents    },
    actividad:   { render: renderActividad,    bind: bindActividadEvents    },
    cartera:     { render: renderCartera,      bind: bindCarteraEvents      },
    comisiones:  { render: renderComisiones,   bind: bindComisionesEvents   },
};
```

Current render/bind contract:

| Contract field | Expected type | Current source |
| --- | --- | --- |
| `render` | Function returning route HTML string | Route module `renderX` export |
| `bind` | Async function or function | Route module `bindX` export |

Current navigation lifecycle:

1. Skip navigation if route is already active.
2. Lookup route descriptor from `this.routes`.
3. Validate route exists.
4. Lookup `#app-content`.
5. Set `AppState.loading = true`.
6. Destroy previous lifecycle state.
7. Schedule route render into `#app-content`.
8. Mount route bind function through `Lifecycle.mount`.
9. Set current route and `AppState.route`.
10. Update active nav button.
11. Replace URL hash.
12. Track route analytics.
13. Emit `route:changed`.
14. Capture and render errors if any step fails.
15. Set `AppState.loading = false` in `finally`.

Loading behavior:

- Router owns route-level loading state through `AppState`.
- App startup also uses `AppShell.showLoader('Cargando...')` before initial navigation.
- RUNTIME-013 should not add a new loader state for dashboard.

Error behavior:

- Loader, render, and bind failures should all flow through the existing `try/catch`.
- The existing `_renderError(err)` route error view should remain the failure surface.
- Error capture should remain `ErrorHandler.capture(err)`.

## Task 2: Dashboard Module Contract

Exports:

| Export | Location | Contract |
| --- | --- | --- |
| `renderDashboard` | `dashboard.js:507-565` | Returns static dashboard HTML with required element IDs. |
| `bindDashboardEvents` | `dashboard.js:571-573` | Awaits `DashboardController.init()`. |

Required imports:

| Import | Purpose |
| --- | --- |
| `DB` | Reads `actividad_diaria` and `cartera`. |
| `AppState` | Reads authenticated user and stores dashboard snapshot. |
| `EventBus` | Emits dashboard success/error events. |
| `Logger` | Logs route lifecycle and load errors. |
| `Memory` | Registers cleanup for abort and subscription teardown. |
| `RenderEngine` | Schedules DOM updates after route template render. |

DOM assumptions:

| Element ID | Created by | Used by |
| --- | --- | --- |
| `dashboard-container` | `renderDashboard` | Structural route root. |
| `dash-saludo` | `renderDashboard` | Greeting hydration. |
| `dash-pts-kpi` | `renderDashboard` | Weekly points KPI. |
| `dash-productividad` | `renderDashboard` | Productivity section and dashboard error state. |
| `dash-fidelizacion` | `renderDashboard` | Relationship/fidelization section. |
| `dash-cartera` | `renderDashboard` | Portfolio collection section. |

Side effects on import:

- Defines constants, sanitizer, calculator, view object, and controller object.
- Imports platform dependencies.
- No top-level DOM reads or writes found.
- No top-level DB calls found.
- No top-level AppState mutation found.
- No top-level EventBus emission found.
- No `window` global dependency found.
- No import from `app.js` found.

Side effects on bind:

- Logs `[Dashboard] init`.
- Aborts previous in-flight dashboard load if present.
- Registers cleanup callbacks through `Memory`.
- Subscribes to `AppState` updates for `cartera`.
- Reads authenticated user from `AppState`.
- Reads `actividad_diaria` and `cartera` from `DB`.
- Writes dashboard snapshot to `AppState`.
- Updates dashboard DOM through `RenderEngine`.
- Emits `dashboard:loaded` or `dashboard:error`.

Dashboard lazy-load classification:

SAFE_WITH_GUARD

Guard required:

- Dynamic route resolver must validate that `renderDashboard` and `bindDashboardEvents` exist and are functions before invoking them.
- RUNTIME-013 should preserve the current render-before-bind order, because `bindDashboardEvents` assumes the dashboard DOM IDs already exist.

## Task 3: Loader Registry Design

Final recommended shape for RUNTIME-013:

```js
this.routes = {
    dashboard: {
        load: () => import('./dashboard.js'),
        renderName: 'renderDashboard',
        bindName: 'bindDashboardEvents',
    },
    prospeccion: { render: renderProspeccion, bind: bindProspeccionEvents },
    referidos: { render: renderReferidos, bind: bindReferidosEvents },
    actividad: { render: renderActividad, bind: bindActividadEvents },
    cartera: { render: renderCartera, bind: bindCarteraEvents },
    comisiones: { render: renderComisiones, bind: bindComisionesEvents },
};
```

Why this shape:

- It changes only the dashboard route descriptor.
- It preserves all other routes exactly as direct references.
- It makes the loaded export names explicit.
- It avoids introducing route path inference during the pilot.
- It allows `this.router.routes[hashRoute]` to keep working for initial deep-link validation.

Rejected alternatives:

| Alternative | Reason rejected for RUNTIME-013 |
| --- | --- |
| Convert all routes to loaders | Too broad for dashboard-only pilot. |
| Use inferred export names | More magical than needed for first movement. |
| Create separate route registry file | New architecture not needed. |
| Add route prefetching | Not required to prove boot surface reduction. |
| Replace `EnterpriseRouter` | Broad refactor outside scope. |

## Task 4: Navigation Contract

Dashboard pilot ownership:

| Concern | Owner in RUNTIME-013 |
| --- | --- |
| Route selection | Existing app shell flow. |
| Lazy loading | `EnterpriseRouter` route resolver. |
| Render invocation | Existing `EnterpriseRouter.navigate`. |
| Bind invocation | Existing `Lifecycle.mount` call. |
| Loading state | Existing `AppState.loading` calls in router. |
| Error state | Existing router catch, `ErrorHandler.capture`, and `_renderError`. |
| Fallback behavior | Existing initial hash fallback to `dashboard`; invalid explicit navigate remains error. |

## Task 5: Blast Radius

Expected files changed in RUNTIME-013:

| File | Expected change | Risk |
| --- | --- | --- |
| `app.js` | Remove static dashboard import, add dashboard lazy descriptor, add route resolver, call resolver before render/bind. | LOW_RISK |

Possible file changed only if validation proves necessary:

| File | Possible change | Risk |
| --- | --- | --- |
| `dashboard.js` | Add no-op guard only if dynamic import exposes an unexpected contract issue. Current audit does not require this. | LOW_RISK |

Files explicitly out of scope:

- `prospeccion.js`
- `referidos.js`
- `actividad.js`
- `cartera.js`
- `comisiones.js`
- `index.html`
- `module-lifecycle.js`
- `ui-render-engine.js`
- `state-manager.js`

Overall blast radius:

LOW_RISK

Reason:

- The pilot changes route resolution, not dashboard business behavior.
- All non-dashboard routes can remain statically imported.
- The router already awaits async operations.
- Existing error and loading surfaces can remain unchanged.

## Task 6: Validation Plan

Required commands after RUNTIME-013 implementation:

```sh
node --check app.js
node --check dashboard.js
node scripts/runtime-module-graph-audit.js
node scripts/repo-doc-migration-harness.js
git diff --check
```

Route smoke checks:

```sh
rg -n "import \\{ renderDashboard|bindDashboardEvents \\} from './dashboard.js'" app.js
rg -n "load: \\(\\) => import\\('./dashboard.js'\\)" app.js
rg -n "renderName: 'renderDashboard'|bindName: 'bindDashboardEvents'" app.js
```

Manual browser checks if app environment is available:

- Authenticated initial load with no hash resolves to `#dashboard`.
- Authenticated initial load with `#dashboard` resolves to dashboard.
- Dashboard greeting, weekly points, fidelization, and cartera sections hydrate.
- Navigate away from dashboard and back without duplicate subscriptions or stale abort errors.
- Invalid hash still falls back to dashboard on initial authenticated boot.

## Task 7: Execution Readiness

Verdict:

PASS_WITH_GUARD

RUNTIME-013 implementation scope:

1. In `app.js`, remove only the static dashboard import.
2. Replace only the `dashboard` route entry with a lazy descriptor.
3. Add a private route resolver method to `EnterpriseRouter`.
4. In `navigate(route)`, resolve the descriptor before calling `render` and `bind`.
5. Preserve existing route cleanup, render scheduling, lifecycle mount, loading state, route state, nav update, history, analytics, events, and error handling.
6. Leave every non-dashboard route as a direct static import.
7. Do not expose `window.navigateTo`.
8. Do not edit `dashboard.js` unless validation reveals a real guard requirement.

