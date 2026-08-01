import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const path = new URL('../supabase/migrations/20260801000271_cartera040_relationship_brief_read.sql', import.meta.url);

test('040B read model composes memory, timeline, policy, payment and network authorities', async () => {
    const sql = await readFile(path, 'utf8');
    for (const token of [
        'commercial_source_identity_links',
        'prospect_timeline_events',
        'policy_roles',
        'canonical_policies',
        'policy_versions',
        'cartera030c_confirmed_payment_events',
        'commercial_account_memberships',
        'cartera040_relationship_memory_entries',
    ]) {
        assert.match(sql, new RegExp(token, 'i'));
    }
    assert.match(sql, /role_type <> 'BENEFICIARY'/i);
    assert.match(sql, /automaticOpportunityCreation', false/i);
    assert.match(sql, /automaticContactExecution', false/i);
    assert.match(sql, /finalMessageGeneration', false/i);
    assert.match(sql, /rawEvidenceExposed', false/i);
    assert.doesNotMatch(sql, /evidence_references'\s*,/i);
});
