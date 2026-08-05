# ACTIVITY FOUNDATIONAL AUTHORITIES CLOSURE REPORT

**Execution:** `FORGE_ACTIVITY_FOUNDATIONAL_AUTHORITIES_CLOSURE_001`  
**Repository:** `Jorgeprdz/ForgeOS`  
**Date:** 2026-08-05  
**Status:** `FOUNDATIONAL_AUTHORITIES=PASS`  
**UI status:** `ACTIVITY_UI_CODE=NOT_STARTED`

## 1. Constitutional gate

This delivery closes the foundational authority gaps required before the Aura Light Activity UI may be implemented. It does not implement, modify, mount, preview, or restyle the Activity UI.

Execution authority was limited by the owner instruction, ADR-023 recovery-before-rewrite, ADR-024 Aura Light visual governance, the existing FES source-of-truth boundary, Productive Reporting/Productivity ownership, RLS and tenant isolation, and the explicit prohibition against merging.

### Article 0 outcome

- no second Activity ledger;
- no second Activity writer;
- no second calendar engine;
- no copied points table;
- no human ranking, punishment or qualitative performance label;
- no automatic task, external calendar event, message send or business mutation;
- no UI, Aura, Material 3, HTML, CSS or root `app.js` change;
- no `main` mutation;
- no mutation of PR #274;
- no merge or auto-merge.

## 2. Stack and Git boundary

| Item | Verified value |
|---|---|
| Accepted upstream branch | `feature/aura-clean-runtime-productive-pipeline` |
| Accepted upstream SHA | `cbf493409fc9ff7787ec8da60a436cbed42dd12b` |
| Execution branch | `feature/activity-foundational-authorities-closure-001` |
| Merge base | `cbf493409fc9ff7787ec8da60a436cbed42dd12b` |
| Branch relation before this report | ahead only; behind `0` |
| `main` SHA during closure | `c011f08622b957dbb9fb1225a7d99e550d36c761` |
| PR #274 | open, Draft, unmerged, head unchanged at `cbf493409fc9ff7787ec8da60a436cbed42dd12b` |
| Merge authorization | `NOT_AUTHORIZED` |

The work was performed through the authenticated GitHub connector on the authorized remote branch. The user's local Termux working tree was not read, reset, stashed, cleaned, overwritten or otherwise mutated.

## 3. Reconciliation decision matrix

| Required authority | Existing state | Decision | Canonical result |
|---|---|---|---|
| Operational timezone and workweek | no versioned productive authority found | create minimal additive authority | `forge.operational_calendar.v1` |
| Holidays and working/non-working overrides | no governed source found | create minimal additive authority | `operational_day_overrides` |
| Advisor vacation/time-off | no governed source found | create minimal additive authority | `advisor_time_off_periods` |
| Activity facts | canonical FES ledger/writer already existed | extend existing contract only | `FES-01.2` on the same canonical contract path |
| Applications submitted | existing policy sales operations authority | reuse; do not re-own | `POLICY_SALES_OPERATIONS` |
| Policies paid | existing policy/payment authority | reuse; do not re-own | `POLICY_INTELLIGENCE_POLICY_OPERATIONS` |
| Activity conversion funnel | conceptual Productivity ownership but no concrete read model | create pure read model | `forge.productivity.activity_conversion.v1` |
| Daily points | recovered `daily-points-engine.js` authority | wrap with bounded adapter; do not copy rules | `ACTIVITY_POINTS_AUTHORITY_ADAPTER_V1` |

## 4. Created and extended authorities

### 4.1 Operational Calendar V1

Files:

- `platform/operational-calendar/operational-calendar-contract.js`
- `platform/operational-calendar/eligible-date-evaluator.js`
- `platform/operational-calendar/operational-calendar-repository.js`
- `supabase/migrations/20260805000100_activity_operational_calendar_authority.sql`

The authority owns only operational calendar truth required to resolve eligible work dates. It does not own productivity, performance evaluation, tasks or external calendar events.

#### Timezone semantics

