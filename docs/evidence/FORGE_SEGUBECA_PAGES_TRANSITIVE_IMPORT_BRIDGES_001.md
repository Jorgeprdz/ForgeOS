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
