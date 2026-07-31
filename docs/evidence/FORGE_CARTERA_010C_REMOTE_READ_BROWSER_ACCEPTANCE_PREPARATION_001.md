# FORGE CARTERA 010C — Remote Read and Browser Acceptance Preparation

```text
PHASE=CARTERA_010C_REMOTE_READ_AND_BROWSER_ACCEPTANCE_CLOSURE
SOURCE_BRANCH=feature/cartera-010c-policy-timeline-person-account-projection
SOURCE_COMMIT=8a9a927ff9d83f8d2343dc3dfe40b8a0c831e01b
ACCEPTANCE_BRANCH=feature/cartera-010c-remote-read-browser-acceptance
SCHEMA_MUTATION=NO
SUPABASE_MIGRATION=NO
PRODUCTIVE_DATA_RETENTION=NO
BROWSER_RUNTIME=PLAYWRIGHT_CHROMIUM
STATUS=PREPARED_NOT_EXECUTED
```

## Purpose

Close CARTERA 010C by proving that the implemented read-only route works against the already deployed CARTERA 010B authorities and behaves correctly in an actual browser.

This gate does not redesign Cartera and does not introduce a new persistence authority.

## Remote-read contract

The remote harness authenticates two controlled acceptance advisors through the public Supabase client.

A privileged Management API call inserts one uniquely referenced, temporary Policy vertical owned by advisor A:

```text
CommercialPerson insured
CommercialPerson restricted beneficiary
CommercialAccount household
Canonical Policy
PolicyEvidenceVersion
PolicyVersion
PolicyRole insured
PolicyRole account owner
PolicyRole restricted beneficiary
```

The productive `createCanonicalPortfolioService` must then prove:

- advisor A can load the Policy through `loadPortfolio()`;
- advisor A can load its canonical detail and minimized Timeline;
- advisor B cannot see or load that Policy;
- an anonymous client is rejected;
- direct `policy_roles` reads remain rejected;
- the governed general-role RPC excludes the beneficiary;
- document hash, field claims, provenance and raw-document markers do not enter the projection;
- Timeline payloads do not copy financial Policy Truth.

All temporary rows are deleted by a privileged cleanup transaction with triggers disabled only for fixture removal. A residual-count query must return zero for every acceptance reference.

## Browser contract

Playwright mounts the productive `cartera.js` route in both desktop Chromium and a mobile Chromium profile.

The browser must prove:

- canonical list rendering;
- local search;
- opening and closing Policy detail;
- visible current Policy facts;
- general Person and Account participation;
- five minimized domain events from Policy, evidence, version and roles;
- no beneficiary, raw evidence or legacy authority leakage;
- no create, edit, delete or import control;
- mobile bottom safe space remains above the deliberately floating navigation pill.

The browser fixture supplies a controlled Supabase-compatible reader only. It imports the productive route, productive service and productive projection code.

## Safety boundary

```text
AUTOMATIC_POLICY_CREATION=NO
IDENTITY_MERGE=NO
DIRECT_POLICY_ROLE_READ=FORBIDDEN
BENEFICIARY_GENERAL_PROJECTION=FORBIDDEN
RAW_EVIDENCE_PROJECTION=FORBIDDEN
INDEXEDDB_FALLBACK=FORBIDDEN
REMOTE_SCHEMA_MUTATION=NO
FIXTURE_RESIDUAL_ALLOWED=NO
```

## Closure condition

```text
REPOSITORY_ACCEPTANCE=PASS
AUTHENTICATED_OWNER_REMOTE_READ=PASS
RLS_CROSS_ADVISOR=PASS
ANONYMOUS_READ=BLOCKED
DIRECT_POLICY_ROLES_READ=BLOCKED
BENEFICIARY_GENERAL_PROJECTION=BLOCKED
RAW_EVIDENCE_PROJECTION=BLOCKED
DESKTOP_BROWSER=PASS
MOBILE_BROWSER=PASS
RESIDUAL_FIXTURES=0
```
