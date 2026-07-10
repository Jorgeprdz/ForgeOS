# 107Z6 — Runtime owner entrypoint evidence

Status: **PASS**

Outcome: `ADR_PREPARATION_REQUIRED`

Candidate runtime path count: **4**

## Candidate runtime paths

- `platform/adapters/quote-read-model/quote-read-model-adapter-069c.js`
- `supabase/functions/semantic-extract/index.ts`
- `compensation/partner-manager/partner-payout-truth-gate.js`
- `gmm-advisor-review-engine.js`

## Ranked entrypoint candidates

### `docs/static-preview/forge-alive/index.html`

- Score: `14`
- Domain: `docs`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `true`
- Quote relevance: `true`
- Entrypoint-name signal: `true`
- Bootstrap signals: `22`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{
  "docs/static-preview/forge-alive/index.html": [
    "docs/static-preview/forge-alive/index.html"
  ]
}
```

### `supabase/functions/semantic-extract/index.ts`

- Score: `12`
- Domain: `supabase`
- References engine: `false`
- References runtime candidate: `true`
- References modal: `false`
- References UI: `false`
- Quote relevance: `true`
- Entrypoint-name signal: `true`
- Bootstrap signals: `0`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{
  "supabase/functions/semantic-extract/index.ts": [
    "supabase/functions/semantic-extract/index.ts"
  ]
}
```

### `forge-gmm-sprint-3-smoke-test.js`

- Score: `11`
- Domain: `forge-gmm-sprint-3-smoke-test.js`
- References engine: `false`
- References runtime candidate: `true`
- References modal: `false`
- References UI: `false`
- Quote relevance: `true`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `["gmm-advisor-review-engine.js"]`

Reachable targets:

```json
{
  "gmm-advisor-review-engine.js": [
    "forge-gmm-sprint-3-smoke-test.js",
    "gmm-advisor-review-engine.js"
  ]
}
```

### `forge-gmm-sprint-4-smoke-test.js`

- Score: `11`
- Domain: `forge-gmm-sprint-4-smoke-test.js`
- References engine: `false`
- References runtime candidate: `true`
- References modal: `false`
- References UI: `false`
- Quote relevance: `true`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `["gmm-advisor-review-engine.js"]`

Reachable targets:

```json
{
  "gmm-advisor-review-engine.js": [
    "forge-gmm-sprint-4-smoke-test.js",
    "gmm-advisor-review-engine.js"
  ]
}
```

### `app.js`

- Score: `10`
- Domain: `app.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `true`
- Bootstrap signals: `14`
- Storage signals: `1`
- Events: `["click", "theme:changed"]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `docs/static-preview/forge-alive/assets/forge-quote-preview-confirmation-modal-107q.js`

- Score: `10`
- Domain: `docs`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `true`
- References UI: `false`
- Quote relevance: `true`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `0`
- Events: `["DOMContentLoaded", "click", "forge:quote-preview:confirmation:accepted", "forge:quote-preview:confirmation:edit", "forge:quote-preview:extraction-ready"]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{
  "docs/static-preview/forge-alive/assets/forge-quote-preview-confirmation-modal-107q.js": [
    "docs/static-preview/forge-alive/assets/forge-quote-preview-confirmation-modal-107q.js"
  ]
}
```

### `compensation/partner-manager/partner-payout-truth-gate.js`

- Score: `9`
- Domain: `compensation`
- References engine: `false`
- References runtime candidate: `true`
- References modal: `false`
- References UI: `false`
- Quote relevance: `true`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{
  "compensation/partner-manager/partner-payout-truth-gate.js": [
    "compensation/partner-manager/partner-payout-truth-gate.js"
  ]
}
```

### `gmm-advisor-review-engine.js`

- Score: `9`
- Domain: `gmm-advisor-review-engine.js`
- References engine: `false`
- References runtime candidate: `true`
- References modal: `false`
- References UI: `false`
- Quote relevance: `true`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{
  "gmm-advisor-review-engine.js": [
    "gmm-advisor-review-engine.js"
  ]
}
```

### `platform/adapters/quote-read-model/quote-read-model-adapter-069c.js`

