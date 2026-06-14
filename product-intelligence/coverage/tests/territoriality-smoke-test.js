import { analyzeTerritoriality } from '../medical-events/territoriality-intelligence-engine.js';

const results = [];
function test(name, fn) { try { fn(); results.push({ name, status: 'PASS' }); } catch (error) { results.push({ name, status: 'FAIL', error: error.message }); } }
function assert(condition, message) { if (!condition) throw new Error(message); }

const domestic = analyzeTerritoriality({ eventLocation: 'Mexico', treatmentLocation: 'Mexico', policyFacts: { territoriality: 'NACIONAL' } });
const foreign = analyzeTerritoriality({ eventLocation: 'Spain abroad', treatmentLocation: 'Spain', policyFacts: { territoriality: 'NACIONAL' } });

test('Domestic context ready', () => { assert(domestic.status === 'TERRITORIALITY_CONTEXT_READY', 'Domestic status mismatch.'); });
test('Foreign routes to human review', () => { assert(foreign.status === 'HUMAN_REVIEW_REQUIRED', 'Foreign status mismatch.'); });
test('No territoriality coverage decision', () => { assert(!Object.hasOwn(foreign, 'coverageDecision'), 'Must not include coverageDecision.'); });

console.log('\nFORGE GMM TERRITORIALITY SMOKE TEST v0.1\n');
for (const result of results) { console.log(`${result.status} ${result.name}`); if (result.error) console.log(`   ${result.error}`); }
console.log(JSON.stringify({ domestic, foreign }, null, 2));
const failed = results.filter((result) => result.status === 'FAIL');
console.log(`\nSummary:\nTotal: ${results.length}\nPass: ${results.length - failed.length}\nFail: ${failed.length}`);
if (failed.length > 0) process.exit(1);
