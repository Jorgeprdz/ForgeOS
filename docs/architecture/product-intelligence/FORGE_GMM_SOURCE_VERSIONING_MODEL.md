# Forge GMM Source Versioning Model

Status: DISCOVERY / KNOWLEDGE GOVERNANCE

## Purpose

Prevent obsolete rules by defining how Forge should reason about source
versions.

## Required Version Fields

Every source should preserve:

- Source title.
- Product family.
- Product name.
- Source type.
- Source owner/issuer.
- Document version label.
- Publication date.
- Effective date.
- Expiration date, if known.
- Replacement source, if known.
- Retrieval/upload date.
- File identity/hash, if later implemented.
- Review status.
- Active status.

## Date Types

### Publication Date

When the document was published or created.

Use:

- Audit and freshness.

Not enough for:

- Determining active rule period.

### Effective Date

When the document begins governing rules.

Use:

- Coverage evaluation.

Critical because:

- A document can be published before or after its effective period.

### Event Date

When the medical event, first symptom, first expense or treatment occurred.

Use:

- Select applicable source version.

### Policy Issue Date

When the policy was issued.

Use:

- Determine which conditions/caratula version may apply.

### Renewal Date

When policy terms may update.

Use:

- Determine active caratula, deductible, coinsurance, cap, hospital level and
  catalogs.

### Expiration / Replacement Date

When the source should no longer be used for current evaluation.

Use:

- Retire source from active rule use.

## Source Statuses

- Draft.
- Pending Review.
- Active.
- Active but Superseded for New Business.
- Historical.
- Deprecated.
- Retired.
- Rejected.
- Unknown Status.

## Version Selection Logic

For case-specific evaluation:

1. Identify product and policy.
2. Identify relevant event date and expense date.
3. Identify policy issue and renewal context.
4. Select active caratula/endorsement for that policy period.
5. Select active Condiciones Generales for that product/policy version.
6. Select active operational catalogs/directories for the service date.
7. If versions conflict, trigger source conflict workflow.

## Invalid Source Conditions

A source should not be used for current evaluation when:

- It is expired.
- It is replaced.
- It belongs to another product.
- Its effective period does not cover the event.
- Its status is unknown and a stronger source exists.
- It is educational/commercial only.

## Historical Use

Historical sources may be used to:

- Explain old policy behavior.
- Audit past decisions.
- Compare product evolution.

They must not be used for current coverage assessment unless the policy/event
date falls inside their effective period.
