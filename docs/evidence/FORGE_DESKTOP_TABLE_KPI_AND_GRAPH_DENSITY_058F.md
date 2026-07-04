# Forge Desktop Table KPI And Graph Density 058F

Status: IMPLEMENTED

Decision token:
DECISION=PASS_058F_DESKTOP_TABLE_KPI_AND_GRAPH_DENSITY

Next:
NEXT=058G_DESKTOP_VISUAL_POLISH_AND_CANONICAL_ALFRED_MARK_LOCK

## Scope

058F adds a desktop-only density layer after the 058E command workspace upgrade.

No mobile 057D-057N CSS or JS was modified.

No CRM action, calendar action, message action, product runtime, browser storage,
provider execution, audio runtime or source-truth mutation was introduced.

## Files Changed

- `docs/static-preview/forge-alive/index.html`
- `docs/static-preview/forge-alive/desktop/forge-desktop-table-kpi-graph-density-058f.css`
- `docs/evidence/FORGE_DESKTOP_TABLE_KPI_AND_GRAPH_DENSITY_058F.md`

## What 058F Does

- Adds a desktop-only layer after 058E.
- Tightens KPI graph treatment so indicators read as data, not decoration.
- Improves table column ownership and prevents aggressive word splitting.
- Prevents action buttons such as Revisar, Follow, Cotizar and Abrir from splitting across lines.
- Adds a canonical CSS geometry for Alfred bow tie marks inside the desktop workspace.
- Adds a subtle desktop Alfred halo with reduced-motion support.
- Preserves the 058D shell grid repair and the 058E command workspace upgrade.

## Bow Tie Note

058F improves the desktop Alfred mark geometry and makes every `.forge-alfred-mark`
variant use the same desktop bow-tie CSS primitive.

Full mobile/desktop canonical asset lock remains for 058G because mobile and desktop
still need a shared source-of-truth mark, not only matching CSS approximations.

## Visual QA

Recommended Pages QA after propagation:

`https://jorgeprdz.github.io/ForgeOS/static-preview/forge-alive/?v=058f`

Capture:

- 1366x768
- 1440x1000
- 1536x864
- 1920x1080

Verify:

- no mobile contamination;
- right rail does not overlay main workspace;
- Alfred strip remains above Oportunidades prioritarias;
- table action labels no longer split;
- KPI graph indicators remain compact;
- bow tie looks closer to mobile Alfred mark.

## Final Decision

DECISION=PASS_058F_DESKTOP_TABLE_KPI_AND_GRAPH_DENSITY

NEXT=058G_DESKTOP_VISUAL_POLISH_AND_CANONICAL_ALFRED_MARK_LOCK
