# REPO-003 Physical Migration Readiness Test

Report ID: REPO-003
Status: ARCHITECTURE DISCOVERY
Subject: Readiness to execute physical repository migration
Decision State: GO AFTER TOOLING / NO PHYSICAL MOVEMENT YET

---

## 1. Executive Verdict

Forge is not ready to move files today.

Forge is ready to prepare migration tooling and governance gates.

Verdict:

B. GO AFTER TOOLING.

Current repository evidence:

- JS/TS/MD/JSON files currently visible: 997
- Relative import references detected mechanically: 509
- Test-like JS files detected: 99
- Test-like JS files outside `tests/`: 87
- Existing migration/dry-run tooling detected: none
- Existing source ownership registry detected: yes, but it governs source/claim truth boundaries, not physical file ownership

Readiness score:

42 / 100

The blocker is not architectural direction. The blocker is execution safety.

---

## 2. Question 1: Migration Preconditions

Before moving a single file, Forge must distinguish three things:

1. Constitutional permission:
   Is the movement allowed?

2. Technical safety:
   Can imports, tests, runtime routes and rollback be controlled?

3. Behavioral proof:
   Does Forge still make the same decisions after the move?

### 2.1 Preconditions Table

| Precondition | Classification | Current Status | Why It Matters |
| --- | --- | --- | --- |
| ADR-0020 governance ratified | MANDATORY | Not present | Physical movement needs constitutional authority. |
| File ownership rule ratified | MANDATORY | Discovered, not ratified | A file needs one accountable owner before placement. |
| Repository ownership registry | MANDATORY | Missing | Migration cannot depend only on filename heuristics. |
| Import boundary rules | MANDATORY | Missing | Cross-domain imports need allowed/forbidden rules. |
| Dependency graph | MANDATORY | Partial static evidence only | Blast radius cannot be known without graph visibility. |
| Import graph with unresolved imports | MANDATORY | Partial from migration plan | Rewrites must be deterministic. |
| Legacy quarantine registry | MANDATORY | Missing | Legacy cannot become a landfill. |
| Dry-run capability | MANDATORY | Missing | Movement must be simulated before touching files. |
| Rollback procedure | MANDATORY | Missing | A failed batch must be reversible quickly. |
| Test gate map | MANDATORY | Partial | 87 test-like files are outside `tests/`; gates are not normalized. |
| No-move surface list | MANDATORY | Present in plan | Root runtime/governance files must remain protected. |
| Batch approval protocol | MANDATORY | Missing | Movement requires human authorization. |
| Baseline test results | MANDATORY | Not refreshed for this PAQ | Need known-good baseline before migration. |
| CODEOWNERS/domain owners | RECOMMENDED | Missing | Needed as contributor count grows. |
| Domain public API convention | RECOMMENDED | Missing | Prevents private import coupling. |
| Import linting | RECOMMENDED | Missing | Automates boundary enforcement. |
| Domain-level README/manifest | RECOMMENDED | Missing | Improves ownership discoverability. |
| Automated health report | RECOMMENDED | Missing | Tracks drift after migration. |
| CI integration | RECOMMENDED | Unknown | Required before team-scale migration. |
| Visual dependency graph | OPTIONAL | Missing | Useful for review, not required for first pilot. |
| Bulk migration script | OPTIONAL | Missing | Bulk movement should not be early goal. |

Minimum gate:

No file should move until all MANDATORY preconditions are satisfied or explicitly waived by constitutional approval.

---

## 3. Question 2: Import Blast Radius Test

Assumption:

500 files are moved.

That is not a migration batch. That is a repo surgery event.

### 3.1 What Can Break

| Risk | Example Failure | Detectability | Requires Automation? | Severity |
| --- | --- | --- | --- | --- |
| Broken relative imports | `require("./x")` no longer resolves | High if tests/import graph run | Yes | Critical |
| Missed dynamic imports | Runtime builds path dynamically | Medium | Yes plus review | High |
| HTML/script references | Browser loads old root path | Medium | Yes plus route scan | High |
| Service worker cache paths | Cached old files persist | Low without browser/runtime test | Yes | High |
| Manifest/static references | PWA assets point to old paths | Medium | Yes | Medium |
| Test gate drift | Tests moved but runner no longer finds them | Medium | Yes | High |
| Root test assumptions | Root tests import sibling files | High | Yes | High |
| CommonJS/ESM resolution mismatch | Import rewrite changes module semantics | Medium | Review required | High |
| Documentation references stale paths | ADR/build tree points to old path | Medium | Yes | Medium |
| Runtime registry paths | Command/search/module registry uses old location | Low if string-based | Yes plus review | High |
| Silent duplicate truth | Moved copy leaves old file or stale import | Low | Yes | Critical |
| Git history confusion | Massive rename diff hides behavior changes | Medium | Process control | Medium |
| Case/path issues | Mobile/Termux/git path quirks | Medium | Automation | Medium |