- Score: `9`
- Domain: `platform`
- References engine: `false`
- References runtime candidate: `true`
- References modal: `false`
- References UI: `false`
- Quote relevance: `true`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{
  "platform/adapters/quote-read-model/quote-read-model-adapter-069c.js": [
    "platform/adapters/quote-read-model/quote-read-model-adapter-069c.js"
  ]
}
```

### `index.html`

- Score: `8`
- Domain: `index.html`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `true`
- Bootstrap signals: `8`
- Storage signals: `0`
- Events: `["load"]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `orvi-client-report-test.js`

- Score: `8`
- Domain: `orvi-client-report-test.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `true`
- Entrypoint-name signal: `false`
- Bootstrap signals: `2`
- Storage signals: `3`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `orvi-mxn-master-test.js`

- Score: `8`
- Domain: `orvi-mxn-master-test.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `true`
- Entrypoint-name signal: `false`
- Bootstrap signals: `2`
- Storage signals: `3`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `platform/app/bootstrap.js`

- Score: `8`
- Domain: `platform`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `true`
- Bootstrap signals: `8`
- Storage signals: `0`
- Events: `["DOMContentLoaded"]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `segu-beca-meaningful-numbers-report.js`

- Score: `8`
- Domain: `segu-beca-meaningful-numbers-report.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `true`
- Entrypoint-name signal: `false`
- Bootstrap signals: `2`
- Storage signals: `3`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `dashboard.js`

- Score: `7`
- Domain: `dashboard.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `7`
- Storage signals: `1`
- Events: `["click", "dashboard:error", "dashboard:loaded"]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `network-manager.js`

- Score: `7`
- Domain: `network-manager.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `3`
- Storage signals: `2`
- Events: `["network:latency", "network:offline", "network:online", "offline", "online"]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `platform/adapters/quote-preview/quote-preview-pdf-engine-canonical-execution-readiness-review-matrix-adapter-080b.js`

- Score: `6`
- Domain: `platform`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `true`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `1`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `retirement-presentation-scenario-engine.js`

- Score: `6`
- Domain: `retirement-presentation-scenario-engine.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `true`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `7`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `design-system-preview.html`

- Score: `5`
- Domain: `design-system-preview.html`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `7`
- Storage signals: `0`
- Events: `["change", "click"]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `referidos.js`

- Score: `5`
- Domain: `referidos.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `1`
- Storage signals: `2`
- Events: `["click", "input"]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `runtime.js`

- Score: `5`
- Domain: `runtime.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `true`
- Bootstrap signals: `0`
- Storage signals: `0`
- Events: `["abort"]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `scripts/process-note.js`

- Score: `5`
- Domain: `scripts`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `4`
- Storage signals: `4`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `scripts/repo-doc-migration-harness.js`

- Score: `5`
- Domain: `scripts`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `4`
- Storage signals: `10`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `scripts/test-repo-migration-harness.js`

- Score: `5`
- Domain: `scripts`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `3`
- Storage signals: `1`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `utils.js`

- Score: `5`
- Domain: `utils.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `7`
- Storage signals: `0`
- Events: `["click", "keydown"]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `virtual-list-engine.js`

- Score: `5`
- Domain: `virtual-list-engine.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `4`
- Storage signals: `0`
- Events: `["scroll"]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `virtual-list.js`

- Score: `5`
- Domain: `virtual-list.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `4`
- Storage signals: `0`
- Events: `["scroll"]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `ai-service.js`

- Score: `4`
- Domain: `ai-service.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `5`
- Events: `["ai:response"]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `base-repository.js`

- Score: `4`
- Domain: `base-repository.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `2`
- Storage signals: `8`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `db.js`

- Score: `4`
- Domain: `db.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `2`
- Storage signals: `12`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `document-classification-engine.js`

- Score: `4`
- Domain: `document-classification-engine.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `true`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `dynamic-cash-value-projection-engine.js`

- Score: `4`
- Domain: `dynamic-cash-value-projection-engine.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `true`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `forge-gmm-real-case-smoke-test.js`

- Score: `4`
- Domain: `forge-gmm-real-case-smoke-test.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `true`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `forge-gmm-sprint-2-smoke-test.js`

- Score: `4`
- Domain: `forge-gmm-sprint-2-smoke-test.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `true`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `forge-vida-mujer-advisor-report.js`

- Score: `4`
- Domain: `forge-vida-mujer-advisor-report.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `true`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `gmm-quote-summary-engine.js`

- Score: `4`
- Domain: `gmm-quote-summary-engine.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `true`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `imagina-ser-master-test.js`

