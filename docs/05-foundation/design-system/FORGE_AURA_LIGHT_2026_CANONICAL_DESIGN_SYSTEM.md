# FORGE — Aura Light 2026

## Canonical Design System

**Status:** RATIFIED / CANONICAL / ACTIVE / LOCKED  
**Version:** 1.0  
**Effective date:** 2026-08-04  
**Authority:** ADR-024  
**Human owner:** Jorge Ignacio Palacios Rodríguez

> **Las acciones flotan. La información se organiza. El color orienta.**

This Markdown specification is the repository-native, searchable implementation contract derived faithfully from the owner-ratified PDF **Forge Aura Light 2026 — Línea visual, principios de producto y tokens de implementación**. The PDF remains the source artifact; this file makes its rules enforceable and discoverable inside the repository.

## 1. Definition

Forge Aura Light 2026 is a clear, spatial and premium SaaS interface with floating navigation, luminous surfaces, functional color and high information density without feeling heavy.

Forge translates a complex commercial operation into a light, understandable and actionable interface. Information remains stable and ordered. Actions, navigation and contextual controls float above the canvas.

### Visual principles

- **Operational clarity:** first show what requires attention; then indicators and progress; finally context and detail.
- **Selective Floating UI:** only top bars, navigation, CTA, selectors, contextual menus and temporary alerts float.
- **Color with meaning:** violet for identity; blue for information and health; green for progress; orange for proximity; red for risk.
- **Soft depth:** translucent borders, broad subtle shadows, tinted backgrounds and gradients reserved for protagonist elements.

### Personality

| Attribute | Must feel | Must avoid |
| --- | --- | --- |
| Luminosity | Airy, clean and contrasted | Clinical, washed out or empty |
| Premium | Precise, sober and well built | Ostentatious or effect-heavy |
| Density | Informative with clear hierarchy | A dashboard saturated with cards |
| Technology | Current and understandable | Decorative futurism without function |
| Motion | Soft and intentional | Constant or distracting animation |

### Surface architecture

- **Level 0 — Canvas:** very light cool gray separating surfaces.
- **Level 1 — Content:** settled cards and lists with a subtle border and minimal shadow.
- **Level 2 — Context:** highlighted widgets, product headers and alerts.
- **Level 3 — Action:** top bar, navigation, CTA and floating popovers.

## 2. Color system

Color is never arbitrary decoration. Every use communicates identity, status or priority.

### Primary palette

| Token | Value | Authorized use |
| --- | --- | --- |
| `violet-50` | `#F4F0FF` | Selected backgrounds and soft states |
| `violet-100` | `#E9E0FF` | Badges and low-intensity icons |
| `violet-300` | `#B49AF7` | Illustrations, halos and gradients |
| `violet-500` | `#8057F1` | Secondary accent |
| `violet-600` | `#6C3CE8` | Primary Forge brand color |
| `violet-700` | `#5728CE` | Hover, pressed and emphasis |
| `blue-50` | `#EDF5FF` | Informational background |
| `blue-500` | `#3B82F6` | Policies, information and product |
| `blue-600` | `#1765E5` | CTA and health product |
| `green-50` | `#EBFAF4` | Success background |
| `green-500` | `#22B879` | Progress, confirmation and commissions |
| `orange-50` | `#FFF3EB` | Upcoming activity |
| `orange-500` | `#FF7A33` | Pending work and attention |
| `red-50` | `#FFF0F2` | Alert background |
| `red-500` | `#EF4056` | Risk, expiration or blocking |

### Neutrals

| Token | Value | Authorized use |
| --- | --- | --- |
| `neutral-0` | `#FFFFFF` | Primary surfaces |
| `neutral-25` | `#FCFCFE` | Secondary surface |
| `neutral-50` | `#F7F8FC` | Global canvas |
| `neutral-100` | `#EFF1F6` | Soft separators |
| `neutral-200` | `#E3E6ED` | Borders |
| `neutral-400` | `#A5ABBA` | Disabled icons |
| `neutral-500` | `#747C90` | Tertiary text |
| `neutral-700` | `#343B50` | Secondary text |
| `neutral-900` | `#11152B` | Primary text |

