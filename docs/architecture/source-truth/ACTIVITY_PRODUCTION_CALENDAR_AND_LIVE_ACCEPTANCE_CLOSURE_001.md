# ACTIVITY PRODUCTION CALENDAR AND LIVE ACCEPTANCE CLOSURE 001

**Execution:** `OPERATIONAL_CALENDAR_PRODUCTION_MIGRATION_AND_ACTIVITY_LIVE_ACCEPTANCE`  
**Repository:** `Jorgeprdz/ForgeOS`  
**Date:** `2026-08-05`  
**Base:** `feature/aura-activity-productive-ui-001@bafe9e331bb26671b8528f6b942ac2e8b7b368df`  
**Branch:** `feature/activity-live-acceptance-001`  
**Merge:** `NOT_AUTHORIZED`

## Result

The governed Operational Calendar migration was applied to the authorized production Supabase project and validated through the existing Management API deployment path.

The Activity public acceptance build remains blocked only by the repository-level GitHub Pages source setting. The workflow token correctly refused to mutate that administrative setting. No prior branch was overwritten and no prior Draft PR was changed.

## Production authority deployed

Migration:

- `supabase/migrations/20260805000100_activity_operational_calendar_authority.sql`

Production objects validated:

- `public.operational_calendar_profiles`;
- `public.operational_day_overrides`;
- `public.advisor_time_off_periods`.

Validated security and persistence boundaries:

- forced RLS;
- authenticated owner visibility;
- cross-tenant denial;
- anonymous denial;
- authenticated update/delete denial;
- append-only protection;
- idempotent profile seed;
- read-after-write;
- no destructive SQL;
- no invented vacation period;
- no invented holiday.

## Confirmed operational configuration

The production profile was created only from confirmed owner context:

- timezone: `America/Mexico_City`;
- working weekdays: `MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY`;
- status: `ACTIVE`;
- evidence: `CONFIRMED`;
- owner: `OPERATIONAL_CALENDAR`;
- vacation periods seeded: `0`;
- holidays seeded: `0`.

No private reason or sensitive absence data was stored.

## Workflow evidence

Workflow:

- `.github/workflows/activity-live-acceptance.yml`

Production deployer:

- `scripts/deploy-activity-operational-calendar-production.mjs`

Successful final gate run:

- run: `31068675932`;
- migration and validation job: `PASS`;
- Pages source detector: `PASS`;
- public publish/smoke: `SKIPPED_BY_SOURCE_GATE`.

Earlier failures were bounded before or after the production migration and were corrected without destructive actions:

1. invalid Node import, before database mutation;
2. blocked GitHub Pages environment;
3. incorrect acceptance CSS filename;
4. unsupported `deploy-pages` path for a legacy branch-sourced Pages site;
5. workflow token denied changing repository Pages source with HTTP 403.

## Pages source boundary

Observed repository Pages configuration:

```text
BUILD_TYPE=legacy
SOURCE_BRANCH=feature/aura-clean-runtime-productive-pipeline
SOURCE_PATH=/docs
STATUS=built
```

Required temporary acceptance source:

```text
SOURCE_BRANCH=feature/activity-live-acceptance-001
SOURCE_PATH=/docs
```

The workflow's standard `GITHUB_TOKEN` has `pages:write` but does not have repository administration permission to update the legacy Pages source. GitHub returned:

```text
HTTP=403
MESSAGE=Resource not accessible by integration
```

The final workflow therefore treats the source as an explicit manual gate. Once the repository setting is changed, rerunning the workflow will:

1. verify the configured source;
2. request a legacy Pages build;
3. bind acceptance to the exact branch head;
4. smoke-test the Activity route and published assets.

## Required manual repository setting

In GitHub:

```text
Settings
→ Pages
→ Build and deployment
→ Deploy from a branch
→ Branch: feature/activity-live-acceptance-001
→ Folder: /docs
→ Save
```

Then dispatch:

```text
Activity Production Calendar and Live Acceptance
```

Expected public route after build:

```text
https://jorgeprdz.github.io/ForgeOS/static-preview/forge-aura/auth-v4.html?route=actividad
```

## Invariants

```text
MAIN=UNTOUCHED
PR_274=UNMODIFIED
PR_275=UNMODIFIED
PR_276=UNMODIFIED
MERGE=NOT_AUTHORIZED
AUTO_MERGE=NOT_AUTHORIZED
FORCE_PUSH=NO
DESTRUCTIVE_MIGRATION=NO
INVENTED_VACATIONS=ZERO
INVENTED_HOLIDAYS=ZERO
```

## Closure state

```text
OPERATIONAL_CALENDAR_PRODUCTION_MIGRATION=PASS
OPERATIONAL_CALENDAR_PROFILE_CONFIGURATION=PASS
TIMEZONE_AUTHORITY=America/Mexico_City
WORKING_WEEKDAYS=MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY
VACATION_AUTHORITY=READY_NO_INVENTED_PERIODS
RLS_TENANT_ISOLATION=PASS
APPEND_ONLY=PASS
READ_AFTER_WRITE=PASS
FOUNDATIONAL_AND_UI_REGRESSIONS=PASS
PAGES_SOURCE_GATE=BLOCKED_MANUAL_ADMIN_SETTING
ACTIVITY_PUBLIC_BUILD=NOT_EXECUTED
ACTIVITY_PUBLIC_SMOKE=NOT_EXECUTED
LIVE_ACCEPTANCE=PARTIAL_PENDING_PAGES_SOURCE_SWITCH
```
