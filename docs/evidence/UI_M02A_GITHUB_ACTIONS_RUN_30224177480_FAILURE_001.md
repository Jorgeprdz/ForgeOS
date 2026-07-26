# UI-M02A — GitHub Actions third failure record

## Failed candidate

- Candidate commit: `a2838e312d49ce1c21750d9a349bf3586167467a`
- Workflow run: `30224177480`
- Job: `89851600849`
- Artifact: `8638095276`
- Conclusion: **FAILURE**

## Step result

- Container initialization: **PASS**
- Checkout: **PASS**
- Dependency installation: **PASS**
- Unit preflight: **PASS**
- Authoritative browser step: **FAIL BEFORE BROWSER START**
- Artifact upload: **PASS**

## Root cause

The Pages-shaped acceptance builder invoked `git ls-files` inside the
Playwright job container. Git rejected the mounted workspace as
dubiously owned before Vite or Chromium could start.

Observed error:

`fatal: detected dubious ownership in repository`

## Repair

The builder now invokes every required Git command with a per-command
configuration:

`git -c safe.directory=<workspace> ...`

This keeps the trust exception scoped to the builder process and avoids
mutating global runner configuration.

UI-M02 remains **IN ACCEPTANCE**.
