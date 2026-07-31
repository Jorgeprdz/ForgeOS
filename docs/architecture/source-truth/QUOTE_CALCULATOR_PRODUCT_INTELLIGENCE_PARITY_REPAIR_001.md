# Quote Calculator Product Intelligence Parity Repair 001

## Status

`M05E_006_IMPLEMENTED_PENDING_DEVICE_BROWSER_ACCEPTANCE`

Branch: `fix/quote-calculators-product-intelligence-parity`

## Scope

The Material 3 Cotizaciones route reconnects the existing Product Intelligence adapters for Vida Mujer, SeguBeca, ORVI and Imagina Ser. Product Intelligence remains the authority for product identity, premiums, protection, guaranteed values, recovery scenarios and conversion metadata. REALIZA remains outside this repair.

## Mandatory presentation

Every supported product presents source-currency protection and contribution values, current or projected MXN equivalence when verified conversion evidence exists, and the rate value, date and source. Current UDI is never hardcoded.

## Live Banxico authority

`tools/forge-local-live-server.cjs` refreshes rates through the deployed `banxico-rates` Edge Function, exposes `/api/forge-market-rates`, blocks stale data and stores the mutable cache outside the worktree at `~/.cache/forgeos/market-rates.json`.

## Printable UX

The printable surface uses Forge dark Material 3 visual language and three compact 44px actions: preview/print, PDF download and History. Client or insured name is optional document metadata. When unavailable, the explicit value `Sin dato confirmado` is used without inventing person identity or blocking confirmation, preview or download.

The document is composed as self-contained A4 portrait HTML and a real deterministic portrait PDF. It includes a modern Forge cover, executive metrics, commercial cards, identified projections, sources and disclaimers.

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

## Validation

Repository contract gates:

- QPD-01 through QPD-06;
- `tests/ui-m05e-quote-calculator-restoration-test.mjs`;
- `tests/ui-m05f-live-udi-review-printable-actions-test.mjs`;
- `tests/ui-m05g-printable-design-closure-test.mjs`.

Browser regression:

- `tests/e2e/fixtures/m05e006/index.html` reproduces a human-review setter that emits its own update event;
- `tests/e2e/m05e006-responsiveness.spec.mjs` verifies one fallback write, active main-thread heartbeat, no actionable page errors, M05E-006 API ownership and visible compact actions;
- the sandboxed preview iframe may emit Playwright service-worker noise, which is explicitly filtered without hiding application errors.

## Remaining acceptance

Final device acceptance must confirm:

- badge `CALCULADORAS M05E-006`;
- Chrome and Samsung Browser remain responsive;
- the route loads without a blank screen;
- ORVI PDF processing still produces current UDI/MXN metrics;
- compact print, PDF and History actions work;
- A4 portrait preview and PDF remain correct;
- worktree stays clean.

The PR remains draft and no merge to `main` has been performed.
