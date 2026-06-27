# LEGACY-004 Navigation Runtime Adapter Execution Report

Report ID: LEGACY-004
Status: CONTROLLED IMPLEMENTATION COMPLETE
Date: 2026-06-11

## Scope

Implemented the approved Platform-owned Navigation runtime adapter and replaced only the three active `window.navigateTo` route call sites.

No files were moved. No routes were lazy-loaded. `index.html` was not changed. No broad refactor was performed.

## Files Changed

Runtime implementation:

| File | Change |
| --- | --- |
| `platform/navigation-runtime.js` | Added Forge-owned navigation adapter with `Navigation.navigate`, `currentRoute`, `subscribe`, `unsubscribe`, `setNavigator`, `bindLegacyWindow`, and `unbindLegacyWindow`. |
| `app.js` | Imported `Navigation`, registered the existing `EnterpriseRouter.navigate` executor, and bound the temporary deprecated `window.navigateTo` compatibility shim. |
| `referidos.js` | Replaced the single active `window.navigateTo('prospeccion')` workflow call with `Navigation.navigate(...)`. |
| `comisiones.js` | Replaced the two active `window.navigateTo('comisiones')` self-refresh calls with `Navigation.navigate(...)`. |

Validation tooling:

| File | Change |
| --- | --- |
| `scripts/runtime-module-graph-audit.js` | Updated the audit to include top-level `platform/*.js` files so the approved `platform/navigation-runtime.js` target is recognized by runtime validation. |

Validation side effect:

| File | Change |
| --- | --- |
| `docs/06-repository-governance/reports/repo-migration-check-report.json` | Rewritten by the required repository harness validation command. |

Note:

- `comisiones.js` already had an unrelated pre-existing diff changing `getSupabase` from `app.js` to `supabase-runtime.js`; LEGACY-004 only added `Navigation` and replaced the two approved navigation call sites.

## Call Sites Replaced

| File | Previous call | Replacement | Status |
| --- | --- | --- | --- |
| `referidos.js` | `window.navigateTo('prospeccion')` | `Navigation.navigate('prospeccion', { source: 'referidos', handoffKey: 'auto_prospecto', autoGenerateKey: 'auto_generar_guion' })` | Replaced |
| `comisiones.js` | `setTimeout(() => window.navigateTo('comisiones'), 400)` after profile save | `Navigation.navigate('comisiones', { source: 'comisiones', reason: 'profile_saved' })` inside existing timeout | Replaced |
| `comisiones.js` | `setTimeout(() => window.navigateTo('comisiones'), 400)` after profile reset | `Navigation.navigate('comisiones', { source: 'comisiones', reason: 'profile_reset' })` inside existing timeout | Replaced |

## Shim Policy

Selected policy from LEGACY-003:

**Keep `window.navigateTo` temporarily as a deprecated shim to `Navigation.navigate`.**

Implementation:

- `platform/navigation-runtime.js` owns the shim.
- `Navigation.bindLegacyWindow()` assigns `window.navigateTo = legacyShim`.
- `Navigation.unbindLegacyWindow()` removes the shim only if it still owns it.
- Repaired route modules call `Navigation.navigate` directly.

Current search result:

| Surface | Result |
| --- | --- |
| Active route modules | `0` active `window.navigateTo` calls |
| Adapter | Contains compatibility shim |
| `comisiones.js.bk` | Still contains historical backup references; intentionally untouched |

## Validation Results

Pre-flight baseline:

```json
{
  "totalJsFilesScanned": 671,
  "totalImportsFound": 196,
  "staticImportsFound": 194,
  "dynamicImportsFound": 2,
  "missingTargetsCount": 4,
  "missingExportsCount": 2,
  "circularImportsCount": 0,
  "bootBlockersCount": 0,
  "executabilityVerdict": "EXECUTABLE_WITH_WARNINGS",
  "confidenceScore": 0.88
}
```

Active baseline `window.navigateTo` call sites:

- `referidos.js:167`
- `comisiones.js:310`
- `comisiones.js:466`

Post-implementation validation:

| Command | Result |
| --- | --- |
| `node --check scripts/runtime-module-graph-audit.js` | PASS |
| `node --check platform/navigation-runtime.js` | PASS |
| `node --check app.js` | PASS |
| `node --check referidos.js` | PASS |
| `node --check comisiones.js` | PASS |
| `node scripts/runtime-module-graph-audit.js` | PASS with warnings |
| `node scripts/repo-doc-migration-harness.js check --output-dir docs/06-repository-governance/reports` | PASS_WITH_WARNINGS_ALLOWED |
| `git diff --check` | PASS |

Post-implementation runtime graph:

```json
{
  "totalJsFilesScanned": 672,
  "totalImportsFound": 199,
  "staticImportsFound": 197,
  "dynamicImportsFound": 2,
  "missingTargetsCount": 4,
  "missingExportsCount": 2,
  "circularImportsCount": 0,
  "bootBlockersCount": 0,
  "executabilityVerdict": "EXECUTABLE_WITH_WARNINGS",
  "confidenceScore": 0.88
}
```

Search checks:

```text
rg -n "window\\.navigateTo|\\bnavigateTo\\s*\\(" app.js referidos.js comisiones.js platform/navigation-runtime.js
```

Result:

- Only `platform/navigation-runtime.js` contains the active compatibility shim.

```text
rg -n "window\\.navigateTo|\\bnavigateTo\\s*\\(" app.js referidos.js comisiones.js comisiones.js.bk platform/navigation-runtime.js
```

Result:

- `platform/navigation-runtime.js` contains shim lines.
- `comisiones.js.bk` still contains backup references.
- No active route module call sites remain.

## Success Criteria Check

| Criterion | Status |
| --- | --- |
| `platform/navigation-runtime.js` created | PASS |
| `app.js` registers Navigation runtime | PASS |
| Only 3 active `window.navigateTo` call sites replaced | PASS |
| Boot blockers remain 0 | PASS |
| Circular imports remain 0 | PASS |
| No `index.html` changes | PASS |
| No route movement | PASS |
| Validation passes | PASS |

## Remaining Navigation Legacy Surfaces

Still legacy/transitional:

- `EnterpriseRouter` still physically lives inside `app.js`.
- Route registry still physically lives inside `app.js`.
- `index.html` still declares nav `data-target` values.
- `window.navigateTo` remains as a temporary compatibility shim.
- `comisiones.js.bk` still contains historical backup references.

Resolved in LEGACY-004:

- Active route modules no longer call `window.navigateTo`.
- Navigation has a platform-owned adapter boundary.
- `app.js` is now the temporary executor registered into Navigation, not the conceptual owner.

## Runtime Health Impact

Projected effect:

| Metric | Before | After LEGACY-004 |
| --- | ---: | ---: |
| Active `window.navigateTo` route call sites | 3 | 0 |
| Boot blockers | 0 | 0 |
| Circular imports | 0 | 0 |
| Runtime Health | 82 | 84 projected |
| Migration Readiness | Baseline after RUNTIME-013 | +4 projected |
| Legacy shell coupling | High | Medium |

## Recommended Next Scope

Recommended next scope:

**LEGACY-005 Route Registry Extraction Plan**

Include:

- Plan platform ownership for route descriptors.
- Decide whether route descriptors can move to a platform manifest while route modules remain in place.
- Keep `app.js` as temporary executor until platform shell replacement exists.
- Preserve dashboard lazy-loading.
- Preserve Navigation runtime adapter.

Defer:

- Do not move route modules yet.
- Do not replace `index.html` yet.
- Do not lazy-load `comisiones`.
- Do not remove `window.navigateTo` shim until backup/legacy consumers are addressed.

