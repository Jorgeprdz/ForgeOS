# Alfa Medical Forge Coverage Intelligence Foundation

Status: DISCOVERY ONLY

This document identifies the minimum information Forge would need to answer:
"Would this event likely be covered?" without inventing information.

No engine or schema is approved by this document.

## Required Inputs

### Product Identity

Forge must know:

- Product name: Alfa Medical.
- Product version / Condiciones Generales version.
- Whether policy is individual/family and within Alfa Medical, not Flex.
- Optional coverages contracted.

Why:

Alfa Medical has a distinct classic deductible/coinsurance/cap model.

### Policy and Insured Context

Forge must know:

- Policy active status.
- Insured identity.
- Insured age.
- Residence.
- Coverage start date.
- Continuous coverage history.
- Recognized antiquity if applicable.
- Policy caratula values.

Why:

Age, residence and continuity affect maternity, fetal surgery, declared
preexistence, waiting periods and foreign benefits.

### Event Context

Forge must know:

- Event type: accident, illness, maternity, childbirth/cesarean,
  complication, urgent event, foreign event, dental event, optional benefit.
- Date of first symptoms.
- Date of diagnosis.
- Date of first medical expense.
- Cause.
- Territory.
- Whether event is ongoing, complement or new claim.
- Whether event was preexisting or suspected preexisting.

Why:

Waiting periods and accident treatment depend on timing and cause.

### Medical Evidence

Forge must know:

- Diagnosis.
- Treating physician.
- Prescription or medical order.
- Medical necessity evidence.
- Clinical file where required.
- Diagnostic studies.
- Specialist certification where required.
- Second medical opinion or second valuation when required.

Why:

Many Alfa Medical benefits require more than a bill.

### Financial and Plan Context

Forge must know:

- Sum insured.
- Deductible amount and type.
- Coinsurance percentage and type.
- Coinsurance cap.
- Plan.
- Zone.
- Hospital level contracted.
- Hospital level used.
- Tabulator / honorarium catalog.
- Gasto Usual, Razonable y Acostumbrado.
- Medication pharmacy path.

Why:

Coverage likely/procedent analysis is incomplete without client responsibility
and limits.

### Authorization Context

Forge must know:

- Was event programmed?
- Was prior authorization required?
- Was authorization obtained?
- Was notice given in time?
- Was assistance channel used where required?

Why:

Foreign care, fetal surgery, genomic studies, gene therapies, orphan drugs,
ECMO, ambulance, dental and other benefits can depend on authorization or
service-channel rules.

## Coverage Decision Questions

Forge should ask these in order:

1. Is the event an accident, illness, maternity event or defined benefit?
2. Is the policy active for the insured?
3. Is the event within territory or optional foreign benefit?
4. Is the event expressly excluded?
5. Does the event have a waiting period?
6. Has the waiting period been satisfied?
7. Is there preexistence risk?
8. Is medical necessity documented?
9. Are required authorizations/documentation present?
10. Are the expenses procedent under catalog/usual/reasonable rules?
11. What client financial responsibility remains?

## Output Boundary

Forge should not output:

- "Covered" as absolute unless documentary and policy evidence are complete.
- Numeric out-of-pocket values without caratula, catalog and event facts.
- Claims certainty from generic product knowledge.

Forge may output:

- Likely covered, with missing evidence list.
- Conditional, with decision blockers.
- Likely excluded, with source category.
- Unknown, with required source or human-review need.

## Required Provenance

Every coverage answer should preserve:

- Source document.
- Section or clause.
- Policy version.
- Caratula dependency.
- Confidence level.
- Unknowns.
- Human review flag if ambiguous.

## Human Review Triggers

Trigger human review when:

- Preexistence is disputed.
- Waiting period depends on first symptom vs first expense ambiguity.
- Event involves alcohol, drugs, professional sport, dangerous activity or
  intentional conduct.
- Treatment is high-specialty or experimental-adjacent.
- Foreign coverage is involved.
- Optional coverage status is uncertain.
- Hospital classification has changed.
- Caratula or endorsement conflicts with general conditions.
