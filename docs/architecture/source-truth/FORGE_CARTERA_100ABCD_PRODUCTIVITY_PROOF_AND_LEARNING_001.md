# FORGE CARTERA 100A–100D — PRODUCTIVITY PROOF AND LEARNING 001

## Program position

Cartera 100 implements Roadmap Point 10 and closes the planned Cartera Relationship Intelligence sequence.

The objective is to demonstrate, with evidence and honest limitations, whether Cartera reduces administrative work, protects income, enables responsible growth and improves observable productivity without converting operational metrics into judgment about the advisor.

## Governing boundaries

This phase is subordinate to ADR-014 Productivity Metric Ownership Boundary.

Productivity may measure observable activity, throughput, conversion and output only when source, owner, period, freshness, evidence and limitation are explicit.

Productivity does not own:

- behavior truth;
- motivation, discipline or coachability truth;
- human worth or advisor potential;
- ranking or employment evaluation;
- manager conclusions or enforcement;
- forecast, compensation, policy or relationship truth;
- autonomous contact, message, task, calendar or opportunity execution.

The legacy `advisor-score-engine.js` is not an authority for Cartera 100 and is not imported, reused or promoted.

## One-pass decomposition

### 100A — Evidence-bound productivity proof

A canonical contract represents each metric with:

- metric key and category;
- state: `KNOWN`, `ZERO`, `UNKNOWN`, `MISSING`, `STALE`, `INCOMPLETE` or `CONFLICTING`;
- value and unit only when permitted by state;
- source authority and owner;
- evidence references;
- freshness, confidence and limitations.

An explicit zero requires direct scan or source evidence. Unknown and missing cannot carry a value. Ratios are calculated only when numerator and denominator are evidence-backed and the denominator is non-zero.

The proof groups roadmap metrics into:

- work reduction;
- income protection;
- responsible growth;
- observable productivity;
- explicit learning feedback.

### 100B — Outcome attribution and learning boundary

Forge may observe that a recommendation was reviewed or that a related state transition occurred. It must not claim that Forge caused the business outcome without sufficient evidence.

Learning requires explicit advisor feedback:

- useful;
- not useful;
- happened independently.

Silence is never permission. Temporal proximity alone is not causal proof. Independent feedback removes causal credit instead of penalizing the advisor.

### 100C — Durable observation authority and composed proof

Cartera 100 adds an owner-scoped append-only observation ledger with:

- digest-bound explicit authorization;
- idempotent replay;
- changed-input conflict;
- source and evidence provenance;
- attribution and feedback state;
- RLS isolation;
- no direct authenticated writes.

The read model composes the observation ledger with existing authorities where semantics are already reliable:

- Cartera 040 confirmed relationship reviews;
- Cartera 040 client-confirmed willingness to introduce;
- Cartera 030 confirmed payment events linked to expected obligations.

Disconnected authorities remain `NOT_CONNECTED`; their metrics remain missing rather than zero.

Instrumentation coverage is explicit. A period that predates instrumentation is marked partial and cannot be presented as a complete total.

### 100D — Productive proof and learning surface

A productive Cartera surface is mounted after 090D. It shows:

- the evidence-backed roadmap statement when available;
- metrics by category;
- source and completeness state;
- derived ratios only when valid;
- explicit feedback controls for accepted recommendations;
- a permanent notice that the surface is not a score, ranking or pressure mechanism.

The surface records only explicit advisor review, explicit completion with a state-transition reference, explicit generic proof observations from authorized modules and explicit feedback clicks.

## Required statement behavior

Cartera may say, for example:

> In this period Forge has evidence of 3.0 administrative hours avoided, 4 protected-payment events and 2 responsible growth reviews.

Cartera must instead say evidence is insufficient when the required metrics are missing, stale, incomplete or conflicting.

The statement never claims that Forge caused production, income or conversion merely because events occurred near recommendations.

## Current implementation state

```text
CARTERA_100A_EVIDENCE_BOUND_PRODUCTIVITY_PROOF=IMPLEMENTED
CARTERA_100B_OUTCOME_AND_LEARNING_BOUNDARY=IMPLEMENTED
CARTERA_100C_DURABLE_OBSERVATION_AND_READ_MODEL=IMPLEMENTED
CARTERA_100D_PRODUCTIVE_SURFACE=IMPLEMENTED_PENDING_APP_MATERIALIZATION
REMOTE_DATABASE_MUTATION=PENDING_GUARDED_ACCEPTANCE
REMOTE_ACCEPTANCE=PENDING
ACCOUNT_MUTATION=NOT_AUTHORIZED
MAIN_MUTATION=NOT_AUTHORIZED
MERGE_AUTHORIZATION=NOT_GRANTED
```
