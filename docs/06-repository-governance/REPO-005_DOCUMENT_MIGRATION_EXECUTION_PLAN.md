# REPO-005 Document Migration Execution Plan

Report ID: REPO-005
Status: EXECUTION AUTHORIZATION REQUEST
Subject: Safe execution plan for root documentation cleanup
Decision State: PARTIAL MIGRATION FIRST / REFERENCE HARNESS REQUIRED BEFORE BROAD REWRITE

---

## 1. Executive Verdict

Physical document migration has higher ROI than additional discovery, but execution must remain staged.

Current workspace note:

- Batch 1 document-only `git mv` has already moved 322 tracked root docs and is staged.
- Root still contains protected anchors, runtime/code files, test/validation docs, untracked docs and one tracked duplicate-destination case.
- This REPO-005 plan authorizes the next migration blueprint only. It does not move additional files.

Final recommendation:

C. Partial migration first.

Confidence:

86 / 100 for continued documentation migration.

Confidence is lower for automated reference rewrites:

62 / 100 until broken-link detection and reference classification exist.

---

## 2. Root Reduction Target

### 2.1 Current Root State

| Metric | Count | Evidence |
| --- | ---: | --- |
| Current root file count after Batch 1 staged moves | 714 | `find . -maxdepth 1 -type f` |
| Current root `.md` / `.txt` files | 20 | root doc scan |
| Staged root doc renames from Batch 1 | 322 | `git diff --cached --name-status` |
| Protected root assets | 8 minimum | user instruction and REPO-004 |
| Remaining root docs protected by explicit rule | 3 | `AGENTS.md`, `FORGE_CONSTITUTION_V3.md`, `FORGE_MASTER_BUILD_TREE.md` |
| Remaining root docs blocked because untracked | 5 | cannot use `git mv` until tracked or explicitly handled |
| Remaining root docs excluded as test/validation artifacts | 10 | user excluded any test file; validation docs require review |
| Remaining tracked root doc with destination collision | 1 | `FORGE_CONSTITUTION_AMENDMENT_v1.1.md` |
| Root move map artifact | 1 | `ROOT_DOCS_MIGRATION_BATCH_1_MOVE_MAP.md` |

### 2.2 Must Remain At Root

| File | Reason |
| --- | --- |
| `AGENTS.md` | Operational governance anchor |
| `FORGE_CONSTITUTION_V3.md` | Constitution anchor |
| `FORGE_MASTER_BUILD_TREE.md` | Architecture governance anchor |
| `app.js` | Protected app shell/runtime |
| `index.html` | Protected runtime entrypoint |
| `manifest.json` | Protected PWA manifest |
| `service-worker.js` | Protected service worker |
| `sw-cache-config.js` | Protected offline runtime config |

### 2.3 Safe Migration Candidates

| Candidate Class | Current Count | Safety |
| --- | ---: | --- |
| Already staged tracked root docs | 322 | High, already moved with `git mv` |
| Untracked root docs | 5 | Medium; require explicit tracking decision before movement |
| Tracked duplicate-destination doc | 1 | Medium; requires human merge/duplicate decision |
| Test/validation docs | 10 | Medium-high; excluded from Batch 1, require test/evidence policy |
| Move map artifact | 1 | Low risk, but should be committed with Batch 1 or archived after commit |

### 2.4 Estimated Reduction

REPO-004 audited 1035 root files before Batch 1.

Batch 1 staged 322 root doc renames.

Estimated reduction if Batch 1 is committed:

| Surface | Before | After Batch 1 | Reduction |
| --- | ---: | ---: | ---: |
| Root files | 1035 | 714 | 31.0% |
| Root docs/reports | 341 approx | 20 | 94.1% |
| Protected root anchors | 8 minimum | 8 minimum | 0% |

Target after final document cleanup:

| Target | Desired Count |
| --- | ---: |
| Root docs unrelated to protected anchors | 0-3 |
| Root test/validation docs | 0 after policy decision |
| Root untracked architecture docs | 0 after tracking decision |
| Root runtime/governance anchors | Remain |

---

## 3. Destination Architecture

Rules:

- Human navigable.
- AI navigable.
- Ownership clear.
- Avoid deep nesting.
- No runtime/code movement in document migration.

### 3.1 Target Directory Tree

