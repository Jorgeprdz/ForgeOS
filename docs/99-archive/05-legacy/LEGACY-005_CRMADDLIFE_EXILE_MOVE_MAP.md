# LEGACY-005 CRMAddlife Legacy Exile Move Map

Status: PLANNING COMPLETE / AWAITING EXECUTION APPROVAL

## Scope

This audit identifies CRMAddlife legacy files that can be exiled to `legacy/` without affecting the current runtime.

No files were moved.
No imports were rewritten.
No runtime files were modified.

## Classification Model

| Classification | Meaning |
|---|---|
| `EXILE_NOW` | Can move to `legacy/` with no import rewrites expected. |
| `EXILE_WITH_IMPORT_REWRITE` | Can move only if direct imports or consumers are rewritten. |
| `KEEP_TEMPORARILY` | Legacy-adjacent but still useful, ambiguous, route-adjacent, or better handled by a domain migration. |
| `DO_NOT_MOVE_BOOT_PATH` | Root entry, boot path, active route, or shell-owned compatibility surface. |

## Executive Summary

| Classification | Count |
|---|---:|
| `EXILE_NOW` | 4 |
| `EXILE_WITH_IMPORT_REWRITE` | 3 |
| `KEEP_TEMPORARILY` | 12 |
| `DO_NOT_MOVE_BOOT_PATH` | 10 |

Already exiled and not counted in the execution batch:

- `legacy/semantic-navigation-engine.js`

## Recommended Execution Batch

Recommended LEGACY-006 execution batch:

| Current Path | Destination Path | Classification | Reason |
|---|---|---|---|
| `comisiones.js.bk` | `legacy/comisiones.js.bk` | `EXILE_NOW` | Backup file; not an active runtime module. |
| `dashboard-priority-engine.js` | `legacy/dashboard-priority-engine.js` | `EXILE_NOW` | Legacy dashboard support; no detected imports or consumers. |
| `live-dashboard-engine.js` | `legacy/live-dashboard-engine.js` | `EXILE_NOW` | Legacy dashboard support; no detected imports or consumers. |
| `operational-dashboard-engine.js` | `legacy/operational-dashboard-engine.js` | `EXILE_NOW` | Legacy dashboard support; no detected imports or consumers. |

Expected root reduction if approved: 4 files.

## Full Move Map

