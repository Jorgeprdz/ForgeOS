# ACT-07 — Activity Feed Projection

```text
ACT_07_ACTIVITY_FEED_PROJECTION=IMPLEMENTED_ACCEPTED
SOURCE_COMMIT=93579520708080d8b05dae7373b8590ecf47889f
ACTIVITY_BRANCH=feature/activity-domain-runtime-foundation
FEED_SCHEMA=activity-feed.v1
FEED_ITEM_SCHEMA=activity-feed-item.v1
PROJECTION_AUTHORITY=ACTIVITY_READ_MODEL_ONLY
PRODUCTIVE_UI_MUTATION=NO
MUI_TOKEN_AUTHORITY=NO
POINT_AUTHORITY=PERFORMANCE_ONLY
PIPELINE_WRITER_MUTATION=NO
FES_MUTATION=NO
MUI_MUTATION=NO
MAIN_MUTATION=NO
REMOTE_DATABASE_MUTATION=NO
```

## Boundary

ACT-07 creates a presentation-agnostic read model over canonical Activity history:

```text
ActivityRepository snapshot
  -> as-of control reconciliation
  -> governed filters and deterministic ordering
  -> activity-feed.v1 page
```

This phase does not render a screen, mount a route, select Material tokens or modify productive markup. UI migration remains frozen.

## Query contract

A feed query requires `organizationId`, `advisorId` and `asOf`. Optional filters cover Activity type, lifecycle, evidence state, source system and canonical prospect, opportunity, appointment or policy relations.

Feed pagination uses a stable `(occurredAt, id)` cursor. Page limit is bounded to 200 items.

## Full snapshot

The application service reads the complete advisor snapshot through the existing repository port before projecting a page. A correction or reversal outside the visible page can therefore determine the effective state of an earlier target.

Repository reads remain organization- and advisor-scoped. Repeated cursors are rejected and `maxRecords` prevents unbounded memory growth.

## Feed item semantics

Every immutable `activity-feed-item.v1` exposes Activity identity, item kind, effective state, Activity type, lifecycle, evidence identity, dates, canonical references, confirmation identity and correction/reversal links.

Raw Activity metadata is not copied into the feed; only `metadataPresent` is projected.

## Append-only controls

Correction and reversal records remain visible as feed items. The referenced target is projected with its controlling Activity IDs and effective state. Reversal takes effective precedence when both control types target the same Activity.

Missing targets and controls recorded before their targets are rejected.

## Prohibited authority

The feed contains no points, score, weight, multiplier, ranking, coaching recommendation, CSS class, color token, Material component, HTML or productive route mounting.

## Persistence

ACT-07 uses the existing repository port and deployed persistence adapter. It does not create a migration, table, RPC or remote database mutation.

## Next

`ACT-08_ACTIVITY_READ_RUNTIME_COMPOSITION`
