# MIGRATION-004 Policy Operations Execution Readiness

Status: PASS / AWAITING EXECUTION APPROVAL

## Verdict

Execution readiness: PASS

MIGRATION-004 is ready for a controlled physical move after explicit approval.

## Approved Scope For Future Execution

Move exactly the 77 files listed in `MIGRATION-004_POLICY_OPERATIONS_MOVE_MAP.md`.

Create only these missing subfolders if they do not already exist:

```text
policy-operations/policy-detail/
policy-operations/policy-timeline/
policy-operations/renewals/
policy-operations/tasks/
policy-operations/evidence/
policy-operations/client-records/
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
- `cartera.js`
- `comisiones.js`
- `referidos.js`
- Legacy route registry
- Legacy navigation shim
- Runtime lazy-loading descriptors
- Unknown ownership files
- `cartera-service.js`
- `cartera-view.js`
- Any simple-rewrite reserve file

## Future Execution Commands

Required validation after movement:

```sh
node scripts/runtime-module-graph-audit.js
node scripts/repo-doc-migration-harness.js check --output-dir docs/architecture/repository/reports
git diff --check
git status --short
```

## Success Criteria For Execution

- Exactly 77 files moved.
- Root runtime surface reduced by 77 files.
- No import rewrites unless validation proves they are required.
- Boot blockers remain 0.
- Circular imports remain 0.
- Missing target count does not increase because of movement.
- Repository harness remains passing or `PASS_WITH_WARNINGS_ALLOWED`.
- No protected app shell or route files modified.
- No route behavior changed.

## Risk Assessment

Risk level: LOW

Primary risk:

- The runtime module graph audit may not scan every new Policy Operations subfolder until tooling is expanded.

Guard:

- Treat any new missing-target warning after execution as a stop condition.
- Do not compensate by widening the migration batch.

## Recommended MIGRATION-005 Scope

After MIGRATION-004 executes successfully, MIGRATION-005 should target a dedicated cartera service dependency batch or the deferred simple-rewrite evidence/client files.

Do not move Product Intelligence, Compensation, or legacy route files until Policy Operations movement is validated.
