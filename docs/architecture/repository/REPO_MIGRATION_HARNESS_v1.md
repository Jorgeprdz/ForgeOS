# REPO Migration Harness v1

Status: BUILD-002 HARDENED
Scope: Repository document migration safety reports

## Purpose

`scripts/repo-doc-migration-harness.js` converts repository migration governance into repeatable evidence.

The harness does not migrate files. It produces inventory, move maps, validation reports, broken-link evidence, duplicate-destination evidence and reference rewrite plans for human approval under ADR-0020-style governance.

## Safety Contract

The harness never:

- Moves files.
- Deletes files.
- Overwrites files.
- Rewrites imports.
- Rewrites markdown references.
- Guesses constitutional ownership.

The harness only:

- Inventories.
- Plans.
- Validates.
- Reports.

## Protected Root Assets

The following root assets are hardcoded as protected:

- `AGENTS.md`
- `FORGE_CONSTITUTION_V3.md`
- `FORGE_MASTER_BUILD_TREE.md`
- `app.js`
- `index.html`
- `manifest.json`
- `service-worker.js`
- `sw-cache-config.js`

Any move involving these files must be rejected by the harness plan.

## Commands

### Inventory

```sh
node scripts/repo-doc-migration-harness.js inventory
```

Output:

- `migration-inventory.json`

Detects:

- tracked files
- untracked files
- root files
- root docs
- protected assets
- code files
- destination candidates
- schema fields used by validation: `generatedAt`, `files`, `protectedAssets`, `rootDocs`, `trackedFiles`, `untrackedFiles`, `candidates`

### Plan

```sh
node scripts/repo-doc-migration-harness.js plan --batch 1
```

Output:

- `ROOT_DOCS_MIGRATION_BATCH_1_MOVE_MAP.md`

Classifications:

- `MOVE`
- `SKIP_PROTECTED`
- `SKIP_TEST_DOC`
- `BLOCKED_UNTRACKED`
- `SKIP_DEST_EXISTS`
- `REVIEW_REQUIRED`

### Validate

```sh
node scripts/repo-doc-migration-harness.js validate
```

Output:

- `migration-validation-report.md`

Checks:

- destination collisions
- protected root violations
- runtime files in move list
- duplicate destinations
- broken ownership rules / review-required files

### Rewrite Plan

```sh
node scripts/repo-doc-migration-harness.js rewrite-plan
```

Output:

- `reference-rewrite-plan.md`

Reports:

- markdown links
- relative paths
- filename references
- suggested destinations for known move candidates

No references are rewritten.

### Links

```sh
node scripts/repo-doc-migration-harness.js links
```

Output:

- `broken-link-report.md`

Reports Markdown links with:

- source file
- linked path
- resolved target
- status: `OK`, `BROKEN`, `ANCHOR_ONLY`, `EXTERNAL`, `UNKNOWN`

The resolver ignores fenced code blocks, external URLs, mailto links and anchor-only links as broken-link candidates.

### Duplicates

```sh
node scripts/repo-doc-migration-harness.js duplicates
```

Output:

- `duplicate-destination-report.md`

Compares planned move destinations and classifies:

- `EXACT_DUPLICATE`
- `CONTENT_DIFFERS`
- `DESTINATION_MISSING`
- `REVIEW_REQUIRED`

The harness never overwrites an existing destination.

### Validate Inventory

```sh
node scripts/repo-doc-migration-harness.js validate-inventory
```

Output:

- `inventory-schema-validation-report.md`

Validates that `migration-inventory.json` has the required schema-like fields. Invalid structure fails with a non-zero exit code.

### Regression Tests

```sh
node scripts/test-repo-migration-harness.js
```

Verifies:

- protected root assets are never classified `MOVE`
- `.js`, `.ts`, `.json` and `.html` files are never classified `MOVE`
- untracked docs are `BLOCKED_UNTRACKED`
- destination collisions remain blocked or review-required
- dry-run classifiers do not modify files

## Validation Guarantees

- The harness has no command that runs `git mv`.
- Runtime/code files remain outside the move scope.
- Protected root assets are hard-blocked.
- Destination collisions are reported and never overwritten.
- Inventory schema failures are visible through a non-zero validation exit.
- Link and duplicate reports are evidence only; they do not rewrite references.

## Current Limitations

- Destination assignment is rule-based by filename and folder policy; it is a migration candidate, not constitutional ownership proof.
- Markdown link parsing is still regex-based and does not validate anchor existence inside target files.
- Plain filename references are reported for review, not automatically rewritten.
- The harness does not run `git mv`.
- The harness does not validate browser/PWA runtime behavior.
- The harness does not validate semantic ownership; it only validates migration safety signals.
- Test coverage is intentionally lightweight and does not simulate every filesystem collision case.

## Recommended BUILD-003 Scope

BUILD-003 should add:

- Machine-readable JSON outputs for link and duplicate reports.
- Optional `--output-dir` support for generated reports.
- Anchor validation for local Markdown headings.
- Reference rewrite dry-run diff generation.
- CI-friendly summary command that runs inventory, validation, links, duplicates and tests together.
- Dry-run diff summary for a future human-approved execution command.
