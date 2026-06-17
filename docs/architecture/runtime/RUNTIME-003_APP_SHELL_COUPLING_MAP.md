# RUNTIME-003 App Shell Coupling Map

Report ID: RUNTIME-003
Status: APP SHELL COUPLING MAP / NO FIXES

## Direct app.js Imports

| Path | Imported Names | Classification | Eventually Dynamic? |
| --- | --- | --- | --- |
| supabase-runtime.js | getSupabase | Platform boot | NO |
| prospeccion.js | renderProspeccion, bindProspeccionEvents | Advisor OS | YES |
| referidos.js | renderReferidos, bindReferidosEvents | Advisor OS | YES |
| actividad.js | renderActividad, bindActividadEvents | Advisor OS | YES |
| cartera.js | renderCartera, bindCarteraEvents | Legacy route | YES |
| comisiones.js | renderComisiones, bindComisionesEvents | Manager OS | YES |
| event-system.js | EventBus | Platform boot | NO |
| platform/app/bootstrap.js | bootstrapApp | Unknown | NO |
| platform/app/forge-app-shell.js | ForgeAppShell | Platform boot | NO |
| platform/auth/auth-service.js | AuthService | Platform boot | NO |
| platform/routing/enterprise-router.js | EnterpriseRouter | Unknown | NO |
| platform/routing/route-registry.js | createRouteRegistry | Unknown | NO |
| logger.js | Logger | Platform boot | NO |
| platform/app/runtime-listeners.js | bindPlatformRuntimeListeners | Platform boot | NO |
| legacy/crmaddlife/chat-shell.js | bindCrmAddlifeChatShell | Platform boot | NO |
| legacy/crmaddlife/ui-listeners.js | bindCrmAddlifeThemeToggle | Platform boot | NO |
| legacy/crmaddlife/ui-shell.js | showCrmAddlifeApp, renderCrmAddlifeLogin, renderCrmAddlifeFatalError | Platform boot | NO |

## Boundary Finding

`app.js` statically imports route/domain modules, so route module contract failures can become boot failures. Route/domain modules should become lazy route dependencies after boot blockers are repaired and after a separate shell refactor is approved.
