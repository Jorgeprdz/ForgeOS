# Forge CRS 03 — Pipeline Person Convergence Source Truth 001

## Authority

```text
SOURCE_TRUTH=FORGE_CRS_03_PIPELINE_PERSON_CONVERGENCE_001
RECORDED=2026-08-01
SOURCE_MAIN_HEAD=aec26a2e18e28ce95883e9cd2f3debe074476725
STAGE=CRS_03_PIPELINE_PERSON_CONVERGENCE
DELIVERY_MODE=ONE_BRANCH_ONE_PR_ONE_UNIFIED_PASS
PRODUCTIVE_RUNTIME=AUTHENTICATED_READ_AND_EXISTING_PROSPECT_COMMAND_COMPOSITION
PRODUCT_UI_MUTATION=NO
SCHEMA_MUTATION=NO
SUPABASE_MIGRATION=NO
```

## CRS 03A — Pipeline scope and authority discovery

| Capability | Existing authority | CRS 03 treatment |
|---|---|---|
| Prospect persistence | `public.prospects` and `productive-prospect-service.js` | Preserve |
| Prospect create, update and archive | Productive Prospect service | Delegate; do not replace |
| Pipeline stage mutation | `forge_pipeline_update_prospect_stage` through `pipeline-stage-rpc-authority.js` | Preserve as sole stage writer |
| Commercial person | Cartera 010B `commercial_people` | Read through existing authority |
| Prospect-to-person identity | Cartera 010B source links and governed decisions | Read; never resolve automatically |
| Cross-module reference envelope | CRS 02 | Reuse |
| Opportunity persistence | No productive authoritative table or service found | Do not invent in CRS 03 |

```text
PIPELINE_PROSPECT_AUTHORITY=PRODUCTIVE_EXISTING
PIPELINE_STAGE_AUTHORITY=PIPELINE_STAGE_RPC
COMMERCIAL_PERSON_AUTHORITY=CARTERA_010B
SOURCE_IDENTITY_LINK_AUTHORITY=CARTERA_010B
OPPORTUNITY_AUTHORITY_STATUS=NOT_PRODUCTIVE
```

Pipeline owns Prospect, current stage, source and next action. It does not own person identity, Application signature or Policy issuance.

## CRS 03B — Convergence contract

```text
CONTRACT=platform/shared-commercial-model/crs-03-pipeline-person-convergence-contract.js
CONTRACT_TYPE=FORGE_PIPELINE_PERSON_CONVERGENCE
CONTRACT_VERSION=CRS-03-PIPELINE-PERSON-001.1
SCHEMA_VERSION=forge.pipeline_person_convergence.v1
```

The contract composes an authoritative Prospect, governed identity state, CRS 02 Pipeline link or missing-link, existing stage authority, explicit Opportunity authority state and external milestone boundaries.

```text
IDENTITY_STATES=LINKED_UNRESOLVED
```

`LINKED` requires a confirmed `CommercialPerson`, active source identity link, governed identity decision, matching Prospect reference and matching advisor ownership.

`UNRESOLVED` requires an explicit CRS 02 missing-link and forbids partial person, decision or source-link references.

## Opportunity gap lock

Repository discovery did not find a productive Opportunity table, RPC or service matching the original roadmap assumption.

```text
OPPORTUNITY_AUTHORITY_STATE=NOT_PRODUCTIVE
OPPORTUNITY_TABLE_CREATED_BY_CRS_03=NO
OPPORTUNITY_RPC_CREATED_BY_CRS_03=NO
NEW_OPPORTUNITY_TABLE=NOT_AUTHORIZED_BY_CRS_03
AUTOMATIC_OPPORTUNITY_CREATION=FORBIDDEN
```

Prospect is not rebranded as Opportunity. A future authority must materialize Opportunity explicitly.

## CRS 03C — Productive convergence service

```text
SERVICE=advisor-os/sales-pipeline/crs-03-pipeline-person-convergence-service.js
SERVICE_VERSION=CRS-03-PIPELINE-PERSON-SERVICE-001.1
```

The authenticated service composes:

```text
productive-prospect-service.js
commercial_source_identity_links
commercial_people
identity_resolution_decisions
CRS_02_DOMAIN_LINK_CONTRACT_AND_ADAPTERS
CRS_03_CONVERGENCE_CONTRACT
```

Operations:

```text
getConvergedProspect
listConvergedProspects
createConvergedProspect
updateConvergedProspect
archiveConvergedProspect
createCommercialMovementView
createConfirmedStageProjection
```

### Prospect creation

```text
PROSPECT_CREATED=YES
COMMERCIAL_PERSON_CREATED_AUTOMATICALLY=NO
IDENTITY_RESOLVED_AUTOMATICALLY=NO
NEW_PROSPECT_INITIAL_CONVERGENCE=PERSON_UNRESOLVED
```

### Stage authority

