# Forge Commercial Relationship Spine — Source Truth 001

## Authority

```text
SOURCE_TRUTH=FORGE_COMMERCIAL_RELATIONSHIP_SPINE_001
CONTRACT_FAMILY=CRS
RECORDED=2026-08-01
SOURCE_MAIN_HEAD=e0b8f4e2e8629e506ef1e49beecc48dd741ffefa
STATUS=CRS_00_AB_DISCOVERY_AND_SOURCE_TRUTH_COMPLETE
RUNTIME_MUTATION=NO
PRODUCT_UI_MUTATION=NO
SCHEMA_MUTATION=NO
SUPABASE_MUTATION=NO
```

## Product truth

ForgeOS follows the complete commercial relationship with a person. Pipeline, Activity / Bitácora, Cotizaciones, Solicitudes and Cartera are domain authorities around one stable commercial identity; they are not separate versions of the person.

```text
CANONICAL_PERSON_ROOT=CommercialPerson
CANONICAL_ADVISOR_EDGE=AdvisorCommercialRelationship
COMMERCIAL_MOVEMENT=correlationId
UNIFIED_TIMELINE=COMPOSED_READ_MODEL
CENTRAL_DUPLICATE_TRUTH_STORE=FORBIDDEN
```

```text
CommercialPerson
└── AdvisorCommercialRelationship
    ├── Prospect and Pipeline opportunities
    ├── Activity, meetings, notes and commitments
    ├── Quotes and Quote Versions
    ├── Applications and signature evidence
    ├── Policies and Policy Roles
    ├── Payments, service and conservation
    └── Referrals and relationship context
```

## Governing journey

```text
Juan Pérez contacto inicial
→ Pipeline owns Prospect and Opportunity

Cita con Juan Pérez
→ Activity / Bitácora owns interaction, context and commitments

Cotización con Juan Pérez
→ Quote authority owns calculation, Quote and Quote Version

Cita de cierre con Juan Pérez
→ Activity / Bitácora owns interaction and outcome

Juan Pérez firmó solicitud
→ Application authority owns Application and signature evidence
→ Pipeline may project the authoritative milestone

Se emitió la póliza de Juan Pérez
→ Cartera owns canonical Policy and Policy Roles

Revisión anual y nueva necesidad
→ Activity records service context
→ Cartera continues Policy truth
→ Pipeline may open another Opportunity for the same person
```

```text
ONE_PERSON=MANY_OPPORTUNITIES
ONE_PERSON=MANY_ACTIVITIES
ONE_PERSON=MANY_QUOTES
ONE_PERSON=MANY_APPLICATIONS
ONE_PERSON=MANY_POLICIES
PERSON_DUPLICATION=FORBIDDEN
```

## CRS 00A — Repository discovery

### Accepted foundations found on current main

| Capability | Existing authority or artifact | CRS treatment |
|---|---|---|
| Canonical Activity events | `platform/event-evidence/canonical-activity-event-contract.js` | Reuse |
| Activity ledger | `platform/event-evidence/activity-ledger-contract.js` | Reuse |
| Canonical Activity Timeline | `platform/event-evidence/canonical-activity-timeline-contract.js` | Reuse as timeline foundation |
| Quote lifecycle | `platform/event-evidence/quote-lifecycle-event-contract.js` | Reuse |
| Quote browser persistence bridge | `docs/static-preview/quote-runtime/forge-quote-lifecycle-browser-bridge-cartera001b.js` | Reuse bounded receipts |
| Prospect / Quote projection | `platform/event-evidence/prospect-quote-detail-projection.js` | Reconcile into common links |
| Pipeline prospect bootstrap | `advisor-os/sales-pipeline/productive-prospect-bootstrap.js` | Reuse; prevent local identity duplication |
| CommercialPerson and Policy validation | `platform/shared-commercial-model/cartera-010b-contract-validator.js` | Reuse and extend relationship edge separately |
| CommercialPerson schema | `schemas/commercial-person-v1.schema.json` | Reuse |
| CommercialAccount schema | `schemas/commercial-account-v1.schema.json` | Reuse |
| Policy and PolicyRole schemas | `schemas/policy-v2.schema.json`, `schemas/policy-role-v1.schema.json` | Reuse |
| Policy evidence and review | `platform/policy-intelligence/intake/cartera-020c-review-read-model.js` | Reuse |
| Governed Policy confirmation | `advisor-os/cartera/persistent-confirmation-orchestration-service.js` | Reuse; human execution preserved |
| Quote-to-Policy lineage edge | PR #144 / `accepted-quote-cartera-relationship-*` | Reuse as one edge, not system spine |
| Productive Cartera route | PR #145 | Reuse |

### Gaps confirmed

```text
GAP_01=ADVISOR_COMMERCIAL_RELATIONSHIP_CONTRACT
GAP_02=COMMON_PERSON_DOMAIN_LINK_ENVELOPE
GAP_03=PIPELINE_PERSON_RELATIONSHIP_CONVERGENCE
GAP_04=ACTIVITY_PERSON_RELATIONSHIP_CONVERGENCE
GAP_05=QUOTE_PERSON_RELATIONSHIP_CONVERGENCE
GAP_06=APPLICATION_AND_SIGNATURE_AUTHORITY
GAP_07=APPLICATION_TO_POLICY_LINEAGE
GAP_08=UNIFIED_PERSON_TIMELINE_PROJECTION
GAP_09=PRODUCTIVE_PERSON_WORKSPACE
GAP_10=RELATIONSHIP_INTELLIGENCE_COMPOSITION
```