- Score: `4`
- Domain: `imagina-ser-master-test.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `2`
- Storage signals: `7`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `imagina-ser-objection-engine.js`

- Score: `4`
- Domain: `imagina-ser-objection-engine.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `true`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `legacy/crmaddlife/ui-listeners.js`

- Score: `4`
- Domain: `legacy`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `2`
- Events: `["change"]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `manager-os/historical-analytics/storage/manager-historical-query-plan-contract.js`

- Score: `4`
- Domain: `manager-os`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `2`
- Storage signals: `1`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `market-data-master-test.js`

- Score: `4`
- Domain: `market-data-master-test.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `2`
- Storage signals: `8`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `nash-combat-intelligence-report-engine.js`

- Score: `4`
- Domain: `nash-combat-intelligence-report-engine.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `true`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `orvi-client-presentation-engine.js`

- Score: `4`
- Domain: `orvi-client-presentation-engine.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `true`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `orvi-objection-engine.js`

- Score: `4`
- Domain: `orvi-objection-engine.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `true`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `platform/adapters/opportunity-pipeline/opportunity-pipeline-read-only-adapter-066b.js`

- Score: `4`
- Domain: `platform`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `true`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `platform/adapters/product-intelligence/product-intelligence-read-model-adapter-073d.js`

- Score: `4`
- Domain: `platform`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `true`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `platform/adapters/quote-preview/quote-preview-pdf-product-intelligence-integration-adapter-075b.js`

- Score: `4`
- Domain: `platform`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `true`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `platform/adapters/quote-preview/quote-preview-product-intelligence-binding-adapter-074b.js`

- Score: `4`
- Domain: `platform`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `true`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `platform/routing/enterprise-router.js`

- Score: `4`
- Domain: `platform`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `2`
- Storage signals: `0`
- Events: `["route:changed"]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `presentation-input-context-builder.js`

- Score: `4`
- Domain: `presentation-input-context-builder.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `true`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `presentation-input-pipeline.js`

- Score: `4`
- Domain: `presentation-input-pipeline.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `true`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `product-detection-engine.js`

- Score: `4`
- Domain: `product-detection-engine.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `true`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `product-intelligence/knowledge/ave/shared-ave-portfolio-engine.js`

- Score: `4`
- Domain: `product-intelligence`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `true`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `product-intelligence/knowledge/vida-mujer-client-explanation-report.js`

- Score: `4`
- Domain: `product-intelligence`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `true`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `product-intelligence/quotes/quotation-extraction-result.entity.js`

- Score: `4`
- Domain: `product-intelligence`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `true`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `product-knowledge-link-engine.js`

- Score: `4`
- Domain: `product-knowledge-link-engine.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `true`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `proposal-family-engine.js`

- Score: `4`
- Domain: `proposal-family-engine.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `true`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `prospeccion.js`

- Score: `4`
- Domain: `prospeccion.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `4`
- Events: `["click"]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `quotation-currency-bridge.js`

- Score: `4`
- Domain: `quotation-currency-bridge.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `true`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `quotation-field-normalizer.js`

- Score: `4`
- Domain: `quotation-field-normalizer.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `true`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `quote-to-policy-comparison-engine.js`

- Score: `4`
- Domain: `quote-to-policy-comparison-engine.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `true`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `segu-beca-client-presentation-engine.js`

- Score: `4`
- Domain: `segu-beca-client-presentation-engine.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `true`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `segu-beca-mxn-appendix-report.js`

- Score: `4`
- Domain: `segu-beca-mxn-appendix-report.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `2`
- Storage signals: `3`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `segu-beca-mxn-timeline-clean-report.js`

- Score: `4`
- Domain: `segu-beca-mxn-timeline-clean-report.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `2`
- Storage signals: `3`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `semantic-extract-acceptance-test.js`

- Score: `4`
- Domain: `semantic-extract-acceptance-test.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `true`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `service-worker.js`

- Score: `4`
- Domain: `service-worker.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `10`
- Events: `["activate", "fetch", "install"]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `shared-objection-shield-engine.js`

- Score: `4`
- Domain: `shared-objection-shield-engine.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `true`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `storage-engine.js`

- Score: `4`
- Domain: `storage-engine.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `2`
- Storage signals: `19`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `vida-mujer-financial-fixture-report.js`

- Score: `4`
- Domain: `vida-mujer-financial-fixture-report.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `2`
- Storage signals: `3`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `vida-mujer-pdf-ave-integration-report.js`

- Score: `4`
- Domain: `vida-mujer-pdf-ave-integration-report.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `true`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `accessibility-engine.js`

