# Forge GMM Rule Evaluation Architecture

Status: BLUEPRINT / PRE-IMPLEMENTATION

## Purpose

Define how Forge chooses and sequences applicable GMM rule families.

## Rule Families

- Product rules.
- Coverage rules.
- Exclusion rules.
- Waiting period rules.
- Preexistence rules.
- Territory rules.
- Optional coverage rules.
- Authorization rules.
- Documentation rules.
- Financial participation rules.
- Human review rules.

## Evaluation Sequence

```text
Product Rules
↓
Policy Context Rules
↓
Event Family Rules
↓
Coverage Candidate Rules
↓
Exclusion Rules
↓
Waiting Period Rules
↓
Preexistence Rules
↓
Territory / Optional Coverage Rules
↓
Authorization / Documentation Rules
↓
Human Review Rules
↓
Financial Participation Boundary
↓
Assessment Language Rules
```

## Sequence Rationale

Product first:

Wrong product route creates wrong rules.

Coverage candidate before exclusions:

Forge first asks whether a benefit path exists, then whether something blocks
it.

Exclusions before timing:

If a situation is excluded, waiting period satisfaction may not matter.

Waiting before preexistence:

Timing determines initial eligibility, while preexistence determines whether
the condition may be outside coverage despite timing.

Human review before language:

Hard gates override the desire to answer.

Financial after coverage:

Client financial responsibility is separate from likely coverage.

## Rule Selection by Event Family

Accident:

- Coverage.
- Accident.
- Exclusions.
- Waiting/day-one.
- Financial.
- Human review.

Illness:

- Coverage.
- Waiting.
- Preexistence.
- Exclusions.
- Financial.

Maternity:

- Maternity.
- Waiting/continuity.
- Documentation.
- Financial.
- Human review.

Foreign:

- Territory.
- Optional coverage.
- Foreign financial boundary.
- Authorization/documentation.
- Human review.

High-specialty:

- Coverage candidate.
- Authorization.
- Medical evidence.
- Human review.
- Financial boundary.

## Rule Evaluation Boundary

This architecture selects and sequences rules. It does not implement rule logic
or calculate outputs.
