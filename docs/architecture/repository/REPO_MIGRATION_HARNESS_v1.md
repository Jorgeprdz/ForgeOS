# REPO Migration Harness v1

Status: BUILD-003 REPORTING AND CI AGGREGATION
Scope: Repository document migration safety reports

## Purpose

`scripts/repo-doc-migration-harness.js` converts repository migration governance into repeatable evidence.

The harness does not migrate files. It produces inventory, move maps, validation reports, broken-link evidence, duplicate-destination evidence, reference rewrite dry-run diffs and aggregate check reports for human approval under ADR-0020-style governance.

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

All report commands accept:

```sh
--output-dir <dir>
```

When omitted, reports are written to repository root for backward compatibility. When provided, the harness creates the directory if missing and writes generated Markdown and JSON reports there. The harness refuses to overwrite protected root assets.

Current canonical report output:

- `docs/06-repository-governance/reports`

Historical reports may still mention `docs/architecture/repository/reports`; that path is no longer the active harness output location.

### Inventory

```sh
node scripts/repo-doc-migration-harness.js inventory
```

Output:

- `migration-inventory.md`
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
- `ROOT_DOCS_MIGRATION_BATCH_1_MOVE_MAP.json`

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
- `migration-validation-report.json`

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
- `reference-rewrite-plan.json`

Reports:

- markdown links
- relative paths
- filename references
- suggested destinations for known move candidates
- dry-run rewrite diffs: source file, old reference, proposed new reference, confidence and reason

No references are rewritten.

### Links

```sh
node scripts/repo-doc-migration-harness.js links
```

Output:

- `broken-link-report.md`
- `broken-link-report.json`

Reports Markdown links with:

- source file
- linked path
- resolved target
- status: `OK`, `ANCHOR_OK`, `ANCHOR_BROKEN`, `TARGET_BROKEN`, `EXTERNAL`, `UNKNOWN`

The resolver ignores fenced code blocks before extraction. External URLs and mailto links are reported as `EXTERNAL`. Local Markdown anchors are validated against target headings when the target file exists.

### Duplicates

```sh
node scripts/repo-doc-migration-harness.js duplicates
```

Output:

- `duplicate-destination-report.md`
- `duplicate-destination-report.json`

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
- `inventory-schema-validation-report.json`

Validates that `migration-inventory.json` has the required schema-like fields. Invalid structure fails with a non-zero exit code.

### Check

```sh
node scripts/repo-doc-migration-harness.js check --output-dir docs/06-repository-governance/reports
```

Output:

- `repo-migration-check-report.md`
- `repo-migration-check-report.json`

Runs:

- `inventory`
- `validate`
- `links`
- `duplicates`
- `validate-inventory`
- protected root regression checks

Exit behavior:

- exits `0` when hard gates pass
- exits `1` when protected root movement, runtime movement, inventory schema failure or destination overwrite risk exists
- broken Markdown links are `WARN` by default
- broken Markdown links become a hard failure with `--strict-links`

Strict mode:

```sh
node scripts/repo-doc-migration-harness.js check --strict-links --output-dir docs/06-repository-governance/reports
```

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
- Every report command writes a machine-readable JSON companion.
- `check` aggregates hard gates without executing migration.
- `rewrite-plan` proposes dry-run reference changes only.

## Recommended Workflow

```sh
node scripts/repo-doc-migration-harness.js inventory --output-dir docs/06-repository-governance/reports
node scripts/repo-doc-migration-harness.js plan --batch 3 --output-dir docs/06-repository-governance/reports
node scripts/repo-doc-migration-harness.js rewrite-plan --output-dir docs/06-repository-governance/reports
node scripts/repo-doc-migration-harness.js check --output-dir docs/06-repository-governance/reports
```

Use `--strict-links` only when broken or stale Markdown references should block the migration.

## Current Limitations

- Destination assignment is rule-based by filename and folder policy; it is a migration candidate, not constitutional ownership proof.
- Markdown link parsing is still regex-based.
- Plain filename references are reported for review, not automatically rewritten.
- The harness does not run `git mv`.
- The harness does not validate browser/PWA runtime behavior.
- The harness does not validate semantic ownership; it only validates migration safety signals.
- Anchor validation approximates GitHub-style heading slugs and may need tuning for edge cases.
- Test coverage is intentionally lightweight and does not simulate every filesystem collision case.

## Recommended BUILD-004 Scope

BUILD-004 should add:

- Optional JSON schema files for report contracts.
- More precise Markdown parser support for nested brackets, titles and reference-style links.
- Configurable allowlist for known historical broken links.
- Configurable destination policy file instead of hardcoded filename routing.
- CI wrapper that can be run by package scripts once Forge has a package-level validation contract.
- Human-approved execution command that consumes a frozen move-map and still refuses protected/runtime movement.
