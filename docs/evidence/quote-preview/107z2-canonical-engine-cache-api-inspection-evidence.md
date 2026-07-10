# 107Z2 — Static inspection evidence

Status: **HOLD**

Inspected file count: **38**

## Seed files

- `product-intelligence/evidence/forge-quote-pdf-preview-engine.js`
- `platform/adapters/quote-preview/quote-preview-pdf-product-intelligence-integration-adapter-075b.js`
- `platform/adapters/quote-preview/quote-preview-pdf-engine-repo-promotion-adapter-076b.js`
- `platform/adapters/quote-preview/quote-preview-pdf-engine-existing-surfaces-canonical-mapping-adapter-077b.js`

## Direct imports and references inspected

- `platform/adapters/quote-preview/quote-preview-product-intelligence-binding-adapter-074b.js`
- `platform/adapters/product-intelligence/product-intelligence-read-model-adapter-073d.js`
- `product-intelligence/evidence/gmm-quote-parser.js`
- `gmm-quote-summary-engine.js`
- `product-intelligence/knowledge/vida-mujer-survival-schedule-engine.js`
- `product-intelligence/knowledge/ave/shared-ave-growth-engine.js`
- `product-intelligence/knowledge/ave/shared-ave-portfolio-engine.js`
- `product-intelligence/evidence/solucionline-retirement-parser.js`
- `retirement-future-udi-projection-engine.js`
- `imagina-ser-future-mxn-bridge.js`
- `orvi-decision-engine.js`
- `orvi-mxn-conversion-engine.js`
- `segu-beca-client-presentation-engine.js`
- `segu-beca-education-comparison-engine.js`
- `policy-operations/evidence/policy-ocr-engine.js`
- `tests/real-pdf-ocr-test.js`
- `tests/real-gmm-quote-test.js`
- `tests/gmm-out-of-pocket-test.js`
- `tests/product-intelligence/forge-quote-pdf-preview-engine-test.js`
- `tests/real-retirement-scenario-test.js`
- `tests/real-retirement-mxn-scenario-test.js`
- `retirement-future-udi-projection-smoke-test.js`
- `imagina-ser-master-test.js`
- `exchange-rate-cache-engine.js`
- `imagina-ser-banxico-integration-test.js`
- `shared-banxico-rate-engine.js`
- `shared-banxico-edge-provider.js`
- `tests/quote-preview-product-intelligence-binding-adapter-074b-test.js`
- `tests/quote-preview-pdf-product-intelligence-integration-adapter-075b-test.js`
- `tests/quote-preview-pdf-engine-repo-promotion-adapter-076b-test.js`
- `telemetry.js`

## Named runtime candidates

### runtime.js

- `runtime.js`

### cache-runtime.js

- `cache-runtime.js`

### base-repository.js

- `base-repository.js`

## Per-file evidence

### `base-repository.js`

- SHA-256: `c38283fa5dcd8b133c6158b095b8adb5cb199b98d401fc7055ba6b3017b6addc`
- Classifications: `base_repository_candidate, read_signals, write_signals`
- Exports: `["BaseRepository"]`
- Functions: `[]`
- Classes: `["BaseRepository"]`
- Events: `[]`
- Cache calls: `[{"owner": "this.cache", "method": "delete"}, {"owner": "this.cache", "method": "get"}, {"owner": "this.cache", "method": "set"}]`
- Cache keys: `[]`
- Storage APIs: `[]`
- PDF processing signals: `false`
- Cache writer signals: `true`
- Cache reader signals: `true`

Relevant static lines:

- L1: `// base-repository.js`
- L2: `// Enterprise Repository Base`
- L4: `import {`
- L8: `export class BaseRepository {`
- L15: `this.cache =`
- L73: `this.cache.get(key);`
- L88: `this.cache.delete(key);`
- L101: `this.cache.set(`
- L119: `this.cache.delete(key);`
- L124: `this.cache.clear();`

### `cache-runtime.js`

- SHA-256: `c179a2308ef3c91cfc48094d8013dba51147a5703b9f48be25e5590230a692ba`
- Classifications: `read_signals, runtime_cache_candidate, write_signals`
- Exports: `["CacheRuntime", "default"]`
- Functions: `[]`
- Classes: `["CacheRuntimeEngine"]`
- Events: `[]`
- Cache calls: `[{"owner": "this.cache", "method": "delete"}, {"owner": "this.cache", "method": "get"}, {"owner": "this.cache", "method": "set"}]`
- Cache keys: `[]`
- Storage APIs: `[]`
- PDF processing signals: `false`
- Cache writer signals: `true`
- Cache reader signals: `true`

Relevant static lines:

- L1: `// cache-runtime.js`
- L2: `// Enterprise Memory Cache Runtime`
- L8: `this.cache =`
- L21: `this.cache.set(`
- L38: `this.cache.get(key);`
- L49: `this.cache.delete(`
- L61: `this.cache.delete(`
- L68: `this.cache.clear();`
- L73: `return this.cache.has(`
- L79: `export const CacheRuntime =`
- L82: `export default CacheRuntime;`

### `exchange-rate-cache-engine.js`

- SHA-256: `3d39d918cf09d945e20d1690103f310fb34cd175bfaeaa2ae48a8fcdd82faae5`
- Classifications: `exchange_rate_cache_or_banxico_domain, read_signals, write_signals`
- Exports: `["getCachedRates", "readCache", "writeCache"]`
- Functions: `[{"name": "getCachedRates", "parameters": ["{ forceRefresh = false } = {}"], "form": "function"}, {"name": "getCurrentRatesWithConfiguredProvider", "parameters": [], "form": "function"}, {"name": "hoursBetween", "parameters": ["a", "b"], "form": "function"}, {"name": "readCache", "parameters": [], "form": "function"}, {"name": "writeCache", "parameters": ["data"], "form": "function"}]`
- Classes: `[]`
- Events: `[]`
- Cache calls: `[]`
- Cache keys: `[]`
- Storage APIs: `[]`
- PDF processing signals: `false`
- Cache writer signals: `true`
- Cache reader signals: `true`

Relevant static lines:

- L1: `const fs = require("fs");`
- L2: `const { getCurrentRates } = require("./shared-banxico-rate-engine");`
- L3: `const { getCurrentRatesFromSupabaseEdge } = require("./shared-banxico-edge-provider");`
- L5: `const CACHE_FILE = "forge-rate-cache.json";`
- L14: `return JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));`
- L30: `const cache = readCache();`
- L33: `if (!forceRefresh && cache && cache.cachedAt) {`
- L34: `const age = hoursBetween(now, cache.cachedAt);`
- L38: `...cache,`
- L57: `module.exports = {`

### `gmm-quote-summary-engine.js`

- SHA-256: `3b31dd4ebd59133a4d02bb533c7c52b006aeba6a96f528909de2ac1a45d304a1`
- Classifications: `quote_preview_related`
- Exports: `["default", "summarizeGmmQuote"]`
- Functions: `[{"name": "extractOptionalCoverages", "parameters": ["text"], "form": "function"}, {"name": "extractProspect", "parameters": ["text"], "form": "function"}, {"name": "findMoneyAfter", "parameters": ["label", "text"], "form": "function"}, {"name": "matchText", "parameters": ["text", "regex"], "form": "function"}, {"name": "normalizeSpaces", "parameters": ["value = ''"], "form": "function"}, {"name": "normalizeText", "parameters": ["value = ''"], "form": "function"}, {"name": "parseGender", "parameters": ["value = ''"], "form": "function"}, {"name": "parseMoney", "parameters": ["value = ''"], "form": "function"}, {"name": "summarizeGmmQuote", "parameters": ["{ text = '' } = {}"], "form": "function"}]`
- Classes: `[]`
- Events: `[]`
- Cache calls: `[]`
- Cache keys: `[]`
- Storage APIs: `[]`
- PDF processing signals: `false`
- Cache writer signals: `false`
- Cache reader signals: `false`

Relevant static lines:

- L3: `| MODULE: gmm-quote-summary-engine.js`
- L109: `export function summarizeGmmQuote({ text = '' } = {}) {`
- L144: `? '${product} ${plan} quote for ${prospectData.prospect || 'prospect'}.'`
- L145: `: 'GMM quote summary.',`
- L153: `'Quote is illustrative and must not be treated as issued policy.'`
- L158: `export default summarizeGmmQuote;`

### `imagina-ser-banxico-integration-test.js`

- SHA-256: `6e3bc681c0a8b7a37065687983e4f780f347564a2f578a2c3063299cb3d1d9cf`
- Classifications: `exchange_rate_cache_or_banxico_domain, pdf_processing_signals, product_specific_extractor_candidate, read_signals, write_signals`
- Exports: `[]`
- Functions: `[{"name": "assert", "parameters": ["condition", "message"], "form": "function"}, {"name": "main", "parameters": [], "form": "function"}]`
- Classes: `[]`
- Events: `[]`
- Cache calls: `[]`
- Cache keys: `[]`
- Storage APIs: `[]`
- PDF processing signals: `true`
- Cache writer signals: `false`
- Cache reader signals: `true`

Relevant static lines:

- L1: `const { readCache } = require("./exchange-rate-cache-engine");`
- L2: `const { buildDecisionSummary } = require("./imagina-ser-decision-engine");`
- L3: `const { buildClientPresentation } = require("./imagina-ser-client-presentation-engine");`
- L4: `const { extractClientScenario } = require("./imagina-ser-ocr-extractor");`
- L18: `} = await import("./retirement-presentation-scenario-engine.js");`
- L20: `const cache = readCache();`
- L22: `assert(cache, "Expected forge-rate-cache.json to exist");`
- L23: `assert(cache.rates?.UDI_MXN?.value > 0, "Expected cached UDI rate");`
- L27: `...cache,`
- L92: `name: "UDI retrieved from cache",`
- L95: `currencyMetadata.sourceMode === "CACHE" &&`
- L96: `currencyMetadata.currentUdiValue === cache.rates.UDI_MXN.value`
- L102: `retirementScenario.currentUdiValue === cache.rates.UDI_MXN.value`
- L107: `retirementScenario.currentUdiValue === cache.rates.UDI_MXN.value &&`
- L120: `presentation.currencyMetadata.sourceDate === cache.rates.UDI_MXN.date &&`
- L121: `presentation.currencyMetadata.sourceMode === "CACHE"`

### `imagina-ser-future-mxn-bridge.js`

- SHA-256: `70b3f9b3624eb6f95fd020cb43f2aa53e44cfb6a6d4901a5c27ba0a0f907b93a`
- Classifications: `bridge_or_event_candidate`
- Exports: `["GLOBAL_UDI_PROJECTION_RATE", "buildAccumulatedIncome", "buildImaginaSerFutureMxnBridge", "sumProjectedSeries"]`
- Functions: `[{"name": "buildAccumulatedIncome", "parameters": ["{\n  monthlyIncomeUDI", "currentAge", "retirementAge", "targetAge", "currentUdiValue", "preRetirementProjectionRate", "annuityProjectionRate\n}"], "form": "function"}, {"name": "buildImaginaSerFutureMxnBridge", "parameters": ["{\n  quoteFacts", "currentUdiValue", "projectionConfig = {}\n}"], "form": "function"}, {"name": "number", "parameters": ["value", "fallback = 0"], "form": "function"}, {"name": "projectScenario", "parameters": ["{\n  amountUDI", "quoteFacts", "currentUdiValue", "projectionRate", "valueType\n}"], "form": "function"}, {"name": "sumProjectedSeries", "parameters": ["{\n  amountUDI", "currentAge", "startAge", "numberOfPayments", "currentUdiValue", "projectionRate\n}"], "form": "function"}]`
- Classes: `[]`
- Events: `[]`
- Cache calls: `[]`
- Cache keys: `[]`
- Storage APIs: `[]`
- PDF processing signals: `false`
- Cache writer signals: `false`
- Cache reader signals: `false`

Relevant static lines:

- L5: `} = require("./retirement-future-udi-projection-engine");`
- L208: `module.exports = {`

### `imagina-ser-master-test.js`

- SHA-256: `0e77b49ef538aefa723ac995c1c39247b721c58faeb16c6370f719cf324f8b3c`
- Classifications: `exchange_rate_cache_or_banxico_domain, pdf_processing_signals, product_specific_extractor_candidate, read_signals, write_signals`
- Exports: `[]`
- Functions: `[{"name": "main", "parameters": [], "form": "function"}, {"name": "resolveCurrencyMetadata", "parameters": [], "form": "function"}]`
- Classes: `[]`
- Events: `[]`
- Cache calls: `[]`
- Cache keys: `[]`
- Storage APIs: `[]`
- PDF processing signals: `true`
- Cache writer signals: `false`
- Cache reader signals: `false`

Relevant static lines:

- L1: `const { extractImaginaSerDocument } = require("./imagina-ser-ocr-extractor");`
- L2: `const { analyzeRetirementFund } = require("./imagina-ser-retirement-fund-engine");`
- L3: `const { chooseDefaultScenario } = require("./imagina-ser-scenario-engine");`
- L4: `const { buildDecisionSummary } = require("./imagina-ser-decision-engine");`
- L5: `const { buildImaginaSerObjections } = require("./imagina-ser-objection-engine");`
- L6: `const { buildClientPresentation } = require("./imagina-ser-client-presentation-engine");`
- L7: `const { buildAdvisorAnalysis } = require("./imagina-ser-advisor-analysis-engine");`
- L8: `const { buildPresentationPrompt } = require("./imagina-ser-presentation-prompt-engine");`
- L9: `const { getCachedRates } = require("./exchange-rate-cache-engine");`
- L15: `const cache = await getCachedRates();`
- L16: `const udi = cache?.rates?.UDI_MXN;`
- L26: `cacheStatus: cache?.cacheStatus || null`
- L35: `sourceMode: cache.cacheStatus === "CACHE_HIT" ? "CACHE" : "LIVE",`
- L36: `cacheStatus: cache.cacheStatus`
- L52: `process.argv[2] || "/storage/emulated/0/Download/IS.PDF";`
- L55: `process.argv[3] || "/storage/emulated/0/Download/Solucionline_20260601_21_10.PDF";`
- L96: `console.log('Client PDF: ${clientDoc.documentType}');`
- L97: `console.log('Advisor PDF: ${advisorDoc.documentType}');`
- L124: `console.log("\nPresentation Prompt Preview\n");`
- L129: `name: "Detecta PDF de cliente",`
- L133: `name: "Detecta PDF de asesor",`

### `orvi-decision-engine.js`

- SHA-256: `2a694ce703c4c363ee92dfc210ef8a3715fb5a8c86985c2d41d53e2f54868798`
- Classifications: `none`
- Exports: `["buildOrviDecision"]`
- Functions: `[{"name": "buildOrviDecision", "parameters": ["{ baseYear", "scenarios }"], "form": "function"}]`
- Classes: `[]`
- Events: `[]`
- Cache calls: `[]`
- Cache keys: `[]`
- Storage APIs: `[]`
- PDF processing signals: `false`
- Cache writer signals: `false`
- Cache reader signals: `false`

Relevant static lines:

- L21: `module.exports = {`

### `orvi-mxn-conversion-engine.js`

- SHA-256: `7c2a1c8a4c0084c0c5f6400cec0e78fd7119e81c355a9458d9ea19e1ff064bf0`
- Classifications: `none`
- Exports: `["convertAmountTodayMXN", "convertOrviTimelineToMXN"]`
- Functions: `[{"name": "convertAmountTodayMXN", "parameters": ["{ amountUDI", "currentRate }"], "form": "function"}, {"name": "convertOrviTimelineToMXN", "parameters": ["{\n  timeline", "currentRate", "annualGrowthRate = 0.045\n}"], "form": "function"}]`
- Classes: `[]`
- Events: `[]`
- Cache calls: `[]`
- Cache keys: `[]`
- Storage APIs: `[]`
- PDF processing signals: `false`
- Cache writer signals: `false`
- Cache reader signals: `false`

Relevant static lines:

- L3: `} = require("./shared-currency-projection-engine");`
- L33: `module.exports = {`

### `platform/adapters/product-intelligence/product-intelligence-read-model-adapter-073d.js`

- SHA-256: `44b44f3a284a1ec00e48f3a278dc6256038d3f984695af4d9424a6eca0ef5738`
- Classifications: `adapter, bridge_or_event_candidate, exchange_rate_cache_or_banxico_domain, pdf_processing_signals, read_signals`
- Exports: `["ADAPTER_ID", "DEFAULT_SAFETY_FLAGS", "PRODUCT_FAMILIES", "REQUIRED_FIELDS", "SAFE_ERROR_CODES", "SCHEMA_VERSION", "buildProductIntelligenceNotModeledError", "getProductIntelligenceReadModelByFamily", "getProductIntelligenceReadModelCatalog", "validateProductIntelligenceReadModelShape"]`
- Functions: `[{"name": "buildProductIntelligenceNotModeledError", "parameters": ["productFamily"], "form": "function"}, {"name": "clone", "parameters": ["value"], "form": "function"}, {"name": "getProductIntelligenceReadModelByFamily", "parameters": ["productFamily"], "form": "function"}, {"name": "getProductIntelligenceReadModelCatalog", "parameters": [], "form": "function"}, {"name": "makeProductRecord", "parameters": ["config"], "form": "function"}, {"name": "makeRefs", "parameters": ["paths"], "form": "function"}, {"name": "makeSemantics", "parameters": ["summary", "mapped = []"], "form": "function"}, {"name": "validateProductIntelligenceReadModelShape", "parameters": ["readModel"], "form": "function"}]`
- Classes: `[]`
- Events: `[]`
- Cache calls: `[{"owner": "PRODUCT_RECORDS", "method": "find"}]`
- Cache keys: `[{"source": "quote_pdf_string_literal", "name": "", "value": "Quote PDF preview may consume Product Intelligence; it is not authority."}, {"source": "quote_pdf_string_literal", "name": "", "value": "product-intelligence/evidence/forge-quote-pdf-preview-engine.js"}]`
- Storage APIs: `[]`
- PDF processing signals: `true`
- Cache writer signals: `false`
- Cache reader signals: `true`

Relevant static lines:

