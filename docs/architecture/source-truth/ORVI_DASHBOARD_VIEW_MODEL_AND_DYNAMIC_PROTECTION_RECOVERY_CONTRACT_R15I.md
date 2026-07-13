# ORVI Dashboard View Model And Dynamic Protection Recovery Contract R15I

## Decision

`PASS_R15I_ORVI_DASHBOARD_VIEW_MODEL_AND_DYNAMIC_PROTECTION_RECOVERY_CONTRACT`

- Canonical owner: `product-intelligence`.
- View-model ID: `orvi.dashboard.dynamic-protection-recovery-view-model.v1`.
- Protection view: ready.
- Guaranteed recovery view: ready.
- Dynamic checkpoints: ready.
- Runtime wiring: no.
- UI rendering: no.
- Recommendation: `null`.
- Next: `R15J_ORVI_VERIFIED_RATE_METADATA_BRIDGE_AND_RUNTIME_ORCHESTRATION_READINESS`.

## Purpose

R15I creates the contract consumed by a future ORVI dashboard. It does not render HTML, mutate the live runtime, read Banxico, or make decisions for the user.

The dashboard consumer receives two explicit views instead of interpreting raw Product Intelligence.

## Protection view

The protection view exposes:

1. Contracted source-currency sum assured.
2. Current verified-rate MXN equivalence.
3. UDI future MXN scenarios at exact dynamic checkpoints.
4. Explicit blocked states for future USD projection.
5. A continuity boundary tied to the contracted variant.

The view does not infer that every ORVI variant has identical duration or payment structure.

## Guaranteed recovery view

Every exact R15F checkpoint exposes:

- policy year;
- attained age when available;
- payment phase;
- cumulative paid;
- guaranteed surrender value;
- cash value;
- total recovery;
- recovery difference;
- recovery ratio;
- recovery percentage;
- current MXN equivalence;
- authorized future UDI scenario or blocked USD state.

Nearest-year substitution remains forbidden.

## Labels

The contract provides stable Spanish labels:

- `Protección`.
- `Recuperación garantizada`.
- `Suma asegurada contratada`.
- `Equivalencia actual en MXN`.
- `Escenario futuro estimado en MXN`.
- `Total aportado`.
- `Recuperación total`.
- `Diferencia`.
- `Porcentaje de recuperación`.

The labels do not classify ORVI as savings or investment.

## Disclosure contract

- Product classification: life insurance protection.
- Current MXN: equivalence at a caller-supplied verified rate.
- Future UDI MXN: 4.5% scenario, not guaranteed.
- Future USD MXN: blocked.
- Source values: preserved from the illustrative quote through Product Intelligence.
- Recovery ratio: comparison only, not investment return.
- Recommendation: `null`.
- Human decision: required.

## Rate metadata

The view model may carry the runtime rate key, provider, source date, and source mode supplied by R15H. It does not persist a production rate snapshot in source code.

The current rate is not a future forecast.

## Consumer boundary

R15I authorizes a data contract only.

It does not authorize:

- runtime orchestration;
- rate-provider integration;
- DOM rendering;
- dashboard insertion;
- visual styling;
- browser automation;
- cancellation or continuation recommendations.

Browser validation becomes required after a later module wires the contract into the UI.

## Privacy

The private real-source regression commits no path, fingerprint, PDF text, client content, or real quote values.

## Next

`R15J_ORVI_VERIFIED_RATE_METADATA_BRIDGE_AND_RUNTIME_ORCHESTRATION_READINESS`
