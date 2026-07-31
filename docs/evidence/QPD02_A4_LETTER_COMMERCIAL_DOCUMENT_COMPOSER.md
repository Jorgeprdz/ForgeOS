# QPD-02 A4 / Letter Commercial Document Composer

Status: `PASS / IMPLEMENTED / GITHUB_ACCEPTED`

Branch: `feature/quote-printable-document-closure`

Commit: `428c6874c3af6d64ed6bdadac9ae3c28633b6b08`

GitHub Actions run: `30593195810`

## Runtime

`advisor-os/quotes/printable/quote-printable-document-composer.js`

## Input

`FORGE_QUOTE_PRINTABLE_READ_MODEL`

The composer rejects any read model that is not in:

`READY_FOR_DOCUMENT_COMPOSITION`

## Output

`FORGE_QUOTE_PRINTABLE_DOCUMENT_HTML`

The output contains:

- self-contained printable HTML;
- A4 and Letter page contracts;
- technical-commercial cover;
- client, advisor, product, folio and acceptance identity;
- quote detail sections;
- projection badges and warnings;
- source authority and source-path table;
- document disclaimers;
- deterministic PDF filename candidate;
- print-safe and screen-preview CSS;
- no external font or network dependency.

## Acceptance

```text
NODE_SYNTAX=PASS
QPD01_CONTRACT=PASS_12_OF_12
QPD02_CONTRACT=PASS_12_OF_12
DIFF_INTEGRITY=PASS
WORKFLOW_CONCLUSION=SUCCESS
```

## Security and action boundary

```text
SELF_CONTAINED=true
SCRIPTS_ALLOWED=false
NETWORK_ALLOWED=false
RECALCULATION_ALLOWED=false
PRINT_EXECUTED=false
PDF_GENERATED=false
PERSISTENCE_WRITTEN=false
AUTOMATIC_SEND_ALLOWED=false
HUMAN_REVIEW_REQUIRED=true
```

The composer escapes user-controlled values and rejects generated output if a script element or network URL appears.

## Not included

- Productive quote-route binding.
- Browser preview workspace.
- Print invocation.
- PDF binary generation.
- Download invocation.
- Persistence or version history.
- Product-specific composition overrides.
- Presentation changes.

## Next

`QPD03_REAL_PDF_GENERATION_AND_DOWNLOAD`
