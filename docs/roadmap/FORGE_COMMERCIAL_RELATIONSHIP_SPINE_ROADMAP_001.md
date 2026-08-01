# Forge Commercial Relationship Spine Roadmap 001

## Status

```text
STATUS=ACTIVE_OWNER_ALIGNED_ROADMAP
RECORDED=2026-08-01
SOURCE_MAIN_HEAD=e0b8f4e2e8629e506ef1e49beecc48dd741ffefa
CURRENT=CRS_00_SOURCE_TRUTH_AND_ROADMAP_LOCK
NEXT=CRS_01_CANONICAL_PERSON_RELATIONSHIP_SPINE
MAIN_MUTATION=NO
PRODUCT_UI_MUTATION=NO
SUPABASE_MUTATION=NO
```

## Product decision

ForgeOS follows the complete commercial relationship with a person. It does not treat Pipeline, Bitácora, Cotizaciones, Solicitudes and Cartera as disconnected records.

The canonical center is:

```text
CommercialPerson
+ AdvisorCommercialRelationship
```

Every module preserves its own truth and links its records to that shared person and relationship.

```text
CommercialPerson
└── AdvisorCommercialRelationship
    ├── Prospect and Pipeline opportunities
    ├── Activity and Bitácora records
    ├── Meetings and commitments
    ├── Quotes and Quote Versions
    ├── Applications and signatures
    ├── Policies and Policy Roles
    ├── Payments and service events
    └── Referrals and relationship context
```

The unified Timeline is a composed read model. It references authoritative records and events; it is not a second truth store.

## Governing journey

```text
Juan Pérez contacto inicial
→ Pipeline creates or links a Prospect and opportunity

Cita con Juan Pérez
→ Activity / Bitácora records the interaction, context and commitments

Cotización con Juan Pérez
→ Quote authority stores Quote and Quote Version linked to the same person relationship

Cita de cierre con Juan Pérez
→ Activity / Bitácora records the closing interaction and outcome

Juan Pérez firmó solicitud
→ Application authority records signature evidence
→ Pipeline reflects the authoritative application milestone

Se emitió la póliza de Juan Pérez
→ Cartera creates or links the canonical Policy after governed confirmation

Revisión anual con Juan Pérez
→ Activity / Bitácora records service context
→ Cartera continues to own Policy, payment and conservation truth

Nueva necesidad detectada
→ Pipeline may open a new opportunity for the same CommercialPerson
```

The person remains the same throughout the journey. Opportunities, meetings, Quotes, Applications and Policies may be multiple.

```text
ONE_PERSON=MANY_OPPORTUNITIES
ONE_PERSON=MANY_ACTIVITIES
ONE_PERSON=MANY_QUOTES
ONE_PERSON=MANY_APPLICATIONS
ONE_PERSON=MANY_POLICIES
PERSON_DUPLICATION=FORBIDDEN
```

## Canonical entities

### CommercialPerson

Represents the stable commercial identity of the human being.

```text
personReference
advisorId
displayIdentity
verifiedIdentityLinks
lifecycleState
privacyClassification
evidenceReferences
```

CommercialPerson does not own opportunity stage, Quote calculations, meeting notes, Application state or Policy state.

### AdvisorCommercialRelationship

Represents the relationship between one advisor and one CommercialPerson.

```text
relationshipReference
advisorId
personReference
relationshipState
originReferences
createdAt
lastInteractionAt|null
```

The relationship is not a lead score, human-worth score or automatic sales trigger.

### Domain references

Each domain record remains under its authority and links through references:

```text
prospectReference|null
opportunityReference|null
activityReference|null
meetingReference|null
quoteReference|null
quoteVersionReference|null
applicationReference|null
policyReference|null
paymentEventReference|null
serviceCommitmentReference|null
```

### Correlation

A `correlationId` groups records that belong to one commercial movement without replacing the stable person or relationship identity.

Examples:

```text
relationshipReference=relationship:juan-perez
correlationId=movement:juan-perez:retirement-2026

relationshipReference=relationship:juan-perez
correlationId=movement:juan-perez:education-2027
```

