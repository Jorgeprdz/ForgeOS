# RUNTIME-002 Platform Boundary Findings

Report ID: RUNTIME-002
Status: ARCHITECTURE DISCOVERY / NO EXECUTION

## Platform Boundary Summary

Platform owns shell bootstrapping, lifecycle, routing, storage/sync, PWA/offline, logging, error handling, analytics and command/runtime infrastructure. Platform does not own advisor route logic, product logic, compensation logic or manager governance.

## Platform-Owned Shell Assets

| Asset | Platform Responsibility | Boundary Status |
| --- | --- | --- |
| index.html | Browser/PWA shell entry. | Platform owns structure, not embedded domain copy/branding. |
| app.js | Bootstrap, auth, router, lifecycle and shell listeners. | Platform owns shell; route/domain imports are leakage. |
| core-app-engine.js | Initializes platform services. | Platform-owned. |
| db.js / storage-engine.js | Local storage facade and IndexedDB. | Platform-owned. |
| event-system.js / state-manager.js / module-lifecycle.js | Cross-app lifecycle and state infrastructure. | Platform-owned. |
| service-worker.js / sw-cache-config.js / manifest.json | PWA/offline shell. | Platform-owned with legacy branding caveat. |

## Platform Leakage Findings

| Severity | Finding | Why It Is Leakage | Recommended Next Step |
| --- | --- | --- | --- |
| CRITICAL | `app.js` statically imports route/domain modules. | Advisor, compensation and policy modules become boot graph responsibilities of Platform. | RUNTIME-003 should validate graph and propose lazy route boundary. |
| CRITICAL | `prospeccion.js` and `comisiones.js` import missing `callGemini` from `app.js`. | Domain modules depend on app shell for AI/service capability; export not observable. | Resolve export contract or move AI capability behind shared service. |
| HIGH | `comisiones.js` imports `getSupabase` from `app.js`. | Compensation logic consumes shell auth global instead of platform service boundary. | Create explicit auth/data access boundary. |
| HIGH | `window.supabaseClient` global compatibility shim. | Global mutable compatibility state leaks Platform internals to legacy modules. | Inventory all consumers and replace with explicit injected service. |
| HIGH | CRM Addlife branding in `index.html` and `manifest.json`. | Platform shell still carries legacy product identity. | Separate identity migration from file movement. |
| MEDIUM | Service worker only caches root shell assets. | Offline platform behavior may not cover actual route module graph. | Map cache strategy after route graph validation. |
| MEDIUM | `env.js` absent but required by auth path. | Platform boot depends on external/generated file not tracked in repo. | Document environment injection contract and local dev fallback. |

## What Platform Does Not Own

- Product rules and product projections.
- Advisor decisions and sales route behavior.
- Compensation rate/rule truth.
- Manager governance and candidate logic.
- Domain evidence and archives.

## Boundary Verdict

Platform currently owns too much at boot because `app.js` eagerly imports route/domain modules. The correct Platform boundary is shell orchestration plus service contracts, not domain implementation.

Recommended RUNTIME-003 scope: executable app shell module graph validation and route-boundary leakage audit.

Confidence Score: 0.86
