# UI-M01 — Tokens, primitives and feature flag closure

## Authority

- Functional source: `feature/nfast-09-timeline-to-conversation-brief-projection`
- Functional source commit: `7faf7ce20470fa076afdef1b75f909333686425b`
- Visual authority: `feature/ui-material3-design-system`
- Visual authority commit: `93f1ed317acad257ecd63879a37c977858d7eea2`
- Approved prototype commit: `aeffc2e493ff9b5b3cf3cdb90e1f3c22d026b365`
- UI-M00 commit: `395982790d6382948284736d7e66f348a00fb885`

## Product surface

The real product entrypoint is:

`docs/static-preview/forge-alive/index.html?nav=inicio`

UI-M01 does not replace Home, navigation, Alfred or productive bindings.

## Materialized foundation

- Runtime-scoped Material 3 tokens derived from the approved authority.
- Reusable CSS primitives.
- Query-controlled feature flag.
- Runtime manifest.
- Contract tests.

## Feature flag

Default:

`?nav=inicio`

Result: legacy UI, without Material 3 runtime attributes.

Opt-in:

`?nav=inicio&forgeUi=material3`

Result: the document receives:

- `data-forge-ui-runtime="material3"`
- `data-forge-theme="dark"`

## Boundaries

- Default visual mutation: **NO**
- Productive Home replacement: **NO**
- Data binding mutation: **NO**
- Backend mutation: **NO**
- Supabase mutation: **NO**
- Feature flag required: **YES**

## Decision

- UI-M01: **COMPLETE**
- Next phase: `UI_M02_RESPONSIVE_APP_SHELL`
