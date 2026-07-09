# Forge Quote Preview New Quote Page Design Plan 105B

PHASE=105B_QUOTE_PREVIEW_NEW_QUOTE_PAGE_DESIGN_PLAN
STATUS=PASS
DECISION=PASS_105B_QUOTE_PREVIEW_NEW_QUOTE_PAGE_DESIGN_PLAN
LOCKED_DECISION=NEW_QUOTE_PAGE_DESIGN_PLAN_READY_FOR_SOURCE_PATCH_SCOPE
NEXT=105C_QUOTE_PREVIEW_NEW_QUOTE_PAGE_SOURCE_PATCH_SCOPE

## 1. Purpose

105B converts the sanitized 105A discovery into a concrete design plan for the future Nueva cotización view.

This is a design plan only. No source UI implementation occurs in 105B.

## 2. Base Lock

105B depends on:

- 105A discovery
- 105AR safety repair
- destination: #nueva-cotizacion
- pattern: hash-toggled embedded panel
- next phase: 105C source patch scope

## 3. Product Definition

The Nueva cotización view is a safe quote preparation desk.

It is not:

- an official quote engine
- a premium calculator
- a provider runtime
- a CRM writer
- a policy generator
- a message sender

It is:

- a place to organize quote context
- a place to show missing inputs
- a place to label preview readiness
- a place to keep human review required
- a place to prepare for future Product Intelligence and Quote Preview integration

## 4. Recommended Destination

RECOMMENDED_DESTINATION=#nueva-cotizacion

This should remain a child context of Cotizaciones. The Cotizaciones sidebar context should remain visually active when the new view is visible.

## 5. Recommended Pattern

RECOMMENDED_PATTERN=hash-toggled-embedded-panel

The future implementation should use local static preview navigation only.

105C must decide the exact technical route:

- static anchor
- existing local hash handler
- CSS target pattern
- current Forge Alive view system if already present

No backend, storage, provider, parser, calculator, CRM, message, task, or calendar behavior may be introduced.

## 6. Page Concept

Title:

Nuevo borrador de cotización

Subtitle:

Prepara contexto para un preview. No genera cotización oficial.

Core badges:

- Preview
- Requiere revisión humana
- Sin efectos reales

## 7. Information Architecture

### Safety Header

Purpose: make the safe state unmistakable.

Elements:

- title
- subtitle
- Preview badge
- Requiere revisión humana badge
- Sin efectos reales badge
- Volver a Cotizaciones local anchor

### Intake Workspace

Purpose: show selected or missing context.

Elements:

- client selection placeholder
- product family placeholder
- advisor objective placeholder
- quote intent placeholder

No concrete client, product, age, gender, premium, projection, rate, or coverage value should appear.

### Required Context Checklist

Purpose: show missing context without inventing data.

Elements:

- client context pending
- product family pending
- advisor objective pending
- document context pending
- human review pending

### Product Intelligence Readiness

Purpose: show upstream readiness only.

Allowed message:

Product Intelligence not loaded in static preview.

Blocked messages:

- verified rule pack loaded
- 100 percent verified
- official decision
- product truth created

### Preview Readiness

Purpose: explain whether a future preview can be prepared.

Allowed states:

- not ready missing required context
- ready for human review
- blocked official quote
- blocked calculator
- blocked provider runtime

### Safe Action Panel

Purpose: show safe next actions.

Elements:

- Preparar preview disabled
- Volver a Cotizaciones local anchor
- Revisión humana requerida note

## 8. Layout Plan

### Desktop

Use the existing Forge Alive desktop shell.

Recommended structure:

- full-width safety header
- two-column operational grid
- left column: intake workspace and required context checklist
- right column: Product Intelligence readiness, preview readiness, safe action panel

### Tablet

Use stacked or wrapped columns.

Rules:

- no CTA overlap
- no card clipping
- badges remain readable
- safe action panel visible

### Mobile

Use single-column card stack.

Rules:

- no floating CTA overlap
- large touch targets
- visible safety badges
- simple vertical rhythm

## 9. Component Contract

Reuse existing classes where possible:

- dw-main-056y
- dw-panel-header-056y
- dw-lock-note-056y
- dw-chip-056y
- dw-static-new-quote-cta-056y
- dw-nav-link-056y
- dw-nav-056y
- dw-nav-icon-056y

New components to scope in 105C:

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

## 10. CTA Activation Plan For Later Phases

Current state:

The + Nueva cotización CTA is preview-only after 104E.

Future safe navigation:

105D may convert the CTA into a local hash anchor to #nueva-cotizacion only after 105C scope approval.

Allowed behavior:

- local static preview navigation

Blocked behavior:

- official quote creation
- premium calculation
- provider runtime
- backend connection
- CRM write
- message send
- calendar creation

## 11. Safe Copy Model

Title:

Nuevo borrador de cotización

Subtitle:

Prepara contexto para un preview. No genera cotización oficial.

Safety note:

Forge organiza la preparación y señala faltantes. La revisión humana sigue siendo obligatoria.

Blocked state copy:

Faltan datos mínimos. No se ejecutan cálculos, proveedores ni escrituras.

## 12. Safe Data Model

The future view must use the placeholder-safe schema from 105AR.

Required principles:

- productCandidate remains null unless sourced later
- assumptions remains empty
- requiredInputs remains empty until scoped
- missingInputs remains empty until scoped
- Product Intelligence status remains not loaded in static preview
- preview readiness remains not ready missing required context
- human review remains required
- all real-effect flags remain false

## 13. Screenshot QA Plan For 105E

Desktop must verify:

- #nueva-cotizacion visible
- sidebar context preserved
- two-column layout aligned
- no overlap
- preview badges visible

Tablet must verify:

- layout wraps safely
- badges readable
- safe action panel visible

Mobile must verify:

- single-column stack
- no floating overlap
- touch targets readable
- safety labels visible

## 14. Future PASS/HOLD Criteria

105D and 105E must HOLD if any of these appear:

- official quote
- premium
- coverage value
- specific product candidate without trusted source
- calculator or provider runtime implication
- backend or CRM write
- missing safety copy
- failed screenshot QA

## 15. Next

NEXT=105C_QUOTE_PREVIEW_NEW_QUOTE_PAGE_SOURCE_PATCH_SCOPE
