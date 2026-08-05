# ACTIVITY FOUNDATIONAL AUTHORITIES CLOSURE REPORT

**Execution:** `FORGE_ACTIVITY_FOUNDATIONAL_AUTHORITIES_CLOSURE_001`  
**Repository:** `Jorgeprdz/ForgeOS`  
**Date:** 2026-08-05  
**Status:** `FOUNDATIONAL_AUTHORITIES=PASS`  
**UI status:** `ACTIVITY_UI_CODE=NOT_STARTED`  
**Draft PR:** `#275`

## 1. Constitutional gate

This delivery closes the authority gaps required before implementation of the Aura Light Activity UI. It contains no Activity UI implementation, visual redesign, preview or mount.

Enforced boundaries:

- ADR-023 recovery before rewrite;
- ADR-024 remains visual authority for the later UI phase;
- one canonical FES Activity ledger and writer;
- one Operational Calendar authority;
- Productive Reporting/Productivity ownership preserved;
- RLS, tenant isolation and explicit evidence states;
- no human ranking, punishment or qualitative performance labels;
- no automatic task, external calendar event, message send or business mutation;
- no HTML, CSS, Aura, Material 3 or root `app.js` change;
- no merge or auto-merge.

## 2. Git and stack boundary

| Item | Verified value |
|---|---|
| Accepted upstream branch | `feature/aura-clean-runtime-productive-pipeline` |
| Accepted upstream SHA / merge base | `cbf493409fc9ff7787ec8da60a436cbed42dd12b` |
| Execution branch | `feature/activity-foundational-authorities-closure-001` |
| Draft PR | `#275` |
| PR base | `feature/aura-clean-runtime-productive-pipeline` |
| PR head | `feature/activity-foundational-authorities-closure-001` |
| PR state | `OPEN / DRAFT / UNMERGED` |
| `main` observed SHA | `c011f08622b957dbb9fb1225a7d99e550d36c761` |
| PR #274 | `OPEN / DRAFT / UNMERGED`, head unchanged at `cbf493409fc9ff7787ec8da60a436cbed42dd12b` |
| Merge authorization | `NOT_AUTHORIZED` |

Work was performed through the authenticated GitHub connector on the authorized branch. The user's local Termux working tree was not reset, stashed, cleaned or overwritten.

## 3. Reconciliation decisions

| Required authority | Decision | Canonical result |
|---|---|---|
| advisor/organization timezone and workweek | create minimal additive authority | `forge.operational_calendar.v1` |
| holidays and workday overrides | create inside the same calendar authority | `operational_day_overrides` |
| advisor vacation/time-off | create inside the same calendar authority | `advisor_time_off_periods` |
| Activity facts | extend the existing FES contract only | `FES-01.2` |
| applications submitted | reuse existing owner | `POLICY_SALES_OPERATIONS` |
| policies paid | reuse existing owner | `POLICY_INTELLIGENCE_POLICY_OPERATIONS` |
| conversion funnel | create pure Productivity read model | `forge.productivity.activity_conversion.v1` |
| daily points | wrap recovered engine; copy no rules | `ACTIVITY_POINTS_AUTHORITY_ADAPTER_V1` |

Rejected: hard-coded weekdays/timezone, vacation inferred from inactivity, second ledger/writer/calendar engine, policy truth re-owned by Activity, unknown-to-zero conversion, copied baremo, or UI mounted before authority acceptance.

## 4. Operational Calendar V1

Files:

- `platform/operational-calendar/operational-calendar-contract.js`
- `platform/operational-calendar/eligible-date-evaluator.js`
- `platform/operational-calendar/operational-calendar-repository.js`
- `supabase/migrations/20260805000100_activity_operational_calendar_authority.sql`

### Semantics

- advisor-scoped active IANA timezone wins;
- organization-scoped active IANA timezone is the fallback;
- missing timezone returns `UNKNOWN_TIMEZONE`;
- conflicting timezone or day overrides return `CONFLICTING`;
- working weekdays are versioned and configurable;
- confirmed time-off excludes dates;
- working overrides, holidays, organization closures and non-working overrides are explicit;
- DST boundaries preserve local calendar dates;
- every date carries source, evidence, freshness and schedule-version references;
- no productivity judgment is owned by this authority.

### Additive persistence

Tables:

- `public.operational_calendar_profiles`
- `public.operational_day_overrides`
- `public.advisor_time_off_periods`