The service does not write Pipeline stage. It converts an already confirmed RPC result into a source-attributed CRS 02 link:

```text
recordType=PIPELINE_EVENT
authority=PIPELINE_STAGE_EVENT_AUTHORITY
stageWriter=PIPELINE_STAGE_RPC
```

### Commercial movement

```text
MOVEMENT_DERIVATION=CRS_02_DERIVE_CORRELATION_ID
MOVEMENT_WITHOUT_CONFIRMED_PERSON=BLOCKED
AUTOMATIC_MOVEMENT_CREATION=NO
```

### Identity conflict semantics

```text
ZERO_ACTIVE_LINKS=UNRESOLVED_MISSING_LINK
ONE_ACTIVE_LINK=VERIFY_PERSON_AND_DECISION_LINEAGE
MULTIPLE_ACTIVE_LINKS=FAIL_CLOSED
CROSS_ADVISOR_PERSON=FAIL_CLOSED
DECISION_PERSON_MISMATCH=FAIL_CLOSED
DECISION_PROSPECT_MISMATCH=FAIL_CLOSED
ARCHIVED_OR_NON_CONFIRMED_PERSON=FAIL_CLOSED
```

## External milestone boundary

```text
APPLICATION_SIGNED=PROJECTED_ONLY
POLICY_ISSUED=PROJECTED_ONLY
PIPELINE_INVENTS_APPLICATION_SIGNED=NO
PIPELINE_INVENTS_POLICY_ISSUED=NO
```

## CRS 03D — Acceptance contract

```text
TARGETED_TESTS=22_PASS_REQUIRED
CRS_01_REGRESSION=PASS_REQUIRED
CRS_02_REGRESSION=PASS_REQUIRED
CARTERA_010B_IDENTITY_REGRESSION=PASS_REQUIRED
PRODUCTIVE_PROSPECT_REGRESSION=PASS_REQUIRED
PIPELINE_STAGE_RPC_REGRESSION=PASS_REQUIRED
MATERIAL3_PIPELINE_REGRESSION=PASS_REQUIRED
REP_17_REGRESSION=PASS_REQUIRED
```

Required behavior:

```text
LINKED_PROSPECT_CONVERGENCE=PASS
UNRESOLVED_PROSPECT_MISSING_LINK=PASS
NEW_PROSPECT_NO_AUTOMATIC_IDENTITY=PASS
MULTIPLE_ACTIVE_LINKS_FAIL_CLOSED=PASS
CROSS_ADVISOR_LINK_FAIL_CLOSED=PASS
IDENTITY_LINEAGE_MISMATCH_FAIL_CLOSED=PASS
MULTIPLE_MOVEMENTS_ONE_PERSON=PASS
MOVEMENT_REQUIRES_CONFIRMED_PERSON=PASS
CONFIRMED_STAGE_SOURCE_ATTRIBUTION=PASS
OPPORTUNITY_NOT_PRODUCTIVE=PASS
EXTERNAL_MILESTONES_PROJECTED_ONLY=PASS
```

## Non-authorizations

```text
NEW_COMMERCIAL_PERSON_TABLE=FORBIDDEN
PARALLEL_IDENTITY_RESOLUTION=FORBIDDEN
NEW_SOURCE_IDENTITY_LINK_TABLE=FORBIDDEN
NEW_PIPELINE_STAGE_WRITER=FORBIDDEN
NEW_PERSON_TIMELINE_LEDGER=FORBIDDEN
DATABASE_MIGRATION=NO
SUPABASE_MUTATION=NO
IDENTITY_MUTATION=NO
POLICY_MUTATION=NO
APPLICATION_MUTATION=NO
PRODUCT_UI_MUTATION=NO
AUTOMATIC_IDENTITY_MERGE=FORBIDDEN
AUTOMATIC_OPPORTUNITY_CREATION=FORBIDDEN
AUTOMATIC_APPLICATION_CREATION=FORBIDDEN
AUTOMATIC_POLICY_CREATION=FORBIDDEN
AUTOMATIC_STAGE_ADVANCE=FORBIDDEN
AUTOMATIC_CONTACT=FORBIDDEN
AUTOMATIC_MESSAGE=FORBIDDEN
AUTOMATIC_TASK=FORBIDDEN
AUTOMATIC_CALENDAR=FORBIDDEN
```

## Stage state

```text
CRS_03A_PIPELINE_SCOPE_AND_AUTHORITY_DISCOVERY=COMPLETE
CRS_03B_PIPELINE_PERSON_CONVERGENCE_CONTRACT=COMPLETE
CRS_03C_PRODUCTIVE_CONVERGENCE_SERVICE=COMPLETE
CRS_03D_ACCEPTANCE_AND_CLOSURE=PENDING_FINAL_GREEN_GATES
NEXT_AFTER_CLOSURE=CRS_04ABCD_ACTIVITY_FES_PERSON_CONVERGENCE
```
