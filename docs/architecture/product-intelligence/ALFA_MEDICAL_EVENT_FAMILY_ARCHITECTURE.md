# Alfa Medical Event Family Architecture

Status: ARCHITECTURE DISCOVERY

## Purpose

Before evaluating Alfa Medical coverage, Forge must classify the user situation
into an event family. Event family determines which rules apply and which
questions should be asked next.

## Event Family Model

### 1. Accident

Definition:

External, sudden, fortuitous and violent event independent of insured will that
causes bodily injury.

Rule families triggered:

- Accident rules.
- Day-one coverage rules.
- Exclusion rules.
- Financial rules.
- Human review if facts are ambiguous.

Special subtypes:

- Ordinary accident.
- Sport/dangerous activity accident.
- Racing/contest accident.
- Alcohol/drug-related accident.
- Accident dental.
- Nose/sinuses accident.

### 2. Illness

Definition:

Alteration in health diagnosed by legally authorized physician.

Rule families triggered:

- Coverage rules.
- Waiting period rules.
- Preexistence rules.
- Exclusion rules.
- Financial rules.

Special subtypes:

- Day-one listed acute illness.
- Thirty-day default illness.
- Third-year condition.
- Chronic/preexistence-sensitive illness.

### 3. Maternity

Definition:

Pregnancy/gestation/birth event for insured mother under maternity benefit.

Rule families triggered:

- Maternity rules.
- Waiting/continuity rules.
- Financial rules.
- Documentation rules.
- Human review if dates or assisted reproduction status are unclear.

Special subtypes:

- Maternity year 1-3.
- Maternity year 4+.
- Advance maternity benefit.
- Birth reimbursement/indemnity.

### 4. Pregnancy Complication

Definition:

Medical complication of pregnancy, childbirth or puerperium.

Rule families triggered:

- Maternity complication rules.
- Coverage rules.
- Waiting/continuity rules.
- Preexistence and exclusion review.

Special subtypes:

- Listed complications.
- Non-listed but possible complication.
- Voluntary/punishable abortion exclusion risk.

### 5. Newborn

Definition:

Coverage question involving child born to insured mother.

Rule families triggered:

- Newborn rules.
- Maternity dependency rules.
- Inclusion timing.
- Financial rules.

Special subtypes:

- Premature birth.
- Congenital/genetic disease.
- Newborn package.
- Late inclusion.

### 6. Assisted Reproduction Maternity

Definition:

Pregnancy achieved through assisted reproduction methods.

Rule families triggered:

- Assisted reproduction maternity rules.
- Maternity rules.
- Fetal surgery exclusion.
- Documentation/human review.

Special subtypes:

- IVF.
- Artificial insemination.
- Homoparental family.

### 7. Foreign Care

Definition:

Medical care outside Mexico or outside policy territory.

Rule families triggered:

- Territory rules.
- Foreign coverage rules.
- Optional coverage rules.
- Financial foreign participation.
- Human review.

Special subtypes:

- Extension Abroad.
- Catastrophic Diseases Abroad.
- Students/Temporary Workers Abroad.
- Assistance Abroad.
- Programmed foreign care.
- Non-programmed foreign care.

### 8. Catastrophic Disease Abroad

Definition:

Foreign care for listed catastrophic disease.

Rule families triggered:

- Catastrophic foreign rules.
- Optional coverage.
- Foreign financial rules.
- Diagnosis classification.

Special subtypes:

- CNS disease.
- CNS vascular event.
- Cardiac surgery.
- Cancer.
- Listed transplant.
- Major trauma.
- Chronic renal insufficiency.

### 9. Dental

Definition:

Dental service or dental injury.

Rule families triggered:

- Accident dental rules.
- Dental basic rules.
- Provider network rules.
- Exclusions.

Special subtypes:

- Accident dental.
- Dental basic.
- Disease-related dental treatment.

### 10. Medication

Definition:

Claim primarily about medication cost.

Rule families triggered:

- Medication coverage.
- Pharmacy path financial rule.
- COFEPRIS permit.
- Prescription/documentation.

Special subtypes:

- Regular prescribed medication.
- Orphan drug.
- Excluded dental/psychiatric/sleep-related medication.

### 11. High-Specialty Treatment

Definition:

Treatment that requires heightened authorization, second valuation or special
provider certification.

Rule families triggered:

- Coverage.
- Authorization.
- Documentation.
- Human review.

Special subtypes:

- ECMO.
- Fetal surgery.
- Genomic studies.
- Gene therapy.
- Orphan drug.
- Stem cells.
- Hyperbaric chamber.
- Knee/shoulder/spine surgery.
- Breast cancer reconstructive surgery.
- Bariatric surgery.

### 12. Hospitalization / Surgery

Definition:

Hospital-based care, procedure or surgery.

Rule families triggered:

- Hospital services.
- Professional fees.
- Financial participation.
- Hospital level.
- Authorization if high-specialty.

Special subtypes:

- Emergency hospitalization.
- Programmed surgery.
- Multiple procedures.
- Non-network hospital.

### 13. Assistance Service

Definition:

Service requested through Assistance Alfa Medical rather than direct claim
coverage.

Rule families triggered:

- Assistance rules.
- Channel requirements.
- Territory/distance.
- Documentation.

Special subtypes:

- Ambulance.
- Medical orientation.
- Family travel/hotel.
- Convalescence hotel.
- Transfer.
- Funeral assistance.
- Virtual medical advice.

## Event Family Detection Order

Recommended conceptual order:

1. Is this Alfa Medical?
2. Is the event inside Mexico or foreign?
3. Is the event accident, illness, maternity/newborn or assistance?
4. Is it high-specialty or ordinary care?
5. Is it medication/dental/hospital-specific?
6. Are optional coverages required?
7. Are human-review gates present?

## Boundary

If Forge cannot classify event family, it should not evaluate coverage. It
should ask one clarifying question:

"What happened medically: accident, illness, pregnancy/birth, treatment abroad,
medication, dental issue, or a specific procedure?"
