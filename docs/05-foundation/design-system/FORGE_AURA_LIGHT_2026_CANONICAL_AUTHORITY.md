# Forge Aura Light 2026 - Canonical Redesign Authority

## Status

**RATIFIED / CANONICAL / ACTIVE / LOCKED**

## Authority

This document declares the following artifact to be the official and canonical visual design authority for every new Forge redesign implementation:

- `docs/05-foundation/design-system/Forge_Aura_Light_2026_Sistema_de_Diseno.pdf`
- Title: **Forge Aura Light 2026 - Linea visual, principios de producto y tokens de implementacion**
- Version: **1.0**
- Ratification date: **2026-08-04**
- Human owner: **Jorge Ignacio Palacios Rodriguez**
- SHA-256: `0dbda2ae17d80602c7943bf139015177dbeb340a5edd5d9a5983bd24d5b6672e`

The PDF is normative. This Markdown file is its governance and implementation envelope; it does not replace, reinterpret, or dilute the PDF.

## Canonical Rule

> Las acciones flotan. La informacion se organiza. El color orienta.

Any new Forge visual redesign, cleanroom frontend, migrated screen, component library, shell, route surface, responsive layout, dashboard, module, document preview, onboarding experience, navigation system, Smart Widget or interaction pattern **MUST comply strictly** with Forge Aura Light 2026.

## Normative Scope

The canonical PDF governs:

- visual personality and product principles;
- color palette and semantic color usage;
- neutral hierarchy and surface architecture;
- semantic tokens and authorized gradients;
- typography and information density;
- spacing, shape, radius and elevation;
- floating top bars, navigation bars and CTA bars;
- cards, components and Smart Widgets;
- iconography and the restricted use of 3D illustration;
- motion and interactive states;
- accessibility requirements;
- implementation-ready CSS tokens;
- responsive hierarchy and visual governance acceptance criteria.

## Strict Compliance Rules

A redesign implementation is non-compliant when it:

1. introduces local colors without a semantic token and approved role;
2. creates module-specific visual systems or isolated palettes;
3. uses gradients outside the authorized set without a ratified version change;
4. treats every datum as an independent card;
5. floats content instead of actions and controls;
6. invents typography sizes, spacing values, radii, shadows or breakpoints locally;
7. communicates state only through color;
8. omits explicit loading, empty, error, disconnected or permission states;
9. presents example metrics as real data;
10. compresses desktop layouts into mobile without preserving hierarchy;
11. imports or visually extends legacy recovery CSS, Material 3 overrides or ad hoc inline styles into the new redesign;
12. uses 3D illustration as recurring decoration in productive operational surfaces;
13. violates keyboard, zoom, contrast, target-size or reduced-motion requirements;
14. departs from the PDF because of personal preference, framework defaults or implementation convenience.

## Authority Precedence

For visual redesign decisions, authority applies in this order:

1. Article 0 and the Forge Constitution;
2. canonical truth, authority and accessibility ADRs;
3. `ADR-024 - Forge Aura Light 2026 Canonical Redesign Design Authority`;
4. the canonical PDF;
5. this authority envelope and compliance gate;
6. approved screen specifications and acceptance evidence;
7. implementation details.

When a mockup, previous design direction, framework default, old screenshot, recovery stylesheet, legacy UI or developer preference conflicts with the canonical PDF, **the canonical PDF prevails**.

Higher-order truth, security, accessibility and human-authority rules always remain binding. Visual compliance may never be used to weaken them.

## Supersession Boundary

Forge Aura Light 2026 supersedes prior visual directions **for all new redesign work**, including ad hoc Material 3 styling, dark organic visual language, recovery CSS conventions, isolated module palettes and ungoverned component variants.

It does **not**:

- rewrite historical ADRs;
- automatically replace the current production runtime;
- authorize implementation, route mutation or deployment by itself;
- authorize business-logic, schema, RLS, product, quote, forecast or compensation changes;
- require destructive removal of a working legacy surface before an approved cleanroom replacement passes acceptance.

A separate governed execution scope is required before code changes begin.

## Implementation Gate

Every future redesign task must declare:

```text
AURA_LIGHT_AUTHORITY=docs/05-foundation/design-system/Forge_Aura_Light_2026_Sistema_de_Diseno.pdf
AURA_LIGHT_VERSION=1.0
AURA_LIGHT_COMPLIANCE=REQUIRED
LEGACY_VISUAL_IMPORTS=FORBIDDEN
LOCAL_UNGOVERNED_TOKENS=FORBIDDEN
VISUAL_ACCEPTANCE_AGAINST_CANONICAL_PDF=REQUIRED
```

If this declaration is absent, the redesign task is **BLOCKED BY ROBOCOP LOCK 001**.

## Acceptance Evidence

A redesign implementation may be marked PASS only when evidence demonstrates:

- token conformance;
- semantic color conformance;
- component and surface hierarchy conformance;
- mobile, tablet and desktop hierarchy preservation;
- keyboard and focus behavior;
- zoom and reflow behavior;
- reduced-motion behavior;
- honest data and disconnected states;
- no legacy visual imports;
- visual comparison against the canonical PDF and approved target screens.

Screenshots alone are not sufficient where interaction, focus, responsive behavior or data truth is claimed.

## Change Control

The canonical PDF is locked at version 1.0.

It may be changed only through:

1. an explicit human-owner decision;
2. Miranda approval;
3. Board approval;
4. a new versioned artifact;
5. an ADR or amendment defining supersession;
6. checksum and registry updates;
7. review-ready pull request and human merge.

Silent edits, replacement in place and local reinterpretations are forbidden.
