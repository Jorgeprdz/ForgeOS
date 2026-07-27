# UI-M02A — GitHub Actions fourth failure record

## Failed candidate

- Candidate commit: `eb638bd3d2955244fff3f5450dc7a50bd8611494`
- Workflow run: `30224703966`
- Job: `89852894606`
- Artifact: `8638231199`
- Conclusion: **FAILURE**

## Result

- Unit preflight: **PASS**
- Static site builder: **PASS**
- Chromium started: **YES**
- Legacy projects: **FAIL**
- Material 3 projects: **FAIL**

Every browser project failed on the same unrelated runtime overlay.
The Pages-shaped copy still omitted Nash modules imported by the
productive Pipeline runtime.

## Architectural finding

UI-M02 acceptance was incorrectly coupled to the complete Forge Alive
legacy dependency graph. That made a responsive-shell gate responsible
for Pipeline, Nash and Pages packaging defects outside UI-M02 scope.

The GitHub Pages workflow currently publishes selected
`advisor-os/sales-pipeline` files, while the Forge Alive Pipeline entry
also imports root-level `nash` modules.

## Resolution

The custom Pages-copy builder is retired.

Authoritative UI-M02 browser acceptance now runs against an isolated
harness that:

- loads the real committed feature flag, tokens, primitives, shell CSS
  and shell JavaScript;
- provides a representative `.phone-shell` product surface;
- applies legacy `!important` cascade pressure after shell CSS;
- executes real Chromium clicks, geometry checks and screenshots;
- excludes unrelated Pipeline, Nash, Supabase and Pages packaging.

Full-product runtime health remains a separate gate and is not weakened
or declared passing by UI-M02.
