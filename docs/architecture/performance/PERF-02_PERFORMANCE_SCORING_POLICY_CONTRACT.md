# PERF-02 — Performance Scoring Policy Contract

```text
PERF_02_PERFORMANCE_SCORING_POLICY_CONTRACT=IMPLEMENTED_ACCEPTED
PERFORMANCE_BRANCH=feature/performance-scoring-contract-foundation
SOURCE_COMMIT=357e1b9dec03e2336ec841e465f30d55c380662a
POLICY_SCHEMA=performance-scoring-policy.v1
PROJECTION_SCHEMA=performance-score-projection.v1
POLICY_ID=smnyl-advisor-daily-25.v1
DAILY_TARGET_POINTS=25
ACTIVITY_SCORING_AUTHORITY=NO
PERFORMANCE_POLICY_AUTHORITY=YES
RANKING_AUTHORITY=NO
HUMAN_WORTH_AUTHORITY=NO
ENFORCEMENT_AUTHORITY=NO
PRODUCTIVE_UI_MUTATION=NO
REMOTE_DATABASE_MUTATION=NO
```

## Decision

PERF-02 ratifies the existing 25-point daily activity rule as an operational
planning metric. It is not a human score, advisor ranking, manager judgment,
compensation rule or enforcement mechanism.

Performance consumes only `eligibleByType` from
`activity-period-aggregation.v1`. Activity remains authority for confirmation,
evidence, corrections and reversals.

## Mapping

| Activity type | Points |
|---|---:|
| `REFERRAL_ACQUIRED` | 3 |
| `CONTACT_ATTEMPTED` | 1 |
| `CONVERSATION_COMPLETED` | 0 |
| `INITIAL_APPOINTMENT_SCHEDULED` | 3 |
| `INITIAL_APPOINTMENT_COMPLETED` | 2 |
| `CLOSING_APPOINTMENT_SCHEDULED` | 0 |
| `CLOSING_APPOINTMENT_COMPLETED` | 3 |
| `APPLICATION_SUBMITTED` | 5 |
| `POLICY_PAID` | 10 |
| `FOLLOW_UP_COMPLETED` | 0 |

The legacy `referido_asesor = 10` rule is deferred because Activity v1 has no
canonical advisor-referral activity type.

`advisor-score-engine.js` and `advisor-performance-engine.js` are explicitly
excluded as authority because they contain conflicting formulas and subjective
levels.

## Daily semantics

- one evaluation date per projection;
- target 25, no cap;
- only Activity already eligible under the frozen Activity contract;
- zero-point Activity remains visible;
- statuses: `BELOW_TARGET`, `TARGET_MET`, `TARGET_EXCEEDED`;
- no ranking, human-worth judgment, manager override or enforcement.

## Next

`PERF-03_PERFORMANCE_PERIOD_RUNTIME`
