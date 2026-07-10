# 107Z15S — Canonical schema owner reconciliation

Status: **PASS**

## Result

- Canonical schema match confirmed: `false`
- Canonical schema mismatch confirmed: `true`
- Engine-owned fields: `6`
- Adapter-derived-only fields: `2`
- Persistence/UI-only fields: `0`
- Unowned canonical fields: `0`
- Manual mapping gate safe to continue: `false`

## Field provenance

| Canonical field | Classification | Runtime owner | Engine aliases | Adapter getField groups |
|---|---|---|---|---|
| `name` | `ADAPTER_DERIVED_ONLY` | `adapter` | `[]` | `[]` |
| `family` | `ADAPTER_DERIVED_ONLY` | `adapter` | `[]` | `[]` |
| `product` | `ENGINE_NATIVE_OR_ENGINE_DERIVED` | `engine` | `[]` | `[]` |
| `insured` | `ENGINE_NATIVE_OR_ENGINE_DERIVED` | `engine` | `['sumInsured']` | `[]` |
| `sumAssured` | `ENGINE_NATIVE_OR_ENGINE_DERIVED` | `engine` | `['sumInsured']` | `[]` |
| `annualPremium` | `ENGINE_NATIVE_OR_ENGINE_DERIVED` | `engine` | `[]` | `[]` |
| `plannedOrAvePremium` | `ENGINE_NATIVE_OR_ENGINE_DERIVED` | `engine` | `['annualPremium', 'baseAnnualPremium', 'plannedAnnual', 'plannedMonthly', 'plannedQuarterly', 'plannedSemiannual', 'premium', 'premiumTable', 'totalAnnualPremium']` | `[]` |
| `coveragePeriod` | `ENGINE_NATIVE_OR_ENGINE_DERIVED` | `engine` | `['coverage', 'guaranteePeriod']` | `[]` |

## Interpretation

A field may be manually mapped only when the productive runtime has evidence
for it in the engine or an explicit derivation in the adapter. A field that
exists only in persistence/UI, or has no productive owner, is a schema
reconciliation problem and must not be assigned to a convenient native key.

## Boundaries

- Schema changed: `false`
- Manual mapping approved: `false`
- Source changes: `false`
- Engine/parser/browser/PDF/backend execution: `false`

## Next gate

`107Z15S1_CANONICAL_SCHEMA_CORRECTION_AUTHORIZATION_GATE`
