import assert from 'node:assert/strict';
import fs from 'node:fs';

const sql = fs.readFileSync('supabase/migrations/20260718000100_067g17b_productive_prospect_crud.sql','utf8');
const deleteRepair = fs.readFileSync('supabase/migrations/20260718000200_067g17b_remove_legacy_prospect_delete.sql','utf8');
for (const fragment of [
  'alter table public.prospect_audit_events enable row level security',
  'advisor_id is distinct from auth.uid()',
  'OWNERSHIP_TRANSFER_DENIED',
  'revoke delete on public.prospects from authenticated',
  'prospect_audit_events_select_own',
  'prospects_own_active_phone_uq','prospects_own_active_whatsapp_uq','prospects_own_active_email_uq',
  "new.status := 'referred_new'",
  "'prospect_created','prospect_updated','prospect_archived'"
]) assert.ok(sql.includes(fragment), `missing ${fragment}`);
assert.doesNotMatch(sql, /using\s*\(\s*true\s*\)|with check\s*\(\s*true\s*\)/i);
assert.doesNotMatch(sql, /drop\s+table|delete\s+from\s+public\.prospects/i);
assert.match(sql, /revoke all on public\.prospect_audit_events from anon, authenticated/);
assert.doesNotMatch(sql, /grant\s+(insert|update|delete)[^;]*prospect_audit_events/i);
assert.match(deleteRepair,/drop policy if exists "prospects_delete_own_rows"/i);
assert.match(deleteRepair,/revoke delete on table public\.prospects from authenticated/i);
console.log('067G17B PROSPECT MIGRATION SECURITY: PASS');
