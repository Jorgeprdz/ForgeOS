# RUNTIME-004 Boot Blocker Repair Plan

Report ID: RUNTIME-004
Status: Controlled Repair Planning / No Fixes
Date: 2026-06-11

## 1. Executive Summary

RUNTIME-003 is confirmed: the current ES module graph is a likely boot failure.

Validated blockers:

| Blocker | Evidence | Classification |
| --- | --- | --- |
| `utils.js` imports missing `./overlay-manager.js` | `utils.js` imports `OverlayRuntime` from `./overlay-manager.js`; root contains `ovelay-manager.js`, not `overlay-manager.js`. | BOOT_BLOCKER |
| `prospeccion.js` imports missing `callGemini` from `app.js` | `app.js` exports `getSupabase` only; no observable `callGemini` export. | BOOT_BLOCKER |
| `comisiones.js` imports missing `callGemini` from `app.js` | `app.js` exports `getSupabase` only; no observable `callGemini` export. | BOOT_BLOCKER |

RUNTIME-004 applies no fix. It defines the safest minimal repair path for a future RUNTIME-005 execution.

## 2. Validation Report Load

Source reports reviewed:

- `docs/07-runtime/RUNTIME-003_MODULE_GRAPH_VALIDATION.md`
- `docs/07-runtime/RUNTIME-003_MODULE_GRAPH_VALIDATION.json`
- `docs/07-runtime/RUNTIME-003_APP_SHELL_COUPLING_MAP.md`

Confirmed RUNTIME-003 counts:

| Metric | Count |
| --- | ---: |
| JS files scanned | 670 |
| Imports found | 194 |
| Missing targets | 5 |
| Missing exports | 4 |
| Circular imports | 2 |
| Boot blockers | 3 |
| Executability verdict | LIKELY_BOOT_FAILURE |

The requested boot-blocker count matches the current validation report.

## 3. Overlay Manager Contract Analysis

### Observable Contract

`utils.js` requires:

```js
import { OverlayRuntime } from './overlay-manager.js';
```

The repository contains:

```txt
ovelay-manager.js
```

The existing typo-named file exports:

```js
export const OverlayRuntime = new OverlayManager();
```

No root `overlay-manager.js` file exists.

### Interpretation

The module content and internal file header indicate the intended conceptual file is `overlay-manager.js`. The physical filename appears to be a typo: `ovelay-manager.js`.

Historical repository reports previously treated `ovelay-manager.js` as an unknown or low-confidence migration candidate because no incoming import was detected. RUNTIME-003 changed that interpretation: the intended consumer exists, but the misspelled filename made the dependency invisible to static resolution.

### Recommended Repair

Recommended option: **B. Add `overlay-manager.js` compatibility shim that re-exports from `ovelay-manager.js`.**

Reason:

- Resolves the boot-blocking missing target without renaming the legacy file.
- Avoids broad file movement or git history disturbance during first repair.
- Keeps the change reversible.
- Preserves compatibility if any hidden or external reference still points to `ovelay-manager.js`.
- Creates an explicit bridge from the correct conceptual name to the typo-named legacy implementation.

Future cleanup may rename `ovelay-manager.js` to `overlay-manager.js`, but only after the app shell is executable and hidden consumers have been checked.

## 4. callGemini Contract Analysis

### Observable Contract

`prospeccion.js` imports:

```js
import { callGemini } from './app.js';
```

`comisiones.js` imports:

```js
import { getSupabase, callGemini } from './app.js';
```

`app.js` exports:

```js
export function getSupabase() {
    return window.supabaseClient || null;
}
```

No `callGemini` export exists in `app.js`.

The repository also contains `ai-service.js`, which exposes an `AI` service with a `generate({ prompt })` method that calls `/api/gemini`.

### Architectural Finding

`callGemini` is an AI service capability, not an app shell capability.

Exporting it from `app.js` would be the smallest syntactic fix, but it would preserve the wrong dependency direction:

```txt
app.js -> route module -> app.js
```

That cycle makes route defects part of boot and turns `app.js` into a service bucket.

### Recommended Repair

Recommended option: **D with minimal service adapter: rewrite `callGemini` consumers to import the capability from an AI service boundary, not from `app.js`.**

Preferred RUNTIME-005 implementation shape:

1. Add or expose a `callGemini(prompt, outputElementId)` compatibility function from `ai-service.js`.
2. Rewrite only these imports:
   - `prospeccion.js`: from `./app.js` to `./ai-service.js`
   - `comisiones.js`: remove `callGemini` from the `./app.js` import and import it from `./ai-service.js`
