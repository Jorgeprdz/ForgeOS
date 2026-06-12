# MIGRATION-006 Rule Packs Move Map

Status: PLANNING COMPLETE

## Scope

This move map covers the **Rule Packs / SMNYL OS** cluster, consisting of 47 files identified as rule engines, product constants, and associated UI components.

## Move Map

| Current Path | Destination Path | Owner | Risk |
|---|---|---|---|
| `smnyl-ai-coach-engine.js` | `rule-packs/smnyl/smnyl-ai-coach-engine.js` | Rule Packs | LOW |
| `smnyl-ai-presence-engine.js` | `rule-packs/smnyl/smnyl-ai-presence-engine.js` | Rule Packs | LOW |
| `smnyl-alerts-engine.js` | `rule-packs/smnyl/smnyl-alerts-engine.js` | Rule Packs | LOW |
| `smnyl-anomaly-engine.js` | `rule-packs/smnyl/smnyl-anomaly-engine.js` | Rule Packs | LOW |
| `smnyl-automation-engine.js` | `rule-packs/smnyl/smnyl-automation-engine.js` | Rule Packs | LOW |
| `smnyl-bonos-engine.js` | `rule-packs/smnyl/smnyl-bonos-engine.js` | Rule Packs | LOW |
| `smnyl-cancelaciones-engine.js` | `rule-packs/smnyl/smnyl-cancelaciones-engine.js` | Rule Packs | LOW |
| `smnyl-comisiones-engine.js` | `rule-packs/smnyl/smnyl-comisiones-engine.js` | Rule Packs | LOW |
| `smnyl-comisiones-gmm.js` | `rule-packs/smnyl/smnyl-comisiones-gmm.js` | Rule Packs | LOW |
| `smnyl-comisiones-vida.js` | `rule-packs/smnyl/smnyl-comisiones-vida.js` | Rule Packs | LOW |
| `smnyl-command-center-engine.js` | `rule-packs/smnyl/smnyl-command-center-engine.js` | Rule Packs | LOW |
| `smnyl-command-palette-engine.js` | `rule-packs/smnyl/smnyl-command-palette-engine.js` | Rule Packs | LOW |
| `smnyl-concursos-engine.js` | `rule-packs/smnyl/smnyl-concursos-engine.js` | Rule Packs | LOW |
| `smnyl-conteo-engine.js` | `rule-packs/smnyl/smnyl-conteo-engine.js` | Rule Packs | LOW |
| `smnyl-cross-sell-engine.js` | `rule-packs/smnyl/smnyl-cross-sell-engine.js` | Rule Packs | LOW |
| `smnyl-decision-engine.js` | `rule-packs/smnyl/smnyl-decision-engine.js` | Rule Packs | LOW |
| `smnyl-executive-dashboard-engine.js` | `rule-packs/smnyl/smnyl-executive-dashboard-engine.js` | Rule Packs | LOW |
| `smnyl-followup-engine.js` | `rule-packs/smnyl/smnyl-followup-engine.js` | Rule Packs | LOW |
| `smnyl-forecast-engine.js` | `rule-packs/smnyl/smnyl-forecast-engine.js` | Rule Packs | LOW |
| `smnyl-goals-engine.js` | `rule-packs/smnyl/smnyl-goals-engine.js` | Rule Packs | LOW |
| `smnyl-health-score-engine.js` | `rule-packs/smnyl/smnyl-health-score-engine.js` | Rule Packs | LOW |
| `smnyl-insights-engine.js` | `rule-packs/smnyl/smnyl-insights-engine.js` | Rule Packs | LOW |
| `smnyl-kpi-engine.js" | `rule-packs/smnyl/smnyl-kpi-engine.js` | Rule Packs | LOW |
| `smnyl-leaderboard-engine.js` | `rule-packs/smnyl/smnyl-leaderboard-engine.js` | Rule Packs | LOW |
| `smnyl-neural-glow-engine.js` | `rule-packs/smnyl/smnyl-neural-glow-engine.js` | Rule Packs | LOW |
| `smnyl-operating-system-engine.js` | `rule-packs/smnyl/smnyl-operating-system-engine.js` | Rule Packs | LOW |
| `smnyl-opportunity-engine.js` | `rule-packs/smnyl/smnyl-opportunity-engine.js" | Rule Packs | LOW |
| `smnyl-performance-engine.js` | `rule-packs/smnyl/smnyl-performance-engine.js` | Rule Packs | LOW |
| `smnyl-persistencia-engine.js` | `rule-packs/smnyl/smnyl-persistencia-engine.js` | Rule Packs | LOW |
| `smnyl-pipeline-engine.js` | `rule-packs/smnyl/smnyl-pipeline-engine.js` | Rule Packs | LOW |
| `smnyl-prima-engine.js` | `rule-packs/smnyl/smnyl-prima-engine.js` | Rule Packs | LOW |
| `smnyl-produccion-engine.js` | `rule-packs/smnyl/smnyl-produccion-engine.js` | Rule Packs | LOW |
| `smnyl-productividad-engine.js` | `rule-packs/smnyl/smnyl-productividad-engine.js` | Rule Packs | LOW |
| `smnyl-productos-gmm.js` | `rule-packs/smnyl/smnyl-productos-gmm.js` | Rule Packs | LOW |
| `smnyl-productos-vida.js` | `rule-packs/smnyl/smnyl-productos-vida.js` | Rule Packs | LOW |
| `smnyl-reminders-engine.js` | `rule-packs/smnyl/smnyl-reminders-engine.js` | Rule Packs | LOW |
| `smnyl-renovaciones-engine.js` | `rule-packs/smnyl/smnyl-renovaciones-engine.js` | Rule Packs | LOW |
| `smnyl-retencion-engine.js` | `rule-packs/smnyl/smnyl-retencion-engine.js` | Rule Packs | LOW |
| `smnyl-risk-engine.js` | `rule-packs/smnyl/smnyl-risk-engine.js` | Rule Packs | LOW |
| `smnyl-streak-engine.js` | `rule-packs/smnyl/smnyl-streak-engine.js` | Rule Packs | LOW |
| `smnyl-time-block-engine.js` | `rule-packs/smnyl/smnyl-time-block-engine.js` | Rule Packs | LOW |
| `smnyl-training-allowance-engine.js` | `rule-packs/smnyl/smnyl-training-allowance-engine.js` | Rule Packs | LOW |
| `smnyl-neural-glow-engine` | `legacy/smnyl-neural-glow-engine` | Legacy | LOW |
| `comisiones-rules-gmm.js` | `legacy/comisiones-rules-gmm.js` | Legacy | LOW |
| `organization-rules-fixture-validation-test.js` | `tests/organization-rules-fixture-validation-test.js` | Test | LOW |
| `concursos.js` | `advisor-os/concursos/concursos.js` | Advisor OS | MEDIUM |
| `dashboard-executive.js` | `advisor-os/dashboard/dashboard-executive.js` | Advisor OS | MEDIUM |

## Destination Summary

- `rule-packs/smnyl/`: 42 files
- `legacy/`: 2 files
- `tests/`: 1 file
- `advisor-os/concursos/`: 1 file
- `advisor-os/dashboard/`: 1 file

## Total Files

Total candidate count: 47
Batch size: 47
