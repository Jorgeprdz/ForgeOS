# FORGE AURA HOME COMMAND CENTER AND MOBILE NAV RECONCILIATION REPORT 001

## Execution identity

- EXECUTION_ID: `FORGE_AURA_HOME_COMMAND_CENTER_AND_MOBILE_NAV_RECONCILIATION_001`
- PHASE: `FORGE_AURA_HOME_COMMAND_CENTER_AND_MOBILE_NAV_RECONCILIATION_001`
- PRODUCT_SURFACE: `ADVISOR_OS_HOME`
- VISIBLE_PRODUCT_NAME: `Inicio`
- EXPERIENCE_NAME: `Mi Día`
- BRANCH: `feature/aura-home-command-center-mobile-nav-001`
- BASE_MAIN_SHA: `be5f98aef0cf5222ea29ddc176008dca0fbc2a0a`
- DIRECT_MAIN_MUTATION: `NO`
- AUTO_MERGE: `NO`
- PRODUCTION_DEPLOY: `NO`

## 1. Constitutional gate

Authorities inspected before implementation:

- Article 0 / Constitution map.
- ADR-023 Advisor OS Productive Home and Core Modules Recovery Execution Authority.
- ADR-024 Forge Aura Light 2026 Canonical Redesign Design Authority.
- Forge Aura Light 2026 canonical design system and canonical authority.
- Forge Aura Light redesign compliance gate.
- FORGE_UI_LOCK_001_MI_DIA_ALFRED_COMMAND_COCKPIT as historical conceptual authority only.
- Forge Aura UX Behavior Directive LOCKED from its governance authority branch because the exact requested path is not present on `main`. No replacement directive was invented.
- Relevant evidence/ownership/NBA/productivity/compensation boundaries referenced by the execution prompt remain governing constraints.

Result: implementation proceeds under recovery-before-rewrite, one-owner, unknown-is-not-zero, human-authority, Client First and Aura Light constraints.

## 2. Material inventory — functional evidence only

Inspected functional behavior from the historical Material runtime, including:

- Home live dashboard and active runtime.
- Home productive orchestrator.
- Alfred Command OS runtime.
- Mick goal coach.
- Pipeline productive adapter/card projection.
- Existing Pages runtime closure patterns.

No Material color, layout, dark glass, card styling or legacy CSS was imported into Aura Home.

## 3. Productive authorities reused

### Agenda

Owner: `advisor-os/next-action/agenda-read-model.js`.

Home converts read-only Pipeline cards into the existing Agenda input contract and invokes the canonical read model. It does not create a task table, rollover mechanism or persistence owner.

### Priority / NBA-compatible orchestration

Owner: `advisor-os/forge-alive/smart-widgets/productive-smart-widget-orchestrator.mjs` plus its existing providers/contracts.

Home does not create a new arbitrary ranking. The orchestrator remains owner of hard-priority ordering; Home only presents the selected primary signal and at most supporting rhythm signals.

### Cartera

Owner: productive RPC `forge_cartera050_list_future_radar` and the existing Cartera Future Radar truth contract.

Home preserves `truthClass`, `sourceAuthority`, `whyNow`, `uncertainty`, `smallestUsefulAction`, and `advisorConfirmationRequired`. It never converts inference into confirmed fact.

### Pipeline

Owner: existing Aura Pages Pipeline adapter. Home uses `reload()` read behavior only to create an Agenda projection.

### Alfred

Owner: existing `alfred-command-runtime.js`, Command registry, entity resolution, action registry, review packet and auth boundaries.

Aura creates only the canonical Light shell surface required by the already-existing runtime. A marker prevents the legacy Alfred Material stylesheet from loading; Command OS behavior is reused while Aura owns its visual presentation.

### Activity / Productivity

Home does not recalculate Activity points. If the Smart Widget stack lacks an evidence-backed scoring snapshot, the source stays disconnected/unknown instead of synthesizing a number.

### Mick

No new Mick engine or personality inference was added. Until a Home-safe evidence-backed observation source is connected, the Mick block explicitly reports insufficient evidence and routes to Activity.

### Income / Forecast / Nash

No permanent large cards were created. No new productive engine was introduced. These engines may surface only through existing orchestrated signals when a truthful owner is connected.

## 4. New adapters / presentation files

Created under the approved boundary:

- `docs/static-preview/forge-aura/home/home-core.js`
- `docs/static-preview/forge-aura/home/home-adapter-pages-v1.js`
- `docs/static-preview/forge-aura/home/home-module.js`
- `docs/static-preview/forge-aura/home/home.css`

Responsibilities:

- `home-core.js`: pure presentation/view-model helpers, timezone/greeting helpers and deterministic projections only.
- `home-adapter-pages-v1.js`: session-scoped reads and canonical authority composition; product writes = 0.
- `home-module.js`: lifecycle, rendering, honest states, navigation and session-safe refresh.
- `home.css`: Aura Light presentation using canonical Forge/Aura tokens.

## 5. Pages authority closure

Created `scripts/prepare-aura-home-pages-authorities.mjs` and wired it into `scripts/build-advisor-presentation-pages-runtime.mjs`.

The preparer recursively collects the canonical repository modules required by Agenda and the Smart Widget Orchestrator and copies them without source rewrite into a Pages-local authority closure under Material3/Aura publication roots. It copies JavaScript authority code only; visual assets count is explicitly zero.

