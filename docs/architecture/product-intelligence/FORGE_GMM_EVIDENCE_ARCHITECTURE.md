# Forge GMM Evidence Architecture

Status: BLUEPRINT / PRE-IMPLEMENTATION

## Purpose

Define how Forge evaluates evidence sufficiency for GMM Coverage Intelligence.

## Evidence Classes

### Minimum Evidence

Required to begin routing:

- Exact product or product uncertainty.
- Event description.
- Insured identity.
- Approximate date context.
- Territory/location.

If absent:

- Educational explanation only.

### Required Evidence

Required for case-specific conditional assessment:

- Product confirmed.
- Policy/caratula context.
- Policy active status.
- Event family.
- Diagnosis or medically clear event.
- Key dates.
- Coverage continuity where relevant.
- Optional coverage status where relevant.

If absent:

- Insufficient information or next question.

### Additional Evidence

Needed to strengthen assessment:

- Clinical file.
- Diagnostic studies.
- Hospital/provider.
- Plan/zone/tabulator.
- Receipts.
- Prescriptions.
- Provider certification.

If absent:

- Conditional assessment may be allowed if no hard gate depends on it.

### Optional Evidence

Helpful but not always necessary:

- Advisor notes.
- Client summary.
- Provider estimate.
- Historical policy documents.

If absent:

- Usually no blocker.

### Human Review Evidence

Required when a gate is triggered:

- Preexistence records.
- Conflicting date evidence.
- Foreign coverage endorsements.
- High-specialty authorizations.
- Alcohol/drug/legal evidence.
- Source hierarchy conflict documents.

If absent:

- Human Review Required.

## Evidence Reliability Hierarchy

```text
Caratula / Endorsement
↓
Official policy document
↓
Official product conditions
↓
Official portal catalog / provider list
↓
Clinical file / diagnostic study
↓
Fiscal invoice / receipt
↓
Advisor statement
↓
Client statement
↓
Unconfirmed system extraction
```

## Evidence Sufficiency Outputs

- Evidence sufficient for routing.
- Evidence sufficient for conditional assessment.
- Evidence insufficient.
- Human review evidence required.
- Financial evidence insufficient.

## Evidence Boundary

Forge may use client statements to ask better questions.

Forge must not use client statements alone as verified coverage facts when a
case-specific answer depends on documentary evidence.
