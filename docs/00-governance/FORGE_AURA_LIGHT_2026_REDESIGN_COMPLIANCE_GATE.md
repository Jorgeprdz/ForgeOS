# Forge Aura Light 2026 — Mandatory Redesign Compliance Gate

## Status

**LOCKED / MANDATORY / ACTIVE**

## Purpose

This gate makes Forge Aura Light 2026 mandatory for every new visual redesign implementation.

Canonical authority:

- `adr/ADR-024 — Forge Aura Light 2026 Canonical Redesign Design Authority.txt`
- `docs/05-foundation/design-system/FORGE_AURA_LIGHT_2026_CANONICAL_DESIGN_SYSTEM.md`
- `docs/05-foundation/design-system/FORGE_AURA_LIGHT_2026_CANONICAL_AUTHORITY.md`

Ratified source PDF fingerprint:

- SHA-256: `0dbda2ae17d80602c7943bf139015177dbeb340a5edd5d9a5983bd24d5b6672e`

## Required pre-work declaration

Every UI redesign, cleanroom frontend, visual migration, component-system implementation, shell redesign or module redesign must include the following block before implementation:

```text
FORGE AURA LIGHT 2026 GATE

Canonical Authority:
- docs/05-foundation/design-system/FORGE_AURA_LIGHT_2026_CANONICAL_DESIGN_SYSTEM.md

Source PDF SHA-256:
- 0dbda2ae17d80602c7943bf139015177dbeb340a5edd5d9a5983bd24d5b6672e

Version:
- 1.0

Compliance Status:
- required

Applicable Surfaces:
- [exact UI files, routes, components and modules]

Legacy Visual Imports:
- forbidden

Token Strategy:
- canonical Forge Aura Light tokens only

Responsive Evidence:
- compact / medium / expanded / wide

Accessibility Evidence:
- keyboard / focus / contrast / zoom / reduced motion / target size

Data Honesty Evidence:
- normal / empty / loading / error / disconnected / no permission

Visual Acceptance:
- comparison against canonical authority and ratified visual source required
```

## Blocking rule

Work is blocked when any of the following is true:

- the gate is absent;
- the canonical authority is not named;
- legacy visual CSS or UI is imported into a cleanroom redesign;
- local ungoverned colors, sizes, radii, shadows or motion values are introduced;
- responsive and accessibility evidence is missing;
- example data is presented as production truth;
- implementation relies on a mockup while contradicting Aura Light;
- the work claims visual PASS without canonical comparison.

Correct status:

```text
BLOCKED_BY_FORGE_AURA_LIGHT_2026_GATE=YES
```

## Non-authorization rule

This gate defines visual authority. It does not independently authorize UI, runtime, route, schema, RLS, data, business-logic or deployment changes. Each implementation still requires its own complete Constitutional Gate and approved execution scope.
