# 107Z15E3A — Canonical field source model approval

Status: **PASS**

## Decision

The exact eight-field semantic model is approved.

- Mapping approved: `true`
- Field source model resolved: `true`
- Bridge implementation authorized: `true`

## Approved field model

| Field | Ownership | Source | Fallback policy | Nullable before confirmation |
|---|---|---|---|---|
| `name` | `RUNTIME_CONTEXT_USER_EDITABLE` | `context.name` | `NO_ENGINE_FALLBACK` | true |
| `family` | `RUNTIME_PRODUCT_ROUTING_CONTEXT` | `context.productFamily ?? context.product_family` | `NO_ENGINE_OR_PRODUCT_NAME_FALLBACK` | false |
| `product` | `ENGINE_DIRECT` | `nativeResult.product` | `NO_BRIDGE_FALLBACK` | false |
| `insured` | `ENGINE_SEMANTIC_APPROVED` | `nativeResult.prospect` | `NO_SUM_INSURED_FALLBACK` | true |
| `sumAssured` | `ENGINE_SEMANTIC_APPROVED` | `nativeResult.sumInsured` | `NO_OTHER_MONETARY_FALLBACK` | true |
| `annualPremium` | `ENGINE_NORMALIZED_TABLE_VALUE` | `nativeResult.premiumTable.annual` | `ENGINE_INTERNAL_FALLBACK_ONLY` | true |
| `plannedOrAvePremium` | `ENGINE_PRODUCT_OPTIONAL_VALUE` | `nativeResult.premiumTable.plannedAnnual` | `NULL_WHEN_NOT_EXTRACTED` | true |
| `coveragePeriod` | `ENGINE_POLICY_DURATION` | `nativeResult.policyTerm` | `NO_PAYMENT_OR_GUARANTEE_TERM_FALLBACK` | true |

## Non-negotiable distinctions

- `name` is a user-editable persisted quote label. It is not `insured`.
- `family` is runtime routing context. It is not derived from `product`.
- `insured` comes from the parsed `Asegurado` line through `prospect`.
- `sumAssured` comes from `sumInsured`.
- `annualPremium` uses the engine-normalized `premiumTable.annual`.
- `plannedOrAvePremium` uses `plannedAnnual` and remains null when absent.
- `coveragePeriod` means `policyTerm`, not payment or guarantee term.

## Authorized implementation boundary

- New bridge: `platform/adapters/quote-preview/quote-preview-pdf-result-canonical-bridge.js`
- New tests: `platform/adapters/quote-preview/quote-preview-pdf-result-canonical-bridge.test.js`
- Minimal integration edit: `platform/adapters/quote-preview/quote-preview-pdf-result-persistence-coordinator.js`

## Still forbidden

- Engine changes
- Persistence-contract changes
- Store changes
- Modal changes
- Product Intelligence changes
- Schema changes
- Invented context
- Backend, official quote or quote-truth effects

## Next gate

`107Z15E4_MINIMAL_CANONICAL_BRIDGE_IMPLEMENTATION_GATE`
