# R14A SeguBeca Product Dashboard Adapter Implementation Evidence

## Decision

`PASS_R14A_SEGUBECA_PRODUCT_DASHBOARD_ADAPTER_IMPLEMENTATION`

R14A implements SeguBeca as a product-dashboard adapter consumer of the reusable dashboard template. The implementation is presentation-only and preserves Product Intelligence as semantic owner.

## Files changed

| File | Reason |
| --- | --- |
| `docs/static-preview/quote-preview-live/forge-segubeca-product-dashboard-adapter.js` | Adds SeguBeca product detection, presentation model, participant sections, education goal, payout, contribution, protection, included benefits, secondary details, and missing-information rendering. |
| `docs/static-preview/quote-preview-live/forge-benefit-summary-renderer.js` | Routes SeguBeca benefit summaries to the SeguBeca adapter before the generic fallback, preserving Imagina Ser and Vida Mujer behavior. |
| `tests/segubeca-product-dashboard-adapter-test.mjs` | Verifies product detection, participant/mancomunado structure, formatting, dashboard rendering, and missing-information behavior. |
| `docs/evidence/r14a-segubeca-product-dashboard-adapter-implementation.md` | Records authority, scope, files, validations, and prohibited-surface confirmations. |

## SeguBeca representation

The adapter supports these sections when evidence exists:

- Resumen del plan;
- Quiénes quedan protegidos;
- Lo que aportas;
- Meta educativa;
- Cómo se entrega;
- Lo que proteges;
- Beneficios incluidos;
- Coberturas u opciones adicionales;
- Otros detalles;
- Información pendiente.

## Participant structure

SeguBeca is not flattened into a single insured field. The adapter can present:

- `primary_insured` as `Asegurado principal`;
- `joint_insured` as `Asegurado adicional`;
- `child_or_education_beneficiary` as `Menor asociado`;
- `participant_modality` as `Individual`, `Mancomunado`, or the evidenced value.

If participant evidence is absent, the adapter reports missing information instead of inventing roles.

## Limits respected

- Desktop/runtime product dashboard adapter only.
- No parser or PDF intake changes.
- No mobile changes.
- No schemas, routes, `app.js`, or rule packs changed.
- No client records, sensitive data, credentials, or product values added.
- No DOM overlay hack.
- No Product Truth, forecast, premium, coverage, benefit, role, or recommendation was invented.

## Validation contract

- `node --check` for changed JavaScript files.
- SeguBeca adapter test.
- Product dashboard template test.
- Imagina Ser adapter non-regression.
- Quote benefit-summary test.
- PDF browser parser smoke test.
- Parser ownership test when present.
- `git diff --check`.
- Privacy check on added lines.
- Changed-surface allowlist.
- Null-safe block handling for absent optional sections: PASS.

## Closure

R14A implements the SeguBeca dashboard adapter within the approved boundary. A future separately governed module may authorize SeguBeca parser/PDF intake if needed.