```text
docs/
├─ adr/
│  ├─ active/
│  └─ legacy-paq/
├─ architecture/
│  ├─ constitution/
│  ├─ repository/
│  ├─ build-tree/
│  ├─ discovery/
│  ├─ product-intelligence/
│  ├─ manager-os/
│  ├─ advisor-os/
│  ├─ compensation/
│  ├─ shared-intelligence/
│  └─ policy-operations/
├─ reports/
│  ├─ validation/
│  ├─ red-team/
│  ├─ implementation/
│  └─ checkpoints/
├─ evidence/
│  ├─ product-sources/
│  ├─ ocr-sources/
│  └─ market-data/
└─ archive/
   ├─ historical/
   ├─ converted-markdown/
   └─ superseded/
```

### 3.2 Ownership Rules

| Destination | Owner |
| --- | --- |
| `docs/architecture/constitution/` | Constitution / constitutional governance |
| `docs/adr/` | ADR governance |
| `docs/06-repository-governance/` | Repository governance |
| `docs/02-build-tree/` | Architecture governance |
| `docs/03-discovery/` | Discovery governance |
| `docs/04-product-intelligence/` | Product Intelligence |
| `docs/04-manager-os/` | Manager OS |
| `docs/architecture/advisor-os/` | Advisor OS |
| `docs/architecture/compensation/` | Compensation |
| `docs/reports/validation/` | Validation evidence |
| `docs/reports/red-team/` | Red-team evidence |
| `docs/evidence/` | Source/evidence archive |
| `docs/archive/` | Historical artifacts |

---

## 4. Migration Waves

| Wave | Scope | Estimated Count | Risk | Validation Required |
| --- | --- | ---: | --- | --- |
| Wave 1 | Tracked root docs with clear destination and no destination collision | 322 | Low | `git status --short`, `git diff --cached --stat`, `git diff --cached --check`; already staged |
| Wave 2 | Remaining untracked architecture/repository/manager docs after tracking decision | 5 | Medium | Human owner confirmation, `git add` approval, move map, `git mv` or add-at-destination strategy |
| Wave 3 | Test/validation docs into `docs/reports/validation/` or test evidence area | 10 | Medium-high | Confirm not executable tests, link scan, test/evidence policy approval |
| Wave 4 | Duplicate-destination and unknown artifacts | 1+ | High | Content comparison, human merge/keep/delete decision; no overwrite |
| Wave 5 | Reference rewrite and docs index generation | TBD | Medium | Broken-link scan, grep for old paths, build tree/constitution reference review |

Wave 1 is commit-ready after human approval.

Wave 2-5 should not start until Wave 1 is committed or explicitly rolled back.

---

## 5. Reference Breakage Analysis

| Reference Type | Risk | Execution Mode | Notes |
| --- | --- | --- | --- |
| Markdown links to moved docs | High | B. Moves + automated reference rewrite | Root docs often refer to each other by filename. |
| Plain text filename references | High | C. Human review required | Rewriting all mentions may damage historical evidence. |
| Build tree references | High | C. Human review required | Build tree is protected root governance. |
| Constitution references | High | C. Human review required | Constitution anchors must preserve intent. |
| AGENTS references | Medium | C. Human review required | `AGENTS.md` should not be casually rewritten. |
| ADR references | Medium-high | B plus review | ADR paths can be rewritten, ADR IDs should not. |
| Source/evidence filenames | Medium | C. Human review required | Some references point to original evidence names. |
| Runtime references | Out of scope | Forbidden in doc migration | No code/runtime movement. |
| Git history references | Low | A. Simple moves | Git preserves rename if committed cleanly. |

Reference rewrite verdict:

Do not rewrite references in the same commit as the first large doc move.

Recommended split:

1. Commit pure moves.
2. Generate broken-link/reference report.
3. Apply targeted reference rewrites in a second commit.

---

## 6. REPO_MIGRATION_HARNESS_v1

The harness should be a repeatable local workflow, not a one-off script.

### 6.1 Phase 1: Inventory

Required outputs:

- Root file inventory.
- Root docs inventory.
- Git tracked/untracked classification.
- Protected asset exclusion list.
- Destination collision report.
- Test/validation filename report.

Command shape:

```sh
node scripts/repo-doc-migration-harness.js inventory --root-only --docs-only
```

### 6.2 Phase 2: Move Map

Required outputs:

- `ROOT_DOCS_MIGRATION_BATCH_<n>_MOVE_MAP.md`
- Action per file: `MOVE`, `SKIP_PROTECTED`, `SKIP_TEST_DOC`, `BLOCKED_UNTRACKED`, `SKIP_DEST_EXISTS`, `REVIEW_REQUIRED`
- Destination rationale.

