# Forge CRS 05 — Quote Person Convergence 001

## Status

```text
STATUS=IMPLEMENTED_PENDING_PR_ACCEPTANCE
RECORDED=2026-08-01
SOURCE_MAIN_HEAD=d55560d7246abe5b801bc76cb5a2efa8a797792b
DELIVERY_MODE=ONE_BRANCH_ONE_PR_ONE_UNIFIED_PASS
```

## Governing result

CRS 05 converges the existing productive Quote lifecycle with the existing `CommercialPerson` authority and the CRS 02 reference envelope.

```text
QUOTE_AUTHORITY=QUOTE_PERSISTENCE_AUTHORITY
QUOTE_LIFECYCLE_AUTHORITY=CARTERA_001B_QUOTE_LIFECYCLE_AUTHORITY
QUOTE_VERSION_AUTHORITY=CARTERA_001B_QUOTE_VERSION_AUTHORITY
PERSON_AUTHORITY=CARTERA_010B_COMMERCIAL_PERSON
SOURCE_IDENTITY_LINK_AUTHORITY=CARTERA_010B_SOURCE_IDENTITY_LINKS
DOMAIN_LINK_CONTRACT=CRS_02
QUOTE_TO_CARTERA_HANDOFF=EXISTING_ACCEPTED_QUOTE_CARTERA_RELATIONSHIP
```

The productive persistence already exists:

```text
quote_lifecycle_quotes
quote_lifecycle_versions
quote_lifecycle_events
forge_cartera001b_confirm_reviewed_quote
forge_cartera001b_append_quote_lifecycle_event
```

CRS 05 does not replace those tables, RPCs, contracts or browser bridge.

## CRS 05A — Scope and discovery

Existing authorities confirmed:

- Quote and current lifecycle state;
- append-only Quote Version snapshots;
- append-only lifecycle events;
- human-confirmed presentation, acceptance and rejection;
- governed correction lineage;
- minimized Prospect Timeline projection;
- durable browser persistence bridge;
- accepted Quote→Cartera relationship contract;
- printable/PDF artifact production;
- accepted product calculation authorities, including SeguBeca.

The real missing capability was a shared, product-neutral read snapshot binding those records to the canonical person.

## CRS 05B — Shared contract

```text
CONTRACT=platform/shared-commercial-model/crs-05-quote-person-convergence-contract.js
CONTRACT_TYPE=FORGE_QUOTE_PERSON_CONVERGENCE
CONTRACT_VERSION=CRS-05-QUOTE-PERSON-001.1
SCHEMA_VERSION=forge.quote_person_convergence.v1
```

The contract composes only:

```text
QUOTE_REFERENCE
QUOTE_VERSION_REFERENCE
PROSPECT_REFERENCE
PRODUCT_REFERENCE
LIFECYCLE_EVENT_REFERENCE
COMMERCIAL_PERSON_REFERENCE_OR_EXPLICIT_MISSING_LINK
SOURCE_IDENTITY_LINK_AND_DECISION_LINEAGE
CRS_02_DOMAIN_LINK
PRINTABLE_ARTIFACT_REFERENCE_OPTIONAL
CALCULATION_AUTHORITY_REFERENCE_OPTIONAL
ACCEPTED_QUOTE_CARTERA_RELATIONSHIP_OPTIONAL
```

It does not copy:

```text
PREMIUM
SUM_ASSURED
COVERAGE_TABLES
DEDUCTIBLE
COINSURANCE
UDI_TABLES
PROJECTED_VALUES
NATIVE_RESULT
PRODUCT_INTELLIGENCE_PAYLOAD
PDF_BYTES
RAW_PDF
```

## CRS 05C — Productive read service

```text
SERVICE=platform/event-evidence/crs-05-quote-person-convergence-service.js
```

Productive operations:

```text
getConvergedQuote
listConvergedQuotesForProspect
listQuoteVersions
createCommercialMovementView
convergeAcceptedQuoteCarteraRelationship
convergeCanonicalLifecycleEvent
```

The service reads through the authenticated Supabase client and RLS. It does not execute Quote RPCs or direct writes.

Identity behavior:

```text
ZERO_ACTIVE_IDENTITY_LINKS=UNRESOLVED_MISSING_LINK
ONE_ACTIVE_IDENTITY_LINK=VERIFY_PERSON_AND_DECISION_LINEAGE
MULTIPLE_ACTIVE_IDENTITY_LINKS=FAIL_CLOSED
CROSS_ADVISOR_PERSON=FAIL_CLOSED
ARCHIVED_OR_UNCONFIRMED_PERSON=FAIL_CLOSED
```