1. use an active advisor-scoped IANA timezone profile when one exists;
2. otherwise inherit an active organization-scoped IANA timezone profile;
3. conflicting profiles produce `CONFLICTING`;
4. absence produces `UNKNOWN_TIMEZONE`;
5. no hard-coded organization or advisor timezone is used by the authority.

#### Eligible-date semantics

1. start from the effective versioned working weekdays;
2. apply confirmed advisor time-off as non-eligible;
3. apply explicit working-day overrides;
4. apply holidays, organization closures and non-working overrides;
5. conflicting overrides remain unknown/conflicting rather than being coerced;
6. return source references, schedule version, freshness and evidence state per date;
7. preserve local calendar dates across DST boundaries.

#### Time-off semantics

- tenant- and advisor-scoped;
- IANA timezone required;
- confirmed, cancelled and corrected states;
- append-only correction/supersession lineage;
- explicit source, evidence, actor, provenance and idempotency;
- private reasons, health/medical details, secrets and tokens prohibited from persisted provenance;
- no productivity or performance judgment field.

### 4.2 Exact additive persistence

The migration creates only:

- `public.operational_calendar_profiles`
- `public.operational_day_overrides`
- `public.advisor_time_off_periods`

Supporting functions:

- `public.forge_opcal_valid_working_weekdays(jsonb)`
- `public.forge_opcal_is_iana_timezone(text)`
- `public.forge_opcal_deny_mutation()`

Security properties:

- RLS enabled and forced on all three tables;
- authenticated access restricted to `auth.uid()` tenant/advisor scope;
- only `SELECT` and `INSERT` granted to authenticated users;
- no authenticated `UPDATE` or `DELETE` grant;
- append-only mutation-denial triggers provide defense in depth;
- tenant-scoped unique idempotency keys;
- tenant-qualified correction and supersession foreign keys;
- no destructive schema operation;
- no production deployment performed by this delivery.

### 4.3 FES Activity taxonomy closure

Canonical file extended in place:

- `platform/event-evidence/canonical-activity-event-contract.js`

Contract version:

- `FES-01.2`
- schema remains `forge.activity_event.v1`

New official Activity facts:

- `REFERRAL_RECEIVED`
- `CALL_COMPLETED`
- `ADVISOR_REFERRAL_RECEIVED`

Closing appointments are represented by the existing official `APPOINTMENT_HELD` fact with the governed discriminator:

- `appointment_purpose: "CLOSING"`

The distinction between `APPOINTMENT_SCHEDULED` and `APPOINTMENT_HELD` remains explicit. Application and policy-payment truth were deliberately not added to FES:

| Fact | Owner |
|---|---|
| referrals | `EVENT_EVIDENCE_FES` |
| completed calls | `EVENT_EVIDENCE_FES` |
| scheduled appointments | `EVENT_EVIDENCE_FES` |
| held appointments | `EVENT_EVIDENCE_FES` |
| closing appointments held | `EVENT_EVIDENCE_FES` |
| advisor referrals | `EVENT_EVIDENCE_FES` |
| applications submitted | `POLICY_SALES_OPERATIONS` |
| policies paid | `POLICY_INTELLIGENCE_POLICY_OPERATIONS` |

All canonical evidence, confirmation, provenance, idempotency, correction and safety-flag rules remain enforced. All business-action safety flags remain `false`.

### 4.4 Productivity conversion read model

File:

- `platform/productivity/activity-conversion-read-model.js`

Owner:

- `PRODUCTIVITY`

Schema:

- `forge.productivity.activity_conversion.v1`

Official funnel:

1. referrals → appointments scheduled;
2. appointments scheduled → appointments held;
3. appointments held → closing appointments held;
4. closing appointments held → applications submitted;
5. applications submitted → policies paid.

Advisor referrals remain a separate metric and are not silently inserted into the funnel.

The model:

