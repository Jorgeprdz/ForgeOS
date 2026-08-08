# FORGE AURA HOME COMMAND CENTER AND MOBILE NAV RECONCILIATION REPORT 001

## Execution identity

- EXECUTION_ID: `FORGE_AURA_HOME_COMMAND_CENTER_AND_MOBILE_NAV_RECONCILIATION_001`
- PHASE: `FORGE_AURA_HOME_COMMAND_CENTER_AND_MOBILE_NAV_RECONCILIATION_001`
- PRODUCT_SURFACE: `ADVISOR_OS_HOME`
- VISIBLE_PRODUCT_NAME: `Inicio`
- EXPERIENCE_NAME: `Mi Día`
- BRANCH: `feature/aura-home-command-center-mobile-nav-001`
- ORIGINAL_BASE_MAIN_SHA: `be5f98aef0cf5222ea29ddc176008dca0fbc2a0a`
- INTEGRATED_MAIN_SHA: `6cc2a6b1fe9fdd49401717469073012f473724b1`
- ACCEPTED_IMPLEMENTATION_SHA: `c777efa279a12f4be2024aa9d67f4af79f9164fa`
- DIRECT_MAIN_MUTATION: `NO`
- AUTO_MERGE: `NO`
- PRODUCTION_DEPLOY: `NO`

## 1. Authorities read / constitutional gate

Authorities inspected before implementation:

- Article 0 / Constitution map.
- ADR-023 Advisor OS Productive Home and Core Modules Recovery Execution Authority.
- ADR-024 Forge Aura Light 2026 Canonical Redesign Design Authority.
- Forge Aura Light 2026 canonical design system and canonical authority.
- Forge Aura Light redesign compliance gate.
- FORGE_UI_LOCK_001_MI_DIA_ALFRED_COMMAND_COCKPIT as historical conceptual authority only.
- Forge Aura UX Behavior Directive LOCKED from its governance authority branch because the exact requested path is not present on `main`. No replacement directive was invented.
- Relevant Evidence Ownership, One Metric One Owner, Recommendation vs Decision, No Invented Recommendations, Product/Policy/Forecast/Economic truth, NBA, Mick, Productivity, Advisor Experience and Compensation boundaries referenced by the execution prompt.

Result: `CONSTITUTIONAL_GATE=PASS` under recovery-before-rewrite, one-owner, unknown-is-not-zero, human-authority, Client First and Aura Light constraints.

## 2. Current Material inventory — functional evidence only

Inspected functional behavior from the historical Material runtime, including:

- Home live dashboard and active runtime.
- Home productive orchestrator.
- Alfred Command OS runtime.
- Mick goal coach.
- Pipeline productive adapter/card projection.
- Existing Pages runtime closure patterns.

No Material color, layout, dark glass, card styling or legacy CSS was imported into Aura Home.

## 3. Engines / read models reused

### Agenda

Owner: `advisor-os/next-action/agenda-read-model.js`.

Home converts read-only Pipeline cards into the existing Agenda input contract and invokes the canonical read model. It does not create a task table, rollover mechanism or persistence owner.

### Priority / NBA-compatible orchestration

Owner: `advisor-os/forge-alive/smart-widgets/productive-smart-widget-orchestrator.mjs` plus its existing providers/contracts.

Home does not create a new arbitrary ranking. The orchestrator remains owner of hard-priority ordering; Home only presents the selected primary signal.

### Cartera

Owner: productive RPC `forge_cartera050_list_future_radar` and the existing Cartera Future Radar truth contract.

Home preserves `truthClass`, `sourceAuthority`, `whyNow`, `uncertainty`, `smallestUsefulAction`, and `advisorConfirmationRequired`. It never converts inference into confirmed fact.

### Pipeline

Owner: existing Aura Pages Pipeline adapter. Home uses `reload()` read behavior only to create an Agenda projection.

### Alfred

Owner: existing `alfred-command-runtime.js`, Command registry, entity resolution, action registry, review packet and auth boundaries.

Aura creates only the canonical Light shell surface required by the existing runtime. A marker prevents the legacy Alfred Material stylesheet from loading; Command OS behavior is reused while Aura owns its visual presentation.

### Activity / Productivity

Home does not recalculate Activity points. `Tu ritmo` only accepts already-owned `ACTIVITY_PROGRESS_WIDGET` or `MONTHLY_POLICY_GOAL_WIDGET` evidence. Policy, Income or other widgets cannot be recycled as productivity metrics. If neither owner is connected with usable evidence, Home displays an honest unavailable state.

### Mick

No new Mick engine or personality inference was added. Until a Home-safe evidence-backed observation source is connected, the Mick block explicitly reports insufficient evidence and routes to Activity.

### Income / Forecast / Nash

No permanent large cards were created. No new productive engine was introduced. These engines gain Home surface only through existing governed intelligence when a truthful owner is connected.

## 4. Duplications avoided

