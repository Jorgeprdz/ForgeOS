# Forge SeguBeca Pages Transitive Import Bridges 001

## Diagnosis

PR #160 was merged and canonical Pages successfully published:

```text
MERGE_SHA=62509638c625790b72eac2ea26c325fb6f75c688
PAGES_CANONICAL=SUCCESS
PUBLIC_BUILD_INFO_SHA=62509638c625790b72eac2ea26c325fb6f75c688
PUBLIC_AUTHORITY_ASSET=PASS
PUBLIC_BINDING_PROJECT_IMPORT=PASS
```

The post-merge real-PDF browser acceptance still did not mount the productive file selector. The accepted calculation authority remained reachable as text, but its three canonical source imports resolved under a public namespace that the artifact did not provide:

```text
PUBLIC_AUTHORITY=/ForgeOS/advisor-os/quotes/products/segubeca/segubeca-calculation-authority.js
CANONICAL_DEPENDENCY_PREFIX=../../../../docs/static-preview/quote-preview-live/
RESOLVED_PUBLIC_PREFIX=/ForgeOS/docs/static-preview/quote-preview-live/
EXISTING_PUBLIC_RUNTIME_PREFIX=/ForgeOS/static-preview/quote-preview-live/
```

The affected modules are:

```text
forge-pdf-browser-parser.js
forge-accepted-quote-adapter.js
forge-udi-mxn-runtime.js
```

## Hotfix

Three logic-free compatibility modules are added under the nested source namespace:

```text
docs/docs/static-preview/quote-preview-live/
```

The existing Pages builders strip the first `docs/` segment, so these files publish to:

```text
/ForgeOS/docs/static-preview/quote-preview-live/
```

Each file contains only one re-export to the already published canonical browser runtime:

```js
export * from "../../../static-preview/quote-preview-live/<module>.js";
```

This preserves the authority's canonical repository imports while making the same imports resolvable in the GitHub Pages project-root layout.

## Review 4 confirmation ownership closure

The generated Pages artifact reached the productive SeguBeca projection and enabled the human confirmation control, but the same click was being handled twice:

```text
CAPTURE_LISTENER_CONFIRMATION=ACTIVE
MATERIAL3_BUTTON_CONFIRMATION=ACTIVE
RESULT=CONCURRENT_CONFIRMATION_TRANSITIONS
```

Review 4 leaves the Material 3 button as the single owner of the governed confirmation. The capture listener now only installs the accepted confirmation delegate and records delegation evidence; it does not execute a second confirmation.

```text
SEGUBECA_CONFIRMATION_OWNER=MATERIAL3_QUOTE_RESULT_ADAPTER
SEGUBECA_CAPTURE_LISTENER=DELEGATE_ONLY
DUPLICATE_CONFIRMATION_TRANSITION=REMOVED
HUMAN_CONFIRMATION=REQUIRED
AUTOMATIC_ACCEPTANCE=NO
```

The first rerun proved that a second synchronous boundary remained inside the accepted-event stack. The printable-state handoff was traversing bridge wrappers and refreshing printable state while `forge:accepted-quote-confirmed` was still being dispatched. Review 4 now defers that reconciliation to the next animation frame.

```text
PRINTABLE_HANDOFF_RECONCILIATION=DEFERRED
ACCEPTED_EVENT_STACK_REENTRY=FORBIDDEN
PRINTABLE_REFRESH_AFTER_CONFIRMATION=ASYNC_FRAME
```

The next rerun proved that the click still starved the browser main thread. M05E-005 used a document-wide MutationObserver whose callback scheduled `refresh()` through `queueMicrotask()`, while `refresh()` rewrote attributes observed by that same observer. Review 4 now coalesces refreshes on animation frames and makes observed attribute writes idempotent.

```text
M05E005_REFRESH_SCHEDULER=ANIMATION_FRAME
M05E005_OBSERVED_WRITES=IDEMPOTENT
MUTATION_MICROTASK_STARVATION=REMOVED
```

A further rerun kept failing before the asynchronous confirmation handler could return. M05Y was still traversing the accepted-quote bridge synchronously from the capture phase of the same click. Review 4 now persists identity from input/change state and defers final reconciliation outside the confirmation event stack.

```text
M05Y_CONFIRMATION_CAPTURE_WRITE=REMOVED
M05Y_IDENTITY_RECONCILIATION=ANIMATION_FRAME
M05Y_ACCEPTED_EVENT_PERSISTENCE=DEFERRED
```

No calculation, contractual value, PDF extraction, projection, persistence or mutation authority changed.

## Boundaries

```text
CALCULATION_AUTHORITY_CHANGED=NO
PRODUCT_FORMULA_CHANGED=NO
PRODUCTIVE_BINDING_CHANGED=NO
PDF_PARSER_CHANGED=NO
ACCEPTED_QUOTE_ADAPTER_CHANGED=NO
UDI_MODEL_CHANGED=NO
PRODUCT_UI_CHANGED=NO
PAGES_BUILDER_CHANGED=NO
DATABASE_CHANGED=NO
SUPABASE_CHANGED=NO
BRIDGE_LOGIC=REEXPORT_ONLY
```

No formula, contractual value, projection, confirmation rule, mutation authority or persistence behavior is introduced.

## Required acceptance

```text
STATIC_PUBLIC_URL_RESOLUTION=PASS_REQUIRED
NESTED_DOCS_ARTIFACT_PUBLICATION=PASS_REQUIRED
GENERATED_PAGES_REAL_PDF=PASS_REQUIRED
SEGUBECA_ACCEPTED_AUTHORITY_REGRESSION=PASS_REQUIRED
REP_17=PASS_REQUIRED
POST_MERGE_PAGES_SHA=PASS_REQUIRED
POST_MERGE_PUBLIC_REAL_PDF=PASS_REQUIRED
HUMAN_CONFIRMATION=REQUIRED
AUTOMATIC_ACCEPTANCE=NO
QUOTE_MUTATION=NOT_AUTHORIZED
CRM_MUTATION=NOT_AUTHORIZED
```
