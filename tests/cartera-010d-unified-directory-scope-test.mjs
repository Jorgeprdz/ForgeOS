import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('010D is pinned to the accepted 010B plus 010C stack', async () => {
    const scope = await read(
        'docs/architecture/source-truth/FORGE_CARTERA_010D_UNIFIED_DIRECTORY_RELATIONSHIP_SEARCH_SCOPE_001.md'
    );

    assert.match(scope, /SOURCE_COMMIT=f7aaf82586d051b94dc6f526c603f02c83f15a66/);
    assert.match(scope, /PHASE=CARTERA_010D_UNIFIED_DIRECTORY_RELATIONSHIP_SEARCH/);
    assert.match(scope, /SCHEMA_MUTATION=NO/);
    assert.match(scope, /SUPABASE_REMOTE_MUTATION=NO/);
    assert.match(scope, /PRODUCT_UI_REDESIGN=NO/);
});

test('scope requires separate canonical entry kinds and relationship-aware search', async () => {
    const scope = await read(
        'docs/architecture/source-truth/FORGE_CARTERA_010D_UNIFIED_DIRECTORY_RELATIONSHIP_SEARCH_SCOPE_001.md'
    );

    assert.match(scope, /COMMERCIAL_PERSON/);
    assert.match(scope, /COMMERCIAL_ACCOUNT/);
    assert.match(scope, /POLICY/);
    assert.match(scope, /verified phone and verified email/i);
    assert.match(scope, /account relationship role/i);
    assert.match(scope, /policy number and policy reference/i);
    assert.match(scope, /carrier reference/);
    assert.match(scope, /product reference/);
});

test('phone and email matching is explicitly non-rendering', async () => {
    const scope = await read(
        'docs/architecture/source-truth/FORGE_CARTERA_010D_UNIFIED_DIRECTORY_RELATIONSHIP_SEARCH_SCOPE_001.md'
    );
    const model = await read(
        'platform/policy-intelligence/cartera-010d-unified-directory-read-model.js'
    );

    assert.match(scope, /PHONE_SEARCHABLE=YES_OWNER_SCOPE/);
    assert.match(scope, /EMAIL_SEARCHABLE=YES_OWNER_SCOPE/);
    assert.match(scope, /PHONE_RENDERED=NO/);
    assert.match(scope, /EMAIL_RENDERED=NO/);
    assert.match(model, /VERIFIED_PHONE/);
    assert.match(model, /VERIFIED_EMAIL/);
    assert.doesNotMatch(model, /verifiedPhone\s*:/);
    assert.doesNotMatch(model, /verifiedEmail\s*:/);
});

test('010D source remains read-only and direct PolicyRole reads stay forbidden', async () => {
    const service = await read('advisor-os/cartera/canonical-directory-service.js');
    const scope = await read(
        'docs/architecture/source-truth/FORGE_CARTERA_010D_UNIFIED_DIRECTORY_RELATIONSHIP_SEARCH_SCOPE_001.md'
    );

    assert.match(service, /forge_cartera010b_list_general_policy_roles/);
    assert.match(service, /commercial_account_memberships/);
    assert.doesNotMatch(service, /from\('policy_roles'\)/);
    assert.doesNotMatch(service, /\.insert\(/);
    assert.doesNotMatch(service, /\.update\(/);
    assert.doesNotMatch(service, /\.delete\(/);
    assert.doesNotMatch(service, /\.upsert\(/);
    assert.match(scope, /DIRECT_POLICY_ROLE_READ=FORBIDDEN/);
    assert.match(scope, /Portfolio Intake \/ Point 2/);
    assert.match(scope, /payment obligations and renewals/);
});
