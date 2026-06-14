# RUNTIME-003 Module Graph Validation

Report ID: RUNTIME-003
Status: EXECUTABLE VALIDATION / NO FIXES

## Executive Summary

Scanned 668 root JavaScript files and found 199 import edges.

Executability verdict: `EXECUTABLE_WITH_WARNINGS`

No runtime files were modified, no imports were rewritten, and no files were renamed.

## Summary

| Metric | Count |
| --- | --- |
| Total JS files scanned | 668 |
| Total imports found | 199 |
| Missing targets | 6 |
| Missing exports | 2 |
| Circular imports | 0 |
| Boot blockers | 0 |

## Missing Import Targets

| Source | Target | Resolved | Type | Classification |
| --- | --- | --- | --- | --- |
| adaptive-question-engine.js | ./adaptive-question-bank | adaptive-question-bank.js | static | DOMAIN_BLOCKER |
| cartera-view.js | ../utils/cartera-utils.js | ../utils/cartera-utils.js | static | ROUTE_BLOCKER |
| command-palette.js | ./smnyl-command-palette-engine.js | smnyl-command-palette-engine.js | static | DOMAIN_BLOCKER |
| rule-packs/smnyl/smnyl-bonos-engine.js | ./smnyl-concursos-config.js | rule-packs/smnyl/smnyl-concursos-config.js | static | DOMAIN_BLOCKER |
| rule-packs/smnyl/smnyl-concursos-engine.js | ./db.js | rule-packs/smnyl/db.js | static | DOMAIN_BLOCKER |
| rule-packs/smnyl/smnyl-training-allowance-engine.js | ./smnyl-concursos-config.js | rule-packs/smnyl/smnyl-concursos-config.js | static | DOMAIN_BLOCKER |

## Missing Named Exports

| Source | Target | Resolved | Imported Name | Classification |
| --- | --- | --- | --- | --- |
| cartera-import-engine.js | ./cartera-service.js | cartera-service.js | carteraService | ROUTE_BLOCKER |
| rule-packs/smnyl/smnyl-produccion-engine.js | ./smnyl-prima-engine.js | rule-packs/smnyl/smnyl-prima-engine.js | calcularPrimaPoliza | DOMAIN_BLOCKER |

## Circular Imports

None detected.

## Specific RUNTIME-002 Findings

| Finding | Result |
| --- | --- |
| utils.js imports ./overlay-manager.js | Not detected |
| ./ovelay-manager.js exists | YES |
| callGemini imported from app.js | Not detected |

## Executability Verdict

`EXECUTABLE_WITH_WARNINGS`

No boot blockers were detected by static module evidence.

## Recommended RUNTIME-004 Scope

Perform a controlled repair plan for the two boot-blocking contracts: resolve the overlay manager filename/export mismatch and resolve the `callGemini` export contract without changing app-shell architecture beyond the approved fixes.

Confidence score: 0.88
