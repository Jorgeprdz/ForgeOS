# FORGE CARTERA 080ABCD — ECONOMIC CONNECTION REWORK

## Authority lock

Cartera 080 connects economic evidence with existing policy and payment authorities. It does not become a ledger, payment authority, Gmail mirror, or commission engine.

| Concept | Canonical authority | Cartera 080 role |
|---|---|---|
| External message, receipt or attachment | Evidence Ownership / ADR-001 | Preserve a provider-neutral claim and references |
| Economic amount, currency, period and source posture | Economic Evidence / ADR-008 | Validate completeness and preserve unknowns |
| Person–policy–obligation relationship | Canonical Cartera policy read models | Propose an explainable match |
| Confirmation | Explicit human decision receipt | Record actor, reason, timestamp, selected match, idempotency and correlation |
| Confirmed paid-premium fact | Policy Truth through existing Cartera 030C reconciliation | Compose and hand off only after human confirmation |
| PaymentEvent and economic-event interpretation | Existing policy-operations economic-event authority | Consume the confirmed operational fact; 080 creates no parallel event |
| Compensation interpretation | Compensation Intelligence / ADR-017 | Consume confirmed facts and rules; never raw email claims |
| Product inbox | Cartera projection | Show claim, system knowledge, decision, handoff and truth owner |

## Hard boundaries

1. Evidence is classified as a claim until an explicit human decision receipt exists.
2. Provider adapters, including Gmail, remain outside the domain core.
3. A match is always a proposal; no match can confirm itself.
4. Missing amount, currency, date, policy, person or obligation values remain unknown.
5. The productive inbox is projection-only and cannot mutate the ledger or calculate commission.
6. Duplicate handoffs are governed by idempotency key and stable command digest.
7. The existing 030C reconciliation remains the confirmed-payment handoff.
8. Payment-event and Compensation Intelligence authorities remain downstream owners.

## 080A — Provider-neutral economic evidence

`createEconomicEvidenceCandidate` now validates and preserves:

- source type, provider and external reference;
- received and observed timestamps;
- evidence hash and attachment references;
- claimed amount, currency and payment date;
- snapshot, rule and period references;
- assumptions, uncertainty and limits;
- explicit `truthClass=claim` and `economicState=provisional`.

Amount without currency, invalid confidence, impossible dates and invalid references are rejected. No missing value is fabricated.

## 080B — Explainable person–policy–obligation matching

`proposeEconomicMatch` preserves candidates, candidate reasons, signals, contradictions, missing fields and qualitative workflow status. Ambiguity, contradictions or missing data produce `review_required`. Even a unique match sets `requiresHumanDecision=true` and `automaticConfirmationAllowed=false`.

A confirmation cannot select a person, policy or obligation that was not present in the proposal.

## 080C — Governed confirmation and canonical handoff

`recordEconomicDecision` produces an auditable human-decision receipt with:

- evidence id and hash;
- actor and timestamp;
- decision and reason;
- selected match;
- idempotency key and correlation id;
- explicit authorization basis.

`composeConfirmedPaymentCommand` refuses incomplete economic data, mismatched evidence and unsupported payment-source categories. The output contains no client-created `authorization: true` object and requests no commission calculation.

`createCartera080EconomicConnectionService` performs the handoff to existing Cartera 030C, records a stable command digest, replays identical idempotent submissions without a second RPC and rejects conflicting payloads under the same key.

## 080D — Productive Conexión Económica inbox

The product surface is implemented through:

- `cartera-080-economic-connection-view.js`;
- `cartera-080d-economic-connection-enhancement.js`;
- the idempotent `cartera-080-materialize-app.mjs` app binding;
- `bindCartera080EconomicConnection()` after 070D and before canonical Cartera events.

The UI distinguishes:

- what the evidence claims;
- what the system knows;
- contradictions and missing information;
- the human decision;
- canonical handoff status;
- the current truth owner.

UI actions only request human review. They do not confirm payment, mutate a ledger, read Gmail, contact anyone or calculate commission.

## Native remote acceptance

GitHub Actions run `30709939421` executed on Ubuntu 24.04 with Node 22 and completed successfully.

- targeted 080 tests: 19 passed;
- inherited payment-authority regressions: 4 passed;
- source ancestry and bounded paths: passed;
- static authority contract: passed;
- productive app mount: passed;
- evidence artifact: `8821529621`;
- artifact digest: `sha256:c80e5ca85ccfbc409eb2949bf530cc224c7c9c98cb8018af1284c4c076cdc6ab`.

## Final status

```text
P080_AUTHORITY_MAP=PASS
P080A_PROVIDER_NEUTRAL=PASS
P080A_EVIDENCE_NOT_TRUTH=PASS
P080B_MATCH_EXPLAINABLE=PASS
P080B_NO_AUTO_CONFIRMATION=PASS
P080C_HUMAN_CONFIRMATION=PASS
P080C_IDEMPOTENCY=PASS
P080C_030C_HANDOFF=PASS
P080D_PRODUCT_SURFACE=PASS
P080D_PROJECTION_ONLY=PASS
P080D_NO_LEDGER_MUTATION=PASS
P080D_NO_COMMISSION_CALCULATION=PASS
P080_INHERITED_PAYMENT_REGRESSION=PASS
P080_REMOTE_ACCEPTANCE=PASS
CARTERA_080_COMPLETE=YES
SUPABASE_REMOTE_MUTATION=NOT_AUTHORIZED
MAIN_MUTATION=NOT_AUTHORIZED
MERGE_AUTHORIZATION=NOT_GRANTED
```
