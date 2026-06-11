# RUNTIME-003 Module Graph Validation

Report ID: RUNTIME-003
Status: EXECUTABLE VALIDATION / NO FIXES

## Executive Summary

Scanned 670 root JavaScript files and found 194 import edges.

Executability verdict: `LIKELY_BOOT_FAILURE`

No runtime files were modified, no imports were rewritten, and no files were renamed.

## Summary

| Metric | Count |
| --- | --- |
| Total JS files scanned | 670 |
| Total imports found | 194 |
| Missing targets | 5 |
| Missing exports | 4 |
| Circular imports | 2 |
| Boot blockers | 3 |

## Missing Import Targets

| Source | Target | Resolved | Type | Classification |
| --- | --- | --- | --- | --- |
| adaptive-question-engine.js | ./adaptive-question-bank | adaptive-question-bank.js | static | DOMAIN_BLOCKER |
| cartera-view.js | ../utils/cartera-utils.js | ../utils/cartera-utils.js | static | ROUTE_BLOCKER |
| smnyl-bonos-engine.js | ./smnyl-concursos-config.js | smnyl-concursos-config.js | static | DOMAIN_BLOCKER |
| smnyl-training-allowance-engine.js | ./smnyl-concursos-config.js | smnyl-concursos-config.js | static | DOMAIN_BLOCKER |
| utils.js | ./overlay-manager.js | overlay-manager.js | static | BOOT_BLOCKER |

## Missing Named Exports

| Source | Target | Resolved | Imported Name | Classification |
| --- | --- | --- | --- | --- |
| cartera-import-engine.js | ./cartera-service.js | cartera-service.js | carteraService | ROUTE_BLOCKER |
| comisiones.js | ./app.js | app.js | callGemini | BOOT_BLOCKER |
| prospeccion.js | ./app.js | app.js | callGemini | BOOT_BLOCKER |
| smnyl-produccion-engine.js | ./smnyl-prima-engine.js | smnyl-prima-engine.js | calcularPrimaPoliza | DOMAIN_BLOCKER |

## Circular Imports

| Classification | Chain |
| --- | --- |
| APP_SHELL_CYCLE | app.js -> prospeccion.js -> app.js |
| APP_SHELL_CYCLE | app.js -> comisiones.js -> app.js |

## Specific RUNTIME-002 Findings

| Finding | Result |
| --- | --- |
| utils.js imports ./overlay-manager.js | CONFIRMED MISSING TARGET |
| ./ovelay-manager.js exists | YES |
| callGemini imported from app.js | CONFIRMED MISSING EXPORT |

## Executability Verdict

`LIKELY_BOOT_FAILURE`

Static module evidence contains BOOT_BLOCKER issues in the app shell reachable graph. Runtime movement and shell refactor remain blocked until these contracts are repaired or proven false by executable browser validation.

## Recommended RUNTIME-004 Scope

Perform a controlled repair plan for the two boot-blocking contracts: resolve the overlay manager filename/export mismatch and resolve the `callGemini` export contract without changing app-shell architecture beyond the approved fixes.

Confidence score: 0.88
