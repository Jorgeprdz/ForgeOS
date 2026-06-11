# Alfa Medical Input Frequency Analysis

Status: ARCHITECTURE DISCOVERY

## Purpose

Rank inputs by how frequently they appear across Alfa Medical rule families and
how much they unlock in evaluation.

This is qualitative architecture analysis, not statistical telemetry.

## Critical Inputs

Critical inputs appear across many rule families and block most evaluations if
missing.

| Input | Why it is critical | Main rule families |
| --- | --- | --- |
| Exact product | Prevents Alfa Medical vs Flex routing error. | All families |
| Policy/caratula | Contains financial, product, territory and optional coverage facts. | Coverage, financial, foreign, HR |
| Policy active status | Coverage requires contract in force. | Coverage, financial |
| Insured identity | Eligibility is insured-specific. | Coverage, maternity, preexistence |
| Event family | Determines which rule path applies. | All evaluation paths |
| Diagnosis/event description | Determines coverage, waiting period, exclusion and authorization. | Coverage, waiting, authorization |
| Event dates | Waiting periods, accident rules and maternity depend on date sequence. | Waiting, accident, maternity |
| Territory/location | National vs foreign rules diverge materially. | Coverage, foreign |
| Preexistence status | Can override apparent coverage. | Preexistence, waiting, HR |
| Optional coverage status | Foreign, HIV/AIDS, deductible elimination and other benefits depend on it. | Foreign, optional, HR |

Smallest high-leverage set:

1. Product.
2. Policy/caratula.
3. Insured.
4. Event family.
5. Diagnosis/event description.
6. Key dates.
7. Territory.
8. Optional coverage status.
9. Preexistence indicator.

This set does not finish evaluation, but it unlocks the largest share of rule
routing.

## Important Inputs

Important inputs are needed for meaningful conditional assessment or financial
explanation.

| Input | Why it matters |
| --- | --- |
| Coverage continuity | Drives maternity, waiting periods, preexistence and high-specialty benefits. |
| Age | Drives maternity, assisted reproduction, fetal surgery and some benefits. |
| Sex | Drives maternity eligibility. |
| Deductible amount/type | Determines whether claim can be indemnified and client responsibility. |
| Coinsurance percentage/type | Determines participation after deductible. |
| Coinsurance cap | Determines potential exposure boundary. |
| Hospital level contracted/used | Determines hospital-level adjustment. |
| Plan/zone/tabulator | Determines payment limits. |
| Medical necessity | Required for most medical expense coverage. |
| Documentation status | Missing evidence can block evaluation. |
| Authorization status | Required for several high-impact benefits. |

## Conditional Inputs

Conditional inputs matter only after Forge detects a relevant event family.

| Event family | Conditional inputs |
| --- | --- |
| Accident | Accident cause, first attention, first expense, alcohol/drugs, professional sport/racing, intentionality. |
| Maternity | Mother age, birth date, coverage continuity, maternity benefit sum, assisted reproduction status, documentation. |
| Newborn | Biological/gestational relationship, maternity covered, inclusion request date. |
| Foreign care | Optional foreign coverage, programmed status, stay duration, residence proof, foreign medical information access. |
| High-specialty treatment | Prior authorization, second valuation, provider certification, COFEPRIS approval. |
| Medication | Prescription, pharmacy path, COFEPRIS permit. |
| Dental | Accident dental vs dental basic, provider network, authorization. |
| Preexistence | Prior diagnosis, prior records, prior expenses, declaration, symptom/treatment history. |

## Rare Inputs

Rare inputs are specialized but important when triggered.

- CENATRA protocol evidence.
- ELSO certification.
- COFEPRIS approval age for gene therapies.
- Number of embryos transferred.
- Assisted reproduction institution approval.
- Homoparental family status.
- Local alcohol legal threshold.
- Donor compatibility rejection status.
- Manufacturer useful-life documentation for equipment.
- UDI value for Deducible en Exceso annual deductible.

## Input Collection Strategy

Forge should not ask for all inputs upfront.

Recommended order:

1. Collect universal routing inputs.
2. Detect event family.
3. Ask only conditional questions required by that family.
4. Stop at the first hard human-review gate.
5. Provide educational explanation when evidence is insufficient.

## Architecture Insight

The minimum dataset is not "everything in the policy." It is the smallest set
that determines which rules are relevant.

The first question is not:

"How much will be covered?"

The first question is:

"What kind of event are we evaluating under Alfa Medical, and do we have enough
evidence to use the right rule path?"