### 3.2 Detectable vs Silent Failures

Detectable with automation:

- Static import breakage
- Missing files
- Unresolved relative imports
- Duplicate paths
- Test command failure
- Syntax errors
- Circular dependency changes

Silent without deeper checks:

- Runtime route strings
- Service worker cache path drift
- Documentation pointing to old paths
- Business behavior changed by accidental import target
- Domain ownership changed without ADR
- Manager/Advisor boundary leakage
- Rule Pack leakage into Core
- Tests no longer covering the intended decision

### 3.3 Migration Risk Matrix

| Movement Type | Blast Radius | Automation Need | Human Review Need | Recommendation |
| --- | --- | --- | --- | --- |
| One doc file with no imports | Low | Low | Medium | Safe pilot after approval |
| One isolated engine with dedicated test | Low-Medium | Medium | High | Best first code pilot |
| Engine plus direct test | Medium | High | High | Safe after dry-run |
| One small Rule Pack candidate set | Medium | High | High | Good learning candidate |
| Whole domain folder | High | Very high | Very high | Not ready |
| 500 files | Extreme | Mandatory | Impossible to review well | Forbidden for first phases |
| Platform/root runtime | Extreme | Mandatory | Very high | Unsafe early |
| Shared Intelligence bulk move | Extreme | Mandatory | Very high | Unsafe early |

---

## 4. Question 3: Repository Inventory Audit

Forge currently has a useful inventory, not a complete migration control system.

| Inventory Item | Current Knowledge | Readiness |
| --- | --- | ---: |
| Every file | `rg --files` and migration plan can enumerate files | 90% |
| Every owner | Heuristic domain assignment exists; accountable owner registry missing | 35% |
| Every dependency | Static relative imports partially known; dynamic/runtime refs incomplete | 45% |
| Every import path | Static imports partially known; unresolved imports remain | 55% |
| Every orphan candidate | Mechanical candidates exist, but not constitutional orphans | 50% |
| Every legacy candidate | Heuristic legacy count exists; quarantine registry missing | 35% |
| Every test gate | Test-like files known; owner/test gate mapping incomplete | 45% |
| Every no-move file | Initial no-move list exists | 75% |
| Every rollback target | Not defined | 20% |

Overall inventory readiness:

50 / 100

Execution readiness:

42 / 100

Reason:

Forge can see many files, but it cannot yet guarantee owner, dependency, route, test and rollback safety for physical movement.

---

## 5. Question 4: Migration Unit Test

The smallest safe migration batch is not a folder.

The safest migration unit is:

> One owner-approved leaf file plus its directly validating test gate, moved through dry-run first.

### 5.1 Candidate Unit Types

| Unit | Rollback Complexity | Learning Value | Risk | Verdict |
| --- | --- | --- | --- | --- |
| One doc file | Very low | Low | Low | Good process pilot, not code proof |
| One isolated leaf engine | Low | High | Medium | Best first code unit |
| One engine + dedicated test | Medium | Highest | Medium | Best first meaningful batch |
| One orchestrator | Medium-High | High | High | Later |
| One domain | High | Medium | High | Too large |
| One folder | High | Low | High | Aesthetic risk |
| 500 files | Extreme | Low | Extreme | Forbidden |

Recommended first unit:

One isolated Rule Pack or Product Intelligence leaf file with:

- Zero or one inbound consumer
- Clear owner
- Dedicated smoke/master test
- No app shell dependency
- No service worker/manifest path dependency
- No cross-domain private imports

Batch size:

1 to 3 files maximum for the first code migration.

---

## 6. Question 5: Dry-Run Requirements

Before migration begins, dry-run must produce reports that are reviewable by humans.

### 6.1 Mandatory Dry-Run Outputs

| Output | Required Content | Gate |
| --- | --- | --- |
| File Inventory Report | All files in scope, current path, proposed path | Required before approval |
| Owner Graph | File -> owner -> consumers -> decision protected | Required before approval |
| Import Graph | Static imports before/after move | Required before approval |
| Unresolved Import Report | Any import that cannot resolve after simulated move | Must be zero or approved exception |
| Inbound Consumer Report | Who imports each moved file | Required before approval |
| Runtime Reference Report | String/path refs in HTML, service worker, manifest, registries, docs | Required for code/runtime files |
| Test Gate Report | Which tests validate moved files | Required before approval |
| Legacy Impact Report | Any file entering/leaving Legacy and exit condition | Required if Legacy touched |
| Domain Boundary Report | New allowed/forbidden cross-domain imports | Required before approval |
| Duplicate/Stale Copy Report | Confirms no old copy remains accidentally | Required |
| Rollback Plan | Exact commands/files to restore | Required |
| Diff Preview | Simulated rename/import rewrite summary | Required |

