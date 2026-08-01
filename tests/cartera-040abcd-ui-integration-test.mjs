import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('040D is bound before the canonical Cartera route emits mounted events', async () => {
    const app = await readFile(new URL('../app.js', import.meta.url), 'utf8');
    assert.match(app, /bindCartera040RelationshipMemory/);
    const binder = app.match(/function bindCarteraProductEvents\(\) \{([\s\S]*?)\n\}/)?.[1] || '';
    assert.ok(binder.indexOf('bindCartera040RelationshipMemory') < binder.indexOf('bindCarteraEvents'));
});

test('040D enhances person cards only and keeps contact/opportunity execution absent', async () => {
    const source = await readFile(new URL('../advisor-os/cartera/cartera-040d-relationship-memory-enhancement.js', import.meta.url), 'utf8');
    assert.match(source, /data-directory-kind="COMMERCIAL_PERSON"/);
    assert.match(source, /data-relationship-open/);
    assert.match(source, /automaticContact:\s*false/);
    assert.match(source, /automaticOpportunity:\s*false/);
    assert.doesNotMatch(source, /window\.open|location\.href|createOpportunity|sendMessage/);
});