The same person may have simultaneous commercial movements.

## Authority matrix

| Domain | Owns | Must not own |
|---|---|---|
| Identity / Shared Commercial Model | CommercialPerson, identity decisions and advisor relationship | Pipeline stage, calculations, Application or Policy truth |
| Pipeline | Opportunities, stage, commercial movement and next-step workflow | Quote calculations, meeting evidence, signature evidence or Policy issuance |
| Activity / Bitácora | Interactions, meetings, notes, commitments, outcomes and context | Opportunity authority, Quote truth or Policy truth |
| Cotizaciones | Quote, Quote Version, product calculation and presentation lifecycle | Person creation, opportunity mutation or Policy issuance |
| Solicitudes / Application | Application identity, signature evidence and submission lifecycle | Pipeline stage invention or Policy issuance |
| Cartera | Policy, Policy Roles, issuance, status, payments, service and conservation | Quote calculations or Application signature truth |
| Timeline | Composed chronological projection with source references | Independent event truth or silent mutation |
| Alfred / NBA / Council | Explanation and recommendation candidates | Canonical identity, final priority or automatic business action |

## Existing accepted foundations

The roadmap reuses existing work rather than replacing it:

```text
FES_ACTIVITY_AND_TIMELINE_FOUNDATION=REUSE
CARTERA_001B_QUOTE_LIFECYCLE=REUSE
CARTERA_010B_COMMERCIAL_PERSON_AND_POLICY=REUSE
CARTERA_020B_POLICY_EVIDENCE=REUSE
CARTERA_020C_GOVERNED_CONFIRMATION=REUSE
QUOTE_CARTERA_RELATIONSHIP_PR_144=REUSE_AS_EDGE
CARTERA_PRODUCTIVE_ROUTE_PR_145=REUSE
```

PR #144 remains valid as the Quote-to-Policy lineage edge. It is not the system spine.

