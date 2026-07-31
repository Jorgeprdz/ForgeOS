# Quote Calculator Product Intelligence Parity Repair 001

## Status

`M05E_003_IMPLEMENTED_PENDING_SECOND_BROWSER_ACCEPTANCE`

Branch: `fix/quote-calculators-product-intelligence-parity`

The first browser attempt was rejected because the productive Material 3 entrypoint still loaded the previous complete adapter. The second browser attempt proved ORVI product parity for source UDI, current MXN protection, dynamic checkpoints and recovery comparisons, but exposed three additional integration defects:

1. The local preview served a stale root `forge-rate-cache.json` dated 10/06/2026 because Python's static server never invoked the existing 12-hour Banxico refresh engine.
2. The Material 3 screen did not capture the client/insured name required by the printable read model.
3. Confirmation, printable actions and history did not project their actual runtime state clearly.

M05E-003 repairs those integration defects and remains pending browser acceptance.

## Authority

Product Intelligence remains the canonical authority for product identity, premiums, protection, guaranteed values, recovery scenarios and conversion metadata. The spreadsheet supplied by the repository owner is validation evidence for commercial presentation, not a replacement calculation authority.

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

M05E-003 adds `tools/forge-local-live-server.cjs`.

The local server:

- invokes the existing `exchange-rate-cache-engine.js` before serving Forge;
- forces a verified Banxico refresh at startup;
- exposes `/api/forge-market-rates` without exposing the Banxico token;
- refreshes the cache periodically while the server remains active;
- fails closed when neither `BANXICO_TOKEN` nor `SUPABASE_BANXICO_RATES_URL` is configured.

The browser runtime:

- accepts only a cache generated within 18 hours;
- accepts a Banxico source date no older than seven calendar days to cover weekends and holidays;
- blocks MXN output instead of silently accepting a stale value;
- uses the verified current UDI for the first annual contribution equivalence;
- keeps future values classified as projected scenarios.

## Human review and confirmation

The Material 3 surface now captures `Cliente / asegurado` locally before confirmation and printing.

The review value:

- is applied to the current accepted-quote candidate when possible;
- is projected into the immutable review snapshot through a bounded wrapper;
- does not mutate CRM;
- satisfies the printable read model's required client field;
- synchronizes the visible confirmation button with an already accepted quote.

## Printable actions

- Preview and PDF download remain blocked until the accepted quote has a client/insured name.
- Once the reviewed snapshot is complete, QPD06 receives the same accepted snapshot and may compose the document.
- History is hidden in standalone local mode.
- History is shown only when a durable Quote identity exists, where it represents saved printable versions for the same Quote.

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

The tests lock:

- productive M05E-003 entrypoint wiring;
- all four Product Intelligence adapters;
- UDI/MXN mandatory metrics;
- stale-cache rejection;
- Banxico refresh before local serving;
- client/insured human review;
- confirmation synchronization;
- printable action gating;
- durable-only history visibility.

## Acceptance still required

Using the same ORVI 99-20 PDF, confirm:

- badge `CALCULADORAS M05E-003`;
- current Banxico UDI date and value;
- annual contribution UDI plus current MXN;
- client/insured capture;
- confirmation state visibly changes;
- printable preview opens;
- PDF downloads through a human click;
- history is hidden in standalone mode;
- no horizontal overflow on the target viewport.

After ORVI passes, repeat with representative PDFs for Vida Mujer, SeguBeca and Imagina Ser.
