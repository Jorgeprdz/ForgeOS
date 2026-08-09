# Forge Aura Auth Premium Entry & Google Home Redirect Reconciliation 001

```text
PHASE=FORGE_AURA_AUTH_PREMIUM_ENTRY_AND_GOOGLE_HOME_REDIRECT_RECONCILIATION_001
PRODUCT_SURFACE=FORGE_AUTH_ENTRY
TARGET_BRANCH=feature/aura-auth-premium-entry-home-redirect-001
BASE_MAIN_SHA=ead05e0085d2c0743833515316558d2e8b6b98cc
FINAL_IMPLEMENTATION_SHA=0cfa8141d120f96d5054e43bbf913c1162bad6ef
VALIDATED_IMPLEMENTATION_CI_RUN=31287831300
MAIN_MUTATED=NO
MERGE_EXECUTED=NO
PRODUCTION_DEPLOYMENT=NO
FINAL_STATUS=READY_FOR_HUMAN_REVIEW
```

## Current-state recovery

The implementation was reconciled against live `main` immediately before final acceptance. The final implementation commit is a single child of the recorded main base and preserves concurrent Quotes, Cartera and shared runtime changes.

```text
CURRENT_STATE_RECOVERED=PASS
CURRENT_MAIN_SHA=ead05e0085d2c0743833515316558d2e8b6b98cc
BRANCH_BASE_SHA=ead05e0085d2c0743833515316558d2e8b6b98cc
CONCURRENT_MAIN_CHANGE_PRESERVED=YES
CURRENT_DEFAULT_AUTHENTICATED_ROUTE=inicio
HARDCODED_GOOGLE_PIPELINE_REDIRECT=REMOVED
LOGIN_PIPELINE_VISUAL_COUPLING=ZERO
CURRENT_OPEN_AUTH_PR=316
```

## Constitutional and design authorities

Read and applied:

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
AUTHORITY_OVER_CONVENIENCE=PASS
IDENTITY_TRUTH_PRESERVED=YES
NO_FAKE_AUTH_STATE=YES
NO_FAKE_USER=YES
NO_SECURITY_WEAKENING=YES
SESSION_BOUNDARY_PRESERVED=YES
TENANT_ISOLATION_PRESERVED=YES
ADR-003=APPLIED
ADR-004=APPLIED
ADR-016=APPLIED
ADR-018=APPLIED
ADR-024=APPLIED
```

## Product implementation

### Premium Forge entry

Anonymous Auth is now a Forge Aura Light 2026 entry experience rather than a Pipeline-owned login card.

- Forge identity and product value precede configuration effort.
- Google is the primary authentication action.
- Email/password remains the governed secondary path.
- Password-manager semantics are preserved.
- Loading, error, config-blocked and authenticated states remain honest.
- Errors and privacy language are human and product-facing.
- No fake metrics, demo dashboards, urgency or commercial claims were introduced.
- Mobile/tablet/desktop hierarchy follows Aura rather than compressing the desktop composition.
- Productive UI does not expose callback/runtime/version/Supabase implementation vocabulary.

### Google routing contract

```text
NO_EXPLICIT_ROUTE
  -> GOOGLE_AUTH_SUCCESS
  -> VALID_SESSION
  -> route=inicio

EXPLICIT_VALID_PRE_AUTH_ROUTE
  -> AUTH_REQUIRED
  -> GOOGLE_AUTH_SUCCESS
  -> VALID_SESSION
  -> governed return route

