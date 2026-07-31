import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';

const PATH = 'scripts/ci/cartera-020b-remote-acceptance.sql';
const source = readFileSync(PATH, 'utf8');
const target = `  select count(*) into row_count
  from public.cartera020b_evidence_inbox_items
  where advisor_id = user_a and inbox_reference = inbox_a
    and status = 'confirmation_required' and worker_state = 'COMPLETED'
    and lease_owner is null and lease_token is null and lease_expires_at is null;
  if row_count <> 1 then raise exception 'CARTERA020B_FINAL_INBOX_STATE_INVALID'; end if;`;
const replacement = `  select count(*) into row_count
  from public.cartera020b_evidence_inbox_items i
  where i.advisor_id = user_a and i.inbox_reference = inbox_a
    and i.status = 'confirmation_required' and i.worker_state = 'COMPLETED'
    and i.lease_owner is null and i.lease_token is null and i.lease_expires_at is null;
  if row_count <> 1 then raise exception 'CARTERA020B_FINAL_INBOX_STATE_INVALID'; end if;`;

assert.equal(source.includes(target), true, 'UNQUALIFIED_FINAL_INBOX_ASSERTION_NOT_FOUND');
const compiled = source.replace(target, replacement);
assert.equal(compiled.includes(replacement), true, 'QUALIFIED_FINAL_INBOX_ASSERTION_NOT_EMITTED');
assert.equal(compiled.includes(target), false, 'UNQUALIFIED_FINAL_INBOX_ASSERTION_REMAINED');
assert.match(compiled, /^begin;/m);
assert.match(compiled, /rollback;\s*$/i);
writeFileSync(PATH, compiled, 'utf8');
console.log('CARTERA020B_ACCEPTANCE_COLUMN_QUALIFICATION=PASS');
