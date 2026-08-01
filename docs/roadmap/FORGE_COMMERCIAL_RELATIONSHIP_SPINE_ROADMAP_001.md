# Forge Commercial Relationship Spine Roadmap 001

## Status

```text
STATUS=ACTIVE_OWNER_ALIGNED_ROADMAP
RECORDED=2026-08-01
SOURCE_MAIN_HEAD=e0b8f4e2e8629e506ef1e49beecc48dd741ffefa
CURRENT=CRS_00_ABCD_SINGLE_PASS
NEXT=CRS_01A_PERSON_RELATIONSHIP_SCOPE
STAGES=12
SUBSTAGES=48
SUBSTAGE_PATTERN=A_B_C_D
RUNTIME_MUTATION=NO
PRODUCT_UI_MUTATION=NO
SUPABASE_MUTATION=NO
```

## Product decision

ForgeOS follows the complete commercial relationship with a person. Pipeline, Activity / Bitácora, Cotizaciones, Solicitudes and Cartera remain separate domain authorities linked to one stable commercial identity.

```text
CANONICAL_ROOT=CommercialPerson
RELATIONSHIP_ROOT=AdvisorCommercialRelationship
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
→ Activity / Bitácora owns context and commitments

Cotización con Juan Pérez
→ Quote authority owns calculation, Quote and Quote Version

Cita de cierre con Juan Pérez
→ Activity / Bitácora owns interaction and outcome

Juan Pérez firmó solicitud
→ Application authority owns Application and signature evidence
→ Pipeline reflects the authoritative milestone

Se emitió la póliza de Juan Pérez
→ Cartera owns canonical Policy and Policy Roles

Revisión anual y nueva necesidad
→ same CommercialPerson
→ new Activity, service event or Opportunity without duplication
```

```text
ONE_PERSON=MANY_OPPORTUNITIES
ONE_PERSON=MANY_ACTIVITIES
ONE_PERSON=MANY_QUOTES
ONE_PERSON=MANY_APPLICATIONS
ONE_PERSON=MANY_POLICIES
PERSON_DUPLICATION=FORBIDDEN
```

## Authority matrix

| Domain | Owns | Must not own |
|---|---|---|
| Shared Commercial Model | CommercialPerson, identity decisions, AdvisorCommercialRelationship and domain links | Pipeline stage, Quote calculations, Application or Policy truth |
| Pipeline | Prospect, Opportunity, stage, commercial movement and next-step workflow | Meeting evidence, signature evidence or Policy issuance |
| Activity / Bitácora | Interactions, meetings, notes, commitments, outcomes and context | Opportunity stage, Quote, Application or Policy truth |
| Cotizaciones | Quote, Quote Version, calculation and presentation lifecycle | Person, Application or Policy creation |
| Application | Application identity, versions, signature and submission lifecycle | Policy issuance |
| Cartera | Policy, roles, issuance, status, payments, service and conservation | Quote calculation or Application signature truth |
| Timeline | Source-attributed chronological projection | Independent truth or mutation |
| Alfred / NBA / Nash | Explanation, recommendation and draft candidates | Canonical truth or automatic action |

## Existing accepted foundations

```text
FES_ACTIVITY_EVENT_LEDGER_TIMELINE=REUSE
CARTERA_001B_QUOTE_LIFECYCLE=REUSE
CARTERA_010B_COMMERCIAL_PERSON_AND_POLICY=REUSE
CARTERA_020B_POLICY_EVIDENCE=REUSE
CARTERA_020C_GOVERNED_CONFIRMATION=REUSE
PR_144_QUOTE_TO_POLICY_EDGE=REUSE
PR_145_CARTERA_PRODUCTIVE_ROUTE=REUSE
```

PR #144 remains valid as one Quote-to-Policy lineage edge. It is not the system spine.

```text
PR_144_ROLE=QUOTE_TO_POLICY_LINEAGE_EDGE
PR_144_ROLE_IS_SYSTEM_SPINE=NO
REVERT_REQUIRED=NO
```

## Non-negotiable invariants

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

## Execution pattern

Every stage uses the same four substages:

```text
A=SCOPE_DISCOVERY_AND_AUTHORITIES
B=CONTRACTS_MODELS_AND_FOUNDATIONS
C=PRODUCTIVE_INTEGRATION_AND_RUNTIME
D=ACCEPTANCE_EVIDENCE_AND_CLOSURE
```

A stage is not complete until its `D` substage closes. Contract completion alone never implies productive completion.

---

## Stage 00 — Source truth and roadmap lock