## Quote Version semantics

Each convergence snapshot identifies one current durable Quote Version. Version history is exposed as minimized references:

```text
quoteVersionReference
versionNumber
snapshotDigest
confirmationState
createdAt
```

The historical `review_snapshot` remains under Quote authority and is not copied into the shared person spine.

Multiple Quotes and multiple versions for one person are valid.

## Product neutrality

```text
SEGUBECA=SUPPORTED_BY_COMMON_QUOTE_CONTRACT
VIDA_MUJER=SUPPORTED_BY_COMMON_QUOTE_CONTRACT
ORVI=SUPPORTED_BY_COMMON_QUOTE_CONTRACT
IMAGINA_SER=SUPPORTED_BY_COMMON_QUOTE_CONTRACT
FUTURE_PRODUCTS=SUPPORTED_BY_COMMON_QUOTE_CONTRACT
```

SeguBeca keeps its accepted split authority:

```text
CONTRACTUAL_PRODUCT_VALUES=SOLUCIONLINE_SOURCE_DOCUMENT
ACCEPTED_CALCULATION=SEGUBECA_ACCEPTED_PRODUCT_CALCULATION
UDI_MXN_PROJECTION=FORGE_UDI_MXN_RUNTIME
CRS_05_COPIES_SEGUBECA_NUMERIC_TRUTH=NO
```

No product receives a private identity adapter or private Cartera adapter.

## PDF boundary

The printable document is connected only by an opaque artifact reference.

```text
PRINTABLE_ARTIFACT_REFERENCE_ALLOWED=YES
PDF_BYTES_IN_CONVERGENCE=FORBIDDEN
RAW_PDF_IN_CONVERGENCE=FORBIDDEN
AUTOMATIC_DOWNLOAD=FORBIDDEN
```

## Acceptance, Application and Policy boundaries

```text
QUOTE_PROSPECT_ACCEPTED_IS_APPLICATION=NO
QUOTE_PROSPECT_ACCEPTED_IS_POLICY=NO
QUOTE_PRESENTED_IS_APPLICATION=NO
QUOTE_REJECTED_IS_APPLICATION=NO
```

A conversion event is valid only when an independent Application authority has already issued an `application_reference`.

```text
QUOTE_CONVERTED_TO_APPLICATION_REQUIRES_APPLICATION_REFERENCE=YES
QUOTE_CREATES_APPLICATION_AUTOMATICALLY=NO
QUOTE_CREATES_POLICY_AUTOMATICALLY=NO
QUOTE_ADVANCES_PIPELINE_AUTOMATICALLY=NO
```

CRS 06 remains the authority stage for Application and signature.

## Correlation and correction

The historical Quote lifecycle `correlation_id` remains the Prospect reference required by CARTERA-001B. CRS 05 never reinterprets it as a commercial movement.

```text
LEGACY_QUOTE_CORRELATION_REINTERPRETED_AS_COMMERCIAL_MOVEMENT=NO
COMMERCIAL_MOVEMENT=EXPLICIT_AND_CRS_02_DERIVED
MOVEMENT_REQUIRES_CONFIRMED_PERSON=YES
QUOTE_EVENT_CORRECTION=APPEND_ONLY
DOMAIN_LINK_CORRECTION=APPEND_ONLY
```

## Non-authorizations

```text
NEW_QUOTE_TABLE=NO
NEW_QUOTE_VERSION_TABLE=NO
NEW_QUOTE_EVENT_LEDGER=NO
NEW_COMMERCIAL_PERSON_TABLE=NO
NEW_IDENTITY_ENGINE=NO
NEW_SOURCE_IDENTITY_LINK_TABLE=NO
PRODUCT_SPECIFIC_IDENTITY_ADAPTER=NO
PRODUCT_SPECIFIC_CARTERA_ADAPTER=NO
DATABASE_MIGRATION=NO
SUPABASE_MUTATION=NO
PRODUCT_UI_MUTATION=NO
QUOTE_MUTATION=NO
APPLICATION_MUTATION=NO
POLICY_MUTATION=NO
PIPELINE_MUTATION=NO
AUTOMATIC_IDENTITY_RESOLUTION=NO
AUTOMATIC_APPLICATION_CREATION=NO
AUTOMATIC_POLICY_CREATION=NO
AUTOMATIC_DOWNLOAD=NO
AUTOMATIC_BUSINESS_ACTION=NO
```

## Next

```text
NEXT_AFTER_CLOSURE=CRS_06ABCD_APPLICATION_AND_SIGNATURE_AUTHORITY
```