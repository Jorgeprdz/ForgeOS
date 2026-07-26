# UI-M02A — GitHub Actions failure record

## Failed candidate

- Candidate commit: `28efe3746dc741c0e985e4dda78ea2a7be8c7c55`
- Workflow run: `30217658448`
- Job: `89834540871`
- Artifact: `8636274562`
- Conclusion: **FAILURE**

## Observed result

- Container initialization: **PASS**
- Checkout: **PASS**
- Dependency installation: **PASS**
- Unit test assertions: **8 / 8 PASS**
- Unit preflight step wrapper: **FAIL**
- Browser acceptance: **SKIPPED**
- Artifact upload: **PASS**

The uploaded failure artifact contained the passing
`unit-test.tap` output only.

## Root cause

The job runs inside the Playwright container. GitHub Actions uses
`sh` as the default shell for `run` steps inside job containers.
The workflow used Bash-only `PIPESTATUS`, so the wrapper failed after
the Node unit tests had already passed.

## Repair

- Set `jobs.ui-m02-acceptance.defaults.run.shell: bash`.
- Replace Bash-array inspection with `set -Eeuo pipefail`.
- Keep browser acceptance exclusively in GitHub Actions.
- Preserve UI-M02 status as **IN ACCEPTANCE**.
