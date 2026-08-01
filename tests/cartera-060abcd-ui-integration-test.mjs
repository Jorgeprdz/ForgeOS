import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('060D is mounted after 050D and before canonical Cartera events', async () => {
    const app = await readFile(new URL('../app.js', import.meta.url), 'utf8');
    const binder = app.match(/function bindCarteraProductEvents\(\) \{([\s\S]*?)\n\}/)?.[1] || '';
    assert.match(app, /bindCartera060RelationshipGrowth/);
    assert.ok(binder.indexOf('bindCartera050FutureRadar') < binder.indexOf('bindCartera060RelationshipGrowth'));
    assert.ok(binder.indexOf('bindCartera060RelationshipGrowth') < binder.indexOf('bindCarteraEvents'));
});

test('060D product code keeps automatic external effects absent', async () => {
    const source = await readFile(new URL('../advisor-os/cartera/cartera-060d-relationship-growth-enhancement.js', import.meta.url), 'utf8');
    assert.match(source, /opportunityCreated:\s*false/);
    assert.match(source, /automaticContact:\s*false/);
    assert.match(source, /referralRequested:\s*false/);
    assert.doesNotMatch(source, /window\.open|location\.href|createOpportunity|sendMessage/);
});
