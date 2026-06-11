# Forge GMM Product Source Registry

Status: DISCOVERY / KNOWLEDGE GOVERNANCE

## Purpose

Prevent rule contamination between Alfa Medical, Alfa Medical Flex and future
GMM products.

## Registry Product Dimensions

Every source must be assigned to:

- Product family: GMM.
- Product: Alfa Medical, Alfa Medical Flex, Alfa Medical Internacional, future.
- Product version.
- Business context: new business, renewal, legacy, rider, optional coverage.
- Effective period.

## Alfa Medical Registry

Known source types needed:

- Alfa Medical Condiciones Generales.
- Alfa Medical caratulas.
- Alfa Medical endorsements.
- Alfa Medical optional coverage documents.
- Alfa Medical hospital levels: Practico, Integro, Pleno.
- Alfa Medical catalogs/directories.
- Alfa Medical product manuals.
- Alfa Medical training/sales material.

Rules that must remain Alfa Medical-specific:

- Deductible/coinsurance/cap structure.
- Alfa Medical maternity rules.
- Alfa Medical waiting-period list.
- Alfa Medical foreign optional coverage terms.
- Alfa Medical high-specialty benefit rules.

## Alfa Medical Flex Registry

Known source types needed:

- Alfa Medical Flex Condiciones Generales.
- Flex caratulas.
- Flex endorsements.
- Flex optional coverage documents.
- Flex hospital levels: A, AA, AAA, Preferente.
- Flex catalogs/directories.
- Flex product manuals.

Rules that must remain Flex-specific:

- Franquicia.
- Copago.
- Participacion.
- Flex hospital-level mapping.
- Flex coverage and financial mechanics.

## Future GMM Product Registry

Future products require:

- Separate product namespace.
- Separate source inventory.
- No inherited financial logic unless validated.
- Product-specific rule discovery before evaluation.

## Product Contamination Controls

Forge must block:

- Alfa Medical rules used for Flex.
- Flex rules used for Alfa Medical.
- Hospital levels treated as global.
- Optional coverages treated as universal.
- Catalogs used outside their applicable product/date.

## Registry Output

For any source, registry should answer:

- Which product does this source govern?
- Is it shared GMM or product-specific?
- Is it active?
- What dates does it cover?
- Which rule families can it support?
- Is human review required before use?
