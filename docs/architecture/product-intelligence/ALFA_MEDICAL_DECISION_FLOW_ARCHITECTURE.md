# Alfa Medical Decision Flow Architecture

Status: ARCHITECTURE DISCOVERY

No implementation. No code. No engines. No schemas. No UI.

## Purpose

Design the conceptual flow Forge should follow before answering:

"Would Alfa Medical likely cover this situation?"

This is not engine logic. It is reasoning architecture.

## Master Flow

```text
User Situation
↓
Product Confirmation
↓
Policy / Caratula Availability
↓
Insured Context
↓
Event Family Classification
↓
Universal Evidence Check
↓
Event-Specific Minimum Dataset
↓
Coverage Candidate Match
↓
Exclusion Screen
↓
Waiting Period Screen
↓
Preexistence Screen
↓
Territory / Optional Coverage Screen
↓
Authorization / Documentation Screen
↓
Human Review Gate
↓
Financial Participation Boundary
↓
Assessment Language Selection
```

## Stage 1: Product Confirmation

Question:

Is this Alfa Medical?

Required evidence:

- Product name from caratula, quote or policy document.

Stop if:

- Product is unknown.
- Product could be Alfa Medical Flex.

Allowed output if missing:

"I need to confirm the exact product because Alfa Medical and Alfa Medical Flex
use different rule models."

## Stage 2: Policy / Caratula Availability

Question:

Do we have the policy facts needed for evaluation?

Required evidence:

- Policy active status.
- Caratula.
- Optional coverages.
- Financial values.
- Territory.

Stop or downgrade if:

- Caratula missing.

Allowed output:

Educational explanation or conditional assessment without financial certainty.

## Stage 3: Insured Context

Question:

Is this insured eligible for the relevant benefit?

Required evidence:

- Insured identity.
- Age/sex where relevant.
- Residence.
- Coverage continuity.

Stop if:

- Benefit eligibility depends on missing insured facts.

## Stage 4: Event Family Classification

Question:

What kind of event is this?

Possible families:

- Accident.
- Illness.
- Maternity.
- Pregnancy complication.
- Newborn.
- Assisted reproduction maternity.
- Foreign care.
- Catastrophic disease abroad.
- Dental.
- Medication.
- High-specialty treatment.
- Hospitalization/surgery.
- Assistance service.

Stop if:

- Event cannot be classified.

## Stage 5: Universal Evidence Check

Question:

Do we have enough to begin?

Required:

- Product.
- Policy/caratula availability.
- Insured.
- Event family.
- Diagnosis/event description.
- Key dates.
- Territory.
- Preexistence indicator.

If missing:

Ask the next smallest question.

## Stage 6: Event-Specific Minimum Dataset

Question:

What does this event family require?

Examples:

- Accident requires accident date, first expense, cause and exclusion-sensitive
  facts.
- Maternity requires age, continuity, birth date, policy year and assisted
  reproduction status.
- Foreign care requires optional coverage and programmed status.
- High-specialty treatment requires authorization and second valuation.

## Stage 7: Coverage Candidate Match

Question:

Does the event resemble a named or general covered benefit?

Examples:

- Hospitalization for covered illness.
- Acute appendicitis.
- Maternity.
- Accident dental.
- ECMO.
- Genomic study.

If no candidate:

Move to likely not covered only if a clear exclusion or absence of benefit is
documented. Otherwise insufficient information.

## Stage 8: Exclusion Screen

Question:

Does any general or particular exclusion apply?

Examples:

- Cosmetic treatment.
- Preventive checkup.
- Psychiatric/psychological treatment.
- Preexisting condition.
- Alcohol/drug accident.
- Professional racing/contest.
- Experimental treatment.

If exclusion clearly applies:

Potential "likely not covered" with source.

If exclusion facts are ambiguous:

Human review required.

## Stage 9: Waiting Period Screen

Question:

Has the required continuous coverage time passed?

Examples:

- Day-one accident.
- Day-one listed illness.
- 30-day default illness.
- Third-year conditions.
- 10-month maternity.
- 24-month fetal surgery.
- Sixth-year bariatric surgery.

If date sequence is ambiguous:

Human review required.

## Stage 10: Preexistence Screen

Question:

Did the condition exist before coverage?

Evidence:

- Prior diagnosis.
- Prior medical records.
- Prior studies.
- Prior expenses.
- Application declaration.

If plausible:

Human review required.

## Stage 11: Territory / Optional Coverage Screen

Question:

Did the event occur in the covered territory or under a verified optional
foreign benefit?

If foreign and optional coverage is not confirmed:

Hard stop.

## Stage 12: Authorization / Documentation Screen

Question:

Does the benefit require prior authorization, second valuation, assistance
channel or special documentation?

If required and missing:

Human review or conditional assessment only.

## Stage 13: Human Review Gate

