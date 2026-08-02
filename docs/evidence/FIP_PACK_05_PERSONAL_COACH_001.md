# FIP Pack 05 — Personal Coach Evidence

## Scope

Stages:

- FIP-220 — Weekly intention
- FIP-230 — Weekly coach plan
- FIP-240 — Commercial journal
- FIP-250 — Commercial experimentation
- FIP-260 — Personal playbook
- FIP-270 — Advisor Opportunity Radar
- FIP-280 — Coaching Intelligence
- FIP-290 — Guided weekly review

Execution mode: `ONE_PACK_ONE_PASS`.

## Delivered contracts

The pack creates one read-only personal-coach packet that combines accepted context from:

- Relationship Intelligence;
- Advisor Intelligence;
- Mick execution signals;
- Nash recommendation outcomes;
- activity summaries;
- advisor-authored journal context;
- governed experiments and playbook candidates.

## Weekly cycle

```text
INTENTION
→ PLAN
→ EXECUTION
→ JOURNAL_CONTEXT
→ EXPERIMENT
→ RESULT
→ COACHING
→ WEEKLY_REVIEW
→ NEXT_ADJUSTMENT
```

The plan is limited to three primary priorities and must expose whether the attention budget is respected.

## Learning rules

- Journal entries are advisor context, not objective truth.
- Correlation is not causal proof.
- A play with fewer than five cases remains `CANDIDATE` with `INSUFFICIENT_EVIDENCE`.
- Coaching compares the advisor against their own accepted history first.
- Growth targets remain objectives, never guarantees.
- Experiments must preserve hypothesis, action, sample, duration, metric, expected result, observed result and conclusion.

## Safety and governance

```text
PERSONALITY_TRUTH=NO
HUMAN_WORTH=NO
ADVISOR_RANKING=NO
DISCIPLINE_SCORE=NO
MOTIVATION_SCORE=NO
COACHABILITY_SCORE=NO
SURVEILLANCE=NO
PUNISHMENT=NO
HR_DECISION=NO
CORRELATION_AS_CAUSATION=NO
GUARANTEED_GROWTH=NO
AUTOMATIC_MESSAGE=NO
AUTOMATIC_TASK=NO
AUTOMATIC_CALENDAR=NO
AUTOMATIC_PIPELINE_ADVANCE=NO
AUTOMATIC_ENFORCEMENT=NO
HUMAN_APPROVAL_REQUIRED=YES
```

## Verification

```bash
node tests/fip-pack-05-personal-coach-test.mjs
```

Expected marker:

```text
FIP_PACK_05_PERSONAL_COACH=PASS
```

## Explicitly not claimed

- Productive UI mounting.
- Persistence.
- Scheduled coaching delivery.
- Automatic task or calendar creation.
- Causal ML training.
- Guaranteed sales growth.
- Pages deployment or responsive visual acceptance.

## Pack state

```text
PACK=FIP_PACK_05_PERSONAL_COACH
STAGES=FIP_220_TO_FIP_290
IMPLEMENTATION=COMPLETE
TEST_EXECUTION=NOT_YET_REPORTED
MERGE_AUTHORIZATION=NOT_GRANTED
```