Command shape:

```sh
node scripts/repo-doc-migration-harness.js plan --batch 1 --no-write
```

### 6.3 Phase 3: Move

Rules:

- Use `git mv` only for tracked files.
- Never overwrite existing destination.
- Never move protected root assets.
- Never move code/runtime files.

Command shape:

```sh
node scripts/repo-doc-migration-harness.js move --batch 1 --git-mv-only
```

### 6.4 Phase 4: Rewrite References

Rules:

- Separate commit from physical moves.
- Generate rewrite map first.
- Do not rewrite historical evidence text without review.

Command shape:

```sh
node scripts/repo-doc-migration-harness.js rewrite-plan --from-move-map ROOT_DOCS_MIGRATION_BATCH_1_MOVE_MAP.md --no-write
```

### 6.5 Phase 5: Validation Scan

Required checks:

```sh
git status --short
git diff --cached --stat
git diff --cached --check
git diff --check
find . -maxdepth 1 -type f \( -name '*.md' -o -name '*.txt' \) -printf '%f\n' | sort
```

Additional checks:

- `rg` old root filenames in `docs/`.
- Broken markdown link scan.
- Destination collision scan.
- Protected root asset scan.
- Code movement scan for `.js`, `.ts`, `.json`, `.html`.

### 6.6 Phase 6: Broken-Link Detection

Minimum behavior:

- Parse markdown links.
- Resolve relative links.
- Report unresolved targets.
- Distinguish external links, anchors, plain filename references and code-path references.

### 6.7 Phase 7: Commit Generation

Commit prerequisites:

- Move map exists.
- `git diff --cached --check` clean.
- No code/runtime staged.
- Human approval received.

Commit message for Wave 1:

```text
Move root documentation into architecture docs folders
```

---

## 7. Miranda Test

### 7.1 Human Comprehension

Improves because:

- Root no longer hides hundreds of documents among runtime and engines.
- Constitution, ADRs, product docs and reports become discoverable by intent.
- Protected root assets remain visible.

Evidence:

- REPO-004 found root contained 341 architecture/docs/governance-style files.
- Batch 1 moved 322 tracked docs with no content edits.

### 7.2 AI Navigation

Improves because:

- Search scope becomes domain-aware.
- Repository docs can be routed by folder.
- Future agents can inspect `docs/06-repository-governance/` for repository governance without scanning root clutter.

Evidence:

- `docs/06-repository-governance/` now receives migration and cartography artifacts.
- `docs/04-product-intelligence/` now receives GMM/Alfa/Vida/quote docs.

### 7.3 Constitutional Clarity

Improves because:

- Root remains reserved for protected anchors and runtime entrypoints.
- Architecture docs stop pretending to be root-level runtime peers.
- Platform boundary is reinforced.

Evidence:

- REPO-004 rejected "root == Platform".
- Protected root assets remain unmoved.

### 7.4 Maintenance Cost

Improves because:

- Future doc moves become smaller.
- Root scans become more meaningful.
- File ownership can be inferred from top-level docs structure more reliably.

Risk:

- Reference links may break unless handled by a separate rewrite/validation wave.

Miranda verdict:

Migration improves Forge if it stays documentation-only, preserves protected anchors and splits reference rewrites into a reviewable follow-up.

---

## 8. Final Verdict

Choice:

C. Partial migration first.

Recommended authorization:

1. Approve committing Wave 1 staged `git mv` renames after final status review.
2. Do not start Wave 2 until Wave 1 is committed.
3. Build `REPO_MIGRATION_HARNESS_v1` before moving test/validation docs or untracked docs.
4. Run reference rewrite as a separate commit after broken-link report.

Confidence:

86 / 100 for Wave 1 commit.

72 / 100 for Wave 2 after explicit untracked-file approval.

62 / 100 for automated reference rewrite until broken-link detection exists.

No-go boundaries:

- Do not move `FORGE_CONSTITUTION_V3.md`.
- Do not move `FORGE_MASTER_BUILD_TREE.md`.
- Do not move `AGENTS.md`.
- Do not move `app.js`.
- Do not move `index.html`.
- Do not move `manifest.json`.
- Do not move `service-worker.js`.
- Do not move `sw-cache-config.js`.
- Do not move code/runtime files under the document migration plan.

Next action:

Request human authorization to commit Wave 1 using:

```text
Move root documentation into architecture docs folders
```
