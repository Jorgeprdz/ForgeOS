# Forge Mobile Navigation and Smart Widget Pattern 057C

Status: DRAFT / PATTERN LOCK

## Pattern Summary

Forge mobile combines:

- a contextual top nav;
- a persistent bottom nav;
- Alfred orb;
- command bar;
- adaptive Smart Widget cards.

This creates a premium mobile system where the user can move fast without losing context.

## Mobile Screen Order

Recommended first screen order:

1. safe pill;
2. greeting and profile;
3. contextual top nav;
4. Alfred hero;
5. Plan de hoy;
6. adaptive Smart Widget;
7. opportunities preview;
8. KPIs / charts;
9. recommendations.

## Top Contextual Nav

Top nav is a module filter, not the app navigation.

Visual:

- rounded glass pill;
- icon plus short label;
- active tab with gold/cyan emphasis;
- no ASCII icons;
- no default buttons.

Interaction:

- tap changes context;
- hide on scroll down;
- show on scroll up;
- does not replace command bar.

## Bottom Global Nav

Bottom nav is the primary global map.

Visual:

- floating pill;
- glass navy;
- soft shadow;
- premium icons;
- label readable;
- Alfred active state uses gold/cyan.

Overlap rule:

Overlap is allowed when content is scroll-recoverable.
Overlap is not allowed when it hides the only visible primary action or section heading.

## Alfred Orb

The orb is not decoration.

It is Alfred's command entry point.

Visual:

- circle;
- refined bow tie mark;
- gold-to-cyan gradient;
- blurred breathing halo;
- navy rim/depth.

Behavior:

- tap opens command bar;
- command bar opens smoothly;
- orb should visually connect to Alfred active nav state.

## Command Bar

Closed:

- orb only.

Open:

- pill input above bottom nav;
- close button;
- preview/submit affordance;
- placeholder examples: `/Llamar, /Mandar mensaje, /Follow`;
- results hidden until typing.

Results:

- one to three relevant results;
- filtered by typed content;
- each result is preview-only;
- no execution without approval.

## Smart Widget

Smart Widget is the "why now" surface.

Card format:

- eyebrow;
- title;
- client/entity;
- score/status;
- why now;
- human boundary;
- optional CTA.

Adaptive height:

- each slide sets its own height;
- transition should animate height, not jump;
- cards should not be forced into one fixed height.

Dots:

- one dot row only;
- active dot is a small liquid capsule;
- animation stays inside the dot track.

## Mobile Radius Addendum

Forge mobile is more rounded than desktop.

Use:

- `--forge-mobile-card-radius: 34px`;
- `--forge-mobile-panel-radius: 30px`;
- `--forge-mobile-widget-radius: 36px`;
- `--forge-mobile-mini-card-radius: 24px`;
- `--forge-pill-radius: 999px`.

## Anti-patterns

Do not:

- render desktop workspace in mobile;
- show raw tables in primary mobile flow;
- duplicate Smart Widget stacks;
- duplicate dot rows;
- let command results show before typing;
- use default browser buttons;
- over-repeat safety text;
- make Alfred a generic letter badge.

## Decision

DECISION=FORGE_MOBILE_NAVIGATION_AND_SMART_WIDGET_PATTERN_057C