- consumes the Operational Calendar eligible/excluded dates and timezone;
- validates the canonical owner of every input metric;
- rejects cross-tenant and cross-advisor facts;
- preserves full calculation precision and leaves display rounding to presentation;
- returns `NO_BASE` and `percentage: null` for a confirmed zero denominator;
- returns `UNKNOWN`, `INCOMPLETE`, `CONFLICTING`, `STALE`, `NO_PERMISSION` or `SESSION_REQUIRED` without inventing a percentage;
- forbids unknown-to-zero conversion;
- has no mutation, human score, strategy or recommendation authority.

### 4.5 Points authority adapter

File:

- `platform/productivity/activity-points-authority-adapter.mjs`

The adapter imports `DAILY_POINTS_RULES` and `calcularPuntosDiarios` directly from `daily-points-engine.js`. No point value is copied into the adapter.

Rules:

- all required metric envelopes must be complete, known, non-negative integers and owned by `PRODUCTIVITY` before the legacy calculator is called;
- any missing/unknown metric returns `INCOMPLETE` with `total: null`;
- explicit confirmed zero remains valid zero;
- qualitative legacy labels and momentum judgments are suppressed;
- a valid RuleSnapshot may confirm the recovered engine metadata;
- a conflicting or different RuleSnapshot blocks calculation rather than mixing authorities;
- point combinations disclose total, target reach and excess points.

Validated example:

- `3 llamadas + 1 cita agendada = 6 puntos`;
- against a remaining target of `5`, the adapter reports `excessPoints: 1` rather than misrepresenting the combination as exactly five.

## 5. Rejected alternatives

- hard-code Monday–Friday or `America/Mexico_City` as universal business truth;
- count all calendar days or weekdays as eligible without operational authority;
- infer vacation from missing Activity;
- persist private vacation reasons;
- create a second Activity ledger, second writer or parallel taxonomy;
- treat a scheduled appointment as a held appointment;
- move application or policy-payment truth into Activity;
- calculate a conversion from incomplete/conflicting facts;
- convert unknown values into zero;
- copy the points table into a new Activity module;
- expose legacy qualitative labels such as elite, legendary, weak or unstoppable;
- mount any UI before the authority gate passed.

## 6. Tests and evidence

### Focused contract tests

- `tests/activity-foundational-operational-calendar-test.mjs`
- `tests/activity-foundational-operational-calendar-rls-test.sql`
- `tests/activity-foundational-fes-taxonomy-test.mjs`
- `tests/activity-foundational-productivity-conversion-test.mjs`
- `tests/activity-foundational-points-adapter-test.mjs`

### Existing regressions

- FES Activity ledger browser runtime;
- productive Activity delivery;
- Activity Reports productive UI completion;
- NBA Reason Why boundary contract;
- NASH/Mick NBA reconnection engine.

### Hard acceptance workflow

Workflow:

- `.github/workflows/activity-foundational-authorities-ci.yml`

Successful run:

- run `31054421218`
- head `373056e97e0fc2f5056f5b5ee0cc8c40f74a23bf`
- conclusion `success`

The successful run proved together:

- focused JS authority tests;
- real PostgreSQL 16 migration execution;
- RLS tenant isolation;
- cross-tenant write rejection;
- idempotency uniqueness;
- correction/supersession lineage;
- authenticated update denial and append-only defense;
- existing FES/Activity regressions;
- NBA/NASH-Mick constitutional regressions;
- no forbidden UI/Aura/Material files;
- no likely committed secret pattern;
- zero parallel Activity ledgers;
- zero copied points-rule tables.

## 7. Changed files before this report

- `.github/workflows/activity-foundational-authorities-ci.yml`
- `docs/architecture/source-truth/FORGE_ACTIVITY_FOUNDATIONAL_AUTHORITY_RECONCILIATION_REPORT_001.md`
- `platform/event-evidence/canonical-activity-event-contract.js`
- `platform/operational-calendar/eligible-date-evaluator.js`
- `platform/operational-calendar/operational-calendar-contract.js`
- `platform/operational-calendar/operational-calendar-repository.js`
- `platform/productivity/activity-conversion-read-model.js`
- `platform/productivity/activity-points-authority-adapter.mjs`
- `supabase/migrations/20260805000100_activity_operational_calendar_authority.sql`
- `tests/activity-foundational-fes-taxonomy-test.mjs`
- `tests/activity-foundational-operational-calendar-rls-test.sql`
- `tests/activity-foundational-operational-calendar-test.mjs`
- `tests/activity-foundational-points-adapter-test.mjs`
- `tests/activity-foundational-productivity-conversion-test.mjs`

