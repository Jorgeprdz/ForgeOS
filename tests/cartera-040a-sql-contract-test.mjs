import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const path = new URL('../supabase/migrations/20260801000270_cartera040_relationship_memory_authority.sql', import.meta.url);

test('040A defines append-only owner-scoped relationship memory authority', async () => {
    const sql = await readFile(path, 'utf8');
    assert.match(sql, /cartera040_relationship_memory_entries/i);
    assert.match(sql, /cartera040_relationship_memory_conflicts/i);
    assert.match(sql, /cartera040_command_receipts/i);
    assert.match(sql, /forge_cartera040_record_relationship_memory/i);
    assert.match(sql, /force row level security/i);
    assert.match(sql, /forge_cartera030b_append_only_guard/i);
    assert.match(sql, /revoke all on public\.cartera040_relationship_memory_entries from anon, authenticated/i);
    assert.match(sql, /CARTERA040_AUTHORIZATION_DIGEST_MISMATCH/i);
    assert.match(sql, /CHANGED_INPUT_REPLAY/i);
});

test('040C locks sensitive life context behind evidence and confirmed consent', async () => {
    const sql = await readFile(path, 'utf8');
    assert.match(sql, /memory_kind <> 'LIFE_CONTEXT'/i);
    assert.match(sql, /sensitivity = 'SENSITIVE'/i);
    assert.match(sql, /consent_state = 'CONFIRMED'/i);
    assert.match(sql, /jsonb_array_length\(evidence_references\) >= 1/i);
    assert.match(sql, /lifeContextIsSalesTrigger', false/i);
    assert.doesNotMatch(sql, /create\s+table[^;]*(opportunity|message|contact_execution|commission|payout|bank)/i);
});
