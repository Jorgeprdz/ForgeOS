# FORGE REPOSITORY MIGRATION PLAN

Estado: PLAN DE MIGRACION / NO CODE MOVED / NO IMPORTS CHANGED / NO COMMIT

Fecha de generacion: 2026-06-10

## 1. Objetivo

Organizar Forge OS en carpetas por dominio sin romper imports, pruebas, rutas existentes ni boundaries de AGENTS.md. Este documento es deliberadamente conservador: propone batches pequenos, dry-runs obligatorios y una fase de compatibilidad antes de cualquier `mv` real.

## 2. Inventario Escaneado

- Archivos JS/TS/MD/JSON escaneados: 995
- Archivos JS/TS con imports relativos detectados: 196
- Imports relativos no resueltos por analisis estatico simple: 5
- Candidatos huerfanos JS/TS sin imports relativos ni referencias entrantes: 327
- Duplicados por nombre de archivo: 11
- Duplicados por contenido exacto: 2

### Conteo por dominio propuesto

| Dominio | Archivos |
| --- | ---: |
| advisor-os | 153 |
| compensation | 53 |
| docs | 80 |
| docs/root-governance | 3 |
| legacy | 119 |
| manager-os | 51 |
| platform | 68 |
| policy-operations | 91 |
| product-intelligence | 165 |
| rule-packs | 2 |
| shared-intelligence | 44 |
| shared-intelligence/data-contracts | 65 |
| tests | 101 |

### Conteo por riesgo

| Riesgo | Archivos |
| --- | ---: |
| ALTO | 55 |
| BAJO | 551 |
| MEDIO | 384 |
| NO_MOVER | 5 |

## 3. Estructura Destino Propuesta

- `advisor-os/`
- `manager-os/`
- `shared-intelligence/`
- `product-intelligence/`
- `policy-operations/`
- `compensation/`
- `rule-packs/`
- `platform/`
- `docs/`
- `tests/`
- `legacy/`

Subcarpetas recomendadas para la primera migracion controlada:

- `advisor-os/nash/`, `advisor-os/relationship/`, `advisor-os/prospecting/`, `advisor-os/sales-conversion/`
- `manager-os/recruitment/`, `manager-os/precontract/`, `manager-os/team-intelligence/`, `manager-os/manager-alerts/`
- `shared-intelligence/contracts/`, `shared-intelligence/financial/`, `shared-intelligence/evidence/`, `shared-intelligence/decision/`
- `product-intelligence/gmm/`, `product-intelligence/vida-mujer/`, `product-intelligence/imagina-ser/`, `product-intelligence/orvi/`, `product-intelligence/segu-beca/`
- `policy-operations/import/`, `policy-operations/timeline/`, `policy-operations/tasks/`, `policy-operations/renewals/`, `policy-operations/ocr/`
- `compensation/smnyl-agency-2026/`, `compensation/production/`, `compensation/contests/`, `compensation/manager-compensation/`
- `rule-packs/smnyl-agency-2026/`
- `platform/runtime/`, `platform/storage/`, `platform/sync/`, `platform/commands/`, `platform/ui-shell/`
- `docs/architecture/`, `docs/archive/`, `docs/adr/`, `docs/03-discovery/`
- `tests/unit/`, `tests/master/`, `tests/smoke/`, `tests/fixtures/`

## 4. Archivos que NO deben moverse en la primera fase

| Archivo | Motivo |
| --- | --- |
| `AGENTS.md` | Ruta raiz o runtime/governance con alto acoplamiento externo; requiere ADR o compat layer antes de mover. |
| `FORGE_MASTER_BUILD_TREE.md` | Ruta raiz o runtime/governance con alto acoplamiento externo; requiere ADR o compat layer antes de mover. |
| `app.js` | Ruta raiz o runtime/governance con alto acoplamiento externo; requiere ADR o compat layer antes de mover. |
| `manifest.json` | Ruta raiz o runtime/governance con alto acoplamiento externo; requiere ADR o compat layer antes de mover. |
| `service-worker.js` | Ruta raiz o runtime/governance con alto acoplamiento externo; requiere ADR o compat layer antes de mover. |

Tambien se recomienda congelar inicialmente cualquier archivo consumido directamente por HTML, service worker, manifest, pruebas maestras externas o documentacion de gobierno hasta tener mapa de rutas confirmado.

## 5. Riesgos Principales

- Imports relativos root-to-root: mover un archivo rompe `require("./x")` o `import "./x"` si no se reescribe junto con sus consumidores.
- Tests maestros en raiz: muchos `*-master-test.js`, `*-smoke-test.js` y `*-acceptance-test.js` no viven en `tests/`, pero son gates reales.
- Mezcla CommonJS/ESM: la migracion debe preservar estilo por archivo y evitar conversiones durante movimiento.
- Rutas operativas: `app.js`, `manifest.json`, `service-worker.js`, assets/runtime y archivos de shell pueden depender de rutas implicitas no capturadas por imports estaticos.
- Dominios superpuestos: algunos archivos `shared-*`, GMM/producto y policy operations comparten conceptos; moverlos sin ownership puede duplicar verdad.

## 6. Comando Dry-run sugerido

Antes de cualquier batch real, ejecutar un dry-run que copie a una carpeta temporal, aplique movimientos simulados y corra deteccion de imports sin tocar el repo:

```sh
node scripts/forge-repo-migration-dry-run.js --plan FORGE_REPOSITORY_MIGRATION_PLAN.md --batch "1 - Docs y arquitectura" --check-imports --no-write
```

Si el script aun no existe, primer batch tecnico aprobado debe ser crear solo `scripts/forge-repo-migration-dry-run.js` y su fixture minima; no debe mover archivos.

## 7. Comandos sugeridos para migracion segura

```sh
git status --short
node scripts/forge-repo-migration-dry-run.js --plan FORGE_REPOSITORY_MIGRATION_PLAN.md --batch "<batch>" --check-imports --no-write
node tests/module-integrity-test.js
node tests/smoke-test.js
node tests/run-all-tests.js
git diff --check
```

Para un batch aprobado, usar `git mv` archivo por archivo y actualizar imports en el mismo commit funcional. Nunca usar `mv` masivo ni `git add .`.

## 8. Batches recomendados

| Batch | Archivos | Criterio de avance |
| --- | ---: | --- |
| 0 - No mover | 5 | Dry-run limpio, imports resueltos, pruebas relevantes verdes, diff pequeno. |
| 1 - Docs y arquitectura | 81 | Dry-run limpio, imports resueltos, pruebas relevantes verdes, diff pequeno. |
| 10 - Platform | 65 | Dry-run limpio, imports resueltos, pruebas relevantes verdes, diff pequeno. |
| 11 - Legacy quarantine | 119 | Dry-run limpio, imports resueltos, pruebas relevantes verdes, diff pequeno. |
| 2 - Tests y fixtures | 166 | Dry-run limpio, imports resueltos, pruebas relevantes verdes, diff pequeno. |
| 3 - Shared intelligence | 44 | Dry-run limpio, imports resueltos, pruebas relevantes verdes, diff pequeno. |
| 4 - Rule packs | 2 | Dry-run limpio, imports resueltos, pruebas relevantes verdes, diff pequeno. |
| 5 - Product intelligence | 165 | Dry-run limpio, imports resueltos, pruebas relevantes verdes, diff pequeno. |
| 6 - Policy operations | 91 | Dry-run limpio, imports resueltos, pruebas relevantes verdes, diff pequeno. |
| 7 - Advisor OS | 153 | Dry-run limpio, imports resueltos, pruebas relevantes verdes, diff pequeno. |
| 8 - Manager OS | 51 | Dry-run limpio, imports resueltos, pruebas relevantes verdes, diff pequeno. |
| 9 - Compensation | 53 | Dry-run limpio, imports resueltos, pruebas relevantes verdes, diff pequeno. |

## 9. Imports relativos afectados

| Archivo | Imports relativos detectados | Referencias entrantes |
| --- | --- | --- |
| `accident-smoke-test.js` | ./accident-intelligence-engine.js => accident-intelligence-engine.js | - |
| `actividad.js` | ./db.js => db.js<br>./ai-service.js => ai-service.js<br>./event-system.js => event-system.js<br>./memory-manager.js => memory-manager.js<br>./utils.js => utils.js | `app.js` |
| `adaptive-message-builder.js` | ./tone-profile-engine => tone-profile-engine.js<br>./channel-adaptation-engine => channel-adaptation-engine.js | - |
| `adaptive-outreach-prompt-builder.js` | ./prospect-personality-engine => prospect-personality-engine.js<br>./communication-style-engine => communication-style-engine.js<br>./script-adaptation-engine => script-adaptation-engine.js | - |
| `adaptive-question-engine.js` | ./adaptive-question-bank => adaptive-question-bank<br>./question-style-match-engine => question-style-match-engine.js | - |
| `ai-service.js` | ./event-system.js => event-system.js | `actividad.js` |
| `app.js` | ./db.js => db.js<br>./utils.js => utils.js<br>./dashboard.js => dashboard.js<br>./prospeccion.js => prospeccion.js<br>./referidos.js => referidos.js<br>./actividad.js => actividad.js<br>... +12 | `comisiones.js`<br>`prospeccion.js` |
| `auth-guard.js` | ./utils.js => utils.js | `core-app-engine.js` |
| `base-repository.js` | ./telemetry.js => telemetry.js | `cartera-repository.js` |
| `candidate-assessment-engine.js` | ./candidate-hard-factors-engine => candidate-hard-factors-engine.js<br>./candidate-vital-factors-engine => candidate-vital-factors-engine.js<br>./candidate-coachability-engine => candidate-coachability-engine.js<br>./candidate-market-quality-engine => candidate-market-quality-engine.js | `candidate-assessment-master-test.js` |
| `candidate-assessment-master-test.js` | ./candidate-assessment-engine => candidate-assessment-engine.js | - |
| `candidate-coachability-master-test.js` | ./candidate-coachability-engine => candidate-coachability-engine.js | - |
| `candidate-hard-factors-master-test.js` | ./candidate-hard-factors-engine => candidate-hard-factors-engine.js | - |
| `candidate-market-quality-master-test.js` | ./candidate-market-quality-engine => candidate-market-quality-engine.js | - |
| `candidate-vital-factors-master-test.js` | ./candidate-vital-factors-engine => candidate-vital-factors-engine.js | - |
| `cartera-import-engine.js` | ./cartera-service.js => cartera-service.js | - |
| `cartera-normalizer.js` | ./financial-utils.js => financial-utils.js | `cartera-service.js` |
| `cartera-repository.js` | ./base-repository.js => base-repository.js<br>./db.js => db.js | - |
| `cartera-service.js` | ./db.js => db.js<br>./cartera-normalizer.js => cartera-normalizer.js<br>./cartera-validator.js => cartera-validator.js<br>./cartera-events.js => cartera-events.js<br>./cartera-state.js => cartera-state.js | `cartera-import-engine.js` |
| `cartera-view.js` | ../utils/cartera-utils.js => ../utils/cartera-utils.js | - |
| `cartera.js` | ./db.js => db.js<br>./utils.js => utils.js<br>./state-manager.js => state-manager.js<br>./event-system.js => event-system.js<br>./ui-render-engine.js => ui-render-engine.js<br>./analytics-engine.js => analytics-engine.js<br>... +2 | `app.js` |
| `catastrophic-illness-smoke-test.js` | ./catastrophic-illness-engine.js => catastrophic-illness-engine.js | - |
| `client-engagement-master-test.js` | ./client-engagement-engine => client-engagement-engine.js | - |
| `comisiones.js` | ./db.js => db.js<br>./app.js => app.js<br>./utils.js => utils.js | `app.js` |
| `command-palette.js` | ./smnyl-command-palette-engine.js => smnyl-command-palette-engine.js | - |
| `command-shortcuts-engine.js` | ./command-palette-ui.js => command-palette-ui.js | - |
| `concursos.js` | ./smnyl-concursos-engine.js => smnyl-concursos-engine.js | - |
| `core-app-engine.js` | ./network-manager.js => network-manager.js<br>./offline-sync.js => offline-sync.js<br>./logger.js => logger.js<br>./performance-monitor.js => performance-monitor.js<br>./auth-guard.js => auth-guard.js<br>./responsive-engine.js => responsive-engine.js<br>... +4 | `app.js` |
| `coverage-foundation-smoke-test.js` | ./coverage-evaluation-foundation-engine.js => coverage-evaluation-foundation-engine.js | - |
| `coverage-intelligence-orchestrator.js` | ./event-classification-engine.js => event-classification-engine.js<br>./evidence-collection-engine.js => evidence-collection-engine.js<br>./maternity-intelligence-engine.js => maternity-intelligence-engine.js<br>./accident-intelligence-engine.js => accident-intelligence-engine.js<br>./hospitalization-intelligence-engine.js => hospitalization-intelligence-engine.js<br>./surgery-intelligence-engine.js => surgery-intelligence-engine.js<br>... +4 | `coverage-orchestrator-smoke-test.js` |
| `coverage-orchestrator-smoke-test.js` | ./coverage-intelligence-orchestrator.js => coverage-intelligence-orchestrator.js | - |
| `crash-runtime.js` | ./telemetry.js => telemetry.js | - |
| `dashboard-executive.js` | ./smnyl-operating-system-engine.js => smnyl-operating-system-engine.js | - |
| `dashboard.js` | ./db.js => db.js<br>./state-manager.js => state-manager.js<br>./event-system.js => event-system.js<br>./logger.js => logger.js<br>./memory-manager.js => memory-manager.js<br>./ui-render-engine.js => ui-render-engine.js | `app.js` |
| `db.js` | ./storage-engine.js => storage-engine.js | `actividad.js`<br>`app.js`<br>`cartera-repository.js`<br>`cartera-service.js`<br>`cartera.js`<br>`comisiones.js`<br>... +5 |
| `decision-appendix-master-test.js` | ./shared-benefit-hierarchy-engine => shared-benefit-hierarchy-engine.js<br>./shared-recovery-analysis-engine => shared-recovery-analysis-engine.js<br>./shared-decision-clarity-engine => shared-decision-clarity-engine.js<br>./shared-client-language-engine => shared-client-language-engine.js<br>./shared-price-placement-engine => shared-price-placement-engine.js<br>./shared-decision-score-engine => shared-decision-score-engine.js<br>... +1 | - |
| `domain-runtime.js` | ./core-event-bus.js => core-event-bus.js<br>./domain-store.js => domain-store.js | - |
| `dynamic-cash-value-projection-engine.js` | ./projection-engine.js => projection-engine.js<br>./projection-milestone-engine.js => projection-milestone-engine.js | `presentation-input-pipeline.js`<br>`tests/critical-path-test.js` |
| `education-cost-master-test.js` | ./segu-beca-education-comparison-engine => segu-beca-education-comparison-engine.js | - |
| `education-paths-master-test.js` | ./shared-education-paths-engine => shared-education-paths-engine.js | - |
| `error-boundary.js` | ./analytics-engine.js => analytics-engine.js | `app.js`<br>`core-app-engine.js` |
| `event-advisor-review-engine.js` | ./next-best-question-engine.js => next-best-question-engine.js | `event-advisor-review-smoke-test.js` |
| `event-advisor-review-smoke-test.js` | ./event-advisor-review-engine.js => event-advisor-review-engine.js | - |
| `event-classification-smoke-test.js` | ./event-classification-engine.js => event-classification-engine.js | - |
| `event-client-review-engine.js` | ./next-best-question-engine.js => next-best-question-engine.js | `event-client-review-smoke-test.js` |
| `event-client-review-smoke-test.js` | ./event-client-review-engine.js => event-client-review-engine.js | - |
| `evidence-collection-engine.js` | ./event-classification-engine.js => event-classification-engine.js | `coverage-intelligence-orchestrator.js`<br>`evidence-collection-smoke-test.js` |
| `evidence-collection-smoke-test.js` | ./evidence-collection-engine.js => evidence-collection-engine.js | - |
| `exchange-rate-cache-engine.js` | ./shared-banxico-rate-engine => shared-banxico-rate-engine.js | `imagina-ser-banxico-integration-test.js`<br>`imagina-ser-master-test.js`<br>`market-data-master-test.js`<br>`orvi-client-report-test.js`<br>`orvi-mxn-master-test.js`<br>`retirement-presentation-scenario-engine.js`<br>... +4 |
| `false-confidence-smoke-test.js` | ./false-confidence-protection-engine.js => false-confidence-protection-engine.js | - |
| `financial-responsibility-smoke-test.js` | ./financial-responsibility-engine.js => financial-responsibility-engine.js | - |
| `forge-ai-connector-master-test.js` | ./forge-ai-prompt-builder => forge-ai-prompt-builder.js<br>./forge-ai-guardrails-engine => forge-ai-guardrails-engine.js<br>./forge-ai-connector => forge-ai-connector.js | - |
| `forge-ai-connector.js` | ./forge-ai-prompt-builder => forge-ai-prompt-builder.js<br>./forge-ai-guardrails-engine => forge-ai-guardrails-engine.js | `forge-ai-connector-master-test.js` |
| `forge-ai-prompt-builder.js` | ./forge-ai-guardrails-engine => forge-ai-guardrails-engine.js | `forge-ai-connector-master-test.js`<br>`forge-ai-connector.js` |
| `forge-gmm-real-case-smoke-test.js` | ./document-classification-engine.js => document-classification-engine.js<br>./gmm-quote-summary-engine.js => gmm-quote-summary-engine.js<br>./gmm-policy-caratula-summary-engine.js => gmm-policy-caratula-summary-engine.js | - |
| `forge-gmm-sprint-2-smoke-test.js` | ./gmm-quote-summary-engine.js => gmm-quote-summary-engine.js<br>./gmm-policy-caratula-summary-engine.js => gmm-policy-caratula-summary-engine.js<br>./quote-to-policy-comparison-engine.js => quote-to-policy-comparison-engine.js | - |
| `forge-gmm-sprint-3-smoke-test.js` | ./gmm-quote-summary-engine.js => gmm-quote-summary-engine.js<br>./gmm-policy-caratula-summary-engine.js => gmm-policy-caratula-summary-engine.js<br>./quote-to-policy-comparison-engine.js => quote-to-policy-comparison-engine.js<br>./gmm-advisor-review-engine.js => gmm-advisor-review-engine.js | - |
| `forge-gmm-sprint-4-smoke-test.js` | ./gmm-quote-summary-engine.js => gmm-quote-summary-engine.js<br>./gmm-policy-caratula-summary-engine.js => gmm-policy-caratula-summary-engine.js<br>./quote-to-policy-comparison-engine.js => quote-to-policy-comparison-engine.js<br>./gmm-advisor-review-engine.js => gmm-advisor-review-engine.js<br>./gmm-client-review-engine.js => gmm-client-review-engine.js | - |
| `forge-imagina-ser-client-presentation-test.js` | ./imagina-ser-ocr-extractor => imagina-ser-ocr-extractor.js<br>./imagina-ser-retirement-fund-engine => imagina-ser-retirement-fund-engine.js<br>./imagina-ser-scenario-engine => imagina-ser-scenario-engine.js<br>./imagina-ser-variant-engine => imagina-ser-variant-engine.js<br>./imagina-ser-fiscal-router-engine => imagina-ser-fiscal-router-engine.js<br>./shared-tax-profile-engine => shared-tax-profile-engine.js<br>... +4 | - |
| `forge-shared-ave-master-test.js` | ./shared-ave-growth-engine => shared-ave-growth-engine.js<br>./shared-ave-rescue-engine => shared-ave-rescue-engine.js<br>./shared-ave-death-benefit-engine => shared-ave-death-benefit-engine.js<br>./shared-ave-type-inference-engine => shared-ave-type-inference-engine.js<br>./shared-ave-portfolio-engine => shared-ave-portfolio-engine.js<br>./shared-ave-confidence-engine => shared-ave-confidence-engine.js<br>... +1 | - |
| `forge-vida-mujer-advisor-report.js` | ./vida-mujer-knowledge-extractor => vida-mujer-knowledge-extractor.js<br>./forge-presentation-engine => forge-presentation-engine.js | - |
| `health-runtime.js` | ./telemetry.js => telemetry.js | - |
| `hospitalization-smoke-test.js` | ./hospitalization-intelligence-engine.js => hospitalization-intelligence-engine.js | - |
| `human-review-routing-smoke-test.js` | ./human-review-routing-engine.js => human-review-routing-engine.js | - |
| `imagina-ser-banxico-integration-test.js` | ./exchange-rate-cache-engine => exchange-rate-cache-engine.js<br>./imagina-ser-decision-engine => imagina-ser-decision-engine.js<br>./imagina-ser-client-presentation-engine => imagina-ser-client-presentation-engine.js<br>./imagina-ser-ocr-extractor => imagina-ser-ocr-extractor.js<br>./retirement-presentation-scenario-engine.js => retirement-presentation-scenario-engine.js | - |
| `imagina-ser-client-presentation-engine.js` | ./imagina-ser-human-language-engine => imagina-ser-human-language-engine.js | `imagina-ser-banxico-integration-test.js`<br>`imagina-ser-master-test.js` |
| `imagina-ser-fiscal-master-test.js` | ./shared-tax-profile-engine => shared-tax-profile-engine.js<br>./imagina-ser-article-151-engine => imagina-ser-article-151-engine.js<br>./imagina-ser-happy-numbers-engine => imagina-ser-happy-numbers-engine.js<br>./imagina-ser-fiscal-slide-engine => imagina-ser-fiscal-slide-engine.js | - |
| `imagina-ser-fiscal-router-engine.js` | ./imagina-ser-fiscal-bag-engine => imagina-ser-fiscal-bag-engine.js<br>./imagina-ser-article-151-engine => imagina-ser-article-151-engine.js<br>./imagina-ser-article-185-engine => imagina-ser-article-185-engine.js | `forge-imagina-ser-client-presentation-test.js`<br>`imagina-ser-variant-fiscal-master-test.js` |
| `imagina-ser-future-mxn-bridge.js` | ./retirement-future-udi-projection-engine => retirement-future-udi-projection-engine.js | `retirement-future-udi-projection-smoke-test.js` |
| `imagina-ser-master-test.js` | ./imagina-ser-ocr-extractor => imagina-ser-ocr-extractor.js<br>./imagina-ser-retirement-fund-engine => imagina-ser-retirement-fund-engine.js<br>./imagina-ser-scenario-engine => imagina-ser-scenario-engine.js<br>./imagina-ser-decision-engine => imagina-ser-decision-engine.js<br>./imagina-ser-objection-engine => imagina-ser-objection-engine.js<br>./imagina-ser-client-presentation-engine => imagina-ser-client-presentation-engine.js<br>... +3 | - |
| `imagina-ser-ocr-extractor.js` | ./shared-document-priority-engine => shared-document-priority-engine.js | `forge-imagina-ser-client-presentation-test.js`<br>`imagina-ser-banxico-integration-test.js`<br>`imagina-ser-master-test.js`<br>`imagina-ser-real-quote-validation.js` |
| `imagina-ser-real-quote-validation.js` | ./imagina-ser-ocr-extractor => imagina-ser-ocr-extractor.js | - |
| `imagina-ser-variant-fiscal-master-test.js` | ./imagina-ser-variant-engine => imagina-ser-variant-engine.js<br>./imagina-ser-fiscal-bag-engine => imagina-ser-fiscal-bag-engine.js<br>./imagina-ser-fiscal-router-engine => imagina-ser-fiscal-router-engine.js | - |
| `life-event-engine.js` | ./nash-memory-engine => nash-memory-engine.js<br>./relationship-timeline-engine => relationship-timeline-engine.js<br>./relationship-opportunity-engine => relationship-opportunity-engine.js | `life-event-master-test.js`<br>`relationship-master-acceptance-test.js`<br>`relationship-master-engine.js` |
| `life-event-master-test.js` | ./life-event-engine => life-event-engine.js | - |
| `market-data-master-test.js` | ./exchange-rate-cache-engine => exchange-rate-cache-engine.js<br>./shared-currency-projection-engine => shared-currency-projection-engine.js | - |
| `mass-import-mapping-engine.js` | ./smart-field-detection-engine.js => smart-field-detection-engine.js | - |
| `maternity-smoke-test.js` | ./maternity-intelligence-engine.js => maternity-intelligence-engine.js | - |
| `module-lifecycle.js` | ./memory-manager.js => memory-manager.js | `app.js` |
| `multi-label-event-smoke-test.js` | ./multi-label-event-engine.js => multi-label-event-engine.js | - |
| `mutation-engine.js` | ./store.js => store.js<br>./sync-engine.js => sync-engine.js | - |
| `nash-advisor-performance-engine.js` | ./nash-learning-engine => nash-learning-engine.js | `nash-advisor-performance-master-test.js`<br>`nash-master-acceptance-test.js`<br>`nash-master-intelligence-engine.js` |
| `nash-advisor-performance-master-test.js` | ./nash-advisor-performance-engine => nash-advisor-performance-engine.js | - |
| `nash-coaching-insight-master-test.js` | ./nash-coaching-insight-engine => nash-coaching-insight-engine.js | - |
| `nash-combat-intelligence-report-engine.js` | ./nash-combat-orchestrator => nash-combat-orchestrator.js<br>./nash-intent-engine => nash-intent-engine.js<br>./nash-next-best-action-engine => nash-next-best-action-engine.js | `nash-combat-intelligence-report-test.js`<br>`nash-master-intelligence-engine.js` |
| `nash-combat-intelligence-report-test.js` | ./nash-combat-intelligence-report-engine => nash-combat-intelligence-report-engine.js | - |
| `nash-combat-master-test.js` | ./nash-combat-orchestrator => nash-combat-orchestrator.js | - |
| `nash-core-engine.js` | ./nash-prospect-context-builder => nash-prospect-context-builder.js<br>./nash-council-orchestrator => nash-council-orchestrator.js<br>./nash-message-recommendation-engine => nash-message-recommendation-engine.js<br>./nash-personality-engine => nash-personality-engine.js<br>./nash-followup-engine => nash-followup-engine.js<br>./nash-next-best-action-engine => nash-next-best-action-engine.js<br>... +1 | `nash-integration-master-test.js`<br>`nash-master-test.js`<br>`nash-v03-master-test.js`<br>`nash-v04-master-test.js` |
| `nash-integration-master-test.js` | ./nash-core-engine => nash-core-engine.js | - |
| `nash-intent-master-test.js` | ./nash-intent-engine => nash-intent-engine.js | - |
| `nash-learning-master-test.js` | ./nash-learning-engine => nash-learning-engine.js | - |
| `nash-manager-alert-master-test.js` | ./nash-manager-alert-engine => nash-manager-alert-engine.js | - |
| `nash-master-acceptance-test.js` | ./nash-prospect-context-builder => nash-prospect-context-builder.js<br>./nash-personality-engine => nash-personality-engine.js<br>./nash-intent-engine => nash-intent-engine.js<br>./nash-combat-orchestrator => nash-combat-orchestrator.js<br>./nash-memory-engine => nash-memory-engine.js<br>./nash-learning-engine => nash-learning-engine.js<br>... +6 | - |
| `nash-master-intelligence-engine.js` | ./nash-prospect-context-builder => nash-prospect-context-builder.js<br>./nash-personality-engine => nash-personality-engine.js<br>./nash-intent-engine => nash-intent-engine.js<br>./nash-memory-engine => nash-memory-engine.js<br>./nash-learning-engine => nash-learning-engine.js<br>./nash-combat-intelligence-report-engine => nash-combat-intelligence-report-engine.js<br>... +4 | `nash-master-acceptance-test.js`<br>`nash-master-intelligence-master-test.js` |
| `nash-master-intelligence-master-test.js` | ./nash-master-intelligence-engine => nash-master-intelligence-engine.js | - |
| `nash-master-test.js` | ./nash-core-engine => nash-core-engine.js | - |
| `nash-memory-master-test.js` | ./nash-memory-engine => nash-memory-engine.js | - |
| `nash-next-best-action-master-test.js` | ./nash-next-best-action-engine => nash-next-best-action-engine.js | - |
| `nash-personality-master-test.js` | ./nash-personality-engine => nash-personality-engine.js | - |
| `nash-team-intelligence-master-test.js` | ./nash-team-intelligence-engine => nash-team-intelligence-engine.js | - |
| `nash-v03-master-test.js` | ./nash-core-engine => nash-core-engine.js | - |
| `nash-v04-master-test.js` | ./nash-core-engine => nash-core-engine.js | - |
| `network-manager.js` | ./event-system.js => event-system.js<br>./state-manager.js => state-manager.js | `core-app-engine.js`<br>`offline-sync.js` |
| `next-best-question-smoke-test.js` | ./next-best-question-engine.js => next-best-question-engine.js | - |
| `offline-sync.js` | ./db.js => db.js<br>./network-manager.js => network-manager.js | `core-app-engine.js`<br>`sync-orchestrator.js` |
| `optional-coverage-smoke-test.js` | ./optional-coverage-intelligence-engine.js => optional-coverage-intelligence-engine.js | - |
| `orvi-client-report-test.js` | ./orvi-ocr-extractor => orvi-ocr-extractor.js<br>./orvi-guaranteed-value-timeline-engine => orvi-guaranteed-value-timeline-engine.js<br>./orvi-wait-vs-cancel-engine => orvi-wait-vs-cancel-engine.js<br>./exchange-rate-cache-engine => exchange-rate-cache-engine.js<br>./orvi-mxn-conversion-engine => orvi-mxn-conversion-engine.js<br>./orvi-client-presentation-engine => orvi-client-presentation-engine.js<br>... +1 | - |
| `orvi-master-test.js` | ./orvi-ocr-extractor => orvi-ocr-extractor.js<br>./orvi-guaranteed-value-timeline-engine => orvi-guaranteed-value-timeline-engine.js<br>./orvi-wait-vs-cancel-engine => orvi-wait-vs-cancel-engine.js<br>./orvi-event-engine => orvi-event-engine.js<br>./orvi-decision-engine => orvi-decision-engine.js<br>./orvi-objection-engine => orvi-objection-engine.js | - |
| `orvi-mxn-conversion-engine.js` | ./shared-currency-projection-engine => shared-currency-projection-engine.js | `orvi-client-report-test.js`<br>`orvi-mxn-master-test.js` |
| `orvi-mxn-master-test.js` | ./orvi-ocr-extractor => orvi-ocr-extractor.js<br>./orvi-guaranteed-value-timeline-engine => orvi-guaranteed-value-timeline-engine.js<br>./orvi-wait-vs-cancel-engine => orvi-wait-vs-cancel-engine.js<br>./exchange-rate-cache-engine => exchange-rate-cache-engine.js<br>./orvi-mxn-conversion-engine => orvi-mxn-conversion-engine.js | - |
| `performance-monitor.js` | ./event-system.js => event-system.js | `core-app-engine.js` |
| `performance-runtime.js` | ./telemetry.js => telemetry.js | - |
| `policy-field-confidence-map.js` | ./field-confidence-engine.js => field-confidence-engine.js | - |
| `presentation-input-pipeline.js` | ./quotation-field-normalizer.js => quotation-field-normalizer.js<br>./quotation-currency-bridge.js => quotation-currency-bridge.js<br>./product-detection-engine.js => product-detection-engine.js<br>./product-knowledge-link-engine.js => product-knowledge-link-engine.js<br>./dynamic-cash-value-projection-engine.js => dynamic-cash-value-projection-engine.js | `tests/business-rules-test.js`<br>`tests/critical-path-test.js`<br>`tests/presentation-pipeline-test.js` |
| `proposal-family-smoke-test.js` | ./proposal-family-engine.js => proposal-family-engine.js | - |
| `prospeccion.js` | ./db.js => db.js<br>./app.js => app.js<br>./utils.js => utils.js | `app.js` |
| `query-runtime.js` | ./cache-runtime.js => cache-runtime.js | - |
| `quotation-currency-bridge.js` | ./currency-normalization-engine.js => currency-normalization-engine.js | `presentation-input-pipeline.js` |
| `referidos.js` | ./db.js => db.js<br>./utils.js => utils.js | `app.js` |
| `referral-opportunity-master-test.js` | ./referral-opportunity-engine => referral-opportunity-engine.js | - |
| `relationship-health-master-test.js` | ./relationship-health-engine => relationship-health-engine.js | - |
| `relationship-master-acceptance-test.js` | ./relationship-timeline-engine => relationship-timeline-engine.js<br>./relationship-next-action-engine => relationship-next-action-engine.js<br>./relationship-opportunity-engine => relationship-opportunity-engine.js<br>./life-event-engine => life-event-engine.js<br>./referral-opportunity-engine => referral-opportunity-engine.js<br>./relationship-health-engine => relationship-health-engine.js<br>... +3 | - |
| `relationship-master-engine.js` | ./relationship-timeline-engine => relationship-timeline-engine.js<br>./relationship-next-action-engine => relationship-next-action-engine.js<br>./relationship-opportunity-engine => relationship-opportunity-engine.js<br>./life-event-engine => life-event-engine.js<br>./referral-opportunity-engine => referral-opportunity-engine.js<br>./relationship-health-engine => relationship-health-engine.js<br>... +2 | `relationship-master-acceptance-test.js` |
| `relationship-next-action-master-test.js` | ./relationship-next-action-engine => relationship-next-action-engine.js | - |
| `relationship-opportunity-engine.js` | ./relationship-next-action-engine => relationship-next-action-engine.js | `life-event-engine.js`<br>`relationship-master-acceptance-test.js`<br>`relationship-master-engine.js`<br>`relationship-opportunity-master-test.js` |
| `relationship-opportunity-master-test.js` | ./relationship-opportunity-engine => relationship-opportunity-engine.js | - |
| `relationship-review-master-test.js` | ./relationship-review-engine => relationship-review-engine.js | - |
| `relationship-timeline-master-test.js` | ./relationship-timeline-engine => relationship-timeline-engine.js | - |
| `responsive-engine.js` | ./state-manager.js => state-manager.js | `core-app-engine.js` |
| `retirement-future-udi-projection-smoke-test.js` | ./retirement-future-udi-projection-engine => retirement-future-udi-projection-engine.js<br>./imagina-ser-future-mxn-bridge => imagina-ser-future-mxn-bridge.js | - |
| `retirement-presentation-scenario-engine.js` | ./exchange-rate-cache-engine => exchange-rate-cache-engine.js | `imagina-ser-banxico-integration-test.js`<br>`tests/real-retirement-mxn-scenario-test.js` |
| `route-transition-manager.js` | ./memory-manager.js => memory-manager.js | - |
| `segu-beca-education-comparison-engine.js` | ./shared-education-cost-engine => shared-education-cost-engine.js | `education-cost-master-test.js` |
| `segu-beca-education-options-engine.js` | ./shared-education-paths-engine => shared-education-paths-engine.js | `segu-beca-master-test.js` |
| `segu-beca-master-test.js` | ./segu-beca-decision-engine => segu-beca-decision-engine.js<br>./segu-beca-client-presentation-engine => segu-beca-client-presentation-engine.js<br>./segu-beca-education-options-engine => segu-beca-education-options-engine.js<br>./shared-price-placement-engine => shared-price-placement-engine.js | - |
| `segu-beca-meaningful-numbers-report.js` | ./exchange-rate-cache-engine => exchange-rate-cache-engine.js<br>./shared-projection-scenarios-engine => shared-projection-scenarios-engine.js<br>./shared-meaningful-numbers-engine => shared-meaningful-numbers-engine.js | - |
| `segu-beca-mxn-appendix-report.js` | ./exchange-rate-cache-engine => exchange-rate-cache-engine.js<br>./shared-projection-scenarios-engine => shared-projection-scenarios-engine.js<br>./shared-mxn-timeline-engine => shared-mxn-timeline-engine.js | - |
| `segu-beca-mxn-timeline-clean-report.js` | ./exchange-rate-cache-engine => exchange-rate-cache-engine.js<br>./shared-projection-scenarios-engine => shared-projection-scenarios-engine.js<br>./shared-currency-projection-engine => shared-currency-projection-engine.js<br>./shared-objection-shield-engine => shared-objection-shield-engine.js | - |
| `shared-ave-confidence-report.js` | ./shared-ave-confidence-engine => shared-ave-confidence-engine.js<br>./shared-ave-eligibility-engine => shared-ave-eligibility-engine.js | - |
| `shared-ave-death-benefit-engine.js` | ./shared-ave-growth-engine => shared-ave-growth-engine.js | `forge-shared-ave-master-test.js`<br>`shared-ave-death-benefit-report.js`<br>`vida-mujer-pdf-ave-integration-report.js` |
| `shared-ave-death-benefit-report.js` | ./shared-ave-death-benefit-engine => shared-ave-death-benefit-engine.js | - |
| `shared-ave-growth-report.js` | ./shared-ave-growth-engine => shared-ave-growth-engine.js | - |
| `shared-ave-portfolio-engine.js` | ./shared-ave-growth-engine => shared-ave-growth-engine.js<br>./shared-ave-rescue-engine => shared-ave-rescue-engine.js<br>./shared-ave-type-inference-engine => shared-ave-type-inference-engine.js | `forge-shared-ave-master-test.js`<br>`shared-ave-portfolio-report.js`<br>`vida-mujer-pdf-ave-integration-report.js` |
| `shared-ave-portfolio-report.js` | ./shared-ave-portfolio-engine => shared-ave-portfolio-engine.js | - |
| `shared-ave-rescue-report.js` | ./shared-ave-rescue-engine => shared-ave-rescue-engine.js | - |
| `shared-ave-type-inference-engine.js` | ./shared-ave-growth-engine => shared-ave-growth-engine.js<br>./shared-ave-rescue-engine => shared-ave-rescue-engine.js | `forge-shared-ave-master-test.js`<br>`shared-ave-portfolio-engine.js`<br>`shared-ave-type-inference-report.js` |
| `shared-ave-type-inference-report.js` | ./shared-ave-type-inference-engine => shared-ave-type-inference-engine.js | - |
| `shared-banxico-rate-report.js` | ./shared-banxico-rate-engine => shared-banxico-rate-engine.js | - |
| `shared-clp-master-test.js` | ./shared-clp-engine => shared-clp-engine.js | - |
| `shared-meaningful-numbers-engine.js` | ./shared-currency-projection-engine => shared-currency-projection-engine.js | `segu-beca-meaningful-numbers-report.js` |
| `shared-mxn-timeline-engine.js` | ./shared-currency-projection-engine => shared-currency-projection-engine.js | `segu-beca-mxn-appendix-report.js` |
| `shared-policy-currency-timeline-smoke-test.js` | ./shared-policy-currency-timeline-engine => shared-policy-currency-timeline-engine.js | - |
| `smnyl-automation-engine.js` | ./smnyl-reminders-engine.js => smnyl-reminders-engine.js<br>./smnyl-followup-engine.js => smnyl-followup-engine.js<br>./smnyl-alerts-engine.js => smnyl-alerts-engine.js | `smnyl-operating-system-engine.js` |
| `smnyl-bonos-engine.js` | ./smnyl-concursos-config.js => smnyl-concursos-config.js | `smnyl-concursos-engine.js` |
| `smnyl-comisiones-engine.js` | ./smnyl-prima-engine.js => smnyl-prima-engine.js | - |
| `smnyl-concursos-engine.js` | ./db.js => db.js<br>./smnyl-produccion-engine.js => smnyl-produccion-engine.js<br>./smnyl-bonos-engine.js => smnyl-bonos-engine.js<br>./smnyl-training-allowance-engine.js => smnyl-training-allowance-engine.js | `concursos.js` |
| `smnyl-conteo-engine.js` | ./smnyl-prima-engine.js => smnyl-prima-engine.js | - |
| `smnyl-executive-dashboard-engine.js` | ./smnyl-kpi-engine.js => smnyl-kpi-engine.js<br>./smnyl-health-score-engine.js => smnyl-health-score-engine.js<br>./smnyl-forecast-engine.js => smnyl-forecast-engine.js | `smnyl-operating-system-engine.js` |
| `smnyl-kpi-engine.js` | ./smnyl-persistencia-engine.js => smnyl-persistencia-engine.js<br>./smnyl-retencion-engine.js => smnyl-retencion-engine.js<br>./smnyl-cancelaciones-engine.js => smnyl-cancelaciones-engine.js | `smnyl-executive-dashboard-engine.js` |
| `smnyl-operating-system-engine.js` | ./smnyl-executive-dashboard-engine.js => smnyl-executive-dashboard-engine.js<br>./smnyl-automation-engine.js => smnyl-automation-engine.js<br>./smnyl-anomaly-engine.js => smnyl-anomaly-engine.js<br>./smnyl-time-block-engine.js => smnyl-time-block-engine.js | `dashboard-executive.js` |
| `smnyl-prima-engine.js` | ./smnyl-productos-vida.js => smnyl-productos-vida.js<br>./smnyl-productos-gmm.js => smnyl-productos-gmm.js | `smnyl-comisiones-engine.js`<br>`smnyl-conteo-engine.js`<br>`smnyl-produccion-engine.js` |
| `smnyl-produccion-engine.js` | ./smnyl-prima-engine.js => smnyl-prima-engine.js | `smnyl-concursos-engine.js` |
| `smnyl-training-allowance-engine.js` | ./smnyl-concursos-config.js => smnyl-concursos-config.js | `smnyl-concursos-engine.js` |
| `source-ownership-registry-validation-test.js` | ./source-ownership-registry.js => source-ownership-registry.js | - |
| `src/intelligence/process/process-advancement-engine.js` | ./process-advancement-rules => src/intelligence/process/process-advancement-rules.js | - |
| `src/intelligence/process/process-advancement-rules.js` | ./process-advancement-types => src/intelligence/process/process-advancement-types.js | `src/intelligence/process/process-advancement-engine.js`<br>`src/intelligence/tests/process-advancement-engine.test.js`<br>`src/intelligence/tests/process-advancement-real-world-validation.test.js`<br>`src/intelligence/tests/process-advancement-stress-test.js` |
| `src/intelligence/tests/phase-zero-blueprint-engine.test.js` | ../phase-zero-blueprint-engine.js => src/intelligence/phase-zero-blueprint-engine.js | - |
| `src/intelligence/tests/process-advancement-engine.test.js` | ../process/process-advancement-types => src/intelligence/process/process-advancement-types.js<br>../process/process-advancement-rules => src/intelligence/process/process-advancement-rules.js | - |
| `src/intelligence/tests/process-advancement-real-world-validation.test.js` | ../process/process-advancement-types => src/intelligence/process/process-advancement-types.js<br>../process/process-advancement-rules => src/intelligence/process/process-advancement-rules.js | - |
| `src/intelligence/tests/process-advancement-stress-test.js` | ../process/process-advancement-types => src/intelligence/process/process-advancement-types.js<br>../process/process-advancement-rules => src/intelligence/process/process-advancement-rules.js | - |
| `state-manager.js` | ./event-system.js => event-system.js | `app.js`<br>`cartera.js`<br>`dashboard.js`<br>`network-manager.js`<br>`responsive-engine.js`<br>`sync-orchestrator.js` |
| `storage-engine.js` | ./storage-validator.js => storage-validator.js<br>./storage-queue.js => storage-queue.js | `db.js` |
| `surgery-smoke-test.js` | ./surgery-intelligence-engine.js => surgery-intelligence-engine.js | - |
| `sync-engine.js` | ./runtime.js => runtime.js | `mutation-engine.js` |
| `sync-orchestrator.js` | ./offline-sync.js => offline-sync.js<br>./realtime-engine.js => realtime-engine.js<br>./state-manager.js => state-manager.js<br>./event-system.js => event-system.js | `app.js`<br>`core-app-engine.js` |
| `territoriality-smoke-test.js` | ./territoriality-intelligence-engine.js => territoriality-intelligence-engine.js | - |
| `tests/business-rules-test.js` | ../product-detection-engine.js => product-detection-engine.js<br>../currency-normalization-engine.js => currency-normalization-engine.js<br>../presentation-input-pipeline.js => presentation-input-pipeline.js | - |
| `tests/critical-path-test.js` | ../product-detection-engine.js => product-detection-engine.js<br>../product-knowledge-link-engine.js => product-knowledge-link-engine.js<br>../currency-normalization-engine.js => currency-normalization-engine.js<br>../projection-engine.js => projection-engine.js<br>../projection-milestone-engine.js => projection-milestone-engine.js<br>../dynamic-cash-value-projection-engine.js => dynamic-cash-value-projection-engine.js<br>... +1 | - |
| `tests/gmm-out-of-pocket-test.js` | ../policy-ocr-engine.js => policy-ocr-engine.js<br>../gmm-quote-parser.js => gmm-quote-parser.js<br>../gmm-out-of-pocket-engine.js => gmm-out-of-pocket-engine.js | - |
| `tests/presentation-pipeline-test.js` | ../presentation-input-pipeline.js => presentation-input-pipeline.js | - |
| `tests/real-gmm-quote-test.js` | ../policy-ocr-engine.js => policy-ocr-engine.js<br>../gmm-quote-parser.js => gmm-quote-parser.js | - |
| `tests/real-pdf-ocr-test.js` | ../policy-ocr-engine.js => policy-ocr-engine.js | - |
| `tests/real-retirement-mxn-scenario-test.js` | ../policy-ocr-engine.js => policy-ocr-engine.js<br>../solucionline-retirement-parser.js => solucionline-retirement-parser.js<br>../retirement-presentation-scenario-engine.js => retirement-presentation-scenario-engine.js | - |
| `tests/real-retirement-scenario-test.js` | ../policy-ocr-engine.js => policy-ocr-engine.js<br>../solucionline-retirement-parser.js => solucionline-retirement-parser.js | - |
| `tests/smoke-test.js` | ../policy-timeline-engine.js => policy-timeline-engine.js<br>../policy-renewal-engine.js => policy-renewal-engine.js<br>../product-detection-engine.js => product-detection-engine.js | - |
| `tests/vida-mujer-survival-schedule-test.js` | ../vida-mujer-survival-schedule-engine.js => vida-mujer-survival-schedule-engine.js | - |
| `utils.js` | ./runtime.js => runtime.js<br>./overlay-manager.js => overlay-manager.js | `actividad.js`<br>`app.js`<br>`auth-guard.js`<br>`cartera.js`<br>`comisiones.js`<br>`prospeccion.js`<br>... +1 |
| `vida-mujer-client-presentation-test.js` | ./fixtures/vida-mujer-fixture.json => fixtures/vida-mujer-fixture.json<br>./vida-mujer-client-presentation-engine => vida-mujer-client-presentation-engine.js<br>./shared-price-placement-engine => shared-price-placement-engine.js | - |
| `vida-mujer-coverage-status-report.js` | ./vida-mujer-coverage-status-engine => vida-mujer-coverage-status-engine.js | - |
| `vida-mujer-event-benefits-report.js` | ./event-benefit-engine => event-benefit-engine.js | - |
| `vida-mujer-financial-correction-report.js` | ./vida-mujer-knowledge-extractor => vida-mujer-knowledge-extractor.js<br>./shared-financial-return-engine => shared-financial-return-engine.js<br>./shared-premium-growth-engine => shared-premium-growth-engine.js<br>./shared-protection-efficiency-engine => shared-protection-efficiency-engine.js<br>./shared-human-financial-language-engine => shared-human-financial-language-engine.js | - |
| `vida-mujer-financial-fixture-report.js` | ./fixtures/vida-mujer-quote-fixture.json => fixtures/vida-mujer-quote-fixture.json<br>./exchange-rate-cache-engine => exchange-rate-cache-engine.js | - |
| `vida-mujer-knowledge-extractor-report.js` | ./vida-mujer-knowledge-extractor => vida-mujer-knowledge-extractor.js | - |
| `vida-mujer-pdf-ave-integration-report.js` | ./shared-ave-portfolio-engine => shared-ave-portfolio-engine.js<br>./shared-ave-death-benefit-engine => shared-ave-death-benefit-engine.js<br>./shared-ave-eligibility-engine => shared-ave-eligibility-engine.js | - |
| `vida-mujer-protected-diseases-engine.js` | ./future-currency-value-engine => future-currency-value-engine.js | `vida-mujer-protected-diseases-report.js` |
| `vida-mujer-protected-diseases-report.js` | ./vida-mujer-protected-diseases-engine => vida-mujer-protected-diseases-engine.js | - |

