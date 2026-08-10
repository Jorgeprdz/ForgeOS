# FORGE BETA 2 CANONICAL AURA CUTOVER HOTFIX 010H

```text
PHASE=FORGE_BETA2_CANONICAL_AURA_CUTOVER_HOTFIX
PHASE_NUMBER=010H
PARENT_PHASE=FORGE_BETA2_PRODUCTIVE_COMMERCIAL_LOOP_RELAUNCH_010
RELEASE_IDENTITY=FORGE_BETA_2_PRODUCTIVE_COMMERCIAL_LOOP
HOTFIX_IDENTITY=FORGE_BETA2_CANONICAL_AURA_CUTOVER_010H
BASE_SHA=6108003a20823af7de17f8acf7f2361226c6ac47
BRANCH=hotfix/forge-beta2-canonical-aura-cutover-010h
FINAL_HEAD=EXACT_PR_HEAD_VERIFIED_BY_FINAL_GOVERNING_RUN
```

## Incident / human acceptance finding

Phase 010 merged and the exact main SHA `6108003a20823af7de17f8acf7f2361226c6ac47` was successfully deployed by Pages run `31357012645`.

Human post-deploy acceptance then found that the public root still opened the pre-Aura Forge Alive shell.

```text
AURA_PUBLISHED=YES
ROOT_POINTS_TO_AURA=NO
BETA2_CANONICAL_CUTOVER=FAIL
FORGE_BETA2_RELAUNCH=NOT_YET_GO
```

The previous root contract was:

```text
/ForgeOS/
  -> /ForgeOS/static-preview/forge-alive/?nav=inicio
```

The intended Beta 2 presentation authority already existed at:

```text
/ForgeOS/static-preview/forge-aura/
RUNTIME=FORGE_AURA_LIGHT_2026_V4
```

## Constitutional / ADR gate

The hotfix inherits and rechecks the ratified Phase 010 authority stack:

- Article 0 remains the highest authority.
- `FORGE_CONSTITUTION_V3.md` and the LOCKED Constitution Map remain binding.
- `FORGE_PRODUCT_ASSEMBLY_INSTRUCTION_001` is `LOCKED_PLANNING_AUTHORITY` and explicitly forbids a fourth rebuild while allowing bounded critical production bug fixes.
- ADR-020 remains applicable to shell/navigation execution boundaries.
- ADR-024 is `RATIFIED / CANONICAL / ACTIVE / LOCKED` and establishes Forge Aura Light 2026 as the canonical visual design authority.
- Existing auth, identity, evidence, Policy, Payment, Compensation, Product, RLS and human-decision authorities remain unchanged.

```text
CONSTITUTIONAL_GATE_010H=PASS
ADR_GATE_010H=PASS
REUSE_BEFORE_CREATE_GATE_010H=PASS
FOURTH_REBUILD_AUTHORIZED=NO
NEW_ADR_CREATED=0
ADR_CONFLICTS_UNRESOLVED=0
```

## Discovery result

```text
ROOT_ENTRY_AUTHORITY=index.html
PAGES_DEPLOYER=.github/workflows/pages.yml
AURA_PUBLIC_PATH=static-preview/forge-aura/
AURA_RUNTIME=FORGE_AURA_LIGHT_2026_V4
AURA_ROUTER=docs/static-preview/forge-aura/aura-router-v4.js
AURA_AUTH=docs/static-preview/forge-aura/aura-auth-v4.js
AURA_OAUTH_CALLBACK=docs/static-preview/forge-aura/oauth-callback-v4.js
SHARED_RUNTIME_SOURCE=docs/static-preview/forge-alive-material3/
SHARED_RUNTIME_PUBLIC_PATH=static-preview/forge-alive/
```

Aura already natively owns routes for:

```text
inicio
pipeline
actividad
cartera
comisiones
cotizaciones
```

`app-v4-r1.js` already binds the legacy-looking Quotes link to Aura's native `cotizaciones` route at runtime. No new router or Quotes engine is required.

### Boundary classification

```text
CANONICAL_PRESENTATION_SURFACE=FORGE_AURA_LIGHT_2026
FORGE_ALIVE_CLASSIFICATION=SHARED_RUNTIME_DEPENDENCY+RETIRED_ENTRYPOINT
```

