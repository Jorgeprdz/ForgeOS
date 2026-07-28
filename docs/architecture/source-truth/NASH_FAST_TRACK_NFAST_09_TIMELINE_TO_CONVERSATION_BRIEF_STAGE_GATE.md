# NASH Fast Track — NFAST-09 Timeline to Conversation Brief Stage Gate

## Authorization record

- `STAGE_ID=NFAST-09_TIMELINE_TO_CONVERSATION_BRIEF_PROJECTION`
- `AUTHORIZATION_DATE=2026-07-24`
- `AUTHORIZATION_TIMESTAMP_UTC=2026-07-25T00:09:59Z`
- `AUTHORIZING_PRINCIPAL=JORGE_PALACIOS_PRODUCT_AND_REPOSITORY_OWNER`
- `DIRECT_AUTHORIZATION_PHRASE=ECHALE NFAST-09`
- `PRODUCT_OWNER_AUTHORIZATION=YES`
- `NFAST_09_IMPLEMENTATION_AUTHORIZED=YES`
- `NEW_BRANCH_AUTHORIZED=YES`
- `TARGET_BRANCH=feature/nfast-09-timeline-to-conversation-brief-projection`
- `DEPLOYMENT_AUTHORIZED=NO`
- `MAIN_MERGE_AUTHORIZED=NO`
- `NFAST_10_AUTHORIZED=NO`

## Source authority

- `SOURCE_BRANCH=feature/nfast-08-prospect-timeline-governance-persistence`
- `SOURCE_COMMIT=421aded612dbf229726519168ac28dd92a5d887e`
- `NFAST_08_REMOTE_ACCEPTANCE_CLOSED=YES`
- `DISCOVERY_REPORT=NFAST09_PRODUCT_AUTHORIZATION_GATE_DISCOVERY_20260725T000035Z.md`
- `DISCOVERY_REPORT_SHA256=85de96880e51bf9d42586a63a7271f25668c5825caee3d0e22fbefd6369394b3`
- `DISCOVERY_STATUS=PASS`

## Product objective

Implement a deterministic and governed projection boundary that transforms
authorized, minimized commercial Timeline events into evidence suitable
for the existing deterministic Conversation Brief boundary.

The projection must preserve provenance, unknowns, stale evidence,
conflicts, ordering, and advisor ownership. It must not turn Timeline
records into unrestricted universal context or automatic NASH facts.

## Authorized architecture

- `PROJECTION_MODE=ON_DEMAND_DETERMINISTIC`
- `PERSISTENT_PROJECTION_TABLE=NO`
- `SCHEMA_CHANGE_AUTHORIZED=NO`
- `RLS_CHANGE_AUTHORIZED=NO`
- `TIMELINE_READ_SOURCE=GOVERNED_TIMELINE_SERVICE_OR_SECURITY_INVOKER_VIEW`
- `PROJECTION_INPUT=MINIMIZED_STRUCTURED_EVENTS_ONLY`
- `PROJECTION_OUTPUT=EXISTING_CONVERSATION_BRIEF_BOUNDARY`
- `EVIDENCE_PROVENANCE_REQUIRED=YES`
- `UNKNOWN_PRESERVATION_REQUIRED=YES`
- `STALE_EVIDENCE_PRESERVATION_REQUIRED=YES`
- `CONFLICT_PRESERVATION_REQUIRED=YES`
- `DETERMINISM_REQUIRED=YES`
- `INPUT_MUTATION_ALLOWED=NO`
- `TIMELINE_MUTATION_ALLOWED=NO`
- `PIPELINE_MUTATION_ALLOWED=NO`

## Authorized event treatment

NFAST-09 may define deterministic projection rules for the NFAST-08
commercial event vocabulary:

### System lifecycle evidence

- `PROSPECT_CREATED`
- `STAGE_CHANGED`
- `PROSPECT_ARCHIVED`

System events may establish lifecycle evidence only. They may not invent
intent, sentiment, product suitability, needs, objections, or decisions.

