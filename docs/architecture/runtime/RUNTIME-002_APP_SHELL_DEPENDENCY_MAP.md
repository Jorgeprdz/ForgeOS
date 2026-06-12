# RUNTIME-002 App Shell Dependency Map

Report ID: RUNTIME-002
Status: ARCHITECTURE DISCOVERY / NO EXECUTION

## Executive Summary

RUNTIME-002 maps the Forge app shell and PWA dependency surface. No files were moved, renamed, rewritten or modified.

The app shell currently boots through `index.html` into `app.js`. `app.js` statically imports 18 root modules, including six route modules. This means domain routes are part of the boot-time module graph, even before navigation.

Most shell assets remain root-required or root-allowed until a shell refactor exists. Two critical dependency risks were found: a likely missing `overlay-manager.js` dependency through `utils.js`, and route modules importing `callGemini` from `app.js` without an observable export in `app.js`.

## Task 1: App Shell Inventory

| Asset | Purpose | Incoming References | Outgoing References | Classification | Owner | Movement Readiness |
| --- | --- | --- | --- | --- | --- | --- |
| index.html | Browser app entry, DOM shell, CSS/manifest/script loader and SW registration. | External browser/deploy root; manifest start_url; SW cache config. | styles.css, manifest.json, Supabase UMD, env.js, app.js, service-worker.js | BOOT_REQUIRED | Platform | BOOT_REQUIRED |
| app.js | ES module app bootstrap, auth, router, lifecycle, route imports and global listeners. | index.html module script; imported by prospeccion.js and comisiones.js for shell exports. | 18 static imports; window.__ENV__; window.supabase; window.supabaseClient; DOM/global listeners. | BOOT_REQUIRED | Platform | BOOT_REQUIRED |
| manifest.json | PWA manifest and icon declarations. | index.html manifest link; browser PWA install surface. | icon-192.png, icon-512.png, start_url /index.html. | PWA_REQUIRED | Platform | ROOT_REQUIRED |
| service-worker.js | Offline-first fetch/install/activate handler. | index.html navigator.serviceWorker.register. | /sw-cache-config.js, Cache API, CACHE_CONFIG.STATIC_ASSETS. | PWA_REQUIRED | Platform | ROOT_REQUIRED |
| sw-cache-config.js | Service worker cache names and static asset list. | service-worker.js importScripts(/sw-cache-config.js). | /, /index.html, /styles.css, /app.js. | PWA_REQUIRED | Platform | ROOT_REQUIRED |
| styles.css | Global app style surface. | index.html stylesheet; design-system-preview.html also references it. | CSS variables/classes used by app shell and route HTML strings. | BOOT_REQUIRED | Platform / Legacy UI | ROOT_ALLOWED |
| icon-192.png | PWA icon asset. | manifest.json icon entries. | None. | PWA_REQUIRED | Platform | ROOT_ALLOWED |
| icon-512.png | PWA icon asset. | manifest.json icon entries. | None. | PWA_REQUIRED | Platform | ROOT_ALLOWED |

## Task 2: index.html Dependency Map

| Dependency | Type | Classification | Purpose |
| --- | --- | --- | --- |
| styles.css | stylesheet | BOOT_REQUIRED | Global styles and CSS variables. |
| manifest.json | manifest | PWA_REQUIRED | PWA metadata and icons. |
| https://unpkg.com/@supabase/supabase-js@2/dist/umd/supabase.js | script/global | BOOT_REQUIRED | Creates window.supabase for AuthService. External network dependency. |
| env.js | script/env | BOOT_REQUIRED / ENV_REQUIRED | Expected to populate window.__ENV__; absent in repo but may be injected by hosting. |
| app.js | module script | BOOT_REQUIRED | Main ES module bootstrap. |
| ./service-worker.js | service worker registration | PWA_REQUIRED | Registered on window load with scope ./ . |
| DOM ids: app-content, main-sidebar, ai-chat-* | global assumptions | BOOT_REQUIRED | Queried by app.js/AppManager for shell hydration and navigation. |

## Task 3: app.js Dependency Map

Static import count: 18

Dynamic import count: 0


| Path | Owner | Boot Required | Purpose | Legacy Compatibility | Domain Logic In Shell |
| --- | --- | --- | --- | --- | --- |
| db.js | Platform | YES | Storage/IndexedDB bootstrap through DB.init(). | NO | NO |
| utils.js | Platform | YES | Toast/UI utilities imported by app shell. Also imports missing overlay-manager.js. | YES | NO |
| dashboard.js | Advisor OS / Shell Route | YES | Default authenticated route and dashboard renderer. | NO | YES |
| prospeccion.js | Advisor OS | YES | Static route import; contains legacy import from app.js for callGemini. | YES | YES |
| referidos.js | Advisor OS | YES | Static route import for referrals route. | NO | YES |
| actividad.js | Advisor OS | YES | Static route import for activity route. | YES | YES |
| cartera.js | Policy Operations / Advisor OS | YES | Static route import for cartera route. | YES | YES |
| comisiones.js | Compensation / Manager OS | YES | Static route import; imports getSupabase and missing callGemini from app.js. | YES | YES |
| core-app-engine.js | Platform | YES | Core platform init: network, offline sync, performance, auth guard, responsive, accessibility. | NO | NO |
| state-manager.js | Platform | YES | Global app state including auth, route, online, data stores. | NO | NO |
| event-system.js | Platform | YES | Global event bus for route/network/theme. | NO | NO |
| module-lifecycle.js | Platform | YES | Mount/unmount lifecycle around route modules. | NO | NO |
| ui-render-engine.js | Platform | YES | Scheduled rendering used by router and modules. | NO | NO |
| sync-orchestrator.js | Platform | SOFT_AFTER_AUTH | Background sync after authenticated route loads. | NO | NO |
| analytics-engine.js | Platform | YES | Init and tracking during auth, route and error flows. | NO | NO |
| error-boundary.js | Platform | YES | Global capture and bootstrap error handling. | NO | NO |
| logger.js | Platform | YES | Structured logging across shell. | NO | NO |
| app-shell-manager.js | Platform | YES | Global loader and shell UI controller. | NO | NO |

