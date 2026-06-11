# Forge GMM Document Priority Model

Status: PRE-IMPLEMENTATION / FINAL PRE-ENGINE DISCOVERY

## Purpose

Define preferred acquisition order for GMM evidence.

## Universal Priority Order

```text
1. Caratula / policy-specific document
2. Active Condiciones Generales / product source
3. Endorsement / optional coverage document
4. Medical diagnosis / clinical note
5. Key date evidence
6. Coverage continuity evidence
7. Authorization / Event Programmed / second valuation
8. Operational catalog / hospital / pharmacy / provider directory
9. Invoice / receipt / estimate
10. Advisor/client summary
```

## Priority Rules

### Caratula Before Hospital Invoice

Reason:

Invoice tells what was charged. Caratula tells what policy context applies.

### Diagnosis Before Financial Estimate

Reason:

Forge must know what medical event is being evaluated before discussing
financial impact.

### Coverage Continuity Before Benefit Calculation

Reason:

Many benefits depend on waiting periods or continuous coverage.

### Optional Coverage Before Foreign Analysis

Reason:

Foreign benefits are not assumed from generic GMM coverage.

### Authorization Before High-Specialty Assessment

Reason:

Several high-specialty treatments require prior authorization, second valuation
or provider certification.

### Catalog Before Financial Responsibility

Reason:

Financial responsibility may depend on tabulator, hospital level, provider
status and usual/reasonable values.

## Event-Specific Priority Examples

Maternity:

1. Caratula.
2. Coverage continuity.
3. Expected birth/birth date.
4. Assisted reproduction status.
5. Clinical history/birth documentation.

Accident:

1. Accident date.
2. First attention/expense date.
3. Cause/activity context.
4. Medical diagnosis.
5. Caratula financial values.

Foreign care:

1. Caratula optional coverage.
2. Country/location and care date.
3. Programmed/urgent status.
4. Stay duration/residence proof.
5. Foreign medical records.

High-specialty:

1. Diagnosis.
2. Treatment name.
3. Authorization.
4. Second valuation.
5. Provider certification.

## Boundary

Document priority is not source authority hierarchy.

Priority asks:

"What should Forge ask for next?"

Authority asks:

"Which source wins when documents conflict?"
