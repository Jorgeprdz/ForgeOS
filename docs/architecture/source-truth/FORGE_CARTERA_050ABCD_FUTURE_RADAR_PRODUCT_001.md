# FORGE CARTERA 050A–050D — FUTURE RADAR PRODUCT 001

## Status

```text
PROGRAM=CARTERA_050_FUTURE_RADAR_AND_CONSERVATION
DELIVERY_MODE=ONE_BRANCH_ONE_PR_ONE_REMOTE_ACCEPTANCE
SOURCE_HEAD=19091b873b900f79e586f43149b89130dbe7a099
```

## Internal gates

```text
050A=DETERMINISTIC_FUTURE_SIGNAL_PROJECTION
050B=EXPLAINABILITY_EVIDENCE_UNCERTAINTY_ACTION_CONTRACT
050C=CONSERVATION_AND_COMPENSATION_AUTHORITY_ADAPTERS
050D=PRODUCTIVE_TODAY_7_30_90_RADAR_IN_CARTERA
```

## 050A — Future signal projection

Cartera composes owner-scoped read signals from existing authorities:

- expected payment obligations;
- possible late payments, explicitly classified as inference;
- unconfirmed payment evidence;
- policy end/review dates;
- policy-year transitions;
- incomplete or conflicting policy data;
- relationships without a recent confirmed annual review;
- confirmed service expectations and unresolved commitments.

The projection is read-only. It does not create PaymentEvents, change Policy truth, infer lapse or execute contact.

## 050B — Explainability

Every item must answer:

1. Why this person?
2. Why now?
3. What evidence supports it?
4. What is uncertain?
5. What is the smallest useful action?
6. What must the advisor confirm?

Each item is classified as exactly one of:

- confirmed fact;
- scheduled event;
- detected evidence;
- inference;
- recommendation.

Presentation order is deterministic by horizon and date. It is not final NBA priority truth.

## 050C — Authority adapters

Conservation and Compensation remain separate authorities.

Cartera may consume their explainable, source-referenced future signal envelopes, but it cannot:

- calculate conservation risk;
- expose or reproduce conservation formulas;
- calculate commission or payout;
- expose compensation formulas;
- accept black-box risk scores;
- convert those signals into final priority, opportunity, contact or message truth.

When either authority is unavailable, the adapter returns `NOT_CONNECTED` and zero fabricated signals.

## 050D — Product radar

The Cartera route receives a Future Radar panel with:

- Today;
- next 7 days;
- next 30 days;
- next 90 days;
- confirmation required;
- overdue.

The panel shows evidence, uncertainty and the smallest useful action. Every item remains human-confirmed and read-only.

## Locked boundaries

```text
AUTOMATIC_CONTACT=BLOCKED
AUTOMATIC_OPPORTUNITY=BLOCKED
FINAL_MESSAGE_GENERATION=BLOCKED
LAPSE_INFERENCE=BLOCKED
CONSERVATION_FORMULA_OWNERSHIP=NO
COMPENSATION_FORMULA_OWNERSHIP=NO
FINAL_NBA_PRIORITY_OWNERSHIP=NO
ACCOUNT_MUTATION=NOT_AUTHORIZED
```
