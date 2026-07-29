# REP-03 — Report Definition and Provider Port

```text
REP_03_REPORT_DEFINITION_AND_PROVIDER_PORT=IMPLEMENTED_PENDING_ACCEPTANCE
REPORTING_BRANCH=feature/universal-reporting-kernel-foundation
SOURCE_COMMIT=cf089b95cedd776cd3bd7b4a2e93c6e4aa78b71a
DEFINITION_SCHEMA=report-definition.v1
PROVIDER_PORT_SCHEMA=report-provider-port.v1
PROVIDER_CONTRACT_SCHEMA=report-provider-contract.v1
PROVIDER_QUERY_SCHEMA=report-provider-slice-query.v1
PROVIDER_SLICE_SCHEMA=report-provider-slice.v1
PROVIDER_RUNTIME_SCHEMA=report-provider-runtime.v1
EXECUTION_PLAN_SCHEMA=report-provider-execution-plan.v1
PROVIDER_EXECUTION_AUTHORIZED=YES
PERIOD_RESOLUTION_AUTHORITY=NO
UNIVERSAL_AGGREGATION_AUTHORITY=NO
COMPARISON_AUTHORITY=NO
PRODUCTIVE_UI_MUTATION=NO
REMOTE_DATABASE_MUTATION=NO
```

## Goal

REP-03 defines the universal report definition and the governed provider port.
Domains can now declare capabilities and read one exact resolved period slice
without owning universal period semantics, aggregation or comparisons.

## Report definition

A versioned definition selects:

- one provider;
- allowed dimensions;
- allowed measures;
- default dimensions;
- default measures.

Definitions contain no labels, colors, routes, SQL, RPC names or persistence
instructions.

## Provider contract

Each provider declares:

- provider identity and version;
- domain;
- supported dimensions and their value kinds;
- supported measures, units and future aggregation semantics;
- maximum direct slice length;
- batching capability.

The canonical batching modes are:

```text
NONE
CONTIGUOUS_DATE_RANGES
```

## Provider execution

A REP-02 resolved request becomes a deterministic execution plan.

- A period within `maxSliceDays` becomes `DIRECT`.
- A longer period with batching support becomes `BATCHING_REQUIRED_REP_04`.
- A longer period without batching support is rejected.
- REP-03 executes only direct reads.
- REP-04 will own deterministic batching and universal aggregation.

## Provider slice

A provider slice contains only:

- exact resolved request identity;
- dimension and measure rows;
- exclusions;
- provenance;
- domain authority.

It contains no universal totals, comparisons, UI formatting or export content.

## Authority

Providers own domain facts and evidence. They do not own:

- period resolution;
- universal aggregation;
- comparisons;
- exports;
- UI;
- persistence mutation during reads.

## Next

`REP-04_UNIVERSAL_REPORT_MODEL_AND_AGGREGATION_RUNTIME`
