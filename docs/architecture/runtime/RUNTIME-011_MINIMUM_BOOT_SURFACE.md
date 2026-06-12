# RUNTIME-011 Minimum Boot Surface

Report ID: RUNTIME-011
Status: DISCOVERY ONLY / NO IMPLEMENTATION
Date: 2026-06-11

## Purpose

Define the smallest stable boot surface required before any route-specific business module is loaded.

## Current Boot Surface

Current browser entry:

| Layer | File or resource | Boot role |
| --- | --- | --- |
| HTML | `index.html` | Declares DOM anchors, nav, chat shell, app module, service worker registration. |
| CSS | `styles.css` | Required visual shell. |
| Manifest | `manifest.json` | PWA metadata. |
| External SDK | Supabase UMD script | Creates `window.supabase`. |
| Environment | `env.js` | Expected to create `window.__ENV__`. |
| App entry | `app.js` | Auth, router, lifecycle, global listeners, initial navigation. |

Current `app.js` direct imports:

| Class | Count | Modules |
| --- | ---: | --- |
| Platform/app shell imports | 13 | `db.js`, `utils.js`, `supabase-runtime.js`, `core-app-engine.js`, `state-manager.js`, `event-system.js`, `module-lifecycle.js`, `ui-render-engine.js`, `sync-orchestrator.js`, `analytics-engine.js`, `error-boundary.js`, `logger.js`, `app-shell-manager.js` |
| Route imports | 6 | `dashboard.js`, `prospeccion.js`, `referidos.js`, `actividad.js`, `cartera.js`, `comisiones.js` |

Current boot-critical JavaScript module count:

- 14 if counting `app.js` plus its non-route direct imports.
- 20 if counting `app.js` plus both non-route and route direct imports.

The second number represents the real current eager module surface from `app.js`.

## Proposed Minimum Boot Surface

The minimum post-transition boot surface should include:

| Required? | Module | Reason |
| --- | --- | --- |
| Yes | `app.js` | Owns app bootstrap, auth flow, router, global listeners. |
| Yes | `db.js` | IndexedDB initialization happens before authenticated route render. |
| Yes | `utils.js` | Shell uses `showToast` for auth/network feedback. |
| Yes | `supabase-runtime.js` | Platform Supabase boundary initialized during auth. |
| Yes | `core-app-engine.js` | Starts platform infrastructure. |
| Yes | `state-manager.js` | Stores user, route, loading, network state. |
| Yes | `event-system.js` | Emits route, network, theme, and runtime events. |
| Yes | `module-lifecycle.js` | Destroys previous route and mounts next route. |
| Yes | `ui-render-engine.js` | Schedules route rendering. |
| Yes | `sync-orchestrator.js` | Starts background sync after first authenticated route. |
| Yes | `analytics-engine.js` | Tracks auth and route events. |
| Yes | `error-boundary.js` | Captures bootstrap and route errors. |
| Yes | `logger.js` | Runtime logging. |
| Yes | `app-shell-manager.js` | Global loader and shell feedback. |
| No | `dashboard.js` | Load only when initial route resolves to dashboard. |
| No | `prospeccion.js` | Load only when user navigates to prospecting. |
| No | `referidos.js` | Load only when user navigates to referrals. |
| No | `actividad.js` | Load only when user navigates to activity. |
| No | `cartera.js` | Load only when user navigates to policy portfolio. |
| No | `comisiones.js` | Load only when user navigates to finance/commissions. |

Post-transition boot-critical JavaScript module count:

- 14, counting `app.js` plus 13 direct non-route app shell imports.

Boot surface reduction:

- 6 route modules removed from eager import evaluation.
- Approximate direct route source removed from first payload: 3,417 lines across the six registered route modules.
- Biggest single deferred source: `cartera.js` at 1,116 lines.

## Boot-Critical Boundaries

Hard boot requirements:

| Boundary | Required by | Failure mode |
| --- | --- | --- |
| `window.__ENV__` with Supabase URL/key | `AuthService.init()` | Fatal auth bootstrap error. |
| `window.supabase` | `AuthService.init()` | Fatal SDK missing error. |
| `DB.init()` | `AppManager.init()` | Bootstrap error before authenticated route. |
| `Core.init()` | `AppManager.init()` | Platform infrastructure failure. |
| `#app-content` | Router and login/error views | Cannot render login or route. |

Soft or deferrable boot requirements:

| Boundary | Current use | Recommendation |
| --- | --- | --- |
| Route modules | Eager imports in `app.js` | Convert to loader functions. |
| `window.navigateTo` | Used by `referidos` and `comisiones`, not defined in current shell evidence | Add shell-owned navigation API or replace route calls before moving those routes. |
| `window.XLSX` | Loaded by `cartera` only when import flow runs | Keep route-local lazy dependency. |
| Service worker | Registered after `load` in `index.html` | Keep outside app boot path. |

## Minimum Router Contract

The lazy router should preserve the current route module contract:

```js
{
  render: Function,
  bind: Function
}
```

Required behavior:

- Resolve loader by route key.
- Await loader inside `navigate(route)`.
- Render returned `render()` into `#app-content`.
- Mount returned `bind()` through `Lifecycle.mount`.
- Keep current route, `AppState`, nav class, history hash, analytics, and `route:changed` behavior.
- Surface loader failures through the existing `ErrorHandler` and router error view.

## Final Boot Verdict

The minimum boot surface is clear and achievable.

The app shell should not need any domain route module to authenticate, initialize platform infrastructure, show login, show fatal bootstrap errors, bind global listeners, or decide the initial route. Route modules are currently boot-coupled by static imports, not by true boot responsibility.

Recommended RUNTIME-012 scope:

**Navigation Contract and First Lazy Route Pilot**

Include only:

- Define a shell-owned route loader contract.
- Preserve current `render`/`bind` route API.
- Add or replace the missing `navigateTo` contract before moving dependent routes.
- Convert `dashboard` to lazy loading as the proof route.
- Add a focused smoke test or manual validation checklist for authenticated `#dashboard` load and invalid route fallback.

Exclude:

- No `cartera` movement yet.
- No `comisiones` movement yet.
- No economic rule refactor.
- No UI redesign.
- No `app.js` modernization beyond the loader contract.

