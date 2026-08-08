# FORGE AURA CARTERA PRODUCTIVE UX RECONCILIATION — ACCEPTANCE 001

## Acceptance identity

```text
PHASE=FORGE_AURA_CARTERA_PRODUCTIVE_UX_RECONCILIATION_001
OWNER_AUTHORIZATION=OK_GO_AURA_CARTERA_FINAL_ACCEPTANCE_AND_PR_001B
SOURCE_MAIN_SHA=bca6c68ab0f9106f88861ad05524c3813b6dcbbc
SOURCE_MAIN_DRIFT=NO
BRANCH=feature/aura-cartera-productive-reconciliation-001
PR_NUMBER=296
PR_URL=https://github.com/Jorgeprdz/ForgeOS/pull/296
ACCEPTED_IMPLEMENTATION_HEAD_SHA=9e3e03edeb9b02bf39723e6ebf01522ed27663bc
ACCEPTED_IMPLEMENTATION_RUN_ID=31246844092
FINAL_PR_HEAD_SHA=RESOLVED_AFTER_THIS_EVIDENCE_COMMIT_BY_EXACT_HEAD_CI
IMPLEMENTATION != DEPLOYMENT
PR ACCEPTANCE != PAGES DEPLOYMENT
```

This document records objective acceptance evidence for the implementation head immediately preceding the evidence-only commit. Because adding this file necessarily creates a new Git commit, the final PR head is verified again after this document is committed. The phase is not considered closed until the dedicated PR workflow is terminal-green on that exact final head.

## Scope and diff evidence

The accepted implementation diff against `bca6c68ab0f9106f88861ad05524c3813b6dcbbc` contains only Aura Cartera/runtime integration, tests, fixtures, PR validation workflow and phase documentation.

### AURA_RUNTIME

- `docs/static-preview/forge-aura/app-v4.js`
- `docs/static-preview/forge-aura/aura-router-v4.js`
- `docs/static-preview/forge-aura/aura-shell.js`
- `docs/static-preview/forge-aura/index.html`
- `docs/static-preview/forge-aura/cartera/.scope-lock`
- `docs/static-preview/forge-aura/cartera/cartera-core.js`

### AURA_PRESENTATION

- `docs/static-preview/forge-aura/cartera/cartera-module.js`
- `docs/static-preview/forge-aura/cartera/cartera.css`

### AURA_ADAPTER

- `docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v1.js`
- `docs/static-preview/forge-aura/cartera/cartera-coverage-adapter.js`

### TEST

- `tests/aura-cartera-productive-reconciliation.test.mjs`
- `tests/aura-cartera-pages-import-graph.test.mjs`
- `tests/cartera-playwright.config.mjs`
- `tests/e2e/aura-cartera-productive-visual.spec.mjs`

### FIXTURE

- `tests/fixtures/aura-cartera-productive.synthetic.json`
- `tests/fixtures/aura-cartera-visual.html`

### WORKFLOW

- `.github/workflows/aura-cartera-productive-reconciliation-001.yml`

### SOURCE_TRUTH

- `docs/architecture/source-truth/FORGE_AURA_CARTERA_PRODUCTIVE_UX_RECONCILIATION_001.md`

### EVIDENCE

- `docs/evidence/FORGE_AURA_CARTERA_PRODUCTIVE_UX_RECONCILIATION_ACCEPTANCE_001.md`

```text
OTHER=0
SUPABASE_MIGRATIONS_CHANGED=0
EDGE_FUNCTIONS_CHANGED=0
POLICY_INTELLIGENCE_BACKEND_CHANGED=0
PAGES_DEPLOY_WORKFLOW_MUTATED=0
MATERIAL3_RUNTIME_REDESIGN=0
```

The PR workflow enforces this diff lock against the exact PR base/head pair.

## Product and authority acceptance

```text
CARTERA_HOME=PASS
POLICY_ENTRY=PASS
PDF_FIRST=PASS
PDF_020B_020C_ALIGNMENT=PASS
PDF_MULTI_COVERAGE_LIMITATION_DISCLOSED=PASS
DIRECTORY=PASS
PERSON_WORKSPACE=PASS
POLICY_WORKSPACE=PASS
MULTI_COVERAGE=PASS
COVERAGE_TRUTH_BOUNDARY=PASS
UNKNOWN_SEMANTICS=PASS
BENEFICIARY_PRIVACY=PASS
ATTENTION_LAYER=PASS
RELATIONSHIP_BOUNDARY=PASS
PRODUCTIVITY_BOUNDARY=PASS
AURA_V4_INTEGRATION=PASS
SESSION_SAFETY=PASS
```

### PDF / Evidence lifecycle

The Aura PDF path uses the existing Evidence 020 lifecycle:

```text
PDF
-> forge_cartera020b_admit_evidence
-> forge_cartera020b_claim_evidence
-> existing extraction
-> PolicyEvidencePacket candidate
-> forge_cartera020b_record_processing_result
-> human review
-> forge_cartera020c_prepare_identity_orchestration
-> explicit 020C execution
-> forge_cartera020c_attach_policy_confirmation
-> canonical 010B boundary
```

