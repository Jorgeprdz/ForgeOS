# RUNTIME-003 App Shell Coupling Map

Report ID: RUNTIME-003
Status: APP SHELL COUPLING MAP / NO FIXES

## Direct app.js Imports

| Path | Imported Names | Classification | Eventually Dynamic? |
| --- | --- | --- | --- |
| db.js | DB | Platform boot | NO |
| utils.js | showToast | Platform boot | NO |
| supabase-runtime.js | SupabaseRuntime, getSupabase | Platform boot | NO |
| prospeccion.js | renderProspeccion, bindProspeccionEvents | Advisor OS | YES |
| referidos.js | renderReferidos, bindReferidosEvents | Advisor OS | YES |
| actividad.js | renderActividad, bindActividadEvents | Advisor OS | YES |
| cartera.js | renderCartera, bindCarteraEvents | Legacy route | YES |
| comisiones.js | renderComisiones, bindComisionesEvents | Manager OS | YES |
| core-app-engine.js | Core | Platform boot | NO |
| state-manager.js | AppState | Platform boot | NO |
| event-system.js | EventBus | Platform boot | NO |
| module-lifecycle.js | Lifecycle | Platform boot | NO |
| platform/navigation-runtime.js | Navigation | Platform boot | NO |
| ui-render-engine.js | RenderEngine | Platform boot | NO |
| sync-orchestrator.js | SyncEngine | Platform boot | NO |
| analytics-engine.js | Analytics | Platform boot | NO |
| error-boundary.js | ErrorHandler | Platform boot | NO |
| logger.js | Logger | Platform boot | NO |
| app-shell-manager.js | AppShell | Platform boot | NO |

## Boundary Finding

`app.js` statically imports route/domain modules, so route module contract failures can become boot failures. Route/domain modules should become lazy route dependencies after boot blockers are repaired and after a separate shell refactor is approved.
