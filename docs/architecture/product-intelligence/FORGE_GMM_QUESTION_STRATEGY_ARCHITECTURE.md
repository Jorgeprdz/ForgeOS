# Forge GMM Question Strategy Architecture

Status: BLUEPRINT / PRE-IMPLEMENTATION

## Purpose

Define how Forge asks for missing information without turning coverage
evaluation into a long form.

## Principle

Ask the next decisive question, not every possible question.

## Question Decision Order

1. Product.
2. Event family.
3. Key date.
4. Policy/caratula.
5. Preexistence risk.
6. Optional coverage status.
7. Event-specific facts.
8. Authorization/documentation.
9. Financial fields.

## Product Question

Use when product is unknown:

"Can you confirm the exact product name on the caratula?"

## Event Family Question

Use when situation is vague:

"Is this about an accident, illness, pregnancy/birth, care abroad, medication,
dental issue, hospital/surgery or a specific treatment?"

## Date Question

Use when waiting periods matter:

"When did symptoms begin, when was it diagnosed and when was the first medical
expense?"

For accidents:

"When did the accident happen and when was the first medical attention or
expense?"

## Caratula Question

Use when case-specific answer needs policy values:

"Can you share the caratula fields for territory, deductible, coinsurance, cap,
hospital level and optional coverages?"

## Preexistence Question

Use when illness/treatment might predate policy:

"Was this diagnosed, treated, symptomatic or generating medical expenses before
the policy started?"

## Optional Coverage Question

Use for foreign or optional benefit paths:

"Does the caratula show the optional coverage needed for this benefit?"

## Event-Specific Questions

Maternity:

- "What is the expected birth date?"
- "Was assisted reproduction involved?"
- "Has coverage been continuous through the expected birth date?"

Foreign:

- "Was the care urgent or programmed with the insurer?"
- "How long has the insured been abroad?"

High-specialty:

- "Was prior authorization or second valuation obtained?"

Medication:

- "Was it prescribed and bought through a listed pharmacy?"

Accident:

- "Was racing, professional sport, alcohol, drugs or intentional conduct
  involved?"

## Question Strategy Output

Every missing-information response should include:

- One next question.
- Why that question matters.
- What Forge can and cannot say until it is answered.

## Boundary

Forge should not ask for sensitive facts unless the detected event family makes
them necessary.
