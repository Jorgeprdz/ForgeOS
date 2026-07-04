# Forge Mobile Component System 001

Status: DRAFT / MOBILE PATTERN LOCK

## Mobile Role

Mobile is the fast action surface.
It should reduce decision friction and make the next best action obvious.

## Navigation

### Top nav

Role: contextual navigation inside the current module.

Examples:

- Hoy
- Seguimiento
- Produccion
- Actividad
- Comisiones

Behavior:

- visible at top on initial view;
- may disappear while scrolling;
- should not replace bottom nav;
- should feel like a premium contextual toolbar.

### Bottom nav

Role: global navigation.

Items:

- Inicio
- Pipeline
- Clientes
- Alfred
- Mas

Rules:

- persistent;
- glass/navy;
- active state uses gold/cyan;
- icon and label must both be readable;
- may overlay content if scrolling allows content to be read later;
- must not permanently block primary CTA or critical heading.

## Alfred Orb

Role: entry point to Alfred command.

Rules:

- perfect circle;
- bow tie intelligence mark;
- navy/gold/cyan gradient;
- halo blurred animation;
- bottom-right placement;
- opens command bar;
- may overlay content, but should not block the only visible action.

## Command Bar

Role: business action input.

Examples:

- `/Llamar Juan`
- `/Mandar mensaje Lariza`
- `/Follow Juan`
- `/Cotizar GMM`

Rules:

- pill input;
- opens smoothly from orb;
- shows results only after typing;
- results are preview-only unless explicitly approved;
- never sends, writes CRM, creates calendar, or mutates truth in static preview.

## Smart Widgets

Role: explain context and next best action.

Rules:

- one card per page;
- swipe horizontal;
- dots below;
- active dot may animate like a liquid drop;
- widget height adapts to content;
- no clipping;
- no giant blank space;
- content must include what, why now, and human boundary.

## Cards

Mobile cards should be:

- clear;
- glass;
- rounded;
- text-light;
- action-oriented.

Avoid:

- raw tables;
- default buttons;
- debug labels;
- too many repeated safety chips.

## Decision

DECISION=FORGE_MOBILE_COMPONENT_SYSTEM_001_DRAFT_LOCKED