Forge Alive assets remain published only because Aura still imports accepted productive runtime assets from that namespace. That dependency does not grant Forge Alive presentation authority.

## Implementation decision

The bounded hotfix performs only the canonical presentation / navigation cutover:

1. `index.html`
   - changes the public root target from `static-preview/forge-alive/` to `static-preview/forge-aura/`;
   - preserves query parameters and fragment;
   - defaults to `route=inicio` only when neither `route` nor `nav` is supplied;
   - preserves the governed `auth_return` cache-bust contract (`v=auth-<auth_return>`) on relogin;
   - retains legacy service-worker/cache retirement;
   - removes the stale `canonical-production-20260804` identity.

2. `.github/workflows/pages.yml`
   - preserves the explicit human `workflow_dispatch` + exact-SHA deploy contract unchanged;
   - preserves Forge Alive as the shared productive runtime namespace;
   - changes `production-surface.json.canonicalEntry` to `static-preview/forge-aura/index.html`;
   - records `sharedRuntime=static-preview/forge-alive/` explicitly;
   - redirects standalone Quotes engine entry back to Aura `?route=cotizaciones` instead of Forge Alive;
   - requires Aura index/bootstrap/auth/shell assets in the Pages artifact;
   - validates root -> Aura and rejects the old root -> Forge Alive target.

3. `docs/static-preview/forge-aura/aura-router-v4.js`
   - reuses the existing Aura router; no new routing authority is created;
   - when an explicit productive route is forced through unauthenticated `route=login`, carries that route only as transient `return_route`;
   - allows the existing Google OAuth callback builder to recover that transient route;
   - removes `return_route` again when the authenticated productive route is restored;
   - changes no Supabase provider, session, credential, identity or domain semantics.

4. `tests/auth-relogin-canonical-return-test.mjs`
   - updates the inherited root-entry expectation from Forge Alive to Forge Aura;
   - preserves OAuth parameters, route, hash and `auth_return` versioning assertions;
   - reclassifies Forge Alive auth assertions as shared-runtime compatibility rather than canonical presentation authority.

5. Hotfix-only acceptance files
   - static contract test, including Google OAuth deep-route continuity;
   - Pages-artifact Playwright config;
   - desktop/mobile/OAuth deep-route browser acceptance;
   - governing RoboCop 010H workflow;
   - this evidence record.

## Expected bounded diff

```text
index.html
.github/workflows/pages.yml
.github/workflows/forge-beta2-canonical-aura-cutover-010h.yml
docs/static-preview/forge-aura/aura-router-v4.js
tests/auth-relogin-canonical-return-test.mjs
tests/forge-beta2-canonical-aura-cutover-010h.test.mjs
tests/aura010h-playwright.config.mjs
tests/e2e/forge-beta2-canonical-aura-cutover-010h.spec.mjs
docs/evidence/FORGE_BETA2_CANONICAL_AURA_CUTOVER_010H.md
```

No productive domain file is authorized outside this list.

## Auth preservation

Aura's existing router and auth implementation remain the authority:

- direct routes accept `route` and legacy-compatible `nav` query parameters;
- OAuth callback is `oauth-callback-v4.html`;
- an explicit productive route is carried across unauthenticated login as transient `return_route`;
- Google callback receives the same valid `return_route` and the callback already returns to that route after session establishment;
- `return_route` is scrubbed from the productive URL after restoration;
- session restore remains `createAuraAuth().restore()`;
- logout remains the existing Aura auth flow;
- root relogin keeps `auth_return` cache-bust versioning;
- no Supabase configuration, provider choice, credential handling or identity semantics are changed.

Expected governing acceptance:

```text
AURA_AUTH_ENTRY=PASS
AURA_AUTH_CALLBACK=PASS
AURA_SESSION_RESTORE=PASS
AURA_LOGOUT=PASS
AURA_GOOGLE_OAUTH_RETURN_ROUTE=PASS
DEEP_LINK_RELOAD=PASS
```

## Commercial-loop smoke scope

No commercial engine is recertified or modified. The governing workflow reuses accepted suites that cover the connected Aura/productive loop and the module-specific Phase 8/9 contracts.

Expected:

```text
AURA_HOME_LOAD=PASS
AURA_PIPELINE_LOAD=PASS
AURA_QUOTES_LOAD=PASS
AURA_ACTIVITY_LOAD=PASS
AURA_CARTERA_LOAD=PASS
AURA_INCOME_LOAD=PASS
COMMERCIAL_LOOP_SMOKE=PASS
```

## Pages artifact acceptance

The governing CI builds `_site` using the production Pages builder with `DEMO_MODE=false`, the canonical public Supabase project hostname and a non-secret synthetic CI key. This satisfies the production-mode public-config validator without reading or changing production secrets.

Expected:

```text
AURA_INDEX_PRESENT=PASS
AURA_BOOTSTRAP_PRESENT=PASS
AURA_CSS_PRESENT=PASS
AURA_AUTH_PRESENT=PASS
AURA_MODULES_PRESENT=PASS
AURA_DEPENDENCY_GRAPH_CLOSED=PASS
NO_PRIVATE_EVIDENCE_PUBLISHED=PASS
NO_TEST_ARTIFACTS_PUBLISHED=PASS
PAGES_AURA_CANONICAL_BOUNDARY=PASS
FORGE_ALIVE_REQUIRED_RUNTIME_PRESERVED=PASS
```

The production deploy gates remain mandatory and unchanged:

```text
PAGES_MAIN_REF_GUARD
PAGES_EXPLICIT_AUTHORIZATION
PAGES_EXPECTED_SHA_MATCH
PAGES_REMOTE_MAIN_SHA_MATCH
AUTHORIZATION_VALUE=DEPLOY_FORGE_PAGES
MERGE != DEPLOY
```

## Browser acceptance

The 010H browser suite runs against the built `_site` Pages artifact rather than the repository source tree. It verifies:

- actual public root redirect to Aura;
- Aura runtime marker and anonymous login presentation;
- local critical 404s and page errors;
- 390px horizontal overflow;
- legacy `nav=cotizaciones` ingress into Aura;
- transient `route=login&return_route=cotizaciones` while unauthenticated;
- Google OAuth `redirectTo` targets Aura callback with `return_route=cotizaciones`.

The URL convergence assertion uses stable URL polling instead of Playwright navigation-event waiting because the root intentionally combines a fallback meta refresh with governed JavaScript replacement; this avoids a false `ERR_ABORTED` race while still asserting the final Aura URL and runtime marker.

Expected:

```text
BROWSER_E2E_390=PASS
BROWSER_E2E_DESKTOP=PASS
ROOT_CANONICAL_ENTRY=AURA
ROOT_TO_AURA=PASS
AURA_DIRECT_ENTRY=PASS
AURA_GOOGLE_OAUTH_RETURN_ROUTE=PASS
RUNTIME_ERRORS=0
CRITICAL_404=0
RESPONSIVE_ACCEPTANCE=PASS
```

## Governing run diagnoses before final acceptance

### Run `31358002396`

Correctly blocked before merge. Authority, bounded static contracts and commercial-loop smoke passed. Two CI-contract mismatches were found:

1. inherited `auth-relogin-canonical-return-test.mjs` still expected the public root to resolve to Forge Alive;
2. the 010H Pages harness generated `DEMO_MODE=true` while the production validator correctly expects `false` unless explicitly told otherwise.

Both were corrected inside the permitted acceptance/release boundary.

### Browser harness follow-up

A later exact-head run reached `browser-e2e` but the Playwright web server served `tests/_site` instead of repository-root `_site`; the harness path was corrected from `_site` to `../_site`. No production code was changed for that harness failure.

### Browser semantic follow-up

Subsequent Chromium execution proved desktop root -> Aura and exposed two distinctions:

1. `page.waitForURL()` can observe an intentional root replacement as `ERR_ABORTED`; the stable acceptance is final URL + Aura runtime marker, so the harness now polls the resulting URL;
2. unauthenticated deep routes correctly show `route=login`; while investigating the expected post-auth restoration, Google OAuth was found to need the transient `return_route` carried through that login URL. The existing Aura router was minimally extended to preserve and then scrub that route.

No run before the exact final HEAD may unlock merge.

## Legacy scoped workflow note