## 10. Imports relativos no resueltos

| Archivo | Import | Resolucion intentada |
| --- | --- | --- |
| `adaptive-question-engine.js` | `./adaptive-question-bank` | `adaptive-question-bank` |
| `cartera-view.js` | `../utils/cartera-utils.js` | `../utils/cartera-utils.js` |
| `smnyl-bonos-engine.js` | `./smnyl-concursos-config.js` | `smnyl-concursos-config.js` |
| `smnyl-training-allowance-engine.js` | `./smnyl-concursos-config.js` | `smnyl-concursos-config.js` |
| `utils.js` | `./overlay-manager.js` | `overlay-manager.js` |

## 11. Archivos huerfanos candidatos

Criterio mecanico: JS/TS sin imports relativos y sin referencias entrantes detectadas. No significa eliminar; significa revisar ownership antes de mover.

| Archivo | Dominio propuesto | Destino propuesto | Riesgo |
| --- | --- | --- | --- |
| `action-resolver-engine.js` | legacy | `legacy/action-resolver-engine.js` | MEDIO |
| `activity-feed-engine.js` | legacy | `legacy/activity-feed-engine.js` | MEDIO |
| `activity-feed.js` | legacy | `legacy/activity-feed.js` | MEDIO |
| `activity-stream-engine.js` | legacy | `legacy/activity-stream-engine.js` | MEDIO |
| `adaptive-script-builder.js` | legacy | `legacy/adaptive-script-builder.js` | MEDIO |
| `advisor-activity-timeline.js` | advisor-os | `advisor-os/advisor-activity-timeline.js` | BAJO |
| `advisor-alert-engine.js` | advisor-os | `advisor-os/advisor-alert-engine.js` | BAJO |
| `advisor-monitor-engine.js` | advisor-os | `advisor-os/advisor-monitor-engine.js` | BAJO |
| `advisor-performance-engine.js` | advisor-os | `advisor-os/advisor-performance-engine.js` | BAJO |
| `advisor-sales-dna.entity.js` | advisor-os | `advisor-os/advisor-sales-dna.entity.js` | BAJO |
| `advisor-score-engine.js` | advisor-os | `advisor-os/advisor-score-engine.js` | BAJO |
| `advisor-style-engine.js` | advisor-os | `advisor-os/advisor-style-engine.js` | BAJO |
| `advisor-style.constants.js` | advisor-os | `advisor-os/advisor-style.constants.js` | BAJO |
| `ai-context-engine.js` | legacy | `legacy/ai-context-engine.js` | MEDIO |
| `ai-first-contact-message-engine.js` | advisor-os | `advisor-os/ai-first-contact-message-engine.js` | BAJO |
| `ai-orb-widget.js` | legacy | `legacy/ai-orb-widget.js` | MEDIO |
| `ai-prompt-builder.js` | legacy | `legacy/ai-prompt-builder.js` | MEDIO |
| `ai-sales-coach-engine.js` | advisor-os | `advisor-os/ai-sales-coach-engine.js` | BAJO |
| `ai-task-suggestion-engine.js` | policy-operations | `policy-operations/ai-task-suggestion-engine.js` | BAJO |
| `animation-engine.js` | legacy | `legacy/animation-engine.js` | MEDIO |
| `appointment-calendar-engine.js` | advisor-os | `advisor-os/appointment-calendar-engine.js` | BAJO |
| `appointment-followup-engine.js` | advisor-os | `advisor-os/appointment-followup-engine.js` | BAJO |
| `appointment-opportunity-engine.js` | advisor-os | `advisor-os/appointment-opportunity-engine.js` | BAJO |
| `assistant-memory-engine.js` | legacy | `legacy/assistant-memory-engine.js` | MEDIO |
| `auto-task-generator-engine.js` | policy-operations | `policy-operations/auto-task-generator-engine.js` | BAJO |
| `buying-signals-engine.js` | legacy | `legacy/buying-signals-engine.js` | MEDIO |
| `cartera-utils.js` | platform | `platform/cartera-utils.js` | ALTO |
| `center-of-influence-engine.js` | advisor-os | `advisor-os/center-of-influence-engine.js` | BAJO |
| `channel-performance-engine.js` | legacy | `legacy/channel-performance-engine.js` | MEDIO |
| `clipboard-action-engine.js` | legacy | `legacy/clipboard-action-engine.js` | MEDIO |
| `close-prompt-builder.js` | advisor-os | `advisor-os/close-prompt-builder.js` | BAJO |
| `close-readiness-engine.js` | manager-os | `manager-os/close-readiness-engine.js` | BAJO |
| `close-strategy-engine.js` | advisor-os | `advisor-os/close-strategy-engine.js` | BAJO |
| `comisiones-rules-gmm.js` | compensation | `compensation/comisiones-rules-gmm.js` | BAJO |
| `comisiones-utils.js` | compensation | `compensation/comisiones-utils.js` | BAJO |
| `command-execution-engine.js` | platform | `platform/command-execution-engine.js` | ALTO |
| `command-palette-engine.js` | platform | `platform/command-palette-engine.js` | ALTO |
| `command-palette.store.js` | platform | `platform/command-palette.store.js` | ALTO |
| `command-parser-engine.js` | platform | `platform/command-parser-engine.js` | ALTO |
| `command-registry.js` | platform | `platform/command-registry.js` | ALTO |
| `command-search-engine.js` | platform | `platform/command-search-engine.js` | ALTO |
| `command-suggestion-engine.js` | platform | `platform/command-suggestion-engine.js` | ALTO |
| `commission-projection-engine.js` | compensation | `compensation/commission-projection-engine.js` | BAJO |
| `commissionable-amount-engine.js` | compensation | `compensation/commissionable-amount-engine.js` | BAJO |
| `communication-channel-engine.js` | legacy | `legacy/communication-channel-engine.js` | MEDIO |
| `communication-mismatch-engine.js` | legacy | `legacy/communication-mismatch-engine.js` | MEDIO |
| `contact-attempt-engine.js` | legacy | `legacy/contact-attempt-engine.js` | MEDIO |
| `contact-channel.constants.js` | legacy | `legacy/contact-channel.constants.js` | MEDIO |
| `contact-response-engine.js` | legacy | `legacy/contact-response-engine.js` | MEDIO |
| `contextual-suggestion-engine.js` | legacy | `legacy/contextual-suggestion-engine.js` | MEDIO |
| `conversion-metrics-engine.js` | legacy | `legacy/conversion-metrics-engine.js` | MEDIO |
| `copilot-suggestion-engine.js` | legacy | `legacy/copilot-suggestion-engine.js` | MEDIO |
| `core_domain-events.js` | legacy | `legacy/core_domain-events.js` | MEDIO |
| `core_event-bus.js` | platform | `platform/core_event-bus.js` | ALTO |
| `csv-parser-engine.js` | legacy | `legacy/csv-parser-engine.js` | MEDIO |
| `daily-points-engine.js` | legacy | `legacy/daily-points-engine.js` | MEDIO |
| `dashboard-priority-engine.js` | platform | `platform/dashboard-priority-engine.js` | ALTO |
| `design-tokens.js` | legacy | `legacy/design-tokens.js` | MEDIO |
| `discovery-insights-engine.js` | advisor-os | `advisor-os/discovery-insights-engine.js` | BAJO |
| `discovery-priority-engine.js` | advisor-os | `advisor-os/discovery-priority-engine.js` | BAJO |
| `discovery-product-alignment-engine.js` | product-intelligence | `product-intelligence/discovery-product-alignment-engine.js` | BAJO |
| `discovery-summary-engine.js` | advisor-os | `advisor-os/discovery-summary-engine.js` | BAJO |
| `discovery-to-presentation-engine.js` | advisor-os | `advisor-os/discovery-to-presentation-engine.js` | BAJO |
| `dna-coaching-engine.js` | manager-os | `manager-os/dna-coaching-engine.js` | BAJO |
| `dna-script-strategy-engine.js` | legacy | `legacy/dna-script-strategy-engine.js` | MEDIO |
| `dom-sanitizer.js` | legacy | `legacy/dom-sanitizer.js` | MEDIO |
| `domain-events.js` | legacy | `legacy/domain-events.js` | MEDIO |
| `drag-drop-policy-zone.js` | policy-operations | `policy-operations/drag-drop-policy-zone.js` | BAJO |
| `entity-resolver-engine.js` | legacy | `legacy/entity-resolver-engine.js` | MEDIO |
| `event-bus-engine.js` | platform | `platform/event-bus-engine.js` | ALTO |
| `event-log-engine.js` | legacy | `legacy/event-log-engine.js` | MEDIO |
| `excel-parser-engine.js` | legacy | `legacy/excel-parser-engine.js` | MEDIO |
| `feature-flags.js` | legacy | `legacy/feature-flags.js` | MEDIO |
| `financial-pyramid-engine.js` | legacy | `legacy/financial-pyramid-engine.js` | MEDIO |
| `financial-pyramid-priority-engine.js` | legacy | `legacy/financial-pyramid-priority-engine.js` | MEDIO |
| `financial-pyramid-story-engine.js` | legacy | `legacy/financial-pyramid-story-engine.js` | MEDIO |
| `financial-risk-score-engine.js` | legacy | `legacy/financial-risk-score-engine.js` | MEDIO |
| `financial-story-task-builder.js` | policy-operations | `policy-operations/financial-story-task-builder.js` | BAJO |
| `first-contact-ai-suggestion-engine.js` | advisor-os | `advisor-os/first-contact-ai-suggestion-engine.js` | BAJO |
| `first-contact-dashboard.viewmodel.js` | advisor-os | `advisor-os/first-contact-dashboard.viewmodel.js` | BAJO |
| `first-contact-delivery-engine.js` | advisor-os | `advisor-os/first-contact-delivery-engine.js` | BAJO |
| `first-contact-objections.constants.js` | advisor-os | `advisor-os/first-contact-objections.constants.js` | BAJO |
| `first-contact-options-engine.js` | advisor-os | `advisor-os/first-contact-options-engine.js` | BAJO |
| `first-contact-script-engine.js` | advisor-os | `advisor-os/first-contact-script-engine.js` | BAJO |
| `first-contact-tone-engine.js` | advisor-os | `advisor-os/first-contact-tone-engine.js` | BAJO |
| `first-contact.entity.js` | advisor-os | `advisor-os/first-contact.entity.js` | BAJO |
| `followup-engine.js` | advisor-os | `advisor-os/followup-engine.js` | BAJO |
| `followup-message-context-engine.js` | advisor-os | `advisor-os/followup-message-context-engine.js` | BAJO |
| `followup-next-date-engine.js` | advisor-os | `advisor-os/followup-next-date-engine.js` | BAJO |
| `followup-overdue-engine.js` | advisor-os | `advisor-os/followup-overdue-engine.js` | BAJO |
| `followup-priority-engine.js` | advisor-os | `advisor-os/followup-priority-engine.js` | BAJO |
| `followup-recommendation-engine.js` | advisor-os | `advisor-os/followup-recommendation-engine.js` | BAJO |
| `followup-reminder-engine.js` | advisor-os | `advisor-os/followup-reminder-engine.js` | BAJO |
| `followup-type.constants.js` | advisor-os | `advisor-os/followup-type.constants.js` | BAJO |
| `followup.entity.js` | advisor-os | `advisor-os/followup.entity.js` | BAJO |
| `forge-build-tree-status.js` | legacy | `legacy/forge-build-tree-status.js` | MEDIO |
| `forge-schema-reporter.js` | shared-intelligence | `shared-intelligence/forge-schema-reporter.js` | BAJO |
| `forge-semantic-risk-report.js` | legacy | `legacy/forge-semantic-risk-report.js` | MEDIO |
| `ghosting-prompt-builder.js` | advisor-os | `advisor-os/ghosting-prompt-builder.js` | BAJO |
| `ghosting-status-engine.js` | advisor-os | `advisor-os/ghosting-status-engine.js` | BAJO |
| `google-calendar-engine.js` | legacy | `legacy/google-calendar-engine.js` | MEDIO |
| `hot-market-engine.js` | legacy | `legacy/hot-market-engine.js` | MEDIO |
| `idle-runtime.js` | platform | `platform/idle-runtime.js` | ALTO |
| `imagina-ser-contribution-engine.js` | product-intelligence | `product-intelligence/imagina-ser-contribution-engine.js` | BAJO |
| `import-progress-engine.js` | policy-operations | `policy-operations/import-progress-engine.js` | BAJO |
| `in-app-notification-engine.js` | platform | `platform/in-app-notification-engine.js` | ALTO |
| `introduction-message-engine.js` | legacy | `legacy/introduction-message-engine.js` | MEDIO |
| `lead-temperature-engine.js` | legacy | `legacy/lead-temperature-engine.js` | MEDIO |
| `life-expectancy-projection-engine.js` | shared-intelligence | `shared-intelligence/life-expectancy-projection-engine.js` | BAJO |
| `line-of-business-engine.js` | policy-operations | `policy-operations/line-of-business-engine.js` | BAJO |
| `live-communication-engine.js` | legacy | `legacy/live-communication-engine.js` | MEDIO |
| `live-dashboard-engine.js` | platform | `platform/live-dashboard-engine.js` | ALTO |
| `live-notification-engine.js` | platform | `platform/live-notification-engine.js` | ALTO |
| `live-operational-state-engine.js` | policy-operations | `policy-operations/live-operational-state-engine.js` | BAJO |
| `manager-alert-engine.js` | manager-os | `manager-os/manager-alert-engine.js` | BAJO |
| `manager-broadcast-engine.js` | manager-os | `manager-os/manager-broadcast-engine.js` | BAJO |
| `manager-coaching-engine.js` | manager-os | `manager-os/manager-coaching-engine.js` | BAJO |
| `manager-feed-engine.js` | manager-os | `manager-os/manager-feed-engine.js` | BAJO |
| `manager-notification-engine.js` | manager-os | `manager-os/manager-notification-engine.js` | BAJO |
| `manager-role-engine.js` | manager-os | `manager-os/manager-role-engine.js` | BAJO |
| `mass-import-preview-engine.js` | policy-operations | `policy-operations/mass-import-preview-engine.js` | BAJO |
| `mass-import-validation-engine.js` | policy-operations | `policy-operations/mass-import-validation-engine.js` | BAJO |
| `momentum-engine.js` | legacy | `legacy/momentum-engine.js` | MEDIO |
| `monthly-revenue-engine.js` | legacy | `legacy/monthly-revenue-engine.js` | MEDIO |
| `motion-principles.js` | legacy | `legacy/motion-principles.js` | MEDIO |
| `nano-banana-icon-system-prompt.js` | legacy | `legacy/nano-banana-icon-system-prompt.js` | MEDIO |
| `needs-discovery-engine.js` | advisor-os | `advisor-os/needs-discovery-engine.js` | BAJO |
| `notification-orchestrator.js` | platform | `platform/notification-orchestrator.js` | ALTO |
| `notification-priority-engine.js` | platform | `platform/notification-priority-engine.js` | ALTO |
| `notification-queue-engine.js` | platform | `platform/notification-queue-engine.js` | ALTO |
| `objection-battle-engine.js` | advisor-os | `advisor-os/objection-battle-engine.js` | BAJO |
| `objection-classifier-engine.js` | advisor-os | `advisor-os/objection-classifier-engine.js` | BAJO |
| `objection-intent-engine.js` | advisor-os | `advisor-os/objection-intent-engine.js` | BAJO |
| `objection-memory-engine.js` | advisor-os | `advisor-os/objection-memory-engine.js` | BAJO |
| `objection-prompt-builder.js` | advisor-os | `advisor-os/objection-prompt-builder.js` | BAJO |
| `objection-resolution-engine.js` | advisor-os | `advisor-os/objection-resolution-engine.js` | BAJO |
| `objection-response-strategy-engine.js` | advisor-os | `advisor-os/objection-response-strategy-engine.js` | BAJO |
| `ocr-result-cache.js` | policy-operations | `policy-operations/ocr-result-cache.js` | BAJO |
| `operational-colors.js` | policy-operations | `policy-operations/operational-colors.js` | BAJO |
| `operational-dashboard-engine.js` | policy-operations | `policy-operations/operational-dashboard-engine.js` | BAJO |
| `operational-feed-engine.js` | policy-operations | `policy-operations/operational-feed-engine.js` | BAJO |
| `operational-shell.store.ts` | policy-operations | `policy-operations/operational-shell.store.ts` | BAJO |
| `operational-sync-engine.js` | policy-operations | `policy-operations/operational-sync-engine.js` | BAJO |
| `opportunity-detector-engine.js` | legacy | `legacy/opportunity-detector-engine.js` | MEDIO |
| `optimistic-mutation-runtime.js` | platform | `platform/optimistic-mutation-runtime.js` | ALTO |
| `outreach-channel.constants.js` | advisor-os | `advisor-os/outreach-channel.constants.js` | BAJO |
| `outreach-prompt-builder.js` | advisor-os | `advisor-os/outreach-prompt-builder.js` | BAJO |
| `ovelay-manager.js` | manager-os | `manager-os/ovelay-manager.js` | BAJO |
| `overdue-task-engine.js` | policy-operations | `policy-operations/overdue-task-engine.js` | BAJO |
| `payment-frequency-engine.js` | legacy | `legacy/payment-frequency-engine.js` | MEDIO |
| `payment-mode-coaching-engine.js` | manager-os | `manager-os/payment-mode-coaching-engine.js` | BAJO |
| `phone-call-engine.js` | legacy | `legacy/phone-call-engine.js` | MEDIO |
| `pipeline-stage-engine.js` | legacy | `legacy/pipeline-stage-engine.js` | MEDIO |
| `policy-activity-engine.js` | policy-operations | `policy-operations/policy-activity-engine.js` | BAJO |
| `policy-ai-insights-engine.js` | policy-operations | `policy-operations/policy-ai-insights-engine.js` | BAJO |
| `policy-ai-parser.js` | policy-operations | `policy-operations/policy-ai-parser.js` | BAJO |
| `policy-auto-approval-engine.js` | policy-operations | `policy-operations/policy-auto-approval-engine.js` | BAJO |
| `policy-auto-save-engine.js` | product-intelligence | `product-intelligence/policy-auto-save-engine.js` | BAJO |
| `policy-batch-processing-engine.js` | policy-operations | `policy-operations/policy-batch-processing-engine.js` | BAJO |
| `policy-client-summary-engine.js` | policy-operations | `policy-operations/policy-client-summary-engine.js` | BAJO |
| `policy-context-engine.js` | policy-operations | `policy-operations/policy-context-engine.js` | BAJO |
| `policy-core-engine.js` | policy-operations | `policy-operations/policy-core-engine.js` | BAJO |
| `policy-detail-alert-engine.js` | policy-operations | `policy-operations/policy-detail-alert-engine.js` | BAJO |
| `policy-detail-engine.js` | policy-operations | `policy-operations/policy-detail-engine.js` | BAJO |
| `policy-detail-view-model.js` | policy-operations | `policy-operations/policy-detail-view-model.js` | BAJO |
| `policy-document-classifier.js` | policy-operations | `policy-operations/policy-document-classifier.js` | BAJO |
| `policy-document-engine.js` | policy-operations | `policy-operations/policy-document-engine.js` | BAJO |
| `policy-duplicate-engine.js` | policy-operations | `policy-operations/policy-duplicate-engine.js` | BAJO |
| `policy-filter-engine.js` | policy-operations | `policy-operations/policy-filter-engine.js` | BAJO |
| `policy-financial-summary-engine.js` | policy-operations | `policy-operations/policy-financial-summary-engine.js` | BAJO |
| `policy-followup-engine.js` | policy-operations | `policy-operations/policy-followup-engine.js` | BAJO |
| `policy-human-review-engine.js` | policy-operations | `policy-operations/policy-human-review-engine.js` | BAJO |
| `policy-import-dashboard-engine.js` | policy-operations | `policy-operations/policy-import-dashboard-engine.js` | BAJO |
| `policy-import-engine.js` | policy-operations | `policy-operations/policy-import-engine.js` | BAJO |
| `policy-import-errors-engine.js` | policy-operations | `policy-operations/policy-import-errors-engine.js` | BAJO |
| `policy-import-metrics-engine.js` | policy-operations | `policy-operations/policy-import-metrics-engine.js` | BAJO |
| `policy-import-queue.js` | policy-operations | `policy-operations/policy-import-queue.js` | BAJO |
| `policy-import-summary.js` | policy-operations | `policy-operations/policy-import-summary.js` | BAJO |
| `policy-indexing-engine.js` | policy-operations | `policy-operations/policy-indexing-engine.js` | BAJO |
| `policy-ingestion-orchestrator.js` | policy-operations | `policy-operations/policy-ingestion-orchestrator.js` | BAJO |
| `policy-last-contact-engine.js` | policy-operations | `policy-operations/policy-last-contact-engine.js` | BAJO |
| `policy-live-state-engine.js` | policy-operations | `policy-operations/policy-live-state-engine.js` | BAJO |
| `policy-metadata-engine.js` | policy-operations | `policy-operations/policy-metadata-engine.js` | BAJO |
| `policy-normalization-engine.js` | policy-operations | `policy-operations/policy-normalization-engine.js` | BAJO |
| `policy-operational-center-engine.js` | policy-operations | `policy-operations/policy-operational-center-engine.js` | BAJO |
| `policy-quick-actions-engine.js` | policy-operations | `policy-operations/policy-quick-actions-engine.js` | BAJO |
| `policy-relationship-score-engine.js` | policy-operations | `policy-operations/policy-relationship-score-engine.js` | BAJO |
| `policy-renewal-status-engine.js` | policy-operations | `policy-operations/policy-renewal-status-engine.js` | BAJO |
| `policy-review-priority-engine.js` | policy-operations | `policy-operations/policy-review-priority-engine.js` | BAJO |
| `policy-review-ui-engine.js` | policy-operations | `policy-operations/policy-review-ui-engine.js` | BAJO |
| `policy-risk-engine.js` | policy-operations | `policy-operations/policy-risk-engine.js` | BAJO |
| `policy-schema-validator-engine.js` | policy-operations | `policy-operations/policy-schema-validator-engine.js` | BAJO |
| `policy-search-engine.js` | policy-operations | `policy-operations/policy-search-engine.js` | BAJO |
| `policy-side-by-side-engine.js` | policy-operations | `policy-operations/policy-side-by-side-engine.js` | BAJO |
| `policy-smart-sort-engine.js` | policy-operations | `policy-operations/policy-smart-sort-engine.js` | BAJO |
| `policy-staging-cache.js` | policy-operations | `policy-operations/policy-staging-cache.js` | BAJO |
| `policy-staging-status-engine.js` | policy-operations | `policy-operations/policy-staging-status-engine.js` | BAJO |
| `policy-status-engine.js` | policy-operations | `policy-operations/policy-status-engine.js` | BAJO |
| `policy-storage-engine.js` | policy-operations | `policy-operations/policy-storage-engine.js` | BAJO |
| `policy-summary-engine.js` | policy-operations | `policy-operations/policy-summary-engine.js` | BAJO |
| `policy-task-engine.js` | policy-operations | `policy-operations/policy-task-engine.js` | BAJO |
| `policy-task-priority-engine.js` | policy-operations | `policy-operations/policy-task-priority-engine.js` | BAJO |
| `policy-timeline-event.factory.js` | policy-operations | `policy-operations/policy-timeline-event.factory.js` | BAJO |
| `policy-timeline-group-engine.js` | policy-operations | `policy-operations/policy-timeline-group-engine.js` | BAJO |
| `policy-timeline-query-engine.js` | policy-operations | `policy-operations/policy-timeline-query-engine.js` | BAJO |
| `policy-timeline-view-model.js` | policy-operations | `policy-operations/policy-timeline-view-model.js` | BAJO |
| `policy-timeline.repository.js` | policy-operations | `policy-operations/policy-timeline.repository.js` | BAJO |
| `policy-timeline.types.js` | policy-operations | `policy-operations/policy-timeline.types.js` | BAJO |
| `policy-validation-engine.js` | policy-operations | `policy-operations/policy-validation-engine.js` | BAJO |
| `policy-workspace-engine.js` | policy-operations | `policy-operations/policy-workspace-engine.js` | BAJO |
| `presentation-input-context-builder.js` | legacy | `legacy/presentation-input-context-builder.js` | MEDIO |
| `primary-risk-engine.js` | compensation | `compensation/primary-risk-engine.js` | BAJO |
| `product-schema-engine.js` | product-intelligence | `product-intelligence/product-schema-engine.js` | BAJO |
| `prospect-next-action-engine.js` | advisor-os | `advisor-os/prospect-next-action-engine.js` | BAJO |
| `prospect-personality.constants.js` | advisor-os | `advisor-os/prospect-personality.constants.js` | BAJO |
| `prospect-pipeline-engine.js` | advisor-os | `advisor-os/prospect-pipeline-engine.js` | BAJO |
| `prospect-profile-engine.js` | advisor-os | `advisor-os/prospect-profile-engine.js` | BAJO |
| `prospect-score-engine.js` | advisor-os | `advisor-os/prospect-score-engine.js` | BAJO |
| `prospect-segment-performance-engine.js` | advisor-os | `advisor-os/prospect-segment-performance-engine.js` | BAJO |
| `prospect-status.constants.js` | advisor-os | `advisor-os/prospect-status.constants.js` | BAJO |
| `prospect.entity.js` | advisor-os | `advisor-os/prospect.entity.js` | BAJO |
| `prospecting-dashboard.viewmodel.js` | advisor-os | `advisor-os/prospecting-dashboard.viewmodel.js` | BAJO |
| `push-notification-engine.js` | platform | `platform/push-notification-engine.js` | ALTO |
| `query-cache.js` | platform | `platform/query-cache.js` | ALTO |
| `question-answer-engine.js` | shared-intelligence | `shared-intelligence/question-answer-engine.js` | BAJO |
| `question-session-engine.js` | legacy | `legacy/question-session-engine.js` | MEDIO |
| `quick-action-executor-engine.js` | legacy | `legacy/quick-action-executor-engine.js` | MEDIO |
| `quick-actions-engine.js` | legacy | `legacy/quick-actions-engine.js` | MEDIO |
| `quotation-extraction-result.entity.js` | product-intelligence | `product-intelligence/quotation-extraction-result.entity.js` | BAJO |
| `quotation-input.entity.js` | product-intelligence | `product-intelligence/quotation-input.entity.js` | BAJO |
| `ranking-engine.js` | legacy | `legacy/ranking-engine.js` | MEDIO |
| `reactivation-strategy-engine.js` | legacy | `legacy/reactivation-strategy-engine.js` | MEDIO |
| `realtime-task-engine.js` | policy-operations | `policy-operations/realtime-task-engine.js` | BAJO |
| `referral-ai-followup.js` | advisor-os | `advisor-os/referral-ai-followup.js` | BAJO |
| `referral-card-ui.js` | advisor-os | `advisor-os/referral-card-ui.js` | BAJO |
| `referral-color-engine.js` | advisor-os | `advisor-os/referral-color-engine.js` | BAJO |
| `referral-followup-engine.js` | advisor-os | `advisor-os/referral-followup-engine.js` | BAJO |
| `referral-priority-engine.js` | advisor-os | `advisor-os/referral-priority-engine.js` | BAJO |
| `referral-prompt-builder.js` | advisor-os | `advisor-os/referral-prompt-builder.js` | BAJO |
| `referral-score-engine.js` | advisor-os | `advisor-os/referral-score-engine.js` | BAJO |
| `referral-smart-actions.js` | advisor-os | `advisor-os/referral-smart-actions.js` | BAJO |
| `referral-source.constants.js` | advisor-os | `advisor-os/referral-source.constants.js` | BAJO |
| `referral-temperature-engine.js` | advisor-os | `advisor-os/referral-temperature-engine.js` | BAJO |
| `referral-timeline-engine.js` | advisor-os | `advisor-os/referral-timeline-engine.js` | BAJO |
| `referrals-board-engine.js` | advisor-os | `advisor-os/referrals-board-engine.js` | BAJO |
| `referrals-engine.js` | advisor-os | `advisor-os/referrals-engine.js` | BAJO |
| `relationship-memory-engine.js` | advisor-os | `advisor-os/relationship-memory-engine.js` | BAJO |
| `render-engine.js` | platform | `platform/render-engine.js` | ALTO |
| `renewal-intelligence-engine.js` | policy-operations | `policy-operations/renewal-intelligence-engine.js` | BAJO |
| `retry-runtime.js` | platform | `platform/retry-runtime.js` | ALTO |
| `revenue-forecast-engine.js` | legacy | `legacy/revenue-forecast-engine.js` | MEDIO |
| `revenue-optimization-engine.js` | legacy | `legacy/revenue-optimization-engine.js` | MEDIO |
| `risk-story-context-engine.js` | legacy | `legacy/risk-story-context-engine.js` | MEDIO |
| `sales-coach-engine.js` | advisor-os | `advisor-os/sales-coach-engine.js` | BAJO |
| `sales-context-engine.js` | advisor-os | `advisor-os/sales-context-engine.js` | BAJO |
| `sales-dna-evolution-engine.js` | advisor-os | `advisor-os/sales-dna-evolution-engine.js` | BAJO |
| `sales-dna-insight-engine.js` | advisor-os | `advisor-os/sales-dna-insight-engine.js` | BAJO |
| `sales-dna-learning-event.js` | advisor-os | `advisor-os/sales-dna-learning-event.js` | BAJO |
| `sales-dna-match-engine.js` | advisor-os | `advisor-os/sales-dna-match-engine.js` | BAJO |
| `sales-dna-profile-engine.js` | advisor-os | `advisor-os/sales-dna-profile-engine.js` | BAJO |
| `sales-dna-recommendation-engine.js` | advisor-os | `advisor-os/sales-dna-recommendation-engine.js` | BAJO |
| `sales-dna-stage-engine.js` | advisor-os | `advisor-os/sales-dna-stage-engine.js` | BAJO |
| `sales-dna.constants.js` | advisor-os | `advisor-os/sales-dna.constants.js` | BAJO |
| `sales-learning-event.entity.js` | advisor-os | `advisor-os/sales-learning-event.entity.js` | BAJO |
| `sales-script-types.constants.js` | advisor-os | `advisor-os/sales-script-types.constants.js` | BAJO |
| `sales-tone.constants.js` | advisor-os | `advisor-os/sales-tone.constants.js` | BAJO |
| `schema-field-engine.js` | shared-intelligence | `shared-intelligence/schema-field-engine.js` | BAJO |
| `search-index-engine.js` | platform | `platform/search-index-engine.js` | ALTO |
| `search-quick-actions-engine.js` | platform | `platform/search-quick-actions-engine.js` | ALTO |
| `search-ranking-engine.js` | platform | `platform/search-ranking-engine.js` | ALTO |
| `secure-storage.js` | platform | `platform/secure-storage.js` | ALTO |
| `seen-but-no-reply-engine.js` | legacy | `legacy/seen-but-no-reply-engine.js` | MEDIO |
| `segu-beca-ocr-intake-report.js` | product-intelligence | `product-intelligence/segu-beca-ocr-intake-report.js` | BAJO |
| `semantic-navigation-engine.js` | legacy | `legacy/semantic-navigation-engine.js` | MEDIO |
| `service-worker.js` | platform | `service-worker.js` | NO_MOVER |
| `smart-agenda-engine.js` | legacy | `legacy/smart-agenda-engine.js` | MEDIO |
| `smart-followup-engine.js` | advisor-os | `advisor-os/smart-followup-engine.js` | BAJO |
| `smart-followup-message-engine.js` | advisor-os | `advisor-os/smart-followup-message-engine.js` | BAJO |
| `smart-notification-engine.js` | platform | `platform/smart-notification-engine.js` | ALTO |
| `smart-outreach-engine.js` | advisor-os | `advisor-os/smart-outreach-engine.js` | BAJO |
| `smart-priority-engine.js` | legacy | `legacy/smart-priority-engine.js` | MEDIO |
| `smart-referrals-engine.js` | advisor-os | `advisor-os/smart-referrals-engine.js` | BAJO |
| `smnyl-ai-coach-engine.js` | compensation | `compensation/smnyl-ai-coach-engine.js` | BAJO |
| `smnyl-ai-presence-engine.js` | compensation | `compensation/smnyl-ai-presence-engine.js` | BAJO |
| `smnyl-comisiones-gmm.js` | compensation | `compensation/smnyl-comisiones-gmm.js` | BAJO |
| `smnyl-comisiones-vida.js` | compensation | `compensation/smnyl-comisiones-vida.js` | BAJO |
| `smnyl-command-center-engine.js` | compensation | `compensation/smnyl-command-center-engine.js` | BAJO |
| `smnyl-cross-sell-engine.js` | compensation | `compensation/smnyl-cross-sell-engine.js` | BAJO |
| `smnyl-decision-engine.js` | compensation | `compensation/smnyl-decision-engine.js` | BAJO |
| `smnyl-goals-engine.js` | compensation | `compensation/smnyl-goals-engine.js` | BAJO |
| `smnyl-insights-engine.js` | compensation | `compensation/smnyl-insights-engine.js` | BAJO |
| `smnyl-leaderboard-engine.js` | compensation | `compensation/smnyl-leaderboard-engine.js` | BAJO |
| `smnyl-neural-glow-engine.js` | compensation | `compensation/smnyl-neural-glow-engine.js` | BAJO |
| `smnyl-opportunity-engine.js` | compensation | `compensation/smnyl-opportunity-engine.js` | BAJO |
| `smnyl-performance-engine.js` | compensation | `compensation/smnyl-performance-engine.js` | BAJO |
| `smnyl-pipeline-engine.js` | compensation | `compensation/smnyl-pipeline-engine.js` | BAJO |
| `smnyl-productividad-engine.js` | compensation | `compensation/smnyl-productividad-engine.js` | BAJO |
| `smnyl-renovaciones-engine.js` | compensation | `compensation/smnyl-renovaciones-engine.js` | BAJO |
| `smnyl-risk-engine.js` | compensation | `compensation/smnyl-risk-engine.js` | BAJO |
| `smnyl-streak-engine.js` | compensation | `compensation/smnyl-streak-engine.js` | BAJO |
| `staging-cleanup-engine.js` | policy-operations | `policy-operations/staging-cleanup-engine.js` | BAJO |
| `staging-review-engine.js` | policy-operations | `policy-operations/staging-review-engine.js` | BAJO |
| `supabase-runtime.js` | platform | `platform/supabase-runtime.js` | ALTO |
| `sw-cache-config.js` | platform | `platform/sw-cache-config.js` | ALTO |
| `sync-queue-runtime.js` | platform | `platform/sync-queue-runtime.js` | ALTO |
| `task-engine.js` | policy-operations | `policy-operations/task-engine.js` | BAJO |
| `task-feed-engine.js` | policy-operations | `policy-operations/task-feed-engine.js` | BAJO |
| `task-priority-engine.js` | policy-operations | `policy-operations/task-priority-engine.js` | BAJO |
| `task-quick-action-engine.js` | policy-operations | `policy-operations/task-quick-action-engine.js` | BAJO |
| `team-activity-engine.js` | manager-os | `manager-os/team-activity-engine.js` | BAJO |
| `team-dashboard-engine.js` | manager-os | `manager-os/team-dashboard-engine.js` | BAJO |
| `team-momentum-engine.js` | manager-os | `manager-os/team-momentum-engine.js` | BAJO |
| `team-structure-engine.js` | manager-os | `manager-os/team-structure-engine.js` | BAJO |
| `tone-performance-engine.js` | legacy | `legacy/tone-performance-engine.js` | MEDIO |
| `universal-command-engine.js` | platform | `platform/universal-command-engine.js` | ALTO |
| `universal-filters-engine.js` | legacy | `legacy/universal-filters-engine.js` | MEDIO |
| `universal-search-engine.js` | platform | `platform/universal-search-engine.js` | ALTO |
| `vida-mujer-client-explanation-report.js` | product-intelligence | `product-intelligence/vida-mujer-client-explanation-report.js` | BAJO |
| `vida-mujer-pdf-intake-report.js` | product-intelligence | `product-intelligence/vida-mujer-pdf-intake-report.js` | BAJO |
| `vida-mujer-rule-consistency-report.js` | product-intelligence | `product-intelligence/vida-mujer-rule-consistency-report.js` | BAJO |
| `vida-mujer-status.js` | product-intelligence | `product-intelligence/vida-mujer-status.js` | BAJO |
| `virtual-list-engine.js` | legacy | `legacy/virtual-list-engine.js` | MEDIO |
| `virtual-list.js` | legacy | `legacy/virtual-list.js` | MEDIO |
| `visibility-runtime.js` | platform | `platform/visibility-runtime.js` | ALTO |
| `warm-market-segmentation-engine.js` | legacy | `legacy/warm-market-segmentation-engine.js` | MEDIO |
| `whatsapp-action-engine.js` | legacy | `legacy/whatsapp-action-engine.js` | MEDIO |
| `whatsapp-link-engine.js` | legacy | `legacy/whatsapp-link-engine.js` | MEDIO |

