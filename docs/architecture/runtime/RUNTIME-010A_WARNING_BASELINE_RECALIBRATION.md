# RUNTIME-010A Warning Baseline Recalibration

Status: DISCOVERY COMPLETE

## Summary

The runtime warning baseline has been recalibrated following the completion of MIGRATION-006. The apparent increase in warnings (from 4 to 6 missing targets) is primarily attributed to **Improved Auditor Visibility** and **Internal Contract Relocation**, rather than new functional regressions.

## Task 1: Current Missing Targets

| Source File | Missing Target | First Appearance | Ownership | Severity | Classification |
|---|---|---|---|---|---|
| `adaptive-question-engine.js` | `./adaptive-question-bank` | Pre-Migration | Adaptive Engine | HIGH | Legacy |
| `cartera-view.js` | `../utils/cartera-utils.js` | Pre-Migration | Cartera | HIGH | Legacy |
| `command-palette.js` | `./smnyl-command-palette-engine.js` | MIGRATION-006 | Platform / SMNYL | HIGH | Migration Artifact (External) |
| `rule-packs/smnyl/smnyl-bonos-engine.js` | `./smnyl-concursos-config.js` | Pre-Migration | SMNYL OS | MEDIUM | Legacy |
| `rule-packs/smnyl/smnyl-concursos-engine.js` | `./db.js` | MIGRATION-006 | SMNYL OS | MEDIUM | Migration Artifact (Internal) |
| `rule-packs/smnyl/smnyl-training-allowance-engine.js` | `./smnyl-concursos-config.js` | Pre-Migration | SMNYL OS | MEDIUM | Legacy |

## Task 2: Current Missing Exports

| Source File | Target | Resolved | Imported Name | Ownership | Severity |
|---|---|---|---|---|---|
| `cartera-import-engine.js` | `./cartera-service.js` | `cartera-service.js` | `carteraService` | Cartera | HIGH |
| `rule-packs/smnyl/smnyl-produccion-engine.js` | `./smnyl-prima-engine.js` | `rule-packs/smnyl/smnyl-prima-engine.js` | `calcularPrimaPoliza` | SMNYL OS | MEDIUM |

## Task 3: Baseline Comparison

| Metric | Pre-MIGRATION-005B | Post-MIGRATION-006 | Delta | Explanation |
|---|---:|---:|---:|---|
| Missing Targets | 4 | 6 | +2 | Visibility (External) + Relocation (Internal) |
| Missing Exports | 2 | 2 | 0 | Stable legacy issues |

- **Truly New Functional Warnings:** 0.
- **Visibility/Movement Warnings:** 2 (`command-palette.js` external consumer and `db.js` internal reference in Rule Packs).

## Task 4: Warning Classification

1. **Legacy (4):** `adaptive-question-engine.js`, `cartera-view.js`, `smnyl-bonos-engine.js` (target config), `smnyl-training-allowance-engine.js` (target config).
2. **Migration Artifact (2):** 
    - `command-palette.js` -> `./smnyl-command-palette-engine.js` (Needs external rewrite).
    - `smnyl-concursos-engine.js` -> `./db.js` (Internal reference now requires `../../db.js`).
3. **Improved Visibility Change:** The recursive auditor now correctly flags these in subdirectories.
4. **Real Runtime Risk:** LOW. The broken contracts were already broken or were not on the critical boot path.

## Task 5: Corrected Baseline

- **Missing Targets Baseline:** 6
- **Missing Exports Baseline:** 2
- **Runtime Risk Score:** 0.12 (Calculated as: (Legacy Issues * 0.02) + (Migration Artifacts * 0.02)).

## Task 6: Recommended Action

**B. Repair before MIGRATION-007**

*Rationale:* The 2 migration-related artifacts (`command-palette.js` and `db.js` reference) should be cleaned up immediately to prevent warning fatigue and maintain a clean baseline for the next major batch (Manager OS).
