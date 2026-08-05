# Forge Activity Foundational Authority Reconciliation Report 001

Task: `FORGE_ACTIVITY_FOUNDATIONAL_AUTHORITIES_CLOSURE_001`

Date: 2026-08-05

Accepted base: `feature/aura-clean-runtime-productive-pipeline@cbf493409fc9ff7787ec8da60a436cbed42dd12b`

Working branch: `feature/activity-foundational-authorities-closure-001`

## Gates

- `ARTICLE_0_GATE=PASS`
- `ROBOCOP_GATE=PASS_FOR_BOUNDED_FOUNDATIONAL_CLOSURE`
- `RECOVERY_AUDIT=COMPLETE`
- `WORKING_TREE_PROTECTION=PASS_REMOTE_CLEANROOM`
- `LOCAL_TERMUX_WORKTREE=NOT_TOUCHED_OR_MUTATED`
- `PR_274_MUTATION=FORBIDDEN`
- `UI_IMPLEMENTATION=FORBIDDEN`

The remote branch was created directly from the accepted immutable commit. No local reset, stash, clean, overwrite, force push, main mutation or PR #274 mutation is part of this phase.

## Reconciliation Matrix

| Workstream | Searched authorities | Current owner | Existing candidates | Decision | Exact gap | Minimal closure |
|---|---|---|---|---|---|---|
| Operational calendar | repository tree; Supabase migrations; profile/settings, schedule, timezone, holiday, vacation, leave and absence candidates | OPERATIONAL_CALENDAR | Activity Reports period helpers and payment-calendar code are consumers/domain-specific utilities, not operational-date authorities | CREATE_MINIMAL_AUTHORITY | no tenant/advisor operational timezone, working schedule, day override or time-off authority | versioned contracts, pure eligible-date evaluator, tenant-scoped repositories and three additive tables |
| Timezone | Activity Reports runtime and tracked settings/profile candidates | OPERATIONAL_CALENDAR | `America/Mexico_City` appears as a local runtime default only | REJECT default; CREATE_MINIMAL_AUTHORITY | browser/server/hardcoded timezone cannot become truth | advisor profile → organization profile → unresolved resolution contract using explicit IANA values |
| Advisor time off | repository tree and migration inventory | OPERATIONAL_CALENDAR | no canonical time-off table or contract found | CREATE_MINIMAL_AUTHORITY | no auditable confirmed/cancelled/corrected exclusion source | append-only/superseding advisor time-off table and contract without sensitive reason text |
| Activity ledger | `platform/event-evidence/*`; FES migration; browser runtime and sync gateway | EVENT_EVIDENCE/FES | canonical append-only `activity_event_ledger`, evidence references, mutation receipts and conflict storage | REUSE | none at ledger/writer level | preserve the existing ledger and writer; no second ledger or writer |
| Activity fact taxonomy | canonical Activity event contract and FES ledger | source fact owners + FES for operational facts | appointments already represented; generic ACTIVITY subject exists | EXTEND | calls, referrals, advisor referrals and closing-appointment purpose lack governed fact descriptors | additive companion taxonomy contract consumed by the existing canonical event contract; no table |
| Scheduled/effective appointment | FES event types | FES appointment authority | `APPOINTMENT_SCHEDULED`, `APPOINTMENT_HELD`, not-held/rescheduled/no-show | REUSE | no gap for scheduled/effective distinction | scheduled remains scheduled; effective means HELD only |
| Closing appointment | FES appointment payload | FES appointment authority | existing appointment events | EXTEND | closing purpose not governed | require `appointmentPurpose=CLOSING` on `APPOINTMENT_HELD`; do not create a second appointment system |
| Submitted application | CRS06/CRS07 application signature and lineage migrations | POLICY/SALES OPERATIONS | canonical signed/submitted application authority exists | REUSE/WRAP | Activity must consume without re-owning | source adapter/read-model input only; no FES official application truth |
| Paid policy | confirmed payment reconciliation and policy-payment read migrations | POLICY INTELLIGENCE / POLICY OPERATIONS | confirmed payment event authority exists | REUSE/WRAP | Activity must consume without re-owning | source adapter/read-model input only; manual Activity evidence remains provisional |
| Productivity metrics | ADR-014; CARTERA100 observation/proof migrations; Activity reporting runtime | PRODUCTIVITY | evidence-bound observations and reporting projections | EXTEND | no official five-step Activity funnel read model with completeness/conflict/no-base semantics | pure versioned Productivity conversion read model consuming source-owner metric envelopes and operational calendar output |
| Points | `daily-points-engine.js`; RuleSnapshot governance candidates | PRODUCTIVITY | recovered eight-weight authority and objective 25 | WRAP | legacy unknown-to-zero and qualitative judgment leakage | one adapter importing weights/engine, blocking incomplete input and suppressing all qualitative labels |
| Material 3 / legacy Activity | prior UI and legacy stores | none for this closure | reference implementations only | REFERENCE_ONLY / REJECT runtime | prohibited by scope and duplicate-truth risk | no imports, no UI mutation, no legacy store use |