- L1: `export const ADAPTER_ID = 'forge.product_intelligence.read_model.adapter.v1';`
- L2: `export const SCHEMA_VERSION = 'forge.product_intelligence.read_model.v1';`
- L4: `export const SAFE_ERROR_CODES = Object.freeze({`
- L12: `export const DEFAULT_SAFETY_FLAGS = Object.freeze({`
- L30: `export const PRODUCT_FAMILIES = Object.freeze([`
- L39: `export const REQUIRED_FIELDS = Object.freeze([`
- L98: `return JSON.parse(JSON.stringify(value));`
- L169: `summary: 'Quote PDF preview may consume Product Intelligence; it is not authority.',`
- L171: `mapped_refs: makeRefs(['product-intelligence/evidence/forge-quote-pdf-preview-engine.js']),`
- L213: `currencyContext: 'MXN preview context',`
- L217: `'gmm-quote-summary-engine.js'`
- L219: `parsers: ['product-intelligence/evidence/gmm-quote-parser.js'],`
- L221: `adapters: ['platform/adapters/quote-read-model/quote-read-model-adapter-069c.js'],`
- L224: `premiumSummary: 'Premium semantics are preview-only and must stay evidence-backed.',`
- L229: `premiumRefs: makeRefs(['gmm-quote-summary-engine.js']),`
- L240: `currencyContext: 'MXN preview context',`
- L297: `currencyContext: 'UDI/MXN preview context',`
- L328: `currencyContext: 'MXN/value timeline preview context',`
- L334: `parsers: ['orvi-ocr-extractor.js'],`
- L355: `currencyContext: 'education cost preview context',`
- L361: `coverageSummary: 'Education product semantics require future product-specific mapping.',`
- L375: `export function getProductIntelligenceReadModelCatalog() {`
- L396: `export function getProductIntelligenceReadModelByFamily(productFamily) {`
- L429: `export function buildProductIntelligenceNotModeledError(productFamily) {`
- L456: `export function validateProductIntelligenceReadModelShape(readModel) {`

### `platform/adapters/quote-preview/quote-preview-pdf-engine-existing-surfaces-canonical-mapping-adapter-077b.js`

- SHA-256: `efd73bd8d6fc056b34048da0cd6586b0215a27012edf731e9981bd2b182768ce`
- Classifications: `adapter, bridge_or_event_candidate, canonical_reference_mapping_adapter, exchange_rate_cache_or_banxico_domain, pdf_processing_signals, quote_preview_related, read_signals, write_signals`
- Exports: `["ADAPTER_ID", "ALL_SURFACES", "BLOCKED_EFFECTS", "CANONICAL_STATUSES", "DEFAULT_SAFETY_FLAGS", "DOMAIN_ID", "MODE", "REQUIRED_MAPPING_FIELDS", "ROUTE_CLASS", "SAFE_ERROR_CODES", "SCHEMA_VERSION", "SURFACE_TYPES", "buildExistingSurfaceCanonicalMappingSafeError", "getBlockedGrowthSurfaces", "getCanonicalDecisionRequiredSurfaces", "getExistingSurfaceCanonicalMappingById", "getExistingSurfaceCanonicalMappingsByProductFamily", "getQuotePreviewPdfExistingSurfacesCanonicalMappingCatalog", "validateExistingSurfaceCanonicalMappingShape", "validateExistingSurfacesCanonicalMappingCatalog"]`
- Functions: `[{"name": "buildExistingSurfaceCanonicalMappingSafeError", "parameters": ["surfaceId", "code = SAFE_ERROR_CODES.SURFACE_NOT_MAPPED"], "form": "function"}, {"name": "clone", "parameters": ["value"], "form": "function"}, {"name": "getBlockedGrowthSurfaces", "parameters": [], "form": "function"}, {"name": "getCanonicalDecisionRequiredSurfaces", "parameters": [], "form": "function"}, {"name": "getExistingSurfaceCanonicalMappingById", "parameters": ["surfaceId"], "form": "function"}, {"name": "getExistingSurfaceCanonicalMappingsByProductFamily", "parameters": ["productFamily"], "form": "function"}, {"name": "getQuotePreviewPdfExistingSurfacesCanonicalMappingCatalog", "parameters": [], "form": "function"}, {"name": "surface", "parameters": ["input"], "form": "function"}, {"name": "validateExistingSurfaceCanonicalMappingShape", "parameters": ["surface"], "form": "function"}, {"name": "validateExistingSurfacesCanonicalMappingCatalog", "parameters": ["catalog"], "form": "function"}]`
- Classes: `[]`
- Events: `[]`
- Cache calls: `[{"owner": "ALL_SURFACES", "method": "find"}]`
- Cache keys: `[{"source": "quote_pdf_string_literal", "name": "", "value": "forge.quote_preview.pdf_engine.existing_surfaces.canonical_mapping.adapter.v1"}, {"source": "quote_pdf_string_literal", "name": "", "value": "forge.quote_preview.pdf_engine.existing_surfaces.canonical_mapping.v1"}, {"source": "quote_pdf_string_literal", "name": "", "value": "quote_preview_pdf_engine_existing_surfaces_canonical_mapping"}, {"source": "quote_pdf_string_literal", "name": "", "value": ",\n});\n\nconst SURFACE_TYPES = Object.freeze({\n  PDF_EXTRACTION: "}, {"source": "quote_pdf_string_literal", "name": "", "value": ",\n  PDF_PREVIEW_ORCHESTRATION: "}, {"source": "quote_pdf_string_literal", "name": "", "value": ",\n  QUOTE_PREVIEW_BINDING_ADAPTER: "}, {"source": "quote_pdf_string_literal", "name": "", "value": "QUOTE_PREVIEW_PDF_EXISTING_SURFACE_NOT_MAPPED"}, {"source": "quote_pdf_string_literal", "name": "", "value": "QUOTE_PREVIEW_PDF_EXISTING_SURFACE_CANONICAL_DECISION_REQUIRED"}, {"source": "quote_pdf_string_literal", "name": "", "value": "QUOTE_PREVIEW_PDF_NEW_EXTRACTOR_BLOCKED_BEFORE_RECONCILIATION"}, {"source": "quote_pdf_string_literal", "name": "", "value": "QUOTE_PREVIEW_PDF_NEW_PARSER_BLOCKED_BEFORE_RECONCILIATION"}, {"source": "quote_pdf_string_literal", "name": "", "value": "QUOTE_PREVIEW_PDF_NEW_CALCULATOR_BLOCKED_BEFORE_RECONCILIATION"}, {"source": "quote_pdf_string_literal", "name": "", "value": "QUOTE_PREVIEW_PDF_EXISTING_SURFACE_EXECUTION_NOT_AUTHORIZED"}, {"source": "quote_pdf_string_literal", "name": "", "value": "quote_preview_downstream_only"}, {"source": "quote_pdf_string_literal", "name": "", "value": "pdf_extraction_policy_ocr_engine"}, {"source": "quote_pdf_string_literal", "name": "", "value": ",\n    surface_type: SURFACE_TYPES.PDF_EXTRACTION,\n    domain: "}, {"source": "quote_pdf_string_literal", "name": "", "value": "candidate canonical local PDF/OCR text extraction source; must not own parsing, calculation, or quote truth"}, {"source": "quote_pdf_string_literal", "name": "", "value": "],\n    engine_refs: [],\n    product_intelligence_binding_required: true,\n    quote_preview_downstream_only: true,\n    safe_errors: [SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED],\n  }),\n  surface({\n    surface_id: "}, {"source": "quote_pdf_string_literal", "name": "", "value": "product-intelligence/evidence/forge-quote-pdf-preview-engine.js"}, {"source": "quote_pdf_string_literal", "name": "", "value": "quote_pdf_preview"}, {"source": "quote_pdf_string_literal", "name": "", "value": "tests/product-intelligence/forge-quote-pdf-preview-engine-test.js"}, {"source": "quote_pdf_string_literal", "name": "", "value": "],\n    product_intelligence_binding_required: true,\n    quote_preview_downstream_only: true,\n    safe_errors: [SAFE_ERROR_CODES.CANONICAL_DECISION_REQUIRED, SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED],\n  }),\n  surface({\n    surface_id: "}, {"source": "quote_pdf_string_literal", "name": "", "value": "],\n    product_intelligence_binding_required: true,\n    quote_preview_downstream_only: true,\n    safe_errors: [SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED],\n  }),\n  surface({\n    surface_id: "}, {"source": "quote_pdf_string_literal", "name": "", "value": "pdf_extraction_ownership"}, {"source": "quote_pdf_string_literal", "name": "", "value": "],\n    engine_refs: [],\n    product_intelligence_binding_required: true,\n    quote_preview_downstream_only: false,\n    safe_errors: [SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED],\n  }),\n  surface({\n    surface_id: "}, {"source": "quote_pdf_string_literal", "name": "", "value": "platform/adapters/quote-preview/quote-preview-product-intelligence-binding-adapter-074b.js"}, {"source": "quote_pdf_string_literal", "name": "", "value": "quote_preview_product_intelligence_binding"}, {"source": "quote_pdf_string_literal", "name": "", "value": "current Quote Preview to Product Intelligence binding"}, {"source": "quote_pdf_string_literal", "name": "", "value": "tests/quote-preview-product-intelligence-binding-adapter-074b-test.js"}, {"source": "quote_pdf_string_literal", "name": "", "value": "platform/adapters/quote-preview/quote-preview-pdf-product-intelligence-integration-adapter-075b.js"}, {"source": "quote_pdf_string_literal", "name": "", "value": "quote_preview_pdf_to_product_intelligence_integration"}, {"source": "quote_pdf_string_literal", "name": "", "value": "current reference integration between PDF preview and Product Intelligence"}, {"source": "quote_pdf_string_literal", "name": "", "value": "tests/quote-preview-pdf-product-intelligence-integration-adapter-075b-test.js"}, {"source": "quote_pdf_string_literal", "name": "", "value": "quote_preview_pdf_engine_repo_promotion_adapter_076b"}, {"source": "quote_pdf_string_literal", "name": "", "value": "platform/adapters/quote-preview/quote-preview-pdf-engine-repo-promotion-adapter-076b.js"}, {"source": "quote_pdf_string_literal", "name": "", "value": "quote_preview_pdf_engine_repo_promotion"}, {"source": "quote_pdf_string_literal", "name": "", "value": "tests/quote-preview-pdf-engine-repo-promotion-adapter-076b-test.js"}, {"source": "quote_pdf_string_literal", "name": "", "value": "],\n    product_intelligence_binding_required: true,\n    quote_preview_downstream_only: true,\n    safe_errors: [SAFE_ERROR_CODES.CANONICAL_DECISION_REQUIRED],\n  }),\n  surface({\n    surface_id: "}, {"source": "quote_pdf_string_literal", "name": "", "value": "quote_pdf_preview_fixture_test"}, {"source": "quote_pdf_string_literal", "name": "", "value": "candidate canonical preview fixture test, not real extraction proof"}, {"source": "quote_pdf_string_literal", "name": "", "value": ",\n    no_new_extractor_before_reconciliation: true,\n    no_new_parser_before_reconciliation: true,\n    no_new_calculator_before_reconciliation: true,\n    product_intelligence_upstream: true,\n    quote_preview_downstream: true,\n    safe_errors: Object.values(SAFE_ERROR_CODES),\n    required_mapping_fields: [...REQUIRED_MAPPING_FIELDS],\n    blocked_effects: [...BLOCKED_EFFECTS],\n    safety_flags: clone(DEFAULT_SAFETY_FLAGS),\n    surfaces: clone(ALL_SURFACES),\n  };\n}\n\nfunction getExistingSurfaceCanonicalMappingById(surfaceId) {\n  const match = ALL_SURFACES.find((surface) => surface.surface_id === surfaceId);\n  return match ? clone(match) : buildExistingSurfaceCanonicalMappingSafeError(surfaceId);\n}\n\nfunction getExistingSurfaceCanonicalMappingsByProductFamily(productFamily) {\n  const normalized = String(productFamily || "}, {"source": "quote_pdf_string_literal", "name": "", "value": "],\n    test_refs: [],\n    engine_refs: [],\n    product_intelligence_binding_required: true,\n    quote_preview_downstream_only: true,\n    safe_errors: [code, SAFE_ERROR_CODES.NEW_EXTRACTOR_BLOCKED, SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED],\n    safety_flags: clone(DEFAULT_SAFETY_FLAGS),\n    safe_error: {\n      code,\n      message: "}]`
- Storage APIs: `[]`
- PDF processing signals: `true`
- Cache writer signals: `false`
- Cache reader signals: `true`

Relevant static lines:

- L64: `function clone(value) { return JSON.parse(JSON.stringify(value)); }`
- L81: `file_path: 'policy-operations/evidence/policy-ocr-engine.js',`
- L87: `allowed_role: 'candidate canonical local PDF/OCR text extraction source; must not own parsing, calculation, or quote truth',`
- L89: `test_refs: ['tests/real-pdf-ocr-test.js', 'tests/real-gmm-quote-test.js', 'tests/gmm-out-of-pocket-test.js'],`
- L97: `file_path: 'product-intelligence/evidence/forge-quote-pdf-preview-engine.js',`
- L103: `allowed_role: 'candidate preview/orchestrator only; must delegate parser and calculator ownership',`
- L105: `test_refs: ['tests/product-intelligence/forge-quote-pdf-preview-engine-test.js'],`
- L119: `allowed_role: 'candidate canonical Solucionline parser; boundary must be reconciled against preview engine parsing',`
- L122: `engine_refs: ['product-intelligence/evidence/forge-quote-pdf-preview-engine.js'],`
- L129: `file_path: 'product-intelligence/evidence/gmm-quote-parser.js',`
- L135: `allowed_role: 'candidate canonical GMM quote parser',`
- L137: `test_refs: ['tests/real-gmm-quote-test.js', 'tests/gmm-out-of-pocket-test.js'],`
- L138: `engine_refs: ['gmm-quote-summary-engine.js'],`
- L145: `file_path: 'gmm-quote-summary-engine.js',`
- L153: `test_refs: ['tests/real-gmm-quote-test.js', 'tests/gmm-out-of-pocket-test.js'],`
- L154: `engine_refs: ['product-intelligence/evidence/gmm-quote-parser.js'],`
- L193: `file_path: 'exchange-rate-cache-engine.js',`
- L199: `allowed_role: 'candidate current-rate cache over Banxico providers',`
- L215: `allowed_role: 'direct Banxico provider candidate; not authorized for preview runtime execution without later gate',`
- L218: `engine_refs: ['exchange-rate-cache-engine.js'],`
- L231: `allowed_role: 'edge Banxico provider candidate; not authorized for preview runtime execution without later gate',`
- L234: `engine_refs: ['exchange-rate-cache-engine.js'],`
- L257: `file_path: 'platform/adapters/quote-preview/quote-preview-product-intelligence-binding-adapter-074b.js',`
- L263: `allowed_role: 'current Quote Preview to Product Intelligence binding',`
- L265: `test_refs: ['tests/quote-preview-product-intelligence-binding-adapter-074b-test.js'],`
- L273: `file_path: 'platform/adapters/quote-preview/quote-preview-pdf-product-intelligence-integration-adapter-075b.js',`
- L279: `allowed_role: 'current reference integration between PDF preview and Product Intelligence',`
- L281: `test_refs: ['tests/quote-preview-pdf-product-intelligence-integration-adapter-075b-test.js'],`
- L282: `engine_refs: ['platform/adapters/quote-preview/quote-preview-product-intelligence-binding-adapter-074b.js'],`
- L289: `file_path: 'platform/adapters/quote-preview/quote-preview-pdf-engine-repo-promotion-adapter-076b.js',`
- L297: `test_refs: ['tests/quote-preview-pdf-engine-repo-promotion-adapter-076b-test.js'],`
- L298: `engine_refs: ['platform/adapters/product-intelligence/product-intelligence-read-model-adapter-073d.js', 'platform/adapters/quote-preview/quote-preview-product-intelligence-binding-adapter-074b.js', 'platform/adapters/quote-preview/quote-preview-pdf-product-intelligence-integration-adapter-075b.js', 'product-intelligence/evidence/forge-quote-pdf-preview-engine.js'],`
- L305: `file_path: 'tests/real-pdf-ocr-test.js',`
- L311: `allowed_role: 'candidate canonical real PDF/OCR evidence test',`
- L314: `engine_refs: ['policy-operations/evidence/policy-ocr-engine.js'],`
- L321: `file_path: 'tests/real-gmm-quote-test.js',`
- L327: `allowed_role: 'candidate canonical GMM quote evidence test',`
- L330: `engine_refs: ['policy-operations/evidence/policy-ocr-engine.js', 'product-intelligence/evidence/gmm-quote-parser.js'],`
- L337: `file_path: 'tests/product-intelligence/forge-quote-pdf-preview-engine-test.js',`
- L343: `allowed_role: 'candidate canonical preview fixture test, not real extraction proof',`
- L346: `engine_refs: ['product-intelligence/evidence/forge-quote-pdf-preview-engine.js'],`
- L418: `message: 'Existing quote/PDF surface is not mapped. New extractor/parser/calculator creation is blocked before reconciliation.',`
- L454: `module.exports = {`

### `platform/adapters/quote-preview/quote-preview-pdf-engine-repo-promotion-adapter-076b.js`