### CRS_00A_REPOSITORY_DISCOVERY_AND_AUTHORITY_INVENTORY

Inventory accepted Activity, Pipeline, Quote, identity, Policy, evidence and confirmation authorities. Identify gaps without replacing existing truth.

### CRS_00B_SOURCE_TRUTH_AND_DOMAIN_AUTHORITY_LOCK

Lock `CommercialPerson + AdvisorCommercialRelationship`, the domain authority matrix, the Juan Pérez journey and all safety invariants.

### CRS_00C_ROADMAP_GOVERNANCE_AND_VALIDATION

Formalize 12 stages, 48 substages, dependency rules, machine validation and documentation-only scope enforcement.

### CRS_00D_ACCEPTANCE_EVIDENCE_AND_CLOSURE

Persist closure evidence proving the roadmap, source truth, counts, boundaries and next authorized pass.

```text
CRS_00_RUNTIME_MUTATION=NO
CRS_00_SCHEMA_MUTATION=NO
CRS_00_PRODUCT_UI_MUTATION=NO
CRS_00_SUPABASE_MUTATION=NO
```

---

## Stage 01 — Canonical person and advisor relationship spine

### CRS_01A_PERSON_RELATIONSHIP_SCOPE_AND_AUTHORITY

Define ownership, identity precedence, advisor scope, privacy and correction rules.

### CRS_01B_PERSON_RELATIONSHIP_CONTRACTS_AND_MODELS

Deliver versioned contracts for `CommercialPerson`, `AdvisorCommercialRelationship`, `RelationshipOrigin` and stable references.

### CRS_01C_PERSON_RELATIONSHIP_PRODUCTIVE_PERSISTENCE

Mount owner-scoped persistence and governed identity resolution without automatic merge.

### CRS_01D_PERSON_RELATIONSHIP_ACCEPTANCE_AND_CLOSURE

Accept uniqueness, idempotency, disputes, corrections, RLS and duplicate prevention.

---

## Stage 02 — Correlation and domain-link contract

### CRS_02A_CORRELATION_DOMAIN_LINK_SCOPE

Define commercial movement, source authority, missing-link and replay semantics.

### CRS_02B_CORRELATION_DOMAIN_LINK_CONTRACTS

Deliver the common envelope:

```text
personReference
relationshipReference
correlationId
domain
recordType
recordReference
authority
sourceEventReference
effectiveAt
recordedAt
privacyClassification
```

### CRS_02C_CORRELATION_DOMAIN_LINK_PRODUCTIVE_ADAPTERS

Create pure adapters for authoritative domain receipts without copying payload truth.

### CRS_02D_CORRELATION_DOMAIN_LINK_ACCEPTANCE

Accept multiple movements, changed-input conflicts, source attribution and no truth duplication.

---

## Stage 03 — Pipeline convergence

### CRS_03A_PIPELINE_PERSON_RELATIONSHIP_SCOPE

Map Prospect, Opportunity, stages, bulk import and external milestones.

### CRS_03B_PIPELINE_PERSON_RELATIONSHIP_CONTRACTS

Define Prospect-to-Person, Opportunity-to-Relationship and movement correlation contracts.

### CRS_03C_PIPELINE_PERSON_RELATIONSHIP_INTEGRATION

Bind manual and bulk intake, cards, detail and stage events to canonical identity.

### CRS_03D_PIPELINE_PERSON_RELATIONSHIP_ACCEPTANCE

Accept multiple opportunities, duplicate prevention and authoritative milestone projection.

```text
APPLICATION_SIGNED_SOURCE=APPLICATION_AUTHORITY
POLICY_ISSUED_SOURCE=CARTERA_AUTHORITY
PIPELINE_REFLECTION_ALLOWED=YES
PIPELINE_INVENTS_EXTERNAL_MILESTONE=NO
```

---

## Stage 04 — Activity and Bitácora convergence

### CRS_04A_ACTIVITY_BITACORA_RELATIONSHIP_SCOPE

Map calls, messages, meetings, notes, commitments, outcomes, consent and privacy.

### CRS_04B_ACTIVITY_BITACORA_RELATIONSHIP_CONTRACTS

Extend canonical Activity subject links with person, relationship and optional movement.

### CRS_04C_ACTIVITY_BITACORA_RELATIONSHIP_INTEGRATION

Bind Activity, appointments, outcomes and contextual memory across module views.

### CRS_04D_ACTIVITY_BITACORA_RELATIONSHIP_ACCEPTANCE

Accept chronology, privacy, corrections, unresolved context and blocked automatic sales triggers.

---

## Stage 05 — Quote convergence