- Score: `3`
- Domain: `accessibility-engine.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `1`
- Storage signals: `0`
- Events: `["keydown", "mousedown"]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `advisor-lifecycle/advisor-career-clock.js`

- Score: `3`
- Domain: `advisor-lifecycle`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `7`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `cartera.js`

- Score: `3`
- Domain: `cartera.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `1`
- Storage signals: `0`
- Events: `["cartera:mounted", "cartera:updated", "change", "click", "input"]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `client-engagement-engine.js`

- Score: `3`
- Domain: `client-engagement-engine.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `3`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `compensation/advisor-development/advisor-development-monthly-income-candidate-orchestrator.js`

- Score: `3`
- Domain: `compensation`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `5`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `compensation/contracts/career-month-resolver.js`

- Score: `3`
- Domain: `compensation`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `5`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `compensation/partner-manager/advisor-economic-output-period.js`

- Score: `3`
- Domain: `compensation`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `9`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `compensation/partner-manager/partner-monthly-income-candidate-orchestrator.js`

- Score: `3`
- Domain: `compensation`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `5`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `compensation/partner-manager/partner-quarterly-bonus-calculator.js`

- Score: `3`
- Domain: `compensation`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `14`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `core-app-engine.js`

- Score: `3`
- Domain: `core-app-engine.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `10`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `crash-runtime.js`

- Score: `3`
- Domain: `crash-runtime.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `1`
- Storage signals: `0`
- Events: `["error", "unhandledrejection"]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `fixture-validation-test.js`

- Score: `3`
- Domain: `fixture-validation-test.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `3`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `health-runtime.js`

- Score: `3`
- Domain: `health-runtime.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `1`
- Storage signals: `0`
- Events: `["change"]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `legacy/crmaddlife/ui-shell.js`

- Score: `3`
- Domain: `legacy`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `1`
- Storage signals: `0`
- Events: `["click"]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `manager-os/github-pages-static-preview/github-pages-static-preview-boundary-contract.js`

- Score: `3`
- Domain: `manager-os`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `1`
- Storage signals: `3`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `module-lifecycle.js`

- Score: `3`
- Domain: `module-lifecycle.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `4`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `performance-monitor.js`

- Score: `3`
- Domain: `performance-monitor.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `1`
- Storage signals: `0`
- Events: `["performance:longtask", "performance:memory"]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `performance-runtime.js`

- Score: `3`
- Domain: `performance-runtime.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `4`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `platform/app/forge-app-shell.js`

- Score: `3`
- Domain: `platform`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `12`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `platform/auth/auth-service.js`

- Score: `3`
- Domain: `platform`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `3`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `platform/sync/sync-engine.js`

- Score: `3`
- Domain: `platform`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `1`
- Storage signals: `0`
- Events: `["online"]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `platform/sync/sync-orchestrator.js`

- Score: `3`
- Domain: `platform`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `1`
- Storage signals: `0`
- Events: `["actividad_diaria", "cartera", "realtime:update", "sync:completed", "sync:failed"]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `platform/truth/index.js`

- Score: `3`
- Domain: `platform`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `true`
- Bootstrap signals: `0`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `platform/truth/validators/index.js`

- Score: `3`
- Domain: `platform`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `true`
- Bootstrap signals: `0`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `referral-opportunity-engine.js`

- Score: `3`
- Domain: `referral-opportunity-engine.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `3`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `relationship-next-action-engine.js`

- Score: `3`
- Domain: `relationship-next-action-engine.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `3`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `relationship-timeline-engine.js`

- Score: `3`
- Domain: `relationship-timeline-engine.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `3`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `responsive-engine.js`

- Score: `3`
- Domain: `responsive-engine.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `1`
- Storage signals: `0`
- Events: `["resize"]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `scripts/runtime-module-graph-audit.js`

- Score: `3`
- Domain: `scripts`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `4`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `src/intelligence/alpha-runtime/index.js`

- Score: `3`
- Domain: `src`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `true`
- Bootstrap signals: `0`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `src/intelligence/claimability/index.js`

- Score: `3`
- Domain: `src`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `true`
- Bootstrap signals: `0`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `src/intelligence/hdl/index.js`

- Score: `3`
- Domain: `src`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `true`
- Bootstrap signals: `0`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `src/intelligence/ledger/index.js`

- Score: `3`
- Domain: `src`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `true`
- Bootstrap signals: `0`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `src/intelligence/truth-resolution/index.js`

- Score: `3`
- Domain: `src`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `true`
- Bootstrap signals: `0`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `telemetry.js`

- Score: `3`
- Domain: `telemetry.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `1`
- Storage signals: `0`
- Events: `["beforeunload", "visibilitychange"]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `actividad.js`

- Score: `2`
- Domain: `actividad.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `0`
- Events: `["actividad:saved", "actividad:updated", "click"]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `cache-runtime.js`

- Score: `2`
- Domain: `cache-runtime.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `9`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `cartera-repository.js`

