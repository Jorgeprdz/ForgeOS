# REPO-019 Root Surface Model

Report ID: REPO-019
Status: CANDIDATE GOVERNANCE MODEL / NO EXECUTION

## Root Definition

Forge root is a protected Repository Entry Surface.

It is allowed to contain:

1. Runtime Assets
2. Governance Assets
3. Repository Entry Points

It is not allowed to function as:

- file storage;
- generic Platform bucket;
- documentation archive;
- evidence archive;
- legacy quarantine;
- temporary report dump.

## Candidate Model

Root

- Runtime Assets
  - App shell entrypoints.
  - PWA/deploy assets.
  - Current flat runtime/code surface until physical code migration is approved.
- Governance Assets
  - AGENTS.md
  - FORGE_CONSTITUTION_V3.md
  - FORGE_MASTER_BUILD_TREE.md
- Repository Entry Points
  - .gitignore
  - root-level deploy conventions such as _redirects
  - top-level domain/tooling directories such as docs/, scripts/, tests/, src/, fixtures/, schemas/, adr/

## Protected Root Categories

| Category | Root Right | Examples | Boundary |
| --- | --- | --- | --- |
| Runtime Asset | Required for execution, app shell, PWA, deployment or current runtime layout. | app.js, index.html, manifest.json, service-worker.js, sw-cache-config.js | Must not absorb domain docs or evidence files. |
| Governance Asset | Required for repository-wide authority, operating rules or canonical navigation. | AGENTS.md, FORGE_CONSTITUTION_V3.md, FORGE_MASTER_BUILD_TREE.md | Must be few, named and protected. |
| Repository Entry Point | Required for repo tooling, source control, top-level navigation or directory access. | .gitignore, _redirects, docs/, scripts/, tests/ | Directories are allowed as entry surfaces, not dumping grounds. |

## Root Status Definitions

| Status | Meaning | Default Action |
| --- | --- | --- |
| ROOT_REQUIRED | File loses unique capability if removed from root. | Protect. |
| ROOT_ALLOWED | File is allowed temporarily or by convention, but not necessarily constitutional. | Keep until specific migration plan. |
| ROOT_OPTIONAL | File has value but no unique root capability. | Candidate for relocation. |
| ROOT_PROHIBITED | File should not remain root absent explicit exception. | Plan archive/legacy relocation. |

## New Root File Admission Rule

A new root file is allowed only if it can answer all of the following:

1. What unique capability requires root placement?
2. Who owns the file?
3. Is it runtime, governance or repository entry?
4. What validation proves it belongs at root?
5. What would break if it moved?

If those questions cannot be answered, the file should not enter root.

## AGENTS.md Model Decision

AGENTS.md is ROOT_REQUIRED.

Reason: It is the operational governance entrypoint for Codex/agent behavior. It has no runtime role, but its root placement is justified by discoverability and repository-wide authority.

## Constitution Model Decision

FORGE_CONSTITUTION_V3.md is ROOT_REQUIRED.

Reason: It is the canonical constitutional authority. A docs copy may exist later, but root should remain the canonical anchor unless a future ADR replaces root anchoring with an owner registry.

## Build Tree Model Decision

FORGE_MASTER_BUILD_TREE.md is ROOT_REQUIRED.

Reason: It is the canonical repository navigation/build status anchor. Alternate placement is viable only after governance replaces its root-anchor role.

## Relocation Candidate Classes

- Root Markdown/TXT reports not listed as governance anchors.
- Generated migration reports currently at root.
- Validation evidence not required for runtime execution.
- Legacy archives and backups.
- Unknown extensionless files without root-entry purpose.

## Recommended Governance Policy

1. Root is closed by default.
2. Protected root registry is maintained by Repository Governance.
3. Runtime files are root-allowed but should be revisited during code-domain migration.
4. Governance anchors are root-required but must remain few.
5. Documentation belongs under docs/ unless explicitly protected.
6. Evidence belongs under domain archive paths.
7. Legacy belongs in temporary quarantine, not root.

## Confidence Score

0.89
