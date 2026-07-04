# Forge Desktop Shell Grid Repair 058D

Status: IMPLEMENTED WITH LOCAL VISUAL QA

Decision token:
DECISION=PASS_058D_DESKTOP_SHELL_GRID_REPAIR

Next:
NEXT=058E_DESKTOP_COMMAND_WORKSPACE_UPGRADE

## Scope

058D implements a desktop-only composition repair layer above the active 056Y desktop workspace.

No mobile 057D-057N CSS or JS was modified.

No product runtime, write action, send action, calendar action, CRM action, browser storage, audio runtime or source-truth mutation was introduced.

## Changes Made

Created:

- `docs/static-preview/forge-alive/desktop/forge-desktop-shell-grid-repair-058d.css`

Patched:

- `docs/static-preview/forge-alive/index.html`

The new stylesheet is loaded after `alfred-desktop-command-workspace-056y.css` with desktop media only:

```html
<link rel="stylesheet" href="./desktop/forge-desktop-shell-grid-repair-058d.css?v=058d" media="(min-width: 901px)">
```

No JavaScript was added. The repair is composition-only.

## What 058D Repairs

- Neutralizes legacy desktop/landscape margins on `.phone-shell`.
- Removes inherited horizontal-scroll pressure from the desktop shell.
- Re-establishes `.forge-desktop-workspace-056y` as bounded desktop lanes.
- Keeps the sidebar as a fixed left lane.
- Keeps the command zone above the main data.
- Keeps KPI cards compact and below command.
- Keeps the main opportunities table as the primary workspace.
- Prevents the right Alfred rail from overlaying the central workspace.
- Uses a true right rail lane only at wide desktop.

## Breakpoints Covered

### 901px to 1399px

Laptop desktop compact.

Behavior:

- sidebar remains compact;
- command bar stays visible above fold;
- KPI strip remains compact;
- main table owns the workspace width;
- right rail becomes a below-main contextual panel;
- no primary horizontal scroll solution.

### 1400px to 1599px

Standard desktop.

Behavior:

- sidebar and main workspace remain stable;
- follow engine can sit beside the opportunities table;
- right rail remains below-main rather than stealing table width;
- document workflow remains reachable.

### 1600px and above

Wide desktop.

Behavior:

- sidebar, central workspace and Alfred right rail become three stable lanes;
- rail width is bounded;
- rail is sticky inside its own lane;
- tables use the added width rather than inflating cards.

### 1920px and above

Wide workstation refinement.

Behavior:

- sidebar grows slightly;
- rail width grows within bounds;
- main workspace receives more usable data width.

## Evidence

Screenshots captured from local static server after implementation:

- `docs/evidence/forge-desktop-shell-grid-repair-058d-1366x768.png`
- `docs/evidence/forge-desktop-shell-grid-repair-058d-1440x1000.png`
- `docs/evidence/forge-desktop-shell-grid-repair-058d-1536x864.png`
- `docs/evidence/forge-desktop-shell-grid-repair-058d-1920x1080.png`

Note:

GITHUB_PAGES_PROPAGATION_PENDING_LOCAL_VALIDATION_USED

Pages QA should be re-run after the pushed artifact propagates at:

https://jorgeprdz.github.io/ForgeOS/static-preview/forge-alive/?v=058d

## Before / After Against 058B

### 058B

- Desktop was visible and mobile contamination was gone.
- Right rail visually invaded the main workspace at common desktop widths.
- 056Y relied on min-widths and repeated grid definitions.
- The command bar existed but competed with top composition and KPI placement.

### 058D

- Right rail no longer overlays the main table.
- Laptop and standard desktop keep the rail below the main workspace.
- Wide desktop shows Alfred rail as a bounded lane.
- `.phone-shell` legacy offset is neutralized for desktop.
- Command zone sits above KPIs and main data.
- KPI strip remains compact.
- Main table is readable at 1366x768, 1440x1000, 1536x864 and 1920x1080.

## Right Rail Verdict

The right rail does not invade the main workspace in the captured 058D evidence.

- 1366x768: rail is not in the primary lane; no overlay.
- 1440x1000: rail does not cover main table or document workflow.
- 1536x864: rail remains non-overlapping.
- 1920x1080: rail appears as a true bounded right lane.

## Horizontal Scroll Verdict

058D no longer uses horizontal scroll as the primary layout solution.

The local screenshots show the command bar, KPI strip and main table fitting within the viewport at 1366x768. No mobile elements are visible in desktop captures.

## Visual Rating After 058D

- Desktop current: 6.8 / 10
- Shell composition: 7.3 / 10
- Command bar placement: 7.0 / 10
- Data density: 6.5 / 10
- Legibility: 7.0 / 10
- Scalability: 7.2 / 10

This is a meaningful shell repair, not final desktop polish.

## Remaining Issues For 058E

058E should upgrade the command workspace:

- stronger command hierarchy;
- grouped local suggestions;
- selected command preview state;
- approval-required affordance;
- better quick destination rhythm;
- clearer command-first action language.

Known visual polish still pending:

- sidebar icon system still feels legacy;
- some table cells wrap aggressively at laptop widths;
- right rail cards need stronger Alfred information design;
- command bar should feel more like the operating center, not only a top input;
- 056Y legacy CSS still contains old grid definitions underneath the repair layer.

## Validation

Completed before commit:

- repo checkpoint;
- load-order scan;
- 058D marker scan;
- screenshot dimension check;
- `git diff --check`;
- safety scan on touched files.

## Final Decision

058D passes as a shell-grid repair. It fixes the 058B blocker without touching mobile and creates a stable base for command workspace upgrade.

DECISION=PASS_058D_DESKTOP_SHELL_GRID_REPAIR

NEXT=058E_DESKTOP_COMMAND_WORKSPACE_UPGRADE
