# LEGACY-002 Minimum Navigation Contract

Report ID: LEGACY-002
Status: ARCHITECTURE DISCOVERY / NO IMPLEMENTATION
Date: 2026-06-11

## Purpose

Define the smallest viable conceptual navigation contract for Forge OS.

This is a contract design only. No implementation is authorized by this document.

## Contract Goals

The navigation contract must:

- Let route modules request navigation without referencing `app.js`.
- Preserve existing route lifecycle side effects.
- Preserve route names during the transition.
- Support current UI nav clicks and workflow navigation.
- Provide current route visibility.
- Provide subscription hooks for future shell/domain reactions.
- Avoid exposing the private `EnterpriseRouter` instance.
- Avoid investing heavily in CRMAddlife shell architecture.

## Minimum Contract

Recommended conceptual API:

```js
Navigation.navigate(route)
Navigation.navigate(route, params)
Navigation.currentRoute()
Navigation.subscribe(listener)
Navigation.unsubscribe(listener)
```

Equivalent shape is acceptable if ownership remains platform-level and route modules do not call `app.js` directly.

## Method Definitions

### `navigate(route)`

Purpose:

- Request a route transition by route key.

Contract:

```js
Navigation.navigate('prospeccion')
```

Rules:

- `route` must be a known route key.
- Navigation runtime owns route validation.
- Navigation runtime owns lifecycle, loading, render, bind, URL hash, analytics, and route event side effects.
- Domain modules may request navigation but may not perform route rendering.

### `navigate(route, params)`

Purpose:

- Request navigation with contextual metadata.

Contract:

```js
Navigation.navigate('prospeccion', {
    source: 'referidos',
    handoffKey: 'auto_prospecto'
})
```

Rules:

- `params` must not become an uncontrolled global state bucket.
- During legacy transition, params may document existing localStorage handoff behavior.
- Future contract should prefer explicit handoff state over ad hoc localStorage keys.

### `currentRoute()`

Purpose:

- Return current active route key.

Contract:

```js
const route = Navigation.currentRoute()
```

Rules:

- Should reflect the same value currently stored by router `currentRoute` and `AppState.route`.
- Should not require DOM inspection.

### `subscribe(listener)`

Purpose:

- Let shell adapters or domain observers react to route changes.

Contract:

```js
const unsubscribe = Navigation.subscribe(({ route, previousRoute, params }) => {
    // observe route change
})
```

Rules:

- Listener receives route transition metadata.
- Listener must not own navigation side effects unless registered by platform shell.
- Must return or pair with an unsubscribe function.

### `unsubscribe(listener)`

Purpose:

- Remove a route change listener when explicit unsubscribe style is used.

Contract:

```js
Navigation.unsubscribe(listener)
```

Rules:

- Must be idempotent.
- Must not throw if listener is absent.

## Ownership Boundaries

| Concern | Owner |
| --- | --- |
| Route validation | Navigation runtime |
| Route descriptors | Platform route manifest/runtime |
| Route loading | Platform route loader |
| Route rendering | Navigation runtime through render contract |
| Route bind | Navigation runtime through lifecycle |
| URL hash | Navigation runtime |
| Active route state | Navigation runtime |
| Active nav UI class | Shell UI adapter |
| Workflow navigation requests | Domain route modules as consumers only |
| Handoff data | Domain-specific contract, not navigation runtime by default |

## Transitional Adapter Strategy

LEGACY-003 should not physically move routing code yet.

Recommended sequence:

1. Create or design a platform-owned navigation adapter.
2. Bind it to the existing `EnterpriseRouter.navigate(route)` behavior.
3. Replace active `window.navigateTo` consumers with the explicit contract.
4. Preserve `index.html` nav delegation for now.
5. Keep route keys unchanged.
6. Validate `referidos` to `prospeccion` handoff.
7. Validate `comisiones` self-refresh behavior.

## Compatibility Rules

During transition:

- `app.js` may remain the physical executor of navigation.
- Platform navigation should become the conceptual owner.
- Route modules should stop depending on `window.navigateTo`.
- No route module should import or reach into `app.js`.
- No broad route movement should happen in the same step.

## Extraction Readiness Verdict

`PARTIALLY_READY`

Reason:

- The current router is centralized and async.
- RUNTIME-013 proved a route loader boundary.
- Active global navigation consumers are few.
- But navigation execution is still private inside `app.js`, route UI is still declared in `index.html`, and `window.navigateTo` consumers are still active.

## Recommended LEGACY-003 Scope

Title:

**Navigation Runtime Adapter Plan**

Scope:

- Design exact adapter placement and API.
- Decide whether the first implementation should be:
  - a new `platform/navigation-runtime.js`, or
  - a temporary shell-local adapter exported from `app.js`, or
  - a minimal global compatibility shim.
- Prefer platform-owned adapter if implementation risk remains low.
- Produce an exact call-site replacement plan for:
  - `referidos.js:167`
  - `comisiones.js:310`
  - `comisiones.js:466`
- Include validation for:
  - nav button clicks
  - initial hash route
  - dashboard lazy route
  - `referidos` to `prospeccion` handoff
  - `comisiones` self-refresh

Do not include:

- No file movement.
- No route lazy-loading beyond dashboard.
- No `comisiones` refactor.
- No `index.html` replacement.
- No CRMAddlife shell redesign.

## Final Verdict

Current navigation owner:

- `app.js` transitional shell.

Future navigation owner:

- `platform/navigation-runtime.js`.

Minimum viable contract:

- `navigate(route)`
- `navigate(route, params)`
- `currentRoute()`
- `subscribe(listener)`
- `unsubscribe(listener)`

Strategy:

- Freeze the legacy shell.
- Extract the contract.
- Preserve compatibility temporarily.
- Replace shell-global navigation over time.

Confidence score:

- 0.89

