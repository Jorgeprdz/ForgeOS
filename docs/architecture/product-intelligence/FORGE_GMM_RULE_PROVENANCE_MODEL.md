# Forge GMM Rule Provenance Model

Status: DISCOVERY / KNOWLEDGE GOVERNANCE

## Purpose

Define the minimum provenance required for every future GMM rule.

## Minimum Rule Provenance

Every future rule must know:

- Rule ID.
- Product family.
- Product name.
- Rule family.
- Source document title.
- Source type.
- Source version.
- Section/clause.
- Page number or locator.
- Extracted wording summary.
- Effective date.
- Event-date applicability.
- Extraction method.
- Extraction confidence.
- Human review status.
- Last reviewed date.
- Replacement/supersession status.

## Recommended Rule Provenance Fields

### Rule Identity

- Rule ID.
- Rule name.
- Rule family.
- Product scope: shared GMM, Alfa Medical, Alfa Medical Flex, future product.

### Source Identity

- Document title.
- Issuer.
- Source type.
- Version label.
- File/path or registry reference.
- Publication date.
- Effective date.
- Expiration date.

### Location

- Section.
- Clause.
- Page.
- Table.
- Paragraph.
- Portal URL/date if operational source.

### Extraction

- Extracted by: human, OCR, parser, AI-assisted, manual review.
- Extraction confidence.
- Ambiguity flag.
- Verbatim snippet limit reference.
- Summary.

### Review

- Reviewed by.
- Review date.
- Review status: unreviewed, reviewed, approved for discovery, approved for
  implementation, rejected.
- Human review notes.

### Applicability

- Product.
- Policy version.
- Effective period.
- Event family.
- Required inputs.
- Blocking unknowns.

## Provenance Confidence Levels

- High: active authoritative source, exact locator, human reviewed.
- Medium: active authoritative source, locator exists, extraction not fully
  reviewed.
- Low: non-authoritative source or unclear version.
- Invalid: deprecated, wrong product, superseded or conflict unresolved.

## Rule Without Provenance

If a rule has no source provenance, Forge must treat it as:

- Not usable for coverage assessment.
- Not usable for implementation.
- Possible unknown question only.

## Provenance Boundary

Forge may summarize a rule for user clarity, but internally the rule must remain
traceable to source, version and location.
