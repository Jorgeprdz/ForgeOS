# Forge Commercial Relationship Spine — Correction Annex 001

## Authority and precedence

```text
ANNEX=FORGE_COMMERCIAL_RELATIONSHIP_SPINE_CORRECTION_ANNEX_001
RECORDED=2026-08-01
AMENDS=FORGE_COMMERCIAL_RELATIONSHIP_SPINE_ROADMAP_001
CORRECTION_TYPE=OWNER_DIRECTED_PATH_CORRECTION
EXECUTION_PRECEDENCE=THIS_ANNEX_OVER_ORIGINAL_STAGE_BUILD_LANGUAGE
ORIGINAL_ROADMAP_RETAINED_AS_HISTORICAL_PLANNING_EVIDENCE=YES
RUNTIME_MUTATION=NO
PRODUCT_UI_MUTATION=NO
SCHEMA_MUTATION=NO
SUPABASE_MUTATION=NO
```

This annex corrects the execution path after a deeper audit of the accepted Cartera program. The original roadmap correctly identified the need for one stable commercial person across ForgeOS, but it materially understated how much of that foundation, person workspace, Timeline projection and relationship intelligence already exists under Cartera 010–100.

The correction is append-only: prior discovery remains visible, but it no longer authorizes rebuilding capabilities already implemented and remotely accepted.

## Corrected product truth

```text
CANONICAL_PERSON_AUTHORITY=REUSE_CARTERA_010B_COMMERCIAL_PERSON
PROSPECT_PERSON_LINK_AUTHORITY=REUSE_CARTERA_010B_SOURCE_IDENTITY_LINKS
POLICY_AND_ROLE_AUTHORITY=REUSE_CARTERA_010B_TO_020C
PERSON_HISTORY_FOUNDATION=EXTEND_CARTERA_040B
PERSON_WORKSPACE_FOUNDATION=PROMOTE_CARTERA_040D
RELATIONSHIP_INTELLIGENCE_FOUNDATION=REUSE_CARTERA_050_TO_100
APPLICATION_AND_SIGNATURE_AUTHORITY=NEW_REQUIRED_CAPABILITY
CROSS_MODULE_PERSON_CONVERGENCE=REAL_REMAINING_WORK
CENTRAL_DUPLICATE_TRUTH_STORE=FORBIDDEN
```

`CommercialPerson` is not a future CRS invention. It is an existing owner-scoped canonical authority with governed identity decisions, Prospect/source links, idempotency, correction lineage, conflicts, RLS and remote transactional acceptance.

The current `advisor_id` scope on `CommercialPerson` already expresses the productive advisor-person ownership boundary. A separate durable `AdvisorCommercialRelationship` record is not authorized unless a later gap analysis proves a business lifecycle that cannot be represented by the existing person, source-link, account-membership and domain-record authorities.

```text
NEW_COMMERCIAL_PERSON_TABLE=FORBIDDEN
PARALLEL_IDENTITY_RESOLUTION=FORBIDDEN
NEW_ADVISOR_COMMERCIAL_RELATIONSHIP_PERSISTENCE=NOT_AUTHORIZED_WITHOUT_PROVEN_GAP
NEW_PERSON_TIMELINE_LEDGER=FORBIDDEN
NEW_RELATIONSHIP_INTELLIGENCE_STACK=FORBIDDEN
```

## Accepted Cartera capabilities that must be treated as foundations

| Capability | Accepted foundation | Corrected CRS treatment |
|---|---|---|
| Canonical durable person | Cartera 010B `commercial_people` | Reuse and promote |
| Prospect-to-person identity | Cartera 010B identity decisions and `commercial_source_identity_links` | Reuse; extend only for missing domain links |
| Accounts and memberships | Cartera 010B commercial accounts and memberships | Reuse |
| Policy and participant identity | Cartera 010B Policy and PolicyRole | Reuse |
| Evidence and governed confirmation | Cartera 020B–020C | Reuse |
| Person directory and policy detail | Cartera 010C–010D | Reuse |
| Payment and service chronology | Cartera 030C–030D | Reuse |
| Relationship memory and unified brief | Cartera 040A–040D | Extend, do not rebuild |
| Future and conservation context | Cartera 050 | Reuse |
| Relationship growth candidates | Cartera 060 | Reuse |
| Relational activation | Cartera 070 | Reuse |
| Economic connection | Cartera 080 | Reuse |
| Relationship capital | Cartera 090 | Reuse |
| Productivity proof and explicit learning | Cartera 100 | Reuse |
| Productive Material 3 route | Cartera controlled promotion and productive mount | Reuse |

## Stage-by-stage reclassification

