# Forge Material 3 Runtime Migration Roadmap

## Authority

- Functional source: `feature/nfast-09-timeline-to-conversation-brief-projection` @ `7faf7ce20470fa076afdef1b75f909333686425b`
- Visual authority: `feature/ui-material3-design-system` @ `93f1ed317acad257ecd63879a37c977858d7eea2`
- Approved prototype source: `aeffc2e493ff9b5b3cf3cdb90e1f3c22d026b365`
- Migration branch: `feature/ui-material3-runtime-migration`

## Execution model

The migration runs as a secondary lane while NFAST/FES remains the primary functional lane.

## Stages

### UI-M00 — Runtime migration discovery

- Status: **COMPLETE**
- Runtime mutation: **NO**
- Output: runtime inventory, authority map and integration gates.

### UI-M01 — Tokens, primitives and feature flag

- Status: **COMPLETE**
- Approved tokens integrated behind an explicit feature flag.
- Reusable primitives added without replacing productive screens.
- Default runtime remains legacy.

### UI-M02 — Responsive app shell

- Status: **IN ACCEPTANCE**
- Responsive shell candidate materialized behind the feature flag.
- Real UI acceptance delegated to GitHub Actions Playwright.
- Closure remains blocked until the exact candidate commit is green.

### UI-M03 — Productive Home bindings

- Status: **EXECUTION_AUTHORIZED**
- Authority: `ADR-019 — UI-M03 Home and Alfred Material 3 Execution Authority`.
- Restore the approved clean Home and Alfred visual behavior without connecting
  productive backend actions, persistence or business rules.
- Preserve the frozen legacy source and publish the clean entrypoint only through
  the authorized Pages artifact overlay after the visual gate passes.

### UI-M04 — Canonical Forge Shell extraction and navigation contract

- Status: **EXECUTION_AUTHORIZED**
- Authority: `ADR-020 — UI-M04 Canonical Forge Shell Execution Authority`.
- Board scope selected after R16C: canonical Forge Shell extraction.
- Extract the approved Material 3 Home shell, navigation contract and lifecycle
  without redesigning Home or migrating Cotizaciones.
- Runtime branch: `feature/ui-m04-canonical-forge-shell`.
- Source commit: `f3c3d1dc6c65b6927c0ca7290d1ac90e138d4673`.
- Quote, Product Intelligence, financial, Supabase and legacy boundaries remain
  protected.

### UI-M05 — Cotizaciones visual migration and canonical Nav Pill integration

- Status: **EXECUTION_AUTHORIZED**
- Phase: `UI-M05_QUOTES_VISUAL_MIGRATION_AND_NAV_PILL_INTEGRATION`
- Authority: `ADR-021 — UI-M05 Quotes Visual Migration Execution Authority`.
- Source authority: successful UI-M04 commit
  `979b134231e5ffaf18652cef82e47ff3332cf6fc`.
- Mount the discovered functional Cotizaciones runtime in ForgeShell and
  migrate presentation to the approved Material 3 visual language.
- Quote functionality, engines, calculations, projections, persistence,
  Product Intelligence and Supabase remain protected.
- Runtime branch: `feature/ui-m05-quotes-visual-migration`.

### UI-M06+ — Incremental surfaces

- Status: **LOCKED**
- Prospects.
- Conversation and timeline.
- Agenda and secondary surfaces.

### UI-M05A — Quotes functional baseline repair

- Phase: `UI-M05A_QUOTES_FUNCTIONAL_BASELINE_REPAIR_AND_RUNTIME_ALIGNMENT`
- Status: **EXECUTION_AUTHORIZED**
- Corrective prerequisite for resuming UI-M05.

### UI-M05B — Quotes true Material 3 redesign and public runtime correction

- Phase: `UI-M05B_QUOTES_TRUE_MATERIAL3_REDESIGN_AND_PUBLIC_RUNTIME_CORRECTION`
- Status: **EXECUTION_AUTHORIZED**
- Authority: `ADR-023 — UI-M05B Quotes True Material 3 Redesign Authority`.
- Source commit: `b13986224ec091f32ad309bb7af5765e1db78122`.
- Runtime branch: `feature/ui-m05b-quotes-true-material3-redesign`.
- Corrects UI-M05 product acceptance by replacing the legacy DOM transplant
  with native Material 3 components and a narrow functional runtime adapter.
- Quote domain, Product Intelligence, Supabase, Nash, main and deployment
  remain protected.
- Owner visual acceptance is required before any promotion.

### UI-M05C — Quotes Product Intelligence presentation parity

- Phase: `UI-M05C_QUOTES_PRODUCT_INTELLIGENCE_PRESENTATION_PARITY`
- Status: **EXECUTION_AUTHORIZED**
- Authority: `ADR-024 — UI-M05C Product Intelligence Presentation Parity Authority`.
- Source commit: `ba96e2c5c2fc4a4149af6f6a5561dd13cf1895e5`.
- Runtime branch: `feature/ui-m05c-quotes-product-intelligence-parity`.
- Restores rich calculation, benefit-summary and Product Intelligence output
  inside the approved native Material 3 Cotizaciones workspace.
- Calculation semantics, Product Intelligence authority, product rules,
  parsers, mappers, rate cache, Supabase and Home remain protected.
- Owner functional acceptance remains pending.

## Parallelism rule

- Maximum active lanes: **2**.
- Primary lane: NFAST/FES.
- Secondary lane: UI runtime migration.
- No third structural rewrite may start while UI-M01 or a major NFAST/FES phase is open.
