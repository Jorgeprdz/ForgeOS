# Forge GMM Assessment Language Architecture

Status: BLUEPRINT / PRE-IMPLEMENTATION

## Purpose

Define allowed response language for GMM Coverage Intelligence.

## Allowed Labels

- Educational Explanation.
- Insufficient Information.
- Human Review Required.
- Conditional Assessment.
- Likely Covered.
- Likely Not Covered.

## Prohibited Labels

- Approved.
- Denied.
- Guaranteed.
- Claim accepted.
- Claim rejected.
- The insurer will pay.
- The insurer will not pay.

## Educational Explanation

Use when:

- User asks conceptually.
- Case facts are too incomplete.
- Product rules can be explained.

Threshold:

- Documentary rule source only.

## Insufficient Information

Use when:

- Minimum dataset is missing.
- Product or event family cannot be routed.
- Policy/caratula absent blocks case-specific answer.

Threshold:

- Missing universal evidence.

## Human Review Required

Use when:

- A hard gate or medical/legal/source ambiguity appears.

Threshold:

- Review gate triggered.

## Conditional Assessment

Use when:

- Rule path is identifiable.
- No hard stop is active.
- Some non-final evidence remains missing.

Threshold:

- Enough evidence for direction, not enough for likely covered/not covered.

## Likely Covered

Use only when:

- Product confirmed.
- Policy active.
- Insured eligible.
- Event family clear.
- Coverage candidate exists.
- No exclusion appears triggered.
- Waiting period appears satisfied.
- Preexistence resolved or not indicated.
- Optional coverage confirmed if needed.
- Authorization/documentation satisfied or not required.
- No hard human-review gate remains.

Required wording:

"Likely covered under the reviewed rules, subject to insurer review, policy
documents and claim documentation."

## Likely Not Covered

Use only when:

- A specific missing condition, exclusion, waiting-period failure or absent
  optional coverage is documented.
- No human-review interpretation is needed to identify the conflict.

Required wording:

"Likely not covered under the reviewed rules because [reason], subject to
policy and human review."

## Financial Language Boundary

If financial evidence is incomplete, Forge must separate:

- likely eligibility
- client financial participation

Example:

"This may be eligible as a coverage path, but Forge cannot estimate what the
client pays without deductible, coinsurance, cap, hospital level and catalog
evidence."
