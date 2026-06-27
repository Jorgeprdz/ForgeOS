# LEGACY-002 Navigation Dependency Map

Report ID: LEGACY-002
Status: ARCHITECTURE DISCOVERY / NO IMPLEMENTATION
Date: 2026-06-11

## Purpose

Map current navigation dependencies, globals, DOM assumptions, side effects, and coupling risk.

## Active Dependency Graph

```text
index.html
  .nav-btn[data-target]
        |
        v
app.js / _bindGlobalListeners()
  delegated click handler
        |
        v
EnterpriseRouter.navigate(route)
        |
        +--> this.routes[route]
        +--> Lifecycle.destroyAll()
        +--> _resolveRouteModule(route, descriptor)
        +--> RenderEngine.schedule(appEl.innerHTML = module.render())
        +--> Lifecycle.mount(route, module.bind)
        +--> AppState.set('route', route)
        +--> updateNav(route)
        +--> history.replaceState(... '#' + route)
        +--> Analytics.track('route_change')
        +--> EventBus.emit('route:changed')

referidos.js
  localStorage handoff
        |
        v
  window.navigateTo('prospeccion')  [missing/legacy global]

comisiones.js
  profile setup/reset
        |
        v
  window.navigateTo('comisiones')   [missing/legacy global]
```

## Navigation Consumers

Active consumers:

| Consumer | Type | Dependency | Coupling |
| --- | --- | --- | --- |
| `index.html` | Shell UI | `data-target` values must match `app.js` route keys. | `MEDIUM` |
| `app.js` | Owner and consumer | Owns route registry, lifecycle, URL hash, active state, and event emission. | `HIGH` |
| `referidos.js` | Route module | Calls missing/legacy `window.navigateTo('prospeccion')`. | `HIGH` |
| `comisiones.js` | Route module | Calls missing/legacy `window.navigateTo('comisiones')` twice. | `HIGH` |

Navigation-adjacent consumers:

| Consumer | Type | Dependency | Coupling |
| --- | --- | --- | --- |
| `runtime.js` | Runtime utility | Manages navigation IDs, cleanup, aborting, lazy imports. Not the current shell router. | `LOW` |
| `route-transition-manager.js` | Route transition helper | Exported helper not found as active import. | `LOW` |
| `semantic-navigation-engine.js` | Domain/navigation suggestion | Returns route strings, but is not wired into shell navigation. | `LOW` |
| `design-system-preview.html` | Preview | Has preview `.nav-btn[data-target]` markup and JS, not production runtime. | `LOW` |
| `comisiones.js.bk` | Backup | Historical `window.navigateTo` references. | `LOW` for runtime, `MEDIUM` for cleanup discipline |

## Global State Audit

| Global / assumption | Current usage | Risk |
| --- | --- | --- |
| `window.navigateTo` | Referenced by `referidos.js` and `comisiones.js`; no active shell definition found. | `HIGH` |
| `window.location.hash` | Read by `app.js` for initial route. | `MEDIUM` |
| `history.replaceState` | Written by `app.js` after navigation. | `MEDIUM` |
| DOM `#app-content` | Required by `app.js` route render and error views. | `HIGH` |
| DOM `#main-sidebar` | Required by `app.js` global nav binding and shell reveal. | `MEDIUM` |
| DOM `.nav-btn[data-target]` | Required by `app.js` delegated UI navigation and active-state updates. | `MEDIUM` |
| `AppState.route` | Written by `app.js`; no active reader found in this scan. | `LOW` today, `MEDIUM` as future contract |
| `EventBus` `route:changed` | Emitted by `app.js`; no active runtime reader found in this scan. | `LOW` today, `MEDIUM` as future contract |
| `localStorage.auto_prospecto` | Written by `referidos.js` before navigation to `prospeccion`; consumed by `prospeccion.js` from prior runtime evidence. | `MEDIUM` |

## Side Effects Of Navigation

`EnterpriseRouter.navigate(route)` currently causes:

- Previous route cleanup through `Lifecycle.destroyAll()`.
- Route module resolution.
- DOM replacement inside `#app-content`.
- Route bind execution.
- `currentRoute` mutation.
- `AppState.loading` changes.
- `AppState.route` mutation.
- Nav active class update.
- URL hash replacement.
- Analytics event.
- `route:changed` event.
- Error capture and route error render on failure.

Any future navigation contract must preserve these side effects or intentionally reassign them to platform owners.

## Coupling Assessment

Overall coupling:

`HIGH`

Reasons:

- The real router is private inside `app.js`.
- Active route modules call an undefined or legacy global navigation API.
- UI nav targets are hardcoded in `index.html`.
- Route names are shared implicitly across HTML, shell, and route modules.
- Navigation side effects are bundled inside the legacy shell.

Mitigating factors:

- Active `window.navigateTo` usage is small: 3 active call sites across 2 active files.
- Route transition logic is centralized in `app.js`.
- RUNTIME-013 proved route module resolution can be separated from static imports.
- Existing `AppState` and `EventBus` surfaces can support a future contract.

## Impact Of Moving Ownership To `platform/navigation-runtime.js`

Projected effects if implemented after planning:

| Metric | Current | Projected after navigation ownership extraction |
| --- | ---: | ---: |
| Runtime Health | 82 projected after RUNTIME-013 | 84-85 |
| Migration Readiness | Incremental after RUNTIME-013 | +4 to +6 points |
| Architectural Clarity | Medium | High |
| Legacy Shell Coupling | High | Medium |

Risk:

`MEDIUM`

Why not low:

- Navigation has visible UX and lifecycle side effects.
- `referidos` workflow handoff depends on localStorage and route transition timing.
- `comisiones` uses self-navigation after profile writes.

Why not high:

- Active global call-site count is small.
- The current router is already centralized.
- The first extraction can be an adapter, not a physical move.

## First Consumers To Stop Talking Directly To `app.js` Or Shell Globals

Ranked top 5:

| Rank | Consumer | Why first |
| ---: | --- | --- |
| 1 | `referidos.js` | Single workflow navigation to `prospeccion`; small surface; validates cross-route handoff. |
| 2 | `comisiones.js` profile setup navigation | Self-refresh after profile creation; high-risk domain but simple navigation intent. |
| 3 | `comisiones.js` reset navigation | Same route self-refresh after destructive profile reset; should share same contract as setup. |
| 4 | `index.html` nav target assumptions | Not first implementation target, but should eventually stop being the route authority. |
| 5 | `semantic-navigation-engine.js` | Should become a route-suggestion consumer of platform navigation rather than an orphan route-string mapper. |

## Movement Impact Verdict

Navigation can move toward platform ownership only through a contract-first adapter.

Do not physically move router code yet.

First reduce global coupling, then extract.