This avoids source-layout imports that GitHub Pages does not publish while also avoiding a hand-maintained duplicate engine.

## 6. Shell / route changes

Updated only the approved shell/router/app boundaries needed for Home and canonical navigation.

Authenticated default route is now `inicio`; explicit valid routes still restore.

Desktop keeps a top Aura navigation hierarchy. Mobile uses the required floating bottom navigation:

`Inicio | Pipeline | Alfred | Cartera | Más`

Activity is removed from the primary mobile slots and remains available through `Más`. `Más` also exposes the existing productive Cotizaciones surface and Ingresos. No fake Perfil/Configuración route was created.

## 7. Alfred command pill

On mobile Inicio, a compact `Pregúntale a Alfred…` command surface floats above the primary navbar. It opens the existing Command OS sheet; no parallel chatbot is created.

The shell tracks `visualViewport`, keyboard inset and safe-area. When the mobile keyboard is open, the floating nav/pill are removed from the competing viewport region.

## 8. Timezone behavior

Timezone source: `Intl.DateTimeFormat().resolvedOptions().timeZone`.

- No Mexico timezone is hardcoded in the new Home runtime.
- Timezone is resolved at mount.
- It is re-resolved on `pageshow` and on return to visibility.
- Historical timestamps are not mutated; only presentation/day classification changes.
- Greeting is computed against the active browser IANA timezone.
- Day/night visual theming was not added.

## 9. Home architecture

Presentation order:

1. Dynamic authenticated greeting + Mi Día context.
2. Alfred primary briefing / next operational action.
3. `Ahora / Hoy` from canonical Agenda.
4. Cartera attention-only signals.
5. Compact `Tu ritmo` from already-owned metrics only.
6. Evidence-bound Mick observation or an honest insufficient-evidence state.

The Home does not contain production charts, a complete Pipeline list, a policy table, an income dashboard, a module directory or one card per engine.

## 10. Honest states

Runtime preserves loading, empty, partial/source-unavailable/session-required/blocked semantics. Unknown sources are not converted to zero. No production fixtures or hardcoded people are present in Home.

## 11. Session / security

- Authenticated advisor is checked before productive reads.
- Advisor identity is checked again after asynchronous reads.
- Generation/revision counters and AbortController reject stale responses.
- Home scrub removes private presentation state.
- Advisor switch uses the existing app scrub boundary before remount.
- Product writes performed by Home: `0`.

## 12. Accessibility / responsive

Implemented/covered:

- 44 px minimum interactive targets.
- visible global focus treatment and focus-within on Alfred input.
- reduced-motion contract inherited from Aura tokens.
- focus containment/return for modal sheets.
- `aria-live` global status and existing Home status/error surfaces.
- safe-area-aware mobile bottom navigation.
- visualViewport/keyboard handling.
- responsive mobile/tablet/desktop hierarchy rather than desktop shrink-only behavior.

## 13. Tests

Added:

- `tests/aura-home-command-center-mobile-nav-001.test.mjs`
- `tests/e2e/aura-home-command-center-mobile-nav-001.spec.mjs`
- `playwright.aura-home.config.mjs`
- `.github/workflows/aura-home-command-center-mobile-nav-001.yml`

Contract suite covers dynamic identity, timezone scenarios, unknown-is-not-zero, Agenda projection, priority ownership, Cartera truth, Mick boundary, Alfred reuse, default route, mobile nav contract, More, command pill, safe areas, keyboard contract, session scrub, late result rejection and Pages import graph.

Browser suite covers 390×844, 430×932, 834×1194 and 1440×900 plus mobile nav geometry, More, Alfred sheet, 200% zoom, reduced motion and keyboard focus. Acceptance screenshots are uploaded by CI.

## 14. Duplication proof

- NEW_PRODUCTIVE_ENGINE_COUNT: `0`
- DUPLICATE_HOME_COUNT: `0`
- DUPLICATE_AGENDA_ENGINE_COUNT: `0`
- DUPLICATE_PRIORITY_ENGINE_COUNT: `0`
- NEW_ALFRED_RUNTIME_COUNT: `0`
- NEW_ACTIVITY_SCORING_ENGINE_COUNT: `0`
- NEW_COMPENSATION_ENGINE_COUNT: `0`
- NEW_FORECAST_ENGINE_COUNT: `0`

## 15. Known limits

- Mick does not fabricate an observation when no Home-safe observation source is connected; the UI reports insufficient evidence.
- Activity/Monthly Goal/Income are not synthesized by Home when their canonical evidence source is unavailable to the Home adapter.
- This phase does not add Profile/Settings routes, day/night visuals, weather, schema, RLS, automatic contact or automatic task creation.

## 16. CI / artifact / final state

- PHASE_WORKFLOW: `.github/workflows/aura-home-command-center-mobile-nav-001.yml`
- CI_RUN: `PENDING_PR_ACCEPTANCE`
- SCREENSHOT_ARTIFACT: `aura-home-command-center-mobile-nav-001-acceptance`
- IMPLEMENTATION_HEAD_AT_REPORT_CREATION: `3f038a4973602d2d6748d90bffc9392604fe5a59`
- FINAL_BRANCH_SHA: `PENDING_FINAL_ACCEPTANCE`
- FINAL_STATUS: `PENDING_CI`

This report must be updated with the accepted workflow run and final status before the phase is declared PASS.
