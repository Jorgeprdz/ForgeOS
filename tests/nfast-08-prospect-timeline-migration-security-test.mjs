import assert from "node:assert/strict";
import fs from "node:fs";

const migrationPath =
  "supabase/migrations/20260724000100_nfast08_prospect_timeline_governance.sql";
const sql = fs.readFileSync(
  migrationPath,
  "utf8",
);

for (const fragment of [
  "create table if not exists public.prospect_timeline_events",
  "prospect_timeline_events_prospect_owner_fk",
  "prospect_timeline_events_idempotency_uq",
  "forge_nfast08_validate_timeline_payload",
  "forge_nfast08_validate_evidence_references",
  "forge_nfast08_timeline_append_only_guard",
  "forge_nfast08_append_prospect_timeline_event",
  "forge_nfast08_capture_pipeline_timeline",
  "alter table public.prospect_timeline_events",
  "enable row level security",
  "prospect_timeline_events_select_own",
  "using (advisor_id = auth.uid())",
  "security definer",
  "prospect_commercial_timeline",
  "security_invoker = true",
  "ADVISOR_PRIVATE_MINIMIZED",
  "NO_AUTOMATIC_DELETION_PENDING_POLICY",
  "NFAST-08.1",
  "PROSPECT_CREATED",
  "STAGE_CHANGED",
  "PROSPECT_ARCHIVED",
  "CONTACT_ATTEMPTED",
  "CONVERSATION_RECORDED",
  "OBJECTION_RECORDED",
  "FOLLOW_UP_PLANNED",
  "DECISION_RECORDED",
]) {
  assert.ok(
    sql.includes(fragment),
    `missing ${fragment}`,
  );
}

assert.match(
  sql,
  /revoke all\s+on table public\.prospect_timeline_events\s+from public, anon, authenticated/i,
);

assert.match(
  sql,
  /grant select\s+on table public\.prospect_timeline_events\s+to authenticated/i,
);

assert.doesNotMatch(
  sql,
  /grant\s+(insert|update|delete)[^;]*prospect_timeline_events/i,
);

assert.doesNotMatch(
  sql,
  /using\s*\(\s*true\s*\)|with check\s*\(\s*true\s*\)/i,
);

assert.doesNotMatch(
  sql,
  /insert\s+into\s+public\.prospect_timeline_events[\s\S]{0,300}from\s+public\.prospect_audit_events/i,
);

assert.doesNotMatch(
  sql,
  /select[\s\S]{0,200}(before_state|after_state)[\s\S]{0,200}prospect_timeline_events/i,
);

for (const prohibitedPersistence of [
  "MESSAGE_DRAFTED",
  "DRAFT_APPROVED",
  "PROMPT_PERSISTED",
  "conversationBrief jsonb",
  "draftText text",
  "rawText text",
  "transcript text",
]) {
  assert.equal(
    sql.includes(prohibitedPersistence),
    false,
    prohibitedPersistence,
  );
}

assert.match(
  sql,
  /comment on table public\.prospect_audit_events is[\s\S]*Technical audit evidence only/i,
);

console.log(
  "NFAST-08 PROSPECT TIMELINE MIGRATION SECURITY: PASS",
);