- SHA-256: `f72934ffbd187425a8de51753ae8c1cad980eeb1c67e5cdd23cabce99c33b2b5`
- Classifications: `adapter, bridge_or_event_candidate, exchange_rate_cache_or_banxico_domain, governance_or_promotion_adapter, pdf_processing_signals, quote_preview_related, read_signals`
- Exports: `["ADAPTER_ID", "BLOCKED_EFFECTS", "DEFAULT_SAFETY_FLAGS", "DOMAIN_ID", "MODE", "PRODUCT_FAMILY_REFERENCE_MAP", "PRODUCT_INTELLIGENCE_READ_MODEL_ADAPTER_REF", "QUOTE_PREVIEW_PDF_ENGINE_REF", "QUOTE_PREVIEW_PDF_PRODUCT_INTELLIGENCE_INTEGRATION_ADAPTER_REF", "QUOTE_PREVIEW_PRODUCT_INTELLIGENCE_BINDING_ADAPTER_REF", "REQUIRED_PROMOTION_FIELDS", "ROUTE_CLASS", "SAFE_ERROR_CODES", "SCHEMA_VERSION", "buildQuotePreviewPdfEnginePromotionError", "getQuotePreviewPdfEnginePromotionManifest", "prepareQuotePreviewPdfEnginePromotionScope", "validateQuotePreviewPdfEnginePromotionShape"]`
- Functions: `[{"name": "buildQuotePreviewPdfEnginePromotionError", "parameters": ["request = {}", "code = SAFE_ERROR_CODES.PROMOTION_NOT_SCOPED"], "form": "function"}, {"name": "clone", "parameters": ["value"], "form": "function"}, {"name": "getQuotePreviewPdfEnginePromotionManifest", "parameters": [], "form": "function"}, {"name": "makeDeterministicId", "parameters": ["parts"], "form": "function"}, {"name": "normalizeProductFamily", "parameters": ["value"], "form": "function"}, {"name": "prepareQuotePreviewPdfEnginePromotionScope", "parameters": ["request = {}"], "form": "function"}, {"name": "validateQuotePreviewPdfEnginePromotionShape", "parameters": ["promotion"], "form": "function"}]`
- Classes: `[]`
- Events: `[]`
- Cache calls: `[{"owner": "aliases", "method": "get"}]`
- Cache keys: `[{"source": "quote_pdf_string_literal", "name": "", "value": "forge.quote_preview.pdf_engine.repo_promotion.adapter.v1"}, {"source": "quote_pdf_string_literal", "name": "", "value": "forge.quote_preview.pdf_engine.repo_promotion.v1"}, {"source": "quote_pdf_string_literal", "name": "", "value": "quote_preview_pdf_engine_repo_promotion"}, {"source": "quote_pdf_string_literal", "name": "", "value": ";\n\nconst QUOTE_PREVIEW_PRODUCT_INTELLIGENCE_BINDING_ADAPTER_REF =\n  "}, {"source": "quote_pdf_string_literal", "name": "", "value": ";\n\nconst QUOTE_PREVIEW_PDF_PRODUCT_INTELLIGENCE_INTEGRATION_ADAPTER_REF =\n  "}, {"source": "quote_pdf_string_literal", "name": "", "value": ";\n\nconst QUOTE_PREVIEW_PDF_ENGINE_REF =\n  "}, {"source": "quote_pdf_string_literal", "name": "", "value": "QUOTE_PREVIEW_PDF_ENGINE_PROMOTION_NOT_SCOPED"}, {"source": "quote_pdf_string_literal", "name": "", "value": "QUOTE_PREVIEW_PDF_ENGINE_PRODUCT_INTELLIGENCE_BINDING_REQUIRED"}, {"source": "quote_pdf_string_literal", "name": "", "value": "QUOTE_PREVIEW_PDF_ENGINE_PRODUCT_FAMILY_NOT_MAPPED"}, {"source": "quote_pdf_string_literal", "name": "", "value": "QUOTE_PREVIEW_PDF_ENGINE_PARSER_NOT_MAPPED"}, {"source": "quote_pdf_string_literal", "name": "", "value": "QUOTE_PREVIEW_PDF_ENGINE_CALCULATOR_NOT_MAPPED"}, {"source": "quote_pdf_string_literal", "name": "", "value": "QUOTE_PREVIEW_PDF_ENGINE_SOURCE_EVIDENCE_REQUIRED"}, {"source": "quote_pdf_string_literal", "name": "", "value": "QUOTE_PREVIEW_PDF_ENGINE_FRESHNESS_REQUIRED"}, {"source": "quote_pdf_string_literal", "name": "", "value": "quote_preview_pdf_promotion_id"}, {"source": "quote_pdf_string_literal", "name": "", "value": "quote_preview_pdf_request_id"}, {"source": "quote_pdf_string_literal", "name": "", "value": "quote_preview_pdf_engine_ref"}, {"source": "quote_pdf_string_literal", "name": "", "value": ");\n\n  return `quote_preview_pdf_engine_promotion_${clean || "}, {"source": "quote_pdf_string_literal", "name": "", "value": "}_076b`;\n}\n\nfunction getQuotePreviewPdfEnginePromotionManifest() {\n  return {\n    adapter_id: ADAPTER_ID,\n    schemaVersion: SCHEMA_VERSION,\n    domainId: DOMAIN_ID,\n    mode: MODE,\n    routeClass: ROUTE_CLASS,\n    adapter_type: "}, {"source": "quote_pdf_string_literal", "name": "", "value": ",\n    product_intelligence_read_model_adapter_ref: PRODUCT_INTELLIGENCE_READ_MODEL_ADAPTER_REF,\n    quote_preview_product_intelligence_binding_adapter_ref: QUOTE_PREVIEW_PRODUCT_INTELLIGENCE_BINDING_ADAPTER_REF,\n    quote_preview_pdf_product_intelligence_integration_adapter_ref:\n      QUOTE_PREVIEW_PDF_PRODUCT_INTELLIGENCE_INTEGRATION_ADAPTER_REF,\n    quote_preview_pdf_engine_ref: QUOTE_PREVIEW_PDF_ENGINE_REF,\n    product_families: Object.keys(PRODUCT_FAMILY_REFERENCE_MAP),\n    safe_errors: Object.values(SAFE_ERROR_CODES),\n    required_promotion_fields: [...REQUIRED_PROMOTION_FIELDS],\n    blocked_effects: [...BLOCKED_EFFECTS],\n    safety_flags: clone(DEFAULT_SAFETY_FLAGS),\n    promotion_constraints: {\n      product_intelligence_binding_required: true,\n      product_intelligence_upstream_semantic_authority: true,\n      quote_preview_pdf_engine_downstream_consumer_reference_only: true,\n      local_static_read_only: true,\n      reference_only: true,\n      executes_pdf_read: false,\n      executes_parser: false,\n      executes_calculator: false,\n      calls_banxico: false,\n      calls_provider: false,\n      writes_quote: false,\n      creates_quote_truth: false,\n    },\n  };\n}\n\nfunction buildQuotePreviewPdfEnginePromotionError(request = {}, code = SAFE_ERROR_CODES.PROMOTION_NOT_SCOPED) {\n  const productFamily = normalizeProductFamily(\n    request.product_family_hint ||\n    request.productFamilyHint ||\n    request.product_family ||\n    request.productFamily\n  );\n\n  return {\n    schemaVersion: SCHEMA_VERSION,\n    domainId: DOMAIN_ID,\n    mode: MODE,\n    routeClass: ROUTE_CLASS,\n    readModelStatus: "}, {"source": "quote_pdf_string_literal", "name": "", "value": ",\n    quote_preview_pdf_promotion_id: makeDeterministicId([\n      request.quote_preview_pdf_request_id || request.quotePreviewPdfRequestId || "}, {"source": "quote_pdf_string_literal", "name": "", "value": ",\n    ]),\n    quote_preview_pdf_request_id:\n      request.quote_preview_pdf_request_id ||\n      request.quotePreviewPdfRequestId ||\n      request.quote_preview_request_id ||\n      request.quotePreviewRequestId ||\n      null,\n    product_intelligence_binding_ref: QUOTE_PREVIEW_PRODUCT_INTELLIGENCE_BINDING_ADAPTER_REF,\n    product_intelligence_ref: null,\n    product_family: productFamily || null,\n    source_document_ref: request.source_document_ref || request.sourceDocumentRef || null,\n    source_evidence_refs: request.source_evidence_refs || request.sourceEvidenceRefs || [],\n    parser_ref: null,\n    calculator_refs: [],\n    quote_preview_pdf_engine_ref: QUOTE_PREVIEW_PDF_ENGINE_REF,\n    evidence_requirements: {\n      source_document_ref_required: true,\n      source_evidence_refs_required: true,\n      parser_evidence_required: true,\n    },\n    freshness_requirements: {\n      freshness_metadata_required: true,\n      status: "}, {"source": "quote_pdf_string_literal", "name": "", "value": "Quote Preview PDF Engine promotion is not available without Product Intelligence-bound references."}, {"source": "quote_pdf_string_literal", "name": "", "value": "quote_preview_pdf_engine_repo_promotion_safe_error"}, {"source": "quote_pdf_string_literal", "name": "", "value": ",\n    },\n  };\n}\n\nfunction prepareQuotePreviewPdfEnginePromotionScope(request = {}) {\n  const productFamily = normalizeProductFamily(\n    request.product_family_hint ||\n    request.productFamilyHint ||\n    request.product_family ||\n    request.productFamily\n  );\n\n  if (!productFamily) {\n    return buildQuotePreviewPdfEnginePromotionError(\n      request,\n      SAFE_ERROR_CODES.PRODUCT_INTELLIGENCE_BINDING_REQUIRED\n    );\n  }\n\n  const familyRef = PRODUCT_FAMILY_REFERENCE_MAP[productFamily];\n\n  if (!familyRef) {\n    return buildQuotePreviewPdfEnginePromotionError(\n      request,\n      SAFE_ERROR_CODES.PRODUCT_FAMILY_NOT_MAPPED\n    );\n  }\n\n  const sourceEvidenceRefs = request.source_evidence_refs || request.sourceEvidenceRefs || [];\n\n  return {\n    schemaVersion: SCHEMA_VERSION,\n    domainId: DOMAIN_ID,\n    mode: MODE,\n    routeClass: ROUTE_CLASS,\n    readModelStatus: "}, {"source": "quote_pdf_string_literal", "name": "", "value": ",\n    quote_preview_pdf_promotion_id: makeDeterministicId([\n      request.quote_preview_pdf_request_id || request.quotePreviewPdfRequestId || request.quote_preview_request_id || request.quotePreviewRequestId || "}, {"source": "quote_pdf_string_literal", "name": "", "value": ",\n      productFamily,\n    ]),\n    quote_preview_pdf_request_id:\n      request.quote_preview_pdf_request_id ||\n      request.quotePreviewPdfRequestId ||\n      request.quote_preview_request_id ||\n      request.quotePreviewRequestId ||\n      null,\n    product_intelligence_binding_ref: {\n      binding_adapter_ref: QUOTE_PREVIEW_PRODUCT_INTELLIGENCE_BINDING_ADAPTER_REF,\n      integration_adapter_ref: QUOTE_PREVIEW_PDF_PRODUCT_INTELLIGENCE_INTEGRATION_ADAPTER_REF,\n      required: true,\n    },\n    product_intelligence_ref: familyRef.product_intelligence_ref,\n    product_family: productFamily,\n    source_document_ref: request.source_document_ref || request.sourceDocumentRef || null,\n    source_evidence_refs: Array.isArray(sourceEvidenceRefs) ? [...sourceEvidenceRefs] : [sourceEvidenceRefs],\n    parser_ref: familyRef.parser_ref,\n    calculator_refs: [...familyRef.calculator_refs],\n    quote_preview_pdf_engine_ref: QUOTE_PREVIEW_PDF_ENGINE_REF,\n    evidence_requirements: {\n      source_document_ref_required: true,\n      source_evidence_refs_required: true,\n      parser_evidence_required: true,\n      evidence_ids_present: Array.isArray(sourceEvidenceRefs) && sourceEvidenceRefs.length > 0,\n    },\n    freshness_requirements: {\n      freshness_metadata_required: true,\n      status: "}, {"source": "quote_pdf_string_literal", "name": "", "value": ",\n      preview_static_allowed: true,\n    },\n    preview_constraints: {\n      product_intelligence_binding_required: true,\n      product_intelligence_upstream_semantic_authority: true,\n      quote_preview_pdf_engine_downstream_consumer_reference_only: true,\n      product_notes: [...familyRef.product_notes],\n      universal_architecture: familyRef.universal_architecture,\n      reference_only: true,\n      no_pdf_read: true,\n      no_parser_execution: true,\n      no_calculator_execution: true,\n      no_banxico_call: true,\n      no_provider_call: true,\n      no_quote_write: true,\n      no_quote_truth: true,\n    },\n    blocked_effects: [...BLOCKED_EFFECTS],\n    safety_flags: clone(DEFAULT_SAFETY_FLAGS),\n    safe_error: null,\n    audit_event: {\n      event_type: "}, {"source": "quote_pdf_string_literal", "name": "", "value": ",\n    },\n  };\n}\n\nfunction validateQuotePreviewPdfEnginePromotionShape(promotion) {\n  const errors = [];\n\n  if (!promotion || typeof promotion !== "}]`
- Storage APIs: `[]`
- PDF processing signals: `true`
- Cache writer signals: `false`
- Cache reader signals: `true`

Relevant static lines:

- L13: `'platform/adapters/quote-preview/quote-preview-product-intelligence-binding-adapter-074b.js';`
- L16: `'platform/adapters/quote-preview/quote-preview-pdf-product-intelligence-integration-adapter-075b.js';`
- L19: `'product-intelligence/evidence/forge-quote-pdf-preview-engine.js';`
- L99: `parser_ref: 'product-intelligence/evidence/gmm-quote-parser.js',`
- L102: `'gmm-quote-summary-engine.js',`
- L164: `return JSON.parse(JSON.stringify(value));`
- L296: `message: 'Quote Preview PDF Engine promotion is not available without Product Intelligence-bound references.',`
- L442: `module.exports = {`

### `platform/adapters/quote-preview/quote-preview-pdf-product-intelligence-integration-adapter-075b.js`

