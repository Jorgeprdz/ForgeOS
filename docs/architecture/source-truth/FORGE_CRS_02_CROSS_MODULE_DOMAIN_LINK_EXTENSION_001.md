# Forge CRS 02 — Missing Cross-Module Domain Link Extension 001

## Authority

```text
SOURCE_TRUTH=FORGE_CRS_02_CROSS_MODULE_DOMAIN_LINK_EXTENSION_001
RECORDED=2026-08-01
SOURCE_MAIN_HEAD=d231c35806fb9871bd2728cc37232b27bc5abf08
STAGE=CRS_02_MISSING_CROSS_MODULE_LINK_EXTENSION
DELIVERY_MODE=ONE_BRANCH_ONE_PR_ONE_UNIFIED_PASS
PRODUCT_UI_MUTATION=NO
SCHEMA_MUTATION=NO
SUPABASE_MUTATION=NO
DATABASE_MIGRATION=NO
```

## CRS 02A — Scope discovery and authority decision

Cartera 010B already resolves source identities to the canonical `CommercialPerson`. Its `commercial_source_identity_links` answer **who this source identity belongs to**. They do not represent every Opportunity, Activity, Quote, Application, Policy or commercial movement.

The remaining gap is one common reference-only envelope that can connect an authoritative domain record to the existing person without copying the record payload.

```text
CANONICAL_PERSON_AUTHORITY=CARTERA_010B_COMMERCIAL_PERSON
SOURCE_IDENTITY_LINK_AUTHORITY=CARTERA_010B_SOURCE_IDENTITY_LINKS
COMMON_DOMAIN_LINK_ENVELOPE=DELIVERED_BY_CRS_02
CENTRAL_LINK_LEDGER=NOT_CREATED
AUTHORITATIVE_PAYLOAD_COPY=FORBIDDEN
```

### Stable references

```text
personReference=existing CommercialPerson reference
relationshipReference=deterministic advisor-person address
correlationId=optional explicit commercial movement or need
recordReference=authoritative domain record
sourceEventReference=authoritative event or durable receipt
```

`relationshipReference` is derived from `advisorReference + personReference`. It is not a durable `AdvisorCommercialRelationship` entity, table or lifecycle.

```text
RELATIONSHIP_REFERENCE_MODE=DETERMINISTIC_DERIVED_ADDRESS
DURABLE_ADVISOR_COMMERCIAL_RELATIONSHIP_ENTITY=NO
```

A person may have multiple independent movements:

```text
person:ana
├── movement:retiro-2026
├── movement:educacion-2027
└── movement:gastos-medicos-2027
```

`correlationId` may remain `null` when no commercial movement has been explicitly established. CRS 02 never invents one.

### Legacy correlation protection

Existing FES and Quote events already use `correlation_id`, but those fields may currently represent Prospect or event-family correlation rather than the new commercial movement semantics.

```text
LEGACY_SOURCE_CORRELATION_AUTO_REINTERPRETATION=FORBIDDEN
COMMERCIAL_MOVEMENT_CORRELATION_REQUIRES_EXPLICIT_CONTEXT=YES
```

## CRS 02B — Common contract

```text
CONTRACT=platform/shared-commercial-model/crs-02-domain-link-envelope-contract.js
CONTRACT_TYPE=FORGE_COMMERCIAL_PERSON_DOMAIN_LINK
CONTRACT_VERSION=CRS-02-DOMAIN-LINK-001.1
SCHEMA_VERSION=forge.commercial_person_domain_link.v1
```

The canonical envelope contains:

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

It also contains contract metadata, deterministic `linkReference`, `idempotencyKey`, optional `correctionOf` and tamper-evident `linkDigest`.

### Domains and authorities

| Domain | Record families | Accepted authorities |
|---|---|---|
| Pipeline | Prospect, Opportunity, Pipeline Event | Pipeline Prospect, Opportunity and Stage Event authorities |
| Activity | Activity Event, Appointment, Due Action | FES Activity Event Ledger and canonical Activity Timeline |
| Quote | Quote, Quote Version, lifecycle event | Quote lifecycle and persistence authorities |
| Application | Application, version, signature evidence, event | Reserved `APPLICATION_AUTHORITY` from CRS 06 |
| Cartera | Policy, version, events, payments, service, relationship memory | Existing Cartera authorities |

Application vocabulary is reserved so later stages use the same contract. CRS 02 does not claim that the Application authority already exists.

```text
APPLICATION_AUTHORITY_STATUS=RESERVED_NOT_YET_PRODUCTIVE
APPLICATION_CREATION_BY_CRS_02=NO
```

### Missing-link semantics

When canonical identity is unresolved, the adapter returns:

```text
CONTRACT_TYPE=FORGE_MISSING_COMMERCIAL_PERSON_DOMAIN_LINK
MISSING_REASON=PERSON_UNRESOLVED
```

A missing-link result deliberately contains no `personReference` or `relationshipReference`. It cannot masquerade as a partial canonical link.

### Replay and correction semantics

