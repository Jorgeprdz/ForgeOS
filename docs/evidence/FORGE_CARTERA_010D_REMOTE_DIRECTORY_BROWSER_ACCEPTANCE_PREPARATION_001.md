# FORGE CARTERA 010D — Remote Directory and Browser Acceptance Preparation 001

## Status

```text
PHASE=CARTERA_010D_REMOTE_DIRECTORY_AND_BROWSER_ACCEPTANCE
SOURCE_BRANCH=feature/cartera-010d-unified-directory-relationship-search
SOURCE_COMMIT=86250c1429510a9914b9538791d168b5802e1f07
ACCEPTANCE_MODE=TEMPORARY_REMOTE_FIXTURE_PLUS_PRODUCTIVE_BROWSER_ROUTE
SCHEMA_MUTATION=NO
SUPABASE_MIGRATION=NO
PRODUCT_UI_REDESIGN=NO
STATUS=PREPARED_PENDING_EXECUTION
CARTERA_010D_COMPLETE=NO
```

## Remote acceptance

The runner authenticates two controlled advisors and creates one uniquely
referenced temporary vertical through privileged SQL:

- one visible CommercialPerson with verified phone and email;
- one restricted CommercialPerson used as a negative privacy fixture;
- one CommercialAccount;
- one confirmed CommercialAccountMembership;
- one canonical Policy, PolicyVersion and PolicyEvidenceVersion;
- visible INSURED and POLICY_OWNER roles;
- one restricted BENEFICIARY role.

The productive `createCanonicalDirectoryService` must prove:

- separate Person, Account and Policy entry kinds;
- private phone and email search without returning either value;
- direct account and policy matches rank above related entities;
- confirmed relationship-role search;
- restricted entities and beneficiaries remain outside the general directory;
- direct `policy_roles` reads remain blocked;
- cross-advisor isolation and anonymous rejection;
- existing canonical Policy detail and minimized Timeline remain reachable.

The runner removes all fixtures in a `finally` path and requires every residual
count to equal zero.

## Browser acceptance

Playwright mounts the productive `cartera.js` route with a contract-faithful
Supabase fixture and executes desktop Chromium and mobile Chromium scenarios for:

- separate Person, Account and Policy cards;
- phone and email search privacy;
- direct entity ranking and relationship search;
- Policy detail open/close and minimized Timeline continuity;
- restricted marker, contact value and raw-evidence non-rendering;
- mobile safe bottom space above the floating navigation pill;
- absence of canonical create, edit, delete or import controls.

## Execution safety

The workflow may temporarily use a branch push trigger only to obtain the first
accepted run. After evidence is fixed, the trigger must return to
`workflow_dispatch` only before integration.

```text
REMOTE_FIXTURES_DURABLE=NO
CLEANUP_REQUIRED=YES
RESIDUAL_FIXTURES_REQUIRED=0
NEXT=EXECUTE_CARTERA_010D_REMOTE_DIRECTORY_AND_BROWSER_GATE
```
