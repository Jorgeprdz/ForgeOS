# Forge Cartera PDF Semantic Completion 014 — Progress

```text
PHASE=CARTERA_PDF_SEMANTIC_COMPLETION_014
BASE_SHA=4985d4a47989c7adae8c884b48b1dd71310c04ee
BRANCH=fix/cartera-pdf-semantic-completion-014
CONSTITUTIONAL_GATE=PASS
ARTICLE_0=PASS
ADR_025_PRESERVED=PASS
ADR_026=ADDED
```

## Productive failure reproduced

The productive review after phase 012 showed a non-empty extraction candidate with product, policy number and effective period, but missing issue date, currency, payment frequency and structured Coverage rows. The same screen could display `0 coberturas` and `Confianza alta`.

Root cause trace:

```text
PDF
-> Edge primary model pass: PARTIAL_CANDIDATE
-> recovery condition: candidates.length === 0 only
-> semantic recovery: NOT_TRIGGERED
-> v8 normalization: missing values remain missing
-> 020B packet: missing values persisted as unknown
-> reopen: losslessly rehydrated the same missing values
-> UI: faithfully displayed the incomplete packet
```

The transport/reopen boundary was therefore not the primary defect. The missing semantics were already absent from the Edge candidate.

The browser regression also returned a perfect mocked Edge candidate before entering the productive adapter chain, so it proved v8 -> 020B -> reopen -> UI, but did not reproduce the Edge partial-extraction failure.

## 014 corrective boundary

```text
PRIMARY_MODEL_PASS
-> evaluate semanticRecoveryReasons
-> if critical gaps exist: FOCUSED_RECOVERY_PASS
-> fill-only merge
-> normalize/provenance
-> v8 enrichment before 020B
-> persisted semantic fields
-> same-PDF rehydration
-> honest review UI
```

Recovery is fill-only. A recovery value cannot silently overwrite an already present primary fact.

Coverage extraction now distinguishes:

- `CANDIDATES_REVIEW_REQUIRED`
- `INCOMPLETE_REVIEW_REQUIRED`
- `NO_COVERAGE_SECTION_DETECTED`
- `COVERAGE_PRESENCE_UNKNOWN`

A detected Coverage section with zero structured rows is not displayed as confirmed `0 coberturas`.

Extraction confidence and review completeness are separate concepts. High model confidence no longer implies a complete human review.

## Golden semantics locked

```text
product=IMAGINA SER 65 - 15 PAGOS UDI
policyNumber=VI0003006169
policyType=NORMAL
status=UNKNOWN/null
issueDate=2026-08-05
effectiveDate=2026-08-05
expirationDate=2053-08-05
currency=UDI
paymentFrequency=MONTHLY
basicPremiumTotal=3976.96
plannedPremium=2840
annualTotal=6816.96
coverageCandidates>=10
```

Coverage candidates remain:

```text
createsTruth=false
requiresHumanReview=true
```

## Test-theater correction

The browser fixture now starts from the productive-failure-shaped partial candidate and uses the same pure recovery merger used by the Edge boundary before the candidate enters v8. The PDF still enters through the real `<input type="file">` and then crosses the productive adapter, 020B packet, same-PDF reopen and semantic review renderer.

A dedicated 014 unit/static test also asserts recovery triggering, fill-only behavior, Policy Type / Status separation, UDI, payment frequency, independent premiums, Coverage non-truth, packet/reopen semantics and honest review-copy constraints.

## Merge and deployment

Not executed yet. The exact PR head must pass all applicable CI before merge. Supabase Edge deployment and governed Pages deployment must target the exact merge SHA. Final `PASS` remains blocked until productive real-PDF visual acceptance proves issue date, UDI, Mensual, separated premiums and non-zero coherent Coverage candidates.
