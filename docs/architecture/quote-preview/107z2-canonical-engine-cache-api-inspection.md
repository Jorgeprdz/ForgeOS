# 107Z2 — Quote Preview canonical engine and cache API inspection

Status: **HOLD**

## Constitutional decision

This phase performs static inspection only. It does not execute a PDF,
parser, OCR engine, browser runtime, backend write or Quote Preview write.

No new engine, cache, bridge, adapter or parser was created.

## Canonical contract map

### CANONICAL_PDF_ENGINE_PATH

```text
product-intelligence/evidence/forge-quote-pdf-preview-engine.js
```

### CANONICAL_PDF_ENGINE_EXPORTS

```text
["buildCalculation", "buildForgeQuoteExcelTables", "detectQuoteDomain", "extractSolucionlineLifeQuoteFields", "summarizeForgeQuotePdfText"]
```

### CANONICAL_PDF_ENGINE_INPUT_CONTRACT

```text
[{"export_or_function": "buildCalculation", "parameters": ["result", "options = {}"]}, {"export_or_function": "buildForgeQuoteExcelTables", "parameters": ["summary"]}, {"export_or_function": "cleanValue", "parameters": ["value"]}, {"export_or_function": "detectQuoteDomain", "parameters": ["text"]}, {"export_or_function": "extractSolucionlineLifeQuoteFields", "parameters": ["text"]}, {"export_or_function": "findLine", "parameters": ["pattern"]}, {"export_or_function": "formatUdi", "parameters": ["value"]}, {"export_or_function": "mxn", "parameters": ["valueUdi"]}, {"export_or_function": "normalizeText", "parameters": ["text"]}, {"export_or_function": "numberFrom", "parameters": ["value"]}, {"export_or_function": "parseNumberList", "parameters": ["value"]}, {"export_or_function": "projectedMxn", "parameters": ["valueUdi"]}, {"export_or_function": "roundMoney", "parameters": ["value"]}, {"export_or_function": "scenario", "parameters": ["offset"]}, {"export_or_function": "scenarioMxn", "parameters": ["scenario", "projected"]}, {"export_or_function": "summarizeForgeQuotePdfText", "parameters": ["input = {}"]}, {"export_or_function": "yearsFrom", "parameters": ["value"]}]
```

### CANONICAL_PDF_ENGINE_OUTPUT_CONTRACT

```text
{"status": "STATIC_INFERENCE_ONLY", "evidence": [{"line": 224, "text": "sourceModule: 'forge-quote-pdf-preview-engine.js',"}]}
```

### CANONICAL_PRODUCT_ROUTING

```text
["imagina-ser-banxico-integration-test.js", "imagina-ser-master-test.js", "platform/adapters/product-intelligence/product-intelligence-read-model-adapter-073d.js", "platform/adapters/quote-preview/quote-preview-pdf-engine-existing-surfaces-canonical-mapping-adapter-077b.js", "platform/adapters/quote-preview/quote-preview-pdf-engine-repo-promotion-adapter-076b.js", "platform/adapters/quote-preview/quote-preview-pdf-product-intelligence-integration-adapter-075b.js", "platform/adapters/quote-preview/quote-preview-product-intelligence-binding-adapter-074b.js", "product-intelligence/evidence/gmm-quote-parser.js", "product-intelligence/evidence/solucionline-retirement-parser.js", "tests/gmm-out-of-pocket-test.js", "tests/real-gmm-quote-test.js", "tests/real-retirement-mxn-scenario-test.js", "tests/real-retirement-scenario-test.js"]
```

### CANONICAL_CACHE_PATH

```text

```

### CANONICAL_CACHE_KEY

```text
[]
```

### CANONICAL_CACHE_WRITER_FUNCTION

```text
[]
```

### CANONICAL_CACHE_READER_FUNCTION

```text
[]
```

### CANONICAL_CACHE_SCHEMA

```text
[]
```

### CANONICAL_CACHE_EVENT

```text
[]
```

### CANONICAL_QUOTE_PREVIEW_UI_PATH

```text
docs/static-preview/forge-alive/index.html
```

### CANONICAL_CONFIRMATION_MODAL_PATH

```text
docs/static-preview/forge-alive/assets/forge-quote-preview-confirmation-modal-107q.js
```

### CANONICAL_EXISTING_BRIDGE_PATH

```text

```

## Cache decision

- `MISSING_CANONICAL_PDF_CACHE=true`
- Accepted candidate: `NONE`

A cache candidate is accepted only when static evidence demonstrates:

1. direct Quote Preview or PDF relevance;
2. an explicit cache key;
3. writer signals;
4. reader signals;
5. no ownership by Banxico/exchange-rate;
6. no ownership by Revenue or CRM.

## Boundary distinctions

- `075b`, `076b` and `077b` remain adapters or governance/reference surfaces
  unless their source proves executable ownership.
- Product-specific OCR extractors are not automatically the global Quote
  Preview engine.
- Exchange-rate cache modules are excluded from the PDF cache decision.
- Revenue and CRM adapters are excluded from the Quote Preview PDF bridge.
- The confirmation modal is not treated as the complete Quote Preview UI.

## Result

The canonical contract is incomplete. No integration implementation
is authorized.

### HOLD reasons

- canonical PDF/Quote Preview cache was not proven

## Next authorized step

Design the smallest possible reuse-only integration:

```text
existing extractor/engine
→ existing cache writer
→ existing cache
→ confirmation modal
→ Quote Preview UI
```

Implementation remains blocked until the canonical cache contract is
fully proven.
