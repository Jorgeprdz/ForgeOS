# FORGE BETA 2 RELAUNCH 010 — RELEASE DISCOVERY

```text
PHASE=FORGE_BETA2_PRODUCTIVE_COMMERCIAL_LOOP_RELAUNCH
PHASE_NUMBER=010
BASE_SHA=a0c9617921e9a7f8df45492d4ec09a2637098d0a
DISCOVERY_MODE=REUSE_BEFORE_CREATE
```

## Actual production boundary

```text
WHAT_IS_THE_ACTUAL_PRODUCTION_ENTRYPOINT=/ForgeOS/ -> /ForgeOS/static-preview/forge-alive/?nav=inicio
WHAT_WORKFLOW_DEPLOYS_IT=.github/workflows/pages.yml
WHAT_SHA_IS_DEPLOYED=4d824d67f6b4c30aba0f5b887e77b5f1d6289ac8
WHAT_ARTIFACT_IS_PUBLISHED=_site / forge-pages-canonical-only
WHAT_AUTH_BOUNDARY_IS_REQUIRED=GitHub Pages public artifact + runtime Supabase anon configuration; application session/auth remains client session scoped
WHAT_ENVIRONMENT_CONFIG_IS_REQUIRED=SUPABASE_URL + SUPABASE_ANON_KEY unless DEMO_MODE=true; ENABLE_TEST_ADVISOR_LOGIN is explicit public runtime flag
WHAT_IS_THE_ROLLBACK_PATH=explicit human-authorized pages.yml dispatch bound to an approved historical main SHA after main itself is restored/governed to that SHA; no bypass and no arbitrary artifact deployment
```

## Entrypoint and routing

The tracked root `index.html` is a canonical redirector. It retires legacy browser cache/service-worker state and redirects to:

`./static-preview/forge-alive/?nav=inicio`

while preserving query parameters and fragment. The Pages artifact maps the source directory `docs/static-preview/forge-alive-material3/` to the public canonical target `_site/static-preview/forge-alive/`.

Supported product workspaces are the canonical shell destinations exercised by the existing assembly regression pack:

- Home / `inicio`;
- Pipeline;
- Activity;
- Quotes / `cotizaciones`;
- Cartera;
- Income / Ingresos;
- person/client context where exposed through existing canonical relationship routes.

Direct-route/auth restoration is already covered by existing router/auth tests; Phase 010 reuses those tests and does not introduce a second router.

## Production deployer

`.github/workflows/pages.yml` is the single production Pages deployer. Its authorization contract is:

```text
PAGES_DEPLOYMENT_TRIGGER=workflow_dispatch
MAIN_ONLY=YES
EXPECTED_SHA_REQUIRED=YES
EXPLICIT_AUTHORIZATION_REQUIRED=YES
AUTHORIZATION_VALUE=DEPLOY_FORGE_PAGES
REMOTE_MAIN_SHA_RECHECK=YES
MERGE_DOES_NOT_IMPLY_DEPLOY=YES
```

Only the gated deployment job receives `pages: write` and `id-token: write`.

## Artifact construction

The existing Pages workflow:

1. generates `env.js` with only public runtime configuration;
2. runs `scripts/build-advisor-presentation-pages-runtime.mjs`;
3. builds `_site` from tracked public files;
4. copies `docs/static-preview/forge-alive-material3` to the canonical public `static-preview/forge-alive` target;
5. publishes the isolated Quote engine/runtime assets;
6. versions canonical `app.js` with the deploy SHA;
7. writes `build-info.json` and `production-surface.json`;
8. rejects retired UI paths, private evidence and missing required assets;
9. uploads `_site` with `actions/upload-pages-artifact`;
10. deploys with `actions/deploy-pages` only after authorization.

The PR-only `canonical-pages-artifact-validation.yml` already extracts the canonical build/validation programs from `pages.yml`, builds the same `_site` shape in DEMO_MODE and validates public config without deploying. Phase 010 reuses that pattern.

## Current deployment state

Latest successful production Pages run discovered at Phase 010 gate:

```text
RUN_ID=31294184570
RUN_EVENT=workflow_dispatch
RUN_CONCLUSION=success
DEPLOYED_SHA=4d824d67f6b4c30aba0f5b887e77b5f1d6289ac8
MAIN_SHA_AT_DISCOVERY=a0c9617921e9a7f8df45492d4ec09a2637098d0a
DEPLOYMENT_BEHIND_ASSEMBLY=YES
```

This is not a product-truth defect. It is the intentional consequence of the rule `MERGE != DEPLOY`: the assembly phases after the freeze have not yet been production-released.

## Release findings

| Finding | Classification | Beta consequence | Minimum action |
|---|---|---|---|
| production is still freeze SHA `4d824...` while Phase 009 is merged at `a0c961...` | NECESSARY_FOR_CURRENT_PHASE | blocks Beta 2 until authorized post-merge deployment | after Phase010 merge + post-merge RoboCop + human deploy unlock, dispatch existing `pages.yml` with exact merge SHA |
| canonical artifact builder exists and has PR-only validation pattern | NECESSARY_FOR_CURRENT_PHASE | enables safe release candidate validation | reuse, do not create second builder |
| deploy authorization already separates merge from deploy | NECESSARY_FOR_CURRENT_PHASE | constitutional release boundary already correct | preserve unchanged |
| no Beta behavioral event authority matching Phase010 event vocabulary found | BACKLOG_AFTER_ASSEMBLY | automated telemetry unavailable without new architecture | defer implementation; use governed manual feedback protocol |
| existing commercial-loop/auth/RLS/direct-route suites already cover predecessor behavior | NECESSARY_FOR_CURRENT_PHASE | Phase010 can compose acceptance instead of new product engines | reuse in governing workflow |

No critical product defect was proven during discovery.

```text
PRODUCTIVE_RUNTIME_FIX_REQUIRED_BY_DISCOVERY=NO
CRITICAL_ARCHITECTURE_GAP=NO
OBSERVABILITY_IMPLEMENTATION=DEFERRED
REUSE_BEFORE_CREATE_GATE_010=PASS
RELEASE_BOUNDARY_DISCOVERED=YES
```