```text
SAME_IDEMPOTENCY_SAME_DIGEST=REPLAY_IDENTICAL
SAME_IDEMPOTENCY_CHANGED_INPUT=CONFLICT
SAME_RECORD_CHANGED_LINK_WITHOUT_CORRECTION=CONFLICT
SAME_RECORD_CHANGED_LINK_WITH_CORRECTION_OF=CORRECTION_ACCEPTED
DIFFERENT_RECORD_OR_MOVEMENT=DISTINCT_LINK
```

## CRS 02C — Pure productive adapters

```text
ADAPTERS=platform/shared-commercial-model/crs-02-authoritative-domain-link-adapters.js
ADAPTER_VERSION=CRS-02-DOMAIN-LINK-ADAPTERS-001.1
```

Delivered adapter entry points:

```text
fromAuthoritativeReceipt
fromCanonicalActivityEvent
fromQuoteLifecycleEvent
fromAcceptedQuoteCarteraRelationship
```

The generic adapter accepts only an explicit `authoritative: true` receipt with references and timestamps. It rejects arbitrary payload fields.

The specialized adapters reuse:

```text
FES_ACTIVITY_AUTHORITY=platform/event-evidence/canonical-activity-event-contract.js
QUOTE_LIFECYCLE_AUTHORITY=platform/event-evidence/quote-lifecycle-event-contract.js
QUOTE_CARTERA_EDGE=platform/shared-commercial-model/accepted-quote-cartera-relationship-contract.js
```

PR #144 remains one accepted Quote-to-Cartera lineage edge. CRS 02 adapts that edge into the common link form without treating it as the complete spine.

```text
PR_144_ROLE=QUOTE_TO_CARTERA_LINEAGE_EDGE
PR_144_ROLE_IS_CENTRAL_SPINE=NO
```

## CRS 02D — Acceptance contract

CRS 02 must prove:

```text
COMMON_ENVELOPE_IMMUTABLE=YES
LINK_DIGEST_TAMPER_EVIDENT=YES
RELATIONSHIP_REFERENCE_DETERMINISTIC=YES
RELATIONSHIP_ENTITY_PERSISTED=NO
MULTIPLE_MOVEMENTS_PER_PERSON=PASS_REQUIRED
NULL_MOVEMENT_CORRELATION_PRESERVED=YES
DOMAIN_AUTHORITY_MISMATCH_FAILS_CLOSED=YES
MISSING_PERSON_RETURNS_MISSING_LINK=YES
CHANGED_INPUT_REPLAY_CONFLICT=YES
CORRECTION_LINEAGE_REQUIRED=YES
FES_ADAPTER_COMPATIBILITY=PASS_REQUIRED
QUOTE_ADAPTER_COMPATIBILITY=PASS_REQUIRED
PR_144_EDGE_COMPATIBILITY=PASS_REQUIRED
AUTHORITATIVE_PAYLOAD_COPY=NO
LEGACY_CORRELATION_REINTERPRETATION=NO
REP_17_REGRESSION=PASS_REQUIRED
```

## Non-authorizations

```text
NEW_COMMERCIAL_PERSON_TABLE=FORBIDDEN
PARALLEL_IDENTITY_RESOLUTION=FORBIDDEN
NEW_ADVISOR_COMMERCIAL_RELATIONSHIP_PERSISTENCE=FORBIDDEN_BY_CRS_02
CENTRAL_DOMAIN_LINK_LEDGER=FORBIDDEN_BY_CRS_02
NEW_PERSON_TIMELINE_LEDGER=FORBIDDEN
AUTHORITATIVE_DOMAIN_PAYLOAD_COPY=FORBIDDEN
AUTOMATIC_IDENTITY_MERGE=FORBIDDEN
AUTOMATIC_OPPORTUNITY_CREATION=FORBIDDEN
AUTOMATIC_APPLICATION_CREATION=FORBIDDEN
AUTOMATIC_POLICY_CREATION=FORBIDDEN
AUTOMATIC_STAGE_ADVANCE=FORBIDDEN
AUTOMATIC_CONTACT=FORBIDDEN
AUTOMATIC_MESSAGE=FORBIDDEN
AUTOMATIC_TASK=FORBIDDEN
AUTOMATIC_CALENDAR=FORBIDDEN
DATABASE_MUTATION=NO
CRM_MUTATION=NO
QUOTE_MUTATION=NO
```

## Stage state

```text
CRS_02A_CORRELATION_DOMAIN_LINK_SCOPE=COMPLETE
CRS_02B_CORRELATION_DOMAIN_LINK_CONTRACTS=COMPLETE
CRS_02C_CORRELATION_DOMAIN_LINK_PRODUCTIVE_ADAPTERS=COMPLETE
CRS_02D_CORRELATION_DOMAIN_LINK_ACCEPTANCE=PENDING_FINAL_GREEN_GATES
NEXT_AFTER_CLOSURE=CRS_03ABCD_PIPELINE_PERSON_CONVERGENCE
```
