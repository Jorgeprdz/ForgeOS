# RUNTIME-012 Navigation Contract

Report ID: RUNTIME-012
Status: CONTROLLED IMPLEMENTATION PLANNING / NO IMPLEMENTATION
Date: 2026-06-11

## Purpose

Define the app-shell-owned navigation contract required for the first safe lazy-loading pilot: `dashboard` only.

This document does not authorize moving any route other than `dashboard` in RUNTIME-013.

## Current Contract Evidence

| Area | Current owner | Evidence | Finding |
| --- | --- | --- | --- |
| Route selection | `AppManager` and `EnterpriseRouter` | `app.js:367-374`, `app.js:526-534` | Deep-link selection and nav click delegation are shell-owned. |
| Route registry | `EnterpriseRouter` | `app.js:206-213` | Registry stores direct `{ render, bind }` function references. |
| Render invocation | `EnterpriseRouter.navigate` | `app.js:241-245` | Router calls `module.render()` and writes to `#app-content` through `RenderEngine.schedule`. |
| Bind invocation | `EnterpriseRouter.navigate` and `Lifecycle` | `app.js:247-251` | Router mounts the route and awaits `module.bind()`. |
| Loading state | `EnterpriseRouter.navigate` | `app.js:235`, `app.js:271-274` | Router owns `AppState.set('loading', true/false)`. |
| Route cleanup | `EnterpriseRouter.navigate` and `Lifecycle` | `app.js:237-239` | Router destroys previous route before rendering next route. |
| Error handling | `EnterpriseRouter.navigate` | `app.js:266-269` | Router captures route errors and renders route error state. |
| Invalid route fallback | `AppManager.init` and `EnterpriseRouter.navigate` | `app.js:367-370`, `app.js:223-227` | Initial deep-link falls back to dashboard; direct invalid navigate throws route error. |

## App-Shell Ownership Rules

| Responsibility | Owner | Rule |
| --- | --- | --- |
| Route selection | App shell | Only `AppManager` and `EnterpriseRouter` decide which route key is active. |
| Lazy loading | `EnterpriseRouter` | Route modules are resolved through route descriptors. Domain modules do not load other route modules. |
| Render invocation | `EnterpriseRouter` | Router invokes exactly one route `render()` function per navigation. |
| Bind invocation | `EnterpriseRouter` through `Lifecycle.mount` | Router invokes exactly one route `bind()` function after render scheduling. |
| Loading state | `EnterpriseRouter` | Router sets `AppState.loading` before cleanup/load/render/bind and clears it in `finally`. |
| Error state | `EnterpriseRouter` | Router captures loader, render, and bind failures through `ErrorHandler` and `_renderError`. |
| Fallback behavior | `AppManager` for initial route; `EnterpriseRouter` for invalid route errors | Initial unknown hash resolves to `dashboard`; explicit unknown route remains an error. |
| Navigation API for routes | App shell | A later shell-owned navigation helper may exist, but dashboard pilot does not require it. |

## Minimal Route Descriptor Contract

RUNTIME-013 should introduce loader descriptors without changing route behavior:

```js
this.routes = {
    dashboard: {
        load: () => import('./dashboard.js'),
        renderName: 'renderDashboard',
        bindName: 'bindDashboardEvents',
    },
    prospeccion: {
        render: renderProspeccion,
        bind: bindProspeccionEvents,
    },
    referidos: {
        render: renderReferidos,
        bind: bindReferidosEvents,
    },
    actividad: {
        render: renderActividad,
        bind: bindActividadEvents,
    },
    cartera: {
        render: renderCartera,
        bind: bindCarteraEvents,
    },
    comisiones: {
        render: renderComisiones,
        bind: bindComisionesEvents,
    },
};
```

The dashboard descriptor is intentionally explicit. It avoids relying on naming inference while the first lazy route is being proven.

## Route Resolution Contract

RUNTIME-013 should add a small resolver inside `EnterpriseRouter`.

Required behavior:

1. Receive a route descriptor from `this.routes[route]`.
2. If descriptor has direct `render` and `bind`, return it unchanged.
3. If descriptor has `load`, await the loader.
4. Read `module[renderName]` and `module[bindName]`.
5. Validate both resolved exports are functions.
6. Return `{ render, bind }`.
7. Let `navigate(route)` keep current cleanup, render, mount, loading, analytics, history, and event behavior.

Recommended resolver shape:

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

## Navigation Flow After Dashboard Pilot

Expected `dashboard` navigation flow after RUNTIME-013:

1. Authenticated app resolves initial route as `dashboard`.
2. `navigate('dashboard')` reads the dashboard descriptor.
3. Router sets `AppState.loading = true`.
4. Router destroys mounted route state through `Lifecycle.destroyAll()`.
5. Router lazily imports `dashboard.js`.
6. Router validates `renderDashboard` and `bindDashboardEvents`.
7. Router calls `renderDashboard()`.
8. Router mounts `bindDashboardEvents()` through `Lifecycle.mount`.
9. Router updates current route, `AppState.route`, nav active class, hash, analytics, and `route:changed`.
10. Router sets `AppState.loading = false`.

## Explicit Non-Goals

- Do not expose or repair `window.navigateTo` in RUNTIME-013 unless dashboard implementation unexpectedly requires it.
- Do not lazy-load `actividad`, `cartera`, `prospeccion`, `referidos`, or `comisiones`.
- Do not change `dashboard.js` business logic.
- Do not change navigation DOM structure.
- Do not change route names or nav `data-target` values.
- Do not remove legacy route static imports except the dashboard import.

## Contract Verdict

PASS_WITH_GUARD

The contract is ready for a dashboard-only pilot if RUNTIME-013 keeps a mixed registry:

- `dashboard` uses a lazy descriptor.
- All other routes retain direct static references.
- Router behavior outside route resolution remains unchanged.

