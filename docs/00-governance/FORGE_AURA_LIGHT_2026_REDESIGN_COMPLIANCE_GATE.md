# Forge Aura Light 2026 - Mandatory Redesign Compliance Gate

## Status

**LOCKED / MANDATORY / ACTIVE**

## Purpose

This gate makes Forge Aura Light 2026 mandatory for every new visual redesign implementation.

Canonical authority:

- `adr/ADR-024 - Forge Aura Light 2026 Canonical Redesign Design Authority.txt`
- `docs/05-foundation/design-system/Forge_Aura_Light_2026_Sistema_de_Diseno.pdf`
- `docs/05-foundation/design-system/FORGE_AURA_LIGHT_2026_CANONICAL_AUTHORITY.md`

## Required Pre-Work Declaration

Every UI redesign, cleanroom frontend, visual migration, component-system implementation, shell redesign or module redesign must include the following block before implementation:

```text
FORGE AURA LIGHT 2026 GATE

Canonical Artifact:
- docs/05-foundation/design-system/Forge_Aura_Light_2026_Sistema_de_Diseno.pdf

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
- comparison against canonical PDF required
```

## Blocking Rule

Work is blocked when any of the following is true:

- the gate is absent;
- the canonical artifact is not named;
- legacy visual CSS or UI is imported into a cleanroom redesign;
- local ungoverned colors, sizes, radii, shadows or motion values are introduced;
- responsive and accessibility evidence is missing;
- example data is presented as production truth;
- implementation relies on a mockup while contradicting the canonical PDF;
- the work claims visual PASS without canonical comparison.

Correct status:

```text
BLOCKED_BY_FORGE_AURA_LIGHT_2026_GATE=YES
```

## Non-Authorization Rule

This gate defines visual authority. It does not independently authorize UI, runtime, route, schema, RLS, data, business-logic or deployment changes. Each implementation still requires its own complete Constitutional Gate and approved execution scope.
