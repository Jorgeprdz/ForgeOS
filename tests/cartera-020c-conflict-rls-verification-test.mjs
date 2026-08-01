import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const sql = readFileSync(
  new URL('../scripts/ci/cartera-020c-remote-acceptance.sql', import.meta.url),
  'utf8',
);

test('conflict persistence is verified as the owning advisor under forced RLS', () => {
  assert.match(sql, /grant select on public\.cartera020c_confirmation_conflicts to authenticated/);
  assert.match(sql, /set_config\('request\.jwt\.claim\.sub', user_a::text, true\)/);
  assert.match(sql, /set local role authenticated/);
  assert.match(sql, /conflict_reference = conflict_status ->> 'conflictReference'/);
  assert.match(sql, /revoke select on public\.cartera020c_confirmation_conflicts from authenticated/);
});

test('temporary conflict read authority is rollback-only and cannot become product authority', () => {
  assert.match(sql, /^begin;/m);
  assert.match(sql, /rollback;\s*$/);
  const grantIndex = sql.indexOf('grant select on public.cartera020c_confirmation_conflicts to authenticated');
  const revokeIndex = sql.indexOf('revoke select on public.cartera020c_confirmation_conflicts from authenticated');
  assert.ok(grantIndex >= 0 && revokeIndex > grantIndex);
  assert.doesNotMatch(sql, /grant (insert|update|delete) on public\.cartera020c_confirmation_conflicts/i);
});
