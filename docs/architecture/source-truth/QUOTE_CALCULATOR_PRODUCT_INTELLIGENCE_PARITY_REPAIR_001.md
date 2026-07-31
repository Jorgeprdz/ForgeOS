# Quote Calculator Product Intelligence Parity Repair 001

## Status

`M05E_004_IMPLEMENTED_PENDING_BROWSER_ACCEPTANCE`

Branch: `fix/quote-calculators-product-intelligence-parity`

The productive Material 3 route now reconnects the existing Product Intelligence adapters, refreshes Banxico market data through the secured provider boundary, composes printable ORVI documents and closes the final client/history UX defects discovered during browser acceptance.

## Authority

Product Intelligence remains the canonical authority for product identity, premiums, protection, guaranteed values, recovery scenarios and conversion metadata. Uploaded spreadsheets and browser-generated printable documents are validation evidence for commercial presentation, not replacement calculation authorities.

This repair does not modify the canonical product calculators. It reconnects the Material 3 presentation to the existing product adapters for:

- Vida Mujer
- SeguBeca
- ORVI
- Imagina Ser

REALIZA remains outside this immediate repair.

## Mandatory cross-product presentation

Every supported product must visibly present:

1. Suma asegurada in source currency, including UDI when applicable.
2. Current or projected MXN equivalence when the verified conversion engine provides it.
3. Annual contribution or annual premium in source currency.
4. Annual contribution or annual premium in MXN when conversion evidence is available.
5. Rate value, date, source and series when rate metadata exists.

No current UDI value may be hardcoded in the Material 3 presenter.

## Live UDI authority

M05E-003 introduced `tools/forge-local-live-server.cjs` and the secured Supabase `banxico-rates` provider boundary.

The local server:

- invokes `exchange-rate-cache-engine.js` before serving Forge;
- forces a verified Banxico refresh at startup;
- exposes `/api/forge-market-rates` without exposing the Banxico token;
- refreshes the cache periodically while the server remains active;
- fails closed when no verified provider is available.

The browser runtime:

- accepts only a cache generated within 18 hours;
- accepts a Banxico source date no older than seven calendar days to cover weekends and holidays;
- blocks MXN output instead of silently accepting a stale value;
- uses the verified current UDI for the first annual contribution equivalence;
- keeps future values classified as projected scenarios.

## Client metadata and confirmation

M05E-004 changes `Cliente / asegurado` from a blocking confirmation requirement into editable document metadata.

Behavior:

- Forge first attempts to recover the client or insured name from the accepted quote, prospect context or native calculation result.
- When a name is not available, the printable flow uses the explicit missing-data label `Sin dato confirmado`.
- The field remains editable before printing.
- The value is projected into the bounded printable snapshot without mutating CRM.
- Confirmation, preview and PDF generation are not blocked by an instruction to type a name.
- The runtime does not invent a person identity.

## Printable actions and history

- Preview and PDF download remain tied to an accepted quote snapshot.
- QPD06 receives the same accepted snapshot used by the confirmation bridge.
- History is restored as a visible action in both standalone and prospect-linked surfaces.
- With durable Quote identity, History represents persisted printable versions for that Quote.
- Without durable identity, the action remains available for the history exposed by the current runtime/session; the UI no longer hides the capability merely because the quote was opened standalone.
- Restoring the action does not change the underlying QPD storage contract.

## Imagina Ser contract

The contribution and recovery stories remain separate:

- Contribution term and annual UDI contribution come from the parsed PDF.
- Base, favorable and unfavorable recovery scenarios remain visible.
- Each scenario may include lump-sum recovery and monthly life-income values.
- Accumulated monthly-income results supplied by Product Intelligence are presented as summary results only.
- The UI does not render a 120- or 180-row actuarial table.
- Monthly UDI conversion and the 120/180-month accumulation remain calculation-engine responsibilities.

## ORVI contract

ORVI remains life-insurance protection with a limited payment term and guaranteed-value checkpoints.

The existing Product Intelligence rules remain authoritative for:

- payment terms 6, 10, 15 or 20 years;
- checkpoint selection derived from the payment term;
- annual contributions converted using the rate for each payment year;
- no new contributions after the payment term;
- protection and recovery values in source currency and MXN;
- recovery comparison against cumulative contributions;
- non-investment-return classification of the comparison.

Coverage duration or maturity age is displayed only when extracted from the PDF or canonical model.

## Vida Mujer and SeguBeca

The repair restores the existing benefit-summary adapters, including:

- source UDI values;
- MXN conversions supplied by the calculation engine;
- scheduled endowments or education payments;
- protection values;
- missing-information evidence.

The presenter does not invent a rate or recalculate product formulas.

## Tests

- `tests/ui-m05e-quote-calculator-restoration-test.mjs`
- `tests/ui-m05f-live-udi-review-printable-actions-test.mjs`
- `tests/banxico-rates-edge-function-test.mjs`

The tests lock:

- productive M05E-004 entrypoint wiring;
- all four Product Intelligence adapters;
- UDI/MXN mandatory metrics;
- stale-cache rejection and live Banxico refresh;
- optional client metadata with explicit missing-data fallback;
- confirmation synchronization;
- printable preview/download wiring;
- restored History visibility without changing QPD persistence ownership.

## Browser evidence and remaining acceptance

The ORVI 99-20 browser run produced two six-page printable documents containing client, product, UDI protection, current MXN protection, annual premiums, projected contribution/recovery and field-level source provenance. This proves the printable path executes end to end.

Final browser acceptance for M05E-004 must confirm:

- badge `CALCULADORAS M05E-004`;
- current Banxico UDI date and value;
- annual contribution UDI plus current MXN;
- no blocking instruction to type a name;
- client metadata remains editable;
- confirmation, printable preview and PDF download remain functional;
- History is visible and opens;
- no horizontal overflow on the target viewport.

After ORVI passes, repeat with representative PDFs for Vida Mujer, SeguBeca and Imagina Ser.
