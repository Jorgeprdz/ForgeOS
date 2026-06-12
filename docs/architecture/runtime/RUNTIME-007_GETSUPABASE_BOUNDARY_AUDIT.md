# RUNTIME-007 getSupabase Boundary Audit

Report ID: RUNTIME-007
Status: Architecture Discovery / No Execution
Date: 2026-06-11

## 1. Executive Summary

`getSupabase` is not a domain capability. It is a temporary Platform compatibility boundary currently exported from `app.js`.

Ownership verdict:

```txt
Platform owns the Supabase access boundary.
app.js may initialize the client during boot, but should not own database access as an exported service contract.
```

Current problem:

```txt
app.js -> comisiones.js -> app.js
```

Root cause:

`app.js` statically imports `comisiones.js`, while `comisiones.js` imports `getSupabase` from `app.js`.

Cycle classification:

```txt
Infrastructure Leak + Legacy Compatibility Layer
```

## 2. Current State

Current runtime graph state:

| Metric | Count |
| --- | ---: |
| JS files scanned | 671 |
| Imports found | 195 |
| Missing targets | 4 |
| Missing exports | 2 |
| Circular imports | 1 |
| Boot blockers | 0 |
| Verdict | EXECUTABLE_WITH_WARNINGS |

The remaining app-shell cycle is not currently a boot blocker, but it is a runtime modularization blocker.

## 3. getSupabase Inventory

### Definition

Defined in:

```txt
app.js
```

Observable definition:

```js
export function getSupabase() {
    return window.supabaseClient || null;
}
```

Adjacent comment in `app.js`:

```txt
Compatibilidad con módulos legacy pendientes de migración.
Los módulos ya migrados leen el usuario desde AppState.get('user').
TODO: eliminar cuando todos los módulos estén migrados.
```

### Imports

| Importer | Import | Purpose | Owner Domain | Dependency Type | Classification |
| --- | --- | --- | --- | --- | --- |
| `comisiones.js` | `getSupabase` from `./app.js` | Access Supabase auth/user and `crm_data` for advisor financial profile. | Compensation / Manager-aware route | Runtime service dependency | Legacy compatibility import |

Imported consumer count:

```txt
1
```

### Global Client Consumers

In addition to `getSupabase`, the global `window.supabaseClient` is directly consumed by:

| File | Usage | Purpose | Owner Domain | Dependency Type | Classification |
| --- | --- | --- | --- | --- | --- |
| `offline-sync.js` | `window.supabaseClient.from(...).upsert/delete` | Process offline queue to remote tables. | Platform | Storage/sync infrastructure | Platform direct global dependency |
| `realtime-engine.js` | `window.supabaseClient.channel(...).on(...)` | Subscribe/unsubscribe realtime table channels. | Platform | Realtime infrastructure | Platform direct global dependency |
| `app.js` | `window.supabase.createClient(...)`, `window.supabaseClient = this.client` | Boot-time client creation and compatibility exposure. | Platform / App shell | Bootstrap + compatibility | Transitional owner |

Total Supabase access consumers:

```txt
4 files
```

Consumer interpretation:

- Only `comisiones.js` imports the app shell.
- Platform runtime modules use the global client directly.
- `supabase-runtime.js` exists as a dedicated Platform boundary but is not currently the active source of truth for these consumers.

## 4. Platform Ownership Test

### Criteria

`app.js` should own:

- Bootstrapping
- Startup orchestration
- Route registration
- Lifecycle sequence
- Initial wiring of Platform services

`app.js` should not own:

- Database access contracts
- Storage contracts
- Auth infrastructure API
- Shared service accessors consumed by domain modules

### Evidence Chain

| Evidence | Interpretation |
| --- | --- |
| `app.js` creates Supabase client in `AuthService.init()`. | `app.js` currently owns boot-time creation because startup order lives there. |
| `app.js` writes `window.supabaseClient = this.client`. | Compatibility bridge exists for modules not yet migrated. |
| `app.js` comment says this global is only for legacy compatibility. | The file itself rejects permanent ownership. |
| `comisiones.js` imports `getSupabase` from `app.js`. | Domain/route module depends upward on app shell. |
| `offline-sync.js` and `realtime-engine.js` use `window.supabaseClient` directly. | Platform infrastructure already needs a shared Supabase boundary independent from `app.js`. |
| `supabase-runtime.js` exports `SupabaseRuntime` with `init`, `getClient`, `from`, `auth`, and `rpc`. | A candidate Platform-owned boundary already exists. |

### Verdict

Should `app.js` own `getSupabase` long term?

```txt
FAIL
```

Reason:

`app.js` may initialize the client during boot, but exported database/auth service access should live in Platform infrastructure, not in the app shell entry module.

## 5. What Breaks If getSupabase Is Removed From app.js

Direct breakage:

| Consumer | Breakage |
| --- | --- |
| `comisiones.js` | Static import fails unless rewritten to a Platform boundary. |

Indirect breakage:

| Area | Breakage |
| --- | --- |
| Boot sequence | Low risk if client initialization still occurs before authenticated route use. |
| Offline sync | No direct `getSupabase` breakage; still depends on `window.supabaseClient`. |
| Realtime | No direct `getSupabase` breakage; still depends on `window.supabaseClient`. |
| Domain modules | No other static import consumers found. |

Migration impact classification:

```txt
LOW_RISK if a Platform boundary is introduced first.
MEDIUM_RISK if getSupabase is simply removed from app.js without transitional adapter.
```

## 6. Final Boundary Verdict

`getSupabase` should be retired from `app.js`.

The long-term owner is:

```txt
Platform / Infrastructure / Supabase Runtime
```

Future repair should not be classified as runtime migration. It is a compatibility repair that moves a service accessor to the correct Platform boundary while preserving current behavior.

