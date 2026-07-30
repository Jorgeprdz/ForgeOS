# Pages interaction regression — root cause

## Authority

- Parent PAQ: `FORGE_UI_FINAL_VISUAL_CLOSURE_PAQ_001`
- Corrective scope: public Material 3 workspace lifecycle only.
- Protected boundaries: NASH/NBA inference, exact approval, manual WhatsApp,
  authentication, Supabase and the canonical floating shell were not changed.

## Root cause

`pipeline-referral-modal.css` was loaded lazily only by the referral form.
The NASH, Combat and NBA entry points appended `.referral-sheet-layer`
directly without awaiting that stylesheet. A fresh Pages session could
therefore render dialog markup in normal document flow with native controls.

Each entry point also owned its own incomplete close callback. There was no
single active-layer authority, opening guard, body-scroll restoration,
Escape listener or deterministic cross-workspace replacement. Rapid clicks
could append duplicate workspaces.

## Repair

`productiveWorkspaceController` now owns style readiness, one active layer,
opening tokens, body scroll, Escape, scrim/X close, cleanup and focus
restoration. Stylesheet failures reset the promise and expose one bounded
retry-safe error surface. NASH, Combat, NBA and productive context consume
the same controller.

The stylesheet now explicitly styles body actions, textareas, scrims and
manual WhatsApp links and preserves `[hidden]` semantics.

Asset versions were advanced together:

- `app.js?v=ui-m04-shell-007`
- `pipeline-module.js?v=ui-m06-pipeline-009`
- `pipeline-referral-modal.css?v=ui-m06-referral-004`
