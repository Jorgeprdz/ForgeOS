# ORVI PDF Parser Contract R15D

## Decision

- Canonical semantic owner: `product-intelligence`.
- Contract ID: `orvi.solucionline.pdf.parser-contract.v1`.
- Parser implementation: `NOT_IMPLEMENTED_IN_R15D`.
- Real source execution: `NO`.
- Fixtures: `SYNTHETIC_ONLY`.
- Next: `R15E_ORVI_SOLUCIONLINE_PDF_TEXT_PARSER_IMPLEMENTATION_AND_CANONICAL_MAPPING`.

## Contract surfaces

- `product-intelligence/quotes/orvi-pdf-parser-contract.js`
- `fixtures/orvi-solucionline-synthetic-quote.txt`
- `fixtures/orvi-solucionline-synthetic-expected.json`
- `tests/orvi-pdf-parser-contract-test.mjs`

## Parser envelope

The future parser must return a privacy-safe envelope with:

- source and contract identity;
- product type;
- displayed plan label;
- UDI or USD currency;
- positive payment term;
- displayed coverage duration when available;
- non-identifying insured attributes;
- coverage rows;
- recommended-benefit rows;
- displayed premium totals;
- reconciliation status;
- seven-column guaranteed-value timeline;
- glossary and notes;
- source trace and confidence;
- privacy and ownership boundaries.

## Stateful values

Every monetary or displayed field uses an explicit state:

- `numeric`;
- `explicit_zero`;
- `sin_costo`;
- `amparado`;
- `missing`;
- `unreadable`;
- `not_applicable`.

Rules:

- `explicit_zero` requires numeric value `0`.
- Non-numeric states require `value: null`.
- Missing may not become zero.
- `SIN COSTO` may not silently become zero.
- `Amparado` may not become a numeric sum assured.
- Units must match the displayed document currency.

## Dynamic variant boundary

- Currency is not hardcoded to UDI.
- Payment term is not hardcoded to 20.
- The synthetic fixture deliberately uses USD and 10 payments.
- Common owner-described variants such as 6, 10, 15, and 20 payments are downstream interpretation, not parser defaults.
- The parser must capture what the source displays.

## Arithmetic boundary

The parser contract stores:

- displayed source total;
- visible line-item sum;
- reconciliation status;
- `source_total_preserved: true`;
- `recomputed_override_applied: false`.

The parser may flag a mismatch but may not replace the displayed source value.

## Privacy boundary

Forbidden parser-envelope fields include client, insured, policyholder, or advisor names; email; phone; date of birth; CURP; RFC; local PDF path; and real source fingerprint.

The committed fixtures:

- contain three synthetic text pages;
- contain no identity or contact information;
- use invented values;
- do not reproduce the real ORVI plan variant or real quote values;
- are not contractual examples.

## Canonical mapping contract

The contract declares field destinations in R15A Product Intelligence but does not execute mapping. The future parser module must map only validated fields and preserve provenance.

## Parked dashboard interpretation

For later modules only:

- protection and guaranteed recovery are separate dashboard views;
- recovery checkpoints derive from payment term and existing timeline years;
- cumulative paid, recovery difference, and recovery ratio must be auditable;
- future MXN equivalents for sum assured or guaranteed values are projections;
- no automatic cancel/continue recommendation is allowed.

## Prohibited in R15D

- Real PDF execution.
- Parser implementation.
- OCR fallback.
- Product adapter.
- Engine execution.
- Currency projection.
- Runtime or UI integration.

## Next

`R15E_ORVI_SOLUCIONLINE_PDF_TEXT_PARSER_IMPLEMENTATION_AND_CANONICAL_MAPPING`
