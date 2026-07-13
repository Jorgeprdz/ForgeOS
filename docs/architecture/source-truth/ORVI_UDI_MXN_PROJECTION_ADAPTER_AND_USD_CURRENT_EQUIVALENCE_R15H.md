# ORVI UDI MXN Projection Adapter And USD Current Equivalence R15H

## Decision

`PASS_R15H_ORVI_UDI_MXN_PROJECTION_ADAPTER_AND_USD_CURRENT_EQUIVALENCE`

- Canonical owner: `product-intelligence`.
- Adapter ID: `orvi.mxn-equivalence-and-udi-projection-adapter.v1`.
- UDI current: implemented.
- UDI future: implemented as 4.5% scenario, not guaranteed.
- USD current: implemented.
- USD future: blocked.
- Live rate provider: not implemented.
- Runtime wiring: no.
- Dashboard wiring: no.
- Recommendation: `null`.
- Next: `R15I_ORVI_DASHBOARD_VIEW_MODEL_AND_DYNAMIC_PROTECTION_RECOVERY_CONTRACT`.

## Inputs

The adapter consumes:

1. Canonical ORVI Product Intelligence.
2. R15F dynamic checkpoint analytics.
3. Caller-supplied verified rate metadata.

The adapter does not own source extraction, product truth, current-rate retrieval, or dashboard rendering.

## Current equivalence

Current UDI and USD source amounts are multiplied by the corresponding verified current rate supplied by the caller.

Required rate keys:

- UDI: `UDI_MXN`.
- USD: `USD_MXN_FIX`.

A stale rate is rejected. Synthetic test rates must be explicitly marked as synthetic.

## UDI future scenario

For policy year `n`:

`projected_rate = verified_base_rate × (1 + 0.045)^(n - 1)`

The output is labeled:

`PROJECTED_UDI_4_5_PERCENT_SCENARIO_NOT_GUARANTEED`

Future values are not contractual guarantees.

## Cumulative paid projection

Projected cumulative paid is calculated payment by payment:

`sum(payment_at_year_n × projected_UDI_rate_at_year_n)`

The adapter does not multiply the complete source-currency cumulative total by the checkpoint-year projected UDI. That shortcut would move earlier payments forward in time and distort the comparison.

## Checkpoint fields

For every exact R15F checkpoint:

- current cumulative paid MXN;
- current surrender value MXN;
- current cash value MXN;
- current total recovery MXN;
- current recovery difference and ratio;
- projected UDI cumulative paid MXN;
- projected UDI surrender value MXN;
- projected UDI cash value MXN;
- projected UDI total recovery MXN;
- projected recovery difference and ratio.

## Sum assured

- UDI and USD receive a current MXN equivalence.
- UDI receives future MXN scenarios at dynamic checkpoint years.
- USD future sum-assured projection remains blocked.

## Privacy

The private real-source regression uses a synthetic test rate and retains only structural booleans. It commits no names, contacts, PDF text, path, fingerprint, or real quote values.

## Prohibited

- No live Banxico call.
- No direct cache read.
- No stale fallback.
- No future USD assumption.
- No hidden rate assumption.
- No guarantee label for projected values.
- No investment-return classification.
- No recommendation.
- No runtime, dashboard, or UI wiring.

## Next

`R15I_ORVI_DASHBOARD_VIEW_MODEL_AND_DYNAMIC_PROTECTION_RECOVERY_CONTRACT`
