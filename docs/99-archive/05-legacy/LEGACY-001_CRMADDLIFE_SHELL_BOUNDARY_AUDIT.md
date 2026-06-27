# LEGACY-001 CRMAddlife Shell Boundary Audit

Report ID: LEGACY-001
Status: ARCHITECTURE DISCOVERY / NO RUNTIME MODIFICATIONS
Date: 2026-06-11

## Purpose

Identify the boundary between the CRMAddlife legacy shell and the future Forge-native runtime.

This audit is discovery only.

No files were moved. No imports were rewritten. No runtime code was modified.

## Boundary Finding

The current root browser application is a **CRMAddlife legacy compatibility shell** with Forge runtime dependencies gradually attached to it.

CRMAddlife was a basic CRM prototype. It does not represent the target complexity, intelligence, architecture, or product ambition of Forge OS.

RUNTIME-013 proved that the shell can lazy-load a route module. It did not prove that the current dashboard route is Forge-native.

Default posture:

- Extract useful runtime contracts.
- Preserve compatibility temporarily.
- Do not invest heavily in CRMAddlife architecture.
- Retire or replace legacy shell assets over time unless evidence proves they are still required.

The boundary is:

```text
CRMAddlife Legacy Shell:
  index.html
  app.js
  dashboard.js
  current nav/chat/header/login layout
  current CRM route labels and compatibility route registry

Forge Native Runtime:
  platform runtime services imported by app.js and dashboard.js
  state manager
  event system
  lifecycle manager
  render engine
  logger
  error boundary
  analytics
  Supabase runtime boundary
  route loader mechanism proven in RUNTIME-013
```

## Legacy Shell Inventory

| File | Original purpose | Current purpose | Forge dependencies | CRMAddlife dependencies | Ownership candidate | Classification |
| --- | --- | --- | --- | --- | --- | --- |
| `app.js` | CRMAddlife SPA/PWA application core: auth, router, header, nav, chat, boot. | Transitional runtime entry and compatibility shell; now includes Forge platform services and dashboard lazy-loading pilot. | `SupabaseRuntime`, `AppState`, `EventBus`, `Lifecycle`, `RenderEngine`, `SyncEngine`, `Analytics`, `ErrorHandler`, `Logger`, `AppShell`, `Core`. | CRM Addlife naming, login copy, app shell UI, bottom nav, AI chat placeholder, legacy route modules, `window.supabaseClient` compatibility. | `legacy/` after Forge-native shell exists; root entry until then. | `TRANSITIONAL_SHELL` |
| `index.html` | CRMAddlife browser document and PWA shell. | Root browser entry point that declares header, app content mount, bottom nav, chat modal, Supabase SDK, env loader, app module, and service worker. | Hosts `app.js`, creates DOM anchors required by current runtime, provides Supabase UMD and `env.js` ordering. | Title `CRM Addlife Professional`, header text `CRM Addlife`, CRM nav labels, assistant copy, inline shell UI. | Root runtime entry until replacement; then `legacy/` or replaced by Forge shell document. | `PURE_LEGACY` with runtime-entry exception |
| `dashboard.js` | CRMAddlife executive dashboard route. | Lazy-loaded route under proven loader boundary; reads Forge platform state and DB but still renders CRMAddlife dashboard UI. | `DB`, `AppState`, `EventBus`, `Logger`, `Memory`, `RenderEngine`. | CRM Addlife label, dashboard widgets, productivity/cartera/fidelization CRM presentation, route DOM IDs and widget style. | `legacy/` route or extraction source for future Advisor OS home. | `LEGACY_WITH_FORGE_DEPENDENCIES` |

## Forge Dependency Detection

### Dependencies On `app.js`

`app.js` is currently consumed as the root runtime entry, not as a domain dependency.

| Forge area | Dependency type | Notes |
| --- | --- | --- |
| Platform | Boot host and compatibility shell | `app.js` initializes platform services and route lifecycle. |
| Advisor OS | Current route access only | Advisor routes are registered by the legacy shell; this is routing access, not domain ownership. |
| Product Intelligence | None direct in audited surface | Product domains should not depend on `app.js`. |
| Manager OS | None direct in audited surface | Manager domains should not depend on `app.js`. |
| Shared | None direct in audited surface | Shared primitives should not depend on browser shell. |

