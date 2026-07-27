# FES 06A Productive UI Binding Scope 001

## Scope lock

```text
FES_06A_PRODUCTIVE_UI_BINDING_SCOPE=SCOPED
SCOPE_VERSION=FES-06A.1
SURFACES=ACTIVITY,PROSPECT_DETAIL,PIPELINE_CARD,MI_DIA
BINDING_MODE=READ_ONLY_PROJECTION_CONSUMER
PROJECTION_AUTHORITY=FES_05D_PASSIVE_CAPTURE_RUNTIME
PRODUCTIVE_UI_MUTATION=NO
SUPABASE_REMOTE_MUTATION=NO
DATABASE_MIGRATION=NO
MAIN_MUTATION=NO
UI_CREATES_CANONICAL_EVENTS=NO
UI_MUTATES_LEDGER=NO
UI_MUTATES_TIMELINE=NO
UI_MUTATES_PROJECTIONS=NO
UI_EXECUTES_EXTERNAL_ACTIONS=NO
UI_INFERS_BUSINESS_TRUTH=NO
RAW_PRIVATE_CONTENT_RENDERING=NO
REQUIRED_UI_STATES=LOADING,READY,EMPTY,UNAVAILABLE,INVALID
FALLBACK_SYNTHETIC_DATA=FORBIDDEN
IMPLEMENTATION_REQUIRES_APPROVED_BINDING_MANIFEST=YES
FES_06_PRODUCTIVE_UI_BINDING=OPEN
NEXT=FES_06B_PRODUCTIVE_UI_BINDING_IMPLEMENTATION
```

## Governed surfaces

- **Activity** consumes only the Activity projection.
- **Prospect Detail** consumes only the Prospect Detail projection.
- **Pipeline Card** consumes only the Pipeline Card projection.
- **Mi Día** consumes only the Mi Día projection.

Each surface may format approved presentation fields but may not reinterpret
evidence, infer a result, promote a handoff or fabricate an unavailable state.

## State contract

- `LOADING`: governed source has not resolved.
- `READY`: validated projection is available.
- `EMPTY`: validated projection contains no presentable records.
- `UNAVAILABLE`: governed source cannot be reached.
- `INVALID`: input or projection failed validation.

`EMPTY`, `UNAVAILABLE` and `INVALID` are distinct. None may silently fall back
to legacy arrays, fixture data, local mock state or inferred commercial truth.

## Binding boundary

The UI receives immutable projection snapshots. It does not receive bridge
observations, ledger records or raw canonical events unless a later source-truth
phase explicitly authorizes a dedicated diagnostic surface.

The implementation phase must first select exact files from the inventory and
publish an approved binding manifest. Candidate discovery is not modification
authority.

## Inventory summary

```text
TRACKED_FILES_SCANNED=4784
PRODUCTIVE_UI_CANDIDATE_FILES=231
CURRENT_EVENT_EVIDENCE_BINDING_FILES=0
INVENTORY_AUTHORITY=CANDIDATE_DISCOVERY_ONLY
```
