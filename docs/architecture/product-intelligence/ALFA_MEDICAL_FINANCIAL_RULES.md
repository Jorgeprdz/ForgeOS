# Alfa Medical Financial Participation Rules

Status: DISCOVERY ONLY

## AM-FIN-001

Description: Claim reimbursement requires procedent expenses to exceed the
deductible.

Required Inputs:
- Procedent expenses.
- Deductible amount.
- Deductible type.

Conditions:
- Total procedent expenses must exceed contracted deductible before indemnity
  can be claimed.

Exceptions:
- Specific benefits without deductible.

Unknowns:
- Exact deductible from caratula.

Source:
- Alfa Medical Nuevos, IX. Bases; IX.1.A.

## AM-FIN-002

Description: Deducible Unico applies once at the beginning of each covered
accident or illness.

Required Inputs:
- Deductible type.
- Claim event.
- Caratula deductible.

Conditions:
- Applies one time at start of each covered accident or illness.

Exceptions:
- Age-driven annual deductible behavior may apply for insureds age 60+.

Unknowns:
- Caratula wording.

Source:
- Alfa Medical Nuevos, IX.1.B.

## AM-FIN-003

Description: Deducible Anual applies annually for complements after renewal.

Required Inputs:
- Deductible type.
- Renewal period.
- Claim complement status.
- Deductible basic/exceso status.

Conditions:
- Applies from next vigency for complements of each covered claim after
  procedent expenses exceeded contracted deductible.
- Different amount logic for Deducible Basico vs Deducible en Exceso.

Exceptions:
- Product/version changes require source review.

Unknowns:
- Current UDI value when Deducible en Exceso applies.

Source:
- Alfa Medical Nuevos, IX.1.B.

## AM-FIN-004

Description: Deducible Reinstalable reinstates by claim at each renewal.

Required Inputs:
- Deductible type.
- Renewal date.
- Ongoing claim.
- Caratula deductible at expense date.

Conditions:
- Applies by claim in each renewal when insured continues incurring covered
  medical expenses related to covered accident or illness.

Exceptions:
- Depends on policy continuation.

Unknowns:
- Complement/new claim boundary.

Source:
- Alfa Medical Nuevos, IX.1.B.

## AM-FIN-005

Description: Deducible Basico and Deducible en Exceso are separate categories.

Required Inputs:
- Deductible amount.
- Caratula.

Conditions:
- Deductibles below the stated threshold are Basico.
- Deductibles equal or above the stated threshold are en Exceso.

Exceptions:
- Future version changes.

Unknowns:
- Whether threshold changes by version.

Source:
- Alfa Medical Nuevos, II definitions; IX.1.A.

## AM-FIN-006

Description: Coinsurance applies after deductible.

Required Inputs:
- Procedent expenses.
- Deductible applied.
- Coinsurance percentage.

Conditions:
- Insured participates with caratula coinsurance percentage after deductible.

Exceptions:
- Specific benefits without coinsurance.
- Foreign care and medication rules can differ.

Unknowns:
- Caratula percentage.

Source:
- Alfa Medical Nuevos, II Coaseguro; IX.1.C.

## AM-FIN-007

Description: Coaseguro Unico applies once per covered claim up to cap.

Required Inputs:
- Coinsurance type.
- Claim identity.
- Coinsurance cap.

Conditions:
- Applies once to a covered claim and its complements.
- Does not exceed caratula cap under ordinary rule.

Exceptions:
- Hospital-level adjustment or other special conditions may alter cap behavior.

Unknowns:
- Exact cap from caratula.

Source:
- Alfa Medical Nuevos, IX.1.C.

## AM-FIN-008

Description: Coaseguro Reinstalable reinstates cap at renewal.

Required Inputs:
- Coinsurance type.
- Renewal period.
- Claim complement status.
- Cap.

Conditions:
- Cap reinstates each renewal and applies to total covered expenses claimed in
  each renewal, including previous claims' complements.

Exceptions:
- Foreign coinsurance and cap are independent.

Unknowns:
- Claim complement allocation.

