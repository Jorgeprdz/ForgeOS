# Alfa Medical Rule Inventory

Status: DISCOVERY ONLY

No implementation. No code. No engines. No schemas. No UI.

## Purpose

This inventory transforms Alfa Medical Product Intelligence Discovery into
explicit business-rule candidates that Forge could eventually evaluate with
documentary evidence.

These are not claims decisions. They are observable coverage rules extracted
from Alfa Medical Condiciones Generales and the completed Alfa Medical
discovery package.

## Source Inventory

Primary source:

- `/storage/emulated/0/Download/Alfa Medical Nuevos.pdf`
  - Alfa Medical | Nuevos
  - Condiciones Generales
  - 66 pages
  - PDF metadata creation date: June 1, 2026

Discovery sources used:

- `ALFA_MEDICAL_PRODUCT_INTELLIGENCE_DISCOVERY.md`
- `ALFA_MEDICAL_COVERAGE_MAP.md`
- `ALFA_MEDICAL_EXCLUSION_INTELLIGENCE.md`
- `ALFA_MEDICAL_FINANCIAL_RESPONSIBILITY_DISCOVERY.md`
- `ALFA_MEDICAL_REAL_LIFE_EVENT_LIBRARY.md`
- `ALFA_MEDICAL_FORGE_COVERAGE_INTELLIGENCE_FOUNDATION.md`
- `ALFA_MEDICAL_FORGE_GAP_INTELLIGENCE_FOUNDATION.md`

Existing Forge context:

- `FORGE_GMM_PRODUCT_FAMILY_ARCHITECTURE.md`
- `FORGE_ALFA_MEDICAL_VS_FLEX_PRODUCT_INTELLIGENCE_NOTES.txt`

## Rule Families

| Family | Rule file | Count |
| --- | --- | --- |
| Coverage | `ALFA_MEDICAL_COVERAGE_RULES.md` | 24 |
| Waiting Period | `ALFA_MEDICAL_WAITING_PERIOD_RULES.md` | 10 |
| Preexistence | `ALFA_MEDICAL_PREEXISTENCE_RULES.md` | 8 |
| Maternity | `ALFA_MEDICAL_MATERNITY_RULES.md` | 10 |
| Accident | `ALFA_MEDICAL_ACCIDENT_RULES.md` | 9 |
| Foreign Coverage | `ALFA_MEDICAL_FOREIGN_COVERAGE_RULES.md` | 12 |
| Financial | `ALFA_MEDICAL_FINANCIAL_RULES.md` | 15 |
| Authorization | `ALFA_MEDICAL_AUTHORIZATION_RULES.md` | 10 |
| Human Review | `ALFA_MEDICAL_HUMAN_REVIEW_RULES.md` | 14 |
| Unknowns | `ALFA_MEDICAL_UNKNOWN_RULE_GAPS.txt` | N/A |

## Rule ID Convention

- `AM-COV-*`: Coverage rules.
- `AM-WAIT-*`: Waiting period rules.
- `AM-PRE-*`: Preexistence rules.
- `AM-MAT-*`: Maternity rules.
- `AM-ACC-*`: Accident rules.
- `AM-FOR-*`: Foreign coverage rules.
- `AM-FIN-*`: Financial participation rules.
- `AM-AUTH-*`: Authorization rules.
- `AM-HR-*`: Human review stop rules.

## Inventory by Category

### Coverage

- `AM-COV-001`: Covered claim purpose.
- `AM-COV-002`: Medically necessary expense requirement.
- `AM-COV-003`: Professional medical fees.
- `AM-COV-004`: Hospital services.
- `AM-COV-005`: Specialized treatments and rehabilitation.
- `AM-COV-006`: Nurse care.
- `AM-COV-007`: Homeopathic and chiropractic treatment.
- `AM-COV-008`: Medications.
- `AM-COV-009`: Lab, gabinete and imaging.
- `AM-COV-010`: Prostheses and orthopedic equipment.
- `AM-COV-011`: Extrahospital recovery equipment.
- `AM-COV-012`: Medical equipment for acute loss.
- `AM-COV-013`: Second medical opinion.
- `AM-COV-014`: ECMO.
- `AM-COV-015`: Transplants.
- `AM-COV-016`: Accident dental.
- `AM-COV-017`: Sports and dangerous activities.
- `AM-COV-018`: Protection patrimonial.
- `AM-COV-019`: Breast cancer reconstructive surgery.
- `AM-COV-020`: Genomic studies.
- `AM-COV-021`: Stem cells.
- `AM-COV-022`: Hyperbaric chamber.
- `AM-COV-023`: Dental basic.
- `AM-COV-024`: Assistance Alfa Medical services.

### Waiting Period

