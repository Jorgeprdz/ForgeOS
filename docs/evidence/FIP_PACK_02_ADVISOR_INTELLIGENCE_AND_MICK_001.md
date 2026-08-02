# FIP Pack 02 — Advisor Intelligence and Mick

## Scope

Stages delivered in one pass:

- FIP-080 Advisor Intelligence Foundation;
- FIP-090 Mick Execution Intelligence;
- FIP-100 Personal Friction Detection.

## Product outcome

ForgeOS can now compose a read-only, advisor-scoped profile that treats client, market, channel, product, style and conversion observations as evidence-backed candidates rather than permanent truths. Mick can interpret execution patterns and friction hypotheses without surveillance, punishment, ranking or automatic enforcement.

## Delivered contracts

- dynamic advisor profile;
- ideal-client candidate discovery;
- ideal-market candidate discovery;
- channel and product candidate discovery;
- evidence, sample-size, confidence and limitation envelope;
- execution-pattern review;
- follow-up delay detection;
- early-quoting hypothesis;
- referral-request gap detection;
- insufficient-evidence preservation;
- human interpretation and no-effect boundaries.

## Promotion threshold

A segment is not promoted to an ideal candidate unless:

- sample size is at least 10; and
- confidence is MEDIUM or HIGH.

A high conversion rate with a tiny sample remains insufficient evidence.

## Mick boundary

Mick may produce:

- observed execution patterns;
- hypotheses requiring validation;
- business-impact context;
- recommended experiments;
- why-now coaching context.

Mick may not produce:

- personality truth;
- human worth;
- advisor ranking;
- discipline, motivation or coachability scores;
- surveillance;
- punishment;
- HR, promotion, termination or compensation decisions;
- automatic messages, tasks, calendar writes or Pipeline movement.

## Test

```bash
node tests/fip-pack-02-advisor-intelligence-and-mick-test.mjs
```

Expected marker:

```text
FIP_PACK_02_ADVISOR_INTELLIGENCE_AND_MICK=PASS
```

## Stack

```text
PACK=FIP_PACK_02_ADVISOR_INTELLIGENCE_AND_MICK
STAGES=FIP_080_TO_FIP_100
BASE_PACK_01_HEAD=df30fcd79dc67a7747ba7833850d8f31f103fc35
EXECUTION_MODE=ONE_PACK_ONE_PASS
MERGE_AUTHORIZATION=NOT_GRANTED
```

## Honest exclusions

This pack does not claim:

- live persistence;
- productive UI mounting;
- automatic coaching actions;
- ML training;
- causal proof;
- a guaranteed ideal market;
- a guaranteed 30% sales increase;
- Pages acceptance.
