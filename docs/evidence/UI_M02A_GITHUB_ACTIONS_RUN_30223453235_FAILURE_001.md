# UI-M02A — GitHub Actions second failure record

## Failed candidate

- Candidate commit: `b14bb088c139546e474c368ed3e3a837dfc75d65`
- Workflow run: `30223453235`
- Job: `89849745246`
- Artifact: `8637898507`
- Conclusion: **FAILURE**

## Step result

- Container initialization: **PASS**
- Checkout: **PASS**
- Dependency installation: **PASS**
- Unit preflight: **PASS**
- Authoritative browser acceptance: **FAIL**
- Artifact upload: **PASS**

## Test result

- Legacy default projects: **5 / 5 PASS**
- Material 3 projects: **0 / 5 PASS**
- Total: **5 PASS / 5 FAIL**

Observed failures:

- Mobile and tablet portrait retained a visible legacy navigation.
- Tablet landscape overflowed horizontally by 88 px.
- Desktop and desktop wide overflowed horizontally by 104 px.
- Vite served the repository source tree instead of the deployed
  Pages-shaped tree, so `../../advisor-os/...` imports resolved
  against `docs/advisor-os` and produced a development error overlay.

## Repair

- Build a dedicated acceptance site using the same public-path mapping
  as GitHub Pages.
- Serve `_ui_m02_site`, not the repository source tree.
- Increase the scoped selector authority that disables legacy nav.
- Reserve rail width explicitly at 900 px and 1200 px breakpoints.
- Reject any Vite error overlay in the authoritative browser spec.
- Preserve UI-M02 status as **IN ACCEPTANCE**.