Question:

Is any hard review gate open?

If yes:

Do not use likely covered/not covered unless the likely not covered result is a
simple missing optional coverage or clearly documented exclusion with no
interpretive ambiguity.

## Stage 14: Financial Participation Boundary

Question:

Can Forge responsibly discuss client cost?

Required:

- Deductible.
- Coinsurance.
- Cap.
- Plan/zone/tabulator.
- Hospital level.
- Catalogs.

If missing:

Separate coverage eligibility from financial participation.

## Stage 15: Assessment Language Selection

Select:

- Educational Explanation Only.
- Insufficient Information.
- Human Review Required.
- Conditional Assessment.
- Likely Covered.
- Likely Not Covered.

## Final Question Walkthrough

User asks:

"My wife has had Alfa Medical for 4 years. She is pregnant. She is 33 years
old. Would childbirth be covered?"

### Stage 1: Product Confirmation

Input:

- "Alfa Medical."

Result:

- Product family routes to Alfa Medical classic GMM rules.

Open issue:

- Need confirmation from caratula/policy, not only user statement, for
  case-specific confidence.

### Stage 2: Policy / Caratula Availability

Input:

- User says she has had Alfa Medical for 4 years.

Missing:

- Caratula.
- Policy active status.
- Maternity benefit sum insured.
- Deductible type.
- Territory.
- Optional/endosement facts.

Result:

- Conditional assessment possible.
- Financial certainty not possible.

### Stage 3: Insured Context

Input:

- Wife is insured, apparently female, age 33.

Result:

- Age fits basic maternity age range of 15 to 44.

Missing:

- Confirm she is an insured under the policy.

### Stage 4: Event Family

Input:

- Pregnant / childbirth.

Result:

- Event family: Maternity.

### Stage 5: Universal Evidence

Present:

- Product stated.
- Event family.
- Age.
- Coverage duration stated.

Missing:

- Birth date or expected birth date.
- Policy active status.
- Caratula.
- Territory.
- Assisted reproduction status.
- Documentation.

### Stage 6: Maternity Minimum Dataset

Required for maternity:

- Mother age.
- Coverage continuity at birth.
- Birth date.
- Policy year.
- Territory 10 months before birth.
- Assisted reproduction status.
- Maternity benefit sum insured.
- Deductible type.
- Clinical history and birth documentation.

Present:

- Age 33.
- Stated 4 years of coverage.

Missing:

- Expected birth date.
- Confirmation that 4 years will still be continuous at birth.
- Assisted reproduction status.
- Deductible type.
- Caratula values.

### Stage 7: Coverage Candidate Match

Rule path:

- Maternity benefit.
- Because policy has 4 years, likely routes to maternity year 4+ behavior if
  continuity is verified.

### Stage 8: Exclusion Screen

Known:

- No exclusion stated.

Unknown:

- Assisted reproduction status.
- Deducible en Exceso status.

Result:

- Cannot clear exclusion/particular condition screen.

### Stage 9: Waiting Period / Continuity

Known:

- User says 4 years.

Rule:

- Maternity requires at least 10 months continuous coverage at birth.

Result:

- Appears satisfied if the 4 years are continuous and policy remains active
  through birth.

### Stage 10: Preexistence

Not central for ordinary childbirth, but pregnancy timing and assisted
reproduction status matter.

Result:

- No preexistence conclusion needed from current facts, but maternity-specific
  dates still required.

### Stage 11: Territory

Missing:

- Where childbirth will occur and territory in caratula.

Result:

- Cannot finalize.

### Stage 12: Authorization / Documentation

Missing:

- Clinical history.
- Birth certificate after birth or eligible prenatal documentation if advance
  payment.

Result:

- Documentation requirements remain open.

### Stage 13: Human Review Gate

Triggered:

- AM-HR-002: caratula values missing.
- AM-HR-012: maternity dates/assisted reproduction status unclear.

Gate type:

- Conditional assessment only.

### Stage 14: Financial Boundary

Missing:

- Deductible.
- Coinsurance.
- Maternity benefit sum.

Result:

- No cost/payment estimate.

### Stage 15: Proper Forge Answer

Forge should answer:

"Conditionally, this appears to route to Alfa Medical maternity rules for year
4 or later, because she is 33 and you state she has had Alfa Medical for 4
years. To say more responsibly, Forge still needs the caratula, confirmation
that coverage has been continuous through the birth date, the expected birth
date, territory, deductible type and whether the pregnancy was through assisted
reproduction. If those check out, childbirth may be eligible under the
maternity benefit, subject to policy limits, documentation and insurer review."

Forge must not answer:

"Yes, it is covered."

## Final Architecture Verdict

Forge should reason like a coverage analyst, not a claims adjuster and not a
calculator. The correct outcome is often not an answer; it is the smallest next
evidence request.