The independent `SeguBeca Pages Authority Asset` workflow can fail on this PR at its own bounded-path verification because its whitelist only permits files from the historical SeguBeca Pages hotfix. Example observed failure:

```text
SEGUBECA_PAGES_UNAUTHORIZED_PATH=.github/workflows/forge-beta2-canonical-aura-cutover-010h.yml
```

This is a scoped legacy bounded-diff false-positive for unrelated 010H files. The SeguBeca authority/formula checks do not run after that whitelist stop. 010H does not weaken or modify that historical whitelist merely to make the unrelated workflow green.

## Mutation seal

```text
NEW_ENGINE_CREATED=0
NEW_GLOBAL_SCORE_CREATED=0
NEW_GLOBAL_PRIORITY_FORMULA_CREATED=0
DUPLICATE_TRUTH_OWNER_CREATED=0
DUPLICATE_IDENTITY_OWNER_CREATED=0
DUPLICATE_POLICY_OWNER_CREATED=0
DUPLICATE_PAYMENT_OWNER_CREATED=0
DUPLICATE_COMPENSATION_OWNER_CREATED=0
DATABASE_MUTATION=0
SCHEMA_MUTATION=0
RLS_MUTATION=0
SUPABASE_DOMAIN_MUTATION=0
AUTO_IDENTITY_MERGE=0
AUTONOMOUS_COMMERCIAL_EXECUTION=0
PRODUCTIVE_DOMAIN_MUTATION=0
PRODUCTIVE_RUNTIME_MUTATION=1_PRESENTATION_DISTRIBUTION_AND_AUTH_RETURN_ROUTE_BOUNDARY_ONLY
```

The non-zero runtime mutation is limited to which already-existing UI the production entrypoint opens, the isolated Quotes return route, and transient preservation of an already-existing Aura route across login/OAuth. It changes no business truth, persistence, domain computation, scoring, economic semantics, auth provider or identity authority.

## Pre-merge release state

```text
FORGE_ALIVE_ROOT_ENTRY_RETIRED=IMPLEMENTED_PENDING_CI
FORGE_ALIVE_REQUIRED_RUNTIME_PRESERVED=IMPLEMENTED_PENDING_CI
ROOT_CANONICAL_ENTRY=AURA_PENDING_CI
ROOT_TO_AURA=IMPLEMENTED_PENDING_CI
PAGES_AURA_CANONICAL_BOUNDARY=IMPLEMENTED_PENDING_CI
AURA_GOOGLE_OAUTH_RETURN_ROUTE=IMPLEMENTED_PENDING_CI

AUTO_MERGE=NO
AUTO_DEPLOY=NO
HOTFIX_TECHNICAL_ACCEPTANCE_COMPLETE=PENDING_FINAL_ROBOCOP_010H
HUMAN_REVIEW_CHECKPOINT=PENDING_FINAL_ROBOCOP_010H
MERGE_READY=NO_PENDING_FINAL_ROBOCOP_010H
```

No merge or production deploy is authorized by this evidence file.

## Final gate contract

The exact final PR HEAD must complete the governing workflow with:

```text
FINAL_ROBOCOP_010H=PASS
ROBOCOP_RELEASE_LOCK=GREEN
HOTFIX_TECHNICAL_ACCEPTANCE_COMPLETE=YES
HUMAN_REVIEW_CHECKPOINT=READY
MERGE_READY=YES
AUTO_MERGE=NO
AUTO_DEPLOY=NO
```

After a separate human-authorized merge and exact-SHA Pages deployment, post-deploy acceptance must prove:

```text
PRODUCTION_ROOT=AURA
PRODUCTION_FORGE_ALIVE_LEGACY_ENTRY=NOT_CANONICAL
PRODUCTION_SHA_MATCH=PASS
PRODUCTION_AUTH=PASS
PRODUCTION_NAVIGATION=PASS
PRODUCTION_RUNTIME_ERRORS=0
BETA2_CANONICAL_CUTOVER=PASS
PRODUCTION_BETA2_DEPLOYED=YES
FORGE_BETA2_RELAUNCH=GO
```

Until then, the earlier Beta 2 certificate remains:

```text
SUPERSEDED_PENDING_CANONICAL_CUTOVER
```
