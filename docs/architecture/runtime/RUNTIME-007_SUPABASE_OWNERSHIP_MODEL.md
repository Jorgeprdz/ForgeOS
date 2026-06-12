# RUNTIME-007 Supabase Ownership Model

Report ID: RUNTIME-007
Status: Architecture Discovery / No Execution
Date: 2026-06-11

## 1. Supabase-Related Assets

| Asset | Current Role | Current Owner | Recommended Owner | Notes |
| --- | --- | --- | --- | --- |
| `app.js` `AuthService.init()` | Creates Supabase client during boot. | App shell / Platform boot | Platform boot orchestration | May create or initialize the client, but should not be consumed by domains. |
| `window.supabase` | Browser SDK global from runtime environment. | External SDK / HTML environment | Platform infrastructure | Input dependency, not Forge-owned logic. |
| `window.supabaseClient` | Global compatibility client. | App shell compatibility | Transitional Platform compatibility | Should be replaced by Platform service access. |
| `getSupabase` | App shell export returning global client. | App shell compatibility | Platform Supabase boundary | Should move out of `app.js`. |
| `supabase-runtime.js` | Existing Supabase runtime wrapper with `init`, `getClient`, `from`, `auth`, `rpc`. | Platform candidate | Platform infrastructure | Best observed target boundary. |
| `offline-sync.js` | Uses Supabase for queued writes/deletes. | Platform | Platform sync/storage | Should consume Platform boundary instead of global. |
| `realtime-engine.js` | Uses Supabase realtime channels. | Platform | Platform realtime | Should consume Platform boundary instead of global. |
| `comisiones.js` | Uses Supabase for profile data. | Compensation route | Compensation consuming Platform | Should consume Platform boundary, not app shell. |

## 2. Logical Ownership Domains

### Platform Boot

Owns:

- Startup order
- Environment validation
- SDK client creation timing
- Initializing infrastructure services

Does not own:

- Domain calculations
- Compensation logic
- Product/rule-pack logic

### Platform Infrastructure

Owns:

- Supabase client boundary
- Auth/session accessors
- Table access wrappers
- Realtime channel access
- Sync/storage client access

Candidate current asset:

```txt
supabase-runtime.js
```

### Domain Consumers

Consumers:

- `comisiones.js`
- future route/domain modules requiring remote persistence

Rules:

- Must not import from `app.js`.
- Must consume a Platform service boundary.
- Must not create Supabase clients directly.

## 3. Candidate Architecture

Recommended model:

```txt
Platform
└─ Infrastructure
   └─ Supabase Runtime
      ├─ init(client)
      ├─ getClient()
      ├─ auth()
      ├─ from(table)
      ├─ rpc(fn, params)
      └─ realtime/channel helpers
```

Current observed implementation basis:

```txt
supabase-runtime.js
```

Current limitation:

`supabase-runtime.js` exists but is not yet wired into `app.js`, `comisiones.js`, `offline-sync.js`, or `realtime-engine.js`.

## 4. State Transition Model

### Current State

```txt
app.js
├─ creates Supabase client
├─ writes window.supabaseClient
├─ exports getSupabase()
└─ imports comisiones.js

comisiones.js
└─ imports getSupabase from app.js
```

Cycle:

```txt
app.js -> comisiones.js -> app.js
```

### Transitional State

```txt
app.js
├─ creates Supabase client
├─ initializes SupabaseRuntime with client
└─ no longer exports getSupabase to domains

supabase-runtime.js
└─ exports SupabaseRuntime and optional compatibility getSupabase()

comisiones.js
└─ imports Supabase boundary from supabase-runtime.js
```

Expected result:

```txt
app.js -> comisiones.js -> supabase-runtime.js
```

No cycle.

### Target State

```txt
Platform / Infrastructure
└─ Supabase Runtime
   ├─ owns client access
   ├─ owns auth/session access
   ├─ owns realtime access
   └─ owns storage/table access wrappers

App Shell
└─ initializes Platform services only

Domain Routes
└─ consume Platform services, never app.js
```

Long-term cleanup:

- Retire `window.supabaseClient` direct use from `offline-sync.js`.
- Retire `window.supabaseClient` direct use from `realtime-engine.js`.
- Remove `getSupabase` export from `app.js` after all consumers are migrated.

## 5. Movement Readiness Effect

Estimated effect if the boundary is repaired:

| Metric | Current | Estimated After Boundary Repair | Reason |
| --- | ---: | ---: | --- |
| Runtime Health | 73 | 78 | Removes only remaining circular import and improves Platform ownership. |
| Boundary Health | 60 | 75 | Moves service access out of app shell. |
| Dependency Health | 68 | 70 | Cycle removed; missing route/domain targets remain. |
| Migration Readiness | 52 | 61 | App shell separation improves, but six route/domain warnings still block movement. |
| Runtime Governance Maturity | 82 | 84 | Boundary ownership becomes explicit and enforceable. |

Migration readiness remains below runtime movement threshold because missing targets/exports are still unresolved.

## 6. Repair Authorization Test

Future repair classification:

```txt
A. Compatibility Repair
```

Reason:

The future change would preserve behavior while moving a service accessor from an incorrect app-shell export to a Platform-owned boundary. It is not a runtime migration because no file movement is required. It is not a constitutional change because Platform already owns runtime/infrastructure. It is not a broad architectural refactor if limited to the `getSupabase` boundary and validation.

## 7. Recommended Repair Strategy

Future RUNTIME-008 should be planning-only or controlled execution depending on authorization.

Minimal safe repair shape:

1. Use `supabase-runtime.js` as the Platform boundary.
2. Initialize `SupabaseRuntime` from `app.js` after client creation.
3. Export a compatibility accessor from `supabase-runtime.js`.
4. Rewrite only `comisiones.js` to consume the Platform boundary.
5. Keep `window.supabaseClient` temporarily for `offline-sync.js` and `realtime-engine.js`.
6. Validate module graph.
7. Defer global-client cleanup to a later phase.

Expected immediate effect:

- Remove `app.js -> comisiones.js -> app.js` cycle.
- Keep current runtime behavior.
- Avoid broad refactor.

