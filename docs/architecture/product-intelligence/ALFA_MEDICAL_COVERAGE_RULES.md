# Alfa Medical Coverage Rules

Status: DISCOVERY ONLY

Format: rule candidates for future evaluation. No implementation approved.

## AM-COV-001

Description: Alfa Medical covers medically necessary expenses for recovery from
a covered accident, illness, childbirth or cesarean.

Required Inputs:
- Product exact: Alfa Medical.
- Active policy.
- Insured identity.
- Event type.
- Diagnosis.
- Territory from caratula.
- Policy version.

Conditions:
- Event must be an Accident, Enfermedad, Parto or Cesarea amparado.
- Contract must be in force.
- Expense must occur within stipulated territory.
- Expense must fit policy limits and conditions.

Exceptions:
- General exclusions.
- Particular exclusions.
- Waiting periods.
- Preexistence.

Unknowns:
- Exact caratula values.
- Endorsements or optional coverage changes.

Source:
- Alfa Medical Nuevos, I. Objeto del seguro.

## AM-COV-002

Description: Covered medical expenses must be medically necessary and
documented.

Required Inputs:
- Medical order.
- Diagnosis.
- Fiscal receipts.
- Expense category.
- Relationship to covered claim.

Conditions:
- Expense must be necessary for the covered claim.
- Expense must be documented with valid fiscal receipts.

Exceptions:
- Non-procedent expenses.
- Expenses above catalog/usual/reasonable limits.
- Excluded treatments.

Unknowns:
- Missing receipts or incomplete clinical support.

Source:
- Alfa Medical Nuevos, III. Gastos Medicos Amparados.

## AM-COV-003

Description: Professional medical fees are covered under catalog limits.

Required Inputs:
- Treating physician.
- Procedure.
- Catalog of medical and surgical fees.
- Plan and zone.
- Specialty credentials.

Conditions:
- Physician must be legally authorized.
- Services must relate to covered claim.
- Fees are subject to catalog rules.

Exceptions:
- Multiple procedures, multiple surgeons and same-session rules can reduce
  payment.
- Provider self-dealing exclusions.

Unknowns:
- Current catalog values.

Source:
- Alfa Medical Nuevos, III.1 Servicios Medicos Profesionales.

## AM-COV-004

Description: Hospital services are covered for covered claims.

Required Inputs:
- Hospital used.
- Hospital level.
- Plan.
- Claim diagnosis.
- Hospital invoice.

Conditions:
- Hospital must be legally authorized and provide medical/surgical care.
- Services may include room, operating room, recovery, emergency room, ICU,
  medications, blood products, lab and imaging.

Exceptions:
- Elderly homes, rest homes, natural-treatment clinics, thermal clinics,
  massage clinics, aesthetic clinics or similar are not hospitals for this
  contract.

Unknowns:
- Hospital classification and agreement status.

Source:
- Alfa Medical Nuevos, III.2 Servicios de Hospital.

## AM-COV-005

Description: Specialized treatments and rehabilitation can be covered.

Required Inputs:
- Prescribing specialist.
- Treatment type.
- Session count.
- Medical necessity.

Conditions:
- Treatment such as radiotherapy, chemotherapy, hydrotherapy or inhalotherapy
  must be ordered by specialist and related to covered claim.
- Rehabilitation is limited to 30 sessions per covered claim unless additional
  sessions are previously valued and authorized.

Exceptions:
- Stays in specialized rehabilitation institutions and complementary services
  are not covered.
- Unauthorized additional sessions are excluded.

Unknowns:
- Whether additional sessions were authorized.

Source:
- Alfa Medical Nuevos, III.3 Tratamientos Especializados y de Rehabilitacion.

## AM-COV-006

Description: Extrahospital nurse care can be covered.

Required Inputs:
- Nurse credentials.
- Medical prescription.
- Hours used.
- Claim relationship.

Conditions:
- Care must be medically necessary.
- Care must be prescribed by treating physician.
- Applies to extrahospital care.
- Maximum hours apply.

Exceptions:
- Companionship and personal hygiene services are not covered.

Unknowns:
- Hours already consumed for the claim.

Source:
- Alfa Medical Nuevos, III.4 Honorarios de Enfermeras.

## AM-COV-007

Description: Homeopathic and chiropractic treatments can be covered when
medically necessary.

Required Inputs:
- Prescription.
- Treating provider credentials.
- Evidence treatment helps recovery.

Conditions:
- Treatment must be prescribed and necessary.
- Provider must be titled/authorized.

Exceptions:
- Treatments unrelated to covered recovery.

Unknowns:
- Evidence standard for "helps recovery."

Source:
- Alfa Medical Nuevos, III.5 Tratamientos Homeopaticos y Quiropracticos.