The adapter explicitly marks extraction as candidate/review-required and not Policy Truth. The productive PDF extractor still does not support structured multi-Coverage extraction; Aura discloses this instead of inventing Coverages.

### Coverage truth

Coverage read remains:

```text
forge_policy_intelligence_read_policy_coverages(text)
```

Coverage write remains:

```text
forge_policy_intelligence_confirm_policy_coverages(jsonb)
```

The Aura adapter binds the exact canonical Policy current version, exact PolicyVersion, exact EvidenceVersion and requires the governed read-after-write receipt. No direct frontend Coverage-table mutation is present.

A reconciliation defect was found during this acceptance: entered Coverage/payment periods could default their units to `MONTH`. The adapter was corrected so an absent/unreviewed period unit remains `null`.

### Unknown semantics

Contract tests verify that absent or unrecognized status, currency and frequency are not forced to `ACTIVE`, `MXN` or `MONTHLY`, and that Coverage period/payment units remain null until reviewed.

### Beneficiary privacy

The synthetic fixture contains the trap value:

```text
RESTRICTED_SYNTHETIC_VALUE
```

Contract and browser acceptance verify that generic Cartera UI never projects that value. The Policy Workspace displays only the restricted beneficiary indicator.

## Contract and inherited regression evidence

Accepted implementation workflow run:

```text
RUN_ID=31246844092
HEAD_SHA=9e3e03edeb9b02bf39723e6ebf01522ed27663bc
JOB=93076755540
JOB_STATUS=SUCCESS
```

Observed test counts in the successful contract job:

| Suite | PASS | FAIL | SKIP |
|---|---:|---:|---:|
| Aura Cartera productive contract | 16 | 0 | 0 |
| Policy Coverage authority + versioning hotfix | 43 | 0 | 0 |
| Cartera 010B/010C/010D/020B/020C authority matrix | 78 | 0 | 0 |
| Cartera 030–100 authority matrix | 40 | 0 | 0 |
| Pages explicit deployment governance | 7 | 0 | 0 |
| **Contract/regression subtotal** | **184** | **0** | **0** |

### 010C inherited-baseline note

`tests/cartera-010c-canonical-read-model-route-adapter-test.mjs` contains a stale presentation assertion requiring the literal `SOLO LECTURA` in unchanged legacy `cartera.js`; that assertion is already red on the source baseline and is outside the Aura Cartera boundary.

It was not weakened and legacy `cartera.js` was not modified. The final governed 010C matrix instead executes the baseline-valid authority/projection tests:

- `tests/cartera-010c-policy-detail-timeline-projection-test.mjs`
- `tests/cartera-010c-policy-timeline-person-account-projection-scope-test.mjs`

These retain Timeline, projection, privacy and read-boundary coverage without expanding this phase into a legacy presentation repair.

## Canonical Pages artifact evidence

Successful job:

```text
RUN_ID=31246844092
JOB_ID=93076788163
JOB_STATUS=SUCCESS
PAGES_ARTIFACT_BUILD=PASS
PAGES_IMPORT_GRAPH=PASS
```

The job extracted and executed the canonical build/validation programs from `.github/workflows/pages.yml` but did not execute its deployment job or dispatch the workflow.

Observed import-graph test result:

```text
TESTS=4
PASS=4
FAIL=0
SKIP=0
PAGES_IMPORT_GRAPH=PASS
```

The canonical artifact reported:

```text
PAGES_CANONICAL_UI_ONLY=PASS
PAGES_LEGACY_UI_NOT_PUBLISHED=PASS
PAGES_CANONICAL_STATIC_MODULE_GRAPH=PASS files=123
CARTERA_CANONICAL_PAGES_RUNTIME=PASS files=49
```

Artifact:

```text
ARTIFACT_ID=9018760361
ARTIFACT_NAME=aura-cartera-canonical-site-9e3e03edeb9b02bf39723e6ebf01522ed27663bc
```

## Browser, accessibility and responsive acceptance

Successful job:

```text
RUN_ID=31246844092
JOB_ID=93076788215
JOB_STATUS=SUCCESS
PLAYWRIGHT_TESTS=11
PLAYWRIGHT_PASS=11
PLAYWRIGHT_FAIL=0
PLAYWRIGHT_SCREENSHOT_SET=PASS
```

The browser suite covers:

- desktop 1440 px;
- mobile 390 px with no destructive horizontal overflow;
- tablet 834 px;
- PDF entry initial state;
- PDF processing/loading disclosure;
- PDF preview/human review;
- keyboard dialog focus containment;
- Escape close and focus return;
- Policy Workspace with three independent Coverages;
- Person Workspace;
- empty state;
- attention state capped at three;
- 200% browser-zoom equivalent reflow at approximately 720 CSS px for a 1440 device-pixel viewport;
- `prefers-reduced-motion`.

```text
ACCESSIBILITY=PASS
RESPONSIVE=PASS
```