No HTML, CSS, Aura UI, Material 3 or root `app.js` file is included.

## 8. Commit ledger

| SHA | Purpose |
|---|---|
| `cfc1e6036e0b483e067459735d5e9dbcdadf8116` | reconciliation report |
| `da64fb3c8521ca81525ed0abfd3954db190ea05e` | operational calendar contract |
| `f90d0e24ad575f6cfd18ffc3f34ddeef3bd36423` | eligible-date evaluator |
| `9fb95000d342fcede7492bd17a405291e41df8da` | tenant-scoped calendar repository |
| `25287a2c3686df08dd56ae3c30e63cf7ddcbec74` | additive persistence and RLS |
| `cb893c84ead951fea15c1dc210dc7119ed5a4bde` | calendar/time-off tests |
| `1c52a0239307867cd7d1e3891cb24086ad4831d9` | FES taxonomy closure |
| `b0e6b2ea2e63d958d7900d5286a881c52686a129` | FES compatibility tests |
| `98a3590dd128fa7a1bc475a313968b5ebed9bd7b` | Productivity conversion read model |
| `f8aafb2361e85b9abcfa32315972e754e364cbb8` | conversion tests |
| `2721aef4e7899fda15f6c53a0913ed13ab161c59` | safe points adapter |
| `1f312f367cde613ab7b16468d6cd9f4f444db90e` | points adapter tests |
| `f968314ac0359bd057c0733f61fd38ba69ed5d65` | foundational CI gate |
| `1c3fa518d40314499d83cb372327c5478e12459f` | CI guard correction |
| `0d720aa7e1def350d4e3050c56483e9d98bc558b` | full-history diff guard |
| `42e5ffa8c0a558a299cebc5fee8198cb7c404f13` | hard acceptance guards |
| `2dbd716e3f4c6eb00d429b3b6ea54e19f5836010` | PostgreSQL/RLS acceptance harness |
| `7c5aaf260de62fff8062789405ef57080f0af86b` | PostgreSQL CI service execution |
| `373056e97e0fc2f5056f5b5ee0cc8c40f74a23bf` | append-only harness correction and final hard pass |

## 9. Known limitations and deployment boundary

- The new Supabase migration has been executed successfully against ephemeral PostgreSQL 16 in CI, but has not been applied to the production Supabase project by this delivery.
- No operational calendar profile, holiday or time-off production seed was invented.
- Until production persistence is deployed and configured, consumers must show an honest unavailable/unknown state rather than hard-coded workdays.
- The conversion model is an authority contract/read model; wiring real production metric loaders into the later Aura Activity UI remains a separate implementation phase.
- This closure does not authorize a merge, production migration, UI implementation, public deployment or PR #274 mutation.

## 10. Draft PR status

`PENDING_DRAFT_CREATION_AFTER_REPORT_GATE`

The intended stack is:

- base: `feature/aura-clean-runtime-productive-pipeline`
- head: `feature/activity-foundational-authorities-closure-001`

The PR must remain Draft. Auto-merge and merge remain forbidden.

## 11. Readiness declaration

```text
FOUNDATIONAL_AUTHORITIES=PASS
ACTIVITY_UI_READINESS=READY_WITH_AUTHORITIES
ACTIVITY_UI_CODE=NOT_STARTED
BRANCH_PUSHED=YES
DRAFT_PR=PENDING_CREATION
MERGE=NOT_AUTHORIZED
MAIN=UNTOUCHED
PR_274=UNMODIFIED
PRODUCTION_MIGRATION=NOT_EXECUTED
NEXT_PHASE=REQUIRES_SEPARATE_ACTIVITY_UI_IMPLEMENTATION_PROMPT
```
