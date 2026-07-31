# Quote Calculator Product Intelligence Parity Repair 001

## Status

`IMPLEMENTED_ON_FIX_BRANCH_PENDING_BROWSER_ACCEPTANCE`

Branch: `fix/quote-calculators-product-intelligence-parity`

## Problem

The Material 3 Quotes surface replaced the product-specific result dashboards with a generic commercial projection. The parser and calculation engines remained mounted, but their structured UDI, MXN, scenario and product semantics were flattened at presentation time. The visible action buttons were also rendered without productive click wiring.

## Authority

Product Intelligence remains the canonical authority for product identity, premiums, protection, guaranteed values, recovery scenarios and conversion metadata. The spreadsheet supplied by the repository owner is validation evidence for commercial presentation, not a replacement calculation authority.

This repair does not modify the canonical calculators. It reconnects the Material 3 presentation to the existing product adapters for:

- Vida Mujer
- SeguBeca
- ORVI
- Imagina Ser

REALIZA is explicitly outside this immediate repair.

## Mandatory cross-product presentation

Every supported product must visibly present:

1. Suma asegurada in source currency, including UDI when applicable.
2. Current or projected MXN equivalence when the verified conversion engine provides it.
3. Annual contribution or annual premium in source currency.
4. Annual contribution or annual premium in MXN when conversion evidence is available.
5. Rate value, date, source and series when rate metadata exists.

No current UDI value may be hardcoded in the Material 3 presenter. The verified daily-rate engine remains the authority.

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

Coverage duration or maturity age must be displayed only when it was extracted from the PDF or canonical model.

## Vida Mujer and SeguBeca

The repair restores the existing benefit-summary adapters, including:

- source UDI values;
- MXN conversions supplied by the calculation engine;
- scheduled endowments or education payments;
- protection values;
- missing-information evidence.

The presenter does not invent a rate or recalculate product formulas.

## Human actions

The Material 3 result surface now wires:

- `Revisar datos pendientes` to the review section;
- `Confirmar cotización` to `ForgeQuoteAcceptanceEntrypointR16J0A.confirm()`;
- successful confirmation to `ForgeQuotePrintableEntrypointQPD06.refresh()`.

Automatic acceptance, sending or CRM mutation remains prohibited.

## Tests

New contract test:

- `tests/ui-m05e-quote-calculator-restoration-test.mjs`

It verifies:

- all four product adapters are connected;
- mandatory sum-assured and annual-contribution cards exist;
- UDI and MXN current/projected values are preserved;
- no UDI value is hardcoded in the presenter;
- Imagina Ser keeps base, favorable and unfavorable scenarios;
- accumulated-income summaries remain supported;
- both action buttons have productive wiring;
- printable-document refresh is connected;
- cache busting points Material 3 to the repaired adapter.

Existing Product Intelligence tests remain the numerical authority for each product.

## Acceptance still required

Before merge, perform browser validation with representative PDFs for Vida Mujer, SeguBeca, ORVI and Imagina Ser. Confirm:

- product-specific dashboard selection;
- source currency and MXN presentation;
- no missing or duplicated scenario values;
- confirmation button behavior;
- QPD06 printable actions after confirmation;
- mobile safe-area and horizontal-overflow behavior.
