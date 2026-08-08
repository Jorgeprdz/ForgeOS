# FORGE AURA HOME COMMAND CENTER AND MOBILE NAV ACCEPTANCE 001

## Scope

Acceptance record for `FORGE_AURA_HOME_COMMAND_CENTER_AND_MOBILE_NAV_RECONCILIATION_001` on branch `feature/aura-home-command-center-mobile-nav-001`.

## Constitutional / authority gates

- CONSTITUTIONAL_GATE: `PASS_DISCOVERY`
- ADR_023_RECOVERY_BEFORE_REWRITE: `PASS`
- ADR_024_AURA: `PASS_IMPLEMENTATION`
- UX_BEHAVIOR_DIRECTIVE: `PASS_DISCOVERY_FROM_GOVERNANCE_AUTHORITY`
- LEGACY_VISUAL_IMPORTS: `ZERO_FOR_NEW_HOME`
- LOCAL_HOME_PRODUCTIVE_ENGINE_CREATION: `ZERO`

## Product contract

- HOME_ROUTE: `IMPLEMENTED`
- HOME_DEFAULT_AUTH_ROUTE: `inicio`
- AUTHENTICATED_NAME_FROM_METADATA: `IMPLEMENTED`
- HARDCODED_USER_NAME: `ZERO`
- DYNAMIC_GREETING: `IMPLEMENTED`
- AUTOMATIC_BROWSER_TIMEZONE: `IMPLEMENTED`
- TIMEZONE_REFRESH: `IMPLEMENTED`
- DAY_NIGHT_THEME_ADDED: `NO`

## Reuse / ownership

- AGENDA_CANONICAL_REUSE: `IMPLEMENTED`
- PRIORITY_ORCHESTRATOR_REUSE: `IMPLEMENTED`
- CARTERA_FUTURE_RADAR_REUSE: `IMPLEMENTED`
- PIPELINE_READ_ADAPTER_REUSE: `IMPLEMENTED`
- ALFRED_COMMAND_OS_REUSE: `IMPLEMENTED`
- PRODUCTIVITY_FRONTEND_RECALCULATION: `FORBIDDEN_AND_NOT_ADDED`
- MICK_CHARACTER_INFERENCE: `FORBIDDEN_AND_NOT_ADDED`

## Truth / safety

- UNKNOWN_IS_NOT_ZERO: `IMPLEMENTED`
- NO_FAKE_DATA: `IMPLEMENTED`
- NO_INVENTED_RECOMMENDATIONS: `IMPLEMENTED`
- HOME_PRODUCT_WRITES: `0`
- SESSION_SCRUB: `IMPLEMENTED`
- ADVISOR_SWITCH_SCRUB: `IMPLEMENTED`
- LATE_RESULT_REJECTION: `IMPLEMENTED`

## Mobile navigation

- MOBILE_FLOATING_NAV: `IMPLEMENTED`
- NAV_ITEMS: `Inicio|Pipeline|Alfred|Cartera|Más`
- ACTIVITY_AVAILABLE_VIA_MORE: `IMPLEMENTED`
- COTIZACIONES_AVAILABLE_VIA_PRODUCTIVE_LINK: `IMPLEMENTED`
- INGRESOS_AVAILABLE_VIA_MORE: `IMPLEMENTED`
- ALFRED_COMMAND_PILL: `IMPLEMENTED`
- SAFE_AREA: `IMPLEMENTED`
- VISUAL_VIEWPORT_KEYBOARD_HANDLING: `IMPLEMENTED`

## Test matrix

Contract test: `tests/aura-home-command-center-mobile-nav-001.test.mjs`

Browser test: `tests/e2e/aura-home-command-center-mobile-nav-001.spec.mjs`

Required browser dimensions:

- `390x844`
- `430x932`
- `834x1194`
- `1440x900`

Additional browser acceptance:

- `200% zoom`
- keyboard focus
- reduced motion
- floating navigation geometry
- More sheet
- Alfred sheet
- no horizontal overflow
- content not hidden beneath mobile navigation

Timezone contract scenarios in unit acceptance:

- `America/Mexico_City`
- `Australia/Sydney`
- `Europe/Madrid`
- `America/New_York`

## Pages acceptance

`prepare-aura-home-pages-authorities.mjs` generates a transitive JavaScript-only closure for the canonical Agenda read model and Smart Widget Orchestrator. The production Pages preparation script invokes this generator before artifact assembly.

- AUTHORITY_CLOSURE_VISUAL_ASSETS: `0`
- MATERIAL_VISUAL_REUSE: `NO`
- CANONICAL_AUTHORITY_SOURCE_COPY_WITHOUT_REWRITE: `YES`
- PAGES_IMPORT_GRAPH_TEST: `DEFINED`

## CI / screenshot evidence

- WORKFLOW: `.github/workflows/aura-home-command-center-mobile-nav-001.yml`
- WORKFLOW_RUN: `PENDING_PR_ACCEPTANCE`
- ARTIFACT_NAME: `aura-home-command-center-mobile-nav-001-acceptance`
- EXPECTED_SCREENSHOTS:
  - `mobile-390x844.png`
  - `mobile-430x932.png`
  - `tablet-834x1194.png`
  - `desktop-1440x900.png`

## Final gate

At creation of this evidence file the implementation is complete but CI has not yet been accepted. Therefore:

- MAIN_MUTATED: `NO`
- AUTO_MERGE: `NO`
- PRODUCTION_DEPLOY: `NO`
- FINAL_STATUS: `PENDING_CI`

Do not promote this record to PASS until the phase workflow succeeds and the final workflow run is recorded here.
