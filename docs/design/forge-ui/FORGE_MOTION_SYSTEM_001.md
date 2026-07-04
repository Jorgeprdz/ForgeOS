# Forge Motion System 001

Status: DRAFT / MOTION RULES

## Purpose

Motion in Forge must clarify state and reduce cognitive friction.
It must not be decorative noise.

## Principles

- Smooth, premium, quiet.
- Fast enough to feel responsive.
- Slow enough to feel intentional.
- No bouncing toy-like motion.
- No motion that hides critical information.

## Timing

| Motion | Duration |
|---|---:|
| Tap feedback | 120ms to 180ms |
| Nav active transition | 220ms to 320ms |
| Command bar open/close | 360ms to 520ms |
| Sheet open/close | 280ms to 420ms |
| Smart widget card change | 320ms to 480ms |
| Halo breathing | 4s to 6s loop |

## Easing

Preferred:

```css
cubic-bezier(0.22, 1, 0.36, 1)
```

Use for:

- command bar expansion;
- nav active state;
- Smart Widget slide;
- orb transitions.

## Scroll Behavior

Mobile:

- top nav may hide on scroll down;
- top nav may reappear on scroll up;
- bottom nav remains persistent;
- orb remains available unless command bar is open.

Desktop:

- command workspace should remain near top or accessible;
- right rail may remain sticky;
- tables may scroll internally only if layout requires it.

## Decision

DECISION=FORGE_MOTION_SYSTEM_001_DRAFT_LOCKED
