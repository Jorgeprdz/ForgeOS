# Alfa Medical Authorization Rules

Status: DISCOVERY ONLY

## AM-AUTH-001

Description: Pago Directo requires timely information/documentation to verify
claim procedence.

Required Inputs:
- Provider.
- Claim documentation.
- Deductible exceeded.
- Insurer verification status.

Conditions:
- Insurer must have timely information and documentation.
- Hospital expense must exceed deductible.
- Payment follows insurer agreements.

Exceptions:
- Insurer remains responsible only for reimbursement of procedent covered
  expenses when direct payment is not available.

Unknowns:
- Operational documents by claim type.

Source:
- Alfa Medical Nuevos, II Pago Directo.

## AM-AUTH-002

Description: Second medical opinion request must be made before surgery.

Required Inputs:
- Surgery date.
- Request date.
- Covered claim.

Conditions:
- Request at least 5 business days before surgery.

Exceptions:
- Urgency may create practical impossibility; human review.

Unknowns:
- Whether late requests can still be accommodated.

Source:
- Alfa Medical Nuevos, III.11.

## AM-AUTH-003

Description: ECMO requires notice, second valuation and certified providers.

Required Inputs:
- Covered disease.
- Notice before placement.
- Second valuation.
- Hospital/specialist certification.

Conditions:
- Notice before placement.
- Second valuation determines procedence.
- Provider certification required.

Exceptions:
- Missing notice, valuation or certification.

Unknowns:
- Emergency exception, if any.

Source:
- Alfa Medical Nuevos, III.12.

## AM-AUTH-004

Description: Knee, shoulder and/or spine surgery must be authorized or
processed by reimbursement and subject to exclusions/waiting periods.

Required Inputs:
- Body area.
- Surgery type.
- Event Programmed authorization.
- Reimbursement path.
- Waiting-period status.

Conditions:
- Previously authorized as Event Programmed or processed by reimbursement.
- Subject to exclusions and waiting periods.

Exceptions:
- Excluded preexisting/non-declared conditions.

Unknowns:
- Reimbursement evidence threshold.

Source:
- Alfa Medical Nuevos, IV.17.

## AM-AUTH-005

Description: Breast cancer reconstructive surgery requires prior authorization
as Event Programmed.

Required Inputs:
- Breast cancer covered claim.
- Medical requirement.
- Event Programmed authorization.
- Waiting period.

Conditions:
- Cancer must have been covered.
- Surgery must be medically required.
- Prior authorization as Event Programmed required.

Exceptions:
- No authorization or waiting period not met.

Unknowns:
- Benefit limit/version.

Source:
- Alfa Medical Nuevos, IV.12.

## AM-AUTH-006

Description: Genomic studies require prior written authorization and direct
payment.

Required Inputs:
- Study name.
- Oncology claim.
- Medical necessity.
- Prior written authorization.
- Payment method.

Conditions:
- Listed study.
- One per covered claim.
- Direct payment to provider only.

Exceptions:
- Reimbursement not covered.

Unknowns:
- Whether future listed studies are added.

Source:
- Alfa Medical Nuevos, IV.14.

## AM-AUTH-007

Description: Fetal surgery requires prior authorization at least 10 business
days before surgery.

Required Inputs:
- Procedure type.
- Gestational week.
- Mother age.
- Coverage continuity.
- Clinical file.
- Diagnostic studies.
- Specialist credentials.
- Hospital agreement status.
- Prior authorization.

Conditions:
- Procedure must be listed.
- Mother must meet age, continuity and gestational-week rules.
- Full clinical file and diagnostics required.
- Prior authorization as Event Programmed required at least 10 business days
  before planned surgery.
- Specialist and hospital requirements apply.

Exceptions:
- Non-listed procedures, procedures abroad, assisted reproduction maternity,
  experimental/non-indicated procedures, missing documentation/authorization
  and certain added pathologies.

Unknowns:
- How emergency fetal cases are handled.

Source:
- Alfa Medical Nuevos, IV.18.

## AM-AUTH-008

Description: Gene therapies and orphan drugs require Event Programmed
authorization and second valuation.

Required Inputs:
- Treatment/drug.
- Covered disease.
- COFEPRIS approval date.
- Medical necessity.
- Event Programmed authorization.
- Second valuation.

Conditions:
- Treatment must be for covered disease.
- Must be medically necessary and non-experimental.
- Prior authorization at least 10 business days before treatment.
- Second valuation required.
- COFEPRIS approval must be at least five years old.

Exceptions:
- Alternative treatment with equal or superior efficacy.
- Approval under five years.
- Experimental or non-permitted treatment.

Unknowns:
- Evidence standard for equal/superior alternative efficacy.

Source:
- Alfa Medical Nuevos, IV.19.

## AM-AUTH-009

Description: Ambulance through Assistance Alfa Medical requires request through
assistance channel and access to clinical history.

Required Inputs:
- Ambulance request channel.
- Medical need.
- Clinical history access.
- Territory.

Conditions:
- Service must be requested through Assistance Alfa Medical for assistance
  pathway.
- Access to clinical history may be required.

Exceptions:
- If access denied, service may not be managed and insurer may be released.
- Ambulance outside territory excluded.
- Air ambulance through third parties excluded.

Unknowns:
- Emergency path for inaccessible zones.

Source:
- Alfa Medical Nuevos, IV.20.

## AM-AUTH-010

Description: Dental Basic requires treatment through dental providers in
agreement.

Required Inputs:
- Dental service.
- Provider.
- Provider agreement status.

Conditions:
- Service must be listed and provided by dental provider in agreement.

Exceptions:
- Treatment in non-designated establishment not covered by this assistance
  service.

Unknowns:
- Current provider list.

Source:
- Alfa Medical Nuevos, IV.22.