### 6.2 Optional Dry-Run Outputs

- Visual dependency graph
- Domain heat map
- Import fan-in/fan-out chart
- Path churn report

Optional outputs cannot substitute for mandatory gates.

---

## 7. Question 6: Automation Test

Assumption:

Codex performs migration.

Automation must be constrained. Codex can generate evidence quickly, but file movement can still encode wrong ownership if the source rules are weak.

### 7.1 Automation Classification

| Activity | Classification | Notes |
| --- | --- | --- |
| Inventory generation | SAFE | Mechanical and repeatable. |
| Static import graph generation | SAFE | Must include unresolved report. |
| Inbound dependency scan | SAFE | Mechanical, but incomplete for dynamic refs. |
| Duplicate detection | SAFE | Review before action. |
| Orphan candidate detection | SAFE | Candidate only; never deletion. |
| Legacy candidate detection | REVIEW REQUIRED | Requires governance context. |
| Ownership tagging from filename | REVIEW REQUIRED | Weak evidence only. |
| Ownership tagging from ADR/registry | REVIEW REQUIRED | Stronger, still human-reviewed. |
| Import rewriting in dry-run | SAFE | No write mode only. |
| Import rewriting in real files | REVIEW REQUIRED | Only after dry-run and batch approval. |
| Folder creation | REVIEW REQUIRED | Allowed only after ADR/batch approval. |
| `git mv` one approved file | REVIEW REQUIRED | Must be explicit and reversible. |
| Bulk `mv` / bulk `git mv` | FORBIDDEN | Too much blast radius. |
| Deleting orphan candidates | FORBIDDEN | Requires quarantine history and approval. |
| Moving `app.js` | FORBIDDEN | Explicitly protected until separate approval. |
| Moving `manifest.json` / `service-worker.js` | FORBIDDEN | Runtime path risk. |
| Moving `AGENTS.md` / `FORGE_MASTER_BUILD_TREE.md` | FORBIDDEN | Governance roots. |
| Creating permanent Legacy | FORBIDDEN | Legacy is quarantine only. |
| Auto-fixing business ownership conflicts | FORBIDDEN | Constitutional decision required. |

---

## 8. Question 7: Migration Governance

No file movement should occur without constitutional authority.

### 8.1 Roles

| Role | Authority |
| --- | --- |
| Miranda | Quality gate. Rejects movement that creates activity without product value, hides risk or weakens decision clarity. |
| Arqui Juve | Architecture gate. Validates owner, dependency direction, module boundary and rollback design. |
| Repository Governance | Process gate. Confirms ADR-0020, registry, dry-run, Legacy metadata and test gate compliance. |
| Domain Owner | Meaning gate. Confirms the file protects this domain's decision and not another domain's truth. |
| Human Approver | Final authority. Explicitly approves batch movement. |

### 8.2 Approval Flow

1. Identify candidate file(s).
2. Produce dry-run report.
3. Assign accountable owner.
4. Validate import graph and runtime references.
5. Identify test gate.
6. Produce rollback plan.
7. Miranda review:
   Does this improve Forge or just move files?
8. Arqui Juve review:
   Does this preserve architecture and reduce risk?
9. Repository Governance review:
   Are ADR-0020 and migration gates satisfied?
10. Human approval:
   Explicit approval for this batch only.
11. Execute `git mv` and import rewrites.
12. Run tests.
13. Review diff.
14. Commit only if requested.

Approval rule:

Approval for one batch does not authorize the next batch.

---

## 9. Question 8: First Migration Candidate

Candidates:

- Product Intelligence
- Policy Operations
- Compensation
- Rule Packs
- Platform
- Shared Intelligence

### 9.1 Selection Criteria

| Criterion | Weight |
| --- | ---: |
| Lowest coupling | High |
| Lowest runtime risk | High |
| Highest governance learning value | High |
| Easy rollback | High |
| Clear owner | High |
| Low app shell dependency | High |
| Low Shared/Platform contamination risk | Medium |

### 9.2 Candidate Ranking

