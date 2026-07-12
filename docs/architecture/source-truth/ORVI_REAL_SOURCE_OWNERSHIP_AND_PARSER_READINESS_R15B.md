# ORVI Real Source Ownership And Parser Readiness R15B

## Canonical decision

- Product Intelligence remains the semantic owner.
- Primary source owner: `UNRESOLVED_PENDING_REAL_ORVI_QUOTE_PDF`.
- Workbook role: `DERIVED_SCENARIO_AND_PROJECTION_EVIDENCE_ONLY`.
- Workbook parser authority: `NO`.
- Parser readiness: `BLOCKED_PENDING_REAL_ORVI_QUOTE_PDF`.
- Privacy status: `TRACKED_WORKBOOK_PRIVACY_REVIEW_REQUIRED`.

## Source hierarchy

1. Real ORVI quote PDF or official structured export, when verified.
2. R15A canonical Product Intelligence model.
3. Authorized parser or source adapter, only after a separate module.
4. Authorized calculation engines.
5. Runtime and renderer consumers.
6. Dashboard and UI consumers.

The tracked workbook is not above the real quote source and is not a contractual source owner.

## Why the workbook is not canonical

The workbook contains multiple product sheets, fixed scenario inputs, formulas, projected UDI growth, UDI-to-MXN calculations, and manual adjustments. That makes it useful for scenario comparison and validation, but unsuitable as universal product truth.

Observed counts are structural only:

- ORVI workbook candidates: `1`.
- Formula cells: `64`.
- Numeric constants: `382`.
- UDI-growth formulas: `2`.
- UDI-to-MXN formulas: `44`.
- Timeline-like rows: `46`.
- Unclassified top-region free-text count: `1`.

No values or text content were recorded.

## PDF readiness

- ORVI candidates: `3`.
- Qualified quote candidates: `0`.
- Best structural score: `7`.
- Parser readiness: `BLOCKED_PENDING_REAL_ORVI_QUOTE_PDF`.

A fingerprint, when present, remains only in the private Termux report.

## Existing extractor status

`orvi-ocr-extractor.js` remains:

- evidence of a prior parsing attempt;
- unsafe as canonical parser because missing values can become zero;
- tied to one product variant;
- capable of retaining client identity;
- not authorized for runtime or Product Intelligence ownership.

## Prohibited

- No client data in committed fixtures.
- No use of the workbook as universal product truth.
- No missing-as-zero.
- No fixed 20-year or age-99 assumption without source evidence.
- No parser implementation in R15B.
- No MXN or recommendation execution.
- No runtime, renderer, dashboard, or UI change.

## Next

`R15B1_ORVI_TRACKED_WORKBOOK_PRIVACY_REMEDIATION_AND_SOURCE_SANITIZATION`
