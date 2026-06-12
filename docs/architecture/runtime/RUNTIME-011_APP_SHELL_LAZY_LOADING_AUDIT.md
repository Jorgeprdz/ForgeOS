# RUNTIME-011 App Shell Lazy Loading Audit

Report ID: RUNTIME-011
Status: DISCOVERY ONLY / NO IMPLEMENTATION
Date: 2026-06-11

## Scope

This audit continues the runtime analysis after RUNTIME-010. It evaluates whether the current app shell can move from static route imports to lazy route loading without changing product behavior.

No implementation was performed.

## Evidence Summary

| Evidence | Finding | Runtime meaning |
| --- | --- | --- |
| `app.js:35-55` | App shell statically imports platform modules and all six route modules. | Route parse/import failures can still become boot failures. |
| `app.js:206-213` | `EnterpriseRouter.routes` stores direct render/bind function references. | Router is structurally simple, but currently tied to eager imports. |
| `app.js:216-272` | Navigation already has an async lifecycle boundary. | The router can absorb dynamic import with limited structural change. |
| `app.js:248-251` | Route bind runs inside `Lifecycle.mount`. | Lazy modules can preserve current mount contract. |
| `index.html:157` | Only `app.js` is loaded as the module entry point. | First JS payload is controlled by app shell import graph. |
| `referidos.js:167` | Route calls `window.navigateTo('prospeccion')`. | Cross-route navigation depends on a missing or legacy global. |
| `comisiones.js:310,466` | Route calls `window.navigateTo('comisiones')`. | Self-refresh navigation depends on a missing or legacy global. |
| `cartera.js:1090-1113` | XLSX is already loaded on demand inside the route. | This route has local lazy-loading precedent. |

## Current Route Registry

`app.js` defines six registered routes:

| Route | Module | Current loading mode | Classification |
| --- | --- | --- | --- |
| `dashboard` | `dashboard.js` | Static import | Default authenticated route |
| `prospeccion` | `prospeccion.js` | Static import | Advisor workflow route |
| `referidos` | `referidos.js` | Static import | Advisor workflow route with cross-route handoff |
| `actividad` | `actividad.js` | Static import | Advisor activity and AI tip route |
| `cartera` | `cartera.js` | Static import | Heavy operational policy route |
| `comisiones` | `comisiones.js` | Static import | High-risk financial/economic route |

## Lazy Loading Readiness

The shell is structurally ready for lazy loading, but behavior is not uniformly ready.

Strong readiness signals:

- `navigate(route)` is already `async`.
- Route modules already expose a consistent `renderX` and `bindX` pair.
- Route lifecycle is centralized through `Lifecycle.destroyAll()` and `Lifecycle.mount()`.
- DOM target ownership is centralized through `#app-content`.
- Current route identity is already stored in `AppState`.

Blocking or caution signals:

- `app.js` imports route modules at top level, so lazy loading has not yet reduced boot blast radius.
- Route registry stores function references, not loader functions.
- `referidos.js` and `comisiones.js` call `window.navigateTo`, but the current `app.js` evidence does not define that global.
- `comisiones.js` contains economic constants and remote profile writes inside the route module, making it the route with the highest governance and runtime risk.
- `cartera.js` is large and imports several platform services, but it already contains an internal lazy script loader for XLSX.

## Global State Dependency Audit

