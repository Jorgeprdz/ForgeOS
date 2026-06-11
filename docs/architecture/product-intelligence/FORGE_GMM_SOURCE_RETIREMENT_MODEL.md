# Forge GMM Source Retirement Model

Status: DISCOVERY / KNOWLEDGE GOVERNANCE

## Purpose

Prevent zombie rules: obsolete rules that remain active after their source has
been replaced or invalidated.

## Retirement Triggers

Retire or restrict a source when:

- New version replaces it.
- Effective period ends.
- Product is deprecated.
- Optional coverage document is replaced.
- Hospital directory is updated.
- Pharmacy list is updated.
- Catalog is updated.
- Compliance bulletin supersedes prior interpretation.
- Source is found to belong to wrong product.
- Source is found unreliable or corrupted.

## Retirement Statuses

- Superseded.
- Expired.
- Deprecated.
- Historical only.
- Rejected.
- Replaced by source ID.
- Pending retirement review.

## Retirement Requirements

When a source is retired, registry must preserve:

- Retirement date.
- Retirement reason.
- Replacement source.
- Impacted products.
- Impacted rule families.
- Whether historical use remains valid.
- Human reviewer, if applicable.

## Rule Impact Review

Every retired source should trigger review of rules derived from it:

- Rules remain active if replacement source confirms them.
- Rules become historical if tied only to old source.
- Rules become invalid if contradicted by replacement.
- Rules require human review if replacement is ambiguous.

## Historical Rule Handling

Historical rules can remain available for:

- Claims/events from historical effective period.
- Audit.
- Product evolution research.

They must be blocked for current evaluation unless the policy/event date
requires the historical version.

## Zombie Rule Prevention

Forge must never use:

- A replaced manual for current coverage when active conditions differ.
- An old hospital directory for current hospital classification.
- An expired pharmacy list for current medication coinsurance.
- A deprecated product document for a new policy.
- A source with unknown status if stronger current source exists.

## Retirement Output

For any retired source, registry should answer:

- Is this usable historically?
- What replaced it?
- Which rules are impacted?
- Can it be used for current evaluation?
- Does conflict require human review?
