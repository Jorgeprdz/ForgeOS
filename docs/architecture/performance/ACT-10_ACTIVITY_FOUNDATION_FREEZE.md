# ACT-10 — Activity Foundation Freeze

```text
ACT_10_ACTIVITY_FOUNDATION_FREEZE=IMPLEMENTED_ACCEPTED
SOURCE_COMMIT=97f7884080d6e687065e3be60cb5cd6d51c032c9
ACTIVITY_BRANCH=feature/activity-domain-runtime-foundation
FREEZE_SCHEMA=activity-foundation-freeze.v1
FREEZE_ID=activity-foundation-v1
FROZEN_FILES=20
REMOTE_ACCEPTANCE=ACT-09_REMOTE_ACCEPTED
REMOTE_APPEND_RPC_CALLS=0
REMOTE_TEMP_ACTIVITY_ROWS=0
REMOTE_TEMP_AUTH_RESIDUE=ZERO
PRODUCTIVE_UI_MUTATION=NO
MUI_TOKEN_AUTHORITY=NO
SCORING_AUTHORITY=NO
REMOTE_DATABASE_MUTATION=NO
```

## Purpose

ACT-10 converts the accepted Activity foundation into an immutable governed
baseline.

The freeze includes the domain record, repository port, in-memory and Supabase
adapters, pipeline projection, period aggregation, feed projection, read runtime,
persistence migration, contract tests and ACT-09 remote acceptance evidence.

## Enforcement

`activity-foundation-freeze.v1.json` stores the SHA-256 digest of every frozen
artifact as it existed at `97f7884080d6e687065e3be60cb5cd6d51c032c9`.

The verifier checks both:

1. the current worktree file;
2. the same file read directly from the pinned source commit.

Updating a frozen file and merely rewriting the manifest therefore does not pass
the v1 gate. A deliberate contract change requires a new freeze version.

## Immutable anchor

After local and remote acceptance pass, the closure commit is published under:

```text
activity-foundation-v1
```

The tag does not merge Activity into `main` and does not modify FES, MUI,
productive UI or Supabase schema.

## Frozen authority

Activity owns:

- canonical append-only Activity records;
- repository and persistence boundaries;
- pipeline-to-Activity projection;
- period counts without points;
- presentation-neutral feed projection;
- authority-bound read runtime.

Activity does not own:

- scoring rules;
- point weights;
- rankings;
- productive UI;
- Material tokens;
- pipeline writer mutation;
- evaluable-day policy.

## Next

`PERF-01_PERFORMANCE_SCORING_CONTRACT_DISCOVERY`