### CRS_05A_QUOTE_RELATIONSHIP_SCOPE

Map Quote lifecycle, accepted receipts, local-only states and product-neutral identity needs.

### CRS_05B_QUOTE_RELATIONSHIP_CONTRACTS

Require person, relationship, optional opportunity and movement references while preserving Quote truth.

### CRS_05C_QUOTE_RELATIONSHIP_INTEGRATION

Bind Vida Mujer, Segubeca and future products through one common relationship adapter.

### CRS_05D_QUOTE_RELATIONSHIP_ACCEPTANCE

Accept relationship lineage and block calculation copying, automatic Application and automatic Policy creation.

---

## Stage 06 — Application and signature authority

### CRS_06A_APPLICATION_SIGNATURE_SCOPE

Discover existing request, signature, submission, requirements, approval and issuance evidence sources.

### CRS_06B_APPLICATION_SIGNATURE_CONTRACTS

Define Application, Application Version, signer, signature evidence and lifecycle events.

### CRS_06C_APPLICATION_SIGNATURE_PRODUCTIVE_INTEGRATION

Bind Quote and Opportunity lineage, Pipeline projections and governed handoff toward Cartera.

### CRS_06D_APPLICATION_SIGNATURE_ACCEPTANCE

Accept signature evidence and state transitions; block Policy creation before issuance evidence.

```text
SIGNED_APPLICATION_IS_POLICY=NO
SUBMITTED_APPLICATION_IS_POLICY=NO
APPROVED_APPLICATION_IS_POLICY=NO
ISSUANCE_EVIDENCE_REQUIRED_FOR_POLICY=YES
```

---

## Stage 07 — Cartera convergence

### CRS_07A_CARTERA_PERSON_RELATIONSHIP_SCOPE

Map Policy, roles, accounts, issuance, payments, service and conservation against the person relationship.

### CRS_07B_CARTERA_PERSON_RELATIONSHIP_CONTRACTS

Define Application-to-Policy, Policy-to-Person and permitted role lineage.

### CRS_07C_CARTERA_PERSON_RELATIONSHIP_INTEGRATION

Bind productive Cartera records and events to canonical identity and movement references.

### CRS_07D_CARTERA_PERSON_RELATIONSHIP_ACCEPTANCE

Accept multiple Policies, role privacy, no duplicate Policy and no Quote-as-Policy source.

---

## Stage 08 — Unified person Timeline

### CRS_08A_UNIFIED_PERSON_TIMELINE_SCOPE

Define event taxonomy, source attribution, privacy, corrections, stale and disputed states.

### CRS_08B_UNIFIED_PERSON_TIMELINE_READ_MODEL

Compose chronological entries from authoritative events; do not create a second ledger.

### CRS_08C_UNIFIED_PERSON_TIMELINE_INTEGRATION

Mount person Timeline projections in Pipeline, Activity, Quotes and Cartera surfaces.

### CRS_08D_UNIFIED_PERSON_TIMELINE_ACCEPTANCE

Accept chronology, corrections, unknown states, source visibility and no duplicate truth.

---

## Stage 09 — Productive person workspace

### CRS_09A_PERSON_WORKSPACE_SCOPE_AND_INFORMATION_ARCHITECTURE

Define sections, module ownership, deep links and mobile/desktop behavior.

### CRS_09B_PERSON_WORKSPACE_READ_MODEL_AND_ACTION_BOUNDARIES

Compose identity, opportunities, commitments, interactions, Quotes, Applications, Policies and Timeline.

### CRS_09C_PERSON_WORKSPACE_PRODUCTIVE_MOUNT

Mount one authenticated person-centered workspace reachable from all modules.

### CRS_09D_PERSON_WORKSPACE_ACCEPTANCE

Accept responsive behavior, safe area, logout scrub, late-result rejection and no duplicate mutation controls.

---

## Stage 10 — Relationship intelligence

### CRS_10A_RELATIONSHIP_INTELLIGENCE_SCOPE_AND_SAFETY

Define permitted evidence, consent, uncertainty and prohibited human scoring.

### CRS_10B_RELATIONSHIP_INTELLIGENCE_COMPOSITION_CONTRACTS

Define evidence-backed explanation, recommendation and draft envelopes.

### CRS_10C_RELATIONSHIP_INTELLIGENCE_PRODUCTIVE_INTEGRATION

Compose Alfred, NBA and Nash candidates without automatic execution.

### CRS_10D_RELATIONSHIP_INTELLIGENCE_ACCEPTANCE

Accept why-now evidence, uncertainty, human confirmation and blocked opaque scoring.

