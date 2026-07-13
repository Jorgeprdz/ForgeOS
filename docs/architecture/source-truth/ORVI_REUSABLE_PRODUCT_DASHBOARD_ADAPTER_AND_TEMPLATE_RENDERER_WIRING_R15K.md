# ORVI Reusable Product Dashboard Adapter And Template Renderer Wiring R15K

## Decision

`PASS_R15K_ORVI_REUSABLE_PRODUCT_DASHBOARD_ADAPTER_AND_TEMPLATE_RENDERER_WIRING`

- Adapter ID: `orvi.reusable-product-dashboard-adapter.v1`.
- Product type: `orvi`.
- Layout marker: `orvi_dynamic_r15k`.
- Template authority: `VIDA_MUJER_ESTABLISHED_PRODUCT_DASHBOARD_SYSTEM`.
- Renderer route: implemented.
- New dashboard system: no.
- Layout redesign: no.
- Recommendation: `null`.
- Next: `R15L_ORVI_STATIC_PREVIEW_RUNTIME_RATE_BRIDGE_AND_END_TO_END_DASHBOARD_WIRING`.

## Template reuse

ORVI reuses `forge-product-dashboard-template.js`, `forge-benefit-summary-layout.js`, `forge-benefit-summary-renderer.js`, and the shared `fq-benefit-*` class family.

The product-specific adapter consumes the R15I view model from the R15J readiness payload. The renderer does not parse the PDF or calculate financial truth.

## Sections

The adapter provides Protection, future protection scenarios, exact Guaranteed Recovery checkpoint cards, and disclosure details. Recovery percentage remains a comparison, not investment return.

## Renderer integration

The route order is:

`ORVI → SeguBeca → Imagina Ser → generic fallback`

The order applies to immediate and late summary paths.

## Boundary

R15K implements renderer capability. The live static-preview calculation object does not yet receive the R15J readiness payload. R15L must provide that end-to-end bridge.

Shared template primitives and layout remain unchanged. Browser validation follows R15L.

## Privacy

The private regression commits no PDF text, identity, path, fingerprint, production rate or real quote amount.

## Next

`R15L_ORVI_STATIC_PREVIEW_RUNTIME_RATE_BRIDGE_AND_END_TO_END_DASHBOARD_WIRING`