### Dependencies On `index.html`

`index.html` is a browser/runtime document, not a domain dependency.

| Forge area | Dependency type | Notes |
| --- | --- | --- |
| Platform | Root document and boot ordering | Provides `window.supabase`, `window.__ENV__`, `#app-content`, nav, chat, and `app.js` entry. |
| Advisor OS | Current nav access | Nav targets expose current advisor workflows through legacy labels. |
| Product Intelligence | None direct | Should remain independent from HTML shell. |
| Manager OS | None direct | Should remain independent from HTML shell. |
| Shared | None direct | Should remain independent from HTML shell. |

### Dependencies On `dashboard.js`

`dashboard.js` depends on Forge platform services, but Forge domains should not depend on it as a canonical domain module.

| Forge area | Dependency type | Notes |
| --- | --- | --- |
| Platform | Route lifecycle consumer | Dashboard consumes state, event, render, logger, memory, and DB services. |
| Advisor OS | Legacy dashboard surface | It approximates advisor home/status, but it is not the final Advisor OS home. |
| Policy Operations | Data consumer | Reads `cartera` data for dashboard presentation. Does not own policy operations. |
| Shared | Indirect data contract use | Consumes shared-ish records through `DB`, but does not define shared contracts. |
| Product Intelligence | None direct | No product-truth ownership. |
| Manager OS | None direct | No manager ownership. |

## Shell Responsibility Audit

| Responsibility | Current file/surface | Current owner classification | Target owner |
| --- | --- | --- | --- |
| Navigation | `app.js` `EnterpriseRouter`, `index.html` nav buttons | Transitional | Forge Platform router |
| Route registry | `app.js` route descriptors | Transitional | Forge Platform route registry |
| Route loading | `app.js` mixed resolver after RUNTIME-013 | Forge Runtime emerging inside legacy shell | Forge Platform route loader |
| Authentication bootstrap | `app.js` `AuthService`, `index.html` Supabase SDK/env ordering | Transitional | Forge Platform auth boundary |
| Supabase bootstrap | `index.html` UMD global, `app.js` `SupabaseRuntime.init`, compatibility `window.supabaseClient` | Transitional | Forge Platform Supabase boundary |
| Layout shell | `index.html` header/nav/chat, `app.js` hydration/listeners | Legacy Shell | Future Forge shell layout |
| Menu system | `index.html` bottom nav, `app.js` delegated nav handler | Legacy Shell | Forge Platform navigation + domain route manifests |
| Dashboard rendering | `dashboard.js` route template/controller | Legacy with Forge dependencies | Future Advisor OS home/dashboard |
| Global error handling | `app.js`, `ErrorHandler` | Transitional | Forge Platform |
| Loader/error state | `app.js`, `AppState`, `AppShell` | Transitional | Forge Platform |

## Classification Summary

| File | Classification | Reason |
| --- | --- | --- |
| `app.js` | `TRANSITIONAL_SHELL` | Owns legacy boot/UI/navigation but now hosts Forge platform runtime services and route-loader proof. |
| `index.html` | `PURE_LEGACY` with runtime-entry exception | Contains CRMAddlife shell document and UI anchors; must remain only because current browser boot depends on it. |
| `dashboard.js` | `LEGACY_WITH_FORGE_DEPENDENCIES` | Legacy dashboard UI and calculations consume Forge platform services but are not final Forge Advisor OS architecture. |

## Final Boundary Verdict

The CRMAddlife shell is not Forge-native.

The Forge-native boundary begins where reusable runtime services, state, lifecycle, eventing, rendering, logging, error handling, Supabase runtime ownership, and route loading become independent from CRMAddlife UI assumptions.

The safe architecture move is not to further beautify or deepen the legacy shell. The safe move is to freeze it, extract useful runtime contracts, preserve compatibility only while required, and retire or replace CRMAddlife shell assets as Forge-native runtime and domain surfaces mature.