## 12. Duplicados detectados

### Por nombre de archivo

| Nombre | Archivos |
| --- | --- |
| `forge_constitution_amendment_v1.1.md` | `FORGE_CONSTITUTION_AMENDMENT_v1.1.md`<br>`docs/architecture/constitution/FORGE_CONSTITUTION_AMENDMENT_v1.1.md` |
| `forge_phase_transition_foundation_to_intelligence.md` | `FORGE_PHASE_TRANSITION_FOUNDATION_TO_INTELLIGENCE.md`<br>`docs/05-phase-transitions/FORGE_PHASE_TRANSITION_FOUNDATION_TO_INTELLIGENCE.md` |
| `forge_ratification_and_foundation_closure.md` | `FORGE_RATIFICATION_AND_FOUNDATION_CLOSURE.md`<br>`docs/05-foundation/FORGE_RATIFICATION_AND_FOUNDATION_CLOSURE.md` |
| `forge_shared_commercial_model_evidence_provenance_foundation.md` | `FORGE_SHARED_COMMERCIAL_MODEL_EVIDENCE_PROVENANCE_FOUNDATION.md`<br>`docs/05-shared-commercial-model/FORGE_SHARED_COMMERCIAL_MODEL_EVIDENCE_PROVENANCE_FOUNDATION.md` |
| `forge_shared_commercial_model_identity_attribution_hardening.md` | `FORGE_SHARED_COMMERCIAL_MODEL_IDENTITY_ATTRIBUTION_HARDENING.md`<br>`docs/05-shared-commercial-model/FORGE_SHARED_COMMERCIAL_MODEL_IDENTITY_ATTRIBUTION_HARDENING.md` |
| `forge_shared_commercial_model_periods_operational_clocks_hardening.md` | `FORGE_SHARED_COMMERCIAL_MODEL_PERIODS_OPERATIONAL_CLOCKS_HARDENING.md`<br>`docs/05-shared-commercial-model/FORGE_SHARED_COMMERCIAL_MODEL_PERIODS_OPERATIONAL_CLOCKS_HARDENING.md` |
| `paq-04-metrics-ownership-finalization.md` | `PAQ-04-METRICS-OWNERSHIP-FINALIZATION.md`<br>`docs/05-shared-commercial-model/PAQ-04-METRICS-OWNERSHIP-FINALIZATION.md` |
| `paq-05-rule-snapshot-hardening.md` | `PAQ-05-RULE-SNAPSHOT-HARDENING.md`<br>`docs/05-shared-commercial-model/PAQ-05-RULE-SNAPSHOT-HARDENING.md` |
| `paq-06-commercial-events-taxonomy.md` | `PAQ-06-COMMERCIAL-EVENTS-TAXONOMY.md`<br>`docs/05-shared-commercial-model/PAQ-06-COMMERCIAL-EVENTS-TAXONOMY.md` |
| `paq-07-foundation-lock-review.md` | `PAQ-07-FOUNDATION-LOCK-REVIEW.md`<br>`docs/05-foundation/PAQ-07-FOUNDATION-LOCK-REVIEW.md` |
| `paq-08-foundation-lock-final-review.md` | `PAQ-08-FOUNDATION-LOCK-FINAL-REVIEW.md`<br>`docs/05-foundation/PAQ-08-FOUNDATION-LOCK-FINAL-REVIEW.md` |

### Por contenido exacto

| SHA1 | Archivos |
| --- | --- |
| `fd789a361018` | `comisiones-rules-gmm.js`<br>`smnyl-comisiones-gmm.js` |
| `da39a3ee5e6b` | `core_domain-events.js`<br>`core_event-bus.js`<br>`quotation-input.entity.js` |

## 13. Tabla completa archivo actual a destino

