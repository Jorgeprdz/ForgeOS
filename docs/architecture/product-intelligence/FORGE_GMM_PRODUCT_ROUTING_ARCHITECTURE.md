# Forge GMM Product Routing Architecture

Status: BLUEPRINT / PRE-IMPLEMENTATION

## Purpose

Prevent incorrect product evaluation across the GMM family.

## Required Product Routes

Current routes:

- Alfa Medical.
- Alfa Medical Flex.
- Unknown GMM product.

Future routes:

- Alfa Medical Internacional.
- Other GMM products discovered later.

## Product Router Responsibilities

The Product Router must:

- Identify exact product name.
- Preserve source of product identification.
- Detect ambiguity.
- Route to product-specific rule model.
- Block evaluation when product is unknown.

The Product Router must not:

- Treat product names as synonyms.
- Infer Flex from a partial string without source confirmation.
- Apply Alfa Medical deductible/coinsurance model to Flex.
- Apply Flex franchise/copay/participation model to Alfa Medical.

## Source Priority

Product identity reliability:

```text
Policy caratula
↓
Endorsement
↓
Quote
↓
Official PDF / conditions
↓
Advisor statement
↓
Client statement
↓
Unconfirmed extraction
```

## Alfa Medical Route

Route to:

- Classic deductible / coinsurance / coinsurance cap model.
- Practico / Integro / Pleno hospital levels.
- Alfa Medical coverage, waiting, exclusion, maternity, accident and foreign
  rules.

Block if:

- Product could be Flex.
- Caratula says another product.

## Alfa Medical Flex Route

Route to:

- Flex financial model: franquicia, copago, participacion.
- A / AA / AAA / Preferente hospital levels.
- Flex-specific rule discovery when available.

Block if:

- The only evidence says "Alfa Medical" without Flex.

## Unknown GMM Product Route

Allowed output:

- Educational explanation of why exact product matters.
- Request for caratula or quote.

Not allowed:

- Coverage assessment.
- Financial participation estimate.

## Routing Failure Conditions

- Product missing.
- Product ambiguous.
- Conflicting caratula and quote.
- User says product but uploaded document says another product.
- Product name extracted from OCR with low confidence.

## Routing Verdict

Product routing belongs in the Shared GMM Layer.

Product rule interpretation belongs in the product-specific layer.
