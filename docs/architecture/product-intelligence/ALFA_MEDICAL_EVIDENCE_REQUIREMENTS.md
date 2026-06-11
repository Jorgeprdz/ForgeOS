# Alfa Medical Evidence Requirements

Status: ARCHITECTURE DISCOVERY

## Purpose

Define evidence categories and reliability hierarchy for Alfa Medical coverage
evaluation architecture.

## Evidence Categories

### 1. Contract Evidence

Examples:

- Policy caratula.
- Condiciones Generales.
- Endorsements.
- Optional coverage schedule.
- Renewal documents.
- Recognized antiquity document.

Use:

- Product identity.
- Active coverage.
- Financial values.
- Territory.
- Optional benefits.
- Source version.

Reliability:

Highest for policy-specific facts.

### 2. Documentary Product Evidence

Examples:

- Alfa Medical Condiciones Generales.
- Official product manuals.
- Official product guides.
- Official portal catalogs.
- Hospital directory.
- Provider directory.
- Pharmacy list.

Use:

- Product rules.
- Waiting periods.
- exclusions.
- catalogs and provider classifications.

Reliability:

High, but may be version-sensitive and may require portal timestamp.

### 3. Medical Evidence

Examples:

- Diagnosis.
- Clinical file.
- Specialist report.
- Diagnostic studies.
- Surgery report.
- Hospital record.
- Medical necessity statement.
- Prescription.
- Second valuation.
- Provider certification.

Use:

- Event classification.
- Medical necessity.
- Preexistence review.
- Authorization.
- High-specialty treatment.

Reliability:

High when issued by legally authorized provider and traceable to the event.

### 4. Financial Evidence

Examples:

- Fiscal receipts.
- Pharmacy invoices.
- Hospital invoice.
- Reimbursement statement.
- Prior insurer indemnity.
- Provider estimate.

Use:

- Expense procedence.
- Deductible threshold.
- Reimbursement path.
- Catalog comparison.

Reliability:

High for incurred expense, lower for future estimates.

### 5. Authorization Evidence

Examples:

- Event Programmed authorization.
- Prior written authorization.
- Assistance Alfa Medical service request.
- Direct payment authorization.
- Second opinion request.
- Notice to insurer.

Use:

- Determines whether special benefit path can proceed.

Reliability:

High if issued or acknowledged by insurer/service channel.

### 6. Client Statement

Examples:

- "The first symptom was yesterday."
- "She has had the policy for 4 years."
- "It was not assisted reproduction."
- "The accident happened while skiing."

Use:

- Initial routing.
- Question strategy.
- Educational explanation.

Reliability:

Useful but not sufficient alone for claim-specific confidence.

### 7. Advisor Statement

Examples:

- Summary of client case.
- Uploaded quote interpretation.
- Manual note about optional coverage.

Use:

- Initial routing and missing evidence identification.

Reliability:

Medium; should be verified against documents.

### 8. System Extraction

Examples:

- OCR from caratula.
- PDF parser result.
- Detected product name.
- Detected deductible/coinsurance.

Use:

- Initial data capture and routing.

Reliability:

Depends on extraction confidence and human confirmation. Must not override
source documents.

## Reliability Hierarchy

For policy-specific facts:

```text
Caratula / Endorsement
↓
Official policy document
↓
Official portal catalog/directories
↓
Official product manual / guide
↓
Advisor statement
↓
Client statement
↓
System extraction without confirmation
```

For medical facts:

```text
Clinical file / hospital record
↓
Specialist diagnosis / diagnostic study
↓
Treating physician note
↓
Prescription
↓
Client statement
```

For financial facts:

```text
Fiscal receipt / invoice
↓
Insurer reimbursement/direct payment statement
↓
Provider estimate
↓
Client/advisor estimate
```

## Evidence Sufficiency by Output

### Educational Explanation

Can rely on:

- Product rules.
- General conditions.
- User-provided context.

Cannot imply:

- Case-specific coverage result.

### Conditional Assessment

Requires:

- Product exact.
- Event family.
- Basic policy facts.
- Key dates.
- No immediate hard stop.

Must include:

- Missing evidence.

### Likely Covered / Likely Not Covered

Requires:

- Product exact.
- Caratula.
- Diagnosis/event evidence.
- Key date sequence.
- Exclusion screen.
- Waiting period screen.
- Preexistence screen.
- Optional coverage proof if applicable.
- Authorization proof if applicable.

### Human Review Required

Triggered by:

- Ambiguous preexistence.
- Conflicting dates.
- Foreign optional coverage uncertainty.
- High-specialty treatment.
- Source conflict.
- Medical/legal judgment beyond documentary rule.

## Evidence Boundary

Forge should prefer:

"I need the caratula and diagnosis date to evaluate that responsibly."

over:

"It should be covered."
