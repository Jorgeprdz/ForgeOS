import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('030B digest uses the Supabase pgcrypto extension schema explicitly', async () => {
  const sql = await readFile(new URL('../supabase/migrations/20260731000251_cartera030b_generation_and_calendar_rpc.sql', import.meta.url), 'utf8');
  assert.match(sql, /extensions\.digest\(convert_to/);
  assert.doesNotMatch(sql, /(^|[^.])\bdigest\(convert_to/m);
});