The twelve-stage numbering remains as a stable governance index. Its execution semantics are corrected as follows.

### CRS 01 — Existing Cartera authority promotion and gap lock

```text
ORIGINAL_INTENT=BUILD_CANONICAL_PERSON_AND_ADVISOR_RELATIONSHIP_SPINE
CORRECTED_INTENT=AUDIT_PROMOTE_AND_REUSE_CARTERA_010B
COMMERCIAL_PERSON_FOUNDATION=COMPLETE
IDENTITY_RESOLUTION_FOUNDATION=COMPLETE
OWNER_SCOPE_AND_RLS_FOUNDATION=COMPLETE
NEW_PERSON_PERSISTENCE=FORBIDDEN
NEW_RELATIONSHIP_ENTITY=REQUIRES_PROVEN_NON_DUPLICATE_LIFECYCLE
```

CRS 01 must produce an authority promotion map and a residual-gap decision. It must not create another person table, identity engine or ordinary duplicate relationship row.

### CRS 02 — Missing cross-module link extension only

```text
SOURCE_IDENTITY_LINK_FOUNDATION=PARTIAL_COMPLETE
COMMON_DOMAIN_LINK_ENVELOPE=REMAINING
CORRELATION_ID_FOR_COMMERCIAL_MOVEMENTS=REMAINING
AUTHORITATIVE_PAYLOAD_COPY=FORBIDDEN
```

CRS 02 may add only the references required to connect existing authoritative records to the existing `CommercialPerson`: person reference, optional commercial movement correlation, domain, record reference, source event and authority attribution.

### CRS 03–05 — Pipeline, Activity and Quote convergence

These remain real integration work. They must bind existing Prospect, Opportunity, FES Activity and Quote records to the existing person authority without moving their domain truth into Cartera.

```text
PIPELINE_CONVERGENCE=REMAINING
ACTIVITY_FES_CONVERGENCE=REMAINING
QUOTE_CONVERGENCE=REMAINING
PERSON_AUTHORITY_SOURCE=CARTERA_010B_SHARED_COMMERCIAL_MODEL
```

### CRS 06 — Application and signature authority

This remains the principal new domain capability.

```text
APPLICATION_AUTHORITY=NOT_YET_COMPLETE
APPLICATION_VERSION=REQUIRED
SIGNATURE_EVIDENCE=REQUIRED
SUBMISSION_AND_REQUIREMENTS_LIFECYCLE=REQUIRED
APPLICATION_TO_POLICY_LINEAGE=REQUIRED
SIGNED_APPLICATION_IS_POLICY=NO
ISSUANCE_EVIDENCE_REQUIRED_FOR_POLICY=YES
```

### CRS 07 — Cartera lineage reconciliation, not Cartera reconstruction

```text
CARTERA_PERSON_POLICY_FOUNDATION=COMPLETE
CARTERA_PAYMENTS_SERVICE_CONSERVATION=COMPLETE
REMAINING=APPLICATION_TO_POLICY_LINEAGE_AND_COMMON_CORRELATION
CARTERA_REBUILD=FORBIDDEN
```

### CRS 08 — Extend the existing Cartera 040B person history

The existing person brief already composes confirmed memory, Prospect Timeline events, confirmed Policy events and confirmed payments. CRS 08 must extend that projection with missing authoritative FES Activity, Quote, Application and Opportunity milestones.

```text
PERSON_HISTORY_FOUNDATION=CARTERA_040B
TIMELINE_STATUS=PARTIAL_EXISTING
NEW_GENERIC_TIMELINE_LEDGER=FORBIDDEN
EXTEND_SOURCE_ATTRIBUTED_READ_MODEL=AUTHORIZED
```

### CRS 09 — Promote the existing person workspace

Cartera already exposes a productive directory, person cards, relationship memory, preferences, commitments, life context, network and history. CRS 09 must extract or share that existing person brief so the same workspace can be reached from Pipeline, Activity, Quotes, Applications and Cartera.

```text
PERSON_WORKSPACE_FOUNDATION=CARTERA_010D_PLUS_040D
WORKSPACE_STATUS=PARTIAL_EXISTING
SECOND_PERSON_WORKSPACE=FORBIDDEN
SHARED_CROSS_MODULE_ENTRY_POINTS=REMAINING
```

### CRS 10 — Compose existing Cartera intelligence

Cartera 050–100 already implements the relationship-intelligence foundation. CRS 10 is limited to shared composition, authority reconciliation and cross-module presentation.

