# FIP Home Intelligence Mosaic 001

## Intent

Recompose the public Advisor Intelligence area as a compact modular dashboard inspired by Samsung Health rather than a vertical list of identical cards.

## Implemented hierarchy

- `home-daily-priority`: full-width hero tile;
- `home-nash`: compact half-width tile;
- `person-context`: compact half-width tile;
- `activity-mick`: compact half-width tile;
- `reports-business`: compact half-width tile;
- `alfred-brief`: full-width panoramic tile.

## Mobile behavior

- two-column dense grid;
- hero and panoramic cards span both columns;
- compact cards keep a controlled minimum height;
- only the first available insight is shown in the tile;
- additional insights are represented by a count badge;
- empty states use module-specific honest language;
- floating navigation safe area remains reserved.

## Safety

- Alfred remains an orchestrator, not an execution authority;
- unknown values are not converted to zero;
- no automatic message, task or pipeline mutation is introduced;
- logout scrub and late-result rejection remain unchanged.

```text
MERGE_AUTHORIZATION=NOT_GRANTED
PUBLIC_VISUAL_ACCEPTANCE=NOT_YET_EXECUTED
```
