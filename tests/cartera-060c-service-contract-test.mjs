import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('060C reads one governed RPC and exposes review preparation without writes', async () => {
    const source = await readFile(new URL('../advisor-os/cartera/cartera-060c-relationship-growth-service.js', import.meta.url), 'utf8');
    assert.match(source, /forge_cartera060_list_relationship_growth_reviews/);
    assert.match(source, /prepareCartera060PipelineReview/);
    assert.doesNotMatch(source, /\.insert\(|\.update\(|createOpportunity|sendMessage|window\.open/);
});
