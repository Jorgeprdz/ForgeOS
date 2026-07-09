# Forge Quote Preview New Quote Page Source Patch Scope Evidence 105C

PHASE=105C_QUOTE_PREVIEW_NEW_QUOTE_PAGE_SOURCE_PATCH_SCOPE
STATUS=PASS
DECISION=PASS_105C_QUOTE_PREVIEW_NEW_QUOTE_PAGE_SOURCE_PATCH_SCOPE
LOCKED_DECISION=NEW_QUOTE_PAGE_SOURCE_PATCH_SCOPE_READY_FOR_IMPLEMENTATION
NEXT=105D_QUOTE_PREVIEW_NEW_QUOTE_PAGE_SOURCE_PATCH_IMPLEMENTATION

## Basis

105C defines the source patch boundary for implementing #nueva-cotizacion later in 105D.

## Scope JSON

{
  "sourceFile": "docs/static-preview/forge-alive/index.html",
  "sourceModifiedIn105C": false,
  "currentMarkers": {
    "cotizacionesIdCount": 1,
    "cotizacionesHrefCount": 1,
    "newQuoteHashHrefCount": 0,
    "newQuoteIdCount": 0,
    "newQuoteCtaTextCount": 1,
    "dwStaticNewQuoteCtaClassPresent": true,
    "dwPanelHeaderClassPresent": true,
    "dwMainClassPresent": true
  },
  "authorizedPatchBoundaryFor105D": {
    "mayModify": [
      "docs/static-preview/forge-alive/index.html"
    ],
    "mayNotModifyWithoutNewScope": [
      "runtime provider files",
      "backend files",
      "CRM files",
      "calculator engines",
      "parser engines",
      "PDF engines",
      "OCR engines",
      "Banxico engines",
      "authentication files"
    ],
    "sourcePatchType": "static_html_css_local_hash_navigation_only",
    "realEffectsAllowed": false
  },
  "authorizedSourceOperationsFor105D": [
    {
      "operation": "add_new_embedded_view",
      "target": "docs/static-preview/forge-alive/index.html",
      "requiredId": "nueva-cotizacion",
      "requiredClass": "dw-new-quote-view-056y",
      "placementPreference": "near or after the existing Cotizaciones panel inside the main Forge Alive stage",
      "contentBoundary": "placeholder-safe preview-only copy"
    },
    {
      "operation": "scope_local_navigation_cta",
      "target": "existing + Nueva cotización CTA",
      "allowedTransformation": "convert or wrap into local anchor href #nueva-cotizacion only if visual parity is preserved",
      "requiredAttributes": [
        "href=\"#nueva-cotizacion\"",
        "data-forge-local-navigation-only=\"true\"",
        "data-forge-real-effects-allowed=\"false\""
      ],
      "blockedAttributes": [
        "onclick",
        "onmousedown",
        "javascript:",
        "data-provider-runtime",
        "data-backend-connection",
        "data-crm-write"
      ]
    },
    {
      "operation": "add_backlink",
      "target": "new quote view header",
      "requiredHref": "#cotizaciones",
      "copy": "Volver a Cotizaciones"
    },
    {
      "operation": "add_static_css",
      "target": "existing style area in index.html",
      "allowedClasses": [
        "dw-new-quote-view-056y",
        "dw-new-quote-shell-056y",
        "dw-new-quote-hero-056y",
        "dw-new-quote-intake-grid-056y",
        "dw-new-quote-section-card-056y",
        "dw-new-quote-readiness-card-056y",
        "dw-new-quote-safe-action-panel-056y",
        "dw-new-quote-backlink-056y",
        "dw-new-quote-checklist-056y"
      ],
      "styleBoundary": "reuse Forge tokens and existing patterns first; no inline style hacks"
    }
  ],
  "requiredContentFor105D": {
    "title": "Nuevo borrador de cotización",
    "subtitle": "Prepara contexto para un preview. No genera cotización oficial.",
    "badges": [
      "Preview",
      "Requiere revisión humana",
      "Sin efectos reales"
    ],
    "safeNote": "Forge organiza la preparación y señala faltantes. La revisión humana sigue siendo obligatoria.",
    "disabledPrimaryAction": "Preparar preview",
    "blockedStateCopy": "Faltan datos mínimos. No se ejecutan cálculos, proveedores ni escrituras."
  },
  "prohibitedContentFor105D": [
    "premium values",
    "coverage values",
    "projection values",
    "UDI values",
    "rate values",
    "specific product candidates without trusted source",
    "specific client data",
    "age",
    "gender",
    "official quote",
    "verified rule pack",
    "100 percent verified",
    "provider response",
    "calculator result",
    "CRM write confirmation"
  ],
  "requiredValidationFor105D": [
    "id nueva-cotizacion exists exactly once",
    "href #nueva-cotizacion exists at least once",
    "href #cotizaciones remains present",
    "+ Nueva cotización remains visible exactly once",
    "new view includes Preview badge",
    "new view includes Requiere revisión humana badge",
    "new view includes Sin efectos reales badge",
    "Preparar preview is disabled or visibly locked",
    "no real-effect flags are true",
    "no source outside authorized boundary is modified",
    "git diff --check passes"
  ],
  "safetyFlags": {
    "crmWrite": false,
    "pipelineWrite": false,
    "policyWrite": false,
    "quoteWrite": false,
    "taskCreate": false,
    "calendarCreate": false,
    "messageSend": false,
    "authReal": false,
    "providerRuntime": false,
    "secretAccess": false,
    "browserPersistence": false,
    "realEngineExecution": false,
    "realEffectsAllowed": false,
    "realEffectsEnabled": false,
    "backendConnection": false,
    "pdfRead": false,
    "ocrExecution": false,
    "parserExecution": false,
    "calculatorExecution": false,
    "banxicoCall": false,
    "testExecution": false,
    "officialQuoteAllowed": false,
    "providerRuntimeAllowed": false,
    "calculatorExecutionAllowed": false,
    "parserExecutionAllowed": false,
    "backendConnectionAllowed": false,
    "quoteTruthAllowed": false
  },
  "next": "105D_QUOTE_PREVIEW_NEW_QUOTE_PAGE_SOURCE_PATCH_IMPLEMENTATION"
}

## Confirmed

- 105C does not implement UI.
- 105C does not modify index.html.
- 105D is authorized to modify docs/static-preview/forge-alive/index.html only.
- 105D must remain static, preview-only, and local navigation only.
- All real-effect flags remain false.