## App.js Globals And Compatibility Surface

| Surface | Observed Evidence | Risk |
| --- | --- | --- |
| window.__ENV__ | ENV reads SUPABASE_URL and SUPABASE_KEY from window.__ENV__. | Boot requires environment injection. |
| window.supabase | AuthService requires Supabase UMD global from index.html. | External script/load order dependency. |
| window.supabaseClient | AuthService exposes Supabase client globally for legacy modules. | Compatibility leakage from Platform into domain modules. |
| document / DOM ids | AppManager and router query app-content, nav, chat and header ids. | DOM shell and app.js are tightly coupled. |
| localStorage crm-theme | Theme preference persists in browser storage. | Platform owns UX runtime setting. |
| window online/offline/error events | Global network/error listeners update AppState and ErrorHandler. | Platform lifecycle ownership. |

## Task 4: Service Worker / PWA Map

| Asset | Observed Dependency | PWA Role | Legacy Indicator |
| --- | --- | --- | --- |
| index.html | Manifest link to manifest.json; registers ./service-worker.js. | PWA shell origin. | CRM Addlife title/header text. |
| manifest.json | start_url /index.html; scope /; icons icon-192.png and icon-512.png. | PWA install metadata. | name CRM Addlife, short_name Addlife. |
| service-worker.js | importScripts(/sw-cache-config.js); install/activate/fetch handlers. | Offline runtime. | No branding in file, but tied to current shell. |
| sw-cache-config.js | STATIC_ASSETS: /, /index.html, /styles.css, /app.js. | Static shell cache configuration. | Version v6-enterprise-1. |
| icon-192.png / icon-512.png | Referenced by manifest. | PWA icons. | Potential legacy branding unknown without image inspection. |

## Task 7: High-Risk App Shell Couplings

| Severity | Coupling | Impact | Recommended Discovery |
| --- | --- | --- | --- |
| CRITICAL | Missing module dependency: utils.js imports ./overlay-manager.js, but observed root file is ovelay-manager.js. | Can break app.js module graph during bootstrap because app.js imports utils.js. | Confirm file spelling and export contract before any movement. |
| CRITICAL | Missing export coupling: prospeccion.js and comisiones.js import callGemini from ./app.js, but app.js only exposes getSupabase in observable source. | ES module instantiation can fail when imported export is absent; because app.js statically imports these routes, boot can fail before route use. | RUNTIME-003 should validate app shell module graph with browser/Node ESM checks. |
| HIGH | app.js statically imports all route modules. | Domain route code becomes boot path even when route is not visited. | Consider lazy route imports after shell refactor. |
| HIGH | window.supabaseClient compatibility global. | Platform auth state leaks into legacy modules and realtime/offline engines. | Replace with explicit service boundary after compatibility audit. |
| HIGH | CRM Addlife branding in index.html and manifest.json. | PWA identity still reflects legacy shell. | Treat as legacy branding remediation, not root movement. |
| MEDIUM | service-worker.js caches only root shell assets. | Offline cache protects shell, not route/domain module graph. | Map runtime caching strategy before moving shell assets. |
| MEDIUM | env.js is referenced but absent in repository. | Local boot depends on injected or generated environment file. | Document env injection contract under Platform. |
| MEDIUM | styles.css root path is shared by index.html and design preview. | Moving style sheet breaks shell/previews unless paths are rewritten. | Keep root until shell asset refactor. |

## Task 8: Movement Readiness

| Asset / Group | Readiness | Reason |
| --- | --- | --- |
| index.html | ROOT_REQUIRED | Browser entry, manifest link, module script and SW registration. |
| app.js | ROOT_REQUIRED | Directly loaded by index.html and central bootstrap. |
| manifest.json | ROOT_REQUIRED | Linked from index.html; PWA install metadata. |
| service-worker.js | ROOT_REQUIRED | Registered from index.html at root scope. |
| sw-cache-config.js | ROOT_REQUIRED | Imported by service-worker.js with absolute /sw-cache-config.js. |
| styles.css | ROOT_ALLOWED | Loaded by root HTML; movable only with shell path rewrite. |
| icon-192.png / icon-512.png | ROOT_ALLOWED | Manifest references root-relative icons; movable only with manifest rewrite. |
| Route modules imported by app.js | MOVABLE_AFTER_SHELL_REFACTOR | Currently static boot dependencies; can move after lazy routing/import map. |
| Platform services imported by Core | MOVABLE_AFTER_IMPORT_REWRITE | Need dependency graph and test gate. |
| CRM Addlife branding assets | LEGACY_QUARANTINE_CANDIDATE after replacement | Legacy identity, but still active shell. |

## Final Verdict

App Shell Dependency Summary: Forge boots through `index.html`, loads `app.js`, initializes Supabase/Auth/DB/Core, then navigates to a route after auth. The shell is root-required today.

PWA Dependency Summary: PWA surface is small but root-sensitive: `manifest.json`, `service-worker.js`, `sw-cache-config.js`, `styles.css`, `app.js`, icons and `/index.html`.

Movement Readiness Verdict: `NO MOVEMENT`. Shell mapping exposed critical dependency risks that must be validated before refactor.

Confidence Score: 0.86
