# ARCH-001 Migration Batch Strategy

Status: ARCHITECTURE DESIGN / NO CODE SCAN
Date: 2026-06-11

## Purpose

Define the first five physical migration batches toward the target Forge OS folder architecture.

This is planning only. No file movement is authorized by this document.

## Migration Principles

1. Preserve runtime before improving layout.
2. Move documentation before code when possible.
3. Move isolated validation assets before runtime assets.
4. Do not move high-risk compatibility shells until lazy-loading and route contracts are proven.
5. Do not mix physical migration with behavioral refactor.
6. Every batch must have a validation gate and rollback plan.

## Batch 1: Root Policy Enforcement For Governance And Entry Points

Scope:

- Finalize and enforce the root policy.
- Classify root survivors into Runtime Assets, Governance Assets, and Repository Entry Points.
- Do not move runtime modules yet.

Expected benefit:

- Prevents root drift after Repository Governance cleanup.
- Establishes the physical migration contract before code movement.
- Gives future batches a clear allow/deny rule.

Risk:

- LOW_RISK

Validation required:

```sh
node scripts/repo-doc-migration-harness.js
git diff --check
```

Codex mode:

- PLAN FIRST.
- Execute only after explicit approval.

Why first:

- It protects the already-completed root cleanup and avoids starting physical migration from a blurry root policy.

## Batch 2: Rule Packs Foundation

Scope:

- Create `rule-packs/`.
- Move carrier/channel/period-specific rules only after an exact move map is approved.
- First candidate family: SMNYL Agency 2026 rule-pack material.

Expected benefit:

- Separates Forge Core from carrier-specific interpretation.
- Supports the Universal Core / Rule Pack Boundary.
- Reduces risk of hardcoded carrier logic staying in core or compensation modules.

Risk:

- MEDIUM_RISK

Validation required:

```sh
node --check <moved-rule-files>
node scripts/runtime-module-graph-audit.js
node scripts/repo-doc-migration-harness.js
git diff --check
```

Codex mode:

- PLAN FIRST.
- Execute only after exact move map approval.

Notes:

- This batch should not change rule behavior.
- Imports must be rewritten mechanically only if the approved move map requires it.
- Historical rule snapshots must remain intact.

## Batch 3: Product Intelligence Physical Domain

Scope:

- Create `product-intelligence/`.
- Move product intelligence engines and product evidence documentation according to an approved move map.
- Prioritize product modules with low runtime coupling.

Expected benefit:

- Clarifies product truth ownership.
- Separates product interpretation from policy operations and compensation.
- Protects the no-invented-products boundary.

Risk:

- MEDIUM_RISK

Validation required:

```sh
node --check <moved-product-files>
node scripts/runtime-module-graph-audit.js
node scripts/repo-doc-migration-harness.js
node tests/run-all-tests.js
git diff --check
```

Codex mode:

- PLAN FIRST.
- Execute only after exact move map and test list approval.

Notes:

- Product truth must not be mixed with commission or contest logic.
- GMM coverage intelligence should preserve evidence-first and false-confidence protections.

## Batch 4: Policy Operations Physical Domain

Scope:

- Create `policy-operations/`.
- Move policy import, OCR, staging, review, policy timeline, policy task, renewal, and operational center modules after dependency mapping.

Expected benefit:

- Gives policy lifecycle a clear operational home.
- Separates operational work from product truth and compensation interpretation.
- Makes future policy UI/runtime routes easier to isolate.

Risk:

- MEDIUM_RISK to HIGH_RISK depending on import surface.

Validation required:

```sh
node --check <moved-policy-files>
node scripts/runtime-module-graph-audit.js
node scripts/repo-doc-migration-harness.js
node tests/run-all-tests.js
git diff --check
```

Codex mode:

- PLAN ONLY until a dependency map proves low blast radius.

Notes:

- Do not move `cartera.js` as part of this batch unless its route boundary has already been lazy-loaded or isolated.
- Policy operation engines can move before legacy route modules if imports are clean.

## Batch 5: Platform Runtime Consolidation

Scope:

- Create `platform/`.
- Move stable platform infrastructure after lazy route contract is proven.
- Candidate families include state, event, lifecycle, render, logging, error, analytics, sync, runtime, cache, network, and Supabase boundary modules.

Expected benefit:

- Establishes the final runtime substrate.
- Moves Forge closer to a platform-owned shell.
- Reduces physical coupling between domain logic and boot infrastructure.

Risk:

- HIGH_RISK if attempted before route lazy-loading.
- MEDIUM_RISK after route loader and dashboard pilot prove the boundary.

Validation required:

```sh
node --check app.js
node scripts/runtime-module-graph-audit.js
node scripts/repo-doc-migration-harness.js
node tests/run-all-tests.js
git diff --check
```

Codex mode:

- PLAN ONLY until after RUNTIME-013.
- Execute only by small platform sub-batches.

Notes:

- Do not move `app.js` in this batch.
- `app.js` remains the root runtime entry point until the Forge-native platform shell exists.

## What Should Not Move Yet

Do not move yet:

- `app.js`
- `index.html`
- Current route modules still statically imported by `app.js`
- `comisiones.js`
- `referidos.js`
- `cartera.js`
- Any module with unresolved `window.navigateTo` dependency
- Any module acting as a root runtime entry point
- Any file with unclear source ownership
- Any compensation/rule logic without an explicit rule-pack boundary
- Any historical rule snapshot
- Any active compatibility shim whose consumers are not mapped

## RUNTIME-013 Timing Recommendation

RUNTIME-013 dashboard lazy-loading should happen before physical folder migration of runtime or route modules.

Reason:

- Physical migration changes paths.
- Lazy-loading changes route resolution.
- Doing both at once would combine import-path risk with navigation-contract risk.
- Dashboard lazy-loading is LOW_RISK and creates a safer route-loader boundary before moving files.

Recommended order:

1. Complete ARCH-001 planning.
2. Execute RUNTIME-013 dashboard lazy-load pilot.
3. Validate runtime graph and route behavior.
4. Execute Batch 1 root policy enforcement.
5. Begin physical migration with exact move maps.

## Final Batch Verdict

First batch:

- Batch 1: Root Policy Enforcement For Governance And Entry Points.

First code-affecting runtime step:

- RUNTIME-013 dashboard lazy-load pilot before any physical runtime/route migration.

Confidence score:

- 0.86

Confidence is high for sequencing and ownership boundaries. It is below 0.90 because this ARCH-001 pass intentionally avoided file scanning and exact import dependency mapping.

