# ORVI Tracked Workbook Privacy Remediation R15B1

## Decision

`PASS_R15B1_ORVI_TRACKED_WORKBOOK_PRIVACY_REMEDIATION_AND_SOURCE_SANITIZATION`

The tracked workbook remains derived scenario and projection evidence. It does not gain parser authority or canonical product-truth ownership.

## Repair boundary

- One identity-like shared string was isolated in the merged ORVI header.
- It had one workbook usage.
- It had zero formula references.
- It was replaced by the neutral label `ORVI`.
- No private value was printed, documented, or committed.
- Only the shared-string XML part changed inside the workbook package.

## Structural preservation

- Formula count before and after: `64`.
- Timeline-like rows before and after: `46`.
- Formula references to the repaired header: `0`.
- Remaining private occurrences: `0`.
- ZIP integrity: required PASS.
- Regression test: `tests/orvi-tracked-workbook-privacy-sanitization-test.py`.

## Authority remains unchanged

- Product Intelligence: canonical semantic owner.
- Workbook: derived evidence only.
- Workbook parser authority: `NO`.
- Legacy extractor parser authority: `NO`.
- Primary real source: unresolved pending a qualified ORVI quote PDF.
- Parser, source adapter, runtime, MXN wiring, renderer, dashboard, and UI: not implemented here.

## Next

`R15C_ORVI_REAL_QUOTE_PDF_SOURCE_INTAKE`
