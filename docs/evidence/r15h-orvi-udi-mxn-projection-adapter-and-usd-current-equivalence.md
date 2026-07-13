# R15H ORVI UDI MXN Projection Adapter And USD Current Equivalence

## Result

`PASS_R15H_ORVI_UDI_MXN_PROJECTION_ADAPTER_AND_USD_CURRENT_EQUIVALENCE`

- Adapter implemented: yes.
- UDI current equivalence: pass.
- UDI future 4.5% scenario: pass.
- USD current equivalence: pass.
- USD future blocked: pass.
- Policy-year offset: pass.
- Per-payment-year projected accumulation: pass.
- Synthetic regression: pass.
- Private real-source structural regression: required.
- Real rate snapshot committed: no.
- Real quote values committed: no.
- Runtime changed: no.
- UI changed: no.
- Next: `R15I_ORVI_DASHBOARD_VIEW_MODEL_AND_DYNAMIC_PROTECTION_RECOVERY_CONTRACT`.

## Important calculation boundary

Cumulative projected paid uses each payment's own policy-year projected UDI rate. This preserves timing and avoids valuing every historical payment at the future checkpoint rate.

## Synthetic fixture

The committed fixture uses:

- invented UDI and USD rates;
- invented source amounts;
- a 10-payment synthetic variant;
- checkpoints 10, 15, and 20;
- no identity fields;
- no production rate metadata.

## Required states

- Current UDI/USD equivalence requires verified non-stale metadata.
- Future UDI is scenario-only.
- Future USD is blocked with `null` rate and amounts.
- Recommendation remains `null`.
- Human decision remains required.
- Future values are not guaranteed.

## Private regression

The real ORVI PDF is parsed and mapped privately. A synthetic rate is used only to confirm adapter compatibility and dynamic checkpoint structure. The report stores no real amounts.
