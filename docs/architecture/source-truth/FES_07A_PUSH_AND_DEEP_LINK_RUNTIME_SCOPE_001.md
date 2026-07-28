# FES 07A Push and Deep Link Runtime Scope 001

## Scope lock

```text
FES_07A_PUSH_AND_DEEP_LINK_RUNTIME_SCOPE=SCOPED
SCOPE_VERSION=FES-07A.1
PARENT_PHASE=FES_07_PUSH_AND_DEEP_LINK_RUNTIME
COMPONENTS=PERMISSION_UX,SUBSCRIPTIONS,SCHEDULER,PUSH,DEEP_LINKS,RETRY,DEDUPLICATION,INTERNAL_FALLBACK
IMPLEMENTATION_REQUIRES_APPROVED_MANIFEST=YES
PUSH_EXECUTION=NO
PERMISSION_PROMPT_EXECUTION=NO
SUBSCRIPTION_REGISTRATION=NO
SERVICE_WORKER_MUTATION=NO
EXTERNAL_PROVIDER_CALL=NO
PRODUCTIVE_UI_MUTATION=NO
NAV_PILL_MUTATION=NO
SUPABASE_REMOTE_MUTATION=NO
DATABASE_MIGRATION=NO
MAIN_MUTATION=NO
FES_07_PUSH_AND_DEEP_LINK_RUNTIME=OPEN
NEXT=FES_07B_PUSH_AND_DEEP_LINK_RUNTIME_IMPLEMENTATION
```

## Permission boundary

Permission UX must explain the capability before any browser or operating-system
prompt. A later implementation requires an explicit user gesture. Automatic
permission prompts, repeated coercive prompts and permission-state fabrication
are forbidden.

## Subscription boundary

A subscription is governed infrastructure state, not commercial or event truth.
Registration and revocation must be explicit, tenant-bound and reversible.
FES 07A performs no registration and stores no endpoint, credential or token.

## Scheduler boundary

A scheduled notification is an intent to surface an internal reminder. It is not
proof that a message was delivered, an appointment occurred or a prospect took
an action. Time zone, due time, deduplication identity and cancellation identity
must be explicit.

## Push payload boundary

Push payloads must be reference-only. Raw names, telephone numbers, WhatsApp
numbers, emails, notes, conversation text, transcripts, credentials, secrets and
provider tokens are forbidden.

## Deep-link boundary

A deep link may resolve only an approved internal target descriptor. Arbitrary
external URLs, script URLs and silently inferred targets are forbidden. Tenant,
target identity and referenced entity must be validated before navigation. A
deep link opens a view; it does not mutate canonical truth, pipeline stage,
Activity, ledger, timeline or projections.

## Retry and deduplication boundary

Retries must be bounded and observable. One delivery intent requires one stable
deduplication identity. Exact replay is deduplicated; conflicting content under
the same identity fails closed.

## Internal fallback boundary

When permission, subscription, provider delivery or target resolution is
unavailable, a later runtime must preserve an explicit internal fallback state.
Fallback may surface attention inside Forge but may not claim external delivery.

## Deferred implementation

FES 07B must publish an exact implementation manifest before changing runtime,
service-worker, notification, scheduler, routing or productive UI files.
Candidate discovery does not authorize mutation.
