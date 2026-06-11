# Alfa Medical Human Review Rules

Status: DISCOVERY ONLY

Human review rules identify situations where Forge should stop short of a
coverage conclusion.

## AM-HR-001

Description: Stop when exact product is uncertain.

Required Inputs:
- Product name.
- Quote/policy text.

Conditions:
- If product could be Alfa Medical Flex or another GMM product, human review is
  required.

Exceptions:
- Clear caratula product identity.

Unknowns:
- Parser ambiguity.

Source:
- Forge GMM Product Family Architecture.

## AM-HR-002

Description: Stop when policy caratula values are missing.

Required Inputs:
- Sum insured.
- Deductible.
- Coinsurance.
- Cap.
- Hospital level.
- Plan/zone/tabulator.
- Optional coverages.

Conditions:
- Any missing field blocks financial or likely-coverage certainty.

Exceptions:
- Pure educational explanation can continue if clearly labeled non-case
  specific.

Unknowns:
- Caratula extraction quality.

Source:
- Alfa Medical discovery foundation.

## AM-HR-003

Description: Stop for preexistence ambiguity.

Required Inputs:
- Medical history.
- Diagnosis date.
- First symptoms.
- Prior expenses.
- Application declaration.

Conditions:
- If prior existence is plausible or disputed, human review required.

Exceptions:
- None for claim-specific decisions.

Unknowns:
- Evidence sufficiency.

Source:
- Alfa Medical Nuevos, II Preexistence; V.

## AM-HR-004

Description: Stop when first symptom, first diagnosis and first expense dates
conflict.

Required Inputs:
- Symptom date.
- Diagnosis date.
- Expense date.
- Policy start date.

Conditions:
- Waiting period or accident treatment depends on date sequence.

Exceptions:
- Complete medical file resolves sequence.

Unknowns:
- Which date controls in disputed fact pattern.

Source:
- Alfa Medical Nuevos, II Accident; VI.

## AM-HR-005

Description: Stop for foreign coverage without optional coverage proof.

Required Inputs:
- Location of care.
- Optional coverage status.
- Caratula.

Conditions:
- Foreign event and optional coverage not verified.

Exceptions:
- General national coverage explanation only.

Unknowns:
- Endorsement status.

Source:
- Alfa Medical Nuevos, VIII.3, VIII.4, VIII.6, VIII.9.

## AM-HR-006

Description: Stop when programmed vs non-programmed foreign care is unclear.

Required Inputs:
- Notice/programming evidence.
- Treatment date.
- Foreign care type.

Conditions:
- Financial responsibility changes materially.

Exceptions:
- None for financial estimate.

Unknowns:
- Operational definition of programming.

Source:
- Alfa Medical Nuevos, VIII.3; VIII.4.

## AM-HR-007

Description: Stop for high-specialty treatments.

Required Inputs:
- Treatment type.
- Authorization.
- Second valuation.
- Provider certification.
- COFEPRIS evidence.

Conditions:
- Applies to ECMO, fetal surgery, genomic studies, gene therapies, orphan
  drugs, stem cells, hyperbaric chamber, knee/shoulder/spine surgery and
  similar high-specialty cases.

Exceptions:
- Complete authorization package may allow conditional explanation.

Unknowns:
- Medical appropriateness.

Source:
- Alfa Medical Nuevos, III.12; IV.14-IV.19.

## AM-HR-008

Description: Stop when alcohol, drugs or intentional conduct may be involved.

Required Inputs:
- Incident report.
- Toxicology/alcohol evidence.
- Local legal limit.
- Prescription evidence.
- Responsibility facts.

Conditions:
- Exclusions may apply.

Exceptions:
- Prescribed drugs used as indicated.

Unknowns:
- Local legal threshold and responsibility.

Source:
- Alfa Medical Nuevos, VII.5-VII.10.

## AM-HR-009

Description: Stop for professional sport, racing or dangerous activity
ambiguity.

Required Inputs:
- Activity type.
- Remuneration status.
- Competition/racing context.

Conditions:
- Sports/dangerous activities are covered only when not professional, while
  racing/contest exclusions may apply.

Exceptions:
- Clear ordinary recreational activity.

Unknowns:
- Sponsorship/remuneration interpretation.

Source:
- Alfa Medical Nuevos, IV.9; VII.7.

## AM-HR-010

Description: Stop when hospital level or provider agreement status is unknown.

Required Inputs:
- Hospital.
- Hospital classification.
- Provider agreement status.
- Contracted hospital level.

Conditions:
- Coinsurance adjustment and direct payment may depend on these facts.

Exceptions:
- Urgency may bypass hospital-level adjustment but not all financial rules.

Unknowns:
- Current hospital directory.

Source:
- Alfa Medical Nuevos, II Nivel Hospitalario; IX.1.C.

## AM-HR-011

Description: Stop when current catalogs are unavailable.

Required Inputs:
- Honorarium catalog.
- Usual/reasonable catalog.
- Plan and zone.

Conditions:
- Payment limits cannot be known without current catalog evidence.

Exceptions:
- Non-numeric conceptual explanation.

Unknowns:
- Portal catalog version.

Source:
- Alfa Medical Nuevos, II Catalog definitions; IX.

## AM-HR-012

Description: Stop when maternity dates or assisted reproduction status are
unclear.

Required Inputs:
- Pregnancy dates.
- Birth date.
- Coverage continuity.
- Assisted reproduction notice.
- Mother age.

Conditions:
- Maternity coverage depends on age, continuity, year, territory, notice and
  documentation.

Exceptions:
- Educational explanation only.

Unknowns:
- Timing and notice evidence.

Source:
- Alfa Medical Nuevos, IV.1; IV.2.

## AM-HR-013

Description: Stop when documents required for claim proof are missing.

Required Inputs:
- Receipts.
- Prescription.
- Clinical file.
- Diagnostic studies.
- Authorization.

Conditions:
- Missing proof can change procedence.

Exceptions:
- Client education can list missing documents.

Unknowns:
- Whether insurer accepts alternate evidence.

Source:
- Alfa Medical Nuevos, III; benefit clauses.

## AM-HR-014

Description: Stop when caratula, endorsement, general conditions and portal
catalogs conflict.

Required Inputs:
- Caratula.
- Endorsements.
- General conditions.
- Portal catalog.
- Version dates.

Conditions:
- Conflict among source authorities.

Exceptions:
- Human-reviewed hierarchy resolves conflict.

Unknowns:
- Source hierarchy and rule-pack versioning.

Source:
- Alfa Medical discovery unknown questions.
