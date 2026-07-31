# Quote Calculator Product Intelligence Parity Repair 001

## Status

`M05E_005_IMPLEMENTED_PENDING_FINAL_BROWSER_ACCEPTANCE`

Branch: `fix/quote-calculators-product-intelligence-parity`

M05E-005 closes the functional and visual defects identified after the first end-to-end ORVI printable run. The productive Material 3 route keeps Product Intelligence as calculation authority, uses verified Banxico rates, removes the client-name confirmation gate, replaces the foreign light printable panel with a Forge-native dark management card, restores History and produces a redesigned portrait PDF.

## Authority

Product Intelligence remains the canonical authority for product identity, premiums, protection, guaranteed values, recovery scenarios and conversion metadata. Uploaded spreadsheets, screenshots and generated PDFs are acceptance evidence for presentation; they do not replace the canonical calculators.

Supported in this repair:

- Vida Mujer
- SeguBeca
- ORVI
- Imagina Ser

REALIZA remains outside this closure.

## Mandatory calculation presentation

Every supported product must visibly present:

1. Suma asegurada in source currency, including UDI when applicable.
2. Current or projected MXN equivalence when verified conversion evidence exists.
3. Annual contribution or premium in source currency.
4. Annual contribution or premium in MXN when conversion evidence exists.
5. Rate value, date, source and series.

No current UDI value is hardcoded in the Material 3 presenter.

## Live UDI authority and clean worktree

`tools/forge-local-live-server.cjs`:

- refreshes Banxico through the secured `banxico-rates` provider;
- exposes `/api/forge-market-rates` without exposing `BANXICO_TOKEN`;
- fails closed when a verified rate is unavailable;
- writes the live cache to `~/.cache/forgeos/market-rates.json` through `FORGE_RATE_CACHE_FILE`;
- no longer mutates the tracked `forge-rate-cache.json` fixture.

The browser continues to reject stale cache metadata and uses the verified current UDI for the first annual contribution equivalence.

## Client metadata and confirmation

`Cliente / asegurado` is optional document metadata, not a confirmation gate.

Behavior:

- Forge attempts to recover a real name from the accepted quote, insured or prospect context.
- The compact field remains editable.
- When no name exists, the printable snapshot receives `Sin dato confirmado`.
- Confirming, previewing and downloading are not blocked by a request to type a name.
- CRM is not mutated and no person identity is invented.

M05E-004 is no longer loaded by the productive entrypoint. M05E-005 is the only printable UX closure layered over the M05E-003 live-rate runtime.

## Forge-native UI contract

The uploaded Material 3 screenshots are the visual acceptance authority for the in-app printable surface.

The UI must preserve:

- deep navy surfaces and background;
- thin blue/cyan borders;
- rounded productive cards;
- amber section hierarchy;
- white primary text and blue-gray supporting text;
- responsive spacing compatible with the floating mobile navigation pill.

The former white QPD action card and modal are hidden. The replacement is a dark Forge management card with:

- optional client field;
- fixed `A4 · vertical` status;
- compact 44px icon actions;
- printer icon for preview/print;
- PDF icon for download;
- clock icon for History;
- accessible labels and tooltips;
- useful empty History state instead of hiding the capability.

Document utilities remain visually secondary to the commercial confirmation actions.

## Portrait premium printable contract

The printable document is rebuilt rather than recolored.

HTML preview and PDF output now use:

- A4 portrait as the productive format;
- explicit portrait page metadata and dimensions;
- a modern Forge cover with navy, teal and amber identity;
- a concise executive metric grid;
- clean identity metadata;
- two-column commercial detail cards;
- differentiated projection treatment;
- compact provenance and disclaimers;
- no scripts, network calls or recalculation authority.

The PDF generator remains deterministic, self-contained and human-action gated.

## History

- History is always visible after an accepted quote exists.
- With durable Quote identity, versions persist and can be reopened.
- Without durable identity, History opens a clear empty state and explains when durable versions will appear.
- The underlying QPD repository ownership and append-only version contract are unchanged.

## Product contracts preserved

### ORVI

- limited payment terms 6, 10, 15 or 20 years;
- dynamic guaranteed-value checkpoints;
- no contributions after the payment term;
- continuing protection and guaranteed values;
- UDI and MXN protection/recovery presentation;
- recovery comparison is not presented as investment return.

### Imagina Ser

- contribution and recovery stories remain separate;
- base, favorable and unfavorable scenarios remain visible;
- lump-sum and life-income outputs remain scenario-bound;
- 120/180-month calculations remain engine responsibilities, not UI tables.

### Vida Mujer and SeguBeca

- source UDI values and verified MXN conversions;
- scheduled benefits and protection values;
- missing-information evidence without invented calculations.

## Implementation files

- `advisor-os/quotes/printable/quote-printable-read-model-m05e005.js`
- `advisor-os/quotes/printable/quote-printable-document-composer-m05e005.js`
- `advisor-os/quotes/printable/quote-printable-pdf-generator-m05e005.js`
- `docs/static-preview/quote-printable-runtime/forge-quote-printable-route-controller-m05e005.js`
- `docs/static-preview/forge-alive-material3/quote-runtime-printable-closure-m05e005.js`
- `docs/static-preview/forge-alive-material3/quote-runtime-printable-closure-m05e005.css`

## Tests

- `tests/ui-m05e-quote-calculator-restoration-test.mjs`
- `tests/ui-m05f-live-udi-review-printable-actions-test.mjs`
- `tests/ui-m05g-printable-design-closure-test.mjs`
- existing QPD-01 through QPD-06 contract and browser suites

M05G dynamically proves that a snapshot without a client name:

- becomes ready through the explicit missing-data fallback;
- profiles as ORVI without source-revision mismatch;
- produces premium self-contained HTML;
- generates a real PDF binary;
- reports `PORTRAIT` with width smaller than height;
- exposes the three compact icon actions and restored History state.

GitHub Actions run 101 passed syntax, QPD-01 through QPD-06, M05E, M05F, M05G and diff integrity before browser acceptance.

## Final browser acceptance

Using the ORVI 99-20 quote, confirm in one pass:

- badge `CALCULADORAS M05E-005`;
- current Banxico UDI and annual contribution MXN;
- no prompt or blocking message requiring a name;
- dark Forge management card aligned with the supplied screenshots;
- compact printer, PDF and clock buttons;
- History visible and opening its state;
- premium A4 portrait preview;
- newly downloaded portrait PDF;
- no horizontal overflow;
- clean git worktree after the live-rate refresh.

After ORVI passes, repeat representative acceptance with Vida Mujer, SeguBeca and Imagina Ser.
