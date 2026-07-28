# UI-M05C Product Intelligence Presentation Parity Matrix

Source commit: `ba96e2c5c2fc4a4149af6f6a5561dd13cf1895e5`

The matrix is derived from calculation objects, benefit-summary blocks,
Product Intelligence packets and product-dashboard adapter tests. Screenshots
are not used as functional authority.

| Product | Fixture / authority | Authoritative keys and sections | UI-M05B visible | UI-M05C required parity | Root cause |
| --- | --- | --- | --- | --- | --- |
| Imagina Ser | `tests/imagina-ser-product-dashboard-adapter-test.mjs` and `buildQuoteBenefitSummary` | `contribution_summary`, `protection_summary`, `retirement_scenarios`, single payment, monthly/annual income, accumulated income, recommended benefits, missing information | Generic product, premium, protection and at most a few flat scenario fields | Identity/version where available; contribution, protection, construction, structured scenarios, recommendations and missing evidence | `fieldModel` retained only selected top-level values; `writeRuntimeGrid` flattened or omitted nested blocks |
| SeguBeca | `tests/segubeca-accepted-quote-integration-test.mjs` and parser-produced accepted packet | plan, participants, contribution, education goal/payout, protection, included/additional benefits, UDI/MXN projection metadata, missing information | Generic summary cards and flat fallback rows | Structured education, participant, contribution, payout, protection and benefit panels | Product dashboard model existed but had no explicit native Material 3 mount |
| ORVI | `tests/orvi-accepted-quote-end-to-end-dashboard-test.mjs` and ORVI Product Intelligence fixtures | canonical Product Intelligence schema/ownership, protection, dynamic checkpoints, verified rate context, recovery scenarios, disclosure/human-decision boundary | Generic product, premium and protection values | ORVI dashboard model, verified rate key/source/date/status, dynamic recovery sections, disclosure and missing evidence | Calculation retained the view model, but the native adapter never read or rendered it |
| Generic product | Benefit-summary block contract from `forge-benefit-summary-renderer.js` | structured `blocks`, `summaryBlocks`, lines, rows, items and missing information | Short label/value list | Deterministic structured fallback without invented values | Flat field model was the only Material 3 presentation contract |

## Packet preservation

- Complete calculation snapshots are cloned and deeply frozen.
- Product Intelligence snapshots are cloned and deeply frozen.
- Existing product dashboard model builders remain authoritative and unchanged.
- Presentation selects exactly one dashboard: ORVI, SeguBeca, Imagina Ser or
  generic fallback.
- No calculation, Product Intelligence, parser, mapper, rate-cache or product
  rule file is modified.
