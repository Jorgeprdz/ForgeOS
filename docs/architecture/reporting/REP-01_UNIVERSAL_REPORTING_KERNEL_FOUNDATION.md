# REP-01 — Universal Reporting Kernel Foundation

```text
REP_01_UNIVERSAL_REPORTING_KERNEL_FOUNDATION=IMPLEMENTED_ACCEPTED
REPORTING_BRANCH=feature/universal-reporting-kernel-foundation
SOURCE_COMMIT=b55962d189ab19058422f79480f66585f1ebceb2
SOURCE_BRANCH=feature/performance-scoring-contract-foundation
KERNEL_SCHEMA=universal-reporting-kernel.v1
AUTHORITY_SCHEMA=reporting-authority-binding.v1
PROVIDER_DESCRIPTOR_SCHEMA=report-provider-descriptor.v1
REQUEST_SCHEMA=universal-report-request.v1
PERIOD_INPUT_SCHEMA=report-period-input.v1
REPORTING_AUTHORITY=UNIVERSAL_REPORTING_KERNEL
DOMAIN_TRUTH_AUTHORITY=NO
PROVIDER_EXECUTION_AUTHORIZED=NO
PERIOD_RESOLUTION_COMPLETE=NO
PRODUCTIVE_UI_MUTATION=NO
REMOTE_DATABASE_MUTATION=NO
```

## Goal

REP-01 establishes the domain-neutral Universal Reporting Kernel shell. It
creates immutable authority, provider-registry and report-request identity
contracts without resolving periods or executing domain providers.

## Kernel capabilities

- one-time organization and principal authority binding;
- immutable provider descriptor registry;
- canonical `asOf` normalization;
- IANA time-zone validation;
- deterministic request identity and SHA-256 request key;
- normalized dimensions and measures;
- opaque period input preserved for REP-02;
- explicit execution and mutation boundaries.

## Request identity

A request contains:

```text
definitionId
providerId
providerVersion
domain
period input
timeZone
asOf
dimensions
measures
metadata
requestKey
```

`requestKey` is deterministic over canonicalized authority, provider, period,
time, requested dimensions, measures and safe metadata.

## Provider registry boundary

REP-01 registers immutable provider descriptors only. It does not define the
provider execution port. Provider validation and governed slice execution belong
to REP-03.

## Period boundary

REP-01 accepts an uppercase period identifier and JSON-safe parameters but marks
the result:

```text
resolutionStatus=PENDING_REP_02
```

It does not create `from`, `to`, calendar, fiscal or comparison semantics.
Those belong to REP-02.

## Non-goals

No domain measure ownership, provider execution, period resolution, aggregation,
comparison, export, rendering, UI component, route, database query, persistence
or remote schema mutation is introduced.

## Next

`REP-02_UNIVERSAL_PERIOD_RESOLVER_AND_CALENDAR_POLICY`
