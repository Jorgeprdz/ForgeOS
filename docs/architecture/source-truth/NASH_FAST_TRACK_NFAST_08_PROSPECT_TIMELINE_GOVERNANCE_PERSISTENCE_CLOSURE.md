# NASH Fast Track — NFAST-08 Prospect Timeline Governance and Persistence Closure

## Status

- `STAGE_ID=NFAST-08_PROSPECT_TIMELINE_GOVERNANCE_AND_PERSISTENCE`
- `STATUS=COMPLETE_IN_REPOSITORY`
- `CONTRACT_VERSION=NFAST-08.1`
- `SOURCE_COMMIT=b6067f5914fcb2f6449a2aee9468a31f5cf0db4b`
- `DEPLOYMENT_AUTHORIZED=NO`
- `NFAST_09_AUTHORIZED=NO`

## Implemented authority split

Two different records now have explicit, non-overlapping purposes:

```text
prospect_audit_events
→ technical mutation audit
→ complete before/after snapshots
→ not a commercial Timeline
→ not a NASH projection source

prospect_timeline_events
→ minimized commercial Timeline
→ structured event vocabulary
→ source and evidence references
→ advisor-private, append-only
```

The existing audit table was not renamed, copied, backfilled, deleted, or
modified into a different authority.

## Canonical event vocabulary

System-generated Pipeline events:

- `PROSPECT_CREATED`
- `STAGE_CHANGED`
- `PROSPECT_ARCHIVED`

Governed advisor events:

- `CONTACT_ATTEMPTED`
- `CONVERSATION_RECORDED`
- `APPOINTMENT_SCHEDULED`
- `APPOINTMENT_RESCHEDULED`
- `APPOINTMENT_COMPLETED`
- `OBJECTION_RECORDED`
- `FOLLOW_UP_PLANNED`
- `PROPOSAL_PRESENTED`
- `DECISION_RECORDED`

There is no Timeline event for message generation, draft approval,
provider invocation, prompt persistence, or automatic sending.

## Persistence boundary

The table is append-only. Authenticated users receive select permission
only. Advisor-originated writes go through
`forge_nfast08_append_prospect_timeline_event`, which derives ownership
from `auth.uid()` and validates:

- prospect ownership;
- advisor-appendable event type;
- occurred-at timestamp;
- opaque source reference;
- flat event-specific payload;
- opaque evidence references;
- idempotency.

Pipeline lifecycle events are written by a separate security-definer
trigger and contain only minimized state transition data.

## Privacy and retention

- `PRIVACY_CLASSIFICATION=ADVISOR_PRIVATE_MINIMIZED`
- `RAW_NOTES_PERSISTED=NO`
- `DRAFTS_PERSISTED=NO`
- `PROMPTS_PERSISTED=NO`
- `CONVERSATION_BRIEF_PERSISTED=NO`
- `CONTACT_ROUTING_PERSISTED=NO`
- `SENSITIVE_PROFILE_DATA_PERSISTED=NO`
- `AUDIT_SNAPSHOT_BACKFILL=NO`
- `AUTOMATIC_DELETION=NO`
- `RETENTION_POLICY=NO_AUTOMATIC_DELETION_PENDING_POLICY`

A legal or operational retention duration is not invented by this stage.
Any future retention deletion requires a separate policy and migration.

## Service boundary

`prospect-timeline-service.js` exposes only:

- `listProspectTimeline`
- `appendProspectTimelineEvent`

It exposes no update or delete method and performs no direct insert.

## Explicit non-authorizations

NFAST-08 does not:

- deploy or apply the migration;
- merge into `main`;
- render Timeline UI;
- project Timeline events into a Conversation Brief;
- make Timeline data an automatic NASH fact;
- persist drafts, approvals, messages, or provider output;
- authorize NFAST-09 or later stages.

## Next gate

- `NEXT_STAGE=NFAST-08_DEPLOYMENT_AND_REMOTE_RLS_ACCEPTANCE`
- `NEXT_STAGE_STATUS=NOT_AUTHORIZED`
- `NFAST_09_TIMELINE_TO_BRIEF_STATUS=BLOCKED_PENDING_DEPLOYMENT_ACCEPTANCE`
