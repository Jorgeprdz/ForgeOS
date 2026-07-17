# Forge Advisor OS Pipeline Live Mount and Navigation Reconciliation 067G16

## Status

IMPLEMENTED / TESTED / COMMITTED ROUTE PENDING COMMIT AT DOCUMENT CREATION

## Constitutional authority

- Board approval: `067G16_ADVISOR_OS_PIPELINE_LIVE_MOUNT_AND_NAVIGATION_RECONCILIATION`
- Miranda approval: approved
- Parent program: `067G4_TO_067G15_ADVISOR_OS_PIPELINE_FAST_TRACK`
- Scope: bounded Advisor OS Pipeline runtime integration and canonical navigation reconciliation

## Incident and reproduced failure

The real authenticated Advisor OS runtime rendered the 067G15 `Abrir Pipeline` action on Dashboard, but activation left the application on `#dashboard`. The live shell had no Pipeline nav entry, the route registry had no Pipeline descriptor, and no Pipeline module was imported or mounted.

The canonical router also scheduled route markup for a future animation frame while calling the route binder immediately. Dashboard binding therefore ran before `#dashboard-container` existed and returned without installing its delegated action handler.

Failure classes:

- `NAV_INTENT_ONLY_NO_ROUTE`
- `ROUTE_ID_MISMATCH`
- `ROUTE_NOT_REGISTERED`
- `MODULE_NOT_IMPORTED`
- `MODULE_NOT_MOUNTED`
- `NAV_PILL_HANDLER_NOT_BOUND`

The visible control was not blocked by an overlay or pointer-events rule.

## Decision

The single canonical route is:

```text
routeId=advisor-sales-pipeline
domain=ADVISOR_OS
moduleId=advisor-os.sales-pipeline.live-route.067g16
```

Authority remains:

- navigation adapter: `platform/navigation-runtime.js`
- application shell: `platform/app/forge-app-shell.js`
- route registry: `platform/routing/route-registry.js`
- route lifecycle: `platform/routing/enterprise-router.js`

The live route mounts the existing 067G10 Pipeline renderer and consumes the existing 067G12 stage read model. It does not introduce a second Pipeline implementation. Existing CommonJS modules expose the same API to the browser through guarded globals while preserving their Node test contracts.

## Runtime behavior

- Mobile and desktop navigation use `advisor-sales-pipeline`.
- Nav activation delegates to `Navigation.navigate`.
- Route rendering completes before event binding begins.
- Initial navigation replaces history; user navigation pushes history; popstate reconciles through the same router.
- Dashboard `OPEN_PIPELINE`, `OPEN_PROSPECT`, and `OPEN_OPPORTUNITY` intents use the same route.
- Unresolved prospect/opportunity context opens Pipeline and displays an honest persistence limitation.
- The mount uses lifecycle cleanup and does not add polling, global scanning, or duplicate listeners.

## Truth boundary

Production prospect persistence and a production stage writer remain unavailable and unauthorized. The live screen therefore renders the existing honest empty or partial state. It does not fabricate prospects, opportunities, stage changes, or recommendations.

## Acceptance

- Real runtime mobile touch: 360×800 and 390×844 pass.
- Real runtime keyboard: Enter and Space pass.
- Real runtime desktop mouse: 1366×768 and 1440×900 pass.
- Active state, direct deep link, back, and forward pass.
- Dashboard Pipeline, prospect, and opportunity navigation pass with honest unresolved-context behavior.
- No page-level horizontal overflow was observed.
- Repeated same-route activation does not remount.
- Navigation, quote, PDF, and route-performance regression tests pass.

## Explicit non-scope

- no Pipeline redesign
- no persistence or stage writer
- no Project 200, identity, or NBA reasoning change
- no Manager OS change
- no quote or PDF flow change
- no parallel router, shell, navigation authority, hash hack, iframe, localStorage route state, polling, or global z-index escalation
