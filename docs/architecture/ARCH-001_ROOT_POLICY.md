# ARCH-001 Root Policy

Status: ARCHITECTURE DESIGN / NO CODE SCAN
Date: 2026-06-11

## Purpose

Define what may remain in repository root after Repository Governance cleanup and before physical architecture migration.

Root policy is intentionally strict:

```text
Root is for starting Forge, governing Forge, and entering the repository.
Root is not for storing domains.
```

## Allowed Root Categories

Only three categories may remain in root.

## 1. Runtime Entry Points

Root may contain runtime files required by the deployed/current app entry path.

Allowed examples by role:

- HTML entry point.
- Main JavaScript entry point.
- CSS entry point.
- Manifest/PWA entry point.
- Service worker entry point.
- Redirect/deployment entry point.
- Static app icons required by the manifest or hosting environment.

Policy:

- These files remain in root until a deployment/runtime entry replacement exists.
- They should be thin over time.
- They should not accumulate domain logic.

## 2. Governance Anchors

Root may contain canonical governance files that orient humans and agents.

Allowed examples by role:

- Agent instructions.
- Canonical constitution file.
- Master build tree or equivalent canonical build/status anchor.
- Repository-level governance map if explicitly canonical.

Policy:

- Governance anchors must be few.
- If a governance document is historical, exploratory, or domain-specific, it belongs in `docs/`.
- Root governance files should point to deeper documentation instead of duplicating it.

## 3. Repository Entry Points

Root may contain repository-level files used by tooling, hosting, package management, or broad project entry.

Allowed examples by role:

- Package/config files.
- Hosting config.
- Git/repository metadata files.
- Top-level readme if present and canonical.
- Test runner entry point only if moving it would break established commands.

Policy:

- Repository entry points should exist because tools expect them, not because no folder exists yet.
- If a file is only a report, discovery artifact, or domain module, it should not remain in root.

## Disallowed Root Content

Root should not contain:

- Domain engines.
- Product intelligence engines.
- Policy operation engines.
- Compensation engines.
- Rule-pack implementations.
- Manager OS modules.
- Advisor OS modules except temporary runtime routes.
- Discovery reports.
- Migration reports.
- Archived evidence.
- One-off validation notes.
- Generated analysis output.
- Duplicate docs.

## Temporary Root Exceptions

Some files may remain temporarily because the current runtime still depends on root-relative imports.

Temporary exceptions include:

- Legacy CRMAddlife shell modules.
- Current route modules statically imported by `app.js`.
- Runtime infrastructure not yet moved to `platform/`.
- Compatibility shims required by existing imports.

Rules for temporary exceptions:

- Every exception needs an owner category.
- Every exception needs a target destination.
- Every exception needs either a move condition or a replacement condition.
- Temporary exceptions should not be broadened by new work.

## `app.js` Root Policy

Current status:

- Root runtime entry point.
- Legacy CRMAddlife compatibility shell.
- Temporary router shell.

Root permission:

- Allowed to remain in root for now.

Restrictions:

- Do not expand `app.js` into final Forge architecture.
- Do not add new domain logic to `app.js`.
- Do not make `app.js` the permanent physical owner of routing.
- Use it only as the current compatibility shell until a `platform/` shell replacement exists.

Target future:

- `app.js` becomes a thin root entry point that imports from `platform/`, or
- `app.js` moves to `legacy/` after a new root entry point exists.

## Target Root Shape

Target root should read like this:

```text
/
  index.html
  app.js
  styles.css
  manifest.json
  service-worker.js
  _redirects
  icon-192.png
  icon-512.png
  AGENTS.md
  FORGE_CONSTITUTION_V3.md
  <minimal repository/tooling entry points>
  platform/
  shared/
  advisor-os/
  manager-os/
  product-intelligence/
  policy-operations/
  compensation/
  rule-packs/
  docs/
  tests/
  legacy/
```

This is a policy target, not a move order.

## Root Review Checklist

Before allowing a file to remain in root, answer:

1. Is it required to start the current app?
2. Is it a canonical governance anchor?
3. Is it required by repository tooling or hosting?
4. If temporary, does it have a target destination?
5. If temporary, is there a clear move or replacement condition?

If all answers are no, the file should not remain in root.

## No-Touch List For Early Migration

Do not move during early physical migration:

- Runtime entry points.
- Governance anchors.
- Repository/tooling entry points.
- `app.js`.
- Current route modules still participating in the static shell.
- Compensation and rule-pack files without an approved rule boundary.
- Historical rule snapshots.
- Any file whose import consumers are not mapped.

## Final Root Verdict

Root governance is stable enough to define the target policy.

Root physical migration should proceed only after:

1. RUNTIME-013 proves dashboard lazy-loading, or
2. an approved non-runtime documentation/root policy batch is selected.

For runtime and route files, RUNTIME-013 should happen first.

