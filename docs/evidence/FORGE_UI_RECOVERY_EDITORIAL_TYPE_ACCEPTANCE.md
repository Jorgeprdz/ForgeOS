# Forge UI Recovery + Editorial Type — Acceptance

```text
DOCUMENT=FORGE_UI_RECOVERY_EDITORIAL_TYPE_ACCEPTANCE
STATUS=CANDIDATE
BASE_SHA=4a90fbd04cfed74d63a45a0b13d5cf0c2b88d828
BRANCH=fix/forge-ui-recovery-editorial-type-one-pass
EXECUTION_MODE=ONE_PASS
```

## Defect reproduced

The Material 3 shell becomes a 12-column grid on landscape tablet and desktop. Several productive route roots did not claim the full grid, so Activity, Compensation and other dynamic modules could render inside one narrow column while the rest of the viewport remained empty.

Cartera simultaneously rendered multiple nested `glass-widget` levels, horizon counters and filter buttons with the same border, background, radius and visual weight. The result was operationally truthful but visually similar to a command console.

## Recovery order

```text
ROUTE_LAYOUT_FULL_WIDTH
→ HOME_HIERARCHY
→ ACTIVITY_DENSITY
→ CARTERA_VISUAL_RESTRAINT
→ EDITORIAL_DISPLAY_TYPE
→ RESPONSIVE_ACCEPTANCE
→ PUBLIC_CACHE_VERSIONING
```

## Structural correction

Every direct productive route now requires:

```text
GRID_COLUMN=1/-1
WIDTH=100%
MAX_WIDTH=NONE
MIN_WIDTH=0
JUSTIFY_SELF=STRETCH
```

This is a shell/layout correction only. No route, authority, business command, persistence contract or data source changes.

## Editorial type system

```text
DISPLAY_STACK=IOWAN_OLD_STYLE|BASKERVILLE|TIMES_NEW_ROMAN|GEORGIA|SERIF
UI_STACK=INTER|ROBOTO|SYSTEM_UI|SANS_SERIF
```

Display serif is restricted to major page and section headings. Navigation, buttons, filters, metrics, labels, forms and operational data remain sans-serif.

No font binary is added to the repository or public artifact.

## Home

- Hero typography receives the editorial display stack.
- Organic radii and shadows are normalized.
- Desktop cards remain a deliberate 5/7 split.
- Metrics become denser without changing their values or actions.
- Existing Alfred and floating navigation behavior remains intact.

## Activity

- The route receives full workspace width.
- The main heading is constrained to a balanced maximum width and a smaller responsive scale.
- Period controls, refresh and empty state use less vertical space.
- FES truth, period semantics, empty-state wording and chart authority remain unchanged.

## Cartera

- Canonical directory, payment calendar, future radar and all source data remain visible.
- The four canonical counts become one compact summary band.
- Payment horizons remain present but lose nested card chrome.
- Radar horizons become lightweight tabs instead of seven visually dominant controls.
- Source availability remains visible at reduced emphasis.
- Buttons use restrained rectangular geometry instead of organic capsules.
- No Policy, Person, Account, Timeline, payment or service authority changes.

## Mobile navigation

```text
FLOATING_NAV=PRESERVED
CONTENT_SAFE_BOTTOM=REQUIRED
SAFE_AREA_INSET=REQUIRED
```

The correction never converts the nav pill to a fixed document-flow footer. Content continues to scroll above it.

## Public cache versioning

The canonical Pages build rewrites the `legacy-ui-retirement.js` import to the deployed `GITHUB_SHA`. That module installs `forge-ui-recovery.css` and keeps it after dynamically loaded module styles.

```text
STALE_UI_LOADER_ALLOWED=NO
DEPLOYED_SHA_CACHE_KEY=REQUIRED
RECOVERY_STYLESHEET_LAST_IN_CASCADE=REQUIRED
```

## Responsive acceptance matrix

Surfaces:

```text
HOME
ACTIVITY
CARTERA
```

Profiles:

```text
MOBILE_390x844
TABLET_PORTRAIT_800x1280
TABLET_LANDSCAPE_1100x800
DESKTOP_1440x900
DESKTOP_WIDE_1920x1080
```

Required results:

```text
ROUTE_COLLAPSE=0
CLIPPED_HEADINGS=0
HORIZONTAL_OVERFLOW=0
ACTIVITY_HERO_LINES<=3
CARTERA_SUMMARY_NESTED_SHADOW=0
CARTERA_RADAR_CONTROL_HEIGHT<=36
EDITORIAL_SERIF_ON_MAJOR_HEADINGS=YES
SERIF_ON_CONTROLS=NO
SAFE_BOTTOM_RESERVE=PASS
```

The browser gate produces 30 screenshots: viewport and full-page captures for three surfaces across five profiles.

## Locked boundaries

```text
BUSINESS_LOGIC_MUTATION=0
DIRECT_DATABASE_WRITE=0
DIRECT_RPC=0
PERSON_AUTHORITY_MUTATION=0
POLICY_AUTHORITY_MUTATION=0
PIPELINE_AUTHORITY_MUTATION=0
QUOTE_AUTHORITY_MUTATION=0
UNKNOWN_AS_ZERO=0
FLOATING_NAV_REMOVAL=0
FONT_BINARY_ADDED=0
```

## Candidate receipt

```text
STRUCTURAL_WIDTH_RECOVERY=PENDING_CI
HOME_VISUAL_RECOVERY=PENDING_CI
ACTIVITY_VISUAL_RECOVERY=PENDING_CI
CARTERA_VISUAL_RECOVERY=PENDING_CI
EDITORIAL_TYPE=PENDING_CI
PUBLIC_CACHE_VERSIONING=PENDING_CI
RESPONSIVE_SCREENSHOTS=PENDING_CI
CONTROLLED_MERGE=NOT_EXECUTED
```
