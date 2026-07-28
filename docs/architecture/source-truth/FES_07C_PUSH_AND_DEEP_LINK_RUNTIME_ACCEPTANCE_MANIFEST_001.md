# FES 07C Push and Deep Link Runtime Acceptance Manifest 001

```text
FES_07C_PUSH_AND_DEEP_LINK_RUNTIME_ACCEPTANCE_MANIFEST=APPROVED
MANIFEST_VERSION=FES-07C.1
SOURCE_IMPLEMENTATION_COMMIT=1bca0ed6f743ab4f12853304254fed5a90700520
ACCEPTANCE_MODE=ISOLATED_LOCAL_RUNTIME_AND_BROWSER_FIXTURE
RUNTIME_MUTATION=NO
PRODUCTIVE_UI_BINDING=NO
PRODUCTIVE_UI_MUTATION=NO
NAV_PILL_MUTATION=NO
PUSH_EXECUTION=NO
PERMISSION_PROMPT_EXECUTION=NO
SUBSCRIPTION_REGISTRATION=NO
SERVICE_WORKER_MUTATION=NO
EXTERNAL_PROVIDER_CALL=NO
DELIVERY_CLAIM=NO
CANONICAL_TRUTH_MUTATION=NO
SUPABASE_REMOTE_MUTATION=NO
DATABASE_MIGRATION=NO
MAIN_MUTATION=NO
```

Authorized acceptance surfaces:

- `tests/fes-07c-push-deep-link-runtime-acceptance-test.mjs`
- `tests/e2e/fes-07c-push-deep-link-runtime-acceptance.spec.mjs`
- `tests/e2e/fixtures/fes07c-push-deep-link-runtime/index.html`
- `playwright.fes07c.config.mjs`
- the FES 07C script entry in `package.json`
- the FES 07C acceptance and artifact steps in
  `.github/workflows/fes-event-evidence-ci.yml`
- FES 07C evidence, closure and synchronized FES source-truth, Build Tree and
  Roadmap blocks.

The browser fixture may load only the existing FES 07B pure local runtime. It
must not bind to Forge Alive, prompt for permission, register a service worker
or subscription, navigate, call an external provider, create canonical events
or mutate a productive surface.