- NEW_PRODUCTIVE_ENGINE_COUNT: `0`
- DUPLICATE_HOME_COUNT: `0`
- DUPLICATE_AGENDA_ENGINE_COUNT: `0`
- DUPLICATE_PRIORITY_ENGINE_COUNT: `0`
- NEW_ALFRED_RUNTIME_COUNT: `0`
- NEW_ACTIVITY_SCORING_ENGINE_COUNT: `0`
- NEW_COMPENSATION_ENGINE_COUNT: `0`
- NEW_FORECAST_ENGINE_COUNT: `0`

## 5. New adapters / presentation boundary

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

## 6. Shell changes

Updated only the approved shell/router/app boundaries needed for Home and canonical navigation.

Authenticated default route is now `inicio`; explicit valid routes still restore.

Desktop keeps a top Aura navigation hierarchy. Mobile uses the required floating bottom navigation:

`Inicio | Pipeline | Alfred | Cartera | Más`

Activity is removed from the primary mobile slots and remains available through `Más`. `Más` also exposes the existing productive Cotizaciones surface and Ingresos. No fake Perfil/Configuración route was created.

The phase also preserved the concurrent Cartera PDF root-010/010b main changes by integrating `main@6cc2a6b1fe9fdd49401717469073012f473724b1` into the feature branch before final acceptance.

## 7. Alfred command pill / Command OS

On mobile Inicio, a compact `Pregúntale a Alfred…` command surface floats above the primary navbar. It opens the existing Command OS sheet; no parallel chatbot is created.

The shell tracks `visualViewport`, keyboard inset and safe-area. When the mobile keyboard is open, the floating nav/pill are removed from the competing viewport region.

## 8. Timezone behavior

Timezone source: `Intl.DateTimeFormat().resolvedOptions().timeZone`.

- No Mexico timezone is hardcoded in the new Home runtime.
- Timezone is resolved at mount.
- It is re-resolved on `pageshow` and on return to visibility.
- Historical timestamps are not mutated; only presentation/day classification changes.
- Greeting is computed against the active browser IANA timezone.
- Unit acceptance validates the same absolute instant under `America/Mexico_City`, `Australia/Sydney`, `Europe/Madrid`, and `America/New_York`.
- Day/night visual theming was not added.

## 9. Inicio information architecture

Presentation order:

1. Dynamic authenticated greeting + Mi Día context.
2. Alfred primary briefing / next operational action.
3. `Ahora / Hoy` from canonical Agenda.
4. Cartera attention-only signals.
5. Compact `Tu ritmo` from Activity/monthly-goal owners only.
6. Evidence-bound Mick observation or an honest insufficient-evidence state.

The Home does not contain production charts, a complete Pipeline list, a policy table, an income dashboard, a module directory or one card per engine.

## 10. Mobile navbar architecture

- Fixed floating Aura surface with safe-area offset.
- Exact primary items: `Inicio | Pipeline | Alfred | Cartera | Más`.
- Alfred is visually central/special and opens existing Command OS.
- Activity is reachable from `Más`, Home rhythm deep links, Alfred and context.
- Cotizaciones is exposed through the existing productive surface rather than a fake Aura route.
- Ingresos remains reachable through `Más`.
- Mobile command pill sits above the nav on Inicio.

## 11. Accessibility

Implemented and accepted:

- 44 px minimum interactive targets.
- visible global focus treatment and focus-within on Alfred input.
- reduced-motion contract inherited from Aura tokens and verified numerically as effectively zero transition duration.
- focus containment/return for modal sheets.
- `aria-live` global status and Home status/error surfaces.
- safe-area-aware mobile bottom navigation.
- visualViewport/keyboard handling.
- responsive mobile/tablet/desktop hierarchy rather than desktop shrink-only behavior.

## 12. Session / security

- Authenticated advisor is checked before productive reads.
- Advisor identity is checked again after asynchronous reads.
- Generation/revision counters and AbortController reject stale responses.
- Home scrub removes private presentation state.
- Advisor switch uses the existing app scrub boundary before remount.
- Product writes performed by Home: `0`.
- No new schema, RLS or persistence was added.

## 13. Pages import graph

Created `scripts/prepare-aura-home-pages-authorities.mjs` and wired it into `scripts/build-advisor-presentation-pages-runtime.mjs`.

The preparer recursively collects the canonical repository modules required by Agenda and the Smart Widget Orchestrator and copies them without source rewrite into Pages-local authority closure roots. It copies JavaScript authority code only; visual assets count is explicitly zero.

This prevents white-screen source-layout imports while avoiding a hand-maintained duplicate engine.

`AURA_PAGES_IMPORT_GRAPH_TEST=PASS` on the accepted implementation SHA.

## 14. Tests

Added:

- `tests/aura-home-command-center-mobile-nav-001.test.mjs`
- `tests/e2e/aura-home-command-center-mobile-nav-001.spec.mjs`
- `playwright.aura-home.config.mjs`
- `.github/workflows/aura-home-command-center-mobile-nav-001.yml`

