import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const PROJECT_REF = 'rmlxigxysujsuwzgoimv';
const SQL_PATH = 'scripts/ci/cartera-020b-remote-acceptance.sql';
const ARTIFACT_DIR = 'artifacts/cartera-020b-final-inbox-state-diagnostic';
const REPORT_PATH = `${ARTIFACT_DIR}/report.json`;
const AUTHORIZATION = 'YES:CARTERA_020B_REMOTE_MUTATION';

assert.equal(process.env.SUPABASE_PROJECT_REF, PROJECT_REF, 'SUPABASE_PROJECT_REF_MISMATCH');
assert.equal(process.env.CARTERA_020B_REMOTE_MUTATION_AUTHORIZED, AUTHORIZATION, 'DIAGNOSTIC_NOT_AUTHORIZED');
assert.ok(process.env.SUPABASE_ACCESS_TOKEN, 'SUPABASE_ACCESS_TOKEN_MISSING');

const endpoint = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;
const original = readFileSync(SQL_PATH, 'utf8');
const target = `  select count(*) into row_count
  from public.cartera020b_evidence_inbox_items
  where advisor_id = user_a and inbox_reference = inbox_a
    and status = 'confirmation_required' and worker_state = 'COMPLETED'
    and lease_owner is null and lease_token is null and lease_expires_at is null;
  if row_count <> 1 then raise exception 'CARTERA020B_FINAL_INBOX_STATE_INVALID'; end if;`;
const replacement = `  select jsonb_build_object(
    'advisorId', i.advisor_id,
    'inboxReference', i.inbox_reference,
    'status', i.status,
    'workerState', i.worker_state,
    'leaseOwner', i.lease_owner,
    'leaseToken', i.lease_token,
    'leaseExpiresAt', i.lease_expires_at,
    'stateVersion', i.state_version,
    'retryCount', i.retry_count,
    'nextRetryAt', i.next_retry_at,
    'lastErrorCode', i.last_error_code,
    'blockedReason', i.blocked_reason
  ) into response
  from public.cartera020b_evidence_inbox_items i
  where i.advisor_id = user_a and i.inbox_reference = inbox_a
  limit 1;
  raise exception 'CARTERA020B_FINAL_INBOX_DIAGNOSTIC:%', coalesce(response::text, 'NULL');`;

assert.equal(original.includes(target), true, 'FINAL_STATE_ASSERTION_SOURCE_NOT_FOUND');
const diagnosticSql = original.replace(target, replacement);
assert.equal(diagnosticSql.includes(replacement), true, 'FINAL_STATE_ASSERTION_NOT_REPLACED');
assert.match(diagnosticSql, /^begin;/m);
assert.match(diagnosticSql, /rollback;\s*$/i);

const response = await fetch(endpoint, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query: diagnosticSql }),
});
const text = await response.text();
let body;
try {
  body = JSON.parse(text);
} catch {
  body = { message: text };
}
const detail = String(body?.message ?? body?.error ?? text).slice(0, 5000);
const marker = 'CARTERA020B_FINAL_INBOX_DIAGNOSTIC:';
assert.equal(detail.includes(marker), true, `EXPECTED_FINAL_STATE_DIAGNOSTIC_MISSING:${detail}`);
const stateText = detail.split(marker)[1].split('\n')[0].trim();
let state;
if (stateText === 'NULL') {
  state = null;
} else {
  state = JSON.parse(stateText);
}

const report = {
  phase: 'CARTERA_020B_FINAL_INBOX_STATE_DIAGNOSTIC',
  mode: 'TRANSACTIONAL_ROLLBACK',
  projectRef: PROJECT_REF,
  httpStatus: response.status,
  state,
};
mkdirSync(ARTIFACT_DIR, { recursive: true });
writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

console.log('CARTERA_020B_FINAL_INBOX_STATE_DIAGNOSTIC=PASS');
console.log('MODE=TRANSACTIONAL_ROLLBACK');
console.log(`FINAL_INBOX_STATE=${JSON.stringify(state)}`);
console.log(`REPORT=${REPORT_PATH}`);
