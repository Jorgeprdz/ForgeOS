import { analyzeCatastrophicIllness } from '../medical-events/catastrophic-illness-engine.js';

const results = [];
function test(name, fn) { try { fn(); results.push({ name, status: 'PASS' }); } catch (error) { results.push({ name, status: 'FAIL', error: error.message }); } }
function assert(condition, message) { if (!condition) throw new Error(message); }

const cancer = analyzeCatastrophicIllness({
  event: 'Cancer diagnosis',
  policyFacts: { product: 'Alfa Medical', policyStatus: 'ACTIVE', diagnosis: 'Cancer', diagnosisDate: '2026-06-05', medicalReport: 'Oncology report' }
});

test('Cancer routes to human review', () => { assert(cancer.status === 'HUMAN_REVIEW_REQUIRED', 'Cancer status mismatch.'); });
test('Required evidence present', () => { assert(cancer.missingEvidence.length === 0, 'Missing evidence mismatch.'); });
test('No final answer generated', () => { assert(!Object.hasOwn(cancer, 'covered'), 'Must not include covered.'); });

console.log('\nFORGE GMM CATASTROPHIC ILLNESS SMOKE TEST v0.1\n');
for (const result of results) { console.log(`${result.status} ${result.name}`); if (result.error) console.log(`   ${result.error}`); }
console.log(JSON.stringify(cancer, null, 2));
const failed = results.filter((result) => result.status === 'FAIL');
console.log(`\nSummary:\nTotal: ${results.length}\nPass: ${results.length - failed.length}\nFail: ${failed.length}`);
if (failed.length > 0) process.exit(1);
