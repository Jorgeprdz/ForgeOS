# QPD-01 Canonical Quote Printable Read Model

Status: `PASS / IMPLEMENTED / GITHUB_ACCEPTED`

Branch: `feature/quote-printable-document-closure`

Commit: `6bad030eac2c0ee0f9c708d4150c4219b5258604`

GitHub Actions run: `30592977874`

## Implemented

- Canonical printable quote read model.
- Accepted Quote Review Snapshot input validation.
- Accepted Quote, calculation and Product Intelligence authority separation.
- Deterministic document/source revision identity.
- A4 and Letter composition readiness.
- Required-field review gate.
- Explicit `UNAVAILABLE` state for missing facts.
- Projection classification and warning.
- Raw PDF and binary-key rejection.
- Deep immutability.
- Default-false effect and mutation safety flags.

## Runtime

`advisor-os/quotes/printable/quote-printable-read-model.js`

## Contract test

`advisor-os/quotes/tests/quote-printable-read-model-master-test.js`

Coverage:

1. valid snapshot projection;
2. client/advisor/product identity;
3. money value, unit, source and authority;
4. projection classification;
5. A4/Letter document metadata;
6. no calculation, mutation, persistence or export;
7. deep immutability;
8. deterministic identity;
9. missing facts remain unavailable;
10. candidate money is not promoted as fact;
11. raw PDF rejection;
12. fail-closed source validation.

## Acceptance

```text
NODE_SYNTAX=PASS
QPD01_CONTRACT=PASS_12_OF_12
DIFF_INTEGRITY=PASS
WORKFLOW_CONCLUSION=SUCCESS
```

The first workflow run correctly exposed a test that attempted to sort a deeply frozen array in place. The test was repaired to copy before sorting. A second gate confirmed the contract and repository diff.

## Safety

```text
FACTS_EDITABLE=false
RECALCULATION_ALLOWED=false
PRODUCT_MUTATION_ALLOWED=false
QUOTE_MUTATION_ALLOWED=false
RAW_PDF_ALLOWED=false
AUTOMATIC_SEND_ALLOWED=false
CRM_MUTATION_ALLOWED=false
POLICY_MUTATION_ALLOWED=false
TASK_CREATION_ALLOWED=false
CALENDAR_CREATION_ALLOWED=false
PDF_GENERATED=false
PRINT_EXECUTED=false
PERSISTENCE_WRITTEN=false
HUMAN_REVIEW_REQUIRED=true
```

## Not included

- HTML or CSS composition.
- Browser print.
- PDF generation.
- Download.
- Persistence.
- Supabase mutation.
- Product-specific templates.
- Presentation changes.

## Next

`QPD02_A4_LETTER_COMMERCIAL_DOCUMENT_COMPOSER`
