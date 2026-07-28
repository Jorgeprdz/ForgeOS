# NASH Fast Track — NFAST-08 Prospect Timeline Stage Gate

## Authorization record

- `STAGE_ID=NFAST-08_PROSPECT_TIMELINE_GOVERNANCE_AND_PERSISTENCE`
- `AUTHORIZATION_DATE=2026-07-24`
- `AUTHORIZING_PRINCIPAL=JORGE_PALACIOS_PRODUCT_AND_REPOSITORY_OWNER`
- `DIRECT_AUTHORIZATION_PHRASE=ECHALE`
- `PRODUCT_OWNER_AUTHORIZATION=YES`
- `SEPARATE_DEPLOYMENT_AUTHORIZATION=NO`
- `MAIN_MERGE_AUTHORIZATION=NO`
- `NFAST_09_AUTHORIZATION=NO`

No claim is made that a separate named committee meeting occurred. The
repository implementation is authorized directly by the product and
repository owner. Deployment and later-stage authority remain separate.

## Applicable source authority

- `FORGE_CONSTITUTION_V3.md`
- `docs/architecture/source-truth/FORGE_NASH_PRODUCTION_CONVERSATION_ARCHITECTURE_NFAST_01.md`
- `docs/architecture/source-truth/NASH_FAST_TRACK_NFAST_07_PIPELINE_RUNTIME_INTEGRATION_CLOSURE.md`
- `supabase/migrations/20260717000100_067g17a1_prospect_opportunity_security_foundation.sql`
- `supabase/migrations/20260718000100_067g17b_productive_prospect_crud.sql`

## Accepted dependency evidence

- `NFAST_07_COMMIT=b6067f5914fcb2f6449a2aee9468a31f5cf0db4b`
- `NFAST_07_STATUS=COMPLETE_AND_PUSHED`
- `NFAST_07_DRAFT_PERSISTENCE=NO`
- `NFAST_07_PIPELINE_MUTATION_BY_PROVIDER=NO`

## Build Tree area

Allowed implementation paths:

```text
advisor-os/sales-pipeline/prospect-timeline/**
supabase/migrations/20260724000100_nfast08_*.sql
tests/nfast-08-*
docs/architecture/source-truth/NASH_FAST_TRACK_NFAST_08_*
```

## Authority decision

`prospect_audit_events` remains the technical audit authority for
low-level prospect mutations. It is not renamed, backfilled, exposed, or
promoted as the commercial Timeline.

`prospect_timeline_events` is the new commercial Timeline authority. It
stores only minimized structured events with source references and
evidence references.

## Persistence impact

- New append-only Timeline table.
- New advisor-owned read policy.
- New controlled append RPC.
- New Pipeline trigger for minimized lifecycle events.
- New security-invoker read view.
- No update or delete authority.
- No automatic retention deletion.
- No backfill from technical audit snapshots.

## Prohibited persistence

The Timeline must not persist:

- prompts or system instructions;
- Conversation Briefs or provider requests;
- AI provider responses;
- message drafts or exact approvals;
- raw notes, unrestricted context, transcripts, or conversation history;
- phone, WhatsApp, email, health, income, family, or other routing and
  sensitive fields;
- `before_state` or `after_state` audit snapshots.

## Runtime impact

The productive prospect service is not rewritten. NFAST-08 introduces a
separate Timeline contract and service boundary. UI presentation and
Timeline-to-Brief projection remain later stages.

## Validation plan

- Node contract tests.
- Service boundary tests with a Supabase mock.
- Migration/RLS static security tests.
- Regression tests for NFAST-06, NFAST-07, and existing prospect
  migration security.
- Git diff validation.
- Commit and push only after all tests pass.

## Rollback

Before deployment, rollback is branch deletion or commit revert.

After a separately authorized deployment, rollback requires a new
forward migration. No destructive down migration is generated here.

## Gate result

- `ROBOCOP_LOCK_001_FIELDS_RECORDED=YES`
- `SCHEMA_CHANGE_AUTHORIZED_FOR_REPOSITORY_IMPLEMENTATION=YES`
- `RLS_CHANGE_AUTHORIZED_FOR_REPOSITORY_IMPLEMENTATION=YES`
- `MIGRATION_FILE_AUTHORIZED=YES`
- `DEPLOYMENT_AUTHORIZED=NO`
- `NFAST_08_IMPLEMENTATION_AUTHORIZED=YES`
