# LEGACY-003 Execution Readiness

Report ID: LEGACY-003
Status: CONTROLLED REPAIR PLANNING / NO IMPLEMENTATION
Date: 2026-06-11

## Verdict

`PASS_WITH_GUARD`

The navigation runtime adapter is ready for a narrow LEGACY-004 repair if implementation remains limited to:

- Creating `platform/navigation-runtime.js`.
- Registering the existing `EnterpriseRouter.navigate` executor from `app.js`.
- Preserving `window.navigateTo` temporarily as a shim.
- Replacing only the three active `window.navigateTo` route call sites.

## Selected Adapter Placement

```text
platform/navigation-runtime.js
```

Reason:

- Navigation is a future platform responsibility.
- This avoids making `app.js` the long-term owner.
- This is compatible with ARCH-001 target physical architecture.
- It allows legacy compatibility without investing further in CRMAddlife shell architecture.

## Proposed API

Route-consumer API:

```js
Navigation.navigate(route, params)
Navigation.currentRoute()
Navigation.subscribe(listener)
Navigation.unsubscribe(listener)
```

Shell/platform binding API:

```js
Navigation.setNavigator(fn)
Navigation.bindLegacyWindow()
Navigation.unbindLegacyWindow()
```

## Window Compatibility Policy

Selected:

**B. Keep as shim to `Navigation.navigate`**

Implementation policy:

- `window.navigateTo` should temporarily exist only as a deprecated compatibility shim.
- All active route call sites should stop calling `window.navigateTo`.
- Future code should use `Navigation.navigate`.
- The shim should be removable after call-site migration and verification.

## LEGACY-004 Implementation Scope

Title:

**Navigation Runtime Adapter Repair**

Allowed:

- Add `platform/navigation-runtime.js`.
- Edit `app.js` only to:
  - import `Navigation`;
  - call `Navigation.setNavigator(...)`;
  - optionally call `Navigation.bindLegacyWindow()`;
  - preserve current `EnterpriseRouter.navigate` behavior.
- Edit `referidos.js` only to replace `window.navigateTo('prospeccion')`.
- Edit `comisiones.js` only to replace the two `window.navigateTo('comisiones')` calls.

Conditionally allowed:

- Add focused comments marking `window.navigateTo` as deprecated compatibility.

Disallowed:

- No file movement.
- No route lazy-loading beyond dashboard.
- No `index.html` replacement.
- No route name changes.
- No broad `app.js` refactor.
- No `comisiones.js` business logic refactor.
- No `referidos.js` workflow refactor beyond navigation call.
- No physical extraction of `EnterpriseRouter`.

## Expected Files Changed In LEGACY-004

| File | Expected change | Risk |
| --- | --- | --- |
| `platform/navigation-runtime.js` | New platform-owned navigation adapter. | LOW |
| `app.js` | Register current router with Navigation; bind temporary legacy window shim. | MEDIUM |
| `referidos.js` | Replace one workflow navigation call. | LOW_TO_MEDIUM |
| `comisiones.js` | Replace two self-refresh navigation calls. | MEDIUM |

Expected changed file count:

- 4

## Validation Plan

Syntax checks:

```sh
node --check app.js
node --check referidos.js
node --check comisiones.js
node --check platform/navigation-runtime.js
```

Repository/runtime checks:

```sh
node scripts/runtime-module-graph-audit.js
node scripts/repo-doc-migration-harness.js check --output-dir docs/architecture/repository/reports
git diff --check
```

Search checks:

```sh
rg -n "window\\.navigateTo|\\bnavigateTo\\s*\\(" app.js referidos.js comisiones.js
rg -n "Navigation\\.navigate|setNavigator|bindLegacyWindow" app.js referidos.js comisiones.js platform/navigation-runtime.js
```

Expected search interpretation:

- Active route modules should have no `window.navigateTo` calls.
- `platform/navigation-runtime.js` may contain the compatibility shim.
- `app.js` may call `Navigation.setNavigator` and `Navigation.bindLegacyWindow`.

Manual/browser checks if app environment is available:

- Nav buttons still route to:
  - dashboard
  - prospeccion
  - referidos
  - actividad
  - cartera
  - comisiones
- Initial empty hash still loads dashboard.
- Initial `#dashboard` still lazy-loads dashboard.
- Initial known hash still loads that route.
- `referidos` to `prospeccion` handoff still works.
- `comisiones` profile save still refreshes/re-enters comisiones.
- `comisiones` profile reset still refreshes/re-enters comisiones after confirmation.

## Projected Impact

If LEGACY-004 succeeds:

| Metric | Current | Projected |
| --- | ---: | ---: |
| Active `window.navigateTo` route call sites | 3 | 0 |
| Navigation owner clarity | Medium | High |
| Runtime Health | 82 | 84 |
| Migration Readiness | +0 baseline after RUNTIME-013 | +4 projected |
| Legacy shell coupling | High | Medium |

## Remaining Risks After LEGACY-004

- `index.html` still declares route menu targets.
- `EnterpriseRouter` still physically lives inside `app.js`.
- Route registry still physically lives inside `app.js`.
- `window.navigateTo` shim remains temporarily.
- `comisiones.js` remains high-risk and should not be lazy-loaded or moved yet.

## Recommended Post-LEGACY-004 Scope

Recommended next phase after successful implementation:

**LEGACY-005 Route Registry Extraction Plan**

Scope:

- Plan route manifest ownership.
- Decide whether route descriptors move to platform without moving route modules.
- Keep `app.js` as temporary executor until platform shell exists.
- Do not migrate folders yet.

Alternative:

- If any LEGACY-004 validation fails, perform a targeted navigation adapter repair report before further movement.

## Confidence Score

0.90

Confidence is high because active call-site count is small and the existing router is centralized. The main risk is `comisiones.js`, which remains behaviorally sensitive even if the navigation call itself is simple.

