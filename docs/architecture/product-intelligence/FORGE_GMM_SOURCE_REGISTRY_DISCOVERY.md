# Forge GMM Source Registry Discovery

Status: DISCOVERY / KNOWLEDGE GOVERNANCE

No code. No engines. No schemas. No UI. No Build Tree changes.

## Executive Purpose

GMM Coverage Intelligence is blocked until Forge can govern source truth.

Before Forge evaluates coverage, Forge must know:

- Where a rule came from.
- Which document is authoritative.
- Which version is active.
- Which product the source belongs to.
- Whether the rule is current, expired, historical or replaced.
- How conflicts are resolved.
- When human review is mandatory.

This discovery designs source governance only. It does not implement a source
registry.

## Source Registry Principle

Forge must not treat extracted text as truth unless the text is tied to:

- Source type.
- Product.
- Version.
- Effective period.
- Authority level.
- Section/page reference.
- Extraction method.
- Review status.

## Source Taxonomy

### Contract Sources

Highest practical relevance for an individual policy.

- Policy caratula.
- Endorsements.
- Optional coverage documents.
- Renewal documents.
- Recognized antiquity documents.
- Exclusion riders or special conditions.

### Product Legal Sources

Authoritative product rule sources.

- Condiciones Generales.
- Product-specific general conditions by version.
- Official policy clauses.
- Registered additional clauses.

### Operational Product Sources

Operational sources that explain how current policy rules are applied.

- Hospital directories.
- Pharmacy lists.
- Provider directories.
- Catalogo de Honorarios Medicos y Quirurgicos.
- Gasto Usual, Razonable y Acostumbrado catalogs.
- Assistance provider manuals.
- Direct payment operating rules.

### Product Interpretation Sources

Useful for understanding, not superior to contract/legal sources.

- Product manuals.
- Advisor guides.
- Product guides.
- Internal training documents.
- Compliance bulletins.
- Regulatory notices.
- Official FAQ documents.

### Commercial/Educational Sources

Useful for client/advisor explanation, not coverage authority.

- Sales material.
- Presentation decks.
- Marketing brochures.
- Training slides.
- Advisor scripts.

### Evidence Sources

Case-specific evidence sources.

- Medical diagnosis.
- Clinical file.
- Hospital record.
- Diagnostic studies.
- Prescriptions.
- Invoices.
- Receipts.
- Prior policy evidence.
- Prior medical records.

### Historical Sources

Sources retained for audit/history, not active evaluation.

- Replaced manuals.
- Expired conditions.
- Deprecated catalogs.
- Old hospital directories.
- Retired product documents.

## Registry Responsibilities

The Source Registry must:

- Identify source type.
- Attach source to product/family.
- Track version and effective dates.
- Track authority level.
- Track active/deprecated status.
- Preserve provenance for every extracted rule.
- Flag source conflicts.
- Prevent obsolete rule use.
- Prevent product contamination.

The Source Registry must never:

- Resolve medical judgment by itself.
- Override a policy-specific caratula.
- Treat sales material as coverage authority.
- Apply one product's source to another product.
- Use expired documents for current evaluation unless explicitly historical.

## Registry Output Types

For future Coverage Intelligence, Source Registry should provide:

- Source usable for current evaluation.
- Source usable only for education.
- Source historical only.
- Source conflict detected.
- Source missing.
- Source requires human review.

## Discovery Verdict

Source Registry is not optional infrastructure. It is the governance layer that
prevents Forge from reasoning confidently from stale, weaker or wrong-product
sources.
