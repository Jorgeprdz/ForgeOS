import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const helperPath = new URL('../supabase/migrations/20260801000290_cartera060_relationship_growth_helpers.sql', import.meta.url);
const readPath = new URL('../supabase/migrations/20260801000291_cartera060_relationship_growth_read.sql', import.meta.url);

test('060A SQL defines deterministic sanitized candidate identity', async () => {
    const sql = await readFile(helperPath, 'utf8');
    assert.match(sql, /forge_cartera060_candidate_reference/);
    assert.match(sql, /forge_cartera030b_digest/);
    assert.match(sql, /CARTERA060_GROWTH/);
    assert.doesNotMatch(sql, /create table|insert into public\./i);
});

test('060B/060C SQL exposes four evidence-backed review classes and blocks automation', async () => {
    const sql = await readFile(readPath, 'utf8');
    for (const marker of ['SECOND_POLICY_REVIEW', 'PROTECTION_REVIEW', 'REFERRAL_RELATIONSHIP', 'CENTER_OF_INFLUENCE']) {
        assert.match(sql, new RegExp(marker));
    }
    assert.match(sql, /m\.value_code = 'WILLING_TO_INTRODUCE'/);
    assert.match(sql, /m\.source_authority = 'CLIENT_CONFIRMED'/);
    assert.match(sql, /m\.consent_state = 'CONFIRMED'/);
    assert.match(sql, /'lifeContextUsed', false/);
    assert.match(sql, /'opportunityCreated', false/);
    assert.match(sql, /p\.advisor_id = advisor/);
    assert.doesNotMatch(sql, /memory_kind = 'LIFE_CONTEXT'/);
    assert.doesNotMatch(sql, /insert into public\.|update public\.|delete from public\./i);
});
