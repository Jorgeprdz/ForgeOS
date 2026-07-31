import test from 'node:test';
import assert from 'node:assert/strict';

import {
    createCanonicalDirectoryProjection,
} from '../platform/policy-intelligence/cartera-010d-unified-directory-read-model.js';

const AS_OF = '2026-07-31T17:00:00.000Z';

test('restricted Person and Account records never enter the general directory', () => {
    const marker = 'SENSITIVE_DIRECTORY_MARKER';
    const directory = createCanonicalDirectoryProjection({
        people: [{
            id: '10000000-0000-0000-0000-000000000099',
            person_reference: 'PERSON:RESTRICTED:099',
            display_name: marker,
            preferred_name: null,
            verified_phone: '+525500000099',
            verified_email: 'restricted@example.com',
            lifecycle_state: 'CONFIRMED',
            privacy_classification: 'RESTRICTED',
            archived_at: null,
        }],
        accounts: [{
            id: '20000000-0000-0000-0000-000000000099',
            account_reference: 'ACCOUNT:RESTRICTED:099',
            account_type: 'HOUSEHOLD',
            display_label: marker,
            lifecycle_state: 'CONFIRMED',
            privacy_classification: 'RESTRICTED',
            archived_at: null,
        }],
        memberships: [],
        policies: [],
        rolesByPolicyReference: new Map(),
        asOf: AS_OF,
    });

    assert.deepEqual(directory.counts, {
        people: 0,
        accounts: 0,
        policies: 0,
        total: 0,
    });
    assert.equal(JSON.stringify(directory.entries).includes(marker), false);
    assert.equal(directory.search(marker).length, 0);
    assert.equal(directory.search('restricted@example.com').length, 0);
    assert.equal(directory.search('5500000099').length, 0);
});