| Dependency | Owner today | Consumers in audited surface | Risk |
| --- | --- | --- | --- |
| `window.__ENV__` | HTML/build environment | `app.js` | Boot critical. Required before auth client creation. |
| `window.supabase` | External UMD SDK from `index.html` | `app.js` | Boot critical. If missing, auth init throws. |
| `window.supabaseClient` | Transitional compatibility global | `app.js`, platform infrastructure via RUNTIME-010 evidence | Migration blocker until platform consolidation is complete. |
| `window.navigateTo` | Not found in current app shell evidence | `referidos.js`, `comisiones.js` | Route behavior bug and lazy-loading blocker. |
| `window.XLSX` | Third-party script loaded by route | `cartera.js` | Acceptable route-local lazy dependency. |
| `localStorage` | Browser runtime | `app.js`, `referidos.js`, `prospeccion.js` | Acceptable, but cross-route handoff should be documented as route contract. |
| `AppState` | Platform state manager | `app.js`, `dashboard.js`, `cartera.js` | Healthy shared state surface when used through imports. |
| `EventBus` | Platform event system | `app.js`, `dashboard.js`, `actividad.js`, `cartera.js` | Healthy event surface when listeners are cleaned through lifecycle. |
| `Memory` | Cleanup manager | `dashboard.js`, `actividad.js`, `cartera.js` | Positive lifecycle signal. |

## Boot Surface Analysis

Current app boot has three layers:

1. HTML boot surface:
   - `styles.css`
   - `manifest.json`
   - Supabase UMD script
   - `env.js`
   - `app.js`
   - service worker registration after window `load`

2. App shell boot surface:
   - `app.js`
   - `db.js`
   - `utils.js`
   - `supabase-runtime.js`
   - `core-app-engine.js`
   - `state-manager.js`
   - `event-system.js`
   - `module-lifecycle.js`
   - `ui-render-engine.js`
   - `sync-orchestrator.js`
   - `analytics-engine.js`
   - `error-boundary.js`
   - `logger.js`
   - `app-shell-manager.js`

3. Eager route surface:
   - `dashboard.js`
   - `prospeccion.js`
   - `referidos.js`
   - `actividad.js`
   - `cartera.js`
   - `comisiones.js`

Minimum boot target after lazy loading:

- Keep the app shell boot surface.
- Remove all six route modules from initial import evaluation.
- Load `dashboard.js` only when the authenticated initial route resolves to `dashboard`.

## First Movement Candidates

| Rank | Candidate | Why first | Required guard |
| ---: | --- | --- | --- |
| 1 | `dashboard` | Default route, already uses `AppState`, `Memory`, `EventBus`, and `RenderEngine` in a mature lifecycle pattern. | Dynamic import must preserve first authenticated navigation. |
| 2 | `actividad` | Clear route-local state and lifecycle cleanup through `Memory`; no cross-route global navigation found. | Confirm AI abort behavior survives route unload. |
| 3 | `cartera` | Highest payload reduction value and already lazy-loads XLSX. | Move after one smaller route proves loader contract. |
| 4 | `prospeccion` | Simple route, but participates in localStorage handoff from `referidos`. | Document handoff contract before moving paired routes independently. |
| 5 | `referidos` | Small route, but uses `window.navigateTo`. | Replace or formally expose navigation contract before lazy move. |
| 6 | `comisiones` | Financial route with Supabase profile reads/writes, AI import, hardcoded economic constants, and `window.navigateTo`. | Defer until RUNTIME-012 resolves navigation bridge and economic route boundary. |

## Final Verdict

Lazy loading is recommended, but only after the navigation contract is repaired.

The app shell is ready for a small dynamic-route loader because `navigate()` and `Lifecycle.mount()` are already asynchronous. The route surface is not equally ready. The immediate risk is not dynamic import itself; the risk is hidden route behavior that currently depends on globals and eager import side effects.

Recommended transition strategy:

1. Add a route loader registry in `app.js` that returns `{ render, bind }`.
2. Move only `dashboard` first as the proof route.
3. Add a shell-owned navigation API before moving `referidos` or `comisiones`.
4. Move `actividad` second.
5. Move `cartera` after route-loader telemetry confirms no mount regressions.
6. Defer `comisiones` until its economic and Supabase profile boundary is reviewed.

Projected result if executed in that order:

| Metric | Current | Projected after safe lazy transition |
| --- | ---: | ---: |
| Runtime Health | 80 | 86 |
| Migration Readiness | 78 | 86 |

