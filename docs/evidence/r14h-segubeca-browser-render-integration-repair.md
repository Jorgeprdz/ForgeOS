# R14H SeguBeca Browser Render Integration Repair Evidence

## Governance

- Module: `R14H_SEGUBECA_BROWSER_RENDER_INTEGRATION_REPAIR`
- Constitution: `FORGE_CONSTITUTION_V3.md`
- ADRs: ADR-003, ADR-004, ADR-005, ADR-007, ADR-008
- Board approval: approved
- Miranda approval: approved
- Discovery status: authorized for R14H
- Implementation readiness: ready after the browser findings below

## Sanitized Browser Reproduction

The failure was reproduced on 2026-07-12 in headless Chromium 138 through the real
`docs/static-preview/forge-alive/nueva-cotizacion/` page and its accepted-quote modal.
The synthetic source text used only `Contratante Prueba` and `Menor Prueba`. No PDF,
client file, screenshot, identifying value, or external request was persisted.

The object delivered to the accepted-render calculation boundary preserved:

- `productFamily: "segubeca"`;
- `nativeResult.productFamily: "segubeca"`;
- `nativeResult.benefitSummary.blocks.length: 9`;
- total contributed: `35339` UDI;
- total recovery: `30000` UDI;
- payment mode: `Anual`;
- currency: `UDI`;
- coverage period: `14 años`.

These are sanitized regression fixture values, not universal product truth or a new
financial calculation.

## First Point Of Rupture

`renderAcceptedQuote` enters its SeguBeca branch with the valid calculation and calls:

```js
setSummaryValue("Faltantes antes de presentar", value);
```

`setSummaryValue` forwards that string to `findSummaryTarget`, which performs
`labels.map(normalize)`. The browser throws:

```text
TypeError: labels.map is not a function
```

This is the first point where the valid SeguBeca state is ignored. The accepted quote
adapter is not the rupture point.

## Placeholder Writer And DOM Timeline

The literal strings `Dependiente del plan` and
`Se mostrarán según el plan detectado` originate in the static HTML summary markup.
No callback, listener, observer, or generic renderer rewrote them during the traced
acceptance sequence. They remain because the exception aborts `renderAcceptedQuote`
before `renderVisibleDynamicBenefitSummary` can mount the structured dashboard and
before the intended `setSummaryValue` calls can replace summary content.

Observed browser result before repair:

- SeguBeca dashboard absent;
- both static placeholders present;
- correct contributed/recovery values had already been written;
- payment mode, currency, and coverage period had already been written;
- no `[object Object]`;
- status surfaced `labels.map is not a function`;
- no later overwrite occurred because the dashboard was never mounted.

## Readiness Decision

The four conditional-readiness requirements are documented. R14H is ready for the
minimum renderer-boundary repair and focused browser/DOM validation. Parser,
calculation, adapter, cache-bust, and unrelated product changes are not justified.

## Implemented Repair And Browser Result

The renderer now normalizes a single label string to the same lookup list accepted for
multi-label calls. The SeguBeca recovery summary also reuses the formatter's existing
`UDI` suffix instead of appending a duplicate unit. No calculation was changed.

Post-repair validation in Chromium 138 passed:

- the dashboard remained connected after the post-acceptance wait;
- `data-forge-product-type="segubeca"` was present;
- at least five product-specific sections were visible;
- both static placeholders were absent;
- no later callback, listener, observer, or generic renderer overwrote the dashboard;
- contributed and recovery totals remained `35339` and `30000` UDI;
- `Anual`, `UDI`, and `14 años` remained visible in the accepted calculation/summary;
- no `[object Object]` appeared;
- no desktop horizontal-overflow regression was detected at 1440 px.

Focused browser command:

```sh
FORGE_PUPPETEER_CORE_PATH=/path/to/puppeteer-core.js \
FORGE_CHROMIUM_PATH=/path/to/chromium-browser \
node tests/segubeca-browser-render-integration-test.mjs
```

Result: `PASS SeguBeca accepted-render real browser integration R14H`.

Regression result: PASS for the reusable product-dashboard template, quote benefit
summary engine, Imagina Ser dashboard adapter, SeguBeca dashboard adapter, accepted
runtime integration, renderer handoff guard, Solucionline parser, Vida Mujer product
recognition, and Vida Mujer survival schedule. `node --check` and `git diff --check`
also passed.

DECISION=`PASS_R14H_SEGUBECA_BROWSER_RENDER_INTEGRATION_REPAIR`
