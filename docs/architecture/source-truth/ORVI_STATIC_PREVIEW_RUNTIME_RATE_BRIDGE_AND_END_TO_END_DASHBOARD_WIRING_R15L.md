# ORVI Static Preview Runtime Rate Bridge And End To End Dashboard Wiring R15L

## Decision

`PASS_R15L_ORVI_STATIC_PREVIEW_RUNTIME_RATE_BRIDGE_AND_END_TO_END_DASHBOARD_WIRING`

- Runtime ID: `orvi.static-preview.runtime-rate-bridge.v1`.
- Existing reusable template: retained.
- Accepted quote route: wired.
- Current UDI and USD cache bridge: wired.
- External live provider: no.
- Future USD projection: blocked.
- Recommendation: `null`.
- Manual visual acceptance: required.
- Next: `R15M_ORVI_MANUAL_VISUAL_ACCEPTANCE_AND_RESPONSIVE_HARDENING`.

## Browser deployment mirrors

GitHub Pages serves the `docs` deployment surface. R15L publishes five byte-identical mirrors of canonical R15F-R15J modules beneath the static preview. These mirrors are deployment artifacts, not a second authority. A SHA-256 regression requires each mirror to remain byte-identical to its canonical source.

## Rate bridge

The browser runtime reads the existing public `forge-rate-cache.json`.

- UDI selects `UDI_MXN`.
- USD selects `USD_MXN_FIX`.
- The value must be finite and positive.
- The record must declare `LATEST_VERIFIED`.
- The cache must declare `CACHE_REFRESHED` or `CACHE_HIT`.
- Explicit stale flags are rejected.
- The browser classifies the source as `CACHE`.
- The rate is consumed at runtime and is not copied into Product Intelligence source code.

No Banxico or other external network provider is called by R15L.

## Accepted quote flow

`calculateAcceptedQuote` checks ORVI before Vida Mujer, SeguBeca and the generic fallback. The ORVI route requires canonical Product Intelligence, builds R15F analytics, runs the R15H/R15I/R15J chain and attaches readiness, view model and verified metadata. R15K then reuses the Vida Mujer dashboard template.

## Cache invalidation

The accepted adapter, shared renderer, accepted bridge and live bridge importer use the R15L version tag so the browser does not retain the earlier module graph.

## Private visual packet

The private real-source regression writes a local JSON packet beneath the report directory. Identity and contact fields are removed. Real quote values remain local and are never staged or committed. The packet is intended only for manual visual inspection in the existing static preview.

## Semantic boundaries

- ORVI remains life-insurance protection.
- Current MXN is a verified-rate equivalence.
- Future UDI MXN is a 4.5% scenario, not a guarantee.
- Future USD MXN remains blocked.
- Recovery percentage is comparison only, not investment return.
- Recommendation remains `null`.
- Human decision remains required.

## Next

`R15M_ORVI_MANUAL_VISUAL_ACCEPTANCE_AND_RESPONSIVE_HARDENING`
