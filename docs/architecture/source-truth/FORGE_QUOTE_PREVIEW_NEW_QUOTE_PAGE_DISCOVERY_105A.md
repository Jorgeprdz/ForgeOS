# Forge Quote Preview New Quote Page Discovery 105A

PHASE=105A_QUOTE_PREVIEW_SAFE_MODULE_VIEW_ACTIVATION_SCOPE
STATUS=PASS
DECISION=PASS_105A_QUOTE_PREVIEW_SAFE_MODULE_VIEW_ACTIVATION_SCOPE
LOCKED_DECISION=NEW_QUOTE_PAGE_DISCOVERY_READY_FOR_DESIGN_PLAN
COMMIT_MODE=COMMIT_PUSH
NEXT=105B_QUOTE_PREVIEW_NEW_QUOTE_PAGE_DESIGN_PLAN

## 1. DESIGN_GUIDELINES_READ

The following design system specifications, architecture definitions, and code modules were systematically inspected before forming this proposal:

### Core Design System & Tokens
- [FORGE_DESKTOP_DESIGN_SYSTEM_DRAFT_001.md](file:///storage/emulated/0/Forge%20OS/docs/design/FORGE_DESKTOP_DESIGN_SYSTEM_DRAFT_001.md)
- [FORGE_MOBILE_DESIGN_SYSTEM_001.md](file:///storage/emulated/0/Forge%20OS/docs/design/FORGE_MOBILE_DESIGN_SYSTEM_001.md)
- [FORGE_UI_DESIGN_LINE_001.md](file:///storage/emulated/0/Forge%20OS/docs/design/forge-ui/FORGE_UI_DESIGN_LINE_001.md)
- [FORGE_UI_TOKENS_001.md](file:///storage/emulated/0/Forge%20OS/docs/design/forge-ui/FORGE_UI_TOKENS_001.md)

### Safe UI & Contract Precedents
- [FORGE_LOCAL_READ_MODEL_PREVIEW_UI_BINDING_CONTRACT_060K.md](file:///storage/emulated/0/Forge%20OS/docs/design/forge-ui/FORGE_LOCAL_READ_MODEL_PREVIEW_UI_BINDING_CONTRACT_060K.md)
- [FORGE_QUOTE_PREVIEW_SAFE_UX_STATE_MODEL_SCOPE_086A.md](file:///storage/emulated/0/Forge%20OS/docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_SAFE_UX_STATE_MODEL_SCOPE_086A.md)
- [FORGE_QUOTE_PREVIEW_SAFE_UX_STATE_MODEL_IMPLEMENTATION_086B.md](file:///storage/emulated/0/Forge%20OS/docs/evidence/FORGE_QUOTE_PREVIEW_SAFE_UX_STATE_MODEL_IMPLEMENTATION_086B.md)
- [FORGE_QUOTE_PREVIEW_SAFE_SCREEN_COMPOSITION_SCOPE_088A.md](file:///storage/emulated/0/Forge%20OS/docs/evidence/FORGE_QUOTE_PREVIEW_SAFE_SCREEN_COMPOSITION_SCOPE_088A.md)
- [FORGE_QUOTE_PREVIEW_SAFE_VISUAL_LAYOUT_SPEC_SCOPE_089A.md](file:///storage/emulated/0/Forge%20OS/docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_SAFE_VISUAL_LAYOUT_SPEC_SCOPE_089A.md)
- [FORGE_QUOTE_PREVIEW_SAFE_COPY_AND_BADGE_SYSTEM_SCOPE_090A.md](file:///storage/emulated/0/Forge%20OS/docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_SAFE_COPY_AND_BADGE_SYSTEM_SCOPE_090A.md)
- [FORGE_QUOTE_PREVIEW_SAFE_UI_IMPLEMENTATION_PLAN_091B.md](file:///storage/emulated/0/Forge%20OS/docs/evidence/FORGE_QUOTE_PREVIEW_SAFE_UI_IMPLEMENTATION_PLAN_091B.md)

### Code & Navigation Source Files
- [index.html](file:///storage/emulated/0/Forge%20OS/docs/static-preview/forge-alive/index.html)
- [alfred-desktop-command-workspace-056y.js](file:///storage/emulated/0/Forge%20OS/docs/static-preview/forge-alive/alfred-desktop-command-workspace-056y.js)
- [forge-public-preview-interaction-visual-repair-060m.js](file:///storage/emulated/0/Forge%20OS/docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.js)

### Previous Validation Context
- [FORGE_QUOTE_PREVIEW_COTIZACIONES_VISUAL_CONFIRMATION_RESULT_104E.md](file:///storage/emulated/0/Forge%20OS/docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_COTIZACIONES_VISUAL_CONFIRMATION_RESULT_104E.md)
- [forge-quote-preview-cotizaciones-visual-confirmation-result-104e.json](file:///storage/emulated/0/Forge%20OS/docs/evidence/forge-quote-preview-cotizaciones-visual-confirmation-result-104e.json)
- [forge-quote-preview-cotizaciones-visual-confirmation-audit-104e.json](file:///storage/emulated/0/Forge%20OS/docs/evidence/forge-quote-preview-cotizaciones-visual-confirmation-audit-104e.json)

---

## 2. CURRENT_STATE

Following the successful visual confirmation in phase `104E` (Commit `937e7f8`):
1. **Sidebar Navigation**: The **Cotizaciones** entry is bound as an anchor (`dw-nav-link-056y`) targeting the `#cotizaciones` hash. This matches standard desktop siblings.
2. **Action Trigger**: The **+ Nueva cotización** CTA button is located inside the header of the "Cotizaciones y pólizas" table shell (`dw-docs-056y`).
3. **Current Constraints**: The button uses styling `dw-static-new-quote-cta-056y`, but remains disabled (`disabled aria-disabled="true"`) to prevent un-gated action or execution.
4. **Active Viewport**: Standard hash-based targeting shows/focuses the Cotizaciones operational table card within the grid.

---

## 3. RECOMMENDED_DESTINATION

The **+ Nueva cotización** button should target a dedicated page view designed to prepare a quote preview:
- **Target Hash**: `#nueva-cotizacion`
- **Concept**: A **Quote Preparation Desk / intake view**, NOT an automated quote generator.
- **Workflow Role**: Serves as a precheck dashboard to collect and verify preconditions (client profile, product lines, Product Intelligence rules, required inputs) before presenting a preview option.

---

## 4. RECOMMENDED_PAGE_CONCEPT

- **Design Pattern**: Embedded Module View. In the static preview, the page should render as a hash-swapped viewport section inside the main stage wrapper `dw-main-056y`. Clicking `+ Nueva cotización` toggles visibility of the opportunities/cotizaciones dashboard and mounts the intake panel.
- **Routing Parity**: Standard JS hash listening checks `location.hash` and adds/removes `.is-hidden` or toggles display styles, preserving single-page static preview speed.
- **Execution Boundary**: Purely static mockup. Input collection does not execute formulas, call insurers, trigger parsers, or mutate database/CRM records.

---

## 5. RECOMMENDED_INFORMATION_ARCHITECTURE

The view is divided into structured, logical sections:

1. **Safety Header & Navigation Backlink**:
   - Title: `Nuevo borrador de cotización (Preview)`
   - Back button targeting `#cotizaciones` (`Volver a Cotizaciones`).
   - Sticky safety banner: `Solo lectura · Sin mutaciones · Requiere revisión humana`.

2. **Advisor Intent & Metadata Checklist**:
   - Selector for **Client Name** (pre-populated options: Lariza, Octavio, María, Juan).
   - Selector for **Product Family** (options: GMM SMNYL, Vida, Imagina Ser).
   - Input for **Quote Objective** (e.g. Retirement savings, major medical coverage).

3. **Required Input Checklist (Dynamic Mockup)**:
   - Visual checks of required documents: Identificación Oficial, Cuestionario Médico, Comprobante de Ingresos.
   - Status indicators showing what context is loaded.

4. **Product Intelligence Readiness Status (Upstream Authority)**:
   - Panel showing status of rule pack: `SMNYL Agency 2026 Rule Pack Loaded`.
   - Confidence score: `Juicio y reglas de negocio: 100% verificado`.

5. **Safe Action Panel (Safety Checkpoints)**:
   - Primary button: `Solicitar revisión de preview` (styled with gold/cyan glow but visually locked/disabled in early steps).
   - Dynamic explanation copy highlighting that Forge decides and the human advisor remains the final responsible party.

---

## 6. RECOMMENDED_UI_LAYOUT

### Desktop Layout (Two-Column Operational Stage)
- **Left Column (Intake Workspace)**: Form fields for Client, Product selection, objective description, and the document checklist.
- **Right Column (Alfred Intelligence & Safety)**: Displays current UX state summary, Product Intelligence details, warning cards, and blocked execution metrics.
- Preserves the persistent operational left sidebar (`dw-sidebar-056y`) and topbar.

### Tablet Layout
- Collapses into a single stack or vertical sequential view, wrapping side columns to fit `1024x768` viewports safely without clipping table headers or form inputs.

### Mobile Layout
- Vertically stacked blocks following the Mobile Design System rules.
- Persistent bottom navigation pill remains visible.
- Floating action buttons do not overlap key input targets.

---

## 7. RECOMMENDED_COMPONENTS

The implementation should reuse existing components and typography styles to ensure visual cohesion:

### Reused CSS Classes / Elements
- `.dw-panel-header-056y` for headers.
- `.dw-lock-note-056y` for safety ribbons.
- `.dw-chip-056y` for statuses (green, gold, red).
- `.dw-static-new-quote-cta-056y` color tokens.

### New Components
- `.dw-quote-intake-workspace-056y` (Primary container for the intake form).
- `.dw-intake-form-group-056y` (Input layout structure).
- `.dw-intake-checklist-056y` (Verification checklist grid).

---

## 8. SAFE_DATA_SCHEMA

The future intake page will interact with a read-only metadata model structured as follows:

```json
{
  "quoteDraftId": "COT-2025-TEMP-05",
  "clientId": "client-lariza-056y",
  "clientName": "Lariza",
  "clientStatus": "Propuesta GMM",
  "productLine": "GMM SMNYL",
  "productCandidate": "Alfa Médica Líder",
  "objective": "Cobertura médica integral con deducible optimizado",
  "quoteIntent": "pre-cotizar",
  "requiredInputs": [
    { "field": "edad", "provided": true, "value": 34 },
    { "field": "genero", "provided": true, "value": "Femenino" },
    { "field": "cuestionario_medico", "provided": false }
  ],
  "missingInputs": ["cuestionario_medico"],
  "productIntelligenceStatus": "verified_rule_pack_loaded",
  "previewReadiness": "incomplete_missing_inputs",
  "humanReviewRequired": true,
  "safetyFlags": {
    "officialQuoteAllowed": false,
    "providerRuntimeAllowed": false,
    "calculatorExecutionAllowed": false,
    "parserExecutionAllowed": false,
    "backendConnectionAllowed": false,
    "realEffectsAllowed": false
  }
}
```

---

## 9. SAFETY_BOUNDARIES

To respect the Forge Constitution, any future patch must strictly isolate execution:

> [!IMPORTANT]
> **Blocked Execution Gates**:
> - `crmWrite`: MUST remain false. No CRM records are created or updated.
> - `quoteWrite`: MUST remain false. No official quote document is generated.
> - `providerRuntime`: MUST remain false. No connections to carrier systems.
> - `calculatorExecution`: MUST remain false. Premium formulas are disabled.
> - `backendConnection`: MUST remain false. Pure client-side static rendering.

---

## 10. IMPLEMENTATION_PLAN

The next steps follow a systematic engineering sequence:

1. **105B_QUOTE_PREVIEW_NEW_QUOTE_PAGE_DESIGN_PLAN**: Scope visual mocks, layout grids, responsive design states, and typography hierarchy.
2. **105C_QUOTE_PREVIEW_NEW_QUOTE_PAGE_SOURCE_PATCH_SCOPE**: Map exact file edits, DOM selectors, class additions, and event listener hooks.
3. **105D_QUOTE_PREVIEW_NEW_QUOTE_PAGE_SOURCE_PATCH_IMPLEMENTATION**: Implement markup, styling, and hash routing controls.
4. **105E_QUOTE_PREVIEW_NEW_QUOTE_PAGE_VISUAL_QA_WITH_SCREENSHOTS**: Capture and catalog visual QA screenshots.
5. **105F_QUOTE_PREVIEW_NEW_QUOTE_PAGE_HUMAN_VISUAL_CONFIRMATION**: Review code and render with the user for final PASS.

---

## 11. SCREENSHOT_QA_PLAN

During implementation visual QA, screenshots must verify:
- **Desktop (1440x900)**: Form alignment, lack of column overlap, and visibility of the persistent topbar/sidebar.
- **Tablet (1024x768)**: Column wrapping checks, input text visibility.
- **Mobile (390x844)**: Single-column spacing rhythm, bottom nav bar, and action safety cards.
- **Badge Audit**: Clear readability of the `Preview` and `Solo Lectura` labels.

---

## 12. PASS_HOLD_CRITERIA

This discovery phase may transition to **PASS** only if:
- actual design guidelines have been read and cited;
- the recommended hash destination (`#nueva-cotizacion`) is defined;
- all real effects, calculations, and connections remain strictly prohibited;
- no modifications have been made to the core HTML/CSS runtime files in this discovery step;
- the next step is explicitly set to `105B_QUOTE_PREVIEW_NEW_QUOTE_PAGE_DESIGN_PLAN`.

---

## 13. RISKS_AND_OPEN_QUESTIONS

1. **Active State in Sidebar**: When navigating to `#nueva-cotizacion`, should the sidebar item "Cotizaciones" remain highlighted as active? Yes, this maintains context since it is a sub-page of the Cotizaciones branch.
2. **Client Auto-Selection**: Should clicking "Cotizar" inline from the Opportunities Table redirect to `#nueva-cotizacion` with that client pre-selected? Yes, this matches the intent of the command parser suggestions (e.g. `/cotizar GMM Lariza`).
