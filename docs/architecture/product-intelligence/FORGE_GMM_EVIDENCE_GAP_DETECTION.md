# Forge GMM Evidence Gap Detection

Status: PRE-IMPLEMENTATION / FINAL PRE-ENGINE DISCOVERY

## Purpose

Define how Forge identifies missing evidence.

## Common Evidence Gaps

### Missing Product

Signal:

- User says "GMM" or "medical insurance" but no exact product.

Impact:

- Product router blocked.

Next evidence:

- Caratula or exact product name.

### Missing Caratula

Signal:

- No policy-specific values.

Impact:

- Financial responsibility blocked.
- Optional coverage confirmation blocked.
- Product/version may be weak.

Next evidence:

- Policy caratula.

### Missing Policy Status

Signal:

- No active/vigency/renewal evidence.

Impact:

- Case-specific coverage blocked or conditional only.

Next evidence:

- Active policy/renewal document.

### Missing Diagnosis

Signal:

- User describes symptoms but no diagnosis.

Impact:

- Rule family may be broad or unknown.

Next evidence:

- Diagnosis or medical note.

### Missing Dates

Signal:

- No symptom, accident, diagnosis, first expense or birth date.

Impact:

- Waiting period cannot be evaluated.

Next evidence:

- Event-family-specific key date.

### Missing Continuity

Signal:

- User states years of policy but no proof of continuous coverage.

Impact:

- Maternity, waiting period and preexistence analysis remain conditional.

Next evidence:

- Caratula/renewals/coverage history.

### Missing Territory

Signal:

- No location of care or caratula territory.

Impact:

- National vs foreign path unknown.

Next evidence:

- Location and caratula territory.

### Missing Optional Coverage

Signal:

- Event requires optional coverage but caratula does not show it.

Impact:

- Foreign/optional path blocked.

Next evidence:

- Caratula or endorsement showing optional coverage.

### Missing Authorization

Signal:

- High-specialty or programmed benefit with no authorization proof.

Impact:

- Human review or conditional only.

Next evidence:

- Authorization, Event Programmed record or second valuation.

### Missing Documentation

Signal:

- No invoices, prescriptions, clinical file or studies where required.

Impact:

- Procedence unknown.

Next evidence:

- Specific required document by event family.

### Source Conflict

Signal:

- Caratula, conditions, manual or catalog conflict.

Impact:

- Human Review Required.

Next evidence:

- Source hierarchy review and human/compliance decision.

## Gap Output Pattern

Forge should say:

"The next missing evidence is [X] because it determines [Y]."

Forge should not dump a full intake checklist unless the user asks for a full
packet review.
