# FES 08A — FES Activity Lineage Robocop Gate

```text
ROBOCOP_GATE=OPEN
ROBOCOP_AMENDMENT=APPROVED
MIRANDA_APPROVAL=APPROVED
BOARD_APPROVAL=APPROVED
ARCHITECTURAL_DECISION=CANONICAL_FES_EVENT_TO_ACTIVITY_RECORD_BRIDGE
EXECUTION_AUTHORIZED=YES
SOURCE_COMMIT=1479d22453cbd4f5e1faeea0ba5acfeee144d1f3
RUNTIME_BRANCH=feature/nfast-09-timeline-to-conversation-brief-projection
LINEAGE_SCHEMA=forge.fes_activity_lineage.v1
PROJECTION_SCHEMA=fes-event-activity-projection.v1
ACTIVITY_SCHEMA=activity-record.v1
```

## Applicable Constitution

- `AGENTS.md`
- Forge Constitution and Governance Registry
- `docs/00-governance/FORGE_ROBOCOP_DIRECTIVES.md`
- `docs/00-governance/FORGE_ROBOCOP_AI_INTERPRETATION_ADDENDUM.md`
- `docs/architecture/source-truth/FORGE_EVENT_EVIDENCE_OPERATING_SYSTEM_001.md`
- `docs/architecture/source-truth/FES_08_FORGE_ALIVE_PRODUCTIVE_INTEGRATION_DISCOVERY_001.md`
- `docs/architecture/source-truth/FES_08_FORGE_ALIVE_PRODUCTIVE_INTEGRATION_MANIFEST_001.md`

## Applicable authority

- Canonical Event & Evidence: FES 01–07 closed contracts on the active branch.
- Activity authority: read-only
  `origin/feature/performance-scoring-contract-foundation`.
- Accepted Activity implementation source:
  `ce93446b4b8f06fd97dbab818781cead8f58b7be` and its Activity ancestors.
- Accepted Performance closure:
  `e4add929295f4b9edd3fb9e3ba88c98ad63df817`.
- Activity persistence deployment:
  `ACT_04B_ACTIVITY_PERSISTENCE_DEPLOYMENT=DEPLOYED_ACCEPTED`.
- Productive UI authority: `docs/static-preview/forge-alive/`.

## Resolved Activity blobs

| Path | Git blob |
|---|---|
| `advisor-os/activity/domain/activity-record.mjs` | `b34c0eb43a88638c9ed9cb4bc0b6b2231017a8e9` |
| `advisor-os/activity/application/activity-repository-port.mjs` | `3d827997972f18d5ae6d165d8d3d17fb2acf01bb` |
| `advisor-os/activity/infrastructure/activity-persistence-codec.mjs` | `79cee9c456503536e902974cbe4c2acd420d5fa2` |
| `advisor-os/activity/infrastructure/supabase-activity-repository.mjs` | `b9f514b730299142a03b6e7c62ec076570e136b3` |
| `advisor-os/activity/runtime/activity-read-runtime.mjs` | `bc468f8dbe8b248a6570b87d8537d0aa4e0e8fc8` |

Copied authority files must retain their accepted blob identity. Browser code
does not import the Node-only `node:crypto` implementation; it is parity-tested
against it.

## Identity binding

- `advisorId` is `auth.getUser().data.user.id`.
- `organizationId` must be an authenticated, non-user-editable
  `app_metadata.organization_id` or `app_metadata.organizationId` claim.
- `user_metadata` is not accepted as organization authority.
- Missing or mismatched authority fails closed.
- The remote RPC independently verifies `advisorId = auth.uid()`.

## Scope boundary

Authorized:

- additive `prospect_reference` lineage;
- deterministic FES-to-Activity projection;
- exact ActivityRecord parity;
- RPC-only append/list;
- read-only Performance composition;
- productive FES 08 actions and CSV export;
- tests, CI, evidence and preview.

Prohibited:

- pipeline transition fabrication;
- new Activity types;
- score or policy mutation;
- direct Performance writes;
- direct table access;
- database migration;
- raw private text in canonical events;
- protected worktree mutation;
- main, Cotizaciones or global-shell mutation.

## Validation expectation

- FES 08A dedicated Node and browser parity tests.
- FES 01–07 regression.
- accepted Activity and Performance regression.
- RPC-only static audit.
- productive browser acceptance.
- exact-SHA GitHub Actions.
- preview followed by human visual acceptance.
