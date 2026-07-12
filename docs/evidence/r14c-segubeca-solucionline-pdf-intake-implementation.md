# R14C SeguBeca Solucionline PDF Intake Implementation Evidence

## Decision

`PASS_R14C_SEGUBECA_SOLUCIONLINE_PDF_INTAKE_IMPLEMENTATION`

R14C implements a Solucionline SeguBeca PDF parser and routes detected SeguBeca PDFs into an accepted quote packet with Product Intelligence benefit-summary blocks consumed by the R14A SeguBeca dashboard adapter.

## Files changed

| File | Reason |
| --- | --- |
| `docs/static-preview/quote-preview-live/forge-segubeca-solucionline-parser.js` | New sanitized parser for Solucionline SeguBeca text surfaces. |
| `docs/static-preview/quote-preview-live/forge-pdf-browser-parser.js` | Imports the SeguBeca parser, exposes `parseSegubecaPdfTextToAcceptedQuotePacket`, and routes SeguBeca PDFs before generic fallback. |
| `docs/static-preview/quote-preview-live/forge-benefit-summary-renderer.js` | Allows native SeguBeca benefit-summary blocks from the accepted quote packet to reach the R14A adapter. |
| `tests/segubeca-solucionline-parser-test.mjs` | Validates parsing, routing, accepted packet mapping, and adapter consumption with sanitized fixture text. |
| `docs/evidence/r14c-segubeca-solucionline-pdf-intake-implementation.md` | Records scope, validations, and guardrails. |

## Parsed surfaces

The parser can extract, when evidenced:

- product and variant;
- UDI currency;
- Titular and Contratante role rows;
- primary insured / contracting party;
- child or education beneficiary;
- participant modality as individual or unknown unless joint evidence exists;
- base SeguBeca coverage;
- coverage rows;
- recommended coverage rows;
- total annual premium;
- total annual premium with recommended benefits;
- guaranteed values;
- administration-of-savings table;
- monthly delivery;
- accumulated delivery;
- estimated administration interest rate;
- missing information.

## Guardrails

- No real PDFs were committed.
- No Excel files were committed.
- No client data was committed.
- No filenames or local paths were committed.
- No parser output invents missing roles or values.
- No mobile, schemas, routes, `app.js`, or rule packs were changed.
- Vida Mujer and Imagina Ser parser/dashboard behavior must continue to pass existing tests.

## Validation contract

- `node --check` for changed JavaScript files.
- SeguBeca Solucionline parser test.
- SeguBeca dashboard adapter test.
- Imagina Ser dashboard adapter test.
- product dashboard template test.
- quote benefit-summary test.
- pdf browser parser smoke test.
- parser ownership test when present.
- `git diff --check`.
- privacy check on added lines.
- exact-path staging only.

## Closure

R14C is a parser/intake implementation for SeguBeca PDF text surfaces. Further visual layout polish or Excel-driven calculation integration requires a separate module.