Contract acceptance covers dynamic identity, four timezone scenarios, unknown-is-not-zero, Agenda projection, priority ownership, Cartera truth, Productivity metric ownership, Mick boundary, Alfred reuse, default route, mobile nav contract, More, command pill, safe areas, keyboard contract, session scrub, late-result rejection and Pages import graph.

Browser acceptance covers:

- `390x844`
- `430x932`
- `834x1194`
- `1440x900`
- 200% desktop zoom represented by the equivalent 720×450 CSS viewport/reflow
- keyboard focus
- reduced motion
- floating navigation geometry
- More sheet
- Alfred sheet
- no horizontal overflow
- content not hidden beneath mobile navigation
- honest `Tu ritmo` state when productivity-owner evidence is unavailable

All accepted browser cases passed.

## 15. Screenshots de aceptación

Accepted artifact contains:

- `mobile-390x844.png`
- `mobile-430x932.png`
- `tablet-834x1194.png`
- `desktop-1440x900.png`

Manual review of the final mobile screenshot confirms command-center hierarchy, honest Rhythm state, Alfred command pill, exact five-item mobile nav and unobstructed content.

## 16. Known limits

- Mick does not fabricate an observation when no Home-safe observation source is connected; the UI reports insufficient evidence.
- Activity/Monthly Goal/Income are not synthesized by Home when their canonical evidence source is unavailable to the Home adapter.
- This phase does not add Profile/Settings routes, day/night visuals, weather, schema, RLS, automatic contact or automatic task creation.

## 17. Final SHA

`ACCEPTED_IMPLEMENTATION_SHA=c777efa279a12f4be2024aa9d67f4af79f9164fa`

This is the exact source head on which the complete phase workflow passed. Subsequent documentation-only evidence recording does not change the accepted product implementation.

## 18. Workflow run

- WORKFLOW: `Aura Home Command Center + Mobile Nav 001`
- RUN_ID: `31274630001`
- JOB_ID: `93146121319`
- RESULT: `SUCCESS`

Passed steps include Syntax gate, Contract acceptance, Pages authority closure, Chromium install, Browser acceptance, screenshot verification, evidence upload and Production safety declaration.

## 19. Artifact

- NAME: `aura-home-command-center-mobile-nav-001-acceptance`
- ARTIFACT_ID: `9026649347`
- DIGEST: `sha256:67a69f5a9b3226ee31fff56eb3790770e63aff0f0f3d6a14c008a3e7dedaee9d`
- EXPIRES: `2026-08-22`

## 20. Final state

```text
CONSTITUTIONAL_GATE=PASS
ADR_024_AURA=PASS
UX_BEHAVIOR_DIRECTIVE=PASS
HOME_ROUTE=PASS
HOME_DEFAULT_AUTH_ROUTE=PASS
AUTHENTICATED_NAME_FROM_GOOGLE_METADATA=PASS
HARDCODED_USER_NAME=ZERO
DYNAMIC_GREETING=PASS
AUTOMATIC_BROWSER_TIMEZONE=PASS
TIMEZONE_REFRESH=PASS
DAY_NIGHT_THEME_ADDED=NO
AGENDA_CANONICAL_REUSE=PASS
PRIORITY_ORCHESTRATOR_REUSE=PASS
POLICY_AUTHORITY_REUSE=PASS
PRODUCTIVITY_OWNER_REUSE=PASS
MICK_BOUNDARY=PASS
ALFRED_REUSE=PASS
NEW_PRODUCTIVE_ENGINE_COUNT=0
DUPLICATE_HOME_COUNT=0
DUPLICATE_AGENDA_ENGINE_COUNT=0
UNKNOWN_IS_NOT_ZERO=PASS
NO_FAKE_DATA=PASS
NO_INVENTED_RECOMMENDATIONS=PASS
MOBILE_FLOATING_NAV=PASS
NAV_ITEMS=Inicio|Pipeline|Alfred|Cartera|Más
ACTIVITY_AVAILABLE_VIA_MORE=PASS
ALFRED_COMMAND_PILL=PASS
SAFE_AREA=PASS
MOBILE_KEYBOARD=PASS
ZOOM_200=PASS
KEYBOARD_ONLY=PASS
VISIBLE_FOCUS=PASS
REDUCED_MOTION=PASS
SESSION_SCRUB=PASS
ADVISOR_SWITCH_SCRUB=PASS
LATE_RESULT_REJECTION=PASS
TENANT_ISOLATION=PASS
PAGES_IMPORT_GRAPH=PASS
PUBLIC_RUNTIME=PASS
MAIN_MUTATED=NO
AUTO_MERGE=NO
PRODUCTION_DEPLOY=NO
FINAL_STATUS=PASS_IMPLEMENTATION_READY_FOR_HUMAN_REVIEW
```

Final product test: an advisor opening Forge between appointments can identify the current context, the highest evidence-backed priority, what requires attention and the next available action without interpreting a dashboard.
