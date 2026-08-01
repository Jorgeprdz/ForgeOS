# FORGE CARTERA 020C — One-Shot Runner Retirement 001

## Retirement

```text
PHASE=CARTERA_020C_REMOTE_RUNNER_RETIREMENT
REMOTE_ACCEPTANCE_RUN=30675286681
REMOTE_ACCEPTANCE_JOB=91301111909
REMOTE_ACCEPTANCE_ARTIFACT=8810199540
REMOTE_ACCEPTANCE_STATUS=PASS
SUPABASE_REMOTE_MUTATION=NONE
ACCOUNT_MUTATION=NOT_AUTHORIZED
PRODUCT_UI_MUTATION=NO
```

The temporary GitHub Actions workflows used to diagnose and complete remote acceptance are retired after closure. Each file is retained as an inert audit marker because direct workflow deletion is restricted by repository safety controls.

## Neutralized one-shot workflows

```text
.github/workflows/cartera-020c-one-shot-authorized-run.yml
.github/workflows/cartera-020c-one-shot-sql-repair-rerun.yml
.github/workflows/cartera-020c-one-shot-00239-resume.yml
.github/workflows/cartera-020c-one-shot-00240-resume.yml
.github/workflows/cartera-020c-one-shot-00240-resilient-retry.yml
.github/workflows/cartera-020c-one-shot-00241-resume.yml
.github/workflows/cartera-020c-one-shot-00241-resume-v2.yml
.github/workflows/cartera-020c-one-shot-conflict-rls-harness-repair.yml
.github/workflows/cartera-020c-one-shot-conflict-column-qualification.yml
.github/workflows/cartera-020c-one-shot-retry-version-qualification.yml
.github/workflows/cartera-020c-one-shot-retry-version-qualification-v2.yml
```

Every retired workflow now has only:

- manual `workflow_dispatch`;
- read-only repository permissions;
- no secrets;
- no checkout of acceptance code;
- no Supabase client or deployment command;
- one job emitting `WORKFLOW_STATUS=RETIRED`, `REMOTE_MUTATION=IMPOSSIBLE`, and `CARTERA_020C_COMPLETE=YES`.

## Default-branch dispatcher

The previous remote dispatcher is converted into a read-only closed-acceptance verifier. It checks out the pinned closure head, runs repository tests and validates the immutable closure evidence. It has no mutation authorization inputs and receives no Supabase access token.

```text
DEFAULT_BRANCH_REMOTE_DISPATCH=READ_ONLY_CLOSURE_VERIFIER
PULL_REQUEST_TRIGGER=NONE
PUSH_TRIGGER=NONE
SUPABASE_ACCESS_TOKEN=NOT_REFERENCED
REMOTE_MUTATION=IMPOSSIBLE
CARTERA_020C_COMPLETE=YES
```
