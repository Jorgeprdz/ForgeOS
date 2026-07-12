# R14J SeguBeca Projected MXN Runtime Integration

## Decision

`PASS_FUNCTIONAL_R14J_SEGUBECA_PROJECTED_MXN_RUNTIME_INTEGRATION_MANUAL_VISUAL_PENDING`

## Approvals

- Board Approval: explicit instruction from the repository owner to convert SeguBeca results to MXN through authorized projection engines and perform the browser inspection manually from the versioned live URL.
- Miranda Approval: synthetic fixtures only; no client PDF, workbook contents, screenshots, names, identifiers, credentials, or private records are committed.
- Robocop Gate: Constitution, ADR-003, ADR-004, ADR-005, ADR-007, ADR-008, Roadmap, Master Build Tree, and Unified Build Tree were read before implementation.

## Root cause

The SeguBeca parser built the accepted packet and `benefitSummary` in native UDI before the browser UDI/MXN runtime ran. The runtime attached verified rate metadata and a projection timeline, but did not enrich SeguBeca monetary fields. The product dashboard adapter already supported `{ udi, mxn }` values, so most scalar UDI fields remained native-only.

## Minimum repair

- Keep the parser, renderer, dashboard adapter, layout, Excel, rate cache, and calculation engines unchanged.
- Reuse the existing verified UDI metadata provider and shared UDI projection timeline.
- Apply the workbook-supported 4.5% UDI scenario only to SeguBeca, preserving the generic runtime default for other products.
- Preserve every native UDI amount and add MXN companions with source, policy year, projection mode, and non-guaranteed labeling.
- Project current quote values at policy year 1, education values at maturity, administration values by source row offset, and accumulated contributions as an annual schedule rather than one flat multiplication.
- Return `BLOCKED_NO_VERIFIED_UDI_RATE` instead of inventing MXN when verified rate metadata is unavailable.

## Validation contract

- Baseline reproduction must fail the 95% MXN coverage threshold before repair.
- Focused R14J tests must reach at least 95% MXN coverage in the SeguBeca benefit summary.
- Existing non-browser UDI projection, browser-calculator logic, SeguBeca parser/runtime/dashboard, Vida Mujer, Imagina Ser, product-dashboard, and PDF parser regressions must pass.
- Tests that explicitly require Puppeteer or Chromium are recorded as manual-browser checks instead of blocking the implementation.
- The repository owner performs the live visual inspection after push at 768×1024, 1024×768, 1366×768, and 1536×864, confirming UDI and MXN visibility, no object serialization, no overflow, and no card overlaps.
- Protected upstream files must remain byte-identical.
- Exact staging, privacy scan, `git diff --check`, commit, push, and clean 0/0 synchronization are mandatory.

## Boundaries

No ORVI work. No parser changes. No renderer changes. No dashboard adapter changes. No CSS/layout changes. No workbook changes. No rate-cache mutation. No hardcoded client values. No projection presented as guaranteed.