Rules:

- Canvas and cards must remain visibly distinguishable.
- Primary text uses `neutral-900`; secondary text uses `neutral-700` or the appropriate semantic token.
- Borders structure content; they do not enclose every element.
- `neutral-400` and lighter values are for disabled icons or states, never important informational text.

## 3. Semantic tokens and authorized gradients

```css
:root {
  --color-canvas: #F7F8FC;
  --color-surface: #FFFFFF;
  --color-surface-subtle: #FCFCFE;
  --color-surface-floating: rgba(255, 255, 255, 0.86);

  --color-brand: #6C3CE8;
  --color-brand-hover: #5728CE;
  --color-brand-soft: #F4F0FF;

  --color-text-primary: #11152B;
  --color-text-secondary: #5F677C;
  --color-text-tertiary: #8D94A6;
  --color-text-disabled: #B5BAC7;
  --color-text-on-brand: #FFFFFF;

  --color-border-subtle: #EBEDF3;
  --color-border-default: #E1E4EC;
  --color-border-strong: #CDD1DC;

  --color-success: #22B879;
  --color-warning: #FF7A33;
  --color-danger: #EF4056;
  --color-info: #1765E5;

  --gradient-brand:
    linear-gradient(135deg, #9F7AEA 0%, #7548EE 48%, #5728CE 100%);
  --gradient-brand-soft:
    linear-gradient(145deg, #F9F7FF 0%, #EEE9FF 100%);
  --gradient-health:
    linear-gradient(135deg, #58A5FF 0%, #1765E5 100%);
  --gradient-success:
    linear-gradient(135deg, #58D6A5 0%, #18A76A 100%);
}
```

**Gradient rule:** a maximum of one dominant gradient per section. Data cards remain white. Long-form text never sits on an intense gradient.

## 4. Typography and density

Recommended family:

```css
--font-family-ui:
  "Inter Variable", Inter, -apple-system, BlinkMacSystemFont,
  "Segoe UI", sans-serif;
```

| Token | Size / line | Weight | Use |
| --- | --- | --- | --- |
| `display-sm` | `32 / 38px` | `700` | Welcome and brand messages |
| `heading-xl` | `26 / 32px` | `700` | Main heading |
| `heading-lg` | `22 / 28px` | `700` | Module title |
| `heading-md` | `18 / 24px` | `650` | Primary cards |
| `heading-sm` | `16 / 22px` | `600` | Subsections |
| `body-lg` | `16 / 24px` | `400` | Introductions |
| `body-md` | `14 / 20px` | `400` | General text |
| `body-sm` | `13 / 18px` | `400` | Secondary information |
| `label-md` | `13 / 16px` | `600` | Buttons and tabs |
| `label-sm` | `11 / 14px` | `600` | Badges and metadata |
| `metric-lg` | `28 / 32px` | `700` | Primary KPI |
| `metric-md` | `20 / 24px` | `700` | Card KPI |

Rules:

- Heading tracking: `-0.025em`; body: `-0.005em`; labels: `0`.
- Financial figures use `font-variant-numeric: tabular-nums`.
- Productive UI body text never falls below `14px`.
- Hierarchy is produced through size, weight and spacing, not many text colors.

## 5. Spacing, shape and elevation

The base grid is `4px`.

### Spacing

| Token | Value | Typical use |
| --- | --- | --- |
| `space-1` | `4px` | Minimum adjustment |
| `space-2` | `8px` | Icon to text |
| `space-3` | `12px` | Between cards |
| `space-4` | `16px` | Standard padding |
| `space-5` | `20px` | Compact widget |
| `space-6` | `24px` | Sections and protagonist card |
| `space-8` | `32px` | Desktop margins |
| `space-10` | `40px` | Editorial blocks |
| `space-12` | `48px` | Major separation |
| `space-16` | `64px` | Hero or section close |

### Radius

| Token | Value | Use |
| --- | --- | --- |
| `radius-xs` | `8px` | Small controls |
| `radius-sm` | `12px` | Inputs |
| `radius-md` | `16px` | Standard card |
| `radius-lg` | `20px` | Smart Widget |
| `radius-xl` | `24px` | Floating bar |
| `radius-2xl` | `32px` | Hero and broad surfaces |
| `radius-pill` | `999px` | Badges and segments |

