# FIP Pack 04 — Opportunity and Operation

## Scope

Stages: FIP-150 through FIP-210.
Execution mode: ONE_PACK_ONE_PASS.
Merge authorization: NOT_GRANTED.

## Delivered

- opportunity-hidden-signal classification;
- annual review proposals;
- referral-moment proposals;
- explainable daily priority;
- attention-budget truncation;
- explainable forecast states;
- next-action scenario comparison;
- deterministic master test.

## Authority

Pack 04 consumes accepted Pack 01 relationship evidence, Pack 02 Advisor Intelligence and Pack 03 Nash context. It does not create a second person, relationship, Timeline, opportunity ledger, task ledger, calendar ledger, policy authority, forecast truth store or autonomous action engine.

## Product boundaries

```text
OBSERVED_NEED_IS_PRODUCT_RECOMMENDATION=NO
COMMERCIAL_HYPOTHESIS_IS_FACT=NO
ANNUAL_REVIEW_PROPOSAL_IS_CALENDAR_EVENT=NO
REFERRAL_MOMENT_IS_AUTOMATIC_CONTACT=NO
PRIORITY_SCORE_IS_HUMAN_WORTH=NO
FORECAST_IS_GUARANTEE=NO
FORECAST_IS_REVENUE_TRUTH=NO
FORECAST_IS_COMPENSATION_TRUTH=NO
SCENARIO_IS_EXECUTION=NO
AUTOMATIC_OPPORTUNITY_CREATION=NO
AUTOMATIC_MESSAGE=NO
AUTOMATIC_TASK=NO
AUTOMATIC_CALENDAR=NO
AUTOMATIC_PIPELINE_ADVANCE=NO
AUTOMATIC_APPLICATION=NO
AUTOMATIC_POLICY=NO
HUMAN_APPROVAL_REQUIRED=YES
```

## Attention governance

Daily priority must be limited by available minutes, declared maximum actions and explicit constraints. The system may rank candidate actions but may not force execution or interpret non-execution as falta de disciplina.

## Forecast governance

Forecast must distinguish OBSERVED, ESTIMATED, POTENTIAL, AT_RISK and UNKNOWN. Unknown remains null rather than zero. Every estimate exposes evidence, confidence and limitations.

## Verification

```bash
node tests/fip-pack-04-opportunity-and-operation-test.mjs
```

Expected marker:

```text
FIP_PACK_04_OPPORTUNITY_AND_OPERATION=PASS
```

## Stacked dependency

```text
BASE_PACK_03_HEAD=c879dc062a09f035d97cc9afb8e60a1cedc8b4e4
PACK_03_TEST_MARKER=NOT_RECORDED_IN_REPOSITORY
PACK_04_MERGE_AUTHORIZATION=NOT_GRANTED
```

Pack 04 may be reviewed while stacked, but controlled promotion requires prior pack reconciliation or an explicitly authorized stack merge sequence.