3. Do not modify route behavior beyond the import source and service adapter.
4. Do not move modules.
5. Do not refactor app routing.

This is more surgical than introducing a new AI module and cleaner than exporting the missing function from `app.js`.

## 5. Circular Import Analysis

RUNTIME-003 found two app-shell cycles:

| Cycle | Cause | RUNTIME-004 Classification |
| --- | --- | --- |
| `app.js -> prospeccion.js -> app.js` | `prospeccion.js` imports `callGemini` from `app.js`. | FIXED_BY_CALLGEMINI_REPAIR |
| `app.js -> comisiones.js -> app.js` | `comisiones.js` imports `callGemini` and `getSupabase` from `app.js`. | REQUIRES_APP_SHELL_REFACTOR |

The `prospeccion.js` cycle should disappear if `callGemini` is moved behind the AI service boundary.

The `comisiones.js` cycle will not be fully eliminated by a `callGemini` repair alone because `comisiones.js` also imports `getSupabase` from `app.js`. That import is explicitly marked in `app.js` as a legacy compatibility export. RUNTIME-005 should fix the boot blocker first, while preserving the remaining `getSupabase` cycle as known technical debt unless the execution scope explicitly includes a Supabase compatibility boundary.

## 6. Minimal Repair Plan

Recommended RUNTIME-005 scope:

1. Add `overlay-manager.js` shim:
   - Re-export `OverlayRuntime` from `./ovelay-manager.js`.
   - Do not rename `ovelay-manager.js`.
   - Do not change `utils.js` in the first repair unless the shim approach fails validation.

2. Add `callGemini` service adapter in `ai-service.js`:
   - Use the existing `AI.generate({ prompt })` service.
   - Preserve current caller contract: `(prompt, outputElementId)`.
   - Update target DOM element only after receiving the service result.
   - Return the AI result or a stable failure object.
   - Preserve offline/error handling from `AI.generate`.

3. Rewrite only approved import statements:
   - `prospeccion.js`: import `callGemini` from `./ai-service.js`.
   - `comisiones.js`: keep `getSupabase` from `./app.js`, import `callGemini` from `./ai-service.js`.

4. Run validation.

5. If module graph still reports the `comisiones.js` cycle, document it as a non-boot-blocking legacy cycle caused by `getSupabase`.

6. Defer broader shell cleanup:
   - Supabase access boundary
   - Route lazy-loading
   - Domain module movement
   - `ovelay-manager.js` rename

## 7. What RUNTIME-005 Must Not Do

RUNTIME-005 should not:

- Rename runtime files.
- Move route/domain modules.
- Export `callGemini` from `app.js`.
- Convert static route imports to dynamic imports.
- Refactor router or app shell.
- Rewrite compensation logic.
- Rewrite prospecting logic.
- Touch package files.
- Touch service worker, manifest, HTML, CSS, or PWA assets.

## 8. Validation Plan

Required commands after future repair:

```sh
node --check overlay-manager.js
node --check ai-service.js
node --check prospeccion.js
node --check comisiones.js
node scripts/runtime-module-graph-audit.js
node scripts/repo-doc-migration-harness.js check --output-dir docs/06-repository-governance/reports
git diff --check
git status --short
```

Recommended runtime/code diff review:

```sh
git diff -- app.js index.html manifest.json service-worker.js sw-cache-config.js package.json package-lock.json
git diff --name-only
```

Expected RUNTIME-005 success target:

| Gate | Expected |
| --- | --- |
| Missing `overlay-manager.js` target | Cleared |
| Missing `callGemini` exports from `app.js` | Cleared by removing the invalid imports |
| Boot blockers | 0 |
| `prospeccion.js` app-shell cycle | Cleared |
| `comisiones.js` app-shell cycle | May remain if `getSupabase` remains in scope |
| Runtime files moved | 0 |
| Domain refactor | 0 |

## 9. Final Verdict

Forge should not attempt runtime migration or app-shell refactor before a controlled boot-blocker repair.

Recommended next action:

**Proceed to RUNTIME-005 with a minimal compatibility repair:**

- Add `overlay-manager.js` shim.
- Add `callGemini` to the AI service boundary.
- Rewrite only the two `callGemini` imports.
- Leave the `getSupabase` legacy cycle for a later focused app-shell boundary audit.

Confidence score: **0.89**