### Shadows

```css
--shadow-xs:
  0 1px 2px rgba(17, 21, 43, 0.05);
--shadow-card:
  0 4px 14px rgba(25, 31, 60, 0.06),
  0 1px 3px rgba(25, 31, 60, 0.04);
--shadow-elevated:
  0 10px 30px rgba(38, 31, 78, 0.10),
  0 2px 8px rgba(38, 31, 78, 0.05);
--shadow-floating:
  0 18px 50px rgba(63, 42, 132, 0.16),
  0 4px 14px rgba(17, 21, 43, 0.08);
```

## 6. Floating bars

Floating bars are the signature of Aura Light. They are functional, not decorative glassmorphism.

### Floating Top Bar

```css
height: 56px;
border-radius: 20px;
padding: 0 16px;
background: rgba(255, 255, 255, 0.86);
border: 1px solid rgba(255, 255, 255, 0.72);
backdrop-filter: blur(20px) saturate(140%);
box-shadow: var(--shadow-elevated);
```

- Maintain `12px` separation from physical edges.
- May contain title, search, status and no more than three visible actions.

### Floating Navigation Bar

```css
height: 64px;
inset-inline: 12px;
bottom: 12px;
border-radius: 24px;
background: rgba(255, 255, 255, 0.90);
backdrop-filter: blur(24px) saturate(150%);
box-shadow: var(--shadow-floating);
```

Active item: background `#F0EAFF`, color `#6C3CE8`, radius `14px`.

### Floating CTA Bar

```css
min-height: 56px;
border-radius: 18px;
padding: 0 20px;
background: var(--gradient-brand);
color: #FFFFFF;
box-shadow: 0 12px 28px rgba(108, 60, 232, 0.28);
```

The CTA remains separated from content and the physical edge. It may be sticky on long screens but must never cover information or secondary actions.

## 7. Components and Smart Widgets

### Standard card

```css
background: #FFFFFF;
border: 1px solid #EBEDF3;
border-radius: 16px;
box-shadow: var(--shadow-card);
padding: 16px;
```

### Soft card

```css
background: #FCFCFE;
border: 1px solid #EFF1F6;
box-shadow: none;
```

Used for secondary KPIs, internal groupings and details that do not need elevation.

### Smart Widget

```css
background: #FFFFFF;
border: 1px solid rgba(108, 60, 232, 0.10);
border-radius: 20px;
padding: 20px;
box-shadow: var(--shadow-card);
```

Every Smart Widget contains:

- a clear, brief title;
- a primary indicator or signal;
- context required to interpret the data;
- a discreet, relevant action;
- explicit and honest empty, disconnected and no-data states.

### Iconography

- Rounded linear style with visual stroke equivalent to `1.75px`.
- Allowed sizes: `16`, `20`, `24`, `28px`.
- Normal container: `36 × 36px`, radius `10–12px`.
- Functional icon background uses `8–12%` intensity.
- Do not mix line, filled and 3D icons in productive UI.

### 3D illustration

Reserved for onboarding, empty states, product headers and celebrations. It must not become recurrent decoration in tables or operational modules.

## 8. Motion, interaction and accessibility

```css
--motion-fast: 120ms;
--motion-standard: 180ms;
--motion-slow: 280ms;
--motion-emphasized: 360ms;
--ease-standard: cubic-bezier(0.2, 0, 0, 1);
--ease-emphasized: cubic-bezier(0.2, 0.8, 0.2, 1);
--focus-ring: 0 0 0 3px rgba(108, 60, 232, 0.24);
```

| Component | Hover | Pressed | Focus / disabled |
| --- | --- | --- | --- |
| Primary button | Raise `2px` and darken | Scale `0.98` | `3px` violet ring / opacity `0.45` |
| Clickable card | Soft violet border | No layout jump | Visible semantic focus |
| Icon button | `brand-soft` background | Scale `0.96` | Minimum target `44 × 44px` |
| Floating bar | Slightly stronger shadow | No deformation | Preserve contrast and blur |

