# Forge Alive Desktop Landscape Cockpit Layout Scope 054A

`054A_FORGE_ALIVE_DESKTOP_LANDSCAPE_COCKPIT_LAYOUT_SCOPE`

## Decision

Forge Alive needs a real desktop / landscape cockpit layout, not a stretched phone layout.

Mobile portrait keeps the orb-to-pill command pattern. Tablet landscape and desktop should use the available space with a wider cockpit, an extended command bar, denser widget layout, and navigation moved into a compact menu or drawer.

## Navigation Rule

A hamburger menu is allowed for desktop / landscape as a compact navigation drawer trigger.

Use the hamburger for:

- primary route list
- secondary sections
- overflow navigation
- future command categories

Do not use hamburger to hide critical current-context information. The main screen must still show the command bar, current priority, and relevant smart widgets.

## Command Bar Rule

Desktop / landscape command bar should be extended by default.

Preferred placement:

- top centered or top-right command layer
- fixed or sticky within the cockpit chrome
- not blocking primary cards
- not sitting over the main CTA

Mobile portrait may keep the orb idle state.

## Cockpit Layout Rule

Desktop / landscape should stop behaving like one centered phone column.

The layout should:

- use a wide cockpit container
- place high-priority summary/hero content in a lead region
- place smart widgets in a multi-column or horizontal region
- allow more widgets per row
- increase card width where useful
- keep text readable without over-compression
- keep bottom/mobile nav from dominating desktop layout

## Widget Layout Rule

Smart widgets should use the larger surface:

- two or three visible widget cards per row/track where space allows
- larger cards than phone mode
- consistent card height where possible
- no three-card stacked mobile column in landscape
- no overlaying command layer on important widget text

## Visual Rule

Preserve Forge Alive visual language:

- premium dark cockpit
- glass/crystal materials
- Forge gold/cyan/blue glow
- no purple-first generic AI gradient
- compact operational density
- readable tablet/desktop proportions

## Safety Boundary

This scope does not add:

- live search
- runtime execution
- approval
- send
- task creation
- calendar creation
- CRM write
- truth mutation

All command/search/widget output remains read-model / preview / review first.

## Article 0

Desktop cockpit must strengthen human judgment by making context easier to compare at a glance.

It must not create dependency by hiding uncertainty, evidence, or human final authority.

## Implementation Gate

Next implementation may update static preview only if it:

- preserves mobile orb-to-pill behavior
- adds desktop/landscape cockpit layout
- repositions extended command bar for desktop/landscape
- adds hamburger/drawer navigation affordance
- reflows widgets into wider layout
- preserves glow/crystal command identity
- preserves read-only and no-action boundaries

## Next Phase

`054B_FORGE_ALIVE_DESKTOP_LANDSCAPE_COCKPIT_LAYOUT_IMPLEMENTATION`

## Final Decision

PASS_054A_DESKTOP_LANDSCAPE_COCKPIT_LAYOUT_SCOPE_READY
