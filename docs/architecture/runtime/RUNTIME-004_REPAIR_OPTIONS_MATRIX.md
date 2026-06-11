# RUNTIME-004 Repair Options Matrix

Report ID: RUNTIME-004
Status: Controlled Repair Planning / No Fixes
Date: 2026-06-11

## 1. Overlay Manager Options

| Option | Description | Blast Radius | Import Risk | Git History Preservation | Runtime Risk | Long-Term Quality | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A | Rename `ovelay-manager.js` to `overlay-manager.js` | Medium | Medium | Medium; `git mv` can preserve history but changes physical identity | Medium | High | Defer |
| B | Add `overlay-manager.js` shim re-exporting from `ovelay-manager.js` | Low | Low | High; existing file untouched | Low | Medium | Recommended |
| C | Change `utils.js` import to `./ovelay-manager.js` | Low | Low | High | Low | Low; codifies typo as canonical | Reject |
| D | Other: duplicate implementation into `overlay-manager.js` | Medium | Medium | Low; creates duplicate truth | Medium | Low | Reject |

Recommended overlay repair:

**Option B: add a compatibility shim.**

Rationale:

- Solves the boot blocker with the smallest reversible change.
- Avoids making the misspelled filename canonical.
- Avoids a rename before hidden consumers and runtime behavior are validated.
- Allows a later cleanup wave to rename or retire `ovelay-manager.js` deliberately.

## 2. callGemini Options

| Option | Description | Boot Cycle Risk | App Shell Contamination | Minimality | Long-Term Quality | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| A | Export `callGemini` from `app.js` | High; preserves route-to-shell dependency | High | High | Low | Reject |
| B | Move `callGemini` into a dedicated new service module | Low | Low | Medium | High | Acceptable, but not first choice |
| C | Add compatibility shim module and rewrite consumers to it | Low | Low | Medium | Medium | Acceptable |
| D | Use existing `ai-service.js` and expose `callGemini` adapter there | Low | Low | High | High | Recommended |
| E | Remove AI calls from route modules | Low | Low | Low | Unknown | Reject for this scope |

Recommended callGemini repair:

**Option D: add a `callGemini` adapter to `ai-service.js` and rewrite only the two invalid imports.**

Rationale:

- `ai-service.js` already owns the `/api/gemini` capability.
- `callGemini` belongs behind an AI service boundary, not in `app.js`.
- This removes the missing export contract without turning the app shell into a service module.
- It preserves current route behavior by keeping the same function shape: prompt plus output element.

## 3. Circular Import Impact

| Cycle | Current Cause | If `callGemini` moves to `ai-service.js` | Required Follow-Up |
| --- | --- | --- | --- |
| `app.js -> prospeccion.js -> app.js` | `prospeccion.js` imports `callGemini` from `app.js`. | Cleared. | None for this cycle. |
| `app.js -> comisiones.js -> app.js` | `comisiones.js` imports `callGemini` and `getSupabase` from `app.js`. | Partially improved; `getSupabase` still creates a shell dependency. | Future Supabase compatibility boundary. |

Conclusion:

The `callGemini` repair is sufficient to eliminate one app-shell cycle and clear two missing-export boot blockers. It is not sufficient to fully eliminate the `comisiones.js` cycle unless `getSupabase` is also moved behind a platform/auth boundary.

## 4. Minimal Approved Future Change Set

Future RUNTIME-005 should be limited to:

| File | Planned Change | Reason |
| --- | --- | --- |
| `overlay-manager.js` | Create shim that re-exports `OverlayRuntime` from `./ovelay-manager.js`. | Resolve missing module target. |
| `ai-service.js` | Export `callGemini(prompt, outputElementId)` adapter using existing `AI.generate`. | Resolve missing AI service contract outside app shell. |
| `prospeccion.js` | Change only `callGemini` import source to `./ai-service.js`. | Remove invalid import from `app.js`. |
| `comisiones.js` | Split imports: keep `getSupabase` from `./app.js`; import `callGemini` from `./ai-service.js`. | Clear missing export while limiting scope. |

Files explicitly out of scope for RUNTIME-005:

- `app.js`
- `index.html`
- `manifest.json`
- `service-worker.js`
- `sw-cache-config.js`
- Package files
- Domain engines not involved in the three boot blockers

## 5. Risk Register

| Risk | Level | Mitigation |
| --- | --- | --- |
| Shim leaves typo-named legacy file in root | Low | Track as follow-up cleanup after boot validation. |
| `callGemini` adapter DOM behavior differs from historical implementation | Medium | Preserve current caller contract and update only target element content. |
| `comisiones.js` cycle remains because of `getSupabase` | Medium | Document as legacy compatibility cycle; do not expand RUNTIME-005 unless authorized. |
| AI endpoint `/api/gemini` unavailable | Low for boot, Medium for feature behavior | Existing `AI.generate` returns failure text and handles offline state. |
| Other non-boot missing targets remain | Medium | RUNTIME-005 success should target boot blockers only; route/domain blockers become RUNTIME-006+. |

## 6. Execution Gate for RUNTIME-005

RUNTIME-005 should only proceed if the authorized scope names exactly:

1. `overlay-manager.js` shim creation.
2. `ai-service.js` `callGemini` adapter.
3. `prospeccion.js` import rewrite.
4. `comisiones.js` import rewrite.
5. Validation with `runtime-module-graph-audit.js`.

Any request to move files, rename `ovelay-manager.js`, export from `app.js`, lazy-load routes, or refactor Supabase access should be treated as a separate runtime governance phase.

