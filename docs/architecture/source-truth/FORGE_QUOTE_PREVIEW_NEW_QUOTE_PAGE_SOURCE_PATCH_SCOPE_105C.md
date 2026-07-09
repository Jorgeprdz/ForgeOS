# Forge Quote Preview New Quote Page Source Patch Scope 105C

PHASE=105C_QUOTE_PREVIEW_NEW_QUOTE_PAGE_SOURCE_PATCH_SCOPE
STATUS=PASS
DECISION=PASS_105C_QUOTE_PREVIEW_NEW_QUOTE_PAGE_SOURCE_PATCH_SCOPE
LOCKED_DECISION=NEW_QUOTE_PAGE_SOURCE_PATCH_SCOPE_READY_FOR_IMPLEMENTATION
NEXT=105D_QUOTE_PREVIEW_NEW_QUOTE_PAGE_SOURCE_PATCH_IMPLEMENTATION

## 1. Purpose

105C defines the authorized source patch scope for implementing the future Nueva cotización static preview view.

105C does not implement the UI.

105C does not modify docs/static-preview/forge-alive/index.html.

## 2. Base Lock

105C depends on 105B.

Confirmed base:

- destination: #nueva-cotizacion
- pattern: hash-toggled embedded panel
- concept: safe quote preparation desk
- source UI changed in 105B: false
- source UI changed in 105C: false

## 3. Authorized Source Boundary For 105D

105D may modify only:

- docs/static-preview/forge-alive/index.html

No other source file may be modified without a new scope.

105D may add static HTML and CSS only.

105D may not introduce backend logic, provider calls, CRM writes, parser execution, calculator execution, PDF reading, OCR, Banxico calls, authentication, browser persistence, or message sending.

## 4. Authorized Operations For 105D

### Operation 1: Add New Embedded View

Required target:

- docs/static-preview/forge-alive/index.html

Required id:

- nueva-cotizacion

Required class:

- dw-new-quote-view-056y

Placement preference:

- near or after the existing Cotizaciones panel inside the main Forge Alive stage

Content boundary:

- placeholder-safe preview-only copy

### Operation 2: Scope Local Navigation CTA

Target:

- existing + Nueva cotización CTA

Allowed transformation:

- convert or wrap the CTA into local static navigation to #nueva-cotizacion only if visual parity is preserved

Required attributes:

- href="#nueva-cotizacion"
- data-forge-local-navigation-only="true"
- data-forge-real-effects-allowed="false"

Blocked attributes:

- onclick
- onmousedown
- javascript:
- provider runtime markers
- backend connection markers
- CRM write markers

### Operation 3: Add Backlink

Target:

- new quote view header

Required href:

- #cotizaciones

Required copy:

- Volver a Cotizaciones

### Operation 4: Add Static CSS

Allowed new classes:

- dw-new-quote-view-056y
- dw-new-quote-shell-056y
- dw-new-quote-hero-056y
- dw-new-quote-intake-grid-056y
- dw-new-quote-section-card-056y
- dw-new-quote-readiness-card-056y
- dw-new-quote-safe-action-panel-056y
- dw-new-quote-backlink-056y
- dw-new-quote-checklist-056y

Styling rule:

Use existing Forge tokens and classes first. Avoid inline style hacks.

## 5. Required Content For 105D

Required visible copy:

- Nuevo borrador de cotización
- Prepara contexto para un preview. No genera cotización oficial.
- Preview
- Requiere revisión humana
- Sin efectos reales
- Forge organiza la preparación y señala faltantes. La revisión humana sigue siendo obligatoria.
- Faltan datos mínimos. No se ejecutan cálculos, proveedores ni escrituras.
- Preparar preview
- Volver a Cotizaciones

The primary action Preparar preview must remain disabled or visibly locked.

## 6. Prohibited Content For 105D

105D must not introduce:

- premium values
- coverage values
- projection values
- UDI values
- rate values
- specific product candidates without trusted source
- specific client data
- age
- gender
- official quote output
- verified rule pack claims
- 100 percent verified claims
- provider response claims
- calculator result claims
- CRM write confirmations

## 7. Required Static Validation For 105D

105D must validate:

- id="nueva-cotizacion" exists exactly once
- href="#nueva-cotizacion" exists at least once
- href="#cotizaciones" remains present
- + Nueva cotización remains visible exactly once
- new view includes Preview badge
- new view includes Requiere revisión humana badge
- new view includes Sin efectos reales badge
- Preparar preview is disabled or visibly locked
- no real-effect flags are true
- no source outside authorized boundary is modified
- git diff --check passes

## 8. Future Visual QA

105E must capture screenshots for:

- desktop
- tablet
- mobile

105E must HOLD if:

- the layout overlaps
- the CTA loses visual parity
- the new view looks like an official quote engine
- safety labels are not visible
- the sidebar context breaks
- the page is not reachable by #nueva-cotizacion

## 9. Next

NEXT=105D_QUOTE_PREVIEW_NEW_QUOTE_PAGE_SOURCE_PATCH_IMPLEMENTATION