```text
RELATIONSHIP_INTELLIGENCE_FOUNDATION=COMPLETE_IN_CARTERA
NEW_SCORE_ENGINE=FORBIDDEN
NEW_RELATIONSHIP_MEMORY_AUTHORITY=FORBIDDEN
NEW_ACTIVATION_STACK=FORBIDDEN
CROSS_MODULE_COMPOSITION_AND_ACCEPTANCE=REMAINING
```

### CRS 11 — End-to-end acceptance

CRS 11 remains valid. It must prove that one existing `CommercialPerson` survives the complete journey across authoritative modules without duplicate identity, duplicate history, hidden automatic action or truth migration.

## Corrected active sequence

```text
CRS_01_EXISTING_CARTERA_AUTHORITY_PROMOTION_AND_GAP_LOCK
→ CRS_02_MISSING_CROSS_MODULE_LINK_EXTENSION
→ CRS_03_PIPELINE_PERSON_CONVERGENCE
→ CRS_04_ACTIVITY_FES_PERSON_CONVERGENCE
→ CRS_05_QUOTE_PERSON_CONVERGENCE
→ CRS_06_APPLICATION_SIGNATURE_AUTHORITY
→ CRS_07_APPLICATION_POLICY_LINEAGE_RECONCILIATION
→ CRS_08_EXISTING_PERSON_HISTORY_EXTENSION
→ CRS_09_EXISTING_PERSON_WORKSPACE_PROMOTION
→ CRS_10_EXISTING_RELATIONSHIP_INTELLIGENCE_COMPOSITION
→ CRS_11_END_TO_END_RELATIONSHIP_ACCEPTANCE
```

## Corrected completion accounting

```text
CRS_01_FOUNDATION=SUBSTANTIALLY_COMPLETE_BY_CARTERA_010B
CRS_02_FOUNDATION=PARTIAL
CRS_03=REMAINING
CRS_04=REMAINING
CRS_05=REMAINING
CRS_06=NEW_REQUIRED
CRS_07_FOUNDATION=SUBSTANTIALLY_COMPLETE;LINEAGE_REMAINING
CRS_08_FOUNDATION=PARTIAL_BY_CARTERA_040B
CRS_09_FOUNDATION=PARTIAL_BY_CARTERA_010D_040D
CRS_10_FOUNDATION=SUBSTANTIALLY_COMPLETE_BY_CARTERA_050_TO_100
CRS_11=REMAINING
```

This accounting does not mark a stage complete merely because a related Cartera capability exists. It changes the work from construction to reconciliation, promotion, extension or end-to-end acceptance.

## Segubeca correction

Segubeca must bind to the existing `CommercialPerson` and shared link contract. It is no longer blocked on constructing a new CRS person spine.

```text
SEGUBECA_CALCULATION_WORK_CAN_PROCEED=YES
SEGUBECA_PRODUCTIVE_RELEASE_REQUIRES_EXISTING_PERSON_AUTHORITY_RECONCILIATION=YES
SEGUBECA_PRODUCTIVE_RELEASE_REQUIRES_CRS_02_COMMON_LINK_EXTENSION=YES
SEGUBECA_REQUIRES_NEW_COMMERCIAL_PERSON_AUTHORITY=NO
SEGUBECA_PRODUCT_SPECIFIC_IDENTITY_ADAPTER=FORBIDDEN
SEGUBECA_PRODUCT_SPECIFIC_CARTERA_ADAPTER=FORBIDDEN
```

## Non-authorizations preserved

```text
AUTOMATIC_IDENTITY_MERGE=FORBIDDEN
AUTOMATIC_OPPORTUNITY_CREATION=FORBIDDEN
AUTOMATIC_APPLICATION_CREATION=FORBIDDEN
AUTOMATIC_POLICY_CREATION=FORBIDDEN
AUTOMATIC_STAGE_ADVANCE=FORBIDDEN
AUTOMATIC_CONTACT=FORBIDDEN
AUTOMATIC_MESSAGE=FORBIDDEN
AUTOMATIC_TASK=FORBIDDEN
AUTOMATIC_CALENDAR=FORBIDDEN
SENSITIVE_CONTEXT_AS_SALES_TRIGGER=FORBIDDEN
OPAQUE_HUMAN_SCORE=FORBIDDEN
DATABASE_MUTATION_BY_THIS_ANNEX=NO
```

## Corrected next state

```text
ROADMAP_PATH_CORRECTION=ACCEPTED_BY_OWNER
ORIGINAL_BUILD_FROM_ZERO_PATH=SUPERSEDED
CARTERA_EXISTING_AUTHORITIES=GOVERNING_FOUNDATION
NEXT=CRS_01A_EXISTING_CARTERA_AUTHORITY_PROMOTION_AND_GAP_LOCK
MERGE_AUTHORIZATION=NOT_GRANTED_BY_THIS_ANNEX
```