- `AM-WAIT-001`: Accidents day one.
- `AM-WAIT-002`: Listed acute illnesses day one.
- `AM-WAIT-003`: Default 30-day illness/lesion waiting period.
- `AM-WAIT-004`: Third-year listed conditions.
- `AM-WAIT-005`: Congenital/genetic diseases for born-outside-vigency.
- `AM-WAIT-006`: Hernias.
- `AM-WAIT-007`: Maternity 10-month continuity.
- `AM-WAIT-008`: Fetal surgery 24-month continuity.
- `AM-WAIT-009`: Bariatric surgery sixth-year timing.
- `AM-WAIT-010`: Recognition of antiquity limits.

### Preexistence

- `AM-PRE-001`: Preexistence evidence definition.
- `AM-PRE-002`: Declared preexistence coverage timing.
- `AM-PRE-003`: No expenses/treatment/signs requirement.
- `AM-PRE-004`: Express exclusions still control.
- `AM-PRE-005`: Excluded declared-preexistence categories.
- `AM-PRE-006`: Recognition of antiquity is not retroactivity.
- `AM-PRE-007`: Preexistence dispute review.
- `AM-PRE-008`: Born-outside-vigency congenital/genetic guardrail.

### Territory

- `AM-FOR-001`: Basic territory dependency.
- `AM-FOR-002`: Foreign extension dependency.
- `AM-FOR-003`: Foreign extension programmed care.
- `AM-FOR-004`: Foreign extension non-programmed care.
- `AM-FOR-005`: Catastrophic diseases abroad covered list.
- `AM-FOR-006`: Catastrophic diseases abroad programmed care.
- `AM-FOR-007`: Catastrophic diseases abroad non-programmed care.
- `AM-FOR-008`: Catastrophic diseases abroad exclusions.
- `AM-FOR-009`: Students/workers abroad urgency.
- `AM-FOR-010`: Assistance abroad urgency.
- `AM-FOR-011`: Continuous stay limit.
- `AM-FOR-012`: Foreign information access obligation.

### Financial

- `AM-FIN-001`: Claim must exceed deductible.
- `AM-FIN-002`: Deducible Unico.
- `AM-FIN-003`: Deducible Anual.
- `AM-FIN-004`: Deducible Reinstalable.
- `AM-FIN-005`: Deducible Basico vs Exceso.
- `AM-FIN-006`: Coinsurance after deductible.
- `AM-FIN-007`: Coaseguro Unico.
- `AM-FIN-008`: Coaseguro Reinstalable.
- `AM-FIN-009`: Coinsurance cap.
- `AM-FIN-010`: 0% coinsurance exceptions.
- `AM-FIN-011`: Hospital-level adjustment.
- `AM-FIN-012`: Medical urgency exception to hospital adjustment.
- `AM-FIN-013`: Medication pharmacy path.
- `AM-FIN-014`: Plan, zone, tabulator and usual/reasonable limits.
- `AM-FIN-015`: Complement/payment-period rules.

### Authorization

- `AM-AUTH-001`: Pago Directo evidence requirement.
- `AM-AUTH-002`: Second opinion timing.
- `AM-AUTH-003`: ECMO authorization and second valuation.
- `AM-AUTH-004`: Knee/shoulder/spine surgery.
- `AM-AUTH-005`: Breast cancer reconstructive surgery.
- `AM-AUTH-006`: Genomic studies.
- `AM-AUTH-007`: Fetal surgery.
- `AM-AUTH-008`: Gene therapies and orphan drugs.
- `AM-AUTH-009`: Ambulance via Assistance Alfa Medical.
- `AM-AUTH-010`: Dental basic provider network.

### Documentation

Documentation appears across families. Core documentary requirements include:

- Fiscal receipts.
- Prescription for medication.
- Medical necessity.
- Clinical file.
- Diagnostic studies.
- Birth certificate or pregnancy ultrasound where applicable.
- Prior written notice where required.
- Authorization or event programming where required.
- Proof of residence or time abroad where applicable.

### Human Review

Human review is required when Forge lacks evidence or when interpretation is
material:

- Preexistence.
- Ambiguous symptom/first-expense timing.
- Foreign coverage.
- Optional coverage uncertainty.
- High-specialty treatments.
- Alcohol/drug facts.
- Professional sport or dangerous activity.
- Hospital-level mismatch.
- Contradictory caratula vs conditions.
- Missing catalog or hospital directory.

## Final Rule Extraction Verdict

Alfa Medical has enough documentary structure to define explicit rule
candidates. It does not yet have enough operational evidence to implement a
coverage engine.

Next recommended step:

Build a versioned documentary source registry and collect real caratula/quote
examples before approving any implementation.
