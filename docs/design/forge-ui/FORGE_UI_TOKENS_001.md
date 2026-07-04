# Forge UI Tokens 001

Status: DRAFT / AUTHORITATIVE TOKEN SOURCE

## Color Tokens

| Token | Value | Use |
|---|---:|---|
| `--forge-bg` | `#050B16` | Base background |
| `--forge-panel` | `#071224` | Deep panels |
| `--forge-panel-2` | `#0A1A2F` | Elevated panels |
| `--forge-glass` | `rgba(8, 18, 35, 0.72)` | Glass cards |
| `--forge-border` | `rgba(223, 240, 255, 0.16)` | Glass border |
| `--forge-text` | `#F5F8FF` | Primary text |
| `--forge-muted` | `rgba(220, 230, 244, 0.72)` | Secondary text |
| `--forge-gold` | `#F2CF75` | Action / recommendation |
| `--forge-gold-2` | `#EFC45C` | Active gold |
| `--forge-cyan` | `#64DAFF` | Intelligence / signal |
| `--forge-cyan-soft` | `#76DBFF` | Halo / soft signal |
| `--forge-green` | `#73E59A` | Positive progress |
| `--forge-red` | `#FF6B6B` | Risk / gap |

## Typography

Recommended system stack:

```css
font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

Rules:

- No viewport-scaled font sizing.
- No negative letter spacing.
- Eyebrows may use positive tracking.
- Mobile headings must be strong but not oversized enough to consume the first screen.
- Dense desktop tables use smaller type, but preserve readability.

## Radius

| Token | Value | Use |
|---|---:|---|
| `--radius-xs` | `8px` | Buttons, chips |
| `--radius-sm` | `12px` | Inputs, small cards |
| `--radius-md` | `18px` | Mobile cards |
| `--radius-lg` | `24px` | Hero cards / nav pills |
| `--radius-pill` | `999px` | Pills, command bar, nav |

## Spacing

Mobile base rhythm:

- outer padding: 18px to 24px;
- card padding: 20px to 28px;
- stack gap: 16px to 22px;
- compact gap: 8px to 12px.

Desktop base rhythm:

- sidebar width: 220px to 280px;
- content max width: none for operational workspace;
- dashboard gutter: 20px to 28px;
- table cell padding: 10px to 16px.

## Shadows and Blur

Rules:

- Shadow should create depth, not dirt.
- Blur should support premium glass, not reduce legibility.
- Cyan/gold glow is reserved for Alfred, command bar, active navigation, and selected signal.

## Z-index Bands

| Band | Use |
|---:|---|
| `10` | content cards |
| `30` | sticky top nav |
| `50` | bottom nav |
| `60` | Alfred orb |
| `70` | command bar open |
| `80` | action results / sheets |
| `90` | modal / blocking review |

## Decision

DECISION=FORGE_UI_TOKENS_001_DRAFT_LOCKED
