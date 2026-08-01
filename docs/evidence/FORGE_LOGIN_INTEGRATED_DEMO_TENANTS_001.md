# ForgeOS — Login-Integrated Productive Demo Tenants 001

## Product decision

The demo is entered from the existing login surface and uses the same productive runtime, Supabase project, RLS model, routes and domain authorities as every other advisor account.

```text
SEPARATE_DEMO_RUNTIME=NO
QUERY_PARAMETER_DEMO_MODE=NO
PARALLEL_DEMO_DOMAIN_TABLES=NO
PRODUCTIVE_RUNTIME_REUSE=YES
PRODUCTIVE_SUPABASE_REUSE=YES
```

The login exposes one action:

```text
Explorar ForgeOS con datos demo
```

The browser never receives a stored demo password. A Supabase Edge Function uses server-side authority to generate a short-lived magic-link entry for the configured public demo advisor.

## Demo tenants

```text
PUBLIC_A=PUBLIC_DEMO_ACCOUNT
CONTROL_B=RLS_AND_FRICTION_CONTROL
DATA_CLASS=SYNTHETIC
REAL_CLIENT_DATA=NO
```

Usuario A is the public, healthy and complete journey. Usuario B remains non-public and validates advisor isolation plus incomplete and overdue scenarios.

## Same commercial journey

Usuario A contains one coherent productive story:

```text
Alejandro Torres · Demo
→ Pipeline
→ Bitácora / FES Activity
→ Imagina Ser quote for retirement
→ Segubeca quote for family education
→ confirmed CommercialPerson
→ confirmed Policy
→ payment obligations and confirmed payment
→ relationship memory
→ Reports and Forecast inputs
```

The family case is represented by real productive entities:

```text
CommercialPerson: Alejandro Torres · Demo
CommercialPerson: Mariana López · Demo
CommercialPerson: Mateo Torres · Demo

Imagina Ser:
  Alejandro = POLICY_OWNER + INSURED
  Mariana = BENEFICIARY (restricted visibility)

Segubeca:
  Alejandro = POLICY_OWNER
  Mariana = PAYOR
  Mateo = INSURED
```

The spouse and child are not stored only as free text. They are separate `CommercialPerson` records and policy participants. The current implementation does not claim ownership of a complete canonical relationship graph; spouse/parent context is also preserved through governed relationship memory until the Commercial Relationship Spine provides the shared graph authority.

## Seed inventory

Expected minimums:

```text
PUBLIC_A_PIPELINE_PROSPECTS=8
PUBLIC_A_JOURNAL_ENTRIES>=9
PUBLIC_A_FES_ACTIVITY_EVENTS>=5
PUBLIC_A_QUOTES=3
PUBLIC_A_COMMERCIAL_PEOPLE=3
PUBLIC_A_POLICIES=2
PUBLIC_A_POLICY_ROLES=6
PUBLIC_A_PRODUCTS=IMAGINA_SER+SEGUBECA+VIDA_MUJER+ORVI+ALFA_MEDICAL_FLEX

CONTROL_B_PIPELINE_PROSPECTS=7
CONTROL_B_QUOTES=2
CONTROL_B_SCENARIOS=OVERDUE+NO_SHOW+INCOMPLETE_DOCUMENTATION+DEFERRED_DECISION
```

All data is deterministic, synthetic and idempotently reconciled. The seeder authenticates as A and B and therefore exercises the same RLS and governed RPC boundaries as normal advisor sessions.

## Read-only public boundary

The registry `forge_demo_advisors` classifies the two existing Supabase users without introducing parallel prospect, quote, policy or activity tables.

After seeding, both accounts are sealed read-only through a trigger guard attached to productive mutation authorities. The public session can read and navigate the same application, but cannot mutate Pipeline, Bitácora, Quotes, Cartera, payments, goals or FES data.

```text
PUBLIC_DEMO_EXTERNAL_CONTACT=BLOCKED
PUBLIC_DEMO_DATABASE_MUTATION=BLOCKED
PUBLIC_DEMO_READS=PRODUCTIVE_RLS
PUBLIC_DEMO_A_SEES_B=NO
CONTROL_B_SEES_A=NO
```

The Material 3 adapter adds a permanent banner:

```text
MODO DEMOSTRACIÓN · DATOS FICTICIOS · SOLO LECTURA
```

It also blocks telephone, email, WhatsApp and Google Calendar exits in the demo session.

## Controlled reset

The branch workflow performs a bounded reset cycle:

```text
PREPARE
→ temporarily remove only A/B demo seals
→ authenticate A/B with protected GitHub secrets
→ idempotently seed productive authorities
→ verify RLS isolation
→ SEAL both accounts read-only
→ live remote acceptance
```

The one-run admin token is generated inside GitHub Actions, masked, stored as a temporary Supabase Function secret and never committed.

## Migration governance

```text
MIGRATION=20260801000500_login_integrated_demo_tenants
ADDITIVE_ONLY=YES
REMOTE_HISTORY_RESET=NO
REMOTE_HISTORY_REPAIR=NO
DATABASE_PASSWORD_REQUIRED=NO
SUPABASE_MANAGEMENT_API_GUARD=YES
```

If a partial registry authority is detected, deployment fails closed instead of attempting to repair or replay remote migration history.

## Credential boundary

```text
DEMO_PASSWORD_IN_BROWSER=NO
DEMO_PASSWORD_IN_REPOSITORY=NO
ACTION_LINK_IN_ARTIFACT=NO
ADVISOR_EMAIL_IN_ARTIFACT=NO
SERVICE_ROLE_IN_BROWSER=NO
```

The public broker returns only a one-time Supabase action link after validating origin, redirect path, public key and request rate. The control account is never offered in the UI.

## Delivery state

```text
TASK_2=LOGIN_INTEGRATED_PRODUCTIVE_DEMO_ACCOUNT
IMPLEMENTATION_BRANCH=feature/login-integrated-demo-tenants
STACKED_BASE=fix/cartera-pages-runtime-assets
PR_STATE=DRAFT_REQUIRED
MERGE_AUTHORIZATION=NOT_GRANTED
```

Task 2 must not merge before Task 1 or without explicit authorization.
