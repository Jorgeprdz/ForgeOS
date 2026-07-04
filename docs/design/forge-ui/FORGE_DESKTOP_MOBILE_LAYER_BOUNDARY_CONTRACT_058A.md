# Forge Desktop/Mobile Layer Boundary Contract 058A

Status: DESIGN CONTRACT / STATIC PREVIEW ONLY

## Contract

Forge Alive static preview has two visual layers:

- Mobile layer: locked baseline for 057H/057N.
- Desktop layer: active workstream, not yet visually locked.

The layers must not rely on accidental cascade order. Each layer must have an explicit root, explicit media boundary, and explicit load contract.

## Breakpoints

Mobile:

```css
@media (max-width: 767px), (max-width: 900px) and (orientation: landscape) {}
```

Desktop:

```css
@media (min-width: 901px) {}
```

Tablet landscape below or equal to 900px is mobile-family for Forge Alive until a separate tablet shell is scoped.

## Root Visibility

Desktop roots:

- `.forge-desktop-workspace-056y`
- `.alfred-desktop-app-056g7`

Desktop roots are hidden by default outside desktop media.

Mobile roots:

- `.bottom-nav`
- `.forge-nav-root-056k7`
- `.forge-mobile-context-nav-057d`
- `.forge-mobile-widget-grid-057j`
- `.alfred-command-root-056k3`
- `.alfred-command-root-056k4`
- `.alfred-command-root-056k5`
- `.forge-ux99-focus-root-056p`
- `.forge-focus-root-056p2`

Mobile roots are hidden outside mobile media.

## Shared Component Rules

Smart Widgets may be shared at data/component level, but placement must be owned by the active layer.

Command orb/bar may be shared at component level, but the visual slot must be owned by the active layer.

Shared CSS may define:

- tokens
- base typography
- reset
- accessibility primitives
- boundary guards

Shared CSS must not define:

- desktop grid
- mobile nav layout
- command dock placement
- card density
- breakpoint-specific composition

## Load Order Contract

Target load order:

1. shared tokens/base
2. mobile entry CSS, media guarded
3. desktop entry CSS, media guarded
4. shared boundary CSS
5. shared boundary JS
6. mobile entry JS, `matchMedia` guarded
7. desktop entry JS, `matchMedia` guarded

058A does not require the complete migration to this order. It establishes the contract and adds only a minimal safe guard.

## No-Contamination Rules

- Desktop must never show mobile bottom navigation.
- Mobile must never show desktop sidebar, desktop command workspace, desktop KPI strips, desktop tables, or desktop right rail.
- Mobile scripts must not mount desktop roots.
- Desktop scripts must not mutate mobile-only navigation or widget grid.
- Legacy layers must be documented before removal or auto-load changes.

## Visual Boundary

058A is not a visual redesign. If a selector changes visual style beyond visibility guards, it belongs in a later visual implementation scope.

## Safety Boundary

Static preview may run local UI listeners only.

Not allowed:

- CRM writes
- calendar creates
- message sends
- provider runtime execution
- browser storage
- truth mutation
- approval mutation
- live network execution