### Advisor-declared commercial evidence

- `CONTACT_ATTEMPTED`
- `CONVERSATION_RECORDED`
- `APPOINTMENT_SCHEDULED`
- `APPOINTMENT_RESCHEDULED`
- `APPOINTMENT_COMPLETED`
- `OBJECTION_RECORDED`
- `FOLLOW_UP_PLANNED`
- `PROPOSAL_PRESENTED`
- `DECISION_RECORDED`

Advisor-declared events remain declarations with explicit provenance. They
must not be silently upgraded into verified external facts.

## Authorized implementation paths

```text
nash/conversation-brief/nash-timeline-to-conversation-brief-projection-contract.js
nash/conversation-brief/nash-timeline-to-conversation-brief-projection-service.js
nash/tests/nfast-09-*
tests/nfast-09-*
docs/architecture/source-truth/NASH_FAST_TRACK_NFAST_09_*
```

Existing files may be changed only when required to expose a narrow,
backward-compatible deterministic boundary. Broad rewrites are not
authorized.

## Required implementation behavior

The implementation must:

1. accept only the governed Timeline event shape;
2. reject raw Pipeline objects, technical audit snapshots, unrestricted
   context, raw notes, prompts, drafts, transcripts, and provider data;
3. validate prospect ownership and evidence lineage at the boundary;
4. preserve event source, source record reference, occurrence time,
   contract version, and evidence references;
5. apply deterministic ordering and deduplication;
6. represent missing, stale, contradicted, and unsupported information
   explicitly;
7. emit only fields accepted by the existing deterministic Conversation
   Brief contract;
8. generate no final message copy;
9. call no provider;
10. perform no persistence, network, database, filesystem, or action
    execution at runtime;
11. mutate no input;
12. expose no Timeline update or delete authority.

## Explicitly prohibited

NFAST-09 must not:

- persist a Conversation Brief or projection cache;
- create or alter a Supabase table, policy, function, trigger, or view;
- read `prospect_audit_events` as commercial Timeline evidence;
- copy `before_state` or `after_state`;
- persist or project raw notes, prompts, transcripts, contact routing,
  health, income, family context, or unrestricted profile data;
- invoke an AI provider;
- generate, approve, send, or schedule a message;
- mutate Pipeline or Timeline records;
- render UI;
- deploy an Edge Function;
- merge to `main`;
- authorize NFAST-10.

## Validation requirements

Before closure, the implementation must prove:

- valid deterministic projection;
- stable chronological ordering;
- deterministic deduplication;
- provenance retention;
- unknown preservation;
- stale evidence handling;
- conflict preservation;
- cross-prospect and cross-advisor rejection;
- prohibited-field rejection;
- technical-audit rejection;
- no provider call;
- no draft generation;
- no persistence;
- no network, database, or filesystem access;
- no mutation of inputs;
- no productive runtime reachability until separately integrated;
- regression safety for NFAST-04 and NFAST-08.

## Commit and push rule

After all authorized NFAST-09 tests pass:

- create a closure document;
- commit the implementation;
- push the authorized feature branch;
- do not merge to `main`;
- do not deploy;
- do not begin NFAST-10.

## Gate result

- `ROBOCOP_LOCK_001_FIELDS_RECORDED=YES`
- `TIMELINE_TO_BRIEF_PROJECTION_AUTHORIZED=YES`
- `IMPLEMENTATION_AUTHORIZED=YES`
- `SCHEMA_CHANGE_AUTHORIZED=NO`
- `RLS_CHANGE_AUTHORIZED=NO`
- `DEPLOYMENT_AUTHORIZED=NO`
- `MAIN_MERGE_AUTHORIZED=NO`
- `NFAST_10_AUTHORIZED=NO`
- `NEXT_STAGE=NFAST-09_IMPLEMENTATION`
- `NEXT_STAGE_STATUS=AUTHORIZED`
