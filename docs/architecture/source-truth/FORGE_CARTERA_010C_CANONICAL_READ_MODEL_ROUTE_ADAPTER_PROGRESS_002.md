# FORGE CARTERA 010C — Canonical Read Model and Route Adapter Progress 002

Forge OS
Architecture Source Truth
Cartera / Productive Canonical Read Models

## Status

```text
PHASE=CARTERA_010C_POLICY_TIMELINE_PERSON_ACCOUNT_PROJECTION
SLICE=CARTERA_010C_CANONICAL_READ_MODEL_AND_ROUTE_ADAPTER
SOURCE_COMMIT=804cb0d487ae8bda17d71eaabdbe878695e67a5c
IMPLEMENTATION_BRANCH=feature/cartera-010c-policy-timeline-person-account-projection
RUNTIME_MUTATION=YES_BOUNDED_ROUTE_ADAPTER
SCHEMA_MUTATION=NO
SUPABASE_REMOTE_MUTATION=NO
VISUAL_REDESIGN=NO
LEGACY_INDEXEDDB_AUTHORITY_REMOVED_FROM_ROUTE=YES
CARTERA_010C_COMPLETE=NO
NEXT=CARTERA_010C_POLICY_DETAIL_AND_TIMELINE_PROJECTION
```

## Implemented authority chain

The productive Cartera route now follows this bounded read path:

```text
authenticated Supabase runtime
→ canonical_policies under owner-scoped RLS
→ forge_cartera010b_list_general_policy_roles(policy_reference)
→ commercial_people / commercial_accounts under owner-scoped RLS
→ strict pure portfolio projection
→ existing cartera route shell
```

The adapter does not query `policy_roles` directly. The governed RPC remains the
only general role authority, structurally excluding beneficiary and restricted
rows.

## Canonical projection behavior

The read model preserves:

- stable Policy, Person and Account references;
- multiple current confirmed roles per Policy;
- distinct person and account participation;
- status, completeness, freshness and conflict state;
- unknown premium, currency, payment frequency and sum insured without defaults;
- correction/supersession through latest current PolicyRole versions;
- owner-scoped reads enforced by accepted 010B RLS.

The projection rejects:

- beneficiary rows in general portfolio data;
- restricted role visibility;
- archived Policy rows;
- missing participant projections;
- role participant XOR violations;
- unknown Policy fields outside the selected contract.

## Legacy route authority removed

`cartera.js` no longer imports or invokes:

```text
legacy/quarantine/crmaddlife-indexeddb/db.js
DB.obtenerTodos('cartera')
legacy create Policy
legacy edit Policy
legacy delete Policy
legacy Excel import
cliente as canonical identity
poliza free text as canonical identity
```

The route is read-only until separately governed review commands are authorized.
It fails closed on authentication/read errors and never falls back to legacy
IndexedDB.

## Route states

The existing route shell now expresses:

```text
LOADING
READY_WITH_DATA
READY_EMPTY
FILTER_EMPTY
ERROR_FAIL_CLOSED
CONFLICT_REQUIRES_REVIEW
UNKNOWN_PREMIUM
UNKNOWN_CURRENCY
UNKNOWN_STATUS
```

Mobile content reserves bottom scroll space above the deliberately floating nav
pill using safe-area-aware padding. This is layout accommodation, not a nav pill
redesign.

## KPI safety

The route no longer treats unknown premium as zero or unknown currency as MXN.
Premium totals are displayed only when known amounts share one known currency.
Mixed-currency data is reported as a count of known amounts rather than a false
aggregate.

## Explicitly not implemented

- canonical Policy creation/edit/delete UI;
- OCR or Excel canonical import;
- Policy detail evidence display;
- productive Policy Timeline persistence/read projection;
- renewals, payments, tasks, Calendar or communication effects;
- beneficiary detail access;
- Material 3 Cartera redesign;
- Supabase migrations or remote deployment.

## Slice exit

```text
CANONICAL_PORTFOLIO_READ_MODEL=REPOSITORY_READY
AUTHENTICATED_PORTFOLIO_SERVICE=REPOSITORY_READY
GENERAL_ROLE_RPC_AUTHORITY=ENFORCED
PERSON_ACCOUNT_PROJECTION=REPOSITORY_READY
LEGACY_ROUTE_READ_AUTHORITY=REMOVED
LEGACY_ROUTE_WRITE_ACTIONS=REMOVED
UNKNOWN_FACT_DEFAULTING=REMOVED
ROUTE_EXPLICIT_STATES=IMPLEMENTED
FLOATING_NAV_SAFE_SCROLL_SPACE=IMPLEMENTED
PRODUCT_UI_REDESIGN=NO
CARTERA_010C_COMPLETE=NO
NEXT=CARTERA_010C_POLICY_DETAIL_AND_TIMELINE_PROJECTION
```