Mandatory accessibility:

- Minimum touch target `44 × 44px`.
- Minimum text contrast `4.5:1`.
- Never communicate state through color alone.
- Every KPI includes text, arrow or interpretive icon.
- Base text minimum `14px`.
- Secondary text never uses a gray lighter than `neutral-500`.
- Support zoom, dynamic type and reduced motion.

## 9. Implementation-ready root tokens

```css
:root {
  --forge-canvas: #F7F8FC;
  --forge-surface: #FFFFFF;
  --forge-surface-subtle: #FCFCFE;
  --forge-surface-floating: rgba(255, 255, 255, 0.88);

  --forge-brand: #6C3CE8;
  --forge-brand-hover: #5728CE;
  --forge-brand-soft: #F4F0FF;
  --forge-brand-gradient:
    linear-gradient(135deg, #9F7AEA 0%, #7548EE 48%, #5728CE 100%);

  --forge-text-primary: #11152B;
  --forge-text-secondary: #5F677C;
  --forge-text-tertiary: #8D94A6;
  --forge-text-disabled: #B5BAC7;
  --forge-text-on-brand: #FFFFFF;

  --forge-success: #22B879;
  --forge-warning: #FF7A33;
  --forge-danger: #EF4056;
  --forge-info: #1765E5;

  --forge-border-subtle: #EBEDF3;
  --forge-border-default: #E1E4EC;
  --forge-border-focus: #8B61EF;

  --forge-radius-input: 12px;
  --forge-radius-card: 16px;
  --forge-radius-widget: 20px;
  --forge-radius-floating: 24px;
  --forge-radius-pill: 999px;

  --forge-shadow-card:
    0 4px 14px rgba(25, 31, 60, 0.06),
    0 1px 3px rgba(25, 31, 60, 0.04);
  --forge-shadow-floating:
    0 18px 50px rgba(63, 42, 132, 0.16),
    0 4px 14px rgba(17, 21, 43, 0.08);

  --forge-space-unit: 4px;
  --forge-page-padding-mobile: 16px;
  --forge-page-padding-tablet: 24px;
  --forge-page-padding-desktop: 32px;

  --forge-duration-fast: 120ms;
  --forge-duration-standard: 180ms;
  --forge-duration-emphasized: 360ms;
  --forge-easing: cubic-bezier(0.2, 0.8, 0.2, 1);
}
```

## 10. Visual governance

| Area | Acceptance criterion |
| --- | --- |
| Color | Every color has a semantic role; modules do not add isolated tones. |
| Cards | Do not create one card per datum; group related information and reduce noise. |
| Floating UI | Only controls and actions float; content remains stable. |
| Hierarchy | First reading answers: what happened, what needs attention, what do I do now? |
| Typography | Respect the scale; do not invent local sizes to solve layout. |
| Spacing | Use the `4px` grid and consistent margins across modules. |
| States | Loading, empty, error, disconnected and no-permission states are explicit. |
| Accessibility | Visible focus, sufficient contrast, keyboard navigation and minimum target sizes. |
| Data | Never show fictional metrics as real; examples are clearly identified. |
| Responsive | Preserve hierarchy on mobile, tablet and desktop; do not merely compress a dashboard. |

### Mandatory review checklist

- Does the screen have one unmistakable primary action?
- Does critical information appear before secondary data?
- Do colors communicate state instead of decoration?
- Do floating bars maintain edge separation and avoid covering content?
- Can cards be reduced or grouped?
- Are no-data and disconnected states honest?
- Is the interface usable with keyboard, zoom and high contrast?
- Does the module feel like the same product as every other Forge surface?

## Expected result

Forge must feel luminous, premium, informative, technological and consistent. Modernity comes from hierarchy, surfaces and floating actions—not from accumulating effects.

## Enforcement

Every new redesign implementation must declare and pass the Aura Light compliance gate. A conflicting mockup, old screenshot, framework default, legacy CSS rule or developer preference has no authority to override this document. Changes require a versioned amendment with explicit owner, Miranda and Board approval.