- Score: `2`
- Domain: `cartera-repository.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `6`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `comisiones.js`

- Score: `2`
- Domain: `comisiones.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `0`
- Events: `["change", "click"]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `domain-runtime.js`

- Score: `2`
- Domain: `domain-runtime.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `1`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `domain-store.js`

- Score: `2`
- Domain: `domain-store.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `3`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `forge-ai-connector-master-test.js`

- Score: `2`
- Domain: `forge-ai-connector-master-test.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `2`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `forge-master-acceptance-test.js`

- Score: `2`
- Domain: `forge-master-acceptance-test.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `2`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `forge-schema-reporter.js`

- Score: `2`
- Domain: `forge-schema-reporter.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `2`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `imagina-ser-real-quote-validation.js`

- Score: `2`
- Domain: `imagina-ser-real-quote-validation.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `2`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `legacy/crmaddlife/chat-shell.js`

- Score: `2`
- Domain: `legacy`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `0`
- Events: `["click", "keydown"]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `manager-os/alfred-review-action-packet-static-preview-dom-renderer.js`

- Score: `2`
- Domain: `manager-os`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `2`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `manager-os/alfred-review-action-packet-ui-view-model.js`

- Score: `2`
- Domain: `manager-os`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `2`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `manager-os/historical-analytics/storage/manager-historical-storage-boundary-contract.js`

- Score: `2`
- Domain: `manager-os`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `1`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `mutation-engine.js`

- Score: `2`
- Domain: `mutation-engine.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `1`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `operational-shell.store.ts`

- Score: `2`
- Domain: `operational-shell.store.ts`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `1`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `platform/app/runtime-listeners.js`

- Score: `2`
- Domain: `platform`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `0`
- Events: `["error", "network:offline", "network:online", "offline", "online", "unhandledrejection"]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `platform/commands/command-palette.js`

- Score: `2`
- Domain: `platform`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `0`
- Events: `["input", "keydown"]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `platform/commands/command-palette.store.js`

- Score: `2`
- Domain: `platform`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `1`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `platform/commands/command-palette.tsx`

- Score: `2`
- Domain: `platform`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `1`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `platform/commands/command-shortcuts-engine.js`

- Score: `2`
- Domain: `platform`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `0`
- Events: `["keydown"]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `policy-operations/policy-detail/drag-drop-policy-zone.js`

- Score: `2`
- Domain: `policy-operations`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `0`
- Events: `["dragleave", "dragover", "drop"]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `policy-operations/policy-detail/policy-auto-save-engine.js`

- Score: `2`
- Domain: `policy-operations`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `2`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `policy-operations/policy-timeline/policy-timeline.repository.js`

- Score: `2`
- Domain: `policy-operations`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `2`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `query-cache.js`

- Score: `2`
- Domain: `query-cache.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `7`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `query-runtime.js`

- Score: `2`
- Domain: `query-runtime.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `1`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `scripts/test-supabase.js`

- Score: `2`
- Domain: `scripts`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `2`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `secure-storage.js`

- Score: `2`
- Domain: `secure-storage.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `4`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `src/services/forge-alpha-repository.js`

- Score: `2`
- Domain: `src`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `2`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `src/services/forge-alpha-service.js`

- Score: `2`
- Domain: `src`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `4`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `staging-cleanup-engine.js`

- Score: `2`
- Domain: `staging-cleanup-engine.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `3`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `state-manager.js`

- Score: `2`
- Domain: `state-manager.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `0`
- Events: `["state:updated"]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `storage-validator.js`

- Score: `2`
- Domain: `storage-validator.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `4`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `store.js`

- Score: `2`
- Domain: `store.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `4`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `sw-cache-config.js`

- Score: `2`
- Domain: `sw-cache-config.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `0`
- Storage signals: `2`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `visibility-runtime.js`

