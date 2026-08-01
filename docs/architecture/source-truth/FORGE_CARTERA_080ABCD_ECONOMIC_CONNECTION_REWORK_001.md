# FORGE CARTERA 080ABCD — ECONOMIC CONNECTION REWORK

## Authority lock

Cartera 080 connects economic evidence with existing policy and payment authorities. It does not become a ledger, payment authority, Gmail mirror, or commission engine.

| Concept | Canonical authority | Cartera 080 role |
|---|---|---|
| External message, receipt or attachment | Source evidence | Preserve a provider-neutral claim and references |
| Person–policy–obligation relationship | Canonical Cartera policy read models | Propose an explainable match |
| Confirmation | Explicit human decision | Record actor, reason, timestamp, selected match, idempotency and correlation |
| Confirmed payment fact | Existing 030C/FES handoff | Compose a command only after human confirmation |
| Compensation interpretation | Compensation Intelligence | Consumer of confirmed facts; never of raw email claims |
| Product inbox | Cartera projection | Show claim, system knowledge, decision, handoff and truth owner |

## Hard boundaries

1. Evidence is always classified as a claim until an authorized human decision exists.
2. Provider adapters, including Gmail, are outside the domain core.
3. A match is a proposal and always requires a human decision.
4. Missing amount, date, policy, person or obligation values are never invented.
5. The product inbox is projection-only and cannot mutate the ledger or calculate commission.
6. Duplicate submissions are governed by idempotency keys and correlation identifiers.
7. The existing 030C reconciliation remains the payment handoff; 080 must not manufacture a parallel payment event.

## 080A — Evidence intake

Implemented through `createEconomicEvidenceCandidate` with provider-neutral metadata, evidence references, claimed fields, hash, method, confidence and explicit `truthClass=claim`.

## 080B — Explainable match

Implemented through `proposeEconomicMatch`. Multiple candidates or contradictions result in `review_required`; no automatic confirmation path exists.

## 080C — Governed confirmation

Implemented through `recordEconomicDecision` and `composeConfirmedPaymentCommand`. Confirmation requires actor, reason, selected policy and obligation, timestamp, idempotency and correlation. The output preserves a human-decision receipt for the downstream authority.

## 080D — Productive inbox projection

Implemented through `projectEconomicConnectionInbox`. It exposes the evidence claim, system knowledge, decision, canonical handoff and truth owner while explicitly disabling commission calculation and ledger authority.

## Acceptance status

- P080_AUTHORITY_MAP=PASS
- P080A_PROVIDER_NEUTRAL=PASS
- P080A_EVIDENCE_NOT_TRUTH=PASS
- P080B_MATCH_EXPLAINABLE=PASS
- P080B_NO_AUTO_CONFIRMATION=PASS
- P080C_HUMAN_CONFIRMATION=PASS
- P080C_IDEMPOTENCY_CONTRACT=PASS
- P080D_PROJECTION_ONLY=PASS
- P080D_NO_COMMISSION_CALCULATION=PASS
- REMOTE_ACCEPTANCE=NOT_RUN
- MERGE_AUTHORIZATION=NOT_GRANTED

The implementation is intentionally local to the domain contract. No Gmail polling, Supabase remote mutation, production deployment or merge is performed by this pass.