```text
PR_144_ROLE=QUOTE_TO_POLICY_LINEAGE_EDGE
PR_144_ROLE=NOT_CANONICAL_PERSON_SPINE
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

## Stage 00 — Source truth and roadmap lock

### `CRS_00_SOURCE_TRUTH_AND_ROADMAP_LOCK`

Deliver:

- this roadmap;
- canonical decision that CommercialPerson plus AdvisorCommercialRelationship is the spine;
- authority matrix;
- accepted-foundation inventory;
- locked sequence and safety boundaries;
- Segubeca dependency rule.

```text
RUNTIME_MUTATION=NO
SCHEMA_MUTATION=NO
PRODUCT_UI_MUTATION=NO
```

## Stage 01 — Canonical person and relationship spine

### `CRS_01_CANONICAL_PERSON_RELATIONSHIP_SPINE`

Deliver an executable, versioned contract for:

```text
CommercialPerson
AdvisorCommercialRelationship
RelationshipOrigin
PersonDomainLink
```

Requirements:

- owner-scoped identity;
- deterministic references;
- explicit identity-resolution outcomes;
- one advisor relationship per advisor-person pair unless explicitly versioned;
- no duplicate person creation from module-local records;
- no automatic merge;
- correction and dispute lineage;
- privacy classification and evidence references.

Acceptance:

```text
PERSON_REFERENCE_STABLE=PASS
ADVISOR_PERSON_RELATIONSHIP_UNIQUE=PASS
MODULE_LOCAL_PERSON_CREATION=BLOCKED
AUTOMATIC_IDENTITY_MERGE=BLOCKED
CROSS_ADVISOR_ACCESS=BLOCKED
```

## Stage 02 — Correlation and domain-link contract

### `CRS_02_CORRELATION_AND_DOMAIN_LINK_CONTRACT`

Deliver the common reference envelope used by every module:

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

Requirements:

- links reference authoritative records without copying their payloads;
- one commercial movement may span Pipeline, Bitácora, Quote, Application and Policy;
- a person may have multiple active movements;
- missing references remain explicit;
- changed-input replay produces conflict rather than silent overwrite.

Acceptance:

```text
DOMAIN_TRUTH_COPY=BLOCKED
MULTIPLE_MOVEMENTS_PER_PERSON=PASS
CORRELATION_CONTINUITY=PASS
CHANGED_INPUT_CONFLICT=PASS
```

## Stage 03 — Pipeline convergence

### `CRS_03_PIPELINE_PERSON_RELATIONSHIP_CONVERGENCE`

Connect Prospect and Opportunity records to the canonical person relationship.

Deliver:

- Prospect-to-Person link;
- Opportunity-to-Relationship and Correlation link;
- multiple opportunities for one person;
- stage events that preserve Pipeline authority;
- read models that can show previous Quotes, meetings and Policies by reference;
- duplicate-person prevention during manual and bulk intake.

Pipeline may reflect milestones from other authorities but may not fabricate them.

```text
APPLICATION_SIGNED_SOURCE=APPLICATION_AUTHORITY
POLICY_ISSUED_SOURCE=CARTERA_AUTHORITY
PIPELINE_REFLECTION_ALLOWED=YES
PIPELINE_INVENTS_EXTERNAL_MILESTONE=NO
```

Acceptance:

```text
PROSPECT_PERSON_LINK=PASS
OPPORTUNITY_RELATIONSHIP_LINK=PASS
MULTIPLE_OPPORTUNITIES=PASS
MILESTONE_SOURCE_ATTRIBUTION=PASS
BULK_IMPORT_DUPLICATION=BLOCKED
```

## Stage 04 — Activity and Bitácora convergence

### `CRS_04_ACTIVITY_BITACORA_RELATIONSHIP_CONVERGENCE`

Connect calls, messages, meetings, notes, commitments and outcomes to the person relationship and optional commercial movement.

Deliver:

- interaction subject link;
- meeting and appointment correlation;
- context and commitment references;
- source, evidence strength and privacy;
- unresolved context states;
- activity records usable across Pipeline, Quote and Cartera views.

Bitácora remains the contextual memory of what happened. It does not become a duplicate Pipeline or Policy store.

Acceptance:

```text
ACTIVITY_PERSON_LINK=PASS
MEETING_CORRELATION=PASS
CONTEXT_AUTHORITY_PRESERVED=PASS
SENSITIVE_CONTEXT_CONSENT_GATE=PASS
AUTOMATIC_SALES_TRIGGER=BLOCKED
```

## Stage 05 — Quote convergence

### `CRS_05_QUOTE_RELATIONSHIP_CONVERGENCE`

Generalize the accepted Quote lifecycle so every Quote carries:

```text
personReference
relationshipReference
prospectReference|null
opportunityReference|null
correlationId
quoteReference
quoteVersionReference
productReference
```

Reuse PR #144 for Quote-to-Policy lineage.

Requirements:

- Quote calculation truth remains inside Quote authority;
- accepted Quote does not automatically create Application or Policy;
- Quotes opened without Prospect context remain local or explicitly unresolved;
- Vida Mujer, Segubeca and future products use the same relationship contract;
- product-specific identity adapters are forbidden.

Acceptance:

```text
QUOTE_PERSON_RELATIONSHIP_LINK=PASS
QUOTE_OPPORTUNITY_LINK=PASS
QUOTE_CALCULATION_COPY=BLOCKED
AUTOMATIC_APPLICATION_CREATION=BLOCKED
AUTOMATIC_POLICY_CREATION=BLOCKED
PRODUCT_SPECIFIC_PERSON_ADAPTER=BLOCKED
```

## Stage 06 — Application and signature authority

### `CRS_06_APPLICATION_SIGNATURE_AUTHORITY`

Create or reconcile the missing authoritative bridge between accepted Quote and issued Policy.

Deliver:

- canonical Application identity;
- Application Version and status events;
- signer and signature-evidence references;
- Quote and Opportunity lineage;
- submitted, pending, requirements, approved, declined, withdrawn and issued transitions as supported by evidence;
- Pipeline milestone projection from Application authority;
- Cartera handoff only after issuance evidence.

A signed request is not an issued Policy.

```text
SIGNED_APPLICATION_IS_POLICY=NO
SUBMITTED_APPLICATION_IS_POLICY=NO
APPROVED_APPLICATION_IS_POLICY=NO
ISSUANCE_EVIDENCE_REQUIRED_FOR_POLICY=YES
```

Acceptance:

```text
APPLICATION_AUTHORITY=PASS
SIGNATURE_EVIDENCE=PASS
QUOTE_APPLICATION_LINEAGE=PASS
PIPELINE_APPLICATION_REFLECTION=PASS
POLICY_CREATION_BEFORE_ISSUANCE=BLOCKED
```

## Stage 07 — Cartera convergence

### `CRS_07_CARTERA_PERSON_RELATIONSHIP_CONVERGENCE`

Connect canonical Policy and Policy Roles to the same CommercialPerson and advisor relationship.

Deliver:

- Application-to-Policy lineage;
- Policy-to-Person and Account links;
- Policy owner, insured, payor and permitted role projections;
- service, payment and conservation events in the relationship Timeline;
- multiple Policies per person;
- no duplicate identity or Policy creation from Quote data.

Acceptance:

```text
POLICY_PERSON_RELATIONSHIP_LINK=PASS
APPLICATION_POLICY_LINEAGE=PASS
MULTIPLE_POLICIES_PER_PERSON=PASS
POLICY_ROLE_PRIVACY=PASS
QUOTE_AS_POLICY_SOURCE=BLOCKED
```

## Stage 08 — Unified person Timeline

### `CRS_08_UNIFIED_PERSON_TIMELINE_READ_MODEL`

Compose one chronological read model from authoritative events and records.

The Timeline may include:

```text
PROSPECT_CREATED
CONTACT_ATTEMPTED
MEETING_SCHEDULED
MEETING_COMPLETED
CONTEXT_RECORDED
QUOTE_REVIEWED
QUOTE_PRESENTED
QUOTE_ACCEPTED
CLOSING_MEETING_COMPLETED
APPLICATION_SIGNED
APPLICATION_SUBMITTED
APPLICATION_REQUIREMENT_REQUESTED
APPLICATION_APPROVED
POLICY_ISSUED
PAYMENT_CONFIRMED
SERVICE_COMMITMENT_RECORDED
ANNUAL_REVIEW_COMPLETED
NEW_OPPORTUNITY_OPENED
```

Each item must expose:

```text
eventReference
sourceAuthority
sourceRecordReference
personReference
relationshipReference
correlationId|null
effectiveAt
recordedAt
evidenceStrength
confirmationState
privacyClassification
```

The Timeline must support corrections, stale information, disputes and missing evidence without flattening them into false certainty.

Acceptance:

```text
TIMELINE_DUPLICATE_TRUTH=NO
SOURCE_AUTHORITY_VISIBLE=PASS
CROSS_MODULE_CHRONOLOGY=PASS
CORRECTION_LINEAGE=PASS
UNKNOWN_REMAINS_UNKNOWN=PASS
```

## Stage 09 — Productive person workspace

### `CRS_09_PRODUCTIVE_PERSON_WORKSPACE`

Deliver one person-centered workspace reachable from Pipeline, Activity, Cotizaciones and Cartera.

Sections:

```text
Identity and relationship
Current opportunities
Next commitments
Recent interactions
Quotes and presentations
Applications and requirements
Policies and service
Unified Timeline
Relationship context
```

Navigation preserves module ownership. Opening a Quote, Application or Policy moves to its authoritative module rather than recreating its controls inside the person workspace.

Acceptance:

```text
ONE_PERSON_WORKSPACE=PASS
MODULE_DEEP_LINKS=PASS
MOBILE_SAFE_AREA=PASS
DESKTOP_RESPONSIVE=PASS
NO_DUPLICATE_MUTATION_CONTROLS=PASS
AUTH_LOGOUT_SCRUB=PASS
LATE_RESULT_REJECTION=PASS
```

## Stage 10 — Relationship intelligence

### `CRS_10_RELATIONSHIP_INTELLIGENCE_COMPOSITION`

Compose evidence-backed assistance from the unified relationship without creating new truth silos.

Possible outputs:

- incomplete commitments;
- stalled opportunity explanation;
- missing meeting outcome;
- Quote follow-up context;
- Application requirement reminder candidate;
- Policy review and service opportunity;
- referral or relationship-growth review where consent exists.

Authority remains:

```text
ALFRED_EXPLAINS=YES
NBA_RECOMMENDS=YES
NASH_DRAFTS=YES
HUMAN_DECIDES=YES
MODULE_AUTHORITY_EXECUTES=YES
AUTOMATIC_BUSINESS_ACTION=NO
```

Acceptance:

```text
RECOMMENDATION_EVIDENCE=PASS
WHY_NOW_EXPLANATION=PASS
UNCERTAINTY_VISIBLE=PASS
HUMAN_CONFIRMATION_REQUIRED=PASS
OPAQUE_HUMAN_SCORE=BLOCKED
AUTOMATIC_EXECUTION=BLOCKED
```

## Stage 11 — End-to-end acceptance

### `CRS_11_END_TO_END_RELATIONSHIP_ACCEPTANCE`

Accept the real journey using one person identity:

```text
create or link Juan Pérez
→ open initial Pipeline opportunity
→ record contact and meeting in Activity / Bitácora
→ create and present Quote
→ record closing meeting
→ confirm Application signature and submission
→ reflect Application milestone in Pipeline
→ confirm Policy issuance in Cartera
→ show complete source-attributed Timeline
→ open a later service interaction
→ open a second opportunity without duplicating Juan Pérez
```

Validate:

- authenticated mobile and desktop runtime;
- RLS and cross-advisor isolation;
- idempotency and changed-input conflicts;
- offline/outbox behavior where applicable;
- correction and dispute lineage;
- privacy and restricted role handling;
- no automatic identity merge;
- no automatic stage, Application or Policy creation;
- zero residual test fixtures;
- Pages and productive runtime evidence.

```text
ONE_PERSON_END_TO_END=PASS
MULTIPLE_COMMERCIAL_MOVEMENTS=PASS
MULTIPLE_QUOTES=PASS
MULTIPLE_POLICIES=PASS
UNIFIED_TIMELINE=PASS
MODULE_AUTHORITIES_PRESERVED=PASS
```

## Segubeca dependency and sequencing

Segubeca is not blocked by completion of the entire roadmap.

The correct sequence is:

```text
CRS_00_SOURCE_TRUTH_AND_ROADMAP_LOCK
→ CRS_01_CANONICAL_PERSON_RELATIONSHIP_SPINE
→ CRS_02_CORRELATION_AND_DOMAIN_LINK_CONTRACT
→ SEGUBECA_PRODUCT_AND_QUOTE_IMPLEMENTATION
→ CRS_03_THROUGH_CRS_11_INCREMENTAL_CONVERGENCE
```

Segubeca calculation and product rules may be developed while CRS 01–02 are built, but productive persistence must use the common relationship contract before release.

```text
SEGUBECA_CALCULATION_WORK_CAN_PROCEED=YES
SEGUBECA_PRODUCT_SPECIFIC_IDENTITY_ADAPTER=FORBIDDEN
SEGUBECA_PRODUCT_SPECIFIC_CARTERA_ADAPTER=FORBIDDEN
SEGUBECA_PRODUCTIVE_RELEASE_REQUIRES_CRS_01_02=YES
```

## Locked sequence

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

## Immediate next pass

```text
NEXT=CRS_01_CANONICAL_PERSON_RELATIONSHIP_SPINE
DELIVERY_MODE=CONTRACT_FIRST_NO_PRODUCT_UI
PRODUCT_UI_MUTATION=NO
SUPABASE_REMOTE_MUTATION=NO_UNTIL_SEPARATELY_AUTHORIZED
SEGUBECA_PARALLEL_DISCOVERY=ALLOWED
```