- Score: `2`
- Domain: `visibility-runtime.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `2`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `analytics-engine.js`

- Score: `1`
- Domain: `analytics-engine.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `1`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `auth-guard.js`

- Score: `1`
- Domain: `auth-guard.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `1`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `cartera-view.js`

- Score: `1`
- Domain: `cartera-view.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `1`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `error-boundary.js`

- Score: `1`
- Domain: `error-boundary.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `1`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `manager-os/forge-alive/forge-alive-smart-widget-stack-read-model.js`

- Score: `1`
- Domain: `manager-os`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `1`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `manager-os/historical-analytics/manager-historical-analytics-boundary-contract.js`

- Score: `1`
- Domain: `manager-os`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `1`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `manager-os/review-plan-intelligence/manager-review-plan-intelligence-engine.js`

- Score: `1`
- Domain: `manager-os`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `1`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `next-best-question-engine.js`

- Score: `1`
- Domain: `next-best-question-engine.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `1`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `ovelay-manager.js`

- Score: `1`
- Domain: `ovelay-manager.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `1`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `platform/sync/offline-sync.js`

- Score: `1`
- Domain: `platform`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `1`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `policy-operations/tasks/google-calendar-engine.js`

- Score: `1`
- Domain: `policy-operations`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `1`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `smart-header.tsx`

- Score: `1`
- Domain: `smart-header.tsx`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `1`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

### `supabase-runtime.js`

- Score: `1`
- Domain: `supabase-runtime.js`
- References engine: `false`
- References runtime candidate: `false`
- References modal: `false`
- References UI: `false`
- Quote relevance: `false`
- Entrypoint-name signal: `false`
- Bootstrap signals: `1`
- Storage signals: `0`
- Events: `[]`
- Direct runtime imports: `[]`

Reachable targets:

```json
{}
```

## Canonical owner

```json
null
```

## ADR preparation

```json
{
  "PROPOSED_ADR_TITLE": "Quote Preview PDF extraction result persistence and runtime ownership",
  "PROBLEM_STATEMENT": "Forge has a probable canonical PDF preview engine and a confirmation modal, but no proven runtime owner, cache writer, cache reader or complete call chain connecting extraction output to Quote Preview UI.",
  "DECISION_REQUIRED": [
    "Whether extraction output must persist beyond the current invocation.",
    "Whether an existing generic repository or runtime state contract can be reused.",
    "Which module owns the extraction-result lifecycle.",
    "Which cache key or identity is authorized.",
    "Which writer and reader APIs are canonical.",
    "Which event or explicit handoff opens the confirmation modal.",
    "How confirmed data remains preview-only and never becomes quote truth automatically."
  ],
  "OPTIONS_TO_EVALUATE": [
    {
      "option": "REUSE_EXISTING_GENERIC_RUNTIME",
      "condition": "Allowed only if a runtime owner, writer, reader, key and call chain are proven with source evidence."
    },
    {
      "option": "EPHEMERAL_IN_MEMORY_HANDOFF",
      "condition": "Allowed only if persistence is not required and lifecycle, reload behavior and review safety are explicitly accepted."
    },
    {
      "option": "NEW_LOCAL_PREVIEW_CACHE",
      "condition": "Not authorized by this phase. Requires approved ADR, canonical ownership, schema, retention and deletion rules."
    }
  ],
  "NON_NEGOTIABLE_GUARDRAILS": [
    "Product Intelligence remains upstream.",
    "Quote Preview remains downstream.",
    "PDF engine output is reference data, not quote truth.",
    "No duplicate cache, bridge, parser or engine.",
    "No CRM, backend, policy, quote or provider writes.",
    "No UI integration before the contract is approved.",
    "Manual transcription remains fallback-only."
  ],
  "APPROVAL_REQUIRED_BEFORE_IMPLEMENTATION": true
}
```

## Authorization

```json
{
  "IMPLEMENTATION_AUTHORIZED": false,
  "CACHE_CREATION_AUTHORIZED": false,
  "BRIDGE_CREATION_AUTHORIZED": false,
  "UI_INTEGRATION_AUTHORIZED": false,
  "REUSE_DESIGN_GATE_AUTHORIZED": false,
  "ADR_DRAFT_GATE_AUTHORIZED": true,
  "ADR_APPROVED": false
}
```