## AM-COV-008

Description: Medications can be covered when prescribed for a covered claim.

Required Inputs:
- Prescription.
- Pharmacy invoice.
- Medication permit status.
- Claim diagnosis.

Conditions:
- Medication must be prescribed by treating physician/specialist.
- Must be necessary for covered claim.
- Must have current COFEPRIS and Mexican authority permits.

Exceptions:
- Medications without permits.
- Medications related to excluded diagnoses/treatments.

Unknowns:
- Medication authorization status.

Source:
- Alfa Medical Nuevos, III.6 Medicamentos; VII.40.

## AM-COV-009

Description: Laboratory, gabinete and imaging services can be covered.

Required Inputs:
- Medical order.
- Study type.
- Claim diagnosis.

Conditions:
- Studies must be necessary, prescribed and related to covered claim.

Exceptions:
- General checkups and non-claim studies are excluded.

Unknowns:
- Relationship between study and covered claim.

Source:
- Alfa Medical Nuevos, III.7; VII.19.

## AM-COV-010

Description: Prostheses and orthopedic equipment can be covered for covered
claims.

Required Inputs:
- Prescription.
- Claim relationship.
- Equipment type.
- COFEPRIS/authority permit.
- Manufacturer useful-life evidence.

Conditions:
- Equipment must complement a physiologic function.
- Must be necessary for covered claim.
- Certain electronic/computerized equipment has maximum limits.

Exceptions:
- Replacement due to carelessness or misuse.
- Equipment used before policy contracting.
- Later replacements from misuse.

Unknowns:
- Current useful-life documentation.

Source:
- Alfa Medical Nuevos, III.8.

## AM-COV-011

Description: Extrahospital recovery equipment can be covered.

Required Inputs:
- Prescription.
- Equipment type.
- Purchase vs rental.
- Prior authorization when purchase is involved.

Conditions:
- Equipment must be indispensable for treatment and recovery of covered claim.
- Purchase of certain equipment requires prior authorization.

Exceptions:
- Replacements from misuse.
- Non-indispensable equipment.

Unknowns:
- Whether authorization was obtained.

Source:
- Alfa Medical Nuevos, III.9.

## AM-COV-012

Description: Medical equipment for acute ambulatory assistance can be covered.

Required Inputs:
- Acute event evidence.
- Lost function.
- Rehabilitation/restitution purpose.

Conditions:
- Device must support rehabilitation or restitution of function lost from an
  acute event.

Exceptions:
- Devices for chronic disease used only to mobilize a patient without
  possibility of recovering function.

Unknowns:
- Whether functional recovery is possible.

Source:
- Alfa Medical Nuevos, III.10.

## AM-COV-013

Description: Second medical opinion can be provided without cost for covered
claim surgery/treatment.

Required Inputs:
- Planned surgery or treatment.
- Request date.
- Surgery date.

Conditions:
- Must relate to a covered claim.
- Request must be made at least 5 business days before surgery.

Exceptions:
- Late requests.

Unknowns:
- Whether this is optional for insured or required by insurer in specific
  clauses.

Source:
- Alfa Medical Nuevos, III.11.

## AM-COV-014

Description: ECMO can be covered under special conditions.

Required Inputs:
- Covered illness/padecimiento.
- Notice before placement.
- Second valuation.
- Hospital and specialist certification.

Conditions:
- Disease must be covered.
- Insurer must be notified before placement.
- Second valuation must determine procedure is appropriate.
- Provider must have required ELSO or accepted certification.

Exceptions:
- Missing notice or second valuation.
- Non-certified provider.

Unknowns:
- Certification verification path.

Source:
- Alfa Medical Nuevos, III.12.

## AM-COV-015

Description: Organ and tissue transplants can be covered.

Required Inputs:
- Transplant type.
- CENATRA protocol evidence.
- Donor status.
- Covered claim context.

Conditions:
- Must follow Mexican transplant protocols.
- Includes certain donor/removal/preservation/transport services.

Exceptions:
- Alternative procedures that guarantee recovery can exclude transplant.
- Rejected donor compatibility expenses may be excluded in foreign catastrophic
  context.

Unknowns:
- How "alternative guarantees recovery" is evidenced.

Source:
- Alfa Medical Nuevos, IV.6; VII.31; VIII.4.

## AM-COV-016

Description: Accident dental treatment can be covered.

Required Inputs:
- Accident evidence.
- Dental injury.
- First attention date.
- Prior authorization.
- Specialist.

Conditions:
- Damage must be immediate and direct consequence of covered accident.
- Attention must occur within 30 natural days after accident.
- Must be previously authorized with studies and provided by specialist.

Exceptions:
- Dental/maxillofacial treatment derived from illness.
- Precious-metal components.

