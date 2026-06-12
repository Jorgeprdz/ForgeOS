# RUNTIME-007 Cycle Root Cause Analysis

Report ID: RUNTIME-007
Status: Architecture Discovery / No Execution
Date: 2026-06-11

## 1. Cycle Under Review

Current cycle:

```txt
app.js -> comisiones.js -> app.js
```

Detected by:

```sh
node scripts/runtime-module-graph-audit.js
```

Current audit status:

| Metric | Count |
| --- | ---: |
| Circular imports | 1 |
| Boot blockers | 0 |
| Verdict | EXECUTABLE_WITH_WARNINGS |

## 2. Exact Dependency Chain

### Edge 1

`app.js` imports route module:

```js
import { renderComisiones, bindComisionesEvents } from './comisiones.js';
```

Purpose:

- Route registration / route rendering.
- App shell must know available route entrypoints in current static architecture.

### Edge 2

`comisiones.js` imports app shell service accessor:

```js
import { getSupabase } from './app.js';
```

Purpose:

- Get Supabase client during `bindComisionesEvents()`.
- Read authenticated user.
- Read/write advisor financial profile data from `crm_data`.

### Result

```txt
app shell imports route
route imports app shell
```

This is the dependency inversion that creates the cycle.

## 3. Root Cause Classification

Primary:

```txt
Infrastructure Leak
```

Secondary:

```txt
Legacy Compatibility Layer
```

Supporting evidence:

- `app.js` comment describes `window.supabaseClient` as legacy compatibility.
- `getSupabase` only returns `window.supabaseClient`.
- `comisiones.js` consumes infrastructure access from `app.js`.
- `supabase-runtime.js` already exists as a Platform runtime boundary candidate.

Rejected classifications:

| Classification | Verdict | Reason |
| --- | --- | --- |
| Domain Leak | Partial but not primary | Compensation consumes infrastructure; the leaked capability itself is Platform infrastructure. |
| Platform Leak | Partial | Platform service access leaks through app shell, but the immediate defect is the app shell export. |
| Unknown | Rejected | Evidence clearly identifies the import/export chain. |

## 4. Current Safety Assessment

Is execution currently safe?

```txt
EXECUTABLE_WITH_WARNINGS
```

Reason:

RUNTIME-005 removed the missing `callGemini` export. The current cycle remains, but the static audit reports zero boot blockers.

Risk:

The cycle can become unsafe if `getSupabase` changes from a simple global accessor into stateful initialization logic, or if `comisiones.js` starts reading app shell state at module top level.

## 5. Migration Impact

If no repair occurs:

| Future Action | Impact |
| --- | --- |
| Move `comisiones.js` to a Compensation folder | High risk because it imports `app.js` through a root-relative cycle. |
| Lazy-load route modules | Medium risk because route module still depends on app shell. |
| Split Platform boot from domain routes | Blocked by dependency direction. |
| Retire `window.supabaseClient` global | Blocked by multiple consumers. |

If boundary is repaired:

| Future Action | Impact |
| --- | --- |
| Move `comisiones.js` later | Lower risk; dependency points to Platform boundary. |
| Lazy-load route modules | Easier; route no longer imports shell. |
| Split Platform boot | Easier; app shell only initializes services. |
| Retire global client | Still requires later cleanup for `offline-sync.js` and `realtime-engine.js`. |

## 6. Recommended RUNTIME-008 Scope

Recommended next phase:

```txt
RUNTIME-008 GETSUPABASE COMPATIBILITY REPAIR PLAN
```

Scope should remain narrow:

- No runtime migration.
- No file moves.
- No route refactor.
- No Compensation logic changes.
- No Supabase global retirement yet.

RUNTIME-008 should either:

1. Produce a controlled repair plan, or
2. Execute a minimal compatibility repair if explicitly authorized.

Recommended minimal future repair:

| File | Future Change |
| --- | --- |
| `supabase-runtime.js` | Expose a compatibility accessor if needed. |
| `app.js` | Initialize `SupabaseRuntime` after client creation. |
| `comisiones.js` | Import Supabase access from Platform boundary instead of `app.js`. |

Expected validation target:

| Metric | Current | Target |
| --- | ---: | ---: |
| Circular imports | 1 | 0 |
| Boot blockers | 0 | 0 |
| Verdict | EXECUTABLE_WITH_WARNINGS | EXECUTABLE_WITH_WARNINGS |

Remaining warnings after target:

- 4 missing targets.
- 2 missing exports.

## 7. Final Verdict

The cycle is real, understood, and narrow.

It is not a current boot blocker, but it is a blocker for runtime modularization.

Final classification:

```txt
Infrastructure Leak through Legacy Compatibility Layer
```

Migration risk:

```txt
LOW_RISK with Platform boundary adapter first.
MEDIUM_RISK if `getSupabase` is removed directly from `app.js`.
```

Confidence score:

```txt
0.90
```

