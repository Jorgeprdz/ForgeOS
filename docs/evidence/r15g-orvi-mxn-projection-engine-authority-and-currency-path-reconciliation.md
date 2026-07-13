# R15G ORVI MXN Projection Engine Authority And Currency Path Reconciliation

## Result

`PASS_R15G_ORVI_MXN_PROJECTION_ENGINE_AUTHORITY_AND_CURRENCY_PATH_RECONCILIATION`

- UDI current: ready.
- UDI future: ready as a 4.5% scenario, not guaranteed.
- USD current: ready.
- USD future: blocked.
- Policy-year offset rule: `policy_year_minus_one`.
- Legacy ORVI conversion authority: `NO`.
- Runtime changed: `NO`.
- UI changed: `NO`.
- Next: `R15H_ORVI_UDI_MXN_PROJECTION_ADAPTER_AND_USD_CURRENT_EQUIVALENCE`.

## Inventory

- Verified-rate cache candidates: `2`.
- Verified UDI calculator candidates: `3`.
- Generic projection candidates: `5`.
- Legacy ORVI conversion candidates: `3`.
- SeguBeca runtime candidates: `0`.
- Dedicated USD-future candidates: `1`.
- ORVI workbook formula hits for 4.5%: `2`.

## Key reconciliation

- Current Banxico-backed rate metadata is current-value authority only.
- The ORVI workbook supports the 4.5% UDI scenario but remains derived evidence.
- Generic projection math cannot choose its own rate.
- The legacy ORVI converter cannot become canonical through prior existence.
- A product-specific SeguBeca runtime cannot be reused as ORVI authority.
- The USD current FIX rate does not authorize a future USD/MXN forecast.
- Policy year 1 must use zero projection years.

## Regression requirements

- UDI current path resolves.
- UDI future path resolves with 4.5%.
- USD current path resolves.
- USD future path remains blocked with `null` growth rate.
- Policy year 20 maps to offset 19.
- No rate snapshot is embedded.
- Recommendation remains `null`.
- Runtime and dashboard remain unauthorized.

## No implementation yet

R15G does not calculate or persist any MXN amount. It establishes authority for R15H.