Supporting functions:

- `public.forge_opcal_valid_working_weekdays(jsonb)`
- `public.forge_opcal_is_iana_timezone(text)`
- `public.forge_opcal_deny_mutation()`

Security:

- RLS enabled and forced on all three tables;
- authenticated scope bound to `auth.uid()`;
- authenticated users receive only `SELECT` and `INSERT`;
- no authenticated `UPDATE` or `DELETE` grant;
- append-only triggers remain defense in depth;
- tenant-scoped idempotency uniqueness;
- tenant-qualified correction/supersession foreign keys;
- privacy constraints prohibit health/medical reasons, secrets and tokens in provenance;
- no destructive migration operation.

## 5. FES Activity taxonomy closure

Canonical path extended in place:

- `platform/event-evidence/canonical-activity-event-contract.js`

Version:

- `FES-01.2`
- schema remains `forge.activity_event.v1`

Added official Activity facts:

- `REFERRAL_RECEIVED`
- `CALL_COMPLETED`
- `ADVISOR_REFERRAL_RECEIVED`

Closing appointments use existing `APPOINTMENT_HELD` with:

- `appointment_purpose: "CLOSING"`

`APPOINTMENT_SCHEDULED` and `APPOINTMENT_HELD` remain distinct. Applications and policy payments were not added to FES.

| Fact | Canonical owner |
|---|---|
| referrals, calls, scheduled/held/closing appointments, advisor referrals | `EVENT_EVIDENCE_FES` |
| applications submitted | `POLICY_SALES_OPERATIONS` |
| policies paid | `POLICY_INTELLIGENCE_POLICY_OPERATIONS` |

Evidence, confirmation, provenance, idempotency, correction and all-false safety flags remain mandatory.

## 6. Productivity conversion read model

File:

- `platform/productivity/activity-conversion-read-model.js`

Official funnel:

1. referrals → scheduled appointments;
2. scheduled → held appointments;
3. held → closing appointments held;
4. closing appointments → applications submitted;
5. applications submitted → policies paid.

Advisor referrals remain separate. The model consumes the Operational Calendar period/timezone, validates metric owners and tenant/advisor scope, preserves calculation precision, returns `NO_BASE` with `null` percentage for a confirmed zero denominator, and never converts unknown, incomplete, conflicting or stale evidence into zero.

The read model owns no mutation, human score, strategy or recommendation output.

## 7. Safe points adapter

File:

- `platform/productivity/activity-points-authority-adapter.mjs`

The adapter imports `DAILY_POINTS_RULES` and `calcularPuntosDiarios` from `daily-points-engine.js`; it contains zero copied point rules.

It blocks calculation unless every metric envelope is complete, known, non-negative and owned by `PRODUCTIVITY`; explicit confirmed zero remains zero; legacy qualitative labels are suppressed; conflicting RuleSnapshots block calculation rather than mixing authorities.

Validated combination:

- `3 llamadas + 1 cita agendada = 6 puntos`;
- with `5` points remaining, the result reports `excessPoints: 1`.

## 8. Acceptance evidence

Focused tests:

- `tests/activity-foundational-operational-calendar-test.mjs`
- `tests/activity-foundational-operational-calendar-rls-test.sql`
- `tests/activity-foundational-fes-taxonomy-test.mjs`
- `tests/activity-foundational-productivity-conversion-test.mjs`
- `tests/activity-foundational-points-adapter-test.mjs`

Existing regressions:

- FES Activity ledger browser runtime;
- productive Activity delivery;
- Activity Reports productive completion;
- NBA Reason Why boundary;
- NASH/Mick NBA reconnection.

Successful hard gates:

| Run | Head | Result |
|---|---|---|
| `31054421218` | `373056e97e0fc2f5056f5b5ee0cc8c40f74a23bf` | `success` |
| `31054546620` | `d7fd8abd852592128d3a0b9657889687c8e47311` | `success` |

These runs jointly proved:

- JS authority contracts;
- PostgreSQL 16 migration execution;
- RLS and cross-tenant write/read isolation;
- idempotency;
- correction/supersession lineage;
- authenticated update denial and append-only defense;
- FES/Activity and NBA/NASH-Mick regressions;
- no forbidden UI/Aura/Material files;
- no likely committed secret pattern;
- zero parallel Activity ledgers;
- zero copied points-rule authorities.

