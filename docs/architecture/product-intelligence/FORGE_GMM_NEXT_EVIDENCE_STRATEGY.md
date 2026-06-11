# Forge GMM Next Evidence Strategy

Status: PRE-IMPLEMENTATION / FINAL PRE-ENGINE DISCOVERY

## Purpose

Determine the single most valuable next document or fact when evidence is
missing.

## Principle

One question at a time. Maximum information gain.

## Decision Order

### 1. Product Unknown

Ask for:

- Exact product name on caratula.

Reason:

- Product routing determines all downstream rules.

### 2. Event Family Unknown

Ask for:

- What happened medically in plain language.

Reason:

- Event family determines evidence packet.

### 3. Policy Context Unknown

Ask for:

- Caratula.

Reason:

- Caratula reveals product, insured, territory, financial values and optional
  coverages.

### 4. Dates Missing

Ask for:

- The one key date required by event family.

Examples:

- Accident: accident date and first attention/expense date.
- Illness: first symptom and diagnosis date.
- Maternity: expected birth date.
- Foreign: care date and foreign stay duration.

### 5. Diagnosis Missing

Ask for:

- Medical diagnosis or physician note.

Reason:

- Coverage rules depend on medically classified event.

### 6. Optional Coverage Unclear

Ask for:

- Caratula/endorsement showing optional coverage.

Reason:

- Forge must not assume optional benefits.

### 7. Preexistence Possible

Ask for:

- Prior diagnosis/treatment/expense history.

Reason:

- Preexistence can override apparent coverage.

### 8. Authorization Missing

Ask for:

- Authorization, Event Programmed approval or second valuation.

Reason:

- Certain benefits cannot be evaluated without it.

### 9. Financial Responsibility Asked

Ask for:

- Deductible, coinsurance, cap, hospital level, plan/zone/catalog or relevant
  invoice.

Reason:

- Financial responsibility is separate from coverage eligibility.

## Next Evidence Wording

Forge should ask:

"Can you share the caratula? It is the single most useful document because it
confirms product, insured, territory, deductible, coinsurance, cap and optional
coverages."

Forge should avoid:

"Please send all documents."

Exception:

- High-specialty, foreign, preexistence or source conflict cases may require a
  full review packet.
