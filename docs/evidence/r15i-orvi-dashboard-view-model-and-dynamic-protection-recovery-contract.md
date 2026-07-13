# R15I ORVI Dashboard View Model And Dynamic Protection Recovery Contract

## Result

`PASS_R15I_ORVI_DASHBOARD_VIEW_MODEL_AND_DYNAMIC_PROTECTION_RECOVERY_CONTRACT`

- Dashboard view-model contract: implemented.
- Protection view: implemented.
- Guaranteed recovery view: implemented.
- Exact dynamic checkpoint years: preserved.
- Nearest-year substitution: no.
- UDI current and future states: represented.
- USD current and blocked-future states: represented.
- Synthetic regression: required.
- Private real-source structural regression: required.
- Runtime changed: no.
- UI changed: no.
- Browser executed: no.
- Next: `R15J_ORVI_VERIFIED_RATE_METADATA_BRIDGE_AND_RUNTIME_ORCHESTRATION_READINESS`.

## Contract boundaries

- Two explicit views prevent the renderer from interpreting raw quote data.
- Protection remains the primary product classification.
- Recovery comparison remains analytical, not an investment-return calculation.
- Future UDI values remain scenario values.
- Future USD values remain blocked.
- Recommendation remains `null`.
- Human decision remains required.

## Synthetic coverage

The synthetic fixture validates:

- UDI checkpoints 10, 15, and 20;
- USD checkpoints 10, 15, and 20;
- protection current MXN equivalence;
- protection future UDI scenarios;
- recovery current and future values;
- exact checkpoint matching;
- USD future blocked states;
- no runtime or UI authorization.

## Private regression

The private quote is parsed, mapped, analyzed, converted with an explicitly synthetic test rate, and transformed into the dashboard contract. Only structural booleans are retained in the report.