Source:
- Alfa Medical Nuevos, IX.1.C.

## AM-FIN-009

Description: Coinsurance cap limits insured coinsurance participation only
where cap applies.

Required Inputs:
- Coinsurance cap.
- Claim type.
- Special adjustment status.

Conditions:
- Cap is maximum coinsurance participation per covered claim.

Exceptions:
- No cap for certain hospital-level higher-level care, non-listed pharmacy
  medication or foreign non-programmed catastrophic care depending on clause.

Unknowns:
- Whether cap is modified by endorsement.

Source:
- Alfa Medical Nuevos, II Tope de Coaseguro; IX.1.C.

## AM-FIN-010

Description: Policies with 0% coinsurance still have exceptions.

Required Inputs:
- Coinsurance percentage.
- Provider agreement status.
- Reimbursement status.

Conditions:
- If coinsurance is 0%, 10% coinsurance applies when attention is not provided
  by providers in agreement.
- 10% applies to expenses presented through reimbursement.

Exceptions:
- Specific benefit conditions may differ.

Unknowns:
- Provider agreement verification.

Source:
- Alfa Medical Nuevos, IX.1.C.

## AM-FIN-011

Description: Hospital-level mismatch can change coinsurance.

Required Inputs:
- Contracted hospital level.
- Hospital level of attention.
- Coinsurance percentage.
- Deducible en Exceso status.

Conditions:
- Hospital level Practico/Integro/Pleno determines adjustment.
- Going to different hospital level may add or reduce coinsurance points.

Exceptions:
- Reductions do not apply to 0% coinsurance.
- Deducible en Exceso never receives coinsurance reduction.

Unknowns:
- Current hospital classification and plan-specific portal rules.

Source:
- Alfa Medical Nuevos, IX.1.C Ajuste en Coaseguro.

## AM-FIN-012

Description: Hospital-level coinsurance adjustment does not apply in medical
urgency.

Required Inputs:
- Medical urgency evidence.
- Hospital level.

Conditions:
- Event must meet Urgencia Medica definition.

Exceptions:
- Other financial rules still apply.

Unknowns:
- Whether urgency ended before later care.

Source:
- Alfa Medical Nuevos, IX.1.C.

## AM-FIN-013

Description: Medication coinsurance depends on pharmacy path.

Required Inputs:
- Pharmacy used.
- Listed pharmacy status.
- Medication prescription.
- Claim relationship.

Conditions:
- Listed pharmacies: stated medication coinsurance and cap behavior applies.
- Other national pharmacies: higher coinsurance without cap applies.

Exceptions:
- Medication without valid permits is excluded.

Unknowns:
- Current listed pharmacy catalog.

Source:
- Alfa Medical Nuevos, IX.1.C Coaseguro en Medicamentos.

## AM-FIN-014

Description: Indemnity is limited by plan, zone, tabulator and usual/reasonable
values.

Required Inputs:
- Plan.
- Zone.
- Tabulator.
- Catalog of fees.
- Usual/reasonable value.
- Provider agreement status.

Conditions:
- Medical/surgical fees use catalog by plan and zone.
- Other expenses use Gasto Usual, Razonable y Acostumbrado.
- Non-agreement provider payment is limited to applicable catalog.

Exceptions:
- Optional honorarium catalog increase if contracted.

Unknowns:
- Current catalogs and zone mapping.

Source:
- Alfa Medical Nuevos, IX Bases; IX.1.D.

## AM-FIN-015

Description: Complementary expenses are paid only within period-of-benefit
limits.

Required Inputs:
- Claim identity.
- Policy vigency.
- Expense date.
- Recovery status.
- Sum insured remaining.

Conditions:
- Complementary expenses are paid while policy is in force and necessary for
  recovery, until the earliest limit occurs.
- Limits include sum insured exhaustion, stated post-termination period,
  recovery of health/vital vigor and termination conditions.

Exceptions:
- Deductible/coinsurance model affects which plan conditions apply.

Unknowns:
- Recovery determination evidence.

Source:
- Alfa Medical Nuevos, IX.1.E.
