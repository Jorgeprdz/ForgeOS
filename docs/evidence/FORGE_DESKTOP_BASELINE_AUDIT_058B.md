# Forge Desktop Baseline Audit 058B

Status: AUDIT COMPLETE

Decision token:
DECISION=PASS_058B_DESKTOP_BASELINE_AUDIT

Next:
NEXT=058C_DESKTOP_WORKSPACE_COMPOSITION_SCOPE

## Scope

This audit reviews the public GitHub Pages desktop baseline for Forge Alive:

https://jorgeprdz.github.io/ForgeOS/static-preview/forge-alive/?v=058b

The audit is desktop-only. Mobile is treated as protected after the 058A layer separation work. No static preview HTML, CSS or JS was changed for this audit.

## Evidence

Screenshots captured from GitHub Pages:

- `docs/evidence/forge-desktop-baseline-audit-058b-1366x768.png`
- `docs/evidence/forge-desktop-baseline-audit-058b-1440x1000.png`
- `docs/evidence/forge-desktop-baseline-audit-058b-1536x864.png`
- `docs/evidence/forge-desktop-baseline-audit-058b-1920x1080.png`

## Repo Checkpoint

Recent baseline:

- `d07715f docs: define desktop mobile layer separation`
- `d27b64f fix: stabilize github pages artifact`
- `e0d3561 docs: lock forge mobile widget grid night baseline`

Working tree contained pre-existing untracked files before this audit. This audit preserves them and stages only 058B evidence.

## 058A Validation

058A separation is present and active:

- `docs/architecture/source-truth/FORGE_STATIC_PREVIEW_DESKTOP_MOBILE_LAYER_SEPARATION_058A.md` exists.
- `docs/static-preview/forge-alive/shared/forge-layer-boundary-058a.css` exists.
- `index.html` loads `./shared/forge-layer-boundary-058a.css?v=058a`.

The public desktop screenshot evidence shows the 056Y desktop workspace, not the mobile home surface. Mobile bottom navigation and mobile widget grid are not visible in the desktop captures.

## Asset Audit

Desktop assets loaded by `index.html`:

- `styles-desktop.css?v=056k9` under desktop media.
- `alfred-desktop-command-workspace-056y.css?v=056y5` under desktop media.
- `alfred-desktop-dashboard.js?v=056H`.
- `alfred-desktop-command-workspace-056y.js?v=056y5`.
- `shared/forge-layer-boundary-058a.css?v=058a`.

The active desktop root is `.forge-desktop-workspace-056y`. The older `.alfred-desktop-app-056g7` remains in the document but is hidden by the 058A boundary.

## Executive Summary

Desktop is not ready as a professional Forge workspace yet.

The positive news: the 058A separation is working. The desktop page is no longer visibly contaminated by the mobile bottom nav or mobile widget grid.

The blocking issue: the active desktop composition is still unstable. The right rail visually invades the main content at 1366, 1440 and 1536 widths, and it remains compositionally heavy even at 1920. This makes the page feel like an old layered mock rather than a Salesforce / Excel / Command Workspace grade system.

The current desktop baseline is useful as a diagnostic foundation, but 058C must focus on composition ownership: shell lanes, command priority, main table density and right rail placement.

## Ratings

- Desktop current: 5.2 / 10
- Command bar: 6.4 / 10
- Professional layout: 4.2 / 10
- Operational density: 5.6 / 10
- Legibility: 6.0 / 10
- Scalability: 3.8 / 10

## Critical Findings

1. Right rail overlaps the main workspace.

   At 1366x768, 1440x1000 and 1536x864, the rail cards and vertical divider sit over the central content. The "Motor de seguimiento" region competes with the table and lower cards instead of occupying a stable lane.

2. Desktop composition relies on stacked historical constraints.

   `alfred-desktop-command-workspace-056y.css` contains several desktop media blocks, repeated grid definitions, later min-width constraints and overflow rules. The late block sets a 1280px minimum workspace and a three-column grid with `216px minmax(840px, 1fr) 286px`, which makes smaller desktop and laptop widths brittle.

3. The command bar is visible but not yet the desktop command center.

   The input is present and technically guarded for desktop, but visually it still reads like a form row. For the Forge philosophy of fewer clicks, the command workspace should become the primary action surface, with clearer intent, stronger hierarchy and richer local preview states.

4. The workspace is not yet scalable across desktop sizes.

   1920x1080 is materially better, but 1366x768 and 1440x1000 are still visually compromised. A production-grade desktop system cannot depend on wide-screen relief to feel stable.

## Medium Findings

- The sidebar width is plausible, but its visual system is still too plain for a premium Forge desktop shell.
- KPIs are visible, but they feel squeezed into the top composition instead of owning a clear strip.
- The opportunity table is readable in the main area, but too many columns are hidden or compressed for a Salesforce / Excel style operating surface.
- The lower "Cotizaciones y pólizas" content is useful but suffers from the same right-rail collision.
- There is excess top whitespace around the greeting and H1, while content lanes below feel crowded.
- `styles-desktop.css` still contains a historical `min-width: 768px` desktop breakpoint. The 058A boundary masks the worst effects, but the file remains a risk source.
- `alfred-desktop-dashboard.js` still uses a `min-width: 900px` query while the active desktop boundary is `901px`. This is not visibly breaking the current desktop page, but it is a cleanup risk before future desktop work.

