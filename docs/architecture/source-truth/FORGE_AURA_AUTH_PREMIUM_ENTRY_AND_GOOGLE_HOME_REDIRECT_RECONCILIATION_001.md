# Forge Aura Auth Premium Entry & Google Home Redirect Reconciliation 001

```text
PHASE=FORGE_AURA_AUTH_PREMIUM_ENTRY_AND_GOOGLE_HOME_REDIRECT_RECONCILIATION_001
PRODUCT_SURFACE=FORGE_AUTH_ENTRY
TARGET_BRANCH=feature/aura-auth-premium-entry-home-redirect-001
BASE_MAIN_SHA=f4482431563b98a594e00daa9f6ae4c57db5f637
FINAL_IMPLEMENTATION_SHA=PENDING_REBASED_IMPLEMENTATION_COMMIT
MAIN_MUTATED=NO
MERGE_EXECUTED=NO
PRODUCTION_DEPLOYMENT=NO
```

## Current-state recovery

The phase was reconciled against the current `main` after it advanced during implementation. The concurrent merge was Quotes-only and did not overlap the Auth boundary.

```text
CURRENT_STATE_RECOVERED=PASS
CURRENT_MAIN_SHA=f4482431563b98a594e00daa9f6ae4c57db5f637
BRANCH_BASE_SHA=f4482431563b98a594e00daa9f6ae4c57db5f637
CONCURRENT_MAIN_CHANGE_PRESERVED=YES
CURRENT_DEFAULT_AUTHENTICATED_ROUTE=inicio
CURRENT_GOOGLE_CALLBACK_DEFECT=HARDCODED_PIPELINE_CONFIRMED
CURRENT_LOGIN_PIPELINE_CSS_COUPLING=CONFIRMED
```

## Authorities read

- `docs/01-constitution/FORGE_CONSTITUTION_MAP.md`
- `docs/architecture/source-truth/ARTICLE_0_RATIFICATION_001.md`
- `adr/ADR-003 — Recommendation vs Decision Authority Boundary.txt`
- `adr/ADR-004 — No Invented Recommendations.txt`
- `adr/ADR-016 — Advisor Experience + Benvenù Anti-Dependence Boundary.txt`
- `adr/ADR-018 — Economic Motivation Client First Boundary.txt`
- `adr/ADR-024 — Forge Aura Light 2026 Canonical Redesign Design Authority.txt`
- `docs/05-foundation/design-system/FORGE_AURA_LIGHT_2026_CANONICAL_AUTHORITY.md`
- `docs/05-foundation/design-system/FORGE_AURA_LIGHT_2026_CANONICAL_DESIGN_SYSTEM.md`
- `docs/05-foundation/design-system/FORGE_AURA_LIGHT_2026_UX_BEHAVIOR_DIRECTIVE_LOCKED.md` from governed authority branch `governance/forge-aura-light-2026-authority`.

```text
ARTICLE_0=PASS
CONSTITUTIONAL_GATE=PASS
AURA_LIGHT_GATE=PASS
ROBOCOP_LOCK_001=PASS
AURA_LIGHT_SOURCE_PDF_SHA256=0dbda2ae17d80602c7943bf139015177dbeb340a5edd5d9a5983bd24d5b6672e
AURA_LIGHT_VERSION=1.0
```

## Implementation

### Premium entry

The anonymous entry is now a Forge product experience rather than a Pipeline login card.

- product context and Forge identity precede configuration;
- Google is the primary authentication action;
- email/password remains a secondary supported path;
- privacy copy is product-facing and does not expose implementation vocabulary;
- no invented production metrics or demo dashboards are shown;
- responsive hierarchy collapses intentionally on mobile rather than compressing two desktop columns.

### Google routing

The router transports only a valid explicit pre-auth route through the OAuth callback as transient URL state.

```text
NO_EXPLICIT_ROUTE -> inicio
EXPLICIT_VALID_PRE_AUTH_ROUTE -> governed return route
INVALID_ROUTE -> inicio
LOGIN_ROUTE -> inicio
```

The callback no longer hardcodes Pipeline and uses the canonical Aura entrypoint.

### Security

The existing Supabase client/session contract remains authoritative.

```text
NEW_AUTH_ENGINE_COUNT=0
NEW_IDENTITY_MODEL_COUNT=0
persistSession=true
autoRefreshToken=true
detectSessionInUrl=false
flowType=implicit
SESSION_USER_ID_REQUIRED=YES
PASSWORD_PERSISTENCE=NO
PRIVATE_ROUTE_PERSISTENCE=NO
TOKEN_UI_EXPOSURE=NO
STACK_TRACE_UI_EXPOSURE=NO
```

The callback scrubs the OAuth fragment before navigation or user-visible failure handling.

### Pipeline presentation decoupling

`pipeline.css` is no longer loaded by the anonymous Auth entry. It is loaded only when the authenticated route is `pipeline`. Pipeline business logic is unchanged.

```text
AUTH_OWNS_AUTH_PRESENTATION=YES
PIPELINE_DOES_NOT_OWN_AUTH_PRESENTATION=YES
PIPELINE_BUSINESS_LOGIC_MUTATION=0
```

## Shared mutation justification

- `aura-router-v4.js`: required to preserve a valid explicit route through OAuth without persistence.
- `app-v4-r1.js`: required to load Pipeline presentation only when the authenticated route actually mounts.
- `index.html`: required because it is the canonical Pages Aura entry and previously imported Pipeline CSS globally.

No shared mutation changes Home, Pipeline, Activity, Cartera, Income, Quotes, compensation, database, RLS or product engines.

## Validation

Pre-push implementation validation:

```text
NODE_SYNTAX=PASS
AUTH_ROUTE_SECURITY_STATIC_CONTRACTS=12/12 PASS
PAGES_ARTIFACT_BUILD=PENDING_CI
AUTH_IMPORT_GRAPH=PENDING_CI
MOBILE=PENDING_CI
TABLET=PENDING_CI
DESKTOP=PENDING_CI
ZOOM_200=PENDING_CI
KEYBOARD_ONLY=PENDING_CI
VISIBLE_FOCUS=PENDING_CI
REDUCED_MOTION=PENDING_CI
VISUAL_ACCEPTANCE=PENDING_CI
FINAL_STATUS=IMPLEMENTED_PENDING_CI_AND_HUMAN_REVIEW
```
