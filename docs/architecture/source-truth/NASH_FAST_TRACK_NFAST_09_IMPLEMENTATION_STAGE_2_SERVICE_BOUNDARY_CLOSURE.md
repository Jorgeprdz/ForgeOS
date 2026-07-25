# NASH Fast Track — NFAST-09 Implementation Stage 2 Service Boundary Closure

## Status

- `STAGE_ID=NFAST-09_IMPLEMENTATION_STAGE_2_SERVICE_BOUNDARY`
- `STATUS=COMPLETE_AND_PUSHED`
- `SERVICE_VERSION=NFAST-09.2`
- `PROJECTION_CONTRACT_VERSION=NFAST-09.1`
- `IMPLEMENTATION_SCOPE=GOVERNED_TIMELINE_READ_TO_PROJECTION_COMPOSITION`
- `PRODUCTIVE_RUNTIME_INTEGRATION=NO`
- `SUPABASE_DIRECT_ACCESS=NO`
- `SCHEMA_CHANGE=NO`
- `RLS_CHANGE=NO`
- `DEPLOYMENT=NO`
- `MAIN_MERGE=NO`
- `NFAST_10_AUTHORIZED=NO`

## Implemented boundary

Stage 2 introduces a narrow service that composes:

```text
NFAST-08 governed Timeline service listProspectTimeline
→ NFAST-09.1 deterministic projection contract
→ governed CONVERSATION_CONTEXT projection result
```

The service receives an already-created governed Timeline service as a
dependency. It does not instantiate a database client and performs no
direct table or RPC operation.

## Read behavior

The service:

- requires an opaque prospect reference;
- requires an explicit deterministic `asOf`;
- accepts only governed projection options;
- caps Timeline reads at 100 events;
- optionally accepts a validated temporal cursor;
- delegates only to `listProspectTimeline`;
- passes the returned commercial Timeline events to the NFAST-09.1
  projection contract;
- preserves `SUCCESS`, `NO_PROJECTION`, `BLOCKED_CONTEXT`, and
  `INVALID_INPUT` projection decisions;
- returns immutable output;
- mutates neither options nor Timeline events;
- maps Timeline errors to a narrow service vocabulary without exposing
  internal database messages.

## Authority restrictions

- `GOVERNED_TIMELINE_READ_ALLOWED=YES`
- `DIRECT_DATABASE_ACCESS_ALLOWED=NO`
- `DIRECT_NETWORK_ACCESS_ALLOWED=NO`
- `NETWORK_ACCESS_DELEGATED_TO_TIMELINE_SERVICE=YES`
- `TIMELINE_APPEND_ALLOWED=NO`
- `TIMELINE_UPDATE_ALLOWED=NO`
- `TIMELINE_DELETE_ALLOWED=NO`
- `PIPELINE_MUTATION_ALLOWED=NO`
- `PERSISTENT_PROJECTION_TABLE=NO`
- `PROJECTION_PERSISTENCE_ALLOWED=NO`
- `PROVIDER_INVOCATION_ALLOWED=NO`
- `DRAFT_GENERATION_ALLOWED=NO`
- `MESSAGE_GENERATION_ALLOWED=NO`

## Stage 2 files

```text
nash/conversation-brief/nash-timeline-to-conversation-brief-projection-service.js
nash/tests/nfast-09-timeline-to-conversation-brief-projection-service-test.js
docs/architecture/source-truth/NASH_FAST_TRACK_NFAST_09_IMPLEMENTATION_STAGE_2_SERVICE_BOUNDARY_CLOSURE.md
```

## Validation

The Stage 2 test suite proves:

- governed Timeline read and projection composition;
- dependency enforcement;
- validation before any Timeline read;
- empty Timeline preservation;
- blocked projection preservation;
- sanitized Timeline error mapping;
- input non-mutation and immutable output;
- deterministic repeated projection;
- read-only public API;
- absence of direct database, provider, or write authority;
- invalid limit and cursor rejection.

Regression validation includes:

- NFAST-09 Stage 1 projection contract;
- NFAST-04 deterministic Conversation Brief;
- NFAST-08 Timeline contract;
- NFAST-08 Timeline service;
- NFAST-08 migration security.

## Runtime reachability

The Stage 2 service is not imported into productive runtime code by this
stage.

- `PRODUCTIVE_RUNTIME_REACHABILITY=NO`
- `UI_INTEGRATION=NO`
- `EDGE_FUNCTION_INTEGRATION=NO`
- `PROVIDER_INTEGRATION=NO`

## Explicit non-authorizations

Stage 2 does not authorize or implement:

- UI rendering;
- automatic projection execution;
- projection persistence or caching;
- provider invocation;
- draft or message generation;
- sending;
- Edge Functions;
- schema or RLS changes;
- deployment;
- merge to `main`;
- NFAST-10.

## Next gate

- `NEXT_STAGE=NFAST-09_IMPLEMENTATION_STAGE_3_PRODUCTIVE_RUNTIME_INTEGRATION_GATE`
- `NEXT_STAGE_STATUS=SEPARATE_AUTHORIZATION_REQUIRED`
- `NFAST_09_DEPLOYMENT_AUTHORIZED=NO`