## What Works

- 058A successfully prevents mobile UI from appearing on desktop captures.
- The active desktop workspace root is the intended `.forge-desktop-workspace-056y`.
- The page does render at 100 percent zoom without a blank state.
- The left navigation, main workspace and right rail concept is directionally correct.
- The command input and desktop command script are present and locally guarded.
- The dark Forge palette is aligned with the intended system direction.

## What Sobra

- The hidden 056G7 desktop surface still lives in the document and its JS still loads.
- The right rail recommendation card and feedback card currently create visual noise because they do not respect a stable lane.
- Some repeated desktop CSS blocks act as local patches rather than a clear desktop layout contract.
- The "Preview" button label is too generic for a command-first product.

## What Falta

- A canonical desktop shell grid with owned lanes.
- A command-first header/toolbar that reduces clicks and explains the next action.
- A stable right rail that never overlays the main workspace.
- A denser operational table with readable columns, fixed row rhythm and clear row actions.
- KPI ownership as a true strip or compact command-adjacent summary.
- Desktop breakpoints for laptop, standard desktop and wide desktop.
- A cleanup plan for legacy 056G7 and old desktop CSS once the new desktop contract is approved.

## Technical Findings

The 058A boundary file hides desktop roots by default and re-enables `.forge-desktop-workspace-056y` only in desktop media. It also hides mobile-only UI such as `.bottom-nav` and `.forge-mobile-widget-grid-057j` in desktop media.

The active 056Y CSS contains multiple desktop composition layers. The riskiest patterns are:

- workspace minimum widths at 1280px, 1160px and 1040px;
- repeated `grid-template-columns` definitions for the shell;
- `overflow-x: auto` on the desktop root;
- right rail rules that are alternately visible, hidden or constrained depending on the breakpoint;
- repeated `!important` usage across layout primitives.

The active 056Y JS uses a `min-width: 901px` guard, which matches the 058A desktop boundary. The older 056H desktop dashboard script uses `min-width: 900px`, which should be aligned or retired later.

## Checklist Answers

- Visible at 100 percent zoom: yes, but not professionally stable at 1366, 1440 or 1536.
- Horizontal scroll: CSS indicates likely horizontal overflow pressure on narrower desktop widths.
- Vertical scroll: yes, but the right rail collision reduces the value of scrolling content.
- Sidebar: present and sized reasonably, but visually underdesigned.
- Command bar: visible and locally interactive, but not yet the primary command workspace.
- KPIs: visible, but cramped and not compositionally owned.
- Main table: partially legible, but too sparse and visually affected by rail collision.
- Right rail: not acceptable; it is the main desktop blocker.
- Content clipping: yes, especially around lower cards and right-side content lanes.
- Mobile elements in desktop: no visible mobile leakage in captured desktop screenshots.
- Professional system feel: partial. It is closer than mobile contamination, but still reads as a patched dashboard.
- Missing density: table columns, row actions, command results and KPI hierarchy.
- Missing air: stable lanes, right rail separation and table-to-card breathing room.

## Risks

- Editing global `styles.css` or mobile 057D-057M files risks regressing the locked mobile baseline.
- Continuing to patch 056Y at the end of the file will make the cascade harder to reason about.
- Removing 056G7 abruptly could affect command slot movement because its script still loads.
- Fixing the rail without defining the full shell grid may simply move the collision to another breakpoint.

## Recommended Repair By Stages

1. 058C_DESKTOP_WORKSPACE_COMPOSITION_SCOPE

   Define the desktop composition contract before implementation: header lanes, sidebar width, command zone, table lane, rail lane and desktop breakpoints.

2. 058D_DESKTOP_SHELL_GRID_REPAIR

   Stabilize 056Y desktop grid only. Do not touch mobile. Replace overlay-prone rail behavior with a real lane or a deliberate collapse state.

3. 058E_DESKTOP_COMMAND_WORKSPACE_UPGRADE

   Make the command bar the primary operating surface: visible command intent, local suggestions, preview panel, keyboard focus and clear static safe boundaries.

4. 058F_DESKTOP_TABLE_AND_KPI_DENSITY

   Improve data density, row rhythm, column ownership and KPI hierarchy.

5. 058G_DESKTOP_VISUAL_POLISH

   Apply premium visual treatment after layout stability: glass, spacing, shadows, typography and icon polish.

## Final Verdict

058B confirms that the mobile/desktop separation is holding, but desktop itself is not ready for product polish. The next correct move is not broad redesign; it is a scoped desktop composition contract and shell repair.

DECISION=PASS_058B_DESKTOP_BASELINE_AUDIT

NEXT=058C_DESKTOP_WORKSPACE_COMPOSITION_SCOPE
