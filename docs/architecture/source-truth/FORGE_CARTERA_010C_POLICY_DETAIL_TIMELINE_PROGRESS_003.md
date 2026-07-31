# FORGE CARTERA 010C — POLICY DETAIL AND MINIMIZED TIMELINE PROGRESS 003

```text
PHASE=CARTERA_010C_POLICY_TIMELINE_PERSON_ACCOUNT_PROJECTION
SOURCE_COMMIT=73e1726f6f0ebf5f025e0dc197275503984a2705
STATUS=POLICY_DETAIL_AND_TIMELINE_IMPLEMENTED_REPOSITORY_ACCEPTANCE_PENDING
RUNTIME_MUTATION=YES_BOUNDED_READ_ONLY_ROUTE
SCHEMA_MUTATION=NO
SUPABASE_REMOTE_MUTATION=NO
PRODUCT_UI_REDESIGN=NO
```

## Productive authority

```text
canonical_policies under owner RLS
+ policy_versions under owner RLS
+ policy_evidence_versions metadata under owner RLS
+ policy_conflicts metadata under owner RLS
+ forge_cartera010b_list_general_policy_roles(policy_reference)
+ commercial_people / commercial_accounts under owner RLS
→ strict canonical Policy detail
→ FORGE_POLICY_DOMAIN_EVENT validation
→ minimized Policy Timeline view entries
→ existing Cartera route shell
```

No new database authority is introduced by this cut.

## Detail boundary

The detail may expose canonical current Policy Truth:

- policy number;
- carrier and product references;
- status and status source;
- premium and currency when known;
- payment frequency when known;
- sum insured when known;
- issue and effective dates;
- completeness, freshness and conflict state;
- current general participants;
- minimized Policy version metadata;
- minimized evidence metadata;
- minimized conflict metadata.

Unknown facts remain explicit. No unknown amount becomes zero and no unknown currency becomes MXN.

## Timeline boundary

Timeline events are derived from durable, already-governed records:

- confirmed Policy;
- confirmed Policy versions;
- confirmed evidence versions;
- confirmed general Policy roles;
- superseded roles when explicit correction lineage exists;
- Policy conflicts that carry evidence references.

Every generated event must pass `FORGE_POLICY_DOMAIN_EVENT` before it can be projected.

The productive Timeline view deliberately excludes:

```text
premium amount
sum insured
currency
payment frequency
policy number
beneficiary identity
restricted role identity
raw evidence references in rendered entries
field claims
provenance
document hash
raw document
clientId
```

The Timeline renders event title, minimized summary, canonical subject reference, occurrence time and evidence count. It does not render raw evidence references.

## Role evidence and actor derivation

The general role read RPC does not expose direct role evidence or actor fields. A PolicyRole is bound to a canonical `policy_version_id`; therefore the Timeline uses the linked Policy version's confirmed actor and evidence version as the minimum governed basis for the role event.

A superseded event is emitted only when a successor role carries an explicit `correction_of` link. Closed roles without explicit successor lineage are not interpreted automatically.

## Privacy boundary

```text
DIRECT_POLICY_ROLES_READ=FORBIDDEN
BENEFICIARY_GENERAL_DETAIL=FORBIDDEN
RESTRICTED_ROLE_GENERAL_DETAIL=FORBIDDEN
RAW_EVIDENCE_DETAIL=FORBIDDEN
GENERAL_ROLE_RPC=REQUIRED
```

The detail never claims beneficiaries are absent. It states only that beneficiaries and restricted roles are not part of the general projection.

## Route behavior

Each canonical portfolio card now exposes one read-only action:

```text
Ver detalle canónico
```

The route provides explicit detail loading, ready and error states. Detail errors fail closed without IndexedDB fallback. The user can close the detail and return to the existing portfolio list.

The mobile safe-scroll reservation above the deliberately floating nav pill remains unchanged.

## Exclusions

- Policy creation, editing, deletion or bulk import;
- beneficiary or restricted-role UI;
- OCR;
- renewal and payment operations;
- Activity tasks, Calendar, communications or compensation;
- Material 3 redesign;
- new schema or remote deployment.

```text
CARTERA_010C_COMPLETE=NO
NEXT=CARTERA_010C_REMOTE_READ_AND_BROWSER_ACCEPTANCE_CLOSURE
```
