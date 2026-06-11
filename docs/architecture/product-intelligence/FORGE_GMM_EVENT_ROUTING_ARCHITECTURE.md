# Forge GMM Event Routing Architecture

Status: BLUEPRINT / PRE-IMPLEMENTATION

## Purpose

Classify the user's situation before selecting coverage rules.

## Event Families

### Accident

Routes when:

- Injury is described as sudden, external, accidental or trauma-related.

Needs:

- Accident date.
- First attention/expense date.
- Cause.
- Exclusion-sensitive facts.

### Illness

Routes when:

- Diagnosis or symptoms indicate disease/padecimiento.

Needs:

- Diagnosis.
- First symptom date.
- Diagnosis date.
- First expense date.
- Preexistence indicator.

### Maternity

Routes when:

- Pregnancy, childbirth or cesarean is the core event.

Needs:

- Mother age.
- Coverage continuity.
- Birth or expected birth date.
- Assisted reproduction status.
- Caratula maternity values.

### Pregnancy Complication

Routes when:

- Event involves pregnancy, childbirth or puerperium complication.

Needs:

- Complication diagnosis.
- Coverage continuity.
- Birth/pregnancy timing.
- Voluntary/punishable abortion exclusion review where relevant.

### Newborn

Routes when:

- Question is about the child born to insured mother.

Needs:

- Biological/gestational relationship.
- Mother coverage.
- Whether maternity was covered.
- Inclusion request timing.

### Assisted Reproduction Maternity

Routes when:

- Pregnancy involved IVF, artificial insemination or assisted reproduction.

Needs:

- Method.
- Age.
- Diagnosis/family status.
- Embryo count.
- Institution approval.
- First trimester notice.

### Foreign Care

Routes when:

- Care occurs outside Mexico or outside policy territory.

Needs:

- Location.
- Optional coverage.
- Programmed status.
- Stay duration.
- Residence proof.

### Catastrophic Disease Abroad

Routes when:

- Foreign care involves catastrophic disease category.

Needs:

- Diagnosis category.
- Optional coverage.
- Programmed status.
- Exclusion screen.

### Dental

Routes when:

- Dental treatment or dental injury is central.

Needs:

- Accident vs disease context.
- Provider network.
- Authorization.
- First attention date for accident dental.

### Medication

Routes when:

- Medication expense is central.

Needs:

- Prescription.
- Invoice.
- Pharmacy path.
- Permit status.
- Covered claim relationship.

### High-Specialty Treatment

Routes when:

- Treatment requires special authorization, valuation or certification.

Examples:

- ECMO.
- Genomic studies.
- Fetal surgery.
- Gene therapy.
- Orphan drug.
- Stem cells.
- Hyperbaric chamber.
- Knee/shoulder/spine surgery.

Needs:

- Authorization.
- Second valuation if applicable.
- Provider certification.
- Medical necessity.

### Hospitalization / Surgery

Routes when:

- Hospital care, surgery or ICU is central.

Needs:

- Hospital.
- Hospital level.
- Procedure.
- Urgency status.
- Authorization if programmed/high-specialty.

### Assistance Service

Routes when:

- User asks about assistance rather than claims reimbursement.

Needs:

- Assistance type.
- Location.
- Distance from residence.
- Channel used.

## Routing Boundaries

Event routing must not:

- Decide coverage.
- Assume medical diagnosis.
- Infer dates.
- Ignore overlapping event families.

## Overlapping Families

Some cases route to multiple families:

- Cancer abroad: Illness + Foreign Care + Catastrophic Disease Abroad.
- Pregnancy via IVF: Maternity + Assisted Reproduction.
- Dental injury from fall: Accident + Dental.
- ECMO in hospitalization: Illness + Hospitalization + High-Specialty.

When multiple families apply, Forge should select all relevant rule families
and use the strictest evidence gate.
