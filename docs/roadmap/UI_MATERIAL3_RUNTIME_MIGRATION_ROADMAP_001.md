# Forge Material 3 Runtime Migration Roadmap

## Authority

- Functional source: `feature/nfast-09-timeline-to-conversation-brief-projection` @ `7faf7ce20470fa076afdef1b75f909333686425b`
- Visual authority: `feature/ui-material3-design-system` @ `93f1ed317acad257ecd63879a37c977858d7eea2`
- Approved prototype source: `aeffc2e493ff9b5b3cf3cdb90e1f3c22d026b365`
- Migration branch: `feature/ui-material3-runtime-migration`

## Execution model

The migration runs as a secondary lane while NFAST/FES remains the primary functional lane.

## Stages

### UI-M00 — Runtime migration discovery

- Status: **COMPLETE**
- Runtime mutation: **NO**
- Output: runtime inventory, authority map and integration gates.

### UI-M01 — Tokens, primitives and feature flag

- Status: **COMPLETE**
- Approved tokens integrated behind an explicit feature flag.
- Reusable primitives added without replacing productive screens.
- Default runtime remains legacy.

### UI-M02 — Responsive app shell

- Status: **IN ACCEPTANCE**
- Responsive shell candidate materialized behind the feature flag.
- Real UI acceptance delegated to GitHub Actions Playwright.
- Closure remains blocked until the exact candidate commit is green.

### UI-M03 — Productive Home bindings

- Status: **LOCKED**
- Bind real next action, activity, follow-up and opportunity data.
- Preserve current functional contracts.

### UI-M04 — Home acceptance

- Status: **LOCKED**
- Functional tests.
- Mobile, tablet and desktop Playwright evidence.
- Feature flag promotion decision.

### UI-M05+ — Incremental surfaces

- Status: **LOCKED**
- Prospects.
- Conversation and timeline.
- Quotes.
- Agenda and secondary surfaces.

## Parallelism rule

- Maximum active lanes: **2**.
- Primary lane: NFAST/FES.
- Secondary lane: UI runtime migration.
- No third structural rewrite may start while UI-M01 or a major NFAST/FES phase is open.