| Candidate | Coupling | Runtime Risk | Learning Value | Rollback | Verdict |
| --- | --- | --- | --- | --- | --- |
| Rule Packs | Low current count, high conceptual clarity | Low-Medium | High | Easy if tiny | First safe candidate after tooling |
| Product Intelligence | Medium; many leaf engines and tests | Medium | High | Manageable in tiny batches | Second candidate |
| Compensation | Medium; economic/rule sensitivity | Medium-High | High | Manageable but needs RuleSnapshot discipline | Later |
| Policy Operations | High; imports, OCR, tasks, operational flows | High | High | Harder | Later |
| Shared Intelligence | High governance sensitivity | High | High | Hard | Unsafe early |
| Platform | Very high root/runtime coupling | Extreme | Medium | Hard | First unsafe candidate |

First safe migration candidate:

Rule Packs, but only as a tiny pilot batch.

Rationale:

- Smallest conceptual surface.
- High constitutional value because Rule Pack boundary is already central.
- Easy rollback if limited to one to three files.
- Teaches import rewriting, owner tagging and test mapping without touching app shell.

Important limitation:

Rule Packs should move only after the rule-pack owner and RuleSnapshot expectations are explicit. Carrier/channel logic is sensitive even when file count is small.

First unsafe migration candidate:

Platform.

Rationale:

Platform includes runtime, storage, sync, command, app shell and root-coupled files. Breakage can be silent and user-facing.

---

## 10. Question 9: Rollback Test

Assumption:

Migration fails.

Rollback must restore behavior, paths and reviewability.

### 10.1 What Must Be Restorable

| Restorable Item | Requirement |
| --- | --- |
| File paths | Every moved file can return to original path. |
| Import paths | Every rewritten import can return to original value. |
| Test paths | Test runner expectations restored. |
| Runtime refs | HTML/service worker/manifest/registry refs restored. |
| Documentation refs | Any path refs restored or marked stale. |
| Git history clarity | Rename stays reviewable. |
| Owner metadata | Registry state can roll back. |
| Legacy metadata | Quarantine state can roll back. |

### 10.2 Maximum Acceptable Blast Radius

First code migration:

- 1 to 3 files moved
- 1 direct test gate
- Zero app shell files
- Zero service worker/manifest changes
- Zero broad folder moves
- Zero deletion
- Zero unrelated formatting

If rollback requires touching more than 10 files, the batch was too large.

### 10.3 Rollback Procedure

Required before execution:

1. Capture `git status --short`.
2. Capture dry-run report.
3. Capture list of files to move.
4. Capture import rewrite map.
5. Capture test baseline.
6. Execute movement only after approval.

Rollback action:

1. Stop further edits.
2. Revert only the approved migration batch files.
3. Restore original imports from rewrite map.
4. Restore original test paths.
5. Run focused test gate.
6. Run `git diff --check`.
7. Document failure cause before retry.

Forbidden rollback shortcut:

Do not use broad destructive rollback commands that can delete unrelated user work.

---

## 11. Final Verdict

### 11.1 Readiness Score

42 / 100

### 11.2 Blockers

| Blocker | Severity |
| --- | --- |
| ADR-0020 not ratified | Critical |
| No repository ownership registry | Critical |
| No dry-run tooling | Critical |
| No Legacy quarantine registry | Critical |
| No import boundary rules | Critical |
| No rollback procedure | Critical |
| Test gates not normalized or mapped to owners | High |
| Dynamic/runtime route references not fully visible | High |
| Broad untracked documentation state exists | Medium |

### 11.3 Required Tooling

Mandatory before physical migration:

1. `scripts/forge-repo-migration-dry-run.js`
2. Repository ownership registry
3. Legacy quarantine registry
4. Import graph report
5. Owner graph report
6. Runtime reference scanner
7. Test gate map
8. Rollback map generator
9. Repository health report

### 11.4 First Safe Migration Candidate

Rule Packs, tiny pilot only.

Recommended batch:

1 to 3 files maximum, preferably one leaf rule-pack candidate plus its direct test gate.

### 11.5 First Unsafe Migration Candidate

Platform.

Do not move Platform early. Do not move `app.js`, `manifest.json`, `service-worker.js`, `AGENTS.md` or `FORGE_MASTER_BUILD_TREE.md` under ADR-0020 migration.

### 11.6 Recommended Batch Size

First docs/process pilot:

- 1 file

First code pilot:

- 1 to 3 files

Normal early migration:

- 3 to 7 files only after tooling succeeds

Forbidden early migration:

- Whole domain
- Whole folder
- 50+ files
- 500 files

### 11.7 Go / No-Go Decision

Verdict:

B. GO AFTER TOOLING.

Formal conclusion:

> Forge can ratify migration governance soon. Forge cannot safely execute physical migration yet.

Next recommended PAQ:

Create the migration dry-run tool and registries without moving files. The first implementation should generate evidence only:

- file inventory
- owner graph
- import graph
- legacy graph
- test gate map
- rollback preview

Only after that evidence exists should Forge request approval for the first one-file migration pilot.
