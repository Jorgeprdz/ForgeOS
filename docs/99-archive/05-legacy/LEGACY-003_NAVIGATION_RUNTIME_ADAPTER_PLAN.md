# LEGACY-003 Navigation Runtime Adapter Plan

Report ID: LEGACY-003
Status: CONTROLLED REPAIR PLANNING / NO IMPLEMENTATION
Date: 2026-06-11

## Purpose

Design the smallest compatibility adapter that exposes a Forge-owned navigation runtime while preserving current CRMAddlife legacy shell behavior.

No implementation was performed.

No files were moved. No imports were rewritten. No runtime code was modified.

## Current Navigation Flow

Shell menu flow:

```text
index.html
  .nav-btn[data-target]
        |
        v
app.js / AppManager._bindGlobalListeners()
  delegated click handler
        |
        v
EnterpriseRouter.navigate(route)
        |
        +--> validate route descriptor
        +--> Lifecycle.destroyAll()
        +--> resolve route module
        +--> RenderEngine.schedule(render)
        +--> Lifecycle.mount(bind)
        +--> set currentRoute
        +--> AppState.set('route', route)
        +--> update active nav class
        +--> history.replaceState(... '#' + route)
        +--> Analytics.track('route_change')
        +--> EventBus.emit('route:changed')
```

Legacy workflow flow:

```text
referidos.js
  localStorage.setItem('auto_prospecto', ...)
  localStorage.setItem('auto_generar_guion', 'true')
        |
        v
  window.navigateTo('prospeccion')
        |
        v
  expected route transition
```

```text
comisiones.js
  save profile or reset profile
        |
        v
  setTimeout(() => window.navigateTo('comisiones'), 400)
        |
        v
  expected route self-refresh
```

Problem:

- The real router is private inside `app.js`.
- The active route modules call `window.navigateTo`.
- The current shell evidence does not define `window.navigateTo`.

## Adapter Placement Options

| Option | Placement | Pros | Cons | Verdict |
| --- | --- | --- | --- | --- |
| A | `platform/navigation-runtime.js` | Future-folder compatible; makes navigation a platform boundary; avoids permanent `app.js` ownership; supports eventual route manifest extraction. | Requires a new platform file in implementation. | SELECTED |
| B | `navigation-runtime.js` at root | Low path complexity; easy for legacy modules to import. | Keeps new platform ownership in root; creates another root runtime asset to migrate later. | Rejected |
| C | `app.js` internal export | Lowest immediate file count. | Keeps `app.js` as owner; route modules importing from `app.js` would create bad shell coupling. | Rejected |
| D | `legacy/navigation-shim.js` | Honest about compatibility. | Frames navigation as legacy instead of Forge-owned platform contract; wrong long-term ownership. | Rejected |

Selected placement:

```text
platform/navigation-runtime.js
```

Reason:

Forge navigation is a platform responsibility. The adapter should be born in the target ownership boundary even if `app.js` remains the temporary executor.

## Adapter API Design

Public route-consumer API:

```js
Navigation.navigate(route, params)
Navigation.currentRoute()
Navigation.subscribe(listener)
Navigation.unsubscribe(listener)
```

Platform/shell binding API:

```js
Navigation.setNavigator(fn)
Navigation.bindLegacyWindow()
Navigation.unbindLegacyWindow()
```

Recommended export shape:

```js
export const Navigation = {
    setNavigator,
    navigate,
    currentRoute,
    subscribe,
    unsubscribe,
    bindLegacyWindow,
    unbindLegacyWindow,
};
```

## Required Methods

### `navigate(route, params = {})`

Purpose:

- The only route-transition request method route modules should call.

Behavior:

- Validate `route` is a non-empty string.
- Delegate to the registered navigator function.
- Preserve `params` for subscriber metadata.
- Notify subscribers after successful navigation, or let the navigator surface errors according to existing shell behavior.

Example:

```js
Navigation.navigate('prospeccion', {
    source: 'referidos',
    handoffKey: 'auto_prospecto',
});
```

### `currentRoute()`

Purpose:

- Return the last known route from the adapter.

Behavior:

- Initially returns `null`.
- Updates after successful `navigate`.
- In the first implementation, may mirror the route passed through the adapter. Later it can bind to platform route state.

### `subscribe(listener)`

Purpose:

- Allow shell or future domain observers to observe navigation.

Behavior:

- Register listener.
- Return unsubscribe function.
- Listener receives `{ route, previousRoute, params }`.

### `unsubscribe(listener)`

Purpose:

- Explicitly remove listener.

Behavior:

- Idempotent.
- No throw for unknown listeners.

## Platform/Shell Binding Methods

### `setNavigator(fn)`

Required:

- Yes.

Reason:

- `platform/navigation-runtime.js` must not import `app.js`.
- `app.js` can register `route => this.router.navigate(route)` during bootstrap.
- This lets ownership move to platform contract without physically moving the router yet.

Expected first implementation shape:

```js
Navigation.setNavigator((route, params) => this.router.navigate(route));
```

### `bindLegacyWindow()`

Required:

- Yes, temporarily.

Reason:

- LEGACY-003 selects temporary `window.navigateTo` compatibility.
- A shim lets old callers keep working during transition while new code imports `Navigation`.
- It prevents accidental runtime breakage if a missed legacy call site remains.

Expected behavior:

```js
window.navigateTo = (route, params) => Navigation.navigate(route, params);
```

### `unbindLegacyWindow()`

Required:

- Yes.

Reason:

- Supports tests, future cleanup, and controlled retirement of the global shim.
- Avoids making `window.navigateTo` feel permanent.

Expected behavior:

```js
if (window.navigateTo === shimFn) {
    delete window.navigateTo;
}
```

## App.js Integration Plan

LEGACY-004 should connect the existing shell router to the platform Navigation runtime without moving router ownership physically yet.

Expected plan:

1. `app.js` imports `Navigation` from `./platform/navigation-runtime.js`.
2. `AppManager` registers the current router:

```js
Navigation.setNavigator((route, params) => {
    return this.router.navigate(route);
});
```

3. `app.js` optionally calls:

```js
Navigation.bindLegacyWindow();
```

4. Existing nav button handling may remain:

```js
if (target) this.router.navigate(target);
```

or may switch to:

```js
if (target) Navigation.navigate(target);
```

Recommended for LEGACY-004:

- Keep nav button behavior unchanged unless the implementation remains clearly low-risk.
- Focus on making route module calls stop depending directly on `window.navigateTo`.

Important rule:

- Route modules must not import from `app.js`.

## Legacy Window Compatibility Policy

Selected option:

**B. Keep as shim to `Navigation.navigate`**

Policy details:

- Keep `window.navigateTo` temporarily as a compatibility shim.
- Mark it deprecated in the implementation comments.
- New or repaired call sites should import/use `Navigation.navigate`, not `window.navigateTo`.
- The shim exists to avoid breakage from undiscovered legacy callers.
- Future cleanup should remove it after all consumers are migrated and verified.

Rejected options:

| Option | Reason rejected |
| --- | --- |
| A. Remove immediately | Risky because legacy shell discovery found active call sites and backup references. |
| C. Keep only in dev | Runtime behavior should not diverge between dev and production while compatibility is unresolved. |
| D. Deprecate but preserve | Too vague unless implemented as a concrete shim to the platform contract. |

## Adapter Verdict

Selected adapter placement:

```text
platform/navigation-runtime.js
```

Execution readiness:

`PASS_WITH_GUARD`

Guard:

- Keep the adapter minimal.
- Do not move router code.
- Preserve legacy window shim temporarily.
- Replace only the three active route call sites in LEGACY-004.