| Archivo actual | Dominio actual/propuesto | Carpeta destino | Riesgo | Imports afectados | Batch recomendado |
| --- | --- | --- | --- | --- | --- |
| `AGENTS.md` | docs/root-governance | `AGENTS.md` | NO_MOVER | - | 0 - No mover |
| `ALFA_MEDICAL_ACCIDENT_RULES.md` | product-intelligence | `product-intelligence/ALFA_MEDICAL_ACCIDENT_RULES.md` | BAJO | - | 5 - Product intelligence |
| `ALFA_MEDICAL_ADVISOR_RISK_AREAS.md` | product-intelligence | `product-intelligence/ALFA_MEDICAL_ADVISOR_RISK_AREAS.md` | BAJO | - | 5 - Product intelligence |
| `ALFA_MEDICAL_AUTHORIZATION_RULES.md` | product-intelligence | `product-intelligence/ALFA_MEDICAL_AUTHORIZATION_RULES.md` | BAJO | - | 5 - Product intelligence |
| `ALFA_MEDICAL_CLIENT_MISUNDERSTANDING_DISCOVERY.md` | product-intelligence | `product-intelligence/ALFA_MEDICAL_CLIENT_MISUNDERSTANDING_DISCOVERY.md` | BAJO | - | 5 - Product intelligence |
| `ALFA_MEDICAL_CONFIDENCE_BOUNDARIES.md` | product-intelligence | `product-intelligence/ALFA_MEDICAL_CONFIDENCE_BOUNDARIES.md` | BAJO | - | 5 - Product intelligence |
| `ALFA_MEDICAL_COVERAGE_MAP.md` | product-intelligence | `product-intelligence/ALFA_MEDICAL_COVERAGE_MAP.md` | BAJO | - | 5 - Product intelligence |
| `ALFA_MEDICAL_COVERAGE_RULES.md` | product-intelligence | `product-intelligence/ALFA_MEDICAL_COVERAGE_RULES.md` | BAJO | - | 5 - Product intelligence |
| `ALFA_MEDICAL_DECISION_CLARITY_TRANSLATIONS.md` | product-intelligence | `product-intelligence/ALFA_MEDICAL_DECISION_CLARITY_TRANSLATIONS.md` | BAJO | - | 5 - Product intelligence |
| `ALFA_MEDICAL_DECISION_FLOW_ARCHITECTURE.md` | product-intelligence | `product-intelligence/ALFA_MEDICAL_DECISION_FLOW_ARCHITECTURE.md` | BAJO | - | 5 - Product intelligence |
| `ALFA_MEDICAL_EVENT_FAMILY_ARCHITECTURE.md` | product-intelligence | `product-intelligence/ALFA_MEDICAL_EVENT_FAMILY_ARCHITECTURE.md` | BAJO | - | 5 - Product intelligence |
| `ALFA_MEDICAL_EVIDENCE_REQUIREMENTS.md` | product-intelligence | `product-intelligence/ALFA_MEDICAL_EVIDENCE_REQUIREMENTS.md` | BAJO | - | 5 - Product intelligence |
| `ALFA_MEDICAL_EXCLUSION_INTELLIGENCE.md` | product-intelligence | `product-intelligence/ALFA_MEDICAL_EXCLUSION_INTELLIGENCE.md` | BAJO | - | 5 - Product intelligence |
| `ALFA_MEDICAL_FINANCIAL_RESPONSIBILITY_DISCOVERY.md` | product-intelligence | `product-intelligence/ALFA_MEDICAL_FINANCIAL_RESPONSIBILITY_DISCOVERY.md` | BAJO | - | 5 - Product intelligence |
| `ALFA_MEDICAL_FINANCIAL_RULES.md` | product-intelligence | `product-intelligence/ALFA_MEDICAL_FINANCIAL_RULES.md` | BAJO | - | 5 - Product intelligence |
| `ALFA_MEDICAL_FOREIGN_COVERAGE_RULES.md` | product-intelligence | `product-intelligence/ALFA_MEDICAL_FOREIGN_COVERAGE_RULES.md` | BAJO | - | 5 - Product intelligence |
| `ALFA_MEDICAL_FORGE_COVERAGE_INTELLIGENCE_FOUNDATION.md` | product-intelligence | `product-intelligence/ALFA_MEDICAL_FORGE_COVERAGE_INTELLIGENCE_FOUNDATION.md` | BAJO | - | 5 - Product intelligence |
| `ALFA_MEDICAL_FORGE_GAP_INTELLIGENCE_FOUNDATION.md` | product-intelligence | `product-intelligence/ALFA_MEDICAL_FORGE_GAP_INTELLIGENCE_FOUNDATION.md` | BAJO | - | 5 - Product intelligence |
| `ALFA_MEDICAL_HUMAN_REVIEW_GATE_ARCHITECTURE.md` | product-intelligence | `product-intelligence/ALFA_MEDICAL_HUMAN_REVIEW_GATE_ARCHITECTURE.md` | BAJO | - | 5 - Product intelligence |
| `ALFA_MEDICAL_HUMAN_REVIEW_RULES.md` | product-intelligence | `product-intelligence/ALFA_MEDICAL_HUMAN_REVIEW_RULES.md` | BAJO | - | 5 - Product intelligence |
| `ALFA_MEDICAL_INPUT_FREQUENCY_ANALYSIS.md` | product-intelligence | `product-intelligence/ALFA_MEDICAL_INPUT_FREQUENCY_ANALYSIS.md` | BAJO | - | 5 - Product intelligence |
| `ALFA_MEDICAL_INPUT_INVENTORY.md` | product-intelligence | `product-intelligence/ALFA_MEDICAL_INPUT_INVENTORY.md` | BAJO | - | 5 - Product intelligence |
| `ALFA_MEDICAL_MATERNITY_RULES.md` | product-intelligence | `product-intelligence/ALFA_MEDICAL_MATERNITY_RULES.md` | BAJO | - | 5 - Product intelligence |
| `ALFA_MEDICAL_MINIMUM_DATASETS.md` | product-intelligence | `product-intelligence/ALFA_MEDICAL_MINIMUM_DATASETS.md` | BAJO | - | 5 - Product intelligence |
| `ALFA_MEDICAL_PREEXISTENCE_RULES.md` | product-intelligence | `product-intelligence/ALFA_MEDICAL_PREEXISTENCE_RULES.md` | BAJO | - | 5 - Product intelligence |
| `ALFA_MEDICAL_PRODUCT_INTELLIGENCE_DISCOVERY.md` | product-intelligence | `product-intelligence/ALFA_MEDICAL_PRODUCT_INTELLIGENCE_DISCOVERY.md` | BAJO | - | 5 - Product intelligence |
| `ALFA_MEDICAL_QUESTION_STRATEGY.md` | product-intelligence | `product-intelligence/ALFA_MEDICAL_QUESTION_STRATEGY.md` | BAJO | - | 5 - Product intelligence |
| `ALFA_MEDICAL_REAL_LIFE_EVENT_LIBRARY.md` | product-intelligence | `product-intelligence/ALFA_MEDICAL_REAL_LIFE_EVENT_LIBRARY.md` | BAJO | - | 5 - Product intelligence |
| `ALFA_MEDICAL_RULE_DEPENDENCY_MAP.md` | product-intelligence | `product-intelligence/ALFA_MEDICAL_RULE_DEPENDENCY_MAP.md` | BAJO | - | 5 - Product intelligence |
| `ALFA_MEDICAL_RULE_INVENTORY.md` | product-intelligence | `product-intelligence/ALFA_MEDICAL_RULE_INVENTORY.md` | BAJO | - | 5 - Product intelligence |
| `ALFA_MEDICAL_SHARED_RULE_LIBRARY_CANDIDATES.md` | product-intelligence | `product-intelligence/ALFA_MEDICAL_SHARED_RULE_LIBRARY_CANDIDATES.md` | BAJO | - | 5 - Product intelligence |
| `ALFA_MEDICAL_WAITING_PERIOD_RULES.md` | product-intelligence | `product-intelligence/ALFA_MEDICAL_WAITING_PERIOD_RULES.md` | BAJO | - | 5 - Product intelligence |
| `COMPENSATION_DOMAIN_MODEL.md` | compensation | `compensation/COMPENSATION_DOMAIN_MODEL.md` | BAJO | - | 9 - Compensation |
| `DIAGRAMA_RAZONAMIENTO_EDWIN_IS15.md` | docs | `docs/archive/DIAGRAMA_RAZONAMIENTO_EDWIN_IS15.md` | BAJO | - | 1 - Docs y arquitectura |
| `FIXTURE_CATALOG.md` | shared-intelligence | `shared-intelligence/FIXTURE_CATALOG.md` | BAJO | - | 3 - Shared intelligence |
| `FORGE_ACTION_SAFETY_COMPONENTS_DISCOVERY.md` | advisor-os | `advisor-os/FORGE_ACTION_SAFETY_COMPONENTS_DISCOVERY.md` | BAJO | - | 7 - Advisor OS |
| `FORGE_ACTION_SAFETY_DESTROYERS_DISCOVERY.md` | advisor-os | `advisor-os/FORGE_ACTION_SAFETY_DESTROYERS_DISCOVERY.md` | BAJO | - | 7 - Advisor OS |
| `FORGE_ACTION_SAFETY_DISCOVERY.md` | advisor-os | `advisor-os/FORGE_ACTION_SAFETY_DISCOVERY.md` | BAJO | - | 7 - Advisor OS |
| `FORGE_ACTION_SAFETY_MODEL_CANDIDATE.md` | manager-os | `manager-os/FORGE_ACTION_SAFETY_MODEL_CANDIDATE.md` | BAJO | - | 8 - Manager OS |
| `FORGE_ACTION_SAFETY_SIGNALS_DISCOVERY.md` | advisor-os | `advisor-os/FORGE_ACTION_SAFETY_SIGNALS_DISCOVERY.md` | BAJO | - | 7 - Advisor OS |
| `FORGE_ACTION_SAFETY_VS_FRICTION_DISCOVERY.md` | advisor-os | `advisor-os/FORGE_ACTION_SAFETY_VS_FRICTION_DISCOVERY.md` | BAJO | - | 7 - Advisor OS |
| `FORGE_ACTION_SAFETY_VS_READINESS_DISCOVERY.md` | manager-os | `manager-os/FORGE_ACTION_SAFETY_VS_READINESS_DISCOVERY.md` | BAJO | - | 8 - Manager OS |
| `FORGE_ADVISOR_EXPERIENCE_ARCHITECTURE.md` | advisor-os | `advisor-os/FORGE_ADVISOR_EXPERIENCE_ARCHITECTURE.md` | BAJO | - | 7 - Advisor OS |
| `FORGE_ADVISOR_FRICTION_DISCOVERY.md` | advisor-os | `advisor-os/FORGE_ADVISOR_FRICTION_DISCOVERY.md` | BAJO | - | 7 - Advisor OS |
| `FORGE_ADVISOR_INSIGHTS.md` | advisor-os | `advisor-os/FORGE_ADVISOR_INSIGHTS.md` | BAJO | - | 7 - Advisor OS |
| `FORGE_ARCHITECTURAL_CONSTITUTION_v3.md` | docs | `docs/archive/FORGE_ARCHITECTURAL_CONSTITUTION_v3.md` | BAJO | - | 1 - Docs y arquitectura |
| `FORGE_ARTICLE_0_DISCOVERY.md` | advisor-os | `advisor-os/FORGE_ARTICLE_0_DISCOVERY.md` | BAJO | - | 7 - Advisor OS |
| `FORGE_ARTICLE_0_POSITION_IN_CONSTITUTION.md` | docs | `docs/archive/FORGE_ARTICLE_0_POSITION_IN_CONSTITUTION.md` | BAJO | - | 1 - Docs y arquitectura |
| `FORGE_ARTICLE_0_SUCCESS_MEASURES.md` | docs | `docs/archive/FORGE_ARTICLE_0_SUCCESS_MEASURES.md` | BAJO | - | 1 - Docs y arquitectura |
| `FORGE_BENVENU_EXPERIENCE_LOCK.md` | docs | `docs/archive/FORGE_BENVENU_EXPERIENCE_LOCK.md` | BAJO | - | 1 - Docs y arquitectura |
| `FORGE_BENVENU_LEOPARD_EXPERIENCE_SPEC.md` | docs | `docs/archive/FORGE_BENVENU_LEOPARD_EXPERIENCE_SPEC.md` | BAJO | - | 1 - Docs y arquitectura |
| `FORGE_CAREER_LIFECYCLE_MODEL_DISCOVERY.md` | manager-os | `manager-os/FORGE_CAREER_LIFECYCLE_MODEL_DISCOVERY.md` | BAJO | - | 8 - Manager OS |
| `FORGE_CAREER_OPERATING_SYSTEM_DISCOVERY.md` | manager-os | `manager-os/FORGE_CAREER_OPERATING_SYSTEM_DISCOVERY.md` | BAJO | - | 8 - Manager OS |
| `FORGE_CLIENT_DECISION_MODEL_DISCOVERY.md` | advisor-os | `advisor-os/FORGE_CLIENT_DECISION_MODEL_DISCOVERY.md` | BAJO | - | 7 - Advisor OS |
| `FORGE_CLIENT_PRESENTATION_SIMULATION.md` | docs | `docs/archive/FORGE_CLIENT_PRESENTATION_SIMULATION.md` | BAJO | - | 1 - Docs y arquitectura |
| `FORGE_CODEBASE_CARTOGRAPHY_PHASE_1.md` | docs | `docs/archive/FORGE_CODEBASE_CARTOGRAPHY_PHASE_1.md` | BAJO | - | 1 - Docs y arquitectura |
| `FORGE_CODEBASE_DOMAIN_ASSIGNMENT_CONCISE.md` | docs | `docs/archive/FORGE_CODEBASE_DOMAIN_ASSIGNMENT_CONCISE.md` | BAJO | - | 1 - Docs y arquitectura |
| `FORGE_CODEBASE_DOMAIN_ASSIGNMENT_SUMMARY.md` | docs | `docs/archive/FORGE_CODEBASE_DOMAIN_ASSIGNMENT_SUMMARY.md` | BAJO | - | 1 - Docs y arquitectura |
| `FORGE_COMPENSATION_INTELLIGENCE_ARCHITECTURE.md` | compensation | `compensation/FORGE_COMPENSATION_INTELLIGENCE_ARCHITECTURE.md` | BAJO | - | 9 - Compensation |
| `FORGE_CONSTITUTION_AMENDMENT_v1.1.md` | docs | `docs/archive/FORGE_CONSTITUTION_AMENDMENT_v1.1.md` | BAJO | - | 1 - Docs y arquitectura |
| `FORGE_CONSTITUTION_CANDIDATES.md` | manager-os | `manager-os/FORGE_CONSTITUTION_CANDIDATES.md` | BAJO | - | 8 - Manager OS |
| `FORGE_CONSTITUTION_LOCK_PREPARATION.md` | docs | `docs/archive/FORGE_CONSTITUTION_LOCK_PREPARATION.md` | BAJO | - | 1 - Docs y arquitectura |
| `FORGE_CONSTITUTION_V3.md` | docs | `docs/archive/FORGE_CONSTITUTION_V3.md` | BAJO | - | 1 - Docs y arquitectura |
| `FORGE_CORPORATE_VS_FIELD_INTELLIGENCE_COMPARISON.md` | docs | `docs/archive/FORGE_CORPORATE_VS_FIELD_INTELLIGENCE_COMPARISON.md` | BAJO | - | 1 - Docs y arquitectura |
| `FORGE_DECISION_VS_TRANSACTION_DISCOVERY.md` | advisor-os | `advisor-os/FORGE_DECISION_VS_TRANSACTION_DISCOVERY.md` | BAJO | - | 7 - Advisor OS |
| `FORGE_DEPENDENCY_SIGNAL_DISCOVERY.md` | advisor-os | `advisor-os/FORGE_DEPENDENCY_SIGNAL_DISCOVERY.md` | BAJO | - | 7 - Advisor OS |
| `FORGE_DISCOVERY_CONSOLIDATION_REPORT.md` | advisor-os | `advisor-os/FORGE_DISCOVERY_CONSOLIDATION_REPORT.md` | BAJO | - | 7 - Advisor OS |
| `FORGE_DOCS_CHECKPOINT_PAQ_ORDER_REPORT.md` | docs | `docs/archive/FORGE_DOCS_CHECKPOINT_PAQ_ORDER_REPORT.md` | BAJO | - | 1 - Docs y arquitectura |
| `FORGE_DUAL_INTELLIGENCE_OPERATIONAL_BLUEPRINT.md` | policy-operations | `policy-operations/FORGE_DUAL_INTELLIGENCE_OPERATIONAL_BLUEPRINT.md` | BAJO | - | 6 - Policy operations |
| `FORGE_ETHICAL_BOUNDARY_REVIEW.md` | docs | `docs/archive/FORGE_ETHICAL_BOUNDARY_REVIEW.md` | BAJO | - | 1 - Docs y arquitectura |
| `FORGE_FALSE_READINESS_DISCOVERY.md` | manager-os | `manager-os/FORGE_FALSE_READINESS_DISCOVERY.md` | BAJO | - | 8 - Manager OS |
| `FORGE_FOUNDATION_LOCK.md` | docs | `docs/archive/FORGE_FOUNDATION_LOCK.md` | BAJO | - | 1 - Docs y arquitectura |
| `FORGE_FRICTION_INTELLIGENCE_DISCOVERY.md` | advisor-os | `advisor-os/FORGE_FRICTION_INTELLIGENCE_DISCOVERY.md` | BAJO | - | 7 - Advisor OS |
| `FORGE_FRICTION_PATTERN_LIBRARY.md` | docs | `docs/archive/FORGE_FRICTION_PATTERN_LIBRARY.md` | BAJO | - | 1 - Docs y arquitectura |
| `FORGE_GLOBAL_UDI_PROJECTION_PRODUCT_INTERPRETATION.md` | product-intelligence | `product-intelligence/FORGE_GLOBAL_UDI_PROJECTION_PRODUCT_INTERPRETATION.md` | BAJO | - | 5 - Product intelligence |
| `FORGE_GLOBAL_UDI_PROJECTION_REASONING_DIAGRAM.md` | shared-intelligence | `shared-intelligence/FORGE_GLOBAL_UDI_PROJECTION_REASONING_DIAGRAM.md` | BAJO | - | 3 - Shared intelligence |
| `FORGE_GMM_ASSESSMENT_LANGUAGE_ARCHITECTURE.md` | product-intelligence | `product-intelligence/FORGE_GMM_ASSESSMENT_LANGUAGE_ARCHITECTURE.md` | BAJO | - | 5 - Product intelligence |
| `FORGE_GMM_COMPONENT_CATALOG.md` | product-intelligence | `product-intelligence/FORGE_GMM_COMPONENT_CATALOG.md` | BAJO | - | 5 - Product intelligence |
| `FORGE_GMM_COMPONENT_RESPONSIBILITIES.md` | product-intelligence | `product-intelligence/FORGE_GMM_COMPONENT_RESPONSIBILITIES.md` | BAJO | - | 5 - Product intelligence |
| `FORGE_GMM_COVERAGE_INTELLIGENCE_BLUEPRINT.md` | product-intelligence | `product-intelligence/FORGE_GMM_COVERAGE_INTELLIGENCE_BLUEPRINT.md` | BAJO | - | 5 - Product intelligence |
| `FORGE_GMM_CURRENT_STORY_ANALYSIS.md` | product-intelligence | `product-intelligence/FORGE_GMM_CURRENT_STORY_ANALYSIS.md` | BAJO | - | 5 - Product intelligence |
| `FORGE_GMM_DOCUMENT_PRIORITY_MODEL.md` | product-intelligence | `product-intelligence/FORGE_GMM_DOCUMENT_PRIORITY_MODEL.md` | BAJO | - | 5 - Product intelligence |
| `FORGE_GMM_EMOTION_VS_EDUCATION_ANALYSIS.md` | product-intelligence | `product-intelligence/FORGE_GMM_EMOTION_VS_EDUCATION_ANALYSIS.md` | BAJO | - | 5 - Product intelligence |
| `FORGE_GMM_EVENT_EVIDENCE_PACKETS.md` | product-intelligence | `product-intelligence/FORGE_GMM_EVENT_EVIDENCE_PACKETS.md` | BAJO | - | 5 - Product intelligence |
| `FORGE_GMM_EVENT_ROUTING_ARCHITECTURE.md` | product-intelligence | `product-intelligence/FORGE_GMM_EVENT_ROUTING_ARCHITECTURE.md` | BAJO | - | 5 - Product intelligence |
| `FORGE_GMM_EVIDENCE_ARCHITECTURE.md` | product-intelligence | `product-intelligence/FORGE_GMM_EVIDENCE_ARCHITECTURE.md` | BAJO | - | 5 - Product intelligence |
| `FORGE_GMM_EVIDENCE_COMPLETENESS_MODEL.md` | product-intelligence | `product-intelligence/FORGE_GMM_EVIDENCE_COMPLETENESS_MODEL.md` | BAJO | - | 5 - Product intelligence |
| `FORGE_GMM_EVIDENCE_GAP_DETECTION.md` | product-intelligence | `product-intelligence/FORGE_GMM_EVIDENCE_GAP_DETECTION.md` | BAJO | - | 5 - Product intelligence |
| `FORGE_GMM_EVIDENCE_PACKET_STANDARD.md` | product-intelligence | `product-intelligence/FORGE_GMM_EVIDENCE_PACKET_STANDARD.md` | BAJO | - | 5 - Product intelligence |
| `FORGE_GMM_EVIDENCE_PACKET_VALIDATION.md` | product-intelligence | `product-intelligence/FORGE_GMM_EVIDENCE_PACKET_VALIDATION.md` | BAJO | - | 5 - Product intelligence |
| `FORGE_GMM_HUMAN_REVIEW_ARCHITECTURE.md` | product-intelligence | `product-intelligence/FORGE_GMM_HUMAN_REVIEW_ARCHITECTURE.md` | BAJO | - | 5 - Product intelligence |
| `FORGE_GMM_HUMAN_REVIEW_EVIDENCE.md` | product-intelligence | `product-intelligence/FORGE_GMM_HUMAN_REVIEW_EVIDENCE.md` | BAJO | - | 5 - Product intelligence |
| `FORGE_GMM_IMPLEMENTATION_READINESS_REPORT.md` | product-intelligence | `product-intelligence/FORGE_GMM_IMPLEMENTATION_READINESS_REPORT.md` | BAJO | - | 5 - Product intelligence |
| `FORGE_GMM_NEXT_EVIDENCE_STRATEGY.md` | product-intelligence | `product-intelligence/FORGE_GMM_NEXT_EVIDENCE_STRATEGY.md` | BAJO | - | 5 - Product intelligence |
| `FORGE_GMM_POST_PACKET_IMPLEMENTATION_READINESS.md` | product-intelligence | `product-intelligence/FORGE_GMM_POST_PACKET_IMPLEMENTATION_READINESS.md` | BAJO | - | 5 - Product intelligence |
| `FORGE_GMM_PRODUCT_FAMILY_ARCHITECTURE.md` | product-intelligence | `product-intelligence/FORGE_GMM_PRODUCT_FAMILY_ARCHITECTURE.md` | BAJO | - | 5 - Product intelligence |
| `FORGE_GMM_PRODUCT_ROUTING_ARCHITECTURE.md` | product-intelligence | `product-intelligence/FORGE_GMM_PRODUCT_ROUTING_ARCHITECTURE.md` | BAJO | - | 5 - Product intelligence |
| `FORGE_GMM_PRODUCT_SOURCE_REGISTRY.md` | product-intelligence | `product-intelligence/FORGE_GMM_PRODUCT_SOURCE_REGISTRY.md` | BAJO | - | 5 - Product intelligence |
| `FORGE_GMM_PROSPECT_EXPERIENCE_ANALYSIS.md` | product-intelligence | `product-intelligence/FORGE_GMM_PROSPECT_EXPERIENCE_ANALYSIS.md` | BAJO | - | 5 - Product intelligence |
| `FORGE_GMM_QUESTION_STRATEGY_ARCHITECTURE.md` | product-intelligence | `product-intelligence/FORGE_GMM_QUESTION_STRATEGY_ARCHITECTURE.md` | BAJO | - | 5 - Product intelligence |
| `FORGE_GMM_RULE_EVALUATION_ARCHITECTURE.md` | product-intelligence | `product-intelligence/FORGE_GMM_RULE_EVALUATION_ARCHITECTURE.md` | BAJO | - | 5 - Product intelligence |
| `FORGE_GMM_RULE_PROVENANCE_MODEL.md` | product-intelligence | `product-intelligence/FORGE_GMM_RULE_PROVENANCE_MODEL.md` | BAJO | - | 5 - Product intelligence |
| `FORGE_GMM_SHARED_INTELLIGENCE_REVIEW.md` | product-intelligence | `product-intelligence/FORGE_GMM_SHARED_INTELLIGENCE_REVIEW.md` | BAJO | - | 5 - Product intelligence |
| `FORGE_GMM_SHARED_SOURCE_REVIEW.md` | product-intelligence | `product-intelligence/FORGE_GMM_SHARED_SOURCE_REVIEW.md` | BAJO | - | 5 - Product intelligence |
| `FORGE_GMM_SOURCE_AUTHORITY_HIERARCHY.md` | product-intelligence | `product-intelligence/FORGE_GMM_SOURCE_AUTHORITY_HIERARCHY.md` | BAJO | - | 5 - Product intelligence |
| `FORGE_GMM_SOURCE_CONFLICT_ARCHITECTURE.md` | product-intelligence | `product-intelligence/FORGE_GMM_SOURCE_CONFLICT_ARCHITECTURE.md` | BAJO | - | 5 - Product intelligence |
| `FORGE_GMM_SOURCE_QUALITY_CLASSIFICATION.md` | product-intelligence | `product-intelligence/FORGE_GMM_SOURCE_QUALITY_CLASSIFICATION.md` | BAJO | - | 5 - Product intelligence |
| `FORGE_GMM_SOURCE_REGISTRY_DISCOVERY.md` | product-intelligence | `product-intelligence/FORGE_GMM_SOURCE_REGISTRY_DISCOVERY.md` | BAJO | - | 5 - Product intelligence |
| `FORGE_GMM_SOURCE_RETIREMENT_MODEL.md` | product-intelligence | `product-intelligence/FORGE_GMM_SOURCE_RETIREMENT_MODEL.md` | BAJO | - | 5 - Product intelligence |
| `FORGE_GMM_SOURCE_VALIDATION_WORKFLOW.md` | product-intelligence | `product-intelligence/FORGE_GMM_SOURCE_VALIDATION_WORKFLOW.md` | BAJO | - | 5 - Product intelligence |
| `FORGE_GMM_SOURCE_VERSIONING_MODEL.md` | product-intelligence | `product-intelligence/FORGE_GMM_SOURCE_VERSIONING_MODEL.md` | BAJO | - | 5 - Product intelligence |
| `FORGE_GMM_STORY_STRUCTURE_DISCOVERY.md` | product-intelligence | `product-intelligence/FORGE_GMM_STORY_STRUCTURE_DISCOVERY.md` | BAJO | - | 5 - Product intelligence |
| `FORGE_GMM_UNIVERSAL_EVIDENCE_PACKET.md` | product-intelligence | `product-intelligence/FORGE_GMM_UNIVERSAL_EVIDENCE_PACKET.md` | BAJO | - | 5 - Product intelligence |
| `FORGE_HIDDEN_FRICTIONS_DISCOVERY.md` | advisor-os | `advisor-os/FORGE_HIDDEN_FRICTIONS_DISCOVERY.md` | BAJO | - | 7 - Advisor OS |
| `FORGE_HUMAN_CAPITAL_ALLOCATION_FLOW.md` | docs | `docs/archive/FORGE_HUMAN_CAPITAL_ALLOCATION_FLOW.md` | BAJO | - | 1 - Docs y arquitectura |
| `FORGE_HUMAN_DECISION_DISCOVERY_CHECKPOINT.md` | advisor-os | `advisor-os/FORGE_HUMAN_DECISION_DISCOVERY_CHECKPOINT.md` | BAJO | - | 7 - Advisor OS |
| `FORGE_HUMAN_DEVELOPMENT_BUSINESS_FOUNDATIONAL_TRUTH.md` | docs | `docs/archive/FORGE_HUMAN_DEVELOPMENT_BUSINESS_FOUNDATIONAL_TRUTH.md` | BAJO | - | 1 - Docs y arquitectura |
| `FORGE_HUMAN_JUDGMENT_PRESERVATION_DISCOVERY.md` | advisor-os | `advisor-os/FORGE_HUMAN_JUDGMENT_PRESERVATION_DISCOVERY.md` | BAJO | - | 7 - Advisor OS |
| `FORGE_JUDGMENT_DEVELOPMENT_DISCOVERY.md` | advisor-os | `advisor-os/FORGE_JUDGMENT_DEVELOPMENT_DISCOVERY.md` | BAJO | - | 7 - Advisor OS |
| `FORGE_JUDGMENT_VS_PRODUCTION_ANALYSIS.md` | product-intelligence | `product-intelligence/FORGE_JUDGMENT_VS_PRODUCTION_ANALYSIS.md` | BAJO | - | 5 - Product intelligence |
| `FORGE_LARIZA_ADVISOR_COPILOT.md` | advisor-os | `advisor-os/FORGE_LARIZA_ADVISOR_COPILOT.md` | BAJO | - | 7 - Advisor OS |
| `FORGE_LARIZA_CLIENT_PRESENTATION.md` | docs | `docs/archive/FORGE_LARIZA_CLIENT_PRESENTATION.md` | BAJO | - | 1 - Docs y arquitectura |
| `FORGE_LARIZA_DECISION_CLARITY_REVIEW.md` | docs | `docs/archive/FORGE_LARIZA_DECISION_CLARITY_REVIEW.md` | BAJO | - | 1 - Docs y arquitectura |
| `FORGE_LARIZA_PEDRO_CAMARENA_TEST.md` | docs | `docs/archive/FORGE_LARIZA_PEDRO_CAMARENA_TEST.md` | BAJO | - | 1 - Docs y arquitectura |
| `FORGE_LARIZA_QUOTE_REVIEW.md` | product-intelligence | `product-intelligence/FORGE_LARIZA_QUOTE_REVIEW.md` | BAJO | - | 5 - Product intelligence |
| `FORGE_LOCK_CANDIDATE_REVIEW.md` | manager-os | `manager-os/FORGE_LOCK_CANDIDATE_REVIEW.md` | BAJO | - | 8 - Manager OS |
| `FORGE_MANAGER_FRICTION_DISCOVERY.md` | manager-os | `manager-os/FORGE_MANAGER_FRICTION_DISCOVERY.md` | BAJO | - | 8 - Manager OS |
| `FORGE_MANAGER_OS_BLUEPRINT.md` | manager-os | `manager-os/FORGE_MANAGER_OS_BLUEPRINT.md` | BAJO | - | 8 - Manager OS |
| `FORGE_MASTER_BUILD_TREE.md` | docs/root-governance | `FORGE_MASTER_BUILD_TREE.md` | NO_MOVER | - | 0 - No mover |
| `FORGE_REPOSITORY_MIGRATION_PLAN.md` | docs/root-governance | `FORGE_REPOSITORY_MIGRATION_PLAN.md` | BAJO | - | 1 - Docs y arquitectura |
| `FORGE_MISSING_SOURCES_REPORT.md` | docs | `docs/archive/FORGE_MISSING_SOURCES_REPORT.md` | BAJO | - | 1 - Docs y arquitectura |
| `FORGE_NEXT_DISCOVERY_PRIORITY_REPORT.md` | advisor-os | `advisor-os/FORGE_NEXT_DISCOVERY_PRIORITY_REPORT.md` | BAJO | - | 7 - Advisor OS |
| `FORGE_OS_CURRENT_STATE_DOMAIN_COMPENSATION_ADVISOR_EXPERIENCE.md` | compensation | `compensation/FORGE_OS_CURRENT_STATE_DOMAIN_COMPENSATION_ADVISOR_EXPERIENCE.md` | BAJO | - | 9 - Compensation |
| `FORGE_PEDRO_CAMARENA_INTELLIGENCE_DISCOVERY.md` | advisor-os | `advisor-os/FORGE_PEDRO_CAMARENA_INTELLIGENCE_DISCOVERY.md` | BAJO | - | 7 - Advisor OS |
| `FORGE_PHASE_2_1_ARCHITECTURE_DECISION_LOG.md` | docs | `docs/archive/FORGE_PHASE_2_1_ARCHITECTURE_DECISION_LOG.md` | BAJO | - | 1 - Docs y arquitectura |
| `FORGE_PHASE_2_1_BUILD_TREE_DECISION_NOTES.md` | docs | `docs/archive/FORGE_PHASE_2_1_BUILD_TREE_DECISION_NOTES.md` | BAJO | - | 1 - Docs y arquitectura |
| `FORGE_PHASE_2_X_ARCHITECTURE_REVIEW.md` | docs | `docs/archive/FORGE_PHASE_2_X_ARCHITECTURE_REVIEW.md` | BAJO | - | 1 - Docs y arquitectura |
| `FORGE_PHASE_2_X_CLOSEOUT_NOTE.md` | docs | `docs/archive/FORGE_PHASE_2_X_CLOSEOUT_NOTE.md` | BAJO | - | 1 - Docs y arquitectura |
| `FORGE_PHASE_2_X_CONCEPTUAL_BUILD_TREE.md` | docs | `docs/archive/FORGE_PHASE_2_X_CONCEPTUAL_BUILD_TREE.md` | BAJO | - | 1 - Docs y arquitectura |
| `FORGE_PHASE_2_X_MODULE_MARKDOWN_BUNDLE.md` | docs | `docs/archive/FORGE_PHASE_2_X_MODULE_MARKDOWN_BUNDLE.md` | BAJO | - | 1 - Docs y arquitectura |
| `FORGE_PHASE_TRANSITION_FOUNDATION_TO_INTELLIGENCE.md` | docs | `docs/archive/FORGE_PHASE_TRANSITION_FOUNDATION_TO_INTELLIGENCE.md` | BAJO | - | 1 - Docs y arquitectura |
| `FORGE_PROFESSIONAL_DEVELOPMENT_MODEL_DISCOVERY.md` | advisor-os | `advisor-os/FORGE_PROFESSIONAL_DEVELOPMENT_MODEL_DISCOVERY.md` | BAJO | - | 7 - Advisor OS |
| `FORGE_PROFESSIONAL_EXCELLENCE_MODEL_DISCOVERY.md` | advisor-os | `advisor-os/FORGE_PROFESSIONAL_EXCELLENCE_MODEL_DISCOVERY.md` | BAJO | - | 7 - Advisor OS |
| `FORGE_PROFESSIONAL_SALES_LAW_CANDIDATES.md` | manager-os | `manager-os/FORGE_PROFESSIONAL_SALES_LAW_CANDIDATES.md` | BAJO | - | 8 - Manager OS |
| `FORGE_PROFESSIONAL_SALES_PROCESS_DISCOVERY.md` | advisor-os | `advisor-os/FORGE_PROFESSIONAL_SALES_PROCESS_DISCOVERY.md` | BAJO | - | 7 - Advisor OS |
| `FORGE_PROJECTION_INTELLIGENCE_CHECKPOINT_NOTE.md` | shared-intelligence | `shared-intelligence/FORGE_PROJECTION_INTELLIGENCE_CHECKPOINT_NOTE.md` | BAJO | - | 3 - Shared intelligence |
| `FORGE_PROSPECT_DECISION_TIMELINE_DISCOVERY.md` | advisor-os | `advisor-os/FORGE_PROSPECT_DECISION_TIMELINE_DISCOVERY.md` | BAJO | - | 7 - Advisor OS |
| `FORGE_QUOTE_VS_POLICY_ANALYSIS.md` | product-intelligence | `product-intelligence/FORGE_QUOTE_VS_POLICY_ANALYSIS.md` | BAJO | - | 5 - Product intelligence |
| `FORGE_RATIFICATION_AND_FOUNDATION_CLOSURE.md` | docs | `docs/archive/FORGE_RATIFICATION_AND_FOUNDATION_CLOSURE.md` | BAJO | - | 1 - Docs y arquitectura |
| `FORGE_READINESS_INTELLIGENCE_DISCOVERY.md` | manager-os | `manager-os/FORGE_READINESS_INTELLIGENCE_DISCOVERY.md` | BAJO | - | 8 - Manager OS |
| `FORGE_READINESS_MODEL_CANDIDATE.md` | manager-os | `manager-os/FORGE_READINESS_MODEL_CANDIDATE.md` | BAJO | - | 8 - Manager OS |
| `FORGE_READINESS_SIGNALS_DISCOVERY.md` | manager-os | `manager-os/FORGE_READINESS_SIGNALS_DISCOVERY.md` | BAJO | - | 8 - Manager OS |
| `FORGE_READINESS_VS_FRICTION_COMPARISON.md` | manager-os | `manager-os/FORGE_READINESS_VS_FRICTION_COMPARISON.md` | BAJO | - | 8 - Manager OS |
| `FORGE_REAL_WORLD_CASE_REVIEW.md` | docs | `docs/archive/FORGE_REAL_WORLD_CASE_REVIEW.md` | BAJO | - | 1 - Docs y arquitectura |
| `FORGE_RETIREMENT_FUTURE_UDI_REASONING_DIAGRAM.md` | docs | `docs/archive/FORGE_RETIREMENT_FUTURE_UDI_REASONING_DIAGRAM.md` | BAJO | - | 1 - Docs y arquitectura |
| `FORGE_SALES_DECISION_SEQUENCE_DISCOVERY.md` | advisor-os | `advisor-os/FORGE_SALES_DECISION_SEQUENCE_DISCOVERY.md` | BAJO | - | 7 - Advisor OS |
| `FORGE_SHARED_COMMERCIAL_MODEL_EVIDENCE_PROVENANCE_FOUNDATION.md` | shared-intelligence | `shared-intelligence/FORGE_SHARED_COMMERCIAL_MODEL_EVIDENCE_PROVENANCE_FOUNDATION.md` | BAJO | - | 3 - Shared intelligence |
| `FORGE_SHARED_COMMERCIAL_MODEL_FOUNDATION_REVIEW.md` | shared-intelligence | `shared-intelligence/FORGE_SHARED_COMMERCIAL_MODEL_FOUNDATION_REVIEW.md` | BAJO | - | 3 - Shared intelligence |
| `FORGE_SHARED_COMMERCIAL_MODEL_IDENTITY_ATTRIBUTION_HARDENING.md` | shared-intelligence | `shared-intelligence/FORGE_SHARED_COMMERCIAL_MODEL_IDENTITY_ATTRIBUTION_HARDENING.md` | BAJO | - | 3 - Shared intelligence |
| `FORGE_SHARED_COMMERCIAL_MODEL_PERIODS_OPERATIONAL_CLOCKS_HARDENING.md` | policy-operations | `policy-operations/FORGE_SHARED_COMMERCIAL_MODEL_PERIODS_OPERATIONAL_CLOCKS_HARDENING.md` | BAJO | - | 6 - Policy operations |
| `FORGE_SHARED_DOMAIN_MODEL.md` | shared-intelligence | `shared-intelligence/FORGE_SHARED_DOMAIN_MODEL.md` | BAJO | - | 3 - Shared intelligence |
| `FORGE_SHARED_POLICY_CURRENCY_TIMELINE_RECOMMENDATION.md` | policy-operations | `policy-operations/FORGE_SHARED_POLICY_CURRENCY_TIMELINE_RECOMMENDATION.md` | BAJO | - | 6 - Policy operations |
| `FORGE_SKYNET_DISCOVERY.md` | advisor-os | `advisor-os/FORGE_SKYNET_DISCOVERY.md` | BAJO | - | 7 - Advisor OS |
| `FORGE_SKYNET_GOVERNANCE_MODEL.md` | docs | `docs/archive/FORGE_SKYNET_GOVERNANCE_MODEL.md` | BAJO | - | 1 - Docs y arquitectura |
| `FORGE_TRUTH_CLASSIFICATION_MATRIX.md` | docs | `docs/archive/FORGE_TRUTH_CLASSIFICATION_MATRIX.md` | BAJO | - | 1 - Docs y arquitectura |
| `FORGE_TRUTH_DEPENDENCY_MAP.md` | docs | `docs/archive/FORGE_TRUTH_DEPENDENCY_MAP.md` | BAJO | - | 1 - Docs y arquitectura |
| `FORGE_UNIVERSAL_SALES_PRINCIPLES_DISCOVERY.md` | advisor-os | `advisor-os/FORGE_UNIVERSAL_SALES_PRINCIPLES_DISCOVERY.md` | BAJO | - | 7 - Advisor OS |
| `FORGE_VALIDATION_REQUIREMENTS_REPORT.md` | docs | `docs/archive/FORGE_VALIDATION_REQUIREMENTS_REPORT.md` | BAJO | - | 1 - Docs y arquitectura |
| `IMAGINA_SER_EDWIN_ADVISOR_INTERPRETATION_REPORT.md` | advisor-os | `advisor-os/IMAGINA_SER_EDWIN_ADVISOR_INTERPRETATION_REPORT.md` | BAJO | - | 7 - Advisor OS |
| `IMAGINA_SER_EDWIN_RAW_SOURCE_REPORT.md` | docs | `docs/archive/IMAGINA_SER_EDWIN_RAW_SOURCE_REPORT.md` | BAJO | - | 1 - Docs y arquitectura |
| `IMAGINA_SER_EDWIN_REASONING_DIAGRAM.md` | docs | `docs/archive/IMAGINA_SER_EDWIN_REASONING_DIAGRAM.md` | BAJO | - | 1 - Docs y arquitectura |
| `INTERVIEW_KNOWLEDGE_BASE.md` | manager-os | `manager-os/INTERVIEW_KNOWLEDGE_BASE.md` | BAJO | - | 8 - Manager OS |
| `MANAGER_COMPENSATION_KNOWLEDGE_BASE.md` | compensation | `compensation/MANAGER_COMPENSATION_KNOWLEDGE_BASE.md` | BAJO | - | 9 - Compensation |
| `PACKAGE_NOTES.md` | docs | `docs/archive/PACKAGE_NOTES.md` | BAJO | - | 1 - Docs y arquitectura |
| `PAQ-01-RECRUITMENT-INTELLIGENCE-DISCOVERY.md` | manager-os | `manager-os/PAQ-01-RECRUITMENT-INTELLIGENCE-DISCOVERY.md` | BAJO | - | 8 - Manager OS |
| `PAQ-02-RECRUITMENT-DOMAIN-MODEL-ADDENDUM.md` | manager-os | `manager-os/PAQ-02-RECRUITMENT-DOMAIN-MODEL-ADDENDUM.md` | BAJO | - | 8 - Manager OS |
| `PAQ-02-RECRUITMENT-DOMAIN-MODEL.md` | manager-os | `manager-os/PAQ-02-RECRUITMENT-DOMAIN-MODEL.md` | BAJO | - | 8 - Manager OS |
| `PAQ-03-CAREER-CAPITAL-RELATIONSHIP-CAPITAL-BOUNDARY-REVIEW.md` | manager-os | `manager-os/PAQ-03-CAREER-CAPITAL-RELATIONSHIP-CAPITAL-BOUNDARY-REVIEW.md` | BAJO | - | 8 - Manager OS |
| `PAQ-04-METRICS-OWNERSHIP-FINALIZATION.md` | docs | `docs/archive/PAQ-04-METRICS-OWNERSHIP-FINALIZATION.md` | BAJO | - | 1 - Docs y arquitectura |
| `PAQ-04-P200-MARKET-NATURAL-DISCOVERY-REVIEW.md` | advisor-os | `advisor-os/PAQ-04-P200-MARKET-NATURAL-DISCOVERY-REVIEW.md` | BAJO | - | 7 - Advisor OS |
| `PAQ-05-RELATIONSHIP-ACTIVATION-REVIEW.md` | advisor-os | `advisor-os/PAQ-05-RELATIONSHIP-ACTIVATION-REVIEW.md` | BAJO | - | 7 - Advisor OS |
| `PAQ-05-RULE-SNAPSHOT-HARDENING.md` | rule-packs | `rule-packs/PAQ-05-RULE-SNAPSHOT-HARDENING.md` | BAJO | - | 4 - Rule packs |
| `PAQ-06-COMMERCIAL-EVENTS-TAXONOMY.md` | docs | `docs/archive/PAQ-06-COMMERCIAL-EVENTS-TAXONOMY.md` | BAJO | - | 1 - Docs y arquitectura |
| `PAQ-06-RECRUITMENT-HARDENING-REVIEW.md` | manager-os | `manager-os/PAQ-06-RECRUITMENT-HARDENING-REVIEW.md` | BAJO | - | 8 - Manager OS |
| `PAQ-07-FOUNDATION-LOCK-REVIEW.md` | docs | `docs/archive/PAQ-07-FOUNDATION-LOCK-REVIEW.md` | BAJO | - | 1 - Docs y arquitectura |
| `PAQ-07-PARTNER-INTELLIGENCE-DISCOVERY.md` | advisor-os | `advisor-os/PAQ-07-PARTNER-INTELLIGENCE-DISCOVERY.md` | BAJO | - | 7 - Advisor OS |
| `PAQ-08-ADVISOR-DEVELOPMENT-INTELLIGENCE-DISCOVERY.md` | advisor-os | `advisor-os/PAQ-08-ADVISOR-DEVELOPMENT-INTELLIGENCE-DISCOVERY.md` | BAJO | - | 7 - Advisor OS |
| `PAQ-08-FOUNDATION-LOCK-FINAL-REVIEW.md` | docs | `docs/archive/PAQ-08-FOUNDATION-LOCK-FINAL-REVIEW.md` | BAJO | - | 1 - Docs y arquitectura |
| `PAQ-08.5-ARCHITECTURE-RISK-CORRECTION-RATIFICATION.md` | docs | `docs/archive/PAQ-08.5-ARCHITECTURE-RISK-CORRECTION-RATIFICATION.md` | BAJO | - | 1 - Docs y arquitectura |
| `PAQ-09-PRODUCTIVITY-INTELLIGENCE-DISCOVERY.md` | product-intelligence | `product-intelligence/PAQ-09-PRODUCTIVITY-INTELLIGENCE-DISCOVERY.md` | BAJO | - | 5 - Product intelligence |
| `PAQ-09.5-PRODUCTIVITY-INTELLIGENCE-ARCHITECTURE-LOCK.md` | product-intelligence | `product-intelligence/PAQ-09.5-PRODUCTIVITY-INTELLIGENCE-ARCHITECTURE-LOCK.md` | BAJO | - | 5 - Product intelligence |
| `PAQ-10-CONSERVATION-INTELLIGENCE-DISCOVERY.md` | advisor-os | `advisor-os/PAQ-10-CONSERVATION-INTELLIGENCE-DISCOVERY.md` | BAJO | - | 7 - Advisor OS |
| `PAQ-10.5-CONSERVATION-INTELLIGENCE-ARCHITECTURE-LOCK.md` | docs | `docs/archive/PAQ-10.5-CONSERVATION-INTELLIGENCE-ARCHITECTURE-LOCK.md` | BAJO | - | 1 - Docs y arquitectura |
| `PAQ-11-FORECAST-INTELLIGENCE-DISCOVERY.md` | advisor-os | `advisor-os/PAQ-11-FORECAST-INTELLIGENCE-DISCOVERY.md` | BAJO | - | 7 - Advisor OS |
| `PAQ-11.5-FORECAST-INTELLIGENCE-ARCHITECTURE.md` | docs | `docs/archive/PAQ-11.5-FORECAST-INTELLIGENCE-ARCHITECTURE.md` | BAJO | - | 1 - Docs y arquitectura |
| `PAQ-11.5.2-FORECAST-INTELLIGENCE-ARCHITECTURE-LOCK.md` | docs | `docs/archive/PAQ-11.5.2-FORECAST-INTELLIGENCE-ARCHITECTURE-LOCK.md` | BAJO | - | 1 - Docs y arquitectura |
| `PAQ-11.5.2-FORECAST-INTELLIGENCE.md` | docs | `docs/archive/PAQ-11.5.2-FORECAST-INTELLIGENCE.md` | BAJO | - | 1 - Docs y arquitectura |
| `PAQ-12-ADVISOR-EXPERIENCE-INTELLIGENCE-PRODUCTIVITY.md` | product-intelligence | `product-intelligence/PAQ-12-ADVISOR-EXPERIENCE-INTELLIGENCE-PRODUCTIVITY.md` | BAJO | - | 5 - Product intelligence |
| `PAQ-12.1-ADVISOR-EXPERIENCE-INTELLIGENCE-ARCHITECTURE.md` | advisor-os | `advisor-os/PAQ-12.1-ADVISOR-EXPERIENCE-INTELLIGENCE-ARCHITECTURE.md` | BAJO | - | 7 - Advisor OS |
| `PAQ-12.x.y-FIRST-WOW-MOMENT-DISCOVERY.md` | advisor-os | `advisor-os/PAQ-12.x.y-FIRST-WOW-MOMENT-DISCOVERY.md` | BAJO | - | 7 - Advisor OS |
| `READINESS_INTELLIGENCE_DISCOVERY.md` | manager-os | `manager-os/READINESS_INTELLIGENCE_DISCOVERY.md` | BAJO | - | 8 - Manager OS |
| `READINESS_VS_POTENTIAL_VS_EXCELLENCE.md` | manager-os | `manager-os/READINESS_VS_POTENTIAL_VS_EXCELLENCE.md` | BAJO | - | 8 - Manager OS |
| `RECRUITMENT_DOMAIN_MODEL.md` | manager-os | `manager-os/RECRUITMENT_DOMAIN_MODEL.md` | BAJO | - | 8 - Manager OS |
| `RECRUITMENT_KNOWLEDGE_BASE.md` | manager-os | `manager-os/RECRUITMENT_KNOWLEDGE_BASE.md` | BAJO | - | 8 - Manager OS |
| `REPORTE_FUENTE_ORIGINAL_EDWIN_IS15.md` | docs | `docs/archive/REPORTE_FUENTE_ORIGINAL_EDWIN_IS15.md` | BAJO | - | 1 - Docs y arquitectura |
| `REPORTE_INTERPRETACION_FORGE_EDWIN_IS15.md` | docs | `docs/archive/REPORTE_INTERPRETACION_FORGE_EDWIN_IS15.md` | BAJO | - | 1 - Docs y arquitectura |
| `SCHEMA_CATALOG.md` | shared-intelligence | `shared-intelligence/SCHEMA_CATALOG.md` | BAJO | - | 3 - Shared intelligence |
| `accessibility-engine.js` | legacy | `legacy/accessibility-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `accident-intelligence-engine.js` | legacy | `legacy/accident-intelligence-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `accident-smoke-test.js` | tests | `tests/accident-smoke-test.js` | MEDIO | ./accident-intelligence-engine.js => accident-intelligence-engine.js | 2 - Tests y fixtures |
| `action-resolver-engine.js` | legacy | `legacy/action-resolver-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `actividad.js` | legacy | `legacy/actividad.js` | MEDIO | ./db.js => db.js<br>./ai-service.js => ai-service.js<br>./event-system.js => event-system.js<br>./memory-manager.js => memory-manager.js<br>./utils.js => utils.js | 11 - Legacy quarantine |
| `activity-feed-engine.js` | legacy | `legacy/activity-feed-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `activity-feed.js` | legacy | `legacy/activity-feed.js` | MEDIO | - | 11 - Legacy quarantine |
| `activity-stream-engine.js` | legacy | `legacy/activity-stream-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `adaptive-message-builder.js` | legacy | `legacy/adaptive-message-builder.js` | MEDIO | ./tone-profile-engine => tone-profile-engine.js<br>./channel-adaptation-engine => channel-adaptation-engine.js | 11 - Legacy quarantine |
| `adaptive-outreach-prompt-builder.js` | advisor-os | `advisor-os/adaptive-outreach-prompt-builder.js` | MEDIO | ./prospect-personality-engine => prospect-personality-engine.js<br>./communication-style-engine => communication-style-engine.js<br>./script-adaptation-engine => script-adaptation-engine.js | 7 - Advisor OS |
| `adaptive-question-engine.js` | legacy | `legacy/adaptive-question-engine.js` | MEDIO | ./adaptive-question-bank => adaptive-question-bank<br>./question-style-match-engine => question-style-match-engine.js | 11 - Legacy quarantine |
| `adaptive-script-builder.js` | legacy | `legacy/adaptive-script-builder.js` | MEDIO | - | 11 - Legacy quarantine |
| `advisor-activity-timeline.js` | advisor-os | `advisor-os/advisor-activity-timeline.js` | BAJO | - | 7 - Advisor OS |
| `advisor-alert-engine.js` | advisor-os | `advisor-os/advisor-alert-engine.js` | BAJO | - | 7 - Advisor OS |
| `advisor-monitor-engine.js` | advisor-os | `advisor-os/advisor-monitor-engine.js` | BAJO | - | 7 - Advisor OS |
| `advisor-performance-engine.js` | advisor-os | `advisor-os/advisor-performance-engine.js` | BAJO | - | 7 - Advisor OS |
| `advisor-sales-dna.entity.js` | advisor-os | `advisor-os/advisor-sales-dna.entity.js` | BAJO | - | 7 - Advisor OS |
| `advisor-score-engine.js` | advisor-os | `advisor-os/advisor-score-engine.js` | BAJO | - | 7 - Advisor OS |
| `advisor-style-engine.js` | advisor-os | `advisor-os/advisor-style-engine.js` | BAJO | - | 7 - Advisor OS |
| `advisor-style.constants.js` | advisor-os | `advisor-os/advisor-style.constants.js` | BAJO | - | 7 - Advisor OS |
| `ai-context-engine.js` | legacy | `legacy/ai-context-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `ai-first-contact-message-engine.js` | advisor-os | `advisor-os/ai-first-contact-message-engine.js` | BAJO | - | 7 - Advisor OS |
| `ai-orb-widget.js` | legacy | `legacy/ai-orb-widget.js` | MEDIO | - | 11 - Legacy quarantine |
| `ai-prompt-builder.js` | legacy | `legacy/ai-prompt-builder.js` | MEDIO | - | 11 - Legacy quarantine |
| `ai-sales-coach-engine.js` | advisor-os | `advisor-os/ai-sales-coach-engine.js` | BAJO | - | 7 - Advisor OS |
| `ai-service.js` | legacy | `legacy/ai-service.js` | MEDIO | ./event-system.js => event-system.js | 11 - Legacy quarantine |
| `ai-task-suggestion-engine.js` | policy-operations | `policy-operations/ai-task-suggestion-engine.js` | BAJO | - | 6 - Policy operations |
| `analytics-engine.js` | legacy | `legacy/analytics-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `animation-engine.js` | legacy | `legacy/animation-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `app-shell-manager.js` | manager-os | `manager-os/app-shell-manager.js` | MEDIO | - | 8 - Manager OS |
| `app.js` | platform | `app.js` | NO_MOVER | ./db.js => db.js<br>./utils.js => utils.js<br>./dashboard.js => dashboard.js<br>./prospeccion.js => prospeccion.js<br>./referidos.js => referidos.js<br>./actividad.js => actividad.js<br>... +12 | 0 - No mover |
| `appointment-calendar-engine.js` | advisor-os | `advisor-os/appointment-calendar-engine.js` | BAJO | - | 7 - Advisor OS |
| `appointment-followup-engine.js` | advisor-os | `advisor-os/appointment-followup-engine.js` | BAJO | - | 7 - Advisor OS |
| `appointment-opportunity-engine.js` | advisor-os | `advisor-os/appointment-opportunity-engine.js` | BAJO | - | 7 - Advisor OS |
| `assistant-memory-engine.js` | legacy | `legacy/assistant-memory-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `auth-guard.js` | platform | `platform/auth-guard.js` | MEDIO | ./utils.js => utils.js | 10 - Platform |
| `auto-task-generator-engine.js` | policy-operations | `policy-operations/auto-task-generator-engine.js` | BAJO | - | 6 - Policy operations |
| `base-repository.js` | platform | `platform/base-repository.js` | MEDIO | ./telemetry.js => telemetry.js | 10 - Platform |
| `buying-signals-engine.js` | legacy | `legacy/buying-signals-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `cache-runtime.js` | platform | `platform/cache-runtime.js` | MEDIO | - | 10 - Platform |
| `candidate-assessment-engine.js` | manager-os | `manager-os/candidate-assessment-engine.js` | MEDIO | ./candidate-hard-factors-engine => candidate-hard-factors-engine.js<br>./candidate-vital-factors-engine => candidate-vital-factors-engine.js<br>./candidate-coachability-engine => candidate-coachability-engine.js<br>./candidate-market-quality-engine => candidate-market-quality-engine.js | 8 - Manager OS |
| `candidate-assessment-master-test.js` | tests | `tests/candidate-assessment-master-test.js` | MEDIO | ./candidate-assessment-engine => candidate-assessment-engine.js | 2 - Tests y fixtures |
| `candidate-coachability-engine.js` | manager-os | `manager-os/candidate-coachability-engine.js` | MEDIO | - | 8 - Manager OS |
| `candidate-coachability-master-test.js` | tests | `tests/candidate-coachability-master-test.js` | MEDIO | ./candidate-coachability-engine => candidate-coachability-engine.js | 2 - Tests y fixtures |
| `candidate-hard-factors-engine.js` | manager-os | `manager-os/candidate-hard-factors-engine.js` | MEDIO | - | 8 - Manager OS |
| `candidate-hard-factors-master-test.js` | tests | `tests/candidate-hard-factors-master-test.js` | MEDIO | ./candidate-hard-factors-engine => candidate-hard-factors-engine.js | 2 - Tests y fixtures |
| `candidate-market-quality-engine.js` | manager-os | `manager-os/candidate-market-quality-engine.js` | MEDIO | - | 8 - Manager OS |
| `candidate-market-quality-master-test.js` | tests | `tests/candidate-market-quality-master-test.js` | MEDIO | ./candidate-market-quality-engine => candidate-market-quality-engine.js | 2 - Tests y fixtures |
| `candidate-vital-factors-engine.js` | manager-os | `manager-os/candidate-vital-factors-engine.js` | MEDIO | - | 8 - Manager OS |
| `candidate-vital-factors-master-test.js` | tests | `tests/candidate-vital-factors-master-test.js` | MEDIO | ./candidate-vital-factors-engine => candidate-vital-factors-engine.js | 2 - Tests y fixtures |
| `cartera-events.js` | legacy | `legacy/cartera-events.js` | MEDIO | - | 11 - Legacy quarantine |
| `cartera-import-engine.js` | policy-operations | `policy-operations/cartera-import-engine.js` | MEDIO | ./cartera-service.js => cartera-service.js | 6 - Policy operations |
| `cartera-normalizer.js` | legacy | `legacy/cartera-normalizer.js` | MEDIO | ./financial-utils.js => financial-utils.js | 11 - Legacy quarantine |
| `cartera-repository.js` | platform | `platform/cartera-repository.js` | MEDIO | ./base-repository.js => base-repository.js<br>./db.js => db.js | 10 - Platform |
| `cartera-service.js` | legacy | `legacy/cartera-service.js` | MEDIO | ./db.js => db.js<br>./cartera-normalizer.js => cartera-normalizer.js<br>./cartera-validator.js => cartera-validator.js<br>./cartera-events.js => cartera-events.js<br>./cartera-state.js => cartera-state.js | 11 - Legacy quarantine |
| `cartera-state.js` | legacy | `legacy/cartera-state.js` | MEDIO | - | 11 - Legacy quarantine |
| `cartera-utils.js` | platform | `platform/cartera-utils.js` | ALTO | - | 10 - Platform |
| `cartera-validator.js` | legacy | `legacy/cartera-validator.js` | MEDIO | - | 11 - Legacy quarantine |
| `cartera-view.js` | legacy | `legacy/cartera-view.js` | MEDIO | ../utils/cartera-utils.js => ../utils/cartera-utils.js | 11 - Legacy quarantine |
| `cartera.js` | legacy | `legacy/cartera.js` | ALTO | ./db.js => db.js<br>./utils.js => utils.js<br>./state-manager.js => state-manager.js<br>./event-system.js => event-system.js<br>./ui-render-engine.js => ui-render-engine.js<br>./analytics-engine.js => analytics-engine.js<br>... +2 | 11 - Legacy quarantine |
| `catastrophic-illness-engine.js` | product-intelligence | `product-intelligence/catastrophic-illness-engine.js` | MEDIO | - | 5 - Product intelligence |
| `catastrophic-illness-smoke-test.js` | tests | `tests/catastrophic-illness-smoke-test.js` | MEDIO | ./catastrophic-illness-engine.js => catastrophic-illness-engine.js | 2 - Tests y fixtures |
| `center-of-influence-engine.js` | advisor-os | `advisor-os/center-of-influence-engine.js` | BAJO | - | 7 - Advisor OS |
| `channel-adaptation-engine.js` | legacy | `legacy/channel-adaptation-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `channel-performance-engine.js` | legacy | `legacy/channel-performance-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `client-engagement-engine.js` | advisor-os | `advisor-os/client-engagement-engine.js` | MEDIO | - | 7 - Advisor OS |
| `client-engagement-master-test.js` | tests | `tests/client-engagement-master-test.js` | MEDIO | ./client-engagement-engine => client-engagement-engine.js | 2 - Tests y fixtures |
| `clipboard-action-engine.js` | legacy | `legacy/clipboard-action-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `close-prompt-builder.js` | advisor-os | `advisor-os/close-prompt-builder.js` | BAJO | - | 7 - Advisor OS |
| `close-readiness-engine.js` | manager-os | `manager-os/close-readiness-engine.js` | BAJO | - | 8 - Manager OS |
| `close-strategy-engine.js` | advisor-os | `advisor-os/close-strategy-engine.js` | BAJO | - | 7 - Advisor OS |
| `comisiones-rules-gmm.js` | compensation | `compensation/comisiones-rules-gmm.js` | BAJO | - | 9 - Compensation |
| `comisiones-utils.js` | compensation | `compensation/comisiones-utils.js` | BAJO | - | 9 - Compensation |
| `comisiones.js` | compensation | `compensation/comisiones.js` | MEDIO | ./db.js => db.js<br>./app.js => app.js<br>./utils.js => utils.js | 9 - Compensation |
| `command-execution-engine.js` | platform | `platform/command-execution-engine.js` | ALTO | - | 10 - Platform |
| `command-palette-engine.js` | platform | `platform/command-palette-engine.js` | ALTO | - | 10 - Platform |
| `command-palette-ui.js` | platform | `platform/command-palette-ui.js` | MEDIO | - | 10 - Platform |
| `command-palette.js` | platform | `platform/command-palette.js` | MEDIO | ./smnyl-command-palette-engine.js => smnyl-command-palette-engine.js | 10 - Platform |
| `command-palette.store.js` | platform | `platform/command-palette.store.js` | ALTO | - | 10 - Platform |
| `command-parser-engine.js` | platform | `platform/command-parser-engine.js` | ALTO | - | 10 - Platform |
| `command-registry.js` | platform | `platform/command-registry.js` | ALTO | - | 10 - Platform |
| `command-search-engine.js` | platform | `platform/command-search-engine.js` | ALTO | - | 10 - Platform |
| `command-shortcuts-engine.js` | platform | `platform/command-shortcuts-engine.js` | MEDIO | ./command-palette-ui.js => command-palette-ui.js | 10 - Platform |
| `command-suggestion-engine.js` | platform | `platform/command-suggestion-engine.js` | ALTO | - | 10 - Platform |
| `commission-projection-engine.js` | compensation | `compensation/commission-projection-engine.js` | BAJO | - | 9 - Compensation |
| `commissionable-amount-engine.js` | compensation | `compensation/commissionable-amount-engine.js` | BAJO | - | 9 - Compensation |
| `communication-channel-engine.js` | legacy | `legacy/communication-channel-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `communication-mismatch-engine.js` | legacy | `legacy/communication-mismatch-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `communication-style-engine.js` | legacy | `legacy/communication-style-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `concursos.js` | compensation | `compensation/concursos.js` | MEDIO | ./smnyl-concursos-engine.js => smnyl-concursos-engine.js | 9 - Compensation |
| `contact-attempt-engine.js` | legacy | `legacy/contact-attempt-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `contact-channel.constants.js` | legacy | `legacy/contact-channel.constants.js` | MEDIO | - | 11 - Legacy quarantine |
| `contact-response-engine.js` | legacy | `legacy/contact-response-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `contextual-suggestion-engine.js` | legacy | `legacy/contextual-suggestion-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `conversion-metrics-engine.js` | legacy | `legacy/conversion-metrics-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `copilot-suggestion-engine.js` | legacy | `legacy/copilot-suggestion-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `core-app-engine.js` | legacy | `legacy/core-app-engine.js` | ALTO | ./network-manager.js => network-manager.js<br>./offline-sync.js => offline-sync.js<br>./logger.js => logger.js<br>./performance-monitor.js => performance-monitor.js<br>./auth-guard.js => auth-guard.js<br>./responsive-engine.js => responsive-engine.js<br>... +4 | 11 - Legacy quarantine |
| `core-event-bus.js` | platform | `platform/core-event-bus.js` | MEDIO | - | 10 - Platform |
| `core_domain-events.js` | legacy | `legacy/core_domain-events.js` | MEDIO | - | 11 - Legacy quarantine |
| `core_event-bus.js` | platform | `platform/core_event-bus.js` | ALTO | - | 10 - Platform |
| `coverage-evaluation-foundation-engine.js` | product-intelligence | `product-intelligence/coverage-evaluation-foundation-engine.js` | MEDIO | - | 5 - Product intelligence |
| `coverage-foundation-smoke-test.js` | tests | `tests/coverage-foundation-smoke-test.js` | MEDIO | ./coverage-evaluation-foundation-engine.js => coverage-evaluation-foundation-engine.js | 2 - Tests y fixtures |
| `coverage-intelligence-orchestrator.js` | product-intelligence | `product-intelligence/coverage-intelligence-orchestrator.js` | ALTO | ./event-classification-engine.js => event-classification-engine.js<br>./evidence-collection-engine.js => evidence-collection-engine.js<br>./maternity-intelligence-engine.js => maternity-intelligence-engine.js<br>./accident-intelligence-engine.js => accident-intelligence-engine.js<br>./hospitalization-intelligence-engine.js => hospitalization-intelligence-engine.js<br>./surgery-intelligence-engine.js => surgery-intelligence-engine.js<br>... +4 | 5 - Product intelligence |
| `coverage-orchestrator-smoke-test.js` | tests | `tests/coverage-orchestrator-smoke-test.js` | MEDIO | ./coverage-intelligence-orchestrator.js => coverage-intelligence-orchestrator.js | 2 - Tests y fixtures |
| `crash-runtime.js` | platform | `platform/crash-runtime.js` | MEDIO | ./telemetry.js => telemetry.js | 10 - Platform |
| `csv-parser-engine.js` | legacy | `legacy/csv-parser-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `currency-normalization-engine.js` | shared-intelligence | `shared-intelligence/currency-normalization-engine.js` | MEDIO | - | 3 - Shared intelligence |
| `daily-points-engine.js` | legacy | `legacy/daily-points-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `dashboard-executive.js` | platform | `platform/dashboard-executive.js` | MEDIO | ./smnyl-operating-system-engine.js => smnyl-operating-system-engine.js | 10 - Platform |
| `dashboard-priority-engine.js` | platform | `platform/dashboard-priority-engine.js` | ALTO | - | 10 - Platform |
| `dashboard.js` | platform | `platform/dashboard.js` | ALTO | ./db.js => db.js<br>./state-manager.js => state-manager.js<br>./event-system.js => event-system.js<br>./logger.js => logger.js<br>./memory-manager.js => memory-manager.js<br>./ui-render-engine.js => ui-render-engine.js | 10 - Platform |
| `db.js` | platform | `platform/db.js` | ALTO | ./storage-engine.js => storage-engine.js | 10 - Platform |
| `decision-appendix-master-test.js` | tests | `tests/decision-appendix-master-test.js` | ALTO | ./shared-benefit-hierarchy-engine => shared-benefit-hierarchy-engine.js<br>./shared-recovery-analysis-engine => shared-recovery-analysis-engine.js<br>./shared-decision-clarity-engine => shared-decision-clarity-engine.js<br>./shared-client-language-engine => shared-client-language-engine.js<br>./shared-price-placement-engine => shared-price-placement-engine.js<br>./shared-decision-score-engine => shared-decision-score-engine.js<br>... +1 | 2 - Tests y fixtures |
| `design-tokens.js` | legacy | `legacy/design-tokens.js` | MEDIO | - | 11 - Legacy quarantine |
| `discovery-insights-engine.js` | advisor-os | `advisor-os/discovery-insights-engine.js` | BAJO | - | 7 - Advisor OS |
| `discovery-priority-engine.js` | advisor-os | `advisor-os/discovery-priority-engine.js` | BAJO | - | 7 - Advisor OS |
| `discovery-product-alignment-engine.js` | product-intelligence | `product-intelligence/discovery-product-alignment-engine.js` | BAJO | - | 5 - Product intelligence |
| `discovery-summary-engine.js` | advisor-os | `advisor-os/discovery-summary-engine.js` | BAJO | - | 7 - Advisor OS |
| `discovery-to-presentation-engine.js` | advisor-os | `advisor-os/discovery-to-presentation-engine.js` | BAJO | - | 7 - Advisor OS |
| `dna-coaching-engine.js` | manager-os | `manager-os/dna-coaching-engine.js` | BAJO | - | 8 - Manager OS |
| `dna-script-strategy-engine.js` | legacy | `legacy/dna-script-strategy-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `docs/adr/ADR-0019_PROCESS_ADVANCEMENT_INTELLIGENCE.md` | docs | `docs/adr/ADR-0019_PROCESS_ADVANCEMENT_INTELLIGENCE.md` | BAJO | - | 1 - Docs y arquitectura |
| `docs/adr/ADR-001D_HANDLING_VOCABULARY.md` | docs | `docs/adr/ADR-001D_HANDLING_VOCABULARY.md` | BAJO | - | 1 - Docs y arquitectura |
| `docs/adr/ADR-0021_CANDIDATE_INTELLIGENCE_GOVERNANCE.md` | docs | `docs/adr/ADR-0021_CANDIDATE_INTELLIGENCE_GOVERNANCE.md` | BAJO | - | 1 - Docs y arquitectura |
| `docs/architecture/README.md` | docs | `docs/architecture/README.md` | BAJO | - | 1 - Docs y arquitectura |
| `docs/architecture/constitution/FORGE_CONSTITUTION_AMENDMENT_v1.1.md` | docs | `docs/architecture/constitution/FORGE_CONSTITUTION_AMENDMENT_v1.1.md` | BAJO | - | 1 - Docs y arquitectura |
| `docs/architecture/constitution/FORGE_CONSTITUTION_AMENDMENT_v1.3.md` | docs | `docs/architecture/constitution/FORGE_CONSTITUTION_AMENDMENT_v1.3.md` | BAJO | - | 1 - Docs y arquitectura |
| `docs/architecture/constitution/FORGE_CONSTITUTION_AMENDMENT_v1.4.md` | docs | `docs/architecture/constitution/FORGE_CONSTITUTION_AMENDMENT_v1.4.md` | BAJO | - | 1 - Docs y arquitectura |
| `docs/03-discovery/ANDREY_TERMINOLOGY_REVIEW_MIRANDA.md` | docs | `docs/03-discovery/ANDREY_TERMINOLOGY_REVIEW_MIRANDA.md` | BAJO | - | 1 - Docs y arquitectura |
| `docs/03-discovery/FORGE_DUAL_INTELLIGENCE_DISCOVERY_ANDREY_RUSSELL.md` | docs | `docs/03-discovery/FORGE_DUAL_INTELLIGENCE_DISCOVERY_ANDREY_RUSSELL.md` | BAJO | - | 1 - Docs y arquitectura |
| `docs/03-discovery/MANAGER_OS_CONSOLIDATION_REPORT.md` | docs | `docs/03-discovery/MANAGER_OS_CONSOLIDATION_REPORT.md` | BAJO | - | 1 - Docs y arquitectura |
| `docs/03-discovery/MANAGER_OS_OPEN_QUESTIONS.md` | docs | `docs/03-discovery/MANAGER_OS_OPEN_QUESTIONS.md` | BAJO | - | 1 - Docs y arquitectura |
| `docs/03-discovery/RUSSELL-001_IDENTITY_BASELINE_MODEL.md` | docs | `docs/03-discovery/RUSSELL-001_IDENTITY_BASELINE_MODEL.md` | BAJO | - | 1 - Docs y arquitectura |
| `docs/03-discovery/RUSSELL-002_IDENTITY_DRIFT_DETECTION.md` | docs | `docs/03-discovery/RUSSELL-002_IDENTITY_DRIFT_DETECTION.md` | BAJO | - | 1 - Docs y arquitectura |
| `docs/05-foundation/FORGE_RATIFICATION_AND_FOUNDATION_CLOSURE.md` | docs | `docs/05-foundation/FORGE_RATIFICATION_AND_FOUNDATION_CLOSURE.md` | BAJO | - | 1 - Docs y arquitectura |
| `docs/05-foundation/PAQ-07-FOUNDATION-LOCK-REVIEW.md` | docs | `docs/05-foundation/PAQ-07-FOUNDATION-LOCK-REVIEW.md` | BAJO | - | 1 - Docs y arquitectura |
| `docs/05-foundation/PAQ-08-FOUNDATION-LOCK-FINAL-REVIEW.md` | docs | `docs/05-foundation/PAQ-08-FOUNDATION-LOCK-FINAL-REVIEW.md` | BAJO | - | 1 - Docs y arquitectura |
| `docs/05-phase-transitions/FORGE_PHASE_TRANSITION_FOUNDATION_TO_INTELLIGENCE.md` | docs | `docs/05-phase-transitions/FORGE_PHASE_TRANSITION_FOUNDATION_TO_INTELLIGENCE.md` | BAJO | - | 1 - Docs y arquitectura |
| `docs/05-shared-commercial-model/FORGE_SHARED_COMMERCIAL_MODEL_EVIDENCE_PROVENANCE_FOUNDATION.md` | docs | `docs/05-shared-commercial-model/FORGE_SHARED_COMMERCIAL_MODEL_EVIDENCE_PROVENANCE_FOUNDATION.md` | BAJO | - | 1 - Docs y arquitectura |
| `docs/05-shared-commercial-model/FORGE_SHARED_COMMERCIAL_MODEL_IDENTITY_ATTRIBUTION_HARDENING.md` | docs | `docs/05-shared-commercial-model/FORGE_SHARED_COMMERCIAL_MODEL_IDENTITY_ATTRIBUTION_HARDENING.md` | BAJO | - | 1 - Docs y arquitectura |
| `docs/05-shared-commercial-model/FORGE_SHARED_COMMERCIAL_MODEL_PERIODS_OPERATIONAL_CLOCKS_HARDENING.md` | docs | `docs/05-shared-commercial-model/FORGE_SHARED_COMMERCIAL_MODEL_PERIODS_OPERATIONAL_CLOCKS_HARDENING.md` | BAJO | - | 1 - Docs y arquitectura |
| `docs/05-shared-commercial-model/PAQ-04-METRICS-OWNERSHIP-FINALIZATION.md` | docs | `docs/05-shared-commercial-model/PAQ-04-METRICS-OWNERSHIP-FINALIZATION.md` | BAJO | - | 1 - Docs y arquitectura |
| `docs/05-shared-commercial-model/PAQ-05-RULE-SNAPSHOT-HARDENING.md` | docs | `docs/05-shared-commercial-model/PAQ-05-RULE-SNAPSHOT-HARDENING.md` | BAJO | - | 1 - Docs y arquitectura |
| `docs/05-shared-commercial-model/PAQ-06-COMMERCIAL-EVENTS-TAXONOMY.md` | docs | `docs/05-shared-commercial-model/PAQ-06-COMMERCIAL-EVENTS-TAXONOMY.md` | BAJO | - | 1 - Docs y arquitectura |
| `docs/constitution/FORGE_CONSTITUTION_MAP.md` | docs | `docs/constitution/FORGE_CONSTITUTION_MAP.md` | BAJO | - | 1 - Docs y arquitectura |
| `docs/03-discovery/FD-0001_BETTER_DECISIONS_UNDER_UNCERTAINTY.md` | docs | `docs/03-discovery/FD-0001_BETTER_DECISIONS_UNDER_UNCERTAINTY.md` | BAJO | - | 1 - Docs y arquitectura |
| `docs/03-discovery/PROCESS_ADVANCEMENT_IMPLEMENTATION_READINESS.md` | docs | `docs/03-discovery/PROCESS_ADVANCEMENT_IMPLEMENTATION_READINESS.md` | BAJO | - | 1 - Docs y arquitectura |
| `docs/03-discovery/PROCESS_ADVANCEMENT_IMPLEMENTATION_READINESS_DISCOVERY.md` | docs | `docs/03-discovery/PROCESS_ADVANCEMENT_IMPLEMENTATION_READINESS_DISCOVERY.md` | BAJO | - | 1 - Docs y arquitectura |
| `docs/03-discovery/PROCESS_ADVANCEMENT_V01_POST_IMPLEMENTATION_REVIEW.md` | docs | `docs/03-discovery/PROCESS_ADVANCEMENT_V01_POST_IMPLEMENTATION_REVIEW.md` | BAJO | - | 1 - Docs y arquitectura |
| `document-classification-engine.js` | policy-operations | `policy-operations/document-classification-engine.js` | MEDIO | - | 6 - Policy operations |
| `dom-sanitizer.js` | legacy | `legacy/dom-sanitizer.js` | MEDIO | - | 11 - Legacy quarantine |
| `domain-events.js` | legacy | `legacy/domain-events.js` | MEDIO | - | 11 - Legacy quarantine |
| `domain-runtime.js` | platform | `platform/domain-runtime.js` | MEDIO | ./core-event-bus.js => core-event-bus.js<br>./domain-store.js => domain-store.js | 10 - Platform |
| `domain-store.js` | platform | `platform/domain-store.js` | MEDIO | - | 10 - Platform |
| `drag-drop-policy-zone.js` | policy-operations | `policy-operations/drag-drop-policy-zone.js` | BAJO | - | 6 - Policy operations |
| `dynamic-cash-value-projection-engine.js` | shared-intelligence | `shared-intelligence/dynamic-cash-value-projection-engine.js` | MEDIO | ./projection-engine.js => projection-engine.js<br>./projection-milestone-engine.js => projection-milestone-engine.js | 3 - Shared intelligence |
| `education-cost-master-test.js` | tests | `tests/education-cost-master-test.js` | MEDIO | ./segu-beca-education-comparison-engine => segu-beca-education-comparison-engine.js | 2 - Tests y fixtures |
| `education-paths-master-test.js` | tests | `tests/education-paths-master-test.js` | MEDIO | ./shared-education-paths-engine => shared-education-paths-engine.js | 2 - Tests y fixtures |
| `entity-resolver-engine.js` | legacy | `legacy/entity-resolver-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `error-boundary.js` | legacy | `legacy/error-boundary.js` | MEDIO | ./analytics-engine.js => analytics-engine.js | 11 - Legacy quarantine |
| `event-advisor-review-engine.js` | advisor-os | `advisor-os/event-advisor-review-engine.js` | MEDIO | ./next-best-question-engine.js => next-best-question-engine.js | 7 - Advisor OS |
| `event-advisor-review-smoke-test.js` | tests | `tests/event-advisor-review-smoke-test.js` | MEDIO | ./event-advisor-review-engine.js => event-advisor-review-engine.js | 2 - Tests y fixtures |
| `event-benefit-engine.js` | product-intelligence | `product-intelligence/event-benefit-engine.js` | MEDIO | - | 5 - Product intelligence |
| `event-bus-engine.js` | platform | `platform/event-bus-engine.js` | ALTO | - | 10 - Platform |
| `event-classification-engine.js` | legacy | `legacy/event-classification-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `event-classification-smoke-test.js` | tests | `tests/event-classification-smoke-test.js` | MEDIO | ./event-classification-engine.js => event-classification-engine.js | 2 - Tests y fixtures |
| `event-client-review-engine.js` | legacy | `legacy/event-client-review-engine.js` | MEDIO | ./next-best-question-engine.js => next-best-question-engine.js | 11 - Legacy quarantine |
| `event-client-review-smoke-test.js` | tests | `tests/event-client-review-smoke-test.js` | MEDIO | ./event-client-review-engine.js => event-client-review-engine.js | 2 - Tests y fixtures |
| `event-log-engine.js` | legacy | `legacy/event-log-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `event-system.js` | legacy | `legacy/event-system.js` | ALTO | - | 11 - Legacy quarantine |
| `evidence-collection-engine.js` | shared-intelligence | `shared-intelligence/evidence-collection-engine.js` | MEDIO | ./event-classification-engine.js => event-classification-engine.js | 3 - Shared intelligence |
| `evidence-collection-smoke-test.js` | tests | `tests/evidence-collection-smoke-test.js` | MEDIO | ./evidence-collection-engine.js => evidence-collection-engine.js | 2 - Tests y fixtures |
| `excel-parser-engine.js` | legacy | `legacy/excel-parser-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `exchange-rate-cache-engine.js` | shared-intelligence | `shared-intelligence/exchange-rate-cache-engine.js` | ALTO | ./shared-banxico-rate-engine => shared-banxico-rate-engine.js | 3 - Shared intelligence |
| `false-confidence-protection-engine.js` | legacy | `legacy/false-confidence-protection-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `false-confidence-smoke-test.js` | tests | `tests/false-confidence-smoke-test.js` | MEDIO | ./false-confidence-protection-engine.js => false-confidence-protection-engine.js | 2 - Tests y fixtures |
| `feature-flags.js` | legacy | `legacy/feature-flags.js` | MEDIO | - | 11 - Legacy quarantine |
| `field-confidence-engine.js` | legacy | `legacy/field-confidence-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `financial-pyramid-engine.js` | legacy | `legacy/financial-pyramid-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `financial-pyramid-priority-engine.js` | legacy | `legacy/financial-pyramid-priority-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `financial-pyramid-story-engine.js` | legacy | `legacy/financial-pyramid-story-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `financial-responsibility-engine.js` | legacy | `legacy/financial-responsibility-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `financial-responsibility-smoke-test.js` | tests | `tests/financial-responsibility-smoke-test.js` | MEDIO | ./financial-responsibility-engine.js => financial-responsibility-engine.js | 2 - Tests y fixtures |
| `financial-risk-score-engine.js` | legacy | `legacy/financial-risk-score-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `financial-story-task-builder.js` | policy-operations | `policy-operations/financial-story-task-builder.js` | BAJO | - | 6 - Policy operations |
| `financial-utils.js` | platform | `platform/financial-utils.js` | MEDIO | - | 10 - Platform |
| `first-contact-ai-suggestion-engine.js` | advisor-os | `advisor-os/first-contact-ai-suggestion-engine.js` | BAJO | - | 7 - Advisor OS |
| `first-contact-dashboard.viewmodel.js` | advisor-os | `advisor-os/first-contact-dashboard.viewmodel.js` | BAJO | - | 7 - Advisor OS |
| `first-contact-delivery-engine.js` | advisor-os | `advisor-os/first-contact-delivery-engine.js` | BAJO | - | 7 - Advisor OS |
| `first-contact-objections.constants.js` | advisor-os | `advisor-os/first-contact-objections.constants.js` | BAJO | - | 7 - Advisor OS |
| `first-contact-options-engine.js` | advisor-os | `advisor-os/first-contact-options-engine.js` | BAJO | - | 7 - Advisor OS |
| `first-contact-script-engine.js` | advisor-os | `advisor-os/first-contact-script-engine.js` | BAJO | - | 7 - Advisor OS |
| `first-contact-tone-engine.js` | advisor-os | `advisor-os/first-contact-tone-engine.js` | BAJO | - | 7 - Advisor OS |
| `first-contact.entity.js` | advisor-os | `advisor-os/first-contact.entity.js` | BAJO | - | 7 - Advisor OS |
| `fixture-validation-test.js` | tests | `tests/fixture-validation-test.js` | BAJO | - | 2 - Tests y fixtures |
| `fixtures/advisor-demo.json` | shared-intelligence/data-contracts | `fixtures/advisor-demo.json` | BAJO | - | 2 - Tests y fixtures |
| `fixtures/candidate-demo.json` | shared-intelligence/data-contracts | `fixtures/candidate-demo.json` | BAJO | - | 2 - Tests y fixtures |
| `fixtures/client-demo.json` | shared-intelligence/data-contracts | `fixtures/client-demo.json` | BAJO | - | 2 - Tests y fixtures |
| `fixtures/manager-report-demo.json` | shared-intelligence/data-contracts | `fixtures/manager-report-demo.json` | BAJO | - | 2 - Tests y fixtures |
| `fixtures/nash-decision-demo.json` | shared-intelligence/data-contracts | `fixtures/nash-decision-demo.json` | BAJO | - | 2 - Tests y fixtures |
| `fixtures/policy-demo.json` | shared-intelligence/data-contracts | `fixtures/policy-demo.json` | BAJO | - | 2 - Tests y fixtures |
| `fixtures/precontract-demo.json` | shared-intelligence/data-contracts | `fixtures/precontract-demo.json` | BAJO | - | 2 - Tests y fixtures |
| `fixtures/prospect-demo.json` | shared-intelligence/data-contracts | `fixtures/prospect-demo.json` | BAJO | - | 2 - Tests y fixtures |
| `fixtures/recruitment/advisor-conversion-success.json` | shared-intelligence/data-contracts | `fixtures/recruitment/advisor-conversion-success.json` | BAJO | - | 2 - Tests y fixtures |
| `fixtures/recruitment/evidence/interview-evidence-strong-candidate.json` | shared-intelligence/data-contracts | `fixtures/recruitment/evidence/interview-evidence-strong-candidate.json` | BAJO | - | 2 - Tests y fixtures |
| `fixtures/recruitment/evidence/interview-evidence-weak-candidate.json` | shared-intelligence/data-contracts | `fixtures/recruitment/evidence/interview-evidence-weak-candidate.json` | BAJO | - | 2 - Tests y fixtures |
| `fixtures/recruitment/evidence/market-evidence-strong.json` | shared-intelligence/data-contracts | `fixtures/recruitment/evidence/market-evidence-strong.json` | BAJO | - | 2 - Tests y fixtures |
| `fixtures/recruitment/evidence/market-evidence-weak.json` | shared-intelligence/data-contracts | `fixtures/recruitment/evidence/market-evidence-weak.json` | BAJO | - | 2 - Tests y fixtures |
| `fixtures/recruitment/evidence/precontract-activity-high.json` | shared-intelligence/data-contracts | `fixtures/recruitment/evidence/precontract-activity-high.json` | BAJO | - | 2 - Tests y fixtures |
| `fixtures/recruitment/evidence/precontract-activity-low.json` | shared-intelligence/data-contracts | `fixtures/recruitment/evidence/precontract-activity-low.json` | BAJO | - | 2 - Tests y fixtures |
| `fixtures/recruitment/evidence/project200-strong-market.json` | shared-intelligence/data-contracts | `fixtures/recruitment/evidence/project200-strong-market.json` | BAJO | - | 2 - Tests y fixtures |
| `fixtures/recruitment/evidence/project200-weak-market.json` | shared-intelligence/data-contracts | `fixtures/recruitment/evidence/project200-weak-market.json` | BAJO | - | 2 - Tests y fixtures |
| `fixtures/recruitment/evidence/question-evidence-strong-candidate.json` | shared-intelligence/data-contracts | `fixtures/recruitment/evidence/question-evidence-strong-candidate.json` | BAJO | - | 2 - Tests y fixtures |
| `fixtures/recruitment/evidence/question-evidence-weak-candidate.json` | shared-intelligence/data-contracts | `fixtures/recruitment/evidence/question-evidence-weak-candidate.json` | BAJO | - | 2 - Tests y fixtures |
| `fixtures/recruitment/evidence/rda-strong-market.json` | shared-intelligence/data-contracts | `fixtures/recruitment/evidence/rda-strong-market.json` | BAJO | - | 2 - Tests y fixtures |
| `fixtures/recruitment/evidence/rda-weak-market.json` | shared-intelligence/data-contracts | `fixtures/recruitment/evidence/rda-weak-market.json` | BAJO | - | 2 - Tests y fixtures |
| `fixtures/recruitment/office-rules-config-light.json` | shared-intelligence/data-contracts | `fixtures/recruitment/office-rules-config-light.json` | BAJO | - | 2 - Tests y fixtures |
| `fixtures/recruitment/office-rules-config-standard.json` | shared-intelligence/data-contracts | `fixtures/recruitment/office-rules-config-standard.json` | BAJO | - | 2 - Tests y fixtures |
| `fixtures/recruitment/office-rules-config-strict.json` | shared-intelligence/data-contracts | `fixtures/recruitment/office-rules-config-strict.json` | BAJO | - | 2 - Tests y fixtures |
| `fixtures/recruitment/organization-profile-demo.json` | shared-intelligence/data-contracts | `fixtures/recruitment/organization-profile-demo.json` | BAJO | - | 2 - Tests y fixtures |
| `fixtures/recruitment/precontract-cycle-active.json` | shared-intelligence/data-contracts | `fixtures/recruitment/precontract-cycle-active.json` | BAJO | - | 2 - Tests y fixtures |
| `fixtures/recruitment/precontract-cycle-expired.json` | shared-intelligence/data-contracts | `fixtures/recruitment/precontract-cycle-expired.json` | BAJO | - | 2 - Tests y fixtures |
| `fixtures/recruitment/precontract-cycle-reactivated.json` | shared-intelligence/data-contracts | `fixtures/recruitment/precontract-cycle-reactivated.json` | BAJO | - | 2 - Tests y fixtures |
| `fixtures/recruitment/recruit-identity-demo.json` | shared-intelligence/data-contracts | `fixtures/recruitment/recruit-identity-demo.json` | BAJO | - | 2 - Tests y fixtures |
| `fixtures/recruitment/recruitment-application-first-attempt.json` | shared-intelligence/data-contracts | `fixtures/recruitment/recruitment-application-first-attempt.json` | BAJO | - | 2 - Tests y fixtures |
| `fixtures/recruitment/recruitment-application-manager-change.json` | shared-intelligence/data-contracts | `fixtures/recruitment/recruitment-application-manager-change.json` | BAJO | - | 2 - Tests y fixtures |
| `fixtures/recruitment/recruitment-application-office-change.json` | shared-intelligence/data-contracts | `fixtures/recruitment/recruitment-application-office-change.json` | BAJO | - | 2 - Tests y fixtures |
| `fixtures/recruitment/recruitment-application-reentry.json` | shared-intelligence/data-contracts | `fixtures/recruitment/recruitment-application-reentry.json` | BAJO | - | 2 - Tests y fixtures |
| `fixtures/recruitment/recruitment-lifecycle-full-demo.json` | shared-intelligence/data-contracts | `fixtures/recruitment/recruitment-lifecycle-full-demo.json` | BAJO | - | 2 - Tests y fixtures |
| `fixtures/relationship-demo.json` | shared-intelligence/data-contracts | `fixtures/relationship-demo.json` | BAJO | - | 2 - Tests y fixtures |
| `fixtures/relationship-report-demo.json` | shared-intelligence/data-contracts | `fixtures/relationship-report-demo.json` | BAJO | - | 2 - Tests y fixtures |
| `fixtures/vida-mujer-fixture.json` | shared-intelligence/data-contracts | `fixtures/vida-mujer-fixture.json` | BAJO | - | 2 - Tests y fixtures |
| `fixtures/vida-mujer-quote-fixture.json` | shared-intelligence/data-contracts | `fixtures/vida-mujer-quote-fixture.json` | BAJO | - | 2 - Tests y fixtures |
| `followup-engine.js` | advisor-os | `advisor-os/followup-engine.js` | BAJO | - | 7 - Advisor OS |
| `followup-message-context-engine.js` | advisor-os | `advisor-os/followup-message-context-engine.js` | BAJO | - | 7 - Advisor OS |
| `followup-next-date-engine.js` | advisor-os | `advisor-os/followup-next-date-engine.js` | BAJO | - | 7 - Advisor OS |
| `followup-overdue-engine.js` | advisor-os | `advisor-os/followup-overdue-engine.js` | BAJO | - | 7 - Advisor OS |
| `followup-priority-engine.js` | advisor-os | `advisor-os/followup-priority-engine.js` | BAJO | - | 7 - Advisor OS |
| `followup-recommendation-engine.js` | advisor-os | `advisor-os/followup-recommendation-engine.js` | BAJO | - | 7 - Advisor OS |
| `followup-reminder-engine.js` | advisor-os | `advisor-os/followup-reminder-engine.js` | BAJO | - | 7 - Advisor OS |
| `followup-type.constants.js` | advisor-os | `advisor-os/followup-type.constants.js` | BAJO | - | 7 - Advisor OS |
| `followup.entity.js` | advisor-os | `advisor-os/followup.entity.js` | BAJO | - | 7 - Advisor OS |
| `forge-ai-connector-master-test.js` | tests | `tests/forge-ai-connector-master-test.js` | MEDIO | ./forge-ai-prompt-builder => forge-ai-prompt-builder.js<br>./forge-ai-guardrails-engine => forge-ai-guardrails-engine.js<br>./forge-ai-connector => forge-ai-connector.js | 2 - Tests y fixtures |
| `forge-ai-connector.js` | legacy | `legacy/forge-ai-connector.js` | MEDIO | ./forge-ai-prompt-builder => forge-ai-prompt-builder.js<br>./forge-ai-guardrails-engine => forge-ai-guardrails-engine.js | 11 - Legacy quarantine |
| `forge-ai-guardrails-engine.js` | legacy | `legacy/forge-ai-guardrails-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `forge-ai-prompt-builder.js` | legacy | `legacy/forge-ai-prompt-builder.js` | MEDIO | ./forge-ai-guardrails-engine => forge-ai-guardrails-engine.js | 11 - Legacy quarantine |
| `forge-build-tree-status.js` | legacy | `legacy/forge-build-tree-status.js` | MEDIO | - | 11 - Legacy quarantine |
| `forge-global-master-test.js` | tests | `tests/forge-global-master-test.js` | BAJO | - | 2 - Tests y fixtures |
| `forge-gmm-real-case-smoke-test.js` | tests | `tests/forge-gmm-real-case-smoke-test.js` | MEDIO | ./document-classification-engine.js => document-classification-engine.js<br>./gmm-quote-summary-engine.js => gmm-quote-summary-engine.js<br>./gmm-policy-caratula-summary-engine.js => gmm-policy-caratula-summary-engine.js | 2 - Tests y fixtures |
| `forge-gmm-sprint-2-smoke-test.js` | tests | `tests/forge-gmm-sprint-2-smoke-test.js` | MEDIO | ./gmm-quote-summary-engine.js => gmm-quote-summary-engine.js<br>./gmm-policy-caratula-summary-engine.js => gmm-policy-caratula-summary-engine.js<br>./quote-to-policy-comparison-engine.js => quote-to-policy-comparison-engine.js | 2 - Tests y fixtures |
| `forge-gmm-sprint-3-smoke-test.js` | tests | `tests/forge-gmm-sprint-3-smoke-test.js` | MEDIO | ./gmm-quote-summary-engine.js => gmm-quote-summary-engine.js<br>./gmm-policy-caratula-summary-engine.js => gmm-policy-caratula-summary-engine.js<br>./quote-to-policy-comparison-engine.js => quote-to-policy-comparison-engine.js<br>./gmm-advisor-review-engine.js => gmm-advisor-review-engine.js | 2 - Tests y fixtures |
| `forge-gmm-sprint-4-smoke-test.js` | tests | `tests/forge-gmm-sprint-4-smoke-test.js` | MEDIO | ./gmm-quote-summary-engine.js => gmm-quote-summary-engine.js<br>./gmm-policy-caratula-summary-engine.js => gmm-policy-caratula-summary-engine.js<br>./quote-to-policy-comparison-engine.js => quote-to-policy-comparison-engine.js<br>./gmm-advisor-review-engine.js => gmm-advisor-review-engine.js<br>./gmm-client-review-engine.js => gmm-client-review-engine.js | 2 - Tests y fixtures |
| `forge-imagina-ser-client-presentation-test.js` | tests | `tests/forge-imagina-ser-client-presentation-test.js` | ALTO | ./imagina-ser-ocr-extractor => imagina-ser-ocr-extractor.js<br>./imagina-ser-retirement-fund-engine => imagina-ser-retirement-fund-engine.js<br>./imagina-ser-scenario-engine => imagina-ser-scenario-engine.js<br>./imagina-ser-variant-engine => imagina-ser-variant-engine.js<br>./imagina-ser-fiscal-router-engine => imagina-ser-fiscal-router-engine.js<br>./shared-tax-profile-engine => shared-tax-profile-engine.js<br>... +4 | 2 - Tests y fixtures |
| `forge-master-acceptance-test.js` | tests | `tests/forge-master-acceptance-test.js` | BAJO | - | 2 - Tests y fixtures |
| `forge-presentation-engine.js` | legacy | `legacy/forge-presentation-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `forge-rate-cache.json` | shared-intelligence | `shared-intelligence/forge-rate-cache.json` | BAJO | - | 3 - Shared intelligence |
| `forge-schema-reporter.js` | shared-intelligence | `shared-intelligence/forge-schema-reporter.js` | BAJO | - | 3 - Shared intelligence |
| `forge-semantic-risk-report.js` | legacy | `legacy/forge-semantic-risk-report.js` | MEDIO | - | 11 - Legacy quarantine |
| `forge-shared-ave-master-test.js` | tests | `tests/forge-shared-ave-master-test.js` | ALTO | ./shared-ave-growth-engine => shared-ave-growth-engine.js<br>./shared-ave-rescue-engine => shared-ave-rescue-engine.js<br>./shared-ave-death-benefit-engine => shared-ave-death-benefit-engine.js<br>./shared-ave-type-inference-engine => shared-ave-type-inference-engine.js<br>./shared-ave-portfolio-engine => shared-ave-portfolio-engine.js<br>./shared-ave-confidence-engine => shared-ave-confidence-engine.js<br>... +1 | 2 - Tests y fixtures |
| `forge-vida-mujer-advisor-report.js` | product-intelligence | `product-intelligence/forge-vida-mujer-advisor-report.js` | MEDIO | ./vida-mujer-knowledge-extractor => vida-mujer-knowledge-extractor.js<br>./forge-presentation-engine => forge-presentation-engine.js | 5 - Product intelligence |
| `future-currency-value-engine.js` | shared-intelligence | `shared-intelligence/future-currency-value-engine.js` | MEDIO | - | 3 - Shared intelligence |
| `ghosting-prompt-builder.js` | advisor-os | `advisor-os/ghosting-prompt-builder.js` | BAJO | - | 7 - Advisor OS |
| `ghosting-status-engine.js` | advisor-os | `advisor-os/ghosting-status-engine.js` | BAJO | - | 7 - Advisor OS |
| `gmm-advisor-review-engine.js` | product-intelligence | `product-intelligence/gmm-advisor-review-engine.js` | MEDIO | - | 5 - Product intelligence |
| `gmm-client-review-engine.js` | product-intelligence | `product-intelligence/gmm-client-review-engine.js` | MEDIO | - | 5 - Product intelligence |
| `gmm-out-of-pocket-engine.js` | product-intelligence | `product-intelligence/gmm-out-of-pocket-engine.js` | MEDIO | - | 5 - Product intelligence |
| `gmm-policy-caratula-summary-engine.js` | product-intelligence | `product-intelligence/gmm-policy-caratula-summary-engine.js` | MEDIO | - | 5 - Product intelligence |
| `gmm-quote-parser.js` | product-intelligence | `product-intelligence/gmm-quote-parser.js` | MEDIO | - | 5 - Product intelligence |
| `gmm-quote-summary-engine.js` | product-intelligence | `product-intelligence/gmm-quote-summary-engine.js` | MEDIO | - | 5 - Product intelligence |
| `google-calendar-engine.js` | legacy | `legacy/google-calendar-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `health-runtime.js` | platform | `platform/health-runtime.js` | MEDIO | ./telemetry.js => telemetry.js | 10 - Platform |
| `hospitalization-intelligence-engine.js` | product-intelligence | `product-intelligence/hospitalization-intelligence-engine.js` | MEDIO | - | 5 - Product intelligence |
| `hospitalization-smoke-test.js` | tests | `tests/hospitalization-smoke-test.js` | MEDIO | ./hospitalization-intelligence-engine.js => hospitalization-intelligence-engine.js | 2 - Tests y fixtures |
| `hot-market-engine.js` | legacy | `legacy/hot-market-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `human-review-routing-engine.js` | legacy | `legacy/human-review-routing-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `human-review-routing-smoke-test.js` | tests | `tests/human-review-routing-smoke-test.js` | MEDIO | ./human-review-routing-engine.js => human-review-routing-engine.js | 2 - Tests y fixtures |
| `idle-runtime.js` | platform | `platform/idle-runtime.js` | ALTO | - | 10 - Platform |
| `imagina-ser-advisor-analysis-engine.js` | product-intelligence | `product-intelligence/imagina-ser-advisor-analysis-engine.js` | MEDIO | - | 5 - Product intelligence |
| `imagina-ser-article-151-engine.js` | product-intelligence | `product-intelligence/imagina-ser-article-151-engine.js` | MEDIO | - | 5 - Product intelligence |
| `imagina-ser-article-185-engine.js` | product-intelligence | `product-intelligence/imagina-ser-article-185-engine.js` | MEDIO | - | 5 - Product intelligence |
| `imagina-ser-banxico-integration-test.js` | tests | `tests/imagina-ser-banxico-integration-test.js` | MEDIO | ./exchange-rate-cache-engine => exchange-rate-cache-engine.js<br>./imagina-ser-decision-engine => imagina-ser-decision-engine.js<br>./imagina-ser-client-presentation-engine => imagina-ser-client-presentation-engine.js<br>./imagina-ser-ocr-extractor => imagina-ser-ocr-extractor.js<br>./retirement-presentation-scenario-engine.js => retirement-presentation-scenario-engine.js | 2 - Tests y fixtures |
| `imagina-ser-client-presentation-engine.js` | product-intelligence | `product-intelligence/imagina-ser-client-presentation-engine.js` | MEDIO | ./imagina-ser-human-language-engine => imagina-ser-human-language-engine.js | 5 - Product intelligence |
| `imagina-ser-contribution-engine.js` | product-intelligence | `product-intelligence/imagina-ser-contribution-engine.js` | BAJO | - | 5 - Product intelligence |
| `imagina-ser-decision-engine.js` | product-intelligence | `product-intelligence/imagina-ser-decision-engine.js` | MEDIO | - | 5 - Product intelligence |
| `imagina-ser-fiscal-bag-engine.js` | product-intelligence | `product-intelligence/imagina-ser-fiscal-bag-engine.js` | MEDIO | - | 5 - Product intelligence |
| `imagina-ser-fiscal-master-test.js` | tests | `tests/imagina-ser-fiscal-master-test.js` | MEDIO | ./shared-tax-profile-engine => shared-tax-profile-engine.js<br>./imagina-ser-article-151-engine => imagina-ser-article-151-engine.js<br>./imagina-ser-happy-numbers-engine => imagina-ser-happy-numbers-engine.js<br>./imagina-ser-fiscal-slide-engine => imagina-ser-fiscal-slide-engine.js | 2 - Tests y fixtures |
| `imagina-ser-fiscal-router-engine.js` | product-intelligence | `product-intelligence/imagina-ser-fiscal-router-engine.js` | MEDIO | ./imagina-ser-fiscal-bag-engine => imagina-ser-fiscal-bag-engine.js<br>./imagina-ser-article-151-engine => imagina-ser-article-151-engine.js<br>./imagina-ser-article-185-engine => imagina-ser-article-185-engine.js | 5 - Product intelligence |
| `imagina-ser-fiscal-slide-engine.js` | product-intelligence | `product-intelligence/imagina-ser-fiscal-slide-engine.js` | MEDIO | - | 5 - Product intelligence |
| `imagina-ser-future-mxn-bridge.js` | product-intelligence | `product-intelligence/imagina-ser-future-mxn-bridge.js` | MEDIO | ./retirement-future-udi-projection-engine => retirement-future-udi-projection-engine.js | 5 - Product intelligence |
| `imagina-ser-happy-numbers-engine.js` | product-intelligence | `product-intelligence/imagina-ser-happy-numbers-engine.js` | MEDIO | - | 5 - Product intelligence |
| `imagina-ser-human-language-engine.js` | product-intelligence | `product-intelligence/imagina-ser-human-language-engine.js` | MEDIO | - | 5 - Product intelligence |
| `imagina-ser-master-test.js` | tests | `tests/imagina-ser-master-test.js` | ALTO | ./imagina-ser-ocr-extractor => imagina-ser-ocr-extractor.js<br>./imagina-ser-retirement-fund-engine => imagina-ser-retirement-fund-engine.js<br>./imagina-ser-scenario-engine => imagina-ser-scenario-engine.js<br>./imagina-ser-decision-engine => imagina-ser-decision-engine.js<br>./imagina-ser-objection-engine => imagina-ser-objection-engine.js<br>./imagina-ser-client-presentation-engine => imagina-ser-client-presentation-engine.js<br>... +3 | 2 - Tests y fixtures |
| `imagina-ser-objection-engine.js` | product-intelligence | `product-intelligence/imagina-ser-objection-engine.js` | MEDIO | - | 5 - Product intelligence |
| `imagina-ser-ocr-extractor.js` | product-intelligence | `product-intelligence/imagina-ser-ocr-extractor.js` | MEDIO | ./shared-document-priority-engine => shared-document-priority-engine.js | 5 - Product intelligence |
| `imagina-ser-presentation-prompt-engine.js` | product-intelligence | `product-intelligence/imagina-ser-presentation-prompt-engine.js` | MEDIO | - | 5 - Product intelligence |
| `imagina-ser-real-quote-validation.js` | product-intelligence | `product-intelligence/imagina-ser-real-quote-validation.js` | MEDIO | ./imagina-ser-ocr-extractor => imagina-ser-ocr-extractor.js | 5 - Product intelligence |
| `imagina-ser-retirement-fund-engine.js` | product-intelligence | `product-intelligence/imagina-ser-retirement-fund-engine.js` | MEDIO | - | 5 - Product intelligence |
| `imagina-ser-scenario-engine.js` | product-intelligence | `product-intelligence/imagina-ser-scenario-engine.js` | MEDIO | - | 5 - Product intelligence |
| `imagina-ser-variant-engine.js` | product-intelligence | `product-intelligence/imagina-ser-variant-engine.js` | MEDIO | - | 5 - Product intelligence |
| `imagina-ser-variant-fiscal-master-test.js` | tests | `tests/imagina-ser-variant-fiscal-master-test.js` | MEDIO | ./imagina-ser-variant-engine => imagina-ser-variant-engine.js<br>./imagina-ser-fiscal-bag-engine => imagina-ser-fiscal-bag-engine.js<br>./imagina-ser-fiscal-router-engine => imagina-ser-fiscal-router-engine.js | 2 - Tests y fixtures |
| `import-progress-engine.js` | policy-operations | `policy-operations/import-progress-engine.js` | BAJO | - | 6 - Policy operations |
| `in-app-notification-engine.js` | platform | `platform/in-app-notification-engine.js` | ALTO | - | 10 - Platform |
| `interview-evidence-fixture-test.js` | tests | `tests/interview-evidence-fixture-test.js` | BAJO | - | 2 - Tests y fixtures |
| `introduction-message-engine.js` | legacy | `legacy/introduction-message-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `lead-temperature-engine.js` | legacy | `legacy/lead-temperature-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `life-event-engine.js` | advisor-os | `advisor-os/life-event-engine.js` | MEDIO | ./nash-memory-engine => nash-memory-engine.js<br>./relationship-timeline-engine => relationship-timeline-engine.js<br>./relationship-opportunity-engine => relationship-opportunity-engine.js | 7 - Advisor OS |
| `life-event-master-test.js` | tests | `tests/life-event-master-test.js` | MEDIO | ./life-event-engine => life-event-engine.js | 2 - Tests y fixtures |
| `life-expectancy-projection-engine.js` | shared-intelligence | `shared-intelligence/life-expectancy-projection-engine.js` | BAJO | - | 3 - Shared intelligence |
| `line-of-business-engine.js` | policy-operations | `policy-operations/line-of-business-engine.js` | BAJO | - | 6 - Policy operations |
| `live-communication-engine.js` | legacy | `legacy/live-communication-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `live-dashboard-engine.js` | platform | `platform/live-dashboard-engine.js` | ALTO | - | 10 - Platform |
| `live-notification-engine.js` | platform | `platform/live-notification-engine.js` | ALTO | - | 10 - Platform |
| `live-operational-state-engine.js` | policy-operations | `policy-operations/live-operational-state-engine.js` | BAJO | - | 6 - Policy operations |
| `logger.js` | platform | `platform/logger.js` | MEDIO | - | 10 - Platform |
| `manager-alert-engine.js` | manager-os | `manager-os/manager-alert-engine.js` | BAJO | - | 8 - Manager OS |
| `manager-broadcast-engine.js` | manager-os | `manager-os/manager-broadcast-engine.js` | BAJO | - | 8 - Manager OS |
| `manager-coaching-engine.js` | manager-os | `manager-os/manager-coaching-engine.js` | BAJO | - | 8 - Manager OS |
| `manager-feed-engine.js` | manager-os | `manager-os/manager-feed-engine.js` | BAJO | - | 8 - Manager OS |
| `manager-notification-engine.js` | manager-os | `manager-os/manager-notification-engine.js` | BAJO | - | 8 - Manager OS |
| `manager-role-engine.js` | manager-os | `manager-os/manager-role-engine.js` | BAJO | - | 8 - Manager OS |
| `manifest.json` | platform | `manifest.json` | NO_MOVER | - | 0 - No mover |
| `market-data-master-test.js` | tests | `tests/market-data-master-test.js` | MEDIO | ./exchange-rate-cache-engine => exchange-rate-cache-engine.js<br>./shared-currency-projection-engine => shared-currency-projection-engine.js | 2 - Tests y fixtures |
| `market-evidence-fixture-test.js` | tests | `tests/market-evidence-fixture-test.js` | BAJO | - | 2 - Tests y fixtures |
| `mass-import-mapping-engine.js` | policy-operations | `policy-operations/mass-import-mapping-engine.js` | MEDIO | ./smart-field-detection-engine.js => smart-field-detection-engine.js | 6 - Policy operations |
| `mass-import-preview-engine.js` | policy-operations | `policy-operations/mass-import-preview-engine.js` | BAJO | - | 6 - Policy operations |
| `mass-import-validation-engine.js` | policy-operations | `policy-operations/mass-import-validation-engine.js` | BAJO | - | 6 - Policy operations |
| `maternity-intelligence-engine.js` | product-intelligence | `product-intelligence/maternity-intelligence-engine.js` | MEDIO | - | 5 - Product intelligence |
| `maternity-smoke-test.js` | tests | `tests/maternity-smoke-test.js` | MEDIO | ./maternity-intelligence-engine.js => maternity-intelligence-engine.js | 2 - Tests y fixtures |
| `memory-manager.js` | manager-os | `manager-os/memory-manager.js` | MEDIO | - | 8 - Manager OS |
| `module-lifecycle.js` | legacy | `legacy/module-lifecycle.js` | MEDIO | ./memory-manager.js => memory-manager.js | 11 - Legacy quarantine |
| `momentum-engine.js` | legacy | `legacy/momentum-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `monthly-revenue-engine.js` | legacy | `legacy/monthly-revenue-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `motion-principles.js` | legacy | `legacy/motion-principles.js` | MEDIO | - | 11 - Legacy quarantine |
| `multi-label-event-engine.js` | legacy | `legacy/multi-label-event-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `multi-label-event-smoke-test.js` | tests | `tests/multi-label-event-smoke-test.js` | MEDIO | ./multi-label-event-engine.js => multi-label-event-engine.js | 2 - Tests y fixtures |
| `mutation-engine.js` | platform | `platform/mutation-engine.js` | MEDIO | ./store.js => store.js<br>./sync-engine.js => sync-engine.js | 10 - Platform |
| `nano-banana-icon-system-prompt.js` | legacy | `legacy/nano-banana-icon-system-prompt.js` | MEDIO | - | 11 - Legacy quarantine |
| `nash-advisor-performance-engine.js` | advisor-os | `advisor-os/nash-advisor-performance-engine.js` | MEDIO | ./nash-learning-engine => nash-learning-engine.js | 7 - Advisor OS |
| `nash-advisor-performance-master-test.js` | tests | `tests/nash-advisor-performance-master-test.js` | MEDIO | ./nash-advisor-performance-engine => nash-advisor-performance-engine.js | 2 - Tests y fixtures |
| `nash-coaching-insight-engine.js` | manager-os | `manager-os/nash-coaching-insight-engine.js` | MEDIO | - | 8 - Manager OS |
| `nash-coaching-insight-master-test.js` | tests | `tests/nash-coaching-insight-master-test.js` | MEDIO | ./nash-coaching-insight-engine => nash-coaching-insight-engine.js | 2 - Tests y fixtures |
| `nash-combat-intelligence-report-engine.js` | advisor-os | `advisor-os/nash-combat-intelligence-report-engine.js` | MEDIO | ./nash-combat-orchestrator => nash-combat-orchestrator.js<br>./nash-intent-engine => nash-intent-engine.js<br>./nash-next-best-action-engine => nash-next-best-action-engine.js | 7 - Advisor OS |
| `nash-combat-intelligence-report-test.js` | tests | `tests/nash-combat-intelligence-report-test.js` | MEDIO | ./nash-combat-intelligence-report-engine => nash-combat-intelligence-report-engine.js | 2 - Tests y fixtures |
| `nash-combat-master-test.js` | tests | `tests/nash-combat-master-test.js` | MEDIO | ./nash-combat-orchestrator => nash-combat-orchestrator.js | 2 - Tests y fixtures |
| `nash-combat-orchestrator.js` | advisor-os | `advisor-os/nash-combat-orchestrator.js` | MEDIO | - | 7 - Advisor OS |
| `nash-core-engine.js` | advisor-os | `advisor-os/nash-core-engine.js` | ALTO | ./nash-prospect-context-builder => nash-prospect-context-builder.js<br>./nash-council-orchestrator => nash-council-orchestrator.js<br>./nash-message-recommendation-engine => nash-message-recommendation-engine.js<br>./nash-personality-engine => nash-personality-engine.js<br>./nash-followup-engine => nash-followup-engine.js<br>./nash-next-best-action-engine => nash-next-best-action-engine.js<br>... +1 | 7 - Advisor OS |
| `nash-council-orchestrator.js` | advisor-os | `advisor-os/nash-council-orchestrator.js` | MEDIO | - | 7 - Advisor OS |
| `nash-followup-engine.js` | advisor-os | `advisor-os/nash-followup-engine.js` | MEDIO | - | 7 - Advisor OS |
| `nash-integration-master-test.js` | tests | `tests/nash-integration-master-test.js` | MEDIO | ./nash-core-engine => nash-core-engine.js | 2 - Tests y fixtures |
| `nash-intent-engine.js` | advisor-os | `advisor-os/nash-intent-engine.js` | MEDIO | - | 7 - Advisor OS |
| `nash-intent-master-test.js` | tests | `tests/nash-intent-master-test.js` | MEDIO | ./nash-intent-engine => nash-intent-engine.js | 2 - Tests y fixtures |
| `nash-learning-engine.js` | advisor-os | `advisor-os/nash-learning-engine.js` | MEDIO | - | 7 - Advisor OS |
| `nash-learning-master-test.js` | tests | `tests/nash-learning-master-test.js` | MEDIO | ./nash-learning-engine => nash-learning-engine.js | 2 - Tests y fixtures |
| `nash-manager-alert-engine.js` | manager-os | `manager-os/nash-manager-alert-engine.js` | MEDIO | - | 8 - Manager OS |
| `nash-manager-alert-master-test.js` | tests | `tests/nash-manager-alert-master-test.js` | MEDIO | ./nash-manager-alert-engine => nash-manager-alert-engine.js | 2 - Tests y fixtures |
| `nash-master-acceptance-test.js` | tests | `tests/nash-master-acceptance-test.js` | ALTO | ./nash-prospect-context-builder => nash-prospect-context-builder.js<br>./nash-personality-engine => nash-personality-engine.js<br>./nash-intent-engine => nash-intent-engine.js<br>./nash-combat-orchestrator => nash-combat-orchestrator.js<br>./nash-memory-engine => nash-memory-engine.js<br>./nash-learning-engine => nash-learning-engine.js<br>... +6 | 2 - Tests y fixtures |
| `nash-master-intelligence-engine.js` | advisor-os | `advisor-os/nash-master-intelligence-engine.js` | ALTO | ./nash-prospect-context-builder => nash-prospect-context-builder.js<br>./nash-personality-engine => nash-personality-engine.js<br>./nash-intent-engine => nash-intent-engine.js<br>./nash-memory-engine => nash-memory-engine.js<br>./nash-learning-engine => nash-learning-engine.js<br>./nash-combat-intelligence-report-engine => nash-combat-intelligence-report-engine.js<br>... +4 | 7 - Advisor OS |
| `nash-master-intelligence-master-test.js` | tests | `tests/nash-master-intelligence-master-test.js` | MEDIO | ./nash-master-intelligence-engine => nash-master-intelligence-engine.js | 2 - Tests y fixtures |
| `nash-master-test.js` | tests | `tests/nash-master-test.js` | MEDIO | ./nash-core-engine => nash-core-engine.js | 2 - Tests y fixtures |
| `nash-memory-engine.js` | advisor-os | `advisor-os/nash-memory-engine.js` | MEDIO | - | 7 - Advisor OS |
| `nash-memory-master-test.js` | tests | `tests/nash-memory-master-test.js` | MEDIO | ./nash-memory-engine => nash-memory-engine.js | 2 - Tests y fixtures |
| `nash-memory/maria_acceptance_001.json` | shared-intelligence/data-contracts | `nash-memory/maria_acceptance_001.json` | BAJO | - | 2 - Tests y fixtures |
| `nash-memory/maria_test_001.json` | shared-intelligence/data-contracts | `nash-memory/maria_test_001.json` | BAJO | - | 2 - Tests y fixtures |
| `nash-message-recommendation-engine.js` | advisor-os | `advisor-os/nash-message-recommendation-engine.js` | MEDIO | - | 7 - Advisor OS |
| `nash-next-best-action-engine.js` | advisor-os | `advisor-os/nash-next-best-action-engine.js` | MEDIO | - | 7 - Advisor OS |
| `nash-next-best-action-master-test.js` | tests | `tests/nash-next-best-action-master-test.js` | MEDIO | ./nash-next-best-action-engine => nash-next-best-action-engine.js | 2 - Tests y fixtures |
| `nash-personality-engine.js` | advisor-os | `advisor-os/nash-personality-engine.js` | MEDIO | - | 7 - Advisor OS |
| `nash-personality-master-test.js` | tests | `tests/nash-personality-master-test.js` | MEDIO | ./nash-personality-engine => nash-personality-engine.js | 2 - Tests y fixtures |
| `nash-prospect-context-builder.js` | advisor-os | `advisor-os/nash-prospect-context-builder.js` | MEDIO | - | 7 - Advisor OS |
| `nash-team-intelligence-engine.js` | manager-os | `manager-os/nash-team-intelligence-engine.js` | MEDIO | - | 8 - Manager OS |
| `nash-team-intelligence-master-test.js` | tests | `tests/nash-team-intelligence-master-test.js` | MEDIO | ./nash-team-intelligence-engine => nash-team-intelligence-engine.js | 2 - Tests y fixtures |
| `nash-v03-master-test.js` | tests | `tests/nash-v03-master-test.js` | MEDIO | ./nash-core-engine => nash-core-engine.js | 2 - Tests y fixtures |
| `nash-v04-master-test.js` | tests | `tests/nash-v04-master-test.js` | MEDIO | ./nash-core-engine => nash-core-engine.js | 2 - Tests y fixtures |
| `needs-discovery-engine.js` | advisor-os | `advisor-os/needs-discovery-engine.js` | BAJO | - | 7 - Advisor OS |
| `network-manager.js` | manager-os | `manager-os/network-manager.js` | MEDIO | ./event-system.js => event-system.js<br>./state-manager.js => state-manager.js | 8 - Manager OS |
| `next-best-question-engine.js` | legacy | `legacy/next-best-question-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `next-best-question-smoke-test.js` | tests | `tests/next-best-question-smoke-test.js` | MEDIO | ./next-best-question-engine.js => next-best-question-engine.js | 2 - Tests y fixtures |
| `notification-orchestrator.js` | platform | `platform/notification-orchestrator.js` | ALTO | - | 10 - Platform |
| `notification-priority-engine.js` | platform | `platform/notification-priority-engine.js` | ALTO | - | 10 - Platform |
| `notification-queue-engine.js` | platform | `platform/notification-queue-engine.js` | ALTO | - | 10 - Platform |
| `objection-battle-engine.js` | advisor-os | `advisor-os/objection-battle-engine.js` | BAJO | - | 7 - Advisor OS |
| `objection-classifier-engine.js` | advisor-os | `advisor-os/objection-classifier-engine.js` | BAJO | - | 7 - Advisor OS |
| `objection-intent-engine.js` | advisor-os | `advisor-os/objection-intent-engine.js` | BAJO | - | 7 - Advisor OS |
| `objection-memory-engine.js` | advisor-os | `advisor-os/objection-memory-engine.js` | BAJO | - | 7 - Advisor OS |
| `objection-prompt-builder.js` | advisor-os | `advisor-os/objection-prompt-builder.js` | BAJO | - | 7 - Advisor OS |
| `objection-resolution-engine.js` | advisor-os | `advisor-os/objection-resolution-engine.js` | BAJO | - | 7 - Advisor OS |
| `objection-response-strategy-engine.js` | advisor-os | `advisor-os/objection-response-strategy-engine.js` | BAJO | - | 7 - Advisor OS |
| `ocr-result-cache.js` | policy-operations | `policy-operations/ocr-result-cache.js` | BAJO | - | 6 - Policy operations |
| `offline-sync.js` | platform | `platform/offline-sync.js` | MEDIO | ./db.js => db.js<br>./network-manager.js => network-manager.js | 10 - Platform |
| `operational-colors.js` | policy-operations | `policy-operations/operational-colors.js` | BAJO | - | 6 - Policy operations |
| `operational-dashboard-engine.js` | policy-operations | `policy-operations/operational-dashboard-engine.js` | BAJO | - | 6 - Policy operations |
| `operational-feed-engine.js` | policy-operations | `policy-operations/operational-feed-engine.js` | BAJO | - | 6 - Policy operations |
| `operational-shell.store.ts` | policy-operations | `policy-operations/operational-shell.store.ts` | BAJO | - | 6 - Policy operations |
| `operational-sync-engine.js` | policy-operations | `policy-operations/operational-sync-engine.js` | BAJO | - | 6 - Policy operations |
| `opportunity-detector-engine.js` | legacy | `legacy/opportunity-detector-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `optimistic-mutation-runtime.js` | platform | `platform/optimistic-mutation-runtime.js` | ALTO | - | 10 - Platform |
| `optional-coverage-intelligence-engine.js` | product-intelligence | `product-intelligence/optional-coverage-intelligence-engine.js` | MEDIO | - | 5 - Product intelligence |
| `optional-coverage-smoke-test.js` | tests | `tests/optional-coverage-smoke-test.js` | MEDIO | ./optional-coverage-intelligence-engine.js => optional-coverage-intelligence-engine.js | 2 - Tests y fixtures |
| `organization-rules-fixture-validation-test.js` | tests | `tests/organization-rules-fixture-validation-test.js` | BAJO | - | 2 - Tests y fixtures |
| `orvi-client-presentation-engine.js` | product-intelligence | `product-intelligence/orvi-client-presentation-engine.js` | MEDIO | - | 5 - Product intelligence |
| `orvi-client-report-test.js` | tests | `tests/orvi-client-report-test.js` | ALTO | ./orvi-ocr-extractor => orvi-ocr-extractor.js<br>./orvi-guaranteed-value-timeline-engine => orvi-guaranteed-value-timeline-engine.js<br>./orvi-wait-vs-cancel-engine => orvi-wait-vs-cancel-engine.js<br>./exchange-rate-cache-engine => exchange-rate-cache-engine.js<br>./orvi-mxn-conversion-engine => orvi-mxn-conversion-engine.js<br>./orvi-client-presentation-engine => orvi-client-presentation-engine.js<br>... +1 | 2 - Tests y fixtures |
| `orvi-decision-engine.js` | product-intelligence | `product-intelligence/orvi-decision-engine.js` | MEDIO | - | 5 - Product intelligence |
| `orvi-event-engine.js` | product-intelligence | `product-intelligence/orvi-event-engine.js` | MEDIO | - | 5 - Product intelligence |
| `orvi-guaranteed-value-timeline-engine.js` | product-intelligence | `product-intelligence/orvi-guaranteed-value-timeline-engine.js` | MEDIO | - | 5 - Product intelligence |
| `orvi-master-test.js` | tests | `tests/orvi-master-test.js` | ALTO | ./orvi-ocr-extractor => orvi-ocr-extractor.js<br>./orvi-guaranteed-value-timeline-engine => orvi-guaranteed-value-timeline-engine.js<br>./orvi-wait-vs-cancel-engine => orvi-wait-vs-cancel-engine.js<br>./orvi-event-engine => orvi-event-engine.js<br>./orvi-decision-engine => orvi-decision-engine.js<br>./orvi-objection-engine => orvi-objection-engine.js | 2 - Tests y fixtures |
| `orvi-mxn-conversion-engine.js` | product-intelligence | `product-intelligence/orvi-mxn-conversion-engine.js` | MEDIO | ./shared-currency-projection-engine => shared-currency-projection-engine.js | 5 - Product intelligence |
| `orvi-mxn-master-test.js` | tests | `tests/orvi-mxn-master-test.js` | MEDIO | ./orvi-ocr-extractor => orvi-ocr-extractor.js<br>./orvi-guaranteed-value-timeline-engine => orvi-guaranteed-value-timeline-engine.js<br>./orvi-wait-vs-cancel-engine => orvi-wait-vs-cancel-engine.js<br>./exchange-rate-cache-engine => exchange-rate-cache-engine.js<br>./orvi-mxn-conversion-engine => orvi-mxn-conversion-engine.js | 2 - Tests y fixtures |
| `orvi-objection-engine.js` | product-intelligence | `product-intelligence/orvi-objection-engine.js` | MEDIO | - | 5 - Product intelligence |
| `orvi-ocr-extractor.js` | product-intelligence | `product-intelligence/orvi-ocr-extractor.js` | MEDIO | - | 5 - Product intelligence |
| `orvi-wait-vs-cancel-engine.js` | product-intelligence | `product-intelligence/orvi-wait-vs-cancel-engine.js` | MEDIO | - | 5 - Product intelligence |
| `outreach-channel.constants.js` | advisor-os | `advisor-os/outreach-channel.constants.js` | BAJO | - | 7 - Advisor OS |
| `outreach-prompt-builder.js` | advisor-os | `advisor-os/outreach-prompt-builder.js` | BAJO | - | 7 - Advisor OS |
| `ovelay-manager.js` | manager-os | `manager-os/ovelay-manager.js` | BAJO | - | 8 - Manager OS |
| `overdue-task-engine.js` | policy-operations | `policy-operations/overdue-task-engine.js` | BAJO | - | 6 - Policy operations |
| `payment-frequency-engine.js` | legacy | `legacy/payment-frequency-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `payment-mode-coaching-engine.js` | manager-os | `manager-os/payment-mode-coaching-engine.js` | BAJO | - | 8 - Manager OS |
| `performance-monitor.js` | legacy | `legacy/performance-monitor.js` | MEDIO | ./event-system.js => event-system.js | 11 - Legacy quarantine |
| `performance-runtime.js` | platform | `platform/performance-runtime.js` | MEDIO | ./telemetry.js => telemetry.js | 10 - Platform |
| `phone-call-engine.js` | legacy | `legacy/phone-call-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `pipeline-stage-engine.js` | legacy | `legacy/pipeline-stage-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `policy-activity-engine.js` | policy-operations | `policy-operations/policy-activity-engine.js` | BAJO | - | 6 - Policy operations |
| `policy-ai-insights-engine.js` | policy-operations | `policy-operations/policy-ai-insights-engine.js` | BAJO | - | 6 - Policy operations |
| `policy-ai-parser.js` | policy-operations | `policy-operations/policy-ai-parser.js` | BAJO | - | 6 - Policy operations |
| `policy-auto-approval-engine.js` | policy-operations | `policy-operations/policy-auto-approval-engine.js` | BAJO | - | 6 - Policy operations |
| `policy-auto-save-engine.js` | product-intelligence | `product-intelligence/policy-auto-save-engine.js` | BAJO | - | 5 - Product intelligence |
| `policy-batch-processing-engine.js` | policy-operations | `policy-operations/policy-batch-processing-engine.js` | BAJO | - | 6 - Policy operations |
| `policy-client-summary-engine.js` | policy-operations | `policy-operations/policy-client-summary-engine.js` | BAJO | - | 6 - Policy operations |
| `policy-context-engine.js` | policy-operations | `policy-operations/policy-context-engine.js` | BAJO | - | 6 - Policy operations |
| `policy-core-engine.js` | policy-operations | `policy-operations/policy-core-engine.js` | BAJO | - | 6 - Policy operations |
| `policy-detail-alert-engine.js` | policy-operations | `policy-operations/policy-detail-alert-engine.js` | BAJO | - | 6 - Policy operations |
| `policy-detail-engine.js` | policy-operations | `policy-operations/policy-detail-engine.js` | BAJO | - | 6 - Policy operations |
| `policy-detail-view-model.js` | policy-operations | `policy-operations/policy-detail-view-model.js` | BAJO | - | 6 - Policy operations |
| `policy-document-classifier.js` | policy-operations | `policy-operations/policy-document-classifier.js` | BAJO | - | 6 - Policy operations |
| `policy-document-engine.js` | policy-operations | `policy-operations/policy-document-engine.js` | BAJO | - | 6 - Policy operations |
| `policy-duplicate-engine.js` | policy-operations | `policy-operations/policy-duplicate-engine.js` | BAJO | - | 6 - Policy operations |
| `policy-field-confidence-map.js` | policy-operations | `policy-operations/policy-field-confidence-map.js` | MEDIO | ./field-confidence-engine.js => field-confidence-engine.js | 6 - Policy operations |
| `policy-filter-engine.js` | policy-operations | `policy-operations/policy-filter-engine.js` | BAJO | - | 6 - Policy operations |
| `policy-financial-summary-engine.js` | policy-operations | `policy-operations/policy-financial-summary-engine.js` | BAJO | - | 6 - Policy operations |
| `policy-followup-engine.js` | policy-operations | `policy-operations/policy-followup-engine.js` | BAJO | - | 6 - Policy operations |
| `policy-human-review-engine.js` | policy-operations | `policy-operations/policy-human-review-engine.js` | BAJO | - | 6 - Policy operations |
| `policy-import-dashboard-engine.js` | policy-operations | `policy-operations/policy-import-dashboard-engine.js` | BAJO | - | 6 - Policy operations |
| `policy-import-engine.js` | policy-operations | `policy-operations/policy-import-engine.js` | BAJO | - | 6 - Policy operations |
| `policy-import-errors-engine.js` | policy-operations | `policy-operations/policy-import-errors-engine.js` | BAJO | - | 6 - Policy operations |
| `policy-import-metrics-engine.js` | policy-operations | `policy-operations/policy-import-metrics-engine.js` | BAJO | - | 6 - Policy operations |
| `policy-import-queue.js` | policy-operations | `policy-operations/policy-import-queue.js` | BAJO | - | 6 - Policy operations |
| `policy-import-summary.js` | policy-operations | `policy-operations/policy-import-summary.js` | BAJO | - | 6 - Policy operations |
| `policy-indexing-engine.js` | policy-operations | `policy-operations/policy-indexing-engine.js` | BAJO | - | 6 - Policy operations |
| `policy-ingestion-orchestrator.js` | policy-operations | `policy-operations/policy-ingestion-orchestrator.js` | BAJO | - | 6 - Policy operations |
| `policy-last-contact-engine.js` | policy-operations | `policy-operations/policy-last-contact-engine.js` | BAJO | - | 6 - Policy operations |
| `policy-live-state-engine.js` | policy-operations | `policy-operations/policy-live-state-engine.js` | BAJO | - | 6 - Policy operations |
| `policy-metadata-engine.js` | policy-operations | `policy-operations/policy-metadata-engine.js` | BAJO | - | 6 - Policy operations |
| `policy-normalization-engine.js` | policy-operations | `policy-operations/policy-normalization-engine.js` | BAJO | - | 6 - Policy operations |
| `policy-ocr-engine.js` | policy-operations | `policy-operations/policy-ocr-engine.js` | MEDIO | - | 6 - Policy operations |
| `policy-operational-center-engine.js` | policy-operations | `policy-operations/policy-operational-center-engine.js` | BAJO | - | 6 - Policy operations |
| `policy-quick-actions-engine.js` | policy-operations | `policy-operations/policy-quick-actions-engine.js` | BAJO | - | 6 - Policy operations |
| `policy-relationship-score-engine.js` | policy-operations | `policy-operations/policy-relationship-score-engine.js` | BAJO | - | 6 - Policy operations |
| `policy-renewal-engine.js` | policy-operations | `policy-operations/policy-renewal-engine.js` | MEDIO | - | 6 - Policy operations |
| `policy-renewal-status-engine.js` | policy-operations | `policy-operations/policy-renewal-status-engine.js` | BAJO | - | 6 - Policy operations |
| `policy-review-priority-engine.js` | policy-operations | `policy-operations/policy-review-priority-engine.js` | BAJO | - | 6 - Policy operations |
| `policy-review-ui-engine.js` | policy-operations | `policy-operations/policy-review-ui-engine.js` | BAJO | - | 6 - Policy operations |
| `policy-risk-engine.js` | policy-operations | `policy-operations/policy-risk-engine.js` | BAJO | - | 6 - Policy operations |
| `policy-schema-validator-engine.js` | policy-operations | `policy-operations/policy-schema-validator-engine.js` | BAJO | - | 6 - Policy operations |
| `policy-search-engine.js` | policy-operations | `policy-operations/policy-search-engine.js` | BAJO | - | 6 - Policy operations |
| `policy-side-by-side-engine.js` | policy-operations | `policy-operations/policy-side-by-side-engine.js` | BAJO | - | 6 - Policy operations |
| `policy-smart-sort-engine.js` | policy-operations | `policy-operations/policy-smart-sort-engine.js` | BAJO | - | 6 - Policy operations |
| `policy-staging-cache.js` | policy-operations | `policy-operations/policy-staging-cache.js` | BAJO | - | 6 - Policy operations |
| `policy-staging-status-engine.js` | policy-operations | `policy-operations/policy-staging-status-engine.js` | BAJO | - | 6 - Policy operations |
| `policy-status-engine.js` | policy-operations | `policy-operations/policy-status-engine.js` | BAJO | - | 6 - Policy operations |
| `policy-storage-engine.js` | policy-operations | `policy-operations/policy-storage-engine.js` | BAJO | - | 6 - Policy operations |
| `policy-summary-engine.js` | policy-operations | `policy-operations/policy-summary-engine.js` | BAJO | - | 6 - Policy operations |
| `policy-task-engine.js` | policy-operations | `policy-operations/policy-task-engine.js` | BAJO | - | 6 - Policy operations |
| `policy-task-priority-engine.js` | policy-operations | `policy-operations/policy-task-priority-engine.js` | BAJO | - | 6 - Policy operations |
| `policy-timeline-engine.js` | policy-operations | `policy-operations/policy-timeline-engine.js` | MEDIO | - | 6 - Policy operations |
| `policy-timeline-event.factory.js` | policy-operations | `policy-operations/policy-timeline-event.factory.js` | BAJO | - | 6 - Policy operations |
| `policy-timeline-group-engine.js` | policy-operations | `policy-operations/policy-timeline-group-engine.js` | BAJO | - | 6 - Policy operations |
| `policy-timeline-query-engine.js` | policy-operations | `policy-operations/policy-timeline-query-engine.js` | BAJO | - | 6 - Policy operations |
| `policy-timeline-view-model.js` | policy-operations | `policy-operations/policy-timeline-view-model.js` | BAJO | - | 6 - Policy operations |
| `policy-timeline.repository.js` | policy-operations | `policy-operations/policy-timeline.repository.js` | BAJO | - | 6 - Policy operations |
| `policy-timeline.types.js` | policy-operations | `policy-operations/policy-timeline.types.js` | BAJO | - | 6 - Policy operations |
| `policy-validation-engine.js` | policy-operations | `policy-operations/policy-validation-engine.js` | BAJO | - | 6 - Policy operations |
| `policy-workspace-engine.js` | policy-operations | `policy-operations/policy-workspace-engine.js` | BAJO | - | 6 - Policy operations |
| `precontract-activity-fixture-test.js` | tests | `tests/precontract-activity-fixture-test.js` | BAJO | - | 2 - Tests y fixtures |
| `presentation-input-context-builder.js` | legacy | `legacy/presentation-input-context-builder.js` | MEDIO | - | 11 - Legacy quarantine |
| `presentation-input-pipeline.js` | legacy | `legacy/presentation-input-pipeline.js` | MEDIO | ./quotation-field-normalizer.js => quotation-field-normalizer.js<br>./quotation-currency-bridge.js => quotation-currency-bridge.js<br>./product-detection-engine.js => product-detection-engine.js<br>./product-knowledge-link-engine.js => product-knowledge-link-engine.js<br>./dynamic-cash-value-projection-engine.js => dynamic-cash-value-projection-engine.js | 11 - Legacy quarantine |
| `primary-risk-engine.js` | compensation | `compensation/primary-risk-engine.js` | BAJO | - | 9 - Compensation |
| `product-detection-engine.js` | product-intelligence | `product-intelligence/product-detection-engine.js` | MEDIO | - | 5 - Product intelligence |
| `product-knowledge-link-engine.js` | product-intelligence | `product-intelligence/product-knowledge-link-engine.js` | MEDIO | - | 5 - Product intelligence |
| `product-schema-engine.js` | product-intelligence | `product-intelligence/product-schema-engine.js` | BAJO | - | 5 - Product intelligence |
| `projection-engine.js` | shared-intelligence | `shared-intelligence/projection-engine.js` | MEDIO | - | 3 - Shared intelligence |
| `projection-milestone-engine.js` | shared-intelligence | `shared-intelligence/projection-milestone-engine.js` | MEDIO | - | 3 - Shared intelligence |
| `proposal-family-engine.js` | legacy | `legacy/proposal-family-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `proposal-family-smoke-test.js` | tests | `tests/proposal-family-smoke-test.js` | MEDIO | ./proposal-family-engine.js => proposal-family-engine.js | 2 - Tests y fixtures |
| `prospeccion.js` | legacy | `legacy/prospeccion.js` | MEDIO | ./db.js => db.js<br>./app.js => app.js<br>./utils.js => utils.js | 11 - Legacy quarantine |
| `prospect-next-action-engine.js` | advisor-os | `advisor-os/prospect-next-action-engine.js` | BAJO | - | 7 - Advisor OS |
| `prospect-personality-engine.js` | advisor-os | `advisor-os/prospect-personality-engine.js` | MEDIO | - | 7 - Advisor OS |
| `prospect-personality.constants.js` | advisor-os | `advisor-os/prospect-personality.constants.js` | BAJO | - | 7 - Advisor OS |
| `prospect-pipeline-engine.js` | advisor-os | `advisor-os/prospect-pipeline-engine.js` | BAJO | - | 7 - Advisor OS |
| `prospect-profile-engine.js` | advisor-os | `advisor-os/prospect-profile-engine.js` | BAJO | - | 7 - Advisor OS |
| `prospect-score-engine.js` | advisor-os | `advisor-os/prospect-score-engine.js` | BAJO | - | 7 - Advisor OS |
| `prospect-segment-performance-engine.js` | advisor-os | `advisor-os/prospect-segment-performance-engine.js` | BAJO | - | 7 - Advisor OS |
| `prospect-status.constants.js` | advisor-os | `advisor-os/prospect-status.constants.js` | BAJO | - | 7 - Advisor OS |
| `prospect.entity.js` | advisor-os | `advisor-os/prospect.entity.js` | BAJO | - | 7 - Advisor OS |
| `prospecting-dashboard.viewmodel.js` | advisor-os | `advisor-os/prospecting-dashboard.viewmodel.js` | BAJO | - | 7 - Advisor OS |
| `push-notification-engine.js` | platform | `platform/push-notification-engine.js` | ALTO | - | 10 - Platform |
| `query-cache.js` | platform | `platform/query-cache.js` | ALTO | - | 10 - Platform |
| `query-runtime.js` | platform | `platform/query-runtime.js` | MEDIO | ./cache-runtime.js => cache-runtime.js | 10 - Platform |
| `question-answer-engine.js` | shared-intelligence | `shared-intelligence/question-answer-engine.js` | BAJO | - | 3 - Shared intelligence |
| `question-session-engine.js` | legacy | `legacy/question-session-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `question-style-match-engine.js` | legacy | `legacy/question-style-match-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `quick-action-executor-engine.js` | legacy | `legacy/quick-action-executor-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `quick-actions-engine.js` | legacy | `legacy/quick-actions-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `quotation-currency-bridge.js` | product-intelligence | `product-intelligence/quotation-currency-bridge.js` | MEDIO | ./currency-normalization-engine.js => currency-normalization-engine.js | 5 - Product intelligence |
| `quotation-extraction-result.entity.js` | product-intelligence | `product-intelligence/quotation-extraction-result.entity.js` | BAJO | - | 5 - Product intelligence |
| `quotation-field-normalizer.js` | product-intelligence | `product-intelligence/quotation-field-normalizer.js` | MEDIO | - | 5 - Product intelligence |
| `quotation-input.entity.js` | product-intelligence | `product-intelligence/quotation-input.entity.js` | BAJO | - | 5 - Product intelligence |
| `quote-to-policy-comparison-engine.js` | product-intelligence | `product-intelligence/quote-to-policy-comparison-engine.js` | MEDIO | - | 5 - Product intelligence |
| `ranking-engine.js` | legacy | `legacy/ranking-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `reactivation-strategy-engine.js` | legacy | `legacy/reactivation-strategy-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `realtime-engine.js` | legacy | `legacy/realtime-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `realtime-task-engine.js` | policy-operations | `policy-operations/realtime-task-engine.js` | BAJO | - | 6 - Policy operations |
| `recruitment-fixture-validation-test.js` | tests | `tests/recruitment-fixture-validation-test.js` | BAJO | - | 2 - Tests y fixtures |
| `referidos.js` | legacy | `legacy/referidos.js` | MEDIO | ./db.js => db.js<br>./utils.js => utils.js | 11 - Legacy quarantine |
| `referral-ai-followup.js` | advisor-os | `advisor-os/referral-ai-followup.js` | BAJO | - | 7 - Advisor OS |
| `referral-card-ui.js` | advisor-os | `advisor-os/referral-card-ui.js` | BAJO | - | 7 - Advisor OS |
| `referral-color-engine.js` | advisor-os | `advisor-os/referral-color-engine.js` | BAJO | - | 7 - Advisor OS |
| `referral-followup-engine.js` | advisor-os | `advisor-os/referral-followup-engine.js` | BAJO | - | 7 - Advisor OS |
| `referral-opportunity-engine.js` | advisor-os | `advisor-os/referral-opportunity-engine.js` | MEDIO | - | 7 - Advisor OS |
| `referral-opportunity-master-test.js` | tests | `tests/referral-opportunity-master-test.js` | MEDIO | ./referral-opportunity-engine => referral-opportunity-engine.js | 2 - Tests y fixtures |
| `referral-priority-engine.js` | advisor-os | `advisor-os/referral-priority-engine.js` | BAJO | - | 7 - Advisor OS |
| `referral-prompt-builder.js` | advisor-os | `advisor-os/referral-prompt-builder.js` | BAJO | - | 7 - Advisor OS |
| `referral-score-engine.js` | advisor-os | `advisor-os/referral-score-engine.js` | BAJO | - | 7 - Advisor OS |
| `referral-smart-actions.js` | advisor-os | `advisor-os/referral-smart-actions.js` | BAJO | - | 7 - Advisor OS |
| `referral-source.constants.js` | advisor-os | `advisor-os/referral-source.constants.js` | BAJO | - | 7 - Advisor OS |
| `referral-temperature-engine.js` | advisor-os | `advisor-os/referral-temperature-engine.js` | BAJO | - | 7 - Advisor OS |
| `referral-timeline-engine.js` | advisor-os | `advisor-os/referral-timeline-engine.js` | BAJO | - | 7 - Advisor OS |
| `referrals-board-engine.js` | advisor-os | `advisor-os/referrals-board-engine.js` | BAJO | - | 7 - Advisor OS |
| `referrals-engine.js` | advisor-os | `advisor-os/referrals-engine.js` | BAJO | - | 7 - Advisor OS |
| `relationship-health-engine.js` | advisor-os | `advisor-os/relationship-health-engine.js` | MEDIO | - | 7 - Advisor OS |
| `relationship-health-master-test.js` | tests | `tests/relationship-health-master-test.js` | MEDIO | ./relationship-health-engine => relationship-health-engine.js | 2 - Tests y fixtures |
| `relationship-master-acceptance-test.js` | tests | `tests/relationship-master-acceptance-test.js` | ALTO | ./relationship-timeline-engine => relationship-timeline-engine.js<br>./relationship-next-action-engine => relationship-next-action-engine.js<br>./relationship-opportunity-engine => relationship-opportunity-engine.js<br>./life-event-engine => life-event-engine.js<br>./referral-opportunity-engine => referral-opportunity-engine.js<br>./relationship-health-engine => relationship-health-engine.js<br>... +3 | 2 - Tests y fixtures |
| `relationship-master-engine.js` | advisor-os | `advisor-os/relationship-master-engine.js` | ALTO | ./relationship-timeline-engine => relationship-timeline-engine.js<br>./relationship-next-action-engine => relationship-next-action-engine.js<br>./relationship-opportunity-engine => relationship-opportunity-engine.js<br>./life-event-engine => life-event-engine.js<br>./referral-opportunity-engine => referral-opportunity-engine.js<br>./relationship-health-engine => relationship-health-engine.js<br>... +2 | 7 - Advisor OS |
| `relationship-memory-engine.js` | advisor-os | `advisor-os/relationship-memory-engine.js` | BAJO | - | 7 - Advisor OS |
| `relationship-next-action-engine.js` | advisor-os | `advisor-os/relationship-next-action-engine.js` | MEDIO | - | 7 - Advisor OS |
| `relationship-next-action-master-test.js` | tests | `tests/relationship-next-action-master-test.js` | MEDIO | ./relationship-next-action-engine => relationship-next-action-engine.js | 2 - Tests y fixtures |
| `relationship-opportunity-engine.js` | advisor-os | `advisor-os/relationship-opportunity-engine.js` | MEDIO | ./relationship-next-action-engine => relationship-next-action-engine.js | 7 - Advisor OS |
| `relationship-opportunity-master-test.js` | tests | `tests/relationship-opportunity-master-test.js` | MEDIO | ./relationship-opportunity-engine => relationship-opportunity-engine.js | 2 - Tests y fixtures |
| `relationship-review-engine.js` | advisor-os | `advisor-os/relationship-review-engine.js` | MEDIO | - | 7 - Advisor OS |
| `relationship-review-master-test.js` | tests | `tests/relationship-review-master-test.js` | MEDIO | ./relationship-review-engine => relationship-review-engine.js | 2 - Tests y fixtures |
| `relationship-timeline-engine.js` | advisor-os | `advisor-os/relationship-timeline-engine.js` | MEDIO | - | 7 - Advisor OS |
| `relationship-timeline-master-test.js` | tests | `tests/relationship-timeline-master-test.js` | MEDIO | ./relationship-timeline-engine => relationship-timeline-engine.js | 2 - Tests y fixtures |
| `render-engine.js` | platform | `platform/render-engine.js` | ALTO | - | 10 - Platform |
| `renewal-intelligence-engine.js` | policy-operations | `policy-operations/renewal-intelligence-engine.js` | BAJO | - | 6 - Policy operations |
| `responsive-engine.js` | legacy | `legacy/responsive-engine.js` | MEDIO | ./state-manager.js => state-manager.js | 11 - Legacy quarantine |
| `retirement-future-udi-projection-engine.js` | shared-intelligence | `shared-intelligence/retirement-future-udi-projection-engine.js` | MEDIO | - | 3 - Shared intelligence |
| `retirement-future-udi-projection-smoke-test.js` | tests | `tests/retirement-future-udi-projection-smoke-test.js` | MEDIO | ./retirement-future-udi-projection-engine => retirement-future-udi-projection-engine.js<br>./imagina-ser-future-mxn-bridge => imagina-ser-future-mxn-bridge.js | 2 - Tests y fixtures |
| `retirement-presentation-scenario-engine.js` | legacy | `legacy/retirement-presentation-scenario-engine.js` | MEDIO | ./exchange-rate-cache-engine => exchange-rate-cache-engine.js | 11 - Legacy quarantine |
| `retry-runtime.js` | platform | `platform/retry-runtime.js` | ALTO | - | 10 - Platform |
| `revenue-forecast-engine.js` | legacy | `legacy/revenue-forecast-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `revenue-optimization-engine.js` | legacy | `legacy/revenue-optimization-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `risk-story-context-engine.js` | legacy | `legacy/risk-story-context-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `route-transition-manager.js` | manager-os | `manager-os/route-transition-manager.js` | MEDIO | ./memory-manager.js => memory-manager.js | 8 - Manager OS |
| `runtime.js` | platform | `platform/runtime.js` | MEDIO | - | 10 - Platform |
| `sales-coach-engine.js` | advisor-os | `advisor-os/sales-coach-engine.js` | BAJO | - | 7 - Advisor OS |
| `sales-context-engine.js` | advisor-os | `advisor-os/sales-context-engine.js` | BAJO | - | 7 - Advisor OS |
| `sales-dna-evolution-engine.js` | advisor-os | `advisor-os/sales-dna-evolution-engine.js` | BAJO | - | 7 - Advisor OS |
| `sales-dna-insight-engine.js` | advisor-os | `advisor-os/sales-dna-insight-engine.js` | BAJO | - | 7 - Advisor OS |
| `sales-dna-learning-event.js` | advisor-os | `advisor-os/sales-dna-learning-event.js` | BAJO | - | 7 - Advisor OS |
| `sales-dna-match-engine.js` | advisor-os | `advisor-os/sales-dna-match-engine.js` | BAJO | - | 7 - Advisor OS |
| `sales-dna-profile-engine.js` | advisor-os | `advisor-os/sales-dna-profile-engine.js` | BAJO | - | 7 - Advisor OS |
| `sales-dna-recommendation-engine.js` | advisor-os | `advisor-os/sales-dna-recommendation-engine.js` | BAJO | - | 7 - Advisor OS |
| `sales-dna-stage-engine.js` | advisor-os | `advisor-os/sales-dna-stage-engine.js` | BAJO | - | 7 - Advisor OS |
| `sales-dna.constants.js` | advisor-os | `advisor-os/sales-dna.constants.js` | BAJO | - | 7 - Advisor OS |
| `sales-learning-event.entity.js` | advisor-os | `advisor-os/sales-learning-event.entity.js` | BAJO | - | 7 - Advisor OS |
| `sales-script-types.constants.js` | advisor-os | `advisor-os/sales-script-types.constants.js` | BAJO | - | 7 - Advisor OS |
| `sales-tone.constants.js` | advisor-os | `advisor-os/sales-tone.constants.js` | BAJO | - | 7 - Advisor OS |
| `schema-field-engine.js` | shared-intelligence | `shared-intelligence/schema-field-engine.js` | BAJO | - | 3 - Shared intelligence |
| `schemas/advisor-conversion.schema.json` | shared-intelligence/data-contracts | `schemas/advisor-conversion.schema.json` | BAJO | - | 2 - Tests y fixtures |
| `schemas/advisor.schema.json` | shared-intelligence/data-contracts | `schemas/advisor.schema.json` | BAJO | - | 2 - Tests y fixtures |
| `schemas/candidate-assessment.schema.json` | shared-intelligence/data-contracts | `schemas/candidate-assessment.schema.json` | BAJO | - | 2 - Tests y fixtures |
| `schemas/candidate.schema.json` | shared-intelligence/data-contracts | `schemas/candidate.schema.json` | BAJO | - | 2 - Tests y fixtures |
| `schemas/interview-evidence.schema.json` | shared-intelligence/data-contracts | `schemas/interview-evidence.schema.json` | BAJO | - | 2 - Tests y fixtures |
| `schemas/interview.schema.json` | shared-intelligence/data-contracts | `schemas/interview.schema.json` | BAJO | - | 2 - Tests y fixtures |
| `schemas/manager-assignment.schema.json` | shared-intelligence/data-contracts | `schemas/manager-assignment.schema.json` | BAJO | - | 2 - Tests y fixtures |
| `schemas/manager-report.schema.json` | shared-intelligence/data-contracts | `schemas/manager-report.schema.json` | BAJO | - | 2 - Tests y fixtures |
| `schemas/market-evidence.schema.json` | shared-intelligence/data-contracts | `schemas/market-evidence.schema.json` | BAJO | - | 2 - Tests y fixtures |
| `schemas/nash-report.schema.json` | shared-intelligence/data-contracts | `schemas/nash-report.schema.json` | BAJO | - | 2 - Tests y fixtures |
| `schemas/office-assignment.schema.json` | shared-intelligence/data-contracts | `schemas/office-assignment.schema.json` | BAJO | - | 2 - Tests y fixtures |
| `schemas/office-rules-config.schema.json` | shared-intelligence/data-contracts | `schemas/office-rules-config.schema.json` | BAJO | - | 2 - Tests y fixtures |
| `schemas/organization-profile.schema.json` | shared-intelligence/data-contracts | `schemas/organization-profile.schema.json` | BAJO | - | 2 - Tests y fixtures |
| `schemas/policy.schema.json` | shared-intelligence/data-contracts | `schemas/policy.schema.json` | BAJO | - | 2 - Tests y fixtures |
| `schemas/precontract-activity-evidence.schema.json` | shared-intelligence/data-contracts | `schemas/precontract-activity-evidence.schema.json` | BAJO | - | 2 - Tests y fixtures |
| `schemas/precontract-cycle.schema.json` | shared-intelligence/data-contracts | `schemas/precontract-cycle.schema.json` | BAJO | - | 2 - Tests y fixtures |
| `schemas/precontract.schema.json` | shared-intelligence/data-contracts | `schemas/precontract.schema.json` | BAJO | - | 2 - Tests y fixtures |
| `schemas/project200.schema.json` | shared-intelligence/data-contracts | `schemas/project200.schema.json` | BAJO | - | 2 - Tests y fixtures |
| `schemas/prospect.schema.json` | shared-intelligence/data-contracts | `schemas/prospect.schema.json` | BAJO | - | 2 - Tests y fixtures |
| `schemas/question-evidence.schema.json` | shared-intelligence/data-contracts | `schemas/question-evidence.schema.json` | BAJO | - | 2 - Tests y fixtures |
| `schemas/rda.schema.json` | shared-intelligence/data-contracts | `schemas/rda.schema.json` | BAJO | - | 2 - Tests y fixtures |
| `schemas/recruit-identity.schema.json` | shared-intelligence/data-contracts | `schemas/recruit-identity.schema.json` | BAJO | - | 2 - Tests y fixtures |
| `schemas/recruitment-application.schema.json` | shared-intelligence/data-contracts | `schemas/recruitment-application.schema.json` | BAJO | - | 2 - Tests y fixtures |
| `schemas/relationship-report.schema.json` | shared-intelligence/data-contracts | `schemas/relationship-report.schema.json` | BAJO | - | 2 - Tests y fixtures |
| `schemas/relationship.schema.json` | shared-intelligence/data-contracts | `schemas/relationship.schema.json` | BAJO | - | 2 - Tests y fixtures |
| `script-adaptation-engine.js` | legacy | `legacy/script-adaptation-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `search-index-engine.js` | platform | `platform/search-index-engine.js` | ALTO | - | 10 - Platform |
| `search-quick-actions-engine.js` | platform | `platform/search-quick-actions-engine.js` | ALTO | - | 10 - Platform |
| `search-ranking-engine.js` | platform | `platform/search-ranking-engine.js` | ALTO | - | 10 - Platform |
| `secure-storage.js` | platform | `platform/secure-storage.js` | ALTO | - | 10 - Platform |
| `seen-but-no-reply-engine.js` | legacy | `legacy/seen-but-no-reply-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `segu-beca-client-presentation-engine.js` | product-intelligence | `product-intelligence/segu-beca-client-presentation-engine.js` | MEDIO | - | 5 - Product intelligence |
| `segu-beca-decision-engine.js` | product-intelligence | `product-intelligence/segu-beca-decision-engine.js` | MEDIO | - | 5 - Product intelligence |
| `segu-beca-education-comparison-engine.js` | product-intelligence | `product-intelligence/segu-beca-education-comparison-engine.js` | MEDIO | ./shared-education-cost-engine => shared-education-cost-engine.js | 5 - Product intelligence |
| `segu-beca-education-options-engine.js` | product-intelligence | `product-intelligence/segu-beca-education-options-engine.js` | MEDIO | ./shared-education-paths-engine => shared-education-paths-engine.js | 5 - Product intelligence |
| `segu-beca-master-test.js` | tests | `tests/segu-beca-master-test.js` | MEDIO | ./segu-beca-decision-engine => segu-beca-decision-engine.js<br>./segu-beca-client-presentation-engine => segu-beca-client-presentation-engine.js<br>./segu-beca-education-options-engine => segu-beca-education-options-engine.js<br>./shared-price-placement-engine => shared-price-placement-engine.js | 2 - Tests y fixtures |
| `segu-beca-meaningful-numbers-report.js` | product-intelligence | `product-intelligence/segu-beca-meaningful-numbers-report.js` | MEDIO | ./exchange-rate-cache-engine => exchange-rate-cache-engine.js<br>./shared-projection-scenarios-engine => shared-projection-scenarios-engine.js<br>./shared-meaningful-numbers-engine => shared-meaningful-numbers-engine.js | 5 - Product intelligence |
| `segu-beca-mxn-appendix-report.js` | product-intelligence | `product-intelligence/segu-beca-mxn-appendix-report.js` | MEDIO | ./exchange-rate-cache-engine => exchange-rate-cache-engine.js<br>./shared-projection-scenarios-engine => shared-projection-scenarios-engine.js<br>./shared-mxn-timeline-engine => shared-mxn-timeline-engine.js | 5 - Product intelligence |
| `segu-beca-mxn-timeline-clean-report.js` | product-intelligence | `product-intelligence/segu-beca-mxn-timeline-clean-report.js` | ALTO | ./exchange-rate-cache-engine => exchange-rate-cache-engine.js<br>./shared-projection-scenarios-engine => shared-projection-scenarios-engine.js<br>./shared-currency-projection-engine => shared-currency-projection-engine.js<br>./shared-objection-shield-engine => shared-objection-shield-engine.js | 5 - Product intelligence |
| `segu-beca-ocr-intake-report.js` | product-intelligence | `product-intelligence/segu-beca-ocr-intake-report.js` | BAJO | - | 5 - Product intelligence |
| `semantic-navigation-engine.js` | legacy | `legacy/semantic-navigation-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `service-worker.js` | platform | `service-worker.js` | NO_MOVER | - | 0 - No mover |
| `shared-ave-confidence-engine.js` | product-intelligence | `product-intelligence/shared-ave-confidence-engine.js` | MEDIO | - | 5 - Product intelligence |
| `shared-ave-confidence-report.js` | product-intelligence | `product-intelligence/shared-ave-confidence-report.js` | MEDIO | ./shared-ave-confidence-engine => shared-ave-confidence-engine.js<br>./shared-ave-eligibility-engine => shared-ave-eligibility-engine.js | 5 - Product intelligence |
| `shared-ave-death-benefit-engine.js` | product-intelligence | `product-intelligence/shared-ave-death-benefit-engine.js` | MEDIO | ./shared-ave-growth-engine => shared-ave-growth-engine.js | 5 - Product intelligence |
| `shared-ave-death-benefit-report.js` | product-intelligence | `product-intelligence/shared-ave-death-benefit-report.js` | MEDIO | ./shared-ave-death-benefit-engine => shared-ave-death-benefit-engine.js | 5 - Product intelligence |
| `shared-ave-eligibility-engine.js` | product-intelligence | `product-intelligence/shared-ave-eligibility-engine.js` | MEDIO | - | 5 - Product intelligence |
| `shared-ave-growth-engine.js` | product-intelligence | `product-intelligence/shared-ave-growth-engine.js` | MEDIO | - | 5 - Product intelligence |
| `shared-ave-growth-report.js` | product-intelligence | `product-intelligence/shared-ave-growth-report.js` | MEDIO | ./shared-ave-growth-engine => shared-ave-growth-engine.js | 5 - Product intelligence |
| `shared-ave-portfolio-engine.js` | product-intelligence | `product-intelligence/shared-ave-portfolio-engine.js` | MEDIO | ./shared-ave-growth-engine => shared-ave-growth-engine.js<br>./shared-ave-rescue-engine => shared-ave-rescue-engine.js<br>./shared-ave-type-inference-engine => shared-ave-type-inference-engine.js | 5 - Product intelligence |
| `shared-ave-portfolio-report.js` | product-intelligence | `product-intelligence/shared-ave-portfolio-report.js` | MEDIO | ./shared-ave-portfolio-engine => shared-ave-portfolio-engine.js | 5 - Product intelligence |
| `shared-ave-rescue-engine.js` | product-intelligence | `product-intelligence/shared-ave-rescue-engine.js` | MEDIO | - | 5 - Product intelligence |
| `shared-ave-rescue-report.js` | product-intelligence | `product-intelligence/shared-ave-rescue-report.js` | MEDIO | ./shared-ave-rescue-engine => shared-ave-rescue-engine.js | 5 - Product intelligence |
| `shared-ave-type-inference-engine.js` | product-intelligence | `product-intelligence/shared-ave-type-inference-engine.js` | MEDIO | ./shared-ave-growth-engine => shared-ave-growth-engine.js<br>./shared-ave-rescue-engine => shared-ave-rescue-engine.js | 5 - Product intelligence |
| `shared-ave-type-inference-report.js` | product-intelligence | `product-intelligence/shared-ave-type-inference-report.js` | MEDIO | ./shared-ave-type-inference-engine => shared-ave-type-inference-engine.js | 5 - Product intelligence |
| `shared-banxico-rate-engine.js` | shared-intelligence | `shared-intelligence/shared-banxico-rate-engine.js` | MEDIO | - | 3 - Shared intelligence |
| `shared-banxico-rate-report.js` | shared-intelligence | `shared-intelligence/shared-banxico-rate-report.js` | MEDIO | ./shared-banxico-rate-engine => shared-banxico-rate-engine.js | 3 - Shared intelligence |
| `shared-benefit-hierarchy-engine.js` | shared-intelligence | `shared-intelligence/shared-benefit-hierarchy-engine.js` | MEDIO | - | 3 - Shared intelligence |
| `shared-client-language-engine.js` | shared-intelligence | `shared-intelligence/shared-client-language-engine.js` | MEDIO | - | 3 - Shared intelligence |
| `shared-clp-engine.js` | shared-intelligence | `shared-intelligence/shared-clp-engine.js` | MEDIO | - | 3 - Shared intelligence |
| `shared-clp-master-test.js` | tests | `tests/shared-clp-master-test.js` | MEDIO | ./shared-clp-engine => shared-clp-engine.js | 2 - Tests y fixtures |
| `shared-currency-projection-engine.js` | shared-intelligence | `shared-intelligence/shared-currency-projection-engine.js` | MEDIO | - | 3 - Shared intelligence |
| `shared-decision-appendix-engine.js` | shared-intelligence | `shared-intelligence/shared-decision-appendix-engine.js` | MEDIO | - | 3 - Shared intelligence |
| `shared-decision-clarity-engine.js` | shared-intelligence | `shared-intelligence/shared-decision-clarity-engine.js` | MEDIO | - | 3 - Shared intelligence |
| `shared-decision-score-engine.js` | shared-intelligence | `shared-intelligence/shared-decision-score-engine.js` | MEDIO | - | 3 - Shared intelligence |
| `shared-document-priority-engine.js` | shared-intelligence | `shared-intelligence/shared-document-priority-engine.js` | MEDIO | - | 3 - Shared intelligence |
| `shared-education-cost-engine.js` | shared-intelligence | `shared-intelligence/shared-education-cost-engine.js` | MEDIO | - | 3 - Shared intelligence |
| `shared-education-paths-engine.js` | shared-intelligence | `shared-intelligence/shared-education-paths-engine.js` | MEDIO | - | 3 - Shared intelligence |
| `shared-financial-return-engine.js` | shared-intelligence | `shared-intelligence/shared-financial-return-engine.js` | MEDIO | - | 3 - Shared intelligence |
| `shared-human-financial-language-engine.js` | shared-intelligence | `shared-intelligence/shared-human-financial-language-engine.js` | MEDIO | - | 3 - Shared intelligence |
| `shared-meaningful-numbers-engine.js` | shared-intelligence | `shared-intelligence/shared-meaningful-numbers-engine.js` | MEDIO | ./shared-currency-projection-engine => shared-currency-projection-engine.js | 3 - Shared intelligence |
| `shared-mxn-timeline-engine.js` | shared-intelligence | `shared-intelligence/shared-mxn-timeline-engine.js` | MEDIO | ./shared-currency-projection-engine => shared-currency-projection-engine.js | 3 - Shared intelligence |
| `shared-objection-shield-engine.js` | advisor-os | `advisor-os/shared-objection-shield-engine.js` | MEDIO | - | 7 - Advisor OS |
| `shared-policy-currency-timeline-engine.js` | policy-operations | `policy-operations/shared-policy-currency-timeline-engine.js` | MEDIO | - | 6 - Policy operations |
| `shared-policy-currency-timeline-smoke-test.js` | tests | `tests/shared-policy-currency-timeline-smoke-test.js` | MEDIO | ./shared-policy-currency-timeline-engine => shared-policy-currency-timeline-engine.js | 2 - Tests y fixtures |
| `shared-premium-growth-engine.js` | shared-intelligence | `shared-intelligence/shared-premium-growth-engine.js` | MEDIO | - | 3 - Shared intelligence |
| `shared-price-placement-engine.js` | shared-intelligence | `shared-intelligence/shared-price-placement-engine.js` | MEDIO | - | 3 - Shared intelligence |
| `shared-projection-scenarios-engine.js` | shared-intelligence | `shared-intelligence/shared-projection-scenarios-engine.js` | MEDIO | - | 3 - Shared intelligence |
| `shared-protection-efficiency-engine.js` | shared-intelligence | `shared-intelligence/shared-protection-efficiency-engine.js` | MEDIO | - | 3 - Shared intelligence |
| `shared-recovery-analysis-engine.js` | shared-intelligence | `shared-intelligence/shared-recovery-analysis-engine.js` | MEDIO | - | 3 - Shared intelligence |
| `shared-tax-profile-engine.js` | shared-intelligence | `shared-intelligence/shared-tax-profile-engine.js` | MEDIO | - | 3 - Shared intelligence |
| `smart-agenda-engine.js` | legacy | `legacy/smart-agenda-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `smart-field-detection-engine.js` | legacy | `legacy/smart-field-detection-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `smart-followup-engine.js` | advisor-os | `advisor-os/smart-followup-engine.js` | BAJO | - | 7 - Advisor OS |
| `smart-followup-message-engine.js` | advisor-os | `advisor-os/smart-followup-message-engine.js` | BAJO | - | 7 - Advisor OS |
| `smart-notification-engine.js` | platform | `platform/smart-notification-engine.js` | ALTO | - | 10 - Platform |
| `smart-outreach-engine.js` | advisor-os | `advisor-os/smart-outreach-engine.js` | BAJO | - | 7 - Advisor OS |
| `smart-priority-engine.js` | legacy | `legacy/smart-priority-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `smart-referrals-engine.js` | advisor-os | `advisor-os/smart-referrals-engine.js` | BAJO | - | 7 - Advisor OS |
| `smnyl-ai-coach-engine.js` | compensation | `compensation/smnyl-ai-coach-engine.js` | BAJO | - | 9 - Compensation |
| `smnyl-ai-presence-engine.js` | compensation | `compensation/smnyl-ai-presence-engine.js` | BAJO | - | 9 - Compensation |
| `smnyl-alerts-engine.js` | compensation | `compensation/smnyl-alerts-engine.js` | MEDIO | - | 9 - Compensation |
| `smnyl-anomaly-engine.js` | compensation | `compensation/smnyl-anomaly-engine.js` | MEDIO | - | 9 - Compensation |
| `smnyl-automation-engine.js` | compensation | `compensation/smnyl-automation-engine.js` | MEDIO | ./smnyl-reminders-engine.js => smnyl-reminders-engine.js<br>./smnyl-followup-engine.js => smnyl-followup-engine.js<br>./smnyl-alerts-engine.js => smnyl-alerts-engine.js | 9 - Compensation |
| `smnyl-bonos-engine.js` | compensation | `compensation/smnyl-bonos-engine.js` | MEDIO | ./smnyl-concursos-config.js => smnyl-concursos-config.js | 9 - Compensation |
| `smnyl-cancelaciones-engine.js` | compensation | `compensation/smnyl-cancelaciones-engine.js` | MEDIO | - | 9 - Compensation |
| `smnyl-comisiones-engine.js` | compensation | `compensation/smnyl-comisiones-engine.js` | MEDIO | ./smnyl-prima-engine.js => smnyl-prima-engine.js | 9 - Compensation |
| `smnyl-comisiones-gmm.js` | compensation | `compensation/smnyl-comisiones-gmm.js` | BAJO | - | 9 - Compensation |
| `smnyl-comisiones-vida.js` | compensation | `compensation/smnyl-comisiones-vida.js` | BAJO | - | 9 - Compensation |
| `smnyl-command-center-engine.js` | compensation | `compensation/smnyl-command-center-engine.js` | BAJO | - | 9 - Compensation |
| `smnyl-command-palette-engine.js` | compensation | `compensation/smnyl-command-palette-engine.js` | MEDIO | - | 9 - Compensation |
| `smnyl-concursos-engine.js` | compensation | `compensation/smnyl-concursos-engine.js` | MEDIO | ./db.js => db.js<br>./smnyl-produccion-engine.js => smnyl-produccion-engine.js<br>./smnyl-bonos-engine.js => smnyl-bonos-engine.js<br>./smnyl-training-allowance-engine.js => smnyl-training-allowance-engine.js | 9 - Compensation |
| `smnyl-conteo-engine.js` | compensation | `compensation/smnyl-conteo-engine.js` | MEDIO | ./smnyl-prima-engine.js => smnyl-prima-engine.js | 9 - Compensation |
| `smnyl-cross-sell-engine.js` | compensation | `compensation/smnyl-cross-sell-engine.js` | BAJO | - | 9 - Compensation |
| `smnyl-decision-engine.js` | compensation | `compensation/smnyl-decision-engine.js` | BAJO | - | 9 - Compensation |
| `smnyl-executive-dashboard-engine.js` | compensation | `compensation/smnyl-executive-dashboard-engine.js` | MEDIO | ./smnyl-kpi-engine.js => smnyl-kpi-engine.js<br>./smnyl-health-score-engine.js => smnyl-health-score-engine.js<br>./smnyl-forecast-engine.js => smnyl-forecast-engine.js | 9 - Compensation |
| `smnyl-followup-engine.js` | compensation | `compensation/smnyl-followup-engine.js` | MEDIO | - | 9 - Compensation |
| `smnyl-forecast-engine.js` | compensation | `compensation/smnyl-forecast-engine.js` | MEDIO | - | 9 - Compensation |
| `smnyl-goals-engine.js` | compensation | `compensation/smnyl-goals-engine.js` | BAJO | - | 9 - Compensation |
| `smnyl-health-score-engine.js` | compensation | `compensation/smnyl-health-score-engine.js` | MEDIO | - | 9 - Compensation |
| `smnyl-insights-engine.js` | compensation | `compensation/smnyl-insights-engine.js` | BAJO | - | 9 - Compensation |
| `smnyl-kpi-engine.js` | compensation | `compensation/smnyl-kpi-engine.js` | MEDIO | ./smnyl-persistencia-engine.js => smnyl-persistencia-engine.js<br>./smnyl-retencion-engine.js => smnyl-retencion-engine.js<br>./smnyl-cancelaciones-engine.js => smnyl-cancelaciones-engine.js | 9 - Compensation |
| `smnyl-leaderboard-engine.js` | compensation | `compensation/smnyl-leaderboard-engine.js` | BAJO | - | 9 - Compensation |
| `smnyl-neural-glow-engine.js` | compensation | `compensation/smnyl-neural-glow-engine.js` | BAJO | - | 9 - Compensation |
| `smnyl-operating-system-engine.js` | compensation | `compensation/smnyl-operating-system-engine.js` | MEDIO | ./smnyl-executive-dashboard-engine.js => smnyl-executive-dashboard-engine.js<br>./smnyl-automation-engine.js => smnyl-automation-engine.js<br>./smnyl-anomaly-engine.js => smnyl-anomaly-engine.js<br>./smnyl-time-block-engine.js => smnyl-time-block-engine.js | 9 - Compensation |
| `smnyl-opportunity-engine.js` | compensation | `compensation/smnyl-opportunity-engine.js` | BAJO | - | 9 - Compensation |
| `smnyl-performance-engine.js` | compensation | `compensation/smnyl-performance-engine.js` | BAJO | - | 9 - Compensation |
| `smnyl-persistencia-engine.js` | compensation | `compensation/smnyl-persistencia-engine.js` | MEDIO | - | 9 - Compensation |
| `smnyl-pipeline-engine.js` | compensation | `compensation/smnyl-pipeline-engine.js` | BAJO | - | 9 - Compensation |
| `smnyl-prima-engine.js` | compensation | `compensation/smnyl-prima-engine.js` | MEDIO | ./smnyl-productos-vida.js => smnyl-productos-vida.js<br>./smnyl-productos-gmm.js => smnyl-productos-gmm.js | 9 - Compensation |
| `smnyl-produccion-engine.js` | compensation | `compensation/smnyl-produccion-engine.js` | MEDIO | ./smnyl-prima-engine.js => smnyl-prima-engine.js | 9 - Compensation |
| `smnyl-productividad-engine.js` | compensation | `compensation/smnyl-productividad-engine.js` | BAJO | - | 9 - Compensation |
| `smnyl-productos-gmm.js` | compensation | `compensation/smnyl-productos-gmm.js` | MEDIO | - | 9 - Compensation |
| `smnyl-productos-vida.js` | compensation | `compensation/smnyl-productos-vida.js` | MEDIO | - | 9 - Compensation |
| `smnyl-reminders-engine.js` | compensation | `compensation/smnyl-reminders-engine.js` | MEDIO | - | 9 - Compensation |
| `smnyl-renovaciones-engine.js` | compensation | `compensation/smnyl-renovaciones-engine.js` | BAJO | - | 9 - Compensation |
| `smnyl-retencion-engine.js` | compensation | `compensation/smnyl-retencion-engine.js` | MEDIO | - | 9 - Compensation |
| `smnyl-risk-engine.js` | compensation | `compensation/smnyl-risk-engine.js` | BAJO | - | 9 - Compensation |
| `smnyl-streak-engine.js` | compensation | `compensation/smnyl-streak-engine.js` | BAJO | - | 9 - Compensation |
| `smnyl-time-block-engine.js` | compensation | `compensation/smnyl-time-block-engine.js` | MEDIO | - | 9 - Compensation |
| `smnyl-training-allowance-engine.js` | compensation | `compensation/smnyl-training-allowance-engine.js` | MEDIO | ./smnyl-concursos-config.js => smnyl-concursos-config.js | 9 - Compensation |
| `solucionline-retirement-parser.js` | legacy | `legacy/solucionline-retirement-parser.js` | MEDIO | - | 11 - Legacy quarantine |
| `source-ownership-registry-validation-test.js` | tests | `tests/source-ownership-registry-validation-test.js` | MEDIO | ./source-ownership-registry.js => source-ownership-registry.js | 2 - Tests y fixtures |
| `source-ownership-registry.js` | shared-intelligence | `shared-intelligence/source-ownership-registry.js` | MEDIO | - | 3 - Shared intelligence |
| `src/intelligence/phase-zero-blueprint-engine.js` | legacy | `src/intelligence/phase-zero-blueprint-engine.js` | BAJO | - | 11 - Legacy quarantine |
| `src/intelligence/process/process-advancement-engine.js` | legacy | `src/intelligence/process/process-advancement-engine.js` | BAJO | ./process-advancement-rules => src/intelligence/process/process-advancement-rules.js | 11 - Legacy quarantine |
| `src/intelligence/process/process-advancement-rules.js` | rule-packs | `rule-packs/process-advancement-rules.js` | BAJO | ./process-advancement-types => src/intelligence/process/process-advancement-types.js | 4 - Rule packs |
| `src/intelligence/process/process-advancement-types.js` | legacy | `src/intelligence/process/process-advancement-types.js` | BAJO | - | 11 - Legacy quarantine |
| `src/intelligence/tests/phase-zero-blueprint-engine.test.js` | tests | `src/intelligence/tests/phase-zero-blueprint-engine.test.js` | BAJO | ../phase-zero-blueprint-engine.js => src/intelligence/phase-zero-blueprint-engine.js | 2 - Tests y fixtures |
| `src/intelligence/tests/process-advancement-engine.test.js` | tests | `src/intelligence/tests/process-advancement-engine.test.js` | BAJO | ../process/process-advancement-types => src/intelligence/process/process-advancement-types.js<br>../process/process-advancement-rules => src/intelligence/process/process-advancement-rules.js | 2 - Tests y fixtures |
| `src/intelligence/tests/process-advancement-real-world-validation.test.js` | tests | `src/intelligence/tests/process-advancement-real-world-validation.test.js` | BAJO | ../process/process-advancement-types => src/intelligence/process/process-advancement-types.js<br>../process/process-advancement-rules => src/intelligence/process/process-advancement-rules.js | 2 - Tests y fixtures |
| `src/intelligence/tests/process-advancement-stress-test.js` | tests | `src/intelligence/tests/process-advancement-stress-test.js` | BAJO | ../process/process-advancement-types => src/intelligence/process/process-advancement-types.js<br>../process/process-advancement-rules => src/intelligence/process/process-advancement-rules.js | 2 - Tests y fixtures |
| `staging-cleanup-engine.js` | policy-operations | `policy-operations/staging-cleanup-engine.js` | BAJO | - | 6 - Policy operations |
| `staging-review-engine.js` | policy-operations | `policy-operations/staging-review-engine.js` | BAJO | - | 6 - Policy operations |
| `state-manager.js` | manager-os | `manager-os/state-manager.js` | ALTO | ./event-system.js => event-system.js | 8 - Manager OS |
| `storage-engine.js` | platform | `platform/storage-engine.js` | MEDIO | ./storage-validator.js => storage-validator.js<br>./storage-queue.js => storage-queue.js | 10 - Platform |
| `storage-queue.js` | platform | `platform/storage-queue.js` | MEDIO | - | 10 - Platform |
| `storage-validator.js` | platform | `platform/storage-validator.js` | MEDIO | - | 10 - Platform |
| `store.js` | platform | `platform/store.js` | MEDIO | - | 10 - Platform |
| `supabase-runtime.js` | platform | `platform/supabase-runtime.js` | ALTO | - | 10 - Platform |
| `surgery-intelligence-engine.js` | product-intelligence | `product-intelligence/surgery-intelligence-engine.js` | MEDIO | - | 5 - Product intelligence |
| `surgery-smoke-test.js` | tests | `tests/surgery-smoke-test.js` | MEDIO | ./surgery-intelligence-engine.js => surgery-intelligence-engine.js | 2 - Tests y fixtures |
| `sw-cache-config.js` | platform | `platform/sw-cache-config.js` | ALTO | - | 10 - Platform |
| `sync-engine.js` | platform | `platform/sync-engine.js` | MEDIO | ./runtime.js => runtime.js | 10 - Platform |
| `sync-orchestrator.js` | platform | `platform/sync-orchestrator.js` | MEDIO | ./offline-sync.js => offline-sync.js<br>./realtime-engine.js => realtime-engine.js<br>./state-manager.js => state-manager.js<br>./event-system.js => event-system.js | 10 - Platform |
| `sync-queue-runtime.js` | platform | `platform/sync-queue-runtime.js` | ALTO | - | 10 - Platform |
| `task-engine.js` | policy-operations | `policy-operations/task-engine.js` | BAJO | - | 6 - Policy operations |
| `task-feed-engine.js` | policy-operations | `policy-operations/task-feed-engine.js` | BAJO | - | 6 - Policy operations |
| `task-priority-engine.js` | policy-operations | `policy-operations/task-priority-engine.js` | BAJO | - | 6 - Policy operations |
| `task-quick-action-engine.js` | policy-operations | `policy-operations/task-quick-action-engine.js` | BAJO | - | 6 - Policy operations |
| `team-activity-engine.js` | manager-os | `manager-os/team-activity-engine.js` | BAJO | - | 8 - Manager OS |
| `team-dashboard-engine.js` | manager-os | `manager-os/team-dashboard-engine.js` | BAJO | - | 8 - Manager OS |
| `team-momentum-engine.js` | manager-os | `manager-os/team-momentum-engine.js` | BAJO | - | 8 - Manager OS |
| `team-structure-engine.js` | manager-os | `manager-os/team-structure-engine.js` | BAJO | - | 8 - Manager OS |
| `telemetry.js` | platform | `platform/telemetry.js` | MEDIO | - | 10 - Platform |
| `territoriality-intelligence-engine.js` | product-intelligence | `product-intelligence/territoriality-intelligence-engine.js` | MEDIO | - | 5 - Product intelligence |
| `territoriality-smoke-test.js` | tests | `tests/territoriality-smoke-test.js` | MEDIO | ./territoriality-intelligence-engine.js => territoriality-intelligence-engine.js | 2 - Tests y fixtures |
| `tests/business-rules-test.js` | tests | `tests/business-rules-test.js` | BAJO | ../product-detection-engine.js => product-detection-engine.js<br>../currency-normalization-engine.js => currency-normalization-engine.js<br>../presentation-input-pipeline.js => presentation-input-pipeline.js | 2 - Tests y fixtures |
| `tests/critical-path-test.js` | tests | `tests/critical-path-test.js` | BAJO | ../product-detection-engine.js => product-detection-engine.js<br>../product-knowledge-link-engine.js => product-knowledge-link-engine.js<br>../currency-normalization-engine.js => currency-normalization-engine.js<br>../projection-engine.js => projection-engine.js<br>../projection-milestone-engine.js => projection-milestone-engine.js<br>../dynamic-cash-value-projection-engine.js => dynamic-cash-value-projection-engine.js<br>... +1 | 2 - Tests y fixtures |
| `tests/fixtures/presentation-basic-imagina-ser.json` | tests | `tests/fixtures/presentation-basic-imagina-ser.json` | BAJO | - | 2 - Tests y fixtures |
| `tests/gmm-out-of-pocket-test.js` | tests | `tests/gmm-out-of-pocket-test.js` | BAJO | ../policy-ocr-engine.js => policy-ocr-engine.js<br>../gmm-quote-parser.js => gmm-quote-parser.js<br>../gmm-out-of-pocket-engine.js => gmm-out-of-pocket-engine.js | 2 - Tests y fixtures |
| `tests/module-integrity-test.js` | tests | `tests/module-integrity-test.js` | BAJO | - | 2 - Tests y fixtures |
| `tests/presentation-pipeline-test.js` | tests | `tests/presentation-pipeline-test.js` | BAJO | ../presentation-input-pipeline.js => presentation-input-pipeline.js | 2 - Tests y fixtures |
| `tests/real-gmm-quote-test.js` | tests | `tests/real-gmm-quote-test.js` | BAJO | ../policy-ocr-engine.js => policy-ocr-engine.js<br>../gmm-quote-parser.js => gmm-quote-parser.js | 2 - Tests y fixtures |
| `tests/real-pdf-ocr-test.js` | tests | `tests/real-pdf-ocr-test.js` | BAJO | ../policy-ocr-engine.js => policy-ocr-engine.js | 2 - Tests y fixtures |
| `tests/real-retirement-mxn-scenario-test.js` | tests | `tests/real-retirement-mxn-scenario-test.js` | BAJO | ../policy-ocr-engine.js => policy-ocr-engine.js<br>../solucionline-retirement-parser.js => solucionline-retirement-parser.js<br>../retirement-presentation-scenario-engine.js => retirement-presentation-scenario-engine.js | 2 - Tests y fixtures |
| `tests/real-retirement-scenario-test.js` | tests | `tests/real-retirement-scenario-test.js` | BAJO | ../policy-ocr-engine.js => policy-ocr-engine.js<br>../solucionline-retirement-parser.js => solucionline-retirement-parser.js | 2 - Tests y fixtures |
| `tests/run-all-tests.js` | tests | `tests/run-all-tests.js` | BAJO | - | 2 - Tests y fixtures |
| `tests/smoke-test.js` | tests | `tests/smoke-test.js` | BAJO | ../policy-timeline-engine.js => policy-timeline-engine.js<br>../policy-renewal-engine.js => policy-renewal-engine.js<br>../product-detection-engine.js => product-detection-engine.js | 2 - Tests y fixtures |
| `tests/vida-mujer-real-test.js` | tests | `tests/vida-mujer-real-test.js` | BAJO | - | 2 - Tests y fixtures |
| `tests/vida-mujer-survival-schedule-test.js` | tests | `tests/vida-mujer-survival-schedule-test.js` | BAJO | ../vida-mujer-survival-schedule-engine.js => vida-mujer-survival-schedule-engine.js | 2 - Tests y fixtures |
| `tone-performance-engine.js` | legacy | `legacy/tone-performance-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `tone-profile-engine.js` | legacy | `legacy/tone-profile-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `ui-render-engine.js` | platform | `platform/ui-render-engine.js` | MEDIO | - | 10 - Platform |
| `universal-command-engine.js` | platform | `platform/universal-command-engine.js` | ALTO | - | 10 - Platform |
| `universal-filters-engine.js` | legacy | `legacy/universal-filters-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `universal-search-engine.js` | platform | `platform/universal-search-engine.js` | ALTO | - | 10 - Platform |
| `utils.js` | platform | `platform/utils.js` | ALTO | ./runtime.js => runtime.js<br>./overlay-manager.js => overlay-manager.js | 10 - Platform |
| `vida-mujer-client-explanation-report.js` | product-intelligence | `product-intelligence/vida-mujer-client-explanation-report.js` | BAJO | - | 5 - Product intelligence |
| `vida-mujer-client-presentation-engine.js` | product-intelligence | `product-intelligence/vida-mujer-client-presentation-engine.js` | MEDIO | - | 5 - Product intelligence |
| `vida-mujer-client-presentation-test.js` | tests | `tests/vida-mujer-client-presentation-test.js` | MEDIO | ./fixtures/vida-mujer-fixture.json => fixtures/vida-mujer-fixture.json<br>./vida-mujer-client-presentation-engine => vida-mujer-client-presentation-engine.js<br>./shared-price-placement-engine => shared-price-placement-engine.js | 2 - Tests y fixtures |
| `vida-mujer-coverage-status-engine.js` | product-intelligence | `product-intelligence/vida-mujer-coverage-status-engine.js` | MEDIO | - | 5 - Product intelligence |
| `vida-mujer-coverage-status-report.js` | product-intelligence | `product-intelligence/vida-mujer-coverage-status-report.js` | MEDIO | ./vida-mujer-coverage-status-engine => vida-mujer-coverage-status-engine.js | 5 - Product intelligence |
| `vida-mujer-event-benefits-report.js` | product-intelligence | `product-intelligence/vida-mujer-event-benefits-report.js` | MEDIO | ./event-benefit-engine => event-benefit-engine.js | 5 - Product intelligence |
| `vida-mujer-financial-correction-report.js` | product-intelligence | `product-intelligence/vida-mujer-financial-correction-report.js` | MEDIO | ./vida-mujer-knowledge-extractor => vida-mujer-knowledge-extractor.js<br>./shared-financial-return-engine => shared-financial-return-engine.js<br>./shared-premium-growth-engine => shared-premium-growth-engine.js<br>./shared-protection-efficiency-engine => shared-protection-efficiency-engine.js<br>./shared-human-financial-language-engine => shared-human-financial-language-engine.js | 5 - Product intelligence |
| `vida-mujer-financial-fixture-report.js` | product-intelligence | `product-intelligence/vida-mujer-financial-fixture-report.js` | MEDIO | ./fixtures/vida-mujer-quote-fixture.json => fixtures/vida-mujer-quote-fixture.json<br>./exchange-rate-cache-engine => exchange-rate-cache-engine.js | 5 - Product intelligence |
| `vida-mujer-knowledge-extractor-report.js` | product-intelligence | `product-intelligence/vida-mujer-knowledge-extractor-report.js` | MEDIO | ./vida-mujer-knowledge-extractor => vida-mujer-knowledge-extractor.js | 5 - Product intelligence |
| `vida-mujer-knowledge-extractor.js` | product-intelligence | `product-intelligence/vida-mujer-knowledge-extractor.js` | MEDIO | - | 5 - Product intelligence |
| `vida-mujer-master-test.js` | tests | `tests/vida-mujer-master-test.js` | BAJO | - | 2 - Tests y fixtures |
| `vida-mujer-pdf-ave-integration-report.js` | product-intelligence | `product-intelligence/vida-mujer-pdf-ave-integration-report.js` | MEDIO | ./shared-ave-portfolio-engine => shared-ave-portfolio-engine.js<br>./shared-ave-death-benefit-engine => shared-ave-death-benefit-engine.js<br>./shared-ave-eligibility-engine => shared-ave-eligibility-engine.js | 5 - Product intelligence |
| `vida-mujer-pdf-intake-report.js` | product-intelligence | `product-intelligence/vida-mujer-pdf-intake-report.js` | BAJO | - | 5 - Product intelligence |
| `vida-mujer-protected-diseases-engine.js` | product-intelligence | `product-intelligence/vida-mujer-protected-diseases-engine.js` | MEDIO | ./future-currency-value-engine => future-currency-value-engine.js | 5 - Product intelligence |
| `vida-mujer-protected-diseases-report.js` | product-intelligence | `product-intelligence/vida-mujer-protected-diseases-report.js` | MEDIO | ./vida-mujer-protected-diseases-engine => vida-mujer-protected-diseases-engine.js | 5 - Product intelligence |
| `vida-mujer-rule-consistency-report.js` | product-intelligence | `product-intelligence/vida-mujer-rule-consistency-report.js` | BAJO | - | 5 - Product intelligence |
| `vida-mujer-status.js` | product-intelligence | `product-intelligence/vida-mujer-status.js` | BAJO | - | 5 - Product intelligence |
| `vida-mujer-survival-schedule-engine.js` | product-intelligence | `product-intelligence/vida-mujer-survival-schedule-engine.js` | MEDIO | - | 5 - Product intelligence |
| `virtual-list-engine.js` | legacy | `legacy/virtual-list-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `virtual-list.js` | legacy | `legacy/virtual-list.js` | MEDIO | - | 11 - Legacy quarantine |
| `visibility-runtime.js` | platform | `platform/visibility-runtime.js` | ALTO | - | 10 - Platform |
| `warm-market-segmentation-engine.js` | legacy | `legacy/warm-market-segmentation-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `whatsapp-action-engine.js` | legacy | `legacy/whatsapp-action-engine.js` | MEDIO | - | 11 - Legacy quarantine |
| `whatsapp-link-engine.js` | legacy | `legacy/whatsapp-link-engine.js` | MEDIO | - | 11 - Legacy quarantine |

## 14. Criterio de aprobacion antes de implementar

- Aprobar explicitamente batch por batch.
- Confirmar si archivos root de pruebas maestras deben moverse a `tests/` o mantenerse hasta estabilizar imports.
- Crear primero dry-run tooling si se desea automatizar movimientos.
- Ejecutar pruebas antes y despues de cada batch.
- Commit por batch funcional, sin `git add .`, sin push salvo solicitud explicita.
