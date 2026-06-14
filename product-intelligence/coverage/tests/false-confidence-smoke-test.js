import { applyFalseConfidenceProtection } from '../medical-events/false-confidence-protection-engine.js';

const results = [];
function test(name, fn) { try { fn(); results.push({ name, status: 'PASS' }); } catch (error) { results.push({ name, status: 'FAIL', error: error.message }); } }
function assert(condition, message) { if (!condition) throw new Error(message); }

const car = applyFalseConfidenceProtection({
  evaluationStatus: 'LIKELY_COVERED',
  eventLabels: ['ACCIDENT'],
  policyFacts: { accidentDescription: 'Car crash' },
  confidence: 'HIGH'
});

const unknown = applyFalseConfidenceProtection({
  evaluationStatus: 'LIKELY_COVERED',
  eventLabels: ['UNKNOWN_CONTEXT'],
  policyFacts: {},
  confidence: 'LOW'
});

test('Car accident likely covered blocked without confidence evidence', () => {
  assert(car.evaluationStatus === 'INSUFFICIENT_EVIDENCE', 'Car protection mismatch.');
  assert(car.blockedLikelyCovered === true, 'Block flag mismatch.');
});
test('Unknown lowers confidence', () => {
  assert(unknown.confidence === 'LOW', 'Unknown confidence mismatch.');
});

console.log('\nFORGE GMM FALSE CONFIDENCE SMOKE TEST v0.1\n');
for (const result of results) { console.log(`${result.status} ${result.name}`); if (result.error) console.log(`   ${result.error}`); }
console.log(JSON.stringify({ car, unknown }, null, 2));
const failed = results.filter((result) => result.status === 'FAIL');
console.log(`\nSummary:\nTotal: ${results.length}\nPass: ${results.length - failed.length}\nFail: ${failed.length}`);
if (failed.length > 0) process.exit(1);
