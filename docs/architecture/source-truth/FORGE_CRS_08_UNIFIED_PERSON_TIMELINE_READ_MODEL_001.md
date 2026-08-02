# Forge CRS 08 Unified Person Timeline Read Model 001

## Status

```text
PHASE=CRS_08ABCD_UNIFIED_PERSON_TIMELINE_READ_MODEL
SOURCE_MAIN_HEAD=b32b4d8b982c1ddb3e2593e55790de6fff2097cc
DELIVERY_MODE=ONE_BRANCH_ONE_PR_ONE_UNIFIED_PASS
CANONICAL_ROOT=COMMERCIAL_PERSON
TIMELINE_KIND=CARTERA_040B_HISTORY_EXTENSION
SECOND_EVENT_LEDGER=NO
SCHEMA_MUTATION=NO
REMOTE_MUTATION=NO
PRODUCT_UI_MUTATION=NO
```

## Authority lock

CRS 08 extends the accepted `CARTERA_040B_PERSON_RELATIONSHIP_BRIEF`; it does not replace it. Direct domain readers add missing or higher-fidelity events, and an exact `domain + sourceEventReference` collision is resolved in favor of the direct authority.

CRS 08 does not become a business-domain authority. It composes chronological entries from accepted authorities and keeps attribution visible.

```text
PIPELINE_AUTHORITY=PIPELINE_PROSPECT_AUTHORITY
ACTIVITY_AUTHORITY=FES_ACTIVITY_EVENT_LEDGER
QUOTE_AUTHORITY=QUOTE_LIFECYCLE_AUTHORITY
APPLICATION_AUTHORITY=APPLICATION_AUTHORITY
POLICY_AUTHORITY=CARTERA_POLICY_AUTHORITY
PERSON_AUTHORITY=CARTERA_010B_COMMERCIAL_PERSON
RELATIONSHIP_AUTHORITY=CRS_01_ADVISOR_COMMERCIAL_RELATIONSHIP
PERSON_HISTORY_FOUNDATION=CARTERA_040B_PERSON_RELATIONSHIP_BRIEF
CORRELATION_CONTRACT=CRS_02
```

```text
UNIFIED_TIMELINE_OWNS_TRUTH=NO
UNIFIED_TIMELINE_PERSISTS_EVENTS=NO
UNIFIED_TIMELINE_CORRECTS_SOURCE_RECORDS=NO
UNIFIED_TIMELINE_EXECUTES_ACTIONS=NO
```

## Timeline contract

```text
CONTRACT_TYPE=FORGE_UNIFIED_PERSON_TIMELINE
CONTRACT_VERSION=CRS-08-UNIFIED-PERSON-TIMELINE-001.1
SCHEMA_VERSION=forge.unified_person_timeline.v1
ENTRY_VERSION=forge.unified_person_timeline_entry.v1
```

Every entry retains:

```text
entryReference
domain
recordType
recordReference
sourceEventReference
authority
personReference
relationshipReference
correlationId
occurredAt
recordedAt
privacyClassification
confirmationState
correctionOf
correctionSourceEventReference
sourceDigest
```

Ordering is deterministic:

```text
PRIMARY=occurredAt_DESC
SECONDARY=recordedAt_DESC
TERTIARY=sourceEventReference_ASC
```

## Source composition

### Existing Cartera 040B foundation

The service first reads `forge_cartera040_list_relationship_brief` and maps its sanitized `history` into attributed Timeline entries. The existing projection remains the history foundation. Direct domain readers extend gaps and replace only the same domain/source event with the higher-fidelity authoritative entry. Foundation availability is exposed separately as `historyFoundation`.


### Pipeline

Pipeline contributes a minimal current Prospect snapshot for each active `PROSPECT` identity link owned by the selected CommercialPerson. Contact fields, initial context, income and other private payload fields are not copied into Timeline facts.

### Activity / Bitácora

Activity is read through `forge_fes02_pull_activity_events`; browser direct table reads remain denied. CRS 08 includes events whose authoritative subject is a Prospect actively linked to the selected person. It does not guess that an Appointment or Activity subject belongs to a person without a durable identity edge.

### Quote

Quote contributes durable `quote_lifecycle_events` linked through the person's active Prospect identities. Calculation payloads and printable document contents remain owned by Quote and are not copied.

### Application

Application contributes append-only `application_events` for Applications whose `person_id` is the selected CommercialPerson. Signature images, document bytes and provider payloads remain forbidden.

### Cartera

Cartera contributes verified CRS 07 Application-to-Policy lineage through the existing Policy read service. Policy number and evidence payload are not copied into Timeline facts. The PolicyRole privacy classification remains authoritative.

## Corrections and disputes

```text
CORRECTIONS=APPEND_ONLY_SOURCE_REFERENCES
ORIGINAL_ENTRY_DELETED=NO
CORRECTED_ORIGINAL_VISIBLE=YES
MISSING_CORRECTION_TARGET=ATTENTION_REQUIRED
UNCONFIRMED_ENTRY=ATTENTION_REQUIRED
REPORTED_ENTRY=ATTENTION_REQUIRED
DISPUTED_ENTRY=ATTENTION_REQUIRED
```

CRS 08 resolves correction references only inside the same `domain + authority`. It never allows an Activity correction to replace Quote, Application or Policy truth.

## Privacy and minimization

```text
PRIVACY_CLASSES=OPERATIONAL_PRIVATE_SENSITIVE_RESTRICTED
FILTER_BY_MAX_PRIVACY=YES
RAW_CONTACT_COPY=NO
RAW_NOTES_COPY=NO
RAW_MESSAGE_COPY=NO
MEDICAL_DATA_COPY=NO
BANK_DATA_COPY=NO
SIGNATURE_PAYLOAD_COPY=NO
PROVIDER_PAYLOAD_COPY=NO
POLICY_NUMBER_COPY=NO
```

The contract recursively rejects prohibited fact keys and caps normalized fact payload size.

## Source health

Each domain reports one explicit state:

```text
AVAILABLE
EMPTY
DEGRADED
UNAVAILABLE
```

A non-critical source read can degrade without hiding the failure. `strictSources=true` is available for acceptance and diagnostics. Person ownership, identity and cross-person lineage failures remain fail-closed.

## Runtime

```text
SERVICE=advisor-os/timeline/crs-08-unified-person-timeline-service.js
METHOD=getUnifiedPersonTimeline
METHOD=getFilteredPersonTimeline
METHOD=filterTimeline
TIMELINE_PERSISTENCE=NO
SOURCE_MUTATION=NO
BACKGROUND_ACTION=NO
```

## Remote acceptance boundary

The remote gate is read-only. It inventories source authorities, required columns, the Cartera 040B brief RPC, FES RPC access and minimum privileges, and proves no CRS 08 Timeline table/view/materialized view exists.

```text
REMOTE_SQL_PREFIX=SELECT_OR_WITH_ONLY
REMOTE_DDL=FORBIDDEN
REMOTE_DML=FORBIDDEN
MIGRATION=NONE
SECOND_TIMELINE_STORE=NO
```

## Next stage

```text
NEXT=CRS_09ABCD_PRODUCTIVE_PERSON_WORKSPACE
```
