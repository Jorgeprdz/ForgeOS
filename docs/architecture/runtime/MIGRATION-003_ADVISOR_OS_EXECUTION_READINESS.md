# MIGRATION-003 Advisor OS Execution Readiness

Status: PASS / AWAITING EXECUTION APPROVAL

## Verdict

Execution readiness: PASS

MIGRATION-003 is ready for a controlled physical move after explicit approval.

## Approved Scope For Future Execution

Move exactly the 57 files listed in `MIGRATION-003_ADVISOR_OS_MOVE_MAP.md`.

Create only these missing subfolders if they do not already exist:

```text
advisor-os/commercial-intelligence/
advisor-os/prospecting/
advisor-os/followup/
advisor-os/conversation/
advisor-os/referrals/
```

Use `git mv`.

Do not move any other files.

## Import Rewrite Expectation

Expected import rewrites: 0

Reason:

- Selected files have zero detected local imports.
- Selected files have zero detected root JS consumers.
- No selected file is consumed by protected shell or route files.

If validation proves an import rewrite is necessary, stop and document the specific failure before widening scope.

## No-Touch List

Do not modify:

- `app.js`
- `index.html`
- `dashboard.js`
- `referidos.js`
- `comisiones.js`
- `cartera.js`
- Legacy route registry
- Legacy navigation shim
- Runtime lazy-loading descriptors
- Unknown ownership files
- Complex relationship master files

## Future Execution Commands

Required validation after movement:

```sh
node scripts/runtime-module-graph-audit.js
node scripts/repo-doc-migration-harness.js check --output-dir docs/architecture/repository/reports
git diff --check
git status --short
```

## Success Criteria For Execution

- Exactly 57 files moved.
- Root runtime surface reduced by 57 files.
- No import rewrites unless validation proves they are required.
- Boot blockers remain 0.
- Circular imports remain 0.
- Repository harness remains passing or `PASS_WITH_WARNINGS_ALLOWED`.
- No protected app shell or route files modified.
- No route behavior changed.

## Risk Assessment

Risk level: LOW

Primary risk:

- The runtime module graph audit may not scan every new Advisor OS subfolder until tooling is expanded.

Guard:

- Treat any new missing-target warning after execution as a stop condition.
- Do not compensate by widening the migration batch.

## Recommended MIGRATION-004 Scope

After MIGRATION-003 executes successfully, MIGRATION-004 should target either:

1. Advisor OS UI/viewmodel reserve files, or
2. A dedicated Relationship Intelligence dependency batch.

Do not start Product Intelligence or Policy Operations movement until the Advisor OS subfolder pattern is validated.
