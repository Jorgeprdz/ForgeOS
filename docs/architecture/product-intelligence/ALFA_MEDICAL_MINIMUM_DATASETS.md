# Alfa Medical Minimum Evaluation Datasets

Status: ARCHITECTURE DISCOVERY

## Purpose

Define the minimum information Forge needs before beginning coverage evaluation
for major Alfa Medical event families.

These are not schemas. They are evidence checklists for future architecture.

## Universal Minimum Dataset

Required before any case-specific assessment:

- Product exact: Alfa Medical.
- Policy/caratula available or unavailable.
- Policy active status.
- Insured identity.
- Event family.
- Diagnosis or clear event description.
- Key date: event, symptom, diagnosis, first expense or first attention.
- Territory/location of care.
- Optional coverage relevance.
- Preexistence risk known/unknown.

If missing:

- Forge may provide educational explanation.
- Forge must not say likely covered or likely not covered.

## Appendicitis

Minimum data:

- Product exact.
- Policy start date.
- Insured coverage start date.
- Diagnosis: acute appendicitis.
- First symptom date.
- First expense/date of treatment.
- Preexistence indicator.
- Territory.
- Hospital/provider.

Evaluation can begin because:

- Acute appendicitis is listed as day-one illness if not preexisting.

Stop if:

- Diagnosis is not confirmed as acute appendicitis.
- Preexistence is possible.
- Dates conflict.

## Broken Leg

Minimum data:

- Accident date.
- Cause of injury.
- First medical expense date.
- First attention date.
- Territory.
- Alcohol/drug/intentional conduct indicator.
- Activity context: ordinary, professional sport, racing/contest, dangerous
  activity.
- Hospital/provider.
- Deductible type if deductible reduction is being discussed.

Evaluation can begin because:

- Broken leg may route through accident rules.

Stop if:

- Accident definition is unclear.
- First expense was after 30 days.
- Exclusion-sensitive facts are unclear.

## Pregnancy / Childbirth

Minimum data:

- Mother insured status.
- Mother age.
- Coverage continuity.
- Birth date or expected birth date.
- Policy year.
- Territory 10 months before birth.
- Assisted reproduction status.
- Maternity benefit sum insured.
- Deductible type.
- Documentation status: clinical history, birth certificate or ultrasound.

Evaluation can begin because:

- Maternity rules depend heavily on age, continuity, year and documentation.

Stop if:

- Assisted reproduction status unknown.
- Coverage continuity not verified.
- Deductible en Exceso status unknown for benefit applicability.

## Cancer

Minimum data:

- Cancer type.
- Diagnosis date.
- First symptom date.
- First expense date.
- Preexistence indicator.
- Coverage continuity.
- Territory.
- Whether treatment is national or foreign.
- Treatment type: surgery, chemotherapy, radiotherapy, genomic study,
  reconstructive surgery, gene therapy/orphan drug.
- Optional foreign coverage if abroad.

Evaluation can begin because:

- Cancer may be ordinary covered illness, third-year condition, high-specialty
  treatment or foreign catastrophic event depending on context.

Stop if:

- Cancer type/stage unclear.
- First symptom and policy dates conflict.
- Foreign optional coverage unknown.
- High-specialty authorization missing.

## Foreign Emergency

Minimum data:

- Country/location.
- Emergency facts.
- Medical urgency evidence.
- Optional foreign coverage contracted.
- Benefit path: Extension Abroad, Catastrophic Diseases Abroad, Students or
  Temporary Workers Abroad, Assistance Abroad.
- Programmed vs non-programmed status.
- Foreign stay duration.
- Residence proof.
- Access to medical information.

Evaluation can begin because:

- Foreign care is not generic Alfa Medical coverage; it requires optional or
  assistance benefit routing.

Stop if:

- Optional coverage cannot be verified.
- Programmed/non-programmed status unclear.
- Continuous stay rules cannot be evaluated.

## Spine Surgery

Minimum data:

- Spine diagnosis.
- Surgery type.
- First symptom date.
- First diagnosis date.
- Coverage continuity.
- Waiting period status.
- Preexistence indicator.
- Event Programmed authorization or reimbursement path.
- Second valuation if applicable.
- Hospital/provider.

Evaluation can begin because:

- Spine conditions may trigger third-year/waiting, authorization and
  preexistence rules.

Stop if:

- Preexisting spine condition is possible.
- Authorization status unknown.
- Waiting period not established.

## ECMO

Minimum data:

- Underlying covered disease.
- Medical necessity.
- Notice before placement.
- Second valuation.
- Hospital/specialist certification.
- Timing of placement.
- Territory.

Evaluation can begin because:

- ECMO is a named special coverage with strict conditions.

Stop if:

- Notice was not given or is unknown.
- Second valuation missing.
- Provider certification unknown.

## Gene Therapy / Orphan Drug

Minimum data:

- Covered disease.
- Treatment or drug name.
- Medical necessity.
- COFEPRIS approval status.
- COFEPRIS approval date.
- Prior Event Programmed authorization.
- Second valuation.
- Alternative treatment evidence.
- Expense amount context for financial participation.

Evaluation can begin because:

- Gene therapies and orphan drugs are covered only under a special rule path.

Stop if:

- Approval age is unknown.
- Treatment may be experimental.
- Equal/superior alternative exists or is unknown.
- Authorization/second valuation missing.

## Medication

Minimum data:

- Medication name.
- Diagnosis/covered claim.
- Prescription.
- Pharmacy invoice.
- COFEPRIS/permit status.
- Pharmacy path: listed or other national pharmacy.

Evaluation can begin because:

- Medication coverage requires prescription and claim relation.

Stop if:

- Medication is tied to excluded diagnosis/treatment.
- Permit status unknown.
- Prescription/invoice missing.

## Dental Accident

Minimum data:

- Accident date.
- Dental damage.
- First attention date.
- Direct/immediate accident relationship.
- Prior authorization.
- Specialist provider.
- Precious metal/prosthesis component status.

Evaluation can begin because:

- Accident dental is a narrow special accident benefit.

Stop if:

- Cause is illness rather than accident.
- Attention after 30 days.
- Authorization missing.

## Architecture Rule

Forge should collect only the universal dataset first. Then it should classify
event family and request only the missing fields required by that event family.
