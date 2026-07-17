# Forge Alive Static Entrypoint Pipeline Mount Reconciliation Decision 067G16A

## Status

IMPLEMENTED / TESTED / PENDING COMMIT AT DOCUMENT CREATION

## Constitutional authority

- Board approval: `067G16A_FORGE_ALIVE_STATIC_ENTRYPOINT_PIPELINE_MOUNT_RECONCILIATION`
- Miranda approval: approved
- Parent module: `067G16_ADVISOR_OS_PIPELINE_LIVE_MOUNT_AND_NAVIGATION_RECONCILIATION`
- Scope: bounded Forge Alive static entrypoint, static view outlet, and existing Pipeline mount reconciliation

## Incident and entrypoint authority

The user-facing page displaying `FORGE ALIVE`, `Buenos días, Jorge`, `Mi día · Vista estática segura`, `Plan de hoy`, and `Seguimiento prioritario` is sourced by `docs/static-preview/forge-alive/index.html`. Its deployed GitHub Pages pattern is `/ForgeOS/docs/static-preview/forge-alive/`.

The repository-root `index.html` is the separate Forge Legacy CRM AddLife surface. It is not the Forge Alive Advisor OS authority and is not a Pipeline host. `advisor-os/sales-pipeline/ui-harness.html` remains test-only.

## Reproduced defect and root cause

Before this decision, the static page's Home navigation bridge updated its hidden controller, query state, and visual active class, but it had no primary view registry or content outlet. The page did not load the existing Pipeline renderer. A real 390×844 tap therefore changed the active pill to Pipeline while the Home content stayed visible and the Pipeline mount count remained zero.

Failure classes:

- `STATIC_NAV_ACTIVE_CLASS_ONLY`
- `STATIC_PIPELINE_VIEW_NOT_REGISTERED`
- `STATIC_OUTLET_NOT_REPLACED`
- `PIPELINE_SCRIPT_NOT_LOADED_BY_ENTRYPOINT`
- `PIPELINE_IMPORT_MISSING`

## Static runtime decision

The active surface keeps one navigation authority: `forge-alive-home-nav-bridge-r16c5k.js`, reconciled through `ForgeAliveStaticView067G16A`. The static view registry owns `inicio`, `pipeline`, and the existing honest placeholder destinations. The primary Pipeline outlet is identified by `data-forge-alive-primary-outlet-067g16a` and is placed in the existing Forge Alive shell.

Navigation active state is synchronized only after the requested view opens successfully. Home nodes are marked as a single logical Home view, hidden and made inert outside `inicio`, then restored when Inicio opens. Exactly one primary view is active; Pipeline is not appended beneath Home and no nested shell is created.

## Pipeline mount bridge

The bridge imports and reuses:

- `advisor-os/sales-pipeline/sales-stage-registry.js`
- `advisor-os/sales-pipeline/pipeline-stage-read-model.js`
- `advisor-os/sales-pipeline/pipeline-ui.js`
- `advisor-os/sales-pipeline/pipeline-ui.css`

It mounts the existing read-only Pipeline renderer once into the static outlet and preserves the governed empty, partial, and error truth boundary. Production persistence, stage writing, and fabricated records remain prohibited. Dashboard Pipeline, prospect, and opportunity actions enter the same static view authority; unresolved entity context opens Pipeline and reports the limitation honestly.

## View state, direct links, and cache

The existing static convention remains query state (`?nav=...`). In-page Pipeline navigation and direct loading of the static URL with `?nav=pipeline` resolve within the Forge Alive page and do not redirect to the Legacy CRM root. No new global router, hash router, localStorage authority, polling loop, or competing controller was introduced.

The static entrypoint does not register a service worker. The repository root worker is network-first and was not the reproduced cause. Versioned script and stylesheet URLs provide a fresh-asset path without disabling caching globally.

## Acceptance evidence

- Real static page touch/view switching passes at 360×800 and 390×844.
- The same static surface passes at 768×1024, 1366×768, and 1440×900.
- Home → Pipeline → Home repeated three times without listener growth or duplicate mounts.
- Pipeline activation hides Home from the active view and accessibility tree; Inicio restores it.
- Dashboard open-Pipeline and unresolved entity-context behavior pass.
- Navigation, quote, PDF, and route-performance regression tests pass.
- Legacy CRM root, quote implementation, PDF implementation, and persistence surfaces are unchanged.

## Remaining boundary

Pipeline persistence and data-entry writers remain unavailable. `067G17_PROSPECT_OPPORTUNITY_PERSISTENCE_AND_DATA_ENTRY` is the next possible module only after user verification and separate Board approval; it was not executed by 067G16A.
