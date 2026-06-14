import { routeHumanReview } from '../medical-events/human-review-routing-engine.js';

const results = [];
function test(name, fn) { try { fn(); results.push({ name, status: 'PASS' }); } catch (error) { results.push({ name, status: 'FAIL', error: error.message }); } }
function assert(condition, message) { if (!condition) throw new Error(message); }

const route = routeHumanReview({
  eventAnalysis: { status: 'HUMAN_REVIEW_REQUIRED', missingEvidence: [] },
  policyFacts: { preexistingConcern: true, highSpecialtyTreatment: true },
  evidence: { sourceConflict: true }
});

test('Review required detected', () => { assert(route.reviewRequired === true, 'Review required mismatch.'); });
test('Reasons generated', () => { assert(route.reasons.length >= 3, 'Reasons missing.'); });
test('Required documents generated', () => { assert(route.requiredDocuments.length > 0, 'Documents missing.'); });

console.log('\nFORGE GMM HUMAN REVIEW ROUTING SMOKE TEST v0.1\n');
for (const result of results) { console.log(`${result.status} ${result.name}`); if (result.error) console.log(`   ${result.error}`); }
console.log(JSON.stringify(route, null, 2));
const failed = results.filter((result) => result.status === 'FAIL');
console.log(`\nSummary:\nTotal: ${results.length}\nPass: ${results.length - failed.length}\nFail: ${failed.length}`);
if (failed.length > 0) process.exit(1);