| File | Current Status | Local Imports | Consumers | Classification | Execution Eligible | Notes |
|---|---|---:|---:|---|---|---|
| `app.js` | Root shell | 20 | 6 | `DO_NOT_MOVE_BOOT_PATH` | NO | Transitional shell and current boot path owner. |
| `index.html` | Root entry | 0 | 3 | `DO_NOT_MOVE_BOOT_PATH` | NO | Browser entry point; root-entry exception. |
| `dashboard.js` | Root route module | 6 | 2 | `DO_NOT_MOVE_BOOT_PATH` | NO | Active lazy-loaded dashboard route. |
| `actividad.js` | Root route module | 5 | 2 | `DO_NOT_MOVE_BOOT_PATH` | NO | Active route imported by `app.js`. |
| `prospeccion.js` | Root route module | 3 | 2 | `DO_NOT_MOVE_BOOT_PATH` | NO | Active route imported by `app.js`. |
| `referidos.js` | Root route module | 3 | 2 | `DO_NOT_MOVE_BOOT_PATH` | NO | Active route imported by `app.js`; now uses Navigation runtime. |
| `cartera.js` | Root route module | 8 | 5 | `DO_NOT_MOVE_BOOT_PATH` | NO | Active route with additional cartera coupling. |
| `comisiones.js` | Root route module | 5 | 2 | `DO_NOT_MOVE_BOOT_PATH` | NO | Active route with compensation coupling. |
| `app-shell-manager.js` | Shell support | 0 | 2 | `DO_NOT_MOVE_BOOT_PATH` | NO | Imported by `app.js`; not exile material. |
| `core-app-engine.js` | Shell/platform support | 10 | 2 | `DO_NOT_MOVE_BOOT_PATH` | NO | Imported by `app.js`; belongs in future platform migration, not legacy exile. |
| `comisiones.js.bk` | Backup | 0 | 0 | `EXILE_NOW` | YES | Backup file; move to legacy/archive zone. |
| `route-transition-manager.js` | Old navigation support | 1 | 0 | `EXILE_WITH_IMPORT_REWRITE` | CONDITIONAL | No consumers, but imports `./memory-manager.js`; moving to `legacy/` would require `../memory-manager.js` if kept executable. |
| `dashboard-priority-engine.js` | Legacy dashboard support | 0 | 0 | `EXILE_NOW` | YES | No detected consumers. |
| `live-dashboard-engine.js` | Legacy dashboard support | 0 | 0 | `EXILE_NOW` | YES | No detected consumers. |
| `operational-dashboard-engine.js` | Legacy dashboard support | 0 | 0 | `EXILE_NOW` | YES | No detected consumers. |
| `dashboard-executive.js` | Legacy dashboard support | 1 | 0 | `EXILE_WITH_IMPORT_REWRITE` | CONDITIONAL | No consumers, but imports `./smnyl-operating-system-engine.js`; move only with import rewrite or treat as archive-only. |
| `concursos.js` | Unregistered route-like surface | 1 | 0 | `EXILE_WITH_IMPORT_REWRITE` | CONDITIONAL | No consumers, but imports `./smnyl-concursos-engine.js`; move only with import rewrite or defer to rule-pack/legacy decision. |
| `semantic-navigation-engine.js` | Already under `legacy/` | 0 | 0 | `EXILE_NOW` | DONE | Already exiled by prior migration. No additional action. |
| `cartera-service.js` | Cartera support | 5 | 1 | `KEEP_TEMPORARILY` | NO | Route-adjacent service graph; move only in dedicated cartera batch. |
| `cartera-events.js` | Cartera support | 0 | 1 | `KEEP_TEMPORARILY` | NO | Consumed by `cartera-service.js`. |
| `cartera-import-engine.js` | Cartera support | 1 | 0 | `KEEP_TEMPORARILY` | NO | Imports `cartera-service.js`; defer with cartera service graph. |
| `cartera-normalizer.js` | Cartera support | 1 | 1 | `KEEP_TEMPORARILY` | NO | Consumed by `cartera-service.js`; imports financial utility. |
| `cartera-repository.js` | Cartera support | 2 | 0 | `KEEP_TEMPORARILY` | NO | Better suited for policy-operations/client-records or repository migration. |
| `cartera-state.js` | Cartera support | 0 | 1 | `KEEP_TEMPORARILY` | NO | Consumed by `cartera-service.js`. |
| `cartera-utils.js` | Cartera support | 0 | 1 | `KEEP_TEMPORARILY` | NO | Approved in Policy Operations planning context, not legacy exile. |
| `cartera-validator.js` | Cartera support | 0 | 1 | `KEEP_TEMPORARILY` | NO | Consumed by `cartera-service.js`. |
| `cartera-view.js` | Cartera support | 1 | 0 | `KEEP_TEMPORARILY` | NO | Has existing missing relative target shape; do not exile as a legacy cleanup. |
| `comisiones-utils.js` | Compensation support | 0 | 0 | `KEEP_TEMPORARILY` | NO | Compensation domain candidate, not CRMAddlife exile. |
| `comisiones-rules-gmm.js` | Compensation/rules support | 0 | 0 | `KEEP_TEMPORARILY` | NO | Rule-pack or compensation candidate; keep out of legacy exile. |
| `smnyl-executive-dashboard-engine.js` | SMNYL dashboard support | 3 | 1 | `KEEP_TEMPORARILY` | NO | Consumed by SMNYL operating system engine; not safe legacy exile. |
| `team-dashboard-engine.js` | Manager dashboard support | 0 | 0 | `KEEP_TEMPORARILY` | NO | Likely Manager OS candidate, not CRMAddlife exile. |

## Recommended Execution Strategy

LEGACY-006 should execute a smaller no-rewrite exile batch first:

- `comisiones.js.bk`
- `dashboard-priority-engine.js`
- `live-dashboard-engine.js`
- `operational-dashboard-engine.js`

Recommended first execution size: 4 files.

Do not include files that import root modules unless LEGACY-006 explicitly allows import rewrites.

## Deferred Conditional Exile

The following can be exiled later with import rewrites or as archive-only files:

- `route-transition-manager.js`
- `dashboard-executive.js`
- `concursos.js`

## No-Touch Boot Path

Do not move:

- `app.js`
- `index.html`
- `dashboard.js`
- `actividad.js`
- `prospeccion.js`
- `referidos.js`
- `cartera.js`
- `comisiones.js`
- `app-shell-manager.js`
- `core-app-engine.js`

These files either own the current compatibility shell or remain on the active route/boot path.

## Validation Plan For Future Execution

Future execution should run:

```sh
node scripts/runtime-module-graph-audit.js
node scripts/repo-doc-migration-harness.js check --output-dir docs/06-repository-governance/reports
git diff --check
git status --short
```

If moving any `EXILE_WITH_IMPORT_REWRITE` file, also run:

```sh
node --check legacy/route-transition-manager.js
node --check legacy/dashboard-executive.js
node --check legacy/concursos.js
```
