# Alfa Medical Confidence Boundaries

Status: ARCHITECTURE DISCOVERY

No probabilities. No scores. No claims decisions.

## Purpose

Define when Forge may use coverage assessment language for Alfa Medical.

## Allowed Assessment Labels

- Educational Explanation Only.
- Insufficient Information.
- Human Review Required.
- Conditional Assessment.
- Likely Covered.
- Likely Not Covered.

Forge must not use:

- Approved.
- Denied.
- Guaranteed.
- The insurer will pay.
- The insurer will not pay.
- Claim decision.

## Educational Explanation Only

Use when:

- Product rules can be explained generally.
- Case-specific policy/caratula is missing.
- Event family is not clear.
- User asks conceptually, not case-specifically.

Evidence threshold:

- Product rule source only.

Example:

"In Alfa Medical, childbirth coverage generally depends on mother age,
coverage continuity, policy year, territory, documentation and deductible
type."

## Insufficient Information

Use when:

- Forge cannot identify product.
- Forge cannot classify event family.
- Key dates are missing.
- Policy/caratula is unavailable.
- Diagnosis/event description is too vague.

Evidence threshold:

- Missing universal minimum dataset.

Example:

"Insufficient information. I need to know whether this is Alfa Medical, what
happened medically, when it happened and whether the policy caratula confirms
the relevant coverage."

## Human Review Required

Use when:

- Preexistence is possible or disputed.
- Date sequence conflicts.
- Foreign coverage depends on optional benefit or programmed status.
- High-specialty treatment requires medical appropriateness.
- Alcohol/drug/intentional conduct may apply.
- Professional sport/racing/dangerous activity is unclear.
- Source documents conflict.

Evidence threshold:

- Human-review gate triggered.

Example:

"Human review required because the first symptom date may predate coverage.
Forge should not classify this as likely covered or likely not covered without
medical and policy review."

## Conditional Assessment

Use when:

- Universal minimum dataset exists.
- Event family is clear.
- No hard stop is triggered.
- Some supporting facts are present.
- One or more non-critical facts remain missing.

Evidence threshold:

- Enough to identify the relevant rule path.
- Not enough for likely covered/not covered.

Example:

"Conditionally, this routes to maternity year 4+ rules, but the answer depends
on caratula maternity benefit, deductible type, territory and documentation."

## Likely Covered

Use only when:

- Product is confirmed as Alfa Medical.
- Policy is active.
- Insured is eligible.
- Event family is clear.
- Diagnosis/event matches a covered rule.
- Key date sequence supports timing.
- Waiting period appears satisfied.
- Preexistence screen is negative or resolved.
- No exclusion appears triggered.
- Required optional coverage is confirmed.
- Required authorization/documentation exists or is not required.
- No hard human-review gate remains open.

Required wording:

"Likely covered under the reviewed rules, subject to insurer review, policy
caratula, documentation and claim process."

Never say:

"Covered."

## Likely Not Covered

Use only when:

- Product is confirmed.
- Event family is clear.
- A specific exclusion, missing waiting period, missing optional coverage or
  failed required condition is identified.
- Source is specific and not contradicted by caratula/endorsement.
- No human review is required to classify the rule conflict.

Required wording:

"Likely not covered under the reviewed rules because [specific rule], subject
to human/policy review."

Never say:

"Denied."

## Financial Confidence Boundary

Forge may discuss client responsibility only when:

- Deductible amount/type is known.
- Coinsurance percentage/type is known.
- Cap is known.
- Hospital level and hospital used are known.
- Plan/zone/tabulator/catalog are available.
- Medication pharmacy path is known if medication involved.

If missing:

Forge may say:

"Coverage may still exist, but client financial responsibility cannot be
estimated from the available evidence."

## Final Boundary

Coverage confidence is not emotional confidence. It is documentary evidence
sufficiency.
