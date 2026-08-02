# Forge SeguBeca Pages Authority Asset Hotfix 001

## Diagnosis

`SEGUBECA_PUBLIC_REAL_PDF_ACCEPTANCE=FAIL_MISSING_OR_UNREACHABLE_PUBLIC_AUTHORITY_ASSET`

The controlled merge of PR #155 and canonical Pages deployment both succeeded at commit:

```text
MERGE_SHA=dd10e5d13e693669f728e590a7132dda9f6d976b
PAGES_CANONICAL=SUCCESS
PUBLIC_BUILD_INFO_SHA=dd10e5d13e693669f728e590a7132dda9f6d976b
```

The repository browser acceptance also succeeded. The first post-deployment browser acceptance uploaded no PDF because the public Quotes module did not mount its productive file selector.

The productive source binding imports:

```text
../../../advisor-os/quotes/products/segubeca/segubeca-calculation-authority.js
```

That path is correct from the repository source layout. When copied verbatim to the canonical project Pages URL, however, it resolves outside the `/ForgeOS` project root:

```text
SOURCE_LAYOUT_PUBLIC_RESOLUTION=/advisor-os/quotes/products/segubeca/segubeca-calculation-authority.js
REQUIRED_PROJECT_RESOLUTION=/ForgeOS/advisor-os/quotes/products/segubeca/segubeca-calculation-authority.js
```

The Pages artifact builders also omitted the accepted SeguBeca authority. The dynamic import failed and the Quotes module entered its governed error state.

## Hotfix

Both artifact builders now publish and require the exact accepted authority source:

```text
SOURCE=advisor-os/quotes/products/segubeca/segubeca-calculation-authority.js
PUBLIC_ARTIFACT=_site/advisor-os/quotes/products/segubeca/segubeca-calculation-authority.js
```

After copying the unchanged Material 3 source, each builder rewrites only the generated artifact import:

```text
SOURCE_IMPORT=../../../advisor-os/quotes/products/segubeca/segubeca-calculation-authority.js
PUBLIC_ARTIFACT_IMPORT=../../advisor-os/quotes/products/segubeca/segubeca-calculation-authority.js
SOURCE_BINDING_MUTATED=NO
```

The canonical workflow validates both the generated asset and project-relative import:

```text
AUTHORITY=SEGUBECA_ACCEPTED_PRODUCT_CALCULATION
ENTRYPOINT=calculateFromAcceptedPacket
PUBLIC_IMPORT_STAYS_INSIDE_FORGEOS=YES
```

## Boundaries

```text
PRODUCT_FORMULA_CHANGED=NO
CALCULATION_AUTHORITY_CHANGED=NO
PRODUCTIVE_BINDING_SOURCE_CHANGED=NO
GENERATED_ARTIFACT_IMPORT_REWRITTEN=YES
PRODUCT_UI_CHANGED=NO
PDF_PARSER_CHANGED=NO
UDI_MODEL_CHANGED=NO
DATABASE_CHANGED=NO
SUPABASE_CHANGED=NO
```

This pass changes publication and generated-path resolution only. It does not copy, fork or reimplement the authority.

## Required closure

```text
CANONICAL_ARTIFACT_BUILD=PASS_REQUIRED
ALTERNATE_QUOTES_ARTIFACT_BUILD=PASS_REQUIRED
SEGUBECA_AUTHORITY_ASSET_PRESENT=PASS_REQUIRED
SEGUBECA_PROJECT_RELATIVE_IMPORT=PASS_REQUIRED
SEGUBECA_LOCAL_REAL_PDF=PASS_REQUIRED
POST_MERGE_PAGES_SHA=PASS_REQUIRED
POST_MERGE_PUBLIC_REAL_PDF=PASS_REQUIRED
HUMAN_CONFIRMATION=REQUIRED
```

The public acceptance must remain failed until a post-hotfix deployment accepts the generated `%PDF-1.4` through the real public selector and preserves the promoted SeguBeca authority after explicit human confirmation.
