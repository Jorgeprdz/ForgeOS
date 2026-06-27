# LEGACY-001 Future Forge Shell

Report ID: LEGACY-001
Status: ARCHITECTURE DISCOVERY / NO RUNTIME MODIFICATIONS
Date: 2026-06-11

## Purpose

Conceptually define the future Forge runtime shell and select the migration strategy from CRMAddlife legacy shell to Forge-native runtime.

No implementation is authorized by this document.

## Selected Migration Strategy

Chosen option:

**Option B: Freeze legacy shell and extract Forge around it**

Only one answer is selected.

## Why Option B

Option A, continue improving legacy shell:

- Rejected.
- It would keep adding architectural value to a CRMAddlife-centered shell that is not the target Forge architecture.
- CRMAddlife was only a basic CRM prototype and should not become the product or architecture center of Forge OS by inertia.

Option C, replace shell immediately:

- Rejected.
- It would create unnecessary boot/auth/layout/navigation risk while the platform shell is still being defined.

Option B, freeze legacy shell and extract Forge around it:

- Selected.
- It protects runtime stability while moving ownership toward Forge-native platform and domain boundaries.
- It matches RUNTIME-013: prove route loader boundary first, then extract.
- It preserves compatibility temporarily without treating CRMAddlife architecture as strategic.

## Future Forge Runtime Shell Concept

Target shape:

```text
root
  index.html or forge-entry.html
  app.js or forge-entry.js

platform/
  shell/
    forge-shell.js
    forge-router.js
    route-loader.js
    route-manifest.js
    navigation-service.js
  auth/
    auth-runtime.js
  data/
    db-runtime.js
    supabase-runtime.js
  lifecycle/
    module-lifecycle.js
    memory-manager.js
  state/
    state-manager.js
    event-system.js
  ui/
    render-engine.js
    app-shell-manager.js
    error-boundary.js
  observability/
    logger.js
    analytics-engine.js
  sync/
    sync-orchestrator.js
    offline-sync.js
    realtime-engine.js

advisor-os/
  routes/
    advisor-home.js
    prospecting.js
    referrals.js
    activity.js
  intelligence/

manager-os/
  routes/
  recruitment/
  precontract/
  team/
  coaching/

shared/
  contracts/
  entities/
  evidence/
  commercial-events/

legacy/
  crmaddlife/
    app.js
    index.html
    dashboard.js
```

This is conceptual, not a move map.

## Ownership Boundaries

### Root Entry Point

Owns:

- Starting the browser application.
- Loading the Forge platform shell.
- Minimal document and mount point.

Does not own:

- Domain routes.
- Business logic.
- Carrier rules.
- Dashboard behavior.

### Platform Bootstrap

Owns:

- Environment validation.
- Auth runtime initialization.
- DB/runtime initialization.
- Supabase runtime boundary.
- Error boundary.
- Observability.
- Sync startup.
- Route loader startup.

Does not own:

- Advisor decisions.
- Manager coaching.
- Product truth.
- Compensation interpretation.

### Route Loading

Owns:

- Route descriptor registry.
- Dynamic import boundaries.
- Export contract validation.
- Loading/error state.
- Route lifecycle cleanup.
- Route mount order.

Does not own:

- Route business decisions.
- Route UI internals beyond lifecycle contract.

### Auth

Owns:

- Session restoration.
- Login/logout flow.
- Auth state storage.
- Auth event propagation.

Does not own:

- User-facing domain decisions.
- Compensation or product recommendations.

### Shared Services

Own:

- State.
- Events.
- Logging.
- Analytics.
- Error capture.
- Rendering scheduler.
- Memory/lifecycle cleanup.
- DB and sync runtime.

Do not own:

- Domain interpretation.
- Carrier-specific rules.

### Advisor Runtime

Owns:

- Advisor home / first action surface.
- Prospecting.
- Referrals.
- Activity.
- Relationship Intelligence.
- NASH conversation intelligence.
- Advisor Experience.

Consumes:

- Platform route/runtime services.
- Shared contracts.
- Product/policy/compensation outputs.

Does not own:

- Platform boot.
- Product truth.
- Rule-pack interpretation.

### Manager Runtime

Owns:

- Manager/team surfaces.
- Recruitment lifecycle.
- Candidate intelligence.
- Precontract intelligence.
- Coaching and development.

Consumes:

- Platform route/runtime services.
- Shared contracts.
- Compensation outputs.
- Rule-pack outputs.

Does not own:

- Platform boot.
- Carrier-specific rule definitions.

## Replacement Path

Recommended sequence:

1. Freeze legacy shell investment.
2. Harden navigation contract after RUNTIME-013.
3. Extract route manifest/loader into platform-owned code.
4. Replace `window.navigateTo` consumers with shell-owned navigation service.
5. Introduce Forge-native shell beside the legacy shell.
6. Build Forge-native Advisor OS home as replacement for `dashboard.js`.
7. Move CRMAddlife shell files into `legacy/` only after replacement entry exists.
8. Keep root entry thin.

## Future Shell Rules

The Forge-native shell must:

- Start Forge without requiring CRMAddlife route modules.
- Load routes dynamically through descriptors.
- Own navigation as a platform service.
- Keep auth/bootstrap in platform.
- Keep route UI out of platform.
- Keep domain decisions inside domains.
- Keep rule-pack interpretation outside Forge Core.
- Work offline-first where platform services allow.

The Forge-native shell must not:

- Recreate CRMAddlife dashboard as the center of Forge.
- Hardcode carrier, compensation, contest, KPI, or product logic.
- Depend on `window.supabaseClient` as a permanent contract.
- Use `app.js` as the long-term architecture container.

## Recommended LEGACY-002 Scope

Title:

**Navigation Contract Hardening For Legacy Shell Extraction**

Scope:

- Audit `window.navigateTo` consumers.
- Design shell-owned navigation API.
- Decide temporary vs final navigation service boundary.
- Preserve current route names.
- Validate `referidos` to `prospeccion` handoff.
- Validate `comisiones` self-refresh behavior.
- Do not lazy-load `comisiones`.
- Do not move files.
- Do not replace `index.html`.

Reason:

The next blocker is not dashboard loading. It is legacy route navigation leakage. Hardening navigation allows Forge to extract routing out of the CRMAddlife shell without breaking current behavior.

## Final Verdict

Legacy shell classification:

- `app.js`: `TRANSITIONAL_SHELL`
- `index.html`: `PURE_LEGACY` with root-entry exception
- `dashboard.js`: `LEGACY_WITH_FORGE_DEPENDENCIES`

Forge-native classification:

- Current platform services imported by shell and dashboard are Forge-native or Forge-emergent.
- Current browser shell and dashboard UI are not Forge-native.

Recommended extraction strategy:

- Freeze legacy shell.
- Extract useful runtime contracts and Forge-native platform boundaries around it.
- Preserve compatibility temporarily.
- Avoid heavy investment in CRMAddlife architecture.
- Replace the shell only after route loading, navigation, auth, and platform bootstrap contracts are stable.

Confidence score:

- 0.88

Confidence is high because the audited files clearly expose CRMAddlife naming, DOM shell ownership, and transitional Forge platform dependencies. It is below 0.90 because this pass intentionally avoided broad repository scanning beyond the three requested files.
