# Forge Mobile Navigation and Smart Widget Pattern Scope 057C

Status: GREEN / SCOPED

## Purpose

057C scopes the next mobile design implementation phase after `FORGE_UI_DESIGN_LINE_001`.

This phase does not mutate static preview UI. It defines the mobile pattern contract for:

- top contextual navigation;
- bottom global navigation;
- Alfred orb;
- command bar relationship;
- adaptive Smart Widget carousel;
- mobile radius rules;
- overlap and scroll rules.

## Boundary

Allowed in this phase:

- docs/source-truth only;
- pattern definition;
- implementation acceptance criteria.

Forbidden in this phase:

- editing static preview HTML/CSS/JS;
- changing mobile layout;
- changing desktop layout;
- adding runtime actions;
- CRM/calendar/message mutations;
- network/provider/browser storage usage.

## Prior Locks

057C inherits:

- `FORGE_UI_DESIGN_LINE_001`;
- `FORGE_UI_TOKENS_001`;
- `FORGE_MOBILE_COMPONENT_SYSTEM_001`;
- `FORGE_MOTION_SYSTEM_001`;
- `FORGE_INTERACTION_RULES_001`.

## Locked Design Direction

Forge mobile uses premium system patterns without copying external brands.

The locked Forge identity remains:

- navy base;
- navy glass;
- gold action;
- blue/cyan intelligence;
- human approval;
- fewer clicks;
- mobile first.

## Scope Items

### 1. Top contextual nav

Top nav lives near the top of the mobile module.

It is contextual, not global.

Candidate tabs:

- Hoy;
- Seguimiento;
- Produccion;
- Actividad;
- Comisiones.

Behavior:

- visible near the first viewport;
- may hide on scroll down;
- may reappear on scroll up;
- should not compete with bottom nav;
- should not force extra clicks for the primary task.

### 2. Bottom global nav

Bottom nav remains global.

Items:

- Inicio;
- Pipeline;
- Clientes;
- Alfred;
- Mas.

Behavior:

- persistent;
- glass premium;
- active state in gold/cyan;
- may overlay content if content remains reachable by scrolling;
- must not permanently block critical CTAs, headings, or only-visible actions.

### 3. Alfred orb

Alfred orb is the floating entry to command.

Rules:

- perfect circle;
- refined bow tie mark;
- gold/cyan gradient;
- blurred halo;
- opens command bar;
- may overlap content only when scroll allows recovery;
- should not cover primary CTA in the first viewport.

### 4. Command bar relationship

The command bar is an action input.

Examples:

- `/Llamar Juan`;
- `/Mandar mensaje Lariza`;
- `/Follow Juan`;
- `/Cotizar GMM`;
- `/Subir poliza`.

Rules:

- closed state starts from orb;
- open state becomes pill input;
- results appear only after typing;
- preview-only until human approval;
- static preview must not execute.

### 5. Adaptive Smart Widget carousel

Smart Widget is a one-card-per-page carousel.

Rules:

- one visible card per page;
- adaptive height by content;
- no text clipping;
- no giant empty gaps;
- dots below card;
- liquid active dot animation;
- swipe and dot tap supported when implemented;
- content answers: what, who, why now, boundary.

### 6. Rounded mobile system

Mobile cards should be more rounded than desktop.

Recommended target:

- large cards: 30px to 36px;
- Smart Widget: 32px to 38px;
- compact cards: 22px to 26px;
- nav/button/chips: pill radius;
- orb: perfect circle.

## Implementation Sequencing

Recommended next implementation:

1. Add mobile pattern CSS variables only.
2. Tune rounded cards and safe overlap zones.
3. Implement top nav behavior without replacing bottom nav.
4. Stabilize adaptive Smart Widget height.
5. Validate 390x844, 390x1200, phone landscape.

## Acceptance Criteria

Mobile passes only if:

- desktop workspace does not render in mobile;
- mobile remains Forge premium, not raw fallback;
- top nav appears as contextual nav;
- bottom nav is readable and premium;
- orb has visible halo and does not block first CTA;
- Smart Widget appears after Plan de hoy;
- Smart Widget changes height by content;
- dots are singular and aligned;
- opportunities remain reachable without hidden content;
- no raw tables in primary mobile flow.

## Decision

DECISION=FORGE_MOBILE_NAVIGATION_AND_SMART_WIDGET_PATTERN_SCOPED_057C

## Next

057D_MOBILE_NAVIGATION_AND_SMART_WIDGET_PATTERN_IMPLEMENTATION