- SHA-256: `10e23cda8585af3a6650f220c724a5c8ea9b9dc04e0ecebd5941e3391fed971d`
- Classifications: `adapter, exchange_rate_cache_or_banxico_domain, pdf_processing_signals, quote_preview_related, read_signals`
- Exports: `["ADAPTER_ID", "BINDING_ADAPTER_REF", "BLOCKED_EFFECTS", "DEFAULT_SAFETY_FLAGS", "DOMAIN_ID", "MODE", "PRODUCT_INTELLIGENCE_ADAPTER_REF", "QUOTE_PREVIEW_PDF_ENGINE_REF", "REQUIRED_INTEGRATION_FIELDS", "ROUTE_CLASS", "SAFE_ERROR_CODES", "SCHEMA_VERSION", "buildQuotePreviewPdfIntegrationError", "integrateQuotePreviewPdfEngineWithProductIntelligence", "validateQuotePreviewPdfProductIntelligenceIntegrationShape"]`
- Functions: `[{"name": "buildEvidenceRequirements", "parameters": ["request"], "form": "function"}, {"name": "buildFreshnessRequirements", "parameters": [], "form": "function"}, {"name": "buildQuotePreviewPdfIntegrationError", "parameters": ["code", "request = {}", "message = ''"], "form": "function"}, {"name": "clone", "parameters": ["value"], "form": "function"}, {"name": "extractBindingSafeError", "parameters": ["binding"], "form": "function"}, {"name": "getCalculatorRefs", "parameters": ["binding"], "form": "function"}, {"name": "getField", "parameters": ["object", "names"], "form": "function"}, {"name": "hasSourceEvidence", "parameters": ["request"], "form": "function"}, {"name": "integrateQuotePreviewPdfEngineWithProductIntelligence", "parameters": ["request = {}"], "form": "function"}, {"name": "normalizeSourceEvidenceRefs", "parameters": ["request"], "form": "function"}, {"name": "normalizeText", "parameters": ["value"], "form": "function"}, {"name": "slug", "parameters": ["value"], "form": "function"}, {"name": "validateQuotePreviewPdfProductIntelligenceIntegrationShape", "parameters": ["integration"], "form": "function"}, {"name": "validationOk", "parameters": ["result"], "form": "function"}]`
- Classes: `[]`
- Events: `[]`
- Cache calls: `[]`
- Cache keys: `[{"source": "quote_pdf_string_literal", "name": "", "value": "./quote-preview-product-intelligence-binding-adapter-074b.js"}, {"source": "quote_pdf_string_literal", "name": "", "value": "forge.quote_preview.pdf_engine_product_intelligence.integration.adapter.v1"}, {"source": "quote_pdf_string_literal", "name": "", "value": "forge.quote_preview.pdf_engine_product_intelligence.integration.v1"}, {"source": "quote_pdf_string_literal", "name": "", "value": "quote_preview_pdf_engine_product_intelligence_integration"}, {"source": "quote_pdf_string_literal", "name": "", "value": ";\n\nconst QUOTE_PREVIEW_PDF_ENGINE_REF = "}, {"source": "quote_pdf_string_literal", "name": "", "value": "platform/adapters/quote-preview/quote-preview-product-intelligence-binding-adapter-074b.js"}, {"source": "quote_pdf_string_literal", "name": "", "value": "QUOTE_PREVIEW_PDF_PRODUCT_INTELLIGENCE_NOT_INTEGRATED"}, {"source": "quote_pdf_string_literal", "name": "", "value": "QUOTE_PREVIEW_PDF_PRODUCT_FAMILY_NOT_MAPPED"}, {"source": "quote_pdf_string_literal", "name": "", "value": "QUOTE_PREVIEW_PDF_BINDING_REQUIRED"}, {"source": "quote_pdf_string_literal", "name": "", "value": "QUOTE_PREVIEW_PDF_SOURCE_EVIDENCE_REQUIRED"}, {"source": "quote_pdf_string_literal", "name": "", "value": "QUOTE_PREVIEW_PDF_FRESHNESS_REQUIRED"}, {"source": "quote_pdf_string_literal", "name": "", "value": "QUOTE_PREVIEW_PDF_ENGINE_NOT_MAPPED"}, {"source": "quote_pdf_string_literal", "name": "", "value": "quote_preview_pdf_integration_id"}, {"source": "quote_pdf_string_literal", "name": "", "value": "quote_preview_request_id"}, {"source": "quote_pdf_string_literal", "name": "", "value": "quote_preview_pdf_engine_ref"}, {"source": "quote_pdf_string_literal", "name": "", "value": "quote_preview_pdf_engine_role"}, {"source": "quote_pdf_string_literal", "name": "", "value": "quote_preview_binding_ref"}, {"source": "quote_pdf_string_literal", "name": "", "value": ") return candidate;\n  return candidate.code || candidate.errorCode || candidate.safe_error_code || null;\n}\n\nfunction buildQuotePreviewPdfIntegrationError(code, request = {}, message = "}, {"source": "quote_pdf_string_literal", "name": "", "value": ",\n    quote_preview_pdf_integration_id: `quote_preview_pdf_pi_integration_error_${slug(code)}_${slug(getField(request, ["}, {"source": "quote_pdf_string_literal", "name": "", "value": "quotePreviewRequestId"}, {"source": "quote_pdf_string_literal", "name": "", "value": ")}`,\n    quote_preview_request_id: getField(request, ["}, {"source": "quote_pdf_string_literal", "name": "", "value": "]) || null,\n    quote_preview_pdf_engine_ref: QUOTE_PREVIEW_PDF_ENGINE_REF,\n    quote_preview_pdf_engine_role: "}, {"source": "quote_pdf_string_literal", "name": "", "value": ",\n    quote_preview_binding_ref: BINDING_ADAPTER_REF,\n    product_intelligence_ref: null,\n    product_family: getField(request, ["}, {"source": "quote_pdf_string_literal", "name": "", "value": "Quote Preview PDF Engine is not integrated with Product Intelligence for this request."}, {"source": "quote_pdf_string_literal", "name": "", "value": "quote_preview_pdf_product_intelligence_integration_error"}, {"source": "quote_pdf_string_literal", "name": "", "value": "075B_QUOTE_PREVIEW_PDF_ENGINE_PRODUCT_INTELLIGENCE_INTEGRATION_IMPLEMENTATION"}, {"source": "quote_pdf_string_literal", "name": "", "value": "]);\n  if (Array.isArray(refs)) return refs.filter(Boolean).map(String);\n  if (refs) return [String(refs)];\n  return [];\n}\n\nfunction integrateQuotePreviewPdfEngineWithProductIntelligence(request = {}) {\n  const quotePreviewRequestId = getField(request, ["}, {"source": "quote_pdf_string_literal", "name": "", "value": "]) || `quote_preview_request_${slug(getField(request, ["}, {"source": "quote_pdf_string_literal", "name": "", "value": ")}`;\n\n  if (!hasSourceEvidence(request)) {\n    return buildQuotePreviewPdfIntegrationError(\n      SAFE_ERROR_CODES.SOURCE_EVIDENCE_REQUIRED,\n      { ...request, quote_preview_request_id: quotePreviewRequestId },\n      "}, {"source": "quote_pdf_string_literal", "name": "", "value": "\n    );\n  }\n\n  if (!bindingAdapter || typeof bindingAdapter.bindQuotePreviewToProductIntelligence !== "}, {"source": "quote_pdf_string_literal", "name": "", "value": ") {\n    return buildQuotePreviewPdfIntegrationError(\n      SAFE_ERROR_CODES.BINDING_REQUIRED,\n      { ...request, quote_preview_request_id: quotePreviewRequestId },\n      "}, {"source": "quote_pdf_string_literal", "name": "", "value": "\n    );\n  }\n\n  const bindingRequest = {\n    quote_preview_request_id: quotePreviewRequestId,\n    product_family_hint: getField(request, ["}, {"source": "quote_pdf_string_literal", "name": "", "value": "pdf_preview_reference_only"}, {"source": "quote_pdf_string_literal", "name": "", "value": "QUOTE_PREVIEW_PRODUCT_FAMILY_NOT_MAPPED"}, {"source": "quote_pdf_string_literal", "name": "", "value": ") {\n    const validation = bindingAdapter.validateQuotePreviewBindingShape(binding);\n    if (!validationOk(validation)) {\n      return buildQuotePreviewPdfIntegrationError(\n        SAFE_ERROR_CODES.BINDING_REQUIRED,\n        bindingRequest,\n        "}, {"source": "quote_pdf_string_literal", "name": "", "value": "]);\n  if (!productFamily) {\n    return buildQuotePreviewPdfIntegrationError(\n      SAFE_ERROR_CODES.PRODUCT_FAMILY_NOT_MAPPED,\n      bindingRequest,\n      "}, {"source": "quote_pdf_string_literal", "name": "", "value": ",\n    quote_preview_pdf_integration_id: `quote_preview_pdf_pi_integration_${slug(productFamily)}_${slug(quotePreviewRequestId)}`,\n    quote_preview_request_id: quotePreviewRequestId,\n    quote_preview_pdf_engine_ref: QUOTE_PREVIEW_PDF_ENGINE_REF,\n    quote_preview_pdf_engine_role: "}, {"source": "quote_pdf_string_literal", "name": "", "value": ",\n    quote_preview_binding_ref: BINDING_ADAPTER_REF,\n    quote_preview_binding_id: getField(binding, ["}, {"source": "quote_pdf_string_literal", "name": "", "value": "quotePreviewBindingId"}, {"source": "quote_pdf_string_literal", "name": "", "value": ",\n      pdf_engine_ref: QUOTE_PREVIEW_PDF_ENGINE_REF,\n      parser_ref: parserRef || null,\n      calculator_refs: calculatorRefs,\n      product_intelligence_first: true,\n      pdf_read_allowed: false,\n      parser_execution_allowed: false,\n      calculator_execution_allowed: false,\n      banxico_call_allowed: false,\n      provider_call_allowed: false,\n      real_engine_execution_allowed: false,\n      note: "}, {"source": "quote_pdf_string_literal", "name": "", "value": "quote_preview_pdf_product_intelligence_integration_used"}]`
- Storage APIs: `[]`
- PDF processing signals: `true`
- Cache writer signals: `false`
- Cache reader signals: `false`

Relevant static lines:

- L3: `const bindingAdapter = require('./quote-preview-product-intelligence-binding-adapter-074b.js');`
- L11: `const QUOTE_PREVIEW_PDF_ENGINE_REF = 'product-intelligence/evidence/forge-quote-pdf-preview-engine.js';`
- L12: `const BINDING_ADAPTER_REF = 'platform/adapters/quote-preview/quote-preview-product-intelligence-binding-adapter-074b.js';`
- L102: `return JSON.parse(JSON.stringify(value));`
- L149: `note: 'PDF source and evidence refs are required before any future parser/PDF execution.'`
- L208: `message: message || 'Quote Preview PDF Engine is not integrated with Product Intelligence for this request.'`
- L237: `'Source document or evidence references are required before PDF preview integration.'`
- L245: `'Quote Preview Product Intelligence binding adapter is required.'`
- L278: `'Quote Preview Product Intelligence binding shape did not validate.'`
- L332: `note: '075B only creates a reference integration plan. Future phases must explicitly authorize any preview parsing.'`
- L358: `module.exports = {`

### `platform/adapters/quote-preview/quote-preview-product-intelligence-binding-adapter-074b.js`

- SHA-256: `91dd81c82799e03ff83522fd974ee19071048d529860fb2c0d21a545346f6bd7`
- Classifications: `adapter, exchange_rate_cache_or_banxico_domain, quote_preview_related, read_signals`
- Exports: `["ADAPTER_ID", "DEFAULT_SAFETY_FLAGS", "REQUIRED_BINDING_FIELDS", "SAFE_ERROR_CODES", "SCHEMA_VERSION", "bindQuotePreviewToProductIntelligence", "buildQuotePreviewBindingNotBoundError", "validateQuotePreviewBindingShape"]`
- Functions: `[{"name": "bindQuotePreviewToProductIntelligence", "parameters": ["request = {}"], "form": "function"}, {"name": "buildBindingFromRecord", "parameters": ["request", "record", "resolution", "errorCode = null"], "form": "function"}, {"name": "buildQuotePreviewBindingNotBoundError", "parameters": ["request = {}"], "form": "function"}, {"name": "buildSafeError", "parameters": ["record", "errorCode"], "form": "function"}, {"name": "clone", "parameters": ["value"], "form": "function"}, {"name": "findRecordByCarrierRef", "parameters": ["carrierRefHint"], "form": "function"}, {"name": "findRecordByEvidenceRefs", "parameters": ["sourceEvidenceRefs = []"], "form": "function"}, {"name": "findRecordByProductRef", "parameters": ["productRefHint"], "form": "function"}, {"name": "firstRef", "parameters": ["refs = []"], "form": "function"}, {"name": "getCatalogRecords", "parameters": [], "form": "function"}, {"name": "getHintText", "parameters": ["value"], "form": "function"}, {"name": "makeStableId", "parameters": ["value"], "form": "function"}, {"name": "normalizeText", "parameters": ["value"], "form": "function"}, {"name": "refsContain", "parameters": ["refs = []", "needle"], "form": "function"}, {"name": "resolveProductIntelligenceRecord", "parameters": ["request = {}"], "form": "function"}, {"name": "validateQuotePreviewBindingShape", "parameters": ["binding"], "form": "function"}]`
- Classes: `[]`
- Events: `[]`
- Cache calls: `[]`
- Cache keys: `[{"source": "quote_pdf_string_literal", "name": "", "value": "forge.quote_preview.product_intelligence.binding.adapter.v1"}, {"source": "quote_pdf_string_literal", "name": "", "value": "forge.quote_preview.product_intelligence.binding.v1"}, {"source": "quote_pdf_string_literal", "name": "", "value": "QUOTE_PREVIEW_PRODUCT_INTELLIGENCE_NOT_BOUND"}, {"source": "quote_pdf_string_literal", "name": "", "value": "QUOTE_PREVIEW_PRODUCT_FAMILY_NOT_MAPPED"}, {"source": "quote_pdf_string_literal", "name": "", "value": "QUOTE_PREVIEW_PARSER_NOT_MAPPED"}, {"source": "quote_pdf_string_literal", "name": "", "value": "QUOTE_PREVIEW_CALCULATOR_NOT_MAPPED"}, {"source": "quote_pdf_string_literal", "name": "", "value": "QUOTE_PREVIEW_SOURCE_EVIDENCE_REQUIRED"}, {"source": "quote_pdf_string_literal", "name": "", "value": "QUOTE_PREVIEW_FRESHNESS_REQUIRED"}, {"source": "quote_pdf_string_literal", "name": "", "value": "quote_preview_binding_id"}, {"source": "quote_pdf_string_literal", "name": "", "value": "quote_preview_request_id"}, {"source": "quote_pdf_string_literal", "name": "", "value": ",\n    errorCode: SAFE_ERROR_CODES.notBound\n  };\n}\n\nfunction firstRef(refs = []) {\n  return refs[0] || null;\n}\n\nfunction buildSafeError(record, errorCode) {\n  if (errorCode) return errorCode;\n  if (!record) return SAFE_ERROR_CODES.notBound;\n  if (!record.parser_refs?.length) return SAFE_ERROR_CODES.parserNotMapped;\n  if (!record.calculator_refs?.length) return SAFE_ERROR_CODES.calculatorNotMapped;\n  if (!record.evidence_refs?.length) return SAFE_ERROR_CODES.sourceEvidenceRequired;\n  if (!record.freshness_metadata?.status) return SAFE_ERROR_CODES.freshnessRequired;\n  return null;\n}\n\nfunction buildBindingFromRecord(request, record, resolution, errorCode = null) {\n  const requestId = request.quote_preview_request_id || "}, {"source": "quote_pdf_string_literal", "name": "", "value": "quote_preview"}, {"source": "quote_pdf_string_literal", "name": "", "value": "\n    },\n    quote_preview_binding_id: `quote_preview_product_intelligence_binding_${makeStableId(bindingKey)}_074b`,\n    quote_preview_request_id: requestId,\n    product_intelligence_ref: record ? {\n      product_intelligence_id: record.product_intelligence_id,\n      schemaVersion: record.schemaVersion,\n      mode: record.mode,\n      routeClass: record.routeClass,\n      imported: false,\n      executed: false\n    } : null,\n    product_family: productFamily,\n    parser_ref: record ? firstRef(record.parser_refs) : null,\n    calculator_refs: record ? clone(record.calculator_refs) : [],\n    coverage_semantics_ref: record ? {\n      status: record.coverage_semantics.status,\n      mapped_refs: clone(record.coverage_semantics.mapped_refs || []),\n      truth_claimed: false\n    } : null,\n    premium_semantics_ref: record ? {\n      status: record.premium_semantics.status,\n      mapped_refs: clone(record.premium_semantics.mapped_refs || []),\n      truth_claimed: false\n    } : null,\n    currency_semantics_ref: record ? {\n      status: record.currency_semantics.status,\n      mapped_refs: clone(record.currency_semantics.mapped_refs || []),\n      truth_claimed: false\n    } : null,\n    projection_semantics_ref: record ? {\n      status: record.projection_semantics.status,\n      mapped_refs: clone(record.projection_semantics.mapped_refs || []),\n      truth_claimed: false\n    } : null,\n    evidence_requirements: {\n      required: true,\n      source_evidence_refs: Array.isArray(request.source_evidence_refs) ? clone(request.source_evidence_refs) : [],\n      product_intelligence_evidence_refs: record ? clone(record.evidence_refs) : []\n    },\n    freshness_requirements: {\n      required: true,\n      product_intelligence_freshness: record ? clone(record.freshness_metadata) : null\n    },\n    resolution,\n    blocked_effects: record\n      ? Array.from(new Set([...DEFAULT_BLOCKED_EFFECTS, ...(record.blocked_effects || [])]))\n      : clone(DEFAULT_BLOCKED_EFFECTS),\n    safety_flags: clone(DEFAULT_SAFETY_FLAGS),\n    execution_markers: {\n      parserExecution: false,\n      calculatorExecution: false,\n      banxicoCall: false,\n      pdfRead: false,\n      realEngineExecution: false\n    },\n    quote_pdf_preview_role: record?.quote_semantics?.quote_pdf_preview_role || "}, {"source": "quote_pdf_string_literal", "name": "", "value": "\n      ? record?.product_identity?.universal_architecture === true\n      : false,\n    safe_error: safeError\n  };\n}\n\nexport function bindQuotePreviewToProductIntelligence(request = {}) {\n  const { record, resolution, errorCode } = resolveProductIntelligenceRecord(request);\n  return buildBindingFromRecord(request, record, resolution, errorCode);\n}\n\nexport function buildQuotePreviewBindingNotBoundError(request = {}) {\n  return buildBindingFromRecord(request, null, "}, {"source": "quote_pdf_string_literal", "name": "", "value": ", SAFE_ERROR_CODES.notBound);\n}\n\nexport function validateQuotePreviewBindingShape(binding) {\n  const errors = [];\n\n  if (!binding || typeof binding !== "}]`
- Storage APIs: `[]`
- PDF processing signals: `false`
- Cache writer signals: `false`
- Cache reader signals: `false`

Relevant static lines:

- L1: `import {`
- L6: `export const ADAPTER_ID = 'forge.quote_preview.product_intelligence.binding.adapter.v1';`
- L7: `export const SCHEMA_VERSION = 'forge.quote_preview.product_intelligence.binding.v1';`
- L9: `export const SAFE_ERROR_CODES = Object.freeze({`
- L18: `export const DEFAULT_SAFETY_FLAGS = Object.freeze({`
- L43: `export const REQUIRED_BINDING_FIELDS = Object.freeze([`
- L83: `return JSON.parse(JSON.stringify(value));`
- L258: `export function bindQuotePreviewToProductIntelligence(request = {}) {`
- L263: `export function buildQuotePreviewBindingNotBoundError(request = {}) {`
- L267: `export function validateQuotePreviewBindingShape(binding) {`

### `policy-operations/evidence/policy-ocr-engine.js`

- SHA-256: `bef03a5cf532e786b9b7ba760b1e091b86ebb2e8e2fb07056615ba248a16193d`
- Classifications: `evidence_surface, pdf_processing_signals, quote_preview_related`
- Exports: `["extraerTextoOCR"]`
- Functions: `[{"name": "extraerTextoOCR", "parameters": ["{\n    file", "filePath\n}"], "form": "function"}]`
- Classes: `[]`
- Events: `[]`
- Cache calls: `[]`
- Cache keys: `[]`
- Storage APIs: `[]`
- PDF processing signals: `true`
- Cache writer signals: `false`
- Cache reader signals: `false`

Relevant static lines:

- L3: `| MODULE: policy-ocr-engine.js`
- L11: `| OCR/Text extraction foundation para pólizas y cotizaciones PDF.`
- L15: `| En producción esto podrá cambiarse por backend OCR/Vision API.`
- L20: `import { spawnSync } from 'node:child_process';`
- L22: `export async function extraerTextoOCR({`

### `product-intelligence/evidence/forge-quote-pdf-preview-engine.js`

- SHA-256: `d164ce99e24adde28cad3c5e558617eecaa97645f69c888d0ff3ee217e318014`
- Classifications: `evidence_surface, pdf_processing_signals, read_signals`
- Exports: `["buildCalculation", "buildForgeQuoteExcelTables", "detectQuoteDomain", "extractSolucionlineLifeQuoteFields", "summarizeForgeQuotePdfText"]`
- Functions: `[{"name": "buildCalculation", "parameters": ["result", "options = {}"], "form": "function"}, {"name": "buildForgeQuoteExcelTables", "parameters": ["summary"], "form": "function"}, {"name": "cleanValue", "parameters": ["value"], "form": "function"}, {"name": "detectQuoteDomain", "parameters": ["text"], "form": "function"}, {"name": "extractSolucionlineLifeQuoteFields", "parameters": ["text"], "form": "function"}, {"name": "findLine", "parameters": ["pattern"], "form": "arrow"}, {"name": "formatUdi", "parameters": ["value"], "form": "function"}, {"name": "mxn", "parameters": ["valueUdi"], "form": "arrow"}, {"name": "normalizeText", "parameters": ["text"], "form": "function"}, {"name": "numberFrom", "parameters": ["value"], "form": "function"}, {"name": "parseNumberList", "parameters": ["value"], "form": "function"}, {"name": "projectedMxn", "parameters": ["valueUdi"], "form": "arrow"}, {"name": "roundMoney", "parameters": ["value"], "form": "function"}, {"name": "scenario", "parameters": ["offset"], "form": "arrow"}, {"name": "scenarioMxn", "parameters": ["scenario", "projected"], "form": "arrow"}, {"name": "summarizeForgeQuotePdfText", "parameters": ["input = {}"], "form": "function"}, {"name": "yearsFrom", "parameters": ["value"], "form": "function"}]`
- Classes: `[]`
- Events: `[]`
- Cache calls: `[{"owner": "lines", "method": "find"}]`
- Cache keys: `[{"source": "quote_pdf_string_literal", "name": "", "value": ")) : null,\n    quoteDate: (studyDateLine.match(/d[ií]a\\s+([0-9]{1,2}\\/[0-9]{1,2}\\/[0-9]{2,4})/i) || [])[1] || null,\n    extractionSource: "}, {"source": "quote_pdf_string_literal", "name": "", "value": "forge_quote_pdf_preview_with_evidenced_udi_growth_rule"}, {"source": "quote_pdf_string_literal", "name": "", "value": " ? extractSolucionlineLifeQuoteFields(text) : null;\n  const result = {\n    detectedQuoteDomain,\n    ...(extracted || { extractionSource: "}, {"source": "quote_pdf_string_literal", "name": "", "value": "forge-quote-pdf-preview-engine.js"}]`
- Storage APIs: `[]`
- PDF processing signals: `true`
- Cache writer signals: `false`
- Cache reader signals: `true`

Relevant static lines:

- L224: `sourceModule: 'forge-quote-pdf-preview-engine.js',`
- L251: `module.exports = {`

### `product-intelligence/evidence/gmm-quote-parser.js`

- SHA-256: `c20a1d9ee10ef349a86db73bed1c28f1e2ba36534736058fda3e4f3e74161937`
- Classifications: `evidence_surface`
- Exports: `["parseGMMQuote"]`
- Functions: `[{"name": "findMoneyAfter", "parameters": ["label", "text"], "form": "function"}, {"name": "normalizeText", "parameters": ["text = ''"], "form": "function"}, {"name": "parseGMMQuote", "parameters": ["{ text = '' }"], "form": "function"}, {"name": "parseMoney", "parameters": ["value = ''"], "form": "function"}]`
- Classes: `[]`
- Events: `[]`
- Cache calls: `[]`
- Cache keys: `[]`
- Storage APIs: `[]`
- PDF processing signals: `false`
- Cache writer signals: `false`
- Cache reader signals: `false`

Relevant static lines:

- L31: `export function parseGMMQuote({ text = '' }) {`

### `product-intelligence/evidence/solucionline-retirement-parser.js`

- SHA-256: `03715ebbad73e261727a8b45239184ec7d95a69ebda551e908c086c35c50b7f3`
- Classifications: `evidence_surface`
- Exports: `["parseSolucionlineRetirementQuote"]`
- Functions: `[{"name": "getNumber", "parameters": ["value"], "form": "arrow"}, {"name": "parseSolucionlineRetirementQuote", "parameters": ["{ text = '' }"], "form": "function"}]`
- Classes: `[]`
- Events: `[]`
- Cache calls: `[]`
- Cache keys: `[]`
- Storage APIs: `[]`
- PDF processing signals: `false`
- Cache writer signals: `false`
- Cache reader signals: `false`

Relevant static lines:

- L1: `export function parseSolucionlineRetirementQuote({ text = '' }) {`

### `product-intelligence/knowledge/ave/shared-ave-growth-engine.js`

- SHA-256: `2c1a08b3ec6f07db90d6ea52bcd6b2d809692053f9bf0df4e6ef8ee3a930dc5c`
- Classifications: `none`
- Exports: `["AVE_GUARANTEED_RATES", "calculateAveGrowth"]`
- Functions: `[{"name": "calculateAveGrowth", "parameters": ["{\n  aveType", "currency", "principal", "years\n}"], "form": "function"}]`
- Classes: `[]`
- Events: `[]`
- Cache calls: `[]`
- Cache keys: `[]`
- Storage APIs: `[]`
- PDF processing signals: `false`
- Cache writer signals: `false`
- Cache reader signals: `false`

Relevant static lines:

- L44: `module.exports = {`

### `product-intelligence/knowledge/ave/shared-ave-portfolio-engine.js`

- SHA-256: `04d70a24ee62fae8db5986f7292adcfb65a0062732bba181840ee41eef2894cf`
- Classifications: `quote_preview_related`
- Exports: `["calculateAvePortfolio", "resolveAveType"]`
- Functions: `[{"name": "calculateAvePortfolio", "parameters": ["{\n  evaluationYear", "positions = []\n}"], "form": "function"}, {"name": "resolveAveType", "parameters": ["position"], "form": "function"}]`
- Classes: `[]`
- Events: `[]`
- Cache calls: `[]`
- Cache keys: `[]`
- Storage APIs: `[]`
- PDF processing signals: `false`
- Cache writer signals: `false`
- Cache reader signals: `false`

Relevant static lines:

- L3: `} = require("./shared-ave-growth-engine");`
- L7: `} = require("./shared-ave-rescue-engine");`
- L11: `} = require("./shared-ave-type-inference-engine");`
- L180: `module.exports = {`

### `product-intelligence/knowledge/vida-mujer-survival-schedule-engine.js`

- SHA-256: `0cac862db1344d5c97dbe5c60bfab07bf659bd7e95601044da0260203bb9ad19`
- Classifications: `exchange_rate_cache_or_banxico_domain`
- Exports: `["buildVidaMujerSurvivalSchedule"]`
- Functions: `[{"name": "buildPayment", "parameters": ["{ year", "percent", "type }"], "form": "function"}, {"name": "buildVidaMujerSurvivalSchedule", "parameters": ["{\n  sumAssured = 0", "currency = 'UDI'", "startAge = 0", "coverageYears = 20", "exchangeRateToMXN = null", "projectionRate = 0.045\n}"], "form": "function"}, {"name": "getRateForYear", "parameters": ["year"], "form": "function"}]`
- Classes: `[]`
- Events: `[]`
- Cache calls: `[]`
- Cache keys: `[]`
- Storage APIs: `[]`
- PDF processing signals: `false`
- Cache writer signals: `false`
- Cache reader signals: `false`

Relevant static lines:

- L1: `export function buildVidaMujerSurvivalSchedule({`

### `retirement-future-udi-projection-engine.js`

- SHA-256: `549aea616c585bc84be09c08ff9c77f500d5884458b154dffb9af3c72b8e686e`
- Classifications: `none`
- Exports: `["CALCULATION_MODE", "SUPPORTED_VALUE_TYPES", "projectFutureUdiValue", "projectRetirementFutureUdi"]`
- Functions: `[{"name": "normalizeValueType", "parameters": ["valueType"], "form": "function"}, {"name": "projectFutureUdiValue", "parameters": ["{\n  currentAge", "targetAge", "currentUdiValue", "projectionRate\n}"], "form": "function"}, {"name": "projectRetirementFutureUdi", "parameters": ["{\n  currentAge", "targetAge", "currentUdiValue", "amountUDI", "projectionRate", "valueType\n}"], "form": "function"}, {"name": "requireFiniteNumber", "parameters": ["value", "fieldName"], "form": "function"}]`
- Classes: `[]`
- Events: `[]`
- Cache calls: `[]`
- Cache keys: `[]`
- Storage APIs: `[]`
- PDF processing signals: `false`
- Cache writer signals: `false`
- Cache reader signals: `false`

Relevant static lines:

- L93: `module.exports = {`

### `retirement-future-udi-projection-smoke-test.js`

- SHA-256: `553659776fbb80f720cf934d25a2d10cc63dc3ab85fcf034d7aacd5e69589b29`
- Classifications: `bridge_or_event_candidate`
- Exports: `[]`
- Functions: `[{"name": "assert", "parameters": ["condition", "message"], "form": "function"}, {"name": "assertClose", "parameters": ["actual", "expected", "tolerance", "label"], "form": "function"}, {"name": "test", "parameters": ["label", "fn"], "form": "function"}]`
- Classes: `[]`
- Events: `[]`
- Cache calls: `[]`
- Cache keys: `[]`
- Storage APIs: `[]`
- PDF processing signals: `false`
- Cache writer signals: `false`
- Cache reader signals: `false`

Relevant static lines:

- L5: `} = require("./retirement-future-udi-projection-engine");`
- L8: `} = require("./imagina-ser-future-mxn-bridge");`

### `runtime.js`

- SHA-256: `9230601442562ddc2e74a08f74a83eada2a4026856c6125f9caa8fd6a7278031`
- Classifications: `runtime_candidate`
- Exports: `["Runtime", "RuntimeManager"]`
- Functions: `[]`
- Classes: `["RuntimeManager"]`
- Events: `["abort"]`
- Cache calls: `[{"owner": "this.cleanupTasks", "method": "delete"}, {"owner": "this.routeCache", "method": "get"}, {"owner": "this.routeCache", "method": "set"}]`
- Cache keys: `[]`
- Storage APIs: `[]`
- PDF processing signals: `false`
- Cache writer signals: `true`
- Cache reader signals: `true`

Relevant static lines:

- L4: `export class RuntimeManager {`
- L107: `signal.addEventListener(`
- L130: `export const Runtime = new RuntimeManager();`

### `segu-beca-client-presentation-engine.js`

- SHA-256: `64903705a82adf8e456ec5bfde4f51a90a05900ac615f3687baabf937daa5a69`
- Classifications: `quote_preview_related`
- Exports: `["buildSeguBecaClientPresentation"]`
- Functions: `[{"name": "buildSeguBecaClientPresentation", "parameters": ["{\n  childName", "childAge", "contractorName", "contractorAge", "termYears", "educationCapitalUDI", "finalRecoveryUDI", "monthlyDeliveryUDI", "totalAnnualPremiumUDI", "recommendedAnnualPremiumUDI", "decision", "educationOptions\n}"], "form": "function"}]`
- Classes: `[]`
- Events: `[]`
- Cache calls: `[]`
- Cache keys: `[]`
- Storage APIs: `[]`
- PDF processing signals: `false`
- Cache writer signals: `false`
- Cache reader signals: `false`

Relevant static lines:

- L91: `module.exports = {`

### `segu-beca-education-comparison-engine.js`

- SHA-256: `c6c44c83efca66b3251780e36586e55ad4182a96202cc58088c7caa477a40136`
- Classifications: `none`
- Exports: `["buildSeguBecaEducationComparison"]`
- Functions: `[{"name": "buildSeguBecaEducationComparison", "parameters": ["{\n  childAge", "projectedCapitalMXN", "annualEducationInflation = 0.07\n}"], "form": "function"}]`
- Classes: `[]`
- Events: `[]`
- Cache calls: `[]`
- Cache keys: `[]`
- Storage APIs: `[]`
- PDF processing signals: `false`
- Cache writer signals: `false`
- Cache reader signals: `false`

Relevant static lines:

- L3: `} = require("./product-intelligence/knowledge/shared-education-cost-engine");`
- L27: `module.exports = {`

### `shared-banxico-edge-provider.js`

- SHA-256: `97d26b9bc1db218531c1e105d558770414207a6bad8f556c6cd859200ef2d9e9`
- Classifications: `exchange_rate_cache_or_banxico_domain`
- Exports: `["getCurrentRatesFromSupabaseEdge", "normalizeSupabaseBanxicoRatesResponse"]`
- Functions: `[{"name": "assertNoTokenLikeSecretInMessage", "parameters": ["message"], "form": "function"}, {"name": "getCurrentRatesFromSupabaseEdge", "parameters": ["{ fetchImpl = globalThis.fetch } = {}"], "form": "function"}, {"name": "getSupabaseAnonKey", "parameters": [], "form": "function"}, {"name": "getSupabaseBanxicoRatesUrl", "parameters": [], "form": "function"}, {"name": "normalizeSupabaseBanxicoRatesResponse", "parameters": ["payload"], "form": "function"}]`
- Classes: `[]`
- Events: `[]`
- Cache calls: `[]`
- Cache keys: `[]`
- Storage APIs: `[]`
- PDF processing signals: `false`
- Cache writer signals: `false`
- Cache reader signals: `false`

Relevant static lines:

- L74: `payload = JSON.parse(text);`
- L88: `module.exports = {`

### `shared-banxico-rate-engine.js`

- SHA-256: `cd89e984a70006ed63b2982baaec97679898b78be49b4f646714f7ab384b579e`
- Classifications: `exchange_rate_cache_or_banxico_domain`
- Exports: `["BANXICO_SERIES", "fetchBanxicoLatest", "getCurrentRates"]`
- Functions: `[{"name": "fetchBanxicoLatest", "parameters": ["seriesId"], "form": "function"}, {"name": "getCurrentRates", "parameters": [], "form": "function"}, {"name": "getToken", "parameters": [], "form": "function"}]`
- Classes: `[]`
- Events: `[]`
- Cache calls: `[]`
- Cache keys: `[]`
- Storage APIs: `[]`
- PDF processing signals: `false`
- Cache writer signals: `false`
- Cache reader signals: `false`

Relevant static lines:

- L1: `const https = require("https");`
- L53: `const parsed = JSON.parse(data);`
- L66: `reject(new Error('Banxico parse error: ${error.message}. Raw: ${data.slice(0, 200)}'));`
- L88: `module.exports = {`

### `telemetry.js`

- SHA-256: `75089ac1f42a15b9346df40d304d8f6d564fd6d963242656f700afb706384c0b`
- Classifications: `none`
- Exports: `["Telemetry"]`
- Functions: `[]`
- Classes: `["TelemetryRuntime"]`
- Events: `["beforeunload", "visibilitychange"]`
- Cache calls: `[]`
- Cache keys: `[]`
- Storage APIs: `[]`
- PDF processing signals: `false`
- Cache writer signals: `false`
- Cache reader signals: `false`

Relevant static lines:

- L126: `window.addEventListener(`
- L135: `document.addEventListener(`
- L152: `export const Telemetry =`

### `tests/gmm-out-of-pocket-test.js`

- SHA-256: `90cc2802c441c145277bf02464ae9ba3fd6edb75258e33fadbcfa7f9135f34d2`
- Classifications: `pdf_processing_signals, read_signals, write_signals`
- Exports: `[]`
- Functions: `[{"name": "assert", "parameters": ["condition", "message"], "form": "function"}, {"name": "money", "parameters": ["value"], "form": "function"}, {"name": "test", "parameters": ["name", "fn"], "form": "function"}]`
- Classes: `[]`
- Events: `[]`
- Cache calls: `[]`
- Cache keys: `[]`
- Storage APIs: `[]`
- PDF processing signals: `true`
- Cache writer signals: `false`
- Cache reader signals: `false`

Relevant static lines:

- L1: `import { extraerTextoOCR } from '../policy-operations/evidence/policy-ocr-engine.js';`
- L2: `import { parseGMMQuote } from '../product-intelligence/evidence/gmm-quote-parser.js';`
- L3: `import { calcularParticipacionClienteGMM } from '../product-intelligence/coverage/gmm-out-of-pocket-engine.js';`
- L6: `'/storage/emulated/0/Download/Solucionline_20251215_16_06.PDF';`
- L8: `const ocr = await extraerTextoOCR({`
- L12: `const quote = parseGMMQuote({`
- L13: `text: ocr.extractedText`
- L42: `deductible: quote.deductible,`
- L43: `coinsurancePercent: quote.coinsurance.percent,`
- L44: `coinsuranceCap: quote.coinsurance.maxOutOfPocket`
- L82: `deductible: quote.deductible,`
- L83: `coinsurancePercent: quote.coinsurance.percent,`
- L84: `coinsuranceCap: quote.coinsurance.maxOutOfPocket`
- L102: `deductible: quote.deductible,`
- L103: `coinsurancePercent: quote.coinsurance.percent,`
- L104: `coinsuranceCap: quote.coinsurance.maxOutOfPocket`
- L121: `console.log('Producto: ${quote.productName}');`
- L122: `console.log('Plan: ${quote.plan}');`
- L123: `console.log('Deducible: ${money(quote.deductible)}');`
- L124: `console.log('Coaseguro: ${quote.coinsurance.percent}%');`
- L125: `console.log('Tope coaseguro: ${money(quote.coinsurance.maxOutOfPocket)}');`

### `tests/product-intelligence/forge-quote-pdf-preview-engine-test.js`

- SHA-256: `3280463c1ff107fcf71699f77dac2eefc223fe36974ed2c6425cc8511c65e176`
- Classifications: `pdf_processing_signals`
- Exports: `[]`
- Functions: `[]`
- Classes: `[]`
- Events: `[]`
- Cache calls: `[]`
- Cache keys: `[{"source": "quote_pdf_string_literal", "name": "", "value": "../../product-intelligence/evidence/forge-quote-pdf-preview-engine.js"}, {"source": "quote_pdf_string_literal", "name": "", "value": "PASS forge quote pdf preview engine test"}]`
- Storage APIs: `[]`
- PDF processing signals: `true`
- Cache writer signals: `false`
- Cache reader signals: `false`

Relevant static lines:

- L3: `const assert = require('assert');`
- L7: `} = require('../../product-intelligence/evidence/forge-quote-pdf-preview-engine.js');`
- L74: `console.log('PASS forge quote pdf preview engine test');`

### `tests/quote-preview-pdf-engine-repo-promotion-adapter-076b-test.js`

- SHA-256: `fc17bad3da45441a9aea3baa22fbaaea227f194b973b7acfb01ca8b2296371dc`
- Classifications: `adapter, exchange_rate_cache_or_banxico_domain, governance_or_promotion_adapter, pdf_processing_signals, quote_preview_related, read_signals`
- Exports: `[]`
- Functions: `[]`
- Classes: `[]`
- Events: `[]`
- Cache calls: `[]`
- Cache keys: `[{"source": "quote_pdf_string_literal", "name": "", "value": "../platform/adapters/quote-preview/quote-preview-pdf-engine-repo-promotion-adapter-076b.js"}, {"source": "quote_pdf_string_literal", "name": "", "value": "forge.quote_preview.pdf_engine.repo_promotion.adapter.v1"}, {"source": "quote_pdf_string_literal", "name": "", "value": "forge.quote_preview.pdf_engine.repo_promotion.v1"}, {"source": "quote_pdf_string_literal", "name": "", "value": ");\nassert.equal(typeof adapter.prepareQuotePreviewPdfEnginePromotionScope, "}, {"source": "quote_pdf_string_literal", "name": "", "value": ");\nassert.equal(typeof adapter.buildQuotePreviewPdfEnginePromotionError, "}, {"source": "quote_pdf_string_literal", "name": "", "value": ");\nassert.equal(typeof adapter.validateQuotePreviewPdfEnginePromotionShape, "}, {"source": "quote_pdf_string_literal", "name": "", "value": ");\n\nconst manifest = adapter.getQuotePreviewPdfEnginePromotionManifest();\n\nassert.equal(manifest.schemaVersion, adapter.SCHEMA_VERSION);\nassert.equal(manifest.domainId, "}, {"source": "quote_pdf_string_literal", "name": "", "value": ");\nassert.equal(manifest.promotion_constraints.product_intelligence_binding_required, true);\nassert.equal(manifest.promotion_constraints.product_intelligence_upstream_semantic_authority, true);\nassert.equal(manifest.promotion_constraints.quote_preview_pdf_engine_downstream_consumer_reference_only, true);\nassert.equal(manifest.promotion_constraints.executes_pdf_read, false);\nassert.equal(manifest.promotion_constraints.executes_parser, false);\nassert.equal(manifest.promotion_constraints.executes_calculator, false);\nassert.equal(manifest.promotion_constraints.calls_banxico, false);\nassert.equal(manifest.promotion_constraints.writes_quote, false);\nassert.equal(manifest.promotion_constraints.creates_quote_truth, false);\n\nconst gmm = adapter.prepareQuotePreviewPdfEnginePromotionScope({\n  quote_preview_pdf_request_id: "}, {"source": "quote_pdf_string_literal", "name": "", "value": ");\nassert.equal(gmm.product_intelligence_binding_ref.required, true);\nassert.equal(gmm.preview_constraints.product_intelligence_binding_required, true);\nassert.equal(gmm.preview_constraints.reference_only, true);\nassert.equal(gmm.preview_constraints.no_pdf_read, true);\nassert.equal(gmm.preview_constraints.no_parser_execution, true);\nassert.equal(gmm.preview_constraints.no_calculator_execution, true);\nassert.equal(gmm.preview_constraints.no_banxico_call, true);\nassert.equal(gmm.preview_constraints.no_quote_truth, true);\nassert.equal(gmm.safe_error, null);\nassert.equal(adapter.validateQuotePreviewPdfEnginePromotionShape(gmm).ok, true);\n\nconst imagina = adapter.prepareQuotePreviewPdfEnginePromotionScope({\n  quote_preview_pdf_request_id: "}, {"source": "quote_pdf_string_literal", "name": "", "value": ");\nassert.equal(imagina.preview_constraints.universal_architecture, false);\nassert(imagina.preview_constraints.product_notes.includes("}, {"source": "quote_pdf_string_literal", "name": "", "value": "));\nassert.equal(adapter.validateQuotePreviewPdfEnginePromotionShape(imagina).ok, true);\n\nconst missing = adapter.prepareQuotePreviewPdfEnginePromotionScope({\n  quote_preview_pdf_request_id: "}, {"source": "quote_pdf_string_literal", "name": "", "value": ");\nassert.equal(missing.safe_error.code, adapter.SAFE_ERROR_CODES.PRODUCT_FAMILY_NOT_MAPPED);\nassert.equal(adapter.validateQuotePreviewPdfEnginePromotionShape(missing).ok, true);\n\nfor (const family of ["}, {"source": "quote_pdf_string_literal", "name": "", "value": "]) {\n  const output = adapter.prepareQuotePreviewPdfEnginePromotionScope({\n    quote_preview_pdf_request_id: `qa_076b_${family}`,\n    product_family_hint: family,\n    source_document_ref: "}, {"source": "quote_pdf_string_literal", "name": "", "value": ", `${family} should be mapped`);\n  assert.equal(adapter.validateQuotePreviewPdfEnginePromotionShape(output).ok, true);\n}\n\nfor (const [key, value] of Object.entries(adapter.DEFAULT_SAFETY_FLAGS)) {\n  assert.equal(value, false, `DEFAULT_SAFETY_FLAGS.${key} must be false`);\n}\n\nconst combined = JSON.stringify({ manifest, gmm, imagina, missing, flags: adapter.DEFAULT_SAFETY_FLAGS });\nconst forbiddenFragments = [\n  "}, {"source": "quote_pdf_string_literal", "name": "", "value": "quote-preview-product-intelligence-binding-adapter-074b.js"}, {"source": "quote_pdf_string_literal", "name": "", "value": "quote-preview-pdf-product-intelligence-integration-adapter-075b.js"}, {"source": "quote_pdf_string_literal", "name": "", "value": "forge-quote-pdf-preview-engine.js"}, {"source": "quote_pdf_string_literal", "name": "", "value": "PASS quote preview pdf engine repo promotion adapter 076B"}]`
- Storage APIs: `[]`
- PDF processing signals: `true`
- Cache writer signals: `false`
- Cache reader signals: `false`

Relevant static lines:

- L3: `const assert = require('node:assert/strict');`
- L5: `const adapter = require('../platform/adapters/quote-preview/quote-preview-pdf-engine-repo-promotion-adapter-076b.js');`
- L108: `assert(combined.includes('quote-preview-product-intelligence-binding-adapter-074b.js'));`
- L109: `assert(combined.includes('quote-preview-pdf-product-intelligence-integration-adapter-075b.js'));`
- L111: `assert(combined.includes('forge-quote-pdf-preview-engine.js'));`
- L113: `console.log('PASS quote preview pdf engine repo promotion adapter 076B');`

### `tests/quote-preview-pdf-product-intelligence-integration-adapter-075b-test.js`

- SHA-256: `d757e293e2f9661e5a38e6f2ddc9737123e81e954dbfc3216e7e030a162166ff`
- Classifications: `adapter, exchange_rate_cache_or_banxico_domain, pdf_processing_signals, quote_preview_related`
- Exports: `[]`
- Functions: `[{"name": "shapeOk", "parameters": ["value"], "form": "function"}]`
- Classes: `[]`
- Events: `[]`
- Cache calls: `[]`
- Cache keys: `[{"source": "quote_pdf_string_literal", "name": "", "value": "../platform/adapters/quote-preview/quote-preview-pdf-product-intelligence-integration-adapter-075b.js"}, {"source": "quote_pdf_string_literal", "name": "", "value": "forge.quote_preview.pdf_engine_product_intelligence.integration.adapter.v1"}, {"source": "quote_pdf_string_literal", "name": "", "value": "forge.quote_preview.pdf_engine_product_intelligence.integration.v1"}, {"source": "quote_pdf_string_literal", "name": "", "value": "quote_preview_pdf_engine_product_intelligence_integration"}, {"source": "quote_pdf_string_literal", "name": "", "value": ");\n\nassert.equal(typeof adapter.integrateQuotePreviewPdfEngineWithProductIntelligence, "}, {"source": "quote_pdf_string_literal", "name": "", "value": ");\nassert.equal(typeof adapter.buildQuotePreviewPdfIntegrationError, "}, {"source": "quote_pdf_string_literal", "name": "", "value": ");\nassert.equal(typeof adapter.validateQuotePreviewPdfProductIntelligenceIntegrationShape, "}, {"source": "quote_pdf_string_literal", "name": "", "value": ");\n\nconst gmm = adapter.integrateQuotePreviewPdfEngineWithProductIntelligence({\n  quote_preview_request_id: "}, {"source": "quote_pdf_string_literal", "name": "", "value": ");\nassert.equal(gmm.quote_preview_pdf_engine_role, "}, {"source": "quote_pdf_string_literal", "name": "", "value": ");\nassert.equal(gmm.extraction_plan.product_intelligence_first, true);\nassert.equal(gmm.extraction_plan.pdf_read_allowed, false);\nassert.equal(gmm.extraction_plan.parser_execution_allowed, false);\nassert.equal(gmm.extraction_plan.calculator_execution_allowed, false);\nassert.equal(gmm.extraction_plan.banxico_call_allowed, false);\nassert.equal(gmm.extraction_plan.real_engine_execution_allowed, false);\nassert.equal(shapeOk(gmm), true);\n\nconst imagina = adapter.integrateQuotePreviewPdfEngineWithProductIntelligence({\n  quote_preview_request_id: "}, {"source": "quote_pdf_string_literal", "name": "", "value": ");\nassert.equal(imagina.quote_preview_pdf_engine_role, "}, {"source": "quote_pdf_string_literal", "name": "", "value": ");\nassert.equal(shapeOk(imagina), true);\n\nconst missingFamily = adapter.integrateQuotePreviewPdfEngineWithProductIntelligence({\n  quote_preview_request_id: "}, {"source": "quote_pdf_string_literal", "name": "", "value": ");\nassert(\n  [\n    adapter.SAFE_ERROR_CODES.NOT_INTEGRATED,\n    adapter.SAFE_ERROR_CODES.PRODUCT_FAMILY_NOT_MAPPED\n  ].includes(missingFamily.safe_error.code)\n);\n\nconst missingEvidence = adapter.integrateQuotePreviewPdfEngineWithProductIntelligence({\n  quote_preview_request_id: "}, {"source": "quote_pdf_string_literal", "name": "", "value": "PASS quote preview pdf product intelligence integration adapter 075B"}]`
- Storage APIs: `[]`
- PDF processing signals: `true`
- Cache writer signals: `false`
- Cache reader signals: `false`

Relevant static lines:

- L3: `const assert = require('node:assert/strict');`
- L4: `const adapter = require('../platform/adapters/quote-preview/quote-preview-pdf-product-intelligence-integration-adapter-075b.js');`
- L104: `console.log('PASS quote preview pdf product intelligence integration adapter 075B');`

### `tests/quote-preview-product-intelligence-binding-adapter-074b-test.js`

- SHA-256: `39f73b4a24a317ef2e966fbc9d4a10f02a284f744652642a0f51671ebf959099`
- Classifications: `adapter, exchange_rate_cache_or_banxico_domain, quote_preview_related`
- Exports: `[]`
- Functions: `[{"name": "assertFalseFlags", "parameters": ["flags", "label"], "form": "function"}, {"name": "assertNoExecution", "parameters": ["binding"], "form": "function"}]`
- Classes: `[]`
- Events: `[]`
- Cache calls: `[]`
- Cache keys: `[{"source": "quote_pdf_string_literal", "name": "", "value": ";\nimport {\n  DEFAULT_SAFETY_FLAGS,\n  SAFE_ERROR_CODES,\n  SCHEMA_VERSION,\n  bindQuotePreviewToProductIntelligence,\n  buildQuotePreviewBindingNotBoundError,\n  validateQuotePreviewBindingShape\n} from "}, {"source": "quote_pdf_string_literal", "name": "", "value": "));\n}\n\nconst gmmBinding = bindQuotePreviewToProductIntelligence({\n  quote_preview_request_id: "}, {"source": "quote_pdf_string_literal", "name": "", "value": "quote_preview"}, {"source": "quote_pdf_string_literal", "name": "", "value": "));\nassert.equal(gmmBinding.quote_pdf_preview_role, "}, {"source": "quote_pdf_string_literal", "name": "", "value": ");\nassertNoExecution(gmmBinding);\nassert.equal(validateQuotePreviewBindingShape(gmmBinding).valid, true);\n\nconst imaginaBinding = bindQuotePreviewToProductIntelligence({\n  quote_preview_request_id: "}, {"source": "quote_pdf_string_literal", "name": "", "value": ");\nassert.equal(imaginaBinding.imagina_ser_universal_architecture, false);\nassert.equal(imaginaBinding.quote_pdf_preview_role, "}, {"source": "quote_pdf_string_literal", "name": "", "value": ");\nassertNoExecution(imaginaBinding);\nassert.equal(validateQuotePreviewBindingShape(imaginaBinding).valid, true);\n\nconst byProductRef = bindQuotePreviewToProductIntelligence({\n  quote_preview_request_id: "}, {"source": "quote_pdf_string_literal", "name": "", "value": ");\nassert.equal(byProductRef.safe_error, null);\nassertNoExecution(byProductRef);\n\nconst missing = bindQuotePreviewToProductIntelligence({\n  quote_preview_request_id: "}, {"source": "quote_pdf_string_literal", "name": "", "value": ");\nassertNoExecution(missing);\nassert.equal(validateQuotePreviewBindingShape(missing).valid, true);\n\nconst notBound = buildQuotePreviewBindingNotBoundError({\n  quote_preview_request_id: "}, {"source": "quote_pdf_string_literal", "name": "", "value": ");\nassertNoExecution(notBound);\nassert.equal(validateQuotePreviewBindingShape(notBound).valid, true);\n\nconsole.log("}]`
- Storage APIs: `[]`
- PDF processing signals: `false`
- Cache writer signals: `false`
- Cache reader signals: `false`

Relevant static lines:

- L1: `import assert from 'node:assert/strict';`
- L2: `import {`
- L9: `} from '../platform/adapters/quote-preview/quote-preview-product-intelligence-binding-adapter-074b.js';`
- L44: `assert.equal(gmmBinding.parser_ref.ref, 'product-intelligence/evidence/gmm-quote-parser.js');`
- L100: `console.log('PASS quote preview product intelligence binding adapter 074B');`

### `tests/real-gmm-quote-test.js`

- SHA-256: `35fd53dd90768ba40dedda45dff65f2f451c319c058b8e0446509369536c1441`
- Classifications: `pdf_processing_signals, read_signals, write_signals`
- Exports: `[]`
- Functions: `[{"name": "assert", "parameters": ["condition", "message"], "form": "function"}, {"name": "test", "parameters": ["name", "fn"], "form": "function"}]`
- Classes: `[]`
- Events: `[]`
- Cache calls: `[]`
- Cache keys: `[]`
- Storage APIs: `[]`
- PDF processing signals: `true`
- Cache writer signals: `false`
- Cache reader signals: `false`

Relevant static lines:

- L1: `import { extraerTextoOCR }`
- L2: `from '../policy-operations/evidence/policy-ocr-engine.js';`
- L4: `import { parseGMMQuote }`
- L5: `from '../product-intelligence/evidence/gmm-quote-parser.js';`
- L8: `'/storage/emulated/0/Download/Solucionline_20251215_16_06.PDF';`
- L10: `const ocr =`
- L16: `const quote =`
- L19: `ocr.extractedText`
- L61: `quote.productName ===`
- L73: `quote.plan ===`
- L85: `quote.deductible ===`
- L97: `quote.coinsurance.percent ===`
- L109: `quote.coinsurance.maxOutOfPocket ===`
- L121: `quote.sumAssured ===`
- L133: `quote.tabulator ===`
- L145: `quote.territoriality ===`
- L157: `quote.annualPremium ===`
- L193: `quote,`

### `tests/real-pdf-ocr-test.js`

- SHA-256: `c4d9410b04a190eaf7335d8ef7a0f40747af0594cb26627d2ee0b21f29426a36`
- Classifications: `pdf_processing_signals, read_signals, write_signals`
- Exports: `[]`
- Functions: `[{"name": "assert", "parameters": ["condition", "message"], "form": "function"}, {"name": "test", "parameters": ["name", "fn"], "form": "function"}]`
- Classes: `[]`
- Events: `[]`
- Cache calls: `[]`
- Cache keys: `[]`
- Storage APIs: `[]`
- PDF processing signals: `true`
- Cache writer signals: `false`
- Cache reader signals: `false`

Relevant static lines:

- L1: `import { existsSync } from 'node:fs';`
- L2: `import { extraerTextoOCR } from '../policy-operations/evidence/policy-ocr-engine.js';`
- L4: `const DEFAULT_PDF_PATH = '/storage/emulated/0/Download/Solucionline_20260601_13_09.PDF';`
- L9: `'SKIPPED: local PDF fixture not found. Set FORGE_LOCAL_PDF_PATH to run this manual OCR test.'`
- L33: `test('real PDF OCR extrae texto de Solucionline', () => {`
- L38: `test('real PDF OCR detecta producto Imagina Ser', () => {`
- L45: `test('real PDF OCR detecta moneda UDI', () => {`
- L54: `test('real PDF OCR detecta edad 38', () => {`
- L63: `test('real PDF OCR detecta escenarios principales', () => {`
- L80: `console.log('\nFORGE REAL PDF OCR REPORT v0.1\n');`
- L92: `console.log('OCR source:', ocrResult.source || 'unknown');`

### `tests/real-retirement-mxn-scenario-test.js`

- SHA-256: `03143b1dbfd76330415891e340f572d01bced941ad5199e0cc70cdf9fd0f6266`
- Classifications: `pdf_processing_signals, read_signals, write_signals`
- Exports: `[]`
- Functions: `[{"name": "mxn", "parameters": ["value"], "form": "function"}, {"name": "udi", "parameters": ["value"], "form": "function"}]`
- Classes: `[]`
- Events: `[]`
- Cache calls: `[]`
- Cache keys: `[]`
- Storage APIs: `[]`
- PDF processing signals: `true`
- Cache writer signals: `false`
- Cache reader signals: `false`

Relevant static lines:

- L1: `import { extraerTextoOCR } from '../policy-operations/evidence/policy-ocr-engine.js';`
- L2: `import { parseSolucionlineRetirementQuote } from '../product-intelligence/evidence/solucionline-retirement-parser.js';`
- L3: `import {`
- L9: `'/storage/emulated/0/Download/Solucionline_20260601_13_09.PDF';`
- L11: `const ocr = await extraerTextoOCR({`
- L17: `text: ocr.extractedText`

### `tests/real-retirement-scenario-test.js`

- SHA-256: `8f17e566d73b850813ce7d42bf793c087d557219de5dae0a4d769863ab5d2331`
- Classifications: `pdf_processing_signals, read_signals, write_signals`
- Exports: `[]`
- Functions: `[]`
- Classes: `[]`
- Events: `[]`
- Cache calls: `[]`
- Cache keys: `[]`
- Storage APIs: `[]`
- PDF processing signals: `true`
- Cache writer signals: `false`
- Cache reader signals: `false`

Relevant static lines:

- L1: `import { extraerTextoOCR } from '../policy-operations/evidence/policy-ocr-engine.js';`
- L2: `import { parseSolucionlineRetirementQuote } from '../product-intelligence/evidence/solucionline-retirement-parser.js';`
- L4: `const PDF_PATH = '/storage/emulated/0/Download/Solucionline_20260601_13_09.PDF';`
- L6: `const ocr = await extraerTextoOCR({ filePath: PDF_PATH });`
- L7: `const report = parseSolucionlineRetirementQuote({ text: ocr.extractedText });`
- L33: `console.log('\n✅ Forge generó el escenario desde PDF real\n');`

## Cache candidate decision

`MISSING_CANONICAL_PDF_CACHE=true`

### Accepted

```json
null
```

### Rejected or insufficient

```json
{
  "insufficient_noncanonical": [
    {
      "path": "product-intelligence/evidence/forge-quote-pdf-preview-engine.js",
      "score": 10,
      "has_writer_signals": false,
      "has_reader_signals": true,
      "cache_keys": [
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": ")) : null,\n    quoteDate: (studyDateLine.match(/d[ií]a\\s+([0-9]{1,2}\\/[0-9]{1,2}\\/[0-9]{2,4})/i) || [])[1] || null,\n    extractionSource: "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "forge_quote_pdf_preview_with_evidenced_udi_growth_rule"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": " ? extractSolucionlineLifeQuoteFields(text) : null;\n  const result = {\n    detectedQuoteDomain,\n    ...(extracted || { extractionSource: "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "forge-quote-pdf-preview-engine.js"
        }
      ],
      "storage_apis": [],
      "cache_calls": [
        {
          "owner": "lines",
          "method": "find"
        }
      ],
      "rejection_reasons": []
    },
    {
      "path": "tests/product-intelligence/forge-quote-pdf-preview-engine-test.js",
      "score": 7,
      "has_writer_signals": false,
      "has_reader_signals": false,
      "cache_keys": [
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "../../product-intelligence/evidence/forge-quote-pdf-preview-engine.js"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "PASS forge quote pdf preview engine test"
        }
      ],
      "storage_apis": [],
      "cache_calls": [],
      "rejection_reasons": []
    }
  ],
  "explicitly_rejected": [
    {
      "path": "platform/adapters/product-intelligence/product-intelligence-read-model-adapter-073d.js",
      "score": 10,
      "has_writer_signals": false,
      "has_reader_signals": true,
      "cache_keys": [
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "Quote PDF preview may consume Product Intelligence; it is not authority."
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "product-intelligence/evidence/forge-quote-pdf-preview-engine.js"
        }
      ],
      "storage_apis": [],
      "cache_calls": [
        {
          "owner": "PRODUCT_RECORDS",
          "method": "find"
        }
      ],
      "rejection_reasons": [
        "belongs_to_exchange_rate_or_banxico_domain"
      ]
    },
    {
      "path": "platform/adapters/quote-preview/quote-preview-pdf-engine-existing-surfaces-canonical-mapping-adapter-077b.js",
      "score": 10,
      "has_writer_signals": false,
      "has_reader_signals": true,
      "cache_keys": [
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "forge.quote_preview.pdf_engine.existing_surfaces.canonical_mapping.adapter.v1"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "forge.quote_preview.pdf_engine.existing_surfaces.canonical_mapping.v1"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "quote_preview_pdf_engine_existing_surfaces_canonical_mapping"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": ",\n});\n\nconst SURFACE_TYPES = Object.freeze({\n  PDF_EXTRACTION: "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": ",\n  PDF_PREVIEW_ORCHESTRATION: "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": ",\n  QUOTE_PREVIEW_BINDING_ADAPTER: "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "QUOTE_PREVIEW_PDF_EXISTING_SURFACE_NOT_MAPPED"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "QUOTE_PREVIEW_PDF_EXISTING_SURFACE_CANONICAL_DECISION_REQUIRED"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "QUOTE_PREVIEW_PDF_NEW_EXTRACTOR_BLOCKED_BEFORE_RECONCILIATION"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "QUOTE_PREVIEW_PDF_NEW_PARSER_BLOCKED_BEFORE_RECONCILIATION"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "QUOTE_PREVIEW_PDF_NEW_CALCULATOR_BLOCKED_BEFORE_RECONCILIATION"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "QUOTE_PREVIEW_PDF_EXISTING_SURFACE_EXECUTION_NOT_AUTHORIZED"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "quote_preview_downstream_only"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "pdf_extraction_policy_ocr_engine"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": ",\n    surface_type: SURFACE_TYPES.PDF_EXTRACTION,\n    domain: "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "candidate canonical local PDF/OCR text extraction source; must not own parsing, calculation, or quote truth"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "],\n    engine_refs: [],\n    product_intelligence_binding_required: true,\n    quote_preview_downstream_only: true,\n    safe_errors: [SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED],\n  }),\n  surface({\n    surface_id: "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "product-intelligence/evidence/forge-quote-pdf-preview-engine.js"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "quote_pdf_preview"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "tests/product-intelligence/forge-quote-pdf-preview-engine-test.js"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "],\n    product_intelligence_binding_required: true,\n    quote_preview_downstream_only: true,\n    safe_errors: [SAFE_ERROR_CODES.CANONICAL_DECISION_REQUIRED, SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED],\n  }),\n  surface({\n    surface_id: "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "],\n    product_intelligence_binding_required: true,\n    quote_preview_downstream_only: true,\n    safe_errors: [SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED],\n  }),\n  surface({\n    surface_id: "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "pdf_extraction_ownership"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "],\n    engine_refs: [],\n    product_intelligence_binding_required: true,\n    quote_preview_downstream_only: false,\n    safe_errors: [SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED],\n  }),\n  surface({\n    surface_id: "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "platform/adapters/quote-preview/quote-preview-product-intelligence-binding-adapter-074b.js"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "quote_preview_product_intelligence_binding"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "current Quote Preview to Product Intelligence binding"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "tests/quote-preview-product-intelligence-binding-adapter-074b-test.js"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "platform/adapters/quote-preview/quote-preview-pdf-product-intelligence-integration-adapter-075b.js"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "quote_preview_pdf_to_product_intelligence_integration"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "current reference integration between PDF preview and Product Intelligence"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "tests/quote-preview-pdf-product-intelligence-integration-adapter-075b-test.js"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "quote_preview_pdf_engine_repo_promotion_adapter_076b"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "platform/adapters/quote-preview/quote-preview-pdf-engine-repo-promotion-adapter-076b.js"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "quote_preview_pdf_engine_repo_promotion"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "tests/quote-preview-pdf-engine-repo-promotion-adapter-076b-test.js"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "],\n    product_intelligence_binding_required: true,\n    quote_preview_downstream_only: true,\n    safe_errors: [SAFE_ERROR_CODES.CANONICAL_DECISION_REQUIRED],\n  }),\n  surface({\n    surface_id: "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "quote_pdf_preview_fixture_test"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "candidate canonical preview fixture test, not real extraction proof"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": ",\n    no_new_extractor_before_reconciliation: true,\n    no_new_parser_before_reconciliation: true,\n    no_new_calculator_before_reconciliation: true,\n    product_intelligence_upstream: true,\n    quote_preview_downstream: true,\n    safe_errors: Object.values(SAFE_ERROR_CODES),\n    required_mapping_fields: [...REQUIRED_MAPPING_FIELDS],\n    blocked_effects: [...BLOCKED_EFFECTS],\n    safety_flags: clone(DEFAULT_SAFETY_FLAGS),\n    surfaces: clone(ALL_SURFACES),\n  };\n}\n\nfunction getExistingSurfaceCanonicalMappingById(surfaceId) {\n  const match = ALL_SURFACES.find((surface) => surface.surface_id === surfaceId);\n  return match ? clone(match) : buildExistingSurfaceCanonicalMappingSafeError(surfaceId);\n}\n\nfunction getExistingSurfaceCanonicalMappingsByProductFamily(productFamily) {\n  const normalized = String(productFamily || "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "],\n    test_refs: [],\n    engine_refs: [],\n    product_intelligence_binding_required: true,\n    quote_preview_downstream_only: true,\n    safe_errors: [code, SAFE_ERROR_CODES.NEW_EXTRACTOR_BLOCKED, SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED],\n    safety_flags: clone(DEFAULT_SAFETY_FLAGS),\n    safe_error: {\n      code,\n      message: "
        }
      ],
      "storage_apis": [],
      "cache_calls": [
        {
          "owner": "ALL_SURFACES",
          "method": "find"
        }
      ],
      "rejection_reasons": [
        "belongs_to_exchange_rate_or_banxico_domain"
      ]
    },
    {
      "path": "platform/adapters/quote-preview/quote-preview-pdf-engine-repo-promotion-adapter-076b.js",
      "score": 10,
      "has_writer_signals": false,
      "has_reader_signals": true,
      "cache_keys": [
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "forge.quote_preview.pdf_engine.repo_promotion.adapter.v1"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "forge.quote_preview.pdf_engine.repo_promotion.v1"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "quote_preview_pdf_engine_repo_promotion"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": ";\n\nconst QUOTE_PREVIEW_PRODUCT_INTELLIGENCE_BINDING_ADAPTER_REF =\n  "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": ";\n\nconst QUOTE_PREVIEW_PDF_PRODUCT_INTELLIGENCE_INTEGRATION_ADAPTER_REF =\n  "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": ";\n\nconst QUOTE_PREVIEW_PDF_ENGINE_REF =\n  "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "QUOTE_PREVIEW_PDF_ENGINE_PROMOTION_NOT_SCOPED"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "QUOTE_PREVIEW_PDF_ENGINE_PRODUCT_INTELLIGENCE_BINDING_REQUIRED"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "QUOTE_PREVIEW_PDF_ENGINE_PRODUCT_FAMILY_NOT_MAPPED"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "QUOTE_PREVIEW_PDF_ENGINE_PARSER_NOT_MAPPED"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "QUOTE_PREVIEW_PDF_ENGINE_CALCULATOR_NOT_MAPPED"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "QUOTE_PREVIEW_PDF_ENGINE_SOURCE_EVIDENCE_REQUIRED"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "QUOTE_PREVIEW_PDF_ENGINE_FRESHNESS_REQUIRED"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "quote_preview_pdf_promotion_id"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "quote_preview_pdf_request_id"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "quote_preview_pdf_engine_ref"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": ");\n\n  return `quote_preview_pdf_engine_promotion_${clean || "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "}_076b`;\n}\n\nfunction getQuotePreviewPdfEnginePromotionManifest() {\n  return {\n    adapter_id: ADAPTER_ID,\n    schemaVersion: SCHEMA_VERSION,\n    domainId: DOMAIN_ID,\n    mode: MODE,\n    routeClass: ROUTE_CLASS,\n    adapter_type: "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": ",\n    product_intelligence_read_model_adapter_ref: PRODUCT_INTELLIGENCE_READ_MODEL_ADAPTER_REF,\n    quote_preview_product_intelligence_binding_adapter_ref: QUOTE_PREVIEW_PRODUCT_INTELLIGENCE_BINDING_ADAPTER_REF,\n    quote_preview_pdf_product_intelligence_integration_adapter_ref:\n      QUOTE_PREVIEW_PDF_PRODUCT_INTELLIGENCE_INTEGRATION_ADAPTER_REF,\n    quote_preview_pdf_engine_ref: QUOTE_PREVIEW_PDF_ENGINE_REF,\n    product_families: Object.keys(PRODUCT_FAMILY_REFERENCE_MAP),\n    safe_errors: Object.values(SAFE_ERROR_CODES),\n    required_promotion_fields: [...REQUIRED_PROMOTION_FIELDS],\n    blocked_effects: [...BLOCKED_EFFECTS],\n    safety_flags: clone(DEFAULT_SAFETY_FLAGS),\n    promotion_constraints: {\n      product_intelligence_binding_required: true,\n      product_intelligence_upstream_semantic_authority: true,\n      quote_preview_pdf_engine_downstream_consumer_reference_only: true,\n      local_static_read_only: true,\n      reference_only: true,\n      executes_pdf_read: false,\n      executes_parser: false,\n      executes_calculator: false,\n      calls_banxico: false,\n      calls_provider: false,\n      writes_quote: false,\n      creates_quote_truth: false,\n    },\n  };\n}\n\nfunction buildQuotePreviewPdfEnginePromotionError(request = {}, code = SAFE_ERROR_CODES.PROMOTION_NOT_SCOPED) {\n  const productFamily = normalizeProductFamily(\n    request.product_family_hint ||\n    request.productFamilyHint ||\n    request.product_family ||\n    request.productFamily\n  );\n\n  return {\n    schemaVersion: SCHEMA_VERSION,\n    domainId: DOMAIN_ID,\n    mode: MODE,\n    routeClass: ROUTE_CLASS,\n    readModelStatus: "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": ",\n    quote_preview_pdf_promotion_id: makeDeterministicId([\n      request.quote_preview_pdf_request_id || request.quotePreviewPdfRequestId || "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": ",\n    ]),\n    quote_preview_pdf_request_id:\n      request.quote_preview_pdf_request_id ||\n      request.quotePreviewPdfRequestId ||\n      request.quote_preview_request_id ||\n      request.quotePreviewRequestId ||\n      null,\n    product_intelligence_binding_ref: QUOTE_PREVIEW_PRODUCT_INTELLIGENCE_BINDING_ADAPTER_REF,\n    product_intelligence_ref: null,\n    product_family: productFamily || null,\n    source_document_ref: request.source_document_ref || request.sourceDocumentRef || null,\n    source_evidence_refs: request.source_evidence_refs || request.sourceEvidenceRefs || [],\n    parser_ref: null,\n    calculator_refs: [],\n    quote_preview_pdf_engine_ref: QUOTE_PREVIEW_PDF_ENGINE_REF,\n    evidence_requirements: {\n      source_document_ref_required: true,\n      source_evidence_refs_required: true,\n      parser_evidence_required: true,\n    },\n    freshness_requirements: {\n      freshness_metadata_required: true,\n      status: "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "Quote Preview PDF Engine promotion is not available without Product Intelligence-bound references."
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "quote_preview_pdf_engine_repo_promotion_safe_error"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": ",\n    },\n  };\n}\n\nfunction prepareQuotePreviewPdfEnginePromotionScope(request = {}) {\n  const productFamily = normalizeProductFamily(\n    request.product_family_hint ||\n    request.productFamilyHint ||\n    request.product_family ||\n    request.productFamily\n  );\n\n  if (!productFamily) {\n    return buildQuotePreviewPdfEnginePromotionError(\n      request,\n      SAFE_ERROR_CODES.PRODUCT_INTELLIGENCE_BINDING_REQUIRED\n    );\n  }\n\n  const familyRef = PRODUCT_FAMILY_REFERENCE_MAP[productFamily];\n\n  if (!familyRef) {\n    return buildQuotePreviewPdfEnginePromotionError(\n      request,\n      SAFE_ERROR_CODES.PRODUCT_FAMILY_NOT_MAPPED\n    );\n  }\n\n  const sourceEvidenceRefs = request.source_evidence_refs || request.sourceEvidenceRefs || [];\n\n  return {\n    schemaVersion: SCHEMA_VERSION,\n    domainId: DOMAIN_ID,\n    mode: MODE,\n    routeClass: ROUTE_CLASS,\n    readModelStatus: "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": ",\n    quote_preview_pdf_promotion_id: makeDeterministicId([\n      request.quote_preview_pdf_request_id || request.quotePreviewPdfRequestId || request.quote_preview_request_id || request.quotePreviewRequestId || "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": ",\n      productFamily,\n    ]),\n    quote_preview_pdf_request_id:\n      request.quote_preview_pdf_request_id ||\n      request.quotePreviewPdfRequestId ||\n      request.quote_preview_request_id ||\n      request.quotePreviewRequestId ||\n      null,\n    product_intelligence_binding_ref: {\n      binding_adapter_ref: QUOTE_PREVIEW_PRODUCT_INTELLIGENCE_BINDING_ADAPTER_REF,\n      integration_adapter_ref: QUOTE_PREVIEW_PDF_PRODUCT_INTELLIGENCE_INTEGRATION_ADAPTER_REF,\n      required: true,\n    },\n    product_intelligence_ref: familyRef.product_intelligence_ref,\n    product_family: productFamily,\n    source_document_ref: request.source_document_ref || request.sourceDocumentRef || null,\n    source_evidence_refs: Array.isArray(sourceEvidenceRefs) ? [...sourceEvidenceRefs] : [sourceEvidenceRefs],\n    parser_ref: familyRef.parser_ref,\n    calculator_refs: [...familyRef.calculator_refs],\n    quote_preview_pdf_engine_ref: QUOTE_PREVIEW_PDF_ENGINE_REF,\n    evidence_requirements: {\n      source_document_ref_required: true,\n      source_evidence_refs_required: true,\n      parser_evidence_required: true,\n      evidence_ids_present: Array.isArray(sourceEvidenceRefs) && sourceEvidenceRefs.length > 0,\n    },\n    freshness_requirements: {\n      freshness_metadata_required: true,\n      status: "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": ",\n      preview_static_allowed: true,\n    },\n    preview_constraints: {\n      product_intelligence_binding_required: true,\n      product_intelligence_upstream_semantic_authority: true,\n      quote_preview_pdf_engine_downstream_consumer_reference_only: true,\n      product_notes: [...familyRef.product_notes],\n      universal_architecture: familyRef.universal_architecture,\n      reference_only: true,\n      no_pdf_read: true,\n      no_parser_execution: true,\n      no_calculator_execution: true,\n      no_banxico_call: true,\n      no_provider_call: true,\n      no_quote_write: true,\n      no_quote_truth: true,\n    },\n    blocked_effects: [...BLOCKED_EFFECTS],\n    safety_flags: clone(DEFAULT_SAFETY_FLAGS),\n    safe_error: null,\n    audit_event: {\n      event_type: "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": ",\n    },\n  };\n}\n\nfunction validateQuotePreviewPdfEnginePromotionShape(promotion) {\n  const errors = [];\n\n  if (!promotion || typeof promotion !== "
        }
      ],
      "storage_apis": [],
      "cache_calls": [
        {
          "owner": "aliases",
          "method": "get"
        }
      ],
      "rejection_reasons": [
        "belongs_to_exchange_rate_or_banxico_domain"
      ]
    },
    {
      "path": "cache-runtime.js",
      "score": 8,
      "has_writer_signals": true,
      "has_reader_signals": true,
      "cache_keys": [],
      "storage_apis": [],
      "cache_calls": [
        {
          "owner": "this.cache",
          "method": "delete"
        },
        {
          "owner": "this.cache",
          "method": "get"
        },
        {
          "owner": "this.cache",
          "method": "set"
        }
      ],
      "rejection_reasons": [
        "no_direct_quote_preview_or_pdf_relevance"
      ]
    },
    {
      "path": "base-repository.js",
      "score": 7,
      "has_writer_signals": true,
      "has_reader_signals": true,
      "cache_keys": [],
      "storage_apis": [],
      "cache_calls": [
        {
          "owner": "this.cache",
          "method": "delete"
        },
        {
          "owner": "this.cache",
          "method": "get"
        },
        {
          "owner": "this.cache",
          "method": "set"
        }
      ],
      "rejection_reasons": [
        "no_direct_quote_preview_or_pdf_relevance"
      ]
    },
    {
      "path": "platform/adapters/quote-preview/quote-preview-pdf-product-intelligence-integration-adapter-075b.js",
      "score": 7,
      "has_writer_signals": false,
      "has_reader_signals": false,
      "cache_keys": [
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "./quote-preview-product-intelligence-binding-adapter-074b.js"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "forge.quote_preview.pdf_engine_product_intelligence.integration.adapter.v1"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "forge.quote_preview.pdf_engine_product_intelligence.integration.v1"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "quote_preview_pdf_engine_product_intelligence_integration"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": ";\n\nconst QUOTE_PREVIEW_PDF_ENGINE_REF = "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "platform/adapters/quote-preview/quote-preview-product-intelligence-binding-adapter-074b.js"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "QUOTE_PREVIEW_PDF_PRODUCT_INTELLIGENCE_NOT_INTEGRATED"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "QUOTE_PREVIEW_PDF_PRODUCT_FAMILY_NOT_MAPPED"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "QUOTE_PREVIEW_PDF_BINDING_REQUIRED"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "QUOTE_PREVIEW_PDF_SOURCE_EVIDENCE_REQUIRED"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "QUOTE_PREVIEW_PDF_FRESHNESS_REQUIRED"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "QUOTE_PREVIEW_PDF_ENGINE_NOT_MAPPED"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "quote_preview_pdf_integration_id"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "quote_preview_request_id"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "quote_preview_pdf_engine_ref"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "quote_preview_pdf_engine_role"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "quote_preview_binding_ref"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": ") return candidate;\n  return candidate.code || candidate.errorCode || candidate.safe_error_code || null;\n}\n\nfunction buildQuotePreviewPdfIntegrationError(code, request = {}, message = "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": ",\n    quote_preview_pdf_integration_id: `quote_preview_pdf_pi_integration_error_${slug(code)}_${slug(getField(request, ["
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "quotePreviewRequestId"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": ")}`,\n    quote_preview_request_id: getField(request, ["
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "]) || null,\n    quote_preview_pdf_engine_ref: QUOTE_PREVIEW_PDF_ENGINE_REF,\n    quote_preview_pdf_engine_role: "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": ",\n    quote_preview_binding_ref: BINDING_ADAPTER_REF,\n    product_intelligence_ref: null,\n    product_family: getField(request, ["
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "Quote Preview PDF Engine is not integrated with Product Intelligence for this request."
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "quote_preview_pdf_product_intelligence_integration_error"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "075B_QUOTE_PREVIEW_PDF_ENGINE_PRODUCT_INTELLIGENCE_INTEGRATION_IMPLEMENTATION"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "]);\n  if (Array.isArray(refs)) return refs.filter(Boolean).map(String);\n  if (refs) return [String(refs)];\n  return [];\n}\n\nfunction integrateQuotePreviewPdfEngineWithProductIntelligence(request = {}) {\n  const quotePreviewRequestId = getField(request, ["
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "]) || `quote_preview_request_${slug(getField(request, ["
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": ")}`;\n\n  if (!hasSourceEvidence(request)) {\n    return buildQuotePreviewPdfIntegrationError(\n      SAFE_ERROR_CODES.SOURCE_EVIDENCE_REQUIRED,\n      { ...request, quote_preview_request_id: quotePreviewRequestId },\n      "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "\n    );\n  }\n\n  if (!bindingAdapter || typeof bindingAdapter.bindQuotePreviewToProductIntelligence !== "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": ") {\n    return buildQuotePreviewPdfIntegrationError(\n      SAFE_ERROR_CODES.BINDING_REQUIRED,\n      { ...request, quote_preview_request_id: quotePreviewRequestId },\n      "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "\n    );\n  }\n\n  const bindingRequest = {\n    quote_preview_request_id: quotePreviewRequestId,\n    product_family_hint: getField(request, ["
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "pdf_preview_reference_only"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "QUOTE_PREVIEW_PRODUCT_FAMILY_NOT_MAPPED"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": ") {\n    const validation = bindingAdapter.validateQuotePreviewBindingShape(binding);\n    if (!validationOk(validation)) {\n      return buildQuotePreviewPdfIntegrationError(\n        SAFE_ERROR_CODES.BINDING_REQUIRED,\n        bindingRequest,\n        "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "]);\n  if (!productFamily) {\n    return buildQuotePreviewPdfIntegrationError(\n      SAFE_ERROR_CODES.PRODUCT_FAMILY_NOT_MAPPED,\n      bindingRequest,\n      "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": ",\n    quote_preview_pdf_integration_id: `quote_preview_pdf_pi_integration_${slug(productFamily)}_${slug(quotePreviewRequestId)}`,\n    quote_preview_request_id: quotePreviewRequestId,\n    quote_preview_pdf_engine_ref: QUOTE_PREVIEW_PDF_ENGINE_REF,\n    quote_preview_pdf_engine_role: "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": ",\n    quote_preview_binding_ref: BINDING_ADAPTER_REF,\n    quote_preview_binding_id: getField(binding, ["
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "quotePreviewBindingId"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": ",\n      pdf_engine_ref: QUOTE_PREVIEW_PDF_ENGINE_REF,\n      parser_ref: parserRef || null,\n      calculator_refs: calculatorRefs,\n      product_intelligence_first: true,\n      pdf_read_allowed: false,\n      parser_execution_allowed: false,\n      calculator_execution_allowed: false,\n      banxico_call_allowed: false,\n      provider_call_allowed: false,\n      real_engine_execution_allowed: false,\n      note: "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "quote_preview_pdf_product_intelligence_integration_used"
        }
      ],
      "storage_apis": [],
      "cache_calls": [],
      "rejection_reasons": [
        "belongs_to_exchange_rate_or_banxico_domain"
      ]
    },
    {
      "path": "platform/adapters/quote-preview/quote-preview-product-intelligence-binding-adapter-074b.js",
      "score": 7,
      "has_writer_signals": false,
      "has_reader_signals": false,
      "cache_keys": [
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "forge.quote_preview.product_intelligence.binding.adapter.v1"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "forge.quote_preview.product_intelligence.binding.v1"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "QUOTE_PREVIEW_PRODUCT_INTELLIGENCE_NOT_BOUND"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "QUOTE_PREVIEW_PRODUCT_FAMILY_NOT_MAPPED"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "QUOTE_PREVIEW_PARSER_NOT_MAPPED"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "QUOTE_PREVIEW_CALCULATOR_NOT_MAPPED"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "QUOTE_PREVIEW_SOURCE_EVIDENCE_REQUIRED"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "QUOTE_PREVIEW_FRESHNESS_REQUIRED"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "quote_preview_binding_id"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "quote_preview_request_id"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": ",\n    errorCode: SAFE_ERROR_CODES.notBound\n  };\n}\n\nfunction firstRef(refs = []) {\n  return refs[0] || null;\n}\n\nfunction buildSafeError(record, errorCode) {\n  if (errorCode) return errorCode;\n  if (!record) return SAFE_ERROR_CODES.notBound;\n  if (!record.parser_refs?.length) return SAFE_ERROR_CODES.parserNotMapped;\n  if (!record.calculator_refs?.length) return SAFE_ERROR_CODES.calculatorNotMapped;\n  if (!record.evidence_refs?.length) return SAFE_ERROR_CODES.sourceEvidenceRequired;\n  if (!record.freshness_metadata?.status) return SAFE_ERROR_CODES.freshnessRequired;\n  return null;\n}\n\nfunction buildBindingFromRecord(request, record, resolution, errorCode = null) {\n  const requestId = request.quote_preview_request_id || "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "quote_preview"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "\n    },\n    quote_preview_binding_id: `quote_preview_product_intelligence_binding_${makeStableId(bindingKey)}_074b`,\n    quote_preview_request_id: requestId,\n    product_intelligence_ref: record ? {\n      product_intelligence_id: record.product_intelligence_id,\n      schemaVersion: record.schemaVersion,\n      mode: record.mode,\n      routeClass: record.routeClass,\n      imported: false,\n      executed: false\n    } : null,\n    product_family: productFamily,\n    parser_ref: record ? firstRef(record.parser_refs) : null,\n    calculator_refs: record ? clone(record.calculator_refs) : [],\n    coverage_semantics_ref: record ? {\n      status: record.coverage_semantics.status,\n      mapped_refs: clone(record.coverage_semantics.mapped_refs || []),\n      truth_claimed: false\n    } : null,\n    premium_semantics_ref: record ? {\n      status: record.premium_semantics.status,\n      mapped_refs: clone(record.premium_semantics.mapped_refs || []),\n      truth_claimed: false\n    } : null,\n    currency_semantics_ref: record ? {\n      status: record.currency_semantics.status,\n      mapped_refs: clone(record.currency_semantics.mapped_refs || []),\n      truth_claimed: false\n    } : null,\n    projection_semantics_ref: record ? {\n      status: record.projection_semantics.status,\n      mapped_refs: clone(record.projection_semantics.mapped_refs || []),\n      truth_claimed: false\n    } : null,\n    evidence_requirements: {\n      required: true,\n      source_evidence_refs: Array.isArray(request.source_evidence_refs) ? clone(request.source_evidence_refs) : [],\n      product_intelligence_evidence_refs: record ? clone(record.evidence_refs) : []\n    },\n    freshness_requirements: {\n      required: true,\n      product_intelligence_freshness: record ? clone(record.freshness_metadata) : null\n    },\n    resolution,\n    blocked_effects: record\n      ? Array.from(new Set([...DEFAULT_BLOCKED_EFFECTS, ...(record.blocked_effects || [])]))\n      : clone(DEFAULT_BLOCKED_EFFECTS),\n    safety_flags: clone(DEFAULT_SAFETY_FLAGS),\n    execution_markers: {\n      parserExecution: false,\n      calculatorExecution: false,\n      banxicoCall: false,\n      pdfRead: false,\n      realEngineExecution: false\n    },\n    quote_pdf_preview_role: record?.quote_semantics?.quote_pdf_preview_role || "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "\n      ? record?.product_identity?.universal_architecture === true\n      : false,\n    safe_error: safeError\n  };\n}\n\nexport function bindQuotePreviewToProductIntelligence(request = {}) {\n  const { record, resolution, errorCode } = resolveProductIntelligenceRecord(request);\n  return buildBindingFromRecord(request, record, resolution, errorCode);\n}\n\nexport function buildQuotePreviewBindingNotBoundError(request = {}) {\n  return buildBindingFromRecord(request, null, "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": ", SAFE_ERROR_CODES.notBound);\n}\n\nexport function validateQuotePreviewBindingShape(binding) {\n  const errors = [];\n\n  if (!binding || typeof binding !== "
        }
      ],
      "storage_apis": [],
      "cache_calls": [],
      "rejection_reasons": [
        "belongs_to_exchange_rate_or_banxico_domain"
      ]
    },
    {
      "path": "tests/quote-preview-pdf-engine-repo-promotion-adapter-076b-test.js",
      "score": 7,
      "has_writer_signals": false,
      "has_reader_signals": false,
      "cache_keys": [
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "../platform/adapters/quote-preview/quote-preview-pdf-engine-repo-promotion-adapter-076b.js"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "forge.quote_preview.pdf_engine.repo_promotion.adapter.v1"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "forge.quote_preview.pdf_engine.repo_promotion.v1"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": ");\nassert.equal(typeof adapter.prepareQuotePreviewPdfEnginePromotionScope, "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": ");\nassert.equal(typeof adapter.buildQuotePreviewPdfEnginePromotionError, "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": ");\nassert.equal(typeof adapter.validateQuotePreviewPdfEnginePromotionShape, "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": ");\n\nconst manifest = adapter.getQuotePreviewPdfEnginePromotionManifest();\n\nassert.equal(manifest.schemaVersion, adapter.SCHEMA_VERSION);\nassert.equal(manifest.domainId, "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": ");\nassert.equal(manifest.promotion_constraints.product_intelligence_binding_required, true);\nassert.equal(manifest.promotion_constraints.product_intelligence_upstream_semantic_authority, true);\nassert.equal(manifest.promotion_constraints.quote_preview_pdf_engine_downstream_consumer_reference_only, true);\nassert.equal(manifest.promotion_constraints.executes_pdf_read, false);\nassert.equal(manifest.promotion_constraints.executes_parser, false);\nassert.equal(manifest.promotion_constraints.executes_calculator, false);\nassert.equal(manifest.promotion_constraints.calls_banxico, false);\nassert.equal(manifest.promotion_constraints.writes_quote, false);\nassert.equal(manifest.promotion_constraints.creates_quote_truth, false);\n\nconst gmm = adapter.prepareQuotePreviewPdfEnginePromotionScope({\n  quote_preview_pdf_request_id: "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": ");\nassert.equal(gmm.product_intelligence_binding_ref.required, true);\nassert.equal(gmm.preview_constraints.product_intelligence_binding_required, true);\nassert.equal(gmm.preview_constraints.reference_only, true);\nassert.equal(gmm.preview_constraints.no_pdf_read, true);\nassert.equal(gmm.preview_constraints.no_parser_execution, true);\nassert.equal(gmm.preview_constraints.no_calculator_execution, true);\nassert.equal(gmm.preview_constraints.no_banxico_call, true);\nassert.equal(gmm.preview_constraints.no_quote_truth, true);\nassert.equal(gmm.safe_error, null);\nassert.equal(adapter.validateQuotePreviewPdfEnginePromotionShape(gmm).ok, true);\n\nconst imagina = adapter.prepareQuotePreviewPdfEnginePromotionScope({\n  quote_preview_pdf_request_id: "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": ");\nassert.equal(imagina.preview_constraints.universal_architecture, false);\nassert(imagina.preview_constraints.product_notes.includes("
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "));\nassert.equal(adapter.validateQuotePreviewPdfEnginePromotionShape(imagina).ok, true);\n\nconst missing = adapter.prepareQuotePreviewPdfEnginePromotionScope({\n  quote_preview_pdf_request_id: "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": ");\nassert.equal(missing.safe_error.code, adapter.SAFE_ERROR_CODES.PRODUCT_FAMILY_NOT_MAPPED);\nassert.equal(adapter.validateQuotePreviewPdfEnginePromotionShape(missing).ok, true);\n\nfor (const family of ["
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "]) {\n  const output = adapter.prepareQuotePreviewPdfEnginePromotionScope({\n    quote_preview_pdf_request_id: `qa_076b_${family}`,\n    product_family_hint: family,\n    source_document_ref: "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": ", `${family} should be mapped`);\n  assert.equal(adapter.validateQuotePreviewPdfEnginePromotionShape(output).ok, true);\n}\n\nfor (const [key, value] of Object.entries(adapter.DEFAULT_SAFETY_FLAGS)) {\n  assert.equal(value, false, `DEFAULT_SAFETY_FLAGS.${key} must be false`);\n}\n\nconst combined = JSON.stringify({ manifest, gmm, imagina, missing, flags: adapter.DEFAULT_SAFETY_FLAGS });\nconst forbiddenFragments = [\n  "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "quote-preview-product-intelligence-binding-adapter-074b.js"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "quote-preview-pdf-product-intelligence-integration-adapter-075b.js"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "forge-quote-pdf-preview-engine.js"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "PASS quote preview pdf engine repo promotion adapter 076B"
        }
      ],
      "storage_apis": [],
      "cache_calls": [],
      "rejection_reasons": [
        "belongs_to_exchange_rate_or_banxico_domain"
      ]
    },
    {
      "path": "tests/quote-preview-pdf-product-intelligence-integration-adapter-075b-test.js",
      "score": 7,
      "has_writer_signals": false,
      "has_reader_signals": false,
      "cache_keys": [
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "../platform/adapters/quote-preview/quote-preview-pdf-product-intelligence-integration-adapter-075b.js"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "forge.quote_preview.pdf_engine_product_intelligence.integration.adapter.v1"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "forge.quote_preview.pdf_engine_product_intelligence.integration.v1"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "quote_preview_pdf_engine_product_intelligence_integration"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": ");\n\nassert.equal(typeof adapter.integrateQuotePreviewPdfEngineWithProductIntelligence, "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": ");\nassert.equal(typeof adapter.buildQuotePreviewPdfIntegrationError, "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": ");\nassert.equal(typeof adapter.validateQuotePreviewPdfProductIntelligenceIntegrationShape, "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": ");\n\nconst gmm = adapter.integrateQuotePreviewPdfEngineWithProductIntelligence({\n  quote_preview_request_id: "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": ");\nassert.equal(gmm.quote_preview_pdf_engine_role, "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": ");\nassert.equal(gmm.extraction_plan.product_intelligence_first, true);\nassert.equal(gmm.extraction_plan.pdf_read_allowed, false);\nassert.equal(gmm.extraction_plan.parser_execution_allowed, false);\nassert.equal(gmm.extraction_plan.calculator_execution_allowed, false);\nassert.equal(gmm.extraction_plan.banxico_call_allowed, false);\nassert.equal(gmm.extraction_plan.real_engine_execution_allowed, false);\nassert.equal(shapeOk(gmm), true);\n\nconst imagina = adapter.integrateQuotePreviewPdfEngineWithProductIntelligence({\n  quote_preview_request_id: "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": ");\nassert.equal(imagina.quote_preview_pdf_engine_role, "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": ");\nassert.equal(shapeOk(imagina), true);\n\nconst missingFamily = adapter.integrateQuotePreviewPdfEngineWithProductIntelligence({\n  quote_preview_request_id: "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": ");\nassert(\n  [\n    adapter.SAFE_ERROR_CODES.NOT_INTEGRATED,\n    adapter.SAFE_ERROR_CODES.PRODUCT_FAMILY_NOT_MAPPED\n  ].includes(missingFamily.safe_error.code)\n);\n\nconst missingEvidence = adapter.integrateQuotePreviewPdfEngineWithProductIntelligence({\n  quote_preview_request_id: "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "PASS quote preview pdf product intelligence integration adapter 075B"
        }
      ],
      "storage_apis": [],
      "cache_calls": [],
      "rejection_reasons": [
        "belongs_to_exchange_rate_or_banxico_domain"
      ]
    },
    {
      "path": "tests/quote-preview-product-intelligence-binding-adapter-074b-test.js",
      "score": 7,
      "has_writer_signals": false,
      "has_reader_signals": false,
      "cache_keys": [
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": ";\nimport {\n  DEFAULT_SAFETY_FLAGS,\n  SAFE_ERROR_CODES,\n  SCHEMA_VERSION,\n  bindQuotePreviewToProductIntelligence,\n  buildQuotePreviewBindingNotBoundError,\n  validateQuotePreviewBindingShape\n} from "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "));\n}\n\nconst gmmBinding = bindQuotePreviewToProductIntelligence({\n  quote_preview_request_id: "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "quote_preview"
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": "));\nassert.equal(gmmBinding.quote_pdf_preview_role, "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": ");\nassertNoExecution(gmmBinding);\nassert.equal(validateQuotePreviewBindingShape(gmmBinding).valid, true);\n\nconst imaginaBinding = bindQuotePreviewToProductIntelligence({\n  quote_preview_request_id: "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": ");\nassert.equal(imaginaBinding.imagina_ser_universal_architecture, false);\nassert.equal(imaginaBinding.quote_pdf_preview_role, "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": ");\nassertNoExecution(imaginaBinding);\nassert.equal(validateQuotePreviewBindingShape(imaginaBinding).valid, true);\n\nconst byProductRef = bindQuotePreviewToProductIntelligence({\n  quote_preview_request_id: "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": ");\nassert.equal(byProductRef.safe_error, null);\nassertNoExecution(byProductRef);\n\nconst missing = bindQuotePreviewToProductIntelligence({\n  quote_preview_request_id: "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": ");\nassertNoExecution(missing);\nassert.equal(validateQuotePreviewBindingShape(missing).valid, true);\n\nconst notBound = buildQuotePreviewBindingNotBoundError({\n  quote_preview_request_id: "
        },
        {
          "source": "quote_pdf_string_literal",
          "name": "",
          "value": ");\nassertNoExecution(notBound);\nassert.equal(validateQuotePreviewBindingShape(notBound).valid, true);\n\nconsole.log("
        }
      ],
      "storage_apis": [],
      "cache_calls": [],
      "rejection_reasons": [
        "belongs_to_exchange_rate_or_banxico_domain"
      ]
    },
    {
      "path": "runtime.js",
      "score": 6,
      "has_writer_signals": true,
      "has_reader_signals": true,
      "cache_keys": [],
      "storage_apis": [],
      "cache_calls": [
        {
          "owner": "this.cleanupTasks",
          "method": "delete"
        },
        {
          "owner": "this.routeCache",
          "method": "get"
        },
        {
          "owner": "this.routeCache",
          "method": "set"
        }
      ],
      "rejection_reasons": [
        "no_direct_quote_preview_or_pdf_relevance"
      ]
    }
  ]
}
```

## HOLD reasons

- canonical PDF/Quote Preview cache was not proven

## Safety receipt

```text
NEW_ENGINE_CREATED=false
NEW_CACHE_CREATED=false
DUPLICATE_BRIDGE_CREATED=false
PDF_READ_EXECUTED=false
PARSER_EXECUTED=false
OCR_EXECUTED=false
SOURCE_UI_CHANGED=false
QUOTE_TRUTH_ALLOWED=false
REAL_ENGINE_EXECUTION=false
BACKEND_CONNECTION=false
TEST_EXECUTION=false
```
