# Alfa Medical Accident Rules

Status: DISCOVERY ONLY

## AM-ACC-001

Description: Accident must be external, sudden, fortuitous, violent and
independent of insured will.

Required Inputs:
- Event facts.
- Injury evidence.
- Cause.
- Voluntariness.

Conditions:
- Must produce bodily injury.
- Must not be consequence of previous disease or voluntary act.

Exceptions:
- Exclusions can still apply.

Unknowns:
- Causality evidence.

Source:
- Alfa Medical Nuevos, II Accidente o Lesion.

## AM-ACC-002

Description: Multiple injuries from one accident are one claim.

Required Inputs:
- Accident event.
- Injury list.

Conditions:
- Bodily injuries suffered in same accident are considered one siniestro.

Exceptions:
- Separate accidents require separate analysis.

Unknowns:
- Boundary between same accident and related later event.

Source:
- Alfa Medical Nuevos, II Accidente o Lesion.

## AM-ACC-003

Description: First expense after 30 days changes accident treatment.

Required Inputs:
- Accident date.
- First medical expense date.

Conditions:
- If first expense occurs more than 30 days after accident, event is not
  considered accident and is treated as illness.

Exceptions:
- None identified.

Unknowns:
- Whether consultation without expense counts.

Source:
- Alfa Medical Nuevos, II Accidente o Lesion.

## AM-ACC-004

Description: Accident coverage can apply from day one.

Required Inputs:
- Policy start date.
- Accident date.
- Accident definition match.

Conditions:
- Accident must be covered and not preexisting/voluntary/excluded.

Exceptions:
- Exclusions for activity, alcohol/drugs, intentional crime, military/war, etc.

Unknowns:
- Fact sufficiency.

Source:
- Alfa Medical Nuevos, VI.2; VII.

## AM-ACC-005

Description: Accident deductible reduction can apply in Mexico.

Required Inputs:
- Accident date.
- First attention date.
- Expense amount.
- Deductible type.
- Territory.

Conditions:
- Deductible reduced by 50% for covered accident.
- First attention within 30 days.
- Procedent expenses exceed stated threshold.
- Only for Deducibles Basicos.
- Accident occurred and was treated in Mexico.

Exceptions:
- Does not apply if optional deductible elimination by accident is contracted.
- Does not apply to nose/sinuses accident expenses.

Unknowns:
- Current threshold/version dependency.

Source:
- Alfa Medical Nuevos, IV.11.

## AM-ACC-006

Description: Optional deductible elimination by accident can remove deductible.

Required Inputs:
- Optional coverage contracted.
- Accident facts.
- Deductible type.
- Territory.
- First attention.

Conditions:
- Optional coverage must be in caratula.
- Covered accident.
- Only Deducibles Basicos.
- Accident occurred and was treated in Mexico.

Exceptions:
- Coinsurance still applies on excess expenses.
- Further exclusions from optional clause.

Unknowns:
- Full optional wording and caratula values.

Source:
- Alfa Medical Nuevos, VIII.7.

## AM-ACC-007

Description: Nose and paranasal sinus accident coverage requires attention
within 30 days.

Required Inputs:
- Accident date.
- First attention date.
- Injury location.
- Politrauma status.

Conditions:
- Injury must be accident-derived.
- Attention within first 30 days.
- Additional coinsurance points apply unless consequence of politrauma.

Exceptions:
- Preexisting non-declared nose/sinus padecimiento excluded.

Unknowns:
- Politrauma classification.

Source:
- Alfa Medical Nuevos, IV.5.A.

## AM-ACC-008

Description: Accident dental coverage requires immediate/direct accident cause
and 30-day attention.

Required Inputs:
- Accident facts.
- Dental injury.
- First attention date.
- Authorization.
- Specialist evidence.

Conditions:
- Dental damage/loss must be immediate and direct result of covered accident.
- Attention within 30 days.
- Prior authorization and specialist required.

Exceptions:
- Dental treatments from illness.
- Precious-metal pieces/prostheses.

Unknowns:
- Evidence for direct causality.

Source:
- Alfa Medical Nuevos, IV.7.

## AM-ACC-009

Description: Accident exclusions can override accident status.

Required Inputs:
- Activity context.
- Alcohol/drug evidence.
- Intentionality.
- Military/security context.
- Racing/contest context.

Conditions:
- Even if injury is accidental, exclusions can apply.

Exceptions:
- Prescribed drugs followed as indicated.

Unknowns:
- Local alcohol legal threshold.

Source:
- Alfa Medical Nuevos, VII.2-VII.10.
