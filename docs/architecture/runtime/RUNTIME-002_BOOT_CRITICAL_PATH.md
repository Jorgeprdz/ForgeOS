# RUNTIME-002 Boot Critical Path

Report ID: RUNTIME-002
Status: ARCHITECTURE DISCOVERY / NO EXECUTION

## Boot Sequence

Browser -> `index.html` -> external Supabase UMD -> `env.js` -> `app.js` ES module -> static imports -> DOMContentLoaded -> `AppManager.init()` -> AuthService -> DB -> Core -> user session -> route render -> background sync.

## Boot Path Table

| Step | Hard / Soft | Dependency | What Breaks |
| --- | --- | --- | --- |
| 1. Browser loads root document | HARD | index.html | No app shell exists. |
| 2. Load stylesheet | HARD_FOR_UI | styles.css | Shell renders without expected variables/classes. |
| 3. Load manifest | PWA_HARD | manifest.json | PWA metadata/install surface breaks. |
| 4. Load Supabase UMD | HARD | window.supabase | AuthService.init throws Supabase SDK missing. |
| 5. Load env.js | HARD_FOR_AUTH | window.__ENV__ | AuthService.init throws ENV VARIABLES MISSING unless injected elsewhere. |
| 6. Load app.js module | HARD | app.js and all static imports | Module graph failure blocks bootstrap. |
| 7. Static route imports instantiate | HARD_CURRENTLY | dashboard/prospeccion/referidos/actividad/cartera/comisiones | Domain route defects can break boot because imports are eager. |
| 8. DOMContentLoaded | HARD | document event and DOM ids | AppManager cannot hydrate shell before DOM exists. |
| 9. AuthService.init | HARD | Supabase URL/key and SDK | No auth, no app. |
| 10. DB.init | HARD | db.js -> storage-engine.js | Storage unavailable; bootstrap catch shows fatal error. |
| 11. Core.init | HARD_CURRENTLY | core-app-engine.js platform services | Network/offline/performance/session/responsive/a11y platform init. |
| 12. AuthService.getUser | HARD | Supabase auth session | Determines app vs login screen. |
| 13. Router.navigate | HARD_AFTER_AUTH | default dashboard or hash route | Authenticated UI cannot render route. |
| 14. SyncEngine.start | SOFT | sync-orchestrator.js | Background sync can fail without blocking UI. |
| 15. Service worker registration | SOFT_PWA | service-worker.js | PWA/offline caching degrades, app may still load online. |

## Hard Dependencies

- `index.html`
- `styles.css` for expected UI styling
- Supabase UMD global
- `env.js` or equivalent injected `window.__ENV__`
- `app.js`
- 18 app.js static imports
- DOM ids expected by AppManager/router
- Supabase auth client
- DB storage init

## Soft Dependencies

- `SyncEngine.start()` after authenticated boot
- service worker registration for offline behavior
- PWA icon rendering

## Legacy Dependencies

- CRM Addlife title/header/manifest identity.
- `window.supabaseClient` global compatibility shim.
- `getSupabase` export from `app.js` used by `comisiones.js`.
- `callGemini` imports from `app.js` in route modules, with no observable matching export.

## Unknown Dependencies

- Whether hosting always injects `env.js`.
- Whether current browser boot is blocked by missing `overlay-manager.js`.
- Whether `callGemini` was removed, renamed or expected from another historical app shell.

## Boot Readiness Verdict

Current boot path is observable but fragile. It should not be moved or refactored until RUNTIME-003 validates the module graph in an executable environment and resolves missing dependency/export evidence.

Confidence Score: 0.86
