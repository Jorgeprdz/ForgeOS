# Forge CRS 06 — Application and Signature Authority 001

## Status

```text
STATUS=IMPLEMENTED_PENDING_REMOTE_DEPLOYMENT
RECORDED=2026-08-01
SOURCE_MAIN_HEAD=a299f463f0ab39ff5003180bcb64de51e250bc5e
CONTRACT_VERSION=CRS-06-APPLICATION-SIGNATURE-001.1
SCHEMA_VERSION=forge.application_signature_authority.v1
AUTHORITY=APPLICATION_AUTHORITY
REPOSITORY_IMPLEMENTATION=COMPLETE
REMOTE_SUPABASE_DEPLOYMENT=NO
REMOTE_RUNTIME_ACCEPTANCE=NO
PRODUCT_UI_MUTATION=NO
EXTERNAL_SIGNATURE_PROVIDER_CONNECTED=NO
```

CRS 06 is the first CRS stage that requires a genuinely new domain authority. Repository discovery found no existing productive owner for Application identity, Application Version, signer state, signature evidence, submission, requirements or approval. Quote contains only a blocked future reference and Cartera owns Policy only after issuance evidence.

## Authority boundary

```text
APPLICATION_OWNS=
  APPLICATION_IDENTITY
  APPLICATION_VERSION
  SIGNER_REQUIREMENTS
  SIGNATURE_EVIDENCE
  SUBMISSION_LIFECYCLE
  REQUIREMENTS_LIFECYCLE
  APPLICATION_DECISION

APPLICATION_DOES_NOT_OWN=
  COMMERCIAL_PERSON
  QUOTE_CALCULATION
  PIPELINE_STAGE
  POLICY
  POLICY_ISSUANCE
  PAYMENTS
  SERVICE
  EXTERNAL_SIGNATURE_PROVIDER
```

```text
SIGNED_APPLICATION_IS_POLICY=NO
SUBMITTED_APPLICATION_IS_POLICY=NO
APPROVED_APPLICATION_IS_POLICY=NO
ISSUANCE_EVIDENCE_REQUIRED_FOR_POLICY=YES
```

## Reused authorities

```text
PERSON_AUTHORITY=CARTERA_010B_COMMERCIAL_PERSON
QUOTE_AUTHORITY=CARTERA_001B_QUOTE_LIFECYCLE
QUOTE_PERSON_CONVERGENCE=CRS_05
DOMAIN_LINK_CONTRACT=CRS_02
PIPELINE_MILESTONE_TARGET=PROJECTION_ONLY
POLICY_AUTHORITY=CARTERA_EXISTING_AUTHORITY
```

Application creation requires an already confirmed `CommercialPerson`, an owned durable Quote, the exact current Quote Version, matching Prospect and matching product. The Application domain never creates or merges a person.

## Delivered contract

```text
CONTRACT=platform/application-authority/application-signature-authority-contract.js
CONTRACT_TYPE=FORGE_APPLICATION_SIGNATURE_AUTHORITY
```

The contract defines six bounded components:

1. `Application` identity and lifecycle;
2. immutable `Application Version` metadata;
3. signer requirements and signer state;
4. immutable signature evidence;
5. requirements and review lineage;
6. immutable Application events.

### Lifecycle

```text
DRAFT
READY_FOR_SIGNATURE
PARTIALLY_SIGNED
SIGNED
SUBMITTED
REQUIREMENTS_PENDING
REQUIREMENTS_SATISFIED
APPROVED
DECLINED
WITHDRAWN
```

### Events

```text
APPLICATION_CREATED
APPLICATION_VERSION_CREATED
APPLICATION_READY_FOR_SIGNATURE
SIGNATURE_RECORDED
APPLICATION_SIGNED
APPLICATION_SUBMITTED
REQUIREMENT_OPENED
REQUIREMENT_SATISFIED
REQUIREMENT_WAIVED
REQUIREMENT_DISPUTED
APPLICATION_APPROVED
APPLICATION_DECLINED
APPLICATION_WITHDRAWN
```

The event contract verifies state compatibility, person–Quote–version lineage, source attribution, evidence references, idempotency and correction references.

## Signature evidence

```text
SIGNATURE_EVIDENCE_TYPES=
  PROVIDER_RECEIPT
  SIGNED_DOCUMENT_DIGEST
  HUMAN_REVIEW_RECEIPT

RAW_SIGNATURE_IMAGE=FORBIDDEN
BIOMETRIC_TEMPLATE=FORBIDDEN
PROVIDER_PAYLOAD_COPY=FORBIDDEN
SIGNED_PDF_BYTES_COPY=FORBIDDEN
DOCUMENT_DIGEST=REQUIRED
EVIDENCE_REFERENCE=REQUIRED
```

