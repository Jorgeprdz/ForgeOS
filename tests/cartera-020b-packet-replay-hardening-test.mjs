import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const path = new URL('../supabase/migrations/20260731000227_cartera020b_packet_replay_hardening.sql', import.meta.url);

const sql = await readFile(path, 'utf8');

test('packet replay hardening is additive and installs one before-insert guard', () => {
  assert.match(sql, /create or replace function public\.forge_cartera020b_guard_packet_insert_replay\(\)/);
  assert.match(sql, /before insert on public\.cartera020b_policy_evidence_packets/);
  assert.match(sql, /return null;/);
  assert.match(sql, /CARTERA020B_PACKET_CHANGED_REPLAY/);
});

test('only a completely identical non-truth pending packet may be skipped', () => {
  for (const field of [
    'packet_reference',
    'inbox_item_id',
    'document_type',
    'extracted_fields',
    'extraction_confidence',
    'warnings',
    'identity_candidates',
    'policy_role_candidates',
    'existing_policy_candidates',
    'confirmation_state',
    'creates_truth',
  ]) {
    assert.match(sql, new RegExp(field));
  }
  assert.match(sql, /PENDING_CONFIRMATION/);
  assert.match(sql, /new\.creates_truth is distinct from false/);
});

test('hardening does not create canonical truth or broaden authenticated authority', () => {
  const lower = sql.toLowerCase();
  for (const forbidden of [
    'insert into public.commercial_people',
    'insert into public.canonical_policies',
    'insert into public.policy_roles',
    'grant execute on function public.forge_cartera020b_guard_packet_insert_replay',
  ]) {
    assert.equal(lower.includes(forbidden), false, `forbidden packet hardening effect: ${forbidden}`);
  }
  assert.match(sql, /revoke all on function public\.forge_cartera020b_guard_packet_insert_replay\(\)/);
});