## Activity Fact Owner Map

| Metric | Owner | Canonical source | Manual confirmation | FES extension | Activity may edit official truth | Evidence state |
|---|---|---|---|---|---|---|
| Referidos | FES operational Activity | canonical referral fact in existing FES ledger | yes, advisor-confirmed | yes | only append/correct own evidence | REPORTED/CONFIRMED |
| Llamadas | FES operational Activity | canonical completed-call fact in existing FES ledger | yes | yes | only append/correct own evidence | SYSTEM_OBSERVED/CONFIRMED/REPORTED |
| Citas agendadas | FES appointment | `APPOINTMENT_SCHEDULED` | governed existing path | no | no redefinition | source state |
| Citas efectivas | FES appointment | `APPOINTMENT_HELD` | governed existing path | no | no inference from scheduled | source state |
| Citas de cierre | FES appointment | `APPOINTMENT_HELD` plus governed `CLOSING` purpose | yes when evidence permits | minimal payload taxonomy | no second appointment truth | source state |
| Solicitudes ingresadas | Policy/Sales Operations | CRS06/CRS07 submitted/signed application authority | provisional candidate only | no official re-ownership | no | owner-confirmed/provisional |
| Pólizas pagadas | Policy Intelligence/Operations | confirmed payment reconciliation/read authority | provisional candidate only | no official re-ownership | no | owner-confirmed/provisional |
| Referidos de asesor | FES operational Activity | canonical advisor-referral fact in existing FES ledger | yes | yes | only append/correct own evidence | REPORTED/CONFIRMED |

## Migration Necessity Report

### Existing tables and columns searched

- FES Activity ledger, evidence references, mutation receipts and conflicts.
- prospect/timeline/due-action stores.
- identity, policy, application-signature and confirmed-payment authorities.
- Productivity observation/proof authorities.
- monthly goal and tenant-login foundations.

### Gap

No tracked store owns operational timezone inheritance, effective working weekdays, operational-day overrides or advisor time-off periods.

### Minimum additive schema

1. `operational_calendar_profiles`
2. `operational_day_overrides`
3. `advisor_time_off_periods`

### Ownership and tenant boundary

- Owner: `OPERATIONAL_CALENDAR`.
- `tenant_id` and `advisor_id` use authenticated UUID scope.
- Advisor-scoped reads/writes require `auth.uid()` equality.
- Organization profiles are tenant-scoped and are not globally readable.

### RLS plan

- enable and force RLS;
- revoke anonymous access;
- authenticated advisor access limited to own tenant/advisor records;
- no service-role secret in browser;
- preserve stricter existing policies;
- append-only or auditable supersession guards.

### Rollback/disable strategy

The migration is additive. Runtime adoption is opt-in by later consumers. Rollback consists of disabling the consumer; no destructive down migration or production data deletion is required.

### Declarations

- `ADDITIVE=YES`
- `DESTRUCTIVE=NO`
- `DROP_TABLE=NO`
- `DROP_COLUMN=NO`
- `PRODUCTION_DATA_DELETE=NO`
- `TENANT_SCOPED=YES`
- `RLS_NON_WEAKENING=YES`
- `PARALLEL_ACTIVITY_TRUTH=NO`

## Conflict Risks Resolved

- Activity Reports hardcoded timezone remains a legacy consumer default and is not promoted to authority.
- Payment-calendar code remains Policy Operations logic and is not reused as a business-day calendar.
- FES remains the single Activity ledger/writer.
- Policy-paid and application-submitted facts remain owned by their domains.
- Productivity owns conversion interpretation but not source facts.
- `daily-points-engine.js` remains the only recovered weights table; new code must not copy `DAILY_POINTS_RULES`.

## Implementation Decisions

- `DUPLICATE_AUTHORITY_RISK=RESOLVED`
- `OPERATIONAL_CALENDAR=CREATE_MINIMAL_AUTHORITY`
- `ADVISOR_TIME_OFF=CREATE_MINIMAL_AUTHORITY`
- `FES_LEDGER=REUSE`
- `FES_FACT_TAXONOMY=EXTEND`
- `APPLICATION_FACT=REUSE_FROM_OWNER`
- `POLICY_PAYMENT_FACT=REUSE_FROM_OWNER`
- `PRODUCTIVITY_CONVERSION_READ_MODEL=EXTEND`
- `POINTS_AUTHORITY=WRAP`
- `NEW_GENERIC_ENGINE=REJECT`
- `UI_FILES_CHANGED=ZERO`

Implementation may proceed sequentially A → B → C → D. Each phase must remain pure or persistence-bounded, preserve unknowns, and create no task, external calendar event, message, recommendation, ranking, punishment or automated business action.