```text
ALFRED_EXPLAINS=YES
NBA_RECOMMENDS=YES
NASH_DRAFTS=YES
HUMAN_DECIDES=YES
MODULE_AUTHORITY_EXECUTES=YES
AUTOMATIC_BUSINESS_ACTION=NO
```

---

## Stage 11 — End-to-end acceptance

### CRS_11A_END_TO_END_ACCEPTANCE_PLAN

Lock fixtures, environments, devices, identities, expected events and rollback criteria.

### CRS_11B_END_TO_END_DATA_AND_SECURITY_ACCEPTANCE

Validate RLS, idempotency, conflicts, correction lineage, privacy and cross-advisor isolation.

### CRS_11C_END_TO_END_PRODUCTIVE_JOURNEY_ACCEPTANCE

Run the complete Juan Pérez journey through Pipeline, Bitácora, Quote, Application and Cartera.

### CRS_11D_PROGRAM_CLOSURE_AND_PROMOTION

Persist evidence, close residual gaps and promote the relationship spine as productive authority.

```text
ONE_PERSON_END_TO_END=PASS
MULTIPLE_COMMERCIAL_MOVEMENTS=PASS
MULTIPLE_QUOTES=PASS
MULTIPLE_POLICIES=PASS
UNIFIED_TIMELINE=PASS
MODULE_AUTHORITIES_PRESERVED=PASS
```

## Segubeca dependency and sequencing

Segubeca is not blocked by all 12 stages.

```text
CRS_00_COMPLETE
→ CRS_01_COMPLETE
→ CRS_02_COMPLETE
→ SEGUBECA_PRODUCTIVE_RELATIONSHIP_BINDING
→ CRS_03_THROUGH_CRS_11_INCREMENTAL_CONVERGENCE
```

```text
SEGUBECA_CALCULATION_WORK_CAN_PROCEED=YES
SEGUBECA_PRODUCTIVE_RELEASE_REQUIRES_CRS_01_02=YES
SEGUBECA_PRODUCT_SPECIFIC_IDENTITY_ADAPTER=FORBIDDEN
SEGUBECA_PRODUCT_SPECIFIC_CARTERA_ADAPTER=FORBIDDEN
```

## Locked stage sequence

```text
CRS_00_SOURCE_TRUTH_AND_ROADMAP_LOCK
→ CRS_01_CANONICAL_PERSON_RELATIONSHIP_SPINE
→ CRS_02_CORRELATION_AND_DOMAIN_LINK_CONTRACT
→ CRS_03_PIPELINE_PERSON_RELATIONSHIP_CONVERGENCE
→ CRS_04_ACTIVITY_BITACORA_RELATIONSHIP_CONVERGENCE
→ CRS_05_QUOTE_RELATIONSHIP_CONVERGENCE
→ CRS_06_APPLICATION_SIGNATURE_AUTHORITY
→ CRS_07_CARTERA_PERSON_RELATIONSHIP_CONVERGENCE
→ CRS_08_UNIFIED_PERSON_TIMELINE_READ_MODEL
→ CRS_09_PRODUCTIVE_PERSON_WORKSPACE
→ CRS_10_RELATIONSHIP_INTELLIGENCE_COMPOSITION
→ CRS_11_END_TO_END_RELATIONSHIP_ACCEPTANCE
```

## Roadmap completion definition

```text
CANONICAL_ROOT=COMMERCIAL_PERSON
PIPELINE_RELATION=COMPLETE
BITACORA_RELATION=COMPLETE
QUOTE_RELATION=COMPLETE
APPLICATION_RELATION=COMPLETE
POLICY_RELATION=COMPLETE
UNIFIED_PERSON_TIMELINE=COMPLETE
PRODUCTIVE_PERSON_WORKSPACE=COMPLETE
END_TO_END_ACCEPTANCE=PASS
CENTRAL_DUPLICATE_TRUTH_STORE=NO
MODULE_AUTHORITIES_PRESERVED=YES
```

## CRS 00 single-pass state

```text
CRS_00A_REPOSITORY_DISCOVERY_AND_AUTHORITY_INVENTORY=COMPLETE
CRS_00B_SOURCE_TRUTH_AND_DOMAIN_AUTHORITY_LOCK=COMPLETE
CRS_00C_ROADMAP_GOVERNANCE_AND_VALIDATION=IN_PROGRESS
CRS_00D_ACCEPTANCE_EVIDENCE_AND_CLOSURE=PENDING
NEXT=CRS_00C_ROADMAP_GOVERNANCE_AND_VALIDATION
```