Unknowns:
- Authorization evidence.

Source:
- Alfa Medical Nuevos, IV.7.

## AM-COV-017

Description: Sports or dangerous activity injuries can be covered if not
professional.

Required Inputs:
- Activity type.
- Professional/remunerated status.
- Accident facts.

Conditions:
- Injury must derive from sport/dangerous activity not practiced
  professionally.

Exceptions:
- Professional/remunerated practice.
- Other exclusions such as racing or intoxication may still apply.

Unknowns:
- Whether compensation/sponsorship counts as remuneration.

Source:
- Alfa Medical Nuevos, IV.9; VII.7.

## AM-COV-018

Description: Protection Patrimonial can cover premiums for family members in
defined death/disability cases.

Required Inputs:
- Insured titular.
- Death or total permanent disability evidence.
- Covered claim relationship.
- Age.
- Covered family members.

Conditions:
- Death or total permanent disability must result from covered claim.
- Titular must be older than 18 and younger than 60.
- Benefit period and covered family rules apply.

Exceptions:
- Death/disability from non-covered claim.

Unknowns:
- Disability proof and continuing proof status.

Source:
- Alfa Medical Nuevos, IV.10.

## AM-COV-019

Description: Reconstructive surgery after breast cancer can be covered.

Required Inputs:
- Breast cancer claim.
- Prior coverage of cancer by insurer.
- Event Programmed authorization.
- Waiting period satisfaction.

Conditions:
- Breast cancer must have been covered.
- Reconstructive surgery must be medically required.
- Must be previously authorized as Event Programmed.
- Maximum benefit applies.

Exceptions:
- Waiting period not satisfied.
- No prior authorization.

Unknowns:
- Current benefit amount from policy version/caratula.

Source:
- Alfa Medical Nuevos, IV.12.

## AM-COV-020

Description: Certain genomic studies can be covered for covered oncology
claims.

Required Inputs:
- Oncology claim.
- Study name.
- Medical necessity.
- Prior written authorization.
- Provider payment method.

Conditions:
- Study must be one of the listed studies.
- Must be prescribed for covered oncologic padecimiento.
- One study per covered claim.
- Must be paid via Pago Directo to provider.

Exceptions:
- Reimbursement is not covered.
- More than one study per claim.
- Non-listed studies unless otherwise documented.

Unknowns:
- Whether newer studies have endorsement coverage.

Source:
- Alfa Medical Nuevos, IV.14.

## AM-COV-021

Description: Stem cell transplant can be covered for specific diseases.

Required Inputs:
- Disease diagnosis.
- Stem cell source.
- Donor compatibility.
- CENATRA protocol evidence.

Conditions:
- Autologous or allogeneic transplant from adult bone marrow or umbilical cord.
- Applies only to listed diseases.

Exceptions:
- Obtaining, handling, transferring, preserving and storage rental costs for
  stem cells are excluded.

Unknowns:
- Disease staging and protocol details.

Source:
- Alfa Medical Nuevos, IV.15.

## AM-COV-022

Description: Hyperbaric chamber can be covered for listed conditions.

Required Inputs:
- Diagnosis.
- Session count.
- Prescription.
- Provider certification.

Conditions:
- Must be medically necessary and prescribed.
- Applies to listed conditions.
- Up to base session limit; additional sessions require valuation and
  authorization.

Exceptions:
- Aesthetic or sports treatments.
- Diabetic foot.

Unknowns:
- Authorization for additional sessions.

Source:
- Alfa Medical Nuevos, IV.16.

## AM-COV-023

Description: Dental Basic covers only listed dental services through agreement
providers.

Required Inputs:
- Dental service.
- Provider in agreement.
- Event count.
- Disease relationship.

Conditions:
- Service must be listed.
- Provider must be part of dental providers in agreement.
- Event limit applies.

Exceptions:
- Any unlisted service or supply.
- Medications from dental diagnosis/treatment.
- Preventive treatment not required by covered disease.

Unknowns:
- Current dental provider list.

Source:
- Alfa Medical Nuevos, IV.22.

## AM-COV-024

Description: Assistance Alfa Medical services can be available under specific
service conditions.

Required Inputs:
- Assistance service requested.
- Location.
- Residence distance.
- Urgency/accident status.
- Assistance channel.

Conditions:
- Services include medical orientation, travel-related assistance, family
  travel/hotel, convalescence hotel, transfer, nutritional/psychological
  orientation, funeral assistance and virtual medical advice.
- Several services require request through Assistance Alfa Medical.

Exceptions:
- Non-requested services where assistance channel is required.
- Services outside distance, city, territory or benefit conditions.

Unknowns:
- Current assistance provider rules and phone/channel requirements.

Source:
- Alfa Medical Nuevos, IV.21.