The main missing authority is `Application`. A signed request, submitted request, approved request and issued Policy are different states and must not be collapsed.

```text
SIGNED_APPLICATION_IS_POLICY=NO
SUBMITTED_APPLICATION_IS_POLICY=NO
APPROVED_APPLICATION_IS_POLICY=NO
ISSUANCE_EVIDENCE_REQUIRED_FOR_POLICY=YES
```

## CRS 00B — Authority and source-truth lock

### Domain authority matrix

| Domain | Owns | Must not own |
|---|---|---|
| Shared Commercial Model | CommercialPerson, identity decisions, AdvisorCommercialRelationship and domain links | Pipeline stage, Quote calculations, Application or Policy truth |
| Pipeline | Prospect, Opportunity, stage, commercial movement and next-step workflow | Meeting evidence, Quote calculation, signature evidence or Policy issuance |
| Activity / Bitácora | Calls, messages, meetings, notes, commitments, outcomes and context | Opportunity stage, Quote calculation, Application or Policy truth |
| Cotizaciones | Quote, Quote Version, product calculation and presentation lifecycle | Person creation, stage mutation, Application or Policy creation |
| Application | Application identity, versions, signature evidence, submission and requirements lifecycle | Policy issuance or invented Pipeline stage |
| Cartera | Policy, Policy Roles, issuance evidence, status, payments, service and conservation | Quote calculation or Application signature truth |
| Timeline | Source-attributed chronological projection | Independent event truth or mutation |
| Alfred / NBA / Nash | Explanation, recommendation and draft candidates | Canonical truth or automatic business action |

### Stable identities and correlation

```text
personReference=stable human identity under advisor scope
relationshipReference=stable advisor-person relationship
correlationId=one commercial movement or need
recordReference=authoritative domain record
sourceEventReference=authoritative event or receipt
```

One person may have several simultaneous or sequential movements:

```text
relationship:juan-perez
├── movement:retirement-2026
├── movement:education-2027
└── movement:medical-2027
```

### Non-negotiable invariants

```text
CANONICAL_ROOT=COMMERCIAL_PERSON
ADVISOR_RELATIONSHIP_REQUIRED=YES
MODULE_AUTHORITIES_PRESERVED=YES
CENTRAL_DUPLICATE_TRUTH_STORE=NO
UNIFIED_TIMELINE_IS_READ_MODEL=YES
PERSON_DUPLICATION=FORBIDDEN
AUTOMATIC_IDENTITY_MERGE=FORBIDDEN
AUTOMATIC_OPPORTUNITY_CREATION=FORBIDDEN
AUTOMATIC_APPLICATION_CREATION=FORBIDDEN
AUTOMATIC_POLICY_CREATION=FORBIDDEN
AUTOMATIC_STAGE_ADVANCE=FORBIDDEN
AUTOMATIC_CONTACT=FORBIDDEN
AUTOMATIC_MESSAGE=FORBIDDEN
CALCULATION_COPY_OUTSIDE_QUOTE=FORBIDDEN
SENSITIVE_CONTEXT_AS_SALES_TRIGGER=FORBIDDEN
HUMAN_CONFIRMATION_REQUIRED_FOR_CANONICAL_MUTATION=YES
```

## Relationship with existing work

PR #144 remains accepted as the Quote-to-Policy lineage edge.

```text
PR_144_ROLE=QUOTE_TO_POLICY_LINEAGE_EDGE
PR_144_ROLE_IS_SYSTEM_SPINE=NO
REVERT_REQUIRED=NO
```

FES Activity and Timeline work remains the event-history foundation. CRS adds stable person and relationship subject links; it does not replace the ledger or create a parallel Timeline.

```text
FES_TIMELINE_FOUNDATION=REUSE
CRS_TIMELINE_PARALLEL_TRUTH=FORBIDDEN
```

## Segubeca rule

```text
SEGUBECA_CALCULATION_WORK_CAN_PROCEED=YES
SEGUBECA_PRODUCTIVE_RELEASE_REQUIRES_CRS_01_02=YES
SEGUBECA_PRODUCT_SPECIFIC_IDENTITY_ADAPTER=FORBIDDEN
SEGUBECA_PRODUCT_SPECIFIC_CARTERA_ADAPTER=FORBIDDEN
```

## CRS 00 completion dependency

```text
CRS_00A_REPOSITORY_DISCOVERY=COMPLETE
CRS_00B_SOURCE_TRUTH_AND_AUTHORITY_LOCK=COMPLETE
CRS_00C_ROADMAP_GOVERNANCE_AND_VALIDATION=PENDING
CRS_00D_ACCEPTANCE_AND_CLOSURE=PENDING
NEXT=CRS_00C_ROADMAP_GOVERNANCE_AND_VALIDATION
```