A provider receipt requires its provider reference. A document-based signature requires a SHA-256 digest and evidence references. The authority stores evidence metadata, not signature strokes, images, biometrics, raw provider responses or document bytes.

Required signer completion gates `SIGNED`. A single verified signature cannot mark an Application signed when another required signer remains pending.

## Persistence model

```text
MIGRATION=supabase/migrations/20260801000600_crs06_application_signature_authority.sql
```

Repository schema:

```text
commercial_applications
application_versions
application_signers
application_signature_evidence
application_requirements
application_events
```

Security and history:

```text
FORCE_RLS=ALL_TABLES
OWNER_SCOPE=advisor_id_equals_auth_uid
DIRECT_AUTHENTICATED_WRITE_GRANTS=NO
APPLICATION_VERSION=APPEND_ONLY
SIGNATURE_EVIDENCE=APPEND_ONLY
APPLICATION_EVENT=APPEND_ONLY
RPC_ONLY_MUTATION=YES
IDEMPOTENT_REPLAY=YES
CHANGED_INPUT_REPLAY=CONFLICT
```

## Governed command service

```text
SERVICE=advisor-os/applications/application-signature-authority-service.js
```

Explicit commands:

```text
createApplicationDraft
addApplicationVersion
recordSignatureEvidence
submitApplication
recordRequirement
recordDecision
```

Every command requires:

```text
AUTHENTICATED_ADVISOR=YES
EXPLICIT_HUMAN_CONFIRMATION=YES
CONFIRMATION_REFERENCE=YES
IDEMPOTENCY_KEY=YES
SOURCE_EVIDENCE=YES
```

No command sends a signature request, contacts a signer, submits to an insurer automatically, resolves a requirement automatically, advances Pipeline automatically or creates Policy.

## Read authority and projections

Read operations:

```text
getApplication
listApplicationsForPerson
projectPipelineMilestone
```

The Application snapshot composes only authoritative references and minimized metadata. Pipeline milestones are projections for:

```text
APPLICATION_SIGNED
APPLICATION_SUBMITTED
APPLICATION_APPROVED
APPLICATION_DECLINED
```

```text
PIPELINE_STAGE_MUTATION=NO
AUTOMATIC_TASK_CREATION=NO
AUTOMATIC_CONTACT=NO
AUTOMATIC_POLICY_CREATION=NO
```

## Quote and Policy lineage

```text
QUOTE_TO_APPLICATION=
  quoteReference
  quoteVersionReference
  prospectReference
  productReference
  sourceEvidenceReferences

APPLICATION_TO_POLICY=NOT_ESTABLISHED_BY_CRS_06
APPLICATION_TO_POLICY_LINEAGE=CRS_07
```

`APPROVED` is an Application decision, not evidence that an insurer issued a Policy. CRS 07 must require a separate issuance source before creating or confirming Policy lineage.

## Deployment boundary

This pass creates the repository authority, migration, service and deterministic acceptance. It does not mutate remote Supabase because no explicit remote schema-deployment authorization was supplied in this stage command.

```text
REPOSITORY_MIGRATION=READY
REMOTE_MIGRATION_APPLIED=NO
REMOTE_RLS_ACCEPTED=NO
REMOTE_RPC_ACCEPTED=NO
LIVE_APPLICATION_WRITES=NO
```

The next controlled gate must deploy the migration and run authenticated cross-advisor, idempotency, signature, requirements and no-Policy acceptance before CRS 07 consumes Application lineage.

## Non-authorizations

```text
AUTOMATIC_APPLICATION_CREATION=FORBIDDEN
AUTOMATIC_SIGNATURE_REQUEST=FORBIDDEN
AUTOMATIC_SUBMISSION=FORBIDDEN
AUTOMATIC_REQUIREMENT_RESOLUTION=FORBIDDEN
AUTOMATIC_PIPELINE_STAGE_ADVANCE=FORBIDDEN
AUTOMATIC_POLICY_CREATION=FORBIDDEN
EXTERNAL_PROVIDER_MUTATION=FORBIDDEN
RAW_SIGNATURE_STORAGE=FORBIDDEN
PRODUCT_UI_MUTATION=NO
PAGES_DEPLOYMENT_REQUIRED=NO
```
