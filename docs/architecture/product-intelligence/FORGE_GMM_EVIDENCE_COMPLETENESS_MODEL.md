# Forge GMM Evidence Completeness Model

Status: PRE-IMPLEMENTATION / FINAL PRE-ENGINE DISCOVERY

## Purpose

Define levels of evidence completeness and what Forge may say at each level.

## Level 0: No Evidence

Definition:

The user asks a coverage question without enough facts to route the situation.

Typical evidence:

- "Would GMM cover this?"
- No product.
- No event.
- No policy.

Allowed output:

- Educational explanation.
- One next question.

Not allowed:

- Conditional assessment.
- Likely covered/not covered.

## Level 1: Routing Evidence

Definition:

Forge can identify product/event direction but cannot evaluate.

Required:

- Product or product uncertainty.
- Event description.
- Insured identity or relationship.
- Approximate date/location.

Allowed output:

- Event-family routing.
- Missing evidence list.
- Next most valuable question.

Not allowed:

- Case-specific coverage assessment.

## Level 2: Conditional Assessment Evidence

Definition:

Forge can identify the rule path and provide conditional reasoning.

Required:

- Product confirmed.
- Policy/caratula context known or explicitly missing.
- Event family.
- Key dates.
- Basic insured eligibility.
- Territory.
- No unresolved hard stop that blocks all assessment.

Allowed output:

- Conditional assessment.
- Human review warning if soft gate exists.
- Missing evidence needed for Level 3.

Not allowed:

- Likely covered/not covered unless Level 3 threshold met.
- Financial estimate.

## Level 3: Likely Covered / Likely Not Covered Evidence

Definition:

Forge has enough evidence to use cautious "likely" language, without deciding
the claim.

Required:

- Product confirmed by authoritative source.
- Active policy/caratula.
- Insured eligibility confirmed.
- Event family and diagnosis confirmed.
- Key date sequence supports timing.
- Waiting period evaluated.
- Exclusion screen evaluated.
- Preexistence screen negative/resolved.
- Optional coverage confirmed if needed.
- Authorization/documentation satisfied or not required.
- No hard human review gate open.

Allowed output:

- Likely covered.
- Likely not covered.
- Subject to insurer review and documentation.

Not allowed:

- Approved.
- Denied.
- Guaranteed.

## Level 4: Financial Responsibility Evidence

Definition:

Forge has enough financial and operational evidence to explain possible client
financial responsibility.

Required:

- All Level 3 evidence, or a clearly labeled financial-only educational path.
- Deductible amount/type.
- Coinsurance percentage/type.
- Coinsurance cap.
- Plan/zone.
- Hospital level contracted and used.
- Provider agreement status.
- Applicable catalog/tabulator.
- Pharmacy path if medication.
- Receipts/invoices or estimates clearly labeled.

Allowed output:

- Financial responsibility explanation.
- Missing financial evidence list.

Not allowed:

- Out-of-pocket calculation unless a future approved engine exists.
- Treating financial estimate as coverage approval.

## Model Boundary

Level 4 is not "more covered" than Level 3.

Level 4 only means Forge has enough financial context to discuss client
responsibility separately.
