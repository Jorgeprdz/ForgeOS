# RUNTIME-010A Warning Classification

Status: DISCOVERY COMPLETE

## Warning Taxonomy

All current warnings in the `EXECUTABLE_WITH_WARNINGS` baseline are classified as follows:

### 1. Legacy Deficits (Pre-existing)
These warnings were present before the current migration phase and represent pre-existing architectural gaps in the source codebase.

- **Missing Targets:**
  - `adaptive-question-engine.js` -> `./adaptive-question-bank`: Core logic reference to missing module.
  - `cartera-view.js` -> `../utils/cartera-utils.js`: UI reference to missing utility folder.
  - `smnyl-bonos-engine.js` -> `./smnyl-concursos-config.js`: Domain engine reference to missing config.
  - `smnyl-training-allowance-engine.js` -> `./smnyl-concursos-config.js`: Domain engine reference to missing config.
- **Missing Exports:**
  - `cartera-import-engine.js` -> `cartera-service.js`: Named export `carteraService` missing in target.
  - `smnyl-produccion-engine.js` -> `smnyl-prima-engine.js`: Named export `calcularPrimaPoliza` missing in target.

### 2. Migration Artifacts (Post-Relocation)
These warnings are a direct result of moving files without performing exhaustive consumer rewrites during MIGRATION-006.

- **Missing Targets:**
  - `command-palette.js` -> `./smnyl-command-palette-engine.js`: External consumer at root now needs a path update to `rule-packs/smnyl/`.
  - `smnyl-concursos-engine.js` -> `./db.js`: Internal reference within `rule-packs/smnyl/` now needs to traverse up to root (`../../db.js`).

## Severity Assessment

| Class | Count | Impact on Boot | Impact on Domain | Action |
|---|---:|---|---|---|
| Legacy | 6 | NONE | MEDIUM | Track as debt |
| Migration Artifact | 2 | NONE | LOW | **REPAIR IMMEDIATELY** |

## Corrected Baseline Recommendation

The baseline is currently **8 total warnings** (6 targets, 2 exports). 
After the recommended repair of migration artifacts, the baseline should return to **6 total warnings** (4 targets, 2 exports).
