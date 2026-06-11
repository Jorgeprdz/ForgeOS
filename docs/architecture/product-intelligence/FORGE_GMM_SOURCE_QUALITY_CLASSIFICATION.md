# Forge GMM Source Quality Classification

Status: DISCOVERY / KNOWLEDGE GOVERNANCE

## Purpose

Classify sources by quality and define usage restrictions.

## Source Quality Classes

### Authoritative

Definition:

Sources that can govern policy-specific or product-specific truth.

Examples:

- Caratula.
- Endorsement.
- Condiciones Generales.
- Registered clauses.
- Official optional coverage documents.

Allowed use:

- Coverage assessment.
- Rule provenance.
- Human review evidence.

Restriction:

- Must be versioned and product-scoped.

### Operational

Definition:

Sources that govern operational lookup or current service context.

Examples:

- Hospital directory.
- Pharmacy list.
- Provider directory.
- Honorarium catalog.
- Usual/reasonable catalog.

Allowed use:

- Provider classification.
- Financial boundary.
- Direct payment/reimbursement context.

Restriction:

- Must match date, product, plan and zone where applicable.

### Reference

Definition:

Sources that explain product concepts but do not override authoritative
documents.

Examples:

- Official product manual.
- Advisor guide.
- Internal training material.
- Compliance explanation.

Allowed use:

- Education.
- Discovery.
- Question strategy.

Restriction:

- Cannot be sole basis for likely covered/not covered when authoritative source
  is missing.

### Educational

Definition:

Commercial or instructional sources.

Examples:

- Sales decks.
- Marketing brochures.
- Training presentations.

Allowed use:

- Advisor/client explanation.
- Narrative discovery.

Restriction:

- Cannot create coverage.
- Cannot override conditions.

### Historical

Definition:

Formerly active source retained for audit or old policy/event analysis.

Examples:

- Old manual.
- Expired conditions.
- Replaced catalog.

Allowed use:

- Historical event review.
- Audit.
- Product evolution analysis.

Restriction:

- Not usable for current evaluation unless event/policy date falls inside its
  effective period.

### Deprecated

Definition:

Source superseded, invalidated or no longer approved.

Allowed use:

- Audit only.

Restriction:

- Must not support current coverage assessment.

### Rejected

Definition:

Source found unreliable, wrong product, corrupted or non-authoritative.

Allowed use:

- None except record of rejection reason.

Restriction:

- Must not be used for coverage assessment or education unless explicitly
  explaining why rejected.

## Quality-Driven Output

- Authoritative + active + aligned: may support likely assessment.
- Operational + current: may support financial/provider boundary.
- Reference only: educational or conditional context.
- Educational only: explanation only.
- Historical/deprecated: no current use.
- Rejected: no use.
