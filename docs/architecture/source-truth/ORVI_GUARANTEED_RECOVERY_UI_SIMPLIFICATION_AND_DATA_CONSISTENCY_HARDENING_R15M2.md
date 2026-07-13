# ORVI Guaranteed Recovery UI Simplification And Data Consistency Hardening R15M2

## Module

`R15M2_ORVI_GUARANTEED_RECOVERY_UI_SIMPLIFICATION_AND_DATA_CONSISTENCY_HARDENING`

## Constitutional authority

- `AGENTS.md`: Ley Zero, Decision Clarity First, Product Intelligence ownership, Forecast Truth Boundary and human decision authority.
- `FORGE_CONSTITUTION_V3.md`: No Invented Data, Product Semantics, Privacy-First and explicit-rate requirements.
- ADR-001, ADR-002, ADR-003, ADR-004, ADR-005, ADR-007 and ADR-008.
- Repository-owner approval is limited to this ORVI presentation repair before human visual signoff.

## Decision

The established Vida Mujer reusable dashboard remains the only dashboard template. Product Intelligence remains the canonical owner of ORVI product, premium, protection, recovery and rate-context facts. R15M2 changes only ORVI-scoped presentation and confirmation handoff behavior.

Each UDI guaranteed-recovery checkpoint card renders exactly:

1. Total aportado
2. Valor de rescate
3. Valor en efectivo
4. Recuperación total
5. Diferencia actual
6. Porcentaje de recuperación
7. UDI proyectada

The surrender row renders source UDI only. Projected MXN model fields remain available to canonical consumers but are not rendered after `UDI proyectada`.

One compact statement precedes the recovery cards:

> Recuperación total = valor de rescate + valor en efectivo.

The visible recovery percentage is a presentation calculation from current MXN evidence:

```text
current_mxn.total_recovery.value
÷ current_mxn.cumulative_paid.value
× 100
```

Both inputs must be finite and total contributed must be greater than zero. Otherwise the UI remains pending. The classification remains `comparison_only_not_investment_return`.

## Verified-rate consistency

The accepted-quote summary consumes the already attached `orviRateMetadata`; it does not create a provider or read Banxico. ORVI metadata is accepted only when the currency-specific rate key matches, the value is finite and positive, `stale === false`, the source date exists, and source mode is `LIVE`, `CACHE` or `SYNTHETIC_TEST`.

Valid metadata enables existing MXN equivalences. Invalid, mismatched or stale metadata preserves the pending state. No rate, date or amount is hardcoded.

For ORVI, the summary label is `Moneda y plazo de aportación` and only renders canonical currency and positive payment-term evidence. It does not infer payment mode, policy duration or lifetime coverage.

## Confirmation modal boundary

Before the existing popup is opened, an ORVI-only bridge maps canonical Product Intelligence evidence into the existing eight-field confirmation contract:

- family becomes `ORVI`;
- product uses `identity.detected_product_name` when available;
- sum assured uses `protection_summary.basic_sum_assured`;
- payment term uses `premium_structure.payment_term_years` and is labeled `Plazo de aportación`;
- annual premium uses `premium_structure.basic_annual_premium` only when source-provided;
- annual total with AVE uses `premium_structure.total_annual_premium` only when source-provided.

No premium is divided, recomputed or filled from an unrelated fallback. Removed private names remain null.

## Protected boundaries

- Product Intelligence canonical modules: unchanged.
- ORVI parser and mapper: unchanged.
- Verified rate cache: unchanged.
- Imagina Ser and SeguBeca adapters: unchanged.
- Shared dashboard template primitive: unchanged.
- `quote-benefit-summary-engine.js`: unchanged.
- `package.json` and `app.js`: unchanged.
- Future UDI MXN remains a non-guaranteed scenario.
- Future USD MXN remains blocked.
- Recommendation remains `null`; human decision remains required.

## Closure record

```text
STATUS=PASS_UI_SIMPLIFICATION_AND_DATA_CONSISTENCY_HARDENING
RECOVERY_VISIBLE_ROW_COUNT=7
RECOVERY_LAST_VISIBLE_ROW=UDI_PROYECTADA
PROJECTED_ROWS_AFTER_UDI_REMOVED=YES
SURRENDER_VALUE_MXN_VISIBLE=NO
RECOVERY_PERCENTAGE_SOURCE=CURRENT_MXN_TOTAL_RECOVERY_DIVIDED_BY_CURRENT_MXN_TOTAL_CONTRIBUTED
RECOVERY_EXPLANATION_SINGLE_INSTANCE=YES
FALSE_MXN_PENDING_WITH_VALID_RATE=FIXED
ORVI_MODAL_FAMILY_UPPERCASE=YES
ORVI_MODAL_SUM_ASSURED_MAPPED=YES_IF_CANONICAL
ORVI_MODAL_PAYMENT_TERM_MAPPED=YES_IF_CANONICAL
PRIMA_INVENTED=NO
PRODUCT_INTELLIGENCE_OWNER=UNCHANGED
RATE_CACHE_CHANGED=NO
HARD_CODED_RATE=NO
RECOMMENDATION=null
HUMAN_DECISION_REQUIRED=true
MANUAL_VISUAL_ACCEPTANCE=PENDING_USER_REVIEW
NEXT=R15M3_ORVI_MANUAL_VISUAL_ACCEPTANCE_SIGNOFF_AND_RELEASE_CLOSE
```

R15M1 is not executed or closed by this module.
