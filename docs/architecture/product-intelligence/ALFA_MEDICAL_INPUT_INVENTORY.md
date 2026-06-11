# Alfa Medical Input Inventory

Status: ARCHITECTURE DISCOVERY

No implementation. No code. No engines. No schemas. No UI. No Build Tree
changes.

## Purpose

This document identifies every input Forge may need before answering:

"Would Alfa Medical likely cover this situation?"

This is not an implementation contract. It is a coverage-evaluation
architecture inventory derived from the Alfa Medical Rule Inventory.

## Master Input Inventory

### 1. Product Identity Inputs

- Product name.
- Product family.
- Product version.
- Condiciones Generales version.
- Policy/caratula product text.
- Whether the product is Alfa Medical and not Alfa Medical Flex.
- Rule pack/document source version, if later created.

Used by:

- Product routing.
- Coverage rules.
- Financial rules.
- Human review gates.

Do not assume:

- That "Alfa Medical" and "Alfa Medical Flex" share the same rules.
- That generic GMM rules are sufficient.

### 2. Policy Inputs

- Policy number.
- Policy active status.
- Policy start date.
- Current vigency period.
- Renewal history.
- Termination/cancellation status.
- Contract continuity.
- Period al descubierto, if any.
- Rehabilitacion date, if any.
- Endorsements.
- Optional coverages contracted.
- Recognized antiquity.

Used by:

- Waiting periods.
- Maternity.
- Preexistence.
- Foreign coverage.
- Optional benefits.
- Period-of-benefit rules.

Do not assume:

- Active policy equals every benefit active.
- Recognition of antiquity equals retroactive coverage.

### 3. Insured Inputs

- Insured identity.
- Insured role: titular, spouse, child, other covered insured.
- Age.
- Sex.
- Residence.
- Relationship to titular.
- Newborn status.
- Biological/gestational relationship when maternity/newborn is involved.
- Inclusion date for newborn.
- Inclusion request timing.

Used by:

- Maternity.
- Newborn.
- Protection Patrimonial.
- Foreign residence rules.
- Declared preexistence.

Do not assume:

- All insureds have identical benefit eligibility.
- Family membership alone makes a newborn covered.

### 4. Event Inputs

- Event description.
- Event family.
- Event type: accident, illness, maternity, complication, urgent event,
  foreign event, dental event, medication expense, high-specialty treatment.
- Diagnosis.
- Body area.
- Procedure or treatment requested.
- Medical urgency status.
- Claim/new event vs complement.
- Whether the event is ongoing.
- Relationship to a prior claim.

Used by:

- Coverage map.
- Waiting period map.
- Exclusion map.
- Authorization map.
- Financial participation.

Do not assume:

- A medical event is automatically covered.
- A client description is enough to classify diagnosis.

### 5. Date Inputs

- Policy start date.
- Coverage start date for insured.
- Continuous coverage start date.
- First symptom date.
- First diagnosis date.
- First medical expense date.
- Accident date.
- First attention date.
- Treatment date.
- Surgery date.
- Birth date.
- Pregnancy/gestation dates.
- Authorization request date.
- Foreign stay start date.
- Renewal date.
- Expense date.

Used by:

- Waiting periods.
- Accident definition.
- Maternity.
- Foreign duration.
- Authorization.
- Period of benefit.

Do not assume:

- Diagnosis date is the same as first symptom date.
- First attention date is the same as first expense date.

### 6. Accident-Specific Inputs

- External cause.
- Sudden/fortuitous/violent nature.
- Voluntary act indicator.
- Prior disease relationship.
- Accident date.
- First medical expense date.
- First attention date.
- Alcohol/drug involvement.
- Local legal alcohol threshold.
- Intentional crime involvement.
- War/military/security context.
- Racing, speed, resistance or contest context.
- Sport or dangerous activity.
- Professional/remunerated activity status.

Used by:

- Accident rules.
- Day-one coverage.
- Deductible reduction/elimination.
- Accident dental.
- Nose/sinuses accident coverage.
- Exclusions.

Do not assume:

- Every injury is an accident.
- Every accident receives deductible reduction.

### 7. Medical Evidence Inputs

- Diagnosis by legally authorized physician.
- Specialist diagnosis.
- Prescription.
- Medical order.
- Clinical file.
- Diagnostic studies.
- Medical necessity statement.
- Treatment plan.
- Procedure name.
- Hospital record.
- Surgery report.
- Provider certification.
- Second medical opinion.
- Second valuation.
- COFEPRIS approval and permit status.
- CENATRA protocol evidence when transplant applies.

