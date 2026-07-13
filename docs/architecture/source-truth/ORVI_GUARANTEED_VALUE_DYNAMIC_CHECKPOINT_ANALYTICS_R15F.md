# ORVI Guaranteed Value Dynamic Checkpoint Analytics R15F

## Decision

- Status: `IMPLEMENTED`.
- Analytics ID: `orvi.guaranteed-value.dynamic-checkpoint-analytics.v1`.
- Canonical owner: `product-intelligence`.
- Source currencies: `UDI`, `USD`.
- Recommendation authority: `NONE`.
- MXN projection: `NOT_EVALUATED`.
- Next: `R15G_ORVI_MXN_PROJECTION_ENGINE_AUTHORITY_AND_CURRENCY_PATH_RECONCILIATION`.

## Purpose

The analytics layer answers a commercial comparison question without changing the product classification:

- how much has been paid through a selected policy year;
- what guaranteed surrender value is displayed at that year;
- what cash value is displayed;
- what total recovery is displayed;
- what arithmetic difference exists between cumulative paid and total recovery;
- what proportion of cumulative paid the displayed recovery represents.

ORVI remains life-insurance protection. These comparisons do not convert it into an investment product.

## Dynamic checkpoints

The default strategy is:

1. the contracted payment-term year;
2. the next five-year milestone strictly after that term;
3. five years after the second checkpoint.

Examples:

- 6 payments -> years 6, 10, 15;
- 10 payments -> years 10, 15, 20;
- 15 payments -> years 15, 20, 25;
- 20 payments -> years 20, 25, 30.

A checkpoint is selected only when that exact policy year exists in the canonical timeline. The engine never substitutes a nearby year.

## Cumulative paid

For each policy year, paid amount uses:

1. source-provided total annual outflow when available; otherwise
2. the sum of source-provided annual premium and source-provided additional premium.

Missing components do not become zero. When any required year or component is absent, cumulative paid is not calculated as complete. A known subtotal may be retained with an explicit incomplete status.

## Guaranteed values

The analytics output preserves three source fields independently:

- guaranteed surrender value;
- cash value;
- total recovery.

Total recovery is the comparison value used against cumulative paid. It is never reconstructed from other values when the source provides it.

## Derived comparisons

For complete checkpoints:

- recovery difference = total recovery - cumulative paid;
- recovery ratio = total recovery / cumulative paid;
- recovery percentage = recovery ratio x 100.

The ratio is labeled `comparison_only_not_investment_return`. It is not annualized yield, performance, interest, or a recommendation.

## Human-decision boundary

The engine does not recommend cancellation, surrender, waiting, or continuation. It shows auditable comparisons and preserves `human_decision_required: true`.

## Private real-source regression

The qualified ORVI PDF is parsed outside Git, mapped to Product Intelligence, and passed through the analytics engine. The committed record stores no names, contacts, quote amounts, PDF text, local path, or source fingerprint.

The sanitized regression confirms:

- dynamic payment term;
- expected checkpoint-year selection;
- complete source-unit comparisons;
- stable cumulative paid after the payment term when source rows show zero premiums;
- increasing displayed total recovery across selected checkpoints;
- no recommendation;
- no MXN projection.

## Prohibited in R15F

- No UDI-to-MXN or USD-to-MXN projection.
- No assumed exchange rate.
- No recommendation.
- No runtime or renderer wiring.
- No dashboard cards.
- No browser validation.
- No change to existing parser, mapper, model, workbook, or legacy ORVI engines.

## Next

`R15G_ORVI_MXN_PROJECTION_ENGINE_AUTHORITY_AND_CURRENCY_PATH_RECONCILIATION`
