import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migration = await readFile(
  new URL('../supabase/migrations/20260731000229_cartera020b_json_null_payload_hardening.sql', import.meta.url),
  'utf8',
);

test('00229 normalizes only optional JSON payloads', () => {
  assert.match(migration, /attempt := nullif\(result -> ''attempt'', ''null''::jsonb\)/);
  assert.match(migration, /candidate := nullif\(result -> ''candidate'', ''null''::jsonb\)/);
  assert.match(migration, /packet := nullif\(result -> ''packet'', ''null''::jsonb\)/);
  assert.match(migration, /pg_get_functiondef/);
  assert.match(migration, /JSON_NULL_PATCH_SOURCE_NOT_FOUND/);
  assert.doesNotMatch(migration, /create table/i);
  assert.doesNotMatch(migration, /alter table/i);
});

test('00229 preserves RPC authority and non-truth boundary', () => {
  const lower = migration.toLowerCase();
  assert.equal(lower.includes('insert into public.canonical_policies'), false);
  assert.equal(lower.includes('insert into public.commercial_people'), false);
  assert.equal(lower.includes('insert into public.policy_roles'), false);
  assert.match(migration, /revoke all on function public\.forge_cartera020b_record_processing_result/);
  assert.match(migration, /grant execute on function public\.forge_cartera020b_record_processing_result/);
});

test('JSON null hardening remains repository-owned without remote runner authority', () => {
  assert.doesNotMatch(migration, /api\.supabase\.com|SUPABASE_ACCESS_TOKEN|database\/query/i);
});