Used by:

- Coverage.
- High-specialty authorization.
- Medication.
- Transplants.
- Gene therapy/orphan drugs.
- Fetal surgery.
- ECMO.

Do not assume:

- Doctor prescription alone guarantees coverage.
- Advanced treatment equals covered treatment.

### 8. Financial/Caratula Inputs

- Sum insured.
- Deductible amount.
- Deductible type: unico, anual, reinstalable, basico, en exceso.
- Coinsurance percentage.
- Coinsurance type: unico or reinstalable.
- Coinsurance cap.
- Plan.
- Zone.
- Tabulator.
- Hospital level contracted: Practico, Integro, Pleno.
- Hospital level used.
- Hospital agreement status.
- Provider agreement status.
- Medication pharmacy path.
- Current honorarium catalog.
- Current Gasto Usual, Razonable y Acostumbrado.

Used by:

- Financial participation.
- Hospital-level adjustment.
- Medication coinsurance.
- Direct payment.
- Human review gates.

Do not assume:

- Coverage means zero cost.
- Deductible plus cap is always the maximum client responsibility.

### 9. Territory and Foreign Inputs

- Territory in caratula.
- Location of medical care.
- Country/city.
- Residence.
- Time outside Mexico.
- Continuous foreign stay duration.
- Optional foreign coverage status.
- Foreign event type: ordinary covered event, catastrophic disease, urgency,
  student/temporary worker, assistance abroad.
- Programmed vs non-programmed care.
- Foreign medical information access.
- Proof of student/temporary-worker status.

Used by:

- Extension Abroad.
- Catastrophic Diseases Abroad.
- Students/Temporary Workers Abroad.
- Assistance Abroad.
- Residence and automatic cessation rules.

Do not assume:

- Alfa Medical national coverage works the same abroad.

### 10. Maternity Inputs

- Mother insured status.
- Mother age.
- Pregnancy status.
- Gestational week.
- Birth date.
- Coverage continuity.
- Policy year.
- Territory 10 months before birth.
- Maternity benefit sum insured.
- Clinical history.
- Ultrasound after week 20 for advance payment.
- Birth certificate.
- Assisted reproduction status.
- Assisted reproduction method.
- Infertility/sterility diagnosis or homoparental family status.
- Number of embryos transferred.
- Assisted reproduction institution approval.
- First-trimester written notice.
- Partner insured status where required.

Used by:

- Maternity.
- Pregnancy complications.
- Newborn.
- Reproduction-assisted maternity.
- Fetal surgery.

Do not assume:

- Pregnancy equals maternity benefit eligibility.

### 11. Authorization Inputs

- Event Programmed status.
- Prior authorization status.
- Prior written authorization.
- Authorization request date.
- Required advance-notice window.
- Second valuation status.
- Second opinion status.
- Assistance-channel request.
- Direct payment path.
- Reimbursement path.
- Provider network status.

Used by:

- ECMO.
- Fetal surgery.
- Genomic studies.
- Gene therapies/orphan drugs.
- Breast cancer reconstructive surgery.
- Knee/shoulder/spine surgery.
- Ambulance.
- Dental basic.
- Foreign programmed care.

Do not assume:

- A covered benefit is automatic without authorization.

### 12. Documentation Inputs

- Fiscal receipts.
- Pharmacy invoice.
- Prescription attached to medication invoice.
- Clinical file.
- Diagnostic studies.
- Birth certificate.
- Ultrasound.
- Written notices.
- Proof of residence.
- Proof of foreign stay.
- Policy/caratula.
- Endorsement.
- Prior policy evidence for recognition of antiquity.
- Prior medical records.
- Prior expense history.

Used by:

- Coverage.
- Waiting periods.
- Preexistence.
- Maternity.
- Foreign care.
- Financial participation.

Do not assume:

- Client statement alone is enough for claim-specific confidence.

## Minimum Universal Input Set

Before Forge attempts even a conditional coverage assessment, it should know:

- Product exact.
- Policy/caratula availability.
- Policy active status.
- Insured identity.
- Event family.
- Diagnosis or medically described event.
- Event date and first symptom/expense/attention date as applicable.
- Territory/location.
- Whether preexistence is possible or unknown.
- Whether optional coverage is involved.
- Whether authorization or documentation is missing.

## Final Boundary

If Forge lacks product identity, policy caratula or event family, it should not
attempt coverage evaluation. It may provide educational explanation only.
