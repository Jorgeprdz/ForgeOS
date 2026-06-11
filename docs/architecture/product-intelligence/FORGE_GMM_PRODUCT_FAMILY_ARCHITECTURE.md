# FORGE GMM Product Family Architecture

Status: ARCHITECTURE DISCOVERY / NOT IMPLEMENTED

Source context: documentary analysis of March 2026 Condiciones Generales for:

- Alfa Medical | Nuevos
- Alfa Medical Flex | Nuevos

## Executive Decision

Alfa Medical and Alfa Medical Flex must not be modeled as one product with an
`isFlex=true` flag.

They are sibling products inside one GMM product family:

```text
GMM_PRODUCT_FAMILY
├── ALFA_MEDICAL
└── ALFA_MEDICAL_FLEX
```

Forge Core must remain product-aware but not carrier-rule-hardcoded. The GMM
family can provide shared vocabulary, documentary provenance requirements and
product routing, but the rule interpretation must live in product-specific,
versioned rule models.

## Architecture Boundary

This document records architecture only.

No engine implementation is approved by this document.
No financial calculation is approved by this document.
No rule pack is created by this document.
No current JavaScript, TypeScript, schema, UI or import path is changed by this
document.

## Product Family Principle

The GMM product family owns:

- Product identity and sibling relationship
- Product detection expectations
- Documentary provenance expectations
- Product-specific rule model routing
- Shared guardrails for medical expense products

The GMM product family does not own:

- Carrier-specific hardcoded values in Forge Core
- Deducible, franchise, copay, participation or coinsurance calculations without
  rule evidence
- Hospital level values as global constants
- Coverage availability without documentary source and version
- Forecasted insured out-of-pocket expense without the required facts

## Required Subproduct Models

### ALFA_MEDICAL

Alfa Medical uses a classic GMM financial structure.

Required architecture concepts:

- deductible-engine concept
- coinsurance-engine concept
- coinsurance-cap-engine concept
- hospital-level-engine product map
- out-of-pocket-engine concept
- coverage-map
- waiting-period-map
- exclusions-map
- optional-coverages-map

Known product vocabulary from the documentary review:

- Deducible
- Coaseguro
- Tope de Coaseguro
- Deducible Único
- Deducible Anual
- Deducible Reinstalable
- Coaseguro Único
- Coaseguro Reinstalable

Known hospital level vocabulary:

- Práctico
- Íntegro
- Pleno

Representative coverage and condition concepts:

- Maternidad por Reproducción Asistida
- Cirugía Fetal
- Reducción de Deducible por Accidente
- Eliminación de Deducible por Accidente
- Cobertura de Extensión en el Extranjero

Routing rule:

If Forge detects Alfa Medical, it must route to the classic Alfa Medical model:
deducible + coaseguro + tope. It must not route to the Flex model.

### ALFA_MEDICAL_FLEX

Alfa Medical Flex uses a distinct financial structure.

Required architecture concepts:

- franchise-engine concept
- copay-engine concept
- participation-engine concept
- hospital-level-engine product map
- flex-out-of-pocket-engine concept
- coverage-map
- waiting-period-map
- exclusions-map
- optional-coverages-map

Known product vocabulary from the documentary review:

- Franquicia
- Copago
- Participación

Known hospital level vocabulary:

- A
- AA
- AAA
- Preferente

Representative coverage and condition concepts:

- Reducción de Franquicia y Copago por Accidente
- Asistencia en el Extranjero
- Enfermedades Catastróficas en el Extranjero
- Servicios Flex basados en Franquicia / Copago / Participación

Routing rule:

If Forge detects Alfa Medical Flex, it must route to the Flex model:
franquicia + copago + participación. It must not use the classic
deducible/coaseguro engine path.

## Product-Aware Hospital Level Architecture

Hospital levels must be product-aware.

Forge Core must not assume a global hospital-level enum for GMM products.

Product-level maps are required:

```text
ALFA_MEDICAL.hospitalLevelMap
├── Práctico
├── Íntegro
└── Pleno

ALFA_MEDICAL_FLEX.hospitalLevelMap
├── A
├── AA
├── AAA
└── Preferente
```

Any later implementation should treat these labels as rule-pack/document-derived
values, not as Forge Core constants.

## Out-of-Pocket Architecture Boundary

Do not create one generic out-of-pocket engine that assumes Alfa Medical and
Alfa Medical Flex behave the same.

Recommended split:

```text
ALFA_MEDICAL
└── out-of-pocket model
    ├── deductible model
    ├── coinsurance model
    └── coinsurance cap model

ALFA_MEDICAL_FLEX
└── flex-out-of-pocket model
    ├── franchise model
    ├── copay model
    └── participation model
```

Shared family-level code may normalize inputs, provenance and confidence, but
must not flatten the financial logic into one universal calculation.

## Evidence Requirements

Every rule used by future implementation must come from one of:

- PDF / Condiciones Generales
- Carátula de póliza
- Cotización real
- Versioned Rule Pack
- Human review when the source is ambiguous

Unknown values must remain unknown.

Forge must not invent:

- Montos
- Porcentajes
- Deducibles
- Franquicias
- Copagos
- Participación
- Coaseguro
- Topes
- Niveles hospitalarios
- Coberturas
- Periodos de espera
- Exclusiones

## Calculation Blockers

Forge must not project or calculate insured out-of-pocket expense unless all
required context exists:

- Exact product
- Plan / hospital level
- Suma asegurada
- Deducible or franquicia
- Coaseguro or participación
- Tope de coaseguro when applicable
- Copago when applicable
- Territory
- Applicable tabulator/catalog
- Policy/document version and effective period

If any required value is missing, Forge should produce a missing-evidence result
instead of a numeric estimate.

## Future Implementation Gate

Before any implementation, Forge needs:

- Product-specific rule model approval
- Versioned documentary source registry
- Test fixtures for Alfa Medical and Alfa Medical Flex
- Positive and risk scenarios for each product
- Human-review workflow for ambiguous extracted clauses
- Explicit approval to modify engines, schemas or rule packs

Implementation status: NOT APPROVED.