The 200% acceptance uses the equivalent CSS viewport rather than CSS `zoom`, because browser zoom reduces the effective CSS viewport and activates normal responsive reflow; CSS `zoom` is not an equivalent accessibility test.

## Visual inspection evidence

The final successful browser artifact for the accepted implementation head was downloaded and the generated images were opened/inspected, not accepted solely from the Playwright exit code.

Artifact:

```text
ARTIFACT_ID=9018764421
ARTIFACT_NAME=aura-cartera-visual-9e3e03edeb9b02bf39723e6ebf01522ed27663bc
SCREENSHOTS_REVIEWED=12
```

Reviewed screenshots:

1. `01-cartera-home-desktop.png`
2. `02-cartera-home-mobile.png`
3. `03-cartera-home-tablet.png`
4. `04-add-policy-pdf-primary.png`
5. `05-pdf-processing.png`
6. `06-pdf-preview-human-review.png`
7. `07-policy-workspace-multi-coverage.png`
8. `08-person-workspace.png`
9. `09-empty-state.png`
10. `10-attention-state.png`
11. `11-zoom-200.png`
12. `12-reduced-motion.png`

Inspection criteria included clipping, destructive overflow, legibility, hierarchy, spacing, alignment, responsive recomposition, dialog viewport fit, button visibility, truncation, overlap, Coverage cards/states, empty/loading/preview states, functional contrast and 200% reflow.

Two visible defects were discovered during actual inspection and corrected before this accepted run:

1. the fixed `+ Agregar póliza` action overlaid content in narrow/mobile and 200% reflow; below 980 px it now participates in document flow;
2. Policy Workspace Coverage values visually ran into the `Suma asegurada` / `Prima` / `Vigencia` labels; labels now render on their own line with explicit spacing.

The final 12-image set was re-opened after those corrections. No destructive clipping/overflow, hidden primary action, Coverage value/label collision or beneficiary trap PII remained visible.

```text
VISUAL_INSPECTION=PASS
SCREENSHOTS_REVIEWED=12
```

## Aggregate test count for accepted implementation head

```text
NODE_CONTRACT_AND_REGRESSION_PASS=184
PAGES_IMPORT_GRAPH_PASS=4
PLAYWRIGHT_PASS=11
TOTAL_ACCEPTANCE_TESTS_PASS=199
TOTAL_ACCEPTANCE_TESTS_FAIL=0
```

## CI defect-resolution trail

The final run is the only accepted implementation run. Earlier runs were used to expose and repair test/harness or UI defects rather than being counted as PASS:

- `31245948694`: two brittle assertions in the new contract suite; corrected.
- `31246061827`: exposed the pre-existing stale legacy 010C presentation assertion; governed matrix corrected without mutating legacy runtime.
- `31246163840`: contract and `_site` gates green; browser harness exposed a Vite static-analysis mismatch.
- `31246355763`: native static harness used the wrong working directory and returned 404; corrected.
- `31246477808`: browser entered the fixture; two navigation selectors targeted text/roles not used by the real directory rows; corrected.
- `31246733068`: all gates green, but manual/model visual inspection found Coverage label spacing; UI corrected.
- `31246844092`: accepted implementation run — all dedicated jobs green and final 12-image visual inspection PASS.

## Known limitations / warnings

1. Structured PDF multi-Coverage extraction remains unsupported by the existing productive extractor. This is intentionally disclosed; no new parser or backend was created.
2. `npm ci` reports one inherited high-severity dependency audit item. It was not introduced or repaired by this scoped Cartera phase; `npm audit fix` was not run because it could cause unrelated dependency mutations.
3. The stale baseline legacy 010C `SOLO LECTURA` presentation assertion described above remains outside this Aura phase; authoritative 010C projection/boundary tests are green.

## Deployment and mutation locks

```text
SUPABASE_SCHEMA_MUTATION=NO
NEW_MIGRATION=NO
EDGE_FUNCTION_CHANGE=NO
POLICY_INTELLIGENCE_BACKEND_CHANGE=NO
MERGE=NO
AUTO_MERGE=NO
AUTO_PAGES_DEPLOY=NO
MANUAL_PAGES_DEPLOY=NO
PAGES_DEPLOYMENT_CREATED=NO
```

No Pages deployment was created by accepted run `31246844092`; its dedicated workflow has only `contents: read` permission and contains no Pages deploy permission or deployment action.

## Acceptance before final evidence-head verification

```text
ROBOCOP_PRECHECK=PASS
CONTRACT_TESTS=PASS
INHERITED_REGRESSIONS=PASS
PAGES_ARTIFACT_BUILD=PASS
PAGES_IMPORT_GRAPH=PASS
PLAYWRIGHT=PASS
VISUAL_INSPECTION=PASS
ACCESSIBILITY=PASS
RESPONSIVE=PASS
PR=OPEN
MERGE=NO
PAGES_DEPLOY=NO
```

After this evidence-only commit, the exact new PR head must rerun the PR checks. Only a terminal-green exact final head permits `FINAL_STATUS=PASS`; otherwise this evidence remains an implementation-head record rather than final closure.