INVALID_ROUTE -> inicio
LOGIN_ROUTE -> inicio
```

```text
ROUTING_CHANGE=GOOGLE_DEFAULT_PIPELINE_TO_INICIO
POST_GOOGLE_ROUTE=inicio
PIPELINE_HARDCODED_GOOGLE_REDIRECT_COUNT=0
EXPLICIT_ROUTE_RETURN=PASS
DEFAULT_ROUTE_RETURN=PASS
```

### Auth productive boundary and security

The implementation reuses the existing Supabase client/session authority. It does not create a replacement auth engine, identity model, credential store, database schema or RLS policy.

```text
AUTH_RUNTIME_REUSED=YES
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
DATABASE_MUTATION=0
RLS_MUTATION=0
AUTH_PROVIDER_CONFIGURATION_MUTATION=0
GOOGLE_CREDENTIAL_MUTATION=0
```

The callback validates a real `session.user.id`, scrubs sensitive OAuth URL state and never renders raw tokens, stack traces, credentials or internal provider detail to the user.

### Pipeline presentation decoupling

`pipeline.css` is not loaded by anonymous Auth. Pipeline presentation is loaded only when the authenticated `pipeline` route mounts. Pipeline business logic remains untouched.

```text
AUTH_OWNS_AUTH_PRESENTATION=YES
PIPELINE_DOES_NOT_OWN_AUTH_PRESENTATION=YES
LOGIN_PIPELINE_VISUAL_COUPLING=ZERO
PIPELINE_BUSINESS_LOGIC_MUTATION=0
```

## Shared mutation justification

- `aura-router-v4.js`: preserves a valid explicit return route through transient URL state without storing private route data.
- `app-v4-r1.js`: scopes Pipeline presentation to the authenticated Pipeline route.
- `index.html`: canonical Aura Pages entry; removes Auth/Pipeline visual ownership while preserving the current Forge/Aura product metadata and concurrent main integrations.

No shared mutation changes Home business logic, Pipeline business logic, Activity, Cartera, Income, Quotes, Alfred productive logic, compensation, forecast, database, RLS or product engines.

## Phase file boundary

```text
.github/workflows/aura-auth-premium-entry-home-redirect-001.yml
docs/architecture/source-truth/FORGE_AURA_AUTH_PREMIUM_ENTRY_AND_GOOGLE_HOME_REDIRECT_RECONCILIATION_001.md
docs/evidence/FORGE_AURA_AUTH_PREMIUM_ENTRY_AND_GOOGLE_HOME_REDIRECT_ACCEPTANCE_001.md
docs/static-preview/forge-aura/app-v4-r1.js
docs/static-preview/forge-aura/aura-auth-v4.js
docs/static-preview/forge-aura/aura-auth.css
docs/static-preview/forge-aura/aura-router-v4.js
docs/static-preview/forge-aura/auth-v4.html
docs/static-preview/forge-aura/index.html
docs/static-preview/forge-aura/oauth-callback-v4.html
docs/static-preview/forge-aura/oauth-callback-v4.js
scripts/aura-auth-premium-entry-scope-guard-001.mjs
tests/aura-auth-pages-import-graph-001.test.mjs
tests/aura-auth-premium-entry-home-redirect-001.test.mjs
tests/aura-auth-premium-entry-playwright.config.mjs
tests/e2e/aura-auth-premium-entry.spec.mjs
tests/fixtures/aura-auth-premium-entry-harness.html
tests/fixtures/aura-oauth-callback-harness.html
```

## Exact implementation-head validation

GitHub Actions run `31287831300` validated exact implementation SHA `0cfa8141d120f96d5054e43bbf913c1162bad6ef`.

```text
NODE_SYNTAX=PASS
AUTH_ROUTE_SECURITY_STATIC_CONTRACTS=PASS
CONSTITUTIONAL_GATE=PASS
AURA_LIGHT_GATE=PASS
ROBOCOP_LOCK_001=PASS
AUTH_PRODUCTIVE_REUSE=PASS
PASSWORD_AUTH=PASS
GOOGLE_AUTH_CONTRACT=PASS
SESSION_RESTORE=PASS
SIGNOUT=PASS
DEEP_LINK_RETURN=PASS
NO_TOKEN_EXPOSURE=PASS
NO_PASSWORD_PERSISTENCE=PASS
MATERIAL_VISUAL_IMPORT_COUNT=0
LEGACY_VISUAL_IMPORT_COUNT=0
LOCAL_UNGOVERNED_TOKEN_COUNT=0
PAGES_ARTIFACT_BUILD=PASS
AUTH_IMPORT_GRAPH=PASS
OAUTH_CALLBACK_IMPORT_GRAPH=PASS
NO_BLANK_SCREEN_IMPORT_FAILURE=PASS
MOBILE=PASS
TABLET=PASS
DESKTOP=PASS
ZOOM_200=PASS
KEYBOARD_ONLY=PASS
VISIBLE_FOCUS=PASS
REDUCED_MOTION=PASS
VISUAL_ACCEPTANCE=PASS
```

## Evidence artifacts

```text
SCREENSHOT_ARTIFACT_ID=9030417566
SCREENSHOT_ARTIFACT_SHA256=dc4d33839fcb698a3d232761f9939abbebabaa43185d6345bcb07c48d2707992
PAGES_ARTIFACT_ID=9030411103
PAGES_ARTIFACT_SHA256=5276e1c4ebfec414db24d4edeb250c9a95b79c79482673d7326e3f55406c2f53
```

The visual artifact contains Login mobile 390/430, tablet 834, desktop 1440, password error, Google loading, OAuth callback success/error and 200% zoom evidence.

## Known cross-workflow note

A historical Income-specific scope guard can reject Auth files when its unrelated workflow is evaluated on an Auth branch; its economic/isolation tests are not the authority for this phase. This phase does not weaken or modify that unrelated guard.

No merge, auto-merge or production deployment is performed by this phase. Human review remains required.
