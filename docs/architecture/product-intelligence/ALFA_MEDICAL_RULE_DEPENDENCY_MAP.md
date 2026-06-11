# Alfa Medical Rule Dependency Map

Status: ARCHITECTURE DISCOVERY

## Purpose

Define the dependency order among Alfa Medical rule families before any future
Coverage Intelligence Engine is considered.

## Master Dependency Order

```text
Product Identity
↓
Policy / Caratula Context
↓
Insured Eligibility
↓
Event Family Detection
↓
Territory / Optional Coverage Routing
↓
Coverage Rule Candidate
↓
Exclusion Screen
↓
Waiting Period Screen
↓
Preexistence Screen
↓
Documentation Requirement
↓
Authorization Requirement
↓
Human Review Gate
↓
Financial Participation Boundary
↓
Coverage Assessment Language
```

## Why This Order

### 1. Product Identity Before Everything

Forge must know whether this is Alfa Medical or Alfa Medical Flex.

Reason:

Alfa Medical uses deductible, coinsurance and cap. Flex uses a different
financial structure.

If missing:

Human review or product clarification.

### 2. Policy / Caratula Before Case Evaluation

Coverage truth depends on caratula values:

- Territory.
- Sum insured.
- Deductible.
- Coinsurance.
- Cap.
- Hospital level.
- Optional coverages.
- Plan/zone/tabulator.

If missing:

Educational explanation only or insufficient information.

### 3. Insured Eligibility Before Event Rules

Some benefits are insured-specific:

- Mother eligibility.
- Newborn inclusion.
- Age ranges.
- Residence.
- Coverage start date.

If missing:

Do not evaluate benefit-specific coverage.

### 4. Event Family Before Rule Selection

Forge cannot choose rules until it knows whether the situation is:

- Accident.
- Illness.
- Maternity.
- Newborn.
- Foreign.
- High-specialty treatment.
- Dental.
- Medication.
- Assistance.

If missing:

Ask one event-family question.

### 5. Territory / Optional Coverage Before Foreign Evaluation

Foreign events must not route through national assumptions.

If foreign:

Check optional coverage before any "likely covered" language.

### 6. Coverage Rule Candidate Before Exclusion

First determine whether the event resembles a covered benefit. Then test
whether exclusions override it.

Example:

A dental treatment can look medical, but dental illness treatment is excluded
unless it fits Dental Basic or accident dental conditions.

### 7. Exclusion Screen Before Waiting Period Certainty

If an event is expressly excluded, waiting period satisfaction does not rescue
it unless a specific exception exists.

### 8. Waiting Period Before Preexistence Finalization

Waiting period asks:

"Has enough covered time passed?"

Preexistence asks:

"Did this exist before coverage started?"

Both are needed, but waiting period can quickly identify many incomplete
eligibility paths.

### 9. Preexistence Before Authorization

Authorization for a treatment does not solve preexistence. If preexistence is
ambiguous, Forge must stop.

### 10. Documentation Before Authorization Completion

Authorization and claim procedence require evidence:

- Clinical file.
- Studies.
- Receipts.
- Prescriptions.
- Notices.

### 11. Human Review Before Assessment Language

If any hard human-review gate is triggered, Forge must not say likely covered
or likely not covered.

### 12. Financial Participation After Coverage Eligibility

Financial participation is not the same as coverage eligibility.

Forge should not calculate client responsibility before coverage path is
plausible and caratula/catalog facts exist.

## Dependency Exceptions

Some gates can occur earlier:

- Product uncertainty is immediate hard stop.
- Foreign care without optional coverage proof is early hard stop.
- High-specialty treatment without authorization is early human-review gate.
- Missing caratula blocks financial certainty at all stages.

## Conceptual Dependency Diagram by Rule Family

```text
Coverage Rules
├── require Product Identity
├── require Policy Active
├── require Event Family
├── depend on Exclusion Screen
├── depend on Waiting Period Screen
├── depend on Preexistence Screen
└── may depend on Authorization

Waiting Period Rules
├── require Coverage Start / Continuity
├── require Event Dates
├── require Diagnosis
└── may depend on Recognition of Antiquity

Preexistence Rules
├── require Medical History
├── require Diagnosis / Symptom / Expense Dates
├── require Application Declaration
└── trigger Human Review when ambiguous

Foreign Rules
├── require Territory
├── require Optional Coverage
├── require Programmed Status
├── require Stay Duration
└── trigger Human Review frequently

Authorization Rules
├── require Treatment Type
├── require Authorization Evidence
├── require Second Valuation when applicable
└── require Provider Certification when applicable

Financial Rules
├── require Caratula
├── require Plan / Zone / Catalog
├── require Hospital / Pharmacy Path
└── must not be final without coverage path
```

## Final Architecture Verdict

The correct dependency order is not:

```text
Coverage -> Financial Calculation
```

It is:

```text
Evidence -> Routing -> Eligibility -> Exclusions -> Timing -> Preexistence
-> Authorization -> Human Review -> Financial Boundary -> Assessment
```