## 9. Changed files

- `.github/workflows/activity-foundational-authorities-ci.yml`
- `docs/architecture/source-truth/FORGE_ACTIVITY_FOUNDATIONAL_AUTHORITY_RECONCILIATION_REPORT_001.md`
- `docs/architecture/source-truth/ACTIVITY_FOUNDATIONAL_AUTHORITIES_CLOSURE_REPORT.md`
- `platform/event-evidence/canonical-activity-event-contract.js`
- `platform/operational-calendar/eligible-date-evaluator.js`
- `platform/operational-calendar/operational-calendar-contract.js`
- `platform/operational-calendar/operational-calendar-repository.js`
- `platform/productivity/activity-conversion-read-model.js`
- `platform/productivity/activity-points-authority-adapter.mjs`
- `supabase/migrations/20260805000100_activity_operational_calendar_authority.sql`
- five focused JavaScript/SQL acceptance tests under `tests/activity-foundational-*`.

No HTML, CSS, Aura UI, Material 3 or root `app.js` file is included.

## 10. Commit ledger

| SHA | Purpose |
|---|---|
| `cfc1e6036e0b483e067459735d5e9dbcdadf8116` | reconciliation report |
| `da64fb3c8521ca81525ed0abfd3954db190ea05e` | Operational Calendar contract |
| `f90d0e24ad575f6cfd18ffc3f34ddeef3bd36423` | eligible-date evaluator |
| `9fb95000d342fcede7492bd17a405291e41df8da` | calendar repository |
| `25287a2c3686df08dd56ae3c30e63cf7ddcbec74` | persistence and RLS |
| `cb893c84ead951fea15c1dc210dc7119ed5a4bde` | calendar tests |
| `1c52a0239307867cd7d1e3891cb24086ad4831d9` | FES taxonomy |
| `b0e6b2ea2e63d958d7900d5286a881c52686a129` | FES tests |
| `98a3590dd128fa7a1bc475a313968b5ebed9bd7b` | conversion model |
| `f8aafb2361e85b9abcfa32315972e754e364cbb8` | conversion tests |
| `2721aef4e7899fda15f6c53a0913ed13ab161c59` | points adapter |
| `1f312f367cde613ab7b16468d6cd9f4f444db90e` | points tests |
| `f968314ac0359bd057c0733f61fd38ba69ed5d65` | CI gate |
| `1c3fa518d40314499d83cb372327c5478e12459f` | CI guard repair |
| `0d720aa7e1def350d4e3050c56483e9d98bc558b` | full-history guard |
| `42e5ffa8c0a558a299cebc5fee8198cb7c404f13` | hard guards |
| `2dbd716e3f4c6eb00d429b3b6ea54e19f5836010` | PostgreSQL/RLS harness |
| `7c5aaf260de62fff8062789405ef57080f0af86b` | PostgreSQL CI execution |
| `373056e97e0fc2f5056f5b5ee0cc8c40f74a23bf` | append-only harness closure |
| `d7fd8abd852592128d3a0b9657889687c8e47311` | initial closure report |

The final PR-status report update is the commit containing this document and is visible as the current head of Draft PR #275.

## 11. Known limitations and deployment boundary

- The migration passed ephemeral PostgreSQL 16 CI but was not applied to production Supabase.
- No production timezone, workweek, holiday or vacation seed was invented.
- Until deployed and configured, consumers must return honest unknown/unavailable states.
- Real production loaders and Aura Activity UI wiring remain a separate phase.
- No public deployment, production migration, merge or UI implementation is authorized here.

## 12. Readiness declaration

```text
FOUNDATIONAL_AUTHORITIES=PASS
ACTIVITY_UI_READINESS=READY_WITH_AUTHORITIES
ACTIVITY_UI_CODE=NOT_STARTED
BRANCH_PUSHED=YES
DRAFT_PR=OPEN_#275
DRAFT_PR_BASE=feature/aura-clean-runtime-productive-pipeline
DRAFT_PR_HEAD=feature/activity-foundational-authorities-closure-001
MERGE=NOT_AUTHORIZED
MAIN=UNTOUCHED
PR_274=UNMODIFIED
PRODUCTION_MIGRATION=NOT_EXECUTED
NEXT_PHASE=REQUIRES_SEPARATE_ACTIVITY_UI_IMPLEMENTATION_PROMPT
```
