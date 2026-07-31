import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';

const PROJECT_REF = 'rmlxigxysujsuwzgoimv';
const ARTIFACT_DIR = 'artifacts/cartera-020b-attempt-contract-diagnostic';
const REPORT_PATH = `${ARTIFACT_DIR}/report.json`;

assert.equal(process.env.SUPABASE_PROJECT_REF, PROJECT_REF, 'SUPABASE_PROJECT_REF_MISMATCH');
assert.ok(process.env.SUPABASE_ACCESS_TOKEN, 'SUPABASE_ACCESS_TOKEN_MISSING');

const endpoint = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;
const digest = createHash('sha256').update('cartera020b-attempt-diagnostic').digest('hex');

async function query(sql) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });
  const text = await response.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = { message: 'NON_JSON_RESPONSE' };
  }
  if (!response.ok || body?.error) {
    throw new Error(`READ_ONLY_ATTEMPT_DIAGNOSTIC_HTTP_${response.status}:${String(body?.message ?? body?.error).slice(0, 1500)}`);
  }
  if (Array.isArray(body?.result)) return body.result;
  if (Array.isArray(body)) return body;
  return [];
}

const sql = `with sample as (
  select jsonb_build_object(
    'attemptReference','CARTERA020B_DIAGNOSTIC:ATTEMPT',
    'provider','LOCAL_PDFTOTEXT',
    'providerVersion','1.0.0',
    'method','PDFTOTEXT',
    'status','COMPLETE',
    'sourceDigest','${digest}',
    'pageCount',2,
    'textAvailable',true,
    'textDigest','${digest}',
    'outputReference','acceptance/output/diagnostic',
    'warnings','[]'::jsonb,
    'errors','[]'::jsonb,
    'startedAt',clock_timestamp() - interval '150 seconds',
    'completedAt',clock_timestamp() - interval '140 seconds',
    'createsTruth',false
  ) as attempt
), allowed as (
  select array[
    'attemptReference','provider','providerVersion','method','status','sourceDigest',
    'pageCount','textAvailable','textDigest','outputReference','warnings','errors',
    'startedAt','completedAt','createsTruth'
  ]::text[] as keys
)
select
  public.forge_cartera020b_jsonb_keys_allowed(sample.attempt, allowed.keys) as helper_result,
  jsonb_typeof(sample.attempt) as value_type,
  sample.attempt ->> 'createsTruth' as creates_truth_text,
  (sample.attempt ->> 'createsTruth')::boolean as creates_truth_boolean,
  array(
    select key
    from jsonb_object_keys(sample.attempt) key
    where not (key = any(allowed.keys))
    order by key
  ) as rejected_keys,
  array(select key from jsonb_object_keys(sample.attempt) key order by key) as supplied_keys,
  allowed.keys as allowed_keys,
  pg_get_functiondef('public.forge_cartera020b_jsonb_keys_allowed(jsonb,text[])'::regprocedure) as helper_definition
from sample cross join allowed;`;

const rows = await query(sql);
assert.equal(rows.length, 1, 'ATTEMPT_DIAGNOSTIC_ROW_MISSING');
const report = {
  phase: 'CARTERA_020B_ATTEMPT_CONTRACT_DIAGNOSTIC',
  mode: 'READ_ONLY',
  projectRef: PROJECT_REF,
  result: rows[0],
};
mkdirSync(ARTIFACT_DIR, { recursive: true });
writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

console.log('CARTERA_020B_ATTEMPT_CONTRACT_DIAGNOSTIC=PASS');
console.log('MODE=READ_ONLY');
console.log(`HELPER_RESULT=${rows[0].helper_result}`);
console.log(`CREATES_TRUTH_TEXT=${rows[0].creates_truth_text}`);
console.log(`CREATES_TRUTH_BOOLEAN=${rows[0].creates_truth_boolean}`);
console.log(`REJECTED_KEYS=${JSON.stringify(rows[0].rejected_keys ?? [])}`);
console.log(`SUPPLIED_KEYS=${JSON.stringify(rows[0].supplied_keys ?? [])}`);
console.log(`REPORT=${REPORT_PATH}`);
