# Quote Calculator Product Intelligence Parity Repair 001

## Status

`M05H_ORVI_COMMERCIAL_DOCUMENT_IMPLEMENTED_PENDING_DEVICE_ACCEPTANCE`

Branch: `fix/quote-calculators-product-intelligence-parity`

## Scope

The Material 3 Cotizaciones route reconnects the existing Product Intelligence adapters for Vida Mujer, SeguBeca, ORVI and Imagina Ser. Product Intelligence remains the authority for product identity, premiums, protection, guaranteed values, recovery scenarios and conversion metadata. REALIZA remains outside this repair.

## Mandatory presentation

Every supported product presents source-currency protection and contribution values, current or projected MXN equivalence when verified conversion evidence exists, and the rate value, date and source. Current UDI is never hardcoded.

## Live Banxico authority

`tools/forge-local-live-server.cjs` refreshes rates through the deployed `banxico-rates` Edge Function, exposes `/api/forge-market-rates`, blocks stale data and stores the mutable cache outside the worktree at `~/.cache/forgeos/market-rates.json`.

## Printable UX

The printable surface uses Forge dark Material 3 visual language and three compact 44px actions: preview/print, PDF download and History. Client or insured name is optional document metadata. When unavailable, the explicit value `Sin dato confirmado` is used without inventing person identity or blocking confirmation, preview or download.

The client-facing document is self-contained A4 portrait HTML plus a deterministic portrait PDF. Internal evidence and source paths remain available to the runtime and tests but are not automatically exposed in the commercial document.

## M05E-005 browser rejection

Device evidence on Chrome and Samsung Browser rejected M05E-005:

- Chrome remained on a blank dark surface before completing render.
- Samsung Browser rendered the initial route and then reported that the page was not responding.

The failure was a runtime feedback loop, not cache or Banxico:

1. `refresh()` wrote `Sin dato confirmado` through `setCurrentQuoteHumanReview()`.
2. That write emitted `forge:quote-human-review-updated`.
3. M05E-005 listened to the same event and scheduled another `refresh()`.
4. A global `MutationObserver` also watched `hidden` while `refresh()` repeatedly wrote `hidden` and legacy marker attributes.

This saturated the browser main thread.

## M05E-006 closure

M05E-006 removes the failed runtime from the productive entrypoint and replaces it with an idempotent implementation:

- no global `MutationObserver`;
- no listener for `forge:quote-human-review-updated`;
- client fallback written at most once per candidate;
- existing reviewed fallback recognized as already prepared;
- DOM attributes, text, disabled state and hidden state written only when changed;
- event scheduling uses one coalesced timer instead of recursive microtasks;
- bounded mount retries plus explicit Forge lifecycle events;
- QPD API authority installed without observing every DOM mutation.

## M05H ORVI commercial document rejection and closure

The four-page ORVI document generated after M05E-006 was functionally correct but rejected as a commercial artifact because it mixed primary values with generic fields, repeated premiums, rendered empty data and exposed implementation traceability such as authority names and object paths.

M05H replaces the ORVI client document with a product-specific two-page structure while preserving Product Intelligence and the accepted quote snapshot as the source of truth.

### Page 1 — protection and contribution

1. `Suma asegurada`
   - UDI contractual value;
   - current MXN equivalence.
2. `Aportación anual`
   - annual UDI contribution;
   - current MXN equivalence calculated from the verified current UDI.
3. Payment term and only the useful UDI evidence:
   - UDI value;
   - source date;
   - Banxico source and series.

### Page 2 — recovery and sum assured

Each exact Product Intelligence checkpoint shows the values together:

- policy year;
- recovery in UDI;
- projected recovery in MXN;
- sum assured in UDI;
- projected sum assured in MXN.

For a 20-year ORVI variant the exact checkpoints are years 20, 25 and 30. No nearest-year substitution is authorized.

### Information removed from the client document

- raw `acceptedQuote.*` and `productIntelligence.*` source paths;
- authority identifiers;
- confirmed-data counters;
- repeated basic/total/AVE premium cards;
- empty monthly or annual income fields;
- generic sections that do not improve the commercial decision.

The removed traceability remains internal. The PDF keeps only three useful reading notes: UDI is the plan reference, future MXN values are projected and not guaranteed, and official policy documentation prevails.

## Validation

Repository contract gates:

- QPD-01 through QPD-06;
- `tests/ui-m05e-quote-calculator-restoration-test.mjs`;
- `tests/ui-m05f-live-udi-review-printable-actions-test.mjs`;
- `tests/ui-m05g-printable-design-closure-test.mjs`;
- `tests/ui-m05h-orvi-commercial-document-test.mjs`.

M05H dynamically verifies:

- sum assured UDI and MXN;
- annual contribution UDI and current MXN;
- exact checkpoints 20, 25 and 30;
- recovery and sum assured in both units at every checkpoint;
- exactly two portrait PDF pages;
- absence of raw source paths, generic data counts and irrelevant fields.

Browser regression:

- `tests/e2e/fixtures/m05e006/index.html` reproduces a human-review setter that emits its own update event;
- `tests/e2e/m05e006-responsiveness.spec.mjs` verifies one fallback write, active main-thread heartbeat, no actionable page errors, M05E-006 API ownership and visible compact actions;
- Chromium acceptance passed together with the existing QPD responsive suite after the M05H route wiring.

## Remaining acceptance

Final device acceptance must confirm:

- badge `CALCULADORAS M05E-006`;
- Chrome and Samsung Browser remain responsive;
- ORVI preview contains only the concise two-page commercial structure;
- page 1 shows Sum Assured and Annual Contribution in UDI/MXN;
- page 2 shows Recovery and Sum Assured at the exact checkpoints in UDI/MXN;
- no raw source-path page is generated;
- compact print, PDF and History actions work;
- worktree stays clean.

The PR remains draft and no merge to `main` has been performed.
