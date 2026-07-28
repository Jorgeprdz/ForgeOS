# FES 07B Push and Deep Link Runtime Implementation Manifest 001

```text
FES_07B_PUSH_AND_DEEP_LINK_RUNTIME_IMPLEMENTATION_MANIFEST=APPROVED
MANIFEST_VERSION=FES-07B.1
SOURCE_SCOPE=FES_07A_PUSH_AND_DEEP_LINK_RUNTIME_SCOPE
RUNTIME_FILES=1
RUNTIME_FILE_1=platform/event-evidence/push-deep-link-runtime.js
TEST_FILES=1
TEST_FILE_1=tests/fes-07b-push-deep-link-runtime-implementation-test.mjs
RUNTIME_MODE=LOCAL_PURE_REFERENCE_ONLY
PERMISSION_EXPLANATION=YES
INTERNAL_TARGET_RESOLUTION=YES
SCHEDULER_INTENT_MODEL=YES
RETRY_MODEL=BOUNDED
DEDUPLICATION=DETERMINISTIC
INTERNAL_FALLBACK=EXPLICIT
PUSH_EXECUTION=NO
PERMISSION_PROMPT_EXECUTION=NO
SUBSCRIPTION_REGISTRATION=NO
SERVICE_WORKER_MUTATION=NO
EXTERNAL_PROVIDER_CALL=NO
DELIVERY_CLAIM=NO
PRODUCTIVE_UI_MUTATION=NO
NAV_PILL_MUTATION=NO
SUPABASE_REMOTE_MUTATION=NO
DATABASE_MIGRATION=NO
MAIN_MUTATION=NO
```

Only the listed runtime and test files are authorized for implementation
mutation. The runtime models local intent, retry, deduplication, internal target
resolution and fallback. It does not request permission, register subscriptions,
install service workers, contact providers, navigate the browser or claim
delivery.
