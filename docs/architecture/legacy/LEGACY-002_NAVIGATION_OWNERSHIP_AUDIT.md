# LEGACY-002 Navigation Ownership Audit

Report ID: LEGACY-002
Status: ARCHITECTURE DISCOVERY / NO IMPLEMENTATION
Date: 2026-06-11

## Purpose

Determine who owns navigation today, who should own navigation tomorrow, and the smallest safe navigation contract Forge can standardize before further legacy shell extraction.

No files were moved. No imports were rewritten. No runtime code was modified.

## Executive Finding

Navigation is currently owned by the CRMAddlife transitional shell in `app.js`, while route modules still assume a legacy global `window.navigateTo` exists.

That creates a split-brain navigation boundary:

```text
Real navigation owner:
  app.js / EnterpriseRouter.navigate(route)

Legacy assumed navigation API:
  window.navigateTo(route)

DOM route declaration:
  index.html / .nav-btn[data-target]

Future owner:
  platform/navigation-runtime.js
```

## Navigation Inventory

Active runtime inventory:

| File | Usage count | Usage | Purpose | Classification |
| --- | ---: | --- | --- | --- |
| `app.js` | 1 route registry | `this.routes = { ... }` | Defines route keys and route descriptors. | UI Navigation / Route Transition |
| `app.js` | 1 router method | `navigate(route)` | Performs route cleanup, route resolution, render, bind, state, hash, analytics, and event emission. | Route Transition |
| `app.js` | 1 initial route read | `window.location.hash` | Selects initial authenticated route or falls back to dashboard. | Deep Link |
| `app.js` | 1 history write | `history.replaceState(... '#'+route)` | Keeps URL hash aligned with active route. | Deep Link |
| `app.js` | 1 delegated nav handler | `.nav-btn[data-target]` -> `this.router.navigate(target)` | Handles shell menu clicks. | UI Navigation |
| `app.js` | 1 route event | `EventBus.emit('route:changed', { route })` | Announces route transition. | Route Transition |
| `index.html` | 6 nav targets | `data-target="dashboard/prospeccion/referidos/actividad/cartera/comisiones"` | Declares shell menu route keys. | UI Navigation |
| `referidos.js` | 1 call site | `window.navigateTo('prospeccion')` | Sends referral context to prospecting route after writing localStorage handoff. | Workflow Navigation |
| `comisiones.js` | 2 call sites | `window.navigateTo('comisiones')` | Refreshes finance route after profile setup/reset. | Workflow Navigation |

Navigation-adjacent but not current owner:

| File | Usage count | Usage | Purpose | Classification |
| --- | ---: | --- | --- | --- |
| `runtime.js` | 1 navigation state utility | `startNavigation`, `navigationId`, `lazyImport` | Generic runtime navigation/lazy-load lifecycle support consumed by `utils.js` and `sync-engine.js`, not current route owner. | Route Transition support |
| `route-transition-manager.js` | 1 exported manager | `RouteTransition.transition(routeName, callback)` | Route transition helper with Memory cleanup and body loading class; no active import found. | Route Transition support |
| `semantic-navigation-engine.js` | 1 exported function | `navegarSemanticamente(...)` | Maps semantic input to suggested route strings; no active import found. | Workflow Navigation / Unknown |
| `design-system-preview.html` | 6 preview nav targets | `.nav-btn[data-target]` preview UI | Static design-system preview, not production navigation owner. | UI Navigation preview |
| `comisiones.js.bk` | 4 backup references | `window.navigateTo` checks/calls | Backup file, not active runtime. | Historical / Unknown |

## Current Navigation Owners

| Capability | Current owner | Evidence | Desired owner |
| --- | --- | --- | --- |
| Route registry | `app.js` / `EnterpriseRouter` | `this.routes` stores route descriptors. | `platform/navigation-runtime.js` or platform route manifest |
| Route selection | `app.js` and `index.html` | Nav buttons declare `data-target`; app delegates clicks. | Platform navigation runtime |
| Initial deep-link selection | `app.js` | Reads `window.location.hash`. | Platform navigation runtime |
| Route transition execution | `app.js` | `EnterpriseRouter.navigate(route)` owns cleanup, render, bind, state, hash, analytics, event. | Platform navigation runtime |
| Route lazy loading | `app.js` after RUNTIME-013 | `_resolveRouteModule` handles direct and lazy descriptors. | Platform route loader |
| Nav active state | `app.js` and `index.html` | `.nav-btn` active class is updated by router. | Platform shell/navigation UI adapter |
| Route event emission | `app.js` | Emits `route:changed`. | Platform navigation runtime |
| Workflow route requests | `referidos.js`, `comisiones.js` | Calls `window.navigateTo`. | Platform navigation runtime API |
| Semantic route suggestion | `semantic-navigation-engine.js` | Returns route strings from input. | Domain/service consumer of platform navigation, not owner |

## Ownership Verdict

Current owner:

- `app.js` owns actual navigation.
- `index.html` owns current menu declarations.
- `referidos.js` and `comisiones.js` incorrectly assume route modules can call a global navigation function.

Future owner:

- `platform/navigation-runtime.js`

Reason:

- Navigation is a platform responsibility.
- Domain routes should request navigation through an explicit contract.
- Domain routes should not know about `app.js`, private router instances, DOM nav classes, or shell internals.

## Capability Classification

| Capability | Current classification | Target classification |
| --- | --- | --- |
| `EnterpriseRouter.navigate(route)` | Transitional shell | Platform |
| `this.routes` registry | Transitional shell | Platform route manifest |
| `window.location.hash` initial route | Transitional shell | Platform |
| `history.replaceState` route hash | Transitional shell | Platform |
| `.nav-btn[data-target]` click handling | Legacy shell UI | Platform UI adapter |
| `window.navigateTo` route calls | Broken/legacy global assumption | Replace with Navigation contract |
| `route:changed` event | Forge-emergent platform signal | Platform |

## Extraction Readiness

Classification:

`PARTIALLY_READY`

Ready signals:

- RUNTIME-013 proved a route descriptor can be lazy-loaded.
- `navigate(route)` is already async.
- Route transition lifecycle is centralized in one shell class.
- Route state is already published through `AppState.set('route', route)`.
- Route events are already emitted through `EventBus`.

Not-ready signals:

- `EnterpriseRouter` is private inside `app.js`.
- No explicit navigation service exists.
- `window.navigateTo` is referenced by active route modules but not defined by the current shell.
- `index.html` still hardcodes route menu targets.
- Route registry and shell UI are still coupled.

## Final Ownership Verdict

Forge should extract navigation into a platform-owned runtime, but not by moving files yet.

The first safe step is a navigation contract shim/adapter that lets route modules request route transitions without referencing `app.js` or `window.navigateTo`.

