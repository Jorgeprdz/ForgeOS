# Phase 017B — Commercial Leverage Loop evidence

## Governance

- Miranda approval: `APPROVED_FOR_017B`.
- Board approval: `APPROVED_FOR_017B`.
- Implementation readiness: `READY_WITH_STRICT_SCOPE`.
- Article 0: preserved. Outputs are explanations and candidates for human review, never commands or execution.
- ROBOCOP Lock 001: preserved. No schema, migration, RLS, auth, dependency, lockfile, UI, or persistence change.
- ADRs applied: ADR-009 (NBA), ADR-010 (Nash), ADR-012 (Business Planning), ADR-014 (Productivity).
- ADR exception: not used.

## Authority map

| Loop boundary | Owner consumed | 017B result |
| --- | --- | --- |
| Goal | `ADVISOR_MONTHLY_POLICY_GOAL_SUPABASE_REPOSITORY` through Advisor Forecast | External truth preserved |
| Actual | `POLICY_SOLD_CONFIRMED` through Advisor Forecast | External truth preserved |
| Gap | Advisor Forecast Stage 10 | Validated, not recalculated as a new truth |
| Constraint | ADR-012 Business Planning | Read-only, evidence-bound interpretation |
| Action path | ADR-012 Business Planning | Human-considerable candidates only |
| Next action | Existing NBA Reason Why boundary | Reused directly |
| Conversation | Nash | Unchanged; downstream and human-approved |
| Review | Business Planning read model | Evidence fingerprint comparison only |
| Funnel facts | FES, Prospect Timeline, Policy Sales Operations | Read-only reconciliation; owners preserved |
| Recommendation → action | No global durable authority | Remains partial; no ledger created |
| Action → outcome | Domain facts only | Remains partial; no causal claim |

## Implemented boundary

The minimum runtime accepts the existing Advisor Forecast V2 output and a
scoped envelope around the existing Mi Día follow-up read model. It produces:

- goal, confirmed actual, and gap with their external owners;
- explicit constraint states;
- evidence references, freshness, limitations, and competing explanations;
- action-path candidates only for current, non-stale, overdue follow-up facts;
- `requiredActivity = UNKNOWN`;
- an evidence-driven review state;
- no writes or external actions.

The NBA adapter calls the existing NBA Reason Why contract. Business Planning
does not rank the candidate as a second NBA and cannot send, create a task,
create a calendar event, or mutate Pipeline.

## Acceptance cases

| Case | Result |
| --- | --- |
| Known gap, no constraint evidence | `INSUFFICIENT_EVIDENCE`; empty action path |
| Known gap plus current overdue follow-up | Evidence-bound constraint and candidate |
| Missing goal/actual/gap | `BLOCKED_BY_MISSING_EVIDENCE`; no false zero |
| Inconsistent gap or mixed goal/actual units | Rejected |
| Goal already covered | Gap `0`, `NOT_APPLICABLE`, no added sales pressure |
| Non-overdue or stale follow-up | Rejected/blocked; no inferred leakage |
| Human review boundary | NBA remains `READY_FOR_HUMAN_REVIEW`; no execution |
| Unchanged evidence | `NO_MATERIAL_CHANGE` |
| Changed canonical evidence | `EVIDENCE_CHANGED`; no causal attribution |

## Measurement boundary

The funnel reconciler supports only mapped, confirmed, advisor-scoped,
period-scoped facts with evidence and governed identity. It exposes narrow
stage counts and temporally ordered, identity-matched cohort conversion ratios
only when both stages have complete and compatible coverage. A confirmed empty complete source may produce an explicit
zero. Missing or partial coverage produces `null`, never zero.

Application coverage remains explicitly partial where its authority or mapping
is incomplete. `OUTPUT_PER_HOUR` is `NOT_MEASURABLE`; no global productivity
score or heterogeneous output/effort denominator was created.

Comparisons between periods report observed ratio-point changes. They do not
claim Forge uplift or causality.

## Validation

- Advisor Forecast Stages 9–10: 19/19 PASS.
- NBA Reason Why boundary: 19/19 PASS.
- Nash/Mick safe NBA reconnection: 19/19 PASS.
- Business Planning 017B: 9/9 PASS.
- Commercial funnel reconciliation 017B: 8/8 PASS.
- FES Mi Día projection: 28/28 PASS.
- Total focused checks: 102/102 PASS.

The Business Planning suite includes an integrated productive path:

`Advisor Forecast V2 → Mi Día follow-up read model → Business Planning → NBA`.

No UI changed, so authenticated browser and responsive acceptance are not
applicable to this domain/read-model phase.

## Known limitations and readiness

- Business Planning supports one demonstrated constraint family: overdue
  follow-up evidence. It does not declare this the sole cause of a gap.
- No generic bottleneck taxonomy was created.
- Required activity remains unknown.
- Application-stage completeness must be established by its authority before
  that transition can be considered complete.
- Recommendation/action association and a global outcome review ledger remain
  outside the authorized persistence boundary.
- Historical comparisons are mechanically supported, but production data
  completeness has not been established here.

`COMMERCIAL_PROMISE_READINESS = BASELINE_READY`

This means Forge can construct evidence-qualified stage baselines when source
coverage is complete. It does not mean a pilot has run, an uplift exists, or
Forge caused any observed outcome.

## Manual work delta

- New manual fields: 0.
- New required advisor actions: 0.
- Duplicate capture: 0.
- Net advisor workload impact: no additional capture.
